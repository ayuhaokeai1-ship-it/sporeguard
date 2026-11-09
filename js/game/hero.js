/**
 * 奇幻森林守护巨木神树英雄系统 (js/game/hero.js)
 * 远古树人英雄微操、战术姿态与天赋树系统：
 * 
 * 1. 【战术三姿态体系】(Tactical Stances)：
 *    - 🛡️ 守卫姿态 (Guardian Stance): 护甲减免 +35%，最多阻挡 3 名敌军，每秒自然回春愈合 4% 生命
 *    - ⚔️ 狂暴姿态 (Aggressive Stance): 攻速 +30%，挥砍伤害 +35%，普通攻击暴击率 +25%
 *    - 🏹 游侠姿态 (Scout Stance): 移动速度 +45%，索敌射程扩至 180px 并投掷荆棘飞刺进行远程游击
 * 
 * 2. 【四阶专属天赋树】(Talent Tree Branches)：
 *    - Lv.2 尖刺重甲 (Thorns Armor): 受到敌人物理近战攻击时，反弹 45% 割裂物理创伤
 *    - Lv.3 狂风顺劈 (Whirlwind Cleave): 近战普通攻击升级为 65px 范围全周顺劈斩，重创周围所有敌人
 *    - Lv.4 灵脉共鸣 (Leyline Resonance): 大招「大地轰鸣」冷却缩减至 14 秒，震波范围与击晕时长扩增 35%
 *    - Lv.5 不灭战魂 (Undying Will): 受到致命创伤时触发锁血神迹，免疫死亡 4 秒并进入 100% 暴击狂化
 * 
 * 3. 100% AI 手绘高精美术资产接入：
 *    - 英雄本体立绘: assets/vfx/hero_oak.png
 *    - 翡翠月牙剑气: assets/vfx/vfx_hero_slash.png
 *    - 命中暴击星芒: assets/vfx/vfx_hit_spark.png
 *    - 远程荆棘飞刺: assets/vfx/proj_watch_arrow.png
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

class ForestHero {
  constructor(map = null) {
    this.map = map;
    // 初始位置设定在核心防线要冲
    this.x = 280;
    this.y = 230;
    this.targetX = this.x;
    this.targetY = this.y;
    
    // 基础属性与成长
    this.level = 1;
    this.maxLevel = 5;
    this.xp = 0;
    this.xpToNext = 100;
    this.baseMaxHp = 560;
    this.maxHp = this.baseMaxHp;
    this.hp = this.maxHp;
    this.baseAtk = 46;
    this.atkDamage = this.baseAtk;
    this.speed = 110;
    this.atkRange = 46;
    this.atkInterval = 1.05;
    this.atkCooldown = 0;
    
    // 动作与状态机
    this.state = 'idle'; // 'idle' | 'walk' | 'attack' | 'skill' | 'dead'
    this.animTimer = 0;
    this.facingLeft = false;
    
    // 主动大招：大地裂地斩
    this.maxSkillCooldown = 22.0;
    this.skillCooldown = 0; // 初始立即可用
    this.isCastingSkill = false;
    this.skillCastTimer = 0;
    
    // 阵亡与复活
    this.reviveTimeTotal = 14.0;
    this.reviveTimer = 0;
    
    // 阻挡与攻击目标
    this.blockedEnemies = [];
    this.targetEnemy = null;
    
    // 旗帜标记特效
    this.rallyMarkerTimer = 0;
    this.levelUpGlowTimer = 0;
    this.isSelected = false;

    // 经典战术三姿态体系 (Kingdom Rush Stance Micro)
    this.stance = 'guardian'; // 'guardian' | 'aggressive' | 'scout'
    this.stanceSwitchedCount = 0;
    this.regenTimer = 0;
    this.undyingTimer = 0;
    this.undyingUsed = false;
    this.scoutTrapTimer = 0;
    this.rangedThornCooldown = 0;
    
    // 天赋树加点分支
    this.talents = {
      thornsArmor: false,     // Lv.2 尖刺重甲：受到近战攻击反弹 45% 割裂物理创伤
      whirlwindCleave: false, // Lv.3 狂风顺劈：普通攻击造成范围顺劈并波及周围全部敌怪
      leylineResonance: false,// Lv.4 灵脉共鸣：大招冷却缩减至 14 秒，震波范围扩增 35%
      undyingWill: false      // Lv.5 不灭战魂：受到致命创伤时锁血 4 秒并狂化暴击
    };

    // 飞刺投射物队列（游侠姿态远程射击）
    this.activeThornProjectiles = [];
    this.activeTraps = [];            // 游侠巡林隐秘真菌陷阱
    this.activeSpears = [];           // 游侠贯穿金矛飞矢
    this.bloodlustStacks = 0;         // 狂斧杀意叠加层数
    this.bloodlustTimer = 0;          // 杀意消退计时器
    this.brambleShieldHp = 0;         // 石肤荆棘护盾当前吸收值
    this.brambleShieldMax = 320;      // 护盾上限
    this.stanceAbilityCooldown = 0;   // 姿态战术微操冷却
  }

  /**
   * 切换战术战斗姿态
   * @param {'guardian' | 'aggressive' | 'scout'} newStance 
   */
  setStance(newStance, fx = null) {
    if (this.state === 'dead' || this.stance === newStance) return;
    this.stance = newStance;
    this.stanceSwitchedCount++;

    if (newStance === 'guardian') {
      this.speed = 100;
      platform.playSfx('sfx_place');
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 32, '【守卫姿态】磐石坚壁·回春愈合', '#40A9FF', 1.4);
        fx.spawnParticles(this.x, this.y, 22, ['#40A9FF', '#91D5FF', '#BAE7FF', '#FFFFFF'], 30, 85, 0.3, 0.65, 4);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 45, '#40A9FF');
      }
    } else if (newStance === 'aggressive') {
      this.speed = 130;
      platform.playSfx('sfx_hit');
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 32, '【狂暴姿态】攻速+30%·伤害+35%', '#FF4D4F', 1.4);
        fx.spawnParticles(this.x, this.y, 24, ['#FF4D4F', '#FFA39E', '#FF7875', '#FFD700'], 35, 95, 0.35, 0.7, 4.5);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 50, '#FF4D4F');
      }
    } else if (newStance === 'scout') {
      this.speed = 165;
      platform.playSfx('sfx_upgrade');
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 32, '【游侠姿态】神行疾速·荆棘飞刺', '#52C41A', 1.4);
        fx.spawnParticles(this.x, this.y, 22, ['#52C41A', '#95DE64', '#B7EB8F', '#FFE58F'], 35, 100, 0.3, 0.6, 4);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 45, '#52C41A');
      }
    }
  }

  /**
   * 循环切换战斗姿态 (Z 快捷键 / 按钮点击)
   */
  cycleStance(fx = null) {
    const stances = ['guardian', 'aggressive', 'scout'];
    const curIdx = stances.indexOf(this.stance);
    const nextStance = stances[(curIdx + 1) % stances.length];
    this.setStance(nextStance, fx);
    return nextStance;
  }

  /**
   * 指挥英雄移动到指定坐标
   */
  moveTo(x, y, fx = null) {
    if (this.state === 'dead') return;
    this.targetX = Math.max(24, Math.min(936, x));
    this.targetY = Math.max(24, Math.min(516, y));
    this.state = 'walk';
    this.rallyMarkerTimer = 1.2;
    this.unblockAll();

    platform.playSfx('sfx_place');
    if (fx) {
      fx.spawnFloatingText(this.targetX, this.targetY - 18, '集结驻守!', '#FFE58F', 0.9);
      if (fx.spawnRing) fx.spawnRing(this.targetX, this.targetY, 28, '#FFE58F', 0.35, true);
    }
  }

  unblockAll() {
    for (let i = 0; i < this.blockedEnemies.length; i++) {
      const e = this.blockedEnemies[i];
      if (e && e.isBlocked && e.blockedBy === this) {
        e.isBlocked = false;
        e.blockedBy = null;
      }
    }
    this.blockedEnemies = [];
  }

  gainXp(amount, fx = null) {
    if (this.level >= this.maxLevel) return;
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.levelUp(fx);
    }
  }

  levelUp(fx = null) {
    if (this.level >= this.maxLevel) return;
    this.level += 1;
    this.xp -= this.xpToNext;
    this.xpToNext = Math.round(this.xpToNext * 1.45);
    
    // 属性飞跃成长
    this.baseMaxHp = 560 + (this.level - 1) * 110;
    this.maxHp = this.baseMaxHp;
    this.hp = this.maxHp; // 升级瞬间回满生命！
    this.baseAtk = 46 + (this.level - 1) * 18;
    this.atkDamage = this.baseAtk;
    this.levelUpGlowTimer = 2.5;

    // 天赋树阶段解锁
    let talentNotice = '';
    if (this.level === 2) {
      this.talents.thornsArmor = true;
      talentNotice = '解锁天赋【尖刺重甲】受到近战伤害反弹 45% 割裂物理创伤！';
    } else if (this.level === 3) {
      this.talents.whirlwindCleave = true;
      talentNotice = '解锁天赋【狂风顺劈】普通攻击升级为范围顺劈！';
    } else if (this.level === 4) {
      this.talents.leylineResonance = true;
      this.maxSkillCooldown = 14.0;
      talentNotice = '解锁天赋【灵脉共鸣】大招冷却缩至 14 秒，震波扩增 35%！';
    } else if (this.level === 5) {
      this.talents.undyingWill = true;
      talentNotice = '解锁奥义【不灭战魂】致命伤害锁血 4 秒并暴走狂化！';
    }

    platform.playSfx('sfx_upgrade');
    if (fx) {
      fx.spawnFloatingText(this.x, this.y - 36, `英雄进阶! Lv.${this.level}`, '#FFD700', 1.6);
      if (talentNotice) {
        fx.showBanner(`🌳 英雄升至 Lv.${this.level}`, '#FFD700', talentNotice, 2.2);
      }
      fx.spawnParticles(this.x, this.y, 36, ['#FFD700', '#52C41A', '#FFFFFF', '#FFA940'], 45, 130, 0.4, 0.85, 5);
      if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 60, '#FFD700');
    }
  }

  takeDamage(amount, enemy = null, fx = null, enemyManager = null) {
    if (this.state === 'dead') return;

    // 不灭战魂锁血期间完全免死
    if (this.undyingTimer > 0) {
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 20, 'IMMUNE!', '#FFD700', 0.6);
      }
      return;
    }

    // 守卫姿态天然 35% 坚韧硬甲减伤，狂暴姿态承伤 +15%
    let finalDamage = amount;
    if (this.transcendence) {
      finalDamage = this.transcendence.onHeroTakeDamage(finalDamage, enemyManager, fx);
    }
    if (this.stance === 'guardian') {
      finalDamage = Math.max(1, Math.round(amount * 0.65));
    } else if (this.stance === 'aggressive') {
      finalDamage = Math.round(amount * 1.15);
    }

    // 天赋 1：尖刺重甲近战创伤反弹 45%
    if (this.talents.thornsArmor && enemy && enemyManager && enemy.state !== 'death') {
      const reflectDmg = Math.max(8, Math.round(finalDamage * 0.45));
      enemyManager.applyDamage(enemy, reflectDmg, false, 'physical', fx, null);
      if (fx) {
        fx.spawnFloatingText(enemy.x, enemy.y - 14, `刺伤 -${reflectDmg}`, '#52C41A', 0.8);
      }
    }

    this.hp = Math.max(0, this.hp - finalDamage);
    this.gainXp(Math.round(finalDamage * 0.25), fx);

    if (fx) {
      fx.spawnFloatingText(this.x, this.y - 20, `-${finalDamage}`, '#FF4D4F', 0.8);
      fx.spawnParticles(this.x, this.y, 5, ['#FF4D4F', '#FFA39E'], 15, 35, 0.15, 0.25, 2.5);
    }

    if (this.hp <= 0) {
      // 检查天赋 4：不灭战魂触发神圣锁血
      if (this.talents.undyingWill && !this.undyingUsed) {
        this.undyingUsed = true;
        this.undyingTimer = 4.0;
        this.hp = 1;
        platform.playSfx('sfx_thunder');
        if (fx) {
          fx.spawnFloatingText(this.x, this.y - 32, '【不灭战魂】锁血 4 秒!', '#FFD700', 1.8);
          fx.showBanner('🔥 不灭战魂爆发！', '#FFD700', '树灵圣祖意志觉醒，4 秒完全免死且必定暴击！', 2.0);
          fx.spawnParticles(this.x, this.y, 40, ['#FF4D4F', '#FFD700', '#FFFFFF'], 50, 150, 0.4, 0.8, 5);
          if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 75, '#FF4D4F');
        }
        return;
      }

      this.die(fx);
    }
  }

  die(fx = null) {
    this.state = 'dead';
    this.hp = 0;
    this.reviveTimer = this.reviveTimeTotal;
    this.undyingTimer = 0;
    this.unblockAll();

    platform.playSfx('sfx_sell');
    if (fx) {
      fx.spawnFloatingText(this.x, this.y - 28, '守护者力竭... 蓄力复活中', '#D9D9D9', 1.4);
      fx.spawnParticles(this.x, this.y, 20, ['#8C8C8C', '#595959', '#389E0D'], 25, 60, 0.3, 0.6, 3);
    }
  }

  castUltimateSkill(enemyManager, fx = null) {
    if (this.state === 'dead' || this.skillCooldown > 0) return false;
    this.skillCooldown = this.maxSkillCooldown;
    this.isCastingSkill = true;
    this.skillCastTimer = 0.55;
    this.state = 'skill';

    platform.playSfx('sfx_thunder');
    const resonanceBonus = this.talents.leylineResonance ? 1.35 : 1.0;
    const baseRadius = 125 * resonanceBonus;
    const stunDuration = 2.2 * (this.talents.leylineResonance ? 1.3 : 1.0);

    if (fx) {
      fx.triggerScreenShake(6.5, 0.48);
      fx.showBanner('大地裂地斩！', '#FFD700', '古树神力轰鸣四方，全军震慑！', 1.6);
      if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, baseRadius, '#52C41A');
      fx.spawnParticles(this.x, this.y, 52, ['#52C41A', '#FFD700', '#D48806', '#FFFFFF'], 60, 190, 0.35, 0.8, 5.5);
    }

    // 震晕周围敌人并造成超高爆发重创
    if (enemyManager) {
      const alive = enemyManager.getAliveEnemies();
      const skillDmg = Math.round((180 + (this.level - 1) * 60) * (this.stance === 'aggressive' ? 1.25 : 1.0));

      for (let i = 0; i < alive.length; i++) {
        const e = alive[i];
        const dist = Math.hypot(e.x - this.x, e.y - this.y);
        if (dist <= baseRadius) {
          enemyManager.applyDamage(e, skillDmg, false, 'physical', fx, null);
          // 强力定身晕眩
          e.activeSlow = 0.95;
          e.residualSlowValue = 0.85;
          e.residualSlowTimer = stunDuration;
          this.gainXp(25, fx);
        }
      }
    }
    return true;
  }

  /**
   * 触发当前姿态的独占微操神技 (Kingdom Rush Stance Micro Ability)
   */
  castStanceAbility(enemyManager, fx = null) {
    if (this.state === 'dead' || this.stanceAbilityCooldown > 0) return false;
    this.stanceAbilityCooldown = 8.0;

    if (this.stance === 'guardian') {
      this.brambleShieldHp = this.brambleShieldMax;
      platform.playSfx('sfx_upgrade');
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 28, '荆棘玄武壁! 吸收320伤害', '#40A9FF', 1.5);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 75, '#40A9FF');
        fx.spawnParticles(this.x, this.y, 22, ['#40A9FF', '#91D5FF', '#FFFFFF', '#52C41A'], 35, 90, 0.3, 0.65, 4.5);
      }
      return true;
    } else if (this.stance === 'aggressive') {
      platform.playSfx('sfx_hit');
      if (fx) {
        fx.triggerScreenShake(4.0, 0.28);
        fx.spawnFloatingText(this.x, this.y - 28, '狂风乱舞·落叶断空!', '#FF4D4F', 1.4);
        if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 90, '#FF4D4F');
        fx.spawnParticles(this.x, this.y, 35, ['#FF4D4F', '#FFA39E', '#FFD700', '#D4380D'], 50, 160, 0.25, 0.6, 5);
      }
      if (enemyManager) {
        const targets = enemyManager.getAliveEnemies();
        const cleaveDmg = Math.round(this.atkDamage * 2.2);
        for (let i = 0; i < targets.length; i++) {
          const e = targets[i];
          if (!e.isFlying && Math.hypot(e.x - this.x, e.y - this.y) <= 90) {
            enemyManager.applyDamage(e, cleaveDmg, true, 'physical', fx, null);
            e.activeSlow = 0.85;
            e.residualSlowTimer = 2.0;
          }
        }
      }
      return true;
    } else if (this.stance === 'scout') {
      platform.playSfx('sfx_place');
      this.deployScoutTrap(this.x - 18, this.y + 6, fx);
      this.deployScoutTrap(this.x + 18, this.y - 6, fx);
      if (fx) {
        fx.spawnFloatingText(this.x, this.y - 28, '布设隐秘巡林陷阱!', '#52C41A', 1.4);
      }
      return true;
    }
    return false;
  }

  deployScoutTrap(x, y, fx = null) {
    this.activeTraps.push({
      x: x,
      y: y,
      triggerRadius: 24,
      damage: 160 + this.level * 40,
      rootDuration: 3.0,
      lifeTimer: 35.0
    });
    if (fx) {
      fx.spawnParticles(x, y, 8, ['#52C41A', '#B7EB8F', '#FFD700'], 15, 40, 0.2, 0.4, 3);
    }
  }

  throwGoldenSpear(target, fx = null) {
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    this.activeSpears.push({
      x: this.x,
      y: this.y - 12,
      targetEnemy: target,
      angle: angle,
      speed: 460,
      pierceLeft: 3,
      damage: Math.round(this.atkDamage * 1.4)
    });
    platform.playSfx('sfx_shoot');
    if (fx) {
      fx.spawnParticles(this.x, this.y - 12, 6, ['#FFD700', '#52C41A'], 20, 50, 0.15, 0.3, 3);
    }
  }

  update(dt, enemyManager, fx = null) {
    this.animTimer += dt;
    if (this.rallyMarkerTimer > 0) this.rallyMarkerTimer = Math.max(0, this.rallyMarkerTimer - dt);
    if (this.levelUpGlowTimer > 0) this.levelUpGlowTimer = Math.max(0, this.levelUpGlowTimer - dt);
    if (this.skillCooldown > 0) this.skillCooldown = Math.max(0, this.skillCooldown - dt);
    if (this.stanceAbilityCooldown > 0) this.stanceAbilityCooldown = Math.max(0, this.stanceAbilityCooldown - dt);

    // 游侠巡林隐秘真菌地雷更新
    for (let tIdx = this.activeTraps.length - 1; tIdx >= 0; tIdx--) {
      const trap = this.activeTraps[tIdx];
      trap.lifeTimer -= dt;
      if (trap.lifeTimer <= 0) {
        this.activeTraps.splice(tIdx, 1);
        continue;
      }
      if (enemyManager) {
        const alive = enemyManager.getAliveEnemies();
        let triggered = false;
        for (let eIdx = 0; eIdx < alive.length; eIdx++) {
          const e = alive[eIdx];
          if (!e.isFlying && e.state !== 'death' && Math.hypot(e.x - trap.x, e.y - trap.y) <= trap.triggerRadius) {
            triggered = true;
            enemyManager.applyDamage(e, trap.damage, true, 'magic', fx, null);
            e.activeSlow = 0.95;
            e.residualSlowValue = 0.90;
            e.residualSlowTimer = trap.rootDuration;
            if (fx) {
              fx.spawnFloatingText(trap.x, trap.y - 18, '巡林陷阱触发·剧毒缚足!', '#52C41A', 1.3);
              fx.spawnParticles(trap.x, trap.y, 16, ['#52C41A', '#73D13D', '#FFD700'], 35, 80, 0.25, 0.5, 4);
            }
            platform.playSfx('sfx_thorn');
            break;
          }
        }
        if (triggered) {
          this.activeTraps.splice(tIdx, 1);
        }
      }
    }

    // 游侠贯穿金矛弹道更新
    for (let sIdx = this.activeSpears.length - 1; sIdx >= 0; sIdx--) {
      const spr = this.activeSpears[sIdx];
      spr.x += Math.cos(spr.angle) * spr.speed * dt;
      spr.y += Math.sin(spr.angle) * spr.speed * dt;

      if (spr.x < 0 || spr.x > 640 || spr.y < 0 || spr.y > 480) {
        this.activeSpears.splice(sIdx, 1);
        continue;
      }

      if (enemyManager) {
        const alive = enemyManager.getAliveEnemies();
        for (let eIdx = 0; eIdx < alive.length; eIdx++) {
          const e = alive[eIdx];
          if (e.state !== 'death' && Math.hypot(e.x - spr.x, e.y - spr.y) <= 16) {
            enemyManager.applyDamage(e, spr.damage, false, 'pierce', fx, null);
            e.activeSlow = 0.45;
            e.residualSlowTimer = 2.0;
            if (fx) {
              const sparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
              if (sparkImg && sparkImg.width) {
                fx.spawnParticles(spr.x, spr.y, 6, ['#FFD700', '#FFFFFF', '#52C41A'], 20, 60, 0.2, 0.4, 3.5);
              }
            }
            spr.pierceLeft--;
            if (spr.pierceLeft <= 0) {
              this.activeSpears.splice(sIdx, 1);
              break;
            }
          }
        }
      }
    }

    // 不灭战魂狂暴计时器
    if (this.undyingTimer > 0) {
      this.undyingTimer -= dt;
      if (this.undyingTimer <= 0) {
        this.undyingTimer = 0;
        this.hp = Math.round(this.maxHp * 0.25); // 战魂结束后留存 25% 生机，免于暴毙
        if (fx) {
          fx.spawnFloatingText(this.x, this.y - 24, '生机复苏', '#52C41A', 1.0);
        }
      }
    }

    // 阵亡复活逻辑
    if (this.state === 'dead') {
      this.reviveTimer -= dt;
      if (this.reviveTimer <= 0) {
        this.reviveTimer = 0;
        this.hp = this.maxHp;
        this.undyingUsed = false; // 阵亡复活后重置不灭战魂次数
        this.state = 'idle';
        platform.playSfx('sfx_upgrade');
        if (fx) {
          fx.spawnFloatingText(this.x, this.y - 30, '英灵苏醒! 重返战场!', '#52C41A', 1.4);
          fx.spawnParticles(this.x, this.y, 28, ['#52C41A', '#FFD700'], 35, 95, 0.35, 0.65, 4);
        }
      }
      return;
    }

    // 守卫姿态天然生命回春机制（每秒恢复 4% 最大生命值）
    if (this.stance === 'guardian' && this.hp < this.maxHp) {
      this.regenTimer += dt;
      if (this.regenTimer >= 1.0) {
        this.regenTimer = 0;
        const healAmt = Math.max(3, Math.round(this.maxHp * 0.04));
        this.hp = Math.min(this.maxHp, this.hp + healAmt);
        if (fx && Math.random() < 0.4) {
          fx.spawnFloatingText(this.x, this.y - 24, `+${healAmt}`, '#73D13D', 0.7);
        }
      }
    }

    // 释放技能中硬直
    if (this.isCastingSkill) {
      this.skillCastTimer -= dt;
      if (this.skillCastTimer <= 0) {
        this.isCastingSkill = false;
        this.state = 'idle';
      }
      return;
    }

    // 移动寻路逻辑
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distToTarget = Math.hypot(dx, dy);

    if (distToTarget > 6) {
      this.state = 'walk';
      const moveStep = this.speed * dt;
      this.x += (dx / distToTarget) * Math.min(distToTarget, moveStep);
      this.y += (dy / distToTarget) * Math.min(distToTarget, moveStep);
      if (dx < -2) this.facingLeft = true;
      else if (dx > 2) this.facingLeft = false;

      // 行进尘土微粒
      if (Math.random() < 0.25 && fx) {
        fx.spawnParticles(this.x, this.y + 12, 1, ['#8C6842', '#A89265'], 8, 20, 0.15, 0.25, 2);
      }
      return;
    } else {
      if (this.state === 'walk') {
        this.state = 'idle';
      }
    }

    // 游侠姿态：远程荆棘飞刺逻辑 (Scout Ranged Thorns)
    if (this.stance === 'scout') {
      if (this.rangedThornCooldown > 0) this.rangedThornCooldown -= dt;
      if (this.rangedThornCooldown <= 0 && enemyManager) {
        const alive = enemyManager.getAliveEnemies();
        let closest = null;
        let minDist = 180;
        // 优先锁定并拦截空中飞行敌人（飞蛾、蜂群）
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i];
          if (e.state === 'death' || e.isUnderground || !e.isFlying) continue;
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d <= minDist) {
            closest = e;
            minDist = d;
          }
        }
        if (!closest) {
          for (let i = 0; i < alive.length; i++) {
            const e = alive[i];
            if (e.state === 'death' || e.isUnderground) continue;
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d <= minDist) {
              closest = e;
              minDist = d;
            }
          }
        }

        if (closest) {
          this.rangedThornCooldown = 1.4;
          const thornDmg = Math.round(this.atkDamage * 0.95);
          enemyManager.applyDamage(closest, thornDmg, false, 'physical', fx, null);
          platform.playSfx('sfx_watch');
          if (fx) {
            fx.spawnParticles(closest.x, closest.y, 6, ['#52C41A', '#73D13D', '#FFFFFF'], 15, 45, 0.15, 0.3, 2.5);
            fx.spawnFloatingText(closest.x, closest.y - 16, `飞刺 -${thornDmg}`, '#52C41A', 0.7);
          }
        }
      }
    }

    // 地面拦截与阻挡战斗逻辑
    if (this.atkCooldown > 0) this.atkCooldown -= dt;

    if (enemyManager) {
      const alive = enemyManager.getAliveEnemies();
      // 清理已阵亡或超出范围的阻挡目标
      this.blockedEnemies = this.blockedEnemies.filter(e => e.state !== 'death' && Math.hypot(e.x - this.x, e.y - this.y) <= 55);

      // 自动拦截经过身旁的地面敌人（守卫姿态最多阻挡 3 名，其余姿态 2 名）
      const maxBlock = this.stance === 'guardian' ? 3 : 2;
      for (let i = 0; i < alive.length; i++) {
        if (this.blockedEnemies.length >= maxBlock) break;
        const e = alive[i];
        if (e.isFlying || e.isUnderground || e.state === 'death') continue;
        if (e.isBlocked && e.blockedBy !== this) continue;

        const d = Math.hypot(e.x - this.x, e.y - this.y);
        if (d <= this.atkRange && this.blockedEnemies.indexOf(e) === -1) {
          e.isBlocked = true;
          e.blockedBy = this;
          this.blockedEnemies.push(e);
        }
      }

      // 近战挥砍与顺劈逻辑
      if (this.blockedEnemies.length > 0 || alive.length > 0) {
        const potentialTargets = this.blockedEnemies.length > 0 ? this.blockedEnemies : alive.filter(e => !e.isFlying && Math.hypot(e.x - this.x, e.y - this.y) <= this.atkRange);

        if (potentialTargets.length > 0) {
          const mainTarget = potentialTargets[0];
          if (mainTarget.x < this.x) this.facingLeft = true;
          else if (mainTarget.x > this.x) this.facingLeft = false;

          // 姿态攻速修正（狂暴姿态攻速提升 30%）
          const effectiveInterval = this.stance === 'aggressive' ? (this.atkInterval * 0.72) : this.atkInterval;

          if (this.atkCooldown <= 0) {
            this.atkCooldown = effectiveInterval;
            this.state = 'attack';

            platform.playSfx('sfx_hit');

            // 基础伤害计算与姿态加成
            let baseDmg = this.atkDamage;
            let isCrit = false;
            if (this.undyingTimer > 0) {
              isCrit = true; // 不灭战魂期间必暴击！
            } else if (this.stance === 'aggressive') {
              baseDmg = Math.round(baseDmg * 1.35);
              if (Math.random() < 0.28) isCrit = true;
            }

            const finalHitDmg = isCrit ? Math.round(baseDmg * 2.0) : baseDmg;

            // 天赋 2：狂风顺劈波及全周敌人；否则波及最多 2 名
            const maxHits = this.talents.whirlwindCleave ? 5 : (this.stance === 'aggressive' ? 3 : 2);
            const hits = Math.min(maxHits, potentialTargets.length);

            for (let h = 0; h < hits; h++) {
              const target = potentialTargets[h];
              enemyManager.applyDamage(target, finalHitDmg, isCrit, 'physical', fx, null);
            if (this.transcendence) {
              this.transcendence.onHeroHitTarget(target, enemyManager, fx);
            }
              this.gainXp(8, fx);
            }

            if (fx) {
              const slashX = this.x + (this.facingLeft ? -18 : 18);
              const pColors = isCrit ? ['#FF4D4F', '#FFD700', '#FFFFFF'] : ['#FFE58F', '#FFFFFF', '#73D13D'];
              fx.spawnParticles(slashX, this.y - 4, isCrit ? 12 : 7, pColors, 25, 60, 0.15, 0.35, isCrit ? 4.5 : 3);
              if (isCrit) {
                fx.spawnFloatingText(slashX, this.y - 24, '暴击!', '#FF4D4F', 1.1);
              }
            }
          }
        } else {
          this.state = 'idle';
        }
      }
    }
  }

  render(ctx, animTimeSec) {
    // 渲染地面游侠巡林真菌陷阱 (Scout Fungal Traps)
    if (this.activeTraps && this.activeTraps.length > 0) {
      const dewImg = platform.getImage('assets/vfx/prop_dew.png');
      ctx.save();
      for (let t = 0; t < this.activeTraps.length; t++) {
        const tr = this.activeTraps[t];
        const pulse = 0.85 + Math.sin(animTimeSec * 6 + t) * 0.15;
        if (dewImg && dewImg.width) {
          ctx.drawImage(dewImg, tr.x - 10, tr.y - 10, 20, 20);
        } else {
          ctx.fillStyle = 'rgba(82, 196, 26, 0.65)';
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, 6 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(115, 209, 61, ' + (0.5 * pulse) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, tr.triggerRadius * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 渲染空中飞行的游侠贯穿金矛 (Flying Golden Spears)
    if (this.activeSpears && this.activeSpears.length > 0) {
      const spearImg = platform.getImage('assets/vfx/guard_spear.png');
      ctx.save();
      for (let s = 0; s < this.activeSpears.length; s++) {
        const spr = this.activeSpears[s];
        ctx.save();
        ctx.translate(spr.x, spr.y);
        ctx.rotate(spr.angle);
        if (spearImg && spearImg.width) {
          ctx.drawImage(spearImg, -18, -6, 36, 12);
        } else {
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(-12, -2, 24, 4);
        }
        ctx.restore();
      }
      ctx.restore();
    }
    if (this.state === 'dead') {
      // 阵亡休眠：远古树灵休眠古桩（100% AI 手绘青苔灵木古桩）与森林复苏生命光环
      ctx.save();
      // 地面阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 6, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 100% AI 手绘远古古桩立绘
      const stumpImg = platform.getImage('assets/vfx/prop_thunder_stump.png');
      if (stumpImg && stumpImg.width) {
        ctx.save();
        ctx.globalAlpha = 0.88;
        const sW = 38;
        const sH = 30;
        ctx.drawImage(stumpImg, this.x - sW * 0.5, this.y - sH * 0.75, sW, sH);
        ctx.restore();
      } else {
        ctx.fillStyle = '#4A3319';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - 4, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 灵光微粒环绕（休眠树灵呼吸光效）
      const breathPulse = 0.5 + Math.sin(animTimeSec * 4) * 0.35;
      ctx.fillStyle = 'rgba(115, 209, 61, ' + (0.35 * breathPulse) + ')';
      ctx.beginPath();
      ctx.arc(this.x + Math.sin(animTimeSec * 3) * 12, this.y - 12 + Math.cos(animTimeSec * 3) * 6, 3, 0, Math.PI * 2);
      ctx.arc(this.x - Math.sin(animTimeSec * 2.5) * 10, this.y - 8 + Math.sin(animTimeSec * 2.5) * 5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 复活倒计时进度圆环
      const ratio = 1 - (this.reviveTimer / this.reviveTimeTotal);
      ctx.strokeStyle = 'rgba(20, 30, 20, 0.65)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 28, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#52C41A';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 28, 12, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * ratio);
      ctx.stroke();

      // 倒计时文字与复苏光标
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 3;
      ctx.fillText(Math.ceil(this.reviveTimer) + 's', this.x, this.y - 28);
      ctx.shadowBlur = 0;

      ctx.restore();
      return;
    }

    // 1. 集结目的地旗帜指示光圈
    if (this.rallyMarkerTimer > 0) {
      ctx.save();
      const alpha = Math.min(1.0, this.rallyMarkerTimer);
      ctx.strokeStyle = `rgba(255, 229, 143, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(this.targetX, this.targetY, 18, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(82, 196, 26, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(this.targetX, this.targetY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. 英雄脚底战术姿态微光光圈与阴影
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 姿态专属底环光圈
    let stanceColor = 'rgba(64, 169, 255, 0.55)'; // 守卫蓝
    if (this.stance === 'aggressive') stanceColor = 'rgba(255, 77, 79, 0.65)'; // 狂暴红
    else if (this.stance === 'scout') stanceColor = 'rgba(82, 196, 26, 0.55)'; // 游侠绿
    if (this.undyingTimer > 0) stanceColor = 'rgba(255, 215, 0, 0.9)'; // 不灭金

    ctx.strokeStyle = stanceColor;
    ctx.lineWidth = (this.isSelected || this.undyingTimer > 0) ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12, 20, 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (this.isSelected || this.levelUpGlowTimer > 0) {
      ctx.strokeStyle = this.levelUpGlowTimer > 0 ? '#FFD700' : '#73D13D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 12, 24, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. 英雄本体（100% AI 手绘远古橡木树人原画，全生命周期绝无任何矢量褐方块兜底）
    ctx.save();
    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    const walkBob = (this.state === 'walk') ? Math.sin(this.animTimer * 12) * 2.8 : 0;
    const breatheBob = (this.state === 'idle') ? Math.sin(animTimeSec * 3.5) * 1.5 : 0;
    const heroW = 54, heroH = 54;

    ctx.translate(Math.round(this.x), Math.round(this.y - walkBob - breatheBob));
    if (this.facingLeft) ctx.scale(-1, 1);

    // 3.0 战术姿态环绕光环与守护灵气
    if (this.stance === 'guardian') {
      const shieldImg = platform.getImage('assets/vfx/guard_shield.png');
      if (shieldImg && shieldImg.width) {
        ctx.save();
        const rot = animTimeSec * 2.0;
        const orbitX = Math.cos(rot) * 22;
        const orbitY = Math.sin(rot) * 10 - 18;
        ctx.globalAlpha = 0.85;
        ctx.drawImage(shieldImg, orbitX - 10, orbitY - 12, 20, 24);
        ctx.restore();
      }
    } else if (this.stance === 'aggressive') {
      ctx.save();
      const bladeGlint = Math.sin(animTimeSec * 8) * 0.25 + 0.75;
      ctx.globalAlpha = bladeGlint * 0.45;
      const slashVfx = platform.getImage('assets/vfx/vfx_hero_slash.png');
      if (slashVfx && slashVfx.width) {
        ctx.drawImage(slashVfx, -28, -38, 56, 44);
      }
      ctx.restore();
    } else if (this.stance === 'scout') {
      const spearImg = platform.getImage('assets/vfx/guard_spear.png');
      if (spearImg && spearImg.width) {
        ctx.save();
        ctx.translate(-14, -22);
        ctx.rotate(0.35);
        ctx.globalAlpha = 0.90;
        ctx.drawImage(spearImg, -6, -18, 12, 36);
        ctx.restore();
      }
    }

    if (heroImg && heroImg.width) {
      ctx.drawImage(heroImg, -heroW * 0.5, -heroH * 0.82, heroW, heroH);
    } else {
      // 优雅平滑过渡：即使极端网络首帧未解码，也绝对展示神圣金色古树灵种，杜绝一切丑陋方块
      const sporeImg = platform.getImage('assets/vfx/item_golden_spore.png');
      if (sporeImg && sporeImg.width) {
        ctx.drawImage(sporeImg, -16, -26, 32, 32);
      }
    }
    ctx.restore();

    // 3.1 挥砍剑气特效 (100% AI Hand-Painted Emerald Slash Wave)
    if (this.atkCooldown > 0 && (this.atkInterval - this.atkCooldown) < 0.22) {
      const slashProg = (this.atkInterval - this.atkCooldown) / 0.22;
      const slashImg = platform.getImage('assets/vfx/vfx_hero_slash.png');
      if (slashImg && slashImg.width) {
        ctx.save();
        const slashDir = this.facingLeft ? -1 : 1;
        ctx.translate(this.x + slashDir * 20, this.y - 14);
        ctx.scale(slashDir, 1);
        ctx.globalAlpha = Math.max(0, 1 - slashProg * 0.7);
        const slashW = 46 + slashProg * 14;
        const slashH = 40 + slashProg * 10;
        ctx.drawImage(slashImg, -slashW * 0.4, -slashH * 0.5, slashW, slashH);
        ctx.restore();
      }
    }

    // 3.2 大招大地轰鸣双向爆发 (Earthshaker Cleave Wave)
    if (this.isCastingSkill && this.skillCastTimer > 0) {
      const skillProg = 1 - (this.skillCastTimer / 0.55);
      const slashImg = platform.getImage('assets/vfx/vfx_hero_slash.png');
      if (slashImg && slashImg.width) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - skillProg * 0.8);
        const bigW = 72 * (0.8 + skillProg * 0.5);
        const bigH = 64 * (0.8 + skillProg * 0.5);
        // 向左挥斩
        ctx.save();
        ctx.translate(this.x - 28 * (1 + skillProg), this.y - 8);
        ctx.scale(-1, 1);
        ctx.drawImage(slashImg, -bigW * 0.5, -bigH * 0.5, bigW, bigH);
        ctx.restore();
        // 向右挥斩
        ctx.save();
        ctx.translate(this.x + 28 * (1 + skillProg), this.y - 8);
        ctx.drawImage(slashImg, -bigW * 0.5, -bigH * 0.5, bigW, bigH);
        ctx.restore();
        ctx.restore();
      }
    }

    // 4. 生命值条、战术姿态微标与等级徽章
    ctx.save();
    const barW = 38;
    const barH = 5;
    const barX = this.x - barW * 0.5;
    const barY = this.y - 42;

    // 底底黑框
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    // 绿色血条
    const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
    ctx.fillStyle = hpRatio > 0.4 ? '#52C41A' : (hpRatio > 0.2 ? '#FAAD14' : '#FF4D4F');
    ctx.fillRect(barX, barY, Math.round(barW * hpRatio), barH);

    // 战术姿态微标 (🛡️ / ⚔️ / 🏹)
    const stanceIcons = { guardian: '🛡️', aggressive: '⚔️', scout: '🏹' };
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(stanceIcons[this.stance] || '🛡️', barX - 3, barY + 4);

    // 等级微章 (如 Lv.2)
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${this.level}`, this.x, barY - 3);
    ctx.restore();
  }
}

module.exports = ForestHero;