"use strict";
const axios = require("axios").default;
const Env = use("Env");
const Napoleon = use("App/Models/Napoleon");
const Event = use("Event");

class NapoleonBot {
  constructor(order) {
    this.dateAlreadyChecked = false;
    this.errorNum = 0;
    this.interval = 60000;
    if (order === "start") this.start();
  }


  async start() {
    try {
      await this.getTodayPosition();
    } catch (error) {
      this.errorNum++;
      if (this.errorNum > 3) this.interval = 600000;
      if (this.errorNum < 6) {
        setTimeout(() => {
          this.start();
        }, this.interval);
      } else {
        Event.fire("napoleon::error", error);
      }
    }
  }

  async getStratData(strat) {
    const result = await axios.post(
      "https://crypto-user-service.napoleonx.ai/v1/platform/authentification",
      {
        username: Env.get("NAPOLEON_X_USERNAME"),
        password: Env.get("NAPOLEON_X_PASSWORD"),
      }
    );
    const token = result.data.access_token;
    const stratPosition = await axios.post(
      "https://crypto-user-service.napoleonx.ai/v1/platform/getbotdetails",
      {
        access_token: token,
        email: Env.get("NAPOLEON_X_USERNAME"),
        product_code: strat,
      }
    );
    return stratPosition;
  }

  //get and save current Napoleon Position
  async getTodayPosition() {
    try {
      const stratPosition = await this.getStratData("STRAT_BTC_ETH_USD_LO_D_1");
      if (this.dateAlreadyChecked || this.checkTodayDate(stratPosition)) {
        const position = stratPosition.data.data.current_position2;
        const currentPosition = {
          BTC: position["BTC-USD"],
          ETH: position["ETH-USD"],
          USDT: 1 - position["BTC-USD"] - position["ETH-USD"],
        };
        const napoleon = await Napoleon.findBy(
          "strategy",
          "STRAT_BTC_ETH_USD_LO_D_1"
        );
        napoleon.position = JSON.stringify(currentPosition);
        await napoleon.save();
        Event.fire("napoleon::success");
      } else throw new Error("Dates does not match");
    } catch (error) {
      console.log(error);
      if (error.message === "Dates does not match") throw error;
      else
        throw new Error(
          "Error at request getTodayPosition to NapoleonX.\nCheck that your username and password are correct.\nIf they are then check you have at least one token checked in NapoleonX Platform.\n" +
            error
        );
    }
  }

  checkTodayDate(response) {
    const nextNapoPosition = response.data.data.next_position_date.slice(0, 10);
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrow = today.toISOString().slice(0, 10);
    //Verify if Napoleon Data are updated
    if (nextNapoPosition === tomorrow) {
      this.dateAlreadyChecked = true;
      return true;
    } else return false;
  }

  async getPositions(strat) {
    const stratPosition = await this.getStratData(strat);
    const positions = stratPosition.data.data.positions2;
    return positions;
  }

  async getPerformance(strat) {
    const stratPosition = await this.getStratData(strat);
    const performance = stratPosition.data.data.graphStrategy;
    return performance;
  }

  async getCurrentPosition(strat) {
    const stratPosition = await this.getStratData(strat);
    const currentPosition = stratPosition.data.data.current_position2;
    return currentPosition;
  }
}

module.exports = NapoleonBot;
