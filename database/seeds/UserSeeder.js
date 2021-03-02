'use strict'


const Database = use('Database')

class UserSeeder {
  async run () {
    await Database.table('users')
      .insert([{
        email: 'guetarni.walid@gmail.com',
        password: '@moure31',
        username: 'walid',
        date_of_birth: '1986-11-17',
        male: 1
      },
      {
        email: 'guetarni.hayate@gmail.com',
        password: '@moure40',
        username: 'ayat',
        date_of_birth: '1987-11-18',
        male: 0
      }
    ])
  }
}

module.exports = UserSeeder

