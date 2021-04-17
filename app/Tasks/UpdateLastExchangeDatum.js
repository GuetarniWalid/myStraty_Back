"use strict";
const Task = use("Task");
const Asset = use("App/Models/Asset");
const AssetRecording = use("App/Bots/AssetRecordingBot");

class UpdateLastExchangeDatum extends Task {
  static get schedule() {
    return " */5 * * * *";
  }

  async handle() {
    // get all assets that belongs to an active strategy
    const assetsActive = await this.getAssetsActive();

    assetsActive.forEach(async (asset) => {
      const assetRecording = new AssetRecording({
        strategyId: asset.strategy.id,
        BTC: asset.strategy.btc,
        ETH: asset.strategy.eth,
        USDT: asset.strategy.usdt,
        ExchangeData: asset.strategy.exchange,
        isTodayLastUpdate: true,
      });

      assetRecording.startLogic();
    });

  }

  async getAssetsActive() {
    const assetsActive = await Asset.query()
      .whereHas("strategy", (builder) => {
        builder.where("active", true);
      })
      .with("strategy")
      .with("strategy.exchange")
      .fetch();

    return assetsActive.toJSON();
  }
}

module.exports = UpdateLastExchangeDatum;
