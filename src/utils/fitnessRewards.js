import { REWARDS, PROGRESSION_CYCLE } from '@/constants/fitness'
import { getSessionPhase } from '@/utils/fitnessProgression'

/**
 * 每日完成奖励随训练周期递增（参考阶段难度）
 */
export function calcDailyCompleteReward(sessionIndex) {
	const meso = Math.floor(sessionIndex / PROGRESSION_CYCLE.mesocycleLength)
	const base = REWARDS.DAILY_BASE + Math.min(meso, REWARDS.DAILY_CAP - REWARDS.DAILY_BASE)
	const phase = getSessionPhase(sessionIndex)

	if (phase === 'deload') {
		return { amount: REWARDS.DELOAD_COMPLETE, tags: ['放松周完成'] }
	}

	let amount = Math.min(REWARDS.DAILY_CAP, base)
	const tags = [`基础 +${amount}`]

	if (phase === 'progress') {
		amount += REWARDS.STEP_DAY_BONUS
		tags.push(`升阶日 +${REWARDS.STEP_DAY_BONUS}`)
	}

	const lastDayOfMeso =
		sessionIndex % PROGRESSION_CYCLE.mesocycleLength === PROGRESSION_CYCLE.mesocycleLength - 1
	if (lastDayOfMeso && phase !== 'deload') {
		amount += REWARDS.MESO_COMPLETE
		tags.push(`小周期收官 +${REWARDS.MESO_COMPLETE}`)
	}

	return { amount, tags }
}

export function calcVariantUpgradeBonus(prevVariantId, nextVariantId) {
	if (!prevVariantId || prevVariantId === nextVariantId) return null
	return {
		amount: REWARDS.VARIANT_UPGRADE,
		label: `动作进阶 +${REWARDS.VARIANT_UPGRADE}`
	}
}

function pushIdAtSession(sessionIndex) {
	if (sessionIndex < 18) return 'wall'
	if (sessionIndex < 36) return 'incline'
	if (sessionIndex < 54) return 'knee'
	return 'standard'
}

/** 每连续满 7 次完成打卡发放一次（第 7、14、21… 课次） */
export function calcStreakBonus(sessionIndex) {
	if ((sessionIndex + 1) % 7 === 0) {
		return REWARDS.STREAK_7
	}
	return 0
}

/** 单次完成打卡的全部入账（基础 + 连续 7 次 + 俯卧撑变式进阶） */
export function calcSessionTotalReward(sessionIndex) {
	const daily = calcDailyCompleteReward(sessionIndex)
	let amount = daily.amount
	const parts = [...daily.tags]

	const streak = calcStreakBonus(sessionIndex)
	if (streak > 0) {
		amount += streak
		parts.push(`连续7次 +${streak}`)
	}

	if (sessionIndex > 0) {
		const bonus = calcVariantUpgradeBonus(
			pushIdAtSession(sessionIndex - 1),
			pushIdAtSession(sessionIndex)
		)
		if (bonus) {
			amount += bonus.amount
			parts.push(bonus.label)
		}
	}

	return { amount, parts }
}

/** 已连续完成 completedCount 次后的累计余额（课次 0 … completedCount-1） */
export function calcCumulativeEarnings(completedCount) {
	let total = 0
	const breakdown = {
		dailyBase: 0,
		stepMeso: 0,
		deload: 0,
		streak: 0,
		variant: 0
	}

	for (let s = 0; s < completedCount; s++) {
		const session = calcSessionTotalReward(s)
		total += session.amount

		const daily = calcDailyCompleteReward(s)
		const phase = daily.tags.some((t) => t.includes('放松'))

		if (phase) {
			breakdown.deload += daily.amount
		} else {
			const basePart = daily.tags.find((t) => t.startsWith('基础'))
			const baseVal = basePart
				? parseInt(basePart.replace(/\D/g, ''), 10) || daily.amount
				: daily.amount
			breakdown.dailyBase += baseVal
			breakdown.stepMeso += daily.amount - baseVal
		}

		breakdown.streak += calcStreakBonus(s)
		if (s > 0) {
			const bonus = calcVariantUpgradeBonus(pushIdAtSession(s - 1), pushIdAtSession(s))
			if (bonus) breakdown.variant += bonus.amount
		}
	}

	return { total, breakdown, completedCount }
}

/** 预览模式：今日完成可得 + 此前累计 + 完成后总余额 */
export function calcSimEarnings(sessionIndex) {
	const cumulative = calcCumulativeEarnings(sessionIndex)
	const today = calcSessionTotalReward(sessionIndex)

	return {
		sessionIndex,
		todayAmount: today.amount,
		todayParts: today.parts,
		cumulativeTotal: cumulative.total,
		cumulativeBreakdown: cumulative.breakdown,
		afterTodayTotal: cumulative.total + today.amount
	}
}

export function getRewardPreview(sessionIndex) {
	const phase = getSessionPhase(sessionIndex)
	const today = calcDailyCompleteReward(sessionIndex)
	const sim = calcSimEarnings(sessionIndex)

	return {
		dailyRange:
			phase === 'deload'
				? `${REWARDS.DELOAD_COMPLETE}`
				: `${REWARDS.DAILY_BASE}–${REWARDS.DAILY_CAP}`,
		todayEstimate: today.amount,
		todayFullEstimate: sim.todayAmount,
		todayParts: sim.todayParts,
		cumulativeTotal: sim.cumulativeTotal,
		afterTodayTotal: sim.afterTodayTotal,
		stepBonus: phase === 'progress' ? REWARDS.STEP_DAY_BONUS : 0,
		streakBonus: REWARDS.STREAK_7
	}
}
