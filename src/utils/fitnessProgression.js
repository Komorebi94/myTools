import { PROGRESSION_CYCLE, PUSH_VARIANTS, PHASE_LABELS } from '@/constants/fitness'

const { mesocycleLength, accumulateDays, deloadInterval, deloadVolumeFactor } = PROGRESSION_CYCLE

export function getSessionIndex(totalCheckDays) {
	return Math.max(0, totalCheckDays)
}

export function getSessionPhase(sessionIndex) {
	if (sessionIndex > 0 && sessionIndex % deloadInterval === 0) {
		return 'deload'
	}
	const pos = sessionIndex % mesocycleLength
	if (pos < accumulateDays) return 'accumulate'
	if (pos < accumulateDays + 2) return 'consolidate'
	return 'progress'
}

export function getPhaseInfo(sessionIndex) {
	const phase = getSessionPhase(sessionIndex)
	const pos = sessionIndex % mesocycleLength

	return {
		phase,
		...PHASE_LABELS[phase],
		mesoIndex: Math.floor(sessionIndex / mesocycleLength),
		dayInMeso: phase === 'deload' ? 1 : pos + 1,
		mesocycleLength,
		isDeload: phase === 'deload'
	}
}

function applyDeload(value, minValue = 1) {
	return Math.max(minValue, Math.round(value * deloadVolumeFactor))
}

export function calcRepScheme(
	sessionIndex,
	{ baseReps, baseSets, repCap, setCap = 5, repStep = 1 }
) {
	const phase = getSessionPhase(sessionIndex)
	const isDeload = phase === 'deload'
	const pos = sessionIndex % mesocycleLength
	const mesoIndex = Math.floor(sessionIndex / mesocycleLength)

	if (isDeload) {
		const reps = applyDeload(baseReps + mesoIndex * 2, 5)
		const sets = Math.max(2, baseSets - 1)
		return { reps, sets, phase, deltaToday: 0, rhythmNote: '减量巩固，动作要稳' }
	}

	let reps = baseReps + mesoIndex * 2
	let sets = baseSets

	if (phase === 'accumulate') {
		reps += pos * repStep
	} else if (phase === 'consolidate') {
		reps += (accumulateDays - 1) * repStep
	} else {
		reps += (accumulateDays - 1) * repStep
		if (reps >= repCap - 2 && sets < setCap) {
			sets += 1
		} else {
			reps = Math.min(repCap, reps + repStep)
		}
	}

	reps = Math.min(repCap, reps)

	const rhythmNote =
		phase === 'accumulate'
			? `本周期第 ${pos + 1} 天，+${repStep} 次`
			: phase === 'consolidate'
				? '维持次数，打磨动作质量'
				: sets > baseSets
					? '升阶：加 1 组'
					: `升阶：+${repStep} 次`

	return { reps, sets, phase, rhythmNote }
}

export function calcHoldScheme(
	sessionIndex,
	{ baseSec, baseSets, secCap, setCap = 4, holdStep = 5 }
) {
	const phase = getSessionPhase(sessionIndex)
	const isDeload = phase === 'deload'
	const pos = sessionIndex % mesocycleLength
	const mesoIndex = Math.floor(sessionIndex / mesocycleLength)

	if (isDeload) {
		const sec = applyDeload(baseSec + mesoIndex * 10, 10)
		const sets = Math.max(1, baseSets - 1)
		return { sec, sets, phase, rhythmNote: '缩短时长，专注呼吸' }
	}

	let sec = baseSec + mesoIndex * 10
	let sets = baseSets

	if (phase === 'accumulate') {
		sec += pos * holdStep
	} else if (phase === 'consolidate') {
		sec += (accumulateDays - 1) * holdStep
	} else {
		sec += (accumulateDays - 1) * holdStep
		if (sec >= secCap - 10 && sets < setCap) {
			sets += 1
		} else {
			sec = Math.min(secCap, sec + holdStep)
		}
	}

	sec = Math.min(secCap, sec)

	const rhythmNote =
		phase === 'accumulate'
			? `本周期第 ${pos + 1} 天，+${holdStep} 秒`
			: phase === 'consolidate'
				? '维持秒数，核心收紧'
				: sets > baseSets
					? '升阶：加 1 组'
					: `升阶：+${holdStep} 秒`

	return { sec, sets, phase, rhythmNote }
}

export function getPushVariantAt(sessionIndex) {
	let remaining = sessionIndex
	for (const v of PUSH_VARIANTS) {
		if (remaining < v.sessions) {
			return { variant: v, localSession: remaining }
		}
		remaining -= v.sessions
	}
	const last = PUSH_VARIANTS[PUSH_VARIANTS.length - 1]
	return { variant: last, localSession: sessionIndex }
}

function variantOrder(id) {
	return PUSH_VARIANTS.findIndex((v) => v.id === id)
}

/** 当前课次应练的推荐变式（按累计课次自动进阶） */
export function getRecommendedPushVariant(sessionIndex) {
	return getPushVariantAt(sessionIndex).variant
}

/** 已通过课次「练到」的变式（墙推 0–17 课次 → 仅墙推，第 18 课次起含斜撑…） */
export function getEarnedPushVariants(sessionIndex) {
	let consumed = 0
	const list = []
	for (const v of PUSH_VARIANTS) {
		list.push(v)
		if (sessionIndex < consumed + v.sessions) break
		consumed += v.sessions
	}
	return list
}

/**
 * 可选变式：当前推荐 + 已练到且更难的变式（不会倒退到墙推）
 */
export function getUnlockedPushVariants(sessionIndex) {
	const recommended = getRecommendedPushVariant(sessionIndex)
	const recOrder = variantOrder(recommended.id)
	return getEarnedPushVariants(sessionIndex).filter((v) => variantOrder(v.id) >= recOrder)
}

/**
 * 解析展示/训练用的俯卧撑变式
 * - 未选择、预览、或本地仍存更简单变式 → 当前课次推荐
 * - 仅接受已练到且 ≥ 推荐难度的手动选择
 */
export function resolvePushVariant(sessionIndex, selectedId) {
	const recommended = getRecommendedPushVariant(sessionIndex)

	if (!selectedId) return recommended

	const earned = getEarnedPushVariants(sessionIndex)
	const selected = earned.find((v) => v.id === selectedId)
	if (!selected) return recommended

	if (variantOrder(selected.id) < variantOrder(recommended.id)) {
		return recommended
	}

	return selected
}

export function getProgramPhaseIndex(sessionIndex) {
	if (sessionIndex <= 0) return 0
	return Math.min(Math.floor(sessionIndex / mesocycleLength), 7)
}
