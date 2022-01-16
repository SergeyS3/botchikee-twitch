const {Schema, model} = require('mongoose')

const schema = new Schema({
	active: Boolean,
	name: {
		type: String,
		required: true
	},
	modules: [String]
})

module.exports = model('Submodule', schema)
