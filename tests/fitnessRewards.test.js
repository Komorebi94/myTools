import { describe, it, expect } from 'vitest'
import {
	calcSimEarnings,
	calcCumulativeEarnings,
	calcStreakBonus,
	calcSessionTotalReward
} from '../src/utils/fitnessRewards.js'

describe('calcSimEarnings', () => {
	it('day 0 has no cumulative but has today reward', () => {
		const sim = calcSimEarnings(0)
		expect(sim.cumulativeTotal).toBe(0)
		expect(sim.todayAmount).toBeGreaterThan(0)
		expect(sim.afterTodayTotal).toBe(sim.todayAmount)
	})

	it('day 20 cumulative is sum of first 20 sessions', () => {
		const sim = calcSimEarnings(20)
		const cum = calcCumulativeEarnings(20)
		expect(sim.cumulativeTotal).toBe(cum.total)
		expect(sim.afterTodayTotal).toBe(cum.total + sim.todayAmount)
	})
})

describe('calcStreakBonus', () => {
	it('pays every 7 completions', () => {
		expect(calcStreakBonus(6)).toBeGreaterThan(0)
		expect(calcStreakBonus(13)).toBeGreaterThan(0)
		expect(calcStreakBonus(5)).toBe(0)
	})
})

describe('60 day target', () => {
	it('continuous 60 sessions totals about 2700', () => {
		let total = 0
		for (let s = 0; s < 60; s++) {
			total += calcSessionTotalReward(s).amount
		}
		expect(total).toBeGreaterThanOrEqual(2650)
		expect(total).toBeLessThanOrEqual(2750)
	})
})
