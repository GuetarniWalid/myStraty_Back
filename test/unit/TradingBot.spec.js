"use strict";
const Factory = use("Factory");
const TradingBot = use("App/Bots/TradingBot");
const Trade = use("App/Models/Trade");
const Exchange = use("App/Models/Exchange");
const Strategy = use("App/Models/Strategy");
const User = use("App/Models/User");
const moment = require('moment')

const { test, before, beforeEach, afterEach, after } = use("Test/Suite")("TradingBot");

let user;
let exchange;
let strategy;
let data;
before(async () => {
  user = await Factory.model("App/Models/User").make();
  exchange = await Factory.model("App/Models/Exchange").make({ user });

  data = {
    userId: user.id,
    newPositions: { BTC: 1, ETH: 0, USDT: 0 },
    ExchangeData: exchange,
  };
});

beforeEach(async () => {
  //create strategy database
  strategy = await Factory.model("App/Models/Strategy").make({ exchange });
  await exchange.strategies().save(strategy);
  data.strategyId = strategy.id;
});

afterEach(async () => {
  //reset database
  const strategy = await Strategy.find(data.strategyId);
  if (strategy) await strategy.delete();
});

after(async () => {
  //reset Database
  let ids = await User.ids();

  await Promise.all(
    ids.map(async (id) => {
      const user = await User.find(id);
      await user.delete();
    })
  );

  const exchange = await Exchange.first();
  await exchange.delete();
});

test("compare Napoleon positions with strategy positions", ({ assert }) => {
  const differentCombination = [
    {
      newPositions: { BTC: 1, ETH: 0, USDT: 0 },
      strategyPosition: { BTC: 1, ETH: 0, USDT: 0 },
      expectedResult: { BTC: 0, ETH: 0, USDT: 0 },
    },
    {
      newPositions: { BTC: 1, ETH: 0, USDT: 0 },
      strategyPosition: { BTC: 0, ETH: 1, USDT: 0 },
      expectedResult: { BTC: 1, ETH: -1, USDT: 0 },
    },
    {
      newPositions: { BTC: 0.5, ETH: 0, USDT: 0.5 },
      strategyPosition: { BTC: 0, ETH: 1, USDT: 0 },
      expectedResult: { BTC: 0.5, ETH: -1, USDT: 0.5 },
    },
  ];

  const tradingBot = new TradingBot(data);

  differentCombination.forEach((combination) => {
    //prepare test environment
    tradingBot.newPositions = combination.newPositions;
    tradingBot.strategyPosition = combination.strategyPosition;
    
    tradingBot.compareNewPositionWithOldPosition();

    assert.deepEqual(
      tradingBot.calculatedPosition,
      combination.expectedResult,
      `tradingBot.compareNewPositionWithOldPosition() calculate the bad result`
    );
  });
});

test("launch trading order for strategy long only", async ({ assert }) => {
  const differentCombination = [
    {
      newPositions: { BTC: 1, ETH: 0, USDT: 0 },
      strategyPosition: { BTC: 1, ETH: 0, USDT: 0 },
      resultExpected: {
        nbOfOrder: 0,
      },
    },
    {
      newPositions: { BTC: 1, ETH: 0, USDT: 0 },
      strategyPosition: { BTC: 0, ETH: 1, USDT: 0 },
      resultExpected: {
        nbOfOrder: 1,
        orders: [
          {
            symbol: "ETHBTC",
            side: "SELL",
            origQty: "2.216",
          },
        ],
      },
    },
    {
      newPositions: { BTC: 0.5, ETH: 0.5, USDT: 0 },
      strategyPosition: { BTC: 0, ETH: 1, USDT: 0 },
      resultExpected: {
        order: true,
        nbOfOrder: 1,
        orders: [
          {
            symbol: "ETHBTC",
            side: "SELL",
            origQty: "1.108",
          },
        ],
      },
    },
    {
      newPositions: { BTC: 0.5, ETH: 0, USDT: 0.5 },
      strategyPosition: { BTC: 0, ETH: 1, USDT: 0 },
      resultExpected: {
        order: true,
        nbOfOrder: 2,
        orders: [
          {
            symbol: "ETHBTC",
            side: "SELL",
            origQty: "1.108",
          },
          {
            symbol: "ETHUSDT",
            side: "SELL",
            origQty: "1.10822",
          },
        ],
      },
    },
  ];

  const promisesOfAllResult = differentCombination.map(async (combination) => {
    //prepare tradingBot test environment
    const tradingBot = new TradingBot(data);
    tradingBot.newPositions = combination.newPositions;
    tradingBot.strategyPosition = combination.strategyPosition;
    await tradingBot.instantUsefulClass();
    tradingBot.compareNewPositionWithOldPosition();
    

    const orders = await tradingBot.tradingOrderForLongOnly();

    const result = {
      orders: orders ?? [],
      expected: combination.resultExpected,
    };
    return result;
  });

  const results = await Promise.all(promisesOfAllResult);
  results.forEach((result) => {
    assert.strictEqual(
      result.orders.length,
      result.expected.nbOfOrder,
      "tradingOrderForLongOnly method: there is a wrong number of orders placed"
    );

    result.orders.forEach((order) => {
      const [expected] = result.expected.orders.filter(
        (expectedOrder) => expectedOrder.symbol === order.symbol
      );
      assert.strictEqual(
        order.symbol,
        expected.symbol,
        "tradingOrderForLongOnly method: there is a wrong symbol for the order"
      );
      assert.strictEqual(
        order.side,
        expected.side,
        "tradingOrderForLongOnly method: there is a wrong side for the order"
      );
      if (expected.hasOwnProperty("origQty"))
        assert.include(
          order.origQty,
          expected.origQty,
          "tradingOrderForLongOnly method: there is a wrong quantity for the order"
        );
      else
        assert.include(
          order.cummulativeQuoteQty,
          expected.cummulativeQuoteQty,
          "tradingOrderForLongOnly method: there is a wrong quantity for the order"
        );
    });
  });
});

test("save trade order data", async ({ assert }) => {
  const order = {
    symbol: "ETHUSDT",
    origQty: "1.10822545456456",
    executedQty: "1.1161616466",
    cummulativeQuoteQty: "0.0012545464684846",
    side: "SELL",
  };

  // prepare test environment
  const tradingBot = new TradingBot(data);
  await tradingBot.instantUsefulClass();
  

  await tradingBot.saveNewData(order);
  const trade = await Trade.findBy("pair", order.symbol);

  assert.strictEqual(
    trade.pair,
    order.symbol,
    "saveNewData method: bad pair save"
  );
  assert.strictEqual(
    trade.action,
    order.side,
    "saveNewData method: bad action save"
  );
  assert.include(
    order.executedQty,
    String(trade.amount),
    "saveNewData method: bad amount save"
  );
  assert.strictEqual(
    trade.strategy_id,
    tradingBot.strategyId,
    "saveNewData method: bad strategy id save"
  );
});

test("save strategy order data", async ({ assert }) => {
  const test = {
    order: {
      symbol: "ETHUSDT",
      origQty: "1.10822545456456",
      executedQty: "1.10822545456456",
      cummulativeQuoteQty: "1000.1412545464684846",
      side: "SELL",
    },
    newPositions: { BTC: 0, ETH: 0.5, USDT: 0.5 },
    expected: {
      eth: 1.1082199,
      btc: 0.0004864,
      usdt: 1020.5959009,
      position: '{"BTC": 0, "ETH": 0.5, "USDT": 0.5}',
    },
  };

  //prepare test environment
  const tradingBot = new TradingBot(data);
  tradingBot.newPositions = test.newPositions;
  await tradingBot.instantUsefulClass();
  //

  await tradingBot.saveNewData(test.order);
  const strategyId = tradingBot.strategy.id;

  const strategy = await Strategy.find(strategyId);

  assert.strictEqual(
    strategy.position,
    test.expected.position,
    "saveNewData method: the value attempted is wrong"
  );
  assert.strictEqual(
    strategy.btc,
    test.expected.btc,
    "saveNewData method: the value of btc attempted is wrong"
  );
  assert.strictEqual(
    strategy.eth,
    test.expected.eth,
    "saveNewData method: the value of eth attempted is wrong"
  );
  assert.strictEqual(
    strategy.usdt,
    test.expected.usdt,
    `saveNewData method: the value of usdt attempted is wrong for the pair ${test.order.symbol}`
  );
});

test("all the methods work correctly together to place an order", async ({
  assert,
}) => {
  //prepare test environment
  const tradingBot = new TradingBot(data);
  tradingBot.newPositions = { BTC: 0.5, ETH: 0, USDT: 0.5 };
  tradingBot.strategyPosition = { BTC: 0, ETH: 1, USDT: 0 };
  //

  await tradingBot.startLogic();
  const strategyId = tradingBot.strategy.id;

  const strategy = await Strategy.find(strategyId);
  let trades = await Trade.all();
  trades = trades.toJSON();

  //trade
  assert.strictEqual(
    trades.length,
    2,
    "there must be 2 raw in trades database"
  );
  //select one of the pairs
  const trade = trades.find((trade) => trade.pair === "ETHBTC");
  assert.strictEqual(
    trade.pair,
    "ETHBTC",
    "startLogic method: bad trade pair save"
  );
  assert.strictEqual(
    trade.action,
    "SELL",
    "startLogic method: bad trade action save"
  );
  assert.strictEqual(
    trade.strategy_id,
    strategyId,
    "startLogic method: bad trade strategy id save"
  );

  //strategy
  assert.strictEqual(
    strategy.position,
    '{"BTC": 0.5, "ETH": 0, "USDT": 0.5}',
    "startLogic method: the value in strategy attempted is wrong"
  );
});

test("deactive user's strategy when his subscription is expire", async ({
  assert,
}) => {
  const users = await Factory.model("App/Models/User").createMany(5);
  await Promise.all(
    users.map(async (user) => {
      let date_end_subscription;

      switch (user.id) {
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
        date_end_subscription
      });
      const exchange = await Factory.model("App/Models/Exchange").create(user.toJSON());
      await Factory.model("App/Models/Strategy").create({
        exchange: exchange.toJSON(),
      });
    })
  );

  await TradingBot.deactivateStrategy();

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
  assert.strictEqual(
    trades.length,
    3,
    `deactivateStrategy method: bad number of trades passed to transform all currencies in usdt`
  );
});

test("test of calculPercent method", async ({assert}) => {
  const tradingBot = new TradingBot(data);


  //test 1
  tradingBot.calculatedPosition = {
    btc: -0.5,
    eth: -0.5,
    usdt: 1
  }
  tradingBot.strategyPosition = {
    btc: 0.5,
    eth: 0.5,
    usdt: 0
  }

  const percentTest1BTC = tradingBot.calculPercent(['usdt'], 'btc')
  const percentTest1ETH = tradingBot.calculPercent(['usdt'], 'eth')
  assert.strictEqual(percentTest1BTC, 1, "method calculPercent : bad percent calculated")
  assert.strictEqual(percentTest1ETH, 1, "method calculPercent : bad percent calculated")


  //test 2
  tradingBot.calculatedPosition = {
    btc: -0.5,
    eth: 0,
    usdt: 0.5
  }
  tradingBot.strategyPosition = {
    btc: 0.5,
    eth: 0.5,
    usdt: 0
  }

  const percentTest2BTC = tradingBot.calculPercent(['usdt'], 'btc')
  assert.strictEqual(percentTest2BTC, 1, "method calculPercent : bad percent calculated")

  //test 3
  tradingBot.calculatedPosition = {
    btc: -1,
    eth: 0.5,
    usdt: 0.5
  }
  tradingBot.strategyPosition = {
    btc: 1,
    eth: 0,
    usdt: 0
  }

  const percentTest3BTC = tradingBot.calculPercent(['usdt', 'eth'], 'btc')
  assert.strictEqual(percentTest3BTC, 0.5, "method calculPercent : bad percent calculated")
})
