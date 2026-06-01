<template>
    <section class="plan-tab">
        <article class="phase-hero">
            <div class="phase-hero-top">
                <div>
                    <p class="phase-kicker">当前阶段</p>
                    <h2>{{ activePhase.title }}</h2>
                </div>
                <div class="week-badge">第 {{ currentWeek }} 周</div>
            </div>
            <p class="time-based-note">
                本计划按开始日期自动升阶（时间进阶），与单次是否练满无直接关联。
            </p>
            <div class="progress-track" role="progressbar" :aria-valuenow="phaseProgress" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-fill" :style="{ width: `${phaseProgress}%` }" />
            </div>
            <p class="progress-meta">阶段进度 {{ phaseProgress }}% · {{ activePhase.weekRange }}</p>
            <p v-if="currentWeek < 13" class="flex-tip">
                若动作质量尚未稳定，可自愿在当前阶段多练 1–2 周，不必赶进度。
            </p>
            <p v-else class="maintain-note">
                已进入固定维持阶段：强度不再上调，重点是规律训练与恢复质量。
            </p>
        </article>

        <article v-if="nextPhaseInfo" class="next-phase-card">
            <p class="next-kicker">即将进入</p>
            <h3>{{ nextPhaseInfo.phase.title }}</h3>
            <p class="next-when">
                <template v-if="nextPhaseInfo.weeksUntil > 0">约 {{ nextPhaseInfo.weeksUntil }} 周后 · {{ nextPhaseInfo.phase.weekRange }}</template>
                <template v-else>本周已进入 · {{ nextPhaseInfo.phase.weekRange }}</template>
            </p>
            <p class="next-desc">{{ nextPhaseInfo.phase.desc }}</p>
            <ul class="next-preview">
                <li v-for="item in nextPhaseInfo.phase.preview" :key="item">{{ item }}</li>
            </ul>
        </article>

        <article class="week-panel">
            <h3 class="panel-title">本周安排</h3>
            <ul class="week-list">
                <li
                    v-for="item in weeklySchedule"
                    :key="item.day"
                    :class="[item.type, { today: item.dayIndex === todayDayIndex }]"
                >
                    <span class="week-day">{{ item.day }}</span>
                    <span class="week-type">{{ item.type === 'training' ? '练' : '休' }}</span>
                    <span class="week-detail">
                        <span v-if="item.dayIndex === todayDayIndex" class="today-tag">今天</span>
                        {{ getWeekLabel(item) }}
                    </span>
                </li>
            </ul>
        </article>

        <h3 class="section-heading">进阶时间线</h3>
        <div class="timeline">
            <article
                v-for="phase in phases"
                :key="phase.id"
                class="timeline-item"
                :class="{ active: phase.id === activePhase.id }"
            >
                <div class="timeline-marker" aria-hidden="true" />
                <div class="timeline-body">
                    <div class="timeline-head">
                        <h4>{{ phase.title }}</h4>
                        <span>{{ phase.weekRange }}</span>
                    </div>
                    <p>{{ phase.desc }}</p>
                    <ul>
                        <li v-for="preview in phase.preview" :key="preview">{{ preview }}</li>
                    </ul>
                </div>
            </article>
        </div>
    </section>
</template>

<script setup>
import { WEEKLY_SCHEDULE } from '@/constants/lujx'

const props = defineProps({
    phases: Array,
    activePhase: Object,
    currentWeek: Number,
    phaseProgress: Number,
    nextPhaseInfo: { type: Object, default: null },
    todayDayIndex: Number
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

<style scoped lang="scss">
.plan-tab {
    display: grid;
    gap: 0.75rem;
}

.phase-hero {
    padding: 1rem;
    border-radius: var(--lujx-radius-xl);
    background: var(--lujx-surface);
    border: 1px solid var(--lujx-border);
    box-shadow: var(--lujx-shadow);
}

.phase-hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
}

.phase-kicker {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--lujx-text-muted);
}

.phase-hero h2 {
    margin-top: 0.2rem;
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.02em;
}

.week-badge {
    flex-shrink: 0;
    padding: 0.35rem 0.6rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--lujx-accent);
    background: var(--lujx-accent-soft);
    border: 1px solid rgba(34, 229, 132, 0.28);
}

.time-based-note {
    margin-top: 0.55rem;
    font-size: 0.72rem;
    color: var(--lujx-text-muted);
    line-height: 1.45;
}

.progress-track {
    margin-top: 0.65rem;
    height: 0.4rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--lujx-accent), var(--lujx-blue));
    transition: width 0.35s ease;
}

.progress-meta {
    margin-top: 0.4rem;
    font-size: 0.76rem;
    color: var(--lujx-text-muted);
}

.flex-tip {
    margin-top: 0.45rem;
    padding: 0.5rem 0.6rem;
    border-radius: var(--lujx-radius-sm);
    font-size: 0.72rem;
    color: var(--lujx-text-secondary);
    background: var(--lujx-surface-glass);
    border: 1px solid var(--lujx-border);
    line-height: 1.45;
}

.maintain-note {
    margin-top: 0.45rem;
    padding: 0.5rem 0.6rem;
    border-radius: var(--lujx-radius-sm);
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--lujx-blue);
    background: var(--lujx-blue-soft);
    border: 1px solid rgba(56, 189, 248, 0.2);
    line-height: 1.45;
}

.next-phase-card {
    padding: 0.9rem 1rem;
    border-radius: var(--lujx-radius-lg);
    background: linear-gradient(135deg, rgba(34, 229, 132, 0.1), rgba(56, 189, 248, 0.08));
    border: 1px solid rgba(34, 229, 132, 0.25);
}

.next-kicker {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--lujx-accent);
}

.next-phase-card h3 {
    margin-top: 0.2rem;
    font-size: 1rem;
    font-weight: 800;
}

.next-when {
    margin-top: 0.25rem;
    font-size: 0.74rem;
    font-weight: 700;
    color: var(--lujx-blue);
}

.next-desc {
    margin-top: 0.35rem;
    font-size: 0.78rem;
    color: var(--lujx-text-secondary);
    line-height: 1.45;
}

.next-preview {
    margin-top: 0.45rem;
    padding-left: 1rem;

    li {
        font-size: 0.74rem;
        color: var(--lujx-text-muted);
        line-height: 1.4;
    }
}

.week-panel {
    padding: 0.9rem 1rem;
    border-radius: var(--lujx-radius-lg);
    background: var(--lujx-surface);
    border: 1px solid var(--lujx-border);
}

.panel-title,
.section-heading {
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--lujx-text-muted);
    margin-bottom: 0.55rem;
}

.section-heading {
    margin-bottom: 0.35rem;
    padding-left: 0.15rem;
}

.week-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.35rem;
}

.week-list li {
    display: grid;
    grid-template-columns: 2.2rem 1.6rem 1fr;
    gap: 0.45rem;
    align-items: center;
    padding: 0.45rem 0.5rem;
    border-radius: var(--lujx-radius-sm);
    background: var(--lujx-surface-2);
    border: 1px solid transparent;

    &.training {
        border-color: rgba(34, 229, 132, 0.12);
    }

    &.rest {
        opacity: 0.85;
    }

    &.today {
        border-color: rgba(34, 229, 132, 0.45);
        background: var(--lujx-accent-soft);
        box-shadow: 0 0 0 1px rgba(34, 229, 132, 0.15) inset;
    }
}

.week-day {
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--lujx-text);
}

.week-type {
    width: 1.35rem;
    height: 1.35rem;
    border-radius: 0.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.62rem;
    font-weight: 800;
}

.training .week-type {
    color: var(--lujx-accent);
    background: rgba(0, 0, 0, 0.15);
}

.rest .week-type {
    color: var(--lujx-blue);
    background: var(--lujx-blue-soft);
}

.week-detail {
    font-size: 0.76rem;
    color: var(--lujx-text-secondary);
    line-height: 1.35;
}

.today-tag {
    display: inline-block;
    margin-right: 0.25rem;
    padding: 0.05rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.6rem;
    font-weight: 800;
    color: var(--lujx-accent);
    background: rgba(0, 0, 0, 0.2);
    vertical-align: 0.05em;
}

.timeline {
    display: grid;
    gap: 0.55rem;
}

.timeline-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.65rem;
    padding: 0.85rem;
    border-radius: var(--lujx-radius-lg);
    background: var(--lujx-surface);
    border: 1px solid var(--lujx-border);
    opacity: 0.72;
    transition: opacity 0.2s ease, border-color 0.2s ease;

    &.active {
        opacity: 1;
        border-color: rgba(34, 229, 132, 0.35);
        box-shadow: 0 0 0 1px rgba(34, 229, 132, 0.12) inset;

        .timeline-marker {
            background: var(--lujx-accent);
            box-shadow: 0 0 12px var(--lujx-accent-glow);
        }
    }
}

.timeline-marker {
    width: 0.5rem;
    height: 0.5rem;
    margin-top: 0.35rem;
    border-radius: 999px;
    background: var(--lujx-text-dim);
    flex-shrink: 0;
}

.timeline-head {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    align-items: flex-start;

    h4 {
        font-size: 0.92rem;
        font-weight: 800;
    }

    span {
        flex-shrink: 0;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--lujx-accent);
    }
}

.timeline-body p {
    margin-top: 0.3rem;
    font-size: 0.8rem;
    color: var(--lujx-text-secondary);
    line-height: 1.45;
}

.timeline-body ul {
    margin-top: 0.45rem;
    padding-left: 1rem;

    li {
        font-size: 0.76rem;
        color: var(--lujx-text-muted);
        line-height: 1.45;
        margin-bottom: 0.15rem;
    }
}
</style>
