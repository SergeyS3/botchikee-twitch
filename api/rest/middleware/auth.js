const Tools = require('../../Tools')

module.exports = (req, res, next) => {
	if(Tools.checkAuth(req))
		return next()
	
	res.set('WWW-Authenticate', 'Basic realm="401"')
	res.status(401).send('401 Unauthorized')
}
