// "use strict"

// const User = use("App/Models/User");
// const Factory = use("Factory");
// const Clean = use("App/Bots/Clean");
// const Exchange = use("App/Models/Exchange");
// const Strategy = use("App/Models/Strategy");
// const Env = use("Env");
// const Big = require('big.js')

// const { test, before, after } = use("Test/Suite")("Clean");

// let user;
// let exchange;
// before(async () => {
//   user = await Factory.model("App/Models/User").create();
//   exchange = await Factory.model("App/Models/Exchange").create({
//     user: user.toJSON(),
//   });
//   await Promise.all(
//     [1, 2, 3, 4].map(async (i) => {
//       await Factory.model("App/Models/Strategy").create({
//         exchange,
//         active: i === 4 ? false : true,
//       });
//     })
//   );
// });

// after(async () => {
//   //reset Database
//   const [
//     usersId,
//     exchangesId,
//     strategiesId,
//   ] = await Promise.all([
//     await User.ids(),
//     await Exchange.ids(),
//     await Strategy.ids(),
//   ]);


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


// test("get only active strategies for one user and their echange id", async ({
//   assert,
// }) => {
//   //prepare test environment
//   const clean = new Clean(user);
//   clean.user = user;
//   //
//   await clean.getActiveStrategies();

//   assert.strictEqual(
//     clean.strategies.length,
//     3,
//     "getActiveStrategies method: there must be 3 active strategies"
//   );
//   assert.strictEqual(
//     clean.exchangeId,
//     exchange.id,
//     "getActiveStrategies method: clean.exchangeId must be 1"
//   );
// });

// test("aggregate the amounts of all the strategies together", async ({
//   assert,
// }) => {
//   //prepare test environment
//   const clean = new Clean(user);
//   clean.user = user;
//   await clean.getActiveStrategies();
//   //
//   clean.getTotalAmountOfStrategies();

//   assert.deepEqual(
//     clean.strategiesAmount,
//     { BTC: 0.0014592, ETH: 6.6493362, USDT: 61.3639392 },
//     "getTotalAmountOfStrategies method: the amounts found do not match"
//   );
// });

// test("get wallet balance on Binance exchange", async ({ assert }) => {
//   //prepare test environment
//   const newExchange = await Exchange.find(exchange.id);
//   newExchange.private_key = Env.get("BINANCE_REAL_PRIVATE_KEY");
//   newExchange.public_key = Env.get("BINANCE_REAL_PUBLIC_KEY");
//   await newExchange.save();

//   const clean = new Clean(user);
//   clean.user = user;
//   //

//   await clean.getExchangeWalletAmount();

//   assert.isNumber(clean.binanceAmount.BTC, "BTC wallet amount on Binance");
//   assert.isNumber(clean.binanceAmount.ETH, "ETH wallet amount on Binance");
//   assert.isNumber(clean.binanceAmount.USDT, "USDT wallet amount on Binance");

//   //reset binance keys
//   const oldExchange = await Exchange.find(exchange.id);
//   oldExchange.private_key = Env.get("BINANCE_TEST_PRIVATE_KEY");
//   oldExchange.public_key = Env.get("BINANCE_TEST_PUBLIC_KEY");
//   await oldExchange.save();
// });

// test("verify if exchange has enough liquidity", async ({ assert }) => {
//   //prepare test environment
//   const clean = new Clean(user);
//   clean.user = user;
//   //

//   //prepare data for the first test
//   clean.strategiesAmount = { BTC: 0.0014592, ETH: 6.6493362, USDT: 61.3639392 };
//   clean.binanceAmount = { BTC: 0.0024144, ETH: 4.013934, USDT: 60.4775765 };
//   //
//   const enouhtLiquidityFirst = clean.exchangeHasEnoughLiquidity();
//   assert.isFalse(
//     enouhtLiquidityFirst,
//     "exchangeHasEnoughLiquidity method: must not be have enought liquidity"
//   );
//   assert.strictEqual(
//     clean.currencyWithNotEnoughLiquidity.length,
//     2,
//     "exchangeHasEnoughLiquidity method: must have 2 item"
//   );
//   assert.deepInclude(clean.currencyWithNotEnoughLiquidity, {
//     name: "ETH",
//     surplus: 2.6354022,
//   });
//   assert.deepInclude(clean.currencyWithNotEnoughLiquidity, {
//     name: "USDT",
//     surplus: 0.8863627,
//   });

//   //prepare data for the second test
//   clean.strategiesAmount = { BTC: 0.0014592, ETH: 6.6493362, USDT: 61.3639392 };
//   clean.binanceAmount = { BTC: 0.0024144, ETH: 7.013934, USDT: 63.4775765 };
//   //
//   const enouhtLiquiditySecond = clean.exchangeHasEnoughLiquidity();
//   assert.isTrue(
//     enouhtLiquiditySecond,
//     "exchangeHasEnoughLiquidity method: must be have enought liquidity"
//   );
// });

// test("determine the amount to substract if not enought liquidity", async ({
//   assert,
// }) => {
//   //prepare test environment
//   const clean = new Clean(user);
//   clean.user = user;

//   clean.currencyWithNotEnoughLiquidity = [
//     { name: "ETH", surplus: 2.6354022 },
//     { name: "USDT", surplus: 0.8863627 },
//   ];
//   clean.strategies = Array(3);
//   //

//   clean.determineAmountToSubstract();

//   assert.strictEqual(clean.amountToSubstract.length, 2, 'determineAmountToSubstract method: length of clean.amountToSubstract must be 2')
//   assert.deepInclude(clean.amountToSubstract, {
//     currency: "ETH",
//     size: 0.8784674,
//     nbStrat: 3,
//   });
//   assert.deepInclude(clean.amountToSubstract, {
//     currency: "USDT",
//     size: 0.2954543,
//     nbStrat: 3,
//   });
// });

// test("sort strategies by currency and increasing value for each currency in clean.currencyWithNotEnoughLiquidity", async ({
//   assert,
// }) => {
//   //prepare test environment
//   const clean = new Clean(user);
//   clean.user = user;

//   clean.currencyWithNotEnoughLiquidity = [
//     { name: "ETH", surplus: 2.6354022 },
//     { name: "USDT", surplus: 0.8863627 },
//   ];

//   let strategies = await Factory.model("App/Models/Strategy").makeMany(3)
//   strategies = strategies.map((strat, i) => {
//     strat.eth = new Big(strat.eth).minus(i / 10).toNumber()
//     strat.usdt = new Big(strat.usdt).plus(i / 10).toNumber()
//     return strat.toJSON()
//   })
//   clean.strategies = strategies
//   //

//   clean.sortStratByCurrencyGrowing()


//   assert.sameDeepOrderedMembers(clean.strategiesSorted.USDT, strategies, 'sortStratByCurrencyGrowing method: must ordered by currency usdt growing')
//   assert.notSameDeepOrderedMembers(clean.strategiesSorted.ETH, strategies, 'sortStratByCurrencyGrowing method: must ordered by currency eth growing')

// });

// test("substract the surplus amount for each strat", async ({
//   assert,
// }) => {
//   //prepare test environment
//   const clean = new Clean(user);
//   clean.user = user;

//   clean.amountToSubstract = [
//     { currency: 'ETH', size: 0.8784674, nbStrat: 3 },
//     { currency: 'USDT', size: 22.2954543, nbStrat: 3 }
//   ]

//   //get all strategy id active
//   let stratIds = await Strategy
//   .query()
//   .select('id')
//   .where('active', true)
//   .fetch()

//   stratIds = stratIds.toJSON()
//   const first = stratIds[0].id
//   const second = stratIds[1].id
//   const third = stratIds[2].id

//   clean.strategiesSorted = {
//     ETH: [
//       {
//         id: first,
//         strategy: 'STRAT_BTC_ETH_USD_LO_D_1',
//         frequency: 'daily',
//         title: 'BTC/ETH/USD LO',
//         exchange_id: 1,
//         active: 1,
//         position: '{"BTC":0,"ETH":1,"USDT":0}',
//         btc: 0.0004864,
//         eth: 2.0164454,
//         usdt: 20.6546464
//       },
//       {
//         id: second,
//         strategy: 'STRAT_BTC_ETH_USD_LO_D_1',
//         frequency: 'daily',
//         title: 'BTC/ETH/USD LO',
//         exchange_id: 1,
//         active: 1,
//         position: '{"BTC":0,"ETH":1,"USDT":0}',
//         btc: 0.0004864,
//         eth: 2.1164454,
//         usdt: 20.5546464
//       },
//       {
//         id: third,
//         strategy: 'STRAT_BTC_ETH_USD_LO_D_1',
//         frequency: 'daily',
//         title: 'BTC/ETH/USD LO',
//         exchange_id: 1,
//         active: 1,
//         position: '{"BTC":0,"ETH":1,"USDT":0}',
//         btc: 0.0004864,
//         eth: 2.2164454,
//         usdt: 20.4546464
//       }
//     ],
//     USDT: [
//       {
//         id: third,
//         strategy: 'STRAT_BTC_ETH_USD_LO_D_1',
//         frequency: 'daily',
//         title: 'BTC/ETH/USD LO',
//         exchange_id: 1,
//         active: 1,
//         position: '{"BTC":0,"ETH":1,"USDT":0}',
//         btc: 0.0004864,
//         eth: 2.2164454,
//         usdt: 20.4546464
//       },
//       {
//         id: second,
//         strategy: 'STRAT_BTC_ETH_USD_LO_D_1',
//         frequency: 'daily',
//         title: 'BTC/ETH/USD LO',
//         exchange_id: 1,
//         active: 1,
//         position: '{"BTC":0,"ETH":1,"USDT":0}',
//         btc: 0.0004864,
//         eth: 2.1164454,
//         usdt: 25.5546464
//       },
//       {
//         id: first,
//         strategy: 'STRAT_BTC_ETH_USD_LO_D_1',
//         frequency: 'daily',
//         title: 'BTC/ETH/USD LO',
//         exchange_id: 1,
//         active: 1,
//         position: '{"BTC":0,"ETH":1,"USDT":0}',
//         btc: 0.0004864,
//         eth: 2.0164454,
//         usdt: 30.6546464
//       }
//     ]
//   }
//   //

//   await clean.substractAmountByStrat()

//   let strategies = await Strategy.all()
//   strategies = strategies.toJSON()


//   assert.include(getStrategyWithId(first, strategies), {
//     eth: 1.137978,
//     btc: 0.0004864,
//     usdt: 7.4387881
//   }, "substractAmountByStrat method: the amount find is not correct")

//   assert.include(getStrategyWithId(second, strategies), {
//     eth: 1.237978,
//     btc: 0.0004864,
//     usdt: 2.3387881
//   }, "substractAmountByStrat method: the amount find is not correct")

//   assert.include(getStrategyWithId(third, strategies), {
//     eth: 1.337978,
//     btc: 0.0004864,
//     usdt: 0
//   }, "substractAmountByStrat method: the amount find is not correct")
// });

// test("check that all the methods work correctly together", async ({
//   assert,
// }) => {
//   //populate test data in database
//   const strategies = await Strategy.all()
//   await Promise.all(strategies.toJSON().map(async (strat, i) => {
//     const strategy = await Strategy.find(strat.id)
//     strategy.btc = 0.0004864 + i
//     strategy.eth = 2.2164454
//     strategy.usdt = 20.4546464 - i
//     await strategy.save()
//   }))
//   //

//   //prepare test environment
//   const clean = new Clean(user);
//   clean.user = user;
//   //

//   //get all strategy id active
//   let stratIds = await Strategy
//   .query()
//   .select('id')
//   .where('active', true)
//   .fetch()

//   stratIds = stratIds.toJSON()
//   const first = stratIds[0].id
//   const second = stratIds[1].id
//   const third = stratIds[2].id

//   await clean.start()

//   let strategiesCleaned = await Strategy.all()
//   strategiesCleaned = strategiesCleaned.toJSON()

//   assert.include(getStrategyWithId(first, strategiesCleaned), {
//     eth: 2.2164454,
//     btc: 0,
//     usdt: 3.716152
//   }, "start method: the amount find is not correct")

//   assert.include(getStrategyWithId(second, strategiesCleaned), {
//     eth: 2.2164454,
//     btc: 0.2299999,
//     usdt: 2.716152
//   }, "start method: the amount find is not correct")

//   assert.include(getStrategyWithId(third, strategiesCleaned), {
//     eth: 2.2164454,
//     btc: 1.2299999,
//     usdt: 1.716152
//   }, "start method: the amount find is not correct")
  
// });
  

// function getStrategyWithId(id, strategies) {
//   const [stratFiltered] = strategies.filter(strat => strat.id === id)
//   return stratFiltered
// }