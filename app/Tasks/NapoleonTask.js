"use strict";
const NapoleonBot = use('App/Bots/NapoleonBot')
const Task = use("Task");

/**
 * @memberof Task
 * @extends Task
 * @description Trigger all day at 23:45 the handle function that start NapoleonBot to get data from Napoleon platform
 */
class NapoleonTask extends Task {

  /**
   * @description A cron job that trigger NapoleonTask.handle() all day at 00:01
   */
  static get schedule() {
    return "01 00 * * *";
  }

  /**
   * @description Function triggered to start NapoleonBot
   * @returns {void}
   */
  async handle() {
    new NapoleonBot('start')
  }
}

module.exports = NapoleonTask;
