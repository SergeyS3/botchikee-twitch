const { parse } = require('tekko')
const Tools = require('./Tools')

class IrcParser {
	static parse(msg) {
		const {tags, prefix, command, params} = parse(msg)
		
		const camelCaseTags = {}
		if(tags) {
			const isBoolField = key => ['first-msg', 'mod', 'subscriber', 'turbo'].includes(key)
			for(const key of Object.keys(tags))
				camelCaseTags[Tools.kebabCaseToCamelCase(key.replace('msg-param-', ''))] = isBoolField(key) ? tags[key] === '1' : tags[key]
		}
		
		return {
			raw: msg,
			command,
			channel: this.getChannel(command, params),
			user: this.getUser(command, params, camelCaseTags, prefix),
			params,
			tags: camelCaseTags
		}
	}
	
	static getChannel(command, params) {
		let k = -1
		switch(command) {
			case '353':
				k = 2
				break
			case '366':
				k = 1
				break
			case 'CLEARCHAT':
			case 'CLEARMSG':
			case 'JOIN':
			case 'PART':
			case 'PRIVMSG':
			case 'ROOMSTATE':
			case 'USERNOTICE':
			case 'USERSTATE':
				k = 0
		}
		if(~k)
			return params[k].substr(1)
	}
	
	static getUser(command, params, tags, prefix = {}) {
		switch(command) {
			case '353':
			case '366':
				return params[0]
			case 'CLEARCHAT':
				return params[1]
			case 'JOIN':
			case 'PART':
			case 'PRIVMSG':
				return prefix.user
			case 'CLEARMSG':
			case 'USERNOTICE':
				return tags.login
		}
	}
}

module.exports = IrcParser