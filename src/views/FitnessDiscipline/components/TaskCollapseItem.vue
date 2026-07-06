<template>
	<li class="task-item" :class="{ expanded }">
		<button
			type="button"
			class="task-toggle"
			:aria-expanded="expanded"
			@click="$emit('toggle')"
		>
			<span class="task-icon">{{ task.icon }}</span>
			<div class="task-body">
				<span class="task-cat">{{ task.category }}</span>
				<span class="task-label">{{ task.label }}</span>
				<span v-if="task.rhythmNote" class="task-rhythm">{{ task.rhythmNote }}</span>
			</div>
			<div class="task-side">
				<span class="task-detail">{{ task.detail }}</span>
				<span v-if="task.calories" class="kcal-pill">~{{ task.calories }}</span>
				<span class="chevron" :class="{ open: expanded }">›</span>
			</div>
		</button>

		<div v-show="expanded && task.guide" class="task-guide">
			<p class="guide-target">
				<strong>目标肌群</strong> · {{ task.guide.target }}
			</p>
			<p class="guide-tip">{{ task.guide.tip }}</p>
			<ol class="guide-steps">
				<li v-for="(step, i) in task.guide.steps" :key="i">{{ step }}</li>
			</ol>
			<div v-if="task.guide.easier || task.guide.harder" class="guide-variants">
				<span v-if="task.guide.easier" class="variant easier">降阶 {{ task.guide.easier }}</span>
				<span v-if="task.guide.harder" class="variant harder">升阶 {{ task.guide.harder }}</span>
			</div>
		</div>
	</li>
</template>

<script setup>
	defineProps({
		task: { type: Object, required: true },
		expanded: { type: Boolean, default: false }
	})

	defineEmits(['toggle'])
</script>

<style scoped lang="scss">
	.task-item {
		position: relative;
		border-radius: 1rem;
		background: linear-gradient(135deg, #fff, #fff5f7);
		border: 1.5px solid var(--fit-pink-light, #fce7f3);
		overflow: hidden;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;

		&.expanded {
			border-color: rgba(244, 114, 182, 0.4);
			box-shadow: 0 4px 16px rgba(244, 114, 182, 0.1);
		}
	}

	.task-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem 0.875rem;
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
		color: inherit;
	}

	.task-icon {
		font-size: 1.375rem;
		flex-shrink: 0;
		width: 2.25rem;
		height: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.75rem;
		background: var(--fit-pink-light, #fce7f3);
	}

	.task-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.task-cat {
		font-size: 0.6875rem;
		color: #94a3b8;
		font-weight: 600;
	}

	.task-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #831843;
	}

	.task-rhythm {
		font-size: 0.6875rem;
		color: var(--fit-text-accent, #db2777);
		font-weight: 500;
	}

	.task-side {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.task-detail {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 600;
		white-space: nowrap;
	}

	.kcal-pill {
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.15rem 0.45rem;
		border-radius: 999px;
		background: linear-gradient(135deg, var(--fit-pink-light, #fce7f3), var(--fit-peach-light, #ffedd5));
		color: var(--fit-text-accent, #db2777);
	}

	.chevron {
		font-size: 1rem;
		color: #94a3b8;
		transform: rotate(90deg);
		transition: transform 0.2s ease;
		line-height: 1;

		&.open {
			transform: rotate(-90deg);
		}
	}

	.task-guide {
		padding: 0 0.875rem 0.875rem;
		border-top: 1px dashed rgba(244, 114, 182, 0.25);
		background: rgba(255, 245, 247, 0.6);
	}

	.guide-target {
		margin-top: 0.65rem;
		font-size: 0.75rem;
		color: #475569;
		line-height: 1.5;

		strong {
			color: #0f172a;
		}
	}

	.guide-tip {
		margin-top: 0.35rem;
		font-size: 0.75rem;
		color: #64748b;
		line-height: 1.55;
	}

	.guide-steps {
		margin: 0.5rem 0 0;
		padding-left: 1.15rem;

		li {
			font-size: 0.75rem;
			color: #475569;
			line-height: 1.55;
			margin-bottom: 0.2rem;
		}
	}

	.guide-variants {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-top: 0.65rem;
	}

	.variant {
		font-size: 0.6875rem;
		line-height: 1.45;
		padding: 0.35rem 0.5rem;
		border-radius: 0.5rem;

		&.easier {
			background: #ecfdf5;
			color: #047857;
		}

		&.harder {
			background: #fff7ed;
			color: #c2410c;
		}
	}
</style>
