/**
 * @param {Date} [date]
 * @returns {string} YYYY-MM-DD（本地日历日）
 */
export function formatDateKey (date = new Date()) {
    const d = date instanceof Date ? date : new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/** @deprecated 使用 formatDateKey */
export const getDateKey = formatDateKey

/**
 * @param {string} todayKey YYYY-MM-DD
 */
export function getYesterdayKey (todayKey) {
    const [y, m, d] = todayKey.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    date.setDate(date.getDate() - 1)
    return formatDateKey(date)
}

/**
 * 当周周一 00:00（本地）
 * @param {Date} [today]
 */
export function startOfWeekMonday (today = new Date()) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dayOfWeek = day.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(day)
    monday.setDate(day.getDate() + mondayOffset)
    return monday
}
