'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NapoleonSchema extends Schema {
  up () {
    this.create('napoleons', (table) => {
      table.increments()
      table.string('strategy', 100).notNullable()
      table.json('position').notNullable()
      table.string('title', 50)
      table.string('frequency', 50)
      table.timestamp('updated_at').notNullable()
    })
  }

  down () {
    this.drop('napoleons')
  }
}

module.exports = NapoleonSchema
