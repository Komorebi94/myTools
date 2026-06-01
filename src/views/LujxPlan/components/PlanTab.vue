<template>
    <section class="plan-tab">
        <article class="progress-card">
            <div class="progress-head">
                <h2>{{ activePhase.title }}</h2>
                <span>第 {{ currentWeek }} 周</span>
            </div>
            <div class="progress-bar">
                <i :style="{ width: `${phaseProgress}%` }" />
            </div>
            <p>阶段进度 {{ phaseProgress }}% · {{ activePhase.weekRange }}</p>
            <p v-if="currentWeek >= 13" class="maintain-tip">已进入固定维持阶段，保持当前强度持续执行。</p>
        </article>

        <article class="week-card">
            <h3>本周训练安排</h3>
            <ul>
                <li v-for="item in weeklySchedule" :key="item.day">
                    <span class="day">{{ item.day }}</span>
                    <span :class="['tag', item.type]">{{ item.type === 'training' ? '训练' : '休息' }}</span>
                    <span class="label">{{ getWeekLabel(item) }}</span>
                </li>
            </ul>
        </article>

        <h2 class="section-title">进阶时间线</h2>
        <article
            v-for="phase in phases"
            :key="phase.id"
            class="timeline-card"
            :class="{ active: phase.id === activePhase.id }"
        >
            <div class="timeline-top">
                <h3>{{ phase.title }}</h3>
                <span>{{ phase.weekRange }}</span>
            </div>
            <p>{{ phase.desc }}</p>
            <ul>
                <li v-for="item in phase.preview" :key="item">{{ item }}</li>
            </ul>
        </article>
    </section>
</template>

<script setup>
import { WEEKLY_SCHEDULE } from '@/constants/lujx'

const props = defineProps({
    phases: Array,
    activePhase: Object,
    currentWeek: Number,
    phaseProgress: Number
})

const weeklySchedule = WEEKLY_SCHEDULE

function getWeekLabel (item) {
    if (item.type === 'rest') return item.label
    const preset = props.activePhase?.preset
    if (!preset) return item.label
    if (item.dayIndex === 1) return `深蹲 ${preset.squat} · 平板 ${preset.plank}`
    if (item.dayIndex === 2) return `俯卧撑 ${preset.pushup} · 健腹轮 ${preset.wheel}`
    if (item.dayIndex === 4) return `深蹲 ${preset.squat} · 俯卧撑 ${preset.pushup}`
    return `平板 ${preset.plank} · 健腹轮 ${preset.wheel}`
}
</script>

<style scoped>
.plan-tab {
    display: grid;
    gap: 0.65rem;
}

.progress-card,
.week-card,
.timeline-card {
    border: 1px solid #bfdbfe;
    background: #ffffffd9;
    border-radius: 0.95rem;
    padding: 0.85rem;
    box-shadow: 0 8px 24px rgba(148, 163, 184, 0.2);
}

.progress-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.progress-head h2 {
    font-size: 1rem;
    color: #0f172a;
}

.progress-head span {
    font-size: 0.78rem;
    color: #0284c7;
    font-weight: 700;
}

.progress-bar {
    margin-top: 0.55rem;
    height: 0.45rem;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: hidden;
}

.progress-bar i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #0284c7, #22c55e);
    border-radius: 999px;
}

.progress-card p {
    margin-top: 0.35rem;
    font-size: 0.8rem;
    color: #475569;
}

.maintain-tip {
    color: #0369a1 !important;
    font-weight: 600;
}

.week-card h3,
.section-title {
    font-size: 0.95rem;
    color: #0f172a;
    margin-bottom: 0.45rem;
}

.week-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.35rem;
}

.week-card li {
    display: grid;
    grid-template-columns: 2.5rem auto 1fr;
    gap: 0.4rem;
    align-items: center;
    font-size: 0.8rem;
}

.day {
    font-weight: 700;
    color: #334155;
}

.tag {
    border-radius: 999px;
    padding: 0.1rem 0.4rem;
    font-size: 0.68rem;
    font-weight: 700;
    text-align: center;
}

.tag.training {
    background: #dcfce7;
    color: #166534;
}

.tag.rest {
    background: #e0f2fe;
    color: #075985;
}

.label {
    color: #475569;
}

.timeline-card.active {
    border-color: #60a5fa;
    box-shadow: 0 0 0 1px #93c5fd inset;
}

.timeline-top {
    display: flex;
    justify-content: space-between;
    gap: 0.6rem;
}

.timeline-top h3 {
    font-size: 0.94rem;
}

.timeline-top span {
    font-size: 0.76rem;
    color: #0284c7;
}

.timeline-card p {
    margin-top: 0.28rem;
    color: #475569;
    font-size: 0.82rem;
}

.timeline-card ul {
    margin-top: 0.45rem;
    padding-left: 1rem;
}

.timeline-card li {
    color: #334155;
    font-size: 0.8rem;
}
</style>
