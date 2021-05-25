'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ChatIncreaseMessageSizeSchema extends Schema {
  up () {
    this.table('chats', (table) => {
      table.string('message', 2000).alter()
    })
  }

  down () {
    this.table('chats', (table) => {
      table.string('message', 250).alter()
    })
  }
}

module.exports = ChatIncreaseMessageSizeSchema
