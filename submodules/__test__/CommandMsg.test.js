jest.mock('../../models/submodule', () => {})
jest.mock('../../models/command', () => {})

const CommandMsg = require('../CommandMsg')

describe('getCommand', () => {
	const gc = msg => CommandMsg.getCommand(msg)
	
	it('w/o command', () => {
		expect(gc('test')).toMatchObject({
			command: undefined,
			args: undefined
		})
	})
	
	it('w/o args', () => {
		expect(gc('!test')).toMatchObject({
			command: '!test',
			args: []
		})
	})
	
	it('w/ args', () => {
		const args = ['!qwe', 'rty', '123', '!@#$%^&*()']
		expect(gc(`!test ${args.join(' ')}`)).toMatchObject({
			command: '!test',
			args
		})
	})
})
