"use strict";

const Database = use("Database");

class NapoleonSeeder {
  async run() {
    await Database.table("napoleons").insert({
      position: JSON.stringify({ BTC: 0.5, ETH: 0, USDT: 0.5 }),
      strategy: "STRAT_BTC_ETH_USD_LO_D_1",
      title: "BTC/ETH/USD LO",
      frequency: 'daily',
      updated_at: Database.fn.now(),
    });
    await Database.table("napoleons").insert({
      position: JSON.stringify({ BTC: 0, ETH: 0, USDT: 1 }),
      strategy: "STRAT_BTC_ETH_USD_D_1",
      title: "BTC/ETH/USD AR",
      frequency: 'daily',
      updated_at: Database.fn.now(),
      active: false
    });
  }
}

module.exports = NapoleonSeeder;
