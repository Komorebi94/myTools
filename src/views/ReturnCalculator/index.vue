<template>
	<div class="return-calculator" :class="{ 'is-keyboard-open': keyboardOpen }">
		<div class="rc-bg" aria-hidden="true" />

		<div class="rc-frame">
			<header class="rc-header">
				<h1>收益计算器</h1>
				<p class="rc-lede">终值 = 本金 × (1 + 年收益率) * 年数</p>
			</header>

			<div class="rc-layout">
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
						<p
							v-if="errorField === 'principalWan'"
							id="principal-error"
							class="rc-error"
						>
							{{ result.error }}
						</p>
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
								:aria-describedby="
									errorField === 'ratePercent' ? 'rate-error' : undefined
								"
								@focus="selectInput"
							/>
							<span class="rc-unit">%</span>
						</div>
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
						<p v-if="errorField === 'ratePercent'" id="rate-error" class="rc-error">
							{{ result.error }}
						</p>
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
								:aria-describedby="
									errorField === 'years' ? 'years-error' : undefined
								"
								@focus="selectInput"
							/>
							<span class="rc-unit">年</span>
						</div>
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
						<p v-if="errorField === 'years'" id="years-error" class="rc-error">
							{{ result.error }}
						</p>
					</div>
				</form>

				<section class="rc-panel" aria-labelledby="result-heading">
					<h2 id="result-heading" class="sr-only">计算结果</h2>
					<output
						class="rc-hero"
						for="principal-input rate-input years-input"
						aria-live="polite"
					>
						<p class="rc-hero-label">
							{{ result.ok ? `${result.years} 年后终值` : '无法计算' }}
						</p>
						<p class="rc-hero-value" :class="{ 'is-empty': !result.ok }">
							{{ result.ok ? result.finalWanText : '—' }}
						</p>
					</output>
					<dl class="rc-stats">
						<div>
							<dt>本金</dt>
							<dd>{{ principalText }}</dd>
						</div>
						<div>
							<dt>收益</dt>
							<dd>{{ result.ok ? result.profitWanText : '—' }}</dd>
						</div>
						<div>
							<dt>倍数</dt>
							<dd>{{ result.ok ? result.multipleText : '—' }}</dd>
						</div>
					</dl>

					<table class="rc-table">
						<caption>
							20 / 25 / 30 年对照
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
										result.ok && result.years === row.years ? 'true' : undefined
									"
									:class="{
										'is-active': result.ok && result.years === row.years
									}"
								>
									{{ row.result.ok ? row.result.finalWanText : '—' }}
								</td>
							</tr>
							<tr>
								<th scope="row">收益</th>
								<td
									v-for="row in milestones"
									:key="`p-${row.years}`"
									:aria-current="
										result.ok && result.years === row.years ? 'true' : undefined
									"
									:class="{
										'is-active': result.ok && result.years === row.years
									}"
								>
									{{ row.result.ok ? row.result.profitWanText : '—' }}
								</td>
							</tr>
						</tbody>
					</table>
				</section>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed, onMounted, onUnmounted, ref } from 'vue'
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

	const keyboardOpen = ref(false)
	const KEYBOARD_INSET_PX = 80

	function syncKeyboard() {
		const viewport = window.visualViewport
		if (!viewport) {
			keyboardOpen.value = false
			return
		}
		const inset = window.innerHeight - viewport.height - viewport.offsetTop
		keyboardOpen.value = inset > KEYBOARD_INSET_PX
	}

	function revealField(el) {
		if (!(el instanceof HTMLElement)) return
		requestAnimationFrame(() => {
			el.scrollIntoView({ block: 'center', inline: 'nearest' })
		})
	}

	onMounted(() => {
		syncKeyboard()
		window.visualViewport?.addEventListener('resize', syncKeyboard)
		window.visualViewport?.addEventListener('scroll', syncKeyboard)
	})

	onUnmounted(() => {
		window.visualViewport?.removeEventListener('resize', syncKeyboard)
		window.visualViewport?.removeEventListener('scroll', syncKeyboard)
	})

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

	const isPresetActive = (current, value) => Number(current) === value

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
		revealField(event.target)
	}

	function applyPreset(field, value) {
		fieldRefs[field].value = String(value)
		requestAnimationFrame(() => {
			const input = document.getElementById(PRESET_INPUT_IDS[field])
			input?.focus()
			revealField(input)
		})
	}

	function focusNextField(event) {
		const index = FIELD_IDS.indexOf(event.target.id)
		if (index < 0) return
		if (index === FIELD_IDS.length - 1) {
			event.target.blur()
			return
		}
		const next = document.getElementById(FIELD_IDS[index + 1])
		next?.focus()
		revealField(next)
	}
</script>

<style lang="scss">
	html:has(body.return-page-active),
	body.return-page-active,
	body.return-page-active #app {
		height: 100svh;
		overflow: hidden;
	}

	body.return-page-active {
		background: #0b100e;
	}
</style>

<style scoped lang="scss">
	.return-calculator {
		--rc-bg: #0b100e;
		--rc-text: #e7eadf;
		--rc-muted: #9aa394;
		--rc-gold: #d4b56a;
		--rc-gold-soft: rgba(212, 181, 106, 0.14);
		--rc-line: rgba(231, 234, 223, 0.14);
		--rc-danger: #e07a5f;
		--rc-font: 'IBM Plex Sans', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
		--rc-serif: 'IBM Plex Serif', 'Songti SC', serif;

		position: relative;
		box-sizing: border-box;
		height: 100svh;
		max-height: 100svh;
		display: flex;
		padding: calc(0.7rem + var(--safe-top)) 0.75rem calc(0.7rem + var(--safe-bottom));
		overflow: hidden;

		&.is-keyboard-open {
			overflow-y: auto;
		}
		color: var(--rc-text);
		font-family: var(--rc-font);
		background: var(--rc-bg);
	}

	.rc-bg {
		position: fixed;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(ellipse 80% 50% at 80% 0%, rgba(212, 181, 106, 0.1), transparent 55%),
			radial-gradient(ellipse 50% 40% at 0% 100%, rgba(46, 84, 58, 0.28), transparent 50%),
			#0b100e;
	}

	.rc-frame {
		position: relative;
		z-index: 1;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 68rem;
		margin: 0 auto;
		padding: 0.85rem 0.95rem 0.95rem;
		border: 1px solid rgba(212, 181, 106, 0.38);

		&::before,
		&::after {
			content: '';
			position: absolute;
			width: 0.7rem;
			height: 0.7rem;
			pointer-events: none;
		}

		&::before {
			top: -1px;
			left: -1px;
			border-top: 2px solid var(--rc-gold);
			border-left: 2px solid var(--rc-gold);
		}

		&::after {
			top: -1px;
			right: -1px;
			border-top: 2px solid var(--rc-gold);
			border-right: 2px solid var(--rc-gold);
		}
	}

	.rc-layout {
		position: relative;
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		gap: 0.55rem;
		margin-top: 0.7rem;

		&::before,
		&::after {
			content: '';
			position: absolute;
			width: 0.7rem;
			height: 0.7rem;
			pointer-events: none;
		}

		&::before {
			bottom: -0.95rem;
			left: -0.95rem;
			border-bottom: 2px solid var(--rc-gold);
			border-left: 2px solid var(--rc-gold);
		}

		&::after {
			bottom: -0.95rem;
			right: -0.95rem;
			border-bottom: 2px solid var(--rc-gold);
			border-right: 2px solid var(--rc-gold);
		}
	}

	.rc-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		flex-shrink: 0;
		padding-bottom: 0.65rem;
		border-bottom: 1px solid rgba(212, 181, 106, 0.28);
	}

	.rc-header h1 {
		font-family: var(--rc-serif);
		font-size: 1.2rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		line-height: 1.15;
	}

	.rc-lede {
		color: var(--rc-muted);
		font-size: 0.68rem;
		line-height: 1.4;
		text-align: right;
		letter-spacing: 0.02em;
	}

	.rc-form {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.rc-field {
		display: grid;
		grid-template-columns: 4.5rem minmax(4.2rem, 1fr) auto;
		align-items: center;
		column-gap: 0.5rem;
		min-height: 2.55rem;
		border-bottom: 1px solid var(--rc-line);
	}

	.rc-label {
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		color: var(--rc-muted);
	}

	.rc-input-wrap {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 2.55rem;
		transition: box-shadow 0.2s ease;

		&:focus-within {
			box-shadow: inset 0 -1px 0 var(--rc-gold);
		}
	}

	.rc-field.is-invalid .rc-input-wrap {
		box-shadow: inset 0 -1px 0 var(--rc-danger);
	}

	.rc-field input {
		flex: 1;
		width: 100%;
		min-width: 0;
		height: 2.55rem;
		border: 0;
		background: transparent;
		color: var(--rc-text);
		font-family: inherit;
		font-size: 16px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		text-align: right;
		outline: none;
		-webkit-appearance: none;
		appearance: none;

		&::placeholder {
			color: #5f675e;
			font-weight: 500;
		}
	}

	.rc-unit {
		flex-shrink: 0;
		width: 1.1rem;
		color: var(--rc-gold);
		font-size: 0.68rem;
		letter-spacing: 0.06em;
	}

	.rc-error {
		grid-column: 2 / -1;
		margin: 0 0 0.2rem;
		font-size: 0.68rem;
		line-height: 1.3;
		color: var(--rc-danger);
	}

	.rc-chips {
		display: flex;
		flex-wrap: nowrap;
		justify-content: flex-end;
		gap: 0.1rem;
	}

	.rc-chips button {
		min-height: 2rem;
		padding: 0 0.4rem;
		border: 0;
		background: transparent;
		color: var(--rc-muted);
		font-family: inherit;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		touch-action: manipulation;
		transition: color 0.2s ease;

		&[aria-pressed='true'] {
			color: var(--rc-gold);
		}

		&:hover {
			color: var(--rc-text);
		}

		&:focus-visible {
			outline: 1px solid var(--rc-gold);
			outline-offset: 2px;
		}
	}

	.rc-panel {
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.rc-hero {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.rc-hero-label {
		color: var(--rc-gold);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.22em;
	}

	.rc-hero-value {
		margin-top: 0.15rem;
		font-family: var(--rc-serif);
		font-size: clamp(2.1rem, 8vh, 3.6rem);
		font-weight: 600;
		letter-spacing: -0.04em;
		line-height: 1.05;
		font-variant-numeric: tabular-nums;
		word-break: break-all;
		text-shadow: 0 0 28px rgba(212, 181, 106, 0.12);

		&.is-empty {
			color: var(--rc-muted);
			text-shadow: none;
		}
	}

	.rc-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.5rem;
		flex-shrink: 0;
		margin: 0;
		padding: 0.55rem 0;
		border-top: 1px solid rgba(212, 181, 106, 0.28);

		div {
			min-width: 0;
		}

		dt {
			color: var(--rc-muted);
			font-size: 0.62rem;
			letter-spacing: 0.14em;
		}

		dd {
			margin-top: 0.2rem;
			font-variant-numeric: tabular-nums;
			font-size: 0.88rem;
			font-weight: 600;
			word-break: break-all;
		}
	}

	.rc-table {
		width: 100%;
		flex-shrink: 0;
		border-collapse: collapse;
		table-layout: fixed;

		caption {
			caption-side: top;
			text-align: left;
			margin-bottom: 0.3rem;
			color: var(--rc-muted);
			font-size: 0.62rem;
			font-weight: 600;
			letter-spacing: 0.16em;
		}

		th,
		td {
			padding: 0.38rem 0.28rem;
			border-bottom: 1px solid var(--rc-line);
			font-variant-numeric: tabular-nums;
			text-align: right;
		}

		th[scope='col']:first-child,
		th[scope='row'] {
			text-align: left;
			color: var(--rc-muted);
			font-size: 0.62rem;
			font-weight: 500;
			letter-spacing: 0.08em;
		}

		th[scope='col'] {
			color: var(--rc-muted);
			font-size: 0.62rem;
			font-weight: 500;
			letter-spacing: 0.08em;
		}

		td {
			font-size: 0.8rem;
			font-weight: 600;
			word-break: break-all;
		}

		.is-active {
			color: var(--rc-gold);
			box-shadow: inset 0 -1px 0 var(--rc-gold);
		}
	}

	@media (max-width: 379px) {
		.rc-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.2rem;
		}

		.rc-lede {
			text-align: left;
		}

		.rc-field {
			grid-template-columns: 4.4rem minmax(0, 1fr);
		}

		.rc-chips {
			grid-column: 2;
		}
	}

	@media (min-width: $tablet-min) {
		.return-calculator {
			padding: calc(1.1rem + var(--safe-top)) 1.25rem calc(1.1rem + var(--safe-bottom));
		}

		.rc-frame {
			padding: 1.15rem 1.35rem 1.25rem;
		}

		.rc-header h1 {
			font-size: 1.55rem;
			letter-spacing: 0.16em;
		}

		.rc-lede {
			font-size: 0.75rem;
		}

		.rc-layout {
			grid-template-rows: 1fr;
			grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
			gap: 2.25rem;
			margin-top: 0.9rem;

			&::before {
				bottom: -1.25rem;
				left: -1.35rem;
			}

			&::after {
				bottom: -1.25rem;
				right: -1.35rem;
			}
		}

		.rc-form {
			height: 100%;
			justify-content: space-evenly;
			padding-right: 0.75rem;
			border-right: 1px solid rgba(212, 181, 106, 0.22);
		}

		.rc-field {
			min-height: 3.1rem;
		}

		.rc-hero-value {
			font-size: clamp(3rem, 8vh, 5.2rem);
		}

		.rc-panel {
			padding-left: 0.25rem;
		}
	}
</style>
