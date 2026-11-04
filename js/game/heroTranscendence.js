/**
 * 远古树灵领袖·登阶超载与神圣天赋树系统 (js/game/heroTranscendence.js)
 * 深度借鉴《Kingdom Rush: Frontiers / Vengeance》与《Bloons TD 6》英雄升级与登阶成长机制：
 * 
 * 1. 领袖四大神圣天赋登阶 (Hero Transcendence Perks):
 *    - Perk 1: 【荆棘缚魂 (Root Prison)】(Lv.2 解锁)
 *      肉搏接怪或顺劈时，50% 概率自地底喷涌出远古荆棘根须定身目标 2.0 秒，并附加持续撕裂流血剧痛 (28 DPS)。
 *    - Perk 2: 【古木磐石 (Ancient Bark & Thorns)】(Lv.3 解锁)
 *      领袖获得全类型伤害 30% 绝对减免，受创时向四周 90px 震荡喷发环形木刺，反弹 25% 真实伤害。
 *    - Perk 3: 【天崩地裂 (Cataclysmic Rupture)】(Lv.4 解锁)
 *      [F] 大招撼地重击范围扩大 45%，并在地面留下 3 道持续 4 秒的灼热地脉熔火裂隙，经行敌怪减速 70% 并承受持续灼烧。
 *    - Perk 4: 【荒野庇护圣域 (Sanctuary of the Wilds)】(Lv.5 解锁)
 *      当生命值低于 35% 时自动引爆翡翠神圣护盾，瞬间治疗 50% 最大生命值，并令周围 3 格内所有蘑菇守卫攻速提升 40%，持续 6 秒。
 * 
 * 2. 战场主动微操战术号令 (Active Tactical Commands):
 *    - [F] 撼地重击 (Earthshaker Quake): 巨幅范围震击，群体眩晕 2.5s。
 *    - [G] 守卫集结战吼 (Rallying Battlecry): 召集全图孢子小守卫瞬移至身边，获得双倍护甲与狂暴暴击。
 *    - [V] 灵脉过载灌注 (Leyline Overload): 选定一座防御塔灌注远古自然神力，使其 8 秒内攻速与射程提升 50%。
 * 
 * 3. 实时战场浮动光冕与战术徽记 (Hero Transcendence HUD & Rune Rings)
 */

const CONFIG = require('../data/config');
const platform = require('../core/platform');

class HeroTranscendence {
  constructor(hero) {
    this.hero = hero;
    this.animTime = 0;
    
    // 登阶天赋状态
    this.perks = {
      rootPrison: { unlocked: false, minLevel: 2, name: '荆棘缚魂', icon: '🌿', desc: '近战命中50%定身2秒+流血撕裂' },
      ancientBark: { unlocked: false, minLevel: 3, name: '古木磐石', icon: '🛡️', desc: '减伤30%且受击反震反弹木刺' },
      cataclysmicRupture: { unlocked: false, minLevel: 4, name: '天崩地裂', icon: '🌋', desc: '大招范围+45%并生成地脉熔隙' },
      sanctuaryWilds: { unlocked: false, minLevel: 5, name: '荒野圣域', icon: '✨', desc: '残血触发神圣屏障自愈+守卫狂暴' }
    };

    // 圣域冷却与持续计时
    this.sanctuaryCooldown = 0;
    this.sanctuaryActiveTimer = 0;

    // 地脉熔隙实体队列 (Cataclysmic Fissures)
    this.fissures = [];

    // 技能战术号令冷却
    this.commandCooldowns = {
      battlecry: 0,
      leylineSurge: 0
    };
  }

  update(dt, enemyManager, sporelingPatrol, towerManager, fx = null) {
    this.animTime += dt;

    // 检查并更新当前英雄等级对应的天赋解锁
    const curLvl = this.hero ? this.hero.level : 1;
    for (const key in this.perks) {
      const perk = this.perks[key];
      if (curLvl >= perk.minLevel && !perk.unlocked) {
        perk.unlocked = true;
        if (fx && this.hero) {
          fx.spawnFloatingText(this.hero.x, this.hero.y - 36, `🌟 天赋登阶: ${perk.name}!`, '#FFD700', 1.3);
          fx.spawnParticles(this.hero.x, this.hero.y, 24, ['#FFD700', '#52C41A', '#BAE7FF', '#FFFFFF'], 35, 110, 0.3, 0.7, 4.5);
        }
        platform.playSfx('sfx_upgrade');
      }
    }

    // 冷却倒计时
    if (this.sanctuaryCooldown > 0) this.sanctuaryCooldown -= dt;
    if (this.commandCooldowns.battlecry > 0) this.commandCooldowns.battlecry -= dt;
    if (this.commandCooldowns.leylineSurge > 0) this.commandCooldowns.leylineSurge -= dt;

    // 荒野圣域持续效果
    if (this.sanctuaryActiveTimer > 0) {
      this.sanctuaryActiveTimer -= dt;
      // 强化周围防御塔
      if (towerManager && this.hero) {
        const hx = this.hero.x;
        const hy = this.hero.y;
        for (let i = 0; i < towerManager.towers.length; i++) {
          const t = towerManager.towers[i];
          if (Math.hypot(t.x - hx, t.y - hy) <= 120) {
            t.superchargeTimer = Math.max(t.superchargeTimer || 0, 1.0);
          }
        }
      }
    }

    // Perk 4 检查：生命低于 35% 自动引爆荒野圣域
    if (this.perks.sanctuaryWilds.unlocked && this.sanctuaryCooldown <= 0 && this.hero) {
      if (this.hero.state !== 'dead' && this.hero.hp < this.hero.maxHp * 0.35) {
        this.triggerSanctuary(fx);
      }
    }

    // 更新地脉熔火裂隙实体
    for (let i = this.fissures.length - 1; i >= 0; i--) {
      const fis = this.fissures[i];
      fis.life -= dt;
      fis.tickTimer = (fis.tickTimer || 0) + dt;

      if (fis.tickTimer >= 0.5) {
        fis.tickTimer = 0;
        if (enemyManager) {
          const alive = enemyManager.getAliveEnemies();
          for (let e = 0; e < alive.length; e++) {
            const tgt = alive[e];
            if (!tgt.isFlying && Math.hypot(tgt.x - fis.x, tgt.y - fis.y) <= fis.radius) {
              tgt.hp -= 26;
              tgt.residualSlowTimer = Math.max(tgt.residualSlowTimer || 0, 1.2);
              tgt.residualSlowValue = Math.max(tgt.residualSlowValue || 0, 0.65);
              if (fx) {
                fx.spawnParticles(tgt.x, tgt.y, 3, ['#FF4D4F', '#FFA940', '#5C4028'], 15, 35, 0.15, 0.3, 2);
              }
              if (tgt.hp <= 0) {
                enemyManager.killEnemy(tgt, fx);
              }
            }
          }
        }
      }

      if (fis.life <= 0) {
        this.fissures.splice(i, 1);
      }
    }
  }

  /**
   * 触发荒野圣域爆发
   */
  triggerSanctuary(fx = null) {
    if (!this.hero) return;
    this.sanctuaryCooldown = 45.0; // 45 秒大招内置冷却
    this.sanctuaryActiveTimer = 6.0;

    const healAmount = Math.round(this.hero.maxHp * 0.50);
    this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + healAmount);

    if (fx) {
      fx.spawnFloatingText(this.hero.x, this.hero.y - 32, `圣域爆发! +${healAmount} HP`, '#73D13D', 1.4);
      fx.spawnParticles(this.hero.x, this.hero.y, 45, ['#52C41A', '#B7EB8F', '#FFD700', '#FFFFFF'], 50, 180, 0.4, 0.9, 6.0);
      if (fx.triggerScreenShake) fx.triggerScreenShake(4.0, 0.4);
    }
    platform.playSfx('sfx_win');
  }

  /**
   * 领袖普攻命中敌人触发登阶被动
   */
  onHeroHitTarget(target, enemyManager, fx = null) {
    if (!target || target.hp <= 0) return;

    // Perk 1: 荆棘缚魂 (Root Prison)
    if (this.perks.rootPrison.unlocked && Math.random() < 0.50) {
      target.isRooted = true;
      target.rootTimer = 2.0;
      target.residualSlowTimer = 2.0;
      target.residualSlowValue = 0.95;
      target.bleedTimer = 2.5;
      target.bleedDps = 28;

      if (fx) {
        fx.spawnFloatingText(target.x, target.y - 16, '荆棘缚魂!', '#52C41A', 0.9);
        fx.spawnParticles(target.x, target.y, 8, ['#52C41A', '#389E0D', '#8C6842'], 18, 45, 0.2, 0.4, 3);
      }
    }
  }

  /**
   * 领袖遭受伤害触发登阶反伤与格挡
   */
  onHeroTakeDamage(rawDamage, enemyManager, fx = null) {
    let finalDamage = rawDamage;

    // Perk 2: 古木磐石 (Ancient Bark & Thorns)
    if (this.perks.ancientBark.unlocked) {
      finalDamage = Math.max(1, Math.round(rawDamage * 0.70)); // 30% 减伤
      const reflectDmg = Math.max(5, Math.round(rawDamage * 0.25));

      if (enemyManager && this.hero) {
        const alive = enemyManager.getAliveEnemies();
        const hx = this.hero.x;
        const hy = this.hero.y;
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i];
          if (!e.isFlying && Math.hypot(e.x - hx, e.y - hy) <= 90) {
            e.hp -= reflectDmg;
            if (fx) {
              fx.spawnParticles(e.x, e.y, 2, ['#8C6842', '#D48806'], 12, 30, 0.15, 0.25, 2);
            }
            if (e.hp <= 0) {
              enemyManager.killEnemy(e, fx);
            }
          }
        }
      }

      if (fx && this.hero) {
        fx.spawnFloatingText(this.hero.x, this.hero.y - 20, '坚毅减免!', '#BAE7FF', 0.7);
      }
    }

    return finalDamage;
  }

  /**
   * [F] 大招撼地重击升级增强：生成地脉熔隙
   */
  onCastEarthshaker(cx, cy, fx = null) {
    if (this.perks.cataclysmicRupture.unlocked) {
      // 呈三叉状喷射 3 处地脉熔火裂隙
      const angles = [0, 2.094, 4.188]; // 0, 120, 240 度
      for (let i = 0; i < angles.length; i++) {
        const ang = angles[i] + Math.random() * 0.4 - 0.2;
        const dist = 48 + Math.random() * 24;
        this.fissures.push({
          x: cx + Math.cos(ang) * dist,
          y: cy + Math.sin(ang) * dist,
          radius: 46,
          life: 4.0,
          maxLife: 4.0,
          tickTimer: 0
        });
      }
      if (fx) {
        fx.spawnFloatingText(cx, cy - 28, '天崩地裂·地脉熔火!', '#FF4D4F', 1.25);
      }
    }
  }

  /**
   * [G] 主动战术号令：守卫集结战吼 (Rallying Battlecry)
   */
  castBattlecry(sporelingPatrol, fx = null) {
    if (this.commandCooldowns.battlecry > 0 || !this.hero || this.hero.state === 'dead') return false;
    this.commandCooldowns.battlecry = 25.0; // 25s 冷却

    if (sporelingPatrol) {
      const hx = this.hero.x;
      const hy = this.hero.y;
      for (let i = 0; i < sporelingPatrol.guards.length; i++) {
        const g = sporelingPatrol.guards[i];
        if (g.state !== 'dead') {
          g.x = hx + (i === 0 ? -22 : 22);
          g.y = hy + 8;
          g.armor += 8;
          g.attackDmg = Math.round(g.attackDmg * 1.6);
          setTimeout(() => {
            g.armor = Math.max(0, g.armor - 8);
            g.attackDmg = Math.round(g.attackDmg / 1.6);
          }, 8000);
        }
      }
    }

    if (fx && this.hero) {
      fx.spawnFloatingText(this.hero.x, this.hero.y - 36, '战吼集结! 全军护卫!', '#FFD700', 1.3);
      fx.spawnParticles(this.hero.x, this.hero.y, 35, ['#FFD700', '#FFA940', '#52C41A', '#FFFFFF'], 40, 140, 0.35, 0.75, 5);
      if (fx.triggerScreenShake) fx.triggerScreenShake(3.0, 0.3);
    }
    platform.playSfx('sfx_horn');
    return true;
  }

  /**
   * [V] 主动战术号令：灵脉过载灌注 (Leyline Overload)
   */
  castLeylineSurge(towerManager, fx = null) {
    if (this.commandCooldowns.leylineSurge > 0 || !this.hero || this.hero.state === 'dead') return false;
    if (!towerManager || towerManager.towers.length === 0) return false;

    // 选取距离英雄最近的防御塔进行超载
    const hx = this.hero.x;
    const hy = this.hero.y;
    let closestTower = null;
    let minDist = 999999;
    for (let i = 0; i < towerManager.towers.length; i++) {
      const t = towerManager.towers[i];
      const d = Math.hypot(t.x - hx, t.y - hy);
      if (d < minDist) {
        minDist = d;
        closestTower = t;
      }
    }

    if (!closestTower) return false;
    this.commandCooldowns.leylineSurge = 30.0; // 30s 冷却
    closestTower.superchargeTimer = 8.0;

    if (fx) {
      fx.spawnFloatingText(closestTower.x, closestTower.y - 24, '灵脉超载! 极速狂暴!', '#69C0FF', 1.3);
      fx.spawnParticles(closestTower.x, closestTower.y, 25, ['#69C0FF', '#BAE7FF', '#FFD700', '#FFFFFF'], 30, 95, 0.3, 0.65, 4);
    }
    platform.playSfx('sfx_shock');
    return true;
  }

  /**
   * 渲染地脉裂隙与圣域光环
   */
  render(ctx) {
    // 1. 渲染地面熔火地脉裂隙
    const fisImg = platform.getImage('assets/vfx/range_earthshaker.png');
    for (let i = 0; i < this.fissures.length; i++) {
      const f = this.fissures[i];
      const alpha = Math.max(0, f.life / f.maxLife);
      const pulse = 0.8 + Math.sin(this.animTime * 8 + i) * 0.2;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(1.0, 0.72); // 倾角透视

      if (fisImg && fisImg.width) {
        ctx.globalAlpha = alpha * pulse * 0.75;
        const dSize = f.radius * 2.2;
        ctx.drawImage(fisImg, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
      } else {
        ctx.globalAlpha = alpha * pulse * 0.40;
        ctx.fillStyle = '#FF4D4F';
        ctx.beginPath();
        ctx.ellipse(0, 0, f.radius, f.radius * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. 荒野圣域爆发期间的流金神圣符文光环
    if (this.sanctuaryActiveTimer > 0 && this.hero && this.hero.state !== 'dead') {
      const sAlpha = Math.min(1.0, this.sanctuaryActiveTimer / 1.0);
      const rot = this.animTime * 1.5;
      const hx = this.hero.x;
      const hy = this.hero.y;

      const auraImg = platform.getImage('assets/vfx/range_fairy_green.png');
      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(1.0, 0.72);
      ctx.rotate(rot);

      if (auraImg && auraImg.width) {
        ctx.globalAlpha = sAlpha * 0.55;
        const aSize = 140;
        ctx.drawImage(auraImg, -aSize * 0.5, -aSize * 0.5, aSize, aSize);
      } else {
        ctx.globalAlpha = sAlpha * 0.25;
        ctx.fillStyle = 'rgba(115, 209, 61, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

module.exports = HeroTranscendence;
