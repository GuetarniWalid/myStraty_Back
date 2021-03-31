"use strict";
const Model = use("Model");


/**
 * @memberof Models
 * @extends Model
 * @requires Model
 * @classDesc This is the Model of exchanges tables
 */

class Exchange extends Model {
  /**
   * Deactivated the creation of a created_at column in database for exchanges table
   * which is automatically added by the framework
   */
  static get createdAtColumn() {
    return null;
  }

  /**
   * Deactivated the creation of a updated_at column in database for exchanges table
   * which is automatically added by the framework
   */
  static get updatedAtColumn() {
    return null;
  }

  /**
   * An helper method that filter exchanges that have at least one strategy
   * @param {object} query - An ORM object
   * @returns {object} One or many ORM object that represent column of exchanges table
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
  static scopeHasStrategies(query) {
    return query.has("strategies");
  }

  /**
   * A relationship between exchange and strategies table.
   * One exchange can have multiple strategies
   *
   * @return {Object} One or many ORM object that represent strategies table
   */
  strategies() {
    return this.hasMany("App/Models/Strategy");
  }

  /**
   * A relationship between exchange and assets table
   * An exchange can have multiple assets
   *
   * @method assets
   *
   * @return {Object} One or many ORM object that represent assets table
   */
  assets() {
    return this.manyThrough("App/Models/Strategy", "asset");
  }


  /**
   * A relationship between exchanges and users table.
   * Several exchanges can belong to one user.
   *
   * @return {Object} One or many ORM object that represent trades table
   */
   user() {
    return this.belongsTo("App/Models/User");
  }
}

module.exports = Exchange;
