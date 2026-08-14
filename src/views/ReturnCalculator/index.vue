<template>
	<div class="return-calculator">
		<header class="rc-header">
			<h1>收益计算器</h1>
			<p class="rc-lede">
				终值 = 本金 × (1 + 年收益率)<sup>年数</sup>，按年复利，不含追加投入。
			</p>
		</header>

		<form class="rc-form" @submit.prevent @keydown.enter.prevent="focusNextField">
			<div class="rc-field" :class="{ 'is-invalid': errorField === 'principalWan' }">
				<label class="rc-label" for="principal-input">初始资金</label>
				<div class="rc-input-wrap">
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
				<p v-if="errorField === 'principalWan'" id="principal-error" class="rc-error">
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
				<div class="rc-input-wrap">
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
						:aria-describedby="errorField === 'ratePercent' ? 'rate-error' : undefined"
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
						@click="applyPreset('ratePercent', value)"
					>
						{{ value }}%
					</button>
				</div>
			</div>

			<div class="rc-field" :class="{ 'is-invalid': errorField === 'years' }">
				<label class="rc-label" for="years-input">年数</label>
				<div class="rc-input-wrap">
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
						:aria-describedby="errorField === 'years' ? 'years-error' : undefined"
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
			<output class="rc-hero" for="principal-input rate-input years-input" aria-live="polite">
				<p class="rc-hero-label">
					{{ result.ok ? `${result.years} 年后终值` : '无法计算' }}
				</p>
				<p class="rc-hero-value" :class="amountClass">
					{{ result.ok ? result.finalWanText : '—' }}
				</p>
			</output>

			<dl class="rc-stats">
				<div>
					<dt>本金</dt>
					<dd>{{ principalText }}</dd>
				</div>
				<div>
					<dt>{{ profitLabel }}</dt>
					<dd :class="amountClass">{{ result.ok ? result.profitWanText : '—' }}</dd>
				</div>
				<div>
					<dt>倍数</dt>
					<dd>{{ result.ok ? result.multipleText : '—' }}</dd>
				</div>
			</dl>

			<table class="rc-table">
				<caption>
					同本金、同收益率
				</caption>
				<thead>
					<tr>
						<th scope="col">对照</th>
						<th
							v-for="row in milestones"
							:key="`h-${row.years}`"
							scope="col"
							:aria-current="
								result.ok && result.years === row.years ? 'true' : undefined
							"
							:class="{ 'is-active': result.ok && result.years === row.years }"
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
								result.ok && result.years === row.years ? 'true' : undefined
							"
							:class="{ 'is-active': result.ok && result.years === row.years }"
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
								result.ok && result.years === row.years ? 'true' : undefined
							"
							:class="milestoneClass(row)"
						>
							{{ row.result.ok ? row.result.profitWanText : '—' }}
						</td>
					</tr>
				</tbody>
			</table>
		</section>
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
		return ''
	})

	const profitLabel = computed(() => {
		if (result.value.ok && result.value.profitWan < 0) return '亏损'
		return '收益'
	})

	const isPresetActive = (current, value) => Number(current) === value

	function milestoneClass(row) {
		const active = result.value.ok && result.value.years === row.years
		const loss = row.result.ok && row.result.profitWan < 0
		return {
			'is-active': active,
			'is-loss': loss
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
		background: #f7f4ee;
	}
</style>

<style scoped lang="scss">
	.return-calculator {
		--rc-bg: #f7f4ee;
		--rc-ink: #1a1a1a;
		--rc-muted: #5c5852;
		--rc-line: #d9d2c5;
		--rc-gain: #0f6b4c;
		--rc-loss: #c23b22;
		--rc-danger: #c23b22;
		--rc-font: 'IBM Plex Sans', 'PingFang SC', 'Hiragino Sans GB', sans-serif;

		min-height: 100%;
		padding: calc(1rem + var(--safe-top)) 1.1rem calc(1.5rem + var(--safe-bottom));
		color: var(--rc-ink);
		font-family: var(--rc-font);
		background: var(--rc-bg);
	}

	.rc-header,
	.rc-form,
	.rc-result {
		max-width: 28rem;
		margin-left: auto;
		margin-right: auto;
	}

	.rc-header h1 {
		font-size: 1.35rem;
		font-weight: 650;
		letter-spacing: 0.04em;
		line-height: 1.2;
	}

	.rc-lede {
		margin-top: 0.4rem;
		color: var(--rc-muted);
		font-size: 0.8125rem;
		line-height: 1.55;
	}

	.rc-form {
		margin-top: 1.25rem;
		border-top: 1px solid var(--rc-line);
	}

	.rc-field {
		padding: 0.85rem 0 0.7rem;
		border-bottom: 1px solid var(--rc-line);
	}

	.rc-label {
		display: block;
		margin-bottom: 0.4rem;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		color: var(--rc-muted);
	}

	.rc-input-wrap {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.75rem;
		border-bottom: 1px solid var(--rc-ink);
	}

	.rc-field.is-invalid .rc-input-wrap {
		border-bottom-color: var(--rc-danger);
	}

	.rc-field input {
		flex: 1;
		width: 100%;
		min-width: 0;
		height: 2.75rem;
		border: 0;
		background: transparent;
		color: var(--rc-ink);
		font-family: inherit;
		font-size: 16px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		outline: none;
		-webkit-appearance: none;
		appearance: none;

		&::placeholder {
			color: #a39c92;
			font-weight: 500;
		}

		&:focus-visible {
			outline: 2px solid var(--rc-gain);
			outline-offset: 4px;
		}
	}

	.rc-unit {
		flex-shrink: 0;
		color: var(--rc-muted);
		font-size: 0.8125rem;
	}

	.rc-error {
		margin: 0.4rem 0 0;
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--rc-danger);
	}

	.rc-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 0.7rem;
		margin-top: 0.55rem;
	}

	.rc-chips button {
		min-height: 2rem;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--rc-muted);
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		touch-action: manipulation;

		&[aria-pressed='true'] {
			color: var(--rc-ink);
			box-shadow: inset 0 -1px 0 var(--rc-ink);
		}

		&:hover {
			color: var(--rc-ink);
		}

		&:focus-visible {
			outline: 2px solid var(--rc-gain);
			outline-offset: 3px;
		}
	}

	.rc-result {
		margin-top: 1.35rem;
	}

	.rc-hero-label {
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		color: var(--rc-muted);
	}

	.rc-hero-value {
		margin-top: 0.25rem;
		font-size: clamp(2rem, 9vw, 2.75rem);
		font-weight: 650;
		letter-spacing: -0.03em;
		line-height: 1.15;
		font-variant-numeric: tabular-nums;
		word-break: break-all;

		&.is-empty {
			color: var(--rc-muted);
		}

		&.is-gain {
			color: var(--rc-gain);
		}

		&.is-loss {
			color: var(--rc-loss);
		}
	}

	.rc-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		margin: 1rem 0 1.15rem;
		padding: 0.85rem 0;
		border-top: 1px solid var(--rc-line);
		border-bottom: 1px solid var(--rc-line);

		div {
			min-width: 0;
		}

		dt {
			font-size: 0.7rem;
			letter-spacing: 0.08em;
			color: var(--rc-muted);
		}

		dd {
			margin-top: 0.25rem;
			font-variant-numeric: tabular-nums;
			font-size: 0.95rem;
			font-weight: 650;
			word-break: break-all;
		}

		.is-gain {
			color: var(--rc-gain);
		}

		.is-loss {
			color: var(--rc-loss);
		}
	}

	.rc-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;

		caption {
			caption-side: top;
			text-align: left;
			margin-bottom: 0.55rem;
			color: var(--rc-muted);
			font-size: 0.7rem;
			letter-spacing: 0.12em;
		}

		th,
		td {
			padding: 0.5rem 0.3rem;
			border-bottom: 1px solid var(--rc-line);
			font-variant-numeric: tabular-nums;
			text-align: right;
		}

		th[scope='col']:first-child,
		th[scope='row'] {
			text-align: left;
			color: var(--rc-muted);
			font-size: 0.7rem;
			font-weight: 500;
		}

		th[scope='col'] {
			color: var(--rc-muted);
			font-size: 0.7rem;
			font-weight: 500;
		}

		td {
			font-size: 0.84rem;
			font-weight: 650;
			word-break: break-all;
		}

		.is-active {
			color: var(--rc-ink);
			box-shadow: inset 0 -2px 0 var(--rc-ink);
		}

		.is-loss {
			color: var(--rc-loss);
		}
	}

	@media (min-width: $tablet-min) {
		.return-calculator {
			padding: calc(1.5rem + var(--safe-top)) 1.5rem calc(2rem + var(--safe-bottom));
		}

		.rc-header h1 {
			font-size: 1.6rem;
		}

		.rc-hero-value {
			font-size: 2.75rem;
		}
	}
</style>
