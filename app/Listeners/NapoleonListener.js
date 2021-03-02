'use strict'
const Mail = use('Mail')
const Event = use('Event')
const Env = use("Env");


/**
 * @namespace Listeners
 */

 /**
  * @class
  * @memberof Listeners
  * @description Listen events about NapoleonBot logic
  */
const NapoleonListener = exports = module.exports = {}

/**
 * @description If an error occur to get the data about Napoleon positions send an email to admin
 * @param {string} error - Error message
 * @returns {void} 
 */
NapoleonListener.handleError = async (error) => {
        await Mail.raw(`<h3>La récupération des donné a échoué</h3><p><b>Message d' erreur :</b> ${error}</p>`, (message) => {
            message.from(Env.get("MAIL_USERNAME"))
            message.to(Env.get("MAIL_ADMIN"))
            message.subject('Erreur NapoleonBot')
        })
}

/**
 * @description If a success event occur send an email to admin
 * @returns {void} 
 */
NapoleonListener.handleSuccess = async () => {
    await Mail.raw("<h3>La récupération des donné s'est déroulé avec succès !!!</h3>", (message) => {
        message.from(Env.get("MAIL_USERNAME"))
        message.to(Env.get("MAIL_ADMIN"))
        message.subject('Succès de NapoleonBot')
    })
    Event.fire('tradingBot::start')
}
