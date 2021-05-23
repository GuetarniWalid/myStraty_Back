"use strict";
const Chat = use("App/Models/Chat");
const User = use("App/Models/User");

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
    if (message.action === "delete") {
      this.deleteMessage(message.id)
      this.socket.broadcastToAll("delete", message.id);
    } else if(message.action === "read") {
      this.saveMessageAsRead(message.id, message.userId)
    } else {
      //if text is empty, no continuation
      if (!message.message.length) return;
      const formatMessage = {
        user_id: message.userId,
        message: message.message,
        pseudo: message.pseudo,
        created_at: Date.now(),
      };
      this.saveMessage(formatMessage);
    }
  }

  /**
   * @description Save user's message in database and make sure the database has no more than 500 messages
   * @param {websocketMessage} message - User's message
   * @returns {void}
   */
  async saveMessage(message) {
    const nbOfMessages = await Chat.getCount();
    if (nbOfMessages > 500) {
      const firstMessage = await Chat.first();
      firstMessage.delete();
    }
    const chat = new Chat();
    chat.message = message.message;
    chat.user_id = message.user_id;
    chat.pseudo = message.pseudo;
    await chat.save();
    this.socket.broadcastToAll("message", chat.toJSON());
  }


  /**
   * @description Delete user's message in database
   * @param {websocketMessage} id - Id of user's message
   * @returns {void}
   */
     async deleteMessage(id) {
      const message = await Chat.find(id)
      await message.delete() 
      this.socket.broadcastToAll("delete", id);
    }


  /**
   * @description Sava user's message in database as read
   * @param {websocketMessage} id - Id of user's message
   * @param {websocketMessage} userId - User's id
   * @returns {void}
   */
      async saveMessageAsRead(id, userId) {
        const user = await User.find(userId)
        user.last_message_read = id
        await user.save() 
      }

}

module.exports = ChatController;
