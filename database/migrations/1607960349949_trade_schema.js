'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TradeSchema extends Schema {
  up () {
    this.create('trades', (table) => {
      table.increments()
      table.string('pair', 50).notNullable()
      table.string('action', 50).notNullable()
      table.decimal('amount', 14, 7).notNullable()
      table.integer('strategy_id').unsigned().references('id').inTable('strategies')
      table.timestamp('created_at').defaultTo(this.fn.now())
    })
  }

  down () {
    this.drop('trades')
  }
}

module.exports = TradeSchema
