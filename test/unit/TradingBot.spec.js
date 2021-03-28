// "use strict";
// const Factory = use("Factory");
// const TradingBot = use("App/Bots/TradingBot");
// const Trade = use("App/Models/Trade");
// const Exchange = use("App/Models/Exchange");
// const Strategy = use("App/Models/Strategy");
// const Subscription = use("App/Models/Subscription");
// const User = use("App/Models/User");
// const { test, before, beforeEach, afterEach, after } = use("Test/Suite")(
//   "TradingBot"
// );

// let user;
// let exchange;
// let strategy;
// let data;
// before(async () => {
//   user = await Factory.model("App/Models/User").make();
//   exchange = await Factory.model("App/Models/Exchange").make({user});

//   data = {
//     userId: user.id,
//     strat_btc: 0.0004864,
//     strat_eth: 2.2164454,
//     strat_usdt: 20.4546464,
//     NapoleonPosition: { BTC: 1, ETH: 0, USDT: 0 },
//     strategyPosition: { BTC: 1, ETH: 0, USDT: 0 },
//     ExchangeData: exchange,
//   };
// });

// beforeEach(async () => {
//   //create strategy database
//   strategy = await Factory.model("App/Models/Strategy").make({exchange});
//   await exchange.strategies().save(strategy);
//   data.strategyId = strategy.id;
// });

// afterEach(async () => {
//   //reset database
//   await Trade.truncate();
//   const strategy = await Strategy.find(data.strategyId);
//   if (strategy) await strategy.delete();
// });

// after(async () => {
//   //reset Database
//   const [
//     usersId,
//     subscriptionsId,
//     exchangesId,
//     strategiesId,
//   ] = await Promise.all([
//     await User.ids(),
//     await Subscription.ids(),
//     await Exchange.ids(),
//     await Strategy.ids(),
//   ]);


//   await Promise.all(
//     subscriptionsId.map(async (id) => {
//       const subscription = await Subscription.find(id);
//       await subscription.delete();
//     })
//   );

//   await Promise.all(
//     strategiesId.map(async (id) => {
//       const strategy = await Strategy.find(id);
//       await strategy.delete();
//     })
//   );

//   await Promise.all(
//     exchangesId.map(async (id) => {
//       const exchange = await Exchange.find(id);
//       await exchange.delete();
//     })
//   );

//   await Promise.all(
//     usersId.map(async (id) => {
//       const user = await User.find(id);
//       await user.delete();
//     })
//   );
// });

// test("compare Napoleon positions with strategy positions", ({ assert }) => {
//   const differentCombination = [
//     {
//       NapoleonPosition: { BTC: 1, ETH: 0, USDT: 0 },
//       strategyPosition: { BTC: 1, ETH: 0, USDT: 0 },
//       expectedResult: { BTC: 0, ETH: 0, USDT: 0 },
//     },
//     {
//       NapoleonPosition: { BTC: 1, ETH: 0, USDT: 0 },
//       strategyPosition: { BTC: 0, ETH: 1, USDT: 0 },
//       expectedResult: { BTC: 1, ETH: -1, USDT: 0 },
//     },
//     {
//       NapoleonPosition: { BTC: 0.5, ETH: 0, USDT: 0.5 },
//       strategyPosition: { BTC: 0, ETH: 1, USDT: 0 },
//       expectedResult: { BTC: 0.5, ETH: -1, USDT: 0.5 },
//     },
//   ];

//   const tradingBot = new TradingBot(data);

//   differentCombination.forEach((combination) => {
//     //prepare test environment
//     tradingBot.NapoleonPosition = combination.NapoleonPosition;
//     tradingBot.strategyPosition = combination.strategyPosition;
//     //
//     tradingBot.compareNewPositionWithOldPosition();

//     assert.deepEqual(
//       tradingBot.calculatedPosition,
//       combination.expectedResult,
//       `tradingBot.compareNewPositionWithOldPosition() calculate the bad result`
//     );
//   });
// });

// test("launch trading order for strategy long only", async ({ assert }) => {
//   const differentCombination = [
//     {
//       NapoleonPosition: { BTC: 1, ETH: 0, USDT: 0 },
//       strategyPosition: { BTC: 1, ETH: 0, USDT: 0 },
//       resultExpected: {
//         nbOfOrder: 0,
//       },
//     },
//     {
//       NapoleonPosition: { BTC: 1, ETH: 0, USDT: 0 },
//       strategyPosition: { BTC: 0, ETH: 1, USDT: 0 },
//       resultExpected: {
//         nbOfOrder: 1,
//         orders: [
//           {
//             symbol: "ETHBTC",
//             side: "SELL",
//             origQty: "2.216",
//           },
//         ],
//       },
//     },
//     {
//       NapoleonPosition: { BTC: 0.5, ETH: 0.5, USDT: 0 },
//       strategyPosition: { BTC: 1, ETH: 0, USDT: 0 },
//       resultExpected: {
//         order: true,
//         nbOfOrder: 1,
//         orders: [
//           {
//             symbol: "ETHBTC",
//             side: "BUY",
//             cummulativeQuoteQty: "0.0002",
//           },
//         ],
//       },
//     },
//     {
//       NapoleonPosition: { BTC: 0.5, ETH: 0, USDT: 0.5 },
//       strategyPosition: { BTC: 0, ETH: 1, USDT: 0 },
//       resultExpected: {
//         order: true,
//         nbOfOrder: 2,
//         orders: [
//           {
//             symbol: "ETHBTC",
//             side: "SELL",
//             origQty: "1.108",
//           },
//           {
//             symbol: "ETHUSDT",
//             side: "SELL",
//             origQty: "1.10822",
//           },
//         ],
//       },
//     },
//   ];

//   const promisesOfAllResult = differentCombination.map(async (combination) => {
//     //prepare tradingBot test environment
//     const tradingBot = new TradingBot(data);
//     tradingBot.NapoleonPosition = combination.NapoleonPosition;
//     tradingBot.strategyPosition = combination.strategyPosition;
//     await tradingBot.instantUsefulClass();
//     await tradingBot.compareNewPositionWithOldPosition();
//     //

//     const orders = await tradingBot.tradingOrderForLongOnly();

//     const result = {
//       orders: orders ?? [],
//       expected: combination.resultExpected,
//     };
//     return result;
//   });

//   const results = await Promise.all(promisesOfAllResult);
//   results.forEach((result) => {
//     assert.strictEqual(
//       result.orders.length,
//       result.expected.nbOfOrder,
//       "tradingOrderForLongOnly method: there is a wrong number of orders placed"
//     );

//     result.orders.forEach((order) => {
//       const [expected] = result.expected.orders.filter(
//         (expectedOrder) => expectedOrder.symbol === order.symbol
//       );
//       assert.strictEqual(
//         order.symbol,
//         expected.symbol,
//         "tradingOrderForLongOnly method: there is a wrong symbol for the order"
//       );
//       assert.strictEqual(
//         order.side,
//         expected.side,
//         "tradingOrderForLongOnly method: there is a wrong side for the order"
//       );
//       if (expected.hasOwnProperty("origQty"))
//         assert.include(
//           order.origQty,
//           expected.origQty,
//           "tradingOrderForLongOnly method: there is a wrong quantity for the order"
//         );
//       else
//         assert.include(
//           order.cummulativeQuoteQty,
//           expected.cummulativeQuoteQty,
//           "tradingOrderForLongOnly method: there is a wrong quantity for the order"
//         );
//     });
//   });
// });

// test("save trade order data", async ({ assert }) => {
//   const order = {
//     symbol: "ETHUSDT",
//     origQty: "1.10822545456456",
//     executedQty: "1.1161616466",
//     cummulativeQuoteQty: "0.0012545464684846",
//     side: "SELL",
//   };

//   //prepare test environment
//   const tradingBot = new TradingBot(data);
//   await tradingBot.instantUsefulClass();
//   //

//   await tradingBot.saveNewData(order);
//   const trade = await Trade.findBy("pair", order.symbol);

//   assert.strictEqual(
//     trade.pair,
//     order.symbol,
//     "saveNewData method: bad pair save"
//   );
//   assert.strictEqual(
//     trade.action,
//     order.side,
//     "saveNewData method: bad action save"
//   );
//   assert.include(
//     order.executedQty,
//     String(trade.amount),
//     "saveNewData method: bad amount save"
//   );
//   assert.strictEqual(
//     trade.strategy_id,
//     tradingBot.strategyId,
//     "saveNewData method: bad strategy id save"
//   );
// });

// test("save strategy order data", async ({ assert }) => {
//   const test = {
//     order: {
//       symbol: "ETHUSDT",
//       origQty: "1.10822545456456",
//       executedQty: "1.10822545456456",
//       cummulativeQuoteQty: "1000.1412545464684846",
//       side: "SELL",
//     },
//     NapoleonPosition: { BTC: 0, ETH: 0.5, USDT: 0.5 },
//     expected: {
//       eth: 1.1082199,
//       btc: 0.0004864,
//       usdt: 1020.5959009,
//       position: '{"BTC": 0, "ETH": 0.5, "USDT": 0.5}',
//     },
//   };

//   //prepare test environment
//   const tradingBot = new TradingBot(data);
//   tradingBot.NapoleonPosition = test.NapoleonPosition;
//   await tradingBot.instantUsefulClass();
//   //

//   await tradingBot.saveNewData(test.order);
//   const strategyId = tradingBot.strategy.id;

//   const strategy = await Strategy.find(strategyId);

//   assert.strictEqual(
//     strategy.position,
//     test.expected.position,
//     "saveNewData method: the value attempted is wrong"
//   );
//   assert.strictEqual(
//     strategy.btc,
//     test.expected.btc,
//     "saveNewData method: the value of btc attempted is wrong"
//   );
//   assert.strictEqual(
//     strategy.eth,
//     test.expected.eth,
//     "saveNewData method: the value of eth attempted is wrong"
//   );
//   assert.strictEqual(
//     strategy.usdt,
//     test.expected.usdt,
//     `saveNewData method: the value of usdt attempted is wrong for the pair ${test.order.symbol}`
//   );
// });

// test("all the methods work correctly together to place an order", async ({
//   assert,
// }) => {
//   //prepare test environment
//   const tradingBot = new TradingBot(data);
//   tradingBot.NapoleonPosition = { BTC: 0.5, ETH: 0, USDT: 0.5 };
//   tradingBot.strategyPosition = { BTC: 0, ETH: 1, USDT: 0 };
//   //

//   await tradingBot.startLogic();
//   const strategyId = tradingBot.strategy.id;

//   const strategy = await Strategy.find(strategyId);
//   let trades = await Trade.all();
//   trades = trades.toJSON();

//   //trade
//   assert.strictEqual(
//     trades.length,
//     2,
//     "there must be 2 raw in trades database"
//   );
//   //select one of the pairs
//   const trade = trades.find((trade) => trade.pair === "ETHBTC");
//   assert.strictEqual(
//     trade.pair,
//     "ETHBTC",
//     "startLogic method: bad trade pair save"
//   );
//   assert.strictEqual(
//     trade.action,
//     "SELL",
//     "startLogic method: bad trade action save"
//   );
//   assert.strictEqual(
//     trade.strategy_id,
//     strategyId,
//     "startLogic method: bad trade strategy id save"
//   );

//   //strategy
//   assert.strictEqual(
//     strategy.position,
//     '{"BTC": 0.5, "ETH": 0, "USDT": 0.5}',
//     "startLogic method: the value in strategy attempted is wrong"
//   );
// });

// test("deactive user's strategy when his subscription is expire", async ({
//   assert,
// }) => {
//   //reset database
//   const oldStrat = await Strategy.first();
//   await oldStrat.delete();
//   //

//   const users = await Factory.model("App/Models/User").createMany(5);
//   await Promise.all(
//     users.map(async (user) => {
//       const subscription = await Factory.model("App/Models/Subscription").make(
//         {user: user.toJSON()}
//       );
//       const exchange = await Factory.model("App/Models/Exchange").make(
//        {user: user.toJSON()}
//       );
//       const strategy = await Factory.model("App/Models/Strategy").make(
//         {exchange: exchange.toJSON()}
//       );
//       await user.subscription().save(subscription);
//       await user.exchanges().save(exchange);
//       await exchange.strategies().save(strategy);
//     })
//   );

//   await TradingBot.deactivateStrategy();

//   let strategies = await Strategy.all();
//   strategies = strategies.toJSON();

//   const strategyNotActive = strategies.filter(
//     (strategy) => strategy.active === 0
//   );
//   const strategyWithoutCurrencyUnderManagement = strategies.filter(
//     (strategy) =>
//       strategy.btc === 0 && strategy.eth === 0 && strategy.usdt === 0
//   );

//   assert.strictEqual(
//     strategyNotActive.length,
//     3,
//     `deactivateStrategy method: bad number of strategies deactivate`
//   );
//   assert.strictEqual(
//     strategyWithoutCurrencyUnderManagement.length,
//     3,
//     `deactivateStrategy method: bad number of strategies withouth currency under management`
//   );
// });
