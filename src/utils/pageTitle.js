export const DEFAULT_PAGE_TITLE = '新年快乐 · 跨年倒计时'

export const ROUTE_TITLES = {
	HappyNewYear: '新年快乐 · 跨年倒计时',
	Birthday: '生日快乐',
	FitnessDiscipline: '笑笑的存钱罐',
	LujxPlan: 'LUJX 训练计划'
}

export const FITNESS_TAB_TITLES = {
	home: '笑笑的存钱罐',
	records: '训练台账 · 笑笑的存钱罐',
	settings: '规则说明 · 笑笑的存钱罐'
}

export const LUJX_TAB_TITLES = {
	today: '今日训练 · LUJX',
	plan: '进阶计划 · LUJX',
	records: '日历记录 · LUJX'
}

export function setPageTitle(title) {
	if (typeof document === 'undefined') return
	document.title = title?.trim() || DEFAULT_PAGE_TITLE
}

export function resolveRouteTitle(to) {
	if (!to?.name) return DEFAULT_PAGE_TITLE

	if (to.name === 'LujxPlan') {
		const tab = Array.isArray(to.query.tab) ? to.query.tab[0] : to.query.tab
		return LUJX_TAB_TITLES[tab] || LUJX_TAB_TITLES.today
	}

	return ROUTE_TITLES[to.name] || DEFAULT_PAGE_TITLE
}
