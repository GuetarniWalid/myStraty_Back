"use strict";
const Task = use("Task");
const Strategy = use("App/Models/Strategy");
const AssetRecording = use("App/Bots/AssetRecordingBot");

class UpdateLastExchangeDatum extends Task {
  static get schedule() {
    return " */5 * * * *";
  }

  async handle() {
    // get all assets that belongs to an active strategy
    const strategiesActive = await this.getStrategiesActive();

    strategiesActive.forEach(async (strategy) => {
      const assetRecording = new AssetRecording({
        strategyId: strategy.id,
        BTC: strategy.btc,
        ETH: strategy.eth,
        USDT: strategy.usdt,
        ExchangeData: strategy.exchange,
      });

      assetRecording.startLogic();
    });

  }

  async getStrategiesActive() {
    const strategiesActive = await Strategy.query()
      .where("active", true)
      .with("exchange")
      .fetch();

    return strategiesActive.toJSON();
  }
}

module.exports = UpdateLastExchangeDatum;
