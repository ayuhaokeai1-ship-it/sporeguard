/**
 * 敌人数值与行为数据表（严格对齐第七章 7.1 - 7.4 表格）
 * 禁止在逻辑代码中硬编码任何敌人属性
 */

const ENEMIES = {
  beetle: {
    id: 'beetle',
    nameKey: 'enemy_beetle_name',
    typeKey: 'enemy_type_basic',
    tipKey: 'enemy_beetle_tip',
    baseHp: 185,          // 基础血量从 40 提升至 95，需狙击菇 3 发击杀，形成有压迫感的步兵行进线
    speed: 1.40,          // 格/秒
    armor: 4,            // 基础轻甲免伤 4 点
    threat: 1,
    reward: 4,
    isFlying: false,
    slowFactor: 1.0,
    artSize: { width: 12, height: 12 },
    animFrames: { walk: 4, death: 3 },
    webCooldown: 12.0,
    webRangeTiles: 3.5,
    webMaxHp: 3,
    splitOnDeath: null,
    isBoss: false
  },

  swift: {
    id: 'swift',
    nameKey: 'enemy_swift_name',
    typeKey: 'enemy_type_fast',
    tipKey: 'enemy_swift_tip',
    baseHp: 140,          // 从 22 提升至 60，不再被 1 枪秒杀，检验减速与多目标拦截
    speed: 2.85,         // 格/秒（极速冲锋）
    armor: 1,
    threat: 1,
    reward: 3,
    isFlying: false,
    slowFactor: 1.0,
    artSize: { width: 10, height: 10 },
    animFrames: { walk: 4, death: 3 },
    splitOnDeath: null,
    isBoss: false
  },

  armored: {
    id: 'armored',
    nameKey: 'enemy_armored_name',
    typeKey: 'enemy_type_armored',
    tipKey: 'enemy_armored_tip',
    baseHp: 920,         // 从 220 提升至 380，真正的前排坚盾重装坦克
    speed: 0.8,         // 格/秒，沉稳推进
    armor: 22,           // 12 点扎实护甲，大幅抵挡单体针刺，逼出毒雾腐蚀或火炮破甲！
    threat: 2,
    reward: 12,
    isFlying: false,
    slowFactor: 0.5,     // 减速抗性 40%
    artSize: { width: 16, height: 16 },
    animFrames: { walk: 4, hitArmor: 2, death: 3 },
    splitOnDeath: null,
    isBoss: false
  },

  moth: {
    id: 'moth',
    nameKey: 'enemy_moth_name',
    typeKey: 'enemy_type_flying',
    tipKey: 'enemy_moth_tip',
    baseHp: 260,         // 从 55 提升至 125，需防空塔多轮专注射击
    speed: 2.05,          // 格/秒，沿空中航线直穿树冠
    armor: 1,
    threat: 1,
    reward: 5,
    isFlying: true,
    slowFactor: 1.0,
    shadowOffsetPx: 14,  // 影子单独绘制偏移
    artSize: { width: 14, height: 12 },
    animFrames: { walk: 4, death: 3 },
    splitOnDeath: null,
    isBoss: false
  },

  splitter: {
    id: 'splitter',
    nameKey: 'enemy_splitter_name',
    typeKey: 'enemy_type_splitter',
    tipKey: 'enemy_splitter_tip',
    baseHp: 480,         // 从 90 提升至 210
    speed: 1.15,          // 格/秒
    armor: 3,
    threat: 2,
    reward: 8,
    isFlying: false,
    slowFactor: 1.0,
    artSize: { width: 14, height: 14 },
    animFrames: { walk: 4, split: 4 },
    splitOnDeath: {      // 死亡时在死亡位置爆裂生成 3 只幼体
      type: 'larva',
      count: 3
    },
    isBoss: false
  },

  larva: {
    id: 'larva',
    nameKey: 'enemy_larva_name',
    typeKey: 'enemy_type_larva',
    tipKey: 'enemy_larva_tip',
    baseHp: 115,          // 从 24 提升至 45
    speed: 2.50,          // 格/秒，高速分散奔逃
    armor: 0,
    threat: 1,
    reward: 2,
    isFlying: false,
    slowFactor: 1.0,
    artSize: { width: 8, height: 8 },
    animFrames: { walk: 4, death: 3 },
    splitOnDeath: null,  // 幼体不再分裂
    isBoss: false
  },

  // 7.4 Boss 数据
  boss_m1: {
    id: 'boss_m1',
    nameKey: 'enemy_boss_m1_name', // 腐化蛀王
    typeKey: 'enemy_type_boss',
    tipKey: 'enemy_boss_m1_tip',
    baseHp: 1600,        // 从 2400 提升至 4200，带来扣人心弦的守关激战
    speed: 0.80,         // 格/秒
    armor: 18,
    threat: 5,
    reward: 120,
    isFlying: false,
    slowFactor: 0.8,
    artSize: { width: 32, height: 32 },
    animFrames: { walk: 6, phase: 4, death: 4 },
    splitOnDeath: null,
    isBoss: true,
    phases: {
      phase2Threshold: 0.65,
      phase2WebBarrage: 2, // 生命降至 66%：召唤 2 只铁甲护卫
      phase2Summon: {
        type: 'armored',
        count: 2,
        interval: 1.5
      },
      phase3Threshold: 0.33, // 生命降至 33%：狂暴冲锋加速 +30%，护甲提升至 18
      phase3SpeedMultiplier: 1.45,
      phase3Earthquake: true,
      phase3Armor: 18,
      phase3SlowImmune: false,
      phase3DeathSplit: null
    }
  },

  boss_m2: {
    id: 'boss_m2',
    nameKey: 'enemy_boss_m2_name', // 腐化蛾后
    typeKey: 'enemy_type_boss',
    tipKey: 'enemy_boss_m2_tip',
    baseHp: 2200,        // 从 3200 提升至 5200
    speed: 1.05,         // 格/秒（空中航线）
    armor: 10,
    threat: 5,
    reward: 140,
    isFlying: true,
    slowFactor: 1.0,
    shadowOffsetPx: 20,
    artSize: { width: 32, height: 32 },
    animFrames: { walk: 6, phase: 4, death: 4 },
    splitOnDeath: null,
    isBoss: true,
    phases: {
      phase2Threshold: 0.65,
      phase2WebBarrage: 2,
      phase2Summon: {
        type: 'moth',
        count: 4,
        interval: 8.0
      },
      phase3Threshold: 0.33,
      phase3SpeedMultiplier: 1.25,
      phase3Armor: 8,
      phase3SlowImmune: true,
      phase3DeathSplit: null
    }
  },

  boss_m3: {
    id: 'boss_m3',
    nameKey: 'enemy_boss_m3_name', // 腐化异变母体
    typeKey: 'enemy_type_boss',
    tipKey: 'enemy_boss_m3_tip',
    baseHp: 3200,        // 从 4000 提升至 6500
    speed: 0.78,          // 格/秒
    armor: 15,
    threat: 5,
    reward: 160,
    isFlying: false,
    slowFactor: 1.0,
    artSize: { width: 32, height: 32 },
    animFrames: { walk: 6, phase: 4, death: 4 },
    splitOnDeath: null,
    isBoss: true,
    phases: {
      phase2Threshold: 0.65,
      phase2WebBarrage: 2,
      phase2Summon: {
        type: 'larva',
        count: 5,
        interval: 10.0
      },
      phase3Threshold: 0.33,
      phase3SpeedMultiplier: 1.45,
      phase3Earthquake: true,
      phase3Armor: 14,
      phase3SlowImmune: false,
      phase3DeathSplit: {
        type: 'splitter',
        count: 3
      }
    }
  },

  burrower: {
    id: 'burrower',
    nameKey: 'enemy_burrower_name',
    typeKey: 'enemy_burrower_type',
    tipKey: 'enemy_burrower_tip',
    baseHp: 580,
    speed: 1.5,
    armor: 5,
    threat: 2,
    reward: 12,
    isFlying: false,
    isBurrower: true,
    slowFactor: 0.9,
    artSize: { width: 14, height: 14 },
    animFrames: { walk: 4, death: 3 },
    isBoss: false
  },

  volatile_pod: {
    id: 'volatile_pod',
    nameKey: 'enemy_volatile_pod_name',
    typeKey: 'enemy_volatile_pod_type',
    tipKey: 'enemy_volatile_pod_tip',
    baseHp: 380,
    speed: 2.70,
    armor: 0,
    threat: 2,
    reward: 9,
    isFlying: false,
    isSuicideBomber: true,
    explosionRadius: 42,
    explosionDamage: 85,
    slowFactor: 1.0,
    artSize: { width: 12, height: 12 },
    animFrames: { walk: 4, death: 3 },
    isBoss: false
  },

  shaman: {
    id: 'shaman',
    nameKey: 'enemy_shaman_name',
    typeKey: 'enemy_shaman_type',
    tipKey: 'enemy_shaman_tip',
    baseHp: 720,
    speed: 0.95,
    armor: 4,
    threat: 3,
    reward: 18,
    isFlying: false,
    isHealerShaman: true,
    healCooldown: 3.5,
    healRadius: 80,
    healAmount: 65,
    resurrectCooldown: 8.0,
    slowFactor: 0.8,
    artSize: { width: 16, height: 16 },
    animFrames: { walk: 4, death: 3 },
    isBoss: false
  },

  skeletal_husk: {
    id: 'skeletal_husk',
    nameKey: 'enemy_skeletal_name',
    typeKey: 'enemy_skeletal_type',
    tipKey: 'enemy_skeletal_tip',
    baseHp: 180,
    speed: 1.25,
    armor: 2,
    threat: 1,
    reward: 3,
    isFlying: false,
    slowFactor: 1.0,
    artSize: { width: 12, height: 12 },
    animFrames: { walk: 4, death: 3 },
    isBoss: false
  },

  weaver: {
    id: 'weaver',
    nameKey: 'enemy_weaver_name',
    typeKey: 'enemy_weaver_type',
    tipKey: 'enemy_weaver_tip',
    baseHp: 460,
    speed: 1.3,
    armor: 2,
    threat: 2,
    reward: 8,
    isFlying: false,
    slowFactor: 1.0,
    webCooldown: 5.5,
    webRangeTiles: 4.2,
    webMaxHp: 3,
    artSize: { width: 14, height: 14 },
    animFrames: { walk: 4, death: 4 },
    splitOnDeath: null,
    isBoss: false
  },

  leaper: {
    id: 'leaper',
    nameKey: 'enemy_leaper_name',
    typeKey: 'enemy_leaper_type',
    tipKey: 'enemy_leaper_tip',
    baseHp: 460,
    speed: 2.85,
    armor: 2,
    threat: 2,
    reward: 9,
    isFlying: false,
    isLeaper: true,
    leapCooldown: 3.8,
    leapDistancePx: 92,
    artSize: { width: 14, height: 14 },
    animFrames: { walk: 4, death: 3 },
    isBoss: false
  },

  siege_beetle: {
    id: 'siege_beetle',
    nameKey: 'enemy_siege_beetle_name',
    typeKey: 'enemy_siege_beetle_type',
    tipKey: 'enemy_siege_beetle_tip',
    baseHp: 1520,
    speed: 0.9,
    armor: 18,
    threat: 3,
    reward: 18,
    isFlying: false,
    hasFrontShield: true,
    artSize: { width: 18, height: 18 },
    animFrames: { walk: 4, death: 3 },
    isBoss: false
  }
};

module.exports = {
  ENEMIES
};
