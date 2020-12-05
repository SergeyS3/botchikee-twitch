const IrcParser = require('../../tools/IrcParser')

class Logger {
	constructor(Client) {
		this.Client = Client
		Client
			.on('ws_in', this.wsIn.bind(this))
			.on('ws_out', this.wsOut.bind(this))
	}
	wsIn(parsedMsg) {
		this.log(parsedMsg, '>')
	}
	wsOut(raw) {
		const parsedMsg = IrcParser.parse(raw)
		switch(parsedMsg.command) {
			case 'PASS':
				parsedMsg.raw = 'PASS *********'
				break
			case 'PRIVMSG':
				parsedMsg.user = this.Client.username
				break
		}
		this.log(parsedMsg, '<')
	}
	log(parsedMsg, prefix) {}
}

module.exports = Logger