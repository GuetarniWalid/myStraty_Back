'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ChatRemovePseudoUniqueSchema extends Schema {
  up () {
    this.drop('chats')
  }

  down () {
      // reverse alternations
    }
}

module.exports = ChatRemovePseudoUniqueSchema
