<template>
	<header class="balance-hero">
		<div class="hero-top">
			<PiggyBankMascot
				:size="76"
				:happy="canComplete && !isSimMode"
				class="hero-mascot"
			/>
			<div class="hero-amount-wrap">
				<p class="hero-label">
					<template v-if="isSimMode">预览 · 第 {{ simDay }} 课次</template>
					<template v-else>🪙 存钱罐余额</template>
				</p>

				<p class="hero-balance" :class="{ 'is-sim-today': isSimMode && !todayRecord }">
					<template v-if="isSimMode && simEarnings">
						<span class="currency">+</span>¥{{ formatMoney(simEarnings.todayAmount) }}
					</template>
					<template v-else>
						<span class="currency">¥</span>{{ formatMoney(state.totalMoney) }}
					</template>
					<span v-if="showCoinPop" class="coin-pop" aria-hidden="true">🪙</span>
				</p>

				<p class="hero-caption">
					<template v-if="isSimMode && simEarnings">今日完成打卡可得</template>
					<template v-else-if="todayStatus === 'half'">今日已记未达标 · 罐子里没变化哦</template>
					<template v-else-if="todayMoneyChange !== 0">
						今日账目 {{ todayMoneyChange > 0 ? '+' : '' }}{{ todayMoneyChange }} 元
					</template>
					<template v-else-if="canComplete">
						完成今日训练约 +¥{{ formatMoney(liveEarnings.todayAmount) }}
					</template>
					<template v-else>继续加油，小猪在等你～</template>
				</p>
			</div>
		</div>

		<div class="hero-panel fit-sticker-card">
			<span class="card-deco card-deco--tr" aria-hidden="true">💰</span>
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
						<span class="hero-stat-hint">
							含今日 +{{ formatMoney(simEarnings.todayAmount) }}
						</span>
					</div>
				</div>
				<div v-if="simEarnings.todayParts.length" class="hero-detail-block">
					<p class="hero-detail-title">✨ 今日收益明细</p>
					<ul class="hero-detail-list">
						<li v-for="(part, i) in simEarnings.todayParts" :key="i">{{ part }}</li>
					</ul>
				</div>
				<div v-if="simEarnings.cumulativeBreakdown" class="hero-detail-block">
					<p class="hero-detail-title">📊 累计 {{ simDay }} 次收益构成</p>
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
							<span>累计7次</span>
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
					<p class="hero-detail-title">✨ 今日收益明细</p>
					<ul class="hero-detail-list">
						<li v-for="(part, i) in liveEarnings.todayParts" :key="i">{{ part }}</li>
					</ul>
				</div>
				<div v-else-if="todayRecord" class="hero-done">
					<div class="hero-stat-row single">
						<div
							class="hero-stat accent"
							:class="{
								loss: todayStatus === RECORD_STATUS.SKIP,
								neutral: todayStatus === RECORD_STATUS.HALF
							}"
						>
							<span class="hero-stat-label">{{ todayPanelTitle }}</span>
							<span class="hero-stat-val">
								<template v-if="todayMoneyChange > 0">
									+¥{{ formatMoney(todayMoneyChange) }}
								</template>
								<template v-else-if="todayMoneyChange < 0">
									{{ todayMoneyChange }} 元
								</template>
								<template v-else>无变动</template>
							</span>
							<span v-if="todayStatus === RECORD_STATUS.FINISH" class="hero-stat-hint">
								已连续完成 {{ state.continueDays }} 次 · 明日再来打卡吧
							</span>
							<span v-else-if="todayStatus === RECORD_STATUS.SKIP" class="hero-stat-hint">
								连续完成次数已清零
							</span>
							<span v-else class="hero-stat-hint">连续完成 {{ state.continueDays }} 次 · 今日不可再打卡</span>
						</div>
					</div>
					<div v-if="todayRemarkParts.length" class="hero-detail-block">
						<p class="hero-detail-title">📝 今日记录明细</p>
						<ul class="hero-detail-list">
							<li v-for="(part, i) in todayRemarkParts" :key="i">{{ part }}</li>
						</ul>
					</div>
				</div>
			</template>
		</div>
	</header>
</template>

<script setup>
	import { ref, inject, watch, computed } from 'vue'
	import { REWARDS, RECORD_STATUS } from '@/constants/fitness'
	import { FITNESS_DISCIPLINE_KEY } from '../keys'
	import PiggyBankMascot from './PiggyBankMascot.vue'

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

	const showCoinPop = ref(false)

	const todayRemarkParts = computed(() => {
		const remark = todayRecord.value?.remark?.trim()
		if (!remark) return []
		return remark.split(' · ').filter(Boolean)
	})

	const todayPanelTitle = computed(() => {
		switch (todayStatus.value) {
			case RECORD_STATUS.FINISH:
				return '✅ 今日已完成'
			case RECORD_STATUS.SKIP:
				return '😴 今日已缺席'
			case RECORD_STATUS.HALF:
				return '😅 今日未达标'
			default:
				return '今日记录'
		}
	})

	watch(todayMoneyChange, (val, prev) => {
		if (val !== prev && val !== 0) {
			showCoinPop.value = true
			setTimeout(() => {
				showCoinPop.value = false
			}, 900)
		}
	})

	const formatMoney = (n) => Number(n).toFixed(2).replace(/\.00$/, '')
</script>

<style scoped lang="scss">
	.balance-hero {
		padding: 0.25rem 0 0;
	}

	.hero-top {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.hero-mascot {
		flex-shrink: 0;
	}

	.hero-amount-wrap {
		text-align: left;
		min-width: 0;
	}

	.hero-label {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #fff;
		text-shadow: 0 1px 8px rgba(124, 45, 18, 0.35);
		margin-bottom: 0.25rem;
	}

	.hero-balance {
		position: relative;
		font-family: var(--fit-font-display, 'ZCOOL KuaiLe', sans-serif);
		font-size: 2.625rem;
		color: #fff;
		letter-spacing: 0.01em;
		line-height: 1.1;
		text-shadow: 0 3px 14px rgba(124, 45, 18, 0.4);

		.currency {
			font-size: 1.5rem;
			margin-right: 0.1rem;
		}

		&.is-sim-today {
			color: #fef9c3;
		}
	}

	.coin-pop {
		position: absolute;
		right: -0.5rem;
		top: -0.25rem;
		font-size: 1.25rem;
		animation: fit-coin-pop 0.9s ease-out forwards;
	}

	.hero-caption {
		margin-top: 0.35rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #fff7ed;
		text-shadow: 0 1px 4px rgba(124, 45, 18, 0.25);
	}

	.hero-panel {
		margin-top: 0.75rem;
		padding: 0.875rem;
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
		border-radius: var(--fit-radius-md, 1.375rem);
		background: var(--fit-cream, #fff9fb);
		border: 2px dashed var(--fit-pink-light, #fce7f3);

		&.accent {
			background: linear-gradient(135deg, #fff9fb, var(--fit-peach-light, #ffedd5));
			border-color: rgba(251, 146, 60, 0.35);
		}

		&.loss {
			background: linear-gradient(135deg, #fff, #fff1f2);
			border-color: rgba(254, 202, 202, 0.55);

			.hero-stat-val {
				color: #dc2626;
			}
		}

		&.neutral {
			background: linear-gradient(135deg, #fff, #fafaf9);
			border-color: rgba(214, 211, 209, 0.55);

			.hero-stat-val {
				color: #78716c;
			}
		}
	}

	.hero-stat-label {
		display: block;
		font-size: 0.6875rem;
		font-weight: 600;
		color: #a8a29e;
	}

	.hero-stat-val {
		display: block;
		margin-top: 0.2rem;
		font-family: var(--fit-font-display, 'ZCOOL KuaiLe', sans-serif);
		font-size: 1.375rem;
		color: var(--fit-text-heading, #831843);
		line-height: 1.2;
	}

	.hero-stat.accent .hero-stat-val {
		color: var(--fit-text-accent, #ec4899);
	}

	.hero-stat-hint {
		display: block;
		margin-top: 0.2rem;
		font-size: 0.625rem;
		color: #a8a29e;
		line-height: 1.4;
	}

	.hero-detail-block {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 2px dashed rgba(249, 168, 212, 0.25);

		&:first-child {
			margin-top: 0;
			padding-top: 0;
			border-top: none;
		}
	}

	.hero-detail-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: #78716c;
		margin-bottom: 0.35rem;
	}

	.hero-detail-list {
		list-style: none;
		padding: 0;
		margin: 0;

		li {
			font-size: 0.75rem;
			color: #57534e;
			line-height: 1.45;
			margin-bottom: 0.2rem;
			padding-left: 0.5rem;
			border-left: 3px solid var(--fit-pink-light, #fce7f3);
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
			color: #57534e;
			padding: 0.4rem 0.5rem;
			background: var(--fit-cream, #fff9fb);
			border-radius: var(--fit-radius-sm, 0.875rem);
			border: 2px dashed var(--fit-pink-light, #fce7f3);

			&.wide {
				grid-column: 1 / -1;
			}
		}

		strong {
			color: var(--fit-text-heading, #831843);
			font-weight: 700;
		}
	}
</style>
