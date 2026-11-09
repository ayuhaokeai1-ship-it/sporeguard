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
      [2, 5], [9, 5], [14, 11], [10, 1]
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
      [2, 6], [6, 7], [11, 6], [16, 7]
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
      [3, 4], [8, 5], [13, 4], [16, 10]
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
