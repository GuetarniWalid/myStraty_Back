"use strict";
const Subscription = use("App/Models/Subscription");
const User = use("App/Models/User");
const Stripe = require("stripe");
const Env = use("Env");
const StripeCreateCheckoutSessionException = use(
  "App/Exceptions/StripeCreateCheckoutSessionException"
);
const moment = require("moment");


/**
 * @memberof Controllers.Http
 * @classDesc This is the Controller for routes that begin by "[Domain name]/api/v1/subscription". Desserve data related to subscription.
 */
class SubscriptionController {

  /**
   * @description Desserve all data about user's subscription
   * @param {ctx} ctx - Context object 
   * @param {number|string} ctx.params.id - User's id 
   * @returns {subscriptionData} - All data about user's subscription
   */
  async index({ params }) {
    const userId = params.id;
    const subscription = await Subscription.findBy("user_id", userId);
    return subscription;
  }

  /**
   * @description create a stripe session to subscribe and redirect the user to stripe interface
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.params.id - User's id
   * @param {number|string} ctx.request.priceId - Price's id 
   * @returns {sessionId} - The id of stripe's session  
   * @throws {StripeCreateCheckoutSessionException} - If an error was occur
   */
  async createCheckoutSession({ request, params }) {
    const { priceId } = request.all();
    const { id } = params;
    const user = await User.find(id);
    //create a session to Stripe
    const stripe = Stripe(Env.get("STRIPE_SECRET_KEY"));

    try {
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            // For metered billing, do not pass quantity
            quantity: 1,
          },
        ],
        mode: "subscription",
        // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        // the actual Session ID is returned in the query parameter when your customer
        // is redirected to the success page.
        success_url: `${Env.get(
          "FRONT_URL"
        )}/#/console/abonnement/succes?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${Env.get("FRONT_URL")}/#console/abonnement`,
      });

      return {
        sessionId: session.id,
      };
    } catch (e) {
      throw new StripeCreateCheckoutSessionException();
    }
  }

  /**
   * @description Open a stripe session to handle a user subscription and redirect the user to stripe interface
   * @param {ctx} ctx - Context object 
   * @param {number|string} ctx.params.id - User's id
   * @returns {urlToRedirect} - The URL to redirect to
   * @throws {customerPortalError} - If an error was occur
   */
  async customerPortal({ params }) {
    //create a session to Stripe
    const stripe = Stripe(Env.get("STRIPE_SECRET_KEY"));
    const userId = params.id;

    try {
      const subscription = await Subscription.findByOrFail("user_id", userId);
      const portalsession = await stripe.billingPortal.sessions.create({
        customer: subscription.customerId,
        return_url: `${Env.get("FRONT_URL")}/#/console/abonnement`,
      });

      return { urlToRedirect: portalsession.url };
    } catch (e) {
      return {
        success: false,
        details: {
          type: 'stripe',
          message: "stripe connection error",
        },
      };
    }
  }

  /**
   * @description - Handle event send by stripe about subscription
   * @param {ctx} ctx - Context object
   * @param {string} ctx.request.stripe_signature - The stripe signature
   * @param {Function} ctx.response.ok - Function to send a http response with a status 200
   * @returns {void} - Return a http response with status 200 enough content
   */
  async webhook({ request, response }) {
    const endpointSecret = Env.get("STRIPE_SIGNATURE_HEADER");
    const signature = request.header("stripe-signature");
    const stripe = Stripe(Env.get("STRIPE_SECRET_KEY"));

    //verify the good signature of event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.raw(),
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.ok();
    }

    switch (event.type) {
      case "invoice.paid":
        try {
          const plan = this.retrievePlan(event.data.object.lines.data[0].price.product);
          const user = await User.findByOrFail(
            "email",
            event.data.object.customer_email
          );
          const subscription = await Subscription.findByOrFail(
            "user_id",
            user.id
          );
          subscription.tester = false;
          subscription.date_end_subscription = moment().add(1, 'M').format('YYYY-MM-DD');
          subscription.type = plan;
          subscription.customerId = event.data.object.customer;
          await subscription.save();
        } catch (e) {
          console.log(e);
          return response.ok();
        }
        break;
      case "customer.subscription.updated":
        try {
          const plan = this.retrievePlan(event.data.object.plan.product);
          const subscription = await Subscription.findByOrFail('customerId', event.data.object.customer)
          subscription.type = plan;
          await subscription.save();
        } catch (e) {
          console.log(e);
          return response.ok();
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return response.ok();
  }


  /**
   * @description Take a product id and return the subscription's type
   * @param {string} productId - The product id
   * @returns {string} - The type of subscription
   */
  retrievePlan(productId) {
    let type;
    switch (productId) {
      case "prod_InJ7mgOxHQALRF":
        type = "bronze";
        break;
      case "prod_InJ7wXjzTFDZfl":
        type = "argent";
        break;
      case "prod_InJ8WauKXdADOn":
        type = "or";
        break;
      default:
        throw new Error(
          `product Id ${productId} doesn't exist.`
        );
    }
    return type;
  }
}

module.exports = SubscriptionController;
