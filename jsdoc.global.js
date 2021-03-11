/**
 * Context object distributed to all methods
 * @typedef {object} ctx
 * @property {object} params - Url parameter
 * @property {object} request - Property present in request body
 * @property {object} response - Object to make an return responses
 * @property {object} auth - Object that contains multiple methods related to authentication
 * @property {object} [socket] - Object that contains multiple methods related to websocket
 */

/**
 * Amount of wallet converted in each currency and by day
 * @typedef {object} currencyByDay
 * @property {number|string} BTC - Amount of BTC
 * @property {number|string} ETH - Amount of ETH
 * @property {number|string} USDT - Amount of USDT
 * @property {string} date - date
 */

/**
 * Amount of wallet converted in each currency and by day
 * @typedef {object} strategy
 * @property {number} id - The strategy id
 * @property {string} title - Strategy title
 * @property {number} btc - Current amount of btc in strategy
 * @property {number} eth - Current amount of eth in strategy
 * @property {number} usdt - Current amount of usdt in strategy
 * @property {string} strategy - Strategy reference
 * @property {string} position - A Json stringify that contains current position
 * @property {number} exchange_id - Id of strategy's exchange
 * @property {boolean} active - If strategy is active
 * @property {string} frequency - The frequency of trade
 * @property {string} created_at - Date at which the strategy started
 * @property {string} updated_at - Date on which the strategy was updated
 */

/**
 * If the user has enough data, more than one
 * @typedef {object} enoughData
 * @property {boolean} enoughData - does the user have enough data ?
 */

/**
 * @typedef {object} messages
 * @property {number} id - Id of message
 * @property {string} created_at - Date of message
 * @property {string} message - Content of message
 * @property {number} user_id - The id of the user who wrote the message
 * @property {string} message - Content of message
 * @property {string} pseudo - User's pseudo
 */

/**
 * @typedef {object} exchange
 * @property {number} id - Id of exchange
 * @property {string} name - Name of exchange
 * @property {string} public_key - The public key of exchange
 * @property {string} private_key - The privat(or secret) key of exchange
 * @property {boolean} tested - Have the private and public key been tested ?
 * @property {boolean} validate - Is the private and public key valid ?
 * @property {number} user_id - The id of the user who owns the exchange
 */

/**
 * @typedef {object} saveExchangeResponse
 * @property {boolean} success - Is the public and private keys validate ?
 * @property {exchange} exchange - Exchange info
 */

/**
 * @typedef {object} position
 * @property {string} date - Date of this position
 * @property {number} value - Position weight, ranges from 0 to 1
 */

/**
 * @typedef {object} positions
 * @property {position[]} pair - One or many array of position object
 */

/**
 * @description An array of two number, index[0] = data and index[1] = value
 * @typedef {Array<number, number>} performance
 */

/**
 * @typedef {object} settings
 * @property {number} id - Setting id
 * @property {boolean} send_mail - Does the user want a daily email sent to him ?
 * @property {string} mail_time - An hour, at what time to send the email
 * @property {number} user_id - The id of settings user
 */

/**
 * @typedef {object} napoleon
 * @property {number} id - Id of napoleon strategy
 * @property {string} strategy - Name of napoleon strategy
 * @property {string} position - A json stringify that show today position for each currency
 * @property {string} title - The title of napoeon strategy
 * @property {string} frequency - The strategy's frequency of trading
 * @property {string} updated_at - The date of the last update
 */

/**
 * @typedef {object} startResponse
 * @property {boolean} started - If strategy is started
 * @property {strategy} userStrategy - The strategy data saved
 */

/**
 * @typedef {object} startedStrategy
 * @property {boolean} success - If strategy has started correctly
 * @property {strategy} userStrategy - The strategy data saved
 */

/**
 * @typedef {object} success
 * @property {boolean} success - If everything went well
 */

/**
 * @typedef {objetc} isActive
 * @property {boolean} isActive - If the strategy is active
 */

/**
 *
 * @typedef {object} subscriptionData
 * @property {number} id - Subscription id
 * @property {number} user_id - User's id of this subscription
 * @property {boolean} tester - if the subscription is still in the test period
 * @property {strind} date_end_subscription - The date that subscription end
 * @property {strind} type - The type of subscription "bronze", "argent" or "or"
 * @property {string} customerId - The customer id to use withe stripe
 * @property {string} created_at - The start date of the subscription
 * @property {string} updated_at - the subscription update date
 */

/**
 * @typedef {object} sessionId
 * @property {number|string} sessionId - The id of stripe's session
 */

/**
 * @typedef {object} urlToRedirect
 * @property {string} urlToRedirect - The URL to redirect to
 */

/**
 * @typedef {object}  customerPortalErrorDetail
 * @property {string} type  - stripe
 * @property {string} message  - stripe connection error
 */

/**
 * @typedef {object} customerPortalError
 * @property {boolean} success - If the session with the Stripe portal is opened successfully
 * @property {customerPortalErrorDetail} details - Details about errors
 * @example
 * {
 *    success: false,
 *    details: {
 *      type: "stripe",
 *      message: "stripe connection error",
 *    }
 * }
 */

/**
 * @typedef {object} trade
 * @property {number} id - The id of the trade
 * @property {string} pair - The pair of the trade
 * @property {string} action - Whether the pair has been bought or sold
 * @property {number} amount - Amount of the trade
 * @property {number|string} strategy_id - The strategy's id that created the trade
 * @property {string} created_at - The date of the trade
 */

/**
 * @typedef {object} user
 * @property {number|string} id - User's id
 * @property {string} username - User's username
 * @property {string} email - User's mail
 * @property {string} date_of_birth - User's date of birth
 * @property {boolean} male - If the user is male
 * @property {boolean} active - If the user has validate his mail
 * @property {string} created_at - The date the user registered
 * @property {string} updated_at - The date the user update his profile
 */

/**
 * @typedef {object} formValidationFailed
 * @property {boolean} successfully - If the validation was successful
 * @property {formValidationMDetails} details - Details about error
 * @example
 * {
 *   success: false,
 *   details: {
 *     "field":"email",
 *     "message":"Cannot find user with provided email"
 *   }
 * }
 */

/**
 * @typedef {object} formValidationMDetails
 * @property {string} field - Error type
 * @property {string} message - Error message
 */

/**
 * @typedef {object} registrationValidation
 * @param {boolean} success - If the registration was successful
 * @param {string} type - The response subject
 * @example
 * {
 *   success: true,
 *   type: "registration",
 * }
 */

/**
 * @typedef {object} connexionResponse
 * @property {boolean} success - if the connection was successful
 * @property {string} type - The response subject
 * @property {string} token - The JWT token
 * @property {number|string} userId - User's id
 * @example
 * {
 *  success: true,
 *  type: "connexion",
 *  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *  userId: 2,
 * }
 */

/**
 * @typedef {object} websocketMessage
 * @property {number|string} userId - User's id
 * @property {string} pseudo - User's username
 * @property {string} message - User's message
 * @example
 * {
 *  userId: '2',
 *  pseudo: 'walid',
 *  message: 'Bonjour'
 * }
 */

/**
 * @typedef {object} formattedAssetDataInEur
 * @property {string} priceProgressionFormatted - The progression price in euro
 * @property {string} currentWalletFormatted - The total wallet amount in euro
 * @property {string} priceProgressionInPercentFormatted - The progression price in percent
 */

/**
 * @typedef {object} assetDataShorted
 * @property {string|number} BTC - BTC amount
 * @property {string|number} ETH -  ETH amount
 * @property {string|number} USDT -  USDT amount
 * @property {string} date - Data recording date
 */

/**
 * @typedef {object} strategyDataShorted
 * @property {string} title - Title of strategy
 * @property {string} position - Position of strategy in percent
 */

/**
 * @typedef {object} lastTradeInfo
 * @property {string} strategyTitle - Title of strategy that triggered this trade
 * @property {boolean} tradeExist - If there was a trade
 * @property {string} currencySell - The currency sold
 * @property {string} currencyBuy - The currency buy
 * @property {string} amount - Amount of the exchange
 */

/********** Exceptions ***********/

/**
 * @typedef {object} AuthentificationFailedException
 * @property {boolean} success - if token doesn't expiry
 * @property {object} details - details about the error
 * @property {string} details.type - expiry
 * @property {string} details.message - token expiry
 * @example
 * {
 *   success: false,
 *   details: {
 *     type: 'auth',
 *     message: 'request blocked: bad user'
 *   }
 * }
 */

/**
 *
 * @typedef {object} SubscriptionExpiryException
 * @property {boolean} success - if token doesn't expiry
 * @property {object} details - details about the error
 * @property {string} details.type - subscription
 * @property {string} details.message - subscription expiry
 * @example
 * {
 *   success: false,
 *   details: {
 *     type: 'subscription',
 *     message: 'subscription expiry'
 *   }
 * }
 */

/**
 *
 * @typedef {object} TokenExpiryException
 * @property {boolean} success - if token doesn't expiry
 * @property {object} details - details about the error
 * @property {string} details.type - expiry
 * @property {string} details.message - token expiry
 * @example
 * {
 *   success: false,
 *   details: {
 *     type: 'expiry',
 *     message: 'token expiry'
 *   }
 * }
 */

/**
 * @typedef {object}  StripeCreateCheckoutSessionExceptionDetails
 * @property {string} type  - stripe
 * @property {string} message  - message error
 */

/**
 * @typedef {object} StripeCreateCheckoutSessionException
 * @property {boolean} success - If the session with the Stripe portal is opened successfully
 * @property {StripeCreateCheckoutSessionExceptionDetails} details - Details about errors
 * @example
 * {
 *    success: false,
 *    details: {
 *      type: "stripe",
 *      message: error.message,
 *    }
 * }
 */
