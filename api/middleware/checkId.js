const mongoose = require('mongoose')

module.exports = model => {
	return async (req, res, next) => {
		const send400 = () => res.status(400).json({ message: 'Bad Request' })
		
		try {
			if(!mongoose.Types.ObjectId.isValid(req.params.id))
				send400()
			
			if(!await model.exists({ '_id': req.params.id }))
				res.status(404).json({ message: 'Not found' })
			else
				next()
		} catch (e) {
			send400()
		}
	}
}
