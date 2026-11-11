/**
 * Sporeguard - 英雄战技与奥义连招系统 (Hero Tactical Skills & Awakening Mastery)
 * 为橡木守护者·奥克注入成熟战术微操：[Q] 巨木横扫、[W] 荆棘木肤、[E] 庇护根脉、[R] 自然之怒觉醒
 * 参考 Kingdom Rush 英雄战技系统与魔兽争霸微操体验
 */

const platform = require('../core/platform');
const PALETTE = require('../data/palette');

class HeroSkillSystem {
  constructor(hero) {
    this.hero = hero;
    this.skills = {
      cleave: {
        id: 'cleave',
        nameKey: 'skill_cleave_name',
        hotkey: 'Q',
        cd: 7.0,
        timer: 0,
        cost: 0,
        rangePx: 90,
        damage: 220,
        color: '#73D13D',
        iconVfx: 'assets/vfx/vfx_hero_slash.png'
      },
      barkShield: {
        id: 'barkShield',
        nameKey: 'skill_bark_name',
        hotkey: 'W',
        cd: 12.0,
        timer: 0,
        cost: 0,
        duration: 6.0,
        activeTimer: 0,
        healRatio: 0.25,
        color: '#FAAD14',
        iconVfx: 'assets/vfx/relic_shield.png'
      },
      roots: {
        id: 'roots',
        nameKey: 'skill_roots_name',
        hotkey: 'E',
        cd: 16.0,
        timer: 0,
        cost: 0,
        radiusPx: 130,
        duration: 3.2,
        damage: 140,
        color: '#52C41A',
        iconVfx: 'assets/vfx/vfx_spikes.png'
      },
      awakening: {
        id: 'awakening',
        nameKey: 'skill_awakening_name',
        hotkey: 'R',
        cd: 30.0,
        timer: 0,
        cost: 0,
        duration: 10.0,
        activeTimer: 0,
        color: '#FF4D4F',
        iconVfx: 'assets/vfx/hero_oak.png'
      }
    };

    this.activeVfx = [];
    this.skillHotspots = [];
  }

  reset() {
    for (const key in this.skills) {
      const sk = this.skills[key];
      sk.timer = 0;
      if (sk.activeTimer) sk.activeTimer = 0;
    }
    this.activeVfx.length = 0;
  }

  /**
   * 触发英雄战技
   * @param {string} skillId 'cleave'|'barkShield'|'roots'|'awakening'
   * @param {Object} scene 场景上下文
   * @returns {boolean} 是否成功施法
   */
  castSkill(skillId, scene) {
    const sk = this.skills[skillId];
    if (!sk) return false;
    if (sk.timer > 0) {
      if (scene && scene.fx) {
        scene.fx.spawnDamageText(Math.round(this.hero.x), Math.round(this.hero.y - 36), `冷却中: ${Math.ceil(sk.timer)}s`, '#FFA39E');
      }
      return false;
    }

    if (this.hero.hp <= 0) return false;

    sk.timer = sk.cd;

    if (skillId === 'cleave') {
      return this.executeCleave(scene);
    } else if (skillId === 'barkShield') {
      return this.executeBarkShield(scene);
    } else if (skillId === 'roots') {
      return this.executeRoots(scene);
    } else if (skillId === 'awakening') {
      return this.executeAwakening(scene);
    }
    return false;
  }

  /**
   * Q技能：巨木横扫 (180度半月形强力物理挥击，击退并击晕)
   */
  executeCleave(scene) {
    const hx = this.hero.x;
    const hy = this.hero.y;
    const facing = this.hero.facingLeft ? -1 : 1;

    platform.playSfx('sfx_shoot');
    platform.playSfx('sfx_thorn');

    if (scene && scene.fx) {
      scene.fx.triggerScreenShake(3.0, 0.25);
    }

    // 记录华丽 AI 剑气挥砍
    this.activeVfx.push({
      type: 'cleave',
      x: hx + facing * 24,
      y: hy - 8,
      facing: facing,
      timer: 0,
      duration: 0.35,
      radius: 95
    });

    let hitCount = 0;
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        const dist = Math.hypot(e.x - hx, e.y - hy);
        if (dist <= 100) {
          // 判定处于英雄面朝方向的半圆内
          const dirX = e.x - hx;
          if (dirX * facing >= -15) {
            if (scene && scene.enemyManager && typeof scene.enemyManager.applyDamage === 'function') {
              scene.enemyManager.applyDamage(e, this.skills.cleave.damage, false, 'physical', scene.fx, 'hero');
            } else {
              e.takeDamage(this.skills.cleave.damage, scene.fx, 'physical', 'hero');
            }
            e.stunTimer = Math.max(e.stunTimer || 0, 1.2);
            // 物理后退击退
            e.x += facing * 26;
            hitCount++;
          }
        }
      }
    }

    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(hx), Math.round(hy - 42), `⚔️ 巨木横扫! (${hitCount}命中)`, '#95DE64');
    }
    return true;
  }

  /**
   * W技能：荆棘木肤 (6秒内60%减伤，180%反伤，回复25%生命)
   */
  executeBarkShield(scene) {
    const sk = this.skills.barkShield;
    sk.activeTimer = sk.duration;

    const healAmount = Math.round(this.hero.maxHp * sk.healRatio);
    this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + healAmount);

    platform.playSfx('sfx_build');
    if (scene && scene.fx) {
      scene.fx.spawnDamageText(Math.round(this.hero.x), Math.round(this.hero.y - 42), `🛡️ 荆棘木肤! +${healAmount}HP`, '#FFD666');
      scene.fx.spawnRing(this.hero.x, this.hero.y, 80, '#FFC069', 0.6);
    }
    return true;
  }

  /**
   * E技能：庇护根脉 (古树根系破土而出，全域缠绕定身)
   */
  executeRoots(scene) {
    const hx = this.hero.x;
    const hy = this.hero.y;
    const radius = this.skills.roots.radiusPx;

    platform.playSfx('sfx_thorn');
    platform.playSfx('sfx_boom');

    this.activeVfx.push({
      type: 'roots',
      x: hx,
      y: hy,
      radius: radius,
      timer: 0,
      duration: 1.2
    });

    let count = 0;
    if (scene && scene.enemyManager) {
      const list = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (Math.hypot(e.x - hx, e.y - hy) <= radius) {
          if (scene && scene.enemyManager && typeof scene.enemyManager.applyDamage === 'function') {
            scene.enemyManager.applyDamage(e, this.skills.roots.damage, false, 'nature', scene.fx, 'hero');
          } else {
            e.takeDamage(this.skills.roots.damage, scene.fx, 'nature', 'hero');
          }
          e.rootTimer = Math.max(e.rootTimer || 0, this.skills.roots.duration);
          count++;
        }
      }
    }

    if (scene && scene.fx) {
      scene.fx.triggerScreenShake(4.5, 0.4);
      scene.fx.spawnDamageText(Math.round(hx), Math.round(hy - 42), `🌿 庇护根脉! 缠绕${count}敌`, '#73D13D');
    }
    return true;
  }

  /**
   * R终极奥义：自然之怒觉醒 (化身远古神树泰坦，攻速翻倍，全图卫士嗜血暴走)
   */
  executeAwakening(scene) {
    const sk = this.skills.awakening;
    sk.activeTimer = sk.duration;

    platform.playSfx('sfx_win');
    platform.playSfx('sfx_upgrade');

    if (scene && scene.fx) {
      scene.fx.triggerScreenShake(6.0, 0.6);
      scene.fx.spawnDamageText(Math.round(this.hero.x), Math.round(this.hero.y - 48), `🌟 自然之怒觉醒! 泰坦暴走`, '#FF4D4F');
      scene.fx.showBanner('自然之怒·泰坦觉醒!', '#FF4D4F', '英雄攻速+80%，卫士全员狂暴', 2.0);
    }

    // 强化全图卫士
    if (scene && scene.sporelingPatrol) {
      const guards = scene.sporelingPatrol.guards || [];
      for (let i = 0; i < guards.length; i++) {
        guards[i].berserkTimer = 10.0;
      }
    }

    return true;
  }

  update(dt, scene) {
    // 1. 冷却计时器
    for (const key in this.skills) {
      const sk = this.skills[key];
      if (sk.timer > 0) {
        sk.timer = Math.max(0, sk.timer - dt);
      }
      if (sk.activeTimer > 0) {
        sk.activeTimer = Math.max(0, sk.activeTimer - dt);
      }
    }

    // 2. 更新战技特效
    for (let i = this.activeVfx.length - 1; i >= 0; i--) {
      const v = this.activeVfx[i];
      v.timer += dt;
      if (v.timer >= v.duration) {
        this.activeVfx.splice(i, 1);
      }
    }

    // 3. 荆棘反伤与减伤逻辑
    if (this.skills.barkShield.activeTimer > 0) {
      this.hero.damageReduction = 0.60; // 60% 减伤
      this.hero.thornReflect = 1.80;    // 180% 反伤
    } else {
      this.hero.damageReduction = 0;
      this.hero.thornReflect = 0;
    }

    // 4. 终极觉醒强化状态
    if (this.skills.awakening.activeTimer > 0) {
      this.hero.awakeningBoost = true;
    } else {
      this.hero.awakeningBoost = false;
    }
  }

  /**
   * 在战场地图层渲染技能地面特效
   */
  renderMapVfx(ctx) {
    if (this.activeVfx.length === 0) return;

    for (let i = 0; i < this.activeVfx.length; i++) {
      const v = this.activeVfx[i];
      const prog = v.timer / v.duration;

      if (v.type === 'cleave') {
        const slashImg = platform.getImage('assets/vfx/vfx_hero_slash.png');
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.scale(v.facing, 1);
        ctx.globalAlpha = Math.max(0, (1 - prog) * 0.95);
        const sSize = 90 + prog * 30;
        if (slashImg && slashImg.width) {
          ctx.drawImage(slashImg, -sSize * 0.5, -sSize * 0.5, sSize, sSize);
        } else {
          ctx.strokeStyle = '#95DE64';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, sSize * 0.5, -Math.PI * 0.35, Math.PI * 0.35);
          ctx.stroke();
        }
        ctx.restore();
      } else if (v.type === 'roots') {
        const spikeImg = platform.getImage('assets/vfx/vfx_spikes.png');
        ctx.save();
        ctx.globalAlpha = Math.max(0, (1 - prog) * 0.85);
        const rSize = v.radius * 2 * (0.6 + prog * 0.4);
        if (spikeImg && spikeImg.width) {
          ctx.drawImage(spikeImg, v.x - rSize * 0.5, v.y - rSize * 0.5 * 0.78, rSize, rSize * 0.78);
        }
        ctx.restore();
      }
    }
  }

  /**
   * 绘制英雄身侧高质感技能 HUD 控制条 (在战场左下角或英雄专属位置)
   */
  renderSkillActionBar(ctx, startX, startY) {
    this.skillHotspots.length = 0;
    const btnSize = 38;
    const gap = 8;
    const skillList = [this.skills.cleave, this.skills.barkShield, this.skills.roots, this.skills.awakening];

    ctx.save();
    for (let i = 0; i < skillList.length; i++) {
      const sk = skillList[i];
      const bx = startX + i * (btnSize + gap);
      const by = startY;

      this.skillHotspots.push({
        id: sk.id,
        x: bx,
        y: by,
        w: btnSize,
        h: btnSize
      });

      // 1. 底框投影与底纹
      ctx.fillStyle = 'rgba(15, 22, 18, 0.90)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, btnSize, btnSize, 8) : ctx.rect(bx, by, btnSize, btnSize);
      ctx.fill();

      // 2. 绘制技能 AI 图标
      const img = platform.getImage(sk.iconVfx);
      if (img && img.width) {
        ctx.drawImage(img, bx + 4, by + 4, btnSize - 8, btnSize - 8);
      }

      // 3. 激活状态华丽呼吸流光
      if (sk.activeTimer && sk.activeTimer > 0) {
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx - 1, by - 1, btnSize + 2, btnSize + 2, 8) : ctx.rect(bx - 1, by - 1, btnSize + 2, btnSize + 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = sk.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, btnSize, btnSize, 8) : ctx.rect(bx, by, btnSize, btnSize);
        ctx.stroke();
      }

      // 4. 冷却遮罩扇面
      if (sk.timer > 0) {
        const ratio = sk.timer / sk.cd;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, btnSize, btnSize, 8) : ctx.rect(bx, by, btnSize, btnSize);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.ceil(sk.timer)}s`, bx + btnSize * 0.5, by + btnSize * 0.5);
      }

      // 5. 键盘快捷键角标 [Q] [W] [E] [R]
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(sk.hotkey, bx + btnSize - 3, by + btnSize - 2);
    }
    ctx.restore();
  }

  handleClick(x, y, scene) {
    for (let i = 0; i < this.skillHotspots.length; i++) {
      const h = this.skillHotspots[i];
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        return this.castSkill(h.id, scene);
      }
    }
    return false;
  }
}

module.exports = HeroSkillSystem;
