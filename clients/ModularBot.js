const Client = require('./Client')
const ModuleModel = require('../models/module')
const SettingsModel = require('../models/settings')
const Tools = require('../tools/Tools')

class ModularBot extends Client {
	modules = []
	settings = {}
	
	constructor(username) {
		super(username)
		
		this.setModulesFromDB = this.setModulesFromDB.bind(this)
	}
	
	async setModulesFromDB() {
		const dbModules = await ModuleModel.find()
		
		for(const module of this.modules) {
			const dbModule = dbModules.find(m => m.name === module.name)
			if(dbModule) {
				if(dbModule.active != module.active)
					await (dbModule.active ? module.activate() : module.deactivate())
				
				module.channels = dbModule.channels
			}
			else {
				module.active = false
				const newModule = new ModuleModel({
					channels: [],
					name: module.name,
					active: false
				})
				try {
					await newModule.save()
				} catch (e) {
					console.error(e)
				}
			}
		}
	}
	
	async start({ moduleManagement, modules }) {
		if(moduleManagement === 'db' || [...modules.keys()].find(m => m.usingDb)) 
			await Tools.connectDB()
		
		for(const [moduleClass, moduleParams] of modules)
			this.modules.push(new moduleClass(this, moduleParams))
		
		await this.connect()
		
		if(moduleManagement === 'db') {
			await this.setModulesFromDB()
			
			this.setSettings((await SettingsModel.find())[0].toObject())
			SettingsModel.watch()
				.on('change', ({ updateDescription: { updatedFields } }) => {
					this.setSettings(updatedFields)
				})
			
			ModuleModel.watch().on('change', this.setModulesFromDB)
		}
		else
			await Promise.all(this.modules.map(() => module.activate()))
	}
	
	async setSettings(settings) {
		this.settings = Object.assign(this.settings, settings)
		if(settings.channels) {
			this.channels.forEach(c => !this.settings.channels.includes(c) && this.part(c))
			this.settings.channels.forEach(c => !this.channels.includes(c) && this.join(c))
		}
	}
	
	checkChannel(channel, channels) {
		return this.channels.includes(channel) && (
			!channels.length //no channels means all channels
			|| channels.includes(channel
		))
	}
	
	checkUser(user, users) {
		return !users.length //no users means all users
			|| users.includes(user.name)
			|| user.broadcaster && users.includes('$broadcaster')
			|| user.mod && users.includes('$mod')
	}
}

module.exports = ModularBot
