const express = require('express')
const path = require('path')
const Tools = require('../tools/Tools')

const moduleRoutes = require('./routes/modules')
const answerRoutes = require('./routes/answers')
const authHandler = require('./middleware/auth')
const errorHandler = require('./middleware/error')

const port = 3011
const app = express()


app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

app.use(authHandler)
app.use('/modules', moduleRoutes)
app.use('/answers', answerRoutes)
app.use(errorHandler)


;(async () => {
	try {
		await Tools.connectDB()
		app.listen(port)
	} catch (e) {
		console.error(e.message)
	}
})()
