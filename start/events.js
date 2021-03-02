const Event = use('Event')

Event.on('napoleon::error', 'NapoleonListener.handleError')

Event.on('napoleon::success', 'NapoleonListener.handleSuccess')

Event.on('tradingBot::start', 'TradingBotListener.getAllUser')