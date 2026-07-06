<template>
	<div class="fitness-discipline">
		<div class="fitness-bg" aria-hidden="true">
			<span class="bg-cloud bg-cloud--1">☁️</span>
			<span class="bg-cloud bg-cloud--2">☁️</span>
			<span class="bg-star bg-star--1">✦</span>
			<span class="bg-star bg-star--2">✧</span>
			<span class="bg-star bg-star--3">✦</span>
		</div>

		<header class="app-header">
			<div class="header-brand">
				<PiggyBankMascot :size="44" :floating="false" class="header-mascot" />
				<div class="header-text">
					<h1>{{ APP_NAME }}</h1>
					<p>{{ APP_TAGLINE }}</p>
				</div>
			</div>
		</header>

		<div v-if="isSimMode" class="sim-banner" role="status">
			<span class="sim-icon">🔮</span>
			<span class="sim-text">
				预览模式：模拟第 {{ simDay }} 课次（真实已完成 {{ state.totalCheckDays }} 次）
			</span>
			<router-link class="sim-exit" :to="{ path: '/fitness' }">退出预览</router-link>
		</div>

		<main class="fitness-main">
			<HomeTab v-show="activeTab === 'home'" />
			<RecordsTab v-show="activeTab === 'records'" />
			<SettingsTab v-show="activeTab === 'settings'" />
		</main>

		<nav class="bottom-nav" aria-label="页面导航">
			<button
				v-for="item in navItems"
				:key="item.id"
				type="button"
				class="nav-btn"
				:class="{ active: activeTab === item.id }"
				@click="activeTab = item.id"
			>
				<span class="nav-bubble" aria-hidden="true" />
				<span class="nav-icon">{{ item.icon }}</span>
				<span class="nav-label">{{ item.label }}</span>
			</button>
		</nav>

		<AppToast :message="toast" variant="fitness" anchor="footer" />

		<FitnessCelebration :tick="celebrationTick" />

		<SurpriseRewardModal
			:visible="showSurpriseModal"
			:tier="activeSurpriseTier"
			:continue-days="state.continueDays"
			@redeem="redeemSurpriseReward"
			@later="dismissSurpriseModal"
		/>
	</div>
</template>

<script setup>
	import { ref, provide, watch } from 'vue'
	import { APP_NAME, APP_TAGLINE } from '@/constants/fitness'
	import { FITNESS_TAB_TITLES, setPageTitle } from '@/utils/pageTitle'
	import { useFitnessDiscipline } from '@/composables/useFitnessDiscipline'
	import { FITNESS_DISCIPLINE_KEY } from './keys'
	import HomeTab from './tabs/HomeTab.vue'
	import RecordsTab from './tabs/RecordsTab.vue'
	import SettingsTab from './tabs/SettingsTab.vue'
	import AppToast from '@/components/AppToast/index.vue'
	import { usePageBodyClass } from '@/composables/usePageBodyClass'
	import SurpriseRewardModal from './components/SurpriseRewardModal.vue'
	import FitnessCelebration from './components/FitnessCelebration.vue'
	import PiggyBankMascot from './components/PiggyBankMascot.vue'
	import './fitness-cute-theme.scss'

	usePageBodyClass('fitness-page-active')

	const fitness = useFitnessDiscipline()
	provide(FITNESS_DISCIPLINE_KEY, fitness)

	const {
		toast,
		celebrationTick,
		isSimMode,
		simDay,
		state,
		showSurpriseModal,
		activeSurpriseTier,
		redeemSurpriseReward,
		dismissSurpriseModal
	} = fitness
	const activeTab = ref('home')

	const navItems = [
		{ id: 'home', label: '首页', icon: '🏡' },
		{ id: 'records', label: '台账', icon: '💰' },
		{ id: 'settings', label: '规则', icon: '📖' }
	]

	watch(
		activeTab,
		(tab) => {
			setPageTitle(FITNESS_TAB_TITLES[tab] || FITNESS_TAB_TITLES.home)
		},
		{ immediate: true }
	)
</script>

<style scoped lang="scss">
	.fitness-discipline {
		position: relative;
		min-height: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: var(--fit-cream, #fff9fb);
		--app-footer-stack: calc(4.75rem + var(--safe-bottom));
	}

	.fitness-bg {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.55) 0, transparent 8%),
			radial-gradient(circle at 88% 12%, rgba(255, 255, 255, 0.45) 0, transparent 6%),
			radial-gradient(circle at 72% 42%, rgba(255, 255, 255, 0.35) 0, transparent 5%),
			radial-gradient(circle at 24% 55%, rgba(255, 255, 255, 0.3) 0, transparent 4%),
			radial-gradient(ellipse 110% 75% at 50% -18%, rgba(251, 207, 232, 0.7), transparent 52%),
			radial-gradient(ellipse 55% 40% at 92% 8%, rgba(254, 215, 170, 0.5), transparent 42%),
			radial-gradient(ellipse 45% 35% at 4% 12%, rgba(196, 181, 253, 0.35), transparent 40%),
			linear-gradient(180deg, #f9a8d4 0%, #fb7185 16%, #fda4af 30%, #fff9fb 44%);
		pointer-events: none;
		overflow: hidden;
	}

	.bg-cloud,
	.bg-star {
		position: absolute;
		opacity: 0.55;
		pointer-events: none;
	}

	.bg-cloud {
		font-size: 1.75rem;
		animation: fit-float 6s ease-in-out infinite;

		&--1 {
			top: 8%;
			left: 6%;
		}

		&--2 {
			top: 14%;
			right: 8%;
			font-size: 1.25rem;
			animation-delay: 1.2s;
			opacity: 0.4;
		}
	}

	.bg-star {
		color: rgba(255, 255, 255, 0.85);
		font-size: 0.875rem;
		animation: fit-sparkle 4s ease-in-out infinite;

		&--1 {
			top: 22%;
			left: 18%;
		}

		&--2 {
			top: 10%;
			right: 22%;
			animation-delay: 0.8s;
		}

		&--3 {
			top: 28%;
			right: 12%;
			font-size: 0.65rem;
			animation-delay: 1.6s;
		}
	}

	.app-header {
		position: relative;
		z-index: 1;
		padding: calc(0.65rem + var(--safe-top)) 1.25rem 0.5rem;
	}

	.header-brand {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
	}

	.header-mascot {
		filter: drop-shadow(0 4px 12px rgba(190, 24, 93, 0.3));
	}

	.header-text {
		text-align: left;
	}

	.app-header h1 {
		font-size: 1.375rem;
		color: #fff;
		text-shadow: 0 2px 12px rgba(190, 24, 93, 0.35);
		line-height: 1.2;
	}

	.app-header p {
		font-size: 0.75rem;
		font-weight: 600;
		color: #fff7ed;
		margin-top: 0.15rem;
		text-shadow: 0 1px 4px rgba(190, 24, 93, 0.2);
		opacity: 0.95;
	}

	.fitness-main {
		position: relative;
		z-index: 1;
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
		padding: 0 1rem 1rem;
		padding-bottom: calc(5.5rem + var(--safe-bottom));
	}

	.sim-banner {
		position: relative;
		z-index: 2;
		margin: 0 1rem 0.625rem;
		padding: 0.625rem 0.875rem;
		border-radius: var(--fit-radius-md, 1.375rem);
		background: linear-gradient(135deg, #312e81, #4338ca);
		color: #eef2ff;
		font-size: 0.8125rem;
		font-weight: 600;
		line-height: 1.5;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border: 2px dashed rgba(199, 210, 254, 0.45);
		box-shadow: 0 6px 20px rgba(67, 56, 202, 0.25);
	}

	.sim-icon {
		flex-shrink: 0;
		font-size: 1.125rem;
	}

	.sim-text {
		flex: 1;
		min-width: 0;
	}

	.sim-exit {
		flex-shrink: 0;
		padding: 0.3rem 0.6rem;
		border-radius: var(--fit-radius-pill, 999px);
		background: rgba(255, 255, 255, 0.15);
		color: #fde68a;
		font-size: 0.75rem;
		font-weight: 700;
		text-decoration: none;
		border: 1px dashed rgba(253, 224, 71, 0.45);

		&:active {
			background: rgba(255, 255, 255, 0.25);
		}
	}

	.bottom-nav {
		position: fixed;
		left: 0.75rem;
		right: 0.75rem;
		bottom: calc(0.5rem + var(--safe-bottom));
		z-index: 100;
		display: flex;
		gap: 0.25rem;
		padding: 0.4rem;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(18px);
		border: 2px dashed var(--fit-card-border, rgba(249, 168, 212, 0.38));
		border-radius: var(--fit-radius-xl, 2rem);
		box-shadow: var(--fit-shadow, 0 12px 36px rgba(249, 168, 212, 0.2));
	}

	.nav-btn {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		padding: 0.45rem 0.375rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: var(--fit-radius-lg, 1.75rem);
		transition:
			transform 0.25s var(--fit-bounce, cubic-bezier(0.34, 1.56, 0.64, 1)),
			background 0.2s ease;

		&:active {
			transform: scale(0.94);
		}

		&.active {
			.nav-bubble {
				opacity: 1;
				transform: scale(1);
			}

			.nav-icon {
				animation: fit-nav-pop 0.45s var(--fit-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
			}

			.nav-label {
				color: var(--fit-text-accent, #ec4899);
				font-weight: 800;
			}
		}
	}

	.nav-bubble {
		position: absolute;
		inset: 0.2rem 0.15rem;
		border-radius: var(--fit-radius-lg, 1.75rem);
		background: linear-gradient(135deg, var(--fit-pink-light, #fce7f3), var(--fit-peach-light, #ffedd5));
		border: 2px dashed rgba(249, 168, 212, 0.35);
		opacity: 0;
		transform: scale(0.85);
		transition:
			opacity 0.25s ease,
			transform 0.25s var(--fit-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
		z-index: 0;
	}

	.nav-icon {
		position: relative;
		z-index: 1;
		font-size: 1.5rem;
		line-height: 1;
	}

	.nav-label {
		position: relative;
		z-index: 1;
		font-size: 0.6875rem;
		color: #a8a29e;
		font-weight: 600;
	}
</style>

<style lang="scss">
	body.fitness-page-active {
		overflow: auto;
		background: #fff9fb;
	}
</style>
