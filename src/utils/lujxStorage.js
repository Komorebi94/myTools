import { LUJX_STORAGE_KEY } from '@/constants/lujx'

const LEGACY_KEY = 'lujx_daily_checkin_v1'

export function loadLujxState () {
    try {
        let raw = localStorage.getItem(LUJX_STORAGE_KEY)
        let migratedFromLegacy = false
        if (!raw) {
            raw = localStorage.getItem(LEGACY_KEY)
            if (!raw) return { startDate: null, records: [] }
            migratedFromLegacy = true
        }

        const parsed = JSON.parse(raw)
        let state
        if (Array.isArray(parsed)) {
            state = migrateLegacyRecords(parsed)
        } else if (!parsed || typeof parsed !== 'object') {
            state = { startDate: null, records: [] }
        } else {
            const records = Array.isArray(parsed.records)
                ? parsed.records.filter((item) => item?.date && item.status === 'training')
                : []
            state = {
                startDate: typeof parsed.startDate === 'string' ? parsed.startDate : inferStartDate(records),
                records
            }
        }

        if (migratedFromLegacy) {
            saveLujxState(state)
            localStorage.removeItem(LEGACY_KEY)
        }

        return state
    } catch {
        return { startDate: null, records: [] }
    }
}

function migrateLegacyRecords (legacy) {
    const records = legacy.filter((item) => item?.date && (item.status === 'training' || item.status === 'rest'))
        .filter((item) => item.status === 'training')
    return {
        startDate: inferStartDate(records),
        records
    }
}

function inferStartDate (records) {
    if (!records.length) return null
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
    return sorted[0].date
}

export function saveLujxState (state) {
    localStorage.setItem(LUJX_STORAGE_KEY, JSON.stringify(state))
}

/** @param {unknown} data */
export function importLujxState (data) {
    if (!data || typeof data !== 'object') throw new Error('无效的备份格式')
    const records = Array.isArray(data.records)
        ? data.records.filter((item) => item?.date && item.status === 'training')
        : []
    const state = {
        startDate: typeof data.startDate === 'string' ? data.startDate : inferStartDate(records),
        records
    }
    saveLujxState(state)
    return state
}
