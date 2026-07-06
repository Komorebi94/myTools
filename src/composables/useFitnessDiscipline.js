import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { parseSimDay } from '@/utils/fitnessSimDay'
import { useTodayKey } from '@/composables/useTodayKey'
import { downloadJsonBackup, readJsonFile } from '@/utils/jsonBackup'
import {
	REWARDS,
	RECORD_STATUS,
	BREAKTHROUGH_LEVELS,
	SURPRISE_REWARD_TIERS
} from '@/constants/fitness'
import { findSurpriseTier } from '@/utils/fitnessSurprise'
import {
	loadFitnessState,
	saveFitnessState,
	importFitnessState,
	applyDayRollover,
	getDayWorkoutRecord,
	getDefaultState,
	clearFitnessStorage
} from '@/utils/fitnessStorage'
import { getTodayPlan } from '@/utils/fitnessPlan'
import { getRecommendedPushVariant } from '@/utils/fitnessProgression'
import {
	calcDailyCompleteReward,
	calcVariantUpgradeBonus,
	calcSimEarnings,
	calcStreakBonus
} from '@/utils/fitnessRewards'
import { formatCalorieDisclaimer, normalizeUserProfile } from '@/utils/fitnessCalories'

function buildRecord({ date, status, moneyChange, remark, afterMoney }) {
	return { date, status, moneyChange, remark, afterMoney }
}

export function useFitnessDiscipline() {
	const route = useRoute()
	const state = ref(getDefaultState())
	const { todayKey, refreshToday } = useTodayKey()
	const toast = ref('')
	const celebrationTick = ref(0)
	const showSurpriseModal = ref(false)
	const activeSurpriseTierId = ref(null)
	let toastTimer = null

	const simDay = computed(() => parseSimDay(route.query.day))
	const isSimMode = computed(() => simDay.value !== null)
	/** 预览用课次：有 day 参数时用参数，否则用真实累计完成次数 */
	const previewSessionIndex = computed(() =>
		isSimMode.value ? simDay.value : state.value.totalCheckDays
	)

	const persist = () => {
		saveFitnessState(state.value)
	}

	const init = () => {
		refreshToday()
		let loaded = loadFitnessState()
		loaded = applyDayRollover(loaded, todayKey.value)
		state.value = loaded
		syncPushVariantToSession()
		persist()
	}

	const todayRecord = computed(() => getDayWorkoutRecord(state.value.recordList, todayKey.value))

	const todayStatus = computed(() => todayRecord.value?.status ?? null)

	const canComplete = computed(() => !todayRecord.value)
	const canSkip = computed(() => !todayRecord.value)
	const canHalf = computed(() => !todayRecord.value)

	const canRedeem = computed(() => !isSimMode.value && state.value.totalMoney > 0)

	const todayMoneyChange = computed(() => todayRecord.value?.moneyChange ?? 0)

	const unlockedBreakthroughs = computed(() =>
		BREAKTHROUGH_LEVELS.filter((b) => state.value[b.id])
	)

	const sortedRecords = computed(() =>
		[...state.value.recordList].sort((a, b) => {
			const byDate = b.date.localeCompare(a.date)
			if (byDate !== 0) return byDate
			return (b.createdAt ?? 0) - (a.createdAt ?? 0)
		})
	)

	const pushSelectionForPlan = computed(() => {
		if (isSimMode.value) return null
		return state.value.selectedTraining
	})

	const userProfile = computed(() => normalizeUserProfile(state.value.userProfile))

	const calorieDisclaimer = computed(() => formatCalorieDisclaimer(userProfile.value))

	const todayPlan = computed(() =>
		getTodayPlan(
			previewSessionIndex.value,
			pushSelectionForPlan.value,
			userProfile.value
		)
	)

	const syncPushVariantToSession = () => {
		const recommendedId = getRecommendedPushVariant(previewSessionIndex.value).id
		const current = state.value.selectedTraining
		const variants = ['wall', 'incline', 'knee', 'standard']
		const curIdx = variants.indexOf(current)
		const recIdx = variants.indexOf(recommendedId)
		if (curIdx < recIdx || curIdx === -1) {
			state.value.selectedTraining = recommendedId
			state.value.lastPushVariant = recommendedId
		}
	}

	const programMeta = computed(() => todayPlan.value.meta)

	const simEarnings = computed(() => {
		if (!isSimMode.value) return null
		return calcSimEarnings(previewSessionIndex.value)
	})

	const liveEarnings = computed(() => calcSimEarnings(state.value.totalCheckDays))

	const streakDaysToBonus = computed(() => {
		const completed = state.value.totalCheckDays
		const mod = completed % 7
		return mod === 0 ? 7 : 7 - mod
	})

	const activeSurpriseTier = computed(() => findSurpriseTier(activeSurpriseTierId.value))

	const showSurpriseForTier = (tier) => {
		if (isSimMode.value || !tier || state.value[tier.id]) return
		activeSurpriseTierId.value = tier.id
		showSurpriseModal.value = true
	}

	const showToast = (message) => {
		toast.value = message
		if (toastTimer) clearTimeout(toastTimer)
		toastTimer = setTimeout(() => {
			toast.value = ''
		}, 2800)
	}

	const setDayWorkoutRecord = (record) => {
		const workoutStatuses = [RECORD_STATUS.FINISH, RECORD_STATUS.SKIP, RECORD_STATUS.HALF]
		const list = state.value.recordList.filter(
			(r) => !(r.date === record.date && workoutStatuses.includes(r.status))
		)
		list.push(record)
		state.value.recordList = list.sort((a, b) => a.date.localeCompare(b.date))
	}

	const appendRedeemRecord = (record) => {
		state.value.recordList = [...state.value.recordList, record].sort(
			(a, b) => b.date.localeCompare(a.date) || (b.createdAt ?? 0) - (a.createdAt ?? 0)
		)
	}

	const applyMoney = (delta) => {
		state.value.totalMoney += delta
		return state.value.totalMoney
	}

	const completeCheckIn = ({ isExtra = false } = {}) => {
		refreshToday()
		state.value = applyDayRollover(state.value, todayKey.value)

		if (todayRecord.value) {
			showToast('今日已完成打卡，请勿重复操作')
			return { ok: false }
		}

		const sessionIndex = state.value.totalCheckDays
		const planBefore = getTodayPlan(sessionIndex, state.value.selectedTraining)
		const pushIdToday = planBefore.pushId

		const dailyReward = calcDailyCompleteReward(sessionIndex)
		let moneyChange = dailyReward.amount
		const remarks = [`完成今日全部训练 · ${dailyReward.tags.join(' ')}`]

		const variantBonus = calcVariantUpgradeBonus(state.value.lastPushVariant, pushIdToday)
		if (variantBonus) {
			moneyChange += variantBonus.amount
			remarks.push(variantBonus.label)
		}

		if (isExtra) {
			moneyChange += REWARDS.EXTRA_COMPLETE
			remarks.push(`超额完成 +${REWARDS.EXTRA_COMPLETE}元`)
		}

		const prevContinue = state.value.continueDays
		const newContinue = prevContinue + 1
		state.value.continueDays = newContinue
		state.value.totalCheckDays += 1

		const streakBonus = calcStreakBonus(sessionIndex)
		if (streakBonus > 0) {
			moneyChange += streakBonus
			state.value.weekReward_7 = true
			remarks.push(`连续7次 +${streakBonus}元`)
		}

		applyMoney(moneyChange)
		const afterMoney = state.value.totalMoney

		setDayWorkoutRecord(
			buildRecord({
				date: todayKey.value,
				status: RECORD_STATUS.FINISH,
				moneyChange,
				remark: remarks.join(' · '),
				afterMoney
			})
		)

		state.value.lastCheckDate = todayKey.value
		state.value.lastPushVariant = pushIdToday
		syncPushVariantToSession()
		persist()

		showToast(`打卡成功！今日 +${moneyChange} 元`)
		celebrationTick.value += 1

		const justReached = SURPRISE_REWARD_TIERS.find(
			(tier) => newContinue === tier.days && !state.value[tier.id]
		)
		if (justReached) {
			showSurpriseForTier(justReached)
		}
		return { ok: true, moneyChange }
	}

	const skipCheckIn = () => {
		refreshToday()
		state.value = applyDayRollover(state.value, todayKey.value)

		if (todayRecord.value?.status === RECORD_STATUS.SKIP) {
			showToast('今日已记录缺席，请勿重复扣款')
			return { ok: false }
		}

		if (todayRecord.value) {
			showToast('今日已有打卡记录，无法改为缺席')
			return { ok: false }
		}

		const moneyChange = REWARDS.DAILY_SKIP
		applyMoney(moneyChange)
		const afterMoney = state.value.totalMoney

		state.value.continueDays = 0
		state.value.weekReward_7 = false

		setDayWorkoutRecord(
			buildRecord({
				date: todayKey.value,
				status: RECORD_STATUS.SKIP,
				moneyChange,
				remark: '今日缺席 · 摆烂扣款',
				afterMoney
			})
		)

		state.value.lastCheckDate = todayKey.value
		persist()

		showToast(`已记录缺席，今日 ${moneyChange} 元`)
		return { ok: true, moneyChange }
	}

	const claimBreakthrough = (levelId) => {
		const level = BREAKTHROUGH_LEVELS.find((b) => b.id === levelId)
		if (!level) return { ok: false }

		if (state.value[level.id]) {
			showToast('该突破奖励已领取，不可重复发放')
			return { ok: false }
		}

		state.value[level.id] = true
		applyMoney(level.reward)

		const afterMoney = state.value.totalMoney
		const existing = getDayWorkoutRecord(state.value.recordList, todayKey.value)

		if (existing) {
			const updated = {
				...existing,
				moneyChange: existing.moneyChange + level.reward,
				remark: `${existing.remark} · ${level.label} +${level.reward}元`,
				afterMoney
			}
			setDayWorkoutRecord(updated)
		} else {
			setDayWorkoutRecord(
				buildRecord({
					date: todayKey.value,
					status: RECORD_STATUS.FINISH,
					moneyChange: level.reward,
					remark: `进阶突破 · ${level.label}`,
					afterMoney
				})
			)
			state.value.lastCheckDate = todayKey.value
		}
		persist()

		showToast(`突破奖励已发放 +${level.reward} 元！`)
		return { ok: true }
	}

	const halfCheckIn = () => {
		refreshToday()
		state.value = applyDayRollover(state.value, todayKey.value)

		if (todayRecord.value) {
			showToast('今日已有记录，请勿重复操作')
			return { ok: false }
		}

		const afterMoney = state.value.totalMoney

		setDayWorkoutRecord(
			buildRecord({
				date: todayKey.value,
				status: RECORD_STATUS.HALF,
				moneyChange: 0,
				remark: '今日未达标 · 练到一半（不奖不罚）',
				afterMoney
			})
		)

		state.value.lastCheckDate = todayKey.value
		persist()

		showToast('已记录未达标，连续完成次数保留，下次可再练')
		return { ok: true }
	}

	const redeemReward = ({ amount, note = '' }) => {
		const value = Number(amount)
		if (!Number.isFinite(value) || value <= 0) {
			showToast('请输入大于 0 的兑换金额')
			return { ok: false }
		}
		const rounded = Math.round(value * 100) / 100
		if (rounded > state.value.totalMoney) {
			showToast(`余额不足，当前仅 ¥${state.value.totalMoney}`)
			return { ok: false }
		}

		applyMoney(-rounded)
		const afterMoney = state.value.totalMoney
		const label = note.trim() || '兑换奖励'

		const now = new Date()
		const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

		appendRedeemRecord({
			date: todayKey.value,
			createdAt: now.getTime(),
			status: RECORD_STATUS.REDEEM,
			moneyChange: -rounded,
			remark: `兑换 · ${label} · ${timeStr}`,
			afterMoney
		})
		persist()

		showToast(`兑换成功，已扣除 ¥${rounded}`)
		return { ok: true, amount: rounded }
	}

	const setPushVariant = (id) => {
		const resolved = getTodayPlan(previewSessionIndex.value, id).pushId
		state.value.selectedTraining = resolved
		persist()
	}

	const redeemSurpriseReward = () => {
		const tier = activeSurpriseTier.value
		if (!tier) {
			showToast('请选择要兑现的惊喜奖档位')
			return { ok: false }
		}

		if (state.value.continueDays < tier.days) {
			showToast(`尚未连续完成 ${tier.days} 次训练`)
			return { ok: false }
		}

		if (state.value[tier.id]) {
			showToast('该档惊喜奖已登记兑现')
			return { ok: false }
		}

		state.value[tier.id] = true
		const now = new Date()
		const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

		appendRedeemRecord({
			date: todayKey.value,
			createdAt: now.getTime(),
			status: RECORD_STATUS.REDEEM,
			moneyChange: 0,
			remark: `惊喜奖 · ${tier.label} · 连续${tier.days}次 · 截图兑现 · ${timeStr}`,
			afterMoney: state.value.totalMoney
		})
		persist()
		showSurpriseModal.value = false
		activeSurpriseTierId.value = null
		showToast(`「${tier.label}」已登记，请保存截图并按约定领取礼物～`)
		return { ok: true }
	}

	const dismissSurpriseModal = () => {
		showSurpriseModal.value = false
		activeSurpriseTierId.value = null
	}

	const setUserProfile = ({ heightCm, weightJin }) => {
		state.value.userProfile = normalizeUserProfile({
			heightCm: heightCm ?? state.value.userProfile?.heightCm,
			weightJin: weightJin ?? state.value.userProfile?.weightJin
		})
		persist()
		showToast('体型已更新，卡路里将按新体重重算')
		return { ok: true }
	}

	const resetAllData = () => {
		clearFitnessStorage()
		state.value = getDefaultState()
		refreshToday()
		showSurpriseModal.value = false
		activeSurpriseTierId.value = null
		showToast('数据已清空，重新开始自律之旅')
	}

	function exportData() {
		downloadJsonBackup(`fitness-discipline-${Date.now()}.json`, {
			version: 1,
			exportedAt: new Date().toISOString(),
			...state.value
		})
		showToast('备份已导出')
	}

	async function importData(file) {
		try {
			const data = await readJsonFile(file)
			state.value = importFitnessState(data)
			refreshToday()
			syncPushVariantToSession()
			showToast('备份已导入')
		} catch {
			showToast('导入失败，请检查 JSON 格式')
		}
	}

	onMounted(init)

	return {
		state,
		todayKey,
		toast,
		celebrationTick,
		showSurpriseModal,
		activeSurpriseTier,
		todayRecord,
		todayStatus,
		canComplete,
		canSkip,
		canHalf,
		canRedeem,
		todayMoneyChange,
		liveEarnings,
		streakDaysToBonus,
		unlockedBreakthroughs,
		sortedRecords,
		todayPlan,
		programMeta,
		userProfile,
		calorieDisclaimer,
		isSimMode,
		simDay,
		previewSessionIndex,
		simEarnings,
		completeCheckIn,
		skipCheckIn,
		halfCheckIn,
		redeemReward,
		redeemSurpriseReward,
		dismissSurpriseModal,
		claimBreakthrough,
		setPushVariant,
		setUserProfile,
		resetAllData,
		exportData,
		importData,
		showToast,
		init
	}
}
