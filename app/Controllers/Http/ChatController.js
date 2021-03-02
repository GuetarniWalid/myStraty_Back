"use strict";
const Chat = use("App/Models/Chat");

/**
 * @memberof Controllers.Http
 * @classDesc This is the Controller for routes that begin by "[Domain name]/api/v1/chat". Desserve data related to chat.
 */
class ChatController {

    /**
     * @description Gives all message of each user
     * @returns {Array<messages>} - All messages of all users
     */
  async all() {
    const chat = await Chat.all();
    return chat;
  }
}

module.exports = ChatController;
