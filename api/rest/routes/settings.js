const Settings = require('../../../models/settings')
const { Router } = require('express')
const checkId = require('../middleware/checkId')(Settings)
const router = Router()

router.get('/', async (req, res) => {
	try {
		const settings = await Settings.find()
			.select('id channels')
		
		res.json(settings)
	} catch (e) {
		console.error(e)
	}
})

router.put('/:id', checkId, async (req, res) => {
	try {
		const { channels } = req.body
		
		const updatedSettings = await Settings.findOneAndUpdate({ '_id': req.params.id }, { channels })
		res.json(updatedSettings)
	} catch (e) {
		console.error(e)
		res.status(422).json({ message: 'Settings put error' })
	}
})

module.exports = router
