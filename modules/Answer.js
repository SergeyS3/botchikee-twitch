const ChatMessage = require('../tools/ChatMessage')
const Tools = require("../tools/Tools");
const AnswerModel = require('../models/answer')

class Answer {
	constructor(Client, params) {
		this.Client = Client
		this.params = params
		Client.on('msg_in', this.msgIn.bind(this))
	}
	async setAnswers() {
		this.answers = await AnswerModel.find()
	}
	async msgIn(channel, user, msg) {
		if(user == this.username)
			return
		
		if(!this.answers) {
			await Tools.connectDB()
			
			await this.setAnswers()
			
			AnswerModel.watch().on('change', () => this.setAnswers())
		}
		
		const chatMessage = new ChatMessage(channel, user, msg)
		const answer = await chatMessage.makeAnswer(this.answers)
		if(answer)
			this.Client.say(channel, answer)
	}
}

module.exports = Answer