import { ref, computed, watch } from 'vue'
import { Fireworks } from 'fireworks-js'
import { createFireworksOptions, isTouchDevice } from '@/utils/index'

export function useFireworks(wrapperRef, { deviceType, reducedMotion, theme = 'default' }) {
	const showFireworksHint = ref(false)
	let fireworksInstance = null
	let hintTimer = null

	const touchDevice = isTouchDevice()

	const fireworksInteractive = computed(() => {
		if (reducedMotion.value) return false
		return deviceType.value === 'desktop' || touchDevice
	})

	const hintText = computed(() => {
		if (deviceType.value === 'desktop') return '点击或移动鼠标，绽放烟花'
		return '点击屏幕，绽放烟花'
	})

	const clearHintTimer = () => {
		if (hintTimer) {
			clearTimeout(hintTimer)
			hintTimer = null
		}
	}

	const showHintTemporarily = () => {
		if (!fireworksInteractive.value) return
		clearHintTimer()
		showFireworksHint.value = true
		hintTimer = setTimeout(() => {
			showFireworksHint.value = false
			hintTimer = null
		}, 3200)
	}

	const dismissHint = () => {
		clearHintTimer()
		showFireworksHint.value = false
	}

	const stopFireworks = () => {
		if (fireworksInstance) {
			fireworksInstance.stop()
			fireworksInstance = null
		}
	}

	const startFireworks = () => {
		if (fireworksInstance || !wrapperRef.value) return

		const options = createFireworksOptions(deviceType.value, {
			interactive: fireworksInteractive.value,
			reducedMotion: reducedMotion.value,
			theme
		})

		fireworksInstance = new Fireworks(wrapperRef.value, options)
		fireworksInstance.start()
	}

	const refreshFireworks = () => {
		if (!fireworksInstance) return
		stopFireworks()
		startFireworks()
	}

	watch([deviceType, reducedMotion], () => {
		if (fireworksInstance) refreshFireworks()
	})

	const onWrapperTap = (event) => {
		if (!fireworksInteractive.value) return

		if (!fireworksInstance) {
			startFireworks()
			return
		}

		dismissHint()

		// 将点击坐标转发给 canvas（避免被上层 UI 挡住时无法触发）
		const canvas = wrapperRef.value?.querySelector('canvas')
		if (!canvas || !event) return

		canvas.dispatchEvent(
			new MouseEvent('click', {
				clientX: event.clientX,
				clientY: event.clientY,
				bubbles: true
			})
		)
	}

	const destroy = () => {
		clearHintTimer()
		stopFireworks()
	}

	return {
		showFireworksHint,
		hintText,
		fireworksInteractive,
		startFireworks,
		stopFireworks,
		refreshFireworks,
		showHintTemporarily,
		dismissHint,
		onWrapperTap,
		destroy
	}
}
