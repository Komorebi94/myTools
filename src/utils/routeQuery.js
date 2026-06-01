/**
 * @param {import('vue-router').RouteLocationNormalizedLoaded['query']} query
 * @param {string} key
 * @returns {string | undefined}
 */
export function getQueryString (query, key) {
    const raw = query[key]
    if (Array.isArray(raw)) return raw[0]
    return typeof raw === 'string' ? raw : undefined
}

/**
 * @param {import('vue-router').RouteLocationNormalizedLoaded['query']} query
 * @param {string} key
 * @returns {number | null} 正整数或 null
 */
export function parseQueryPositiveInt (query, key) {
    const raw = getQueryString(query, key)
    const n = Number(raw)
    return Number.isInteger(n) && n > 0 ? n : null
}
