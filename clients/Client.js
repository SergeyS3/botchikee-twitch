const Tools = require('../Tools')
const EventEmitter = require('events').EventEmitter
const ws = require('ws')
const {parse} = require('tekko')

class Client extends EventEmitter {
	constructor(username) {
		super()
		this.username = username
	}
	connect() {
		this.ws = new ws('ws://irc-ws.chat.twitch.tv:80/', 'irc')
		
		this.ws.onmessage = e => e.data.split("\r\n").forEach(m => m && this.processMessage(m))
		this.ws.onerror = e => console.log({error: e})
		this.ws.onclose = e => console.log({close: e})
		
		return new Promise(async resolve => {
			const key = await Tools.getKey(this.username) 
			this.ws.onopen = () => {
				this.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership')
				this.send(`PASS ${key}`)
				this.send(`NICK ${this.username}`)
				resolve()
			}
		})
	}
	send(str) {
		this.emit('ws_out', str)
		this.ws.send(str)
	}
	join(channel) {
		this.send(`JOIN #${channel}`)
	}
	part(channel) {
		this.send(`PART #${channel}`)
	}
	say(channel, mess) {
		this.emit('msg_out', channel, mess)
		this.send(`PRIVMSG #${channel} :${mess}`)
	}
	processMessage(msg) {
		this.emit('ws_in', msg)
		
		const {prefix, command, trailing, params} = parse(msg)
		
		const getChannel = () => params[0].substr(1)
		
		switch(command) {
			case 'PING':
				this.send('PONG :tmi.twitch.tv')
				return
			case 'JOIN':
				if(prefix.user == this.username)
					return
				this.emit('join', getChannel(), prefix.user)
				break
			case 'PART':
				this.emit('part', getChannel(), prefix.user)
				break
			case 'PRIVMSG':
				this.emit('msg_in', getChannel(), prefix.user, trailing)
				break
		}
	}
	
}

module.exports = Client