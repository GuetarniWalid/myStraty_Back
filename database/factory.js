"use strict";
const moment = require("moment");
const Database = use("Database");

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");

Factory.blueprint("App/Models/User", (faker) => {
  return {
    email: faker.email(),
    password: faker.password(),
    username: faker.username(),
    date_of_birth: moment(faker.birthday()).format("YYYY/MM/DD"),
    male: faker.gender() === "Female",
  };
});

Factory.blueprint("App/Models/Exchange", (faker, i, {user}) => {
  return {
    name: "binance",
    private_key:
      "81Gakcjtrj4G7ZwDrxRgVp8L7dUBu6ZEfwL81I4w2ER5DtSRd47rCvI8jyFcObv9",
    public_key:
      "RCHMlMUGnZiMobmOKo9ZixT42CgFVxW4jmq4Y1rfEFzhYQsq7QimCss63bdKYdYb",
    tested: 1,
    validate: 1,
    user_id: user.id,
  };
});

Factory.blueprint("App/Models/Strategy", (faker, i, {exchange, active, btc, eth, usdt}) => {
  return {
    strategy: "STRAT_BTC_ETH_USD_LO_D_1",
    frequency: "daily",
    title: "BTC/ETH/USD LO",
    exchange_id: exchange?.id ?? 1,
    active: active ?? 1,
    position: JSON.stringify({ BTC: 0, ETH: 1, USDT: 0 }),
    btc: btc ?? 0.0004864,
    eth: eth ?? 2.2164454,
    usdt: usdt ?? 20.4546464,
  };
});

Factory.blueprint("App/Models/Subscription", (faker, i, {user}) => {
  let date_end_subscription;
  if (user.id === 1) date_end_subscription = moment().subtract(3, "days").format("YYYY-MM-DD");
  if (user.id === 2)
    date_end_subscription = moment().format("YYYY-MM-DD");
  if (user.id === 3)
    date_end_subscription = moment()
      .add(3, "days")
      .format("YYYY-MM-DD");
  if (user.id === 4)
    date_end_subscription = moment()
      .add(4, "days")
      .format("YYYY-MM-DD");
  if (user.id === 5)
    date_end_subscription = moment().add(1, "months").format("YYYY-MM-DD");

  return {
    user_id: user.id,
    tester: 1,
    type: null,
    customerId: null,
    date_end_subscription:
      date_end_subscription ?? moment().format("YYYY-MM-DD"),
  };
});
