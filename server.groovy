package com.shelter.log.server

import org.vertx.java.core.json.JsonObject
import org.vertx.java.deploy.Verticle

def webServerConf = [
	port: 80,
	host: 'localhost',
	bridge: true,
	inbound_permitted: [ 
		[ address: 'conundrum.blitzen' ]
	],
	outbound_permitted: [ [:] ] 
]

container.with {
	deployModule('conundrum.blitzen-v1.0',
		[
			host : "localhost",
			port : 27017,
			db_name : "test"
		])
	deployModule('vertx.web-server-v1.0', webServerConf)
}