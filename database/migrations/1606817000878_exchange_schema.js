'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BinanceSchema extends Schema {
  up () {
    this.create('exchanges', (table) => {
      table.increments()
      table.string('name', 100)
      table.string('public_key', 255)
      table.string('private_key', 255)
      table.boolean('tested').defaultTo(false).notNullable()
      table.boolean('validate').defaultTo(false).notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
    })
  }

  down () {
    this.drop('exchanges')
  }
}

module.exports = BinanceSchema
