const Logger = require('./Logger')
const fs = require('fs')
const Tools = require('../../tools/Tools')
const FileStream = require('../../tools/FileStreamPipe')

class File extends Logger {
	get name() {
		return 'File logger'
	}
	
	constructor(logsDir) {
		super()
		
		this.logsDir = logsDir
		this.fileStreams = {}
	}
	
	async getFileStream(channel) {
		const dir = `${this.logsDir}/${channel || 'global'}`,
			filepath = `${dir}/${Tools.getDate()}.log`,
			{fileStreams} = this
		
		if(fileStreams[dir])
			fileStreams[dir].path = filepath
		else {
			await fs.promises.mkdir(dir, {recursive: true})
			fileStreams[dir] = new FileStream(filepath)
		}
		return fileStreams[dir]
	}
	
	log({ channel, raw }, prefix) {
		const str = `${Tools.getTime()} ${prefix} ${raw}\n`
		this.getFileStream(channel).then(fileStream => fileStream.write(str))
	}
}

module.exports = File
