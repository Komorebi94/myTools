import { ref, nextTick, watch } from 'vue'
import gsap from 'gsap'
import { buildCelebrationMessage } from '@/utils/index'

export function useCelebration({ reducedMotion, shareName }) {
	const showBarrage = ref(false)
	const showFlash = ref(false)
	const newYearMessage = ref(buildCelebrationMessage(shareName?.value))

	watch(shareName, (name) => {
		newYearMessage.value = buildCelebrationMessage(name)
	})
	const messageEl = ref(null)

	let flashTimer = null

	const setMessageRef = (el) => {
		messageEl.value = el
	}

	const triggerFlash = () => {
		if (reducedMotion.value) return
		if (flashTimer) clearTimeout(flashTimer)
		showFlash.value = true
		flashTimer = setTimeout(() => {
			showFlash.value = false
			flashTimer = null
		}, 380)
	}

	const triggerHaptic = (pattern = 30) => {
		if (reducedMotion.value || !navigator.vibrate) return
		navigator.vibrate(pattern)
	}

	const startNewYearAnimation = (attempt = 0) => {
		nextTick(() => {
			const el = messageEl.value

			if (!el && attempt < 8) {
				startNewYearAnimation(attempt + 1)
				return
			}

			if (!el) return

			if (reducedMotion.value) {
				gsap.set(el, { clearProps: 'all', scale: 1, opacity: 1, y: 0 })
				return
			}

			gsap.fromTo(
				el,
				{ scale: 0.6, opacity: 0, y: 30 },
				{
					scale: 1,
					opacity: 1,
					y: 0,
					duration: 1,
					ease: 'bounce.out'
				}
			)
		})
	}

	const runCelebration = (callbacks = {}) => {
		triggerHaptic([80, 40, 120])
		triggerFlash()
		callbacks.onFireworks?.()
		callbacks.onHint?.()

		showBarrage.value = true
		// 等待庆祝区块 Transition 挂载后再取 ref，避免 messageEl 被提前清空
		nextTick(() => {
			nextTick(() => startNewYearAnimation())
		})
	}

	const destroy = () => {
		if (flashTimer) {
			clearTimeout(flashTimer)
			flashTimer = null
		}
	}

	return {
		showBarrage,
		showFlash,
		newYearMessage,
		setMessageRef,
		triggerFlash,
		triggerHaptic,
		runCelebration,
		destroy
	}
}
