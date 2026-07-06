<template>
	<div class="home-tab">
		<BalanceHero />

		<section class="card tasks-card">
			<div class="card-head">
				<h2>🏋️ 今日训练任务</h2>
				<span class="badge">{{ programMeta.tierLabel }}</span>
			</div>

			<div class="phase-bar">
				<div class="rhythm-row">
					<span class="rhythm-badge" :class="programMeta.rhythmPhase">
						{{ programMeta.rhythmLabel }}
					</span>
					<span class="rhythm-hint">{{ programMeta.rhythmHint }}</span>
				</div>
				<div class="phase-info">
					<span class="phase-name">{{ programMeta.phaseName }}</span>
					<span class="phase-desc">{{ programMeta.phaseDesc }}</span>
				</div>
				<div class="progress-wrap">
					<div class="progress-track">
						<div
							class="progress-fill"
							:style="{ width: `${programMeta.progressPercent}%` }"
						/>
					</div>
					<span class="progress-hint">
						小周期第 {{ programMeta.dayInMeso }}/{{ programMeta.mesocycleLength }} 次
						<template v-if="programMeta.daysToStep > 0">
							· {{ programMeta.daysToStep }} 次后升阶日
						</template>
						<template v-else>· 今日升阶日</template>
					</span>
				</div>
			</div>

			<div class="metrics-row">
				<div class="metric">
					<span class="metric-icon" aria-hidden="true">⏱</span>
					<div>
						<span class="metric-label">预计时长</span>
						<strong>{{ todayPlan.estimatedDurationMin }} 分钟</strong>
					</div>
				</div>
				<div class="metric metric-fire">
					<span class="metric-icon" aria-hidden="true">🔥</span>
					<div>
						<span class="metric-label">预计消耗</span>
						<strong>约 {{ todayPlan.estimatedKcal }} kcal</strong>
					</div>
				</div>
			</div>
			<p class="calorie-disclaimer">{{ calorieDisclaimer }}</p>

			<ul class="task-list">
				<TaskCollapseItem
					v-for="task in todayPlan.tasks"
					:key="task.id"
					:task="task"
					:expanded="expandedTaskIds.has(task.id)"
					@toggle="toggleTask(task.id)"
				/>
			</ul>

			<div v-if="todayPlan.availablePushVariants.length > 1" class="push-picker">
				<p class="picker-label">上肢加难度（可选更难变式，不会倒退）</p>
				<div class="picker-row">
					<button
						v-for="opt in todayPlan.availablePushVariants"
						:key="opt.id"
						type="button"
						class="pick-chip"
						:class="{ active: todayPlan.pushId === opt.id }"
						@click="setPushVariant(opt.id)"
					>
						{{ opt.label.replace('俯卧撑', '') }}
					</button>
				</div>
			</div>
		</section>

		<section class="card rules-mini">
			<h3>🎁 今日奖惩速览</h3>
			<ul>
				<li>
					<span class="tag gain">+{{ programMeta.rewardPreview.todayEstimate }}</span>
					今日完成预估（周期 {{ programMeta.rewardPreview.dailyRange }}）
				</li>
				<li v-if="programMeta.rewardPreview.stepBonus">
					<span class="tag gain">+{{ programMeta.rewardPreview.stepBonus }}</span>
					升阶日额外奖励
				</li>
				<li>
					<span class="tag gain">+{{ REWARDS.EXTRA_COMPLETE }}</span> 超额完成（可选）
				</li>
				<li>
					<span class="tag gain">+{{ REWARDS.VARIANT_UPGRADE }}</span> 动作变式首次进阶
				</li>
				<li>
					<span class="tag loss">{{ REWARDS.DAILY_SKIP }}</span> 缺席摆烂
				</li>
				<li>
					<span class="tag gain">+{{ programMeta.rewardPreview.streakBonus }}</span>
					每累计完成 7 次
				</li>
			</ul>
		</section>

		<section class="actions">
			<button
				type="button"
				class="action-btn complete"
				:disabled="!canComplete || isSimMode"
				@click="openCompleteModal"
			>
				<span class="action-icon">✅</span>
				今日完成打卡
			</button>
			<button
				type="button"
				class="action-btn half"
				:disabled="!canHalf || isSimMode"
				@click="openHalfModal"
			>
				<span class="action-icon">😅</span>
				今日未达标
			</button>
			<button
				type="button"
				class="action-btn skip"
				:disabled="!canSkip || isSimMode"
				@click="openSkipModal"
			>
				<span class="action-icon">😴</span>
				今日放弃打卡
			</button>
			<button
				type="button"
				class="action-btn break"
				:disabled="isSimMode"
				@click="showBreakModal = true"
			>
				<span class="action-icon">⭐</span>
				记录突破
			</button>
		</section>

		<section class="stats-grid">
			<div class="stat-item">
				<span class="stat-value">{{ state.continueDays }}</span>
				<span class="stat-label">连续完成</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{{ state.totalCheckDays }}</span>
				<span class="stat-label">累计完成</span>
			</div>
			<div class="stat-item wide">
				<span class="stat-label">已解锁突破</span>
				<span class="stat-tags">
					<template v-if="unlockedBreakthroughs.length">
						<span v-for="b in unlockedBreakthroughs" :key="b.id" class="mini-tag">{{
							breakthroughShort(b.id)
						}}</span>
					</template>
					<span v-else class="muted">暂无</span>
				</span>
			</div>
		</section>

		<ConfirmModal
			:visible="completeModal"
			title="确认完成今日训练？"
			description="请确认已完成清单内全部动作。超额完成可勾选额外奖励。"
			confirm-text="完成打卡"
			show-extra
			@confirm="onComplete"
			@cancel="completeModal = false"
		/>

		<ConfirmModal
			:visible="halfModal"
			title="确认记录未达标？"
			description="练到一半、未完成全部任务时可选。不奖励、不扣款，连续完成次数保留，今日不可再打卡。"
			confirm-text="确认未达标"
			@confirm="onHalf"
			@cancel="halfModal = false"
		/>

		<ConfirmModal
			:visible="skipModal"
			title="确认今日缺席？"
			:description="`确认后将扣除 ${REWARDS.DAILY_SKIP} 元，连续完成次数清零。该操作今日不可撤销。`"
			confirm-text="确认缺席"
			@confirm="onSkip"
			@cancel="skipModal = false"
		/>

		<Teleport to="body">
			<Transition name="modal">
				<div
					v-if="showBreakModal"
					class="break-modal-root"
					@click.self="showBreakModal = false"
				>
					<div class="break-modal">
						<h3>记录训练突破</h3>
						<p>俯卧撑、深蹲、平板等里程碑，每项终身仅领一次</p>
						<button
							v-for="level in BREAKTHROUGH_LEVELS"
							:key="level.id"
							type="button"
							class="break-option"
							:disabled="state[level.id]"
							@click="onBreakthrough(level.id)"
						>
							<span>{{ level.label }}</span>
							<span class="break-reward">
								{{ state[level.id] ? '已领取' : `+${level.reward}元` }}
							</span>
						</button>
						<button type="button" class="break-close" @click="showBreakModal = false">
							关闭
						</button>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup>
	import { ref, inject } from 'vue'
	import { BREAKTHROUGH_LEVELS, REWARDS } from '@/constants/fitness'
	import { FITNESS_DISCIPLINE_KEY } from '../keys'
	import BalanceHero from '../components/BalanceHero.vue'
	import ConfirmModal from '../components/ConfirmModal.vue'
	import TaskCollapseItem from '../components/TaskCollapseItem.vue'
	const {
		state,
		canComplete,
		canSkip,
		canHalf,
		isSimMode,
		unlockedBreakthroughs,
		todayPlan,
		programMeta,
		calorieDisclaimer,
		completeCheckIn,
		skipCheckIn,
		halfCheckIn,
		claimBreakthrough,
		setPushVariant
	} = inject(FITNESS_DISCIPLINE_KEY)

	const completeModal = ref(false)
	const halfModal = ref(false)
	const skipModal = ref(false)
	const showBreakModal = ref(false)
	const expandedTaskIds = ref(new Set())

	const toggleTask = (id) => {
		const next = new Set(expandedTaskIds.value)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		expandedTaskIds.value = next
	}
	const breakthroughShort = (id) => {
		const map = {
			break_5: '推5',
			break_10: '推10',
			break_squat_30: '蹲30',
			break_plank_90: '板90s',
			break_lunge_20: '弓步'
		}
		return map[id] ?? '突破'
	}

	const openCompleteModal = () => {
		if (!canComplete.value) return
		completeModal.value = true
	}

	const openHalfModal = () => {
		if (!canHalf.value) return
		halfModal.value = true
	}

	const openSkipModal = () => {
		if (!canSkip.value) return
		skipModal.value = true
	}

	const onHalf = () => {
		halfCheckIn()
		halfModal.value = false
	}

	const onComplete = ({ isExtra }) => {
		completeCheckIn({ isExtra })
		completeModal.value = false
	}

	const onSkip = () => {
		skipCheckIn()
		skipModal.value = false
	}

	const onBreakthrough = (id) => {
		claimBreakthrough(id)
	}
</script>

<style scoped lang="scss">
	.home-tab {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.card {
		background: #fff;
		border-radius: 1.375rem;
		padding: 1.125rem;
		border: 1.5px solid var(--fit-card-border, rgba(244, 114, 182, 0.18));
		box-shadow: var(--fit-shadow, 0 8px 28px rgba(244, 114, 182, 0.14));
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;

		h2 {
			font-size: 1rem;
			font-weight: 700;
			color: #831843;
		}
	}

	.badge {
		font-size: 0.6875rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		background: linear-gradient(135deg, var(--fit-pink-light, #fce7f3), var(--fit-peach-light, #ffedd5));
		color: var(--fit-text-accent, #db2777);
		font-weight: 700;
		border: 1px solid rgba(244, 114, 182, 0.25);
	}

	.phase-bar {
		margin-bottom: 1rem;
		padding: 0.875rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, #fff5f7, var(--fit-pink-light, #fce7f3));
		border: 1px dashed rgba(244, 114, 182, 0.25);
	}

	.rhythm-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
	}

	.rhythm-badge {
		font-size: 0.75rem;
		font-weight: 800;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;

		&.accumulate {
			background: #dbeafe;
			color: #1d4ed8;
		}
		&.consolidate {
			background: #fef3c7;
			color: #b45309;
		}
		&.progress {
			background: #fce7f3;
			color: #be185d;
		}
		&.deload {
			background: #e0e7ff;
			color: #4338ca;
		}
	}

	.rhythm-hint {
		font-size: 0.75rem;
		color: var(--fit-text-warm, #be185d);
	}

	.phase-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		margin-bottom: 0.5rem;
	}

	.phase-name {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--fit-text-warm, #be185d);
	}

	.phase-desc {
		font-size: 0.75rem;
		color: var(--fit-text-accent, #db2777);
	}

	.progress-track {
		height: 8px;
		border-radius: 999px;
		background: rgba(244, 114, 182, 0.15);
		overflow: hidden;
		margin-bottom: 0.35rem;
	}

	.progress-fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, #f9a8d4, var(--fit-pink, #f472b6), var(--fit-peach, #fb923c));
		box-shadow: 0 0 8px rgba(244, 114, 182, 0.45);
		transition: width 0.35s ease;
	}

	.progress-hint {
		font-size: 0.6875rem;
		color: var(--fit-text-warm, #be185d);
	}

	.metrics-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.625rem;
		margin-bottom: 0.5rem;
	}

	.metric {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 0.75rem;
		border-radius: 1rem;
		background: #fff;
		border: 1.5px solid var(--fit-pink-light, #fce7f3);
	}

	.metric-fire {
		border-color: rgba(251, 146, 60, 0.35);
		background: linear-gradient(135deg, #fff5f7, #fff);
	}

	.metric-icon {
		font-size: 1.125rem;
	}

	.metric-label {
		display: block;
		font-size: 0.6875rem;
		color: #94a3b8;
		margin-bottom: 0.1rem;
	}

	.metric strong {
		font-size: 0.9375rem;
		color: #0f172a;
	}

	.calorie-disclaimer {
		margin: 0 0 0.875rem;
		font-size: 0.6875rem;
		color: #94a3b8;
		line-height: 1.45;
	}

	.max-tier {
		font-size: 0.75rem;
		color: #c2410c;
		font-weight: 600;
	}

	.task-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0;
		margin: 0;
	}

	.push-picker {
		margin-top: 0.875rem;
		padding-top: 0.875rem;
		border-top: 1px dashed #e2e8f0;
	}

	.picker-label {
		font-size: 0.75rem;
		color: #64748b;
		margin-bottom: 0.5rem;
	}

	.picker-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.pick-chip {
		padding: 0.4rem 0.75rem;
		border: 1.5px solid var(--fit-pink-light, #fce7f3);
		border-radius: 999px;
		background: #fff;
		font-size: 0.75rem;
		font-weight: 600;
		color: #64748b;
		cursor: pointer;
		transition:
			border-color 0.15s,
			background 0.15s,
			transform 0.15s;

		&:active {
			transform: scale(0.96);
		}

		&.active {
			border-color: var(--fit-pink, #f472b6);
			background: linear-gradient(135deg, var(--fit-pink-light, #fce7f3), var(--fit-peach-light, #ffedd5));
			color: var(--fit-text-accent, #db2777);
		}
	}

	.rules-mini {
		h3 {
			font-size: 0.875rem;
			font-weight: 700;
			color: #831843;
			margin-bottom: 0.625rem;
		}

		ul {
			list-style: none;
			display: flex;
			flex-direction: column;
			gap: 0.4rem;
		}

		li {
			font-size: 0.75rem;
			color: #475569;
			display: flex;
			align-items: center;
			gap: 0.375rem;
		}
	}

	.tag {
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.15rem 0.45rem;
		border-radius: 999px;

		&.gain {
			background: var(--fit-pink-light, #fce7f3);
			color: var(--fit-text-accent, #db2777);
		}

		&.loss {
			background: #fee2e2;
			color: #b91c1c;
		}
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.9375rem 1rem;
		border: none;
		border-radius: 1.125rem;
		font-size: 0.9375rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			transform 0.15s,
			opacity 0.15s,
			box-shadow 0.15s;

		&:active:not(:disabled) {
			transform: scale(0.97);
		}

		&:disabled {
			opacity: 0.45;
			cursor: not-allowed;
		}

		&.complete {
			background: linear-gradient(135deg, #f9a8d4, var(--fit-pink, #f472b6), var(--fit-peach, #fb923c));
			color: #fff;
			box-shadow: 0 8px 24px rgba(244, 114, 182, 0.4);
		}

		&.half {
			background: #fff;
			color: #b45309;
			border: 1.5px solid #fde68a;
		}

		&.skip {
			background: #fff;
			color: #dc2626;
			border: 1.5px solid #fecaca;
		}

		&.break {
			background: linear-gradient(135deg, #fff, var(--fit-lavender, #ede9fe));
			color: #7c3aed;
			border: 1.5px solid #ddd6fe;
		}
	}

	.action-icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.625rem;
	}

	.stat-item {
		background: #fff;
		border-radius: 1.125rem;
		padding: 0.875rem;
		text-align: center;
		border: 1.5px solid var(--fit-card-border, rgba(244, 114, 182, 0.18));
		box-shadow: 0 4px 16px rgba(244, 114, 182, 0.08);

		&.wide {
			grid-column: 1 / -1;
			text-align: left;
			display: flex;
			align-items: center;
			justify-content: space-between;
			background: linear-gradient(135deg, #fff, var(--fit-lavender, #ede9fe));
		}
	}

	.stat-value {
		display: block;
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--fit-text-accent, #db2777);
		line-height: 1.2;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #64748b;
		margin-top: 0.125rem;
	}

	.stat-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		justify-content: flex-end;
	}

	.mini-tag {
		font-size: 0.75rem;
		padding: 0.25rem 0.55rem;
		border-radius: 999px;
		background: var(--fit-lavender, #ede9fe);
		color: #7c3aed;
		font-weight: 600;
		border: 1px solid #ddd6fe;
	}

	.muted {
		font-size: 0.8125rem;
		color: #94a3b8;
	}

	.break-modal-root {
		position: fixed;
		inset: 0;
		z-index: 300;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 1rem;
		background: rgba(131, 24, 67, 0.35);
		backdrop-filter: blur(4px);
	}

	.break-modal {
		width: 100%;
		max-width: 24rem;
		max-height: 70vh;
		overflow-y: auto;
		padding: 1.25rem;
		border-radius: 1.5rem 1.5rem 0 0;
		background: #fff;
		border: 1.5px solid var(--fit-card-border, rgba(244, 114, 182, 0.18));

		h3 {
			font-size: 1.0625rem;
			font-weight: 700;
			color: #831843;
		}

		p {
			font-size: 0.8125rem;
			color: #64748b;
			margin: 0.375rem 0 1rem;
		}
	}

	.break-option {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1rem;
		margin-bottom: 0.5rem;
		border: 1.5px solid var(--fit-pink-light, #fce7f3);
		border-radius: 1rem;
		background: #fff5f7;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #831843;
		cursor: pointer;
		text-align: left;

		&:disabled {
			opacity: 0.55;
			cursor: default;
		}

		&:not(:disabled):active {
			background: var(--fit-lavender, #ede9fe);
			border-color: #c4b5fd;
		}
	}

	.break-reward {
		color: #7c3aed;
		font-weight: 700;
		flex-shrink: 0;
	}

	.break-close {
		width: 100%;
		margin-top: 0.5rem;
		padding: 0.75rem;
		border: none;
		border-radius: 1rem;
		background: var(--fit-pink-light, #fce7f3);
		color: var(--fit-text-accent, #db2777);
		font-weight: 600;
		cursor: pointer;
	}
</style>
