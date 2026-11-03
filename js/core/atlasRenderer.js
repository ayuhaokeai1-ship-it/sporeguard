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
