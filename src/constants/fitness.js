export const FITNESS_STORAGE_KEY = 'fitness_discipline_v2'

export const APP_NAME = '笑笑的存钱罐'
export const APP_TAGLINE = '每天练一点点，罐子里的钱慢慢涨～'

/**
 * 训练节奏（参考常见自重周期化方案）：
 * - 3 次打卡「积量」：每次 +1 次或 +5 秒
 * - 2 次打卡「巩固」：维持上一档强度
 * - 1 次打卡「升阶」：加组 / 换更难动作
 * - 每 24 次打卡插入 1 次「放松巩固」：量减约 40%
 */
export const PROGRESSION_CYCLE = {
	mesocycleLength: 6,
	accumulateDays: 3,
	consolidateDays: 2,
	deloadInterval: 24,
	deloadVolumeFactor: 0.6
}

/**
 * 按每月约 20 练次（每周 3–4 天）校准：单次奖励 ×1.5，弥补非每日训练。
 * 连续完成 60 课次（约 3 个月）预估总收益约 2700 元（虚拟金），结构大致为：
 * 每次完成 ~62% · 连续7次 ~12% · 小周期/升阶 ~14% · 动作进阶 ~8% · 放松周 ~4%
 */
export const REWARDS = {
	DAILY_BASE: 24,
	DAILY_PER_MESO: 1,
	DAILY_CAP: 48,
	DAILY_SKIP: -12,
	EXTRA_COMPLETE: 12,
	STREAK_7: 60,
	STEP_DAY_BONUS: 12,
	DELOAD_COMPLETE: 22,
	VARIANT_UPGRADE: 60,
	MESO_COMPLETE: 22,
	BREAK_5: 75,
	BREAK_10: 135,
	BREAK_SQUAT_30: 60,
	BREAK_PLANK_90: 60,
	BREAK_LUNGE_20: 45
}

export const RECORD_STATUS = {
	FINISH: 'finish',
	SKIP: 'skip',
	HALF: 'half',
	REDEEM: 'redeem'
}

export const PHASE_LABELS = {
	accumulate: { label: '积量日', hint: '今日宜加一点点强度' },
	consolidate: { label: '巩固日', hint: '保持昨日强度，练稳动作' },
	progress: { label: '升阶日', hint: '加组或进入更难变式' },
	deload: { label: '放松周', hint: '减量巩固，给身体恢复' }
}

export const PUSH_VARIANTS = [
	{ id: 'wall', label: '墙推俯卧撑', sessions: 18, baseReps: 8, baseSets: 3, repCap: 15 },
	{ id: 'incline', label: '斜撑俯卧撑', sessions: 18, baseReps: 8, baseSets: 3, repCap: 14 },
	{ id: 'knee', label: '跪姿俯卧撑', sessions: 18, baseReps: 6, baseSets: 3, repCap: 12 },
	{ id: 'standard', label: '标准俯卧撑', sessions: 999, baseReps: 5, baseSets: 3, repCap: 15 }
]

export const LEG_EXERCISES = [
	{
		id: 'chair_squat',
		label: '靠椅深蹲',
		icon: '🪑',
		type: 'reps',
		baseReps: 8,
		baseSets: 3,
		repCap: 18
	},
	{
		id: 'squat',
		label: '自重深蹲',
		icon: '🦵',
		type: 'reps',
		baseReps: 6,
		baseSets: 3,
		repCap: 20
	},
	{
		id: 'lunge',
		label: '弓步蹲',
		icon: '🏃',
		type: 'reps',
		baseReps: 6,
		baseSets: 3,
		repCap: 14,
		suffix: '（每侧）'
	},
	{
		id: 'squat_hold',
		label: '靠墙静蹲',
		icon: '🧘',
		type: 'hold',
		baseSec: 20,
		baseSets: 3,
		secCap: 60
	}
]

export const CORE_EXERCISES = [
	{
		id: 'plank',
		label: '平板支撑',
		icon: '🧱',
		always: true,
		type: 'hold',
		baseSec: 20,
		baseSets: 2,
		secCap: 90
	},
	{
		id: 'wall_angle',
		label: '靠墙夹背',
		icon: '🤝',
		type: 'hold',
		baseSec: 15,
		baseSets: 3,
		secCap: 45
	},
	{
		id: 'glute_bridge',
		label: '臀桥',
		icon: '🌉',
		type: 'reps',
		baseReps: 10,
		baseSets: 3,
		repCap: 20
	},
	{
		id: 'dead_bug',
		label: '死虫式',
		icon: '🐛',
		type: 'reps',
		baseReps: 8,
		baseSets: 3,
		repCap: 16,
		suffix: '（每侧）'
	},
	{
		id: 'side_plank',
		label: '侧平板支撑',
		icon: '↔️',
		type: 'hold',
		baseSec: 15,
		baseSets: 2,
		secCap: 45,
		suffix: '（每侧）'
	}
]

export const FINISHER_EXERCISES = [
	{
		id: 'jumping_jack',
		label: '开合跳',
		icon: '⭐',
		type: 'reps',
		baseReps: 12,
		baseSets: 2,
		repCap: 30,
		minSession: 12
	},
	{
		id: 'stretch',
		label: '全身拉伸',
		icon: '🌿',
		type: 'hold',
		baseSec: 30,
		baseSets: 1,
		secCap: 60,
		minSession: 0
	}
]

/**
 * 惊喜奖分档（线下凭截图兑现，不走存钱罐扣款）
 * state[tier.id] === true 表示该档已登记兑现
 */
export const SURPRISE_REWARD_TIERS = [
	{
		id: 'surprise_60',
		days: 60,
		label: '两月坚持奖',
		prizeHint: '入门惊喜礼物（线下兑现）'
	},
	{
		id: 'surprise_180',
		days: 180,
		label: '半年里程碑',
		prizeHint: '进阶惊喜礼物（线下兑现）'
	},
	{
		id: 'surprise_365',
		days: 365,
		label: '全年自律奖',
		prizeHint: '终极惊喜大礼（线下兑现）'
	}
]

export function getSurpriseRewardCopy(tier) {
	return {
		title: '🎉 惊喜奖解锁！',
		subtitle: `${tier.label} · 连续完成 ${tier.days} 次训练`,
		prizeHint: tier.prizeHint,
		redeemSteps: [
			'对本弹窗截图并保存',
			`凭截图按事先约定兑现「${tier.label}」`,
			'领取对应的线下惊喜礼物'
		],
		screenshotTip: '建议截图包含本弹窗与连续完成次数'
	}
}

export const BREAKTHROUGH_LEVELS = [
	{ id: 'break_5', reward: REWARDS.BREAK_5, label: '首次完成 5 个标准俯卧撑' },
	{ id: 'break_10', reward: REWARDS.BREAK_10, label: '首次完成 10 个标准俯卧撑' },
	{ id: 'break_squat_30', reward: REWARDS.BREAK_SQUAT_30, label: '首次单次完成 30 个标准深蹲' },
	{ id: 'break_plank_90', reward: REWARDS.BREAK_PLANK_90, label: '首次平板支撑坚持 90 秒' },
	{ id: 'break_lunge_20', reward: REWARDS.BREAK_LUNGE_20, label: '首次单腿弓步蹲各 20 次' }
]

export const PROGRAM_PHASES = [
	{ name: '习惯养成', desc: '3 天加一点，2 天稳住，第 6 天升阶' },
	{ name: '容量积累', desc: '次数优先，打牢动作质量' },
	{ name: '稳定输出', desc: '巩固周反复打磨同一强度' },
	{ name: '变式进阶', desc: '俯卧撑/深蹲逐步换更难版本' },
	{ name: '核心强化', desc: '平板与静蹲按秒数阶梯上涨' },
	{ name: '综合挑战', desc: '上下肢+核心同日进阶' },
	{ name: '节奏大师', desc: '熟悉放松周，避免过度训练' },
	{ name: '长期自律', desc: '维持周期，偶尔突破拿大奖' }
]

export const APP_VERSION = '1.0.0'
