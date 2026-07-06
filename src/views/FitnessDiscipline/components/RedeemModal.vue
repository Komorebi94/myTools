<template>
	<Teleport to="body">
		<Transition name="modal">
			<div v-if="visible" class="modal-root" @click.self="$emit('cancel')">
				<div class="modal-card fit-sticker-card" role="dialog" aria-modal="true">
					<span class="card-deco card-deco--tr" aria-hidden="true">🪙</span>
					<h3>兑换奖励</h3>
					<p class="modal-desc">
						从存钱罐扣除对应金额，记入台账。当前余额
						<strong>¥{{ formatMoney(balance) }}</strong>
					</p>
					<label class="field">
						<span>兑换金额（元）</span>
						<input
							v-model="amountInput"
							type="number"
							inputmode="decimal"
							min="0.01"
							:max="balance"
							step="0.01"
							placeholder="例如 50"
						/>
					</label>
					<label class="field">
						<span>兑换说明（选填）</span>
						<input
							v-model="noteInput"
							type="text"
							maxlength="40"
							placeholder="例如：一杯奶茶"
						/>
					</label>
					<div class="modal-actions">
						<button type="button" class="btn ghost" @click="$emit('cancel')">取消</button>
						<button type="button" class="btn primary" @click="onConfirm">确认兑换</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
	import { ref, watch } from 'vue'

	const props = defineProps({
		visible: Boolean,
		balance: { type: Number, default: 0 }
	})

	const emit = defineEmits(['confirm', 'cancel'])

	const amountInput = ref('')
	const noteInput = ref('')

	watch(
		() => props.visible,
		(v) => {
			if (v) {
				amountInput.value = ''
				noteInput.value = ''
			}
		}
	)

	const formatMoney = (n) => Number(n).toFixed(2).replace(/\.00$/, '')

	const onConfirm = () => {
		emit('confirm', {
			amount: amountInput.value,
			note: noteInput.value
		})
	}
</script>

<style scoped lang="scss">
	.modal-root {
		position: fixed;
		inset: 0;
		z-index: 300;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: rgba(131, 24, 67, 0.32);
		backdrop-filter: blur(8px);
	}

	.modal-card {
		width: 100%;
		max-width: 20rem;
		padding: 1.5rem;

		h3 {
			font-size: 1.1875rem;
			color: var(--fit-text-heading, #831843);
			margin-bottom: 0.5rem;
		}
	}

	.modal-desc {
		font-size: 0.8125rem;
		line-height: 1.65;
		color: #78716c;
		margin-bottom: 1rem;

		strong {
			color: var(--fit-text-accent, #ec4899);
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 0.875rem;
		font-size: 0.8125rem;
		color: #57534e;

		input {
			padding: 0.75rem 0.875rem;
			border: 2px dashed var(--fit-pink-light, #fce7f3);
			border-radius: var(--fit-radius-sm, 0.875rem);
			font-size: 1rem;
			color: var(--fit-text-heading, #831843);
			background: var(--fit-cream, #fff9fb);

			&:focus {
				outline: none;
				border-color: var(--fit-peach, #fdba74);
				box-shadow: 0 0 0 3px rgba(253, 186, 116, 0.25);
			}
		}
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.btn {
		flex: 1;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: var(--fit-radius-md, 1.375rem);
		font-family: var(--fit-font-display, 'ZCOOL KuaiLe', sans-serif);
		font-size: 0.9375rem;
		cursor: pointer;
		transition: transform 0.2s var(--fit-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));

		&:active {
			transform: scale(0.96);
		}

		&.ghost {
			background: var(--fit-cream, #fff9fb);
			color: #78716c;
			border: 2px dashed rgba(249, 168, 212, 0.35);
		}

		&.primary {
			background: linear-gradient(180deg, #fde68a, #fcd34d, #fb923c);
			color: #92400e;
			box-shadow: 0 4px 0 rgba(217, 119, 6, 0.2);
		}
	}

	.modal-enter-active,
	.modal-leave-active {
		transition: opacity 0.25s ease;

		.modal-card {
			transition: transform 0.25s var(--fit-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
		}
	}

	.modal-enter-from,
	.modal-leave-to {
		opacity: 0;

		.modal-card {
			transform: scale(0.9) translateY(12px);
		}
	}
</style>
