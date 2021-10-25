const Module = require('./Module')
const MsgQueue = require('./submodules/MsgQueue')

class Pyramid extends Module {
	name = 'Pyramid'
	dependencies = [
		MsgQueue
	]
	minWidth
	
	constructor(minWidth) {
		super()
		
		this.minWidth = minWidth || 3
		
		this.msgIn = this.msgIn.bind(this)
	}
	
	activate() {
		super.activate()
		
		this.queue = this.getSubmoduleInstance(MsgQueue).queue
		
		this.Client.on('msg_in', this.msgIn)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client.off('msg_in', this.msgIn)
		
		this.queue = {}
	}
	
	
	async msgIn(channel, user, msg) {
		if(user === this.username || !this.checkChannel(channel) || !/^\w{3,15}$/.test(msg))
			return
		
		const pyramidWidth = this.getPyramidWidth(this.queue[channel], user, msg)
		if(pyramidWidth >= this.minWidth)
			this.Client.say(channel, `nice ${pyramidWidth}-width ${msg} pyramid ${user} LUL`)
	}
	
	getPyramidWidth(queue, builder, word) {
		let checkWidth = 1
		let pyramidWidth
		let directionUp = true
		
		queue = queue.slice()
		queue.pop()
		
		for(const {user, msg} of queue.reverse()) {
			if(user !== builder)
				break
			
			const checkRow = () => msg === word + ` ${word}`.repeat(checkWidth - 1)
			
			if(directionUp) {
				checkWidth++
				if(checkRow())
					continue
				
				if(checkWidth === 2)
					break
				
				checkWidth -= 2
				if(checkRow()) {
					pyramidWidth = checkWidth + 1
					directionUp = false
				}
				else
					break
			}
			else {
				checkWidth--
				if(!checkRow())
					break
			}
			if(checkWidth === 1)
				return pyramidWidth
		}
		return 1
	}
}

module.exports = Pyramid
