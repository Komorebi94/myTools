<template>
	<div class="fitness-discipline">
		<div class="fitness-bg" aria-hidden="true" />

		<header class="app-header">
			<h1>{{ APP_NAME }}</h1>
			<p>{{ APP_TAGLINE }}</p>
		</header>

		<div v-if="isSimMode" class="sim-banner" role="status">
			预览模式：模拟第 {{ simDay }} 课次（真实已完成 {{ state.totalCheckDays }} 次）
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
		background: #fff5f7;
		--app-footer-stack: calc(4.75rem + var(--safe-bottom));
		--fit-pink: #f472b6;
		--fit-pink-dark: #ec4899;
		--fit-peach: #fb923c;
		--fit-cream: #fff5f7;
		--fit-peach-light: #ffedd5;
		--fit-pink-light: #fce7f3;
		--fit-lavender: #ede9fe;
		--fit-card-border: rgba(244, 114, 182, 0.18);
		--fit-shadow: 0 8px 28px rgba(244, 114, 182, 0.14);
		--fit-text-accent: #db2777;
		--fit-text-warm: #be185d;
	}

	.fitness-bg {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 110% 75% at 50% -18%, rgba(251, 207, 232, 0.65), transparent 52%),
			radial-gradient(ellipse 55% 40% at 92% 8%, rgba(254, 215, 170, 0.45), transparent 42%),
			radial-gradient(ellipse 45% 35% at 4% 12%, rgba(196, 181, 253, 0.3), transparent 40%),
			linear-gradient(180deg, #f472b6 0%, #fb7185 18%, #fda4af 32%, #fff5f7 46%);
		pointer-events: none;
	}

	.app-header {
		position: relative;
		z-index: 1;
		padding: calc(0.75rem + var(--safe-top)) 1.25rem 0.5rem;
		text-align: center;

		h1 {
			font-size: 1.25rem;
			font-weight: 800;
			color: #fff;
			letter-spacing: 0.03em;
			text-shadow: 0 2px 10px rgba(190, 24, 93, 0.35);
		}

		p {
			font-size: 0.8125rem;
			font-weight: 500;
			color: #fff1f2;
			margin-top: 0.25rem;
			text-shadow: 0 1px 4px rgba(190, 24, 93, 0.2);
		}
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
		border-radius: 0.75rem;
		background: #1e293b;
		color: #f8fafc;
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1.5;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		box-shadow: 0 4px 16px rgba(15, 23, 42, 0.2);
	}

	.sim-exit {
		flex-shrink: 0;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		background: #334155;
		color: #fdba74;
		font-size: 0.75rem;
		font-weight: 700;
		text-decoration: none;

		&:active {
			background: #475569;
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
		padding: 0.375rem;
		background: rgba(255, 255, 255, 0.88);
		backdrop-filter: blur(16px);
		border: 1.5px solid var(--fit-card-border);
		border-radius: 1.25rem;
		box-shadow: 0 8px 32px rgba(244, 114, 182, 0.18);
	}

	.nav-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		padding: 0.45rem 0.375rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: 1rem;
		transition:
			background 0.2s ease,
			transform 0.15s ease;

		&:active {
			transform: scale(0.96);
		}

		&.active {
			background: linear-gradient(135deg, var(--fit-pink-light), var(--fit-peach-light));

			.nav-label {
				color: var(--fit-text-accent);
				font-weight: 700;
			}
		}
	}

	.nav-icon {
		font-size: 1.375rem;
		line-height: 1;
	}

	.nav-label {
		font-size: 0.6875rem;
		color: #94a3b8;
		font-weight: 500;
	}
</style>

<style lang="scss">
	body.fitness-page-active {
		overflow: auto;
		background: #fff5f7;
	}
</style>
