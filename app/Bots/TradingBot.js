const Strategy = use("App/Models/Strategy");
const Trade = use("App/Models/Trade");
const BinanceBot = use("App/Bots/BinanceBot");
const Subscription = use("App/Models/Subscription");
const User = use("App/Models/User");
const moment = require("moment");
const Big = require("big.js");
const Env = use("Env");

class TradingBot {
  constructor(data) {
    this.userId = data.userId; //number
    this.newPositions = data.newPositions; //object
    this.strategyId = data.strategyId; //number
    this.ExchangeData = data.ExchangeData; //object
    this.strategy; //model instance
    this.binanceBot; //BinanceBot instance
    this.strategyPosition; //object
    this.BTC; //number
    this.ETH; //number
    this.USDT; //number
  }

  async startLogic() {
    await this.instantUsefulClass();

    //calculate difference between old and new position
    await this.compareNewPositionWithOldPosition();

    //some calcul to the amount and number of tradings then trigger order trading
    const allOrder = await this.tradingOrderForLongOnly();

    //save data relating to trades and strategies
    if (allOrder) {
      for (const order of allOrder) {
        await this.saveNewData(order);
      }
    }

  }

  async instantUsefulClass() {
    //instanciate useful models or classes
    this.strategy = await Strategy.find(this.strategyId);
    this.BTC = this.strategy.btc;
    this.ETH = this.strategy.eth;
    this.USDT = this.strategy.usdt;
    if (Env.get("NODE_ENV") !== "test" || !this.strategyPosition)
      this.strategyPosition = JSON.parse(this.strategy.position);

    this.binanceBot = new BinanceBot(this.ExchangeData, {
      BTC: this.BTC,
      ETH: this.ETH,
      USDT: this.USDT,
    });
  }

  compareNewPositionWithOldPosition() {
    const calculatedPosition = {
      BTC: this.newPositions.BTC - this.strategyPosition.BTC,
      ETH: this.newPositions.ETH - this.strategyPosition.ETH,
      USDT: this.newPositions.USDT - this.strategyPosition.USDT,
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
    const trade = new Trade();
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
    this.strategy.position = JSON.stringify(this.newPositions);

    //add or remove currency from original amount depending on the buying side and base currency
    let baseCurrencyAmount;
    let secondCurrencyAmount;
    if (side === "BUY") {
      baseCurrencyAmount = new Big(this[basePartOfPair])
        .plus(Number(orderData.executedQty))
        .toNumber();
      secondCurrencyAmount = new Big(this[secondPartOfPair])
        .minus(Number(orderData.cummulativeQuoteQty))
        .toNumber();
    }
    if (side === "SELL") {
      baseCurrencyAmount = new Big(this[basePartOfPair])
        .minus(Number(orderData.executedQty))
        .toNumber();
      secondCurrencyAmount = new Big(this[secondPartOfPair])
        .plus(Number(orderData.cummulativeQuoteQty))
        .toNumber();
    }

    this.strategy[basePartOfPair] = this.formatNumber(baseCurrencyAmount);
    this.strategy[secondPartOfPair] = this.formatNumber(secondCurrencyAmount);

    await this.strategy.save();
  }

  //trunc number if length after dot exceed 15
  formatNumber(number) {
    return Big(number).round(7, 0).toNumber();
  }

  static async deactivateStrategy() {
    //verify users subscription validity plus 3 days to prevent user
    //if a validity expiry, we deactivate his strategies
    let subscriptions = await Subscription.all();
    subscriptions = subscriptions.toJSON();
    const subscriptionsExpiry = subscriptions.filter((subscription) => {
      return moment()
        .add(4, "days")
        .isAfter(moment(subscription.date_end_subscription), "day");
    });

    await Promise.all(
      subscriptionsExpiry.map(async (subscription) => {
        const user = await User.find(subscription.user_id);
        let exchanges = await user
          .exchanges()
          .where("validate", true)
          .with("strategies", (builder) => {
            builder.where("active", true);
          })
          .fetch();

        exchanges = exchanges.toJSON();

        await Promise.all(
          exchanges.map(async (exchange) => {
            const userParsed = user.toJSON();
            for (const strategy of exchange.strategies) {
              const tradingBot = new TradingBot({
                userId: userParsed.id,
                newPositions: { BTC: 0, ETH: 0, USDT: 1 },
                strategyId: strategy.id,
                ExchangeData: exchange,
              });
              await tradingBot.startLogic();
            }
          })
        );

        await user.strategies().update({
          active: false,
          btc: 0,
          eth: 0,
          usdt: 0,
          position: JSON.stringify({ BTC: 0, ETH: 0, USDT: 1 }),
        });
      })
    );
  }
}

module.exports = TradingBot;
