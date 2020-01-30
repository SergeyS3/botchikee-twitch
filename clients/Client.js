const Tools = require('../Tools')
const EventEmitter = require('events').EventEmitter
const ws = require('ws')
const {parse} = require('tekko')

class Client extends EventEmitter {
	constructor(username) {
		super()
		this.username = username
	}
	async connect() {
		this.ws = new ws('ws://irc-ws.chat.twitch.tv:80/', 'irc')
		
		const key = await Tools.getKey(this.username)
		
		this.ws.onmessage = e => e.data.split("\r\n").filter(m => m).forEach(m => this.processMessage(m))
		this.ws.onerror = e => console.log({error: e})
		this.ws.onclose = e => console.log({close: e})
		
		return new Promise(resolve => {
			this.ws.onopen = () => {
				this.ws.send(`PASS ${key}`)
				this.ws.send(`NICK ${this.username}`)
				resolve()
			}
		})
	}
	join(channel) {
		this.ws.send(`JOIN #${channel}`);
	}
	processMessage(mess) {
		let {prefix: {user}, command, trailing} = parse(mess)
		
		console.log({mess: mess, parsed: {user, command, trailing}})
	}
}

module.exports = Client