'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('username', 80).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
      table.date('date_of_birth').nullable()
      table.boolean('male').defaultTo(1).notNullable()
      table.boolean('active').defaultTo(0).notNullable()
      table.timestamps(false, true)
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
