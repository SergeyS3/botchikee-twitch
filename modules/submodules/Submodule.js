const debug = require('debug')('Submodule')

class Submodule {
	name
	Client
	modules = []
	active = false
	
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
	}
	
	removeModule(module) {
		this.modules = this.modules.filter(m => m !== module)
		
		debug(`${this.name} -module ${module.name}`)
		
		if(!this.modules.length)
			this.deactivate()
	}
}

module.exports = Submodule
