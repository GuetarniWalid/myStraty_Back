'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SettingsSchema extends Schema {
  up () {
    this.create('settings', (table) => {
      table.increments()
      table.boolean('send_mail').defaultTo(1)
      table.time('mail_time').nullable().defaultTo('09:00:00')
      if(process.env.NODE_ENV === 'test') table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      else table.integer('user_id').unsigned().references('id').inTable('users')
    })
  }

  down () {
    this.drop('settings')
  }
}

module.exports = SettingsSchema
