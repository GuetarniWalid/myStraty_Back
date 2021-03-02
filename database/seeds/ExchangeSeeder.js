'use strict'


const Database = use('Database')

class ExchangeSeeder {
  async run () {
    await Database.table('exchanges')
    .insert({
      name: 'binance',
      private_key: 'XSWMxjqRA3jlBgXizvpCT95NXeWXGnQ6MuJ7PkPXtRYDKjXgdUbOTZ6cz9N3MtZc',
      public_key: 'RtBGJTJdfc9vSp9Qwp0TV1Ix30UMtd5FYabTupVkUztw7nMBAotgqHYcURWIfPya',
    })
  }
}

module.exports = ExchangeSeeder
