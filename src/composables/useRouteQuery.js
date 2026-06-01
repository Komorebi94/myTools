import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getNextNewYear, sanitizeShareName, buildPersonalizedBarrage } from '@/utils/index'

const DEFAULT_MESSAGES = [
	'新年快乐！',
	'Happy New Year!',
	'🎉 万事如意',
	'🎊 心想事成',
	'✨ 阖家幸福',
	'🧧 大吉大利',
	'🎆 岁岁平安',
	'🌟 前程似锦',
	'💫 龙马精神',
	'🎇 财源广进'
]

/**
 * 解析 URL 查询参数
 */
export function useRouteQuery() {
	const route = useRoute()

	const isTestEffect = computed(() => route.query.testEffect === 'true')

	const isOnlyFireworks = computed(
		() => route.query.onlyShowFireWorks === 'true' && !isTestEffect.value
	)

	const shareName = computed(() => {
		const raw = route.query.name
		if (typeof raw !== 'string') return ''
		return sanitizeShareName(raw)
	})

	const barrageMessages = computed(() => {
		const raw = route.query.messages
		const base =
			typeof raw === 'string' && raw.trim()
				? raw
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: [...DEFAULT_MESSAGES]
		return buildPersonalizedBarrage(shareName.value, base)
	})

	const targetDate = computed(() => {
		if (isTestEffect.value) {
			return new Date(Date.now() + 15 * 1000)
		}

		const custom = route.query.target
		if (typeof custom === 'string' && custom.trim()) {
			const parsed = new Date(custom.trim())
			if (!Number.isNaN(parsed.getTime())) return parsed
		}

		const envTarget = import.meta.env.VITE_DEFAULT_TARGET
		if (envTarget) {
			const parsed = new Date(envTarget)
			if (!Number.isNaN(parsed.getTime())) return parsed
		}

		return getNextNewYear()
	})

	return {
		isTestEffect,
		isOnlyFireworks,
		shareName,
		barrageMessages,
		targetDate
	}
}
