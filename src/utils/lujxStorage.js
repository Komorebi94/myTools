import { LUJX_STORAGE_KEY } from '@/constants/lujx'

const LEGACY_KEY = 'lujx_daily_checkin_v1'

export function loadLujxState () {
    try {
        let raw = localStorage.getItem(LUJX_STORAGE_KEY)
        if (!raw) {
            raw = localStorage.getItem(LEGACY_KEY)
            if (!raw) return { startDate: null, records: [] }
        }

        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
            return migrateLegacyRecords(parsed)
        }
        if (!parsed || typeof parsed !== 'object') return { startDate: null, records: [] }

        const records = Array.isArray(parsed.records)
            ? parsed.records.filter((item) => item?.date && item.status === 'training')
            : []
        return {
            startDate: typeof parsed.startDate === 'string' ? parsed.startDate : inferStartDate(records),
            records
        }
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
