const Module = require('./Module')
const AnswerModel = require('../models/answer')
const CommandMsg = require('./submodules/CommandMsg')
const Tools = require('../tools/Tools')
const debug = require('debug')('Answer module')

const users = require('../data/users')

class Answer extends Module {
	name = 'Answer'
	static usingDb = true
	dependencies = [
		CommandMsg
	]
	
	constructor(Client) {
		super(Client)
		
		this.msgIn = this.msgIn.bind(this)
		this.sayCommand = this.sayCommand.bind(this)
		this.setAnswersFromDB = this.setAnswersFromDB.bind(this)
		
		this.modelChangeStream = AnswerModel.watch()
		
		this.getSubmoduleInstance(CommandMsg).register(this, new Map([
			['!say', this.sayCommand]
		]))
	}
	
	async activate() {
		super.activate()
		
		await this.setAnswersFromDB()
		
		this.modelChangeStream.on('change', this.setAnswersFromDB)
		
		this.Client.on('msg_in', this.msgIn)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client.off('msg_in', this.msgIn)
		
		this.modelChangeStream.off('change', this.setAnswersFromDB)
	}
	
	async setAnswersFromDB() {
		this.answers = await AnswerModel.find()
	}
	
	msgIn(channel, user, msg) {
		if(user === this.Client.username || !this.checkChannel(channel))
			return
		
		let {command, args} = CommandMsg.getCommand(msg)
		const answer = this.answers.find(a => {
			if(
				!a.active
				|| a.channels.length && !a.channels.includes(channel)
				|| a.users.length && !a.users.includes(user)
			)
				return
			
			switch(a.type) {
				case 'command':
					return a.text === command
				case 'message':
					return a.text === msg
				case 'substring':
					return msg.includes(a.text)
			}
		})
		if(answer)
			this.answer(channel, answer.answer, user, args)
	}
	
	sayCommand(channel, user, args) {
		this.answer(channel, args.join(' '), user, args)
	}
	
	answer(channel, answer, user, args) {
		try {
			this.Client.say(channel, this.replaceVars(answer, user, args))
		} catch (e) {
			debug(`Error: ${e.message}`)
		}
	}
	
	replaceVars(answer, user, args) {
		if(!answer)
			return ''
		
		let replaceable, replacement
		const replacements = new Map([
		    [
				'$sender',
			    () => user
			], [
				/\$args{([^}]*)}/,
				([,argN]) => {
					if(!args || !argN)
						throw Error('bad $args args')
					if(args[argN]?.includes('$args{')) //prevent recursion
						throw Error('wrong $args args')
					
					return args[argN]
				}
			], [
				/\$rand{([^}]*)}/,
				([,arg]) => {
					const match = arg.match(/^(\d+)-(\d+)$/)
					if(!match)
						throw Error('bad $rand args')
					const min = +match[1],
						max = +match[2]
					if(min > max || max > Number.MAX_SAFE_INTEGER)
						throw Error('wrong $rand args')
					
					return Tools.rand(min, max)
				}
			]
		])
		
		for(const [ searchVal, getReplacement ] of replacements) {
			if(typeof searchVal == 'string') {
				if(answer.includes(searchVal)) {
					replaceable = searchVal
					replacement = getReplacement()
				}
								
			}
			else {
				const match = answer.match(searchVal)
				if(match) {
					replaceable = match[0]
					replacement = getReplacement(match)
				}
			}
			if(replaceable)
				break
		}
		
		return replaceable ? this.replaceVars(answer.replace(replaceable, replacement), user, args) : answer
	}
}

module.exports = Answer
