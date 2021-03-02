"use strict";
const Model = use("Model");

/**
 * @memberof Models
 * @extends Model
 * @requires Model
 * @classDesc This is the Model of strategies table
 */
class Strategy extends Model {
  /**
   * An helper method that filter exchanges that have at least one trade
   * @param {object} query - An ORM object
   * @returns {object} One or many ORM object that represent column of strategies table
   *
   * @example
   *
   *
   * const Model = use('Model')
   *
   *class User extends Model {
   * static scopeHasProfile (query) {
   *   return query.has('profile')
   * }
   *
   * profile () {
   *   return this.hasOne('App/Models/Profile')
   * }
   *}
   *
   * //So, now you can use it as
   * const users = await User.query().hasProfile().fetch()
   */
  static scopeHasTrades(query) {
    return query.has("trades");
  }

  /**
   * A relationship between strategies and assets table.
   * One strategies can have only one asset.
   *
   * @return {Object} One or many ORM object that represent assets table
   */
  asset() {
    return this.hasOne("App/Models/Asset");
  }

  /**
   * A relationship between strategies and trades table.
   * One strategies can have multiple trades.
   *
   * @return {Object} One or many ORM object that represent trades table
   */
  trades() {
    return this.hasMany("App/Models/Trade");
  }
}

module.exports = Strategy;
