'use strict'
const NapoleonBot = use('App/Bots/NapoleonBot')
const Napoleon = use('App/Models/Napoleon')

/**
 * @memberof Controllers.Http
 * @classDesc This is the Controller for routes that begin by "[Domain name]/api/v1/positions". Desserve data related to positions.
 */
class PositionController {

    /**
     * @description Gives all positions sorted by date for one strategy
     * @param {ctx} ctx - Context object
     * @param {string} ctx.params.strategy - The title of strategy
     * @returns {positions} - An array of position object for each pair
     * @example
     * {
     *  'BTC-USD': [
     *       { date: '2020-08-11', value: 0 },
     *       { date: '2020-08-12', value: 0.5 },
     *       { date: '2020-08-13', value: 0 },
     *       { date: '2020-08-14', value: 0 },
     *       { date: '2020-08-15', value: 0 },
     *       { date: '2020-08-16', value: 0 },
     *       { date: '2020-08-17', value: 0 }
     *  ],
     *  'ETH-USD': [
     *       { date: '2020-08-11', value: 1 },
     *       { date: '2020-08-12', value: 0.5 },
     *       { date: '2020-08-13', value: 1 },
     *       { date: '2020-08-14', value: 1 },
     *       { date: '2020-08-15', value: 1 },
     *       { date: '2020-08-16', value: 1 },
     *       { date: '2020-08-17', value: 1 },
     *  ]
     * }
     */
    async get({params}) {
        const {strategy} = params
        //reformat strategy
        const strat = strategy.split('_').join('/').replace('%20', ' ')

        //get reference of strategy with title
        const napoleon = await Napoleon.findBy('title', strat)
        const stratReference = napoleon.strategy


        const napoleonBot = new NapoleonBot()
        const positions = await napoleonBot.getPositions(stratReference)
        return positions
    }

    /**
     * @description Gives all data for one strategy sorted by date that inform about performance strategy over one year
     * @param {ctx} ctx - Context object 
     * @param {string} ctx.params.strategy - Strategy reference
     * @returns {Array<performance>} An array with multiple array of date and a value
     * @example
     * [
     *   [ 1581292800000, 4646015.7337 ],
     *   [ 1581379200000, 4895911.9979 ],
     *   [ 1581465600000, 5479180.2355 ],
     *   [ 1581552000000, 5529209.9502 ],
     *   [ 1581638400000, 5883947.3923 ],
     *   [ 1581724800000, 5452827.1348 ],
     *   [ 1581811200000, 5341238.2238 ],
     * ]
     */
    async performance({params}) {
        const {strategy} = params
        const napoleonBot = new NapoleonBot()
        const performance = await napoleonBot.getPerformance(strategy)
        return performance
    }

    /**
     * @description Gives the actual position, only for last day, of the strategy
     * @param {ctx} ctx 
     * @param {string} ctx.params.strategy - Strategy reference
     * @returns {object<string, number>} - Return an object with each pair and their weight
     * @example
     *  { 'BTC-USD': 1, 'ETH-USD': 0 }
     */
    async current({params}) {
        const {strategy} = params
        const napoleonBot = new NapoleonBot()
        const currentPosition = await napoleonBot.getCurrentPosition(strategy)
        return currentPosition
    }
}


module.exports = PositionController
