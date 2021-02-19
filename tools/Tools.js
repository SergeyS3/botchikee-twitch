const mongoose = require('mongoose')

class Tools {
	static getDate() {
		const d = new Date(),
			twoDigit = s => `0${s}`.slice(-2)
		return `${d.getFullYear()}-${twoDigit(d.getMonth()+1)}-${twoDigit(d.getDate())}`
	}
	static getTime() {
		return new Date().toTimeString().substr(0, 8)
	}
	static rand(min, max){
		return (Math.random() * (++max - min) >> 0) + min
	}
	static async connectDB() {
		await mongoose.connect('mongodb://localhost/botchikee', {
			useNewUrlParser: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		})
		mongoose.set('toJSON', {
			virtuals: true,
			transform: (doc, converted) => {
				delete converted._id
			}
		})
	}
}

module.exports = Tools