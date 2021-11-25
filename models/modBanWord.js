const {Schema, model} = require('mongoose')

const schema = new Schema({
	active: Boolean,
	text: {
		type: String,
		required: true
	},
	channels: [String],
})

module.exports = model('ModBanWord', schema, 'mod_ban_words')
