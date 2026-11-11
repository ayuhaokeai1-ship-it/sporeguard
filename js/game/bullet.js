/**
 * 子弹与持续区域系统 (js/game/bullet.js)
 * 使用对象池（子弹上限 150，区域上限 40）
 * 严格实现 5.6 弹道与命中规则：
 * - 瞭望菇：预判射击，目标中途死亡则子弹消失
 * - 尖刺菇：预判方向直线穿透、不追踪，同一发对同一敌人最多命中一次
 * - 爆裂菇：发射时锁定预判落点，中途目标死亡照常落地爆炸，全额无衰减溅射，B3 留下熔金灼烧区
 * - 雾菇：在最密集处生成雾团，减速、破甲(A3)、离雾残留(A2/A3)及持续伤害
 */

const ObjectPool = require('../core/pool');
const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { drawProjectileSprite, drawHazardSprite } = require('../core/atlasRenderer');
const platform = require('../core/platform');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class BulletManager {
  constructor() {
    // 子弹对象池（严格上限 150）
    this.bulletPool = new ObjectPool(
      () => ({
        kind: 'watch', // 'watch' | 'thorn' | 'burst'
        spriteKey: 'watch_base',
        x: 0,
        y: 0,
        startX: 0,
        startY: 0,
        targetX: 0,
        targetY: 0,
        vx: 0,
        vy: 0,
        speed: 640,
        angle: 0,
        baseDamage: 40,
        damageBonus: 0,
        isCrit: false,
        appliesMark: false,
        targetEnemy: null,
        targetUid: 0,
        targetObstacle: null,
        pierceRemaining: 1,
        pierceCountSoFar: 0,
        pierceBonusPerHit: 0,
        pierceBonusMax: 0,
        hitUids: [],
        flightTimer: 0,
        flightDuration: 0.38,
        splashRadiusPx: 40,
        burnZoneCfg: null,
        branchColor: PALETTE.MUSHROOM_GILL,
        hasToxicBurst: false,
        hasPoisonThorn: false,
        armorPierceRatio: 0,
        flatArmorPierce: 0,
        holySmite: false,
        life: 0,
        maxLife: 2.0
      }),
      (b) => {
        b.hitUids.length = 0;
        b.targetEnemy = null;
        b.targetUid = 0;
        b.targetObstacle = null;
        b.burnZoneCfg = null;
        b.life = 0;
        b.flightTimer = 0;
        b.pierceCountSoFar = 0;
        b.hasToxicBurst = false;
        b.hasPoisonThorn = false;
        b.armorPierceRatio = 0;
        b.flatArmorPierce = 0;
        b.holySmite = false;
        b.sourceTower = null;
      },
      CONFIG.POOL_CAPS.BULLETS
    );

    // 雾团、酸雾与灼烧区对象池（上限 40）
    this.hazardPool = new ObjectPool(
      () => ({
        kind: 'mist', // 'mist' | 'burn' | 'acid'
        spriteKey: 'mist_base',
        x: 0,
        y: 0,
        radiusPx: 48,
        duration: 3.0,
        timer: 0,
        slow: 0,
        residualSlowDuration: 0,
        armorReduction: 0,
        dps: 4,
        affectAir: true,
        color: PALETTE.BRANCH_A,
        sourceTower: null
      }),
      (h) => {
        h.sourceTower = null;
        h.slow = 0;
        h.residualSlowDuration = 0;
        h.armorReduction = 0;
        h.dps = 0;
        h.timer = 0;
        h.affectAir = true;
      },
      CONFIG.POOL_CAPS.HAZARDS
    );
  }

  clear() {
    this.bulletPool.clear();
    this.hazardPool.clear();
  }

  /**
   * 发射瞭望菇单体预判子弹
   */
  spawnWatchBullet(x, y, targetEnemy, predX, predY, node, baseDamage, targetObstacle = null) {
    const b = this.bulletPool.acquire(false);
    if (!b) return null;

    const dx = predX - x;
    const dy = predY - y;
    const dist = Math.max(1, Math.hypot(dx, dy));

    b.kind = 'watch';
    b.spriteKey = node.branch === 'A' ? 'watch_a' : (node.branch === 'B' ? 'watch_b' : 'watch_base');
    b.x = x;
    b.y = y;
    b.speed = node.bulletSpeed || 640;
    b.vx = (dx / dist) * b.speed;
    b.vy = (dy / dist) * b.speed;
    b.angle = Math.atan2(dy, dx);
    b.baseDamage = baseDamage;
    b.damageBonus = node.damageBonus || 0;
    b.isCrit = node.critRate > 0 && Math.random() < node.critRate;
    b.appliesMark = Boolean(node.appliesMark);
    b.armorPierceRatio = (node.armorPierce && node.armorPierce < 1) ? node.armorPierce : 0;
    b.flatArmorPierce = (node.armorPierce && node.armorPierce >= 1) ? node.armorPierce : 0;
    b.targetEnemy = targetEnemy;
    b.targetUid = targetEnemy ? targetEnemy.uid : 0;
    b.targetObstacle = targetObstacle;
    b.branchColor = node.branch === 'A' ? PALETTE.BRANCH_A : (node.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.UPGRADE_LV1);
    b.maxLife = 2.5;
    return b;
  }

  /**
   * 发射尖刺菇直线穿透尖刺（支持 A3 侧刺与 B3 穿透递增伤害）
   */
  spawnThornSpike(x, y, angleRad, node, baseDamage, damageScale = 1.0, options = null) {
    const b = this.bulletPool.acquire(false);
    if (!b) return null;

    b.kind = 'thorn';
    b.spriteKey = node.branch === 'A' ? 'thorn_a' : (node.branch === 'B' ? 'thorn_b' : 'thorn_base');
    b.x = x;
    b.y = y;
    b.speed = node.bulletSpeed || 900;
    b.angle = angleRad;
    b.vx = Math.cos(angleRad) * b.speed;
    b.vy = Math.sin(angleRad) * b.speed;
    b.baseDamage = baseDamage * damageScale;
    b.damageBonus = node.damageBonus || 0;
    b.isCrit = false;
    b.appliesMark = false;
    b.armorPierceRatio = (node.armorPierce && node.armorPierce < 1) ? node.armorPierce : 0;
    b.flatArmorPierce = (node.armorPierce && node.armorPierce >= 1) ? node.armorPierce : 0;
    b.pierceRemaining = node.pierce || 2;
    b.pierceCountSoFar = 0;
        b.hasToxicBurst = false;
        b.hasPoisonThorn = false;
    b.pierceBonusPerHit = node.pierceDamageBonusPerHit || 0;
    b.pierceBonusMax = node.pierceDamageBonusMax || 0;
    b.branchColor = node.branch === 'A' ? PALETTE.BRANCH_A : (node.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.MUSHROOM_GILL);
    // 尖刺射程外稍作延伸后消散
    const maxDistPx = (node.range + 0.75) * TILE_SIZE;
    b.maxLife = maxDistPx / b.speed;
    b.hasPoisonThorn = options && options.hasPoisonThorn;
    return b;
  }

  /**
   * 发射爆裂菇抛物线炮弹（锁定预判落点）
   */
  spawnBurstShell(x, y, targetX, targetY, node, baseDamage, options = null) {
    const b = this.bulletPool.acquire(false);
    if (!b) return null;

    b.kind = 'burst';
    b.spriteKey = node.branch === 'A' ? 'burst_a' : (node.branch === 'B' ? 'burst_b' : 'burst_base');
    b.startX = x;
    b.startY = y;
    b.x = x;
    b.y = y;
    b.targetX = targetX;
    b.targetY = targetY;
    b.flightTimer = 0;
    b.flightDuration = node.flightTime || 0.38;
    b.baseDamage = baseDamage;
    b.damageBonus = node.damageBonus || 0;
    b.splashRadiusPx = (node.splashRadius || 1.25) * TILE_SIZE;
    b.burnZoneCfg = node.burnZone || null;
    b.branchColor = node.branch === 'A' ? PALETTE.BRANCH_A : (node.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.UPGRADE_LV1);
    b.maxLife = b.flightDuration + 0.1;
    b.hasToxicBurst = options && options.hasToxicBurst;
    return b;
  }

  /**
   * 生成雾菇孢子雾团
   */
  spawnLuminaRay(x, y, targetEnemy, node, baseDamage, targetObstacle = null) {
    const b = this.bulletPool.acquire(true);
    if (!b) return null;

    b.kind = 'lumina';
    b.spriteKey = 'proj_lumina';
    b.x = x;
    b.y = y;
    b.targetEnemy = targetEnemy;
    b.targetUid = targetEnemy ? targetEnemy.uid : 0;
    b.targetObstacle = targetObstacle;
    b.speed = 720;
    b.baseDamage = baseDamage || 22;
    b.holySmite = Boolean(node.holySmite);
    b.damageBonus = node.damageBonus || 0;
    b.isCrit = Math.random() < (node.critChance || 0.15);
    b.life = 0;
    b.maxLife = 1.0;
    b.branchColor = '#FFC53D';
    return b;
  }

  spawnMistCloud(x, y, node) {
    // 检查附近是否已有同类毒雾：直接刷新持续时间与效果，杜绝重复实体在同一地面堆叠
    const active = this.hazardPool.getActiveList();
    for (let i = 0; i < active.length; i++) {
      const ex = active[i];
      if (ex.kind === 'mist' && Math.hypot(ex.x - x, ex.y - y) <= 28) {
        ex.timer = 0;
        ex.duration = Math.max(ex.duration, node.cloudDuration || 3.0);
        ex.slow = Math.max(ex.slow, node.slow || 0.30);
        ex.dps = Math.max(ex.dps, node.dps || 4);
        if (node.sourceTower && !ex.sourceTower) {
          ex.sourceTower = node.sourceTower;
        }
        return ex;
      }
    }
    const h = this.hazardPool.acquire(true);
    if (!h) return null;

    h.kind = 'mist';
    h.spriteKey = node.branch === 'A' ? 'mist_a' : (node.branch === 'B' ? 'mist_b' : 'mist_base');
    h.x = x;
    h.y = y;
    h.radiusPx = (node.cloudRadius || 1.5) * TILE_SIZE;
    h.duration = node.cloudDuration || 3.0;
    h.timer = 0;
    h.slow = node.slow || 0.30;
    h.residualSlowDuration = node.residualSlowDuration || 0;
    h.armorReduction = (node.armorReduction || 0) + ((this.scene && this.scene.toxicMiasmaDebuff) ? this.scene.toxicMiasmaDebuff * 4 : 0);
    h.dps = node.dps || 4;
    h.affectAir = true;
    h.color = node.branch === 'A' ? PALETTE.BRANCH_A : (node.branch === 'B' ? PALETTE.BRANCH_B : PALETTE.UPGRADE_LV1);
    h.sourceTower = node.sourceTower || null;
    return h;
  }

  /**
   * 生成爆裂菇 B3 熔金灼烧区
   */
  spawnBurnZone(x, y, burnCfg) {
    const h = this.hazardPool.acquire(true);
    if (!h) return null;

    h.kind = 'burn';
    h.spriteKey = 'burn_0';
    h.x = x;
    h.y = y;
    h.radiusPx = (burnCfg.radius || 1.0) * TILE_SIZE;
    h.duration = burnCfg.duration || 3.0;
    h.timer = 0;
    h.slow = 0;
    h.residualSlowDuration = 0;
    h.armorReduction = 0;
    h.dps = burnCfg.dps || 8;
    h.affectAir = false; // 爆裂菇灼烧区仅作用于地面
    h.color = PALETTE.BRANCH_B;
    h.sourceTower = burnCfg.sourceTower || null;
    return h;
  }

  /**
   * 通用地面持续区域生成器（酸雾腐蚀区等元素反应/机关衍生物）
   */
  spawnHazard(cfg = {}) {
    const h = this.hazardPool.acquire(true);
    if (!h) return null;

    const kind = cfg.kind || 'acid';
    h.kind = kind;
    h.spriteKey = cfg.spriteKey || (kind === 'acid' ? 'acid_0' : (kind === 'mist' ? 'mist_base' : 'burn_0'));
    h.x = Number(cfg.x) || 0;
    h.y = Number(cfg.y) || 0;
    h.radiusPx = Math.max(16, Number(cfg.radiusPx) || 48);
    h.duration = Math.max(0.2, Number(cfg.duration) || 3.5);
    h.timer = 0;
    h.slow = Number(cfg.slow) || 0;
    h.residualSlowDuration = Number(cfg.residualSlowDuration) || 0;
    h.armorReduction = cfg.armorReduction !== undefined ? cfg.armorReduction : (kind === 'acid' ? 0.25 : 0);
    h.dps = Number(cfg.dps) || 0;
    h.affectAir = cfg.affectAir !== undefined ? Boolean(cfg.affectAir) : false;
    h.color = cfg.color || (kind === 'acid' ? '#A0D911' : (kind === 'mist' ? PALETTE.BRANCH_A : PALETTE.BRANCH_B));
    h.sourceTower = cfg.sourceTower || null;
    return h;
  }

  /**
   * 5.6 每个逻辑步执行碰撞检测与雾团/灼烧区状态注入
   */
  update(dt, combatTimeSec, map, enemyManager, economy, fx) {
    const aliveEnemies = enemyManager.getAliveEnemies();

    // 1. 更新雾团与灼烧区，向范围内敌人注入减速、破甲与持续伤害源
    const hazards = this.hazardPool.getActiveList();
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      h.timer += dt;
      if (h.timer >= h.duration) {
        this.hazardPool.releaseAt(i);
        continue;
      }

      const r2 = h.radiusPx * h.radiusPx;
      for (let j = 0; j < aliveEnemies.length; j++) {
        const e = aliveEnemies[j];
        if (!h.affectAir && e.isFlying) continue;
        const dx = e.x - h.x;
        const dy = e.y - h.y;
        if (dx * dx + dy * dy <= r2) {
          if (h.slow > 0) {
            e.activeSlow = Math.max(e.activeSlow, h.slow);
            if (h.residualSlowDuration > 0) {
              e.residualSlowTimer = Math.max(e.residualSlowTimer, h.residualSlowDuration);
              e.residualSlowValue = Math.max(e.residualSlowValue, h.slow);
            }
          }
          if (h.armorReduction > 0) {
            e.armorReduction = Math.max(e.armorReduction, h.armorReduction);
          }
          if (h.dps > 0) {
            e.dotSources.push({
              dps: h.dps,
              sourceTower: h.sourceTower || null,
              kind: h.kind || 'mist'
            });
          }
        }
      }
    }

    // 2. 更新所有子弹与炮弹碰撞
    const bullets = this.bulletPool.getActiveList();
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.life += dt;
      if (b.life >= b.maxLife) {
        this.bulletPool.releaseAt(i);
        continue;
      }

      if (b.kind === 'lumina') {
        if (b.targetObstacle) {
          if (b.targetObstacle.cleared) {
            this.bulletPool.releaseAt(i);
            continue;
          }
          const dx = b.targetObstacle.x - b.x;
          const dy = b.targetObstacle.y - b.y;
          const dist = Math.hypot(dx, dy);
          const stepMove = b.speed * dt;
          if (dist <= stepMove + 12) {
            const dmg = b.baseDamage + (b.damageBonus || 0);
            if (map && map.damageObstacle) {
              map.damageObstacle(b.targetObstacle, dmg, fx, economy, this.scene);
            }
            if (fx) {
              fx.spawnParticles(b.x, b.y, 8, ['#FFE58F', '#FAAD14'], 16, 35, 0.2, 0.4, 3);
            }
            this.bulletPool.releaseAt(i);
            continue;
          }
          b.x += (dx / dist) * stepMove;
          b.y += (dy / dist) * stepMove;
          b.angle = Math.atan2(dy, dx);
          continue;
        }
        const tgt = b.targetEnemy;
        if (!tgt || !tgt.__active || tgt.state === 'death' || tgt.uid !== b.targetUid) {
          this.bulletPool.releaseAt(i);
          continue;
        }
        const dx = tgt.x - b.x;
        const dy = tgt.y - b.y;
        const dist = Math.hypot(dx, dy);
        const stepMove = b.speed * dt;

        if (dist <= stepMove + 10) {
          // Lumina holy ray hit: holy damage + blind/slow 35%
          enemyManager.applyDirectDamage(
            tgt,
            b.baseDamage,
            b.damageBonus,
            b.isCrit,
            false,
            combatTimeSec,
            map,
            economy,
            fx,
            'lumina',
            { holySmite: b.holySmite, sourceTower: b.sourceTower }
          );
          if (this.elementalCombos) {
            this.elementalCombos.checkCombo(tgt, 'light', enemyManager, economy, fx, this.combatJuice);
          }
          tgt.activeSlow = Math.max(tgt.activeSlow || 0, 0.35);
          tgt.residualSlowTimer = Math.max(tgt.residualSlowTimer || 0, 2.0);
          tgt.residualSlowValue = Math.max(tgt.residualSlowValue || 0, 0.35);

          if (fx) {
            fx.spawnParticles(b.x, b.y, 10, ['#FFE58F', '#FAAD14', '#FFFDF5'], 18, 38, 0.2, 0.45, 3);
            fx.spawnFloatingText(tgt.x, tgt.y - 14, '圣光!', '#FFE58F', 0.9);
          }
          this.bulletPool.releaseAt(i);
          continue;
        }

        b.x += (dx / dist) * stepMove;
        b.y += (dy / dist) * stepMove;
        b.angle = Math.atan2(dy, dx);
      } else if (b.kind === 'watch') {
        if (b.targetObstacle) {
          if (b.targetObstacle.cleared) {
            this.bulletPool.releaseAt(i);
            continue;
          }
          const dx = b.targetObstacle.x - b.x;
          const dy = b.targetObstacle.y - b.y;
          const dist = Math.hypot(dx, dy);
          const stepMove = b.speed * dt;
          if (dist <= stepMove + 12) {
            const finalCrit = b.isCrit;
            const dmg = (b.baseDamage + (b.damageBonus || 0)) * (finalCrit ? 1.5 : 1.0);
            if (map && map.damageObstacle) {
              map.damageObstacle(b.targetObstacle, dmg, fx, economy, this.scene);
            }
            if (fx) {
              fx.onSingleHit(b.targetObstacle.x, b.targetObstacle.y, b.branchColor);
            }
            this.bulletPool.releaseAt(i);
            continue;
          }
          b.vx = (dx / dist) * b.speed;
          b.vy = (dy / dist) * b.speed;
          b.angle = Math.atan2(dy, dx);
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          continue;
        }
        // 5.6 瞭望菇：目标在飞行途中死亡则子弹消失
        const tgt = b.targetEnemy;
        if (!tgt || !tgt.__active || tgt.state === 'death' || tgt.uid !== b.targetUid) {
          this.bulletPool.releaseAt(i);
          continue;
        }

        // 朝目标推进并检测命中
        const dx = tgt.x - b.x;
        const dy = tgt.y - b.y;
        const dist = Math.hypot(dx, dy);
        const stepMove = b.speed * dt;

        if (dist <= stepMove + 10) {
          // 蘑菇连携反应：若目标被破甲、带标记或处于减速状态，触发【弱点贯穿 (Weakpoint Execution)】
          const isVulnerable = (tgt.armorReduction > 0 || tgt.markTimer > 0 || tgt.residualSlowTimer > 0);
          const finalCrit = b.isCrit || isVulnerable;
          const finalBonus = b.damageBonus + (isVulnerable ? 0.35 : 0);
          if (finalCrit && this.combatJuice) {
            this.combatJuice.triggerCrit(tgt.x, tgt.y, b.baseDamage * 1.8, fx);
          }
          if (isVulnerable && fx) {
            fx.spawnFloatingText(tgt.x, tgt.y - 18, '破甲!', '#6FE8FF', 1.05);
          }
          enemyManager.applyDirectDamage(
            tgt,
            b.baseDamage,
            finalBonus,
            finalCrit,
            b.appliesMark,
            combatTimeSec,
            map,
            economy,
            fx,
            'watch',
            { armorPierceRatio: b.armorPierceRatio || 0, flatArmorPierce: b.flatArmorPierce || 0, sourceTower: b.sourceTower }
          );
          if (this.elementalCombos) {
            this.elementalCombos.checkCombo(tgt, 'wood', enemyManager, economy, fx, this.combatJuice);
          }
          if (fx) {
            fx.onSingleHit(tgt.x, tgt.y, b.branchColor);
          }
          this.bulletPool.releaseAt(i);
          continue;
        }

        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed;
        b.angle = Math.atan2(dy, dx);
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // 元素反应：尖刺穿过毒雾吸收酸液转化为【腐蚀穿甲钉】
        if (!b.isAcidInfused) {
          const hazards = this.hazardPool.getActiveList();
          for (let hI = 0; hI < hazards.length; hI++) {
            const hz = hazards[hI];
            if (hz.kind === 'mist') {
              if (Math.hypot(b.x - hz.x, b.y - hz.y) <= hz.radiusPx) {
                b.isAcidInfused = true;
                b.branchColor = '#52C41A';
                b.baseDamage *= 1.35;
                if (fx) {
                  fx.spawnParticles(b.x, b.y, 4, ['#73D13D', '#B7EB8F'], 15, 35, 0.15, 0.25, 2);
                  fx.spawnFloatingText(b.x, b.y - 12, '酸蚀!', '#73D13D', 0.85);
                }
                break;
              }
            }
          }
        }
      } else if (b.kind === 'thorn') {
        // 5.6 尖刺菇：直线飞行、不追踪，同一发对同一敌人最多命中一次，仅命中地面敌人
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // 越出地图边界回收
        if (b.x < -16 || b.x > CONFIG.LAYOUT.MAP.WIDTH + 16 || b.y < -16 || b.y > CONFIG.LAYOUT.MAP.HEIGHT + 16) {
          this.bulletPool.releaseAt(i);
          continue;
        }

        // 尖刺穿透伤害地图障碍物
        if (map && map.obstacles && map.damageObstacle) {
          for (let oI = 0; oI < map.obstacles.length; oI++) {
            const obs = map.obstacles[oI];
            if (obs.cleared) continue;
            if (b.hitUids.indexOf(obs) !== -1) continue;
            const odx = obs.x - b.x;
            const ody = obs.y - b.y;
            if (odx * odx + ody * ody <= 24 * 24) {
              b.hitUids.push(obs);
              const rampBonus = Math.min(b.pierceBonusMax, b.pierceCountSoFar * b.pierceBonusPerHit);
              const totalBonus = b.damageBonus + rampBonus;
              const obsDmg = b.baseDamage * (1 + totalBonus);
              map.damageObstacle(obs, obsDmg, fx, economy, this.scene);
              b.pierceRemaining -= 1;
              if (b.pierceRemaining <= 0) {
                this.bulletPool.releaseAt(i);
                break;
              }
            }
          }
          if (b.pierceRemaining <= 0) continue;
        }

        for (let j = 0; j < aliveEnemies.length; j++) {
          const e = aliveEnemies[j];
          if (e.isFlying || e.state === 'death') continue;
          if (b.hitUids.indexOf(e.uid) !== -1) continue;

          const hitRadius = (e.def.artSize.width || 12) + 6;
          const dx = e.x - b.x;
          const dy = e.y - b.y;
          if (dx * dx + dy * dy <= hitRadius * hitRadius) {
            b.hitUids.push(e.uid);

            // B3 锯齿刺：每穿透 1 个目标，后续伤害 +20%（最多 +100%）
            const rampBonus = Math.min(b.pierceBonusMax, b.pierceCountSoFar * b.pierceBonusPerHit);
            const totalBonus = b.damageBonus + rampBonus;

            enemyManager.applyDirectDamage(
              e,
              b.baseDamage,
              totalBonus,
              false,
              false,
              combatTimeSec,
              map,
              economy,
              fx,
              'thorn',
              { armorPierceRatio: b.armorPierceRatio || 0, flatArmorPierce: b.flatArmorPierce || 0, sourceTower: b.sourceTower }
            );
            if (fx) {
              fx.onSingleHit(e.x, e.y, b.branchColor);
            }

            if (this.elementalCombos) {
              this.elementalCombos.checkCombo(e, 'earth', enemyManager, economy, fx, this.combatJuice);
            }
            b.pierceCountSoFar += 1;
            b.pierceRemaining -= 1;
            if (b.pierceRemaining <= 0) {
              this.bulletPool.releaseAt(i);
              break;
            }
          }
        }
      } else if (b.kind === 'burst') {
        // 5.6 爆裂菇：锁定预判落点，中途目标死亡照常落地结算，范围内全额无衰减伤害
        b.flightTimer += dt;
        const prog = Math.min(1, b.flightTimer / b.flightDuration);
        const arcHeight = Math.sin(prog * Math.PI) * 32;
        b.x = b.startX + (b.targetX - b.startX) * prog;
        b.y = b.startY + (b.targetY - b.startY) * prog - arcHeight;

        if (prog >= 1) {
          if (this.combatJuice) {
            this.combatJuice.addTrauma(0.32);
            this.combatJuice.triggerShockwave(b.targetX, b.targetY, b.splashRadiusPx * 1.25, 'rgba(255, 140, 0, 0.82)');
          }
          const effRadius = b.splashRadiusPx * (b.hasToxicBurst ? 1.4 : 1.0);
          const r2 = effRadius * effRadius;
          if (economy) {
            economy.beginExplosionBatch();
          }

          // 爆裂菇抛物线炮火轰炸范围内的障碍物
          if (map && map.obstacles && map.damageObstacle) {
            for (let oI = 0; oI < map.obstacles.length; oI++) {
              const obs = map.obstacles[oI];
              if (obs.cleared) continue;
              const odx = obs.x - b.targetX;
              const ody = obs.y - b.targetY;
              if (odx * odx + ody * ody <= r2) {
                const obsDmg = b.baseDamage * (1 + b.damageBonus) * 0.9;
                map.damageObstacle(obs, obsDmg, fx, economy, this.scene);
              }
            }
          }

          // 元素反应：迫击炮弹落点碰撞毒雾，引发【真菌化学毒爆】
          const hazards = this.hazardPool.getActiveList();
          for (let hI = 0; hI < hazards.length; hI++) {
            const hz = hazards[hI];
            if (hz.kind === 'mist') {
              if (Math.hypot(b.targetX - hz.x, b.targetY - hz.y) <= b.splashRadiusPx + hz.radiusPx) {
                hz.radiusPx *= 1.35;
                hz.dps += 6;
                if (fx) {
                  fx.spawnParticles(b.targetX, b.targetY, 20, ['#52C41A', '#B7EB8F', '#FFD700', '#FFA940'], 45, 130, 0.25, 0.55, 4);
                  fx.spawnFloatingText(b.targetX, b.targetY - 26, '毒爆!', '#52C41A', 1.2);
                  fx.triggerScreenShake(3.0, 0.2);
                }
                platform.playSfx('sfx_bomb');
                break;
              }
            }
          }

          for (let j = 0; j < aliveEnemies.length; j++) {
            const e = aliveEnemies[j];
            if (e.isFlying || e.state === 'death') continue;
            const dx = e.x - b.targetX;
            const dy = e.y - b.targetY;
            if (dx * dx + dy * dy <= r2) {
              // 蘑菇连携反应：若敌人处于剧毒迷雾/减速状态，炮火引发【真菌毒爆 (Chemical Reaction)】
              const isPoisoned = (e.residualSlowTimer > 0 || (e.poisonTimer && e.poisonTimer > 0));
              let bonusDmg = b.damageBonus;
              if (isPoisoned) {
                bonusDmg += b.hasToxicBurst ? 0.90 : 0.50;
                if (fx) {
                  fx.spawnFloatingText(e.x, e.y - 22, b.hasToxicBurst ? '剧毒爆裂!' : '毒爆!', '#52C41A', b.hasToxicBurst ? 1.25 : 1.15);
                  fx.spawnParticles(e.x, e.y, b.hasToxicBurst ? 16 : 14, ['#52C41A', '#FFE58F', '#FFA940'], 40, 120, 0.2, 0.48, 3.5);
                }
              }
              enemyManager.applyDirectDamage(
                e,
                b.baseDamage,
                bonusDmg,
                isPoisoned, // 毒爆直接触发暴击
                false,
                combatTimeSec,
                map,
                economy,
                fx,
                'burst',
                { sourceTower: b.sourceTower }
              );
              if (this.elementalCombos) {
                this.elementalCombos.checkCombo(e, 'fire', enemyManager, economy, fx, this.combatJuice);
              }
            }
          }

          if (economy) {
            economy.endExplosionBatch(combatTimeSec, fx);
          }

          if (fx) {
            fx.onBurstExplosion(b.targetX, b.targetY, b.splashRadiusPx, b.branchColor);
          }

          // B3 熔金或知识树「烈焰地裂」：爆心留下持续灼烧区
          const burnSource = b.burnZoneCfg || (this.scene && this.scene.pyroFissureCfg);
          if (burnSource) {
            const burnCfg = b.sourceTower
              ? Object.assign({}, burnSource, { sourceTower: b.sourceTower })
              : burnSource;
            this.spawnBurnZone(b.targetX, b.targetY, burnCfg);
          }

          this.bulletPool.releaseAt(i);
        }
      }
    }
  }

  /**
   * 绘制地面区域（雾团与灼烧区，优先使用 100% AI 手绘高清毒沼与地脉震击法阵）
   */
  renderHazards(ctx, animTimeSec) {
    const hazards = this.hazardPool.getActiveList();
    for (let i = 0; i < hazards.length; i++) {
      const h = hazards[i];
      const remain = h.duration - h.timer;
      const fadeAlpha = remain < 0.6 ? (remain / 0.6) : 1.0;
      const pulse = 0.85 + Math.sin(animTimeSec * 4 + i * 1.5) * 0.15;
      const alpha = Math.max(0.05, Math.min(1.0, fadeAlpha * pulse));

      ctx.save();
      ctx.translate(Math.round(h.x), Math.round(h.y));
      ctx.scale(1.0, 0.72); // 45度地面透视

      const r = h.radiusPx;
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, r);
      if (h.kind === 'mist') {
        grad.addColorStop(0, `rgba(179, 127, 235, ${0.28 * alpha})`);
        grad.addColorStop(0.55, `rgba(146, 84, 222, ${0.16 * alpha})`);
        grad.addColorStop(1, 'rgba(114, 46, 209, 0)');
      } else if (h.kind === 'acid') {
        grad.addColorStop(0, `rgba(160, 217, 17, ${0.34 * alpha})`);
        grad.addColorStop(0.55, `rgba(91, 140, 0, ${0.20 * alpha})`);
        grad.addColorStop(1, 'rgba(35, 120, 4, 0)');
      } else {
        grad.addColorStop(0, `rgba(255, 122, 69, ${0.35 * alpha})`);
        grad.addColorStop(0.60, `rgba(212, 56, 13, ${0.18 * alpha})`);
        grad.addColorStop(1, 'rgba(173, 33, 5, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      if (h.kind === 'acid') {
        ctx.strokeStyle = `rgba(186, 230, 55, ${0.36 * alpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 少量飘动的柔和微光孢子粒子
      const pulseTime = animTimeSec * 2.2 + i;
      ctx.fillStyle = h.kind === 'mist'
        ? `rgba(211, 173, 247, ${0.40 * alpha})`
        : (h.kind === 'acid'
          ? `rgba(186, 230, 55, ${0.52 * alpha})`
          : `rgba(255, 213, 145, ${0.40 * alpha})`);
      for (let pIdx = 0; pIdx < 3; pIdx++) {
        const pAng = (pIdx / 3) * Math.PI * 2 + pulseTime * 0.35;
        const pDist = r * 0.45 + Math.sin(pulseTime + pIdx) * (r * 0.15);
        ctx.beginPath();
        ctx.arc(Math.cos(pAng) * pDist, Math.sin(pAng) * pDist, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      platform.recordDrawCall(1);
    }
  }

  /**
   * 绘制飞行中的子弹与炮弹（优先使用 100% AI 手绘发光破空光针、地刺与真菌炸弹）
   */
  renderBullets(ctx) {
    const bullets = this.bulletPool.getActiveList();
    const hitSparkImg = platform.getImage('assets/vfx/vfx_hit_spark.png');

    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];

      let vfxPath = null;
      let drawW = 32, drawH = 32;
      if (b.kind === 'watch') {
        vfxPath = 'assets/vfx/proj_watch_arrow.png';
        drawW = 42; drawH = 14;
      } else if (b.kind === 'thorn') {
        vfxPath = 'assets/vfx/vfx_spikes.png';
        drawW = 28; drawH = 28;
      } else if (b.kind === 'burst') {
        vfxPath = 'assets/vfx/proj_burst_shell.png';
        drawW = 30; drawH = 30;
      } else if (b.kind === 'lumina') {
        vfxPath = 'assets/vfx/item_golden_spore.png';
        drawW = 22; drawH = 22;
      }

      const vfxImg = vfxPath ? platform.getImage(vfxPath) : null;
      if (vfxImg && vfxImg.width) {
        ctx.save();
        ctx.translate(Math.round(b.x), Math.round(b.y));

        if (b.kind === 'watch') {
          ctx.rotate(b.angle);
          ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
          ctx.restore();

          // 巡林神圣木羽箭尾部仙尘星芒微粒 (Fairy Dust Motes)
          ctx.save();
          const backX = b.x - Math.cos(b.angle) * 16;
          const backY = b.y - Math.sin(b.angle) * 16;
          ctx.fillStyle = 'rgba(255, 235, 140, 0.75)';
          ctx.beginPath();
          ctx.arc(backX, backY, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }

        if (b.kind === 'burst') {
          const rot = b.flightTimer * 14;
          ctx.rotate(rot);
          ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
          ctx.restore();
          continue;
        }

        if (b.kind === 'lumina') {
          // 灵光真菌与捕蝇草圣光法球：环绕星辉神圣光冕与琉璃微光
          const rot = (b.life || 0) * 8;
          ctx.rotate(rot);
          ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
          ctx.restore();

          // 纯自然圣光柔和渐变光晕
          ctx.save();
          const haloGrad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, 15);
          haloGrad.addColorStop(0, 'rgba(255, 240, 175, 0.45)');
          haloGrad.addColorStop(1, 'rgba(255, 229, 143, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }

        ctx.rotate(b.angle);
        ctx.drawImage(vfxImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
        ctx.restore();
        continue;
      }

      // 若尚未解码完毕，以纯自然优雅灵种光斑过渡，绝无生硬矩形
      ctx.save();
      ctx.fillStyle = b.branchColor || '#FFD700';
      ctx.beginPath();
      ctx.arc(Math.round(b.x), Math.round(b.y), 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      platform.recordDrawCall(1);
    }
  }
}

module.exports = BulletManager;