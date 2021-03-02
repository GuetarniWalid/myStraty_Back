const User = use("App/Models/User");
const BinanceBot = use("App/Bots/BinanceBot");
const Strategy = use("App/Models/Strategy");

class Clean {
  userId;
  exchangeId;
  user;
  strategies;
  strategiesAmount = {};
  binanceAmount = {};
  currencyWithNotEnoughLiquidity = [];
  amountToSubstract = [];
  strategiesSorted = {};

  constructor(user) {
    this.userId = user.id;
  }

  async start() {
    try {
      this.user = await User.find(this.userId);
      await this.getActiveStrategies();
      await this.getTotalAmountOfStrategies();
      await this.getExchangeWalletAmount();
      const enouhtLiquidity = this.exchangeHasEnoughLiquidity();
  
      if (!enouhtLiquidity) {
        this.determineAmountToSubstract();
        await this.substractAmountByStrat();
      }
    }
    catch(e) {
      console.log(e)
      return
    }
  }

  async getActiveStrategies() {
    try {
      const strategies = await this.user
        .strategies()
        .where("active", true)
        .fetch();
  
      this.strategies = strategies.toJSON();
      this.exchangeId = this.strategies[0].exchange_id;
    }
    catch(e) {
      throw new Error('No strat active')
    }
  }

  async getTotalAmountOfStrategies() {
    let BTC = 0;
    let ETH = 0;
    let USDT = 0;

    this.strategies.forEach((strategy) => {
      BTC += strategy.btc;
      ETH += strategy.eth;
      USDT += strategy.usdt;
    });

    this.strategiesAmount = {
      BTC,
      ETH,
      USDT,
    };
  }

  async getExchangeWalletAmount() {
    let binance = await this.user.exchanges().where("name", "binance").fetch();
    binance = binance.toJSON()[0];

    const binanceBot = new BinanceBot(binance);
    [
      this.binanceAmount.BTC,
      this.binanceAmount.ETH,
      this.binanceAmount.USDT,
    ] = await Promise.all([
      binanceBot.getWalletBalance("btc"),
      binanceBot.getWalletBalance("eth"),
      binanceBot.getWalletBalance("usdt"),
    ]);
  }

  exchangeHasEnoughLiquidity() {
    let enouhtLiquidity = true;

    for (const currency in this.strategiesAmount) {
      if (this.strategiesAmount[currency] > this.binanceAmount[currency]) {
        this.currencyWithNotEnoughLiquidity.push({
          name: currency,
          surplus:
            this.strategiesAmount[currency] - this.binanceAmount[currency],
        });

        enouhtLiquidity = false;
      }
    }

    return enouhtLiquidity;
  }

  determineAmountToSubstract() {
    this.currencyWithNotEnoughLiquidity.forEach(async (currency) => {
      this.amountToSubstract.push({
        currency: currency.name,
        size: Number(((currency.surplus / this.strategies.length) + 0.00000001).toFixed(8)),
        nbStrat: this.strategies.length,
      });
    });
  }

  async substractAmountByStrat() {
    this.sortStratByCurrencyGrowing();

    for (const amount of this.amountToSubstract) {
      for (const strategy of this.strategiesSorted[amount.currency]) {
        const strategyDB = await Strategy.find(strategy.id);
        let remainingAmount =
          strategy[amount.currency.toLowerCase()] - amount.size;
        if (remainingAmount < 0) {
          amount.nbStrat -= 1;
          amount.size += Math.abs(remainingAmount) / amount.nbStrat;

          strategyDB[amount.currency.toLowerCase()] = 0;
        } else strategyDB[amount.currency.toLowerCase()] = remainingAmount;
        strategyDB.save();
      }
    }
  }

  sortStratByCurrencyGrowing() {
    // console.log(this.strategies)
    this.currencyWithNotEnoughLiquidity.forEach((currency) => {
      // console.log(currency)
      this.strategies.sort((previous, next) => {
        return (
          previous[currency.name.toLowerCase()] -
          next[currency.name.toLowerCase()]
        );
      });
      this.strategiesSorted[currency.name] = [...this.strategies];
    });
  }
}

module.exports = Clean;
