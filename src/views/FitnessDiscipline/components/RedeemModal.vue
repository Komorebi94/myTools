<template>
	<Teleport to="body">
		<Transition name="modal">
			<div v-if="visible" class="modal-root" @click.self="$emit('cancel')">
				<div class="modal-card" role="dialog" aria-modal="true">
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
						<button type="button" class="btn ghost" @click="$emit('cancel')">
							取消
						</button>
						<button type="button" class="btn primary" @click="onConfirm">
							确认兑换
						</button>
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
		background: rgba(15, 23, 42, 0.45);
		backdrop-filter: blur(4px);
	}

	.modal-card {
		width: 100%;
		max-width: 20rem;
		padding: 1.5rem;
		border-radius: 1.25rem;
		background: #fff;
		box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);

		h3 {
			font-size: 1.125rem;
			font-weight: 700;
			color: #0f172a;
			margin-bottom: 0.5rem;
		}
	}

	.modal-desc {
		font-size: 0.8125rem;
		line-height: 1.6;
		color: #64748b;
		margin-bottom: 1rem;

		strong {
			color: #c2410c;
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 0.875rem;
		font-size: 0.8125rem;
		color: #475569;

		input {
			padding: 0.75rem 0.875rem;
			border: 1.5px solid #e2e8f0;
			border-radius: 0.75rem;
			font-size: 1rem;
			color: #0f172a;

			&:focus {
				outline: none;
				border-color: #fb923c;
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
		border-radius: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;

		&.ghost {
			background: #f1f5f9;
			color: #475569;
		}

		&.primary {
			background: linear-gradient(135deg, #fb923c, #ea580c);
			color: #fff;
		}
	}

	.modal-enter-active,
	.modal-leave-active {
		transition: opacity 0.2s ease;

		.modal-card {
			transition: transform 0.2s ease;
		}
	}

	.modal-enter-from,
	.modal-leave-to {
		opacity: 0;

		.modal-card {
			transform: scale(0.95) translateY(8px);
		}
	}
</style>
