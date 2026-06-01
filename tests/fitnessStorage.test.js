import { describe, it, expect } from 'vitest'
import {
	formatDateKey,
	getYesterdayKey,
	getDefaultState,
	applyDayRollover,
	hasFinishOnDate,
	getDayWorkoutRecord
} from '../src/utils/fitnessStorage.js'
import { RECORD_STATUS } from '../src/constants/fitness.js'

describe('getDefaultState', () => {
	it('includes surprise reward tier flags', () => {
		const state = getDefaultState()
		expect(state.surprise_60).toBe(false)
		expect(state.surprise_180).toBe(false)
		expect(state.surprise_365).toBe(false)
	})
})

describe('formatDateKey', () => {
	it('formats date as YYYY-MM-DD', () => {
		expect(formatDateKey(new Date(2026, 4, 22))).toBe('2026-05-22')
	})
})

describe('getYesterdayKey', () => {
	it('returns previous calendar day', () => {
		expect(getYesterdayKey('2026-05-22')).toBe('2026-05-21')
	})
})

describe('applyDayRollover', () => {
	it('resets streak when yesterday had no finish', () => {
		const state = {
			...getDefaultState(),
			continueDays: 5,
			weekReward_7: true,
			lastCheckDate: '2026-05-20',
			recordList: []
		}
		const next = applyDayRollover(state, '2026-05-22')
		expect(next.continueDays).toBe(0)
		expect(next.weekReward_7).toBe(false)
	})

	it('keeps streak when yesterday finished', () => {
		const state = {
			...getDefaultState(),
			continueDays: 3,
			lastCheckDate: '2026-05-21',
			recordList: [
				{
					date: '2026-05-21',
					status: RECORD_STATUS.FINISH,
					moneyChange: 5,
					remark: '完成',
					afterMoney: 5
				}
			]
		}
		const next = applyDayRollover(state, '2026-05-22')
		expect(next.continueDays).toBe(3)
	})

	it('keeps streak when yesterday was half', () => {
		const state = {
			...getDefaultState(),
			continueDays: 4,
			lastCheckDate: '2026-05-21',
			recordList: [
				{
					date: '2026-05-21',
					status: RECORD_STATUS.HALF,
					moneyChange: 0,
					remark: '未达标',
					afterMoney: 10
				}
			]
		}
		const next = applyDayRollover(state, '2026-05-22')
		expect(next.continueDays).toBe(4)
	})

	it('does not change state when already on today', () => {
		const state = {
			...getDefaultState(),
			continueDays: 2,
			lastCheckDate: '2026-05-22'
		}
		const next = applyDayRollover(state, '2026-05-22')
		expect(next.continueDays).toBe(2)
	})
})

describe('getDayWorkoutRecord', () => {
	it('ignores redeem when checking daily workout', () => {
		const list = [
			{
				date: '2026-05-22',
				status: RECORD_STATUS.REDEEM,
				moneyChange: -10,
				remark: '兑换',
				afterMoney: 0
			},
			{
				date: '2026-05-22',
				status: RECORD_STATUS.FINISH,
				moneyChange: 5,
				remark: '完成',
				afterMoney: 5
			}
		]
		expect(getDayWorkoutRecord(list, '2026-05-22')?.status).toBe(RECORD_STATUS.FINISH)
	})
})

describe('hasFinishOnDate', () => {
	it('returns true only for finish status', () => {
		const list = [
			{ date: '2026-05-20', status: RECORD_STATUS.SKIP },
			{ date: '2026-05-21', status: RECORD_STATUS.FINISH }
		]
		expect(hasFinishOnDate(list, '2026-05-21')).toBe(true)
		expect(hasFinishOnDate(list, '2026-05-20')).toBe(false)
	})
})
