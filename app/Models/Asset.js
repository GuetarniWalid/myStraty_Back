"use strict";
const Model = use("Model");

/**
 * @namespace Models
 */

/**
 * @memberof Models
 * @extends Model
 * @requires Model
 * @classDesc This is the Model of assets table
 */
class Asset extends Model {
  /**
   * Deactivated the creation of a created_at column in database for assets table
   * which is automatically added by the framework
   */
  static get createdAtColumn() {
    return null;
  }

  /**
   * Deactivated the creation of a updated_at column in database for assets table
   * which is automatically added by the framework
   */
  static get updatedAtColumn() {
    return null;
  }

  /**
   * A relationship between assets and strategies table.
   * One asset belongs to one strategy.
   *
   * @return {Object} One or many ORM object that represent strategies table
   */
  strategy() {
    return this.belongsTo("App/Models/Strategy");
  }
}

module.exports = Asset;
