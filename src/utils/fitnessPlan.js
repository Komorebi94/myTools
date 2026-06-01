import {
	LEG_EXERCISES,
	CORE_EXERCISES,
	FINISHER_EXERCISES,
	PROGRAM_PHASES,
	PROGRESSION_CYCLE
} from '@/constants/fitness'
import {
	getSessionIndex,
	getPhaseInfo,
	getProgramPhaseIndex,
	calcRepScheme,
	calcHoldScheme,
	resolvePushVariant,
	getUnlockedPushVariants
} from '@/utils/fitnessProgression'
import { getRewardPreview } from '@/utils/fitnessRewards'

function formatReps(label, reps, sets, suffix = '', rhythmNote = '') {
	return {
		label,
		detail: `${reps}次 × ${sets}组${suffix}`,
		rhythmNote
	}
}

function formatHold(label, sec, sets, suffix = '', rhythmNote = '') {
	return {
		label,
		detail: `${sec}秒 × ${sets}组${suffix}`,
		rhythmNote
	}
}

function buildRepTask(exercise, sessionIndex, category) {
	const scheme = calcRepScheme(sessionIndex, {
		baseReps: exercise.baseReps,
		baseSets: exercise.baseSets,
		repCap: exercise.repCap,
		repStep: exercise.repStep ?? 1
	})
	return {
		id: exercise.id,
		icon: exercise.icon,
		category,
		phase: scheme.phase,
		...formatReps(
			exercise.label,
			scheme.reps,
			scheme.sets,
			exercise.suffix ?? '',
			scheme.rhythmNote
		)
	}
}

function buildHoldTask(exercise, sessionIndex, category) {
	const scheme = calcHoldScheme(sessionIndex, {
		baseSec: exercise.baseSec,
		baseSets: exercise.baseSets,
		secCap: exercise.secCap,
		holdStep: exercise.holdStep ?? 5
	})
	return {
		id: exercise.id,
		icon: exercise.icon,
		category,
		phase: scheme.phase,
		...formatHold(
			exercise.label,
			scheme.sec,
			scheme.sets,
			exercise.suffix ?? '',
			scheme.rhythmNote
		)
	}
}

function buildExerciseTask(exercise, sessionIndex, category) {
	if (exercise.type === 'hold') {
		return buildHoldTask(exercise, sessionIndex, category)
	}
	return buildRepTask(exercise, sessionIndex, category)
}

function pickLegExercise(sessionIndex) {
	const meso = Math.floor(sessionIndex / PROGRESSION_CYCLE.mesocycleLength)
	return LEG_EXERCISES[meso % LEG_EXERCISES.length]
}

function pickSecondaryCore(sessionIndex) {
	const pool = CORE_EXERCISES.filter((c) => !c.always)
	const meso = Math.floor(sessionIndex / PROGRESSION_CYCLE.mesocycleLength)
	return pool[meso % pool.length]
}

function buildPushTask(sessionIndex, pushId) {
	const variant = resolvePushVariant(sessionIndex, pushId)
	const scheme = calcRepScheme(sessionIndex, {
		baseReps: variant.baseReps,
		baseSets: variant.baseSets,
		repCap: variant.repCap,
		repStep: 1
	})

	return {
		id: `push-${variant.id}`,
		icon: '💪',
		category: '上肢 · 推',
		phase: scheme.phase,
		selectable: true,
		variantId: variant.id,
		...formatReps(variant.label, scheme.reps, scheme.sets, '', scheme.rhythmNote)
	}
}

export function getProgramMeta(totalCheckDays) {
	const sessionIndex = getSessionIndex(totalCheckDays)
	const phaseInfo = getPhaseInfo(sessionIndex)
	const phaseIdx = getProgramPhaseIndex(sessionIndex)
	const programPhase = PROGRAM_PHASES[phaseIdx]
	const pos = sessionIndex % PROGRESSION_CYCLE.mesocycleLength
	const daysToStep =
		phaseInfo.phase === 'deload'
			? PROGRESSION_CYCLE.deloadInterval - (sessionIndex % PROGRESSION_CYCLE.deloadInterval)
			: phaseInfo.phase === 'progress'
				? 0
				: PROGRESSION_CYCLE.mesocycleLength - pos - 1

	return {
		sessionIndex,
		tierLabel: `第 ${phaseIdx + 1} 阶段`,
		phaseName: programPhase.name,
		phaseDesc: programPhase.desc,
		rhythmLabel: phaseInfo.label,
		rhythmHint: phaseInfo.hint,
		rhythmPhase: phaseInfo.phase,
		dayInMeso: phaseInfo.dayInMeso,
		mesocycleLength: PROGRESSION_CYCLE.mesocycleLength,
		daysToStep,
		progressPercent: phaseInfo.isDeload
			? 100
			: Math.round((phaseInfo.dayInMeso / PROGRESSION_CYCLE.mesocycleLength) * 100),
		isMaxTier: phaseIdx >= PROGRAM_PHASES.length - 1,
		rewardPreview: getRewardPreview(sessionIndex)
	}
}

export function getTodayPlan(totalCheckDays, selectedPushId) {
	const sessionIndex = getSessionIndex(totalCheckDays)
	const pushId = resolvePushVariant(sessionIndex, selectedPushId ?? null).id
	const tasks = []

	tasks.push(buildPushTask(sessionIndex, pushId))
	tasks.push(buildExerciseTask(pickLegExercise(sessionIndex), sessionIndex, '下肢'))

	const plank = CORE_EXERCISES.find((c) => c.always)
	tasks.push(buildExerciseTask(plank, sessionIndex, '核心'))

	const secondary = pickSecondaryCore(sessionIndex)
	tasks.push(
		buildExerciseTask(secondary, sessionIndex, secondary.id === 'wall_angle' ? '肩背' : '核心')
	)

	const finisherPool =
		sessionIndex >= 12
			? FINISHER_EXERCISES
			: FINISHER_EXERCISES.filter((f) => f.id === 'stretch')
	const finisher = finisherPool[sessionIndex % finisherPool.length]
	if (finisher) {
		tasks.push(
			buildExerciseTask(
				finisher,
				sessionIndex,
				finisher.id === 'stretch' ? '放松' : '有氧激活'
			)
		)
	}

	return {
		sessionIndex,
		pushId,
		tasks,
		availablePushVariants: getUnlockedPushVariants(sessionIndex),
		meta: getProgramMeta(totalCheckDays)
	}
}

/** @deprecated 兼容旧引用 */
export function getProgramTier(totalCheckDays) {
	return getProgramPhaseIndex(getSessionIndex(totalCheckDays))
}

export function getAvailablePushVariants(sessionIndex) {
	return getUnlockedPushVariants(sessionIndex)
}
