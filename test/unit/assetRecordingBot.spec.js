'use strict'
const AssetRecordingBot = use("App/Bots/AssetRecordingBot")
const moment = require('moment')
const Factory = use("Factory")

const { test } = use('Test/Suite')('AssetRecordingBot')

test('verify asset is format correctly in JSON', async ({ assert }) => {

  const assetRecordingBot = new AssetRecordingBot({});
  assetRecordingBot.asset = {
    amount_by_date: JSON.stringify([])
  };

  //method to test
  const amountByDateStringify = assetRecordingBot.formatAmountByDateToJson(2, 10, 15000);
  //
  const amountByDate = JSON.parse(amountByDateStringify);
  const lastAmountByDate = amountByDate[0];

  assert.deepInclude(lastAmountByDate, {BTC: 2, ETH: 10, USDT: 15000}, "method formatAmountByDateToJson: bad object formated")
  assert.isTrue(moment().isSame(lastAmountByDate.date, 'day'), "method formatAmountByDateToJson: bad object formated")

})

test('verify that a new asset is save', async ({ assert }) => {

  //prepare test environment
  const assetRecordingBot = new AssetRecordingBot({});
  assetRecordingBot.asset = {
    amount_by_date: JSON.stringify([])
  };
  
  const asset = await Factory.model("App/Models/Asset").create()
  assetRecordingBot.asset = asset

  //launch test
  await assetRecordingBot.save(assetRecordingBot.formatAmountByDateToJson(2, 10, 15000));

  const assetTest = assetRecordingBot.asset.toJSON()
  const amountTested = JSON.parse(assetTest.amount_by_date)[0]


  assert.deepInclude(amountTested, {BTC: 2, ETH: 10, USDT: 15000}, "method formatAmountByDateToJson: bad object formated")
  assert.isTrue(moment().isSame(amountTested.date, 'day'), "method formatAmountByDateToJson: bad object formated")

})
