"use strict";
const Model = use("Model");


/**
 * @memberof Models
 * @extends Model
 * @requires Model
 * @classDesc This is the Model of settings table
 */
class Setting extends Model {
  /**
   * Deactivated the creation of a created_at column in database for settings table
   * which is automatically added by the framework
   */
  static get createdAtColumn() {
    return null;
  }

  /**
   * Deactivated the creation of a updated_at column in database for settings table
   * which is automatically added by the framework
   */
  static get updatedAtColumn() {
    return null;
  }
}

module.exports = Setting;
