const {Schema, model} = require('mongoose')

const schema = new Schema({
	active: Boolean,
	registered: Boolean,
	module: {
		type: String,
		required: true
	},
	text: {
		type: String,
		required: true
	},
	users: [String],
})

module.exports = model('Command', schema)
