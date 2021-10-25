const ChatMessage = require('../tools/ChatMessage')
const Module = require('./Module')
const AnswerModel = require('../models/answer')

class Answer extends Module {
	name = 'Answer'
	static usingDb = true
	
	constructor() {
		super()
		
		this.msgIn = this.msgIn.bind(this)
		this.setAnswersFromDB = this.setAnswersFromDB.bind(this)
		this.modelChangeStream = AnswerModel.watch()
	}
	
	async activate() {
		super.activate()
		
		await this.setAnswersFromDB()
		
		this.modelChangeStream.on('change', this.setAnswersFromDB)
		
		this.Client.on('msg_in', this.msgIn)
	}
	
	async deactivate() {
		super.deactivate()
		
		this.Client.off('msg_in', this.msgIn)
		
		this.modelChangeStream.off('change', this.setAnswersFromDB)
	}
	
	async setAnswersFromDB() {
		this.answers = await AnswerModel.find()
	}
	
	async msgIn(channel, user, msg) {
		if(user == this.username || !this.checkChannel(channel))
			return
		
		const chatMessage = new ChatMessage(channel, user, msg)
		const answer = await chatMessage.makeAnswer(this.answers)
		if(answer)
			this.Client.say(channel, answer)
	}
}

module.exports = Answer
