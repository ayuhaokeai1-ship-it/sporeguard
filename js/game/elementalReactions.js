/**
 * Sporeguard - 元素共鸣与元素反应系统 (Elemental Reaction & Resonance System)
 * 深度融合自然法则：林木真菌(Dendro)、甘霖流水(Hydro)、雷木电弧(Electro)、炽烈熔火(Pyro)、玄冰霜雾(Cryo)、瘴气剧毒(Toxic)
 * 借鉴 Genshin / Hades / Kingdom Rush 的深度战术连携机制
 */

const platform = require('../core/platform');
const PALETTE = require('../data/palette');

class ElementalReactionSystem {
  constructor() {
    this.activeReactions = [];
    this.floatingBanners = [];
    this.chainArcs = [];
    this.stats = {
      totalReactions: 0,
      reactionDamage: 0,
      reactionCounts: {
        wildfire: 0,
        superconduct: 0,
        freeze: 0,
        detonation: 0,
        photosynthesis: 0,
        corrosion: 0
      }
    };
  }

  /**
   * 重置当前关卡元素状态
   */
  reset() {
    this.activeReactions.length = 0;
    this.floatingBanners.length = 0;
    this.chainArcs.length = 0;
  }

  /**
   * 对目标敌人施加元素并检测元素反应
   * @param {Object} enemy 目标敌人
   * @param {string} element 'pyro'|'hydro'|'electro'|'cryo'|'dendro'|'toxic'
   * @param {number} baseDmg 触发伤害
   * @param {Object} scene 战局场景上下文
   * @returns {Object|null} 反应结果
   */
  applyElement(enemy, element, baseDmg, scene) {
    if (!enemy || enemy.hp <= 0 || enemy.state === 'death') return null;

    if (!enemy.elementalAuras) {
      enemy.elementalAuras = {
        pyro: 0,
        hydro: 0,
        electro: 0,
        cryo: 0,
        dendro: 0,
        toxic: 0
      };
    }

    const auras = enemy.elementalAuras;
    let reactionResult = null;

    // 1. 【蔓延烈焰 Wildfire】: 烈火(Pyro) + 真菌草木(Dendro)
    if ((element === 'pyro' && auras.dendro > 0) || (element === 'dendro' && auras.pyro > 0)) {
      auras.dendro = 0;
      auras.pyro = 0;
      reactionResult = this.triggerWildfire(enemy, baseDmg, scene);
    }
    // 2. 【超导电弧 Superconduct Arc】: 甘霖水泽(Hydro) + 惊雷电弧(Electro)
    else if ((element === 'hydro' && auras.electro > 0) || (element === 'electro' && auras.hydro > 0)) {
      auras.hydro = 0;
      auras.electro = 0;
      reactionResult = this.triggerSuperconduct(enemy, baseDmg, scene);
    }
    // 3. 【极寒冰华 Glacial Freeze】: 甘霖水泽(Hydro) + 霜雾玄冰(Cryo)
    else if ((element === 'hydro' && auras.cryo > 0) || (element === 'cryo' && auras.hydro > 0)) {
      auras.hydro = 0;
      auras.cryo = 0;
      reactionResult = this.triggerGlacialFreeze(enemy, baseDmg, scene);
    }
    // 4. 【剧毒粉尘爆轰 Volatile Detonation】: 烈火(Pyro) + 瘴气剧毒(Toxic)
    else if ((element === 'pyro' && auras.toxic > 0) || (element === 'toxic' && auras.pyro > 0)) {
      auras.pyro = 0;
      auras.toxic = 0;
      reactionResult = this.triggerToxicDetonation(enemy, baseDmg, scene);
    }
    // 5. 【光合充能 Photosynthesis Surge】: 甘霖水泽(Hydro) + 真菌草木(Dendro)
    else if ((element === 'hydro' && auras.dendro > 0) || (element === 'dendro' && auras.hydro > 0)) {
      auras.hydro = 0;
      auras.dendro = 0;
      reactionResult = this.triggerPhotosynthesis(enemy, baseDmg, scene);
    }
    // 6. 【腐蚀破甲 Corrosion Rupture】: 惊雷(Electro) + 剧毒(Toxic)
    else if ((element === 'electro' && auras.toxic > 0) || (element === 'toxic' && auras.electro > 0)) {
      auras.electro = 0;
      auras.toxic = 0;
      reactionResult = this.triggerCorrosion(enemy, baseDmg, scene);
    }
    // 未发生反应，附着该元素并维持 6.0 秒
    else {
      auras[element] = 6.0;
    }

    return reactionResult;
  }

  /**
   * 反应 1：蔓延烈焰
   */
  triggerWildfire(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.6 + 60);
    this.recordReaction('wildfire', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'fire');
    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `🔥蔓延烈焰! -${dmg}`, '#FF4D4F');
      scene.fx.spawnRing(enemy.x, enemy.y, 65, '#FF7A45', 0.45);
    }
    platform.playSfx('sfx_boom');

    // 溅射点燃周围 80px 内所有敌军
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < list.length; i++) {
        const other = list[i];
        if (other !== enemy && Math.hypot(other.x - enemy.x, other.y - enemy.y) <= 80) {
          other.burnTimer = 4.0;
          other.burnDps = 25;
          other.takeDamage(Math.round(dmg * 0.5), null, 'fire');
        }
      }
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 蔓延烈焰 ✦', '#FF7A45');
    return { name: 'wildfire', damage: dmg };
  }

  /**
   * 反应 2：超导电弧 (连锁闪电)
   */
  triggerSuperconduct(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.5 + 80);
    this.recordReaction('superconduct', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'shock');
    enemy.armorReduction = Math.max(enemy.armorReduction || 0, 0.40); // 削减 40% 护甲
    platform.playSfx('sfx_shock');

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `⚡超导电弧! -${dmg}`, '#40A9FF');
      scene.fx.spawnRing(enemy.x, enemy.y, 75, '#69C0FF', 0.4);
    }

    // 寻找最多 4 个最近敌人连锁跳跃
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies().filter(e => e !== enemy);
      list.sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y));
      const jumps = Math.min(4, list.length);
      let lastX = enemy.x, lastY = enemy.y;

      for (let j = 0; j < jumps; j++) {
        const next = list[j];
        const chainDmg = Math.round(dmg * (0.85 - j * 0.15));
        next.takeDamage(chainDmg, null, 'shock');
        next.armorReduction = 0.35;

        // 记录电弧视觉渲染链
        this.chainArcs.push({
          x1: lastX,
          y1: lastY,
          x2: next.x,
          y2: next.y,
          life: 0.30,
          maxLife: 0.30
        });

        lastX = next.x;
        lastY = next.y;
      }
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 超导电弧 ✦', '#40A9FF');
    return { name: 'superconduct', damage: dmg };
  }

  /**
   * 反应 3：极寒冰华 (深度冰冻与碎冰斩)
   */
  triggerGlacialFreeze(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.4 + 50);
    this.recordReaction('freeze', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'frost');
    enemy.freezeTimer = 2.8; // 完全冰冻 2.8 秒
    enemy.isDeepFrozen = true;
    platform.playSfx('sfx_mist');

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `❄️极寒冰华! 深度冰冻`, '#36CFC9');
      scene.fx.spawnRing(enemy.x, enemy.y, 60, '#87E8DE', 0.5);
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 极寒冰华 ✦', '#36CFC9');
    return { name: 'freeze', damage: dmg };
  }

  /**
   * 反应 4：剧毒粉尘爆轰
   */
  triggerToxicDetonation(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 2.0 + 120);
    this.recordReaction('detonation', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'poison');
    platform.playSfx('sfx_boom');

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `💥剧毒粉尘爆轰! -${dmg}`, '#A0D911');
      scene.fx.spawnRing(enemy.x, enemy.y, 90, '#BAE637', 0.55);
      scene.fx.triggerScreenShake(4.0, 0.35);
    }

    // 生成范围腐蚀酸雾陷阱
    if (scene && scene.bulletManager) {
      scene.bulletManager.spawnHazard({
        kind: 'acid',
        x: enemy.x,
        y: enemy.y,
        radiusPx: 55,
        duration: 5.0,
        dps: 45
      });
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 剧毒爆轰 ✦', '#A0D911');
    return { name: 'detonation', damage: dmg };
  }

  /**
   * 反应 5：光合充能 (海量金孢子爆发与全图自然共振)
   */
  triggerPhotosynthesis(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.2 + 40);
    this.recordReaction('photosynthesis', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'nature');
    platform.playSfx('sfx_coin');

    // 散落 12 颗黄金高阶能量孢子
    if (scene && scene.sporeDropManager) {
      scene.sporeDropManager.spawnSporeBurst(enemy.x, enemy.y, 12, true);
    }

    // 强化周围 120px 防御塔 6 秒内攻击速度 +35%
    if (scene && scene.towerManager) {
      const tws = scene.towerManager.towers;
      for (let i = 0; i < tws.length; i++) {
        const t = tws[i];
        if (Math.hypot(t.x - enemy.x, t.y - enemy.y) <= 120) {
          t.superchargeTimer = Math.max(t.superchargeTimer || 0, 6.0);
        }
      }
    }

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `✨光合充能! +孢子超频`, '#FFD666');
      scene.fx.spawnRing(enemy.x, enemy.y, 80, '#FFF566', 0.5);
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 光合充能 ✦', '#FFD666');
    return { name: 'photosynthesis', damage: dmg };
  }

  /**
   * 反应 6：腐蚀破甲
   */
  triggerCorrosion(enemy, baseDmg, scene) {
    const dmg = Math.round(baseDmg * 1.5 + 75);
    this.recordReaction('corrosion', dmg);

    enemy.takeDamage(dmg, scene ? scene.fx : null, 'shock');
    enemy.armorReduction = 0.60; // 破甲 60%
    enemy.poisonTimer = 5.0;
    enemy.poisonDps = 35;
    platform.playSfx('sfx_thorn');

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(enemy.x), Math.round(enemy.y - 18), `☠️腐蚀破甲! -60%护甲`, '#B37FEB');
      scene.fx.spawnRing(enemy.x, enemy.y, 70, '#D3ADF7', 0.45);
    }

    this.addFloatingBanner(enemy.x, enemy.y - 32, '✦ 腐蚀破甲 ✦', '#B37FEB');
    return { name: 'corrosion', damage: dmg };
  }

  recordReaction(type, dmg) {
    this.stats.totalReactions++;
    this.stats.reactionDamage += dmg;
    if (this.stats.reactionCounts[type] !== undefined) {
      this.stats.reactionCounts[type]++;
    }
  }

  addFloatingBanner(x, y, text, color) {
    this.floatingBanners.push({
      x,
      y,
      text,
      color,
      timer: 0,
      duration: 1.1,
      vy: -22
    });
  }

  update(dt, scene) {
    // 1. 更新电弧连线生命周期
    for (let i = this.chainArcs.length - 1; i >= 0; i--) {
      const arc = this.chainArcs[i];
      arc.life -= dt;
      if (arc.life <= 0) {
        this.chainArcs.splice(i, 1);
      }
    }

    // 2. 更新悬浮反应徽标
    for (let i = this.floatingBanners.length - 1; i >= 0; i--) {
      const b = this.floatingBanners[i];
      b.timer += dt;
      b.y += b.vy * dt;
      b.vy += 12 * dt; // 减速上升
      if (b.timer >= b.duration) {
        this.floatingBanners.splice(i, 1);
      }
    }

    // 3. 衰减敌军身上的元素附着
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (e.elementalAuras) {
          const a = e.elementalAuras;
          if (a.pyro > 0) a.pyro = Math.max(0, a.pyro - dt);
          if (a.hydro > 0) a.hydro = Math.max(0, a.hydro - dt);
          if (a.electro > 0) a.electro = Math.max(0, a.electro - dt);
          if (a.cryo > 0) a.cryo = Math.max(0, a.cryo - dt);
          if (a.dendro > 0) a.dendro = Math.max(0, a.dendro - dt);
          if (a.toxic > 0) a.toxic = Math.max(0, a.toxic - dt);
        }

        // 深度冰冻状态检测
        if (e.freezeTimer > 0) {
          e.freezeTimer -= dt;
          if (e.freezeTimer <= 0) {
            e.isDeepFrozen = false;
          }
        }
      }
    }
  }

  render(ctx, animTimeSec) {
    // 1. 渲染超导电弧自然闪电链条
    if (this.chainArcs.length > 0) {
      ctx.save();
      for (let i = 0; i < this.chainArcs.length; i++) {
        const arc = this.chainArcs[i];
        const alpha = Math.max(0, arc.life / arc.maxLife);
        ctx.strokeStyle = `rgba(105, 192, 255, ${alpha * 0.9})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);

        // 闪电折线抖动
        const midX = (arc.x1 + arc.x2) * 0.5 + (Math.random() - 0.5) * 16;
        const midY = (arc.y1 + arc.y2) * 0.5 + (Math.random() - 0.5) * 16;
        ctx.lineTo(midX, midY);
        ctx.lineTo(arc.x2, arc.y2);
        ctx.stroke();

        // 核心白亮光
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);
        ctx.lineTo(midX, midY);
        ctx.lineTo(arc.x2, arc.y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. 渲染元素反应华丽悬浮称号徽标
    if (this.floatingBanners.length > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < this.floatingBanners.length; i++) {
        const b = this.floatingBanners[i];
        const prog = b.timer / b.duration;
        const alpha = prog < 0.2 ? (prog / 0.2) : (1 - (prog - 0.2) / 0.8);
        const scale = prog < 0.2 ? (0.6 + (prog / 0.2) * 0.4) : (1.0 + (prog - 0.2) * 0.15);

        ctx.save();
        ctx.translate(Math.round(b.x), Math.round(b.y));
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        // 黑色柔和底光
        ctx.font = 'bold 13px "Microsoft YaHei UI", "PingFang SC", sans-serif';
        ctx.strokeStyle = 'rgba(15, 20, 18, 0.92)';
        ctx.lineWidth = 3.2;
        ctx.strokeText(b.text, 0, 0);

        // 华丽元素色
        ctx.fillStyle = b.color;
        ctx.fillText(b.text, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }
  }
}

module.exports = ElementalReactionSystem;
