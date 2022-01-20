const Module = require('./Module')
const ModReplacementModel = require('../models/modReplacement')
const ModBanWordModel = require('../models/modBanWord')
const MsgQueue = require('../submodules/MsgQueue')
const CommandMsg = require('../submodules/CommandMsg')

class Mod extends Module {
	name = 'Mod'
	static usingDb = true
	dependencies = [
		MsgQueue,
		CommandMsg
	]
	replacements = []
	banWords = []
	
	constructor(Client) {
		super(Client)
		
		this.setDataFromDB = this.setDataFromDB.bind(this)
		this.checkMsg = this.checkMsg.bind(this)
		this.addBanWordCommand = this.addBanWordCommand.bind(this)
		
		this.replacementModelChangeStream = ModReplacementModel.watch()
		this.banWordModelChangeStream = ModBanWordModel.watch()
		
		this.queue = this.getSubmoduleInstance(MsgQueue).queue
		
		this.getSubmoduleInstance(CommandMsg).register(this, new Map([
			['!banword', this.addBanWordCommand]
		]))
	}
	
	async activate() {
		super.activate()
		
		await this.setDataFromDB()
		
		this.replacementModelChangeStream.on('change', this.setDataFromDB)
		this.banWordModelChangeStream.on('change', this.setDataFromDB)
		
		this.Client.on('msg_in', this.checkMsg)
	}
	
	deactivate() {
		super.deactivate()
		
		this.Client.off('msg_in', this.checkMsg)
		
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
	
	async addBanWordCommand(args, channel) {
		if(!args.length)
			return
		
		const text = args.join(' ')
		
		try {
			this.once('data_set', () => {
				for(const { user, msg, timeouted } of this.queue[channel]) {
					if(timeouted || this.checkMsg(channel, user, msg))
						continue
					
					const sameUserMsgs = this.queue[channel].filter(mess => mess.user.name === user.name)
					for(const sameUserMsg of sameUserMsgs)
						sameUserMsg.timeouted = true
				}
			})
			
			let banWord = await ModBanWordModel.findOne({ active: true, text })
			if(banWord) {
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
	
	checkMsg(channel, user, msg) {
		if(
			user.self
			|| user.broadcaster
			|| user.mod
			|| !this.checkChannel(channel)
		)
			return true
		
		msg = this.normalizeText(msg)
		
		const banWord = this.banWords.find(banWord => 
			msg.includes(banWord.text)
			&& this.Client.checkChannel(channel, banWord.channels)
		)
		if(!banWord)
			return true
		
		this.Client.timeout(channel, user.name, 60 * 60 * 24 * 14, `ban word: ${banWord.text} (id ${banWord.id})`)
		
		return false
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
