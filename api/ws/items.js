const Tools = require('../Tools')
const WebSocket = require('ws')
const Settings = require('../../models/settings')
const Module = require('../../models/module')
const Submodule = require('../../models/submodule')
const Answer = require('../../models/answer')
const ModReplacement = require('../../models/modReplacement')
const ModBanWord = require('../../models/modBanWord')
const Command = require('../../models/command')

const items = [
	{
		model: Settings,
		path: '/settings'
	},
	{
		model: Module,
		path: '/modules'
	},
	{
		model: Submodule,
		path: '/submodules'
	},
	{
		model: Answer,
		path: '/answers'
	},
	{
		model: ModReplacement,
		path: '/mod-replacements'
	},
	{
		model: ModBanWord,
		path: '/mod-ban-words'
	},
	{
		model: Command,
		path: '/commands'
	},
]

for(const item of items) {
	const modelChangeStream = item.model.watch()
	
	item.wss = new WebSocket.Server({ noServer: true })
		.on('connection', ws => {
			Tools.addPingLoop(ws)
			
			const onModelChange = () => ws.send('changed')
			
			modelChangeStream.on('change', onModelChange)
			ws.on('close', () => modelChangeStream.off('change', onModelChange))
		})
}

module.exports = items