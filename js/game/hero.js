/**
 * 森林守护英雄系统 (js/game/hero.js)
 * 深度对标《王国保卫战》(Kingdom Rush) 传奇英雄机制：
 * 1. 战场全图自由点击调遣集结（Rally Point）
 * 2. 地面肉搏拦截阻挡（Block up to 2 ground enemies）
 * 3. 战斗内等级成长体系（Lv.1 ~ Lv.5，击杀与受击成长）
 * 4. 专属主动大招【大地裂地斩】（全屏震荡、大范围群体眩晕与重创）
 * 5. 阵亡倒计时复活机制（保护战局容错率）
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

class ForestHero {
  constructor(map) {
    this.name = '橡木守望者·奥克';
    this.title = '林地总帅';
    
    // 初始站位：位于主防线核心交汇处
    const initWp = (map && map.mapData && map.mapData.groundWaypoints)
      ? map.mapData.groundWaypoints[Math.min(2, map.mapData.groundWaypoints.length - 1)]
      : [6, 2];
    
    this.x = initWp[0] * 32 + 16;
    this.y = initWp[1] * 32 + 16;
    this.targetX = this.x;
    this.targetY = this.y;
    
    this.level = 1;
    this.maxLevel = 5;
    this.xp = 0;
    this.xpToNext = 100;
    
    this.baseMaxHp = 360;
    this.maxHp = 360;
    this.hp = 360;
    
    this.baseAtk = 38;
    this.atkDamage = 38;
    this.atkInterval = 0.95;
    this.atkCooldown = 0;
    this.atkRange = 42;
    
    this.speed = 110; // 移动像素/秒
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
    this.maxHp = this.baseMaxHp + (this.level - 1) * 85;
    this.hp = this.maxHp; // 升级瞬间回满生命！
    this.atkDamage = this.baseAtk + (this.level - 1) * 15;
    this.levelUpGlowTimer = 2.5;

    platform.playSfx('sfx_upgrade');
    if (fx) {
      fx.spawnFloatingText(this.x, this.y - 36, `英雄进阶! Lv.${this.level}`, '#FFD700', 1.5);
      fx.spawnParticles(this.x, this.y, 32, ['#FFD700', '#52C41A', '#FFFFFF', '#FFA940'], 40, 120, 0.4, 0.8, 5);
      if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 50, '#FFD700');
    }
  }

  takeDamage(amount, enemy = null, fx = null) {
    if (this.state === 'dead') return;
    this.hp = Math.max(0, this.hp - amount);
    this.gainXp(Math.round(amount * 0.25), fx);

    if (fx) {
      fx.spawnFloatingText(this.x, this.y - 20, `-${amount}`, '#FF4D4F', 0.8);
      fx.spawnParticles(this.x, this.y, 4, ['#FF4D4F', '#FFA39E'], 15, 35, 0.15, 0.25, 2.5);
    }

    if (this.hp <= 0) {
      this.die(fx);
    }
  }

  die(fx = null) {
    this.state = 'dead';
    this.hp = 0;
    this.reviveTimer = this.reviveTimeTotal;
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
    if (fx) {
      fx.triggerScreenShake(6.0, 0.45);
      fx.showBanner('大地裂地斩！', '#FFD700', '震击四方，全军退避！', 1.5);
      if (fx.spawnShockwave) fx.spawnShockwave(this.x, this.y, 110, '#52C41A');
      fx.spawnParticles(this.x, this.y, 48, ['#52C41A', '#FFD700', '#D48806', '#FFFFFF'], 60, 180, 0.35, 0.75, 5.5);
    }

    // 震晕周围 120 像素内所有敌人并造成超高爆发重创
    if (enemyManager) {
      const alive = enemyManager.getAliveEnemies();
      const radius = 125;
      const skillDmg = 160 + (this.level - 1) * 55;

      for (let i = 0; i < alive.length; i++) {
        const e = alive[i];
        const dist = Math.hypot(e.x - this.x, e.y - this.y);
        if (dist <= radius) {
          enemyManager.applyDamage(e, skillDmg, false, 'physical', fx, null);
          // 强力定身晕眩 2.2 秒
          e.activeSlow = 0.95;
          e.residualSlowValue = 0.85;
          e.residualSlowTimer = 2.2;
          this.gainXp(25, fx);
        }
      }
    }
    return true;
  }

  update(dt, enemyManager, fx = null) {
    this.animTimer += dt;
    if (this.rallyMarkerTimer > 0) this.rallyMarkerTimer = Math.max(0, this.rallyMarkerTimer - dt);
    if (this.levelUpGlowTimer > 0) this.levelUpGlowTimer = Math.max(0, this.levelUpGlowTimer - dt);
    if (this.skillCooldown > 0) this.skillCooldown = Math.max(0, this.skillCooldown - dt);

    // 阵亡复活逻辑
    if (this.state === 'dead') {
      this.reviveTimer -= dt;
      if (this.reviveTimer <= 0) {
        this.reviveTimer = 0;
        this.hp = this.maxHp;
        this.state = 'idle';
        platform.playSfx('sfx_upgrade');
        if (fx) {
          fx.spawnFloatingText(this.x, this.y - 30, '英灵苏醒! 重返战场!', '#52C41A', 1.4);
          fx.spawnParticles(this.x, this.y, 25, ['#52C41A', '#FFD700'], 30, 90, 0.3, 0.6, 4);
        }
      }
      return;
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

    // 地面拦截与阻挡战斗逻辑
    if (this.atkCooldown > 0) this.atkCooldown -= dt;

    if (enemyManager) {
      const alive = enemyManager.getAliveEnemies();
      // 清理已阵亡或超出范围的阻挡目标
      this.blockedEnemies = this.blockedEnemies.filter(e => e.state !== 'death' && Math.hypot(e.x - this.x, e.y - this.y) <= 55);

      // 自动拦截经过身旁的地面敌人（最多阻挡 2 名）
      for (let i = 0; i < alive.length; i++) {
        if (this.blockedEnemies.length >= 2) break;
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

      // 近战范围顺劈挥击
      if (this.blockedEnemies.length > 0 || alive.length > 0) {
        const potentialTargets = this.blockedEnemies.length > 0 ? this.blockedEnemies : alive.filter(e => !e.isFlying && Math.hypot(e.x - this.x, e.y - this.y) <= this.atkRange);

        if (potentialTargets.length > 0) {
          const mainTarget = potentialTargets[0];
          if (mainTarget.x < this.x) this.facingLeft = true;
          else if (mainTarget.x > this.x) this.facingLeft = false;

          if (this.atkCooldown <= 0) {
            this.atkCooldown = this.atkInterval;
            this.state = 'attack';

            platform.playSfx('sfx_hit');
            // 顺劈波及最多 2 名近战敌人
            const hits = Math.min(2, potentialTargets.length);
            for (let h = 0; h < hits; h++) {
              const target = potentialTargets[h];
              enemyManager.applyDamage(target, this.atkDamage, false, 'physical', fx, null);
              this.gainXp(8, fx);
            }

            if (fx) {
              const slashX = this.x + (this.facingLeft ? -18 : 18);
              fx.spawnParticles(slashX, this.y - 4, 6, ['#FFE58F', '#FFFFFF', '#73D13D'], 20, 50, 0.15, 0.3, 3);
            }
          }
        } else {
          this.state = 'idle';
        }
      }
    }
  }

  render(ctx, animTimeSec) {
    if (this.state === 'dead') {
      // 阵亡墓碑与复活倒计时光圈
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 8, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 墓碑/折断木剑立绘
      ctx.fillStyle = '#8C8C8C';
      ctx.fillRect(this.x - 6, this.y - 14, 12, 18);
      ctx.fillRect(this.x - 10, this.y - 8, 20, 5);

      // 复活倒计时文字与圆环
      const ratio = 1 - (this.reviveTimer / this.reviveTimeTotal);
      ctx.strokeStyle = '#52C41A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 26, 10, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * ratio);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.ceil(this.reviveTimer)}s`, this.x, this.y - 23);
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

    // 2. 英雄脚底战术阴影与选中高亮
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.isSelected || this.levelUpGlowTimer > 0) {
      ctx.strokeStyle = this.levelUpGlowTimer > 0 ? '#FFD700' : '#73D13D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 12, 20, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. 英雄本体立绘绘制
    ctx.save();
    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    const walkBob = (this.state === 'walk') ? Math.sin(this.animTimer * 12) * 2.5 : 0;
    const heroW = 46, heroH = 46;

    if (heroImg && heroImg.width) {
      ctx.translate(this.x, this.y - walkBob);
      if (this.facingLeft) ctx.scale(-1, 1);
      ctx.drawImage(heroImg, -heroW * 0.5, -heroH * 0.8, heroW, heroH);
    } else {
      // 优雅古典树人战士矢量兜底
      ctx.translate(this.x, this.y - walkBob);
      if (this.facingLeft) ctx.scale(-1, 1);
      
      // 树皮身躯
      ctx.fillStyle = '#5C4028';
      ctx.fillRect(-10, -28, 20, 26);
      // 翡翠青苔肩甲
      ctx.fillStyle = '#389E0D';
      ctx.beginPath();
      ctx.arc(-8, -26, 6, 0, Math.PI * 2);
      ctx.arc(8, -26, 6, 0, Math.PI * 2);
      ctx.fill();
      // 金色符文巨剑
      ctx.fillStyle = '#FFE58F';
      ctx.fillRect(10, -32, 5, 28);
      ctx.fillRect(7, -12, 11, 4);
      // 眼睛
      ctx.fillStyle = '#FFA940';
      ctx.beginPath();
      ctx.arc(3, -22, 2, 0, Math.PI * 2);
      ctx.fill();
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

// 4. 生命值条与等级徽章
    ctx.save();
    const barW = 36;
    const barH = 5;
    const barX = this.x - barW * 0.5;
    const barY = this.y - 42;

    // 底底黑框
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    // 绿色血条
    const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
    ctx.fillStyle = hpRatio > 0.4 ? '#52C41A' : (hpRatio > 0.2 ? '#FAAD14' : '#FF4D4F');
    ctx.fillRect(barX, barY, Math.round(barW * hpRatio), barH);

    // 等级微章 (如 Lv.2)
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${this.level}`, this.x, barY - 3);
    ctx.restore();
  }
}

module.exports = ForestHero;
