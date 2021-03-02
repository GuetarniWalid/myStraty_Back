"use strict";
const { LogicalException } = require("@adonisjs/generic-exceptions");

/**
 * @namespace Exceptions
 */

/**
 * @memberof Exceptions
 * @extends LogicalException
 * @classDesc return error details about authentication
 */
class AuthentificationFailedException extends LogicalException {

  /**
   * @description return error details about authentication
   * @param {object} error - Error object 
   * @param {ctx} ctx - Context object 
   * @param {Function} ctx.response.send - Make a http response
   * @returns {AuthentificationFailedException}
   */
  handle(error, { response }) {
    response.status(401).send({
      success: false,
      details: {
        type: "auth",
        message: "request blocked: bad user",
      },
    });
  }
}

module.exports = AuthentificationFailedException;
