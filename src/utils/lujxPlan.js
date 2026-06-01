import {
    COOLDOWN_ROUTINE,
    COOLDOWN_STRETCH,
    CORE_EXTRA_DAYS,
    EXERCISE_META,
    PHASES,
    PLAN_DAYS,
    REST_BY_DAY,
    REST_STRETCH_ROUTINES,
    SESSION_MET,
    TRAINING_DAYS,
    TRAINING_TIPS,
    USER_PROFILE,
    WEEK_DAY_LABEL
} from '@/constants/lujx'

/** 每次动作预估耗时（秒） */
const SEC_PER_REP = {
    深蹲: 3,
    俯卧撑: 2.5,
    跪姿健腹轮: 4,
    死虫式: 3
}

const WARMUP_MINUTES = 6
const REST_MINUTES_PER_SET = 1.2

export function getDateKey (date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export function parseTarget (target) {
    const match = /^(\d+)x(\d+)/.exec(target)
    if (!match) return null
    return { sets: Number(match[1]), unit: Number(match[2]), isHold: target.includes('秒') }
}

export function getWeekFromProgramDay (programDay) {
    return Math.max(1, Math.ceil(programDay / 7))
}

export function getActivePhase (week) {
    return PHASES.find((p) => week >= p.weekStart && week <= p.weekEnd) || PHASES[PHASES.length - 1]
}

export function getProgramDayFromStart (startDate, today = new Date()) {
    if (!startDate) return 1
    const start = new Date(`${startDate}T00:00:00`)
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const diff = Math.floor((end - start) / 86400000)
    return Math.max(1, diff + 1)
}

export function getDayIndexForProgramDay (programDay) {
    return PLAN_DAYS[(programDay - 1) % 7]
}

export function getDailyBlock (dayIndex, preset) {
    if (!TRAINING_DAYS.has(dayIndex)) {
        const restPlan = REST_BY_DAY[dayIndex] || REST_BY_DAY[0]
        return {
            type: 'rest',
            title: restPlan.title,
            restPlan,
            stretchItems: REST_STRETCH_ROUTINES[dayIndex] || REST_STRETCH_ROUTINES[0]
        }
    }

    const buildExercise = (name, target, extra = false) => {
        const parsed = parseTarget(target)
        const meta = EXERCISE_META[name] || {}
        const setsSummary = parsed
            ? parsed.isHold
                ? `${parsed.sets} 组 × ${parsed.unit} 秒${target.includes('每侧') ? '（每侧）' : ''}`
                : `${parsed.sets} 组 × ${parsed.unit} 次${target.includes('每侧') ? '（每侧）' : ''}`
            : target
        return {
            name,
            target,
            icon: meta.icon || '🏋️',
            tip: meta.tip || '',
            easier: meta.easier || '',
            harder: meta.harder || '',
            setsSummary,
            calories: 0,
            rest: TRAINING_TIPS.rest,
            isExtra: extra
        }
    }

    let block
    if (dayIndex === 1) {
        block = {
            type: 'training',
            title: '下肢 + 核心稳定',
            exercises: [buildExercise('深蹲', preset.squat), buildExercise('平板支撑', preset.plank)]
        }
    } else if (dayIndex === 2) {
        block = {
            type: 'training',
            title: '上肢推力 + 核心链',
            exercises: [buildExercise('俯卧撑', preset.pushup), buildExercise('跪姿健腹轮', preset.wheel)]
        }
    } else if (dayIndex === 4) {
        block = {
            type: 'training',
            title: '下肢 + 上肢复合',
            exercises: [buildExercise('深蹲', preset.squat), buildExercise('俯卧撑', preset.pushup)]
        }
    } else {
        block = {
            type: 'training',
            title: '核心强化专注日',
            exercises: [buildExercise('平板支撑', preset.plank), buildExercise('跪姿健腹轮', preset.wheel)]
        }
    }

    if (CORE_EXTRA_DAYS.has(dayIndex)) {
        block.coreExtras = [
            buildExercise('侧平板支撑', preset.sidePlank, true),
            buildExercise('死虫式', preset.deadBug, true)
        ]
    }

    block.cooldown = COOLDOWN_STRETCH
    block.stretchItems = COOLDOWN_ROUTINE
    assignExerciseCalories(block)
    return block
}

function getAllExercises (block) {
    return [...block.exercises, ...(block.coreExtras || [])]
}

function exerciseDurationMinutes (name, target) {
    const parsed = parseTarget(target)
    if (!parsed) return 0

    let { sets, unit, isHold } = parsed
    const perSide = target.includes('每侧')

    if (perSide && name === '侧平板支撑') sets *= 2
    if (perSide && name === '死虫式') unit *= 2

    if (isHold) {
        return sets * (unit / 60 + REST_MINUTES_PER_SET)
    }
    const secPerRep = SEC_PER_REP[name] || 3
    return sets * (unit * secPerRep / 60 + REST_MINUTES_PER_SET)
}

function assignExerciseCalories (block) {
    const all = getAllExercises(block)
    const totalCal = estimateCalories(block)
    const totalExMin = all.reduce((sum, item) => sum + exerciseDurationMinutes(item.name, item.target), 0)

    all.forEach((item) => {
        const share = totalExMin > 0 ? exerciseDurationMinutes(item.name, item.target) / totalExMin : 0
        item.calories = Math.max(1, Math.round(totalCal * share))
    })
}

export function estimateExerciseCalories (name, target, block) {
    if (!block) return 0
    const totalCal = estimateCalories(block)
    const totalExMin = block.exercises.reduce((sum, item) => sum + exerciseDurationMinutes(item.name, item.target), 0)
    if (totalExMin === 0) return 0
    return Math.max(1, Math.round(totalCal * exerciseDurationMinutes(name, target) / totalExMin))
}

export function estimateCalories (block, profile = USER_PROFILE) {
    if (!block || block.type !== 'training' || !Array.isArray(block.exercises)) return 0
    const durationMin = estimateDurationMinutes(block)
    return Math.round(SESSION_MET * profile.weightKg * (durationMin / 60))
}

export function estimateDurationMinutes (block) {
    if (!block || block.type !== 'training') return 0
    const exerciseMin = getAllExercises(block).reduce((sum, item) => sum + exerciseDurationMinutes(item.name, item.target), 0)
    // 含热身 6 分钟 + 练后拉伸约 5 分钟
    return Math.max(15, Math.round(WARMUP_MINUTES + exerciseMin + 5))
}

export function calcSessionStreak (records, today = new Date()) {
    const checked = new Set(records.filter((r) => r.status === 'training').map((r) => r.date))
    let day = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayKey = getDateKey(day)

    if (TRAINING_DAYS.has(day.getDay()) && !checked.has(todayKey)) {
        day.setDate(day.getDate() - 1)
    }

    let streak = 0
    for (let i = 0; i < 365; i += 1) {
        const key = getDateKey(day)
        if (TRAINING_DAYS.has(day.getDay())) {
            if (checked.has(key)) streak += 1
            else break
        }
        day.setDate(day.getDate() - 1)
    }
    return streak
}

export function calcWeekCompletion (records, today = new Date()) {
    const checked = new Set(records.filter((r) => r.status === 'training').map((r) => r.date))
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dayOfWeek = day.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(day)
    monday.setDate(day.getDate() + mondayOffset)

    let planned = 0
    let done = 0
    for (let i = 0; i < 7; i += 1) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        if (d > day) break
        if (TRAINING_DAYS.has(d.getDay())) {
            planned += 1
            if (checked.has(getDateKey(d))) done += 1
        }
    }
    return { done, planned }
}

export function getPlanForDate (date, startDate) {
    const programDay = getProgramDayFromStart(startDate, date)
    const week = getWeekFromProgramDay(programDay)
    const phase = getActivePhase(week)
    const dayIndex = date.getDay()
    const block = getDailyBlock(dayIndex, phase.preset)
    return {
        dateKey: getDateKey(date),
        dateLabel: `${getDateKey(date)} ${WEEK_DAY_LABEL[dayIndex]}`,
        programDay,
        week,
        phase,
        block
    }
}

export function buildCalendarCells (monthDate, checkedSet, nowKey, startDate) {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const cells = []

    for (let i = 0; i < 42; i += 1) {
        const date = new Date(year, month, i - firstDay + 1)
        const key = getDateKey(date)
        const plan = startDate ? getPlanForDate(date, startDate) : null
        cells.push({
            key,
            day: date.getDate(),
            inMonth: date.getMonth() === month,
            isToday: key === nowKey,
            isChecked: checkedSet.has(key),
            isTrainingDay: TRAINING_DAYS.has(date.getDay()),
            plan
        })
    }
    return cells
}

export function getPhaseProgress (week, phase) {
    if (phase.weekEnd >= 999) return 100
    const span = phase.weekEnd - phase.weekStart + 1
    const current = Math.min(span, Math.max(0, week - phase.weekStart + 1))
    return Math.round((current / span) * 100)
}

export function getMockStats (mockDay) {
    const week = getWeekFromProgramDay(mockDay)
    const phase = getActivePhase(week)
    const trainingSessions = Math.floor((mockDay - 1) / 7) * 4 + PLAN_DAYS.slice(0, (mockDay - 1) % 7 + 1).filter((d) => TRAINING_DAYS.has(d)).length
    return {
        trainingRecordsCount: trainingSessions,
        trainingStreak: Math.min(4, trainingSessions % 4 || (trainingSessions > 0 ? 4 : 0)),
        currentWeek: week,
        activePhase: phase
    }
}
