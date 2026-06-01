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

usePageBodyClass('fitness-page-active')

const fitness = useFitnessDiscipline()
provide(FITNESS_DISCIPLINE_KEY, fitness)

const {
    toast,
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
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'records', label: '台账', icon: '📒' },
    { id: 'settings', label: '规则', icon: '⚙️' }
]

watch(activeTab, (tab) => {
    setPageTitle(FITNESS_TAB_TITLES[tab] || FITNESS_TAB_TITLES.home)
}, { immediate: true })

</script>

<style scoped lang="scss">
.fitness-discipline {
    position: relative;
    min-height: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff7ed;
    --app-footer-stack: calc(4.75rem + var(--safe-bottom));
}

.fitness-bg {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse 120% 80% at 50% -20%, rgba(251, 146, 60, 0.4), transparent 55%),
        radial-gradient(ellipse 80% 50% at 0% 0%, rgba(244, 114, 182, 0.18), transparent 45%),
        linear-gradient(180deg, #ea580c 0%, #fb923c 26%, #fff7ed 42%);
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
        letter-spacing: 0.02em;
        text-shadow: 0 1px 8px rgba(124, 45, 18, 0.35);
    }

    p {
        font-size: 0.8125rem;
        font-weight: 500;
        color: #fff7ed;
        margin-top: 0.25rem;
        text-shadow: 0 1px 4px rgba(124, 45, 18, 0.25);
    }
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

.fitness-main {
    position: relative;
    z-index: 1;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding: 0 1rem 1rem;
    padding-bottom: calc(5rem + var(--safe-bottom));
}

.bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    display: flex;
    padding: 0.5rem 0.75rem calc(0.5rem + var(--safe-bottom));
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    border-top: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.06);
}

.nav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.375rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0.75rem;
    transition: background 0.15s;

    &.active {
        background: #ffedd5;

        .nav-label {
            color: #ea580c;
            font-weight: 700;
        }
    }
}

.nav-icon {
    font-size: 1.25rem;
    line-height: 1;
}

.nav-label {
    font-size: 0.6875rem;
    color: #64748b;
}
</style>

<style lang="scss">
body.fitness-page-active {
    overflow: auto;
    background: #fff7ed;
}
</style>
