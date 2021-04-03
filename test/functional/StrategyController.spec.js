'use strict'

const Factory = use('Factory')
const { test, trait } = use('Test/Suite')('StrategyController')

trait('Test/ApiClient')
trait('Auth/Client')
trait('Session/Client')

test('make sure stop method transform all currency in usdt for a strategy', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const exchange = await Factory.model('App/Models/Exchange').create(user.toJSON())
  const strategy = await Factory.model('App/Models/Strategy').create({exchange: exchange.toJSON()})
  await Factory.model('App/Models/Subscription').create({user: user.toJSON()})


  const response = await client
    .get(`/api/v1/strategies/user/stop/${strategy.id}`)
    .session('adonis-auth', user.id)
    .loginVia(user, 'jwt')
    .end()

    response.assertStatus(200)
    response.assertJSONSubset({
      success: true
    })


})
