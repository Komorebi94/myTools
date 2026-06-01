<template>
	<div class="barrage-wrapper">
		<!-- 减弱动效：底部静态轮播（需对读屏可见） -->
		<p v-if="reducedMotion && staticText" class="barrage-static" aria-live="polite">
			{{ staticText }}
		</p>

		<template v-else>
			<span
				v-for="item in items"
				:key="item.id"
				class="barrage-item"
				:class="`barrage-item--${density}`"
				:style="item.style"
				aria-hidden="true"
				>{{ item.text }}</span
			>
		</template>
	</div>
</template>

<script setup>
	import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
	import { prefersReducedMotion } from '@/utils/index'

	const props = defineProps({
		messages: {
			type: Array,
			default: () => [
				'新年快乐！',
				'Happy New Year!',
				'🎉 万事如意',
				'🎊 心想事成',
				'✨ 阖家幸福',
				'🧧 大吉大利',
				'🎆 岁岁平安',
				'🌟 前程似锦',
				'💫 龙马精神',
				'🎇 财源广进'
			]
		},
		density: {
			type: String,
			default: 'medium',
			validator: (v) => ['low', 'medium', 'high'].includes(v)
		},
		avoidCenter: {
			type: Boolean,
			default: true
		}
	})

	const DENSITY_CONFIG = {
		low: { interval: 1800, maxItems: 12, burst: 1, stagger: 0 },
		medium: { interval: 1200, maxItems: 18, burst: 1, stagger: 0 },
		high: { interval: 900, maxItems: 24, burst: 1, stagger: 0 }
	}

	/** 固定轨道（%），上下分区避让中部祝福语 */
	const UPPER_LANES = [6, 11, 16, 21, 26]
	const LOWER_LANES = [74, 79, 84, 89, 94]
	const FULL_LANES = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88]

	/** 轨道释放时间（ms），同一轨道同时仅一条弹幕 */
	const laneReleaseAt = new Map()
	let laneCursor = 0

	const reducedMotion = ref(prefersReducedMotion())
	const items = ref([])
	const staticText = ref('')
	let spawnTimer = null
	let staticTimer = null
	let motionMediaQuery = null

	const config = computed(() => DENSITY_CONFIG[props.density] || DENSITY_CONFIG.medium)

	const clearSpawnTimer = () => {
		if (spawnTimer) {
			clearInterval(spawnTimer)
			spawnTimer = null
		}
	}

	const clearStaticTimer = () => {
		if (staticTimer) {
			clearInterval(staticTimer)
			staticTimer = null
		}
	}

	const removeItem = (id) => {
		items.value = items.value.filter((item) => item.id !== id)
	}

	const getLanePool = () => {
		if (!props.avoidCenter) return FULL_LANES
		return [...UPPER_LANES, ...LOWER_LANES]
	}

	/** 估算文案宽度（vw），用于计算同轨道下一条的安全间隔 */
	const estimateWidthVw = (text) => Math.min(48, 3 + text.length * 1.6)

	/**
	 * 同轨道前后两条的最小间隔（秒）
	 * 依据动画时长与估算宽度，避免水平方向追尾重叠
	 */
	const laneCooldownSec = (text, durationSec) => {
		const widthVw = estimateWidthVw(text)
		const travelVw = 100 + widthVw
		return durationSec * ((widthVw + 10) / travelVw) + 1.2
	}

	const isLaneFree = (lane, now = Date.now()) => {
		const until = laneReleaseAt.get(lane)
		return until == null || until <= now
	}

	/** 轮询选取当前空闲轨道；全部占用则跳过本次生成 */
	const pickFreeLane = () => {
		const pool = getLanePool()
		const now = Date.now()
		const free = pool.filter((lane) => isLaneFree(lane, now))
		if (!free.length) return null

		const lane = free[laneCursor % free.length]
		laneCursor = (laneCursor + 1) % free.length
		return lane
	}

	const pickMessage = () => {
		const recent = items.value.slice(-4).map((item) => item.text)
		let text = props.messages[Math.floor(Math.random() * props.messages.length)]
		let guard = 0
		while (recent.includes(text) && guard < 6) {
			text = props.messages[Math.floor(Math.random() * props.messages.length)]
			guard += 1
		}
		return text
	}

	const spawnOne = () => {
		if (items.value.length >= config.value.maxItems) return

		const lane = pickFreeLane()
		if (lane == null) return

		const text = pickMessage()
		const id = `${Date.now()}-${Math.random()}`
		const duration = 11 + Math.random() * 5
		const cooldownSec = laneCooldownSec(text, duration)

		laneReleaseAt.set(lane, Date.now() + cooldownSec * 1000)

		items.value.push({
			id,
			text,
			lane,
			style: {
				top: `${lane}%`,
				animationDuration: `${duration}s`,
				animationDelay: '0s'
			}
		})

		setTimeout(() => removeItem(id), duration * 1000 + 300)
	}

	const spawn = () => {
		const { burst = 1, stagger = 0 } = config.value
		for (let i = 0; i < burst; i++) {
			setTimeout(() => spawnOne(), i * stagger)
		}
	}

	const startScrolling = () => {
		clearSpawnTimer()
		items.value = []
		laneReleaseAt.clear()
		laneCursor = 0
		spawn()
		spawnTimer = setInterval(spawn, config.value.interval)
	}

	const startStaticCarousel = () => {
		clearStaticTimer()
		clearSpawnTimer()
		items.value = []

		const rotate = () => {
			staticText.value = pickMessage()
		}
		rotate()
		staticTimer = setInterval(rotate, 3500)
	}

	const restart = () => {
		if (reducedMotion.value) {
			startStaticCarousel()
		} else {
			startScrolling()
		}
	}

	watch(
		() => props.density,
		() => {
			if (!reducedMotion.value) restart()
		}
	)

	watch(
		() => props.messages,
		() => {
			restart()
		},
		{ deep: true }
	)

	const onMotionChange = (event) => {
		reducedMotion.value = event.matches
		restart()
	}

	onMounted(() => {
		motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		reducedMotion.value = motionMediaQuery.matches
		motionMediaQuery.addEventListener('change', onMotionChange)
		restart()
	})

	onUnmounted(() => {
		motionMediaQuery?.removeEventListener('change', onMotionChange)
		clearSpawnTimer()
		clearStaticTimer()
	})
</script>

<style lang="scss" scoped>
	.barrage-wrapper {
		position: fixed;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 10000;
	}

	.barrage-static {
		position: fixed;
		bottom: calc(var(--safe-bottom) + 20px);
		left: 50%;
		transform: translateX(-50%);
		max-width: 90vw;
		padding: 10px 18px;
		border-radius: 999px;
		background: var(--glass-bg);
		color: #fff;
		font-size: 1rem;
		text-align: center;
		backdrop-filter: blur(6px);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.barrage-item {
		position: absolute;
		left: 0;
		line-height: 1.35;
		white-space: nowrap;
		color: #fff;
		text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
		animation-name: barrage-scroll;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
		will-change: transform;
		transform: translateX(100vw);

		&--low {
			font-size: 0.875rem;
		}

		&--medium {
			font-size: 1rem;
		}

		&--high {
			font-size: 1.125rem;
		}
	}

	/* 终点用 vw + 自身宽度，避免短文案只移动 -120% 宽度就结束 */
	@keyframes barrage-scroll {
		from {
			transform: translateX(100vw);
		}
		to {
			transform: translateX(calc(-100% - 2rem));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.barrage-item {
			animation: none;
			opacity: 0;
		}
	}
</style>
