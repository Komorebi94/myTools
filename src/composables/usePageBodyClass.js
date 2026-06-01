import { onMounted, onUnmounted } from 'vue'

/**
 * @param {string} className
 */
export function usePageBodyClass(className) {
	onMounted(() => {
		document.body.classList.add(className)
	})

	onUnmounted(() => {
		document.body.classList.remove(className)
	})
}
