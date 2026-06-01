import { ref, watch } from 'vue'
import { useMediaQuery, useWindowSize } from '@vueuse/core'
import { getDeviceType } from '@/utils/index'

export function useDevice() {
	const { width } = useWindowSize()
	const reducedMotionQuery = useMediaQuery('(prefers-reduced-motion: reduce)')

	const deviceType = ref(getDeviceType())
	const reducedMotion = ref(reducedMotionQuery.value)

	watch(width, (w) => {
		deviceType.value = getDeviceType(w)
	})

	watch(reducedMotionQuery, (matches) => {
		reducedMotion.value = matches
	})

	return {
		deviceType,
		reducedMotion
	}
}
