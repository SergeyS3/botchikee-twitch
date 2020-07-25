const IrcParser = require('../tools/IrcParser')
const EventEmitter = require('events').EventEmitter
const ws = require('ws')
const keys = require('../data/keys.json')

class Client extends EventEmitter {
	constructor(username) {
		super()
		this.username = username
		
		if(!keys[this.username])
			throw new Error(`key for ${this.username} not found`)
	}
	
	connect() {
		this.ws = new ws('ws://irc-ws.chat.twitch.tv:80/', 'irc')
		
		this.ws.onmessage = e => e.data.split("\r\n").forEach(m => m && this.processMessage(m))
		this.ws.onerror = e => console.log({error: e})
		this.ws.onclose = e => console.log({close: e})
		
		return new Promise(resolve => {
			this.ws.onopen = () => {
				this.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership')
				this.send(`PASS ${keys[this.username]}`)
				this.send(`NICK ${this.username}`)
				this.once('connected', resolve)
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
	
	say(channel, msg) {
		this.emit('msg_out', channel, msg)
		this.send(`PRIVMSG #${channel} :${msg}`)
	}
	
	processMessage(msg) {
		this.emit('ws_in', msg)
		
		const {command, channel, user, params, tags} = IrcParser.parse(msg)
		
		switch(command) {
			case '353':
				params[3].split(' ').forEach( user => this.emit('join', channel, user) )
				break
			case '372':
				this.emit('connected');
				break
			case 'PING':
				this.send('PONG :tmi.twitch.tv')
				return
			case 'JOIN':
				if(user === this.username)
					return
				this.emit('join', channel, user)
				break
			case 'PART':
				this.emit('part', channel, user)
				break
			case 'PRIVMSG':
				this.emit('msg_in', channel, user, params[1], tags)
				break
		}
	}
}

module.exports = Client