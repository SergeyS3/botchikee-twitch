const ModularBot = require('./clients/ModularBot')
const FileLogger = require('./modules/Logger/File')
const Answer = require('./modules/Answer')
const Pyramid = require('./modules/Pyramid')
const Select = require('./modules/Select')
const Spam = require('./modules/Spam')
const path = require('path')

const Bot = new ModularBot('botchikee')

;(async () => {
	try {
		await Bot.start({
			moduleManagement: 'db',
			modules: new Map([
				[FileLogger, path.join(__dirname, 'data/logs/full')],
				[Answer],
				[Pyramid, 3],
				[Select],
				[Spam, ['modchikee', 'memechikee']]
			])
		})
	} catch (e) {
		console.error(e)
	}
})()
