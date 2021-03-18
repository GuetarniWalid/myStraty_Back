'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ChatRemovePseudoUniqueSchema extends Schema {
  up () {
    this.alter('chats', (table) => {
      table.string('pseudo', 50).notNullable().alter()
    })
  }

  down () {
    this.table('chats', (table) => {
      // reverse alternations
      table.string('pseudo', 50).notNullable().unique().alter()
    })
  }
}

module.exports = ChatRemovePseudoUniqueSchema
