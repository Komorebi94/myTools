import { describe, it, expect } from 'vitest'
import { formatDateKey, getYesterdayKey, startOfWeekMonday } from '../src/utils/date.js'

describe('formatDateKey', () => {
	it('formats as YYYY-MM-DD', () => {
		expect(formatDateKey(new Date(2026, 4, 22))).toBe('2026-05-22')
	})
})

describe('getYesterdayKey', () => {
	it('returns previous calendar day', () => {
		expect(getYesterdayKey('2026-05-22')).toBe('2026-05-21')
	})
})

describe('startOfWeekMonday', () => {
	it('returns Monday for a Wednesday', () => {
		const monday = startOfWeekMonday(new Date(2026, 5, 4))
		expect(monday.getDay()).toBe(1)
	})
})
