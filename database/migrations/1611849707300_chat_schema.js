'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database')

class ChatSchema extends Schema {
  up () {
    this.create('chats', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('pseudo', 50).notNullable().unique()
      table.string('message', 250)
      table.timestamp('created_at').defaultTo(Database.fn.now())
    })
  }

  down () {
    this.drop('chats')
  }
}

module.exports = ChatSchema
