<template>
    <section class="today-tab">
        <div class="stats-strip">
            <article class="stat-item">
                <strong>{{ trainingRecordsCount }}</strong>
                <p>累计打卡</p>
            </article>
            <article class="stat-item accent">
                <strong>{{ trainingStreak }}</strong>
                <p>连续完成训练</p>
            </article>
            <article class="stat-item">
                <strong>{{ weekCompletion.done }}/{{ weekCompletion.planned }}</strong>
                <p>本周完成</p>
            </article>
        </div>
        <p class="streak-hint">连续次数仅计周一/二/四/六训练日，休息日不计入</p>

        <div v-if="missedTrainingDays.length && !isMockMode" class="missed-banner" role="alert">
            <p class="missed-title">本周有 {{ missedTrainingDays.length }} 次训练日未打卡</p>
            <p class="missed-days">
                {{ missedTrainingDays.map((d) => d.label).join('、') }}
            </p>
            <p class="missed-policy">
                计划按自然周推进，漏练不补量；本周专注完成剩余 {{ remainingTrainingThisWeek }} 次训练即可。
            </p>
        </div>

        <article class="session-card">
            <header class="session-head">
                <div class="session-title-block">
                    <p class="session-date">{{ todayLabel }}</p>
                    <h2>{{ todayBlock.title }}</h2>
                    <p class="session-phase">{{ activePhase.title }} · 第 {{ currentWeek }} 周</p>
                </div>
                <span :class="['type-badge', todayBlock.type]">
                    {{ todayBlock.type === 'training' ? '训练' : '恢复' }}
                </span>
            </header>

            <div v-if="todayBlock.type === 'training'" class="rhythm-bar">
                <div class="rhythm-item">
                    <span class="rhythm-label">节奏</span>
                    <span class="rhythm-val">{{ trainingTips?.tempo }}</span>
                </div>
                <div class="rhythm-divider" aria-hidden="true" />
                <div class="rhythm-item">
                    <span class="rhythm-label">组间休息</span>
                    <span class="rhythm-val">{{ trainingTips?.rest }}</span>
                </div>
            </div>

            <div v-if="todayBlock.type === 'training'" class="metrics-row">
                <div class="metric">
                    <span class="metric-icon" aria-hidden="true">⏱</span>
                    <div>
                        <span class="metric-label">预计时长</span>
                        <strong>{{ todayDuration }} 分钟</strong>
                    </div>
                </div>
                <div class="metric metric-fire">
                    <span class="metric-icon" aria-hidden="true">🔥</span>
                    <div>
                        <span class="metric-label">预计消耗</span>
                        <strong>{{ todayCaloriesText }}</strong>
                    </div>
                </div>
            </div>
            <p v-if="todayBlock.type === 'training'" class="calorie-disclaimer">{{ calorieDisclaimer }}</p>

            <div v-if="todayBlock.type === 'training'" class="workout-flow">
                <section class="flow-block warmup-block">
                    <div class="flow-label">
                        <span class="flow-dot" />
                        <span>热身</span>
                    </div>
                    <p class="flow-content">{{ warmupPlan }}</p>
                </section>

                <section
                    v-for="(item, idx) in todayBlock.exercises"
                    :key="item.name"
                    class="flow-block exercise-block"
                    :class="`exercise-${idx}`"
                >
                    <div class="flow-label">
                        <span class="flow-dot exercise" />
                        <span>主项 {{ idx + 1 }}</span>
                    </div>
                    <div class="exercise-card">
                        <div class="exercise-row">
                            <div class="exercise-avatar">{{ item.icon }}</div>
                            <div class="exercise-main">
                                <h3>{{ item.name }}</h3>
                                <p class="sets-line">{{ item.setsSummary }}</p>
                            </div>
                            <span class="kcal-pill">~{{ item.calories }}</span>
                        </div>
                        <p class="coach-tip">{{ item.tip }}</p>
                        <div class="variant-pills">
                            <span class="pill easier">降阶 {{ item.easier }}</span>
                            <span class="pill harder">升阶 {{ item.harder }}</span>
                        </div>
                    </div>
                </section>

                <section v-if="todayBlock.coreExtras?.length" class="flow-block core-block">
                    <div class="flow-label">
                        <span class="flow-dot core" />
                        <span>核心加强</span>
                    </div>
                    <div
                        v-for="item in todayBlock.coreExtras"
                        :key="item.name"
                        class="exercise-card core-card"
                    >
                        <div class="exercise-row">
                            <div class="exercise-avatar core">{{ item.icon }}</div>
                            <div class="exercise-main">
                                <h3>{{ item.name }}</h3>
                                <p class="sets-line">{{ item.setsSummary }}</p>
                            </div>
                            <span class="kcal-pill">~{{ item.calories }}</span>
                        </div>
                        <p class="coach-tip">{{ item.tip }}</p>
                    </div>
                </section>

                <section class="flow-block cooldown-block">
                    <div class="flow-label">
                        <span class="flow-dot cooldown" />
                        <span>练后拉伸</span>
                    </div>
                    <p class="flow-content muted">{{ todayBlock.cooldown }}</p>
                    <StretchCollapseItem
                        v-for="item in todayBlock.stretchItems"
                        :key="item.id"
                        :item="item"
                        :expanded="isStretchExpanded(item.id)"
                        @toggle="toggleStretch(item.id)"
                    />
                </section>
            </div>

            <div v-else class="rest-flow">
                <div class="metrics-row single">
                    <div class="metric metric-fire">
                        <span class="metric-icon" aria-hidden="true">🔥</span>
                        <div>
                            <span class="metric-label">活动消耗</span>
                            <strong>{{ todayCaloriesText }}</strong>
                        </div>
                    </div>
                </div>

                <div class="rest-hero">
                    <span class="rest-emoji" aria-hidden="true">🌿</span>
                    <h3>今日休息</h3>
                    <p>无需力量训练，按下方建议做恢复即可。</p>
                </div>

                <article v-if="todayBlock.restPlan?.walk" class="rest-item">
                    <span class="rest-item-icon">🚶</span>
                    <div>
                        <h4>建议快走</h4>
                        <p>{{ todayBlock.restPlan.walk }}</p>
                        <p class="rest-hint">{{ todayBlock.restPlan.walkTip }}</p>
                    </div>
                </article>

                <article class="rest-item stretch-group">
                    <div class="stretch-group-head">
                        <span class="rest-item-icon">🧘</span>
                        <div>
                            <h4>拉伸放松</h4>
                            <p>{{ todayBlock.restPlan?.stretch }}</p>
                        </div>
                    </div>
                    <StretchCollapseItem
                        v-for="item in todayBlock.stretchItems"
                        :key="item.id"
                        :item="item"
                        :expanded="isStretchExpanded(item.id)"
                        nested
                        title-tag="h5"
                        @toggle="toggleStretch(item.id)"
                    />
                </article>
            </div>

        </article>
    </section>
</template>

<script setup>
import { ref } from 'vue'
import StretchCollapseItem from './StretchCollapseItem.vue'

defineProps({
    todayLabel: String,
    todayBlock: Object,
    activePhase: Object,
    currentWeek: Number,
    todayDuration: Number,
    todayCaloriesText: String,
    calorieDisclaimer: String,
    warmupPlan: String,
    trainingTips: Object,
    isMockMode: Boolean,
    trainingRecordsCount: Number,
    trainingStreak: Number,
    weekCompletion: Object,
    missedTrainingDays: { type: Array, default: () => [] },
    remainingTrainingThisWeek: { type: Number, default: 0 }
})

const expandedStretch = ref(new Set())

function isStretchExpanded (id) {
    return expandedStretch.value.has(id)
}

function toggleStretch (id) {
    const next = new Set(expandedStretch.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expandedStretch.value = next
}
</script>

<style scoped lang="scss">
.today-tab {
    display: grid;
    gap: 0.75rem;
    position: relative;
}

.streak-hint {
    margin: -0.35rem 0 0;
    font-size: 0.65rem;
    color: var(--lujx-text-dim);
    text-align: center;
    line-height: 1.4;
}

.missed-banner {
    padding: 0.7rem 0.8rem;
    border-radius: var(--lujx-radius-md);
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.28);
}

.missed-title {
    font-size: 0.8rem;
    font-weight: 800;
    color: #fca5a5;
}

.missed-days {
    margin-top: 0.25rem;
    font-size: 0.76rem;
    color: var(--lujx-text-secondary);
}

.missed-policy {
    margin-top: 0.35rem;
    font-size: 0.7rem;
    color: var(--lujx-text-muted);
    line-height: 1.45;
}

.stats-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.45rem;
}

.stat-item {
    padding: 0.65rem 0.4rem;
    text-align: center;
    border-radius: var(--lujx-radius-md);
    background: var(--lujx-surface);
    border: 1px solid var(--lujx-border);

    strong {
        display: block;
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--lujx-text);
        letter-spacing: -0.02em;
    }

    p {
        margin-top: 0.15rem;
        font-size: 0.65rem;
        color: var(--lujx-text-muted);
        font-weight: 500;
    }

    &.accent strong {
        color: var(--lujx-accent);
    }
}

.session-card {
    border-radius: var(--lujx-radius-xl);
    background: var(--lujx-surface);
    border: 1px solid var(--lujx-border);
    box-shadow: var(--lujx-shadow);
    overflow: hidden;
}

.session-head {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1rem 0.85rem;
    background: linear-gradient(180deg, rgba(34, 229, 132, 0.08) 0%, transparent 100%);
    border-bottom: 1px solid var(--lujx-border);
}

.session-date {
    font-size: 0.72rem;
    color: var(--lujx-text-muted);
    font-weight: 500;
}

.session-head h2 {
    margin-top: 0.2rem;
    font-size: 1.15rem;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: -0.02em;
}

.session-phase {
    margin-top: 0.35rem;
    font-size: 0.76rem;
    color: var(--lujx-blue);
    font-weight: 600;
}

.type-badge {
    flex-shrink: 0;
    align-self: flex-start;
    padding: 0.28rem 0.6rem;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.04em;

    &.training {
        color: var(--lujx-accent);
        background: var(--lujx-accent-soft);
        border: 1px solid rgba(34, 229, 132, 0.35);
    }

    &.rest {
        color: var(--lujx-rest);
        background: var(--lujx-blue-soft);
        border: 1px solid rgba(103, 232, 249, 0.35);
    }
}

.rhythm-bar {
    display: flex;
    align-items: stretch;
    margin: 0.75rem 1rem 0;
    padding: 0.6rem 0.75rem;
    border-radius: var(--lujx-radius-md);
    background: rgba(167, 139, 250, 0.1);
    border: 1px solid rgba(167, 139, 250, 0.25);
}

.rhythm-item {
    flex: 1;
    min-width: 0;
}

.rhythm-label {
    display: block;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--lujx-purple);
}

.rhythm-val {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--lujx-text-secondary);
    line-height: 1.35;
}

.rhythm-divider {
    width: 1px;
    margin: 0 0.65rem;
    background: rgba(255, 255, 255, 0.1);
}

.metrics-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    padding: 0.85rem 1rem 0;

    &.single {
        grid-template-columns: 1fr;
    }
}

.metric {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.7rem 0.75rem;
    border-radius: var(--lujx-radius-md);
    background: var(--lujx-surface-2);
    border: 1px solid var(--lujx-border);

    &.metric-fire {
        border-color: rgba(251, 146, 60, 0.25);
        background: var(--lujx-orange-soft);
    }
}

.metric-icon {
    font-size: 1.1rem;
    line-height: 1;
    opacity: 0.9;
}

.metric-label {
    display: block;
    font-size: 0.65rem;
    color: var(--lujx-text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.metric strong {
    display: block;
    margin-top: 0.1rem;
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--lujx-text);
}

.calorie-disclaimer {
    padding: 0.35rem 1rem 0;
    font-size: 0.68rem;
    color: var(--lujx-text-dim);
    line-height: 1.4;
}

.workout-flow,
.rest-flow {
    padding: 0.85rem 1rem 1rem;
    display: grid;
    gap: 0.85rem;
}

.flow-block {
    position: relative;
    padding-left: 0.15rem;
}

.flow-label {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.45rem;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--lujx-text-muted);
}

.flow-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
    background: var(--lujx-text-dim);
    box-shadow: 0 0 0 3px var(--lujx-surface-glass);

    &.exercise {
        background: var(--lujx-blue);
        box-shadow: 0 0 0 3px var(--lujx-blue-soft);
    }

    &.core {
        background: var(--lujx-accent);
        box-shadow: 0 0 0 3px var(--lujx-accent-soft);
    }

    &.cooldown {
        background: var(--lujx-purple);
        box-shadow: 0 0 0 3px var(--lujx-purple-soft);
    }
}

.flow-content {
    font-size: 0.84rem;
    color: var(--lujx-text-secondary);
    line-height: 1.55;
    padding: 0.65rem 0.75rem;
    border-radius: var(--lujx-radius-md);
    background: var(--lujx-surface-2);
    border: 1px dashed var(--lujx-border-strong);

    &.muted {
        border-style: solid;
        margin-bottom: 0.45rem;
    }
}

.exercise-card {
    padding: 0.75rem;
    border-radius: var(--lujx-radius-md);
    background: var(--lujx-surface-2);
    border: 1px solid var(--lujx-border);
    border-left: 3px solid var(--lujx-blue);

    &.core-card {
        margin-top: 0.45rem;
        border-left-color: var(--lujx-accent);

        &:first-of-type {
            margin-top: 0;
        }
    }
}

.exercise-block.exercise-1 .exercise-card {
    border-left-color: var(--lujx-purple);
}

.exercise-row {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
}

.exercise-avatar {
    width: 2.35rem;
    height: 2.35rem;
    border-radius: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;
    background: var(--lujx-blue-soft);
    border: 1px solid rgba(56, 189, 248, 0.2);

    &.core {
        background: var(--lujx-accent-soft);
        border-color: rgba(34, 229, 132, 0.25);
    }
}

.exercise-main {
    flex: 1;
    min-width: 0;

    h3 {
        font-size: 0.95rem;
        font-weight: 800;
    }
}

.sets-line {
    margin-top: 0.18rem;
    font-size: 0.8rem;
    color: var(--lujx-text-muted);
}

.kcal-pill {
    flex-shrink: 0;
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--lujx-orange);
    padding: 0.22rem 0.5rem;
    border-radius: 999px;
    background: var(--lujx-orange-soft);
    border: 1px solid rgba(251, 146, 60, 0.25);
}

.coach-tip {
    margin-top: 0.55rem;
    padding: 0.5rem 0.6rem;
    border-radius: 0.55rem;
    font-size: 0.78rem;
    color: var(--lujx-text-secondary);
    line-height: 1.45;
    background: rgba(0, 0, 0, 0.2);
}

.variant-pills {
    margin-top: 0.45rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
}

.pill {
    font-size: 0.66rem;
    padding: 0.2rem 0.45rem;
    border-radius: 999px;
    line-height: 1.35;

    &.easier {
        color: var(--lujx-accent);
        background: var(--lujx-accent-soft);
    }

    &.harder {
        color: var(--lujx-orange);
        background: var(--lujx-orange-soft);
    }
}

.rest-hero {
    text-align: center;
    padding: 1rem 0.75rem;
    border-radius: var(--lujx-radius-md);
    background: var(--lujx-blue-soft);
    border: 1px solid rgba(103, 232, 249, 0.2);

    .rest-emoji {
        font-size: 2rem;
        display: block;
    }

    h3 {
        margin-top: 0.35rem;
        font-size: 1rem;
        font-weight: 800;
        color: var(--lujx-rest);
    }

    p {
        margin-top: 0.3rem;
        font-size: 0.82rem;
        color: var(--lujx-text-secondary);
        line-height: 1.5;
    }
}

.rest-item {
    display: flex;
    gap: 0.65rem;
    padding: 0.75rem;
    border-radius: var(--lujx-radius-md);
    background: var(--lujx-surface-2);
    border: 1px solid var(--lujx-border);

    h4 {
        font-size: 0.88rem;
        font-weight: 800;
    }

    p {
        margin-top: 0.2rem;
        font-size: 0.8rem;
        color: var(--lujx-text-secondary);
        line-height: 1.45;
    }
}

.rest-item-icon {
    font-size: 1.4rem;
    flex-shrink: 0;
}

.rest-hint {
    margin-top: 0.25rem !important;
    font-size: 0.72rem !important;
    color: var(--lujx-text-dim) !important;
}

.stretch-group {
    flex-direction: column;
}

.stretch-group-head {
    display: flex;
    gap: 0.65rem;
}

</style>
