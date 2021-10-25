const Logger = require('./Logger')
const chalk = require('chalk')

class Console extends Logger {
	name = 'Console logger'
	
	constructor(userColors) {
		super()
		this.userColors = userColors
	}
	
	log({ raw, user, channel, command, params, tags }) {
		let msg,
			terminalColor = 'C0C0C0'
		
		switch(command) {
			case '001':
			case '002':
			case '003':
			case '004':
			case '353':
			case '366':
			case '375':
			case '372':
			case '376':
			case 'CAP':
			case 'PING':
			case 'PONG':
			case 'GLOBALUSERSTATE':
			case 'USERSTATE':
			case 'PASS':
				return
			case 'JOIN':
				if(!user)
					return
				terminalColor = '#0A0'
				break
			case 'PART':
				terminalColor = '#AA0'
				break
			case 'PRIVMSG':
				if(this.userColors[user])
					terminalColor = this.userColors[user]
				
				msg = `${user} PRIVMSG ${params[1]}`
				break
		}
		if(!msg)
			msg = raw
					.replace(/:([^(! )]+![^(@ )]+@)?([^(. )]+)\.tmi\.twitch\.tv/, '$2')
					.replace(':tmi.twitch.tv ', '')
					.replace(` #${channel}`, '')
		
		console.log(chalk.hex(terminalColor)(msg))
	}
}

module.exports = Console
