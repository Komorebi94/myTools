<template>
    <div class="lujx-plan">
        <div class="lujx-bg" aria-hidden="true" />

        <header class="app-header">
            <div class="header-main">
                <p class="brand">LUJX</p>
                <h1>{{ pageTitle }}</h1>
            </div>
            <div v-if="activeTab === 'today'" class="week-pill">
                W{{ currentWeek }}
            </div>
        </header>

        <div v-if="isMockMode" class="mock-banner" role="status">
            <span>预览 · 第 {{ mockDay }} 天 · 第 {{ currentWeek }} 周（不写入打卡）</span>
            <router-link class="mock-exit" :to="{ path: '/lujx', query: { tab: activeTab } }">退出</router-link>
        </div>

        <main class="content-area">
            <TodayTab
                v-if="activeTab === 'today'"
                :today-label="todayLabel"
                :today-block="todayBlock"
                :active-phase="activePhase"
                :current-week="currentWeek"
                :today-duration="todayDuration"
                :today-calories-text="todayCaloriesText"
                :calorie-disclaimer="calorieDisclaimer"
                :warmup-plan="warmupPlan"
                :training-tips="trainingTips"
                :is-mock-mode="isMockMode"
                :today-checked="todayChecked"
                :can-undo-today="canUndoToday"
                :training-records-count="trainingRecordsCount"
                :training-streak="trainingStreak"
                :week-completion="weekCompletion"
                :missed-training-days="missedTrainingDays"
                :remaining-training-this-week="remainingTrainingThisWeek"
                @check-in="checkInTraining"
                @undo="undoTodayCheckIn"
            />

            <PlanTab
                v-if="activeTab === 'plan'"
                :phases="phases"
                :active-phase="activePhase"
                :current-week="currentWeek"
                :phase-progress="phaseProgress"
                :next-phase-info="nextPhaseInfo"
                :today-day-index="todayDayIndex"
            />

            <RecordsTab
                v-if="activeTab === 'records'"
                :calendar-title="calendarTitle"
                :calendar-cells="calendarCells"
                :monthly-summary="monthlySummary"
                :is-current-month="isCalendarCurrentMonth"
                @change-month="changeMonth"
                @select-day="openDayDetail"
                @go-today="goToTodayMonth"
            />
        </main>

        <nav class="bottom-nav" aria-label="训练页面导航">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="tab-btn"
                :class="{ active: activeTab === tab.id }"
                @click="setActiveTab(tab.id)"
            >
                <span class="tab-icon-wrap" :aria-hidden="true">
                    <span class="tab-icon">{{ tab.icon }}</span>
                </span>
                <span class="tab-label">{{ tab.label }}</span>
            </button>
        </nav>

        <LujxToast :message="toast" />

        <DayDetailModal :plan="selectedDay" @close="closeDayDetail" />
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useLujxPlan } from '@/composables/useLujxPlan'
import DayDetailModal from './components/DayDetailModal.vue'
import LujxToast from './components/LujxToast.vue'
import PlanTab from './components/PlanTab.vue'
import RecordsTab from './components/RecordsTab.vue'
import TodayTab from './components/TodayTab.vue'

const {
    tabs,
    phases,
    toast,
    activeTab,
    isMockMode,
    mockDay,
    todayLabel,
    todayBlock,
    todayCaloriesText,
    todayDuration,
    calorieDisclaimer,
    warmupPlan,
    trainingTips,
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
    checkInTraining,
    undoTodayCheckIn,
    changeMonth,
    openDayDetail,
    closeDayDetail,
    goToTodayMonth,
    setActiveTab
} = useLujxPlan()

const pageTitle = computed(() => {
    if (activeTab.value === 'today') return '今日训练'
    if (activeTab.value === 'plan') return '进阶计划'
    return '训练记录'
})

onMounted(() => {
    document.body.classList.add('lujx-page-active')
})

onUnmounted(() => {
    document.body.classList.remove('lujx-page-active')
})
</script>

<style lang="scss">
@import './lujx-theme.scss';
</style>

<style scoped lang="scss">
.lujx-plan {
    position: relative;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    padding: calc(0.65rem + var(--safe-top)) 1rem 0;
    padding-bottom: var(--lujx-footer-stack);
    background: var(--lujx-bg);
    color: var(--lujx-text);
}

.lujx-bg {
    position: fixed;
    inset: 0;
    background: var(--lujx-bg-mesh);
    pointer-events: none;
    z-index: 0;
}

.app-header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
}

.brand {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.22em;
    color: var(--lujx-accent);
    margin-bottom: 0.2rem;
}

.app-header h1 {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
}

.week-pill {
    flex-shrink: 0;
    margin-top: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--lujx-accent);
    background: var(--lujx-accent-soft);
    border: 1px solid rgba(34, 229, 132, 0.28);
}

.mock-banner {
    position: relative;
    z-index: 1;
    margin-bottom: 0.75rem;
    padding: 0.55rem 0.7rem;
    border-radius: var(--lujx-radius-md);
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.28);
    color: #e0f2fe;
    font-size: 0.74rem;
    font-weight: 500;
    line-height: 1.45;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.mock-exit {
    flex-shrink: 0;
    padding: 0.22rem 0.55rem;
    border-radius: 0.45rem;
    background: rgba(255, 255, 255, 0.1);
    color: var(--lujx-blue);
    font-size: 0.7rem;
    font-weight: 700;
    text-decoration: none;
}

.content-area {
    position: relative;
    z-index: 1;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;

    &:has(.today-tab--checkin-fixed) {
        padding-bottom: calc(var(--lujx-checkin-stack) + 0.75rem);
    }
}

.bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    display: flex;
    gap: 0.35rem;
    padding: 0.45rem 0.85rem calc(0.45rem + var(--safe-bottom));
    background: rgba(7, 11, 16, 0.88);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--lujx-border);
}

.tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--lujx-text-dim);
    border-radius: var(--lujx-radius-md);
    padding: 0.4rem 0.25rem 0.35rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;

    &.active {
        color: var(--lujx-text);
        background: var(--lujx-surface-glass);

        .tab-icon-wrap {
            background: var(--lujx-accent-soft);
            box-shadow: 0 0 0 1px rgba(34, 229, 132, 0.25);
        }

        .tab-label {
            color: var(--lujx-accent);
            font-weight: 700;
        }
    }
}

.tab-icon-wrap {
    width: 2rem;
    height: 2rem;
    border-radius: 0.55rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, box-shadow 0.15s ease;
}

.tab-icon {
    font-size: 1.05rem;
    line-height: 1;
}

.tab-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}
</style>

<style lang="scss">
body.lujx-page-active {
    overflow: auto;
    background: #070b10;
}
</style>
