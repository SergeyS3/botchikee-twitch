const Module = require('./Module')
const CommandMsg = require('../submodules/CommandMsg')
const Tools = require('../tools/Tools')

class Select extends Module {
	name = 'Select'
	dependencies = [
		CommandMsg
	]
	
	constructor(Client) {
		super(Client)
		
		this.selectCommand = this.selectCommand.bind(this)
	}
	
	async init() {
		await this.getSubmoduleInstance(CommandMsg).register(this, new Map([
			['!select', this.selectCommand]
		]))
	}
	
	selectCommand(args, channel) {
		if(args.length < 2)
			return
		
		this.Client.say(channel, args[Tools.rand(0, args.length - 1)])
	}
}

module.exports = Select
