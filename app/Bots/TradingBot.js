const Strategy = use("App/Models/Strategy");
const Trade = use("App/Models/Trade");
const BinanceBot = use("App/Bots/BinanceBot");
const Subscription = use("App/Models/Subscription");
const User = use("App/Models/User");
const moment = require("moment");

class TradingBot {
  constructor(data) {
    this.userId = data.userId; //number
    this.BTC = data.strat_btc; //number
    this.ETH = data.strat_eth; //number
    this.USDT = data.strat_usdt; //number
    this.NapoleonPosition = data.NapoleonPosition; //object
    this.strategyId = data.strategyId; //number
    this.strategyPosition = data.strategyPosition; //object
    this.ExchangeData = data.ExchangeData; //object
    this.strategy; //model instance
    this.trade; //model instance
    this.binanceBot; //BinanceBot instance

    this.startLogic();
  }

  async startLogic() {
    //instanciate useful models or classes
    this.strategy = await Strategy.find(this.strategyId);
    this.trade = new Trade();

    this.binanceBot = new BinanceBot(this.ExchangeData, {
      BTC: this.BTC,
      ETH: this.ETH,
      USDT: this.USDT,
    });

    //calculate difference between old and new position
    await this.compareNewPositionWithOldPosition();

    //some calcul to the amount and number of tradings then trigger order trading
    this.tradingOrderForLongOnly();
  }

  async compareNewPositionWithOldPosition() {
    const calculatedPosition = {
      BTC: this.NapoleonPosition.BTC - this.strategyPosition.BTC,
      ETH: this.NapoleonPosition.ETH - this.strategyPosition.ETH,
      USDT: this.NapoleonPosition.USDT - this.strategyPosition.USDT,
    };
    this.calculatedPosition = calculatedPosition;
  }

  async tradingOrderForLongOnly() {
    // this function determines the trade between currencies with the least possible exchange
    try {
      let currenciesLoss = [];
      let currenciesWin = [];
      //separate currency that wins in position size and those that lose
      for (const currency in this.calculatedPosition) {
        if (this.calculatedPosition[currency] > 0) {
          currenciesWin.push(currency);
        }
        if (this.calculatedPosition[currency] < 0) {
          currenciesLoss.push(currency);
        }
      }

      //if no currencies win or lose, no action executed, the date is updated
      if (!currenciesWin.length) {
        this.strategy.updated_at = Date.now();
        await this.strategy.save();
        return;
      }

      // iterate through currenciesLoss and currenciesWin to pass all orders
      currenciesWin.forEach((currencyWin) => {
        currenciesLoss.forEach(async (currencyLoss) => {
          try {
            const orderData = await this.binanceBot.fireSpotTrade(
              currencyWin,
              currencyLoss,
              Math.abs(this.calculatedPosition[currenciesLoss]) / this.strategyPosition[currenciesLoss]
            );
            this.saveNewData(orderData);
          } catch (error) {
            console.log(error);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  async saveNewData(orderData) {
    //Part responsible of save each trade made in "trades" database
    this.trade.pair = orderData.symbol;
    this.trade.action = orderData.side;
    this.trade.amount = orderData.executedQty;
    this.trade.strategy_id = this.strategyId;

    await this.trade.save();
    //

    //Part responsible of save amount of each currency in "strategies" database
    const basePartOfPair = orderData.symbol.substring(0, 3);
    const secondPartOfPair = orderData.symbol.substring(3);
    const side = orderData.side;

    this.strategy.updated_at = Date.now();
    this.strategy.position = JSON.stringify(this.NapoleonPosition);

    //add or remove currency from original amount depending on the buying side and base currency
    let baseCurrencyAmount;
    let secondCurrencyAmount;
    if (side === "BUY") {
      baseCurrencyAmount = this[basePartOfPair] + Number(orderData.executedQty);
      secondCurrencyAmount =
        this[secondPartOfPair] - Number(orderData.cummulativeQuoteQty);
    }
    if (side === "SELL") {
      baseCurrencyAmount = this[basePartOfPair] - Number(orderData.executedQty);
      secondCurrencyAmount =
        this[secondPartOfPair] + Number(orderData.cummulativeQuoteQty);
    }

    this.strategy[basePartOfPair] = this.formatNumber(baseCurrencyAmount);
    this.strategy[secondPartOfPair] = this.formatNumber(secondCurrencyAmount);

    await this.strategy.save();
  }

  //trunc number if length after dot exceed 15
  formatNumber(number) {
    const splitedNumber = String(number).split(".");
    splitedNumber[1] = splitedNumber[1].substring(0, 15);
    return Number(splitedNumber.join("."));
  }

  static async deactivateStrategy() {
    //verify users subscription validity plus 3 days to prevent user
    //if a validity expiry, we deactivate his strategies
    let subscriptions = await Subscription.all();
    subscriptions = subscriptions.toJSON();
    const subscriptionsExpiry = subscriptions.filter((subscription) => {
      return moment().isSame(
        moment(subscription.date_end_subscription).add(3, "days"),
        "day"
      );
    });

    subscriptionsExpiry.forEach(async (subscription) => {
      const user = await User.find(subscription.user_id);
      await user.strategies().update({
        active: false,
        btc: 0,
        eth: 0,
        usdt: 0,
        position: JSON.stringify({ BTC: 0, ETH: 0, USDT: 1 }),
      });
    });
  }

}

module.exports = TradingBot;
