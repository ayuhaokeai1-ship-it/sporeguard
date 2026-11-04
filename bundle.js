/* Sporeguard Browser Bundle */
(function() {
  var __modules = {};
  var __cache = {};

  function normalize(base, rel) {
    var p = rel.replace(/\\/g, '/');
    if (p.indexOf('./') === 0 || p.indexOf('../') === 0) {
      var bParts = base.split('/'); bParts.pop();
      var rParts = p.split('/');
      for (var i = 0; i < rParts.length; i++) {
        var s = rParts[i];
        if (s === '.' || s === '') continue;
        if (s === '..') bParts.pop();
        else bParts.push(s);
      }
      p = bParts.join('/');
    }
    if (p.slice(-3) === '.js') p = p.slice(0, -3);
    return p;
  }

  function makeRequire(basePath) {
    return function require(id) {
      var key = normalize(basePath, id);
      if (!__modules[key] && __modules[key + '/index']) key = key + '/index';
      if (__cache[key]) return __cache[key].exports;
      if (!__modules[key]) throw new Error('Cannot find module: ' + id + ' (resolved ' + key + ')');
      var mod = { exports: {} };
      __cache[key] = mod;
      __modules[key](makeRequire(key + '.js'), mod, mod.exports);
      return mod.exports;
    };
  }

  window.require = makeRequire('root.js');

  /* --- js/data/palette.js --- */
  __modules['js/data/palette'] = function(require, module, exports) {
/**
 * 全局调色板与色彩配置（严格 ≤32 色）
 * 集中管理所有美术与界面颜色，禁止在逻辑或渲染代码中硬编码色值
 */

const PALETTE = {
  // 地面（苔绿） 4色
  GROUND: ['#1F3B2C', '#2E5E3E', '#4E8A4F', '#8DBE5E'],
  GROUND_DARKEST: '#1F3B2C',
  GROUND_DARK: '#2E5E3E',
  GROUND_MID: '#4E8A4F',
  GROUND_LIGHT: '#8DBE5E',

  // 路径与泥土 3色
  PATH: ['#5A3E2B', '#8B6240', '#B88A5A'],
  PATH_DARK: '#5A3E2B',
  PATH_MID: '#8B6240',
  PATH_LIGHT: '#B88A5A',

  // 夜色与阴影 2色
  NIGHT_DEEP: '#14213D',
  NIGHT_BLUE: '#1F3A5F',

  // 菌盖与菌褶 3色
  MUSHROOM_CAP: '#C9785A',
  MUSHROOM_GILL: '#F2E3C6',
  MUSHROOM_STEM: '#E8D9B5',

  // 升级分支色 3色
  UPGRADE_LV1: '#FF5FA2',     // 通用升级（Lv1）荧光粉
  BRANCH_A: '#4FD8E8',        // 分支 A 青蓝
  BRANCH_B: '#FFB347',        // 分支 B 橙黄

  // 敌人配色 5色
  ENEMY_BEETLE: '#2B2233',    // 小甲虫主体
  ENEMY_EYE: '#E63946',       // 小甲虫眼睛 / 危险红
  ENEMY_ARMORED: '#6C7A89',   // 甲壳虫
  ENEMY_SPLITTER: '#C77DFF',  // 裂殖虫 / 幼体
  ENEMY_MOTH: '#E9E4D4',      // 飞蛾 / 疾蛾

  // 界面与反馈 5色
  UI_PANEL: '#101820',        // 面板底色（85% 不透明）
  UI_PANEL_RGBA: 'rgba(16, 24, 32, 0.85)',
  UI_PANEL_SOLID: '#101820',
  UI_TEXT: '#F7F4EA',         // 正文与数字白字
  UI_SPORE: '#FFD166',        // 孢子货币黄
  UI_SEED: '#EF476F',         // 种子生命红
  UI_STAR: '#FFD700'          // 星级金
};

module.exports = PALETTE;

  };

  /* --- js/data/config.js --- */
  __modules['js/data/config'] = function(require, module, exports) {
/**
 * 全局技术规格、核心规则、经济参数与反馈配置
 * 集中管理所有规则数值，禁止在逻辑代码中硬编码
 */

const CONFIG = {
  // 3. 技术规格与画面分区
  RESOLUTION: {
    LOGICAL_WIDTH: 960,
    LOGICAL_HEIGHT: 540,
    ART_PIXEL_SCALE: 2,        // 1 个美术像素 = 2 个逻辑像素
    ART_TILE_SIZE: 16,         // 16x16 美术像素
    TILE_SIZE: 32,             // 32x32 逻辑像素
    SAFE_MARGIN_X: 24          // UI 左右安全边距各 24 px
  },

  LAYOUT: {
    MAP: { X: 0, Y: 0, WIDTH: 640, HEIGHT: 480, COLS: 20, ROWS: 15 },
    MAP_VIEW: { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0, SCALE_X: 1.0, SCALE_Y: 1.0, FULL_W: 960, FULL_H: 540 },
    BOTTOM_BAR: { X: 230, Y: 448, WIDTH: 500, HEIGHT: 86 },
    RIGHT_PANEL: { X: 640, Y: 0, WIDTH: 320, HEIGHT: 540 }
  },

  TIMING: {
    FIXED_DT: 1 / 60,          // 固定步长 1/60 秒
    SPEED_MULTIPLIERS: [1, 2, 3], // 1×、2×、3× 每帧执行 1、2、3 步
    MAX_FRAME_DELTA: 0.25      // 防止切后台产生巨型步长累积
  },

  POOL_CAPS: {
    ENEMIES: 120,              // 同屏敌人上限 120
    BULLETS: 150,              // 同屏子弹上限 150
    PARTICLES: 600,            // 同屏粒子上限 600
    HAZARDS: 40,               // 雾团与灼烧区对象池上限
    FLOATING_TEXTS: 80,        // 伤害与奖励数字对象池上限
    MAX_DRAW_CALLS: 120        // 每帧绘制调用上限
  },

  STORAGE: {
    KEY: 'sporeguard_save_v1',
    VERSION: 1,
    MAX_BYTES: 200 * 1024      // 存档不超过 200 KB
  },

  // 5.1 & 5.2 资源与经济规则
  ECONOMY: {
    INITIAL_SEEDS: 20,         // 开局 20 颗种子
    INITIAL_SPORES: {
      map1: 220,               // 初始 220 孢子，支持稳健建造 2 座防御塔开局，杜绝无脑堆满塔
      map2: 240,
      map3: 260
    },
    TARGET_TOTAL_BUDGET: {
      map1: 1800,
      map2: 2400,
      map3: 3200
    },
    WAVE_CLEAR_BASE: 25,       // 波次完成奖励 = 25 + 5 * 波次序号
    WAVE_CLEAR_PER_WAVE: 5,
    FLAWLESS_WAVE_BONUS: 15,   // 无损完美波次奖励 15
    EARLY_CALL_PER_SEC: 2,     // 提前召唤迎战奖励：每秒 +2 孢子（极具诱惑的高风险高回报）
    EARLY_CALL_MAX: 40,        // 提前召唤迎战奖励上限 40
    MULTIKILL_WINDOW_SEC: 0.5, // 0.5 秒内击杀 3 只及以上触发群杀
    MULTIKILL_MIN_COUNT: 3,    // 最少 3 只触发群杀
    MULTIKILL_PER_KILL: 2,     // 群杀奖励：击杀数 * 2
    MULTIKILL_MAX_BONUS: 40,   // 群杀奖励上限 40
    SELL_REFUND_RATE: 0.60,    // 出售返还 60%
    PREP_TIME_FIRST_WAVE: 35,  // 第一波前倒计时 35 秒
    PREP_TIME_NEXT_WAVE: 18    // 之后每波前倒计时 18 秒
  },

  // 5.4 & 5.5 伤害计算与状态叠加规则
  COMBAT: {
    MIN_ARMOR_DAMAGE_RATIO: 0.20, // 实际伤害 = max(原始伤害 - 护甲, 原始伤害 * 20%)
    MARK_MULTIPLIER: 1.15,        // 标记倍率 1.15（仅瞭望菇 A3 产生）
    MARK_DURATION: 3.0,           // 标记持续 3 秒
    CRIT_MULTIPLIER: 2.0,         // 暴击倍率 2 倍（仅瞭望菇 B3 产生）
    GLOBAL_SLOW_CAP: 0.60,        // 全局减速上限 60%
    ARMORED_SLOW_FACTOR: 0.50,    // 甲壳虫减速效果减半
    MAX_DOT_SOURCES: 3,           // 同一敌人同时受到的持续伤害来源上限 3 个
    SPAWN_LATERAL_OFFSET_PX: 6,   // 同一组出生带 ±6 像素横向偏移
    MAX_ACTIVE_WAVE_ENEMIES: 36,  // 提升场上最大并发敌人上限至 36，彻底消除波次卡顿与少怪未出  // 同一时刻场上波次出生敌人不超过 12 个
    WAVE_HP_GROWTH_PER_WAVE: 0.10,// 当前生命倍率 = (1 + 0.10 * (波次序号 - 1)) * 地图系数
    MAP_HP_COEFFICIENTS: {
      map1: 1.0,
      map2: 1.1,
      map3: 1.2
    }
  },

  // 5.7 打击反馈参数（震屏、顿帧、粒子、横幅）
  FEEDBACK: {
    HIT: {
      shakePx: 0,
      shakeMs: 0,
      hitstopMs: 0,
      particles: 4,
      whiteFlashFrames: 2
    },
    SINGLE_KILL: {
      shakePx: 1,
      shakeMs: 60,
      hitstopMs: 0,
      particles: 10,
      popNumber: true
    },
    BURST_EXPLOSION: {
      shakePx: 2,
      shakeMs: 120,
      hitstopMs: 30,
      particles: 16,
      shockwaveRing: true
    },
    MULTIKILL_SMALL: { // 3-4 只
      minKills: 3,
      maxKills: 4,
      shakePx: 2,
      shakeMs: 120,
      hitstopMs: 30,
      particles: 24,
      bannerKey: null,
      sfx: 'sfx_multikill'
    },
    MULTIKILL_CHAIN: { // 5-9 只
      minKills: 5,
      maxKills: 9,
      shakePx: 4,
      shakeMs: 200,
      hitstopMs: 60,
      particles: 48,
      bannerKey: 'banner_chain',
      sfx: 'sfx_multikill'
    },
    MULTIKILL_OVERLOAD: { // 10 只及以上
      minKills: 10,
      maxKills: 999,
      shakePx: 6,
      shakeMs: 300,
      hitstopMs: 90,
      particles: 96,
      bannerKey: 'banner_overload',
      fxSlowMoScale: 0.5,
      fxSlowMoMs: 150,
      sfx: 'sfx_multikill'
    },
    SEED_DAMAGED: {
      shakePx: 3,
      shakeMs: 150,
      hitstopMs: 0,
      particles: 12,
      redEdgeFlashMs: 350
    },
    UPGRADE_COMPLETE: {
      shakePx: 0,
      shakeMs: 0,
      hitstopMs: 0,
      particles: 20,
      flashRing: true,
      transitionFrames: 6
    },
    HITSTOP_MIN_INTERVAL_SEC: 0.5, // 两次顿帧间隔至少 0.5 秒
    HITSTOP_MAX_COMBAT_RATIO: 0.05 // 单场顿帧累计不超过战斗时间的 5%
  },

  // 5.8 评星标准
  STARS: {
    THREE_STAR_SEEDS: 16, // 剩余种子 >= 16 -> 3 星
    TWO_STAR_SEEDS: 10,   // 剩余种子 >= 10 -> 2 星
    ONE_STAR_SEEDS: 1     // 剩余种子 >= 1  -> 1 星
  }
};

module.exports = CONFIG;

  };

  /* --- js/data/towers.js --- */
  __modules['js/data/towers'] = function(require, module, exports) {
/**
 * 炮塔数值与升级树数据表（严格对齐第六章 6.1 - 6.4 表格）
 * 禁止在逻辑代码中硬编码任何炮塔属性
 */

const TOWERS = {
  watch: {
    id: 'watch',
    nameKey: 'tower_watch_name',
    roleKey: 'tower_watch_role',
    descKey: 'tower_watch_desc',
    canHitGround: true,
    canHitAir: true,
    defaultPriority: 'first',
    priorities: ['first', 'nearest', 'highest_hp'],
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 40,
    maxTotalCost: 480,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'watch_base_desc',
        cost: 120,
        range: 6.0,
        damage: 40,
        damageBonus: 0,
        interval: 1.25,
        bulletSpeed: 640,
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'watch_lv1_name',
        descKey: 'watch_lv1_desc',
        cost: 70,
        range: 6.5,
        damage: 48,
        damageBonus: 0.20, // 伤害 +20%，射程 +0.5
        interval: 1.25,
        bulletSpeed: 640,
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'watch_a2_name',
        descKey: 'watch_a2_desc',
        cost: 110,
        range: 8.0,        // 射程 +1.5
        damage: 48,
        damageBonus: 0.20,
        interval: 1.125,   // 攻击间隔 -10%
        bulletSpeed: 800,  // 弹速 +25% (640 * 1.25 = 800)
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'watch_a3_name',
        descKey: 'watch_a3_desc',
        cost: 180,
        range: 9.0,        // 射程 +1.0
        damage: 48,
        damageBonus: 0.20,
        interval: 1.125,
        bulletSpeed: 800,
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: true, // 命中后标记目标 3 秒，直接伤害 +15%
        markDuration: 3.0,
        markBonus: 0.15,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'watch_b2_name',
        descKey: 'watch_b2_desc',
        cost: 110,
        range: 6.5,
        damage: 62,        // 40 * (1 + 0.20 + 0.35) = 62
        damageBonus: 0.55,
        interval: 1.25,
        bulletSpeed: 640,
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'watch_b3_name',
        descKey: 'watch_b3_desc',
        cost: 180,
        range: 6.5,
        damage: 62,
        damageBonus: 0.55,
        interval: 1.25,
        bulletSpeed: 640,
        critRate: 0.15,    // 暴击率 15%，暴击伤害 2 倍
        critMultiplier: 2.0,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: []
      }
    }
  },

  mist: {
    id: 'mist',
    nameKey: 'tower_mist_name',
    roleKey: 'tower_mist_role',
    descKey: 'tower_mist_desc',
    canHitGround: true,
    canHitAir: true,
    defaultPriority: 'densest',
    priorities: ['densest', 'first'],
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 4,
    maxTotalCost: 420,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'mist_base_desc',
        cost: 90,
        range: 3.5,        // 施放范围 3.5 格（全部节点保持不变）
        interval: 4.0,     // 施放间隔 4.0 秒（全部节点保持不变）
        cloudRadius: 1.5,
        cloudDuration: 3.0,
        slow: 0.30,
        dps: 4,
        residualSlowDuration: 0,
        armorReduction: 0,
        isBurningMist: false,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'mist_lv1_name',
        descKey: 'mist_lv1_desc',
        cost: 60,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 1.5,
        cloudDuration: 3.5, // 持续时间 +0.5 秒
        slow: 0.35,         // 减速 +5%
        dps: 4,
        residualSlowDuration: 0,
        armorReduction: 0,
        isBurningMist: false,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'mist_a2_name',
        descKey: 'mist_a2_desc',
        cost: 100,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 1.5,
        cloudDuration: 3.5,
        slow: 0.45,         // 减速 +10%
        dps: 4,
        residualSlowDuration: 1.0, // 离开雾团后减速残留 1.0 秒
        armorReduction: 0,
        isBurningMist: false,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'mist_a3_name',
        descKey: 'mist_a3_desc',
        cost: 170,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 1.5,
        cloudDuration: 3.5,
        slow: 0.55,         // 减速 +10%
        dps: 4,
        residualSlowDuration: 1.0,
        armorReduction: 2,  // 雾团内敌人护甲 -2（最低 0）
        isBurningMist: false,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'mist_b2_name',
        descKey: 'mist_b2_desc',
        cost: 100,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 2.0,   // 雾团半径 +0.5
        cloudDuration: 3.5,
        slow: 0.35,
        dps: 6,             // 持续伤害 +2
        residualSlowDuration: 0,
        armorReduction: 0,
        isBurningMist: false,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'mist_b3_name',
        descKey: 'mist_b3_desc',
        cost: 170,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 2.5,   // 雾团半径 2.5
        cloudDuration: 3.5,
        slow: 0.35,
        dps: 10,            // 雾团燃烧，持续伤害 +4（累计 10）
        residualSlowDuration: 0,
        armorReduction: 0,
        isBurningMist: true,
        next: []
      }
    }
  },

  thorn: {
    id: 'thorn',
    nameKey: 'tower_thorn_name',
    roleKey: 'tower_thorn_role',
    descKey: 'tower_thorn_desc',
    canHitGround: true,
    canHitAir: false,
    defaultPriority: 'first',
    priorities: ['first', 'nearest', 'highest_hp'],
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 9,
    maxTotalCost: 375,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'thorn_base_desc',
        cost: 80,
        range: 4.5,
        damage: 9,
        damageBonus: 0,
        interval: 0.45,
        pierce: 2,
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'thorn_lv1_name',
        descKey: 'thorn_lv1_desc',
        cost: 55,
        range: 5.0,        // 射程 +0.5
        damage: 10.8,      // 伤害 +20%
        damageBonus: 0.20,
        interval: 0.45,
        pierce: 2,
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'thorn_a2_name',
        descKey: 'thorn_a2_desc',
        cost: 90,
        range: 5.0,
        damage: 10.8,
        damageBonus: 0.20,
        interval: 0.45,
        pierce: 4,         // 穿透数 +2
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'thorn_a3_name',
        descKey: 'thorn_a3_desc',
        cost: 150,
        range: 5.0,
        damage: 10.8,
        damageBonus: 0.20,
        interval: 0.45,
        pierce: 7,         // 穿透数 7
        bulletSpeed: 900,
        sideSpikes: 2,     // 每次齐射增加 2 根侧刺（左右各偏 12°），侧刺伤害 50%
        sideAngleDeg: 12,
        sideDamageRatio: 0.50,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'thorn_b2_name',
        descKey: 'thorn_b2_desc',
        cost: 90,
        range: 5.0,
        damage: 13.5,      // 9 * (1 + 0.20 + 0.30) = 13.5
        damageBonus: 0.50,
        interval: 0.45,
        pierce: 2,
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'thorn_b3_name',
        descKey: 'thorn_b3_desc',
        cost: 150,
        range: 5.0,
        damage: 13.5,
        damageBonus: 0.50,
        interval: 0.41,    // 攻击间隔 -10% (0.45 * 0.9 = 0.405 -> 0.41)
        pierce: 2,
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0.20, // 每穿透 1 个目标，后续伤害 +20%（最多 +100%）
        pierceDamageBonusMax: 1.00,
        next: []
      }
    }
  },

  burst: {
    id: 'burst',
    nameKey: 'tower_burst_name',
    roleKey: 'tower_burst_role',
    descKey: 'tower_burst_desc',
    canHitGround: true,
    canHitAir: false,
    defaultPriority: 'densest',
    priorities: ['densest'], // 爆裂菇固定“最密集”
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 30,
    maxTotalCost: 465,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'burst_base_desc',
        cost: 110,
        range: 4.0,        // 射程 4.0 格（全部节点保持不变）
        damage: 30,
        damageBonus: 0,
        interval: 1.6,     // 攻击间隔 1.6 秒（全部节点保持不变）
        splashRadius: 1.25,
        flightTime: 0.38,  // 抛物线炮弹飞行时间（秒）
        burnZone: null,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'burst_lv1_name',
        descKey: 'burst_lv1_desc',
        cost: 65,
        range: 4.0,
        damage: 36,        // 伤害 +20%
        damageBonus: 0.20,
        interval: 1.6,
        splashRadius: 1.25,
        flightTime: 0.38,
        burnZone: null,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'burst_a2_name',
        descKey: 'burst_a2_desc',
        cost: 110,
        range: 4.0,
        damage: 36,
        damageBonus: 0.20,
        interval: 1.6,
        splashRadius: 1.75,// 溅射半径 +0.5
        flightTime: 0.38,
        burnZone: null,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'burst_a3_name',
        descKey: 'burst_a3_desc',
        cost: 180,
        range: 4.0,
        damage: 40.5,      // 30 * (1 + 0.20 + 0.15) = 40.5
        damageBonus: 0.35,
        interval: 1.6,
        splashRadius: 2.25,// 溅射半径 +0.5
        flightTime: 0.38,
        burnZone: null,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'burst_b2_name',
        descKey: 'burst_b2_desc',
        cost: 110,
        range: 4.0,
        damage: 45,        // 30 * (1 + 0.20 + 0.30) = 45
        damageBonus: 0.50,
        interval: 1.6,
        splashRadius: 1.25,
        flightTime: 0.38,
        burnZone: null,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'burst_b3_name',
        descKey: 'burst_b3_desc',
        cost: 180,
        range: 4.0,
        damage: 45,
        damageBonus: 0.50,
        interval: 1.6,
        splashRadius: 1.25,
        flightTime: 0.38,
        burnZone: {        // 爆心留下灼烧区：半径 1.0 格，持续 3 秒，每秒 8 点伤害
          radius: 1.0,
          duration: 3.0,
          dps: 8
        },
        next: []
      }
    }
  },

  lumina: {
    id: 'lumina',
    nameKey: 'tower_lumina_name',
    roleKey: 'tower_lumina_role',
    descKey: 'tower_lumina_desc',
    canHitGround: true,
    canHitAir: true,
    defaultPriority: 'nearest',
    priorities: ['nearest', 'first', 'highest_hp'],
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 18,
    maxTotalCost: 420,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'lumina_base_desc',
        cost: 95,
        range: 4.0,
        damage: 6,
        interval: 2.0,
        sporeGen: 12,
        sporeInterval: 10.0,
        auraDmgBonus: 0.10,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'lumina_lv1_name',
        descKey: 'lumina_lv1_desc',
        cost: 75,
        range: 4.5,
        damage: 10,
        interval: 1.8,
        sporeGen: 16,
        sporeInterval: 9.0,
        auraDmgBonus: 0.12,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'lumina_a2_name',
        descKey: 'lumina_a2_desc',
        cost: 100,
        range: 5.0,
        damage: 20,
        interval: 1.5,
        auraAspdBonus: 0.20,
        auraHeal: 25,
        healInterval: 5.0,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'lumina_a3_name',
        descKey: 'lumina_a3_desc',
        cost: 160,
        range: 5.5,
        damage: 32,
        interval: 1.2,
        auraAspdBonus: 0.30,
        auraHeal: 40,
        healInterval: 4.0,
        holyWard: true,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'lumina_b2_name',
        descKey: 'lumina_b2_desc',
        cost: 90,
        range: 4.2,
        damage: 10,
        interval: 2.0,
        sporeGen: 36,
        sporeInterval: 6.0,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'lumina_b3_name',
        descKey: 'lumina_b3_desc',
        cost: 150,
        range: 4.5,
        damage: 14,
        interval: 2.0,
        sporeGen: 60,
        sporeInterval: 5.0,
        relicDropBonus: true,
        next: []
      }
    }
  }

};

const TOWER_ORDER = ['watch', 'mist', 'thorn', 'burst', 'lumina'];

module.exports = {
  TOWERS,
  TOWER_ORDER
};

  };

  /* --- js/data/enemies.js --- */
  __modules['js/data/enemies'] = function(require, module, exports) {
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
    baseHp: 95,          // 基础血量从 40 提升至 95，需狙击菇 3 发击杀，形成有压迫感的步兵行进线
    speed: 1.2,          // 格/秒
    armor: 2,            // 基础轻甲免伤 2 点
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
    baseHp: 60,          // 从 22 提升至 60，不再被 1 枪秒杀，检验减速与多目标拦截
    speed: 2.25,         // 格/秒（极速冲锋）
    armor: 0,
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
    baseHp: 380,         // 从 220 提升至 380，真正的前排坚盾重装坦克
    speed: 0.75,         // 格/秒，沉稳推进
    armor: 12,           // 12 点扎实护甲，大幅抵挡单体针刺，逼出毒雾腐蚀或火炮破甲！
    threat: 2,
    reward: 12,
    isFlying: false,
    slowFactor: 0.6,     // 减速抗性 40%
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
    baseHp: 125,         // 从 55 提升至 125，需防空塔多轮专注射击
    speed: 1.6,          // 格/秒，沿空中航线直穿树冠
    armor: 0,
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
    baseHp: 210,         // 从 90 提升至 210
    speed: 1.0,          // 格/秒
    armor: 2,
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
    baseHp: 45,          // 从 24 提升至 45
    speed: 1.9,          // 格/秒，高速分散奔逃
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
    baseHp: 4200,        // 从 2400 提升至 4200，带来扣人心弦的守关激战
    speed: 0.65,         // 格/秒
    armor: 14,
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
    baseHp: 5200,        // 从 3200 提升至 5200
    speed: 0.85,         // 格/秒（空中航线）
    armor: 6,
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
    baseHp: 6500,        // 从 4000 提升至 6500
    speed: 0.6,          // 格/秒
    armor: 10,
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
    baseHp: 320,
    speed: 1.35,
    armor: 4,
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
    baseHp: 160,
    speed: 2.15,
    armor: 0,
    threat: 2,
    reward: 9,
    isFlying: false,
    isSuicideBomber: true,
    explosionRadius: 42,
    explosionDamage: 60,
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
    baseHp: 420,
    speed: 0.85,
    armor: 2,
    threat: 3,
    reward: 18,
    isFlying: false,
    isHealerShaman: true,
    healCooldown: 3.5,
    healRadius: 80,
    healAmount: 40,
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
    baseHp: 120,
    speed: 1.1,
    armor: 1,
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
    baseHp: 190,
    speed: 1.15,
    armor: 1,
    threat: 2,
    reward: 8,
    isFlying: false,
    slowFactor: 1.0,
    webCooldown: 7.5,
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
    baseHp: 180,
    speed: 2.35,
    armor: 1,
    threat: 2,
    reward: 9,
    isFlying: false,
    isLeaper: true,
    leapCooldown: 4.5,
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
    baseHp: 560,
    speed: 0.85,
    armor: 8,
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

  };

  /* --- js/data/maps.js --- */
  __modules['js/data/maps'] = function(require, module, exports) {
/**
 * 地图数据表（三张地图：晨雾林地、苔藓溪谷、夜光蕈林）
 * 20x15 网格（每格 32x32 逻辑像素，共 640x480）
 * 路线决定策略：玩家能一眼看出最佳放置点（苔地格 moss 为黄金战术位）
 */

const MAPS = {
  map1: {
    id: 'map1',
    index: 1,
    nameKey: 'map1_name',
    subtitleKey: 'map1_subtitle',
    descKey: 'map1_desc',
    theme: 'morning_mist',
    subpackage: 'map1',
    atlasPath: 'subpackages/map1/atlas.png',
    bossBgmPath: 'subpackages/map1/boss.wav',
    initialSpores: 300,
    hpCoefficient: 1.0,
    totalWaves: 10,
    bossId: 'boss_m1',
    // 地面路径拐点（格坐标 [col, row]），总长 45 格
    groundWaypoints: [
      [0, 2],
      [6, 2],
      [6, 11],
      [12, 11],
      [12, 3],
      [17, 3],
      [17, 12],
      [19, 12]
    ],
    spawnTile2: [18, 2],
    // 侧翼巢穴·后排回旋突袭路径 (Secondary Flank Route - 盘旋突袭后排)
    groundWaypoints2: [
      [18, 2],
      [18, 5],
      // 环绕第 1 圈：盘旋围猎后排（掠过第 15~18 列，第 5~10 行后排经济区）
      [15, 5],
      [15, 10],
      [18, 10],
      [18, 5],
      // 环绕第 2 圈：再次围猎撕咬后排太阳菇与辅助塔
      [15, 5],
      [15, 10],
      [18, 10],
      // 盘旋结束，切入主道冲向终点种子仓库
      [17, 11],
      [19, 12]
    ],
    // 空中航线拐点（跳过部分地面转角，长度约 35.8 格 ≈ 地面路线 80%）
    airWaypoints: [
      [0, 2],
      [5, 2],
      [8, 9],
      [12, 9],
      [15, 4],
      [17, 4],
      [19, 12]
    ],
    warehouseTile: [19, 12],
    spawnTile: [0, 2],
    // 黄金战术苔地格（提示玩家最佳放置点，可建造）
    mossTiles: [
      [5, 3], [7, 6], [7, 10], [11, 10], [11, 7],
      [11, 4], [13, 4], [16, 4], [16, 8], [16, 11],
      [9, 8], [14, 7]
    ],
    // 障碍物格（树桩、林石、浓雾灌木，不可建造）
    obstacles: [
      [2, 0], [3, 0], [9, 1], [10, 1], [15, 1],
      [1, 5], [2, 5], [1, 9], [2, 10], [3, 13], [4, 13],
      [9, 5], [9, 13], [14, 11], [14, 12], [18, 1], [19, 1],
      [0, 14], [1, 14], [18, 14]
    ],
    parallaxColors: ['#14213D', '#1F3B2C', '#2E5E3E'],
    mistAlpha: 0.16,
    dynamicNightLight: false
  },

  map2: {
    id: 'map2',
    index: 2,
    nameKey: 'map2_name',
    subtitleKey: 'map2_subtitle',
    descKey: 'map2_desc',
    theme: 'moss_creek',
    subpackage: 'map2',
    atlasPath: 'subpackages/map2/atlas.png',
    bossBgmPath: 'subpackages/map2/boss.wav',
    initialSpores: 320,
    hpCoefficient: 1.1,
    totalWaves: 12,
    bossId: 'boss_m2',
    // 地面路径拐点，总长 52 格（双回环溪谷，适合雾菇+爆裂菇群清与高台对空）
    groundWaypoints: [
      [0, 11],
      [4, 11],
      [4, 2],
      [9, 2],
      [9, 12],
      [14, 12],
      [14, 3],
      [18, 3],
      [18, 8],
      [19, 8]
    ],
    spawnTile2: [19, 2],
    // 侧翼高台暗穴·盘旋回环后排突击
    groundWaypoints2: [
      [19, 2],
      [16, 2],
      [16, 6],
      [18, 6],
      [18, 2],
      [16, 2],
      [16, 6],
      [18, 6],
      [18, 8],
      [19, 8]
    ],
    // 空中航线拐点（长约 42.1 格 ≈ 地面路线 81%）
    airWaypoints: [
      [0, 11],
      [4, 11],
      [4, 4],
      [9, 4],
      [9, 10],
      [14, 10],
      [14, 4],
      [18, 4],
      [19, 8]
    ],
    warehouseTile: [19, 8],
    spawnTile: [0, 11],
    mossTiles: [
      [3, 10], [5, 3], [8, 3], [6, 6], [8, 8],
      [10, 11], [13, 11], [11, 7], [13, 4], [15, 4],
      [17, 4], [17, 7]
    ],
    // 溪谷水面与溪石（不可建造）
    obstacles: [
      [1, 2], [2, 2], [1, 3], [2, 6], [2, 7],
      [6, 4], [7, 4], [6, 9], [7, 9],
      [11, 2], [12, 2], [11, 9], [12, 9],
      [16, 10], [16, 11], [17, 11],
      [0, 14], [1, 14], [6, 13], [7, 13], [18, 13], [19, 13]
    ],
    parallaxColors: ['#14213D', '#1F3A5F', '#2E5E3E'],
    mistAlpha: 0.12,
    dynamicNightLight: false
  },

  map3: {
    id: 'map3',
    index: 3,
    nameKey: 'map3_name',
    subtitleKey: 'map3_subtitle',
    descKey: 'map3_desc',
    theme: 'night_fungi',
    subpackage: 'map3',
    atlasPath: 'subpackages/map3/atlas.png',
    bossBgmPath: 'subpackages/map3/boss.wav',
    initialSpores: 350,
    hpCoefficient: 1.2,
    totalWaves: 15,
    bossId: 'boss_m3',
    // 地面路径拐点，总长 60 格（三层平行长廊，极佳适配尖刺菇直线穿透与中枢联防）
    groundWaypoints: [
      [0, 2],
      [17, 2],
      [17, 6],
      [2, 6],
      [2, 10],
      [14, 10],
      [14, 13],
      [19, 13]
    ],
    // 空中航线拐点（长约 48.8 格 ≈ 地面路线 81%）
    airWaypoints: [
      [0, 2],
      [15, 2],
      [15, 6],
      [4, 6],
      [4, 10],
      [14, 10],
      [19, 13]
    ],
    warehouseTile: [19, 13],
    spawnTile: [0, 2],
    mossTiles: [
      [4, 3], [8, 3], [12, 3], [16, 4],
      [3, 5], [7, 5], [11, 5], [15, 5],
      [3, 8], [6, 8], [10, 8], [13, 8],
      [5, 11], [9, 11], [13, 11], [16, 12]
    ],
    // 夜光巨蕈与暗影岩（不可建造）
    obstacles: [
      [2, 0], [6, 0], [10, 0], [14, 0], [18, 0],
      [0, 5], [0, 8], [0, 12], [1, 13],
      [5, 4], [9, 4], [13, 4],
      [5, 8], [8, 8], [12, 8],
      [18, 4], [19, 4], [18, 8], [19, 8],
      [4, 13], [8, 13], [11, 13]
    ],
    parallaxColors: ['#14213D', '#1F3A5F', '#1F3B2C'],
    mistAlpha: 0.20,
    dynamicNightLight: true // 随波次光照增强
  }
};

const MAP_ORDER = ['map1', 'map2', 'map3'];

module.exports = {
  MAPS,
  MAP_ORDER
};

  };

  /* --- js/data/waves.js --- */
  __modules['js/data/waves'] = function(require, module, exports) {
/**
 * 波次结构数据表（严格对齐第七章 7.3 - 7.5 节奏与第五章 5.2 经济预算目标）
 * 每波由 2-5 个组构成，组内包含 type, count, interval, start
 * 地图 1（10 波，总预算 ≈1600）
 * 地图 2（12 波，总预算 ≈2000）
 * 地图 3（15 波，总预算 ≈2800）
 */

const WAVES = {
  // 地图 1：晨雾林地（10 波，节奏紧凑成梯队推进）
  map1: [
    // Wave 1: 晨雾初现，林地先头步兵集群
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 4, interval: 1.1, start: 0 },
        { type: 'beetle', count: 5, interval: 1.0, start: 7 },
        { type: 'beetle', count: 5, interval: 0.9, start: 15 }
      ]
    },
    // Wave 2: 极速突袭，迅捷飞蠓蜂拥而至
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 5, interval: 1.0, start: 0 },
        { type: 'swift', count: 6, interval: 0.8, start: 6 },
        { type: 'beetle', count: 5, interval: 0.9, start: 14 },
        { type: 'swift', count: 4, interval: 0.7, start: 20 }
      ]
    },
    // Wave 3: 树冠空袭，林光飞蛾掠空
    {
      wave: 3,
      groups: [
        { type: 'beetle', count: 6, interval: 1.0, start: 0 },
        { type: 'moth', count: 4, interval: 1.4, start: 5 },
        { type: 'swift', count: 6, interval: 0.8, start: 12 },
        { type: 'moth', count: 4, interval: 1.3, start: 18 },
        { type: 'volatile_pod', count: 3, interval: 1.2, start: 22, routeIndex: 1 }
      ]
    },
    // Wave 4: 坚甲逼近，暗影潜行者侧翼回旋绕袭
    {
      wave: 4,
      groups: [
        { type: 'armored', count: 1, interval: 2.0, start: 0 },
        { type: 'beetle', count: 5, interval: 0.9, start: 3 },
        { type: 'armored', count: 1, interval: 2.0, start: 9 },
        { type: 'weaver', count: 2, interval: 2.5, start: 10 },
        { type: 'leaper', count: 3, interval: 1.2, start: 12, routeIndex: 1 },
        { type: 'beetle', count: 3, interval: 1.0, start: 15, routeIndex: 1 },
        { type: 'swift', count: 4, interval: 0.7, start: 18 },
        { type: 'moth', count: 4, interval: 1.3, start: 20 }
      ]
    },
    // Wave 5: 空地一体混合冲锋
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 2, interval: 2.5, start: 0 },
        { type: 'swift', count: 8, interval: 0.7, start: 4 },
        { type: 'moth', count: 6, interval: 1.2, start: 12 },
        { type: 'beetle', count: 8, interval: 0.8, start: 20 },
        { type: 'shaman', count: 1, interval: 1.0, start: 24, routeIndex: 1 }
      ]
    },
    // Wave 6: 异化裂殖，潜伏掘地虫破土偷袭
    {
      wave: 6,
      groups: [
        { type: 'siege_beetle', count: 1, interval: 1.0, start: 0 },
        { type: 'leaper', count: 2, interval: 1.5, start: 2 },
        { type: 'splitter', count: 2, interval: 2.5, start: 5 },
        { type: 'weaver', count: 2, interval: 2.0, start: 2 },
        { type: 'beetle', count: 6, interval: 0.9, start: 6 },
        { type: 'burrower', count: 3, interval: 1.5, start: 10, routeIndex: 1 },
        { type: 'splitter', count: 2, interval: 2.2, start: 14 },
        { type: 'swift', count: 8, interval: 0.7, start: 20 }
      ]
    },
    // Wave 7: 重装压境与裂殖包夹
    {
      wave: 7,
      groups: [
        { type: 'armored', count: 2, interval: 2.5, start: 0 },
        { type: 'splitter', count: 3, interval: 2.0, start: 6 },
        { type: 'moth', count: 6, interval: 1.2, start: 14 },
        { type: 'swift', count: 8, interval: 0.65, start: 22 },
        { type: 'burrower', count: 3, interval: 2.0, start: 25 }
      ]
    },
    // Wave 8: 狂暴大迁徙与后排钳形围猎
    {
      wave: 8,
      groups: [
        { type: 'swift', count: 10, interval: 0.65, start: 0 },
        { type: 'moth', count: 8, interval: 1.1, start: 8 },
        { type: 'leaper', count: 4, interval: 1.1, start: 12, routeIndex: 1 },
        { type: 'armored', count: 3, interval: 2.2, start: 16 },
        { type: 'splitter', count: 4, interval: 1.8, start: 24 }
      ]
    },
    // Wave 9: 决战前夕黑潮
    {
      wave: 9,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.0, start: 0 },
        { type: 'leaper', count: 4, interval: 1.0, start: 5 },
        { type: 'splitter', count: 4, interval: 1.8, start: 7 },
        { type: 'swift', count: 12, interval: 0.6, start: 15 },
        { type: 'moth', count: 8, interval: 1.0, start: 22 }
      ]
    },
    // Wave 10: 最终决战 腐化蛀王登场
    {
      wave: 10,
      groups: [
        {
      wave: 10,
      groups: [
        { type: 'boss_m1', count: 1, interval: 1.0, start: 0 },
        { type: 'armored', count: 2, interval: 2.5, start: 5 },
        { type: 'moth', count: 6, interval: 1.2, start: 14 },
        { type: 'leaper', count: 4, interval: 1.2, start: 18, routeIndex: 1 },
        { type: 'splitter', count: 3, interval: 2.0, start: 24 },
        { type: 'burrower', count: 3, interval: 1.5, start: 28, routeIndex: 1 },
        { type: 'swift', count: 8, interval: 0.7, start: 32 }
      ]
    }
      ]
    }
  ],

  // 地图 2：苔藓溪谷（12 波）
  // 第1波小甲虫与飞蛾；第3波疾蛾；第5波甲壳虫；第7波裂殖虫；第9波起混编；第12波蛾后
  map2: [
    // Wave 1: 小甲虫与飞蛾混编试探
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 6, interval: 1.1, start: 0 },
        { type: 'moth', count: 4, interval: 1.4, start: 7 },
        { type: 'beetle', count: 6, interval: 0.9, start: 14 }
      ]
    },
    // Wave 2: 小甲虫与飞蛾强化
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 6, interval: 1.0, start: 0 },
        { type: 'moth', count: 5, interval: 1.2, start: 6 },
        { type: 'beetle', count: 6, interval: 0.9, start: 14 }
      ]
    },
    // Wave 3: 引入疾蛾
    {
      wave: 3,
      groups: [
        { type: 'swift', count: 6, interval: 0.8, start: 0 },
        { type: 'beetle', count: 6, interval: 0.9, start: 5 },
        { type: 'moth', count: 5, interval: 1.2, start: 12 }
      ]
    },
    // Wave 4: 疾蛾与飞蛾快攻
    {
      wave: 4,
      groups: [
        { type: 'moth', count: 6, interval: 1.1, start: 0 },
        { type: 'swift', count: 8, interval: 0.7, start: 6 },
        { type: 'beetle', count: 6, interval: 0.9, start: 14 }
      ]
    },
    // Wave 5: 引入甲壳虫
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 2, interval: 2.2, start: 0 },
        { type: 'beetle', count: 7, interval: 0.9, start: 5 },
        { type: 'moth', count: 6, interval: 1.1, start: 12 }
      ]
    },
    // Wave 6: 重甲与快虫交替
    {
      wave: 6,
      groups: [
        { type: 'armored', count: 2, interval: 2.0, start: 0 },
        { type: 'swift', count: 8, interval: 0.7, start: 5 },
        { type: 'moth', count: 6, interval: 1.1, start: 12 },
        { type: 'beetle', count: 6, interval: 0.8, start: 18 }
      ]
    },
    // Wave 7: 引入裂殖虫
    {
      wave: 7,
      groups: [
        { type: 'splitter', count: 3, interval: 2.0, start: 0 },
        { type: 'beetle', count: 7, interval: 0.8, start: 6 },
        { type: 'moth', count: 6, interval: 1.1, start: 14 }
      ]
    },
    // Wave 8: 裂殖与重甲
    {
      wave: 8,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.0, start: 0 },
        { type: 'leaper', count: 4, interval: 1.0, start: 5 },
        { type: 'splitter', count: 4, interval: 1.8, start: 6 },
        { type: 'swift', count: 8, interval: 0.7, start: 14 },
        { type: 'moth', count: 6, interval: 1.1, start: 20 }
      ]
    },
    // Wave 9: 混编开始
    {
      wave: 9,
      groups: [
        { type: 'armored', count: 3, interval: 1.8, start: 0 },
        { type: 'moth', count: 7, interval: 1.0, start: 6 },
        { type: 'splitter', count: 4, interval: 1.6, start: 14 },
        { type: 'swift', count: 8, interval: 0.7, start: 21 }
      ]
    },
    // Wave 10: 混编强袭
    {
      wave: 10,
      groups: [
        { type: 'swift', count: 9, interval: 0.65, start: 0 },
        { type: 'armored', count: 3, interval: 1.8, start: 6 },
        { type: 'moth', count: 8, interval: 1.0, start: 13 },
        { type: 'splitter', count: 5, interval: 1.6, start: 22 }
      ]
    },
    // Wave 11: 混编高潮
    {
      wave: 11,
      groups: [
        { type: 'armored', count: 4, interval: 1.8, start: 0 },
        { type: 'splitter', count: 5, interval: 1.6, start: 7 },
        { type: 'moth', count: 9, interval: 0.9, start: 15 },
        { type: 'swift', count: 10, interval: 0.6, start: 24 }
      ]
    },
    // Wave 12: 最终波 蛾后登场（空中首领 + 护卫）
    {
      wave: 12,
      groups: [
        { type: 'boss_m2', count: 1, interval: 1.0, start: 0 },
        { type: 'moth', count: 7, interval: 2.2, start: 6 },
        { type: 'armored', count: 3, interval: 4.2, start: 20 },
        { type: 'splitter', count: 4, interval: 3.2, start: 32 },
        { type: 'swift', count: 8, interval: 1.4, start: 44 }
      ]
    }
  ],

  // 地图 3：夜光蕈林（15 波）
  // 第1波小甲虫与疾蛾；第4波甲壳虫与飞蛾；第6波裂殖虫；第9波起全部类型混编；第15波裂殖母体
  map3: [
    // Wave 1: 小甲虫与疾蛾
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 7, interval: 2.4, start: 0 },
        { type: 'swift', count: 6, interval: 1.8, start: 16 }
      ]
    },
    // Wave 2: 小甲虫与疾蛾密集突进
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 8, interval: 2.0, start: 0 },
        { type: 'swift', count: 7, interval: 1.5, start: 15 },
        { type: 'beetle', count: 6, interval: 1.8, start: 28 }
      ]
    },
    // Wave 3: 高速地面虫群
    {
      wave: 3,
      groups: [
        { type: 'swift', count: 8, interval: 1.4, start: 0 },
        { type: 'beetle', count: 9, interval: 1.7, start: 12 },
        { type: 'swift', count: 7, interval: 1.4, start: 28 }
      ]
    },
    // Wave 4: 引入甲壳虫与飞蛾
    {
      wave: 4,
      groups: [
        { type: 'armored', count: 3, interval: 4.5, start: 0 },
        { type: 'moth', count: 6, interval: 2.4, start: 12 },
        { type: 'beetle', count: 7, interval: 1.8, start: 26 }
      ]
    },
    // Wave 5: 陆空夹击
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 3, interval: 4.0, start: 0 },
        { type: 'swift', count: 8, interval: 1.4, start: 12 },
        { type: 'moth', count: 7, interval: 2.0, start: 24 },
        { type: 'beetle', count: 7, interval: 1.7, start: 38 }
      ]
    },
    // Wave 6: 引入裂殖虫
    {
      wave: 6,
      groups: [
        { type: 'splitter', count: 5, interval: 3.2, start: 0 },
        { type: 'moth', count: 6, interval: 2.2, start: 16 },
        { type: 'swift', count: 8, interval: 1.4, start: 30 }
      ]
    },
    // Wave 7: 裂殖与重甲推进
    {
      wave: 7,
      groups: [
        { type: 'armored', count: 4, interval: 3.8, start: 0 },
        { type: 'splitter', count: 5, interval: 3.0, start: 14 },
        { type: 'moth', count: 7, interval: 2.0, start: 28 },
        { type: 'swift', count: 7, interval: 1.4, start: 40 }
      ]
    },
    // Wave 8: 双路压境
    {
      wave: 8,
      groups: [
        { type: 'splitter', count: 6, interval: 2.8, start: 0 },
        { type: 'armored', count: 4, interval: 3.6, start: 14 },
        { type: 'moth', count: 8, interval: 1.8, start: 28 },
        { type: 'beetle', count: 8, interval: 1.5, start: 42 }
      ]
    },
    // Wave 9: 全部类型混编 I
    {
      wave: 9,
      groups: [
        { type: 'armored', count: 4, interval: 3.5, start: 0 },
        { type: 'swift', count: 9, interval: 1.2, start: 10 },
        { type: 'moth', count: 7, interval: 1.9, start: 20 },
        { type: 'splitter', count: 5, interval: 2.8, start: 32 },
        { type: 'beetle', count: 8, interval: 1.4, start: 44 }
      ]
    },
    // Wave 10: 全部类型混编 II
    {
      wave: 10,
      groups: [
        { type: 'splitter', count: 6, interval: 2.6, start: 0 },
        { type: 'moth', count: 8, interval: 1.8, start: 12 },
        { type: 'armored', count: 4, interval: 3.4, start: 24 },
        { type: 'swift', count: 10, interval: 1.1, start: 36 },
        { type: 'beetle', count: 8, interval: 1.4, start: 46 }
      ]
    },
    // Wave 11: 全部类型混编 III
    {
      wave: 11,
      groups: [
        { type: 'armored', count: 5, interval: 3.2, start: 0 },
        { type: 'splitter', count: 6, interval: 2.5, start: 12 },
        { type: 'moth', count: 8, interval: 1.7, start: 24 },
        { type: 'swift', count: 10, interval: 1.1, start: 36 },
        { type: 'beetle', count: 8, interval: 1.3, start: 46 }
      ]
    },
    // Wave 12: 全部类型混编 IV
    {
      wave: 12,
      groups: [
        { type: 'swift', count: 11, interval: 1.0, start: 0 },
        { type: 'armored', count: 5, interval: 3.2, start: 10 },
        { type: 'splitter', count: 7, interval: 2.4, start: 22 },
        { type: 'moth', count: 9, interval: 1.6, start: 36 },
        { type: 'beetle', count: 8, interval: 1.3, start: 48 }
      ]
    },
    // Wave 13: 全部类型混编 V
    {
      wave: 13,
      groups: [
        { type: 'armored', count: 5, interval: 3.0, start: 0 },
        { type: 'moth', count: 10, interval: 1.5, start: 10 },
        { type: 'splitter', count: 7, interval: 2.3, start: 24 },
        { type: 'swift', count: 11, interval: 1.0, start: 38 },
        { type: 'beetle', count: 9, interval: 1.2, start: 48 }
      ]
    },
    // Wave 14: 终局前夜全军突击
    {
      wave: 14,
      groups: [
        { type: 'armored', count: 6, interval: 2.8, start: 0 },
        { type: 'splitter', count: 8, interval: 2.2, start: 12 },
        { type: 'moth', count: 10, interval: 1.5, start: 26 },
        { type: 'swift', count: 12, interval: 0.9, start: 40 },
        { type: 'beetle', count: 10, interval: 1.1, start: 50 }
      ]
    },
    // Wave 15: 最终波 裂殖母体登场
    {
      wave: 15,
      groups: [
        { type: 'boss_m3', count: 1, interval: 1.0, start: 0 },
        { type: 'armored', count: 4, interval: 3.5, start: 8 },
        { type: 'moth', count: 8, interval: 1.8, start: 20 },
        { type: 'splitter', count: 6, interval: 2.6, start: 34 },
        { type: 'swift', count: 10, interval: 1.1, start: 48 }
      ]
    }
  ]
};

module.exports = {
  WAVES
};

  };

  /* --- js/data/atlas.js --- */
  __modules['js/data/atlas'] = function(require, module, exports) {
/**
 * 图集坐标映射表 (js/data/atlas.js)
 * 定义主包精灵图集 (images/sprites_atlas.png)、UI图集 (images/ui_atlas.png)
 * 以及三个地图分包图集 (subpackages/map1..3/atlas.png) 的精确美术像素区域
 */

const TOWER_IDS = ['watch', 'mist', 'thorn', 'burst'];
const NODE_IDS = ['base', 'lv1', 'a2', 'a3', 'b2', 'b3'];

const SPRITE_ATLAS = {
  path: 'images/sprites_atlas.png',
  towers: {},
  enemies: {
    beetle: {
      rowY: 576, cellW: 16, cellH: 16, artW: 12, artH: 12,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 3,
      flashStartCol: 7
    },
    swift: {
      rowY: 592, cellW: 16, cellH: 16, artW: 10, artH: 10,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 3,
      flashStartCol: 7
    },
    armored: {
      rowY: 608, cellW: 16, cellH: 16, artW: 16, artH: 16,
      walkStartCol: 0, walkFrames: 4,
      hitArmorStartCol: 4, hitArmorFrames: 2,
      deathStartCol: 6, deathFrames: 3,
      flashStartCol: 9
    },
    moth: {
      rowY: 624, cellW: 16, cellH: 16, artW: 14, artH: 12,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 3,
      shadowCol: 7,
      flashStartCol: 8
    },
    burrower: {
      rowY: 576, cellW: 16, cellH: 16, artW: 14, artH: 14,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 3,
      flashStartCol: 7
    },
    volatile_pod: {
      rowY: 592, cellW: 16, cellH: 16, artW: 12, artH: 12,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 3,
      flashStartCol: 7
    },
    shaman: {
      rowY: 624, cellW: 16, cellH: 16, artW: 16, artH: 16,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 3,
      flashStartCol: 8
    },
    leaper: {
      rowY: 592, cellW: 16, cellH: 16, artW: 14, artH: 14,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 3,
      flashStartCol: 7
    },
    siege_beetle: {
      rowY: 608, cellW: 16, cellH: 16, artW: 16, artH: 16,
      walkStartCol: 0, walkFrames: 4,
      hitArmorStartCol: 4, hitArmorFrames: 2,
      deathStartCol: 6, deathFrames: 3,
      flashStartCol: 9
    },
    skeletal_husk: {
      rowY: 656, cellW: 16, cellH: 16, artW: 10, artH: 10,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 3,
      flashStartCol: 7
    },
    weaver: {
      rowY: 640, cellW: 16, cellH: 16, artW: 14, artH: 14,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 4,
      flashStartCol: 8
    },
    splitter: {
      rowY: 640, cellW: 16, cellH: 16, artW: 14, artH: 14,
      walkStartCol: 0, walkFrames: 4,
      splitStartCol: 4, splitFrames: 4,
      deathStartCol: 4, deathFrames: 4,
      flashStartCol: 8
    },
    larva: {
      rowY: 656, cellW: 16, cellH: 16, artW: 8, artH: 8,
      walkStartCol: 0, walkFrames: 4,
      deathStartCol: 4, deathFrames: 3,
      flashStartCol: 7
    },
    boss_m1: {
      rowY: 672, cellW: 32, cellH: 32, artW: 32, artH: 32,
      walkStartCol: 0, walkFrames: 6,
      phaseStartCol: 6, phaseFrames: 4,
      deathStartCol: 10, deathFrames: 4,
      flashStartCol: 14
    },
    boss_m2: {
      rowY: 704, cellW: 32, cellH: 32, artW: 32, artH: 32,
      walkStartCol: 0, walkFrames: 6,
      phaseStartCol: 6, phaseFrames: 4,
      deathStartCol: 10, deathFrames: 4,
      flashStartCol: 14,
      shadowCol: 15
    },
    boss_m3: {
      rowY: 736, cellW: 32, cellH: 32, artW: 32, artH: 32,
      walkStartCol: 0, walkFrames: 6,
      phaseStartCol: 6, phaseFrames: 4,
      deathStartCol: 10, deathFrames: 4,
      flashStartCol: 14
    }
  },
  projectiles: {
    watch_base: { x: 0, y: 768, w: 16, h: 16 },
    watch_a: { x: 16, y: 768, w: 16, h: 16 },
    watch_b: { x: 32, y: 768, w: 16, h: 16 },
    thorn_base: { x: 48, y: 768, w: 16, h: 16 },
    thorn_a: { x: 64, y: 768, w: 16, h: 16 },
    thorn_b: { x: 80, y: 768, w: 16, h: 16 },
    burst_base: { x: 96, y: 768, w: 16, h: 16 },
    burst_a: { x: 112, y: 768, w: 16, h: 16 },
    burst_b: { x: 128, y: 768, w: 16, h: 16 },
    mark_icon_0: { x: 144, y: 768, w: 16, h: 16 },
    mark_icon_1: { x: 160, y: 768, w: 16, h: 16 },
    armor_break_icon: { x: 176, y: 768, w: 16, h: 16 },
    slow_icon: { x: 192, y: 768, w: 16, h: 16 }
  },
  hazards: {
    mist_base: { x: 0, y: 784, w: 32, h: 32 },
    mist_a: { x: 32, y: 784, w: 32, h: 32 },
    mist_b: { x: 64, y: 784, w: 32, h: 32 },
    burn_0: { x: 96, y: 784, w: 32, h: 32 },
    burn_1: { x: 128, y: 784, w: 32, h: 32 },
    shockwave_0: { x: 160, y: 784, w: 32, h: 32 },
    shockwave_1: { x: 192, y: 784, w: 32, h: 32 }
  }
};

// 初始化 4 种炮塔 x 6 个升级节点的帧坐标 (16x24 美术像素)
for (let tIdx = 0; tIdx < TOWER_IDS.length; tIdx++) {
  const tId = TOWER_IDS[tIdx];
  SPRITE_ATLAS.towers[tId] = {};
  for (let nIdx = 0; nIdx < NODE_IDS.length; nIdx++) {
    const nId = NODE_IDS[nIdx];
    const rowIndex = tIdx * 6 + nIdx;
    SPRITE_ATLAS.towers[tId][nId] = {
      rowY: rowIndex * 24,
      w: 16,
      h: 24,
      idleStartCol: 0,
      idleFrames: 4,
      attackStartCol: 4,
      attackFrames: 3,
      upgradeStartCol: 7,
      upgradeFrames: 6
    };
  }
}

const UI_ATLAS = {
  path: 'images/ui_atlas.png',
  icons16: {
    spore: { x: 0, y: 0, w: 16, h: 16 },
    seed: { x: 16, y: 0, w: 16, h: 16 },
    star_full: { x: 32, y: 0, w: 16, h: 16 },
    star_empty: { x: 48, y: 0, w: 16, h: 16 },
    pause: { x: 64, y: 0, w: 16, h: 16 },
    play: { x: 80, y: 0, w: 16, h: 16 },
    speed: { x: 96, y: 0, w: 16, h: 16 },
    sfx_on: { x: 112, y: 0, w: 16, h: 16 },
    sfx_off: { x: 128, y: 0, w: 16, h: 16 },
    bgm_on: { x: 144, y: 0, w: 16, h: 16 },
    bgm_off: { x: 160, y: 0, w: 16, h: 16 },
    sell: { x: 176, y: 0, w: 16, h: 16 },
    target: { x: 192, y: 0, w: 16, h: 16 },
    lock: { x: 208, y: 0, w: 16, h: 16 },
    skull: { x: 224, y: 0, w: 16, h: 16 },
    horn: { x: 240, y: 0, w: 16, h: 16 },
    settings: { x: 192, y: 160, w: 16, h: 16 },
    upgrade: { x: 208, y: 160, w: 16, h: 16 }
  },
  icons24: {
    watch: { x: 0, y: 16, w: 24, h: 24 },
    mist: { x: 24, y: 16, w: 24, h: 24 },
    thorn: { x: 48, y: 16, w: 24, h: 24 },
    burst: { x: 72, y: 16, w: 24, h: 24 },
    branch_a: { x: 96, y: 16, w: 24, h: 24 },
    branch_b: { x: 120, y: 16, w: 24, h: 24 },
    crown: { x: 144, y: 16, w: 24, h: 24 },
    lumina: { x: 144, y: 16, w: 24, h: 24 },
    guide: { x: 168, y: 16, w: 24, h: 24 },
    atk: { x: 192, y: 16, w: 24, h: 24 },
    aspd: { x: 216, y: 16, w: 24, h: 24 }
  },
  spells: {
    rain: { x: 0, y: 192, w: 32, h: 32 },
    shock: { x: 32, y: 192, w: 32, h: 32 },
    harvest: { x: 64, y: 192, w: 32, h: 32 }
  },
  frames: {
    top_bar: { x: 0, y: 96, w: 128, h: 28 },
    tower_card: { x: 128, y: 96, w: 48, h: 64 },
    inspector_board: { x: 176, y: 96, w: 80, h: 64 },
    btn_green: { x: 0, y: 160, w: 48, h: 16 },
    btn_wood: { x: 48, y: 160, w: 48, h: 16 },
    btn_red: { x: 96, y: 160, w: 48, h: 16 },
    btn_blue: { x: 144, y: 160, w: 48, h: 16 }
  },
  logo: { x: 0, y: 48, w: 240, h: 48 },
  titleBgPath: 'images/bg_title.png'
};

const MAP_ATLAS_LAYOUT = {
  tiles16: {
    ground_0: { x: 0, y: 0, w: 16, h: 16 },
    ground_1: { x: 16, y: 0, w: 16, h: 16 },
    ground_2: { x: 32, y: 0, w: 16, h: 16 },
    ground_3: { x: 48, y: 0, w: 16, h: 16 },
    moss_0: { x: 64, y: 0, w: 16, h: 16 },
    moss_1: { x: 80, y: 0, w: 16, h: 16 },
    path_h: { x: 96, y: 0, w: 16, h: 16 },
    path_v: { x: 112, y: 0, w: 16, h: 16 },
    path_turn: { x: 128, y: 0, w: 16, h: 16 },
    obs_0: { x: 144, y: 0, w: 16, h: 16 },
    obs_1: { x: 160, y: 0, w: 16, h: 16 },
    obs_2: { x: 176, y: 0, w: 16, h: 16 },
    obs_3: { x: 192, y: 0, w: 16, h: 16 },
    warehouse: { x: 208, y: 0, w: 16, h: 16 },
    spawn: { x: 224, y: 0, w: 16, h: 16 }
  },
  warehouseLarge: { x: 0, y: 16, w: 24, h: 24 },
  spawnLarge: { x: 24, y: 16, w: 24, h: 24 },
  parallax: [
    { x: 0, y: 48, w: 320, h: 60 },
    { x: 0, y: 112, w: 320, h: 60 },
    { x: 0, y: 176, w: 320, h: 60 }
  ],
  sceneBg: { x: 0, y: 240, w: 480, h: 270 }
};

module.exports = {
  SPRITE_ATLAS,
  UI_ATLAS,
  MAP_ATLAS_LAYOUT
};

  };

  /* --- js/i18n/zh.js --- */
  __modules['js/i18n/zh'] = function(require, module, exports) {
/**
 * 中文语言包 (zh-CN)
 */

module.exports = {
  // 灵光菇新体系
  tower_lumina_name: '灵光菇',
  tower_lumina_role: '辅助 · 增益 · 产能',
  tower_lumina_desc: '释放灵光光环，为菌丝邻塔提供伤害加成，并定期凝聚高额黄金孢子。',
  lumina_base_desc: '基础增益：菌丝邻塔增伤+15%，每7秒产出20孢子。',
  lumina_lv1_name: '荧光金露伞',
  lumina_lv1_desc: '伞盖生金：邻塔增伤+20%，每6.5秒产出30孢子。',
  lumina_a2_name: '甲线: 灵光信标',
  lumina_a2_desc: '战地信标：邻塔攻速+25%，每5秒为受损单位疗愈25点生命。',
  lumina_a3_name: '甲线: 神圣圣所',
  lumina_a3_desc: '神圣领域：邻塔攻速+35%，脉冲群疗，使邻塔免疫蛛网与酸蚀！',
  lumina_b2_name: '乙线: 黄金松露伞',
  lumina_b2_desc: '极致贪婪：每5.5秒产出55孢子，提升金币掉落率。',
  lumina_b3_name: '乙线: 聚宝金蕈皇',
  lumina_b3_desc: '招财进宝：每5秒产出90孢子，范围内敌军死亡额外掉落孢子，战利品翻倍！',

  // 新敌人群落体系
  enemy_burrower_name: '掘地潜行蝎',
  enemy_burrower_type: '潜行 · 遁地突袭',
  enemy_burrower_tip: '在地下遁行免疫远程狙击，唯有菇精卫的木盾或迫击炮地震方可将其震出地面！',
  enemy_volatile_pod_name: '烈性酸蚀蝉',
  enemy_volatile_pod_type: '突击 · 死亡自爆',
  enemy_volatile_pod_tip: '死亡或冲撞防御塔时剧烈自爆，溅射酸液重创小卫士并腐蚀防御塔！优先狙杀！',
  enemy_shaman_name: '幽林菌巫',
  enemy_shaman_type: '辅助 · 范围治疗 · 亡者复苏',
  enemy_shaman_tip: '吟唱绿光治疗临近甲虫，并能将阵亡怪群复生为枯骨虫骸！极高优先威胁！',
  enemy_skeletal_name: '枯骨虫骸',
  enemy_skeletal_type: '复生 · 亡灵残骸',
  enemy_skeletal_tip: '被菌巫复生的亡灵甲虫，虽脆弱但数量众多。',

  banner_elder_roots: '【古树觉醒】千年古根守护！',
  banner_spore_frenzy: '【破军狂潮】林地全员暴风爆发！',
  banner_enraged_wave: '【贪婪激怒】怪群狂暴 · 战利品翻倍！',

  // 新版深度战术特性与敌人
  enemy_weaver_name: '幽林织网蛛',
  enemy_weaver_type: '特种·吐丝封塔',
  enemy_weaver_tip: '远程向防御塔喷吐粘液蛛丝使其瘫痪，需玩家快速连续点击破茧救援！',

  synergy_twin_watch: '双哨连协: 暴击+20% & 破空穿透',
  synergy_toxic_burst: '剧毒爆轰: 毒素引爆 范围+40%',
  synergy_poison_thorn: '荆棘毒刺: 贯穿附毒',
  synergy_grand_resonance: '林地全域大共振: 攻速+15% 射程+10%',

  sporeling_title: '菇精卫哨兵',
  sporeling_rally_hint: '点击道路派遣菇精卫接怪拦截',
  sporeling_call_btn: '菇精卫',

  banner_boss_web: '【巨蝎咆哮】蛛丝锁林！',
  banner_boss_frenzy: '【绝境暴走】树心狂暴！',

  game_title: '蘑菇守林',
  game_subtitle: 'SPOREGUARD',
  btn_start: '开始守林',
  btn_level_select: '选择林区',
  btn_settings: '系统设置',
  btn_guide: '作战指南',
  btn_back: '返回',
  btn_resume: '继续战斗',
  btn_restart: '重新挑战',
  btn_exit_title: '退回标题',
  btn_next_map: '下一林区',
  btn_call_wave: '提前召唤',
  btn_upgrade_lv1: '升级 Lv1',
  btn_branch_a: '分支 A',
  btn_branch_b: '分支 B',
  btn_sell: '出售',
  btn_priority: '索敌',
  btn_pause: '暂停',
  btn_speed: '倍速',

  // 状态与提示
  state_prep: '备战阶段',
  state_combat: '虫潮来袭',
  state_paused: '游戏已暂停',
  state_victory: '守林成功！',
  state_defeat: '种子仓库失守',
  prep_countdown: '下波倒计时',
  early_bonus_tip: '提前召唤奖励 +{0}',
  wave_label: '波次',
  spores_label: '孢子',
  seeds_label: '种子',
  next_wave_preview: '下波虫群预告',
  cover_tiles_label: '射程覆盖路程：{0} 格',
  place_hint_valid: '点击再次确认建造（覆盖 {0} 格路线）',
  place_hint_invalid: '仅可在草地或苔地格建造炮塔',
  no_spores_hint: '孢子不足！',
  max_level_label: '已达最高形态',
  branch_locked_label: '另一分支已锁定',
  sell_refund_label: '返还 +{0}',

  // 横幅反馈
  banner_chain: '连锁！',
  banner_overload: '超载！',
  banner_wave_clear: '波次清空！',
  banner_flawless: '无损守卫 +10',
  banner_boss_incoming: '首领降临！',
  banner_boss_phase2: '首领狂化·二阶段',
  banner_boss_phase3: '首领觉醒·三阶段',

  // 索敌优先级
  prio_first: '最前',
  prio_nearest: '最近',
  prio_highest_hp: '血量最高',
  prio_densest: '最密集',

  // 地图名称与描述
  map1_name: '地图 1：晨雾林地',
  map1_subtitle: '青绿晨雾 · 10 波',
  map1_desc: '蜿蜒的林间小径，适合在转角布置尖刺菇，中央洼地使用雾菇与爆裂菇联防。',
  map2_name: '地图 2：苔藓溪谷',
  map2_subtitle: '湿润溪流 · 12 波',
  map2_desc: '双回环溪谷地形，空中航线横跨溪面，需提前部署瞭望菇防空。',
  map3_name: '地图 3：夜光蕈林',
  map3_subtitle: '荧光暗夜 · 15 波',
  map3_desc: '三层平行长廊，随波次推进夜光增强。考验四种蘑菇的终极协同。',
  map_locked: '通关上一林区解锁',
  best_stars: '最高星级',
  best_time: '最短用时',
  best_seeds: '最高剩余种子',
  record_none: '暂无记录',

  // 炮塔名称与说明
  tower_watch_name: '瞭望菇',
  tower_watch_role: '远程 · 对空',
  tower_watch_desc: '高耸菌塔，唯一主力远程防空火力，预判射击地面与空中目标。',
  node_base: '基础形态',
  watch_base_desc: '单体远程射击，兼顾地面与空中',
  watch_lv1_name: 'Lv1 荧光孢囊',
  watch_lv1_desc: '菌盖生花，伤害+20%，射程+0.5格',
  watch_a2_name: 'A2 远镜柄',
  watch_a2_desc: '双镜片加长柄，射程+1.5，弹速+25%，间隔-10%',
  watch_a3_name: 'A3 星镜',
  watch_a3_desc: '射程+1.0；命中标记目标3秒，受直接伤害+15%',
  watch_b2_name: 'B2 厚冠护板',
  watch_b2_desc: '环形护板加厚菌盖，伤害+35%',
  watch_b3_name: 'B3 炮口共鸣',
  watch_b3_desc: '菌盖化为炮口，获得15%暴击率（2倍暴击伤害）',

  tower_mist_name: '雾菇',
  tower_mist_role: '控制 · 持续伤害',
  tower_mist_desc: '在敌人最密集处释放孢子雾团，减速并持续腐蚀地面与空中虫群。',
  mist_base_desc: '生成半径1.5格雾团，减速30%，每秒4点伤害',
  mist_lv1_name: 'Lv1 荧光孢囊',
  mist_lv1_desc: '雾丝变密，减速+5%，雾团持续+0.5秒',
  mist_a2_name: 'A2 冷雾丝',
  mist_a2_desc: '细环冷雾，减速+10%，离雾后减速残留1秒',
  mist_a3_name: 'A3 冷蓝光圈',
  mist_a3_desc: '减速达55%，雾团内敌人护甲-2',
  mist_b2_name: 'B2 宽菌伞',
  mist_b2_desc: '雾团半径+0.5格，持续伤害+2/秒',
  mist_b3_name: 'B3 橙色雾团',
  mist_b3_desc: '雾团半径2.5格，高温燃烧每秒10点伤害',

  tower_thorn_name: '尖刺菇',
  tower_thorn_role: '直线群穿',
  tower_thorn_desc: '高频发射穿透尖刺，沿着长直路径放置可一穿多敌。仅攻击地面。',
  thorn_base_desc: '高速直线尖刺，可穿透2个地面目标',
  thorn_lv1_name: 'Lv1 荧光孢囊',
  thorn_lv1_desc: '长出3根短刺，伤害+20%，射程+0.5格',
  thorn_a2_name: 'A2 长刺',
  thorn_a2_desc: '青蓝长刺，穿透目标数+2（共4个）',
  thorn_a3_name: 'A3 箭袋',
  thorn_a3_desc: '穿透7个目标，每次齐射增发2根12°侧刺（50%伤害）',
  thorn_b2_name: 'B2 厚刺根',
  thorn_b2_desc: '橙黄粗刺根，单发伤害+30%',
  thorn_b3_name: 'B3 锯齿刺',
  thorn_b3_desc: '攻速+10%，每穿透1个目标后续伤害+20%（最高+100%）',

  tower_burst_name: '爆裂菇',
  tower_burst_role: '范围清群',
  tower_burst_desc: '锁定密集地面虫群投射孢子重炮，全额范围溅射无衰减。仅攻击地面。',
  burst_base_desc: '锁定落点爆炸，1.25格内完整溅射伤害',
  burst_lv1_name: 'Lv1 荧光孢囊',
  burst_lv1_desc: '菌盖裂纹透光，伤害+20%',
  burst_a2_name: 'A2 扩口',
  burst_a2_desc: '青蓝裂口扩大，溅射半径+0.5格（1.75格）',
  burst_a3_name: 'A3 大口径',
  burst_a3_desc: '大口径开裂，溅射半径2.25格，伤害+15%',
  burst_b2_name: 'B2 熔炉菌盖',
  burst_b2_desc: '菌盖冒热烟，爆炸伤害+30%',
  burst_b3_name: 'B3 熔金',
  burst_b3_desc: '爆心留下1.0格熔金灼烧区3秒，每秒8点伤害',

  // 敌人名称与特性
  enemy_beetle_name: '小甲虫',
  enemy_type_basic: '基础',
  enemy_beetle_tip: '沿地面匀速前进，所有炮塔均可应对。',
  enemy_swift_name: '疾蛾',
  enemy_type_fast: '快速',
  enemy_swift_tip: '移速极快但生命较低，配合雾菇减速群清。',
  enemy_armored_name: '甲壳虫',
  enemy_type_armored: '重甲',
  enemy_armored_tip: '护甲4且减速减半，宜用高单发瞭望菇或爆裂菇B线加上破甲应对。',
  enemy_moth_name: '飞蛾',
  enemy_type_flying: '飞行',
  enemy_moth_tip: '沿空中捷径飞行，只有瞭望菇与雾菇能攻击。',
  enemy_splitter_name: '裂殖虫',
  enemy_type_splitter: '分裂',
  enemy_splitter_tip: '死亡时分裂出2只幼体继续前进，宜用爆裂菇清群。',
  enemy_larva_name: '幼体',
  enemy_type_larva: '分裂体',
  enemy_larva_tip: '裂殖虫分裂产物，体型小移速快。',
  enemy_boss_m1_name: '蛀王',
  enemy_boss_m1_tip: '66%生命召唤小甲虫；33%生命移速+30%且护甲升至8。',
  enemy_boss_m2_name: '蛾后',
  enemy_boss_m2_tip: '空中首领！66%生命释放飞蛾；33%生命免疫减速。',
  enemy_boss_m3_name: '裂殖母体',
  enemy_boss_m3_tip: '66%生命分裂幼体；死亡时分裂为3只裂殖虫！',
  enemy_type_boss: '首领',

  // 设置与引导
  settings_title: '系统设置',
  settings_sfx: '音效开关',
  settings_bgm: '音乐开关',
  settings_lang: '界面语言',
  lang_zh: '简体中文',
  lang_en: 'English',
  on: '开启',
  off: '关闭',

  guide_step1_title: '欢迎来到《蘑菇守林》！',
  guide_step1_body: '虫群正沿路径奔向后方的【种子仓库】。在草地或发光【苔地】上点击即可种植蘑菇炮塔，预览圈会显示射程覆盖路程格数。',
  guide_step2_title: '四类蘑菇 · 双线进化',
  guide_step2_body: '瞭望菇防空远程、雾菇减速破甲、尖刺菇直线群穿、爆裂菇范围轰炸。升至 Lv1 后可选择青蓝【A线】或橙黄【B线】特化！',
  guide_step3_title: '群杀奖励与失误补救',
  guide_step3_body: '0.5秒内成群击杀3只以上敌人可获额外孢子与爽快连锁！建错位置随时可【出售】返还 60% 投入。支持触屏、键鼠(WASD/1-4)与手柄操作！',
  guide_next: '下一步',
  guide_done: '开始战斗'
,
  enemy_leaper_name: '疾风飞跃蝗',
  enemy_leaper_type: '跳跃突袭 · 越过防线',
  enemy_leaper_tip: '靠近守卫时猛烈起跳飞跃越过阻挡，腾空期间可被防空瞭望菇暴击狙杀',
  enemy_siege_beetle_name: '铁壁攻城巨兜',
  enemy_siege_beetle_type: '正面坚盾 · 掩护推进',
  enemy_siege_beetle_tip: '正面巨型骨盾减免75%弹丸伤害，需用尖刺穿透破甲或侧翼包抄',
};
  };

  /* --- js/i18n/en.js --- */
  __modules['js/i18n/en'] = function(require, module, exports) {
/**
 * English Language Pack (en-US)
 */

module.exports = {
  // Lumina tower
  tower_lumina_name: 'Lumina Spore',
  tower_lumina_role: 'Support · Buff · Econ',
  tower_lumina_desc: 'Emits a golden aura buffing connected neighbors and periodically harvesting spores.',
  lumina_base_desc: 'Base Buff: Connected neighbors +15% damage, generates 20 spores every 7s.',
  lumina_lv1_name: 'Gilded Truffle',
  lumina_lv1_desc: 'Gilded Cap: Neighbors +20% damage, generates 30 spores every 6.5s.',
  lumina_a2_name: 'Branch A: Aura of Vigor',
  lumina_a2_desc: 'Beacon of Light: Neighbors +25% attack speed, heals nearby wounded units every 5s.',
  lumina_a3_name: 'Branch A: Holy Ward',
  lumina_a3_desc: 'Sacred Domain: Neighbors +35% attack speed, heals and wards against webs and acid!',
  lumina_b2_name: 'Branch B: Golden Bloom',
  lumina_b2_desc: 'Pure Greed: Generates 55 spores every 5.5s.',
  lumina_b3_name: 'Branch B: Cornucopia Titan',
  lumina_b3_desc: 'Grand Wealth: Generates 90 spores every 5s, doubles enemy loot drops!',

  // Enemy faction
  enemy_burrower_name: 'Duneler Scorp',
  enemy_burrower_type: 'Stealth · Ambush',
  enemy_burrower_tip: 'Burrows underground immune to bullets. Sporeling guards or mortars unearth it!',
  enemy_volatile_pod_name: 'Acid Blister Pod',
  enemy_volatile_pod_type: 'Assault · Self-Destruct',
  enemy_volatile_pod_tip: 'Explodes into acidic slime upon death or impact. Prioritize with snipers!',
  enemy_shaman_name: 'Spore Shaman',
  enemy_shaman_type: 'Support · Healer · Necromancer',
  enemy_shaman_tip: 'Heals adjacent bugs and resurrects fallen foes into skeletal husks! Extreme threat!',
  enemy_skeletal_name: 'Skeletal Husk',
  enemy_skeletal_type: 'Reanimated Husk',
  enemy_skeletal_tip: 'Fragile reanimated skeletal insect raised by the Shaman.',

  banner_elder_roots: 'Ancient Roots Awaken!',
  banner_spore_frenzy: 'Spore Frenzy!',
  banner_enraged_wave: 'Enraged Wave: 2x Rewards!',

  // Deep gameplay mechanics
  enemy_weaver_name: 'Forest Weaver',
  enemy_weaver_type: 'Specialist · Web',
  enemy_weaver_tip: 'Shoots webs to entangle and paralyze towers. Rapidly tap to rescue!',

  synergy_twin_watch: 'Twin Watch: +20% Crit & Anti-Air',
  synergy_toxic_burst: 'Toxic Detonation: AoE +40%',
  synergy_poison_thorn: 'Poison Bramble: Piercing Toxin',
  synergy_grand_resonance: 'Grand Resonance: Aspd +15% Range +10%',

  sporeling_title: 'Sporeling Guard',
  sporeling_rally_hint: 'Click path to deploy guards for melee block',
  sporeling_call_btn: 'Guards',

  banner_boss_web: 'Web Barrage!',
  banner_boss_frenzy: 'Tree Heart Frenzy!',

  game_title: 'SPOREGUARD',
  game_subtitle: 'MUSHROOM FOREST DEFENSE',
  btn_start: 'START GAME',
  btn_level_select: 'SELECT MAP',
  btn_settings: 'SETTINGS',
  btn_guide: 'HOW TO PLAY',
  btn_back: 'BACK',
  btn_resume: 'RESUME',
  btn_restart: 'RESTART',
  btn_exit_title: 'MAIN MENU',
  btn_next_map: 'NEXT MAP',
  btn_call_wave: 'CALL WAVE',
  btn_upgrade_lv1: 'UPGRADE Lv1',
  btn_branch_a: 'BRANCH A',
  btn_branch_b: 'BRANCH B',
  btn_sell: 'SELL',
  btn_priority: 'TARGET',
  btn_pause: 'PAUSE',
  btn_speed: 'SPEED',

  // States & Hints
  state_prep: 'PREP PHASE',
  state_combat: 'SWARM INCOMING',
  state_paused: 'GAME PAUSED',
  state_victory: 'FOREST DEFENDED!',
  state_defeat: 'SEED VAULT BREACHED',
  prep_countdown: 'Next Wave In',
  early_bonus_tip: 'Early Bonus +{0}',
  wave_label: 'WAVE',
  spores_label: 'SPORES',
  seeds_label: 'SEEDS',
  next_wave_preview: 'NEXT WAVE SWARM',
  cover_tiles_label: 'Path Coverage: {0} tiles',
  place_hint_valid: 'Tap again to build ({0} tiles covered)',
  place_hint_invalid: 'Build only on grass or moss tiles',
  no_spores_hint: 'Not enough Spores!',
  max_level_label: 'MAX FORM REACHED',
  branch_locked_label: 'Other branch locked',
  sell_refund_label: 'Refund +{0}',

  // Banners
  banner_chain: 'Chain!',
  banner_overload: 'Overload!',
  banner_wave_clear: 'Wave Cleared!',
  banner_flawless: 'Flawless +10',
  banner_boss_incoming: 'BOSS INCOMING!',
  banner_boss_phase2: 'BOSS PHASE II',
  banner_boss_phase3: 'BOSS PHASE III',

  // Target Priority
  prio_first: 'First',
  prio_nearest: 'Nearest',
  prio_highest_hp: 'High HP',
  prio_densest: 'Densest',

  // Maps
  map1_name: 'Map 1: Morning Mist Woods',
  map1_subtitle: 'Verdant Mist · 10 Waves',
  map1_desc: 'Winding forest path. Place Thorn Shrooms on long straights and Mist + Burst in central bends.',
  map2_name: 'Map 2: Mossy Creek Valley',
  map2_subtitle: 'Wet Stream · 12 Waves',
  map2_desc: 'Twin canyon loops with air routes cutting across the creek. Deploy Watch Shrooms for air cover.',
  map3_name: 'Map 3: Nightglow Fungi',
  map3_subtitle: 'Bioluminescent Night · 15 Waves',
  map3_desc: 'Three parallel corridors where bioluminescence brightens each wave. Ultimate synergy test.',
  map_locked: 'Clear previous map to unlock',
  best_stars: 'Best Stars',
  best_time: 'Best Time',
  best_seeds: 'Best Seeds',
  record_none: 'No Record',

  // Towers
  tower_watch_name: 'Watch Shroom',
  tower_watch_role: 'Long-Range · Anti-Air',
  tower_watch_desc: 'Tall sniper mushroom hitting both ground and air targets with predictive shots.',
  node_base: 'Base Form',
  watch_base_desc: 'Single-target ranged shot, hits ground & air',
  watch_lv1_name: 'Lv1 Neon Spore Sac',
  watch_lv1_desc: 'Blooming cap, DMG +20%, Range +0.5',
  watch_a2_name: 'A2 Tele-Stalk',
  watch_a2_desc: 'Twin lenses, Range +1.5, Bullet Spd +25%, CD -10%',
  watch_a3_name: 'A3 Star Lens',
  watch_a3_desc: 'Range +1.0; Marks target for 3s (+15% direct DMG)',
  watch_b2_name: 'B2 Heavy Crown',
  watch_b2_desc: 'Armored cap plates, DMG +35%',
  watch_b3_name: 'B3 Cannon Resonance',
  watch_b3_desc: 'Muzzle cap, 15% Crit Chance (2x Crit DMG)',

  tower_mist_name: 'Mist Shroom',
  tower_mist_role: 'Control · DoT',
  tower_mist_desc: 'Casts spore mist at the densest enemy cluster, slowing and corroding ground & air foes.',
  mist_base_desc: '1.5-tile mist for 3s, 30% Slow, 4 DPS',
  mist_lv1_name: 'Lv1 Neon Spore Sac',
  mist_lv1_desc: 'Denser mist threads, Slow +5%, Duration +0.5s',
  mist_a2_name: 'A2 Frost Silk',
  mist_a2_desc: 'Slow +10%, slow lingers 1.0s after leaving mist',
  mist_a3_name: 'A3 Cryo Halo',
  mist_a3_desc: '55% Slow, enemies inside mist lose 2 Armor',
  mist_b2_name: 'B2 Wide Umbrella',
  mist_b2_desc: 'Mist radius +0.5 tiles, DoT +2 DPS',
  mist_b3_name: 'B3 Blazing Mist',
  mist_b3_desc: '2.5-tile burning mist dealing 10 DPS',

  tower_thorn_name: 'Thorn Shroom',
  tower_thorn_role: 'Line Pierce',
  tower_thorn_desc: 'Rapidly fires straight piercing spikes along corridors. Ground targets only.',
  thorn_base_desc: 'Fast linear spike piercing 2 ground foes',
  thorn_lv1_name: 'Lv1 Neon Spore Sac',
  thorn_lv1_desc: '3 short thorns, DMG +20%, Range +0.5',
  thorn_a2_name: 'A2 Long Thorns',
  thorn_a2_desc: 'Cyan tips, Pierce +2 (4 targets total)',
  thorn_a3_name: 'A3 Quiver Volley',
  thorn_a3_desc: 'Pierce 7; fires 2 extra side spikes at ±12° (50% DMG)',
  thorn_b2_name: 'B2 Thick Roots',
  thorn_b2_desc: 'Heavy orange roots, DMG +30%',
  thorn_b3_name: 'B3 Serrated Spikes',
  thorn_b3_desc: 'CD -10%, +20% DMG per pierced foe (up to +100%)',

  tower_burst_name: 'Burst Shroom',
  tower_burst_role: 'AoE Splash',
  tower_burst_desc: 'Lobs heavy shells at the densest ground cluster for 100% splash damage. Ground only.',
  burst_base_desc: 'Locks landing spot, 1.25-tile full splash DMG',
  burst_lv1_name: 'Lv1 Neon Spore Sac',
  burst_lv1_desc: 'Glowing cap cracks, DMG +20%',
  burst_a2_name: 'A2 Wide Bore',
  burst_a2_desc: 'Cyan vent, Splash Radius +0.5 (1.75 tiles)',
  burst_a3_name: 'A3 Heavy Caliber',
  burst_a3_desc: 'Splash Radius 2.25 tiles, DMG +15%',
  burst_b2_name: 'B2 Furnace Cap',
  burst_b2_desc: 'Smoking cap, DMG +30%',
  burst_b3_name: 'B3 Molten Gold',
  burst_b3_desc: 'Leaves 1.0-tile burn zone for 3s dealing 8 DPS',

  // Enemies
  enemy_beetle_name: 'Beetle',
  enemy_type_basic: 'Basic',
  enemy_beetle_tip: 'Marches steadily on the ground.',
  enemy_swift_name: 'Swift Moth',
  enemy_type_fast: 'Fast',
  enemy_swift_tip: 'Double speed, low HP. Slow with Mist and splash down.',
  enemy_armored_name: 'Carapace Bug',
  enemy_type_armored: 'Armored',
  enemy_armored_tip: '4 Armor, 50% slow resist. Counter with heavy shots or Mist A3.',
  enemy_moth_name: 'Sky Moth',
  enemy_type_flying: 'Flying',
  enemy_moth_tip: 'Takes air shortcuts. Only Watch & Mist Shrooms can hit it.',
  enemy_splitter_name: 'Splitter Bug',
  enemy_type_splitter: 'Splitter',
  enemy_splitter_tip: 'Splits into 2 Larvae on death. Bring AoE splash.',
  enemy_larva_name: 'Larva',
  enemy_type_larva: 'Spawn',
  enemy_larva_tip: 'Spawned from Splitter Bug, fast and small.',
  enemy_boss_m1_name: 'Borer King',
  enemy_boss_m1_tip: '66% HP: summons Beetles; 33% HP: +30% speed & 8 Armor.',
  enemy_boss_m2_name: 'Moth Queen',
  enemy_boss_m2_tip: 'Flying Boss! 66% HP: spawns Moths; 33% HP: Slow Immune.',
  enemy_boss_m3_name: 'Brood Matrix',
  enemy_boss_m3_tip: '66% HP: spawns Larvae; splits into 3 Splitters on death!',
  enemy_type_boss: 'Boss',

  // Settings & Guide
  settings_title: 'SETTINGS',
  settings_sfx: 'Sound Effects',
  settings_bgm: 'Music',
  settings_lang: 'Language',
  lang_zh: '简体中文',
  lang_en: 'English',
  on: 'ON',
  off: 'OFF',

  guide_step1_title: 'Welcome to Sporeguard!',
  guide_step1_body: 'Swarms are marching toward your Seed Vault! Tap any grass or glowing Moss tile to preview range & covered path tiles, then tap again to plant.',
  guide_step2_title: '4 Towers · Dual Evolution',
  guide_step2_body: 'Watch (Anti-Air), Mist (Slow/Shred), Thorn (Line Pierce), Burst (AoE). Upgrade to Lv1, then specialize into Cyan Branch A or Orange Branch B!',
  guide_step3_title: 'Multi-Kill & 60% Refund',
  guide_step3_body: 'Kill 3+ foes within 0.5s for Chain/Overload bonuses! Sell any tower anytime for a 60% Spore refund. Touch, Mouse/KB & Gamepad supported!',
  guide_next: 'NEXT',
  guide_done: 'LET\'S GO'
,
  enemy_leaper_name: 'Gale Locust Leaper',
  enemy_leaper_type: 'Vaulting Assassin',
  enemy_leaper_tip: 'Performs a giant leap over blocking guards; vulnerable to anti-air while airborne.',
  enemy_siege_beetle_name: 'Ironclad Siege Beetle',
  enemy_siege_beetle_type: 'Frontal Shield Phalanx',
  enemy_siege_beetle_tip: 'Frontal pavise shield resists 75% projectile damage; flank or use armor pierce.',
};
  };

  /* --- js/i18n/index.js --- */
  __modules['js/i18n/index'] = function(require, module, exports) {
/**
 * 国际化 (i18n) 管理器
 */

const zh = require('./zh');
const en = require('./en');

const PACKS = { zh, en };
let currentLang = 'zh';

function setLang(lang) {
  if (PACKS[lang]) {
    currentLang = lang;
  }
}

function getLang() {
  return currentLang;
}

function toggleLang() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  return currentLang;
}

function t(key, ...args) {
  const pack = PACKS[currentLang] || PACKS.zh;
  let str = pack[key] !== undefined ? pack[key] : (PACKS.zh[key] || key);
  for (let i = 0; i < args.length; i++) {
    str = str.replace('{' + i + '}', String(args[i]));
  }
  return str;
}

module.exports = {
  setLang,
  getLang,
  toggleLang,
  t
};

  };

  /* --- js/core/platform.js --- */
  __modules['js/core/platform'] = function(require, module, exports) {
/**
 * 平台适配层 (Platform Adapter)
 * 统一封装画布、输入事件、微信存储接口、分包加载、前后台生命周期与音频系统
 * 游戏逻辑层严禁直接访问宿主环境接口
 */

const CONFIG = require('../data/config');

const g = typeof GameGlobal !== 'undefined' ? GameGlobal : (typeof globalThis !== 'undefined' ? globalThis : window);
const isWeChat = typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function' && !g.__IS_BROWSER_SHIM__;

let mainCanvas = null;
let mainCtx = null;
let viewport = {
  screenWidth: 960,
  screenHeight: 540,
  dpr: 1,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  drawCalls: 0
};

// 首次用户交互后才允许初始化音频
let audioUnlocked = false;
let sfxEnabled = true;
let bgmEnabled = true;
let currentBgmKey = null;
let pendingBgmKey = null;
let bgmContexts = {};
let sfxPool = {};
let webAudioCtx = null;

// 图片缓存与已加载分包记录
const imageCache = {};
const loadedSubpackages = { main: true };

// 内存后备存储（当宿主环境存储不可用时）
const memoryStore = {};

let sfxVoicePool = {};
let sfxVoiceIndices = {};
let audioBuffers = {};

const AUDIO_PATHS = {
  bgm_title: 'audio/bgm_title.wav',
  bgm_battle: 'audio/bgm_battle.wav',
  boss_map1: 'subpackages/map1/boss.wav',
  boss_map2: 'subpackages/map2/boss.wav',
  boss_map3: 'subpackages/map3/boss.wav',
  sfx_click: 'audio/sfx_click.wav',
  sfx_build: 'audio/sfx_build.wav',
  sfx_upgrade: 'audio/sfx_upgrade.wav',
  sfx_sell: 'audio/sfx_sell.wav',
  sfx_shoot: 'audio/sfx_shoot.wav',
  sfx_mist: 'audio/sfx_mist.wav',
  sfx_thorn: 'audio/sfx_thorn.wav',
  sfx_boom: 'audio/sfx_boom.wav',
  sfx_multikill: 'audio/sfx_multikill.wav',
  sfx_hurt: 'audio/sfx_hurt.wav',
  sfx_win: 'audio/sfx_win.wav',
  sfx_lose: 'audio/sfx_lose.wav',
  sfx_coin: 'audio/sfx_coin.wav',
  sfx_horn: 'audio/sfx_horn.wav',
  sfx_thunder: 'audio/sfx_thunder.wav',
  sfx_hit: 'audio/sfx_hit.wav',
  sfx_bomb: 'audio/sfx_bomb.wav',
  sfx_shock: 'audio/sfx_shock.wav',
  sfx_laser: 'audio/sfx_laser.wav',
  sfx_place: 'audio/sfx_place.wav'
};

const SFX_VOLUMES = {
  sfx_click: 0.40,
  sfx_build: 0.65,
  sfx_upgrade: 0.70,
  sfx_sell: 0.55,
  sfx_shoot: 0.45,
  sfx_mist: 0.50,
  sfx_thorn: 0.55,
  sfx_boom: 0.75,
  sfx_multikill: 0.80,
  sfx_hurt: 0.60,
  sfx_win: 0.85,
  sfx_lose: 0.80,
  sfx_coin: 0.65,
  sfx_horn: 0.80,
  sfx_thunder: 0.85,
  sfx_hit: 0.60,
  sfx_bomb: 0.75,
  sfx_shock: 0.70,
  sfx_laser: 0.60,
  sfx_place: 0.65
};

/**
 * 初始化主画布并计算 16:9 等比缩放黑边视口
 */
function initCanvas() {
  if (typeof wx !== 'undefined' && typeof wx.createCanvas === 'function') {
    mainCanvas = wx.createCanvas();
  } else if (g.__BROWSER_CANVAS__) {
    mainCanvas = g.__BROWSER_CANVAS__;
  }

  mainCtx = mainCanvas.getContext('2d');
  updateViewport();

  if (typeof wx !== 'undefined' && typeof wx.onWindowResize === 'function') {
    wx.onWindowResize(() => {
      updateViewport();
    });
  }

  return {
    canvas: mainCanvas,
    ctx: mainCtx,
    viewport
  };
}

/**
 * 创建离屏画布（微信：第二次及之后调用 wx.createCanvas 返回离屏画布）
 */
function createOffscreenCanvas(w, h) {
  try {
    if (typeof wx !== 'undefined' && typeof wx.createCanvas === 'function') {
      const c = wx.createCanvas();
      if (c && c !== mainCanvas) {
        c.width = w;
        c.height = h;
        return c;
      }
    }
  } catch (e) {}
  return null;
}

/**
 * 计算 960x540 逻辑分辨率到物理屏幕的等比缩放及黑边偏移
 */
function updateViewport() {
  let sw = CONFIG.RESOLUTION.LOGICAL_WIDTH;
  let sh = CONFIG.RESOLUTION.LOGICAL_HEIGHT;
  let dpr = 1;

  if (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') {
    const info = wx.getSystemInfoSync();
    sw = info.windowWidth || sw;
    sh = info.windowHeight || sh;
    dpr = Math.min(info.pixelRatio || (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1, 3);
  }

  viewport.screenWidth = sw;
  viewport.screenHeight = sh;
  viewport.dpr = dpr;

  const targetW = CONFIG.RESOLUTION.LOGICAL_WIDTH;
  const targetH = CONFIG.RESOLUTION.LOGICAL_HEIGHT;
  const scale = Math.min(sw / targetW, sh / targetH);

  viewport.scale = scale;
  viewport.offsetX = Math.floor((sw - targetW * scale) * 0.5);
  viewport.offsetY = Math.floor((sh - targetH * scale) * 0.5);

  if (mainCanvas) {
    mainCanvas.width = Math.round(sw * dpr);
    mainCanvas.height = Math.round(sh * dpr);
  }
  if (mainCtx) {
    mainCtx.imageSmoothingEnabled = true;
    mainCtx.imageSmoothingQuality = 'high';
  }
}

/**
 * 将屏幕坐标转换为 960x540 逻辑坐标
 */
function screenToLogical(clientX, clientY) {
  const lx = (clientX - viewport.offsetX) / viewport.scale;
  const ly = (clientY - viewport.offsetY) / viewport.scale;
  return {
    x: lx,
    y: ly,
    inBounds: lx >= 0 && lx <= CONFIG.RESOLUTION.LOGICAL_WIDTH && ly >= 0 && ly <= CONFIG.RESOLUTION.LOGICAL_HEIGHT
  };
}

/**
 * 开始一帧绘制：清空黑边区域并应用逻辑坐标系变换
 */
function beginFrame() {
  viewport.drawCalls = 0;
  if (!mainCtx) return;

  const dpr = viewport.dpr;
  mainCtx.setTransform(1, 0, 0, 1, 0, 0);
  mainCtx.imageSmoothingEnabled = true;
  mainCtx.fillStyle = '#09120F';
  mainCtx.imageSmoothingQuality = 'high';
  mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

  mainCtx.save();
  mainCtx.translate(viewport.offsetX * dpr, viewport.offsetY * dpr);
  mainCtx.scale(viewport.scale * dpr, viewport.scale * dpr);

  // 裁剪到 960x540 逻辑画面区域
  mainCtx.beginPath();
  mainCtx.rect(0, 0, CONFIG.RESOLUTION.LOGICAL_WIDTH, CONFIG.RESOLUTION.LOGICAL_HEIGHT);
  mainCtx.clip();
  mainCtx.imageSmoothingEnabled = true;
}

/**
 * 结束一帧绘制
 */
function endFrame() {
  if (!mainCtx) return;
  mainCtx.restore();
}

function recordDrawCall(count) {
  viewport.drawCalls += (count || 1);
}

/**
 * 图片资源加载（支持透明 PNG 图集）
 */
function loadImage(path) {
  if (imageCache[path]) {
    return Promise.resolve(imageCache[path]);
  }
  return new Promise((resolve) => {
    let img = null;
    if (typeof wx !== 'undefined' && typeof wx.createImage === 'function') {
      img = wx.createImage();
    } else if (typeof Image !== 'undefined') {
      img = new Image();
    }
    if (!img) {
      resolve(null);
      return;
    }
    img.onload = () => {
      imageCache[path] = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = path;
  });
}

function getImage(path) {
  if (imageCache[path]) {
    return imageCache[path];
  }
  if (path && typeof path === 'string') {
    loadImage(path);
  }
  return imageCache[path] || null;
}

/**
 * 分包加载适配（微信分包 wx.loadSubpackage，浏览器直接加载对应分包图集）
 */
function loadMapSubpackage(mapId, atlasPath) {
  if (loadedSubpackages[mapId] && getImage(atlasPath)) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    if (isWeChat && typeof wx !== 'undefined' && typeof wx.loadSubpackage === 'function') {
      const task = wx.loadSubpackage({
        name: mapId,
        success: () => {
          loadedSubpackages[mapId] = true;
          loadImage(atlasPath).then(() => resolve(true));
        },
        fail: () => {
          loadedSubpackages[mapId] = true;
          loadImage(atlasPath).then(() => resolve(true));
        }
      });
      if (!task) {
        loadedSubpackages[mapId] = true;
        loadImage(atlasPath).then(() => resolve(true));
      }
    } else {
      loadedSubpackages[mapId] = true;
      loadImage(atlasPath).then(() => resolve(true));
    }
  });
}

/**
 * 存储接口：仅使用微信本地存储接口 wx.getStorageSync / wx.setStorageSync
 * 严禁使用 localStorage 与 IndexedDB
 */
function getStorage(key) {
  try {
    if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') {
      const val = wx.getStorageSync(key);
      if (val !== undefined && val !== '' && val !== null) {
        return typeof val === 'string' ? JSON.parse(val) : val;
      }
    }
  } catch (e) {
    // 忽略异常回退至内存
  }
  return memoryStore[key] || null;
}

function setStorage(key, value) {
  try {
    const jsonStr = JSON.stringify(value);
    if (jsonStr.length > CONFIG.STORAGE.MAX_BYTES) {
      return false;
    }
    memoryStore[key] = value;
    if (typeof wx !== 'undefined' && typeof wx.setStorageSync === 'function') {
      wx.setStorageSync(key, jsonStr);
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 首次用户点击后解锁并初始化音频系统
 */
function preloadSfxBuffers() {
  if (!webAudioCtx) return;
  Object.keys(AUDIO_PATHS).forEach((key) => {
    if (key.indexOf('sfx_') !== 0) return;
    const src = AUDIO_PATHS[key];
    if (audioBuffers[key] || !src) return;
    try {
      if (typeof fetch !== 'undefined') {
        fetch(src)
          .then((res) => {
            if (!res.ok) throw new Error('Fetch failed');
            return res.arrayBuffer();
          })
          .then((buf) => webAudioCtx.decodeAudioData(buf))
          .then((decoded) => {
            audioBuffers[key] = decoded;
          })
          .catch(() => {});
      }
    } catch (e) {}
  });
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  try {
    const AudioCtx = g.AudioContext || g.webkitAudioContext;
    if (AudioCtx && !webAudioCtx) {
      webAudioCtx = new AudioCtx();
      if (webAudioCtx.state === 'suspended') {
        webAudioCtx.resume();
      }
    }
  } catch (e) {
    // 忽略 WebAudio 初始化错误
  }

  preloadSfxBuffers();

  if (pendingBgmKey && bgmEnabled) {
    playBgm(pendingBgmKey);
  }
}

function isAudioUnlocked() {
  return audioUnlocked;
}

function setAudioConfig(options) {
  if (typeof options.sfx === 'boolean') {
    sfxEnabled = options.sfx;
  }
  if (typeof options.bgm === 'boolean') {
    bgmEnabled = options.bgm;
    if (!bgmEnabled) {
      stopBgm();
    } else if (pendingBgmKey && audioUnlocked) {
      playBgm(pendingBgmKey);
    }
  }
}

function getAudioConfig() {
  return { sfx: sfxEnabled, bgm: bgmEnabled };
}

function createAudioInstance(src, loop, volume) {
  try {
    if (typeof wx !== 'undefined' && typeof wx.createInnerAudioContext === 'function') {
      const ctx = wx.createInnerAudioContext();
      ctx.src = src;
      ctx.loop = Boolean(loop);
      ctx.volume = volume !== undefined ? volume : 0.6;
      return ctx;
    }
  } catch (e) {
    // 忽略
  }
  return null;
}

function playBgm(bgmKey) {
  pendingBgmKey = bgmKey;
  if (!audioUnlocked || !bgmEnabled) return;
  if (currentBgmKey === bgmKey && bgmContexts[bgmKey]) {
    try {
      bgmContexts[bgmKey].play();
    } catch (e) {}
    return;
  }

  stopBgm();
  currentBgmKey = bgmKey;
  const src = AUDIO_PATHS[bgmKey];
  if (!src) return;

  if (!bgmContexts[bgmKey]) {
    bgmContexts[bgmKey] = createAudioInstance(src, true, 0.42);
  }
  const inst = bgmContexts[bgmKey];
  if (inst) {
    try {
      inst.play();
    } catch (e) {}
  }
}

function stopBgm() {
  if (currentBgmKey && bgmContexts[currentBgmKey]) {
    try {
      bgmContexts[currentBgmKey].pause();
    } catch (e) {}
  }
  currentBgmKey = null;
}

/**
 * 播放音效（优先使用音频文件，同时提供低延迟合成泛音确保零延迟打击感）
 */
function playSfx(sfxKey, volumeMod = 1.0) {
  if (!audioUnlocked || !sfxEnabled) return;

  // 1. WebAudio 优先：多发无损并发 + 0.97~1.03 细腻自然随机音高抖动（消除机械感，还原真实战斗打击打击感）
  if (webAudioCtx && webAudioCtx.state === 'running') {
    if (audioBuffers[sfxKey]) {
      try {
        const srcNode = webAudioCtx.createBufferSource();
        srcNode.buffer = audioBuffers[sfxKey];
        srcNode.playbackRate.value = 0.97 + Math.random() * 0.06;
        const gainNode = webAudioCtx.createGain();
        const baseVol = SFX_VOLUMES[sfxKey] || 0.60;
        gainNode.gain.setValueAtTime(Math.min(1.0, baseVol * volumeMod), webAudioCtx.currentTime);
        srcNode.connect(gainNode);
        gainNode.connect(webAudioCtx.destination);
        srcNode.start(0);
        return;
      } catch (e) {}
    } else {
      // 触发延迟预热加载
      const src = AUDIO_PATHS[sfxKey];
      if (src && typeof fetch !== 'undefined') {
        fetch(src)
          .then((r) => r.arrayBuffer())
          .then((buf) => webAudioCtx.decodeAudioData(buf))
          .then((decoded) => {
            audioBuffers[sfxKey] = decoded;
          })
          .catch(() => {});
      }
    }
  }

  // 2. HTML5 / 微信 InnerAudioContext 多音轨轮播兜底 (4-voice round-robin pool)
  const src = AUDIO_PATHS[sfxKey];
  if (src) {
    if (!sfxVoicePool[sfxKey]) {
      sfxVoicePool[sfxKey] = [];
      sfxVoiceIndices[sfxKey] = 0;
      for (let i = 0; i < 4; i++) {
        sfxVoicePool[sfxKey].push(createAudioInstance(src, false, (SFX_VOLUMES[sfxKey] || 0.6) * volumeMod));
      }
    }
    const voices = sfxVoicePool[sfxKey];
    const idx = sfxVoiceIndices[sfxKey] % voices.length;
    sfxVoiceIndices[sfxKey] = (idx + 1) % voices.length;
    const inst = voices[idx];
    if (inst) {
      try {
        if (typeof inst.stop === 'function') inst.stop();
        if (typeof inst.seek === 'function') inst.seek(0);
        if ('currentTime' in inst) inst.currentTime = 0;
        inst.play();
      } catch (e) {}
    }
  }
}

const SCALE_FREQS = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 659.25, 783.99];

function playMusicalScale(noteIdx = 0) {
  if (!audioUnlocked || !sfxEnabled) return;
  playSfx('sfx_coin');
}

function playSynthTone() {
  // 已全面升级为 44.1kHz 专业实录战术音效，废弃 8-bit 方波电子音
}

function registerLifecycle(onHideCallback, onShowCallback) {
  if (typeof wx !== 'undefined' && typeof wx.onHide === 'function') {
    wx.onHide(() => {
      stopBgm();
      if (onHideCallback) onHideCallback();
    });
  }
  if (typeof wx !== 'undefined' && typeof wx.onShow === 'function') {
    wx.onShow(() => {
      // 回到前台保持暂停，不自动恢复战斗或继续计时
      if (onShowCallback) onShowCallback();
    });
  }
}

/**
 * 读取手柄状态（标准手柄接口，仅通过适配层暴露）
 */
function pollGamepadState() {
  if (typeof wx !== 'undefined' && typeof wx.getGamepads === 'function') {
    try {
      return wx.getGamepads();
    } catch (e) {
      return [];
    }
  }
  if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
    try {
      return navigator.getGamepads() || [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

/**
 * 高精度时间戳（毫秒）
 */
function nowMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

module.exports = {
  initCanvas,
  createOffscreenCanvas,
  updateViewport,
  screenToLogical,
  beginFrame,
  endFrame,
  recordDrawCall,
  loadImage,
  getImage,
  loadMapSubpackage,
  getStorage,
  setStorage,
  unlockAudio,
  isAudioUnlocked,
  setAudioConfig,
  getAudioConfig,
  playBgm,
  stopBgm,
  playSfx,
  playMusicalScale,
  registerLifecycle,
  pollGamepadState,
  nowMs,
  getViewport: () => viewport,
  getContext: () => mainCtx,
  getCanvas: () => mainCanvas
};

  };

  /* --- js/save/storage.js --- */
  __modules['js/save/storage'] = function(require, module, exports) {
/**
 * 存档读写与版本迁移管理器 (js/save/storage.js)
 * 仅通过平台适配层调用微信本地存储，存档大小严格 <= 200 KB
 * 仅记录：地图解锁状态、最高星级、最短通关用时、最高剩余种子、设置与新手引导完成标记
 */

const CONFIG = require('../data/config');
const platform = require('../core/platform');

function createDefaultSave() {
  return {
    version: CONFIG.STORAGE.VERSION,
    settings: {
      sfx: true,
      bgm: true,
      lang: 'zh'
    },
    guideSeen: false,
    maps: {
      map1: { unlocked: true, stars: 0, bestTime: null, bestSeeds: 0 },
      map2: { unlocked: false, stars: 0, bestTime: null, bestSeeds: 0 },
      map3: { unlocked: false, stars: 0, bestTime: null, bestSeeds: 0 }
    },
    endlessRecord: { bestWave: 0 }
  };
}

/**
 * 版本迁移：将旧版或残缺存档平滑升级至最新结构
 */
function migrateSave(raw) {
  const def = createDefaultSave();
  if (!raw || typeof raw !== 'object') {
    return def;
  }

  const migrated = {
    version: CONFIG.STORAGE.VERSION,
    settings: {
      sfx: raw.settings && typeof raw.settings.sfx === 'boolean' ? raw.settings.sfx : def.settings.sfx,
      bgm: raw.settings && typeof raw.settings.bgm === 'boolean' ? raw.settings.bgm : def.settings.bgm,
      lang: raw.settings && (raw.settings.lang === 'zh' || raw.settings.lang === 'en') ? raw.settings.lang : def.settings.lang
    },
    guideSeen: Boolean(raw.guideSeen),
    maps: {
      map1: Object.assign({}, def.maps.map1, raw.maps && raw.maps.map1 ? raw.maps.map1 : {}),
      map2: Object.assign({}, def.maps.map2, raw.maps && raw.maps.map2 ? raw.maps.map2 : {}),
      map3: Object.assign({}, def.maps.map3, raw.maps && raw.maps.map3 ? raw.maps.map3 : {})
    },
    endlessRecord: raw.endlessRecord && typeof raw.endlessRecord.bestWave === 'number'
      ? { bestWave: raw.endlessRecord.bestWave }
      : { bestWave: 0 }
  };

  // 地图 1 始终默认开放；若上一张地图已获得 >=1 星，自动确保下一张地图解锁
  migrated.maps.map1.unlocked = true;
  if (migrated.maps.map1.stars >= 1) {
    migrated.maps.map2.unlocked = true;
  }
  if (migrated.maps.map2.stars >= 1) {
    migrated.maps.map3.unlocked = true;
  }

  return migrated;
}

let currentSave = null;

function loadSave() {
  const raw = platform.getStorage(CONFIG.STORAGE.KEY);
  currentSave = migrateSave(raw);
  platform.setStorage(CONFIG.STORAGE.KEY, currentSave);
  return currentSave;
}

function getSave() {
  if (!currentSave) {
    return loadSave();
  }
  return currentSave;
}

function saveNow() {
  if (!currentSave) {
    currentSave = createDefaultSave();
  }
  return platform.setStorage(CONFIG.STORAGE.KEY, currentSave);
}

/**
 * 记录地图通关成绩并解锁下一张地图
 * @param {string} mapId 'map1' | 'map2' | 'map3'
 * @param {number} stars 1..3
 * @param {number} clearTimeSec 逻辑通关用时（秒，不含暂停与顿帧）
 * @param {number} remainingSeeds 剩余种子数
 */
function recordMapVictory(mapId, stars, clearTimeSec, remainingSeeds) {
  const save = getSave();
  const record = save.maps[mapId];
  if (!record) return;

  if (stars > record.stars) {
    record.stars = stars;
  }
  if (remainingSeeds > record.bestSeeds) {
    record.bestSeeds = remainingSeeds;
  }
  const roundedTime = Math.round(clearTimeSec * 10) / 10;
  if (record.bestTime === null || roundedTime < record.bestTime) {
    record.bestTime = roundedTime;
  }

  if (mapId === 'map1' && stars >= 1) {
    save.maps.map2.unlocked = true;
  } else if (mapId === 'map2' && stars >= 1) {
    save.maps.map3.unlocked = true;
  }

  saveNow();
}

function updateSettings(partialSettings) {
  const save = getSave();
  Object.assign(save.settings, partialSettings);
  saveNow();
  return save.settings;
}

function markGuideSeen() {
  const save = getSave();
  save.guideSeen = true;
  saveNow();
}

function unlockAllMapsForTest() {
  const save = getSave();
  save.maps.map1.unlocked = true;
  save.maps.map2.unlocked = true;
  save.maps.map3.unlocked = true;
  saveNow();
}

function recordEndlessWave(wave) {
  const save = getSave();
  if (!save.endlessRecord) save.endlessRecord = { bestWave: 0 };
  if (wave > save.endlessRecord.bestWave) {
    save.endlessRecord.bestWave = wave;
    saveNow();
  }
}

module.exports = {
  loadSave,
  getSave,
  saveNow,
  recordMapVictory,
  recordEndlessWave,
  updateSettings,
  markGuideSeen,
  unlockAllMapsForTest
};

  };

  /* --- js/game/achievements.js --- */
  __modules['js/game/achievements'] = function(require, module, exports) {
/**
 * 战术成就殿堂与勋章进阶系统 (js/game/achievements.js)
 * 深度对标《王国保卫战》经典成就殿堂，包含 20 大战术勋章与即时弹窗
 */

const storage = require('../save/storage');
const platform = require('../core/platform');

const ACHIEVEMENTS_DATA = [
  { id: 'first_blood', title: '🌲 树林见血', desc: '击杀首只入侵甲虫，打响林地保卫战第一枪', icon: '⚔️', rewardStars: 1 },
  { id: 'flawless_defense', title: '🛡️ 滴水不漏', desc: '以 20 颗种子完全无损的完美战绩通关任意地图', icon: '👑', rewardStars: 2 },
  { id: 'hero_awakened', title: '🌳 守护神觉醒', desc: '大橡树英雄达到 5 级并释放「大地轰鸣」奥义', icon: '🌟', rewardStars: 1 },
  { id: 'subterranean_slayer', title: '🕳️ 潜行破灭', desc: '全歼自侧翼腐化地穴绕行的全部暗影潜行突袭怪', icon: '🐛', rewardStars: 1 },
  { id: 'spore_tycoon', title: '💰 孢子大亨', desc: '单局积累超过 2500 黄金孢子，经济命脉固若金汤', icon: '🪙', rewardStars: 2 },
  { id: 'multikill_overload', title: '💥 割草狂潮', desc: '触发 10 只以上敌军瞬间连环爆裂群杀', icon: '🔥', rewardStars: 1 },
  { id: 'iron_wall', title: '🏰 永固棱堡', desc: '场上同时拥有 4 座三阶终极进阶形态防御塔', icon: '💎', rewardStars: 2 },
  { id: 'weather_survivor', title: '🩸 血月征服者', desc: '在狂暴血月天候下坚守阵地并全歼狂暴虫潮', icon: '🌙', rewardStars: 1 },
  { id: 'spider_regicide', title: '🕷️ 蛛后除根', desc: '击破第 10 波织网蜘蛛女王，光复图一晨曦薄雾', icon: '🏆', rewardStars: 3 },
  { id: 'endless_champion', title: '🌌 深渊开拓者', desc: '在无尽深渊极限模式中突破第 15 波狂暴挑战', icon: '✨', rewardStars: 3 },
  { id: 'pitcher_gluttony', title: '🪴 贪食猪笼草', desc: '激活食人猪笼草捕食巨怪并成功消化 3 次', icon: '🍃', rewardStars: 1 },
  { id: 'thunder_conduit', title: '⚡ 灵脉雷音', desc: '激活古树雷石释放连锁闪电轰击 6 只以上虫群', icon: '🌩️', rewardStars: 1 },
  { id: 'tactical_stances', title: '🥋 兵无常势', desc: '在同一场战斗中灵活切换大橡树的三大战斗姿态', icon: '🎖️', rewardStars: 1 },
  { id: 'holy_cornucopia', title: '☀️ 丰收晨露', desc: '建造神圣灵光菇并在单局产出超过 800 黄金孢子', icon: '🍄', rewardStars: 1 },
  { id: 'permafrost_hold', title: '❄️ 绝对零度', desc: '使用极寒雾菇使至少 8 只敌人同时陷入重度减速', icon: '🧊', rewardStars: 1 },
  { id: 'laceration_field', title: '🩸 荆棘修罗场', desc: '尖刺菇单场割裂创伤累计造成超过 3000 点物理伤害', icon: '🌵', rewardStars: 1 },
  { id: 'artillery_barrage', title: '💣 熔岩落日', desc: '爆裂重炮单发熔岩迫击炮弹直接消灭 5 只聚集敌怪', icon: '🎯', rewardStars: 1 },
  { id: 'audacious_commander', title: '⏱️ 兵贵神速', desc: '累计 5 次提前吹响号角迎战，累积丰厚军功孢子', icon: '📯', rewardStars: 1 },
  { id: 'last_stand', title: '❤️ 绝境逆转', desc: '在生命种子仅剩最后 1 颗时绝境反击取得关卡胜利', icon: '🔥', rewardStars: 2 },
  { id: 'codex_grandmaster', title: '📜 博学大典', desc: '翻阅林地秘典全部守林神树卫士与暗黑虫潮图鉴档案', icon: '📖', rewardStars: 1 }
];

class AchievementManager {
  constructor() {
    this.unlockedIds = new Set();
    this.pendingToasts = [];
    this.currentToast = null;
    this.toastTimer = 0;
    this.totalStarsEarned = 0;

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = platform.getStorageSync('sporeguard_achievements');
      const list = Array.isArray(saved) ? saved : (typeof saved === 'string' ? JSON.parse(saved) : []);
      this.unlockedIds = new Set(list);
      this.calculateStars();
    } catch (e) {
      this.unlockedIds = new Set();
    }
  }

  saveToStorage() {
    try {
      platform.setStorageSync('sporeguard_achievements', Array.from(this.unlockedIds));
    } catch (e) {}
  }

  calculateStars() {
    let s = 0;
    for (let i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
      const a = ACHIEVEMENTS_DATA[i];
      if (this.unlockedIds.has(a.id)) {
        s += a.rewardStars || 1;
      }
    }
    this.totalStarsEarned = s;
  }

  unlock(id, fx = null) {
    if (this.unlockedIds.has(id)) return;
    const item = ACHIEVEMENTS_DATA.find(it => it.id === id);
    if (!item) return;

    this.unlockedIds.add(id);
    this.saveToStorage();
    this.calculateStars();

    this.pendingToasts.push(item);
    platform.playSfx('sfx_upgrade');

    if (fx && typeof fx.triggerScreenShake === 'function') {
      fx.triggerScreenShake(2.0, 0.15);
    }
  }

  isUnlocked(id) {
    return this.unlockedIds.has(id);
  }

  getAllAchievements() {
    return ACHIEVEMENTS_DATA.map(item => ({
      ...item,
      unlocked: this.unlockedIds.has(item.id)
    }));
  }

  getUnlockedCount() {
    return this.unlockedIds.size;
  }

  getTotalCount() {
    return ACHIEVEMENTS_DATA.length;
  }

  update(dt) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) {
        this.currentToast = null;
      }
    } else if (this.pendingToasts.length > 0) {
      this.currentToast = this.pendingToasts.shift();
      this.toastTimer = 3.6;
    }
  }

  renderAchievementToast(ctx) {
    if (!this.currentToast || this.toastTimer <= 0) return;

    ctx.save();
    const item = this.currentToast;
    const tw = 360;
    const th = 48;
    const tx = (960 - tw) * 0.5;
    
    // 顶部平滑滑出动画
    let ty = 24;
    if (this.toastTimer > 3.2) {
      const prog = (3.6 - this.toastTimer) / 0.4;
      ty = -50 + prog * 74;
    } else if (this.toastTimer < 0.4) {
      const prog = this.toastTimer / 0.4;
      ty = -50 + prog * 74;
    }

    // 古典林地木纹与羊皮纸底框
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(28, 18, 10, 0.95)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(tx, ty, tw, th, 10) : ctx.rect(tx, ty, tw, th);
    ctx.fill();

    ctx.strokeStyle = '#FFE58F';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 左侧徽章大图标
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, tx + 28, ty + 24);

    // 标题：成就解锁
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🏆 成就达成：${item.title}`, tx + 56, ty + 16);

    // 描述详情
    ctx.fillStyle = '#D9D9D9';
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillText(item.desc, tx + 56, ty + 34);

    // 右侧奖励星级
    ctx.fillStyle = '#FFE58F';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`+${item.rewardStars}⭐`, tx + tw - 16, ty + 24);

    ctx.restore();
  }

  renderToast(ctx) {
    return this.renderAchievementToast(ctx);
  }
}

const achievements = new AchievementManager();
module.exports = achievements;

  };

  /* --- js/core/pool.js --- */
  __modules['js/core/pool'] = function(require, module, exports) {
/**
 * 固定上限对象池 (Object Pool)
 * 用于敌人(上限120)、子弹(上限150)、粒子(上限600)、雾团/灼烧区、伤害数字的零分配复用
 */

class ObjectPool {
  /**
   * @param {Function} factory 创建新对象的工厂函数
   * @param {Function} resetFn 重置对象状态的函数
   * @param {number} maxCap 最大同屏活跃上限
   */
  constructor(factory, resetFn, maxCap) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.maxCap = maxCap;
    this.freeList = [];
    this.activeList = [];

    for (let i = 0; i < maxCap; i++) {
      const item = this.factory();
      item.__active = false;
      this.freeList.push(item);
    }
  }

  /**
   * 获取一个可用对象；若达到上限返回 null（或回收最旧粒子）
   */
  acquire(recycleOldestIfFull = false) {
    let item = null;
    if (this.freeList.length > 0) {
      item = this.freeList.pop();
    } else if (recycleOldestIfFull && this.activeList.length > 0) {
      item = this.activeList.shift();
    } else {
      return null;
    }

    item.__active = true;
    if (this.resetFn) {
      this.resetFn(item);
    }
    this.activeList.push(item);
    return item;
  }

  /**
   * 释放指定对象回池
   */
  release(item) {
    if (!item || !item.__active) return;
    item.__active = false;
    const idx = this.activeList.indexOf(item);
    if (idx !== -1) {
      this.activeList.splice(idx, 1);
    }
    this.freeList.push(item);
  }

  /**
   * 根据索引快速释放（遍历更新时避免 O(N) 查找）
   */
  releaseAt(index) {
    if (index < 0 || index >= this.activeList.length) return;
    const item = this.activeList[index];
    item.__active = false;
    this.activeList.splice(index, 1);
    this.freeList.push(item);
  }

  /**
   * 清空所有活跃对象回池
   */
  clear() {
    while (this.activeList.length > 0) {
      const item = this.activeList.pop();
      item.__active = false;
      this.freeList.push(item);
    }
  }

  getActiveCount() {
    return this.activeList.length;
  }

  getActiveList() {
    return this.activeList;
  }
}

module.exports = ObjectPool;

  };

  /* --- js/core/atlasRenderer.js --- */
  __modules['js/core/atlasRenderer'] = function(require, module, exports) {
/**
 * 像素图集绘制工具 (js/core/atlasRenderer.js)
 * 严格遵循：1 个美术像素 = 2 个逻辑像素，最近邻缩放，无平滑
 */

const platform = require('./platform');
const CONFIG = require('../data/config');
const { SPRITE_ATLAS, UI_ATLAS, MAP_ATLAS_LAYOUT } = require('../data/atlas');

const SCALE = CONFIG.RESOLUTION.ART_PIXEL_SCALE; // 2
const HD_ATLAS_SCALE = 4; // 4x AI 高清图集采样倍率

function drawSubImage(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (!img) return false;
  ctx.imageSmoothingEnabled = true;
  if (typeof ctx.imageSmoothingQuality !== 'undefined') {
    ctx.imageSmoothingQuality = 'high';
  }
  const k = (img.width && img.width >= 1024) ? HD_ATLAS_SCALE : 1;
  ctx.drawImage(img, sx * k, sy * k, sw * k, sh * k, Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
  platform.recordDrawCall(1);
  return true;
}

/**
 * 绘制炮塔动画帧 (16x24 美术像素 -> 32x48 逻辑像素)
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} towerId 'watch' | 'mist' | 'thorn' | 'burst'
 * @param {string} nodeId 'base' | 'lv1' | 'a2' | 'a3' | 'b2' | 'b3'
 * @param {string} animState 'idle' | 'attack' | 'upgrade'
 * @param {number} frameIdx 帧序号
 * @param {number} tileX 所在格左上角逻辑 X
 * @param {number} tileY 所在格左上角逻辑 Y
 */
function drawTowerSprite(ctx, towerId, nodeId, animState, frameIdx, tileX, tileY) {
  if (towerId === 'lumina') return false;
  const img = platform.getImage(SPRITE_ATLAS.path);
  const tMeta = SPRITE_ATLAS.towers[towerId] && SPRITE_ATLAS.towers[towerId][nodeId];
  if (!img || !tMeta) return false;

  let col = tMeta.idleStartCol + (frameIdx % tMeta.idleFrames);
  if (animState === 'attack') {
    col = tMeta.attackStartCol + (frameIdx % tMeta.attackFrames);
  } else if (animState === 'upgrade') {
    col = tMeta.upgradeStartCol + (frameIdx % tMeta.upgradeFrames);
  }

  const sx = col * tMeta.w;
  const sy = tMeta.rowY;
  // 基座 16x16 对应格底 32x32，整体 16x24 (32x48) 向上延伸 16 逻辑像素
  const dx = tileX;
  const dy = tileY - 16;
  return drawSubImage(ctx, img, sx, sy, tMeta.w, tMeta.h, dx, dy, tMeta.w * SCALE, tMeta.h * SCALE);
}

/**
 * 绘制敌人动画帧
 */
function drawEnemySprite(ctx, enemyId, animState, frameIdx, centerX, centerY, flashWhite = false) {
  const img = platform.getImage(SPRITE_ATLAS.path);
  const eMeta = SPRITE_ATLAS.enemies[enemyId];
  if (!img || !eMeta) return false;

  let col = eMeta.walkStartCol + (frameIdx % eMeta.walkFrames);
  if (flashWhite && eMeta.flashStartCol !== undefined) {
    if (eMeta.cellW === 32) {
      col = eMeta.flashStartCol;
    } else {
      col = eMeta.flashStartCol + (frameIdx % eMeta.walkFrames);
    }
  } else if (animState === 'death') {
    col = eMeta.deathStartCol + Math.min(eMeta.deathFrames - 1, frameIdx);
  } else if (animState === 'hitArmor' && eMeta.hitArmorStartCol !== undefined) {
    col = eMeta.hitArmorStartCol + (frameIdx % eMeta.hitArmorFrames);
  } else if (animState === 'phase' && eMeta.phaseStartCol !== undefined) {
    col = eMeta.phaseStartCol + (frameIdx % eMeta.phaseFrames);
  }

  const sx = col * eMeta.cellW;
  const sy = eMeta.rowY;
  const dw = eMeta.cellW * SCALE;
  const dh = eMeta.cellH * SCALE;
  const dx = centerX - dw * 0.5;
  const dy = centerY - dh * 0.5;

  return drawSubImage(ctx, img, sx, sy, eMeta.cellW, eMeta.cellH, dx, dy, dw, dh);
}

/**
 * 绘制飞行敌人影子
 */
function drawEnemyShadow(ctx, enemyId, centerX, centerY, offsetY) {
  const img = platform.getImage(SPRITE_ATLAS.path);
  const eMeta = SPRITE_ATLAS.enemies[enemyId];
  if (!img || !eMeta || eMeta.shadowCol === undefined) return false;

  const sx = eMeta.shadowCol * eMeta.cellW;
  const sy = eMeta.rowY;
  const dw = eMeta.cellW * SCALE;
  const dh = eMeta.cellH * SCALE;
  return drawSubImage(ctx, img, sx, sy, eMeta.cellW, eMeta.cellH, centerX - dw * 0.5, centerY + offsetY - dh * 0.5, dw, dh);
}

/**
 * 绘制子弹或状态小图标
 */
function drawProjectileSprite(ctx, key, x, y, angleRad = 0, scaleMul = 1.0) {
  const img = platform.getImage(SPRITE_ATLAS.path);
  const rect = SPRITE_ATLAS.projectiles[key];
  if (!img || !rect) return false;

  const dw = rect.w * SCALE * scaleMul;
  const dh = rect.h * SCALE * scaleMul;

  if (angleRad !== 0) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(angleRad);
    drawSubImage(ctx, img, rect.x, rect.y, rect.w, rect.h, -dw * 0.5, -dh * 0.5, dw, dh);
    ctx.restore();
    return true;
  }
  return drawSubImage(ctx, img, rect.x, rect.y, rect.w, rect.h, x - dw * 0.5, y - dh * 0.5, dw, dh);
}

/**
 * 绘制雾团、灼烧区或冲击环
 */
function drawHazardSprite(ctx, key, centerX, centerY, radiusPx, alpha = 1.0) {
  const img = platform.getImage(SPRITE_ATLAS.path);
  const rect = SPRITE_ATLAS.hazards[key];
  if (!img || !rect) return false;

  const size = radiusPx * 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  drawSubImage(ctx, img, rect.x, rect.y, rect.w, rect.h, centerX - radiusPx, centerY - radiusPx, size, size);
  ctx.restore();
  return true;
}

/**
 * 绘制 UI 16x16 或 24x24 图标
 */
function drawUiIcon(ctx, category, key, x, y, customSize = null) {
  if (key === 'lumina') {
    const sz = customSize || (category === 24 ? 24 : 16);
    const luminaImg = platform.getImage('assets/vfx/prop_lumina_base.png');
    if (luminaImg && luminaImg.width) {
      ctx.drawImage(luminaImg, x, y, sz, sz);
      return true;
    }
    return false;
  }
  const img = platform.getImage(UI_ATLAS.path);
  const group = category === 24 ? UI_ATLAS.icons24 : UI_ATLAS.icons16;
  const rect = group && group[key];
  if (!img || !rect) return false;

  const dw = customSize || rect.w * SCALE;
  const dh = customSize || rect.h * SCALE;
  return drawSubImage(ctx, img, rect.x, rect.y, rect.w, rect.h, x, y, dw, dh);
}

/**
 * 绘制战术主动技能圆形勋章图标 (rain, shock, harvest)
 */
function drawSpellIcon(ctx, spellId, x, y, size = 48) {
  const img = platform.getImage(UI_ATLAS.path);
  const rect = UI_ATLAS.spells && UI_ATLAS.spells[spellId];
  if (!img || !rect) return false;
  return drawSubImage(ctx, img, rect.x, rect.y, rect.w, rect.h, x, y, size, size);
}

/**
 * 绘制地图图块
 */
function drawMapTile(ctx, atlasPath, tileKey, dx, dy, dw = 32, dh = 32) {
  const img = platform.getImage(atlasPath);
  const rect = MAP_ATLAS_LAYOUT.tiles16[tileKey];
  if (!img || !rect) return false;
  return drawSubImage(ctx, img, rect.x, rect.y, rect.w, rect.h, dx, dy, dw, dh);
}

module.exports = {
  drawSubImage,
  drawTowerSprite,
  drawEnemySprite,
  drawEnemyShadow,
  drawProjectileSprite,
  drawHazardSprite,
  drawUiIcon,
  drawSpellIcon,
  drawMapTile
};

  };

  /* --- js/input/input.js --- */
  __modules['js/input/input'] = function(require, module, exports) {
/**
 * 统一输入管理器 (js/input/input.js)
 * 将触屏、鼠标、键盘、标准手柄统一转换为“动作 (Action)”队列
 * 游戏逻辑只消费动作，不关心底层物理设备
 */

const platform = require('../core/platform');
const CONFIG = require('../data/config');

const actionQueue = [];
let pointerPos = { x: 320, y: 240 };
let gridCursor = { col: 7, row: 6, active: false };

// 手柄按键与摇杆边沿检测状态
let prevGamepadButtons = [];
let stickCooldown = 0;

function emitAction(type, payload = {}) {
  platform.unlockAudio();
  actionQueue.push(Object.assign({ type }, payload));
}

function clampGridCursor(col, row) {
  const maxCol = CONFIG.LAYOUT.MAP.COLS - 1;
  const maxRow = CONFIG.LAYOUT.MAP.ROWS - 1;
  gridCursor.col = Math.max(0, Math.min(maxCol, col));
  gridCursor.row = Math.max(0, Math.min(maxRow, row));
}

function initInput() {
  // 微信小游戏触屏与键盘事件（浏览器环境下由平台桥接层统一转发至 wx 接口）
  if (typeof wx !== 'undefined') {
    if (typeof wx.onTouchStart === 'function') {
      wx.onTouchStart((res) => {
        const touch = (res && res.touches && res.touches[0]) || (res && res.changedTouches && res.changedTouches[0]);
        if (!touch) return;
        const pos = platform.screenToLogical(touch.clientX, touch.clientY);
        pointerPos.x = pos.x;
        pointerPos.y = pos.y;
        updateCursorFromPointer(pos.x, pos.y);
        emitAction('pointer_down', { x: pos.x, y: pos.y });
      });
    }

    if (typeof wx.onTouchMove === 'function') {
      wx.onTouchMove((res) => {
        const touch = (res && res.touches && res.touches[0]) || (res && res.changedTouches && res.changedTouches[0]);
        if (!touch) return;
        const pos = platform.screenToLogical(touch.clientX, touch.clientY);
        pointerPos.x = pos.x;
        pointerPos.y = pos.y;
        updateCursorFromPointer(pos.x, pos.y);
        emitAction('pointer_move', { x: pos.x, y: pos.y });
      });
    }

    if (typeof wx.onTouchEnd === 'function') {
      wx.onTouchEnd((res) => {
        const touch = (res && res.changedTouches && res.changedTouches[0]) || (res && res.touches && res.touches[0]);
        const pos = touch ? platform.screenToLogical(touch.clientX, touch.clientY) : pointerPos;
        pointerPos.x = pos.x;
        pointerPos.y = pos.y;
        emitAction('pointer_up', { x: pos.x, y: pos.y });
      });
    }

    if (typeof wx.onKeyDown === 'function') {
      wx.onKeyDown((res) => {
        handleKeyDown(res.code || res.key || '');
      });
    }
  }
}

function screenToMapCoords(lx, ly) {
  const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
  const sx = mv.SCALE_X || mv.SCALE || 1;
  const sy = mv.SCALE_Y || mv.SCALE || 1;
  return {
    mx: (lx - mv.OFFSET_X) / sx,
    my: (ly - mv.OFFSET_Y) / sy
  };
}

function updateCursorFromPointer(lx, ly) {
  const { mx, my } = screenToMapCoords(lx, ly);
  if (mx >= 0 && mx < CONFIG.LAYOUT.MAP.WIDTH && my >= 0 && my < CONFIG.LAYOUT.MAP.HEIGHT) {
    const col = Math.floor(mx / CONFIG.RESOLUTION.TILE_SIZE);
    const row = Math.floor(my / CONFIG.RESOLUTION.TILE_SIZE);
    clampGridCursor(col, row);
  }
}

function handleKeyDown(rawKey) {
  const key = String(rawKey).toLowerCase();
  platform.unlockAudio();

  if (key === 'arrowup' || key === 'keyw' || key === 'w') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row - 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'arrowdown' || key === 'keys' || key === 's') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row + 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'arrowleft' || key === 'keya' || key === 'a') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col - 1, gridCursor.row);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'arrowright' || key === 'keyd' || key === 'd') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col + 1, gridCursor.row);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'digit1' || key === '1') {
    emitAction('select_tower_slot', { slot: 0 });
  } else if (key === 'digit2' || key === '2') {
    emitAction('select_tower_slot', { slot: 1 });
  } else if (key === 'digit3' || key === '3') {
    emitAction('select_tower_slot', { slot: 2 });
  } else if (key === 'digit4' || key === '4') {
    emitAction('select_tower_slot', { slot: 3 });
  } else if (key === 'digit5' || key === '5') {
    emitAction('select_tower_slot', { slot: 4 });
  } else if (key === 'enter') {
    emitAction('confirm_tile', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'space' || key === ' ' || key === 'keyg' || key === 'g') {
    if (gridCursor.active) {
      emitAction('confirm_tile', { col: gridCursor.col, row: gridCursor.row });
    } else {
      emitAction('toggle_awakening');
    }
  } else if (key === 'keyq' || key === 'q') {
    emitAction('trigger_spell', { spellId: 'rain' });
  } else if (key === 'keyw' || key === 'w') {
    emitAction('trigger_spell', { spellId: 'shock' });
  } else if (key === 'keye' || key === 'e') {
    emitAction('trigger_spell', { spellId: 'harvest' });
  } else if (key === 'keyu' || key === 'u' || key === 'keyj' || key === 'j') {
    emitAction('upgrade_branch', { branch: 'A' });
  } else if (key === 'keyi' || key === 'i' || key === 'keyk' || key === 'k') {
    emitAction('upgrade_branch', { branch: 'B' });
  } else if (key === 'keyx' || key === 'x' || key === 'delete' || key === 'backspace') {
    emitAction('sell_selected');
  } else if (key === 'tab' || key === 'keyp' || key === 'p') {
    emitAction('cycle_priority');
  } else if (key === 'keyc' || key === 'c') {
    emitAction('call_wave');
  } else if (key === 'keyr' || key === 'r') {
    emitAction('cycle_speed');
  } else if (key === 'keyf' || key === 'f') {
    emitAction('hero_ultimate');
  } else if (key === 'keyz' || key === 'z') {
    emitAction('cycle_hero_stance');
  } else if (key === 'keyt' || key === 't') {
    emitAction('toggle_shovel');
  } else if (key === 'escape') {
    emitAction('toggle_pause');
  }
}

/**
 * 每帧轮询标准手柄状态并转换为统一动作
 */
function pollGamepad(realDt) {
  if (stickCooldown > 0) {
    stickCooldown -= realDt;
  }

  const pads = platform.pollGamepadState();
  if (!pads || !pads.length) return;

  let pad = null;
  for (let i = 0; i < pads.length; i++) {
    if (pads[i] && pads[i].connected) {
      pad = pads[i];
      break;
    }
  }
  if (!pad) return;

  const buttons = pad.buttons || [];
  const isPressed = (idx) => Boolean(buttons[idx] && buttons[idx].pressed);
  const justPressed = (idx) => isPressed(idx) && !prevGamepadButtons[idx];

  // D-Pad (12: Up, 13: Down, 14: Left, 15: Right)
  if (justPressed(12)) {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row - 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  }
  if (justPressed(13)) {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row + 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  }
  if (justPressed(14)) {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col - 1, gridCursor.row);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  }
  if (justPressed(15)) {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col + 1, gridCursor.row);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  }

  // 左摇杆移动格子光标
  const axes = pad.axes || [0, 0];
  if (stickCooldown <= 0) {
    const ax = axes[0] || 0;
    const ay = axes[1] || 0;
    if (Math.abs(ax) > 0.55 || Math.abs(ay) > 0.55) {
      gridCursor.active = true;
      const dCol = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 1 : -1) : 0;
      const dRow = Math.abs(ay) >= Math.abs(ax) ? (ay > 0 ? 1 : -1) : 0;
      clampGridCursor(gridCursor.col + dCol, gridCursor.row + dRow);
      emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
      stickCooldown = 0.16;
    }
  }

  // A(0): 确认建造/选中, B(1): 出售/返回, X(2): 升级/分支A, Y(3): 分支B/提前召唤
  if (justPressed(0)) {
    emitAction('confirm_tile', { col: gridCursor.col, row: gridCursor.row });
  }
  if (justPressed(1)) {
    emitAction('sell_selected');
  }
  if (justPressed(2)) {
    emitAction('upgrade_branch', { branch: 'A' });
  }
  if (justPressed(3)) {
    emitAction('upgrade_branch', { branch: 'B' });
  }
  // LB(4) / RB(5): 切换炮塔槽位
  if (justPressed(4)) {
    emitAction('cycle_tower_slot', { dir: -1 });
  }
  if (justPressed(5)) {
    emitAction('cycle_tower_slot', { dir: 1 });
  }
  // LT(6): 提前召唤下一波, RT(7): 切换倍速
  if (justPressed(6)) {
    emitAction('call_wave');
  }
  if (justPressed(7)) {
    emitAction('cycle_speed');
  }
  // Back/Select(8): 切换索敌优先级, Start(9): 暂停/恢复
  if (justPressed(8)) {
    emitAction('cycle_priority');
  }
  if (justPressed(9)) {
    emitAction('toggle_pause');
  }

  prevGamepadButtons = buttons.map((b) => Boolean(b && b.pressed));
}

function consumeActions() {
  if (actionQueue.length === 0) return [];
  return actionQueue.splice(0, actionQueue.length);
}

function getPointerPos() {
  return pointerPos;
}

function getGridCursor() {
  return gridCursor;
}

function setGridCursor(col, row, active = true) {
  clampGridCursor(col, row);
  gridCursor.active = active;
}

module.exports = {
  initInput,
  pollGamepad,
  consumeActions,
  emitAction,
  getPointerPos,
  getGridCursor,
  setGridCursor
};

  };

  /* --- js/fx/fx.js --- */
  __modules['js/fx/fx'] = function(require, module, exports) {
/**
 * 特效与打击反馈系统 (js/fx/fx.js)
 * 管理对象池粒子（上限600）、伤害/奖励弹出数字、爆心冲击环、震屏、顿帧、边缘红闪与横幅
 * 严格遵循 5.7 反馈参数表与顿帧上限规则
 */

const ObjectPool = require('../core/pool');
const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');
const i18n = require('../i18n/index');
const { drawHazardSprite } = require('../core/atlasRenderer');

class FxSystem {
  constructor() {
    // 粒子对象池（上限 600）
    this.particlePool = new ObjectPool(
      () => ({
        x: 0, y: 0, vx: 0, vy: 0,
        size: 4, color: PALETTE.UI_SPORE,
        life: 0, maxLife: 0.4, gravity: 0
      }),
      (p) => {
        p.x = 0; p.y = 0; p.vx = 0; p.vy = 0;
        p.size = 4; p.color = PALETTE.UI_SPORE;
        p.life = 0; p.maxLife = 0.4; p.gravity = 0;
      },
      CONFIG.POOL_CAPS.PARTICLES
    );

    // 浮动数字对象池（上限 80）
    this.textPool = new ObjectPool(
      () => ({
        x: 0, y: 0, vy: -28,
        text: '', color: PALETTE.UI_TEXT,
        life: 0, maxLife: 0.65, scale: 1.0
      }),
      (t) => {
        t.x = 0; t.y = 0; t.vy = -28;
        t.text = ''; t.color = PALETTE.UI_TEXT;
        t.life = 0; t.maxLife = 0.65; t.scale = 1.0;
      },
      CONFIG.POOL_CAPS.FLOATING_TEXTS
    );

    // 冲击波环（用于爆裂菇爆炸与升级闪光环）
    this.rings = [];

    this.resetBattleState();
  }

  resetBattleState() {
    this.particlePool.clear();
    this.textPool.clear();
    this.rings.length = 0;

    // 震屏状态（取最大值，不累加）
    this.shakePx = 0;
    this.shakeTimerMs = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // 顿帧状态
    this.hitstopRemainingSec = 0;
    this.lastHitstopRealTimeSec = -10;
    this.totalHitstopSec = 0;
    this.elapsedRealCombatSec = 0;

    // 特效慢放状态（超载 10 杀时 0.5 倍速 150ms）
    this.fxTimeScale = 1.0;
    this.fxSlowMoTimerSec = 0;

    // 种子受损红边闪烁
    this.redEdgeTimerSec = 0;

    // 顶部战斗横幅
    this.banner = {
      active: false,
      text: '',
      subText: '',
      color: PALETTE.UI_SPORE,
      timer: 0,
      duration: 1.4
    };
  }

  /**
   * 触发震屏（取最大值不累加）
   */
  triggerShake(px, durationMs) {
    if (px <= 0 || durationMs <= 0) return;
    if (px >= this.shakePx) {
      this.shakePx = px;
      this.shakeTimerMs = Math.max(this.shakeTimerMs, durationMs);
    }
  }

  triggerScreenShake(px, durationSec = 0.15) {
    this.triggerShake(px, durationSec * 1000);
  }

  /**
   * 触发顿帧（遵守 0.5 秒最小间隔与单场战斗时间 5% 累计上限）
   */
  triggerHitstop(durationMs) {
    if (durationMs <= 0) return;
    const reqSec = durationMs / 1000;
    const minInterval = CONFIG.FEEDBACK.HITSTOP_MIN_INTERVAL_SEC;
    if (this.elapsedRealCombatSec - this.lastHitstopRealTimeSec < minInterval) {
      return;
    }

    // 单场顿帧累计不超过战斗时间的 5%（开局前3秒留有保底裕度）
    const effectiveCombatTime = Math.max(3.0, this.elapsedRealCombatSec);
    if (this.totalHitstopSec + reqSec > effectiveCombatTime * CONFIG.FEEDBACK.HITSTOP_MAX_COMBAT_RATIO) {
      return;
    }

    this.hitstopRemainingSec = Math.max(this.hitstopRemainingSec, reqSec);
    this.totalHitstopSec += reqSec;
    this.lastHitstopRealTimeSec = this.elapsedRealCombatSec;
  }

  isHitstopped() {
    return this.hitstopRemainingSec > 0;
  }

  /**
   * 发射像素粒子
   */
  spawnParticles(x, y, count, colors, speedMin = 30, speedMax = 110, lifeMin = 0.22, lifeMax = 0.50, size = 4) {
    const colorList = Array.isArray(colors) ? colors : [colors];
    for (let i = 0; i < count; i++) {
      const p = this.particlePool.acquire(true);
      if (!p) break;
      const angle = (Math.PI * 2 * i) / Math.max(1, count) + (Math.random() - 0.5) * 0.6;
      const spd = speedMin + Math.random() * (speedMax - speedMin);
      p.x = x + (Math.random() - 0.5) * 6;
      p.y = y + (Math.random() - 0.5) * 6;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd;
      p.size = size;
      p.color = colorList[i % colorList.length];
      p.life = 0;
      p.maxLife = lifeMin + Math.random() * (lifeMax - lifeMin);
      p.gravity = 40;
    }
  }

  /**
   * 弹出伤害或奖励数字
   */
  spawnFloatingText(x, y, text, color = PALETTE.UI_TEXT, scale = 1.0) {
    const item = this.textPool.acquire(true);
    if (!item) return;
    item.x = x + (Math.random() - 0.5) * 8;
    item.y = y - 8;
    item.vy = -34;
    item.text = String(text);
    item.color = color;
    item.life = 0;
    item.maxLife = 0.65;
    item.scale = scale;
  }

  /**
   * 添加冲击环（爆裂菇爆心或升级闪光环）
   */
  spawnShockwave(x, y, maxRadius = 40, color = '#FFFFFF') {
    return this.spawnRing(x, y, maxRadius, color, 0.35, false);
  }

  spawnRing(x, y, maxRadiusPx, color, duration = 0.28, isUpgrade = false) {
    if (this.rings.length >= 24) {
      this.rings.shift();
    }
    this.rings.push({
      x,
      y,
      maxRadiusPx,
      color,
      life: 0,
      duration,
      isUpgrade
    });
  }

  /**
   * 显示横幅（如“连锁！/Chain!”、“超载！/Overload!”、首领登场等）
   */
  showBanner(text, color = PALETTE.UI_SPORE, subText = '', duration = 1.35) {
    this.banner.active = true;
    this.banner.text = text;
    this.banner.subText = subText;
    this.banner.color = color;
    this.banner.timer = 0;
    this.banner.duration = duration;
  }

  // ==== 5.7 标准事件反馈接口 ====

  onSingleHit(x, y, color = PALETTE.MUSHROOM_GILL) {
    const fb = CONFIG.FEEDBACK.HIT;
    this.spawnParticles(x, y, fb.particles, [color, PALETTE.UI_TEXT], 25, 70, 0.14, 0.26, 4);
  }

  onSingleKill(x, y, damageVal, rewardSpores, enemyColor = PALETTE.UI_SPORE) {
    const fb = CONFIG.FEEDBACK.SINGLE_KILL;
    this.triggerShake(fb.shakePx, fb.shakeMs);
    this.spawnParticles(x, y, fb.particles, [enemyColor, PALETTE.UI_SPORE, PALETTE.UI_TEXT], 35, 115, 0.22, 0.45, 4);
    if (fb.popNumber) {
      const shownDmg = Math.max(1, Math.round(damageVal));
      this.spawnFloatingText(x, y - 4, '-' + shownDmg, PALETTE.UI_TEXT, 1.0);
      if (rewardSpores > 0) {
        this.spawnFloatingText(x + 6, y - 16, '+' + rewardSpores, PALETTE.UI_SPORE, 1.05);
      }
    }
  }

  onBurstExplosion(x, y, splashRadiusPx, branchColor = PALETTE.BRANCH_B) {
    const fb = CONFIG.FEEDBACK.BURST_EXPLOSION;
    this.triggerShake(fb.shakePx, fb.shakeMs);
    this.triggerHitstop(fb.hitstopMs);
    this.spawnParticles(x, y, fb.particles, [branchColor, PALETTE.UI_SPORE, PALETTE.MUSHROOM_CAP], 45, 145, 0.25, 0.52, 4);
    if (fb.shockwaveRing) {
      this.spawnRing(x, y, splashRadiusPx, branchColor, 0.26, false);
    }
    platform.playSfx('sfx_boom');
  }

  onMultiKill(x, y, killCount, bonusSpores) {
    let fb = CONFIG.FEEDBACK.MULTIKILL_SMALL;
    let color = PALETTE.UPGRADE_LV1;
    if (killCount >= CONFIG.FEEDBACK.MULTIKILL_OVERLOAD.minKills) {
      fb = CONFIG.FEEDBACK.MULTIKILL_OVERLOAD;
      color = PALETTE.BRANCH_B;
    } else if (killCount >= CONFIG.FEEDBACK.MULTIKILL_CHAIN.minKills) {
      fb = CONFIG.FEEDBACK.MULTIKILL_CHAIN;
      color = PALETTE.BRANCH_A;
    }

    this.triggerShake(fb.shakePx, fb.shakeMs);
    this.triggerHitstop(fb.hitstopMs);
    this.spawnParticles(x, y, fb.particles, [color, PALETTE.UI_SPORE, PALETTE.UPGRADE_LV1, PALETTE.UI_TEXT], 55, 180, 0.30, 0.65, 4);
    this.spawnRing(x, y, 56, color, 0.35, false);

    if (bonusSpores > 0) {
      this.spawnFloatingText(x, y - 20, '+' + bonusSpores, PALETTE.UI_SPORE, 1.25);
    }

    if (fb.bannerKey) {
      this.showBanner(
        i18n.t(fb.bannerKey) + ' x' + killCount,
        color,
        bonusSpores > 0 ? ('+' + bonusSpores + ' ' + i18n.t('spores_label')) : '',
        1.5
      );
    }

    if (fb.fxSlowMoScale && fb.fxSlowMoMs) {
      this.fxTimeScale = fb.fxSlowMoScale;
      this.fxSlowMoTimerSec = fb.fxSlowMoMs / 1000;
    }

    if (fb.sfx) {
      platform.playSfx(fb.sfx);
    }
  }

  onSeedDamaged(x, y) {
    const fb = CONFIG.FEEDBACK.SEED_DAMAGED;
    this.triggerShake(fb.shakePx, fb.shakeMs);
    this.spawnParticles(x, y, fb.particles, [PALETTE.UI_SEED, PALETTE.ENEMY_EYE], 40, 120, 0.25, 0.50, 4);
    this.redEdgeTimerSec = fb.redEdgeFlashMs / 1000;
    platform.playSfx('sfx_hurt');
  }

  onUpgradeComplete(x, y, branchColor = PALETTE.UPGRADE_LV1) {
    const fb = CONFIG.FEEDBACK.UPGRADE_COMPLETE;
    this.spawnParticles(x, y, fb.particles, [branchColor, PALETTE.UI_SPORE, PALETTE.UI_TEXT], 35, 110, 0.25, 0.50, 4);
    if (fb.flashRing) {
      this.spawnRing(x, y, 28, branchColor, 0.32, true);
    }
    platform.playSfx('sfx_upgrade');
  }

  /**
   * 按真实帧时间更新震屏、顿帧、粒子与横幅（暂停时界面动画仍按真实时间更新）
   */
  update(realDt, isCombatActive, isPaused) {
    if (isCombatActive && !isPaused) {
      this.elapsedRealCombatSec += realDt;
    }

    // 顿帧计时（按真实时间递减）
    if (this.hitstopRemainingSec > 0 && !isPaused) {
      this.hitstopRemainingSec = Math.max(0, this.hitstopRemainingSec - realDt);
    }

    // 特效层 0.5 倍速慢放计时
    if (this.fxSlowMoTimerSec > 0 && !isPaused) {
      this.fxSlowMoTimerSec -= realDt;
      if (this.fxSlowMoTimerSec <= 0) {
        this.fxTimeScale = 1.0;
      }
    }

    // 震屏更新
    if (this.shakeTimerMs > 0 && !isPaused) {
      this.shakeTimerMs -= realDt * 1000;
      if (this.shakeTimerMs <= 0) {
        this.shakePx = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      } else {
        const angle = Math.random() * Math.PI * 2;
        this.shakeOffsetX = Math.round(Math.cos(angle) * this.shakePx);
        this.shakeOffsetY = Math.round(Math.sin(angle) * this.shakePx);
      }
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    if (this.redEdgeTimerSec > 0 && !isPaused) {
      this.redEdgeTimerSec = Math.max(0, this.redEdgeTimerSec - realDt);
    }

    if (this.banner.active && !isPaused) {
      this.banner.timer += realDt;
      if (this.banner.timer >= this.banner.duration) {
        this.banner.active = false;
      }
    }

    if (isPaused) return;

    const fxDt = realDt * this.fxTimeScale;

    // 更新粒子池
    const pList = this.particlePool.getActiveList();
    for (let i = pList.length - 1; i >= 0; i--) {
      const p = pList[i];
      p.life += fxDt;
      if (p.life >= p.maxLife) {
        this.particlePool.releaseAt(i);
        continue;
      }
      p.x += p.vx * fxDt;
      p.y += p.vy * fxDt;
      p.vy += p.gravity * fxDt;
    }

    // 更新浮动文字池
    const tList = this.textPool.getActiveList();
    for (let i = tList.length - 1; i >= 0; i--) {
      const t = tList[i];
      t.life += fxDt;
      if (t.life >= t.maxLife) {
        this.textPool.releaseAt(i);
        continue;
      }
      t.y += t.vy * fxDt;
    }

    // 更新冲击环
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life += fxDt;
      if (r.life >= r.duration) {
        this.rings.splice(i, 1);
      }
    }
  }

  /**
   * 绘制战场内特效（冲击环、粒子、伤害数字）
   */
  renderMapFx(ctx) {
    // 1. 绘制冲击环与 100% AI 手绘高清蘑菇爆裂火球爆炸
    for (let i = 0; i < this.rings.length; i++) {
      const r = this.rings[i];
      const prog = Math.min(1, r.life / r.duration);
      const curRadius = Math.max(4, r.maxRadiusPx * prog);
      const alpha = 1 - prog;

      if (!r.isUpgrade) {
        const boomImg = platform.getImage('assets/vfx/vfx_explosion.png');
        if (boomImg) {
          ctx.save();
          ctx.translate(Math.round(r.x), Math.round(r.y));
          ctx.scale(1.0, 0.78); // 贴合 45 度地面透视
          ctx.globalAlpha = Math.max(0, (1 - prog) * 0.72); // 轻柔透明孢子散开
          const dSize = curRadius * 2.2;
          ctx.drawImage(boomImg, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
          ctx.restore();
          continue;
        }
      }

      if (!drawHazardSprite(ctx, r.isUpgrade ? 'shockwave_1' : 'shockwave_0', r.x, r.y, curRadius, alpha * 0.75)) {
        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = alpha * 0.65;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(Math.round(r.x), Math.round(r.y), Math.round(curRadius), Math.round(curRadius * 0.78), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        platform.recordDrawCall(1);
      }
    }

    // 2. 绘制柔和发光孢子微粒（替代原本的生硬像素方块）
    const pList = this.particlePool.getActiveList();
    if (pList.length > 0) {
      ctx.save();
      for (let i = 0; i < pList.length; i++) {
        const p = pList[i];
        const alpha = Math.max(0.1, 1 - p.life / Math.max(0.05, p.maxLife));
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = p.color;
        const rad = (p.life > p.maxLife * 0.7 ? 1.5 : p.size * 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      platform.recordDrawCall(1);
    }

    // 3. 绘制浮动伤害与奖励数字
    const tList = this.textPool.getActiveList();
    if (tList.length > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 12px monospace, sans-serif';
      for (let i = 0; i < tList.length; i++) {
        const t = tList[i];
        const alpha = t.life > t.maxLife * 0.7 ? (1 - (t.life - t.maxLife * 0.7) / (t.maxLife * 0.3)) : 1.0;
        ctx.globalAlpha = Math.max(0, alpha);
        const rx = Math.round(t.x);
        const ry = Math.round(t.y);
        ctx.fillStyle = PALETTE.UI_PANEL_SOLID;
        ctx.fillText(t.text, rx + 1, ry + 1);
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, rx, ry);
      }
      ctx.restore();
      platform.recordDrawCall(2);
    }
  }

  /**
   * 绘制屏幕级反馈叠加层（种子受损边缘泛红 + 连锁/超载横幅）
   */
  renderScreenOverlayFx(ctx) {
    // 种子受损红边
    if (this.redEdgeTimerSec > 0) {
      const alpha = Math.min(0.55, (this.redEdgeTimerSec / 0.35) * 0.55);
      ctx.save();
      ctx.strokeStyle = PALETTE.UI_SEED;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, CONFIG.LAYOUT.MAP.WIDTH - 12, CONFIG.LAYOUT.MAP.HEIGHT - 12);
      ctx.restore();
      platform.recordDrawCall(1);
    }

    // 顶部横幅（连锁！/超载！/波次提示）：居中显示在顶部状态栏下方，不遮挡资源条与卡片栏
    if (this.banner.active) {
      const b = this.banner;
      const bx = 340;
      const by = 68;
      const bw = 280;
      const bh = b.subText ? 42 : 30;

      ctx.save();
      ctx.fillStyle = 'rgba(28, 18, 10, 0.86)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 10) : ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = b.color;
      ctx.font = 'bold 14px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.text, bx + bw * 0.5, by + (b.subText ? 14 : 15));

      if (b.subText) {
        ctx.fillStyle = PALETTE.UI_TEXT;
        ctx.font = '11px "Microsoft YaHei UI", "PingFang SC", sans-serif';
        ctx.fillText(b.subText, bx + bw * 0.5, by + 30);
      }
      ctx.restore();
      platform.recordDrawCall(2);
    }
  }
}

module.exports = FxSystem;

  };

  /* --- js/game/weather.js --- */
  __modules['js/game/weather'] = function(require, module, exports) {
/**
 * 林地生态天候与动态战场环境系统 (js/game/weather.js)
 * 深度对标《王国保卫战》《植物大战僵尸2》战场动态天候与环境机制
 * 
 * 包含四大天候形态：
 * 1. ☀️ 晨曦晴空 (Sunny): 孢子产出 +25%，英雄生命自然恢复 +50%
 * 2. 🌧️ 雷暴骤雨 (Rainstorm): 狂风骤雨，周期性召唤雷霆轰顶劈击重甲巨怪，水坑导电触电
 * 3. 🌫️ 深林迷雾 (Deep Mist): 箭塔射程 +15%，怪物获得 15% 远程攻击轻度闪避
 * 4. 🩸 狂暴血月 (Blood Moon): 虫潮狂化移速 +20%，但击杀掉落双倍黄金孢子与觉醒能量！
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

class WeatherManager {
  constructor() {
    this.currentWeather = 'sunny'; // 'sunny' | 'rain' | 'mist' | 'blood_moon'
    this.weatherTimer = 0;
    this.weatherDuration = 45.0; // 每 45 秒动态演变一次天候
    this.lightningTimer = 4.0;   // 雷暴天候雷击冷却
    this.raindrops = [];
    this.fogWisps = [];
    this.lightningFlash = 0;
    this.weatherNoticeTimer = 0;
    this.weatherNoticeText = '';

    // 初始化雨滴粒子池
    for (let i = 0; i < 90; i++) {
      this.raindrops.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        vy: 420 + Math.random() * 180,
        vx: -60 - Math.random() * 40,
        len: 12 + Math.random() * 10,
        alpha: 0.15 + Math.random() * 0.35
      });
    }

    // 初始化雾气团
    for (let i = 0; i < 8; i++) {
      this.fogWisps.push({
        x: Math.random() * 1000 - 50,
        y: Math.random() * 540,
        radius: 80 + Math.random() * 90,
        vx: 12 + Math.random() * 14,
        alpha: 0.08 + Math.random() * 0.12
      });
    }
  }

  initForMap(mapId) {
    if (mapId === 'map1') {
      this.currentWeather = 'sunny';
    } else if (mapId === 'map2') {
      this.currentWeather = 'mist';
    } else {
      this.currentWeather = 'rain';
    }
    this.weatherTimer = 0;
    this.lightningTimer = 4.0;
    this.weatherNoticeTimer = 0;
  }

  setWeather(type, fx = null) {
    if (this.currentWeather === type) return;
    this.currentWeather = type;
    this.weatherTimer = 0;
    this.weatherNoticeTimer = 3.5;

    const names = {
      sunny: '☀️ 晨曦初晴 · 丰收晨露',
      rain: '🌧️ 林地雷暴 · 雷霆轰顶',
      mist: '🌫️ 幽林浓雾 · 迷雾隐踪',
      blood_moon: '🩸 狂暴血月 · 极夜狂澜'
    };
    const subs = {
      sunny: '全场孢子产出 +25%，神圣大橡树自愈速度 +50%',
      rain: '雷霆每隔 6 秒自动天罚轰顶重型虫首，水洼导电连锁',
      mist: '瞭望菇射程 +15%，轻甲虫潮获得 15% 飘忽闪避',
      blood_moon: '虫潮移速狂增 +20%，击败敌军掉落双倍黄金孢子！'
    };

    this.weatherNoticeText = names[type] || '';
    if (fx && typeof fx.showBanner === 'function') {
      const bannerColor = type === 'blood_moon' ? '#FF4D4F' : (type === 'rain' ? '#69C0FF' : '#52C41A');
      fx.showBanner(names[type], bannerColor, subs[type], 1.8);
      platform.playSfx(type === 'rain' ? 'sfx_thunder' : (type === 'blood_moon' ? 'sfx_horn' : 'sfx_upgrade'));
    }
  }

  update(dt, enemyManager = null, towerManager = null, hero = null, fx = null) {
    this.weatherTimer += dt;
    if (this.weatherNoticeTimer > 0) {
      this.weatherNoticeTimer -= dt;
    }

    // 每到一定波次或时间自动循环天候
    if (this.weatherTimer >= this.weatherDuration) {
      this.weatherTimer = 0;
      const cycle = ['sunny', 'mist', 'rain', 'blood_moon'];
      const nextIdx = (cycle.indexOf(this.currentWeather) + 1) % cycle.length;
      this.setWeather(cycle[nextIdx], fx);
    }

    // 1. 雷暴天候：自动天罚轰顶劈击场上最强精英怪
    if (this.currentWeather === 'rain') {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 6.5 + Math.random() * 2.0;
        this.triggerNaturalLightning(enemyManager, fx);
      }
      if (this.lightningFlash > 0) {
        this.lightningFlash = Math.max(0, this.lightningFlash - dt * 3.5);
      }
    }

    // 2. 雨滴粒子物理运动
    if (this.currentWeather === 'rain') {
      for (let i = 0; i < this.raindrops.length; i++) {
        const r = this.raindrops[i];
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        if (r.y > 550 || r.x < -20) {
          r.x = Math.random() * 1000 + 40;
          r.y = -20;
        }
      }
    }

    // 3. 浓雾飘移运动
    if (this.currentWeather === 'mist') {
      for (let i = 0; i < this.fogWisps.length; i++) {
        const f = this.fogWisps[i];
        f.x += f.vx * dt;
        if (f.x > 1050) {
          f.x = -150;
          f.y = Math.random() * 540;
        }
      }
    }
  }

  triggerNaturalLightning(enemyManager, fx) {
    if (!enemyManager) return;
    const alive = enemyManager.getAliveEnemies();
    if (alive.length === 0) return;

    // 优先锁定生命最高或最靠近终点的重甲敌人
    let target = null;
    let maxThreat = -1;
    for (let i = 0; i < alive.length; i++) {
      const e = alive[i];
      if (e.state === 'death') continue;
      const score = e.hp + (e.baseArmor * 60) + (e.isBoss ? 400 : 0);
      if (score > maxThreat) {
        maxThreat = score;
        target = e;
      }
    }

    if (target) {
      this.lightningFlash = 1.0;
      platform.playSfx('sfx_thunder');
      const lightningDmg = 140;
      enemyManager.applyDamage(target, lightningDmg, false, 'magic', fx, null);

      if (fx) {
        fx.spawnFloatingText(target.x, target.y - 18, `⚡ 天罚 -${lightningDmg}!`, '#69C0FF', 1.2);
        fx.spawnParticles(target.x, target.y, 14, ['#69C0FF', '#BAE7FF', '#FFD666'], 40, 90, 0.2, 0.4, 4);
        fx.triggerScreenShake(2.5, 0.16);
      }
    }
  }

  getSporeGenerationModifier() {
    if (this.currentWeather === 'sunny') return 1.25;
    if (this.currentWeather === 'blood_moon') return 1.50;
    return 1.0;
  }

  getEnemySpeedModifier() {
    if (this.currentWeather === 'blood_moon') return 1.20;
    if (this.currentWeather === 'rain') return 0.94; // 雨天道路泥泞微减速
    return 1.0;
  }

  getTowerRangeModifier(towerType) {
    if (this.currentWeather === 'mist' && towerType === 'watch') return 1.15;
    return 1.0;
  }

  getHeroRegenModifier() {
    if (this.currentWeather === 'sunny') return 1.50;
    return 1.0;
  }

  renderWeatherEffects(ctx) {
    ctx.save();

    // 1. 阳光普照轻微暖色滤镜
    if (this.currentWeather === 'sunny') {
      ctx.fillStyle = 'rgba(255, 240, 180, 0.05)';
      ctx.fillRect(0, 0, 960, 540);
    }

    // 2. 浓雾飘浮渲染
    if (this.currentWeather === 'mist') {
      ctx.fillStyle = 'rgba(210, 230, 240, 0.08)';
      ctx.fillRect(0, 0, 960, 540);

      for (let i = 0; i < this.fogWisps.length; i++) {
        const f = this.fogWisps[i];
        const g = ctx.createRadialGradient(f.x, f.y, 10, f.x, f.y, f.radius);
        g.addColorStop(0, `rgba(220, 238, 245, ${f.alpha})`);
        g.addColorStop(1, 'rgba(220, 238, 245, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. 雷暴暴雨水线与雷光全屏闪耀
    if (this.currentWeather === 'rain') {
      // 灰暗雷暴背景
      ctx.fillStyle = 'rgba(12, 24, 38, 0.18)';
      ctx.fillRect(0, 0, 960, 540);

      // 雨丝笔刷
      ctx.strokeStyle = 'rgba(160, 210, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < this.raindrops.length; i++) {
        const r = this.raindrops[i];
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + (r.vx * 0.025), r.y + r.len);
      }
      ctx.stroke();

      // 雷光闪白瞬间
      if (this.lightningFlash > 0.02) {
        ctx.fillStyle = `rgba(220, 245, 255, ${this.lightningFlash * 0.45})`;
        ctx.fillRect(0, 0, 960, 540);
      }
    }

    // 4. 血月虫潮暗红天幕
    if (this.currentWeather === 'blood_moon') {
      const pulse = 0.12 + Math.sin(Date.now() * 0.003) * 0.04;
      ctx.fillStyle = `rgba(180, 20, 20, ${pulse})`;
      ctx.fillRect(0, 0, 960, 540);

      // 四周暗夜血光暗角
      const vig = ctx.createRadialGradient(480, 270, 240, 480, 270, 520);
      vig.addColorStop(0, 'rgba(120, 10, 10, 0)');
      vig.addColorStop(1, 'rgba(120, 10, 10, 0.45)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, 960, 540);
    }

    ctx.restore();
  }

  renderWeatherHudBadge(ctx, x, y) {
    ctx.save();
    const badges = {
      sunny: { icon: '☀️', text: '初晴 +25%经济', color: '#52C41A', border: 'rgba(115, 209, 61, 0.6)' },
      rain: { icon: '🌧️', text: '雷暴 天霆轰顶', color: '#1890FF', border: 'rgba(105, 192, 255, 0.6)' },
      mist: { icon: '🌫️', text: '浓雾 远射+15%', color: '#13C2C2', border: 'rgba(92, 219, 211, 0.6)' },
      blood_moon: { icon: '🩸', text: '血月 双倍孢子', color: '#FF4D4F', border: 'rgba(255, 120, 117, 0.8)' }
    };

    const b = badges[this.currentWeather] || badges.sunny;
    const bw = 108;
    const bh = 22;

    ctx.fillStyle = 'rgba(18, 12, 6, 0.82)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, bw, bh, 11) : ctx.rect(x, y, bw, bh);
    ctx.fill();

    ctx.strokeStyle = b.border;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${b.icon} ${b.text}`, x + bw * 0.5, y + bh * 0.5);

    ctx.restore();
  }
}

module.exports = WeatherManager;

  };

  /* --- js/game/map.js --- */
  __modules['js/game/map'] = function(require, module, exports) {
/**
 * 地图与路线系统 (js/game/map.js)
 * 管理 20x15 网格（640x480）、地面与空中航线采样、射程覆盖路程计算、三层视差背景及图块绘制
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { MAPS } = require('../data/maps');
const { MAP_ATLAS_LAYOUT } = require('../data/atlas');
const platform = require('../core/platform');
const { drawMapTile, drawSubImage } = require('../core/atlasRenderer');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

function tileCenter(col, row) {
  return {
    x: col * TILE_SIZE + TILE_SIZE * 0.5,
    y: row * TILE_SIZE + TILE_SIZE * 0.5
  };
}

/**
 * 构建折线路径对象（用于地面路线与空中航线）
 */
function buildRoutePolyline(waypoints) {
  const points = waypoints.map(([c, r]) => tileCenter(c, r));
  const segments = [];
  let totalLengthPx = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      segments.push({
        x0: p0.x,
        y0: p0.y,
        x1: p1.x,
        y1: p1.y,
        dx: dx / len,
        dy: dy / len,
        nx: -dy / len, // 法线方向，用于 ±6 像素横向出生偏移
        ny: dx / len,
        startDist: totalLengthPx,
        endDist: totalLengthPx + len,
        length: len
      });
      totalLengthPx += len;
    }
  }

  // 按 0.25 格 (8px) 步长采样路径点，用于精确计算“射程覆盖路程（格）”与路线高亮
  const sampleStepPx = TILE_SIZE * 0.25;
  const samples = [];
  for (let d = sampleStepPx * 0.5; d < totalLengthPx; d += sampleStepPx) {
    const pt = sampleRouteAtDistance({ segments, totalLengthPx }, d, 0);
    samples.push({ x: pt.x, y: pt.y, dist: d, weightTiles: 0.25 });
  }

  return {
    waypoints,
    points,
    segments,
    totalLengthPx,
    totalLengthTiles: totalLengthPx / TILE_SIZE,
    samples
  };
}

/**
 * 根据行进像素距离与横向偏移采样路径坐标与朝向切线
 */
function sampleRouteAtDistance(route, distPx, lateralOffsetPx = 0) {
  const clamped = Math.max(0, Math.min(route.totalLengthPx, distPx));
  const segs = route.segments;
  if (segs.length === 0) {
    return { x: 0, y: 0, dx: 1, dy: 0 };
  }

  let seg = segs[segs.length - 1];
  for (let i = 0; i < segs.length; i++) {
    if (clamped <= segs[i].endDist || i === segs.length - 1) {
      seg = segs[i];
      break;
    }
  }

  const localDist = clamped - seg.startDist;
  const bx = seg.x0 + seg.dx * localDist;
  const by = seg.y0 + seg.dy * localDist;

  return {
    x: bx + seg.nx * lateralOffsetPx,
    y: by + seg.ny * lateralOffsetPx,
    dx: seg.dx,
    dy: seg.dy
  };
}

class GameMap {
  constructor(mapId) {
    this.mapData = MAPS[mapId] || MAPS.map1;
    this.mapId = this.mapData.id;
    this.cols = CONFIG.LAYOUT.MAP.COLS; // 20
    this.rows = CONFIG.LAYOUT.MAP.ROWS; // 15

    this.groundRoute = buildRoutePolyline(this.mapData.groundWaypoints);
    this.groundRoute2 = (this.mapData.groundWaypoints2 && this.mapData.groundWaypoints2.length > 1)
      ? buildRoutePolyline(this.mapData.groundWaypoints2)
      : null;
    this.airRoute = buildRoutePolyline(this.mapData.airWaypoints);

    this.grid = [];
    this.initGrid();
  }

  initGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const rowArr = [];
      for (let c = 0; c < this.cols; c++) {
        // 确定性的 4 种地面变体分布
        const variant = (c * 7 + r * 13 + this.mapData.index * 3) % 4;
        rowArr.push({
          col: c,
          row: r,
          type: 'grass', // 'grass' | 'moss' | 'path' | 'obstacle' | 'warehouse' | 'spawn'
          variant,
          pathKind: 'h',
          tower: null
        });
      }
      this.grid.push(rowArr);
    }

    // 1. 标记苔地黄金放置格
    const mossList = this.mapData.mossTiles || [];
    for (let i = 0; i < mossList.length; i++) {
      const [mc, mr] = mossList[i];
      if (this.inBounds(mc, mr)) {
        this.grid[mr][mc].type = 'moss';
        this.grid[mr][mc].variant = (mc + mr) % 2;
      }
    }

    // 2. 标记障碍物格
    const obsList = this.mapData.obstacles || [];
    for (let i = 0; i < obsList.length; i++) {
      const [oc, or] = obsList[i];
      if (this.inBounds(oc, or)) {
        this.grid[or][oc].type = 'obstacle';
        this.grid[or][oc].variant = (oc * 3 + or * 5) % 4;
      }
    }

    // 3. 标记地面路径经过的所有格子（含转角判定）
    const wps = this.mapData.groundWaypoints;
    const cornerSet = new Set();
    for (let i = 1; i < wps.length - 1; i++) {
      cornerSet.add(wps[i][0] + ',' + wps[i][1]);
    }

    for (let i = 0; i < wps.length - 1; i++) {
      const [c0, r0] = wps[i];
      const [c1, r1] = wps[i + 1];
      const dc = Math.sign(c1 - c0);
      const dr = Math.sign(r1 - r0);
      let c = c0;
      let r = r0;
      while (true) {
        if (this.inBounds(c, r)) {
          this.grid[r][c].type = 'path';
          if (cornerSet.has(c + ',' + r)) {
            this.grid[r][c].pathKind = 'turn';
          } else {
            this.grid[r][c].pathKind = dc !== 0 ? 'h' : 'v';
          }
        }
        if (c === c1 && r === r1) break;
        c += dc;
        r += dr;
      }
    }

    // 4. 标记出生点与种子仓库格
    const [sc, sr] = this.mapData.spawnTile;
    if (this.inBounds(sc, sr)) {
      this.grid[sr][sc].type = 'spawn';
    }
    if (this.mapData.spawnTile2) {
      const [s2c, s2r] = this.mapData.spawnTile2;
      if (this.inBounds(s2c, s2r)) {
        this.grid[s2r][s2c].type = 'spawn';
      }
    }

    const [wc, wr] = this.mapData.warehouseTile;
    if (this.inBounds(wc, wr)) {
      this.grid[wr][wc].type = 'warehouse';
    }
  }

  inBounds(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  getTile(col, row) {
    if (!this.inBounds(col, row)) return null;
    return this.grid[row][col];
  }

  /**
   * 5.3 可建造区域判定：草地与苔地格可建造，且每格最多一座
   */
  setTileHasTower(col, row, hasTower) {
    const tile = this.getTile(col, row);
    if (tile && !hasTower) {
      tile.tower = null;
    }
  }

  canBuildAt(col, row) {
    const tile = this.getTile(col, row);
    if (!tile) return false;
    if (tile.tower) return false;
    return tile.type === 'grass' || tile.type === 'moss';
  }

  /**
   * 5.3 计算在 (col, row) 处给定射程（格）所覆盖的地面路线格数与高亮采样点
   */
  getRangeCoverage(col, row, rangeTiles, canHitGround = true, canHitAir = false) {
    const center = tileCenter(col, row);
    const radiusPx = rangeTiles * TILE_SIZE;
    const r2 = radiusPx * radiusPx;

    let coveredGroundTiles = 0;
    const coveredGroundSamples = [];
    if (canHitGround) {
      const samples = this.groundRoute.samples;
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const dx = s.x - center.x;
        const dy = s.y - center.y;
        if (dx * dx + dy * dy <= r2) {
          coveredGroundTiles += s.weightTiles;
          coveredGroundSamples.push(s);
        }
      }
      if (this.groundRoute2) {
        const samples2 = this.groundRoute2.samples;
        for (let i = 0; i < samples2.length; i++) {
          const s = samples2[i];
          const dx = s.x - center.x;
          const dy = s.y - center.y;
          if (dx * dx + dy * dy <= r2) {
            coveredGroundTiles += s.weightTiles;
            coveredGroundSamples.push(s);
          }
        }
      }
    }

    let coveredAirTiles = 0;
    const coveredAirSamples = [];
    if (canHitAir) {
      const airSamples = this.airRoute.samples;
      for (let i = 0; i < airSamples.length; i++) {
        const s = airSamples[i];
        const dx = s.x - center.x;
        const dy = s.y - center.y;
        if (dx * dx + dy * dy <= r2) {
          coveredAirTiles += s.weightTiles;
          coveredAirSamples.push(s);
        }
      }
    }

    const primaryTiles = canHitGround ? coveredGroundTiles : coveredAirTiles;

    return {
      centerX: center.x,
      centerY: center.y,
      radiusPx,
      coveredTiles: Math.round(primaryTiles * 10) / 10,
      coveredAirTiles: Math.round(coveredAirTiles * 10) / 10,
      coveredGroundSamples,
      coveredAirSamples
    };
  }

  /**
   * 绘制地图（含三层视差背景、20x15 地块、空中航线虚线、出生洞穴、种子仓库与夜光效果）
   */
  /**
   * 将静态地块层预渲染到离屏画布（每帧仅 1 次绘制调用，满足 ≤120 draw call 预算）
   */
  render(ctx, animTimeSec, currentWaveIndex = 1) {
    const atlasImg = platform.getImage(this.mapData.atlasPath);
    this.renderStatic(ctx, animTimeSec, currentWaveIndex);
    this.renderDynamic(ctx, animTimeSec, currentWaveIndex, atlasImg);
  }

  /**
   * 动态层：柔和环境微粒光晕、空中航线流动虚线、仙女环自然夜光
   */
  renderDynamic(ctx, animTimeSec, currentWaveIndex, atlasImg) {
    // 渲染全屏环境自然流淌光粒子（彻底避免矩形贴图接缝与边缘线）
    ctx.save();
    for (let i = 0; i < 16; i++) {
      const px = ((i * 67 + Math.floor(animTimeSec * 14)) % 920) - 140;
      const py = ((i * 43 - Math.floor(animTimeSec * 8)) % 500 + 500) % 500 - 20;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 238, 160, 0.35)' : 'rgba(120, 255, 175, 0.28)';
      ctx.beginPath();
      ctx.arc(px, py, i % 3 === 0 ? 3.0 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    this.renderRouteGuides(ctx, animTimeSec);
    if (this.mapData.dynamicNightLight) {
      const waveProgress = Math.min(1, (currentWaveIndex - 1) / Math.max(1, this.mapData.totalWaves - 1));
      ctx.save();
      ctx.globalAlpha = 0.08 + waveProgress * 0.24;
      ctx.fillStyle = PALETTE.BRANCH_A;
      ctx.beginPath();
      const mossList = this.mapData.mossTiles || [];
      for (let i = 0; i < mossList.length; i++) {
        const c = tileCenter(mossList[i][0], mossList[i][1]);
        ctx.moveTo(c.x + 18 + waveProgress * 14, c.y);
        ctx.arc(c.x, c.y, 18 + waveProgress * 14, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
      platform.recordDrawCall(1);
    }
  }

  renderStatic(ctx, animTimeSec, currentWaveIndex = 1) {
    const atlasPath = this.mapData.atlasPath;
    const atlasImg = platform.getImage(atlasPath);

    // 1. 优先绘制 AI 预合成的完整 16:9 全景手绘战场画卷 (960x540，无任何拼接裁切)
    if (atlasImg && MAP_ATLAS_LAYOUT.sceneBg) {
      const sb = MAP_ATLAS_LAYOUT.sceneBg;
      drawSubImage(ctx, atlasImg, sb.x, sb.y, sb.w, sb.h, -160, -30, 960, 540);
    } else {
      ctx.fillStyle = this.mapData.parallaxColors[0] || PALETTE.GROUND_DARKEST;
      ctx.fillRect(0, 0, CONFIG.LAYOUT.MAP.WIDTH, CONFIG.LAYOUT.MAP.HEIGHT);
      platform.recordDrawCall(1);

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const tile = this.grid[r][c];
          const dx = c * TILE_SIZE;
          const dy = r * TILE_SIZE;
          const groundKey = 'ground_' + tile.variant;
          if (!drawMapTile(ctx, atlasPath, groundKey, dx, dy, TILE_SIZE, TILE_SIZE)) {
            ctx.fillStyle = PALETTE.GROUND[tile.variant % 4];
            ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
          }
          if (tile.type === 'moss') {
            drawMapTile(ctx, atlasPath, 'moss_' + (tile.variant % 2), dx, dy, TILE_SIZE, TILE_SIZE);
          } else if (tile.type === 'path' || tile.type === 'spawn' || tile.type === 'warehouse') {
            drawMapTile(ctx, atlasPath, 'path_' + (tile.pathKind || 'h'), dx, dy, TILE_SIZE, TILE_SIZE);
          } else if (tile.type === 'obstacle') {
            drawMapTile(ctx, atlasPath, 'obs_' + (tile.variant % 4), dx, dy, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    // 2. 绘制高清虫巢出生洞穴与蘑菇屋种子仓库地标
    const [sc, sr] = this.mapData.spawnTile;
    const sdx = sc * TILE_SIZE;
    const sdy = sr * TILE_SIZE;
    if (atlasImg && MAP_ATLAS_LAYOUT.spawnLarge) {
      const sl = MAP_ATLAS_LAYOUT.spawnLarge;
      drawSubImage(ctx, atlasImg, sl.x, sl.y, sl.w, sl.h, sdx - 6, sdy - 14, 48, 48);
    } else if (!drawMapTile(ctx, atlasPath, 'spawn', sdx, sdy, TILE_SIZE, TILE_SIZE)) {
      ctx.fillStyle = PALETTE.ENEMY_EYE;
      ctx.fillRect(sdx + 4, sdy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    }

        // 2.1 次级出怪巢穴地穴 (Secondary Corrupted Spawner Burrow - AI 手绘奇幻地穴)
    if (this.mapData.spawnTile2) {
      const [s2c, s2r] = this.mapData.spawnTile2;
      const s2x = s2c * TILE_SIZE;
      const s2y = s2r * TILE_SIZE;
      const moundImg = platform.getImage('assets/vfx/secondary_spawner_burrow.png') || platform.getImage('assets/vfx/enemy_burrow_mound.png');
      if (moundImg && moundImg.width) {
        ctx.save();
        // 地底暗影与紫雾发光
        ctx.fillStyle = 'rgba(10, 5, 18, 0.55)';
        ctx.beginPath();
        ctx.ellipse(s2x + 16, s2y + 24, 28, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 绘制高精度手绘地穴
        ctx.drawImage(moundImg, s2x - 14, s2y - 18, 60, 48);

        // 洞穴深处猩红复眼呼吸微光
        const pulse = 0.5 + Math.sin(animTimeSec * 4) * 0.4;
        ctx.fillStyle = 'rgba(255, 77, 79, ' + (pulse * 0.9) + ')';
        ctx.shadowColor = '#FF4D4F';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(s2x + 13, s2y + 10, 2.8, 0, Math.PI * 2);
        ctx.arc(s2x + 20, s2y + 10, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = '#722ED1';
        ctx.fillRect(s2x + 4, s2y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      }
    }
if (this.mapData.spawnTile2) {
      const [s2c, s2r] = this.mapData.spawnTile2;
      const s2x = s2c * TILE_SIZE;
      const s2y = s2r * TILE_SIZE;
      const moundImg = platform.getImage('assets/vfx/enemy_burrow_mound.png');
      if (moundImg && moundImg.width) {
        ctx.save();
        ctx.drawImage(moundImg, s2x - 6, s2y - 6, 44, 36);
        const pulse = 0.5 + Math.sin(animTimeSec * 4) * 0.4;
        ctx.fillStyle = 'rgba(255, 77, 79, ' + (pulse * 0.7) + ')';
        ctx.shadowColor = '#FF4D4F';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s2x + 13, s2y + 11, 2.5, 0, Math.PI * 2);
        ctx.arc(s2x + 19, s2y + 11, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = '#722ED1';
        ctx.fillRect(s2x + 4, s2y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      }
    }

    if (this.mapData.spawnTile2) {
      const [s2c, s2r] = this.mapData.spawnTile2;
      if (this.inBounds(s2c, s2r)) {
        this.grid[s2r][s2c].type = 'spawn';
      }
    }

    const [wc, wr] = this.mapData.warehouseTile;
    const wdx = wc * TILE_SIZE;
    const wdy = wr * TILE_SIZE;
    if (atlasImg) {
      const wl = MAP_ATLAS_LAYOUT.warehouseLarge;
      drawSubImage(ctx, atlasImg, wl.x, wl.y, wl.w, wl.h, wdx - 10, wdy - 16, 52, 52);
    } else {
      ctx.fillStyle = PALETTE.UI_SEED;
      ctx.fillRect(wdx + 2, wdy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }
  }

  renderRouteGuides(ctx, animTimeSec) {
    // 空中航线：超低透明微光引导（仅 0.08 透明度，柔和微风质感，绝不突兀）
    const airPts = this.airRoute.points;
    if (airPts.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(110, 232, 255, 0.08)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 8]);
      ctx.lineDashOffset = -Math.round((animTimeSec * 16) % 12);
      ctx.beginPath();
      ctx.moveTo(airPts[0].x, airPts[0].y);
      for (let i = 1; i < airPts.length; i++) {
        ctx.lineTo(airPts[i].x, airPts[i].y);
      }
      ctx.stroke();
      ctx.restore();
      platform.recordDrawCall(1);
    }

    // 侧翼回旋暗道：幽暗紫光流动引导线
    if (this.groundRoute2 && this.groundRoute2.points.length > 1) {
      const g2Pts = this.groundRoute2.points;
      ctx.save();
      // 1. 底层微光暗紫腐化地裂发光带
      ctx.strokeStyle = 'rgba(147, 50, 230, 0.35)';
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(g2Pts[0].x, g2Pts[0].y);
      for (let i = 1; i < g2Pts.length; i++) {
        ctx.lineTo(g2Pts[i].x, g2Pts[i].y);
      }
      ctx.stroke();

      // 2. 动态爬行虚线紫晶箭痕
      ctx.strokeStyle = '#D3ADF7';
      ctx.lineWidth = 2.0;
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -Math.round((animTimeSec * 28) % 14);
      ctx.stroke();

      // 3. 沿途飘散幽紫微光粒子
      for (let p = 0; p < g2Pts.length - 1; p++) {
        const segT = (animTimeSec * 0.4 + p * 0.25) % 1.0;
        const px = g2Pts[p].x + (g2Pts[p + 1].x - g2Pts[p].x) * segT;
        const py = g2Pts[p].y + (g2Pts[p + 1].y - g2Pts[p].y) * segT;
        ctx.fillStyle = 'rgba(211, 173, 247, 0.75)';
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      platform.recordDrawCall(2);
    }
  }
}

module.exports = {
  GameMap,
  tileCenter,
  sampleRouteAtDistance
};

  };

  /* --- js/game/economy.js --- */
  __modules['js/game/economy'] = function(require, module, exports) {
/**
 * 资源与经济系统 (js/game/economy.js)
 * 严格实现 5.2 资源与经济表：种子、孢子、击杀奖励、波次完成奖励、无损奖励、提前召唤奖励、群杀奖励、60%出售返还与评星计算
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');

class EconomyManager {
  constructor(mapId) {
    this.reset(mapId);
  }

  reset(mapId) {
    this.mapId = mapId;
    this.seeds = CONFIG.ECONOMY.INITIAL_SEEDS;
    this.maxSeeds = CONFIG.ECONOMY.INITIAL_SEEDS;
    this.spores = CONFIG.ECONOMY.INITIAL_SPORES[mapId] || 300;
    this.totalEarnedSpores = this.spores;
    this.totalKills = 0;
    this.waveLeaks = 0;

    // 0.5 秒群杀滑动窗口与同帧爆炸批处理
    this.killWindow = [];
    this.clusterRewardedCount = 0;
    this.clusterTierTriggered = 0; // 0: 无, 1: 3-4只, 2: 5-9只, 3: 10+只
    this.inBatch = false;
    this.batchKills = 0;
    this.batchLastX = 320;
    this.batchLastY = 240;
  }

  canAfford(cost) {
    return this.spores >= cost;
  }

  spendSpores(cost) {
    if (this.spores < cost) return false;
    this.spores -= cost;
    return true;
  }

  addSpores(amount) {
    if (amount <= 0) return;
    this.spores += amount;
    this.totalEarnedSpores += amount;
  }

  /**
   * 敌人到达种子仓库终点：扣除威胁值
   */
  onEnemyLeak(threat) {
    const dmg = Math.max(1, threat || 1);
    this.seeds = Math.max(0, this.seeds - dmg);
    this.waveLeaks += 1;
    return this.seeds <= 0;
  }

  onWaveStart() {
    this.waveLeaks = 0;
  }

  /**
   * 5.2 提前召唤奖励：剩余备战秒数 × 1，上限 15
   */
  grantEarlyCallBonus(remainingPrepSec) {
    const raw = Math.floor(remainingPrepSec * CONFIG.ECONOMY.EARLY_CALL_PER_SEC);
    const bonus = Math.max(0, Math.min(CONFIG.ECONOMY.EARLY_CALL_MAX, raw));
    this.addSpores(bonus);
    return bonus;
  }

  /**
   * 5.2 波次完成奖励：20 + 4 × 波次序号；无损额外奖励 10
   */
  grantWaveClearReward(waveIndex) {
    const waveReward = CONFIG.ECONOMY.WAVE_CLEAR_BASE + CONFIG.ECONOMY.WAVE_CLEAR_PER_WAVE * waveIndex;
    const flawlessBonus = this.waveLeaks === 0 ? CONFIG.ECONOMY.FLAWLESS_WAVE_BONUS : 0;
    this.addSpores(waveReward + flawlessBonus);
    return {
      waveReward,
      flawlessBonus,
      total: waveReward + flawlessBonus
    };
  }

  /**
   * 5.2 出售返还：按该炮塔已投入总额（基础 + 全部升级）的 60% 计算
   */
  calculateSellRefund(totalInvested) {
    return Math.round(totalInvested * CONFIG.ECONOMY.SELL_REFUND_RATE);
  }

  /**
   * 开始同一次爆炸批处理（用于爆裂菇同帧范围结算）
   */
  beginExplosionBatch() {
    this.inBatch = true;
    this.batchKills = 0;
  }

  /**
   * 结束同一次爆炸批处理，统一结算群杀
   */
  endExplosionBatch(combatTimeSec, fx) {
    this.inBatch = false;
    if (this.batchKills > 0) {
      this.evaluateMultiKillCluster(combatTimeSec, this.batchLastX, this.batchLastY, fx);
    }
    this.batchKills = 0;
  }

  /**
   * 记录单次敌人击杀，发放基础击杀奖励并检测 0.5 秒群杀窗口
   */
  registerKill(enemy, finalDamage, combatTimeSec, fx) {
    const reward = enemy.reward || 0;
    this.addSpores(reward);
    this.totalKills += 1;

    if (fx) {
      fx.onSingleKill(enemy.x, enemy.y, finalDamage, reward, enemy.tintColor || PALETTE.UI_SPORE);
    }

    // 清理超过 0.5 秒的旧击杀记录
    const windowSec = CONFIG.ECONOMY.MULTIKILL_WINDOW_SEC;
    while (this.killWindow.length > 0 && combatTimeSec - this.killWindow[0].t > windowSec) {
      this.killWindow.shift();
    }
    if (this.killWindow.length === 0) {
      this.clusterRewardedCount = 0;
      this.clusterTierTriggered = 0;
    }

    this.killWindow.push({ t: combatTimeSec, x: enemy.x, y: enemy.y });

    if (this.inBatch) {
      this.batchKills += 1;
      this.batchLastX = enemy.x;
      this.batchLastY = enemy.y;
    } else {
      this.evaluateMultiKillCluster(combatTimeSec, enemy.x, enemy.y, fx);
    }
  }

  /**
   * 评估当前 0.5 秒窗口内的群杀数量，发放群杀奖励并触发对应档位反馈
   */
  evaluateMultiKillCluster(combatTimeSec, x, y, fx) {
    const count = this.killWindow.length;
    if (count < CONFIG.ECONOMY.MULTIKILL_MIN_COUNT) {
      return;
    }

    const targetBonus = Math.min(
      CONFIG.ECONOMY.MULTIKILL_MAX_BONUS,
      count * CONFIG.ECONOMY.MULTIKILL_PER_KILL
    );
    const deltaBonus = Math.max(0, targetBonus - this.clusterRewardedCount);
    if (deltaBonus > 0) {
      this.addSpores(deltaBonus);
      this.clusterRewardedCount = targetBonus;
    }

    let tier = 1;
    if (count >= CONFIG.FEEDBACK.MULTIKILL_OVERLOAD.minKills) {
      tier = 3;
    } else if (count >= CONFIG.FEEDBACK.MULTIKILL_CHAIN.minKills) {
      tier = 2;
    }

    if (tier > this.clusterTierTriggered || (this.inBatch === false && this.batchKills >= 3)) {
      this.clusterTierTriggered = tier;
      if (fx) {
        fx.onMultiKill(x, y, count, targetBonus);
      }
    }
  }

  /**
   * 5.8 评星判定：>=16 为 3 星，>=10 为 2 星，>=1 为 1 星
   */
  calculateStars() {
    if (this.seeds >= CONFIG.STARS.THREE_STAR_SEEDS) return 3;
    if (this.seeds >= CONFIG.STARS.TWO_STAR_SEEDS) return 2;
    if (this.seeds >= CONFIG.STARS.ONE_STAR_SEEDS) return 1;
    return 0;
  }
}

module.exports = EconomyManager;

  };

  /* --- js/game/enemy.js --- */
  __modules['js/game/enemy'] = function(require, module, exports) {
/**
 * 敌人与首领管理器 (js/game/enemy.js)
 * 使用对象池（上限 120），严格实现第七章 7.1-7.4 敌人行为、生命缩放、状态叠加与三阶段 Boss 状态机
 */

const ObjectPool = require('../core/pool');
const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { ENEMIES } = require('../data/enemies');
const { sampleRouteAtDistance } = require('./map');
const { drawEnemySprite, drawEnemyShadow, drawProjectileSprite } = require('../core/atlasRenderer');
const platform = require('../core/platform');
const i18n = require('../i18n/index');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

const ENEMY_TINTS = {
  beetle: PALETTE.ENEMY_EYE,
  swift: PALETTE.ENEMY_MOTH,
  armored: PALETTE.ENEMY_ARMORED,
  moth: PALETTE.ENEMY_MOTH,
  splitter: PALETTE.ENEMY_SPLITTER,
  larva: PALETTE.ENEMY_SPLITTER,
  weaver: '#B37FEB',
  boss_m1: PALETTE.ENEMY_EYE,
  boss_m2: PALETTE.BRANCH_A,
  boss_m3: PALETTE.ENEMY_SPLITTER
};

class EnemyManager {
  constructor() {
    this.flyingWebs = [];
    this.relicManager = null;
    this.pool = new ObjectPool(
      () => ({
        uid: 0,
        type: 'beetle',
        def: ENEMIES.beetle,
        isFlying: false,
        isBoss: false,
        isElite: false,
        eliteAffix: null,
        isBlocked: false,
        blockedBy: null,
        fromWave: true,
        hp: 40,
        maxHp: 40,
        baseSpeedTiles: 1.3,
        speedMultiplier: 1.0,
        baseArmor: 0,
        threat: 1,
        reward: 3,
        distPx: 0,
        lateralOffsetPx: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        // 状态效果
        activeSlow: 0,
        residualSlowValue: 0,
        residualSlowTimer: 0,
        slowImmune: false,
        markTimer: 0,
        armorReduction: 0,
        dotSources: [],
        // 动画与表现
        state: 'walk', // 'walk' | 'phase' | 'death'
        animTimer: 0,
        animFrame: 0,
        whiteFlashFrames: 0,
        hitArmorFrames: 0,
        deathTimer: 0,
        phaseAnimTimer: 0,
        // Boss 阶段
        bossPhase: 1,
        summonTimer: 0,
        waveIndex: 1,
        tintColor: PALETTE.ENEMY_EYE,
        atkCooldown: 0
      }),
      null,
      CONFIG.POOL_CAPS.ENEMIES
    );

    this.nextUid = 1;
  }

  clear() {
    this.pool.clear();
  }

  /**
   * 7.3 计算当前波次与地图的生命倍率
   * 当前生命倍率 = (1 + 0.10 * (波次序号 - 1)) * 地图系数
   */
  getHpMultiplier(mapId, waveIndex) {
    const mapCoeff = CONFIG.COMBAT.MAP_HP_COEFFICIENTS[mapId] || 1.0;
    return (1 + CONFIG.COMBAT.WAVE_HP_GROWTH_PER_WAVE * Math.max(0, waveIndex - 1)) * mapCoeff;
  }

  /**
   * 统计当前场上由波次直接生成的存活敌人数（用于 7.3 不超过 12 个的并发限制）
   */
  getActiveWaveEnemyCount() {
    const list = this.pool.getActiveList();
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.state !== 'death' && e.fromWave) {
        count += 1;
      }
    }
    return count;
  }

  getAliveEnemies() {
    const list = this.pool.getActiveList();
    const res = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].state !== 'death') {
        res.push(list[i]);
      }
    }
    return res;
  }

  /**
   * 生成一名敌人
   */
  spawnEnemy(type, map, waveIndex, options = {}) {
    const def = ENEMIES[type];
    if (!def) return null;

    const e = this.pool.acquire(false);
    if (!e) return null;

    const hpMul = this.getHpMultiplier(map.mapId, waveIndex);
    const maxHp = Math.max(1, Math.round(def.baseHp * hpMul));

    e.uid = this.nextUid++;
    e.type = type;
    e.def = def;
    e.isFlying = Boolean(def.isFlying);
    e.isBoss = Boolean(def.isBoss);
    e.fromWave = options.fromWave !== undefined ? options.fromWave : true;
    e.hp = maxHp;
    e.maxHp = maxHp;
    e.baseSpeedTiles = def.speed;
    e.speedMultiplier = 1.0;
    e.baseArmor = def.armor || 0;
    e.threat = def.threat || 1;
    e.reward = def.reward || 3;
    e.distPx = options.startDistPx !== undefined ? options.startDistPx : 0;
    e.lateralOffsetPx = options.lateralOffsetPx !== undefined
      ? options.lateralOffsetPx
      : ((Math.random() * 2 - 1) * CONFIG.COMBAT.SPAWN_LATERAL_OFFSET_PX);

    e.activeSlow = 0;
    e.residualSlowValue = 0;
    e.residualSlowTimer = 0;
    e.slowImmune = false;
    e.markTimer = 0;
    e.armorReduction = 0;
    e.dotSources.length = 0;

    e.state = 'walk';
    e.animTimer = 0;
    e.isBlocked = false;
    e.blockedBy = null;
    e.isElite = false;
    e.isEnraged = false;
    if (this.waveManager && this.waveManager.isEnraged) {
      e.isEnraged = true;
      e.speedMultiplier *= 1.22;
      e.reward = Math.round(e.reward * 2.0);
    }
    e.eliteAffix = null;
    if (!e.isBoss && waveIndex >= 3 && Math.random() < 0.18) {
      e.isElite = true;
      e.eliteAffix = ['swift', 'hardened', 'volatile'][Math.floor(Math.random() * 3)];
      e.maxHp = Math.round(e.maxHp * 1.4);
      e.hp = e.maxHp;
    }
    e.animFrame = 0;
    e.whiteFlashFrames = 0;
    e.hitArmorFrames = 0;
    e.deathTimer = 0;
    e.phaseAnimTimer = 0;
    e.bossPhase = 1;
    e.routeIndex = (options.routeIndex !== undefined) ? options.routeIndex : 0;
    e.isBurrower = Boolean(def.isBurrower);
    e.isLeaper = Boolean(def.isLeaper);
    e.isLeaping = false;
    e.leapProgress = 0;
    e.leapCooldown = 1.0 + Math.random() * 1.5;
    e.hasFrontShield = Boolean(def.hasFrontShield);
    e.isUnderground = Boolean(def.isBurrower);
    e.isSuicideBomber = Boolean(def.isSuicideBomber);
    e.isHealerShaman = Boolean(def.isHealerShaman);
    e.healTimer = 0;
    e.necroTimer = 0;
    e.unearthTimer = 0;
    e.summonTimer = def.phases && def.phases.phase2Summon ? def.phases.phase2Summon.interval * 0.5 : 0;
    e.waveIndex = waveIndex;
    e.tintColor = ENEMY_TINTS[type] || PALETTE.ENEMY_EYE;
    e.atkCooldown = 0.4 + Math.random() * 0.4;

    const route = e.isFlying ? map.airRoute : ((e.routeIndex === 1 && map.groundRoute2) ? map.groundRoute2 : map.groundRoute);
    const sample = sampleRouteAtDistance(route, e.distPx, e.lateralOffsetPx);
    e.x = sample.x;
    e.y = sample.y;
    e.vx = sample.dx * e.baseSpeedTiles * TILE_SIZE;
    e.vy = sample.dy * e.baseSpeedTiles * TILE_SIZE;

    return e;
  }

  /**
   * 5.5 计算敌人当前有效护甲（多个破甲来源不叠加，取最大削减值，最低 0）
   */
  getEffectiveArmor(e) {
    return Math.max(0, e.baseArmor - (e.armorReduction || 0));
  }

  /**
   * 5.5 计算敌人当前有效减速比例（多个来源取最强值，全局上限 60%，甲壳虫减半，蛾后三阶段免疫）
   */
  getEffectiveSlow(e) {
    if (e.slowImmune) return 0;
    const rawSlow = Math.max(e.activeSlow || 0, e.residualSlowTimer > 0 ? e.residualSlowValue : 0);
    const factor = e.def.slowFactor !== undefined ? e.def.slowFactor : 1.0;
    return Math.min(CONFIG.COMBAT.GLOBAL_SLOW_CAP, rawSlow * factor);
  }

  /**
   * 5.4 直接伤害与溅射伤害计算公式：
   * 原始伤害 = 基础伤害 × (1 + 增伤合计) × 暴击倍率 × 标记倍率
   * 实际伤害 = max(原始伤害 − 护甲, 原始伤害 × 20%)
   */
  applyDirectDamage(enemy, baseDamage, bonusSum, isCrit, appliesMark, combatTimeSec, map, economy, fx) {
    if (!enemy || enemy.state === 'death') return { dealt: 0, killed: false };

    // Burrower underground evasion vs unearthing
    if (enemy.isUnderground) {
      // Check if hit by explosion / earthquake shockwave / stun
      const isExplosionOrStun = (bonusSum && bonusSum > 0.8) || appliesMark;
      if (isExplosionOrStun) {
        enemy.isUnderground = false;
        enemy.unearthTimer = 1.2;
        if (fx) {
          fx.spawnFloatingText(enemy.x, enemy.y - 20, '震裂出土!', '#FAAD14', 1.2);
          fx.spawnParticles(enemy.x, enemy.y, 16, ['#8C6842', '#D48806', '#595959'], 25, 45);
        }
      } else {
        // Dodged underground
        if (fx) {
          fx.spawnFloatingText(enemy.x, enemy.y - 12, '潜地回避!', '#A89078', 0.85);
          fx.spawnParticles(enemy.x, enemy.y, 6, ['#8C6842', '#A89078'], 10, 20);
        }
        return { dealt: 0, killed: false };
      }
    }

    const critMul = isCrit ? CONFIG.COMBAT.CRIT_MULTIPLIER : 1.0;
    const markMul = enemy.markTimer > 0 ? CONFIG.COMBAT.MARK_MULTIPLIER : 1.0;
    const rawDamage = baseDamage * (1 + (bonusSum || 0)) * critMul * markMul;
    let frontShieldMul = 1.0;
    if (enemy.hasFrontShield && !isCrit) {
      frontShieldMul = 0.25; // 75% damage reduction from front
      if (fx) {
        fx.spawnFloatingText(enemy.x, enemy.y - 14, '铁壁格挡 -75%!', '#D9D9D9', 0.95);
        fx.spawnParticles(enemy.x, enemy.y, 6, ['#D9D9D9', '#FFFDF5', '#8C8C8C'], 20, 35);
      }
    }
    const effArmor = this.getEffectiveArmor(enemy);
    const actualDamage = Math.max(
      rawDamage - effArmor,
      rawDamage * CONFIG.COMBAT.MIN_ARMOR_DAMAGE_RATIO
    ) * frontShieldMul;

    // 瞭望菇 A3 命中后刷新 3 秒标记
    if (appliesMark) {
      enemy.markTimer = CONFIG.COMBAT.MARK_DURATION;
    }

    // 5.7 单体命中表现：目标白闪 2 帧
    enemy.whiteFlashFrames = CONFIG.FEEDBACK.HIT.whiteFlashFrames;
    if (enemy.type === 'armored' || enemy.baseArmor > 0) {
      enemy.hitArmorFrames = 6;
    }

    if (isCrit && fx) {
      fx.spawnFloatingText(enemy.x, enemy.y - 12, 'CRIT ' + Math.round(actualDamage), PALETTE.BRANCH_B, 1.15);
    }

    enemy.hp -= actualDamage;
    if (enemy.hp <= 0) {
      this.handleEnemyDeath(enemy, actualDamage, combatTimeSec, map, economy, fx);
      return { dealt: actualDamage, killed: true };
    }

    this.checkBossPhaseTransitions(enemy, map, fx);
    return { dealt: actualDamage, killed: false };
  }

  /**
   * 检查 Boss 二阶段 (66%) 与三阶段 (33%) 切换
   */
  checkBossPhaseTransitions(enemy, map, fx) {
    if (!enemy.isBoss || !enemy.def.phases || enemy.state === 'death') return;
    const ratio = enemy.hp / enemy.maxHp;
    const phases = enemy.def.phases;

    if (enemy.bossPhase < 2 && ratio <= phases.phase2Threshold) {
      enemy.bossPhase = 2;
      enemy.phaseAnimTimer = 0.45;
      enemy.animFrame = 0;
      if (fx) {
        fx.showBanner(i18n.t('banner_boss_phase2'), PALETTE.UPGRADE_LV1, i18n.t(enemy.def.nameKey), 1.3);
      if (phases.phase2WebBarrage && this.towerManager) {
        // 咆哮吐出双连蛛丝封印最近的 2 座防御塔
        const tws = this.towerManager.towers.filter(t => !t.isWebbed && t.dormantTimer <= 0);
        tws.sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y));
        const count = Math.min(phases.phase2WebBarrage, tws.length);
        for (let k = 0; k < count; k++) {
          this.flyingWebs.push({
            startX: enemy.x,
            startY: enemy.y - 12,
            targetX: tws[k].x,
            targetY: tws[k].y,
            targetTower: tws[k],
            curX: enemy.x,
            curY: enemy.y,
            timer: 0,
            duration: 0.45
          });
        }
        fx.triggerScreenShake(3.5, 0.35);
      }
        fx.spawnRing(enemy.x, enemy.y, 44, PALETTE.UPGRADE_LV1, 0.35, true);
      }
      // 立即执行一次阶段二召唤以增强压迫感
      this.triggerBossSummon(enemy, map, fx);
    }

    if (enemy.bossPhase < 3 && ratio <= phases.phase3Threshold) {
      enemy.bossPhase = 3;
      enemy.phaseAnimTimer = 0.45;
      enemy.animFrame = 0;
      if (phases.phase3SpeedMultiplier) {
        enemy.speedMultiplier = phases.phase3SpeedMultiplier;
      }
      if (phases.phase3Armor !== undefined) {
        enemy.baseArmor = phases.phase3Armor;
      }
      if (phases.phase3SlowImmune) {
        enemy.slowImmune = true;
      }
      if (fx) {
        fx.showBanner(i18n.t('banner_boss_phase3'), PALETTE.BRANCH_B, i18n.t(enemy.def.nameKey), 1.3);
      if (phases.phase3Earthquake) {
        fx.triggerScreenShake(5.0, 0.55);
        // 地震落石碎屑
        for (let k = 0; k < 12; k++) {
          const rx = enemy.x + (Math.random() * 2 - 1) * 60;
          const ry = enemy.y + (Math.random() * 2 - 1) * 40;
          fx.spawnParticles(rx, ry, 6, ['#5C4028', '#8C6842', '#D4B106'], 30, 80, 0.3, 0.6, 3.5);
        }
      }
        fx.spawnRing(enemy.x, enemy.y, 52, PALETTE.BRANCH_B, 0.40, true);
      }
    }
  }

  triggerBossSummon(boss, map, fx) {
    if (!boss.def.phases || !boss.def.phases.phase2Summon) return;
    const cfg = boss.def.phases.phase2Summon;
    for (let i = 0; i < cfg.count; i++) {
      const offsetDist = Math.max(0, boss.distPx + (i - (cfg.count - 1) * 0.5) * 14);
      const offsetLat = (i - 1) * 5;
      this.spawnEnemy(cfg.type, map, boss.waveIndex, {
        fromWave: false,
        startDistPx: offsetDist,
        lateralOffsetPx: offsetLat
      });
    }
    if (fx) {
      fx.spawnParticles(boss.x, boss.y, 14, [PALETTE.UPGRADE_LV1, PALETTE.UI_SPORE], 30, 95, 0.2, 0.4, 4);
    }
  }

  /**
   * 处理敌人死亡、奖励结算及分裂（裂殖虫 -> 2幼体；裂殖母体 -> 3裂殖虫）
   */

  killEnemy(enemy, fx = null, relicManager = null) {
    if (!enemy || enemy.state === 'death') return;
    const economy = this.scene ? this.scene.economy : null;
    const combatTime = this.scene ? this.scene.logicalCombatTimeSec : 0;
    const map = this.scene ? this.scene.map : null;
    this.handleEnemyDeath(enemy, enemy.maxHp, combatTime, map, economy, fx || (this.scene ? this.scene.fx : null));
  }

  handleEnemyDeath(enemy, finalDamage, combatTimeSec, map, economy, fx) {
    if (enemy.state === 'death') return;
    enemy.hp = 0;
    enemy.state = 'death';
    enemy.deathTimer = 0.24;
    enemy.animFrame = 0;
    enemy.animTimer = 0;

    if (economy) {
      economy.registerKill(enemy, finalDamage, combatTimeSec, fx);
    }

    // 7.2 裂殖虫死亡时在死亡位置生成 2 只幼体，从死亡点继续前进
    // Volatile Pod Suicide Acid Splash
    if (enemy.isSuicideBomber || enemy.type === 'volatile_pod') {
      if (fx) {
        fx.spawnShockwave(enemy.x, enemy.y, 48, '#EB2F96');
        fx.spawnParticles(enemy.x, enemy.y, 22, ['#EB2F96', '#722ED1', '#52C41A'], 35, 55);
        fx.spawnFloatingText(enemy.x, enemy.y - 20, '酸蚀自爆!', '#EB2F96', 1.2);
      }
      if (this.scene && this.scene.sporelingPatrol) {
        this.scene.sporelingPatrol.damageGuards(enemy.x, enemy.y, 48, 45);
      }
    }

    // Shaman Necromancy: reanimate fallen minion
    const aliveList = this.pool.getActiveList();
    for (let sIdx = 0; sIdx < aliveList.length; sIdx++) {
      const sh = aliveList[sIdx];
      if (sh.type === 'shaman' && sh.state !== 'death' && (sh.necroTimer || 0) <= 0) {
        if (Math.hypot(sh.x - enemy.x, sh.y - enemy.y) <= 90 && enemy.type !== 'skeletal_husk') {
          sh.necroTimer = 5.5;
          if (fx) {
            fx.spawnFloatingText(sh.x, sh.y - 22, '亡骨复生!', '#722ED1', 1.2);
            fx.spawnParticles(enemy.x, enemy.y, 16, ['#722ED1', '#B37FEB', '#D9D9D9'], 20, 35);
          }
          this.spawnEnemy('skeletal_husk', map, enemy.waveIndex, {
            fromWave: false,
            startDistPx: Math.max(0, enemy.distPx),
            lateralOffsetPx: enemy.lateralOffsetPx
          });
          break;
        }
      }
    }

    if (this.scene && typeof this.scene.onEnemyKilled === 'function') {
      this.scene.onEnemyKilled(enemy);
    }
    if (enemy.isElite && this.relicManager) {
      const rKind = ['coin', 'shield', 'lightning', 'clover'][Math.floor(Math.random() * 4)];
      this.relicManager.spawnDrop(enemy.x, enemy.y, rKind, 60);
    }
    // 击杀敌人为森林英雄累积经验值 & 精英/首领掉落灵能觉醒种子
    if (this.scene) {
      if (enemy.isElite || enemy.isBoss) {
        if (Math.random() < 0.65 || enemy.isBoss) {
          this.scene.awakeningSeeds = Math.min(5, (this.scene.awakeningSeeds || 0) + 1);
          if (this.fx) this.fx.spawnFloatingText(enemy.x, enemy.y - 22, '+1 灵能觉醒种子!', '#722ED1', 1.3);
          platform.playSfx('sfx_upgrade');
        }
      }
      if (this.scene.hero && this.scene.hero.state !== 'dead') {
        const xpGain = enemy.isBoss ? 80 : (enemy.isElite ? 35 : (enemy.def.baseHp >= 100 ? 15 : 8));
        this.scene.hero.gainXp(xpGain, this.fx);
      }
    }
    if (enemy.def.splitOnDeath) {
      const sp = enemy.def.splitOnDeath;
      for (let i = 0; i < sp.count; i++) {
        const lat = (i === 0 ? -5 : 5);
        const deltaDist = (i === 0 ? -4 : 4);
        this.spawnEnemy(sp.type, map, enemy.waveIndex, {
          fromWave: false,
          startDistPx: Math.max(0, enemy.distPx + deltaDist),
          lateralOffsetPx: lat
        });
      }
    }

    // 7.4 裂殖母体 (boss_m3) 死亡时分裂为 3 只裂殖虫
    if (enemy.isBoss && enemy.def.phases && enemy.def.phases.phase3DeathSplit) {
      const bsp = enemy.def.phases.phase3DeathSplit;
      for (let i = 0; i < bsp.count; i++) {
        const lat = (i - 1) * 6;
        const deltaDist = (i - 1) * 10;
        this.spawnEnemy(bsp.type, map, enemy.waveIndex, {
          fromWave: false,
          startDistPx: Math.max(0, enemy.distPx + deltaDist),
          lateralOffsetPx: lat
        });
      }
    }
  }

  /**
   * 固定步长更新所有敌人（移动、持续伤害结算、Boss召唤、终点漏怪判定）
   */
  update(dt, combatTimeSec, map, economy, fx, onLeakCallback, towerManager) {
    const list = this.pool.getActiveList();

    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];

      // 死亡/分裂动画播放完毕后回收到对象池
      if (e.state === 'death') {
        e.deathTimer -= dt;
        e.animTimer += dt;
        const totalDeathFrames = e.def.animFrames.death || e.def.animFrames.split || 3;
        e.animFrame = Math.min(totalDeathFrames - 1, Math.floor((1 - Math.max(0, e.deathTimer) / 0.24) * totalDeathFrames));
        if (e.deathTimer <= 0) {
          this.pool.releaseAt(i);
        }
        continue;
      }

      // 递减白闪与受击护甲帧
      if (e.whiteFlashFrames > 0) {
        e.whiteFlashFrames -= 1;
      }
      if (e.hitArmorFrames > 0) {
        e.hitArmorFrames -= 1;
      }

      // 递减标记与残留减速计时
      if (e.markTimer > 0) {
        e.markTimer = Math.max(0, e.markTimer - dt);
      }
      // Shaman heal tick
      if (e.type === 'shaman' && e.state === 'walk') {
        e.healTimer = (e.healTimer || 0) + dt;
        e.necroTimer = Math.max(0, (e.necroTimer || 0) - dt);
        if (e.healTimer >= 3.2) {
          e.healTimer = 0;
          let healedAny = false;
          for (let oi = 0; oi < list.length; oi++) {
            const oe = list[oi];
            if (oe !== e && oe.state === 'walk' && Math.hypot(oe.x - e.x, oe.y - e.y) <= 85) {
              if (oe.hp < oe.maxHp) {
                oe.hp = Math.min(oe.maxHp, oe.hp + 40);
                healedAny = true;
              }
            }
          }
          if (healedAny && fx) {
            fx.spawnFloatingText(e.x, e.y - 20, '暗愈光环 +40', '#52C41A', 1.0);
            fx.spawnShockwave(e.x, e.y, 85, '#52C41A');
          }
        }
      }

      if (e.unearthTimer > 0) {
        e.unearthTimer = Math.max(0, e.unearthTimer - dt);
      }

      if (e.residualSlowTimer > 0) {
        e.residualSlowTimer = Math.max(0, e.residualSlowTimer - dt);
      }

      // 5.4 & 5.5 结算持续伤害（雾团、灼烧区）：不暴击、不吃标记，受护甲影响，最多叠加 3 个来源
      if (e.dotSources.length > 0) {
        if (e.dotSources.length > CONFIG.COMBAT.MAX_DOT_SOURCES) {
          e.dotSources.sort((a, b) => b - a);
        }
        const count = Math.min(CONFIG.COMBAT.MAX_DOT_SOURCES, e.dotSources.length);
        const effArmor = this.getEffectiveArmor(e);
        let totalDps = 0;
        for (let k = 0; k < count; k++) {
          const srcDps = e.dotSources[k];
          const actualDps = Math.max(srcDps - effArmor, srcDps * CONFIG.COMBAT.MIN_ARMOR_DAMAGE_RATIO);
          totalDps += actualDps;
        }
        e.hp -= totalDps * dt;
        e.dotSources.length = 0;

        if (e.hp <= 0) {
          this.handleEnemyDeath(e, totalDps, combatTimeSec, map, economy, fx);
          continue;
        }
        this.checkBossPhaseTransitions(e, map, fx);
      }

      // Boss 二阶段定时召唤
      if (e.isBoss && e.bossPhase >= 2 && e.def.phases && e.def.phases.phase2Summon) {
        e.summonTimer += dt;
        if (e.summonTimer >= e.def.phases.phase2Summon.interval) {
          e.summonTimer = 0;
          this.triggerBossSummon(e, map, fx);
        }
      }

      // Boss 阶段切换过渡动画
      if (e.phaseAnimTimer > 0) {
        e.phaseAnimTimer -= dt;
        e.animTimer += dt;
        if (e.animTimer >= 0.1) {
          e.animTimer = 0;
          e.animFrame = (e.animFrame + 1) % 4;
        }
      } else {
        // 正常行走/飞行动画帧推进
        e.animTimer += dt;
        if (e.animTimer >= 0.14) {
          e.animTimer = 0;
          e.animFrame = (e.animFrame + 1) % (e.def.animFrames.walk || 4);
        }
      }

      // 计算当前实际移动速度
      const effSlow = this.getEffectiveSlow(e);
      const speedTilesPerSec = e.baseSpeedTiles * e.speedMultiplier * (1 - effSlow);
      const speedPxPerSec = speedTilesPerSec * TILE_SIZE;

      // 敌人主动攻击附近的蘑菇防御塔（近战撕咬 / 远程喷毒）
      if (!e.atkCooldown) e.atkCooldown = 0.5 + Math.random() * 0.5;
      if (e.atkCooldown > 0) e.atkCooldown -= dt;

      let attackingTower = null;
      if (towerManager && towerManager.towers && towerManager.towers.length > 0) {
        const isMoth = e.type === 'moth';
        const atkRange = isMoth ? 130 : 42; // 飞蛾远程 130px，地面甲虫近战 42px
        const atkInterval = isMoth ? 1.8 : 1.2;
        const atkDamage = isMoth ? 14 : (e.type === 'armored' ? 24 : 14);

        let bestTower = null;
        let bestScore = 999999;
        for (let tIdx = 0; tIdx < towerManager.towers.length; tIdx++) {
          const tw = towerManager.towers[tIdx];
          if (tw.dormantTimer > 0) continue; // 忽略已休眠枯萎的塔
          const d = Math.hypot(tw.x - e.x, tw.y - e.y);
          if (d <= atkRange) {
            // 甜美孢子气味：虫群优先啃食后排灵光太阳蘑菇！
            let score = d - (tw.typeId === 'lumina' ? 1000 : 0);
            if (score < bestScore) {
              bestScore = score;
              bestTower = tw;
            }
          }
        }
        if (bestTower) {
          attackingTower = bestTower;
          if (e.atkCooldown <= 0) {
            e.atkCooldown = atkInterval;
            towerManager.damageTower(bestTower, atkDamage, e, fx);
            if (isMoth) {
              bestTower.poisonTimer = 3.0;
            }
            if (fx) {
              fx.spawnParticles(bestTower.x, bestTower.y - 6, 4, [e.tintColor, '#FF7875'], 20, 50, 0.15, 0.25, 3);
            }
          }
        }
      }

      // 如果正在近战啃食，敌人停下移动；如果是远程飞蛾，减速 50% 移动
      // Leaper leaping jump mechanics (跳跃刺客飞跃阻挡)
      if (e.isLeaper && e.state === 'walk') {
        if (e.isLeaping) {
          e.leapProgress += dt / 0.42; // 0.42s flight time
          // Advance rapidly forward along path during leap
          e.distPx += (e.def.leapDistancePx || 92) * (dt / 0.42);

          if (e.leapProgress >= 1.0) {
            e.isLeaping = false;
            e.leapProgress = 0;
            e.leapCooldown = e.def.leapCooldown || 4.5;
            if (fx) {
              fx.spawnFloatingText(e.x, e.y - 16, '飞跃落地!', '#73D13D', 1.0);
              if (fx.spawnShockwave) fx.spawnShockwave(e.x, e.y, 22, '#52C41A');
            }
            platform.playSfx('sfx_thorn');
          }
        } else {
          e.leapCooldown = Math.max(0, e.leapCooldown - dt);
          // If guard is near or blocking: leap over!
          const shouldLeap = (e.isBlocked && e.blockedBy) || (e.leapCooldown <= 0 && Math.random() < 0.05);
          if (shouldLeap && e.leapCooldown <= 0) {
            e.isLeaping = true;
            e.leapProgress = 0;
            if (e.isBlocked && e.blockedBy) {
              e.blockedBy.blockedEnemy = null;
              e.isBlocked = false;
              e.blockedBy = null;
            }
            if (fx) {
              fx.spawnFloatingText(e.x, e.y - 18, '蓄力飞跃!', '#FAAD14', 1.15);
              fx.spawnParticles(e.x, e.y, 8, ['#52C41A', '#FAAD14'], 15, 30);
            }
            platform.playSfx('sfx_shoot');
          }
        }
      }

      const isMeleeAttacking = attackingTower && e.type !== 'moth';
      const isBlockedByGuard = e.isBlocked && e.blockedBy && e.blockedBy.state !== 'dead';
      const moveSlow = (isMeleeAttacking || isBlockedByGuard) ? 0 : (attackingTower ? 0.5 : 1.0);
      e.distPx += speedPxPerSec * dt * moveSlow;

      // 特种敌人（织网蛛 / 毒蛾）吐丝技能
      if (e.def.webCooldown && towerManager && towerManager.towers && towerManager.towers.length > 0) {
        if (!e.webCooldownTimer) e.webCooldownTimer = e.def.webCooldown * (0.3 + Math.random() * 0.4);
        e.webCooldownTimer -= dt;
        if (e.webCooldownTimer <= 0) {
          const webRangePx = (e.def.webRangeTiles || 4.5) * TILE_SIZE;
          let targetTower = null;
          let minD = webRangePx;
          for (let tI = 0; tI < towerManager.towers.length; tI++) {
            const tw = towerManager.towers[tI];
            if (tw.isWebbed || tw.dormantTimer > 0) continue;
            const dist = Math.hypot(tw.x - e.x, tw.y - e.y);
            // 织丝蛛优先向后排生产太阳蘑菇发射禁锢蛛网
            const score = dist - (tw.typeId === 'lumina' ? 400 : 0);
            if (score < minD) {
              minD = score;
              targetTower = tw;
            }
          }
          if (targetTower) {
            e.webCooldownTimer = e.def.webCooldown + Math.random() * 2.5;
            this.flyingWebs.push({
              startX: e.x,
              startY: e.y,
              targetX: targetTower.x,
              targetY: targetTower.y,
              targetTower: targetTower,
              curX: e.x,
              curY: e.y,
              timer: 0,
              duration: 0.38
            });
            if (fx) {
              fx.spawnParticles(e.x, e.y, 6, ['#BAE7FF', '#FFFFFF'], 15, 40, 0.15, 0.3, 2);
            }
          }
        }
      }


      // 重置本步瞬时雾团效果（下步由子弹/雾团系统重新注入）
      e.activeSlow = 0;
      e.armorReduction = 0;

      const route = e.isFlying ? map.airRoute : ((e.routeIndex === 1 && map.groundRoute2) ? map.groundRoute2 : map.groundRoute);
      if (e.distPx >= route.totalLengthPx) {
        // 抵达终点种子仓库：扣除威胁值并移除
        const sampleEnd = sampleRouteAtDistance(route, route.totalLengthPx, 0);
        if (fx) {
          fx.onSeedDamaged(sampleEnd.x, sampleEnd.y);
        }
        const defeated = economy ? economy.onEnemyLeak(e.threat) : false;
        this.pool.releaseAt(i);
        if (onLeakCallback) {
          onLeakCallback(defeated);
        }
        continue;
      }

      const sample = sampleRouteAtDistance(route, e.distPx, e.lateralOffsetPx);
      e.x = sample.x;
      e.y = sample.y;
      e.vx = sample.dx * speedPxPerSec;
      e.vy = sample.dy * speedPxPerSec;
    }
  }

  /**
   * 预测敌人在 futureSec 秒后的位置（供瞭望菇、尖刺菇、爆裂菇预判瞄准使用）
   */
  predictEnemyPosition(enemy, futureSec, map) {
    if (!enemy) return { x: 0, y: 0 };
    const route = enemy.isFlying ? map.airRoute : ((enemy.routeIndex === 1 && map.groundRoute2) ? map.groundRoute2 : map.groundRoute);
    const effSlow = this.getEffectiveSlow(enemy);
    const speedPxPerSec = enemy.baseSpeedTiles * enemy.speedMultiplier * (1 - effSlow) * TILE_SIZE;
    const targetDist = Math.min(route.totalLengthPx, enemy.distPx + speedPxPerSec * futureSec);
    return sampleRouteAtDistance(route, targetDist, enemy.lateralOffsetPx);
  }

  /**
   * 绘制所有敌人（先绘制地面敌人，再绘制飞行敌人影子与本体，最后绘制生命条与状态图标）
   */
  handleClickOnEnemy(mx, my, fx) {
    const alive = this.getAliveEnemies();
    for (let i = alive.length - 1; i >= 0; i--) {
      const e = alive[i];
      const dist = Math.hypot(mx - e.x, my - e.y);
      if (dist <= 26) {
        // A. Burrower Underground Stomp
        if (e.isUnderground) {
          e.stompClicks = (e.stompClicks || 0) + 1;
          if (e.stompClicks >= 2) {
            e.isUnderground = false;
            e.unearthTimer = 1.5;
            if (fx) {
              fx.spawnFloatingText(e.x, e.y - 20, '震裂出土!', '#FAAD14', 1.3);
              fx.spawnParticles(e.x, e.y, 18, ['#8C6842', '#D48806'], 30, 50);
            }
            platform.playSfx('sfx_thorn');
          } else {
            if (fx) {
              fx.spawnFloatingText(e.x, e.y - 12, '重踩土丘!', '#FFE58F', 0.9);
              fx.spawnParticles(e.x, e.y, 8, ['#8C6842'], 15, 25);
            }
            platform.playSfx('sfx_click');
          }
          return true;
        }

        // B. Volatile Pod Click-Defuse (PvZ style click intervention)
        if (e.type === 'volatile_pod' && !e.isDefused) {
          e.isDefused = true;
          e.hp -= 35;
          if (fx) {
            fx.spawnFloatingText(e.x, e.y - 20, '刺破毒囊!', '#52C41A', 1.25);
            fx.spawnParticles(e.x, e.y, 14, ['#52C41A', '#B7EB8F'], 20, 35);
          }
          platform.playSfx('sfx_click');
          return true;
        }
      }
    }
    return false;
  }

  render(ctx) {

    // 绘制空中飞行的发光蛛丝飞弹
    for (let i = 0; i < this.flyingWebs.length; i++) {
      const w = this.flyingWebs[i];
      ctx.save();
      ctx.strokeStyle = 'rgba(230, 245, 255, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(w.startX, w.startY);
      ctx.quadraticCurveTo((w.startX + w.targetX) * 0.5, (w.startY + w.targetY) * 0.5 - 25, w.curX, w.curY);
      ctx.stroke();

      // 蛛丝飞弹前端
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(w.curX, w.curY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const list = this.pool.getActiveList();
    if (list.length === 0) return;

    // 1. 地面敌人
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e.isFlying) {
        this.renderSingleEnemy(ctx, e);
      }
    }

    // 2. 飞行敌人（先绘制独立影子，再绘制空中本体）
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.isFlying) {
        const shadowOffset = e.def.shadowOffsetPx || 14;
        if (!drawEnemyShadow(ctx, e.type, e.x, e.y, shadowOffset)) {
          ctx.fillStyle = 'rgba(20, 33, 61, 0.45)';
          ctx.fillRect(Math.round(e.x - 8), Math.round(e.y + shadowOffset - 3), 16, 6);
        }
        this.renderSingleEnemy(ctx, e);
      }
    }
  }

  renderSingleEnemy(ctx, e) {
    let animState = 'walk';
    if (e.state === 'death') {
      animState = 'death';
    } else if (e.phaseAnimTimer > 0) {
      animState = 'phase';
    } else if (e.hitArmorFrames > 0 && e.def.animFrames.hitArmor) {
      animState = 'hitArmor';
    }

    const flashWhite = e.whiteFlashFrames > 0;
    if (e.isEnraged && e.state !== 'death') {
      ctx.save();
      ctx.fillStyle = '#FF4D4F';
      ctx.shadowColor = '#FF4D4F';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(e.x - 3, e.y - 4, 1.5, 0, Math.PI * 2);
      ctx.arc(e.x + 3, e.y - 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // 100% AI Hand-Painted Tactical Enemies Rendering
    let customImgPath = null;
    let jumpOffsetY = 0;
    if (e.isLeaper && e.isLeaping) {
      // Mid-air height arc: 36px high peak
      jumpOffsetY = Math.sin(e.leapProgress * Math.PI) * 36;
      // Draw ground shadow beneath jumping leaper
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + 3, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    let customW = 32, customH = 32;

    if (e.isUnderground) {
      // 潜地土丘
      ctx.save();
      const wobble = Math.sin(e.animTimer * 18) * 1.5;
      const moundImg = platform.getImage('assets/vfx/enemy_burrow_mound.png');
      if (moundImg && moundImg.width) {
        ctx.drawImage(moundImg, e.x - 18 + wobble, e.y - 12, 36, 26);
      } else {
        ctx.fillStyle = '#8C6842';
        ctx.beginPath();
        ctx.ellipse(e.x + wobble, e.y + 4, 14, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    } else if (e.type === 'burrower') {
      customImgPath = 'assets/vfx/enemy_burrower.png';
      customW = 38; customH = 32;
    } else if (e.type === 'volatile_pod') {
      customImgPath = 'assets/vfx/enemy_volatile_pod.png';
      customW = 32; customH = 34;
    } else if (e.type === 'shaman') {
      customImgPath = 'assets/vfx/enemy_shaman.png';
      customW = 38; customH = 36;
    } else if (e.type === 'skeletal_husk') {
      customImgPath = 'assets/vfx/enemy_skeletal_husk.png';
      customW = 30; customH = 30;
    } else if (e.type === 'leaper') {
      customImgPath = e.isLeaping ? 'assets/vfx/enemy_leaper_jump.png' : 'assets/vfx/enemy_leaper.png';
      customW = e.isLeaping ? 40 : 36;
      customH = e.isLeaping ? 40 : 32;
    } else if (e.type === 'siege_beetle') {
      customImgPath = 'assets/vfx/enemy_siege_beetle.png';
      customW = 44; customH = 42;
    } else if (e.type === 'weaver') {
      customImgPath = 'assets/vfx/enemy_weaver.png';
      customW = 38; customH = 34;
    }

    if (customImgPath) {
      const cImg = platform.getImage(customImgPath);
      if (cImg && cImg.width) {
        ctx.save();
        const walkBob = Math.sin(e.animTimer * 10) * 1.5;
        if (flashWhite) {
          ctx.filter = 'brightness(1.4)';
        }
        ctx.drawImage(cImg, e.x - customW * 0.5, e.y - customH * 0.5 - walkBob - jumpOffsetY, customW, customH);
        ctx.restore();

        // 受击火花星芒 (100% AI Hand-Painted Hit Spark)
        if (flashWhite) {
          const sparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
          if (sparkImg && sparkImg.width) {
            ctx.save();
            ctx.drawImage(sparkImg, e.x - 16, e.y - 16 - walkBob, 32, 32);
            ctx.restore();
          }
        }
        return;
      }
    }

    // 普通图集怪物受击：保留本体立绘，辅以明亮微光，杜绝纯白剪影失真
    const drawn = drawEnemySprite(ctx, e.type, animState, e.animFrame, e.x, e.y, false);
    if (!drawn) {
      const sz = (e.def.artSize.width || 12) * 2;
      ctx.fillStyle = e.tintColor;
      ctx.fillRect(Math.round(e.x - sz * 0.5), Math.round(e.y - sz * 0.5), sz, sz);
      platform.recordDrawCall(1);
    }

    // 命中火花迸发
    if (flashWhite) {
      const sparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
      if (sparkImg && sparkImg.width) {
        ctx.save();
        ctx.drawImage(sparkImg, e.x - 16, e.y - 16, 32, 32);
        ctx.restore();
      }
    }

    if (e.isElite && e.state !== 'death') {
      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      const cy = e.y - (e.def.artSize.height || 12) - 14;
      ctx.beginPath();
      ctx.moveTo(e.x - 5, cy);
      ctx.lineTo(e.x - 3, cy - 4);
      ctx.lineTo(e.x, cy - 1);
      ctx.lineTo(e.x + 3, cy - 4);
      ctx.lineTo(e.x + 5, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if (e.state === 'death') return;

    // 头部状态图标（标记、破甲、减速）
    const topY = e.y - e.def.artSize.height - 8;
    if (e.markTimer > 0) {
      const mKey = (Math.floor(e.markTimer * 6) % 2 === 0) ? 'mark_icon_0' : 'mark_icon_1';
      drawProjectileSprite(ctx, mKey, e.x, topY - 8, 0, 0.65);
    } else if (e.armorReduction > 0) {
      drawProjectileSprite(ctx, 'armor_break_icon', e.x, topY - 8, 0, 0.6);
    }

    // 受到伤害后显示精致微缩血条 (Refined Fantasy Micro Health Bar)
    if (e.hp < e.maxHp || e.isBoss) {
      const barW = e.isBoss ? 46 : 24;
      const barH = e.isBoss ? 5 : 3.5;
      const bx = Math.round(e.x - barW * 0.5);
      const by = Math.round(topY);
      const ratio = Math.max(0, Math.min(1, e.hp / e.maxHp));

      ctx.save();
      // 1. 微黑木纹托底与轻微圆角
      ctx.fillStyle = 'rgba(18, 12, 6, 0.85)';
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);

      // 2. 动态血量渐变填充 (绿 -> 橙 -> 红)
      if (ratio > 0) {
        const fillW = Math.max(2, Math.round(barW * ratio));
        let hpColor = '#52C41A';
        if (ratio < 0.28) hpColor = '#FF4D4F';
        else if (ratio < 0.58) hpColor = '#FAAD14';

        if (e.isBoss) hpColor = '#FA8C16';
        else if (e.isFlying) hpColor = '#13C2C2';

        ctx.fillStyle = hpColor;
        ctx.fillRect(bx, by, fillW, barH);
      }
      ctx.restore();
      platform.recordDrawCall(1);
    }
  }
}

module.exports = EnemyManager;

  };

  /* --- js/game/hero.js --- */
  __modules['js/game/hero'] = function(require, module, exports) {
/**
 * 奇幻森林守护巨木神树英雄系统 (js/game/hero.js)
 * 深度对标《王国保卫战》(Kingdom Rush) 英雄微操、战术姿态与天赋树系统：
 * 
 * 1. 【战术三姿态体系】(Tactical Stances)：
 *    - 🛡️ 守卫姿态 (Guardian Stance): 护甲减免 +35%，最多阻挡 3 名敌军，每秒自然回春愈合 4% 生命
 *    - ⚔️ 狂暴姿态 (Aggressive Stance): 攻速 +30%，挥砍伤害 +35%，普通攻击暴击率 +25%
 *    - 🏹 游侠姿态 (Scout Stance): 移动速度 +45%，索敌射程扩至 180px 并投掷荆棘飞刺进行远程游击
 * 
 * 2. 【四阶专属天赋树】(Talent Tree Branches)：
 *    - Lv.2 尖刺重甲 (Thorns Armor): 受到敌人物理近战攻击时，反弹 45% 割裂物理创伤
 *    - Lv.3 狂风顺劈 (Whirlwind Cleave): 近战普通攻击升级为 65px 范围全周顺劈斩，重创周围所有敌人
 *    - Lv.4 灵脉共鸣 (Leyline Resonance): 大招「大地轰鸣」冷却缩减至 14 秒，震波范围与击晕时长扩增 35%
 *    - Lv.5 不灭战魂 (Undying Will): 受到致命创伤时触发锁血神迹，免疫死亡 4 秒并进入 100% 暴击狂化
 * 
 * 3. 100% AI 手绘高精美术资产接入：
 *    - 英雄本体立绘: assets/vfx/hero_oak.png
 *    - 翡翠月牙剑气: assets/vfx/vfx_hero_slash.png
 *    - 命中暴击星芒: assets/vfx/vfx_hit_spark.png
 *    - 远程荆棘飞刺: assets/vfx/proj_watch_arrow.png
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

class ForestHero {
  constructor(map = null) {
    this.map = map;
    // 初始位置设定在核心防线要冲
    this.x = 280;
    this.y = 230;
    this.targetX = this.x;
    this.targetY = this.y;
    
    // 基础属性与成长
    this.level = 1;
    this.maxLevel = 5;
    this.xp = 0;
    this.xpToNext = 100;
    this.baseMaxHp = 520;
    this.maxHp = this.baseMaxHp;
    this.hp = this.maxHp;
    this.baseAtk = 42;
    this.atkDamage = this.baseAtk;
    this.speed = 110;
    this.atkRange = 46;
    this.atkInterval = 1.05;
    this.atkCooldown = 0;
    
    // 动作与状态机
    this.state = 'idle'; // 'idle' | 'walk' | 'attack' | 'skill' | 'dead'
    this.animTimer = 0;
    this.facingLeft = false;
    
    // 主动大招：大地裂地斩
    this.maxSkillCooldown = 22.0;
    this.skillCooldown = 0; // 初始立即可用
    this.isCastingSkill = false;
    this.skillCastTimer = 0;
    
    // 阵亡与复活
    this.reviveTimeTotal = 14.0;
    this.reviveTimer = 0;
    
    // 阻挡与攻击目标
    this.blockedEnemies = [];
    this.targetEnemy = null;
    
    // 旗帜标记特效
    this.rallyMarkerTimer = 0;
    this.levelUpGlowTimer = 0;
    this.isSelected = false;

    // 经典战术三姿态体系 (Kingdom Rush Stance Micro)
    this.stance = 'guardian'; // 'guardian' | 'aggressive' | 'scout'
    this.stanceSwitchedCount = 0;
    this.regenTimer = 0;
    this.undyingTimer = 0;
    this.undyingUsed = false;
    this.scoutTrapTimer = 0;
    this.rangedThornCooldown = 0;
    
    // 天赋树加点分支
    this.talents = {
      thornsArmor: false,     // Lv.2 尖刺重甲：受到近战攻击反弹 45% 割裂物理创伤
      whirlwindCleave: false, // Lv.3 狂风顺劈：普通攻击造成范围顺劈并波及周围全部敌怪
      leylineResonance: false,// Lv.4 灵脉共鸣：大招冷却缩减至 14 秒，震波范围扩增 35%
      undyingWill: false      // Lv.5 不灭战魂：受到致命创伤时锁血 4 秒并狂化暴击
    };

    // 飞刺投射物队列（游侠姿态远程射击）
    this.activeThornProjectiles = [];
  }

  /**
   * 切换战术战斗姿态
   * @param {'guardian' | 'aggressive' | 'scout'} newStance 
   */
  setStance(newStance, fx = null) {
    if (this.state === 'dead' || this.stance === newStance) return;
    this.stance = newStance;
    this.stanceSwitchedCount++;

    if (newStance === 'guardian') {
      this.speed = 100;
      platform.playSfx('sfx_place');
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 32, '【守卫姿态】磐石坚壁·回春愈合', '#40A9FF', 1.4);
        fx.spawnParticles(this.x, this.y, 22, ['#40A9FF', '#91D5FF', '#BAE7FF', '#FFFFFF'], 30, 85, 0.3, 0.65, 4);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 45, '#40A9FF');
      }
    } else if (newStance === 'aggressive') {
      this.speed = 130;
      platform.playSfx('sfx_hit');
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 32, '【狂暴姿态】攻速+30%·伤害+35%', '#FF4D4F', 1.4);
        fx.spawnParticles(this.x, this.y, 24, ['#FF4D4F', '#FFA39E', '#FF7875', '#FFD700'], 35, 95, 0.35, 0.7, 4.5);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 50, '#FF4D4F');
      }
    } else if (newStance === 'scout') {
      this.speed = 165;
      platform.playSfx('sfx_upgrade');
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 32, '【游侠姿态】神行疾速·荆棘飞刺', '#52C41A', 1.4);
        fx.spawnParticles(this.x, this.y, 22, ['#52C41A', '#95DE64', '#B7EB8F', '#FFE58F'], 35, 100, 0.3, 0.6, 4);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 45, '#52C41A');
      }
    }
  }

  /**
   * 循环切换战斗姿态 (Z 快捷键 / 按钮点击)
   */
  cycleStance(fx = null) {
    const stances = ['guardian', 'aggressive', 'scout'];
    const curIdx = stances.indexOf(this.stance);
    const nextStance = stances[(curIdx + 1) % stances.length];
    this.setStance(nextStance, fx);
    return nextStance;
  }

  /**
   * 指挥英雄移动到指定坐标
   */
  moveTo(x, y, fx = null) {
    if (this.state === 'dead') return;
    this.targetX = Math.max(24, Math.min(936, x));
    this.targetY = Math.max(24, Math.min(516, y));
    this.state = 'walk';
    this.rallyMarkerTimer = 1.2;
    this.unblockAll();

    platform.playSfx('sfx_place');
    if (fx) {
      fx.spawnFloatingText(this.targetX, this.targetY - 18, '集结驻守!', '#FFE58F', 0.9);
      if (fx.spawnRing) fx.spawnRing(this.targetX, this.targetY, 28, '#FFE58F', 0.35, true);
    }
  }

  unblockAll() {
    for (let i = 0; i < this.blockedEnemies.length; i++) {
      const e = this.blockedEnemies[i];
      if (e && e.isBlocked && e.blockedBy === this) {
        e.isBlocked = false;
        e.blockedBy = null;
      }
    }
    this.blockedEnemies = [];
  }

  gainXp(amount, fx = null) {
    if (this.level >= this.maxLevel) return;
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.levelUp(fx);
    }
  }

  levelUp(fx = null) {
    if (this.level >= this.maxLevel) return;
    this.level += 1;
    this.xp -= this.xpToNext;
    this.xpToNext = Math.round(this.xpToNext * 1.45);
    
    // 属性飞跃成长
    this.baseMaxHp = 520 + (this.level - 1) * 95;
    this.maxHp = this.baseMaxHp;
    this.hp = this.maxHp; // 升级瞬间回满生命！
    this.baseAtk = 42 + (this.level - 1) * 16;
    this.atkDamage = this.baseAtk;
    this.levelUpGlowTimer = 2.5;

    // 天赋树阶段解锁
    let talentNotice = '';
    if (this.level === 2) {
      this.talents.thornsArmor = true;
      talentNotice = '解锁天赋【尖刺重甲】受到近战伤害反弹 45% 割裂物理创伤！';
    } else if (this.level === 3) {
      this.talents.whirlwindCleave = true;
      talentNotice = '解锁天赋【狂风顺劈】普通攻击升级为范围顺劈！';
    } else if (this.level === 4) {
      this.talents.leylineResonance = true;
      this.maxSkillCooldown = 14.0;
      talentNotice = '解锁天赋【灵脉共鸣】大招冷却缩至 14 秒，震波扩增 35%！';
    } else if (this.level === 5) {
      this.talents.undyingWill = true;
      talentNotice = '解锁奥义【不灭战魂】致命伤害锁血 4 秒并暴走狂化！';
    }

    platform.playSfx('sfx_upgrade');
    if (fx) {
      fx.spawnFloatingText(this.x, this.y - 36, `英雄进阶! Lv.${this.level}`, '#FFD700', 1.6);
      if (talentNotice) {
        fx.showBanner(`🌳 英雄升至 Lv.${this.level}`, '#FFD700', talentNotice, 2.2);
      }
      fx.spawnParticles(this.x, this.y, 36, ['#FFD700', '#52C41A', '#FFFFFF', '#FFA940'], 45, 130, 0.4, 0.85, 5);
      if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 60, '#FFD700');
    }
  }

  takeDamage(amount, enemy = null, fx = null, enemyManager = null) {
    if (this.state === 'dead') return;

    // 不灭战魂锁血期间完全免死
    if (this.undyingTimer > 0) {
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 20, 'IMMUNE!', '#FFD700', 0.6);
      }
      return;
    }

    // 守卫姿态天然 35% 坚韧硬甲减伤，狂暴姿态承伤 +15%
    let finalDamage = amount;
    if (this.stance === 'guardian') {
      finalDamage = Math.max(1, Math.round(amount * 0.65));
    } else if (this.stance === 'aggressive') {
      finalDamage = Math.round(amount * 1.15);
    }

    // 天赋 1：尖刺重甲近战创伤反弹 45%
    if (this.talents.thornsArmor && enemy && enemyManager && enemy.state !== 'death') {
      const reflectDmg = Math.max(8, Math.round(finalDamage * 0.45));
      enemyManager.applyDamage(enemy, reflectDmg, false, 'physical', fx, null);
      if (fx) {
        fx.spawnFloatingText(enemy.x, enemy.y - 14, `刺伤 -${reflectDmg}`, '#52C41A', 0.8);
      }
    }

    this.hp = Math.max(0, this.hp - finalDamage);
    this.gainXp(Math.round(finalDamage * 0.25), fx);

    if (fx) {
      fx.spawnFloatingText(this.x, this.y - 20, `-${finalDamage}`, '#FF4D4F', 0.8);
      fx.spawnParticles(this.x, this.y, 5, ['#FF4D4F', '#FFA39E'], 15, 35, 0.15, 0.25, 2.5);
    }

    if (this.hp <= 0) {
      // 检查天赋 4：不灭战魂触发神圣锁血
      if (this.talents.undyingWill && !this.undyingUsed) {
        this.undyingUsed = true;
        this.undyingTimer = 4.0;
        this.hp = 1;
        platform.playSfx('sfx_thunder');
        if (fx) {
          fx.spawnFloatingText(this.x, this.y - 32, '【不灭战魂】锁血 4 秒!', '#FFD700', 1.8);
          fx.showBanner('🔥 不灭战魂爆发！', '#FFD700', '树灵圣祖意志觉醒，4 秒完全免死且必定暴击！', 2.0);
          fx.spawnParticles(this.x, this.y, 40, ['#FF4D4F', '#FFD700', '#FFFFFF'], 50, 150, 0.4, 0.8, 5);
          if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 75, '#FF4D4F');
        }
        return;
      }

      this.die(fx);
    }
  }

  die(fx = null) {
    this.state = 'dead';
    this.hp = 0;
    this.reviveTimer = this.reviveTimeTotal;
    this.undyingTimer = 0;
    this.unblockAll();

    platform.playSfx('sfx_sell');
    if (fx) {
      fx.spawnFloatingText(this.x, this.y - 28, '守护者力竭... 蓄力复活中', '#D9D9D9', 1.4);
      fx.spawnParticles(this.x, this.y, 20, ['#8C8C8C', '#595959', '#389E0D'], 25, 60, 0.3, 0.6, 3);
    }
  }

  castUltimateSkill(enemyManager, fx = null) {
    if (this.state === 'dead' || this.skillCooldown > 0) return false;
    this.skillCooldown = this.maxSkillCooldown;
    this.isCastingSkill = true;
    this.skillCastTimer = 0.55;
    this.state = 'skill';

    platform.playSfx('sfx_thunder');
    const resonanceBonus = this.talents.leylineResonance ? 1.35 : 1.0;
    const baseRadius = 125 * resonanceBonus;
    const stunDuration = 2.2 * (this.talents.leylineResonance ? 1.3 : 1.0);

    if (fx) {
      fx.triggerScreenShake(6.5, 0.48);
      fx.showBanner('大地裂地斩！', '#FFD700', '古树神力轰鸣四方，全军震慑！', 1.6);
      if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, baseRadius, '#52C41A');
      fx.spawnParticles(this.x, this.y, 52, ['#52C41A', '#FFD700', '#D48806', '#FFFFFF'], 60, 190, 0.35, 0.8, 5.5);
    }

    // 震晕周围敌人并造成超高爆发重创
    if (enemyManager) {
      const alive = enemyManager.getAliveEnemies();
      const skillDmg = Math.round((180 + (this.level - 1) * 60) * (this.stance === 'aggressive' ? 1.25 : 1.0));

      for (let i = 0; i < alive.length; i++) {
        const e = alive[i];
        const dist = Math.hypot(e.x - this.x, e.y - this.y);
        if (dist <= baseRadius) {
          enemyManager.applyDamage(e, skillDmg, false, 'physical', fx, null);
          // 强力定身晕眩
          e.activeSlow = 0.95;
          e.residualSlowValue = 0.85;
          e.residualSlowTimer = stunDuration;
          this.gainXp(25, fx);
        }
      }
    }
    return true;
  }

  update(dt, enemyManager, fx = null) {
    this.animTimer += dt;
    if (this.rallyMarkerTimer > 0) this.rallyMarkerTimer = Math.max(0, this.rallyMarkerTimer - dt);
    if (this.levelUpGlowTimer > 0) this.levelUpGlowTimer = Math.max(0, this.levelUpGlowTimer - dt);
    if (this.skillCooldown > 0) this.skillCooldown = Math.max(0, this.skillCooldown - dt);

    // 不灭战魂狂暴计时器
    if (this.undyingTimer > 0) {
      this.undyingTimer -= dt;
      if (this.undyingTimer <= 0) {
        this.undyingTimer = 0;
        this.hp = Math.round(this.maxHp * 0.25); // 战魂结束后留存 25% 生机，免于暴毙
        if (fx) {
          fx.spawnFloatingText(this.x, this.y - 24, '生机复苏', '#52C41A', 1.0);
        }
      }
    }

    // 阵亡复活逻辑
    if (this.state === 'dead') {
      this.reviveTimer -= dt;
      if (this.reviveTimer <= 0) {
        this.reviveTimer = 0;
        this.hp = this.maxHp;
        this.undyingUsed = false; // 阵亡复活后重置不灭战魂次数
        this.state = 'idle';
        platform.playSfx('sfx_upgrade');
        if (fx) {
          fx.spawnFloatingText(this.x, this.y - 30, '英灵苏醒! 重返战场!', '#52C41A', 1.4);
          fx.spawnParticles(this.x, this.y, 28, ['#52C41A', '#FFD700'], 35, 95, 0.35, 0.65, 4);
        }
      }
      return;
    }

    // 守卫姿态天然生命回春机制（每秒恢复 4% 最大生命值）
    if (this.stance === 'guardian' && this.hp < this.maxHp) {
      this.regenTimer += dt;
      if (this.regenTimer >= 1.0) {
        this.regenTimer = 0;
        const healAmt = Math.max(3, Math.round(this.maxHp * 0.04));
        this.hp = Math.min(this.maxHp, this.hp + healAmt);
        if (fx && Math.random() < 0.4) {
          fx.spawnFloatingText(this.x, this.y - 24, `+${healAmt}`, '#73D13D', 0.7);
        }
      }
    }

    // 释放技能中硬直
    if (this.isCastingSkill) {
      this.skillCastTimer -= dt;
      if (this.skillCastTimer <= 0) {
        this.isCastingSkill = false;
        this.state = 'idle';
      }
      return;
    }

    // 移动寻路逻辑
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distToTarget = Math.hypot(dx, dy);

    if (distToTarget > 6) {
      this.state = 'walk';
      const moveStep = this.speed * dt;
      this.x += (dx / distToTarget) * Math.min(distToTarget, moveStep);
      this.y += (dy / distToTarget) * Math.min(distToTarget, moveStep);
      if (dx < -2) this.facingLeft = true;
      else if (dx > 2) this.facingLeft = false;

      // 行进尘土微粒
      if (Math.random() < 0.25 && fx) {
        fx.spawnParticles(this.x, this.y + 12, 1, ['#8C6842', '#A89265'], 8, 20, 0.15, 0.25, 2);
      }
      return;
    } else {
      if (this.state === 'walk') {
        this.state = 'idle';
      }
    }

    // 游侠姿态：远程荆棘飞刺逻辑 (Scout Ranged Thorns)
    if (this.stance === 'scout') {
      if (this.rangedThornCooldown > 0) this.rangedThornCooldown -= dt;
      if (this.rangedThornCooldown <= 0 && enemyManager) {
        const alive = enemyManager.getAliveEnemies();
        let closest = null;
        let minDist = 180;
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i];
          if (e.state === 'death' || e.isUnderground) continue;
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d <= minDist) {
            closest = e;
            minDist = d;
          }
        }

        if (closest) {
          this.rangedThornCooldown = 1.4;
          const thornDmg = Math.round(this.atkDamage * 0.95);
          enemyManager.applyDamage(closest, thornDmg, false, 'physical', fx, null);
          platform.playSfx('sfx_watch');
          if (fx) {
            fx.spawnParticles(closest.x, closest.y, 6, ['#52C41A', '#73D13D', '#FFFFFF'], 15, 45, 0.15, 0.3, 2.5);
            fx.spawnFloatingText(closest.x, closest.y - 16, `飞刺 -${thornDmg}`, '#52C41A', 0.7);
          }
        }
      }
    }

    // 地面拦截与阻挡战斗逻辑
    if (this.atkCooldown > 0) this.atkCooldown -= dt;

    if (enemyManager) {
      const alive = enemyManager.getAliveEnemies();
      // 清理已阵亡或超出范围的阻挡目标
      this.blockedEnemies = this.blockedEnemies.filter(e => e.state !== 'death' && Math.hypot(e.x - this.x, e.y - this.y) <= 55);

      // 自动拦截经过身旁的地面敌人（守卫姿态最多阻挡 3 名，其余姿态 2 名）
      const maxBlock = this.stance === 'guardian' ? 3 : 2;
      for (let i = 0; i < alive.length; i++) {
        if (this.blockedEnemies.length >= maxBlock) break;
        const e = alive[i];
        if (e.isFlying || e.isUnderground || e.state === 'death') continue;
        if (e.isBlocked && e.blockedBy !== this) continue;

        const d = Math.hypot(e.x - this.x, e.y - this.y);
        if (d <= this.atkRange && this.blockedEnemies.indexOf(e) === -1) {
          e.isBlocked = true;
          e.blockedBy = this;
          this.blockedEnemies.push(e);
        }
      }

      // 近战挥砍与顺劈逻辑
      if (this.blockedEnemies.length > 0 || alive.length > 0) {
        const potentialTargets = this.blockedEnemies.length > 0 ? this.blockedEnemies : alive.filter(e => !e.isFlying && Math.hypot(e.x - this.x, e.y - this.y) <= this.atkRange);

        if (potentialTargets.length > 0) {
          const mainTarget = potentialTargets[0];
          if (mainTarget.x < this.x) this.facingLeft = true;
          else if (mainTarget.x > this.x) this.facingLeft = false;

          // 姿态攻速修正（狂暴姿态攻速提升 30%）
          const effectiveInterval = this.stance === 'aggressive' ? (this.atkInterval * 0.72) : this.atkInterval;

          if (this.atkCooldown <= 0) {
            this.atkCooldown = effectiveInterval;
            this.state = 'attack';

            platform.playSfx('sfx_hit');

            // 基础伤害计算与姿态加成
            let baseDmg = this.atkDamage;
            let isCrit = false;
            if (this.undyingTimer > 0) {
              isCrit = true; // 不灭战魂期间必暴击！
            } else if (this.stance === 'aggressive') {
              baseDmg = Math.round(baseDmg * 1.35);
              if (Math.random() < 0.28) isCrit = true;
            }

            const finalHitDmg = isCrit ? Math.round(baseDmg * 2.0) : baseDmg;

            // 天赋 2：狂风顺劈波及全周敌人；否则波及最多 2 名
            const maxHits = this.talents.whirlwindCleave ? 5 : (this.stance === 'aggressive' ? 3 : 2);
            const hits = Math.min(maxHits, potentialTargets.length);

            for (let h = 0; h < hits; h++) {
              const target = potentialTargets[h];
              enemyManager.applyDamage(target, finalHitDmg, isCrit, 'physical', fx, null);
              this.gainXp(8, fx);
            }

            if (fx) {
              const slashX = this.x + (this.facingLeft ? -18 : 18);
              const pColors = isCrit ? ['#FF4D4F', '#FFD700', '#FFFFFF'] : ['#FFE58F', '#FFFFFF', '#73D13D'];
              fx.spawnParticles(slashX, this.y - 4, isCrit ? 12 : 7, pColors, 25, 60, 0.15, 0.35, isCrit ? 4.5 : 3);
              if (isCrit) {
                fx.spawnFloatingText(slashX, this.y - 24, '暴击!', '#FF4D4F', 1.1);
              }
            }
          }
        } else {
          this.state = 'idle';
        }
      }
    }
  }

  render(ctx, animTimeSec) {
    if (this.state === 'dead') {
      // 阵亡墓碑与复活倒计时光圈
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 8, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 墓碑/折断木剑立绘
      ctx.fillStyle = '#8C8C8C';
      ctx.fillRect(this.x - 6, this.y - 14, 12, 18);
      ctx.fillRect(this.x - 10, this.y - 8, 20, 5);

      // 复活倒计时文字与圆环
      const ratio = 1 - (this.reviveTimer / this.reviveTimeTotal);
      ctx.strokeStyle = '#52C41A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 26, 10, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * ratio);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.ceil(this.reviveTimer)}s`, this.x, this.y - 23);
      ctx.restore();
      return;
    }

    // 1. 集结目的地旗帜指示光圈
    if (this.rallyMarkerTimer > 0) {
      ctx.save();
      const alpha = Math.min(1.0, this.rallyMarkerTimer);
      ctx.strokeStyle = `rgba(255, 229, 143, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(this.targetX, this.targetY, 18, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(82, 196, 26, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(this.targetX, this.targetY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. 英雄脚底战术姿态微光光圈与阴影
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 姿态专属底环光圈
    let stanceColor = 'rgba(64, 169, 255, 0.55)'; // 守卫蓝
    if (this.stance === 'aggressive') stanceColor = 'rgba(255, 77, 79, 0.65)'; // 狂暴红
    else if (this.stance === 'scout') stanceColor = 'rgba(82, 196, 26, 0.55)'; // 游侠绿
    if (this.undyingTimer > 0) stanceColor = 'rgba(255, 215, 0, 0.9)'; // 不灭金

    ctx.strokeStyle = stanceColor;
    ctx.lineWidth = (this.isSelected || this.undyingTimer > 0) ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12, 20, 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (this.isSelected || this.levelUpGlowTimer > 0) {
      ctx.strokeStyle = this.levelUpGlowTimer > 0 ? '#FFD700' : '#73D13D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 12, 24, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. 英雄本体立绘绘制
    ctx.save();
    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    const walkBob = (this.state === 'walk') ? Math.sin(this.animTimer * 12) * 2.5 : 0;
    const heroW = 46, heroH = 46;

    if (heroImg && heroImg.width) {
      ctx.translate(this.x, this.y - walkBob);
      if (this.facingLeft) ctx.scale(-1, 1);
      ctx.drawImage(heroImg, -heroW * 0.5, -heroH * 0.8, heroW, heroH);
    } else {
      // 优雅古典树人战士矢量兜底
      ctx.translate(this.x, this.y - walkBob);
      if (this.facingLeft) ctx.scale(-1, 1);
      
      // 树皮身躯
      ctx.fillStyle = '#5C4028';
      ctx.fillRect(-10, -28, 20, 26);
      // 翡翠青苔肩甲
      ctx.fillStyle = '#389E0D';
      ctx.beginPath();
      ctx.arc(-8, -26, 6, 0, Math.PI * 2);
      ctx.arc(8, -26, 6, 0, Math.PI * 2);
      ctx.fill();
      // 金色符文巨剑
      ctx.fillStyle = '#FFE58F';
      ctx.fillRect(10, -32, 5, 28);
      ctx.fillRect(7, -12, 11, 4);
      // 眼睛
      ctx.fillStyle = '#FFA940';
      ctx.beginPath();
      ctx.arc(3, -22, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3.1 挥砍剑气特效 (100% AI Hand-Painted Emerald Slash Wave)
    if (this.atkCooldown > 0 && (this.atkInterval - this.atkCooldown) < 0.22) {
      const slashProg = (this.atkInterval - this.atkCooldown) / 0.22;
      const slashImg = platform.getImage('assets/vfx/vfx_hero_slash.png');
      if (slashImg && slashImg.width) {
        ctx.save();
        const slashDir = this.facingLeft ? -1 : 1;
        ctx.translate(this.x + slashDir * 20, this.y - 14);
        ctx.scale(slashDir, 1);
        ctx.globalAlpha = Math.max(0, 1 - slashProg * 0.7);
        const slashW = 46 + slashProg * 14;
        const slashH = 40 + slashProg * 10;
        ctx.drawImage(slashImg, -slashW * 0.4, -slashH * 0.5, slashW, slashH);
        ctx.restore();
      }
    }

    // 3.2 大招大地轰鸣双向爆发 (Earthshaker Cleave Wave)
    if (this.isCastingSkill && this.skillCastTimer > 0) {
      const skillProg = 1 - (this.skillCastTimer / 0.55);
      const slashImg = platform.getImage('assets/vfx/vfx_hero_slash.png');
      if (slashImg && slashImg.width) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - skillProg * 0.8);
        const bigW = 72 * (0.8 + skillProg * 0.5);
        const bigH = 64 * (0.8 + skillProg * 0.5);
        // 向左挥斩
        ctx.save();
        ctx.translate(this.x - 28 * (1 + skillProg), this.y - 8);
        ctx.scale(-1, 1);
        ctx.drawImage(slashImg, -bigW * 0.5, -bigH * 0.5, bigW, bigH);
        ctx.restore();
        // 向右挥斩
        ctx.save();
        ctx.translate(this.x + 28 * (1 + skillProg), this.y - 8);
        ctx.drawImage(slashImg, -bigW * 0.5, -bigH * 0.5, bigW, bigH);
        ctx.restore();
        ctx.restore();
      }
    }

    // 4. 生命值条、战术姿态微标与等级徽章
    ctx.save();
    const barW = 38;
    const barH = 5;
    const barX = this.x - barW * 0.5;
    const barY = this.y - 42;

    // 底底黑框
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    // 绿色血条
    const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
    ctx.fillStyle = hpRatio > 0.4 ? '#52C41A' : (hpRatio > 0.2 ? '#FAAD14' : '#FF4D4F');
    ctx.fillRect(barX, barY, Math.round(barW * hpRatio), barH);

    // 战术姿态微标 (🛡️ / ⚔️ / 🏹)
    const stanceIcons = { guardian: '🛡️', aggressive: '⚔️', scout: '🏹' };
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(stanceIcons[this.stance] || '🛡️', barX - 3, barY + 4);

    // 等级微章 (如 Lv.2)
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${this.level}`, this.x, barY - 3);
    ctx.restore();
  }
}

module.exports = ForestHero;

  };

  /* --- js/game/sporeling.js --- */
  __modules['js/game/sporeling'] = function(require, module, exports) {
/**
 * 萌萌菇精卫哨兵巡逻与阻挡系统 (js/game/sporeling.js)
 * 学习 Kingdom Rush 经典的兵营/集结旗帜(Rally Point)拦截设计：
 * - 玩家可自由在路径上插拔集结旗帜
 * - 2只可爱的菇精小卫士（持木盾与蒲公英矛）出击驻守
 * - 靠近经过的地面敌人时正面阻挡拦截(Block)，与敌人拼刀搏斗
 * - 小卫士阵亡后 10 秒后从地底重新培植破土而出
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class SporelingPatrol {
  constructor() {
    this.hasRally = false;
    this.rallyCol = -1;
    this.rallyRow = -1;
    this.rallyX = 0;
    this.rallyY = 0;
    this.flagAnimTimer = 0;

    // 2 只菇精小卫士
    this.guards = [
      this.createGuard(0, -14, 0),
      this.createGuard(1, 14, 4)
    ];

    this.repositionCooldown = 0;
  }

  createGuard(index, offsetX, offsetY) {
    if (index === 0) {
      // Guard 0: 坚盾菇力士 (Shieldbearer - High HP & heavy armor)
      return {
        index,
        role: 'shield',
        name: '坚盾菇力士',
        offsetX,
        offsetY,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        state: 'idle',
        hp: 320,
        maxHp: 320,
        armor: 5,
        attackDmg: 16,
        attackInterval: 0.95,
        attackCooldown: 0.2,
        blockedEnemy: null,
        respawnTimer: 0,
        animTimer: Math.random() * 2,
        walkFrame: 0,
        thrustTimer: 0
      };
    } else {
      // Guard 1: 长矛巡林萌 (Spearman - High reach, crit & piercing thrust)
      return {
        index,
        role: 'spear',
        name: '长矛巡林萌',
        offsetX,
        offsetY,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        state: 'idle',
        hp: 210,
        maxHp: 210,
        armor: 1,
        attackDmg: 28,
        attackInterval: 0.75,
        attackCooldown: 0.5,
        blockedEnemy: null,
        respawnTimer: 0,
        animTimer: Math.random() * 2,
        walkFrame: 0,
        thrustTimer: 0,
        critChance: 0.30
      };
    }
  }

  healGuards(centerX, centerY, radiusPx, amount) {
    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (g.state !== 'dead') {
        if (Math.hypot(g.x - centerX, g.y - centerY) <= radiusPx) {
          g.hp = Math.min(g.maxHp, g.hp + amount);
        }
      }
    }
  }

  damageGuards(centerX, centerY, radiusPx, amount) {
    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (g.state !== 'dead') {
        if (Math.hypot(g.x - centerX, g.y - centerY) <= radiusPx) {
          const dmg = Math.max(5, amount - g.armor);
          g.hp -= dmg;
          if (g.hp <= 0) {
            g.state = 'dead';
            g.respawnTimer = 10;
            if (g.blockedEnemy) {
              g.blockedEnemy.isBlocked = false;
              g.blockedEnemy.blockedBy = null;
              g.blockedEnemy = null;
            }
          }
        }
      }
    }
  }

  initDefaultRally(map) {
    if (!map || !map.mapData || !map.mapData.groundWaypoints) return;
    const wps = map.mapData.groundWaypoints;
    if (wps && wps.length >= 2) {
      // 默认插在地面路径第一折角附近的战略要冲
      const pt = wps[1] || wps[0];
      const col = Array.isArray(pt) ? pt[0] : (pt.col !== undefined ? pt.col : 6);
      const row = Array.isArray(pt) ? pt[1] : (pt.row !== undefined ? pt.row : 2);
      this.setRallyPoint(col, row, map, null, true);
    }
  }

  setRallyPoint(col, row, map, fx = null, instant = false) {
    if (!map || !map.inBounds(col, row)) return false;
    const tile = map.getTile(col, row);
    if (tile.type !== 'path' && tile.type !== 'spawn') return false;

    this.hasRally = true;
    this.rallyCol = col;
    this.rallyRow = row;
    this.rallyX = (col + 0.5) * TILE_SIZE;
    this.rallyY = (row + 0.5) * TILE_SIZE;
    this.repositionCooldown = 2.0;

    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (instant || g.state === 'dead') {
        g.x = this.rallyX + g.offsetX;
        g.y = this.rallyY + g.offsetY;
      }
      if (g.blockedEnemy) {
        if (g.blockedEnemy.blockedBy === g) {
          g.blockedEnemy.isBlocked = false;
          g.blockedEnemy.blockedBy = null;
        }
        g.blockedEnemy = null;
      }
      if (g.state !== 'dead') {
        g.state = 'walk';
      }
    }

    if (fx) {
      fx.spawnParticles(this.rallyX, this.rallyY, 16, ['#52C41A', '#BAE7FF', '#FFD700'], 20, 70, 0.25, 0.5, 3);
      fx.spawnFloatingText(this.rallyX, this.rallyY - 24, '菇精卫在此集结!', '#95DE64', 1.2);
    }
    platform.playSfx('sfx_build');
    return true;
  }

  update(dt, enemyManager, fx) {
    if (!this.hasRally) return;

    this.flagAnimTimer += dt;
    if (this.repositionCooldown > 0) {
      this.repositionCooldown = Math.max(0, this.repositionCooldown - dt);
    }

    const aliveEnemies = enemyManager ? enemyManager.getAliveEnemies() : [];

    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      g.animTimer += dt;
      if (g.thrustTimer > 0) {
        g.thrustTimer = Math.max(0, g.thrustTimer - dt);
      }

      // 1. 阵亡复活逻辑
      if (g.state === 'dead') {
        g.respawnTimer -= dt;
        if (g.respawnTimer <= 0) {
          g.state = 'idle';
          g.hp = g.maxHp;
          g.x = this.rallyX + g.offsetX;
          g.y = this.rallyY + g.offsetY;
          if (fx) {
            fx.spawnParticles(g.x, g.y, 14, ['#73D13D', '#BAE7FF', '#FFFFFF'], 20, 60, 0.2, 0.4, 3);
            fx.spawnFloatingText(g.x, g.y - 18, '破土归队!', '#95DE64', 1.0);
          }
          platform.playSfx('sfx_upgrade');
        }
        continue;
      }

      // 2. 检查阻挡的目标敌人是否依然有效
      if (g.blockedEnemy) {
        const e = g.blockedEnemy;
        if (e.hp <= 0 || e.state === 'death' || e.blockedBy !== g) {
          g.blockedEnemy = null;
          g.state = 'idle';
        }
      }

      // 3. 寻找拦截敌人（仅拦截地面目标，不可拦截飞行）
      if (!g.blockedEnemy && g.state !== 'dead') {
        const targetX = this.rallyX + g.offsetX;
        const targetY = this.rallyY + g.offsetY;
        let closest = null;
        let closestDist = 26; // 拦截触发半径 26px

        for (let j = 0; j < aliveEnemies.length; j++) {
          const em = aliveEnemies[j];
          if (em.isFlying || em.isBlocked || em.state === 'death') continue;
          const d = Math.hypot(em.x - targetX, em.y - targetY);
          if (d < closestDist) {
            closestDist = d;
            closest = em;
          }
        }

        if (closest) {
          g.blockedEnemy = closest;
          closest.isBlocked = true;
          closest.blockedBy = g;
          g.state = 'combat';
          if (fx) {
            fx.spawnFloatingText(g.x, g.y - 20, '拦截接怪!', '#FFD700', 0.8);
          }
        }
      }

      // 4. 战斗或移动逻辑
      if (g.state === 'combat' && g.blockedEnemy) {
        const e = g.blockedEnemy;
        // 小卫士贴向敌人身前
        const angle = Math.atan2(e.y - g.y, e.x - g.x);
        const dist = Math.hypot(e.x - g.x, e.y - g.y);
        if (dist > 14) {
          g.x += Math.cos(angle) * 45 * dt;
          g.y += Math.sin(angle) * 45 * dt;
        }

        // 攻击计时
        g.attackCooldown -= dt;
        if (g.attackCooldown <= 0) {
          g.attackCooldown = g.attackInterval;
          g.thrustTimer = 0.22;
          const dmg = Math.max(3, g.attackDmg - (e.baseArmor || 0) * 0.35);
          e.hp -= dmg;
          if (fx) {
            fx.spawnParticles(e.x, e.y, 4, ['#FFFAEE', '#FFD700'], 15, 45, 0.15, 0.25, 2);
            fx.spawnFloatingText(e.x, e.y - 12, `-${Math.round(dmg)}`, '#FFF1B8', 0.6);
          }
          platform.playSfx('sfx_hit');

          if (e.hp <= 0 && enemyManager) {
            enemyManager.killEnemy(e, fx);
            g.blockedEnemy = null;
            g.state = 'idle';
          }
        }

        // 敌人对小卫士的反击（敌人每 1.2s 造成伤害）
        e.sporelingHitTimer = (e.sporelingHitTimer || 0) + dt;
        if (e.sporelingHitTimer >= 1.1) {
          e.sporelingHitTimer = 0;
          const enemyDmg = Math.max(5, (e.threat || 1) * 16 - g.armor * 2);
          g.hp -= enemyDmg;
          if (fx) {
            fx.spawnParticles(g.x, g.y, 4, ['#FF4D4F', '#FFA39E'], 15, 35, 0.15, 0.3, 2);
          }

          if (g.hp <= 0) {
            // 阵亡
            g.state = 'dead';
            g.respawnTimer = 10.0;
            if (e.blockedBy === g) {
              e.isBlocked = false;
              e.blockedBy = null;
            }
            g.blockedEnemy = null;
            if (fx) {
              fx.spawnParticles(g.x, g.y, 16, ['#5C4028', '#A08060'], 20, 60, 0.2, 0.5, 3);
              fx.spawnFloatingText(g.x, g.y - 16, '菇精卫阵亡 (10s重生)', '#FF7875', 1.2);
            }
          }
        }
      } else if (g.state !== 'dead') {
        // 巡逻走位回集结旗帜点
        const targetX = this.rallyX + g.offsetX;
        const targetY = this.rallyY + g.offsetY;
        const dist = Math.hypot(targetX - g.x, targetY - g.y);
        if (dist > 3) {
          g.state = 'walk';
          const angle = Math.atan2(targetY - g.y, targetX - g.x);
          const spd = 55;
          g.x += Math.cos(angle) * spd * dt;
          g.y += Math.sin(angle) * spd * dt;
          g.walkFrame = Math.floor(g.animTimer * 6) % 4;
        } else {
          g.state = 'idle';
        }
      }
    }
  }

  render(ctx) {
    if (!this.hasRally) return;

    // 1. 绘制集结木旗（Rally Flag）
    ctx.save();
    const fx = this.rallyX;
    const fy = this.rallyY;
    const wave = Math.sin(this.flagAnimTimer * 4) * 3;

    // 旗帜立柱阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(fx + 2, fy + 4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 木质立柱
    ctx.strokeStyle = '#5C381E';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx, fy + 4);
    ctx.lineTo(fx, fy - 22);
    ctx.stroke();

    // 旗顶金色果实/宝珠
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(fx, fy - 23, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 飘扬的绿林卫士旗面
    ctx.fillStyle = '#389E0D';
    ctx.beginPath();
    ctx.moveTo(fx, fy - 22);
    ctx.quadraticCurveTo(fx + 9, fy - 20 + wave * 0.5, fx + 16, fy - 18 + wave);
    ctx.lineTo(fx + 16, fy - 10 + wave);
    ctx.quadraticCurveTo(fx + 8, fy - 12 + wave * 0.5, fx, fy - 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#D9F7BE';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 旗面徽标（金黄色孢子微点）
    ctx.fillStyle = '#FFF1B8';
    ctx.beginPath();
    ctx.arc(fx + 7, fy - 16 + wave * 0.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. 绘制 2 只萌萌菇精小卫士
    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (g.state === 'dead') continue;

      ctx.save();
      const gx = Math.round(g.x);
      const gy = Math.round(g.y);
      const bob = g.state === 'walk' ? Math.abs(Math.sin(g.animTimer * 10)) * 2 : Math.sin(g.animTimer * 3) * 0.8;
      const thrust = g.thrustTimer > 0 ? 5 : 0;

      // 脚底微阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(gx, gy + 3, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // 菇精小身躯（圆滚滚的米黄色菌柄）
      ctx.fillStyle = '#FFFBE6';
      ctx.strokeStyle = '#AD8B00';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(gx, gy - 2 - bob, 5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 黑色小萌眼
      ctx.fillStyle = '#262626';
      ctx.beginPath();
      ctx.arc(gx - 1.5, gy - 3 - bob, 0.9, 0, Math.PI * 2);
      ctx.arc(gx + 1.5, gy - 3 - bob, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // 菇精卫头顶翡翠绿菌盖（带白色小点点）
      ctx.fillStyle = '#52C41A';
      ctx.beginPath();
      ctx.ellipse(gx, gy - 7 - bob, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#237804';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 菌盖白色点斑
      ctx.fillStyle = '#F6FFED';
      ctx.beginPath();
      ctx.arc(gx - 3, gy - 8 - bob, 1.2, 0, Math.PI * 2);
      ctx.arc(gx + 3, gy - 7 - bob, 1.2, 0, Math.PI * 2);
      ctx.arc(gx, gy - 10 - bob, 1.0, 0, Math.PI * 2);
      ctx.fill();

      // 武器：蒲公英长矛（突刺动画）
      ctx.strokeStyle = '#8C4D18';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(gx + 3, gy - bob);
      ctx.lineTo(gx + 10 + thrust, gy - 4 - bob);
      ctx.stroke();
      // 矛尖（金黄尖端）
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(gx + 11 + thrust, gy - 4 - bob, 2, 0, Math.PI * 2);
      ctx.fill();

      // 防具：左手持圆形小木盾
      ctx.fillStyle = '#A05A2C';
      ctx.strokeStyle = '#D4B106';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(gx - 5, gy - 2 - bob, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 战斗中显示小生命条
      if (g.state === 'combat' || g.hp < g.maxHp) {
        const barW = 20;
        const barH = 3;
        const barX = gx - barW * 0.5;
        const barY = gy - 16 - bob;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        const hpPct = Math.max(0, Math.min(1, g.hp / g.maxHp));
        ctx.fillStyle = hpPct > 0.4 ? '#52C41A' : '#FF4D4F';
        ctx.fillRect(barX, barY, barW * hpPct, barH);
      }

      ctx.restore();
    }
  }
}

module.exports = SporelingPatrol;

  };

  /* --- js/game/sporeDrop.js --- */
  __modules['js/game/sporeDrop'] = function(require, module, exports) {
/**
 * 植物大战僵尸式即时点击收集系统 (js/game/sporeDrop.js)
 * 学习 PvZ 阳光掉落与即时微操点击反馈：
 * 1. 战场自然凝结的晨露金孢（每 4~7 秒随风飘落一枚）
 * 2. 灵光菇收获时迸发的跳跃金露球
 * 3. 击败精英怪物或 Boss 阶段转换时爆出的丰收金孢囊
 * 玩家点击即爆，爆出金币声效与浮动文字，增加玩家战场微操 APM 与即时正向反馈！
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class SporeDropManager {
  constructor() {
    this.drops = [];
    this.naturalSpawnTimer = 5.0;
    this.animTimeSec = 0;
  }

  reset() {
    this.drops.length = 0;
    this.naturalSpawnTimer = 4.5;
  }

  spawnDrop(x, y, spores = 15, isGold = true, floatDist = 28) {
    this.drops.push({
      x,
      y: y - 12,
      targetY: y,
      spores,
      isGold,
      life: 7.0,
      maxLife: 7.0,
      animTimer: Math.random() * Math.PI * 2,
      scale: 0.2,
      vy: 24,
      collected: false
    });
  }

  update(dt, map, economy, fx) {
    this.animTimeSec += dt;

    // 自然掉落晨露金孢 (PvZ 阳光飘落机制)
    this.naturalSpawnTimer -= dt;
    if (this.naturalSpawnTimer <= 0) {
      this.naturalSpawnTimer = 5.5 + Math.random() * 3.0;
      // 随机落于地图草地视野内 (x: 180..760, y: 80..400)
      const rx = 180 + Math.random() * 580;
      const ry = 80 + Math.random() * 320;
      this.spawnDrop(rx, ry, 15, true, 40);
    }

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.animTimer += dt;
      d.life -= dt;

      // 弹跳降落
      if (d.y < d.targetY) {
        d.y = Math.min(d.targetY, d.y + d.vy * dt * 2.5);
      }
      if (d.scale < 1.0) {
        d.scale = Math.min(1.0, d.scale + dt * 4.5);
      }

      // 到期自然淡出
      if (d.life <= 0) {
        this.drops.splice(i, 1);
      }
    }
  }

  /**
   * 点击/触控检测（PvZ 点击拾取阳光机制）
   * @param {number} mx 屏幕逻辑坐标 X
   * @param {number} my 屏幕逻辑坐标 Y
   * @returns {boolean} 是否成功点击收集
   */
  handlePointerDown(mx, my, economy, fx) {
    const hitRadius = 28;
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      const bob = Math.sin(d.animTimer * 4) * 3;
      const dy = d.y + bob;
      const dist = Math.hypot(mx - d.x, my - dy);

      if (dist <= hitRadius) {
        // 成功点击拾取！
        if (economy) {
          economy.addSpores(d.spores);
        }
        if (fx) {
          fx.spawnFloatingText(d.x, dy - 18, `+${d.spores} 孢子!`, '#FFE58F', 1.35);
          fx.spawnParticles(d.x, dy, 16, ['#FFE58F', '#FAAD14', '#FFFDF5', '#52C41A'], 25, 60, 0.25, 0.5, 3);
          if (fx.spawnShockwave) {
            fx.spawnShockwave(d.x, dy, 26, '#FFE58F');
          }
        }
        platform.playSfx('sfx_coin');
        this.drops.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  render(ctx) {
    if (this.drops.length === 0) return;

    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      const bob = Math.sin(d.animTimer * 4) * 3;
      const dx = d.x;
      const dy = d.y + bob;

      // 闪烁警示：当剩余寿命不足 2 秒时平滑渐隐闪烁
      if (d.life < 2.0) {
        const blink = Math.sin(d.life * 14);
        if (blink < -0.2) continue;
      }

      ctx.save();
      ctx.translate(dx, dy);
      ctx.scale(d.scale, d.scale);

      // 1. 地面微光阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
      ctx.beginPath();
      ctx.ellipse(0, 12 - bob, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. 纯手绘神圣黄金孢子明珠 (100% AI Hand-Painted Golden Spore Pearl)
      const sporeImg = platform.getImage('assets/vfx/item_golden_spore.png');
      if (sporeImg && sporeImg.width) {
        const pulse = 1.0 + Math.sin(d.animTimer * 5) * 0.08;
        const dw = 32 * pulse;
        const dh = 34 * pulse;

        // 背后柔和金色晨曦光晕
        const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 22 * pulse);
        glowGrad.addColorStop(0, 'rgba(255, 235, 140, 0.45)');
        glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 22 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(sporeImg, -dw * 0.5, -dh * 0.5, dw, dh);
        ctx.restore();
        continue;
      }
ctx.restore();
    }
  }
}

module.exports = SporeDropManager;

  };

  /* --- js/game/relic.js --- */
  __modules['js/game/relic'] = function(require, module, exports) {
/**
 * 战利品掉落与遗物拾取系统 (js/game/relic.js)
 * 学习 mature TD (王国保卫战/Bloons) 的战斗交互机制：
 * - 精英怪击杀或 Boss 转阶段爆出高价值战利品
 * - 在路径上带有金光粒子浮动呼吸
 * - 玩家点击快速拾取（或超时自动吸入），带来即时正向多巴胺反馈
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

class RelicDropManager {
  constructor() {
    this.relics = [];
  }

  reset() {
    this.relics.length = 0;
  }

  spawnDrop(x, y, kind = 'coin', value = 60) {
    this.relics.push({
      x,
      y,
      baseY: y,
      kind, // 'coin' | 'shield' | 'lightning' | 'clover'
      value,
      life: 9.0,
      maxLife: 9.0,
      animTimer: Math.random() * 3,
      picked: false,
      bounceVy: -60 - Math.random() * 40,
      bounceY: 0
    });
  }

  update(dt, scene) {
    for (let i = this.relics.length - 1; i >= 0; i--) {
      const r = this.relics[i];
      r.life -= dt;
      r.animTimer += dt;

      // 初段弹跳动画
      if (r.bounceY < 0 || r.bounceVy < 0) {
        r.bounceY += r.bounceVy * dt;
        r.bounceVy += 160 * dt;
        if (r.bounceY >= 0) {
          r.bounceY = 0;
          r.bounceVy = 0;
        }
      }

      // 超时自动拾取保底
      if (r.life <= 0) {
        this.collect(r, scene);
        this.relics.splice(i, 1);
      }
    }
  }

  checkClick(clickX, clickY, scene) {
    for (let i = this.relics.length - 1; i >= 0; i--) {
      const r = this.relics[i];
      const ry = r.baseY + r.bounceY + Math.sin(r.animTimer * 4) * 3;
      const dist = Math.hypot(clickX - r.x, clickY - ry);
      if (dist <= 24) {
        this.collect(r, scene, true);
        this.relics.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  collect(relic, scene, isManual = false) {
    if (!scene) return;
    const fx = scene.fx;
    const ry = relic.baseY + relic.bounceY;

    if (relic.kind === 'coin') {
      scene.economy.addSpores(relic.value || 60);
      if (fx) {
        fx.spawnFloatingText(relic.x, ry - 18, `+${relic.value || 60} 战利品孢子!`, '#FFD700', 1.3);
        fx.spawnParticles(relic.x, ry, 16, ['#FFD700', '#FFF1B8', '#FFA940'], 30, 90, 0.25, 0.5, 3);
      }
      platform.playSfx('sfx_upgrade');
    } else if (relic.kind === 'shield') {
      scene.economy.lives = Math.min(CONFIG.RULES.START_LIVES, scene.economy.lives + 1);
      if (fx) {
        fx.spawnFloatingText(relic.x, ry - 18, '+1 守护生命!', '#52C41A', 1.4);
        fx.spawnParticles(relic.x, ry, 18, ['#52C41A', '#B7EB8F', '#FFFFFF'], 30, 80, 0.3, 0.6, 3);
      }
      platform.playSfx('sfx_upgrade');
    } else if (relic.kind === 'lightning') {
      // 快速恢复所有法术冷却并赋予全场守卫狂暴
      for (let sKey in scene.spells) {
        scene.spells[sKey].cooldown = 0;
      }
      if (fx) {
        fx.spawnFloatingText(relic.x, ry - 18, '法术充能瞬间拉满!', '#40A9FF', 1.4);
        fx.spawnParticles(relic.x, ry, 22, ['#40A9FF', '#91D5FF', '#BAE7FF'], 35, 100, 0.3, 0.6, 4);
      }
      platform.playSfx('sfx_laser');
    } else if (relic.kind === 'clover') {
      // 4秒全场暴击狂潮
      if (fx) {
        fx.spawnFloatingText(relic.x, ry - 18, '幸运四叶草: 全员暴击!', '#73D13D', 1.4);
        fx.spawnParticles(relic.x, ry, 18, ['#73D13D', '#D9F7BE', '#FFD700'], 30, 80, 0.3, 0.5, 3);
      }
      platform.playSfx('sfx_upgrade');
    }
  }

  render(ctx) {
    if (this.relics.length === 0) return;

    for (let i = 0; i < this.relics.length; i++) {
      const r = this.relics[i];
      ctx.save();
      const floatY = Math.sin(r.animTimer * 4) * 3;
      const rx = Math.round(r.x);
      const ry = Math.round(r.baseY + r.bounceY + floatY);

      // 地面光圈与阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(rx, r.baseY + 4, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 发光战利品光环
      const glowAlpha = 0.35 + Math.sin(r.animTimer * 6) * 0.18;
      ctx.fillStyle = r.kind === 'shield' ? 
gba(82, 196, 26, ) : 
gba(255, 215, 0, );
      ctx.beginPath();
      ctx.arc(rx, ry - 6, 15, 0, Math.PI * 2);
      ctx.fill();

      // 绘制 100% 纯 AI 手绘高精战利品道具图标
      const assetMap = {
        coin: 'assets/vfx/relic_amber.png',
        shield: 'assets/vfx/relic_shield.png',
        lightning: 'assets/vfx/relic_lightning.png',
        clover: 'assets/vfx/relic_clover.png'
      };
      const img = platform.getImage(assetMap[r.kind] || assetMap.coin) || platform.getImage('assets/vfx/relic_coin.png');
      if (img && img.width) {
        const rw = 28;
        const rh = 28;
        ctx.drawImage(img, rx - rw * 0.5, ry - rh * 0.5 - 6, rw, rh);
      }

      // 快闪烁提示（剩余 2.5s 时）
      if (r.life < 2.5) {
        ctx.globalAlpha = Math.sin(r.life * 14) > 0 ? 0.9 : 0.2;
      }

      ctx.restore();
    }
  }
}

module.exports = RelicDropManager;
  };

  /* --- js/game/contraption.js --- */
  __modules['js/game/contraption'] = function(require, module, exports) {
/**
 * 奇幻森林环境武器与生灵互动系统 (js/game/contraption.js)
 * 100% 纯 AI 手绘高精美术资产：
 * 1. 【食虫巨猪笼草】(Carnivorous Pitcher)：prop_pitcher.png / prop_pitcher_eating.png
 * 2. 【空心雷击古木】(Thunder Tree)：prop_thunder_stump.png
 * 3. 【清晨晶莹露珠】(Morning Dew Drops)：prop_dew.png
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class ForestContraptions {
  constructor() {
    this.pitcher = null;
    this.thunderTree = null;
    this.dewDrops = [];
    this.dewSpawnTimer = 3.0;
    this.lightningArcs = [];
  }

  initForMap(mapId) {
    this.dewDrops.length = 0;
    this.lightningArcs.length = 0;
    this.dewSpawnTimer = 3.0;

    // 根据不同地图布局设置环境武器的天然战略点位
    if (mapId === 'map1') {
      this.pitcher = {
        col: 8,
        row: 5,
        x: (8 + 0.5) * TILE_SIZE,
        y: (5 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 18.0,
        cost: 35,
        digestTimer: 0,
        animTimer: 0
      };
      this.thunderTree = {
        col: 11,
        row: 7,
        x: (11 + 0.5) * TILE_SIZE,
        y: (7 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 24.0,
        cost: 45,
        arcTimer: 0,
        animTimer: 0
      };
    } else if (mapId === 'map2') {
      this.pitcher = {
        col: 10,
        row: 5,
        x: (10 + 0.5) * TILE_SIZE,
        y: (5 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 18.0,
        cost: 35,
        digestTimer: 0,
        animTimer: 0
      };
      this.thunderTree = {
        col: 14,
        row: 8,
        x: (14 + 0.5) * TILE_SIZE,
        y: (8 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 24.0,
        cost: 45,
        arcTimer: 0,
        animTimer: 0
      };
    } else {
      this.pitcher = {
        col: 9,
        row: 6,
        x: (9 + 0.5) * TILE_SIZE,
        y: (6 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 18.0,
        cost: 35,
        digestTimer: 0,
        animTimer: 0
      };
      this.thunderTree = {
        col: 13,
        row: 6,
        x: (13 + 0.5) * TILE_SIZE,
        y: (6 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 24.0,
        cost: 45,
        arcTimer: 0,
        animTimer: 0
      };
    }
  }

  update(dt, scene) {
    // 1. 猪笼草冷却与消化逻辑
    if (this.pitcher) {
      this.pitcher.animTimer += dt;
      if (this.pitcher.cd > 0) {
        this.pitcher.cd = Math.max(0, this.pitcher.cd - dt);
      }
      if (this.pitcher.digestTimer > 0) {
        this.pitcher.digestTimer -= dt;
        if (this.pitcher.digestTimer <= 0) {
          // 消化完成，爆浆奖励孢子
          if (scene && scene.economy) {
            scene.economy.addSpores(45);
          }
          if (scene && scene.fx) {
            scene.fx.spawnFloatingText(this.pitcher.x, this.pitcher.y - 24, '消化完成 +45 孢子!', '#52C41A', 1.35);
            scene.fx.spawnParticles(this.pitcher.x, this.pitcher.y, 22, ['#52C41A', '#B7EB8F', '#FFD700'], 40, 95);
          }
          platform.playSfx('sfx_mist');
        }
      }
    }

    // 2. 雷击古木充能与电弧特效
    if (this.thunderTree) {
      this.thunderTree.animTimer += dt;
      if (this.thunderTree.cd > 0) {
        this.thunderTree.cd = Math.max(0, this.thunderTree.cd - dt);
      }
      if (this.thunderTree.arcTimer > 0) {
        this.thunderTree.arcTimer -= dt;
      }
    }

    // 3. 草丛露珠自然凝聚（最多 3 颗，不可在已有位置重复）
    this.dewSpawnTimer -= dt;
    if (this.dewSpawnTimer <= 0 && this.dewDrops.length < 3 && scene && scene.map) {
      this.dewSpawnTimer = 8.0 + Math.random() * 6.0;
      const mossList = scene.map.mapData.mossTiles || [];
      if (mossList.length > 0) {
        const pick = mossList[Math.floor(Math.random() * mossList.length)];
        const rx = (pick[0] + 0.2 + Math.random() * 0.6) * TILE_SIZE;
        const ry = (pick[1] + 0.2 + Math.random() * 0.6) * TILE_SIZE;
        this.dewDrops.push({
          x: rx,
          y: ry,
          animTimer: Math.random() * 3.0,
          life: 14.0
        });
      }
    }

    // 露珠寿命衰减
    for (let i = this.dewDrops.length - 1; i >= 0; i--) {
      const dew = this.dewDrops[i];
      dew.animTimer += dt;
      dew.life -= dt;
      if (dew.life <= 0) {
        this.dewDrops.splice(i, 1);
      }
    }
  }

  handlePointerDown(x, y, scene) {
    if (!scene || scene.state !== 'BATTLE') return false;

    // 1. 点击清晨露珠：“啵”地破裂获得孢子微彩蛋
    for (let i = this.dewDrops.length - 1; i >= 0; i--) {
      const dew = this.dewDrops[i];
      const dist = Math.hypot(dew.x - x, dew.y - y);
      if (dist <= 22) {
        if (scene.economy) scene.economy.addSpores(5);
        if (scene.fx) {
          scene.fx.spawnFloatingText(dew.x, dew.y - 14, '+5 晨露孢子', '#69C0FF', 1.15);
          scene.fx.spawnParticles(dew.x, dew.y, 14, ['#BAE7FF', '#91D5FF', '#FFFFFF'], 20, 50, 0.2, 0.4, 3);
        }
        platform.playSfx('sfx_click');
        this.dewDrops.splice(i, 1);
        return true;
      }
    }

    // 2. 点击食虫巨猪笼草
    if (this.pitcher) {
      const p = this.pitcher;
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist <= 28) {
        if (p.cd > 0) {
          scene.ui.showToast(`猪笼草生长中 (冷却 ${Math.ceil(p.cd)}s)`);
          return true;
        }
        if (p.digestTimer > 0) {
          scene.ui.showToast('巨型猪笼草正在消化中...');
          return true;
        }
        if (!scene.economy.canAfford(p.cost)) {
          scene.ui.showToast(`孢子不足 (需 ${p.cost})`);
          return true;
        }
        // 寻找附近的地面敌人进行吞噬
        const enemies = scene.enemyManager ? scene.enemyManager.activeEnemies : [];
        let target = null;
        let minDist = 75;
        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (!e.__active || e.state === 'death' || e.isFlying) continue;
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d <= minDist) {
            target = e;
            minDist = d;
          }
        }

        if (target) {
          scene.economy.spendSpores(p.cost);
          p.cd = p.maxCd;
          p.digestTimer = 4.0;
          scene.enemyManager.applyDirectDamage(target, 9999, 0, true, false, 0, scene.map, scene.economy, scene.fx);
          scene.fx.spawnFloatingText(p.x, p.y - 20, '巨口吞噬!', '#722ED1', 1.35);
          scene.fx.spawnParticles(p.x, p.y, 25, ['#722ED1', '#B7EB8F', '#52C41A', '#FFD700'], 35, 80);
          platform.playSfx('sfx_mist');
        } else {
          scene.ui.showToast('附近暂无靠近的地面害虫');
        }
        return true;
      }
    }

    // 3. 点击雷击古木
    if (this.thunderTree) {
      const t = this.thunderTree;
      const dist = Math.hypot(t.x - x, t.y - y);
      if (dist <= 28) {
        if (t.cd > 0) {
          scene.ui.showToast(`雷击古木充能中 (冷却 ${Math.ceil(t.cd)}s)`);
          return true;
        }
        if (!scene.economy.canAfford(t.cost)) {
          scene.ui.showToast(`孢子不足 (需 ${t.cost})`);
          return true;
        }
        scene.economy.spendSpores(t.cost);
        t.cd = t.maxCd;
        t.arcTimer = 1.2;

        // 全场雷电连锁暴击
        const enemies = scene.enemyManager ? scene.enemyManager.activeEnemies : [];
        let hitCount = 0;
        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (!e.__active || e.state === 'death') continue;
          scene.enemyManager.applyDirectDamage(e, 85, 0.25, true, false, 0, scene.map, scene.economy, scene.fx);
          hitCount++;
        }
        scene.fx.showBanner('雷霆过载！', '#69C0FF', `引动古木天雷 轰击 ${hitCount} 只害虫`, 1.8);
        scene.fx.spawnParticles(t.x, t.y, 35, ['#40A9FF', '#69C0FF', '#BAE7FF', '#FFFFFF'], 60, 160);
        platform.playSfx('sfx_boom');
        return true;
      }
    }

    return false;
  }

  render(ctx, time) {
    // 1. 绘制食虫巨猪笼草 (100% 纯 AI 手绘高精美术资产)
    if (this.pitcher) {
      const p = this.pitcher;
      ctx.save();
      const isDigesting = p.digestTimer > 0;
      const isReady = p.cd <= 0 && !isDigesting;
      const jiggle = isDigesting ? Math.sin(time * 20) * 2 : Math.sin(time * 3) * 0.6;

      // 脚底柔和阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 12, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 纯 100% AI 手绘食虫巨猪笼草（吞噬消化态与常态开花态）
      const pitcherImgPath = isDigesting ? 'assets/vfx/prop_pitcher_eating.png' : 'assets/vfx/prop_pitcher.png';
      const pitcherImg = platform.getImage(pitcherImgPath);
      if (pitcherImg && pitcherImg.width) {
        const pw = 48;
        const ph = 56;
        ctx.drawImage(pitcherImg, p.x - pw * 0.5, p.y - ph + 14 + jiggle, pw, ph);
      }

      // 可激活充能光芒微光
      if (isReady) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.28)';
        ctx.beginPath();
        ctx.arc(p.x, p.y - 18, 14 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 2. 绘制雷击古木 (100% 纯 AI 手绘青色符文焦黑古树桩)
    if (this.thunderTree) {
      const t = this.thunderTree;
      ctx.save();
      const isReady = t.cd <= 0;

      // 脚底阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(t.x, t.y + 12, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 纯 AI 手绘雷击古木树桩
      const stumpImg = platform.getImage('assets/vfx/prop_thunder_stump.png') || platform.getImage('assets/vfx/prop_stump.png');
      if (stumpImg && stumpImg.width) {
        const sw = 50;
        const sh = 46;
        ctx.drawImage(stumpImg, t.x - sw * 0.5, t.y - sh + 12, sw, sh);
      }

      // 内部雷电灵力光晕
      if (isReady) {
        ctx.fillStyle = 'rgba(64, 169, 255, 0.22)';
        ctx.beginPath();
        ctx.arc(t.x, t.y - 10, 16 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 3. 绘制草丛晨露珠 (100% 纯 AI 手绘晶莹剔透四叶草晨露珠)
    for (let i = 0; i < this.dewDrops.length; i++) {
      const dew = this.dewDrops[i];
      ctx.save();
      const bob = Math.sin(dew.animTimer * 4) * 2;
      const dx = dew.x;
      const dy = dew.y + bob;

      const dewImg = platform.getImage('assets/vfx/prop_dew.png');
      if (dewImg && dewImg.width) {
        const dw = 26;
        const dh = 28;
        ctx.drawImage(dewImg, dx - dw * 0.5, dy - dh * 0.5, dw, dh);
      }
      ctx.restore();
    }
  }
}

module.exports = ForestContraptions;

  };

  /* --- js/game/bullet.js --- */
  __modules['js/game/bullet'] = function(require, module, exports) {
/**
 * 子弹与持续区域系统 (js/game/bullet.js)
 * 使用对象池（子弹上限 150，区域上限 40）
 * 严格实现 5.6 弹道与命中规则：
 * - 瞭望菇：预判射击，目标中途死亡则子弹消失
 * - 尖刺菇：预判方向直线穿透、不追踪，同一发对同一敌人最多命中一次
 * - 爆裂菇：发射时锁定预判落点，中途目标死亡照常落地爆炸，全额无衰减溅射，B3 留下熔金灼烧区
 * - 雾菇：在最密集处生成雾团，减速、破甲(A3)、离雾残留(A2/A3)及持续伤害
 */

const ObjectPool = require('../core/pool');
const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { drawProjectileSprite, drawHazardSprite } = require('../core/atlasRenderer');
const platform = require('../core/platform');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class BulletManager {
  constructor() {
    // 子弹对象池（严格上限 150）
    this.bulletPool = new ObjectPool(
      () => ({
        kind: 'watch', // 'watch' | 'thorn' | 'burst'
        spriteKey: 'watch_base',
        x: 0,
        y: 0,
        startX: 0,
        startY: 0,
        targetX: 0,
        targetY: 0,
        vx: 0,
        vy: 0,
        speed: 640,
        angle: 0,
        baseDamage: 40,
        damageBonus: 0,
        isCrit: false,
        appliesMark: false,
        targetEnemy: null,
        targetUid: 0,
        pierceRemaining: 1,
        pierceCountSoFar: 0,
        pierceBonusPerHit: 0,
        pierceBonusMax: 0,
        hitUids: [],
        flightTimer: 0,
        flightDuration: 0.38,
        splashRadiusPx: 40,
        burnZoneCfg: null,
        branchColor: PALETTE.MUSHROOM_GILL,
        hasToxicBurst: false,
        hasPoisonThorn: false,
        life: 0,
        maxLife: 2.0
      }),
      (b) => {
        b.hitUids.length = 0;
        b.targetEnemy = null;
        b.targetUid = 0;
        b.burnZoneCfg = null;
        b.life = 0;
        b.flightTimer = 0;
        b.pierceCountSoFar = 0;
        b.hasToxicBurst = false;
        b.hasPoisonThorn = false;
      },
      CONFIG.POOL_CAPS.BULLETS
    );

    // 雾团与灼烧区对象池（上限 40）
    this.hazardPool = new ObjectPool(
      () => ({
        kind: 'mist', // 'mist' | 'burn'
        spriteKey: 'mist_base',
        x: 0,
        y: 0,
        radiusPx: 48,
        duration: 3.0,
        timer: 0,
        slow: 0,
        residualSlowDuration: 0,
        armorReduction: 0,
        dps: 4,
        affectAir: true,
        color: PALETTE.BRANCH_A
      }),
      null,
      CONFIG.POOL_CAPS.HAZARDS
    );
  }

  clear() {
    this.bulletPool.clear();
    this.hazardPool.clear();
  }

  /**
   * 发射瞭望菇单体预判子弹
   */
  spawnWatchBullet(x, y, targetEnemy, predX, predY, node, baseDamage) {
    const b = this.bulletPool.acquire(false);
    if (!b) return null;

    const dx = predX - x;
    const dy = predY - y;
    const dist = Math.max(1, Math.hypot(dx, dy));

    b.kind = 'watch';
    b.spriteKey = node.branch === 'A' ? 'watch_a' : (node.branch === 'B' ? 'watch_b' : 'watch_base');
    b.x = x;
    b.y = y;
    b.speed = node.bulletSpeed || 640;
    b.vx = (dx / dist) * b.speed;
    b.vy = (dy / dist) * b.speed;
    b.angle = Math.atan2(dy, dx);
    b.baseDamage = baseDamage;
    b.damageBonus = node.damageBonus || 0;
    b.isCrit = node.critRate > 0 && Math.random() < node.critRate;
    b.appliesMark = Boolean(node.appliesMark);
    b.targetEnemy = targetEnemy;
    b.targetUid = targetEnemy ? targetEnemy.uid : 0;
    b.branchColor = node.branch === 'A' ? PALETTE.BRANCH_A : (node.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.UPGRADE_LV1);
    b.maxLife = 2.5;
    return b;
  }

  /**
   * 发射尖刺菇直线穿透尖刺（支持 A3 侧刺与 B3 穿透递增伤害）
   */
  spawnThornSpike(x, y, angleRad, node, baseDamage, damageScale = 1.0, options = null) {
    const b = this.bulletPool.acquire(false);
    if (!b) return null;

    b.kind = 'thorn';
    b.spriteKey = node.branch === 'A' ? 'thorn_a' : (node.branch === 'B' ? 'thorn_b' : 'thorn_base');
    b.x = x;
    b.y = y;
    b.speed = node.bulletSpeed || 900;
    b.angle = angleRad;
    b.vx = Math.cos(angleRad) * b.speed;
    b.vy = Math.sin(angleRad) * b.speed;
    b.baseDamage = baseDamage * damageScale;
    b.damageBonus = node.damageBonus || 0;
    b.isCrit = false;
    b.appliesMark = false;
    b.pierceRemaining = node.pierce || 2;
    b.pierceCountSoFar = 0;
        b.hasToxicBurst = false;
        b.hasPoisonThorn = false;
    b.pierceBonusPerHit = node.pierceDamageBonusPerHit || 0;
    b.pierceBonusMax = node.pierceDamageBonusMax || 0;
    b.branchColor = node.branch === 'A' ? PALETTE.BRANCH_A : (node.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.MUSHROOM_GILL);
    // 尖刺射程外稍作延伸后消散
    const maxDistPx = (node.range + 0.75) * TILE_SIZE;
    b.maxLife = maxDistPx / b.speed;
    b.hasPoisonThorn = options && options.hasPoisonThorn;
    return b;
  }

  /**
   * 发射爆裂菇抛物线炮弹（锁定预判落点）
   */
  spawnBurstShell(x, y, targetX, targetY, node, baseDamage, options = null) {
    const b = this.bulletPool.acquire(false);
    if (!b) return null;

    b.kind = 'burst';
    b.spriteKey = node.branch === 'A' ? 'burst_a' : (node.branch === 'B' ? 'burst_b' : 'burst_base');
    b.startX = x;
    b.startY = y;
    b.x = x;
    b.y = y;
    b.targetX = targetX;
    b.targetY = targetY;
    b.flightTimer = 0;
    b.flightDuration = node.flightTime || 0.38;
    b.baseDamage = baseDamage;
    b.damageBonus = node.damageBonus || 0;
    b.splashRadiusPx = (node.splashRadius || 1.25) * TILE_SIZE;
    b.burnZoneCfg = node.burnZone || null;
    b.branchColor = node.branch === 'A' ? PALETTE.BRANCH_A : (node.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.UPGRADE_LV1);
    b.maxLife = b.flightDuration + 0.1;
    b.hasToxicBurst = options && options.hasToxicBurst;
    return b;
  }

  /**
   * 生成雾菇孢子雾团
   */
  spawnLuminaRay(x, y, targetEnemy, node, baseDamage) {
    const b = this.bulletPool.acquire(true);
    if (!b) return null;

    b.kind = 'lumina';
    b.spriteKey = 'proj_lumina';
    b.x = x;
    b.y = y;
    b.targetEnemy = targetEnemy;
    b.targetUid = targetEnemy.uid;
    b.speed = 720;
    b.baseDamage = baseDamage || 22;
    b.damageBonus = node.damageBonus || 0;
    b.isCrit = Math.random() < (node.critChance || 0.15);
    b.life = 0;
    b.maxLife = 1.0;
    b.branchColor = '#FFC53D';
    return b;
  }

  spawnMistCloud(x, y, node) {
    const h = this.hazardPool.acquire(true);
    if (!h) return null;

    h.kind = 'mist';
    h.spriteKey = node.branch === 'A' ? 'mist_a' : (node.branch === 'B' ? 'mist_b' : 'mist_base');
    h.x = x;
    h.y = y;
    h.radiusPx = (node.cloudRadius || 1.5) * TILE_SIZE;
    h.duration = node.cloudDuration || 3.0;
    h.timer = 0;
    h.slow = node.slow || 0.30;
    h.residualSlowDuration = node.residualSlowDuration || 0;
    h.armorReduction = node.armorReduction || 0;
    h.dps = node.dps || 4;
    h.affectAir = true;
    h.color = node.branch === 'A' ? PALETTE.BRANCH_A : (node.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.UPGRADE_LV1);
    return h;
  }

  /**
   * 生成爆裂菇 B3 熔金灼烧区
   */
  spawnBurnZone(x, y, burnCfg) {
    const h = this.hazardPool.acquire(true);
    if (!h) return null;

    h.kind = 'burn';
    h.spriteKey = 'burn_0';
    h.x = x;
    h.y = y;
    h.radiusPx = (burnCfg.radius || 1.0) * TILE_SIZE;
    h.duration = burnCfg.duration || 3.0;
    h.timer = 0;
    h.slow = 0;
    h.residualSlowDuration = 0;
    h.armorReduction = 0;
    h.dps = burnCfg.dps || 8;
    h.affectAir = false; // 爆裂菇灼烧区仅作用于地面
    h.color = PALETTE.BRANCH_B;
    return h;
  }

  /**
   * 5.6 每个逻辑步执行碰撞检测与雾团/灼烧区状态注入
   */
  update(dt, combatTimeSec, map, enemyManager, economy, fx) {
    const aliveEnemies = enemyManager.getAliveEnemies();

    // 1. 更新雾团与灼烧区，向范围内敌人注入减速、破甲与持续伤害源
    const hazards = this.hazardPool.getActiveList();
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      h.timer += dt;
      if (h.timer >= h.duration) {
        this.hazardPool.releaseAt(i);
        continue;
      }

      const r2 = h.radiusPx * h.radiusPx;
      for (let j = 0; j < aliveEnemies.length; j++) {
        const e = aliveEnemies[j];
        if (!h.affectAir && e.isFlying) continue;
        const dx = e.x - h.x;
        const dy = e.y - h.y;
        if (dx * dx + dy * dy <= r2) {
          if (h.slow > 0) {
            e.activeSlow = Math.max(e.activeSlow, h.slow);
            if (h.residualSlowDuration > 0) {
              e.residualSlowTimer = Math.max(e.residualSlowTimer, h.residualSlowDuration);
              e.residualSlowValue = Math.max(e.residualSlowValue, h.slow);
            }
          }
          if (h.armorReduction > 0) {
            e.armorReduction = Math.max(e.armorReduction, h.armorReduction);
          }
          if (h.dps > 0) {
            e.dotSources.push(h.dps);
          }
        }
      }
    }

    // 2. 更新所有子弹与炮弹碰撞
    const bullets = this.bulletPool.getActiveList();
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.life += dt;
      if (b.life >= b.maxLife) {
        this.bulletPool.releaseAt(i);
        continue;
      }

      if (b.kind === 'lumina') {
        const tgt = b.targetEnemy;
        if (!tgt || !tgt.__active || tgt.state === 'death' || tgt.uid !== b.targetUid) {
          this.bulletPool.releaseAt(i);
          continue;
        }
        const dx = tgt.x - b.x;
        const dy = tgt.y - b.y;
        const dist = Math.hypot(dx, dy);
        const stepMove = b.speed * dt;

        if (dist <= stepMove + 10) {
          // Lumina holy ray hit: holy damage + blind/slow 35%
          enemyManager.applyDirectDamage(
            tgt,
            b.baseDamage,
            b.damageBonus,
            b.isCrit,
            false,
            combatTimeSec,
            map,
            economy,
            fx
          );
          tgt.activeSlow = Math.max(tgt.activeSlow || 0, 0.35);
          tgt.residualSlowTimer = Math.max(tgt.residualSlowTimer || 0, 2.0);
          tgt.residualSlowValue = Math.max(tgt.residualSlowValue || 0, 0.35);

          if (fx) {
            fx.spawnParticles(b.x, b.y, 10, ['#FFE58F', '#FAAD14', '#FFFDF5'], 18, 38, 0.2, 0.45, 3);
            fx.spawnFloatingText(tgt.x, tgt.y - 14, '圣光灼照!', '#FFE58F', 0.95);
          }
          this.bulletPool.releaseAt(i);
          continue;
        }

        b.x += (dx / dist) * stepMove;
        b.y += (dy / dist) * stepMove;
        b.angle = Math.atan2(dy, dx);
      } else if (b.kind === 'watch') {
        // 5.6 瞭望菇：目标在飞行途中死亡则子弹消失
        const tgt = b.targetEnemy;
        if (!tgt || !tgt.__active || tgt.state === 'death' || tgt.uid !== b.targetUid) {
          this.bulletPool.releaseAt(i);
          continue;
        }

        // 朝目标推进并检测命中
        const dx = tgt.x - b.x;
        const dy = tgt.y - b.y;
        const dist = Math.hypot(dx, dy);
        const stepMove = b.speed * dt;

        if (dist <= stepMove + 10) {
          // 蘑菇连携反应：若目标被破甲、带标记或处于减速状态，触发【弱点贯穿 (Weakpoint Execution)】
          const isVulnerable = (tgt.armorReduction > 0 || tgt.markTimer > 0 || tgt.residualSlowTimer > 0);
          const finalCrit = b.isCrit || isVulnerable;
          const finalBonus = b.damageBonus + (isVulnerable ? 0.35 : 0);
          if (isVulnerable && fx) {
            fx.spawnFloatingText(tgt.x, tgt.y - 18, '弱点贯穿!', '#6FE8FF', 1.15);
          }
          enemyManager.applyDirectDamage(
            tgt,
            b.baseDamage,
            finalBonus,
            finalCrit,
            b.appliesMark,
            combatTimeSec,
            map,
            economy,
            fx
          );
          if (fx) {
            fx.onSingleHit(tgt.x, tgt.y, b.branchColor);
          }
          this.bulletPool.releaseAt(i);
          continue;
        }

        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed;
        b.angle = Math.atan2(dy, dx);
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // 元素反应：尖刺穿过毒雾吸收酸液转化为【腐蚀穿甲钉】
        if (!b.isAcidInfused) {
          const hazards = this.hazardPool.getActiveList();
          for (let hI = 0; hI < hazards.length; hI++) {
            const hz = hazards[hI];
            if (hz.kind === 'mist') {
              if (Math.hypot(b.x - hz.x, b.y - hz.y) <= hz.radiusPx) {
                b.isAcidInfused = true;
                b.branchColor = '#52C41A';
                b.baseDamage *= 1.35;
                if (fx) {
                  fx.spawnParticles(b.x, b.y, 4, ['#73D13D', '#B7EB8F'], 15, 35, 0.15, 0.25, 2);
                  fx.spawnFloatingText(b.x, b.y - 12, '酸液淬火!', '#73D13D', 0.75);
                }
                break;
              }
            }
          }
        }
      } else if (b.kind === 'thorn') {
        // 5.6 尖刺菇：直线飞行、不追踪，同一发对同一敌人最多命中一次，仅命中地面敌人
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // 越出地图边界回收
        if (b.x < -16 || b.x > CONFIG.LAYOUT.MAP.WIDTH + 16 || b.y < -16 || b.y > CONFIG.LAYOUT.MAP.HEIGHT + 16) {
          this.bulletPool.releaseAt(i);
          continue;
        }

        for (let j = 0; j < aliveEnemies.length; j++) {
          const e = aliveEnemies[j];
          if (e.isFlying || e.state === 'death') continue;
          if (b.hitUids.indexOf(e.uid) !== -1) continue;

          const hitRadius = (e.def.artSize.width || 12) + 6;
          const dx = e.x - b.x;
          const dy = e.y - b.y;
          if (dx * dx + dy * dy <= hitRadius * hitRadius) {
            b.hitUids.push(e.uid);

            // B3 锯齿刺：每穿透 1 个目标，后续伤害 +20%（最多 +100%）
            const rampBonus = Math.min(b.pierceBonusMax, b.pierceCountSoFar * b.pierceBonusPerHit);
            const totalBonus = b.damageBonus + rampBonus;

            enemyManager.applyDirectDamage(
              e,
              b.baseDamage,
              totalBonus,
              false,
              false,
              combatTimeSec,
              map,
              economy,
              fx
            );
            if (fx) {
              fx.onSingleHit(e.x, e.y, b.branchColor);
            }

            b.pierceCountSoFar += 1;
            b.pierceRemaining -= 1;
            if (b.pierceRemaining <= 0) {
              this.bulletPool.releaseAt(i);
              break;
            }
          }
        }
      } else if (b.kind === 'burst') {
        // 5.6 爆裂菇：锁定预判落点，中途目标死亡照常落地结算，范围内全额无衰减伤害
        b.flightTimer += dt;
        const prog = Math.min(1, b.flightTimer / b.flightDuration);
        const arcHeight = Math.sin(prog * Math.PI) * 32;
        b.x = b.startX + (b.targetX - b.startX) * prog;
        b.y = b.startY + (b.targetY - b.startY) * prog - arcHeight;

        if (prog >= 1) {
          const effRadius = b.splashRadiusPx * (b.hasToxicBurst ? 1.4 : 1.0);
          const r2 = effRadius * effRadius;
          if (economy) {
            economy.beginExplosionBatch();
          }

          // 元素反应：迫击炮弹落点碰撞毒雾，引发【真菌化学毒爆】
          const hazards = this.hazardPool.getActiveList();
          for (let hI = 0; hI < hazards.length; hI++) {
            const hz = hazards[hI];
            if (hz.kind === 'mist') {
              if (Math.hypot(b.targetX - hz.x, b.targetY - hz.y) <= b.splashRadiusPx + hz.radiusPx) {
                hz.radiusPx *= 1.35;
                hz.dps += 6;
                if (fx) {
                  fx.spawnParticles(b.targetX, b.targetY, 20, ['#52C41A', '#B7EB8F', '#FFD700', '#FFA940'], 45, 130, 0.25, 0.55, 4);
                  fx.spawnFloatingText(b.targetX, b.targetY - 26, '真菌化学毒爆!', '#52C41A', 1.3);
                  fx.triggerScreenShake(3.0, 0.2);
                }
                platform.playSfx('sfx_bomb');
                break;
              }
            }
          }

          for (let j = 0; j < aliveEnemies.length; j++) {
            const e = aliveEnemies[j];
            if (e.isFlying || e.state === 'death') continue;
            const dx = e.x - b.targetX;
            const dy = e.y - b.targetY;
            if (dx * dx + dy * dy <= r2) {
              // 蘑菇连携反应：若敌人处于剧毒迷雾/减速状态，炮火引发【真菌毒爆 (Chemical Reaction)】
              const isPoisoned = (e.residualSlowTimer > 0 || (e.poisonTimer && e.poisonTimer > 0));
              let bonusDmg = b.damageBonus;
              if (isPoisoned) {
                bonusDmg += b.hasToxicBurst ? 0.90 : 0.50;
                if (b.hasToxicBurst && fx) {
                  fx.spawnFloatingText(e.x, e.y - 24, '共振·剧毒爆轰!', '#52C41A', 1.3);
                  fx.spawnParticles(e.x, e.y, 16, ['#52C41A', '#73D13D', '#FFD700'], 40, 110, 0.25, 0.5, 3.5);
                } // +50% 范围毒爆额外增伤！
                if (fx) {
                  fx.spawnFloatingText(e.x, e.y - 20, 'COMBO 毒爆!', '#52C41A', 1.25);
                  fx.spawnParticles(e.x, e.y, 14, ['#52C41A', '#FFE58F', '#FFA940'], 40, 120, 0.2, 0.45, 3.5);
                }
              }
              enemyManager.applyDirectDamage(
                e,
                b.baseDamage,
                bonusDmg,
                isPoisoned, // 毒爆直接触发暴击
                false,
                combatTimeSec,
                map,
                economy,
                fx
              );
            }
          }

          if (economy) {
            economy.endExplosionBatch(combatTimeSec, fx);
          }

          if (fx) {
            fx.onBurstExplosion(b.targetX, b.targetY, b.splashRadiusPx, b.branchColor);
          }

          // B3 熔金：爆心留下灼烧区（半径 1.0 格，持续 3 秒，每秒 8 点伤害）
          if (b.burnZoneCfg) {
            this.spawnBurnZone(b.targetX, b.targetY, b.burnZoneCfg);
          }

          this.bulletPool.releaseAt(i);
        }
      }
    }
  }

  /**
   * 绘制地面区域（雾团与灼烧区，优先使用 100% AI 手绘高清毒沼与地脉震击法阵）
   */
  renderHazards(ctx, animTimeSec) {
    const hazards = this.hazardPool.getActiveList();
    for (let i = 0; i < hazards.length; i++) {
      const h = hazards[i];
      const remain = h.duration - h.timer;
      const fadeAlpha = remain < 0.5 ? (remain / 0.5) : 1.0;
      const pulse = 0.70 + Math.sin(animTimeSec * 6 + i) * 0.12;
      const alpha = Math.max(0.1, fadeAlpha * pulse);

      const vfxPath = h.kind === 'burn' ? 'assets/vfx/range_earthshaker.png' : 'assets/vfx/range_toxic_acid.png';
      const vfxImg = platform.getImage(vfxPath);

      if (vfxImg) {
        ctx.save();
        ctx.translate(Math.round(h.x), Math.round(h.y));
        ctx.scale(1.0, 0.78); // 贴合 45 度地面斜视角透视
        if (h.kind === 'mist') {
          ctx.rotate(animTimeSec * 0.25 + i * 1.5);
        }
        ctx.globalAlpha = alpha * 0.46; // 轻柔透明的真菌毒雾/地裂表达
        const dSize = h.radiusPx * 2.2;
        ctx.drawImage(vfxImg, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
        ctx.restore();
        continue;
      }

      let sKey = h.spriteKey;
      if (h.kind === 'burn') {
        sKey = (Math.floor(animTimeSec * 6) % 2 === 0) ? 'burn_0' : 'burn_1';
      }

      if (!drawHazardSprite(ctx, sKey, h.x, h.y, h.radiusPx, alpha)) {
        ctx.save();
        ctx.fillStyle = h.color;
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath();
        ctx.ellipse(Math.round(h.x), Math.round(h.y), Math.round(h.radiusPx), Math.round(h.radiusPx * 0.78), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        platform.recordDrawCall(1);
      }
    }
  }

  /**
   * 绘制飞行中的子弹与炮弹（优先使用 100% AI 手绘发光破空光针、地刺与真菌炸弹）
   */
  renderBullets(ctx) {
    const bullets = this.bulletPool.getActiveList();
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];

      let vfxPath = null;
      let drawW = 32, drawH = 32;
      if (b.kind === 'watch') {
        vfxPath = 'assets/vfx/proj_watch_arrow.png';
        drawW = 32; drawH = 9; // 真实飞矢手绘长宽比
      } else if (b.kind === 'thorn') {
        vfxPath = 'assets/vfx/vfx_spikes.png';
        drawW = 28; drawH = 28;
      } else if (b.kind === 'burst') {
        vfxPath = 'assets/vfx/proj_burst_shell.png';
        drawW = 28; drawH = 28;
      } else if (b.kind === 'lumina') {
        vfxPath = 'assets/vfx/item_golden_spore.png';
        drawW = 20; drawH = 20;
      }

      const vfxImg = vfxPath ? platform.getImage(vfxPath) : null;
      if (vfxImg && vfxImg.width) {
        ctx.save();
        ctx.translate(Math.round(b.x), Math.round(b.y));

        // 瞭望菇飞矢：沿飞行角朝向精准破空，带有轻微星蓝破风微粒
        if (b.kind === 'watch') {
          ctx.rotate(b.angle);
          // 箭羽微弱发光
          ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
          ctx.restore();

          // 尾部极微弱星尘拖尾（取代突兀粗长白线）
          ctx.save();
          const backX = b.x - Math.cos(b.angle) * 16;
          const backY = b.y - Math.sin(b.angle) * 16;
          ctx.fillStyle = 'rgba(110, 232, 255, 0.42)';
          ctx.beginPath();
          ctx.arc(backX, backY, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }

        // 爆裂重炮：在空中旋转翻滚
        if (b.kind === 'burst') {
          const rot = b.flightTimer * 12;
          ctx.rotate(rot);
          ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
          ctx.restore();
          continue;
        }

        // 其他投射物
        ctx.rotate(b.angle);
        ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
        ctx.restore();
        continue;
      }

      if (!drawProjectileSprite(ctx, b.spriteKey, b.x, b.y, b.angle, 1.0)) {
        ctx.fillStyle = b.branchColor;
        ctx.fillRect(Math.round(b.x - 4), Math.round(b.y - 4), 8, 8);
        platform.recordDrawCall(1);
      }
    }
  }
}

module.exports = BulletManager;

  };

  /* --- js/game/tower.js --- */
  __modules['js/game/tower'] = function(require, module, exports) {
/**
 * 炮塔与升级分支系统 (js/game/tower.js)
 * 严格实现 5.3 放置、索敌优先级、不重置冷却升级、分支锁定、60%返还出售
 * 以及第六章 6.1-6.4 全部 24 个形态节点的数值与特殊效果
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { TOWERS } = require('../data/towers');
const { tileCenter } = require('./map');
const { drawTowerSprite } = require('../core/atlasRenderer');
const platform = require('../core/platform');
const i18n = require('../i18n/index');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class TowerManager {
  constructor() {
    this.towers = [];
    this.networkEdges = [];
    this.networkTimer = 0;
    this.animTimer = 0;
    this.nextId = 1;
  }

  clear() {
    this.towers.length = 0;
  }

  getTowerAt(col, row) {
    for (let i = 0; i < this.towers.length; i++) {
      const t = this.towers[i];
      if (t.col === col && t.row === row) {
        return t;
      }
    }
    return null;
  }

  /**
   * 种植一座基础蘑菇炮塔
   */
  buildTower(typeId, col, row, map, economy, fx) {
    const def = TOWERS[typeId];
    if (!def) return null;
    if (!map.canBuildAt(col, row)) return null;

    const baseNode = def.nodes.base;
    if (typeId === 'lumina') {
      const luminaCount = this.towers.filter(t => t.typeId === 'lumina').length;
      if (luminaCount >= 3) {
        if (fx) {
          const center = tileCenter(col, row);
          fx.spawnFloatingText(center.x, center.y - 20, '最多同时种植 3 棵灵光菇!', '#FFA39E', 1.25);
        }
        return null;
      }
    }
    if (!economy.spendSpores(baseNode.cost)) {
      return null;
    }

    const center = tileCenter(col, row);
    const maxHp = typeId === 'thorn' ? 220 : (typeId === 'mist' ? 180 : (typeId === 'burst' ? 160 : 140));
    const tower = {
      id: this.nextId++,
      typeId,
      def,
      col,
      row,
      x: center.x,
      y: center.y,
      nodeId: 'base',
      node: baseNode,
      branch: null, // null | 'A' | 'B'
      hp: maxHp,
      maxHp: maxHp,
      dormantTimer: 0,   // >0 时为休眠枯萎状态，不索敌开火
      buffTimer: 0,      // >0 时为甘霖狂暴状态，攻速翻倍
      poisonTimer: 0,    // >0 时为酸液中毒状态，攻速降低
      hitWobbleTimer: 0, // 受击弹性微晃
      totalInvested: baseNode.cost,
      priority: def.defaultPriority,
      cooldown: 0.15, // 种植后极短预热即可开火
      animState: 'upgrade', // 初始种植也播放生长过渡动画
      animFrame: 0,
      animTimer: 0,
      upgradeAnimTimer: 0.36,
      attackAnimTimer: 0,
      squashScaleX: 1.35,  // 落地瞬间压扁拉伸弹性动画 (Squash & Stretch)
      squashScaleY: 0.65,
      squashTimer: 0.30,
      isWebbed: false,     // 是否被腐化蛛丝封印瘫痪
      webHealth: 0,        // 蛛丝血量（需点击3次解救）
      webMaxHealth: 3,
      superchargeTimer: 0  // 能量肥料超频大招倒计时
    };

    const tile = map.getTile(col, row);
    tile.tower = tower;
    this.towers.push(tower);

    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 14, [PALETTE.GROUND_LIGHT, PALETTE.UI_SPORE], 25, 85, 0.2, 0.4, 4);
    }
    platform.playSfx('sfx_build');

    return tower;
  }

  /**
   * 获取指定炮塔当前可用的升级节点列表
   * - base -> ['lv1']
   * - lv1  -> ['a2', 'b2']
   * - a2   -> ['a3']
   * - b2   -> ['b3']
   * - a3/b3 -> []
   */
  getAvailableUpgrades(tower) {
    if (!tower || !tower.node || !tower.node.next) return [];
    return tower.node.next.map((nId) => tower.def.nodes[nId]).filter(Boolean);
  }

  /**
   * 5.3 升级炮塔：随时可升级，不重置攻击冷却，播放 6 帧形态过渡动画与闪光环
   */
  upgradeTower(tower, targetNodeId, economy, fx) {
    if (!tower) return false;
    const allowed = tower.node.next || [];
    if (allowed.indexOf(targetNodeId) === -1) return false;

    const nextNode = tower.def.nodes[targetNodeId];
    if (!nextNode) return false;
    if (!economy.spendSpores(nextNode.cost)) return false;

    // 升级生命提升与状态回满
    const hpBonus = (nextNode.branch ? 80 : 40);
    tower.maxHp += hpBonus;
    tower.hp = tower.maxHp;
    tower.dormantTimer = 0;
    tower.poisonTimer = 0;
    tower.node = nextNode;
    if (nextNode.branch) {
      tower.branch = nextNode.branch;
    }
    tower.totalInvested += nextNode.cost;

    // 播放 6 帧升级过渡动画
    tower.animState = 'upgrade';
    tower.animFrame = 0;
    tower.animTimer = 0;
    tower.upgradeAnimTimer = 0.42;

    if (fx) {
      const bColor = tower.branch === 'A'
        ? PALETTE.BRANCH_A
        : (tower.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.UPGRADE_LV1);
      fx.onUpgradeComplete(tower.x, tower.y, bColor);
    }

    return true;
  }

  /**
   * 5.3 切换索敌优先级
   */
  cyclePriority(tower) {
    if (!tower) return null;
    const list = tower.def.priorities || ['first'];
    if (list.length <= 1) return tower.priority;
    const idx = list.indexOf(tower.priority);
    tower.priority = list[(idx + 1) % list.length];
    platform.playSfx('sfx_click');
    return tower.priority;
  }

  /**
   * 5.2 & 5.3 出售炮塔：随时可出售，返还已投入总额的 60%
   */
  removeTower(tower) {
    if (!tower) return;
    const idx = this.towers.indexOf(tower);
    if (idx !== -1) {
      this.towers.splice(idx, 1);
    }
  }

  sellTower(tower, map, economy, fx) {
    if (!tower) return 0;
    const refund = economy.calculateSellRefund(tower.totalInvested);
    economy.addSpores(refund);

    const tile = map.getTile(tower.col, tower.row);
    if (tile && tile.tower === tower) {
      tile.tower = null;
    }

    const idx = this.towers.indexOf(tower);
    if (idx !== -1) {
      this.towers.splice(idx, 1);
    }

    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 16, [PALETTE.UI_SPORE, PALETTE.MUSHROOM_GILL], 30, 95, 0.2, 0.45, 4);
      fx.spawnFloatingText(tower.x, tower.y - 8, '+' + refund, PALETTE.UI_SPORE, 1.15);
    }
    platform.playSfx('sfx_sell');

    return refund;
  }

  /**
   * 根据炮塔射程、对地/对空能力与索敌优先级筛选最佳目标
   */
  selectTarget(tower, aliveEnemies, map) {
    const rangePx = tower.node.range * TILE_SIZE;
    const r2 = rangePx * rangePx;
    const canGround = tower.def.canHitGround;
    const canAir = tower.def.canHitAir;

    const candidates = [];
    for (let i = 0; i < aliveEnemies.length; i++) {
      const e = aliveEnemies[i];
      if (e.state === 'death') continue;
      if (e.isFlying && !canAir) continue;
      if (!e.isFlying && !canGround) continue;

      const dx = e.x - tower.x;
      const dy = e.y - tower.y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2) {
        candidates.push({ enemy: e, d2 });
      }
    }

    if (candidates.length === 0) return null;

    const prio = tower.priority;

    if (prio === 'nearest') {
      candidates.sort((a, b) => a.d2 - b.d2);
      return candidates[0].enemy;
    }

    if (prio === 'highest_hp') {
      candidates.sort((a, b) => {
        if (b.enemy.hp !== a.enemy.hp) return b.enemy.hp - a.enemy.hp;
        return b.enemy.distPx - a.enemy.distPx;
      });
      return candidates[0].enemy;
    }

    if (prio === 'densest') {
      // 计算每个候选敌人周围（雾团半径或爆裂溅射半径内）的同伴数量
      const clusterRadiusTiles = tower.node.cloudRadius || tower.node.splashRadius || 1.5;
      const cr2 = (clusterRadiusTiles * TILE_SIZE) * (clusterRadiusTiles * TILE_SIZE);

      let bestEnemy = candidates[0].enemy;
      let bestNeighbors = -1;
      let bestProgress = -1;

      for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i].enemy;
        let neighbors = 0;
        for (let j = 0; j < aliveEnemies.length; j++) {
          const other = aliveEnemies[j];
          if (other.state === 'death') continue;
          if (other.isFlying && !canAir) continue;
          if (!other.isFlying && !canGround) continue;
          const dx = other.x - cand.x;
          const dy = other.y - cand.y;
          if (dx * dx + dy * dy <= cr2) {
            neighbors += 1;
          }
        }
        const routeLen = cand.isFlying ? map.airRoute.totalLengthPx : map.groundRoute.totalLengthPx;
        const progress = cand.distPx / Math.max(1, routeLen);
        if (neighbors > bestNeighbors || (neighbors === bestNeighbors && progress > bestProgress)) {
          bestNeighbors = neighbors;
          bestProgress = progress;
          bestEnemy = cand;
        }
      }
      return bestEnemy;
    }

    // 默认 'first'（最前：按距离仓库终点的完成度排序）
    let firstEnemy = candidates[0].enemy;
    let maxProgress = -1;
    for (let i = 0; i < candidates.length; i++) {
      const e = candidates[i].enemy;
      const routeLen = e.isFlying ? map.airRoute.totalLengthPx : map.groundRoute.totalLengthPx;
      const prog = e.distPx / Math.max(1, routeLen);
      if (prog > maxProgress) {
        maxProgress = prog;
        firstEnemy = e;
      }
    }
    return firstEnemy;
  }

  damageTower(tower, dmg, attacker, fx) {
    if (!tower || tower.dormantTimer > 0) return;
    tower.hp -= dmg;
    tower.hitWobbleTimer = 0.22;
    if (fx) {
      fx.spawnParticles(tower.x, tower.y - 8, 4, [PALETTE.MUSHROOM_CAP, PALETTE.UI_SPORE], 20, 60, 0.15, 0.25, 3);
      fx.spawnFloatingText(tower.x, tower.y - 14, `-${Math.round(dmg)}`, '#FF7875', 0.95);
    }
    // 荆棘菇被动反伤
    if (tower.typeId === 'thorn' && attacker && attacker.state !== 'death') {
      const reflect = Math.round(dmg * 1.5);
      attacker.hp -= reflect;
      if (fx) {
        fx.spawnFloatingText(attacker.x, attacker.y - 12, `反伤 -${reflect}`, PALETTE.BRANCH_B, 1.0);
        fx.spawnParticles(attacker.x, attacker.y, 6, [PALETTE.BRANCH_B, '#FFE58F'], 30, 80, 0.2, 0.35, 4);
      }
    }
    if (tower.hp <= 0) {
      tower.hp = 0;
      tower.dormantTimer = 8.0; // 陷入休眠 8 秒
      if (fx) {
        fx.showBanner('防御塔枯萎休眠！', '#FF7875', `${i18n.t(tower.def.nameKey)} 暂时失去战斗力`, 1.3);
      }
    }
  }

  healTower(tower, amount, isFullRevive = false, fx = null) {
    if (!tower) return;
    if (isFullRevive) {
      tower.hp = tower.maxHp;
      tower.dormantTimer = 0;
      tower.poisonTimer = 0;
      tower.buffTimer = 6.0; // 甘霖狂暴 6 秒
    } else {
      tower.hp = Math.min(tower.maxHp, tower.hp + amount);
      if (tower.hp > 0) tower.dormantTimer = 0;
    }
    if (fx) {
      fx.spawnParticles(tower.x, tower.y - 10, 8, ['#52C41A', '#B7EB8F', '#FFE58F'], 25, 75, 0.2, 0.4, 4);
      fx.spawnFloatingText(tower.x, tower.y - 16, '+HP 苏醒', '#52C41A', 1.05);
    }
  }

  /**
   * 固定步长更新所有炮塔的索敌、发射与动画帧
   */

  /**
   * 计算发光菌丝共振网络 (Mycelium Synergy Network)
   * 相邻距离 <= 2.5 格 (80px) 的防御塔建立地下发光菌丝连协
   */
  updateMyceliumNetwork() {
    this.networkEdges.length = 0;
    const n = this.towers.length;
    if (n < 2) {
      if (n === 1) this.towers[0].synergies = null;
      return;
    }

    const maxDist = 135; // 4.2 格 * 32，覆盖相邻拐角战术塔位
    const adj = Array.from({ length: n }, () => []);

    for (let i = 0; i < n; i++) {
      const tA = this.towers[i];
      for (let j = i + 1; j < n; j++) {
        const tB = this.towers[j];
        const dist = Math.hypot(tA.x - tB.x, tA.y - tB.y);
        if (dist <= maxDist) {
          this.networkEdges.push({ a: tA, b: tB });
          adj[i].push(j);
          adj[j].push(i);
        }
      }
    }

    // 连通分量遍历
    const visited = new Array(n).fill(false);
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      const comp = [];
      const queue = [i];
      visited[i] = true;
      while (queue.length > 0) {
        const cur = queue.shift();
        comp.push(this.towers[cur]);
        for (let next of adj[cur]) {
          if (!visited[next]) {
            visited[next] = true;
            queue.push(next);
          }
        }
      }

      // 计算该连通块内的激活羁绊
      const types = new Set(comp.map(t => t.typeId));
      const watchCount = comp.filter(t => t.typeId === 'watch').length;
      const syn = {
        hasTwinWatch: watchCount >= 2,
        hasToxicBurst: types.has('mist') && types.has('burst'),
        hasPoisonThorn: types.has('mist') && types.has('thorn'),
        hasGrandResonance: types.size >= 4
      };

      for (let t of comp) {
        t.synergies = syn;
      }
    }
  }

  /**
   * 绘制地面层发光地下菌丝脉络（在防御塔绘制之前）
   */
  renderMyceliumNetwork(ctx) {
    if (this.networkEdges.length === 0) return;

    for (let i = 0; i < this.networkEdges.length; i++) {
      const edge = this.networkEdges[i];
      const a = edge.a;
      const b = edge.b;

      ctx.save();
      const midX = (a.x + b.x) * 0.5;
      const midY = (a.y + b.y) * 0.5 + 4;

      const isGrand = a.synergies && a.synergies.hasGrandResonance;
      // 极轻柔、低饱和、半透明的自然菌根微光质感（透明度仅 0.12 ~ 0.16，绝不喧宾夺主）
      const glowColor = isGrand ? 'rgba(255, 215, 0, 0.08)' : 'rgba(82, 196, 26, 0.06)';
      const coreColor = isGrand ? 'rgba(255, 235, 140, 0.16)' : 'rgba(180, 255, 210, 0.13)';

      // 1. 柔和半透明地下根须微光底晕
      ctx.save();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y + 8);
      ctx.quadraticCurveTo(midX, midY + 8, b.x, b.y + 8);
      ctx.stroke();

      // 2. 纤细极浅地下自然发光菌丝脉络 (1.0px)
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y + 8);
      ctx.quadraticCurveTo(midX, midY + 8, b.x, b.y + 8);
      ctx.stroke();
      ctx.restore();

      // 3. 极微弱的流动孢子光子 (透明度 0.20)
      const tProg = ((this.animTimer || 0) * 0.35 + i * 0.33) % 1.0;
      const inv = 1 - tProg;
      const nodeX = inv * inv * a.x + 2 * inv * tProg * midX + tProg * tProg * b.x;
      const nodeY = inv * inv * (a.y + 8) + 2 * inv * tProg * (midY + 8) + tProg * tProg * (b.y + 8);
      ctx.fillStyle = isGrand ? 'rgba(255, 229, 143, 0.22)' : 'rgba(186, 231, 255, 0.18)';
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  update(dt, map, enemyManager, bulletManager, economy = null, fx = null, sporelingPatrol = null) {
    this.animTimer += dt;
    this.networkTimer += dt;
    if (this.networkTimer >= 0.4) {
      this.networkTimer = 0;
      this.updateMyceliumNetwork();
    }
    const aliveEnemies = enemyManager.getAliveEnemies();

    for (let i = 0; i < this.towers.length; i++) {
      const t = this.towers[i];

      // 落地 Squash & Stretch 弹性回弹计算
      if (t.squashTimer > 0) {
        t.squashTimer -= dt;
        const p = Math.max(0, t.squashTimer) / 0.30;
        t.squashScaleX = 1.0 + Math.sin(p * Math.PI * 2) * 0.35 * p;
        t.squashScaleY = 1.0 - Math.sin(p * Math.PI * 2) * 0.35 * p;
        if (t.squashTimer <= 0) {
          t.squashScaleX = 1.0;
          t.squashScaleY = 1.0;
        }
      }

      // 超频爆发大招倒计时
      if (t.superchargeTimer > 0) {
        t.superchargeTimer = Math.max(0, t.superchargeTimer - dt);
      }

      // 被蛛丝封印瘫痪
      if (t.isWebbed) {
        t.animState = 'idle';
        continue; // 蛛丝封印中无法索敌攻击
      }

      // 状态计时器推进
      if (t.hitWobbleTimer > 0) {
        t.hitWobbleTimer = Math.max(0, t.hitWobbleTimer - dt);
      }
      if (t.poisonTimer > 0) {
        t.poisonTimer = Math.max(0, t.poisonTimer - dt);
      }
      if (t.buffTimer > 0) {
        t.buffTimer = Math.max(0, t.buffTimer - dt);
      }
      if (t.dormantTimer > 0) {
        t.dormantTimer = Math.max(0, t.dormantTimer - dt);
        if (t.dormantTimer <= 0) {
          t.hp = Math.round(t.maxHp * 0.5); // 自然复苏恢复 50% HP
        }
        continue; // 处于枯萎休眠状态，暂停攻击
      }

      // 冷却递减（狂暴加速，中毒减速，超频4倍射速）
      let speedCoeff = (t.superchargeTimer > 0 ? 2.2 : (t.buffTimer > 0 ? 1.6 : 1.0)) * (t.poisonTimer > 0 ? 0.65 : 1.0);
      if (t.synergies && t.synergies.hasGrandResonance) {
        speedCoeff *= 1.15;
      }
      if (t.cooldown > 0) {
        t.cooldown = Math.max(0, t.cooldown - dt * speedCoeff);
      }

      // 5th Guardian Lumina: Spore Harvest, Healing Pulse & Holy Ward
      if (t.typeId === 'lumina') {
        t.sporeHarvestTimer = (t.sporeHarvestTimer || 0) + dt * speedCoeff;
        const hInterval = t.node.sporeInterval || 10.0;
        if (t.sporeHarvestTimer >= hInterval) {
          t.sporeHarvestTimer = 0;
          const gen = t.node.sporeGen || 8;
          if (economy) {
            economy.addSpores(gen);
          }
          if (fx) {
            fx.spawnFloatingText(t.x, t.y - 24, `+${gen} 孢子`, '#FFE58F', 1.15);
            if (fx.spawnShockwave) fx.spawnShockwave(t.x, t.y, 32, '#FFE58F'); else if (fx.spawnRing) fx.spawnRing(t.x, t.y, 32, '#FFE58F', 0.35, false);
          }
          platform.playSfx('sfx_coin');

          // Healing pulse to wounded guards
          if (sporelingPatrol && t.node.healPerPulse) {
            sporelingPatrol.healGuards(t.x, t.y, t.node.range * TILE_SIZE, t.node.healPerPulse);
            if (fx) {
              fx.spawnParticles(t.x, t.y, 8, ['#52C41A', '#FFE58F'], 20, 40);
            }
          }

          // Holy Ward cleanse against webs & acid
          if (t.node.holyWard) {
            const radPx = t.node.range * TILE_SIZE;
            for (let j = 0; j < this.towers.length; j++) {
              const ot = this.towers[j];
              if (Math.hypot(ot.x - t.x, ot.y - t.y) <= radPx) {
                if (ot.isWebbed || ot.poisonTimer > 0) {
                  ot.isWebbed = false;
                  ot.poisonTimer = 0;
                  if (fx) {
                    fx.spawnFloatingText(ot.x, ot.y - 20, '圣幕净化!', '#BAE7FF', 1.0);
                    fx.spawnParticles(ot.x, ot.y, 8, ['#BAE7FF', '#FFFFFF'], 15, 30);
                  }
                }
              }
            }
          }
        }
      }

      // 升级过渡 6 帧动画或攻击 3 帧动画或待机 4 帧动画更新
      if (t.upgradeAnimTimer > 0) {
        t.upgradeAnimTimer -= dt;
        t.animState = 'upgrade';
        const prog = 1 - Math.max(0, t.upgradeAnimTimer) / 0.42;
        t.animFrame = Math.min(5, Math.floor(prog * 6));
        if (t.upgradeAnimTimer <= 0) {
          t.animState = 'idle';
          t.animFrame = 0;
        }
      } else if (t.attackAnimTimer > 0) {
        t.attackAnimTimer -= dt;
        t.animState = 'attack';
        const prog = 1 - Math.max(0, t.attackAnimTimer) / 0.21;
        t.animFrame = Math.min(2, Math.floor(prog * 3));
        if (t.attackAnimTimer <= 0) {
          t.animState = 'idle';
          t.animFrame = 0;
        }
      } else {
        t.animState = 'idle';
        t.animTimer += dt;
        if (t.animTimer >= 0.18) {
          t.animTimer = 0;
          t.animFrame = (t.animFrame + 1) % 4;
        }
      }

      // 冷却就绪时尝试索敌并开火
      if (t.cooldown <= 0 && aliveEnemies.length > 0) {
        const target = this.selectTarget(t, aliveEnemies, map);
        if (target) {
          this.fireTower(t, target, map, enemyManager, bulletManager);
          t.cooldown = t.node.interval;
          if (t.upgradeAnimTimer <= 0) {
            t.attackAnimTimer = 0.21;
            t.animState = 'attack';
            t.animFrame = 0;
          }
        }
      }
    }
  }

  fireTower(tower, target, map, enemyManager, bulletManager) {
    const node = tower.node;
    const baseDmg = tower.def.baseDamage;

    if (tower.typeId === 'watch') {
      const dist = Math.hypot(target.x - tower.x, target.y - tower.y);
      const travelSec = dist / (node.bulletSpeed || 640);
      const pred = enemyManager.predictEnemyPosition(target, travelSec, map);
      const watchNode = Object.assign({}, node);
      if (tower.synergies && tower.synergies.hasTwinWatch) {
        watchNode.critChance = (watchNode.critChance || 0) + 0.20;
      }
      bulletManager.spawnWatchBullet(tower.x, tower.y - 10, target, pred.x, pred.y, watchNode, baseDmg);
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'mist') {
      bulletManager.spawnMistCloud(target.x, target.y, node);
      platform.playSfx('sfx_mist');
    } else if (tower.typeId === 'thorn') {
      const dist = Math.hypot(target.x - tower.x, target.y - tower.y);
      const travelSec = dist / (node.bulletSpeed || 900);
      const pred = enemyManager.predictEnemyPosition(target, travelSec, map);
      const baseAngle = Math.atan2(pred.y - tower.y, pred.x - tower.x);

      // 主刺
      const thornOpts = { hasPoisonThorn: tower.synergies && tower.synergies.hasPoisonThorn };
      bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle, node, baseDmg, 1.0, thornOpts);

      // A3 箭袋：每次齐射增加 2 根侧刺（左右各偏 12°），侧刺伤害 50%
      if (node.sideSpikes && node.sideSpikes >= 2) {
        const deltaRad = ((node.sideAngleDeg || 12) * Math.PI) / 180;
        const sideRatio = node.sideDamageRatio || 0.50;
        bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle - deltaRad, node, baseDmg, sideRatio);
        bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle + deltaRad, node, baseDmg, sideRatio);
      }
      platform.playSfx('sfx_thorn');
    } else if (tower.typeId === 'burst') {
      const pred = enemyManager.predictEnemyPosition(target, node.flightTime || 0.38, map);
      const burstOpts = { hasToxicBurst: tower.synergies && tower.synergies.hasToxicBurst };
      bulletManager.spawnBurstShell(tower.x, tower.y - 12, pred.x, pred.y, node, baseDmg, burstOpts);
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'lumina') {
      bulletManager.spawnLuminaRay(tower.x, tower.y - 10, target, node, baseDmg);
      platform.playSfx('sfx_laser');
    }
  }

  /**
   * 绘制所有已建造的蘑菇炮塔及其形态徽章
   */
  render(ctx) {
    // 按行从上到下排序绘制，保证 16x24 高塔的前后遮挡关系自然
    this.towers.sort((a, b) => a.row - b.row || a.col - b.col);

    for (let i = 0; i < this.towers.length; i++) {
      const t = this.towers[i];
      let tileX = t.col * TILE_SIZE;
      let tileY = t.row * TILE_SIZE;

      // 受击弹性微晃
      if (t.hitWobbleTimer > 0) {
        tileX += Math.round(Math.sin(t.hitWobbleTimer * 30) * 2.5);
      }

      // 甘霖狂暴脚底翠绿魔法光环
      if (t.buffTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#52C41A';
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.75 + Math.sin(t.buffTimer * 10) * 0.25;
        ctx.beginPath();
        ctx.ellipse(t.x, t.y + 10, 16, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 休眠状态时透明度降低并微偏暗
      if (t.dormantTimer > 0) {
        ctx.save();
        ctx.globalAlpha = 0.55;
      }

      // 落地 Squash & Stretch 弹性变形绘制
      const isSquashing = t.squashTimer > 0;
      if (isSquashing) {
        ctx.save();
        ctx.translate(t.x, tileY + 24);
        ctx.scale(t.squashScaleX, t.squashScaleY);
        ctx.translate(-t.x, -(tileY + 24));
      }

      // 超频大招彩虹金色光芒
      if (t.superchargeTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.8 + Math.sin(t.superchargeTimer * 15) * 0.2;
        ctx.beginPath();
        ctx.ellipse(t.x, t.y + 10, 18, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (t.typeId === 'lumina') {
        // 直接使用 100% 纯正 AI 手绘金色神圣丰收蘑菇，与拖拽种植预览完全一致的模型！
        ctx.save();
        const breathe = 1.0 + Math.sin((t.animTimer || 0) * 4) * 0.04;

        // 地面柔和软接触阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(t.x, tileY + 24, 18 * breathe, 8 * breathe, 0, 0, Math.PI * 2);
        ctx.fill();

        // 柔和神圣阳光呼吸微光光晕 (暖金光圈)
        const glowAlpha = 0.22 + Math.sin((t.animTimer || 0) * 3) * 0.08;
        const gGrad = ctx.createRadialGradient(t.x, tileY + 12, 4, t.x, tileY + 12, 28 * breathe);
        gGrad.addColorStop(0, `rgba(255, 235, 140, ${glowAlpha})`);
        gGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gGrad;
        ctx.beginPath();
        ctx.arc(t.x, tileY + 12, 28 * breathe, 0, Math.PI * 2);
        ctx.fill();

        let artPath = 'assets/vfx/prop_lumina_base.png';
        if (t.branch === 'A') artPath = 'assets/vfx/prop_lumina_a.png';
        else if (t.branch === 'B') artPath = 'assets/vfx/prop_lumina_b.png';
        let lImg = platform.getImage(artPath);
        if (!lImg || !lImg.width) {
          lImg = platform.getImage('assets/vfx/relic_lumina.png') || platform.getImage('assets/vfx/relic_amber.png');
        }

        if (lImg && lImg.width) {
          const dw = 48 * breathe;
          const dh = 48 * breathe;
          ctx.drawImage(lImg, t.x - dw * 0.5, tileY - 18 + (1 - breathe) * 4, dw, dh);
        }
        ctx.restore();
        platform.recordDrawCall(1);
      } else {
        const drawn = drawTowerSprite(ctx, t.typeId, t.nodeId, t.animState, t.animFrame, tileX, tileY);
        if (!drawn) {
          ctx.fillStyle = t.branch === 'A' ? PALETTE.BRANCH_A : (t.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.MUSHROOM_CAP);
          ctx.fillRect(tileX + 4, tileY - 8, 24, 36);
          platform.recordDrawCall(1);
        }
      }
      if (isSquashing) {
        ctx.restore();
      }

      // 腐化蛛丝封印茧：纯 AI 手绘高质感透光蚕茧 vfx_web_cocoon.png
      if (t.isWebbed) {
        ctx.save();
        const webImg = platform.getImage('assets/vfx/vfx_web_cocoon.png');
        const breathe = 1.0 + Math.sin((t.animTimer || 0) * 5) * 0.04;
        const webSize = Math.round(52 * breathe);
        if (webImg && webImg.width) {
          ctx.globalAlpha = 0.92;
          ctx.drawImage(webImg, Math.round(t.x - webSize * 0.5), Math.round(tileY + 12 - webSize * 0.5), webSize, webSize);
        } else {
          ctx.strokeStyle = 'rgba(230, 245, 255, 0.85)';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(t.x, tileY + 12, 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 头顶微操解救气泡标签：精致圆角药丸胶囊
        const badgeW = 74;
        const badgeH = 18;
        const badgeX = Math.round(t.x - badgeW * 0.5);
        const badgeY = tileY - 20;

        ctx.globalAlpha = 0.95;
        ctx.fillStyle = 'rgba(20, 36, 48, 0.88)';
        ctx.beginPath();
        const r = 9;
        ctx.moveTo(badgeX + r, badgeY);
        ctx.lineTo(badgeX + badgeW - r, badgeY);
        ctx.arc(badgeX + badgeW - r, badgeY + r, r, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.lineTo(badgeX + r, badgeY + badgeH);
        ctx.arc(badgeX + r, badgeY + r, r, Math.PI * 0.5, -Math.PI * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#91D5FF';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // 3 颗蛛丝节点状态点
        for (let b = 0; b < 3; b++) {
          const bx = badgeX + 12 + b * 9;
          ctx.beginPath();
          ctx.arc(bx, badgeY + 9, 2.8, 0, Math.PI * 2);
          if (b < t.webHealth) {
            ctx.fillStyle = '#40A9FF';
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(bx - 0.7, badgeY + 8, 1, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#30404D';
            ctx.fill();
          }
        }

        ctx.fillStyle = '#E6F7FF';
        ctx.font = 'bold 9px "PingFang SC", "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('连击救援', badgeX + 38, badgeY + 9);
        ctx.restore();
      }

      if (t.dormantTimer > 0) {
        ctx.restore();
        // 头顶休眠昏睡标记
        ctx.save();
        ctx.fillStyle = '#FF7875';
        ctx.font = 'bold 11px "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('休眠 zZ', t.x, tileY - 14);
        ctx.restore();
      }

      // 受创未满血时显示微型木纹小血条
      if (t.hp < t.maxHp && t.hp > 0) {
        ctx.save();
        const barW = 26;
        const barH = 4;
        const barX = Math.round(t.x - barW * 0.5);
        const barY = tileY - 10;
        // 木纹底槽
        ctx.fillStyle = 'rgba(20, 12, 6, 0.85)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        // 血条填充（绿 -> 橙 -> 红）
        const hpRatio = Math.max(0, t.hp / t.maxHp);
        ctx.fillStyle = hpRatio > 0.5 ? '#52C41A' : (hpRatio > 0.25 ? '#FAAD14' : '#F5222D');
        ctx.fillRect(barX, barY, Math.round(barW * hpRatio), barH);
        ctx.restore();
        platform.recordDrawCall(2);
      }
    }
  }

  /**
   * 敌人腐化织网蛛对防御塔喷丝封印
   */
  applyWeb(tower, webHp = 3, fx = null) {
    if (!tower || tower.isWebbed || tower.dormantTimer > 0) return false;
    tower.isWebbed = true;
    tower.webHealth = webHp;
    tower.webMaxHealth = webHp;
    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 16, ['#FFFFFF', '#E6F7FF', '#D9D9D9'], 20, 70, 0.2, 0.45, 3.5);
      fx.spawnFloatingText(tower.x, tower.y - 18, '蛛网封印!', '#FF7875', 1.1);
    }
    platform.playSfx('sfx_hurt');
    return true;
  }

  /**
   * 玩家点击或释放净化法术撕碎蛛丝解救防御塔
   */
  rescueWeb(tower, fx = null, economy = null) {
    if (!tower || !tower.isWebbed) return false;
    tower.webHealth -= 1;
    if (economy) {
      economy.addSpores(5);
    }
    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 8, ['#E6F7FF', '#BAE7FF', '#FFFFFF'], 20, 60, 0.2, 0.4, 2.5);
      fx.spawnFloatingText(tower.x, tower.y - 20, `-1 破丝 (+5 孢子)`, '#BAE7FF', 0.9);
    }
    platform.playSfx('sfx_laser');

    if (tower.webHealth <= 0) {
      tower.isWebbed = false;
      tower.webHealth = 0;
      this.applySupercharge(tower, 4.5, fx);
      if (fx) {
        fx.spawnParticles(tower.x, tower.y, 28, ['#FFD700', '#FFF1B8', '#69C0FF', '#FFFFFF'], 35, 110, 0.35, 0.65, 4);
        fx.spawnFloatingText(tower.x, tower.y - 30, '挣脱! 破茧狂暴+30%!', '#FFD700', 1.4);
      }
      platform.playSfx('sfx_upgrade');
    }
    return true;
  }
  _unusedRescueWeb(tower, fx = null) {
    if (!tower || !tower.isWebbed) return false;
    tower.webHealth -= 1;
    tower.hitWobbleTimer = 0.15;
    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 6, ['#FFFFFF', '#BAE7FF'], 25, 60, 0.15, 0.25, 2.5);
    }
    if (tower.webHealth <= 0) {
      tower.isWebbed = false;
      tower.webHealth = 0;
      if (fx) {
        fx.spawnParticles(tower.x, tower.y, 20, ['#52C41A', '#FFFFFF', '#BAE7FF'], 40, 95, 0.25, 0.5, 4);
        fx.spawnFloatingText(tower.x, tower.y - 18, '蛛丝破除! 恢复攻击', '#52C41A', 1.15);
      }
      platform.playSfx('sfx_upgrade');
      return true;
    } else {
      platform.playSfx('sfx_click');
    }
    return false;
  }

  /**
   * 施加能量肥料超频大招
   */
  applySupercharge(tower, durationSec = 4.0, fx = null) {
    if (!tower) return;
    tower.superchargeTimer = durationSec;
    tower.isWebbed = false;
    tower.dormantTimer = 0;
    if (fx) {
      fx.triggerScreenShake(3.5, 0.18);
      fx.spawnParticles(tower.x, tower.y, 25, ['#FFE58F', '#FFD666', '#52C41A'], 50, 120, 0.3, 0.6, 5);
      fx.spawnFloatingText(tower.x, tower.y - 20, '超频过载!', '#FFD666', 1.3);
    }
    platform.playSfx('sfx_upgrade');
  }

  /**
   * 触发植物灵能觉醒超载大招（PvZ 能量豆机制对标）
   * 瞬间驱散全异常、满血复原并释放全屏级专属大招！
   */
  triggerAwakening(tower, scene, fx, economy) {
    if (!tower) return false;
    tower.hp = tower.maxHp;
    tower.isWebbed = false;
    tower.poisonTimer = 0;
    tower.dormantTimer = 0;
    tower.superchargeTimer = 8.0;
    tower.animState = 'upgrade';
    tower.squashScaleX = 1.45;
    tower.squashScaleY = 0.55;
    tower.squashTimer = 0.45;

    platform.playSfx('sfx_upgrade');
    if (fx) {
      fx.triggerScreenShake(6.0, 0.45);
      if (fx.spawnShockwave) fx.spawnShockwave(tower.x, tower.y, 110, '#52C41A');
      fx.spawnParticles(tower.x, tower.y, 45, ['#52C41A', '#FFD700', '#FFFFFF', '#69C0FF'], 50, 180, 0.35, 0.85, 6);
    }

    const em = scene ? scene.enemyManager : null;
    const bm = scene ? scene.bulletManager : null;

    if (tower.typeId === 'watch') {
      // 瞭望菇·【千里巡林】：3.5 秒内对全屏所有目标疯狂倾泻 30 发破甲追踪金矢
      if (fx) fx.showBanner('千里巡林·万矢齐发！', '#FFD700', '百步穿杨，全屏贯穿！', 1.8);
      platform.playSfx('sfx_shoot');
      if (em && bm) {
        for (let i = 0; i < 30; i++) {
          setTimeout(() => {
            const targets = em.getAliveEnemies();
            if (targets.length === 0) return;
            const target = targets[i % targets.length];
            bm.spawnArrow(tower.x, tower.y - 14, target, tower.node, 55, true);
            if (i % 3 === 0) platform.playSfx('sfx_shoot');
          }, i * 85);
        }
      }
    } else if (tower.typeId === 'thorn') {
      // 尖刺菇·【千刃地刺】：全场所有地面敌人脚下爆发巨大荆棘地刺，全体定身 4 秒并撕裂
      if (fx) fx.showBanner('千刃荆棘·地刺破空！', '#52C41A', '棘蔓裂土，全域缚杀！', 1.8);
      platform.playSfx('sfx_thorn');
      if (em) {
        const alive = em.getAliveEnemies();
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i];
          if (!e.isFlying && e.state !== 'death') {
            em.applyDamage(e, 260, false, 'pierce', fx, null);
            e.activeSlow = 0.95;
            e.residualSlowValue = 0.90;
            e.residualSlowTimer = 4.0;
            if (fx) {
              fx.spawnParticles(e.x, e.y, 14, ['#52C41A', '#389E0D', '#FF4D4F'], 25, 70, 0.2, 0.45, 4.5);
              if (fx.spawnShockwave) fx.spawnShockwave(e.x, e.y, 40, '#52C41A');
            }
          }
        }
      }
    } else if (tower.typeId === 'burst') {
      // 爆裂菇·【熔岩地核炮】：发射巨型燃烧地核陨石，全屏轰杀并留下熔岩焦土
      if (fx) fx.showBanner('熔岩地核·天坠轰击！', '#FF4D4F', '地心炽炎，全屏熔解！', 1.8);
      platform.playSfx('sfx_bomb');
      if (em && bm) {
        const alive = em.getAliveEnemies();
        const target = alive.length > 0 ? alive[0] : { x: 480, y: 270 };
        bm.spawnCannonball(tower.x, tower.y - 16, target, tower.node, 450);
        setTimeout(() => {
          if (fx) {
            fx.triggerScreenShake(8.0, 0.65);
            if (fx.spawnShockwave) fx.spawnShockwave(target.x, target.y, 160, '#FF4D4F');
            fx.spawnParticles(target.x, target.y, 65, ['#FF4D4F', '#FFA940', '#FFE58F', '#5C4028'], 60, 240, 0.4, 0.95, 7.5);
          }
          if (em) {
            const targets = em.getAliveEnemies();
            for (let i = 0; i < targets.length; i++) {
              const e = targets[i];
              if (Math.hypot(e.x - target.x, e.y - target.y) <= 180) {
                em.applyDamage(e, 420, true, 'splash', fx, null);
              }
            }
          }
        }, 420);
      }
    } else if (tower.typeId === 'mist') {
      // 雾菇·【幽冥剧毒风暴】：全屏剧毒浓雾，敌人减速 85%，护甲削减至 0
      if (fx) fx.showBanner('幽冥瘴气·剧毒风暴！', '#722ED1', '毒雾滔天，护甲消融！', 1.8);
      platform.playSfx('sfx_laser');
      if (em) {
        const alive = em.getAliveEnemies();
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i];
          if (e.state !== 'death') {
            em.applyDamage(e, 160, false, 'magic', fx, null);
            e.baseArmor = 0;
            e.activeSlow = 0.85;
            e.residualSlowValue = 0.85;
            e.residualSlowTimer = 6.5;
            if (fx) fx.spawnParticles(e.x, e.y, 12, ['#B37FEB', '#722ED1', '#BAE7FF'], 20, 65, 0.2, 0.45, 4);
          }
        }
      }
    } else if (tower.typeId === 'lumina') {
      // 灵光菇·【天穹极光圣幕】：全图喷发 150 孢子，全场防御塔获得 8 秒圣幕与双倍攻速
      if (fx) fx.showBanner('天穹极光·万木逢春！', '#FFE58F', '丰饶神迹，极光永驻！', 1.8);
      platform.playSfx('sfx_coin');
      if (economy) {
        economy.addSpores(150);
      }
      if (scene && scene.towerManager) {
        const tws = scene.towerManager.towers;
        for (let i = 0; i < tws.length; i++) {
          const ot = tws[i];
          ot.isWebbed = false;
          ot.poisonTimer = 0;
          ot.dormantTimer = 0;
          ot.superchargeTimer = 8.0;
          if (fx) {
            fx.spawnFloatingText(ot.x, ot.y - 24, '极光狂暴+100%!', '#FFE58F', 1.3);
            fx.spawnParticles(ot.x, ot.y, 14, ['#FFE58F', '#52C41A', '#FFFFFF'], 25, 55, 0.2, 0.45, 4);
          }
        }
      }
    }
    return true;
  }
}

module.exports = TowerManager;

  };

  /* --- js/game/wave.js --- */
  __modules['js/game/wave'] = function(require, module, exports) {
/**
 * 波次与备战倒计时管理器 (js/game/wave.js)
 * 严格实现 5.1 备战倒计时（首波40秒，后续20秒）、5.2 提前召唤奖励与波次奖励、
 * 以及 7.3 波次组出生节奏与同屏波次敌人 <= 12 上限控制
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { WAVES } = require('../data/waves');
const { ENEMIES } = require('../data/enemies');
const platform = require('../core/platform');
const i18n = require('../i18n/index');

class WaveManager {
  constructor(mapId) {
    this.reset(mapId);
  }

  reset(mapId) {
    this.mapId = mapId;
    this.waveList = WAVES[mapId] || WAVES.map1;
    this.totalWaves = this.waveList.length;
    this.currentWaveIndex = 1; // 1..totalWaves
    this.phase = 'prep';       // 'prep' | 'combat' | 'completed'
    this.prepTimerSec = CONFIG.ECONOMY.PREP_TIME_FIRST_WAVE; // 第一波前 40 秒
    this.waveElapsedSec = 0;
    this.activeGroups = [];
  }

  isPrepPhase() {
    return this.phase === 'prep';
  }

  isCombatPhase() {
    return this.phase === 'combat';
  }

  /**
   * 获取下一波（或当前备战波）的敌人种类与数量汇总，供 HUD 备战预告展示
   */
  getUpcomingWaveSummary() {
    const idx = Math.min(this.totalWaves, this.currentWaveIndex) - 1;
    const waveDef = this.waveList[idx];
    if (!waveDef) return [];

    const counts = {};
    const order = [];
    for (let i = 0; i < waveDef.groups.length; i++) {
      const g = waveDef.groups[i];
      if (!counts[g.type]) {
        counts[g.type] = 0;
        order.push(g.type);
      }
      counts[g.type] += g.count;
    }

    return order.map((type) => ({
      type,
      def: ENEMIES[type],
      count: counts[type]
    }));
  }

  /**
   * 进入无尽深渊模式
   */
  startEndlessMode(economy, fx) {
    this.totalWaves = Math.max(this.totalWaves, this.currentWaveIndex + 1);
    this.currentWaveIndex += 1;
    this.phase = 'prep';
    this.prepTimerSec = 4.0;
  }

  /**
   * 手动提前召唤下一波（仅在备战阶段有效）
   */
  callNextWaveEarly(economy, fx) {
    if (this.waveList && this.currentWaveIndex < this.waveList.length && !this.isPrepPhase()) {
      // 战斗中强制双重召怪：触发【贪婪激怒狂潮】
      this.isEnraged = true;
      if (fx) {
        fx.showBanner(i18n.t('banner_enraged_wave'), '#FF4D4F', '双倍战利品', 1.8);
        fx.triggerScreenShake(4.0, 0.35);
      }
      platform.playSfx('sfx_horn');
    }
    if (this.phase !== 'prep') return 0;
    const bonus = economy.grantEarlyCallBonus(this.prepTimerSec);
    if (fx) {
      if (bonus > 0) {
        fx.spawnFloatingText(480, 260, `提前迎敌 +${bonus} 孢子!`, PALETTE.BRANCH_B, 1.35);
        fx.spawnParticles(480, 260, 26, ['#FFE58F', '#FFA940', '#52C41A', '#FFFFFF'], 60, 160, 0.35, 0.7, 4.5);
      }
      fx.showBanner('虫潮先锋突袭！', PALETTE.CRIMSON_SELL, '林地号角长鸣，全军进入战备状态', 1.6);
      fx.triggerScreenShake(2.5, 0.15);
    }
    this.startCurrentWave(economy, fx);
    platform.playSfx('sfx_upgrade');
    return bonus;
  }

  /**
   * 正式开始当前波次
   */
  startCurrentWave(economy, fx) {
    let waveDef = this.waveList[this.currentWaveIndex - 1];
    if (!waveDef) {
      // 动态生成无尽深渊波次
      const extraWaves = this.currentWaveIndex - this.waveList.length;
      const enemyPool = ['beetle', 'swift', 'armored', 'moth', 'splitter', 'burrower', 'weaver', 'leaper', 'siege_beetle', 'volatile_pod'];
      const gCount = Math.min(6, 2 + Math.floor(extraWaves / 2));
      const groups = [];
      for (let gi = 0; gi < gCount; gi++) {
        const eType = (gi === gCount - 1 && extraWaves % 5 === 0)
          ? (extraWaves % 10 === 0 ? 'boss_m3' : 'boss_m1')
          : enemyPool[Math.floor(Math.random() * enemyPool.length)];
        groups.push({
          type: eType,
          count: Math.min(16, 4 + Math.floor(extraWaves * 1.5) + gi * 2),
          interval: Math.max(0.4, 1.4 - extraWaves * 0.05),
          start: gi * 3.5,
          routeIndex: (gi % 2 === 1) ? 1 : 0
        });
      }
      waveDef = { groups };
    }

    this.phase = 'combat';
    this.waveElapsedSec = 0;
    economy.onWaveStart();

    // 同一组出生带一致或微扰的 ±6 像素横向偏移
    this.activeGroups = waveDef.groups.map((g, idx) => ({
      type: g.type,
      count: g.count,
      interval: Math.max(0.2, g.interval || 1.5),
      start: g.start || 0,
      spawned: 0,
      timer: g.interval || 1.5, // 到达 start 时间后立即刷出第 1 只
      groupLateralBase: ((idx % 3) - 1) * 3
    }));

    // 检查是否包含首领，若包含则切换首领战 BGM 并弹出首领警告横幅
    const hasBoss = this.activeGroups.some((g) => ENEMIES[g.type] && ENEMIES[g.type].isBoss);
    if (hasBoss) {
      platform.playBgm('boss_' + this.mapId);
      if (fx) {
        fx.showBanner(
          i18n.t('banner_boss_incoming'),
          PALETTE.ENEMY_EYE,
          i18n.t('wave_label') + ' ' + this.currentWaveIndex + '/' + this.totalWaves,
          1.8
        );
      }
    } else {
      platform.playBgm('bgm_battle');
    }
  }

  /**
   * 固定步长更新备战倒计时或波次出怪
   */
  update(dt, map, enemyManager, economy, fx, onAllWavesCleared, scene = null) {
    if (this.phase === 'completed') return;

    if (this.phase === 'prep') {
      this.prepTimerSec -= dt;
      if (this.prepTimerSec <= 0) {
        this.prepTimerSec = 0;
        this.startCurrentWave(economy, fx);
      }
      return;
    }

    if (this.phase === 'combat') {
      this.waveElapsedSec += dt;

      let allGroupsFinished = true;
      for (let i = 0; i < this.activeGroups.length; i++) {
        const g = this.activeGroups[i];
        if (g.spawned >= g.count) continue;
        allGroupsFinished = false;

        if (this.waveElapsedSec < g.start) continue;

        g.timer += dt;
        if (g.timer >= g.interval) {
          const isBoss = Boolean(ENEMIES[g.type] && ENEMIES[g.type].isBoss);
          const activeWaveEnemies = enemyManager.getActiveWaveEnemyCount();

          // 7.3 同一时刻场上出生的敌人不超过 12 个（首领不受排队阻塞）
          if (isBoss || activeWaveEnemies < CONFIG.COMBAT.MAX_ACTIVE_WAVE_ENEMIES) {
            const jitter = (Math.random() * 2 - 1) * 3;
            const lat = Math.max(
              -CONFIG.COMBAT.SPAWN_LATERAL_OFFSET_PX,
              Math.min(CONFIG.COMBAT.SPAWN_LATERAL_OFFSET_PX, g.groupLateralBase + jitter)
            );
            const spawned = enemyManager.spawnEnemy(g.type, map, this.currentWaveIndex, {
              fromWave: true,
              startDistPx: 0,
              lateralOffsetPx: lat,
              routeIndex: g.routeIndex || 0
            });
            if (spawned) {
              if (g.routeIndex === 1 && scene && typeof scene.triggerFlankAlert === 'function') {
                scene.triggerFlankAlert();
              }
              g.spawned += 1;
              g.timer = 0;
            } else if (!ENEMIES[g.type]) {
              console.warn('Unknown enemy type in wave:', g.type);
              g.spawned += 1;
              g.timer = 0;
            } else {
              g.timer = Math.max(0, g.interval - 0.25);
            }
          }
        }
      }

      // 当本波所有组均已出完，且场上没有任何存活敌人时，本波完成
      if (allGroupsFinished && enemyManager.getAliveEnemies().length === 0) {
        const rewardInfo = economy.grantWaveClearReward(this.currentWaveIndex);

        if (this.currentWaveIndex >= this.totalWaves) {
          if (scene && scene.isEndlessMode) {
            // 无尽模式：持续突破波次上限
            this.currentWaveIndex += 1;
            this.totalWaves = Math.max(this.totalWaves, this.currentWaveIndex);
            this.phase = 'prep';
            this.prepTimerSec = 8.0; // 无尽备战紧凑 8 秒
            storage.recordEndlessWave(this.currentWaveIndex);
            if (fx) {
              fx.showBanner(`🔥 无尽深渊 第 ${this.currentWaveIndex} 波！`, '#FF4D4F', `虫群狂暴加剧 +${Math.round((this.currentWaveIndex - 10) * 12)}% 属性`, 1.8);
              fx.triggerScreenShake(3.0, 0.25);
            }
          } else {
            this.phase = 'completed';
            if (onAllWavesCleared) {
              onAllWavesCleared(rewardInfo);
            }
          }
        } else {
          if (fx) {
            const sub = rewardInfo.flawlessBonus > 0
              ? ('+' + rewardInfo.waveReward + ' / ' + i18n.t('banner_flawless'))
              : ('+' + rewardInfo.waveReward + ' ' + i18n.t('spores_label'));
            fx.showBanner(i18n.t('banner_wave_clear'), PALETTE.UI_SPORE, sub, 1.4);
          }
          this.currentWaveIndex += 1;
          this.phase = 'prep';
          this.prepTimerSec = CONFIG.ECONOMY.PREP_TIME_NEXT_WAVE; // 之后每波备战 20 秒
        }
      }
    }
  }
}

module.exports = WaveManager;

  };

  /* --- js/ui/ui.js --- */
  __modules['js/ui/ui'] = function(require, module, exports) {
/**
 * 商业级奇幻森林手绘 UI 与 HUD 系统 (js/ui/ui.js)
 * 视觉体系：自然奇幻 × 手绘森林 × 雕刻深色木纹 × 暖色羊皮纸 × 古铜金属 × 森林绿珐琅
 * 界面布局：
 * 1. 全屏 960x540 俯视森林战场作为第一视觉主体（移除右侧常驻大面板）
 * 2. 左上角：深色木质藤蔓资源条（生命种子、黄金孢子、波次进度、提前迎敌号角/下波预告）
 * 3. 右上角：古铜木质快捷控制栏（倍速、暂停、图鉴、设置）
 * 4. 底部居中：植物塔防式蘑菇建造卡片栏（瞭望菇、菌雾菇、荆棘菇、爆裂菇）
 * 5. 动态弹出式：防御塔选中与升级羊皮纸木框面板（仅在点击防御塔或空地格时贴靠弹出，不遮挡道路与防御塔）
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { TOWERS, TOWER_ORDER } = require('../data/towers');
const { MAPS, MAP_ORDER } = require('../data/maps');
const { UI_ATLAS, MAP_ATLAS_LAYOUT } = require('../data/atlas');
const { drawUiIcon, drawSpellIcon, drawTowerSprite, drawEnemySprite, drawSubImage } = require('../core/atlasRenderer');
const platform = require('../core/platform');
const i18n = require('../i18n/index');
const storage = require('../save/storage');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

// 规范成熟的现代游戏无衬线字体栈（确保中英文字符在不同操作系统下均笔画清晰、绝不糊成黑团）
const UI_FONT = '"PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
// 典雅史诗风标题衬线字体栈（用于关卡大标题、胜利横幅）
const TITLE_FONT = '"Cinzel", "Noto Serif SC", "Songti SC", "SimSun", serif';
const GAME_FONT = UI_FONT;
const CN_FONT = UI_FONT;

// 四大材质标准色值
const THEME = {
  WOOD_DARK: '#3B2718',
  WOOD_MID: '#5E3E26',
  WOOD_LIGHT: '#875C39',
  PARCHMENT_BG: '#EBDAB2',
  PARCHMENT_LIGHT: '#F5E9C9',
  PARCHMENT_BORDER: '#C4A675',
  INK_DARK: '#2C180A',
  INK_MID: '#543820',
  BRONZE_DARK: '#8C5E2A',
  BRONZE_MID: '#C68F45',
  BRONZE_BRIGHT: '#F2CA74',
  ENAMEL_GREEN: '#3E6B38',
  ENAMEL_GREEN_BRIGHT: '#598E4E',
  CRIMSON_SELL: '#8C2D29',
  SAPPHIRE_PRIO: '#2E5678'
};

function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/**
 * 商业级游戏艺术字渲染器：
 * - 针对小号 UI 字体（<=15px）严格采用发丝级微描边（0.8px）与精细软阴影，彻底消除汉字笔画糊成黑泥团的劣质感；
 * - 羊皮纸/白底背景上采用清爽印刷墨色（无多余描边），保证字字清晰珠玑；
 * - 按钮及高亮字采用自适应双色微渐变与投影高光。
 */
function drawArtText(ctx, text, x, y, options = {}) {
  if (text === undefined || text === null || text === '') return;
  const str = String(text);
  const style = options.style || 'gold';
  const size = options.size || 14;
  const weight = options.weight || 'bold';
  const align = options.align || 'center';
  const baseline = options.baseline || 'middle';
  const fontFam = options.font || (size >= 24 ? TITLE_FONT : UI_FONT);

  ctx.save();
  ctx.font = `${weight} ${size}px ${fontFam}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  // 羊皮纸或浅色面板上的深色印刷文字：零描边、纯正雅致墨色
  if (style === 'ink' || style === 'parchment_body') {
    ctx.fillStyle = options.color || (style === 'ink' ? THEME.INK_DARK : THEME.INK_MID);
    ctx.fillText(str, x, y);
    ctx.restore();
    return;
  }

  // 按钮及徽章等深色/彩色背景文字的色彩方案
  let strokeColor = 'rgba(18, 10, 5, 0.78)';
  let gradColors = ['#FFF9DB', '#FFE58F', '#E6A728', '#8C5611'];
  let shadowColor = 'rgba(0, 0, 0, 0.65)';
  let shadowBlur = 1.5;
  let shadowY = 1.0;

  if (style === 'emerald') {
    strokeColor = 'rgba(8, 26, 7, 0.82)';
    gradColors = ['#F6FFED', '#D9F7BE', '#95DE64', '#389E0D'];
  } else if (style === 'crimson') {
    strokeColor = 'rgba(32, 7, 7, 0.82)';
    gradColors = ['#FFF1F0', '#FFCCC7', '#FF7875', '#CF1322'];
  } else if (style === 'azure') {
    strokeColor = 'rgba(5, 20, 36, 0.82)';
    gradColors = ['#E6F7FF', '#BAE7FF', '#69C0FF', '#1890FF'];
  } else if (style === 'parchment') {
    strokeColor = 'rgba(20, 14, 8, 0.75)';
    gradColors = ['#FFFDF5', '#F5ECD0', '#E5D3A6', '#C9B178'];
  } else if (style === 'white') {
    strokeColor = 'rgba(0, 0, 0, 0.82)';
    gradColors = ['#FFFFFF', '#FFFFFF', '#F0F0F0', '#D9D9D9'];
  }

  if (options.strokeColor) strokeColor = options.strokeColor;
  if (options.shadowColor) shadowColor = options.shadowColor;

  // 描边宽度限制：小字严控在 0.8~1.0px，彻底告别笔画被黑边吞没
  let effectiveStroke = 0;
  if (options.strokeWidth !== undefined) {
    effectiveStroke = options.strokeWidth;
  } else {
    effectiveStroke = size <= 15 ? 0.8 : (size <= 18 ? 1.1 : Math.min(2.0, size * 0.10));
  }

  // 1. 底层精细投影
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = shadowY;

  // 2. 发丝级描边（若开启）
  if (effectiveStroke > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = effectiveStroke * 1.4;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(str, x, y);
  }

  // 关闭投影以渲染清晰字面
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 3. 字体字面（小字优先高对比度第一阶颜色，大字采用微渐变）
  if (size <= 13 && style !== 'gold') {
    ctx.fillStyle = gradColors[0];
    ctx.fillText(str, x, y);
  } else {
    const h = size;
    const topY = baseline === 'middle' ? y - h * 0.5 : (baseline === 'top' ? y : y - h);
    const grad = ctx.createLinearGradient(x, topY, x, topY + h);
    grad.addColorStop(0.0, gradColors[0]);
    grad.addColorStop(0.40, gradColors[1]);
    grad.addColorStop(0.80, gradColors[2]);
    grad.addColorStop(1.0, gradColors[3]);
    ctx.fillStyle = grad;
    ctx.fillText(str, x, y);
  }

  // 4. 大号黄金标题顶边微高光
  if (size >= 16 && style === 'gold') {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(str, x, y - 0.6);
    ctx.restore();
  }

  ctx.restore();
}

class UiManager {
  constructor() {
    this.buttons = [];
    this.hoverX = -1;
    this.hoverY = -1;
    this.uiAnimTime = 0;

    // 弹窗与动态悬浮面板状态
    this.showSettingsModal = false;
    this.showGuideModal = false;
    this.guideStep = 0;
    this.codexTab = 0; // 0: 守林神卫, 1: 虫潮图鉴, 2: 领袖战术
    this.codexSelectedTower = 'watch';
    this.codexSelectedEnemy = 'beetle';
    this.codexEnemyPage = 0;
    this.inspectorOpen = false;
    this.inspectorRect = null;

    // 顶部资源变化缩放反馈与建造冷却动画
    this.lastSeeds = null;
    this.lastSpores = null;
    this.seedPopTimer = 0;
    this.sporePopTimer = 0;
    this.cardCooldowns = { watch: 0, mist: 0, thorn: 0, burst: 0 };

    this.toastText = '';
    this.toastTimer = 0;

    // 拖拽放置守卫系统状态 (Drag-and-Drop)
    this.draggingTowerId = null;
    this.dragStartX = -1;
    this.dragStartY = -1;
    this.dragCurrentX = -1;
    this.dragCurrentY = -1;
    this.isDragging = false;
    this.pressedSlotButton = null;
  }

  update(realDt) {
    this.uiAnimTime += realDt;
    if (this.toastTimer > 0) {
      this.toastTimer = Math.max(0, this.toastTimer - realDt);
    }
    if (this.seedPopTimer > 0) {
      this.seedPopTimer = Math.max(0, this.seedPopTimer - realDt);
    }
    if (this.sporePopTimer > 0) {
      this.sporePopTimer = Math.max(0, this.sporePopTimer - realDt);
    }
    for (let i = 0; i < TOWER_ORDER.length; i++) {
      const k = TOWER_ORDER[i];
      if (this.cardCooldowns[k] > 0) {
        this.cardCooldowns[k] = Math.max(0, this.cardCooldowns[k] - realDt);
      }
    }
  }

  notifyTowerBuilt(towerId) {
    if (towerId && this.cardCooldowns[towerId] !== undefined) {
      this.cardCooldowns[towerId] = 0.45;
    }
  }

  showToast(text, duration = 1.4) {
    this.toastText = text;
    this.toastTimer = duration;
  }

  clearButtons() {
    this.buttons.length = 0;
  }

  registerButton(id, x, y, w, h, onClick, meta = {}) {
    this.buttons.push({ id, x, y, w, h, onClick, meta });
  }

  handlePointerMove(x, y, scene) {
    this.hoverX = x;
    this.hoverY = y;
    if (this.draggingTowerId) {
      this.dragCurrentX = x;
      this.dragCurrentY = y;
      const dist = Math.hypot(x - this.dragStartX, y - this.dragStartY);
      if (dist >= 7) {
        this.isDragging = true;
        if (scene) {
          scene.selectedBuildTowerId = this.draggingTowerId;
        }
      }
    }
  }

  /**
   * 处理按压事件（支持短点击与拖拽起步）
   */
  handlePointerDown(x, y, scene) {
    this.hoverX = x;
    this.hoverY = y;
    this.dragStartX = x;
    this.dragStartY = y;
    this.dragCurrentX = x;
    this.dragCurrentY = y;
    this.isDragging = false;
    this.draggingTowerId = null;
    this.pressedSlotButton = null;

    // 若当前开启了图鉴秘典弹窗，优先拦截并处理弹窗内按钮交互与外部点击关闭
    if (this.showGuideModal) {
      for (let i = this.buttons.length - 1; i >= 0; i--) {
        const b = this.buttons[i];
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          if (b.onClick) b.onClick(b);
          return true;
        }
      }
      const mw = 800;
      const mh = 480;
      const mx = (960 - mw) * 0.5;
      const my = (540 - mh) * 0.5;
      if (x < mx || x > mx + mw || y < my || y > my + mh) {
        this.showGuideModal = false;
        storage.markGuideSeen();
        platform.playSfx('sfx_click');
        return true;
      }
      return true;
    }

    if (scene && scene.state === 'BATTLE') {
      // (A) PvZ 式阳光/晨露金孢点击即时收集
      if (scene.sporeDropManager && scene.sporeDropManager.handlePointerDown(x, y, scene.economy, scene.fx)) {
        return true;
      }

      // (B) 掘地潜行怪点击踩踏 & 自爆蝉点击泄气
      if (scene.enemyManager && scene.enemyManager.handleClickOnEnemy(x, y, scene.fx)) {
        return true;
      }

      // (C) 茧丝缠绕快速点击救援 (Tap-to-Rescue)
      if (scene.towerManager && scene.towerManager.towers) {
        for (let i = 0; i < scene.towerManager.towers.length; i++) {
          const tw = scene.towerManager.towers[i];
          if (tw.isWebbed && Math.hypot(x - tw.x, y - tw.y) <= 32) {
            tw.webTapCount = (tw.webTapCount || 0) + 1;
            scene.economy.addSpores(5);
            scene.fx.spawnFloatingText(tw.x, tw.y - 20, '+5 孢子 撕扯!', '#BAE7FF', 1.0);
            scene.fx.spawnParticles(tw.x, tw.y, 8, ['#BAE7FF', '#FFFFFF'], 15, 30);
            platform.playSfx('sfx_thorn');

            if (tw.webTapCount >= 3) {
              tw.isWebbed = false;
              tw.webTapCount = 0;
              tw.superchargeTimer = 4.0; // 破茧狂暴 2.2 倍攻速！
              scene.fx.spawnFloatingText(tw.x, tw.y - 26, '破茧狂暴 攻速翻倍!', '#FFD700', 1.4);
              scene.fx.spawnParticles(tw.x, tw.y, 20, ['#FFD700', '#FFA940', '#FFFFFF'], 30, 60);
              platform.playSfx('sfx_upgrade');
            }
            return true;
          }
        }
      }

      // (D) 铲子模式点击铲除移植
      if (scene.shovelActive && scene.towerManager) {
        const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
        const mx = (x - mv.OFFSET_X) / mv.SCALE;
        const my = (y - mv.OFFSET_Y) / mv.SCALE;
        const col = Math.floor(mx / TILE_SIZE);
        const row = Math.floor(my / TILE_SIZE);
        const tw = scene.towerManager.getTowerAt(col, row);
        if (tw) {
          scene.shovelTower(tw);
          return true;
        } else {
          scene.toggleShovel(); // 点击空地取消铲子
          return true;
        }
      }
    }
    this.hoverX = x;
    this.hoverY = y;
    this.dragStartX = x;
    this.dragStartY = y;
    this.dragCurrentX = x;
    this.dragCurrentY = y;
    this.isDragging = false;
    this.draggingTowerId = null;
    this.pressedSlotButton = null;

    // 先检测是否按在底部卡牌插槽上
    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        if (b.id && b.id.indexOf('slot_') === 0) {
          const tId = (b.meta && b.meta.towerId) || b.id.replace('slot_', '');
          this.draggingTowerId = tId;
          this.pressedSlotButton = b;
          platform.playSfx('sfx_click');
          return true;
        } else {
          if (b.onClick) {
            b.onClick(b);
          }
          return true;
        }
      }
    }

    if (this.inspectorOpen && this.inspectorRect) {
      const r = this.inspectorRect;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        return true;
      }
    }
    return false;
  }

  /**
   * 处理释放事件（松手放置守卫或响应按钮短按）
   */
  handlePointerUp(x, y, scene) {
    if (this.isDragging && this.draggingTowerId && scene && scene.state === 'BATTLE') {
      const tId = this.draggingTowerId;
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const mx = (x - mv.OFFSET_X) / mv.SCALE;
      const my = (y - mv.OFFSET_Y) / mv.SCALE;
      const col = Math.floor(mx / TILE_SIZE);
      const row = Math.floor(my / TILE_SIZE);

      if (scene.map && scene.map.inBounds(col, row)) {
        if (scene.map.canBuildAt(col, row)) {
          const tDef = TOWERS[tId];
          const cost = tDef ? tDef.nodes.base.cost : 100;
          if (scene.economy && scene.economy.canAfford(cost)) {
            const tower = scene.towerManager.buildTower(tId, col, row, scene.map, scene.economy, scene.fx);
            if (tower) {
              this.notifyTowerBuilt(tId);
              // 触发落地弹性压扁回弹动画 (Squash & Stretch)
              tower.squashTimer = 0.30;
              // 触发相机微震动
              scene.fx.triggerScreenShake(3.0, 0.12);
              // 仙女环生机绿叶与金色孢子爆发冲击波
              scene.fx.spawnParticles(tower.x, tower.y, 22, [PALETTE.BRANCH_A, '#FFE58F', '#52C41A', '#FFFFFF'], 35, 110, 0.25, 0.55, 4.5);
              scene.fx.spawnFloatingText(tower.x, tower.y - 18, `-${cost} 孢子`, '#FFE58F', 1.15);
              platform.playSfx('sfx_build');
              // 放置后保持战场干净清爽，不显示任何攻击距离特效（仅在后续点击该守卫时才展示）
              scene.selectedTile = { col: -1, row: -1 };
              this.inspectorOpen = false;
            }
          } else {
            scene.fx.spawnFloatingText(x, y - 20, '黄金孢子不足!', '#FF4D4F', 1.1);
            scene.fx.triggerScreenShake(1.5, 0.08);
            platform.playSfx('sfx_hurt');
          }
        } else {
          // 非法格子（在道路或障碍物或已有塔上）
          scene.fx.spawnFloatingText(x, y - 20, '此处无法扎根!', '#FF7875', 1.0);
          scene.fx.spawnParticles(x - mv.OFFSET_X, y - mv.OFFSET_Y, 8, ['#D9D9D9', '#8C8C8C'], 15, 40, 0.15, 0.3, 2.5);
          platform.playSfx('sfx_hurt');
        }
      } else {
        platform.playSfx('sfx_hurt');
      }
    } else if (this.pressedSlotButton && !this.isDragging) {
      if (this.pressedSlotButton.onClick) {
        this.pressedSlotButton.onClick(this.pressedSlotButton);
      }
    }

    this.draggingTowerId = null;
    this.isDragging = false;
    this.pressedSlotButton = null;
  }

  isPointHovered(x, y, w, h) {
    return this.hoverX >= x && this.hoverX <= x + w && this.hoverY >= y && this.hoverY <= y + h;
  }

  /**
   * 绘制 AI 绘画 UI 框架组件（带优雅阴影与退化回退）
   */
  drawAiFrame(ctx, frameKey, x, y, w, h, alpha = 1.0) {
    const uiImg = platform.getImage(UI_ATLAS.path);
    const rect = UI_ATLAS.frames && UI_ATLAS.frames[frameKey];
    if (uiImg && rect) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = true;
      if (typeof ctx.imageSmoothingQuality !== 'undefined') {
        ctx.imageSmoothingQuality = 'high';
      }

      const k = (uiImg.width && uiImg.width >= 1024) ? 4 : 1;
      const sx = rect.x * k;
      const sy = rect.y * k;
      const sw = rect.w * k;
      const sh = rect.h * k;

      // 按钮类元素采用成熟的 3-Slice 水平切片：
      // 两端精致的金属包角固定在 16~18px 比例，绝不拉伸变形；
      // 中间平滑延展，为内部文本与图标留出宽阔舒适的放置空间！
      if (frameKey.startsWith('btn_')) {
        const srcCapW = Math.round(sw * 0.25);
        const dstCapW = Math.min(18, Math.max(12, Math.round(h * 0.45)));
        // 1. 左侧金属端头
        ctx.drawImage(uiImg, sx, sy, srcCapW, sh, Math.round(x), Math.round(y), dstCapW, Math.round(h));
        // 2. 中间平展底色
        const midDstW = Math.max(0, Math.round(w) - dstCapW * 2);
        if (midDstW > 0) {
          ctx.drawImage(uiImg, sx + srcCapW, sy, sw - srcCapW * 2, sh, Math.round(x + dstCapW), Math.round(y), midDstW, Math.round(h));
        }
        // 3. 右侧金属端头
        ctx.drawImage(uiImg, sx + sw - srcCapW, sy, srcCapW, sh, Math.round(x + w - dstCapW), Math.round(y), dstCapW, Math.round(h));
      } else {
        ctx.drawImage(uiImg, sx, sy, sw, sh, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
      }

      ctx.restore();
      platform.recordDrawCall(1);
      return true;
    }
    return false;
  }

  /**
   * 森林木质羊皮纸面板
   */
  drawWoodlandPanel(ctx, x, y, w, h, borderColor = THEME.BRONZE_MID, bgAlpha = 0.96, radius = 12, useParchment = false) {
    ctx.save();
    // 底部投影
    roundRectPath(ctx, x + 2, y + 5, w, h, radius);
    ctx.fillStyle = 'rgba(8, 14, 10, 0.46)';
    ctx.fill();

    if (useParchment && this.drawAiFrame(ctx, 'inspector_board', x, y, w, h, bgAlpha)) {
      ctx.restore();
      return;
    }

    roundRectPath(ctx, x, y, w, h, radius);
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    if (useParchment) {
      grad.addColorStop(0, THEME.PARCHMENT_LIGHT);
      grad.addColorStop(1, THEME.PARCHMENT_BG);
    } else {
      grad.addColorStop(0, `rgba(68, 46, 28, ${bgAlpha})`);
      grad.addColorStop(1, `rgba(38, 25, 15, ${bgAlpha})`);
    }
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    roundRectPath(ctx, x + 4, y + 4, w - 8, h - 8, Math.max(4, radius - 3));
    ctx.lineWidth = 1;
    ctx.strokeStyle = useParchment ? 'rgba(110, 74, 38, 0.35)' : 'rgba(255, 224, 150, 0.25)';
    ctx.stroke();
    ctx.restore();
    platform.recordDrawCall(2);
  }

  /**
   * 纯 AI 质感按钮（支持 btn_green / btn_wood / btn_red / btn_blue 等 AI 手绘按钮皮）
   */
  drawPixelButton(ctx, id, x, y, w, h, label, options = {}, onClick = null) {
    const hovered = this.isPointHovered(x, y, w, h);
    const disabled = Boolean(options.disabled);
    const skin = options.skin || (options.bgColor === '#3B1F2B' ? 'btn_red' : (options.bgColor ? 'btn_green' : 'btn_wood'));
    const drawY = hovered && !disabled ? y - 1 : y;

    ctx.save();
    // 按钮底部阴影
    roundRectPath(ctx, x + 1, drawY + 3, w - 2, h, 8);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.fill();

    const drewAi = this.drawAiFrame(ctx, skin, x, drawY, w, h, disabled ? 0.52 : 1.0);
    if (!drewAi) {
      roundRectPath(ctx, x, drawY, w, h, 8);
      ctx.fillStyle = disabled ? '#2A2622' : (skin === 'btn_green' ? THEME.ENAMEL_GREEN : (skin === 'btn_red' ? THEME.CRIMSON_SELL : THEME.WOOD_MID));
      ctx.fill();
      ctx.strokeStyle = hovered && !disabled ? THEME.BRONZE_BRIGHT : THEME.BRONZE_MID;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (hovered && !disabled) {
      roundRectPath(ctx, x + 2, drawY + 2, w - 4, h - 4, 7);
      ctx.strokeStyle = 'rgba(255, 238, 170, 0.78)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    const iconSize = options.iconSize || Math.min(22, h - 10);
    if (options.iconKey) {
      drawUiIcon(ctx, options.iconCat || 16, options.iconKey, x + 12, drawY + Math.floor((h - iconSize) * 0.5), iconSize);
    }

    let fSize = 13;
    if (options.font) {
      const match = options.font.match(/(\d+)px/);
      if (match) fSize = parseInt(match[1], 10);
    }
    const textX = options.align === 'left'
      ? (x + (options.iconKey ? iconSize + 16 : 14))
      : (x + w * 0.5 + (options.iconKey ? iconSize * 0.35 : 0));

    const artStyle = disabled
      ? 'parchment'
      : (skin === 'btn_green' ? 'emerald' : (skin === 'btn_red' ? 'crimson' : (skin === 'btn_blue' ? 'azure' : 'gold')));

    drawArtText(ctx, label, textX, drawY + h * 0.5, {
      style: artStyle,
      size: fSize,
      align: options.align || 'center',
      baseline: 'middle',
      strokeWidth: disabled ? 0.8 : 1.0
    });

    if (options.subLabel) {
      drawArtText(ctx, options.subLabel, x + w - 20, drawY + h * 0.5, {
        style: options.subStyle || (options.subColor === '#FF7875' ? 'crimson' : 'gold'),
        size: 12,
        align: 'right',
        baseline: 'middle',
        strokeWidth: 1.0
      });
    }
    ctx.restore();

    if (onClick && !disabled) {
      this.registerButton(id, x, y, w, h, onClick);
    }
  }

  // =========================================================================
  // 1. 标题画面 (TITLE)
  // =========================================================================
  renderTitleScreen(ctx, scene) {
    this.clearButtons();

    const titleBg = platform.getImage(UI_ATLAS.titleBgPath);
    if (titleBg) {
      ctx.drawImage(titleBg, 0, 0, 960, 540);
      platform.recordDrawCall(1);
    } else {
      ctx.fillStyle = PALETTE.NIGHT_DEEP;
      ctx.fillRect(0, 0, 960, 540);
    }

    // 森林萤火孢子微粒动画
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 97 + Math.floor(this.uiAnimTime * (12 + (i % 5) * 4))) % 920) + 20;
      const sy = ((i * 61 - Math.floor(this.uiAnimTime * (10 + (i % 4) * 3))) % 460 + 460) % 460 + 20;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 228, 130, 0.72)' : 'rgba(145, 255, 165, 0.65)';
      ctx.beginPath();
      ctx.arc(sx, sy, i % 2 === 0 ? 2.4 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 底部雕刻木质命令栏
    this.drawAiFrame(ctx, 'top_bar', 106, 450, 748, 76, 0.96);

    const btns = [
      { id: 'title_start', label: i18n.t('btn_start'), icon: 'play', cat: 16, skin: 'btn_green', cb: () => scene.enterLevelSelect() },
      { id: 'title_levels', label: i18n.t('btn_level_select'), icon: 'star_full', cat: 16, skin: 'btn_wood', cb: () => scene.enterLevelSelect() },
      { id: 'title_guide', label: i18n.t('btn_guide'), icon: 'guide', cat: 24, skin: 'btn_wood', cb: () => { this.guideStep = 0; this.showGuideModal = true; } },
      { id: 'title_settings', label: i18n.t('btn_settings'), icon: 'settings', cat: 16, skin: 'btn_wood', cb: () => { this.showSettingsModal = true; } }
    ];
    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      const bx = 136 + i * 176;
      this.drawPixelButton(ctx, b.id, bx, 466, 160, 44, b.label, {
        skin: b.skin,
        font: `bold 16px ${CN_FONT}`,
        iconCat: b.cat,
        iconKey: b.icon
      }, () => {
        platform.playSfx('sfx_click');
        b.cb();
      });
    }

    this.drawPixelButton(ctx, 'title_lang', 824, 18, 114, 36, i18n.getLang() === 'zh' ? '语言：中文' : 'Lang: EN', {
      skin: 'btn_wood',
      font: `bold 13px ${CN_FONT}`
    }, () => {
      const nextLang = i18n.toggleLang();
      storage.updateSettings({ lang: nextLang });
      platform.playSfx('sfx_click');
    });

    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx);
    } else if (this.showGuideModal) {
      this.renderGuideModal(ctx);
    }
  }

  // =========================================================================
  // 2. 关卡选择画面 (LEVEL_SELECT)
  // =========================================================================
  renderLevelSelect(ctx, scene) {
    this.clearButtons();

    const titleBg = platform.getImage(UI_ATLAS.titleBgPath);
    if (titleBg) {
      ctx.drawImage(titleBg, 0, 0, 960, 540);
      ctx.fillStyle = 'rgba(14, 22, 16, 0.76)';
      ctx.fillRect(0, 0, 960, 540);
    } else {
      ctx.fillStyle = PALETTE.NIGHT_DEEP;
      ctx.fillRect(0, 0, 960, 540);
    }

    // 顶部木质横幅
    this.drawAiFrame(ctx, 'top_bar', 270, 10, 420, 56, 0.98);
    ctx.fillStyle = THEME.BRONZE_BRIGHT;
    ctx.font = `bold 22px ${CN_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i18n.t('btn_level_select'), 480, 38);

    this.drawPixelButton(ctx, 'lvl_back', 24, 18, 112, 40, i18n.t('btn_back'), {
      skin: 'btn_wood',
      font: `bold 15px ${CN_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      scene.enterTitle();
    });

    this.drawPixelButton(ctx, 'lvl_settings', 824, 18, 112, 40, i18n.t('btn_settings'), {
      skin: 'btn_wood',
      iconKey: 'settings',
      font: `bold 14px ${CN_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      this.showSettingsModal = true;
    });

    const save = storage.getSave();

    for (let i = 0; i < MAP_ORDER.length; i++) {
      const mapId = MAP_ORDER[i];
      const mData = MAPS[mapId];
      const rec = (save.maps && save.maps[mapId]) || { unlocked: i === 0, stars: 0, bestTime: null, bestSeeds: 0 };
      const cardX = 24 + i * 312;
      const cardY = 80;
      const cardW = 288;
      const cardH = 430;

      // 使用 AI 手绘木框羊皮纸大卡片
      this.drawWoodlandPanel(ctx, cardX, cardY, cardW, cardH, rec.unlocked ? THEME.BRONZE_MID : '#5A554C', 0.98, 14, true);

      const prevX = cardX + 24;
      const prevY = cardY + 24;
      const prevW = cardW - 48;
      const prevH = 132;
      const mAtlas = platform.getImage(mData.atlasPath);
      if (mAtlas && MAP_ATLAS_LAYOUT.sceneBg) {
        const sb = MAP_ATLAS_LAYOUT.sceneBg;
        drawSubImage(ctx, mAtlas, sb.x, sb.y, sb.w, sb.h, prevX, prevY, prevW, prevH);
      } else {
        ctx.fillStyle = mData.parallaxColors[1] || PALETTE.GROUND_DARK;
        ctx.fillRect(prevX, prevY, prevW, prevH);
      }
      ctx.strokeStyle = THEME.WOOD_DARK;
      ctx.lineWidth = 3;
      ctx.strokeRect(prevX, prevY, prevW, prevH);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 19px ${CN_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(i18n.t(mData.nameKey), cardX + cardW * 0.5, cardY + 178);

      ctx.fillStyle = THEME.ENAMEL_GREEN;
      ctx.font = `bold 13px ${CN_FONT}`;
      ctx.fillText(i18n.t(mData.subtitleKey), cardX + cardW * 0.5, cardY + 201);

      for (let s = 0; s < 3; s++) {
        const starKey = s < rec.stars ? 'star_full' : 'star_empty';
        drawUiIcon(ctx, 16, starKey, cardX + 96 + s * 34, cardY + 216, 28);
      }

      this.drawWrappedText(ctx, i18n.t(mData.descKey), cardX + 26, cardY + 258, cardW - 52, 18, THEME.INK_MID, `12px ${CN_FONT}`);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 12px ${CN_FONT}`;
      ctx.textAlign = 'left';
      const timeStr = rec.bestTime !== null ? (rec.bestTime + 's') : i18n.t('record_none');
      const seedStr = rec.bestSeeds > 0 ? (rec.bestSeeds + ' / 20') : i18n.t('record_none');
      ctx.fillText(i18n.t('best_time') + ': ' + timeStr, cardX + 26, cardY + 322);
      ctx.fillText(i18n.t('best_seeds') + ': ' + seedStr, cardX + 26, cardY + 342);

      if (rec.unlocked) {
        this.drawPixelButton(ctx, 'play_' + mapId, cardX + 28, cardY + 362, cardW - 56, 44, i18n.t('btn_start'), {
          skin: 'btn_green',
          font: `bold 16px ${CN_FONT}`,
          iconKey: 'play'
        }, () => {
          platform.playSfx('sfx_click');
          scene.startLevel(mapId);
        });
      } else {
        this.drawPixelButton(ctx, 'locked_' + mapId, cardX + 28, cardY + 362, cardW - 56, 44, i18n.t('map_locked'), {
          skin: 'btn_wood',
          disabled: true,
          font: `bold 13px ${CN_FONT}`,
          iconKey: 'lock'
        });
      }
    }

    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx);
    }
  }

  // =========================================================================
  // 3. 战斗 HUD：全屏森林战场环绕式布局
  // =========================================================================
  renderBattleHud(ctx, scene) {
    this.clearButtons();

    // 1. 左上角：深色木质资源栏 + 波次状态与提前召唤号角
    this.renderTopResourceBar(ctx, scene);

    // 1.25 顶部居中：自然天候生态实时徽章 (晴空 / 雷雨 / 迷雾 / 血月)
    if (scene.weather) {
      scene.weather.renderTopWeatherBadge(ctx, 426, 16);
    }

    // 1.5 战术成就达成即时滑入横幅 (Kingdom Rush 20大成就)
    if (scene.achievements) {
      scene.achievements.renderToast(ctx);
    }

    // 侧翼突袭动态警报横幅 (Flank Incursion Banner)
    if (scene.flankAlertTimer > 0) {
      ctx.save();
      const bannerW = 420;
      const bannerH = 40;
      const bx = (960 - bannerW) * 0.5;
      const by = 68;
      const pulse = 1.0 + Math.sin(this.uiAnimTime * 12) * 0.04;

      ctx.translate(480, 88);
      ctx.scale(pulse, pulse);
      ctx.translate(-480, -88);

      roundRectPath(ctx, bx, by, bannerW, bannerH, 10);
      ctx.fillStyle = 'rgba(140, 29, 24, 0.92)';
      ctx.fill();
      ctx.strokeStyle = '#FFA39E';
      ctx.lineWidth = 2;
      ctx.stroke();

      drawArtText(ctx, '⚠️ 敌军侧翼突袭! 注意防范南路溪径!', 480, 88, {
        style: 'gold',
        size: 15,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.8
      });
      ctx.restore();
    }

    // 铲子模式全屏指示
    if (scene.shovelActive) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 77, 79, 0.15)';
      ctx.fillRect(0, 0, 960, 540);
      drawArtText(ctx, '【铲子模式】点击任意蘑菇进行移植回收，点击空地退出', 480, 395, {
        style: 'gold',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.5
      });
      ctx.restore();
    }

    // 2. 右上角：古铜木质快捷控制栏（倍速、暂停、图鉴、设置）
    this.renderTopRightControls(ctx, scene);

    // 3. 左下角：指挥官战术主动技能勋章栏（自然甘霖 [Q]、雷霆震爆 [W]、大地丰收 [E]）
    this.renderCommanderSpellDock(ctx, scene);

    // 4. 底部居中：植物塔防式蘑菇建造卡片栏
    this.renderBottomBuildDock(ctx, scene);

    // 5. 动态弹出式：防御塔选中与升级羊皮纸木框面板（仅在点击交互时弹出）
    if (this.inspectorOpen) {
      this.renderTowerInspectorPopup(ctx, scene);
    } else {
      this.inspectorRect = null;
    }

    // 6. 处于战术法术施法瞄准时绘制动态准星与范围环
    if (scene.activeSpellCasting) {
      this.renderSpellTargetingReticle(ctx, scene);
    }
    if (scene.activeRallyTargeting) {
      this.renderRallyTargetingReticle(ctx, scene);
    }

    // 6.5 拖拽放置守卫全息射程环与磁吸吸附高亮
    this.renderTowerDragPreview(ctx, scene);

    // 7. 轻量化提示气泡
    if (this.toastTimer > 0 && this.toastText) {
      ctx.save();
      this.drawAiFrame(ctx, 'btn_wood', 330, 74, 300, 38, 0.95);
      drawArtText(ctx, this.toastText, 480, 93, {
        style: 'parchment',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.5
      });
      ctx.restore();
    }

    // 8. 模态弹窗（暂停、结算、新手引导、设置）
    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx);
    } else if (this.showGuideModal) {
      this.renderGuideModal(ctx);
    } else if (scene.state === 'PAUSED') {
      this.renderPauseOverlay(ctx, scene);
    } else if (scene.state === 'SETTLEMENT') {
      this.renderSettlementOverlay(ctx, scene);
    }
  }

  /**
   * 3.1 左上角深色雕刻木质资源栏（生命种子、黄金孢子、波次进度、提前迎敌）
   */
  renderTopResourceBar(ctx, scene) {
    const seeds = scene.economy.seeds;
    const spores = scene.economy.spores;
    if (this.lastSeeds !== null && this.lastSeeds !== seeds) {
      this.seedPopTimer = 0.28;
    }
    if (this.lastSpores !== null && this.lastSpores !== spores) {
      this.sporePopTimer = 0.24;
    }
    this.lastSeeds = seeds;
    this.lastSpores = spores;

    const barX = 12;
    const barY = 8;
    const barW = 446;
    const barH = 54;

    // 顶部 AI 雕刻木纹藤蔓横梁
    this.drawAiFrame(ctx, 'top_bar', barX, barY, barW, barH, 0.98);

    // (A) 生命种子胶囊槽
    ctx.save();
    roundRectPath(ctx, barX + 26, barY + 13, 98, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const seedScale = 1 + (this.seedPopTimer > 0 ? Math.sin((this.seedPopTimer / 0.28) * Math.PI) * 0.22 : 0);
    drawUiIcon(ctx, 16, 'seed', barX + 32, barY + 14, 26);
    ctx.translate(barX + 82, barY + 27);
    ctx.scale(seedScale, seedScale);
    drawArtText(ctx, String(seeds), 0, 0, {
      style: seeds <= 5 ? 'crimson' : 'parchment',
      size: 17,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.8
    });
    ctx.restore();

    // (B) 黄金孢子胶囊槽
    ctx.save();
    roundRectPath(ctx, barX + 132, barY + 13, 122, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const sporeScale = 1 + (this.sporePopTimer > 0 ? Math.sin((this.sporePopTimer / 0.24) * Math.PI) * 0.22 : 0);
    drawUiIcon(ctx, 16, 'spore', barX + 138, barY + 14, 26);
    ctx.translate(barX + 202, barY + 27);
    ctx.scale(sporeScale, sporeScale);
    drawArtText(ctx, String(spores), 0, 0, {
      style: 'gold',
      size: 17,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 2.0
    });
    ctx.restore();

    // (C) 波次进度与状态铭牌
    const waveMgr = scene.waveManager;
    ctx.save();
    roundRectPath(ctx, barX + 262, barY + 13, 160, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.58)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawUiIcon(ctx, 16, 'skull', barX + 268, barY + 15, 24);
    drawArtText(ctx, `第 ${waveMgr.currentWaveIndex}/${waveMgr.totalWaves} 波`, barX + 295, barY + 27, {
      style: 'parchment',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 1.5
    });

    const statusTag = waveMgr.isPrepPhase()
      ? `${Math.ceil(waveMgr.prepTimerSec)}s`
      : '迎战';
    drawArtText(ctx, statusTag, barX + 414, barY + 27, {
      style: waveMgr.isPrepPhase() ? 'azure' : 'crimson',
      size: 12,
      align: 'right',
      baseline: 'middle',
      strokeWidth: 1.5
    });
    ctx.restore();

    // (D) 紧邻资源条右侧：备战期「提前迎敌 (+奖励)」号角按钮 或 战斗期「下波预告」胶囊
    if (waveMgr.isPrepPhase()) {
      const earlyBonus = Math.min(
        CONFIG.ECONOMY.EARLY_CALL_MAX,
        Math.floor(waveMgr.prepTimerSec * CONFIG.ECONOMY.EARLY_CALL_PER_SEC)
      );
      this.drawPixelButton(
        ctx,
        'hud_call_wave',
        464,
        14,
        154,
        40,
        `提前迎敌 +${earlyBonus}`,
        {
          skin: 'btn_green',
          font: `bold 13px ${CN_FONT}`,
          iconKey: 'horn',
          iconSize: 22
        },
        () => {
          scene.callWaveEarly();
        }
      );
    } else {
      const summary = waveMgr.getUpcomingWaveSummary();
      if (summary.length > 0) {
        ctx.save();
        this.drawAiFrame(ctx, 'btn_wood', 464, 14, 154, 40, 0.92);
        const first = summary[0];
        drawEnemySprite(ctx, first.type, 'walk', 0, 488, 34, false);
        drawArtText(ctx, `波次: ${i18n.t(first.def.nameKey)} ×${first.count}`, 506, 34, {
          style: 'parchment',
          size: 12,
          align: 'left',
          baseline: 'middle',
          strokeWidth: 1.5
        });
        ctx.restore();
      }
    }
  }

  /**
   * 3.2 右上角快捷控制栏（倍速、暂停、图鉴、设置）
   */
  renderTopRightControls(ctx, scene) {
    // 倍速切换按钮 (1x / 2x / 3x)
    this.drawPixelButton(
      ctx,
      'hud_speed',
      648,
      14,
      82,
      40,
      `${scene.speedMultiplier}× 加速`,
      {
        skin: scene.speedMultiplier > 1 ? 'btn_blue' : 'btn_wood',
        font: `bold 12px ${CN_FONT}`,
        iconKey: 'speed',
        iconSize: 20
      },
      () => {
        scene.cycleSpeed();
      }
    );

    // 暂停按钮
    this.drawPixelButton(
      ctx,
      'hud_pause',
      736,
      14,
      72,
      40,
      '暂停',
      {
        skin: 'btn_wood',
        font: `bold 12px ${CN_FONT}`,
        iconKey: 'pause',
        iconSize: 18
      },
      () => {
        scene.pauseGame();
      }
    );

    // 战术图鉴按钮
    this.drawPixelButton(
      ctx,
      'hud_guide',
      814,
      14,
      66,
      40,
      '图鉴',
      {
        skin: 'btn_wood',
        font: `bold 12px ${CN_FONT}`,
        iconCat: 24,
        iconKey: 'guide',
        iconSize: 18
      },
      () => {
        platform.playSfx('sfx_click');
        this.guideStep = 0;
        this.showGuideModal = true;
      }
    );

    // 设置按钮
    this.drawPixelButton(
      ctx,
      'hud_settings',
      886,
      14,
      62,
      40,
      '设置',
      {
        skin: 'btn_wood',
        font: `bold 12px ${CN_FONT}`,
        iconKey: 'settings',
        iconSize: 18
      },
      () => {
        platform.playSfx('sfx_click');
        this.showSettingsModal = true;
      }
    );
  }

  /**
   * 3.25 左下角指挥官战术主动技能勋章栏（自然甘霖 [Q]、雷霆震爆 [W]、大地丰收 [E]）
   */
  renderCommanderSpellDock(ctx, scene) {
    const spellList = [
      { id: 'rain', hotkey: 'Q', tip: '自然甘霖 (急救回血/攻速翻倍)' },
      { id: 'shock', hotkey: 'W', tip: '雷霆震爆 (轰击眩晕/定身3秒)' },
      { id: 'harvest', hotkey: 'E', tip: '大地丰收 (+120黄金孢子)' },
      { id: 'rally', hotkey: 'R', tip: '菇精卫 (调兵接怪阻挡)' }
    ];

    const dockX = 14;
    const btnSize = 52;
    const gap = 12;
    const totalW = spellList.length * btnSize + (spellList.length - 1) * gap; // 244

    // -----------------------------------------------------------------
    // [A] 上层领袖指挥台：英雄调遣 + 裂地斩 [F] + 灵能觉醒种子 [空格]
    // -----------------------------------------------------------------
    const heroBarY = 370;
    const heroBarH = 62;
    ctx.save();
    roundRectPath(ctx, dockX - 6, heroBarY, totalW + 12, heroBarH, 14);
    ctx.fillStyle = 'rgba(22, 14, 8, 0.82)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    drawArtText(ctx, '森林领袖 · 灵能超载', dockX + totalW * 0.5, heroBarY + 8, {
      style: 'gold',
      size: 10,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });
    ctx.restore();

    // 1. 英雄头像与状态槽 (X = dockX + 4, Y = heroBarY + 16, 44x40)
    const hx = dockX + 6;
    const hy = heroBarY + 16;
    const hero = scene.hero;
    const isHeroRallying = scene.activeHeroRally || (hero && hero.isSelected);

    ctx.save();
    roundRectPath(ctx, hx, hy, 44, 40, 10);
    ctx.fillStyle = 'rgba(15, 20, 15, 0.9)';
    ctx.fill();
    ctx.strokeStyle = isHeroRallying ? '#FFE58F' : '#8C5E2A';
    ctx.lineWidth = isHeroRallying ? 2.5 : 1.5;
    ctx.stroke();

    // 绘制英雄头像
    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    if (heroImg && heroImg.width) {
      ctx.drawImage(heroImg, hx + 2, hy + 2, 40, 36);
    }

    // 等级角标
    roundRectPath(ctx, hx - 2, hy - 4, 22, 14, 4);
    ctx.fillStyle = '#8C5E2A';
    ctx.fill();
    drawArtText(ctx, `L${hero ? hero.level : 1}`, hx + 9, hy + 3, {
      style: 'gold',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    // 英雄血条
    if (hero) {
      const hpRatio = Math.max(0, hero.hp / hero.maxHp);
      roundRectPath(ctx, hx + 2, hy + 34, 40, 4, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fill();
      roundRectPath(ctx, hx + 2, hy + 34, 40 * hpRatio, 4, 2);
      ctx.fillStyle = hero.state === 'dead' ? '#8C2D29' : (hpRatio > 0.4 ? '#52C41A' : '#FF4D4F');
      ctx.fill();
    }
    ctx.restore();

    this.registerButton('hero_portrait', hx, hy, 44, 40, () => {
      if (scene.hero) {
        scene.activeHeroRally = !scene.activeHeroRally;
        scene.hero.isSelected = scene.activeHeroRally;
        platform.playSfx('sfx_click');
        if (scene.activeHeroRally) {
          scene.fx.spawnFloatingText(scene.hero.x, scene.hero.y - 24, '集结驻守：点击战场移动', '#FFE58F', 1.2);
        }
      }
    });

    // 2. 英雄专属大招【大地裂地斩】 [F]
    const sx = dockX + 66;
    const sy = heroBarY + 16;
    const skillOnCd = hero ? (hero.skillCooldown > 0 || hero.state === 'dead') : true;

    ctx.save();
    roundRectPath(ctx, sx, sy, 48, 40, 10);
    ctx.fillStyle = 'rgba(20, 15, 10, 0.9)';
    ctx.fill();

    if (!skillOnCd) {
      const pulse = 1 + Math.sin(this.uiAnimTime * 8) * 0.08;
      ctx.save();
      ctx.translate(sx + 24, sy + 20);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = !skillOnCd ? '#FFD700' : '#5E3E26';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    drawArtText(ctx, '裂地斩', sx + 24, sy + 15, {
      style: !skillOnCd ? 'gold' : 'parchment',
      size: 11,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });

    if (skillOnCd && hero) {
      const cdSec = hero.state === 'dead' ? Math.ceil(hero.reviveTimer) : Math.ceil(hero.skillCooldown);
      drawArtText(ctx, `${cdSec}s`, sx + 24, sy + 28, {
        style: 'crimson',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });
    } else {
      drawArtText(ctx, '就绪', sx + 24, sy + 28, {
        style: 'emerald',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });
    }

    // 快捷键角标 [F]
    roundRectPath(ctx, sx - 2, sy - 4, 16, 14, 4);
    ctx.fillStyle = '#1D39C4';
    ctx.fill();
    drawArtText(ctx, 'F', sx + 6, hy + 3, {
      style: 'gold',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });
    ctx.restore();

    this.registerButton('hero_ult_btn', sx, sy, 48, 40, () => {
      if (scene.hero) {
        scene.hero.castUltimateSkill(scene.enemyManager, scene.fx);
      }
    });

    // 3. 灵能超载觉醒种子 [空格]
    const ax = dockX + 130;
    const ay = heroBarY + 16;
    const isAwakeningActive = Boolean(scene.activeAwakeningTargeting);

    ctx.save();
    roundRectPath(ctx, ax, ay, 52, 40, 10);
    ctx.fillStyle = 'rgba(25, 12, 35, 0.92)';
    ctx.fill();

    if (isAwakeningActive) {
      const pulse = 1 + Math.sin(this.uiAnimTime * 10) * 0.10;
      ctx.save();
      ctx.translate(ax + 26, ay + 20);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#B37FEB';
      ctx.lineWidth = 2.8;
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = isAwakeningActive ? '#D3ADF7' : '#722ED1';
    ctx.lineWidth = isAwakeningActive ? 2.4 : 1.6;
    ctx.stroke();

    const seedImg = platform.getImage('assets/vfx/item_awakening_seed.png');
    if (seedImg && seedImg.width) {
      ctx.drawImage(seedImg, ax + 4, ay + 4, 28, 32);
    }

    // 数量角标
    const seedCount = scene.awakeningSeeds || 0;
    drawArtText(ctx, `×${seedCount}`, ax + 38, ay + 20, {
      style: seedCount > 0 ? 'gold' : 'parchment',
      size: 13,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.2
    });

    // 快捷键提示
    roundRectPath(ctx, ax - 2, ay - 4, 24, 14, 4);
    ctx.fillStyle = '#722ED1';
    ctx.fill();
    drawArtText(ctx, '空格', ax + 10, ay + 3, {
      style: 'gold',
      size: 8,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });
    ctx.restore();

    this.registerButton('awakening_btn', ax, ay, 52, 40, () => {
      if ((scene.awakeningSeeds || 0) > 0) {
        scene.activeAwakeningTargeting = !scene.activeAwakeningTargeting;
        platform.playSfx('sfx_click');
        if (scene.activeAwakeningTargeting) {
          scene.fx.spawnFloatingText(480, 240, '请点击场上的蘑菇触发灵能觉醒超载!', '#722ED1', 1.5);
        }
      } else {
        scene.fx.spawnFloatingText(480, 240, '灵能觉醒种子不足(击退精英虫怪获取)!', '#FF4D4F', 1.2);
        platform.playSfx('sfx_sell');
      }
    });

    // 3.5 战术三姿态微操按键 [Z] (守卫 🛡️ / 狂暴 ⚔️ / 游侠 🏹)
    const zx = dockX + 246;
    const zy = heroBarY + 16;
    const curStance = hero ? hero.stance : 'guardian';
    const stanceMeta = {
      guardian: { icon: '🛡️', name: '守卫', color: '#40A9FF', border: '#1890FF' },
      aggressive: { icon: '⚔️', name: '狂暴', color: '#FF4D4F', border: '#F5222D' },
      scout: { icon: '🏹', name: '游侠', color: '#52C41A', border: '#389E0D' }
    };
    const sm = stanceMeta[curStance] || stanceMeta.guardian;

    ctx.save();
    roundRectPath(ctx, zx, zy, 46, 40, 10);
    ctx.fillStyle = 'rgba(20, 15, 12, 0.92)';
    ctx.fill();
    ctx.strokeStyle = sm.border;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sm.icon, zx + 23, zy + 15);

    drawArtText(ctx, sm.name, zx + 23, zy + 28, {
      style: 'gold',
      size: 10,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    // 快捷键角标 [Z]
    roundRectPath(ctx, zx - 2, zy - 4, 16, 14, 4);
    ctx.fillStyle = sm.border;
    ctx.fill();
    drawArtText(ctx, 'Z', zx + 6, zy + 3, {
      style: 'gold',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });
    ctx.restore();

    this.registerButton('hero_stance_btn', zx, zy, 46, 40, () => {
      if (scene.hero) {
        scene.hero.cycleStance(scene.fx);
        if (scene.hero.stanceSwitchedCount >= 3 && scene.achievements) {
          scene.achievements.unlock('tactical_stances', scene.fx);
        }
      }
    });

    // 4. 林地秘典图鉴快捷入口按钮 [图鉴]
    const gx = dockX + 196;
    const gy = heroBarY + 16;
    ctx.save();
    roundRectPath(ctx, gx, gy, 44, 40, 10);
    ctx.fillStyle = 'rgba(28, 20, 10, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#C68F45';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    drawArtText(ctx, '图鉴', gx + 22, gy + 15, {
      style: 'gold',
      size: 12,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });
    drawArtText(ctx, '秘典', gx + 22, gy + 28, {
      style: 'parchment',
      size: 10,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });
    ctx.restore();

    this.registerButton('dock_guide_btn', gx, gy, 44, 40, () => {
      this.showGuideModal = true;
      platform.playSfx('sfx_click');
    });

    // -----------------------------------------------------------------
    // [B] 下层指挥官战术法术栏（自然甘霖 [Q]、雷霆震爆 [W]、大地丰收 [E]、菇精卫 [R]）
    // -----------------------------------------------------------------
    const dockY = 444;

    // 绘制木纹古铜底盘
    ctx.save();
    roundRectPath(ctx, dockX - 6, dockY - 14, totalW + 12, btnSize + 28, 14);
    ctx.fillStyle = 'rgba(24, 16, 9, 0.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    drawArtText(ctx, '战术法术', dockX + totalW * 0.5, dockY - 6, {
      style: 'gold',
      size: 10,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });
    ctx.restore();

    for (let i = 0; i < spellList.length; i++) {
      const item = spellList[i];
      let sp = scene.spells[item.id];
      if (item.id === 'rally') {
        const cd = scene.sporelingPatrol ? scene.sporelingPatrol.repositionCooldown : 0;
        sp = { timer: cd, maxCooldown: 2.0, cost: 0 };
      }
      if (!sp) continue;

      const bx = dockX + i * (btnSize + gap);
      const by = dockY + 4;
      const hovered = this.isPointHovered(bx, by, btnSize, btnSize);
      const isCasting = scene.activeSpellCasting === item.id;
      const onCd = sp.timer > 0;
      const affordable = sp.cost === 0 || scene.economy.canAfford(sp.cost);
      const disabled = onCd || !affordable;

      ctx.save();
      // 技能勋章底部柔和投影
      roundRectPath(ctx, bx + 1, by + 3, btnSize - 2, btnSize, 26);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fill();

      // 处于瞄准激活状态时的华丽金色光环
      if (isCasting) {
        ctx.save();
        const pulse = 1 + Math.sin(this.uiAnimTime * 8) * 0.08;
        ctx.translate(bx + btnSize * 0.5, by + btnSize * 0.5);
        ctx.scale(pulse, pulse);
        ctx.beginPath();
        ctx.arc(0, 0, btnSize * 0.5 + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // 绘制 AI 原生圆形技能勋章
      if (item.id === 'rally') {
        const sImg = platform.getImage('assets/vfx/relic_shield.png');
        if (sImg && sImg.width) {
          ctx.drawImage(sImg, bx + 8, by + 8, btnSize - 16, btnSize - 16);
        } else {
          drawSpellIcon(ctx, 'rain', bx + 2, by + 2, btnSize - 4);
        }
      } else {
        drawSpellIcon(ctx, item.id, bx + 2, by + 2, btnSize - 4);
      }

      // 古铜外环金属框
      ctx.beginPath();
      ctx.arc(bx + btnSize * 0.5, by + btnSize * 0.5, (btnSize - 4) * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = hovered && !disabled ? THEME.BRONZE_BRIGHT : THEME.BRONZE_MID;
      ctx.lineWidth = hovered && !disabled ? 2.5 : 1.8;
      ctx.stroke();

      // 技能冷却遮罩扇面
      if (onCd) {
        const ratio = sp.timer / sp.cd;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bx + btnSize * 0.5, by + btnSize * 0.5);
        ctx.arc(
          bx + btnSize * 0.5,
          by + btnSize * 0.5,
          (btnSize - 4) * 0.5,
          -Math.PI * 0.5,
          -Math.PI * 0.5 + Math.PI * 2 * ratio,
          false
        );
        ctx.closePath();
        ctx.fillStyle = 'rgba(10, 16, 12, 0.72)';
        ctx.fill();
        ctx.restore();

        drawArtText(ctx, `${Math.ceil(sp.timer)}s`, bx + btnSize * 0.5, by + btnSize * 0.5, {
          style: 'parchment',
          size: 14,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 2.0
        });
      } else if (!affordable) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx + btnSize * 0.5, by + btnSize * 0.5, (btnSize - 4) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 10, 10, 0.45)';
        ctx.fill();
        ctx.restore();
      }

      // 左上角快捷键徽章 [Q] [W] [E]
      roundRectPath(ctx, bx - 2, by - 4, 18, 16, 4);
      ctx.fillStyle = isCasting ? '#D49B3B' : '#3E2919';
      ctx.fill();
      ctx.strokeStyle = THEME.BRONZE_MID;
      ctx.lineWidth = 1;
      ctx.stroke();
      drawArtText(ctx, item.hotkey, bx + 7, by + 4, {
        style: 'parchment',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 底部消耗价格/免费微标签
      roundRectPath(ctx, bx + 2, by + btnSize - 6, btnSize - 4, 15, 7);
      ctx.fillStyle = 'rgba(16, 24, 14, 0.88)';
      ctx.fill();
      ctx.strokeStyle = sp.cost === 0 ? THEME.ENAMEL_GREEN : THEME.BRONZE_MID;
      ctx.lineWidth = 1;
      ctx.stroke();

      const costText = sp.cost === 0 ? '免费' : `${sp.cost}`;
      if (sp.cost > 0) {
        drawUiIcon(ctx, 16, 'spore', bx + 6, by + btnSize - 5, 12);
        drawArtText(ctx, costText, bx + 28, by + btnSize + 1, {
          style: affordable ? 'gold' : 'crimson',
          size: 10,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 1.0
        });
      } else {
        drawArtText(ctx, costText, bx + btnSize * 0.5, by + btnSize + 1, {
          style: 'emerald',
          size: 10,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 1.0
        });
      }

      ctx.restore();

      this.registerButton('spell_' + item.id, bx, by, btnSize, btnSize, () => {
        if (item.id === 'rally') {
          scene.activeRallyTargeting = !scene.activeRallyTargeting;
          scene.activeSpellCasting = null;
          platform.playSfx('sfx_click');
        } else {
          scene.activeRallyTargeting = false;
          scene.triggerSpell(item.id);
        }
      });
    }
  }

  /**
   * 绘制法术施法瞄准光圈
   */
  renderSpellTargetingReticle(ctx, scene) {
    if (!scene.activeSpellCasting) return;
    const spellId = scene.activeSpellCasting;
    const sp = scene.spells[spellId];
    if (!sp) return;

    const mx = this.hoverX;
    const my = this.hoverY;
    if (mx < 0 || my < 0) return;

    const rad = sp.radius || 100;
    const isRain = spellId === 'rain';
    const mainColor = isRain ? '#52C41A' : '#FFE58F';
    const ringColor = isRain ? 'rgba(82, 196, 26, 0.22)' : 'rgba(255, 229, 143, 0.25)';

    ctx.save();
    // 1. 绘制 100% AI 手绘高清战术罗盘瞄准光圈
    const reticleImg = platform.getImage('assets/vfx/range_commander_reticle.png');
    if (reticleImg) {
      ctx.save();
      ctx.translate(mx, my);
      ctx.scale(1.0, 0.78); // 贴合 45 度俯视斜视角地面透视
      ctx.rotate(-this.uiAnimTime * 0.45);
      const dSize = rad * 2;
      ctx.globalAlpha = 0.52; // 轻柔半透明
      ctx.drawImage(reticleImg, -rad, -rad, dSize, dSize);
      ctx.restore();
    } else {
      ctx.fillStyle = ringColor;
      ctx.beginPath();
      ctx.ellipse(mx, my, rad, rad * 0.78, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2.0;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -Math.round((this.uiAnimTime * 32) % 14);
      ctx.beginPath();
      ctx.ellipse(mx, my, rad, rad * 0.78, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. 内同心辅助圆环与准星 (贴合地面透视)
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.ellipse(mx, my, rad * 0.45, rad * 0.45 * 0.78, 0, 0, Math.PI * 2);
    ctx.stroke();

    const crX = 14;
    const crY = 14 * 0.78;
    ctx.beginPath();
    ctx.moveTo(mx - crX, my);
    ctx.lineTo(mx + crX, my);
    ctx.moveTo(mx, my - crY);
    ctx.lineTo(mx, my + crY);
    ctx.stroke();

    // 4. 瞄准光圈上方提示文字
    drawArtText(ctx, `点击释放【${sp.name}】`, mx, my - rad - 16, {
      style: isRain ? 'emerald' : 'gold',
      size: 14,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 2.0
    });
    drawArtText(ctx, '按键或点击空白取消', mx, my - rad - 2, {
      style: 'parchment',
      size: 10,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.2
    });

    ctx.restore();
  }

  /**
   * 拖拽放置守卫时的动态全息射程环、网格磁吸吸附高亮与 1.2 倍悬浮投影
   */
  renderTowerDragPreview(ctx, scene) {
    if (!this.isDragging || !this.draggingTowerId || !scene || scene.state !== 'BATTLE') return;

    const tId = this.draggingTowerId;
    const tDef = TOWERS[tId];
    if (!tDef) return;

    const curX = this.dragCurrentX;
    const curY = this.dragCurrentY;
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const mx = (curX - mv.OFFSET_X) / mv.SCALE;
    const my = (curY - mv.OFFSET_Y) / mv.SCALE;
    const col = Math.floor(mx / TILE_SIZE);
    const row = Math.floor(my / TILE_SIZE);

    const inBounds = scene.map && scene.map.inBounds(col, row);
    const canBuild = inBounds && scene.map.canBuildAt(col, row);
    const cost = tDef.nodes.base.cost;
    const affordable = scene.economy && scene.economy.canAfford(cost);
    const isValid = inBounds && canBuild && affordable;

    // 1. 若指针落在地图格子内，仅展示磁吸目标格子底框（拉取与放置过程不显示任何攻击距离特效，保持画面干净）
    if (inBounds) {
      ctx.save();
      const tileBoxX = mv.OFFSET_X + col * TILE_SIZE * mv.SCALE;
      const tileBoxY = mv.OFFSET_Y + row * TILE_SIZE * mv.SCALE;
      const tileBoxSize = TILE_SIZE * mv.SCALE;

      roundRectPath(ctx, tileBoxX + 1, tileBoxY + 1, tileBoxSize - 2, tileBoxSize - 2, 6);
      if (isValid) {
        ctx.fillStyle = 'rgba(82, 196, 26, 0.22)';
        ctx.strokeStyle = 'rgba(82, 196, 26, 0.65)';
      } else {
        ctx.fillStyle = 'rgba(245, 34, 45, 0.20)';
        ctx.strokeStyle = 'rgba(255, 77, 79, 0.65)';
      }
      ctx.lineWidth = 1.8;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. 悬浮在光标下方的 1.2 倍比例立体蘑菇守卫投影与柔和地面阴影
    ctx.save();
    // 地面软阴影
    ctx.fillStyle = 'rgba(8, 14, 10, 0.45)';
    ctx.beginPath();
    ctx.ellipse(curX, curY + 12, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 蘑菇头像图标 (48x48 悬浮呼吸动画)
    const bob = Math.sin(this.uiAnimTime * 8) * 3;
    const avatarX = curX - 24;
    const avatarY = curY - 38 + bob;
    drawUiIcon(ctx, 24, tId, avatarX, avatarY, 48);

    // 悬浮状态提示标签
    if (isValid) {
      drawArtText(ctx, `可种植 (花费 ${cost} 孢子)`, curX, curY - 50 + bob, { style: 'gold', size: 13 });
    } else if (!inBounds) {
      drawArtText(ctx, '移入地图区域种植', curX, curY - 50 + bob, { style: 'parchment', size: 12 });
    } else if (!canBuild) {
      drawArtText(ctx, '此处无法扎根', curX, curY - 50 + bob, { style: 'crimson', size: 12 });
    } else if (!affordable) {
      drawArtText(ctx, `孢子不足 (需 ${cost})`, curX, curY - 50 + bob, { style: 'crimson', size: 12 });
    }
    ctx.restore();
  }

  /**
   * 3.3 底部植物塔防式蘑菇建造卡片船坞（4 张精致木质羊皮纸+绿珐琅卡片）
   */
  renderBottomBuildDock(ctx, scene) {
    const cardW = 80;
    const cardH = 96;
    const gap = 8;
    const totalW = TOWER_ORDER.length * cardW + (TOWER_ORDER.length - 1) * gap; // 5 * 80 + 32 = 432
    const startX = 280; // Leaves 14..260 clean for spell dock, perfectly placed
    const baseY = 432;

    // 底部木质托盘底座
    ctx.save();
    roundRectPath(ctx, startX - 12, baseY + 58, totalW + 24, 46, 14);
    ctx.fillStyle = 'rgba(26, 17, 10, 0.82)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.70)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    const roleShort = {
      watch: '防空远程',
      mist: '范围减速',
      thorn: '破甲割裂',
      burst: '高爆重炮',
      lumina: '神圣丰收'
    };

    for (let i = 0; i < TOWER_ORDER.length; i++) {
      const tId = TOWER_ORDER[i];
      const def = TOWERS[tId];
      const cost = def.nodes.base.cost;
      const isSelected = scene.selectedBuildTowerId === tId;
      const affordable = scene.economy.canAfford(cost);
      const cx = startX + i * (cardW + gap);
      const hovered = this.isPointHovered(cx, baseY - 6, cardW, cardH + 6);
      const liftY = isSelected ? -7 : (hovered ? -3 : 0);
      const cy = baseY + liftY;

      ctx.save();
      // 卡片阴影
      roundRectPath(ctx, cx + 2, cy + 4, cardW - 4, cardH - 2, 8);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.fill();

      // 选中发光外框
      if (isSelected) {
        roundRectPath(ctx, cx - 2, cy - 2, cardW + 4, cardH + 4, 10);
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.fillStyle = '#FFE58F';
        ctx.beginPath();
        ctx.moveTo(cx + cardW * 0.5, cy - 3);
        ctx.lineTo(cx + cardW * 0.5 - 5, cy - 10);
        ctx.lineTo(cx + cardW * 0.5 + 5, cy - 10);
        ctx.closePath();
        ctx.fill();
      }

      // 绘制 AI 羊皮纸木框底板
      this.drawAiFrame(ctx, 'tower_card', cx, cy, cardW, cardH, affordable ? 1.0 : 0.65);

      // 1) 左上角快捷键角标 [1..4]
      roundRectPath(ctx, cx + 6, cy + 5, 18, 16, 4);
      ctx.fillStyle = isSelected ? '#D49B3B' : '#3D2817';
      ctx.fill();
      drawArtText(ctx, String(i + 1), cx + 15, cy + 13, {
        style: 'parchment',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 2) 右上角职能微章（小胶囊底色提高可读性）
      roundRectPath(ctx, cx + cardW - 54, cy + 5, 48, 16, 4);
      ctx.fillStyle = 'rgba(26, 17, 10, 0.45)';
      ctx.fill();
      drawArtText(ctx, roleShort[tId] || '', cx + cardW - 30, cy + 13, {
        style: 'parchment',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 3) 羊皮纸视窗中央：高清 AI 蘑菇防御塔立绘 (42x42 悬浮居中)
      const luminaCardImg = platform.getImage('assets/ui/cards/card_lumina.png');
      if (tId === 'lumina' && luminaCardImg && luminaCardImg.width) {
        ctx.drawImage(luminaCardImg, cx + Math.floor((cardW - 44) * 0.5), cy + 18, 44, 44);
      } else {
        drawUiIcon(ctx, 24, tId, cx + Math.floor((cardW - 42) * 0.5), cy + 20, 42);
      }

      // 4) 羊皮纸底部防御塔中文名（金色/羊皮纸清晰立体字）
      drawArtText(ctx, i18n.t(def.nameKey), cx + cardW * 0.5, cy + 64, {
        style: 'gold',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.6
      });

      // 5) 底部森林绿珐琅价格铭牌：孢子图标 + 建造成本
      drawUiIcon(ctx, 16, 'spore', cx + 22, cy + 78, 18);
      drawArtText(ctx, String(cost), cx + 48, cy + 87, {
        style: affordable ? 'gold' : 'crimson',
        size: 14,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 1.8
      });

      // 6) 金币不足或冷却遮罩反馈
      if (!affordable) {
        roundRectPath(ctx, cx + 3, cy + 3, cardW - 6, cardH - 6, 8);
        ctx.fillStyle = 'rgba(14, 18, 22, 0.28)';
        ctx.fill();
      }
      const cd = this.cardCooldowns[tId] || 0;
      if (cd > 0) {
        const ratio = Math.min(1, cd / 0.45);
        roundRectPath(ctx, cx + 4, cy + 4, cardW - 8, (cardH - 8) * ratio, 6);
        ctx.fillStyle = 'rgba(10, 16, 12, 0.52)';
        ctx.fill();
      }
      ctx.restore();

      this.registerButton('slot_' + tId, cx, cy, cardW, cardH, () => {
        platform.playSfx('sfx_click');
        scene.selectBuildTowerType(tId);
        this.inspectorOpen = true;
      }, { towerId: tId });
    }

    // PvZ 战术小铲/移植按钮 [T]
    const shovelX = startX + totalW + 8;
    const shovelY = baseY + 46;
    const isShovelActive = scene.shovelActive;
    ctx.save();
    roundRectPath(ctx, shovelX, shovelY, 46, 46, 10);
    ctx.fillStyle = isShovelActive ? 'rgba(180, 40, 20, 0.95)' : 'rgba(38, 25, 14, 0.88)';
    ctx.fill();
    ctx.strokeStyle = isShovelActive ? '#FF7875' : 'rgba(198, 143, 69, 0.70)';
    ctx.lineWidth = isShovelActive ? 2.5 : 1.5;
    ctx.stroke();

    ctx.fillStyle = isShovelActive ? '#FFF1F0' : '#EBDAB2';
    ctx.font = `bold 16px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('铲', shovelX + 23, shovelY + 18);
    ctx.fillStyle = '#FFD591';
    ctx.font = `bold 10px ${UI_FONT}`;
    ctx.fillText('[T]', shovelX + 23, shovelY + 34);
    ctx.restore();

    this.registerButton('btn_shovel', shovelX, shovelY, 46, 46, () => {
      scene.toggleShovel();
    });
  }

  /**
   * 3.4 动态弹出式：防御塔选中与升级羊皮纸木框面板（Bloons TD 6 × Kingdom Rush 风格）
   * 贴靠在选中地块左/右侧空白处，绝不遮挡选中防御塔本身或顶部/底部栏
   */
  renderTowerInspectorPopup(ctx, scene) {
    const col = scene.selectedTile.col;
    const row = scene.selectedTile.row;
    if (!scene.map || !scene.map.inBounds(col, row)) {
      this.inspectorRect = null;
      return;
    }

    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 120, OFFSET_Y: 0, SCALE: 1.125 };
    const tileScreenX = mv.OFFSET_X + (col + 0.5) * TILE_SIZE * mv.SCALE;
    const tileScreenY = mv.OFFSET_Y + (row + 0.5) * TILE_SIZE * mv.SCALE;

    const existingTower = scene.towerManager.getTowerAt(col, row);
    const canBuild = scene.map.canBuildAt(col, row);
    if (!existingTower && !canBuild) {
      this.inspectorRect = null;
      return;
    }

    const pw = 328;
    const ph = existingTower ? 264 : 224;
    // 智能停靠：停靠在屏幕边缘，确保地面的 360 度攻击范围完整无遮挡展示
    let px = tileScreenX < 480
      ? Math.max(Math.round(tileScreenX + (existingTower ? existingTower.node.range * TILE_SIZE * 1.05 : 90)), 960 - pw - 20)
      : Math.min(Math.round(tileScreenX - (existingTower ? existingTower.node.range * TILE_SIZE * 1.05 : 90) - pw), 20);
    px = Math.max(16, Math.min(960 - pw - 16, px));
    let py = Math.round(tileScreenY - ph * 0.5);
    py = Math.max(66, Math.min(418 - ph, py));

    this.inspectorRect = { x: px, y: py, w: pw, h: ph };

    // 指向被选地块的青铜指引锚点
    ctx.save();
    ctx.fillStyle = THEME.WOOD_MID;
    ctx.strokeStyle = THEME.BRONZE_MID;
    ctx.lineWidth = 2;
    const arrowY = Math.max(py + 32, Math.min(py + ph - 32, tileScreenY));
    ctx.beginPath();
    if (px > tileScreenX) {
      ctx.moveTo(px + 2, arrowY - 8);
      ctx.lineTo(px - 10, arrowY);
      ctx.lineTo(px + 2, arrowY + 8);
    } else {
      ctx.moveTo(px + pw - 2, arrowY - 8);
      ctx.lineTo(px + pw + 10, arrowY);
      ctx.lineTo(px + pw - 2, arrowY + 8);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 绘制主面板木框+羊皮纸
    this.drawWoodlandPanel(ctx, px, py, pw, ph, THEME.BRONZE_MID, 0.98, 14, true);

    // 右上角关闭按钮 [×]（规范尺寸 22x22，距右边框 14px，距顶 12px）
    this.drawPixelButton(ctx, 'insp_close', px + pw - 36, py + 12, 22, 22, '×', {
      skin: 'btn_wood',
      font: `bold 14px ${UI_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      this.inspectorOpen = false;
    });

    if (existingTower) {
      this.renderSelectedTowerPopupBody(ctx, scene, existingTower, px, py, pw, ph);
    } else {
      this.renderBuildSlotPopupBody(ctx, scene, col, row, px, py, pw, ph);
    }
  }

  /**
   * 已建塔状态面板：头像、等级徽章、属性药丸胶囊、分支升级按钮、索敌/出售
   */
  renderSelectedTowerPopupBody(ctx, scene, tower, x, y, w, h) {
    const def = tower.def;
    const node = tower.node;
    const cov = scene.map.getRangeCoverage(tower.col, tower.row, node.range, def.canHitGround, def.canHitAir);

    // 1. 头像框（42x42，内边距左 26px，距顶 30px，完全在羊皮纸安全区内）
    ctx.save();
    roundRectPath(ctx, x + 26, y + 30, 42, 42, 10);
    ctx.fillStyle = 'rgba(72, 48, 28, 0.18)';
    ctx.fill();
    ctx.strokeStyle = THEME.BRONZE_MID;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawUiIcon(ctx, 24, tower.typeId, x + 27, y + 31, 40);

    // 标题：守卫名字 · 节点名字（下移至 y+40，完全避开顶部厚木框，绝无遮挡）
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 15px ${UI_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const fullName = `${i18n.t(def.nameKey)} · ${i18n.t(node.nameKey)}`;
    ctx.fillText(fullName, x + 76, y + 40);

    // 等级阶级徽章（胶囊型，y+54）
    const lvMap = { base: '基础 1阶', lv1: '强化 2阶', a2: '甲线 3阶', a3: '甲线 顶阶', b2: '乙线 3阶', b3: '乙线 顶阶' };
    const lvBadgeW = 62;
    roundRectPath(ctx, x + 76, y + 54, lvBadgeW, 18, 9);
    ctx.fillStyle = tower.branch === 'A' ? '#1D6373' : (tower.branch === 'B' ? '#8C4D18' : '#33612E');
    ctx.fill();
    ctx.fillStyle = '#FFFDF5';
    ctx.font = `bold 11px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lvMap[tower.nodeId] || '1阶', x + 76 + lvBadgeW * 0.5, y + 63);

    // 战术定位微胶囊（规范放进边框内部，绝不横向溢出，y+54）
    const roleStr = i18n.t(def.roleKey) || '林地守卫';
    // 菌丝共振羁绊微标
    let synName = '';
    let synBg = '#389E0D';
    if (tower.synergies) {
      if (tower.synergies.hasGrandResonance) {
        synName = '大共振';
        synBg = '#D48806';
      } else if (tower.synergies.hasTwinWatch && tower.typeId === 'watch') {
        synName = '双哨暴击';
        synBg = '#096DD9';
      } else if (tower.synergies.hasToxicBurst && (tower.typeId === 'burst' || tower.typeId === 'mist')) {
        synName = '剧毒爆轰';
        synBg = '#389E0D';
      } else if (tower.synergies.hasPoisonThorn && (tower.typeId === 'thorn' || tower.typeId === 'mist')) {
        synName = '荆棘毒刺';
        synBg = '#237804';
      }
    }
    if (synName) {
      const synTagX = x + 76 + lvBadgeW + 8 + 88;
      roundRectPath(ctx, synTagX, y + 54, 58, 18, 9);
      ctx.fillStyle = synBg;
      ctx.fill();
      ctx.fillStyle = '#FFFDF5';
      ctx.font = `bold 10px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(synName, synTagX + 29, y + 63);
    }

    const roleTagX = x + 76 + lvBadgeW + 8;
    const roleTagW = 84;
    roundRectPath(ctx, roleTagX, y + 54, roleTagW, 18, 9);
    ctx.fillStyle = 'rgba(92, 64, 40, 0.10)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 94, 42, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = THEME.INK_MID;
    ctx.font = `bold 10px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(roleStr, roleTagX + roleTagW * 0.5, y + 63);
    ctx.restore();

    // 2. 核心战斗属性药丸胶囊（攻击 / 间隔 / 射程，三等分铺满 276px 可用内宽，y+78）
    const statsY = y + 78;
    const pillW = 86;
    const pillGap = 9;
    let dmgVal = `${node.damage}`;
    let dmgLabel = '伤害';
    let dmgIcon = 'atk';
    if (tower.typeId === 'lumina') {
      dmgVal = `+${node.sporeGen || 8}/次`;
      dmgLabel = '产孢';
      dmgIcon = 'spore';
    } else if (tower.typeId === 'mist') {
      dmgVal = `${node.dps}/秒`;
      dmgLabel = '雾伤';
      dmgIcon = 'atk';
    }
    const statItems = [
      { cat: 24, icon: 'atk', label: '攻击', val: dmgVal },
      { cat: 24, icon: 'aspd', label: '间隔', val: `${node.interval}s` },
      { cat: 16, icon: 'target', label: '射程', val: `${node.range}格` }
    ];
    for (let i = 0; i < 3; i++) {
      const st = statItems[i];
      const sx = x + 26 + i * (pillW + pillGap);
      ctx.save();
      roundRectPath(ctx, sx, statsY, pillW, 30, 8);
      ctx.fillStyle = 'rgba(84, 56, 32, 0.10)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawUiIcon(ctx, st.cat, st.icon, sx + 5, statsY + 5, 20);
      ctx.fillStyle = '#855F38';
      ctx.font = `10px ${UI_FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.label, sx + 27, statsY + 10);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 12px ${UI_FONT}`;
      ctx.fillText(st.val, sx + 27, statsY + 21);
      ctx.restore();
    }

    // 3. 升级卡片或双分支选择
    const upgrades = scene.towerManager.getAvailableUpgrades(tower);
    const btnW = 276;
    const bx = x + 26;

    if (upgrades.length === 0) {
      // 已升至顶级
      ctx.save();
      roundRectPath(ctx, bx, y + 114, btnW, 76, 10);
      ctx.fillStyle = 'rgba(62, 107, 56, 0.14)';
      ctx.fill();
      ctx.strokeStyle = THEME.BRONZE_MID;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawUiIcon(ctx, 24, 'crown', x + w * 0.5 - 18, y + 120, 36);
      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 13px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`已升至最高阶 · 覆盖道路 ${cov.coveredTiles} 格`, x + w * 0.5, y + 170);
      ctx.restore();
    } else if (upgrades.length === 1) {
      // 单分支升级 (Base -> LV1)
      const up = upgrades[0];
      const canAfford = scene.economy.canAfford(up.cost);
      const upIcon = up.branch === 'A' ? 'branch_a' : (up.branch === 'B' ? 'branch_b' : 'upgrade');
      const upCat = (up.branch === 'A' || up.branch === 'B') ? 24 : 16;

      this.drawPixelButton(
        ctx,
        'btn_upgrade_single',
        bx,
        y + 114,
        btnW,
        38,
        `强化: ${i18n.t(up.nameKey)}`,
        {
          skin: canAfford ? 'btn_green' : 'btn_wood',
          align: 'left',
          font: `bold 13px ${UI_FONT}`,
          iconCat: upCat,
          iconKey: upIcon,
          iconSize: 20,
          subLabel: `${up.cost} 孢子`,
          subColor: canAfford ? '#FFE58F' : '#FF7875'
        },
        () => {
          scene.tryUpgradeSelectedTower(up.nodeId);
        }
      );

      // 升级效果预览胶囊
      ctx.save();
      roundRectPath(ctx, bx, y + 158, btnW, 28, 6);
      ctx.fillStyle = 'rgba(92, 64, 40, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = THEME.INK_MID;
      ctx.font = `11px ${UI_FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`效果: ${i18n.t(up.descKey)}`, bx + 10, y + 172, btnW - 20);
      ctx.restore();
    } else if (upgrades.length === 2) {
      // 双分支路线选择（甲线 vs 乙线）
      for (let i = 0; i < 2; i++) {
        const up = upgrades[i];
        const canAfford = scene.economy.canAfford(up.cost);
        const by = y + 114 + i * 42;
        this.drawPixelButton(
          ctx,
          'btn_upgrade_branch_' + up.nodeId,
          bx,
          by,
          btnW,
          36,
          `${up.branch === 'A' ? '甲线' : '乙线'}: ${i18n.t(up.nameKey)}`,
          {
            skin: canAfford ? (up.branch === 'A' ? 'btn_blue' : 'btn_green') : 'btn_wood',
            align: 'left',
            font: `bold 13px ${UI_FONT}`,
            iconCat: 24,
            iconKey: up.branch === 'A' ? 'branch_a' : 'branch_b',
            iconSize: 18,
            subLabel: `${up.cost} 孢子`,
            subColor: canAfford ? '#FFE58F' : '#FF7875'
          },
          () => {
            scene.tryUpgradeSelectedTower(up.nodeId);
          }
        );
      }
    }

    // 4. 底部动作栏：索敌切换按钮（142px）+ 出售按钮（126px），间距 8px，完美铺满 276px，y+202
    const prioKey = 'prio_' + tower.priority;
    const canCyclePrio = (def.priorities && def.priorities.length > 1);
    this.drawPixelButton(
      ctx,
      'btn_tower_prio',
      bx,
      y + 202,
      142,
      34,
      `索敌: ${i18n.t(prioKey)}`,
      {
        skin: 'btn_blue',
        disabled: !canCyclePrio,
        align: 'left',
        font: `bold 12px ${UI_FONT}`,
        iconKey: 'target',
        iconSize: 16
      },
      () => {
        scene.towerManager.cyclePriority(tower);
      }
    );

    const refund = scene.economy.calculateSellRefund(tower.totalInvested);
    this.drawPixelButton(
      ctx,
      'btn_tower_sell',
      bx + 150,
      y + 202,
      126,
      34,
      `出售 +${refund}`,
      {
        skin: 'btn_red',
        align: 'left',
        font: `bold 12px ${UI_FONT}`,
        iconKey: 'sell',
        iconSize: 16
      },
      () => {
        scene.sellSelectedTower();
        this.inspectorOpen = false;
      }
    );
  }

  /**
   * 选中古树空地时的快捷建造弹窗
   */
  renderBuildSlotPopupBody(ctx, scene, col, row, x, y, w, h) {
    const tId = scene.selectedBuildTowerId || 'watch';
    const def = TOWERS[tId];
    const baseNode = def.nodes.base;
    const canBuild = scene.map.canBuildAt(col, row);
    const canAfford = scene.economy.canAfford(baseNode.cost);
    const cov = scene.map.getRangeCoverage(col, row, baseNode.range, def.canHitGround, def.canHitAir);
    const tile = scene.map.getTile(col, row);
    const isMoss = tile && tile.type === 'moss';
    const bx = x + 26;
    const btnW = 276;

    // 头像与定位
    drawUiIcon(ctx, 24, tId, bx, y + 30, 42);
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 15px ${UI_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i18n.t(def.nameKey)} · ${i18n.t(def.roleKey)}`, x + 76, y + 40);

    ctx.fillStyle = isMoss ? THEME.ENAMEL_GREEN : THEME.INK_MID;
    ctx.font = `bold 11px ${UI_FONT}`;
    ctx.fillText(isMoss ? `◆ 黄金苔藓格 · 覆盖道路 ${cov.coveredTiles} 格` : `草地建造位 · 覆盖道路 ${cov.coveredTiles} 格`, x + 76, y + 56);

    // 描述与属性
    this.drawWrappedText(ctx, i18n.t(def.descKey), bx, y + 78, btnW, 16, THEME.INK_MID, `11px ${UI_FONT}`);

    const isLumina = tId === 'lumina';
    const dmgVal = isLumina ? `+${baseNode.sporeGen || 8}/次` : (tId === 'mist' ? `${baseNode.dps}/秒` : `${baseNode.damage}`);
    const statLabel1 = isLumina ? '产孢' : '伤害';
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 12px ${UI_FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${statLabel1}: ${dmgVal}   间隔: ${baseNode.interval}s   射程: ${baseNode.range}格`, bx, y + 122);

    // 种植按钮
    this.drawPixelButton(
      ctx,
      'btn_confirm_build',
      bx,
      y + 160,
      btnW,
      40,
      `种植 ${i18n.t(def.nameKey)}`,
      {
        skin: canBuild && canAfford ? 'btn_green' : 'btn_wood',
        disabled: !canBuild || !canAfford,
        align: 'left',
        font: `bold 13px ${UI_FONT}`,
        iconKey: 'spore',
        iconSize: 20,
        subLabel: `${baseNode.cost} 孢子`,
        subColor: canAfford ? '#FFE58F' : '#FF7875'
      },
      () => {
        if (scene.tryBuildOnSelectedTile()) {
          this.inspectorOpen = false;
        }
      }
    );
  }

  renderMapPlacementPreview(ctx, scene) {
    const map = scene.map;
    if (!map) return;

    // 核心设计：拉出去到放置都没有特效，只有点击已种植守卫时才能够查看到攻击距离的特效
    if (!this.inspectorOpen) return;
    if (!scene.selectedTile || scene.selectedTile.col < 0 || scene.selectedTile.row < 0) return;

    const selCol = scene.selectedTile.col;
    const selRow = scene.selectedTile.row;
    if (!map.inBounds(selCol, selRow)) return;

    // 必须是已种植的守卫！空地不显示任何范围特效，保持画面干净
    const existingTower = scene.towerManager.getTowerAt(selCol, selRow);
    if (!existingTower) return;

    const towerDef = existingTower.def;
    const node = existingTower.node;
    if (!node) return;

    const tileX = selCol * TILE_SIZE;
    const tileY = selRow * TILE_SIZE;
    const cov = map.getRangeCoverage(selCol, selRow, node.range, towerDef.canHitGround, towerDef.canHitAir);
    const ringColor = existingTower.branch === 'A' ? '#6FE8FF' : (existingTower.branch === 'B' ? '#FFC069' : '#B7EB8F');

    ctx.save();
    // 严格按照每个守卫的定位与真实攻击距离制作专属特效，杜绝千篇一律统一法阵：
    // 1. 瞭望菇(watch, 6.0~9.0格超远程): 金色星轨日光罗盘法阵，凸显超远距离精密狙击
    // 2. 雾菇(mist, 3.5格近身范围): 幽蓝荧光毒雾水涟环，紧凑贴身环绕，绝不蔓延全图
    // 3. 尖刺菇(thorn, 4.5~5.0格中距离): 四叶草翡翠荆棘仙女环，德鲁伊自然破甲荆棘
    // 4. 爆裂菇(burst, 4.0格抛物线炮击): 熔金地脉震波落点法阵，炮击碎裂生机落点
    const typeId = existingTower.typeId;
    let circleKey = 'assets/vfx/range_thorn_bramble.png';
    if (typeId === 'mist') {
      circleKey = 'assets/vfx/range_mist_poison.png';
    } else if (typeId === 'burst') {
      circleKey = 'assets/vfx/range_burst_mortar.png';
    } else if (typeId === 'watch') {
      circleKey = 'assets/vfx/range_watch_sniper.png';
    } else if (typeId === 'lumina') {
      circleKey = 'assets/vfx/range_sunburst_gold.png';
    } else {
      circleKey = 'assets/vfx/range_thorn_bramble.png';
    }

    const circleImg = platform.getImage(circleKey);

    // 点击展开时的平滑呼吸绽放动效（0.0 ~ 0.22 秒）
    const enterAge = scene.selectedTileAgeSec || 0;
    const enterProg = Math.min(1.0, enterAge / 0.22);
    const enterScale = 0.88 + 0.12 * Math.sin(enterProg * Math.PI * 0.5);

    if (circleImg) {
      ctx.save();
      ctx.translate(cov.centerX, cov.centerY);
      ctx.scale(1.0, 0.78); // 契合 45 度俯视斜视角地面透视，使法阵平贴草地
      ctx.rotate(this.uiAnimTime * 0.22);
      ctx.scale(enterScale, enterScale);
      // 轻柔透明仙灵光环（基准透明度 0.38 - 0.46），完全不遮挡草地与道路纹理
      const softAlpha = (0.42 + Math.sin(this.uiAnimTime * 3) * 0.05) * enterProg;
      ctx.globalAlpha = softAlpha;

      // 归一化精准映射：图集外环比例精准为 0.85，除以 0.85 使得光环物理半径精确等于守卫真实射程像素
      const drawRadius = cov.radiusPx / 0.85;
      ctx.drawImage(circleImg, -drawRadius, -drawRadius, drawRadius * 2, drawRadius * 2);
      ctx.restore();
    } else {
      // 低透明柔和光环回退
      ctx.fillStyle = ringColor;
      ctx.globalAlpha = 0.06 * enterProg;
      ctx.beginPath();
      ctx.ellipse(cov.centerX, cov.centerY, cov.radiusPx * enterScale, cov.radiusPx * 0.78 * enterScale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.55 * enterProg;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 5]);
      ctx.lineDashOffset = -Math.round((this.uiAnimTime * 18) % 12);
      ctx.beginPath();
      ctx.ellipse(cov.centerX, cov.centerY, cov.radiusPx * enterScale, cov.radiusPx * 0.78 * enterScale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 射程覆盖路线柔和光点（金色仙灵微粒，严格对齐椭圆透视）
    ctx.globalAlpha = 0.65 * enterProg;
    ctx.fillStyle = '#FFE58F';
    const rX = node.range * TILE_SIZE;
    for (let i = 0; i < cov.coveredGroundSamples.length; i += 2) {
      const s = cov.coveredGroundSamples[i];
      const dx = s.x - cov.centerX;
      const dy = (s.y - cov.centerY) / 0.78;
      if (dx * dx + dy * dy <= rX * rX) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 选中守卫高亮基底：绘制贴地椭圆仙灵生机生根光晕
    ctx.save();
    ctx.fillStyle = 'rgba(82, 196, 26, 0.20)';
    ctx.strokeStyle = 'rgba(255, 229, 143, 0.60)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(tileX + TILE_SIZE * 0.5, tileY + TILE_SIZE * 0.65, 18, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // 4. 暂停、结算、设置与新手引导木质羊皮纸弹窗
  // =========================================================================
  renderPauseOverlay(ctx, scene) {
    ctx.fillStyle = 'rgba(10, 16, 12, 0.72)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 350;
    const mh = 300;
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 16, true);

    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 22px ${CN_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(i18n.t('state_paused'), mx + mw * 0.5, my + 44);

    const bx = mx + 55;
    const bw = mw - 110;

    this.drawPixelButton(ctx, 'pause_resume', bx, my + 76, bw, 42, i18n.t('btn_resume'), {
      skin: 'btn_green',
      iconKey: 'play'
    }, () => {
      platform.playSfx('sfx_click');
      scene.resumeGame();
    });

    this.drawPixelButton(ctx, 'pause_restart', bx, my + 128, bw, 42, i18n.t('btn_restart'), {
      skin: 'btn_wood'
    }, () => {
      platform.playSfx('sfx_click');
      scene.restartLevel();
    });

    this.drawPixelButton(ctx, 'pause_settings', bx, my + 180, bw, 42, i18n.t('btn_settings'), {
      skin: 'btn_wood',
      iconKey: 'settings'
    }, () => {
      platform.playSfx('sfx_click');
      this.showSettingsModal = true;
    });

    this.drawPixelButton(ctx, 'pause_exit', bx, my + 232, bw, 42, i18n.t('btn_exit_title'), {
      skin: 'btn_red'
    }, () => {
      platform.playSfx('sfx_click');
      scene.enterLevelSelect();
    });
  }

  renderSettlementOverlay(ctx, scene) {
    ctx.fillStyle = 'rgba(10, 16, 12, 0.78)';
    ctx.fillRect(0, 0, 960, 540);

    const isEndless = Boolean(scene.isEndlessMode);
    const isWin = scene.settlementResult.victory;
    const stars = scene.settlementResult.stars || 0;
    const save = storage.getSave();
    const bestEndless = (save && save.endlessRecord) ? save.endlessRecord.bestWave : 0;

    const mw = 440;
    const mh = isEndless ? 340 : (isWin ? 370 : 330);
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, (isWin || isEndless) ? THEME.BRONZE_BRIGHT : THEME.CRIMSON_SELL, 0.98, 16, true);

    ctx.save();
    ctx.textAlign = 'center';
    if (isEndless) {
      drawArtText(ctx, '🔥 无尽深渊试炼报告', mx + mw * 0.5, my + 38, {
        style: 'crimson',
        size: 24,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.5
      });

      const currentWave = scene.waveManager ? scene.waveManager.currentWaveIndex : 1;
      drawArtText(ctx, `本次坚持至：第 ${currentWave} 波`, mx + mw * 0.5, my + 84, {
        style: 'gold',
        size: 18,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.2
      });
      drawArtText(ctx, `历史最高纪录：第 ${Math.max(currentWave, bestEndless)} 波`, mx + mw * 0.5, my + 118, {
        style: 'emerald',
        size: 16,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });
      drawArtText(ctx, '深渊虫群无休止涌现，林地英魂永垂不朽！', mx + mw * 0.5, my + 152, {
        style: 'parchment',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      const bx = mx + 65;
      const bw = mw - 130;

      this.drawPixelButton(ctx, 'settle_endless_retry', bx, my + 192, bw, 42, '🔥 再次挑战深渊', {
        skin: 'btn_green'
      }, () => {
        platform.playSfx('sfx_click');
        scene.startEndlessMode();
      });

      this.drawPixelButton(ctx, 'settle_levels', bx, my + 246, bw, 42, i18n.t('btn_level_select'), {
        skin: 'btn_wood'
      }, () => {
        platform.playSfx('sfx_click');
        scene.enterLevelSelect();
      });
    } else {
      ctx.fillStyle = isWin ? THEME.ENAMEL_GREEN : THEME.CRIMSON_SELL;
      ctx.font = `bold 26px ${CN_FONT}`;
      ctx.fillText(isWin ? i18n.t('state_victory') : i18n.t('state_defeat'), mx + mw * 0.5, my + 44);

      for (let s = 0; s < 3; s++) {
        const sKey = s < stars ? 'star_full' : 'star_empty';
        drawUiIcon(ctx, 16, sKey, mx + 156 + s * 46, my + 72, 36);
      }

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 15px ${CN_FONT}`;
      const timeSec = Math.round(scene.settlementResult.clearTimeSec * 10) / 10;
      ctx.fillText(i18n.t('best_time') + ': ' + timeSec + 's', mx + mw * 0.5, my + 134);
      ctx.fillText(i18n.t('seeds_label') + ': ' + scene.settlementResult.remainingSeeds + ' / 20', mx + mw * 0.5, my + 160);

      const bx = mx + 65;
      const bw = mw - 130;

      if (isWin) {
        let curBtnY = my + 188;
        if (scene.hasNextMap()) {
          this.drawPixelButton(ctx, 'settle_next', bx, curBtnY, bw, 38, i18n.t('btn_next_map'), {
            skin: 'btn_green',
            iconKey: 'play'
          }, () => {
            platform.playSfx('sfx_click');
            scene.startNextMap();
          });
          curBtnY += 46;
        }

        // 无尽深渊挑战入口按钮
        this.drawPixelButton(ctx, 'settle_start_endless', bx, curBtnY, bw, 38, '🔥 挑战无尽深渊', {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.startEndlessMode();
        });
        curBtnY += 46;

        this.drawPixelButton(ctx, 'settle_levels', bx, curBtnY, bw, 38, i18n.t('btn_level_select'), {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.enterLevelSelect();
        });
      } else {
        this.drawPixelButton(ctx, 'settle_restart', bx, my + 196, bw, 42, i18n.t('btn_restart'), {
          skin: 'btn_green'
        }, () => {
          platform.playSfx('sfx_click');
          scene.restartLevel();
        });

        this.drawPixelButton(ctx, 'settle_levels', bx, my + 248, bw, 42, i18n.t('btn_level_select'), {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.enterLevelSelect();
        });
      }
    }
    ctx.restore();
  }

  renderSettingsModal(ctx) {
    ctx.fillStyle = 'rgba(10, 16, 12, 0.76)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 370;
    const mh = 290;
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 16, true);

    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 20px ${CN_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(i18n.t('settings_title'), mx + mw * 0.5, my + 42);

    const audioCfg = platform.getAudioConfig();
    const bx = mx + 45;
    const bw = mw - 90;

    this.drawPixelButton(
      ctx,
      'set_sfx',
      bx,
      my + 72,
      bw,
      40,
      i18n.t('settings_sfx') + ': ' + (audioCfg.sfx ? i18n.t('on') : i18n.t('off')),
      { skin: 'btn_wood', iconKey: audioCfg.sfx ? 'sfx_on' : 'sfx_off' },
      () => {
        const next = !audioCfg.sfx;
        platform.setAudioConfig({ sfx: next });
        storage.updateSettings({ sfx: next });
        platform.playSfx('sfx_click');
      }
    );

    this.drawPixelButton(
      ctx,
      'set_bgm',
      bx,
      my + 124,
      bw,
      40,
      i18n.t('settings_bgm') + ': ' + (audioCfg.bgm ? i18n.t('on') : i18n.t('off')),
      { skin: 'btn_wood', iconKey: audioCfg.bgm ? 'bgm_on' : 'bgm_off' },
      () => {
        const next = !audioCfg.bgm;
        platform.setAudioConfig({ bgm: next });
        storage.updateSettings({ bgm: next });
        platform.playSfx('sfx_click');
      }
    );

    this.drawPixelButton(
      ctx,
      'set_lang',
      bx,
      my + 176,
      bw,
      40,
      i18n.t('settings_lang') + ': ' + (i18n.getLang() === 'zh' ? i18n.t('lang_zh') : i18n.t('lang_en')),
      { skin: 'btn_wood' },
      () => {
        const nextLang = i18n.toggleLang();
        storage.updateSettings({ lang: nextLang });
        platform.playSfx('sfx_click');
      }
    );

    this.drawPixelButton(ctx, 'set_close', bx, my + 228, bw, 40, i18n.t('btn_back'), {
      skin: 'btn_green'
    }, () => {
      platform.playSfx('sfx_click');
      this.showSettingsModal = false;
    });
  }

  /**
   * 【林地秘典 · 全景手绘图鉴与战术殿堂】 (Grand Codex & Bestiary)
   * 包含 3 大核心篇章：
   * 1. 🌲 守林神树卫士 (5大蘑菇炮塔：立绘、基础数值、双分支终极形态、灵能觉醒超载大招)
   * 2. 🐛 暗黑虫潮首领 (16大怪物种群：高清手绘立绘、数值抗性、特殊行为机制、针对弱点与克制战法)
   * 3. 📜 领袖战术心得 (深度对标《王国保卫战》《植物大战僵尸》核心微操与无尽深渊法则)
   */
  /**
   * 【林地秘典 · 全景手绘图鉴与战术殿堂】 (Grand Codex & Bestiary)
   * 采用 AAA 级古典羊皮纸与古铜精雕画框材质，100% 修复属性获取与文字换行崩溃异常，
   * 包含三大核心篇章：
   * 1. 🌲 守林神树卫士 (5大防御塔详细数据、双分支三阶终极进阶形态、灵能觉醒超载全屏大招)
   * 2. 🐛 暗黑虫潮首领 (16大怪物种群全部同屏直选展示、生态威胁、针对弱点与克制战法)
   * 3. 📜 领袖战术心得 (英雄肉搏要义、能量豆超频时机、战场即时撕网破茧、踩踏掘地怪、自爆泄气)
   */
  renderGuideModal(ctx) {
    ctx.save();
    // 沉浸式暗林边缘微虚化半透明背景
    ctx.fillStyle = 'rgba(6, 12, 8, 0.88)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 800;
    const mh = 480;
    const mx = (960 - mw) * 0.5; // 80
    const my = (540 - mh) * 0.5; // 30

    // 绘制古典林地木纹雕花边框与羊皮纸底盘
    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 18, true);

    // 1. 秘典大标题与顶部华丽徽章
    drawArtText(ctx, '林地秘典 · 全景手绘图鉴与战术殿堂', mx + mw * 0.5, my + 22, {
      style: 'gold',
      size: 19,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.4
    });

    // 右上角关闭按钮 [×]
    const cx = mx + mw - 38;
    const cy = my + 10;
    this.drawPixelButton(ctx, 'codex_close_btn', cx, cy, 28, 28, '×', {
      skin: 'btn_wood',
      font: `bold 16px ${CN_FONT}`
    }, () => {
      this.showGuideModal = false;
      storage.markGuideSeen();
      platform.playSfx('sfx_click');
    });

    // 2. 顶部三大篇章分页标签 (Tabs)
    const tabs = [
      { id: 0, label: '🌲 守林神树卫士 (5/5)' },
      { id: 1, label: '🐛 暗黑虫潮首领 (16/16)' },
      { id: 2, label: '📜 领袖战术心得' },
      { id: 3, label: '🏆 战术成就殿堂 (20)' }
    ];
    const tabY = my + 40;
    const tabW = 180;
    const tabH = 32;
    const tabStartX = mx + (mw - tabs.length * tabW - (tabs.length - 1) * 10) * 0.5;

    for (let i = 0; i < tabs.length; i++) {
      const tb = tabs[i];
      const tbx = tabStartX + i * (tabW + 12);
      const isCur = this.codexTab === tb.id;

      ctx.save();
      roundRectPath(ctx, tbx, tabY, tabW, tabH, 8);
      ctx.fillStyle = isCur ? 'rgba(88, 56, 32, 0.98)' : 'rgba(30, 20, 12, 0.70)';
      ctx.fill();
      ctx.strokeStyle = isCur ? '#FFD700' : 'rgba(196, 143, 69, 0.5)';
      ctx.lineWidth = isCur ? 2.2 : 1.2;
      ctx.stroke();

      drawArtText(ctx, tb.label, tbx + tabW * 0.5, tabY + tabH * 0.5, {
        style: isCur ? 'gold' : 'parchment',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: isCur ? 1.0 : 0.8
      });
      ctx.restore();

      this.registerButton(`codex_tab_${tb.id}`, tbx, tabY, tabW, tabH, () => {
        this.codexTab = tb.id;
        platform.playSfx('sfx_click');
      });
    }

    // 3. 篇章具体内容渲染
    const bodyY = my + 78;
    const bodyH = mh - 130;

    if (this.codexTab === 0) {
      this.renderCodexGuardiansTab(ctx, mx + 16, bodyY, mw - 32, bodyH);
    } else if (this.codexTab === 1) {
      this.renderCodexBestiaryTab(ctx, mx + 16, bodyY, mw - 32, bodyH);
    } else if (this.codexTab === 2) {
      this.renderCodexTacticsTab(ctx, mx + 16, bodyY, mw - 32, bodyH);
    } else {
      this.renderCodexAchievementsTab(ctx, mx + 16, bodyY, mw - 32, bodyH);
    }

    // 4. 底部右下角核心主交互按钮：进入林地·开启保卫战
    const playBtnW = 220;
    const playBtnH = 38;
    const playBtnX = mx + mw - playBtnW - 20;
    const playBtnY = my + mh - playBtnH - 12;

    this.drawPixelButton(ctx, 'codex_play_btn', playBtnX, playBtnY, playBtnW, playBtnH, '⚔️ 开启保卫战 · 进入战场', {
      skin: 'btn_green',
      font: `bold 14px ${CN_FONT}`,
      iconKey: 'play'
    }, () => {
      this.showGuideModal = false;
      storage.markGuideSeen();
      platform.playSfx('sfx_upgrade');
    });

    // 底部左下角提示文案
    drawArtText(ctx, '提示：点击任意空白区域或右上角 [×] 即可随时关闭秘典继续游玩', mx + 24, playBtnY + playBtnH * 0.5, {
      style: 'parchment',
      size: 11,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0.6
    });

    ctx.restore();
  }

  /**
   * 篇章 1：守林神树卫士图鉴（修复属性获取与换行异常，提高美术排版质感）
   */
  renderCodexGuardiansTab(ctx, x, y, w, h) {
    const towers = [
      { id: 'watch', name: '瞭望菇', role: '防空远程', cost: 100, desc: '射程覆盖广，精准破甲点杀空中飞蛾与高速突袭怪。' },
      { id: 'mist', name: '雾菇', role: '范围减速', cost: 125, desc: '释放大范围孢子迷雾，极寒减速并融毁敌军坚硬护甲。' },
      { id: 'thorn', name: '尖刺菇', role: '破甲割裂', cost: 110, desc: '刺穿地面造成连续破甲割裂与巨额流血创伤。' },
      { id: 'burst', name: '爆裂菇', role: '高爆重炮', cost: 135, desc: '发射熔岩高爆弹丸，巨额AOE溅射击退密集聚拢虫潮。' },
      { id: 'lumina', name: '灵光菇', role: '神圣丰收', cost: 75, desc: '持续生产黄金孢子与祝福晨露，维系全线防守经济命脉。' }
    ];

    const curTowerId = this.codexSelectedTower || 'watch';
    const curDef = TOWERS[curTowerId] || TOWERS.watch;
    const leftW = 205;

    // 左侧：5 大蘑菇精致木牌卡片
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      const cy = y + i * 68;
      const isSel = t.id === curTowerId;

      ctx.save();
      roundRectPath(ctx, x, cy, leftW, 62, 10);
      ctx.fillStyle = isSel ? 'rgba(84, 52, 28, 0.98)' : 'rgba(32, 20, 12, 0.72)';
      ctx.fill();
      ctx.strokeStyle = isSel ? '#FFD700' : 'rgba(196, 143, 69, 0.45)';
      ctx.lineWidth = isSel ? 2.2 : 1.2;
      ctx.stroke();

      // 防御塔动画模型
      const demoFrame = Math.floor(this.uiAnimTime * 4) % 4;
      drawTowerSprite(ctx, t.id, 'lv1', 'idle', demoFrame, x + 30, cy + 31);

      // 名称
      drawArtText(ctx, t.name, x + 66, cy + 20, {
        style: isSel ? 'gold' : 'parchment',
        size: 14,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 战术定位胶囊标
      roundRectPath(ctx, x + 66, cy + 35, 62, 18, 9);
      ctx.fillStyle = 'rgba(62, 107, 56, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#73D13D';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      drawArtText(ctx, t.role, x + 97, cy + 44, {
        style: 'gold',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.6
      });

      // 造价
      drawArtText(ctx, `${t.cost} 孢子`, x + leftW - 12, cy + 20, {
        style: 'gold',
        size: 11,
        align: 'right',
        baseline: 'middle',
        strokeWidth: 0.8
      });
      ctx.restore();

      this.registerButton(`codex_t_${t.id}`, x, cy, leftW, 62, () => {
        this.codexSelectedTower = t.id;
        platform.playSfx('sfx_click');
      });
    }

    // 右侧：详细高精度羊皮纸档案与觉醒展示面板
    const rx = x + leftW + 14;
    const rw = w - leftW - 14;
    ctx.save();
    roundRectPath(ctx, rx, y, rw, h, 14);
    ctx.fillStyle = 'rgba(238, 222, 185, 0.98)';
    ctx.fill();
    ctx.strokeStyle = '#8C5E2A';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // 顶部立绘与基本信息
    const tItem = towers.find(it => it.id === curTowerId) || towers[0];
    const topFrame = Math.floor(this.uiAnimTime * 6) % 4;
    drawTowerSprite(ctx, curTowerId, 'a3', 'idle', topFrame, rx + 44, y + 40);

    drawArtText(ctx, `${tItem.name} · ${tItem.role}`, rx + 92, y + 24, {
      style: 'ink',
      size: 18,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, tItem.desc, rx + 92, y + 42, rw - 110, 18, '#4A3319', `12px ${CN_FONT}`);

    // 属性横向数值条 (修复射程像素计算)
    const statsY = y + 74;
    const baseNode = curDef.nodes.base || {};
    const statsList = [
      { k: '伤害', v: baseNode.damage || 0 },
      { k: '射程', v: `${baseNode.range || 0} 格 (${Math.round((baseNode.range || 0) * 32)}px)` },
      { k: '攻速', v: `${(1 / (baseNode.interval || 1)).toFixed(1)} 次/秒` },
      { k: '类型', v: baseNode.damageType === 'pierce' ? '穿透' : (baseNode.damageType === 'magic' ? '魔法' : '物理') }
    ];
    for (let si = 0; si < statsList.length; si++) {
      const st = statsList[si];
      const sx = rx + 16 + si * 130;
      roundRectPath(ctx, sx, statsY, 122, 26, 6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.fill();
      ctx.strokeStyle = '#C4A675';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawArtText(ctx, `${st.k}: ${st.v}`, sx + 61, statsY + 13, {
        style: 'ink',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
    }

    // 分支演化进阶预览 (Branch A & Branch B - 100% 修复 undefined 崩溃)
    const branchY = y + 110;
    const aNode = curDef.nodes.a3 || curDef.nodes.lv1 || {};
    const bNode = curDef.nodes.b3 || curDef.nodes.lv1 || {};

    const aName = (aNode.nameKey && i18n.t(aNode.nameKey)) || aNode.name || '进阶分支 A';
    const aDesc = (aNode.descKey && i18n.t(aNode.descKey)) || aNode.desc || '强化射程、攻速与基础战术威能。';
    const bName = (bNode.nameKey && i18n.t(bNode.nameKey)) || bNode.name || '进阶分支 B';
    const bDesc = (bNode.descKey && i18n.t(bNode.descKey)) || bNode.desc || '赋予质变特性、范围强化与高额附加创伤。';

    // 分支 A 卡片 (典雅蓝宝石古铜镶边)
    roundRectPath(ctx, rx + 16, branchY, 254, 82, 8);
    ctx.fillStyle = 'rgba(240, 248, 255, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#69C0FF';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    drawArtText(ctx, `【分支A】${aName}`, rx + 26, branchY + 16, {
      style: 'ink',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, aDesc, rx + 26, branchY + 32, 234, 18, '#1F3A52', `11px ${CN_FONT}`);

    // 分支 B 卡片 (典雅琥珀金古铜镶边)
    roundRectPath(ctx, rx + 280, branchY, 254, 82, 8);
    ctx.fillStyle = 'rgba(255, 248, 235, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#FFC069';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    drawArtText(ctx, `【分支B】${bName}`, rx + 290, branchY + 16, {
      style: 'ink',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, bDesc, rx + 290, branchY + 32, 234, 18, '#593815', `11px ${CN_FONT}`);

    // 【灵能超载全屏觉醒大招】皇室紫金神圣展台
    const ultY = y + 202;
    roundRectPath(ctx, rx + 16, ultY, rw - 32, 134, 12);
    ctx.fillStyle = 'rgba(38, 16, 52, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#D3ADF7';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const ultInfo = {
      watch: { title: '【千里巡林·万矢齐发】', desc: '在3.5秒内向全图范围的所有存活敌人连续倾泻30枚破甲追踪圣光箭矢，无视闪避与潜地，贯穿撕碎敌军阵型！' },
      mist: { title: '【幽冥瘴气·剧毒风暴】', desc: '引爆遮天蔽日的极寒剧毒风暴，使全图敌人移速骤降85%，瞬间融毁所有护甲归零，并造成高额毒素腐蚀！' },
      thorn: { title: '【千刃荆棘·地刺破空】', desc: '召唤贯穿全图地底的千刃神木荆棘破土而出，全屏地面敌军全体定身缠绕4秒并附加260点巨额割裂创伤！' },
      burst: { title: '【熔岩地核·天坠轰击】', desc: '召唤巨型天火陨石轰塌地面，爆发出420点毁灭性巨额范围溅射伤害，全图强烈地动山摇并将残存敌人震退！' },
      lumina: { title: '【天穹极光·万木逢春】', desc: '唤醒天穹极光沐浴全境：立即生成+150黄金孢子，瞬间驱散所有防御塔的蛛网封印与虚弱状态，并在8秒内全员攻速狂暴翻倍！' }
    }[curTowerId] || { title: '【灵能爆发】', desc: '瞬间超频全屏打击。' };

    // 绘制灵能觉醒种子高清图标
    const uSeed = platform.getImage('assets/vfx/item_awakening_seed.png');
    if (uSeed && uSeed.width) {
      ctx.drawImage(uSeed, rx + 28, ultY + 16, 44, 48);
    }

    drawArtText(ctx, `灵能觉醒超载大招：${ultInfo.title}`, rx + 84, ultY + 28, {
      style: 'gold',
      size: 16,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 1.2
    });
    drawArtText(ctx, '击溃高危精英或首领获取觉醒种子，点击战场蘑菇瞬间释放！', rx + 84, ultY + 50, {
      style: 'parchment',
      size: 12,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    this.drawWrappedText(ctx, ultInfo.desc, rx + 28, ultY + 76, rw - 56, 20, '#F5EBFF', `bold 12px ${CN_FONT}`);
    ctx.restore();
  }

  /**
   * 篇章 2：暗黑虫潮首领百兽全书图鉴（16大虫怪双列全部直选，无需翻页）
   */
  renderCodexBestiaryTab(ctx, x, y, w, h) {
    const allEnemies = [
      { id: 'beetle', name: '甲壳幼虫', danger: '★☆☆☆☆', hp: 35, speed: '中速', armor: '无', tag: '前锋兵' },
      { id: 'swift', name: '疾风甲虫', danger: '★★☆☆☆', hp: 28, speed: '极速', armor: '轻甲', tag: '突击兵' },
      { id: 'armored', name: '重甲巨甲虫', danger: '★★★☆☆', hp: 120, speed: '龟速', armor: '高硬甲', tag: '装甲先锋' },
      { id: 'moth', name: '荧光飞蛾', danger: '★★★☆☆', hp: 45, speed: '快速', armor: '无', tag: '浮空飞行' },
      { id: 'splitter', name: '裂殖母虫', danger: '★★★☆☆', hp: 90, speed: '中速', armor: '中甲', tag: '亡语分裂' },
      { id: 'larva', name: '分裂幼虫', danger: '★★☆☆☆', hp: 18, speed: '极速', armor: '无', tag: '虫海群攻' },
      { id: 'burrower', name: '掘地潜行者', danger: '★★★★☆', hp: 80, speed: '快速', armor: '地底免伤', tag: '潜地特种' },
      { id: 'volatile_pod', name: '自爆恶蝉', danger: '★★★★☆', hp: 70, speed: '快速', armor: '轻甲', tag: '蓄力自爆' },
      { id: 'weaver', name: '纺织毒蛛', danger: '★★★★☆', hp: 110, speed: '中速', armor: '中甲', tag: '吐网封塔' },
      { id: 'leaper', name: '跃迁跳蚤', danger: '★★★★☆', hp: 75, speed: '跳跃', armor: '轻甲', tag: '越线偷袭' },
      { id: 'shaman', name: '巫毒蝉俑', danger: '★★★★☆', hp: 130, speed: '缓慢', armor: '高抗性', tag: '群体治疗' },
      { id: 'skeletal_husk', name: '枯骨巨蝎', danger: '★★★★☆', hp: 160, speed: '缓慢', armor: '坚韧骨盾', tag: '正面减伤' },
      { id: 'siege_beetle', name: '攻城巨角兽', danger: '★★★★★', hp: 280, speed: '极慢', armor: '重型装甲', tag: '践踏震晕' },
      { id: 'boss_m1', name: '巨角天牛王', danger: '★★★★★', hp: 450, speed: '冲锋', armor: '首领护甲', tag: '第一关首领' },
      { id: 'boss_m2', name: '剧毒飞蛾后', danger: '★★★★★', hp: 600, speed: '盘旋', armor: '毒瘴屏障', tag: '第二关首领' },
      { id: 'boss_m3', name: '万虫巢母', danger: '★★★★★★', hp: 950, speed: '狂暴', armor: '繁衍神甲', tag: '深渊终极首领' }
    ];

    const curEnemyId = this.codexSelectedEnemy || 'beetle';
    const leftW = 230; // 双列展示 16 只怪物

    // 左侧双列 2x8 布局：直接容纳 16 只怪物，无需翻页
    const colW = 112;
    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      const ci = i % 2;
      const ri = Math.floor(i / 2);
      const ex = x + ci * (colW + 6);
      const ey = y + ri * 42;
      const isSel = e.id === curEnemyId;

      ctx.save();
      roundRectPath(ctx, ex, ey, colW, 38, 6);
      ctx.fillStyle = isSel ? 'rgba(96, 32, 28, 0.98)' : 'rgba(32, 18, 12, 0.72)';
      ctx.fill();
      ctx.strokeStyle = isSel ? '#FF7875' : 'rgba(196, 143, 69, 0.45)';
      ctx.lineWidth = isSel ? 2.0 : 1.0;
      ctx.stroke();

      drawArtText(ctx, e.name, ex + 6, ey + 19, {
        style: isSel ? 'gold' : 'parchment',
        size: 11,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0.6
      });
      ctx.restore();

      this.registerButton(`codex_e_${e.id}`, ex, ey, colW, 38, () => {
        this.codexSelectedEnemy = e.id;
        platform.playSfx('sfx_click');
      });
    }

    // 右侧：怪物详细档案与深度克制战法
    const rx = x + leftW + 12;
    const rw = w - leftW - 12;
    ctx.save();
    roundRectPath(ctx, rx, y, rw, h, 14);
    ctx.fillStyle = 'rgba(238, 222, 185, 0.98)';
    ctx.fill();
    ctx.strokeStyle = '#8C2D29';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const eItem = allEnemies.find(it => it.id === curEnemyId) || allEnemies[0];

    // 怪物立绘与名称
    const enemyImg = platform.getImage(`assets/enemies/enemy_${curEnemyId}.png`) || platform.getImage(`assets/enemies/boss_${curEnemyId}.png`);
    if (enemyImg && enemyImg.width) {
      ctx.drawImage(enemyImg, rx + 20, y + 16, 64, 64);
    } else {
      drawEnemySprite(ctx, curEnemyId, 'walk', 0, rx + 52, y + 48);
    }

    drawArtText(ctx, `${eItem.name} 【${eItem.tag}】`, rx + 98, y + 28, {
      style: 'ink',
      size: 18,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    drawArtText(ctx, `威胁星级：${eItem.danger} | 移速：${eItem.speed} | 基础生命：${eItem.hp} | 护甲：${eItem.armor}`, rx + 98, y + 54, {
      style: 'ink',
      size: 12,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });

    // 深度克制战法数据库
    const counterTactics = {
      beetle: {
        behavior: '成群结队的前锋轻装虫，单兵血量虽然单薄，但数量极多容易掩护后续高危怪物。',
        counter: '【战法】瞭望菇远程精准单体击杀；若敌军密集聚拢，爆裂菇一发重炮即可全歼清场。'
      },
      swift: {
        behavior: '长有高速双翼的疾风飞虫，移动极快，极易穿透单体防线造成漏怪。',
        counter: '【战法】雾菇范围减速是其绝对克星！将其减速至蜗牛爬行后，由后排防御塔轻松收割。'
      },
      armored: {
        behavior: '身披厚重硬质角质甲壳，大幅度削减普通物理投射物伤害。',
        counter: '【战法】尖刺菇的地底穿透与流血可无视坚甲；雾菇的毒瘴可直接融毁其护甲！'
      },
      moth: {
        behavior: '高空浮空飞行的荧光飞蛾，完全无视地面任何荆棘与英雄的肉搏拦截！',
        counter: '【战法】唯有防空瞭望菇可锁定高空射击！务必在前排多保留至少 2 座瞭望菇！'
      },
      splitter: {
        behavior: '死亡时腹部会爆裂并分裂出数只极速幼虫，极易引发漏怪悲剧。',
        counter: '【战法】预先在其行进后方部署尖刺菇或爆裂菇，在其爆裂瞬间立即AOE秒杀幼虫。'
      },
      larva: {
        behavior: '极速奔跑的微型幼虫，单只血薄，但成群狂奔时极具威胁。',
        counter: '【战法】爆裂菇重炮溅射、英雄裂地斩震荡清场。'
      },
      burrower: {
        behavior: '钻入地下潜行移动，在地下期间完全免疫防御塔的任何远程攻击！',
        counter: '【即时微操】在其潜地经过时，直接用手指/鼠标快速点击地面土堆！将其踩踏震出地面打回原形！'
      },
      volatile_pod: {
        behavior: '接近我方防线时开始蓄力膨胀，倒计时结束自爆摧毁周围我方防御塔！',
        counter: '【即时微操】在其蓄力膨胀变红期间，狂暴点击恶蝉本体！每次点击为其中断蓄力并泄气！'
      },
      weaver: {
        behavior: '向我方防线防御塔喷吐粘稠毒蛛网，被封印的防御塔完全瘫痪无法射击！',
        counter: '【三连解救】快速用手指三连点击被封印的蘑菇防御塔！撕开蛛网破茧救出！破茧后还可获得 4 秒攻速狂暴！'
      },
      leaper: {
        behavior: '蓄力跳跃越过前排防御塔，直扑后排脆弱的灵光菇经济作物！',
        counter: '【战法】后排不可全放经济作物，务必在灵光菇旁边穿插 1 座尖刺菇或英雄就近调遣拦截！'
      },
      shaman: {
        behavior: '持续吟唱巫毒光环，为周围所有虫潮源源不断恢复大量生命值！',
        counter: '【战法】指挥英雄使用裂地斩优先击晕，后排瞭望菇切换集火优先级为“强敌优先”集火狙杀！'
      },
      skeletal_husk: {
        behavior: '坚硬如岩石的枯骨甲壳，能吸收正面大额直射弹丸。',
        counter: '【战法】尖刺菇从地底破防穿透，配合爆裂菇的曲射高爆迫击炮绕后打击。'
      },
      siege_beetle: {
        behavior: '体型庞大的攻城重装怪，践踏地面产生震荡波短暂震晕周围防御塔。',
        counter: '【战法】派遣森林英雄在前线肉搏拉住仇恨，后排全员开启灵能觉醒超载秒杀！'
      },
      boss_m1: {
        behavior: '第一关首领【巨角天牛王】：高血量冲锋首领，具备硬化甲壳与震地狂暴。',
        counter: '【战术】英雄前置抗住接怪，施放【W 雷霆震爆】打断其冲锋，爆裂菇重炮全力轰击！'
      },
      boss_m2: {
        behavior: '第二关首领【剧毒飞蛾后】：盘旋空中的飞天巨兽，散播全屏毒粉减缓我方攻速。',
        counter: '【战术】使用【Q 自然甘霖】驱散毒粉并翻倍攻速，瞭望菇开启【千里巡林·万矢齐发】集火射落！'
      },
      boss_m3: {
        behavior: '第三关终极首领【万虫巢母】：拥有三重狂暴阶段，召唤无尽飞虫与分裂幼虫！',
        counter: '【终极战术】英雄持续肉搏阻挡核心，全员使用灵能超载大招连环轰击，灵光菇觉醒万木逢春保持战力！'
      }
    }[curEnemyId] || { behavior: '普通敌军虫潮。', counter: '合理搭配防御塔进行击退。' };

    // 习性与威胁分析框
    const behY = y + 84;
    roundRectPath(ctx, rx + 16, behY, rw - 32, 98, 8);
    ctx.fillStyle = 'rgba(255, 245, 245, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#FFA39E';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    drawArtText(ctx, '【生态行为与危险机制】', rx + 26, behY + 18, {
      style: 'crimson',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, counterTactics.behavior, rx + 26, behY + 36, rw - 52, 20, '#431418', `12px ${CN_FONT}`);

    // 克制弱点与领袖战术框
    const couY = y + 192;
    roundRectPath(ctx, rx + 16, couY, rw - 32, 142, 10);
    ctx.fillStyle = 'rgba(246, 255, 237, 0.90)';
    ctx.fill();
    ctx.strokeStyle = '#B7EB8F';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawArtText(ctx, '【针对弱点与领袖克制战术】', rx + 26, couY + 20, {
      style: 'emerald',
      size: 14,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, counterTactics.counter, rx + 26, couY + 42, rw - 52, 22, '#135200', `bold 13px ${CN_FONT}`);

    ctx.restore();
  }

  /**
   * 篇章 3：领袖战术心得手卷
   */
  renderCodexTacticsTab(ctx, x, y, w, h) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 14);
    ctx.fillStyle = 'rgba(238, 222, 185, 0.98)';
    ctx.fill();
    ctx.strokeStyle = '#8C5E2A';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const scrolls = [
      {
        title: '一、英雄调遣与肉搏接怪法则',
        body: '对标《王国保卫战》：森林领袖·奥克拥有全图自由集结能力。点击英雄头像或战场英雄本体，即可指挥其驻守任意要塞路口。英雄最多可肉搏拦截 2 只地面敌人！杀敌与承受伤害可提升英雄等级（Lv.1 ~ Lv.5），升级不仅大幅强化攻防血量，更会瞬间恢复满血！善用【F 裂地斩】在虫潮扎堆时打出全屏大范围群体眩晕！'
      },
      {
        title: '二、灵能觉醒超载与大招时刻',
        body: '对标《植物大战僵尸》能量豆：击败精英敌人或首领均有高概率掉落【灵能觉醒种子】。按下空格或点击灵能种子后，点击场上任意蘑菇，即可瞬间引爆华丽的全屏大招！瞭望菇万矢齐发全屏秒杀飞蛾、尖刺菇千刃破土定身全屏、爆裂菇天坠流星轰碎重甲、灵光菇万木逢春攻速狂暴！'
      },
      {
        title: '三、即时战场微操手册 (Tap-to-Action)',
        body: '1. 快速救塔：纺织毒蛛喷吐蛛网封印防御塔时，用手指三连点击被封印的蘑菇即可破茧救出，破茧后更附带狂暴攻速加成！\n2. 潜地踩踏：掘地潜行者潜地免伤时，点击地面土堆直接将其踩出硬控！\n3. 恶蝉泄气：自爆恶蝉蓄力变红时快速点击泄气，避免防御塔被毁！'
      },
      {
        title: '四、深渊生存与铲除移植优化',
        body: '通关战役后将解锁【无尽深渊试炼模式】！深渊虫潮将无止境增强，属性指数级提升。充分利用【铲子 [T]】功能随时铲除前期过渡蘑菇，无损回收孢子并根据后期怪群结构动态转型极寒减速与高爆重炮阵型，创造全网最高生存记录！'
      }
    ];

    const cardW = (w - 30) * 0.5;
    const cardH = (h - 30) * 0.5;

    for (let i = 0; i < scrolls.length; i++) {
      const sc = scrolls[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = x + 10 + col * (cardW + 10);
      const cy = y + 10 + row * (cardH + 10);

      roundRectPath(ctx, cx, cy, cardW, cardH, 8);
      ctx.fillStyle = 'rgba(255, 250, 235, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#C4A675';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      drawArtText(ctx, sc.title, cx + 14, cy + 18, {
        style: 'ink',
        size: 13,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0
      });

      this.drawWrappedText(ctx, sc.body, cx + 14, cy + 36, cardW - 28, 18, '#3D2817', `11px ${CN_FONT}`);
    }
    ctx.restore();
  }
  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, color, font) {
    if (text === null || text === undefined || text === '') return;
    text = String(text);
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let line = '';
    let curY = y;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const testLine = line + ch;
      if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
        ctx.fillText(line, x, curY);
        line = ch;
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line.length > 0) {
      ctx.fillText(line, x, curY);
    }
    ctx.restore();
    platform.recordDrawCall(1);
  }

  /**
   * 篇章 4：战术成就殿堂 (Kingdom Rush 20 大勋章殿堂)
   */
  renderCodexAchievementsTab(ctx, x, y, w, h) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 14);
    ctx.fillStyle = 'rgba(238, 222, 185, 0.98)';
    ctx.fill();
    ctx.strokeStyle = '#8C5E2A';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const achManager = require('../game/achievements');
    const allList = achManager.getAllAchievements();
    const unlockedCount = achManager.getUnlockedCount();
    const totalCount = achManager.getTotalCount();
    const totalStars = achManager.totalStarsEarned || 0;

    // 顶部统计栏
    roundRectPath(ctx, x + 12, y + 10, w - 24, 34, 8);
    ctx.fillStyle = 'rgba(59, 39, 24, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawArtText(ctx, '🏆 战术成就殿堂：已达成 ' + unlockedCount + ' / ' + totalCount + ' 项 · 获得荣誉星级：⭐ ' + totalStars + ' / 30', x + (w * 0.5), y + 27, {
      style: 'gold',
      size: 13,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });

    // 20 项成就以 2 列 × 10 行网格自适应展示
    const cardW = (w - 32) * 0.5;
    const cardH = 28;
    const startY = y + 50;

    for (let i = 0; i < allList.length; i++) {
      const a = allList[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = x + 12 + col * (cardW + 8);
      const cy = startY + row * (cardH + 4);

      roundRectPath(ctx, cx, cy, cardW, cardH, 6);
      ctx.fillStyle = a.unlocked ? 'rgba(255, 250, 235, 0.95)' : 'rgba(70, 50, 35, 0.50)';
      ctx.fill();
      ctx.strokeStyle = a.unlocked ? '#FFD700' : 'rgba(140, 94, 42, 0.40)';
      ctx.lineWidth = a.unlocked ? 1.4 : 1.0;
      ctx.stroke();

      // 图标
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(a.icon, cx + 16, cy + 14);

      // 标题
      drawArtText(ctx, a.title, cx + 32, cy + 9, {
        style: a.unlocked ? 'ink' : 'parchment',
        size: 11,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0
      });

      // 描述简述
      ctx.fillStyle = a.unlocked ? '#5E3E26' : '#8C8C8C';
      ctx.font = '9px ' + CN_FONT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const shortDesc = a.desc.length > 21 ? a.desc.slice(0, 21) + '...' : a.desc;
      ctx.fillText(shortDesc, cx + 32, cy + 21);

      // 右侧星级与状态
      drawArtText(ctx, a.unlocked ? ('+' + a.rewardStars + '⭐') : '🔒', cx + cardW - 18, cy + 14, {
        style: a.unlocked ? 'emerald' : 'parchment',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.6
      });
    }

    ctx.restore();
  }
}

module.exports = UiManager;

  };

  /* --- js/core/scene.js --- */
  __modules['js/core/scene'] = function(require, module, exports) {
/**
 * 场景与核心战斗状态机 (js/core/scene.js)
 * 串联标题、选关、备战、战斗、暂停、结算全流程
 * 处理统一输入动作并驱动地图、波次、经济、炮塔、敌人、子弹与特效系统
 */

const CONFIG = require('../data/config');
const { MAPS, MAP_ORDER } = require('../data/maps');
const { TOWERS, TOWER_ORDER } = require('../data/towers');
const { GameMap } = require('../game/map');
const EconomyManager = require('../game/economy');
const EnemyManager = require('../game/enemy');
const SporelingPatrol = require('../game/sporeling');
const SporeDropManager = require('../game/sporeDrop');
const ForestContraptions = require('../game/contraption');
const ForestHero = require('../game/hero');
const WeatherManager = require('../game/weather');
const achievements = require('../game/achievements');
const RelicDropManager = require('../game/relic');
const BulletManager = require('../game/bullet');
const TowerManager = require('../game/tower');
const WaveManager = require('../game/wave');
const FxSystem = require('../fx/fx');
const UiManager = require('../ui/ui');
const input = require('../input/input');
const platform = require('./platform');
const storage = require('../save/storage');
const i18n = require('../i18n/index');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class SceneController {
  constructor() {
    this.state = 'TITLE'; // 'TITLE' | 'LEVEL_SELECT' | 'BATTLE' | 'PAUSED' | 'SETTLEMENT'
    this.currentMapId = 'map1';
    this.map = new GameMap('map1');
    this.economy = new EconomyManager('map1');
    this.enemyManager = new EnemyManager();
    this.bulletManager = new BulletManager();
    this.towerManager = new TowerManager();
    this.sporelingPatrol = new SporelingPatrol();
    this.sporeDropManager = new SporeDropManager();
    this.shovelActive = false;
    this.flankAlertTimer = 0;
    this.contraptions = new ForestContraptions();
    this.elderRootTriggered = false;
    this.elderRootActiveTimer = 0;
    this.comboKillCount = 0;
    this.comboKillTimer = 0;
    this.relicManager = new RelicDropManager();
    this.activeRallyTargeting = false;
    this.waveManager = new WaveManager('map1');
    this.fx = new FxSystem();
    this.ui = new UiManager();

    this.speedMultiplier = 1;
    this.hero = new ForestHero(this.map);
    this.awakeningSeeds = 2;
    this.weather = new WeatherManager();
    this.achievements = achievements;
    this.earlyCallsCount = 0;
    this.activeHeroRally = false;
    this.activeAwakeningTargeting = false; // 1 | 2 | 3
    this.selectedBuildTowerId = 'watch';
    this.selectedTile = { col: 5, row: 3 };
    this.logicalCombatTimeSec = 0;
    this.animTimeSec = 0;

    this.settlementResult = {
      victory: false,
      stars: 0,
      clearTimeSec: 0,
      remainingSeeds: 0
    };

    // 指挥官三大主动战术魔法技能 (Q: 生命甘霖, W: 雷霆震爆, E: 大地丰收)
    this.spells = {
      rain: { id: 'rain', name: '自然甘霖', cost: 45, cd: 25, timer: 0, key: 'Q', radius: 120 },
      shock: { id: 'shock', name: '雷霆震爆', cost: 75, cd: 35, timer: 0, key: 'W', radius: 90 },
      harvest: { id: 'harvest', name: '大地丰收', cost: 0, cd: 50, timer: 0, key: 'E', gain: 120 }
    };
    this.activeSpellCasting = null;
  }

  init() {
    const save = storage.loadSave();
    i18n.setLang(save.settings.lang || 'zh');
    platform.setAudioConfig({
      sfx: save.settings.sfx,
      bgm: save.settings.bgm
    });

    // 注册前后台生命周期：切到后台自动暂停；回到前台保持暂停，不自动继续
    platform.registerLifecycle(
      () => {
        if (this.state === 'BATTLE') {
          this.pauseGame();
        }
      },
      () => {
        // 回到前台保持 PAUSED 状态，不自动恢复
      }
    );

    this.enterTitle();
  }

  enterTitle() {
    this.state = 'TITLE';
    this.speedMultiplier = 1;
    this.hero = new ForestHero(this.map);
    this.awakeningSeeds = 2;
    this.weather = new WeatherManager();
    this.achievements = achievements;
    this.earlyCallsCount = 0;
    this.activeHeroRally = false;
    this.activeAwakeningTargeting = false;
    platform.playBgm('bgm_title');
  }

  enterLevelSelect() {
    this.state = 'LEVEL_SELECT';
    this.speedMultiplier = 1;
    this.hero = new ForestHero(this.map);
    this.awakeningSeeds = 2;
    this.weather = new WeatherManager();
    this.achievements = achievements;
    this.earlyCallsCount = 0;
    this.activeHeroRally = false;
    this.activeAwakeningTargeting = false;
    platform.playBgm('bgm_title');
  }

  startLevel(mapId) {
    const mData = MAPS[mapId] || MAPS.map1;
    this.currentMapId = mData.id;

    // 异步确保当前地图分包图集已加载
    platform.loadMapSubpackage(mData.subpackage, mData.atlasPath);

    this.map = new GameMap(this.currentMapId);
    this.economy.reset(this.currentMapId);
    this.enemyManager.clear();
    this.bulletManager.clear();
    this.towerManager.clear();
    this.sporelingPatrol.initDefaultRally(this.map);
    this.sporeDropManager.reset();
    this.shovelActive = false;
    this.flankAlertTimer = 0;
    this.contraptions.initForMap(this.currentMapId);
    this.elderRootTriggered = false;
    this.elderRootActiveTimer = 0;
    this.comboKillCount = 0;
    this.comboKillTimer = 0;
    this.relicManager.reset();
    this.activeRallyTargeting = false;
    this.waveManager.reset(this.currentMapId);
    this.fx.resetBattleState();

    this.speedMultiplier = 1;
    this.hero = new ForestHero(this.map);
    this.awakeningSeeds = 2;
    this.weather = new WeatherManager();
    this.achievements = achievements;
    this.earlyCallsCount = 0;
    this.activeHeroRally = false;
    this.activeAwakeningTargeting = false;
    this.selectedBuildTowerId = 'watch';
    for (let k in this.spells) {
      this.spells[k].timer = 0;
    }
    this.activeSpellCasting = null;
    const firstMoss = (mData.mossTiles && mData.mossTiles[0]) || [5, 3];
    this.selectedTile = { col: firstMoss[0], row: firstMoss[1] };
    this.ui.inspectorOpen = false;
    input.setGridCursor(this.selectedTile.col, this.selectedTile.row, false);

    this.logicalCombatTimeSec = 0;
    this.state = 'BATTLE';

    // 首次进入关卡弹出三步简短操作引导
    const save = storage.getSave();
    if (!save.guideSeen) {
      this.ui.guideStep = 0;
      this.ui.showGuideModal = true;
    }

    platform.playBgm('bgm_battle');
  }

  /**
   * 开启无尽深渊试炼模式
   */
  startEndlessMode() {
    this.isEndlessMode = true;
    this.state = 'BATTLE';
    if (this.waveManager) {
      this.waveManager.startEndlessMode(this.economy, this.fx);
    }
    this.fx.showBanner('🔥 无尽深渊降临！', '#FF4D4F', '无穷无尽的暗黑虫潮正从四面八方涌来，坚持越久奖励越丰厚！', 2.5);
    this.fx.triggerScreenShake(4.5, 0.4);
    platform.playSfx('sfx_horn');
    platform.playBgm('boss_map3');
  }

  restartLevel() {
    this.startLevel(this.currentMapId);
  }

  hasNextMap() {
    const idx = MAP_ORDER.indexOf(this.currentMapId);
    return idx >= 0 && idx < MAP_ORDER.length - 1;
  }

  startNextMap() {
    const idx = MAP_ORDER.indexOf(this.currentMapId);
    if (idx >= 0 && idx < MAP_ORDER.length - 1) {
      this.startLevel(MAP_ORDER[idx + 1]);
    } else {
      this.enterLevelSelect();
    }
  }

  pauseGame() {
    if (this.state === 'BATTLE') {
      this.state = 'PAUSED';
    }
  }

  resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'BATTLE';
    }
  }

  cycleSpeed() {
    const list = CONFIG.TIMING.SPEED_MULTIPLIERS;
    const idx = list.indexOf(this.speedMultiplier);
    this.speedMultiplier = list[(idx + 1) % list.length];
    platform.playSfx('sfx_click');
  }

  selectBuildTowerType(towerId) {
    if (TOWERS[towerId]) {
      this.selectedBuildTowerId = towerId;
    }
  }

  callWaveEarly() {
    if (this.state !== 'BATTLE') return;
    this.waveManager.callNextWaveEarly(this.economy, this.fx);
  }

  tryBuildOnSelectedTile() {
    if (this.state !== 'BATTLE') return false;
    const { col, row } = this.selectedTile;
    if (!this.map.canBuildAt(col, row)) {
      this.ui.showToast(i18n.t('place_hint_invalid'));
      return false;
    }
    const def = TOWERS[this.selectedBuildTowerId];
    if (!def) return false;
    if (!this.economy.canAfford(def.nodes.base.cost)) {
      this.ui.showToast(i18n.t('no_spores_hint'));
      return false;
    }
    const built = this.towerManager.buildTower(this.selectedBuildTowerId, col, row, this.map, this.economy, this.fx);
    if (built && this.ui.notifyTowerBuilt) {
      this.ui.notifyTowerBuilt(this.selectedBuildTowerId);
    }
    return Boolean(built);
  }

  tryUpgradeSelectedTower(targetNodeId) {
    if (this.state !== 'BATTLE') return false;
    const tower = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
    if (!tower) return false;

    const upgrades = this.towerManager.getAvailableUpgrades(tower);
    if (upgrades.length === 0) return false;

    let chosen = null;
    if (targetNodeId === 'A' || targetNodeId === 'B') {
      if (upgrades.length === 1) {
        chosen = upgrades[0];
      } else {
        chosen = upgrades.find((u) => u.branch === targetNodeId) || upgrades[0];
      }
    } else {
      chosen = upgrades.find((u) => u.nodeId === targetNodeId) || upgrades[0];
    }

    if (!chosen) return false;
    if (!this.economy.canAfford(chosen.cost)) {
      this.ui.showToast(i18n.t('no_spores_hint'));
      return false;
    }

    return this.towerManager.upgradeTower(tower, chosen.nodeId, this.economy, this.fx);
  }

  toggleShovel() {
    this.shovelActive = !this.shovelActive;
    if (this.shovelActive) {
      this.ui.showToast('铲子模式已激活：点击任意蘑菇即可移植回收！');
      platform.playSfx('sfx_click');
    } else {
      this.ui.showToast('已取消铲子模式');
    }
  }

  shovelTower(tower) {
    if (!tower) return;
    const tile = this.map.getTile(tower.col, tower.row);
    if (tile) {
      tile.tower = null;
    }
    const idx = this.towerManager.towers.indexOf(tower);
    if (idx !== -1) {
      this.towerManager.towers.splice(idx, 1);
    }
    const refund = Math.floor((tower.totalInvested || 75) * 0.85);
    this.economy.addSpores(refund);
    this.ui.inspectorOpen = false;
    this.selectedTile = { col: -1, row: -1 };
    this.shovelActive = false;

    this.fx.spawnFloatingText(tower.x, tower.y - 20, 移植回收 + 孢子, '#FFE58F', 1.3);
    this.fx.spawnParticles(tower.x, tower.y, 18, ['#8C6842', '#D48806', '#52C41A', '#FFFDF5'], 25, 45);
    platform.playSfx('sfx_sell');
  }

  triggerFlankAlert() {
    this.flankAlertTimer = 4.0;
    platform.playSfx('sfx_horn');
  }

  sellSelectedTower() {
    if (this.state !== 'BATTLE') return 0;
    const tower = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
    if (!tower) return 0;
    return this.towerManager.sellTower(tower, this.map, this.economy, this.fx);
  }

  onVictory() {
    if (this.state === 'SETTLEMENT') return;
    this.state = 'SETTLEMENT';
    const stars = this.economy.calculateStars();
    this.settlementResult = {
      victory: true,
      stars,
      clearTimeSec: this.logicalCombatTimeSec,
      remainingSeeds: this.economy.seeds
    };
    storage.recordMapVictory(this.currentMapId, stars, this.logicalCombatTimeSec, this.economy.seeds);
    platform.playSfx('sfx_win');
    if (this.achievements) {
      if (this.economy.seeds >= 20) this.achievements.unlock('flawless_defense', this.fx);
      if (this.economy.seeds === 1) this.achievements.unlock('last_stand', this.fx);
      if (this.currentMapId === 'map1') this.achievements.unlock('spider_regicide', this.fx);
      if (this.weather && this.weather.currentWeather === 'blood_moon') this.achievements.unlock('weather_survivor', this.fx);
    }
  }

  onDefeat() {
    if (this.state === 'SETTLEMENT') return;
    this.state = 'SETTLEMENT';
    this.settlementResult = {
      victory: false,
      stars: 0,
      clearTimeSec: this.logicalCombatTimeSec,
      remainingSeeds: 0
    };
    platform.playSfx('sfx_lose');
  }

  /**
   * 消费统一输入动作队列
   */
  triggerSpell(spellId) {
    if (this.state !== 'BATTLE') return;
    const sp = this.spells[spellId];
    if (!sp) return;
    if (sp.timer > 0) {
      this.ui.showToast(`技能冷却中: ${Math.ceil(sp.timer)}s`);
      return;
    }
    if (sp.cost > 0 && !this.economy.canAfford(sp.cost)) {
      this.ui.showToast('孢子不足，无法施法！');
      return;
    }
    if (spellId === 'harvest') {
      sp.timer = sp.cd;
      this.economy.spores += sp.gain;
      this.fx.showBanner('大地丰收！+120 黄金孢子', '#FFE58F', '全场真菌共鸣喷涌', 1.5);
      this.fx.spawnParticles(480, 270, 28, ['#FFE58F', '#FFA940', '#FFFFFF'], 60, 180, 0.4, 0.8, 5);
      platform.playSfx('sfx_win');
      return;
    }
    if (this.activeSpellCasting === spellId) {
      this.activeSpellCasting = null;
    } else {
      this.activeSpellCasting = spellId;
      platform.playSfx('sfx_click');
    }
  }

  castActiveSpell(lx, ly) {
    if (!this.activeSpellCasting) return false;
    const spellId = this.activeSpellCasting;
    const sp = this.spells[spellId];
    if (!sp || sp.timer > 0) {
      this.activeSpellCasting = null;
      return false;
    }
    if (sp.cost > 0 && !this.economy.spendSpores(sp.cost)) {
      this.ui.showToast('孢子不足！');
      this.activeSpellCasting = null;
      return false;
    }

    sp.timer = sp.cd;
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const mx = (lx - mv.OFFSET_X) / mv.SCALE;
    const my = (ly - mv.OFFSET_Y) / mv.SCALE;

    if (spellId === 'rain') {
      let affected = 0;
      for (let i = 0; i < this.towerManager.towers.length; i++) {
        const t = this.towerManager.towers[i];
        if (Math.hypot(t.x - mx, t.y - my) <= sp.radius) {
          this.towerManager.healTower(t, 999, true, this.fx);
          affected++;
        }
      }
      this.fx.spawnRing(mx, my, sp.radius, '#52C41A', 0.55, true);
      this.fx.spawnParticles(mx, my, 28, ['#52C41A', '#B7EB8F', '#95DE64'], 40, 140, 0.35, 0.7, 4);
      this.fx.showBanner('生命甘霖！防线狂暴', '#52C41A', `滋养 ${affected} 座防御塔，攻速翻倍6秒`, 1.5);
      platform.playSfx('sfx_upgrade');
    } else if (spellId === 'shock') {
      let enemiesHit = 0;
      const alive = this.enemyManager.getAliveEnemies();
      for (let i = 0; i < alive.length; i++) {
        const e = alive[i];
        if (Math.hypot(e.x - mx, e.y - my) <= sp.radius) {
          e.hp -= 180;
          e.residualSlowTimer = 3.0;
          e.residualSlowValue = 0.95;
          enemiesHit++;
          if (e.hp <= 0) {
            this.enemyManager.handleEnemyDeath(e, 180, this.logicalCombatTimeSec, this.map, this.economy, this.fx);
          }
        }
      }
      this.fx.triggerShake(8, 350);
      this.fx.spawnRing(mx, my, sp.radius, '#FFE58F', 0.45, false);
      this.fx.spawnParticles(mx, my, 32, ['#FFE58F', '#73D13D', '#FFFFFF', '#40A9FF'], 60, 200, 0.3, 0.65, 5);
      this.fx.showBanner('雷霆震爆！群怪麻痹', '#FFE58F', `轰击 ${enemiesHit} 名敌人，定身3秒`, 1.5);
      platform.playSfx('sfx_boom');
    }

    this.activeSpellCasting = null;
    return true;
  }

  processInputActions() {
    const actions = input.consumeActions();
    for (let i = 0; i < actions.length; i++) {
      const act = actions[i];

      if (act.type === 'pointer_move') {
        this.ui.handlePointerMove(act.x, act.y, this);
      } else if (act.type === 'pointer_down') {
        if (this.activeSpellCasting) {
          this.castActiveSpell(act.x, act.y);
          continue;
        }
        // 1. 如果处于灵能觉醒目标指定模式，点击防御塔直接超频觉醒
        if (this.activeAwakeningTargeting) {
          const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
          const mx = (act.x - mv.OFFSET_X) / mv.SCALE;
          const my = (act.y - mv.OFFSET_Y) / mv.SCALE;
          const col = Math.floor(mx / TILE_SIZE);
          const row = Math.floor(my / TILE_SIZE);
          const tw = this.towerManager.getTowerAt(col, row);
          if (tw && this.awakeningSeeds > 0) {
            this.awakeningSeeds -= 1;
            this.towerManager.triggerAwakening(tw, this, this.fx, this.economy);
            this.activeAwakeningTargeting = false;
            continue;
          } else {
            this.activeAwakeningTargeting = false;
          }
        }

        // 2. 如果处于英雄集结驻守指派模式，点击战场任意坐标命令英雄移动
        if (this.activeHeroRally && this.hero) {
          const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
          const mx = (act.x - mv.OFFSET_X) / mv.SCALE;
          const my = (act.y - mv.OFFSET_Y) / mv.SCALE;
          this.hero.moveTo(mx, my, this.fx);
          this.hero.isSelected = false;
          this.activeHeroRally = false;
          continue;
        }

        // 先交给 UI 按钮与拖拽系统处理；若未命中 UI，则转换为全屏战场网格坐标
        const consumedByUi = this.ui.handlePointerDown(act.x, act.y, this);
        if (!consumedByUi && this.state === 'BATTLE') {
          const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
          const mx = (act.x - mv.OFFSET_X) / mv.SCALE;
          const my = (act.y - mv.OFFSET_Y) / mv.SCALE;
          if (mx >= 0 && mx < CONFIG.LAYOUT.MAP.WIDTH && my >= 0 && my < CONFIG.LAYOUT.MAP.HEIGHT) {
            const col = Math.floor(mx / TILE_SIZE);
            const row = Math.floor(my / TILE_SIZE);
            if (this.map.inBounds(col, row)) {
              // 检查是否点击在英雄身上：选中英雄并进入移动集结模式
              if (this.hero && Math.hypot(mx - this.hero.x, my - this.hero.y) <= 28) {
                this.hero.isSelected = true;
                this.activeHeroRally = true;
                platform.playSfx('sfx_click');
                if (this.fx) this.fx.spawnFloatingText(this.hero.x, this.hero.y - 28, '听候指挥!', '#FFE58F', 1.0);
                continue;
              }

              // 检查是否点中被蛛网封印的防御塔（进行三连击破茧解救微操）
              const existingTower = this.towerManager.getTowerAt(col, row);
              if (existingTower && existingTower.isWebbed) {
                this.towerManager.rescueWeb(existingTower, this.fx);
                continue;
              }

              const canBuild = this.map.canBuildAt(col, row);
              if (existingTower) {
                // 点击已种植的我方守卫：展开其专属地面轻柔范围法阵与升级面板
                this.selectedTile.col = col;
                this.selectedTile.row = row;
                this.selectedTileAgeSec = 0;
                this.ui.inspectorOpen = true;
                input.setGridCursor(col, row, false);
                platform.playSfx('sfx_click');
              } else if (canBuild) {
                this.selectedTile.col = col;
                this.selectedTile.row = row;
                this.selectedTileAgeSec = 0;
                input.setGridCursor(col, row, false);

                // 选中卡牌后点击空草地直接种植（如植物大战僵尸般极致顺滑），未选中卡牌时则展开选择面板
                if (this.selectedBuildTowerId) {
                  const built = this.tryBuildOnSelectedTile();
                  if (built) {
                    this.ui.inspectorOpen = false;
                  } else {
                    this.ui.inspectorOpen = true;
                    platform.playSfx('sfx_click');
                  }
                } else {
                  this.ui.inspectorOpen = true;
                  platform.playSfx('sfx_click');
                }
              } else {
                // 点击道路、障碍物或空白无效区域：收起范围展示与面板
                this.ui.inspectorOpen = false;
              }
            }
          } else {
            this.ui.inspectorOpen = false;
          }
        }
      } else if (act.type === 'pointer_up') {
        this.ui.handlePointerUp(act.x, act.y, this);
      } else if (act.type === 'cursor_move') {
        if (this.state === 'BATTLE') {
          this.selectedTile.col = act.col;
          this.selectedTile.row = act.row;
        }
      } else if (act.type === 'select_tower_slot') {
        const tId = TOWER_ORDER[act.slot];
        if (tId) {
          this.selectBuildTowerType(tId);
          platform.playSfx('sfx_click');
        }
      } else if (act.type === 'cycle_tower_slot') {
        const curIdx = TOWER_ORDER.indexOf(this.selectedBuildTowerId);
        const nextIdx = (curIdx + act.dir + TOWER_ORDER.length) % TOWER_ORDER.length;
        this.selectBuildTowerType(TOWER_ORDER[nextIdx]);
        platform.playSfx('sfx_click');
      } else if (act.type === 'confirm_tile') {
        if (this.ui.showGuideModal || this.ui.showSettingsModal) {
          this.ui.showGuideModal = false;
          this.ui.showSettingsModal = false;
          storage.markGuideSeen();
        } else if (this.state === 'TITLE') {
          this.enterLevelSelect();
        } else if (this.state === 'LEVEL_SELECT') {
          this.startLevel(this.currentMapId || 'map1');
        } else if (this.state === 'BATTLE') {
          const existing = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
          if (!existing) {
            this.tryBuildOnSelectedTile();
          } else {
            this.tryUpgradeSelectedTower('A');
          }
        }
      } else if (act.type === 'upgrade_branch') {
        if (this.state === 'BATTLE') {
          this.tryUpgradeSelectedTower(act.branch);
        }
      } else if (act.type === 'sell_selected') {
        if (this.state === 'BATTLE') {
          this.sellSelectedTower();
        } else if (this.state === 'LEVEL_SELECT') {
          this.enterTitle();
        }
      } else if (act.type === 'cycle_priority') {
        if (this.state === 'BATTLE') {
          const tower = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
          if (tower) {
            this.towerManager.cyclePriority(tower);
          }
        }
      } else if (act.type === 'call_wave') {
        this.callWaveEarly();
      } else if (act.type === 'trigger_spell') {
        if (this.state === 'BATTLE') {
          this.triggerSpell(act.spellId);
        }
      } else if (act.type === 'cycle_hero_stance') {
        if (this.state === 'BATTLE' && this.hero) {
          this.hero.cycleStance(this.fx);
          if (this.hero.stanceSwitchedCount >= 3) {
            this.achievements.unlock('tactical_stances', this.fx);
          }
        }
      } else if (act.type === 'hero_ultimate') {
        if (this.state === 'BATTLE' && this.hero) {
          const cast = this.hero.castUltimateSkill(this.enemyManager, this.fx);
          if (cast) {
            platform.playSfx('sfx_shock');
          }
        }
      } else if (act.type === 'toggle_awakening') {
        if (this.state === 'BATTLE') {
          if (this.awakeningSeeds > 0) {
            this.activeAwakeningTargeting = !this.activeAwakeningTargeting;
            platform.playSfx('sfx_click');
            if (this.activeAwakeningTargeting) {
              this.fx.spawnFloatingText(480, 240, '请点击场上的蘑菇触发灵能觉醒超载!', '#722ED1', 1.5);
            }
          } else {
            this.fx.spawnFloatingText(480, 240, '灵能觉醒种子不足(击败精英敌人获取)!', '#FF4D4F', 1.2);
          }
        }
      } else if (act.type === 'cycle_speed') {
        if (this.state === 'BATTLE') {
          this.cycleSpeed();
        }
      } else if (act.type === 'toggle_pause') {
        if (this.ui.showSettingsModal || this.ui.showGuideModal) {
          this.ui.showSettingsModal = false;
          this.ui.showGuideModal = false;
        } else if (this.state === 'BATTLE') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }
    }
  }

  /**
   * 固定逻辑步更新 (dt = 1/60s)
   * 5.6 1×/2×/3× 速度下每个逻辑步都执行碰撞检测
   * 5.7 顿帧期间游戏逻辑暂停，不计入关卡用时
   */
  fixedStep(dt) {
    if (this.state !== 'BATTLE') return;
    if (this.ui.showGuideModal || this.ui.showSettingsModal) return;
    if (this.fx.isHitstopped()) return;

    this.logicalCombatTimeSec += dt;

    // 技能冷却推进
    for (let k in this.spells) {
      if (this.spells[k].timer > 0) {
        this.spells[k].timer = Math.max(0, this.spells[k].timer - dt);
      }
    }

    // 1. 波次与备战倒计时更新
    this.waveManager.update(
      dt,
      this.map,
      this.enemyManager,
      this.economy,
      this.fx,
      () => {
        this.onVictory();
      }
    );

    // 1.5 战利品与菇精卫小队更新
    this.relicManager.update(dt, this);
    this.contraptions.update(dt, this);
    if (this.weather) {
      this.weather.update(dt, this);
    }
    if (this.achievements) {
      this.achievements.update(dt, this.fx);
    }
    if (this.elderRootActiveTimer > 0) {
      this.elderRootActiveTimer = Math.max(0, this.elderRootActiveTimer - dt);
    }
    if (this.comboKillTimer > 0) {
      this.comboKillTimer = Math.max(0, this.comboKillTimer - dt);
      if (this.comboKillTimer <= 0) {
        this.comboKillCount = 0;
      }
    }

    // 仓库最后一道防线：圣树古根逆袭 (Elder Root Slam)
    if (!this.elderRootTriggered && this.map && this.map.mapData) {
      const wTile = this.map.mapData.warehouseTile || [19, 12];
      const wx = (wTile[0] + 0.5) * TILE_SIZE;
      const wy = (wTile[1] + 0.5) * TILE_SIZE;
      const alive = this.enemyManager.getAliveEnemies();
      for (let i = 0; i < alive.length; i++) {
        const em = alive[i];
        if (em.isFlying || em.state === 'death') continue;
        if (Math.hypot(em.x - wx, em.y - wy) <= 72) {
          // 触发最后绝境逆袭！
          this.elderRootTriggered = true;
          this.elderRootActiveTimer = 4.5;
          this.fx.triggerScreenShake(6.0, 0.55);
          this.fx.showBanner(i18n.t('banner_elder_roots'), '#52C41A', '绝境逆转', 2.0);
          this.fx.spawnParticles(wx, wy, 35, ['#5C4028', '#389E0D', '#8C6842', '#D4B106'], 60, 150, 0.4, 0.8, 5);
          platform.playSfx('sfx_bomb');

          // 将逼近的敌人全部往回击退 130px 并缠绕定身 4.5 秒
          for (let j = 0; j < alive.length; j++) {
            const tgt = alive[j];
            if (tgt.isFlying || tgt.state === 'death') continue;
            if (Math.hypot(tgt.x - wx, tgt.y - wy) <= 140) {
              tgt.distPx = Math.max(0, tgt.distPx - 130);
              tgt.residualSlowTimer = 4.5;
              tgt.residualSlowValue = 1.0; // 彻底扎根定身
              this.fx.spawnParticles(tgt.x, tgt.y, 8, ['#5C4028', '#52C41A'], 20, 50, 0.2, 0.4, 3);
            }
          }
          break;
        }
      }
    }
    if (this.hero) {
      this.hero.update(dt, this.enemyManager, this.fx);
    }
    this.sporelingPatrol.update(dt, this.enemyManager, this.fx);

    // 2. 炮塔索敌与开火
    this.towerManager.update(dt, this.map, this.enemyManager, this.bulletManager, this.economy, this.fx, this.sporelingPatrol);
    this.sporeDropManager.update(dt, this.map, this.economy, this.fx);
    if (this.flankAlertTimer > 0) {
      this.flankAlertTimer = Math.max(0, this.flankAlertTimer - dt);
    }

    // 3. 子弹飞行、碰撞检测与雾团/灼烧区状态注入
    this.bulletManager.update(
      dt,
      this.logicalCombatTimeSec,
      this.map,
      this.enemyManager,
      this.economy,
      this.fx
    );

    // 4. 敌人移动、反向攻击防御塔、持续伤害结算、Boss 阶段切换与漏怪扣血判定
    this.enemyManager.update(
      dt,
      this.logicalCombatTimeSec,
      this.map,
      this.economy,
      this.fx,
      (defeated) => {
        if (defeated) {
          this.onDefeat();
        }
      },
      this.towerManager,
      this.relicManager,
      this
    );
  }

  /**
   * 真实帧更新（驱动手柄轮询、界面动画、震屏与顿帧恢复）
   */
  updateRealTime(realDt) {
    this.animTimeSec += realDt;
    this.selectedTileAgeSec = (this.selectedTileAgeSec || 0) + realDt;
    input.pollGamepad(realDt);
    this.processInputActions();
    this.ui.update(realDt);

    const isPaused = this.state !== 'BATTLE' || this.ui.showGuideModal || this.ui.showSettingsModal;
    this.fx.update(realDt, this.state === 'BATTLE', isPaused);
  }

  /**
   * 渲染完整一帧画面
   */

  onEnemyKilled(enemy) {
    if (this.comboKillTimer > 0) {
      this.comboKillCount += 1;
    } else {
      this.comboKillCount = 1;
    }
    this.comboKillTimer = 1.4;

    platform.playMusicalScale(this.comboKillCount - 1);
    if (this.achievements) {
      this.achievements.unlock('first_blood', this.fx);
      if (enemy && (enemy.id === 'shadow_stalker' || enemy.type === 'flank')) {
        this.achievements.unlock('subterranean_slayer', this.fx);
      }
      if (this.comboKillCount >= 10) {
        this.achievements.unlock('multikill_overload', this.fx);
      }
      if (this.economy && this.economy.spores >= 2500) {
        this.achievements.unlock('spore_tycoon', this.fx);
      }
    }

    if (this.comboKillCount >= 4) {
      this.fx.spawnFloatingText(enemy.x, enemy.y - 18, `${this.comboKillCount} 连杀!`, '#FFE58F', 0.9);
      this.fx.triggerScreenShake(1.2, 0.08);
    }

    if (this.comboKillCount === 8) {
      this.economy.addSpores(35);
      this.fx.showBanner(i18n.t('banner_spore_frenzy'), '#FFD700', '连杀爆发', 1.6);
      this.fx.triggerScreenShake(4.0, 0.25);
      if (this.towerManager && this.towerManager.towers) {
        for (let i = 0; i < this.towerManager.towers.length; i++) {
          const tw = this.towerManager.towers[i];
          if (tw.dormantTimer <= 0) {
            tw.superchargeTimer = Math.max(tw.superchargeTimer || 0, 4.0);
          }
        }
      }
    }
  }

  render(ctx) {
    if (this.state === 'TITLE') {
      this.ui.renderTitleScreen(ctx, this);
      return;
    }

    if (this.state === 'LEVEL_SELECT') {
      this.ui.renderLevelSelect(ctx, this);
      return;
    }

    // 战斗场景（含 BATTLE, PAUSED, SETTLEMENT）：全屏 960x540 森林战场作为第一视觉主体
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CONFIG.RESOLUTION.LOGICAL_WIDTH, CONFIG.RESOLUTION.LOGICAL_HEIGHT);
    ctx.clip();
    ctx.translate(mv.OFFSET_X + this.fx.shakeOffsetX, mv.OFFSET_Y + this.fx.shakeOffsetY);
    ctx.scale(mv.SCALE, mv.SCALE);

    this.map.render(ctx, this.animTimeSec, this.waveManager.currentWaveIndex);
    // 绘制地下发光菌丝脉络网络与战地集结小队
    this.towerManager.renderMyceliumNetwork(ctx);
    this.sporelingPatrol.render(ctx);
    if (this.hero) {
      this.hero.render(ctx, this.animTimeSec);
    }
    this.relicManager.render(ctx);
    this.contraptions.render(ctx, this.animTimeSec);

    // 绘制圣树古根逆袭破土树根
    if (this.elderRootActiveTimer > 0 && this.map && this.map.mapData) {
      const wTile = this.map.mapData.warehouseTile || [19, 12];
      const wx = (wTile[0] + 0.5) * TILE_SIZE;
      const wy = (wTile[1] + 0.5) * TILE_SIZE;
      ctx.save();
      ctx.strokeStyle = '#5C381E';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      const rootPulse = Math.sin(this.animTimeSec * 15) * 3;
      for (let rIdx = 0; rIdx < 4; rIdx++) {
        const ang = (rIdx / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.quadraticCurveTo(wx + Math.cos(ang) * 35 + rootPulse, wy + Math.sin(ang) * 35, wx + Math.cos(ang) * 60, wy + Math.sin(ang) * 60);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 在地图坐标系内绘制柔和攻击范围与选中高亮（不抢戏、位于UI层之下）
    this.ui.renderMapPlacementPreview(ctx, this);
    this.bulletManager.renderHazards(ctx, this.animTimeSec);
    this.towerManager.render(ctx);
    this.enemyManager.render(ctx);
    this.bulletManager.renderBullets(ctx);
    this.fx.renderMapFx(ctx);
    this.sporeDropManager.render(ctx);

    ctx.restore();

    // 天候生态全屏环境滤镜、雨滴与雾气
    if (this.weather) {
      this.weather.renderWeatherOverlay(ctx);
    }

    // 屏幕级特效横幅与红边闪烁
    this.fx.renderScreenOverlayFx(ctx);

    // 环绕式奇幻森林战斗 HUD（顶部资源条、右上控制栏、底部植物塔卡片栏、动态弹出式防御塔升级面板）
    this.ui.renderBattleHud(ctx, this);
  }
}

module.exports = SceneController;

  };

  /* --- js/core/loop.js --- */
  __modules['js/core/loop'] = function(require, module, exports) {
/**
 * 主循环与固定步长调度器 (js/core/loop.js)
 * 严格遵循：固定步长 1/60 秒；1×、2×、3× 分别每帧执行 1、2、3 步；
 * 暂停时游戏时间冻结，界面动画仍按真实时间更新
 */

const CONFIG = require('../data/config');
const platform = require('./platform');

const FIXED_DT = CONFIG.TIMING.FIXED_DT; // 1/60 秒

class GameLoop {
  constructor(scene) {
    this.scene = scene;
    this.running = false;
    this.lastTimestamp = 0;

    // 性能统计指标（供 QA 报告与性能监控读取）
    this.perf = {
      frameCount: 0,
      totalFrameWorkMs: 0,
      avgFrameWorkMs: 0,
      slowFramesUnder45Fps: 0,
      maxDrawCallsSeen: 0
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = platform.nowMs();

    const raf = (typeof requestAnimationFrame === 'function')
      ? requestAnimationFrame
      : ((cb) => setTimeout(() => cb(platform.nowMs()), 16));

    const tick = (timestamp) => {
      if (!this.running) return;
      const frameStart = platform.nowMs();
      const rawDeltaSec = Math.max(0, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;
      const realDt = Math.min(CONFIG.TIMING.MAX_FRAME_DELTA, rawDeltaSec || FIXED_DT);

      this.stepFrame(realDt);

      const workMs = platform.nowMs() - frameStart;
      this.perf.frameCount += 1;
      this.perf.totalFrameWorkMs += workMs;
      this.perf.avgFrameWorkMs = this.perf.totalFrameWorkMs / this.perf.frameCount;
      if (workMs > 22.2) {
        this.perf.slowFramesUnder45Fps += 1;
      }

      raf(tick);
    };

    raf(tick);
  }

  /**
   * 单帧推进：先更新真实时间输入与 UI，再按倍速执行 1/2/3 个固定逻辑步 (1/60s)，最后绘制
   */
  stepFrame(realDt) {
    this.scene.updateRealTime(realDt);

    if (this.scene.state === 'BATTLE' && !this.scene.ui.showGuideModal && !this.scene.ui.showSettingsModal) {
      const steps = this.scene.speedMultiplier || 1;
      for (let s = 0; s < steps; s++) {
        this.scene.fixedStep(FIXED_DT);
      }
    }

    const ctx = platform.getContext();
    if (ctx) {
      platform.beginFrame();
      this.scene.render(ctx);
      platform.endFrame();

      const dc = platform.getViewport().drawCalls;
      if (dc > this.perf.maxDrawCallsSeen) {
        this.perf.maxDrawCallsSeen = dc;
      }
    }
  }
}

module.exports = GameLoop;

  };

  /* --- game.js --- */
  __modules['game'] = function(require, module, exports) {
/**
 * 《蘑菇守林》(Sporeguard) 游戏主入口 (game.js)
 * 初始化画布、加载主包透明图集资源、绑定输入适配层并启动 60fps 固定步长主循环
 */

const platform = require('./js/core/platform');
const input = require('./js/input/input');
const SceneController = require('./js/core/scene');
const GameLoop = require('./js/core/loop');
const { SPRITE_ATLAS, UI_ATLAS } = require('./js/data/atlas');
const { MAPS } = require('./js/data/maps');

function bootstrapGame() {
  platform.initCanvas();
  input.initInput();

  const scene = new SceneController();
  scene.init();

  const loop = new GameLoop(scene);

  // 预加载主包透明 PNG 精灵图集、UI图集、标题背景原画、AI 范围特效法阵与地图分包
  const vfxAssets = [
    'assets/vfx/range_watch_sniper.png',
    'assets/vfx/range_mist_poison.png',
    'assets/vfx/range_thorn_bramble.png',
    'assets/vfx/range_burst_mortar.png',
    'assets/vfx/range_fairy_green.png',
    'assets/vfx/range_sunburst_gold.png',
    'assets/vfx/range_bramble_red.png',
    'assets/vfx/range_toxic_acid.png',
    'assets/vfx/range_earthshaker.png',
    'assets/vfx/range_commander_reticle.png',
    'assets/vfx/vfx_needle.png',
    'assets/vfx/vfx_mist.png',
    'assets/vfx/vfx_spikes.png',
    'assets/vfx/vfx_bomb.png',
    'assets/vfx/vfx_explosion.png',
    'assets/vfx/vfx_web_cocoon.png',
    'assets/vfx/prop_scarab.png',
    'assets/vfx/prop_stump.png',
    'assets/vfx/prop_dew.png',
    'assets/vfx/prop_pitcher.png',
    'assets/vfx/prop_pitcher_eating.png',
    'assets/vfx/prop_thunder_stump.png',
    'assets/vfx/relic_amber.png',
    'assets/vfx/relic_coin.png',
    'assets/vfx/relic_shield.png',
    'assets/vfx/relic_lightning.png',
    'assets/vfx/relic_clover.png',
    'assets/vfx/prop_spring.png',
    'assets/vfx/prop_debris.png',
    'assets/vfx/prop_lumina_base.png',
    'assets/vfx/prop_lumina_a.png',
    'assets/vfx/prop_lumina_b.png',
    'assets/vfx/guard_shield.png',
    'assets/vfx/guard_spear.png',
    'assets/vfx/relic_lumina.png',
    'assets/vfx/enemy_burrower.png',
    'assets/vfx/enemy_burrow_mound.png',
    'assets/vfx/enemy_volatile_pod.png',
    'assets/vfx/enemy_shaman.png',
        'assets/vfx/enemy_skeletal_husk.png',
    'assets/vfx/vfx_acid_puddle.png',
    'assets/vfx/enemy_leaper.png',
    'assets/vfx/enemy_leaper_jump.png',
    'assets/vfx/enemy_siege_beetle.png',
    'assets/vfx/vfx_leap_wind.png'
  ];

  Promise.all([
    platform.loadImage(SPRITE_ATLAS.path),
    platform.loadImage(UI_ATLAS.path),
    platform.loadImage(UI_ATLAS.titleBgPath),
    platform.loadMapSubpackage('map1', MAPS.map1.atlasPath),
    ...vfxAssets.map(p => platform.loadImage(p))
  ]).then(() => {
    // 后台预热地图 2 与地图 3 图集
    platform.loadMapSubpackage('map2', MAPS.map2.atlasPath);
    platform.loadMapSubpackage('map3', MAPS.map3.atlasPath);
  });

  loop.start();

  const g = typeof GameGlobal !== 'undefined' ? GameGlobal : (typeof globalThis !== 'undefined' ? globalThis : window);
  g.__SPOREGUARD__ = {
    scene,
    loop,
    platform,
    input
  };
}

bootstrapGame();

  };

  /* 启动主入口 game.js */
  makeRequire('root.js')('game');
})();
