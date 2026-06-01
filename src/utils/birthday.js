import { sanitizeShareName } from '@/utils/index'

export const DEFAULT_BIRTHDAY_MESSAGES = [
	'生日快乐！',
	'Happy Birthday!',
	'🎂 岁岁平安',
	'🎈 心想事成',
	'✨ 永远开心',
	'🎁 万事顺意',
	'🌟 前程似锦',
	'💝 笑口常开'
]

export const buildBirthdayTitle = (name) => {
	const safe = sanitizeShareName(name)
	if (!safe) return ['生', '日', '快', '乐']
	return [...`${safe}，生日快乐`.split('')]
}

export const buildBirthdaySubtitle = (name, age) => {
	const safe = sanitizeShareName(name)
	const ageNum = parseInt(String(age ?? ''), 10)

	if (safe && !Number.isNaN(ageNum) && ageNum > 0 && ageNum < 120) {
		return `恭喜你 ${ageNum} 岁啦，${safe}！愿你被温柔与惊喜层层包裹。`
	}
	if (safe) return `愿所有美好都奔向你，${safe}！`
	if (!Number.isNaN(ageNum) && ageNum > 0 && ageNum < 120) {
		return `恭喜你 ${ageNum} 岁啦，新的一岁闪闪发光。`
	}
	return '愿所有美好都如期而至，岁岁常欢愉。'
}

export const parseBirthdayAge = (raw) => {
	if (typeof raw !== 'string' || !raw.trim()) return null
	const age = parseInt(raw.trim(), 10)
	if (Number.isNaN(age) || age < 1 || age > 119) return null
	return age
}

export const buildBirthdayBarrage = (name, baseMessages = DEFAULT_BIRTHDAY_MESSAGES) => {
	const safe = sanitizeShareName(name)
	if (!safe) return [...baseMessages]
	return [`${safe}，生日快乐！`, `祝${safe}生日快乐`, `${safe}，Happy Birthday!`, ...baseMessages]
}
