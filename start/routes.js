"use strict";
const Env = use("Env");
/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");
const Event = use("Event");
const NapoleonBot = use('App/Bots/NapoleonBot')


Route.get("test", "AssetController.test");
Route.get("test2", async () => {
  Event.fire("tradingBot::start");
});

Route.group(() => {
  //Login
  Route.post("login/inscription", "UserController.inscription");
  Route.post("login/connexion", "UserController.connexion");
  Route.post("login/forget", "UserController.forget");
  Route.get("login/inscription/validation/:token", "UserController.validation");
  Route.get(
    "login/forget/validation/:token",
    "UserController.forgetValidation"
  );
  Route.post("login/resend/mail", "UserController.resendMail");
  Route.get("login/logout", "UserController.logout");
  //
  //user
  Route.get("user/status", () => ({ loggedIn: true })).middleware([
    "authentication",
    "expiry",
  ]);
  Route.get("user", "UserController.get").middleware([
    "authentication",
    "expiry",
  ]);
  Route.post("user/update", "UserController.update").middleware([
    "authentication",
    "expiry",
  ]);
  //
  //settings
  Route.get("settings", "SettingController.get").middleware([
    "authentication",
    "expiry",
    "subscription",
  ]);
  Route.post("settings", "SettingController.post").middleware([
    "authentication",
    "expiry",
    "subscription",
  ]);
  //
  //assets
  Route.get("assets/all/daily", "AssetController.allDaily").middleware([
    "authentication",
    "expiry",
    "subscription",
  ]);
  Route.get(
    "assets/byStrategy/:strat",
    "AssetController.byStrategy"
  ).middleware(["authentication", "expiry", "subscription"]);
  Route.get("assets/all/total", "AssetController.total").middleware([
    "authentication",
    "expiry",
    "subscription",
  ]);
  Route.get("assets/sufficient", "AssetController.sufficient").middleware([
    "authentication",
    "expiry",
    "subscription",
  ]);
  //
  //position
  Route.get(
    "positions/performance/:strategy",
    "PositionController.performance"
  );
  Route.get("positions/current/:strategy", "PositionController.current");
  Route.get("positions/:strategy", "PositionController.get");
  //
  //trade
  Route.get("trade/all", "TradeController.all").middleware([
    "authentication",
    "expiry",
    "subscription",
  ]);
  //
  //strategy
  Route.get("strategies", "StrategyController.index");
  Route.post(
    "strategies/user/start",
    "StrategyController.start"
  ).middleware(["authentication", "expiry", "subscription"]);
  Route.get(
    "strategies/user/stop/:strategyId",
    "StrategyController.stop"
  ).middleware(["authentication", "expiry", "subscription"]);
  Route.get(
    "strategies/user/active",
    "StrategyController.isActive"
  ).middleware(["authentication", "expiry", "subscription"]);
  Route.get(
    "strategies/user/:strat",
    "StrategyController.userStrategyInfo"
  ).middleware(["authentication", "expiry", "subscription"]);
  //
  //exchange
  Route.get(
    "exchange/info/:exchange",
    "ExchangeController.info"
  ).middleware(["authentication", "expiry", "subscription"]);
  Route.get(
    "exchange/balance/usdt/:exchange",
    "ExchangeController.USDTBalance"
  ).middleware(["authentication", "expiry", "subscription"]);
  Route.post("exchange/save", "ExchangeController.save").middleware([
    "authentication",
    "expiry",
    "subscription",
  ]);
  //
  //subscription
  Route.get(
    "subscription/info",
    "SubscriptionController.index"
  ).middleware(["authentication", "expiry"]);
  Route.post(
    "subscription/create-checkout-session",
    "SubscriptionController.createCheckoutSession"
  ).middleware(["authentication", "expiry"]);
  Route.get(
    "subscription/customer-portal",
    "SubscriptionController.customerPortal"
  ).middleware(["authentication", "expiry"]);
  Route.post("subscription/webhook", "SubscriptionController.webhook");
  //
  //Chat
    Route.get("chat/all/messages", "ChatController.all").middleware(["authentication", "expiry"]);
  //
}).prefix("api/v1");
