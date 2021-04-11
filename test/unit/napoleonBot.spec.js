"use strict";
const Factory = use("Factory");
const NapoleonBot = use("App/Bots/NapoleonBot");
const { MachineLearning } = require("aws-sdk");
const moment = require("moment");
const Napoleon = use("App/Models/Napoleon");
const Mail = use("Mail");
const Database = use('Database')

const { test, before, after } = use("Test/Suite")("NapoleonBot");

before(async () => {
  await Factory.model("App/Models/Napoleon").create();
  await Factory.model("App/Models/Napoleon").create({
    strategy: "STRAT_BTC_ETH_USD_AR_D_1",
    title: "BTC/ETH/USD AR",
    active: 0,
  });
});

after(async () => {
  await Database.truncate('napoleons')
})

test("NapoleonBot get only Napoleon active strategies", async ({ assert }) => {
  const napoleonBot = new NapoleonBot();

  const activeStrat = await napoleonBot.getActiveStrategies();

  assert.strictEqual(
    activeStrat.length,
    1,
    "method getActiveStrategies : bad number of strategies recovered"
  );
  assert.include(
    activeStrat[0],
    { strategy: "STRAT_BTC_ETH_USD_LO_D_1" },
    "method getActiveStrategies : bad strategy recovered"
  );
});

test("get strategy data from the site of Napoleon", async ({ assert }) => {
  const napoleonBot = new NapoleonBot();

  const stratData = await napoleonBot.getStratData("STRAT_BTC_ETH_USD_LO_D_1");

  assert.isTrue(
    stratData.data.success,
    "method getStratData : problem to get startegy data"
  );
}).timeout(0);

test("verify if date of strategies recovered on NapoleonX is after now", async ({
  assert,
}) => {
  const napoleonBot = new NapoleonBot();
  const stratDataTomorrow = await napoleonBot.checkDateIsAfterNow({
    data: {
      data: {
        next_position_date: moment().add(1, "days"),
      },
    },
  });

  const stratDataNow = await napoleonBot.checkDateIsAfterNow({
    data: {
      data: {
        next_position_date: moment(),
      },
    },
  });

  assert.isTrue(
    stratDataTomorrow,
    "method checkDateIsAfterNow : wrong result attempted"
  );
  assert.isFalse(
    stratDataNow,
    "method checkDateIsAfterNow : wrong result attempted"
  );
});

test("verify that positions strategies with currency ETH, BTC and USDT are formated correctly", async ({
  assert,
}) => {
  const napoleonBot = new NapoleonBot();
  const formatedPositionTest1 = await napoleonBot.formatPositionBtcEthUsdt({
    "BTC-USD": 0.5,
    "ETH-USD": 0.5,
  });
  const formatedPositionTest2 = await napoleonBot.formatPositionBtcEthUsdt({
    "BTC-USD": 0,
    "ETH-USD": 0,
  });

  assert.include(
    formatedPositionTest1,
    { BTC: 0.5, ETH: 0.5, USDT: 0 },
    "method formatPositionBtcEthUsdt: position not formated correctly"
  );
  assert.include(
    formatedPositionTest2,
    { BTC: 0, ETH: 0, USDT: 1 },
    "method formatPositionBtcEthUsdt: position not formated correctly"
  );
});

test("verify that new data about NapoleonX are save", async ({ assert }) => {
  const napoleonBot = new NapoleonBot();

  //before the method "saveData"
  let napoleonStratBefore = await Napoleon.findBy(
    "strategy",
    "STRAT_BTC_ETH_USD_LO_D_1"
  );
  napoleonStratBefore = napoleonStratBefore.toJSON();
  const NapoleonDatabasePositionBefore = JSON.parse(
    napoleonStratBefore.position
  );

  assert.include(NapoleonDatabasePositionBefore, {
    BTC: 0.5,
    ETH: 0,
    USDT: 0.5,
  });

  await napoleonBot.saveData({
    data: {
      data: {
        productCode: "STRAT_BTC_ETH_USD_LO_D_1",
        current_position2: { "BTC-USD": 0, "ETH-USD": 0 },
      },
    },
  });

  //after the method "saveData"
  let napoleonStratAfter = await Napoleon.findBy(
    "strategy",
    "STRAT_BTC_ETH_USD_LO_D_1"
  );
  napoleonStratAfter = napoleonStratAfter.toJSON();
  const NapoleonDatabasePositionAfter = JSON.parse(napoleonStratAfter.position);

  assert.include(
    NapoleonDatabasePositionAfter,
    { BTC: 0, ETH: 0, USDT: 1 },
    "method formatPositionBtcEthUsdt: position not formated correctly"
  );
});

test("verify that a mail with good data inside is send", async ({ assert }) => {
  Mail.fake();

  const napoleonBot = new NapoleonBot();
  await napoleonBot.getTodayPosition();

  //set a timeout to allow time for the email to be sent
  const wait = (timeToDelay) =>
    new Promise((resolve) => setTimeout(resolve, timeToDelay));

  await wait(1000); // wait 1s
  //

  const recentMail = Mail.pullRecent();

  assert.strictEqual(recentMail.message.subject, "Succès de NapoleonBot", "problem sending mail")

  Mail.restore();
}).timeout(0);
