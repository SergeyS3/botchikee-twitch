const Botchikee = require('./clients/Botchikee')
const Logger = require('./modules/Logger/File')
const Answer = require('./modules/Answer')
const path = require('path')


const Bot = new Botchikee()

;(async () => {
	try {
		new Logger(Bot, path.join(__dirname, 'data/logs/full'))
		new Answer(Bot)
		await Bot.connect()

		Bot.join('airchikee')
	} catch (e) {
		console.error(e)
	}
})()
