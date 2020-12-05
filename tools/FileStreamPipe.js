const fs = require('fs')
const Stream = require('stream')

class FileStreamPipe {
	constructor(filepath) {
		this.readable = new Stream.Readable({ read(){} })
		this.path = filepath
	}
	get path() {
		return this.writeStream.path
	}
	set path(filepath) {
		if(this.writeStream) {
			if(this.path === filepath)
				return
			this.writeStream.close()
			this.readable.unpipe(this.writeStream)
		}
		
		this.writeStream = fs.createWriteStream(filepath, {flags: 'a'})
		this.readable.pipe(this.writeStream)
	}
	write(str) {
		this.readable.push(str)
	}
}

module.exports = FileStreamPipe