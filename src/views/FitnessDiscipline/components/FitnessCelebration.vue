<template>
	<Teleport to="body">
		<div v-if="active" class="celebration-root" aria-hidden="true">
			<span
				v-for="item in petals"
				:key="item.id"
				class="petal"
				:class="{ 'is-dot': item.isDot }"
				:style="item.style"
			>
				<template v-if="!item.isDot">{{ item.emoji }}</template>
			</span>
		</div>
	</Teleport>
</template>

<script setup>
	import { ref, watch } from 'vue'

	const props = defineProps({
		tick: { type: Number, default: 0 }
	})

	const active = ref(false)
	const petals = ref([])
	let clearTimer = null

	const PETAL_EMOJIS = ['🌸', '✨', '🎊', '💮', '🌺', '⭐', '🌼', '🎉', '🪙', '💰', '🐷', '💖']
	const PETAL_COLORS = ['#f9a8d4', '#fda4af', '#fde68a', '#c4b5fd', '#fbcfe8', '#fed7aa']

	const rand = (min, max) => min + Math.random() * (max - min)

	const spawnPetals = (count = 56) => {
		const items = []
		for (let i = 0; i < count; i++) {
			const isDot = Math.random() > 0.4
			const color = PETAL_COLORS[i % PETAL_COLORS.length]
			items.push({
				id: `petal-${i}-${Date.now()}`,
				emoji: isDot ? '' : PETAL_EMOJIS[i % PETAL_EMOJIS.length],
				isDot,
				style: {
					left: `${rand(0, 100)}vw`,
					'--fall-delay': `${rand(0, 0.9)}s`,
					'--fall-duration': `${rand(1.9, 3.4)}s`,
					'--drift': `${rand(-48, 48)}px`,
					'--spin': `${rand(-200, 200)}deg`,
					fontSize: isDot ? undefined : `${rand(0.85, 1.4)}rem`,
					width: isDot ? `${rand(6, 11)}px` : undefined,
					height: isDot ? `${rand(6, 11)}px` : undefined,
					backgroundColor: isDot ? color : undefined
				}
			})
		}
		return items
	}

	const play = () => {
		if (clearTimer) clearTimeout(clearTimer)
		petals.value = spawnPetals()
		active.value = true
		clearTimer = setTimeout(() => {
			active.value = false
			petals.value = []
		}, 3600)
	}

	watch(
		() => props.tick,
		(value, prev) => {
			if (value > 0 && value !== prev) play()
		}
	)
</script>

<style scoped lang="scss">
	.celebration-root {
		position: fixed;
		inset: 0;
		z-index: 280;
		pointer-events: none;
		overflow: hidden;
	}

	.petal {
		position: fixed;
		top: -6vh;
		line-height: 1;
		opacity: 0;
		animation: petal-fall var(--fall-duration) ease-in var(--fall-delay) forwards;

		&.is-dot {
			border-radius: 999px;
		}
	}

	@keyframes petal-fall {
		0% {
			transform: translateY(0) translateX(0) rotate(0deg);
			opacity: 0;
		}

		8% {
			opacity: 1;
		}

		100% {
			transform: translateY(112vh) translateX(var(--drift)) rotate(var(--spin));
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.petal {
			animation: none;
			display: none;
		}
	}
</style>
