const Strategy = use("App/Models/Strategy");
const Trade = use("App/Models/Trade");
const BinanceBot = use("App/Bots/BinanceBot");
const Subscription = use("App/Models/Subscription");
const User = use("App/Models/User");
const moment = require("moment");
const Big = require("big.js")

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
    this.binanceBot; //BinanceBot instance
  }

  async startLogic() {
    await this.instantUsefulClass();

    //calculate difference between old and new position
    await this.compareNewPositionWithOldPosition();

    //some calcul to the amount and number of tradings then trigger order trading
    const allOrder = await this.tradingOrderForLongOnly();

    //save data relating to trades and strategies
    for(const order of allOrder) {
      await this.saveNewData(order)
    }
    
  }

  async instantUsefulClass() {
    //instanciate useful models or classes
    this.strategy = await Strategy.find(this.strategyId);
    this.binanceBot = new BinanceBot(this.ExchangeData, {
      BTC: this.BTC,
      ETH: this.ETH,
      USDT: this.USDT,
    });
  }

  compareNewPositionWithOldPosition() {
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
      const promisesOfAllOrder = [];
      currenciesWin.forEach((currencyWin) => {
        currenciesLoss.forEach((currencyLoss) => {
          //calcul the percent of the order
          //1-compare the arrays for determine the number of trades necessary, equal to the longest array
          const nbOfTrades =
            currenciesWin.length > currenciesLoss.length
              ? currenciesWin.length
              : currenciesLoss.length;

          //2-the absolute value of percent losses for the currency that loss in value
          const percentLoss = Math.abs(this.calculatedPosition[currencyLoss]);

          //3-the old percent that the actual currency that loss had
          const oldPercent = this.strategyPosition[currencyLoss];

          //4-the calcul that determine the percent
          const percent = percentLoss / nbOfTrades / oldPercent;

          try {
            const order = this.binanceBot.fireSpotTrade(
              currencyWin,
              currencyLoss,
              percent
            );
            promisesOfAllOrder.push(order);
          } catch (error) {
            console.log(error);
          }
        });
      });

      const allOrder = await Promise.all(promisesOfAllOrder);
      return allOrder;
    } catch (error) {
      console.log(error);
    }
  }

  async saveNewData(orderData) {
    //Part responsible of save each trade made in "trades" database
    const trade = new Trade()
    trade.pair = orderData.symbol;
    trade.action = orderData.side;
    trade.amount = orderData.executedQty;
    trade.strategy_id = this.strategyId;

    await trade.save();
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
      baseCurrencyAmount = new Big(this[basePartOfPair]).plus(Number(orderData.executedQty)).toNumber();
      secondCurrencyAmount =
        new Big(this[secondPartOfPair]).minus(Number(orderData.cummulativeQuoteQty)).toNumber();
    }
    if (side === "SELL") {
      baseCurrencyAmount = new Big(this[basePartOfPair]).minus(Number(orderData.executedQty)).toNumber();
      secondCurrencyAmount =
      new Big(this[secondPartOfPair]).plus(Number(orderData.cummulativeQuoteQty)).toNumber();
    }

    this. strategy[basePartOfPair] = this.formatNumber(baseCurrencyAmount);
    this.strategy[secondPartOfPair] = this.formatNumber(secondCurrencyAmount);

    await this.strategy.save();
  }

  //trunc number if length after dot exceed 15
  formatNumber(number) {
    const splitedNumber = String(number).split(".");
    splitedNumber[1] = splitedNumber[1].substring(0, 7);
    return Number(splitedNumber.join("."));
  }

  static async deactivateStrategy() {
    //verify users subscription validity plus 3 days to prevent user
    //if a validity expiry, we deactivate his strategies
    let subscriptions = await Subscription.all();
    subscriptions = subscriptions.toJSON();
    const subscriptionsExpiry = subscriptions.filter((subscription) => {
      return moment().add(4, "days").isAfter(
        moment(subscription.date_end_subscription),
        "day"
      );
    });

    await Promise.all(subscriptionsExpiry.map(async (subscription) => {
      const user = await User.find(subscription.user_id);
      await user.strategies().update({
        active: false,
        btc: 0,
        eth: 0,
        usdt: 0,
        position: JSON.stringify({ BTC: 0, ETH: 0, USDT: 1 }),
      });
    }));
  }
}

module.exports = TradingBot;
