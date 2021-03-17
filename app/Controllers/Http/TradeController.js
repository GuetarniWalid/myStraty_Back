"use strict";
const Database = use("Database");

/**
 * @memberof Controllers.Http
 * @classDesc This is the Controller for routes that begin by "[Domain name]/api/v1/trade". Desserve data related to trade.
 */
class TradeController {

  /**
   * @description Gives all trade of the user
   * @param {ctx} ctx - Context object 
   * @param {number|string} ctx.auth.user.id - User's id
   * @returns {Array<trade>} - An array with all trade
   */
  async all({ auth }) {
    const userId = auth.user.id;
    const trades = await Database.select("exchanges.name as exchange", "trades.pair", "trades.action", "trades.amount", "trades.created_at", "trades.id")
      .from("exchanges")
      .where("user_id", userId)
      .rightJoin('strategies', 'strategies.exchange_id', 'exchanges.id')
      .rightJoin('trades', 'strategies.id', 'trades.strategy_id')
      .orderBy('trades.created_at', 'desc')

    return trades
  }
}

module.exports = TradeController;
