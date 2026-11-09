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
        const variant = (oc * 3 + or * 5) % 4;
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
        fx.spawnFloatingText(obs.x, obs.y - 24, '🌱 清除障碍！开辟全新领地 + 孢子!', '#FFE58F', 1.6);
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
    // 严格锁定固定战术坑位（战术灵土）：场地不再是无限草坪随意插塔
    // 坑位总数稀缺固定（12~16个），考验战术取舍；更换阵容或残血急救时必须使用铲子！
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

        ctx.save();
        // 地面柔和接触阴影
        ctx.fillStyle = 'rgba(10, 15, 12, 0.40)';
        ctx.beginPath();
        ctx.ellipse(ox, oy + 10, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // 100% 纯正精致 AI 原生场景障碍物（绝无任何水印英文字与几何占位色块）
        const variant = obs.variant % 4;
        let obsImg = null;
        let dw = 36;
        let dh = 34;
        let dyOffset = -18;
        if (variant === 0) {
          obsImg = platform.getImage('assets/vfx/prop_thunder_stump.png');
          dw = 38; dh = 35; dyOffset = -19;
        } else if (variant === 1) {
          obsImg = platform.getImage('assets/vfx/relic_amber.png');
          dw = 32; dh = 36; dyOffset = -20;
        } else if (variant === 2) {
          obsImg = platform.getImage('assets/vfx/relic_clover.png');
          dw = 34; dh = 32; dyOffset = -17;
        } else {
          obsImg = platform.getImage('assets/vfx/prop_debris.png') || platform.getImage('assets/vfx/prop_thunder_stump.png');
          dw = 38; dh = 24; dyOffset = -12;
        }

        if (obsImg && obsImg.width) {
          ctx.drawImage(obsImg, ox - dw * 0.5, oy + dyOffset, dw, dh);
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
