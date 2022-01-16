const http = require('http')
const Tools = require('../Tools')
const items = require('./items')

const server = http.createServer()

server.on('upgrade', (req, socket, head) => {
	if(Tools.checkAuth(req)) {
		const wss = items.find(i => i.path === req.url)?.wss
		if(wss) {
			wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req))
			return
		}
		else
			socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
	}
	else
		socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
	socket.destroy()
	
})

;(async () => {
	try {
		await Tools.connectDB()
		server.listen(3012)
	} catch (e) {
		console.error(e.message)
	}
})()
