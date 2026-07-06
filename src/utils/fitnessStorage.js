import { FITNESS_STORAGE_KEY, RECORD_STATUS, SURPRISE_REWARD_TIERS } from '@/constants/fitness'
import { formatDateKey, getYesterdayKey } from '@/utils/date'

import { normalizeUserProfile } from '@/utils/fitnessCalories'

export { formatDateKey, getYesterdayKey }

export function getDefaultState() {
	return {
		totalMoney: 0,
		continueDays: 0,
		totalCheckDays: 0,
		break_5: false,
		break_10: false,
		break_squat_30: false,
		break_plank_90: false,
		break_lunge_20: false,
		weekReward_7: false,
		recordList: [],
		lastCheckDate: '',
		selectedTraining: 'wall',
		lastPushVariant: 'wall',
		userProfile: normalizeUserProfile(),
		...Object.fromEntries(SURPRISE_REWARD_TIERS.map((t) => [t.id, false]))
	}
}

/** 合并旧版单档惊喜奖字段，并补齐各档兑现标记 */
export function normalizeFitnessState(state) {
	const next = { ...getDefaultState(), ...state }

	if (next.surpriseRewardRedeemed) {
		next.surprise_60 = true
	}
	delete next.surpriseRewardUnlocked
	delete next.surpriseRewardRedeemed
	delete next.surpriseRewardUnlockedAt

	for (const tier of SURPRISE_REWARD_TIERS) {
		if (typeof next[tier.id] !== 'boolean') {
			next[tier.id] = false
		}
	}

	next.userProfile = normalizeUserProfile(next.userProfile)

	return next
}

const LEGACY_STORAGE_KEY = 'fitness_discipline_v1'

export function loadFitnessState() {
	try {
		let raw = localStorage.getItem(FITNESS_STORAGE_KEY)
		if (!raw) {
			raw = localStorage.getItem(LEGACY_STORAGE_KEY)
			if (raw) {
				localStorage.setItem(FITNESS_STORAGE_KEY, raw)
				localStorage.removeItem(LEGACY_STORAGE_KEY)
			}
		}
		if (!raw) return getDefaultState()
		const parsed = JSON.parse(raw)
		return normalizeFitnessState(parsed)
	} catch {
		return getDefaultState()
	}
}

export function saveFitnessState(state) {
	localStorage.setItem(FITNESS_STORAGE_KEY, JSON.stringify(state))
}

const WORKOUT_STATUSES = [RECORD_STATUS.FINISH, RECORD_STATUS.SKIP, RECORD_STATUS.HALF]

/** 当日训练打卡记录（不含兑换） */
export function getDayWorkoutRecord(recordList, dateKey) {
	return recordList.find((r) => r.date === dateKey && WORKOUT_STATUSES.includes(r.status)) ?? null
}

/** @deprecated 使用 getDayWorkoutRecord */
export function getRecordByDate(recordList, dateKey) {
	return getDayWorkoutRecord(recordList, dateKey)
}

export function hasFinishOnDate(recordList, dateKey) {
	const record = getDayWorkoutRecord(recordList, dateKey)
	return record?.status === RECORD_STATUS.FINISH
}

/**
 * 跨天结算：休息日或未打开 app 不影响连续完成次数；仅「缺席」会清零（见 skipCheckIn）
 */
export function applyDayRollover(state) {
	return { ...state }
}

export function clearFitnessStorage() {
	localStorage.removeItem(FITNESS_STORAGE_KEY)
	localStorage.removeItem(LEGACY_STORAGE_KEY)
}

/** @param {unknown} data */
export function importFitnessState(data) {
	const next = normalizeFitnessState(data)
	saveFitnessState(next)
	return next
}
