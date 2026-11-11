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
    // 黄金比例视口布局：全图 20x15 格局完美自适应于 [X:208..752, Y:24..432] 核心视窗，底部严密留出 108px 卡牌与法术专区，绝对不遮挡底部任何守卫与防御塔！
    MAP_VIEW: { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0, SCALE_X: 1.0, SCALE_Y: 1.0, FULL_W: 960, FULL_H: 540 },
    BOTTOM_BAR: { X: 218, Y: 442, WIDTH: 524, HEIGHT: 92 },
    LEFT_HERO_DOCK: { X: 14, Y: 260, WIDTH: 184, HEIGHT: 270 },
    RIGHT_PANEL: { X: 760, Y: 10, WIDTH: 190, HEIGHT: 520 }
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
      map1: 210,               // PvZ 经典战术开局：210 孢子正好支持 1 守望菇(115) + 1 灵光菇(95) 开局
      map2: 200,
      map3: 220,
      map4: 240
    },
    TARGET_TOTAL_BUDGET: {
      map1: 1800,
      map2: 2400,
      map3: 3200,
      map4: 3800
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
    PREP_TIME_FIRST_WAVE: 25,  // 第一波前倒计时 35 秒
    PREP_TIME_NEXT_WAVE: 15    // 之后每波前倒计时 18 秒
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
    MAX_ACTIVE_WAVE_ENEMIES: 48,  // 提升场上最大并发敌人上限至 36，彻底消除波次卡顿与少怪未出  // 同一时刻场上波次出生敌人不超过 12 个
    WAVE_HP_GROWTH_PER_WAVE: 0.20,// 当前生命倍率 = (1 + 0.10 * (波次序号 - 1)) * 地图系数
    MAP_HP_COEFFICIENTS: {
      map1: 1.0,
      map2: 1.15,
      map3: 1.30,
      map4: 1.42
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
      hitstopMs: 0,
      particles: 16,
      shockwaveRing: true
    },
    MULTIKILL_SMALL: { // 3-4 只
      minKills: 3,
      maxKills: 4,
      shakePx: 2,
      shakeMs: 120,
      hitstopMs: 0,
      particles: 24,
      bannerKey: null,
      sfx: 'sfx_multikill'
    },
    MULTIKILL_CHAIN: { // 5-9 只
      minKills: 5,
      maxKills: 9,
      shakePx: 4,
      shakeMs: 200,
      hitstopMs: 0,
      particles: 24,
      bannerKey: 'banner_chain',
      sfx: 'sfx_multikill'
    },
    MULTIKILL_OVERLOAD: { // 10 只及以上
      minKills: 10,
      maxKills: 999,
      shakePx: 6,
      shakeMs: 300,
      hitstopMs: 0,
      particles: 32,
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
    baseDamage: 42,
    maxTotalCost: 480,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'watch_base_desc',
        cost: 115,
        range: 6.2,
        damage: 42,
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
        range: 6.6,
        damage: 52,
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
        cost: 105,
        range: 8.0,        // 射程 +1.5
        damage: 56,
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
        cost: 175,
        range: 9.0,        // 射程 +1.0
        damage: 70,
        damageBonus: 0.20,
        interval: 1.125,
        bulletSpeed: 800,
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: true, // 命中后标记目标 3 秒，直接伤害 +15%
        markDuration: 3.0,
        markBonus: 0.20,
        armorPierce: 0.35,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'watch_b2_name',
        descKey: 'watch_b2_desc',
        cost: 105,
        range: 6.5,
        damage: 72,        // 40 * (1 + 0.20 + 0.35) = 62
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
        cost: 175,
        range: 6.5,
        damage: 86,
        damageBonus: 0.55,
        interval: 1.25,
        bulletSpeed: 640,
        critRate: 0.22,    // 暴击率 15%，暴击伤害 2 倍
        critMultiplier: 2.2,
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
        dps: 5,
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
        dps: 5,
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
        dps: 6,
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
        residualSlowDuration: 1.5,
        armorReduction: 4,  // 雾团内敌人护甲 -2（最低 0）
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
        dps: 8,             // 持续伤害 +2
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
        dps: 14,            // 雾团燃烧，持续伤害 +4（累计 10）
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
    baseDamage: 10,
    maxTotalCost: 375,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'thorn_base_desc',
        cost: 80,
        range: 4.5,
        damage: 10,
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
        damage: 12,      // 伤害 +20%
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
        damage: 12,
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
        damage: 13,
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
        damage: 15,      // 9 * (1 + 0.20 + 0.30) = 13.5
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
        damage: 16,
        damageBonus: 0.50,
        interval: 0.41,    // 攻击间隔 -10% (0.45 * 0.9 = 0.405 -> 0.41)
        pierce: 3,
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0.25,
        armorPierce: 6, // 每穿透 1 个目标，后续伤害 +20%（最多 +100%）
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
    baseDamage: 32,
    maxTotalCost: 465,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'burst_base_desc',
        cost: 110,
        range: 4.0,        // 射程 4.0 格（全部节点保持不变）
        damage: 32,
        damageBonus: 0,
        interval: 1.55,     // 攻击间隔 1.6 秒（全部节点保持不变）
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
        damage: 38,        // 伤害 +20%
        damageBonus: 0.20,
        interval: 1.55,
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
        cost: 105,
        range: 4.0,
        damage: 40,
        damageBonus: 0.20,
        interval: 1.55,
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
        cost: 175,
        range: 4.0,
        damage: 46,      // 30 * (1 + 0.20 + 0.15) = 40.5
        damageBonus: 0.35,
        interval: 1.55,
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
        cost: 105,
        range: 4.0,
        damage: 48,        // 30 * (1 + 0.20 + 0.30) = 45
        damageBonus: 0.50,
        interval: 1.55,
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
        cost: 175,
        range: 4.0,
        damage: 52,
        damageBonus: 0.50,
        interval: 1.55,
        splashRadius: 1.25,
        flightTime: 0.38,
        burnZone: {        // 爆心留下灼烧区：半径 1.0 格，持续 3 秒，每秒 8 点伤害
          radius: 1.0,
          duration: 3.5,
          dps: 12
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
        damage: 8,
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
        damage: 12,
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
        damage: 22,
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
        damage: 42,
        interval: 1.1,
        holySmite: true,
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
        sporeGen: 24,
        sporeInterval: 7.0,
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
        sporeGen: 36,
        sporeInterval: 6.0,
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
    speed: 0.78,         // 格/秒
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
        interval: 9.5
      },
      phase3Threshold: 0.33, // 生命降至 33%：狂暴冲锋加速 +25%，护甲提升至 16
      phase3SpeedMultiplier: 1.25,
      phase3Earthquake: true,
      phase3Armor: 16,
      phase3SlowImmune: false,
      phase3DeathSplit: null
    }
  },

  boss_m2: {
    id: 'boss_m2',
    nameKey: 'enemy_boss_m2_name', // 腐化蛾后
    typeKey: 'enemy_type_boss',
    tipKey: 'enemy_boss_m2_tip',
    baseHp: 2200,        // 飞行首领本体中等血量，主打召唤与高速突袭
    speed: 0.90,         // 格/秒（空中航线）
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

  boss_m4: {
    id: 'boss_m4',
    nameKey: 'enemy_boss_m4_name', // 蚀日圣甲皇
    typeKey: 'enemy_type_boss',
    tipKey: 'enemy_boss_m4_tip',
    baseHp: 3900,
    speed: 0.74,
    armor: 18,
    threat: 5,
    reward: 220,
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
        type: 'armored',
        count: 2,
        interval: 11.0
      },
      phase3Threshold: 0.35,
      phase3SpeedMultiplier: 1.42,
      phase3Earthquake: true,
      phase3Armor: 16,
      phase3SlowImmune: false,
      phase3DeathSplit: {
        type: 'armored',
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
    initialSpores: 210,
    hpCoefficient: 1.0,
    totalWaves: 10,
    bossId: 'boss_m1',
    // 地面路径拐点（格坐标 [col, row]），总长 45 格
    groundWaypoints: [
      [0.0, 2.3], [0.75, 2.13], [1.82, 1.87], [2.99, 1.65], [4.0, 1.6], [4.86, 1.72],
      [5.67, 1.95], [6.35, 2.33], [6.8, 2.9], [6.9, 3.74], [6.74, 4.81], [6.51, 5.94],
      [6.4, 7.0], [6.41, 8.01], [6.44, 9.04], [6.59, 9.95], [6.9, 10.6], [7.47, 10.95],
      [8.25, 11.09], [9.08, 11.03], [9.8, 10.8], [10.43, 10.39], [11.03, 9.8], [11.54, 9.06],
      [11.9, 8.2], [11.98, 7.11], [11.86, 5.8], [11.76, 4.54], [11.9, 3.6], [12.39, 3.04],
      [13.09, 2.72], [13.88, 2.59], [14.6, 2.6], [15.31, 2.73], [16.04, 3.01], [16.68, 3.46],
      [17.1, 4.1], [17.18, 5.05], [17.02, 6.26], [16.8, 7.51], [16.7, 8.6], [16.75, 9.52],
      [16.87, 10.36], [17.05, 11.07], [17.3, 11.6], [17.69, 11.89], [18.19, 11.99], [18.67, 11.99],
      [19.0, 12.0]
    ],
    spawnTile2: [0, 9],
    // 侧翼巢穴·西部幽暗林径突袭路径 (Secondary Flank Route - 南部双线包抄)
    groundWaypoints2: [
      [0.0, 9.2], [0.47, 9.19], [1.16, 9.17], [1.89, 9.22], [2.5, 9.4], [2.91, 9.79],
      [3.22, 10.34], [3.54, 10.91], [4.0, 11.4], [4.6, 11.78], [5.29, 12.12], [6.09, 12.4],
      [7.0, 12.6], [8.09, 12.72], [9.34, 12.76], [10.61, 12.74], [11.8, 12.7], [12.88, 12.61],
      [13.9, 12.47], [14.88, 12.32], [15.8, 12.2], [16.73, 12.12], [17.65, 12.07], [18.44, 12.03],
      [19.0, 12.0]
    ],
    // 空中航线拐点（跳过部分地面转角，长度约 35.8 格 ≈ 地面路线 80%）
    airWaypoints: [
      [0, 2], [5, 2], [8, 9], [12, 9], [15, 4], [17, 4],
      [19, 12]
    ],
    warehouseTile: [19, 12],
    spawnTile: [0, 2],
    // 黄金战术苔地格（提示玩家最佳放置点，可建造）
    mossTiles: [
      [5, 3], [8, 5], [5, 10], [2, 11], [8, 7], [10, 7],
      [14, 11], [12, 2], [14, 4], [14, 7], [1, 12], [15, 1],
      [18, 9]
    ],
    // 障碍物 (4处纯净自然林地险隘，绝无重叠重合与被压资产)
    obstacles: [
      [3, 7], [8, 3], [13, 9], [18, 3]
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
    initialSpores: 200,
    hpCoefficient: 1.1,
    totalWaves: 12,
    bossId: 'boss_m2',
    // 地面路径拐点，总长 52 格（双回环溪谷，适合雾菇+爆裂菇群清与高台对空）
    groundWaypoints: [
      [0.0, 10.7], [0.54, 10.71], [1.32, 10.75], [2.15, 10.69], [2.8, 10.4], [3.24, 9.83],
      [3.57, 9.04], [3.81, 8.14], [4.0, 7.2], [4.05, 6.14], [3.97, 4.96], [3.93, 3.84],
      [4.1, 3.0], [4.57, 2.48], [5.24, 2.18], [5.96, 2.06], [6.6, 2.1], [7.16, 2.27],
      [7.71, 2.61], [8.17, 3.11], [8.5, 3.8], [8.62, 4.78], [8.59, 6.01], [8.52, 7.29],
      [8.5, 8.4], [8.51, 9.35], [8.5, 10.23], [8.59, 10.97], [8.9, 11.5], [9.54, 11.81],
      [10.41, 11.94], [11.33, 11.87], [12.1, 11.6], [12.69, 11.09], [13.19, 10.36], [13.6, 9.48],
      [13.9, 8.5], [13.98, 7.3], [13.88, 5.9], [13.82, 4.57], [14.0, 3.6], [14.57, 3.05],
      [15.39, 2.76], [16.24, 2.72], [16.9, 2.9], [17.28, 3.39], [17.51, 4.17], [17.69, 5.04],
      [17.9, 5.8], [18.19, 6.45], [18.51, 7.08], [18.8, 7.62], [19.0, 8.0]
    ],
    spawnTile2: [19, 12],
    // 东南溪谷暗穴·侧翼汇流突袭路径 (无碰撞直切防线中枢)
    groundWaypoints2: [
      [19.0, 12.2], [18.28, 12.35], [17.24, 12.57], [16.17, 12.72], [15.4, 12.6], [15.01, 12.16],
      [14.84, 11.49], [14.8, 10.67], [14.8, 9.8], [14.84, 8.74], [14.94, 7.49], [15.13, 6.35],
      [15.4, 5.6], [15.79, 5.38], [16.28, 5.52], [16.81, 5.85], [17.3, 6.2], [17.78, 6.61],
      [18.27, 7.14], [18.7, 7.65], [19.0, 8.0]
    ],
    // 空中航线拐点（长约 42.1 格 ≈ 地面路线 81%）
    airWaypoints: [
      [0, 11], [4, 11], [4, 4], [9, 4], [9, 10], [14, 10],
      [14, 4], [18, 4], [19, 8]
    ],
    warehouseTile: [19, 8],
    spawnTile: [0, 11],
    mossTiles: [
      [5, 9], [5, 4], [16, 10], [2, 9], [10, 3], [11, 7],
      [10, 8], [12, 5], [16, 4], [18, 2], [12, 13], [2, 3],
      [5, 11]
    ],
    // 障碍物
    obstacles: [
      [2, 6], [11, 10], [12, 3], [17, 1]
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
    initialSpores: 220,
    hpCoefficient: 1.2,
    totalWaves: 15,
    bossId: 'boss_m3',
    // 地面路径拐点，总长 60 格（三层平行长廊，极佳适配尖刺菇直线穿透与中枢联防）
    groundWaypoints: [
      [0.0, 2.2], [0.95, 2.16], [2.31, 2.09], [3.87, 2.03], [5.4, 2.0], [6.92, 1.99],
      [8.53, 2.01], [10.12, 2.04], [11.6, 2.1], [13.04, 2.15], [14.47, 2.2], [15.71, 2.33],
      [16.6, 2.6], [17.11, 3.12], [17.32, 3.83], [17.24, 4.54], [16.9, 5.1], [16.23, 5.46],
      [15.26, 5.71], [14.08, 5.88], [12.8, 6.0], [11.35, 6.03], [9.71, 5.97], [8.07, 5.91],
      [6.6, 5.9], [5.29, 5.93], [4.06, 5.97], [3.03, 6.1], [2.3, 6.4], [1.89, 6.99],
      [1.75, 7.79], [1.88, 8.6], [2.3, 9.2], [3.08, 9.52], [4.2, 9.67], [5.49, 9.74],
      [6.8, 9.8], [8.18, 9.84], [9.69, 9.82], [11.15, 9.82], [12.4, 9.9], [13.34, 10.08],
      [14.08, 10.33], [14.76, 10.64], [15.5, 11.0], [16.43, 11.48], [17.44, 12.07], [18.36, 12.62],
      [19.0, 13.0]
    ],
    spawnTile2: [0, 8],
    // 幽夜地脉·下层峡谷双线合围路径 (Zero collision across lower chasm)
    groundWaypoints2: [
      [0.0, 8.0], [0.07, 8.66], [0.15, 9.62], [0.31, 10.62], [0.6, 11.4], [1.01, 11.9],
      [1.53, 12.26], [2.17, 12.51], [3.0, 12.7], [4.06, 12.81], [5.32, 12.82], [6.68, 12.8],
      [8.0, 12.8], [9.32, 12.83], [10.69, 12.85], [12.01, 12.88], [13.2, 12.9], [14.25, 12.93],
      [15.19, 12.96], [16.04, 12.98], [16.8, 13.0], [17.5, 13.01], [18.12, 13.01], [18.64, 13.0],
      [19.0, 13.0]
    ],
    // 空中航线拐点（长约 48.8 格 ≈ 地面路线 81%）
    airWaypoints: [
      [0, 2], [15, 2], [15, 6], [4, 6], [4, 10], [14, 10],
      [19, 13]
    ],
    warehouseTile: [19, 13],
    spawnTile: [0, 2],
    mossTiles: [
      [3, 4], [7, 4], [11, 4], [15, 4], [4, 8], [10, 8],
      [12, 8], [15, 8], [5, 11], [9, 11], [12, 11], [18, 6],
      [17, 9], [1, 4], [13, 4], [19, 4], [18, 1]
    ],
    // 障碍物
    obstacles: [
      [9, 4], [6, 8], [14, 7], [10, 1]
    ],
    parallaxColors: ['#14213D', '#1F3A5F', '#1F3B2C'],
    mistAlpha: 0.20,
    dynamicNightLight: true // 随波次光照增强
  },

  map4: {
    id: 'map4',
    index: 4,
    nameKey: 'map4_name',
    subtitleKey: 'map4_subtitle',
    descKey: 'map4_desc',
    theme: 'eclipse_ruins',
    subpackage: 'map4',
    atlasPath: 'subpackages/map4/atlas.png',
    bossBgmPath: 'subpackages/map4/boss.wav',
    initialSpores: 240,
    hpCoefficient: 1.35,
    totalWaves: 18,
    bossId: 'boss_m4',
    groundWaypoints: [
      [0.0, 2.8], [0.66, 2.67], [1.61, 2.49], [2.63, 2.33], [3.5, 2.3], [4.21, 2.4],
      [4.86, 2.59], [5.4, 2.88], [5.8, 3.3], [5.92, 3.95], [5.83, 4.79], [5.77, 5.61],
      [6.0, 6.2], [6.64, 6.52], [7.53, 6.69], [8.51, 6.68], [9.4, 6.5], [10.16, 6.01],
      [10.87, 5.26], [11.57, 4.5], [12.3, 4.0], [13.12, 3.79], [14.0, 3.74], [14.8, 3.87],
      [15.4, 4.2], [15.65, 4.88], [15.65, 5.86], [15.65, 6.83], [15.9, 7.5], [16.56, 7.73],
      [17.48, 7.71], [18.38, 7.58], [19.0, 7.5]
    ],
    spawnTile2: [0, 11],
    groundWaypoints2: [
      [0.0, 11.4], [0.64, 11.53], [1.56, 11.73], [2.59, 11.89], [3.6, 11.9], [4.55, 11.65],
      [5.52, 11.24], [6.5, 10.83], [7.5, 10.6], [8.53, 10.68], [9.57, 10.94], [10.61, 11.21],
      [11.6, 11.3], [12.58, 11.17], [13.56, 10.91], [14.43, 10.54], [15.1, 10.1], [15.44, 9.49],
      [15.53, 8.72], [15.6, 8.0], [15.9, 7.5], [16.59, 7.32], [17.5, 7.34], [18.39, 7.44],
      [19.0, 7.5]
    ],
    airWaypoints: [
      [0, 3], [6, 3], [11, 7], [16, 7], [19, 7]
    ],
    warehouseTile: [19, 7],
    spawnTile: [0, 3],
    mossTiles: [
      [2, 5], [4, 5], [4, 8], [2, 9], [8, 2], [10, 2],
      [8, 4], [10, 4], [8, 9], [10, 9], [13, 6], [13, 8],
      [14, 2], [17, 5], [17, 10], [13, 13]
    ],
    obstacles: [
      [6, 9], [11, 13], [14, 12], [18, 3]
    ],
    parallaxColors: ['#1C1A10', '#38321B', '#28381E'],
    mistAlpha: 0.14
  }
};

const MAP_ORDER = ['map1', 'map2', 'map3', 'map4'];

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
        { type: 'beetle', count: 5, interval: 0.95, start: 0 },
        { type: 'beetle', count: 6, interval: 0.90, start: 6 },
        { type: 'beetle', count: 6, interval: 0.85, start: 13 }
      ]
    },
    // Wave 2: 极速突袭，迅捷飞蠓双线分进合击
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 5, interval: 1.0, start: 0 },
        { type: 'swift', count: 5, interval: 0.80, start: 5 },
        { type: 'swift', count: 3, interval: 1.10, start: 9, routeIndex: 1 },
        { type: 'beetle', count: 4, interval: 0.95, start: 14 },
        { type: 'swift', count: 5, interval: 0.75, start: 18 }
      ]
    },
    // Wave 3: 树冠空袭，林光飞蛾掠空（教学性空袭：4 只飞蛾平滑进阶，配合侧翼甲虫）
    {
      wave: 3,
      groups: [
        { type: 'beetle', count: 6, interval: 1.0, start: 0 },
        { type: 'moth', count: 2, interval: 1.4, start: 4 },
        { type: 'swift', count: 6, interval: 0.80, start: 9 },
        { type: 'moth', count: 2, interval: 1.4, start: 15 },
        { type: 'beetle', count: 3, interval: 1.2, start: 19, routeIndex: 1 }
      ]
    },
    // Wave 4: 坚甲逼近，暗影潜行者侧翼回旋绕袭
    {
      wave: 4,
      groups: [
        { type: 'armored', count: 1, interval: 2.0, start: 0 },
        { type: 'beetle', count: 5, interval: 0.9, start: 3 },
        { type: 'weaver', count: 1, interval: 2.5, start: 10 },
        { type: 'leaper', count: 1, interval: 1.5, start: 13, routeIndex: 1 },
        { type: 'beetle', count: 3, interval: 1.1, start: 16, routeIndex: 1 },
        { type: 'swift', count: 4, interval: 0.8, start: 18 },
        { type: 'moth', count: 3, interval: 1.35, start: 20 }
      ]
    },
    // Wave 5: 空地一体混合冲锋与爆裂侧袭
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 2, interval: 2.5, start: 0 },
        { type: 'swift', count: 8, interval: 0.75, start: 4 },
        { type: 'moth', count: 5, interval: 1.25, start: 12 },
        { type: 'volatile_pod', count: 2, interval: 1.6, start: 16, routeIndex: 1 },
        { type: 'beetle', count: 6, interval: 0.85, start: 20 },
        { type: 'shaman', count: 1, interval: 1.0, start: 24, routeIndex: 1 }
      ]
    },
    // Wave 6: 异化裂殖，潜伏掘地虫破土偷袭
    {
      wave: 6,
      groups: [
        { type: 'siege_beetle', count: 1, interval: 1.0, start: 0 },
        { type: 'leaper', count: 2, interval: 1.5, start: 2 },
        { type: 'splitter', count: 3, interval: 2.0, start: 5 },
        { type: 'weaver', count: 2, interval: 2.0, start: 2 },
        { type: 'beetle', count: 6, interval: 0.9, start: 6 },
        { type: 'burrower', count: 2, interval: 2.2, start: 10, routeIndex: 1 },
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
        { type: 'moth', count: 10, interval: 0.95, start: 12 },
        { type: 'swift', count: 8, interval: 0.65, start: 22 },
        { type: 'burrower', count: 3, interval: 2.0, start: 25 }
      ]
    },
    // Wave 8: 狂暴大迁徙与后排钳形围猎
    {
      wave: 8,
      groups: [
        { type: 'swift', count: 16, interval: 0.55, start: 0 },
        { type: 'moth', count: 12, interval: 0.85, start: 8 },
        { type: 'leaper', count: 3, interval: 1.5, start: 12, routeIndex: 1 },
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
        { type: 'swift', count: 18, interval: 0.50, start: 14 },
        { type: 'moth', count: 12, interval: 0.80, start: 20 }
      ]
    },
    // Wave 10: 最终决战 腐化蛀王登场
    {
      wave: 10,
      groups: [
        { type: 'boss_m1', count: 1, interval: 1.0, start: 0 },
        { type: 'armored', count: 1, interval: 2.5, start: 6 },
        { type: 'beetle', count: 5, interval: 1.2, start: 8 },
        { type: 'moth', count: 6, interval: 1.3, start: 13 },
        { type: 'leaper', count: 3, interval: 1.4, start: 18, routeIndex: 1 },
        { type: 'splitter', count: 3, interval: 2.0, start: 24 },
        { type: 'burrower', count: 2, interval: 1.8, start: 29, routeIndex: 1 },
        { type: 'swift', count: 10, interval: 0.7, start: 34 }
      ]
    }
  ],

  // 地图 2：苔藓溪谷（12 波，双回环溪谷 + 高台暗穴侧翼突击）
  map2: [
    // Wave 1: 先遣甲虫群试探防线
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 7, interval: 1.1, start: 0 },
        { type: 'beetle', count: 7, interval: 0.95, start: 9 }
      ]
    },
    // Wave 2: 疾风突刺与首批树冠飞蛾空袭
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 6, interval: 1.0, start: 0 },
        { type: 'swift', count: 5, interval: 0.9, start: 6 },
        { type: 'moth', count: 3, interval: 1.5, start: 12 }
      ]
    },
    // Wave 3: 溪谷双线包抄与树冠飞蛾试探
    {
      wave: 3,
      groups: [
        { type: 'swift', count: 6, interval: 0.8, start: 0 },
        { type: 'beetle', count: 6, interval: 0.9, start: 5 },
        { type: 'swift', count: 4, interval: 0.9, start: 7, routeIndex: 1 },
        { type: 'moth', count: 5, interval: 1.2, start: 12 }
      ]
    },
    // Wave 4: 疾虫与飞蛾快攻，侧翼高台跳跃者偷袭
    {
      wave: 4,
      groups: [
        { type: 'moth', count: 6, interval: 1.1, start: 0 },
        { type: 'swift', count: 8, interval: 0.7, start: 6 },
        { type: 'leaper', count: 3, interval: 1.5, start: 8, routeIndex: 1 },
        { type: 'beetle', count: 6, interval: 0.9, start: 14 }
      ]
    },
    // Wave 5: 引入重型甲壳虫
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 2, interval: 2.2, start: 0 },
        { type: 'beetle', count: 7, interval: 0.9, start: 5 },
        { type: 'moth', count: 6, interval: 1.1, start: 12 }
      ]
    },
    // Wave 6: 重甲与蛛丝纺织者协同，侧翼快虫包抄
    {
      wave: 6,
      groups: [
        { type: 'armored', count: 2, interval: 2.0, start: 0 },
        { type: 'weaver', count: 2, interval: 2.2, start: 6 },
        { type: 'swift', count: 7, interval: 0.7, start: 8, routeIndex: 1 },
        { type: 'moth', count: 6, interval: 1.1, start: 14 },
        { type: 'beetle', count: 6, interval: 0.8, start: 20 }
      ]
    },
    // Wave 7: 裂殖母虫与东南掘地伏兵夹击
    {
      wave: 7,
      groups: [
        { type: 'splitter', count: 3, interval: 2.0, start: 0 },
        { type: 'burrower', count: 2, interval: 1.8, start: 4, routeIndex: 1 },
        { type: 'beetle', count: 7, interval: 0.8, start: 7 },
        { type: 'moth', count: 6, interval: 1.1, start: 14 }
      ]
    },
    // Wave 8: 攻城巨甲与暗穴掘地虫夹击，巫毒萨满治疗
    {
      wave: 8,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.0, start: 0 },
        { type: 'shaman', count: 1, interval: 1.0, start: 4 },
        { type: 'burrower', count: 3, interval: 1.6, start: 8, routeIndex: 1 },
        { type: 'splitter', count: 4, interval: 1.8, start: 10 },
        { type: 'swift', count: 8, interval: 0.7, start: 16 },
        { type: 'moth', count: 6, interval: 1.1, start: 22 }
      ]
    },
    // Wave 9: 混编破阵双翼包夹大潮
    {
      wave: 9,
      groups: [
        { type: 'armored', count: 3, interval: 1.8, start: 0 },
        { type: 'moth', count: 7, interval: 1.0, start: 6 },
        { type: 'swift', count: 6, interval: 0.8, start: 10, routeIndex: 1 },
        { type: 'splitter', count: 4, interval: 1.6, start: 14 },
        { type: 'swift', count: 7, interval: 0.7, start: 21 }
      ]
    },
    // Wave 10: 混编强袭与后排回旋飞跃
    {
      wave: 10,
      groups: [
        { type: 'swift', count: 9, interval: 0.65, start: 0 },
        { type: 'weaver', count: 2, interval: 2.0, start: 5 },
        { type: 'leaper', count: 4, interval: 1.2, start: 8, routeIndex: 1 },
        { type: 'armored', count: 3, interval: 1.8, start: 12 },
        { type: 'moth', count: 8, interval: 1.0, start: 18 },
        { type: 'splitter', count: 5, interval: 1.6, start: 24 }
      ]
    },
    // Wave 11: 决战前夕黑潮，地底掘地虫倾巢突围
    {
      wave: 11,
      groups: [
        { type: 'siege_beetle', count: 1, interval: 1.0, start: 0 },
        { type: 'armored', count: 4, interval: 1.8, start: 4 },
        { type: 'burrower', count: 4, interval: 1.5, start: 8, routeIndex: 1 },
        { type: 'splitter', count: 5, interval: 1.6, start: 14 },
        { type: 'moth', count: 9, interval: 0.9, start: 20 },
        { type: 'swift', count: 10, interval: 0.6, start: 26 }
      ]
    },
    // Wave 12: 最终波 剧毒飞蛾后登场（空中首领 + 侧翼暗穴两翼合围）
    {
      wave: 12,
      groups: [
        { type: 'boss_m2', count: 1, interval: 1.0, start: 0 },
        { type: 'moth', count: 7, interval: 2.0, start: 6 },
        { type: 'leaper', count: 3, interval: 1.6, start: 10, routeIndex: 1 },
        { type: 'armored', count: 3, interval: 3.5, start: 18 },
        { type: 'burrower', count: 3, interval: 1.8, start: 24, routeIndex: 1 },
        { type: 'splitter', count: 4, interval: 2.8, start: 30 },
        { type: 'swift', count: 8, interval: 1.2, start: 40 }
      ]
    }
  ],

  // 地图 3：夜光蕈林（15 波，三层平行长廊 + 幽夜地脉暗穴突袭）
  map3: [
    // Wave 1: 小甲虫与疾蛾
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 7, interval: 2.0, start: 0 },
        { type: 'swift', count: 6, interval: 1.6, start: 14 }
      ]
    },
    // Wave 2: 小甲虫与疾蛾密集突进
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 8, interval: 1.8, start: 0 },
        { type: 'swift', count: 7, interval: 1.4, start: 14 },
        { type: 'beetle', count: 6, interval: 1.6, start: 26 }
      ]
    },
    // Wave 3: 幽夜上路与下层地脉双线速攻
    {
      wave: 3,
      groups: [
        { type: 'swift', count: 7, interval: 1.3, start: 0 },
        { type: 'beetle', count: 8, interval: 1.4, start: 8 },
        { type: 'swift', count: 5, interval: 1.0, start: 14, routeIndex: 1 },
        { type: 'swift', count: 6, interval: 1.3, start: 24 }
      ]
    },
    // Wave 4: 引入甲壳虫与飞蛾
    {
      wave: 4,
      groups: [
        { type: 'armored', count: 3, interval: 3.8, start: 0 },
        { type: 'moth', count: 6, interval: 2.0, start: 10 },
        { type: 'beetle', count: 7, interval: 1.6, start: 22 }
      ]
    },
    // Wave 5: 陆空夹击与后排暗穴跃击者首现
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 3, interval: 3.5, start: 0 },
        { type: 'swift', count: 8, interval: 1.2, start: 10 },
        { type: 'leaper', count: 3, interval: 1.4, start: 14, routeIndex: 1 },
        { type: 'moth', count: 7, interval: 1.8, start: 22 },
        { type: 'beetle', count: 7, interval: 1.5, start: 34 }
      ]
    },
    // Wave 6: 裂殖母虫与下路跃击伏兵
    {
      wave: 6,
      groups: [
        { type: 'splitter', count: 5, interval: 2.8, start: 0 },
        { type: 'leaper', count: 2, interval: 1.5, start: 8, routeIndex: 1 },
        { type: 'moth', count: 6, interval: 2.0, start: 14 },
        { type: 'swift', count: 8, interval: 1.2, start: 26 }
      ]
    },
    // Wave 7: 裂殖与重甲推进，暗穴掘地虫破土偷袭
    {
      wave: 7,
      groups: [
        { type: 'armored', count: 4, interval: 3.2, start: 0 },
        { type: 'weaver', count: 2, interval: 2.5, start: 10 },
        { type: 'burrower', count: 3, interval: 1.6, start: 14, routeIndex: 1 },
        { type: 'splitter', count: 5, interval: 2.6, start: 20 },
        { type: 'moth', count: 7, interval: 1.8, start: 32 }
      ]
    },
    // Wave 8: 双路重装压境
    {
      wave: 8,
      groups: [
        { type: 'splitter', count: 6, interval: 2.5, start: 0 },
        { type: 'armored', count: 4, interval: 3.2, start: 12 },
        { type: 'beetle', count: 6, interval: 1.2, start: 18, routeIndex: 1 },
        { type: 'moth', count: 8, interval: 1.6, start: 24 },
        { type: 'beetle', count: 7, interval: 1.3, start: 36 }
      ]
    },
    // Wave 9: 巫毒蝉俑治疗支援，暗穴跳跃者群袭
    {
      wave: 9,
      groups: [
        { type: 'armored', count: 4, interval: 3.0, start: 0 },
        { type: 'shaman', count: 1, interval: 1.0, start: 6 },
        { type: 'leaper', count: 4, interval: 1.2, start: 12, routeIndex: 1 },
        { type: 'swift', count: 9, interval: 1.0, start: 18 },
        { type: 'moth', count: 7, interval: 1.6, start: 28 },
        { type: 'splitter', count: 5, interval: 2.4, start: 38 }
      ]
    },
    // Wave 10: 织网蛛封印防线，掘地虫两路夹击
    {
      wave: 10,
      groups: [
        { type: 'splitter', count: 6, interval: 2.4, start: 0 },
        { type: 'weaver', count: 3, interval: 2.2, start: 8 },
        { type: 'burrower', count: 4, interval: 1.5, start: 14, routeIndex: 1 },
        { type: 'armored', count: 4, interval: 3.0, start: 20 },
        { type: 'moth', count: 8, interval: 1.6, start: 30 },
        { type: 'swift', count: 10, interval: 1.0, start: 40 }
      ]
    },
    // Wave 11: 攻城巨甲双重冲锋，暗穴疾虫狂奔
    {
      wave: 11,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.5, start: 0 },
        { type: 'armored', count: 4, interval: 2.8, start: 8 },
        { type: 'swift', count: 8, interval: 0.7, start: 14, routeIndex: 1 },
        { type: 'splitter', count: 6, interval: 2.2, start: 20 },
        { type: 'moth', count: 8, interval: 1.5, start: 32 }
      ]
    },
    // Wave 12: 自爆恶蝉空降侧翼，巫毒双萨满护体
    {
      wave: 12,
      groups: [
        { type: 'shaman', count: 2, interval: 3.0, start: 0 },
        { type: 'armored', count: 5, interval: 2.8, start: 6 },
        { type: 'volatile_pod', count: 3, interval: 1.6, start: 12, routeIndex: 1 },
        { type: 'splitter', count: 7, interval: 2.2, start: 18 },
        { type: 'moth', count: 9, interval: 1.4, start: 30 },
        { type: 'swift', count: 11, interval: 0.9, start: 42 }
      ]
    },
    // Wave 13: 巨角攻城兽破关，地底伏兵两路绞杀
    {
      wave: 13,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.8, start: 0 },
        { type: 'leaper', count: 5, interval: 1.1, start: 8, routeIndex: 1 },
        { type: 'armored', count: 5, interval: 2.6, start: 14 },
        { type: 'burrower', count: 4, interval: 1.4, start: 20, routeIndex: 1 },
        { type: 'moth', count: 10, interval: 1.4, start: 28 },
        { type: 'splitter', count: 7, interval: 2.0, start: 40 }
      ]
    },
    // Wave 14: 终局前夜全军突击，天崩地裂海啸攻势
    {
      wave: 14,
      groups: [
        { type: 'armored', count: 6, interval: 2.4, start: 0 },
        { type: 'weaver', count: 3, interval: 2.0, start: 6 },
        { type: 'burrower', count: 5, interval: 1.3, start: 12, routeIndex: 1 },
        { type: 'splitter', count: 8, interval: 1.8, start: 18 },
        { type: 'leaper', count: 6, interval: 1.0, start: 26, routeIndex: 1 },
        { type: 'moth', count: 10, interval: 1.3, start: 34 },
        { type: 'swift', count: 12, interval: 0.8, start: 44 }
      ]
    },
    // Wave 15: 最终决战 深渊万虫巢母（全屏首领 + 攻城巨兽 + 暗穴狂潮）
    {
      wave: 15,
      groups: [
        { type: 'boss_m3', count: 1, interval: 1.0, start: 0 },
        { type: 'siege_beetle', count: 2, interval: 3.0, start: 6 },
        { type: 'shaman', count: 2, interval: 3.0, start: 12 },
        { type: 'leaper', count: 6, interval: 1.2, start: 18, routeIndex: 1 },
        { type: 'armored', count: 5, interval: 2.8, start: 26 },
        { type: 'burrower', count: 5, interval: 1.4, start: 34, routeIndex: 1 },
        { type: 'splitter', count: 6, interval: 2.2, start: 42 },
        { type: 'moth', count: 9, interval: 1.5, start: 50 },
        { type: 'swift', count: 12, interval: 0.8, start: 60 }
      ]
    }
  ],

  map4: [
    // Wave 1: 南北圣道双线试探
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 7, interval: 1.4, start: 0 },
        { type: 'beetle', count: 5, interval: 1.5, start: 4, routeIndex: 1 }
      ]
    },
    // Wave 2: 疾风飞蛾与分裂潜流
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 7, interval: 1.3, start: 0 },
        { type: 'swift', count: 6, interval: 0.9, start: 6, routeIndex: 1 },
        { type: 'splitter', count: 2, interval: 2.2, start: 12 }
      ]
    },
    // Wave 3: 古殿重甲伴随空袭初启
    {
      wave: 3,
      groups: [
        { type: 'armored', count: 2, interval: 2.8, start: 0 },
        { type: 'beetle', count: 8, interval: 1.2, start: 5 },
        { type: 'moth', count: 4, interval: 1.7, start: 12 },
        { type: 'swift', count: 6, interval: 0.9, start: 18, routeIndex: 1 }
      ]
    },
    // Wave 4: 潜地伏击与双翼疾袭
    {
      wave: 4,
      groups: [
        { type: 'burrower', count: 2, interval: 2.2, start: 0, routeIndex: 1 },
        { type: 'splitter', count: 3, interval: 2.0, start: 5 },
        { type: 'moth', count: 5, interval: 1.6, start: 12 },
        { type: 'swift', count: 8, interval: 0.85, start: 20 }
      ]
    },
    // Wave 5: 巫毒萨满统御重甲先遣军
    {
      wave: 5,
      groups: [
        { type: 'shaman', count: 1, interval: 1.0, start: 0 },
        { type: 'armored', count: 3, interval: 2.6, start: 3 },
        { type: 'beetle', count: 8, interval: 1.1, start: 8, routeIndex: 1 },
        { type: 'moth', count: 6, interval: 1.5, start: 16 }
      ]
    },
    // Wave 6: 织网古蛛封塔配合残骸冲锋
    {
      wave: 6,
      groups: [
        { type: 'weaver', count: 2, interval: 2.4, start: 0 },
        { type: 'skeletal_husk', count: 4, interval: 1.8, start: 6 },
        { type: 'leaper', count: 3, interval: 1.5, start: 12, routeIndex: 1 },
        { type: 'swift', count: 8, interval: 0.8, start: 20 }
      ]
    },
    // Wave 7: 攻城巨兜登场，天空魔蛾掩护
    {
      wave: 7,
      groups: [
        { type: 'siege_beetle', count: 1, interval: 1.0, start: 0 },
        { type: 'armored', count: 3, interval: 2.6, start: 5 },
        { type: 'moth', count: 7, interval: 1.4, start: 10 },
        { type: 'burrower', count: 3, interval: 1.8, start: 18, routeIndex: 1 }
      ]
    },
    // Wave 8: 自爆酸蝉突袭与多分裂集群
    {
      wave: 8,
      groups: [
        { type: 'volatile_pod', count: 2, interval: 1.8, start: 0, routeIndex: 1 },
        { type: 'splitter', count: 5, interval: 2.0, start: 5 },
        { type: 'shaman', count: 1, interval: 1.0, start: 12 },
        { type: 'armored', count: 4, interval: 2.5, start: 16 }
      ]
    },
    // Wave 9: 飞跃蝗翼侧翼斩首
    {
      wave: 9,
      groups: [
        { type: 'weaver', count: 2, interval: 2.2, start: 0 },
        { type: 'leaper', count: 5, interval: 1.2, start: 6, routeIndex: 1 },
        { type: 'moth', count: 8, interval: 1.35, start: 14 },
        { type: 'swift', count: 10, interval: 0.75, start: 24 }
      ]
    },
    // Wave 10: 半程祭坛铁卫阵线
    {
      wave: 10,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.8, start: 0 },
        { type: 'shaman', count: 2, interval: 3.0, start: 6 },
        { type: 'armored', count: 4, interval: 2.5, start: 12 },
        { type: 'splitter', count: 5, interval: 2.0, start: 20, routeIndex: 1 },
        { type: 'moth', count: 8, interval: 1.4, start: 28 }
      ]
    },
    // Wave 11: 地下暗流潜行狂潮
    {
      wave: 11,
      groups: [
        { type: 'burrower', count: 5, interval: 1.4, start: 0, routeIndex: 1 },
        { type: 'skeletal_husk', count: 6, interval: 1.6, start: 6 },
        { type: 'volatile_pod', count: 3, interval: 1.6, start: 14 },
        { type: 'swift', count: 10, interval: 0.8, start: 24, routeIndex: 1 }
      ]
    },
    // Wave 12: 萨满巫阵与魔蛾天幕
    {
      wave: 12,
      groups: [
        { type: 'shaman', count: 2, interval: 2.8, start: 0 },
        { type: 'armored', count: 5, interval: 2.4, start: 6 },
        { type: 'moth', count: 10, interval: 1.3, start: 14 },
        { type: 'weaver', count: 3, interval: 2.0, start: 24, routeIndex: 1 }
      ]
    },
    // Wave 13: 双线攻城铁锤强拆
    {
      wave: 13,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.4, start: 0 },
        { type: 'siege_beetle', count: 1, interval: 1.0, start: 10, routeIndex: 1 },
        { type: 'leaper', count: 5, interval: 1.1, start: 16, routeIndex: 1 },
        { type: 'splitter', count: 7, interval: 1.8, start: 24 },
        { type: 'swift', count: 10, interval: 0.8, start: 34 }
      ]
    },
    // Wave 14: 剧毒爆虫与织网封锁阵
    {
      wave: 14,
      groups: [
        { type: 'weaver', count: 3, interval: 1.9, start: 0 },
        { type: 'volatile_pod', count: 4, interval: 1.5, start: 8, routeIndex: 1 },
        { type: 'armored', count: 6, interval: 2.3, start: 16 },
        { type: 'moth', count: 10, interval: 1.3, start: 26 },
        { type: 'burrower', count: 4, interval: 1.5, start: 36, routeIndex: 1 }
      ]
    },
    // Wave 15: 残骸复生潮与双翼绝杀
    {
      wave: 15,
      groups: [
        { type: 'skeletal_husk', count: 7, interval: 1.5, start: 0 },
        { type: 'shaman', count: 2, interval: 2.8, start: 6 },
        { type: 'leaper', count: 6, interval: 1.0, start: 14, routeIndex: 1 },
        { type: 'splitter', count: 7, interval: 1.9, start: 24 },
        { type: 'moth', count: 10, interval: 1.25, start: 34 }
      ]
    },
    // Wave 16: 圣墟总攻前夕重甲洪流
    {
      wave: 16,
      groups: [
        { type: 'siege_beetle', count: 3, interval: 3.0, start: 0 },
        { type: 'armored', count: 6, interval: 2.2, start: 8 },
        { type: 'weaver', count: 3, interval: 1.8, start: 16 },
        { type: 'volatile_pod', count: 4, interval: 1.4, start: 24, routeIndex: 1 },
        { type: 'moth', count: 10, interval: 1.2, start: 34 }
      ]
    },
    // Wave 17: 蚀日降临前哨全兵种合围
    {
      wave: 17,
      groups: [
        { type: 'shaman', count: 3, interval: 2.5, start: 0 },
        { type: 'burrower', count: 5, interval: 1.3, start: 6, routeIndex: 1 },
        { type: 'leaper', count: 6, interval: 1.0, start: 14, routeIndex: 1 },
        { type: 'armored', count: 6, interval: 2.2, start: 22 },
        { type: 'splitter', count: 8, interval: 1.8, start: 32 },
        { type: 'moth', count: 12, interval: 1.2, start: 42 }
      ]
    },
    // Wave 18: 最终决战 蚀日圣甲皇降临！
    {
      wave: 18,
      groups: [
        { type: 'boss_m4', count: 1, interval: 1.0, start: 0 },
        { type: 'shaman', count: 2, interval: 2.8, start: 5 },
        { type: 'siege_beetle', count: 2, interval: 3.4, start: 10 },
        { type: 'leaper', count: 5, interval: 1.2, start: 16, routeIndex: 1 },
        { type: 'armored', count: 5, interval: 2.4, start: 24 },
        { type: 'burrower', count: 4, interval: 1.5, start: 32, routeIndex: 1 },
        { type: 'splitter', count: 6, interval: 2.0, start: 40 },
        { type: 'moth', count: 10, interval: 1.3, start: 48 },
        { type: 'swift', count: 12, interval: 0.8, start: 58 }
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
    },
    boss_m4: {
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
  lumina_base_desc: '基础增益：邻塔增伤+10%，每10秒产出12孢子。',
  lumina_lv1_name: '荧光金露伞',
  lumina_lv1_desc: '伞盖生金：邻塔增伤+12%，每9秒产出16孢子。',
  lumina_a2_name: 'A线 灵光战地信标',
  lumina_a2_desc: '战地信标：邻塔攻速+20%，每5秒脉冲群疗25点生命。',
  lumina_a3_name: 'A线 翡翠神圣庇护所',
  lumina_a3_desc: '神圣领域：邻塔攻速+30%，每4秒群疗40并净化蛛网酸蚀！',
  lumina_b2_name: 'B线 黄金松露丰收',
  lumina_b2_desc: '丰收之光：每7秒产出24孢子，辅助增伤连协防线。',
  lumina_b3_name: 'B线 聚宝金蟾圣窟',
  lumina_b3_desc: '招财进宝：每6秒产出36孢子，并大幅提升敌军战利品掉率！',

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
  btn_guide: '林地秘典',
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
  place_hint_invalid: '只能在战术灵土坑位建造，或清除障碍开辟新地块！',
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
  map1_desc: '双线晨雾林地与南部暗穴汇流，宜在转角布阵尖刺与爆裂。',
  map2_name: '地图 2：苔藓溪谷',
  map2_subtitle: '湿润溪流 · 12 波',
  map2_desc: '双回环溪谷兼有东南暗道偷袭，空中航线横跨溪面，需提前部署防空火力。',
  map3_name: '地图 3：夜光蕈林',
  map3_subtitle: '荧光暗夜 · 15 波',
  map3_desc: '上下双层夜光峡谷同时来袭，随波次夜光增强，考验五菇协同布阵！',
  map4_name: '地图 4：蚀日古殿',
  map4_subtitle: '日蚀圣墟 · 18 波',
  map4_desc: '南北双圣道于古神祭坛前合流，18波虫皇倾巢而出。唯有阵地协同方能守卫终局！',
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
  watch_lv1_name: 'Lv1 灵目初启',
  watch_lv1_desc: '菌盖生花凝光，伤害+20%，视界射程+0.5格',
  watch_a2_name: 'A线 翡翠劲弩',
  watch_a2_desc: '加长菌茎强弓，射程+1.5格，箭矢极速穿云，射击间隔-10%',
  watch_a3_name: 'A线 逐风鹰眼神射',
  watch_a3_desc: '射程再拓1.0格；附带鹰眼猎印3秒，使其承受全额额外伤害+15%',
  watch_b2_name: 'B线 毒腺浸染',
  watch_b2_desc: '重装菌冠浸润剧毒，单发贯穿伤害+35%',
  watch_b3_name: 'B线 轰雷狙击共鸣',
  watch_b3_desc: '菌盖化身风暴之眼，获得22%致命暴击（造成220%毁灭伤害）',

  tower_mist_name: '雾菇',
  tower_mist_role: '控制 · 持续伤害',
  tower_mist_desc: '在敌人最密集处释放孢子雾团，减速并持续腐蚀地面与空中虫群。',
  mist_base_desc: '生成半径1.5格雾团，减速30%，每秒5点伤害',
  mist_lv1_name: 'Lv1 寒霜微漾',
  mist_lv1_desc: '雾丝加剧浓密，群体减速35%，霜雾驻留延长至3.5秒',
  mist_a2_name: 'A线 极寒霜冻深雾',
  mist_a2_desc: '凛冬冷雾减速45%，敌军离雾后仍遭受寒气凝滞1秒',
  mist_a3_name: 'A线 绝对零度凝滞',
  mist_a3_desc: '极寒冻结达55%，极寒蚀骨使雾中敌军护甲瓦解-4点',
  mist_b2_name: 'B线 熔岩毒孢广域',
  mist_b2_desc: '剧毒雾团半径扩张至2.0格，持续侵蚀伤害8点/秒',
  mist_b3_name: 'B线 炽焰硫磺火雾',
  mist_b3_desc: '雾团半径2.5格，高温燃烧每秒14点伤害',

  tower_thorn_name: '尖刺菇',
  tower_thorn_role: '直线群穿',
  tower_thorn_desc: '高频发射穿透尖刺，沿着长直路径放置可一穿多敌。仅攻击地面。',
  thorn_base_desc: '高速直线尖刺，可穿透2个地面目标',
  thorn_lv1_name: 'Lv1 锐刺初生',
  thorn_lv1_desc: '丛生3支锐利荆刺，穿刺伤害+20%，射程+0.5格',
  thorn_a2_name: 'A线 淬毒连环骨刺',
  thorn_a2_desc: '青蓝长刺，穿透目标数+2（共4个）',
  thorn_a3_name: 'A线 千刃万刺林',
  thorn_a3_desc: '穿透7个目标，每次齐射增发2根12°侧刺（50%伤害）',
  thorn_b2_name: 'B线 巨棘贯甲重刺',
  thorn_b2_desc: '橙黄粗刺根，单发伤害+30%',
  thorn_b3_name: 'B线 倒钩撕裂连环刃',
  thorn_b3_desc: '攻速提升且每穿透1目标+25%后续伤害，附加6点穿甲',

  tower_burst_name: '爆裂菇',
  tower_burst_role: '范围清群',
  tower_burst_desc: '锁定密集地面虫群投射孢子重炮，全额范围溅射无衰减。仅攻击地面。',
  burst_base_desc: '锁定落点爆炸，1.25格内完整溅射伤害',
  burst_lv1_name: 'Lv1 灼热烈核',
  burst_lv1_desc: '菌盖熔岩裂纹透光，重炮冲击伤害+20%',
  burst_a2_name: 'A线 剧毒广域迸射',
  burst_a2_desc: '青蓝裂口扩大，溅射半径+0.5格（1.75格）',
  burst_a3_name: 'A线 毁灭风暴重炮',
  burst_a3_desc: '大口径开裂，溅射半径2.25格，伤害+15%',
  burst_b2_name: 'B线 炽热聚能孢囊',
  burst_b2_desc: '菌盖冒热烟，爆炸伤害+30%',
  burst_b3_name: 'B线 熔岩流火炼狱',
  burst_b3_desc: '爆心留下1.0格熔金灼烧区3.5秒，每秒12点伤害',

  // 敌人名称与特性
  enemy_beetle_name: '腐蚀幼甲虫',
  enemy_type_basic: '基础步兵',
  enemy_beetle_tip: '沿地面匀速前进，所有炮塔均可应对。',
  enemy_swift_name: '疾风飞蛾',
  enemy_type_fast: '极速突袭',
  enemy_swift_tip: '移速极快但生命较低，配合雾菇减速群清。',
  enemy_armored_name: '重装坚盾甲虫',
  enemy_type_armored: '坚甲前锋',
  enemy_armored_tip: '护甲4且减速减半，宜用高单发瞭望菇或爆裂菇B线加上破甲应对。',
  enemy_moth_name: '幻翼魔蛾',
  enemy_type_flying: '掠空飞兽',
  enemy_moth_tip: '沿空中捷径飞行，只有瞭望菇与雾菇能攻击。',
  enemy_splitter_name: '母体裂殖虫',
  enemy_type_splitter: '死亡分化',
  enemy_splitter_tip: '死亡时分裂出2只幼体继续前进，宜用爆裂菇清群。',
  enemy_larva_name: '分裂幼虫',
  enemy_type_larva: '微型裂幼',
  enemy_larva_tip: '裂殖虫分裂产物，体型小移速快。',
  enemy_boss_m1_name: '腐化蛀王',
  enemy_boss_m1_tip: '65%生命召唤2只重甲护卫；33%生命移速+45%且护甲升至18。',
  enemy_boss_m2_name: '剧毒幽蛾后',
  enemy_boss_m2_tip: '空中首领！65%生命召唤飞蛾群；33%生命免疫减速。',
  enemy_boss_m3_name: '万巢裂殖母体',
  enemy_boss_m3_tip: '65%生命召唤5只幼虫；死亡时分裂为3只裂殖母虫！',
  enemy_boss_m4_name: '蚀日圣甲皇',
  enemy_boss_m4_tip: '65%生命召唤重甲近卫；死亡时裂解出3只重装甲虫！',
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
  guide_step3_title: '群杀奖励与坑位策略',
  guide_step3_body: '短时间内连续击退多名敌人可获额外孢子与连击奖赏！植物一旦种植即坚守至死，珍贵苔藓格需精打细算，支持触屏、键鼠与手柄操作！',
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
  lumina_base_desc: 'Base Buff: Neighbors +10% DMG, generates 12 spores every 10s.',
  lumina_lv1_name: 'Gilded Truffle',
  lumina_lv1_desc: 'Gilded Cap: Neighbors +12% DMG, generates 16 spores every 9s.',
  lumina_a2_name: 'Branch A: Aura of Vigor',
  lumina_a2_desc: 'Beacon of Light: Neighbors +20% attack speed, heals 25 HP every 5s.',
  lumina_a3_name: 'Branch A: Holy Ward',
  lumina_a3_desc: 'Sacred Domain: Neighbors +30% attack speed, heals 40 HP & cleanses webs/acid!',
  lumina_b2_name: 'Branch B: Golden Bloom',
  lumina_b2_desc: 'Pure Harvest: Generates 24 spores every 7s.',
  lumina_b3_name: 'Branch B: Cornucopia Titan',
  lumina_b3_desc: 'Grand Wealth: Generates 36 spores every 6s, boosts relic drop rates!',

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
  btn_guide: 'CODEX',
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
  map1_desc: 'Twin-lane mist woods: southern flank burrow converges near the bridge. Mix Thorn & Burst!',
  map2_name: 'Map 2: Mossy Creek Valley',
  map2_subtitle: 'Wet Stream · 12 Waves',
  map2_desc: 'Canyon loops with an eastern ford flank and sky moths across the creek. Deploy Watch Shrooms!',
  map3_name: 'Map 3: Nightglow Fungi',
  map3_subtitle: 'Bioluminescent Night · 15 Waves',
  map3_desc: 'Twin upper & lower night corridors under surging glow. Ultimate synergy test of all 5 guardians!',
  map4_name: 'Map 4: Eclipsed Temple',
  map4_subtitle: 'Sunlit Ruins · 18 Waves',
  map4_desc: 'Dual sacred causeways converge before the ancient altar across 18 relentless waves!',
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
  watch_lv1_name: 'Lv1 Verdant Bloom',
  watch_lv1_desc: 'Blooming cap, DMG +20%, Range +0.5',
  watch_a2_name: 'Branch A: Emerald Crossbow',
  watch_a2_desc: 'Twin lenses, Range +1.5, Bullet Spd +25%, CD -10%',
  watch_a3_name: 'Branch A: Windseeker Hawkeye',
  watch_a3_desc: 'Range +1.0; Marks target for 3s (+15% direct DMG)',
  watch_b2_name: 'Branch B: Venom Infusion',
  watch_b2_desc: 'Armored cap plates, DMG +35%',
  watch_b3_name: 'Branch B: Thunder Resonance Sniper',
  watch_b3_desc: 'Muzzle cap, 15% Crit Chance (2x Crit DMG)',

  tower_mist_name: 'Mist Shroom',
  tower_mist_role: 'Control · DoT',
  tower_mist_desc: 'Casts spore mist at the densest enemy cluster, slowing and corroding ground & air foes.',
  mist_base_desc: '1.5-tile mist for 3s, 30% Slow, 4 DPS',
  mist_lv1_name: 'Lv1 Glacial Whispers',
  mist_lv1_desc: 'Denser mist threads, Slow +5%, Duration +0.5s',
  mist_a2_name: 'Branch A: Permafrost Deep Chill',
  mist_a2_desc: 'Slow +10%, slow lingers 1.0s after leaving mist',
  mist_a3_name: 'Branch A: Absolute Zero',
  mist_a3_desc: '55% Slow, enemies inside mist lose 2 Armor',
  mist_b2_name: 'Branch B: Magma Spore Brood',
  mist_b2_desc: 'Mist radius +0.5 tiles, DoT +2 DPS',
  mist_b3_name: 'Branch B: Brimstone Conflagration',
  mist_b3_desc: '2.5-tile burning mist dealing 10 DPS',

  tower_thorn_name: 'Thorn Shroom',
  tower_thorn_role: 'Line Pierce',
  tower_thorn_desc: 'Rapidly fires straight piercing spikes along corridors. Ground targets only.',
  thorn_base_desc: 'Fast linear spike piercing 2 ground foes',
  thorn_lv1_name: 'Lv1 Razor Thorns',
  thorn_lv1_desc: '3 short thorns, DMG +20%, Range +0.5',
  thorn_a2_name: 'Branch A: Toxic Spine Barrage',
  thorn_a2_desc: 'Cyan tips, Pierce +2 (4 targets total)',
  thorn_a3_name: 'Branch A: Forest of Ten Thousand Needles',
  thorn_a3_desc: 'Pierce 7; fires 2 extra side spikes at ±12° (50% DMG)',
  thorn_b2_name: 'Branch B: Titan Bramble Impaler',
  thorn_b2_desc: 'Heavy orange roots, DMG +30%',
  thorn_b3_name: 'Branch B: Barbed Lacerator',
  thorn_b3_desc: 'CD -10%, +20% DMG per pierced foe (up to +100%)',

  tower_burst_name: 'Burst Shroom',
  tower_burst_role: 'AoE Splash',
  tower_burst_desc: 'Lobs heavy shells at the densest ground cluster for 100% splash damage. Ground only.',
  burst_base_desc: 'Locks landing spot, 1.25-tile full splash DMG',
  burst_lv1_name: 'Lv1 Magma Core',
  burst_lv1_desc: 'Glowing cap cracks, DMG +20%',
  burst_a2_name: 'Branch A: Toxic Shrapnel Mortar',
  burst_a2_desc: 'Cyan vent, Splash Radius +0.5 (1.75 tiles)',
  burst_a3_name: 'Branch A: Cataclysmic Tempest Mortar',
  burst_a3_desc: 'Splash Radius 2.25 tiles, DMG +15%',
  burst_b2_name: 'Branch B: Searing Energy Sac',
  burst_b2_desc: 'Smoking cap, DMG +30%',
  burst_b3_name: 'Branch B: Molten Fire Purgatory',
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
  enemy_boss_m4_name: 'Eclipse Titan',
  enemy_boss_m4_tip: '65% HP: summons Armored guards; splits into 3 Armored bugs on death!',
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
  guide_step3_title: 'Multi-Kill & Tactical Sockets',
  guide_step3_body: 'Kill 3+ foes within 0.5s for Chain/Overload bonuses! Plant placements are permanent until fallen—choose wisely on fixed glowing Moss tiles!',
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
let loadingAudioBuffers = {};

const AUDIO_PATHS = {
  bgm_title: 'audio/bgm_title.wav',
  bgm_battle: 'audio/bgm_battle.wav',
  bgm_night: 'audio/bgm_night.wav',
  boss_map1: 'subpackages/map1/boss.wav',
  boss_map2: 'subpackages/map2/boss.wav',
  boss_map3: 'subpackages/map3/boss.wav',
  boss_map4: 'subpackages/map4/boss.wav',
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
  sfx_wave_horn: 'audio/sfx_horn.wav',
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
  sfx_wave_horn: 0.85,
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
    const rawDpr = info.pixelRatio || (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    dpr = Math.min(rawDpr, isMobile ? 1.5 : 2.0);
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
    mainCtx.imageSmoothingQuality = 'low';
  }
}

/**
 * 将屏幕坐标转换为 960x540 逻辑坐标
 */
function screenToLogical(clientX, clientY) {
  const scale = Math.max(0.01, viewport.scale || 1.0);
  const cx = isFinite(clientX) ? clientX : 0;
  const cy = isFinite(clientY) ? clientY : 0;
  const offX = isFinite(viewport.offsetX) ? viewport.offsetX : 0;
  const offY = isFinite(viewport.offsetY) ? viewport.offsetY : 0;
  const lx = (cx - offX) / scale;
  const ly = (cy - offY) / scale;
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
  mainCtx.imageSmoothingQuality = 'low';
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
const pendingImages = {};

function loadImage(path) {
  if (imageCache[path] && (imageCache[path].complete || imageCache[path].width > 0)) {
    return Promise.resolve(imageCache[path]);
  }
  if (pendingImages[path]) {
    return pendingImages[path];
  }
  const p = new Promise((resolve) => {
    let img = imageCache[path];
    if (!img) {
      if (typeof wx !== 'undefined' && typeof wx.createImage === 'function') {
        img = wx.createImage();
      } else if (typeof Image !== 'undefined') {
        img = new Image();
      }
    }
    if (!img) {
      resolve(null);
      return;
    }
    // 立即登记入缓存，确保当前帧与后续帧同步引用同一 Image 实例，杜绝每帧重复创建 DOM 对象
    imageCache[path] = img;
    img.onload = () => {
      delete pendingImages[path];
      resolve(img);
    };
    img.onerror = () => {
      delete pendingImages[path];
      resolve(null);
    };
    if (!img.src || img.src === '') {
      img.src = path;
    }
    if (img.complete && img.width > 0) {
      delete pendingImages[path];
      resolve(img);
    }
  });
  pendingImages[path] = p;
  return p;
}

function getImage(path) {
  if (!path || typeof path !== 'string') return null;
  const cached = imageCache[path];
  if (cached && (cached.complete || cached.width > 0)) {
    return cached;
  }
  if (!cached && !pendingImages[path]) {
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
 * 存储接口：小游戏环境使用 wx.getStorageSync / wx.setStorageSync，网页/移动端 PWA 自动持久化至 window.localStorage
 */
function getStorage(key) {
  try {
    if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') {
      const val = wx.getStorageSync(key);
      if (val !== undefined && val !== '' && val !== null) {
        return typeof val === 'string' ? JSON.parse(val) : val;
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== undefined && val !== '' && val !== null) {
        return JSON.parse(val);
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
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, jsonStr);
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 首次用户点击后解锁并初始化音频系统（极低开销、平滑渐进式防卡顿）
 */
function preloadSfxBuffers() {
  if (!webAudioCtx) return;
  // 关键防卡死：在 file:/// 协议下，浏览器禁止 fetch() 本地文件，强制使用 HTML5 Audio，绝不发并发 fetch 阻塞主线程
  if (typeof location !== 'undefined' && location.protocol === 'file:') {
    return;
  }
  // 即使在 HTTP 协议下，也仅在后台空闲时逐个预加载，绝不第一击并发暴击卡死界面
  const sfxKeys = Object.keys(AUDIO_PATHS).filter(k => k.indexOf('sfx_') === 0 && !audioBuffers[k]);
  let idx = 0;
  function loadNext() {
    if (idx >= sfxKeys.length) return;
    const key = sfxKeys[idx++];
    const src = AUDIO_PATHS[key];
    if (src && typeof fetch !== 'undefined') {
      fetch(src)
        .then(r => r.ok ? r.arrayBuffer() : null)
        .then(buf => (buf && webAudioCtx) ? webAudioCtx.decodeAudioData(buf) : null)
        .then(decoded => {
          if (decoded) audioBuffers[key] = decoded;
          setTimeout(loadNext, 120);
        })
        .catch(() => {
          setTimeout(loadNext, 120);
        });
    } else {
      setTimeout(loadNext, 120);
    }
  }
  setTimeout(loadNext, 100);
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  try {
    const AudioCtx = g.AudioContext || g.webkitAudioContext;
    if (AudioCtx && !webAudioCtx) {
      webAudioCtx = new AudioCtx();
      if (webAudioCtx.state === 'suspended') {
        webAudioCtx.resume().catch(() => {});
      }
    }
  } catch (e) {}

  // 异步延后调度BGM播放与资源探测，坚决不在首次用户点击的同步帧中阻塞主线程！
  setTimeout(() => {
    try {
      preloadSfxBuffers();
    } catch (e) {}

    if (pendingBgmKey && bgmEnabled) {
      playBgm(pendingBgmKey);
    }
  }, 100);
}

/**
 * 多泛音原声乐器物理合成引擎 2.0 (Kalimba / Rosewood Marimba / Harp / Acoustic Pluck)
 * 彻底告别粗糙方波电子音，提供温润、清脆、有质感的森林原声打击乐体验
 */
function playAcousticNote(freq, startTime, duration, vol, harmonics = [1, 2.756], decayRatio = 0.35) {
  if (!webAudioCtx) return;
  for (let i = 0; i < harmonics.length; i++) {
    const h = harmonics[i];
    const osc = webAudioCtx.createOscillator();
    const gain = webAudioCtx.createGain();
    osc.type = i === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq * h, startTime);
    const hVol = vol * (i === 0 ? 1.0 : Math.pow(decayRatio, i));
    const hDur = i === 0 ? duration : duration * 0.45;
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(hVol, startTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + hDur);
    osc.connect(gain);
    gain.connect(webAudioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + hDur + 0.01);
  }
}

function playSynthesizedSound(sfxKey, volumeMod = 1.0, pitchMod = 1.0) {
  if (!webAudioCtx) return false;
  try {
    if (webAudioCtx.state === 'suspended') {
      webAudioCtx.resume().catch(() => {});
    }
    const t0 = webAudioCtx.currentTime;
    const p = Math.max(0.5, Math.min(3.0, pitchMod || 1.0));

    if (sfxKey === 'sfx_click') {
      // 温润紫檀木琴轻叩 (Rosewood Marimba Tap)
      playAcousticNote(520 * p, t0, 0.045, 0.16 * volumeMod, [1, 2.0, 3.8], 0.25);
      return true;
    } else if (sfxKey === 'sfx_build' || sfxKey === 'sfx_place') {
      // 破土春芽双音马林巴 (Sprouting Dual Marimba)
      playAcousticNote(392.0 * p, t0, 0.09, 0.20 * volumeMod, [1, 2.0, 4.0], 0.3);
      playAcousticNote(587.33 * p, t0 + 0.045, 0.14, 0.22 * volumeMod, [1, 2.756], 0.28);
      return true;
    } else if (sfxKey === 'sfx_upgrade' || sfxKey === 'sfx_win') {
      // 竖琴五声音阶治愈琶音 (Pentatonic Harp Arpeggio: C5 - E5 - G5 - C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      for (let i = 0; i < notes.length; i++) {
        playAcousticNote(notes[i] * p, t0 + i * 0.055, 0.28, 0.18 * volumeMod, [1, 2.0, 2.756], 0.28);
      }
      return true;
    } else if (sfxKey === 'sfx_coin' || sfxKey === 'sfx_sell') {
      // 水晶拇指琴清脆双音 (Crystal Kalimba Chime)
      playAcousticNote(659.25 * p, t0, 0.18, 0.18 * volumeMod, [1, 2.756, 5.404], 0.24);
      playAcousticNote(987.77 * p, t0 + 0.042, 0.24, 0.20 * volumeMod, [1, 2.756], 0.22);
      return true;
    } else if (sfxKey === 'sfx_hurt' || sfxKey === 'sfx_lose') {
      // 低沉木鼓预警 (Low Wood Drum Thud)
      const osc = webAudioCtx.createOscillator();
      const gain = webAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(145 * p, t0);
      osc.frequency.exponentialRampToValueAtTime(48, t0 + 0.14);
      gain.gain.setValueAtTime(0.24 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.15);
      osc.connect(gain);
      gain.connect(webAudioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.16);
      return true;
    } else if (sfxKey === 'sfx_bomb' || sfxKey === 'sfx_boom' || sfxKey === 'sfx_thunder' || sfxKey === 'sfx_shock') {
      // 森林大太鼓浑厚共鸣 (Warm Forest Taiko Resonance)
      const osc = webAudioCtx.createOscillator();
      const gain = webAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(125 * p, t0);
      osc.frequency.exponentialRampToValueAtTime(34, t0 + 0.26);
      gain.gain.setValueAtTime(0.28 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.27);
      osc.connect(gain);
      gain.connect(webAudioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.28);
      playAcousticNote(220 * p, t0, 0.12, 0.12 * volumeMod, [1, 1.5], 0.4);
      return true;
    } else if (sfxKey === 'sfx_shoot_arrow' || sfxKey === 'sfx_shoot') {
      // 轻盈原声弦拨 (Acoustic String Pluck)
      const osc = webAudioCtx.createOscillator();
      const gain = webAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420 * p, t0);
      osc.frequency.exponentialRampToValueAtTime(210 * p, t0 + 0.055);
      gain.gain.setValueAtTime(0.14 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
      osc.connect(gain);
      gain.connect(webAudioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.065);
      return true;
    } else if (sfxKey === 'sfx_thorn' || sfxKey === 'sfx_hit') {
      // 翠竹木琴脆击 (Crisp Bamboo Percussive Hit)
      playAcousticNote(480 * p, t0, 0.065, 0.14 * volumeMod, [1, 2.4], 0.3);
      return true;
    } else if (sfxKey === 'sfx_mist' || sfxKey === 'sfx_laser') {
      // 空灵风铃泛音 (Ethereal Wind Chime)
      playAcousticNote(587.33 * p, t0, 0.16, 0.11 * volumeMod, [1, 2.0, 3.0], 0.25);
      return true;
    } else if (sfxKey === 'sfx_multikill' || sfxKey === 'sfx_wave_horn' || sfxKey === 'sfx_horn') {
      // 森林圆号五度和弦 (Warm Forest Horn Fifth Chord)
      playAcousticNote(293.66 * p, t0, 0.38, 0.18 * volumeMod, [1, 2.0, 3.0], 0.35);
      playAcousticNote(440.00 * p, t0 + 0.06, 0.38, 0.18 * volumeMod, [1, 2.0, 3.0], 0.35);
      playAcousticNote(587.33 * p, t0 + 0.12, 0.42, 0.20 * volumeMod, [1, 2.0, 3.0], 0.35);
      return true;
    } else {
      playAcousticNote(440 * p, t0, 0.07, 0.12 * volumeMod, [1, 2.0], 0.25);
      return true;
    }
  } catch (e) {}
  return false;
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
    } else if (typeof Audio !== 'undefined') {
      const audio = new Audio();
      audio.src = src;
      audio.loop = Boolean(loop);
      audio.volume = volume !== undefined ? volume : 0.6;
      audio.preload = 'none';
      return audio;
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
      const p = bgmContexts[bgmKey].play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
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
    setTimeout(() => {
      try {
        const p = inst.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (e) {}
    }, 16);
  }
}

function stopBgm() {
  if (currentBgmKey && bgmContexts[currentBgmKey]) {
    try {
      const inst = bgmContexts[currentBgmKey];
      if (typeof inst.pause === 'function') {
        inst.pause();
      }
    } catch (e) {}
  }
  currentBgmKey = null;
}

/**
 * 播放音效（优先使用音频文件，同时提供低延迟合成泛音确保零延迟打击感）
 */
const sfxThrottle = {};
function playSfx(sfxKey, volumeMod = 1.0, pitchMod = 1.0, bypassThrottle = false) {
  if (!audioUnlocked || !sfxEnabled) return;
  const now = nowMs();
  if (!bypassThrottle && sfxThrottle[sfxKey] && (now - sfxThrottle[sfxKey] < 45)) {
    return; // 同一音效 45ms 防抖节流，杜绝同帧十几个怪物受创并发调用音频引擎卡死浏览器
  }
  sfxThrottle[sfxKey] = now;

  // 手机端原生微触感振动反馈 (零延迟增强打击感与触控反馈)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      if (sfxKey === 'sfx_click') navigator.vibrate(8);
      else if (sfxKey === 'sfx_build') navigator.vibrate(15);
      else if (sfxKey === 'sfx_upgrade') navigator.vibrate([10, 30, 15]);
      else if (sfxKey === 'sfx_hurt') navigator.vibrate(22);
      else if (sfxKey === 'sfx_boom' || sfxKey === 'sfx_bomb') navigator.vibrate(30);
    } catch (e) {}
  }
  if (typeof wx !== 'undefined' && wx.vibrateShort) {
    try {
      if (sfxKey === 'sfx_click') wx.vibrateShort({ type: 'light' });
      else if (sfxKey === 'sfx_build' || sfxKey === 'sfx_upgrade') wx.vibrateShort({ type: 'medium' });
      else if (sfxKey === 'sfx_hurt' || sfxKey === 'sfx_boom') wx.vibrateShort({ type: 'heavy' });
    } catch (e) {}
  }

  // 1. WebAudio 优先：多发无损并发 + 细腻自然随机音高抖动与五声音阶升调支持
  if (webAudioCtx) {
    const pRate = (pitchMod || 1.0) * (pitchMod && pitchMod !== 1.0 ? 1.0 : (0.96 + Math.random() * 0.08));
    if (audioBuffers[sfxKey]) {
      try {
        const srcNode = webAudioCtx.createBufferSource();
        srcNode.buffer = audioBuffers[sfxKey];
        srcNode.playbackRate.value = Math.max(0.5, Math.min(3.0, pRate));
        const gainNode = webAudioCtx.createGain();
        const baseVol = SFX_VOLUMES[sfxKey] || 0.60;
        gainNode.gain.setValueAtTime(Math.min(1.0, baseVol * volumeMod), webAudioCtx.currentTime);
        srcNode.connect(gainNode);
        gainNode.connect(webAudioCtx.destination);
        srcNode.start(0);
        return;
      } catch (e) {}
    } else {
      // 触发延迟预热加载 (带去重防抖，杜绝并发暴击卡顿)
      const src = AUDIO_PATHS[sfxKey];
      const isFileScheme = typeof location !== 'undefined' && location.protocol === 'file:';
      if (!isFileScheme && src && typeof fetch !== 'undefined' && !loadingAudioBuffers[sfxKey]) {
        loadingAudioBuffers[sfxKey] = true;
        fetch(src)
          .then((r) => r.ok ? r.arrayBuffer() : null)
          .then((buf) => (buf && webAudioCtx) ? webAudioCtx.decodeAudioData(buf) : null)
          .then((decoded) => {
            if (decoded) audioBuffers[sfxKey] = decoded;
            loadingAudioBuffers[sfxKey] = false;
          })
          .catch(() => {
            loadingAudioBuffers[sfxKey] = false;
          });
      }
      if (playSynthesizedSound(sfxKey, volumeMod, pRate)) {
        return;
      }
    }
  }

  // 2. HTML5 / 微信 InnerAudioContext 轮播兜底 (仅在无 WebAudio 且非 file 协议时激活)
  const isFile = typeof location !== 'undefined' && location.protocol === 'file:';
  const src = AUDIO_PATHS[sfxKey];
  if (src && !isFile) {
    if (!sfxVoicePool[sfxKey]) {
      sfxVoicePool[sfxKey] = [];
      sfxVoiceIndices[sfxKey] = 0;
      for (let i = 0; i < 4; i++) {
        sfxVoicePool[sfxKey].push(createAudioInstance(src, false, (SFX_VOLUMES[sfxKey] || 0.6) * volumeMod));
      }
    }
    const voices = sfxVoicePool[sfxKey];
    if (voices && voices.length > 0) {
      const idx = sfxVoiceIndices[sfxKey] % voices.length;
      sfxVoiceIndices[sfxKey] = (idx + 1) % voices.length;
      const inst = voices[idx];
      if (inst) {
        try {
          if (typeof inst.stop === 'function') inst.stop();
          if (typeof inst.seek === 'function') inst.seek(0);
          if ('currentTime' in inst) inst.currentTime = 0;
          const p = inst.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (e) {}
      }
    }
  }
}

// 大调五声音阶升调比率 (宫 Do -> 商 Re -> 角 Mi -> 徵 Sol -> 羽 La -> 高音宫 Do' -> 高音商 Re' -> 高音角 Mi')
const PENTATONIC_RATIOS = [1.0, 1.12246, 1.25992, 1.49831, 1.68179, 2.0, 2.24492, 2.51984];

function playMusicalScale(noteIdx = 0) {
  if (!audioUnlocked || !sfxEnabled) return;
  const idx = Math.max(0, Math.min(PENTATONIC_RATIOS.length - 1, Math.floor(noteIdx || 0)));
  const ratio = PENTATONIC_RATIOS[idx];
  playSfx('sfx_coin', 0.92, ratio, true);
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
      map3: { unlocked: false, stars: 0, bestTime: null, bestSeeds: 0 },
      map4: { unlocked: false, stars: 0, bestTime: null, bestSeeds: 0 }
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
      map3: Object.assign({}, def.maps.map3, raw.maps && raw.maps.map3 ? raw.maps.map3 : {}),
      map4: Object.assign({}, def.maps.map4, raw.maps && raw.maps.map4 ? raw.maps.map4 : {})
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
  if (migrated.maps.map3.stars >= 1) {
    migrated.maps.map4.unlocked = true;
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
  } else if (mapId === 'map3' && stars >= 1) {
    save.maps.map4.unlocked = true;
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
  save.maps.map4.unlocked = true;
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
 * 丛林战术成就殿堂，包含 20 大战术勋章与即时弹窗
 */

const storage = require('../save/storage');
const platform = require('../core/platform');

const ACHIEVEMENTS_DATA = [
  { id: 'first_blood', title: '丛林初捷', desc: '击杀首只入侵害虫打响反击', icon: '⚔️', rewardStars: 1 },
  { id: 'flawless_defense', title: '滴水不漏', desc: '满 20 颗种子完美通关任一地图', icon: '👑', rewardStars: 2 },
  { id: 'hero_awakened', title: '守护神觉醒', desc: '大橡树升至 5 级并释放奥义', icon: '🌟', rewardStars: 1 },
  { id: 'subterranean_slayer', title: '侧翼肃清', desc: '击破侧翼小径或潜地突袭害虫', icon: '🐛', rewardStars: 1 },
  { id: 'spore_tycoon', title: '孢子大亨', desc: '单局保有超过 2500 黄金孢子', icon: '🪙', rewardStars: 2 },
  { id: 'multikill_overload', title: '破军狂澜', desc: '瞬间达成 10 连杀连锁清场', icon: '🔥', rewardStars: 1 },
  { id: 'iron_wall', title: '永固棱堡', desc: '场上同时拥有 4 座终极三阶塔', icon: '💎', rewardStars: 2 },
  { id: 'weather_survivor', title: '血月征服者', desc: '在血月天象下坚守并赢下关卡', icon: '🌙', rewardStars: 1 },
  { id: 'spider_regicide', title: '初战告捷', desc: '击破第 10 波首领光复晨雾林地', icon: '🏆', rewardStars: 3 },
  { id: 'endless_champion', title: '深渊开拓者', desc: '无尽深渊模式坚持突破第 15 波', icon: '✨', rewardStars: 3 },
  { id: 'pitcher_gluttony', title: '奇幻猪笼草', desc: '激发食人猪笼草成功消化 3 次', icon: '🍃', rewardStars: 1 },
  { id: 'thunder_conduit', title: '灵脉雷音', desc: '古木天雷单次连锁电击 6 敌', icon: '⚡', rewardStars: 1 },
  { id: 'tactical_stances', title: '兵无常势', desc: '单场战斗中切换大橡树 3 种姿态', icon: '🛡️', rewardStars: 1 },
  { id: 'holy_cornucopia', title: '丰收晨露', desc: '灵光菇单局生产 800 以上孢子', icon: '🍄', rewardStars: 1 },
  { id: 'permafrost_hold', title: '深度冻结', desc: '雾菇同时冻结减速 8 名以上敌人', icon: '❄️', rewardStars: 1 },
  { id: 'laceration_field', title: '荆棘绝阵', desc: '尖刺菇单场累计造成 3000 伤害', icon: '🌿', rewardStars: 1 },
  { id: 'artillery_barrage', title: '熔岩落日', desc: '爆裂菇单发炮弹炸毁 5 只聚集敌', icon: '💣', rewardStars: 1 },
  { id: 'audacious_commander', title: '兵贵神速', desc: '累计 5 次吹响号角提前迎战', icon: '📯', rewardStars: 1 },
  { id: 'last_stand', title: '绝境逆转', desc: '仅剩 1 颗生命种子逆转赢下对局', icon: '❤️', rewardStars: 2 },
  { id: 'codex_grandmaster', title: '博学大典', desc: '翻阅林地秘典全守卫与害虫图鉴', icon: '📜', rewardStars: 1 }
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
    const th = 42;
    const tx = (960 - tw) * 0.5;
    
    // 顶部紧凑滑出动画（位于 Boss 血条上方安全带 y=10..52，零重叠）
    let ty = 10;
    if (this.toastTimer > 3.2) {
      const prog = (3.6 - this.toastTimer) / 0.4;
      ty = -46 + prog * 56;
    } else if (this.toastTimer < 0.4) {
      const prog = this.toastTimer / 0.4;
      ty = -46 + prog * 56;
    }

    // 古典林地木纹框
    ctx.fillStyle = 'rgba(28, 18, 10, 0.94)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(tx, ty, tw, th, 10) : ctx.rect(tx, ty, tw, th);
    ctx.fill();

    ctx.strokeStyle = '#FFE58F';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 左侧徽章大图标
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, tx + 26, ty + 21);

    // 标题：成就解锁
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`成就达成 · ${item.title}`, tx + 52, ty + 14);

    // 描述详情
    ctx.fillStyle = '#E8DEC8';
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillText(item.desc, tx + 52, ty + 30);

    // 右侧奖励星级
    ctx.fillStyle = '#FFE58F';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`+${item.rewardStars}⭐`, tx + tw - 14, ty + 21);

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
    item.__poolIndex = this.activeList.length;
    this.activeList.push(item);
    return item;
  }

  /**
   * 释放指定对象回池 (O(1) 尾部互换快速出池，彻底消除 O(N) Array.splice 性能瓶颈)
   */
  release(item) {
    if (!item || !item.__active) return;
    item.__active = false;
    const idx = item.__poolIndex;
    if (idx !== undefined && idx >= 0 && idx < this.activeList.length && this.activeList[idx] === item) {
      const last = this.activeList.pop();
      if (last !== item) {
        this.activeList[idx] = last;
        last.__poolIndex = idx;
      }
    } else {
      const fallbackIdx = this.activeList.indexOf(item);
      if (fallbackIdx !== -1) {
        const last = this.activeList.pop();
        if (last !== item) {
          this.activeList[fallbackIdx] = last;
          last.__poolIndex = fallbackIdx;
        }
      }
    }
    item.__poolIndex = -1;
    this.freeList.push(item);
  }

  /**
   * 根据索引快速释放 (O(1) 尾部互换)
   */
  releaseAt(index) {
    if (index < 0 || index >= this.activeList.length) return;
    const item = this.activeList[index];
    item.__active = false;
    const last = this.activeList.pop();
    if (last !== item) {
      this.activeList[index] = last;
      last.__poolIndex = index;
    }
    item.__poolIndex = -1;
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
  if (!img || !img.width || !img.height) return false;
  if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return false;
  try {
    ctx.imageSmoothingEnabled = true;
    if (typeof ctx.imageSmoothingQuality !== 'undefined') {
      ctx.imageSmoothingQuality = 'high';
    }
    const k = (img.width && img.width >= 1024) ? HD_ATLAS_SCALE : 1;
    ctx.drawImage(img, sx * k, sy * k, sw * k, sh * k, Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
    platform.recordDrawCall(1);
    return true;
  } catch (e) {
    return false;
  }
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
  if (typeof type === 'object' && type !== null) {
    payload = type;
    type = payload.type || 'unknown';
  }
  if (type === 'pointer_down' || type === 'confirm_tile') {
    platform.unlockAudio();
  }
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
        const touch = (res && res.changedTouches && res.changedTouches[0]) || (res && res.touches && res.touches[0]);
        if (!touch) return;
        const pos = platform.screenToLogical(touch.clientX, touch.clientY);
        pointerPos.x = pos.x;
        pointerPos.y = pos.y;
        updateCursorFromPointer(pos.x, pos.y);
        emitAction('pointer_down', { x: pos.x, y: pos.y });
      });
    }

    let lastMoveEmitted = 0;
    if (typeof wx.onTouchMove === 'function') {
      wx.onTouchMove((res) => {
        const touch = (res && res.changedTouches && res.changedTouches[0]) || (res && res.touches && res.touches[0]);
        if (!touch) return;
        const pos = platform.screenToLogical(touch.clientX, touch.clientY);
        pointerPos.x = pos.x;
        pointerPos.y = pos.y;
        updateCursorFromPointer(pos.x, pos.y);
        const now = platform.nowMs ? platform.nowMs() : Date.now();
        if (now - lastMoveEmitted >= 16) {
          lastMoveEmitted = now;
          emitAction('pointer_move', { x: pos.x, y: pos.y });
        }
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

  if (key === 'arrowup') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row - 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'arrowdown') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row + 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'arrowleft') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col - 1, gridCursor.row);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'arrowright') {
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
  } else if (key === 'space' || key === ' ') {
    if (gridCursor.active) {
      emitAction('confirm_tile', { col: gridCursor.col, row: gridCursor.row });
    } else {
      emitAction('toggle_awakening');
    }
  } else if (key === 'keyg' || key === 'g') {
    emitAction('hero_battlecry');
  } else if (key === 'keyb' || key === 'b') {
    emitAction('hero_leyline');
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
    emitAction('trigger_spell', { spellId: 'rally' });
  } else if (key === 'keyv' || key === 'v') {
    emitAction('cycle_speed');
  } else if (key === 'keyf' || key === 'f') {
    emitAction('hero_ultimate');
  } else if (key === 'keyz' || key === 'z') {
    emitAction('cycle_hero_stance');
  } else if (key === 'keym' || key === 'm') {
    emitAction('toggle_mastery');
  } else if (key === 'keyh' || key === 'h') {
    emitAction('toggle_zen_mode');
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
    this.touchRipples = [];
    this.homingMotes = [];

    this.resetBattleState();
  }

  resetBattleState() {
    this.particlePool.clear();
    this.textPool.clear();
    this.rings.length = 0;
    this.touchRipples.length = 0;
    this.homingMotes.length = 0;

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
  spawnDamageText(x, y, text, color = '#FF4D4F') {
    const numVal = Number(text);
    // 屏蔽低于 15 的高频微小灼烧/毒伤持续跳字，避免伤害数字垂直堆叠遮挡怪物本体
    if (!Number.isNaN(numVal) && Math.abs(numVal) < 15) {
      return;
    }
    return this.spawnFloatingText(x, y, text, color, 1.0);
  }

  spawnFloatingText(x, y, text, color = PALETTE.UI_TEXT, scale = 1.0) {
    const str = String(text);
    const active = this.textPool.getActiveList();
    const isShortNumber = /^[+\-💥]?\d+/.test(str);
    // 密集波次降噪：同屏飘字过多时仅保留关键反应与高额伤害，彻底杜绝文字墙
    if (active.length >= 20 && isShortNumber && !str.startsWith('💥') && !str.startsWith('+')) {
      return;
    }
    const staggerSide = (active.length % 2 === 0) ? 1 : -1;
    let baseX = x + staggerSide * 10 + (Math.random() - 0.5) * 4;
    let baseY = y - 10;

    // 防止同名提示文字与相邻伤害数字重叠（近邻自动纵向阶梯错位）
    let yShift = 0;
    for (let i = active.length - 1; i >= 0; i--) {
      const ex = active[i];
      const dx = Math.abs(ex.x - baseX);
      const dy = Math.abs(ex.y - (baseY - yShift));
      if (!isShortNumber && dx <= 68 && dy <= 44 && ex.life < 0.56) {
        if (ex.text === str || str.length <= 6) {
          return;
        }
      }
      if (dx <= 52 && dy <= 20) {
        yShift += 18;
        if (yShift >= 54) break;
      }
    }

    const item = this.textPool.acquire(true);
    if (!item) return;
    item.x = baseX;
    item.y = baseY - yShift;
    item.vy = -34;
    item.text = str;
    item.color = color;
    item.life = 0;
    item.maxLife = isShortNumber ? 0.56 : 0.72;
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
   * 仙露水波触控涟漪：零延迟实体触控反馈
   * 每次手指点击战场，瞬间扩散出一圈青绿/翠玉色水波
   */
  spawnTouchRipple(x, y, color = 'rgba(168, 255, 140, 0.8)') {
    if (this.touchRipples.length >= 16) {
      this.touchRipples.shift();
    }
    this.touchRipples.push({
      x,
      y,
      radius: 4,
      maxRadius: 28,
      life: 0,
      maxLife: 0.32,
      color
    });
  }

  /**
   * 战利品飞向金库流光光丝（Spore Homing Motes）
   * 拾取孢子或古代遗物时，生成向上弹跳并沿贝塞尔弧线飞入左下角金库的流光
   */
  spawnHomingMotes(startX, startY, count = 3, color = '#FFD700') {
    const targetX = 68;
    const targetY = 512;
    for (let i = 0; i < count; i++) {
      if (this.homingMotes.length >= 32) {
        this.homingMotes.shift();
      }
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const burstDist = 18 + Math.random() * 16;
      const arcMidX = (startX + targetX) * 0.5 + (Math.random() - 0.5) * 50;
      const arcMidY = Math.min(startY, targetY) - (40 + Math.random() * 45);

      this.homingMotes.push({
        startX: startX + Math.cos(angle) * (burstDist * 0.3),
        startY: startY + Math.sin(angle) * (burstDist * 0.3),
        cpX: arcMidX,
        cpY: arcMidY,
        targetX,
        targetY,
        timer: 0,
        duration: 0.45 + i * 0.06,
        color
      });
    }
  }

  /**
   * 显示横幅（如“连锁！/Chain!”、“超载！/Overload!”、首领登场等）
   */
  spawnWaveClearCelebration(x = 480, y = 160, rewardSpores = 0) {
    this.triggerShake(1.5, 0.15);
    this.spawnParticles(x, y, 28, ['#FFE58F', '#FFD700', '#52C41A', '#BAE7FF', '#FAAD14'], 65, 180, 0.45, 0.95, 4);
    const motes = Math.min(6, Math.max(3, Math.round((rewardSpores || 20) / 8)));
    this.spawnHomingMotes(x, y, motes, '#FFD700');
  }

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
    // 更新触控仙露涟漪
    for (let i = this.touchRipples.length - 1; i >= 0; i--) {
      const rip = this.touchRipples[i];
      rip.life += realDt;
      if (rip.life >= rip.maxLife) {
        this.touchRipples.splice(i, 1);
      }
    }

    // 更新飞向金库的战利品光丝
    for (let i = this.homingMotes.length - 1; i >= 0; i--) {
      const m = this.homingMotes[i];
      m.timer += realDt;
      if (m.timer >= m.duration) {
        if (this.scene && this.scene.ui) {
          this.scene.ui.sporePopTimer = 0.24;
        }
        this.homingMotes.splice(i, 1);
      }
    }

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

    // 3. 绘制浮动伤害与奖励数字（高对比黑描边 + 字号分级，清晰不糊成一团）
    const tList = this.textPool.getActiveList();
    if (tList.length > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = 'rgba(10, 14, 10, 0.90)';
      for (let i = 0; i < tList.length; i++) {
        const t = tList[i];
        const alpha = t.life > t.maxLife * 0.7 ? (1 - (t.life - t.maxLife * 0.7) / (t.maxLife * 0.3)) : 1.0;
        ctx.globalAlpha = Math.max(0, alpha);
        const fSize = Math.max(10, Math.min(15, Math.round(11 * (t.scale || 1))));
        ctx.font = `bold ${fSize}px "Microsoft YaHei", sans-serif`;
        const rx = Math.round(t.x);
        const ry = Math.round(t.y);
        ctx.strokeText(t.text, rx, ry);
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
    // 1. 仙露水波触控涟漪 (Organic Emerald Touch Ripples)
    if (this.touchRipples && this.touchRipples.length > 0) {
      for (let i = 0; i < this.touchRipples.length; i++) {
        const rip = this.touchRipples[i];
        const prog = rip.life / rip.maxLife;
        const curR = rip.radius + (rip.maxRadius - rip.radius) * prog;
        const alpha = (1 - prog) * 0.65;
        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, curR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168, 255, 140, ${alpha})`;
        ctx.lineWidth = Math.max(1, 2.2 * (1 - prog));
        ctx.stroke();
        // 柔和内光圈
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, Math.max(1, curR * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 140, ${alpha * 0.4})`;
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. 飞向底部金库的战利品与金孢流光轨迹 (Spore Homing Motes)
    if (this.homingMotes && this.homingMotes.length > 0) {
      const moteImg = platform.getImage('assets/vfx/item_golden_spore.png');
      for (let i = 0; i < this.homingMotes.length; i++) {
        const m = this.homingMotes[i];
        const prog = Math.min(1.0, m.timer / m.duration);
        const inv = 1 - prog;
        const curX = inv * inv * m.startX + 2 * inv * prog * m.cpX + prog * prog * m.targetX;
        const curY = inv * inv * m.startY + 2 * inv * prog * m.cpY + prog * prog * m.targetY;

        ctx.save();
        const radGrad = ctx.createRadialGradient(curX, curY, 1, curX, curY, 9);
        radGrad.addColorStop(0, 'rgba(255, 245, 190, 0.85)');
        radGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.35)');
        radGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(curX, curY, 9, 0, Math.PI * 2);
        ctx.fill();
        if (moteImg && moteImg.width) {
          ctx.drawImage(moteImg, curX - 6, curY - 6, 12, 12);
        }
        ctx.restore();
      }
    }

    // 种子受损红边
    if (this.redEdgeTimerSec > 0) {
      const alpha = Math.min(0.55, (this.redEdgeTimerSec / 0.35) * 0.55);
      ctx.save();
      ctx.strokeStyle = PALETTE.UI_SEED;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, (CONFIG.RESOLUTION.LOGICAL_WIDTH || 960) - 12, (CONFIG.RESOLUTION.LOGICAL_HEIGHT || 540) - 12);
      ctx.restore();
      platform.recordDrawCall(1);
    }

    // 顶部横幅（连锁！/超载！/波次提示）：文字 100% 居于丝带中央打印带 [y+0.35h .. y+0.67h] 内（动态避让首领血条）
    if (this.banner.active) {
      const b = this.banner;
      const bw = 460;
      const bh = b.subText ? 52 : 36;
      const bx = (960 - bw) * 0.5;
      const hasBossHud = Boolean(this.scene && this.scene.bossOverdriveEngine && this.scene.bossOverdriveEngine.activeBoss && this.scene.bossOverdriveEngine.activeBoss.hp > 0);
      const by = hasBossHud ? 116 : 64;
      const bandCenterY = by + (b.subText ? 26 : 18);
      const isAlertBanner = (b.color === PALETTE.CRIMSON_SELL || b.color === '#FF4D4F' || b.color === PALETTE.ENEMY_EYE);
      const ribImg = platform.getImage(isAlertBanner ? 'assets/ui/frames/banner_ribbon_crimson.png' : 'assets/ui/frames/banner_ribbon_gold.png');

      ctx.save();
      if (ribImg && ribImg.width) {
        const rw = 600;
        const rh = b.subText ? 116 : 96;
        const rxImg = Math.round((960 - rw) * 0.5);
        const ryImg = Math.round(bandCenterY - rh * 0.51);
        ctx.drawImage(ribImg, rxImg, ryImg, rw, rh);
        ctx.fillStyle = isAlertBanner ? '#FFF5E8' : '#2C1406';
        ctx.font = 'bold 14.5px "Microsoft YaHei UI", "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, 480, b.subText ? (bandCenterY - 7) : bandCenterY, 300);
        if (b.subText) {
          ctx.fillStyle = isAlertBanner ? '#FFD591' : '#542A0E';
          ctx.font = 'bold 11px "Microsoft YaHei UI", "PingFang SC", sans-serif';
          ctx.fillText(b.subText, 480, bandCenterY + 9, 300);
        }
      } else {
        ctx.fillStyle = 'rgba(28, 18, 10, 0.92)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 10) : ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2.0;
        ctx.stroke();

        ctx.fillStyle = b.color;
        ctx.font = 'bold 15px "Microsoft YaHei UI", "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, bx + bw * 0.5, by + (b.subText ? 18 : bh * 0.5));

        if (b.subText) {
          ctx.fillStyle = PALETTE.UI_TEXT || '#F0F0F0';
          ctx.font = '12px "Microsoft YaHei UI", "PingFang SC", sans-serif';
          ctx.fillText(b.subText, bx + bw * 0.5, by + 36);
        }
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
 * 林地自然天候与动态战场生态系统
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

    // 初始化萤火虫微光粒子池 (幽夜微光专属)
    this.fireflies = [];
    for (let i = 0; i < 14; i++) {
      this.fireflies.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 14,
        baseAlpha: 0.35 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        speed: 1.8 + Math.random() * 1.5,
        size: 2.2 + Math.random() * 2.0,
        color: Math.random() < 0.65 ? '#BAE7FF' : '#FFE58F'
      });
    }
  }

  initForMap(mapId) {
    if (mapId === 'map1' || mapId === 'map4') {
      this.currentWeather = 'sunny';
    } else if (mapId === 'map2') {
      this.currentWeather = 'mist';
    } else {
      this.currentWeather = 'night';
    }
    this.weatherTimer = 0;
    this.lightningTimer = 4.0;
    this.weatherNoticeTimer = 0;
  }

  setWeather(type, fx = null, scene = null) {
    if (this.currentWeather === type) return;
    const prev = this.currentWeather;
    this.currentWeather = type;
    this.weatherTimer = 0;
    this.weatherNoticeTimer = 3.5;

    const names = {
      sunny: '☀️ 晨曦初晴 · 丰收晨露',
      night: '🌙 幽夜微光 · 月华静谧',
      rain: '🌧️ 林地雷暴 · 雷霆轰顶',
      mist: '🌫️ 幽林浓雾 · 迷雾隐踪',
      blood_moon: '🩸 狂暴血月 · 极夜狂澜'
    };
    const subs = {
      sunny: '全场孢子产出 +25%，神圣大橡树自愈速度 +50%',
      night: '幽静月华微照，真菌生物荧光共鸣，全防线攻速与充能 +15%！',
      rain: '雷霆每隔 6 秒自动天罚轰顶重型虫首，水洼导电连锁',
      mist: '瞭望菇射程 +15%，轻甲虫潮获得 15% 飘忽闪避',
      blood_moon: '虫潮移速狂增 +20%，击败敌军掉落双倍黄金孢子！'
    };

    this.weatherNoticeText = names[type] || '';
    if (fx && typeof fx.showBanner === 'function') {
      const bannerColor = type === 'blood_moon' ? '#FF4D4F' : (type === 'night' ? '#69C0FF' : (type === 'rain' ? '#40A9FF' : '#52C41A'));
      fx.showBanner(names[type], bannerColor, subs[type], 1.8);
      platform.playSfx(type === 'rain' ? 'sfx_thunder' : (type === 'blood_moon' ? 'sfx_horn' : 'sfx_upgrade'));
    }

    if (scene && scene.state === 'BATTLE') {
      if (type === 'night') {
        platform.playBgm('bgm_night');
      } else if (prev === 'night') {
        platform.playBgm('bgm_battle');
      }
    }
  }

  cycleWeather(scene = null) {
    const cycle = ['sunny', 'night', 'mist', 'rain', 'blood_moon'];
    const nextIdx = (cycle.indexOf(this.currentWeather) + 1) % cycle.length;
    const next = cycle[nextIdx];
    this.setWeather(next, scene ? scene.fx : null, scene);
    return next;
  }

  update(dt, enemyManager = null, towerManager = null, hero = null, fx = null) {
    if (enemyManager && enemyManager.enemyManager) {
      const scene = enemyManager;
      enemyManager = scene.enemyManager;
      towerManager = scene.towerManager;
      hero = scene.hero;
      fx = scene.fx;
    }
    this.weatherTimer += dt;
    if (this.weatherNoticeTimer > 0) {
      this.weatherNoticeTimer -= dt;
    }

    // 每到一定波次或时间自动循环天候
    if (this.weatherTimer >= this.weatherDuration) {
      this.weatherTimer = 0;
      const cycle = ['sunny', 'night', 'mist', 'rain', 'blood_moon'];
      const nextIdx = (cycle.indexOf(this.currentWeather) + 1) % cycle.length;
      this.setWeather(cycle[nextIdx], fx, enemyManager ? enemyManager.scene : null);
    }

    // 幽夜与迷雾环境：发光萤火虫飘逸舞动
    if (this.currentWeather === 'night' || this.currentWeather === 'mist') {
      for (let i = 0; i < this.fireflies.length; i++) {
        const ff = this.fireflies[i];
        ff.phase += dt * ff.speed;
        ff.x += ff.vx * dt + Math.sin(ff.phase) * 0.5;
        ff.y += ff.vy * dt + Math.cos(ff.phase * 0.7) * 0.4;
        if (ff.x < 0) ff.x = 960;
        if (ff.x > 960) ff.x = 0;
        if (ff.y < 0) ff.y = 540;
        if (ff.y > 540) ff.y = 0;
      }
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

    // 幽夜微光环境天候与夜景系统 (Night Atmosphere)
    if (this.currentWeather === 'night') {
      // 1. 幽静冷月夜幕滤镜 (柔和蓝灰冷调，保留战场高辨识度与通透感)
      ctx.fillStyle = 'rgba(8, 22, 44, 0.28)';
      ctx.fillRect(0, 0, 960, 540);

      // 2. 宁静暗角 (Vignette)
      if (!this._cachedNightVig) {
        this._cachedNightVig = ctx.createRadialGradient(480, 270, 260, 480, 270, 540);
        this._cachedNightVig.addColorStop(0, 'rgba(6, 16, 32, 0)');
        this._cachedNightVig.addColorStop(1, 'rgba(4, 12, 28, 0.42)');
      }
      ctx.fillStyle = this._cachedNightVig;
      ctx.fillRect(0, 0, 960, 540);

      // 3. 柔和丁达尔月华倾泻 (Moonlight Beams)
      ctx.save();
      ctx.fillStyle = 'rgba(186, 231, 255, 0.04)';
      ctx.beginPath();
      ctx.moveTo(120, 0);
      ctx.lineTo(340, 0);
      ctx.lineTo(620, 540);
      ctx.lineTo(380, 540);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(480, 0);
      ctx.lineTo(680, 0);
      ctx.lineTo(920, 540);
      ctx.lineTo(720, 540);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 4. 发光萤火虫群 (Dancing Fireflies)
      for (let i = 0; i < this.fireflies.length; i++) {
        const ff = this.fireflies[i];
        const glowAlpha = Math.max(0.05, ff.baseAlpha * (0.6 + Math.sin(ff.phase) * 0.4));
        ctx.save();
        ctx.fillStyle = ff.color;
        ctx.globalAlpha = glowAlpha * 0.35;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.size * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = glowAlpha;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. 浓雾飘浮渲染
    if (this.currentWeather === 'mist') {
      ctx.fillStyle = 'rgba(210, 230, 240, 0.08)';
      ctx.fillRect(0, 0, 960, 540);

      // 高性能柔和环境浓雾（杜绝每帧生成 RadialGradient 对象造成 GC 巨幅卡顿）
      for (let i = 0; i < this.fogWisps.length; i++) {
        const f = this.fogWisps[i];
        ctx.fillStyle = `rgba(220, 238, 245, ${f.alpha * 0.45})`;
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

      // 四周暗夜血光暗角 (单例静态缓存渐变)
      if (!this._cachedVig) {
        this._cachedVig = ctx.createRadialGradient(480, 270, 240, 480, 270, 520);
        this._cachedVig.addColorStop(0, 'rgba(120, 10, 10, 0)');
        this._cachedVig.addColorStop(1, 'rgba(120, 10, 10, 0.45)');
      }
      ctx.fillStyle = this._cachedVig;
      ctx.fillRect(0, 0, 960, 540);
    }

    ctx.restore();
  }

  renderWeatherHudBadge(ctx, x, y) {
    ctx.save();
    const badges = {
      sunny: { icon: '☀️', text: '初晴+25%', color: '#52C41A', border: 'rgba(115, 209, 61, 0.7)' },
      night: { icon: '🌙', text: '幽夜+15%', color: '#69C0FF', border: 'rgba(105, 192, 255, 0.75)' },
      rain: { icon: '🌧️', text: '暴雨轰顶', color: '#1890FF', border: 'rgba(105, 192, 255, 0.7)' },
      mist: { icon: '🌫️', text: '浓雾+15%', color: '#13C2C2', border: 'rgba(92, 219, 211, 0.7)' },
      blood_moon: { icon: '🩸', text: '血月双倍', color: '#FF4D4F', border: 'rgba(255, 120, 117, 0.8)' }
    };

    const b = badges[this.currentWeather] || badges.sunny;
    const bw = 96;
    const bh = 24;

    ctx.fillStyle = 'rgba(28, 20, 12, 0.92)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, bw, bh, 12) : ctx.rect(x, y, bw, bh);
    ctx.fill();

    ctx.strokeStyle = b.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 229, 143, 0.28)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + 2, y + 2, bw - 4, bh - 4, 10) : ctx.rect(x + 2, y + 2, bw - 4, bh - 4);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${b.icon} ${b.text}`, x + bw * 0.5, y + bh * 0.5);

    ctx.restore();
  }

  renderWeatherOverlay(ctx) {
    return this.renderWeatherEffects(ctx);
  }

  renderTopWeatherBadge(ctx, x, y) {
    return this.renderWeatherHudBadge(ctx, x, y);
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

    // 2. 标记与初始化可清除地图障碍物 (Carrot Fantasy 经典机制)
    this.obstacles = [];
    const obsList = this.mapData.obstacles || [];
    const obsNames = ['枯萎巨桩', '古遗石堆', '幽森魔晶', '荆棘腐木'];
    for (let i = 0; i < obsList.length; i++) {
      const [oc, or] = obsList[i];
      if (this.inBounds(oc, or)) {
        const variant = (i + (this.mapData.index || 1)) % 4;
        const maxHp = 320 + variant * 70;
        const obs = {
          col: oc,
          row: or,
          x: (oc + 0.5) * TILE_SIZE,
          y: (or + 0.5) * TILE_SIZE,
          hp: maxHp,
          maxHp: maxHp,
          variant,
          name: obsNames[variant % obsNames.length],
          isTargeted: false,
          hitWobble: 0,
          cleared: false,
          isObstacle: true
        };
        this.grid[or][oc].type = 'obstacle';
        this.grid[or][oc].variant = variant;
        this.grid[or][oc].obstacle = obs;
        this.obstacles.push(obs);
      }
    }

    // 3. 按连续曲线线段距离精确标记地面主路与侧翼小径覆盖的所有网格，适配平滑自然弯曲道路
    const routesForGrid = [this.groundRoute];
    if (this.groundRoute2) {
      routesForGrid.push(this.groundRoute2);
    }
    const pathHitRadius = TILE_SIZE * 0.56;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        if (!cell || cell.type !== 'grass') continue;
        const cx = (c + 0.5) * TILE_SIZE;
        const cy = (r + 0.5) * TILE_SIZE;
        let onPath = false;
        for (let rIdx = 0; rIdx < routesForGrid.length && !onPath; rIdx++) {
          const segs = routesForGrid[rIdx].segments;
          for (let i = 0; i < segs.length; i++) {
            const s = segs[i];
            const vx = s.x1 - s.x0;
            const vy = s.y1 - s.y0;
            const len2 = vx * vx + vy * vy;
            const t = len2 > 0 ? Math.max(0, Math.min(1, ((cx - s.x0) * vx + (cy - s.y0) * vy) / len2)) : 0;
            const px = s.x0 + vx * t;
            const py = s.y0 + vy * t;
            if (Math.hypot(cx - px, cy - py) <= pathHitRadius) {
              onPath = true;
              cell.pathKind = Math.abs(vx) >= Math.abs(vy) ? 'h' : 'v';
              break;
            }
          }
        }
        if (onPath) {
          cell.type = 'path';
        }
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

  getObstacleAt(col, row) {
    if (!this.inBounds(col, row)) return null;
    const tile = this.grid[row][col];
    return tile && tile.obstacle && !tile.obstacle.cleared ? tile.obstacle : null;
  }

  damageObstacle(obs, dmg, fx, economy, scene) {
    if (!obs || obs.cleared) return;
    obs.hp -= dmg;
    obs.hitWobble = 0.22;
    if (fx) {
      fx.spawnDamageText(Math.round(obs.x), Math.round(obs.y - 14), Math.round(dmg), '#FF7875', false);
      fx.spawnParticles(obs.x, obs.y, 6, ['#8C6842', '#D48806', '#5C4028'], 15, 35, 0.2, 0.35, 2);
    }
    platform.playSfx('sfx_hit', 0.85);

    if (obs.hp <= 0) {
      obs.cleared = true;
      obs.hp = 0;
      obs.isTargeted = false;
      const tile = this.grid[obs.row][obs.col];
      tile.type = 'moss'; // 障碍物破除后，化为肥沃战术灵土坑位，开辟全新种植位！
      tile.unlockedFromObs = true;
      tile.obstacle = null;
      if (scene && scene.targetedObstacle === obs) {
        scene.targetedObstacle = null;
      }

      // 奖励爆发：大量黄金孢子 + 25%几率掉落远古觉醒种子
      const rewardSpores = 65 + (obs.variant || 0) * 15;
      if (economy) {
        economy.addSpores(rewardSpores);
      }
      let dropAwakening = false;
      if (scene && Math.random() < 0.25) {
        scene.awakeningSeeds = (scene.awakeningSeeds || 0) + 1;
        dropAwakening = true;
      }

      if (fx) {
        fx.triggerScreenShake(3.5, 0.25);
        fx.spawnFloatingText(obs.x, obs.y - 24, `🌱 开辟领地 +${rewardSpores} 孢子!`, '#FFE58F', 1.35);
        if (dropAwakening) {
          fx.spawnFloatingText(obs.x, obs.y - 44, '✨ 发现远古觉醒种子!', '#B37FEB', 1.8);
        }
        fx.spawnParticles(obs.x, obs.y, 28, ['#52C41A', '#FFE58F', '#8C6842', '#D48806', '#FFFFFF'], 40, 120, 0.3, 0.6, 4);
        if (typeof fx.spawnShockwave === 'function') {
          fx.spawnShockwave(obs.x, obs.y, 40, '#52C41A');
        }
      }
      platform.playSfx('sfx_bomb');
      platform.playSfx('sfx_win', 0.8);
      if (typeof wx !== 'undefined' && wx.vibrateShort) {
        try { wx.vibrateShort({ type: 'heavy' }); } catch (e) {}
      }
    }
  }

  inBounds(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  isPath(col, row) {
    const tile = this.getTile(col, row);
    return Boolean(tile && (tile.type === 'path' || tile.type === 'spawn'));
  }

  getTile(col, row) {
    const c = Math.round(col);
    const r = Math.round(row);
    if (!Number.isFinite(c) || !Number.isFinite(r) || !this.inBounds(c, r)) return null;
    return this.grid[r][c];
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
    // 严格锁定固定战术坑位（战术灵土）：场地不再是无限草坪随意插塔
    // 坑位总数稀缺固定（12~17个），植物死了就是死了，考验极限战术选位与前排掩护！
    return tile.type === 'moss';
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
    // 全图独特生态光粒氛围（晨露花粉 / 苔溪流光 / 夜光蕈粉 / 古殿蚀日余烬）
    const mid = this.mapData ? this.mapData.id : 'map1';
    ctx.save();
    for (let i = 0; i < 16; i++) {
      let px = ((i * 67 + Math.floor(animTimeSec * 14)) % 920) - 140;
      let py = ((i * 43 - Math.floor(animTimeSec * 8)) % 500 + 500) % 500 - 20;
      if (mid === 'map2') {
        px += Math.sin(animTimeSec * 1.8 + i) * 8;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(140, 245, 235, 0.36)' : 'rgba(210, 255, 245, 0.28)';
      } else if (mid === 'map3') {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(120, 225, 255, 0.38)' : 'rgba(211, 173, 247, 0.34)';
      } else if (mid === 'map4') {
        px = ((i * 63 - Math.floor(animTimeSec * 12)) % 920 + 920) % 920 - 140;
        py = ((i * 41 + Math.floor(animTimeSec * 10)) % 500);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 215, 110, 0.42)' : 'rgba(255, 155, 70, 0.30)';
      } else {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 238, 160, 0.35)' : 'rgba(120, 255, 175, 0.28)';
      }
      ctx.beginPath();
      ctx.arc(px, py, i % 3 === 0 ? 3.0 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 守护小屋圣坛生机结界（生命充沛呈暖金呼吸，危急<=8颗时轻度红脉冲警示）
    if (this.mapData && this.mapData.warehouseTile) {
      const [wc, wr] = this.mapData.warehouseTile;
      const hx = (wc + 0.5) * TILE_SIZE;
      const hy = (wr + 0.5) * TILE_SIZE + 6;
      const curSeeds = (this.scene && this.scene.economy) ? this.scene.economy.seeds : 20;
      const isDanger = curSeeds <= 8;
      const pulse = 0.85 + Math.sin(animTimeSec * (isDanger ? 6.5 : 2.6)) * 0.15;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(1.0, 0.65);
      ctx.strokeStyle = isDanger
        ? `rgba(255, 77, 79, ${(0.55 * pulse).toFixed(2)})`
        : `rgba(255, 229, 143, ${(0.35 * pulse).toFixed(2)})`;
      ctx.lineWidth = isDanger ? 2.0 : 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, 22 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    this.renderRouteGuides(ctx, animTimeSec);

    // 地图2专属鲜活溪流：沿着 col ~6.35 曲折溪道南流的水面高光波纹
    if (this.mapData && this.mapData.id === 'map2') {
      ctx.save();
      ctx.lineCap = 'round';
      for (let w = 0; w < 6; w++) {
        const flowPhase = ((animTimeSec * 28 + w * 76) % 440);
        const wy = 20 + flowPhase;
        const wx = 202 + Math.sin(wy * 0.025 + w) * 5;
        const alpha = Math.sin((flowPhase / 440) * Math.PI) * 0.42;
        ctx.strokeStyle = `rgba(210, 250, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(wx, wy, 7 + (w % 2) * 3, 0.25 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
      platform.recordDrawCall(1);
    }

    // 终点守护小屋烟囱袅袅炊烟 (Living Map Hearth Smoke Wisps)
    if (this.mapData && this.mapData.warehouseTile) {
      const [wc, wr] = this.mapData.warehouseTile;
      const baseX = (wc + 0.5) * TILE_SIZE - 4;
      const baseY = (wr + 0.5) * TILE_SIZE - 22;
      ctx.save();
      for (let p = 0; p < 3; p++) {
        const phase = (animTimeSec * 0.45 + p / 3) % 1.0;
        const px = baseX + Math.sin(animTimeSec * 2.2 + p * 2.1) * 3.5 + phase * 6;
        const py = baseY - phase * 22;
        const pr = 2.4 + phase * 4.2;
        const alpha = (1.0 - phase) * 0.34;
        ctx.fillStyle = `rgba(255, 250, 236, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 次级地穴暗紫侵蚀孢子浮尘
    if (this.mapData && this.mapData.spawnTile2) {
      const [s2c, s2r] = this.mapData.spawnTile2;
      const bx = (s2c + 0.5) * TILE_SIZE;
      const by = (s2r + 0.5) * TILE_SIZE - 4;
      ctx.save();
      for (let q = 0; q < 3; q++) {
        const phase = (animTimeSec * 0.65 + q / 3) % 1.0;
        const px = bx + Math.cos(animTimeSec * 2.8 + q * 2.3) * 8;
        const py = by - phase * 18;
        ctx.fillStyle = `rgba(211, 173, 247, ${((1.0 - phase) * 0.46).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 备战期 Kingdom Rush 入口召唤波次环 (点击出怪口即可提前召敌拿赏金)
    if (this.scene && this.scene.waveManager && this.scene.waveManager.isPrepPhase()) {
      const waveMgr = this.scene.waveManager;
      const maxPrep = waveMgr.currentWaveIndex === 1
        ? CONFIG.ECONOMY.PREP_TIME_FIRST_WAVE
        : CONFIG.ECONOMY.PREP_TIME_BETWEEN_WAVES;
      const prog = Math.max(0, Math.min(1, waveMgr.prepTimerSec / Math.max(1, maxPrep)));
      const portals = [this.mapData.spawnTile];
      if (this.mapData.spawnTile2) {
        const nextWave = waveMgr.waveList && waveMgr.waveList[waveMgr.currentWaveIndex - 1];
        if (nextWave && nextWave.groups && nextWave.groups.some((g) => g && g.routeIndex === 1)) {
          portals.push(this.mapData.spawnTile2);
        }
      }
      const pulse = 1.0 + Math.sin(animTimeSec * 5.2) * 0.1;
      for (let pi = 0; pi < portals.length; pi++) {
        const pt = portals[pi];
        if (!pt) continue;
        const px = (pt[0] + 0.5) * TILE_SIZE;
        const py = (pt[1] + 0.5) * TILE_SIZE;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 16 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120, 18, 18, 0.42)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 备战倒计时外环进度弧
        ctx.beginPath();
        ctx.arc(px, py, 19.5, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * prog);
        ctx.strokeStyle = '#FF4D4F';
        ctx.lineWidth = 2.6;
        ctx.stroke();

        // 清晰提前迎战提示微标
        const tagY = Math.max(12, py - 24);
        const tagX = Math.max(26, Math.min(614, px));
        ctx.fillStyle = 'rgba(28, 14, 8, 0.90)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(tagX - 22, tagY - 7, 44, 14, 5) : ctx.rect(tagX - 22, tagY - 7, 44, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFE58F';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('迎战!', tagX, tagY + 0.5);
        ctx.restore();
      }
      platform.recordDrawCall(1);
    }

    // 动态环境光：由天气和微风系统统一柔和过渡渲染，无需额外程序化几何圈

    // 幽夜微光专属：终点蘑菇小屋温馨壁炉与窗棂烛光 (Cottage Window Candle Glow)
    const isNight = (this.mapData && this.mapData.theme === 'night_fungi') ||
                    (this.scene && this.scene.weather && this.scene.weather.currentWeather === 'night');
    if (isNight && this.mapData.warehouseTile) {
      const [wc, wr] = this.mapData.warehouseTile;
      const wdx = wc * TILE_SIZE;
      const wdy = wr * TILE_SIZE;
      ctx.save();
      const candlePulse = 0.82 + Math.sin(animTimeSec * 5.2) * 0.12 + Math.cos(animTimeSec * 11.5) * 0.06;
      const grad = ctx.createRadialGradient(wdx + 16, wdy + 20, 2, wdx + 16, wdy + 20, 26 * candlePulse);
      grad.addColorStop(0, 'rgba(255, 225, 120, 0.72)');
      grad.addColorStop(0.35, 'rgba(255, 175, 50, 0.38)');
      grad.addColorStop(1, 'rgba(255, 130, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(wdx + 16, wdy + 20, 26 * candlePulse, 0, Math.PI * 2);
      ctx.fill();

      // 小屋窗棂内透暖光微点
      ctx.fillStyle = 'rgba(255, 248, 200, 0.95)';
      ctx.beginPath();
      ctx.arc(wdx + 16, wdy + 20, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      platform.recordDrawCall(1);
    }

    // 渲染可清除地图障碍物 (Clearable Obstacles & Interactive Health Bars)
    if (this.obstacles && this.obstacles.length > 0) {
      for (let i = 0; i < this.obstacles.length; i++) {
        const obs = this.obstacles[i];
        if (obs.cleared) continue;

        let ox = obs.x;
        let oy = obs.y;
        if (obs.hitWobble > 0) {
          obs.hitWobble = Math.max(0, obs.hitWobble - (1 / 60));
          ox += Math.sin(obs.hitWobble * 45) * 2.8;
        }

        // 100% 商业级高精手绘原生森林障碍物（古苔木桩、灵苔巨石、璀璨魔晶蕈、荧光朽木，严禁任何文字、水印或残次切边）
        const variant = obs.variant % 4;
        const obsImages = [
          'assets/vfx/obs_moss_stump.png',
          'assets/vfx/obs_moss_rock.png',
          'assets/vfx/obs_crystal_mush.png',
          'assets/vfx/obs_ancient_stump.png'
        ];
        const obsImg = platform.getImage(obsImages[variant]);
        
        let dw = 40;
        let dh = 36;
        if (variant === 0) { dw = 42; dh = 34; }
        else if (variant === 1) { dw = 40; dh = 36; }
        else if (variant === 2) { dw = 42; dh = 40; }
        else if (variant === 3) { dw = 48; dh = 38; }

        ctx.save();
        // 地面柔和接触阴影
        ctx.fillStyle = 'rgba(10, 15, 12, 0.42)';
        ctx.beginPath();
        ctx.ellipse(ox, oy + 8, dw * 0.42, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        if (obsImg && obsImg.width) {
          ctx.drawImage(obsImg, ox - dw * 0.5, oy - dh + 10, dw, dh);
        }

        // 血条 (受创或被集火时显示)
        if (obs.isTargeted || obs.hp < obs.maxHp) {
          const bw = 28;
          const bh = 4;
          const bx = ox - bw * 0.5;
          const by = oy - 22;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
          const ratio = Math.max(0, Math.min(1.0, obs.hp / obs.maxHp));
          ctx.fillStyle = ratio > 0.5 ? '#52C41A' : (ratio > 0.25 ? '#FAAD14' : '#FF4D4F');
          ctx.fillRect(bx, by, bw * ratio, bh);
        }

        // 🎯 玩家集火锁定光标 (100% 战术准星与精致集火徽标)
        if (obs.isTargeted) {
          const bob = Math.sin(animTimeSec * 6) * 3;
          const reticleImg = platform.getImage('assets/vfx/range_commander_reticle.png');
          if (reticleImg && reticleImg.width) {
            ctx.save();
            ctx.translate(ox, oy);
            ctx.rotate(animTimeSec * 1.5);
            ctx.globalAlpha = 0.85;
            const rw = 40;
            const rh = 40;
            ctx.drawImage(reticleImg, -rw * 0.5, -rh * 0.5, rw, rh);
            ctx.restore();
          } else {
            // 战术瞄准四角括号
            ctx.strokeStyle = '#FF4D4F';
            ctx.lineWidth = 2.0;
            const cr = 16;
            const cl = 6;
            ctx.beginPath();
            ctx.moveTo(ox - cr, oy - cr + cl); ctx.lineTo(ox - cr, oy - cr); ctx.lineTo(ox - cr + cl, oy - cr);
            ctx.moveTo(ox + cr - cl, oy - cr); ctx.lineTo(ox + cr, oy - cr); ctx.lineTo(ox + cr, oy - cr + cl);
            ctx.moveTo(ox + cr, oy + cr - cl); ctx.lineTo(ox + cr, oy + cr); ctx.lineTo(ox + cr - cl, oy + cr);
            ctx.moveTo(ox - cr + cl, oy + cr); ctx.lineTo(ox - cr, oy + cr); ctx.lineTo(ox - cr, oy + cr - cl);
            ctx.stroke();
          }

          // 悬浮集火文字徽标
          ctx.fillStyle = '#FF4D4F';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🎯 优先集火', ox, oy - 28 + bob);
        }
        ctx.restore();
      }
      platform.recordDrawCall(1);
    }
  }

  renderStatic(ctx, animTimeSec, currentWaveIndex = 1) {
    const atlasPath = this.mapData.atlasPath;
    const atlasImg = platform.getImage(atlasPath);

    // 1. 优先绘制 AI 预合成的完整 16:9 全景手绘战场画卷 (960x540，无任何拼接裁切)
    if (atlasImg && MAP_ATLAS_LAYOUT.sceneBg) {
      const sb = MAP_ATLAS_LAYOUT.sceneBg;
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const bgX = -mv.OFFSET_X / mv.SCALE;
      const bgY = -mv.OFFSET_Y / mv.SCALE;
      const bgW = (CONFIG.RESOLUTION.LOGICAL_WIDTH || 960) / mv.SCALE;
      const bgH = (CONFIG.RESOLUTION.LOGICAL_HEIGHT || 540) / mv.SCALE;
      drawSubImage(ctx, atlasImg, sb.x, sb.y, sb.w, sb.h, bgX, bgY, bgW, bgH);
      // 绘制破除障碍后动态开辟出的新肥沃苔地槽位
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const tile = this.grid[r][c];
          if (tile && tile.type === 'moss' && tile.unlockedFromObs) {
            drawMapTile(ctx, atlasPath, 'moss_' + (tile.variant % 2), c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
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
          if (tile.type === 'path' || tile.type === 'spawn' || tile.type === 'warehouse') {
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
    // 100% 纯自然灵性仙尘航线：摒弃任何生硬刺目的矢量虚线，采用若隐若现的微光孢子微粒飘散引导 (Fairy Spore Motes)
    const airSamples = this.airRoute.samples;
    if (airSamples && airSamples.length > 0) {
      ctx.save();
      const numMotes = 12;
      for (let i = 0; i < numMotes; i++) {
        const t = ((animTimeSec * 0.18 + i / numMotes) % 1.0);
        const dist = t * this.airRoute.totalLengthPx;
        const pos = sampleRouteAtDistance(this.airRoute, dist);
        const motePulse = 0.5 + Math.sin(animTimeSec * 4 + i) * 0.4;
        ctx.fillStyle = 'rgba(186, 231, 255, ' + (0.16 * motePulse) + ')';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.0 * motePulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      platform.recordDrawCall(1);
    }

    // 伏行突袭地道：采用若隐若现的紫晶灵气与暗影地脉微光符文脉冲，绝无生硬几何描边
    if (this.groundRoute2 && this.groundRoute2.samples && this.groundRoute2.samples.length > 0) {
      ctx.save();
      const numFlankNodes = 8;
      for (let j = 0; j < numFlankNodes; j++) {
        const t2 = ((animTimeSec * 0.14 + j / numFlankNodes) % 1.0);
        const dist2 = t2 * this.groundRoute2.totalLengthPx;
        const pos2 = sampleRouteAtDistance(this.groundRoute2, dist2);
        const flankPulse = 0.5 + Math.sin(animTimeSec * 5 + j * 2) * 0.5;
        ctx.fillStyle = 'rgba(211, 173, 247, ' + (0.18 * flankPulse) + ')';
        ctx.beginPath();
        ctx.arc(pos2.x, pos2.y, 2.2 * flankPulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
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
  calculateSellRefund(input) {
    const total = (typeof input === 'object' && input !== null)
      ? (input.totalInvested || (input.node && input.node.cost) || (input.def && input.def.nodes && input.def.nodes.base.cost) || 100)
      : (typeof input === 'number' && Number.isFinite(input) ? input : 100);
    return Math.round(total * (CONFIG.ECONOMY.SELL_REFUND_RATE || 0.6));
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
  boss_m3: PALETTE.ENEMY_SPLITTER,
  boss_m4: '#FA8C16'
};

class EnemyManager {
  constructor() {
    this.flyingWebs = [];
    this.relicManager = null;
    const self = this;
    this.pool = new ObjectPool(
      () => ({
        takeDamage(amount, fx = null, dType = 'nature') {
          if (this.state === 'death' || this.hp <= 0) return;
          const dmg = Math.max(1, Math.round(amount));
          this.hp -= dmg;
          this.whiteFlashFrames = 2;
          if (fx) {
            if (typeof fx.spawnFloatingText === 'function') {
              fx.spawnFloatingText(Math.round(this.x), Math.round(this.y - 14), '-' + dmg, '#FF4D4F', 0.9);
            }
          }
          if (this.hp <= 0) {
            self.killEnemy(this, fx);
          }
        },
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
    this.flyingWebs.length = 0;
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
    if (e.isBoss && this.scene && this.scene.bossOverdriveEngine) {
      this.scene.bossOverdriveEngine.registerBoss(e);
    }
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
  applyDirectDamage(enemy, baseDamage, bonusSum, isCrit, appliesMark, combatTimeSec, map, economy, fx, damageType = 'watch', options = null) {
    if (!enemy || enemy.state === 'death') return { dealt: 0, killed: false };

    const opts = options || {};
    const armorPierceRatio = opts.armorPierceRatio || 0;
    const flatArmorPierce = opts.flatArmorPierce || 0;
    const isHolySmite = Boolean(opts.holySmite);

    // Burrower underground evasion vs unearthing
    if (enemy.isUnderground) {
      // Check if hit by explosion / earthquake shockwave / stun / holy smite
      const isExplosionOrStun = (bonusSum && bonusSum > 0.8) || appliesMark || isHolySmite || damageType === 'burst';
      if (isExplosionOrStun) {
        enemy.isUnderground = false;
        enemy.unearthTimer = 1.5;
        if (fx) {
          fx.spawnFloatingText(enemy.x, enemy.y - 20, isHolySmite ? '圣光破土!' : '震裂出土!', '#FAAD14', 1.2);
          fx.spawnParticles(enemy.x, enemy.y, 16, ['#8C6842', '#D48806', '#FFFDF5'], 25, 45);
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
    const markMul = (enemy.markTimer > 0 || isHolySmite) ? CONFIG.COMBAT.MARK_MULTIPLIER : 1.0;
    const rawDamage = baseDamage * (1 + (bonusSum || 0)) * critMul * markMul;
    let frontShieldMul = 1.0;
    if (enemy.hasFrontShield && !isCrit) {
      // 穿透前盾机制：圣光魔法、迫击轰炸、烈焰灼烧绕过正面盾牌抗性
      const isBypass = damageType === 'lumina' || damageType === 'burst' || damageType === 'fire' || damageType === 'magic';
      if (isBypass) {
        frontShieldMul = 0.85; // 绕过盾牌削减
        if (fx) {
          fx.spawnFloatingText(enemy.x, enemy.y - 14, '穿盾克敌!', '#FAAD14', 1.0);
        }
      } else {
        frontShieldMul = 0.40; // 优化为 60% 减伤（原 75% 减伤过高导致打不动铁甲巨虫）
        if (fx) {
          fx.spawnFloatingText(enemy.x, enemy.y - 14, '铁壁格挡 -60%!', '#D9D9D9', 0.95);
          fx.spawnParticles(enemy.x, enemy.y, 6, ['#D9D9D9', '#FFFDF5', '#8C8C8C'], 20, 35);
        }
      }
    }
    const baseEffArmor = this.getEffectiveArmor(enemy);
    const effArmor = Math.max(0, (baseEffArmor * (1 - armorPierceRatio)) - flatArmorPierce);
    const actualDamage = Math.max(
      rawDamage - effArmor,
      rawDamage * CONFIG.COMBAT.MIN_ARMOR_DAMAGE_RATIO
    ) * frontShieldMul;

    // 瞭望菇 A3 / 圣光神罚 命中后刷新 3 秒标记
    if (appliesMark || isHolySmite) {
      enemy.markTimer = CONFIG.COMBAT.MARK_DURATION;
    }

    // 5.7 单体命中表现：目标白闪 2 帧
    enemy.whiteFlashFrames = CONFIG.FEEDBACK.HIT.whiteFlashFrames;
    if (enemy.type === 'armored' || enemy.baseArmor > 0) {
      enemy.hitArmorFrames = 6;
    }

    if (isCrit && fx) {
      fx.spawnFloatingText(enemy.x, enemy.y - 14, '💥' + Math.round(actualDamage), '#FFD700', 1.12);
    }

    enemy.hp -= actualDamage;
    const isKilled = enemy.hp <= 0;

    const dType = damageType || (appliesMark ? 'watch' : 'burst');
    if (opts.sourceTower) {
      opts.sourceTower.totalDamage = (opts.sourceTower.totalDamage || 0) + Math.round(actualDamage);
      if (isKilled) opts.sourceTower.kills = (opts.sourceTower.kills || 0) + 1;
    }
    if (this.scene) {
      if (this.scene.combatAnalytics) {
        this.scene.combatAnalytics.recordDamage(dType, Math.round(actualDamage), isKilled);
      }
      if (this.scene.elementalReactions) {
        let elem = null;
        if (dType === 'fire' || dType === 'splash' || dType === 'burst') elem = 'pyro';
        else if (dType === 'water' || dType === 'nature' || dType === 'lumina') elem = 'hydro';
        else if (dType === 'shock' || dType === 'magic') elem = 'electro';
        else if (dType === 'frost' || dType === 'mist') elem = 'cryo';
        else if (dType === 'poison' || dType === 'toxic' || dType === 'thorn') elem = 'toxic';
        else if (dType === 'pierce' || dType === 'watch') elem = 'dendro';

        if (elem) {
          this.scene.elementalReactions.applyElement(enemy, elem, Math.round(actualDamage), this.scene);
        }
      }
    }

    if (isKilled) {
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

  /**
   * 统一伤害结算接口 (天候雷暴、英雄斩击、反伤震击、法术轰炸、神术惩戒等)
   */
  applyDamage(enemy, amount, isCrit = false, dType = 'physical', fx = null, source = null) {
    if (!enemy || enemy.state === 'death' || enemy.hp <= 0) return 0;
    const finalFx = fx || (this.scene ? this.scene.fx : null);
    let dmg = Math.max(1, Math.round(amount));

    if (dType === 'physical' && enemy.baseArmor && !isCrit) {
      const reduction = Math.max(0.2, 1 - (enemy.baseArmor * 0.05));
      dmg = Math.max(1, Math.round(dmg * reduction));
    }

    enemy.hp -= dmg;
    enemy.whiteFlashFrames = 3;

    if (finalFx && typeof finalFx.spawnFloatingText === 'function') {
      const color = isCrit ? '#FFD700' : (dType === 'magic' ? '#69C0FF' : (dType === 'pierce' ? '#FF7A45' : '#FF4D4F'));
      const text = isCrit ? `暴击 -${dmg}` : `-${dmg}`;
      finalFx.spawnFloatingText(Math.round(enemy.x), Math.round(enemy.y - 14), text, color, isCrit ? 1.2 : 0.9);
    }

    if (enemy.hp <= 0) {
      this.killEnemy(enemy, finalFx);
    }
    return dmg;
  }

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
    const cj = this.combatJuice || (this.scene ? this.scene.combatJuice : null);
    if (cj) {
      cj.recordKill(enemy.threat || 1);
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
      const isBreaker = e.type === 'armored' || e.type === 'siege_beetle' || e.type === 'skeletal_husk' || e.isBoss;
      if (towerManager && towerManager.towers && towerManager.towers.length > 0) {
        const isMoth = e.type === 'moth';
        const atkRange = isMoth ? 120 : 38; // 飞蛾远程 120px 喷毒，地面甲虫近身 38px 啃噬
        const atkInterval = isMoth ? 2.4 : (isBreaker ? 1.4 : 1.8);
        const atkDamage = isMoth ? 9 : (
          e.type === 'armored' ? 26 :
          e.type === 'skeletal_husk' ? 24 :
          e.type === 'siege_beetle' ? 55 :
          e.isBoss ? 72 :
          (e.type === 'splitter' ? 14 : (e.type === 'swift' ? 7 : 9))
        );

        let bestTower = null;
        let bestScore = 999999;
        for (let tIdx = 0; tIdx < towerManager.towers.length; tIdx++) {
          const tw = towerManager.towers[tIdx];
          if (tw.dormantTimer > 0) continue; // 忽略已休眠枯萎的塔
          const d = Math.hypot(tw.x - e.x, tw.y - e.y);
          if (d <= atkRange) {
            // 飞蛾与跳跃虫优先打击灵光菇后勤；近战虫群优先被厚甲尖刺菇吸引仇恨
            let score = d;
            if ((isMoth || e.isLeaper) && tw.typeId === 'lumina') {
              score -= 900;
            } else if (!isMoth && !e.isLeaper && tw.typeId === 'thorn') {
              score -= 600;
            }
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
              bestTower.poisonTimer = 2.6;
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
      const moveSlow = isBlockedByGuard ? 0 : (isMeleeAttacking ? (isBreaker ? 0.25 : 0.6) : (attackingTower ? 0.55 : 1.0));
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

    // 更新空中飞行的蛛丝飞弹（弹道移动、碰撞判定、命中上状态、回收）
    for (let i = this.flyingWebs.length - 1; i >= 0; i--) {
      const w = this.flyingWebs[i];
      w.timer = (w.timer || 0) + dt;
      const duration = w.duration || 0.38;
      const progress = Math.min(1.0, w.timer / duration);
      // 抛物线轨迹
      const arcHeight = Math.sin(progress * Math.PI) * 28;
      w.curX = w.startX + (w.targetX - w.startX) * progress;
      w.curY = w.startY + (w.targetY - w.startY) * progress - arcHeight;

      if (progress >= 1.0 || w.timer >= 1.2) {
        if (w.targetTower && towerManager && towerManager.towers && towerManager.towers.includes(w.targetTower)) {
          if (!w.targetTower.isWebbed && typeof towerManager.applyWeb === 'function') {
            towerManager.applyWeb(w.targetTower, 3, fx);
          }
        } else if (fx) {
          fx.spawnParticles(w.targetX, w.targetY, 8, ['#BAE7FF', '#FFFFFF', '#D3ADF7'], 20, 45, 0.2, 0.4, 3);
        }
        this.flyingWebs.splice(i, 1);
      }
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

    // 绘制空中飞行的 100% AI 手绘幽光蛛丝飞弹 (100% AI Hand-Painted Silk Cocoon Bolus)
    const silkBallImg = platform.getImage('assets/vfx/proj_spider_silk_ball.png');
    for (let i = 0; i < this.flyingWebs.length; i++) {
      const w = this.flyingWebs[i];
      ctx.save();
      // 1. 幽暗蛛丝轨迹：极度轻柔半透明多重有机丝线 (透明度 0.25)
      ctx.strokeStyle = 'rgba(210, 180, 255, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(w.startX, w.startY);
      const cpX = (w.startX + w.targetX) * 0.5;
      const cpY = (w.startY + w.targetY) * 0.5 - 28;
      ctx.quadraticCurveTo(cpX, cpY, w.curX, w.curY);
      ctx.stroke();

      // 2. 蛛丝飞弹核心：100% 纯 AI 手绘透光毒性蛛丝茧球
      if (silkBallImg && silkBallImg.width) {
        ctx.translate(Math.round(w.curX), Math.round(w.curY));
        ctx.rotate(w.timer * 12);
        const bSize = 28;
        ctx.drawImage(silkBallImg, -bSize * 0.5, -bSize * 0.5, bSize, bSize);
      } else {
        ctx.fillStyle = 'rgba(230, 245, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(w.curX, w.curY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const list = this.pool.getActiveList();
    if (list.length === 0) return;

    if (!this._groundRenderBuf) this._groundRenderBuf = [];
    if (!this._airRenderBuf) this._airRenderBuf = [];
    this._groundRenderBuf.length = 0;
    this._airRenderBuf.length = 0;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.isFlying) {
        this._airRenderBuf.push(e);
      } else {
        this._groundRenderBuf.push(e);
      }
    }
    this._groundRenderBuf.sort((a, b) => a.y - b.y);
    this._airRenderBuf.sort((a, b) => a.y - b.y);

    // 1. 地面敌人（按 Y 坐标近大远小深度排序，消除虫潮穿插）
    for (let i = 0; i < this._groundRenderBuf.length; i++) {
      this.renderSingleEnemy(ctx, this._groundRenderBuf[i]);
    }

    // 2. 飞行敌人（先绘制独立影子，再绘制空中本体）
    for (let i = 0; i < this._airRenderBuf.length; i++) {
      const e = this._airRenderBuf[i];
      const shadowOffset = e.def.shadowOffsetPx || 14;
      if (!drawEnemyShadow(ctx, e.type, e.x, e.y, shadowOffset)) {
        ctx.fillStyle = 'rgba(20, 33, 61, 0.45)';
        ctx.fillRect(Math.round(e.x - 8), Math.round(e.y + shadowOffset - 3), 16, 6);
      }
      this.renderSingleEnemy(ctx, e);
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

    let usedCustomArt = false;
    if (customImgPath) {
      const cImg = platform.getImage(customImgPath);
      if (cImg && cImg.width) {
        usedCustomArt = true;
        ctx.save();
        const walkBob = Math.sin(e.animTimer * 10) * 1.5;
        // 高性能纯 GPU 闪白 (去除导致 GPU 重新光栅化的 ctx.filter)
        if (flashWhite) {
          ctx.globalAlpha = 0.85;
        }
        ctx.drawImage(cImg, e.x - customW * 0.5, e.y - customH * 0.5 - walkBob - jumpOffsetY, customW, customH);
        ctx.restore();

        // 受击火花星芒 (100% AI Hand-Painted Hit Spark)
        if (flashWhite) {
          const sparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
          if (sparkImg && sparkImg.width) {
            ctx.save();
            ctx.drawImage(sparkImg, e.x - 16, e.y - 16 - walkBob - jumpOffsetY, 32, 32);
            ctx.restore();
          }
        }
      }
    }

    if (!usedCustomArt) {
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
    }

    // 精英怪头顶冠军徽标 (100% AI Hand-Painted Royal Crest)
    if (e.isElite && e.state !== 'death') {
      const crestImg = platform.getImage('assets/vfx/icon_elite_crest.png');
      const cy = e.y - (usedCustomArt ? Math.round(customH * 0.5) : (e.def.artSize.height || 12)) - 16 - jumpOffsetY;
      ctx.save();
      if (crestImg && crestImg.width) {
        const cPulse = 1.0 + Math.sin(e.animTimer * 6) * 0.08;
        const cw = Math.round(28 * cPulse);
        const ch = Math.round(24 * cPulse);
        ctx.drawImage(crestImg, Math.round(e.x - cw * 0.5), Math.round(cy - ch * 0.5), cw, ch);
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(Math.round(e.x - 6), Math.round(cy - 6), 12, 12);
      }
      ctx.restore();
    }
    if (e.state === 'death') return;

    // 头部状态图标（标记、破甲、减速）
    const topY = e.y - (usedCustomArt ? Math.round(customH * 0.5) : e.def.artSize.height) - 8 - jumpOffsetY;
    if (e.markTimer > 0) {
      const mKey = (Math.floor(e.markTimer * 6) % 2 === 0) ? 'mark_icon_0' : 'mark_icon_1';
      drawProjectileSprite(ctx, mKey, e.x, topY - 8, 0, 0.65);
    } else if (e.armorReduction > 0) {
      drawProjectileSprite(ctx, 'armor_break_icon', e.x, topY - 8, 0, 0.6);
    }

    // 受到伤害后显示成熟奇幻血条 (Mature Wood-Bordered Fantasy Micro Health Bar with Easing Damage)
    if (e.hp < e.maxHp || e.isBoss) {
      const barW = e.isBoss ? 48 : 26;
      const barH = e.isBoss ? 6 : 4;
      const bx = Math.round(e.x - barW * 0.5);
      const by = Math.round(topY);
      const ratio = Math.max(0, Math.min(1, e.hp / e.maxHp));

      ctx.save();
      // 1. 经典暗红木/深古铜浮雕边框
      ctx.fillStyle = 'rgba(24, 16, 10, 0.92)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx - 1.5, by - 1.5, barW + 3, barH + 3, 3) : ctx.rect(bx - 1.5, by - 1.5, barW + 3, barH + 3);
      ctx.fill();

      // 2. 内底槽
      ctx.fillStyle = 'rgba(10, 10, 10, 0.75)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, barW, barH, 2) : ctx.rect(bx, by, barW, barH);
      ctx.fill();

      // 3. 动态血量填充
      if (ratio > 0) {
        const fillW = Math.max(2, Math.round(barW * ratio));
        let hpGrad = '#52C41A';
        if (ratio < 0.25) hpGrad = '#FF4D4F';
        else if (ratio < 0.55) hpGrad = '#FAAD14';

        if (e.isBoss) hpGrad = '#FA8C16';
        else if (e.isFlying) hpGrad = '#13C2C2';

        ctx.fillStyle = hpGrad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, fillW, barH, 2) : ctx.rect(bx, by, fillW, barH);
        ctx.fill();
      }

      // 4. 金属微光边线
      ctx.strokeStyle = e.isBoss ? 'rgba(255, 215, 0, 0.75)' : 'rgba(140, 110, 80, 0.65)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx - 1.5, by - 1.5, barW + 3, barH + 3, 3) : ctx.rect(bx - 1.5, by - 1.5, barW + 3, barH + 3);
      ctx.stroke();

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
 * 远古树人英雄微操、战术姿态与天赋树系统：
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
    // 初始位置按当前地图路网核心要冲设定，完全避开机关与障碍物
    const mapId = (map && map.mapId) || 'map1';
    if (mapId === 'map2') {
      this.x = 144;
      this.y = 272;
    } else if (mapId === 'map3') {
      this.x = 208;
      this.y = 80;
    } else if (mapId === 'map4') {
      this.x = 464;
      this.y = 240;
    } else {
      this.x = 208;
      this.y = 176;
    }
    this.targetX = this.x;
    this.targetY = this.y;
    
    // 基础属性与成长 (PvZ 战术指挥官标准，有挑战有配合)
    this.level = 1;
    this.maxLevel = 5;
    this.xp = 0;
    this.xpToNext = 100;
    this.baseMaxHp = 420;
    this.maxHp = this.baseMaxHp;
    this.hp = this.maxHp;
    this.baseAtk = 38;
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
    this.activeTraps = [];            // 游侠巡林隐秘真菌陷阱
    this.activeSpears = [];           // 游侠贯穿金矛飞矢
    this.bloodlustStacks = 0;         // 狂斧杀意叠加层数
    this.bloodlustTimer = 0;          // 杀意消退计时器
    this.brambleShieldHp = 0;         // 石肤荆棘护盾当前吸收值
    this.brambleShieldMax = 320;      // 护盾上限
    this.stanceAbilityCooldown = 0;   // 姿态战术微操冷却
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
    this.baseMaxHp = 560 + (this.level - 1) * 110;
    this.maxHp = this.baseMaxHp;
    this.hp = this.maxHp; // 升级瞬间回满生命！
    this.baseAtk = 46 + (this.level - 1) * 18;
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
        fx.spawnFloatingText(this.x, this.y - 20, '免死!', '#FFD700', 0.8);
      }
      return;
    }

    // 守卫姿态天然 35% 坚韧硬甲减伤，狂暴姿态承伤 +15%
    let finalDamage = amount;
    if (this.transcendence) {
      finalDamage = this.transcendence.onHeroTakeDamage(finalDamage, enemyManager, fx);
    }
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

  /**
   * 触发当前姿态的独占微操神技 (Kingdom Rush Stance Micro Ability)
   */
  castStanceAbility(enemyManager, fx = null) {
    if (this.state === 'dead' || this.stanceAbilityCooldown > 0) return false;
    this.stanceAbilityCooldown = 8.0;

    if (this.stance === 'guardian') {
      this.brambleShieldHp = this.brambleShieldMax;
      platform.playSfx('sfx_upgrade');
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 28, '荆棘玄武壁! 吸收320伤害', '#40A9FF', 1.5);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 75, '#40A9FF');
        fx.spawnParticles(this.x, this.y, 22, ['#40A9FF', '#91D5FF', '#FFFFFF', '#52C41A'], 35, 90, 0.3, 0.65, 4.5);
      }
      return true;
    } else if (this.stance === 'aggressive') {
      platform.playSfx('sfx_hit');
      if (fx) {
        fx.triggerScreenShake(4.0, 0.28);
        fx.spawnFloatingText(this.x, this.y - 28, '狂风乱舞·落叶断空!', '#FF4D4F', 1.4);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 90, '#FF4D4F');
        fx.spawnParticles(this.x, this.y, 35, ['#FF4D4F', '#FFA39E', '#FFD700', '#D4380D'], 50, 160, 0.25, 0.6, 5);
      }
      if (enemyManager) {
        const targets = enemyManager.getAliveEnemies();
        const cleaveDmg = Math.round(this.atkDamage * 2.2);
        for (let i = 0; i < targets.length; i++) {
          const e = targets[i];
          if (!e.isFlying && Math.hypot(e.x - this.x, e.y - this.y) <= 90) {
            enemyManager.applyDamage(e, cleaveDmg, true, 'physical', fx, null);
            e.activeSlow = 0.85;
            e.residualSlowTimer = 2.0;
          }
        }
      }
      return true;
    } else if (this.stance === 'scout') {
      platform.playSfx('sfx_place');
      this.deployScoutTrap(this.x - 18, this.y + 6, fx);
      this.deployScoutTrap(this.x + 18, this.y - 6, fx);
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 28, '布设隐秘巡林陷阱!', '#52C41A', 1.4);
      }
      return true;
    }
    return false;
  }

  deployScoutTrap(x, y, fx = null) {
    this.activeTraps.push({
      x: x,
      y: y,
      triggerRadius: 24,
      damage: 160 + this.level * 40,
      rootDuration: 3.0,
      lifeTimer: 35.0
    });
    if (fx) {
      fx.spawnParticles(x, y, 8, ['#52C41A', '#B7EB8F', '#FFD700'], 15, 40, 0.2, 0.4, 3);
    }
  }

  throwGoldenSpear(target, fx = null) {
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    this.activeSpears.push({
      x: this.x,
      y: this.y - 12,
      targetEnemy: target,
      angle: angle,
      speed: 460,
      pierceLeft: 3,
      damage: Math.round(this.atkDamage * 1.4)
    });
    platform.playSfx('sfx_shoot');
    if (fx) {
      fx.spawnParticles(this.x, this.y - 12, 6, ['#FFD700', '#52C41A'], 20, 50, 0.15, 0.3, 3);
    }
  }

  update(dt, enemyManager, fx = null) {
    this.animTimer += dt;
    if (this.rallyMarkerTimer > 0) this.rallyMarkerTimer = Math.max(0, this.rallyMarkerTimer - dt);
    if (this.levelUpGlowTimer > 0) this.levelUpGlowTimer = Math.max(0, this.levelUpGlowTimer - dt);
    if (this.skillCooldown > 0) this.skillCooldown = Math.max(0, this.skillCooldown - dt);
    if (this.stanceAbilityCooldown > 0) this.stanceAbilityCooldown = Math.max(0, this.stanceAbilityCooldown - dt);

    // 游侠巡林隐秘真菌地雷更新
    for (let tIdx = this.activeTraps.length - 1; tIdx >= 0; tIdx--) {
      const trap = this.activeTraps[tIdx];
      trap.lifeTimer -= dt;
      if (trap.lifeTimer <= 0) {
        this.activeTraps.splice(tIdx, 1);
        continue;
      }
      if (enemyManager) {
        const alive = enemyManager.getAliveEnemies();
        let triggered = false;
        for (let eIdx = 0; eIdx < alive.length; eIdx++) {
          const e = alive[eIdx];
          if (!e.isFlying && e.state !== 'death' && Math.hypot(e.x - trap.x, e.y - trap.y) <= trap.triggerRadius) {
            triggered = true;
            enemyManager.applyDamage(e, trap.damage, true, 'magic', fx, null);
            e.activeSlow = 0.95;
            e.residualSlowValue = 0.90;
            e.residualSlowTimer = trap.rootDuration;
            if (fx) {
              fx.spawnFloatingText(trap.x, trap.y - 18, '巡林陷阱触发·剧毒缚足!', '#52C41A', 1.3);
              fx.spawnParticles(trap.x, trap.y, 16, ['#52C41A', '#73D13D', '#FFD700'], 35, 80, 0.25, 0.5, 4);
            }
            platform.playSfx('sfx_thorn');
            break;
          }
        }
        if (triggered) {
          this.activeTraps.splice(tIdx, 1);
        }
      }
    }

    // 游侠贯穿金矛弹道更新
    for (let sIdx = this.activeSpears.length - 1; sIdx >= 0; sIdx--) {
      const spr = this.activeSpears[sIdx];
      spr.x += Math.cos(spr.angle) * spr.speed * dt;
      spr.y += Math.sin(spr.angle) * spr.speed * dt;

      if (spr.x < 0 || spr.x > 640 || spr.y < 0 || spr.y > 480) {
        this.activeSpears.splice(sIdx, 1);
        continue;
      }

      if (enemyManager) {
        const alive = enemyManager.getAliveEnemies();
        for (let eIdx = 0; eIdx < alive.length; eIdx++) {
          const e = alive[eIdx];
          if (e.state !== 'death' && Math.hypot(e.x - spr.x, e.y - spr.y) <= 16) {
            enemyManager.applyDamage(e, spr.damage, false, 'pierce', fx, null);
            e.activeSlow = 0.45;
            e.residualSlowTimer = 2.0;
            if (fx) {
              const sparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
              if (sparkImg && sparkImg.width) {
                fx.spawnParticles(spr.x, spr.y, 6, ['#FFD700', '#FFFFFF', '#52C41A'], 20, 60, 0.2, 0.4, 3.5);
              }
            }
            spr.pierceLeft--;
            if (spr.pierceLeft <= 0) {
              this.activeSpears.splice(sIdx, 1);
              break;
            }
          }
        }
      }
    }

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
        // 优先锁定并拦截空中飞行敌人（飞蛾、蜂群）
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i];
          if (e.state === 'death' || e.isUnderground || !e.isFlying) continue;
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d <= minDist) {
            closest = e;
            minDist = d;
          }
        }
        if (!closest) {
          for (let i = 0; i < alive.length; i++) {
            const e = alive[i];
            if (e.state === 'death' || e.isUnderground) continue;
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d <= minDist) {
              closest = e;
              minDist = d;
            }
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
            if (this.transcendence) {
              this.transcendence.onHeroHitTarget(target, enemyManager, fx);
            }
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
    // 渲染地面游侠巡林真菌陷阱 (Scout Fungal Traps)
    if (this.activeTraps && this.activeTraps.length > 0) {
      const dewImg = platform.getImage('assets/vfx/prop_dew.png');
      ctx.save();
      for (let t = 0; t < this.activeTraps.length; t++) {
        const tr = this.activeTraps[t];
        const pulse = 0.85 + Math.sin(animTimeSec * 6 + t) * 0.15;
        if (dewImg && dewImg.width) {
          ctx.drawImage(dewImg, tr.x - 10, tr.y - 10, 20, 20);
        } else {
          ctx.fillStyle = 'rgba(82, 196, 26, 0.65)';
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, 6 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(115, 209, 61, ' + (0.5 * pulse) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, tr.triggerRadius * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 渲染空中飞行的游侠贯穿金矛 (Flying Golden Spears)
    if (this.activeSpears && this.activeSpears.length > 0) {
      const spearImg = platform.getImage('assets/vfx/guard_spear.png');
      ctx.save();
      for (let s = 0; s < this.activeSpears.length; s++) {
        const spr = this.activeSpears[s];
        ctx.save();
        ctx.translate(spr.x, spr.y);
        ctx.rotate(spr.angle);
        if (spearImg && spearImg.width) {
          ctx.drawImage(spearImg, -18, -6, 36, 12);
        } else {
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(-12, -2, 24, 4);
        }
        ctx.restore();
      }
      ctx.restore();
    }
    if (this.state === 'dead') {
      // 阵亡休眠：远古树灵休眠古桩（100% AI 手绘青苔灵木古桩）与森林复苏生命光环
      ctx.save();
      // 地面阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 6, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 100% AI 手绘远古古桩立绘
      const stumpImg = platform.getImage('assets/vfx/prop_thunder_stump.png');
      if (stumpImg && stumpImg.width) {
        ctx.save();
        ctx.globalAlpha = 0.88;
        const sW = 38;
        const sH = 30;
        ctx.drawImage(stumpImg, this.x - sW * 0.5, this.y - sH * 0.75, sW, sH);
        ctx.restore();
      } else {
        ctx.fillStyle = '#4A3319';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - 4, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 灵光微粒环绕（休眠树灵呼吸光效）
      const breathPulse = 0.5 + Math.sin(animTimeSec * 4) * 0.35;
      ctx.fillStyle = 'rgba(115, 209, 61, ' + (0.35 * breathPulse) + ')';
      ctx.beginPath();
      ctx.arc(this.x + Math.sin(animTimeSec * 3) * 12, this.y - 12 + Math.cos(animTimeSec * 3) * 6, 3, 0, Math.PI * 2);
      ctx.arc(this.x - Math.sin(animTimeSec * 2.5) * 10, this.y - 8 + Math.sin(animTimeSec * 2.5) * 5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 复活倒计时进度圆环
      const ratio = 1 - (this.reviveTimer / this.reviveTimeTotal);
      ctx.strokeStyle = 'rgba(20, 30, 20, 0.65)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 28, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#52C41A';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 28, 12, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * ratio);
      ctx.stroke();

      // 倒计时文字与复苏光标
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 3;
      ctx.fillText(Math.ceil(this.reviveTimer) + 's', this.x, this.y - 28);
      ctx.shadowBlur = 0;

      ctx.restore();
      return;
    }

    // 1. 集结目的地战旗 (100% 纯 AI 手绘古典林地战旗，绝无简陋几何圆圈)
    const distToTarget = Math.hypot(this.targetX - this.x, this.targetY - this.y);
    const showRally = (this.state === 'walk' && distToTarget > 6) || this.rallyMarkerTimer > 0;
    if (showRally) {
      ctx.save();
      const alpha = Math.min(1.0, Math.max(0.4, this.rallyMarkerTimer || (distToTarget > 6 ? 0.95 : 0)));
      ctx.globalAlpha = alpha;

      // 旗帜底部柔和地面阴影
      ctx.fillStyle = 'rgba(10, 15, 12, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.targetX + 2, this.targetY + 4, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 手绘战旗立绘 (prop_rally_flag.png)
      const flagImg = platform.getImage('assets/vfx/prop_rally_flag.png');
      if (flagImg && flagImg.width) {
        const flW = 28;
        const flH = 34;
        const flutter = Math.sin(this.animTimer * 6) * 1.5;
        ctx.drawImage(flagImg, this.targetX - flW * 0.45, this.targetY - flH + 6 + flutter, flW, flH);
      } else {
        ctx.strokeStyle = '#D4B106';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(this.targetX, this.targetY + 2);
        ctx.lineTo(this.targetX, this.targetY - 22);
        ctx.stroke();
      }
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

    // 3. 英雄本体（100% AI 手绘远古橡木树人原画，全生命周期绝无任何矢量褐方块兜底）
    ctx.save();
    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    const walkBob = (this.state === 'walk') ? Math.sin(this.animTimer * 12) * 2.8 : 0;
    const breatheBob = (this.state === 'idle') ? Math.sin(animTimeSec * 3.5) * 1.5 : 0;
    const heroW = 54, heroH = 54;

    ctx.translate(Math.round(this.x), Math.round(this.y - walkBob - breatheBob));
    if (this.facingLeft) ctx.scale(-1, 1);

    // 3.0 战术姿态环绕光环与守护灵气
    if (this.stance === 'guardian') {
      const shieldImg = platform.getImage('assets/vfx/guard_shield.png');
      if (shieldImg && shieldImg.width) {
        ctx.save();
        const rot = animTimeSec * 2.0;
        const orbitX = Math.cos(rot) * 22;
        const orbitY = Math.sin(rot) * 10 - 18;
        ctx.globalAlpha = 0.85;
        ctx.drawImage(shieldImg, orbitX - 10, orbitY - 12, 20, 24);
        ctx.restore();
      }
    } else if (this.stance === 'aggressive') {
      ctx.save();
      const bladeGlint = Math.sin(animTimeSec * 8) * 0.25 + 0.75;
      ctx.globalAlpha = bladeGlint * 0.45;
      const slashVfx = platform.getImage('assets/vfx/vfx_hero_slash.png');
      if (slashVfx && slashVfx.width) {
        ctx.drawImage(slashVfx, -28, -38, 56, 44);
      }
      ctx.restore();
    } else if (this.stance === 'scout') {
      const spearImg = platform.getImage('assets/vfx/guard_spear.png');
      if (spearImg && spearImg.width) {
        ctx.save();
        ctx.translate(-14, -22);
        ctx.rotate(0.35);
        ctx.globalAlpha = 0.90;
        ctx.drawImage(spearImg, -6, -18, 12, 36);
        ctx.restore();
      }
    }

    if (heroImg && heroImg.width) {
      ctx.drawImage(heroImg, -heroW * 0.5, -heroH * 0.82, heroW, heroH);
    } else {
      // 优雅平滑过渡：即使极端网络首帧未解码，也绝对展示神圣金色古树灵种，杜绝一切丑陋方块
      const sporeImg = platform.getImage('assets/vfx/item_golden_spore.png');
      if (sporeImg && sporeImg.width) {
        ctx.drawImage(sporeImg, -16, -26, 32, 32);
      }
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
      // 默认插在地面路径约 25% 处的咽喉要冲附近
      const prefIdx = Math.max(1, Math.min(wps.length - 2, Math.floor(wps.length * 0.25)));
      const tryOrder = [prefIdx, Math.floor(wps.length * 0.5), 1, 0];
      for (let i = 0; i < tryOrder.length; i++) {
        const pt = wps[tryOrder[i]];
        if (!pt) continue;
        const col = Math.round(Array.isArray(pt) ? pt[0] : (pt.col !== undefined ? pt.col : 6));
        const row = Math.round(Array.isArray(pt) ? pt[1] : (pt.row !== undefined ? pt.row : 2));
        if (this.setRallyPoint(col, row, map, null, true)) break;
      }
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

    // 1. 绘制集结木旗（100% 纯 AI 手绘高精木质藤蔓绿叶旗帜）
    ctx.save();
    const fx = this.rallyX;
    const fy = this.rallyY;
    const wave = Math.sin(this.flagAnimTimer * 4) * 2;

    // 旗帜立柱阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(fx + 2, fy + 4, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const flagImg = platform.getImage('assets/vfx/prop_rally_flag.png');
    if (flagImg && flagImg.width) {
      const flW = 28;
      const flH = 34;
      ctx.drawImage(flagImg, fx - flW * 0.45, fy - flH + 6 + wave * 0.5, flW, flH);
    } else {
      ctx.strokeStyle = '#5C381E';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, fy + 4);
      ctx.lineTo(fx, fy - 22);
      ctx.stroke();
    }
    ctx.restore();

    // 2. 绘制 2 只萌萌菇精小卫士 (100% 纯 AI 手绘高精菇精战士立绘)
    const guardImg = platform.getImage('assets/vfx/sporeling_guard.png');
    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (g.state === 'dead') continue;

      ctx.save();
      const gx = Math.round(g.x);
      const gy = Math.round(g.y);
      const bob = g.state === 'walk' ? Math.abs(Math.sin(g.animTimer * 10)) * 2.5 : Math.sin(g.animTimer * 3) * 0.8;
      const thrust = g.thrustTimer > 0 ? 5 : 0;

      // 脚底微阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(gx, gy + 3, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      if (guardImg && guardImg.width) {
        const gw = 28;
        const gh = 30;
        ctx.translate(gx + thrust * 0.5, gy - bob);
        if (g.facingLeft) ctx.scale(-1, 1);
        ctx.drawImage(guardImg, -gw * 0.5, -gh + 4, gw, gh);
      } else {
        ctx.fillStyle = '#FFFBE6';
        ctx.beginPath();
        ctx.ellipse(gx, gy - 2 - bob, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 战斗中显示微雕木质小血条
      if (g.state === 'combat' || g.hp < g.maxHp) {
        const barW = 20;
        const barH = 3;
        const barX = gx - barW * 0.5;
        const barY = gy - 28 - bob;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        const hpPct = Math.max(0, Math.min(1, g.hp / g.maxHp));
        ctx.fillStyle = hpPct > 0.4 ? '#52C41A' : '#FF4D4F';
        ctx.fillRect(barX, barY, Math.round(barW * hpPct), barH);
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
 * 森林晨露金孢自然凝结与战地能量收集系统 (js/game/sporeDrop.js)
 * 奇幻森林晨露金孢随风飘落与即时触控收集机制：
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
    this.sporeCombo = 0;
    this.lastCollectTime = 0;
  }

  reset() {
    this.drops.length = 0;
    this.naturalSpawnTimer = 4.5;
    this.sporeCombo = 0;
    this.lastCollectTime = 0;
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

  update(dt, map, economy, fx, scene) {
    this.animTimeSec += dt;

    // 自然掉落晨露金孢 (PvZ 阳光飘落机制，自动避开障碍物、机关与已建防御塔)
    this.naturalSpawnTimer -= dt;
    if (this.naturalSpawnTimer <= 0) {
      this.naturalSpawnTimer = 5.5 + Math.random() * 3.0;
      let rx = 64 + Math.random() * 512;
      let ry = 64 + Math.random() * 316;
      const obstacles = (map && map.obstacles) || [];
      const pitcher = scene && scene.contraptions && scene.contraptions.pitcher;
      const thunder = scene && scene.contraptions && scene.contraptions.thunderTree;
      for (let attempt = 0; attempt < 16; attempt++) {
        const cx = 64 + Math.random() * 512;
        const cy = 64 + Math.random() * 316;
        let blocked = false;
        for (let oi = 0; oi < obstacles.length; oi++) {
          const obs = obstacles[oi];
          if (!obs.cleared && Math.hypot(cx - obs.x, cy - obs.y) < 48) {
            blocked = true;
            break;
          }
        }
        if (!blocked && pitcher && Math.hypot(cx - pitcher.x, cy - pitcher.y) < 48) blocked = true;
        if (!blocked && thunder && Math.hypot(cx - thunder.x, cy - thunder.y) < 48) blocked = true;
        if (!blocked && map && map.getTile) {
          const col = Math.floor(cx / TILE_SIZE);
          const row = Math.floor(cy / TILE_SIZE);
          const tile = map.getTile(col, row);
          if (tile && tile.tower) blocked = true;
        }
        if (!blocked) {
          rx = cx;
          ry = cy;
          break;
        }
      }
      this.spawnDrop(rx, ry, 15, true, 40);
    }

    // 英雄战地磁吸范围真空吸附
    const hero = scene && scene.hero && scene.hero.state !== 'dead' ? scene.hero : null;

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

      // 英雄磁吸微距吸附
      if (hero) {
        const hDist = Math.hypot(d.x - hero.x, d.y - hero.y);
        if (hDist < 85) {
          d.x += (hero.x - d.x) * dt * 5.5;
          d.y += (hero.y - d.y) * dt * 5.5;
          d.targetY = d.y;
          if (hDist < 26) {
            if (economy) economy.addSpores(d.spores);
            if (fx) {
              fx.spawnFloatingText(d.x, d.y - 18, `+${d.spores} 磁吸孢子!`, '#FFE58F', 1.25);
              fx.spawnParticles(d.x, d.y, 14, ['#FFE58F', '#FAAD14', '#52C41A'], 25, 65, 0.2, 0.4, 3);
            }
            platform.playSfx('sfx_coin');
            this.drops.splice(i, 1);
            continue;
          }
        }
      }

      // 到期自动吸纳保底（绝不丢失战场资源）
      if (d.life <= 0) {
        if (economy) economy.addSpores(d.spores);
        if (fx) {
          fx.spawnFloatingText(d.x, d.y - 18, `+${d.spores} 自然归巢`, '#FFE58F', 1.1);
        }
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
  /**
   * 生成散落迸发金孢（反应、击杀精英或 Boss 阶段转换）
   */
  spawnSporeBurst(x, y, count = 1, isGold = true) {
    const burstCount = Math.min(6, Math.max(1, count));
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 20 + Math.random() * 32;
      const targetX = Math.max(32, Math.min(608, x + Math.cos(angle) * dist));
      const targetY = Math.max(32, Math.min(416, y + Math.sin(angle) * dist));
      this.spawnDrop(targetX, targetY, Math.round(15 / burstCount) || 5, isGold, 32);
    }
  }

  /**
   * 点击/触控检测（PvZ 点击拾取阳光机制，支持双坐标系与手机 72px 超大判定圈）
   * @param {number} inputX 传入的点击 X 坐标（屏幕逻辑坐标或地图坐标）
   * @param {number} inputY 传入的点击 Y 坐标（屏幕逻辑坐标或地图坐标）
   * @returns {boolean} 是否成功点击收集
   */
  handlePointerDown(inputX, inputY, economy, fx) {
    const hitRadius = 72; // 手机端超大触控判定圈 (72px，超2个完整格子)，极速拾取零失误
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const scale = mv.SCALE || 0.85;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      const bob = Math.sin(d.animTimer * 4) * 3;
      const dy = d.y + bob;

      // 1. 地图坐标系距离 (若传入的是地图坐标)
      const distMap = Math.hypot(inputX - d.x, inputY - dy);

      // 2. 屏幕坐标系距离 (若传入的是屏幕坐标)
      const screenDx = mv.OFFSET_X + d.x * scale;
      const screenDy = mv.OFFSET_Y + dy * scale;
      const distScreen = Math.hypot(inputX - screenDx, inputY - screenDy);

      // 3. 屏幕转地图坐标距离
      const convertedMx = (inputX - mv.OFFSET_X) / scale;
      const convertedMy = (inputY - mv.OFFSET_Y) / scale;
      const distConverted = Math.hypot(convertedMx - d.x, convertedMy - dy);

      if (distMap <= hitRadius || distScreen <= hitRadius || distConverted <= hitRadius) {
        // 成功拾取！计算连击与升调音律
        const now = Date.now();
        if (now - this.lastCollectTime < 1600) {
          this.sporeCombo = Math.min(8, this.sporeCombo + 1);
        } else {
          this.sporeCombo = 1;
        }
        this.lastCollectTime = now;

        let bonusSpores = 0;
        if (this.sporeCombo >= 3) {
          bonusSpores = Math.min(15, (this.sporeCombo - 2) * 3);
        }
        const totalEarned = d.spores + bonusSpores;

        if (economy) {
          economy.addSpores(totalEarned);
        }

        // 播放清脆递增的五声音阶水灵音律 (Do -> Re -> Mi -> Sol -> La -> Do' -> Re' -> Mi')
        if (typeof platform.playMusicalScale === 'function') {
          platform.playMusicalScale(this.sporeCombo - 1);
        } else {
          platform.playSfx('sfx_coin');
        }

        if (fx) {
          const comboText = this.sporeCombo >= 3
            ? `♫ ${this.sporeCombo}连音律动! +${totalEarned}`
            : `+${d.spores} 晨露孢子!`;
          const textColor = this.sporeCombo >= 5 ? '#FFD700' : (this.sporeCombo >= 3 ? '#52C41A' : '#FFE58F');
          fx.spawnFloatingText(d.x, dy - 18, comboText, textColor, 1.45);
          fx.spawnParticles(d.x, dy, 18, ['#FFE58F', '#FAAD14', '#FFFDF5', '#52C41A'], 30, 75, 0.25, 0.5, 4);
          if (typeof fx.spawnShockwave === 'function') {
            fx.spawnShockwave(d.x, dy, 32, '#FFE58F');
          }
          if (typeof fx.spawnHomingMotes === 'function') {
            fx.spawnHomingMotes(screenDx, screenDy, 3, '#FFD700');
          }
        }
        // 手机端原生轻微触感振动反馈
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(12); } catch (e) {}
        }
        if (typeof wx !== 'undefined' && wx.vibrateShort) {
          try { wx.vibrateShort({ type: 'light' }); } catch (e) {}
        }
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
 * 精英与首领战利品遗物掉落与战地即时拾取机制：
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

      // 英雄磁吸微距拾取
      if (scene && scene.hero && scene.hero.state !== 'dead') {
        const hDist = Math.hypot(r.x - scene.hero.x, r.baseY - scene.hero.y);
        if (hDist < 64) {
          r.x += (scene.hero.x - r.x) * dt * 4.5;
          r.baseY += (scene.hero.y - r.baseY) * dt * 4.5;
          if (hDist < 20) {
            this.collect(r, scene, true);
            this.relics.splice(i, 1);
            continue;
          }
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
    const hitRadius = 88; // 手机端超大触控判定圈 (88px)，极其灵敏容易点击
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const scale = mv.SCALE || 1.0;
    const offX = mv.OFFSET_X || 0;
    const offY = mv.OFFSET_Y || 0;

    for (let i = this.relics.length - 1; i >= 0; i--) {
      const r = this.relics[i];
      const ry = r.baseY + r.bounceY + Math.sin(r.animTimer * 4) * 3;

      // 1. 地图坐标系直测
      const distMap = Math.hypot(clickX - r.x, clickY - ry);
      // 2. 屏幕坐标系映射
      const screenRx = offX + r.x * scale;
      const screenRy = offY + ry * scale;
      const distScreen = Math.hypot(clickX - screenRx, clickY - screenRy);
      // 3. 屏幕转地图坐标映射
      const convertedMx = (clickX - offX) / scale;
      const convertedMy = (clickY - offY) / scale;
      const distConverted = Math.hypot(convertedMx - r.x, convertedMy - ry);

      if (distMap <= hitRadius || distScreen <= hitRadius || distConverted <= hitRadius) {
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

    if (fx && typeof fx.spawnHomingMotes === 'function') {
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      fx.spawnHomingMotes(mv.OFFSET_X + relic.x * (mv.SCALE || 0.85), mv.OFFSET_Y + ry * (mv.SCALE || 0.85), 4, '#FFD700');
    }
    if (relic.kind === 'coin') {
      scene.economy.addSpores(relic.value || 60);
      if (fx) {
        fx.spawnFloatingText(relic.x, ry - 18, `+${relic.value || 60} 战利品孢子!`, '#FFD700', 1.3);
        fx.spawnParticles(relic.x, ry, 16, ['#FFD700', '#FFF1B8', '#FFA940'], 30, 90, 0.25, 0.5, 3);
      }
      platform.playSfx('sfx_upgrade');
    } else if (relic.kind === 'shield') {
      scene.economy.lives = Math.min(20, scene.economy.lives + 1);
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
      // 四叶草神种：立即提供 60 孢子能量 + 1 远古种子能量豆 + 全场狂暴！
      scene.economy.addSpores(60);
      scene.economy.seeds = Math.min(5, (scene.economy.seeds || 0) + 1);
      if (fx) {
        fx.spawnFloatingText(relic.x, ry - 18, '+60 能量 & +1 觉醒神种!', '#73D13D', 1.45);
        fx.spawnParticles(relic.x, ry, 22, ['#73D13D', '#D9F7BE', '#FFD700', '#52C41A'], 35, 95, 0.3, 0.6, 4);
      }
      platform.playSfx('sfx_upgrade');
    }
    platform.playSfx('sfx_coin');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(15); } catch (e) {}
    }
    if (typeof wx !== 'undefined' && wx.vibrateShort) {
      try { wx.vibrateShort({ type: 'medium' }); } catch (e) {}
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
      ctx.fillStyle = r.kind === 'shield' ? `rgba(82, 196, 26, ${glowAlpha})` : (r.kind === 'clover' ? `rgba(115, 209, 61, ${glowAlpha})` : `rgba(255, 215, 0, ${glowAlpha})`);
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

  /* --- js/game/relicArsenal.js --- */
  __modules['js/game/relicArsenal'] = function(require, module, exports) {
/**
 * Sporeguard - 远古遗物军械库与十二大传奇神器系统 (Ancient Relic Arsenal & Grove Artifacts)
 * 借鉴杀戮尖塔 / 怪物火车 / 铁甲神策的 Roguelite 战术神器构筑
 * 收集 12 件独一无二的苍翠林海远古圣物，触发强大的被动与主动增益
 */

const platform = require('../core/platform');

class RelicArsenalSystem {
  constructor() {
    this.relicDefinitions = {
      chlorophyll_prism: {
        id: 'chlorophyll_prism',
        nameKey: 'relic_prism_name',
        name: '叶绿晶棱镜',
        desc: '所有植物守卫射程提升 25%，并有 18% 几率破空穿透目标',
        icon: 'assets/vfx/relic_clover.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { rangeBonus: 0.25, pierceChance: 0.18 }
      },
      thunder_core: {
        id: 'thunder_core',
        nameKey: 'relic_thunder_name',
        name: '古雷木核晶',
        desc: '天候雷击频率翻倍，雷电击中潮湿敌人时触发超导电弧连锁',
        icon: 'assets/vfx/relic_lightning.png',
        rarity: 'epic',
        isUnlocked: true,
        stats: { thunderCooldownReduction: 0.5 }
      },
      amber_crown: {
        id: 'amber_crown',
        nameKey: 'relic_crown_name',
        name: '琥珀菌王冠',
        desc: '掉落金孢子价值提升 30%，英雄每秒持续自动再生 12 点生命值',
        icon: 'assets/vfx/relic_coin.png',
        rarity: 'legendary',
        isUnlocked: true,
        stats: { sporeBonus: 0.30, heroRegen: 12 }
      },
      clover_providence: {
        id: 'clover_providence',
        nameKey: 'relic_clover_name',
        name: '天命幸运四叶草',
        desc: '所有战塔与英雄攻击获得 22% 暴击率，造成 240% 致命暴击伤害',
        icon: 'assets/vfx/relic_clover.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { critChance: 0.22, critMultiplier: 2.4 }
      },
      silk_carapace: {
        id: 'silk_carapace',
        nameKey: 'relic_carapace_name',
        name: '黑曜蛛王坚甲',
        desc: '防御塔被蛛丝缠绕封印后，2.0秒内自动破茧反噬，反弹剧毒尖刺',
        icon: 'assets/vfx/vfx_web_cocoon.png',
        rarity: 'epic',
        isUnlocked: true,
        stats: { autoCleanseSec: 2.0 }
      },
      solar_vial: {
        id: 'solar_vial',
        nameKey: 'relic_solar_name',
        name: '日光日曜精魄瓶',
        desc: '日曜菇光合充能效果提升 40%，周围两格内防御塔常驻攻速 +30%',
        icon: 'assets/vfx/relic_lumina.png',
        rarity: 'epic',
        isUnlocked: true,
        stats: { auraAtkSpd: 0.30 }
      },
      heroic_standard: {
        id: 'heroic_standard',
        nameKey: 'relic_standard_name',
        name: '孢子近卫荣耀战旗',
        desc: '近卫巡逻军生命上限提升 50%，战阵重聚冷却时间缩短 50%',
        icon: 'assets/vfx/prop_rally_flag.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { guardHpBonus: 0.50, respawnCut: 0.5 }
      },
      deep_roots_charm: {
        id: 'deep_roots_charm',
        nameKey: 'relic_charm_name',
        name: '神木太古深根印',
        desc: '圣树生命种子上限 +3，任何逼近终点的怪物立刻受到 50% 现存血量重创',
        icon: 'assets/vfx/hero_oak.png',
        rarity: 'legendary',
        isUnlocked: true,
        stats: { extraSeeds: 3, breachPunishRatio: 0.50 }
      },
      glacial_tear: {
        id: 'glacial_tear',
        nameKey: 'relic_tear_name',
        name: '玄冰霜华之泪',
        desc: '迷雾孢子在地面凝结 4 秒冻土，敌人移动速度额外削减 40%',
        icon: 'assets/vfx/prop_dew.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { extraSlow: 0.40 }
      },
      volcanic_geode: {
        id: 'volcanic_geode',
        nameKey: 'relic_geode_name',
        name: '熔岩炽火晶核',
        desc: '爆裂重炮命中必定在地面遗留持续燃烧的熔岩火海，造成百分比最大生命灼烧',
        icon: 'assets/vfx/proj_burst_shell.png',
        rarity: 'epic',
        isUnlocked: true,
        stats: { burnRatio: 0.05 }
      },
      heart_of_groves: {
        id: 'heart_of_groves',
        nameKey: 'relic_heart_name',
        name: '苍翠圣林始源之心',
        desc: '全元素反应(烈焰/超导/极寒/爆轰/光合)波及范围扩大 45%，反应伤害提升 50%',
        icon: 'assets/vfx/item_awakening_seed.png',
        rarity: 'legendary',
        isUnlocked: true,
        stats: { reactionDmgBonus: 0.50, reactionAoeBonus: 0.45 }
      },
      windseeker_feather: {
        id: 'windseeker_feather',
        nameKey: 'relic_feather_name',
        name: '追风迅捷之羽',
        desc: '全军弹道飞行速度与英雄移速提升 35%，闪避敌方远程抛射物 25% 几率',
        icon: 'assets/vfx/proj_watch_arrow.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { speedBonus: 0.35, dodgeChance: 0.25 }
      }
    };

    this.equippedRelicIds = ['chlorophyll_prism', 'amber_crown', 'thunder_core', 'heart_of_groves'];
  }

  hasRelic(id) {
    return this.equippedRelicIds.includes(id);
  }

  getRelic(id) {
    return this.relicDefinitions[id] || null;
  }

  equipRelic(id) {
    if (this.relicDefinitions[id] && !this.equippedRelicIds.includes(id)) {
      this.equippedRelicIds.push(id);
      return true;
    }
    return false;
  }

  update(dt, scene) {
    // 琥珀王冠：英雄每秒自动回复
    if (this.hasRelic('amber_crown') && scene && scene.hero) {
      if (scene.hero.hp > 0 && scene.hero.hp < scene.hero.maxHp) {
        scene.hero.hp = Math.min(scene.hero.maxHp, scene.hero.hp + 12 * dt);
      }
    }

    // 黑曜蛛王甲：自动解救被封印的防御塔
    if (this.hasRelic('silk_carapace') && scene && scene.towerManager) {
      const tws = scene.towerManager.towers;
      for (let i = 0; i < tws.length; i++) {
        const t = tws[i];
        if (t.isWebbed) {
          t.webCleanseTimer = (t.webCleanseTimer || 0) + dt;
          if (t.webCleanseTimer >= 2.0) {
            t.isWebbed = false;
            t.webCleanseTimer = 0;
            if (scene.fx) {
              scene.fx.spawnDamageText(Math.round(t.x), Math.round(t.y - 18), '🛡️ 黑曜破茧反噬!', '#B37FEB');
              scene.fx.spawnRing(t.x, t.y, 70, '#D3ADF7', 0.4);
            }
          }
        } else {
          t.webCleanseTimer = 0;
        }
      }
    }
  }

  /**
   * 绘制顶部神器徽章状态栏
   */
  renderHudRelicBadges(ctx, startX, startY) {
    const bSize = 20;
    const gap = 3;

    ctx.save();
    for (let i = 0; i < this.equippedRelicIds.length; i++) {
      const rid = this.equippedRelicIds[i];
      const rDef = this.relicDefinitions[rid];
      if (!rDef) continue;

      const bx = startX + i * (bSize + gap);
      const by = startY;

      // 边框底色
      ctx.fillStyle = 'rgba(15, 20, 16, 0.88)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bSize, bSize, 4) : ctx.rect(bx, by, bSize, bSize);
      ctx.fill();

      // 神器稀有度高光金边
      ctx.strokeStyle = rDef.rarity === 'legendary' ? '#FFD700' : (rDef.rarity === 'epic' ? '#D3ADF7' : '#91D5FF');
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 图标
      const img = platform.getImage(rDef.icon);
      if (img && img.width) {
        ctx.drawImage(img, bx + 2, by + 2, bSize - 4, bSize - 4);
      }
    }
    ctx.restore();
  }
}

module.exports = RelicArsenalSystem;

  };

  /* --- js/game/elementalReactions.js --- */
  __modules['js/game/elementalReactions'] = function(require, module, exports) {
/**
 * Sporeguard - 元素共鸣与元素反应系统 (Elemental Reaction & Resonance System)
 * 深度融合自然法则：林木真菌(Dendro)、甘霖流水(Hydro)、雷木电弧(Electro)、炽烈熔火(Pyro)、玄冰霜雾(Cryo)、瘴气剧毒(Toxic)
 * 借鉴 Genshin / Hades / Kingdom Rush 的深度战术连携机制
 */

const platform = require('../core/platform');
const PALETTE = require('../data/palette');

class ElementalReactionSystem {
  constructor() {
    this.activeReactions = [];
    this.floatingBanners = [];
    this.chainArcs = [];
    this.stats = {
      totalReactions: 0,
      reactionDamage: 0,
      reactionCounts: {
        wildfire: 0,
        superconduct: 0,
        freeze: 0,
        detonation: 0,
        photosynthesis: 0,
        corrosion: 0
      }
    };
  }

  /**
   * 重置当前关卡元素状态
   */
  reset() {
    this.activeReactions.length = 0;
    this.floatingBanners.length = 0;
    this.chainArcs.length = 0;
  }

  /**
   * 对目标敌人施加元素并检测元素反应
   * @param {Object} enemy 目标敌人
   * @param {string} element 'pyro'|'hydro'|'electro'|'cryo'|'dendro'|'toxic'
   * @param {number} baseDmg 触发伤害
   * @param {Object} scene 战局场景上下文
   * @returns {Object|null} 反应结果
   */
  applyElement(enemy, element, baseDmg, scene) {
    if (!enemy || enemy.hp <= 0 || enemy.state === 'death') return null;
    if (this._isReacting) return null; // 杜绝连锁反应相互调用导致的死循环与指数级性能雪崩
    this._isReacting = true;
    try {

    if (enemy._reactCd && enemy._reactCd > 0) {
      if (enemy.elementalAuras) enemy.elementalAuras[element] = 6.0;
      return null;
    }

    if (!enemy.elementalAuras) {
      enemy.elementalAuras = {
        pyro: 0,
        hydro: 0,
        electro: 0,
        cryo: 0,
        dendro: 0,
        toxic: 0
      };
    }

    const auras = enemy.elementalAuras;
    let reactionResult = null;

    // 1. 【蔓延烈焰 Wildfire】: 烈火(Pyro) + 真菌草木(Dendro)
    if ((element === 'pyro' && auras.dendro > 0) || (element === 'dendro' && auras.pyro > 0)) {
      auras.dendro = 0;
      auras.pyro = 0;
      reactionResult = this.triggerWildfire(enemy, baseDmg, scene);
    }
    // 2. 【超导电弧 Superconduct Arc】: 甘霖水泽(Hydro) + 惊雷电弧(Electro)
    else if ((element === 'hydro' && auras.electro > 0) || (element === 'electro' && auras.hydro > 0)) {
      auras.hydro = 0;
      auras.electro = 0;
      reactionResult = this.triggerSuperconduct(enemy, baseDmg, scene);
    }
    // 3. 【极寒冰华 Glacial Freeze】: 甘霖水泽(Hydro) + 霜雾玄冰(Cryo)
    else if ((element === 'hydro' && auras.cryo > 0) || (element === 'cryo' && auras.hydro > 0)) {
      auras.hydro = 0;
      auras.cryo = 0;
      reactionResult = this.triggerGlacialFreeze(enemy, baseDmg, scene);
    }
    // 4. 【剧毒粉尘爆轰 Volatile Detonation】: 烈火(Pyro) + 瘴气剧毒(Toxic)
    else if ((element === 'pyro' && auras.toxic > 0) || (element === 'toxic' && auras.pyro > 0)) {
      auras.pyro = 0;
      auras.toxic = 0;
      reactionResult = this.triggerToxicDetonation(enemy, baseDmg, scene);
    }
    // 5. 【光合充能 Photosynthesis Surge】: 甘霖水泽(Hydro) + 真菌草木(Dendro)
    else if ((element === 'hydro' && auras.dendro > 0) || (element === 'dendro' && auras.hydro > 0)) {
      auras.hydro = 0;
      auras.dendro = 0;
      reactionResult = this.triggerPhotosynthesis(enemy, baseDmg, scene);
    }
    // 6. 【腐蚀破甲 Corrosion Rupture】: 惊雷(Electro) + 剧毒(Toxic)
    else if ((element === 'electro' && auras.toxic > 0) || (element === 'toxic' && auras.electro > 0)) {
      auras.electro = 0;
      auras.toxic = 0;
      reactionResult = this.triggerCorrosion(enemy, baseDmg, scene);
    }
    // 未发生反应，附着该元素并维持 6.0 秒
    else {
      auras[element] = 6.0;
    }

    if (reactionResult) {
      enemy._reactCd = 2.6;
    }

    return reactionResult;
    } finally {
      this._isReacting = false;
    }
  }

  /**
   * 反应 1：蔓延烈焰
   */
  triggerWildfire(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.15 + 35);
    this.recordReaction('wildfire', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'fire');
    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `-${dmg}`, '#FF4D4F');
      scene.fx.spawnRing(enemy.x, enemy.y, 65, '#FF7A45', 0.45);
    }
    platform.playSfx('sfx_boom');

    // 溅射点燃周围 72px 内最多 4 名敌军
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies();
      let hits = 0;
      for (let i = 0; i < list.length && hits < 4; i++) {
        const other = list[i];
        if (other !== enemy && Math.hypot(other.x - enemy.x, other.y - enemy.y) <= 72) {
          other.burnTimer = 3.0;
          other.burnDps = 18;
          other.takeDamage(Math.round(dmg * 0.45), null, 'fire');
          hits++;
        }
      }
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 蔓延烈焰 ✦', '#FF7A45');
    return { name: 'wildfire', damage: dmg };
  }

  /**
   * 反应 2：超导电弧 (连锁闪电)
   */
  triggerSuperconduct(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.15 + 45);
    this.recordReaction('superconduct', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'shock');
    enemy.armorReduction = Math.max(enemy.armorReduction || 0, 0.35); // 削减 35% 护甲
    platform.playSfx('sfx_shock');

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `-${dmg}`, '#40A9FF');
      scene.fx.spawnRing(enemy.x, enemy.y, 75, '#69C0FF', 0.4);
    }

    // 寻找最多 3 个最近敌人连锁跳跃（O(N) 范围单次遍历，杜绝昂贵排序与内存开销）
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies();
      let jumps = 0;
      let lastX = enemy.x, lastY = enemy.y;

      for (let j = 0; j < list.length && jumps < 3; j++) {
        const next = list[j];
        if (next === enemy || next.state === 'death' || next.hp <= 0) continue;
        const d2 = (next.x - enemy.x) * (next.x - enemy.x) + (next.y - enemy.y) * (next.y - enemy.y);
        if (d2 <= 120 * 120) {
          const chainDmg = Math.round(dmg * 0.55);
          next.hp -= chainDmg;
          next.whiteFlashFrames = 2;
          next.armorReduction = Math.max(next.armorReduction || 0, 0.30);
          if (next.hp <= 0) {
            scene.enemyManager.killEnemy(next, scene.fx);
          }

          if (this.chainArcs.length < 8) {
            this.chainArcs.push({
              x1: lastX,
              y1: lastY,
              x2: next.x,
              y2: next.y,
              life: 0.25,
              maxLife: 0.25
            });
          }
          lastX = next.x;
          lastY = next.y;
          jumps++;
        }
      }
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 超导电弧 ✦', '#40A9FF');
    return { name: 'superconduct', damage: dmg };
  }

  /**
   * 反应 3：极寒冰华 (深度冰冻与碎冰斩)
   */
  triggerGlacialFreeze(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.1 + 30);
    this.recordReaction('freeze', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'frost');
    enemy.freezeTimer = 1.6; // 深度冰冻 1.6 秒
    enemy.isDeepFrozen = true;
    platform.playSfx('sfx_mist');

    if (scene && scene.fx) {
      scene.fx.spawnRing(enemy.x, enemy.y, 60, '#87E8DE', 0.5);
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 极寒冰华 ✦', '#36CFC9');
    return { name: 'freeze', damage: dmg };
  }

  /**
   * 反应 4：剧毒粉尘爆轰
   */
  triggerToxicDetonation(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.25 + 60);
    this.recordReaction('detonation', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'poison');
    platform.playSfx('sfx_boom');

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `-${dmg}`, '#A0D911');
      scene.fx.spawnRing(enemy.x, enemy.y, 80, '#BAE637', 0.55);
      scene.fx.triggerScreenShake(3.2, 0.28);
    }

    // 生成范围腐蚀酸雾陷阱
    if (scene && scene.bulletManager) {
      scene.bulletManager.spawnHazard({
        kind: 'acid',
        x: enemy.x,
        y: enemy.y,
        radiusPx: 48,
        duration: 4.0,
        dps: 22
      });
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 剧毒爆轰 ✦', '#A0D911');
    return { name: 'detonation', damage: dmg };
  }

  /**
   * 反应 5：光合充能 (精选黄金孢子爆发与邻近超频)
   */
  triggerPhotosynthesis(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.1 + 25);
    this.recordReaction('photosynthesis', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'nature');
    platform.playSfx('sfx_coin');

    // 凝结 1 枚高阶黄金能量孢子 (8孢子，场上上限 8 枚避免堆叠遮挡)
    if (scene && scene.sporeDropManager && scene.sporeDropManager.drops.length < 8) {
      scene.sporeDropManager.spawnDrop(enemy.x, enemy.y, 8, true, 24);
    }

    // 强化周围 96px 防御塔 2.6 秒攻击速度
    if (scene && scene.towerManager) {
      const tws = scene.towerManager.towers;
      for (let i = 0; i < tws.length; i++) {
        const t = tws[i];
        if (Math.hypot(t.x - enemy.x, t.y - enemy.y) <= 96) {
          t.superchargeTimer = Math.max(t.superchargeTimer || 0, 2.6);
        }
      }
    }

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `-${dmg}`, '#FFD666');
      scene.fx.spawnRing(enemy.x, enemy.y, 70, '#FFF566', 0.45);
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 光合充能 ✦', '#FFD666');
    return { name: 'photosynthesis', damage: dmg };
  }

  /**
   * 反应 6：腐蚀破甲
   */
  triggerCorrosion(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.5 + 75);
    this.recordReaction('corrosion', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'shock');
    enemy.armorReduction = 0.60; // 破甲 60%
    enemy.poisonTimer = 5.0;
    enemy.poisonDps = 35;
    platform.playSfx('sfx_thorn');

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `-${dmg}`, '#B37FEB');
      scene.fx.spawnRing(enemy.x, enemy.y, 70, '#D3ADF7', 0.45);
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 腐蚀破甲 ✦', '#B37FEB');
    return { name: 'corrosion', damage: dmg };
  }

  recordReaction(type, dmg) {
    this.stats.totalReactions++;
    this.stats.reactionDamage += dmg;
    if (this.stats.reactionCounts[type] !== undefined) {
      this.stats.reactionCounts[type]++;
    }
  }

  addFloatingBanner(x, y, text, color) {
    if (this.floatingBanners.length >= 3) return; // 限制屏幕并发横幅数量
    this.floatingBanners.push({
      x,
      y,
      text,
      color,
      timer: 0,
      duration: 1.1,
      vy: -22
    });
  }

  update(dt, scene) {
    // 1. 更新电弧连线生命周期
    for (let i = this.chainArcs.length - 1; i >= 0; i--) {
      const arc = this.chainArcs[i];
      arc.life -= dt;
      if (arc.life <= 0) {
        this.chainArcs.splice(i, 1);
      }
    }

    // 2. 更新悬浮反应徽标
    for (let i = this.floatingBanners.length - 1; i >= 0; i--) {
      const b = this.floatingBanners[i];
      b.timer += dt;
      b.y += b.vy * dt;
      b.vy += 12 * dt; // 减速上升
      if (b.timer >= b.duration) {
        this.floatingBanners.splice(i, 1);
      }
    }

    // 3. 衰减敌军身上的元素附着与内置冷却
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (e._reactCd > 0) e._reactCd = Math.max(0, e._reactCd - dt);
        if (e.elementalAuras) {
          const a = e.elementalAuras;
          if (a.pyro > 0) a.pyro = Math.max(0, a.pyro - dt);
          if (a.hydro > 0) a.hydro = Math.max(0, a.hydro - dt);
          if (a.electro > 0) a.electro = Math.max(0, a.electro - dt);
          if (a.cryo > 0) a.cryo = Math.max(0, a.cryo - dt);
          if (a.dendro > 0) a.dendro = Math.max(0, a.dendro - dt);
          if (a.toxic > 0) a.toxic = Math.max(0, a.toxic - dt);
        }

        // 深度冰冻状态检测
        if (e.freezeTimer > 0) {
          e.freezeTimer -= dt;
          if (e.freezeTimer <= 0) {
            e.isDeepFrozen = false;
          }
        }
      }
    }
  }

  render(ctx, animTimeSec) {
    // 1. 渲染雷木元素电弧与超导共鸣（100% AI 手绘粒子与电光灵核，彻底废除直条折线与生硬激光）
    if (this.chainArcs.length > 0) {
      const sparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
      const lightImg = platform.getImage('assets/vfx/relic_lightning.png');
      const sporeImg = platform.getImage('assets/vfx/item_golden_spore.png');

      ctx.save();
      for (let i = 0; i < this.chainArcs.length; i++) {
        const arc = this.chainArcs[i];
        const alpha = Math.max(0, arc.life / arc.maxLife);
        const midX = (arc.x1 + arc.x2) * 0.5 + Math.sin(animTimeSec * 18 + i) * 12;
        const midY = (arc.y1 + arc.y2) * 0.5 + Math.cos(animTimeSec * 18 + i) * 10 - 6;

        // (A) 超导能量流柔和外晕曲线（自然贝塞尔弧形，绝无直条生硬感）
        ctx.strokeStyle = 'rgba(105, 192, 255, ' + (alpha * 0.85) + ')';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);
        ctx.quadraticCurveTo(midX, midY, arc.x2, arc.y2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(186, 231, 255, ' + alpha + ')';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);
        ctx.quadraticCurveTo(midX, midY, arc.x2, arc.y2);
        ctx.stroke();

        // (B) 闪电焦点 AI 灵光手绘
        if (lightImg && lightImg.width) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.90;
          ctx.drawImage(lightImg, midX - 10, midY - 10, 20, 20);
          ctx.restore();
        }

        // (C) 起点与终点 AI 手绘冲击火花 (100% AI Hand-Painted Hit Sparks)
        if (sparkImg && sparkImg.width) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.85;
          const spkSize = 22;
          ctx.drawImage(sparkImg, arc.x1 - spkSize * 0.5, arc.y1 - spkSize * 0.5, spkSize, spkSize);
          ctx.drawImage(sparkImg, arc.x2 - spkSize * 0.5, arc.y2 - spkSize * 0.5, spkSize, spkSize);
          ctx.restore();
        }
      }
      ctx.restore();
    }

    // 2. 渲染元素反应华丽悬浮称号徽标
    if (this.floatingBanners.length > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < this.floatingBanners.length; i++) {
        const b = this.floatingBanners[i];
        const prog = b.timer / b.duration;
        const alpha = prog < 0.2 ? (prog / 0.2) : (1 - (prog - 0.2) / 0.8);
        const scale = prog < 0.2 ? (0.6 + (prog / 0.2) * 0.4) : (1.0 + (prog - 0.2) * 0.15);

        ctx.save();
        ctx.translate(Math.round(b.x), Math.round(b.y));
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        // 黑色柔和底光
        ctx.font = 'bold 13px "Microsoft YaHei UI", "PingFang SC", sans-serif';
        ctx.strokeStyle = 'rgba(15, 20, 18, 0.92)';
        ctx.lineWidth = 3.2;
        ctx.strokeText(b.text, 0, 0);

        // 华丽元素色
        ctx.fillStyle = b.color;
        ctx.fillText(b.text, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }
  }
}

module.exports = ElementalReactionSystem;
  };

  /* --- js/game/heroSkills.js --- */
  __modules['js/game/heroSkills'] = function(require, module, exports) {
/**
 * Sporeguard - 英雄战技与奥义连招系统 (Hero Tactical Skills & Awakening Mastery)
 * 为橡木守护者·奥克注入成熟战术微操：[Q] 巨木横扫、[W] 荆棘木肤、[E] 庇护根脉、[R] 自然之怒觉醒
 * 参考 Kingdom Rush 英雄战技系统与魔兽争霸微操体验
 */

const platform = require('../core/platform');
const PALETTE = require('../data/palette');

class HeroSkillSystem {
  constructor(hero) {
    this.hero = hero;
    this.skills = {
      cleave: {
        id: 'cleave',
        nameKey: 'skill_cleave_name',
        hotkey: 'Q',
        cd: 7.0,
        timer: 0,
        cost: 0,
        rangePx: 90,
        damage: 220,
        color: '#73D13D',
        iconVfx: 'assets/vfx/vfx_hero_slash.png'
      },
      barkShield: {
        id: 'barkShield',
        nameKey: 'skill_bark_name',
        hotkey: 'W',
        cd: 12.0,
        timer: 0,
        cost: 0,
        duration: 6.0,
        activeTimer: 0,
        healRatio: 0.25,
        color: '#FAAD14',
        iconVfx: 'assets/vfx/relic_shield.png'
      },
      roots: {
        id: 'roots',
        nameKey: 'skill_roots_name',
        hotkey: 'E',
        cd: 16.0,
        timer: 0,
        cost: 0,
        radiusPx: 130,
        duration: 3.2,
        damage: 140,
        color: '#52C41A',
        iconVfx: 'assets/vfx/vfx_spikes.png'
      },
      awakening: {
        id: 'awakening',
        nameKey: 'skill_awakening_name',
        hotkey: 'R',
        cd: 30.0,
        timer: 0,
        cost: 0,
        duration: 10.0,
        activeTimer: 0,
        color: '#FF4D4F',
        iconVfx: 'assets/vfx/hero_oak.png'
      }
    };

    this.activeVfx = [];
    this.skillHotspots = [];
  }

  reset() {
    for (const key in this.skills) {
      const sk = this.skills[key];
      sk.timer = 0;
      if (sk.activeTimer) sk.activeTimer = 0;
    }
    this.activeVfx.length = 0;
  }

  /**
   * 触发英雄战技
   * @param {string} skillId 'cleave'|'barkShield'|'roots'|'awakening'
   * @param {Object} scene 场景上下文
   * @returns {boolean} 是否成功施法
   */
  castSkill(skillId, scene) {
    const sk = this.skills[skillId];
    if (!sk) return false;
    if (sk.timer > 0) {
      if (scene && scene.fx) {
        scene.fx.spawnDamageText(Math.round(this.hero.x), Math.round(this.hero.y - 36), `冷却中: ${Math.ceil(sk.timer)}s`, '#FFA39E');
      }
      return false;
    }

    if (this.hero.hp <= 0) return false;

    sk.timer = sk.cd;

    if (skillId === 'cleave') {
      return this.executeCleave(scene);
    } else if (skillId === 'barkShield') {
      return this.executeBarkShield(scene);
    } else if (skillId === 'roots') {
      return this.executeRoots(scene);
    } else if (skillId === 'awakening') {
      return this.executeAwakening(scene);
    }
    return false;
  }

  /**
   * Q技能：巨木横扫 (180度半月形强力物理挥击，击退并击晕)
   */
  executeCleave(scene) {
    const hx = this.hero.x;
    const hy = this.hero.y;
    const facing = this.hero.facingLeft ? -1 : 1;

    platform.playSfx('sfx_shoot');
    platform.playSfx('sfx_thorn');

    if (scene && scene.fx) {
      scene.fx.triggerScreenShake(3.0, 0.25);
    }

    // 记录华丽 AI 剑气挥砍
    this.activeVfx.push({
      type: 'cleave',
      x: hx + facing * 24,
      y: hy - 8,
      facing: facing,
      timer: 0,
      duration: 0.35,
      radius: 95
    });

    let hitCount = 0;
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        const dist = Math.hypot(e.x - hx, e.y - hy);
        if (dist <= 100) {
          // 判定处于英雄面朝方向的半圆内
          const dirX = e.x - hx;
          if (dirX * facing >= -15) {
            e.takeDamage(this.skills.cleave.damage, scene.fx, 'physical');
            e.stunTimer = Math.max(e.stunTimer || 0, 1.2);
            // 物理后退击退
            e.x += facing * 26;
            hitCount++;
          }
        }
      }
    }

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(hx), Math.round(hy - 42), `⚔️ 巨木横扫! (${hitCount}命中)`, '#95DE64');
    }
    return true;
  }

  /**
   * W技能：荆棘木肤 (6秒内60%减伤，180%反伤，回复25%生命)
   */
  executeBarkShield(scene) {
    const sk = this.skills.barkShield;
    sk.activeTimer = sk.duration;

    const healAmount = Math.round(this.hero.maxHp * sk.healRatio);
    this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + healAmount);

    platform.playSfx('sfx_build');
    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(this.hero.x), Math.round(this.hero.y - 42), `🛡️ 荆棘木肤! +${healAmount}HP`, '#FFD666');
      scene.fx.spawnRing(this.hero.x, this.hero.y, 80, '#FFC069', 0.6);
    }
    return true;
  }

  /**
   * E技能：庇护根脉 (古树根系破土而出，全域缠绕定身)
   */
  executeRoots(scene) {
    const hx = this.hero.x;
    const hy = this.hero.y;
    const radius = this.skills.roots.radiusPx;

    platform.playSfx('sfx_thorn');
    platform.playSfx('sfx_boom');

    this.activeVfx.push({
      type: 'roots',
      x: hx,
      y: hy,
      radius: radius,
      timer: 0,
      duration: 1.2
    });

    let count = 0;
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (Math.hypot(e.x - hx, e.y - hy) <= radius) {
          e.takeDamage(this.skills.roots.damage, scene.fx, 'nature');
          e.rootTimer = Math.max(e.rootTimer || 0, this.skills.roots.duration);
          count++;
        }
      }
    }

    if (scene && scene.fx) {
      scene.fx.triggerScreenShake(4.5, 0.4);
      scene.fx.spawnDamageText(Math.round(hx), Math.round(hy - 42), `🌿 庇护根脉! 缠绕${count}敌`, '#73D13D');
    }
    return true;
  }

  /**
   * R终极奥义：自然之怒觉醒 (化身远古神树泰坦，攻速翻倍，全图卫士嗜血暴走)
   */
  executeAwakening(scene) {
    const sk = this.skills.awakening;
    sk.activeTimer = sk.duration;

    platform.playSfx('sfx_win');
    platform.playSfx('sfx_upgrade');

    if (scene && scene.fx) {
      scene.fx.triggerScreenShake(6.0, 0.6);
      scene.fx.spawnDamageText(Math.round(this.hero.x), Math.round(this.hero.y - 48), `🌟 自然之怒觉醒! 泰坦暴走`, '#FF4D4F');
      scene.fx.showBanner('自然之怒·泰坦觉醒!', '#FF4D4F', '英雄攻速+80%，卫士全员狂暴', 2.0);
    }

    // 强化全图卫士
    if (scene && scene.sporelingPatrol) {
      const guards = scene.sporelingPatrol.guards || [];
      for (let i = 0; i < guards.length; i++) {
        guards[i].berserkTimer = 10.0;
      }
    }

    return true;
  }

  update(dt, scene) {
    // 1. 冷却计时器
    for (const key in this.skills) {
      const sk = this.skills[key];
      if (sk.timer > 0) {
        sk.timer = Math.max(0, sk.timer - dt);
      }
      if (sk.activeTimer > 0) {
        sk.activeTimer = Math.max(0, sk.activeTimer - dt);
      }
    }

    // 2. 更新战技特效
    for (let i = this.activeVfx.length - 1; i >= 0; i--) {
      const v = this.activeVfx[i];
      v.timer += dt;
      if (v.timer >= v.duration) {
        this.activeVfx.splice(i, 1);
      }
    }

    // 3. 荆棘反伤与减伤逻辑
    if (this.skills.barkShield.activeTimer > 0) {
      this.hero.damageReduction = 0.60; // 60% 减伤
      this.hero.thornReflect = 1.80;    // 180% 反伤
    } else {
      this.hero.damageReduction = 0;
      this.hero.thornReflect = 0;
    }

    // 4. 终极觉醒强化状态
    if (this.skills.awakening.activeTimer > 0) {
      this.hero.awakeningBoost = true;
    } else {
      this.hero.awakeningBoost = false;
    }
  }

  /**
   * 在战场地图层渲染技能地面特效
   */
  renderMapVfx(ctx) {
    if (this.activeVfx.length === 0) return;

    for (let i = 0; i < this.activeVfx.length; i++) {
      const v = this.activeVfx[i];
      const prog = v.timer / v.duration;

      if (v.type === 'cleave') {
        const slashImg = platform.getImage('assets/vfx/vfx_hero_slash.png');
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.scale(v.facing, 1);
        ctx.globalAlpha = Math.max(0, (1 - prog) * 0.95);
        const sSize = 90 + prog * 30;
        if (slashImg && slashImg.width) {
          ctx.drawImage(slashImg, -sSize * 0.5, -sSize * 0.5, sSize, sSize);
        } else {
          ctx.strokeStyle = '#95DE64';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, sSize * 0.5, -Math.PI * 0.35, Math.PI * 0.35);
          ctx.stroke();
        }
        ctx.restore();
      } else if (v.type === 'roots') {
        const spikeImg = platform.getImage('assets/vfx/vfx_spikes.png');
        ctx.save();
        ctx.globalAlpha = Math.max(0, (1 - prog) * 0.85);
        const rSize = v.radius * 2 * (0.6 + prog * 0.4);
        if (spikeImg && spikeImg.width) {
          ctx.drawImage(spikeImg, v.x - rSize * 0.5, v.y - rSize * 0.5 * 0.78, rSize, rSize * 0.78);
        }
        ctx.restore();
      }
    }
  }

  /**
   * 绘制英雄身侧高质感技能 HUD 控制条 (在战场左下角或英雄专属位置)
   */
  renderSkillActionBar(ctx, startX, startY) {
    this.skillHotspots.length = 0;
    const btnSize = 38;
    const gap = 8;
    const skillList = [this.skills.cleave, this.skills.barkShield, this.skills.roots, this.skills.awakening];

    ctx.save();
    for (let i = 0; i < skillList.length; i++) {
      const sk = skillList[i];
      const bx = startX + i * (btnSize + gap);
      const by = startY;

      this.skillHotspots.push({
        id: sk.id,
        x: bx,
        y: by,
        w: btnSize,
        h: btnSize
      });

      // 1. 底框投影与底纹
      ctx.fillStyle = 'rgba(15, 22, 18, 0.90)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, btnSize, btnSize, 8) : ctx.rect(bx, by, btnSize, btnSize);
      ctx.fill();

      // 2. 绘制技能 AI 图标
      const img = platform.getImage(sk.iconVfx);
      if (img && img.width) {
        ctx.drawImage(img, bx + 4, by + 4, btnSize - 8, btnSize - 8);
      }

      // 3. 激活状态华丽呼吸流光
      if (sk.activeTimer && sk.activeTimer > 0) {
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx - 1, by - 1, btnSize + 2, btnSize + 2, 8) : ctx.rect(bx - 1, by - 1, btnSize + 2, btnSize + 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = sk.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, btnSize, btnSize, 8) : ctx.rect(bx, by, btnSize, btnSize);
        ctx.stroke();
      }

      // 4. 冷却遮罩扇面
      if (sk.timer > 0) {
        const ratio = sk.timer / sk.cd;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, btnSize, btnSize, 8) : ctx.rect(bx, by, btnSize, btnSize);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.ceil(sk.timer)}s`, bx + btnSize * 0.5, by + btnSize * 0.5);
      }

      // 5. 键盘快捷键角标 [Q] [W] [E] [R]
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(sk.hotkey, bx + btnSize - 3, by + btnSize - 2);
    }
    ctx.restore();
  }

  handleClick(x, y, scene) {
    for (let i = 0; i < this.skillHotspots.length; i++) {
      const h = this.skillHotspots[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        return this.castSkill(h.id, scene);
      }
    }
    return false;
  }
}

module.exports = HeroSkillSystem;

  };

  /* --- js/game/combatAnalytics.js --- */
  __modules['js/game/combatAnalytics'] = function(require, module, exports) {
/**
 * Sporeguard - 实时战斗DPS与战报分析面板 (Real-time Combat Analytics & DPS Meter)
 * 参考魔兽世界 Details! / 刀塔自走棋战力统计 / Kingdom Rush 战后统计
 * 实时监测：各类防御塔伤害输出、英雄微操输出、元素反应爆轰贡献、击杀榜与DPS柱状图
 */

class CombatAnalyticsSystem {
  constructor() {
    this.isOpen = false;
    this.totalDamageDealt = 0;
    this.combatDuration = 0;
    this.highestSingleHit = { damage: 0, source: 'None' };

    // 各作战单元数据
    this.categoryStats = {
      watch: { name: '瞭望箭菇', damage: 0, kills: 0, color: '#69C0FF', icon: 'assets/vfx/proj_watch_arrow.png' },
      burst: { name: '爆裂重炮', damage: 0, kills: 0, color: '#FF7A45', icon: 'assets/vfx/proj_burst_shell.png' },
      thorn: { name: '刺棘地刺', damage: 0, kills: 0, color: '#95DE64', icon: 'assets/vfx/vfx_spikes.png' },
      mist: { name: '迷雾孢子', damage: 0, kills: 0, color: '#B37FEB', icon: 'assets/vfx/vfx_mist.png' },
      lumina: { name: '日曜金菇', damage: 0, kills: 0, color: '#FFD666', icon: 'assets/vfx/item_golden_spore.png' },
      hero: { name: '橡木守护者', damage: 0, kills: 0, color: '#52C41A', icon: 'assets/vfx/hero_oak.png' },
      sporelings: { name: '孢子近卫军', damage: 0, kills: 0, color: '#A0D911', icon: 'assets/vfx/sporeling_guard.png' },
      reactions: { name: '自然元素反应', damage: 0, kills: 0, color: '#FF4D4F', icon: 'assets/vfx/vfx_hit_spark.png' }
    };

    this.toggleBtnRect = { x: 118, y: 14, w: 64, h: 24 };
  }

  reset() {
    this.totalDamageDealt = 0;
    this.combatDuration = 0;
    this.highestSingleHit = { damage: 0, source: 'None' };

    for (const key in this.categoryStats) {
      this.categoryStats[key].damage = 0;
      this.categoryStats[key].kills = 0;
    }
  }

  /**
   * 记录伤害事件
   */
  recordDamage(sourceType, damage, isKill = false) {
    if (damage <= 0) return;
    this.totalDamageDealt += damage;

    if (damage > this.highestSingleHit.damage) {
      this.highestSingleHit.damage = damage;
      this.highestSingleHit.source = sourceType;
    }

    const cat = this.categoryStats[sourceType];
    if (cat) {
      cat.damage += damage;
      if (isKill) cat.kills++;
    }
  }

  update(dt) {
    this.combatDuration += dt;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    return this.isOpen;
  }

  /**
   * 绘制顶部战况面板开关按钮
   */
  renderToggleButton(ctx, x, y) {
    this.toggleBtnRect.x = x;
    this.toggleBtnRect.y = y;
    const w = this.toggleBtnRect.w;
    const h = this.toggleBtnRect.h;

    ctx.save();
    ctx.fillStyle = this.isOpen ? 'rgba(38, 92, 18, 0.94)' : 'rgba(28, 20, 12, 0.92)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 12) : ctx.rect(x, y, w, h);
    ctx.fill();

    ctx.strokeStyle = this.isOpen ? '#95DE64' : 'rgba(198, 143, 69, 0.78)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 229, 143, 0.28)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 10) : ctx.rect(x + 2, y + 2, w - 4, h - 4);
    ctx.stroke();

    ctx.fillStyle = this.isOpen ? '#F6FFED' : '#FFE58F';
    ctx.font = 'bold 10.5px "Microsoft YaHei UI", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.isOpen ? '✖ 战报' : '📊 战报', x + w * 0.5, y + h * 0.5);
    ctx.restore();
  }

  /**
   * 渲染弹出的高质感 DPS 战报仪表盘
   */
  renderAnalyticsDashboard(ctx) {
    if (!this.isOpen) return;

    const pw = 476;
    const ph = 336;
    const px = Math.round((960 - pw) * 0.5);
    const py = Math.round((540 - ph) * 0.5);

    ctx.save();
    // 1. 全屏半透明暗林遮罩（严格对齐 960x540 逻辑屏）
    ctx.fillStyle = 'rgba(6, 12, 8, 0.76)';
    ctx.fillRect(0, 0, 960, 540);

    // 2. 深木黄铜边框战报面板
    ctx.fillStyle = 'rgba(22, 16, 11, 0.96)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(px, py, pw, ph, 12) : ctx.rect(px, py, pw, ph);
    ctx.fill();

    ctx.strokeStyle = '#C68F45';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // 右上角关闭按钮 [×]（严密内收 14px 安全边距）
    const closeX = px + pw - 38;
    const closeY = py + 14;
    ctx.fillStyle = 'rgba(64, 38, 20, 0.92)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(closeX, closeY, 24, 24, 5) : ctx.rect(closeX, closeY, 24, 24);
    ctx.fill();
    ctx.strokeStyle = '#E6BB60';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#FFF1B8';
    ctx.font = 'bold 14px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeX + 12, closeY + 12);

    // 3. 标题与总览（纯中文无英文混杂）
    ctx.fillStyle = '#FFE58F';
    ctx.font = 'bold 15px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('实时战况与输出统计', px + 22, py + 26);

    const dps = this.combatDuration > 0 ? Math.round(this.totalDamageDealt / this.combatDuration) : 0;
    ctx.fillStyle = '#E8D8B8';
    ctx.font = '11.5px "Microsoft YaHei UI", sans-serif';
    ctx.fillText(`总伤：${this.totalDamageDealt.toLocaleString()}   |   全队秒伤：${dps}/秒   |   最高单击：${this.highestSingleHit.damage}`, px + 22, py + 49);

    // 4. 各单元伤害占比横向柱状图
    const sorted = Object.entries(this.categoryStats)
      .map(([k, v]) => ({ key: k, ...v }))
      .sort((a, b) => b.damage - a.damage);

    const maxDmg = Math.max(1, sorted[0].damage);
    const startY = py + 72;
    const rowH = 29;
    const barMaxW = 172;

    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      const ry = startY + i * rowH;

      // 单位名称
      ctx.fillStyle = item.color;
      ctx.font = 'bold 12px "Microsoft YaHei UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}. ${item.name}`, px + 22, ry + 13);

      // 槽位底色
      const barX = px + 138;
      const barY = ry + 6;
      const barW = Math.max(3, Math.round((item.damage / maxDmg) * barMaxW));
      const pct = this.totalDamageDealt > 0 ? ((item.damage / this.totalDamageDealt) * 100).toFixed(1) : '0.0';

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(barX, barY, barMaxW, 13, 4) : ctx.rect(barX, barY, barMaxW, 13);
      ctx.fill();

      // 伤害条
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(barX, barY, barW, 13, 4) : ctx.rect(barX, barY, barW, 13);
      ctx.fill();

      // 数值文本 (伤害 + 占比% + 击杀，右侧留足呼吸边距)
      ctx.fillStyle = '#FFFDF5';
      ctx.font = 'bold 10.5px "Microsoft YaHei UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.damage.toLocaleString()} (${pct}%) · ${item.kills} 击杀`, barX + barMaxW + 10, ry + 13, pw - 22 - (barX + barMaxW + 10 - px));
    }

    // 5. 底部关闭说明
    ctx.fillStyle = '#B8A88A';
    ctx.font = '11px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点击任意区域关闭战报面板', px + pw * 0.5, py + ph - 16);

    ctx.restore();
  }

  handleClick(x, y) {
    if (x >= this.toggleBtnRect.x && x <= this.toggleBtnRect.x + this.toggleBtnRect.w &&
        y >= this.toggleBtnRect.y && y <= this.toggleBtnRect.y + this.toggleBtnRect.h) {
      return this.toggle();
    }

    if (this.isOpen) {
      this.isOpen = false;
      return true;
    }
    return false;
  }
}

module.exports = CombatAnalyticsSystem;

  };

  /* --- js/game/tacticalTargeting.js --- */
  __modules['js/game/tacticalTargeting'] = function(require, module, exports) {
/**
 * 战术索敌指令与微操优先级系统 (js/game/tacticalTargeting.js)
 * 深度借鉴 Bloons TD 6 / Kingdom Rush 顶尖战术微操机制：
 * - 5 大战术索敌优先级 (Target Priorities):
 *   1. FIRST (先头) - 优先锁定距离基地终点最近的敌怪，守门核心
 *   2. LAST (殿后) - 优先锁定距离刷怪点最近的敌怪，阻截后队
 *   3. STRONGEST (强敌) - 优先锁定当前生命值最高或精英/首领怪，破甲攻坚
 *   4. WEAKEST (残血) - 优先斩杀生命值最低的濒死怪，快速减员
 *   5. FASTEST (急行) - 优先击杀移动速度最快的跳跃者/突进织网怪，防漏怪
 * - 塔身悬浮 AI 战术微标与交互切换
 * - 键盘快捷键 [Tab] 或 [P] 快速循环当前选中毒菇的战术模式
 */

const CONFIG = require('../data/config');
const platform = require('../core/platform');

const TARGET_MODES = [
  { id: 'first', name: '先头', desc: '优先攻击最靠近终点的敌怪', icon: '🎯', color: '#69C0FF' },
  { id: 'strongest', name: '强敌', desc: '优先攻击血量最高或首领怪', icon: '👑', color: '#FF7A45' },
  { id: 'weakest', name: '残血', desc: '优先斩杀濒死残血敌怪', icon: '🩸', color: '#FF4D4F' },
  { id: 'fastest', name: '急行', desc: '优先截杀高速突进与跳跃怪', icon: '⚡', color: '#FFD666' },
  { id: 'last', name: '殿后', desc: '优先攻击刚入场的后排敌怪', icon: '🛡️', color: '#95DE64' }
];

class TacticalTargetingSystem {
  constructor() {
    this.towerModes = new Map(); // towerUid -> modeId
    this.animTime = 0;
  }

  getMode(towerUid) {
    return this.towerModes.get(towerUid) || 'first';
  }

  setMode(towerUid, modeId) {
    if (TARGET_MODES.some(m => m.id === modeId)) {
      this.towerModes.set(towerUid, modeId);
      return true;
    }
    return false;
  }

  cycleMode(towerUid, fx = null, towerX = 0, towerY = 0) {
    const cur = this.getMode(towerUid);
    const curIdx = TARGET_MODES.findIndex(m => m.id === cur);
    const nextIdx = (curIdx + 1) % TARGET_MODES.length;
    const nextMode = TARGET_MODES[nextIdx];
    this.towerModes.set(towerUid, nextMode.id);

    if (fx && towerX && towerY) {
      fx.spawnFloatingText(towerX, towerY - 34, `${nextMode.icon} 索敌: ${nextMode.name}`, nextMode.color, 0.95);
    }
    platform.playSfx('sfx_click');
    return nextMode;
  }

  update(dt) {
    this.animTime += dt;
  }

  /**
   * 按照战术优先级从候选存活敌怪中精准决出唯一攻击目标
   */
  pickTarget(tower, candidates, map) {
    if (!candidates || candidates.length === 0) return null;
    const mode = this.getMode(tower.uid || `${tower.col}_${tower.row}`);

    if (candidates.length === 1) return candidates[0];

    if (mode === 'strongest') {
      // 优先首领/精英，其次按当前剩余生命值最高
      let best = candidates[0];
      let bestScore = (best.isBoss ? 100000 : 0) + (best.isElite ? 20000 : 0) + best.hp;
      for (let i = 1; i < candidates.length; i++) {
        const c = candidates[i];
        const score = (c.isBoss ? 100000 : 0) + (c.isElite ? 20000 : 0) + c.hp;
        if (score > bestScore) {
          bestScore = score;
          best = c;
        }
      }
      return best;
    }

    if (mode === 'weakest') {
      // 优先当前剩余生命值最低的怪，便于迅速斩杀减员
      let best = candidates[0];
      for (let i = 1; i < candidates.length; i++) {
        if (candidates[i].hp < best.hp) {
          best = candidates[i];
        }
      }
      return best;
    }

    if (mode === 'fastest') {
      // 优先移动速度最快的怪（如野兔、跳跃蛛怪、织网者）
      let best = candidates[0];
      let maxSpd = best.speed || best.def.baseSpeed || 50;
      if (best.isLeaping) maxSpd += 60;
      for (let i = 1; i < candidates.length; i++) {
        const c = candidates[i];
        let spd = c.speed || c.def.baseSpeed || 50;
        if (c.isLeaping) spd += 60;
        if (spd > maxSpd) {
          maxSpd = spd;
          best = c;
        }
      }
      return best;
    }

    if (mode === 'last') {
      // 离起点最近（路程进度最小）
      let best = candidates[0];
      let minProg = best.pathIndex !== undefined ? (best.pathIndex + (best.segmentProgress || 0)) : (best.totalDistanceTraveled || 0);
      for (let i = 1; i < candidates.length; i++) {
        const c = candidates[i];
        const prog = c.pathIndex !== undefined ? (c.pathIndex + (c.segmentProgress || 0)) : (c.totalDistanceTraveled || 0);
        if (prog < minProg) {
          minProg = prog;
          best = c;
        }
      }
      return best;
    }

    // 默认: 'first' (最靠近终点，路程进度最大)
    let best = candidates[0];
    let maxProg = best.pathIndex !== undefined ? (best.pathIndex + (best.segmentProgress || 0)) : (best.totalDistanceTraveled || 0);
    for (let i = 1; i < candidates.length; i++) {
      const c = candidates[i];
      const prog = c.pathIndex !== undefined ? (c.pathIndex + (c.segmentProgress || 0)) : (c.totalDistanceTraveled || 0);
      if (prog > maxProg) {
        maxProg = prog;
        best = c;
      }
    }
    return best;
  }

  /**
   * 绘制选中毒菇上方的战术指令微标与交互按钮
   */
  renderSelectedTacticalBadge(ctx, tower, isHovered = false) {
    if (!tower) return;
    const modeId = this.getMode(tower.uid || `${tower.col}_${tower.row}`);
    const mode = TARGET_MODES.find(m => m.id === modeId) || TARGET_MODES[0];

    const cx = tower.x;
    const cy = tower.y - 28;
    const pulse = 0.9 + Math.sin(this.animTime * 6) * 0.1;

    ctx.save();
    // 1. 战术底座微框
    const bw = 58;
    const bh = 18;
    const bx = cx - bw * 0.5;
    const by = cy - bh * 0.5;

    ctx.fillStyle = 'rgba(18, 12, 6, 0.90)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 6) : ctx.rect(bx, by, bw, bh);
    ctx.fill();

    ctx.strokeStyle = mode.color;
    ctx.lineWidth = isHovered ? 2.0 : 1.2;
    ctx.stroke();

    // 2. 战术模式图标与文字
    ctx.font = 'bold 10px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = mode.color;
    ctx.fillText(`${mode.icon} ${mode.name}`, cx, cy);

    // 3. 悬停或交互提示光标
    if (isHovered) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px sans-serif';
      ctx.fillText('点击切换', cx, cy - 14);
    }
    ctx.restore();
  }
}

module.exports = {
  TacticalTargetingSystem,
  TARGET_MODES
};

  };

  /* --- js/game/combatJuice.js --- */
  __modules['js/game/combatJuice'] = function(require, module, exports) {
/**
 * 战地打击感与视觉爽快度引擎 (js/game/combatJuice.js)
 * 学习《死亡细胞》(Dead Cells) 与《王国保卫战》(Kingdom Rush) 的顶级游戏质感：
 * - 动态屏幕震动 (Directional Screen Trauma & Camera Shake):
 *   支持爆炸重创、首领猛击、圣树大招等差异化震颤与指数衰减
 * - 暴击黄金爆发与浮空弹跳数字 (Dynamic Critical Flares & Bouncing Numbers)
 * - 战役连击评分系统 (Combat Streak & Battle Rank S/A/B/C)
 * - 巨兽践踏与法术着陆的有机尘土环 (Organic Dust Shockwaves)
 */

const platform = require('../core/platform');

class CombatJuiceEngine {
  constructor() {
    this.trauma = 0; // 0..1, 震动烈度
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeAngle = 0;

    // 连击计数与战斗评分
    this.killStreak = 0;
    this.streakTimer = 0;
    this.maxStreak = 0;
    this.battleScore = 0;
    this.currentRank = 'D';

    // 预分配固定对象池（0 GC 垃圾回收，消除内存抖动卡顿）
    this.critSparks = [];
    for (let i = 0; i < 32; i++) {
      this.critSparks.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0.35, size: 3, color: '#FFD700', active: false });
    }
    this.shockwaves = [];
    for (let i = 0; i < 8; i++) {
      this.shockwaves.push({ x: 0, y: 0, currentRadius: 0, maxRadius: 45, color: '', life: 0, maxLife: 0.4, active: false });
    }
  }

  reset() {
    this.trauma = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeAngle = 0;
    this.killStreak = 0;
    this.streakTimer = 0;
    this.maxStreak = 0;
    this.battleScore = 0;
    this.currentRank = 'D';
    this.critSparks.length = 0;
    this.shockwaves.length = 0;
  }

  /**
   * 添加震颤创伤值 (0.1 ~ 0.8)
   */
  addTrauma(amount, dirX = 0, dirY = 0) {
    this.trauma = Math.min(1.0, this.trauma + amount);
    if (dirX !== 0 || dirY !== 0) {
      const len = Math.hypot(dirX, dirY) || 1;
      this.shakeOffsetX += (dirX / len) * amount * 12;
      this.shakeOffsetY += (dirY / len) * amount * 12;
    }
  }

  /**
   * 触发暴击高光震颤
   */
  triggerCrit(x, y, damage, fx = null) {
    this.addTrauma(0.18);
    // 零分配复用粒子池
    let spawned = 0;
    for (let i = 0; i < this.critSparks.length && spawned < 6; i++) {
      const sp = this.critSparks[i];
      if (!sp.active) {
        const ang = (spawned / 6) * Math.PI * 2;
        const spd = 45 + Math.random() * 60;
        sp.x = x;
        sp.y = y;
        sp.vx = Math.cos(ang) * spd;
        sp.vy = Math.sin(ang) * spd;
        sp.life = 0.28;
        sp.maxLife = 0.28;
        sp.size = 2.8;
        sp.color = spawned % 2 === 0 ? '#FFD700' : '#FFF1B8';
        sp.active = true;
        spawned++;
      }
    }

    // 金色星芒火花由本系统负责，真实折算后暴击数值由 enemy.applyDirectDamage 统一飘字，避免同次命中双倍叠字
  }

  /**
   * 触发着陆或大爆炸环状冲击波
   */
  triggerShockwave(x, y, maxRadius = 45, color = 'rgba(255, 235, 140, 0.75)') {
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) {
        sw.x = x;
        sw.y = y;
        sw.currentRadius = 6;
        sw.maxRadius = maxRadius;
        sw.color = color;
        sw.life = 0.32;
        sw.maxLife = 0.32;
        sw.active = true;
        break;
      }
    }
    this.addTrauma(0.25);
  }

  /**
   * 击杀递增连击计数
   */
  recordKill(threat = 1) {
    this.killStreak++;
    this.streakTimer = 3.5; // 3.5秒内保持连击
    if (this.killStreak > this.maxStreak) {
      this.maxStreak = this.killStreak;
    }
    this.battleScore += threat * 10 * Math.min(5, 1 + Math.floor(this.killStreak / 5));

    // 更新评级
    if (this.killStreak >= 30) this.currentRank = 'S';
    else if (this.killStreak >= 18) this.currentRank = 'A';
    else if (this.killStreak >= 8) this.currentRank = 'B';
    else if (this.killStreak >= 3) this.currentRank = 'C';
    else this.currentRank = 'D';
  }

  update(dt) {
    // 1. 屏幕震动创伤衰减 (平滑多项式衰减)
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
      const shakePower = this.trauma * this.trauma; // 平方衰减更加平滑柔顺
      const maxShakePx = 10;
      this.shakeOffsetX = (Math.random() * 2 - 1) * maxShakePx * shakePower;
      this.shakeOffsetY = (Math.random() * 2 - 1) * maxShakePx * shakePower;
      this.shakeAngle = (Math.random() * 2 - 1) * 0.02 * shakePower;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeAngle = 0;
    }

    // 2. 连击计时器衰减
    if (this.streakTimer > 0) {
      this.streakTimer -= dt;
      if (this.streakTimer <= 0) {
        this.killStreak = 0;
      }
    }

    // 3. 暴击火花粒子更新（无 splice 零开销）
    for (let i = 0; i < this.critSparks.length; i++) {
      const sp = this.critSparks[i];
      if (!sp.active) continue;
      sp.life -= dt;
      if (sp.life <= 0) {
        sp.active = false;
        continue;
      }
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 50 * dt;
      sp.vx *= 0.92;
    }

    // 4. 冲击波更新（无 splice 零开销）
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      sw.life -= dt;
      if (sw.life <= 0) {
        sw.active = false;
        continue;
      }
      const prog = 1 - (sw.life / sw.maxLife);
      sw.currentRadius = sw.maxRadius * Math.sin(prog * Math.PI * 0.5);
    }
  }

  /**
   * 应用屏幕震动变换 (在场景绘制前调用)
   */
  applyScreenShake(ctx) {
    if (this.trauma > 0.01) {
      ctx.translate(Math.round(this.shakeOffsetX), Math.round(this.shakeOffsetY));
      if (Math.abs(this.shakeAngle) > 0.001) {
        ctx.rotate(this.shakeAngle);
      }
    }
  }

  /**
   * 绘制战斗特效层 (暴击火花、冲击波与连击小挂件)
   */
  renderFx(ctx) {
    // 1. 冲击波渲染
    if (this.shockwaves.length > 0) {
      ctx.save();
      for (let i = 0; i < this.shockwaves.length; i++) {
        const sw = this.shockwaves[i];
        if (!sw.active) continue;
        const alpha = Math.max(0, sw.life / sw.maxLife);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 2.5 * alpha;
        ctx.beginPath();
        ctx.ellipse(sw.x, sw.y, sw.currentRadius, sw.currentRadius * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. 暴击金辉星芒
    if (this.critSparks.length > 0) {
      ctx.save();
      for (let i = 0; i < this.critSparks.length; i++) {
        const sp = this.critSparks[i];
        if (!sp.active) continue;
        const alpha = Math.max(0, sp.life / sp.maxLife);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /**
   * 绘制战役连击评分挂件 (位于右上角控制栏下方，微型不抢眼)
   */
  renderStreakWidget(ctx) {
    if (this.killStreak < 3) return;

    ctx.save();
    const wx = 880;
    const wy = 56;
    const pulse = 1.0 + Math.sin(this.streakTimer * 8) * 0.08;

    ctx.translate(wx, wy);
    ctx.scale(pulse, pulse);

    // 连击气泡
    ctx.fillStyle = 'rgba(25, 18, 12, 0.88)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-42, -12, 84, 24, 6) : ctx.rect(-42, -12, 84, 24);
    ctx.fill();

    const rankColors = { S: '#FF4D4F', A: '#FF7A45', B: '#FFD666', C: '#95DE64', D: '#BAE7FF' };
    ctx.strokeStyle = rankColors[this.currentRank] || '#FFD666';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = rankColors[this.currentRank] || '#FFD666';
    ctx.font = 'bold 11px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.killStreak} 连杀 [${this.currentRank}]`, 0, 0);

    ctx.restore();
  }
}

module.exports = CombatJuiceEngine;

  };

  /* --- js/game/mushroomMastery.js --- */
  __modules['js/game/mushroomMastery'] = function(require, module, exports) {
/**
 * 远古菌族精通专精与古木天赋树系统 (js/game/mushroomMastery.js)
 * 深度汲取《王国保卫战》(Kingdom Rush) 英雄星级天赋与《植物大战僵尸2》植物家族专精精髓：
 * - 5 大蘑菇守卫专属远古精通树 (3 阶递进战术天赋):
 *   1. 瞭望箭菇: 鹰眼洞悉 (射程+25%/破隐) -> 双重离弦 (22%连射) -> 破风碎甲 (贯穿破甲)
 *   2. 迷雾孢子: 蚀骨瘴气 (滞留+40%/腐蚀) -> 剧毒裂变 (击杀死灵毒爆) -> 迟缓深渊 (50%深度泥潭)
 *   3. 刺棘地刺: 铁棘倒钩 (流血创伤) -> 扇形刺浪 (5向广角齐射) -> 扎根陷阵 (强袭定身截击)
 *   4. 爆裂重炮: 巨型爆轰 (范围+35%/击退) -> 母子散弹 (3枚子母雷次生破片) -> 炽炎焦土 (地面灼烧)
 *   5. 日曜金菇: 日光滋养 (3格攻速光环) -> 圣光致盲 (全场失准目眩) -> 神圣复苏 (巨量孢子+英雄回血)
 * - 与局内战术完全融汇：升级点数由波次三星通关与远古神圣种子兑换
 */

const platform = require('../core/platform');

const MASTERY_DATA = {
  watch: [
    { id: 'watch_m1', tier: 1, name: '鹰眼洞悉', icon: '🦅', desc: '射程提升 25%，并能直接洞察击中潜地土丘中的潜伏者', cost: 1, stat: { rangeBonus: 0.25, detectBurrow: true } },
    { id: 'watch_m2', tier: 2, name: '双重离弦', icon: '🏹', desc: '巡林金矢有 22% 几率同时齐射出两支羽箭，双倍火力压制', cost: 2, stat: { twinShotChance: 0.22 } },
    { id: 'watch_m3', tier: 3, name: '破风碎甲', icon: '🌪️', desc: '箭矢附带破风气旋，贯穿目标并粉碎 3 点护甲持续 4 秒', cost: 3, stat: { pierceCount: 1, armorShred: 3 } }
  ],
  mist: [
    { id: 'mist_m1', tier: 1, name: '蚀骨瘴气', icon: '🧪', desc: '迷雾持续时间延长 40%，对重甲敌怪额外造成真实腐蚀伤害', cost: 1, stat: { durationBonus: 0.40, trueDmgBonus: 4 } },
    { id: 'mist_m2', tier: 2, name: '剧毒裂变', icon: '☣️', desc: '在迷雾中被消灭的敌怪会引爆小型孢子毒云，伤害临近敌群', cost: 2, stat: { deathPoisonNova: true } },
    { id: 'mist_m3', tier: 3, name: '迟缓深渊', icon: '🕸️', desc: '减速幅度跃升至 52%，大幅打断急行跳跃怪与织网者的突击步伐', cost: 3, stat: { slowBonus: 0.22 } }
  ],
  thorn: [
    { id: 'thorn_m1', tier: 1, name: '铁棘倒钩', icon: '🩸', desc: '尖刺直伤提升 30%，暴击时附带持续 3 秒的割裂流血效果', cost: 1, stat: { dmgBonus: 0.30, bleedDps: 6 } },
    { id: 'thorn_m2', tier: 2, name: '扇形刺浪', icon: '🌿', desc: '每次齐射发射 5 枚刺棘覆盖 65 度扇形面，形成严密的拒马防线', cost: 2, stat: { spikeCount: 5 } },
    { id: 'thorn_m3', tier: 3, name: '扎根陷阵', icon: '🛡️', desc: '对空中跳跃或冲锋的敌怪产生强力拦截，使其定身 1.2 秒', cost: 3, stat: { antiLeapStun: 1.2 } }
  ],
  burst: [
    { id: 'burst_m1', tier: 1, name: '巨型爆轰', icon: '💥', desc: '爆炸冲击波半径扩展 35%，强力震退并击晕轻型怪 0.4 秒', cost: 1, stat: { aoeRadiusBonus: 0.35, knockback: true } },
    { id: 'burst_m2', tier: 2, name: '母子散弹', icon: '💣', desc: '主炮弹着地瞬间散落 3 颗微型子母雷，造成二次破片爆炸', cost: 2, stat: { clusterBomblets: 3 } },
    { id: 'burst_m3', tier: 3, name: '炽炎焦土', icon: '🔥', desc: '爆破留下持续 3.2 秒的灼烧烈焰泥土，每秒造成 16 点火系面伤', cost: 3, stat: { fireGroundDuration: 3.2, fireGroundDps: 16 } }
  ],
  lumina: [
    { id: 'lumina_m1', tier: 1, name: '日光滋养', icon: '☀️', desc: '以自身为中心 3 格范围内的所有蘑菇守卫攻击速度提升 18%', cost: 1, stat: { auraAtkSpeed: 0.18, auraRadius: 3 } },
    { id: 'lumina_m2', tier: 2, name: '圣光致盲', icon: '✨', desc: '周期性释放神圣脉冲时，使全图敌怪致盲 1.2 秒无法施展技能', cost: 2, stat: { screenBlind: 1.2 } },
    { id: 'lumina_m3', tier: 3, name: '神圣复苏', icon: '🌟', desc: '自然采收孢子量增加 50%，同时为橡木树人英雄注入 90 点生命痊愈', cost: 3, stat: { harvestBonus: 0.50, heroHeal: 90 } }
  ]
};

class MushroomMasterySystem {
  constructor() {
    this.masteryPoints = 6; // 初始赠送6点天赋点让玩家尽情体验顶级专精
    this.unlockedTiers = {
      watch: 1,
      mist: 1,
      thorn: 1,
      burst: 1,
      lumina: 1
    };
    this.isPanelOpen = false;
    this.selectedTowerType = 'watch';
  }

  isUnlocked(towerType, tier) {
    return (this.unlockedTiers[towerType] || 0) >= tier;
  }

  hasMastery(towerType, masteryId) {
    const list = MASTERY_DATA[towerType];
    if (!list) return false;
    const m = list.find(item => item.id === masteryId);
    if (!m) return false;
    return this.isUnlocked(towerType, m.tier);
  }

  unlockNextTier(towerType) {
    const cur = this.unlockedTiers[towerType] || 0;
    if (cur >= 3) return false;
    const nextTier = cur + 1;
    const list = MASTERY_DATA[towerType];
    const m = list.find(item => item.tier === nextTier);
    if (!m) return false;

    if (this.masteryPoints >= m.cost) {
      this.masteryPoints -= m.cost;
      this.unlockedTiers[towerType] = nextTier;
      platform.playSfx('sfx_upgrade');
      return true;
    }
    return false;
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;
    return this.isPanelOpen;
  }

  /**
   * 渲染古代真菌精通天赋法典面板 (Codex Mastery Sub-panel)
   */
  renderMasteryPanel(ctx) {
    if (!this.isPanelOpen) return;

    ctx.save();
    // 半透明古林遮罩
    ctx.fillStyle = 'rgba(10, 15, 12, 0.82)';
    ctx.fillRect(0, 0, 960, 640);

    // 羊皮纸/青苔树皮主卷轴
    const px = 180, py = 70, pw = 600, ph = 420;
    ctx.fillStyle = 'rgba(24, 18, 12, 0.96)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(px, py, pw, ph, 14) : ctx.rect(px, py, pw, ph);
    ctx.fill();

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 顶部标题
    ctx.fillStyle = '#FFE58F';
    ctx.font = 'bold 17px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🍄 远古真菌精通天赋法典 (Mushroom Mastery)', px + 24, py + 34);

    ctx.fillStyle = '#52C41A';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`可用天赋点: ${this.masteryPoints} ★`, px + pw - 24, py + 34);

    // 左侧防御塔分类标签切换
    const towerTabs = [
      { id: 'watch', name: '瞭望箭菇' },
      { id: 'mist', name: '迷雾孢子' },
      { id: 'thorn', name: '刺棘地刺' },
      { id: 'burst', name: '爆裂重炮' },
      { id: 'lumina', name: '日曜金菇' }
    ];

    const tabW = 100;
    for (let i = 0; i < towerTabs.length; i++) {
      const tab = towerTabs[i];
      const isSel = this.selectedTowerType === tab.id;
      const tx = px + 24;
      const ty = py + 60 + i * 52;

      ctx.fillStyle = isSel ? 'rgba(82, 196, 26, 0.28)' : 'rgba(35, 25, 18, 0.65)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tx, ty, tabW, 42, 8) : ctx.rect(tx, ty, tabW, 42);
      ctx.fill();

      ctx.strokeStyle = isSel ? '#73D13D' : '#5C4028';
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSel ? '#FFFFFF' : '#D9D9D9';
      ctx.font = isSel ? 'bold 12px sans-serif' : '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tab.name, tx + tabW * 0.5, ty + 25);
    }

    // 右侧当前选中毒菇的 3 阶精通展示
    const curList = MASTERY_DATA[this.selectedTowerType] || [];
    const contentX = px + tabW + 40;
    const unlockedTier = this.unlockedTiers[this.selectedTowerType] || 0;

    for (let i = 0; i < curList.length; i++) {
      const m = curList[i];
      const cy = py + 60 + i * 105;
      const cw = pw - tabW - 64;
      const ch = 90;
      const isUnlocked = m.tier <= unlockedTier;

      ctx.fillStyle = isUnlocked ? 'rgba(38, 55, 30, 0.85)' : 'rgba(28, 22, 18, 0.75)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(contentX, cy, cw, ch, 8) : ctx.rect(contentX, cy, cw, ch);
      ctx.fill();

      ctx.strokeStyle = isUnlocked ? '#95DE64' : '#5C4028';
      ctx.lineWidth = isUnlocked ? 1.8 : 1.0;
      ctx.stroke();

      // 天赋图标与名称
      ctx.font = 'bold 14px "Microsoft YaHei UI", sans-serif';
      ctx.fillStyle = isUnlocked ? '#FFE58F' : '#8C8C8C';
      ctx.textAlign = 'left';
      ctx.fillText(`${m.icon} 阶位 ${m.tier}: ${m.name}`, contentX + 16, cy + 24);

      // 状态标签
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      if (isUnlocked) {
        ctx.fillStyle = '#52C41A';
        ctx.fillText('✓ 已领悟', contentX + cw - 16, cy + 24);
      } else if (m.tier === unlockedTier + 1) {
        ctx.fillStyle = this.masteryPoints >= m.cost ? '#FFD666' : '#FF4D4F';
        ctx.fillText(`[点击领悟 消耗 ${m.cost} ★]`, contentX + cw - 16, cy + 24);
      } else {
        ctx.fillStyle = '#595959';
        ctx.fillText('🔒 前置阶位未解锁', contentX + cw - 16, cy + 24);
      }

      // 天赋描述
      ctx.font = '11px "Microsoft YaHei UI", sans-serif';
      ctx.fillStyle = isUnlocked ? '#E8E8E8' : '#8C8C8C';
      ctx.textAlign = 'left';
      ctx.fillText(m.desc, contentX + 16, cy + 54);
    }

    // 底部关闭提示
    ctx.fillStyle = '#8C8C8C';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点击空白处或右上角 ✖ 退出天赋法典', px + pw * 0.5, py + ph - 16);

    ctx.restore();
  }
}

module.exports = {
  MushroomMasterySystem,
  MASTERY_DATA
};

  };

  /* --- js/game/heroTranscendence.js --- */
  __modules['js/game/heroTranscendence'] = function(require, module, exports) {
/**
 * 远古树灵领袖·登阶超载与神圣天赋树系统 (js/game/heroTranscendence.js)
 * 深度借鉴《Kingdom Rush: Frontiers / Vengeance》与《Bloons TD 6》英雄升级与登阶成长机制：
 * 
 * 1. 领袖四大神圣天赋登阶 (Hero Transcendence Perks):
 *    - Perk 1: 【荆棘缚魂 (Root Prison)】(Lv.2 解锁)
 *      肉搏接怪或顺劈时，50% 概率自地底喷涌出远古荆棘根须定身目标 2.0 秒，并附加持续撕裂流血剧痛 (28 DPS)。
 *    - Perk 2: 【古木磐石 (Ancient Bark & Thorns)】(Lv.3 解锁)
 *      领袖获得全类型伤害 30% 绝对减免，受创时向四周 90px 震荡喷发环形木刺，反弹 25% 真实伤害。
 *    - Perk 3: 【天崩地裂 (Cataclysmic Rupture)】(Lv.4 解锁)
 *      [F] 大招撼地重击范围扩大 45%，并在地面留下 3 道持续 4 秒的灼热地脉熔火裂隙，经行敌怪减速 70% 并承受持续灼烧。
 *    - Perk 4: 【荒野庇护圣域 (Sanctuary of the Wilds)】(Lv.5 解锁)
 *      当生命值低于 35% 时自动引爆翡翠神圣护盾，瞬间治疗 50% 最大生命值，并令周围 3 格内所有蘑菇守卫攻速提升 40%，持续 6 秒。
 * 
 * 2. 战场主动微操战术号令 (Active Tactical Commands):
 *    - [F] 撼地重击 (Earthshaker Quake): 巨幅范围震击，群体眩晕 2.5s。
 *    - [G] 守卫集结战吼 (Rallying Battlecry): 召集全图孢子小守卫瞬移至身边，获得双倍护甲与狂暴暴击。
 *    - [V] 灵脉过载灌注 (Leyline Overload): 选定一座防御塔灌注远古自然神力，使其 8 秒内攻速与射程提升 50%。
 * 
 * 3. 实时战场浮动光冕与战术徽记 (Hero Transcendence HUD & Rune Rings)
 */

const CONFIG = require('../data/config');
const platform = require('../core/platform');

class HeroTranscendence {
  constructor(hero) {
    this.hero = hero;
    this.animTime = 0;
    
    // 登阶天赋状态
    this.perks = {
      rootPrison: { unlocked: false, minLevel: 2, name: '荆棘缚魂', icon: '🌿', desc: '近战命中50%定身2秒+流血撕裂' },
      ancientBark: { unlocked: false, minLevel: 3, name: '古木磐石', icon: '🛡️', desc: '减伤30%且受击反震反弹木刺' },
      cataclysmicRupture: { unlocked: false, minLevel: 4, name: '天崩地裂', icon: '🌋', desc: '大招范围+45%并生成地脉熔隙' },
      sanctuaryWilds: { unlocked: false, minLevel: 5, name: '荒野圣域', icon: '✨', desc: '残血触发神圣屏障自愈+守卫狂暴' }
    };

    // 圣域冷却与持续计时
    this.sanctuaryCooldown = 0;
    this.sanctuaryActiveTimer = 0;

    // 地脉熔隙实体队列 (Cataclysmic Fissures)
    this.fissures = [];

    // 技能战术号令冷却
    this.commandCooldowns = {
      battlecry: 0,
      leylineSurge: 0
    };
  }

  update(dt, enemyManager, sporelingPatrol, towerManager, fx = null) {
    this.animTime += dt;

    // 检查并更新当前英雄等级对应的天赋解锁
    const curLvl = this.hero ? this.hero.level : 1;
    for (const key in this.perks) {
      const perk = this.perks[key];
      if (curLvl >= perk.minLevel && !perk.unlocked) {
        perk.unlocked = true;
        if (fx && this.hero) {
          fx.spawnFloatingText(this.hero.x, this.hero.y - 36, `🌟 天赋登阶: ${perk.name}!`, '#FFD700', 1.3);
          fx.spawnParticles(this.hero.x, this.hero.y, 24, ['#FFD700', '#52C41A', '#BAE7FF', '#FFFFFF'], 35, 110, 0.3, 0.7, 4.5);
        }
        platform.playSfx('sfx_upgrade');
      }
    }

    // 冷却倒计时
    if (this.sanctuaryCooldown > 0) this.sanctuaryCooldown -= dt;
    if (this.commandCooldowns.battlecry > 0) this.commandCooldowns.battlecry -= dt;
    if (this.commandCooldowns.leylineSurge > 0) this.commandCooldowns.leylineSurge -= dt;

    // 荒野圣域持续效果
    if (this.sanctuaryActiveTimer > 0) {
      this.sanctuaryActiveTimer -= dt;
      // 强化周围防御塔
      if (towerManager && this.hero) {
        const hx = this.hero.x;
        const hy = this.hero.y;
        for (let i = 0; i < towerManager.towers.length; i++) {
          const t = towerManager.towers[i];
          if (Math.hypot(t.x - hx, t.y - hy) <= 120) {
            t.superchargeTimer = Math.max(t.superchargeTimer || 0, 1.0);
          }
        }
      }
    }

    // Perk 4 检查：生命低于 35% 自动引爆荒野圣域
    if (this.perks.sanctuaryWilds.unlocked && this.sanctuaryCooldown <= 0 && this.hero) {
      if (this.hero.state !== 'dead' && this.hero.hp < this.hero.maxHp * 0.35) {
        this.triggerSanctuary(fx);
      }
    }

    // 更新地脉熔火裂隙实体
    for (let i = this.fissures.length - 1; i >= 0; i--) {
      const fis = this.fissures[i];
      fis.life -= dt;
      fis.tickTimer = (fis.tickTimer || 0) + dt;

      if (fis.tickTimer >= 0.5) {
        fis.tickTimer = 0;
        if (enemyManager) {
          const alive = enemyManager.getAliveEnemies();
          for (let e = 0; e < alive.length; e++) {
            const tgt = alive[e];
            if (!tgt.isFlying && Math.hypot(tgt.x - fis.x, tgt.y - fis.y) <= fis.radius) {
              tgt.hp -= 26;
              tgt.residualSlowTimer = Math.max(tgt.residualSlowTimer || 0, 1.2);
              tgt.residualSlowValue = Math.max(tgt.residualSlowValue || 0, 0.65);
              if (fx) {
                fx.spawnParticles(tgt.x, tgt.y, 3, ['#FF4D4F', '#FFA940', '#5C4028'], 15, 35, 0.15, 0.3, 2);
              }
              if (tgt.hp <= 0) {
                enemyManager.killEnemy(tgt, fx);
              }
            }
          }
        }
      }

      if (fis.life <= 0) {
        this.fissures.splice(i, 1);
      }
    }
  }

  /**
   * 触发荒野圣域爆发
   */
  triggerSanctuary(fx = null) {
    if (!this.hero) return;
    this.sanctuaryCooldown = 45.0; // 45 秒大招内置冷却
    this.sanctuaryActiveTimer = 6.0;

    const healAmount = Math.round(this.hero.maxHp * 0.50);
    this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + healAmount);

    if (fx) {
      fx.spawnFloatingText(this.hero.x, this.hero.y - 32, `圣域爆发! +${healAmount} HP`, '#73D13D', 1.4);
      fx.spawnParticles(this.hero.x, this.hero.y, 45, ['#52C41A', '#B7EB8F', '#FFD700', '#FFFFFF'], 50, 180, 0.4, 0.9, 6.0);
      if (fx.triggerScreenShake) fx.triggerScreenShake(4.0, 0.4);
    }
    platform.playSfx('sfx_win');
  }

  /**
   * 领袖普攻命中敌人触发登阶被动
   */
  onHeroHitTarget(target, enemyManager, fx = null) {
    if (!target || target.hp <= 0) return;

    // Perk 1: 荆棘缚魂 (Root Prison)
    if (this.perks.rootPrison.unlocked && Math.random() < 0.50) {
      target.isRooted = true;
      target.rootTimer = 2.0;
      target.residualSlowTimer = 2.0;
      target.residualSlowValue = 0.95;
      target.bleedTimer = 2.5;
      target.bleedDps = 28;

      if (fx) {
        fx.spawnFloatingText(target.x, target.y - 16, '荆棘缚魂!', '#52C41A', 0.9);
        fx.spawnParticles(target.x, target.y, 8, ['#52C41A', '#389E0D', '#8C6842'], 18, 45, 0.2, 0.4, 3);
      }
    }
  }

  /**
   * 领袖遭受伤害触发登阶反伤与格挡
   */
  onHeroTakeDamage(rawDamage, enemyManager, fx = null) {
    let finalDamage = rawDamage;

    // Perk 2: 古木磐石 (Ancient Bark & Thorns)
    if (this.perks.ancientBark.unlocked) {
      finalDamage = Math.max(1, Math.round(rawDamage * 0.70)); // 30% 减伤
      const reflectDmg = Math.max(5, Math.round(rawDamage * 0.25));

      if (enemyManager && this.hero) {
        const alive = enemyManager.getAliveEnemies();
        const hx = this.hero.x;
        const hy = this.hero.y;
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i];
          if (!e.isFlying && Math.hypot(e.x - hx, e.y - hy) <= 90) {
            e.hp -= reflectDmg;
            if (fx) {
              fx.spawnParticles(e.x, e.y, 2, ['#8C6842', '#D48806'], 12, 30, 0.15, 0.25, 2);
            }
            if (e.hp <= 0) {
              enemyManager.killEnemy(e, fx);
            }
          }
        }
      }

      if (fx && this.hero) {
        fx.spawnFloatingText(this.hero.x, this.hero.y - 20, '坚毅减免!', '#BAE7FF', 0.7);
      }
    }

    return finalDamage;
  }

  /**
   * [F] 大招撼地重击升级增强：生成地脉熔隙
   */
  onCastEarthshaker(cx, cy, fx = null) {
    if (this.perks.cataclysmicRupture.unlocked) {
      // 呈三叉状喷射 3 处地脉熔火裂隙
      const angles = [0, 2.094, 4.188]; // 0, 120, 240 度
      for (let i = 0; i < angles.length; i++) {
        const ang = angles[i] + Math.random() * 0.4 - 0.2;
        const dist = 48 + Math.random() * 24;
        this.fissures.push({
          x: cx + Math.cos(ang) * dist,
          y: cy + Math.sin(ang) * dist,
          radius: 46,
          life: 4.0,
          maxLife: 4.0,
          tickTimer: 0
        });
      }
      if (fx) {
        fx.spawnFloatingText(cx, cy - 28, '天崩地裂·地脉熔火!', '#FF4D4F', 1.25);
      }
    }
  }

  /**
   * [G] 主动战术号令：守卫集结战吼 (Rallying Battlecry)
   */
  castBattlecry(sporelingPatrol, fx = null) {
    if (this.commandCooldowns.battlecry > 0 || !this.hero || this.hero.state === 'dead') return false;
    this.commandCooldowns.battlecry = 25.0; // 25s 冷却

    if (sporelingPatrol) {
      const hx = this.hero.x;
      const hy = this.hero.y;
      for (let i = 0; i < sporelingPatrol.guards.length; i++) {
        const g = sporelingPatrol.guards[i];
        if (g.state !== 'dead') {
          g.x = hx + (i === 0 ? -22 : 22);
          g.y = hy + 8;
          g.armor += 8;
          g.attackDmg = Math.round(g.attackDmg * 1.6);
          setTimeout(() => {
            g.armor = Math.max(0, g.armor - 8);
            g.attackDmg = Math.round(g.attackDmg / 1.6);
          }, 8000);
        }
      }
    }

    if (fx && this.hero) {
      fx.spawnFloatingText(this.hero.x, this.hero.y - 36, '战吼集结! 全军护卫!', '#FFD700', 1.3);
      fx.spawnParticles(this.hero.x, this.hero.y, 35, ['#FFD700', '#FFA940', '#52C41A', '#FFFFFF'], 40, 140, 0.35, 0.75, 5);
      if (fx.triggerScreenShake) fx.triggerScreenShake(3.0, 0.3);
    }
    platform.playSfx('sfx_horn');
    return true;
  }

  /**
   * [V] 主动战术号令：灵脉过载灌注 (Leyline Overload)
   */
  castLeylineSurge(towerManager, fx = null) {
    if (this.commandCooldowns.leylineSurge > 0 || !this.hero || this.hero.state === 'dead') return false;
    if (!towerManager || towerManager.towers.length === 0) return false;

    // 选取距离英雄最近的防御塔进行超载
    const hx = this.hero.x;
    const hy = this.hero.y;
    let closestTower = null;
    let minDist = 999999;
    for (let i = 0; i < towerManager.towers.length; i++) {
      const t = towerManager.towers[i];
      const d = Math.hypot(t.x - hx, t.y - hy);
      if (d < minDist) {
        minDist = d;
        closestTower = t;
      }
    }

    if (!closestTower) return false;
    this.commandCooldowns.leylineSurge = 30.0; // 30s 冷却
    closestTower.superchargeTimer = 8.0;

    if (fx) {
      fx.spawnFloatingText(closestTower.x, closestTower.y - 24, '灵脉超载! 极速狂暴!', '#69C0FF', 1.3);
      fx.spawnParticles(closestTower.x, closestTower.y, 25, ['#69C0FF', '#BAE7FF', '#FFD700', '#FFFFFF'], 30, 95, 0.3, 0.65, 4);
    }
    platform.playSfx('sfx_shock');
    return true;
  }

  /**
   * 渲染地脉裂隙与圣域光环
   */
  render(ctx) {
    // 1. 渲染地面熔火地脉裂隙
    const fisImg = platform.getImage('assets/vfx/range_earthshaker.png');
    for (let i = 0; i < this.fissures.length; i++) {
      const f = this.fissures[i];
      const alpha = Math.max(0, f.life / f.maxLife);
      const pulse = 0.8 + Math.sin(this.animTime * 8 + i) * 0.2;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(1.0, 0.72); // 倾角透视

      if (fisImg && fisImg.width) {
        ctx.globalAlpha = alpha * pulse * 0.75;
        const dSize = f.radius * 2.2;
        ctx.drawImage(fisImg, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
      } else {
        ctx.globalAlpha = alpha * pulse * 0.40;
        ctx.fillStyle = '#FF4D4F';
        ctx.beginPath();
        ctx.ellipse(0, 0, f.radius, f.radius * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. 荒野圣域爆发期间的流金神圣符文光环
    if (this.sanctuaryActiveTimer > 0 && this.hero && this.hero.state !== 'dead') {
      const sAlpha = Math.min(1.0, this.sanctuaryActiveTimer / 1.0);
      const rot = this.animTime * 1.5;
      const hx = this.hero.x;
      const hy = this.hero.y;

      const auraImg = platform.getImage('assets/vfx/range_fairy_green.png');
      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(1.0, 0.72);
      ctx.rotate(rot);

      if (auraImg && auraImg.width) {
        ctx.globalAlpha = sAlpha * 0.55;
        const aSize = 140;
        ctx.drawImage(auraImg, -aSize * 0.5, -aSize * 0.5, aSize, aSize);
      } else {
        ctx.globalAlpha = sAlpha * 0.25;
        ctx.fillStyle = 'rgba(115, 209, 61, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

module.exports = HeroTranscendence;

  };

  /* --- js/game/elementalCombos.js --- */
  __modules['js/game/elementalCombos'] = function(require, module, exports) {
/**
 * 自然奇幻·元素裂变与深层连携反应系统 (js/game/elementalCombos.js)
 * 深度汲取《原神》元素交融反应与《哈迪斯》双重祝福 (Duo Boons) 机制：
 * 
 * 6 大高阶自然元素连携反应 (Elemental Combos Matrix):
 * 1. 【腐殖剧毒 (Miasmic Corrosion)】 = 木属性破甲 (Watch) + 毒瘴水雾 (Mist)
 *    - 效果：融毁敌怪 80% 护甲，瞬间引爆腐蚀毒雾，以目标为中心造成 160 点腐殖真实伤害，并向周围 80px 溅射毒瘴。
 * 2. 【蒸气爆鸣 (Steam Overpressure)】 = 熔金炽炎 (Burst) + 潮湿水雾 (Mist)
 *    - 效果：水火交融引发高压气化冲击波，造成 220 点范围汽化冲击，并将轻型与中型敌怪猛烈震退 40px！
 * 3. 【炽热荆棘 (Blazing Bramble)】 = 坚韧地刺 (Thorn) + 熔金炽炎 (Burst)
 *    - 效果：荆棘被烈火引燃，化作焦土尖刺地带，处于其中的敌怪移动受阻 60%，每 0.5s 承受 35 点炽炎灼烧持续 4 秒。
 * 4. 【圣光涤罪 (Solar Superconduct)】 = 天穹神光 (Lumina) + 任意已触发反应
 *    - 效果：太阳神光引发光能超导，致盲全场受波及敌怪 2.5 秒，使其攻击落空且移动停滞，并额外喷发 12 颗黄金孢子！
 * 5. 【霜冻凋零 (Glacial Frostbite)】 = 寒霜凝结 (Mist A3) + 贯穿钢刺 (Thorn)
 *    - 效果：凝结寒冰碎屑扎入伤口，直接冰封目标 3.0 秒（完全冻结，无法移动与释放技能）。
 * 6. 【天人合一·自然大共鸣 (Grand Nature Resonance)】 = 3种及以上元素同时交汇
 *    - 效果：引动森林地脉终极能量，全屏爆发青翠翡翠光环，全屏所有敌怪承受 380 点自然神罚，并定身 3 秒！
 * 
 * 100% 拒绝任何矢量直线，全部采用 AI 原生粒子与光晕精灵渲染！
 */

const CONFIG = require('../data/config');
const platform = require('../core/platform');

class ElementalComboEngine {
  constructor() {
    this.activeCombos = [];
    this.comboHistory = [];
    this.totalCombosTriggered = 0;
    this.animTime = 0;

    // 活跃连携冲击波与焦土区域
    this.blazingBrambles = [];
    this.steamShockwaves = [];
  }

  clear() {
    this.activeCombos.length = 0;
    this.blazingBrambles.length = 0;
    this.steamShockwaves.length = 0;
  }

  /**
   * 当防御塔子弹或技能命中敌人时检测元素交融反应
   * @param {Object} enemy 命中的目标
   * @param {String} element 新附加的元素类别 ('wood' | 'poison' | 'fire' | 'light' | 'earth' | 'frost')
   * @param {Object} enemyManager 敌人管理器
   * @param {Object} economy 经济管理器
   * @param {Object} fx 视觉特效管理器
   * @param {Object} combatJuice 屏幕打击感震颤
   */
  checkCombo(enemy, element, enemyManager, economy, fx = null, combatJuice = null) {
    if (!enemy || enemy.hp <= 0 || enemy.state === 'death') return null;

    if (!enemy.elementAfflictions) {
      enemy.elementAfflictions = {
        wood: 0,
        poison: 0,
        fire: 0,
        light: 0,
        earth: 0,
        frost: 0
      };
    }

    // 记录已有元素状态
    const aff = enemy.elementAfflictions;
    const hadWood = aff.wood > 0;
    const hadPoison = aff.poison > 0;
    const hadFire = aff.fire > 0;
    const hadLight = aff.light > 0;
    const hadEarth = aff.earth > 0;
    const hadFrost = aff.frost > 0;

    // 每名敌人保留 2.6 秒连携内置冷却，避免高频攻速下无限瞬发爆破/刷孢子
    if (enemy._comboCd && enemy._comboCd > 0) {
      aff[element] = Math.max(aff[element] || 0, 4.0);
      return null;
    }

    // 刷新当前元素存留时间 (4.5s 附着窗口)
    aff[element] = 4.5;

    let comboTriggered = null;

    // 1. 【腐殖剧毒 (Miasmic Corrosion)】: wood + poison
    if ((element === 'wood' && hadPoison) || (element === 'poison' && hadWood)) {
      aff.wood = 0; aff.poison = 0;
      comboTriggered = this.triggerCorrosion(enemy, enemyManager, fx, combatJuice);
    }
    // 2. 【蒸气爆鸣 (Steam Overpressure)】: fire + poison/mist
    else if ((element === 'fire' && hadPoison) || (element === 'poison' && hadFire)) {
      aff.fire = 0; aff.poison = 0;
      comboTriggered = this.triggerSteamOverpressure(enemy, enemyManager, fx, combatJuice);
    }
    // 3. 【炽热荆棘 (Blazing Bramble)】: earth + fire
    else if ((element === 'fire' && hadEarth) || (element === 'earth' && hadFire)) {
      aff.fire = 0; aff.earth = 0;
      comboTriggered = this.triggerBlazingBramble(enemy, enemyManager, fx, combatJuice);
    }
    // 4. 【霜冻凋零 (Glacial Frostbite)】: frost + wood/earth
    else if ((element === 'frost' && (hadWood || hadEarth)) || ((element === 'wood' || element === 'earth') && hadFrost)) {
      aff.frost = 0; aff.wood = 0; aff.earth = 0;
      comboTriggered = this.triggerFrostbite(enemy, enemyManager, fx, combatJuice);
    }
    // 5. 【圣光涤罪 (Solar Superconduct)】: light + (wood/poison/fire/earth)
    else if (element === 'light' && (hadWood || hadPoison || hadFire || hadEarth)) {
      aff.light = 0;
      if (hadWood) aff.wood = 0;
      else if (hadPoison) aff.poison = 0;
      else if (hadFire) aff.fire = 0;
      else if (hadEarth) aff.earth = 0;
      comboTriggered = this.triggerSolarSuperconduct(enemy, enemyManager, economy, fx, combatJuice);
    }

    if (comboTriggered) {
      enemy._comboCd = 2.6;
    }

    // 6. 检测【自然大共鸣 (Grand Resonance)】: 3种以上元素同时附着
    let activeElemCount = 0;
    for (const k in aff) {
      if (aff[k] > 0) activeElemCount++;
    }
    if (activeElemCount >= 3) {
      this.triggerGrandResonance(enemy, enemyManager, fx, combatJuice);
      enemy._comboCd = 3.2;
      // 清空附着元素，防止无限连锁
      for (const k in aff) aff[k] = 0;
    }

    if (comboTriggered) {
      this.totalCombosTriggered++;
      this.comboHistory.push({
        id: comboTriggered.id,
        name: comboTriggered.name,
        time: this.animTime,
        x: enemy.x,
        y: enemy.y
      });
      if (this.comboHistory.length > 20) this.comboHistory.shift();
    }

    return comboTriggered;
  }

  /**
   * 1. 触发【腐殖剧毒】
   */
  triggerCorrosion(enemy, enemyManager, fx, combatJuice) {
    enemy.baseArmor = Math.max(0, enemy.baseArmor * 0.2); // 削减 80% 护甲
    enemy.armorReduction = Math.max(enemy.armorReduction || 0, 8.0);
    const splashDmg = 160;

    // 范围溅射
    const alive = enemyManager.getAliveEnemies();
    for (let i = 0; i < alive.length; i++) {
      const e = alive[i];
      if (Math.hypot(e.x - enemy.x, e.y - enemy.y) <= 85) {
        e.hp -= splashDmg;
        e.residualSlowTimer = Math.max(e.residualSlowTimer || 0, 3.0);
        e.residualSlowValue = Math.max(e.residualSlowValue || 0, 0.40);
        if (e.hp <= 0) enemyManager.killEnemy(e, fx);
      }
    }

    if (fx) {
      fx.spawnFloatingText(enemy.x, enemy.y - 24, '腐殖剧毒!', '#52C41A', 1.15);
      fx.spawnParticles(enemy.x, enemy.y, 28, ['#52C41A', '#73D13D', '#13C2C2', '#389E0D'], 35, 120, 0.3, 0.7, 4.5);
    }
    if (combatJuice) combatJuice.addTrauma(0.28);
    platform.playSfx('sfx_bomb');
    return { id: 'corrosion', name: '腐殖剧毒' };
  }

  /**
   * 2. 触发【蒸气爆鸣】
   */
  triggerSteamOverpressure(enemy, enemyManager, fx, combatJuice) {
    const shockDmg = 220;
    const cx = enemy.x;
    const cy = enemy.y;

    // 记录视觉震荡波
    this.steamShockwaves.push({
      x: cx,
      y: cy,
      radius: 20,
      maxRadius: 110,
      life: 0.45,
      maxLife: 0.45
    });

    // 强力击退
    const alive = enemyManager.getAliveEnemies();
    for (let i = 0; i < alive.length; i++) {
      const e = alive[i];
      const d = Math.hypot(e.x - cx, e.y - cy);
      if (d <= 110) {
        e.hp -= shockDmg;
        // 若非大型 Boss，施加 35px 沿路径后退
        if (!e.isBoss) {
          e.distPx = Math.max(0, e.distPx - 35);
        }
        if (e.hp <= 0) enemyManager.killEnemy(e, fx);
      }
    }

    if (fx) {
      fx.spawnFloatingText(cx, cy - 28, '蒸气爆鸣!', '#FF7A45', 1.15);
      fx.spawnParticles(cx, cy, 32, ['#FFF1B8', '#FF7A45', '#1890FF', '#FFFFFF'], 40, 140, 0.3, 0.75, 5);
    }
    if (combatJuice) combatJuice.addTrauma(0.40);
    platform.playSfx('sfx_shock');
    return { id: 'steam', name: '蒸气爆鸣' };
  }

  /**
   * 3. 触发【炽热荆棘】
   */
  triggerBlazingBramble(enemy, enemyManager, fx, combatJuice) {
    const cx = enemy.x;
    const cy = enemy.y;

    this.blazingBrambles.push({
      x: cx,
      y: cy,
      radius: 65,
      life: 4.0,
      maxLife: 4.0,
      tickTimer: 0
    });

    if (fx) {
      fx.spawnFloatingText(cx, cy - 24, '炽热荆棘!', '#FA541C', 1.15);
      fx.spawnParticles(cx, cy, 26, ['#FA541C', '#FFD666', '#52C41A', '#8C6842'], 30, 95, 0.25, 0.6, 4);
    }
    if (combatJuice) combatJuice.addTrauma(0.25);
    platform.playSfx('sfx_bomb');
    return { id: 'bramble', name: '炽热荆棘' };
  }

  /**
   * 4. 触发【霜冻凋零】
   */
  triggerFrostbite(enemy, enemyManager, fx, combatJuice) {
    enemy.isFrozen = true;
    enemy.freezeTimer = 3.0;
    enemy.residualSlowTimer = 3.5;
    enemy.residualSlowValue = 0.95;

    if (fx) {
      fx.spawnFloatingText(enemy.x, enemy.y - 24, '霜冻冰封!', '#13C2C2', 1.15);
      fx.spawnParticles(enemy.x, enemy.y, 24, ['#E6F7FF', '#BAE7FF', '#69C0FF', '#FFFFFF'], 25, 80, 0.25, 0.55, 3.5);
    }
    if (combatJuice) combatJuice.addTrauma(0.20);
    platform.playSfx('sfx_laser');
    return { id: 'frostbite', name: '霜冻凋零' };
  }

  /**
   * 5. 触发【圣光涤罪】
   */
  triggerSolarSuperconduct(enemy, enemyManager, economy, fx, combatJuice) {
    const cx = enemy.x;
    const cy = enemy.y;

    // 战术微额孢子回馈 (+4，内置冷却限制防止无限刷钱)
    if (economy) {
      economy.addSpores(4);
    }

    // 致盲 1.6 秒
    const alive = enemyManager.getAliveEnemies();
    for (let i = 0; i < alive.length; i++) {
      const e = alive[i];
      if (Math.hypot(e.x - cx, e.y - cy) <= 105) {
        e.isBlind = true;
        e.blindTimer = 1.6;
        e.activeSlow = Math.max(e.activeSlow || 0, 0.45);
      }
    }

    if (fx) {
      fx.spawnFloatingText(cx, cy - 30, '圣光 +4孢', '#FFD700', 1.1);
      fx.spawnParticles(cx, cy, 24, ['#FFD700', '#FFF1B8', '#FFE58F', '#FFFFFF'], 40, 130, 0.3, 0.65, 4.5);
    }
    if (combatJuice) combatJuice.addTrauma(0.25);
    platform.playSfx('sfx_coin');
    return { id: 'solar', name: '圣光涤罪' };
  }

  /**
   * 6. 触发【天人合一·自然大共鸣】
   */
  triggerGrandResonance(primaryEnemy, enemyManager, fx, combatJuice) {
    const allAlive = enemyManager.getAliveEnemies();
    const cx = primaryEnemy ? primaryEnemy.x : 320;
    const cy = primaryEnemy ? primaryEnemy.y : 240;
    const grandDmg = 155;

    for (let i = 0; i < allAlive.length; i++) {
      const e = allAlive[i];
      if (Math.hypot(e.x - cx, e.y - cy) > 140) continue;
      e.hp -= grandDmg;
      e.isRooted = true;
      e.rootTimer = 1.6;
      e.residualSlowTimer = 2.0;
      e.residualSlowValue = 0.65;
      if (e.hp <= 0) enemyManager.killEnemy(e, fx);
    }

    if (fx) {
      fx.spawnFloatingText(cx, cy - 28, '自然共鸣!', '#52C41A', 1.2);
      fx.spawnParticles(cx, cy, 42, ['#52C41A', '#FFD700', '#13C2C2', '#BAE7FF'], 60, 220, 0.4, 0.9, 5.5);
    }
    if (combatJuice) combatJuice.addTrauma(0.45);
    platform.playSfx('sfx_win');
  }

  update(dt, enemyManager, fx) {
    this.animTime += dt;

    // 更新焦土灼烧区
    for (let i = this.blazingBrambles.length - 1; i >= 0; i--) {
      const b = this.blazingBrambles[i];
      b.life -= dt;
      b.tickTimer = (b.tickTimer || 0) + dt;

      if (b.tickTimer >= 0.5) {
        b.tickTimer = 0;
        if (enemyManager) {
          const alive = enemyManager.getAliveEnemies();
          for (let e = 0; e < alive.length; e++) {
            const tgt = alive[e];
            if (!tgt.isFlying && Math.hypot(tgt.x - b.x, tgt.y - b.y) <= b.radius) {
              tgt.hp -= 35;
              tgt.residualSlowTimer = Math.max(tgt.residualSlowTimer || 0, 1.0);
              tgt.residualSlowValue = Math.max(tgt.residualSlowValue || 0, 0.60);
              if (tgt.hp <= 0) enemyManager.killEnemy(tgt, fx);
            }
          }
        }
      }

      if (b.life <= 0) this.blazingBrambles.splice(i, 1);
    }

    // 更新蒸气冲击波动画
    for (let i = this.steamShockwaves.length - 1; i >= 0; i--) {
      const s = this.steamShockwaves[i];
      s.life -= dt;
      const prog = 1 - (s.life / s.maxLife);
      s.radius = 20 + prog * (s.maxRadius - 20);
      if (s.life <= 0) this.steamShockwaves.splice(i, 1);
    }

    // 衰减敌怪体内的元素附着时间与连携冷却
    if (enemyManager) {
      const alive = enemyManager.getAliveEnemies();
      for (let i = 0; i < alive.length; i++) {
        if (alive[i]._comboCd > 0) {
          alive[i]._comboCd = Math.max(0, alive[i]._comboCd - dt);
        }
        const aff = alive[i].elementAfflictions;
        if (aff) {
          for (const k in aff) {
            if (aff[k] > 0) aff[k] -= dt;
          }
        }
      }
    }
  }

  render(ctx) {
    // 1. 渲染焦土烈焰荆棘
    const brambleImg = platform.getImage('assets/vfx/range_bramble_red.png');
    for (let i = 0; i < this.blazingBrambles.length; i++) {
      const b = this.blazingBrambles[i];
      const alpha = Math.max(0, b.life / b.maxLife);
      const pulse = 0.85 + Math.sin(this.animTime * 10 + i) * 0.15;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(1.0, 0.72);

      if (brambleImg && brambleImg.width) {
        ctx.globalAlpha = alpha * pulse * 0.70;
        const dSize = b.radius * 2.2;
        ctx.drawImage(brambleImg, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
      } else {
        ctx.globalAlpha = alpha * pulse * 0.35;
        ctx.fillStyle = '#FA541C';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. 渲染蒸气高压扩散波 (Steam Overpressure Shockwave)
    const waveImg = platform.getImage('assets/vfx/range_toxic_acid.png');
    for (let i = 0; i < this.steamShockwaves.length; i++) {
      const s = this.steamShockwaves[i];
      const alpha = Math.max(0, s.life / s.maxLife);

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(1.0, 0.72);

      if (waveImg && waveImg.width) {
        ctx.globalAlpha = alpha * 0.55;
        const dSize = s.radius * 2.0;
        ctx.drawImage(waveImg, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
      } else {
        ctx.globalAlpha = alpha * 0.30;
        ctx.fillStyle = '#BAE7FF';
        ctx.beginPath();
        ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

module.exports = ElementalComboEngine;

  };

  /* --- js/game/guardianSynergies.js --- */
  __modules['js/game/guardianSynergies'] = function(require, module, exports) {
/**
 * 战术菌灵羁绊共鸣与星轨协同系统 (js/game/guardianSynergies.js)
 * 深度借鉴成熟塔防神作 (Arknights / Bloons TD6 Monkey Knowledge / TFT) 的羁绊设计：
 * 场上部署特定守卫者组合时，自动激活太古森林共鸣星轨，赋予全军独特质感战斗被动与华丽环境视觉联动。
 */

const platform = require('../core/platform');

class GuardianSynergiesSystem {
  constructor() {
    this.synergies = {
      twin_rangers: {
        id: 'twin_rangers',
        name: '双星瞭望',
        nameKey: 'synergy_twin_rangers',
        desc: '部署 2 座及以上瞭望菇：射程 +25%，弹道速度 +35%，神圣木羽箭穿透 2 名敌军。',
        icon: 'assets/ui/cards/card_watch.png',
        color: '#FFD700',
        active: false,
        reqTypes: ['watch'],
        minCount: 2
      },
      toxic_nova: {
        id: 'toxic_nova',
        name: '毒爆云雾',
        nameKey: 'synergy_toxic_nova',
        desc: '部署雾菇 + 爆裂菇：爆裂重炮在迷雾中引爆剧毒蒸汽，造成 2.5 倍腐蚀范围爆轰并破甲。',
        icon: 'assets/ui/cards/card_mist.png',
        color: '#52C41A',
        active: false,
        reqTypes: ['mist', 'burst'],
        minCount: 1
      },
      bramble_entangle: {
        id: 'bramble_entangle',
        name: '荆棘缠绕',
        nameKey: 'synergy_bramble_entangle',
        desc: '部署尖刺菇 + 雾菇：迷雾中行进的敌军触碰地刺将被太古藤蔓强制缠绕禁锢 1.8 秒。',
        icon: 'assets/ui/cards/card_thorn.png',
        color: '#13C2C2',
        active: false,
        reqTypes: ['thorn', 'mist'],
        minCount: 1
      },
      celestial_blessing: {
        id: 'celestial_blessing',
        name: '圣光照耀',
        nameKey: 'synergy_celestial_blessing',
        desc: '部署灵光菇 + 任意输出菇：灵光每 5 秒释放圣光脉冲，驱散蛛网并为相邻守卫加持 40% 攻速。',
        icon: 'assets/ui/cards/card_lumina.png',
        color: '#FAAD14',
        active: false,
        reqTypes: ['lumina'],
        minCount: 1,
        needOffensive: true
      },
      grand_awakening: {
        id: 'grand_awakening',
        name: '森罗万象',
        nameKey: 'synergy_grand_awakening',
        desc: '集齐全部 5 类守卫者：解锁始源盖亚之怒，每 12 秒引发林地共鸣地震，重创并眩晕全图地面怪物。',
        icon: 'assets/vfx/item_awakening_seed.png',
        color: '#B37FEB',
        active: false,
        reqTypes: ['watch', 'mist', 'thorn', 'burst', 'lumina'],
        minCount: 1
      }
    };

    this.gaiaWrathTimer = 0;
    this.celestialPulseTimer = 0;
    this.activeSynergyCount = 0;
    this.synergyAuras = [];
  }

  reset() {
    this.gaiaWrathTimer = 0;
    this.celestialPulseTimer = 0;
    this.activeSynergyCount = 0;
    this.synergyAuras.length = 0;
    for (let k in this.synergies) {
      this.synergies[k].active = false;
    }
  }

  /**
   * 依据场上建筑更新羁绊激活状态
   */
  updateSynergies(towers) {
    if (!towers) return;
    const counts = {};
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      counts[t.typeId] = (counts[t.typeId] || 0) + 1;
    }

    let prevActiveCount = this.activeSynergyCount;
    let newActiveCount = 0;

    // 1. 双星瞭望
    const twinActive = (counts.watch || 0) >= 2;
    this.synergies.twin_rangers.active = twinActive;
    if (twinActive) newActiveCount++;

    // 2. 毒爆云雾
    const toxicActive = (counts.mist || 0) >= 1 && (counts.burst || 0) >= 1;
    this.synergies.toxic_nova.active = toxicActive;
    if (toxicActive) newActiveCount++;

    // 3. 荆棘缠绕
    const brambleActive = (counts.thorn || 0) >= 1 && (counts.mist || 0) >= 1;
    this.synergies.bramble_entangle.active = brambleActive;
    if (brambleActive) newActiveCount++;

    // 4. 圣光照耀
    const offensiveCount = (counts.watch || 0) + (counts.mist || 0) + (counts.thorn || 0) + (counts.burst || 0);
    const celestialActive = (counts.lumina || 0) >= 1 && offensiveCount >= 1;
    this.synergies.celestial_blessing.active = celestialActive;
    if (celestialActive) newActiveCount++;

    // 5. 森罗万象
    const grandActive = (counts.watch || 0) >= 1 && (counts.mist || 0) >= 1 && (counts.thorn || 0) >= 1 && (counts.burst || 0) >= 1 && (counts.lumina || 0) >= 1;
    this.synergies.grand_awakening.active = grandActive;
    if (grandActive) newActiveCount++;

    this.activeSynergyCount = newActiveCount;
  }

  /**
   * 每帧战术更新
   */
  update(dt, scene) {
    if (!scene || scene.state !== 'BATTLE') return;
    const towers = scene.towerManager ? scene.towerManager.towers : [];
    this.updateSynergies(towers);

    // 盖亚之怒自动蓄力
    if (this.synergies.grand_awakening.active) {
      this.gaiaWrathTimer += dt;
      if (this.gaiaWrathTimer >= 12.0) {
        this.gaiaWrathTimer = 0;
        this.triggerGaiaWrath(scene);
      }
    } else {
      this.gaiaWrathTimer = 0;
    }

    // 圣光脉冲自动蓄力
    if (this.synergies.celestial_blessing.active) {
      this.celestialPulseTimer += dt;
      if (this.celestialPulseTimer >= 5.0) {
        this.celestialPulseTimer = 0;
        this.triggerCelestialPulse(scene);
      }
    } else {
      this.celestialPulseTimer = 0;
    }

    // 更新光环微粒生命
    for (let i = this.synergyAuras.length - 1; i >= 0; i--) {
      const a = this.synergyAuras[i];
      a.life -= dt;
      a.radius += dt * 38;
      if (a.life <= 0) {
        this.synergyAuras.splice(i, 1);
      }
    }
  }

  /**
   * 触发始源盖亚之怒全图共鸣
   */
  triggerGaiaWrath(scene) {
    if (!scene) return;
    if (scene.fx) {
      scene.fx.showBanner('🌿 始源盖亚之怒·全域震颤！', '#B37FEB', '森罗万象共鸣激荡，全图地面怪物遭受太古神木冲击', 2.0);
      scene.fx.spawnShockwave(480, 270, 480, '#D3ADF7', 0.85);
    }
    if (scene.combatJuice) {
      scene.combatJuice.addTrauma(0.45);
    }
    platform.playSfx('sfx_boom');

    if (scene.enemyManager) {
      const enemies = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e.isFlying) {
          e.takeDamage(160, scene.fx, 'nature');
          e.stunTimer = Math.max(e.stunTimer || 0, 1.2);
          if (scene.fx) {
            scene.fx.spawnParticles(e.x, e.y, 8, ['#B37FEB', '#D3ADF7', '#52C41A'], 15, 35, 0.2, 0.45, 2.5);
            scene.fx.spawnFloatingText(e.x, e.y - 14, '🌍 盖亚重击!', '#D3ADF7', 0.9);
          }
        }
      }
    }
  }

  /**
   * 触发圣光脉冲
   */
  triggerCelestialPulse(scene) {
    if (!scene || !scene.towerManager) return;
    const tws = scene.towerManager.towers;
    let luminaFound = null;
    for (let i = 0; i < tws.length; i++) {
      if (tws[i].typeId === 'lumina') {
        luminaFound = tws[i];
        break;
      }
    }
    if (!luminaFound) return;

    if (scene.fx) {
      scene.fx.spawnRing(luminaFound.x, luminaFound.y, 160, '#FFE58F', 0.6);
      scene.fx.spawnFloatingText(luminaFound.x, luminaFound.y - 20, '✨ 圣光圣域!', '#FFE58F', 1.0);
    }
    platform.playSfx('sfx_upgrade');

    // 解除被困蛛网并提升相邻守卫攻速
    for (let i = 0; i < tws.length; i++) {
      const t = tws[i];
      const d = Math.hypot(t.x - luminaFound.x, t.y - luminaFound.y);
      if (d <= 180) {
        if (t.isWebbed) {
          t.isWebbed = false;
          if (scene.fx) scene.fx.spawnFloatingText(t.x, t.y - 16, '🛡️ 净化解封!', '#52C41A', 0.85);
        }
        t.celestialBuffTimer = 4.0; // 4 秒 +40% 攻速加速光环
      }
    }
  }

  /**
   * 绘制羁绊光环与林地星轨连接
   */
  render(ctx) {
    if (this.synergyAuras.length === 0 && this.activeSynergyCount === 0) return;

    ctx.save();
    for (let i = 0; i < this.synergyAuras.length; i++) {
      const a = this.synergyAuras[i];
      const alpha = Math.max(0, a.life / a.maxLife);
      ctx.strokeStyle = a.color;
      ctx.globalAlpha = alpha * 0.45;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 绘制顶部羁绊共鸣指示器 (HUD)
   */
  renderHudBadge(ctx, x, y) {
    const keys = Object.keys(this.synergies);
    const boxW = 24;
    const boxH = 24;
    const gap = 5;

    ctx.save();
    for (let i = 0; i < keys.length; i++) {
      const syn = this.synergies[keys[i]];
      const bx = x + i * (boxW + gap);
      const by = y;

      // 边框底板
      ctx.fillStyle = syn.active ? 'rgba(30, 45, 25, 0.90)' : 'rgba(15, 20, 16, 0.75)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, boxW, boxH, 4) : ctx.rect(bx, by, boxW, boxH);
      ctx.fill();

      // 激活高亮边框
      ctx.strokeStyle = syn.active ? syn.color : 'rgba(80, 90, 80, 0.40)';
      ctx.lineWidth = syn.active ? 1.5 : 1.0;
      ctx.stroke();

      // 对应守卫/原画图标
      const img = platform.getImage(syn.icon);
      if (img && img.width) {
        ctx.globalAlpha = syn.active ? 1.0 : 0.35;
        ctx.drawImage(img, bx + 2, by + 2, boxW - 4, boxH - 4);
      }

      // 激活微光角标
      if (syn.active) {
        ctx.fillStyle = syn.color;
        ctx.beginPath();
        ctx.arc(bx + boxW - 3, by + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

module.exports = GuardianSynergiesSystem;

  };

  /* --- js/game/combatVfxEngine.js --- */
  __modules['js/game/combatVfxEngine'] = function(require, module, exports) {
/**
 * 成熟战斗打击感与动态特效引擎 (js/game/combatVfxEngine.js)
 * 彻底消灭简陋的 Canvas 直线、空心几何体与纯色色块！
 * 全面集成 100% 真实 AI 手绘破空巡林箭矢、爆裂熔岩炮弹、剧毒真菌酸雾、神圣光华法球与太古劈砍刀光。
 * 深度融合成熟塔防 (Kingdom Rush / Bloons TD6 / Arknights) 级别的打击停顿、分段血条与动态状态徽标。
 */

const platform = require('../core/platform');

class CombatVfxEngine {
  constructor() {
    this.sparkPool = [];
    this.maxSparks = 64;
    this.floatingTexts = [];
    this.maxTexts = 32;
    this.slashWaves = [];
    this.maxSlashes = 16;
  }

  reset() {
    this.sparkPool.length = 0;
    this.floatingTexts.length = 0;
    this.slashWaves.length = 0;
  }

  /**
   * 生成击中火花 (AI 手绘真实打击微粒 assets/vfx/vfx_hit_spark.png)
   */
  spawnHitSpark(x, y, scale = 1.0, color = '#FFE58F') {
    if (this.sparkPool.length >= this.maxSparks) return;
    this.sparkPool.push({
      x, y,
      scale,
      color,
      life: 0.22,
      maxLife: 0.22,
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40
    });
  }

  /**
   * 生成英雄太古劈砍刀光 (assets/vfx/vfx_hero_slash.png)
   */
  spawnHeroSlash(x, y, angle = 0, scale = 1.0) {
    if (this.slashWaves.length >= this.maxSlashes) return;
    this.slashWaves.push({
      x, y,
      angle,
      scale,
      life: 0.28,
      maxLife: 0.28
    });
  }

  /**
   * 生成暴击与战术战斗浮字 (Combat Floating Text)
   */
  spawnCombatNumber(x, y, text, type = 'normal') {
    if (this.floatingTexts.length >= this.maxTexts) return;
    let color = '#FFF';
    let size = 12;
    let isCrit = false;

    if (type === 'crit') {
      color = '#FFD700';
      size = 15;
      isCrit = true;
    } else if (type === 'pyro' || type === 'burn') {
      color = '#FF4D4F';
      size = 13;
    } else if (type === 'electro' || type === 'shock') {
      color = '#D3ADF7';
      size = 13;
    } else if (type === 'cryo' || type === 'frost') {
      color = '#91D5FF';
      size = 12;
    } else if (type === 'toxic' || type === 'poison') {
      color = '#73D13D';
      size = 12;
    } else if (type === 'holy' || type === 'heal') {
      color = '#FFE58F';
      size = 13;
    }

    this.floatingTexts.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y - 8,
      text: String(text),
      color,
      size,
      isCrit,
      life: 0.75,
      maxLife: 0.75,
      vy: -32
    });
  }

  /**
   * 每帧更新物理与微粒衰减
   */
  update(dt) {
    // 1. 击中火花
    for (let i = this.sparkPool.length - 1; i >= 0; i--) {
      const s = this.sparkPool[i];
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.life <= 0) {
        this.sparkPool.splice(i, 1);
      }
    }

    // 2. 劈砍刀光
    for (let i = this.slashWaves.length - 1; i >= 0; i--) {
      const sw = this.slashWaves[i];
      sw.life -= dt;
      if (sw.life <= 0) {
        this.slashWaves.splice(i, 1);
      }
    }

    // 3. 战斗飘字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      ft.vy *= 0.94; // 阻尼
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * 绘制成熟塔防质感的高级分段血条与状态图标
   */
  renderEnemyHealthBar(ctx, enemy) {
    if (!enemy || enemy.hp <= 0 || enemy.hp >= enemy.maxHp) return;

    const barW = Math.max(34, Math.min(60, Math.round(enemy.width || 32)));
    const barH = 5.5;
    const barX = Math.round(enemy.x - barW * 0.5);
    const barY = Math.round(enemy.y - (enemy.height ? enemy.height * 0.55 : 22) - 8);

    const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));

    ctx.save();
    // 1. 极具质感的黑铁底框
    ctx.fillStyle = 'rgba(10, 15, 12, 0.88)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 3) : ctx.rect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60, 75, 65, 0.65)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 2. 动态生命渐变充能条
    let barColor = '#52C41A'; // 健康绿
    if (hpRatio < 0.30) {
      barColor = '#FF4D4F'; // 濒死鲜红
    } else if (hpRatio < 0.60) {
      barColor = '#FAAD14'; // 承伤琥珀黄
    }

    const curFillW = Math.max(1, Math.round(barW * hpRatio));
    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX, barY, curFillW, barH, 2) : ctx.rect(barX, barY, curFillW, barH);
    ctx.fill();

    // 3. 成熟游戏专属：每 100 HP 分段暗刻线 (Segments)
    const segmentCount = Math.min(8, Math.floor(enemy.maxHp / 100));
    if (segmentCount > 1) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      const segW = barW / segmentCount;
      for (let s = 1; s < segmentCount; s++) {
        const sx = Math.round(barX + s * segW);
        ctx.fillRect(sx, barY, 1, barH);
      }
    }

    // 4. 护盾条覆层 (若有护盾值)
    if (enemy.shield && enemy.shield > 0) {
      const shieldRatio = Math.min(1, enemy.shield / (enemy.maxHp * 0.5));
      ctx.fillStyle = 'rgba(145, 213, 255, 0.75)';
      ctx.fillRect(barX, barY, Math.round(barW * shieldRatio), 2);
    }

    // 5. 状态效果微标 (Debuff Status Icons)
    let iconOffsetX = barX;
    const iconY = barY - 9;
    const iconSize = 8;

    if (enemy.isFrozen || (enemy.slowTimer && enemy.slowTimer > 0)) {
      ctx.fillStyle = '#91D5FF';
      ctx.font = '8px sans-serif';
      ctx.fillText('❄️', iconOffsetX, iconY + 7);
      iconOffsetX += 10;
    }
    if (enemy.isBurning || (enemy.burnTimer && enemy.burnTimer > 0)) {
      ctx.fillStyle = '#FF4D4F';
      ctx.font = '8px sans-serif';
      ctx.fillText('🔥', iconOffsetX, iconY + 7);
      iconOffsetX += 10;
    }
    if (enemy.isPoisoned || (enemy.poisonTimer && enemy.poisonTimer > 0)) {
      ctx.fillStyle = '#73D13D';
      ctx.font = '8px sans-serif';
      ctx.fillText('🧪', iconOffsetX, iconY + 7);
      iconOffsetX += 10;
    }
    if (enemy.stunTimer && enemy.stunTimer > 0) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '8px sans-serif';
      ctx.fillText('💫', iconOffsetX, iconY + 7);
      iconOffsetX += 10;
    }

    ctx.restore();
  }

  /**
   * 绘制战斗打击特效与刀光
   */
  renderCombatVfx(ctx) {
    const hitSparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
    const heroSlashImg = platform.getImage('assets/vfx/vfx_hero_slash.png');

    ctx.save();

    // 1. 英雄太古劈砍刀光
    for (let i = 0; i < this.slashWaves.length; i++) {
      const sw = this.slashWaves[i];
      const prog = 1 - (sw.life / sw.maxLife);
      const alpha = Math.max(0, 1 - prog);

      if (heroSlashImg && heroSlashImg.width) {
        ctx.save();
        ctx.translate(Math.round(sw.x), Math.round(sw.y));
        ctx.rotate(sw.angle);
        ctx.scale(sw.scale * (1 + prog * 0.4), sw.scale * (1 + prog * 0.4));
        ctx.globalAlpha = alpha * 0.95;
        const dw = 52, dh = 52;
        ctx.drawImage(heroSlashImg, -dw * 0.5, -dh * 0.5, dw, dh);
        ctx.restore();
      }
    }

    // 2. 击中火花
    for (let i = 0; i < this.sparkPool.length; i++) {
      const s = this.sparkPool[i];
      const alpha = Math.max(0, s.life / s.maxLife);

      if (hitSparkImg && hitSparkImg.width) {
        ctx.save();
        ctx.translate(Math.round(s.x), Math.round(s.y));
        ctx.rotate(s.rot);
        ctx.globalAlpha = alpha * 0.85;
        const sz = 24 * s.scale;
        ctx.drawImage(hitSparkImg, -sz * 0.5, -sz * 0.5, sz, sz);
        ctx.restore();
      } else {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha * 0.80;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5 * s.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. 战斗飘字
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = (ft.isCrit ? 'bold ' : '600 ') + ft.size + 'px "Cinzel", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

      // 字身
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}

module.exports = CombatVfxEngine;

  };

  /* --- js/game/tacticalFeats.js --- */
  __modules['js/game/tacticalFeats'] = function(require, module, exports) {
/**
 * 战术战功勋章与首领相位演化系统 (js/game/tacticalFeats.js)
 * 借鉴 Kingdom Rush 英雄挑战与 Arknights 突袭战役设计：
 * 实时监测玩家微操、远距击杀、元素连锁反应与绝境防守，动态颁发高光战功勋章并掉落高额孢子赏金。
 * 同时统御多阶段首领狂暴相态，在 BOSS 濒死时激发环境全域变色与召唤狂暴虫潮。
 */

const platform = require('../core/platform');

class TacticalFeatsSystem {
  constructor() {
    this.feats = {
      sniper_elite: {
        id: 'sniper_elite',
        title: '神射无双',
        desc: '在 220 像素以外的超远距离精准击杀 5 只疾行虫',
        rewardSpores: 80,
        unlocked: false,
        progress: 0,
        target: 5
      },
      superconduct_chain: {
        id: 'superconduct_chain',
        title: '超导风暴',
        desc: '单次元素反应引爆至少 6 只敌军',
        rewardSpores: 120,
        unlocked: false,
        progress: 0,
        target: 6
      },
      absolute_zero: {
        id: 'absolute_zero',
        title: '深度冻结',
        desc: '使用迷雾与玄冰使 8 只敌军减速超过 50%',
        rewardSpores: 100,
        unlocked: false,
        progress: 0,
        target: 8
      },
      iron_bastion: {
        id: 'iron_bastion',
        title: '钢铁森防',
        desc: '英雄在承受超过 300 点伤害后依然屹立不倒并消灭攻击者',
        rewardSpores: 110,
        unlocked: false,
        progress: 0,
        target: 1
      },
      flawless_sanctuary: {
        id: 'flawless_sanctuary',
        title: '无暇圣域',
        desc: '连续防守 5 波敌军，生命种子零损耗',
        rewardSpores: 150,
        unlocked: false,
        progress: 0,
        target: 5
      },
      titan_breaker: {
        id: 'titan_breaker',
        title: '巨神破壁',
        desc: '攻破攻城巨甲虫 (Siege Beetle) 的重型防护并将其消灭',
        rewardSpores: 160,
        unlocked: false,
        progress: 0,
        target: 1
      },
      aerial_hunter: {
        id: 'aerial_hunter',
        title: '截击猎手',
        desc: '在跃击虫 (Leaper) 腾空跳跃期间完成空中截杀',
        rewardSpores: 130,
        unlocked: false,
        progress: 0,
        target: 1
      },
      bountiful_grove: {
        id: 'bountiful_grove',
        title: '始源丰饶',
        desc: '在单局对决中累计收获超过 1,000 点森林孢子',
        rewardSpores: 200,
        unlocked: false,
        progress: 0,
        target: 1000
      }
    };

    this.activeBanner = null;
    this.bannerTimer = 0;

    // 首领二阶段狂暴演化追踪
    this.bossEnraged = false;
    this.bossEnrageFlashTimer = 0;
  }

  reset() {
    for (let k in this.feats) {
      this.feats[k].unlocked = false;
      this.feats[k].progress = 0;
    }
    this.activeBanner = null;
    this.bannerTimer = 0;
    this.bossEnraged = false;
    this.bossEnrageFlashTimer = 0;
  }

  /**
   * 记录战果并核查战功勋章
   */
  recordEvent(eventId, value = 1, scene = null) {
    if (eventId === 'sniper_kill') {
      const f = this.feats.sniper_elite;
      if (!f.unlocked) {
        f.progress += value;
        if (f.progress >= f.target) this.unlockFeat('sniper_elite', scene);
      }
    } else if (eventId === 'superconduct_burst') {
      const f = this.feats.superconduct_chain;
      if (!f.unlocked && value >= f.target) {
        this.unlockFeat('superconduct_chain', scene);
      }
    } else if (eventId === 'massive_slow') {
      const f = this.feats.absolute_zero;
      if (!f.unlocked) {
        f.progress += value;
        if (f.progress >= f.target) this.unlockFeat('absolute_zero', scene);
      }
    } else if (eventId === 'hero_clutch') {
      const f = this.feats.iron_bastion;
      if (!f.unlocked) {
        this.unlockFeat('iron_bastion', scene);
      }
    } else if (eventId === 'flawless_wave') {
      const f = this.feats.flawless_sanctuary;
      if (!f.unlocked) {
        f.progress += 1;
        if (f.progress >= f.target) this.unlockFeat('flawless_sanctuary', scene);
      }
    } else if (eventId === 'kill_siege') {
      const f = this.feats.titan_breaker;
      if (!f.unlocked) this.unlockFeat('titan_breaker', scene);
    } else if (eventId === 'kill_leaper_air') {
      const f = this.feats.aerial_hunter;
      if (!f.unlocked) this.unlockFeat('aerial_hunter', scene);
    } else if (eventId === 'spore_earn') {
      const f = this.feats.bountiful_grove;
      if (!f.unlocked) {
        f.progress += value;
        if (f.progress >= f.target) this.unlockFeat('bountiful_grove', scene);
      }
    }
  }

  /**
   * 触发战功达成
   */
  unlockFeat(featId, scene) {
    const f = this.feats[featId];
    if (!f || f.unlocked) return;
    f.unlocked = true;

    this.activeBanner = {
      title: '🎖️ 战功勋章：' + f.title,
      sub: f.desc + ' (奖励 +' + f.rewardSpores + ' 孢子)'
    };
    this.bannerTimer = 2.8;

    platform.playSfx('sfx_upgrade');
    if (scene && scene.economy) {
      scene.economy.addSpores(f.rewardSpores);
    }
    if (scene && scene.fx) {
      scene.fx.spawnFloatingText(480, 180, '🎖️ 勋章达成 +' + f.rewardSpores, '#FFD700', 1.5);
    }
  }

  /**
   * 首领相位与二阶段狂暴演化监测
   */
  update(dt, scene) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.activeBanner = null;
      }
    }

    if (this.bossEnrageFlashTimer > 0) {
      this.bossEnrageFlashTimer = Math.max(0, this.bossEnrageFlashTimer - dt);
    }

    if (!scene || scene.state !== 'BATTLE' || !scene.enemyManager) return;

    // 检查场上是否有 BOSS 且生命值跌破 50%
    const enemies = scene.enemyManager.getAliveEnemies();
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.isBoss && !this.bossEnraged && (e.hp / e.maxHp) <= 0.50) {
        this.triggerBossPhase2(e, scene);
        break;
      }
    }
  }

  /**
   * 触发 BOSS 二阶段狂暴演化
   */
  triggerBossPhase2(boss, scene) {
    this.bossEnraged = true;
    this.bossEnrageFlashTimer = 1.2;

    platform.playSfx('sfx_boom');
    if (scene.combatJuice) {
      scene.combatJuice.addTrauma(0.65);
    }

    // BOSS 属性狂暴增强
    boss.speedMultiplier = Math.max(boss.speedMultiplier || 1.0, 1.35);
    boss.enraged = true;

    if (scene.fx) {
      scene.fx.showBanner('🔥 警告：远古首领进入狂暴相态！', '#FF4D4F', '首领速度提升 35%，释放腐化狂啸，召唤精锐甲虫护卫！', 2.5);
      scene.fx.spawnShockwave(boss.x, boss.y, 220, '#FF4D4F', 0.8);
      scene.fx.spawnParticles(boss.x, boss.y, 20, ['#FF4D4F', '#FFA39E', '#FAAD14'], 25, 60, 0.3, 0.6, 3.5);
    }

    // 召唤两只甲虫护卫
    if (scene.enemyManager && scene.map) {
      const waveIdx = (scene.waveManager && scene.waveManager.currentWaveIndex) || 1;
      scene.enemyManager.spawnEnemy('beetle', scene.map, waveIdx, { fromWave: false, startDistPx: 18 });
      scene.enemyManager.spawnEnemy('swift', scene.map, waveIdx, { fromWave: false, startDistPx: 0 });
    }
  }

  /**
   * 绘制战功达成弹窗与狂暴滤镜
   */
  render(ctx) {
    // 1. BOSS 狂暴暗红震慑滤镜
    if (this.bossEnrageFlashTimer > 0) {
      ctx.save();
      const alpha = Math.sin((this.bossEnrageFlashTimer / 1.2) * Math.PI) * 0.22;
      ctx.fillStyle = 'rgba(255, 30, 30, ' + alpha + ')';
      ctx.fillRect(0, 0, 960, 540);
      ctx.restore();
    }

    // 2. 战功横幅勋章
    if (this.activeBanner && this.bannerTimer > 0) {
      const bannerW = 380;
      const bannerH = 46;
      const bx = 480 - bannerW * 0.5;
      const by = 86;

      ctx.save();
      ctx.fillStyle = 'rgba(25, 20, 14, 0.94)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bannerW, bannerH, 8) : ctx.rect(bx, by, bannerW, bannerH);
      ctx.fill();

      // 金色高光边框
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 标题
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px "Cinzel", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.activeBanner.title, 480, by + 18);

      // 描述
      ctx.fillStyle = '#FFE58F';
      ctx.font = '11px "Microsoft YaHei", sans-serif';
      ctx.fillText(this.activeBanner.sub, 480, by + 34);
      ctx.restore();
    }
  }
}

module.exports = TacticalFeatsSystem;

  };

  /* --- js/game/ancientKnowledgeTree.js --- */
  __modules['js/game/ancientKnowledgeTree'] = function(require, module, exports) {
/**
 * 远古真菌知识之树 (js/game/ancientKnowledgeTree.js)
 * 参考 Kingdom Rush 星级科技树与 Bloons TD6 猴子知识体系
 * 为全系蘑菇、英雄、神术与经济提供永久深度强化与战术流派构筑
 */

const storage = require('../save/storage');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

const TALENT_BRANCHES = {
  BLOOM: 'bloom',       // 丰饶繁育分支 (经济与资源)
  TIMBER: 'timber',     // 苍翠坚木分支 (肉盾与防线)
  ELEMENT: 'element',   // 元素共鸣分支 (反应与范围)
  COMMAND: 'command'    // 自然神术分支 (英雄与微操)
};

const TALENT_DEFS = {
  // 1. 丰饶繁育分支
  mycelium_network: {
    id: 'mycelium_network',
    branch: TALENT_BRANCHES.BLOOM,
    tier: 1,
    name: '菌丝网络',
    icon: '🌱',
    desc: '开局额外获得 +30 基础孢子，且每秒自然凝聚 +1 孢子',
    maxRank: 3,
    costPerRank: 1,
    effect: (rank) => ({ startingSpores: rank * 30, sporeTricklePerSec: rank * 1.0 })
  },
  bountiful_harvest: {
    id: 'bountiful_harvest',
    branch: TALENT_BRANCHES.BLOOM,
    tier: 2,
    name: '丰收祝福',
    icon: '🌾',
    desc: '[E] 孢子丰饶神术额外产出 +40 孢子，且击杀精英怪必定掉落双倍金孢子',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ extraHarvestSpores: rank * 40, doubleSporeChance: rank * 0.4 })
  },
  photosynthetic_surge: {
    id: 'photosynthetic_surge',
    branch: TALENT_BRANCHES.BLOOM,
    tier: 3,
    name: '光合激涌',
    icon: '☀️',
    desc: '当场上守卫达 3 株及以上时，激活光合激涌使全队攻击与产孢速度 +10%（满级 +20%）',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ teamAtkSpeedBonus: rank * 0.10 })
  },
  elder_photosynthesis: {
    id: 'elder_photosynthesis',
    branch: TALENT_BRANCHES.BLOOM,
    tier: 4,
    name: '远古光合',
    icon: '☀️',
    desc: '波次结算时，剩余未使用的孢子产生 +12% 丰厚利息（最高180孢子）',
    maxRank: 1,
    costPerRank: 3,
    effect: (rank) => ({ waveInterestRate: 0.12, maxInterest: 180 })
  },

  // 2. 苍翠坚木分支
  bark_armor: {
    id: 'bark_armor',
    branch: TALENT_BRANCHES.TIMBER,
    tier: 1,
    name: '远古树皮',
    icon: '🛡️',
    desc: '树人英雄生命上限 +100，受到近战攻击时向四周迸发 8 片尖刺反伤',
    maxRank: 3,
    costPerRank: 1,
    effect: (rank) => ({ heroBonusHp: rank * 100, thornThornsDmg: rank * 18 })
  },
  iron_sporelings: {
    id: 'iron_sporelings',
    branch: TALENT_BRANCHES.TIMBER,
    tier: 2,
    name: '钢盔小蘑兵',
    icon: '🍄',
    desc: '巡逻小蘑兵生命值翻倍，首次受到致命伤害时免疫死亡并击晕周围敌人 1.2 秒',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ sporelingShield: true, deathStunDuration: rank * 0.8 })
  },
  deep_entanglement: {
    id: 'deep_entanglement',
    branch: TALENT_BRANCHES.TIMBER,
    tier: 3,
    name: '深根盘缚',
    icon: '🌿',
    desc: '尖刺菇与藤蔓对迅捷甲虫、跃击者等敏捷型敌人的减速效果额外提升 +30%',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ extraSlowRatio: rank * 0.18 })
  },
  living_citadel: {
    id: 'living_citadel',
    branch: TALENT_BRANCHES.TIMBER,
    tier: 4,
    name: '生命壁垒',
    icon: '🏰',
    desc: '基地蘑菇小屋获得 1 层自然神圣结界，单局可彻底免除一次怪物入仓扣血',
    maxRank: 1,
    costPerRank: 3,
    effect: (rank) => ({ warehouseHolyShield: 1 })
  },

  // 3. 元素共鸣分支
  superconduct_resonance: {
    id: 'superconduct_resonance',
    branch: TALENT_BRANCHES.ELEMENT,
    tier: 1,
    name: '超导共振',
    icon: '⚡',
    desc: '闪电链传导跳跃目标数 +2，且对重甲甲虫额外造成 +35% 破甲雷爆',
    maxRank: 3,
    costPerRank: 1,
    effect: (rank) => ({ extraChainJumps: rank * 1, armorBreakBonus: rank * 0.20 })
  },
  pyro_fissure: {
    id: 'pyro_fissure',
    branch: TALENT_BRANCHES.ELEMENT,
    tier: 2,
    name: '烈焰地裂',
    icon: '🔥',
    desc: '爆裂菇抛射炮弹爆炸后，在地面残留 3.5 秒熔岩烈焰，经过敌人每秒受 45 点灼伤',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ lavaPoolDuration: rank * 2.0, lavaDps: rank * 35 })
  },
  toxic_miasma: {
    id: 'toxic_miasma',
    branch: TALENT_BRANCHES.ELEMENT,
    tier: 3,
    name: '深渊剧毒',
    icon: '🟣',
    desc: '雾菇剧毒迷雾附带神经衰弱毒素，中毒敌人的护甲与法抗降低 40%',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ miasmaResistDebuff: rank * 0.25 })
  },
  prismatic_singularity: {
    id: 'prismatic_singularity',
    branch: TALENT_BRANCHES.ELEMENT,
    tier: 4,
    name: '棱镜奇点',
    icon: '✨',
    desc: '当敌人同时附带 2 种以上元素异常时，受到的所有伤害提升 +50% 并引发极光核爆',
    maxRank: 1,
    costPerRank: 3,
    effect: (rank) => ({ multiElementAmp: 0.50, elementalSupernova: true })
  },

  // 4. 自然神术分支
  quickened_mysticism: {
    id: 'quickened_mysticism',
    branch: TALENT_BRANCHES.COMMAND,
    tier: 1,
    name: '疾速通灵',
    icon: '⏳',
    desc: '所有指挥官神术 [Q/W/E/R] 冷却时间缩短 20%（满级 35%）',
    maxRank: 3,
    costPerRank: 1,
    effect: (rank) => ({ cdrRatio: rank * 0.12 })
  },
  tempest_surge: {
    id: 'tempest_surge',
    branch: TALENT_BRANCHES.COMMAND,
    tier: 2,
    name: '风暴狂涌',
    icon: '⛈️',
    desc: '[W] 天雷震击范围扩大 40%，落雷处产生聚怪吸引风暴，持续 2.0 秒',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ thunderRadiusMod: 1.0 + rank * 0.25, vortexPull: true })
  },
  fertile_awakening: {
    id: 'fertile_awakening',
    branch: TALENT_BRANCHES.COMMAND,
    tier: 3,
    name: '始源觉醒',
    icon: '🌟',
    desc: '战斗开局额外获赠 +1 颗始源觉醒古种，且觉醒守卫攻击速度永久额外 +20%',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ startingAwakeningSeeds: rank * 1, awakenedAtkSpeedMod: 1.0 + rank * 0.15 })
  },
  avatar_of_nature: {
    id: 'avatar_of_nature',
    branch: TALENT_BRANCHES.COMMAND,
    tier: 4,
    name: '森之化身',
    icon: '👑',
    desc: '树人英雄大招【撼地重击】冷却缩短 30%，施放后赋予全场守卫 5 秒狂暴攻速',
    maxRank: 1,
    costPerRank: 3,
    effect: (rank) => ({ heroUltCdr: 0.30, teamFrenzyDuration: 5.0 })
  }
};

class AncientKnowledgeTree {
  constructor() {
    this.ranks = {};
    this.totalPointsEarned = 12; // 默认赋予玩家初始领悟点数，确保立即可体验丰富配点
    this.activeTab = TALENT_BRANCHES.BLOOM;
    this.selectedTalentId = 'mycelium_network';
    this.loadState();
  }

  loadState() {
    const save = storage.getSave ? storage.getSave() : {};
    const savedTree = (save && save.knowledgeTree) || {};
    this.ranks = savedTree.ranks || {
      mycelium_network: 1,
      bark_armor: 1,
      superconduct_resonance: 1,
      quickened_mysticism: 1
    };
    if (this.ranks.root_recycling) {
      delete this.ranks.root_recycling;
    }
    if (typeof savedTree.totalPoints === 'number') {
      this.totalPointsEarned = Math.max(12, savedTree.totalPoints);
    }
  }

  saveState() {
    try {
      const save = storage.getSave ? storage.getSave() : {};
      save.knowledgeTree = {
        ranks: this.ranks,
        totalPoints: this.totalPointsEarned
      };
      if (storage.saveNow) {
        storage.saveNow();
      }
    } catch (e) {}
  }

  getRank(talentId) {
    return this.ranks[talentId] || 0;
  }

  getSpentPoints() {
    let spent = 0;
    for (let k in this.ranks) {
      const def = TALENT_DEFS[k];
      if (def) {
        spent += this.ranks[k] * def.costPerRank;
      }
    }
    return spent;
  }

  getAvailablePoints() {
    return Math.max(0, this.totalPointsEarned - this.getSpentPoints());
  }

  canUpgrade(talentId) {
    const def = TALENT_DEFS[talentId];
    if (!def) return false;
    const curRank = this.getRank(talentId);
    if (curRank >= def.maxRank) return false;
    if (this.getAvailablePoints() < def.costPerRank) return false;
    return true;
  }

  upgradeTalent(talentId) {
    if (!this.canUpgrade(talentId)) return false;
    const def = TALENT_DEFS[talentId];
    this.ranks[talentId] = (this.ranks[talentId] || 0) + 1;
    this.saveState();
    return true;
  }

  resetBranch(branch) {
    for (let k in TALENT_DEFS) {
      if (TALENT_DEFS[k].branch === branch) {
        delete this.ranks[k];
      }
    }
    this.saveState();
  }

  resetAll() {
    this.ranks = {};
    this.saveState();
  }

  /**
   * 应用所有激活天赋至当前战斗场景
   */
  applyToCombatScene(scene) {
    if (!scene) return;

    // 1. 菌丝网络：开局额外孢子与自然产出
    const myRank = this.getRank('mycelium_network');
    if (myRank > 0 && scene.economy) {
      scene.economy.spores += myRank * 30;
      scene.economy.passiveTrickleBonus = myRank * 1.0;
    }

    // 2. 远古树皮：英雄生命与刺甲
    const barkRank = this.getRank('bark_armor');
    if (barkRank > 0 && scene.hero) {
      scene.hero.maxHp += barkRank * 100;
      scene.hero.hp = scene.hero.maxHp;
      scene.hero.thornReflectDmg = barkRank * 18;
    }

    // 3. 光合激涌：全队攻速与产孢提速
    const psRank = this.getRank('photosynthetic_surge');
    if (psRank > 0) {
      scene.photosyntheticSurgeBonus = psRank * 0.10;
    }

    // 4. 始源觉醒：额外觉醒古种
    const awakRank = this.getRank('fertile_awakening');
    if (awakRank > 0) {
      scene.awakeningSeeds += awakRank;
    }

    // 5. 疾速通灵：神术冷却缩减
    const cdrRank = this.getRank('quickened_mysticism');
    if (cdrRank > 0) {
      scene.spellCdrMultiplier = 1.0 - cdrRank * 0.12;
    }

    // 6. 生命壁垒：基地结界
    const citRank = this.getRank('living_citadel');
    if (citRank > 0) {
      scene.holyShieldCharges = 1;
    }

    // 7. 棱镜奇点：多元素增幅
    if (this.getRank('prismatic_singularity') > 0) {
      scene.hasPrismaticSingularity = true;
    }
  }

  /**
   * 每秒持续更新（例如微量孢子自然凝聚、利息结算等）
   */
  update(dt, scene) {
    if (!scene || scene.state !== 'BATTLE') return;

    // 菌丝网络：每秒自然凝聚额外孢子
    const myRank = this.getRank('mycelium_network');
    if (myRank > 0 && scene.economy) {
      this.trickleTimer = (this.trickleTimer || 0) + dt;
      if (this.trickleTimer >= 1.0) {
        this.trickleTimer -= 1.0;
        scene.economy.addSpores(Math.round(myRank * 1.0));
      }
    }
  }

  /**
   * 渲染图鉴中的远古知识之树 UI 面板
   */
  renderKnowledgePanel(ctx, x, y, w, h, ui) {
    ctx.save();

    // 1. 顶部领悟点数与流派切换标签
    ctx.fillStyle = '#4A2E14';
    ctx.font = 'bold 14px "PingFang SC", "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const avail = this.getAvailablePoints();
    ctx.fillText(`✨ 领悟之光: ${avail} 点可用 (已用 ${this.getSpentPoints()})`, x + 16, y + 25);

    const branches = [
      { id: TALENT_BRANCHES.BLOOM, name: '🌱 丰饶繁育' },
      { id: TALENT_BRANCHES.TIMBER, name: '🛡️ 苍翠坚木' },
      { id: TALENT_BRANCHES.ELEMENT, name: '⚡ 元素共鸣' },
      { id: TALENT_BRANCHES.COMMAND, name: '👑 自然神术' }
    ];

    const tabW = 108;
    const tabH = 30;
    const tabStartX = x + w - (branches.length * tabW + (branches.length - 1) * 6) - 12;
    for (let i = 0; i < branches.length; i++) {
      const b = branches[i];
      const tx = tabStartX + i * (tabW + 6);
      const ty = y + 10;
      const isCur = this.activeTab === b.id;

      ctx.fillStyle = isCur ? 'rgba(42, 82, 34, 0.96)' : 'rgba(34, 24, 16, 0.84)';
      ctx.strokeStyle = isCur ? '#FFD700' : 'rgba(196, 143, 69, 0.55)';
      ctx.lineWidth = isCur ? 2.0 : 1.2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tx, ty, tabW, tabH, 7) : ctx.rect(tx, ty, tabW, tabH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCur ? '#FFE58F' : '#E8D8B8';
      ctx.font = 'bold 12px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.name, tx + tabW * 0.5, ty + tabH * 0.5);

      if (ui) {
        ui.registerButton('tal_tab_' + b.id, tx, ty, tabW, tabH, () => {
          this.activeTab = b.id;
        });
      }
    }

    // 2. 当前分支下的 4 个阶梯天赋卡片（严密契合羊皮纸安全内容高度）
    const currentTalents = Object.values(TALENT_DEFS).filter(t => t.branch === this.activeTab);
    const cardW = (w - 56) / 4;
    const cardH = Math.max(250, Math.min(266, h - 66));
    const startY = y + 52;

    for (let i = 0; i < currentTalents.length; i++) {
      const t = currentTalents[i];
      const cx = x + 16 + i * (cardW + 8);
      const cy = startY;
      const curRank = this.getRank(t.id);
      const isMax = curRank >= t.maxRank;
      const canUp = this.canUpgrade(t.id);

      ctx.fillStyle = curRank > 0 ? 'rgba(32, 45, 30, 0.90)' : 'rgba(20, 16, 12, 0.82)';
      ctx.strokeStyle = isMax ? '#FFD700' : (curRank > 0 ? '#52C41A' : 'rgba(140, 94, 42, 0.40)');
      ctx.lineWidth = isMax ? 2.2 : 1.2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(cx, cy, cardW, cardH, 8) : ctx.rect(cx, cy, cardW, cardH);
      ctx.fill();
      ctx.stroke();

      // 天赋手绘原画徽章圆盘（彻底替代 Windows 方块 Emoji，统一暗黑奇幻插画质感）
      const iconAssets = {
        mycelium_network: 'assets/vfx/item_awakening_seed.png',
        bountiful_harvest: 'assets/vfx/prop_dew.png',
        photosynthetic_surge: 'assets/vfx/relic_lumina.png',
        elder_photosynthesis: 'assets/vfx/item_golden_spore.png',
        bark_armor: 'assets/vfx/relic_shield.png',
        iron_sporelings: 'assets/vfx/sporeling_guard.png',
        deep_entanglement: 'assets/vfx/vfx_spikes.png',
        living_citadel: 'assets/vfx/prop_lumina_a.png',
        superconduct_resonance: 'assets/vfx/relic_lightning.png',
        pyro_fissure: 'assets/vfx/vfx_explosion.png',
        toxic_miasma: 'assets/vfx/vfx_acid_puddle.png',
        prismatic_singularity: 'assets/vfx/relic_amber.png',
        quickened_mysticism: 'assets/vfx/relic_clover.png',
        tempest_surge: 'assets/vfx/vfx_mist.png',
        fertile_awakening: 'assets/vfx/card_lumina.png',
        avatar_of_nature: 'assets/vfx/hero_oak.png'
      };
      const iconImg = platform.getImage(iconAssets[t.id] || 'assets/vfx/item_golden_spore.png');
      const medCx = cx + cardW * 0.5;
      const medCy = cy + 36;
      const medR = 23;
      ctx.save();
      ctx.beginPath();
      ctx.arc(medCx, medCy, medR, 0, Math.PI * 2);
      ctx.fillStyle = curRank > 0 ? 'rgba(28, 48, 24, 0.96)' : 'rgba(18, 14, 10, 0.92)';
      ctx.fill();
      ctx.strokeStyle = isMax ? '#FFD700' : (curRank > 0 ? '#73D13D' : 'rgba(196, 143, 69, 0.55)');
      ctx.lineWidth = isMax ? 2.0 : 1.3;
      ctx.stroke();
      if (iconImg && iconImg.width) {
        const sc = Math.min(34 / iconImg.width, 34 / iconImg.height);
        const dw = iconImg.width * sc;
        const dh = iconImg.height * sc;
        ctx.drawImage(iconImg, medCx - dw * 0.5, medCy - dh * 0.5, dw, dh);
      } else {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.icon, medCx, medCy);
      }
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 14px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      ctx.fillStyle = isMax ? '#FFE58F' : '#FFFDF5';
      ctx.fillText(t.name, cx + cardW * 0.5, cy + 72);

      // 等级角标
      ctx.font = 'bold 11.5px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      ctx.fillStyle = isMax ? '#FFD700' : '#91D5FF';
      ctx.fillText(`等级: ${curRank} / ${t.maxRank}`, cx + cardW * 0.5, cy + 92);

      // 天赋描述
      ctx.font = '11px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      ctx.fillStyle = '#E8DEC8';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      this.wrapText(ctx, t.desc, cx + 12, cy + 114, cardW - 24, 17);

      // 升级按钮（统一采用秘典手绘翡翠/木质按钮皮肤）
      const btnW = cardW - 24;
      const btnH = 32;
      const btnX = cx + 12;
      const btnY = cy + cardH - 44;
      const btnLabel = isMax ? '已臻化境' : (canUp ? `参悟 (${t.costPerRank}点)` : '点数不足');

      if (ui && typeof ui.drawPixelButton === 'function') {
        ui.drawPixelButton(ctx, 'tal_up_' + t.id, btnX, btnY, btnW, btnH, btnLabel, {
          skin: canUp && !isMax ? 'btn_green' : 'btn_wood',
          disabled: isMax || !canUp,
          font: 'bold 12px "Microsoft YaHei UI", "PingFang SC", sans-serif'
        }, () => {
          this.upgradeTalent(t.id);
        });
      } else {
        ctx.fillStyle = isMax ? 'rgba(60, 60, 60, 0.6)' : (canUp ? 'rgba(42, 112, 34, 0.94)' : 'rgba(100, 30, 30, 0.5)');
        ctx.strokeStyle = canUp ? '#95DE64' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(btnX, btnY, btnW, btnH, 6) : ctx.rect(btnX, btnY, btnW, btnH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFDF5';
        ctx.font = 'bold 12px "PingFang SC", "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btnLabel, btnX + btnW * 0.5, btnY + btnH * 0.5);
      }
    }

    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const paragraphs = String(text || '').split('\n');
    const noLineStart = '，。！？、；：）】》」』·,.!?;:)]}%';
    let curY = y;
    for (let p = 0; p < paragraphs.length; p++) {
      const chars = paragraphs[p].split('');
      let line = '';
      for (let n = 0; n < chars.length; n++) {
        const ch = chars[n];
        const testLine = line + ch;
        if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
          if (noLineStart.indexOf(ch) !== -1) {
            if (ctx.measureText(testLine).width <= maxWidth + 8) {
              line = testLine;
              continue;
            }
            if (line.length > 1) {
              const carry = line.slice(-1);
              ctx.fillText(line.slice(0, -1), x, curY);
              line = carry + ch;
              curY += lineHeight;
              continue;
            }
          }
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
      curY += lineHeight;
    }
  }
}

module.exports = {
  AncientKnowledgeTree,
  TALENT_DEFS,
  TALENT_BRANCHES
};

  };

  /* --- js/game/tacticalTargetingAI.js --- */
  __modules['js/game/tacticalTargetingAI'] = function(require, module, exports) {
/**
 * 目标指示器 (js/game/tacticalTargetingAI.js)
 * 选中蘑菇时，在其当前锁定的敌人脚下绘制准星，并以细虚线连接，
 * 让玩家直观看到「索敌」优先级的实际效果。
 * 索敌逻辑本身由 TowerManager.selectTarget 负责，此处只负责显示。
 */

class TacticalTargetingAI {
  constructor() {
    this.animTimer = 0;
  }

  update(dt) {
    this.animTimer += dt;
  }

  /**
   * 在地图坐标系内绘制。target 为 null 时不绘制。
   */
  renderTargetHighlight(ctx, tower, target) {
    if (!tower || !target || target.state === 'death' || target.hp <= 0) return;

    ctx.save();
    const pulse = 1.0 + Math.sin(this.animTimer * 8) * 0.08;
    const color = '#FFE58F';

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.4;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -Math.round((this.animTimer * 24) % 8);
    ctx.beginPath();
    ctx.moveTo(tower.x, tower.y - 12);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.translate(target.x, target.y + 4);
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    const mk = 13;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-mk, 0); ctx.lineTo(-mk + 5, 0);
    ctx.moveTo(mk, 0); ctx.lineTo(mk - 5, 0);
    ctx.moveTo(0, -mk * 0.6); ctx.lineTo(0, -mk * 0.6 + 3);
    ctx.moveTo(0, mk * 0.6); ctx.lineTo(0, mk * 0.6 - 3);
    ctx.stroke();
    ctx.restore();
  }
}

module.exports = {
  TacticalTargetingAI
};

  };

  /* --- js/game/combatScreenJuice.js --- */
  __modules['js/game/combatScreenJuice'] = function(require, module, exports) {
/**
 * 战斗打击感与物理视效引擎 (js/game/combatScreenJuice.js)
 * 深度汲取《Dead Cells》《Hades》与《Kingdom Rush》顶级打击反馈
 * 提供真实弹簧阻尼旋转晃屏、动态击飞伤害跳字、连杀里程碑与微环境粒子
 */

const UI_FONT = '"PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", sans-serif';

class CombatScreenJuice {
  constructor() {
    this.trauma = 0; // 0..1 震动创伤值
    this.maxShakePx = 10;
    this.maxAngleRad = 0.045; // ~2.5 度微旋转，提供顶级电影级受击感
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeAngle = 0;
    this.juiceTime = 0;

    // 漂浮物理跳字池
    this.floatingTexts = [];

    // 连杀计数与华丽徽章
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboScale = 1.0;

    // 氛围粒子 (落叶、萤火虫、水花涟漪)
    this.ambientMotes = [];
    this.initAmbientMotes();
  }

  reset() {
    this.trauma = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeAngle = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.floatingTexts = [];
    this.initAmbientMotes();
  }

  initAmbientMotes() {
    for (let i = 0; i < 28; i++) {
      this.ambientMotes.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        vx: 0.15 + Math.random() * 0.45,
        vy: 0.25 + Math.random() * 0.55,
        size: 1.5 + Math.random() * 2.5,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 2.0,
        type: i % 3 === 0 ? 'leaf' : (i % 2 === 0 ? 'spore' : 'mote'),
        alpha: 0.25 + Math.random() * 0.55
      });
    }
  }

  /**
   * 注入打击创伤值 (0..1)
   */
  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  /**
   * 触发暴击跳字
   */
  spawnCritText(x, y, text, color = '#FFE58F', scale = 1.25) {
    this.floatingTexts.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 45,
      vy: -65 - Math.random() * 40,
      text,
      color,
      scale,
      life: 1.0,
      maxLife: 1.0,
      isCrit: true
    });
    this.addTrauma(0.18);
  }

  /**
   * 击杀递增连杀计数
   */
  onKill(enemy, scene) {
    this.comboTimer = 2.4;
    this.comboCount += 1;
    this.comboScale = 1.45;

    if (this.comboCount % 5 === 0) {
      this.addTrauma(0.22);
      if (scene && scene.fx) {
        scene.fx.spawnParticles(enemy.x, enemy.y, 25, ['#FFD700', '#52C41A', '#BAE7FF', '#FFA39E'], 40, 110, 0.3, 0.6, 4.5);
      }
    }
  }

  update(dt, isBattle = true) {
    this.juiceTime += dt;

    // 1. 创伤值按平方衰减（更符合自然物理反馈）
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 1.6);
      const shakePower = this.trauma * this.trauma;
      this.shakeOffsetX = (Math.sin(this.juiceTime * 45) + (Math.random() - 0.5) * 0.6) * this.maxShakePx * shakePower;
      this.shakeOffsetY = (Math.cos(this.juiceTime * 52) + (Math.random() - 0.5) * 0.6) * this.maxShakePx * shakePower;
      this.shakeAngle = Math.sin(this.juiceTime * 38) * this.maxAngleRad * shakePower;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeAngle = 0;
    }

    // 2. 连杀计时器衰减
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      this.comboScale = Math.max(1.0, this.comboScale - dt * 2.0);
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // 3. 漂浮物理伤害数字更新
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.x += ft.vx * dt;
      ft.y += ft.vy * dt;
      ft.vy += 80 * dt; // 重力下坠感
    }

    // 4. 环境氛围微粒漂移
    if (isBattle) {
      for (let i = 0; i < this.ambientMotes.length; i++) {
        const m = this.ambientMotes[i];
        m.x += m.vx;
        m.y += m.vy;
        m.rot += m.vRot * dt;
        if (m.x > 980) m.x = -20;
        if (m.y > 560) m.y = -20;
      }
    }
  }

  /**
   * 应用视效位移变换至主画布上下文
   */
  applyScreenShakeTransform(ctx) {
    if (this.trauma <= 0.001) return;
    ctx.translate(480 + this.shakeOffsetX, 270 + this.shakeOffsetY);
    ctx.rotate(this.shakeAngle);
    ctx.translate(-480, -270);
  }

  /**
   * 渲染环境粒子与击杀连击 UI 徽章
   */
  renderJuiceOverlays(ctx) {
    ctx.save();

    // 1. 绘制灵动林间微粒
    for (let i = 0; i < this.ambientMotes.length; i++) {
      const m = this.ambientMotes[i];
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rot);
      ctx.globalAlpha = m.alpha * 0.75;

      if (m.type === 'leaf') {
        ctx.fillStyle = '#73D13D';
        ctx.beginPath();
        ctx.ellipse(0, 0, m.size * 2, m.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'spore') {
        ctx.fillStyle = '#FFE58F';
        ctx.beginPath();
        ctx.arc(0, 0, m.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#BAE7FF';
        ctx.beginPath();
        ctx.arc(0, 0, m.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. 绘制漂浮物理伤害数字
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      const prog = ft.life / ft.maxLife;
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale * (0.8 + 0.2 * prog), ft.scale * (0.8 + 0.2 * prog));
      ctx.globalAlpha = Math.min(1.0, prog * 1.5);

      ctx.font = ft.isCrit ? `bold 16px ${UI_FONT}` : `bold 13px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 阴影描边
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.lineWidth = 3.2;
      ctx.strokeText(ft.text, 0, 0);

      // 发光字芯
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }

    // 3. 绘制激燃连杀战绩徽章 (Combo Milestone Badge)
    if (this.comboCount >= 3) {
      const bx = 862;
      const by = 66;
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(this.comboScale, this.comboScale);

      const isHigh = this.comboCount >= 10;
      ctx.fillStyle = isHigh ? 'rgba(140, 29, 24, 0.90)' : 'rgba(26, 38, 24, 0.88)';
      ctx.strokeStyle = isHigh ? '#FFA39E' : '#FFE58F';
      ctx.lineWidth = 2.0;

      const badgeW = 148;
      const badgeH = 28;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-badgeW * 0.5, -badgeH * 0.5, badgeW, badgeH, 14) : ctx.rect(-badgeW * 0.5, -badgeH * 0.5, badgeW, badgeH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHigh ? '#FFF1F0' : '#FFE58F';
      ctx.font = `bold 13px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const title = this.comboCount >= 20 ? '狂暴超神' : (this.comboCount >= 10 ? '势如破竹' : '连续斩获');
      ctx.fillText(`${title} ${this.comboCount} 连杀`, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }
}

module.exports = CombatScreenJuice;

  };

  /* --- js/game/bossOverdriveEngine.js --- */
  __modules['js/game/bossOverdriveEngine'] = function(require, module, exports) {
/**
 * 首领过载与多阶段战役引擎 (js/game/bossOverdriveEngine.js)
 * 深度汲取《王国保卫战》(Kingdom Rush) 首领战精髓
 * 提供首领护甲蜕壳、狂暴冲锋、全场践踏晕眩与绝境地穴援军召唤机制
 * 附带顶部史诗级分段 Boss 血条与狂暴阶段视觉光环
 */

const i18n = require('../i18n');
const UI_FONT = '"PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", sans-serif';

class BossOverdriveEngine {
  constructor() {
    this.activeBoss = null;
    this.phase = 1; // 1: 坚韧重甲态, 2: 狂暴过载态, 3: 绝境召唤态
    this.maxHp = 0;
    this.currentHp = 0;
    this.enragedTimer = 0;
    this.stompCooldown = 8.0;
    this.summonCooldown = 12.0;
    this.overdriveAuraAnim = 0;
    this.pendingSpawns = [];
  }

  registerBoss(bossEnemy) {
    if (!bossEnemy) return;
    this.activeBoss = bossEnemy;
    this.phase = 1;
    this.maxHp = bossEnemy.maxHp || bossEnemy.hp || 1000;
    this.currentHp = bossEnemy.hp || this.maxHp;
    this.enragedTimer = 0;
    this.stompCooldown = 6.0;
    this.summonCooldown = 10.0;
  }

  clear() {
    this.pendingSpawns = [];
    this.activeBoss = null;
    this.phase = 1;
    this.currentHp = 0;
  }

  reset() {
    this.clear();
  }

  update(dt, scene) {
    if (this.pendingSpawns && this.pendingSpawns.length > 0 && scene && scene.state === 'BATTLE') {
      for (let i = this.pendingSpawns.length - 1; i >= 0; i--) {
        const ps = this.pendingSpawns[i];
        ps.delay -= dt;
        if (ps.delay <= 0) {
          this.pendingSpawns.splice(i, 1);
          if (scene.enemyManager && scene.map) scene.enemyManager.spawnEnemy(ps.type, scene.map, ps.waveIdx);
        }
      }
    }
    if (!this.activeBoss || this.activeBoss.state === 'death' || this.activeBoss.hp <= 0) {
      this.activeBoss = null;
      return;
    }

    this.overdriveAuraAnim += dt;
    this.maxHp = Math.max(1, this.activeBoss.maxHp || this.maxHp || 1);
    this.currentHp = Math.max(0, this.activeBoss.hp);
    const hpRatio = Math.min(1.0, this.currentHp / this.maxHp);

    // 1. 阶段检查与蜕变
    if (this.phase === 1 && hpRatio <= 0.60) {
      // 触发二阶段：狂暴过载 (Carapace Shed & Enraged Overdrive)
      this.phase = 2;
      this.triggerPhase2Transition(scene);
    } else if (this.phase === 2 && hpRatio <= 0.25) {
      // 触发三阶段：绝境召唤 (Desperation Swarm)
      this.phase = 3;
      this.triggerPhase3Transition(scene);
    }

    // 2. 二阶段狂暴践踏技能（仅陆地重甲首领发动撼地践踏；空中蛾后专注毒粉狂暴）
    if (this.phase >= 2 && !this.activeBoss.isFlying) {
      this.stompCooldown -= dt;
      if (this.stompCooldown <= 0) {
        this.stompCooldown = 7.5;
        this.executeEarthStomp(scene);
      }
    }

    // 3. 三阶段地穴援军召唤技能
    if (this.phase >= 3) {
      this.summonCooldown -= dt;
      if (this.summonCooldown <= 0) {
        this.summonCooldown = 11.0;
        this.executeSubterraneanSummon(scene);
      }
    }
  }

  triggerPhase2Transition(scene) {
    if (!scene || !this.activeBoss) return;
    // 移速提升 +40%，全身赤红过载
    this.activeBoss.speed = (this.activeBoss.speed || 1.0) * 1.35;
    this.activeBoss.isEnraged = true;

    if (scene.fx) {
      scene.fx.triggerScreenShake(7.5, 0.65);
      scene.fx.showBanner('🔥 首领狂暴过载！蜕壳暴走！', '#FF4D4F', '全场守卫小心践踏！', 2.8);
      scene.fx.spawnParticles(this.activeBoss.x, this.activeBoss.y, 45, ['#FF4D4F', '#FFA39E', '#D4380D', '#FFD666'], 60, 160, 0.4, 0.85, 6);
    }
  }

  triggerPhase3Transition(scene) {
    if (!scene || !this.activeBoss) return;
    this.activeBoss.speed = (this.activeBoss.speed || 1.0) * 1.25;

    if (scene.fx) {
      scene.fx.triggerScreenShake(9.0, 0.8);
      scene.fx.showBanner('⚡ 首领绝境濒死！呼唤地穴援军！', '#722ED1', '侧翼地穴隧道已开启！', 3.0);
      scene.fx.spawnParticles(this.activeBoss.x, this.activeBoss.y, 55, ['#722ED1', '#B37FEB', '#FF4D4F', '#FFE58F'], 80, 200, 0.5, 1.0, 6.5);
    }
    this.executeSubterraneanSummon(scene);
  }

  /**
   * 首领践踏技能：震击全场地面，使周围防御塔短暂短路眩晕 1.5 秒
   */
  executeEarthStomp(scene) {
    if (!scene || !this.activeBoss) return;
    const bx = this.activeBoss.x;
    const by = this.activeBoss.y;

    if (scene.fx) {
      scene.fx.triggerScreenShake(5.0, 0.35);
      scene.fx.spawnParticles(bx, by, 30, ['#8C6842', '#D4B106', '#5C4028'], 40, 120, 0.3, 0.6, 4.5);
      scene.fx.spawnFloatingText(bx, by - 24, '⚡ 撼地践踏!', '#FF7875', 1.25);
    }

    // 附近的防御塔进入短暂 1.2 秒休眠状态
    if (scene.towerManager && scene.towerManager.towers) {
      for (let i = 0; i < scene.towerManager.towers.length; i++) {
        const tw = scene.towerManager.towers[i];
        if (Math.hypot(tw.x - bx, tw.y - by) <= 160) {
          tw.stunTimer = 1.2;
          if (scene.fx) {
            scene.fx.spawnFloatingText(tw.x, tw.y - 16, '💤 眩晕', '#FFD591', 0.9);
          }
        }
      }
    }
  }

  /**
   * 绝境召唤：从地图次级出生点召唤 4 只迅捷跳跃甲虫
   */
  executeSubterraneanSummon(scene) {
    if (!scene || !scene.enemyManager || !scene.map) return;
    const map = scene.map;
    const spawnPt = (map.mapData && map.mapData.spawnTile2) || [18, 2];
    const sx = (spawnPt[0] + 0.5) * 32;
    const sy = (spawnPt[1] + 0.5) * 32;

    if (scene.fx) {
      scene.fx.spawnParticles(sx, sy, 25, ['#722ED1', '#52C41A', '#FFD700'], 35, 90, 0.3, 0.6, 4.0);
      scene.fx.spawnFloatingText(sx, sy - 18, '🕳️ 地穴裂隙援军涌出!', '#B37FEB', 1.2);
    }

    const waveIdx = (scene.waveManager && scene.waveManager.currentWaveIndex) || 1;
    for (let i = 0; i < 3; i++) {
      this.pendingSpawns.push({ delay: i * 0.35, type: 'swift', waveIdx });
    }
  }

  /**
   * 渲染首领身下战术过载光环与顶部史诗级 Boss 血条
   */
  /**
   * 首领脚下过载光环（须在地图坐标系内调用）
   */
  renderBossAura(ctx) {
    if (!this.activeBoss || this.activeBoss.state === 'death' || this.activeBoss.hp <= 0) return;
    const bx = this.activeBoss.x;
    const by = this.activeBoss.y;
    const auraColor = this.phase === 3 ? '#B37FEB' : (this.phase === 2 ? '#FF4D4F' : '#FFA940');
    const pulse = 1.0 + Math.sin(this.overdriveAuraAnim * 8) * 0.15;
    ctx.save();
    ctx.translate(bx, by + 6);
    ctx.scale(pulse, pulse * 0.7);
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 2.0;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(this.overdriveAuraAnim * 2.0);
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 屏幕顶部分段首领血条（屏幕坐标）
   */
  renderBossHud(ctx) {
    if (!this.activeBoss || this.activeBoss.state === 'death' || this.activeBoss.hp <= 0) return;
    const auraColor = this.phase === 3 ? '#B37FEB' : (this.phase === 2 ? '#FF4D4F' : '#FFA940');
    ctx.save();

    // 2. 屏幕顶部史诗级分段 Boss 血条 (严格置于成就吐司 y=10..52 下方 y=58..106 安全带，内外留白饱满)
    const barW = 360;
    const barH = 16;
    const barX = (960 - barW) * 0.5;
    const barY = 82;
    const safeMaxHp = Math.max(1, this.activeBoss.maxHp || this.maxHp || 1);
    const safeCurHp = Math.max(0, this.activeBoss.hp !== undefined ? this.activeBoss.hp : this.currentHp);
    const hpRatio = Math.max(0, Math.min(1.0, safeCurHp / safeMaxHp));

    // 血条底座背框（双层暗木嵌金倒角框，标题与血槽均舒展留白于框内）
    ctx.fillStyle = 'rgba(20, 14, 9, 0.95)';
    ctx.strokeStyle = '#C68F45';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX - 12, barY - 24, barW + 24, barH + 32, 9) : ctx.rect(barX - 12, barY - 24, barW + 24, barH + 32);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 229, 143, 0.25)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX - 9, barY - 21, barW + 18, barH + 26, 7) : ctx.rect(barX - 9, barY - 21, barW + 18, barH + 26);
    ctx.stroke();

    // 首领名称与阶段标识（自动本地化读取腐化蛀王 / 剧毒幽蛾后 / 万巢裂殖母体）
    const bossName = (this.activeBoss.def && this.activeBoss.def.nameKey)
      ? i18n.t(this.activeBoss.def.nameKey)
      : (this.activeBoss.name || '林地首领');
    const phaseLabel = this.phase === 3 ? '【阶段 III: 绝境狂暴】' : (this.phase === 2 ? '【阶段 II: 蜕壳暴走】' : '【阶段 I: 巨壳护体】');

    ctx.font = `bold 12px ${UI_FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = auraColor;
    ctx.textAlign = 'left';
    ctx.fillText(`${bossName} ${phaseLabel}`, barX, barY - 11, barW - 108);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFE58F';
    ctx.fillText(`${Math.ceil(safeCurHp)} / ${safeMaxHp}`, barX + barW, barY - 11, 104);

    // 内部血条充能槽
    ctx.fillStyle = 'rgba(40, 20, 15, 0.85)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX, barY, barW, barH, 4) : ctx.rect(barX, barY, barW, barH);
    ctx.fill();

    // 动态多段渐变血条
    if (this.phase === 3) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      grad.addColorStop(0, '#722ED1');
      grad.addColorStop(1, '#F5222D');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = this.phase === 2 ? '#F5222D' : '#FA8C16';
    }
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX, barY, barW * hpRatio, barH, 4) : ctx.rect(barX, barY, barW * hpRatio, barH);
    ctx.fill();

    // 阶段分段刻度线 (60% 和 25% 处设金刻度线)
    ctx.strokeStyle = '#FFE58F';
    ctx.lineWidth = 1.5;
    [0.60, 0.25].forEach(thresh => {
      const tx = barX + barW * thresh;
      ctx.beginPath();
      ctx.moveTo(tx, barY);
      ctx.lineTo(tx, barY + barH);
      ctx.stroke();
    });

    ctx.restore();
  }
}

module.exports = BossOverdriveEngine;

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
        row: 9,
        x: (8 + 0.5) * TILE_SIZE,
        y: (9 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 18.0,
        cost: 35,
        digestTimer: 0,
        animTimer: 0
      };
      this.thunderTree = {
        col: 10,
        row: 5,
        x: (10 + 0.5) * TILE_SIZE,
        y: (5 + 0.5) * TILE_SIZE,
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
        col: 12,
        row: 9,
        x: (12 + 0.5) * TILE_SIZE,
        y: (9 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 24.0,
        cost: 45,
        arcTimer: 0,
        animTimer: 0
      };
    } else if (mapId === 'map4') {
      this.pitcher = {
        col: 4,
        row: 10,
        x: (4 + 0.5) * TILE_SIZE,
        y: (10 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 18.0,
        cost: 35,
        digestTimer: 0,
        animTimer: 0
      };
      this.thunderTree = {
        col: 11,
        row: 8,
        x: (11 + 0.5) * TILE_SIZE,
        y: (8 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 24.0,
        cost: 45,
        arcTimer: 0,
        animTimer: 0
      };
    } else {
      this.pitcher = {
        col: 5,
        row: 4,
        x: (5 + 0.5) * TILE_SIZE,
        y: (4 + 0.5) * TILE_SIZE,
        cd: 0,
        maxCd: 18.0,
        cost: 35,
        digestTimer: 0,
        animTimer: 0
      };
      this.thunderTree = {
        col: 8,
        row: 8,
        x: (8 + 0.5) * TILE_SIZE,
        y: (8 + 0.5) * TILE_SIZE,
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

    // 3. 草丛露珠自然凝聚（最多 3 颗，避开道路、造塔坑位、障碍物与大型机关）
    this.dewSpawnTimer -= dt;
    if (this.dewSpawnTimer <= 0 && this.dewDrops.length < 3 && scene && scene.map) {
      this.dewSpawnTimer = 8.0 + Math.random() * 6.0;
      const map = scene.map;
      const obstacles = map.obstacles || [];
      const candidates = [];
      for (let r = 1; r < map.rows - 1; r++) {
        for (let c = 1; c < map.cols - 1; c++) {
          const tile = map.getTile(c, r);
          if (!tile || tile.type !== 'grass' || tile.tower) continue;
          const cx = (c + 0.5) * TILE_SIZE;
          const cy = (r + 0.5) * TILE_SIZE;
          let blocked = false;
          // 远离道路格、障碍物、环境机关与已有露珠
          for (let dr = -1; dr <= 1 && !blocked; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const adj = map.getTile(c + dc, r + dr);
              if (adj && (adj.type === 'path' || adj.type === 'spawn' || adj.type === 'goal')) {
                blocked = true;
                break;
              }
            }
          }
          if (!blocked && this.pitcher && Math.hypot(cx - this.pitcher.x, cy - this.pitcher.y) < 46) blocked = true;
          if (!blocked && this.thunderTree && Math.hypot(cx - this.thunderTree.x, cy - this.thunderTree.y) < 46) blocked = true;
          for (let oi = 0; oi < obstacles.length && !blocked; oi++) {
            if (!obstacles[oi].cleared && Math.hypot(cx - obstacles[oi].x, cy - obstacles[oi].y) < 44) blocked = true;
          }
          for (let di = 0; di < this.dewDrops.length && !blocked; di++) {
            if (Math.hypot(cx - this.dewDrops[di].x, cy - this.dewDrops[di].y) < 48) blocked = true;
          }
          if (!blocked) candidates.push([cx, cy]);
        }
      }
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        this.dewDrops.push({
          x: pick[0] + (Math.random() - 0.5) * 10,
          y: pick[1] + (Math.random() - 0.5) * 10,
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

    // 森林闲趣小生灵状态更新
  }

  handlePointerDown(inputX, inputY, scene, dewOnly = false) {
    if (!scene || scene.state !== 'BATTLE') return false;
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const scale = mv.SCALE || 0.85;



    // 1. 点击清晨露珠：“啵”地破裂获得孢子微彩蛋 (支持超大 60px 触控圈与双坐标系)
    for (let i = this.dewDrops.length - 1; i >= 0; i--) {
      const dew = this.dewDrops[i];
      const distMap = Math.hypot(inputX - dew.x, inputY - dew.y);
      const screenX = mv.OFFSET_X + dew.x * scale;
      const screenY = mv.OFFSET_Y + dew.y * scale;
      const distScreen = Math.hypot(inputX - screenX, inputY - screenY);
      const convertedMx = (inputX - mv.OFFSET_X) / scale;
      const convertedMy = (inputY - mv.OFFSET_Y) / scale;
      const distConverted = Math.hypot(convertedMx - dew.x, convertedMy - dew.y);

      if (distMap <= 60 || distScreen <= 60 || distConverted <= 60) {
        if (scene.economy) scene.economy.addSpores(10);
        if (scene.fx) {
          scene.fx.spawnFloatingText(dew.x, dew.y - 14, '+10 晶莹晨露', '#69C0FF', 1.25);
          scene.fx.spawnParticles(dew.x, dew.y, 16, ['#BAE7FF', '#91D5FF', '#FFFFFF', '#52C41A'], 25, 60, 0.25, 0.5, 4);
        }
        platform.playSfx('sfx_coin');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(12); } catch (e) {}
        }
        this.dewDrops.splice(i, 1);
        return true;
      }
    }

    if (dewOnly) return false;

    // 2. 点击食虫巨猪笼草
    if (this.pitcher) {
      const p = this.pitcher;
      const distMap = Math.hypot(inputX - p.x, inputY - p.y);
      const screenX = mv.OFFSET_X + p.x * scale;
      const screenY = mv.OFFSET_Y + p.y * scale;
      const distScreen = Math.hypot(inputX - screenX, inputY - screenY);
      const convertedMx = (inputX - mv.OFFSET_X) / scale;
      const convertedMy = (inputY - mv.OFFSET_Y) / scale;
      const distConverted = Math.hypot(convertedMx - p.x, convertedMy - p.y);

      if (distMap <= 45 || distScreen <= 45 || distConverted <= 45) {
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
      const distMap = Math.hypot(inputX - t.x, inputY - t.y);
      const screenX = mv.OFFSET_X + t.x * scale;
      const screenY = mv.OFFSET_Y + t.y * scale;
      const distScreen = Math.hypot(inputX - screenX, inputY - screenY);
      const convertedMx = (inputX - mv.OFFSET_X) / scale;
      const convertedMy = (inputY - mv.OFFSET_Y) / scale;
      const distConverted = Math.hypot(convertedMx - t.x, convertedMy - t.y);

      if (distMap <= 45 || distScreen <= 45 || distConverted <= 45) {
        if (t.cd > 0) {
          scene.ui.showToast(`雷击古木充能中 (冷却 ${Math.ceil(t.cd)}s)`);
          return true;
        }
        if (!scene.economy.canAfford(t.cost)) {
          scene.ui.showToast(`孢子不足 (需 ${t.cost})`);
          return true;
        }
        const enemies = scene.enemyManager ? scene.enemyManager.activeEnemies : [];
        let hitCount = 0;
        const maxHits = 4;
        const zapRadius = 140;

        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (!e.__active || e.state === 'death') continue;
          if (Math.hypot(e.x - t.x, e.y - t.y) <= zapRadius) {
            scene.enemyManager.applyDirectDamage(e, 85, 0, false, false, 0, scene.map, scene.economy, scene.fx);
            scene.enemyManager.applyStun(e, 2.2);
            hitCount += 1;
            if (scene.fx) {
              scene.fx.spawnShockwave(e.x, e.y, 28, '#40A9FF');
              scene.fx.spawnParticles(e.x, e.y, 14, ['#40A9FF', '#91D5FF', '#FFFFFF'], 30, 70, 0.2, 0.4, 3);
            }
            if (hitCount >= maxHits) break;
          }
        }

        if (hitCount > 0) {
          scene.economy.spendSpores(t.cost);
          t.cd = t.maxCd;
          t.arcTimer = 0.65;
          platform.playSfx('sfx_laser');
          if (scene.fx) {
            scene.fx.spawnFloatingText(t.x, t.y - 24, `天雷震击 ×${hitCount}!`, '#40A9FF', 1.35);
            scene.fx.triggerScreenShake(3.0, 0.25);
          }
        } else {
          scene.ui.showToast('附近暂无害虫');
        }
        return true;
      }
    }

    return false;
  }

  /**
   * 绘制地形机关状态微胶囊（清晰提示花费或剩余冷却，不遮挡原生立绘）
   */
  drawContraptionBadge(ctx, cx, cy, text, borderColor, textColor) {
    ctx.save();
    const w = 52;
    const h = 14;
    const x = Math.round(cx - w * 0.5);
    const y = Math.round(cy);
    ctx.fillStyle = 'rgba(16, 12, 8, 0.86)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, 7);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = 'bold 9.5px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, y + h * 0.5);
    ctx.restore();
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
        const pulse = Math.sin(time * 6) * 2;
        const grad = ctx.createRadialGradient(p.x, p.y - 18, 2, p.x, p.y - 18, 18 + pulse);
        grad.addColorStop(0, 'rgba(255, 224, 90, 0.36)');
        grad.addColorStop(0.55, 'rgba(255, 215, 0, 0.14)');
        grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 18, 18 + pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      const pLabel = isDigesting ? '消化中' : (p.cd > 0 ? `${Math.ceil(p.cd)}s` : `吞噬 ${p.cost}`);
      const pBorder = isReady ? 'rgba(115, 209, 61, 0.85)' : 'rgba(140, 110, 75, 0.50)';
      const pCol = isReady ? '#D9F7BE' : '#B8A88A';
      this.drawContraptionBadge(ctx, p.x, p.y + 13, pLabel, pBorder, pCol);

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

      // 纯 AI 手绘雷暴古木（远古中空雷击树桩，无任何英文字母或残次切边）
      const stumpImg = platform.getImage('assets/vfx/prop_thunder_stump.png');
      if (stumpImg && stumpImg.width) {
        const sw = 52;
        const sh = 50;
        ctx.drawImage(stumpImg, t.x - sw * 0.5, t.y - sh + 14, sw, sh);
      }

      // 内部雷电灵力光晕
      if (isReady) {
        const pulse = Math.sin(time * 8) * 2;
        const grad = ctx.createRadialGradient(t.x, t.y - 10, 2, t.x, t.y - 10, 20 + pulse);
        grad.addColorStop(0, 'rgba(105, 192, 255, 0.34)');
        grad.addColorStop(0.55, 'rgba(64, 169, 255, 0.12)');
        grad.addColorStop(1, 'rgba(64, 169, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(t.x, t.y - 10, 20 + pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      const tLabel = isReady ? `天雷 ${t.cost}` : `${Math.ceil(t.cd)}s`;
      const tBorder = isReady ? 'rgba(64, 169, 255, 0.85)' : 'rgba(140, 110, 75, 0.50)';
      const tCol = isReady ? '#BAE7FF' : '#B8A88A';
      this.drawContraptionBadge(ctx, t.x, t.y + 13, tLabel, tBorder, tCol);

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

  /**
   * 被动悬停射程环与用法提示（只读渲染，不消费孢子或触发冷却）
   */
  renderHoverTooltip(ctx, mapX, mapY, time) {
    if (mapX < 0 || mapY < 0) return;

    const drawHoverRingAndPill = (cx, cy, radiusPx, ringCol, titleStr) => {
      ctx.save();
      ctx.fillStyle = ringCol.fill;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radiusPx, radiusPx * 0.78, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = ringCol.stroke;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -Math.round(((time || 0) * 18) % 10);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 10.5px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      const tw = Math.ceil(ctx.measureText(titleStr).width);
      const pw = tw + 20;
      const ph = 22;
      const px = Math.max(8, Math.min(640 - pw - 8, Math.round(cx - pw * 0.5)));
      const py = Math.max(8, Math.round(cy - 44));

      ctx.fillStyle = 'rgba(18, 13, 8, 0.93)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(px, py, pw, ph, 6) : ctx.rect(px, py, pw, ph);
      ctx.fill();
      ctx.strokeStyle = ringCol.border;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#FFF9DB';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(titleStr, px + pw * 0.5, py + ph * 0.5);
      ctx.restore();
    };

    if (this.pitcher && Math.hypot(mapX - this.pitcher.x, mapY - this.pitcher.y) <= 26) {
      const p = this.pitcher;
      const status = p.digestTimer > 0 ? '消化产孢中...' : (p.cd > 0 ? `冷却中 ${Math.ceil(p.cd)}s` : `吞噬 (${p.cost}孢) · 瞬杀地面敌+45孢`);
      drawHoverRingAndPill(
        p.x, p.y, 75,
        { fill: 'rgba(149, 222, 100, 0.10)', stroke: 'rgba(149, 222, 100, 0.78)', border: '#73D13D' },
        `🌿 巨型猪笼草 · ${status}`
      );
      return;
    }

    if (this.thunderTree && Math.hypot(mapX - this.thunderTree.x, mapY - this.thunderTree.y) <= 26) {
      const t = this.thunderTree;
      const status = t.cd > 0 ? `充能中 ${Math.ceil(t.cd)}s` : `天雷 (${t.cost}孢) · 震击4敌眩晕2.2s`;
      drawHoverRingAndPill(
        t.x, t.y, 140,
        { fill: 'rgba(64, 169, 255, 0.08)', stroke: 'rgba(105, 192, 255, 0.78)', border: '#69C0FF' },
        `⚡ 雷击古木 · ${status}`
      );
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
        targetObstacle: null,
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
        armorPierceRatio: 0,
        flatArmorPierce: 0,
        holySmite: false,
        life: 0,
        maxLife: 2.0
      }),
      (b) => {
        b.hitUids.length = 0;
        b.targetEnemy = null;
        b.targetUid = 0;
        b.targetObstacle = null;
        b.burnZoneCfg = null;
        b.life = 0;
        b.flightTimer = 0;
        b.pierceCountSoFar = 0;
        b.hasToxicBurst = false;
        b.hasPoisonThorn = false;
        b.armorPierceRatio = 0;
        b.flatArmorPierce = 0;
        b.holySmite = false;
        b.sourceTower = null;
      },
      CONFIG.POOL_CAPS.BULLETS
    );

    // 雾团、酸雾与灼烧区对象池（上限 40）
    this.hazardPool = new ObjectPool(
      () => ({
        kind: 'mist', // 'mist' | 'burn' | 'acid'
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
        color: PALETTE.BRANCH_A,
        sourceTower: null
      }),
      (h) => {
        h.sourceTower = null;
        h.slow = 0;
        h.residualSlowDuration = 0;
        h.armorReduction = 0;
        h.dps = 0;
        h.timer = 0;
        h.affectAir = true;
      },
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
  spawnWatchBullet(x, y, targetEnemy, predX, predY, node, baseDamage, targetObstacle = null) {
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
    b.armorPierceRatio = (node.armorPierce && node.armorPierce < 1) ? node.armorPierce : 0;
    b.flatArmorPierce = (node.armorPierce && node.armorPierce >= 1) ? node.armorPierce : 0;
    b.targetEnemy = targetEnemy;
    b.targetUid = targetEnemy ? targetEnemy.uid : 0;
    b.targetObstacle = targetObstacle;
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
    b.armorPierceRatio = (node.armorPierce && node.armorPierce < 1) ? node.armorPierce : 0;
    b.flatArmorPierce = (node.armorPierce && node.armorPierce >= 1) ? node.armorPierce : 0;
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
  spawnLuminaRay(x, y, targetEnemy, node, baseDamage, targetObstacle = null) {
    const b = this.bulletPool.acquire(true);
    if (!b) return null;

    b.kind = 'lumina';
    b.spriteKey = 'proj_lumina';
    b.x = x;
    b.y = y;
    b.targetEnemy = targetEnemy;
    b.targetUid = targetEnemy ? targetEnemy.uid : 0;
    b.targetObstacle = targetObstacle;
    b.speed = 720;
    b.baseDamage = baseDamage || 22;
    b.holySmite = Boolean(node.holySmite);
    b.damageBonus = node.damageBonus || 0;
    b.isCrit = Math.random() < (node.critChance || 0.15);
    b.life = 0;
    b.maxLife = 1.0;
    b.branchColor = '#FFC53D';
    return b;
  }

  spawnMistCloud(x, y, node) {
    // 检查附近是否已有同类毒雾：直接刷新持续时间与效果，杜绝重复实体在同一地面堆叠
    const active = this.hazardPool.getActiveList();
    for (let i = 0; i < active.length; i++) {
      const ex = active[i];
      if (ex.kind === 'mist' && Math.hypot(ex.x - x, ex.y - y) <= 28) {
        ex.timer = 0;
        ex.duration = Math.max(ex.duration, node.cloudDuration || 3.0);
        ex.slow = Math.max(ex.slow, node.slow || 0.30);
        ex.dps = Math.max(ex.dps, node.dps || 4);
        if (node.sourceTower && !ex.sourceTower) {
          ex.sourceTower = node.sourceTower;
        }
        return ex;
      }
    }
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
    h.sourceTower = node.sourceTower || null;
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
    h.sourceTower = burnCfg.sourceTower || null;
    return h;
  }

  /**
   * 通用地面持续区域生成器（酸雾腐蚀区等元素反应/机关衍生物）
   */
  spawnHazard(cfg = {}) {
    const h = this.hazardPool.acquire(true);
    if (!h) return null;

    const kind = cfg.kind || 'acid';
    h.kind = kind;
    h.spriteKey = cfg.spriteKey || (kind === 'acid' ? 'acid_0' : (kind === 'mist' ? 'mist_base' : 'burn_0'));
    h.x = Number(cfg.x) || 0;
    h.y = Number(cfg.y) || 0;
    h.radiusPx = Math.max(16, Number(cfg.radiusPx) || 48);
    h.duration = Math.max(0.2, Number(cfg.duration) || 3.5);
    h.timer = 0;
    h.slow = Number(cfg.slow) || 0;
    h.residualSlowDuration = Number(cfg.residualSlowDuration) || 0;
    h.armorReduction = cfg.armorReduction !== undefined ? cfg.armorReduction : (kind === 'acid' ? 0.25 : 0);
    h.dps = Number(cfg.dps) || 0;
    h.affectAir = cfg.affectAir !== undefined ? Boolean(cfg.affectAir) : false;
    h.color = cfg.color || (kind === 'acid' ? '#A0D911' : (kind === 'mist' ? PALETTE.BRANCH_A : PALETTE.BRANCH_B));
    h.sourceTower = cfg.sourceTower || null;
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
            if (h.sourceTower) {
              h.sourceTower.totalDamage = (h.sourceTower.totalDamage || 0) + h.dps * dt;
            }
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
        if (b.targetObstacle) {
          if (b.targetObstacle.cleared) {
            this.bulletPool.releaseAt(i);
            continue;
          }
          const dx = b.targetObstacle.x - b.x;
          const dy = b.targetObstacle.y - b.y;
          const dist = Math.hypot(dx, dy);
          const stepMove = b.speed * dt;
          if (dist <= stepMove + 12) {
            const dmg = b.baseDamage + (b.damageBonus || 0);
            if (map && map.damageObstacle) {
              map.damageObstacle(b.targetObstacle, dmg, fx, economy, this.scene);
            }
            if (fx) {
              fx.spawnParticles(b.x, b.y, 8, ['#FFE58F', '#FAAD14'], 16, 35, 0.2, 0.4, 3);
            }
            this.bulletPool.releaseAt(i);
            continue;
          }
          b.x += (dx / dist) * stepMove;
          b.y += (dy / dist) * stepMove;
          b.angle = Math.atan2(dy, dx);
          continue;
        }
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
            fx,
            'lumina',
            { holySmite: b.holySmite, sourceTower: b.sourceTower }
          );
          if (this.elementalCombos) {
            this.elementalCombos.checkCombo(tgt, 'light', enemyManager, economy, fx, this.combatJuice);
          }
          tgt.activeSlow = Math.max(tgt.activeSlow || 0, 0.35);
          tgt.residualSlowTimer = Math.max(tgt.residualSlowTimer || 0, 2.0);
          tgt.residualSlowValue = Math.max(tgt.residualSlowValue || 0, 0.35);

          if (fx) {
            fx.spawnParticles(b.x, b.y, 10, ['#FFE58F', '#FAAD14', '#FFFDF5'], 18, 38, 0.2, 0.45, 3);
            fx.spawnFloatingText(tgt.x, tgt.y - 14, '圣光!', '#FFE58F', 0.9);
          }
          this.bulletPool.releaseAt(i);
          continue;
        }

        b.x += (dx / dist) * stepMove;
        b.y += (dy / dist) * stepMove;
        b.angle = Math.atan2(dy, dx);
      } else if (b.kind === 'watch') {
        if (b.targetObstacle) {
          if (b.targetObstacle.cleared) {
            this.bulletPool.releaseAt(i);
            continue;
          }
          const dx = b.targetObstacle.x - b.x;
          const dy = b.targetObstacle.y - b.y;
          const dist = Math.hypot(dx, dy);
          const stepMove = b.speed * dt;
          if (dist <= stepMove + 12) {
            const finalCrit = b.isCrit;
            const dmg = (b.baseDamage + (b.damageBonus || 0)) * (finalCrit ? 1.5 : 1.0);
            if (map && map.damageObstacle) {
              map.damageObstacle(b.targetObstacle, dmg, fx, economy, this.scene);
            }
            if (fx) {
              fx.onSingleHit(b.targetObstacle.x, b.targetObstacle.y, b.branchColor);
            }
            this.bulletPool.releaseAt(i);
            continue;
          }
          b.vx = (dx / dist) * b.speed;
          b.vy = (dy / dist) * b.speed;
          b.angle = Math.atan2(dy, dx);
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          continue;
        }
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
          if (finalCrit && this.combatJuice) {
            this.combatJuice.triggerCrit(tgt.x, tgt.y, b.baseDamage * 1.8, fx);
          }
          if (isVulnerable && fx) {
            fx.spawnFloatingText(tgt.x, tgt.y - 18, '破甲!', '#6FE8FF', 1.05);
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
            fx,
            'watch',
            { armorPierceRatio: b.armorPierceRatio || 0, flatArmorPierce: b.flatArmorPierce || 0, sourceTower: b.sourceTower }
          );
          if (this.elementalCombos) {
            this.elementalCombos.checkCombo(tgt, 'wood', enemyManager, economy, fx, this.combatJuice);
          }
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
                  fx.spawnFloatingText(b.x, b.y - 12, '酸蚀!', '#73D13D', 0.85);
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

        // 尖刺穿透伤害地图障碍物
        if (map && map.obstacles && map.damageObstacle) {
          for (let oI = 0; oI < map.obstacles.length; oI++) {
            const obs = map.obstacles[oI];
            if (obs.cleared) continue;
            if (b.hitUids.indexOf(obs) !== -1) continue;
            const odx = obs.x - b.x;
            const ody = obs.y - b.y;
            if (odx * odx + ody * ody <= 24 * 24) {
              b.hitUids.push(obs);
              const rampBonus = Math.min(b.pierceBonusMax, b.pierceCountSoFar * b.pierceBonusPerHit);
              const totalBonus = b.damageBonus + rampBonus;
              const obsDmg = b.baseDamage * (1 + totalBonus);
              map.damageObstacle(obs, obsDmg, fx, economy, this.scene);
              b.pierceRemaining -= 1;
              if (b.pierceRemaining <= 0) {
                this.bulletPool.releaseAt(i);
                break;
              }
            }
          }
          if (b.pierceRemaining <= 0) continue;
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
              fx,
              'thorn',
              { armorPierceRatio: b.armorPierceRatio || 0, flatArmorPierce: b.flatArmorPierce || 0, sourceTower: b.sourceTower }
            );
            if (fx) {
              fx.onSingleHit(e.x, e.y, b.branchColor);
            }

            if (this.elementalCombos) {
              this.elementalCombos.checkCombo(e, 'earth', enemyManager, economy, fx, this.combatJuice);
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
          if (this.combatJuice) {
            this.combatJuice.addTrauma(0.32);
            this.combatJuice.triggerShockwave(b.targetX, b.targetY, b.splashRadiusPx * 1.25, 'rgba(255, 140, 0, 0.82)');
          }
          const effRadius = b.splashRadiusPx * (b.hasToxicBurst ? 1.4 : 1.0);
          const r2 = effRadius * effRadius;
          if (economy) {
            economy.beginExplosionBatch();
          }

          // 爆裂菇抛物线炮火轰炸范围内的障碍物
          if (map && map.obstacles && map.damageObstacle) {
            for (let oI = 0; oI < map.obstacles.length; oI++) {
              const obs = map.obstacles[oI];
              if (obs.cleared) continue;
              const odx = obs.x - b.targetX;
              const ody = obs.y - b.targetY;
              if (odx * odx + ody * ody <= r2) {
                const obsDmg = b.baseDamage * (1 + b.damageBonus) * 0.9;
                map.damageObstacle(obs, obsDmg, fx, economy, this.scene);
              }
            }
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
                  fx.spawnFloatingText(b.targetX, b.targetY - 26, '毒爆!', '#52C41A', 1.2);
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
                if (fx) {
                  fx.spawnFloatingText(e.x, e.y - 22, b.hasToxicBurst ? '剧毒爆裂!' : '毒爆!', '#52C41A', b.hasToxicBurst ? 1.25 : 1.15);
                  fx.spawnParticles(e.x, e.y, b.hasToxicBurst ? 16 : 14, ['#52C41A', '#FFE58F', '#FFA940'], 40, 120, 0.2, 0.48, 3.5);
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
                fx,
                'burst',
                { sourceTower: b.sourceTower }
              );
              if (this.elementalCombos) {
                this.elementalCombos.checkCombo(e, 'fire', enemyManager, economy, fx, this.combatJuice);
              }
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
      const fadeAlpha = remain < 0.6 ? (remain / 0.6) : 1.0;
      const pulse = 0.85 + Math.sin(animTimeSec * 4 + i * 1.5) * 0.15;
      const alpha = Math.max(0.05, Math.min(1.0, fadeAlpha * pulse));

      ctx.save();
      ctx.translate(Math.round(h.x), Math.round(h.y));
      ctx.scale(1.0, 0.72); // 45度地面透视

      const r = h.radiusPx;
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, r);
      if (h.kind === 'mist') {
        grad.addColorStop(0, `rgba(179, 127, 235, ${0.28 * alpha})`);
        grad.addColorStop(0.55, `rgba(146, 84, 222, ${0.16 * alpha})`);
        grad.addColorStop(1, 'rgba(114, 46, 209, 0)');
      } else if (h.kind === 'acid') {
        grad.addColorStop(0, `rgba(160, 217, 17, ${0.34 * alpha})`);
        grad.addColorStop(0.55, `rgba(91, 140, 0, ${0.20 * alpha})`);
        grad.addColorStop(1, 'rgba(35, 120, 4, 0)');
      } else {
        grad.addColorStop(0, `rgba(255, 122, 69, ${0.35 * alpha})`);
        grad.addColorStop(0.60, `rgba(212, 56, 13, ${0.18 * alpha})`);
        grad.addColorStop(1, 'rgba(173, 33, 5, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      if (h.kind === 'acid') {
        ctx.strokeStyle = `rgba(186, 230, 55, ${0.36 * alpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 少量飘动的柔和微光孢子粒子
      const pulseTime = animTimeSec * 2.2 + i;
      ctx.fillStyle = h.kind === 'mist'
        ? `rgba(211, 173, 247, ${0.40 * alpha})`
        : (h.kind === 'acid'
          ? `rgba(186, 230, 55, ${0.52 * alpha})`
          : `rgba(255, 213, 145, ${0.40 * alpha})`);
      for (let pIdx = 0; pIdx < 3; pIdx++) {
        const pAng = (pIdx / 3) * Math.PI * 2 + pulseTime * 0.35;
        const pDist = r * 0.45 + Math.sin(pulseTime + pIdx) * (r * 0.15);
        ctx.beginPath();
        ctx.arc(Math.cos(pAng) * pDist, Math.sin(pAng) * pDist, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      platform.recordDrawCall(1);
    }
  }

  /**
   * 绘制飞行中的子弹与炮弹（优先使用 100% AI 手绘发光破空光针、地刺与真菌炸弹）
   */
  renderBullets(ctx) {
    const bullets = this.bulletPool.getActiveList();
    const hitSparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');

    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];

      let vfxPath = null;
      let drawW = 32, drawH = 32;
      if (b.kind === 'watch') {
        vfxPath = 'assets/vfx/proj_watch_arrow.png';
        drawW = 42; drawH = 14;
      } else if (b.kind === 'thorn') {
        vfxPath = 'assets/vfx/vfx_spikes.png';
        drawW = 28; drawH = 28;
      } else if (b.kind === 'burst') {
        vfxPath = 'assets/vfx/proj_burst_shell.png';
        drawW = 30; drawH = 30;
      } else if (b.kind === 'lumina') {
        vfxPath = 'assets/vfx/item_golden_spore.png';
        drawW = 22; drawH = 22;
      }

      const vfxImg = vfxPath ? platform.getImage(vfxPath) : null;
      if (vfxImg && vfxImg.width) {
        ctx.save();
        ctx.translate(Math.round(b.x), Math.round(b.y));

        if (b.kind === 'watch') {
          ctx.rotate(b.angle);
          ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
          ctx.restore();

          // 巡林神圣木羽箭尾部仙尘星芒微粒 (Fairy Dust Motes)
          ctx.save();
          const backX = b.x - Math.cos(b.angle) * 16;
          const backY = b.y - Math.sin(b.angle) * 16;
          ctx.fillStyle = 'rgba(255, 235, 140, 0.75)';
          ctx.beginPath();
          ctx.arc(backX, backY, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }

        if (b.kind === 'burst') {
          const rot = b.flightTimer * 14;
          ctx.rotate(rot);
          ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
          ctx.restore();
          continue;
        }

        if (b.kind === 'lumina') {
          // 灵光真菌与捕蝇草圣光法球：环绕星辉神圣光冕与琉璃微光
          const rot = (b.life || 0) * 8;
          ctx.rotate(rot);
          ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
          ctx.restore();

          // 纯自然圣光柔和渐变光晕
          ctx.save();
          const haloGrad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, 15);
          haloGrad.addColorStop(0, 'rgba(255, 240, 175, 0.45)');
          haloGrad.addColorStop(1, 'rgba(255, 229, 143, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }

        ctx.rotate(b.angle);
        ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
        ctx.restore();
        continue;
      }

      // 若尚未解码完毕，以纯自然优雅灵种光斑过渡，绝无生硬矩形
      ctx.save();
      ctx.fillStyle = b.branchColor || '#FFD700';
      ctx.beginPath();
      ctx.arc(Math.round(b.x), Math.round(b.y), 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      platform.recordDrawCall(1);
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
    this.towersDirty = true;
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
    const maxHp = typeId === 'thorn' ? 720 : (typeId === 'burst' ? 280 : (typeId === 'mist' ? 240 : (typeId === 'lumina' ? 180 : 220)));
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
        recoilTimer: 0,
      isWebbed: false,     // 是否被腐化蛛丝封印瘫痪
      webHealth: 0,        // 蛛丝血量（需点击3次解救）
      webMaxHealth: 3,
      superchargeTimer: 0, // 能量肥料超频大招倒计时
      totalDamage: 0,
      kills: 0
    };

    const tile = map.getTile(col, row);
    tile.tower = tower;
    this.towers.push(tower);
    this.towersDirty = true;

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
    tower.nodeId = targetNodeId;
    tower.node = nextNode;
    tower.level = (targetNodeId === 'base' ? 1 : (targetNodeId === 'lv1' ? 2 : 3));
    if (nextNode.branch) {
      tower.branch = nextNode.branch;
    }
    tower.totalInvested += nextNode.cost;

    // 播放 6 帧升级过渡动画 + 弹性缩放反馈
    tower.animState = 'upgrade';
    tower.animFrame = 0;
    tower.animTimer = 0;
    tower.upgradeAnimTimer = 0.42;
    tower.squashScaleX = 1.32;
    tower.squashScaleY = 0.72;
    tower.squashTimer = 0.28;

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
    this.towersDirty = true;
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
    this.towersDirty = true;
    }

    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 16, [PALETTE.UI_SPORE, PALETTE.MUSHROOM_GILL], 30, 95, 0.2, 0.45, 4);
      fx.spawnFloatingText(tower.x, tower.y - 8, '+' + refund, PALETTE.UI_SPORE, 1.15);
    }
    platform.playSfx('sfx_sell');

    return refund;
  }

  getEnemyRouteLength(map, enemy) {
    if (!map) return 1;
    if (enemy.isFlying) return (map.airRoute && map.airRoute.totalLengthPx) || 1;
    if (enemy.routeIndex === 1 && map.groundRoute2) return map.groundRoute2.totalLengthPx || 1;
    return (map.groundRoute && map.groundRoute.totalLengthPx) || 1;
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
        const routeLen = this.getEnemyRouteLength(map, cand);
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
      const routeLen = this.getEnemyRouteLength(map, e);
      const prog = e.distPx / Math.max(1, routeLen);
      if (prog > maxProgress) {
        maxProgress = prog;
        firstEnemy = e;
      }
    }
    return firstEnemy;
  }

  /**
   * 选择射程内可攻击的障碍物（集火优先，否则选最近）
   */
  selectObstacleTarget(tower, map, scene) {
    if (!map || !map.obstacles) return null;
    const rangePx = tower.node.range * TILE_SIZE;
    const r2 = rangePx * rangePx;

    // 1. 若玩家手动集火锁定了某个障碍物，优先判定该障碍物是否在射程内
    if (scene && scene.targetedObstacle && !scene.targetedObstacle.cleared) {
      const obs = scene.targetedObstacle;
      const dx = obs.x - tower.x;
      const dy = obs.y - tower.y;
      if (dx * dx + dy * dy <= r2) {
        return obs;
      }
    }

    // 2. 若玩家未指定，返回射程内最近的一个未清除障碍物
    let nearestObs = null;
    let minDist2 = Infinity;
    for (let i = 0; i < map.obstacles.length; i++) {
      const obs = map.obstacles[i];
      if (obs.cleared) continue;
      const dx = obs.x - tower.x;
      const dy = obs.y - tower.y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2 && d2 < minDist2) {
        minDist2 = d2;
        nearestObs = obs;
      }
    }
    return nearestObs;
  }

  destroyTower(tower, fx = null) {
    if (!tower) return;
    const scene = this.scene;
    const map = scene ? scene.map : null;

    // 1. 清空地图地块上的塔占用（使该战术坑位重新变为空闲灵土，必须重新花费孢子种植）
    if (map) {
      const tile = map.getTile(tower.col, tower.row);
      if (tile && tile.tower === tower) {
        tile.tower = null;
      }
    }

    // 2. 从防御塔管理列表中彻底移除（植物死了就是死了，真实阵亡不复生）
    const idx = this.towers.indexOf(tower);
    if (idx !== -1) {
      this.towers.splice(idx, 1);
    }
    this.towersDirty = true;

    // 3. 关闭选中和详情面板
    if (scene && scene.selectedTile && scene.selectedTile.col === tower.col && scene.selectedTile.row === tower.row) {
      scene.selectedTile = { col: -1, row: -1 };
      if (scene.ui) scene.ui.inspectorOpen = false;
    }

    // 4. 触发植物枯萎破碎粒子、阵亡音效与战局警报（阵亡 0 孢子返还）
    const effFx = fx || (scene ? scene.fx : null);
    if (effFx) {
      effFx.spawnParticles(tower.x, tower.y, 24, ['#8C6842', '#52C41A', '#389E0D', '#FF7875', '#5C381E'], 35, 90, 0.3, 0.65, 5);
      effFx.spawnFloatingText(tower.x, tower.y - 20, '🥀 植物阵亡！', '#FF4D4F', 1.6);
      const name = (tower.def && tower.def.nameKey) ? i18n.t(tower.def.nameKey) : '蘑菇卫士';
      effFx.showBanner('🥀 防线失守！', '#FF4D4F', `${name} 被虫潮击溃阵亡，战术坑位已空出！`, 2.0);
      effFx.triggerScreenShake(4.0, 0.3);
    }
    platform.playSfx('sfx_bomb');
  }

  damageTower(tower, dmg, attacker, fx) {
    if (!tower) return;
    const prevHp = tower.hp;
    tower.hp -= dmg;
    tower.hitWobbleTimer = 0.22;
    if (fx) {
      fx.spawnParticles(tower.x, tower.y - 8, 4, [PALETTE.MUSHROOM_CAP, PALETTE.UI_SPORE], 20, 60, 0.15, 0.25, 3);
      fx.spawnFloatingText(tower.x, tower.y - 14, `-${Math.round(dmg)}`, '#FF7875', 0.95);
    }
    // 反击荆棘
    if (tower.typeId === 'thorn' && attacker && attacker.state !== 'death') {
      const reflect = Math.round(dmg * 1.5);
      attacker.hp -= reflect;
      if (fx) {
        fx.spawnFloatingText(attacker.x, attacker.y - 12, `⚡ -${reflect}`, PALETTE.BRANCH_B, 1.0);
        fx.spawnParticles(attacker.x, attacker.y, 6, [PALETTE.BRANCH_B, '#FFE58F'], 30, 80, 0.2, 0.35, 4);
      }
    }

    // 濒死急救告警 (HP 降至 35% 以下时首次触发求援告警，引导玩家施放甘霖或调遣英雄协防)
    if (tower.hp > 0 && tower.hp / tower.maxHp <= 0.35 && (prevHp / tower.maxHp > 0.35 || !tower.dangerWarned)) {
      tower.dangerWarned = true;
      if (fx) {
        fx.spawnFloatingText(tower.x, tower.y - 24, '⚠️ 守卫垂危！求援！', '#FFA39E', 1.3);
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([20, 40, 20]); } catch (e) {}
      }
    }

    if (tower.hp <= 0) {
      tower.hp = 0;
      this.destroyTower(tower, fx);
    }
  }

  healTower(tower, amount, isFullRevive = false, fx = null) {
    if (!tower) return;
    if (isFullRevive) {
      tower.hp = tower.maxHp;
      tower.dormantTimer = 0;
      tower.poisonTimer = 0;
      tower.isWebbed = false; // 净化蛛丝封印
      tower.buffTimer = 6.0; // 甘霖狂暴 6 秒
    } else {
      tower.hp = Math.min(tower.maxHp, tower.hp + amount);
      if (tower.hp > tower.maxHp * 0.35) tower.dangerWarned = false;
      if (tower.hp > 0) tower.dormantTimer = 0;
    }
    if (fx) {
      fx.spawnParticles(tower.x, tower.y - 10, 8, ['#52C41A', '#B7EB8F', '#FFE58F'], 25, 75, 0.2, 0.4, 4);
      fx.spawnFloatingText(tower.x, tower.y - 16, isFullRevive ? '+HP 圣愈苏醒!' : `+${Math.round(amount)} 生命`, '#52C41A', 1.0);
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

    // 局部化自然菌根共鸣微光（在达成羁绊的蘑菇基座周围浮动金翠孢子光晕，避免跨全图直线穿插）
    const seenSymb = new Set();
    for (let i = 0; i < this.networkEdges.length; i++) {
      const edge = this.networkEdges[i];
      const pair = [edge.a, edge.b];
      for (let p = 0; p < 2; p++) {
        const tw = pair[p];
        if (!tw || seenSymb.has(tw)) continue;
        seenSymb.add(tw);
        const isGrand = tw.synergies && tw.synergies.hasGrandResonance;
        const pulse = 0.72 + Math.sin((this.animTimer || 0) * 3.2 + tw.col) * 0.25;
        ctx.save();
        ctx.strokeStyle = isGrand ? `rgba(255, 224, 110, ${0.26 * pulse})` : `rgba(135, 232, 160, ${0.20 * pulse})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(tw.x, tw.y + 11, 20, 9, 0, 0, Math.PI * 2);
        ctx.stroke();
        const ang = (this.animTimer || 0) * 1.8 + tw.row * 1.1;
        ctx.fillStyle = isGrand ? 'rgba(255, 235, 145, 0.55)' : 'rgba(186, 255, 210, 0.45)';
        ctx.beginPath();
        ctx.arc(tw.x + Math.cos(ang) * 18, tw.y + 10 + Math.sin(ang) * 7, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
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

    // 更新灵光菇圣域对邻近防卫塔的伤害/攻速/护盾增益
    for (let i = 0; i < this.towers.length; i++) {
      this.towers[i].luminaDmgBonus = 0;
      this.towers[i].luminaAspdBonus = 0;
      this.towers[i].hasHolyWard = false;
    }
    for (let i = 0; i < this.towers.length; i++) {
      const lt = this.towers[i];
      if (lt.typeId !== 'lumina' || lt.isWebbed || lt.dormantTimer > 0) continue;
      const auraRangePx = (lt.node.range || 4.0) * TILE_SIZE;
      const dmgB = lt.node.auraDmgBonus || 0;
      const aspdB = lt.node.auraAspdBonus || 0;
      const ward = Boolean(lt.node.holyWard);
      if (!dmgB && !aspdB && !ward) continue;
      for (let j = 0; j < this.towers.length; j++) {
        if (i === j) continue;
        const ot = this.towers[j];
        if (Math.hypot(ot.x - lt.x, ot.y - lt.y) <= auraRangePx) {
          if (dmgB > ot.luminaDmgBonus) ot.luminaDmgBonus = dmgB;
          if (aspdB > ot.luminaAspdBonus) ot.luminaAspdBonus = aspdB;
          if (ward) ot.hasHolyWard = true;
        }
      }
    }

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
      } else if (t.recoilTimer > 0) {
        t.recoilTimer -= dt;
        const p = Math.max(0, t.recoilTimer) / 0.16;
        t.squashScaleX = 1.0 + Math.sin(p * Math.PI) * 0.12;
        t.squashScaleY = 1.0 - Math.sin(p * Math.PI) * 0.12;
        if (t.recoilTimer <= 0) {
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
      if (t.stunTimer > 0) {
        t.stunTimer = Math.max(0, t.stunTimer - dt);
        t.animState = 'idle';
        continue; // 被首领践踏震晕，暂停攻击
      }
      if (t.dormantTimer > 0) {
        t.dormantTimer = Math.max(0, t.dormantTimer - dt);
        if (t.dormantTimer <= 0) {
          t.hp = Math.round(t.maxHp * 0.5); // 自然复苏恢复 50% HP
        }
        continue; // 处于枯萎休眠状态，暂停攻击
      }

      // 冷却递减（狂暴加速，中毒减速，灵光光环，超频射速）
      let speedCoeff = (t.superchargeTimer > 0 ? 2.2 : (t.buffTimer > 0 ? 1.6 : 1.0)) * (t.poisonTimer > 0 ? 0.65 : 1.0);
      if (t.luminaAspdBonus > 0) {
        speedCoeff *= (1 + t.luminaAspdBonus);
      }
      if (t.synergies && t.synergies.hasGrandResonance) {
        speedCoeff *= 1.15;
      }
      if (this.scene && this.scene.photosyntheticSurgeBonus && this.towers.length >= 3) {
        speedCoeff *= (1.0 + this.scene.photosyntheticSurgeBonus);
      }
      if (t.cooldown > 0) {
        t.cooldown = Math.max(0, t.cooldown - dt * speedCoeff);
      }

      // 第 5 位守卫灵光菇：定期产孢、A线战地群疗脉冲、圣幕净化蛛网酸蚀
      if (t.typeId === 'lumina') {
        if (t.node.sporeGen > 0) {
          t.sporeHarvestTimer = (t.sporeHarvestTimer || 0) + dt * speedCoeff;
          const hInterval = t.node.sporeInterval || 10.0;
          if (t.sporeHarvestTimer >= hInterval) {
            t.sporeHarvestTimer = 0;
            const gen = t.node.sporeGen;
            if (economy) {
              economy.addSpores(gen);
            }
            if (fx) {
              fx.spawnFloatingText(t.x, t.y - 24, `+${gen} 孢子`, '#FFE58F', 1.15);
              if (fx.spawnShockwave) fx.spawnShockwave(t.x, t.y, 32, '#FFE58F');
              else if (fx.spawnRing) fx.spawnRing(t.x, t.y, 32, '#FFE58F', 0.35, false);
            }
            platform.playSfx('sfx_coin');
          }
        }

        const pulseInterval = t.node.healInterval || 4.5;
        if (t.node.auraHeal > 0 || t.node.holyWard) {
          t.auraPulseTimer = (t.auraPulseTimer || 0) + dt * speedCoeff;
          if (t.auraPulseTimer >= pulseInterval) {
            t.auraPulseTimer = 0;
            const radPx = (t.node.range || 4.5) * TILE_SIZE;
            const healAmt = t.node.auraHeal || 0;
            let didPulse = false;

            if (healAmt > 0) {
              for (let j = 0; j < this.towers.length; j++) {
                const ot = this.towers[j];
                if (ot.hp > 0 && ot.hp < ot.maxHp && Math.hypot(ot.x - t.x, ot.y - t.y) <= radPx) {
                  this.healTower(ot, healAmt, false, fx);
                  didPulse = true;
                }
              }
              if (sporelingPatrol) {
                sporelingPatrol.healGuards(t.x, t.y, radPx, healAmt);
                didPulse = true;
              }
            }

            if (t.node.holyWard) {
              for (let j = 0; j < this.towers.length; j++) {
                const ot = this.towers[j];
                if (Math.hypot(ot.x - t.x, ot.y - t.y) <= radPx) {
                  if (ot.isWebbed || ot.poisonTimer > 0) {
                    ot.isWebbed = false;
                    ot.webHealth = 0;
                    ot.poisonTimer = 0;
                    didPulse = true;
                    if (fx) {
                      fx.spawnFloatingText(ot.x, ot.y - 20, '圣幕净化!', '#BAE7FF', 1.0);
                      fx.spawnParticles(ot.x, ot.y, 8, ['#BAE7FF', '#FFFFFF'], 15, 30);
                    }
                  }
                }
              }
            }

            if (didPulse && fx) {
              if (fx.spawnRing) fx.spawnRing(t.x, t.y, radPx * 0.45, '#73D13D', 0.4, false);
              fx.spawnParticles(t.x, t.y, 8, ['#52C41A', '#FFE58F'], 20, 40);
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

      // 冷却就绪时尝试索敌并开火 (优先保卫萝卜/PVZ 智能优先级)
      if (t.cooldown <= 0) {
        let target = null;
        let isAttackingObs = false;

        // 判定是否有手动集火锁定的障碍物在射程内
        const targetedObs = (this.scene && this.scene.targetedObstacle && !this.scene.targetedObstacle.cleared)
          ? this.scene.targetedObstacle
          : null;
        const targetedObsInRange = targetedObs && (Math.hypot(targetedObs.x - t.x, targetedObs.y - t.y) <= t.node.range * TILE_SIZE);

        if (targetedObsInRange) {
          // 检查是否有怪物极度逼近老家（距离仓库终点 < 110px 紧急泄漏危险）
          let urgentThreat = false;
          if (aliveEnemies.length > 0) {
            for (let eI = 0; eI < aliveEnemies.length; eI++) {
              const enemy = aliveEnemies[eI];
              if (enemy.state === 'death') continue;
              const routeLen = this.getEnemyRouteLength(map, enemy);
              if (routeLen - enemy.distPx <= 110) {
                urgentThreat = true;
                break;
              }
            }
          }
          if (!urgentThreat) {
            target = targetedObs;
            isAttackingObs = true;
          }
        }

        // 若没有集火障碍物，则正常索敌场上敌人
        if (!target && aliveEnemies.length > 0) {
          target = this.selectTarget(t, aliveEnemies, map);
        }

        // 若当前射程内无敌人（或波次间歇、场上无怪），且有可清除障碍物，自动开荒攻击障碍物
        if (!target) {
          const autoObs = this.selectObstacleTarget(t, map, this.scene);
          if (autoObs) {
            target = autoObs;
            isAttackingObs = true;
          }
        }

        if (target) {
          if (isAttackingObs) {
            this.fireTowerAtObstacle(t, target, bulletManager);
          } else {
            this.fireTower(t, target, map, enemyManager, bulletManager);
          }
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

  getBuffedNode(tower) {
    if (!tower || !tower.node) return tower.node;
    if (!tower.luminaDmgBonus) return tower.node;
    return Object.assign({}, tower.node, {
      damageBonus: (tower.node.damageBonus || 0) + tower.luminaDmgBonus
    });
  }

  fireTowerAtObstacle(tower, obs, bulletManager) {
    const node = this.getBuffedNode(tower);
    const baseDmg = tower.typeId === 'lumina' ? (node.damage || tower.def.baseDamage) : tower.def.baseDamage;
    if (tower.typeId === 'watch') {
      const watchNode = Object.assign({}, node);
      if (tower.synergies && tower.synergies.hasTwinWatch) {
        watchNode.critChance = (watchNode.critChance || 0) + 0.20;
      }
      bulletManager.spawnWatchBullet(tower.x, tower.y - 10, null, obs.x, obs.y, watchNode, baseDmg, obs);
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'mist') {
      bulletManager.spawnMistCloud(obs.x, obs.y, node);
      platform.playSfx('sfx_mist');
    } else if (tower.typeId === 'thorn') {
      const baseAngle = Math.atan2(obs.y - tower.y, obs.x - tower.x);
      const thornOpts = { hasPoisonThorn: tower.synergies && tower.synergies.hasPoisonThorn };
      bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle, node, baseDmg, 1.0, thornOpts);
      platform.playSfx('sfx_thorn');
    } else if (tower.typeId === 'burst') {
      const burstOpts = { hasToxicBurst: tower.synergies && tower.synergies.hasToxicBurst };
      bulletManager.spawnBurstShell(tower.x, tower.y - 12, obs.x, obs.y, node, baseDmg, burstOpts);
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'lumina') {
      bulletManager.spawnLuminaRay(tower.x, tower.y - 10, null, node, baseDmg, obs);
      platform.playSfx('sfx_laser');
    }
  }

  fireTower(tower, target, map, enemyManager, bulletManager) {
    tower.recoilTimer = 0.16;
    const node = this.getBuffedNode(tower);
    const baseDmg = tower.typeId === 'lumina' ? (node.damage || tower.def.baseDamage) : tower.def.baseDamage;

    if (tower.typeId === 'watch') {
      const dist = Math.hypot(target.x - tower.x, target.y - tower.y);
      const travelSec = dist / (node.bulletSpeed || 640);
      const pred = enemyManager.predictEnemyPosition(target, travelSec, map);
      const watchNode = Object.assign({}, node);
      if (tower.synergies && tower.synergies.hasTwinWatch) {
        watchNode.critChance = (watchNode.critChance || 0) + 0.20;
      }
      const wb = bulletManager.spawnWatchBullet(tower.x, tower.y - 10, target, pred.x, pred.y, watchNode, baseDmg);
      if (wb) wb.sourceTower = tower;
      if (this.mushroomMastery && this.mushroomMastery.hasMastery('watch', 'watch_m2')) {
        if (Math.random() < 0.22) {
          const wb2 = bulletManager.spawnWatchBullet(tower.x + 6, tower.y - 12, target, pred.x + 8, pred.y + 4, watchNode, baseDmg);
          if (wb2) wb2.sourceTower = tower;
        }
      }
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'mist') {
      const mh = bulletManager.spawnMistCloud(target.x, target.y, node);
      if (mh) mh.sourceTower = tower;
      platform.playSfx('sfx_mist');
    } else if (tower.typeId === 'thorn') {
      const dist = Math.hypot(target.x - tower.x, target.y - tower.y);
      const travelSec = dist / (node.bulletSpeed || 900);
      const pred = enemyManager.predictEnemyPosition(target, travelSec, map);
      const baseAngle = Math.atan2(pred.y - tower.y, pred.x - tower.x);

      // 主刺
      const thornOpts = { hasPoisonThorn: tower.synergies && tower.synergies.hasPoisonThorn };
      const tb = bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle, node, baseDmg, 1.0, thornOpts);
      if (tb) tb.sourceTower = tower;

      // A3 箭袋：每次齐射增加 2 根侧刺（左右各偏 12°），侧刺伤害 50%
      if (node.sideSpikes && node.sideSpikes >= 2) {
        const deltaRad = ((node.sideAngleDeg || 12) * Math.PI) / 180;
        const sideRatio = node.sideDamageRatio || 0.50;
        const tbL = bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle - deltaRad, node, baseDmg, sideRatio);
        const tbR = bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle + deltaRad, node, baseDmg, sideRatio);
        if (tbL) tbL.sourceTower = tower;
        if (tbR) tbR.sourceTower = tower;
      }
      platform.playSfx('sfx_thorn');
    } else if (tower.typeId === 'burst') {
      const pred = enemyManager.predictEnemyPosition(target, node.flightTime || 0.38, map);
      const burstOpts = { hasToxicBurst: tower.synergies && tower.synergies.hasToxicBurst };
      const bb = bulletManager.spawnBurstShell(tower.x, tower.y - 12, pred.x, pred.y, node, baseDmg, burstOpts);
      if (bb) bb.sourceTower = tower;
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'lumina') {
      const lb = bulletManager.spawnLuminaRay(tower.x, tower.y - 10, target, node, baseDmg);
      if (lb) lb.sourceTower = tower;
      platform.playSfx('sfx_laser');
    }
  }

  /**
   * 绘制所有已建造的蘑菇炮塔及其形态徽章
   */
  render(ctx) {
    // 仅在防御塔增删改变时执行排序，杜绝每帧 60 次创建闭包排序导致卡顿
    if (this.towersDirty) {
      this.towers.sort((a, b) => a.row - b.row || a.col - b.col);
      this.towersDirty = false;
    }

    for (let i = 0; i < this.towers.length; i++) {
      const t = this.towers[i];
      let tileX = t.col * TILE_SIZE;
      let tileY = t.row * TILE_SIZE;

      // 受击弹性微晃
      if (t.hitWobbleTimer > 0) {
        tileX += Math.round(Math.sin(t.hitWobbleTimer * 30) * 2.5);
      }

      // 幽夜微光专属：真菌生物发光荧光光环 (Bioluminescent Tower Aura)
      const isNightMode = (this.scene && this.scene.weather && this.scene.weather.currentWeather === 'night') ||
                          (this.scene && this.scene.map && this.scene.map.mapData && this.scene.map.mapData.theme === 'night_fungi');
      if (isNightMode) {
        ctx.save();
        const auraPulse = 0.6 + Math.sin((t.animTimer || 0) * 3.2 + i) * 0.25;
        let auraR = 105, auraG = 192, auraB = 255;
        if (t.typeId === 'lumina') { auraR = 255; auraG = 225; auraB = 100; }
        else if (t.typeId === 'burst') { auraR = 255; auraG = 110; auraB = 50; }
        else if (t.typeId === 'mist') { auraR = 190; auraG = 130; auraB = 255; }
        else if (t.typeId === 'thorn') { auraR = 95; auraG = 230; auraB = 135; }

        const auraGrad = ctx.createRadialGradient(t.x, tileY + 22, 3, t.x, tileY + 22, 28);
        auraGrad.addColorStop(0, 'rgba(' + auraR + ',' + auraG + ',' + auraB + ',' + (0.45 * auraPulse) + ')');
        auraGrad.addColorStop(0.65, 'rgba(' + auraR + ',' + auraG + ',' + auraB + ',' + (0.15 * auraPulse) + ')');
        auraGrad.addColorStop(1, 'rgba(' + auraR + ',' + auraG + ',' + auraB + ',0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(t.x, tileY + 22, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
            // 濒死受损颤抖 (HP <= 35%)
      const isCritical = t.hp > 0 && (t.hp / t.maxHp <= 0.35);
      if (isCritical) {
        tileX += Math.sin((t.animTimer || 0) * 22) * 1.5;
      }

      // 落地 Squash & Stretch 弹性变形绘制
      const isSquashing = t.squashTimer > 0 || t.recoilTimer > 0;
      if (isSquashing) {
        ctx.save();
        ctx.translate(t.x, tileY + 24);
        ctx.scale(t.squashScaleX, t.squashScaleY);
        ctx.translate(-t.x, -(tileY + 24));
      }

      // 升级瞬间的神圣升阶光柱
      if (t.upgradeAnimTimer > 0) {
        const upAlpha = Math.min(1, t.upgradeAnimTimer / 0.42) * 0.55;
        const beamCol = t.branch === 'A' ? 'rgba(111, 232, 255,' : (t.branch === 'B' ? 'rgba(255, 192, 105,' : 'rgba(255, 229, 143,');
        ctx.save();
        const beamGrad = ctx.createLinearGradient(t.x, tileY - 36, t.x, tileY + 24);
        beamGrad.addColorStop(0, beamCol + ' 0)');
        beamGrad.addColorStop(0.5, beamCol + ` ${upAlpha.toFixed(2)})`);
        beamGrad.addColorStop(1, beamCol + ' 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(Math.round(t.x - 14), Math.round(tileY - 36), 28, 60);
        ctx.restore();
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

      // 濒死预警指示 (HP <= 35%)
      if (isCritical) {
        ctx.save();
        const pulse = 0.8 + Math.sin((t.animTimer || 0) * 10) * 0.2;
        ctx.fillStyle = `rgba(255, 77, 79, ${0.85 * pulse})`;
        ctx.font = 'bold 10px "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠️ 守卫垂危!', t.x, tileY - 18);
        ctx.restore();
      }

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
const storage = require('../save/storage');

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
      if (!g || !g.type || typeof g.count !== 'number') continue;
      if (!counts[g.type]) {
        counts[g.type] = 0;
        order.push(g.type);
      }
      counts[g.type] += g.count;
    }

    return order.map((type) => ({
      type,
      def: ENEMIES[type],
      count: counts[type] || 0
    }));
  }

  /**
   * 提炼即将到来波次的简明战术预警文本（防空/侧翼/潜地/吐网/首领）
   */
  getUpcomingThreatSummaryText() {
    const waveDef = this.waveList[Math.min(this.totalWaves, this.currentWaveIndex) - 1];
    if (!waveDef || !waveDef.groups) {
      return `第 ${this.currentWaveIndex} 波 · 深渊强袭`;
    }
    const tags = [];
    const seen = new Set();
    const pushTag = (t) => {
      if (!seen.has(t) && tags.length < 3) {
        seen.add(t);
        tags.push(t);
      }
    };
    let hasFlank = false;
    for (let i = 0; i < waveDef.groups.length; i++) {
      const g = waveDef.groups[i];
      if (!g) continue;
      if (g.routeIndex === 1) hasFlank = true;
      const def = ENEMIES[g.type];
      if (def && def.isBoss) pushTag('首领降临');
      else if (def && def.isFlying) pushTag('防空警报');
      else if (g.type === 'burrower') pushTag('潜地突袭');
      else if (g.type === 'weaver') pushTag('蛛网封塔');
      else if (g.type === 'leaper') pushTag('后排跃击');
      else if (g.type === 'armored' || g.type === 'siege_beetle') pushTag('重甲护卫');
    }
    if (hasFlank) pushTag('侧翼来袭');
    if (tags.length === 0) pushTag('前锋虫群');
    return `第 ${this.currentWaveIndex} 波 · ${tags.join(' · ')}`;
  }

  /**
   * 计算当前战斗波次的实时推进百分比 (0.0 -> 1.0)，用于平滑波次进度条与无尽模式展示
   */
  getWaveSubProgress(enemyManager) {
    if (this.phase !== 'combat' || !this.activeGroups || this.activeGroups.length === 0) {
      return this.phase === 'completed' ? 1.0 : 0.0;
    }
    let totalToSpawn = 0;
    let totalSpawned = 0;
    for (let i = 0; i < this.activeGroups.length; i++) {
      const g = this.activeGroups[i];
      totalToSpawn += (g.count || 0);
      totalSpawned += (g.spawned || 0);
    }
    if (totalToSpawn <= 0) return 0.5;
    const spawnRatio = Math.min(1.0, totalSpawned / totalToSpawn);
    const aliveCount = (enemyManager && typeof enemyManager.getAliveEnemies === 'function')
      ? enemyManager.getAliveEnemies().length
      : 0;
    const defeatedCount = Math.max(0, totalSpawned - aliveCount);
    const killRatio = Math.min(1.0, defeatedCount / totalToSpawn);
    return Math.max(0.05, Math.min(1.0, spawnRatio * 0.45 + killRatio * 0.55));
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
  callNextWaveEarly(economy, fx, scene = null) {
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
    this.startCurrentWave(economy, fx, scene);
    platform.playSfx('sfx_upgrade');
    return bonus;
  }

  /**
   * 正式开始当前波次
   */
  startCurrentWave(economy, fx, scene = null) {
    let waveDef = this.waveList[this.currentWaveIndex - 1];
    if (!waveDef) {
      // 动态生成无尽深渊波次
      const extraWaves = this.currentWaveIndex - this.waveList.length;
      const enemyPool = ['beetle', 'swift', 'armored', 'moth', 'splitter', 'burrower', 'weaver', 'leaper', 'siege_beetle', 'volatile_pod'];
      const gCount = Math.min(6, 2 + Math.floor(extraWaves / 2));
      const groups = [];
      for (let gi = 0; gi < gCount; gi++) {
        const eType = (gi === gCount - 1 && extraWaves % 5 === 0)
          ? (extraWaves % 10 === 0 ? 'boss_m4' : (extraWaves % 5 === 0 ? 'boss_m3' : 'boss_m1'))
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
      groupLateralBase: ((idx % 3) - 1) * 3,
      routeIndex: g.routeIndex || 0
    }));

    // 检查是否包含首领或大波次（PVZ经典：一大波僵尸正在逼近 / 最终波次决战号角）
    const hasBoss = this.activeGroups.some((g) => ENEMIES[g.type] && ENEMIES[g.type].isBoss);
    const isNight = (scene && scene.weather && scene.weather.currentWeather === 'night') || (this.mapId === 'map3');
    const isMidWave = (this.currentWaveIndex === 5);
    const isFinalWave = (this.currentWaveIndex === this.totalWaves);

    if (hasBoss) {
      if (!isNight) platform.playBgm('boss_' + this.mapId);
      if (fx) {
        fx.showBanner(
          i18n.t('banner_boss_incoming'),
          PALETTE.ENEMY_EYE,
          i18n.t('wave_label') + ' ' + this.currentWaveIndex + '/' + this.totalWaves,
          1.8
        );
        fx.triggerScreenShake(4.5, 0.35);
      }
      platform.playSfx('sfx_wave_horn');
    } else if (isFinalWave) {
      if (!isNight) platform.playBgm('bgm_battle');
      if (fx) {
        fx.showBanner(
          '🔥 虫潮总攻 · 终极决战！',
          '#FF4D4F',
          '全线守卫就位！击退所有侵略者守护森林家园！',
          2.2
        );
        fx.triggerScreenShake(5.0, 0.45);
      }
      platform.playSfx('sfx_wave_horn');
    } else if (isMidWave) {
      if (!isNight) platform.playBgm('bgm_battle');
      if (fx) {
        fx.showBanner(
          '⚠️ 一大波暗黑虫潮正在逼近！',
          '#FAAD14',
          '中坚攻势来袭，警惕多路突袭！',
          1.8
        );
        fx.triggerScreenShake(3.5, 0.3);
      }
      platform.playSfx('sfx_wave_horn');
    } else {
      if (isNight) {
        platform.playBgm('bgm_night');
      } else {
        platform.playBgm('bgm_battle');
      }
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
        this.startCurrentWave(economy, fx, scene);
      }
      return;
    }

    if (this.phase === 'combat') {
      this.waveElapsedSec += dt;

      let allGroupsFinished = true;
      for (let i = 0; i < this.activeGroups.length; i++) {
        const g = this.activeGroups[i];
        if (!g.type || typeof g.count !== 'number' || g.spawned >= g.count) continue;
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
          platform.playSfx(rewardInfo.flawlessBonus > 0 ? 'sfx_win' : 'sfx_multikill', 0.85);
          if (fx) {
            const sub = rewardInfo.flawlessBonus > 0
              ? ('+' + rewardInfo.waveReward + ' / ' + i18n.t('banner_flawless'))
              : ('+' + rewardInfo.waveReward + ' ' + i18n.t('spores_label'));
            fx.showBanner(i18n.t('banner_wave_clear'), PALETTE.UI_SPORE, sub, 1.4);
            if (typeof fx.spawnWaveClearCelebration === 'function') {
              fx.spawnWaveClearCelebration(480, 160, rewardInfo.waveReward);
            }
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
const { ENEMIES } = require('../data/enemies');
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
  } else if (style === 'dim') {
    strokeColor = 'rgba(14, 10, 6, 0.72)';
    gradColors = ['#C4B79E', '#A89B84', '#8C7F6A', '#6B604E'];
  } else if (style === 'white') {
    strokeColor = 'rgba(0, 0, 0, 0.82)';
    gradColors = ['#FFFFFF', '#FFFFFF', '#F0F0F0', '#D9D9D9'];
  }

  if (options.strokeColor) strokeColor = options.strokeColor;
  if (options.shadowColor) shadowColor = options.shadowColor;

  // 精细字体轮廓规范：<=13px 小字彻底免除粗重描边糊字，仅以 1px 清晰落影提亮；中大字收窄为发丝微边
  let effectiveStroke = 0;
  if (options.strokeWidth !== undefined) {
    effectiveStroke = size <= 13 ? Math.min(0.65, options.strokeWidth) : Math.min(1.4, options.strokeWidth * 0.78);
  } else {
    effectiveStroke = size <= 13 ? 0 : (size <= 17 ? 0.55 : Math.min(1.4, size * 0.065));
  }

  // 性能飞跃优化：用 1px 偏移轻投影彻底替换极其昂贵的 ctx.shadowBlur（消除每秒上千次高斯模糊软光栅化）
  if (shadowColor && shadowColor !== 'transparent') {
    ctx.fillStyle = shadowColor;
    if (options.maxWidth) {
      ctx.fillText(str, x, y + 1, options.maxWidth);
    } else {
      ctx.fillText(str, x, y + 1);
    }
  }

  // 2. 发丝级描边（若开启）
  if (effectiveStroke > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = effectiveStroke * 1.15;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    if (options.maxWidth) {
      ctx.strokeText(str, x, y, options.maxWidth);
    } else {
      ctx.strokeText(str, x, y);
    }
  }

  // 3. 字体字面（小字直接采用高对比亮色或调用方指定的 options.color）
  if (size <= 15 || style !== 'gold' || options.color) {
    ctx.fillStyle = options.color || gradColors[0];
    if (options.maxWidth) {
      ctx.fillText(str, x, y, options.maxWidth);
    } else {
      ctx.fillText(str, x, y);
    }
  } else {
    const h = size;
    const topY = baseline === 'middle' ? y - h * 0.5 : (baseline === 'top' ? y : y - h);
    const grad = ctx.createLinearGradient(x, topY, x, topY + h);
    grad.addColorStop(0.0, gradColors[0]);
    grad.addColorStop(0.45, gradColors[1]);
    grad.addColorStop(1.0, gradColors[2]);
    ctx.fillStyle = grad;
    if (options.maxWidth) {
      ctx.fillText(str, x, y, options.maxWidth);
    } else {
      ctx.fillText(str, x, y);
    }
  }

  // 4. 大号黄金标题顶边微高光
  if (size >= 16 && style === 'gold' && !options.color) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#FFFFFF';
    if (options.maxWidth) {
      ctx.fillText(str, x, y - 0.6, options.maxWidth);
    } else {
      ctx.fillText(str, x, y - 0.6);
    }
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
    this.uiZenMode = false;
    this.zenTransitionAlpha = 0;

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
    this.showTowerDetailBoard = false;
    this.hoveredRadialTowerId = null;
    this.hoveredUpgradeNodeId = null;

    // 顶部资源变化缩放反馈与建造冷却动画
    this.lastSeeds = null;
    this.lastSpores = null;
    this.seedPopTimer = 0;
    this.sporePopTimer = 0;
    this.cardCooldowns = { watch: 0, mist: 0, thorn: 0, burst: 0, lumina: 0 };
    this.cardMaxCooldowns = { watch: 4.5, thorn: 16.0, lumina: 7.0, mist: 8.0, burst: 20.0 };

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

// 轻度UI与自动褪去：维持当前玩家期望的展开度，不强制重置展开
  }

  update(realDt) {
    this.uiAnimTime += realDt;
    // 底部一体化控制舱与轻语言药丸平滑弹性插值
    const lerpSpeed = 14.0;
    this.dockExpansion += (this.dockTargetExpansion - this.dockExpansion) * Math.min(1.0, realDt * lerpSpeed);
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
      this.cardCooldowns[towerId] = (this.cardMaxCooldowns && this.cardMaxCooldowns[towerId]) || 5.0;
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
      // 只有当玩家手指明确向上拖出底栏（y < 425）且移动距离达到 18px 时，才进入拖拽放置模式
      if (dist >= 14 && (y < 460 || dist >= 22)) {
        this.isDragging = true;
        if (scene) {
          scene.selectedBuildTowerId = this.draggingTowerId;
        }
      }
    }

    // 手机移动端滑动扫线拾取能量 (Swipe-to-collect)
    if (scene && scene.state === 'BATTLE') {
      // 触碰战场区域时自动让重型UI褪去收缩，保持战场开阔纯净零误触
      if (!this.showGuideModal && !this.showSettingsModal && y < 435 && y > 58) {
        if (!this.inspectorOpen || !this.inspectorRect || x < this.inspectorRect.x || x > this.inspectorRect.x + this.inspectorRect.w || y < this.inspectorRect.y || y > this.inspectorRect.y + this.inspectorRect.h) {
          this.dockTargetExpansion = 0.0;
        }
      }
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const mx = (x - mv.OFFSET_X) / (mv.SCALE || 1);
      const my = (y - mv.OFFSET_Y) / (mv.SCALE || 1);
      if (mx >= 0 && mx < CONFIG.LAYOUT.MAP.WIDTH && my >= 0 && my < CONFIG.LAYOUT.MAP.HEIGHT) {
        scene.hoverTile = { col: Math.floor(mx / TILE_SIZE), row: Math.floor(my / TILE_SIZE) };
      } else {
        scene.hoverTile = { col: -1, row: -1 };
      }
      if (scene.sporeDropManager) {
        scene.sporeDropManager.handlePointerDown(mx, my, scene.economy, scene.fx);
      }
      if (scene.relicManager) {
        scene.relicManager.checkClick(mx, my, scene);
      }
      if (scene.contraptions) {
        scene.contraptions.handlePointerDown(mx, my, scene, true);
      }
    }
  }

  /**
   * 处理按压事件（支持短点击与拖拽起步）
   */
  handlePointerDown(x, y, scene) {
    this.hoverX = x;
    if (scene && scene.fx && typeof scene.fx.spawnTouchRipple === 'function') {
      scene.fx.spawnTouchRipple(x, y);
    }
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
      // 触碰战场区域时自动让重型UI褪去收缩，保持战场开阔纯净零误触
      if (!this.showGuideModal && !this.showSettingsModal && y < 435 && y > 58) {
        if (!this.inspectorOpen || !this.inspectorRect || x < this.inspectorRect.x || x > this.inspectorRect.x + this.inspectorRect.w || y < this.inspectorRect.y || y > this.inspectorRect.y + this.inspectorRect.h) {
          this.dockTargetExpansion = 0.0;
        }
      }
      // (0) 实时战斗统计面板开关与点击 (屏幕空间)
      if (scene.combatAnalytics && scene.combatAnalytics.handleClick(x, y)) {
        return true;
      }
      if (scene.heroSkills && scene.heroSkills.handleClick(x, y, scene)) {
        return true;
      }

      // 计算精准地图世界坐标 (mx, my)
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const mx = (x - mv.OFFSET_X) / (mv.SCALE || 1);
      const my = (y - mv.OFFSET_Y) / (mv.SCALE || 1);

      // (A) 晨露金孢即时触控点击收集 (支持手机大判定区)
      if (scene.sporeDropManager && scene.sporeDropManager.handlePointerDown(mx, my, scene.economy, scene.fx)) {
        return true;
      }

      // (A2) 精英怪/Boss掉落战利品道具拾取 (Relic Coin/Clover/Shield/Lightning)
      if (scene.relicManager && scene.relicManager.checkClick(mx, my, scene)) {
        return true;
      }

      // (A3) 奇幻森林环境晨露与生灵机关互动拾取
      if (scene.contraptions && scene.contraptions.handlePointerDown(mx, my, scene)) {
        return true;
      }

      // (B) 掘地潜行怪点击踩踏 & 自爆蝉点击泄气
      if (scene.enemyManager && scene.enemyManager.handleClickOnEnemy(mx, my, scene.fx)) {
        return true;
      }

      // (C) 茧丝缠绕快速点击救援 (Tap-to-Rescue，统一交由 towerManager.rescueWeb 扣减蛛丝血点)
      if (scene.towerManager && scene.towerManager.towers) {
        for (let i = 0; i < scene.towerManager.towers.length; i++) {
          const tw = scene.towerManager.towers[i];
          if (tw.isWebbed && Math.hypot(mx - tw.x, my - tw.y) <= 38) {
            if (scene.towerManager.rescueWeb(tw, scene.fx, scene.economy)) {
              return true;
            }
          }
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
        if (b.id && (b.id.indexOf('slot_') === 0 || b.id.indexOf('dock_card_') === 0)) {
          const tId = (b.meta && b.meta.towerId) || b.id.replace('slot_', '').replace('dock_card_', '');
          this.draggingTowerId = tId;
          this.pressedSlotButton = b;
          // 手机端关键优化：按下瞬间即时选中卡牌（零延迟响应，告别卡顿感）
          if (scene && typeof scene.selectBuildTowerType === 'function') {
            scene.selectBuildTowerType(tId);
          }
          platform.playSfx('sfx_click');
          return true;
        } else {
          if (b.onClick) {
            try {
              b.onClick(b);
            } catch (btnErr) {
              if (typeof console !== 'undefined' && console.error) {
                console.error('[Button Click Recovered]:', btnErr);
              }
            }
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
    // 手机端极速响应：若手指只是点按卡牌（未大幅拖拽），立即视为点击选中卡牌
    const dragDist = Math.hypot(x - this.dragStartX, y - this.dragStartY);
    if (this.pressedSlotButton && (!this.isDragging || dragDist < 14)) {
      if (this.pressedSlotButton.onClick) {
        try {
          this.pressedSlotButton.onClick(this.pressedSlotButton);
        } catch (btnErr) {}
      }
      this.draggingTowerId = null;
      this.isDragging = false;
      this.pressedSlotButton = null;
      return;
    }

    if (this.isDragging && this.draggingTowerId && scene && scene.state === 'BATTLE') {
      const tId = this.draggingTowerId;
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const mx = (x - mv.OFFSET_X) / mv.SCALE;
      const my = (y - mv.OFFSET_Y) / mv.SCALE;
      let col = Math.floor(mx / TILE_SIZE);
      let row = Math.floor(my / TILE_SIZE);

      // 智能磁吸吸附：若手指偏离在草地边缘或道路旁几个像素内，自动锁定最近的有效建造格
      if (scene.map && scene.towerManager) {
        if (!scene.map.canBuildAt(col, row) || scene.towerManager.getTowerAt(col, row)) {
          const offsets = [
            [0, -1], [0, 1], [-1, 0], [1, 0],
            [-1, -1], [1, -1], [-1, 1], [1, 1]
          ];
          let bestD = 1.35;
          let bestC = col, bestR = row;
          for (let k = 0; k < offsets.length; k++) {
            const nc = col + offsets[k][0];
            const nr = row + offsets[k][1];
            if (scene.map.inBounds(nc, nr) && scene.map.canBuildAt(nc, nr) && !scene.towerManager.getTowerAt(nc, nr)) {
              const d = Math.hypot((nc + 0.5) - (mx / TILE_SIZE), (nr + 0.5) - (my / TILE_SIZE));
              if (d < bestD) {
                bestD = d;
                bestC = nc;
                bestR = nr;
              }
            }
          }
          if (bestD < 1.35) {
            col = bestC;
            row = bestR;
          }
        }
      }

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
        try {
          this.pressedSlotButton.onClick(this.pressedSlotButton);
        } catch (btnErr) {
          if (typeof console !== 'undefined' && console.error) {
            console.error('[Slot Button Click Recovered]:', btnErr);
          }
        }
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
        ctx.imageSmoothingQuality = 'low';
      }

      const k = (uiImg.width && uiImg.width >= 1024) ? 4 : 1;
      const sx = rect.x * k;
      const sy = rect.y * k;
      const sw = rect.w * k;
      const sh = rect.h * k;

      // 1. 按钮类元素采用 3-Slice 水平切片：保护两端金属端头
      if (frameKey.startsWith('btn_')) {
        const srcCapW = Math.round(sw * 0.25);
        const dstCapW = Math.min(18, Math.max(12, Math.round(h * 0.45)));
        ctx.drawImage(uiImg, sx, sy, srcCapW, sh, Math.round(x), Math.round(y), dstCapW, Math.round(h));
        const midDstW = Math.max(0, Math.round(w) - dstCapW * 2);
        if (midDstW > 0) {
          ctx.drawImage(uiImg, sx + srcCapW, sy, sw - srcCapW * 2, sh, Math.round(x + dstCapW), Math.round(y), midDstW, Math.round(h));
        }
        ctx.drawImage(uiImg, sx + sw - srcCapW, sy, srcCapW, sh, Math.round(x + w - dstCapW), Math.round(y), dstCapW, Math.round(h));
      } else if (frameKey === 'inspector_board' && w >= 72 && h >= 64) {
        // 2. 木质羊皮纸框采用真 9-Slice 九宫格切片：
        // 四角黄铜 L 型铁件与木棱保持锐利固定像素宽度，无论宽弹窗还是竖卡片都不拉伸挤压！
        const sl = Math.round(sw * 0.16875);
        const sr = sl;
        const st = Math.round(sh * 0.171875);
        const sb = st;
        const dl = Math.min(28, Math.max(16, Math.round(Math.min(w, h) * 0.14)));
        const dr = dl;
        const dt = Math.min(24, Math.max(16, Math.round(Math.min(w, h) * 0.13)));
        const db = dt;
        const dx0 = Math.round(x), dy0 = Math.round(y), dw = Math.round(w), dh = Math.round(h);
        const srcXs = [sx, sx + sl, sx + sw - sr, sx + sw];
        const srcYs = [sy, sy + st, sy + sh - sb, sy + sh];
        const dstXs = [dx0, dx0 + dl, dx0 + dw - dr, dx0 + dw];
        const dstYs = [dy0, dy0 + dt, dy0 + dh - db, dy0 + dh];
        for (let r = 0; r < 3; r++) {
          const shPatch = srcYs[r + 1] - srcYs[r];
          const dhPatch = dstYs[r + 1] - dstYs[r];
          if (shPatch <= 0 || dhPatch <= 0) continue;
          for (let c = 0; c < 3; c++) {
            const swPatch = srcXs[c + 1] - srcXs[c];
            const dwPatch = dstXs[c + 1] - dstXs[c];
            if (swPatch <= 0 || dwPatch <= 0) continue;
            ctx.drawImage(uiImg, srcXs[c], srcYs[r], swPatch, shPatch, dstXs[c], dstYs[r], dwPatch, dhPatch);
          }
        }
      } else if (frameKey === 'top_bar' && w >= h * 2.2) {
        // 3. 橡木牌匾采用叶片安全的水平 3-Slice：两端包铜与藤叶绝不随面板拉宽变形
        const sl = Math.round(sw * 0.31);
        const sr = Math.round(sw * 0.25);
        const dl = Math.min(44, Math.max(18, Math.round(Math.min(h * 1.1, w * 0.26))));
        const dr = Math.min(36, Math.max(16, Math.round(Math.min(h * 0.9, w * 0.22))));
        const midW = Math.round(w) - dl - dr;
        if (midW > 6) {
          ctx.drawImage(uiImg, sx, sy, sl, sh, Math.round(x), Math.round(y), dl, Math.round(h));
          ctx.drawImage(uiImg, sx + sl, sy, sw - sl - sr, sh, Math.round(x + dl), Math.round(y), midW, Math.round(h));
          ctx.drawImage(uiImg, sx + sw - sr, sy, sr, sh, Math.round(x + dl + midW), Math.round(y), dr, Math.round(h));
        } else {
          ctx.drawImage(uiImg, sx, sy, sw, sh, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        }
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
      const match = options.font.match(/(\d+(?:\.\d+)?)px/);
      if (match) fSize = Math.round(parseFloat(match[1]));
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

    // 顶部大气手绘木纹金匾标题（纯净无任何图像烘焙文字，支持实时语言切换）
    const titleBannerW = 430;
    const titleBannerH = 74;
    const titleBannerX = (960 - titleBannerW) * 0.5;
    const titleBannerY = 34;
    this.drawAiFrame(ctx, 'top_bar', titleBannerX, titleBannerY, titleBannerW, titleBannerH, 0.94);
    drawArtText(ctx, i18n.getLang() === 'zh' ? '蘑菇守林' : 'MUSHROOM GUARD', 480, titleBannerY + 29, {
      style: 'gold',
      size: 30,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.6
    });
    drawArtText(ctx, i18n.getLang() === 'zh' ? '奇幻森林策略塔防 · 双线固守' : 'FANTASY FOREST DEFENSE', 480, titleBannerY + 52, {
      style: 'parchment',
      size: 11.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0
    });

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

    this.drawPixelButton(ctx, 'title_lang', 18, 18, 114, 36, i18n.getLang() === 'zh' ? '语言：中文' : 'Lang: EN', {
      skin: 'btn_wood',
      font: `bold 13px ${CN_FONT}`
    }, () => {
      const nextLang = i18n.toggleLang();
      storage.updateSettings({ lang: nextLang });
      platform.playSfx('sfx_click');
    });

    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx, scene);
    } else if (this.showGuideModal) {
      this.renderGuideModal(ctx, scene);
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

    // 顶部木质横幅与两侧导航等高同心对齐（centerY = 36）
    this.drawAiFrame(ctx, 'top_bar', 268, 12, 292, 48, 0.98);
    ctx.fillStyle = THEME.BRONZE_BRIGHT;
    ctx.font = 'bold 20px ' + CN_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i18n.t('btn_level_select'), 414, 36);

    this.drawPixelButton(ctx, 'lvl_back', 24, 18, 104, 36, i18n.t('btn_back'), {
      skin: 'btn_wood',
      font: `bold 14.5px ${CN_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      scene.enterTitle();
    });

    this.drawPixelButton(ctx, 'lvl_codex', 136, 18, 118, 36, '林地秘典', {
      skin: 'btn_wood',
      iconKey: 'guide',
      font: `bold 14px ${CN_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      this.showGuideModal = true;
    });

    const save = storage.getSave();
    if (save.endlessRecord && save.endlessRecord.bestWave > 0) {
      ctx.save();
      if (!this.drawAiFrame(ctx, 'top_bar', 574, 18, 134, 36, 0.96)) {
        roundRectPath(ctx, 574, 18, 134, 36, 8);
        ctx.fillStyle = 'rgba(28, 18, 10, 0.90)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(230, 187, 96, 0.72)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      drawArtText(ctx, `无尽最高 第${save.endlessRecord.bestWave}波`, 641, 36, {
        style: 'gold',
        size: 11.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0,
        maxWidth: 112
      });
      ctx.restore();
    }

    this.drawPixelButton(ctx, 'lvl_settings', 716, 18, 114, 36, i18n.t('btn_settings'), {
      skin: 'btn_wood',
      iconKey: 'settings',
      font: `bold 14px ${CN_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      this.showSettingsModal = true;
    });

    const cardW = MAP_ORDER.length >= 4 ? 216 : 288;
    const cardGap = MAP_ORDER.length >= 4 ? 14 : 24;
    const totalCardsW = MAP_ORDER.length * cardW + (MAP_ORDER.length - 1) * cardGap;
    const startCardX = Math.round((960 - totalCardsW) * 0.5);
    const compact = cardW < 250;

    for (let i = 0; i < MAP_ORDER.length; i++) {
      const mapId = MAP_ORDER[i];
      const mData = MAPS[mapId];
      const rec = (save.maps && save.maps[mapId]) || { unlocked: i === 0, stars: 0, bestTime: null, bestSeeds: 0 };
      const cardX = startCardX + i * (cardW + cardGap);
      const cardY = 76;
      const cardH = 442;

      // 使用 AI 9-Slice 手绘木框羊皮纸大卡片（边框厚度固定锐利，内容完全放进羊皮纸框内）
      this.drawWoodlandPanel(ctx, cardX, cardY, cardW, cardH, rec.unlocked ? THEME.BRONZE_MID : '#5A554C', 0.98, 14, true);

      const prevX = cardX + (compact ? 22 : 28);
      const prevY = cardY + (compact ? 28 : 30);
      const prevW = cardW - (compact ? 44 : 56);
      const prevH = compact ? 96 : 124;
      const mAtlas = platform.getImage(mData.atlasPath);
      if (mAtlas && MAP_ATLAS_LAYOUT.sceneBg) {
        const sb = MAP_ATLAS_LAYOUT.sceneBg;
        drawSubImage(ctx, mAtlas, sb.x, sb.y, sb.w, sb.h, prevX, prevY, prevW, prevH);
      } else {
        ctx.fillStyle = mData.parallaxColors[1] || PALETTE.GROUND_DARK;
        ctx.fillRect(prevX, prevY, prevW, prevH);
      }
      // 缩略图保留手绘原生道路质感，仅用极精简点位标记出怪巢穴与守护林屋
      const mapPadX = prevX + prevW * (160 / 960);
      const mapPadY = prevY + prevH * (30 / 540);
      const mapDrawW = prevW * (640 / 960);
      const mapDrawH = prevH * (480 / 540);
      const drawLandmarkDot = (tile, fillCol, rimCol, rad) => {
        if (!tile) return;
        const px = mapPadX + ((tile[0] + 0.5) / 20) * mapDrawW;
        const py = mapPadY + ((tile[1] + 0.5) / 15) * mapDrawH;
        ctx.save();
        ctx.fillStyle = rimCol;
        ctx.beginPath();
        ctx.arc(px, py, rad + 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = fillCol;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawLandmarkDot(mData.spawnTile, '#FF4D4F', 'rgba(20, 12, 10, 0.85)', compact ? 2.6 : 3.2);
      drawLandmarkDot(mData.spawnTile2, '#B37FEB', 'rgba(20, 12, 18, 0.85)', compact ? 2.2 : 2.8);
      drawLandmarkDot(mData.warehouseTile, '#FFD666', 'rgba(42, 24, 10, 0.90)', compact ? 2.9 : 3.6);

      ctx.strokeStyle = 'rgba(72, 46, 22, 0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(prevX, prevY, prevW, prevH);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold ${compact ? 15 : 19}px ${CN_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(i18n.t(mData.nameKey), cardX + cardW * 0.5, cardY + (compact ? 144 : 174), cardW - 40);

      ctx.fillStyle = THEME.ENAMEL_GREEN;
      ctx.font = `bold ${compact ? 11.5 : 13}px ${CN_FONT}`;
      ctx.fillText(i18n.t(mData.subtitleKey), cardX + cardW * 0.5, cardY + (compact ? 164 : 197), cardW - 40);

      const starSz = compact ? 24 : 28;
      const starGap = compact ? 30 : 34;
      const starX0 = Math.round(cardX + (cardW - (starSz + starGap * 2)) * 0.5);
      const starY = cardY + (compact ? 178 : 212);
      for (let s = 0; s < 3; s++) {
        const starKey = s < rec.stars ? 'star_full' : 'star_empty';
        drawUiIcon(ctx, 16, starKey, starX0 + s * starGap, starY, starSz);
      }

      const descPad = compact ? 22 : 28;
      this.drawWrappedText(ctx, i18n.t(mData.descKey), cardX + descPad, cardY + (compact ? 214 : 254), cardW - descPad * 2, compact ? 16 : 18, THEME.INK_MID, `${compact ? 11 : 12}px ${CN_FONT}`);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold ${compact ? 11 : 12}px ${CN_FONT}`;
      ctx.textAlign = 'left';
      const timeStr = rec.bestTime !== null ? (rec.bestTime + 's') : i18n.t('record_none');
      const seedStr = rec.bestSeeds > 0 ? (rec.bestSeeds + ' / 20') : i18n.t('record_none');
      ctx.fillText(i18n.t('best_time') + ': ' + timeStr, cardX + descPad, cardY + (compact ? 320 : 326));
      ctx.fillText(i18n.t('best_seeds') + ': ' + seedStr, cardX + descPad, cardY + (compact ? 340 : 346));

      const btnY = cardY + 368;
      if (rec.unlocked) {
        const hasCleared = rec.stars > 0;
        const sidePad = compact ? 22 : 26;
        const endlessW = compact ? 72 : 90;
        const startW = hasCleared ? (cardW - sidePad * 2 - endlessW - 6) : (cardW - sidePad * 2);
        this.drawPixelButton(ctx, 'play_' + mapId, cardX + sidePad, btnY, startW, 40, i18n.t('btn_start'), {
          skin: 'btn_green',
          font: `bold ${compact ? (hasCleared ? 12 : 14) : (hasCleared ? 14 : 16)}px ${CN_FONT}`,
          iconKey: 'play'
        }, () => {
          platform.playSfx('sfx_click');
          scene.startLevel(mapId);
        });
        if (hasCleared) {
          this.drawPixelButton(ctx, 'endless_' + mapId, cardX + sidePad + startW + 6, btnY, endlessW, 40, '无尽模式', {
            skin: 'btn_wood',
            font: `bold ${compact ? 11 : 12}px ${CN_FONT}`
          }, () => {
            platform.playSfx('sfx_horn');
            scene.startEndlessMode(mapId);
          });
        }
      } else {
        const lPad = compact ? 22 : 28;
        this.drawPixelButton(ctx, 'locked_' + mapId, cardX + lPad, btnY, cardW - lPad * 2, 40, i18n.t('map_locked'), {
          skin: 'btn_wood',
          disabled: true,
          font: `bold ${compact ? 11.5 : 13}px ${CN_FONT}`,
          iconKey: 'lock'
        });
      }
    }

    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx, scene);
    } else if (this.showGuideModal) {
      this.renderGuideModal(ctx, scene);
    }
  }

  // =========================================================================
  // 3. 战斗 HUD：全屏森林战场环绕式布局
  // =========================================================================
  /**
   * 纯净全景地图模式切换（一键隐藏全部UI，享受纯正森林大地图全景）
   */
  toggleZenMode(fx = null) {
    this.uiZenMode = !this.uiZenMode;
    platform.playSfx('sfx_click');
    if (fx) {
      if (this.uiZenMode) {
        fx.spawnFloatingText(480, 200, '纯净全景地图已开启 (按 H 键恢复界面)', '#FFE58F', 1.8);
      } else {
        fx.spawnFloatingText(480, 200, '战术指挥界面已恢复', '#BAE7FF', 1.5);
      }
    }
  }

  renderBattleHud(ctx, scene) {
    this.clearButtons();

    // 纯净全景地图模式：全屏无任何遮挡，仅保留左上角半透明恢复按钮与全局模态弹窗
    if (this.uiZenMode) {
      const rw = 142;
      const rh = 34;
      const rx = 14;
      const ry = 14;
      ctx.save();
      roundRectPath(ctx, rx, ry, rw, rh, 8);
      ctx.fillStyle = 'rgba(20, 14, 8, 0.75)';
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      drawArtText(ctx, '👁️ 恢复界面 [H]', rx + rw * 0.5, ry + rh * 0.5, {
        style: 'gold',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.2
      });
      ctx.restore();

      this.registerButton('btn_zen_restore', rx, ry, rw, rh, () => {
        this.toggleZenMode(scene.fx);
      });

      if (this.showSettingsModal) {
        this.renderSettingsModal(ctx, scene);
      } else if (this.showGuideModal) {
        this.renderGuideModal(ctx, scene);
      } else if (scene.state === 'PAUSED') {
        this.renderPauseOverlay(ctx, scene);
      } else if (scene.state === 'SETTLEMENT') {
        this.renderSettlementOverlay(ctx, scene);
      }
      return;
    }

    // 若处于结算或暂停状态，直接渲染专属结算/暂停面板并返回，彻底杜绝下层任何操作冲突与UI残留
    if (scene.state === 'SETTLEMENT') {
      this.renderSettlementOverlay(ctx, scene);
      return;
    }
    if (scene.state === 'PAUSED') {
      this.renderPauseOverlay(ctx, scene);
      if (this.showSettingsModal) {
        this.renderSettingsModal(ctx, scene);
      }
      return;
    }

    // 0. 顶部极简天候微章 & 实时战报快速切换双胶囊（左上角工整并排）
    if (scene.weather) {
      scene.weather.renderWeatherHudBadge(ctx, 16, 14);
      this.registerButton('pvz_weather_badge', 16, 14, 96, 24, () => {
        platform.playSfx('sfx_click');
        scene.weather.cycleWeather(scene);
      });
    }
    if (scene.combatAnalytics && typeof scene.combatAnalytics.renderToggleButton === 'function') {
      scene.combatAnalytics.renderToggleButton(ctx, 118, 14);
    }

    this.bottomHoverTip = null;

    // 1. 【植物大战僵尸风格】顶部一体化经典木质卡槽栏 (PvZ Top Seed Bank: 阳光金孢 + 5蘑菇卡牌 + 觉醒豆)
    this.renderPvZTopSeedBank(ctx, scene);

    // 2. 顶部波次推进旗舰进度槽 (PvZ Wave Flag Meter)
    this.renderPvZTopWaveBar(ctx, scene);

    // 3. 顶部右上角极简控制栏 (仅 3 个清晰木质按钮: [倍速], [暂停], [菜单])
    this.renderPvZTopRightMenu(ctx, scene);

    // 4. 【彻底释放全屏战场】左下角极简圆盘英雄徽章与3大自然神术法球 (占据极小空间，95%画面完全纯净沉浸！)
    this.renderPvZBottomLeftHeroAndSpells(ctx, scene);

    if (scene.achievements) {
      scene.achievements.renderToast(ctx);
    }

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

    // 6.8 底栏英雄 / 神术 / 卡牌悬停轻量说明条
    if (this.bottomHoverTip && !this.inspectorOpen && !this.isDragging && !this.showSettingsModal && !this.showGuideModal && !(scene.combatAnalytics && scene.combatAnalytics.isOpen)) {
      const tip = this.bottomHoverTip;
      ctx.save();
      ctx.font = `bold 11px ${CN_FONT}`;
      const tw = Math.ceil(ctx.measureText(tip.text).width);
      const pw = Math.min(460, tw + 22);
      const ph = 24;
      const px = Math.max(10, Math.min(950 - pw, Math.round(tip.x - pw * 0.5)));
      const py = Math.round(tip.y);
      roundRectPath(ctx, px, py, pw, ph, 7);
      ctx.fillStyle = 'rgba(20, 14, 9, 0.94)';
      ctx.fill();
      ctx.strokeStyle = '#C68F45';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      drawArtText(ctx, tip.text, px + pw * 0.5, py + ph * 0.5, {
        style: 'gold',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0,
        maxWidth: pw - 16
      });
      ctx.restore();
    }

    // 7. 轻量化提示气泡（深橡木底板 + 亮金高对比文字，自动避让首领血条）
    if (this.toastTimer > 0 && this.toastText) {
      const hasBossHud = Boolean(scene.bossOverdriveEngine && scene.bossOverdriveEngine.activeBoss && scene.bossOverdriveEngine.activeBoss.hp > 0);
      const ty = hasBossHud ? 116 : 64;
      const tw = 316;
      const tx = (960 - tw) * 0.5;
      ctx.save();
      if (!this.drawAiFrame(ctx, 'top_bar', tx, ty, tw, 36, 0.96)) {
        roundRectPath(ctx, tx, ty, tw, 36, 9);
        ctx.fillStyle = 'rgba(24, 16, 10, 0.94)';
        ctx.fill();
        ctx.strokeStyle = '#C68F45';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      drawArtText(ctx, this.toastText, 480, ty + 18, {
        style: 'gold',
        size: 12.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0,
        maxWidth: tw - 36
      });
      ctx.restore();
    }

    // 8. 模态弹窗（暂停、结算、新手引导、设置）
    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx, scene);
    } else if (this.showGuideModal) {
      this.renderGuideModal(ctx, scene);
    } else if (scene.state === 'PAUSED') {
      this.renderPauseOverlay(ctx, scene);
    } else if (scene.state === 'SETTLEMENT') {
      this.renderSettlementOverlay(ctx, scene);
    }

    // 8.5 实时战斗DPS战报分析仪表盘 (全屏弹窗)
    if (scene.combatAnalytics) {
      scene.combatAnalytics.renderAnalyticsDashboard(ctx);
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

    const barX = 10;
    const barY = 8;
    const barW = 370;
    const barH = 44;

    // 顶部 AI 雕刻木纹藤蔓横梁 (严格限制于 X:10..380 范围，为天气、神器、战报留出充裕空间)
    this.drawAiFrame(ctx, 'top_bar', barX, barY, barW, barH, 0.98);

    // (A) 生命种子胶囊槽
    ctx.save();
    roundRectPath(ctx, barX + 8, barY + 8, 72, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const seedScale = 1 + (this.seedPopTimer > 0 ? Math.sin((this.seedPopTimer / 0.28) * Math.PI) * 0.22 : 0);
    drawUiIcon(ctx, 16, 'seed', barX + 12, barY + 9, 22);
    ctx.translate(barX + 52, barY + 22);
    ctx.scale(seedScale, seedScale);
    drawArtText(ctx, String(seeds), 0, 0, {
      style: seeds <= 5 ? 'crimson' : 'parchment',
      size: 15,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.5
    });
    ctx.restore();

    // (B) 黄金孢子胶囊槽
    ctx.save();
    roundRectPath(ctx, barX + 84, barY + 8, 88, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const sporeScale = 1 + (this.sporePopTimer > 0 ? Math.sin((this.sporePopTimer / 0.24) * Math.PI) * 0.22 : 0);
    drawUiIcon(ctx, 16, 'spore', barX + 88, barY + 9, 22);
    ctx.translate(barX + 138, barY + 22);
    ctx.scale(sporeScale, sporeScale);
    drawArtText(ctx, String(spores), 0, 0, {
      style: 'gold',
      size: 15,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.8
    });
    ctx.restore();

    // (C) 波次进度与状态铭牌
    const waveMgr = scene.waveManager;
    ctx.save();
    roundRectPath(ctx, barX + 176, barY + 8, 96, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.58)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawUiIcon(ctx, 16, 'skull', barX + 180, barY + 10, 20);
    drawArtText(ctx, `${waveMgr.currentWaveIndex}/${waveMgr.totalWaves}`, barX + 220, barY + 22, {
      style: 'parchment',
      size: 12,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.2
    });

    const statusTag = waveMgr.isPrepPhase()
      ? `${Math.ceil(waveMgr.prepTimerSec)}s`
      : '迎战';
    drawArtText(ctx, statusTag, barX + 262, barY + 22, {
      style: waveMgr.isPrepPhase() ? 'azure' : 'crimson',
      size: 10.5,
      align: 'right',
      baseline: 'middle',
      strokeWidth: 1.2
    });
    ctx.restore();

    // (D) 备战期「提前迎敌」号角按钮 或 战斗期「下波预告」胶囊 (紧随其后 X: 276..364)
    const callX = barX + 276;
    const callY = barY + 6;
    const callW = 88;
    const callH = 32;

    if (waveMgr.isPrepPhase()) {
      const earlyBonus = Math.min(
        CONFIG.ECONOMY.EARLY_CALL_MAX,
        Math.floor(waveMgr.prepTimerSec * CONFIG.ECONOMY.EARLY_CALL_PER_SEC)
      );
      this.drawPixelButton(
        ctx,
        'hud_call_wave',
        callX,
        callY,
        callW,
        callH,
        `提前 +${earlyBonus}`,
        {
          skin: 'btn_green',
          font: `bold 11px ${CN_FONT}`,
          iconKey: 'horn',
          iconSize: 16
        },
        () => {
          scene.callWaveEarly();
        }
      );
    } else {
      const summary = waveMgr.getUpcomingWaveSummary();
      ctx.save();
      this.drawAiFrame(ctx, 'btn_wood', callX, callY, callW, callH, 0.92);
      if (summary.length > 0) {
        const first = summary[0];
        if (first && first.type && Number.isFinite(first.count)) {
          drawEnemySprite(ctx, first.type, 'walk', 0, callX + 14, callY + 16, false);
          drawArtText(ctx, `×${first.count}`, callX + 32, callY + 16, {
            style: 'parchment',
            size: 10.5,
            align: 'left',
            baseline: 'middle',
            strokeWidth: 1.0
          });
        }
      } else {
        drawArtText(ctx, '迎敌就绪', callX + callW * 0.5, callY + 16, {
          style: 'gold',
          size: 10.5,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 1.0
        });
      }
      ctx.restore();
    }
  }
  renderTopRightControls(ctx, scene) {
    // 1. 纯净全景地图切换按钮 (Zen Mode: [纯净[H]])
    this.drawPixelButton(
      ctx,
      'hud_zen',
      668,
      12,
      50,
      34,
      '全景',
      {
        skin: 'btn_wood',
        font: `bold 10.5px ${CN_FONT}`
      },
      () => {
        this.toggleZenMode(scene.fx);
      }
    );

    // 2. 倍速切换按钮 (1x / 2x / 3x)
    this.drawPixelButton(
      ctx,
      'hud_speed',
      722,
      12,
      50,
      34,
      `${scene.speedMultiplier}×速`,
      {
        skin: scene.speedMultiplier > 1 ? 'btn_blue' : 'btn_wood',
        font: `bold 11px ${CN_FONT}`
      },
      () => {
        scene.cycleSpeed();
      }
    );

    // 3. 暂停按钮
    this.drawPixelButton(
      ctx,
      'hud_pause',
      776,
      12,
      50,
      34,
      '暂停',
      {
        skin: 'btn_wood',
        font: `bold 11px ${CN_FONT}`
      },
      () => {
        scene.pauseGame();
      }
    );

    // 4. 战术图鉴按钮
    this.drawPixelButton(
      ctx,
      'hud_guide',
      830,
      12,
      50,
      34,
      '图鉴',
      {
        skin: 'btn_wood',
        font: `bold 11px ${CN_FONT}`
      },
      () => {
        platform.playSfx('sfx_click');
        this.guideStep = 0;
        this.showGuideModal = true;
      }
    );

    // 5. 设置按钮
    this.drawPixelButton(
      ctx,
      'hud_settings',
      884,
      12,
      52,
      34,
      '设置',
      {
        skin: 'btn_wood',
        font: `bold 11px ${CN_FONT}`
      },
      () => {
        platform.playSfx('sfx_click');
        this.showSettingsModal = true;
      }
    );
  }

  /**
   * 已全面融入底部一体化控制舱 (renderBottomUnifiedCommandDeck)
   */
  renderCommanderSpellDock(ctx, scene) {
  }
  renderRallyTargetingReticle(ctx, scene) {
    if (!scene || !scene.activeRallyTargeting || !scene.map) return;
    const mx = this.hoverX;
    const my = this.hoverY;
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const mapX = (mx - mv.OFFSET_X) / (mv.SCALE || 1);
    const mapY = (my - mv.OFFSET_Y) / (mv.SCALE || 1);
    const col = Math.floor(mapX / TILE_SIZE);
    const row = Math.floor(mapY / TILE_SIZE);
    const isValid = scene.map.inBounds(col, row) && scene.map.isPath(col, row);

    ctx.save();
    if (scene.map.inBounds(col, row)) {
      const bx = mv.OFFSET_X + col * TILE_SIZE * mv.SCALE;
      const by = mv.OFFSET_Y + row * TILE_SIZE * mv.SCALE;
      const bsz = TILE_SIZE * mv.SCALE;
      roundRectPath(ctx, bx + 1, by + 1, bsz - 2, bsz - 2, 6);
      ctx.fillStyle = isValid ? 'rgba(82, 196, 26, 0.30)' : 'rgba(255, 77, 79, 0.25)';
      ctx.fill();
      ctx.strokeStyle = isValid ? '#95DE64' : '#FF4D4F';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    const flagImg = platform.getImage('assets/vfx/prop_rally_flag.png');
    if (mx > 0 && my > 0) {
      if (flagImg && flagImg.width) {
        ctx.globalAlpha = 0.88;
        ctx.drawImage(flagImg, mx - 16, my - 30, 32, 34);
      }
      drawArtText(ctx, isValid ? '点击道路集结菇精卫 [R]' : '请移动到道路格上设防', mx, my - 38, {
        style: isValid ? 'emerald' : 'crimson',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.8
      });
    }
    ctx.restore();
  }

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
    // 已全面融入底部一体化控制舱 (renderBottomUnifiedCommandDeck)
  }

  /**
   * 3.25 & 3.3 底部全功能一体化统御控制舱 (Unified Bottom Command Deck)
   * 融合：英雄头像+微操集结+HP/XP+大招[F]+姿态[Z] + 四大自然神术[Q/W/E/R] + 5大守卫卡牌[1..5] + 灵能觉醒[空格]
   * 空间布局：严格限定于 Y:444..534 (高度 90px)，上部 Y:48..440 完全开阔，零遮挡战场任何区域！
   */
  renderBottomUnifiedCommandDeck(ctx, scene) {
    const baseY = 444;
    const deckH = 90;
    const hero = scene.hero;

    // (A) 若处于收缩/沉浸轻度状态，绘制悬浮“轻语言UI”微光胶囊 (Whisper Command Capsule)
    if (this.dockExpansion < 0.88) {
      const pillW = 360;
      const pillH = 32;
      const pillX = Math.round((960 - pillW) * 0.5);
      const pillY = 502;
      const pillAlpha = Math.min(1.0, (0.88 - this.dockExpansion) / 0.65);

      ctx.save();
      ctx.globalAlpha = pillAlpha;

      // 翡翠黑曜石透光玻璃胶囊
      const pGrad = ctx.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
      pGrad.addColorStop(0, 'rgba(12, 28, 20, 0.94)');
      pGrad.addColorStop(1, 'rgba(8, 18, 13, 0.96)');
      roundRectPath(ctx, pillX, pillY, pillW, pillH, 16);
      ctx.fillStyle = pGrad;
      ctx.fill();

      // 呼吸微光律动金边
      const pulse = 1.0 + Math.sin(this.uiAnimTime * 3.8) * 0.25;
      ctx.strokeStyle = `rgba(211, 242, 97, ${0.45 + pulse * 0.25})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      drawArtText(ctx, '🍃 战备指令', pillX + 46, pillY + pillH * 0.5, {
        style: 'emerald',
        size: 11.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      drawArtText(ctx, '▲ 轻触展开 (5塔 / 4术 / 英雄)', pillX + pillW * 0.5 + 10, pillY + pillH * 0.5, {
        style: 'gold',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      drawArtText(ctx, `🪙 ${scene.economy.spores}`, pillX + pillW - 38, pillY + pillH * 0.5, {
        style: 'parchment',
        size: 11.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      ctx.restore();

      this.registerButton('dock_whisper_pill', pillX, pillY, pillW, pillH, () => {
        this.dockTargetExpansion = 1.0;
        platform.playSfx('sfx_click');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(10); } catch (e) {}
        }
      });
    }

    // (B) 若未完全隐藏，绘制平滑下滑与淡入淡出的一体化控制舱
    if (this.dockExpansion <= 0.05) return;

    const slideY = Math.round((1.0 - this.dockExpansion) * 105);
    const deckAlpha = Math.max(0, Math.min(1.0, (this.dockExpansion - 0.15) / 0.85));

    ctx.save();
    ctx.translate(0, slideY);
    ctx.globalAlpha = deckAlpha;

    // 1. 远古灵木精工雕刻卡牌底座托盘 (Ancient Carved Bark Command Deck)
    roundRectPath(ctx, 10, baseY, 940, deckH, 12);
    ctx.fillStyle = 'rgba(20, 14, 8, 0.94)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.70)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 右上角折叠/沉浸战场小按钮
    roundRectPath(ctx, 894, baseY + 3, 52, 16, 4);
    ctx.fillStyle = 'rgba(40, 28, 16, 0.75)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();
    drawArtText(ctx, '⌵ 沉浸', 920, baseY + 11, {
      style: 'parchment',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.6
    });

    // 区域垂直分割金线 (不绘制贯穿文字的水平横线，确保全部文字清晰利落)
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.40)';
    ctx.beginPath();
    ctx.moveTo(140, baseY + 6);
    ctx.lineTo(140, baseY + deckH - 6);
    ctx.moveTo(300, baseY + 6);
    ctx.lineTo(300, baseY + deckH - 6);
    ctx.moveTo(724, baseY + 6);
    ctx.lineTo(724, baseY + deckH - 6);
    ctx.stroke();
    ctx.restore();

    // =========================================================================
    // [分区 1] 远古树人·战术英雄统御专区 (X: 14..136)
    // =========================================================================
    const isHeroRallying = scene.activeHeroRally || (hero && hero.isSelected);
    const hx = 18;
    const hy = baseY + 16;
    const hw = 42;
    const hh = 42;

    ctx.save();
    drawArtText(ctx, '远古树人', 74, baseY + 8, {
      style: 'gold',
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    // 英雄头像底框
    roundRectPath(ctx, hx, hy, hw, hh, 8);
    ctx.fillStyle = 'rgba(10, 14, 10, 0.95)';
    ctx.fill();
    ctx.strokeStyle = isHeroRallying ? '#FFD700' : 'rgba(198, 143, 69, 0.65)';
    ctx.lineWidth = isHeroRallying ? 2.5 : 1.2;
    ctx.stroke();

    // 英雄手绘头像
    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    if (heroImg && heroImg.width) {
      ctx.drawImage(heroImg, hx + 2, hy + 2, hw - 4, hh - 4);
    }

    // 等级标 (精致角标)
    roundRectPath(ctx, hx - 2, hy - 4, 22, 13, 3);
    ctx.fillStyle = '#8C5E2A';
    ctx.fill();
    drawArtText(ctx, 'Lv.' + (hero ? hero.level : 1), hx + 9, hy + 2.5, {
      style: 'gold',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    // 右侧生命/经验条与大招 [F]
    if (hero) {
      const barX = hx + 48;
      const barW = 68;

      // 血条
      const hpRatio = Math.max(0, hero.hp / hero.maxHp);
      roundRectPath(ctx, barX, hy + 1, barW, 9, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();
      roundRectPath(ctx, barX, hy + 1, barW * hpRatio, 9, 3);
      ctx.fillStyle = hero.state === 'dead' ? '#8C2D29' : (hpRatio > 0.4 ? '#52C41A' : '#FF4D4F');
      ctx.fill();
      drawArtText(ctx, hero.hp + '/' + hero.maxHp, barX + barW * 0.5, hy + 5.5, {
        style: 'parchment',
        size: 8,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.5
      });

      // 经验条
      const xpRatio = Math.max(0, Math.min(1, hero.xp / hero.xpToNext));
      roundRectPath(ctx, barX, hy + 13, barW, 4, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();
      roundRectPath(ctx, barX, hy + 13, barW * xpRatio, 4, 2);
      ctx.fillStyle = '#1890FF';
      ctx.fill();

      // 大招快捷键 [F]
      const skillOnCd = hero.skillCooldown > 0 || hero.state === 'dead';
      roundRectPath(ctx, barX, hy + 20, barW, 21, 4);
      ctx.fillStyle = skillOnCd ? 'rgba(30, 20, 15, 0.85)' : 'rgba(24, 75, 40, 0.95)';
      ctx.fill();
      ctx.strokeStyle = skillOnCd ? '#5E3E26' : '#FFD700';
      ctx.lineWidth = 1;
      ctx.stroke();

      const cdText = skillOnCd
        ? (hero.state === 'dead' ? ('复活 ' + Math.ceil(hero.reviveTimer) + 's') : ('大招 ' + Math.ceil(hero.skillCooldown) + 's'))
        : '大招 [F] 撼地!';
      drawArtText(ctx, cdText, barX + barW * 0.5, hy + 30.5, {
        style: skillOnCd ? 'dim' : 'gold',
        size: 9,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });
    }

    // 姿态切换按钮 [Z]
    const curStance = hero ? hero.stance : 'guardian';
    const stanceConfig = {
      guardian: { label: '姿态: 磐石巨盾', color: '#40A9FF' },
      aggressive: { label: '姿态: 狂暴战斧', color: '#FF4D4F' },
      scout: { label: '姿态: 灵木游侠', color: '#52C41A' }
    };
    const curStCfg = stanceConfig[curStance] || stanceConfig.guardian;
    const stX = hx;
    const stY = baseY + 63;
    const stW = 116;
    const stH = 21;

    roundRectPath(ctx, stX, stY, stW, stH, 4);
    ctx.fillStyle = 'rgba(26, 18, 12, 0.88)';
    ctx.fill();
    ctx.strokeStyle = curStCfg.color;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    drawArtText(ctx, '[Z] ' + curStCfg.label, stX + stW * 0.5, stY + 10.5, {
      style: 'gold',
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });
    ctx.restore();

    // 注册英雄微操按钮
    this.registerButton('hero_portrait', hx, hy, hw, hh, () => {
      if (scene.hero) {
        scene.activeHeroRally = !scene.activeHeroRally;
        scene.hero.isSelected = scene.activeHeroRally;
        platform.playSfx('sfx_click');
        if (scene.activeHeroRally) {
          scene.fx.spawnFloatingText(scene.hero.x, scene.hero.y - 24, '树人集结：点击地面移动!', '#FFE58F', 1.2);
        }
      }
    });

    if (hero) {
      this.registerButton('hero_f_ult', hx + 48, hy + 20, 68, 21, () => {
        scene.hero.castUltimateSkill(scene.enemyManager, scene.fx);
      });
    }

    this.registerButton('hero_stance_cycle', stX, stY, stW, stH, () => {
      if (scene.hero) {
        scene.hero.cycleStance(scene.fx);
      }
    });

    // =========================================================================
    // [分区 2] 指挥官四大战术神术舱 (X: 144..296)
    // =========================================================================
    const spellList = [
      { id: 'rain', hotkey: 'Q', name: '甘霖', cost: 45, vfx: 'assets/vfx/relic_clover.png', tip: '复苏' },
      { id: 'shock', hotkey: 'W', name: '天雷', cost: 75, vfx: 'assets/vfx/relic_lightning.png', tip: '眩晕' },
      { id: 'harvest', hotkey: 'E', name: '丰饶', cost: 0, vfx: 'assets/vfx/item_golden_spore.png', tip: '+120' },
      { id: 'rally', hotkey: 'R', name: '集结', cost: 0, vfx: 'assets/vfx/sporeling_guard.png', tip: '布防' }
    ];

    drawArtText(ctx, '自然神术', 220, baseY + 8, {
      style: 'gold',
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    const spGemW = 34;
    const spGemH = 34;
    const spStartX = 144;
    const spGap = 4;

    for (let sIdx = 0; sIdx < spellList.length; sIdx++) {
      const item = spellList[sIdx];
      const sp = scene.spells[item.id] || { timer: 0, cost: item.cost };
      const onCd = sp.timer > 0;
      const affordable = scene.economy.spores >= sp.cost;
      const disabled = onCd || !affordable;
      const isCasting = scene.activeSpellCasting === item.id || (item.id === 'rally' && scene.activeRallyTargeting);

      const bx = spStartX + sIdx * (spGemW + spGap);
      const by = baseY + 16;

      ctx.save();
      // 法术底盘圆形宝石
      ctx.beginPath();
      ctx.arc(bx + spGemW * 0.5, by + spGemH * 0.5, spGemW * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = isCasting
        ? 'rgba(40, 32, 10, 0.95)'
        : (disabled ? 'rgba(20, 16, 12, 0.85)' : 'rgba(28, 22, 14, 0.92)');
      ctx.fill();
      ctx.strokeStyle = isCasting ? '#FFD700' : (disabled ? 'rgba(120, 90, 60, 0.45)' : 'rgba(198, 143, 69, 0.70)');
      ctx.lineWidth = isCasting ? 2.2 : 1.2;
      ctx.stroke();

      // 法术 AI 手绘图标
      const spellImg = platform.getImage(item.vfx);
      if (spellImg && spellImg.width) {
        ctx.drawImage(spellImg, bx + 5, by + 5, spGemW - 10, spGemH - 10);
      }

      // 快捷键角标 [Q/W/E/R]
      roundRectPath(ctx, bx - 2, by - 2, 13, 12, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fill();
      drawArtText(ctx, item.hotkey, bx + 4.5, by + 4, {
        style: 'gold',
        size: 8.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.6
      });

      // 冷却倒计时遮罩
      if (onCd) {
        ctx.beginPath();
        ctx.arc(bx + spGemW * 0.5, by + spGemH * 0.5, spGemW * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fill();
        drawArtText(ctx, Math.ceil(sp.timer) + 's', bx + spGemW * 0.5, by + spGemH * 0.5, {
          style: 'crimson',
          size: 10,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 1.0
        });
      }

      // 底部名称与消耗标签（清晰利落，无任何杂线干扰）
      drawArtText(ctx, item.name, bx + spGemW * 0.5, baseY + 58, {
        style: disabled ? 'dim' : 'gold',
        size: 9.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      const costText = item.cost > 0 ? (item.cost + '孢') : item.tip;
      drawArtText(ctx, costText, bx + spGemW * 0.5, baseY + 72, {
        style: affordable ? 'parchment' : 'crimson',
        size: 8.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.6
      });
      ctx.restore();

      this.registerButton('dock_spell_' + item.id, bx, by, spGemW, deckH - 20, () => {
        if (item.id === 'rally') {
          scene.startRallyTargeting();
        } else {
          scene.castSpell(item.id);
        }
      });
    }

    // =========================================================================
    // [分区 3] 5 大蘑菇守卫者战术卡牌舱 (X: 306..720) - 100% 官方正版 AI 手绘原画
    // =========================================================================
    const cardW = 76;
    const cardH = 82;
    const cardGap = 8;
    const cardsStartX = 306;

    for (let i = 0; i < TOWER_ORDER.length; i++) {
      const tId = TOWER_ORDER[i];
      const def = TOWERS[tId];
      const cost = def.nodes.base.cost;
      const isSelected = scene.selectedBuildTowerId === tId;
      const affordable = scene.economy.canAfford(cost);
      const cx = cardsStartX + i * (cardW + cardGap);
      const hovered = this.isPointHovered(cx, baseY + 4, cardW, cardH);
      const liftY = isSelected ? -4 : (hovered ? -2 : 0);
      const cy = baseY + 4 + liftY;

      ctx.save();
      // 卡牌投影
      roundRectPath(ctx, cx + 2, cy + 3, cardW - 4, cardH - 2, 8);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // 选中光晕 / 悬停发光
      if (isSelected) {
        roundRectPath(ctx, cx - 2, cy - 2, cardW + 4, cardH + 4, 10);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (hovered) {
        roundRectPath(ctx, cx - 1, cy - 1, cardW + 2, cardH + 2, 9);
        ctx.strokeStyle = '#BAE7FF';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 卡牌主体材质
      roundRectPath(ctx, cx, cy, cardW, cardH, 8);
      ctx.fillStyle = isSelected
        ? 'rgba(45, 32, 18, 0.95)'
        : (affordable ? 'rgba(28, 20, 12, 0.92)' : 'rgba(20, 15, 12, 0.85)');
      ctx.fill();
      ctx.strokeStyle = isSelected
        ? '#FFD700'
        : (affordable ? 'rgba(198, 143, 69, 0.70)' : 'rgba(120, 90, 60, 0.40)');
      ctx.lineWidth = isSelected ? 2 : 1.2;
      ctx.stroke();

      // 卡牌名称
      drawArtText(ctx, i18n.t(def.nameKey), cx + cardW * 0.5, cy + 9, {
        style: isSelected ? 'gold' : (affordable ? 'parchment' : 'dim'),
        size: 10.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 快捷键角标 [1..5]
      roundRectPath(ctx, cx + 2, cy + 2, 14, 13, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();
      drawArtText(ctx, String(i + 1), cx + 9, cy + 8.5, {
        style: 'gold',
        size: 9,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      // 【核心守卫UI显示】读取 100% AI 手绘卡牌原画 assets/ui/cards/card_${tId}.png 并自适应居中渲染
      const cardArtImg = platform.getImage("assets/ui/cards/card_" + tId + ".png");
      if (cardArtImg && cardArtImg.width) {
        const maxArtW = 54;
        const maxArtH = 50;
        const artAspect = cardArtImg.width / cardArtImg.height;
        let dw = maxArtW, dh = maxArtH;
        if (artAspect > (maxArtW / maxArtH)) {
          dh = maxArtW / artAspect;
        } else {
          dw = maxArtH * artAspect;
        }
        // 柔和微光底座聚光
        ctx.save();
        ctx.fillStyle = isSelected ? 'rgba(255, 215, 0, 0.25)' : 'rgba(120, 255, 175, 0.12)';
        ctx.beginPath();
        ctx.ellipse(cx + cardW * 0.5, cy + 38, dw * 0.48, dh * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.drawImage(cardArtImg, cx + (cardW - dw) * 0.5, cy + 14 + (maxArtH - dh) * 0.5, dw, dh);
      } else {
        drawTowerSprite(ctx, tId, "base", "idle", 0, cx + (cardW - 32) * 0.5, cy + 32);
      }

      // PvZ 经典垂直扫光冷却遮罩 (Card Recharge Sweep)
      const curCd = this.cardCooldowns[tId] || 0;
      const maxCd = (this.cardMaxCooldowns && this.cardMaxCooldowns[tId]) || 5.0;
      if (curCd > 0) {
        const cdRatio = Math.min(1.0, curCd / maxCd);
        const maskH = Math.round(cardH * cdRatio);
        ctx.save();
        roundRectPath(ctx, cx, cy, cardW, cardH, 8);
        ctx.clip();
        ctx.fillStyle = 'rgba(12, 10, 8, 0.68)';
        ctx.fillRect(cx, cy, cardW, maskH);
        // 金色扫光刻度线
        ctx.strokeStyle = 'rgba(255, 229, 143, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy + maskH);
        ctx.lineTo(cx + cardW, cy + maskH);
        ctx.stroke();
        ctx.restore();
      }

      // 底部孢子消耗胶囊
      roundRectPath(ctx, cx + 8, cy + cardH - 18, cardW - 16, 15, 6);
      ctx.fillStyle = 'rgba(15, 10, 6, 0.85)';
      ctx.fill();
      drawUiIcon(ctx, 16, 'spore', cx + 12, cy + cardH - 18, 14);
      drawArtText(ctx, String(cost), cx + cardW * 0.5 + 6, cy + cardH - 10, {
        style: affordable ? 'gold' : 'crimson',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });
      ctx.restore();

      const isCardInCooldown = (this.cardCooldowns[tId] || 0) > 0;
      this.registerButton('slot_' + tId, cx, cy, cardW, cardH, () => {
        if ((this.cardCooldowns[tId] || 0) > 0) {
          platform.playSfx('sfx_click', 0.5, 0.7);
          return;
        }
        scene.selectBuildTowerType(tId);
        platform.playSfx('sfx_click');
      }, { towerId: tId, disabled: isCardInCooldown });
    }

    // =========================================================================
    // [分区 4] 远古灵能觉醒超载舱 (X: 730..940)
    // =========================================================================
    const awkX = 736;
    const awkY = baseY + 6;
    const awkW = 204;
    const awkH = cardH;
    const isAwkTargeting = scene.activeAwakeningTargeting;

    ctx.save();
    roundRectPath(ctx, awkX, awkY, awkW, awkH, 8);
    ctx.fillStyle = isAwkTargeting ? 'rgba(80, 20, 110, 0.92)' : 'rgba(26, 18, 12, 0.90)';
    ctx.fill();
    ctx.strokeStyle = isAwkTargeting ? '#D3ADF7' : 'rgba(198, 143, 69, 0.65)';
    ctx.lineWidth = isAwkTargeting ? 2.2 : 1.2;
    ctx.stroke();

    const seedImg = platform.getImage('assets/vfx/item_awakening_seed.png');
    if (seedImg && seedImg.width) {
      ctx.drawImage(seedImg, awkX + 8, awkY + 22, 28, 28);
    }

    drawArtText(ctx, '灵能觉醒 [空格]', awkX + 68, awkY + 14, {
      style: isAwkTargeting ? 'gold' : 'parchment',
      size: 11,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });

    drawArtText(ctx, '古种 ×' + (scene.awakeningSeeds || 0), awkX + 68, awkY + 36, {
      style: (scene.awakeningSeeds > 0) ? 'gold' : 'dim',
      size: 11.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    drawArtText(ctx, (scene.awakeningSeeds > 0 ? '超载全屏觉醒' : '精英敌人掉落'), awkX + 68, awkY + 56, {
      style: isAwkTargeting ? 'azure' : 'parchment',
      size: 8.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.6
    });
    ctx.restore();

    this.registerButton('dock_awakening', awkX, awkY, awkW, awkH, () => {
      if (scene.awakeningSeeds > 0) {
        scene.activeAwakeningTargeting = !scene.activeAwakeningTargeting;
        platform.playSfx('sfx_click');
        if (scene.activeAwakeningTargeting) {
          this.showToast('请点击场上的蘑菇触发灵能觉醒超载!');
        }
      } else {
        this.showToast('灵能觉醒种子不足(击败精英敌人获取)!');
      }
    });

    if (this.dockExpansion >= 0.65) {
      this.registerButton('dock_fold_btn', 894, baseY + 3, 52, 16, () => {
        this.dockTargetExpansion = 0.0;
        platform.playSfx('sfx_click');
      });
    }

    ctx.restore();
  }
  /**
   * 战地即时灵动快捷环（Tower Tactical Micro Quick-Actions）
   * 专为手机端触控优化：点击防御塔后，在塔身周围直接浮现「A线升级」「B线升级」「索敌」「详情」微胶囊
   * 拇指一键触达，无需将视线与手指大幅移动至屏幕侧板
   */
  renderTowerTacticalQuickRing(ctx, scene, tower, tileScreenX, tileScreenY) {
    if (!tower) return;
    this.hoveredUpgradeNodeId = null;
    const upgrades = scene.towerManager.getAvailableUpgrades(tower);
    const priStr = i18n.t('prio_' + (tower.priority || 'first'));
    // 安全钳制边界：绝不让边缘/底行守卫的快捷环被底部卡槽栏(Y>=474)或屏幕左右边框裁切遮挡
    const minAnchorX = (tileScreenY > 350) ? 252 : 108;
    const anchorX = Math.max(minAnchorX, Math.min(852, tileScreenX));
    const topY = Math.max(46, Math.min(392, tileScreenY - 50));
    const botY = Math.min(436, Math.max(108, tileScreenY + 36));

    ctx.save();

    // 1. 顶部：升级选项（使用 AI 手绘按钮皮肤并保留原尺寸位置）
    if (upgrades.length === 1) {
      const up = upgrades[0];
      const canAfford = scene.economy.canAfford(up.cost);
      const uw = 108;
      const uh = 28;
      const ux = Math.round(anchorX - uw * 0.5);
      const uy = Math.round(topY);
      const isHov = this.isPointHovered(ux, uy, uw, uh);
      if (isHov) this.hoveredUpgradeNodeId = up.nodeId;

      if (!this.drawAiFrame(ctx, canAfford ? 'btn_green' : 'btn_wood', ux, uy, uw, uh, canAfford ? 1.0 : 0.72)) {
        roundRectPath(ctx, ux, uy, uw, uh, 14);
        ctx.fillStyle = canAfford ? 'rgba(16, 42, 28, 0.94)' : 'rgba(28, 20, 16, 0.92)';
        ctx.fill();
        ctx.strokeStyle = canAfford ? 'rgba(82, 196, 26, 0.85)' : 'rgba(140, 100, 70, 0.55)';
        ctx.lineWidth = canAfford ? 1.6 : 1.0;
        ctx.stroke();
      }
      if (isHov) {
        roundRectPath(ctx, ux + 1, uy + 1, uw - 2, uh - 2, 7);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      drawArtText(ctx, `强化 · ${up.cost}`, ux + uw * 0.5, uy + 14, {
        style: canAfford ? 'gold' : 'parchment',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });

      this.registerButton('quick_up_single', ux, uy, uw, uh, () => {
        scene.tryUpgradeSelectedTower(up.nodeId);
      });
    } else if (upgrades.length === 2) {
      // 双分支 A/B 并排胶囊
      for (let i = 0; i < 2; i++) {
        const up = upgrades[i];
        const canAfford = scene.economy.canAfford(up.cost);
        const uw = 92;
        const uh = 28;
        const ux = Math.round(i === 0 ? anchorX - uw - 4 : anchorX + 4);
        const uy = Math.round(topY);
        const isHov = this.isPointHovered(ux, uy, uw, uh);
        if (isHov) this.hoveredUpgradeNodeId = up.nodeId;
        const skin = canAfford ? (i === 0 ? 'btn_blue' : 'btn_green') : 'btn_wood';

        if (!this.drawAiFrame(ctx, skin, ux, uy, uw, uh, canAfford ? 1.0 : 0.72)) {
          roundRectPath(ctx, ux, uy, uw, uh, 14);
          ctx.fillStyle = canAfford ? (i === 0 ? 'rgba(12, 36, 56, 0.94)' : 'rgba(16, 44, 28, 0.94)') : 'rgba(28, 20, 16, 0.92)';
          ctx.fill();
          ctx.strokeStyle = canAfford ? (i === 0 ? 'rgba(64, 169, 255, 0.85)' : 'rgba(82, 196, 26, 0.85)') : 'rgba(140, 100, 70, 0.55)';
          ctx.lineWidth = canAfford ? 1.6 : 1.0;
          ctx.stroke();
        }
        if (isHov) {
          roundRectPath(ctx, ux + 1, uy + 1, uw - 2, uh - 2, 7);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        drawArtText(ctx, `${i === 0 ? '甲线' : '乙线'} · ${up.cost}`, ux + uw * 0.5, uy + 14, {
          style: canAfford ? 'gold' : 'parchment',
          size: 10.5,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 0.9
        });

        this.registerButton('quick_up_branch_' + up.nodeId, ux, uy, uw, uh, () => {
          scene.tryUpgradeSelectedTower(up.nodeId);
        });
      }
    } else {
      // 已升至顶级
      const uw = 88;
      const uh = 24;
      const ux = Math.round(anchorX - uw * 0.5);
      const uy = Math.round(topY + 2);

      if (!this.drawAiFrame(ctx, 'top_bar', ux, uy, uw, uh, 0.96)) {
        roundRectPath(ctx, ux, uy, uw, uh, 12);
        ctx.fillStyle = 'rgba(28, 24, 12, 0.92)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      drawArtText(ctx, '宗师满阶', ux + uw * 0.5, uy + 12, {
        style: 'gold',
        size: 10.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.9
      });
    }

    // 2. 底部：战术微操双按钮（索敌 + 属性详情）
    const ph = 28;
    const py = Math.round(botY);
    const px1 = Math.round(anchorX - 74); // 索敌
    const px2 = Math.round(anchorX + 4);  // 详情属性

    // (1) 索敌按钮
    if (!this.drawAiFrame(ctx, 'btn_blue', px1, py, 70, ph, 0.98)) {
      roundRectPath(ctx, px1, py, 70, ph, 14);
      ctx.fillStyle = 'rgba(20, 24, 28, 0.94)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 140, 180, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    drawArtText(ctx, `索敌 · ${priStr}`, px1 + 35, py + 14, {
      style: 'azure',
      size: 11,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.9
    });

    this.registerButton('quick_pri_btn', px1, py, 70, ph, () => {
      if (scene.towerManager) {
        scene.towerManager.cyclePriority(tower);
      }
      platform.playSfx('sfx_click');
      const nextPrio = i18n.t('prio_' + tower.priority);
      if (scene.fx) scene.fx.spawnFloatingText(tower.x, tower.y - 18, `索敌: ${nextPrio}`, '#FFE58F', 1.0);
    });

    // (2) 详情面板轻量开关
    if (!this.drawAiFrame(ctx, this.showTowerDetailBoard ? 'btn_green' : 'btn_wood', px2, py, 70, ph, 0.98)) {
      roundRectPath(ctx, px2, py, 70, ph, 14);
      ctx.fillStyle = this.showTowerDetailBoard ? 'rgba(56, 38, 18, 0.96)' : 'rgba(22, 28, 36, 0.92)';
      ctx.fill();
      ctx.strokeStyle = this.showTowerDetailBoard ? 'rgba(255, 215, 0, 0.85)' : 'rgba(120, 160, 200, 0.60)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    drawArtText(ctx, '详细属性', px2 + 35, py + 14, {
      style: this.showTowerDetailBoard ? 'gold' : 'parchment',
      size: 11,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.9
    });

    this.registerButton('quick_detail_btn', px2, py, 70, ph, () => {
      this.showTowerDetailBoard = !this.showTowerDetailBoard;
      platform.playSfx('sfx_click');
    });

    ctx.restore();
  }

  renderTowerInspectorPopup(ctx, scene) {
    const col = scene.selectedTile.col;
    const row = scene.selectedTile.row;
    if (!scene.map || !scene.map.inBounds(col, row)) {
      this.inspectorRect = null;
      return;
    }

    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const tileScreenX = mv.OFFSET_X + (col + 0.5) * TILE_SIZE * mv.SCALE;
    const tileScreenY = mv.OFFSET_Y + (row + 0.5) * TILE_SIZE * mv.SCALE;

    const existingTower = scene.towerManager.getTowerAt(col, row);
    const canBuild = scene.map.canBuildAt(col, row);
    if (!existingTower && !canBuild) {
      this.inspectorRect = null;
      return;
    }

    // 1. 若为已有防御塔且详情面板未展开：呈现轻量战地灵动快捷环（0 遮挡，与详情木板互不重叠）
    if (existingTower) {
      if (!this.showTowerDetailBoard) {
        this.renderTowerTacticalQuickRing(ctx, scene, existingTower, tileScreenX, tileScreenY);
        this.inspectorRect = {
          x: tileScreenX - 110,
          y: tileScreenY - 60,
          w: 220,
          h: 128
        };
        return;
      }
    } else if (canBuild) {
      // 1.5 若为空闲战术雕石位：在石座上方直接展开 Kingdom Rush 5向圆形建造轮盘
      this.renderBuildRadialWheel(ctx, scene, col, row, tileScreenX, tileScreenY);
      return;
    }

    const pw = 344;
    const ph = existingTower ? 292 : 232;
    // 智能停靠：停靠在屏幕边缘，确保地面的 360 度攻击范围完整无遮挡展示
    let px = tileScreenX < 480 ? Math.min(Math.round(tileScreenX + 32), 960 - pw - 14) : Math.max(14, Math.round(tileScreenX - pw - 32));
    px = Math.max(14, Math.min(960 - pw - 14, px));
    let py = Math.max(24, Math.min(526 - ph, Math.round(tileScreenY - ph * 0.5)));

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

    // 绘制主面板 9-Slice 木框+羊皮纸
    this.drawWoodlandPanel(ctx, px, py, pw, ph, THEME.BRONZE_MID, 0.98, 14, true);

    // 右上角关闭按钮 [×]（严密收进羊皮纸安全内角，绝不踩上右上铜角铁件）
    this.drawPixelButton(ctx, 'insp_close', px + pw - 46, py + 24, 22, 22, '×', {
      skin: 'btn_wood',
      font: `bold 14px ${UI_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      this.showTowerDetailBoard = false;
      if (!existingTower) {
        this.inspectorOpen = false;
        scene.selectedTile = { col: -1, row: -1 };
      }
    });

    if (existingTower) {
      if (this.showTowerDetailBoard) {
        this.hoveredUpgradeNodeId = null;
      }
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
    const bx = x + 28;
    const btnW = w - 56; // 288px 对称铺满安全羊皮纸内框

    // 1. 头像框（42x42，完全在羊皮纸安全区内）
    ctx.save();
    roundRectPath(ctx, bx, y + 28, 42, 42, 10);
    ctx.fillStyle = 'rgba(72, 48, 28, 0.18)';
    ctx.fill();
    ctx.strokeStyle = THEME.BRONZE_MID;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawUiIcon(ctx, 24, tower.typeId, bx + 1, y + 29, 40);

    // 标题：守卫名字 · 节点名字（右侧留足关闭按钮安全距）
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 15px ${UI_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const fullName = `${i18n.t(def.nameKey)} · ${i18n.t(node.nameKey)}`;
    ctx.fillText(fullName, bx + 50, y + 35, Math.max(80, w - 134));

    // 等级阶级徽章（胶囊型，y+54）
    const lvMap = { base: '基础 1阶', lv1: '强化 2阶', a2: '甲线 3阶', a3: '甲线 顶阶', b2: '乙线 3阶', b3: '乙线 顶阶' };
    const lvBadgeW = 62;
    roundRectPath(ctx, bx + 50, y + 54, lvBadgeW, 18, 9);
    ctx.fillStyle = tower.branch === 'A' ? '#1D6373' : (tower.branch === 'B' ? '#8C4D18' : '#33612E');
    ctx.fill();
    ctx.fillStyle = '#FFFDF5';
    ctx.font = `bold 11px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lvMap[tower.nodeId] || '1阶', bx + 50 + lvBadgeW * 0.5, y + 63);

    // 战术定位微胶囊与菌丝共振羁绊微标
    const roleStr = i18n.t(def.roleKey) || '林地守卫';
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
    const roleTagX = bx + 50 + lvBadgeW + 8;
    const roleTagW = 84;
    if (synName) {
      const synTagX = roleTagX + roleTagW + 6;
      roundRectPath(ctx, synTagX, y + 54, 58, 18, 9);
      ctx.fillStyle = synBg;
      ctx.fill();
      ctx.fillStyle = '#FFFDF5';
      ctx.font = `bold 10px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(synName, synTagX + 29, y + 63);
    }

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

    // 2. 核心战斗属性药丸胶囊（三等分铺满 288px 可用内宽，y+79）
    const statsY = y + 79;
    const pillW = 90;
    const pillGap = 9;
    let dmgVal = `${node.damage}`;
    let dmgLabel = '攻击';
    let dmgIcon = 'atk';
    let dmgCat = 24;
    if (tower.typeId === 'lumina') {
      if (node.branch === 'A') {
        dmgVal = `${node.damage}/+${node.auraHeal || 25}`;
        dmgLabel = '圣光·疗';
        dmgIcon = 'atk';
      } else {
        dmgVal = `+${node.sporeGen || 12}/次`;
        dmgLabel = '产孢';
        dmgIcon = 'spore';
        dmgCat = 16;
      }
    } else if (tower.typeId === 'mist') {
      dmgVal = `${node.dps}/秒`;
      dmgLabel = '雾伤';
    }
    const statItems = [
      { cat: dmgCat, icon: dmgIcon, label: dmgLabel, val: dmgVal },
      { cat: 24, icon: 'aspd', label: '间隔', val: `${node.interval}s` },
      { cat: 16, icon: 'target', label: '射程', val: `${node.range}格` }
    ];
    for (let i = 0; i < 3; i++) {
      const st = statItems[i];
      const sx = bx + i * (pillW + pillGap);
      ctx.save();
      roundRectPath(ctx, sx, statsY, pillW, 32, 8);
      ctx.fillStyle = 'rgba(84, 56, 32, 0.10)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawUiIcon(ctx, st.cat, st.icon, sx + 6, statsY + 6, 20);
      ctx.fillStyle = '#855F38';
      ctx.font = `9.5px ${UI_FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.label, sx + 28, statsY + 9);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 11.5px ${UI_FONT}`;
      ctx.fillText(st.val, sx + 28, statsY + 23);
      ctx.restore();
    }

    // 3. 升级卡片或双分支选择
    const upgrades = scene.towerManager.getAvailableUpgrades(tower);

    if (upgrades.length === 0) {
      // 已升至顶级
      ctx.save();
      roundRectPath(ctx, bx, y + 118, btnW, 64, 10);
      ctx.fillStyle = 'rgba(62, 107, 56, 0.14)';
      ctx.fill();
      ctx.strokeStyle = THEME.BRONZE_MID;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawUiIcon(ctx, 24, 'crown', x + w * 0.5 - 16, y + 123, 32);
      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 12.5px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`已升至最高阶 · 覆盖道路 ${cov.coveredTiles} 格`, x + w * 0.5, y + 167);
      ctx.restore();
    } else if (upgrades.length === 1) {
      // 单分支升级 (Base -> LV1)
      const up = upgrades[0];
      const canAfford = scene.economy.canAfford(up.cost);
      const upIcon = up.branch === 'A' ? 'branch_a' : (up.branch === 'B' ? 'branch_b' : 'upgrade');
      const upCat = (up.branch === 'A' || up.branch === 'B') ? 24 : 16;

      if (this.isPointHovered(bx, y + 118, btnW, 36)) {
        this.hoveredUpgradeNodeId = up.nodeId;
      }
      this.drawPixelButton(
        ctx,
        'btn_upgrade_single',
        bx,
        y + 118,
        btnW,
        36,
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
      roundRectPath(ctx, bx, y + 158, btnW, 25, 6);
      ctx.fillStyle = 'rgba(92, 64, 40, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = THEME.INK_MID;
      ctx.font = `11px ${UI_FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`效果: ${i18n.t(up.descKey)}`, bx + 10, y + 170.5, btnW - 20);
      ctx.restore();
    } else if (upgrades.length === 2) {
      // 双分支路线选择（甲线 vs 乙线）+ 悬停实时分支特性对比条
      let hoveredBranch = null;
      for (let i = 0; i < 2; i++) {
        const up = upgrades[i];
        const canAfford = scene.economy.canAfford(up.cost);
        const by = y + 116 + i * 35;
        if (this.isPointHovered(bx, by, btnW, 32)) {
          this.hoveredUpgradeNodeId = up.nodeId;
          hoveredBranch = up;
        }
        this.drawPixelButton(
          ctx,
          'btn_upgrade_branch_' + up.nodeId,
          bx,
          by,
          btnW,
          32,
          `${up.branch === 'A' ? '甲线' : '乙线'}: ${i18n.t(up.nameKey)}`,
          {
            skin: canAfford ? (up.branch === 'A' ? 'btn_blue' : 'btn_green') : 'btn_wood',
            align: 'left',
            font: `bold 12.5px ${UI_FONT}`,
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

      ctx.save();
      roundRectPath(ctx, bx, y + 186, btnW, 22, 6);
      ctx.fillStyle = hoveredBranch ? 'rgba(64, 44, 24, 0.14)' : 'rgba(92, 64, 40, 0.08)';
      ctx.fill();
      ctx.strokeStyle = hoveredBranch ? THEME.BRONZE_MID : 'rgba(140, 94, 42, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = hoveredBranch ? THEME.INK_DARK : THEME.INK_MID;
      ctx.font = `${hoveredBranch ? 'bold ' : ''}10.5px ${UI_FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const branchTip = hoveredBranch
        ? `${hoveredBranch.branch === 'A' ? '甲线' : '乙线'}效果: ${i18n.t(hoveredBranch.descKey)}`
        : '悬停甲线 / 乙线可实时预览分支特性与射程增幅';
      ctx.fillText(branchTip, bx + 8, y + 197, btnW - 16);
      ctx.restore();
    }

    // 3.5 单塔累计战功统计栏 (Pop Count & Damage Contribution)
    const tdmg = Math.round(tower.totalDamage || 0);
    const tdmgStr = tdmg >= 1000 ? `${(tdmg / 1000).toFixed(1)}k` : String(tdmg);
    const tkills = tower.kills || 0;
    ctx.save();
    roundRectPath(ctx, bx, y + 211, btnW, 20, 5);
    ctx.fillStyle = 'rgba(72, 48, 28, 0.08)';
    ctx.fill();
    ctx.fillStyle = THEME.INK_MID;
    ctx.font = `bold 10.5px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`本塔战功：输出 ${tdmgStr} 伤害  ·  击杀 ${tkills} 虫  ·  覆路 ${cov.coveredTiles} 格`, bx + btnW * 0.5, y + 221, btnW - 12);
    ctx.restore();

    // 4. 底部动作栏：全宽战术索敌优先级切换按钮（严格留出 22px 下边距，不贴木框）
    const prioKey = 'prio_' + tower.priority;
    const canCyclePrio = (def.priorities && def.priorities.length > 1);
    this.drawPixelButton(
      ctx,
      'btn_tower_prio',
      bx,
      y + 236,
      btnW,
      34,
      `切换索敌策略：${i18n.t(prioKey)}`,
      {
        skin: 'btn_blue',
        disabled: !canCyclePrio,
        align: 'center',
        font: `bold 13px ${UI_FONT}`,
        iconKey: 'target',
        iconSize: 18
      },
      () => {
        scene.towerManager.cyclePriority(tower);
      }
    );
  }

  /**
   * 选中古雕石地基时的 Kingdom Rush 5向圆形建造轮盘
   */
  renderBuildRadialWheel(ctx, scene, col, row, tileScreenX, tileScreenY) {
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const tileCenterX = Math.round(tileScreenX);
    const tileCenterY = Math.round(tileScreenY);
    const ax = Math.max(88, Math.min(872, tileCenterX));
    const ay = Math.max(88, Math.min(388, tileCenterY));
    const age = scene.selectedTileAgeSec || 0;
    const pop = Math.min(1.0, age / 0.16);
    const wheelR = 54 * (0.76 + 0.24 * Math.sin(pop * Math.PI * 0.5));

    // 若因靠近底栏而轻度偏移，用细金虚线锚向源地基
    if (Math.hypot(ax - tileCenterX, ay - tileCenterY) > 6) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 229, 143, 0.72)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(tileCenterX, tileCenterY);
      ctx.lineTo(ax, ay);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.save();
    // 轮盘主铭文青铜石环（优先使用 AI 手绘德鲁伊青铜罗盘环）
    const wheelBgImg = platform.getImage('assets/ui/frames/radial_wheel_bg.png');
    if (wheelBgImg && wheelBgImg.width) {
      const sz = Math.round(154 * (0.76 + 0.24 * Math.sin(pop * Math.PI * 0.5)));
      ctx.drawImage(wheelBgImg, Math.round(ax - sz * 0.5), Math.round(ay - sz * 0.5), sz, sz);
      platform.recordDrawCall(1);
    } else {
      ctx.beginPath();
      ctx.arc(ax, ay, wheelR + 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(22, 16, 10, 0.55)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(198, 143, 69, 0.85)';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ax, ay, wheelR - 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 229, 143, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 中心关闭徽章 [×]
    const closeHover = Math.hypot(this.hoverX - ax, this.hoverY - ay) <= 16;
    ctx.beginPath();
    ctx.arc(ax, ay, 14, 0, Math.PI * 2);
    ctx.fillStyle = closeHover ? 'rgba(110, 42, 32, 0.96)' : 'rgba(42, 28, 16, 0.94)';
    ctx.fill();
    ctx.strokeStyle = closeHover ? '#FFD700' : '#C68F45';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawArtText(ctx, '×', ax, ay + 0.5, {
      style: 'gold',
      size: 14,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.9
    });
    ctx.restore();

    this.registerButton('radial_close', ax - 16, ay - 16, 32, 32, () => {
      this.hoveredRadialTowerId = null;
      this.inspectorOpen = false;
      scene.selectedTile = { col: -1, row: -1 };
      platform.playSfx('sfx_click');
    });

    const towerOrder = ['watch', 'mist', 'thorn', 'burst', 'lumina'];
    this.hoveredRadialTowerId = null;

    for (let i = 0; i < towerOrder.length; i++) {
      const tId = towerOrder[i];
      const def = TOWERS[tId];
      if (!def || !def.nodes || !def.nodes.base) continue;
      const baseNode = def.nodes.base;
      const cost = baseNode.cost;
      const affordable = scene.economy.canAfford(cost);
      const ang = -Math.PI * 0.5 + (i / towerOrder.length) * Math.PI * 2;
      const nx = Math.round(ax + Math.cos(ang) * wheelR);
      const ny = Math.round(ay + Math.sin(ang) * wheelR);
      const isHovered = Math.hypot(this.hoverX - nx, this.hoverY - ny) <= 22;
      if (isHovered) {
        this.hoveredRadialTowerId = tId;
      }

      const nodeR = isHovered ? 21 : 19;
      ctx.save();
      ctx.beginPath();
      ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = isHovered
        ? (affordable ? 'rgba(62, 46, 22, 0.98)' : 'rgba(58, 22, 20, 0.96)')
        : (affordable ? 'rgba(32, 22, 14, 0.96)' : 'rgba(24, 16, 14, 0.90)');
      ctx.fill();
      ctx.strokeStyle = isHovered
        ? (affordable ? '#FFD700' : '#FF7875')
        : (affordable ? '#C68F45' : 'rgba(140, 82, 72, 0.65)');
      ctx.lineWidth = isHovered ? 2.4 : 1.5;
      ctx.stroke();

      // 圆形裁切绘制蘑菇手绘立绘
      ctx.save();
      ctx.beginPath();
      ctx.arc(nx, ny, nodeR - 2, 0, Math.PI * 2);
      ctx.clip();
      const cardImg = platform.getImage('assets/ui/cards/card_' + tId + '.png');
      if (cardImg && cardImg.width) {
        if (!affordable) ctx.globalAlpha = 0.48;
        ctx.drawImage(cardImg, nx - 16, ny - 16, 32, 30);
      } else {
        drawUiIcon(ctx, 24, tId, nx - 12, ny - 12, 24);
      }
      ctx.restore();

      // 底部孢子标价胶囊
      roundRectPath(ctx, nx - 15, ny + 10, 30, 13, 5);
      ctx.fillStyle = 'rgba(10, 6, 4, 0.94)';
      ctx.fill();
      ctx.strokeStyle = affordable ? 'rgba(255, 215, 0, 0.65)' : 'rgba(255, 77, 79, 0.65)';
      ctx.lineWidth = 0.9;
      ctx.stroke();
      drawArtText(ctx, String(cost), nx, ny + 16.5, {
        style: affordable ? 'gold' : 'crimson',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });
      ctx.restore();

      this.registerButton('radial_build_' + tId, nx - 21, ny - 21, 42, 42, () => {
        scene.selectBuildTowerType(tId);
        const built = scene.tryBuildOnSelectedTile();
        if (built) {
          this.hoveredRadialTowerId = null;
          this.inspectorOpen = false;
        }
      });
    }

    // 悬停预览浮动铭牌（显示塔名、定位与覆盖路格数）
    if (this.hoveredRadialTowerId && TOWERS[this.hoveredRadialTowerId]) {
      const hId = this.hoveredRadialTowerId;
      const hDef = TOWERS[hId];
      const hBase = hDef.nodes.base;
      const cov = scene.map.getRangeCoverage(col, row, hBase.range, hDef.canHitGround, hDef.canHitAir);
      const infoText = `${i18n.t(hDef.nameKey)} · ${i18n.t(hDef.roleKey)} · 覆路${cov.coveredTiles}格`;
      const pillW = Math.max(158, infoText.length * 10 + 18);
      const pillX = Math.max(14, Math.min(946 - pillW, Math.round(ax - pillW * 0.5)));
      const pillY = ay > 280 ? Math.max(12, ay - wheelR - 46) : Math.min(444, ay + wheelR + 30);

      ctx.save();
      if (!this.drawAiFrame(ctx, 'top_bar', pillX, pillY, pillW, 24, 0.96)) {
        roundRectPath(ctx, pillX, pillY, pillW, 22, 8);
        ctx.fillStyle = 'rgba(20, 14, 10, 0.94)';
        ctx.fill();
        ctx.strokeStyle = '#C68F45';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      drawArtText(ctx, infoText, pillX + pillW * 0.5, pillY + 12, {
        style: 'parchment',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.7
      });
      ctx.restore();
    }

    this.inspectorRect = {
      x: ax - 84,
      y: ay - 84,
      w: 168,
      h: 168
    };
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
    const bx = x + 28;
    const btnW = w - 56;

    // 头像与定位
    drawUiIcon(ctx, 24, tId, bx, y + 30, 42);
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 15px ${UI_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i18n.t(def.nameKey)} · ${i18n.t(def.roleKey)}`, bx + 50, y + 40, Math.max(80, w - 134));

    ctx.fillStyle = isMoss ? THEME.ENAMEL_GREEN : THEME.INK_MID;
    ctx.font = `bold 11px ${UI_FONT}`;
    ctx.fillText(isMoss ? `◆ 雕石地基 · 覆盖道路 ${cov.coveredTiles} 格` : `草地建造位 · 覆盖道路 ${cov.coveredTiles} 格`, bx + 50, y + 58);

    // 描述与属性
    this.drawWrappedText(ctx, i18n.t(def.descKey), bx, y + 80, btnW, 16, THEME.INK_MID, `11px ${UI_FONT}`);

    const isLumina = tId === 'lumina';
    const dmgVal = isLumina ? `+${baseNode.sporeGen || 8}/次` : (tId === 'mist' ? `${baseNode.dps}/秒` : `${baseNode.damage}`);
    const statLabel1 = isLumina ? '产孢' : '伤害';
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 12px ${UI_FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${statLabel1}: ${dmgVal}   间隔: ${baseNode.interval}s   射程: ${baseNode.range}格`, bx, y + 128);

    // 种植按钮
    this.drawPixelButton(
      ctx,
      'btn_confirm_build',
      bx,
      y + 166,
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

  drawPlacementRangeOverlay(ctx, scene, col, row, typeId, node, opts = {}) {
    const map = scene.map;
    const def = TOWERS[typeId];
    if (!map || !def || !node) return;

    const tileX = col * TILE_SIZE;
    const tileY = row * TILE_SIZE;
    const cov = map.getRangeCoverage(col, row, node.range, def.canHitGround, def.canHitAir);
    const enterProg = opts.enterProg !== undefined ? opts.enterProg : 1.0;
    const enterScale = 0.88 + 0.12 * Math.sin(enterProg * Math.PI * 0.5);
    const ringColor = opts.affordable === false ? '#FF7875' : (opts.ringColor || '#B7EB8F');

    const circleMap = {
      mist: 'assets/vfx/range_mist_poison.png',
      burst: 'assets/vfx/range_burst_mortar.png',
      watch: 'assets/vfx/range_watch_sniper.png',
      lumina: 'assets/vfx/range_sunburst_gold.png',
      thorn: 'assets/vfx/range_thorn_bramble.png'
    };
    const circleImg = platform.getImage(circleMap[typeId] || 'assets/vfx/range_thorn_bramble.png');

    ctx.save();
    if (circleImg && opts.affordable !== false) {
      ctx.save();
      ctx.translate(cov.centerX, cov.centerY);
      ctx.scale(1.0, 0.78);
      ctx.rotate(this.uiAnimTime * 0.22);
      ctx.scale(enterScale, enterScale);
      const baseAlpha = opts.isPreview ? 0.34 : 0.42;
      ctx.globalAlpha = (baseAlpha + Math.sin(this.uiAnimTime * 3) * 0.05) * enterProg;
      const drawRadius = cov.radiusPx / 0.85;
      ctx.drawImage(circleImg, -drawRadius, -drawRadius, drawRadius * 2, drawRadius * 2);
      ctx.restore();
    } else {
      ctx.fillStyle = ringColor;
      ctx.globalAlpha = (opts.isPreview ? 0.11 : 0.06) * enterProg;
      ctx.beginPath();
      ctx.ellipse(cov.centerX, cov.centerY, cov.radiusPx * enterScale, cov.radiusPx * 0.78 * enterScale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.62 * enterProg;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([7, 5]);
      ctx.lineDashOffset = -Math.round((this.uiAnimTime * 18) % 12);
      ctx.beginPath();
      ctx.ellipse(cov.centerX, cov.centerY, cov.radiusPx * enterScale, cov.radiusPx * 0.78 * enterScale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 射程覆盖路线柔和光点（金色仙灵微粒，严格对齐椭圆透视）
    ctx.globalAlpha = (opts.isPreview ? 0.72 : 0.65) * enterProg;
    ctx.fillStyle = opts.affordable === false ? '#FFCCC7' : '#FFE58F';
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

    // 选中/悬停石座高亮基底
    ctx.save();
    ctx.fillStyle = opts.affordable === false ? 'rgba(255, 77, 79, 0.22)' : 'rgba(82, 196, 26, 0.22)';
    ctx.strokeStyle = opts.affordable === false ? 'rgba(255, 120, 117, 0.82)' : 'rgba(255, 229, 143, 0.72)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(tileX + TILE_SIZE * 0.5, tileY + TILE_SIZE * 0.65, 18, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // BTD6/KR 式局部菌丝共鸣链路预览：仅展示与当前预览/选中守卫邻近(<=135px)发生羁绊的伙伴连线
    const partners = [];
    const comboLabels = [];
    const curTowers = scene.towerManager ? scene.towerManager.towers : [];
    const clusterTypes = new Set([typeId]);
    let twinPartner = null;
    for (let i = 0; i < curTowers.length; i++) {
      const pt = curTowers[i];
      if (!pt || (pt.col === col && pt.row === row)) continue;
      if (Math.hypot(pt.x - cov.centerX, pt.y - cov.centerY) <= 135) {
        clusterTypes.add(pt.typeId);
        const matchWatch = (typeId === 'watch' && pt.typeId === 'watch');
        const matchToxic = ((typeId === 'burst' && pt.typeId === 'mist') || (typeId === 'mist' && pt.typeId === 'burst'));
        const matchThorn = ((typeId === 'thorn' && pt.typeId === 'mist') || (typeId === 'mist' && pt.typeId === 'thorn'));
        const matchLumina = (typeId === 'lumina' || pt.typeId === 'lumina');
        if (matchWatch || matchToxic || matchThorn || matchLumina) {
          partners.push({
            tower: pt,
            color: matchWatch ? '#69C0FF' : (matchToxic ? '#52C41A' : (matchThorn ? '#95DE64' : '#FFD666'))
          });
          if (matchWatch) twinPartner = true;
        }
      }
    }
    if (twinPartner) comboLabels.push('双哨暴击');
    if (clusterTypes.has('mist') && clusterTypes.has('burst')) comboLabels.push('剧毒爆轰');
    if (clusterTypes.has('mist') && clusterTypes.has('thorn')) comboLabels.push('荆棘毒刺');
    if (clusterTypes.size >= 4) comboLabels.push('大共振');

    for (let pi = 0; pi < partners.length; pi++) {
      const pInfo = partners[pi];
      const pt = pInfo.tower;
      const mx = (cov.centerX + pt.x) * 0.5;
      const my = (cov.centerY + pt.y) * 0.5 - 12;
      ctx.save();
      ctx.strokeStyle = pInfo.color;
      ctx.globalAlpha = 0.72 * enterProg;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -Math.round((this.uiAnimTime * 18) % 8);
      ctx.beginPath();
      ctx.moveTo(cov.centerX, cov.centerY + 6);
      ctx.quadraticCurveTo(mx, my, pt.x, pt.y + 6);
      ctx.stroke();
      ctx.setLineDash([]);

      const beadT = (this.uiAnimTime * 0.9 + pi * 0.35) % 1.0;
      const invB = 1.0 - beadT;
      const bx = invB * invB * cov.centerX + 2 * invB * beadT * mx + beadT * beadT * pt.x;
      const by = invB * invB * (cov.centerY + 6) + 2 * invB * beadT * my + beadT * beadT * (pt.y + 6);
      ctx.fillStyle = '#FFF9DB';
      ctx.beginPath();
      ctx.arc(bx, by, 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // BTD6 式半透明虚影预览（悬停造塔/轮盘瞄准时）
    if (opts.drawGhost) {
      ctx.globalAlpha = 0.62;
      if (!drawTowerSprite(ctx, typeId, 'base', 'idle', 0, tileX, tileY)) {
        const fallbackImg = platform.getImage('assets/vfx/prop_lumina_a.png') || platform.getImage('assets/ui/cards/card_' + typeId + '.png');
        if (fallbackImg && fallbackImg.width) {
          ctx.drawImage(fallbackImg, tileX - 4, tileY - 14, 40, 44);
        }
      }
      if (comboLabels.length > 0) {
        const tagTxt = '✦ ' + comboLabels.slice(0, 2).join(' + ');
        ctx.globalAlpha = 1.0;
        ctx.font = `bold 10px ${CN_FONT}`;
        const tw = Math.ceil(ctx.measureText(tagTxt).width);
        const pw = tw + 14;
        const px = Math.round(cov.centerX - pw * 0.5);
        const py = Math.round(tileY + TILE_SIZE + 4);
        roundRectPath(ctx, px, py, pw, 16, 6);
        ctx.fillStyle = 'rgba(18, 28, 16, 0.92)';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.0;
        ctx.stroke();
        ctx.fillStyle = '#FFE58F';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagTxt, px + pw * 0.5, py + 8);
      }
    }
    ctx.restore();
  }

  renderMapPlacementPreview(ctx, scene) {
    const map = scene.map;
    if (!map || scene.state !== 'BATTLE') return;

    // 1. 若选中已种植的守卫：展示其专属地面法阵与覆盖航点
    if (this.inspectorOpen && scene.selectedTile && scene.selectedTile.col >= 0 && scene.selectedTile.row >= 0) {
      const selCol = scene.selectedTile.col;
      const selRow = scene.selectedTile.row;
      if (map.inBounds(selCol, selRow)) {
        const existingTower = scene.towerManager.getTowerAt(selCol, selRow);
        if (existingTower && existingTower.node) {
          const ringColor = existingTower.branch === 'A' ? '#6FE8FF' : (existingTower.branch === 'B' ? '#FFC069' : '#B7EB8F');
          const enterProg = Math.min(1.0, (scene.selectedTileAgeSec || 0) / 0.22);
          this.drawPlacementRangeOverlay(ctx, scene, selCol, selRow, existingTower.typeId, existingTower.node, {
            ringColor,
            enterProg,
            affordable: true,
            drawGhost: false
          });
          // 悬停升级按钮时预览进阶后的额外射程增益光环 (BTD6/KR 升级射程预览)
          if (this.hoveredUpgradeNodeId && existingTower.def && existingTower.def.nodes) {
            const upNode = existingTower.def.nodes[this.hoveredUpgradeNodeId];
            if (upNode && upNode.range > existingTower.node.range) {
              const upCov = map.getRangeCoverage(selCol, selRow, upNode.range, existingTower.def.canHitGround, existingTower.def.canHitAir);
              ctx.save();
              ctx.fillStyle = 'rgba(111, 232, 255, 0.06)';
              ctx.beginPath();
              ctx.ellipse(upCov.centerX, upCov.centerY, upCov.radiusPx, upCov.radiusPx * 0.78, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = 'rgba(111, 232, 255, 0.85)';
              ctx.lineWidth = 1.6;
              ctx.setLineDash([6, 4]);
              ctx.lineDashOffset = -Math.round((this.uiAnimTime * 22) % 10);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.restore();
            }
          }
          return;
        }
        // 2. 若空地雕石轮盘已展开：高亮当前石座，悬停某张轮盘图标时即时投射真实射程与虚影
        if (map.canBuildAt(selCol, selRow)) {
          if (this.hoveredRadialTowerId && TOWERS[this.hoveredRadialTowerId]) {
            const hDef = TOWERS[this.hoveredRadialTowerId];
            this.drawPlacementRangeOverlay(ctx, scene, selCol, selRow, this.hoveredRadialTowerId, hDef.nodes.base, {
              isPreview: true,
              drawGhost: true,
              affordable: scene.economy.canAfford(hDef.nodes.base.cost),
              ringColor: '#FFE58F'
            });
          } else {
            const tx = selCol * TILE_SIZE;
            const ty = selRow * TILE_SIZE;
            ctx.save();
            ctx.fillStyle = 'rgba(255, 229, 143, 0.16)';
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.ellipse(tx + 16, ty + 20, 18, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
          return;
        }
      }
    }

    // 3. 手持建塔卡牌或拖拽卡牌经过空雕石位时：BTD6 式地面真实射程圈 + 半透明虚影实时预览
    const activeTypeId = (this.isDragging && this.draggingTowerId) ? this.draggingTowerId : scene.selectedBuildTowerId;
    if (!activeTypeId || !TOWERS[activeTypeId]) return;

    let hc = -1;
    let hr = -1;
    if (this.isDragging && this.draggingTowerId) {
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const mx = (this.dragCurrentX - mv.OFFSET_X) / mv.SCALE;
      const my = (this.dragCurrentY - mv.OFFSET_Y) / mv.SCALE;
      hc = Math.floor(mx / TILE_SIZE);
      hr = Math.floor(my / TILE_SIZE);
      if (!map.canBuildAt(hc, hr)) {
        const offsets = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
        let bestD = 1.35;
        for (let k = 0; k < offsets.length; k++) {
          const nc = hc + offsets[k][0];
          const nr = hr + offsets[k][1];
          if (map.inBounds(nc, nr) && map.canBuildAt(nc, nr)) {
            const d = Math.hypot((nc + 0.5) - (mx / TILE_SIZE), (nr + 0.5) - (my / TILE_SIZE));
            if (d < bestD) { bestD = d; hc = nc; hr = nr; }
          }
        }
      }
    } else if (scene.hoverTile && scene.hoverTile.col >= 0) {
      hc = scene.hoverTile.col;
      hr = scene.hoverTile.row;
    }

    if (map.inBounds(hc, hr) && map.canBuildAt(hc, hr)) {
      const def = TOWERS[activeTypeId];
      this.drawPlacementRangeOverlay(ctx, scene, hc, hr, activeTypeId, def.nodes.base, {
        isPreview: true,
        drawGhost: true,
        affordable: scene.economy.canAfford(def.nodes.base.cost),
        ringColor: '#95DE64'
      });
    }
  }

  // =========================================================================
  // 4. 暂停、结算、设置与新手引导木质羊皮纸弹窗
  // =========================================================================
  renderPauseOverlay(ctx, scene) {
    this.clearButtons(); // 清空按钮防穿透
    ctx.fillStyle = 'rgba(6, 12, 8, 0.80)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 376;
    const mh = 330;
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 16, true);

    // 顶部手绘木牌标题（完全置入 9-Slice 羊皮纸安全内框，不压框不触顶角）
    const headW = 216;
    const headH = 38;
    const headX = mx + (mw - headW) * 0.5;
    const headY = my + 28;
    if (!this.drawAiFrame(ctx, 'top_bar', headX, headY, headW, headH, 0.98)) {
      roundRectPath(ctx, headX, headY, headW, headH, 8);
      ctx.fillStyle = 'rgba(28, 18, 10, 0.95)';
      ctx.fill();
      ctx.strokeStyle = THEME.BRONZE_MID;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    drawArtText(ctx, i18n.t('state_paused'), mx + mw * 0.5, headY + headH * 0.5, {
      style: 'gold',
      size: 16,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });

    // 优雅内敛的羊皮纸装饰分割线
    ctx.strokeStyle = 'rgba(110, 74, 38, 0.28)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(mx + 46, my + 78);
    ctx.lineTo(mx + mw - 46, my + 78);
    ctx.stroke();

    const bx = mx + 46;
    const bw = mw - 92;
    const btnH = 40;

    this.drawPixelButton(ctx, 'pause_resume', bx, my + 90, bw, btnH, i18n.t('btn_resume'), {
      skin: 'btn_green',
      iconKey: 'play'
    }, () => {
      platform.playSfx('sfx_click');
      scene.resumeGame();
    });

    this.drawPixelButton(ctx, 'pause_restart', bx, my + 142, bw, btnH, i18n.t('btn_restart'), {
      skin: 'btn_wood'
    }, () => {
      platform.playSfx('sfx_click');
      scene.restartLevel();
    });

    this.drawPixelButton(ctx, 'pause_settings', bx, my + 194, bw, btnH, i18n.t('btn_settings'), {
      skin: 'btn_wood',
      iconKey: 'settings'
    }, () => {
      platform.playSfx('sfx_click');
      this.showSettingsModal = true;
    });

    this.drawPixelButton(ctx, 'pause_exit', bx, my + 246, bw, btnH, i18n.t('btn_exit_title'), {
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

    const mw = 446;
    const mh = isEndless ? 336 : (isWin ? (scene.hasNextMap() ? 404 : 362) : 348);
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, (isWin || isEndless) ? THEME.BRONZE_BRIGHT : THEME.CRIMSON_SELL, 0.98, 16, true);

    ctx.save();
    ctx.textAlign = 'center';
    if (isEndless) {
      drawArtText(ctx, '无尽深渊试炼报告', mx + mw * 0.5, my + 52, {
        style: 'ink',
        color: '#8C1D18',
        size: 22,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });

      const currentWave = scene.waveManager ? scene.waveManager.currentWaveIndex : 1;
      drawArtText(ctx, `本次坚持至：第 ${currentWave} 波`, mx + mw * 0.5, my + 88, {
        style: 'ink',
        color: '#8C4D00',
        size: 17,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
      drawArtText(ctx, `历史最高纪录：第 ${Math.max(currentWave, bestEndless)} 波`, mx + mw * 0.5, my + 122, {
        style: 'ink',
        color: '#237804',
        size: 15,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
      drawArtText(ctx, '深渊虫群无休止涌现，林地英魂永垂不朽！', mx + mw * 0.5, my + 156, {
        style: 'ink',
        color: '#543820',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });

      const bx = mx + 56;
      const bw = mw - 112;

      this.drawPixelButton(ctx, 'settle_endless_retry', bx, my + 194, bw, 42, '🔥 再次挑战深渊', {
        skin: 'btn_green'
      }, () => {
        platform.playSfx('sfx_click');
        scene.startEndlessMode();
      });

      this.drawPixelButton(ctx, 'settle_levels', bx, my + 248, bw, 42, i18n.t('btn_level_select'), {
        skin: 'btn_wood'
      }, () => {
        platform.playSfx('sfx_click');
        scene.enterLevelSelect();
      });
    } else {
      // 丝带严格置入羊皮纸安全内区（主丝带腰部 Y = imgY + 0.51*rh = my + 56）
      const settleRib = platform.getImage(isWin ? 'assets/ui/frames/banner_ribbon_gold.png' : 'assets/ui/frames/banner_ribbon_crimson.png');
      if (settleRib && settleRib.width) {
        const ribW = 356;
        const ribH = 88;
        const ribX = mx + Math.round((mw - ribW) * 0.5);
        const ribY = my + 12;
        ctx.drawImage(settleRib, ribX, ribY, ribW, ribH);
        ctx.fillStyle = isWin ? '#2C1406' : '#FFF5E8';
        ctx.font = 'bold 19px ' + CN_FONT;
        ctx.textBaseline = 'middle';
        ctx.fillText(isWin ? i18n.t('state_victory') : i18n.t('state_defeat'), mx + mw * 0.5, ribY + Math.round(ribH * 0.51));
      } else {
        ctx.fillStyle = isWin ? THEME.ENAMEL_GREEN : THEME.CRIMSON_SELL;
        ctx.font = 'bold 21px ' + CN_FONT;
        ctx.textBaseline = 'middle';
        ctx.fillText(isWin ? i18n.t('state_victory') : i18n.t('state_defeat'), mx + mw * 0.5, my + 56);
      }

      for (let s = 0; s < 3; s++) {
        const sKey = s < stars ? 'star_full' : 'star_empty';
        drawUiIcon(ctx, 16, sKey, mx + Math.round(mw * 0.5) - 63 + s * 46, my + 84, 34);
      }

      // 战功总结手卷内嵌卡（2x2 真实战绩面板：耗时 / 种子 / 灭虫 / 核心主力）
      const timeSec = Math.round(scene.settlementResult.clearTimeSec * 10) / 10;
      let totalKills = 0;
      let mvpName = '树人守卫';
      let maxCatDmg = -1;
      let totalDmg = 0;
      if (scene.combatAnalytics) {
        totalDmg = scene.combatAnalytics.totalDamageDealt || 0;
        const stats = scene.combatAnalytics.categoryStats || {};
        for (const key of Object.keys(stats)) {
          const item = stats[key];
          totalKills += (item.kills || 0);
          if ((item.damage || 0) > maxCatDmg) {
            maxCatDmg = item.damage || 0;
            mvpName = item.name || mvpName;
          }
        }
      }

      const cardX = mx + 44;
      const cardY = my + 126;
      const cardW = mw - 88;
      const cardH = 78;
      roundRectPath(ctx, cardX, cardY, cardW, cardH, 10);
      ctx.fillStyle = 'rgba(255, 248, 228, 0.45)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.42)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 细腻内部十字分割线，使 2×2 战绩数据一目了然
      ctx.beginPath();
      ctx.moveTo(cardX + cardW * 0.5, cardY + 10);
      ctx.lineTo(cardX + cardW * 0.5, cardY + cardH - 10);
      ctx.moveTo(cardX + 14, cardY + cardH * 0.5);
      ctx.lineTo(cardX + cardW - 14, cardY + cardH * 0.5);
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.18)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      const cells = [
        { k: '通关用时', v: `${timeSec}s` },
        { k: '剩余种子', v: `${scene.settlementResult.remainingSeeds} / 20` },
        { k: '累计歼灭', v: `${totalKills} 只` },
        { k: '全场核心', v: maxCatDmg > 0 ? `${mvpName} (${Math.round(totalDmg / 100) / 10}k)` : '稳固防线' }
      ];
      for (let ci = 0; ci < 4; ci++) {
        const colI = ci % 2;
        const rowI = Math.floor(ci / 2);
        const cx = cardX + 16 + colI * (cardW * 0.5);
        const cy = cardY + 14 + rowI * 36;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = THEME.INK_MID;
        ctx.font = `11px ${CN_FONT}`;
        ctx.fillText(cells[ci].k, cx, cy);
        ctx.fillStyle = THEME.INK_DARK;
        ctx.font = `bold 13px ${CN_FONT}`;
        ctx.fillText(cells[ci].v, cx, cy + 16, cardW * 0.5 - 24);
      }

      const bx = mx + 56;
      const bw = mw - 112;

      if (isWin) {
        let curBtnY = my + 216;
        if (scene.hasNextMap()) {
          this.drawPixelButton(ctx, 'settle_next', bx, curBtnY, bw, 36, i18n.t('btn_next_map'), {
            skin: 'btn_green',
            iconKey: 'play'
          }, () => {
            platform.playSfx('sfx_click');
            scene.startNextMap();
          });
          curBtnY += 44;
        }

        // 无尽深渊挑战入口按钮
        this.drawPixelButton(ctx, 'settle_start_endless', bx, curBtnY, bw, 36, '挑战无尽深渊', {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.startEndlessMode();
        });
        curBtnY += 44;

        this.drawPixelButton(ctx, 'settle_levels', bx, curBtnY, bw, 36, i18n.t('btn_level_select'), {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.enterLevelSelect();
        });
      } else {
        this.drawPixelButton(ctx, 'settle_restart', bx, my + 220, bw, 40, i18n.t('btn_restart'), {
          skin: 'btn_green'
        }, () => {
          platform.playSfx('sfx_click');
          scene.restartLevel();
        });

        this.drawPixelButton(ctx, 'settle_levels', bx, my + 270, bw, 40, i18n.t('btn_level_select'), {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.enterLevelSelect();
        });
      }
    }
    ctx.restore();
  }

  renderSettingsModal(ctx, scene) {
    const curScene = scene || this.scene;
    const inBattle = Boolean(curScene && (curScene.state === 'BATTLE' || curScene.state === 'PAUSED'));
    ctx.fillStyle = 'rgba(10, 16, 12, 0.82)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 396;
    const mh = inBattle ? 386 : 300;
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 16, true);

    ctx.save();
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = 'bold 19px ' + CN_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('森林守卫 · 系统设置', mx + mw * 0.5, my + 44);

    ctx.strokeStyle = 'rgba(110, 74, 38, 0.26)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(mx + 46, my + 62);
    ctx.lineTo(mx + mw - 46, my + 62);
    ctx.stroke();
    ctx.restore();

    const audioCfg = platform.getAudioConfig();
    const bx = mx + 46;
    const bw = mw - 92;
    const btnH = 36;
    const gap = 9;
    let curY = my + 76;

    // 1. 音效开关
    this.drawPixelButton(
      ctx,
      'set_sfx',
      bx,
      curY,
      bw,
      btnH,
      '游戏音效：' + (audioCfg.sfx ? '开启' : '关闭'),
      { skin: 'btn_wood', iconKey: audioCfg.sfx ? 'sfx_on' : 'sfx_off' },
      () => {
        const next = !audioCfg.sfx;
        platform.setAudioConfig({ sfx: next });
        storage.updateSettings({ sfx: next });
        platform.playSfx('sfx_click');
      }
    );
    curY += btnH + gap;

    // 2. 音乐开关
    this.drawPixelButton(
      ctx,
      'set_bgm',
      bx,
      curY,
      bw,
      btnH,
      '背景音乐：' + (audioCfg.bgm ? '开启' : '关闭'),
      { skin: 'btn_wood', iconKey: audioCfg.bgm ? 'bgm_on' : 'bgm_off' },
      () => {
        const next = !audioCfg.bgm;
        platform.setAudioConfig({ bgm: next });
        storage.updateSettings({ bgm: next });
        platform.playSfx('sfx_click');
      }
    );
    curY += btnH + gap;

    // 3. 查阅图鉴
    this.drawPixelButton(
      ctx,
      'set_codex',
      bx,
      curY,
      bw,
      btnH,
      '查阅森林图鉴与秘典',
      { skin: 'btn_wood', iconCat: 24, iconKey: 'guide' },
      () => {
        platform.playSfx('sfx_click');
        this.guideStep = 0;
        this.showGuideModal = true;
        this.showSettingsModal = false;
      }
    );
    curY += btnH + gap;

    if (inBattle) {
      // 4. 战况战报统计
      this.drawPixelButton(
        ctx,
        'set_analytics',
        bx,
        curY,
        bw,
        btnH,
        '查看实时战况与输出统计',
        { skin: 'btn_wood' },
        () => {
          platform.playSfx('sfx_click');
          if (curScene && curScene.combatAnalytics) {
            curScene.combatAnalytics.isOpen = true;
          }
          this.showSettingsModal = false;
        }
      );
      curY += btnH + gap;

      // 5. 重新挑战本关
      this.drawPixelButton(
        ctx,
        'set_restart',
        bx,
        curY,
        bw,
        btnH,
        '重新挑战本关',
        { skin: 'btn_wood' },
        () => {
          platform.playSfx('sfx_click');
          this.showSettingsModal = false;
          if (curScene && typeof curScene.startLevel === 'function') {
            curScene.startLevel(curScene.currentMapId);
          }
        }
      );
      curY += btnH + gap;
    }

    // 6. 返回游戏 / 关闭设置
    this.drawPixelButton(ctx, 'set_close', bx, curY, bw, btnH, inBattle ? '返回战场继续战斗' : '关闭系统设置', {
      skin: 'btn_green',
      iconKey: inBattle ? 'play' : undefined
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
   * 3. 📜 领袖战术心得 (森林守卫前线战术总则与无尽深渊微操)
   */
  /**
   * 【林地秘典 · 全景手绘图鉴与战术殿堂】 (Grand Codex & Bestiary)
   * 采用 AAA 级古典羊皮纸与古铜精雕画框材质，100% 修复属性获取与文字换行崩溃异常，
   * 包含三大核心篇章：
   * 1. 🌲 守林神树卫士 (5大防御塔详细数据、双分支三阶终极进阶形态、灵能觉醒超载全屏大招)
   * 2. 🐛 暗黑虫潮首领 (16大怪物种群全部同屏直选展示、生态威胁、针对弱点与克制战法)
   * 3. 📜 领袖战术心得 (英雄肉搏要义、能量豆超频时机、战场即时撕网破茧、踩踏掘地怪、自爆泄气)
   */
  renderGuideModal(ctx, scene) {
    const curScene = scene || this.scene || (typeof window !== 'undefined' && window.__SPOREGUARD__ && window.__SPOREGUARD__.scene);
    ctx.save();
    // 沉浸式暗林边缘微虚化半透明背景
    ctx.fillStyle = 'rgba(6, 12, 8, 0.88)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 844;
    const mh = 496;
    const mx = (960 - mw) * 0.5; // 58
    const my = (540 - mh) * 0.5; // 22

    // 绘制古典林地 9-Slice 木纹雕花边框与羊皮纸底盘
    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 18, true);

    // 1. 秘典大标题与顶部手绘木牌横幅（居中跨在顶框中央，完全避开两侧铜角）
    this.drawAiFrame(ctx, 'top_bar', mx + 207, my - 4, 430, 36, 0.98);
    drawArtText(ctx, '林地秘典 · 全景手绘图鉴与战术殿堂', mx + mw * 0.5, my + 14, {
      style: 'gold',
      size: 17,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });

    // 右上角关闭按钮 [×]（严密收进羊皮纸安全内角，绝不骑边框或盖住铆钉）
    const cx = mx + mw - 60;
    const cy = my + 39;
    this.drawPixelButton(ctx, 'codex_close_btn', cx, cy, 28, 28, '×', {
      skin: 'btn_wood',
      font: `bold 16px ${CN_FONT}`
    }, () => {
      this.showGuideModal = false;
      storage.markGuideSeen();
      platform.playSfx('sfx_click');
    });

    // 2. 顶部四大篇章分页标签 (Tabs) — 完全放在木框内安全羊皮纸上
    const tabs = [
      { id: 0, label: '🍄 蘑菇守卫 (5/5)' },
      { id: 1, label: '🐛 林区害虫 (17/17)' },
      { id: 2, label: '🌿 远古真菌知识之树' },
      { id: 3, label: '🏆 王国成就 (20)' }
    ];
    const tabY = my + 38;
    const tabW = 176;
    const tabH = 30;
    const tabStartX = mx + 28;

    for (let i = 0; i < tabs.length; i++) {
      const tb = tabs[i];
      const tbx = tabStartX + i * (tabW + 8);
      const isCur = this.codexTab === tb.id;

      ctx.save();
      roundRectPath(ctx, tbx, tabY, tabW, tabH, 8);
      ctx.fillStyle = isCur ? 'rgba(88, 56, 32, 0.98)' : 'rgba(30, 20, 12, 0.72)';
      ctx.fill();
      ctx.strokeStyle = isCur ? '#FFD700' : 'rgba(196, 143, 69, 0.5)';
      ctx.lineWidth = isCur ? 2.0 : 1.2;
      ctx.stroke();

      drawArtText(ctx, tb.label, tbx + tabW * 0.5, tabY + tabH * 0.5, {
        style: isCur ? 'gold' : 'parchment',
        size: 12.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
      ctx.restore();

      this.registerButton(`codex_tab_${tb.id}`, tbx, tabY, tabW, tabH, () => {
        this.codexTab = tb.id;
        platform.playSfx('sfx_click');
      });
    }

    // 3. 篇章具体内容渲染（严密置入安全内容带 y = my+76 .. my+416, x = mx+28 .. mx+mw-28）
    const bodyX = mx + 28;
    const bodyW = mw - 56;
    const bodyY = my + 76;
    const bodyH = mh - 156;

    if (this.codexTab === 0) {
      this.renderCodexGuardiansTab(ctx, bodyX, bodyY, bodyW, bodyH);
    } else if (this.codexTab === 1) {
      this.renderCodexBestiaryTab(ctx, bodyX, bodyY, bodyW, bodyH);
    } else if (this.codexTab === 2) {
      if (curScene && curScene.ancientKnowledgeTree) {
        curScene.ancientKnowledgeTree.renderKnowledgePanel(ctx, bodyX, bodyY, bodyW, bodyH, this);
      } else {
        this.renderCodexTacticsTab(ctx, bodyX, bodyY, bodyW, bodyH);
      }
    } else {
      this.renderCodexAchievementsTab(ctx, bodyX, bodyY, bodyW, bodyH);
    }

    // 4. 底部提示条与核心主交互按钮：完全置入羊皮纸安全底区（bottom = my+mh-34，绝不压到底部木框和角钉！）
    const playBtnW = 242;
    const playBtnH = 36;
    const playBtnX = mx + mw - playBtnW - 30;
    const playBtnY = my + mh - playBtnH - 34;

    this.drawPixelButton(ctx, 'codex_play_btn', playBtnX, playBtnY, playBtnW, playBtnH, '⚔️ 开启保卫战 · 进入战场', {
      skin: 'btn_green',
      font: `bold 13.5px ${CN_FONT}`,
      iconKey: 'play'
    }, () => {
      this.showGuideModal = false;
      storage.markGuideSeen();
      platform.playSfx('sfx_upgrade');
    });

    // 底部左下角提示文案（对齐按钮水平安全区）
    const hintW = playBtnX - (mx + 30) - 14;
    roundRectPath(ctx, mx + 30, playBtnY + 4, hintW, 28, 12);
    ctx.fillStyle = 'rgba(20, 13, 8, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(196, 143, 69, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawArtText(ctx, '💡 点击任意空白区域或右上角 [×] 即可关闭秘典继续游玩', mx + 30 + hintW * 0.5, playBtnY + playBtnH * 0.5, {
      style: 'parchment',
      size: 11.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0
    });

    ctx.restore();
  }

  /**
   * 篇章 1：守林神树卫士图鉴（修复属性获取与换行异常，提高美术排版质感）
   */
  renderCodexGuardiansTab(ctx, x, y, w, h) {
    const towers = [
      { id: 'watch', name: '瞭望菇', role: '防空远程', cost: TOWERS.watch.nodes.base.cost, desc: '射程覆盖广，精准破甲点杀空中飞蛾与高速突袭怪。' },
      { id: 'mist', name: '雾菇', role: '范围减速', cost: TOWERS.mist.nodes.base.cost, desc: '释放大范围孢子迷雾，极寒减速并融毁敌军坚硬护甲。' },
      { id: 'thorn', name: '尖刺菇', role: '破甲割裂', cost: TOWERS.thorn.nodes.base.cost, desc: '刺穿地面造成连续破甲割裂与巨额流血创伤。' },
      { id: 'burst', name: '爆裂菇', role: '高爆重炮', cost: TOWERS.burst.nodes.base.cost, desc: '发射熔岩高爆弹丸，巨额AOE溅射击退密集聚拢虫潮。' },
      { id: 'lumina', name: '灵光菇', role: '神圣丰收', cost: TOWERS.lumina.nodes.base.cost, desc: '持续生产黄金孢子与祝福晨露，增幅邻塔并维系防线经济命脉。' }
    ];

    const curTowerId = this.codexSelectedTower || 'watch';
    const curDef = TOWERS[curTowerId] || TOWERS.watch;
    const leftW = 216;

    // 左侧：5 大蘑菇精致木牌卡片（stride 68px × 4 + 62 = 334 <= bodyH 340，底部不压线）
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
      if (t.id === 'lumina') {
        const lImg = platform.getImage('assets/vfx/prop_lumina_base.png');
        if (lImg && lImg.width) {
          const sc = Math.min(38 / lImg.width, 40 / lImg.height);
          const lw = lImg.width * sc;
          const lh = lImg.height * sc;
          ctx.drawImage(lImg, x + 36 - lw * 0.5, cy + 31 - lh * 0.5, lw, lh);
        }
      } else {
        drawTowerSprite(ctx, t.id, 'lv1', 'idle', demoFrame, x + 30, cy + 31);
      }

      // 名称
      drawArtText(ctx, t.name, x + 66, cy + 21, {
        style: isSel ? 'gold' : 'parchment',
        size: 14,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0
      });

      // 战术定位胶囊标（加宽至 68px 确保汉字舒展）
      roundRectPath(ctx, x + 66, cy + 36, 68, 18, 9);
      ctx.fillStyle = 'rgba(62, 107, 56, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#73D13D';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      drawArtText(ctx, t.role, x + 100, cy + 45, {
        style: 'gold',
        size: 10.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });

      // 造价
      drawArtText(ctx, `${t.cost} 孢子`, x + leftW - 12, cy + 21, {
        style: 'gold',
        size: 11,
        align: 'right',
        baseline: 'middle',
        strokeWidth: 0
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
    if (curTowerId === 'lumina') {
      const lHeadImg = platform.getImage('assets/vfx/prop_lumina_a.png') || platform.getImage('assets/vfx/prop_lumina_base.png');
      if (lHeadImg && lHeadImg.width) {
        const sc = Math.min(54 / lHeadImg.width, 56 / lHeadImg.height);
        const lw = lHeadImg.width * sc;
        const lh = lHeadImg.height * sc;
        ctx.drawImage(lHeadImg, rx + 52 - lw * 0.5, y + 40 - lh * 0.5, lw, lh);
      }
    } else {
      drawTowerSprite(ctx, curTowerId, 'a3', 'idle', topFrame, rx + 44, y + 40);
    }

    drawArtText(ctx, `${tItem.name} · ${tItem.role}`, rx + 92, y + 24, {
      style: 'ink',
      size: 18,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, tItem.desc, rx + 92, y + 42, rw - 110, 18, '#4A3319', `12px ${CN_FONT}`);

    // 属性横向数值条 (实时读取 TOWERS 数据表数值)
    const statsY = y + 74;
    const baseNode = curDef.nodes.base || {};
    const statDmgLabel = curTowerId === 'mist'
      ? { k: '雾伤', v: `${baseNode.dps || 5}/秒` }
      : (curTowerId === 'lumina'
        ? { k: '产孢', v: `+${baseNode.sporeGen || 12}/${baseNode.sporeInterval || 10}s` }
        : { k: '伤害', v: baseNode.damage || 0 });
    const statRoleLabel = curTowerId === 'thorn' ? '穿透' : ((curTowerId === 'mist' || curTowerId === 'lumina') ? '领域' : (curTowerId === 'burst' ? '溅射' : '精准'));
    const statsList = [
      statDmgLabel,
      { k: '射程', v: `${baseNode.range || 0} 格 (${Math.round((baseNode.range || 0) * 32)}px)` },
      { k: '攻速', v: `${(1 / (baseNode.interval || 1)).toFixed(1)} 次/秒` },
      { k: '类型', v: statRoleLabel }
    ];
    const statW = Math.floor((rw - 32 - 24) / 4);
    for (let si = 0; si < statsList.length; si++) {
      const st = statsList[si];
      const sx = rx + 16 + si * (statW + 8);
      roundRectPath(ctx, sx, statsY, statW, 26, 6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.fill();
      ctx.strokeStyle = '#C4A675';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawArtText(ctx, `${st.k}: ${st.v}`, sx + statW * 0.5, statsY + 13, {
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
    const sideCardW = Math.floor((rw - 42) * 0.5);
    const sideCard2X = rx + 16 + sideCardW + 10;
    roundRectPath(ctx, rx + 16, branchY, sideCardW, 82, 8);
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
    this.drawWrappedText(ctx, aDesc, rx + 26, branchY + 32, sideCardW - 20, 18, '#1F3A52', `11px ${CN_FONT}`);

    // 分支 B 卡片 (典雅琥珀金古铜镶边)
    roundRectPath(ctx, sideCard2X, branchY, sideCardW, 82, 8);
    ctx.fillStyle = 'rgba(255, 248, 235, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#FFC069';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    drawArtText(ctx, `【分支B】${bName}`, sideCard2X + 10, branchY + 16, {
      style: 'ink',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, bDesc, sideCard2X + 10, branchY + 32, sideCardW - 20, 18, '#593815', `11px ${CN_FONT}`);

    // 【灵能超载全屏觉醒大招】皇室紫金神圣展台（收紧 4px 内边距确保底部留白充足）
    const ultY = y + 200;
    const ultH = Math.max(114, h - 210);
    roundRectPath(ctx, rx + 16, ultY, rw - 32, ultH, 12);
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
      ctx.drawImage(uSeed, rx + 28, ultY + 14, 44, 48);
    }

    drawArtText(ctx, `灵能觉醒超载大招：${ultInfo.title}`, rx + 84, ultY + 26, {
      style: 'gold',
      size: 15.5,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0.9
    });
    drawArtText(ctx, '击溃高危精英或首领获取觉醒种子，点击战场蘑菇瞬间释放！', rx + 84, ultY + 47, {
      style: 'parchment',
      size: 12,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });

    this.drawWrappedText(ctx, ultInfo.desc, rx + 28, ultY + 71, rw - 56, 19, '#F5EBFF', `bold 12px ${CN_FONT}`);
    ctx.restore();
  }

  /**
   * 篇章 2：暗黑虫潮首领百兽全书图鉴（16大虫怪双列全部直选，无需翻页）
   */
  renderCodexBestiaryTab(ctx, x, y, w, h) {
    const allEnemies = [
      { id: 'beetle', name: '腐蚀幼甲虫', danger: '★☆☆☆☆', speed: '中速', tag: '前锋兵' },
      { id: 'swift', name: '疾风飞蛾', danger: '★★☆☆☆', speed: '极速', tag: '突击兵' },
      { id: 'armored', name: '重装坚盾甲虫', danger: '★★★☆☆', speed: '缓慢', tag: '装甲先锋' },
      { id: 'moth', name: '幻翼魔蛾', danger: '★★★☆☆', speed: '快速', tag: '浮空飞行' },
      { id: 'splitter', name: '母体裂殖虫', danger: '★★★☆☆', speed: '中速', tag: '亡语分裂' },
      { id: 'larva', name: '分裂幼虫', danger: '★★☆☆☆', speed: '极速', tag: '虫海群攻' },
      { id: 'burrower', name: '掘地潜行蝎', danger: '★★★★☆', speed: '较快', tag: '潜地特种' },
      { id: 'volatile_pod', name: '烈性酸蚀蝉', danger: '★★★★☆', speed: '极速', tag: '蓄力自爆' },
      { id: 'weaver', name: '幽林织网蛛', danger: '★★★★☆', speed: '中速', tag: '吐网封塔' },
      { id: 'leaper', name: '疾风飞跃蝗', danger: '★★★★☆', speed: '跳跃', tag: '跃迁突袭' },
      { id: 'shaman', name: '幽林菌巫', danger: '★★★★☆', speed: '缓慢', tag: '群体治疗' },
      { id: 'skeletal_husk', name: '枯骨虫骸', danger: '★★★★☆', speed: '中速', tag: '复生残骸' },
      { id: 'siege_beetle', name: '铁壁攻城巨兜', danger: '★★★★★', speed: '极慢', tag: '正面坚盾' },
      { id: 'boss_m1', name: '腐化蛀王', danger: '★★★★★', speed: '冲锋', tag: '第一关首领' },
      { id: 'boss_m2', name: '剧毒幽蛾后', danger: '★★★★★', speed: '盘旋', tag: '第二关首领' },
      { id: 'boss_m3', name: '万巢裂殖母体', danger: '★★★★★★', speed: '狂暴', tag: '第三关首领' },
      { id: 'boss_m4', name: '蚀日圣甲皇', danger: '★★★★★★', speed: '泰坦', tag: '古殿终皇' }
    ];

    const curEnemyId = this.codexSelectedEnemy || 'beetle';
    // 左侧双列 2x9 布局：9行×37.5px 收进 bodyH=340 内，底部留足呼吸感
    const leftW = 248;
    const colW = 121;
    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      const ci = i % 2;
      const ri = Math.floor(i / 2);
      const ex = x + ci * (colW + 6);
      const ey = y + Math.round(ri * 37.5);
      const isSel = e.id === curEnemyId;

      ctx.save();
      roundRectPath(ctx, ex, ey, colW, 33, 6);
      ctx.fillStyle = isSel ? 'rgba(96, 32, 28, 0.98)' : 'rgba(32, 18, 12, 0.72)';
      ctx.fill();
      ctx.strokeStyle = isSel ? '#FF7875' : 'rgba(196, 143, 69, 0.45)';
      ctx.lineWidth = isSel ? 2.0 : 1.0;
      ctx.stroke();

      drawArtText(ctx, e.name, ex + 30, ey + 16.5, {
        style: isSel ? 'gold' : 'parchment',
        size: 10.5,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0,
        maxWidth: colW - 36
      });
      // 小型怪物头像微章（匹配守卫图鉴视觉密度与手绘辨识度）
      const thumbImg = platform.getImage(`assets/vfx/enemy_${e.id}.png`) ||
        platform.getImage(`assets/enemies/enemy_${e.id}.png`) ||
        platform.getImage(`assets/enemies/boss_${e.id}.png`);
      if (thumbImg && thumbImg.width) {
        const tsc = Math.min(22 / thumbImg.width, 22 / thumbImg.height);
        const tdw = thumbImg.width * tsc;
        const tdh = thumbImg.height * tsc;
        ctx.drawImage(thumbImg, ex + 16 - tdw * 0.5, ey + 16.5 - tdh * 0.5, tdw, tdh);
      } else {
        ctx.save();
        ctx.translate(ex + 16, ey + 16.5);
        const tsc = e.id.startsWith('boss_') ? 0.36 : 0.72;
        ctx.scale(tsc, tsc);
        drawEnemySprite(ctx, e.id, 'walk', 0, 0, 0);
        ctx.restore();
      }
      ctx.restore();

      this.registerButton(`codex_e_${e.id}`, ex, ey, colW, 33, () => {
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
    const eData = ENEMIES[eItem.id] || {};
    const realHp = eData.baseHp || eItem.hp;
    const realArmor = eData.armor !== undefined ? eData.armor : eItem.armor;

    // 怪物立绘与名称
    const enemyImg = platform.getImage(`assets/vfx/enemy_${curEnemyId}.png`) ||
      platform.getImage(`assets/enemies/enemy_${curEnemyId}.png`) ||
      platform.getImage(`assets/enemies/boss_${curEnemyId}.png`);
    if (enemyImg && enemyImg.width) {
      const sc = Math.min(64 / enemyImg.width, 64 / enemyImg.height);
      const dw = enemyImg.width * sc;
      const dh = enemyImg.height * sc;
      ctx.drawImage(enemyImg, rx + 52 - dw * 0.5, y + 48 - dh * 0.5, dw, dh);
    } else {
      const bestiaryFrame = Math.floor(this.uiAnimTime * 5) % 4;
      drawEnemySprite(ctx, curEnemyId, 'walk', bestiaryFrame, rx + 52, y + 48);
    }

    drawArtText(ctx, `${eItem.name} 【${eItem.tag}】`, rx + 98, y + 28, {
      style: 'ink',
      size: 18,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    drawArtText(ctx, `威胁：${eItem.danger} | 移速：${eItem.speed} | 生命：${realHp} | 护甲：${realArmor}`, rx + 98, y + 54, {
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
        counter: '【战法】雾菇的范围减速对其非常有效。先用雾气压低它的速度，再由后排蘑菇集中输出。'
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
        counter: '【战法】预先在其行进后方部署尖刺菇或爆裂菇，在其爆裂瞬间立即以范围伤害歼灭幼虫。'
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
        counter: '【战法】派遣森林英雄在前线坚守阻击，后排全员开启灵能觉醒全力歼灭！'
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
        behavior: '第三关首领【万虫巢母】：拥有三重狂暴阶段，召唤无尽飞虫与分裂幼虫！',
        counter: '【终极战术】英雄持续肉搏阻挡核心，全员使用灵能超载大招连环轰击，灵光菇觉醒万木逢春保持战力！'
      },
      boss_m4: {
        behavior: '第四关古殿霸主【蚀日圣甲皇】：高达18点圣甲护盾，半血召唤重甲护卫并在倒下时裂解出3只重装甲虫！',
        counter: '【圣墟战术】合流祭坛前部署双雾菇削甲配合尖刺乙线叠伤与爆裂灼烧，留好天雷斩杀残血分裂群体！'
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
      style: 'ink',
      color: '#8C1D18',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, counterTactics.behavior, rx + 26, behY + 36, rw - 52, 20, '#431418', `12px ${CN_FONT}`);

    // 克制弱点与领袖战术框（自适配剩余高度，底部留足羊皮纸安全边距）
    const couY = y + 190;
    const couH = Math.max(120, h - 200);
    roundRectPath(ctx, rx + 16, couY, rw - 32, couH, 10);
    ctx.fillStyle = 'rgba(246, 255, 237, 0.90)';
    ctx.fill();
    ctx.strokeStyle = '#B7EB8F';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawArtText(ctx, '【针对弱点与领袖克制战术】', rx + 26, couY + 20, {
      style: 'ink',
      color: '#135200',
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
        title: '一、英雄调遣与近身拦截',
        body: '森林领袖·奥克可以前往地图任意位置驻守。点击英雄后再点击地面，即可下达移动指令。英雄最多拦截 2 只地面敌人；击杀与承伤会积累经验，升级（最高 Lv.5）时恢复全部生命。敌人扎堆时，按 F 释放大招「撼地」可造成范围眩晕。'
      },
      {
        title: '二、灵能觉醒种子',
        body: '击败精英敌人或首领有较高概率掉落灵能觉醒种子。按空格键或点击底部「灵能觉醒」后，再点击场上任意蘑菇，即可释放该蘑菇的专属大招：瞭望菇齐射、尖刺菇破土、爆裂菇陨落、灵光菇增益。'
      },
      {
        title: '三、战场即时操作',
        body: '1. 蛛网封印：连续点击被封印的蘑菇 3 次可将其解救，解救后短时间内攻速提升。\n2. 掘地敌人：点击其潜行的土堆，可将其踩出地面。\n3. 自爆蝉：它变红蓄力时快速点击可使其泄气，避免蘑菇被炸毁。'
      },
      {
        title: '四、无尽模式与生死阵型',
        body: '通关后解锁无尽模式，敌人的属性会逐波提升。林地坑位珍贵且固定，守卫一旦扎根便坚守到底，生命耗尽阵亡后方会空出位置。请合理安排前线坦度与后排火力，选中蘑菇按 P 键切换索敌偏好！'
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
    const paragraphs = String(text).split('\n');
    const noLineStart = '，。！？、；：）】》」』·,.!?;:)]}%';
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let curY = y;
    for (let p = 0; p < paragraphs.length; p++) {
      const para = paragraphs[p];
      let line = '';
      for (let i = 0; i < para.length; i++) {
        const ch = para[i];
        const testLine = line + ch;
        if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
          if (noLineStart.indexOf(ch) !== -1) {
            if (ctx.measureText(testLine).width <= maxWidth + 8) {
              line = testLine;
              continue;
            }
            if (line.length > 1) {
              const carry = line.slice(-1);
              ctx.fillText(line.slice(0, -1), x, curY);
              line = carry + ch;
              curY += lineHeight;
              continue;
            }
          }
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
      curY += lineHeight;
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
    roundRectPath(ctx, x + 12, y + 8, w - 24, 30, 8);
    ctx.fillStyle = 'rgba(59, 39, 24, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawArtText(ctx, '🏆 战术成就殿堂：已达成 ' + unlockedCount + ' / ' + totalCount + ' 项 · 获得荣誉星级：⭐ ' + totalStars + ' / 30', x + (w * 0.5), y + 23, {
      style: 'gold',
      size: 13,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });

    // 20 项成就以 2 列 × 10 行网格自适应展示（严密适配羊皮纸安全高度）
    const cardW = (w - 32) * 0.5;
    const cardH = 26;
    const startY = y + 44;

    for (let i = 0; i < allList.length; i++) {
      const a = allList[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = x + 12 + col * (cardW + 8);
      const cy = startY + row * (cardH + 2.5);

      roundRectPath(ctx, cx, cy, cardW, cardH, 6);
      ctx.fillStyle = a.unlocked ? 'rgba(255, 250, 235, 0.96)' : 'rgba(64, 46, 32, 0.72)';
      ctx.fill();
      ctx.strokeStyle = a.unlocked ? '#FFD700' : 'rgba(140, 94, 42, 0.45)';
      ctx.lineWidth = a.unlocked ? 1.4 : 1.0;
      ctx.stroke();

      // 统一徽章底托圆框（消除同列双表情混杂）
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx + 15, cy + 13, 9.5, 0, Math.PI * 2);
      ctx.fillStyle = a.unlocked ? 'rgba(212, 136, 6, 0.22)' : 'rgba(20, 14, 10, 0.65)';
      ctx.fill();
      ctx.strokeStyle = a.unlocked ? '#D48806' : 'rgba(196, 143, 69, 0.40)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(a.icon, cx + 15, cy + 13);
      ctx.restore();

      // 标题
      drawArtText(ctx, a.title, cx + 30, cy + 8.5, {
        style: a.unlocked ? 'ink' : 'gold',
        size: 10.5,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0
      });

      // 描述简述
      ctx.fillStyle = a.unlocked ? '#5E3E26' : '#F2E5C6';
      ctx.font = '9.8px ' + CN_FONT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const shortDesc = a.desc.length > 24 ? a.desc.slice(0, 23) + '...' : a.desc;
      ctx.fillText(shortDesc, cx + 30, cy + 19.5, cardW - 66);

      // 右侧星级与状态
      drawArtText(ctx, a.unlocked ? ('+' + a.rewardStars + '⭐') : '🔒', cx + cardW - 18, cy + 13, {
        style: a.unlocked ? 'ink' : 'parchment',
        color: a.unlocked ? '#237804' : undefined,
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
    }

    ctx.restore();
  }

  // =========================================================================
  // 【植物大战僵尸经典一体化顶栏 Seed Bank】(全高度饱满卡牌、大字体清晰可读)
  // =========================================================================
  renderPvZTopSeedBank(ctx, scene) {
    const bankX = 10;
    const bankY = 476;

    // 1. 金孢阳光存储槽 (严格内嵌于 filigree 框内安全深棕暗底 x=21..93, y=486..526)
    const sporeW = 94;
    const sporeH = 60;
    const sporeX = bankX;
    const sporeY = bankY;

    ctx.save();
    const seedPlaqueImg = platform.getImage('assets/ui/frames/hud_seed_plaque.png');
    if (seedPlaqueImg && seedPlaqueImg.width) {
      ctx.drawImage(seedPlaqueImg, sporeX - 2, sporeY, sporeW + 4, sporeH);
      platform.recordDrawCall(1);
    } else {
      roundRectPath(ctx, sporeX, sporeY, sporeW, sporeH, 12);
      ctx.fillStyle = 'rgba(28, 18, 10, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(230, 187, 96, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // 顶部生命守护值（严密置于框内顶部安全带）
    const seeds = scene.economy.seeds;
    drawArtText(ctx, '❤️ ' + seeds, sporeX + sporeW * 0.5, sporeY + 17.5, {
      style: seeds <= 5 ? 'crimson' : 'parchment',
      size: 11,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0
    });

    // 阳光金孢图标 + 四位数金黄计数（严密置于框内中下暗木区）
    const sporeImg = platform.getImage('assets/vfx/item_golden_spore.png') || platform.getImage('assets/ui/icons/icon_spore.png');
    if (sporeImg && sporeImg.width) {
      ctx.drawImage(sporeImg, sporeX + 13, sporeY + 28, 20, 20);
    } else {
      drawUiIcon(ctx, 16, 'spore', sporeX + 13, sporeY + 28, 20);
    }

    const spores = scene.economy.spores;
    drawArtText(ctx, String(spores), sporeX + 58, sporeY + 38.5, {
      style: 'gold',
      size: 15,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.7,
      maxWidth: 44
    });
    ctx.restore();

    // 2. 5大蘑菇植物卡牌栏 (PvZ 经典纵向卡槽: 54x56px，严密契合上下分格)
    const towerOrder = ['watch', 'mist', 'thorn', 'burst', 'lumina'];
    const cardW = 54;
    const cardH = 56;
    const startX = sporeX + sporeW + 7;

    for (let i = 0; i < towerOrder.length; i++) {
      const tId = towerOrder[i];
      const def = TOWERS[tId];
      if (!def) continue;

      const cx = startX + i * (cardW + 5);
      const cy = bankY + 2;
      const cost = def.nodes ? def.nodes.base.cost : 100;
      const affordable = scene.economy.spores >= cost;
      const isSelected = scene.selectedBuildTowerId === tId;

      ctx.save();
      if (!this.drawAiFrame(ctx, 'tower_card', cx, cy, cardW, cardH, isSelected ? 1.0 : (affordable ? 0.96 : 0.62))) {
        roundRectPath(ctx, cx, cy, cardW, cardH, 7);
        ctx.fillStyle = isSelected
          ? 'rgba(60, 44, 22, 0.98)'
          : (affordable ? 'rgba(32, 22, 14, 0.95)' : 'rgba(22, 16, 12, 0.88)');
        ctx.fill();
        ctx.strokeStyle = isSelected
          ? '#FFD700'
          : (affordable ? 'rgba(198, 143, 69, 0.80)' : 'rgba(95, 70, 45, 0.45)');
        ctx.lineWidth = isSelected ? 2.2 : 1.2;
        ctx.stroke();
      }

      // 手绘蘑菇大原画 (严格嵌在卡牌上层羊皮纸内框 cy+5 .. cy+36)
      const cardArtImg = platform.getImage('assets/ui/cards/card_' + tId + '.png');
      if (cardArtImg && cardArtImg.width) {
        ctx.save();
        if (!affordable) ctx.globalAlpha = 0.48;
        ctx.drawImage(cardArtImg, cx + 6, cy + 5, cardW - 12, 31);
        ctx.restore();
      } else {
        drawTowerSprite(ctx, tId, 'base', 'idle', 0, cx + 11, cy + 21);
      }

      // 底部标价数字（严格居中于下层绿底铭牌槽中心 cy+45.5）
      drawArtText(ctx, String(cost), cx + cardW * 0.5, cy + 45.5, {
        style: affordable ? 'gold' : 'crimson',
        size: 11.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.7
      });

      // 快捷键角标 [1..5]（收进羊皮纸框内左上角 cx+5, cy+5，不再压住外框）
      roundRectPath(ctx, cx + 5, cy + 5, 11, 11, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.76)';
      ctx.fill();
      drawArtText(ctx, String(i + 1), cx + 10.5, cy + 10.5, {
        style: 'gold',
        size: 9,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });

      if (isSelected) {
        roundRectPath(ctx, cx + 1, cy + 1, cardW - 2, cardH - 2, 7);
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 2.0;
        ctx.stroke();
      }

      ctx.restore();

      if (this.isPointHovered(cx, cy, cardW, cardH)) {
        this.bottomHoverTip = {
          x: cx + cardW * 0.5,
          y: 446,
          text: `[${i + 1}] ${i18n.t(def.nameKey)} (${cost}孢) · ${i18n.t(def.roleKey)} · 点选地基或拖拽建造`
        };
      }

      this.registerButton('slot_' + tId, cx, cy, cardW, cardH, () => {
        scene.selectBuildTowerType(tId);
        platform.playSfx('sfx_click');
      }, { towerId: tId });
    }

    // 3. 远古灵能觉醒槽 (68x56px 严密对齐卡槽内区)
    const awkX = startX + towerOrder.length * (cardW + 5) + 5;
    const awkY = bankY + 2;
    const awkW = 68;
    const awkH = cardH;
    const isAwk = Boolean(scene.activeAwakeningTargeting);
    if (this.isPointHovered(awkX, awkY, awkW, awkH)) {
      this.bottomHoverTip = {
        x: awkX + awkW * 0.5,
        y: 446,
        text: `[空格] 灵能觉醒种子 (余 ${scene.awakeningSeeds || 0} 颗) · 激活后点击守卫释放全屏大招`
      };
    }

    ctx.save();
    if (!this.drawAiFrame(ctx, isAwk ? 'btn_green' : 'tower_card', awkX, awkY, awkW, awkH, 0.98)) {
      roundRectPath(ctx, awkX, awkY, awkW, awkH, 7);
      ctx.fillStyle = isAwk ? 'rgba(38, 92, 18, 0.95)' : 'rgba(24, 20, 14, 0.94)';
      ctx.fill();
      ctx.strokeStyle = isAwk ? '#D3F261' : 'rgba(115, 209, 61, 0.65)';
      ctx.lineWidth = isAwk ? 2.2 : 1.2;
      ctx.stroke();
    } else if (isAwk) {
      roundRectPath(ctx, awkX + 1, awkY + 1, awkW - 2, awkH - 2, 7);
      ctx.strokeStyle = '#D3F261';
      ctx.lineWidth = 2.0;
      ctx.stroke();
    }

    const seedImg = platform.getImage('assets/vfx/item_awakening_seed.png') || platform.getImage('assets/ui/icons/icon_seed.png');
    if (seedImg && seedImg.width) {
      ctx.drawImage(seedImg, awkX + (awkW - 26) * 0.5, awkY + 6, 26, 26);
    } else {
      drawArtText(ctx, '🍃', awkX + awkW * 0.5, awkY + 19, {
        style: 'emerald',
        size: 16,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
    }

    const awkCount = scene.awakeningSeeds || 0;
    drawArtText(ctx, '觉醒 ×' + awkCount, awkX + awkW * 0.5, awkY + 45.5, {
      style: awkCount > 0 ? 'gold' : 'dim',
      size: 10.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0
    });
    ctx.restore();

    this.registerButton('pvz_awakening', awkX, awkY, awkW, awkH, () => {
      if (typeof scene.toggleAwakening === 'function') {
        scene.toggleAwakening();
      }
    });
  }

  // =========================================================================
  // 【底部波次推进旗舰槽 PvZ Wave Flag】(所有情报与进度严格内置框内，不再悬浮突出草地)
  // =========================================================================
  renderPvZTopWaveBar(ctx, scene) {
    const waveMgr = scene.waveManager;
    const barX = 492;
    const barY = 478;
    const barW = 200;
    const barH = 56; // 与植物卡槽齐平 (478..534)

    if (waveMgr.isPrepPhase()) {
      const threatStr = typeof waveMgr.getUpcomingThreatSummaryText === 'function'
        ? waveMgr.getUpcomingThreatSummaryText()
        : `第 ${waveMgr.currentWaveIndex + 1} 波准备中`;
      const isHighAlert = threatStr.includes('首领') || threatStr.includes('侧翼') || threatStr.includes('防空');
      const earlyBonus = Math.min(
        CONFIG.ECONOMY.EARLY_CALL_MAX,
        Math.floor(waveMgr.prepTimerSec * CONFIG.ECONOMY.EARLY_CALL_PER_SEC)
      );

      const hovered = this.isPointHovered(barX, barY, barW, barH);
      const drawY = hovered ? barY - 1 : barY;
      ctx.save();
      if (!this.drawAiFrame(ctx, 'btn_green', barX, drawY, barW, barH, 1.0)) {
        roundRectPath(ctx, barX, drawY, barW, barH, 9);
        ctx.fillStyle = THEME.ENAMEL_GREEN;
        ctx.fill();
        ctx.strokeStyle = THEME.BRONZE_BRIGHT;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (hovered) {
        roundRectPath(ctx, barX + 2, drawY + 2, barW - 4, barH - 4, 7);
        ctx.strokeStyle = 'rgba(255, 238, 170, 0.80)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // 上行来袭情报内嵌于绿钮内部上槽
      roundRectPath(ctx, barX + 16, drawY + 7, barW - 32, 16, 6);
      ctx.fillStyle = isHighAlert ? 'rgba(92, 22, 16, 0.88)' : 'rgba(12, 34, 16, 0.68)';
      ctx.fill();
      drawArtText(ctx, threatStr, barX + barW * 0.5, drawY + 15, {
        style: isHighAlert ? 'gold' : 'parchment',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0,
        maxWidth: barW - 40
      });

      // 下行提前迎战主文案
      drawArtText(ctx, '▶ 提前迎战 (+' + earlyBonus + '孢)', barX + barW * 0.5, drawY + 38.5, {
        style: 'emerald',
        size: 13.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.7,
        maxWidth: barW - 24
      });
      ctx.restore();

      this.registerButton('pvz_call_wave', barX, barY, barW, barH, () => {
        scene.callWaveEarly();
      });
      return;
    }

    ctx.save();
    const currentW = waveMgr.currentWaveIndex;
    const totalW = waveMgr.totalWaves;
    const isEndless = Boolean(scene.isEndlessMode);
    const subProg = typeof waveMgr.getWaveSubProgress === 'function' ? waveMgr.getWaveSubProgress(scene.enemyManager) : 0.5;
    const ratio = isEndless ? Math.max(0.06, subProg) : Math.max(0, Math.min(1.0, ((currentW - 1) + subProg) / Math.max(1, totalW)));

    // 外围使用叶片安全的 3-Slice 橡木牌匾框
    if (!this.drawAiFrame(ctx, 'top_bar', barX, barY, barW, barH, 0.98)) {
      roundRectPath(ctx, barX, barY, barW, barH, 9);
      ctx.fillStyle = 'rgba(28, 18, 10, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(198, 143, 69, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // 内部深嵌进度槽（实时随当波清怪推进平滑充能；无尽模式呈现紫色深渊流光槽）
    const slotX = barX + 18;
    const slotY = barY + 13;
    const slotW = barW - 36;
    const slotH = 30;
    roundRectPath(ctx, slotX, slotY, slotW, slotH, 6);
    ctx.fillStyle = 'rgba(16, 11, 7, 0.88)';
    ctx.fill();
    ctx.strokeStyle = isEndless ? 'rgba(179, 127, 235, 0.65)' : 'rgba(198, 143, 69, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (ratio > 0) {
      const fillW = Math.max(8, Math.round((slotW - 4) * ratio));
      roundRectPath(ctx, slotX + 2, slotY + 2, fillW, slotH - 4, 4);
      const barGrad = ctx.createLinearGradient(slotX, slotY, slotX, slotY + slotH);
      if (isEndless) {
        barGrad.addColorStop(0, '#B37FEB');
        barGrad.addColorStop(1, '#531DAB');
      } else if (currentW >= totalW) {
        barGrad.addColorStop(0, '#FF7875');
        barGrad.addColorStop(1, '#A8071A');
      } else {
        barGrad.addColorStop(0, '#95DE64');
        barGrad.addColorStop(1, '#237804');
      }
      ctx.fillStyle = barGrad;
      ctx.fill();
    }

    const waveTitle = isEndless ? `🔥 无尽第 ${currentW} 波` : `第 ${currentW} / ${totalW} 波`;
    drawArtText(ctx, waveTitle, barX + barW * 0.5, barY + barH * 0.5, {
      style: isEndless ? 'parchment' : (currentW >= totalW ? 'crimson' : 'gold'),
      size: 13.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.7
    });
    ctx.restore();
  }

  // =========================================================================
  // 【底栏右侧功能控制键 PvZ Top Right Menu】(垂直与波次槽对齐居中，清晰易点)
  // =========================================================================
  renderPvZTopRightMenu(ctx, scene) {
    const btnH = 48;
    const btnY = 482;

    this.drawPixelButton(
      ctx,
      'pvz_speed',
      700,
      btnY,
      68,
      btnH,
      scene.speedMultiplier + '×速',
      {
        skin: scene.speedMultiplier > 1 ? 'btn_blue' : 'btn_wood',
        font: 'bold 14.5px ' + CN_FONT
      },
      () => {
        scene.cycleSpeed();
      }
    );

    this.drawPixelButton(
      ctx,
      'pvz_pause',
      774,
      btnY,
      68,
      btnH,
      '⏸ 暂停',
      {
        skin: 'btn_wood',
        font: 'bold 14.5px ' + CN_FONT
      },
      () => {
        scene.pauseGame();
      }
    );

    this.drawPixelButton(
      ctx,
      'pvz_menu',
      848,
      btnY,
      92,
      btnH,
      '⚙️ 菜单',
      {
        skin: 'btn_wood',
        font: 'bold 14.5px ' + CN_FONT
      },
      () => {
        platform.playSfx('sfx_click');
        this.showSettingsModal = true;
      }
    );
  }

  // =========================================================================
  // 【左下角极简圆盘英雄徽章与神术法球】(全部控件 100% 坐落在暗橡木底座安全内框 [25..166, 394..452] 中！)
  // =========================================================================
  renderPvZBottomLeftHeroAndSpells(ctx, scene) {
    const hero = scene.hero;
    if (!hero) return;

    // 统一质感底托：X: 4..188（左齐且完全避让地基 (1,12)），Y: 374..472（不触底栏 476）
    ctx.save();
    const heroPlaqueImg = platform.getImage('assets/ui/frames/hud_hero_plaque.png');
    if (heroPlaqueImg && heroPlaqueImg.width) {
      ctx.drawImage(heroPlaqueImg, 4, 374, 184, 98);
      platform.recordDrawCall(1);
    } else {
      roundRectPath(ctx, 6, 376, 180, 94, 10);
      const panelGrad = ctx.createLinearGradient(6, 376, 6, 470);
      panelGrad.addColorStop(0, 'rgba(28, 21, 14, 0.90)');
      panelGrad.addColorStop(1, 'rgba(16, 12, 8, 0.94)');
      ctx.fillStyle = panelGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(198, 143, 69, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();

    // 1. 左侧英雄头像盘与等级微章（严格居中于左安全列 [25..59, 396..450]）
    const hx = 42;
    const hy = 417;
    const hr = 14;

    // 1.1 上排右侧双按钮（姿态 [Z] + 大招 [F]）：y = 395..412，严格落于顶框内边下方且热区 100% 吻合
    const stanceMeta = {
      guardian: { label: '🛡️守卫', skin: 'btn_blue', bg: 'rgba(18, 42, 68, 0.92)', bd: '#69C0FF', col: '#BAE7FF' },
      aggressive: { label: '⚔️狂暴', skin: 'btn_red', bg: 'rgba(68, 22, 22, 0.92)', bd: '#FF7875', col: '#FFD8BF' },
      scout: { label: '🏹游侠', skin: 'btn_green', bg: 'rgba(20, 56, 26, 0.92)', bd: '#73D13D', col: '#D9F7BE' }
    }[hero.stance || 'guardian'] || { label: '🛡️守卫', skin: 'btn_blue', bg: 'rgba(18, 42, 68, 0.92)', bd: '#69C0FF', col: '#BAE7FF' };

    const stX = 61;
    const stY = 395;
    const stW = 49;
    const stH = 17;
    ctx.save();
    if (!this.drawAiFrame(ctx, stanceMeta.skin, stX, stY, stW, stH, 0.98)) {
      roundRectPath(ctx, stX, stY, stW, stH, 8);
      ctx.fillStyle = stanceMeta.bg;
      ctx.fill();
      ctx.strokeStyle = stanceMeta.bd;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    drawArtText(ctx, stanceMeta.label, stX + stW * 0.5, stY + stH * 0.5, {
      style: 'parchment',
      color: stanceMeta.col,
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0
    });
    ctx.restore();

    if (this.isPointHovered(stX, stY, stW, stH)) {
      this.bottomHoverTip = {
        x: 110,
        y: 344,
        text: '[Z] 切换英雄姿态：守卫(高甲回春) · 狂暴(高攻速伤) · 游侠(飞刺游击)'
      };
    }
    this.registerButton('pvz_hero_stance', stX, stY, stW, stH, () => {
      hero.cycleStance(scene.fx);
      if (hero.stanceSwitchedCount >= 3 && scene.achievements) {
        scene.achievements.unlock('tactical_stances', scene.fx);
      }
    });

    // 1.2 英雄大招 [F]（右侧紧邻姿态，绝不撞右边木框与角钉）
    const ultCd = hero.skillCooldown || 0;
    const ultReady = ultCd <= 0 && hero.state !== 'dead';
    const ultX = 113;
    const ultY = 395;
    const ultW = 53;
    const ultH = 17;
    ctx.save();
    if (!this.drawAiFrame(ctx, ultReady ? 'btn_green' : 'btn_wood', ultX, ultY, ultW, ultH, ultReady ? 1.0 : 0.78)) {
      roundRectPath(ctx, ultX, ultY, ultW, ultH, 8);
      ctx.fillStyle = ultReady ? 'rgba(62, 42, 10, 0.94)' : 'rgba(24, 18, 12, 0.88)';
      ctx.fill();
      ctx.strokeStyle = ultReady ? '#FFD700' : 'rgba(140, 110, 70, 0.45)';
      ctx.lineWidth = ultReady ? 1.4 : 1.0;
      ctx.stroke();
    }
    drawArtText(ctx, ultReady ? '裂地[F]' : `奥义 ${Math.ceil(ultCd)}s`, ultX + ultW * 0.5, ultY + ultH * 0.5, {
      style: ultReady ? 'gold' : 'dim',
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0,
      maxWidth: ultW - 6
    });
    ctx.restore();

    if (this.isPointHovered(ultX, ultY, ultW, ultH)) {
      this.bottomHoverTip = {
        x: 118,
        y: 344,
        text: ultReady ? '[F] 施放英雄奥义「大地裂地斩」· 范围重击并眩晕周围虫潮' : `英雄奥义冷却中 (${Math.ceil(ultCd)}s)`
      };
    }
    this.registerButton('pvz_hero_ult', ultX, ultY, ultW, ultH, () => {
      if (ultReady && typeof hero.castUltimateSkill === 'function') {
        hero.castUltimateSkill(scene.enemyManager, scene.fx);
        platform.playSfx('sfx_thunder');
      } else {
        this.showToast(hero.state === 'dead' ? '英雄正在复活中' : `大招冷却中: ${Math.ceil(ultCd)}s`);
      }
    });

    // 1.3 英雄圆形头像盘（外圈显示生命与琥珀经验进度环；阵亡显示复活读秒扫盘）
    const isDead = hero.state === 'dead';
    const xpRatio = hero.level >= hero.maxLevel ? 1.0 : Math.max(0, Math.min(1.0, (hero.xp || 0) / Math.max(1, hero.xpToNext || 100)));
    ctx.save();
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fillStyle = isDead ? 'rgba(16, 12, 12, 0.96)' : 'rgba(20, 14, 8, 0.94)';
    ctx.fill();
    ctx.strokeStyle = (scene.activeHeroRally || hero.isSelected) ? '#FFD700' : '#C68F45';
    ctx.lineWidth = (scene.activeHeroRally || hero.isSelected) ? 2.2 : 1.5;
    ctx.stroke();

    const hpRatio = Math.max(0, Math.min(1.0, hero.hp / (hero.maxHp || 1)));
    if (hpRatio > 0 && !isDead) {
      ctx.beginPath();
      ctx.arc(hx, hy, hr + 1.8, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * hpRatio);
      ctx.strokeStyle = hpRatio > 0.35 ? '#52C41A' : '#FF4D4F';
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    // 外圈琥珀金色 XP 经验进展弧线
    if (xpRatio > 0) {
      ctx.beginPath();
      ctx.arc(hx, hy, hr + 4.3, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * xpRatio);
      ctx.strokeStyle = hero.level >= hero.maxLevel ? '#FFD700' : 'rgba(255, 214, 102, 0.82)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    if (heroImg && heroImg.width) {
      if (isDead) ctx.globalAlpha = 0.38;
      ctx.drawImage(heroImg, hx - 13, hy - 13, 26, 26);
      ctx.globalAlpha = 1.0;
    } else {
      drawArtText(ctx, '🌲', hx, hy, { style: 'emerald', size: 15, align: 'center', baseline: 'middle' });
    }

    if (isDead) {
      const revRatio = Math.max(0, Math.min(1.0, (hero.reviveTimer || 0) / Math.max(1, hero.reviveTimeTotal || 14)));
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.arc(hx, hy, hr, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * revRatio);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();
      drawArtText(ctx, `${Math.ceil(hero.reviveTimer || 0)}s`, hx, hy, {
        style: 'crimson',
        size: 10.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
    } else if (ultReady) {
      const uPulse = 1.0 + Math.sin(this.uiAnimTime * 8) * 0.08;
      ctx.strokeStyle = 'rgba(255, 215, 0, ' + (0.55 + Math.sin(this.uiAnimTime * 8) * 0.25) + ')';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(hx, hy, (hr + 5.8) * uPulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    roundRectPath(ctx, hx - 13, 437.5, 26, 11, 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fill();
    drawArtText(ctx, isDead ? '复活' : ('Lv.' + (hero.level || 1)), hx, 443, {
      style: isDead ? 'crimson' : 'gold',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0
    });
    ctx.restore();

    if (this.isPointHovered(hx - hr, hy - hr, hr * 2, hr * 2)) {
      const xpNeed = hero.level >= hero.maxLevel ? '已满阶' : `还差 ${Math.max(0, Math.ceil((hero.xpToNext || 100) - (hero.xp || 0)))} 经验进阶`;
      this.bottomHoverTip = {
        x: 112,
        y: 344,
        text: isDead ? `橡木守护者阵亡中 (${Math.ceil(hero.reviveTimer || 0)}s 后重生)` : `橡木守护者 Lv.${hero.level} (${Math.round(hero.hp)}/${hero.maxHp} 生命 · ${xpNeed}) · 点击后点地调遣`
      };
    }
    this.registerButton('pvz_hero_badge', hx - hr, hy - hr, hr * 2, hr * 2, () => {
      scene.activeHeroRally = !scene.activeHeroRally;
      hero.isSelected = scene.activeHeroRally;
      platform.playSfx('sfx_click');
      if (scene.activeHeroRally && scene.fx) {
        scene.fx.spawnFloatingText(hero.x, hero.y - 26, '请点击道路/地面调遣英雄!', '#FFE58F', 1.1);
      }
    });

    // 2. 四大自然战术法球 ([Q]甘霖45, [W]天雷75, [E]丰饶0, [R]集结0) — 严密收进右下安全区 [62..164, 417..450]
    const spellList = [
      { id: 'rain', name: '自然甘霖', key: 'Q', cost: 45, tip: '全场友军恢复生命并攻速翻倍 6s', icon: 'assets/ui/icons/spell_rain.png', vfx: 'assets/vfx/relic_clover.png' },
      { id: 'shock', name: '雷霆震爆', key: 'W', cost: 75, tip: '区域落雷轰击并眩晕敌军 3s', icon: 'assets/ui/icons/spell_shock.png', vfx: 'assets/vfx/relic_lightning.png' },
      { id: 'harvest', name: '大地丰收', key: 'E', cost: 0, tip: '立刻凝结 +120 黄金孢子', icon: 'assets/ui/icons/spell_harvest.png', vfx: 'assets/vfx/relic_amber.png' },
      { id: 'rally', name: '菇精卫集结', key: 'R', cost: 0, tip: '点击巡逻道路派遣双哨菇精卫近战拦截', icon: 'assets/vfx/prop_rally_flag.png', vfx: 'assets/vfx/prop_rally_flag.png' }
    ];

    const orbR = 10.5;
    const orbStartX = 74;
    const orbStride = 26;

    for (let sIdx = 0; sIdx < spellList.length; sIdx++) {
      const spItem = spellList[sIdx];
      const sp = scene.spells ? scene.spells[spItem.id] : null;
      const spCd = (sp && sp.timer) || 0;
      const spMaxCd = (sp && sp.cd) || 15;
      const canCast = spCd <= 0 && scene.economy.spores >= spItem.cost;
      const ox = orbStartX + sIdx * orbStride;
      const oy = 428;

      ctx.save();
      ctx.beginPath();
      ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
      ctx.fillStyle = canCast ? 'rgba(20, 28, 22, 0.94)' : 'rgba(16, 14, 12, 0.88)';
      ctx.fill();
      ctx.strokeStyle = (spItem.id === 'rally' && scene.activeRallyTargeting)
        ? '#FFD700'
        : (canCast ? '#73D13D' : 'rgba(150, 120, 80, 0.45)');
      ctx.lineWidth = (spItem.id === 'rally' && scene.activeRallyTargeting) ? 2.0 : 1.2;
      ctx.stroke();

      const spImg = platform.getImage(spItem.icon) || platform.getImage(spItem.vfx);
      if (spImg && spImg.width) {
        if (!canCast) ctx.globalAlpha = 0.45;
        ctx.drawImage(spImg, ox - 8.5, oy - 8.5, 17, 17);
      } else {
        drawArtText(ctx, spItem.name[0], ox, oy - 0.5, {
          style: canCast ? 'emerald' : 'dim',
          size: 11,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 0
        });
      }

      roundRectPath(ctx, ox - 11, 438.5, 22, 10, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.fill();
      drawArtText(ctx, spItem.cost > 0 ? (spItem.cost + '') : spItem.key, ox, 443.5, {
        style: canCast ? 'gold' : 'dim',
        size: 8.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });

      if (spCd > 0) {
        const sweepRatio = spCd / Math.max(1, spMaxCd);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.arc(ox, oy, orbR, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * sweepRatio);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fill();
      }

      ctx.restore();

      if (this.isPointHovered(ox - orbR, oy - orbR, orbR * 2, orbR * 2)) {
        const costTag = spItem.cost > 0 ? `(${spItem.cost}孢)` : '(免费)';
        this.bottomHoverTip = {
          x: 118,
          y: 344,
          text: spCd > 0 ? `[${spItem.key}] ${spItem.name} · 冷却中 (${Math.ceil(spCd)}s)` : `[${spItem.key}] ${spItem.name} ${costTag} · ${spItem.tip}`
        };
      }
      this.registerButton('pvz_spell_' + spItem.id, ox - orbR, oy - orbR, orbR * 2, orbR * 2, () => {
        if (canCast) {
          scene.triggerSpell(spItem.id);
          platform.playSfx('sfx_click');
        } else {
          this.showToast(spCd > 0 ? `冷却中: ${Math.ceil(spCd)}s` : `孢子不足 (需 ${spItem.cost})`);
        }
      });
    }
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
const ElementalReactionSystem = require('../game/elementalReactions');
const HeroSkillSystem = require('../game/heroSkills');
const CombatAnalyticsSystem = require('../game/combatAnalytics');
const RelicArsenalSystem = require('../game/relicArsenal');
const { TacticalTargetingSystem } = require('../game/tacticalTargeting');
const CombatJuiceEngine = require('../game/combatJuice');
const { MushroomMasterySystem } = require('../game/mushroomMastery');
const HeroTranscendence = require('../game/heroTranscendence');
const ElementalComboEngine = require('../game/elementalCombos');
const GuardianSynergies = require('../game/guardianSynergies');
const CombatVfxEngine = require('../game/combatVfxEngine');
const TacticalFeats = require('../game/tacticalFeats');
const { AncientKnowledgeTree } = require('../game/ancientKnowledgeTree');
const { TacticalTargetingAI } = require('../game/tacticalTargetingAI');
const CombatScreenJuice = require('../game/combatScreenJuice');
const BossOverdriveEngine = require('../game/bossOverdriveEngine');
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
    this.flankAlertTimer = 0;
    this.crisisSlowMoTriggered = false;
    this.contraptions = new ForestContraptions();
    this.elderRootTriggered = false;
    this.elderRootActiveTimer = 0;
    this.comboKillCount = 0;
    this.comboKillTimer = 0;
    this.relicManager = new RelicDropManager();
    this.activeRallyTargeting = false;
    this.waveManager = new WaveManager('map1');
    this.fx = new FxSystem();
    this.fx.scene = this;
    this.ui = new UiManager();

    this.speedMultiplier = 1;
    this.hero = new ForestHero(this.map);
    this.awakeningSeeds = 2;
    this.weather = new WeatherManager();
    this.weather.initForMap(this.currentMapId);
    this.achievements = achievements;
    this.elementalReactions = new ElementalReactionSystem();
    this.heroSkills = new HeroSkillSystem(this.hero);
    this.combatAnalytics = new CombatAnalyticsSystem();
    this.relicArsenal = new RelicArsenalSystem();
    this.combatJuice = new CombatJuiceEngine();
    this.mushroomMastery = new MushroomMasterySystem();
    this.heroTranscendence = new HeroTranscendence(this.hero);
    this.elementalCombos = new ElementalComboEngine();
    this.guardianSynergies = new GuardianSynergies();
    this.combatVfx = new CombatVfxEngine();
    this.tacticalFeats = new TacticalFeats();
    this.ancientKnowledgeTree = new AncientKnowledgeTree();
    this.tacticalTargeting = new TacticalTargetingAI();
    this.combatScreenJuice = new CombatScreenJuice();
    this.bossOverdriveEngine = new BossOverdriveEngine();
    this.ancientKnowledgeTree.applyToCombatScene(this);
    if (this.hero) this.hero.transcendence = this.heroTranscendence;
    this.bulletManager.elementalCombos = this.elementalCombos;
    this.bulletManager.combatVfx = this.combatVfx;
    this.enemyManager.combatVfx = this.combatVfx;
    this.enemyManager.tacticalFeats = this.tacticalFeats;
    this.towerManager.guardianSynergies = this.guardianSynergies;
    if (this.hero) this.hero.transcendence = this.heroTranscendence;
    this.towerManager.scene = this;
    this.towerManager.tacticalTargeting = this.tacticalTargeting;
    this.towerManager.mushroomMastery = this.mushroomMastery;
    this.bulletManager.combatJuice = this.combatJuice;
    this.bulletManager.mushroomMastery = this.mushroomMastery;
    this.bulletManager.elementalCombos = this.elementalCombos;
    this.enemyManager.combatJuice = this.combatJuice;
    this.enemyManager.scene = this;
    this.bulletManager.scene = this;
    this.earlyCallsCount = 0;
    this.activeHeroRally = false;
    this.activeAwakeningTargeting = false; // 1 | 2 | 3
    this.selectedBuildTowerId = 'watch';
    this.selectedTile = { col: 5, row: 3 };
    this.hoverTile = { col: -1, row: -1 };
    this.logicalCombatTimeSec = 0;
    this.animTimeSec = 0;

    this.settlementResult = {
      victory: false,
      stars: 0,
      clearTimeSec: 0,
      remainingSeeds: 0
    };

    // 指挥官四大主动战术魔法技能 (Q: 生命甘霖, W: 雷霆震爆, E: 大地丰收, R: 菇精卫集结)
    this.spells = {
      rain: { id: 'rain', name: '自然甘霖', cost: 45, cd: 25, timer: 0, key: 'Q', radius: 120 },
      shock: { id: 'shock', name: '雷霆震爆', cost: 75, cd: 35, timer: 0, key: 'W', radius: 90 },
      harvest: { id: 'harvest', name: '大地丰收', cost: 0, cd: 50, timer: 0, key: 'E', gain: 100 },
      rally: { id: 'rally', name: '菇精卫集结', cost: 0, cd: 3, timer: 0, key: 'R' }
    };
    this.isEndlessMode = false;
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
    platform.playBgm('bgm_title');
  }

  enterLevelSelect() {
    this.state = 'LEVEL_SELECT';
    this.speedMultiplier = 1;
    platform.playBgm('bgm_title');
  }

  startLevel(mapId) {
    this.isEndlessMode = false;
    const mData = MAPS[mapId] || MAPS.map1;
    this.currentMapId = mData.id;

    // 异步确保当前地图分包图集已加载
    platform.loadMapSubpackage(mData.subpackage, mData.atlasPath);

    this.map = new GameMap(this.currentMapId);
    this.map.scene = this;
    this.economy.reset(this.currentMapId);
    this.enemyManager.clear();
    this.bulletManager.clear();
    this.towerManager.clear();
    this.sporelingPatrol.initDefaultRally(this.map);
    this.sporeDropManager.reset();
    this.flankAlertTimer = 0;
    this.crisisSlowMoTriggered = false;
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
    this.weather.initForMap(this.currentMapId);
    this.achievements = achievements;
    this.elementalReactions = new ElementalReactionSystem();
    this.heroSkills = new HeroSkillSystem(this.hero);
    this.combatAnalytics = new CombatAnalyticsSystem();
    this.relicArsenal = new RelicArsenalSystem();
    this.tacticalTargeting = new TacticalTargetingAI();
    this.combatJuice = new CombatJuiceEngine();
    this.mushroomMastery = new MushroomMasterySystem();
    this.heroTranscendence = new HeroTranscendence(this.hero);
    this.elementalCombos = new ElementalComboEngine();
    this.guardianSynergies = new GuardianSynergies();
    this.combatVfx = new CombatVfxEngine();
    this.tacticalFeats = new TacticalFeats();
    if (this.hero) this.hero.transcendence = this.heroTranscendence;
    this.bulletManager.elementalCombos = this.elementalCombos;
    this.bulletManager.combatVfx = this.combatVfx;
    this.enemyManager.combatVfx = this.combatVfx;
    this.enemyManager.tacticalFeats = this.tacticalFeats;
    this.towerManager.guardianSynergies = this.guardianSynergies;
    this.towerManager.scene = this;
    this.towerManager.tacticalTargeting = this.tacticalTargeting;
    this.towerManager.mushroomMastery = this.mushroomMastery;
    this.bulletManager.combatJuice = this.combatJuice;
    this.bulletManager.mushroomMastery = this.mushroomMastery;
    this.enemyManager.combatJuice = this.combatJuice;
    this.enemyManager.scene = this;
    this.bulletManager.scene = this;
    if (this.ancientKnowledgeTree) this.ancientKnowledgeTree.applyToCombatScene(this);
    if (this.bossOverdriveEngine) this.bossOverdriveEngine.reset();
    if (this.combatScreenJuice) this.combatScreenJuice.reset();
    this.earlyCallsCount = 0;
    this.activeHeroRally = false;
    this.activeAwakeningTargeting = false;
    this.selectedBuildTowerId = 'watch';
    for (let k in this.spells) {
      this.spells[k].timer = 0;
    }
    this.activeSpellCasting = null;
    this.selectedBuildTowerId = null;
    this.selectedTile = { col: -1, row: -1 };
    this.hoverTile = { col: -1, row: -1 };
    if (this.ui) {
      this.ui.inspectorOpen = false;
      this.ui.hoveredRadialTowerId = null;
    }
    input.setGridCursor(this.selectedTile.col, this.selectedTile.row, false);

    this.logicalCombatTimeSec = 0;
    this.state = 'BATTLE';

    // 首次进入关卡不阻断玩家，弹出轻量化横幅指引，保证零阻塞极致丝滑
    const save = storage.getSave();
    if (!save.guideSeen) {
      storage.markGuideSeen();
      this.fx.showBanner('欢迎来到孢子前线', '#BAE7FF', '轻触底部卡牌种植，右下角「菜单」查看图鉴秘典', 3.8);
    }

    if (this.weather && this.weather.currentWeather === 'night') {
      platform.playBgm('bgm_night');
    } else {
      platform.playBgm('bgm_battle');
    }
  }

  /**
   * 开启无尽深渊试炼模式
   */
  startEndlessMode(mapId = null) {
    const isSameMapVictory = this.state === 'SETTLEMENT' && this.settlementResult && this.settlementResult.victory && (!mapId || mapId === this.currentMapId);
    const needFreshStart = !isSameMapVictory;
    if (needFreshStart) {
      this.startLevel(mapId || this.currentMapId || 'map1');
      if (this.economy) {
        this.economy.spores += 160;
      }
      if (this.waveManager) {
        this.waveManager.currentWaveIndex = this.waveManager.totalWaves;
      }
    }
    this.isEndlessMode = true;
    this.state = 'BATTLE';
    if (this.waveManager) {
      this.waveManager.startEndlessMode(this.economy, this.fx);
    }
    this.fx.showBanner('🔥 无尽深渊降临！', '#FF4D4F', '无穷无尽的暗黑虫潮正从两翼涌来，坚持越久纪录越高！', 2.5);
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
    this.waveManager.callNextWaveEarly(this.economy, this.fx, this);
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
    if (built) {
      if (this.ui.notifyTowerBuilt) {
        this.ui.notifyTowerBuilt(this.selectedBuildTowerId);
      }
      this.selectedBuildTowerId = null;
      this.selectedTile = { col: -1, row: -1 };
      this.ui.inspectorOpen = false;
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

  triggerFlankAlert() {
    this.flankAlertTimer = 4.0;
    platform.playSfx('sfx_horn');
  }

  toggleAwakening() {
    if (this.state !== 'BATTLE') return;
    if (this.awakeningSeeds > 0) {
      this.activeAwakeningTargeting = !this.activeAwakeningTargeting;
      platform.playSfx('sfx_upgrade');
      if (this.activeAwakeningTargeting) {
        if (this.ui) this.ui.showToast('🍃 请点击场上任意蘑菇释放觉醒大招!');
      }
    } else {
      this.ui.showToast('觉醒古种不足 (击败精英/破除障碍物获取)');
      platform.playSfx('sfx_hurt');
    }
  }

  onVictory() {
    if (this.state === 'SETTLEMENT') return;
    this.state = 'SETTLEMENT';
    this.activeAwakeningTargeting = false;
    this.selectedBuildTowerId = null;
    if (this.bossOverdriveEngine) this.bossOverdriveEngine.clear();
    if (this.ui) this.ui.inspectorOpen = false;
    if (this.bulletManager) {
      if (this.bulletManager.hazardPool) this.bulletManager.hazardPool.clear();
      if (this.bulletManager.bulletPool) this.bulletManager.bulletPool.clear();
    }
    if (this.enemyManager && this.enemyManager.flyingWebs) {
      this.enemyManager.flyingWebs.length = 0;
    }
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
    this.activeAwakeningTargeting = false;
    this.selectedBuildTowerId = null;
    if (this.bossOverdriveEngine) this.bossOverdriveEngine.clear();
    if (this.ui) this.ui.inspectorOpen = false;
    if (this.bulletManager) {
      if (this.bulletManager.hazardPool) this.bulletManager.hazardPool.clear();
      if (this.bulletManager.bulletPool) this.bulletManager.bulletPool.clear();
    }
    if (this.enemyManager && this.enemyManager.flyingWebs) {
      this.enemyManager.flyingWebs.length = 0;
    }
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
    if (spellId === 'rally') {
      this.activeRallyTargeting = !this.activeRallyTargeting;
      if (this.activeRallyTargeting) {
        this.activeSpellCasting = null;
        this.activeHeroRally = false;
        platform.playSfx('sfx_click');
        if (this.ui) this.ui.showToast('请在巡逻道路上点击设防集合点!');
      }
      return;
    }
    if (spellId === 'harvest') {
      sp.timer = sp.cd;
      this.economy.spores += sp.gain;
      this.fx.showBanner('大地丰收！+' + sp.gain + ' 黄金孢子', '#FFE58F', '全场真菌共鸣喷涌', 1.5);
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
          t.isWebbed = false;
          this.towerManager.healTower(t, 999, true, this.fx);
          affected++;
        }
      }
      this.fx.spawnRing(mx, my, sp.radius, '#52C41A', 0.55, true);
      this.fx.spawnParticles(mx, my, 28, ['#52C41A', '#B7EB8F', '#95DE64'], 40, 140, 0.35, 0.7, 4);
      this.fx.showBanner('生命甘霖！防线狂暴', '#52C41A', '滋养并净化 ' + affected + ' 座防御塔，攻速翻倍6秒', 1.5);
      platform.playSfx('sfx_upgrade');
    } else if (spellId === 'shock') {
      let enemiesHit = 0;
      const alive = this.enemyManager.getAliveEnemies();
      for (let i = 0; i < alive.length; i++) {
        const e = alive[i];
        if (Math.hypot(e.x - mx, e.y - my) <= sp.radius) {
          const shockBase = 350;
          const finalShockDmg = e.isFlying ? Math.round(shockBase * 1.5) : shockBase;
          e.hp -= finalShockDmg;
          e.residualSlowTimer = 3.5;
          e.residualSlowValue = 0.95;
          enemiesHit++;
          if (e.hp <= 0) {
            this.enemyManager.handleEnemyDeath(e, finalShockDmg, this.logicalCombatTimeSec, this.map, this.economy, this.fx);
          }
        }
      }
      this.fx.triggerShake(8, 350);
      this.fx.spawnRing(mx, my, sp.radius, '#FFE58F', 0.45, false);
      this.fx.spawnParticles(mx, my, 32, ['#FFE58F', '#73D13D', '#FFFFFF', '#40A9FF'], 60, 200, 0.3, 0.65, 5);
      this.fx.showBanner('雷霆震爆！群怪麻痹', '#FFE58F', '轰击 ' + enemiesHit + ' 名敌人（对空特攻），定身3.5秒', 1.5);
      platform.playSfx('sfx_boom');
    }

    this.activeSpellCasting = null;
    return true;
  }

  processInputActions() {
    const actions = input.consumeActions();
    for (let i = 0; i < actions.length; i++) {
      try {
        const act = actions[i];

      if (act.type === 'pointer_move') {
        this.ui.handlePointerMove(act.x, act.y, this);
      } else if (act.type === 'pointer_down') {
        if (this.activeSpellCasting) {
          this.castActiveSpell(act.x, act.y);
          continue;
        }

        // 0.5 如果处于菇精卫集结防线布防模式，点击道路任意点设定集结旗帜
        if (this.activeRallyTargeting && this.sporelingPatrol) {
          const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
          const mx = (act.x - mv.OFFSET_X) / mv.SCALE;
          const my = (act.y - mv.OFFSET_Y) / mv.SCALE;
          const col = Math.floor(mx / TILE_SIZE);
          const row = Math.floor(my / TILE_SIZE);
          if (this.map.inBounds(col, row) && this.map.isPath(col, row)) {
            this.sporelingPatrol.setRallyPoint(col, row, this.map, this.fx, false);
            platform.playSfx('sfx_place');
            this.activeRallyTargeting = false;
            continue;
          } else {
            this.fx.spawnFloatingText(act.x, act.y - 14, '只能在行进道路上设防集结!', '#FF7875', 1.0);
            this.activeRallyTargeting = false;
            continue;
          }
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

          // 战场晨露金孢、精英战利品与森林自然机关拾取
          if (this.sporeDropManager && this.sporeDropManager.handlePointerDown(mx, my, this.economy, this.fx)) {
            continue;
          }
          if (this.relicManager && this.relicManager.checkClick(mx, my, this)) {
            continue;
          }
          if (this.contraptions && this.contraptions.handlePointerDown(mx, my, this)) {
            continue;
          }
          if (this.enemyManager && this.enemyManager.handleClickOnEnemy(mx, my, this.fx)) {
            continue;
          }
          if (mx >= 0 && mx < CONFIG.LAYOUT.MAP.WIDTH && my >= 0 && my < CONFIG.LAYOUT.MAP.HEIGHT) {
            // 备战期间点击出怪传送门入口光环，直接触发提前迎敌号角并获额外孢子奖励 (Kingdom Rush 经典波次召唤)
            if (this.waveManager && this.waveManager.isPrepPhase() && this.map && this.map.mapData) {
              const s1 = this.map.mapData.spawnTile;
              let portalX = 0;
              let portalY = 0;
              let hitSpawn = false;
              if (s1) {
                const sx1 = (s1[0] + 0.5) * TILE_SIZE;
                const sy1 = (s1[1] + 0.5) * TILE_SIZE;
                if (Math.hypot(mx - sx1, my - sy1) <= 26) {
                  hitSpawn = true;
                  portalX = sx1;
                  portalY = sy1;
                }
              }
              const s2 = this.map.mapData.spawnTile2;
              if (!hitSpawn && s2) {
                const nextWave = this.waveManager.waveList && this.waveManager.waveList[this.waveManager.currentWaveIndex - 1];
                const hasFlank = nextWave && nextWave.groups && nextWave.groups.some((g) => g && g.routeIndex === 1);
                const sx2 = (s2[0] + 0.5) * TILE_SIZE;
                const sy2 = (s2[1] + 0.5) * TILE_SIZE;
                if (hasFlank && Math.hypot(mx - sx2, my - sy2) <= 26) {
                  hitSpawn = true;
                  portalX = sx2;
                  portalY = sy2;
                }
              }
              if (hitSpawn) {
                const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
                this.callWaveEarly();
                if (this.fx) {
                  this.fx.spawnParticles(portalX, portalY, 16, ['#FFD700', '#FFE58F', '#FFFFFF'], 35, 95, 0.25, 0.55, 3.5);
                  if (typeof this.fx.spawnShockwave === 'function') {
                    this.fx.spawnShockwave(portalX, portalY, 44, '#FFD700');
                  }
                  if (typeof this.fx.spawnHomingMotes === 'function') {
                    this.fx.spawnHomingMotes(mv.OFFSET_X + portalX * mv.SCALE, mv.OFFSET_Y + portalY * mv.SCALE, 5, '#FFD700');
                  }
                }
                continue;
              }
            }
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
                this.towerManager.rescueWeb(existingTower, this.fx, this.economy);
                continue;
              }

              let targetCol = col;
              let targetRow = row;
              // 手机端智能微距吸附：如果在草地边缘差了几个像素，自动吸附到最近的有效建造格
              if (!existingTower && !this.map.canBuildAt(targetCol, targetRow) && this.selectedBuildTowerId) {
                const subX = (mx / TILE_SIZE) - col;
                const subY = (my / TILE_SIZE) - row;
                const offsets = [];
                if (subX < 0.35) offsets.push([-1, 0]);
                if (subX > 0.65) offsets.push([1, 0]);
                if (subY < 0.35) offsets.push([0, -1]);
                if (subY > 0.65) offsets.push([0, 1]);
                for (const [ox, oy] of offsets) {
                  if (this.map.inBounds(col + ox, row + oy) && this.map.canBuildAt(col + ox, row + oy)) {
                    targetCol = col + ox;
                    targetRow = row + oy;
                    break;
                  }
                }
              }

              const canBuild = this.map.canBuildAt(targetCol, targetRow);
              if (existingTower) {
                // 点击已种植的我方守卫：展开其专属地面轻柔范围法阵与升级面板
                this.selectedTile.col = targetCol;
                this.selectedTile.row = targetRow;
                this.selectedTileAgeSec = 0;
                this.selectedBuildTowerId = null; // 切换至检视模式，取消待建造卡牌
                this.ui.inspectorOpen = true;
                input.setGridCursor(col, row, false);
                platform.playSfx('sfx_click');
              } else if (canBuild) {
                if (this.selectedBuildTowerId) {
                  this.selectedTile.col = targetCol;
                  this.selectedTile.row = targetRow;
                  this.selectedTileAgeSec = 0;
                  input.setGridCursor(col, row, false);
                  const built = this.tryBuildOnSelectedTile();
                  if (built) {
                    this.ui.inspectorOpen = false;
                  }
                } else {
                  // 点击空雕刻石座：原地展开 Kingdom Rush 5向圆形建造轮盘
                  this.selectedTile.col = targetCol;
                  this.selectedTile.row = targetRow;
                  this.selectedTileAgeSec = 0;
                  this.ui.inspectorOpen = true;
                  this.ui.showTowerDetailBoard = false;
                  this.ui.hoveredRadialTowerId = null;
                  input.setGridCursor(col, row, false);
                  platform.playSfx('sfx_click');
                }
              } else {
                const clickedObs = this.map.getObstacleAt(targetCol, targetRow);
                if (clickedObs) {
                  // 点击障碍物：切换集火锁定标记 (Carrot Fantasy 经典集火模式)
                  if (this.targetedObstacle === clickedObs) {
                    this.targetedObstacle.isTargeted = false;
                    this.targetedObstacle = null;
                    this.ui.showToast('已取消集火锁定');
                    platform.playSfx('sfx_click');
                  } else {
                    if (this.targetedObstacle) {
                      this.targetedObstacle.isTargeted = false;
                    }
                    this.targetedObstacle = clickedObs;
                    clickedObs.isTargeted = true;
                    this.ui.showToast('🎯 已锁定【' + clickedObs.name + '】！防线守卫将优先清除障碍！');
                    if (this.fx) {
                      this.fx.spawnFloatingText(clickedObs.x, clickedObs.y - 24, '🎯 锁定集火!', '#FF4D4F', 1.25);
                      if (typeof this.fx.spawnRing === 'function') {
                        this.fx.spawnRing(clickedObs.x, clickedObs.y, 28, '#FF4D4F', 0.45, false);
                      }
                    }
                    platform.playSfx('sfx_upgrade');
                    if (typeof wx !== 'undefined' && wx.vibrateShort) {
                      try { wx.vibrateShort({ type: 'medium' }); } catch (e) {}
                    }
                  }
                  this.ui.inspectorOpen = false;
                  this.selectedTile.col = -1;
                  this.selectedTile.row = -1;
                  this.selectedBuildTowerId = null;
                } else {
                  // 点击道路或空白无效区域：收起范围展示与面板，战场自然褪去
                  this.ui.inspectorOpen = false;
                  this.ui.showTowerDetailBoard = false;
                  this.selectedTile.col = -1;
                  this.selectedTile.row = -1;
                  this.selectedBuildTowerId = null;
                }
              }
            }
          } else {
            this.ui.inspectorOpen = false;
            this.ui.showTowerDetailBoard = false;
            this.selectedTile.col = -1;
            this.selectedTile.row = -1;
            this.selectedBuildTowerId = null;
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
        if (this.state === 'LEVEL_SELECT') {
          this.enterTitle();
        }
      } else if (act.type === 'cycle_priority') {
        if (this.state === 'BATTLE') {
          const tower = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
          if (tower) {
            const prio = this.towerManager.cyclePriority(tower);
            if (prio && this.fx) {
              this.fx.spawnFloatingText(tower.x, tower.y - 26, '索敌：' + i18n.t('prio_' + prio), '#FFE58F', 1.0);
            }
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
      } else if (act.type === 'hero_battlecry') {
        if (this.state === 'BATTLE' && this.heroTranscendence) {
          this.heroTranscendence.castBattlecry(this.sporelingPatrol, this.fx);
        }
      } else if (act.type === 'hero_leyline') {
        if (this.state === 'BATTLE' && this.heroTranscendence) {
          this.heroTranscendence.castLeylineSurge(this.towerManager, this.fx);
        }
      } else if (act.type === 'toggle_awakening') {
        if (this.state === 'BATTLE') {
          if (this.awakeningSeeds > 0) {
            this.activeAwakeningTargeting = !this.activeAwakeningTargeting;
            platform.playSfx('sfx_click');
            if (this.activeAwakeningTargeting && this.ui) {
              this.ui.showToast('请点击场上的蘑菇触发灵能觉醒超载!');
            }
          } else if (this.ui) {
            this.ui.showToast('灵能觉醒种子不足(击败精英敌人获取)!');
          }
        }
      } else if (act.type === 'cycle_speed') {
        if (this.state === 'BATTLE') {
          this.cycleSpeed();
        }
      } else if (act.type === 'toggle_zen_mode') {
        if (this.state === 'BATTLE') {
          this.ui.toggleZenMode(this.fx);
        }
      } else if (act.type === 'toggle_mastery') {
        if (this.mushroomMastery) {
          this.mushroomMastery.togglePanel();
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
      } catch (actionErr) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('[Action Processing Safe-Catch]:', actionErr);
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
      },
      this
    );

    // 1.5 战利品与菇精卫小队更新
    this.relicManager.update(dt, this);
    // 最后一波胜利彻底杜绝卡顿结算保底防护
    if (this.state === 'BATTLE' && this.waveManager) {
      if (this.waveManager.currentWaveIndex >= this.waveManager.totalWaves && this.waveManager.phase !== 'prep') {
        const alive = this.enemyManager.getAliveEnemies();
        const activeCount = this.enemyManager.getActiveWaveEnemyCount();
        let allGroupsDone = true;
        for (let i = 0; i < this.waveManager.activeGroups.length; i++) {
          const g = this.waveManager.activeGroups[i];
          if (g.type && typeof g.count === 'number' && g.spawned < g.count) {
            allGroupsDone = false;
            break;
          }
        }
        if (allGroupsDone && alive.length === 0 && activeCount === 0) {
          this.onVictory();
        }
      }
    }
    this.contraptions.update(dt, this);
    if (this.weather) {
      this.weather.update(dt, this);
    }
    if (this.elementalReactions) {
      this.elementalReactions.update(dt, this);
    }
    if (this.heroSkills) {
      this.heroSkills.update(dt, this);
    }
    if (this.heroTranscendence) {
      this.heroTranscendence.update(dt, this.enemyManager, this.sporelingPatrol, this.towerManager, this.fx);
    }
    if (this.elementalCombos) {
      this.elementalCombos.update(dt, this.enemyManager, this.fx);
    }
    if (this.guardianSynergies) {
      this.guardianSynergies.update(dt, this);
    }
    if (this.combatVfx) {
      this.combatVfx.update(dt);
    }
    if (this.tacticalFeats) {
      this.tacticalFeats.update(dt, this);
    }
    if (this.combatAnalytics) {
      this.combatAnalytics.update(dt);
    }
    if (this.relicArsenal) {
      this.relicArsenal.update(dt, this);
    }
    if (this.achievements) {
      this.achievements.update(dt, this.fx);
    }
    if (this.ancientKnowledgeTree) this.ancientKnowledgeTree.update(dt, this);
    if (this.tacticalTargeting) this.tacticalTargeting.update(dt);
    if (this.combatScreenJuice) this.combatScreenJuice.update(dt, this.state === 'BATTLE');
    if (this.bossOverdriveEngine) this.bossOverdriveEngine.update(dt, this);
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
    this.sporeDropManager.update(dt, this.map, this.economy, this.fx, this);
    // 绝境缓时救急机制：当敌人逼近生命核心 (<= 68px) 或守护种子 <= 4 时触发一次电影级子弹时间
    if (!this.crisisSlowMoTriggered && this.map && this.map.mapData) {
      const wTile = this.map.mapData.warehouseTile || [19, 12];
      const wx = (wTile[0] + 0.5) * TILE_SIZE;
      const wy = (wTile[1] + 0.5) * TILE_SIZE;
      const alive = this.enemyManager.getAliveEnemies();
      let danger = false;
      for (let i = 0; i < alive.length; i++) {
        const em = alive[i];
        if (em.state !== 'death' && Math.hypot(em.x - wx, em.y - wy) <= 68) {
          danger = true;
          break;
        }
      }
      if (danger || this.economy.seeds <= 4) {
        this.crisisSlowMoTriggered = true;
        this.fx.triggerScreenShake(4.5, 0.35);
        this.fx.showBanner('⚠️ 绝境破釜！圣树受袭，速出技能！', '#FF4D4F', '全场时光缓流 1.5s', 2.0);
        this.fx.fxSlowMoTimerSec = 1.5;
        this.fx.fxTimeScale = 0.38;
        if (this.speedMultiplier > 1) {
          this.speedMultiplier = 1;
        }
        platform.playSfx('sfx_bomb');
      }
    }

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
    if (this.combatScreenJuice) this.combatScreenJuice.onKill(enemy, this);

    platform.playMusicalScale(this.comboKillCount - 1);
    if (this.achievements) {
      this.achievements.unlock('first_blood', this.fx);
      if (enemy && (enemy.routeIndex === 1 || enemy.type === 'burrower')) {
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
    const jx = this.combatScreenJuice ? this.combatScreenJuice.shakeOffsetX : 0;
    const jy = this.combatScreenJuice ? this.combatScreenJuice.shakeOffsetY : 0;
    ctx.translate(mv.OFFSET_X + this.fx.shakeOffsetX + jx, mv.OFFSET_Y + this.fx.shakeOffsetY + jy);
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
    if (this.state === 'BATTLE' && !this.ui.inspectorOpen && !this.activeSpellCasting && !this.activeRallyTargeting && this.ui.hoverX >= 0) {
      const hmX = (this.ui.hoverX - mv.OFFSET_X) / mv.SCALE;
      const hmY = (this.ui.hoverY - mv.OFFSET_Y) / mv.SCALE;
      this.contraptions.renderHoverTooltip(ctx, hmX, hmY, this.animTimeSec);
    }

    // 绘制圣树古根逆袭：贴合地表的翠玉金藤脉冲光环与自然曲根
    if (this.elderRootActiveTimer > 0 && this.map && this.map.mapData) {
      const wTile = this.map.mapData.warehouseTile || [19, 12];
      const wx = (wTile[0] + 0.5) * TILE_SIZE;
      const wy = (wTile[1] + 0.5) * TILE_SIZE + 8;
      const alpha = Math.min(1.0, this.elderRootActiveTimer / 0.85);
      const spread = 1.0 - alpha * 0.35;
      ctx.save();
      ctx.translate(wx, wy);
      ctx.scale(1.0, 0.62);
      ctx.globalAlpha = alpha * 0.78;
      const rGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 58 * spread);
      rGrad.addColorStop(0, 'rgba(115, 209, 61, 0.36)');
      rGrad.addColorStop(0.65, 'rgba(255, 215, 0, 0.22)');
      rGrad.addColorStop(1, 'rgba(82, 196, 26, 0)');
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 58 * spread, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineCap = 'round';
      for (let rIdx = 0; rIdx < 7; rIdx++) {
        const ang = (rIdx / 7) * Math.PI * 2 + 0.37;
        const swirl = Math.sin(this.animTimeSec * 9 + rIdx * 1.4) * 0.24;
        const len = (40 + (rIdx % 2) * 14) * spread;
        const ex = Math.cos(ang + swirl) * len;
        const ey = Math.sin(ang + swirl) * len;
        const cx = Math.cos(ang - 0.38) * len * 0.52;
        const cy = Math.sin(ang - 0.38) * len * 0.52;
        ctx.strokeStyle = 'rgba(42, 74, 34, 0.72)';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(cx, cy, ex, ey);
        ctx.stroke();

        ctx.strokeStyle = rIdx % 2 === 0 ? 'rgba(149, 222, 100, 0.85)' : 'rgba(255, 229, 143, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#FFF1B8';
        ctx.beginPath();
        ctx.arc(ex, ey, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 在地图坐标系内绘制柔和攻击范围与选中高亮（不抢戏、位于UI层之下）
    this.ui.renderMapPlacementPreview(ctx, this);
    this.bulletManager.renderHazards(ctx, this.animTimeSec);
    this.towerManager.render(ctx);
    this.enemyManager.render(ctx);
    this.bulletManager.renderBullets(ctx);
    if (this.heroSkills) {
      this.heroSkills.renderMapVfx(ctx);
    }
    if (this.elementalCombos) {
      this.elementalCombos.render(ctx);
    }
    if (this.guardianSynergies) {
      this.guardianSynergies.render(ctx);
    }
    if (this.combatVfx) {
      this.combatVfx.renderCombatVfx(ctx);
    }
    if (this.tacticalFeats) {
      this.tacticalFeats.render(ctx);
    }
    if (this.heroTranscendence) {
      this.heroTranscendence.render(ctx);
    }
    if (this.elementalReactions) {
      this.elementalReactions.render(ctx, this.animTimeSec);
    }
    this.fx.renderMapFx(ctx);
    this.sporeDropManager.render(ctx);
    if (this.combatJuice) {
      this.combatJuice.renderFx(ctx);
      this.combatJuice.renderStreakWidget(ctx);
    }
    // 以下元素使用地图坐标，必须在地图变换内绘制
    if (this.bossOverdriveEngine) {
      this.bossOverdriveEngine.renderBossAura(ctx);
    }
    if (this.state === 'BATTLE' && this.selectedTile && this.selectedTile.col >= 0 && this.tacticalTargeting) {
      const hlTower = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
      if (hlTower && hlTower.typeId !== 'lumina' && !hlTower.isWebbed) {
        const hlTarget = this.towerManager.selectTarget(hlTower, this.enemyManager.getAliveEnemies(), this.map);
        this.tacticalTargeting.renderTargetHighlight(ctx, hlTower, hlTarget);
      }
    }

    ctx.restore();

    // 天候生态全屏环境滤镜、雨滴与雾气
    if (this.weather) {
      this.weather.renderWeatherOverlay(ctx);
    }
    if (!this.ui.uiZenMode && this.state === 'BATTLE') {
      if (this.bossOverdriveEngine) {
        this.bossOverdriveEngine.renderBossHud(ctx);
      }
      if (this.combatScreenJuice) {
        this.combatScreenJuice.renderJuiceOverlays(ctx);
      }
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
    this.accumulator = 0;

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
      try {
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
      } catch (err) {
        // 核心防假死：捕获任何单帧未预期异常，并在控制台告警，绝不中断 requestAnimationFrame 循环！
        if (typeof console !== 'undefined' && console.error) {
          console.error('[Sporeguard SafeLoop Recovery]:', err);
        }
      } finally {
        if (this.running) {
          raf(tick);
        }
      }
    };

    raf(tick);
  }

  /**
   * 单帧推进：时间累加器半固定步长更新，彻底杜绝丢帧减速与顿挫
   */
  stepFrame(realDt) {
    this.scene.updateRealTime(realDt);

    if (this.scene.state === 'BATTLE' && !this.scene.ui.showGuideModal && !this.scene.ui.showSettingsModal) {
      const speed = this.scene.speedMultiplier || 1;
      // 顶级性能调优：1x速每帧精准执行 1 次逻辑步，2x速执行 2 次，3x速执行 3 次
      // 彻底消除时间累加器浮动导致的周期性微卡顿 (Micro-stutter) 与螺旋延迟
      const targetSteps = Math.min(3, Math.max(1, Math.round(speed)));
      for (let s = 0; s < targetSteps; s++) {
        this.scene.fixedStep(FIXED_DT);
      }
      this.accumulator = 0;
    } else {
      this.accumulator = 0;
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

  let g = typeof GameGlobal !== 'undefined' ? GameGlobal : (typeof globalThis !== 'undefined' ? globalThis : window);
  g.__SPOREGUARD__ = {
    scene,
    loop,
    platform,
    input
  };

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
    'assets/vfx/prop_dew.png',
    'assets/vfx/prop_pitcher.png',
    'assets/vfx/prop_pitcher_eating.png',
    'assets/vfx/prop_thunder_stump.png',
    'assets/vfx/relic_amber.png',
    'assets/vfx/relic_coin.png',
    'assets/vfx/relic_shield.png',
    'assets/vfx/relic_lightning.png',
    'assets/vfx/relic_clover.png',
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
    'assets/vfx/vfx_leap_wind.png',
    'assets/vfx/hero_oak.png',
    'assets/vfx/vfx_hero_slash.png',
    'assets/vfx/vfx_hit_spark.png',
    'assets/vfx/proj_watch_arrow.png',
    'assets/vfx/proj_burst_shell.png',
    'assets/vfx/item_golden_spore.png',
    'assets/vfx/item_awakening_seed.png',
    'assets/vfx/secondary_spawner_burrow.png',
    'assets/vfx/card_lumina.png',
'assets/ui/cards/card_watch.png',
    'assets/ui/cards/card_mist.png',
    'assets/ui/cards/card_thorn.png',
    'assets/ui/cards/card_burst.png',
    'assets/ui/cards/card_lumina.png',
    'assets/vfx/prop_rally_flag.png',
    'assets/vfx/sporeling_guard.png',
    'assets/vfx/proj_spider_silk_ball.png',
    'assets/vfx/icon_elite_crest.png',
    'assets/vfx/enemy_weaver.png',
    'assets/vfx/obs_ancient_stump.png',
    'assets/vfx/obs_crystal_mush.png',
    'assets/vfx/obs_moss_rock.png',
    'assets/vfx/obs_moss_stump.png',
    'assets/ui/icons/spell_rain.png',
    'assets/ui/icons/spell_shock.png',
    'assets/ui/icons/spell_harvest.png',
    'assets/ui/frames/hud_hero_plaque.png',
    'assets/ui/frames/hud_seed_plaque.png',
    'assets/ui/frames/hud_wave_frame.png',
    'assets/ui/frames/radial_wheel_bg.png',
    'assets/ui/frames/banner_ribbon_gold.png',
    'assets/ui/frames/banner_ribbon_crimson.png'
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

  g = typeof GameGlobal !== 'undefined' ? GameGlobal : (typeof globalThis !== 'undefined' ? globalThis : window);
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
