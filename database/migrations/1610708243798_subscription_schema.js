'use strict'


/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SubscriptionSchema extends Schema {
  up () {
    this.create('subscriptions', (table) => {
      table.increments()
      if(process.env.NODE_ENV === 'test') table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      else table.integer('user_id').unsigned().references('id').inTable('users')
      table.boolean('tester').defaultTo(true).notNullable()
      table.date('date_end_subscription').notNullable()
      table.string('type', 50).nullable()
      table.string('customerId', 100).nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('subscriptions')
  }
}

module.exports = SubscriptionSchema
