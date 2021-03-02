'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NapoleonAddActiveSchema extends Schema {
  up () {
    this.table('napoleons', (table) => {
      table.boolean('active').defaultTo(true).notNullable()
    })
  }

  down () {
    this.table('napoleons', (table) => {
      table.dropColumn('active')
    })
  }
}

module.exports = NapoleonAddActiveSchema
