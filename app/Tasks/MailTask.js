"use strict";
const AssetSorting = use("App/Services/AssetSorting");
const Task = use("Task");
const User = use("App/Models/User");
const Mail = use("Mail");
const Env = use("Env");
const axios = require("axios");
const moment = require("moment");
moment.locale('fr', {
  months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
  monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
  monthsParseExact : true,
  weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
  weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
  weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
  weekdaysParseExact : true,
  longDateFormat : {
      LT : 'HH:mm',
      LTS : 'HH:mm:ss',
      L : 'DD/MM/YYYY',
      LL : 'D MMMM YYYY',
      LLL : 'D MMMM YYYY HH:mm',
      LLLL : 'dddd D MMMM YYYY HH:mm'
  },
  calendar : {
      sameDay : '[Aujourd’hui à] LT',
      nextDay : '[Demain à] LT',
      nextWeek : 'dddd [à] LT',
      lastDay : '[Hier à] LT',
      lastWeek : 'dddd [dernier à] LT',
      sameElse : 'L'
  },
  relativeTime : {
      future : 'dans %s',
      past : 'il y a %s',
      s : 'quelques secondes',
      m : 'une minute',
      mm : '%d minutes',
      h : 'une heure',
      hh : '%d heures',
      d : 'un jour',
      dd : '%d jours',
      M : 'un mois',
      MM : '%d mois',
      y : 'un an',
      yy : '%d ans'
  },
  dayOfMonthOrdinalParse : /\d{1,2}(er|e)/,
  ordinal : function (number) {
      return number + (number === 1 ? 'er' : 'e');
  },
  meridiemParse : /PD|MD/,
  isPM : function (input) {
      return input.charAt(0) === 'M';
  },
  // In case the meridiem units are not separated around 12, then implement
  // this function (look at locale/id.js for an example).
  // meridiemHour : function (hour, meridiem) {
  //     return /* 0-23 hour, given meridiem token and hour 1-12 */ ;
  // },
  meridiem : function (hours, minutes, isLower) {
      return hours < 12 ? 'PD' : 'MD';
  },
  week : {
      dow : 1, // Monday is the first day of the week.
      doy : 4  // Used to determine first week of the year.
  }
});

/**
 * @namespace Task
 */

/**
 * @memberof Task
 * @extends Task
 * @description Check all 15 minutes whether to send the daily email to users who have subscribed and send email if time matches for a user
 */
class MailTask extends Task {
  /**
   * @description A cron job that trigger MailTask.handle() all 15 minutes
   */
  static get schedule() {
    return "*/15 * * * *";
  }

  /**
   * @description Function triggered all 15 minutes, send a mail if time matches with mail time settings
   * @returns {void}
   */
  async handle() {
    try {
      let users = await User.query()
        .whereHas("setting", (builder) => {
          builder.where("send_mail", true);
        })
        .whereHas("strategies", (builder) => {
          builder.where("active", true);
        })
        .whereHas("strategies.asset")
        .with("setting")
        .with("strategies", (builder) => {
          builder.where("active", true);
        })
        .with("exchanges", (builder) => {
          builder.where("name", "binance");
        })
        .with("strategies.asset")
        .with("strategies.trades")

        .fetch();
      users = users.toJSON();
      users = users.filter(user => {
        return moment(user.setting.mail_time, 'hh:mm:ss').isSame(Date.now(), 'minute')
      })


      if (users.length) {
        users.forEach(async (user) => {
          const {
            priceProgressionFormatted,
            currentWalletFormatted,
            priceProgressionInPercentFormatted,
          } = await this.calculateAssetDataInEur(user);
          const stratPositions = await this.getStratPositions(user.strategies);
          const trades = await this.getTrades(user.strategies);

          Mail.send('daily-mail', {
            priceProgressionFormatted,
            currentWalletFormatted,
            priceProgressionInPercentFormatted,
            stratPositions,
            trades,
            date: moment().local('fr').format('dddd D MMMM YYYY'),
            frontUrl: Env.get('FRONT_URL')
          }, (message) => {
            message.from(Env.get("MAIL_USERNAME"));
            message.to(user.email);
          });
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * @description Function that calculate from yesterday the progression of total wallet amount in euro, the total wallet amount in euro and the progression of wallet in percent
   * @returns {formattedAssetDataInEur}
   */
  async calculateAssetDataInEur(user) {
    //get rates EUR/USDT pair on Binance API
    const ratesData = await axios.get(
      "https://api.binance.com/api/v3/avgPrice?symbol=EURUSDT"
    );
    this.EurUsdtRates = ratesData.data.price

    //calculate price progression in one day in Eur
    const lastTwoDaysAsset = await this.filterAssetsOfLastTwoDays(user);
    const priceProgressionInUsdt =
      lastTwoDaysAsset[1].USDT - lastTwoDaysAsset[0].USDT;
    const priceProgressionInEur = priceProgressionInUsdt / this.EurUsdtRates;
    //remove digits after dots
    const priceProgressionFormatted = String(priceProgressionInEur).split(
      "."
    )[0];

    //calculate price progression in one day in percent
    const priceProgressionInPercent =
      (priceProgressionInUsdt / lastTwoDaysAsset[0].USDT) * 100;
    const priceProgressionInPercentString = String(priceProgressionInPercent);
    const priceProgressionInPercentBeforeDot = priceProgressionInPercentString.split(
      "."
    )[0];
    const priceProgressionInPercentAfterDot = priceProgressionInPercentString.split(
      "."
    )[1];
    const priceProgressionInPercentFormatted =
      priceProgressionInPercentBeforeDot +
      "." +
      priceProgressionInPercentAfterDot.substring(0, 2);

    //calculate current price of wallet in Eur
    const currentWalletInEur = lastTwoDaysAsset[1].USDT / this.EurUsdtRates;
    const currentWalletFormatted = String(currentWalletInEur).split(".")[0];

    return {
      priceProgressionFormatted,
      currentWalletFormatted,
      priceProgressionInPercentFormatted,
    };
  }

  /**
   * @description Return asset data of last two days
   * @returns {Array<assetDataShorted>}
   */
  async filterAssetsOfLastTwoDays(user) {
    const assetSorting = new AssetSorting();
    try {
      const assetSortedByDay = await assetSorting.allDaily(user.id);
    }
    catch(e) {
      return
    }
    const lastTwoDays = assetSortedByDay.slice(-2);
    return lastTwoDays;
  }

  /**
   * @description Return data of active strategy
   * @returns {Array<strategyDataShorted>}
   */
  async getStratPositions(strategies) {
    const strategiesFormatted = strategies.map((strategy) => {
      const position = JSON.parse(strategy.position);
      for (const currency in position) {
        position[currency] = position[currency] * 100 + " %";
      }
      return {
        title: strategy.title,
        position,
      };
    });
    return strategiesFormatted;
  }

  /**
   * @description Return data info of last trade
   * @returns {Array<lastTradeInfo>}
   */
  async getTrades(strategies) {
    const tradesPromise = strategies.map(async (strategy) => {
      const [todayTrade] = strategy.trades.filter(trade => {
        return moment(trade.created_at).isSame(Date.now(), 'day')
      })
      //if no trade today
      if(!todayTrade) {
        return {
          strategyTitle: strategy.title,
          tradeExist: false
        };
      }

      ''
      const baseCurrency = todayTrade.pair.slice(0, 3)
      const secondaryCurrency = todayTrade.pair.slice(3)

      //get the rate of usdt/currency exchanged
      const {data} = await axios.get(
        `https://api.binance.com/api/v3/avgPrice?symbol=${baseCurrency}USDT`
      );
      const ratesData = data.price
      const amountCurrencyExchangedInUsdt = todayTrade.amount * ratesData
      const amountCurrencyExchangedInEur = amountCurrencyExchangedInUsdt / this.EurUsdtRates

      return {
        strategyTitle: strategy.title,
        tradeExist: true,
        currencySell: todayTrade.action === 'BUY' ? secondaryCurrency : baseCurrency,
        currencyBuy: todayTrade.action === 'BUY' ? baseCurrency : secondaryCurrency,
        amount: String(amountCurrencyExchangedInEur).split('.')[0] + ' €'
      };
    });

    const trades = await Promise.all(tradesPromise)
    return trades
  }
}

module.exports = MailTask;
