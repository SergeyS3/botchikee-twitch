const Module = require('./Module')
const CommandMsg = require('./submodules/CommandMsg')
const Client = require('../clients/Client')

const users = require('../data/users')

class Spam extends Module {
	name = 'Spam'
	dependencies = [
		CommandMsg
	]
	
	constructor(usernames) {
		super()
		
		this.usernames = usernames
		
		this.commandIn = this.commandIn.bind(this)
	}
	
	activate() {
		super.activate()
		
		this.Client.on('command_in', this.commandIn)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client.off('command_in', this.commandIn)
	}
	
	async commandIn(channel, user, command, args) {
		if(!this.checkChannel(channel) || !args.length)
			return
		
		if(command === '!spam') {
			if(users[user] !== 'owner')
				return
			
			const msg = args.join(' ')
			
			this.usernames.forEach(async username => {
				const Bot = new Client(username)
				await Bot.connect()
				Bot.join(channel)
				Bot.say(channel, msg)
				Bot.disconnect()
			})
			
			this.Client.say(channel, msg)
		}
	}
}

module.exports = Spam
