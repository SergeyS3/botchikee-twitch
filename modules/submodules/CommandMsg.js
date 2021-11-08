const Submodule = require('./Submodule')

class CommandMsg extends Submodule {
	name = 'CommandMsg'
	
	constructor() {
		super()
		
		this.msgIn = this.msgIn.bind(this)
	}
	
	activate() {
		super.activate()
		
		this.Client.on('msg_in', this.msgIn)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client.off('msg_in', this.msgIn)
	}
	
	msgIn(channel, user, msg) {
		if(user === this.Client.username)
			return
		
		let {command, args} = this.constructor.getCommand(msg)
		if(command)
			this.Client.emit('command_in', channel, user, command, args)
	}
	
	static getCommand(msg) {
		let command, args
		if(msg.indexOf('!') === 0) {
			args = msg.split(' ')
			command = args.shift()
		}
		return {command, args}
	}
}

module.exports = CommandMsg
