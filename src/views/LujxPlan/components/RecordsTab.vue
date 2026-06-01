<template>
    <section class="records-tab">
        <h2>训练记录</h2>
        <div class="calendar-card">
            <div class="calendar-head">
                <button type="button" class="month-switch" @click="$emit('change-month', -1)">‹</button>
                <p>{{ calendarTitle }}</p>
                <button type="button" class="month-switch" @click="$emit('change-month', 1)">›</button>
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
                        training: cell.isTrainingDay && cell.inMonth
                    }"
                    :disabled="!cell.inMonth"
                    @click="$emit('select-day', cell)"
                >
                    <span>{{ cell.day }}</span>
                    <i v-if="cell.isChecked" class="dot" />
                </button>
            </div>
            <p class="hint">点击日期查看当天计划详情</p>
        </div>
    </section>
</template>

<script setup>
import { WEEK_DAY_SHORT } from '@/constants/lujx'

defineProps({
    calendarTitle: String,
    calendarCells: Array
})

defineEmits(['change-month', 'select-day'])

const weekDayShort = WEEK_DAY_SHORT
</script>

<style scoped>
.records-tab {
    border: 1px solid #bfdbfe;
    background: #ffffffd9;
    border-radius: 0.95rem;
    padding: 0.85rem;
    box-shadow: 0 8px 24px rgba(148, 163, 184, 0.25);
}

.records-tab h2 {
    font-size: 1rem;
    margin-bottom: 0.55rem;
    color: #0f172a;
}

.calendar-card {
    border: 1px solid #dbeafe;
    background: #f8fafc;
    border-radius: 0.8rem;
    padding: 0.65rem;
}

.calendar-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.55rem;
}

.calendar-head p {
    font-size: 0.88rem;
    color: #0f172a;
    font-weight: 700;
}

.month-switch {
    width: 1.8rem;
    height: 1.8rem;
    border: 1px solid #bfdbfe;
    border-radius: 0.5rem;
    background: #fff;
    color: #0369a1;
    cursor: pointer;
}

.weekday-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 0.4rem;
}

.weekday-row span {
    text-align: center;
    font-size: 0.72rem;
    color: #475569;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.2rem;
}

.day-cell {
    min-height: 2.1rem;
    border-radius: 0.45rem;
    border: 1px solid #e2e8f0;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    cursor: pointer;
}

.day-cell:disabled {
    cursor: default;
    opacity: 0.45;
}

.day-cell span {
    font-size: 0.73rem;
    color: #334155;
}

.day-cell.training:not(.checked) {
    border-color: #bae6fd;
    background: #f0f9ff;
}

.day-cell.muted span {
    color: #94a3b8;
}

.day-cell.today {
    border-color: #38bdf8;
}

.day-cell.checked {
    background: #dcfce7;
    border-color: #22c55e66;
}

.dot {
    width: 0.25rem;
    height: 0.25rem;
    border-radius: 999px;
    background: #16a34a;
}

.hint {
    margin-top: 0.55rem;
    font-size: 0.74rem;
    color: #64748b;
    text-align: center;
}
</style>
