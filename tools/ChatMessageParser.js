const Tools = require('./Tools')

class ChatMessageParser {
	constructor(channel, user, msg) {
		this.channel = channel
		this.user = user
		this.msg = msg
		
		if(this.msg.indexOf('!') === 0) {
			this.args = this.msg.split(' ')
			this.command = this.args.shift()
		}
		else {
			this.command = ''
			this.args = []	
		}
		
		this.answers = [
			{type: 'message',	text: 'qq',		channels: ['tst'],	users: ['airchikee'],	answer: 'qq(1)'},
			{type: 'message',	text: 'qq',							users: ['tst'],			answer: 'qq(2)'},
			{type: 'message',	text: 'aa',		channels: ['tst'],							answer: 'aa(3)'},
			{type: 'message',	text: 'aa',		channels: ['airchikee'],					answer: 'aa(4)'},
			{type: 'message',	text: 'ww',		channels: ['airchikee'],					answer: 'ww(5)'},
			{type: 'substring', text: 'ЦЦЦ',												answer: 'ЦЦЦ(6)'},
			{type: 'command',	text: '!qq',	channels: ['tst'],							answer: 'qq(7)'},
			{type: 'command',	text: '!qq',	channels: ['airchikee'],					answer: 'qq(8) @$sender'},
			{type: 'command',	text: '!say',	channels: ['airchikee'],					answer: '$mess'},
			{type: 'command',	text: '!rand',												answer: '$rand{$args{0}}'},
			{type: 'command',	text: '!rand%',												answer: '$rand{1-100}%'},
			{type: 'command',	text: '!select',											answer: '$randArg'},
		]
	}
	findAnswer() {
		const answer = this.answers.find(a => {
			if(a.channels && !a.channels.includes(this.channel))
				return false
			if(a.users && !a.users.includes(this.channel))
				return false
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
			answer.answer = this.replaceAnswerVars(answer.answer)
		} catch (e) {
			console.error(e)
		}
		return answer.answer
	}
	replaceAnswerVars(answer) {
		if(!answer)
			return ''
		
		let replacement = '', match
		[
			{
				searchVal: '$mess',
				getReplacement: () => this.args.join(' ')
			}, {
				searchVal: '$sender',
				getReplacement: () => this.user
			}, {
				searchVal: '$randArg',
				getReplacement: () => {
					if(this.args.length < 1)
						throw 'bad $randArg args'
					
					return this.args[Tools.rand(1, this.args.length) - 1]
				}
			}, {
				searchVal: /\$args{([^}]*)}/,
				getReplacement: ([,argN]) => {
					if(!argN)
						throw 'bad $args args'
					if(!this.args[argN] || this.args[argN].includes('$args{'))
						throw 'wrong $args args'
					
					return this.args[argN]
				}
			}, {
				searchVal: /\$rand{([^}]*)}/,
				getReplacement: ([,arg]) => {
					const match = arg.match(/(\d+)-(\d+)/)
					if(!match)
						throw 'bad $rand args'
					const min = +match[1],
						max = +match[2]
					if(min > max)
						throw 'wrong $rand args'
					
					return Tools.rand(min, max)
				}
			},
		].some( ({searchVal, getReplacement}) => {
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

module.exports = ChatMessageParser