<template>
	<div class="stars-bg" aria-hidden="true">
		<span v-for="(style, index) in starStyles" :key="index" class="star" :style="style" />
	</div>
</template>

<script setup>
	import { ref, onMounted } from 'vue'

	const STAR_COUNT = 40

	const createStarStyles = () =>
		Array.from({ length: STAR_COUNT }, () => ({
			left: `${Math.random() * 100}%`,
			top: `${Math.random() * 100}%`,
			animationDelay: `${Math.random() * 5}s`,
			animationDuration: `${2 + Math.random() * 3}s`
		}))

	const starStyles = ref(createStarStyles())

	onMounted(() => {
		starStyles.value = createStarStyles()
	})
</script>

<style lang="scss" scoped>
	.stars-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	.star {
		position: absolute;
		width: 2px;
		height: 2px;
		border-radius: 50%;
		background: var(--star-color);
		animation-name: star-twinkle;
		animation-iteration-count: infinite;
		animation-direction: alternate;
	}

	@keyframes star-twinkle {
		from {
			opacity: 0.25;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1.2);
		}
	}
</style>
