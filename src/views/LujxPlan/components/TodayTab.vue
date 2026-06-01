<template>
    <article class="today-card">
        <div class="today-hero">
            <div class="today-head">
                <div>
                    <p class="today-date">{{ todayLabel }}</p>
                    <h2>{{ todayBlock.title }}</h2>
                </div>
                <span :class="['today-badge', todayBlock.type]">
                    {{ todayBlock.type === 'training' ? '训练日' : '休息日' }}
                </span>
            </div>
            <p class="today-phase">{{ activePhase.title }} · 第 {{ currentWeek }} 周</p>
        </div>

        <div v-if="todayBlock.type === 'training'" class="metric-row">
            <div class="metric-chip duration">
                <span class="metric-label">预计时长</span>
                <strong>{{ todayDuration }} 分钟</strong>
            </div>
            <div class="metric-chip calories">
                <span class="metric-label">预计消耗</span>
                <strong>{{ todayCaloriesText }}</strong>
            </div>
        </div>
        <p v-if="todayBlock.type === 'training'" class="calorie-note">{{ calorieDisclaimer }}</p>

        <div v-if="todayBlock.type === 'training'" class="detail-grid">
            <article class="detail-card warmup">
                <span class="card-tag">热身</span>
                <p>{{ warmupPlan }}</p>
            </article>

            <article
                v-for="(item, idx) in todayBlock.exercises"
                :key="item.name"
                class="detail-card exercise-card"
                :class="`exercise-${idx}`"
            >
                <div class="exercise-top">
                    <div class="exercise-icon">{{ item.icon }}</div>
                    <div class="exercise-info">
                        <h3>{{ item.name }}</h3>
                        <p class="sets-summary">{{ item.setsSummary }} · 组间 {{ item.rest }}</p>
                    </div>
                    <span class="exercise-kcal">~{{ item.calories }} kcal</span>
                </div>
                <p class="tip">{{ item.tip }}</p>
                <div class="variant-row">
                    <span class="variant-tag easier">降阶 {{ item.easier }}</span>
                    <span class="variant-tag harder">升阶 {{ item.harder }}</span>
                </div>
            </article>

            <article v-if="todayBlock.coreExtras?.length" class="detail-card core-extra-section">
                <span class="card-tag">核心加强 · 瘦腰辅助</span>
                <article
                    v-for="item in todayBlock.coreExtras"
                    :key="item.name"
                    class="extra-item"
                >
                    <div class="exercise-top">
                        <div class="exercise-icon extra">{{ item.icon }}</div>
                        <div class="exercise-info">
                            <h3>{{ item.name }}</h3>
                            <p class="sets-summary">{{ item.setsSummary }} · 组间 {{ item.rest }}</p>
                        </div>
                        <span class="exercise-kcal">~{{ item.calories }} kcal</span>
                    </div>
                    <p class="tip">{{ item.tip }}</p>
                </article>
            </article>

            <article class="detail-card cooldown">
                <span class="card-tag">练后拉伸</span>
                <p class="cooldown-summary">{{ todayBlock.cooldown }}</p>
                <article v-for="item in todayBlock.stretchItems" :key="item.id" class="stretch-item">
                    <div class="stretch-head">
                        <span class="stretch-icon">{{ item.icon }}</span>
                        <div>
                            <h4>{{ item.name }}</h4>
                            <p class="stretch-meta">{{ item.duration }} · {{ item.target }}</p>
                        </div>
                    </div>
                    <ol class="stretch-steps">
                        <li v-for="(step, i) in item.steps" :key="i">{{ step }}</li>
                    </ol>
                </article>
            </article>
        </div>

        <div v-else class="rest-section">
            <div class="metric-row rest-metrics">
                <div class="metric-chip calories">
                    <span class="metric-label">活动消耗</span>
                    <strong>{{ todayCaloriesText }}</strong>
                </div>
            </div>
            <div class="rest-card">
                <div class="rest-icon">🌿</div>
                <h3>今日休息</h3>
                <p class="rest-sub">今天无需力量训练，按下面建议做恢复即可。</p>
            </div>
            <div class="rest-actions">
                <article v-if="todayBlock.restPlan?.walk" class="rest-action walk">
                    <span class="action-icon">🚶</span>
                    <div>
                        <h4>建议快走</h4>
                        <p>{{ todayBlock.restPlan.walk }}</p>
                        <p class="action-tip">{{ todayBlock.restPlan.walkTip }}</p>
                    </div>
                </article>
                <article class="rest-stretch-card">
                    <div class="stretch-card-head">
                        <span class="action-icon">🧘</span>
                        <div>
                            <h4>拉伸放松</h4>
                            <p>{{ todayBlock.restPlan?.stretch }}</p>
                        </div>
                    </div>
                    <article v-for="item in todayBlock.stretchItems" :key="item.id" class="stretch-item">
                        <div class="stretch-head">
                            <span class="stretch-icon">{{ item.icon }}</span>
                            <div>
                                <h5>{{ item.name }}</h5>
                                <p class="stretch-meta">{{ item.duration }} · {{ item.target }}</p>
                            </div>
                        </div>
                        <ol class="stretch-steps">
                            <li v-for="(step, i) in item.steps" :key="i">{{ step }}</li>
                        </ol>
                    </article>
                </article>
            </div>
        </div>

        <div v-if="todayBlock.type === 'training' && !isMockMode" class="action-row">
            <button type="button" class="checkin-btn" :disabled="todayChecked" @click="$emit('check-in')">
                {{ todayChecked ? '✓ 今日已完成' : '完成训练打卡' }}
            </button>
            <button v-if="canUndoToday" type="button" class="undo-btn" @click="$emit('undo')">撤销</button>
        </div>

        <div class="stats-grid">
            <article>
                <p>累计打卡</p>
                <strong>{{ trainingRecordsCount }}</strong>
            </article>
            <article>
                <p>连续课次</p>
                <strong>{{ trainingStreak }}</strong>
            </article>
            <article>
                <p>本周完成</p>
                <strong>{{ weekCompletion.done }}/{{ weekCompletion.planned }}</strong>
            </article>
        </div>
    </article>
</template>

<script setup>
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
    todayChecked: Boolean,
    canUndoToday: Boolean,
    trainingRecordsCount: Number,
    trainingStreak: Number,
    weekCompletion: Object
})

defineEmits(['check-in', 'undo'])
</script>

<style scoped>
.today-card {
    border: 1px solid #e2e8f0;
    background: #fff;
    border-radius: 1.1rem;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
    overflow: hidden;
}

.today-hero {
    padding: 1rem 1rem 0.75rem;
    background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
    border-bottom: 1px solid #e2e8f0;
}

.today-head {
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
}

.today-date {
    font-size: 0.74rem;
    color: #64748b;
    letter-spacing: 0.02em;
}

.today-head h2 {
    margin-top: 0.25rem;
    font-size: 1.2rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
}

.today-badge {
    align-self: flex-start;
    border-radius: 999px;
    padding: 0.25rem 0.65rem;
    font-size: 0.72rem;
    font-weight: 700;
}

.today-badge.training {
    background: #fff;
    color: #15803d;
    box-shadow: 0 1px 4px rgba(22, 163, 74, 0.15);
}

.today-badge.rest {
    background: #fff;
    color: #0369a1;
    box-shadow: 0 1px 4px rgba(3, 105, 161, 0.12);
}

.today-phase {
    margin-top: 0.45rem;
    color: #6366f1;
    font-size: 0.8rem;
    font-weight: 600;
}

.metric-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.55rem;
    padding: 0.85rem 1rem 0;
}

.metric-chip {
    border-radius: 0.75rem;
    padding: 0.65rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.metric-chip.duration {
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border: 1px solid #bae6fd;
}

.metric-chip.calories {
    background: linear-gradient(135deg, #fff7ed, #ffedd5);
    border: 1px solid #fed7aa;
}

.metric-label {
    font-size: 0.68rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.metric-chip strong {
    font-size: 1rem;
    color: #0f172a;
}

.calorie-note {
    padding: 0.35rem 1rem 0;
    font-size: 0.7rem;
    color: #94a3b8;
}

.detail-grid {
    padding: 0.75rem 1rem 1rem;
    display: grid;
    gap: 0.6rem;
}

.detail-card {
    border-radius: 0.85rem;
    padding: 0.75rem;
}

.detail-card.warmup {
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
}

.detail-card.rhythm {
    background: #faf5ff;
    border: 1px solid #e9d5ff;
}

.card-tag {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 700;
    color: #6366f1;
    letter-spacing: 0.06em;
    margin-bottom: 0.35rem;
}

.detail-card p {
    font-size: 0.84rem;
    color: #334155;
    line-height: 1.5;
}

.exercise-card {
    border: 1px solid #e2e8f0;
    background: #fff;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    border-left: 3px solid #38bdf8;
}

.exercise-card.exercise-1 {
    border-left-color: #a78bfa;
}

.exercise-top {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
}

.exercise-icon {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.65rem;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.exercise-info {
    flex: 1;
    min-width: 0;
}

.exercise-info h3 {
    font-size: 0.95rem;
    font-weight: 800;
    color: #0f172a;
}

.sets-summary {
    margin-top: 0.2rem;
    font-size: 0.82rem;
    color: #475569;
    font-weight: 500;
}

.exercise-kcal {
    flex-shrink: 0;
    font-size: 0.72rem;
    font-weight: 700;
    color: #c2410c;
    background: #fff7ed;
    padding: 0.2rem 0.45rem;
    border-radius: 999px;
}

.tip {
    margin-top: 0.55rem;
    padding: 0.5rem 0.6rem;
    background: #f8fafc;
    border-radius: 0.55rem;
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.45;
}

.variant-row {
    margin-top: 0.45rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
}

.variant-tag {
    font-size: 0.68rem;
    padding: 0.2rem 0.45rem;
    border-radius: 999px;
    line-height: 1.3;
}

.variant-tag.easier {
    background: #ecfdf5;
    color: #047857;
}

.variant-tag.harder {
    background: #fef3c7;
    color: #b45309;
}

.detail-card.rhythm,
.detail-card.cooldown {
    background: #faf5ff;
    border: 1px solid #e9d5ff;
}

.core-extra-section {
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
    border: 1px solid #86efac;
}

.extra-item {
    margin-top: 0.55rem;
    padding-top: 0.55rem;
    border-top: 1px dashed #bbf7d0;
}

.extra-item:first-of-type {
    margin-top: 0.35rem;
    padding-top: 0;
    border-top: none;
}

.exercise-icon.extra {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
}

.rest-section {
    padding-bottom: 0.5rem;
}

.rest-metrics {
    padding-top: 0.85rem;
}

.rest-metrics .metric-chip {
    grid-column: 1 / -1;
}

.rest-card {
    margin: 0.75rem 1rem 0.65rem;
    padding: 1.1rem 1rem;
    border-radius: 0.85rem;
    background: linear-gradient(145deg, #ecfeff, #f0fdf4);
    border: 1px solid #99f6e4;
    text-align: center;
}

.rest-sub {
    margin-top: 0.35rem;
    color: #475569;
    font-size: 0.84rem;
    line-height: 1.55;
}

.rest-actions {
    padding: 0 1rem;
    display: grid;
    gap: 0.55rem;
}

.rest-action {
    display: flex;
    gap: 0.65rem;
    padding: 0.75rem;
    border-radius: 0.85rem;
    border: 1px solid #e2e8f0;
    background: #fff;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.rest-action.walk {
    border-left: 3px solid #38bdf8;
}

.rest-action.stretch {
    border-left: 3px solid #34d399;
}

.rest-stretch-card {
    padding: 0.75rem;
    border-radius: 0.85rem;
    border: 1px solid #e2e8f0;
    background: #fff;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    border-left: 3px solid #34d399;
}

.stretch-card-head {
    display: flex;
    gap: 0.65rem;
    align-items: flex-start;
}

.stretch-card-head h4 {
    font-size: 0.88rem;
    font-weight: 800;
    color: #0f172a;
}

.stretch-card-head p {
    margin-top: 0.2rem;
    font-size: 0.82rem;
    color: #334155;
}

.action-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.rest-action h4 {
    font-size: 0.88rem;
    font-weight: 800;
    color: #0f172a;
}

.rest-action p {
    margin-top: 0.2rem;
    font-size: 0.82rem;
    color: #334155;
    line-height: 1.45;
}

.action-tip {
    margin-top: 0.25rem !important;
    font-size: 0.74rem !important;
    color: #64748b !important;
}

.cooldown-summary {
    margin-bottom: 0.55rem;
    font-size: 0.82rem;
    color: #475569;
}

.stretch-block {
    flex: 1;
    min-width: 0;
}

.stretch-block h5,
.stretch-card-head + .stretch-item h5,
.stretch-item h5 {
    font-size: 0.84rem;
    font-weight: 700;
    color: #0f172a;
}

.stretch-item {
    margin-top: 0.55rem;
    padding: 0.6rem;
    border-radius: 0.65rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}

.stretch-head {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
}

.stretch-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
}

.stretch-head h4 {
    font-size: 0.84rem;
    font-weight: 700;
    color: #0f172a;
}

.stretch-meta {
    margin-top: 0.15rem;
    font-size: 0.72rem;
    color: #64748b;
}

.stretch-steps {
    margin: 0.45rem 0 0;
    padding-left: 1.1rem;
}

.stretch-steps li {
    font-size: 0.76rem;
    color: #475569;
    line-height: 1.5;
    margin-bottom: 0.2rem;
}

.rest-icon {
    font-size: 2rem;
}

.rest-card h3 {
    margin-top: 0.35rem;
    color: #0f766e;
    font-size: 1rem;
    font-weight: 800;
}

.rest-card p {
    margin-top: 0.35rem;
    color: #475569;
    font-size: 0.84rem;
    line-height: 1.55;
}

.action-row {
    padding: 0 1rem;
    display: flex;
    gap: 0.45rem;
}

.checkin-btn {
    flex: 1;
    border: none;
    border-radius: 0.75rem;
    padding: 0.72rem;
    font-size: 0.88rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #0284c7, #16a34a);
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25);
}

.checkin-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
}

.undo-btn {
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    border-radius: 0.75rem;
    padding: 0 0.85rem;
    font-size: 0.78rem;
    cursor: pointer;
}

.stats-grid {
    margin: 0.85rem 1rem 1rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.45rem;
}

.stats-grid article {
    border-radius: 0.7rem;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    padding: 0.55rem 0.35rem;
    text-align: center;
}

.stats-grid p {
    font-size: 0.68rem;
    color: #94a3b8;
}

.stats-grid strong {
    display: block;
    margin-top: 0.15rem;
    font-size: 1.1rem;
    color: #0f172a;
}
</style>
