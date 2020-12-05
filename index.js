const Botchikee = require('./clients/Botchikee')
const Logger = require('./modules/Logger/File')
const path = require('path')


const Bot = new Botchikee()

;(async () => {
	try {
		new Logger(Bot, path.join(__dirname, 'data/logs/full'))
		await Bot.connect()

		Bot.join('airchikee')
	} catch (e) {
		console.error(e)
	}
})()
