// "use strict";
// const Factory = use("Factory");
// const BinanceBot = use("App/Bots/BinanceBot");

// const { test, before } = use("Test/Suite")("BinanceBot");

// let user;
// let exchange;
// let binance;
// before(async () => {
//   user = await Factory.model("App/Models/User").make();
//   exchange = await Factory.model("App/Models/Exchange").make({user});
//   binance = new BinanceBot(exchange.toJSON());
// });


// test("binance test keys work correctly", async ({ assert }) => {
//   const testSucceeded = await binance.test();
//   assert.isTrue(testSucceeded);
// });

// test("form a correct pair with two currency", async ({ assert }) => {
//   const differentCurrencyCombination = [
//     ["ETH", "BTC", "ETHBTC"],
//     ["BTC", "ETH", "ETHBTC"],
//     ["ETH", "USDT", "ETHUSDT"],
//     ["USDT", "ETH", "ETHUSDT"],
//     ["BTC", "USDT", "BTCUSDT"],
//     ["USDT", "BTC", "BTCUSDT"],
//   ];

//   differentCurrencyCombination.forEach((combination) => {
//     const pair = binance.pair(combination[0], combination[1]);
//     assert.strictEqual(
//       pair,
//       combination[2],
//       `from binance.pair(${combination[0]}, ${combination[1]})`
//     );
//   });
// });

// test("return the correct side according that the base currency win or loss in value", async ({
//   assert,
// }) => {
//   const differentCurrencyCombination = [
//     ["ETH", "BTC", "BUY"],
//     ["BTC", "ETH", "SELL"],
//     ["ETH", "USDT", "BUY"],
//     ["USDT", "ETH", "SELL"],
//     ["BTC", "USDT", "BUY"],
//     ["USDT", "BTC", "SELL"],
//   ];

//   differentCurrencyCombination.forEach((combination) => {
//     const side = binance.side(combination[0], combination[1]);
//     assert.strictEqual(
//       combination[2],
//       side,
//       `from binance.side(${combination[0]}, ${combination[1]})`
//     );
//   });
// });

// test("determine the type of quantity to insert in url for binance request according that the base currency win or loss in value", async ({
//   assert,
// }) => {
//   const differentCombination = [
//     ["ETHBTC", "BTC", "quoteOrderQty"],
//     ["ETHBTC", "ETH", "quantity"],
//     ["ETHUSDT", "USDT", "quoteOrderQty"],
//     ["ETHUSDT", "ETH", "quantity"],
//     ["BTCUSDT", "USDT", "quoteOrderQty"],
//     ["BTCUSDT", "BTC", "quantity"],
//   ];

//   differentCombination.forEach((combination) => {
//     const typeOfQuantity = binance.determineTypeOfQuantity(
//       combination[0],
//       combination[1]
//     );
//     assert.strictEqual(
//       combination[2],
//       typeOfQuantity,
//       `from binance.determineTypeOfQuantity(${combination[0]}, ${combination[1]})`
//     );
//   });
// });

// test("format the order quantity", async ({ assert }) => {
//   const longNumber = 17.165456464644845;
//   const differentCombination = [
//     [longNumber, "ETHBTC", "BTC", 17.165456],
//     [longNumber, "ETHBTC", "ETH", 17.165],
//     [longNumber, "ETHUSDT", "USDT", 17.16],
//     [longNumber, "ETHUSDT", "ETH", 17.16545],
//     [longNumber, "BTCUSDT", "USDT", 17.16],
//     [longNumber, "BTCUSDT", "BTC", 17.165456],
//   ];

//   differentCombination.forEach((combination) => {
//     const qtyFormatted = binance.formatQuantity(
//       combination[0],
//       combination[1],
//       combination[2]
//     );
//     assert.strictEqual(
//       combination[3],
//       qtyFormatted,
//       `from binance.formatQuantity(${combination[0]}, ${combination[1]}, ${combination[2]})`
//     );
//   });
// });

// test("converted from one currency to another", async ({ assert }) => {
//   const currencies = {
//     BTC: 1.116545414351846846,
//     ETH: 94.15646516164464,
//     USDT: 11124.15456164446464,
//   };
//   const binance = new BinanceBot(exchange.toJSON(), currencies);

//   const differentCombination = [
//     ["ETH", "BTC", "below"],
//     ["BTC", "ETH", "above"],
//     ["ETH", "USDT", "above"],
//     ["USDT", "ETH", "below"],
//     ["BTC", "USDT", "above"],
//     ["USDT", "BTC", "below"],
//   ];

//   //store all promise of value converted ​​in an array
//   const promisesOfAllValueConverted = differentCombination.map(
//     async (combination) => {
//       const valueConverted = await binance.convert(
//         combination[0],
//         combination[1]
//       );
//       return valueConverted;
//     }
//   );

//   //all promises resolved are store in an array "allValueConverted"
//   const allValueConverted = await Promise.all(promisesOfAllValueConverted);

//   //verify all assertions
//   allValueConverted.forEach((valueConverted, i) => {
//     if (differentCombination[i][2] === "above")
//       assert.isAbove(
//         valueConverted,
//         currencies[differentCombination[i][0]],
//         `from binance.convert(${differentCombination[i][0]}, ${differentCombination[i][1]})`
//       );
//     else
//       assert.isBelow(
//         valueConverted,
//         currencies[differentCombination[i][0]],
//         `from binance.convert(${differentCombination[i][0]}, ${differentCombination[i][1]})`
//       );
//     assert.isNumber(valueConverted, "the value must be a number");
//   });
// });

// test("launch a trade on binance", async ({ assert }) => {
//   const currencies = {
//     BTC: 0.0028648414615156,
//     ETH: 2.2164454546414554545,
//     USDT: 20.4546464644415456,
//   };
//   const binance = new BinanceBot(exchange.toJSON(), currencies);

//   const combinations = [
//     {
//       currencyWin: "ETH",
//       currencyLoss: "BTC",
//       percent: 1,
//       expected: {
//         symbol: "ETHBTC",
//         type: "MARKET",
//         side: "BUY",
//         cummulativeQuoteQty: "0.0028",
//         lengthAfterDot: 4,
//       },
//     },
//     {
//       currencyWin: "ETH",
//       currencyLoss: "BTC",
//       percent: 0.5,
//       expected: {
//         symbol: "ETHBTC",
//         type: "MARKET",
//         side: "BUY",
//         cummulativeQuoteQty: "0.0014",
//       },
//     },
//     {
//       currencyWin: "BTC",
//       currencyLoss: "ETH",
//       percent: 1,
//       expected: {
//         symbol: "ETHBTC",
//         type: "MARKET",
//         side: "SELL",
//         origQty: "2.216",
//       },
//     },
//     {
//       currencyWin: "BTC",
//       currencyLoss: "ETH",
//       percent: 0.5,
//       expected: {
//         symbol: "ETHBTC",
//         type: "MARKET",
//         side: "SELL",
//         origQty: "1.108",
//       },
//     },
//     {
//       currencyWin: "USDT",
//       currencyLoss: "ETH",
//       percent: 1,
//       expected: {
//         symbol: "ETHUSDT",
//         type: "MARKET",
//         side: "SELL",
//         origQty: "2.21644",
//       },
//     },
//     {
//       currencyWin: "USDT",
//       currencyLoss: "ETH",
//       percent: 0.5,
//       expected: {
//         symbol: "ETHUSDT",
//         type: "MARKET",
//         side: "SELL",
//         origQty: "1.10822",
//       },
//     },
//     {
//       currencyWin: "USDT",
//       currencyLoss: "BTC",
//       percent: 1,
//       expected: {
//         symbol: "BTCUSDT",
//         type: "MARKET",
//         side: "SELL",
//         origQty: "0.002864",
//       },
//     },
//     {
//       currencyWin: "USDT",
//       currencyLoss: "BTC",
//       percent: 0.5,
//       expected: {
//         symbol: "BTCUSDT",
//         type: "MARKET",
//         side: "SELL",
//         origQty: "0.001432",
//       },
//     },
//   ];

//   const promisesOfAllOrder = combinations.map(async (combination) => {
//     const order = await binance.fireSpotTrade(
//       combination.currencyWin,
//       combination.currencyLoss,
//       combination.percent
//     );

//     assert.containsAllKeys(
//       order,
//       ["symbol", "origQty", "executedQty", "cummulativeQuoteQty", "side"],
//       `binance.fireSpotTrade(${combination.currencyWin}, ${combination.currencyLoss}, ${combination.percent}), all keys are required in the returned value`
//     );
//     assert.strictEqual(order.symbol, combination.expected.symbol);
//     assert.strictEqual(order.type, combination.expected.type);
//     assert.strictEqual(order.side, combination.expected.side);
//     if (combination.expected.hasOwnProperty("origQty"))
//       assert.include(order.origQty, combination.expected.origQty, `fireSpotTrade method: amount doesn't correspond for the pair ${order.symbol} and side ${order.side}`);
//     else
//       assert.include(
//         order.cummulativeQuoteQty,
//         combination.expected.cummulativeQuoteQty,
//         `fireSpotTrade method: amount doesn't correspond for the pair ${order.symbol} and side ${order.side}`
//       );
//   });

//   await Promise.all(promisesOfAllOrder);
// });
