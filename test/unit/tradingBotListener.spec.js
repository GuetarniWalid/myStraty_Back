"use strict";

const Factory = use("Factory");
const moment = require("moment");
const Strategy = use("App/Models/Strategy");
const Trade = use("App/Models/Trade");
const TradingBotListener = use("App/Listeners/TradingBotListener");

const { test, before } = use("Test/Suite")("TradingBotListener");

before(async () => {
  const users = await Factory.model("App/Models/User").createMany(5);
  await Promise.all(
    users.map(async (user) => {
      const userFormat = user.toJSON();
      let date_end_subscription;
      switch (userFormat.id) {
        case 1:
          date_end_subscription = moment()
            .subtract(3, "days")
            .format("YYYY-MM-DD");
          break;
        case 2:
          date_end_subscription = moment().format("YYYY-MM-DD");
          break;
        case 3:
          date_end_subscription = moment().add(3, "days").format("YYYY-MM-DD");
          break;
        case 4:
          date_end_subscription = moment().add(4, "days").format("YYYY-MM-DD");
          break;
        case 5:
          date_end_subscription = moment()
            .add(1, "months")
            .format("YYYY-MM-DD");
      }
      await Factory.model("App/Models/Subscription").create({
        user: user.toJSON(),
        date_end_subscription,
      });

      const exchange = await Factory.model("App/Models/Exchange").create(
        userFormat
      );
      const strategy = await Factory.model("App/Models/Strategy").create({
        exchange: exchange.toJSON(),
      });
      await Factory.model("App/Models/Asset").create(strategy.toJSON());
    })
  );
  await Factory.model("App/Models/Napoleon").create();
});

test("verify that users with invalid subscription are deactivate", async ({
  assert,
}) => {
    //launch the method to test
    await TradingBotListener.getAllUser();

  
  let strategies = await Strategy.all();
  strategies = strategies.toJSON();

  const strategyNotActive = strategies.filter(
    (strategy) => strategy.active === 0
  );
  const strategyWithoutCurrencyUnderManagement = strategies.filter(
    (strategy) =>
      strategy.btc === 0 && strategy.eth === 0 && strategy.usdt === 0
  );

  //get trades for deactivation
  let trades = await Trade.all();
  trades = trades.toJSON();

  assert.strictEqual(
    strategyNotActive.length,
    3,
    `deactivateStrategy method: bad number of strategies deactivate`
  );
  assert.strictEqual(
    strategyWithoutCurrencyUnderManagement.length,
    3,
    `deactivateStrategy method: bad number of strategies withouth currency under management`
  );
}).timeout(0)

test("verify orders are launched correctly", async ({
  assert,
}) => {
  let strategies = await Strategy
    .query()
    .where('active', true)
    .with('trades')
    .fetch()
  strategies = strategies.toJSON()

  const trades = [];
  strategies.forEach((strategy) => {
    strategy.trades.forEach(trade => {
      trades.push(trade)
    })
  })
  
  assert.strictEqual(trades.length, 4, "the number of trades expected is not correct")
  
});
