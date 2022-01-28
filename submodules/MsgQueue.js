const Submodule = require('./Submodule')

class MsgQueue extends Submodule {
	name = 'MsgQueue'
	queue = {}
	
	constructor(Client) {
		super(Client)
		
		this.msgIn = this.msgIn.bind(this)
		this.msgOut = this.msgOut.bind(this)
		this.clearChat = this.clearChat.bind(this)
	}
	
	activate() {
		super.activate()
		
		this.Client.on('msg_in', this.msgIn)
		this.Client.on('msg_out', this.msgOut)
		this.Client.on('clear_chat', this.clearChat)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client.off('msg_in', this.msgIn)
		this.Client.off('msg_out', this.msgOut)
		this.Client.off('clear_chat', this.clearChat)
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
			this.queue[channel] = new ChannelQueue
			
		this.queue[channel].push({ user, msg })
	}
	
	clearChat(channel, username) {
		this.queue[channel]?.setDeleted(username)
	}
}

module.exports = MsgQueue

class ChannelQueue extends Array {
	maxLength = 100
	
	push(...items) {
		if(this.length > this.maxLength)
			this.shift()
		return super.push(...items)
	}
	
	setDeleted(username) {
		this.filter(mess => mess.user.name === username)
			.forEach(mess => mess.deleted = true)
	}
}
