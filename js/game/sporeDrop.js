/**
 * 森林晨露金孢自然凝结与战地能量收集系统 (js/game/sporeDrop.js)
 * 奇幻森林晨露金孢随风飘落与即时触控收集机制：
 * 1. 战场自然凝结的晨露金孢（每 4~7 秒随风飘落一枚）
 * 2. 灵光菇收获时迸发的跳跃金露球
 * 3. 击败精英怪物或 Boss 阶段转换时爆出的丰收金孢囊
 * 玩家点击即爆，爆出金币声效与浮动文字，增加玩家战场微操 APM 与即时正向反馈！
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class SporeDropManager {
  constructor() {
    this.drops = [];
    this.naturalSpawnTimer = 5.0;
    this.animTimeSec = 0;
  }

  reset() {
    this.drops.length = 0;
    this.naturalSpawnTimer = 4.5;
  }

  spawnDrop(x, y, spores = 15, isGold = true, floatDist = 28) {
    this.drops.push({
      x,
      y: y - 12,
      targetY: y,
      spores,
      isGold,
      life: 7.0,
      maxLife: 7.0,
      animTimer: Math.random() * Math.PI * 2,
      scale: 0.2,
      vy: 24,
      collected: false
    });
  }

  update(dt, map, economy, fx) {
    this.animTimeSec += dt;

    // 自然掉落晨露金孢 (PvZ 阳光飘落机制)
    this.naturalSpawnTimer -= dt;
    if (this.naturalSpawnTimer <= 0) {
      this.naturalSpawnTimer = 5.5 + Math.random() * 3.0;
      // 随机落于地图草地与林径视野内 (x: 64..576, y: 50..390)
      const rx = 64 + Math.random() * 512;
      const ry = 50 + Math.random() * 340;
      this.spawnDrop(rx, ry, 15, true, 40);
    }

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.animTimer += dt;
      d.life -= dt;

      // 弹跳降落
      if (d.y < d.targetY) {
        d.y = Math.min(d.targetY, d.y + d.vy * dt * 2.5);
      }
      if (d.scale < 1.0) {
        d.scale = Math.min(1.0, d.scale + dt * 4.5);
      }

      // 到期自然淡出
      if (d.life <= 0) {
        this.drops.splice(i, 1);
      }
    }
  }

  /**
   * 点击/触控检测（PvZ 点击拾取阳光机制）
   * @param {number} mx 屏幕逻辑坐标 X
   * @param {number} my 屏幕逻辑坐标 Y
   * @returns {boolean} 是否成功点击收集
   */
  handlePointerDown(mx, my, economy, fx) {
    const hitRadius = 45; // 手机端友好大判定圈 (45px)，手指轻触即刻响应
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      const bob = Math.sin(d.animTimer * 4) * 3;
      const dy = d.y + bob;
      const dist = Math.hypot(mx - d.x, my - dy);

      if (dist <= hitRadius) {
        // 成功拾取！
        if (economy) {
          economy.addSpores(d.spores);
        }
        if (fx) {
          fx.spawnFloatingText(d.x, dy - 18, `+${d.spores} 晨露孢子!`, '#FFE58F', 1.4);
          fx.spawnParticles(d.x, dy, 18, ['#FFE58F', '#FAAD14', '#FFFDF5', '#52C41A'], 30, 75, 0.25, 0.5, 4);
          if (typeof fx.spawnShockwave === 'function') {
            fx.spawnShockwave(d.x, dy, 32, '#FFE58F');
          }
        }
        platform.playSfx('sfx_coin');
        // 手机端原生轻微触感振动反馈
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(12); } catch (e) {}
        }
        if (typeof wx !== 'undefined' && wx.vibrateShort) {
          try { wx.vibrateShort({ type: 'light' }); } catch (e) {}
        }
        this.drops.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  render(ctx) {
    if (this.drops.length === 0) return;

    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      const bob = Math.sin(d.animTimer * 4) * 3;
      const dx = d.x;
      const dy = d.y + bob;

      // 闪烁警示：当剩余寿命不足 2 秒时平滑渐隐闪烁
      if (d.life < 2.0) {
        const blink = Math.sin(d.life * 14);
        if (blink < -0.2) continue;
      }

      ctx.save();
      ctx.translate(dx, dy);
      ctx.scale(d.scale, d.scale);

      // 1. 地面微光阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
      ctx.beginPath();
      ctx.ellipse(0, 12 - bob, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. 纯手绘神圣黄金孢子明珠 (100% AI Hand-Painted Golden Spore Pearl)
      const sporeImg = platform.getImage('assets/vfx/item_golden_spore.png');
      if (sporeImg && sporeImg.width) {
        const pulse = 1.0 + Math.sin(d.animTimer * 5) * 0.08;
        const dw = 32 * pulse;
        const dh = 34 * pulse;

        // 背后柔和金色晨曦光晕
        const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 22 * pulse);
        glowGrad.addColorStop(0, 'rgba(255, 235, 140, 0.45)');
        glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 22 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(sporeImg, -dw * 0.5, -dh * 0.5, dw, dh);
        ctx.restore();
        continue;
      }
ctx.restore();
    }
  }
}

module.exports = SporeDropManager;
