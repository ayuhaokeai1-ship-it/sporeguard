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
