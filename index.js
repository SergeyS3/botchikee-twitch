const Botchikee = require('./clients/Botchikee')

const Bot = new Botchikee()

;(async () => {
	try {
		Bot.on('ws_in', msg => console.log(`> ${msg}`) )
		
		await Bot.connect()
		
		Bot.on('ws_out', msg => console.log(`< ${msg}`) )
		
		Bot.join('airchikee')
	} catch (e) {
		console.error(e)
	}
})()
