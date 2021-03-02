"use strict";
const Model = use("Model");

/**
 * @memberof Models
 * @extends Model
 * @requires Model
 * @classDesc This is the Model of trades table
 */
class Trade extends Model {
  /**
   * Deactivated the creation of a updated_at column in database for trades table
   * which is automatically added by the framework
   */
  static get updatedAtColumn() {
    return null;
  }
}

module.exports = Trade;
