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

    this.repositionCooldown = 0;
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
      // 默认插在地面路径第一折角附近的战略要冲
      const pt = wps[1] || wps[0];
      const col = Array.isArray(pt) ? pt[0] : (pt.col !== undefined ? pt.col : 6);
      const row = Array.isArray(pt) ? pt[1] : (pt.row !== undefined ? pt.row : 2);
      this.setRallyPoint(col, row, map, null, true);
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
          e.hp -= dmg;
          if (fx) {
            fx.spawnParticles(e.x, e.y, 4, ['#FFFAEE', '#FFD700'], 15, 45, 0.15, 0.25, 2);
            fx.spawnFloatingText(e.x, e.y - 12, `-${Math.round(dmg)}`, '#FFF1B8', 0.6);
          }
          platform.playSfx('sfx_hit');

          if (e.hp <= 0 && enemyManager) {
            enemyManager.killEnemy(e, fx);
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

    // 1. 绘制集结木旗（Rally Flag）
    ctx.save();
    const fx = this.rallyX;
    const fy = this.rallyY;
    const wave = Math.sin(this.flagAnimTimer * 4) * 3;

    // 旗帜立柱阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(fx + 2, fy + 4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 木质立柱
    ctx.strokeStyle = '#5C381E';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx, fy + 4);
    ctx.lineTo(fx, fy - 22);
    ctx.stroke();

    // 旗顶金色果实/宝珠
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(fx, fy - 23, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 飘扬的绿林卫士旗面
    ctx.fillStyle = '#389E0D';
    ctx.beginPath();
    ctx.moveTo(fx, fy - 22);
    ctx.quadraticCurveTo(fx + 9, fy - 20 + wave * 0.5, fx + 16, fy - 18 + wave);
    ctx.lineTo(fx + 16, fy - 10 + wave);
    ctx.quadraticCurveTo(fx + 8, fy - 12 + wave * 0.5, fx, fy - 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#D9F7BE';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 旗面徽标（金黄色孢子微点）
    ctx.fillStyle = '#FFF1B8';
    ctx.beginPath();
    ctx.arc(fx + 7, fy - 16 + wave * 0.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. 绘制 2 只萌萌菇精小卫士
    for (let i = 0; i < this.guards.length; i++) {
      const g = this.guards[i];
      if (g.state === 'dead') continue;

      ctx.save();
      const gx = Math.round(g.x);
      const gy = Math.round(g.y);
      const bob = g.state === 'walk' ? Math.abs(Math.sin(g.animTimer * 10)) * 2 : Math.sin(g.animTimer * 3) * 0.8;
      const thrust = g.thrustTimer > 0 ? 5 : 0;

      // 脚底微阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(gx, gy + 3, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // 菇精小身躯（圆滚滚的米黄色菌柄）
      ctx.fillStyle = '#FFFBE6';
      ctx.strokeStyle = '#AD8B00';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(gx, gy - 2 - bob, 5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 黑色小萌眼
      ctx.fillStyle = '#262626';
      ctx.beginPath();
      ctx.arc(gx - 1.5, gy - 3 - bob, 0.9, 0, Math.PI * 2);
      ctx.arc(gx + 1.5, gy - 3 - bob, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // 菇精卫头顶翡翠绿菌盖（带白色小点点）
      ctx.fillStyle = '#52C41A';
      ctx.beginPath();
      ctx.ellipse(gx, gy - 7 - bob, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#237804';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 菌盖白色点斑
      ctx.fillStyle = '#F6FFED';
      ctx.beginPath();
      ctx.arc(gx - 3, gy - 8 - bob, 1.2, 0, Math.PI * 2);
      ctx.arc(gx + 3, gy - 7 - bob, 1.2, 0, Math.PI * 2);
      ctx.arc(gx, gy - 10 - bob, 1.0, 0, Math.PI * 2);
      ctx.fill();

      // 武器：蒲公英长矛（突刺动画）
      ctx.strokeStyle = '#8C4D18';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(gx + 3, gy - bob);
      ctx.lineTo(gx + 10 + thrust, gy - 4 - bob);
      ctx.stroke();
      // 矛尖（金黄尖端）
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(gx + 11 + thrust, gy - 4 - bob, 2, 0, Math.PI * 2);
      ctx.fill();

      // 防具：左手持圆形小木盾
      ctx.fillStyle = '#A05A2C';
      ctx.strokeStyle = '#D4B106';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(gx - 5, gy - 2 - bob, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 战斗中显示小生命条
      if (g.state === 'combat' || g.hp < g.maxHp) {
        const barW = 20;
        const barH = 3;
        const barX = gx - barW * 0.5;
        const barY = gy - 16 - bob;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        const hpPct = Math.max(0, Math.min(1, g.hp / g.maxHp));
        ctx.fillStyle = hpPct > 0.4 ? '#52C41A' : '#FF4D4F';
        ctx.fillRect(barX, barY, barW * hpPct, barH);
      }

      ctx.restore();
    }
  }
}

module.exports = SporelingPatrol;
