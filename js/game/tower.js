/**
 * 炮塔与升级分支系统 (js/game/tower.js)
 * 严格实现 5.3 放置、索敌优先级、不重置冷却升级、分支锁定、60%返还出售
 * 以及第六章 6.1-6.4 全部 24 个形态节点的数值与特殊效果
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { TOWERS } = require('../data/towers');
const { tileCenter } = require('./map');
const { drawTowerSprite } = require('../core/atlasRenderer');
const platform = require('../core/platform');
const i18n = require('../i18n/index');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class TowerManager {
  constructor() {
    this.towers = [];
    this.networkEdges = [];
    this.networkTimer = 0;
    this.animTimer = 0;
    this.nextId = 1;
  }

  clear() {
    this.towers.length = 0;
  }

  getTowerAt(col, row) {
    for (let i = 0; i < this.towers.length; i++) {
      const t = this.towers[i];
      if (t.col === col && t.row === row) {
        return t;
      }
    }
    return null;
  }

  /**
   * 种植一座基础蘑菇炮塔
   */
  buildTower(typeId, col, row, map, economy, fx) {
    const def = TOWERS[typeId];
    if (!def) return null;
    if (!map.canBuildAt(col, row)) return null;

    const baseNode = def.nodes.base;
    if (typeId === 'lumina') {
      const luminaCount = this.towers.filter(t => t.typeId === 'lumina').length;
      if (luminaCount >= 3) {
        if (fx) {
          const center = tileCenter(col, row);
          fx.spawnFloatingText(center.x, center.y - 20, '最多同时种植 3 棵灵光菇!', '#FFA39E', 1.25);
        }
        return null;
      }
    }
    if (!economy.spendSpores(baseNode.cost)) {
      return null;
    }

    const center = tileCenter(col, row);
    const maxHp = typeId === 'thorn' ? 220 : (typeId === 'mist' ? 180 : (typeId === 'burst' ? 160 : 140));
    const tower = {
      id: this.nextId++,
      typeId,
      def,
      col,
      row,
      x: center.x,
      y: center.y,
      nodeId: 'base',
      node: baseNode,
      branch: null, // null | 'A' | 'B'
      hp: maxHp,
      maxHp: maxHp,
      dormantTimer: 0,   // >0 时为休眠枯萎状态，不索敌开火
      buffTimer: 0,      // >0 时为甘霖狂暴状态，攻速翻倍
      poisonTimer: 0,    // >0 时为酸液中毒状态，攻速降低
      hitWobbleTimer: 0, // 受击弹性微晃
      totalInvested: baseNode.cost,
      priority: def.defaultPriority,
      cooldown: 0.15, // 种植后极短预热即可开火
      animState: 'upgrade', // 初始种植也播放生长过渡动画
      animFrame: 0,
      animTimer: 0,
      upgradeAnimTimer: 0.36,
      attackAnimTimer: 0,
      squashScaleX: 1.35,  // 落地瞬间压扁拉伸弹性动画 (Squash & Stretch)
      squashScaleY: 0.65,
      squashTimer: 0.30,
      isWebbed: false,     // 是否被腐化蛛丝封印瘫痪
      webHealth: 0,        // 蛛丝血量（需点击3次解救）
      webMaxHealth: 3,
      superchargeTimer: 0  // 能量肥料超频大招倒计时
    };

    const tile = map.getTile(col, row);
    tile.tower = tower;
    this.towers.push(tower);

    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 14, [PALETTE.GROUND_LIGHT, PALETTE.UI_SPORE], 25, 85, 0.2, 0.4, 4);
    }
    platform.playSfx('sfx_build');

    return tower;
  }

  /**
   * 获取指定炮塔当前可用的升级节点列表
   * - base -> ['lv1']
   * - lv1  -> ['a2', 'b2']
   * - a2   -> ['a3']
   * - b2   -> ['b3']
   * - a3/b3 -> []
   */
  getAvailableUpgrades(tower) {
    if (!tower || !tower.node || !tower.node.next) return [];
    return tower.node.next.map((nId) => tower.def.nodes[nId]).filter(Boolean);
  }

  /**
   * 5.3 升级炮塔：随时可升级，不重置攻击冷却，播放 6 帧形态过渡动画与闪光环
   */
  upgradeTower(tower, targetNodeId, economy, fx) {
    if (!tower) return false;
    const allowed = tower.node.next || [];
    if (allowed.indexOf(targetNodeId) === -1) return false;

    const nextNode = tower.def.nodes[targetNodeId];
    if (!nextNode) return false;
    if (!economy.spendSpores(nextNode.cost)) return false;

    // 升级生命提升与状态回满
    const hpBonus = (nextNode.branch ? 80 : 40);
    tower.maxHp += hpBonus;
    tower.hp = tower.maxHp;
    tower.dormantTimer = 0;
    tower.poisonTimer = 0;
    tower.node = nextNode;
    if (nextNode.branch) {
      tower.branch = nextNode.branch;
    }
    tower.totalInvested += nextNode.cost;

    // 播放 6 帧升级过渡动画
    tower.animState = 'upgrade';
    tower.animFrame = 0;
    tower.animTimer = 0;
    tower.upgradeAnimTimer = 0.42;

    if (fx) {
      const bColor = tower.branch === 'A'
        ? PALETTE.BRANCH_A
        : (tower.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.UPGRADE_LV1);
      fx.onUpgradeComplete(tower.x, tower.y, bColor);
    }

    return true;
  }

  /**
   * 5.3 切换索敌优先级
   */
  cyclePriority(tower) {
    if (!tower) return null;
    const list = tower.def.priorities || ['first'];
    if (list.length <= 1) return tower.priority;
    const idx = list.indexOf(tower.priority);
    tower.priority = list[(idx + 1) % list.length];
    platform.playSfx('sfx_click');
    return tower.priority;
  }

  /**
   * 5.2 & 5.3 出售炮塔：随时可出售，返还已投入总额的 60%
   */
  removeTower(tower) {
    if (!tower) return;
    const idx = this.towers.indexOf(tower);
    if (idx !== -1) {
      this.towers.splice(idx, 1);
    }
  }

  sellTower(tower, map, economy, fx) {
    if (!tower) return 0;
    const refund = economy.calculateSellRefund(tower.totalInvested);
    economy.addSpores(refund);

    const tile = map.getTile(tower.col, tower.row);
    if (tile && tile.tower === tower) {
      tile.tower = null;
    }

    const idx = this.towers.indexOf(tower);
    if (idx !== -1) {
      this.towers.splice(idx, 1);
    }

    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 16, [PALETTE.UI_SPORE, PALETTE.MUSHROOM_GILL], 30, 95, 0.2, 0.45, 4);
      fx.spawnFloatingText(tower.x, tower.y - 8, '+' + refund, PALETTE.UI_SPORE, 1.15);
    }
    platform.playSfx('sfx_sell');

    return refund;
  }

  /**
   * 根据炮塔射程、对地/对空能力与索敌优先级筛选最佳目标
   */
  selectTarget(tower, aliveEnemies, map) {
    const rangePx = tower.node.range * TILE_SIZE;
    const r2 = rangePx * rangePx;
    const canGround = tower.def.canHitGround;
    const canAir = tower.def.canHitAir;

    const candidates = [];
    for (let i = 0; i < aliveEnemies.length; i++) {
      const e = aliveEnemies[i];
      if (e.state === 'death') continue;
      if (e.isFlying && !canAir) continue;
      if (!e.isFlying && !canGround) continue;

      const dx = e.x - tower.x;
      const dy = e.y - tower.y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2) {
        candidates.push({ enemy: e, d2 });
      }
    }

    if (candidates.length === 0) return null;
    if (this.tacticalTargeting) {
      const chosen = this.tacticalTargeting.pickTarget(tower, candidates.map(c => c.enemy), map);
      if (chosen) return chosen;
    }

    const prio = tower.priority;

    if (prio === 'nearest') {
      candidates.sort((a, b) => a.d2 - b.d2);
      return candidates[0].enemy;
    }

    if (prio === 'highest_hp') {
      candidates.sort((a, b) => {
        if (b.enemy.hp !== a.enemy.hp) return b.enemy.hp - a.enemy.hp;
        return b.enemy.distPx - a.enemy.distPx;
      });
      return candidates[0].enemy;
    }

    if (prio === 'densest') {
      // 计算每个候选敌人周围（雾团半径或爆裂溅射半径内）的同伴数量
      const clusterRadiusTiles = tower.node.cloudRadius || tower.node.splashRadius || 1.5;
      const cr2 = (clusterRadiusTiles * TILE_SIZE) * (clusterRadiusTiles * TILE_SIZE);

      let bestEnemy = candidates[0].enemy;
      let bestNeighbors = -1;
      let bestProgress = -1;

      for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i].enemy;
        let neighbors = 0;
        for (let j = 0; j < aliveEnemies.length; j++) {
          const other = aliveEnemies[j];
          if (other.state === 'death') continue;
          if (other.isFlying && !canAir) continue;
          if (!other.isFlying && !canGround) continue;
          const dx = other.x - cand.x;
          const dy = other.y - cand.y;
          if (dx * dx + dy * dy <= cr2) {
            neighbors += 1;
          }
        }
        const routeLen = cand.isFlying ? map.airRoute.totalLengthPx : map.groundRoute.totalLengthPx;
        const progress = cand.distPx / Math.max(1, routeLen);
        if (neighbors > bestNeighbors || (neighbors === bestNeighbors && progress > bestProgress)) {
          bestNeighbors = neighbors;
          bestProgress = progress;
          bestEnemy = cand;
        }
      }
      return bestEnemy;
    }

    // 默认 'first'（最前：按距离仓库终点的完成度排序）
    let firstEnemy = candidates[0].enemy;
    let maxProgress = -1;
    for (let i = 0; i < candidates.length; i++) {
      const e = candidates[i].enemy;
      const routeLen = e.isFlying ? map.airRoute.totalLengthPx : map.groundRoute.totalLengthPx;
      const prog = e.distPx / Math.max(1, routeLen);
      if (prog > maxProgress) {
        maxProgress = prog;
        firstEnemy = e;
      }
    }
    return firstEnemy;
  }

  damageTower(tower, dmg, attacker, fx) {
    if (!tower || tower.dormantTimer > 0) return;
    tower.hp -= dmg;
    tower.hitWobbleTimer = 0.22;
    if (fx) {
      fx.spawnParticles(tower.x, tower.y - 8, 4, [PALETTE.MUSHROOM_CAP, PALETTE.UI_SPORE], 20, 60, 0.15, 0.25, 3);
      fx.spawnFloatingText(tower.x, tower.y - 14, `-${Math.round(dmg)}`, '#FF7875', 0.95);
    }
    // 荆棘菇被动反伤
    if (tower.typeId === 'thorn' && attacker && attacker.state !== 'death') {
      const reflect = Math.round(dmg * 1.5);
      attacker.hp -= reflect;
      if (fx) {
        fx.spawnFloatingText(attacker.x, attacker.y - 12, `反伤 -${reflect}`, PALETTE.BRANCH_B, 1.0);
        fx.spawnParticles(attacker.x, attacker.y, 6, [PALETTE.BRANCH_B, '#FFE58F'], 30, 80, 0.2, 0.35, 4);
      }
    }
    if (tower.hp <= 0) {
      tower.hp = 0;
      tower.dormantTimer = 8.0; // 陷入休眠 8 秒
      if (fx) {
        fx.showBanner('防御塔枯萎休眠！', '#FF7875', `${i18n.t(tower.def.nameKey)} 暂时失去战斗力`, 1.3);
      }
    }
  }

  healTower(tower, amount, isFullRevive = false, fx = null) {
    if (!tower) return;
    if (isFullRevive) {
      tower.hp = tower.maxHp;
      tower.dormantTimer = 0;
      tower.poisonTimer = 0;
      tower.buffTimer = 6.0; // 甘霖狂暴 6 秒
    } else {
      tower.hp = Math.min(tower.maxHp, tower.hp + amount);
      if (tower.hp > 0) tower.dormantTimer = 0;
    }
    if (fx) {
      fx.spawnParticles(tower.x, tower.y - 10, 8, ['#52C41A', '#B7EB8F', '#FFE58F'], 25, 75, 0.2, 0.4, 4);
      fx.spawnFloatingText(tower.x, tower.y - 16, '+HP 苏醒', '#52C41A', 1.05);
    }
  }

  /**
   * 固定步长更新所有炮塔的索敌、发射与动画帧
   */

  /**
   * 计算发光菌丝共振网络 (Mycelium Synergy Network)
   * 相邻距离 <= 2.5 格 (80px) 的防御塔建立地下发光菌丝连协
   */
  updateMyceliumNetwork() {
    this.networkEdges.length = 0;
    const n = this.towers.length;
    if (n < 2) {
      if (n === 1) this.towers[0].synergies = null;
      return;
    }

    const maxDist = 135; // 4.2 格 * 32，覆盖相邻拐角战术塔位
    const adj = Array.from({ length: n }, () => []);

    for (let i = 0; i < n; i++) {
      const tA = this.towers[i];
      for (let j = i + 1; j < n; j++) {
        const tB = this.towers[j];
        const dist = Math.hypot(tA.x - tB.x, tA.y - tB.y);
        if (dist <= maxDist) {
          this.networkEdges.push({ a: tA, b: tB });
          adj[i].push(j);
          adj[j].push(i);
        }
      }
    }

    // 连通分量遍历
    const visited = new Array(n).fill(false);
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      const comp = [];
      const queue = [i];
      visited[i] = true;
      while (queue.length > 0) {
        const cur = queue.shift();
        comp.push(this.towers[cur]);
        for (let next of adj[cur]) {
          if (!visited[next]) {
            visited[next] = true;
            queue.push(next);
          }
        }
      }

      // 计算该连通块内的激活羁绊
      const types = new Set(comp.map(t => t.typeId));
      const watchCount = comp.filter(t => t.typeId === 'watch').length;
      const syn = {
        hasTwinWatch: watchCount >= 2,
        hasToxicBurst: types.has('mist') && types.has('burst'),
        hasPoisonThorn: types.has('mist') && types.has('thorn'),
        hasGrandResonance: types.size >= 4
      };

      for (let t of comp) {
        t.synergies = syn;
      }
    }
  }

  /**
   * 绘制地面层发光地下菌丝脉络（在防御塔绘制之前）
   */
  renderMyceliumNetwork(ctx) {
    if (this.networkEdges.length === 0) return;

    for (let i = 0; i < this.networkEdges.length; i++) {
      const edge = this.networkEdges[i];
      const a = edge.a;
      const b = edge.b;

      ctx.save();
      const midX = (a.x + b.x) * 0.5;
      const midY = (a.y + b.y) * 0.5 + 4;

      const isGrand = a.synergies && a.synergies.hasGrandResonance;
      // 极轻柔、低饱和、半透明的自然菌根微光质感（透明度仅 0.12 ~ 0.16，绝不喧宾夺主）
      const glowColor = isGrand ? 'rgba(255, 215, 0, 0.08)' : 'rgba(82, 196, 26, 0.06)';
      const coreColor = isGrand ? 'rgba(255, 235, 140, 0.16)' : 'rgba(180, 255, 210, 0.13)';

      // 1. 柔和半透明地下根须微光底晕
      ctx.save();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y + 8);
      ctx.quadraticCurveTo(midX, midY + 8, b.x, b.y + 8);
      ctx.stroke();

      // 2. 纤细极浅地下自然发光菌丝脉络 (1.0px)
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y + 8);
      ctx.quadraticCurveTo(midX, midY + 8, b.x, b.y + 8);
      ctx.stroke();
      ctx.restore();

      // 3. 极微弱的流动孢子光子 (透明度 0.20)
      const tProg = ((this.animTimer || 0) * 0.35 + i * 0.33) % 1.0;
      const inv = 1 - tProg;
      const nodeX = inv * inv * a.x + 2 * inv * tProg * midX + tProg * tProg * b.x;
      const nodeY = inv * inv * (a.y + 8) + 2 * inv * tProg * (midY + 8) + tProg * tProg * (b.y + 8);
      ctx.fillStyle = isGrand ? 'rgba(255, 229, 143, 0.22)' : 'rgba(186, 231, 255, 0.18)';
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  update(dt, map, enemyManager, bulletManager, economy = null, fx = null, sporelingPatrol = null) {
    this.animTimer += dt;
    this.networkTimer += dt;
    if (this.networkTimer >= 0.4) {
      this.networkTimer = 0;
      this.updateMyceliumNetwork();
    }
    const aliveEnemies = enemyManager.getAliveEnemies();

    for (let i = 0; i < this.towers.length; i++) {
      const t = this.towers[i];

      // 落地 Squash & Stretch 弹性回弹计算
      if (t.squashTimer > 0) {
        t.squashTimer -= dt;
        const p = Math.max(0, t.squashTimer) / 0.30;
        t.squashScaleX = 1.0 + Math.sin(p * Math.PI * 2) * 0.35 * p;
        t.squashScaleY = 1.0 - Math.sin(p * Math.PI * 2) * 0.35 * p;
        if (t.squashTimer <= 0) {
          t.squashScaleX = 1.0;
          t.squashScaleY = 1.0;
        }
      }

      // 超频爆发大招倒计时
      if (t.superchargeTimer > 0) {
        t.superchargeTimer = Math.max(0, t.superchargeTimer - dt);
      }

      // 被蛛丝封印瘫痪
      if (t.isWebbed) {
        t.animState = 'idle';
        continue; // 蛛丝封印中无法索敌攻击
      }

      // 状态计时器推进
      if (t.hitWobbleTimer > 0) {
        t.hitWobbleTimer = Math.max(0, t.hitWobbleTimer - dt);
      }
      if (t.poisonTimer > 0) {
        t.poisonTimer = Math.max(0, t.poisonTimer - dt);
      }
      if (t.buffTimer > 0) {
        t.buffTimer = Math.max(0, t.buffTimer - dt);
      }
      if (t.dormantTimer > 0) {
        t.dormantTimer = Math.max(0, t.dormantTimer - dt);
        if (t.dormantTimer <= 0) {
          t.hp = Math.round(t.maxHp * 0.5); // 自然复苏恢复 50% HP
        }
        continue; // 处于枯萎休眠状态，暂停攻击
      }

      // 冷却递减（狂暴加速，中毒减速，超频4倍射速）
      let speedCoeff = (t.superchargeTimer > 0 ? 2.2 : (t.buffTimer > 0 ? 1.6 : 1.0)) * (t.poisonTimer > 0 ? 0.65 : 1.0);
      if (t.synergies && t.synergies.hasGrandResonance) {
        speedCoeff *= 1.15;
      }
      if (t.cooldown > 0) {
        t.cooldown = Math.max(0, t.cooldown - dt * speedCoeff);
      }

      // 5th Guardian Lumina: Spore Harvest, Healing Pulse & Holy Ward
      if (t.typeId === 'lumina') {
        t.sporeHarvestTimer = (t.sporeHarvestTimer || 0) + dt * speedCoeff;
        const hInterval = t.node.sporeInterval || 10.0;
        if (t.sporeHarvestTimer >= hInterval) {
          t.sporeHarvestTimer = 0;
          const gen = t.node.sporeGen || 8;
          if (economy) {
            economy.addSpores(gen);
          }
          if (fx) {
            fx.spawnFloatingText(t.x, t.y - 24, `+${gen} 孢子`, '#FFE58F', 1.15);
            if (fx.spawnShockwave) fx.spawnShockwave(t.x, t.y, 32, '#FFE58F'); else if (fx.spawnRing) fx.spawnRing(t.x, t.y, 32, '#FFE58F', 0.35, false);
          }
          platform.playSfx('sfx_coin');

          // Healing pulse to wounded guards
          if (sporelingPatrol && t.node.healPerPulse) {
            sporelingPatrol.healGuards(t.x, t.y, t.node.range * TILE_SIZE, t.node.healPerPulse);
            if (fx) {
              fx.spawnParticles(t.x, t.y, 8, ['#52C41A', '#FFE58F'], 20, 40);
            }
          }

          // Holy Ward cleanse against webs & acid
          if (t.node.holyWard) {
            const radPx = t.node.range * TILE_SIZE;
            for (let j = 0; j < this.towers.length; j++) {
              const ot = this.towers[j];
              if (Math.hypot(ot.x - t.x, ot.y - t.y) <= radPx) {
                if (ot.isWebbed || ot.poisonTimer > 0) {
                  ot.isWebbed = false;
                  ot.poisonTimer = 0;
                  if (fx) {
                    fx.spawnFloatingText(ot.x, ot.y - 20, '圣幕净化!', '#BAE7FF', 1.0);
                    fx.spawnParticles(ot.x, ot.y, 8, ['#BAE7FF', '#FFFFFF'], 15, 30);
                  }
                }
              }
            }
          }
        }
      }

      // 升级过渡 6 帧动画或攻击 3 帧动画或待机 4 帧动画更新
      if (t.upgradeAnimTimer > 0) {
        t.upgradeAnimTimer -= dt;
        t.animState = 'upgrade';
        const prog = 1 - Math.max(0, t.upgradeAnimTimer) / 0.42;
        t.animFrame = Math.min(5, Math.floor(prog * 6));
        if (t.upgradeAnimTimer <= 0) {
          t.animState = 'idle';
          t.animFrame = 0;
        }
      } else if (t.attackAnimTimer > 0) {
        t.attackAnimTimer -= dt;
        t.animState = 'attack';
        const prog = 1 - Math.max(0, t.attackAnimTimer) / 0.21;
        t.animFrame = Math.min(2, Math.floor(prog * 3));
        if (t.attackAnimTimer <= 0) {
          t.animState = 'idle';
          t.animFrame = 0;
        }
      } else {
        t.animState = 'idle';
        t.animTimer += dt;
        if (t.animTimer >= 0.18) {
          t.animTimer = 0;
          t.animFrame = (t.animFrame + 1) % 4;
        }
      }

      // 冷却就绪时尝试索敌并开火
      if (t.cooldown <= 0 && aliveEnemies.length > 0) {
        const target = this.selectTarget(t, aliveEnemies, map);
        if (target) {
          this.fireTower(t, target, map, enemyManager, bulletManager);
          t.cooldown = t.node.interval;
          if (t.upgradeAnimTimer <= 0) {
            t.attackAnimTimer = 0.21;
            t.animState = 'attack';
            t.animFrame = 0;
          }
        }
      }
    }
  }

  fireTower(tower, target, map, enemyManager, bulletManager) {
    const node = tower.node;
    const baseDmg = tower.def.baseDamage;

    if (tower.typeId === 'watch') {
      const dist = Math.hypot(target.x - tower.x, target.y - tower.y);
      const travelSec = dist / (node.bulletSpeed || 640);
      const pred = enemyManager.predictEnemyPosition(target, travelSec, map);
      const watchNode = Object.assign({}, node);
      if (tower.synergies && tower.synergies.hasTwinWatch) {
        watchNode.critChance = (watchNode.critChance || 0) + 0.20;
      }
      bulletManager.spawnWatchBullet(tower.x, tower.y - 10, target, pred.x, pred.y, watchNode, baseDmg);
      if (this.mushroomMastery && this.mushroomMastery.hasMastery('watch', 'watch_m2')) {
        if (Math.random() < 0.22) {
          bulletManager.spawnWatchBullet(tower.x + 6, tower.y - 12, target, pred.x + 8, pred.y + 4, watchNode, baseDmg);
        }
      }
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'mist') {
      bulletManager.spawnMistCloud(target.x, target.y, node);
      platform.playSfx('sfx_mist');
    } else if (tower.typeId === 'thorn') {
      const dist = Math.hypot(target.x - tower.x, target.y - tower.y);
      const travelSec = dist / (node.bulletSpeed || 900);
      const pred = enemyManager.predictEnemyPosition(target, travelSec, map);
      const baseAngle = Math.atan2(pred.y - tower.y, pred.x - tower.x);

      // 主刺
      const thornOpts = { hasPoisonThorn: tower.synergies && tower.synergies.hasPoisonThorn };
      bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle, node, baseDmg, 1.0, thornOpts);

      // A3 箭袋：每次齐射增加 2 根侧刺（左右各偏 12°），侧刺伤害 50%
      if (node.sideSpikes && node.sideSpikes >= 2) {
        const deltaRad = ((node.sideAngleDeg || 12) * Math.PI) / 180;
        const sideRatio = node.sideDamageRatio || 0.50;
        bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle - deltaRad, node, baseDmg, sideRatio);
        bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle + deltaRad, node, baseDmg, sideRatio);
      }
      platform.playSfx('sfx_thorn');
    } else if (tower.typeId === 'burst') {
      const pred = enemyManager.predictEnemyPosition(target, node.flightTime || 0.38, map);
      const burstOpts = { hasToxicBurst: tower.synergies && tower.synergies.hasToxicBurst };
      bulletManager.spawnBurstShell(tower.x, tower.y - 12, pred.x, pred.y, node, baseDmg, burstOpts);
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'lumina') {
      bulletManager.spawnLuminaRay(tower.x, tower.y - 10, target, node, baseDmg);
      platform.playSfx('sfx_laser');
    }
  }

  /**
   * 绘制所有已建造的蘑菇炮塔及其形态徽章
   */
  render(ctx) {
    // 按行从上到下排序绘制，保证 16x24 高塔的前后遮挡关系自然
    this.towers.sort((a, b) => a.row - b.row || a.col - b.col);

    for (let i = 0; i < this.towers.length; i++) {
      const t = this.towers[i];
      let tileX = t.col * TILE_SIZE;
      let tileY = t.row * TILE_SIZE;

      // 受击弹性微晃
      if (t.hitWobbleTimer > 0) {
        tileX += Math.round(Math.sin(t.hitWobbleTimer * 30) * 2.5);
      }

      // 甘霖狂暴脚底翠绿魔法光环
      if (t.buffTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#52C41A';
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.75 + Math.sin(t.buffTimer * 10) * 0.25;
        ctx.beginPath();
        ctx.ellipse(t.x, t.y + 10, 16, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 休眠状态时透明度降低并微偏暗
      if (t.dormantTimer > 0) {
        ctx.save();
        ctx.globalAlpha = 0.55;
      }

      // 落地 Squash & Stretch 弹性变形绘制
      const isSquashing = t.squashTimer > 0;
      if (isSquashing) {
        ctx.save();
        ctx.translate(t.x, tileY + 24);
        ctx.scale(t.squashScaleX, t.squashScaleY);
        ctx.translate(-t.x, -(tileY + 24));
      }

      // 超频大招彩虹金色光芒
      if (t.superchargeTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.8 + Math.sin(t.superchargeTimer * 15) * 0.2;
        ctx.beginPath();
        ctx.ellipse(t.x, t.y + 10, 18, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (t.typeId === 'lumina') {
        // 直接使用 100% 纯正 AI 手绘金色神圣丰收蘑菇，与拖拽种植预览完全一致的模型！
        ctx.save();
        const breathe = 1.0 + Math.sin((t.animTimer || 0) * 4) * 0.04;

        // 地面柔和软接触阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(t.x, tileY + 24, 18 * breathe, 8 * breathe, 0, 0, Math.PI * 2);
        ctx.fill();

        // 柔和神圣阳光呼吸微光光晕 (暖金光圈)
        const glowAlpha = 0.22 + Math.sin((t.animTimer || 0) * 3) * 0.08;
        const gGrad = ctx.createRadialGradient(t.x, tileY + 12, 4, t.x, tileY + 12, 28 * breathe);
        gGrad.addColorStop(0, `rgba(255, 235, 140, ${glowAlpha})`);
        gGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gGrad;
        ctx.beginPath();
        ctx.arc(t.x, tileY + 12, 28 * breathe, 0, Math.PI * 2);
        ctx.fill();

        let artPath = 'assets/vfx/prop_lumina_base.png';
        if (t.branch === 'A') artPath = 'assets/vfx/prop_lumina_a.png';
        else if (t.branch === 'B') artPath = 'assets/vfx/prop_lumina_b.png';
        let lImg = platform.getImage(artPath);
        if (!lImg || !lImg.width) {
          lImg = platform.getImage('assets/vfx/relic_lumina.png') || platform.getImage('assets/vfx/relic_amber.png');
        }

        if (lImg && lImg.width) {
          const dw = 48 * breathe;
          const dh = 48 * breathe;
          ctx.drawImage(lImg, t.x - dw * 0.5, tileY - 18 + (1 - breathe) * 4, dw, dh);
        }
        ctx.restore();
        platform.recordDrawCall(1);
      } else {
        const drawn = drawTowerSprite(ctx, t.typeId, t.nodeId, t.animState, t.animFrame, tileX, tileY);
      if (t.isSelected && this.tacticalTargeting) {
        this.tacticalTargeting.renderSelectedTacticalBadge(ctx, t, false);
      }
        if (!drawn) {
          ctx.fillStyle = t.branch === 'A' ? PALETTE.BRANCH_A : (t.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.MUSHROOM_CAP);
          ctx.fillRect(tileX + 4, tileY - 8, 24, 36);
          platform.recordDrawCall(1);
        }
      }
      if (isSquashing) {
        ctx.restore();
      }

      // 腐化蛛丝封印茧：纯 AI 手绘高质感透光蚕茧 vfx_web_cocoon.png
      if (t.isWebbed) {
        ctx.save();
        const webImg = platform.getImage('assets/vfx/vfx_web_cocoon.png');
        const breathe = 1.0 + Math.sin((t.animTimer || 0) * 5) * 0.04;
        const webSize = Math.round(52 * breathe);
        if (webImg && webImg.width) {
          ctx.globalAlpha = 0.92;
          ctx.drawImage(webImg, Math.round(t.x - webSize * 0.5), Math.round(tileY + 12 - webSize * 0.5), webSize, webSize);
        } else {
          ctx.strokeStyle = 'rgba(230, 245, 255, 0.85)';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(t.x, tileY + 12, 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 头顶微操解救气泡标签：精致圆角药丸胶囊
        const badgeW = 74;
        const badgeH = 18;
        const badgeX = Math.round(t.x - badgeW * 0.5);
        const badgeY = tileY - 20;

        ctx.globalAlpha = 0.95;
        ctx.fillStyle = 'rgba(20, 36, 48, 0.88)';
        ctx.beginPath();
        const r = 9;
        ctx.moveTo(badgeX + r, badgeY);
        ctx.lineTo(badgeX + badgeW - r, badgeY);
        ctx.arc(badgeX + badgeW - r, badgeY + r, r, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.lineTo(badgeX + r, badgeY + badgeH);
        ctx.arc(badgeX + r, badgeY + r, r, Math.PI * 0.5, -Math.PI * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#91D5FF';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // 3 颗蛛丝节点状态点
        for (let b = 0; b < 3; b++) {
          const bx = badgeX + 12 + b * 9;
          ctx.beginPath();
          ctx.arc(bx, badgeY + 9, 2.8, 0, Math.PI * 2);
          if (b < t.webHealth) {
            ctx.fillStyle = '#40A9FF';
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(bx - 0.7, badgeY + 8, 1, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#30404D';
            ctx.fill();
          }
        }

        ctx.fillStyle = '#E6F7FF';
        ctx.font = 'bold 9px "PingFang SC", "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('连击救援', badgeX + 38, badgeY + 9);
        ctx.restore();
      }

      if (t.dormantTimer > 0) {
        ctx.restore();
        // 头顶休眠昏睡标记
        ctx.save();
        ctx.fillStyle = '#FF7875';
        ctx.font = 'bold 11px "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('休眠 zZ', t.x, tileY - 14);
        ctx.restore();
      }

      // 受创未满血时显示微型木纹小血条
      if (t.hp < t.maxHp && t.hp > 0) {
        ctx.save();
        const barW = 26;
        const barH = 4;
        const barX = Math.round(t.x - barW * 0.5);
        const barY = tileY - 10;
        // 木纹底槽
        ctx.fillStyle = 'rgba(20, 12, 6, 0.85)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        // 血条填充（绿 -> 橙 -> 红）
        const hpRatio = Math.max(0, t.hp / t.maxHp);
        ctx.fillStyle = hpRatio > 0.5 ? '#52C41A' : (hpRatio > 0.25 ? '#FAAD14' : '#F5222D');
        ctx.fillRect(barX, barY, Math.round(barW * hpRatio), barH);
        ctx.restore();
        platform.recordDrawCall(2);
      }
    }
  }

  /**
   * 敌人腐化织网蛛对防御塔喷丝封印
   */
  applyWeb(tower, webHp = 3, fx = null) {
    if (!tower || tower.isWebbed || tower.dormantTimer > 0) return false;
    tower.isWebbed = true;
    tower.webHealth = webHp;
    tower.webMaxHealth = webHp;
    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 16, ['#FFFFFF', '#E6F7FF', '#D9D9D9'], 20, 70, 0.2, 0.45, 3.5);
      fx.spawnFloatingText(tower.x, tower.y - 18, '蛛网封印!', '#FF7875', 1.1);
    }
    platform.playSfx('sfx_hurt');
    return true;
  }

  /**
   * 玩家点击或释放净化法术撕碎蛛丝解救防御塔
   */
  rescueWeb(tower, fx = null, economy = null) {
    if (!tower || !tower.isWebbed) return false;
    tower.webHealth -= 1;
    if (economy) {
      economy.addSpores(5);
    }
    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 8, ['#E6F7FF', '#BAE7FF', '#FFFFFF'], 20, 60, 0.2, 0.4, 2.5);
      fx.spawnFloatingText(tower.x, tower.y - 20, `-1 破丝 (+5 孢子)`, '#BAE7FF', 0.9);
    }
    platform.playSfx('sfx_laser');

    if (tower.webHealth <= 0) {
      tower.isWebbed = false;
      tower.webHealth = 0;
      this.applySupercharge(tower, 4.5, fx);
      if (fx) {
        fx.spawnParticles(tower.x, tower.y, 28, ['#FFD700', '#FFF1B8', '#69C0FF', '#FFFFFF'], 35, 110, 0.35, 0.65, 4);
        fx.spawnFloatingText(tower.x, tower.y - 30, '挣脱! 破茧狂暴+30%!', '#FFD700', 1.4);
      }
      platform.playSfx('sfx_upgrade');
    }
    return true;
  }
  _unusedRescueWeb(tower, fx = null) {
    if (!tower || !tower.isWebbed) return false;
    tower.webHealth -= 1;
    tower.hitWobbleTimer = 0.15;
    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 6, ['#FFFFFF', '#BAE7FF'], 25, 60, 0.15, 0.25, 2.5);
    }
    if (tower.webHealth <= 0) {
      tower.isWebbed = false;
      tower.webHealth = 0;
      if (fx) {
        fx.spawnParticles(tower.x, tower.y, 20, ['#52C41A', '#FFFFFF', '#BAE7FF'], 40, 95, 0.25, 0.5, 4);
        fx.spawnFloatingText(tower.x, tower.y - 18, '蛛丝破除! 恢复攻击', '#52C41A', 1.15);
      }
      platform.playSfx('sfx_upgrade');
      return true;
    } else {
      platform.playSfx('sfx_click');
    }
    return false;
  }

  /**
   * 施加能量肥料超频大招
   */
  applySupercharge(tower, durationSec = 4.0, fx = null) {
    if (!tower) return;
    tower.superchargeTimer = durationSec;
    tower.isWebbed = false;
    tower.dormantTimer = 0;
    if (fx) {
      fx.triggerScreenShake(3.5, 0.18);
      fx.spawnParticles(tower.x, tower.y, 25, ['#FFE58F', '#FFD666', '#52C41A'], 50, 120, 0.3, 0.6, 5);
      fx.spawnFloatingText(tower.x, tower.y - 20, '超频过载!', '#FFD666', 1.3);
    }
    platform.playSfx('sfx_upgrade');
  }

  /**
   * 触发植物灵能觉醒超载大招（PvZ 能量豆机制对标）
   * 瞬间驱散全异常、满血复原并释放全屏级专属大招！
   */
  triggerAwakening(tower, scene, fx, economy) {
    if (!tower) return false;
    tower.hp = tower.maxHp;
    tower.isWebbed = false;
    tower.poisonTimer = 0;
    tower.dormantTimer = 0;
    tower.superchargeTimer = 8.0;
    tower.animState = 'upgrade';
    tower.squashScaleX = 1.45;
    tower.squashScaleY = 0.55;
    tower.squashTimer = 0.45;

    platform.playSfx('sfx_upgrade');
    if (fx) {
      fx.triggerScreenShake(6.0, 0.45);
      if (fx.spawnShockwave) fx.spawnShockwave(tower.x, tower.y, 110, '#52C41A');
      fx.spawnParticles(tower.x, tower.y, 45, ['#52C41A', '#FFD700', '#FFFFFF', '#69C0FF'], 50, 180, 0.35, 0.85, 6);
    }

    const em = scene ? scene.enemyManager : null;
    const bm = scene ? scene.bulletManager : null;

    if (tower.typeId === 'watch') {
      // 瞭望菇·【千里巡林】：3.5 秒内对全屏所有目标疯狂倾泻 30 发破甲追踪金矢
      if (fx) fx.showBanner('千里巡林·万矢齐发！', '#FFD700', '百步穿杨，全屏贯穿！', 1.8);
      platform.playSfx('sfx_shoot');
      if (em && bm) {
        for (let i = 0; i < 30; i++) {
          setTimeout(() => {
            const targets = em.getAliveEnemies();
            if (targets.length === 0) return;
            const target = targets[i % targets.length];
            bm.spawnArrow(tower.x, tower.y - 14, target, tower.node, 55, true);
            if (i % 3 === 0) platform.playSfx('sfx_shoot');
          }, i * 85);
        }
      }
    } else if (tower.typeId === 'thorn') {
      // 尖刺菇·【千刃地刺】：全场所有地面敌人脚下爆发巨大荆棘地刺，全体定身 4 秒并撕裂
      if (fx) fx.showBanner('千刃荆棘·地刺破空！', '#52C41A', '棘蔓裂土，全域缚杀！', 1.8);
      platform.playSfx('sfx_thorn');
      if (em) {
        const alive = em.getAliveEnemies();
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i];
          if (!e.isFlying && e.state !== 'death') {
            em.applyDamage(e, 260, false, 'pierce', fx, null);
            e.activeSlow = 0.95;
            e.residualSlowValue = 0.90;
            e.residualSlowTimer = 4.0;
            if (fx) {
              fx.spawnParticles(e.x, e.y, 14, ['#52C41A', '#389E0D', '#FF4D4F'], 25, 70, 0.2, 0.45, 4.5);
              if (fx.spawnShockwave) fx.spawnShockwave(e.x, e.y, 40, '#52C41A');
            }
          }
        }
      }
    } else if (tower.typeId === 'burst') {
      // 爆裂菇·【熔岩地核炮】：发射巨型燃烧地核陨石，全屏轰杀并留下熔岩焦土
      if (fx) fx.showBanner('熔岩地核·天坠轰击！', '#FF4D4F', '地心炽炎，全屏熔解！', 1.8);
      platform.playSfx('sfx_bomb');
      if (em && bm) {
        const alive = em.getAliveEnemies();
        const target = alive.length > 0 ? alive[0] : { x: 480, y: 270 };
        bm.spawnCannonball(tower.x, tower.y - 16, target, tower.node, 450);
        setTimeout(() => {
          if (fx) {
            fx.triggerScreenShake(8.0, 0.65);
            if (fx.spawnShockwave) fx.spawnShockwave(target.x, target.y, 160, '#FF4D4F');
            fx.spawnParticles(target.x, target.y, 65, ['#FF4D4F', '#FFA940', '#FFE58F', '#5C4028'], 60, 240, 0.4, 0.95, 7.5);
          }
          if (em) {
            const targets = em.getAliveEnemies();
            for (let i = 0; i < targets.length; i++) {
              const e = targets[i];
              if (Math.hypot(e.x - target.x, e.y - target.y) <= 180) {
                em.applyDamage(e, 420, true, 'splash', fx, null);
              }
            }
          }
        }, 420);
      }
    } else if (tower.typeId === 'mist') {
      // 雾菇·【幽冥剧毒风暴】：全屏剧毒浓雾，敌人减速 85%，护甲削减至 0
      if (fx) fx.showBanner('幽冥瘴气·剧毒风暴！', '#722ED1', '毒雾滔天，护甲消融！', 1.8);
      platform.playSfx('sfx_laser');
      if (em) {
        const alive = em.getAliveEnemies();
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i];
          if (e.state !== 'death') {
            em.applyDamage(e, 160, false, 'magic', fx, null);
            e.baseArmor = 0;
            e.activeSlow = 0.85;
            e.residualSlowValue = 0.85;
            e.residualSlowTimer = 6.5;
            if (fx) fx.spawnParticles(e.x, e.y, 12, ['#B37FEB', '#722ED1', '#BAE7FF'], 20, 65, 0.2, 0.45, 4);
          }
        }
      }
    } else if (tower.typeId === 'lumina') {
      // 灵光菇·【天穹极光圣幕】：全图喷发 150 孢子，全场防御塔获得 8 秒圣幕与双倍攻速
      if (fx) fx.showBanner('天穹极光·万木逢春！', '#FFE58F', '丰饶神迹，极光永驻！', 1.8);
      platform.playSfx('sfx_coin');
      if (economy) {
        economy.addSpores(150);
      }
      if (scene && scene.towerManager) {
        const tws = scene.towerManager.towers;
        for (let i = 0; i < tws.length; i++) {
          const ot = tws[i];
          ot.isWebbed = false;
          ot.poisonTimer = 0;
          ot.dormantTimer = 0;
          ot.superchargeTimer = 8.0;
          if (fx) {
            fx.spawnFloatingText(ot.x, ot.y - 24, '极光狂暴+100%!', '#FFE58F', 1.3);
            fx.spawnParticles(ot.x, ot.y, 14, ['#FFE58F', '#52C41A', '#FFFFFF'], 25, 55, 0.2, 0.45, 4);
          }
        }
      }
    }
    return true;
  }
}

module.exports = TowerManager;
