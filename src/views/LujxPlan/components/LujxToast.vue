<template>
    <Transition name="toast">
        <div v-if="message" class="lujx-toast" role="status">
            {{ message }}
        </div>
    </Transition>
</template>

<script setup>
defineProps({
    message: { type: String, default: '' }
})
</script>

<style scoped>
.lujx-toast {
    position: fixed;
    left: 50%;
    bottom: calc(var(--lujx-checkin-stack) + 0.5rem);
    z-index: 200;
    max-width: calc(100% - 2rem);
    padding: 0.7rem 1.15rem;
    border-radius: 999px;
    background: rgba(20, 28, 38, 0.95);
    color: #f1f5f9;
    font-size: 0.84rem;
    font-weight: 600;
    transform: translateX(-50%);
    border: 1px solid rgba(34, 229, 132, 0.35);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
}

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(12px);
}
</style>
