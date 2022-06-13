jest.mock('../../submodules/MsgQueue', () => {})

const Pyramid = require('../Pyramid')

describe('canBeEmote', () => {
	const cbe = str => Pyramid.canBeEmote(str)
	
	it('length', () => {
		expect(cbe('qw')).toBe(false)
		expect(cbe('qwert')).toBe(true)
		expect(cbe('qwe t')).toBe(false)
	})
	
	it('numbers', () => {
		expect(cbe('qw1')).toBe(true)
		expect(cbe('123')).toBe(false)
	})

	it('single emoji', () => {
		expect(cbe('🍆')).toBe(true)
		expect(cbe('🍆🍆')).toBe(false)
	})
	
	it('emoji sequence', () => {
		expect(cbe('👨‍🍳')).toBe(true) //w/ zero-width joiner
		expect(cbe('👨🍳')).toBe(true) //w/o zero-width joiner
		expect(cbe('👨🍳🍳')).toBe(false)
		expect(cbe('🍳👨')).toBe(false)
	})
	
	it('exceptions', () => {
		expect(cbe(':)')).toBe(true)
		expect(cbe('(:')).toBe(false)
	})
})

describe('getPyramidWidth', () => {
	it('🍆 pyramid', () => {
		let queue
		const user = { name: 'test' }
		const setQueue = msgs => {
			queue = []
			for(const msg of msgs)
				queue.push({ user, msg })
		}
		const gpw = () => Pyramid.getPyramidWidth(queue, user.name, '🍆')
		
		setQueue(['🍆'])
		expect(gpw()).toBe(1)

		setQueue(['🍆', '🍆🍆'])
		expect(gpw()).toBe(1)

		setQueue(['🍆', '🍆🍆', '🍆'])
		expect(gpw()).toBe(2)
		
		setQueue(['🍆', '🍆 🍆', '🍆'])
		expect(gpw()).toBe(2)
		
		setQueue(['🍆', '🍆🍆', '🍆🍆🍆', '🍆🍆', '🍆'])
		expect(gpw()).toBe(3)
		
		queue[2].user = { name: '123' }
		expect(gpw()).toBe(1)
		
		setQueue(['🍆', '🍆🍆', '🍆🍆🍆', '1', '🍆🍆', '🍆'])
		expect(gpw()).toBe(1)
	})
})
