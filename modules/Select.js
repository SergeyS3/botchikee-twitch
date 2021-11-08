const Module = require('./Module')
const CommandMsg = require('./submodules/CommandMsg')
const Tools = require('../tools/Tools')

class Select extends Module {
	name = 'Select'
	dependencies = [
		CommandMsg
	]
	
	constructor() {
		super()
		
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
	
	commandIn(channel, user, command, args) {
		if(!this.checkChannel(channel) || !args.length)
			return
		
		if(command === '!select')
			this.Client.say(channel, args[Tools.rand(0, args.length - 1)])
			
	}
}

module.exports = Select
