<template>
    <Transition name="sheet">
        <div v-if="plan" class="day-modal" @click.self="$emit('close')">
            <article class="sheet-card" role="dialog" aria-modal="true" :aria-label="`${plan.dateLabel} 训练详情`">
                <div class="sheet-handle" aria-hidden="true" />
                <header>
                    <div>
                        <h3>{{ plan.dateLabel }}</h3>
                        <p class="meta">第 {{ plan.programDay }} 天 · 第 {{ plan.week }} 周 · {{ plan.phase.title }}</p>
                    </div>
                    <button type="button" class="close-btn" aria-label="关闭" @click="$emit('close')">×</button>
                </header>

                <p v-if="statusBanner" class="status-banner" :class="statusBanner.type">
                    {{ statusBanner.text }}
                </p>

                <div v-if="plan.block.type === 'training'" class="modal-body">
                    <p class="block-title">{{ plan.block.title }}</p>
                    <ul class="exercise-list">
                        <li v-for="item in plan.block.exercises" :key="item.name">
                            <span class="ex-name">{{ item.icon }} {{ item.name }}</span>
                            <strong>{{ item.target }}</strong>
                        </li>
                    </ul>
                    <template v-if="plan.block.coreExtras?.length">
                        <p class="sub-title">核心加强</p>
                        <ul class="exercise-list">
                            <li v-for="item in plan.block.coreExtras" :key="item.name">
                                <span class="ex-name">{{ item.icon }} {{ item.name }}</span>
                                <strong>{{ item.target }}</strong>
                            </li>
                        </ul>
                    </template>
                    <p v-if="plan.block.cooldown" class="note-line">{{ plan.block.cooldown }}</p>
                    <ul v-if="plan.block.stretchItems?.length" class="stretch-list">
                        <li v-for="item in plan.block.stretchItems" :key="item.id">
                            <strong>{{ item.icon }} {{ item.name }}</strong>
                            <span>{{ item.duration }}</span>
                        </li>
                    </ul>
                </div>
                <div v-else class="modal-body rest">
                    <p class="block-title">今日休息</p>
                    <p v-if="plan.block.restPlan?.walk" class="rest-line">🚶 {{ plan.block.restPlan.walk }}</p>
                    <p class="rest-line">🧘 {{ plan.block.restPlan?.stretch }}</p>
                    <ul v-if="plan.block.stretchItems?.length" class="stretch-list">
                        <li v-for="item in plan.block.stretchItems" :key="item.id">
                            <strong>{{ item.icon }} {{ item.name }}</strong>
                            <span>{{ item.duration }}</span>
                        </li>
                    </ul>
                    <p class="note-line">{{ plan.block.restPlan?.calories }}</p>
                </div>
            </article>
        </div>
    </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    plan: { type: Object, default: null }
})

defineEmits(['close'])

const STATUS_TEXT = {
    checked: '✓ 已完成训练打卡',
    missed: '训练日未打卡（漏练不补量，专注本周剩余计划）',
    planned: '计划训练日（未到或今日待完成）',
    today_training: '今日训练日',
    today_rest: '今日休息日',
    rest: '休息日',
    before_start: '计划尚未开始'
}

const statusBanner = computed(() => {
    const status = props.plan?.dayStatus
    if (!status) return null
    const text = STATUS_TEXT[status]
    if (!text) return null
    return { type: status, text }
})
</script>

<style scoped lang="scss">
.day-modal {
    position: fixed;
    inset: 0;
    z-index: 120;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: flex-end;
    padding: 0 0.75rem;
    padding-bottom: calc(0.75rem + var(--safe-bottom));
}

.sheet-card {
    width: 100%;
    max-height: min(82vh, 640px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background: #141b24;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.15rem 1.15rem 1rem 1rem;
    padding: 0.5rem 1rem 1.1rem;
    box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.5);
    color: #f1f5f9;
}

.sheet-handle {
    width: 2.25rem;
    height: 0.25rem;
    margin: 0.35rem auto 0.65rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
}

header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    padding-bottom: 0.65rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

header h3 {
    font-size: 1.05rem;
    font-weight: 800;
}

.meta {
    margin-top: 0.25rem;
    font-size: 0.76rem;
    color: #94a3b8;
}

.close-btn {
    flex-shrink: 0;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    font-size: 1.2rem;
    line-height: 1;
    color: #cbd5e1;
    cursor: pointer;
}

.status-banner {
    margin-top: 0.65rem;
    padding: 0.5rem 0.65rem;
    border-radius: 0.55rem;
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.45;

    &.checked {
        color: #22e584;
        background: rgba(34, 229, 132, 0.12);
        border: 1px solid rgba(34, 229, 132, 0.28);
    }

    &.missed {
        color: #fca5a5;
        background: rgba(248, 113, 113, 0.12);
        border: 1px solid rgba(248, 113, 113, 0.28);
    }

    &.planned,
    &.today_training {
        color: #7dd3fc;
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.25);
    }

    &.today_rest,
    &.rest {
        color: #67e8f9;
        background: rgba(103, 232, 249, 0.1);
        border: 1px solid rgba(103, 232, 249, 0.2);
    }

    &.before_start {
        color: #94a3b8;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
}

.block-title {
    margin-top: 0.75rem;
    font-size: 0.92rem;
    font-weight: 800;
}

.exercise-list {
    list-style: none;
    margin-top: 0.5rem;
    padding: 0;
    display: grid;
    gap: 0.35rem;
}

.exercise-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 0.65rem;
    border-radius: 0.6rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.82rem;
}

.ex-name {
    color: #e2e8f0;
}

.exercise-list strong {
    flex-shrink: 0;
    color: #22e584;
    font-size: 0.78rem;
}

.sub-title {
    margin-top: 0.65rem;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #22e584;
}

.note-line,
.rest-line {
    margin-top: 0.5rem;
    font-size: 0.78rem;
    color: #94a3b8;
    line-height: 1.45;
}

.stretch-list {
    list-style: none;
    margin-top: 0.45rem;
    padding: 0;
    display: grid;
    gap: 0.3rem;
}

.stretch-list li {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.45rem 0.55rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    font-size: 0.76rem;
    color: #cbd5e1;
}

.sheet-enter-active,
.sheet-leave-active {
    transition: opacity 0.22s ease;

    .sheet-card {
        transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
    }
}

.sheet-enter-from,
.sheet-leave-to {
    opacity: 0;

    .sheet-card {
        transform: translateY(100%);
    }
}
</style>
