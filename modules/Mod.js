const Module = require('./Module')
const ModReplacementModel = require('../models/modReplacement')
const ModBanWordModel = require('../models/modBanWord')
const MsgQueue = require('./submodules/MsgQueue')
const CommandMsg = require('./submodules/CommandMsg')

const users = require('../data/users')

class Mod extends Module {
	name = 'Mod'
	static usingDb = true
	dependencies = [
		MsgQueue,
		CommandMsg
	]
	replacements = []
	banWords = []
	
	constructor() {
		super()
		
		this.setDataFromDB = this.setDataFromDB.bind(this)
		this.msgIn = this.msgIn.bind(this)
		this.commandIn = this.commandIn.bind(this)
		
		this.replacementModelChangeStream = ModReplacementModel.watch()
		this.banWordModelChangeStream = ModBanWordModel.watch()
	}
	
	async activate() {
		super.activate()
		
		await this.setDataFromDB()
		
		this.replacementModelChangeStream.on('change', this.setDataFromDB)
		this.banWordModelChangeStream.on('change', this.setDataFromDB)
		
		this.queue = this.getSubmoduleInstance(MsgQueue).queue
		
		this.Client.on('msg_in', this.msgIn)
		this.Client.on('command_in', this.commandIn)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client.off('command_in', this.commandIn)
		this.Client.off('msg_in', this.msgIn)
		
		this.queue = {}
		
		this.banWordModelChangeStream.off('change', this.setDataFromDB)
		this.replacementModelChangeStream.off('change', this.setDataFromDB)
	}
	
	async setDataFromDB() {
		this.replacements = (await ModReplacementModel.find())
			.reduce((replacements, replacement) => {
				replacement.from = this.replaceAll(replacement.from, replacements)
				replacements.push(replacement)
				return replacements
			}, [])
		
		this.banWords = (await ModBanWordModel.find())
			.reduce((banWords, banWord) => {
				if(banWord.active) {
					banWord.text = this.normalizeText(banWord.text)
					if(banWord.text)
						banWords.push(banWord)
				}
				return banWords
			}, [])
		
		this.emit('data_set')
	}
	
	msgIn(channel, user, msg, userInfo) {
		if(
			user === this.Client.username
			|| user === channel
			|| +userInfo.mod
			|| !this.checkChannel(channel)
		)
			return
		
		this.checkMsg(channel, user, msg)
	}
	
	async commandIn(channel, user, command, args) {
		if(!this.checkChannel(channel) || !args.length)
			return
		
		if(command === '!banword') {
			if(users[user] !== 'owner')
				return
			
			const text = args.join(' ')
			
			try {
				this.once('data_set', () => {
					for(const {user, msg} of this.queue[channel])
						this.checkMsg(channel, user, msg)
				})
				
				let banWord = await ModBanWordModel.findOne({ text })
				if(banWord) {
					banWord.active = true
					if(!banWord.channels.includes(channel))
						banWord.channels.push('airchikee')
				}
				else
					banWord = new ModBanWordModel({
						active: true,
						text,
						channels: [channel]
					})
				
				banWord.save()
			} catch (e) {
				console.error(e)
			}
		}
			
	}
	
	checkMsg(channel, user, msg) {
		msg = this.normalizeText(msg)
		
		if(this.banWords.find(banWord => msg.includes(banWord.text)))
			this.Client.timeout(channel, user, 5, 'test')
	}
	
	normalizeText(text) {
		text = text.toLowerCase()
		
		let prevText
		do {
			prevText = text
			text = this.replaceAll(text, this.replacements)
			if(!text)
				return ''
		} while(prevText !== text)
		
		return [ ...text.matchAll(/[\p{L}\p{N}]+/ug) ].map(m => m[0]).join('')
	}
	
	replaceAll(text, replacements) {
		for(const replacement of replacements)
			text = text.replace(new RegExp(replacement.from, 'g'), replacement.to)
		return text
	}
}

module.exports = Mod
