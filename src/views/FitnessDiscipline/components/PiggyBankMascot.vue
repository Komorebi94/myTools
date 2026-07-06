<template>
	<div
		class="piggy-mascot"
		:class="{ happy, floating }"
		:style="{ width: `${size}px`, height: `${size}px` }"
		aria-hidden="true"
	>
		<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- 阴影 -->
			<ellipse cx="60" cy="108" rx="34" ry="6" fill="rgba(236,72,153,0.18)" />
			<!-- 身体 -->
			<ellipse cx="60" cy="68" rx="42" ry="36" fill="#fbcfe8" />
			<ellipse cx="60" cy="68" rx="42" ry="36" fill="url(#piggy-body-grad)" />
			<!-- 耳朵 -->
			<ellipse cx="32" cy="38" rx="10" ry="12" fill="#f9a8d4" transform="rotate(-18 32 38)" />
			<ellipse cx="88" cy="38" rx="10" ry="12" fill="#f9a8d4" transform="rotate(18 88 38)" />
			<ellipse cx="32" cy="40" rx="6" ry="7" fill="#fce7f3" transform="rotate(-18 32 40)" />
			<ellipse cx="88" cy="40" rx="6" ry="7" fill="#fce7f3" transform="rotate(18 88 40)" />
			<!-- 存钱罐槽 -->
			<rect x="52" y="28" width="16" height="4" rx="2" fill="#be185d" opacity="0.35" />
			<!-- 硬币 -->
			<circle cx="60" cy="24" r="7" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5" />
			<text x="60" y="27" text-anchor="middle" font-size="8" fill="#b45309" font-weight="bold">¥</text>
			<!-- 腮红 -->
			<ellipse cx="38" cy="72" rx="8" ry="5" fill="#fda4af" opacity="0.55" />
			<ellipse cx="82" cy="72" rx="8" ry="5" fill="#fda4af" opacity="0.55" />
			<!-- 眼睛 -->
			<circle cx="46" cy="62" r="5" fill="#831843" />
			<circle cx="74" cy="62" r="5" fill="#831843" />
			<circle cx="47.5" cy="60.5" r="1.8" fill="#fff" />
			<circle cx="75.5" cy="60.5" r="1.8" fill="#fff" />
			<!-- 鼻子 -->
			<ellipse cx="60" cy="74" rx="9" ry="7" fill="#f472b6" />
			<circle cx="56" cy="74" r="2" fill="#be185d" opacity="0.5" />
			<circle cx="64" cy="74" r="2" fill="#be185d" opacity="0.5" />
			<!-- 腿 -->
			<ellipse cx="42" cy="96" rx="8" ry="6" fill="#f9a8d4" />
			<ellipse cx="78" cy="96" rx="8" ry="6" fill="#f9a8d4" />
			<!-- 尾巴 -->
			<path
				d="M98 68 Q108 58 104 48 Q100 58 98 68"
				stroke="#f9a8d4"
				stroke-width="4"
				stroke-linecap="round"
				fill="none"
			/>
			<defs>
				<linearGradient id="piggy-body-grad" x1="20" y1="40" x2="100" y2="100">
					<stop offset="0%" stop-color="#fce7f3" stop-opacity="0.6" />
					<stop offset="100%" stop-color="#f9a8d4" stop-opacity="0.15" />
				</linearGradient>
			</defs>
		</svg>
		<span v-if="happy" class="piggy-sparkle piggy-sparkle--1">✨</span>
		<span v-if="happy" class="piggy-sparkle piggy-sparkle--2">💕</span>
	</div>
</template>

<script setup>
	defineProps({
		size: { type: Number, default: 64 },
		happy: { type: Boolean, default: false },
		floating: { type: Boolean, default: true }
	})
</script>

<style scoped lang="scss">
	.piggy-mascot {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		svg {
			width: 100%;
			height: 100%;
			display: block;
			filter: drop-shadow(0 4px 8px rgba(236, 72, 153, 0.25));
		}

		&.floating {
			animation: fit-float 3.2s ease-in-out infinite;
		}

		&.happy {
			animation: fit-float 2.8s ease-in-out infinite, fit-wiggle 4s ease-in-out infinite;
		}
	}

	.piggy-sparkle {
		position: absolute;
		font-size: 0.75rem;
		line-height: 1;
		pointer-events: none;
		animation: fit-sparkle 2s ease-in-out infinite;

		&--1 {
			top: 0;
			right: -2px;
		}

		&--2 {
			bottom: 8%;
			left: -4px;
			animation-delay: 0.6s;
		}
	}
</style>
