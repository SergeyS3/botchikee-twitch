const debug = require('debug')('ChatMessage')
const Tools = require('./Tools')

class ChatMessage {
	constructor(channel, user, msg) {
		this.channel = channel
		this.user = user
		this.msg = msg
		
		this.command = ''
		this.args = []
		if(this.msg.indexOf('!') === 0) {
			this.args = this.msg.split(' ')
			this.command = this.args.shift()
		}
	}
	
	async makeAnswer(answers) {
		const answer = answers.find(a => {
			if(
				!a.active
				|| a.channels.length && !a.channels.includes(this.channel)
				|| a.users.length && !a.users.includes(this.user)
			)
				return
			
			switch(a.type) {
				case 'command':
					return a.text === this.command
				case 'message':
					return a.text === this.msg
				case 'substring':
					return this.msg.includes(a.text)
			}
		})
		if(!answer)
			return ''
		
		try {
			return this.replaceAnswerVars(answer.answer)
		} catch (e) {
			debug(`Error: ${e.message}`)
		}
		return ''
	}
	
	replaceAnswerVars(answer) {
		if(!answer)
			return ''
		
		let replacement = '', match
		[
			{
				searchVal: '$sender',
				getReplacement: () => this.user
			}, {
				searchVal: /\$args{([^}]*)}/,
				getReplacement: ([,argN]) => {
					if(!argN)
						throw Error('bad $args args')
					if(!this.args[argN] || this.args[argN].includes('$args{'))
						throw Error('wrong $args args')
					
					return this.args[argN]
				}
			}, {
				searchVal: /\$rand{([^}]*)}/,
				getReplacement: ([,arg]) => {
					const match = arg.match(/(\d+)-(\d+)/)
					if(!match)
						throw Error('bad $rand args')
					const min = +match[1],
						max = +match[2]
					if(min > max)
						throw Error('wrong $rand args')
					
					return Tools.rand(min, max)
				}
			},
		].some(({ searchVal, getReplacement }) => {
			if(typeof searchVal == 'string')
				match = answer.includes(searchVal) ? [searchVal] : ''
			else
				match = answer.match(searchVal)
			
			replacement = match ? getReplacement(match) : ''
			
			return !!match
		})
		
		return match ? this.replaceAnswerVars(answer.replace(match[0], replacement)) : answer
	}
}

module.exports = ChatMessage
