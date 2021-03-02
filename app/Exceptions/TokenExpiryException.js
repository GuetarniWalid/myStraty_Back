'use strict'
const { LogicalException } = require('@adonisjs/generic-exceptions')

/**
 * @memberof Exceptions
 * @extends LogicalException
 * @classDesc return error details about token expiration
 */
class TokenExpiryException extends LogicalException {

    /**
   * @description return error details about token expiration
   * @param {object} error - Error object 
   * @param {ctx} ctx - Context object 
   * @param {Function} ctx.response.send - Make a http response
   * @returns {TokenExpiryException}
   */
  handle (error, {response}) {
    response
      .status(401)
      .send({
        success: false,
        details: {
          type: 'expiry',
          message: 'token expiry'
        }
      })
  }
}

module.exports = TokenExpiryException
