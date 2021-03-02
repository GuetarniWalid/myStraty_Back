'use strict'


const Database = use('Database')

class StrategySeeder {
  async run () {
    await Database.table('strategies')
    .insert({
      strategy: 'STRAT_BTC_ETH_USD_LO_D_1',
      frequency: 'daily',
      title: 'BTC/ETH/USD LO',
      exchange_id: 1,
      active: 0,
      position: JSON.stringify({"BTC":0,"ETH":1,"USDT":0}),
      btc: 0.7554,
      eth: 14.7854785214,
      usdt: 12.9844
    })
    await Database.table('strategies')
    .insert({
      strategy: 'STRAT_BTC_ETH_USD_AR_D_1',
      frequency: 'daily',
      title: 'BTC/ETH/USD AR',
      exchange_id: 1,
      active: 0,
      position: JSON.stringify({"BTC":0,"ETH":0,"USDT":0}),
      btc: 0.7554,
      eth: 14.7854785214,
      usdt: 12.9844
    })
  }
}

module.exports = StrategySeeder
