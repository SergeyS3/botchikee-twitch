const Module = require('./Module')
const MsgQueue = require('../submodules/MsgQueue')
const emojiRegex = require('emoji-regex')()

class Pyramid extends Module {
	name = 'Pyramid'
	dependencies = [
		MsgQueue
	]
	minWidth
	
	constructor(Client, minWidth) {
		super(Client)
		
		this.minWidth = minWidth || 3
		
		this.queue = this.getSubmoduleInstance(MsgQueue).queue
		
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
	
	async msgIn(channel, user, msg) {
		const queue = this.queue[channel].slice() //saving queue state on function call
		
		if(user.self || !this.checkChannel(channel) || !this.constructor.canBeEmote(msg))
			return
		
		const pyramidWidth = this.constructor.getPyramidWidth(queue, user.name, msg)
		if(pyramidWidth >= this.minWidth)
			this.Client.say(channel, `nice ${pyramidWidth}-width ${msg} pyramid ${user.displayName} LUL`)
	}
	
	static canBeEmote(msg) {
		if([
			'D:', 'R)', ';p', ':p',
			';)', ':\\', '<3', ':O',
			'B-)', 'B)', 'O_o', ':|',
			'>(', ':D', ':-(', ':(',
			':-)', ':)',
		].includes(msg))
			return true
		
		if(msg.match(/^\w{3,15}$/) && msg.match(/\D/))
			return true
		
		const emojisMatch = msg.match(emojiRegex)
		if(!emojisMatch)
			return false
		
		if(emojisMatch.length === 1)
			return true
		
		const emojiSequencesMatch = emojisMatch.join("\u200d").match(emojiRegex)
		return emojiSequencesMatch?.length === 1
	}
	
	static getPyramidWidth(queue, username, str) {
		let checkWidth = 1
		let pyramidWidth
		let directionUp = true
		
		queue.pop()
		
		for(const { user, msg } of queue.reverse()) {
			if(user.name !== username)
				break
			
			const checkRow = () => msg === str + ` ${str}`.repeat(checkWidth - 1)
			
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
