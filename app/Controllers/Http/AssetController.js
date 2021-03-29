"use strict";
const User = use("App/Models/User");
const Database = use("Database");
const AssetSorting = use("App/Services/AssetSorting")

/**
 * @namespace Controllers.Http
 */

/**
 * @memberof Controllers.Http
 * @classDesc This is the Controller for routes that begin by "[Domain name]/api/v1/assets". Desserve data related to assets.
 */
class AssetController {
  
   /**
   * @description Gives all user assets filter and sorted by day
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.auth.user.id - User's id
   * @returns {Array<currencyByDay>} Array of currencyByDay
   */
  async allDaily({ auth }) {
    const assetSorting = new AssetSorting()
    const assetSortedByDay = await assetSorting.allDaily(auth.user.id)
    return assetSortedByDay
  }

  /**
   * @description Gives user assets filter and sorted by day for one strategy
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.auth.user.id - User's id
   * @param {string} ctx.params.strat - The title of strategy
   * @returns {Array<currencyByDay>} - Array of currencyByDay
   */
  async byStrategy({ auth, params }) {
    const userId = auth.user.id;
    const strat = params.strat.replace("%20", " ").split("_").join("/");

    const stratByDate = await Database.select("assets.amount_by_date")
      .from("exchanges")
      .where("user_id", userId)
      .rightJoin("strategies", "strategies.exchange_id", "exchanges.id")
      .rightJoin("assets", "assets.strategy_id", "strategies.id")
      .where("strategies.title", strat);

    /**
     * TODO: handle case multi exchange
     */
    if (stratByDate.length > 1) return stratByDate;

    return stratByDate[0].amount_by_date;
  }

  /**
   * @description Gives all user strategies
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.auth.user.id - User's id
   * @returns {Array<strategy>} - Array of strategies
   */
  async total({ auth }) {
    //get user's data
    let user = await User.query()
      .where("id", auth.user.id)
      .with("exchanges.strategies")
      .fetch();
    user = user.toJSON();

    //push all strategy by exchange to "strats"
    const strats = [];
    user[0].exchanges.map((exchange) => {
      exchange.strategies.map((strategy) => {
        strats.push(strategy);
      });
    });
    return strats;
  }

  /**
   * @description Inform if the user had enough data (above 1), useful for displaying or not the graph
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.auth.user.id - User's id
   * @returns {enoughData} - Object
   */
  async sufficient({ auth }) {
    const userId = auth.user.id;
    const assets = await Database.select("amount_by_date")
      .table("assets")
      .rightJoin("strategies", "strategy_id", "strategies.id")
      .rightJoin("exchanges", "exchange_id", "exchanges.id")
      .rightJoin("users", "user_id", "users.id")
      .where("users.id", userId);

    let enoughDatas = false;
    assets.forEach((asset) => {
      const amounts = JSON.parse(asset.amount_by_date);
      if (amounts && amounts.length > 1) enoughDatas = true;
    });

    return { enoughDatas };
  }
}

module.exports = AssetController;
