import { describe, it, expect } from 'vitest'
import {
    calcSessionStreak,
    calcWeekCompletion,
    getMissedTrainingDays,
    getCalendarDayStatus,
    buildCalendarCells,
    getNextPhaseInfo
} from '../src/utils/lujxPlan.js'
import { formatDateKey } from '../src/utils/date.js'

describe('calcSessionStreak', () => {
    it('skips rest days and counts only training check-ins', () => {
        const records = [
            { date: '2026-06-01', status: 'training' },
            { date: '2026-05-30', status: 'training' }
        ]
        const today = new Date(2026, 5, 1)
        expect(calcSessionStreak(records, today)).toBe(2)
    })

    it('breaks streak when latest training day is missed', () => {
        const records = [{ date: '2026-05-30', status: 'training' }]
        const today = new Date(2026, 5, 2)
        expect(calcSessionStreak(records, today)).toBe(0)
    })
})

describe('calcWeekCompletion', () => {
    it('counts Mon-Sat training days up to today', () => {
        const today = new Date(2026, 5, 2)
        const records = [{ date: '2026-06-01', status: 'training' }]
        expect(calcWeekCompletion(records, today)).toEqual({ done: 1, planned: 2 })
    })
})

describe('getMissedTrainingDays', () => {
    it('lists past unchecked training days this week', () => {
        const today = new Date(2026, 5, 5)
        const records = []
        const missed = getMissedTrainingDays(records, today, '2026-01-01')
        expect(missed.length).toBeGreaterThan(0)
        expect(missed.every((m) => m.dateKey < formatDateKey(today))).toBe(true)
    })
})

describe('getCalendarDayStatus', () => {
    it('marks past unchecked training day as missed', () => {
        expect(
            getCalendarDayStatus(
                { key: '2026-06-01', isTrainingDay: true, isChecked: false, isToday: false },
                '2026-06-05',
                '2026-01-01'
            )
        ).toBe('missed')
    })
})

describe('buildCalendarCells', () => {
    it('does not attach plan object to cells', () => {
        const month = new Date(2026, 5, 1)
        const cells = buildCalendarCells(month, new Set(), '2026-06-15', '2026-01-01')
        const inMonth = cells.filter((c) => c.inMonth)
        expect(inMonth.length).toBeGreaterThan(0)
        expect(inMonth.every((c) => c.plan === undefined)).toBe(true)
    })
})

describe('getNextPhaseInfo', () => {
    it('returns phase-2 after week 4', () => {
        const info = getNextPhaseInfo(4)
        expect(info?.phase.id).toBe('phase-2')
        expect(info?.weeksUntil).toBe(1)
    })
})
