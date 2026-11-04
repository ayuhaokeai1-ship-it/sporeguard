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
