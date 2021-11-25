const ModReplacement = require('../../models/modReplacement')
const {Router} = require('express')
const checkId = require('../middleware/checkId')(ModReplacement)
const router = Router()

router.get('/', async (req, res) => {
	try {
		const replacements = await ModReplacement.find()
			.select('from to')
		
		res.json(replacements)
	} catch (e) {
		console.error(e)
	}
})

router.post('/', async (req, res) => {
	const {from, to} = req.body
	
	const newReplacement = new ModReplacement({ from, to })
	
	try {
		await newReplacement.save()
		res.status(201).json(newReplacement)
	} catch (e) {
		console.error(e)
		res.status(422).json({ message: 'ModReplacement add error' })
	}
})

router.put('/:id', checkId, async (req, res) => {
	try {
		const {from, to} = req.body
		
		const updatedReplacement = await ModReplacement.findOneAndUpdate({ '_id': req.params.id }, {from, to})
		res.json(updatedReplacement)
	} catch (e) {
		console.error(e)
		res.status(422).json({ message: 'ModReplacement put error' })
	}
})

router.delete('/:id', checkId, async (req, res) => {
	try {
		await ModReplacement.deleteOne({ _id: req.params.id })
		res.json({ message: 'ModReplacement deleted' })
	} catch (e) {
		console.error(e)
		res.status(400).json({ message: 'Bad Request' })
	}
})

module.exports = router
