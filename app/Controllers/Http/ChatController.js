"use strict";
const Chat = use("App/Models/Chat");
const User = use("App/Models/User");

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

  /**
   * @description Gives the number of messages unread for a user
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.auth.user.id - User's id
   * @returns {successNumberUnreadMessages} - If the number was successfully retrieved
   */
  async numberUnread({ auth }) {
    const userId = auth.user.id;
    const user = await User.find(userId);

    const count = await Chat.query()
      .where("id", ">", user.last_message_read)
      .count("* as total");

    const total = count[0].total;

    return {
      success: true,
      details: {
        type: "unread messages",
        number: total,
      },
    };
  }
}

module.exports = ChatController;
