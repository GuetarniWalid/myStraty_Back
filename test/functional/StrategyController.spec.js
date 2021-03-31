'use strict'

const Factory = use('Factory')
const { test, trait } = use('Test/Suite')('StrategyController')

trait('Test/ApiClient')
trait('Session/Client')

test('make sure stop method transform all currency in usdt for a strategy', async ({ client }) => {
  let user = await Factory.model('App/Models/User').create()
  user = user.toJSON()
  let exchange = await Factory.model('App/Models/Exchange').create(user)
  exchange = exchange.toJSON()
  const strategy = await Factory.model('App/Models/Strategy').create(exchange)


  const response = await client
    .get(`/api/v1/strategies/user/stop/${strategy.id}`)
    .end()

    response.assertStatus(200)
    response.assertJSONSubset({
      success: true
    })


})
