import { describe, it, expect } from 'vitest'
import { getTodayPlan, getProgramMeta } from '../src/utils/fitnessPlan.js'
import { getAvailablePushVariants } from '../src/utils/fitnessPlan.js'
import { resolvePushVariant } from '../src/utils/fitnessProgression.js'
import { getSessionPhase } from '../src/utils/fitnessProgression.js'
import { calcDailyCompleteReward } from '../src/utils/fitnessRewards.js'
import { REWARDS } from '../src/constants/fitness.js'

describe('training rhythm', () => {
	it('cycles accumulate → consolidate → progress', () => {
		expect(getSessionPhase(0)).toBe('accumulate')
		expect(getSessionPhase(1)).toBe('accumulate')
		expect(getSessionPhase(3)).toBe('consolidate')
		expect(getSessionPhase(5)).toBe('progress')
	})

	it('inserts deload every 24 sessions', () => {
		expect(getSessionPhase(24)).toBe('deload')
	})
})

describe('getTodayPlan', () => {
	it('includes plank every day', () => {
		const plan = getTodayPlan(0)
		expect(plan.tasks.some((t) => t.id === 'plank')).toBe(true)
	})

	it('increases push reps across mesocycles', () => {
		const low = getTodayPlan(0, 'wall')
		const high = getTodayPlan(12, 'wall')
		const lowPush = low.tasks.find((t) => t.id.startsWith('push'))
		const highPush = high.tasks.find((t) => t.id.startsWith('push'))
		expect(parseInt(highPush.detail, 10)).toBeGreaterThan(parseInt(lowPush.detail, 10))
	})

	it('shows rhythm metadata', () => {
		const meta = getProgramMeta(2)
		expect(meta.rhythmLabel).toBeTruthy()
		expect(meta.rewardPreview.dailyRange).toBeTruthy()
	})
})

describe('rewards follow progression', () => {
	it('pays more on progress day', () => {
		const normal = calcDailyCompleteReward(2).amount
		const step = calcDailyCompleteReward(5).amount
		expect(step).toBeGreaterThan(normal)
	})

	it('uses deload reward on deload session', () => {
		expect(calcDailyCompleteReward(24).amount).toBe(REWARDS.DELOAD_COMPLETE)
	})
})

describe('resolvePushVariant', () => {
	it('falls back when selection not yet unlocked', () => {
		expect(resolvePushVariant(0, 'standard').id).toBe('wall')
	})

	it('ignores easier saved selection at session 20', () => {
		expect(resolvePushVariant(20, 'wall').id).toBe('incline')
	})

	it('uses incline at session 20 not wall', () => {
		const plan = getTodayPlan(20)
		expect(plan.pushId).toBe('incline')
		expect(plan.tasks.find((t) => t.id.startsWith('push')).label).toBe('斜撑俯卧撑')
	})

	it('unlocks incline as recommended at session 18', () => {
		const plan = getTodayPlan(18)
		expect(plan.pushId).toBe('incline')
	})
})
