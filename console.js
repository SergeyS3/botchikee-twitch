const argv = require('minimist')(process.argv)
const Client = require('./clients/Client')
const Logger = require('./modules/Logger/Console')

const Bot = new Client('botchikee')

;(async () => {
	new Logger(Bot, {
		[Bot.username]: '#4CF',
		airchikee: '#F44'
	})
	await Bot.connect()
	
	Bot.join(argv.channel || 'airchikee')
})()
