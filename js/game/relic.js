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
      fx.spawnHomingMotes(mv.OFFSET_X + relic.x * (mv.SCALE || 1.0), mv.OFFSET_Y + ry * (mv.SCALE || 1.0), 4, '#FFD700');
    }
    if (relic.kind === 'coin') {
      scene.economy.addSpores(relic.value || 60);
      if (fx) {
        fx.spawnFloatingText(relic.x, ry - 18, `+${relic.value || 60} 战利品孢子!`, '#FFD700', 1.3);
        fx.spawnParticles(relic.x, ry, 16, ['#FFD700', '#FFF1B8', '#FFA940'], 30, 90, 0.25, 0.5, 3);
      }
      platform.playSfx('sfx_upgrade');
    } else if (relic.kind === 'shield') {
      if (scene.economy) {
        const maxSeeds = scene.economy.maxSeeds || 20;
        scene.economy.seeds = Math.min(maxSeeds, (scene.economy.seeds || 0) + 1);
      }
      if (fx) {
        fx.spawnFloatingText(relic.x, ry - 18, '+1 守护生命!', '#52C41A', 1.4);
        fx.spawnParticles(relic.x, ry, 18, ['#52C41A', '#B7EB8F', '#FFFFFF'], 30, 80, 0.3, 0.6, 3);
      }
      platform.playSfx('sfx_upgrade');
    } else if (relic.kind === 'lightning') {
      // 快速恢复所有法术冷却并赋予全场守卫狂暴
      for (let sKey in scene.spells) {
        scene.spells[sKey].timer = 0;
      }
      if (fx) {
        fx.spawnFloatingText(relic.x, ry - 18, '法术充能瞬间拉满!', '#40A9FF', 1.4);
        fx.spawnParticles(relic.x, ry, 22, ['#40A9FF', '#91D5FF', '#BAE7FF'], 35, 100, 0.3, 0.6, 4);
      }
      platform.playSfx('sfx_laser');
    } else if (relic.kind === 'clover') {
      // 四叶草神种：立即提供 60 孢子能量 + 1 觉醒神种 + 全场狂暴！
      if (scene.economy) {
        scene.economy.addSpores(60);
      }
      scene.awakeningSeeds = Math.min(5, (scene.awakeningSeeds || 0) + 1);
      if (scene.towerManager && scene.towerManager.towers) {
        for (let ti = 0; ti < scene.towerManager.towers.length; ti++) {
          scene.towerManager.towers[ti].superchargeTimer = Math.max(scene.towerManager.towers[ti].superchargeTimer || 0, 4.0);
        }
      }
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