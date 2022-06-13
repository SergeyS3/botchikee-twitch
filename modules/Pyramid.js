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
		if(user.self || !this.checkChannel(channel) || !this.constructor.canBeEmote(msg))
			return
		
		const pyramidWidth = this.constructor.getPyramidWidth(this.queue[channel], user.name, msg)
		if(pyramidWidth >= this.minWidth)
			this.Client.say(channel, `nice ${pyramidWidth}-width ${msg} pyramid ${user.displayName} LUL`)
	}
	
	static canBeEmote(msg) {
		if([
			//twitch
			'R)', ';p', ':p', ';)', ':\\', '<3', ':O', 'B-)', 'B)', 'O_o', ':|', '>(', ':D', ':-(', ':(', ':-)', ':)',
			//bttv
			'D:', ':tf:', 'M&Mjc',
			//7tv
			'EZ'
		].includes(msg))
			return true
		
		if(msg.match(/^\w{3,100}$/) && msg.match(/\D/))
			return true
		
		return this.isEmoji(msg)
	}
	
	static isEmoji(str) {
		const emojisMatch = str.match(emojiRegex)
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
		let isEmoji = this.isEmoji(str)
		
		queue = queue.slice()
		queue.pop()
		
		for(const { user, msg, deleted } of queue.reverse()) {
			if(deleted || user.name !== username)
				break
			
			const checkRow = () => 
				msg === str + ` ${str}`.repeat(checkWidth - 1)
				|| isEmoji && msg === str.repeat(checkWidth)
			
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
