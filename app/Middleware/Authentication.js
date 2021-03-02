'use strict'
const AuthentificationFailedException = use('App/Exceptions/AuthentificationFailedException')

/**
 * @namespace Middleware
 */

/**
 * @memberof Middleware
 * @classDesc This is the Middleware to verify user integrity
 */
class Authentication {
  /**
   * @description Verify the id integrity and that the user access to its own data
   * @param {ctx} ctx - Context object
   * @param {number} ctx.params.id - User's id
   * @param {Function} ctx.auth.getUser - Function that return a user according to the token
   * @param {Function} next - go to the next middleware
   * @returns {void}
   * @throws {AuthentificationFailedException} - if the authentication failed
   */
  async handle ({ params, auth }, next) {
    try {
      const idParams = Number(params.id)
      //if "idParams" doesn't look like a number, an error 401 is send
      if(isNaN(idParams)) throw new AuthentificationFailedException()
      const userAuth = await auth.getUser()
      const idAuth = userAuth.id
      //if "idParams" and "idAuth" are different an error 401 is send
      if(idParams !== idAuth) throw new AuthentificationFailedException()
    }
    catch(e) {
      throw new AuthentificationFailedException()
    }
    //if ok next middleware
    await next()
  }
}

module.exports = Authentication

