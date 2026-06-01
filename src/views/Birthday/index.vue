<template>
	<div
		ref="wrapperRef"
		class="birthday-wrapper fireworks-host"
		:class="[deviceType, { 'is-reduced-motion': reducedMotion, 'is-celebrating': celebrated }]"
		@click="handleWrapperTap"
	>
		<div class="aurora-bg" aria-hidden="true" />
		<div class="glow-orb glow-orb--1" aria-hidden="true" />
		<div class="glow-orb glow-orb--2" aria-hidden="true" />

		<div class="sparkles" aria-hidden="true">
			<span v-for="(sparkle, i) in sparkles" :key="i" class="sparkle" :style="sparkle" />
		</div>

		<div class="balloons" aria-hidden="true">
			<span v-for="(balloon, i) in balloons" :key="i" class="balloon" :style="balloon.style">
				<span class="balloon__string" />
				<span class="balloon__emoji">{{ balloon.emoji }}</span>
			</span>
		</div>

		<div v-if="showConfetti" class="confetti-layer" aria-hidden="true">
			<span
				v-for="piece in confettiPieces"
				:key="piece.id"
				class="confetti"
				:style="piece.style"
			/>
		</div>

		<Transition name="flash">
			<div v-if="showFlash" class="flash-overlay" aria-hidden="true" />
		</Transition>

		<Transition name="fade">
			<p v-if="showFireworksHint" class="celebrate-hint">{{ hintText }}</p>
		</Transition>

		<ShareButton :params="shareParams" :initial-name="shareName" />

		<button
			v-if="showMusicControl"
			type="button"
			class="music-toggle"
			:class="{ 'is-muted': isMuted, 'needs-gesture': needsGesture }"
			:aria-label="musicToggleLabel"
			:title="musicToggleLabel"
			@click.stop="toggleMute"
		>
			<span class="music-toggle__icon" aria-hidden="true">{{ isMuted ? '🔇' : '🎵' }}</span>
		</button>

		<main class="birthday-stage" role="main">
			<p class="birthday-badge">专属生日派对</p>

			<div ref="messageBoxRef" class="birthday-card" :class="{ 'is-lit': celebrated }">
				<Transition name="ribbon">
					<p v-if="celebrated" class="celebration-ribbon">HAPPY BIRTHDAY</p>
				</Transition>

				<div class="cake-wrap" aria-hidden="true">
					<span class="cake-glow" />
					<span class="cake">🎂</span>
				</div>

				<h1 class="birthday-title" aria-live="polite">
					<span
						v-for="(char, index) in titleChars"
						:key="`${char}-${index}`"
						class="title-char"
						:ref="(el) => setTitleRef(el, index)"
						>{{ char }}</span
					>
				</h1>

				<p class="birthday-sub">{{ subtitle }}</p>

				<div class="candles" aria-hidden="true">
					<span
						v-for="n in 5"
						:key="n"
						class="candle"
						:class="{ lit: n <= litCount }"
						:style="{ '--i': n }"
					/>
				</div>

				<Transition name="fade">
					<p v-if="celebrated" class="wish-line">{{ wishLine }}</p>
					<button v-else type="button" class="celebrate-btn" @click.stop="runCelebrate">
						<span class="celebrate-btn__icon">🕯️</span>
						<span>点燃蜡烛 · 开始庆祝</span>
					</button>
				</Transition>
			</div>
		</main>

		<Barrage
			v-if="showBarrage"
			:messages="barrageMessages"
			:density="barrageDensity"
			avoid-center
		/>
	</div>
</template>

<script setup>
	import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
	import { useRoute } from 'vue-router'
	import { buildBirthdayTitle, buildBirthdaySubtitle } from '@/utils/birthday'
	import { useBirthdayQuery } from '@/composables/useBirthdayQuery'
	import { useBirthdayCelebration } from '@/composables/useBirthdayCelebration'
	import { useBirthdayMusic } from '@/composables/useBirthdayMusic'
	import { useDevice } from '@/composables/useDevice'
	import { useFireworks } from '@/composables/useFireworks'
	import ShareButton from '@/components/ShareButton/index.vue'
	import Barrage from '@/components/Barrage/index.vue'

	const route = useRoute()
	const { shareName, barrageMessages, age, autoCelebrate, musicEnabled } = useBirthdayQuery()
	const { deviceType, reducedMotion } = useDevice()

	const wrapperRef = ref(null)
	const messageBoxRef = ref(null)
	const titleRefs = ref([])
	const showBarrage = ref(false)

	const BALLOON_EMOJIS = ['🎈', '🎉', '🎊', '🎁', '💖', '🌟', '🦄', '✨']

	const sparkles = Array.from({ length: 24 }, () => ({
		left: `${Math.random() * 100}%`,
		top: `${Math.random() * 100}%`,
		animationDelay: `${Math.random() * 4}s`,
		animationDuration: `${1.8 + Math.random() * 2.5}s`
	}))

	const balloonCount = computed(() => (deviceType.value === 'mobile' ? 7 : 12))

	const balloons = computed(() =>
		Array.from({ length: balloonCount.value }, (_, i) => ({
			emoji: BALLOON_EMOJIS[i % BALLOON_EMOJIS.length],
			style: {
				left: `${6 + ((i * (84 / balloonCount.value)) % 84)}%`,
				animationDelay: `${i * 0.65}s`,
				animationDuration: `${5.5 + (i % 3)}s`
			}
		}))
	)

	const {
		showFireworksHint,
		hintText,
		startFireworks,
		showHintTemporarily,
		onWrapperTap,
		destroy: destroyFireworks
	} = useFireworks(wrapperRef, { deviceType, reducedMotion, theme: 'birthday' })

	const setTitleRef = (el, index) => {
		if (el) titleRefs.value[index] = el
	}

	const {
		isMuted,
		needsGesture,
		play: playBirthdayMusic,
		toggleMute,
		resumeOnGesture,
		showMusicControl
	} = useBirthdayMusic({ musicEnabled, reducedMotion })

	const musicToggleLabel = computed(() => {
		if (isMuted.value) return '开启背景音乐'
		if (needsGesture.value) return '点击开启背景音乐'
		return '关闭背景音乐'
	})

	const handleWrapperTap = (event) => {
		onWrapperTap(event)
		resumeOnGesture()
	}

	const startPartyEffects = () => {
		showBarrage.value = true
		startFireworks()
		showHintTemporarily()
		if (!reducedMotion.value) playBirthdayMusic()
	}

	const {
		celebrated,
		litCount,
		showConfetti,
		confettiPieces,
		showFlash,
		animateCardEntrance,
		animateTitleEntrance,
		runCelebrate,
		destroy: destroyCelebration
	} = useBirthdayCelebration({
		reducedMotion,
		deviceType,
		messageBoxRef,
		titleRefs,
		onStartEffects: startPartyEffects
	})

	const titleChars = computed(() => buildBirthdayTitle(shareName.value))

	const subtitle = computed(() => buildBirthdaySubtitle(shareName.value, age.value))

	const wishLine = computed(() =>
		shareName.value
			? `${shareName.value}，许个愿吧 —— 然后点击屏幕放烟花 🎆`
			: '深吸一口气，许个愿，然后点击屏幕放烟花 🎆'
	)

	/** 生日页中部内容较多，使用 medium 密度 + 轨道锁避免重叠 */
	const barrageDensity = computed(() => {
		if (reducedMotion.value) return 'low'
		return 'medium'
	})

	const shareParams = computed(() => {
		const params = {}
		Object.entries(route.query).forEach(([key, value]) => {
			if (key === 'page') return
			if (typeof value === 'string') params[key] = value
		})
		return params
	})

	let autoTimer = null

	onMounted(() => {
		nextTick(() => {
			animateCardEntrance()
			animateTitleEntrance()
		})

		if (autoCelebrate.value) {
			autoTimer = setTimeout(() => {
				if (!celebrated.value) runCelebrate()
			}, 1400)
		}
	})

	onUnmounted(() => {
		if (autoTimer) clearTimeout(autoTimer)
		destroyCelebration()
		destroyFireworks()
	})
</script>

<style lang="scss" scoped>
	@use '@/styles/fireworks-layer.scss';

	.birthday-wrapper {
		position: relative;
		min-height: 100vh;
		min-height: 100dvh;
		overflow: hidden;
		background: #08040f;
		touch-action: manipulation;
	}

	.music-toggle {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		border: 1px solid rgba(255, 182, 220, 0.35);
		border-radius: 50%;
		background: rgba(20, 10, 34, 0.72);
		backdrop-filter: blur(10px);
		cursor: pointer;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			border-color 0.2s ease;

		&:hover {
			transform: scale(1.06);
			border-color: rgba(255, 209, 102, 0.55);
			box-shadow: 0 0 18px rgba(255, 107, 203, 0.35);
		}

		&.needs-gesture:not(.is-muted) {
			animation: music-pulse 1.4s ease-in-out infinite;
		}

		&.is-muted {
			opacity: 0.72;
		}
	}

	.music-toggle__icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	@keyframes music-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(255, 209, 102, 0.45);
		}
		50% {
			box-shadow: 0 0 0 10px rgba(255, 209, 102, 0);
		}
	}

	.aurora-bg {
		position: absolute;
		inset: -25%;
		background:
			radial-gradient(ellipse 55% 42% at 18% 28%, rgba(255, 107, 203, 0.38), transparent 58%),
			radial-gradient(ellipse 48% 38% at 82% 18%, rgba(167, 139, 250, 0.42), transparent 52%),
			radial-gradient(ellipse 50% 45% at 50% 92%, rgba(255, 209, 102, 0.22), transparent 55%),
			radial-gradient(ellipse 30% 25% at 70% 65%, rgba(96, 165, 250, 0.18), transparent 50%),
			linear-gradient(155deg, #140a22 0%, #08040f 42%, #1a0a2e 100%);
		animation: aurora-shift 14s ease-in-out infinite alternate;
	}

	@keyframes aurora-shift {
		from {
			transform: scale(1) rotate(0deg);
		}
		to {
			transform: scale(1.06) rotate(1.5deg);
		}
	}

	.glow-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(70px);
		pointer-events: none;
		animation: orb-float 9s ease-in-out infinite alternate;

		&--1 {
			width: 300px;
			height: 300px;
			top: 8%;
			left: 0;
			background: rgba(255, 107, 203, 0.38);
		}

		&--2 {
			width: 340px;
			height: 340px;
			bottom: 0;
			right: -5%;
			background: rgba(167, 139, 250, 0.32);
			animation-delay: -4s;
		}
	}

	@keyframes orb-float {
		from {
			transform: translate(0, 0);
		}
		to {
			transform: translate(20px, -22px);
		}
	}

	.sparkles {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
	}

	.sparkle {
		position: absolute;
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
		animation-name: sparkle-twinkle;
		animation-iteration-count: infinite;
		animation-direction: alternate;
	}

	@keyframes sparkle-twinkle {
		from {
			opacity: 0.15;
			transform: scale(0.6);
		}
		to {
			opacity: 1;
			transform: scale(1.3);
		}
	}

	.balloons {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
	}

	.balloon {
		position: absolute;
		bottom: -18%;
		display: flex;
		flex-direction: column;
		align-items: center;
		animation-name: balloon-rise;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	.balloon__string {
		width: 1px;
		height: 2.5rem;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent);
		transform-origin: top center;
	}

	.balloon__emoji {
		font-size: clamp(1.6rem, 4.2vw, 2.4rem);
		filter: drop-shadow(0 6px 14px rgba(255, 107, 203, 0.45));
	}

	@keyframes balloon-rise {
		0% {
			transform: translateY(0) translateX(0);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		55% {
			transform: translateY(-58vh) translateX(14px);
		}
		100% {
			transform: translateY(-118vh) translateX(-10px);
			opacity: 0.15;
		}
	}

	.confetti-layer {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 10001;
		overflow: hidden;
	}

	.confetti {
		position: absolute;
		top: -16px;
		width: 9px;
		height: 14px;
		border-radius: 2px;
		animation-name: confetti-fall;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}

	@keyframes confetti-fall {
		to {
			transform: translateY(110vh) translateX(var(--drift, 0)) rotate(720deg);
			opacity: 0.55;
		}
	}

	.birthday-stage {
		position: relative;
		z-index: 10;
		pointer-events: none;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: calc(var(--safe-top) + 12px) 1.25rem calc(var(--safe-bottom) + 28px);
	}

	.birthday-badge {
		margin-bottom: 1rem;
		padding: 0.35rem 1rem;
		border-radius: 999px;
		font-size: 0.75rem;
		letter-spacing: 0.35em;
		color: rgba(255, 209, 102, 0.9);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 209, 102, 0.25);
		text-shadow: 0 0 16px rgba(255, 107, 203, 0.5);
	}

	.birthday-card {
		position: relative;
		width: min(92vw, 540px);
		padding: 2.25rem 1.5rem 1.85rem;
		text-align: center;
		border-radius: 28px;
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(16px);
		box-shadow:
			0 0 50px rgba(255, 107, 203, 0.2),
			0 24px 48px rgba(0, 0, 0, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.14);
		transition:
			box-shadow 0.6s ease,
			border-color 0.6s ease;

		&.is-lit {
			border-color: rgba(255, 209, 102, 0.45);
			box-shadow:
				0 0 80px rgba(255, 107, 203, 0.35),
				0 0 120px rgba(255, 209, 102, 0.15),
				0 24px 48px rgba(0, 0, 0, 0.35),
				inset 0 1px 0 rgba(255, 255, 255, 0.2);
			animation: card-glow 2.5s ease-in-out infinite alternate;
		}
	}

	@keyframes card-glow {
		from {
			filter: brightness(1);
		}
		to {
			filter: brightness(1.06);
		}
	}

	.celebration-ribbon {
		position: absolute;
		top: -0.65rem;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.3rem 1rem;
		border-radius: 6px;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.22em;
		color: #1a0a2e;
		background: linear-gradient(90deg, #ffd166, #ff6bcb, #c4b5fd);
		box-shadow: 0 4px 16px rgba(255, 107, 203, 0.4);
		white-space: nowrap;
	}

	.ribbon-enter-active,
	.ribbon-leave-active {
		transition:
			opacity 0.5s ease,
			transform 0.5s ease;
	}

	.ribbon-enter-from,
	.ribbon-leave-to {
		opacity: 0;
		transform: translateX(-50%) translateY(-8px) scale(0.9);
	}

	.cake-wrap {
		position: relative;
		display: inline-block;
		margin-bottom: 0.35rem;
	}

	.cake-glow {
		position: absolute;
		inset: -20%;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 209, 102, 0.35), transparent 70%);
		animation: glow-pulse 2s ease-in-out infinite;
	}

	@keyframes glow-pulse {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.15);
		}
	}

	.cake {
		position: relative;
		display: block;
		font-size: clamp(2.75rem, 10vw, 3.5rem);
		animation: cake-bounce 2.2s ease-in-out infinite;
	}

	@keyframes cake-bounce {
		0%,
		100% {
			transform: translateY(0) scale(1);
		}
		50% {
			transform: translateY(-10px) scale(1.06);
		}
	}

	.birthday-title {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.06em;
		font-size: clamp(1.85rem, 7.5vw, 3.1rem);
		font-weight: 800;
		line-height: 1.25;
	}

	.title-char {
		display: inline-block;
		background: linear-gradient(120deg, #fff6cc 0%, #ff6bcb 40%, #e9d5ff 75%, #93c5fd 100%);
		background-size: 220% auto;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: title-shine 5s linear infinite;
		filter: drop-shadow(0 0 20px rgba(255, 107, 203, 0.4));
	}

	@keyframes title-shine {
		to {
			background-position: 220% center;
		}
	}

	.birthday-sub {
		margin-top: 0.9rem;
		max-width: 28em;
		margin-left: auto;
		margin-right: auto;
		font-size: clamp(0.875rem, 3.2vw, 1.05rem);
		line-height: 1.65;
		color: rgba(255, 255, 255, 0.8);
	}

	.candles {
		display: flex;
		justify-content: center;
		gap: 0.7rem;
		margin: 1.35rem 0 1.1rem;
		height: 2.75rem;
		align-items: flex-end;
	}

	.candle {
		width: 11px;
		height: 1.85rem;
		border-radius: 5px 5px 2px 2px;
		background: linear-gradient(180deg, #ffc2e6 0%, #ff6bcb 55%, #d946ef 100%);
		position: relative;
		opacity: 0.35;
		transform-origin: bottom center;
		transition:
			opacity 0.25s ease,
			transform 0.35s ease;

		&::after {
			content: '';
			position: absolute;
			top: -11px;
			left: 50%;
			width: 9px;
			height: 12px;
			margin-left: -4.5px;
			border-radius: 50% 50% 22% 22%;
			background: transparent;
			transform: scale(0);
			transition: transform 0.3s ease;
		}

		&.lit {
			opacity: 1;
			transform: scaleY(1.02);
			animation: candle-pop 0.45s ease backwards;
			animation-delay: calc(var(--i) * 0.05s);

			&::after {
				transform: scale(1);
				background: radial-gradient(
					circle,
					#fffef0 0%,
					#ffd166 35%,
					#ff8c42 70%,
					transparent 100%
				);
				animation: flame-flicker 0.45s ease-in-out infinite alternate;
				animation-delay: calc(var(--i) * 0.08s);
			}
		}
	}

	@keyframes candle-pop {
		from {
			transform: scaleY(0.6);
			opacity: 0.3;
		}
		to {
			transform: scaleY(1.02);
			opacity: 1;
		}
	}

	@keyframes flame-flicker {
		from {
			transform: scale(1) translateY(0);
		}
		to {
			transform: scale(1.2) translateY(-3px);
		}
	}

	.birthday-card,
	.celebrate-btn,
	.wish-line {
		pointer-events: auto;
	}

	.celebrate-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.35rem;
		padding: 0.8rem 1.6rem;
		border: none;
		border-radius: 999px;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #1a0a2e;
		cursor: pointer;
		background: linear-gradient(135deg, #ffe08a 0%, #ff6bcb 48%, #c4b5fd 100%);
		box-shadow:
			0 4px 0 rgba(0, 0, 0, 0.15),
			0 8px 28px rgba(255, 107, 203, 0.45);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;

		&:hover {
			transform: translateY(-3px);
			box-shadow:
				0 6px 0 rgba(0, 0, 0, 0.12),
				0 12px 36px rgba(255, 107, 203, 0.55);
		}

		&:active {
			transform: translateY(1px);
			box-shadow:
				0 2px 0 rgba(0, 0, 0, 0.15),
				0 4px 16px rgba(255, 107, 203, 0.4);
		}

		&:focus-visible {
			outline: 2px solid #ffd166;
			outline-offset: 3px;
		}
	}

	.celebrate-btn__icon {
		font-size: 1.1rem;
	}

	.wish-line {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: rgba(255, 209, 102, 0.88);
		letter-spacing: 0.02em;
	}

	.flash-overlay {
		position: fixed;
		inset: 0;
		background: radial-gradient(circle, rgba(255, 240, 250, 0.8), rgba(255, 200, 230, 0.5));
		z-index: 9998;
		pointer-events: none;
	}

	.flash-enter-active,
	.flash-leave-active {
		transition: opacity 0.45s ease;
	}

	.flash-enter-from,
	.flash-leave-to {
		opacity: 0;
	}

	.celebrate-hint {
		position: fixed;
		bottom: calc(var(--safe-bottom) + 24px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 10001;
		padding: 10px 18px;
		border-radius: 999px;
		background: rgba(20, 10, 30, 0.7);
		color: rgba(255, 255, 255, 0.92);
		font-size: 0.875rem;
		white-space: nowrap;
		pointer-events: none;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 107, 203, 0.35);
	}

	.fade-enter-active,
	.fade-leave-active {
		transition:
			opacity 0.45s ease,
			transform 0.45s ease;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
		transform: translateY(10px);
	}

	.is-reduced-motion {
		.aurora-bg,
		.glow-orb,
		.balloon,
		.sparkle,
		.cake,
		.cake-glow,
		.title-char,
		.birthday-card.is-lit {
			animation: none;
		}

		.confetti-layer {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flash-enter-active,
		.flash-leave-active,
		.fade-enter-active,
		.fade-leave-active,
		.ribbon-enter-active,
		.ribbon-leave-active {
			transition-duration: 0.01ms;
		}
	}

	@media (orientation: landscape) and (max-height: 500px) {
		.birthday-card {
			padding: 1.25rem 1.25rem 1rem;
		}

		.cake {
			font-size: 2.25rem;
		}

		.birthday-title {
			font-size: clamp(1.5rem, 6vw, 2rem);
		}
	}
</style>
