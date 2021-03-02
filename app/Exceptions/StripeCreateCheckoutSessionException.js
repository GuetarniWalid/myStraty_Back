"use strict";
const { LogicalException } = require("@adonisjs/generic-exceptions");

/**
 * @memberof Exceptions
 * @extends LogicalException
 * @classDesc return error details about stripe session creation
 */
class StripeCreateCheckoutSessionException extends LogicalException {

/**
 * @description return error details about stripe session creation
 * @param {object} error - Error object
 * @param {ctx} ctx - Context object 
 * @param {Function} ctx.response.send - Make a http response
 * @returns {StripeCreateCheckoutSessionException} 
 */
  handle(error, { response }) {
    response.status(500).send({
      success: false,
      details: {
        type: "stripe",
        message: error.message,
      },
    });
  }
}

module.exports = StripeCreateCheckoutSessionException;
