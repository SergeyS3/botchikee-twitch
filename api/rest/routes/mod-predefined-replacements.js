const { Router } = require('express')
const router = Router()
const Mod = require('../../../modules/Mod')

router.get('/', async (req, res) => {
	res.json(await Mod.getPredefinedReplacements())
})

module.exports = router
