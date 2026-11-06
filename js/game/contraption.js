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

  handlePointerDown(inputX, inputY, scene) {
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
