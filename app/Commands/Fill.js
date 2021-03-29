'use strict'

const { Command } = require('@adonisjs/ace')
const Helpers = use("Helpers");
const Database = use("Database");
const Asset = use("App/Models/Asset");
const User = use('App/Models/User')
const fs = require("fs");
const axios = require("axios").default;

class Fill extends Command {
  static get signature () {
    return "fill"
  }

  static get description () {
    return "Populate asset data for the user with choosen id "
  }

  async handle (args, options) {
    const userId = await this.ask('for which user do you want to enter the data ? (enter an id)')


      async function getAvgPrice(pair, limit) {
        const datas = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1d&limit=${limit}`
        );
        const dataFormated = datas.data.map((data) => {
          return {
            day: new Date(data[6]).toISOString(),
            avgPrice: (Number(data[1]) + Number(data[4])) / 2,
          };
        });
        return dataFormated;
      }
  
      function convert(base, output, isBase) {
        if (isBase) return base * output;
        else return base / output;
      }
  
      const ETHPrices = await getAvgPrice("ETHBTC", 300);
      const USDTPrices = await getAvgPrice("BTCUSDT", 300);
  
      let data = fs.readFileSync(`${Helpers.appRoot()}/data.json`);
      data = JSON.parse(data);
      const snapshots = data.snapshotVos;
  
      const formatData = snapshots.map((snap) => {
        const ETHObj = ETHPrices.find((obj) => {
          return (
            obj.day.substring(0, 10) ===
            new Date(snap.updateTime).toISOString().substring(0, 10)
          );
        });
        const USDTObj = USDTPrices.find((obj) => {
          return (
            obj.day.substring(0, 10) ===
            new Date(snap.updateTime).toISOString().substring(0, 10)
          );
        });
  
        return {
          date: new Date(snap.updateTime).toISOString(),
          BTC: snap.data.totalAssetOfBtc,
          ETH: convert(snap.data.totalAssetOfBtc, ETHObj.avgPrice, false),
          USDT: convert(snap.data.totalAssetOfBtc, USDTObj.avgPrice, true),
        };
      });

      const user = await User.find(userId)
      let strategy = await user.strategies().fetch()
      strategy = strategy.toJSON()

      const asset = await Asset.findOrCreate(
        { id: strategy[0].id },
        {
          id: strategy[0].id,
          amount_by_date: JSON.stringify(formatData),
        }
      );
      asset.strategy_id = strategy[0].id;
      asset.amount_by_date = JSON.stringify(formatData);
      await asset.save();
      
      Database.close()
    }
  
}

module.exports = Fill
