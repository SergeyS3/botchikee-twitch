const accounts = require('../data/accounts.json')

module.exports = (req, res, next) => {
	const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
	const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
	
	if (login && accounts[login] == password)
		return next()
	
	res.set('WWW-Authenticate', 'Basic realm="401"')
	res.status(401).send('Authentication required.')
}
