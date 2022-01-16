const EventEmitter = require('events').EventEmitter
const SubmoduleModel = require('../../models/submodule')
const debug = require('debug')('Submodule')

class Submodule extends EventEmitter {
	name
	Client
	modules = []
	active = false
	
	constructor(Client) {
		super()
		this.Client = Client
	}
	
	activate() {
		this.active = true
		
		debug(`${this.name} activated`)
	}
	
	deactivate() {
		this.active = false
		
		debug(`${this.name} deactivated`)
	}
	
	addModule(module) {
		this.modules.push(module)
		
		debug(`${this.name} +module ${module.name}`)
		
		if(!this.active)
			this.activate()
		
		this.setDataToDB()
	}
	
	removeModule(module) {
		this.modules = this.modules.filter(m => m !== module)
		
		debug(`${this.name} -module ${module.name}`)
		
		if(!this.modules.length)
			this.deactivate()
		
		this.setDataToDB()
	}
	
	async setDataToDB() {
		await SubmoduleModel.findOneAndUpdate(
			{ name: this.name },
			{
				modules: this.modules.map(m => m.name),
				active: this.active
			},
			{ upsert: true }
		)
	}
}

module.exports = Submodule
