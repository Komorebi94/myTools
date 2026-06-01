<template>
	<div class="share-panel">
		<label class="share-label">
			<span class="sr-only">分享时附带姓名</span>
			<input
				v-model="name"
				type="text"
				class="share-input"
				placeholder="姓名（可选）"
				maxlength="20"
				autocomplete="name"
			/>
		</label>
		<button
			type="button"
			class="share-btn"
			:aria-label="copied ? '链接已复制' : '复制带姓名的分享链接'"
			@click="copyLink"
		>
			{{ copied ? '已复制 ✓' : '分享链接' }}
		</button>
	</div>
</template>

<script setup>
	import { ref, watch, onUnmounted } from 'vue'
	import { buildShareUrl, sanitizeShareName } from '@/utils/index'

	const props = defineProps({
		params: {
			type: Object,
			default: () => ({})
		},
		initialName: {
			type: String,
			default: ''
		}
	})

	const name = ref(sanitizeShareName(props.initialName))
	const copied = ref(false)
	let resetTimer = null

	watch(
		() => props.initialName,
		(value) => {
			name.value = sanitizeShareName(value)
		}
	)

	const copyLink = async () => {
		const merged = { ...props.params }
		const safeName = sanitizeShareName(name.value)

		if (safeName) {
			merged.name = safeName
		} else {
			delete merged.name
		}

		const url = buildShareUrl(merged)

		try {
			await navigator.clipboard.writeText(url)
		} catch {
			const input = document.createElement('textarea')
			input.value = url
			document.body.appendChild(input)
			input.select()
			document.execCommand('copy')
			document.body.removeChild(input)
		}

		copied.value = true
		if (resetTimer) clearTimeout(resetTimer)
		resetTimer = setTimeout(() => {
			copied.value = false
			resetTimer = null
		}, 2000)
	}

	onUnmounted(() => {
		if (resetTimer) clearTimeout(resetTimer)
	})
</script>

<style lang="scss" scoped>
	.share-panel {
		position: fixed;
		top: calc(var(--safe-top) + 12px);
		right: calc(var(--safe-right) + 12px);
		z-index: 10002;
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		gap: 0;
	}

	.share-label {
		max-width: 0;
		opacity: 0;
		overflow: hidden;
		pointer-events: none;
		transition:
			max-width 0.28s ease,
			opacity 0.22s ease,
			margin-right 0.28s ease;
	}

	.share-input {
		width: 148px;
		padding: 8px 12px;
		border: 1px solid var(--color-primary-border);
		border-radius: 999px;
		background: var(--hint-bg);
		color: rgba(255, 255, 255, 0.95);
		font-size: 0.8125rem;
		outline: none;
		backdrop-filter: blur(6px);

		&::placeholder {
			color: rgba(255, 255, 255, 0.45);
		}

		&:focus {
			border-color: var(--color-primary);
		}
	}

	.share-btn {
		flex-shrink: 0;
		padding: 8px 14px;
		border: 1px solid var(--color-primary-border);
		border-radius: 999px;
		background: var(--hint-bg);
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.8125rem;
		cursor: pointer;
		backdrop-filter: blur(6px);
		transition: border-color 0.2s ease;
		white-space: nowrap;

		&:hover {
			border-color: var(--color-primary);
		}

		&:focus-visible {
			outline: 2px solid var(--color-primary);
			outline-offset: 2px;
		}
	}

	/* 悬停「分享链接」时展开姓名输入（桌面） */
	@media (hover: hover) {
		.share-panel:hover .share-label {
			max-width: 148px;
			opacity: 1;
			margin-right: 8px;
			pointer-events: auto;
		}
	}

	/* 键盘 / 触屏聚焦时保持展开，便于输入姓名 */
	.share-panel:focus-within .share-label {
		max-width: 148px;
		opacity: 1;
		margin-right: 8px;
		pointer-events: auto;
	}
</style>
