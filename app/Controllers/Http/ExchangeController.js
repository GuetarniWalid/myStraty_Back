"use strict";
const Binance = use("App/Bots/BinanceBot");
const Exchange = use("App/Models/Exchange");
const Database = use("Database");

/**
 * @memberof Controllers.Http
 * @classDesc This is the Controller for routes that begin by "[Domain name]/api/v1/exchange". Desserve data related to exchanges.
 */
class ExchangeController {
  /**
   * @description Gives all info about one exchange of the user
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.auth.user.id - User's id
   * @param {string} ctx.params.name - Name of exchange to lowercase
   * @returns {exchange} - Info about user's exchange
   */
  async info({ params, auth }) {
    const userId = auth.user.id;
    const name = params.exchange;
    const exchange = await Exchange.findByOrFail({
      user_id: userId,
      name: name,
    });
    return exchange;
  }

  /**
   * @description Gives the current amount in the exchange in usdt
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.auth.user.id - User's id
   * @param {string} ctx.params.exchange - Exchange name in lowercase
   * @returns {number} usdt balance - The current amount of usdt in the exchange
   */
  async USDTBalance({ auth, params }) {
    try {
      const userId = auth.user.id;
      const exchangeSelected = params.exchange;
      const exchange = await Exchange.findBy({
        user_id: userId,
        name: exchangeSelected,
      });
    

      const dataExchange = {
        public_key: exchange.public_key,
        private_key: exchange.private_key,
      };
      /**
       *
       * TODO: handle Kraken exchange
       *
       */
      //First: we determine the balance of exchange's wallet
      let balanceInExchange;
      if (exchangeSelected === "binance") {
        const binance = new Binance(dataExchange);
        try {
         //if there is an error, binance balance equal 0
         balanceInExchange = await binance.getWalletBalance("USDT");

        } catch (error) {
          balanceInExchange = 0;
        }
      }

      //Second: we determine the usdt balance of all strategy and for Binance
      let strategies = await exchange.strategies().fetch()
      strategies = strategies.toJSON()
      const balanceOfStrategies = strategies.reduce((acc, strategy) => acc.usdt + strategy.usdt)

      //Third: we substract "balanceOfStrategies" from "balanceInExchange" and return the result
      return balanceInExchange - balanceOfStrategies;
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * @description Save the exchange data in database and response if they are valid
   * @param {ctx} ctx - Context object
   * @param {number} ctx.auth.user.id - User's id
   * @param {string} ctx.request.name - The name of exchange in lowercase
   * @param {string} ctx.request.privateKey - The private key of exchange
   * @param {string} ctx.request.publicKey - The public key of exchange
   * @returns {saveExchangeResponse} Are the exchange data validate ?
   */
  async save({ auth, request }) {
    const userId = auth.user.id;
    const name = request.input("name");
    const privateKey = request.input("privateKey");
    const publicKey = request.input("publicKey");

    //save in exchange database that a first test is passed
    const exchange = await Exchange.findOrCreate(
      { user_Id: userId, name: name },
      { user_Id: userId, name: name }
    );
    exchange.tested = true;
    let response = {
      success: false,
      details: {
        type: "exchange",
        message: "incorrect keys",
      },
    };

    //only if public and private keys aren't empty
    if (privateKey && publicKey) {
      //test if public and private keys are correct
      const dataExchange = {
        public_key: publicKey,
        private_key: privateKey,
      };
      const binance = new Binance(dataExchange);
      response.success = await binance.test();
      exchange.public_key = publicKey;
      exchange.private_key = privateKey;
      exchange.validate = response.success;
    }

    await exchange.save();

    response.exchange = exchange.toJSON();
    return response;
  }
}

module.exports = ExchangeController;
