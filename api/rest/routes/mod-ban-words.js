const ModBanWord = require('../../../models/modBanWord')
const { Router } = require('express')
const checkId = require('../middleware/checkId')(ModBanWord)
const router = Router()

router.get('/', async (req, res) => {
	try {
		const banWords = await ModBanWord.find()
			.select('active text channels')
		
		res.json(banWords)
	} catch (e) {
		console.error(e)
	}
})

router.post('/', async (req, res) => {
	const {active, text, channels} = req.body
	
	const newBanWord = new ModBanWord({ active, text, channels })
	
	try {
		await newBanWord.save()
		res.status(201).json(newBanWord)
	} catch (e) {
		console.error(e)
		res.status(422).json({ message: 'ModBanWord add error' })
	}
})

router.put('/:id', checkId, async (req, res) => {
	try {
		const {active, text, channels} = req.body
		
		const updatedBanWord = await ModBanWord.findOneAndUpdate({ '_id': req.params.id }, {active, text, channels})
		res.json(updatedBanWord)
	} catch (e) {
		console.error(e)
		res.status(422).json({ message: 'ModBanWord put error' })
	}
})

router.delete('/:id', checkId, async (req, res) => {
	try {
		await ModBanWord.deleteOne({ _id: req.params.id })
		res.json({ message: 'ModBanWord deleted' })
	} catch (e) {
		console.error(e)
		res.status(400).json({ message: 'Bad Request' })
	}
})

module.exports = router
