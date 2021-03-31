"use strict";
const Napoleon = use("App/Models/Napoleon");
const Strategy = use("App/Models/Strategy");
const Exchange = use("App/Models/Exchange");
const User = use("App/Models/User");
const TradingBot = use("App/Bots/TradingBot");

/**
 * @memberof Controllers.Http
 * @classDesc This is the Controller for routes that begin by "[Domain name]/api/v1/strategies". Desserve data related to strategies.
 */
class StrategyController {
  /**
   * @description Gives all data related to napoleon database
   * @returns {Array<napoleon>} Array of napoleon strategy
   */
  async index() {
    const napoleons = await Napoleon.all();
    return napoleons;
  }

  /**
   * @description - Start a trading strategy for the user
   * @param {ctx} ctx - Context object
   * @param {ctx} ctx.auth.user.id - User's id
   * @param {number} ctx.request.amount - The amount under management
   * @param {string} ctx.request.strat - The strategy selected by user
   * @param {string} ctx.request.frequency - The startegy frequency
   * @param {string} ctx.request.reference - The strategy reference
   * @param {string} ctx.request.exchange - What exchange selected for this strategy
   * @returns {startResponse} - Array of napoleon strategy
   */
  async start({ auth, request }) {
    try {
      const userId = auth.user.id;
      const amount = request.input("amount");
      const strat = request.input("strat");
      const frequency = request.input("frequency");
      const reference = request.input("reference");
      const exchangeSelected = request.input("exchange");
      const exchange = await Exchange.findBy({
        user_id: userId,
        name: exchangeSelected,
      });
      let strategy;

      try {
        strategy = await Strategy.findByOrFail({
          title: strat,
          exchange_id: exchange.id,
        });
      } catch (e) {
        strategy = await new Strategy();
      }

      strategy.btc = 0;
      strategy.eth = 0;
      strategy.usdt = amount;
      strategy.position = JSON.stringify({
        BTC: 0,
        ETH: 0,
        USDT: 1,
      });
      strategy.title = strat;
      strategy.exchange_id = exchange.id;
      strategy.frequency = frequency;
      strategy.strategy = reference;
      strategy.position = JSON.stringify({
        BTC: 0,
        ETH: 0,
        USDT: 1,
      });
      strategy.active = true;

      await strategy.save();

      return {
        success: true,
        userStrategy: strategy,
      };
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  }

  /**
   * @description - Stop the user's strategy
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.params.strategyId - Strategy's id
   * @returns {success} - If the strategy has successfully stopped
   */
  async stop({ params }) {
    try {
      const strategyId = params.strategyId;
      const strategy = await Strategy.find(strategyId);
      const exchange = await strategy.exchange().fetch();
      const user = await exchange.user().fetch();

      const tradingBot = new TradingBot({
        userId: user.id,
        newPositions: { BTC: 0, ETH: 0, USDT: 1 },
        strategyId: strategyId,
        ExchangeData: exchange.toJSON(),
      });

      await tradingBot.startLogic();

      strategy.btc = 0;
      strategy.eth = 0;
      strategy.usdt = 0;
      strategy.position = JSON.stringify({
        BTC: 0,
        ETH: 0,
        USDT: 0,
      });
      strategy.active = 0;
      await strategy.save();
      return { success: true };
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  }

  /**
   * @description Gives info about one user's strategy
   * @param {ctx} ctx - Content object
   * @param {number|string} ctx.auth.user.id - User's id
   * @param {string} ctx.params.strat - The strategy reference
   * @returns {startedStrategy} - If strategy is started and info about this startegy
   */
  async userStrategyInfo({ params, auth }) {
    const userId = auth.user.id;
    const strat = params.strat;
    const exchange = await Exchange.findBy("user_id", userId);
    try {
      const strategy = await Strategy.findByOrFail({
        exchange_id: exchange.id,
        strategy: strat,
      });

      //if strategy exist, determine if this strategy is active or not
      if (strategy.active) {
        return { started: true, userStrategy: strategy };
      } else {
        return { started: false, userStrategy: strategy };
      }
    } catch (e) {
      return { started: false };
    }
  }

  /**
   * @description Responds if a strategy is active
   * @param {ctx} ctx - Context object
   * @param {ctx} ctx.auth.user.id - User's id
   * @returns {isActive} - If the strategy is active
   */
  async isActive({ auth }) {
    const userId = auth.user.id;
    const stratActive = await User.query()
      .where("id", userId)
      .whereHas("exchanges.strategies", (builder) => {
        builder.where("active", true);
      })
      .fetch();
    return stratActive.toJSON().length
      ? { isActive: true }
      : { isActive: false };
  }
}

module.exports = StrategyController;
