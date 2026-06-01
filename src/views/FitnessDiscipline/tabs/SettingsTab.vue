<template>
	<div class="settings-tab">
		<header class="tab-header">
			<h2>规则与设置</h2>
		</header>

		<section class="card">
			<h3>科学训练节奏</h3>
			<p class="intro">
				参考常见自重周期化方案（每周加 1–2 次/组，巩固后再升阶，约 4–6 周减量）： 每
				<strong>6 次打卡</strong>为一个微周期，自动切换「积量 → 巩固 → 升阶」。
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
			<ul class="rule-list">
				<li>
					<strong>每日完成</strong>：{{ REWARDS.DAILY_BASE }} 元起，每完成一个小周期
					+1，上限 {{ REWARDS.DAILY_CAP }} 元
				</li>
				<li><strong>升阶日</strong>：额外 +{{ REWARDS.STEP_DAY_BONUS }} 元</li>
				<li>
					<strong>小周期收官</strong>：额外 +{{ REWARDS.MESO_COMPLETE }} 元（第 6
					天完成时）
				</li>
				<li>
					<strong>动作变式进阶</strong>：首次换更难俯卧撑 +{{ REWARDS.VARIANT_UPGRADE }}
					元
				</li>
				<li>
					<strong>超额完成</strong>：+{{ REWARDS.EXTRA_COMPLETE }} 元 ·
					<strong>每连续 7 天</strong>：+{{ REWARDS.STREAK_7 }} 元（可多次领取）
				</li>
				<li><strong>今日未达标</strong>：不奖不罚，连续天数保留</li>
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
			<p class="danger-hint">清空后余额、记录、连续天数与突破进度均不可恢复</p>
			<button type="button" class="reset-btn" @click="resetStep = 1">一键重置所有数据</button>
		</section>

		<p class="version">{{ APP_NAME }} v{{ APP_VERSION }}</p>

		<ConfirmModal
			:visible="resetStep === 1"
			title="确定要重置数据？"
			description="将清空余额、打卡记录、连续天数与突破奖励进度，该操作不可恢复。"
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
	import { ref, inject } from 'vue'
	import { APP_NAME, APP_VERSION, BREAKTHROUGH_LEVELS, REWARDS } from '@/constants/fitness'
	import { FITNESS_DISCIPLINE_KEY } from '../keys'
	import ConfirmModal from '../components/ConfirmModal.vue'

	const { resetAllData, exportData, importData } = inject(FITNESS_DISCIPLINE_KEY)

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
