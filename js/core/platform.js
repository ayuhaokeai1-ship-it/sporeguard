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

function playSynthesizedSound(sfxKey, volumeMod = 1.0) {
  if (!webAudioCtx) return false;
  try {
    if (webAudioCtx.state === 'suspended') {
      webAudioCtx.resume().catch(() => {});
    }
    const t0 = webAudioCtx.currentTime;
    const osc = webAudioCtx.createOscillator();
    const gain = webAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(webAudioCtx.destination);

    if (sfxKey === 'sfx_click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t0);
      osc.frequency.exponentialRampToValueAtTime(320, t0 + 0.035);
      gain.gain.setValueAtTime(0.18 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.035);
      osc.start(t0);
      osc.stop(t0 + 0.035);
      return true;
    } else if (sfxKey === 'sfx_build') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t0);
      osc.frequency.exponentialRampToValueAtTime(640, t0 + 0.08);
      gain.gain.setValueAtTime(0.22 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
      osc.start(t0);
      osc.stop(t0 + 0.09);
      return true;
    } else if (sfxKey === 'sfx_upgrade') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, t0);
      osc.frequency.setValueAtTime(659.25, t0 + 0.05);
      osc.frequency.setValueAtTime(783.99, t0 + 0.10);
      gain.gain.setValueAtTime(0.25 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
      osc.start(t0);
      osc.stop(t0 + 0.22);
      return true;
    } else if (sfxKey === 'sfx_coin' || sfxKey === 'sfx_sell') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t0);
      osc.frequency.setValueAtTime(1600, t0 + 0.04);
      gain.gain.setValueAtTime(0.18 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
      osc.start(t0);
      osc.stop(t0 + 0.12);
      return true;
    } else if (sfxKey === 'sfx_hurt') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t0);
      osc.frequency.exponentialRampToValueAtTime(50, t0 + 0.08);
      gain.gain.setValueAtTime(0.22 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);
      osc.start(t0);
      osc.stop(t0 + 0.08);
      return true;
    } else if (sfxKey === 'sfx_bomb' || sfxKey === 'sfx_boom') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t0);
      osc.frequency.exponentialRampToValueAtTime(35, t0 + 0.22);
      gain.gain.setValueAtTime(0.30 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
      osc.start(t0);
      osc.stop(t0 + 0.22);
      return true;
    } else if (sfxKey === 'sfx_shoot_arrow' || sfxKey === 'sfx_shoot') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t0);
      osc.frequency.exponentialRampToValueAtTime(180, t0 + 0.05);
      gain.gain.setValueAtTime(0.16 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
      osc.start(t0);
      osc.stop(t0 + 0.05);
      return true;
    } else if (sfxKey === 'sfx_thorn') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(580, t0);
      osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.06);
      gain.gain.setValueAtTime(0.14 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
      osc.start(t0);
      osc.stop(t0 + 0.06);
      return true;
    } else if (sfxKey === 'sfx_mist') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t0);
      osc.frequency.exponentialRampToValueAtTime(600, t0 + 0.08);
      gain.gain.setValueAtTime(0.12 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
      osc.start(t0);
      osc.stop(t0 + 0.12);
      return true;
    } else if (sfxKey === 'sfx_multikill' || sfxKey === 'sfx_wave_horn') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392, t0);
      osc.frequency.setValueAtTime(523.25, t0 + 0.08);
      osc.frequency.setValueAtTime(659.25, t0 + 0.16);
      gain.gain.setValueAtTime(0.24 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
      osc.start(t0);
      osc.stop(t0 + 0.35);
      return true;
    } else if (sfxKey === 'sfx_shovel') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(240, t0);
      osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.05);
      gain.gain.setValueAtTime(0.12 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
      osc.start(t0);
      osc.stop(t0 + 0.05);
      return true;
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t0);
      gain.gain.setValueAtTime(0.10 * volumeMod, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.04);
      osc.start(t0);
      osc.stop(t0 + 0.04);
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
function playSfx(sfxKey, volumeMod = 1.0) {
  if (!audioUnlocked || !sfxEnabled) return;
  const now = nowMs();
  if (sfxThrottle[sfxKey] && (now - sfxThrottle[sfxKey] < 45)) {
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

  // 1. WebAudio 优先：多发无损并发 + 0.97~1.03 细腻自然随机音高抖动（消除机械感，还原真实战斗打击打击感）
  if (webAudioCtx) {
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
      if (playSynthesizedSound(sfxKey, volumeMod)) {
        return;
      }
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
