const {Schema, model} = require('mongoose')

const schema = new Schema({
	active: Boolean,
	type: {
		type: String,
		enum: ['command', 'message', 'substring'],
		required: true
	},
	text: {
		type: String,
		required: true
	},
	channels: [String],
	users: [String],
	answer: {
		type: String,
		required: true
	}
})

module.exports = model('Answer', schema)