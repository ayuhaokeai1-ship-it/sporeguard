/**
 * 特效与打击反馈系统 (js/fx/fx.js)
 * 管理对象池粒子（上限600）、伤害/奖励弹出数字、爆心冲击环、震屏、顿帧、边缘红闪与横幅
 * 严格遵循 5.7 反馈参数表与顿帧上限规则
 */

const ObjectPool = require('../core/pool');
const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');
const i18n = require('../i18n/index');
const { drawHazardSprite } = require('../core/atlasRenderer');

class FxSystem {
  constructor() {
    // 粒子对象池（上限 600）
    this.particlePool = new ObjectPool(
      () => ({
        x: 0, y: 0, vx: 0, vy: 0,
        size: 4, color: PALETTE.UI_SPORE,
        life: 0, maxLife: 0.4, gravity: 0
      }),
      (p) => {
        p.x = 0; p.y = 0; p.vx = 0; p.vy = 0;
        p.size = 4; p.color = PALETTE.UI_SPORE;
        p.life = 0; p.maxLife = 0.4; p.gravity = 0;
      },
      CONFIG.POOL_CAPS.PARTICLES
    );

    // 浮动数字对象池（上限 80）
    this.textPool = new ObjectPool(
      () => ({
        x: 0, y: 0, vy: -28,
        text: '', color: PALETTE.UI_TEXT,
        life: 0, maxLife: 0.65, scale: 1.0
      }),
      (t) => {
        t.x = 0; t.y = 0; t.vy = -28;
        t.text = ''; t.color = PALETTE.UI_TEXT;
        t.life = 0; t.maxLife = 0.65; t.scale = 1.0;
      },
      CONFIG.POOL_CAPS.FLOATING_TEXTS
    );

    // 冲击波环（用于爆裂菇爆炸与升级闪光环）
    this.rings = [];
    this.touchRipples = [];
    this.homingMotes = [];

    this.resetBattleState();
  }

  resetBattleState() {
    this.particlePool.clear();
    this.textPool.clear();
    this.rings.length = 0;
    this.touchRipples.length = 0;
    this.homingMotes.length = 0;

    // 震屏状态（取最大值，不累加）
    this.shakePx = 0;
    this.shakeTimerMs = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // 顿帧状态
    this.hitstopRemainingSec = 0;
    this.lastHitstopRealTimeSec = -10;
    this.totalHitstopSec = 0;
    this.elapsedRealCombatSec = 0;

    // 特效慢放状态（超载 10 杀时 0.5 倍速 150ms）
    this.fxTimeScale = 1.0;
    this.fxSlowMoTimerSec = 0;

    // 种子受损红边闪烁
    this.redEdgeTimerSec = 0;

    // 顶部战斗横幅
    this.banner = {
      active: false,
      text: '',
      subText: '',
      color: PALETTE.UI_SPORE,
      timer: 0,
      duration: 1.4
    };
  }

  /**
   * 触发震屏（取最大值不累加）
   */
  triggerShake(px, durationMs) {
    if (px <= 0 || durationMs <= 0) return;
    if (px >= this.shakePx) {
      this.shakePx = px;
      this.shakeTimerMs = Math.max(this.shakeTimerMs, durationMs);
    }
  }

  triggerScreenShake(px, durationSec = 0.15) {
    this.triggerShake(px, durationSec * 1000);
  }

  /**
   * 触发顿帧（遵守 0.5 秒最小间隔与单场战斗时间 5% 累计上限）
   */
  triggerHitstop(durationMs) {
    if (durationMs <= 0) return;
    const reqSec = durationMs / 1000;
    const minInterval = CONFIG.FEEDBACK.HITSTOP_MIN_INTERVAL_SEC;
    if (this.elapsedRealCombatSec - this.lastHitstopRealTimeSec < minInterval) {
      return;
    }

    // 单场顿帧累计不超过战斗时间的 5%（开局前3秒留有保底裕度）
    const effectiveCombatTime = Math.max(3.0, this.elapsedRealCombatSec);
    if (this.totalHitstopSec + reqSec > effectiveCombatTime * CONFIG.FEEDBACK.HITSTOP_MAX_COMBAT_RATIO) {
      return;
    }

    this.hitstopRemainingSec = Math.max(this.hitstopRemainingSec, reqSec);
    this.totalHitstopSec += reqSec;
    this.lastHitstopRealTimeSec = this.elapsedRealCombatSec;
  }

  isHitstopped() {
    return this.hitstopRemainingSec > 0;
  }

  /**
   * 发射像素粒子
   */
  spawnParticles(x, y, count, colors, speedMin = 30, speedMax = 110, lifeMin = 0.22, lifeMax = 0.50, size = 4) {
    const colorList = Array.isArray(colors) ? colors : [colors];
    for (let i = 0; i < count; i++) {
      const p = this.particlePool.acquire(true);
      if (!p) break;
      const angle = (Math.PI * 2 * i) / Math.max(1, count) + (Math.random() - 0.5) * 0.6;
      const spd = speedMin + Math.random() * (speedMax - speedMin);
      p.x = x + (Math.random() - 0.5) * 6;
      p.y = y + (Math.random() - 0.5) * 6;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd;
      p.size = size;
      p.color = colorList[i % colorList.length];
      p.life = 0;
      p.maxLife = lifeMin + Math.random() * (lifeMax - lifeMin);
      p.gravity = 40;
    }
  }

  /**
   * 弹出伤害或奖励数字
   */
  spawnDamageText(x, y, text, color = '#FF4D4F') {
    const numVal = Number(text);
    // 屏蔽低于 15 的高频微小灼烧/毒伤持续跳字，避免伤害数字垂直堆叠遮挡怪物本体
    if (!Number.isNaN(numVal) && Math.abs(numVal) < 15) {
      return;
    }
    return this.spawnFloatingText(x, y, text, color, 1.0);
  }

  spawnFloatingText(x, y, text, color = PALETTE.UI_TEXT, scale = 1.0) {
    const str = String(text);
    const active = this.textPool.getActiveList();
    const isShortNumber = /^[+\-💥]?\d+/.test(str);
    // 密集波次降噪：同屏飘字过多时仅保留关键反应与高额伤害，彻底杜绝文字墙
    if (active.length >= 20 && isShortNumber && !str.startsWith('💥') && !str.startsWith('+')) {
      return;
    }
    const staggerSide = (active.length % 2 === 0) ? 1 : -1;
    let baseX = x + staggerSide * 8 + (Math.random() - 0.5) * 6;
    let baseY = y - 10;

    // 防止同名提示文字（如 破甲! / 圣光! / 毒爆!）与相邻伤害数字重叠
    let yShift = 0;
    for (let i = active.length - 1; i >= 0; i--) {
      const ex = active[i];
      const dx = Math.abs(ex.x - baseX);
      const dy = Math.abs(ex.y - (baseY - yShift));
      if (!isShortNumber && dx <= 68 && dy <= 44 && ex.life < 0.56) {
        if (ex.text === str || str.length <= 6) {
          return;
        }
      }
      if (dx <= 46 && dy <= 18) {
        yShift += 17;
        if (yShift >= 34) break;
      }
    }

    const item = this.textPool.acquire(true);
    if (!item) return;
    item.x = baseX;
    item.y = baseY - yShift;
    item.vy = -34;
    item.text = str;
    item.color = color;
    item.life = 0;
    item.maxLife = isShortNumber ? 0.56 : 0.72;
    item.scale = scale;
  }

  /**
   * 添加冲击环（爆裂菇爆心或升级闪光环）
   */
  spawnShockwave(x, y, maxRadius = 40, color = '#FFFFFF') {
    return this.spawnRing(x, y, maxRadius, color, 0.35, false);
  }

  spawnRing(x, y, maxRadiusPx, color, duration = 0.28, isUpgrade = false) {
    if (this.rings.length >= 24) {
      this.rings.shift();
    }
    this.rings.push({
      x,
      y,
      maxRadiusPx,
      color,
      life: 0,
      duration,
      isUpgrade
    });
  }

  /**
   * 仙露水波触控涟漪：零延迟实体触控反馈
   * 每次手指点击战场，瞬间扩散出一圈青绿/翠玉色水波
   */
  spawnTouchRipple(x, y, color = 'rgba(168, 255, 140, 0.8)') {
    if (this.touchRipples.length >= 16) {
      this.touchRipples.shift();
    }
    this.touchRipples.push({
      x,
      y,
      radius: 4,
      maxRadius: 28,
      life: 0,
      maxLife: 0.32,
      color
    });
  }

  /**
   * 战利品飞向金库流光光丝（Spore Homing Motes）
   * 拾取孢子或古代遗物时，生成向上弹跳并沿贝塞尔弧线飞入左下角金库的流光
   */
  spawnHomingMotes(startX, startY, count = 3, color = '#FFD700') {
    const targetX = 68;
    const targetY = 512;
    for (let i = 0; i < count; i++) {
      if (this.homingMotes.length >= 32) {
        this.homingMotes.shift();
      }
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const burstDist = 18 + Math.random() * 16;
      const arcMidX = (startX + targetX) * 0.5 + (Math.random() - 0.5) * 50;
      const arcMidY = Math.min(startY, targetY) - (40 + Math.random() * 45);

      this.homingMotes.push({
        startX: startX + Math.cos(angle) * (burstDist * 0.3),
        startY: startY + Math.sin(angle) * (burstDist * 0.3),
        cpX: arcMidX,
        cpY: arcMidY,
        targetX,
        targetY,
        timer: 0,
        duration: 0.45 + i * 0.06,
        color
      });
    }
  }

  /**
   * 显示横幅（如“连锁！/Chain!”、“超载！/Overload!”、首领登场等）
   */
  spawnWaveClearCelebration(x = 480, y = 160, rewardSpores = 0) {
    this.triggerShake(1.5, 0.15);
    this.spawnParticles(x, y, 28, ['#FFE58F', '#FFD700', '#52C41A', '#BAE7FF', '#FAAD14'], 65, 180, 0.45, 0.95, 4);
    const motes = Math.min(6, Math.max(3, Math.round((rewardSpores || 20) / 8)));
    this.spawnHomingMotes(x, y, motes, '#FFD700');
  }

  showBanner(text, color = PALETTE.UI_SPORE, subText = '', duration = 1.35) {
    this.banner.active = true;
    this.banner.text = text;
    this.banner.subText = subText;
    this.banner.color = color;
    this.banner.timer = 0;
    this.banner.duration = duration;
  }

  // ==== 5.7 标准事件反馈接口 ====

  onSingleHit(x, y, color = PALETTE.MUSHROOM_GILL) {
    const fb = CONFIG.FEEDBACK.HIT;
    this.spawnParticles(x, y, fb.particles, [color, PALETTE.UI_TEXT], 25, 70, 0.14, 0.26, 4);
  }

  onSingleKill(x, y, damageVal, rewardSpores, enemyColor = PALETTE.UI_SPORE) {
    const fb = CONFIG.FEEDBACK.SINGLE_KILL;
    this.triggerShake(fb.shakePx, fb.shakeMs);
    this.spawnParticles(x, y, fb.particles, [enemyColor, PALETTE.UI_SPORE, PALETTE.UI_TEXT], 35, 115, 0.22, 0.45, 4);
    if (fb.popNumber) {
      const shownDmg = Math.max(1, Math.round(damageVal));
      this.spawnFloatingText(x, y - 4, '-' + shownDmg, PALETTE.UI_TEXT, 1.0);
      if (rewardSpores > 0) {
        this.spawnFloatingText(x + 6, y - 16, '+' + rewardSpores, PALETTE.UI_SPORE, 1.05);
      }
    }
  }

  onBurstExplosion(x, y, splashRadiusPx, branchColor = PALETTE.BRANCH_B) {
    const fb = CONFIG.FEEDBACK.BURST_EXPLOSION;
    this.triggerShake(fb.shakePx, fb.shakeMs);
    this.triggerHitstop(fb.hitstopMs);
    this.spawnParticles(x, y, fb.particles, [branchColor, PALETTE.UI_SPORE, PALETTE.MUSHROOM_CAP], 45, 145, 0.25, 0.52, 4);
    if (fb.shockwaveRing) {
      this.spawnRing(x, y, splashRadiusPx, branchColor, 0.26, false);
    }
    platform.playSfx('sfx_boom');
  }

  onMultiKill(x, y, killCount, bonusSpores) {
    let fb = CONFIG.FEEDBACK.MULTIKILL_SMALL;
    let color = PALETTE.UPGRADE_LV1;
    if (killCount >= CONFIG.FEEDBACK.MULTIKILL_OVERLOAD.minKills) {
      fb = CONFIG.FEEDBACK.MULTIKILL_OVERLOAD;
      color = PALETTE.BRANCH_B;
    } else if (killCount >= CONFIG.FEEDBACK.MULTIKILL_CHAIN.minKills) {
      fb = CONFIG.FEEDBACK.MULTIKILL_CHAIN;
      color = PALETTE.BRANCH_A;
    }

    this.triggerShake(fb.shakePx, fb.shakeMs);
    this.triggerHitstop(fb.hitstopMs);
    this.spawnParticles(x, y, fb.particles, [color, PALETTE.UI_SPORE, PALETTE.UPGRADE_LV1, PALETTE.UI_TEXT], 55, 180, 0.30, 0.65, 4);
    this.spawnRing(x, y, 56, color, 0.35, false);

    if (bonusSpores > 0) {
      this.spawnFloatingText(x, y - 20, '+' + bonusSpores, PALETTE.UI_SPORE, 1.25);
    }

    if (fb.bannerKey) {
      this.showBanner(
        i18n.t(fb.bannerKey) + ' x' + killCount,
        color,
        bonusSpores > 0 ? ('+' + bonusSpores + ' ' + i18n.t('spores_label')) : '',
        1.5
      );
    }

    if (fb.fxSlowMoScale && fb.fxSlowMoMs) {
      this.fxTimeScale = fb.fxSlowMoScale;
      this.fxSlowMoTimerSec = fb.fxSlowMoMs / 1000;
    }

    if (fb.sfx) {
      platform.playSfx(fb.sfx);
    }
  }

  onSeedDamaged(x, y) {
    const fb = CONFIG.FEEDBACK.SEED_DAMAGED;
    this.triggerShake(fb.shakePx, fb.shakeMs);
    this.spawnParticles(x, y, fb.particles, [PALETTE.UI_SEED, PALETTE.ENEMY_EYE], 40, 120, 0.25, 0.50, 4);
    this.redEdgeTimerSec = fb.redEdgeFlashMs / 1000;
    platform.playSfx('sfx_hurt');
  }

  onUpgradeComplete(x, y, branchColor = PALETTE.UPGRADE_LV1) {
    const fb = CONFIG.FEEDBACK.UPGRADE_COMPLETE;
    this.spawnParticles(x, y, fb.particles, [branchColor, PALETTE.UI_SPORE, PALETTE.UI_TEXT], 35, 110, 0.25, 0.50, 4);
    if (fb.flashRing) {
      this.spawnRing(x, y, 28, branchColor, 0.32, true);
    }
    platform.playSfx('sfx_upgrade');
  }

  /**
   * 按真实帧时间更新震屏、顿帧、粒子与横幅（暂停时界面动画仍按真实时间更新）
   */
  update(realDt, isCombatActive, isPaused) {
    if (isCombatActive && !isPaused) {
      this.elapsedRealCombatSec += realDt;
    }

    // 顿帧计时（按真实时间递减）
    // 更新触控仙露涟漪
    for (let i = this.touchRipples.length - 1; i >= 0; i--) {
      const rip = this.touchRipples[i];
      rip.life += realDt;
      if (rip.life >= rip.maxLife) {
        this.touchRipples.splice(i, 1);
      }
    }

    // 更新飞向金库的战利品光丝
    for (let i = this.homingMotes.length - 1; i >= 0; i--) {
      const m = this.homingMotes[i];
      m.timer += realDt;
      if (m.timer >= m.duration) {
        if (this.scene && this.scene.ui) {
          this.scene.ui.sporePopTimer = 0.24;
        }
        this.homingMotes.splice(i, 1);
      }
    }

    if (this.hitstopRemainingSec > 0 && !isPaused) {
      this.hitstopRemainingSec = Math.max(0, this.hitstopRemainingSec - realDt);
    }

    // 特效层 0.5 倍速慢放计时
    if (this.fxSlowMoTimerSec > 0 && !isPaused) {
      this.fxSlowMoTimerSec -= realDt;
      if (this.fxSlowMoTimerSec <= 0) {
        this.fxTimeScale = 1.0;
      }
    }

    // 震屏更新
    if (this.shakeTimerMs > 0 && !isPaused) {
      this.shakeTimerMs -= realDt * 1000;
      if (this.shakeTimerMs <= 0) {
        this.shakePx = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      } else {
        const angle = Math.random() * Math.PI * 2;
        this.shakeOffsetX = Math.round(Math.cos(angle) * this.shakePx);
        this.shakeOffsetY = Math.round(Math.sin(angle) * this.shakePx);
      }
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    if (this.redEdgeTimerSec > 0 && !isPaused) {
      this.redEdgeTimerSec = Math.max(0, this.redEdgeTimerSec - realDt);
    }

    if (this.banner.active && !isPaused) {
      this.banner.timer += realDt;
      if (this.banner.timer >= this.banner.duration) {
        this.banner.active = false;
      }
    }

    if (isPaused) return;

    const fxDt = realDt * this.fxTimeScale;

    // 更新粒子池
    const pList = this.particlePool.getActiveList();
    for (let i = pList.length - 1; i >= 0; i--) {
      const p = pList[i];
      p.life += fxDt;
      if (p.life >= p.maxLife) {
        this.particlePool.releaseAt(i);
        continue;
      }
      p.x += p.vx * fxDt;
      p.y += p.vy * fxDt;
      p.vy += p.gravity * fxDt;
    }

    // 更新浮动文字池
    const tList = this.textPool.getActiveList();
    for (let i = tList.length - 1; i >= 0; i--) {
      const t = tList[i];
      t.life += fxDt;
      if (t.life >= t.maxLife) {
        this.textPool.releaseAt(i);
        continue;
      }
      t.y += t.vy * fxDt;
    }

    // 更新冲击环
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life += fxDt;
      if (r.life >= r.duration) {
        this.rings.splice(i, 1);
      }
    }
  }

  /**
   * 绘制战场内特效（冲击环、粒子、伤害数字）
   */
  renderMapFx(ctx) {
    // 1. 绘制冲击环与 100% AI 手绘高清蘑菇爆裂火球爆炸
    for (let i = 0; i < this.rings.length; i++) {
      const r = this.rings[i];
      const prog = Math.min(1, r.life / r.duration);
      const curRadius = Math.max(4, r.maxRadiusPx * prog);
      const alpha = 1 - prog;

      if (!r.isUpgrade) {
        const boomImg = platform.getImage('assets/vfx/vfx_explosion.png');
        if (boomImg) {
          ctx.save();
          ctx.translate(Math.round(r.x), Math.round(r.y));
          ctx.scale(1.0, 0.78); // 贴合 45 度地面透视
          ctx.globalAlpha = Math.max(0, (1 - prog) * 0.72); // 轻柔透明孢子散开
          const dSize = curRadius * 2.2;
          ctx.drawImage(boomImg, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
          ctx.restore();
          continue;
        }
      }

      if (!drawHazardSprite(ctx, r.isUpgrade ? 'shockwave_1' : 'shockwave_0', r.x, r.y, curRadius, alpha * 0.75)) {
        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = alpha * 0.65;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(Math.round(r.x), Math.round(r.y), Math.round(curRadius), Math.round(curRadius * 0.78), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        platform.recordDrawCall(1);
      }
    }

    // 2. 绘制柔和发光孢子微粒（替代原本的生硬像素方块）
    const pList = this.particlePool.getActiveList();
    if (pList.length > 0) {
      ctx.save();
      for (let i = 0; i < pList.length; i++) {
        const p = pList[i];
        const alpha = Math.max(0.1, 1 - p.life / Math.max(0.05, p.maxLife));
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = p.color;
        const rad = (p.life > p.maxLife * 0.7 ? 1.5 : p.size * 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      platform.recordDrawCall(1);
    }

    // 3. 绘制浮动伤害与奖励数字（高对比黑描边 + 字号分级，清晰不糊成一团）
    const tList = this.textPool.getActiveList();
    if (tList.length > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = 'rgba(10, 14, 10, 0.90)';
      for (let i = 0; i < tList.length; i++) {
        const t = tList[i];
        const alpha = t.life > t.maxLife * 0.7 ? (1 - (t.life - t.maxLife * 0.7) / (t.maxLife * 0.3)) : 1.0;
        ctx.globalAlpha = Math.max(0, alpha);
        const fSize = Math.max(10, Math.min(15, Math.round(11 * (t.scale || 1))));
        ctx.font = `bold ${fSize}px "Microsoft YaHei", sans-serif`;
        const rx = Math.round(t.x);
        const ry = Math.round(t.y);
        ctx.strokeText(t.text, rx, ry);
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, rx, ry);
      }
      ctx.restore();
      platform.recordDrawCall(2);
    }
  }

  /**
   * 绘制屏幕级反馈叠加层（种子受损边缘泛红 + 连锁/超载横幅）
   */
  renderScreenOverlayFx(ctx) {
    // 1. 仙露水波触控涟漪 (Organic Emerald Touch Ripples)
    if (this.touchRipples && this.touchRipples.length > 0) {
      for (let i = 0; i < this.touchRipples.length; i++) {
        const rip = this.touchRipples[i];
        const prog = rip.life / rip.maxLife;
        const curR = rip.radius + (rip.maxRadius - rip.radius) * prog;
        const alpha = (1 - prog) * 0.65;
        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, curR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168, 255, 140, ${alpha})`;
        ctx.lineWidth = Math.max(1, 2.2 * (1 - prog));
        ctx.stroke();
        // 柔和内光圈
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, Math.max(1, curR * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 140, ${alpha * 0.4})`;
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. 飞向底部金库的战利品与金孢流光轨迹 (Spore Homing Motes)
    if (this.homingMotes && this.homingMotes.length > 0) {
      const moteImg = platform.getImage('assets/vfx/item_golden_spore.png');
      for (let i = 0; i < this.homingMotes.length; i++) {
        const m = this.homingMotes[i];
        const prog = Math.min(1.0, m.timer / m.duration);
        const inv = 1 - prog;
        const curX = inv * inv * m.startX + 2 * inv * prog * m.cpX + prog * prog * m.targetX;
        const curY = inv * inv * m.startY + 2 * inv * prog * m.cpY + prog * prog * m.targetY;

        ctx.save();
        const radGrad = ctx.createRadialGradient(curX, curY, 1, curX, curY, 9);
        radGrad.addColorStop(0, 'rgba(255, 245, 190, 0.85)');
        radGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.35)');
        radGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(curX, curY, 9, 0, Math.PI * 2);
        ctx.fill();
        if (moteImg && moteImg.width) {
          ctx.drawImage(moteImg, curX - 6, curY - 6, 12, 12);
        }
        ctx.restore();
      }
    }

    // 种子受损红边
    if (this.redEdgeTimerSec > 0) {
      const alpha = Math.min(0.55, (this.redEdgeTimerSec / 0.35) * 0.55);
      ctx.save();
      ctx.strokeStyle = PALETTE.UI_SEED;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, (CONFIG.RESOLUTION.LOGICAL_WIDTH || 960) - 12, (CONFIG.RESOLUTION.LOGICAL_HEIGHT || 540) - 12);
      ctx.restore();
      platform.recordDrawCall(1);
    }

    // 顶部横幅（连锁！/超载！/波次提示）：优先采用 AI 黄金/绯红卷轴丝带（动态避让首领血条）
    if (this.banner.active) {
      const b = this.banner;
      const bw = 460;
      const bh = b.subText ? 52 : 36;
      const bx = (960 - bw) * 0.5;
      const hasBossHud = Boolean(this.scene && this.scene.bossOverdriveEngine && this.scene.bossOverdriveEngine.activeBoss && this.scene.bossOverdriveEngine.activeBoss.hp > 0);
      const by = hasBossHud ? 116 : 64;
      const isAlertBanner = (b.color === PALETTE.CRIMSON_SELL || b.color === '#FF4D4F' || b.color === PALETTE.ENEMY_EYE);
      const ribImg = platform.getImage(isAlertBanner ? 'assets/ui/frames/banner_ribbon_crimson.png' : 'assets/ui/frames/banner_ribbon_gold.png');

      ctx.save();
      if (ribImg && ribImg.width) {
        const rw = bw + 64;
        const rh = bh + 34;
        ctx.drawImage(ribImg, Math.round(bx - 32), Math.round(by - 15), rw, rh);
        ctx.fillStyle = isAlertBanner ? '#FFF5E8' : '#2C1406';
        ctx.font = 'bold 15px "Microsoft YaHei UI", "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, bx + bw * 0.5, by + (b.subText ? 18 : bh * 0.5));
        if (b.subText) {
          ctx.fillStyle = isAlertBanner ? '#FFD591' : '#542A0E';
          ctx.font = 'bold 11.5px "Microsoft YaHei UI", "PingFang SC", sans-serif';
          ctx.fillText(b.subText, bx + bw * 0.5, by + 35);
        }
      } else {
        ctx.fillStyle = 'rgba(28, 18, 10, 0.92)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 10) : ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2.0;
        ctx.stroke();

        ctx.fillStyle = b.color;
        ctx.font = 'bold 15px "Microsoft YaHei UI", "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, bx + bw * 0.5, by + (b.subText ? 18 : bh * 0.5));

        if (b.subText) {
          ctx.fillStyle = PALETTE.UI_TEXT || '#F0F0F0';
          ctx.font = '12px "Microsoft YaHei UI", "PingFang SC", sans-serif';
          ctx.fillText(b.subText, bx + bw * 0.5, by + 36);
        }
      }
      ctx.restore();
      platform.recordDrawCall(2);
    }
  }
}

module.exports = FxSystem;
