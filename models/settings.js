const {Schema, model} = require('mongoose')

const schema = new Schema({
	channels: [String],
})

module.exports = model('Settings', schema)
