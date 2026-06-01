import { ref, onMounted, onUnmounted } from 'vue'
import { formatDateKey } from '@/utils/date'

/** 响应式「今天」日期；页面重新可见时自动刷新（跨午夜） */
export function useTodayKey () {
    const todayKey = ref(formatDateKey())
    const todayDate = ref(startOfLocalDay())

    function refreshToday () {
        todayKey.value = formatDateKey()
        todayDate.value = startOfLocalDay()
    }

    function onVisibility () {
        if (document.visibilityState === 'visible') refreshToday()
    }

    onMounted(() => {
        document.addEventListener('visibilitychange', onVisibility)
    })

    onUnmounted(() => {
        document.removeEventListener('visibilitychange', onVisibility)
    })

    return { todayKey, todayDate, refreshToday }
}

function startOfLocalDay () {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}
