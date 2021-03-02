"use strict";


const Database = use("Database");

class SettingSeeder {
  async run() {
    await Database.table('settings').insert({
      send_mail: 1,
      dark_mode: 0,
      user_id: 1
    })
  }
}

module.exports = SettingSeeder;
