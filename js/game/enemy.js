/**
 * 敌人与首领管理器 (js/game/enemy.js)
 * 使用对象池（上限 120），严格实现第七章 7.1-7.4 敌人行为、生命缩放、状态叠加与三阶段 Boss 状态机
 */

const ObjectPool = require('../core/pool');
const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { ENEMIES } = require('../data/enemies');
const { sampleRouteAtDistance } = require('./map');
const { drawEnemySprite, drawEnemyShadow, drawProjectileSprite } = require('../core/atlasRenderer');
const platform = require('../core/platform');
const i18n = require('../i18n/index');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

const ENEMY_TINTS = {
  beetle: PALETTE.ENEMY_EYE,
  swift: PALETTE.ENEMY_MOTH,
  armored: PALETTE.ENEMY_ARMORED,
  moth: PALETTE.ENEMY_MOTH,
  splitter: PALETTE.ENEMY_SPLITTER,
  larva: PALETTE.ENEMY_SPLITTER,
  weaver: '#B37FEB',
  boss_m1: PALETTE.ENEMY_EYE,
  boss_m2: PALETTE.BRANCH_A,
  boss_m3: PALETTE.ENEMY_SPLITTER
};

class EnemyManager {
  constructor() {
    this.flyingWebs = [];
    this.relicManager = null;
    const self = this;
    this.pool = new ObjectPool(
      () => ({
        takeDamage(amount, fx = null, dType = 'nature') {
          if (this.state === 'death' || this.hp <= 0) return;
          const dmg = Math.max(1, Math.round(amount));
          this.hp -= dmg;
          this.whiteFlashFrames = 2;
          if (fx) {
            if (typeof fx.spawnFloatingText === 'function') {
              fx.spawnFloatingText(Math.round(this.x), Math.round(this.y - 14), '-' + dmg, '#FF4D4F', 0.9);
            }
          }
          if (this.hp <= 0) {
            self.killEnemy(this, fx);
          }
        },
        uid: 0,
        type: 'beetle',
        def: ENEMIES.beetle,
        isFlying: false,
        isBoss: false,
        isElite: false,
        eliteAffix: null,
        isBlocked: false,
        blockedBy: null,
        fromWave: true,
        hp: 40,
        maxHp: 40,
        baseSpeedTiles: 1.3,
        speedMultiplier: 1.0,
        baseArmor: 0,
        threat: 1,
        reward: 3,
        distPx: 0,
        lateralOffsetPx: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        // 状态效果
        activeSlow: 0,
        residualSlowValue: 0,
        residualSlowTimer: 0,
        slowImmune: false,
        markTimer: 0,
        armorReduction: 0,
        dotSources: [],
        // 动画与表现
        state: 'walk', // 'walk' | 'phase' | 'death'
        animTimer: 0,
        animFrame: 0,
        whiteFlashFrames: 0,
        hitArmorFrames: 0,
        deathTimer: 0,
        phaseAnimTimer: 0,
        // Boss 阶段
        bossPhase: 1,
        summonTimer: 0,
        waveIndex: 1,
        tintColor: PALETTE.ENEMY_EYE,
        atkCooldown: 0
      }),
      null,
      CONFIG.POOL_CAPS.ENEMIES
    );

    this.nextUid = 1;
  }

  clear() {
    this.pool.clear();
    this.flyingWebs.length = 0;
  }

  /**
   * 7.3 计算当前波次与地图的生命倍率
   * 当前生命倍率 = (1 + 0.10 * (波次序号 - 1)) * 地图系数
   */
  getHpMultiplier(mapId, waveIndex) {
    const mapCoeff = CONFIG.COMBAT.MAP_HP_COEFFICIENTS[mapId] || 1.0;
    return (1 + CONFIG.COMBAT.WAVE_HP_GROWTH_PER_WAVE * Math.max(0, waveIndex - 1)) * mapCoeff;
  }

  /**
   * 统计当前场上由波次直接生成的存活敌人数（用于 7.3 不超过 12 个的并发限制）
   */
  getActiveWaveEnemyCount() {
    const list = this.pool.getActiveList();
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.state !== 'death' && e.fromWave) {
        count += 1;
      }
    }
    return count;
  }

  getAliveEnemies() {
    const list = this.pool.getActiveList();
    const res = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].state !== 'death') {
        res.push(list[i]);
      }
    }
    return res;
  }

  /**
   * 生成一名敌人
   */
  spawnEnemy(type, map, waveIndex, options = {}) {
    const def = ENEMIES[type];
    if (!def) return null;

    const e = this.pool.acquire(false);
    if (!e) return null;

    const hpMul = this.getHpMultiplier(map.mapId, waveIndex);
    const maxHp = Math.max(1, Math.round(def.baseHp * hpMul));

    e.uid = this.nextUid++;
    e.type = type;
    e.def = def;
    e.isFlying = Boolean(def.isFlying);
    e.isBoss = Boolean(def.isBoss);
    if (e.isBoss && this.scene && this.scene.bossOverdriveEngine) {
      this.scene.bossOverdriveEngine.registerBoss(e);
    }
    e.fromWave = options.fromWave !== undefined ? options.fromWave : true;
    e.hp = maxHp;
    e.maxHp = maxHp;
    e.baseSpeedTiles = def.speed;
    e.speedMultiplier = 1.0;
    e.baseArmor = def.armor || 0;
    e.threat = def.threat || 1;
    e.reward = def.reward || 3;
    e.distPx = options.startDistPx !== undefined ? options.startDistPx : 0;
    e.lateralOffsetPx = options.lateralOffsetPx !== undefined
      ? options.lateralOffsetPx
      : ((Math.random() * 2 - 1) * CONFIG.COMBAT.SPAWN_LATERAL_OFFSET_PX);

    e.activeSlow = 0;
    e.residualSlowValue = 0;
    e.residualSlowTimer = 0;
    e.slowImmune = false;
    e.markTimer = 0;
    e.armorReduction = 0;
    e.dotSources.length = 0;

    e.state = 'walk';
    e.animTimer = 0;
    e.isBlocked = false;
    e.blockedBy = null;
    e.isElite = false;
    e.isEnraged = false;
    if (this.waveManager && this.waveManager.isEnraged) {
      e.isEnraged = true;
      e.speedMultiplier *= 1.22;
      e.reward = Math.round(e.reward * 2.0);
    }
    e.eliteAffix = null;
    if (!e.isBoss && waveIndex >= 3 && Math.random() < 0.18) {
      e.isElite = true;
      e.eliteAffix = ['swift', 'hardened', 'volatile'][Math.floor(Math.random() * 3)];
      e.maxHp = Math.round(e.maxHp * 1.4);
      e.hp = e.maxHp;
    }
    e.animFrame = 0;
    e.whiteFlashFrames = 0;
    e.hitArmorFrames = 0;
    e.deathTimer = 0;
    e.phaseAnimTimer = 0;
    e.bossPhase = 1;
    e.routeIndex = (options.routeIndex !== undefined) ? options.routeIndex : 0;
    e.isBurrower = Boolean(def.isBurrower);
    e.isLeaper = Boolean(def.isLeaper);
    e.isLeaping = false;
    e.leapProgress = 0;
    e.leapCooldown = 1.0 + Math.random() * 1.5;
    e.hasFrontShield = Boolean(def.hasFrontShield);
    e.isUnderground = Boolean(def.isBurrower);
    e.isSuicideBomber = Boolean(def.isSuicideBomber);
    e.isHealerShaman = Boolean(def.isHealerShaman);
    e.healTimer = 0;
    e.necroTimer = 0;
    e.unearthTimer = 0;
    e.summonTimer = def.phases && def.phases.phase2Summon ? def.phases.phase2Summon.interval * 0.5 : 0;
    e.waveIndex = waveIndex;
    e.tintColor = ENEMY_TINTS[type] || PALETTE.ENEMY_EYE;
    e.atkCooldown = 0.4 + Math.random() * 0.4;

    const route = e.isFlying ? map.airRoute : ((e.routeIndex === 1 && map.groundRoute2) ? map.groundRoute2 : map.groundRoute);
    const sample = sampleRouteAtDistance(route, e.distPx, e.lateralOffsetPx);
    e.x = sample.x;
    e.y = sample.y;
    e.vx = sample.dx * e.baseSpeedTiles * TILE_SIZE;
    e.vy = sample.dy * e.baseSpeedTiles * TILE_SIZE;

    return e;
  }

  /**
   * 5.5 计算敌人当前有效护甲（多个破甲来源不叠加，取最大削减值，最低 0）
   */
  getEffectiveArmor(e) {
    return Math.max(0, e.baseArmor - (e.armorReduction || 0));
  }

  /**
   * 5.5 计算敌人当前有效减速比例（多个来源取最强值，全局上限 60%，甲壳虫减半，蛾后三阶段免疫）
   */
  getEffectiveSlow(e) {
    if (e.slowImmune) return 0;
    const rawSlow = Math.max(e.activeSlow || 0, e.residualSlowTimer > 0 ? e.residualSlowValue : 0);
    const factor = e.def.slowFactor !== undefined ? e.def.slowFactor : 1.0;
    return Math.min(CONFIG.COMBAT.GLOBAL_SLOW_CAP, rawSlow * factor);
  }

  /**
   * 5.4 直接伤害与溅射伤害计算公式：
   * 原始伤害 = 基础伤害 × (1 + 增伤合计) × 暴击倍率 × 标记倍率
   * 实际伤害 = max(原始伤害 − 护甲, 原始伤害 × 20%)
   */
  applyDirectDamage(enemy, baseDamage, bonusSum, isCrit, appliesMark, combatTimeSec, map, economy, fx, damageType = 'watch') {
    if (!enemy || enemy.state === 'death') return { dealt: 0, killed: false };

    // Burrower underground evasion vs unearthing
    if (enemy.isUnderground) {
      // Check if hit by explosion / earthquake shockwave / stun
      const isExplosionOrStun = (bonusSum && bonusSum > 0.8) || appliesMark;
      if (isExplosionOrStun) {
        enemy.isUnderground = false;
        enemy.unearthTimer = 1.2;
        if (fx) {
          fx.spawnFloatingText(enemy.x, enemy.y - 20, '震裂出土!', '#FAAD14', 1.2);
          fx.spawnParticles(enemy.x, enemy.y, 16, ['#8C6842', '#D48806', '#595959'], 25, 45);
        }
      } else {
        // Dodged underground
        if (fx) {
          fx.spawnFloatingText(enemy.x, enemy.y - 12, '潜地回避!', '#A89078', 0.85);
          fx.spawnParticles(enemy.x, enemy.y, 6, ['#8C6842', '#A89078'], 10, 20);
        }
        return { dealt: 0, killed: false };
      }
    }

    const critMul = isCrit ? CONFIG.COMBAT.CRIT_MULTIPLIER : 1.0;
    const markMul = enemy.markTimer > 0 ? CONFIG.COMBAT.MARK_MULTIPLIER : 1.0;
    const rawDamage = baseDamage * (1 + (bonusSum || 0)) * critMul * markMul;
    let frontShieldMul = 1.0;
    if (enemy.hasFrontShield && !isCrit) {
      frontShieldMul = 0.25; // 75% damage reduction from front
      if (fx) {
        fx.spawnFloatingText(enemy.x, enemy.y - 14, '铁壁格挡 -75%!', '#D9D9D9', 0.95);
        fx.spawnParticles(enemy.x, enemy.y, 6, ['#D9D9D9', '#FFFDF5', '#8C8C8C'], 20, 35);
      }
    }
    const effArmor = this.getEffectiveArmor(enemy);
    const actualDamage = Math.max(
      rawDamage - effArmor,
      rawDamage * CONFIG.COMBAT.MIN_ARMOR_DAMAGE_RATIO
    ) * frontShieldMul;

    // 瞭望菇 A3 命中后刷新 3 秒标记
    if (appliesMark) {
      enemy.markTimer = CONFIG.COMBAT.MARK_DURATION;
    }

    // 5.7 单体命中表现：目标白闪 2 帧
    enemy.whiteFlashFrames = CONFIG.FEEDBACK.HIT.whiteFlashFrames;
    if (enemy.type === 'armored' || enemy.baseArmor > 0) {
      enemy.hitArmorFrames = 6;
    }

    if (isCrit && fx) {
      fx.spawnFloatingText(enemy.x, enemy.y - 12, 'CRIT ' + Math.round(actualDamage), PALETTE.BRANCH_B, 1.15);
    }

    enemy.hp -= actualDamage;
    const isKilled = enemy.hp <= 0;

    const dType = damageType || (appliesMark ? 'watch' : 'burst');
    if (this.scene) {
      if (this.scene.combatAnalytics) {
        this.scene.combatAnalytics.recordDamage(dType, Math.round(actualDamage), isKilled);
      }
      if (this.scene.elementalReactions) {
        let elem = null;
        if (dType === 'fire' || dType === 'splash' || dType === 'burst') elem = 'pyro';
        else if (dType === 'water' || dType === 'nature' || dType === 'lumina') elem = 'hydro';
        else if (dType === 'shock' || dType === 'magic') elem = 'electro';
        else if (dType === 'frost' || dType === 'mist') elem = 'cryo';
        else if (dType === 'poison' || dType === 'toxic' || dType === 'thorn') elem = 'toxic';
        else if (dType === 'pierce' || dType === 'watch') elem = 'dendro';

        if (elem) {
          this.scene.elementalReactions.applyElement(enemy, elem, Math.round(actualDamage), this.scene);
        }
      }
    }

    if (isKilled) {
      this.handleEnemyDeath(enemy, actualDamage, combatTimeSec, map, economy, fx);
      return { dealt: actualDamage, killed: true };
    }

    this.checkBossPhaseTransitions(enemy, map, fx);
    return { dealt: actualDamage, killed: false };
  }

  /**
   * 检查 Boss 二阶段 (66%) 与三阶段 (33%) 切换
   */
  checkBossPhaseTransitions(enemy, map, fx) {
    if (!enemy.isBoss || !enemy.def.phases || enemy.state === 'death') return;
    const ratio = enemy.hp / enemy.maxHp;
    const phases = enemy.def.phases;

    if (enemy.bossPhase < 2 && ratio <= phases.phase2Threshold) {
      enemy.bossPhase = 2;
      enemy.phaseAnimTimer = 0.45;
      enemy.animFrame = 0;
      if (fx) {
        fx.showBanner(i18n.t('banner_boss_phase2'), PALETTE.UPGRADE_LV1, i18n.t(enemy.def.nameKey), 1.3);
      if (phases.phase2WebBarrage && this.towerManager) {
        // 咆哮吐出双连蛛丝封印最近的 2 座防御塔
        const tws = this.towerManager.towers.filter(t => !t.isWebbed && t.dormantTimer <= 0);
        tws.sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y));
        const count = Math.min(phases.phase2WebBarrage, tws.length);
        for (let k = 0; k < count; k++) {
          this.flyingWebs.push({
            startX: enemy.x,
            startY: enemy.y - 12,
            targetX: tws[k].x,
            targetY: tws[k].y,
            targetTower: tws[k],
            curX: enemy.x,
            curY: enemy.y,
            timer: 0,
            duration: 0.45
          });
        }
        fx.triggerScreenShake(3.5, 0.35);
      }
        fx.spawnRing(enemy.x, enemy.y, 44, PALETTE.UPGRADE_LV1, 0.35, true);
      }
      // 立即执行一次阶段二召唤以增强压迫感
      this.triggerBossSummon(enemy, map, fx);
    }

    if (enemy.bossPhase < 3 && ratio <= phases.phase3Threshold) {
      enemy.bossPhase = 3;
      enemy.phaseAnimTimer = 0.45;
      enemy.animFrame = 0;
      if (phases.phase3SpeedMultiplier) {
        enemy.speedMultiplier = phases.phase3SpeedMultiplier;
      }
      if (phases.phase3Armor !== undefined) {
        enemy.baseArmor = phases.phase3Armor;
      }
      if (phases.phase3SlowImmune) {
        enemy.slowImmune = true;
      }
      if (fx) {
        fx.showBanner(i18n.t('banner_boss_phase3'), PALETTE.BRANCH_B, i18n.t(enemy.def.nameKey), 1.3);
      if (phases.phase3Earthquake) {
        fx.triggerScreenShake(5.0, 0.55);
        // 地震落石碎屑
        for (let k = 0; k < 12; k++) {
          const rx = enemy.x + (Math.random() * 2 - 1) * 60;
          const ry = enemy.y + (Math.random() * 2 - 1) * 40;
          fx.spawnParticles(rx, ry, 6, ['#5C4028', '#8C6842', '#D4B106'], 30, 80, 0.3, 0.6, 3.5);
        }
      }
        fx.spawnRing(enemy.x, enemy.y, 52, PALETTE.BRANCH_B, 0.40, true);
      }
    }
  }

  triggerBossSummon(boss, map, fx) {
    if (!boss.def.phases || !boss.def.phases.phase2Summon) return;
    const cfg = boss.def.phases.phase2Summon;
    for (let i = 0; i < cfg.count; i++) {
      const offsetDist = Math.max(0, boss.distPx + (i - (cfg.count - 1) * 0.5) * 14);
      const offsetLat = (i - 1) * 5;
      this.spawnEnemy(cfg.type, map, boss.waveIndex, {
        fromWave: false,
        startDistPx: offsetDist,
        lateralOffsetPx: offsetLat
      });
    }
    if (fx) {
      fx.spawnParticles(boss.x, boss.y, 14, [PALETTE.UPGRADE_LV1, PALETTE.UI_SPORE], 30, 95, 0.2, 0.4, 4);
    }
  }

  /**
   * 处理敌人死亡、奖励结算及分裂（裂殖虫 -> 2幼体；裂殖母体 -> 3裂殖虫）
   */

  /**
   * 统一伤害结算接口 (天候雷暴、英雄斩击、反伤震击、法术轰炸、神术惩戒等)
   */
  applyDamage(enemy, amount, isCrit = false, dType = 'physical', fx = null, source = null) {
    if (!enemy || enemy.state === 'death' || enemy.hp <= 0) return 0;
    const finalFx = fx || (this.scene ? this.scene.fx : null);
    let dmg = Math.max(1, Math.round(amount));

    if (dType === 'physical' && enemy.baseArmor && !isCrit) {
      const reduction = Math.max(0.2, 1 - (enemy.baseArmor * 0.05));
      dmg = Math.max(1, Math.round(dmg * reduction));
    }

    enemy.hp -= dmg;
    enemy.whiteFlashFrames = 3;

    if (finalFx && typeof finalFx.spawnFloatingText === 'function') {
      const color = isCrit ? '#FFD700' : (dType === 'magic' ? '#69C0FF' : (dType === 'pierce' ? '#FF7A45' : '#FF4D4F'));
      const text = isCrit ? `暴击 -${dmg}` : `-${dmg}`;
      finalFx.spawnFloatingText(Math.round(enemy.x), Math.round(enemy.y - 14), text, color, isCrit ? 1.2 : 0.9);
    }

    if (enemy.hp <= 0) {
      this.killEnemy(enemy, finalFx);
    }
    return dmg;
  }

  killEnemy(enemy, fx = null, relicManager = null) {
    if (!enemy || enemy.state === 'death') return;
    const economy = this.scene ? this.scene.economy : null;
    const combatTime = this.scene ? this.scene.logicalCombatTimeSec : 0;
    const map = this.scene ? this.scene.map : null;
    this.handleEnemyDeath(enemy, enemy.maxHp, combatTime, map, economy, fx || (this.scene ? this.scene.fx : null));
  }

  handleEnemyDeath(enemy, finalDamage, combatTimeSec, map, economy, fx) {
    if (enemy.state === 'death') return;
    enemy.hp = 0;
    enemy.state = 'death';
    enemy.deathTimer = 0.24;
    enemy.animFrame = 0;
    enemy.animTimer = 0;

    if (economy) {
      economy.registerKill(enemy, finalDamage, combatTimeSec, fx);
    }
    const cj = this.combatJuice || (this.scene ? this.scene.combatJuice : null);
    if (cj) {
      cj.recordKill(enemy.threat || 1);
    }

    // 7.2 裂殖虫死亡时在死亡位置生成 2 只幼体，从死亡点继续前进
    // Volatile Pod Suicide Acid Splash
    if (enemy.isSuicideBomber || enemy.type === 'volatile_pod') {
      if (fx) {
        fx.spawnShockwave(enemy.x, enemy.y, 48, '#EB2F96');
        fx.spawnParticles(enemy.x, enemy.y, 22, ['#EB2F96', '#722ED1', '#52C41A'], 35, 55);
        fx.spawnFloatingText(enemy.x, enemy.y - 20, '酸蚀自爆!', '#EB2F96', 1.2);
      }
      if (this.scene && this.scene.sporelingPatrol) {
        this.scene.sporelingPatrol.damageGuards(enemy.x, enemy.y, 48, 45);
      }
    }

    // Shaman Necromancy: reanimate fallen minion
    const aliveList = this.pool.getActiveList();
    for (let sIdx = 0; sIdx < aliveList.length; sIdx++) {
      const sh = aliveList[sIdx];
      if (sh.type === 'shaman' && sh.state !== 'death' && (sh.necroTimer || 0) <= 0) {
        if (Math.hypot(sh.x - enemy.x, sh.y - enemy.y) <= 90 && enemy.type !== 'skeletal_husk') {
          sh.necroTimer = 5.5;
          if (fx) {
            fx.spawnFloatingText(sh.x, sh.y - 22, '亡骨复生!', '#722ED1', 1.2);
            fx.spawnParticles(enemy.x, enemy.y, 16, ['#722ED1', '#B37FEB', '#D9D9D9'], 20, 35);
          }
          this.spawnEnemy('skeletal_husk', map, enemy.waveIndex, {
            fromWave: false,
            startDistPx: Math.max(0, enemy.distPx),
            lateralOffsetPx: enemy.lateralOffsetPx
          });
          break;
        }
      }
    }

    if (this.scene && typeof this.scene.onEnemyKilled === 'function') {
      this.scene.onEnemyKilled(enemy);
    }
    if (enemy.isElite && this.relicManager) {
      const rKind = ['coin', 'shield', 'lightning', 'clover'][Math.floor(Math.random() * 4)];
      this.relicManager.spawnDrop(enemy.x, enemy.y, rKind, 60);
    }
    // 击杀敌人为森林英雄累积经验值 & 精英/首领掉落灵能觉醒种子
    if (this.scene) {
      if (enemy.isElite || enemy.isBoss) {
        if (Math.random() < 0.65 || enemy.isBoss) {
          this.scene.awakeningSeeds = Math.min(5, (this.scene.awakeningSeeds || 0) + 1);
          if (this.fx) this.fx.spawnFloatingText(enemy.x, enemy.y - 22, '+1 灵能觉醒种子!', '#722ED1', 1.3);
          platform.playSfx('sfx_upgrade');
        }
      }
      if (this.scene.hero && this.scene.hero.state !== 'dead') {
        const xpGain = enemy.isBoss ? 80 : (enemy.isElite ? 35 : (enemy.def.baseHp >= 100 ? 15 : 8));
        this.scene.hero.gainXp(xpGain, this.fx);
      }
    }
    if (enemy.def.splitOnDeath) {
      const sp = enemy.def.splitOnDeath;
      for (let i = 0; i < sp.count; i++) {
        const lat = (i === 0 ? -5 : 5);
        const deltaDist = (i === 0 ? -4 : 4);
        this.spawnEnemy(sp.type, map, enemy.waveIndex, {
          fromWave: false,
          startDistPx: Math.max(0, enemy.distPx + deltaDist),
          lateralOffsetPx: lat
        });
      }
    }

    // 7.4 裂殖母体 (boss_m3) 死亡时分裂为 3 只裂殖虫
    if (enemy.isBoss && enemy.def.phases && enemy.def.phases.phase3DeathSplit) {
      const bsp = enemy.def.phases.phase3DeathSplit;
      for (let i = 0; i < bsp.count; i++) {
        const lat = (i - 1) * 6;
        const deltaDist = (i - 1) * 10;
        this.spawnEnemy(bsp.type, map, enemy.waveIndex, {
          fromWave: false,
          startDistPx: Math.max(0, enemy.distPx + deltaDist),
          lateralOffsetPx: lat
        });
      }
    }
  }

  /**
   * 固定步长更新所有敌人（移动、持续伤害结算、Boss召唤、终点漏怪判定）
   */
  update(dt, combatTimeSec, map, economy, fx, onLeakCallback, towerManager) {
    const list = this.pool.getActiveList();

    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];

      // 死亡/分裂动画播放完毕后回收到对象池
      if (e.state === 'death') {
        e.deathTimer -= dt;
        e.animTimer += dt;
        const totalDeathFrames = e.def.animFrames.death || e.def.animFrames.split || 3;
        e.animFrame = Math.min(totalDeathFrames - 1, Math.floor((1 - Math.max(0, e.deathTimer) / 0.24) * totalDeathFrames));
        if (e.deathTimer <= 0) {
          this.pool.releaseAt(i);
        }
        continue;
      }

      // 递减白闪与受击护甲帧
      if (e.whiteFlashFrames > 0) {
        e.whiteFlashFrames -= 1;
      }
      if (e.hitArmorFrames > 0) {
        e.hitArmorFrames -= 1;
      }

      // 递减标记与残留减速计时
      if (e.markTimer > 0) {
        e.markTimer = Math.max(0, e.markTimer - dt);
      }
      // Shaman heal tick
      if (e.type === 'shaman' && e.state === 'walk') {
        e.healTimer = (e.healTimer || 0) + dt;
        e.necroTimer = Math.max(0, (e.necroTimer || 0) - dt);
        if (e.healTimer >= 3.2) {
          e.healTimer = 0;
          let healedAny = false;
          for (let oi = 0; oi < list.length; oi++) {
            const oe = list[oi];
            if (oe !== e && oe.state === 'walk' && Math.hypot(oe.x - e.x, oe.y - e.y) <= 85) {
              if (oe.hp < oe.maxHp) {
                oe.hp = Math.min(oe.maxHp, oe.hp + 40);
                healedAny = true;
              }
            }
          }
          if (healedAny && fx) {
            fx.spawnFloatingText(e.x, e.y - 20, '暗愈光环 +40', '#52C41A', 1.0);
            fx.spawnShockwave(e.x, e.y, 85, '#52C41A');
          }
        }
      }

      if (e.unearthTimer > 0) {
        e.unearthTimer = Math.max(0, e.unearthTimer - dt);
      }

      if (e.residualSlowTimer > 0) {
        e.residualSlowTimer = Math.max(0, e.residualSlowTimer - dt);
      }

      // 5.4 & 5.5 结算持续伤害（雾团、灼烧区）：不暴击、不吃标记，受护甲影响，最多叠加 3 个来源
      if (e.dotSources.length > 0) {
        if (e.dotSources.length > CONFIG.COMBAT.MAX_DOT_SOURCES) {
          e.dotSources.sort((a, b) => b - a);
        }
        const count = Math.min(CONFIG.COMBAT.MAX_DOT_SOURCES, e.dotSources.length);
        const effArmor = this.getEffectiveArmor(e);
        let totalDps = 0;
        for (let k = 0; k < count; k++) {
          const srcDps = e.dotSources[k];
          const actualDps = Math.max(srcDps - effArmor, srcDps * CONFIG.COMBAT.MIN_ARMOR_DAMAGE_RATIO);
          totalDps += actualDps;
        }
        e.hp -= totalDps * dt;
        e.dotSources.length = 0;

        if (e.hp <= 0) {
          this.handleEnemyDeath(e, totalDps, combatTimeSec, map, economy, fx);
          continue;
        }
        this.checkBossPhaseTransitions(e, map, fx);
      }

      // Boss 二阶段定时召唤
      if (e.isBoss && e.bossPhase >= 2 && e.def.phases && e.def.phases.phase2Summon) {
        e.summonTimer += dt;
        if (e.summonTimer >= e.def.phases.phase2Summon.interval) {
          e.summonTimer = 0;
          this.triggerBossSummon(e, map, fx);
        }
      }

      // Boss 阶段切换过渡动画
      if (e.phaseAnimTimer > 0) {
        e.phaseAnimTimer -= dt;
        e.animTimer += dt;
        if (e.animTimer >= 0.1) {
          e.animTimer = 0;
          e.animFrame = (e.animFrame + 1) % 4;
        }
      } else {
        // 正常行走/飞行动画帧推进
        e.animTimer += dt;
        if (e.animTimer >= 0.14) {
          e.animTimer = 0;
          e.animFrame = (e.animFrame + 1) % (e.def.animFrames.walk || 4);
        }
      }

      // 计算当前实际移动速度
      const effSlow = this.getEffectiveSlow(e);
      const speedTilesPerSec = e.baseSpeedTiles * e.speedMultiplier * (1 - effSlow);
      const speedPxPerSec = speedTilesPerSec * TILE_SIZE;

      // 敌人主动攻击附近的蘑菇防御塔（近战撕咬 / 远程喷毒）
      if (!e.atkCooldown) e.atkCooldown = 0.5 + Math.random() * 0.5;
      if (e.atkCooldown > 0) e.atkCooldown -= dt;

      let attackingTower = null;
      if (towerManager && towerManager.towers && towerManager.towers.length > 0) {
        const isMoth = e.type === 'moth';
        const atkRange = isMoth ? 130 : 42; // 飞蛾远程 130px，地面甲虫近战 42px
        const atkInterval = isMoth ? 1.8 : 1.2;
        const atkDamage = isMoth ? 14 : (e.type === 'armored' ? 24 : 14);

        let bestTower = null;
        let bestScore = 999999;
        for (let tIdx = 0; tIdx < towerManager.towers.length; tIdx++) {
          const tw = towerManager.towers[tIdx];
          if (tw.dormantTimer > 0) continue; // 忽略已休眠枯萎的塔
          const d = Math.hypot(tw.x - e.x, tw.y - e.y);
          if (d <= atkRange) {
            // 甜美孢子气味：虫群优先啃食后排灵光太阳蘑菇！
            let score = d - (tw.typeId === 'lumina' ? 1000 : 0);
            if (score < bestScore) {
              bestScore = score;
              bestTower = tw;
            }
          }
        }
        if (bestTower) {
          attackingTower = bestTower;
          if (e.atkCooldown <= 0) {
            e.atkCooldown = atkInterval;
            towerManager.damageTower(bestTower, atkDamage, e, fx);
            if (isMoth) {
              bestTower.poisonTimer = 3.0;
            }
            if (fx) {
              fx.spawnParticles(bestTower.x, bestTower.y - 6, 4, [e.tintColor, '#FF7875'], 20, 50, 0.15, 0.25, 3);
            }
          }
        }
      }

      // 如果正在近战啃食，敌人停下移动；如果是远程飞蛾，减速 50% 移动
      // Leaper leaping jump mechanics (跳跃刺客飞跃阻挡)
      if (e.isLeaper && e.state === 'walk') {
        if (e.isLeaping) {
          e.leapProgress += dt / 0.42; // 0.42s flight time
          // Advance rapidly forward along path during leap
          e.distPx += (e.def.leapDistancePx || 92) * (dt / 0.42);

          if (e.leapProgress >= 1.0) {
            e.isLeaping = false;
            e.leapProgress = 0;
            e.leapCooldown = e.def.leapCooldown || 4.5;
            if (fx) {
              fx.spawnFloatingText(e.x, e.y - 16, '飞跃落地!', '#73D13D', 1.0);
              if (fx.spawnShockwave) fx.spawnShockwave(e.x, e.y, 22, '#52C41A');
            }
            platform.playSfx('sfx_thorn');
          }
        } else {
          e.leapCooldown = Math.max(0, e.leapCooldown - dt);
          // If guard is near or blocking: leap over!
          const shouldLeap = (e.isBlocked && e.blockedBy) || (e.leapCooldown <= 0 && Math.random() < 0.05);
          if (shouldLeap && e.leapCooldown <= 0) {
            e.isLeaping = true;
            e.leapProgress = 0;
            if (e.isBlocked && e.blockedBy) {
              e.blockedBy.blockedEnemy = null;
              e.isBlocked = false;
              e.blockedBy = null;
            }
            if (fx) {
              fx.spawnFloatingText(e.x, e.y - 18, '蓄力飞跃!', '#FAAD14', 1.15);
              fx.spawnParticles(e.x, e.y, 8, ['#52C41A', '#FAAD14'], 15, 30);
            }
            platform.playSfx('sfx_shoot');
          }
        }
      }

      const isMeleeAttacking = attackingTower && e.type !== 'moth';
      const isBlockedByGuard = e.isBlocked && e.blockedBy && e.blockedBy.state !== 'dead';
      const moveSlow = (isMeleeAttacking || isBlockedByGuard) ? 0 : (attackingTower ? 0.5 : 1.0);
      e.distPx += speedPxPerSec * dt * moveSlow;

      // 特种敌人（织网蛛 / 毒蛾）吐丝技能
      if (e.def.webCooldown && towerManager && towerManager.towers && towerManager.towers.length > 0) {
        if (!e.webCooldownTimer) e.webCooldownTimer = e.def.webCooldown * (0.3 + Math.random() * 0.4);
        e.webCooldownTimer -= dt;
        if (e.webCooldownTimer <= 0) {
          const webRangePx = (e.def.webRangeTiles || 4.5) * TILE_SIZE;
          let targetTower = null;
          let minD = webRangePx;
          for (let tI = 0; tI < towerManager.towers.length; tI++) {
            const tw = towerManager.towers[tI];
            if (tw.isWebbed || tw.dormantTimer > 0) continue;
            const dist = Math.hypot(tw.x - e.x, tw.y - e.y);
            // 织丝蛛优先向后排生产太阳蘑菇发射禁锢蛛网
            const score = dist - (tw.typeId === 'lumina' ? 400 : 0);
            if (score < minD) {
              minD = score;
              targetTower = tw;
            }
          }
          if (targetTower) {
            e.webCooldownTimer = e.def.webCooldown + Math.random() * 2.5;
            this.flyingWebs.push({
              startX: e.x,
              startY: e.y,
              targetX: targetTower.x,
              targetY: targetTower.y,
              targetTower: targetTower,
              curX: e.x,
              curY: e.y,
              timer: 0,
              duration: 0.38
            });
            if (fx) {
              fx.spawnParticles(e.x, e.y, 6, ['#BAE7FF', '#FFFFFF'], 15, 40, 0.15, 0.3, 2);
            }
          }
        }
      }


      // 重置本步瞬时雾团效果（下步由子弹/雾团系统重新注入）
      e.activeSlow = 0;
      e.armorReduction = 0;

      const route = e.isFlying ? map.airRoute : ((e.routeIndex === 1 && map.groundRoute2) ? map.groundRoute2 : map.groundRoute);
      if (e.distPx >= route.totalLengthPx) {
        // 抵达终点种子仓库：扣除威胁值并移除
        const sampleEnd = sampleRouteAtDistance(route, route.totalLengthPx, 0);
        if (fx) {
          fx.onSeedDamaged(sampleEnd.x, sampleEnd.y);
        }
        const defeated = economy ? economy.onEnemyLeak(e.threat) : false;
        this.pool.releaseAt(i);
        if (onLeakCallback) {
          onLeakCallback(defeated);
        }
        continue;
      }

      const sample = sampleRouteAtDistance(route, e.distPx, e.lateralOffsetPx);
      e.x = sample.x;
      e.y = sample.y;
      e.vx = sample.dx * speedPxPerSec;
      e.vy = sample.dy * speedPxPerSec;
    }

    // 更新空中飞行的蛛丝飞弹（弹道移动、碰撞判定、命中上状态、回收）
    for (let i = this.flyingWebs.length - 1; i >= 0; i--) {
      const w = this.flyingWebs[i];
      w.timer = (w.timer || 0) + dt;
      const duration = w.duration || 0.38;
      const progress = Math.min(1.0, w.timer / duration);
      // 抛物线轨迹
      const arcHeight = Math.sin(progress * Math.PI) * 28;
      w.curX = w.startX + (w.targetX - w.startX) * progress;
      w.curY = w.startY + (w.targetY - w.startY) * progress - arcHeight;

      if (progress >= 1.0 || w.timer >= 1.2) {
        if (w.targetTower && towerManager && towerManager.towers && towerManager.towers.includes(w.targetTower)) {
          if (!w.targetTower.isWebbed && typeof towerManager.applyWeb === 'function') {
            towerManager.applyWeb(w.targetTower, 3, fx);
          }
        } else if (fx) {
          fx.spawnParticles(w.targetX, w.targetY, 8, ['#BAE7FF', '#FFFFFF', '#D3ADF7'], 20, 45, 0.2, 0.4, 3);
        }
        this.flyingWebs.splice(i, 1);
      }
    }
  }

  /**
   * 预测敌人在 futureSec 秒后的位置（供瞭望菇、尖刺菇、爆裂菇预判瞄准使用）
   */
  predictEnemyPosition(enemy, futureSec, map) {
    if (!enemy) return { x: 0, y: 0 };
    const route = enemy.isFlying ? map.airRoute : ((enemy.routeIndex === 1 && map.groundRoute2) ? map.groundRoute2 : map.groundRoute);
    const effSlow = this.getEffectiveSlow(enemy);
    const speedPxPerSec = enemy.baseSpeedTiles * enemy.speedMultiplier * (1 - effSlow) * TILE_SIZE;
    const targetDist = Math.min(route.totalLengthPx, enemy.distPx + speedPxPerSec * futureSec);
    return sampleRouteAtDistance(route, targetDist, enemy.lateralOffsetPx);
  }

  /**
   * 绘制所有敌人（先绘制地面敌人，再绘制飞行敌人影子与本体，最后绘制生命条与状态图标）
   */
  handleClickOnEnemy(mx, my, fx) {
    const alive = this.getAliveEnemies();
    for (let i = alive.length - 1; i >= 0; i--) {
      const e = alive[i];
      const dist = Math.hypot(mx - e.x, my - e.y);
      if (dist <= 26) {
        // A. Burrower Underground Stomp
        if (e.isUnderground) {
          e.stompClicks = (e.stompClicks || 0) + 1;
          if (e.stompClicks >= 2) {
            e.isUnderground = false;
            e.unearthTimer = 1.5;
            if (fx) {
              fx.spawnFloatingText(e.x, e.y - 20, '震裂出土!', '#FAAD14', 1.3);
              fx.spawnParticles(e.x, e.y, 18, ['#8C6842', '#D48806'], 30, 50);
            }
            platform.playSfx('sfx_thorn');
          } else {
            if (fx) {
              fx.spawnFloatingText(e.x, e.y - 12, '重踩土丘!', '#FFE58F', 0.9);
              fx.spawnParticles(e.x, e.y, 8, ['#8C6842'], 15, 25);
            }
            platform.playSfx('sfx_click');
          }
          return true;
        }

        // B. Volatile Pod Click-Defuse (PvZ style click intervention)
        if (e.type === 'volatile_pod' && !e.isDefused) {
          e.isDefused = true;
          e.hp -= 35;
          if (fx) {
            fx.spawnFloatingText(e.x, e.y - 20, '刺破毒囊!', '#52C41A', 1.25);
            fx.spawnParticles(e.x, e.y, 14, ['#52C41A', '#B7EB8F'], 20, 35);
          }
          platform.playSfx('sfx_click');
          return true;
        }
      }
    }
    return false;
  }

  render(ctx) {

    // 绘制空中飞行的 100% AI 手绘幽光蛛丝飞弹 (100% AI Hand-Painted Silk Cocoon Bolus)
    const silkBallImg = platform.getImage('assets/vfx/proj_spider_silk_ball.png');
    for (let i = 0; i < this.flyingWebs.length; i++) {
      const w = this.flyingWebs[i];
      ctx.save();
      // 1. 幽暗蛛丝轨迹：极度轻柔半透明多重有机丝线 (透明度 0.25)
      ctx.strokeStyle = 'rgba(210, 180, 255, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(w.startX, w.startY);
      const cpX = (w.startX + w.targetX) * 0.5;
      const cpY = (w.startY + w.targetY) * 0.5 - 28;
      ctx.quadraticCurveTo(cpX, cpY, w.curX, w.curY);
      ctx.stroke();

      // 2. 蛛丝飞弹核心：100% 纯 AI 手绘透光毒性蛛丝茧球
      if (silkBallImg && silkBallImg.width) {
        ctx.translate(Math.round(w.curX), Math.round(w.curY));
        ctx.rotate(w.timer * 12);
        const bSize = 28;
        ctx.drawImage(silkBallImg, -bSize * 0.5, -bSize * 0.5, bSize, bSize);
      } else {
        ctx.fillStyle = 'rgba(230, 245, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(w.curX, w.curY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const list = this.pool.getActiveList();
    if (list.length === 0) return;

    // 1. 地面敌人
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e.isFlying) {
        this.renderSingleEnemy(ctx, e);
      }
    }

    // 2. 飞行敌人（先绘制独立影子，再绘制空中本体）
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.isFlying) {
        const shadowOffset = e.def.shadowOffsetPx || 14;
        if (!drawEnemyShadow(ctx, e.type, e.x, e.y, shadowOffset)) {
          ctx.fillStyle = 'rgba(20, 33, 61, 0.45)';
          ctx.fillRect(Math.round(e.x - 8), Math.round(e.y + shadowOffset - 3), 16, 6);
        }
        this.renderSingleEnemy(ctx, e);
      }
    }
  }

  renderSingleEnemy(ctx, e) {
    let animState = 'walk';
    if (e.state === 'death') {
      animState = 'death';
    } else if (e.phaseAnimTimer > 0) {
      animState = 'phase';
    } else if (e.hitArmorFrames > 0 && e.def.animFrames.hitArmor) {
      animState = 'hitArmor';
    }

    const flashWhite = e.whiteFlashFrames > 0;
    if (e.isEnraged && e.state !== 'death') {
      ctx.save();
      ctx.fillStyle = '#FF4D4F';
      ctx.shadowColor = '#FF4D4F';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(e.x - 3, e.y - 4, 1.5, 0, Math.PI * 2);
      ctx.arc(e.x + 3, e.y - 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // 100% AI Hand-Painted Tactical Enemies Rendering
    let customImgPath = null;
    let jumpOffsetY = 0;
    if (e.isLeaper && e.isLeaping) {
      // Mid-air height arc: 36px high peak
      jumpOffsetY = Math.sin(e.leapProgress * Math.PI) * 36;
      // Draw ground shadow beneath jumping leaper
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + 3, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    let customW = 32, customH = 32;

    if (e.isUnderground) {
      // 潜地土丘
      ctx.save();
      const wobble = Math.sin(e.animTimer * 18) * 1.5;
      const moundImg = platform.getImage('assets/vfx/enemy_burrow_mound.png');
      if (moundImg && moundImg.width) {
        ctx.drawImage(moundImg, e.x - 18 + wobble, e.y - 12, 36, 26);
      } else {
        ctx.fillStyle = '#8C6842';
        ctx.beginPath();
        ctx.ellipse(e.x + wobble, e.y + 4, 14, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    } else if (e.type === 'burrower') {
      customImgPath = 'assets/vfx/enemy_burrower.png';
      customW = 38; customH = 32;
    } else if (e.type === 'volatile_pod') {
      customImgPath = 'assets/vfx/enemy_volatile_pod.png';
      customW = 32; customH = 34;
    } else if (e.type === 'shaman') {
      customImgPath = 'assets/vfx/enemy_shaman.png';
      customW = 38; customH = 36;
    } else if (e.type === 'skeletal_husk') {
      customImgPath = 'assets/vfx/enemy_skeletal_husk.png';
      customW = 30; customH = 30;
    } else if (e.type === 'leaper') {
      customImgPath = e.isLeaping ? 'assets/vfx/enemy_leaper_jump.png' : 'assets/vfx/enemy_leaper.png';
      customW = e.isLeaping ? 40 : 36;
      customH = e.isLeaping ? 40 : 32;
    } else if (e.type === 'siege_beetle') {
      customImgPath = 'assets/vfx/enemy_siege_beetle.png';
      customW = 44; customH = 42;
    } else if (e.type === 'weaver') {
      customImgPath = 'assets/vfx/enemy_weaver.png';
      customW = 38; customH = 34;
    }

    if (customImgPath) {
      const cImg = platform.getImage(customImgPath);
      if (cImg && cImg.width) {
        ctx.save();
        const walkBob = Math.sin(e.animTimer * 10) * 1.5;
        // 高性能纯 GPU 闪白 (去除导致 GPU 重新光栅化的 ctx.filter)
        if (flashWhite) {
          ctx.globalAlpha = 0.85;
        }
        ctx.drawImage(cImg, e.x - customW * 0.5, e.y - customH * 0.5 - walkBob - jumpOffsetY, customW, customH);
        ctx.restore();

        // 受击火花星芒 (100% AI Hand-Painted Hit Spark)
        if (flashWhite) {
          const sparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
          if (sparkImg && sparkImg.width) {
            ctx.save();
            ctx.drawImage(sparkImg, e.x - 16, e.y - 16 - walkBob, 32, 32);
            ctx.restore();
          }
        }
        return;
      }
    }

    // 普通图集怪物受击：保留本体立绘，辅以明亮微光，杜绝纯白剪影失真
    const drawn = drawEnemySprite(ctx, e.type, animState, e.animFrame, e.x, e.y, false);
    if (!drawn) {
      const sz = (e.def.artSize.width || 12) * 2;
      ctx.fillStyle = e.tintColor;
      ctx.fillRect(Math.round(e.x - sz * 0.5), Math.round(e.y - sz * 0.5), sz, sz);
      platform.recordDrawCall(1);
    }

    // 命中火花迸发
    if (flashWhite) {
      const sparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');
      if (sparkImg && sparkImg.width) {
        ctx.save();
        ctx.drawImage(sparkImg, e.x - 16, e.y - 16, 32, 32);
        ctx.restore();
      }
    }

    // 精英怪头顶冠军徽标 (100% AI Hand-Painted Royal Crest)
    if (e.isElite && e.state !== 'death') {
      const crestImg = platform.getImage('assets/vfx/icon_elite_crest.png');
      const cy = e.y - (e.def.artSize.height || 12) - 16;
      ctx.save();
      if (crestImg && crestImg.width) {
        const cPulse = 1.0 + Math.sin(e.animTimer * 6) * 0.08;
        const cw = Math.round(28 * cPulse);
        const ch = Math.round(24 * cPulse);
        ctx.drawImage(crestImg, Math.round(e.x - cw * 0.5), Math.round(cy - ch * 0.5), cw, ch);
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(Math.round(e.x - 6), Math.round(cy - 6), 12, 12);
      }
      ctx.restore();
    }
    if (e.state === 'death') return;

    // 头部状态图标（标记、破甲、减速）
    const topY = e.y - e.def.artSize.height - 8;
    if (e.markTimer > 0) {
      const mKey = (Math.floor(e.markTimer * 6) % 2 === 0) ? 'mark_icon_0' : 'mark_icon_1';
      drawProjectileSprite(ctx, mKey, e.x, topY - 8, 0, 0.65);
    } else if (e.armorReduction > 0) {
      drawProjectileSprite(ctx, 'armor_break_icon', e.x, topY - 8, 0, 0.6);
    }

    // 受到伤害后显示成熟奇幻血条 (Mature Wood-Bordered Fantasy Micro Health Bar with Easing Damage)
    if (e.hp < e.maxHp || e.isBoss) {
      const barW = e.isBoss ? 48 : 26;
      const barH = e.isBoss ? 6 : 4;
      const bx = Math.round(e.x - barW * 0.5);
      const by = Math.round(topY);
      const ratio = Math.max(0, Math.min(1, e.hp / e.maxHp));

      ctx.save();
      // 1. 经典暗红木/深古铜浮雕边框
      ctx.fillStyle = 'rgba(24, 16, 10, 0.92)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx - 1.5, by - 1.5, barW + 3, barH + 3, 3) : ctx.rect(bx - 1.5, by - 1.5, barW + 3, barH + 3);
      ctx.fill();

      // 2. 内底槽
      ctx.fillStyle = 'rgba(10, 10, 10, 0.75)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, barW, barH, 2) : ctx.rect(bx, by, barW, barH);
      ctx.fill();

      // 3. 动态血量填充
      if (ratio > 0) {
        const fillW = Math.max(2, Math.round(barW * ratio));
        let hpGrad = '#52C41A';
        if (ratio < 0.25) hpGrad = '#FF4D4F';
        else if (ratio < 0.55) hpGrad = '#FAAD14';

        if (e.isBoss) hpGrad = '#FA8C16';
        else if (e.isFlying) hpGrad = '#13C2C2';

        ctx.fillStyle = hpGrad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, fillW, barH, 2) : ctx.rect(bx, by, fillW, barH);
        ctx.fill();
      }

      // 4. 金属微光边线
      ctx.strokeStyle = e.isBoss ? 'rgba(255, 215, 0, 0.75)' : 'rgba(140, 110, 80, 0.65)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx - 1.5, by - 1.5, barW + 3, barH + 3, 3) : ctx.rect(bx - 1.5, by - 1.5, barW + 3, barH + 3);
      ctx.stroke();

      ctx.restore();
      platform.recordDrawCall(1);
    }
  }
}

module.exports = EnemyManager;
