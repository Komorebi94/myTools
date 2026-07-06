<template>
	<Teleport to="body">
		<Transition name="modal">
			<div v-if="visible" class="modal-root" @click.self="$emit('cancel')">
				<div class="modal-card fit-sticker-card" role="dialog" aria-modal="true">
					<span class="card-deco card-deco--tr" aria-hidden="true">💭</span>
					<h3 class="modal-title">{{ title }}</h3>
					<p class="modal-desc">{{ description }}</p>
					<label v-if="showExtra" class="modal-extra">
						<input v-model="extraChecked" type="checkbox" />
						<span>今日超额完成训练（额外 +{{ REWARDS.EXTRA_COMPLETE }} 元）</span>
					</label>
					<div class="modal-actions">
						<button type="button" class="btn ghost" @click="$emit('cancel')">取消</button>
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
		background: rgba(131, 24, 67, 0.32);
		backdrop-filter: blur(8px);
	}

	.modal-card {
		width: 100%;
		max-width: 20rem;
		padding: 1.5rem;
	}

	.modal-title {
		font-size: 1.1875rem;
		color: var(--fit-text-heading, #831843);
		margin-bottom: 0.5rem;
	}

	.modal-desc {
		font-size: 0.875rem;
		line-height: 1.65;
		color: #78716c;
		margin-bottom: 1rem;
	}

	.modal-extra {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #57534e;
		margin-bottom: 1.25rem;
		cursor: pointer;
		padding: 0.625rem;
		border-radius: var(--fit-radius-sm, 0.875rem);
		background: var(--fit-cream, #fff9fb);
		border: 2px dashed var(--fit-pink-light, #fce7f3);

		input {
			margin-top: 0.15rem;
			accent-color: var(--fit-pink, #f9a8d4);
			width: 1rem;
			height: 1rem;
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
		border-radius: var(--fit-radius-md, 1.375rem);
		font-family: var(--fit-font-display, 'ZCOOL KuaiLe', sans-serif);
		font-size: 0.9375rem;
		cursor: pointer;
		transition: transform 0.2s var(--fit-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));

		&:active {
			transform: scale(0.96);
		}

		&.ghost {
			background: var(--fit-cream, #fff9fb);
			color: #78716c;
			border: 2px dashed rgba(249, 168, 212, 0.35);
		}

		&.primary {
			background: linear-gradient(180deg, #fbcfe8, var(--fit-pink, #f9a8d4), var(--fit-peach, #fdba74));
			color: #fff;
			text-shadow: 0 1px 2px rgba(190, 24, 93, 0.2);
			box-shadow: var(--fit-shadow-candy, 0 6px 0 rgba(236, 72, 153, 0.22));
		}
	}

	.modal-enter-active,
	.modal-leave-active {
		transition: opacity 0.25s ease;

		.modal-card {
			transition: transform 0.25s var(--fit-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
		}
	}

	.modal-enter-from,
	.modal-leave-to {
		opacity: 0;

		.modal-card {
			transform: scale(0.9) translateY(12px);
		}
	}
</style>
