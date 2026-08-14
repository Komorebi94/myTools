import { describe, it, expect } from 'vitest'
import {
	calculateCompoundReturn,
	formatWan,
	milestoneReturns,
	roundTo
} from '../src/utils/compoundReturn.js'

const TABLE_CASES = [
	{ principalWan: 30, ratePercent: 8, years: 20, expectedWan: 139.8 },
	{ principalWan: 30, ratePercent: 8, years: 25, expectedWan: 205.5 },
	{ principalWan: 30, ratePercent: 8, years: 30, expectedWan: 301.9 },
	{ principalWan: 30, ratePercent: 10, years: 20, expectedWan: 201.8 },
	{ principalWan: 30, ratePercent: 10, years: 25, expectedWan: 325.0 },
	{ principalWan: 30, ratePercent: 10, years: 30, expectedWan: 523.5 },
	{ principalWan: 30, ratePercent: 15, years: 20, expectedWan: 491.0 },
	{ principalWan: 30, ratePercent: 15, years: 25, expectedWan: 987.6 },
	{ principalWan: 30, ratePercent: 15, years: 30, expectedWan: 1986.4 },
	{ principalWan: 50, ratePercent: 8, years: 20, expectedWan: 233.0 },
	{ principalWan: 50, ratePercent: 8, years: 25, expectedWan: 342.4 },
	{ principalWan: 50, ratePercent: 8, years: 30, expectedWan: 503.1 },
	{ principalWan: 50, ratePercent: 10, years: 20, expectedWan: 336.4 },
	{ principalWan: 50, ratePercent: 10, years: 25, expectedWan: 541.7 },
	{ principalWan: 50, ratePercent: 10, years: 30, expectedWan: 872.5 },
	{ principalWan: 50, ratePercent: 15, years: 20, expectedWan: 818.3 },
	{ principalWan: 50, ratePercent: 15, years: 25, expectedWan: 1645.9 },
	{ principalWan: 50, ratePercent: 15, years: 30, expectedWan: 3310.6 }
]

describe('calculateCompoundReturn', () => {
	it.each(TABLE_CASES)(
		'$principalWan万 · $ratePercent% · $years年 → $expectedWan万',
		({ principalWan, ratePercent, years, expectedWan }) => {
			const result = calculateCompoundReturn({ principalWan, ratePercent, years })
			expect(result.ok).toBe(true)
			expect(roundTo(result.finalWan, 1)).toBe(expectedWan)
			expect(result.finalWanText).toBe(formatWan(expectedWan))
		}
	)

	it('returns profit and multiple from principal', () => {
		const result = calculateCompoundReturn({
			principalWan: 30,
			ratePercent: 8,
			years: 20
		})
		expect(result.ok).toBe(true)
		expect(roundTo(result.profitWan, 1)).toBe(109.8)
		expect(roundTo(result.multiple, 1)).toBe(4.7)
	})

	it('rejects empty and out-of-range inputs', () => {
		expect(
			calculateCompoundReturn({ principalWan: '', ratePercent: 8, years: 20 })
		).toMatchObject({
			ok: false,
			field: 'principalWan'
		})
		expect(
			calculateCompoundReturn({ principalWan: 30, ratePercent: 51, years: 20 })
		).toMatchObject({
			ok: false,
			field: 'ratePercent'
		})
		expect(
			calculateCompoundReturn({ principalWan: 30, ratePercent: -51, years: 20 })
		).toMatchObject({
			ok: false,
			field: 'ratePercent'
		})
		expect(
			calculateCompoundReturn({ principalWan: 30, ratePercent: 8, years: 0 })
		).toMatchObject({
			ok: false,
			field: 'years'
		})
	})

	it('supports negative annual rates above -50%', () => {
		const result = calculateCompoundReturn({
			principalWan: 30,
			ratePercent: -5,
			years: 20
		})
		expect(result.ok).toBe(true)
		expect(result.finalWan).toBeLessThan(30)
		expect(result.profitWan).toBeLessThan(0)
	})
})

describe('milestoneReturns', () => {
	it('computes 20 / 25 / 30 year columns for the same principal and rate', () => {
		const rows = milestoneReturns({ principalWan: 30, ratePercent: 8 })
		expect(rows.map((row) => row.years)).toEqual([20, 25, 30])
		expect(rows.map((row) => roundTo(row.result.finalWan, 1))).toEqual([139.8, 205.5, 301.9])
	})
})
