import { BREAKPOINTS } from '@/constants/breakpoints'

export { BREAKPOINTS }

/** @returns {'mobile' | 'tablet' | 'desktop'} */
export const getDeviceType = (width = window.innerWidth) => {
	if (width < BREAKPOINTS.mobile) return 'mobile'
	if (width < BREAKPOINTS.tablet) return 'tablet'
	return 'desktop'
}

export const isTouchDevice = () => {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const prefersReducedMotion = () => {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const getNextNewYear = () => {
	const now = new Date()
	const year = now.getFullYear()
	const thisNewYear = new Date(`${year}-01-01T00:00:00`)
	const targetYear = now >= thisNewYear ? year + 1 : year
	return new Date(`${targetYear}-01-01T00:00:00`)
}

const FIREWORKS_TIER = {
	mobile: { particles: 32, intensity: 22, flickering: 40 },
	tablet: { particles: 42, intensity: 26, flickering: 45 },
	desktop: { particles: 55, intensity: 32, flickering: 50 }
}

export const createFireworksOptions = (
	deviceType,
	{ interactive = false, reducedMotion = false, theme = 'default' } = {}
) => {
	const tier = FIREWORKS_TIER[deviceType] || FIREWORKS_TIER.desktop
	const motionScale = reducedMotion ? 0.6 : 1
	const hue = theme === 'birthday' ? { min: 280, max: 55 } : { min: 0, max: 360 }

	return {
		autoresize: true,
		opacity: 0.55,
		acceleration: 1.05,
		friction: 0.97,
		gravity: 1.4,
		particles: Math.round(tier.particles * motionScale),
		traceLength: reducedMotion ? 2 : 3,
		traceSpeed: 10,
		explosion: 5,
		intensity: Math.round(tier.intensity * motionScale),
		flickering: tier.flickering,
		lineStyle: 'round',
		hue,
		delay: { min: 30, max: 60 },
		rocketsPoint: { min: 50, max: 50 },
		lineWidth: {
			explosion: { min: 1, max: 3 },
			trace: { min: 1, max: 2 }
		},
		brightness: { min: 50, max: 80 },
		decay: { min: 0.015, max: 0.03 },
		mouse: {
			click: interactive,
			move: interactive && deviceType === 'desktop',
			max: interactive ? 5 : 1
		}
	}
}

export const getBarrageDensity = (deviceType, reducedMotion = false) => {
	if (reducedMotion) return 'low'
	if (deviceType === 'mobile') return 'medium'
	return 'high'
}

/** 分享用姓名：去首尾空格、限制长度、过滤特殊字符 */
export const sanitizeShareName = (name) => {
	return String(name ?? '')
		.trim()
		.slice(0, 20)
		.replace(/[<>"'&]/g, '')
}

export const buildCelebrationMessage = (name) => {
	const safe = sanitizeShareName(name)
	if (!safe) return ['🎉 ', '新', '年', '快', '乐', ' 🎉']
	return ['🎉 ', ...`${safe}，新年快乐！`.split(''), ' 🎉']
}

export const buildPersonalizedBarrage = (name, baseMessages = []) => {
	const safe = sanitizeShareName(name)
	if (!safe) return baseMessages
	const personalized = [`${safe}，新年快乐！`, `祝${safe}万事如意`, `${safe}，Happy New Year!`]
	return [...personalized, ...baseMessages]
}

export const buildShareUrl = (params = {}) => {
	const url = new URL(window.location.href)
	url.search = ''
	Object.entries(params).forEach(([key, value]) => {
		if (value != null && value !== '') url.searchParams.set(key, String(value))
	})
	return url.toString()
}
