"use strict";
const { LogicalException } = require("@adonisjs/generic-exceptions");

/**
 * @memberof Exceptions
 * @extends LogicalException
 * @classDesc return error details about binance connection
 */
class BinanceKeyException extends LogicalException {
  constructor () {
    const message = "Request error to binance. Check that secretKey and publicKey are correct."
    const status = 401
    super(message, status)
  }
}

module.exports = BinanceKeyException;
