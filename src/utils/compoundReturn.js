export const PRINCIPAL_WAN_RANGE = { min: 0.01, max: 100000 }
export const RATE_PERCENT_RANGE = { min: 0, max: 100 }
export const YEARS_RANGE = { min: 1, max: 80 }

export const PRINCIPAL_WAN_PRESETS = [30, 50]
export const RATE_PERCENT_PRESETS = [8, 10, 15]
export const YEAR_PRESETS = [20, 25, 30]

const WAN_DIGITS = 1

/**
 * 年复利终值（万）= 本金（万）× (1 + 年收益率)^年数
 * @param {number} principalWan
 * @param {number} ratePercent
 * @param {number} years
 */
export function compoundWan(principalWan, ratePercent, years) {
	return principalWan * (1 + ratePercent / 100) ** years
}

export function roundTo(value, digits = WAN_DIGITS) {
	const factor = 10 ** digits
	return Math.round((value + Number.EPSILON) * factor) / factor
}

export function formatWan(value, digits = WAN_DIGITS) {
	if (!Number.isFinite(value)) return '—'
	const rounded = roundTo(value, digits)
	return `${new Intl.NumberFormat('zh-CN', {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(rounded)}万`
}

export function formatMultiple(value) {
	if (!Number.isFinite(value)) return '—'
	const digits = value >= 100 ? 0 : 1
	const rounded = roundTo(value, digits)
	return `${new Intl.NumberFormat('zh-CN', {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(rounded)} 倍`
}

/**
 * @param {unknown} raw
 * @param {{ min: number, max: number, integer?: boolean, emptyError: string, rangeError: string }} options
 * @returns {{ ok: true, value: number } | { ok: false, error: string }}
 */
export function parseBoundedNumber(raw, { min, max, integer = false, emptyError, rangeError }) {
	if (raw === '' || raw == null) {
		return { ok: false, error: emptyError }
	}

	const n = typeof raw === 'number' ? raw : Number(String(raw).trim())
	if (!Number.isFinite(n)) {
		return { ok: false, error: rangeError }
	}

	const value = integer ? Math.round(n) : n
	if (integer && Math.abs(n - value) > 1e-9) {
		return { ok: false, error: rangeError }
	}
	if (value < min || value > max) {
		return { ok: false, error: rangeError }
	}

	return { ok: true, value }
}

/**
 * @param {{ principalWan: unknown, ratePercent: unknown, years: unknown }} input
 */
export function calculateCompoundReturn({ principalWan, ratePercent, years }) {
	const principal = parseBoundedNumber(principalWan, {
		...PRINCIPAL_WAN_RANGE,
		emptyError: '请填写初始资金',
		rangeError: `初始资金需在 ${PRINCIPAL_WAN_RANGE.min}–${PRINCIPAL_WAN_RANGE.max} 万之间`
	})
	if (!principal.ok) {
		return { ok: false, field: 'principalWan', error: principal.error }
	}

	const rate = parseBoundedNumber(ratePercent, {
		...RATE_PERCENT_RANGE,
		emptyError: '请填写年收益率',
		rangeError: `年收益率需在 ${RATE_PERCENT_RANGE.min}–${RATE_PERCENT_RANGE.max}% 之间`
	})
	if (!rate.ok) {
		return { ok: false, field: 'ratePercent', error: rate.error }
	}

	const year = parseBoundedNumber(years, {
		...YEARS_RANGE,
		integer: true,
		emptyError: '请填写年数',
		rangeError: `年数需为 ${YEARS_RANGE.min}–${YEARS_RANGE.max} 的整数`
	})
	if (!year.ok) {
		return { ok: false, field: 'years', error: year.error }
	}

	const finalWan = compoundWan(principal.value, rate.value, year.value)
	if (!Number.isFinite(finalWan)) {
		return { ok: false, field: 'years', error: '结果过大，请减小年数或收益率' }
	}

	const profitWan = finalWan - principal.value
	const multiple = finalWan / principal.value

	return {
		ok: true,
		principalWan: principal.value,
		ratePercent: rate.value,
		years: year.value,
		finalWan,
		profitWan,
		multiple,
		finalWanText: formatWan(finalWan),
		profitWanText: formatWan(profitWan),
		multipleText: formatMultiple(multiple)
	}
}

/**
 * @param {{ principalWan: unknown, ratePercent: unknown, yearsList?: number[] }} input
 */
export function milestoneReturns({ principalWan, ratePercent, yearsList = YEAR_PRESETS }) {
	return yearsList.map((years) => {
		const result = calculateCompoundReturn({ principalWan, ratePercent, years })
		return { years, result }
	})
}
