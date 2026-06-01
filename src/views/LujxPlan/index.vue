<template>
    <div class="lujx-plan">
        <header class="hero">
            <p class="hero-kicker">L U J X · SMART TRAINING</p>
            <h1>{{ activeTab === 'today' ? '今日训练' : activeTab === 'plan' ? '进阶计划' : '日历记录' }}</h1>
        </header>

        <div v-if="isMockMode" class="mock-banner">
            <span>预览模式：mockDay={{ mockDay }} · 第 {{ currentWeek }} 周（仅查看，不写入打卡）</span>
            <router-link class="mock-exit" :to="{ path: '/lujx', query: { tab: activeTab } }">退出预览</router-link>
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
                @check-in="checkInTraining"
                @undo="undoTodayCheckIn"
            />

            <PlanTab
                v-if="activeTab === 'plan'"
                :phases="phases"
                :active-phase="activePhase"
                :current-week="currentWeek"
                :phase-progress="phaseProgress"
            />

            <RecordsTab
                v-if="activeTab === 'records'"
                :calendar-title="calendarTitle"
                :calendar-cells="calendarCells"
                @change-month="changeMonth"
                @select-day="openDayDetail"
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
                <span class="tab-icon">{{ tab.icon }}</span>
                <span class="tab-label">{{ tab.label }}</span>
            </button>
        </nav>

        <LujxToast :message="toast" />

        <DayDetailModal
            :plan="selectedDay"
            :is-checked="selectedDay ? checkedDateSet.has(selectedDay.dateKey) : false"
            @close="closeDayDetail"
        />
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
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
    checkedDateSet,
    checkInTraining,
    undoTodayCheckIn,
    changeMonth,
    openDayDetail,
    closeDayDetail,
    setActiveTab
} = useLujxPlan()

onMounted(() => {
    document.body.classList.add('lujx-page-active')
})

onUnmounted(() => {
    document.body.classList.remove('lujx-page-active')
})
</script>

<style scoped>
.lujx-plan {
    min-height: 100%;
    padding: calc(0.75rem + var(--safe-top)) 1rem calc(5.8rem + var(--safe-bottom));
    background: linear-gradient(180deg, #f8fafc 0%, #f0f9ff 48%, #f0fdf4 100%);
    color: #0f172a;
}

.hero {
    margin-bottom: 0.65rem;
}

.hero-kicker {
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    color: #0284c7;
    margin-bottom: 0.25rem;
}

.hero h1 {
    font-size: 1.25rem;
    font-weight: 800;
}

.mock-banner {
    margin-bottom: 0.6rem;
    border: 1px solid #7dd3fc;
    background: #e0f2fe;
    color: #0c4a6e;
    padding: 0.52rem 0.65rem;
    border-radius: 0.7rem;
    font-size: 0.78rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.mock-exit {
    flex-shrink: 0;
    padding: 0.2rem 0.5rem;
    border-radius: 0.4rem;
    background: #fff;
    color: #0369a1;
    font-size: 0.72rem;
    font-weight: 700;
    text-decoration: none;
}

.content-area {
    height: calc(100vh - 9rem - var(--safe-top));
    overflow-y: auto;
}

.bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    display: flex;
    gap: 0.4rem;
    padding: 0.55rem 0.8rem calc(0.55rem + var(--safe-bottom));
    background: rgba(248, 250, 252, 0.95);
    border-top: 1px solid #bfdbfe;
    backdrop-filter: blur(16px);
}

.tab-btn {
    flex: 1;
    border: 1px solid #cbd5e1;
    background: #fff;
    color: #64748b;
    border-radius: 0.72rem;
    padding: 0.42rem 0.35rem;
    display: grid;
    justify-items: center;
    gap: 0.15rem;
    cursor: pointer;
}

.tab-btn.active {
    color: #0f172a;
    border-color: #7dd3fc;
    background: linear-gradient(160deg, #eff6ff, #ecfeff);
    box-shadow: 0 0 0 1px #bae6fd inset;
}

.tab-icon {
    font-size: 1rem;
    line-height: 1;
}

.tab-label {
    font-size: 0.7rem;
    font-weight: 700;
}
</style>

<style lang="scss">
body.lujx-page-active {
    overflow: auto;
    background: #f8fafc;
}
</style>
