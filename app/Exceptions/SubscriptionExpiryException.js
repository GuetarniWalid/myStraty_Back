'use strict'
const { LogicalException } = require('@adonisjs/generic-exceptions')

/**
 * @memberof Exceptions
 * @extends LogicalException
 * @classDesc return error details about subscription
 */
class SubscriptionExpiryException extends LogicalException {

  /**
   * @description return error details about subscription
   * @param {object} error - Error object 
   * @param {ctx} ctx - Context object 
   * @param {Function} ctx.response.send - Make a http response
   * @returns {SubscriptionExpiryException}
   */
  handle (error, {response}) {
    response
      .status(401)
      .send({
        success: false,
        details: {
          type: 'subscription',
          message: 'subscription expiry'
        }
      })
  }
}

module.exports = SubscriptionExpiryException
