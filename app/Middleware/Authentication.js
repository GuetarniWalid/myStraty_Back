"use strict";
const { decode } = require("jws");
const AuthentificationFailedException = use(
  "App/Exceptions/AuthentificationFailedException"
);

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
   * @param {Function} ctx.auth.getUser - Function that return a user according to the token
   * @param {Function} next - go to the next middleware
   * @returns {void}
   * @throws {AuthentificationFailedException} - if the authentication failed
   */
  async handle({ auth, request }, next) {
    try {
      //verify if user has a session valide and return user
      const user = await auth.getUser();

      //get the token and decode it
      const authorization = request.header("Authorization");
      const jwt = authorization.split(" ")[1];
      const token = decode(jwt);

      //if "user.id" and "token.payload.uid" are different an error 401 is send
      if (user.id !== token.payload.uid) throw new AuthentificationFailedException();
    } catch (e) {
      throw new AuthentificationFailedException();
    }
    //if ok next middleware
    await next();
  }
}

module.exports = Authentication;
