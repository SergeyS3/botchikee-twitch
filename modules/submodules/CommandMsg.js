const Submodule = require('./Submodule')
const CommandModel = require('../../models/command')

;(async () => { 
	await CommandModel.updateMany({}, { $set: { registered: false } })
})()

class CommandMsg extends Submodule {
	name = 'CommandMsg'
	commands = []
	
	constructor(Client) {
		super(Client)
		
		this.setCommandsFromDB = this.setCommandsFromDB.bind(this)
		this.msgIn = this.msgIn.bind(this)
		
		this.modelUsersChangeStream = CommandModel.watch([{
			$match: {
				operationType: 'update',
				$or: [
					{ 'updateDescription.updatedFields.active': { $exists: true } },
					{ 'updateDescription.updatedFields.users': { $exists: true } },
				]
			}
		}], {
			fullDocument: 'updateLookup'
		})
	}
	
	activate() {
		super.activate()
		
		this.modelUsersChangeStream.on('change', this.setCommandsFromDB)
		this.Client.on('msg_in', this.msgIn)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client.off('msg_in', this.msgIn)
		
		this.modelUsersChangeStream.off('change', this.setCommandsFromDB)
	}
	
	async setCommandsFromDB({ fullDocument }) {
		const command = this.commands.find(c => 
			c.module.name === fullDocument.module
			&& c.text === fullDocument.text
		)
		if(command) {
			command.active = fullDocument.active
			command.users = fullDocument.users || []
		}
	}
	
	msgIn(channel, user, msg) {
		if(user === this.Client.username)
			return
		
		let { command, args } = this.constructor.getCommand(msg)
		if(command)
			this.commands
				.filter(c =>
					c.active
					&& c.text === command
					&& c.module.checkChannel(channel)
					&& !c.users.length || c.users.includes(user)
				)
				.map(c => c.handler(channel, user, args))
	}
	
	static getCommand(msg) {
		let command, args
		if(msg.indexOf('!') === 0) {
			args = msg.split(' ')
			command = args.shift()
		}
		return { command, args }
	}
	
	async register(module, commands) {
		for(const [text, handler] of commands) {
			try {
				this.commands.push({ module, text, handler })
				
				await CommandModel.findOneAndUpdate(
					{
						module: module.name,
						text,
					},
					{
						registered: true,
						active: false
					},
					{ upsert: true }
				)
			} catch (e) {
				console.error(e)
			}
		}
		
		const setCommandsActivity = async active => {
			try {
				await CommandModel.updateMany({ module: module.name }, { $set: { active } })
			} catch (e) {
				console.error(e)
			}
		}
		module
			.on('activate', () => setCommandsActivity(true))
			.on('deactivate', () => setCommandsActivity(false))
	}
}

module.exports = CommandMsg
