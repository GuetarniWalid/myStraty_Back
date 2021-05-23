'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersAddLastMessageReadSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.integer('last_message_read').defaultTo(0).notNullable()
    })
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('last_message_read')
    })
  }
}

module.exports = UsersAddLastMessageReadSchema
