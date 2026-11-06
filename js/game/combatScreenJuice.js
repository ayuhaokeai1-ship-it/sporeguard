/**
 * 战斗打击感与物理视效引擎 (js/game/combatScreenJuice.js)
 * 深度汲取《Dead Cells》《Hades》与《Kingdom Rush》顶级打击反馈
 * 提供真实弹簧阻尼旋转晃屏、动态击飞伤害跳字、连杀里程碑与微环境粒子
 */

const UI_FONT = '"PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", sans-serif';

class CombatScreenJuice {
  constructor() {
    this.trauma = 0; // 0..1 震动创伤值
    this.maxShakePx = 10;
    this.maxAngleRad = 0.045; // ~2.5 度微旋转，提供顶级电影级受击感
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeAngle = 0;
    this.juiceTime = 0;

    // 漂浮物理跳字池
    this.floatingTexts = [];

    // 连杀计数与华丽徽章
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboScale = 1.0;

    // 氛围粒子 (落叶、萤火虫、水花涟漪)
    this.ambientMotes = [];
    this.initAmbientMotes();
  }

  reset() {
    this.trauma = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeAngle = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.floatingTexts = [];
    this.initAmbientMotes();
  }

  initAmbientMotes() {
    for (let i = 0; i < 28; i++) {
      this.ambientMotes.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        vx: 0.15 + Math.random() * 0.45,
        vy: 0.25 + Math.random() * 0.55,
        size: 1.5 + Math.random() * 2.5,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 2.0,
        type: i % 3 === 0 ? 'leaf' : (i % 2 === 0 ? 'spore' : 'mote'),
        alpha: 0.25 + Math.random() * 0.55
      });
    }
  }

  /**
   * 注入打击创伤值 (0..1)
   */
  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  /**
   * 触发暴击跳字
   */
  spawnCritText(x, y, text, color = '#FFE58F', scale = 1.25) {
    this.floatingTexts.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 45,
      vy: -65 - Math.random() * 40,
      text,
      color,
      scale,
      life: 1.0,
      maxLife: 1.0,
      isCrit: true
    });
    this.addTrauma(0.18);
  }

  /**
   * 击杀递增连杀计数
   */
  onKill(enemy, scene) {
    this.comboTimer = 2.4;
    this.comboCount += 1;
    this.comboScale = 1.45;

    if (this.comboCount % 5 === 0) {
      this.addTrauma(0.22);
      if (scene && scene.fx) {
        scene.fx.spawnParticles(enemy.x, enemy.y, 25, ['#FFD700', '#52C41A', '#BAE7FF', '#FFA39E'], 40, 110, 0.3, 0.6, 4.5);
      }
    }
  }

  update(dt, isBattle = true) {
    this.juiceTime += dt;

    // 1. 创伤值按平方衰减（更符合自然物理反馈）
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 1.6);
      const shakePower = this.trauma * this.trauma;
      this.shakeOffsetX = (Math.sin(this.juiceTime * 45) + (Math.random() - 0.5) * 0.6) * this.maxShakePx * shakePower;
      this.shakeOffsetY = (Math.cos(this.juiceTime * 52) + (Math.random() - 0.5) * 0.6) * this.maxShakePx * shakePower;
      this.shakeAngle = Math.sin(this.juiceTime * 38) * this.maxAngleRad * shakePower;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.shakeAngle = 0;
    }

    // 2. 连杀计时器衰减
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      this.comboScale = Math.max(1.0, this.comboScale - dt * 2.0);
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // 3. 漂浮物理伤害数字更新
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.x += ft.vx * dt;
      ft.y += ft.vy * dt;
      ft.vy += 80 * dt; // 重力下坠感
    }

    // 4. 环境氛围微粒漂移
    if (isBattle) {
      for (let i = 0; i < this.ambientMotes.length; i++) {
        const m = this.ambientMotes[i];
        m.x += m.vx;
        m.y += m.vy;
        m.rot += m.vRot * dt;
        if (m.x > 980) m.x = -20;
        if (m.y > 560) m.y = -20;
      }
    }
  }

  /**
   * 应用视效位移变换至主画布上下文
   */
  applyScreenShakeTransform(ctx) {
    if (this.trauma <= 0.001) return;
    ctx.translate(480 + this.shakeOffsetX, 270 + this.shakeOffsetY);
    ctx.rotate(this.shakeAngle);
    ctx.translate(-480, -270);
  }

  /**
   * 渲染环境粒子与击杀连击 UI 徽章
   */
  renderJuiceOverlays(ctx) {
    ctx.save();

    // 1. 绘制灵动林间微粒
    for (let i = 0; i < this.ambientMotes.length; i++) {
      const m = this.ambientMotes[i];
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rot);
      ctx.globalAlpha = m.alpha * 0.75;

      if (m.type === 'leaf') {
        ctx.fillStyle = '#73D13D';
        ctx.beginPath();
        ctx.ellipse(0, 0, m.size * 2, m.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'spore') {
        ctx.fillStyle = '#FFE58F';
        ctx.beginPath();
        ctx.arc(0, 0, m.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#BAE7FF';
        ctx.beginPath();
        ctx.arc(0, 0, m.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. 绘制漂浮物理伤害数字
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      const prog = ft.life / ft.maxLife;
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale * (0.8 + 0.2 * prog), ft.scale * (0.8 + 0.2 * prog));
      ctx.globalAlpha = Math.min(1.0, prog * 1.5);

      ctx.font = ft.isCrit ? `bold 16px ${UI_FONT}` : `bold 13px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 阴影描边
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.lineWidth = 3.2;
      ctx.strokeText(ft.text, 0, 0);

      // 发光字芯
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }

    // 3. 绘制激燃连杀战绩徽章 (Combo Milestone Badge)
    if (this.comboCount >= 3) {
      const bx = 862;
      const by = 66;
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(this.comboScale, this.comboScale);

      const isHigh = this.comboCount >= 10;
      ctx.fillStyle = isHigh ? 'rgba(140, 29, 24, 0.90)' : 'rgba(26, 38, 24, 0.88)';
      ctx.strokeStyle = isHigh ? '#FFA39E' : '#FFE58F';
      ctx.lineWidth = 2.0;

      const badgeW = 148;
      const badgeH = 28;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-badgeW * 0.5, -badgeH * 0.5, badgeW, badgeH, 14) : ctx.rect(-badgeW * 0.5, -badgeH * 0.5, badgeW, badgeH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHigh ? '#FFF1F0' : '#FFE58F';
      ctx.font = `bold 13px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const title = this.comboCount >= 20 ? '狂暴超神' : (this.comboCount >= 10 ? '势如破竹' : '连续斩获');
      ctx.fillText(`${title} ${this.comboCount} 连杀`, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }
}

module.exports = CombatScreenJuice;
