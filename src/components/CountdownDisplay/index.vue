<template>
	<div
		class="countdown-panel"
		role="status"
		aria-live="polite"
		aria-atomic="true"
		:aria-label="ariaCountdownText"
	>
		<span class="sr-only">{{ ariaCountdownText }}</span>
		<Transition name="fade" mode="out-in">
			<div v-if="isFinalCountdown" key="final" class="fullscreen-countdown">
				<h1 ref="countdownNumberRef">{{ finalSeconds }}</h1>
			</div>

			<div v-else-if="!isTimeUp" key="countdown" class="countdown-display">
				<p class="countdown-label">距离新年还有</p>

				<div v-if="isCompactCountdown" class="countdown-blocks">
					<div class="block">
						<span class="block-value">{{ formatNumber(countdown.hours) }}</span>
						<span class="block-unit">时</span>
					</div>
					<span class="block-sep">:</span>
					<div class="block">
						<span class="block-value">{{ formatNumber(countdown.minutes) }}</span>
						<span class="block-unit">分</span>
					</div>
					<span class="block-sep">:</span>
					<div class="block">
						<span class="block-value">{{ formatNumber(countdown.seconds) }}</span>
						<span class="block-unit">秒</span>
					</div>
				</div>

				<div v-else class="countdown-cards">
					<div v-for="unit in cardUnits" :key="unit.key" class="card">
						<span class="card-value">{{ formatNumber(countdown[unit.key]) }}</span>
						<span class="card-unit">{{ unit.label }}</span>
					</div>
				</div>
			</div>

			<div v-else key="celebration" class="new-year-message">
				<div ref="messageBoxRef" class="new-year-message__box">
					<span v-for="(char, index) in newYearMessage" :key="index" class="char">{{
						char
					}}</span>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup>
	import { ref, watch } from 'vue'

	defineProps({
		countdown: { type: Object, required: true },
		isFinalCountdown: { type: Boolean, default: false },
		finalSeconds: { type: Number, default: 10 },
		isTimeUp: { type: Boolean, default: false },
		isCompactCountdown: { type: Boolean, default: false },
		ariaCountdownText: { type: String, default: '' },
		newYearMessage: { type: Array, default: () => [] },
		formatNumber: { type: Function, required: true }
	})

	const countdownNumberRef = ref(null)
	const messageBoxRef = ref(null)

	defineExpose({
		countdownNumber: countdownNumberRef
	})

	const emit = defineEmits(['countdown-number-ref', 'celebration-message-ref'])

	watch(
		countdownNumberRef,
		(el) => {
			emit('countdown-number-ref', el)
		},
		{ immediate: true }
	)

	watch(
		messageBoxRef,
		(el) => {
			emit('celebration-message-ref', el)
		},
		{ immediate: true }
	)

	const cardUnits = [
		{ key: 'days', label: '天' },
		{ key: 'hours', label: '时' },
		{ key: 'minutes', label: '分' },
		{ key: 'seconds', label: '秒' }
	]
</script>

<style lang="scss" scoped>
	.countdown-panel {
		position: relative;
		width: min(100%, 720px);
		text-align: center;
		z-index: 1;
	}

	.countdown-label {
		color: var(--color-primary-muted);
		font-size: 0.875rem;
		letter-spacing: 0.12em;
		margin-bottom: 1rem;
	}

	.countdown-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	.card {
		background: var(--color-primary-soft);
		border: 1px solid var(--color-primary-border);
		border-radius: 10px;
		padding: 0.75rem 0.35rem;
		backdrop-filter: blur(4px);
	}

	.card-value {
		display: block;
		color: var(--color-primary);
		font-size: 1.5rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: 1.2;
	}

	.card-unit {
		display: block;
		margin-top: 0.25rem;
		color: var(--color-primary-muted);
		font-size: 0.75rem;
	}

	.countdown-blocks {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
	}

	.block {
		min-width: 4.5rem;
		padding: 0.65rem 0.5rem;
		background: var(--color-accent-soft);
		border: 1px solid var(--color-accent-border);
		border-radius: 10px;
	}

	.block-value {
		display: block;
		color: var(--color-accent);
		font-size: 2rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}

	.block-unit {
		display: block;
		margin-top: 0.2rem;
		font-size: 0.7rem;
		color: var(--color-accent-muted);
	}

	.block-sep {
		color: var(--color-accent);
		font-size: 1.75rem;
		font-weight: 700;
		padding-bottom: 1rem;
	}

	.fullscreen-countdown {
		position: fixed;
		inset: 0;
		color: var(--color-accent);
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		z-index: 9999;

		h1 {
			font-size: clamp(4rem, 18vw, 8rem);
			font-variant-numeric: tabular-nums;
			text-shadow: 0 0 40px var(--color-accent-glow);
		}
	}

	/* 与 fullscreen-countdown 一致：全屏居中，避免父级宽度塌陷偏左 */
	.new-year-message {
		position: fixed;
		inset: 0;
		z-index: 10002;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		pointer-events: none;
	}

	.new-year-message__box {
		display: inline-flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.1em;
		max-width: min(92vw, 720px);
		padding: 1rem 1.5rem;
		border-radius: 16px;
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		box-shadow: 0 0 32px var(--color-celebration-glow);
		font-size: clamp(1.25rem, 4vw, 2rem);
		color: var(--color-celebration);
		font-weight: bold;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
		will-change: transform, opacity;
	}

	.char {
		display: inline-block;
	}

	.fade-enter-active,
	.fade-leave-active {
		transition:
			opacity 0.4s ease,
			transform 0.4s ease;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
		transform: translateY(8px);
	}

	@media (max-width: $mobile-max) {
		.countdown-cards {
			gap: 0.35rem;
		}
		.card-value {
			font-size: 1.35rem;
		}
		.block-value {
			font-size: 2.25rem;
		}
		.fullscreen-countdown h1 {
			font-size: clamp(5rem, 22vw, 9rem);
		}
	}

	@media (min-width: $tablet-min) and (max-width: $tablet-max) {
		.countdown-cards {
			gap: 0.75rem;
		}
		.card-value {
			font-size: 1.75rem;
		}
		.block-value {
			font-size: 2.5rem;
		}
		.fullscreen-countdown h1 {
			font-size: clamp(4.5rem, 14vw, 7rem);
		}
	}

	@media (min-width: $desktop-min) {
		.countdown-cards {
			gap: 1rem;
		}
		.card {
			padding: 1rem 0.5rem;
		}
		.card-value {
			font-size: 2rem;
		}
		.block-value {
			font-size: 2.75rem;
		}
		.fullscreen-countdown h1 {
			font-size: clamp(5rem, 10vw, 8rem);
		}
	}

	@media (orientation: landscape) and (max-height: 500px) {
		.fullscreen-countdown h1 {
			font-size: clamp(3rem, 12vw, 5rem);
		}

		.new-year-message__box {
			font-size: clamp(1rem, 3vw, 1.5rem);
			padding: 0.75rem 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fade-enter-active,
		.fade-leave-active {
			transition-duration: 0.01ms;
		}
	}
</style>
