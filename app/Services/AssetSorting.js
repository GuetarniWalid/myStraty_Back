const User = use("App/Models/User")

class AssetSorting {
    /**
   * @description Gives all user assets filter and sorted by day
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.params.id - User's id
   * @returns {Array<currencyByDay>} Array of currencyByDay
   */
  async allDaily(userId) {
    //get user's data
    let user = await User.query()
      .where("id", userId)
      .with("exchanges.strategies.asset")
      .fetch();
    user = user.toJSON();

    //push all user's asset in this array
    const assets = [];
    user[0].exchanges.map((exchange) => {
      exchange.strategies.map((strategy) => {
          assets.push(strategy.asset);
      });
    });

    //parse all assets data
    const assetsParsed = assets.map((asset) => {
      return JSON.parse(asset.amount_by_date);
    });

    //iterate over assetsParsed to reduce it. We take only one data per day and ignore the others
    let assetsByDay = [];
    assetsParsed.map((assets) => {
      let date;
      const assetsFiltered = assets.filter((item) => {
        if (
          new Date(item.date).getDate() !== new Date(date).getDate() ||
          new Date(item.date).getMonth() !== new Date(date).getMonth()
        ) {
          date = item.date;
          return true;
        }
        return false;
      });
      assetsByDay.push(assetsFiltered);
    });

    //sum of all assetsByDay where each currency in asset is add to the same currency for the same day
    const numberOfArraysInAssetsByDay = assetsByDay.length;

    for (let i = 1; i < numberOfArraysInAssetsByDay; i++) {
      //get the index if the date is the same as "assetsByDay[0]" for more treatment
      //if not the "obj" is directly push inside "assetsByDay[0]"
      assetsByDay[i].map((obj) => {
        const index = assetsByDay[0].findIndex(
          (item) => item.date.substring(0, 10) === obj.date.substring(0, 10)
        );

        //if the date of current "obj" is already present in "assetsByDay[0]"
        //amount are added to each other by currency
        if (index >= 0) {
          assetsByDay[0][index].BTC =
            Number(assetsByDay[0][index].BTC) + Number(obj.BTC);
          assetsByDay[0][index].ETH =
            Number(assetsByDay[0][index].ETH) + Number(obj.ETH);
          assetsByDay[0][index].USDT =
            Number(assetsByDay[0][index].USDT) + Number(obj.USDT);
        } else {
          assetsByDay[0].push(obj);
        }
      });
    }

    //sort the final array "assetsByDay[0]" by data
    assetsByDay[0].sort((a, b) => {
      return new Date(a.date).valueOf() - new Date(b.date).valueOf();
    });

    return assetsByDay[0];
  }
}

module.exports = AssetSorting