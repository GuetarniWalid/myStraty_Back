"use strict";
const Chat = use('App/Models/Chat')

/**
 * @namespace Controllers.Ws
 */

/**
 * @memberof Controllers.Ws
 * @classDesc This is the Controller that handle websockect interaction
 */
class ChatController {
  /**
   * @param {ctx} ctx - Context object 
   * @param {object} ctx.request - Request object 
   * @param {object} ctx.socket - Socket object 
   */
  constructor({ socket, request }) {
    this.socket = socket;
    this.request = request;
  }


  /**
   * @description Receive user's message, save it and broadcast it to other users
   * @param {websocketMessage} message - Message data
   * @returns {void}
   */
  onMessage(message) {
    console.log("🚀 ~ file: ChatController.js ~ line 30 ~ ChatController ~ onMessage ~ message", message)
    //if text is empty, no continuation
    if(!message.message.length) return
    const formatMessage = {
      user_id: message.userId,
      message: message.message,
      pseudo: message.pseudo,
      created_at: Date.now()
    }
    this.socket.broadcastToAll('message', formatMessage)
    this.saveMessage(formatMessage)
  }


  /**
   * @description Save user's message in database and make sure the database has no more than 500 messages 
   * @param {websocketMessage} message - User's message
   * @returns {void}
   */
  async saveMessage(message) {
    const nbOfMessages = await Chat.getCount()
    if(nbOfMessages > 500) {
      const firstMessage = await Chat.first()
      firstMessage.delete()
    }
    const chat = new Chat()
    chat.message = message.message
    chat.user_id = message.user_id
    chat.pseudo = message.pseudo
    await chat.save()
  }
}

module.exports = ChatController;
