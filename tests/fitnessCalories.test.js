import { describe, it, expect } from 'vitest'
import {
	parseTaskVolume,
	estimatePlanCalories,
	estimatePlanDurationMinutes,
	assignPlanCalories,
	normalizeUserProfile,
	jinToKg,
	formatCalorieDisclaimer
} from '../src/utils/fitnessCalories.js'
import { getTodayPlan } from '../src/utils/fitnessPlan.js'

describe('normalizeUserProfile', () => {
	it('defaults to 105 jin / 163 cm', () => {
		const profile = normalizeUserProfile()
		expect(profile.weightJin).toBe(105)
		expect(profile.heightCm).toBe(163)
		expect(profile.weightKg).toBe(52.5)
	})

	it('converts jin to kg', () => {
		expect(jinToKg(105)).toBe(52.5)
	})
})

describe('parseTaskVolume', () => {
	it('parses rep sets', () => {
		expect(parseTaskVolume('8次 × 3组')).toEqual({
			type: 'reps',
			reps: 8,
			sets: 3,
			perSide: false
		})
	})

	it('doubles reps for per-side', () => {
		expect(parseTaskVolume('6次 × 3组（每侧）')).toEqual({
			type: 'reps',
			reps: 12,
			sets: 3,
			perSide: true
		})
	})

	it('parses hold sets', () => {
		expect(parseTaskVolume('20秒 × 2组')).toEqual({
			type: 'hold',
			sec: 20,
			sets: 2,
			perSide: false
		})
	})
})

describe('estimatePlanCalories', () => {
	it('returns kcal for day 0 plan at 105 jin with 30 min session', () => {
		const plan = getTodayPlan(0)
		expect(plan.estimatedDurationMin).toBeGreaterThanOrEqual(30)
		expect(plan.estimatedKcal).toBeGreaterThanOrEqual(70)
		expect(plan.estimatedKcal).toBeLessThanOrEqual(95)
		expect(plan.tasks.every((t) => t.calories > 0)).toBe(true)
		expect(plan.tasks.every((t) => t.guide?.steps?.length)).toBe(true)
	})

	it('scales kcal with body weight', () => {
		const tasks = [{ label: '墙推俯卧撑', detail: '8次 × 3组' }]
		const light = estimatePlanCalories(tasks, normalizeUserProfile({ weightJin: 105 }), 0)
		const heavy = estimatePlanCalories(tasks, normalizeUserProfile({ weightJin: 120 }), 0)
		expect(heavy).toBeGreaterThan(light)
	})

	it('assigns calories that sum close to total', () => {
		const tasks = [{ label: '墙推俯卧撑', detail: '8次 × 3组' }]
		const { totalKcal } = assignPlanCalories(tasks)
		expect(totalKcal).toBe(estimatePlanCalories(tasks))
		expect(tasks[0].calories).toBe(totalKcal)
	})
})

describe('estimatePlanDurationMinutes', () => {
	it('enforces minimum 30 minute session', () => {
		const tasks = [{ label: '平板支撑', detail: '20秒 × 2组' }]
		expect(estimatePlanDurationMinutes(tasks)).toBeGreaterThanOrEqual(30)
	})
})
