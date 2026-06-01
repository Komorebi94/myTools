<template>
	<article class="stretch-card" :class="{ nested }">
		<button
			type="button"
			class="stretch-toggle"
			:aria-expanded="expanded"
			@click="$emit('toggle')"
		>
			<span class="stretch-emoji">{{ item.icon }}</span>
			<span class="stretch-toggle-text">
				<component :is="titleTag">{{ item.name }}</component>
				<span class="stretch-meta">{{ item.duration }} · {{ item.target }}</span>
			</span>
			<span class="chevron" :class="{ open: expanded }">›</span>
		</button>
		<ol v-show="expanded" class="stretch-steps">
			<li v-for="(step, i) in item.steps" :key="i">{{ step }}</li>
		</ol>
	</article>
</template>

<script setup>
	defineProps({
		item: { type: Object, required: true },
		expanded: { type: Boolean, default: false },
		nested: { type: Boolean, default: false },
		titleTag: { type: String, default: 'strong' }
	})

	defineEmits(['toggle'])
</script>

<style scoped lang="scss">
	.stretch-card {
		margin-top: 0.45rem;
		border-radius: var(--lujx-radius-md);
		background: rgba(0, 0, 0, 0.22);
		border: 1px solid var(--lujx-border);
		overflow: hidden;

		&.nested {
			margin-top: 0.5rem;
		}
	}

	.stretch-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 0.7rem;
		border: none;
		background: transparent;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.stretch-emoji {
		font-size: 1.15rem;
		flex-shrink: 0;
	}

	.stretch-toggle-text {
		flex: 1;
		min-width: 0;

		strong,
		h5 {
			display: block;
			font-size: 0.84rem;
			font-weight: 700;
		}
	}

	.stretch-meta {
		display: block;
		margin-top: 0.12rem;
		font-size: 0.7rem;
		color: var(--lujx-text-muted);
		font-weight: 400;
	}

	.chevron {
		flex-shrink: 0;
		font-size: 1.1rem;
		color: var(--lujx-text-dim);
		transform: rotate(90deg);
		transition: transform 0.2s ease;

		&.open {
			transform: rotate(-90deg);
		}
	}

	.stretch-steps {
		margin: 0;
		padding: 0 0.7rem 0.65rem 1.75rem;
		border-top: 1px solid var(--lujx-border);

		li {
			font-size: 0.74rem;
			color: var(--lujx-text-secondary);
			line-height: 1.5;
			margin-bottom: 0.15rem;
		}
	}
</style>
