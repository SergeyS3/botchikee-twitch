const Submodule = require('../../../models/submodule')
const { Router } = require('express')
const router = Router()

router.get('/', async (req, res) => {
	try {
		const submodules = await Submodule.find()
			.sort('name')
			.select('id active name modules')
		
		res.json(submodules)
	} catch (e) {
		console.error(e)
	}
})

module.exports = router
