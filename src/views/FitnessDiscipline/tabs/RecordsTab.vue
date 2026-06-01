<template>
	<div class="records-tab">
		<header class="tab-header">
			<h2>打卡台账</h2>
			<p>
				共 {{ sortedRecords.length }} 条 · 打卡 {{ workoutRecordCount }} · 兑换
				{{ redeemRecordCount }}
			</p>
		</header>

		<section class="redeem-bar card">
			<div class="redeem-bar-info">
				<span class="redeem-bar-label">当前余额</span>
				<span class="redeem-bar-balance">¥{{ formatMoney(state.totalMoney) }}</span>
				<span v-if="totalRedeemed > 0" class="redeem-bar-hint">
					已累计兑换 ¥{{ formatMoney(totalRedeemed) }}
				</span>
			</div>
			<button
				type="button"
				class="redeem-bar-btn"
				:disabled="!canRedeem"
				@click="showRedeemModal = true"
			>
				兑换奖励
			</button>
		</section>

		<div v-if="!sortedRecords.length" class="empty">
			<span class="empty-icon">📋</span>
			<p>还没有记录</p>
			<p class="empty-hint">完成打卡或兑换后，明细会出现在这里</p>
		</div>

		<ul v-else class="record-list">
			<li
				v-for="record in sortedRecords"
				:key="`${record.date}-${record.status}-${record.createdAt ?? ''}`"
				class="record-item"
				:class="{ 'is-redeem': record.status === RECORD_STATUS.REDEEM }"
			>
				<div class="record-top">
					<span class="record-date">{{ formatRecordDate(record) }}</span>
					<span class="record-status" :class="record.status">
						{{ statusLabel(record.status) }}
					</span>
				</div>
				<p class="record-remark">{{ record.remark }}</p>
				<div class="record-bottom">
					<span
						class="record-money"
						:class="{
							gain: record.moneyChange > 0,
							loss: record.moneyChange < 0,
							zero: record.moneyChange === 0
						}"
					>
						{{ formatChange(record.moneyChange) }}
					</span>
					<span class="record-balance">余额 ¥{{ formatMoney(record.afterMoney) }}</span>
				</div>
			</li>
		</ul>

		<RedeemModal
			:visible="showRedeemModal"
			:balance="state.totalMoney"
			@confirm="onRedeem"
			@cancel="showRedeemModal = false"
		/>
	</div>
</template>

<script setup>
	import { ref, computed, inject } from 'vue'
	import { RECORD_STATUS } from '@/constants/fitness'
	import { FITNESS_DISCIPLINE_KEY } from '../keys'
	import RedeemModal from '../components/RedeemModal.vue'

	const { state, sortedRecords, canRedeem, redeemReward } = inject(FITNESS_DISCIPLINE_KEY)

	const showRedeemModal = ref(false)

	const WORKOUT_STATUSES = [RECORD_STATUS.FINISH, RECORD_STATUS.SKIP, RECORD_STATUS.HALF]

	const workoutRecordCount = computed(
		() => sortedRecords.value.filter((r) => WORKOUT_STATUSES.includes(r.status)).length
	)

	const redeemRecordCount = computed(
		() => sortedRecords.value.filter((r) => r.status === RECORD_STATUS.REDEEM).length
	)

	const totalRedeemed = computed(() =>
		sortedRecords.value
			.filter((r) => r.status === RECORD_STATUS.REDEEM)
			.reduce((sum, r) => sum + Math.abs(r.moneyChange), 0)
	)

	const statusMap = {
		[RECORD_STATUS.FINISH]: '完成',
		[RECORD_STATUS.SKIP]: '缺席',
		[RECORD_STATUS.HALF]: '未达标',
		[RECORD_STATUS.REDEEM]: '兑换'
	}

	const statusLabel = (status) => statusMap[status] ?? status

	const formatMoney = (n) => Number(n).toFixed(2).replace(/\.00$/, '')

	const formatChange = (n) => {
		if (n > 0) return `+${n} 元`
		if (n < 0) return `${n} 元`
		return '无变动'
	}

	const formatDisplayDate = (key) => {
		const [y, m, d] = key.split('-')
		const date = new Date(Number(y), Number(m) - 1, Number(d))
		const weekdays = ['日', '一', '二', '三', '四', '五', '六']
		return `${m}月${d}日 周${weekdays[date.getDay()]}`
	}

	const formatRecordDate = (record) => {
		const base = formatDisplayDate(record.date)
		if (record.status === RECORD_STATUS.REDEEM && record.createdAt) {
			const t = new Date(record.createdAt)
			const hh = String(t.getHours()).padStart(2, '0')
			const mm = String(t.getMinutes()).padStart(2, '0')
			return `${base} ${hh}:${mm}`
		}
		return base
	}

	const onRedeem = ({ amount, note }) => {
		const result = redeemReward({ amount, note })
		if (result?.ok) showRedeemModal.value = false
	}
</script>

<style scoped lang="scss">
	.records-tab {
		min-height: 100%;
	}

	.tab-header {
		margin-bottom: 0.875rem;

		h2 {
			font-size: 1.25rem;
			font-weight: 800;
			color: #0f172a;
		}

		p {
			font-size: 0.8125rem;
			color: #64748b;
			margin-top: 0.25rem;
			line-height: 1.5;
		}
	}

	.card {
		background: #fff;
		border-radius: 1rem;
		box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
	}

	.redeem-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.redeem-bar-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.redeem-bar-label {
		font-size: 0.75rem;
		color: #64748b;
	}

	.redeem-bar-balance {
		font-size: 1.375rem;
		font-weight: 800;
		color: #c2410c;
		line-height: 1.2;
	}

	.redeem-bar-hint {
		font-size: 0.6875rem;
		color: #94a3b8;
	}

	.redeem-bar-btn {
		flex-shrink: 0;
		padding: 0.625rem 1rem;
		border: none;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, #fef3c7, #fde68a);
		color: #92400e;
		font-size: 0.875rem;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;

		&:disabled {
			opacity: 0.45;
			cursor: not-allowed;
		}

		&:active:not(:disabled) {
			transform: scale(0.98);
		}
	}

	.empty {
		text-align: center;
		padding: 3rem 1rem;
		color: #94a3b8;

		.empty-icon {
			font-size: 2.5rem;
			display: block;
			margin-bottom: 0.75rem;
		}

		.empty-hint {
			font-size: 0.8125rem;
			margin-top: 0.25rem;
		}
	}

	.record-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.record-item {
		background: #fff;
		border-radius: 0.875rem;
		padding: 1rem;
		box-shadow: 0 2px 12px rgba(15, 23, 42, 0.05);

		&.is-redeem {
			border: 1px solid #fde68a;
			background: linear-gradient(180deg, #fff 0%, #fffbeb 100%);
		}
	}

	.record-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.375rem;
	}

	.record-date {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #0f172a;
	}

	.record-status {
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.2rem 0.5rem;
		border-radius: 999px;

		&.finish {
			background: #d1fae5;
			color: #047857;
		}

		&.skip {
			background: #fee2e2;
			color: #b91c1c;
		}

		&.half {
			background: #f1f5f9;
			color: #64748b;
		}

		&.redeem {
			background: #fde68a;
			color: #92400e;
		}
	}

	.record-remark {
		font-size: 0.8125rem;
		color: #64748b;
		line-height: 1.5;
		margin-bottom: 0.625rem;
	}

	.record-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.record-money {
		font-size: 1rem;
		font-weight: 800;

		&.gain {
			color: #059669;
		}
		&.loss {
			color: #dc2626;
		}
		&.zero {
			color: #94a3b8;
			font-weight: 600;
			font-size: 0.875rem;
		}
	}

	.record-balance {
		font-size: 0.75rem;
		color: #94a3b8;
	}
</style>
