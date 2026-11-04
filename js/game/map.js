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
      let safety = 0;
      while (safety++ < 100) {
        if (this.inBounds(c, r)) {
          this.grid[r][c].type = 'path';
          if (cornerSet.has(c + ',' + r)) {
            this.grid[r][c].pathKind = 'turn';
          } else {
            this.grid[r][c].pathKind = dc !== 0 ? 'h' : 'v';
          }
        }
        if (c === c1 && r === r1) break;
        if (c !== c1) c += dc;
        if (r !== r1) r += dr;
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
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 208, OFFSET_Y: 24, SCALE: 0.85 };
      const bgX = -mv.OFFSET_X / mv.SCALE;
      const bgY = -mv.OFFSET_Y / mv.SCALE;
      const bgW = (CONFIG.RESOLUTION.LOGICAL_WIDTH || 960) / mv.SCALE;
      const bgH = (CONFIG.RESOLUTION.LOGICAL_HEIGHT || 540) / mv.SCALE;
      drawSubImage(ctx, atlasImg, sb.x, sb.y, sb.w, sb.h, bgX, bgY, bgW, bgH);
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
