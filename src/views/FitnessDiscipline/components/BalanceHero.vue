<template>
    <header class="balance-hero">
        <p class="hero-label">
            <template v-if="isSimMode">预览 · 第 {{ simDay }} 课次</template>
        </p>

        <p class="hero-balance" :class="{ 'is-sim-today': isSimMode && !todayRecord }">
            <template v-if="isSimMode && simEarnings">
                <span class="currency">+</span>¥{{ formatMoney(simEarnings.todayAmount) }}
            </template>
            <template v-else>
                <span class="currency">¥</span>{{ formatMoney(state.totalMoney) }}
            </template>
        </p>

        <p class="hero-caption">
            <template v-if="isSimMode && simEarnings">今日完成打卡可得</template>
            <template v-else-if="todayStatus === 'half'">今日已记未达标 · 无金额变动</template>
            <template v-else-if="todayMoneyChange !== 0">
                今日账目 {{ todayMoneyChange > 0 ? '+' : '' }}{{ todayMoneyChange }} 元
            </template>
            <template v-else-if="canComplete">
                完成今日训练约 +¥{{ formatMoney(liveEarnings.todayAmount) }}
            </template>
            <template v-else>当前存钱罐余额</template>
        </p>

        <div class="hero-panel">
            <template v-if="isSimMode && simEarnings">
                <div class="hero-stat-row">
                    <div class="hero-stat">
                        <span class="hero-stat-label">此前累计</span>
                        <span class="hero-stat-val">¥{{ formatMoney(simEarnings.cumulativeTotal) }}</span>
                        <span class="hero-stat-hint">已完成 {{ simDay }} 次</span>
                    </div>
                    <div class="hero-stat accent">
                        <span class="hero-stat-label">完成后总余额</span>
                        <span class="hero-stat-val">¥{{ formatMoney(simEarnings.afterTodayTotal) }}</span>
                        <span class="hero-stat-hint">含今日 +{{ formatMoney(simEarnings.todayAmount) }}</span>
                    </div>
                </div>
                <div v-if="simEarnings.todayParts.length" class="hero-detail-block">
                    <p class="hero-detail-title">今日收益明细</p>
                    <ul class="hero-detail-list">
                        <li v-for="(part, i) in simEarnings.todayParts" :key="i">{{ part }}</li>
                    </ul>
                </div>
                <div v-if="simEarnings.cumulativeBreakdown" class="hero-detail-block">
                    <p class="hero-detail-title">累计 {{ simDay }} 次收益构成</p>
                    <ul class="hero-breakdown-grid">
                        <li>
                            <span>每日基础</span>
                            <strong>¥{{ formatMoney(simEarnings.cumulativeBreakdown.dailyBase) }}</strong>
                        </li>
                        <li>
                            <span>升阶/收官</span>
                            <strong>¥{{ formatMoney(simEarnings.cumulativeBreakdown.stepMeso) }}</strong>
                        </li>
                        <li>
                            <span>连续7天</span>
                            <strong>¥{{ formatMoney(simEarnings.cumulativeBreakdown.streak) }}</strong>
                        </li>
                        <li>
                            <span>动作进阶</span>
                            <strong>¥{{ formatMoney(simEarnings.cumulativeBreakdown.variant) }}</strong>
                        </li>
                        <li class="wide">
                            <span>放松周</span>
                            <strong>¥{{ formatMoney(simEarnings.cumulativeBreakdown.deload) }}</strong>
                        </li>
                    </ul>
                </div>
            </template>
            <template v-else>
                <div v-if="canComplete" class="hero-stat-row single">
                    <div class="hero-stat accent">
                        <span class="hero-stat-label">今日完成预估</span>
                        <span class="hero-stat-val">+¥{{ formatMoney(liveEarnings.todayAmount) }}</span>
                        <span class="hero-stat-hint">
                            再连续 {{ streakDaysToBonus }} 次 +{{ REWARDS.STREAK_7 }} 元
                        </span>
                    </div>
                </div>
                <div v-if="canComplete && liveEarnings.todayParts.length" class="hero-detail-block">
                    <p class="hero-detail-title">今日收益明细</p>
                    <ul class="hero-detail-list">
                        <li v-for="(part, i) in liveEarnings.todayParts" :key="i">{{ part }}</li>
                    </ul>
                </div>
            </template>
        </div>
    </header>
</template>

<script setup>
import { inject } from 'vue'
import { REWARDS } from '@/constants/fitness'
import { FITNESS_DISCIPLINE_KEY } from '../keys'

const {
    state,
    canComplete,
    todayMoneyChange,
    todayStatus,
    todayRecord,
    isSimMode,
    simDay,
    simEarnings,
    liveEarnings,
    streakDaysToBonus
} = inject(FITNESS_DISCIPLINE_KEY)

const formatMoney = (n) => Number(n).toFixed(2).replace(/\.00$/, '')
</script>

<style scoped lang="scss">
.balance-hero {
    text-align: center;
    padding: 0.25rem 0 0;
}

.hero-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 8px rgba(124, 45, 18, 0.35);
    margin-bottom: 0.35rem;
}

.hero-balance {
    font-size: 2.5rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1.1;
    text-shadow: 0 2px 12px rgba(124, 45, 18, 0.4);

    .currency {
        font-size: 1.375rem;
        font-weight: 700;
        margin-right: 0.125rem;
    }

    &.is-sim-today {
        color: #fef9c3;
    }
}

.hero-caption {
    margin-top: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #fff7ed;
    text-shadow: 0 1px 4px rgba(124, 45, 18, 0.25);
}

.hero-panel {
    margin-top: 0.875rem;
    padding: 0.875rem;
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 8px 32px rgba(124, 45, 18, 0.18);
    text-align: left;
}

.hero-stat-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;

    &.single {
        grid-template-columns: 1fr;
    }
}

.hero-stat {
    padding: 0.75rem;
    border-radius: 0.75rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;

    &.accent {
        background: #fff7ed;
        border-color: #fed7aa;
    }
}

.hero-stat-label {
    display: block;
    font-size: 0.6875rem;
    font-weight: 600;
    color: #64748b;
}

.hero-stat-val {
    display: block;
    margin-top: 0.2rem;
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
}

.hero-stat.accent .hero-stat-val {
    color: #c2410c;
}

.hero-stat-hint {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.625rem;
    color: #94a3b8;
    line-height: 1.4;
}

.hero-detail-block {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px dashed #e2e8f0;

    &:first-child {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
    }
}

.hero-detail-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 0.35rem;
}

.hero-detail-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
        font-size: 0.75rem;
        color: #334155;
        line-height: 1.45;
        margin-bottom: 0.2rem;
    }
}

.hero-breakdown-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem;

    li {
        display: flex;
        justify-content: space-between;
        font-size: 0.6875rem;
        color: #475569;
        padding: 0.35rem 0.45rem;
        background: #f8fafc;
        border-radius: 0.35rem;

        &.wide {
            grid-column: 1 / -1;
        }
    }

    strong {
        color: #0f172a;
        font-weight: 700;
    }
}
</style>
