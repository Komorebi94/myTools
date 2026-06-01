import { watch, onUnmounted } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { getDeviceType } from '@/utils/index'

const MIN_ROOT_FONT = 14
const MAX_ROOT_FONT = 18
const BASE_WIDTH = 375
const BASE_FONT_SIZE = 16

export function useRootFontSize() {
	const { width } = useWindowSize()

	const setFontSize = () => {
		const screenWidth = width.value
		const deviceType = getDeviceType(screenWidth)
		let fontSize = (screenWidth / BASE_WIDTH) * BASE_FONT_SIZE

		if (deviceType === 'desktop') {
			fontSize = BASE_FONT_SIZE
		} else if (deviceType === 'tablet') {
			fontSize = Math.min(fontSize, 17)
		}

		fontSize = Math.min(Math.max(fontSize, MIN_ROOT_FONT), MAX_ROOT_FONT)
		document.documentElement.style.fontSize = `${fontSize}px`
	}

	watch(width, setFontSize, { immediate: true })

	onUnmounted(() => {
		document.documentElement.style.fontSize = ''
	})
}
