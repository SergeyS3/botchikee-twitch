const Botchikee = require('./clients/Botchikee')

const Bot = new Botchikee()

;(async () => {
	try {
		await Bot.connect()
		Bot.join('airchikee')
	} catch (e) {
		console.error(e)
	}
})()