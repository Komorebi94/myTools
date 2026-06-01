import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
	getDeviceType,
	getNextNewYear,
	getBarrageDensity,
	createFireworksOptions,
	buildShareUrl,
	sanitizeShareName,
	buildCelebrationMessage,
	buildPersonalizedBarrage
} from '../src/utils/index.js'

describe('getDeviceType', () => {
	it('returns mobile below 768', () => {
		expect(getDeviceType(375)).toBe('mobile')
	})

	it('returns tablet between 768 and 1023', () => {
		expect(getDeviceType(800)).toBe('tablet')
	})

	it('returns desktop at 1024+', () => {
		expect(getDeviceType(1280)).toBe('desktop')
	})
})

describe('getNextNewYear', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('targets next calendar year when before Jan 1', () => {
		vi.setSystemTime(new Date('2025-12-31T12:00:00'))
		const target = getNextNewYear()
		expect(target.getFullYear()).toBe(2026)
		expect(target.getMonth()).toBe(0)
		expect(target.getDate()).toBe(1)
	})

	it('targets year after current when already past Jan 1', () => {
		vi.setSystemTime(new Date('2026-01-02T12:00:00'))
		const target = getNextNewYear()
		expect(target.getFullYear()).toBe(2027)
	})
})

describe('getBarrageDensity', () => {
	it('returns low when reduced motion', () => {
		expect(getBarrageDensity('desktop', true)).toBe('low')
	})

	it('scales by device', () => {
		expect(getBarrageDensity('mobile', false)).toBe('medium')
		expect(getBarrageDensity('tablet', false)).toBe('high')
		expect(getBarrageDensity('desktop', false)).toBe('high')
	})
})

describe('createFireworksOptions', () => {
	it('disables mouse move on mobile', () => {
		const opts = createFireworksOptions('mobile', { interactive: true })
		expect(opts.mouse.move).toBe(false)
		expect(opts.mouse.click).toBe(true)
	})

	it('reduces particles when reduced motion', () => {
		const normal = createFireworksOptions('desktop', { reducedMotion: false })
		const reduced = createFireworksOptions('desktop', { reducedMotion: true })
		expect(reduced.particles).toBeLessThan(normal.particles)
	})
})

describe('sanitizeShareName', () => {
	it('trims and limits length', () => {
		expect(sanitizeShareName('  小明  ')).toBe('小明')
		expect(sanitizeShareName('a'.repeat(30))).toHaveLength(20)
	})

	it('strips unsafe characters', () => {
		expect(sanitizeShareName('<script>')).toBe('script')
	})
})

describe('buildCelebrationMessage', () => {
	it('returns default without name', () => {
		expect(buildCelebrationMessage('')).toEqual(['🎉 ', '新', '年', '快', '乐', ' 🎉'])
	})

	it('includes name in message', () => {
		const msg = buildCelebrationMessage('小明')
		expect(msg.join('')).toContain('小明，新年快乐！')
	})
})

describe('buildPersonalizedBarrage', () => {
	it('prepends personalized lines', () => {
		const list = buildPersonalizedBarrage('小红', ['新年快乐'])
		expect(list[0]).toBe('小红，新年快乐！')
		expect(list).toContain('新年快乐')
	})
})

describe('buildShareUrl', () => {
	it('appends query params', () => {
		vi.stubGlobal('window', {
			location: { href: 'https://example.com/?old=1' }
		})
		const url = buildShareUrl({ testEffect: 'true', name: '小明' })
		expect(url).toContain('testEffect=true')
		expect(url).toContain('name')
		expect(url).not.toContain('old=1')
		vi.unstubAllGlobals()
	})
})
