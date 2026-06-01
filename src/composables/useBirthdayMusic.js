import { ref, computed, onMounted, onUnmounted } from 'vue'
import { resolveAppBase } from '@/utils/resolveAppBase'

const BGM_PATH = 'audio/happy-birthday.mp3'
const DEFAULT_VOLUME = 0.38

export function useBirthdayMusic({ musicEnabled, reducedMotion }) {
	const isMuted = ref(false)
	const isPlaying = ref(false)
	const needsGesture = ref(false)

	let audio = null

	const audioSrc = computed(() => `${resolveAppBase()}${BGM_PATH}`)

	const initAudio = () => {
		if (audio || !musicEnabled.value) return
		audio = new Audio(audioSrc.value)
		audio.loop = true
		audio.volume = DEFAULT_VOLUME
		audio.preload = 'auto'
	}

	const play = async () => {
		if (!musicEnabled.value || isMuted.value) return
		initAudio()
		if (!audio) return

		try {
			await audio.play()
			isPlaying.value = true
			needsGesture.value = false
		} catch {
			needsGesture.value = true
			isPlaying.value = false
		}
	}

	const pause = () => {
		if (!audio) return
		audio.pause()
		isPlaying.value = false
	}

	const toggleMute = async () => {
		isMuted.value = !isMuted.value
		if (!audio) initAudio()
		if (!audio) return

		audio.muted = isMuted.value
		if (isMuted.value) {
			pause()
			return
		}
		await play()
	}

	const resumeOnGesture = () => {
		if (!needsGesture.value || isMuted.value) return
		play()
	}

	onMounted(() => {
		if (musicEnabled.value && !reducedMotion.value) initAudio()
	})

	onUnmounted(() => {
		if (audio) {
			audio.pause()
			audio.src = ''
			audio = null
		}
	})

	return {
		isMuted,
		isPlaying,
		needsGesture,
		play,
		pause,
		toggleMute,
		resumeOnGesture,
		showMusicControl: musicEnabled
	}
}
