<template>
    <section class="records-tab">
        <div class="month-summary">
            <article class="summary-item">
                <strong>{{ monthlySummary.done }}/{{ monthlySummary.planned }}</strong>
                <p>本月训练完成</p>
            </article>
            <article class="summary-item">
                <strong>{{ monthlySummary.completionRate }}%</strong>
                <p>完成率</p>
            </article>
            <article class="summary-item accent">
                <strong>~{{ monthlySummary.estimatedKcal }}</strong>
                <p>估算消耗 kcal</p>
            </article>
        </div>
        <p v-if="monthlySummary.planned === 0" class="summary-empty">本月暂无已过的训练日，或计划尚未开始</p>

        <div class="calendar-shell">
            <div class="calendar-toolbar">
                <button type="button" class="nav-btn" aria-label="上一月" @click="$emit('change-month', -1)">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path fill="currentColor" d="M14.5 6.5 9 12l5.5 5.5-1.4 1.4L6.2 12l7-7.4 1.3 1.4Z" />
                    </svg>
                </button>
                <p class="month-title">{{ calendarTitle }}</p>
                <button type="button" class="nav-btn" aria-label="下一月" @click="$emit('change-month', 1)">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path fill="currentColor" d="m9.5 6.5 5.5 5.5-5.5 5.5 1.4 1.4L17.8 12l-7-7.4-1.3 1.4Z" />
                    </svg>
                </button>
            </div>

            <button v-if="!isCurrentMonth" type="button" class="today-jump" @click="$emit('go-today')">
                回到本月
            </button>

            <div class="legend" aria-hidden="true">
                <span><i class="dot checked" />已打卡</span>
                <span><i class="dot missed" />漏练</span>
                <span><i class="dot training" />计划训练</span>
                <span><i class="dot rest" />休息</span>
            </div>

            <div class="weekday-row">
                <span v-for="wd in weekDayShort" :key="wd">{{ wd }}</span>
            </div>

            <div class="calendar-grid">
                <button
                    v-for="cell in calendarCells"
                    :key="cell.key"
                    type="button"
                    class="day-cell"
                    :class="{
                        muted: !cell.inMonth,
                        today: cell.isToday,
                        checked: cell.isChecked,
                        missed: cell.isMissed,
                        training: cell.isTrainingDay && cell.inMonth && !cell.isChecked && !cell.isMissed,
                        rest: cell.inMonth && !cell.isTrainingDay
                    }"
                    :disabled="!cell.inMonth"
                    @click="$emit('select-day', cell)"
                >
                    <span class="day-num">{{ cell.day }}</span>
                    <span v-if="cell.isChecked" class="mark check-mark">✓</span>
                    <span v-else-if="cell.isMissed" class="mark missed-mark">!</span>
                    <span v-else-if="cell.isTrainingDay && cell.inMonth" class="train-dot" />
                </button>
            </div>

            <p class="hint">点击日期查看计划详情与状态</p>
        </div>
    </section>
</template>

<script setup>
import { WEEK_DAY_SHORT } from '@/constants/lujx'

defineProps({
    calendarTitle: String,
    calendarCells: Array,
    monthlySummary: {
        type: Object,
        default: () => ({ planned: 0, done: 0, completionRate: 0, estimatedKcal: 0 })
    },
    isCurrentMonth: { type: Boolean, default: true }
})

defineEmits(['change-month', 'select-day', 'go-today'])

const weekDayShort = WEEK_DAY_SHORT
</script>

<style scoped lang="scss">
.records-tab {
    display: grid;
    gap: 0.75rem;
}

.month-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.45rem;
}

.summary-item {
    padding: 0.65rem 0.4rem;
    text-align: center;
    border-radius: var(--lujx-radius-md);
    background: var(--lujx-surface);
    border: 1px solid var(--lujx-border);

    strong {
        display: block;
        font-size: 1rem;
        font-weight: 800;
        color: var(--lujx-text);
    }

    p {
        margin-top: 0.12rem;
        font-size: 0.62rem;
        color: var(--lujx-text-muted);
    }

    &.accent strong {
        color: var(--lujx-orange);
    }
}

.summary-empty {
    margin: -0.35rem 0 0;
    font-size: 0.7rem;
    color: var(--lujx-text-dim);
    text-align: center;
}

.calendar-shell {
    padding: 1rem;
    border-radius: var(--lujx-radius-xl);
    background: var(--lujx-surface);
    border: 1px solid var(--lujx-border);
    box-shadow: var(--lujx-shadow);
}

.calendar-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.month-title {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: -0.02em;
}

.today-jump {
    display: block;
    width: 100%;
    margin-bottom: 0.65rem;
    padding: 0.4rem;
    border: 1px solid rgba(34, 229, 132, 0.35);
    border-radius: 0.5rem;
    background: var(--lujx-accent-soft);
    color: var(--lujx-accent);
    font-size: 0.74rem;
    font-weight: 700;
    cursor: pointer;
}

.nav-btn {
    width: 2.1rem;
    height: 2.1rem;
    border: 1px solid var(--lujx-border-strong);
    border-radius: 0.55rem;
    background: var(--lujx-surface-2);
    color: var(--lujx-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
        background: var(--lujx-surface-glass);
    }
}

.legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem 0.85rem;
    margin-bottom: 0.65rem;
    font-size: 0.65rem;
    color: var(--lujx-text-muted);

    span {
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }
}

.dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
    display: inline-block;

    &.training {
        background: var(--lujx-blue);
        opacity: 0.7;
    }

    &.checked {
        background: var(--lujx-accent);
    }

    &.missed {
        background: var(--lujx-danger);
    }

    &.rest {
        background: var(--lujx-text-dim);
        opacity: 0.5;
    }
}

.weekday-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 0.35rem;

    span {
        text-align: center;
        font-size: 0.68rem;
        font-weight: 700;
        color: var(--lujx-text-dim);
    }
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
}

.day-cell {
    aspect-ratio: 1;
    min-height: 2.35rem;
    border: 1px solid transparent;
    border-radius: 0.55rem;
    background: var(--lujx-surface-2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.1rem;
    cursor: pointer;
    position: relative;
    transition: border-color 0.15s ease, background 0.15s ease;

    &:disabled {
        cursor: default;
        background: transparent;
        opacity: 0.35;
    }

    &.rest:not(.today) {
        opacity: 0.65;
    }
}

.day-num {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--lujx-text-secondary);
}

.day-cell.training:not(.checked):not(.missed) {
    border-color: rgba(56, 189, 248, 0.25);
    background: var(--lujx-blue-soft);
}

.day-cell.today {
    border-color: var(--lujx-accent);
    box-shadow: 0 0 0 1px rgba(34, 229, 132, 0.2);
}

.day-cell.checked {
    background: var(--lujx-accent-soft);
    border-color: rgba(34, 229, 132, 0.4);

    .day-num {
        color: var(--lujx-accent);
        font-weight: 800;
    }
}

.day-cell.missed {
    background: rgba(248, 113, 113, 0.12);
    border-color: rgba(248, 113, 113, 0.35);

    .day-num {
        color: #fca5a5;
    }
}

.mark {
    font-size: 0.55rem;
    font-weight: 800;
    line-height: 1;
}

.check-mark {
    color: var(--lujx-accent);
}

.missed-mark {
    color: var(--lujx-danger);
}

.train-dot {
    width: 0.2rem;
    height: 0.2rem;
    border-radius: 999px;
    background: var(--lujx-blue);
}

.hint {
    margin-top: 0.75rem;
    text-align: center;
    font-size: 0.72rem;
    color: var(--lujx-text-dim);
}
</style>
