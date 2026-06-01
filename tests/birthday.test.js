import { describe, it, expect } from 'vitest'
import {
	buildBirthdayTitle,
	buildBirthdayBarrage,
	buildBirthdaySubtitle,
	parseBirthdayAge
} from '../src/utils/birthday.js'

describe('buildBirthdayTitle', () => {
	it('returns default title without name', () => {
		expect(buildBirthdayTitle('')).toEqual(['生', '日', '快', '乐'])
	})

	it('includes name', () => {
		const title = buildBirthdayTitle('小明')
		expect(title.join('')).toBe('小明，生日快乐')
	})
})

describe('buildBirthdaySubtitle', () => {
	it('includes name and age', () => {
		const text = buildBirthdaySubtitle('小明', 18)
		expect(text).toContain('小明')
		expect(text).toContain('18')
	})
})

describe('parseBirthdayAge', () => {
	it('parses valid age', () => {
		expect(parseBirthdayAge('25')).toBe(25)
	})

	it('rejects invalid age', () => {
		expect(parseBirthdayAge('abc')).toBeNull()
		expect(parseBirthdayAge('200')).toBeNull()
	})
})

describe('buildBirthdayBarrage', () => {
	it('prepends personalized messages', () => {
		const list = buildBirthdayBarrage('小红', ['生日快乐'])
		expect(list[0]).toBe('小红，生日快乐！')
		expect(list).toContain('生日快乐')
	})
})
