const User = use("App/Models/User");
const BinanceBot = use("App/Bots/BinanceBot");
const Strategy = use("App/Models/Strategy");
const Big = require("big.js");
const Env = use('Env')

class Clean {
  userId; //number
  exchangeId; //number
  user; //object
  strategies;
  strategiesAmount = {};
  binanceAmount = {};
  currencyWithNotEnoughLiquidity = [];
  strategiesSorted = {};
  amountToSubstract = [];

  constructor(user) {
    this.userId = user.id;
  }

  async start() {
    try {
      this.user = await User.find(this.userId);
      await this.getActiveStrategies();
      await this.getTotalAmountOfStrategies();
      try {
        await this.getExchangeWalletAmount();
      } catch(e) {
        if(Env.get('NODE_ENV') === 'test') this.binanceAmount = {
          BTC: 1.46,
          ETH: 13,
          USDT: 8.148456
        }
        else throw new Error(e.message)
      }
      const enouhtLiquidity = this.exchangeHasEnoughLiquidity();

      if (!enouhtLiquidity) {
        this.determineAmountToSubstract();
        await this.substractAmountByStrat();
      }
    } catch (e) {
      console.log(e);
      return;
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
    } catch (e) {
      throw new Error("No strat active");
    }
  }

  getTotalAmountOfStrategies() {
    let BTC = new Big(0);
    let ETH = new Big(0);
    let USDT = new Big(0);

    this.strategies.forEach((strategy) => {
      BTC = BTC.plus(strategy.btc);
      ETH = ETH.plus(strategy.eth);
      USDT = USDT.plus(strategy.usdt);
    });

    this.strategiesAmount = {
      BTC: BTC.toNumber(),
      ETH: ETH.toNumber(),
      USDT: USDT.toNumber(),
    };
  }

  async getExchangeWalletAmount() {
      let binance = await this.user
        .exchanges()
        .where("name", "binance")
        .fetch();
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

      this.binanceAmount.BTC = Big(this.binanceAmount.BTC)
        .round(7, 0)
        .toNumber();
      this.binanceAmount.ETH = Big(this.binanceAmount.ETH)
        .round(7, 0)
        .toNumber();
      this.binanceAmount.USDT = Big(this.binanceAmount.USDT)
        .round(7, 0)
        .toNumber();
  }

  exchangeHasEnoughLiquidity() {
    let enouhtLiquidity = true;

    for (const currency in this.strategiesAmount) {
      if (this.strategiesAmount[currency] > this.binanceAmount[currency]) {
        this.currencyWithNotEnoughLiquidity.push({
          name: currency,
          surplus: new Big(this.strategiesAmount[currency])
            .minus(this.binanceAmount[currency])
            .toNumber(),
        });

        enouhtLiquidity = false;
      }
    }

    return enouhtLiquidity;
  }

  determineAmountToSubstract() {
    this.currencyWithNotEnoughLiquidity.forEach((currency) => {
      this.amountToSubstract.push({
        currency: currency.name,
        size: new Big(currency.surplus)
          .div(this.strategies.length)
          .round(7, 3)
          .toNumber(),
        nbStrat: this.strategies.length,
      });
    });
  }

  async substractAmountByStrat() {
    //setup of "big.js"
    Big.RM = 3; //ROUND_DOWN
    Big.DP = 7; //number after dot

    this.sortStratByCurrencyGrowing();

    for (const amount of this.amountToSubstract) {
      for (const strategy of this.strategiesSorted[amount.currency]) {
        const strategyDB = await Strategy.find(strategy.id);
        let remainingAmount = new Big(strategy[amount.currency.toLowerCase()])
          .minus(amount.size)
          .round(7, 3)
          .toNumber();
        if (remainingAmount < 0) {
          amount.nbStrat -= 1;
          if (amount.nbStrat > 0)
            amount.size += new Big(remainingAmount)
              .abs()
              .div(amount.nbStrat)
              .toNumber();

          strategyDB[amount.currency.toLowerCase()] = 0;
        } else strategyDB[amount.currency.toLowerCase()] = remainingAmount;
        await strategyDB.save();
      }
    }
  }

  sortStratByCurrencyGrowing() {
    this.currencyWithNotEnoughLiquidity.forEach((currency) => {
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
