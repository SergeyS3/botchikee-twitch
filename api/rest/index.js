const express = require('express')
const path = require('path')
const Tools = require('../Tools')

const settingsRoutes = require('./routes/settings')
const moduleRoutes = require('./routes/modules')
const submoduleRoutes = require('./routes/submodules')
const answerRoutes = require('./routes/answers')
const modReplacementRoutes = require('./routes/mod-replacements')
const modBanWordRoutes = require('./routes/mod-ban-words')
const commandRoutes = require('./routes/commands')
const authHandler = require('./middleware/auth')
const errorHandler = require('./middleware/error')

const port = 3011
const app = express()


app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

app.use(authHandler)
app.use('/settings', settingsRoutes)
app.use('/modules', moduleRoutes)
app.use('/submodules', submoduleRoutes)
app.use('/answers', answerRoutes)
app.use('/mod-replacements', modReplacementRoutes)
app.use('/mod-ban-words', modBanWordRoutes)
app.use('/commands', commandRoutes)
app.use(errorHandler)


;(async () => {
	try {
		await Tools.connectDB()
		app.listen(port)
	} catch (e) {
		console.error(e.message)
	}
})()
