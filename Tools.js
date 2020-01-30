const fs = require('fs')

class Tools {
	static getKey(name) {
		return fs.promises.readFile(`./keys/${name}`, 'utf8')
	}
}

module.exports = Tools