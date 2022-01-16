const Module = require('../../../models/module')
const { Router } = require('express')
const checkId = require('../middleware/checkId')(Module)
const router = Router()

router.get('/', async (req, res) => {
	try {
		const modules = await Module.find()
			.sort('name')
			.select('id active name channels')
		
		res.json(modules)
	} catch (e) {
		console.error(e)
	}
})

router.put('/:id', checkId, async (req, res) => {
	try {
		const {active, channels} = req.body
		
		const updatedModule = await Module.findOneAndUpdate({ '_id': req.params.id }, {active, channels})
		res.json(updatedModule)
	} catch (e) {
		console.error(e)
		res.status(422).json({ message: 'Module put error' })
	}
})

module.exports = router
