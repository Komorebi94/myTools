/** 默认体型：105 斤 / 163 cm（可在设置页修改） */
export const DEFAULT_FITNESS_PROFILE = {
	heightCm: 163,
	weightJin: 105
}

export const CALORIE_ESTIMATE_RULES = {
	formula: 'kcal ≈ MET × 体重(kg) × 训练时长(小时)',
	weightNote: '体重：1 斤 = 0.5 kg，换算后参与计算',
	heightNote: '身高仅用于展示与记录，当前公式不纳入身高',
	durationNote:
		'训练时长 = 各动作（每组耗时 + 组间休息 1.25 分钟）之和 + 热身 5 分钟 + 收尾 5 分钟，整课不少于 30 分钟',
	metNote: 'MET 随课次递进：前 6 次 3.0 → 6–17 次 3.4 → 18–35 次 3.8 → 36 次起 4.2',
	perTaskNote: '各动作 kcal 按该动作耗时占整课比例分配'
}

export function jinToKg(weightJin) {
	return Math.round(weightJin * 0.5 * 10) / 10
}

export function normalizeUserProfile(raw = {}) {
	const heightCm = clampInt(raw.heightCm, 120, 220, DEFAULT_FITNESS_PROFILE.heightCm)
	const weightJin = clampInt(raw.weightJin, 60, 250, DEFAULT_FITNESS_PROFILE.weightJin)

	return {
		heightCm,
		weightJin,
		weightKg: jinToKg(weightJin)
	}
}

export function formatCalorieDisclaimer(profile = normalizeUserProfile()) {
	return `按 ${profile.weightJin} 斤（${profile.weightKg} kg）/ ${profile.heightCm} cm 估算，仅供参考`
}

function clampInt(value, min, max, fallback) {
	const n = Math.round(Number(value))
	if (!Number.isFinite(n)) return fallback
	return Math.min(max, Math.max(min, n))
}

/** @deprecated 使用 normalizeUserProfile */
export const FITNESS_USER_PROFILE = normalizeUserProfile()

/** @deprecated 使用 formatCalorieDisclaimer */
export const FITNESS_CALORIE_DISCLAIMER = formatCalorieDisclaimer(FITNESS_USER_PROFILE)

/** 自重循环训练 MET：随课次递进，首日偏保守 */
export function getSessionMet(sessionIndex = 0) {
	if (sessionIndex < 6) return 3.0
	if (sessionIndex < 18) return 3.4
	if (sessionIndex < 36) return 3.8
	return 4.2
}

const WARMUP_MINUTES = 5
const COOLDOWN_MINUTES = 5
const REST_MINUTES_PER_SET = 1.25
const MIN_SESSION_MINUTES = 30

const SEC_PER_REP = {
	default: 3,
	开合跳: 1.5,
	全身拉伸: 2
}

/**
 * @param {string} detail 如 "8次 × 3组" 或 "20秒 × 2组（每侧）"
 */
export function parseTaskVolume(detail = '') {
	const perSide = detail.includes('每侧')
	const repMatch = detail.match(/(\d+)次\s*[×x]\s*(\d+)组/)
	if (repMatch) {
		let reps = Number(repMatch[1])
		const sets = Number(repMatch[2])
		if (perSide) reps *= 2
		return { type: 'reps', reps, sets, perSide }
	}

	const holdMatch = detail.match(/(\d+)秒\s*[×x]\s*(\d+)组/)
	if (holdMatch) {
		let sec = Number(holdMatch[1])
		const sets = Number(holdMatch[2])
		if (perSide) sec *= 2
		return { type: 'hold', sec, sets, perSide }
	}

	return null
}

export function estimateTaskDurationMinutes(task) {
	const volume = parseTaskVolume(task.detail)
	if (!volume) return 0

	if (volume.type === 'hold') {
		return volume.sets * (volume.sec / 60 + REST_MINUTES_PER_SET)
	}

	const secPerRep = SEC_PER_REP[task.label] ?? SEC_PER_REP.default
	return volume.sets * ((volume.reps * secPerRep) / 60 + REST_MINUTES_PER_SET)
}

export function estimatePlanDurationMinutes(tasks) {
	if (!Array.isArray(tasks) || tasks.length === 0) return 0
	const exerciseMin = tasks.reduce((sum, task) => sum + estimateTaskDurationMinutes(task), 0)
	return Math.max(MIN_SESSION_MINUTES, Math.round(WARMUP_MINUTES + exerciseMin + COOLDOWN_MINUTES))
}

export function estimatePlanCalories(tasks, profile = normalizeUserProfile(), sessionIndex = 0) {
	const durationMin = estimatePlanDurationMinutes(tasks)
	const met = getSessionMet(sessionIndex)
	return Math.round(met * profile.weightKg * (durationMin / 60))
}

/**
 * 为每个 task 分配估算 kcal，并返回整课汇总
 * @param {Array<{ detail: string, label?: string, calories?: number }>} tasks
 */
export function assignPlanCalories(tasks, profile = normalizeUserProfile(), sessionIndex = 0) {
	const totalKcal = estimatePlanCalories(tasks, profile, sessionIndex)
	const durationMin = estimatePlanDurationMinutes(tasks)
	const exerciseMin = tasks.reduce((sum, task) => sum + estimateTaskDurationMinutes(task), 0)

	tasks.forEach((task) => {
		const share = exerciseMin > 0 ? estimateTaskDurationMinutes(task) / exerciseMin : 0
		task.calories = Math.max(1, Math.round(totalKcal * share))
	})

	return { totalKcal, durationMin, met: getSessionMet(sessionIndex) }
}
