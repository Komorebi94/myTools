<template>
	<Teleport to="body">
		<Transition name="modal">
			<div v-if="visible" class="modal-root" @click.self="$emit('cancel')">
				<div class="modal-card" role="dialog" aria-modal="true">
					<h3 class="modal-title">{{ title }}</h3>
					<p class="modal-desc">{{ description }}</p>
					<label v-if="showExtra" class="modal-extra">
						<input v-model="extraChecked" type="checkbox" />
						<span>今日超额完成训练（额外 +{{ REWARDS.EXTRA_COMPLETE }} 元）</span>
					</label>
					<div class="modal-actions">
						<button type="button" class="btn ghost" @click="$emit('cancel')">
							取消
						</button>
						<button type="button" class="btn primary" @click="onConfirm">
							{{ confirmText }}
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
	import { ref, watch } from 'vue'
	import { REWARDS } from '@/constants/fitness'

	const props = defineProps({
		visible: Boolean,
		title: { type: String, default: '' },
		description: { type: String, default: '' },
		confirmText: { type: String, default: '确认' },
		showExtra: Boolean
	})

	const emit = defineEmits(['confirm', 'cancel'])

	const extraChecked = ref(false)

	watch(
		() => props.visible,
		(v) => {
			if (v) extraChecked.value = false
		}
	)

	const onConfirm = () => {
		emit('confirm', { isExtra: extraChecked.value })
	}
</script>

<style scoped lang="scss">
	.modal-root {
		position: fixed;
		inset: 0;
		z-index: 300;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: rgba(15, 23, 42, 0.45);
		backdrop-filter: blur(4px);
	}

	.modal-card {
		width: 100%;
		max-width: 20rem;
		padding: 1.5rem;
		border-radius: 1.25rem;
		background: #fff;
		box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
	}

	.modal-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 0.5rem;
	}

	.modal-desc {
		font-size: 0.875rem;
		line-height: 1.6;
		color: #64748b;
		margin-bottom: 1rem;
	}

	.modal-extra {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #334155;
		margin-bottom: 1.25rem;
		cursor: pointer;

		input {
			margin-top: 0.15rem;
			accent-color: #10b981;
		}
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn {
		flex: 1;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			transform 0.15s ease,
			opacity 0.15s ease;

		&:active {
			transform: scale(0.98);
		}

		&.ghost {
			background: #f1f5f9;
			color: #475569;
		}

		&.primary {
			background: linear-gradient(135deg, #fb923c, #ea580c);
			color: #fff;
		}
	}

	.modal-enter-active,
	.modal-leave-active {
		transition: opacity 0.2s ease;

		.modal-card {
			transition: transform 0.2s ease;
		}
	}

	.modal-enter-from,
	.modal-leave-to {
		opacity: 0;

		.modal-card {
			transform: scale(0.95) translateY(8px);
		}
	}
</style>
