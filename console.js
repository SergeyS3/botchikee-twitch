const argv = require('minimist')(process.argv)
const ModularBot = require('./clients/ModularBot')
const ConsoleLogger = require('./modules/Logger/Console')

const Bot = new ModularBot('botchikee')

;(async () => {
	await Bot.start({
		modules: new Map([
			[ConsoleLogger, {
				[Bot.username]: '#4CF',
				airchikee: '#F44'
			}],
		])
	})
	
	Bot.join(argv.channel || 'airchikee')
})()
