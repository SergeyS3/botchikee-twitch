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
	
	activate() {
		this.active = true
		
		for(const submoduleClass of this.dependencies)
			this.getSubmoduleInstance(submoduleClass).addModule(this)
		
		debug(`${this.name} activated`)
	}
	
	deactivate() {
		this.active = false
		
		for(const submoduleClass of this.dependencies)
			this.getSubmoduleInstance(submoduleClass).removeModule(this)
		
		debug(`${this.name} deactivated`)
	}
	
	checkChannel(channel) {
		return !this.channels.length || this.channels.includes(channel)
	}
	
	getSubmoduleInstance(submoduleClass) {
		let instance = Module.submodules.find(sm => sm instanceof submoduleClass)
		if(!instance) {
			instance = new submoduleClass()
			instance.Client = this.Client
			Module.submodules.push(instance)
		}
		return instance
	}
}

module.exports = Module
