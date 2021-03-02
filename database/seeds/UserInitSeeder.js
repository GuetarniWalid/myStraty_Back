'use strict'

/*
|--------------------------------------------------------------------------
| UserInitSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Database = use('Database')

class UserInitSeeder {
  async run () {
    await Database.table('users')
      .insert({
        email: 'contact@mystraty.com',
        password: '@moure31',
        username: 'MyStraty',
        date_of_birth: '1986-11-17',
        male: 1
      })
  }
}

module.exports = UserInitSeeder
