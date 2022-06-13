jest.mock('../../models/answer', () => {})
jest.mock('../../submodules/CommandMsg', () => {})
jest.mock('mongoose', () => {})

const Answer = require('../Answer')

describe('replaceVars', () => {
	const rv = (str, args) => Answer.replaceVars(str, 'test', args || ['foo', 'bar', '$args{1}'])
	
	it('$sender', () => {
		expect(rv('$sender')).toBe('test')
	})
	
	it('$args', () => {
		expect(rv('$args{0')).toBe('$args{0')
		expect(rv('$args{0}')).toBe('foo')
		expect(rv('$args{1}')).toBe('bar')
		expect(() => rv('$args{2}')).toThrow('wrong $args args')
		expect(() => rv('$args{3}')).toThrow('bad $args args')
		expect(() => rv('$args{/}', '')).toThrow('bad $args args')
	})
	
	it('$rand', () => {
		expect.extend({
			toBeWithin(received, start, end) {
				const pass = received >= start && received <= end
				return {
					message: () =>
						`Expected: number within range \x1b[32m${start}-${end}\x1b[30m\n`
						+ `Received: \x1b[31m${received}\x1b[30m`,
					pass,
				}
			},
		})
		expect(rv('$rand{0-1}')).toBeWithin(0, 1)
		expect(rv('$rand{0-1')).toBe('$rand{0-1')
		expect(() => rv(`$rand{-1-1}`)).toThrow('bad $rand args')
		expect(() => rv(`$rand{0--1}`)).toThrow('bad $rand args')
		expect(() => rv(`$rand{q}`)).toThrow('bad $rand args')
		expect(() => rv(`$rand{-q}`)).toThrow('bad $rand args')
		expect(() => rv(`$rand{q-q}`)).toThrow('bad $rand args')
		expect(() => rv(`$rand{0-q}`)).toThrow('bad $rand args')
		expect(() => rv(`$rand{q-1}`)).toThrow('bad $rand args')
		expect(() => rv(`$rand{1-0}`)).toThrow('wrong $rand args')
		expect(() => rv(`$rand{0-1${Number.MAX_SAFE_INTEGER}}`)).toThrow('wrong $rand args')
	})
})
