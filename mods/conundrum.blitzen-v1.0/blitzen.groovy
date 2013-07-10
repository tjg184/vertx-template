def eb = vertx.eventBus
def config = container.config

eb.registerHandler("conundrum.blitzen") { message ->
	println message.body.query
	def result = [:]
	result['result'] = message.body.query
	message.reply(result)
}

println 'up, up and away..'

