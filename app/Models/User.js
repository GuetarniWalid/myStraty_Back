"use strict";
const Hash = use("Hash");
const Model = use("Model");

/**
 * @memberof Models
 * @extends Model
 * @requires Model
 * @classDesc This is the Model of users table
 */

class User extends Model {
  /**
   * Triggers all hooks on the first registration of a user. Not trigger when a user is updated.
   * Hooks triggered: beforeSave => hash the password
   */
  static boot() {
    super.boot();

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook("beforeSave", async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password);
      }
    });
  }

  /**
   * A static getter method that filter table columns to avoid to display password when we get a user.
   */
  static get hidden() {
    return ["password"];
  }

  /**
   * A relationship between users and tokens table.
   * One user can have multiple tokens.
   *
   * @method tokens
   *
   * @return {Object} One or many ORM object that represent tokens table
   */
  token() {
    return this.hasOne("App/Models/Token");
  }

  /**
   * A relationship between users and exchanges table
   * A user can have multiple exchanges
   *
   * @method exchanges
   *
   * @return {Object} One or many ORM object that represent exchanges table
   */
  exchanges() {
    return this.hasMany("App/Models/Exchange");
  }

  /**
   * A relationship between users and settings table
   * A user can have only one setting table
   *
   * @method setting
   *
   * @return {Object} One ORM object that represent settings table
   */
  setting() {
    return this.hasOne("App/Models/Setting");
  }

  /**
   * A relationship between users and subscriptions table
   * A user can have only one subscription account
   *
   * @method subscription
   *
   * @return {Object} One ORM object that represent subscriptions table
   */
  subscription() {
    return this.hasOne("App/Models/Subscription");
  }

  /**
   * A relationship between users and strategies table
   * A user can have multiple strategies
   *
   * @method strategies
   *
   * @return {Object} One or many ORM object that represent exchanges table
   */
  strategies() {
    return this.manyThrough("App/Models/Exchange", "strategies");
  }
}

module.exports = User;
