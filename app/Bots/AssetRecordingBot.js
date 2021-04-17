const Asset = use("App/Models/Asset");
const BinanceBot = use("App/Bots/BinanceBot");
const moment = require("moment");

class AssetRecordingBot {
  strategyId; //int
  BTC; //int
  ETH; //int
  USDT; //int
  ExchangeData; //object - exchanges model
  asset; //object - assets model
  isTodayLastUpdate = false; //boolean

  constructor(data) {
    this.strategyId = data.strategyId;
    this.BTC = data.BTC;
    this.ETH = data.ETH;
    this.USDT = data.USDT;
    this.ExchangeData = data.ExchangeData;
    if(this.ExchangeData?.name === 'binance') {
      this.binanceBot = new BinanceBot(this.ExchangeData, {
        BTC: this.BTC,
        ETH: this.ETH,
        USDT: this.USDT,
      });
    }
    if (data.isTodayLastUpdate) this.isTodayLastUpdate = true;
  }

  async startLogic() {
    try {
      //instanciate useful models or classes
      this.asset = await Asset.findOrCreate(
        { strategy_id: this.strategyId },
        {
          strategy_id: this.strategyId,
          amount_by_date: JSON.stringify([]),
        }
      );

      //calculate total amount of the strategy in each currency("USDT", "BTC", "ETH")
      const totalBTC = await this.convertAll("BTC");
      const totalETH = await this.convertAll("ETH");
      const totalUSDT = await this.convertAll("USDT");

      //format data to prepare backup in database
      const amountByDate = this.formatAmountByDateToJson(
        totalBTC,
        totalETH,
        totalUSDT
      );

      //if amountByDate is wrong(a falsy value) so data aren't save
      if (!amountByDate) return;

      this.save(amountByDate);
    } catch (error) {
      console.log(error);
    }
  }

  async convertAll(currency) {
    const convertInBTC =
      currency !== "BTC"
        ? await this.binanceBot.convert("BTC", currency)
        : this.BTC;
    const convertInETH =
      currency !== "ETH"
        ? await this.binanceBot.convert("ETH", currency)
        : this.ETH;
    const convertInUSDT =
      currency !== "USDT"
        ? await this.binanceBot.convert("USDT", currency)
        : this.USDT;
    return convertInBTC + convertInETH + convertInUSDT;
  }

  formatAmountByDateToJson(totalBTC, totalETH, totalUSDT) {
    let amountByDate = this.asset.amount_by_date;
    amountByDate = JSON.parse(amountByDate);

    //prepare datas to push
    const date = this.isTodayLastUpdate ? moment().toISOString() : moment().subtract(1, "days").toISOString();
    const newData = {
      date: date,
      BTC: totalBTC,
      ETH: totalETH,
      USDT: totalUSDT,
    };

    if (this.isTodayLastUpdate && moment().isSame(amountByDate[amountByDate.length - 1].date, 'day')) {
      amountByDate[amountByDate.length - 1] = newData;
    } else {
      amountByDate.push(newData);
    }
    return JSON.stringify(amountByDate);
  }

  async save(amountByDate) {
    try {
      this.asset.amount_by_date = amountByDate;
      this.asset.save();
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = AssetRecordingBot;
