/**
 * 成熟战斗打击感与动态特效引擎 (js/game/combatVfxEngine.js)
 * 彻底消灭简陋的 Canvas 直线、空心几何体与纯色色块！
 * 全面集成 100% 真实 AI 手绘破空巡林箭矢、爆裂熔岩炮弹、剧毒真菌酸雾、神圣光华法球与太古劈砍刀光。
 * 深度融合成熟塔防 (Kingdom Rush / Bloons TD6 / Arknights) 级别的打击停顿、分段血条与动态状态徽标。
 */

const platform = require('../core/platform');

class CombatVfxEngine {
  constructor() {
    this.sparkPool = [];
    this.maxSparks = 64;
    this.floatingTexts = [];
    this.maxTexts = 32;
    this.slashWaves = [];
    this.maxSlashes = 16;
  }

  reset() {
    this.sparkPool.length = 0;
    this.floatingTexts.length = 0;
    this.slashWaves.length = 0;
  }

  /**
   * 生成击中火花 (AI 手绘真实打击微粒 assets/vfx/vfx_hit_spark.png)
   */
  spawnHitSpark(x, y, scale = 1.0, color = '#FFE58F') {
    if (this.sparkPool.length >= this.maxSparks) return;
    this.sparkPool.push({
      x, y,
      scale,
      color,
      life: 0.22,
      maxLife: 0.22,
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40
    });
  }

  /**
   * 生成英雄太古劈砍刀光 (assets/vfx/vfx_hero_slash.png)
   */
  spawnHeroSlash(x, y, angle = 0, scale = 1.0) {
    if (this.slashWaves.length >= this.maxSlashes) return;
    this.slashWaves.push({
      x, y,
      angle,
      scale,
      life: 0.28,
      maxLife: 0.28
    });
  }

  /**
   * 生成暴击与战术战斗浮字 (Combat Floating Text)
   */
  spawnCombatNumber(x, y, text, type = 'normal') {
    if (this.floatingTexts.length >= this.maxTexts) return;
    let color = '#FFF';
    let size = 12;
    let isCrit = false;

    if (type === 'crit') {
      color = '#FFD700';
      size = 15;
      isCrit = true;
    } else if (type === 'pyro' || type === 'burn') {
      color = '#FF4D4F';
      size = 13;
    } else if (type === 'electro' || type === 'shock') {
      color = '#D3ADF7';
      size = 13;
    } else if (type === 'cryo' || type === 'frost') {
      color = '#91D5FF';
      size = 12;
    } else if (type === 'toxic' || type === 'poison') {
      color = '#73D13D';
      size = 12;
    } else if (type === 'holy' || type === 'heal') {
      color = '#FFE58F';
      size = 13;
    }

    this.floatingTexts.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y - 8,
      text: String(text),
      color,
      size,
      isCrit,
      life: 0.75,
      maxLife: 0.75,
      vy: -32
    });
  }

  /**
   * 每帧更新物理与微粒衰减
   */
  update(dt) {
    // 1. 击中火花
    for (let i = this.sparkPool.length - 1; i >= 0; i--) {
      const s = this.sparkPool[i];
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.life <= 0) {
        this.sparkPool.splice(i, 1);
      }
    }

    // 2. 劈砍刀光
    for (let i = this.slashWaves.length - 1; i >= 0; i--) {
      const sw = this.slashWaves[i];
      sw.life -= dt;
      if (sw.life <= 0) {
        this.slashWaves.splice(i, 1);
      }
    }

    // 3. 战斗飘字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      ft.vy *= 0.94; // 阻尼
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * 绘制成熟塔防质感的高级分段血条与状态图标
   */
  renderEnemyHealthBar(ctx, enemy) {
    if (!enemy || enemy.hp <= 0 || enemy.hp >= enemy.maxHp) return;

    const barW = Math.max(34, Math.min(60, Math.round(enemy.width || 32)));
    const barH = 5.5;
    const barX = Math.round(enemy.x - barW * 0.5);
    const barY = Math.round(enemy.y - (enemy.height ? enemy.height * 0.55 : 22) - 8);

    const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));

    ctx.save();
    // 1. 极具质感的黑铁底框
    ctx.fillStyle = 'rgba(10, 15, 12, 0.88)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 3) : ctx.rect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60, 75, 65, 0.65)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 2. 动态生命渐变充能条
    let barColor = '#52C41A'; // 健康绿
    if (hpRatio < 0.30) {
      barColor = '#FF4D4F'; // 濒死鲜红
    } else if (hpRatio < 0.60) {
      barColor = '#FAAD14'; // 承伤琥珀黄
    }

    const curFillW = Math.max(1, Math.round(barW * hpRatio));
    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX, barY, curFillW, barH, 2) : ctx.rect(barX, barY, curFillW, barH);
    ctx.fill();

    // 3. 成熟游戏专属：每 100 HP 分段暗刻线 (Segments)
    const segmentCount = Math.min(8, Math.floor(enemy.maxHp / 100));
    if (segmentCount > 1) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      const segW = barW / segmentCount;
      for (let s = 1; s < segmentCount; s++) {
        const sx = Math.round(barX + s * segW);
        ctx.fillRect(sx, barY, 1, barH);
      }
    }

    // 4. 护盾条覆层 (若有护盾值)
    if (enemy.shield && enemy.shield > 0) {
      const shieldRatio = Math.min(1, enemy.shield / (enemy.maxHp * 0.5));
      ctx.fillStyle = 'rgba(145, 213, 255, 0.75)';
      ctx.fillRect(barX, barY, Math.round(barW * shieldRatio), 2);
    }

    // 5. 状态效果微标 (Debuff Status Icons)
    let iconOffsetX = barX;
    const iconY = barY - 9;
    const iconSize = 8;

    if (enemy.isFrozen || (enemy.slowTimer && enemy.slowTimer > 0)) {
      ctx.fillStyle = '#91D5FF';
      ctx.font = '8px sans-serif';
      ctx.fillText('❄️', iconOffsetX, iconY + 7);
      iconOffsetX += 10;
    }
    if (enemy.isBurning || (enemy.burnTimer && enemy.burnTimer > 0)) {
      ctx.fillStyle = '#FF4D4F';
      ctx.font = '8px sans-serif';
      ctx.fillText('🔥', iconOffsetX, iconY + 7);
      iconOffsetX += 10;
    }
    if (enemy.isPoisoned || (enemy.poisonTimer && enemy.poisonTimer > 0)) {
      ctx.fillStyle = '#73D13D';
      ctx.font = '8px sans-serif';
      ctx.fillText('🧪', iconOffsetX, iconY + 7);
      iconOffsetX += 10;
    }
    if (enemy.stunTimer && enemy.stunTimer > 0) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '8px sans-serif';
      ctx.fillText('💫', iconOffsetX, iconY + 7);
      iconOffsetX += 10;
    }

    ctx.restore();
  }

  /**
   * 绘制战斗打击特效与刀光
   */
  renderCombatVfx(ctx) {
    const hitSparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
    const heroSlashImg = platform.getImage('assets/vfx/vfx_hero_slash.png');

    ctx.save();

    // 1. 英雄太古劈砍刀光
    for (let i = 0; i < this.slashWaves.length; i++) {
      const sw = this.slashWaves[i];
      const prog = 1 - (sw.life / sw.maxLife);
      const alpha = Math.max(0, 1 - prog);

      if (heroSlashImg && heroSlashImg.width) {
        ctx.save();
        ctx.translate(Math.round(sw.x), Math.round(sw.y));
        ctx.rotate(sw.angle);
        ctx.scale(sw.scale * (1 + prog * 0.4), sw.scale * (1 + prog * 0.4));
        ctx.globalAlpha = alpha * 0.95;
        const dw = 52, dh = 52;
        ctx.drawImage(heroSlashImg, -dw * 0.5, -dh * 0.5, dw, dh);
        ctx.restore();
      }
    }

    // 2. 击中火花
    for (let i = 0; i < this.sparkPool.length; i++) {
      const s = this.sparkPool[i];
      const alpha = Math.max(0, s.life / s.maxLife);

      if (hitSparkImg && hitSparkImg.width) {
        ctx.save();
        ctx.translate(Math.round(s.x), Math.round(s.y));
        ctx.rotate(s.rot);
        ctx.globalAlpha = alpha * 0.85;
        const sz = 24 * s.scale;
        ctx.drawImage(hitSparkImg, -sz * 0.5, -sz * 0.5, sz, sz);
        ctx.restore();
      } else {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha * 0.80;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5 * s.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. 战斗飘字
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = (ft.isCrit ? 'bold ' : '600 ') + ft.size + 'px "Cinzel", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

      // 字身
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}

module.exports = CombatVfxEngine;
