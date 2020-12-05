
class Tools {
	static getDate() {
		const d = new Date(),
			twoDigit = s => `0${s}`.slice(-2)
		return `${d.getFullYear()}-${twoDigit(d.getMonth()+1)}-${twoDigit(d.getDate())}`
	}
	static getTime() {
		return new Date().toTimeString().substr(0, 8)
	}
}

module.exports = Tools