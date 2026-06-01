import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
	CALORIE_DISCLAIMER,
	LUJX_TABS,
	PHASES,
	PLAN_DAYS,
	TRAINING_DAYS,
	TRAINING_TIPS,
	WARMUP_PLAN,
	WEEK_DAY_LABEL
} from '@/constants/lujx'
import {
	buildCalendarCells,
	calcMonthlySummary,
	calcSessionStreak,
	calcWeekCompletion,
	estimateCalories,
	estimateDurationMinutes,
	getActivePhase,
	getDailyBlock,
	getDayIndexForProgramDay,
	getMissedTrainingDays,
	getMockStats,
	getNextPhaseInfo,
	getPhaseProgress,
	getPlanForDate,
	getProgramDayFromStart,
	getWeekFromProgramDay,
	isSameCalendarMonth
} from '@/utils/lujxPlan'
import { loadLujxState, saveLujxState, importLujxState } from '@/utils/lujxStorage'
import { parseQueryPositiveInt } from '@/utils/routeQuery'
import { useTodayKey } from '@/composables/useTodayKey'
import { downloadJsonBackup, readJsonFile } from '@/utils/jsonBackup'

export function useLujxPlan() {
	const route = useRoute()
	const router = useRouter()
	const { todayKey, todayDate, refreshToday } = useTodayKey()

	const state = ref(loadLujxState())
	const toast = ref('')
	const calendarMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
	const selectedDay = ref(null)
	let toastTimer = null

	const mockDay = computed(() => parseQueryPositiveInt(route.query, 'mockDay'))
	const isMockMode = computed(() => mockDay.value !== null)

	const activeTab = computed({
		get() {
			const tab = route.query.tab
			const id = Array.isArray(tab) ? tab[0] : tab
			return LUJX_TABS.some((t) => t.id === id) ? id : 'today'
		},
		set(id) {
			const query = { ...route.query, tab: id }
			router.replace({ query })
		}
	})

	const programDay = computed(() => {
		if (mockDay.value) return mockDay.value
		return getProgramDayFromStart(state.value.startDate, todayDate.value)
	})

	const currentWeek = computed(() => getWeekFromProgramDay(programDay.value))

	const activePhase = computed(() => getActivePhase(currentWeek.value))

	const previewDayIndex = computed(() => {
		if (mockDay.value) return getDayIndexForProgramDay(mockDay.value)
		return todayDate.value.getDay()
	})

	const todayBlock = computed(() =>
		getDailyBlock(previewDayIndex.value, activePhase.value.preset)
	)

	const todayLabel = computed(() => {
		if (mockDay.value) {
			const sessionInWeek = PLAN_DAYS.slice(0, ((mockDay.value - 1) % 7) + 1).filter((d) =>
				TRAINING_DAYS.has(d)
			).length
			return `计划第 ${mockDay.value} 天 · ${WEEK_DAY_LABEL[previewDayIndex.value]} · 第 ${currentWeek.value} 周第 ${sessionInWeek} 练`
		}
		return `${todayKey.value} ${WEEK_DAY_LABEL[todayDate.value.getDay()]}`
	})

	const todayChecked = computed(() =>
		state.value.records.some((item) => item.date === todayKey.value)
	)

	const trainingRecordsCount = computed(() => {
		if (isMockMode.value) return getMockStats(mockDay.value).trainingRecordsCount
		return state.value.records.length
	})

	const trainingStreak = computed(() => {
		if (isMockMode.value) return getMockStats(mockDay.value).trainingStreak
		return calcSessionStreak(state.value.records, todayDate.value)
	})

	const weekCompletion = computed(() => {
		if (isMockMode.value) {
			const done = getMockStats(mockDay.value).trainingRecordsCount % 4
			return { done: done || 4, planned: 4 }
		}
		return calcWeekCompletion(state.value.records, todayDate.value)
	})

	const checkedDateSet = computed(() => new Set(state.value.records.map((item) => item.date)))

	const todayCalories = computed(() => estimateCalories(todayBlock.value))
	const todayDuration = computed(() => estimateDurationMinutes(todayBlock.value))
	const todayCaloriesText = computed(() => {
		if (todayBlock.value.type !== 'training') {
			return todayBlock.value.restPlan?.calories || '约 30-80 kcal（轻活动）'
		}
		return `约 ${todayCalories.value} kcal`
	})

	const phaseProgress = computed(() => getPhaseProgress(currentWeek.value, activePhase.value))

	const calendarTitle = computed(() => {
		const y = calendarMonth.value.getFullYear()
		const m = String(calendarMonth.value.getMonth() + 1).padStart(2, '0')
		return `${y} 年 ${m} 月`
	})

	const calendarCells = computed(() =>
		buildCalendarCells(
			calendarMonth.value,
			checkedDateSet.value,
			todayKey.value,
			state.value.startDate || todayKey.value
		)
	)

	const canUndoToday = computed(() => todayChecked.value && !isMockMode.value)

	const todayDayIndex = computed(() => previewDayIndex.value)

	const missedTrainingDays = computed(() => {
		if (isMockMode.value) return []
		return getMissedTrainingDays(
			state.value.records,
			todayDate.value,
			state.value.startDate || todayKey.value
		)
	})

	const remainingTrainingThisWeek = computed(() => {
		const { done, planned } = weekCompletion.value
		return Math.max(0, planned - done)
	})

	const nextPhaseInfo = computed(() => getNextPhaseInfo(currentWeek.value))

	const isCalendarCurrentMonth = computed(() =>
		isSameCalendarMonth(calendarMonth.value, todayDate.value)
	)

	const monthlySummary = computed(() => {
		if (isMockMode.value) {
			return { planned: 0, done: 0, completionRate: 0, estimatedKcal: 0 }
		}
		return calcMonthlySummary(
			calendarMonth.value,
			state.value.records,
			state.value.startDate || todayKey.value,
			todayKey.value
		)
	})

	const showFixedCheckin = computed(
		() =>
			activeTab.value === 'today' && todayBlock.value.type === 'training' && !isMockMode.value
	)

	function showToast(message) {
		toast.value = message
		if (toastTimer) clearTimeout(toastTimer)
		toastTimer = setTimeout(() => {
			toast.value = ''
		}, 2800)
	}

	function persist(next) {
		state.value = next
		saveLujxState(next)
	}

	function checkInTraining() {
		if (isMockMode.value || todayBlock.value.type !== 'training' || todayChecked.value) return

		const startDate = state.value.startDate || todayKey.value
		const nextRecords = [
			{ date: todayKey.value, status: 'training' },
			...state.value.records.filter((r) => r.date !== todayKey.value)
		].slice(0, 240)
		persist({ startDate, records: nextRecords })
		showToast('训练打卡成功 🎉')
	}

	function undoTodayCheckIn() {
		if (isMockMode.value || !todayChecked.value) return
		const nextRecords = state.value.records.filter((r) => r.date !== todayKey.value)
		persist({ ...state.value, records: nextRecords })
		showToast('已撤销今日打卡')
	}

	function changeMonth(delta) {
		calendarMonth.value = new Date(
			calendarMonth.value.getFullYear(),
			calendarMonth.value.getMonth() + delta,
			1
		)
	}

	function openDayDetail(cell) {
		if (!cell.inMonth) return
		const date = new Date(`${cell.key}T00:00:00`)
		const effectiveStart = state.value.startDate || todayKey.value
		selectedDay.value = {
			...getPlanForDate(date, effectiveStart),
			dayStatus: cell.dayStatus,
			isChecked: cell.isChecked
		}
	}

	function goToTodayMonth() {
		const now = new Date()
		calendarMonth.value = new Date(now.getFullYear(), now.getMonth(), 1)
		refreshToday()
	}

	function closeDayDetail() {
		selectedDay.value = null
	}

	function setActiveTab(id) {
		activeTab.value = id
	}

	function reloadState() {
		state.value = loadLujxState()
	}

	function exportData() {
		downloadJsonBackup(`lujx-plan-${Date.now()}.json`, {
			version: 2,
			exportedAt: new Date().toISOString(),
			startDate: state.value.startDate,
			records: state.value.records
		})
		showToast('备份已导出')
	}

	async function importData(file) {
		try {
			const data = await readJsonFile(file)
			importLujxState(data)
			reloadState()
			refreshToday()
			showToast('备份已导入')
		} catch {
			showToast('导入失败，请检查 JSON 格式')
		}
	}

	return {
		tabs: LUJX_TABS,
		phases: PHASES,
		warmupPlan: WARMUP_PLAN,
		trainingTips: TRAINING_TIPS,
		calorieDisclaimer: CALORIE_DISCLAIMER,
		toast,
		activeTab,
		isMockMode,
		mockDay,
		todayLabel,
		todayBlock,
		todayCaloriesText,
		todayDuration,
		todayChecked,
		canUndoToday,
		trainingRecordsCount,
		trainingStreak,
		weekCompletion,
		currentWeek,
		activePhase,
		phaseProgress,
		calendarTitle,
		calendarCells,
		selectedDay,
		todayDayIndex,
		missedTrainingDays,
		remainingTrainingThisWeek,
		nextPhaseInfo,
		isCalendarCurrentMonth,
		monthlySummary,
		showFixedCheckin,
		checkInTraining,
		undoTodayCheckIn,
		changeMonth,
		openDayDetail,
		closeDayDetail,
		goToTodayMonth,
		setActiveTab,
		reloadState,
		exportData,
		importData
	}
}
