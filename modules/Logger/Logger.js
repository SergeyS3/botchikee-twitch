const IrcParser = require('../../tools/IrcParser')
const Module = require('../Module')

class Logger extends Module{
	constructor() {
		super()
		
		this.wsIn = this.wsIn.bind(this)
		this.wsOut = this.wsOut.bind(this)
	}
	
	activate() {
		super.activate()
		
		this.Client
			.on('ws_in', this.wsIn)
			.on('ws_out', this.wsOut)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client
			.off('ws_in', this.wsIn)
			.off('ws_out', this.wsOut)
	}
	
	wsIn(parsedMsg) {
		if(parsedMsg.channel && !this.checkChannel(parsedMsg.channel))
			return
		
		this.log(parsedMsg, '>')
	}
	
	wsOut(raw) {
		const parsedMsg = IrcParser.parse(raw)
		
		if(parsedMsg.channel && !this.checkChannel(parsedMsg.channel))
			return
		
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