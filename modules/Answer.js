const ChatMessageParser = require('../tools/ChatMessageParser')

class Answer {
	constructor(Client) {
		Client.on('msg_in', (channel, user, msg) => {
			if(user == this.username)
				return
			
			const answer = new ChatMessageParser(channel, user, msg).findAnswer()
			if(answer)
				Client.say(channel, answer)
		})
	}
}

module.exports = Answer