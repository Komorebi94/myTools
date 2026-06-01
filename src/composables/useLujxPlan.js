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
    getDateKey,
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
import { loadLujxState, saveLujxState } from '@/utils/lujxStorage'

export function useLujxPlan () {
    const route = useRoute()
    const router = useRouter()

    const state = ref(loadLujxState())
    const toast = ref('')
    const calendarMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    const selectedDay = ref(null)
    let toastTimer = null

    const mockDay = computed(() => {
        const raw = Array.isArray(route.query.mockDay) ? route.query.mockDay[0] : route.query.mockDay
        const n = Number(raw)
        return Number.isInteger(n) && n > 0 ? n : null
    })
    const isMockMode = computed(() => mockDay.value !== null)

    const activeTab = computed({
        get () {
            const tab = route.query.tab
            const id = Array.isArray(tab) ? tab[0] : tab
            return LUJX_TABS.some((t) => t.id === id) ? id : 'today'
        },
        set (id) {
            const query = { ...route.query, tab: id }
            router.replace({ query })
        }
    })

    const realToday = new Date()
    const todayKey = getDateKey(realToday)

    const programDay = computed(() => {
        if (mockDay.value) return mockDay.value
        return getProgramDayFromStart(state.value.startDate, realToday)
    })

    const currentWeek = computed(() => getWeekFromProgramDay(programDay.value))

    const activePhase = computed(() => getActivePhase(currentWeek.value))

    const previewDayIndex = computed(() => {
        if (mockDay.value) return getDayIndexForProgramDay(mockDay.value)
        return realToday.getDay()
    })

    const todayBlock = computed(() => getDailyBlock(previewDayIndex.value, activePhase.value.preset))

    const todayLabel = computed(() => {
        if (mockDay.value) {
            const sessionInWeek = PLAN_DAYS.slice(0, (mockDay.value - 1) % 7 + 1).filter((d) => TRAINING_DAYS.has(d)).length
            return `计划第 ${mockDay.value} 天 · ${WEEK_DAY_LABEL[previewDayIndex.value]} · 第 ${currentWeek.value} 周第 ${sessionInWeek} 练`
        }
        return `${todayKey} ${WEEK_DAY_LABEL[realToday.getDay()]}`
    })

    const todayChecked = computed(() => state.value.records.some((item) => item.date === todayKey))

    const trainingRecordsCount = computed(() => {
        if (isMockMode.value) return getMockStats(mockDay.value).trainingRecordsCount
        return state.value.records.length
    })

    const trainingStreak = computed(() => {
        if (isMockMode.value) return getMockStats(mockDay.value).trainingStreak
        return calcSessionStreak(state.value.records, realToday)
    })

    const weekCompletion = computed(() => {
        if (isMockMode.value) {
            const done = getMockStats(mockDay.value).trainingRecordsCount % 4
            return { done: done || 4, planned: 4 }
        }
        return calcWeekCompletion(state.value.records, realToday)
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
        buildCalendarCells(calendarMonth.value, checkedDateSet.value, todayKey, state.value.startDate || todayKey)
    )

    const canUndoToday = computed(() => todayChecked.value && !isMockMode.value)

    const todayDayIndex = computed(() => previewDayIndex.value)

    const missedTrainingDays = computed(() => {
        if (isMockMode.value) return []
        return getMissedTrainingDays(state.value.records, realToday, state.value.startDate || todayKey)
    })

    const remainingTrainingThisWeek = computed(() => {
        const { done, planned } = weekCompletion.value
        return Math.max(0, planned - done)
    })

    const nextPhaseInfo = computed(() => getNextPhaseInfo(currentWeek.value))

    const isCalendarCurrentMonth = computed(() => isSameCalendarMonth(calendarMonth.value, realToday))

    const monthlySummary = computed(() => {
        if (isMockMode.value) {
            return { planned: 0, done: 0, completionRate: 0, estimatedKcal: 0 }
        }
        return calcMonthlySummary(
            calendarMonth.value,
            state.value.records,
            state.value.startDate || todayKey,
            todayKey
        )
    })

    function showToast (message) {
        toast.value = message
        if (toastTimer) clearTimeout(toastTimer)
        toastTimer = setTimeout(() => {
            toast.value = ''
        }, 2800)
    }

    function persist (next) {
        state.value = next
        saveLujxState(next)
    }

    function checkInTraining () {
        if (isMockMode.value || todayBlock.value.type !== 'training' || todayChecked.value) return

        const startDate = state.value.startDate || todayKey
        const nextRecords = [{ date: todayKey, status: 'training' }, ...state.value.records.filter((r) => r.date !== todayKey)].slice(0, 240)
        persist({ startDate, records: nextRecords })
        showToast('训练打卡成功 🎉')
    }

    function undoTodayCheckIn () {
        if (isMockMode.value || !todayChecked.value) return
        const nextRecords = state.value.records.filter((r) => r.date !== todayKey)
        persist({ ...state.value, records: nextRecords })
        showToast('已撤销今日打卡')
    }

    function changeMonth (delta) {
        calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + delta, 1)
    }

    function openDayDetail (cell) {
        if (!cell.inMonth) return
        const date = new Date(`${cell.key}T00:00:00`)
        const effectiveStart = state.value.startDate || todayKey
        selectedDay.value = {
            ...getPlanForDate(date, effectiveStart),
            dayStatus: cell.dayStatus,
            isChecked: cell.isChecked
        }
    }

    function goToTodayMonth () {
        const now = new Date()
        calendarMonth.value = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    function closeDayDetail () {
        selectedDay.value = null
    }

    function setActiveTab (id) {
        activeTab.value = id
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
        checkedDateSet,
        selectedDay,
        todayDayIndex,
        missedTrainingDays,
        remainingTrainingThisWeek,
        nextPhaseInfo,
        isCalendarCurrentMonth,
        monthlySummary,
        checkInTraining,
        undoTodayCheckIn,
        changeMonth,
        openDayDetail,
        closeDayDetail,
        goToTodayMonth,
        setActiveTab
    }
}
