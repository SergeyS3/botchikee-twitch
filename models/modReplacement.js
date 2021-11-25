const {Schema, model} = require('mongoose')

const schema = new Schema({
	from: {
		type: String,
		required: true
	},
	to: String,
})

module.exports = model('ModReplacement', schema, 'mod_replacements')
