'use strict'
const Subscription = use('App/Models/Subscription')
const SubscriptionExpiryException = use('App/Exceptions/SubscriptionExpiryException')
const moment = require("moment");

/**
 * @memberof Middleware
 * @classDesc This is the Middleware to verify the subscription validity
 */
class CheckSubscriptionValidity {

  /**
   * @description Verify if the subscription is active
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.params.id - User's id
   * @param {Function} next - go to the next middleware
   * @return {void}
   * @throws {SubscriptionExpiryException} - if the subscription isn't valid
   */
  async handle ({ auth }, next) {
    const userId = auth.user.id
    try {
      const subscription = await Subscription.findByOrFail('user_id', userId)
      //revokes the access three days after the end of the subscription
      const isNotExpiry = moment().isBefore(moment(subscription.date_end_subscription).add(3, 'days'), 'day')
      if(!isNotExpiry) throw new SubscriptionExpiryException()
    }
    catch(e) {
      throw new SubscriptionExpiryException()
    }
    await next()
  }
}

module.exports = CheckSubscriptionValidity
