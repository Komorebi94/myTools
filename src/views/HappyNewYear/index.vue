<template>
	<div
		ref="wrapperRef"
		class="happy-new-year-wrapper fireworks-host"
		:class="[deviceType, { 'is-reduced-motion': reducedMotion, 'is-celebrating': isTimeUp }]"
		@click="onWrapperTap"
	>
		<StarsBackground />

		<Transition name="flash">
			<div v-if="showFlash" class="flash-overlay" aria-hidden="true" />
		</Transition>

		<Transition name="fade">
			<p v-if="showFireworksHint" class="fireworks-hint">{{ hintText }}</p>
		</Transition>

		<ShareButton :params="shareParams" :initial-name="shareName" />

		<CountdownDisplay
			v-if="!isOnlyFireworks"
			:countdown="countdown"
			:is-final-countdown="isFinalCountdown"
			:final-seconds="finalSeconds"
			:is-time-up="isTimeUp"
			:is-compact-countdown="isCompactCountdown"
			:aria-countdown-text="ariaCountdownText"
			:new-year-message="newYearMessage"
			:format-number="formatNumber"
			@countdown-number-ref="onCountdownNumberRef"
			@celebration-message-ref="onCelebrationMessageRef"
		/>

		<Barrage
			v-if="showBarrage"
			:messages="barrageMessages"
			:density="barrageDensity"
			avoid-center
		/>
	</div>
</template>

<script setup>
	import { ref, computed, onMounted, onUnmounted } from 'vue'
	import { useRoute } from 'vue-router'
	import { getBarrageDensity } from '@/utils/index'
	import { useRouteQuery } from '@/composables/useRouteQuery'
	import { useDevice } from '@/composables/useDevice'
	import { useFireworks } from '@/composables/useFireworks'
	import { useCountdown } from '@/composables/useCountdown'
	import { useCelebration } from '@/composables/useCelebration'
	import StarsBackground from '@/components/StarsBackground/index.vue'
	import CountdownDisplay from '@/components/CountdownDisplay/index.vue'
	import Barrage from '@/components/Barrage/index.vue'
	import ShareButton from '@/components/ShareButton/index.vue'

	const route = useRoute()
	const { isOnlyFireworks, shareName, barrageMessages, targetDate } = useRouteQuery()
	const { deviceType, reducedMotion } = useDevice()

	const wrapperRef = ref(null)

	const {
		showBarrage,
		showFlash,
		newYearMessage,
		setMessageRef,
		triggerHaptic,
		runCelebration,
		destroy: destroyCelebration
	} = useCelebration({ reducedMotion, shareName })

	const {
		showFireworksHint,
		hintText,
		startFireworks,
		showHintTemporarily,
		onWrapperTap,
		destroy: destroyFireworks
	} = useFireworks(wrapperRef, { deviceType, reducedMotion })

	const handleCelebrate = () => {
		runCelebration({
			onFireworks: () => {
				startFireworks()
				showHintTemporarily()
			}
		})
	}

	const {
		countdown,
		isFinalCountdown,
		finalSeconds,
		isTimeUp,
		isCompactCountdown,
		ariaCountdownText,
		countdownNumber,
		formatNumber,
		start: startCountdown,
		stop: stopCountdown
	} = useCountdown(targetDate, {
		reducedMotion,
		onCelebrate: handleCelebrate,
		onFinalHaptic: (pattern) => triggerHaptic(pattern)
	})

	const onCountdownNumberRef = (el) => {
		countdownNumber.value = el
	}

	const onCelebrationMessageRef = (el) => {
		setMessageRef(el)
	}

	const barrageDensity = computed(() => getBarrageDensity(deviceType.value, reducedMotion.value))

	const shareParams = computed(() => {
		const params = {}
		Object.entries(route.query).forEach(([key, value]) => {
			if (typeof value === 'string') params[key] = value
		})
		return params
	})

	onMounted(() => {
		if (isOnlyFireworks.value) {
			startFireworks()
			showHintTemporarily()
			return
		}
		startCountdown()
	})

	onUnmounted(() => {
		stopCountdown()
		destroyFireworks()
		destroyCelebration()
	})
</script>

<style lang="scss" scoped>
	@use '@/styles/fireworks-layer.scss';

	.happy-new-year-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		min-height: 100dvh;
		padding: calc(var(--safe-top) + 12px) calc(var(--safe-right) + 12px)
			calc(var(--safe-bottom) + 12px) calc(var(--safe-left) + 12px);
		background-color: var(--bg-base);
		position: relative;
		overflow: hidden;
		touch-action: manipulation;
	}

	.flash-overlay {
		position: fixed;
		inset: 0;
		background: rgba(255, 255, 255, 0.75);
		z-index: 9998;
		pointer-events: none;
	}

	.flash-enter-active,
	.flash-leave-active {
		transition: opacity 0.38s ease;
	}

	.flash-enter-from,
	.flash-leave-to {
		opacity: 0;
	}

	.fireworks-hint {
		position: fixed;
		bottom: calc(var(--safe-bottom) + 24px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 10001;
		padding: 10px 18px;
		border-radius: 999px;
		background: var(--hint-bg);
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
		white-space: nowrap;
		pointer-events: none;
		backdrop-filter: blur(6px);
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

	.is-reduced-motion :deep(.stars-bg),
	.is-reduced-motion :deep(.star) {
		animation: none;
		opacity: 0.4;
	}

	.is-celebrating {
		overflow: visible;
	}

	:deep(.countdown-panel) {
		pointer-events: auto;
	}

	@media (prefers-reduced-motion: reduce) {
		.fade-enter-active,
		.fade-leave-active,
		.flash-enter-active,
		.flash-leave-active {
			transition-duration: 0.01ms;
		}
	}
</style>
