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

Factory.blueprint("App/Models/Exchange", (faker, i, user) => {
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

Factory.blueprint(
  "App/Models/Strategy",
  (faker, i, { exchange, active, btc, eth, usdt }) => {
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
  }
);

Factory.blueprint(
  "App/Models/Subscription",
  (faker, i, { user, date_end_subscription }) => {
    return {
      user_id: user.id,
      tester: 1,
      type: null,
      customerId: null,
      date_end_subscription:
        date_end_subscription ?? moment().format("YYYY-MM-DD"),
    };
  }
);

Factory.blueprint("App/Models/Napoleon", () => {
  return {
    position: JSON.stringify({ BTC: 0.5, ETH: 0, USDT: 0.5 }),
    strategy: "STRAT_BTC_ETH_USD_LO_D_1",
    title: "BTC/ETH/USD LO",
    frequency: "daily",
    updated_at: "2021-03-03 09:40:47",
    active: 1
  };
});

Factory.blueprint("App/Models/Asset", (faker, i, strategy) => {
  return {
    strategy_id: strategy.id,
    amount_by_date: JSON.stringify([{"BTC": 0.0010505805406086004, "ETH": 0.03310590875771409, "USDT": 51, "date": "2021-03-04T23:46:06.625Z"}, {"BTC": 0.0010460441220122615, "ETH": 0.033340934194017416, "USDT": 51, "date": "2021-03-05T23:46:04.863Z"}, {"BTC": 0.0010390285107083437, "ETH": 0.03062121071199453, "USDT": 51, "date": "2021-03-06T23:46:05.543Z"}, {"BTC": 0.000997580739094039, "ETH": 0.029526639507489943, "USDT": 51, "date": "2021-03-07T23:46:06.794Z"}, {"BTC": 0.000979365384059226, "ETH": 0.027859157074410036, "USDT": 51, "date": "2021-03-08T23:46:05.828Z"}, {"BTC": 0.0009343513548983894, "ETH": 0.02740739508182216, "USDT": 51, "date": "2021-03-09T23:46:05.661Z"}, {"BTC": 0.0009087940869691833, "ETH": 0.028295338954561475, "USDT": 51, "date": "2021-03-10T23:46:04.596Z"}, {"BTC": 0.0008827662809549649, "ETH": 0.02794229306327947, "USDT": 51, "date": "2021-03-11T23:46:06.905Z"}, {"BTC": 0.0008873994681232073, "ETH": 0.028812053596299517, "USDT": 51, "date": "2021-03-12T23:46:06.128Z"}, {"BTC": 0.0008882105508822879, "ETH": 0.028222211793900696, "USDT": 54.51390142322904, "date": "2021-03-13T23:46:05.263Z"}, {"BTC": 0.0008862509705277781, "ETH": 0.028291769107941952, "USDT": 53.17451019183381, "date": "2021-03-14T23:46:05.807Z"}, {"BTC": 0.0008953412854566129, "ETH": 0.027918306701342016, "USDT": 50.306285848868946, "date": "2021-03-15T23:46:05.949Z"}, {"BTC": 0.0008875336453451645, "ETH": 0.027926128807392595, "USDT": 50.107365569598144, "date": "2021-03-16T23:47:06.258Z"}, {"BTC": 0.0008620784521502246, "ETH": 0.02794124106289843, "USDT": 49.79898177491465, "date": "2021-03-18T23:46:05.385Z"}, {"BTC": 0.0008618398120044181, "ETH": 0.027641126324821345, "USDT": 50.088062013502714, "date": "2021-03-19T23:47:06.072Z"}, {"BTC": 0.0008609683422800783, "ETH": 0.02767798785866408, "USDT": 50.137278577351125, "date": "2021-03-20T23:46:06.149Z"}, {"BTC": 0.0008590191587001106, "ETH": 0.027674498912630404, "USDT": 49.35730301610757, "date": "2021-03-21T23:47:06.062Z"}, {"BTC": 0.0008581442050197482, "ETH": 0.027648955231305825, "USDT": 46.794938635582525, "date": "2021-03-22T23:46:05.652Z"}, {"BTC": 0.0008527590547540172, "ETH": 0.02782141468436944, "USDT": 46.401020309887315, "date": "2021-03-23T23:46:05.868Z"}, {"BTC": 0.000845828422834975, "ETH": 0.028023924114019865, "USDT": 44.7242356521343, "date": "2021-03-24T23:46:07.124Z"}, {"BTC": 0.0008462259591728006, "ETH": 0.027402192890497973, "USDT": 43.478509945261635, "date": "2021-03-25T23:46:05.702Z"}, {"BTC": 0.0008474076930881303, "ETH": 0.02733416445768416, "USDT": 46.360313044040915, "date": "2021-03-26T23:46:05.467Z"}, {"BTC": 0.0008377236709144767, "ETH": 0.02733464964922632, "USDT": 46.94785121450536, "date": "2021-03-27T23:46:05.491Z"}, {"BTC": 0.0008263306804903892, "ETH": 0.027300667847469883, "USDT": 46.02584847184625, "date": "2021-03-28T23:46:05.781Z"}])
  }
})
