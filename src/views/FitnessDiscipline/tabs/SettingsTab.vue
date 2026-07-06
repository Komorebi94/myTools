<template>
	<div class="settings-tab">
		<header class="tab-header">
			<h2>规则与设置</h2>
		</header>

		<section class="card">
			<h3>体型与卡路里估算</h3>
			<p class="intro">修改后自动保存，首页消耗会按新体重重算。</p>
			<div class="profile-form">
				<label class="profile-field">
					<span>身高（cm）</span>
					<input
						v-model.number="profileDraft.heightCm"
						type="number"
						min="120"
						max="220"
						inputmode="numeric"
						@change="saveProfile"
					/>
				</label>
				<label class="profile-field">
					<span>体重（斤）</span>
					<input
						v-model.number="profileDraft.weightJin"
						type="number"
						min="60"
						max="250"
						inputmode="numeric"
						@change="saveProfile"
					/>
				</label>
			</div>
			<p class="profile-summary">
				换算体重 <strong>{{ userProfile.weightKg }} kg</strong> · 当前 MET
				<strong>{{ currentMet }}</strong>
			</p>
			<h4 class="sub-head">计算规则</h4>
			<ul class="rule-list compact formula-list">
				<li>
					<strong>公式</strong>：{{ CALORIE_ESTIMATE_RULES.formula }}
				</li>
				<li>{{ CALORIE_ESTIMATE_RULES.weightNote }}</li>
				<li>{{ CALORIE_ESTIMATE_RULES.heightNote }}</li>
				<li>{{ CALORIE_ESTIMATE_RULES.durationNote }}</li>
				<li>{{ CALORIE_ESTIMATE_RULES.metNote }}</li>
				<li>{{ CALORIE_ESTIMATE_RULES.perTaskNote }}</li>
			</ul>
		</section>

		<section class="card">
			<h3>科学训练节奏</h3>
			<p class="intro">
				建议每周练 <strong>3–4 次</strong>，休息日无需打开 app。训练进度按
				<strong>完成次数</strong>推进，每 <strong>6 次打卡</strong>为一个微周期，自动切换「积量 →
				巩固 → 升阶」。
			</p>
			<ul class="rule-list">
				<li><strong>积量日 ×3</strong>：次数类 +1 次/组，计时类 +5 秒/组</li>
				<li><strong>巩固日 ×2</strong>：维持上一档，打磨动作质量</li>
				<li><strong>升阶日 ×1</strong>：逼近上限则加组，否则再加次数/秒数</li>
				<li>
					<strong>放松周</strong>：每满 24 次打卡，量减约 40%，完成仍奖 +{{
						REWARDS.DELOAD_COMPLETE
					}}
					元
				</li>
			</ul>
		</section>

		<section class="card">
			<h3>不同动作的逻辑</h3>
			<ul class="rule-list">
				<li><strong>俯卧撑</strong>：墙推→斜撑→跪姿→标准，每种练满约 18 课次再换变式</li>
				<li><strong>深蹲/弓步</strong>：按小周期轮换，次数阶梯上涨</li>
				<li><strong>平板/静蹲</strong>：按秒数进阶，升阶日优先加组</li>
				<li><strong>拉伸/开合跳</strong>：随课次增加时长或次数</li>
			</ul>
		</section>

		<section class="card">
			<h3>奖励随训练跟进</h3>
			<p class="intro">
				奖励按<strong>每次完成</strong>发放。建议每月练约 20 次，单次金额已按该节奏校准（约为每日训练的
				1.5 倍），避免练得少却攒得慢。
			</p>
			<ul class="rule-list">
				<li>
					<strong>每次完成</strong>：{{ REWARDS.DAILY_BASE }} 元起，每完成一个小周期
					+1，上限 {{ REWARDS.DAILY_CAP }} 元
				</li>
				<li><strong>升阶日</strong>：额外 +{{ REWARDS.STEP_DAY_BONUS }} 元</li>
				<li>
					<strong>小周期收官</strong>：额外 +{{ REWARDS.MESO_COMPLETE }} 元（第 6
					次完成时）
				</li>
				<li>
					<strong>动作变式进阶</strong>：首次换更难俯卧撑 +{{ REWARDS.VARIANT_UPGRADE }}
					元
				</li>
				<li>
					<strong>超额完成</strong>：+{{ REWARDS.EXTRA_COMPLETE }} 元 ·
					<strong>每累计 7 次</strong>：+{{ REWARDS.STREAK_7 }} 元（可多次领取）
				</li>
				<li><strong>今日未达标</strong>：不奖不罚，连续完成次数保留</li>
				<li><strong>缺席</strong>：{{ REWARDS.DAILY_SKIP }} 元</li>
				<li><strong>兑换奖励</strong>：在「台账」页操作，自定义金额并记入兑换记录</li>
			</ul>
			<h4 class="sub-head">突破奖励（终身一次）</h4>
			<ul class="rule-list compact">
				<li v-for="level in BREAKTHROUGH_LEVELS" :key="level.id">
					{{ level.label }}：+{{ level.reward }} 元
				</li>
			</ul>
		</section>

		<section class="card tip-card">
			<h3>资金使用建议</h3>
			<p>
				本应用金额为<strong>虚拟激励金</strong>。把「笑笑的存钱罐」里的余额
				兑换成心仪小物件，用看得见的奖励强化自律。
			</p>
		</section>

		<section class="card">
			<h3>数据备份</h3>
			<p class="backup-hint">数据仅存本机浏览器，换机或清缓存前建议导出 JSON</p>
			<div class="backup-actions">
				<button type="button" class="backup-btn" @click="exportData">导出备份</button>
				<label class="backup-btn import-label">
					导入备份
					<input type="file" accept="application/json,.json" hidden @change="onImport" />
				</label>
			</div>
		</section>

		<section class="card danger-card">
			<h3>数据管理</h3>
			<p class="danger-hint">清空后余额、记录、连续完成次数与突破进度均不可恢复</p>
			<button type="button" class="reset-btn" @click="resetStep = 1">一键重置所有数据</button>
		</section>

		<p class="version">{{ APP_NAME }} v{{ APP_VERSION }}</p>

		<ConfirmModal
			:visible="resetStep === 1"
			title="确定要重置数据？"
			description="将清空余额、打卡记录、连续完成次数与突破奖励进度，该操作不可恢复。"
			confirm-text="继续"
			@confirm="resetStep = 2"
			@cancel="resetStep = 0"
		/>

		<ConfirmModal
			:visible="resetStep === 2"
			title="最后确认"
			description="确定清空所有打卡数据和余额？该操作不可恢复。"
			confirm-text="确认清空"
			@confirm="onReset"
			@cancel="resetStep = 0"
		/>
	</div>
</template>

<script setup>
	import { ref, inject, watch, computed } from 'vue'
	import { APP_NAME, APP_VERSION, BREAKTHROUGH_LEVELS, REWARDS } from '@/constants/fitness'
	import { CALORIE_ESTIMATE_RULES, getSessionMet } from '@/utils/fitnessCalories'
	import { FITNESS_DISCIPLINE_KEY } from '../keys'
	import ConfirmModal from '../components/ConfirmModal.vue'

	const {
		resetAllData,
		exportData,
		importData,
		userProfile,
		setUserProfile,
		state
	} = inject(FITNESS_DISCIPLINE_KEY)

	const profileDraft = ref({
		heightCm: userProfile.value.heightCm,
		weightJin: userProfile.value.weightJin
	})

	watch(
		userProfile,
		(profile) => {
			profileDraft.value = {
				heightCm: profile.heightCm,
				weightJin: profile.weightJin
			}
		},
		{ immediate: true }
	)

	const currentMet = computed(() => getSessionMet(state.value.totalCheckDays))

	const saveProfile = () => {
		setUserProfile({
			heightCm: profileDraft.value.heightCm,
			weightJin: profileDraft.value.weightJin
		})
	}

	const resetStep = ref(0)

	const onReset = () => {
		resetAllData()
		resetStep.value = 0
	}

	function onImport(event) {
		const file = event.target.files?.[0]
		if (file) importData(file)
		event.target.value = ''
	}
</script>

<style scoped lang="scss">
	.settings-tab {
		padding-bottom: 1rem;
	}

	.tab-header h2 {
		font-size: 1.25rem;
		font-weight: 800;
		color: #0f172a;
		margin-bottom: 1rem;
	}

	.card {
		background: #fff;
		border-radius: 1rem;
		padding: 1.125rem;
		margin-bottom: 0.875rem;
		box-shadow: 0 2px 12px rgba(15, 23, 42, 0.05);

		h3 {
			font-size: 0.9375rem;
			font-weight: 700;
			color: #0f172a;
			margin-bottom: 0.75rem;
		}
	}

	.intro {
		font-size: 0.8125rem;
		line-height: 1.7;
		color: #64748b;
		margin-bottom: 0.75rem;

		strong {
			color: #c2410c;
		}
	}

	.rule-list {
		list-style: none;
		font-size: 0.8125rem;
		color: #475569;
		line-height: 1.8;

		strong {
			color: #0f172a;
		}

		&.compact li {
			padding-left: 0.5rem;
		}
	}

	.sub-head {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #475569;
		margin: 0.75rem 0 0.375rem;
	}

	.profile-form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.625rem;
		margin-bottom: 0.65rem;
	}

	.profile-field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.75rem;
		color: #64748b;

		input {
			padding: 0.55rem 0.65rem;
			border: 1px solid #e2e8f0;
			border-radius: 0.65rem;
			font-size: 0.875rem;
			font-weight: 600;
			color: #0f172a;
			background: #f8fafc;
		}
	}

	.profile-summary {
		font-size: 0.75rem;
		color: #64748b;
		margin-bottom: 0.25rem;

		strong {
			color: #c2410c;
		}
	}

	.formula-list li {
		font-size: 0.75rem;
		line-height: 1.55;
	}

	.tip-card p {
		font-size: 0.8125rem;
		line-height: 1.7;
		color: #64748b;

		strong {
			color: #c2410c;
		}
	}

	.backup-hint {
		font-size: 0.75rem;
		color: #64748b;
		line-height: 1.5;
		margin-bottom: 0.65rem;
	}

	.backup-actions {
		display: flex;
		gap: 0.5rem;
	}

	.backup-btn {
		flex: 1;
		padding: 0.6rem 0.5rem;
		border-radius: 0.65rem;
		border: 1px solid #e2e8f0;
		background: #f8fafc;
		font-size: 0.8125rem;
		font-weight: 700;
		color: #334155;
		cursor: pointer;
		text-align: center;
	}

	.import-label {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.danger-hint {
		font-size: 0.75rem;
		color: #94a3b8;
		margin-bottom: 0.75rem;
	}

	.reset-btn {
		width: 100%;
		padding: 0.875rem;
		border: none;
		border-radius: 0.75rem;
		background: #fef2f2;
		color: #dc2626;
		font-size: 0.9375rem;
		font-weight: 700;
		cursor: pointer;

		&:active {
			background: #fee2e2;
		}
	}

	.version {
		text-align: center;
		font-size: 0.75rem;
		color: #cbd5e1;
		margin-top: 0.5rem;
	}
</style>
