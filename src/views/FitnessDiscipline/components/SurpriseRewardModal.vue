<template>
	<Teleport to="body">
		<Transition name="modal">
			<div v-if="visible && tier && copy" class="modal-root" @click.self="$emit('later')">
				<div class="modal-card surprise fit-sticker-card" role="dialog" aria-modal="true">
					<span class="card-deco card-deco--tl" aria-hidden="true">🎊</span>
					<span class="card-deco card-deco--tr" aria-hidden="true">🎉</span>
					<PiggyBankMascot :size="64" :happy="true" :floating="false" class="surprise-mascot" />
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
	import PiggyBankMascot from './PiggyBankMascot.vue'

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
		background: rgba(131, 24, 67, 0.35);
		backdrop-filter: blur(8px);
	}

	.modal-card.surprise {
		position: relative;
		width: 100%;
		max-width: 21rem;
		padding: 1.5rem 1.25rem 1.25rem;
		text-align: center;
		overflow: visible;
		background: linear-gradient(165deg, #fff 0%, var(--fit-peach-light, #ffedd5) 100%);

		h3 {
			font-size: 1.3125rem;
			color: #9a3412;
			margin-bottom: 0.35rem;
		}
	}

	.surprise-mascot {
		margin: 0 auto 0.5rem;
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
		border-radius: var(--fit-radius-md, 1.375rem);
		background: linear-gradient(180deg, #fdba74, #fb923c, #f472b6);
		box-shadow: var(--fit-shadow-candy, 0 6px 0 rgba(236, 72, 153, 0.22));
		border: 2px dashed rgba(255, 255, 255, 0.45);
	}

	.streak-num {
		font-family: var(--fit-font-display, 'ZCOOL KuaiLe', sans-serif);
		font-size: 2.375rem;
		color: #fff;
		line-height: 1.1;
		text-shadow: 0 2px 4px rgba(154, 52, 18, 0.25);
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
		border-radius: var(--fit-radius-sm, 0.875rem);
		background: #fff;
		border: 2px dashed #fed7aa;
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
			background: linear-gradient(180deg, #fde68a, #fb923c, #f472b6);
			color: #fff;
			text-shadow: 0 1px 2px rgba(154, 52, 18, 0.2);
			box-shadow: var(--fit-shadow-candy, 0 6px 0 rgba(236, 72, 153, 0.22));
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
