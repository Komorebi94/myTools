<template>
	<Teleport to="body">
		<Transition name="modal">
			<div v-if="visible && tier && copy" class="modal-root" @click.self="$emit('later')">
				<div class="modal-card surprise" role="dialog" aria-modal="true">
					<div class="confetti" aria-hidden="true">🎊</div>
					<h3>{{ copy.title }}</h3>
					<p class="subtitle">{{ copy.subtitle }}</p>
					<p class="prize">{{ copy.prizeHint }}</p>

					<div class="streak-badge">
						<span class="streak-num">{{ tier.days }}</span>
						<span class="streak-label">次连续完成达成</span>
					</div>
					<p class="current-streak">当前已连续完成 {{ continueDays }} 次</p>

					<div class="steps">
						<p class="steps-title">凭截图兑现</p>
						<ol>
							<li v-for="(step, i) in copy.redeemSteps" :key="i">
								{{ step }}
							</li>
						</ol>
						<p class="screenshot-tip">{{ copy.screenshotTip }}</p>
					</div>

					<div class="modal-actions">
						<button type="button" class="btn ghost" @click="$emit('later')">
							稍后再说
						</button>
						<button type="button" class="btn primary" @click="$emit('redeem')">
							我已截图，申请兑现
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
	import { computed } from 'vue'
	import { getSurpriseRewardCopy } from '@/constants/fitness'

	const props = defineProps({
		visible: Boolean,
		tier: { type: Object, default: null },
		continueDays: { type: Number, default: 0 }
	})

	defineEmits(['redeem', 'later'])

	const copy = computed(() => (props.tier ? getSurpriseRewardCopy(props.tier) : null))
</script>

<style scoped lang="scss">
	.modal-root {
		position: fixed;
		inset: 0;
		z-index: 350;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: rgba(15, 23, 42, 0.5);
		backdrop-filter: blur(6px);
	}

	.modal-card.surprise {
		position: relative;
		width: 100%;
		max-width: 21rem;
		padding: 1.5rem 1.25rem 1.25rem;
		border-radius: 1.375rem;
		background: linear-gradient(165deg, #fff 0%, #fff7ed 100%);
		box-shadow:
			0 24px 48px rgba(234, 88, 12, 0.22),
			0 0 0 1px rgba(251, 146, 60, 0.2);
		text-align: center;
		overflow: hidden;

		h3 {
			font-size: 1.25rem;
			font-weight: 800;
			color: #9a3412;
			margin-bottom: 0.35rem;
		}
	}

	.confetti {
		position: absolute;
		top: 0.75rem;
		right: 1rem;
		font-size: 1.75rem;
		opacity: 0.9;
		pointer-events: none;
	}

	.subtitle {
		font-size: 0.875rem;
		font-weight: 600;
		color: #c2410c;
		margin-bottom: 0.25rem;
	}

	.prize {
		font-size: 0.8125rem;
		color: #64748b;
		margin-bottom: 1rem;
	}

	.streak-badge {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem 1.5rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, #fb923c, #ea580c);
		box-shadow: 0 8px 20px rgba(234, 88, 12, 0.35);
	}

	.streak-num {
		font-size: 2.25rem;
		font-weight: 800;
		color: #fff;
		line-height: 1.1;
	}

	.streak-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #fff7ed;
		margin-top: 0.15rem;
	}

	.current-streak {
		margin: 0.5rem 0 1rem;
		font-size: 0.75rem;
		color: #94a3b8;
	}

	.steps {
		text-align: left;
		padding: 0.875rem;
		border-radius: 0.875rem;
		background: #fff;
		border: 1px solid #fed7aa;
		margin-bottom: 1rem;
	}

	.steps-title {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 0.5rem;
	}

	.steps ol {
		margin: 0;
		padding-left: 1.125rem;
		font-size: 0.75rem;
		line-height: 1.65;
		color: #475569;

		li + li {
			margin-top: 0.35rem;
		}
	}

	.screenshot-tip {
		margin-top: 0.625rem;
		font-size: 0.6875rem;
		color: #94a3b8;
		line-height: 1.5;
	}

	.modal-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.btn {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;

		&.ghost {
			background: #f1f5f9;
			color: #475569;
		}

		&.primary {
			background: linear-gradient(135deg, #f59e0b, #ea580c);
			color: #fff;
			box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
		}
	}

	.modal-enter-active,
	.modal-leave-active {
		transition: opacity 0.25s ease;

		.modal-card {
			transition: transform 0.25s ease;
		}
	}

	.modal-enter-from,
	.modal-leave-to {
		opacity: 0;

		.modal-card {
			transform: scale(0.92) translateY(12px);
		}
	}
</style>
