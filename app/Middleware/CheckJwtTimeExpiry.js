'use strict'
const { decode } = require("jws");
const TokenExpiryException = use('App/Exceptions/TokenExpiryException')
const Env = use('Env')

/**
 * @memberof Middleware
 * @classDesc This is the Middleware to verify the expiration of the JWT token
 */
class CheckJwtTimeExpiry {

  /**
   * @description Verify if the token is valid
   * @param {ctx} ctx - Context object
   * @param {Function} ctx.request.header - Extract the value of one key present in request's header
   * @param {Function} next - go to the next middleware
   * @return {void}
   * @throws {TokenExpiryException} - if the token is expiry
   */
  async handle ({ request }, next) {
    try {
      if(Env.get('NODE_ENV') === 'test') {
        await next()
      }
      else {
        //get the token and decode it
        const authorization = request.header('Authorization')
        const jwt = authorization.split(' ')[1]
        const token = decode(jwt)
        const expireIn = token.payload.data.expireIn
        //convert iat in millisecond(iat: Identifies the time at which the JWT was issued)
        const iat = token.payload.iat * 1000
        const now = Date.now()
        //calculate if token expiry time isn't passed
        const isTokenExpiry = (expireIn + iat) < now
        if(isTokenExpiry) throw new TokenExpiryException()
      }
    }
    catch(e) {
      throw new TokenExpiryException()
    }
    await next()
  }
}

module.exports = CheckJwtTimeExpiry
 