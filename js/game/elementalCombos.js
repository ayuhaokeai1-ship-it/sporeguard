/**
 * 自然奇幻·元素裂变与深层连携反应系统 (js/game/elementalCombos.js)
 * 深度汲取《原神》元素交融反应与《哈迪斯》双重祝福 (Duo Boons) 机制：
 * 
 * 6 大高阶自然元素连携反应 (Elemental Combos Matrix):
 * 1. 【腐殖剧毒 (Miasmic Corrosion)】 = 木属性破甲 (Watch) + 毒瘴水雾 (Mist)
 *    - 效果：融毁敌怪 80% 护甲，瞬间引爆腐蚀毒雾，以目标为中心造成 160 点腐殖真实伤害，并向周围 80px 溅射毒瘴。
 * 2. 【蒸气爆鸣 (Steam Overpressure)】 = 熔金炽炎 (Burst) + 潮湿水雾 (Mist)
 *    - 效果：水火交融引发高压气化冲击波，造成 220 点范围汽化冲击，并将轻型与中型敌怪猛烈震退 40px！
 * 3. 【炽热荆棘 (Blazing Bramble)】 = 坚韧地刺 (Thorn) + 熔金炽炎 (Burst)
 *    - 效果：荆棘被烈火引燃，化作焦土尖刺地带，处于其中的敌怪移动受阻 60%，每 0.5s 承受 35 点炽炎灼烧持续 4 秒。
 * 4. 【圣光涤罪 (Solar Superconduct)】 = 天穹神光 (Lumina) + 任意已触发反应
 *    - 效果：太阳神光引发光能超导，致盲全场受波及敌怪 2.5 秒，使其攻击落空且移动停滞，并额外喷发 12 颗黄金孢子！
 * 5. 【霜冻凋零 (Glacial Frostbite)】 = 寒霜凝结 (Mist A3) + 贯穿钢刺 (Thorn)
 *    - 效果：凝结寒冰碎屑扎入伤口，直接冰封目标 3.0 秒（完全冻结，无法移动与释放技能）。
 * 6. 【天人合一·自然大共鸣 (Grand Nature Resonance)】 = 3种及以上元素同时交汇
 *    - 效果：引动森林地脉终极能量，全屏爆发青翠翡翠光环，全屏所有敌怪承受 380 点自然神罚，并定身 3 秒！
 * 
 * 100% 拒绝任何矢量直线，全部采用 AI 原生粒子与光晕精灵渲染！
 */

const CONFIG = require('../data/config');
const platform = require('../core/platform');

class ElementalComboEngine {
  constructor() {
    this.activeCombos = [];
    this.comboHistory = [];
    this.totalCombosTriggered = 0;
    this.animTime = 0;

    // 活跃连携冲击波与焦土区域
    this.blazingBrambles = [];
    this.steamShockwaves = [];
  }

  clear() {
    this.activeCombos.length = 0;
    this.blazingBrambles.length = 0;
    this.steamShockwaves.length = 0;
  }

  /**
   * 当防御塔子弹或技能命中敌人时检测元素交融反应
   * @param {Object} enemy 命中的目标
   * @param {String} element 新附加的元素类别 ('wood' | 'poison' | 'fire' | 'light' | 'earth' | 'frost')
   * @param {Object} enemyManager 敌人管理器
   * @param {Object} economy 经济管理器
   * @param {Object} fx 视觉特效管理器
   * @param {Object} combatJuice 屏幕打击感震颤
   */
  checkCombo(enemy, element, enemyManager, economy, fx = null, combatJuice = null) {
    if (!enemy || enemy.hp <= 0 || enemy.state === 'death') return null;

    if (!enemy.elementAfflictions) {
      enemy.elementAfflictions = {
        wood: 0,
        poison: 0,
        fire: 0,
        light: 0,
        earth: 0,
        frost: 0
      };
    }

    // 记录已有元素状态
    const aff = enemy.elementAfflictions;
    const hadWood = aff.wood > 0;
    const hadPoison = aff.poison > 0;
    const hadFire = aff.fire > 0;
    const hadLight = aff.light > 0;
    const hadEarth = aff.earth > 0;
    const hadFrost = aff.frost > 0;

    // 每名敌人保留 2.6 秒连携内置冷却，避免高频攻速下无限瞬发爆破/刷孢子
    if (enemy._comboCd && enemy._comboCd > 0) {
      aff[element] = Math.max(aff[element] || 0, 4.0);
      return null;
    }

    // 刷新当前元素存留时间 (4.5s 附着窗口)
    aff[element] = 4.5;

    let comboTriggered = null;

    // 1. 【腐殖剧毒 (Miasmic Corrosion)】: wood + poison
    if ((element === 'wood' && hadPoison) || (element === 'poison' && hadWood)) {
      aff.wood = 0; aff.poison = 0;
      comboTriggered = this.triggerCorrosion(enemy, enemyManager, fx, combatJuice);
    }
    // 2. 【蒸气爆鸣 (Steam Overpressure)】: fire + poison/mist
    else if ((element === 'fire' && hadPoison) || (element === 'poison' && hadFire)) {
      aff.fire = 0; aff.poison = 0;
      comboTriggered = this.triggerSteamOverpressure(enemy, enemyManager, fx, combatJuice);
    }
    // 3. 【炽热荆棘 (Blazing Bramble)】: earth + fire
    else if ((element === 'fire' && hadEarth) || (element === 'earth' && hadFire)) {
      aff.fire = 0; aff.earth = 0;
      comboTriggered = this.triggerBlazingBramble(enemy, enemyManager, fx, combatJuice);
    }
    // 4. 【霜冻凋零 (Glacial Frostbite)】: frost + wood/earth
    else if ((element === 'frost' && (hadWood || hadEarth)) || ((element === 'wood' || element === 'earth') && hadFrost)) {
      aff.frost = 0; aff.wood = 0; aff.earth = 0;
      comboTriggered = this.triggerFrostbite(enemy, enemyManager, fx, combatJuice);
    }
    // 5. 【圣光涤罪 (Solar Superconduct)】: light + (wood/poison/fire/earth)
    else if (element === 'light' && (hadWood || hadPoison || hadFire || hadEarth)) {
      aff.light = 0;
      if (hadWood) aff.wood = 0;
      else if (hadPoison) aff.poison = 0;
      else if (hadFire) aff.fire = 0;
      else if (hadEarth) aff.earth = 0;
      comboTriggered = this.triggerSolarSuperconduct(enemy, enemyManager, economy, fx, combatJuice);
    }

    if (comboTriggered) {
      enemy._comboCd = 2.6;
    }

    // 6. 检测【自然大共鸣 (Grand Resonance)】: 3种以上元素同时附着
    let activeElemCount = 0;
    for (const k in aff) {
      if (aff[k] > 0) activeElemCount++;
    }
    if (activeElemCount >= 3) {
      this.triggerGrandResonance(enemy, enemyManager, fx, combatJuice);
      enemy._comboCd = 3.2;
      // 清空附着元素，防止无限连锁
      for (const k in aff) aff[k] = 0;
    }

    if (comboTriggered) {
      this.totalCombosTriggered++;
      this.comboHistory.push({
        id: comboTriggered.id,
        name: comboTriggered.name,
        time: this.animTime,
        x: enemy.x,
        y: enemy.y
      });
      if (this.comboHistory.length > 20) this.comboHistory.shift();
    }

    return comboTriggered;
  }

  /**
   * 1. 触发【腐殖剧毒】
   */
  triggerCorrosion(enemy, enemyManager, fx, combatJuice) {
    enemy.baseArmor = Math.max(0, enemy.baseArmor * 0.2); // 削减 80% 护甲
    enemy.armorReduction = Math.max(enemy.armorReduction || 0, 8.0);
    const splashDmg = 160;

    // 范围溅射
    const alive = enemyManager.getAliveEnemies();
    for (let i = 0; i < alive.length; i++) {
      const e = alive[i];
      if (Math.hypot(e.x - enemy.x, e.y - enemy.y) <= 85) {
        e.hp -= splashDmg;
        e.residualSlowTimer = Math.max(e.residualSlowTimer || 0, 3.0);
        e.residualSlowValue = Math.max(e.residualSlowValue || 0, 0.40);
        if (e.hp <= 0) enemyManager.killEnemy(e, fx);
      }
    }

    if (fx) {
      fx.spawnFloatingText(enemy.x, enemy.y - 24, '腐殖剧毒!', '#52C41A', 1.15);
      fx.spawnParticles(enemy.x, enemy.y, 28, ['#52C41A', '#73D13D', '#13C2C2', '#389E0D'], 35, 120, 0.3, 0.7, 4.5);
    }
    if (combatJuice) combatJuice.addTrauma(0.28);
    platform.playSfx('sfx_bomb');
    return { id: 'corrosion', name: '腐殖剧毒' };
  }

  /**
   * 2. 触发【蒸气爆鸣】
   */
  triggerSteamOverpressure(enemy, enemyManager, fx, combatJuice) {
    const shockDmg = 220;
    const cx = enemy.x;
    const cy = enemy.y;

    // 记录视觉震荡波
    this.steamShockwaves.push({
      x: cx,
      y: cy,
      radius: 20,
      maxRadius: 110,
      life: 0.45,
      maxLife: 0.45
    });

    // 强力击退
    const alive = enemyManager.getAliveEnemies();
    for (let i = 0; i < alive.length; i++) {
      const e = alive[i];
      const d = Math.hypot(e.x - cx, e.y - cy);
      if (d <= 110) {
        e.hp -= shockDmg;
        // 若非大型 Boss，施加 35px 沿路径后退
        if (!e.isBoss) {
          e.distPx = Math.max(0, e.distPx - 35);
        }
        if (e.hp <= 0) enemyManager.killEnemy(e, fx);
      }
    }

    if (fx) {
      fx.spawnFloatingText(cx, cy - 28, '蒸气爆鸣!', '#FF7A45', 1.15);
      fx.spawnParticles(cx, cy, 32, ['#FFF1B8', '#FF7A45', '#1890FF', '#FFFFFF'], 40, 140, 0.3, 0.75, 5);
    }
    if (combatJuice) combatJuice.addTrauma(0.40);
    platform.playSfx('sfx_shock');
    return { id: 'steam', name: '蒸气爆鸣' };
  }

  /**
   * 3. 触发【炽热荆棘】
   */
  triggerBlazingBramble(enemy, enemyManager, fx, combatJuice) {
    const cx = enemy.x;
    const cy = enemy.y;

    this.blazingBrambles.push({
      x: cx,
      y: cy,
      radius: 65,
      life: 4.0,
      maxLife: 4.0,
      tickTimer: 0
    });

    if (fx) {
      fx.spawnFloatingText(cx, cy - 24, '炽热荆棘!', '#FA541C', 1.15);
      fx.spawnParticles(cx, cy, 26, ['#FA541C', '#FFD666', '#52C41A', '#8C6842'], 30, 95, 0.25, 0.6, 4);
    }
    if (combatJuice) combatJuice.addTrauma(0.25);
    platform.playSfx('sfx_bomb');
    return { id: 'bramble', name: '炽热荆棘' };
  }

  /**
   * 4. 触发【霜冻凋零】
   */
  triggerFrostbite(enemy, enemyManager, fx, combatJuice) {
    enemy.isFrozen = true;
    enemy.freezeTimer = 3.0;
    enemy.residualSlowTimer = 3.5;
    enemy.residualSlowValue = 0.95;

    if (fx) {
      fx.spawnFloatingText(enemy.x, enemy.y - 24, '霜冻冰封!', '#13C2C2', 1.15);
      fx.spawnParticles(enemy.x, enemy.y, 24, ['#E6F7FF', '#BAE7FF', '#69C0FF', '#FFFFFF'], 25, 80, 0.25, 0.55, 3.5);
    }
    if (combatJuice) combatJuice.addTrauma(0.20);
    platform.playSfx('sfx_laser');
    return { id: 'frostbite', name: '霜冻凋零' };
  }

  /**
   * 5. 触发【圣光涤罪】
   */
  triggerSolarSuperconduct(enemy, enemyManager, economy, fx, combatJuice) {
    const cx = enemy.x;
    const cy = enemy.y;

    // 战术微额孢子回馈 (+4，内置冷却限制防止无限刷钱)
    if (economy) {
      economy.addSpores(4);
    }

    // 致盲 1.6 秒
    const alive = enemyManager.getAliveEnemies();
    for (let i = 0; i < alive.length; i++) {
      const e = alive[i];
      if (Math.hypot(e.x - cx, e.y - cy) <= 105) {
        e.isBlind = true;
        e.blindTimer = 1.6;
        e.activeSlow = Math.max(e.activeSlow || 0, 0.45);
      }
    }

    if (fx) {
      fx.spawnFloatingText(cx, cy - 30, '圣光 +4孢', '#FFD700', 1.1);
      fx.spawnParticles(cx, cy, 24, ['#FFD700', '#FFF1B8', '#FFE58F', '#FFFFFF'], 40, 130, 0.3, 0.65, 4.5);
    }
    if (combatJuice) combatJuice.addTrauma(0.25);
    platform.playSfx('sfx_coin');
    return { id: 'solar', name: '圣光涤罪' };
  }

  /**
   * 6. 触发【天人合一·自然大共鸣】
   */
  triggerGrandResonance(primaryEnemy, enemyManager, fx, combatJuice) {
    const allAlive = enemyManager.getAliveEnemies();
    const cx = primaryEnemy ? primaryEnemy.x : 320;
    const cy = primaryEnemy ? primaryEnemy.y : 240;
    const grandDmg = 155;

    for (let i = 0; i < allAlive.length; i++) {
      const e = allAlive[i];
      if (Math.hypot(e.x - cx, e.y - cy) > 140) continue;
      e.hp -= grandDmg;
      e.isRooted = true;
      e.rootTimer = 1.6;
      e.residualSlowTimer = 2.0;
      e.residualSlowValue = 0.65;
      if (e.hp <= 0) enemyManager.killEnemy(e, fx);
    }

    if (fx) {
      fx.spawnFloatingText(cx, cy - 28, '自然共鸣!', '#52C41A', 1.2);
      fx.spawnParticles(cx, cy, 42, ['#52C41A', '#FFD700', '#13C2C2', '#BAE7FF'], 60, 220, 0.4, 0.9, 5.5);
    }
    if (combatJuice) combatJuice.addTrauma(0.45);
    platform.playSfx('sfx_win');
  }

  update(dt, enemyManager, fx) {
    this.animTime += dt;

    // 更新焦土灼烧区
    for (let i = this.blazingBrambles.length - 1; i >= 0; i--) {
      const b = this.blazingBrambles[i];
      b.life -= dt;
      b.tickTimer = (b.tickTimer || 0) + dt;

      if (b.tickTimer >= 0.5) {
        b.tickTimer = 0;
        if (enemyManager) {
          const alive = enemyManager.getAliveEnemies();
          for (let e = 0; e < alive.length; e++) {
            const tgt = alive[e];
            if (!tgt.isFlying && Math.hypot(tgt.x - b.x, tgt.y - b.y) <= b.radius) {
              tgt.hp -= 35;
              tgt.residualSlowTimer = Math.max(tgt.residualSlowTimer || 0, 1.0);
              tgt.residualSlowValue = Math.max(tgt.residualSlowValue || 0, 0.60);
              if (tgt.hp <= 0) enemyManager.killEnemy(tgt, fx);
            }
          }
        }
      }

      if (b.life <= 0) this.blazingBrambles.splice(i, 1);
    }

    // 更新蒸气冲击波动画
    for (let i = this.steamShockwaves.length - 1; i >= 0; i--) {
      const s = this.steamShockwaves[i];
      s.life -= dt;
      const prog = 1 - (s.life / s.maxLife);
      s.radius = 20 + prog * (s.maxRadius - 20);
      if (s.life <= 0) this.steamShockwaves.splice(i, 1);
    }

    // 衰减敌怪体内的元素附着时间与连携冷却
    if (enemyManager) {
      const alive = enemyManager.getAliveEnemies();
      for (let i = 0; i < alive.length; i++) {
        if (alive[i]._comboCd > 0) {
          alive[i]._comboCd = Math.max(0, alive[i]._comboCd - dt);
        }
        const aff = alive[i].elementAfflictions;
        if (aff) {
          for (const k in aff) {
            if (aff[k] > 0) aff[k] -= dt;
          }
        }
      }
    }
  }

  render(ctx) {
    // 1. 渲染焦土烈焰荆棘
    const brambleImg = platform.getImage('assets/vfx/range_bramble_red.png');
    for (let i = 0; i < this.blazingBrambles.length; i++) {
      const b = this.blazingBrambles[i];
      const alpha = Math.max(0, b.life / b.maxLife);
      const pulse = 0.85 + Math.sin(this.animTime * 10 + i) * 0.15;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(1.0, 0.72);

      if (brambleImg && brambleImg.width) {
        ctx.globalAlpha = alpha * pulse * 0.70;
        const dSize = b.radius * 2.2;
        ctx.drawImage(brambleImg, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
      } else {
        ctx.globalAlpha = alpha * pulse * 0.35;
        ctx.fillStyle = '#FA541C';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. 渲染蒸气高压扩散波 (Steam Overpressure Shockwave)
    const waveImg = platform.getImage('assets/vfx/range_toxic_acid.png');
    for (let i = 0; i < this.steamShockwaves.length; i++) {
      const s = this.steamShockwaves[i];
      const alpha = Math.max(0, s.life / s.maxLife);

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(1.0, 0.72);

      if (waveImg && waveImg.width) {
        ctx.globalAlpha = alpha * 0.55;
        const dSize = s.radius * 2.0;
        ctx.drawImage(waveImg, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
      } else {
        ctx.globalAlpha = alpha * 0.30;
        ctx.fillStyle = '#BAE7FF';
        ctx.beginPath();
        ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

module.exports = ElementalComboEngine;
