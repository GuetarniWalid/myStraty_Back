"use strict";
const Model = use("Model");


/**
 * @memberof Models
 * @extends Model
 * @requires Model
 * @classDesc This is the Model of napoleons table
 */

class Napoleon extends Model {
    static get createdAtColumn () {
        return null
      }
}

module.exports = Napoleon;
