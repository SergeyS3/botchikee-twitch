const Client = require('./Client')
const ModuleModel = require('../models/module')
const Tools = require('../tools/Tools')

class ModularBot extends Client {
	modules = []
	
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
					channels: module.channels,
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
		if(moduleManagement == 'db' || [...modules.keys()].find(m => m.usingDb)) 
			await Tools.connectDB()
		
		for(const [moduleClass, moduleParams] of modules) {
			module = new moduleClass(moduleParams)
			module.Client = this
			this.modules.push(module)
		}
		
		if(moduleManagement == 'db') {
			await this.setModulesFromDB()
			
			ModuleModel.watch().on('change', this.setModulesFromDB)
		}
		else
			await Promise.all(this.modules.map(() => module.activate()))
		
		await this.connect()
	}
}

module.exports = ModularBot
