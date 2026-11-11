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
