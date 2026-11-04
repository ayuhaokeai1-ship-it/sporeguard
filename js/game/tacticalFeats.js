/**
 * 战术战功勋章与首领相位演化系统 (js/game/tacticalFeats.js)
 * 借鉴 Kingdom Rush 英雄挑战与 Arknights 突袭战役设计：
 * 实时监测玩家微操、远距击杀、元素连锁反应与绝境防守，动态颁发高光战功勋章并掉落高额孢子赏金。
 * 同时统御多阶段首领狂暴相态，在 BOSS 濒死时激发环境全域变色与召唤狂暴虫潮。
 */

const platform = require('../core/platform');

class TacticalFeatsSystem {
  constructor() {
    this.feats = {
      sniper_elite: {
        id: 'sniper_elite',
        title: '神射无双',
        desc: '在 220 像素以外的超远距离精准击杀 5 只疾行虫',
        rewardSpores: 80,
        unlocked: false,
        progress: 0,
        target: 5
      },
      superconduct_chain: {
        id: 'superconduct_chain',
        title: '超导风暴',
        desc: '单次元素反应引爆至少 6 只敌军',
        rewardSpores: 120,
        unlocked: false,
        progress: 0,
        target: 6
      },
      absolute_zero: {
        id: 'absolute_zero',
        title: '绝对零度',
        desc: '使用迷雾与玄冰使 8 只敌军减速超过 50%',
        rewardSpores: 100,
        unlocked: false,
        progress: 0,
        target: 8
      },
      iron_bastion: {
        id: 'iron_bastion',
        title: '钢铁森防',
        desc: '英雄在承受超过 300 点伤害后依然屹立不倒并消灭攻击者',
        rewardSpores: 110,
        unlocked: false,
        progress: 0,
        target: 1
      },
      flawless_sanctuary: {
        id: 'flawless_sanctuary',
        title: '无暇圣域',
        desc: '连续防守 5 波敌军，生命种子零损耗',
        rewardSpores: 150,
        unlocked: false,
        progress: 0,
        target: 5
      },
      titan_breaker: {
        id: 'titan_breaker',
        title: '巨神破壁',
        desc: '攻破攻城巨甲虫 (Siege Beetle) 的重型防护并将其消灭',
        rewardSpores: 160,
        unlocked: false,
        progress: 0,
        target: 1
      },
      aerial_hunter: {
        id: 'aerial_hunter',
        title: '截击猎手',
        desc: '在跃击虫 (Leaper) 腾空跳跃期间完成空中截杀',
        rewardSpores: 130,
        unlocked: false,
        progress: 0,
        target: 1
      },
      bountiful_grove: {
        id: 'bountiful_grove',
        title: '始源丰饶',
        desc: '在单局对决中累计收获超过 1,000 点森林孢子',
        rewardSpores: 200,
        unlocked: false,
        progress: 0,
        target: 1000
      }
    };

    this.activeBanner = null;
    this.bannerTimer = 0;

    // 首领二阶段狂暴演化追踪
    this.bossEnraged = false;
    this.bossEnrageFlashTimer = 0;
  }

  reset() {
    for (let k in this.feats) {
      this.feats[k].unlocked = false;
      this.feats[k].progress = 0;
    }
    this.activeBanner = null;
    this.bannerTimer = 0;
    this.bossEnraged = false;
    this.bossEnrageFlashTimer = 0;
  }

  /**
   * 记录战果并核查战功勋章
   */
  recordEvent(eventId, value = 1, scene = null) {
    if (eventId === 'sniper_kill') {
      const f = this.feats.sniper_elite;
      if (!f.unlocked) {
        f.progress += value;
        if (f.progress >= f.target) this.unlockFeat('sniper_elite', scene);
      }
    } else if (eventId === 'superconduct_burst') {
      const f = this.feats.superconduct_chain;
      if (!f.unlocked && value >= f.target) {
        this.unlockFeat('superconduct_chain', scene);
      }
    } else if (eventId === 'massive_slow') {
      const f = this.feats.absolute_zero;
      if (!f.unlocked) {
        f.progress += value;
        if (f.progress >= f.target) this.unlockFeat('absolute_zero', scene);
      }
    } else if (eventId === 'hero_clutch') {
      const f = this.feats.iron_bastion;
      if (!f.unlocked) {
        this.unlockFeat('iron_bastion', scene);
      }
    } else if (eventId === 'flawless_wave') {
      const f = this.feats.flawless_sanctuary;
      if (!f.unlocked) {
        f.progress += 1;
        if (f.progress >= f.target) this.unlockFeat('flawless_sanctuary', scene);
      }
    } else if (eventId === 'kill_siege') {
      const f = this.feats.titan_breaker;
      if (!f.unlocked) this.unlockFeat('titan_breaker', scene);
    } else if (eventId === 'kill_leaper_air') {
      const f = this.feats.aerial_hunter;
      if (!f.unlocked) this.unlockFeat('aerial_hunter', scene);
    } else if (eventId === 'spore_earn') {
      const f = this.feats.bountiful_grove;
      if (!f.unlocked) {
        f.progress += value;
        if (f.progress >= f.target) this.unlockFeat('bountiful_grove', scene);
      }
    }
  }

  /**
   * 触发战功达成
   */
  unlockFeat(featId, scene) {
    const f = this.feats[featId];
    if (!f || f.unlocked) return;
    f.unlocked = true;

    this.activeBanner = {
      title: '🎖️ 战功勋章：' + f.title,
      sub: f.desc + ' (奖励 +' + f.rewardSpores + ' 孢子)'
    };
    this.bannerTimer = 2.8;

    platform.playSfx('sfx_upgrade');
    if (scene && scene.economy) {
      scene.economy.add(f.rewardSpores);
    }
    if (scene && scene.fx) {
      scene.fx.spawnFloatingText(480, 180, '🎖️ 勋章达成 +' + f.rewardSpores, '#FFD700', 1.5);
    }
  }

  /**
   * 首领相位与二阶段狂暴演化监测
   */
  update(dt, scene) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.activeBanner = null;
      }
    }

    if (this.bossEnrageFlashTimer > 0) {
      this.bossEnrageFlashTimer = Math.max(0, this.bossEnrageFlashTimer - dt);
    }

    if (!scene || scene.state !== 'BATTLE' || !scene.enemyManager) return;

    // 检查场上是否有 BOSS 且生命值跌破 50%
    const enemies = scene.enemyManager.getAliveEnemies();
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.isBoss && !this.bossEnraged && (e.hp / e.maxHp) <= 0.50) {
        this.triggerBossPhase2(e, scene);
        break;
      }
    }
  }

  /**
   * 触发 BOSS 二阶段狂暴演化
   */
  triggerBossPhase2(boss, scene) {
    this.bossEnraged = true;
    this.bossEnrageFlashTimer = 1.2;

    platform.playSfx('sfx_boom');
    if (scene.combatJuice) {
      scene.combatJuice.addTrauma(0.65);
    }

    // BOSS 属性狂暴增强
    boss.speed = (boss.speed || 40) * 1.35;
    boss.enraged = true;

    if (scene.fx) {
      scene.fx.showBanner('🔥 警告：远古首领进入狂暴相态！', '#FF4D4F', '首领速度提升 35%，释放腐化狂啸，召唤精锐甲虫护卫！', 2.5);
      scene.fx.spawnShockwave(boss.x, boss.y, 220, '#FF4D4F', 0.8);
      scene.fx.spawnParticles(boss.x, boss.y, 20, ['#FF4D4F', '#FFA39E', '#FAAD14'], 25, 60, 0.3, 0.6, 3.5);
    }

    // 召唤两只甲虫护卫
    if (scene.enemyManager && scene.map) {
      const sp = scene.map.spawnPoint || { x: 32, y: 32 };
      scene.enemyManager.spawnEnemy('beetle', sp.x, sp.y, scene.map.groundRoute);
      scene.enemyManager.spawnEnemy('swift', sp.x - 20, sp.y, scene.map.groundRoute);
    }
  }

  /**
   * 绘制战功达成弹窗与狂暴滤镜
   */
  render(ctx) {
    // 1. BOSS 狂暴暗红震慑滤镜
    if (this.bossEnrageFlashTimer > 0) {
      ctx.save();
      const alpha = Math.sin((this.bossEnrageFlashTimer / 1.2) * Math.PI) * 0.22;
      ctx.fillStyle = 'rgba(255, 30, 30, ' + alpha + ')';
      ctx.fillRect(0, 0, 960, 540);
      ctx.restore();
    }

    // 2. 战功横幅勋章
    if (this.activeBanner && this.bannerTimer > 0) {
      const bannerW = 380;
      const bannerH = 46;
      const bx = 480 - bannerW * 0.5;
      const by = 86;

      ctx.save();
      ctx.fillStyle = 'rgba(25, 20, 14, 0.94)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bannerW, bannerH, 8) : ctx.rect(bx, by, bannerW, bannerH);
      ctx.fill();

      // 金色高光边框
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 标题
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px "Cinzel", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.activeBanner.title, 480, by + 18);

      // 描述
      ctx.fillStyle = '#FFE58F';
      ctx.font = '11px "Microsoft YaHei", sans-serif';
      ctx.fillText(this.activeBanner.sub, 480, by + 34);
      ctx.restore();
    }
  }
}

module.exports = TacticalFeatsSystem;
