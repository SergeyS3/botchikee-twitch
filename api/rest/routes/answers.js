const Answer = require('../../../models/answer')
const { Router } = require('express')
const checkId = require('../middleware/checkId')(Answer)
const router = Router()

router.get('/', async (req, res) => {
	try {
		const answers = await Answer.find()
			.select('id active type text channels users answer')
		
		res.json(answers)
	} catch (e) {
		console.error(e)
	}
})

router.post('/', async (req, res) => {
	const {channels, users, active, type, text, answer} = req.body
	
	const newAnswer = new Answer({ channels, users, active, type, text, answer })
	
	try {
		await newAnswer.save()
		res.status(201).json(newAnswer)
	} catch (e) {
		console.error(e)
		res.status(422).json({ message: 'Answer add error' })
	}
})

router.put('/:id', checkId, async (req, res) => {
	try {
		const {channels, users, active, type, text, answer} = req.body
		
		const updatedAnswer = await Answer.findOneAndUpdate({ '_id': req.params.id }, {channels, users, active, type, text, answer})
		res.json(updatedAnswer)
	} catch (e) {
		console.error(e)
		res.status(422).json({ message: 'Answer put error' })
	}
})

router.delete('/:id', checkId, async (req, res) => {
	try {
		await Answer.deleteOne({ _id: req.params.id })
		res.json({ message: 'Answer deleted' })
	} catch (e) {
		console.error(e)
		res.status(400).json({ message: 'Bad Request' })
	}
})

module.exports = router
