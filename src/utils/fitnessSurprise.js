import { SURPRISE_REWARD_TIERS } from '@/constants/fitness'

export function isSurpriseTierUnlocked(continueDays, tier) {
	return continueDays >= tier.days
}

export function isSurpriseTierRedeemed(state, tier) {
	return Boolean(state[tier.id])
}

/** 已达成且尚未登记兑现的档位（按天数升序） */
export function getPendingSurpriseTiers(continueDays, state) {
	return SURPRISE_REWARD_TIERS.filter(
		(tier) => isSurpriseTierUnlocked(continueDays, tier) && !isSurpriseTierRedeemed(state, tier)
	)
}

/** 下一档未达成的惊喜奖 */
export function getNextSurpriseTier(continueDays) {
	return SURPRISE_REWARD_TIERS.find((tier) => continueDays < tier.days) ?? null
}

export function getDaysToSurpriseTier(continueDays, tier) {
	const left = tier.days - continueDays
	return left > 0 ? left : 0
}

export function findSurpriseTier(tierId) {
	return SURPRISE_REWARD_TIERS.find((t) => t.id === tierId) ?? null
}
