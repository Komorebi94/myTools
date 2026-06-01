import { ref, computed, watch, nextTick } from 'vue'
import { useDocumentVisibility, useIntervalFn } from '@vueuse/core'
import gsap from 'gsap'

export function useCountdown(targetDate, { reducedMotion, onCelebrate, onFinalHaptic } = {}) {
	const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
	const isFinalCountdown = ref(false)
	const finalSeconds = ref(10)
	const isTimeUp = ref(false)

	const countdownNumber = ref(null)
	let celebrationTriggered = false

	const isCompactCountdown = computed(() => {
		const { days, hours } = countdown.value
		return days === 0 && hours < 1 && !isFinalCountdown.value
	})

	const ariaCountdownText = computed(() => {
		if (isTimeUp.value) return '新年快乐'
		if (isFinalCountdown.value) return `倒计时 ${finalSeconds.value} 秒`
		const { days, hours, minutes, seconds } = countdown.value
		if (isCompactCountdown.value) {
			return `距离新年还有 ${hours} 小时 ${minutes} 分 ${seconds} 秒`
		}
		return `距离新年还有 ${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`
	})

	const formatNumber = (number) => number.toString().padStart(2, '0')

	const triggerCelebrate = () => {
		if (celebrationTriggered) return
		celebrationTriggered = true
		isTimeUp.value = true
		isFinalCountdown.value = false
		pause()
		pauseFinal()
		onCelebrate?.()
	}

	const animateFinalCountdown = () => {
		if (reducedMotion.value) return

		nextTick(() => {
			if (!countdownNumber.value) return

			gsap.fromTo(
				countdownNumber.value,
				{ scale: 2, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					duration: 0.9,
					ease: 'bounce.out'
				}
			)
		})
	}

	const tickFinal = () => {
		if (finalSeconds.value > 1) {
			finalSeconds.value -= 1
			onFinalHaptic?.(finalSeconds.value <= 3 ? 50 : 25)
			animateFinalCountdown()
		} else {
			pauseFinal()
			triggerCelebrate()
		}
	}

	const { pause: pauseFinal, resume: resumeFinal } = useIntervalFn(tickFinal, 1000, {
		immediate: false
	})

	const startFinalCountdown = () => {
		pause()
		onFinalHaptic?.(25)
		animateFinalCountdown()
		resumeFinal()
	}

	const updateCountdown = () => {
		const now = new Date()
		const target = new Date(targetDate.value)
		const timeDifference = target - now

		if (timeDifference <= 0) {
			triggerCelebrate()
			return
		}

		const seconds = Math.floor((timeDifference / 1000) % 60)
		const minutes = Math.floor((timeDifference / (1000 * 60)) % 60)
		const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24)
		const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

		countdown.value = { days, hours, minutes, seconds }

		if (days === 0 && hours === 0 && minutes === 0 && seconds <= 10) {
			if (!isFinalCountdown.value) {
				isFinalCountdown.value = true
				finalSeconds.value = seconds
				startFinalCountdown()
			}
		}
	}

	const { pause, resume } = useIntervalFn(updateCountdown, 1000, { immediate: false })

	const syncFinalSecondsFromClock = () => {
		const target = new Date(targetDate.value)
		const diff = target - new Date()
		if (diff <= 0) {
			triggerCelebrate()
			return
		}

		const seconds = Math.floor((diff / 1000) % 60)
		const minutes = Math.floor((diff / (1000 * 60)) % 60)
		const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
		const days = Math.floor(diff / (1000 * 60 * 60 * 24))

		if (days === 0 && hours === 0 && minutes === 0 && seconds <= 10) {
			finalSeconds.value = seconds
			if (!isFinalCountdown.value) {
				isFinalCountdown.value = true
				pause()
				resumeFinal()
			}
			return
		}

		isFinalCountdown.value = false
		pauseFinal()
		updateCountdown()
		if (!celebrationTriggered) resume()
	}

	const visibility = useDocumentVisibility()
	watch(visibility, (state) => {
		if (state === 'visible' && !celebrationTriggered) {
			if (isFinalCountdown.value) {
				syncFinalSecondsFromClock()
			} else {
				updateCountdown()
			}
		}
	})

	const start = () => {
		updateCountdown()
		if (!celebrationTriggered) resume()
	}

	const stop = () => {
		pause()
		pauseFinal()
	}

	return {
		countdown,
		isFinalCountdown,
		finalSeconds,
		isTimeUp,
		isCompactCountdown,
		ariaCountdownText,
		countdownNumber,
		formatNumber,
		start,
		stop
	}
}
