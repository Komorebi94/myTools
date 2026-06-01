<template>
    <div class="fixed-checkin-bar">
        <button type="button" class="btn-primary" :disabled="checked" @click="$emit('check-in')">
            <span v-if="checked" class="btn-check">✓</span>
            {{ checked ? '今日已完成' : '完成训练打卡' }}
        </button>
        <button v-if="canUndo" type="button" class="btn-ghost" @click="$emit('undo')">撤销</button>
    </div>
</template>

<script setup>
defineProps({
    checked: Boolean,
    canUndo: Boolean
})

defineEmits(['check-in', 'undo'])
</script>

<style scoped lang="scss">
.fixed-checkin-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: var(--lujx-footer-stack);
    z-index: 29;
    min-height: var(--lujx-checkin-bar-h);
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 1rem;
    background: rgba(7, 11, 16, 0.96);
    backdrop-filter: blur(16px);
    border-top: 1px solid var(--lujx-border);
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
}

.btn-primary {
    flex: 1;
    border: none;
    border-radius: var(--lujx-radius-md);
    padding: 0.78rem 1rem;
    font-size: 0.9rem;
    font-weight: 800;
    color: #042f1a;
    background: linear-gradient(135deg, var(--lujx-accent) 0%, #10b981 100%);
    cursor: pointer;
    box-shadow: 0 4px 20px var(--lujx-accent-glow);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
        color: var(--lujx-text-muted);
        background: var(--lujx-surface-2);
    }
}

.btn-check {
    display: inline-flex;
    width: 1.1rem;
    height: 1.1rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.15);
    font-size: 0.7rem;
}

.btn-ghost {
    flex-shrink: 0;
    border: 1px solid var(--lujx-border-strong);
    background: transparent;
    color: var(--lujx-text-muted);
    border-radius: var(--lujx-radius-md);
    padding: 0 0.9rem;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
}
</style>
