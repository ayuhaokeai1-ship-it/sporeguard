/**
 * 战地打击感与视觉爽快度引擎 (js/game/combatJuice.js)
 * 学习《死亡细胞》(Dead Cells) 与《王国保卫战》(Kingdom Rush) 的顶级游戏质感：
 * - 动态屏幕震动 (Directional Screen Trauma & Camera Shake):
 *   支持爆炸重创、首领猛击、圣树大招等差异化震颤与指数衰减
 * - 暴击黄金爆发与浮空弹跳数字 (Dynamic Critical Flares & Bouncing Numbers)
 * - 战役连击评分系统 (Combat Streak & Battle Rank S/A/B/C)
 * - 巨兽践踏与法术着陆的有机尘土环 (Organic Dust Shockwaves)
 */

const platform = require('../core/platform');

class CombatJuiceEngine {
  constructor() {
    this.trauma = 0; // 0..1, 震动烈度
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeAngle = 0;

    // 连击计数与战斗评分
    this.killStreak = 0;
    this.streakTimer = 0;
    this.maxStreak = 0;
    this.battleScore = 0;
    this.currentRank = 'D';

    // 预分配固定对象池（0 GC 垃圾回收，消除内存抖动卡顿）
    this.critSparks = [];
    for (let i = 0; i < 32; i++) {
      this.critSparks.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0.35, size: 3, color: '#FFD700', active: false });
    }
    this.shockwaves = [];
    for (let i = 0; i < 8; i++) {
      this.shockwaves.push({ x: 0, y: 0, currentRadius: 0, maxRadius: 45, color: '', life: 0, maxLife: 0.4, active: false });
    }
  }

  reset() {
    this.trauma = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeAngle = 0;
    this.killStreak = 0;
    this.streakTimer = 0;
    this.maxStreak = 0;
    this.battleScore = 0;
    this.currentRank = 'D';
    for (let i = 0; i < this.critSparks.length; i++) {
      this.critSparks[i].active = false;
    }
    for (let i = 0; i < this.shockwaves.length; i++) {
      this.shockwaves[i].active = false;
    }
  }

  /**
   * 添加震颤创伤值 (0.1 ~ 0.8)
   */
  addTrauma(amount, dirX = 0, dirY = 0) {
    this.trauma = Math.min(1.0, this.trauma + amount);
    if (dirX !== 0 || dirY !== 0) {
      const len = Math.hypot(dirX, dirY) || 1;
      this.shakeOffsetX += (dirX / len) * amount * 12;
      this.shakeOffsetY += (dirY / len) * amount * 12;
    }
  }

  /**
   * 触发暴击高光震颤
   */
  triggerCrit(x, y, damage, fx = null) {
    this.addTrauma(0.18);
    // 零分配复用粒子池
    let spawned = 0;
    for (let i = 0; i < this.critSparks.length && spawned < 6; i++) {
      const sp = this.critSparks[i];
      if (!sp.active) {
        const ang = (spawned / 6) * Math.PI * 2;
        const spd = 45 + Math.random() * 60;
        sp.x = x;
        sp.y = y;
        sp.vx = Math.cos(ang) * spd;
        sp.vy = Math.sin(ang) * spd;
        sp.life = 0.28;
        sp.maxLife = 0.28;
        sp.size = 2.8;
        sp.color = spawned % 2 === 0 ? '#FFD700' : '#FFF1B8';
        sp.active = true;
        spawned++;
      }
    }

    // 金色星芒火花由本系统负责，真实折算后暴击数值由 enemy.applyDirectDamage 统一飘字，避免同次命中双倍叠字
  }

  /**
   * 触发着陆或大爆炸环状冲击波
   */
  triggerShockwave(x, y, maxRadius = 45, color = 'rgba(255, 235, 140, 0.75)') {
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) {
        sw.x = x;
        sw.y = y;
        sw.currentRadius = 6;
        sw.maxRadius = maxRadius;
        sw.color = color;
        sw.life = 0.32;
        sw.maxLife = 0.32;
        sw.active = true;
        break;
      }
    }
    this.addTrauma(0.25);
  }

  /**
   * 击杀递增连击计数
   */
  recordKill(threat = 1) {
    this.killStreak++;
    this.streakTimer = 3.5; // 3.5秒内保持连击
    if (this.killStreak > this.maxStreak) {
      this.maxStreak = this.killStreak;
    }
    this.battleScore += threat * 10 * Math.min(5, 1 + Math.floor(this.killStreak / 5));

    // 更新评级
    if (this.killStreak >= 30) this.currentRank = 'S';
    else if (this.killStreak >= 18) this.currentRank = 'A';
    else if (this.killStreak >= 8) this.currentRank = 'B';
    else if (this.killStreak >= 3) this.currentRank = 'C';
    else this.currentRank = 'D';
  }

  update(dt) {
    // 1. 屏幕震动创伤衰减 (平滑多项式衰减)
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
      const shakePower = this.trauma * this.trauma; // 平方衰减更加平滑柔顺
      const maxShakePx = 10;
      this.shakeOffsetX = (Math.random() * 2 - 1) * maxShakePx * shakePower;
      this.shakeOffsetY = (Math.random() * 2 - 1) * maxShakePx * shakePower;
      this.shakeAngle = (Math.random() * 2 - 1) * 0.02 * shakePower;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeAngle = 0;
    }

    // 2. 连击计时器衰减
    if (this.streakTimer > 0) {
      this.streakTimer -= dt;
      if (this.streakTimer <= 0) {
        this.killStreak = 0;
      }
    }

    // 3. 暴击火花粒子更新（无 splice 零开销）
    for (let i = 0; i < this.critSparks.length; i++) {
      const sp = this.critSparks[i];
      if (!sp.active) continue;
      sp.life -= dt;
      if (sp.life <= 0) {
        sp.active = false;
        continue;
      }
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 50 * dt;
      sp.vx *= 0.92;
    }

    // 4. 冲击波更新（无 splice 零开销）
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      sw.life -= dt;
      if (sw.life <= 0) {
        sw.active = false;
        continue;
      }
      const prog = 1 - (sw.life / sw.maxLife);
      sw.currentRadius = sw.maxRadius * Math.sin(prog * Math.PI * 0.5);
    }
  }

  /**
   * 应用屏幕震动变换 (在场景绘制前调用)
   */
  applyScreenShake(ctx) {
    if (this.trauma > 0.01) {
      ctx.translate(Math.round(this.shakeOffsetX), Math.round(this.shakeOffsetY));
      if (Math.abs(this.shakeAngle) > 0.001) {
        ctx.rotate(this.shakeAngle);
      }
    }
  }

  /**
   * 绘制战斗特效层 (暴击火花、冲击波与连击小挂件)
   */
  renderFx(ctx) {
    // 1. 冲击波渲染
    if (this.shockwaves.length > 0) {
      ctx.save();
      for (let i = 0; i < this.shockwaves.length; i++) {
        const sw = this.shockwaves[i];
        if (!sw.active) continue;
        const alpha = Math.max(0, sw.life / sw.maxLife);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 2.5 * alpha;
        ctx.beginPath();
        ctx.ellipse(sw.x, sw.y, sw.currentRadius, sw.currentRadius * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. 暴击金辉星芒
    if (this.critSparks.length > 0) {
      ctx.save();
      for (let i = 0; i < this.critSparks.length; i++) {
        const sp = this.critSparks[i];
        if (!sp.active) continue;
        const alpha = Math.max(0, sp.life / sp.maxLife);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /**
   * 绘制战役连击评分挂件 (位于右上角控制栏下方，微型不抢眼)
   */
  renderStreakWidget(ctx) {
    if (this.killStreak < 3) return;

    ctx.save();
    const wx = 880;
    const wy = 56;
    const pulse = 1.0 + Math.sin(this.streakTimer * 8) * 0.08;

    ctx.translate(wx, wy);
    ctx.scale(pulse, pulse);

    // 连击气泡
    ctx.fillStyle = 'rgba(25, 18, 12, 0.88)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-42, -12, 84, 24, 6) : ctx.rect(-42, -12, 84, 24);
    ctx.fill();

    const rankColors = { S: '#FF4D4F', A: '#FF7A45', B: '#FFD666', C: '#95DE64', D: '#BAE7FF' };
    ctx.strokeStyle = rankColors[this.currentRank] || '#FFD666';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = rankColors[this.currentRank] || '#FFD666';
    ctx.font = 'bold 11px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.killStreak} 连杀 [${this.currentRank}]`, 0, 0);

    ctx.restore();
  }
}

module.exports = CombatJuiceEngine;
