<template>
	<router-view />
</template>

<script setup>
	import { useRootFontSize } from '@/composables/useRootFontSize'

	useRootFontSize()
</script>
