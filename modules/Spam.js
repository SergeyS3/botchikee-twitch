const Module = require('./Module')
const CommandMsg = require('../submodules/CommandMsg')
const Client = require('../clients/Client')

class Spam extends Module {
	name = 'Spam'
	dependencies = [
		CommandMsg
	]
	
	constructor(Client, usernames) {
		super(Client)
		
		this.usernames = usernames
		
		this.spamCommand = this.spamCommand.bind(this)
	}
	
	async init() {
		await this.getSubmoduleInstance(CommandMsg).register(this, new Map([
			['!spam', this.spamCommand]
		]))
	}
	
	async spamCommand(args, channel) {
		if(!args.length)
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

module.exports = Spam
