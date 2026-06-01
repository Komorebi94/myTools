import { ref, nextTick } from 'vue'
import gsap from 'gsap'

const CONFETTI_COLORS = ['#ff6bcb', '#ffd166', '#a78bfa', '#60a5fa', '#34d399', '#fb7185']

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function useBirthdayCelebration({
	reducedMotion,
	deviceType,
	messageBoxRef,
	titleRefs,
	onStartEffects
}) {
	const celebrated = ref(false)
	const litCount = ref(0)
	const showConfetti = ref(false)
	const confettiPieces = ref([])
	const showFlash = ref(false)

	let flashTimer = null

	const getConfettiCount = () => (deviceType.value === 'mobile' ? 32 : 56)

	const spawnConfetti = () => {
		const count = getConfettiCount()
		confettiPieces.value = Array.from({ length: count }, (_, i) => ({
			id: `c-${i}-${Date.now()}`,
			style: {
				left: `${Math.random() * 100}%`,
				background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
				animationDelay: `${Math.random() * 0.9}s`,
				animationDuration: `${2.4 + Math.random() * 2.2}s`,
				'--drift': `${(Math.random() - 0.5) * 80}px`
			}
		}))
		showConfetti.value = true
	}

	const triggerFlash = () => {
		if (reducedMotion.value) return
		if (flashTimer) clearTimeout(flashTimer)
		showFlash.value = true
		flashTimer = setTimeout(() => {
			showFlash.value = false
			flashTimer = null
		}, 450)
	}

	const lightCandles = async () => {
		litCount.value = 0
		if (reducedMotion.value) {
			litCount.value = 5
			return
		}

		for (let i = 1; i <= 5; i++) {
			await delay(280)
			litCount.value = i
			if (navigator.vibrate) navigator.vibrate(18)
		}
	}

	const animateTitleEntrance = () => {
		nextTick(() => {
			const chars = titleRefs.value.filter(Boolean)
			if (!chars.length) return

			if (reducedMotion.value) {
				gsap.set(chars, { opacity: 1, y: 0, scale: 1 })
				return
			}

			gsap.fromTo(
				chars,
				{ y: 40, opacity: 0, scale: 0.2, rotate: -8 },
				{
					y: 0,
					opacity: 1,
					scale: 1,
					rotate: 0,
					duration: 0.9,
					ease: 'back.out(2.2)',
					stagger: 0.055
				}
			)
		})
	}

	const animateCardEntrance = () => {
		if (!messageBoxRef.value) return
		if (reducedMotion.value) {
			gsap.set(messageBoxRef.value, { opacity: 1, scale: 1 })
			return
		}
		gsap.fromTo(
			messageBoxRef.value,
			{ scale: 0.82, opacity: 0, y: 24 },
			{ scale: 1, opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }
		)
	}

	const animateCelebratePulse = () => {
		nextTick(() => {
			const chars = titleRefs.value.filter(Boolean)
			if (reducedMotion.value || !chars.length) return

			gsap.to(chars, {
				scale: 1.12,
				duration: 0.35,
				ease: 'power2.out',
				stagger: 0.03,
				yoyo: true,
				repeat: 1
			})

			if (messageBoxRef.value) {
				gsap.fromTo(
					messageBoxRef.value,
					{ scale: 1 },
					{ scale: 1.04, duration: 0.45, ease: 'power2.out', yoyo: true, repeat: 1 }
				)
			}
		})
	}

	const runCelebrate = async () => {
		if (celebrated.value) return
		celebrated.value = true

		triggerFlash()
		await lightCandles()
		animateCelebratePulse()
		spawnConfetti()
		onStartEffects?.()

		if (!reducedMotion.value && navigator.vibrate) {
			navigator.vibrate([60, 40, 100, 40, 140])
		}
	}

	const destroy = () => {
		if (flashTimer) {
			clearTimeout(flashTimer)
			flashTimer = null
		}
	}

	return {
		celebrated,
		litCount,
		showConfetti,
		confettiPieces,
		showFlash,
		animateCardEntrance,
		animateTitleEntrance,
		runCelebrate,
		destroy
	}
}
