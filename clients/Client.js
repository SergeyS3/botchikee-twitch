const IrcParser = require('../tools/IrcParser')
const EventEmitter = require('events').EventEmitter
const ws = require('ws')
const debug = require('debug')('ws')
const tokens = require('../data/tokens')

class Client extends EventEmitter {
	wasCloseCalled = false
	reconnectTimer = {
		current: 1000,
		min: 1000,
		max: 3600000
	}
	channels = []

	constructor(username) {
		super()
		this.username = username
		
		if(!tokens[this.username])
			throw Error(`key for ${this.username} not found`)
	}
	
	connect() {
		this.ws = new ws('ws://irc-ws.chat.twitch.tv:80/', 'irc')
		
		this.ws.onmessage = e => e.data.split("\r\n").forEach(m => m && this.onMessage(m))
		this.ws.onerror = this.onError.bind(this)
		this.ws.onclose = this.onClose.bind(this)
		
		return new Promise(resolve => {
			this.ws.onopen = () => {
				this.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership')
				this.send(`PASS oauth:${tokens[this.username]}`)
				this.send(`NICK ${this.username}`)
				this.once('connected', resolve)
			}
		})
	}
	
	disconnect() {
		this.unsetPingLoop()
		
		return new Promise(resolve => {
			if(this.ws.readyState <= this.ws.OPEN) {
				this.wasCloseCalled = true
				this.once('disconnected', resolve)
				
				this.ws.close(1000)
			}
			else
				resolve()
		})
	}
	
	reconnect() {
		this.reconnectTimer.current = Math.min(this.reconnectTimer.current * 2, this.reconnectTimer.max)
		
		setTimeout(async () => {
			await this.disconnect()
			await this.connect()
			
			this.channels.forEach(c => this.join(c))
			
			this.reconnectTimer.current = this.reconnectTimer.min
		}, this.reconnectTimer.current)
	}
	
	send(str) {
		debug(`< ${str}`)
		
		this.emit('ws_out', str)
		this.ws.send(str)
	}
	
	join(channel) {
		this.send(`JOIN #${channel}`)
		
		if(!this.channels.includes(channel))
			this.channels.push(channel)
	}
	
	part(channel) {
		this.send(`PART #${channel}`)
		
		this.channels = this.channels.filter(c => c !== channel)
	}
	
	say(channel, msg, unsafe = false) {
		if(!unsafe && ['.', '/'].includes(msg[0]))
			msg = msg.substr(1)
		
		if(msg.length > 500) {
			const chunks = msg.match(/.{1,500}/g)
			if(unsafe || chunks.length < 4)
				for(const chunk of chunks)
					this.say(channel, chunk, unsafe)
			
			return
		}
		
		this.emit('msg_out', channel, msg)
		this.send(`PRIVMSG #${channel} :${msg}`)
	}
	
	ban(channel, username, reason) {
		this.say(channel, `/ban ${username} ${reason}`, true)
	}
	
	unban(channel, username) {
		this.say(channel, `/unban ${username}`, true)
	}
	
	timeout(channel, username, duration, reason) {
		this.say(channel, `/timeout ${username} ${duration} ${reason}`, true)
	}
	
	untimeout(channel, username) {
		this.say(channel, `/untimeout ${username}`, true)
	}
	
	onMessage(msg) {
		debug(`> ${msg}`)

		const parsedMsg = IrcParser.parse(msg)
		const {command, channel, user, params, tags} = parsedMsg
		
		this.emit('ws_in', parsedMsg)
		
		switch(command) {
			case '353':
				params[3].split(' ').forEach( user => this.emit('join', channel, user) )
				break
			case '372':
				this.emit('connected')
				this.setPingLoop()
				break
			case 'PING':
				this.send('PONG :tmi.twitch.tv')
				return
			case 'PONG':
				this.resetPingLoop()
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
				this.emit('msg_in', channel, user, params[1].trim(), tags)
				break
			case 'RECONNECT':
				this.reconnect()
				break
		}
	}
	
	onError(e) {
		console.error('ws error. Code: ' + e.code)
	}
	
	onClose(e) {
		this.emit('disconnected')
		
		if(this.wasCloseCalled)
	        this.wasCloseCalled = false
	    else {
	    	console.error('ws unexpected close. Code: ' + e.code)
	    	this.reconnect()
		}
	}
	
	setPingLoop() {
		this.pingLoop = setInterval(() => {
            this.send('PING')
            this.pingTimeout = setTimeout(() => {
                this.unsetPingLoop()
	            console.error('ping timeout')
                this.reconnect()
            }, 10000)
        }, 60000)
	}
	
	resetPingLoop() {
		clearTimeout(this.pingTimeout)
	}
	
	unsetPingLoop() {
		clearInterval(this.pingLoop)
		this.resetPingLoop()
	}
}

module.exports = Client