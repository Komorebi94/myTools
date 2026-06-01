/** 解析 ?day=N 模拟课次（仅预览训练计划，不影响本地存储） */
export function parseSimDay(queryDay) {
	if (queryDay === undefined || queryDay === null || queryDay === '') {
		return null
	}
	const n = parseInt(String(queryDay), 10)
	if (Number.isNaN(n) || n < 0) return null
	return Math.min(n, 999)
}
