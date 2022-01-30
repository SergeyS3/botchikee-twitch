const Logger = require('./Logger')
const chalk = require('chalk')

class Console extends Logger {
	name = 'Console logger'
	
	constructor(Client, userColors) {
		super(Client)
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
				if(tags.bits)
					msg = `(BITS ${tags.bits})`
				
				break
			case 'CLEARCHAT':
				msg = `CLEARCHAT ${user} ${tags.banDuration}`
				break
			case 'CLEARMSG':
				msg = `CLEARMSG ${user} ${params[1]}`
				break
			case 'USERNOTICE':
				const prefix = `${user} ${tags.msgId.toUpperCase()}`
				switch(tags.msgId) {
					case 'sub':
						msg = prefix
						break;
					case 'resub':
						msg = `${prefix} ${tags.cumulativeMonths}`
						break;
					case 'subgift':
						msg = `${prefix} ${tags.giftMonths} ${tags.recipientDisplayName} (${tags.senderCount} total)`
						break;
					case 'submysterygift':
						msg = `${prefix} ${tags.massGiftCount} (${tags.senderCount} total)`
						break;
					case 'giftpaidupgrade':
						msg = `${prefix} (gifter: ${tags.senderName})`
						break;
					case 'bitsbadgetier':
						msg = `${prefix} ${tags.threshold}`
						break;
					case 'rewardgift':
						msg = `${prefix} ${params[1]}`
						break;
					case 'raid':
						msg = `${prefix} ${tags.viewerCount}`
						break;
				}
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
