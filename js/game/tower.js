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
    this.towersDirty = true;
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
    const maxHp = typeId === 'thorn' ? 720 : (typeId === 'burst' ? 280 : (typeId === 'mist' ? 240 : (typeId === 'lumina' ? 180 : 220)));
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
        recoilTimer: 0,
      isWebbed: false,     // 是否被腐化蛛丝封印瘫痪
      webHealth: 0,        // 蛛丝血量（需点击3次解救）
      webMaxHealth: 3,
      superchargeTimer: 0, // 能量肥料超频大招倒计时
      totalDamage: 0,
      kills: 0
    };

    const tile = map.getTile(col, row);
    tile.tower = tower;
    this.towers.push(tower);
    this.towersDirty = true;

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
    tower.nodeId = targetNodeId;
    tower.node = nextNode;
    tower.level = (targetNodeId === 'base' ? 1 : (targetNodeId === 'lv1' ? 2 : 3));
    if (nextNode.branch) {
      tower.branch = nextNode.branch;
    }
    tower.totalInvested += nextNode.cost;

    // 播放 6 帧升级过渡动画 + 弹性缩放反馈
    tower.animState = 'upgrade';
    tower.animFrame = 0;
    tower.animTimer = 0;
    tower.upgradeAnimTimer = 0.42;
    tower.squashScaleX = 1.32;
    tower.squashScaleY = 0.72;
    tower.squashTimer = 0.28;

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
    this.towersDirty = true;
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
    this.towersDirty = true;
    }

    if (fx) {
      fx.spawnParticles(tower.x, tower.y, 16, [PALETTE.UI_SPORE, PALETTE.MUSHROOM_GILL], 30, 95, 0.2, 0.45, 4);
      fx.spawnFloatingText(tower.x, tower.y - 8, '+' + refund, PALETTE.UI_SPORE, 1.15);
    }
    platform.playSfx('sfx_sell');

    return refund;
  }

  getEnemyRouteLength(map, enemy) {
    if (!map) return 1;
    if (enemy.isFlying) return (map.airRoute && map.airRoute.totalLengthPx) || 1;
    if (enemy.routeIndex === 1 && map.groundRoute2) return map.groundRoute2.totalLengthPx || 1;
    return (map.groundRoute && map.groundRoute.totalLengthPx) || 1;
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
        const routeLen = this.getEnemyRouteLength(map, cand);
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
      const routeLen = this.getEnemyRouteLength(map, e);
      const prog = e.distPx / Math.max(1, routeLen);
      if (prog > maxProgress) {
        maxProgress = prog;
        firstEnemy = e;
      }
    }
    return firstEnemy;
  }

  /**
   * 选择射程内可攻击的障碍物（集火优先，否则选最近）
   */
  selectObstacleTarget(tower, map, scene) {
    if (!map || !map.obstacles) return null;
    const rangePx = tower.node.range * TILE_SIZE;
    const r2 = rangePx * rangePx;

    // 1. 若玩家手动集火锁定了某个障碍物，优先判定该障碍物是否在射程内
    if (scene && scene.targetedObstacle && !scene.targetedObstacle.cleared) {
      const obs = scene.targetedObstacle;
      const dx = obs.x - tower.x;
      const dy = obs.y - tower.y;
      if (dx * dx + dy * dy <= r2) {
        return obs;
      }
    }

    // 2. 若玩家未指定，返回射程内最近的一个未清除障碍物
    let nearestObs = null;
    let minDist2 = Infinity;
    for (let i = 0; i < map.obstacles.length; i++) {
      const obs = map.obstacles[i];
      if (obs.cleared) continue;
      const dx = obs.x - tower.x;
      const dy = obs.y - tower.y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2 && d2 < minDist2) {
        minDist2 = d2;
        nearestObs = obs;
      }
    }
    return nearestObs;
  }

  destroyTower(tower, fx = null) {
    if (!tower) return;
    const scene = this.scene;
    const map = scene ? scene.map : null;

    // 1. 清空地图地块上的塔占用（使该战术坑位重新变为空闲灵土，必须重新花费孢子种植）
    if (map) {
      const tile = map.getTile(tower.col, tower.row);
      if (tile && tile.tower === tower) {
        tile.tower = null;
      }
    }

    // 2. 从防御塔管理列表中彻底移除（植物死了就是死了，真实阵亡不复生）
    const idx = this.towers.indexOf(tower);
    if (idx !== -1) {
      this.towers.splice(idx, 1);
    }
    this.towersDirty = true;

    // 3. 关闭选中和详情面板
    if (scene && scene.selectedTile && scene.selectedTile.col === tower.col && scene.selectedTile.row === tower.row) {
      scene.selectedTile = { col: -1, row: -1 };
      if (scene.ui) scene.ui.inspectorOpen = false;
    }

    // 4. 触发植物枯萎破碎粒子、阵亡音效与战局警报（阵亡 0 孢子返还）
    const effFx = fx || (scene ? scene.fx : null);
    if (effFx) {
      effFx.spawnParticles(tower.x, tower.y, 24, ['#8C6842', '#52C41A', '#389E0D', '#FF7875', '#5C381E'], 35, 90, 0.3, 0.65, 5);
      effFx.spawnFloatingText(tower.x, tower.y - 20, '🥀 植物阵亡！', '#FF4D4F', 1.6);
      const name = (tower.def && tower.def.nameKey) ? i18n.t(tower.def.nameKey) : '蘑菇卫士';
      effFx.showBanner('🥀 防线失守！', '#FF4D4F', `${name} 被虫潮击溃阵亡，战术坑位已空出！`, 2.0);
      effFx.triggerScreenShake(4.0, 0.3);
    }
    platform.playSfx('sfx_bomb');
  }

  damageTower(tower, dmg, attacker, fx) {
    if (!tower) return;
    const prevHp = tower.hp;
    tower.hp -= dmg;
    tower.hitWobbleTimer = 0.22;
    if (fx) {
      fx.spawnParticles(tower.x, tower.y - 8, 4, [PALETTE.MUSHROOM_CAP, PALETTE.UI_SPORE], 20, 60, 0.15, 0.25, 3);
      fx.spawnFloatingText(tower.x, tower.y - 14, `-${Math.round(dmg)}`, '#FF7875', 0.95);
    }
    // 反击荆棘
    if (tower.typeId === 'thorn' && attacker && attacker.state !== 'death') {
      const reflect = Math.round(dmg * 1.5);
      attacker.hp -= reflect;
      if (fx) {
        fx.spawnFloatingText(attacker.x, attacker.y - 12, `⚡ -${reflect}`, PALETTE.BRANCH_B, 1.0);
        fx.spawnParticles(attacker.x, attacker.y, 6, [PALETTE.BRANCH_B, '#FFE58F'], 30, 80, 0.2, 0.35, 4);
      }
    }

    // 濒死急救告警 (HP 降至 35% 以下时首次触发求援告警，引导玩家施放甘霖或调遣英雄协防)
    if (tower.hp > 0 && tower.hp / tower.maxHp <= 0.35 && (prevHp / tower.maxHp > 0.35 || !tower.dangerWarned)) {
      tower.dangerWarned = true;
      if (fx) {
        fx.spawnFloatingText(tower.x, tower.y - 24, '⚠️ 守卫垂危！求援！', '#FFA39E', 1.3);
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([20, 40, 20]); } catch (e) {}
      }
    }

    if (tower.hp <= 0) {
      tower.hp = 0;
      this.destroyTower(tower, fx);
    }
  }

  healTower(tower, amount, isFullRevive = false, fx = null) {
    if (!tower) return;
    if (isFullRevive) {
      tower.hp = tower.maxHp;
      tower.dormantTimer = 0;
      tower.poisonTimer = 0;
      tower.isWebbed = false; // 净化蛛丝封印
      tower.buffTimer = 6.0; // 甘霖狂暴 6 秒
    } else {
      tower.hp = Math.min(tower.maxHp, tower.hp + amount);
      if (tower.hp > tower.maxHp * 0.35) tower.dangerWarned = false;
      if (tower.hp > 0) tower.dormantTimer = 0;
    }
    if (fx) {
      fx.spawnParticles(tower.x, tower.y - 10, 8, ['#52C41A', '#B7EB8F', '#FFE58F'], 25, 75, 0.2, 0.4, 4);
      fx.spawnFloatingText(tower.x, tower.y - 16, isFullRevive ? '+HP 圣愈苏醒!' : `+${Math.round(amount)} 生命`, '#52C41A', 1.0);
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

    // 局部化自然菌根共鸣微光（在达成羁绊的蘑菇基座周围浮动金翠孢子光晕，避免跨全图直线穿插）
    const seenSymb = new Set();
    for (let i = 0; i < this.networkEdges.length; i++) {
      const edge = this.networkEdges[i];
      const pair = [edge.a, edge.b];
      for (let p = 0; p < 2; p++) {
        const tw = pair[p];
        if (!tw || seenSymb.has(tw)) continue;
        seenSymb.add(tw);
        const isGrand = tw.synergies && tw.synergies.hasGrandResonance;
        const pulse = 0.72 + Math.sin((this.animTimer || 0) * 3.2 + tw.col) * 0.25;
        ctx.save();
        ctx.strokeStyle = isGrand ? `rgba(255, 224, 110, ${0.26 * pulse})` : `rgba(135, 232, 160, ${0.20 * pulse})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(tw.x, tw.y + 11, 20, 9, 0, 0, Math.PI * 2);
        ctx.stroke();
        const ang = (this.animTimer || 0) * 1.8 + tw.row * 1.1;
        ctx.fillStyle = isGrand ? 'rgba(255, 235, 145, 0.55)' : 'rgba(186, 255, 210, 0.45)';
        ctx.beginPath();
        ctx.arc(tw.x + Math.cos(ang) * 18, tw.y + 10 + Math.sin(ang) * 7, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
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

    // 更新灵光菇圣域对邻近防卫塔的伤害/攻速/护盾增益
    for (let i = 0; i < this.towers.length; i++) {
      this.towers[i].luminaDmgBonus = 0;
      this.towers[i].luminaAspdBonus = 0;
      this.towers[i].hasHolyWard = false;
    }
    for (let i = 0; i < this.towers.length; i++) {
      const lt = this.towers[i];
      if (lt.typeId !== 'lumina' || lt.isWebbed || lt.dormantTimer > 0) continue;
      const auraRangePx = (lt.node.range || 4.0) * TILE_SIZE;
      const dmgB = lt.node.auraDmgBonus || 0;
      const aspdB = lt.node.auraAspdBonus || 0;
      const ward = Boolean(lt.node.holyWard);
      if (!dmgB && !aspdB && !ward) continue;
      for (let j = 0; j < this.towers.length; j++) {
        if (i === j) continue;
        const ot = this.towers[j];
        if (Math.hypot(ot.x - lt.x, ot.y - lt.y) <= auraRangePx) {
          if (dmgB > ot.luminaDmgBonus) ot.luminaDmgBonus = dmgB;
          if (aspdB > ot.luminaAspdBonus) ot.luminaAspdBonus = aspdB;
          if (ward) ot.hasHolyWard = true;
        }
      }
    }

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
      } else if (t.recoilTimer > 0) {
        t.recoilTimer -= dt;
        const p = Math.max(0, t.recoilTimer) / 0.16;
        t.squashScaleX = 1.0 + Math.sin(p * Math.PI) * 0.12;
        t.squashScaleY = 1.0 - Math.sin(p * Math.PI) * 0.12;
        if (t.recoilTimer <= 0) {
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
      if (t.stunTimer > 0) {
        t.stunTimer = Math.max(0, t.stunTimer - dt);
        t.animState = 'idle';
        continue; // 被首领践踏震晕，暂停攻击
      }
      if (t.dormantTimer > 0) {
        t.dormantTimer = Math.max(0, t.dormantTimer - dt);
        if (t.dormantTimer <= 0) {
          t.hp = Math.round(t.maxHp * 0.5); // 自然复苏恢复 50% HP
        }
        continue; // 处于枯萎休眠状态，暂停攻击
      }

      // 冷却递减（狂暴加速，中毒减速，灵光光环，超频射速）
      let speedCoeff = (t.superchargeTimer > 0 ? 2.2 : (t.buffTimer > 0 ? 1.6 : 1.0)) * (t.poisonTimer > 0 ? 0.65 : 1.0);
      if (t.luminaAspdBonus > 0) {
        speedCoeff *= (1 + t.luminaAspdBonus);
      }
      if (t.synergies && t.synergies.hasGrandResonance) {
        speedCoeff *= 1.15;
      }
      if (this.scene && this.scene.photosyntheticSurgeBonus && this.towers.length >= 3) {
        speedCoeff *= (1.0 + this.scene.photosyntheticSurgeBonus);
      }
      if (t.isAwakened && this.scene && this.scene.awakenedAtkSpeedMod > 1) {
        speedCoeff *= this.scene.awakenedAtkSpeedMod;
      }
      if (t.cooldown > 0) {
        t.cooldown = Math.max(0, t.cooldown - dt * speedCoeff);
      }

      // 第 5 位守卫灵光菇：定期产孢、A线战地群疗脉冲、圣幕净化蛛网酸蚀
      if (t.typeId === 'lumina') {
        if (t.node.sporeGen > 0) {
          t.sporeHarvestTimer = (t.sporeHarvestTimer || 0) + dt * speedCoeff;
          const hInterval = t.node.sporeInterval || 10.0;
          if (t.sporeHarvestTimer >= hInterval) {
            t.sporeHarvestTimer = 0;
            const gen = t.node.sporeGen;
            if (economy) {
              economy.addSpores(gen);
            }
            if (fx) {
              fx.spawnFloatingText(t.x, t.y - 24, `+${gen} 孢子`, '#FFE58F', 1.15);
              if (fx.spawnShockwave) fx.spawnShockwave(t.x, t.y, 32, '#FFE58F');
              else if (fx.spawnRing) fx.spawnRing(t.x, t.y, 32, '#FFE58F', 0.35, false);
            }
            platform.playSfx('sfx_coin');
          }
        }

        const pulseInterval = t.node.healInterval || 4.5;
        if (t.node.auraHeal > 0 || t.node.holyWard) {
          t.auraPulseTimer = (t.auraPulseTimer || 0) + dt * speedCoeff;
          if (t.auraPulseTimer >= pulseInterval) {
            t.auraPulseTimer = 0;
            const radPx = (t.node.range || 4.5) * TILE_SIZE;
            const healAmt = t.node.auraHeal || 0;
            let didPulse = false;

            if (healAmt > 0) {
              for (let j = 0; j < this.towers.length; j++) {
                const ot = this.towers[j];
                if (ot.hp > 0 && ot.hp < ot.maxHp && Math.hypot(ot.x - t.x, ot.y - t.y) <= radPx) {
                  this.healTower(ot, healAmt, false, fx);
                  didPulse = true;
                }
              }
              if (sporelingPatrol) {
                sporelingPatrol.healGuards(t.x, t.y, radPx, healAmt);
                didPulse = true;
              }
            }

            if (t.node.holyWard) {
              for (let j = 0; j < this.towers.length; j++) {
                const ot = this.towers[j];
                if (Math.hypot(ot.x - t.x, ot.y - t.y) <= radPx) {
                  if (ot.isWebbed || ot.poisonTimer > 0) {
                    ot.isWebbed = false;
                    ot.webHealth = 0;
                    ot.poisonTimer = 0;
                    didPulse = true;
                    if (fx) {
                      fx.spawnFloatingText(ot.x, ot.y - 20, '圣幕净化!', '#BAE7FF', 1.0);
                      fx.spawnParticles(ot.x, ot.y, 8, ['#BAE7FF', '#FFFFFF'], 15, 30);
                    }
                  }
                }
              }
            }

            if (didPulse && fx) {
              if (fx.spawnRing) fx.spawnRing(t.x, t.y, radPx * 0.45, '#73D13D', 0.4, false);
              fx.spawnParticles(t.x, t.y, 8, ['#52C41A', '#FFE58F'], 20, 40);
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

      // 冷却就绪时尝试索敌并开火 (优先保卫萝卜/PVZ 智能优先级)
      if (t.cooldown <= 0) {
        let target = null;
        let isAttackingObs = false;

        // 判定是否有手动集火锁定的障碍物在射程内
        const targetedObs = (this.scene && this.scene.targetedObstacle && !this.scene.targetedObstacle.cleared)
          ? this.scene.targetedObstacle
          : null;
        const targetedObsInRange = targetedObs && (Math.hypot(targetedObs.x - t.x, targetedObs.y - t.y) <= t.node.range * TILE_SIZE);

        if (targetedObsInRange) {
          // 检查是否有怪物极度逼近老家（距离仓库终点 < 110px 紧急泄漏危险）
          let urgentThreat = false;
          if (aliveEnemies.length > 0) {
            for (let eI = 0; eI < aliveEnemies.length; eI++) {
              const enemy = aliveEnemies[eI];
              if (enemy.state === 'death') continue;
              const routeLen = this.getEnemyRouteLength(map, enemy);
              if (routeLen - enemy.distPx <= 110) {
                urgentThreat = true;
                break;
              }
            }
          }
          if (!urgentThreat) {
            target = targetedObs;
            isAttackingObs = true;
          }
        }

        // 若没有集火障碍物，则正常索敌场上敌人
        if (!target && aliveEnemies.length > 0) {
          target = this.selectTarget(t, aliveEnemies, map);
        }

        // 若当前射程内无敌人（或波次间歇、场上无怪），且有可清除障碍物，自动开荒攻击障碍物
        if (!target) {
          const autoObs = this.selectObstacleTarget(t, map, this.scene);
          if (autoObs) {
            target = autoObs;
            isAttackingObs = true;
          }
        }

        if (target) {
          if (isAttackingObs) {
            this.fireTowerAtObstacle(t, target, bulletManager);
          } else {
            this.fireTower(t, target, map, enemyManager, bulletManager);
          }
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

  getBuffedNode(tower) {
    if (!tower || !tower.node) return tower.node;
    if (!tower.luminaDmgBonus) return tower.node;
    return Object.assign({}, tower.node, {
      damageBonus: (tower.node.damageBonus || 0) + tower.luminaDmgBonus
    });
  }

  fireTowerAtObstacle(tower, obs, bulletManager) {
    const node = this.getBuffedNode(tower);
    const baseDmg = tower.typeId === 'lumina' ? (node.damage || tower.def.baseDamage) : tower.def.baseDamage;
    if (tower.typeId === 'watch') {
      const watchNode = Object.assign({}, node);
      if (tower.synergies && tower.synergies.hasTwinWatch) {
        watchNode.critChance = (watchNode.critChance || 0) + 0.20;
      }
      bulletManager.spawnWatchBullet(tower.x, tower.y - 10, null, obs.x, obs.y, watchNode, baseDmg, obs);
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'mist') {
      bulletManager.spawnMistCloud(obs.x, obs.y, node);
      platform.playSfx('sfx_mist');
    } else if (tower.typeId === 'thorn') {
      const baseAngle = Math.atan2(obs.y - tower.y, obs.x - tower.x);
      const thornOpts = { hasPoisonThorn: tower.synergies && tower.synergies.hasPoisonThorn };
      bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle, node, baseDmg, 1.0, thornOpts);
      platform.playSfx('sfx_thorn');
    } else if (tower.typeId === 'burst') {
      const burstOpts = { hasToxicBurst: tower.synergies && tower.synergies.hasToxicBurst };
      bulletManager.spawnBurstShell(tower.x, tower.y - 12, obs.x, obs.y, node, baseDmg, burstOpts);
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'lumina') {
      bulletManager.spawnLuminaRay(tower.x, tower.y - 10, null, node, baseDmg, obs);
      platform.playSfx('sfx_laser');
    }
  }

  fireTower(tower, target, map, enemyManager, bulletManager) {
    tower.recoilTimer = 0.16;
    const node = this.getBuffedNode(tower);
    const baseDmg = tower.typeId === 'lumina' ? (node.damage || tower.def.baseDamage) : tower.def.baseDamage;

    if (tower.typeId === 'watch') {
      const dist = Math.hypot(target.x - tower.x, target.y - tower.y);
      const travelSec = dist / (node.bulletSpeed || 640);
      const pred = enemyManager.predictEnemyPosition(target, travelSec, map);
      const watchNode = Object.assign({}, node);
      if (tower.synergies && tower.synergies.hasTwinWatch) {
        watchNode.critChance = (watchNode.critChance || 0) + 0.20;
      }
      const wb = bulletManager.spawnWatchBullet(tower.x, tower.y - 10, target, pred.x, pred.y, watchNode, baseDmg);
      if (wb) wb.sourceTower = tower;
      if (this.mushroomMastery && this.mushroomMastery.hasMastery('watch', 'watch_m2')) {
        if (Math.random() < 0.22) {
          const wb2 = bulletManager.spawnWatchBullet(tower.x + 6, tower.y - 12, target, pred.x + 8, pred.y + 4, watchNode, baseDmg);
          if (wb2) wb2.sourceTower = tower;
        }
      }
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'mist') {
      const mh = bulletManager.spawnMistCloud(target.x, target.y, Object.assign({}, node, { sourceTower: tower }));
      if (mh && !mh.sourceTower) mh.sourceTower = tower;
      platform.playSfx('sfx_mist');
    } else if (tower.typeId === 'thorn') {
      const dist = Math.hypot(target.x - tower.x, target.y - tower.y);
      const travelSec = dist / (node.bulletSpeed || 900);
      const pred = enemyManager.predictEnemyPosition(target, travelSec, map);
      const baseAngle = Math.atan2(pred.y - tower.y, pred.x - tower.x);

      // 主刺
      const thornOpts = { hasPoisonThorn: tower.synergies && tower.synergies.hasPoisonThorn };
      const tb = bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle, node, baseDmg, 1.0, thornOpts);
      if (tb) tb.sourceTower = tower;

      // A3 箭袋：每次齐射增加 2 根侧刺（左右各偏 12°），侧刺伤害 50%
      if (node.sideSpikes && node.sideSpikes >= 2) {
        const deltaRad = ((node.sideAngleDeg || 12) * Math.PI) / 180;
        const sideRatio = node.sideDamageRatio || 0.50;
        const tbL = bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle - deltaRad, node, baseDmg, sideRatio);
        const tbR = bulletManager.spawnThornSpike(tower.x, tower.y - 6, baseAngle + deltaRad, node, baseDmg, sideRatio);
        if (tbL) tbL.sourceTower = tower;
        if (tbR) tbR.sourceTower = tower;
      }
      platform.playSfx('sfx_thorn');
    } else if (tower.typeId === 'burst') {
      const pred = enemyManager.predictEnemyPosition(target, node.flightTime || 0.38, map);
      const burstOpts = { hasToxicBurst: tower.synergies && tower.synergies.hasToxicBurst };
      const bb = bulletManager.spawnBurstShell(tower.x, tower.y - 12, pred.x, pred.y, node, baseDmg, burstOpts);
      if (bb) bb.sourceTower = tower;
      platform.playSfx('sfx_shoot');
    } else if (tower.typeId === 'lumina') {
      const lb = bulletManager.spawnLuminaRay(tower.x, tower.y - 10, target, node, baseDmg);
      if (lb) lb.sourceTower = tower;
      platform.playSfx('sfx_laser');
    }
  }

  /**
   * 绘制所有已建造的蘑菇炮塔及其形态徽章
   */
  render(ctx) {
    // 仅在防御塔增删改变时执行排序，杜绝每帧 60 次创建闭包排序导致卡顿
    if (this.towersDirty) {
      this.towers.sort((a, b) => a.row - b.row || a.col - b.col);
      this.towersDirty = false;
    }

    for (let i = 0; i < this.towers.length; i++) {
      const t = this.towers[i];
      let tileX = t.col * TILE_SIZE;
      let tileY = t.row * TILE_SIZE;

      // 受击弹性微晃
      if (t.hitWobbleTimer > 0) {
        tileX += Math.round(Math.sin(t.hitWobbleTimer * 30) * 2.5);
      }

      // 幽夜微光专属：真菌生物发光荧光光环 (Bioluminescent Tower Aura)
      const isNightMode = (this.scene && this.scene.weather && this.scene.weather.currentWeather === 'night') ||
                          (this.scene && this.scene.map && this.scene.map.mapData && this.scene.map.mapData.theme === 'night_fungi');
      if (isNightMode) {
        ctx.save();
        const auraPulse = 0.6 + Math.sin((t.animTimer || 0) * 3.2 + i) * 0.25;
        let auraR = 105, auraG = 192, auraB = 255;
        if (t.typeId === 'lumina') { auraR = 255; auraG = 225; auraB = 100; }
        else if (t.typeId === 'burst') { auraR = 255; auraG = 110; auraB = 50; }
        else if (t.typeId === 'mist') { auraR = 190; auraG = 130; auraB = 255; }
        else if (t.typeId === 'thorn') { auraR = 95; auraG = 230; auraB = 135; }

        const auraGrad = ctx.createRadialGradient(t.x, tileY + 22, 3, t.x, tileY + 22, 28);
        auraGrad.addColorStop(0, 'rgba(' + auraR + ',' + auraG + ',' + auraB + ',' + (0.45 * auraPulse) + ')');
        auraGrad.addColorStop(0.65, 'rgba(' + auraR + ',' + auraG + ',' + auraB + ',' + (0.15 * auraPulse) + ')');
        auraGrad.addColorStop(1, 'rgba(' + auraR + ',' + auraG + ',' + auraB + ',0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.ellipse(t.x, tileY + 22, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
            // 濒死受损颤抖 (HP <= 35%)
      const isCritical = t.hp > 0 && (t.hp / t.maxHp <= 0.35);
      if (isCritical) {
        tileX += Math.sin((t.animTimer || 0) * 22) * 1.5;
      }

      // 落地 Squash & Stretch 弹性变形绘制
      const isSquashing = t.squashTimer > 0 || t.recoilTimer > 0;
      if (isSquashing) {
        ctx.save();
        ctx.translate(t.x, tileY + 24);
        ctx.scale(t.squashScaleX, t.squashScaleY);
        ctx.translate(-t.x, -(tileY + 24));
      }

      // 升级瞬间的神圣升阶光柱
      if (t.upgradeAnimTimer > 0) {
        const upAlpha = Math.min(1, t.upgradeAnimTimer / 0.42) * 0.55;
        const beamCol = t.branch === 'A' ? 'rgba(111, 232, 255,' : (t.branch === 'B' ? 'rgba(255, 192, 105,' : 'rgba(255, 229, 143,');
        ctx.save();
        const beamGrad = ctx.createLinearGradient(t.x, tileY - 36, t.x, tileY + 24);
        beamGrad.addColorStop(0, beamCol + ' 0)');
        beamGrad.addColorStop(0.5, beamCol + ` ${upAlpha.toFixed(2)})`);
        beamGrad.addColorStop(1, beamCol + ' 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(Math.round(t.x - 14), Math.round(tileY - 36), 28, 60);
        ctx.restore();
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

        // 头顶微操解救气泡标签：精致圆角药丸胶囊（避让自身血条防遮挡）
        const badgeW = 74;
        const badgeH = 18;
        const badgeX = Math.round(t.x - badgeW * 0.5);
        const badgeY = (t.hp < t.maxHp && t.hp > 0) ? (tileY - 31) : (tileY - 21);

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

      // 濒死预警指示 (HP <= 35%)
      if (isCritical) {
        ctx.save();
        const pulse = 0.8 + Math.sin((t.animTimer || 0) * 10) * 0.2;
        ctx.fillStyle = `rgba(255, 77, 79, ${0.85 * pulse})`;
        ctx.font = 'bold 10px "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠️ 守卫垂危!', t.x, tileY - 18);
        ctx.restore();
      }

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
    tower.isAwakened = true;
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
            if (!scene || scene.state !== 'BATTLE') return;
            const targets = em.getAliveEnemies();
            if (targets.length === 0) return;
            const target = targets[i % targets.length];
            const wb = bm.spawnWatchBullet(tower.x, tower.y - 14, target, target.x, target.y, Object.assign({}, tower.node, { armorPierceRatio: 0.6 }), 55);
            if (wb) wb.sourceTower = tower;
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
            em.applyDamage(e, 260, false, 'pierce', fx, tower);
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
        const target = alive.length > 0 ? alive[0] : { x: 320, y: 240 };
        const bb = bm.spawnBurstShell(tower.x, tower.y - 16, target.x, target.y, Object.assign({}, tower.node, { splashRadius: 2.5 }), 450);
        if (bb) bb.sourceTower = tower;
        setTimeout(() => {
          if (!scene || scene.state !== 'BATTLE') return;
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
                em.applyDamage(e, 420, true, 'splash', fx, tower);
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
            em.applyDamage(e, 160, false, 'magic', fx, tower);
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
