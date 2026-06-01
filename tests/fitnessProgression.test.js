import { describe, it, expect } from 'vitest'
import { calcRepScheme, calcHoldScheme } from '../src/utils/fitnessProgression.js'

describe('calcRepScheme', () => {
	it('adds reps on accumulate days', () => {
		const d0 = calcRepScheme(0, { baseReps: 8, baseSets: 3, repCap: 15 })
		const d1 = calcRepScheme(1, { baseReps: 8, baseSets: 3, repCap: 15 })
		expect(d1.reps).toBeGreaterThan(d0.reps)
	})

	it('holds reps on consolidate day', () => {
		const d2 = calcRepScheme(2, { baseReps: 8, baseSets: 3, repCap: 15 })
		const d3 = calcRepScheme(3, { baseReps: 8, baseSets: 3, repCap: 15 })
		expect(d3.reps).toBe(d2.reps)
	})
})

describe('calcHoldScheme', () => {
	it('adds seconds on accumulate days', () => {
		const d0 = calcHoldScheme(0, { baseSec: 20, baseSets: 2, secCap: 90 })
		const d1 = calcHoldScheme(1, { baseSec: 20, baseSets: 2, secCap: 90 })
		expect(d1.sec).toBeGreaterThan(d0.sec)
	})

	it('reduces volume on deload', () => {
		const deload = calcHoldScheme(24, { baseSec: 20, baseSets: 2, secCap: 90 })
		expect(deload.phase).toBe('deload')
		expect(deload.sec).toBeLessThan(20 + Math.floor(24 / 6) * 10)
	})
})
