import { describe, it, expect } from 'vitest'
import { parseSimDay } from '../src/utils/fitnessSimDay.js'

describe('parseSimDay', () => {
	it('returns null when absent', () => {
		expect(parseSimDay(undefined)).toBeNull()
		expect(parseSimDay('')).toBeNull()
	})

	it('parses valid day', () => {
		expect(parseSimDay('2')).toBe(2)
		expect(parseSimDay(24)).toBe(24)
	})

	it('rejects invalid values', () => {
		expect(parseSimDay('abc')).toBeNull()
		expect(parseSimDay('-1')).toBeNull()
	})
})
