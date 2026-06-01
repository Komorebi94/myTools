export const LUJX_STORAGE_KEY = 'lujx_plan_v2'

export const WEEK_DAY_LABEL = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
export const WEEK_DAY_SHORT = ['日', '一', '二', '三', '四', '五', '六']
export const TRAINING_DAYS = new Set([1, 2, 4, 6])
export const PLAN_DAYS = [1, 2, 3, 4, 5, 6, 0]

export const WARMUP_PLAN = '动态热身 6 分钟：开合跳 + 髋踝活动 + 肩部激活'
export const TRAINING_TIPS = {
    tempo: '下降 2 秒，起身 1 秒',
    rest: '60-90 秒'
}

/** 120 斤 ≈ 60 kg，身高 165 cm */
export const USER_PROFILE = {
    weightJin: 120,
    weightKg: 60,
    heightCm: 165
}

export const CALORIE_DISCLAIMER = `按 ${USER_PROFILE.weightJin} 斤 / ${USER_PROFILE.heightCm} cm 估算，仅供参考`

export const COOLDOWN_STRETCH = '练后拉伸 5 分钟：髋屈肌、腘绳肌、胸肩'

/** 拉伸动作库 */
export const STRETCH_EXERCISES = {
    hipFlexor: {
        id: 'hip_flexor',
        name: '弓步髋屈肌拉伸',
        icon: '🦵',
        duration: '30 秒/侧',
        target: '髋屈肌、大腿前侧',
        steps: [
            '右膝跪地，左脚踏前，间距约两拳',
            '骨盆微收、尾骨下沉，避免塌腰',
            '身体缓慢前移，感受右髋前侧拉伸',
            '保持均匀呼吸，换另一侧重复'
        ]
    },
    hamstring: {
        id: 'hamstring',
        name: '站姿腘绳肌拉伸',
        icon: '🦿',
        duration: '30 秒/侧',
        target: '大腿后侧、腘绳肌',
        steps: [
            '左脚向前半步，脚尖回勾',
            '背部打直，从髋部向前折叠',
            '双手可扶左膝或大腿，不要弓背',
            '感受左大腿后侧拉伸，换侧重复'
        ]
    },
    chest: {
        id: 'chest',
        name: '门框胸肩拉伸',
        icon: '🤝',
        duration: '30 秒/侧',
        target: '胸大肌、肩前束',
        steps: [
            '站在门框旁，右小臂贴门框呈 90°',
            '身体缓慢向前旋转，直到肩胸有拉伸感',
            '不要耸肩，保持核心轻收',
            '换左侧重复'
        ]
    },
    glute: {
        id: 'glute',
        name: '坐姿梨状肌拉伸',
        icon: '🍑',
        duration: '30 秒/侧',
        target: '臀部、梨状肌、下背旁侧',
        steps: [
            '坐稳，右脚踝搭在左膝上',
            '背部挺直，双手环抱左膝',
            '缓慢拉向胸口，感受右臀拉伸',
            '换另一侧重复'
        ]
    },
    catCow: {
        id: 'cat_cow',
        name: '猫牛式',
        icon: '🐱',
        duration: '8-10 次',
        target: '脊柱灵活、下背放松',
        steps: [
            '四足支撑，手腕在肩下、膝在髋下',
            '吸气：抬头塌腰（牛式）',
            '呼气：低头拱背（猫式）',
            '动作缓慢，幅度以舒适为准'
        ]
    },
    childPose: {
        id: 'child_pose',
        name: '婴儿式',
        icon: '🧘',
        duration: '45-60 秒',
        target: '下背、髋部、肩背放松',
        steps: [
            '跪坐，双膝分开约与髋同宽',
            '身体向前趴，额头轻触地面',
            '双臂向前延伸或自然放身侧',
            '深呼吸，感受下背与侧腰放松'
        ]
    }
}

/** 练后拉伸（训练日） */
export const COOLDOWN_ROUTINE = [
    STRETCH_EXERCISES.hipFlexor,
    STRETCH_EXERCISES.hamstring,
    STRETCH_EXERCISES.chest
]

/** 休息日拉伸方案 */
export const REST_STRETCH_ROUTINES = {
    3: [
        STRETCH_EXERCISES.hipFlexor,
        STRETCH_EXERCISES.hamstring,
        STRETCH_EXERCISES.glute,
        STRETCH_EXERCISES.catCow
    ],
    5: [
        STRETCH_EXERCISES.hipFlexor,
        STRETCH_EXERCISES.hamstring,
        STRETCH_EXERCISES.chest,
        STRETCH_EXERCISES.glute,
        STRETCH_EXERCISES.childPose
    ],
    0: [
        STRETCH_EXERCISES.catCow,
        STRETCH_EXERCISES.childPose,
        STRETCH_EXERCISES.hamstring
    ]
}

/** 休息日活动建议（按星期） */
export const REST_BY_DAY = {
    3: {
        title: '主动恢复',
        walk: '轻松快走 20-30 分钟',
        walkTip: '保持能正常说话的节奏，微微出汗即可',
        stretch: '髋部与下背拉伸 10 分钟',
        calories: '约 80-120 kcal'
    },
    5: {
        title: '轻量恢复',
        walk: '可选散步 15-20 分钟',
        walkTip: '不追求速度，以放松为主',
        stretch: '全身拉伸 10 分钟',
        calories: '约 50-80 kcal'
    },
    0: {
        title: '完全休息',
        walk: null,
        walkTip: '今天可以不运动，保证睡眠',
        stretch: '简单拉伸 5 分钟（可选）',
        calories: '约 30-50 kcal'
    }
}

/** 核心加强日：周一、周六 */
export const CORE_EXTRA_DAYS = new Set([1, 6])

export const EXERCISE_META = {
    深蹲: {
        icon: '🦵',
        tip: '膝盖与脚尖同向，背部保持中立，蹲至大腿平行地面',
        easier: '靠椅深蹲或减少次数',
        harder: '暂停深蹲或单腿辅助'
    },
    平板支撑: {
        icon: '🧱',
        tip: '核心收紧，骨盆中立，避免塌腰或翘臀',
        easier: '跪姿平板或缩短时长',
        harder: '延长每组时间或加侧平板'
    },
    俯卧撑: {
        icon: '💪',
        tip: '身体成一直线，肘部约 45°，全程控制',
        easier: '跪姿或斜板俯卧撑',
        harder: '放慢离心或加组数'
    },
    跪姿健腹轮: {
        icon: '🎯',
        tip: '收紧核心，向前滚动至可控范围，避免腰部代偿',
        easier: '缩短滚动距离',
        harder: '增加滚动距离或组数'
    },
    侧平板支撑: {
        icon: '↔️',
        tip: '身体侧向成一直线，髋部不下沉，每侧交替完成',
        easier: '屈膝侧平板或缩短时长',
        harder: '延长每组时间'
    },
    死虫式: {
        icon: '🐛',
        tip: '下背贴地，对侧手脚缓慢伸展，保持核心稳定',
        easier: '只动腿或只动手',
        harder: '增加次数或放慢速度'
    }
}

/** 自重训练整体 MET（120 斤 / 165 cm，中等强度） */
export const SESSION_MET = 4.2

export const phasePresets = {
    phase1: {
        squat: '4x12', plank: '4x30 秒', pushup: '3x12', wheel: '3x8',
        sidePlank: '2x20 秒（每侧）', deadBug: '2x8（每侧）'
    },
    phase2: {
        squat: '4x14', plank: '4x40 秒', pushup: '4x10', wheel: '4x8',
        sidePlank: '2x25 秒（每侧）', deadBug: '2x10（每侧）'
    },
    phase3: {
        squat: '4x16', plank: '4x45 秒', pushup: '4x12', wheel: '4x10',
        sidePlank: '3x25 秒（每侧）', deadBug: '3x10（每侧）'
    },
    phase4: {
        squat: '4x18', plank: '4x55 秒', pushup: '4x15', wheel: '4x12',
        sidePlank: '3x30 秒（每侧）', deadBug: '3x12（每侧）'
    }
}

export const PHASES = [
    {
        id: 'phase-1',
        title: '基础适应',
        weekRange: '第 1-4 周',
        weekStart: 1,
        weekEnd: 4,
        desc: '建立动作质量，首日约 80 kcal，单次 20 分钟。',
        preview: ['深蹲 4x12', '平板 4x30 秒', '俯卧撑 3x12', '健腹轮 3x8', '侧平板 + 死虫式'],
        preset: phasePresets.phase1
    },
    {
        id: 'phase-2',
        title: '容量提升',
        weekRange: '第 5-8 周',
        weekStart: 5,
        weekEnd: 8,
        desc: '增加总量至约 100 kcal，强化耐力与稳定。',
        preview: ['深蹲 4x14', '平板支撑 4x40 秒', '俯卧撑 4x10', '跪姿健腹轮 4x8'],
        preset: phasePresets.phase2
    },
    {
        id: 'phase-3',
        title: '强度巩固',
        weekRange: '第 9-12 周',
        weekStart: 9,
        weekEnd: 12,
        desc: '提高负荷至约 120 kcal，形成稳定输出。',
        preview: ['深蹲 4x16', '平板支撑 4x45 秒', '俯卧撑 4x12', '跪姿健腹轮 4x10'],
        preset: phasePresets.phase3
    },
    {
        id: 'phase-4',
        title: '固定维持',
        weekRange: '第 13 周起',
        weekStart: 13,
        weekEnd: 999,
        desc: '长期固定约 145 kcal，兼顾训练与恢复。',
        preview: ['深蹲 4x18', '平板支撑 4x55 秒', '俯卧撑 4x15', '跪姿健腹轮 4x12'],
        preset: phasePresets.phase4
    }
]

export const WEEKLY_SCHEDULE = [
    { day: '周一', dayIndex: 1, type: 'training', label: '深蹲 + 平板支撑' },
    { day: '周二', dayIndex: 2, type: 'training', label: '俯卧撑 + 跪姿健腹轮' },
    { day: '周三', dayIndex: 3, type: 'rest', label: '恢复 / 轻步行' },
    { day: '周四', dayIndex: 4, type: 'training', label: '深蹲 + 俯卧撑' },
    { day: '周五', dayIndex: 5, type: 'rest', label: '恢复 / 拉伸' },
    { day: '周六', dayIndex: 6, type: 'training', label: '平板支撑 + 跪姿健腹轮' },
    { day: '周日', dayIndex: 0, type: 'rest', label: '完全休息' }
]

export const LUJX_TABS = [
    { id: 'today', label: '今日训练', icon: '🏃' },
    { id: 'plan', label: '进阶计划', icon: '📈' },
    { id: 'records', label: '日历记录', icon: '🗓️' }
]
