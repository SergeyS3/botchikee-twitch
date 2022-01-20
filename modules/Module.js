const EventEmitter = require('events').EventEmitter
const debug = require('debug')('Module')

class Module extends EventEmitter {
	name
	static usingDb = false
	Client
	dependencies = []
	static submodules = []
	channels = []
	active = false
	
	constructor(Client) {
		super()
		
		this.Client = Client
	}
	
	activate() {
		this.active = true
		
		for(const submoduleClass of this.dependencies)
			this.getSubmoduleInstance(submoduleClass).addModule(this)
		
		this.emit('activate')
		debug(`${this.name} activated`)
	}
	
	deactivate() {
		this.active = false
		
		for(const submoduleClass of this.dependencies)
			this.getSubmoduleInstance(submoduleClass).removeModule(this)
		
		this.emit('deactivate')
		debug(`${this.name} deactivated`)
	}
	
	checkChannel(channel) {
		return this.Client.checkChannel(channel, this.channels)
	}
	
	getSubmoduleInstance(submoduleClass) {
		let instance = Module.submodules.find(sm => sm instanceof submoduleClass)
		if(!instance) {
			instance = new submoduleClass(this.Client)
			Module.submodules.push(instance)
		}
		return instance
	}
}

module.exports = Module
