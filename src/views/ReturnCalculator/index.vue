<template>
	<div class="return-calculator">
		<div class="rc-bg" aria-hidden="true" />

		<div class="rc-panel">
			<header class="rc-header">
				<p class="rc-eyebrow">复利估算</p>
				<h1>收益计算器</h1>
				<p class="rc-lede">
					终值 = 本金 × (1 + 年收益率)<sup>n</sup>
					<span class="rc-lede-note">按年复利 · 不含追加投入 · 收益率 -50%～50%</span>
				</p>
			</header>

			<div class="rc-body">
				<form class="rc-form" @submit.prevent @keydown.enter.prevent="focusNextField">
					<p class="rc-section-label">输入参数</p>

					<div class="rc-field" :class="{ 'is-invalid': errorField === 'principalWan' }">
						<label class="rc-label" for="principal-input">初始资金</label>
						<div class="rc-input-box">
							<input
								id="principal-input"
								v-model="principalWan"
								type="text"
								inputmode="decimal"
								enterkeyhint="next"
								autocomplete="off"
								placeholder="30"
								spellcheck="false"
								autocapitalize="off"
								:aria-invalid="errorField === 'principalWan'"
								:aria-describedby="
									errorField === 'principalWan' ? 'principal-error' : undefined
								"
								@focus="selectInput"
							/>
							<span class="rc-unit">万</span>
						</div>
						<p
							v-if="errorField === 'principalWan'"
							id="principal-error"
							class="rc-error"
						>
							{{ result.error }}
						</p>
						<div class="rc-chips" role="group" aria-label="初始资金快捷值">
							<button
								v-for="value in principalPresets"
								:key="`p-${value}`"
								type="button"
								:aria-pressed="isPresetActive(principalWan, value)"
								@click="applyPreset('principalWan', value)"
							>
								{{ value }}万
							</button>
						</div>
					</div>

					<div class="rc-field" :class="{ 'is-invalid': errorField === 'ratePercent' }">
						<label class="rc-label" for="rate-input">年收益率</label>
						<div class="rc-input-box">
							<input
								id="rate-input"
								v-model="ratePercent"
								type="text"
								inputmode="decimal"
								enterkeyhint="next"
								autocomplete="off"
								placeholder="8"
								spellcheck="false"
								autocapitalize="off"
								:aria-invalid="errorField === 'ratePercent'"
								:aria-describedby="
									errorField === 'ratePercent' ? 'rate-error' : undefined
								"
								@focus="selectInput"
							/>
							<span class="rc-unit">%</span>
						</div>
						<p v-if="errorField === 'ratePercent'" id="rate-error" class="rc-error">
							{{ result.error }}
						</p>
						<div class="rc-chips" role="group" aria-label="年收益率快捷值">
							<button
								v-for="value in ratePresets"
								:key="`r-${value}`"
								type="button"
								:aria-pressed="isPresetActive(ratePercent, value)"
								:class="{ 'is-negative': value < 0 }"
								@click="applyPreset('ratePercent', value)"
							>
								{{ value }}%
							</button>
						</div>
					</div>

					<div class="rc-field" :class="{ 'is-invalid': errorField === 'years' }">
						<label class="rc-label" for="years-input">年数</label>
						<div class="rc-input-box">
							<input
								id="years-input"
								v-model="years"
								type="text"
								inputmode="numeric"
								enterkeyhint="done"
								autocomplete="off"
								placeholder="20"
								spellcheck="false"
								autocapitalize="off"
								:aria-invalid="errorField === 'years'"
								:aria-describedby="
									errorField === 'years' ? 'years-error' : undefined
								"
								@focus="selectInput"
							/>
							<span class="rc-unit">年</span>
						</div>
						<p v-if="errorField === 'years'" id="years-error" class="rc-error">
							{{ result.error }}
						</p>
						<div class="rc-chips" role="group" aria-label="年数快捷值">
							<button
								v-for="value in yearPresets"
								:key="`y-${value}`"
								type="button"
								:aria-pressed="isPresetActive(years, value)"
								@click="applyPreset('years', value)"
							>
								{{ value }}年
							</button>
						</div>
					</div>
				</form>

				<section class="rc-result" aria-labelledby="result-heading">
					<h2 id="result-heading" class="sr-only">计算结果</h2>

					<div class="rc-result-panel" :class="resultPanelClass">
						<output
							class="rc-hero"
							for="principal-input rate-input years-input"
							aria-live="polite"
						>
							<p class="rc-hero-label">
								{{ result.ok ? `${result.years} 年后终值` : '无法计算' }}
							</p>
							<p class="rc-hero-value" :class="amountClass">
								{{ result.ok ? result.finalWanText : '—' }}
							</p>
							<p v-if="result.ok" class="rc-hero-meta">
								<span>{{ principalText }}</span>
								<span class="rc-arrow" aria-hidden="true">→</span>
								<span :class="amountClass">{{ result.finalWanText }}</span>
							</p>
						</output>

						<dl class="rc-stats">
							<div>
								<dt>本金</dt>
								<dd>{{ principalText }}</dd>
							</div>
							<div>
								<dt>{{ profitLabel }}</dt>
								<dd :class="amountClass">
									{{ result.ok ? result.profitWanText : '—' }}
								</dd>
							</div>
							<div>
								<dt>倍数</dt>
								<dd>{{ result.ok ? result.multipleText : '—' }}</dd>
							</div>
						</dl>
					</div>

					<div class="rc-table-wrap">
						<table class="rc-table">
							<caption>
								期限对照 · 同本金 · 同收益率
							</caption>
							<thead>
								<tr>
									<th scope="col">指标</th>
									<th
										v-for="row in milestones"
										:key="`h-${row.years}`"
										scope="col"
										:aria-current="
											result.ok && result.years === row.years
												? 'true'
												: undefined
										"
										:class="{
											'is-active': result.ok && result.years === row.years
										}"
									>
										{{ row.years }}年
									</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th scope="row">终值</th>
									<td
										v-for="row in milestones"
										:key="`f-${row.years}`"
										:aria-current="
											result.ok && result.years === row.years
												? 'true'
												: undefined
										"
										:class="{
											'is-active': result.ok && result.years === row.years
										}"
									>
										{{ row.result.ok ? row.result.finalWanText : '—' }}
									</td>
								</tr>
								<tr>
									<th scope="row">盈亏</th>
									<td
										v-for="row in milestones"
										:key="`p-${row.years}`"
										:aria-current="
											result.ok && result.years === row.years
												? 'true'
												: undefined
										"
										:class="milestoneClass(row)"
									>
										{{ row.result.ok ? row.result.profitWanText : '—' }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue'
	import { usePageBodyClass } from '@/composables/usePageBodyClass'
	import {
		PRINCIPAL_WAN_PRESETS,
		RATE_PERCENT_PRESETS,
		YEAR_PRESETS,
		calculateCompoundReturn,
		formatWan,
		milestoneReturns
	} from '@/utils/compoundReturn'

	usePageBodyClass('return-page-active')

	const principalWan = ref('30')
	const ratePercent = ref('8')
	const years = ref('20')

	const principalPresets = PRINCIPAL_WAN_PRESETS
	const ratePresets = RATE_PERCENT_PRESETS
	const yearPresets = YEAR_PRESETS

	const result = computed(() =>
		calculateCompoundReturn({
			principalWan: principalWan.value,
			ratePercent: ratePercent.value,
			years: years.value
		})
	)

	const errorField = computed(() => (result.value.ok ? '' : result.value.field))

	const milestones = computed(() =>
		milestoneReturns({
			principalWan: principalWan.value,
			ratePercent: ratePercent.value
		})
	)

	const principalText = computed(() => {
		if (!result.value.ok) return '—'
		return formatWan(result.value.principalWan)
	})

	const amountClass = computed(() => {
		if (!result.value.ok) return 'is-empty'
		if (result.value.profitWan < 0) return 'is-loss'
		if (result.value.profitWan > 0) return 'is-gain'
		return 'is-neutral-value'
	})

	const resultPanelClass = computed(() => {
		if (!result.value.ok) return 'is-neutral'
		if (result.value.profitWan < 0) return 'is-loss-panel'
		if (result.value.profitWan > 0) return 'is-gain-panel'
		return 'is-neutral'
	})

	const profitLabel = computed(() => {
		if (result.value.ok && result.value.profitWan < 0) return '亏损'
		return '收益'
	})

	const isPresetActive = (current, value) => Number(current) === value

	function milestoneClass(row) {
		const active = result.value.ok && result.value.years === row.years
		const loss = row.result.ok && row.result.profitWan < 0
		const gain = row.result.ok && row.result.profitWan > 0
		return {
			'is-active': active,
			'is-loss': loss && !active,
			'is-gain': gain && !active
		}
	}

	const FIELD_IDS = ['principal-input', 'rate-input', 'years-input']
	const fieldRefs = {
		principalWan,
		ratePercent,
		years
	}
	const PRESET_INPUT_IDS = {
		principalWan: 'principal-input',
		ratePercent: 'rate-input',
		years: 'years-input'
	}

	function selectInput(event) {
		event.target.select()
	}

	function applyPreset(field, value) {
		fieldRefs[field].value = String(value)
		requestAnimationFrame(() => {
			document.getElementById(PRESET_INPUT_IDS[field])?.focus()
		})
	}

	function focusNextField(event) {
		const index = FIELD_IDS.indexOf(event.target.id)
		if (index < 0) return
		if (index === FIELD_IDS.length - 1) {
			event.target.blur()
			return
		}
		document.getElementById(FIELD_IDS[index + 1])?.focus()
	}
</script>

<style lang="scss">
	body.return-page-active {
		overflow: auto;
		background: #141820;
	}
</style>

<style scoped lang="scss">
	.return-calculator {
		--rc-bg: #141820;
		--rc-surface: #1c2230;
		--rc-surface-raised: #242b3a;
		--rc-text: #f5f0e8;
		--rc-muted: #8b939e;
		--rc-gold: #c9a962;
		--rc-gold-dim: rgba(201, 169, 98, 0.35);
		--rc-line: rgba(201, 169, 98, 0.18);
		--rc-line-strong: rgba(201, 169, 98, 0.45);
		--rc-gain: #4ade80;
		--rc-loss: #f87171;
		--rc-danger: #f87171;
		--rc-serif: 'IBM Plex Serif', 'Songti SC', 'Noto Serif SC', serif;
		--rc-sans: 'IBM Plex Sans', 'PingFang SC', 'Hiragino Sans GB', sans-serif;

		position: relative;
		min-height: 100%;
		padding: calc(0.85rem + var(--safe-top)) 0.85rem calc(1.75rem + var(--safe-bottom));
		color: var(--rc-text);
		font-family: var(--rc-sans);
	}

	.rc-bg {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background:
			radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201, 169, 98, 0.07), transparent),
			radial-gradient(ellipse 60% 40% at 100% 100%, rgba(201, 169, 98, 0.04), transparent),
			var(--rc-bg);
	}

	.rc-panel {
		position: relative;
		z-index: 1;
		max-width: 44rem;
		margin: 0 auto;
		background: var(--rc-surface);
		border: 1px solid var(--rc-line);
	}

	.rc-header {
		padding: 1.35rem 1.15rem 1.1rem;
		border-bottom: 1px solid var(--rc-gold-dim);
		background: linear-gradient(180deg, rgba(201, 169, 98, 0.06) 0%, transparent 100%);
	}

	.rc-eyebrow {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		color: var(--rc-gold);
	}

	.rc-header h1 {
		margin-top: 0.4rem;
		font-family: var(--rc-serif);
		font-size: 1.75rem;
		font-weight: 600;
		line-height: 1.15;
		letter-spacing: 0.03em;
		color: var(--rc-text);
	}

	.rc-lede {
		margin-top: 0.5rem;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: var(--rc-muted);

		sup {
			font-size: 0.65em;
			color: var(--rc-gold);
		}
	}

	.rc-lede-note {
		display: block;
		margin-top: 0.2rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.rc-body {
		padding: 1.15rem 1.15rem 1.35rem;
	}

	.rc-section-label {
		margin-bottom: 0.85rem;
		padding-bottom: 0.45rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		color: var(--rc-gold);
		border-bottom: 1px solid var(--rc-line);
	}

	.rc-form {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.rc-field {
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--rc-line);

		&:focus-within .rc-input-box {
			border-bottom-color: var(--rc-gold);
		}

		&.is-invalid .rc-input-box {
			border-bottom-color: var(--rc-danger);
		}
	}

	.rc-label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		color: var(--rc-muted);
	}

	.rc-input-box {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.75rem;
		border-bottom: 1px solid var(--rc-line-strong);
		transition: border-color 0.2s ease;
	}

	.rc-field input {
		flex: 1;
		width: 100%;
		min-width: 0;
		height: 2.75rem;
		border: 0;
		background: transparent;
		color: var(--rc-text);
		font-family: var(--rc-serif);
		font-size: 1.5rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		outline: none;
		-webkit-appearance: none;
		appearance: none;

		&::placeholder {
			color: #4b5563;
			font-weight: 500;
		}
	}

	.rc-unit {
		flex-shrink: 0;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--rc-gold);
	}

	.rc-error {
		margin: 0.45rem 0 0;
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--rc-danger);
	}

	.rc-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.65rem;
	}

	.rc-chips button {
		min-height: 2rem;
		padding: 0 0.6rem;
		border: 1px solid var(--rc-line);
		border-radius: 2px;
		background: transparent;
		color: var(--rc-muted);
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		touch-action: manipulation;
		transition:
			border-color 0.15s ease,
			color 0.15s ease,
			background 0.15s ease;

		&[aria-pressed='true'] {
			border-color: var(--rc-gold);
			background: rgba(201, 169, 98, 0.12);
			color: var(--rc-gold);
		}

		&.is-negative:not([aria-pressed='true']) {
			border-color: rgba(248, 113, 113, 0.35);
			color: var(--rc-loss);
		}

		&:hover {
			border-color: var(--rc-line-strong);
			color: var(--rc-text);
		}

		&:focus-visible {
			outline: 1px solid var(--rc-gold);
			outline-offset: 2px;
		}
	}

	.rc-result {
		margin-top: 1.25rem;
		padding-top: 1.15rem;
		border-top: 1px solid var(--rc-gold-dim);
	}

	.rc-result-panel {
		padding: 1rem 0.95rem;
		background: var(--rc-surface-raised);
		border: 1px solid var(--rc-line);
		transition:
			border-color 0.2s ease,
			background 0.2s ease;

		&.is-gain-panel {
			border-color: rgba(74, 222, 128, 0.25);
			background: linear-gradient(
				135deg,
				rgba(74, 222, 128, 0.06) 0%,
				var(--rc-surface-raised) 60%
			);
		}

		&.is-loss-panel {
			border-color: rgba(248, 113, 113, 0.25);
			background: linear-gradient(
				135deg,
				rgba(248, 113, 113, 0.06) 0%,
				var(--rc-surface-raised) 60%
			);
		}
	}

	.rc-hero-label {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		color: var(--rc-gold);
	}

	.rc-hero-value {
		margin-top: 0.35rem;
		font-family: var(--rc-serif);
		font-size: clamp(2.25rem, 11vw, 3.25rem);
		font-weight: 600;
		line-height: 1.08;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
		word-break: break-all;
		color: var(--rc-text);

		&.is-empty {
			color: var(--rc-muted);
		}

		&.is-gain {
			color: var(--rc-gain);
		}

		&.is-loss {
			color: var(--rc-loss);
		}

		&.is-neutral-value {
			color: var(--rc-gold);
		}
	}

	.rc-hero-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.5rem;
		margin-top: 0.6rem;
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
		color: var(--rc-muted);

		.rc-arrow {
			color: var(--rc-gold-dim);
		}

		.is-gain {
			color: var(--rc-gain);
		}

		.is-loss {
			color: var(--rc-loss);
		}
	}

	.rc-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0;
		margin: 0.85rem -0.95rem -1rem;
		padding-top: 0.85rem;
		border-top: 1px solid var(--rc-line);

		div {
			min-width: 0;
			padding: 0.65rem 0.95rem;
			border-right: 1px solid var(--rc-line);

			&:last-child {
				border-right: 0;
			}
		}

		dt {
			font-size: 0.625rem;
			font-weight: 500;
			letter-spacing: 0.1em;
			color: var(--rc-muted);
		}

		dd {
			margin-top: 0.25rem;
			font-family: var(--rc-serif);
			font-variant-numeric: tabular-nums;
			font-size: 1rem;
			font-weight: 600;
			word-break: break-all;
			color: var(--rc-text);
		}

		.is-gain {
			color: var(--rc-gain);
		}

		.is-loss {
			color: var(--rc-loss);
		}
	}

	.rc-table-wrap {
		margin-top: 1rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		border: 1px solid var(--rc-line);
		background: var(--rc-surface-raised);
	}

	.rc-table {
		width: 100%;
		min-width: 18rem;
		border-collapse: collapse;
		table-layout: fixed;

		caption {
			caption-side: top;
			padding: 0.65rem 0.75rem 0;
			text-align: left;
			color: var(--rc-gold);
			font-size: 0.6875rem;
			font-weight: 600;
			letter-spacing: 0.12em;
		}

		th,
		td {
			padding: 0.55rem 0.5rem;
			border: 1px solid var(--rc-line);
			font-variant-numeric: tabular-nums;
			text-align: right;
		}

		th[scope='col']:first-child,
		th[scope='row'] {
			text-align: left;
			color: var(--rc-muted);
			font-size: 0.6875rem;
			font-weight: 500;
			letter-spacing: 0.04em;
			background: rgba(201, 169, 98, 0.04);
		}

		th[scope='col'] {
			color: var(--rc-muted);
			font-size: 0.6875rem;
			font-weight: 500;
		}

		td {
			font-family: var(--rc-serif);
			font-size: 0.8125rem;
			font-weight: 600;
			color: var(--rc-text);
			word-break: break-all;
		}

		.is-active {
			background: rgba(201, 169, 98, 0.1);
			color: var(--rc-gold);
			box-shadow: inset 0 -2px 0 var(--rc-gold);
		}

		.is-gain {
			color: var(--rc-gain);
		}

		.is-loss {
			color: var(--rc-loss);
		}
	}

	@media (min-width: $tablet-min) {
		.return-calculator {
			padding: calc(1.5rem + var(--safe-top)) 1.5rem calc(2.25rem + var(--safe-bottom));
		}

		.rc-header {
			padding: 1.65rem 1.75rem 1.25rem;
		}

		.rc-header h1 {
			font-size: 2.1rem;
		}

		.rc-body {
			display: grid;
			grid-template-columns: minmax(0, 16.5rem) minmax(0, 1fr);
			gap: 0;
			padding: 0;
		}

		.rc-form {
			padding: 1.25rem 1.75rem 1.5rem;
			border-right: 1px solid var(--rc-line);
		}

		.rc-result {
			margin-top: 0;
			padding: 1.25rem 1.75rem 1.5rem;
			border-top: 0;
		}

		.rc-hero-value {
			font-size: 3rem;
		}
	}
</style>
