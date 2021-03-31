const axios = require("axios").default;
const crypto = require("crypto");
const BinanceKeyException = use("App/Exceptions/BinanceKeyException");
const Env = use('Env')
const Big = require('big.js')

class BinanceBot {
  minimumTradeAmount = {
    ETHBTC: {
      ETH: 0.001,
      BTC: 0.000001,
    },
    ETHUSDT: {
      ETH: 0.00001,
      USDT: 0.01,
    },
    BTCUSDT: {
      BTC: 0.000001,
      USDT: 0.01,
    },
  };

  constructor(binance, currencies) {
    this.publicKey = binance.public_key;
    this.privateKey = binance.private_key;
    if (currencies) {
      this.BTC = currencies.BTC;
      this.ETH = currencies.ETH;
      this.USDT = currencies.USDT;
    }

    axios.defaults.headers.common["X-MBX-APIKEY"] = this.publicKey;
    axios.defaults.headers.common["Content-Type"] =
      "application/x-www-form-urlencoded";
  }

  determineTypeOfQuantity(pair, currencyLoss) {
    const baseCurrency = pair.substring(0, 3);
    return baseCurrency === currencyLoss ? "quantity" : "quoteOrderQty";
  }

  //return the the right side according the currency that loss in value and currency that win
  side(currencyWin, currencyLoss) {
    let side;
    if (currencyWin === "ETH") {
      side = "BUY";
    } else if (currencyLoss === "ETH") {
      side = "SELL";
    } else if (currencyWin === "BTC") side = "BUY";
    else side = "SELL";
    return side;
  }

  //create the right pair that binance recognize from two currency
  pair(firstCurrency, secondCurrency) {
    let pair = "BTCUSDT";
    if (firstCurrency === "ETH") {
      pair = firstCurrency + secondCurrency;
    } else if (secondCurrency === "ETH") {
      pair = secondCurrency + firstCurrency;
    }
    return pair;
  }

  formatQuantity(qty, pair, currencyLoss) {
    const lengthMaxAfterDot = String(this.minimumTradeAmount[pair][currencyLoss])
      .split('.')[1]
      .length;
    const qtyBeforeDot = String(qty).split('.')[0];
    const qtyAfterDot = String(qty).split('.')[1].substring(0, lengthMaxAfterDot);
    return Number(qtyBeforeDot.concat('.', qtyAfterDot));
  }

  async fireSpotTrade(currencyWin, currencyLoss, percent) {
    console.log(currencyWin, currencyLoss, percent);
    try {
      //format all data to create correct url endpoint
      const side = this.side(currencyWin, currencyLoss);
      const pair = this.pair(currencyWin, currencyLoss);

      //depending on whether the quantity is determined according to the base currency, the typ can vary between "quantity" or "quoteOrderQty"
      const typeOfQuantity = this.determineTypeOfQuantity(pair, currencyLoss);
      //

      const quantity = this[currencyLoss] * percent;

      // the number behind the decimal point cannot exceed a certain size according to the even
      const quantityFormated = this.formatQuantity(
        quantity,
        pair,
        currencyLoss
      );
      //

      const timestamp = Date.now();

      const baseURL = Env.get('NODE_ENV') === 'test' ? `https://testnet.binance.vision/api/v3/order` : `https://api.binance.com/api/v3/order`;
      const message = `symbol=${pair}&side=${side}&type=MARKET&${typeOfQuantity}=${quantityFormated}&newOrderRespType=FULL&recvWindow=10000&timestamp=${timestamp}`;
      //crypt url parameters to send to the exchange
      const hmac = crypto.createHmac('sha256', this.privateKey);
      hmac.update(message);
      const queryURL = `${baseURL}?${message}&signature=${hmac.digest("hex")}`;

      const order = await axios.post(queryURL);
     return order.data;
    } catch (error) {
      console.log('path', error.response.request.path)
      console.log('data', error.response.data)
      throw new Error(
        "Error at request trade to Binance.\nCheck your API authorization levels (to Binance in parameter, section security , settings, API Management and tick Enable Trading.)\n\n" +
          error
      );
    }
  }

  //valide for only 3 currency 'BTC, ETH, USDT'
  async convert(original, toConvert) {
    //determine pair to create correct url endpoint
    const pair = this.pair(original, toConvert);

    //determine in what unit Binance API will respond
    const unit = original === pair.substring(0, 3) ? toConvert : original;

    //get average price of original asset
    const binanceUrlEndpoint = Env.get('NODE_ENV') === 'test' ? `https://testnet.binance.vision/api/v3/avgPrice?symbol=${pair}` : `https://api.binance.com/api/v3/avgPrice?symbol=${pair}`
    const result = await axios.get(binanceUrlEndpoint);
    const avgPrice = Number(result.data.price);

    if (original !== unit) {
      return new Big(this[original] * avgPrice).round(7, 1).toNumber();
    } else {
      Big.RM = 1
      return new Big(this[original]).div(avgPrice).round(7, 1).toNumber();
    }
  }

  async getWalletBalance(currency) {
    const timestamp = Date.now();
    const baseURL = `https://api.binance.com/sapi/v1/capital/config/getall`;
    const message = `timestamp=${timestamp}`;
    const hmac = crypto.createHmac("sha256", this.privateKey);
    hmac.update(message);
    const queryURL = `${baseURL}?${message}&signature=${hmac.digest("hex")}`;

    try {
      const response = await axios.get(queryURL);
      const [currencyData] = response.data.filter(
        (obj) => obj.coin === currency.toUpperCase()
      );
      return currencyData.free;
    } catch (error) {
      throw new BinanceKeyException();
    }
  }

  async test() {
    const timestamp = Date.now();
    const baseURL = Env.get('NODE_ENV') === 'test' ? 'https://testnet.binance.vision/api/v3/order/test' : `https://api.binance.com/api/v3/order/test`;
    const message = `symbol=BTCUSDT&side=SELL&type=MARKET&quantity=0.01&newClientOrderId=my_order_id_1&timestamp=${timestamp}`;
    const hmac = crypto.createHmac("sha256", this.privateKey);
    hmac.update(message);
    const queryURL = `${baseURL}?${message}&signature=${hmac.digest("hex")}`;

    try {
      const test = await axios.post(queryURL);
      if (test.data) return true;
    } catch (error) {
      console.log(error)
      return false;
    }
  }
}

module.exports = BinanceBot;
