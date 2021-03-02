"use strict";

const Database = use("Database");

class TradeSeeder {
  async run() {
    await Database.table("trades").insert({
      pair: "BTCUSDT",
      action: "SELL",
      amount: 0.755400002002716,
      strategy_id: 1,
    });

    await Database.table("trades").insert({
      pair: "ETHBTC",
      action: "BUY",
      amount: 1.246654629707336,
      strategy_id: 1,
    });

    await Database.table("trades").insert({
      pair: "BTCUSDT",
      action: "SELL",
      amount: 12456.154296875000000,
      strategy_id: 1,
    });

    await Database.table("trades").insert({
      pair: "ETHUSDT",
      action: "SELL",
      amount: 12.154646873474121,
      strategy_id: 1,
    });

    await Database.table("trades").insert({
      pair: "ETHBTC",
      action: "BUY",
      amount: 15.154545783996582,
      strategy_id: 2,
    });

    await Database.table("trades").insert({
      pair: "ETHUSDT",
      action: "BUY",
      amount: 15.215000152587890,
      strategy_id: 2,
    });

    await Database.table("trades").insert({
      pair: "BTCUSDT",
      action: "BUY",
      amount: 2.000000000000000,
      strategy_id: 2,
    });
  }
}

module.exports = TradeSeeder;
