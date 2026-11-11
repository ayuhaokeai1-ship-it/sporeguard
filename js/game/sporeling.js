/**
 * 萌萌菇精卫哨兵巡逻与阻挡系统 (js/game/sporeling.js)
 * 学习 Kingdom Rush 经典的兵营/集结旗帜(Rally Point)拦截设计：
 * - 玩家可自由在路径上插拔集结旗帜
 * - 2只可爱的菇精小卫士（持木盾与蒲公英矛）出击驻守
 * - 靠近经过的地面敌人时正面阻挡拦截(Block)，与敌人拼刀搏斗
 * - 小卫士阵亡后 10 秒后从地底重新培植破土而出
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class SporelingPatrol {
  constructor() {
    this.hasRally = false;
    this.rallyCol = -1;
    this.rallyRow = -1;
    this.rallyX = 0;
    this.rallyY = 0;
    this.flagAnimTimer = 0;

    // 2 只菇精小卫士
    this.guards = [
      this.createGuard(0, -14, 0),
      this.createGuard(1, 14, 4)
    ];

    this.ironRank = 0;
    this.repositionCooldown = 0;
  }

  /**
   * 应用远古真菌知识之树「钢盔小蘑兵」加成（双倍生命 + 首次濒死神圣眩晕盾）
   */
  applyKnowledgeTree(ironRank) {
    this.ironRank = ironRank || 0;
    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      const baseMax = g.role === 'shield' ? 320 : 210;
      g.maxHp = this.ironRank > 0 ? baseMax * 2 : baseMax;
      g.hp = g.maxHp;
      g.deathShield = this.ironRank > 0;
    }
  }

  createGuard(index, offsetX, offsetY) {
    if (index === 0) {
      // Guard 0: 坚盾菇力士 (Shieldbearer - High HP & heavy armor)
      return {
        index,
        role: 'shield',
        name: '坚盾菇力士',
        offsetX,
        offsetY,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        state: 'idle',
        hp: 320,
        maxHp: 320,
        armor: 5,
        attackDmg: 16,
        attackInterval: 0.95,
        attackCooldown: 0.2,
        blockedEnemy: null,
        respawnTimer: 0,
        animTimer: Math.random() * 2,
        walkFrame: 0,
        thrustTimer: 0
      };
    } else {
      // Guard 1: 长矛巡林萌 (Spearman - High reach, crit & piercing thrust)
      return {
        index,
        role: 'spear',
        name: '长矛巡林萌',
        offsetX,
        offsetY,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        state: 'idle',
        hp: 210,
        maxHp: 210,
        armor: 1,
        attackDmg: 28,
        attackInterval: 0.75,
        attackCooldown: 0.5,
        blockedEnemy: null,
        respawnTimer: 0,
        animTimer: Math.random() * 2,
        walkFrame: 0,
        thrustTimer: 0,
        critChance: 0.30
      };
    }
  }

  healGuards(centerX, centerY, radiusPx, amount) {
    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (g.state !== 'dead') {
        if (Math.hypot(g.x - centerX, g.y - centerY) <= radiusPx) {
          g.hp = Math.min(g.maxHp, g.hp + amount);
        }
      }
    }
  }

  damageGuards(centerX, centerY, radiusPx, amount) {
    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (g.state !== 'dead') {
        if (Math.hypot(g.x - centerX, g.y - centerY) <= radiusPx) {
          const dmg = Math.max(5, amount - g.armor);
          g.hp -= dmg;
          if (g.hp <= 0) {
            g.state = 'dead';
            g.respawnTimer = 10;
            if (g.blockedEnemy) {
              g.blockedEnemy.isBlocked = false;
              g.blockedEnemy.blockedBy = null;
              g.blockedEnemy = null;
            }
          }
        }
      }
    }
  }

  initDefaultRally(map) {
    if (!map || !map.mapData || !map.mapData.groundWaypoints) return;
    const wps = map.mapData.groundWaypoints;
    if (wps && wps.length >= 2) {
      // 默认插在地面路径约 25% 处的咽喉要冲附近
      const prefIdx = Math.max(1, Math.min(wps.length - 2, Math.floor(wps.length * 0.25)));
      const tryOrder = [prefIdx, Math.floor(wps.length * 0.5), 1, 0];
      for (let i = 0; i < tryOrder.length; i++) {
        const pt = wps[tryOrder[i]];
        if (!pt) continue;
        const col = Math.round(Array.isArray(pt) ? pt[0] : (pt.col !== undefined ? pt.col : 6));
        const row = Math.round(Array.isArray(pt) ? pt[1] : (pt.row !== undefined ? pt.row : 2));
        if (this.setRallyPoint(col, row, map, null, true)) break;
      }
    }
  }

  setRallyPoint(col, row, map, fx = null, instant = false) {
    if (!map || !map.inBounds(col, row)) return false;
    const tile = map.getTile(col, row);
    if (tile.type !== 'path' && tile.type !== 'spawn') return false;

    this.hasRally = true;
    this.rallyCol = col;
    this.rallyRow = row;
    this.rallyX = (col + 0.5) * TILE_SIZE;
    this.rallyY = (row + 0.5) * TILE_SIZE;
    this.repositionCooldown = 2.0;

    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (instant || g.state === 'dead') {
        g.x = this.rallyX + g.offsetX;
        g.y = this.rallyY + g.offsetY;
      }
      if (g.blockedEnemy) {
        if (g.blockedEnemy.blockedBy === g) {
          g.blockedEnemy.isBlocked = false;
          g.blockedEnemy.blockedBy = null;
        }
        g.blockedEnemy = null;
      }
      if (g.state !== 'dead') {
        g.state = 'walk';
      }
    }

    if (fx) {
      fx.spawnParticles(this.rallyX, this.rallyY, 16, ['#52C41A', '#BAE7FF', '#FFD700'], 20, 70, 0.25, 0.5, 3);
      fx.spawnFloatingText(this.rallyX, this.rallyY - 24, '菇精卫在此集结!', '#95DE64', 1.2);
    }
    platform.playSfx('sfx_build');
    return true;
  }

  update(dt, enemyManager, fx) {
    if (!this.hasRally) return;

    this.flagAnimTimer += dt;
    if (this.repositionCooldown > 0) {
      this.repositionCooldown = Math.max(0, this.repositionCooldown - dt);
    }

    const aliveEnemies = enemyManager ? enemyManager.getAliveEnemies() : [];

    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      g.animTimer += dt;
      if (g.thrustTimer > 0) {
        g.thrustTimer = Math.max(0, g.thrustTimer - dt);
      }

      // 1. 阵亡复活逻辑
      if (g.state === 'dead') {
        g.respawnTimer -= dt;
        if (g.respawnTimer <= 0) {
          g.state = 'idle';
          g.hp = g.maxHp;
          g.deathShield = (this.ironRank || 0) > 0;
          g.x = this.rallyX + g.offsetX;
          g.y = this.rallyY + g.offsetY;
          if (fx) {
            fx.spawnParticles(g.x, g.y, 14, ['#73D13D', '#BAE7FF', '#FFFFFF'], 20, 60, 0.2, 0.4, 3);
            fx.spawnFloatingText(g.x, g.y - 18, '破土归队!', '#95DE64', 1.0);
          }
          platform.playSfx('sfx_upgrade');
        }
        continue;
      }

      // 2. 检查阻挡的目标敌人是否依然有效
      if (g.blockedEnemy) {
        const e = g.blockedEnemy;
        if (e.hp <= 0 || e.state === 'death' || e.blockedBy !== g) {
          g.blockedEnemy = null;
          g.state = 'idle';
        }
      }

      // 3. 寻找拦截敌人（仅拦截地面目标，不可拦截飞行）
      if (!g.blockedEnemy && g.state !== 'dead') {
        const targetX = this.rallyX + g.offsetX;
        const targetY = this.rallyY + g.offsetY;
        let closest = null;
        let closestDist = 26; // 拦截触发半径 26px

        for (let j = 0; j < aliveEnemies.length; j++) {
          const em = aliveEnemies[j];
          if (em.isFlying || em.isBlocked || em.state === 'death') continue;
          const d = Math.hypot(em.x - targetX, em.y - targetY);
          if (d < closestDist) {
            closestDist = d;
            closest = em;
          }
        }

        if (closest) {
          g.blockedEnemy = closest;
          closest.isBlocked = true;
          closest.blockedBy = g;
          g.state = 'combat';
          if (fx) {
            fx.spawnFloatingText(g.x, g.y - 20, '拦截接怪!', '#FFD700', 0.8);
          }
        }
      }

      // 4. 战斗或移动逻辑
      if (g.state === 'combat' && g.blockedEnemy) {
        const e = g.blockedEnemy;
        // 小卫士贴向敌人身前
        const angle = Math.atan2(e.y - g.y, e.x - g.x);
        const dist = Math.hypot(e.x - g.x, e.y - g.y);
        if (dist > 14) {
          g.x += Math.cos(angle) * 45 * dt;
          g.y += Math.sin(angle) * 45 * dt;
        }

        // 攻击计时
        g.attackCooldown -= dt;
        if (g.attackCooldown <= 0) {
          g.attackCooldown = g.attackInterval;
          g.thrustTimer = 0.22;
          const dmg = Math.max(3, g.attackDmg - (e.baseArmor || 0) * 0.35);
          if (enemyManager && typeof enemyManager.applyDamage === 'function') {
            enemyManager.applyDamage(e, dmg, false, 'physical', fx, 'sporelings');
          } else {
            e.hp -= dmg;
            if (e.hp <= 0 && enemyManager) enemyManager.killEnemy(e, fx);
          }
          if (fx) {
            fx.spawnParticles(e.x, e.y, 4, ['#FFFAEE', '#FFD700'], 15, 45, 0.15, 0.25, 2);
          }
          platform.playSfx('sfx_hit');

          if (e.hp <= 0 || e.state === 'death') {
            g.blockedEnemy = null;
            g.state = 'idle';
          }
        }

        // 敌人对小卫士的反击（敌人每 1.2s 造成伤害）
        e.sporelingHitTimer = (e.sporelingHitTimer || 0) + dt;
        if (e.sporelingHitTimer >= 1.1) {
          e.sporelingHitTimer = 0;
          const enemyDmg = Math.max(5, (e.threat || 1) * 16 - g.armor * 2);
          g.hp -= enemyDmg;
          if (fx) {
            fx.spawnParticles(g.x, g.y, 4, ['#FF4D4F', '#FFA39E'], 15, 35, 0.15, 0.3, 2);
          }

          if (g.hp <= 0) {
            // 「钢盔小蘑兵」濒死免死护盾：恢复 40% 生命并震晕周围地面敌军
            if (g.deathShield) {
              g.deathShield = false;
              g.hp = Math.round(g.maxHp * 0.40);
              const stunSec = 0.8 + (this.ironRank || 1) * 0.4;
              for (let ei = 0; ei < aliveEnemies.length; ei++) {
                const oe = aliveEnemies[ei];
                if (!oe.isFlying && oe.state !== 'death' && Math.hypot(oe.x - g.x, oe.y - g.y) <= 72) {
                  oe.stunTimer = Math.max(oe.stunTimer || 0, stunSec);
                }
              }
              if (fx) {
                fx.spawnFloatingText(g.x, g.y - 20, '钢盔护盾·免疫阵亡!', '#FFD700', 1.15);
                if (fx.spawnShockwave) fx.spawnShockwave(g.x, g.y, 64, '#FFD700');
              }
              platform.playSfx('sfx_upgrade');
              continue;
            }
            // 阵亡
            g.state = 'dead';
            g.respawnTimer = 10.0;
            if (e.blockedBy === g) {
              e.isBlocked = false;
              e.blockedBy = null;
            }
            g.blockedEnemy = null;
            if (fx) {
              fx.spawnParticles(g.x, g.y, 16, ['#5C4028', '#A08060'], 20, 60, 0.2, 0.5, 3);
              fx.spawnFloatingText(g.x, g.y - 16, '菇精卫阵亡 (10s重生)', '#FF7875', 1.2);
            }
          }
        }
      } else if (g.state !== 'dead') {
        // 巡逻走位回集结旗帜点
        const targetX = this.rallyX + g.offsetX;
        const targetY = this.rallyY + g.offsetY;
        const dist = Math.hypot(targetX - g.x, targetY - g.y);
        if (dist > 3) {
          g.state = 'walk';
          const angle = Math.atan2(targetY - g.y, targetX - g.x);
          const spd = 55;
          g.x += Math.cos(angle) * spd * dt;
          g.y += Math.sin(angle) * spd * dt;
          g.walkFrame = Math.floor(g.animTimer * 6) % 4;
        } else {
          g.state = 'idle';
        }
      }
    }
  }

  render(ctx) {
    if (!this.hasRally) return;

    // 1. 绘制集结木旗（100% 纯 AI 手绘高精木质藤蔓绿叶旗帜）
    ctx.save();
    const fx = this.rallyX;
    const fy = this.rallyY;
    const wave = Math.sin(this.flagAnimTimer * 4) * 2;

    // 旗帜立柱阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(fx + 2, fy + 4, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const flagImg = platform.getImage('assets/vfx/prop_rally_flag.png');
    if (flagImg && flagImg.width) {
      const flW = 28;
      const flH = 34;
      ctx.drawImage(flagImg, fx - flW * 0.45, fy - flH + 6 + wave * 0.5, flW, flH);
    } else {
      ctx.strokeStyle = '#5C381E';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, fy + 4);
      ctx.lineTo(fx, fy - 22);
      ctx.stroke();
    }
    ctx.restore();

    // 2. 绘制 2 只萌萌菇精小卫士 (100% 纯 AI 手绘高精菇精战士立绘)
    const guardImg = platform.getImage('assets/vfx/sporeling_guard.png');
    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (g.state === 'dead') continue;

      ctx.save();
      const gx = Math.round(g.x);
      const gy = Math.round(g.y);
      const bob = g.state === 'walk' ? Math.abs(Math.sin(g.animTimer * 10)) * 2.5 : Math.sin(g.animTimer * 3) * 0.8;
      const thrust = g.thrustTimer > 0 ? 5 : 0;

      // 脚底微阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(gx, gy + 3, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      if (guardImg && guardImg.width) {
        const gw = 28;
        const gh = 30;
        ctx.translate(gx + thrust * 0.5, gy - bob);
        if (g.facingLeft) ctx.scale(-1, 1);
        ctx.drawImage(guardImg, -gw * 0.5, -gh + 4, gw, gh);
      } else {
        ctx.fillStyle = '#FFFBE6';
        ctx.beginPath();
        ctx.ellipse(gx, gy - 2 - bob, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 战斗中显示微雕木质小血条
      if (g.state === 'combat' || g.hp < g.maxHp) {
        const barW = 20;
        const barH = 3;
        const barX = gx - barW * 0.5;
        const barY = gy - 28 - bob;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        const hpPct = Math.max(0, Math.min(1, g.hp / g.maxHp));
        ctx.fillStyle = hpPct > 0.4 ? '#52C41A' : '#FF4D4F';
        ctx.fillRect(barX, barY, Math.round(barW * hpPct), barH);
      }

      ctx.restore();
    }
  }
}

module.exports = SporelingPatrol;
