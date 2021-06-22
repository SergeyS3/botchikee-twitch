const debug = require('debug')('Module')

class Module {
	static usingDb = false
	channels = []
	active = false
	get name() {
		return ''
	}
	
	constructor() {
		if(!this.name)
			throw Error('module must have a name')
	}
	
	activate() {
		this.active = true
		debug(`module ${this.name} activated`)
	}
	
	deactivate() {
		this.active = false
		debug(`module ${this.name} deactivated`)
	}
	
	checkChannel(channel) {
		return !this.channels.length || this.channels.includes(channel)
	}
}

module.exports = Module
