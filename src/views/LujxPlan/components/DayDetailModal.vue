<template>
    <div v-if="plan" class="day-modal" @click.self="$emit('close')">
        <article class="day-modal-card">
            <header>
                <h3>{{ plan.dateLabel }}</h3>
                <button type="button" class="close-btn" @click="$emit('close')">×</button>
            </header>
            <p class="meta">计划第 {{ plan.programDay }} 天 · 第 {{ plan.week }} 周 · {{ plan.phase.title }}</p>

            <div v-if="plan.block.type === 'training'" class="modal-body">
                <p class="block-title">{{ plan.block.title }}</p>
                <ul>
                    <li v-for="item in plan.block.exercises" :key="item.name">
                        <span>{{ item.icon }} {{ item.name }}</span>
                        <strong>{{ item.target }}</strong>
                    </li>
                </ul>
                <template v-if="plan.block.coreExtras?.length">
                    <p class="sub-title">核心加强</p>
                    <ul>
                        <li v-for="item in plan.block.coreExtras" :key="item.name">
                            <span>{{ item.icon }} {{ item.name }}</span>
                            <strong>{{ item.target }}</strong>
                        </li>
                    </ul>
                </template>
                <p v-if="plan.block.cooldown" class="cooldown-line">{{ plan.block.cooldown }}</p>
                <ul v-if="plan.block.stretchItems?.length" class="stretch-list">
                    <li v-for="item in plan.block.stretchItems" :key="item.id">
                        <strong>{{ item.icon }} {{ item.name }}</strong>
                        <span>{{ item.duration }}</span>
                    </li>
                </ul>
                <p v-if="isChecked" class="checked-tag">✓ 已完成训练打卡</p>
            </div>
            <div v-else class="modal-body rest">
                <p class="block-title">今日休息</p>
                <p v-if="plan.block.restPlan?.walk">🚶 {{ plan.block.restPlan.walk }}</p>
                <p>🧘 {{ plan.block.restPlan?.stretch }}</p>
                <ul v-if="plan.block.stretchItems?.length" class="stretch-list">
                    <li v-for="item in plan.block.stretchItems" :key="item.id">
                        <strong>{{ item.icon }} {{ item.name }}</strong>
                        <span>{{ item.duration }}</span>
                    </li>
                </ul>
                <p class="calorie-line">{{ plan.block.restPlan?.calories }}</p>
            </div>
        </article>
    </div>
</template>

<script setup>
defineProps({
    plan: { type: Object, default: null },
    isChecked: { type: Boolean, default: false }
})

defineEmits(['close'])
</script>

<style scoped>
.day-modal {
    position: fixed;
    inset: 0;
    z-index: 120;
    background: rgba(15, 23, 42, 0.35);
    display: flex;
    align-items: flex-end;
    padding: 1rem;
    padding-bottom: calc(1rem + var(--safe-bottom));
}

.day-modal-card {
    width: 100%;
    background: #fff;
    border-radius: 1rem;
    padding: 0.9rem;
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.18);
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header h3 {
    font-size: 1rem;
    color: #0f172a;
}

.close-btn {
    border: none;
    background: #f1f5f9;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 999px;
    font-size: 1.1rem;
    cursor: pointer;
}

.meta {
    margin-top: 0.35rem;
    font-size: 0.78rem;
    color: #64748b;
}

.block-title {
    margin-top: 0.55rem;
    font-size: 0.9rem;
    font-weight: 700;
    color: #0f172a;
}

.modal-body ul {
    list-style: none;
    margin-top: 0.45rem;
    padding: 0;
    display: grid;
    gap: 0.35rem;
}

.modal-body li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0.6rem;
    border-radius: 0.55rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    font-size: 0.82rem;
}

.modal-body.rest p:last-child {
    margin-top: 0.35rem;
    color: #475569;
    font-size: 0.84rem;
}

.sub-title {
    margin-top: 0.55rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: #059669;
}

.cooldown-line,
.calorie-line {
    margin-top: 0.45rem;
    font-size: 0.78rem;
    color: #64748b;
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
    font-size: 0.78rem;
    color: #475569;
}

.checked-tag {
    margin-top: 0.55rem;
    color: #166534;
    font-size: 0.82rem;
    font-weight: 700;
}
</style>
