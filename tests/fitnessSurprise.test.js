import { describe, it, expect } from 'vitest'
import {
	getPendingSurpriseTiers,
	getNextSurpriseTier,
	getDaysToSurpriseTier
} from '../src/utils/fitnessSurprise.js'
import { normalizeFitnessState, getDefaultState } from '../src/utils/fitnessStorage.js'

describe('getPendingSurpriseTiers', () => {
	it('returns tiers reached but not redeemed', () => {
		const state = { ...getDefaultState(), surprise_60: false, surprise_180: false }
		const pending = getPendingSurpriseTiers(180, state)
		expect(pending.map((t) => t.id)).toEqual(['surprise_60', 'surprise_180'])
	})

	it('skips redeemed tiers', () => {
		const state = { ...getDefaultState(), surprise_60: true }
		const pending = getPendingSurpriseTiers(200, state)
		expect(pending.map((t) => t.id)).toEqual(['surprise_180'])
	})
})

describe('getNextSurpriseTier', () => {
	it('returns first tier above current streak', () => {
		expect(getNextSurpriseTier(30)?.days).toBe(60)
		expect(getNextSurpriseTier(100)?.days).toBe(180)
		expect(getNextSurpriseTier(365)).toBeNull()
	})
})

describe('getDaysToSurpriseTier', () => {
	it('counts days remaining', () => {
		const next = getNextSurpriseTier(45)
		expect(getDaysToSurpriseTier(45, next)).toBe(15)
	})
})

describe('normalizeFitnessState', () => {
	it('migrates legacy single-tier surprise fields', () => {
		const next = normalizeFitnessState({
			surpriseRewardRedeemed: true
		})
		expect(next.surprise_60).toBe(true)
		expect(next.surprise_180).toBe(false)
		expect(next.surpriseRewardRedeemed).toBeUndefined()
	})
})
