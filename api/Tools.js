const accounts = require('./data/accounts.json')
const BotTools = require('../tools/Tools')

class Tools {
	static addPingLoop(ws) {
		let unansweredPings = 0
		const pingInterval = setInterval(() => {
			if(unansweredPings > 2) {
				clearInterval(pingInterval)
				ws.close()
			}
			else {
				ws.ping()
				unansweredPings++
			}
		}, 5 * 60 * 1000)
		
		ws.on('pong', () => unansweredPings = 0)
	}
	
	static checkAuth(req) {
		const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
		const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
		
		return login && accounts[login] === password
	}
	
	static async connectDB() {
		return await BotTools.connectDB() 
	}
}

module.exports = Tools
