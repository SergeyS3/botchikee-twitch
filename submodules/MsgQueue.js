const Submodule = require('./Submodule')

class MsgQueue extends Submodule {
	name = 'MsgQueue'
	queue = {}
	static length = 100
	
	constructor(Client) {
		super(Client)
		
		this.msgIn = this.msgIn.bind(this)
		this.msgOut = this.msgOut.bind(this)
	}
	
	activate() {
		super.activate()
		
		this.Client.on('msg_in', this.msgIn)
		this.Client.on('msg_out', this.msgOut)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client.off('msg_in', this.msgIn)
		this.Client.off('msg_out', this.msgOut)
		this.queue = {}
	}
	
	msgIn(channel, user, msg) {
		this.addToQueue(channel, user, msg)
	}
	
	msgOut(channel, msg) {
		this.addToQueue(channel, {name: this.Client.username, self: true}, msg)
	}
	
	addToQueue(channel, user, msg) {
		if(!this.queue[channel])
			this.queue[channel] = []
		else if(this.queue[channel].length > 100)
			this.queue[channel].shift()
		
		this.queue[channel].push({ user, msg })
	}
}

module.exports = MsgQueue
