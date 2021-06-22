const {Schema, model} = require('mongoose')

const schema = new Schema({
	active: Boolean,
	name: {
		type: String,
		required: true
	},
	channels: [String]
})

module.exports = model('Module', schema)
