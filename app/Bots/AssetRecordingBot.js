const Asset = use("App/Models/Asset");
const BinanceBot = use("App/Bots/BinanceBot");

class AssetRecordingBot {
  constructor(data) {
    this.strategyId = data.strategyId;
    this.BTC = data.BTC;
    this.ETH = data.ETH;
    this.USDT = data.USDT;
    this.ExchangeData = data.ExchangeData;
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
      this.binanceBot = new BinanceBot(this.ExchangeData, {
        BTC: this.BTC,
        ETH: this.ETH,
        USDT: this.USDT,
      });

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
    const date = new Date(Date.now()).toISOString();
    const newData = {
      date: date,
      BTC: totalBTC,
      ETH: totalETH,
      USDT: totalUSDT,
    };

    amountByDate.push(newData);
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
