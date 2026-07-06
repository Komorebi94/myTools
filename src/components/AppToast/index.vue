<template>
	<Transition name="toast">
		<div v-if="message" class="app-toast" :class="variant" :style="toastStyle" role="status">
			{{ message }}
		</div>
	</Transition>
</template>

<script setup>
	import { computed } from 'vue'

	const props = defineProps({
		message: { type: String, default: '' },
		variant: {
			type: String,
			default: 'lujx'
		},
		/** footer | checkin | custom */
		anchor: {
			type: String,
			default: 'footer'
		},
		bottom: { type: String, default: '' }
	})

	const toastStyle = computed(() => {
		if (props.bottom) return { bottom: props.bottom }
		if (props.anchor === 'checkin') {
			return { bottom: 'calc(var(--lujx-checkin-stack, 8rem) + 0.5rem)' }
		}
		if (props.anchor === 'footer') {
			return {
				bottom: 'calc(var(--app-footer-stack, var(--lujx-footer-stack, 5rem)) + 0.5rem)'
			}
		}
		return {}
	})
</script>

<style scoped>
	.app-toast {
		position: fixed;
		left: 50%;
		z-index: 200;
		max-width: calc(100% - 2rem);
		padding: 0.7rem 1.15rem;
		border-radius: 999px;
		font-size: 0.84rem;
		font-weight: 600;
		line-height: 1.4;
		text-align: center;
		transform: translateX(-50%);
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
	}

	.app-toast.fitness {
		background: rgba(131, 24, 67, 0.92);
		color: #fff1f2;
		border: 1px solid rgba(251, 207, 232, 0.35);
		box-shadow: 0 8px 28px rgba(244, 114, 182, 0.35);
	}

	.app-toast.lujx {
		background: rgba(20, 28, 38, 0.95);
		color: #f1f5f9;
		border: 1px solid rgba(34, 229, 132, 0.35);
	}

	.toast-enter-active,
	.toast-leave-active {
		transition:
			opacity 0.25s ease,
			transform 0.25s ease;
	}

	.toast-enter-from,
	.toast-leave-to {
		opacity: 0;
		transform: translateX(-50%) translateY(12px);
	}
</style>
