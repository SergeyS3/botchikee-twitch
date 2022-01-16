const Command = require('../../../models/command')
const { Router } = require('express')
const checkId = require('../middleware/checkId')(Command)
const router = Router()

router.get('/', async (req, res) => {
	try {
		const commands = await Command.find({ registered: true })
			.select('id active module text users')
		
		res.json(commands)
	} catch (e) {
		console.error(e)
	}
})

router.put('/:id', checkId, async (req, res) => {
	try {
		const { users } = req.body
		
		const updatedCommand = await Command.findOneAndUpdate({ '_id': req.params.id }, { users })
		res.json(updatedCommand)
	} catch (e) {
		console.error(e)
		res.status(422).json({ message: 'Command put error' })
	}
})

module.exports = router
