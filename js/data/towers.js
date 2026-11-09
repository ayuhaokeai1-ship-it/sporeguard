/**
 * 炮塔数值与升级树数据表（严格对齐第六章 6.1 - 6.4 表格）
 * 禁止在逻辑代码中硬编码任何炮塔属性
 */

const TOWERS = {
  watch: {
    id: 'watch',
    nameKey: 'tower_watch_name',
    roleKey: 'tower_watch_role',
    descKey: 'tower_watch_desc',
    canHitGround: true,
    canHitAir: true,
    defaultPriority: 'first',
    priorities: ['first', 'nearest', 'highest_hp'],
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 42,
    maxTotalCost: 480,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'watch_base_desc',
        cost: 115,
        range: 6.2,
        damage: 42,
        damageBonus: 0,
        interval: 1.25,
        bulletSpeed: 640,
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'watch_lv1_name',
        descKey: 'watch_lv1_desc',
        cost: 70,
        range: 6.6,
        damage: 52,
        damageBonus: 0.20, // 伤害 +20%，射程 +0.5
        interval: 1.25,
        bulletSpeed: 640,
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'watch_a2_name',
        descKey: 'watch_a2_desc',
        cost: 105,
        range: 8.0,        // 射程 +1.5
        damage: 56,
        damageBonus: 0.20,
        interval: 1.125,   // 攻击间隔 -10%
        bulletSpeed: 800,  // 弹速 +25% (640 * 1.25 = 800)
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'watch_a3_name',
        descKey: 'watch_a3_desc',
        cost: 175,
        range: 9.0,        // 射程 +1.0
        damage: 70,
        damageBonus: 0.20,
        interval: 1.125,
        bulletSpeed: 800,
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: true, // 命中后标记目标 3 秒，直接伤害 +15%
        markDuration: 3.0,
        markBonus: 0.20,
        armorPierce: 0.35,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'watch_b2_name',
        descKey: 'watch_b2_desc',
        cost: 105,
        range: 6.5,
        damage: 72,        // 40 * (1 + 0.20 + 0.35) = 62
        damageBonus: 0.55,
        interval: 1.25,
        bulletSpeed: 640,
        critRate: 0,
        critMultiplier: 1.0,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'watch_b3_name',
        descKey: 'watch_b3_desc',
        cost: 175,
        range: 6.5,
        damage: 86,
        damageBonus: 0.55,
        interval: 1.25,
        bulletSpeed: 640,
        critRate: 0.22,    // 暴击率 15%，暴击伤害 2 倍
        critMultiplier: 2.2,
        appliesMark: false,
        markDuration: 0,
        markBonus: 0,
        next: []
      }
    }
  },

  mist: {
    id: 'mist',
    nameKey: 'tower_mist_name',
    roleKey: 'tower_mist_role',
    descKey: 'tower_mist_desc',
    canHitGround: true,
    canHitAir: true,
    defaultPriority: 'densest',
    priorities: ['densest', 'first'],
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 4,
    maxTotalCost: 420,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'mist_base_desc',
        cost: 90,
        range: 3.5,        // 施放范围 3.5 格（全部节点保持不变）
        interval: 4.0,     // 施放间隔 4.0 秒（全部节点保持不变）
        cloudRadius: 1.5,
        cloudDuration: 3.0,
        slow: 0.30,
        dps: 5,
        residualSlowDuration: 0,
        armorReduction: 0,
        isBurningMist: false,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'mist_lv1_name',
        descKey: 'mist_lv1_desc',
        cost: 60,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 1.5,
        cloudDuration: 3.5, // 持续时间 +0.5 秒
        slow: 0.35,         // 减速 +5%
        dps: 5,
        residualSlowDuration: 0,
        armorReduction: 0,
        isBurningMist: false,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'mist_a2_name',
        descKey: 'mist_a2_desc',
        cost: 100,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 1.5,
        cloudDuration: 3.5,
        slow: 0.45,         // 减速 +10%
        dps: 6,
        residualSlowDuration: 1.0, // 离开雾团后减速残留 1.0 秒
        armorReduction: 0,
        isBurningMist: false,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'mist_a3_name',
        descKey: 'mist_a3_desc',
        cost: 170,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 1.5,
        cloudDuration: 3.5,
        slow: 0.55,         // 减速 +10%
        dps: 4,
        residualSlowDuration: 1.5,
        armorReduction: 4,  // 雾团内敌人护甲 -2（最低 0）
        isBurningMist: false,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'mist_b2_name',
        descKey: 'mist_b2_desc',
        cost: 100,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 2.0,   // 雾团半径 +0.5
        cloudDuration: 3.5,
        slow: 0.35,
        dps: 8,             // 持续伤害 +2
        residualSlowDuration: 0,
        armorReduction: 0,
        isBurningMist: false,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'mist_b3_name',
        descKey: 'mist_b3_desc',
        cost: 170,
        range: 3.5,
        interval: 4.0,
        cloudRadius: 2.5,   // 雾团半径 2.5
        cloudDuration: 3.5,
        slow: 0.35,
        dps: 14,            // 雾团燃烧，持续伤害 +4（累计 10）
        residualSlowDuration: 0,
        armorReduction: 0,
        isBurningMist: true,
        next: []
      }
    }
  },

  thorn: {
    id: 'thorn',
    nameKey: 'tower_thorn_name',
    roleKey: 'tower_thorn_role',
    descKey: 'tower_thorn_desc',
    canHitGround: true,
    canHitAir: false,
    defaultPriority: 'first',
    priorities: ['first', 'nearest', 'highest_hp'],
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 10,
    maxTotalCost: 375,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'thorn_base_desc',
        cost: 80,
        range: 4.5,
        damage: 10,
        damageBonus: 0,
        interval: 0.45,
        pierce: 2,
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'thorn_lv1_name',
        descKey: 'thorn_lv1_desc',
        cost: 55,
        range: 5.0,        // 射程 +0.5
        damage: 12,      // 伤害 +20%
        damageBonus: 0.20,
        interval: 0.45,
        pierce: 2,
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'thorn_a2_name',
        descKey: 'thorn_a2_desc',
        cost: 90,
        range: 5.0,
        damage: 12,
        damageBonus: 0.20,
        interval: 0.45,
        pierce: 4,         // 穿透数 +2
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'thorn_a3_name',
        descKey: 'thorn_a3_desc',
        cost: 150,
        range: 5.0,
        damage: 13,
        damageBonus: 0.20,
        interval: 0.45,
        pierce: 7,         // 穿透数 7
        bulletSpeed: 900,
        sideSpikes: 2,     // 每次齐射增加 2 根侧刺（左右各偏 12°），侧刺伤害 50%
        sideAngleDeg: 12,
        sideDamageRatio: 0.50,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'thorn_b2_name',
        descKey: 'thorn_b2_desc',
        cost: 90,
        range: 5.0,
        damage: 15,      // 9 * (1 + 0.20 + 0.30) = 13.5
        damageBonus: 0.50,
        interval: 0.45,
        pierce: 2,
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0,
        pierceDamageBonusMax: 0,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'thorn_b3_name',
        descKey: 'thorn_b3_desc',
        cost: 150,
        range: 5.0,
        damage: 16,
        damageBonus: 0.50,
        interval: 0.41,    // 攻击间隔 -10% (0.45 * 0.9 = 0.405 -> 0.41)
        pierce: 3,
        bulletSpeed: 900,
        sideSpikes: 0,
        sideAngleDeg: 0,
        sideDamageRatio: 0,
        pierceDamageBonusPerHit: 0.25,
        armorPierce: 6, // 每穿透 1 个目标，后续伤害 +20%（最多 +100%）
        pierceDamageBonusMax: 1.00,
        next: []
      }
    }
  },

  burst: {
    id: 'burst',
    nameKey: 'tower_burst_name',
    roleKey: 'tower_burst_role',
    descKey: 'tower_burst_desc',
    canHitGround: true,
    canHitAir: false,
    defaultPriority: 'densest',
    priorities: ['densest'], // 爆裂菇固定“最密集”
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 32,
    maxTotalCost: 465,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'burst_base_desc',
        cost: 110,
        range: 4.0,        // 射程 4.0 格（全部节点保持不变）
        damage: 32,
        damageBonus: 0,
        interval: 1.55,     // 攻击间隔 1.6 秒（全部节点保持不变）
        splashRadius: 1.25,
        flightTime: 0.38,  // 抛物线炮弹飞行时间（秒）
        burnZone: null,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'burst_lv1_name',
        descKey: 'burst_lv1_desc',
        cost: 65,
        range: 4.0,
        damage: 38,        // 伤害 +20%
        damageBonus: 0.20,
        interval: 1.55,
        splashRadius: 1.25,
        flightTime: 0.38,
        burnZone: null,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'burst_a2_name',
        descKey: 'burst_a2_desc',
        cost: 105,
        range: 4.0,
        damage: 40,
        damageBonus: 0.20,
        interval: 1.55,
        splashRadius: 1.75,// 溅射半径 +0.5
        flightTime: 0.38,
        burnZone: null,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'burst_a3_name',
        descKey: 'burst_a3_desc',
        cost: 175,
        range: 4.0,
        damage: 46,      // 30 * (1 + 0.20 + 0.15) = 40.5
        damageBonus: 0.35,
        interval: 1.55,
        splashRadius: 2.25,// 溅射半径 +0.5
        flightTime: 0.38,
        burnZone: null,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'burst_b2_name',
        descKey: 'burst_b2_desc',
        cost: 105,
        range: 4.0,
        damage: 48,        // 30 * (1 + 0.20 + 0.30) = 45
        damageBonus: 0.50,
        interval: 1.55,
        splashRadius: 1.25,
        flightTime: 0.38,
        burnZone: null,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'burst_b3_name',
        descKey: 'burst_b3_desc',
        cost: 175,
        range: 4.0,
        damage: 52,
        damageBonus: 0.50,
        interval: 1.55,
        splashRadius: 1.25,
        flightTime: 0.38,
        burnZone: {        // 爆心留下灼烧区：半径 1.0 格，持续 3 秒，每秒 8 点伤害
          radius: 1.0,
          duration: 3.5,
          dps: 12
        },
        next: []
      }
    }
  },

  lumina: {
    id: 'lumina',
    nameKey: 'tower_lumina_name',
    roleKey: 'tower_lumina_role',
    descKey: 'tower_lumina_desc',
    canHitGround: true,
    canHitAir: true,
    defaultPriority: 'nearest',
    priorities: ['nearest', 'first', 'highest_hp'],
    artSize: { width: 16, height: 24, baseSize: 16 },
    animFrames: { idle: 4, attack: 3, upgrade: 6 },
    baseDamage: 18,
    maxTotalCost: 420,
    nodes: {
      base: {
        nodeId: 'base',
        nameKey: 'node_base',
        descKey: 'lumina_base_desc',
        cost: 95,
        range: 4.0,
        damage: 8,
        interval: 2.0,
        sporeGen: 12,
        sporeInterval: 10.0,
        auraDmgBonus: 0.10,
        next: ['lv1']
      },
      lv1: {
        nodeId: 'lv1',
        nameKey: 'lumina_lv1_name',
        descKey: 'lumina_lv1_desc',
        cost: 75,
        range: 4.5,
        damage: 12,
        interval: 1.8,
        sporeGen: 16,
        sporeInterval: 9.0,
        auraDmgBonus: 0.12,
        next: ['a2', 'b2']
      },
      a2: {
        nodeId: 'a2',
        branch: 'A',
        nameKey: 'lumina_a2_name',
        descKey: 'lumina_a2_desc',
        cost: 100,
        range: 5.0,
        damage: 22,
        interval: 1.5,
        auraAspdBonus: 0.20,
        auraHeal: 25,
        healInterval: 5.0,
        next: ['a3']
      },
      a3: {
        nodeId: 'a3',
        branch: 'A',
        nameKey: 'lumina_a3_name',
        descKey: 'lumina_a3_desc',
        cost: 160,
        range: 5.5,
        damage: 42,
        interval: 1.1,
        holySmite: true,
        auraAspdBonus: 0.30,
        auraHeal: 40,
        healInterval: 4.0,
        holyWard: true,
        next: []
      },
      b2: {
        nodeId: 'b2',
        branch: 'B',
        nameKey: 'lumina_b2_name',
        descKey: 'lumina_b2_desc',
        cost: 90,
        range: 4.2,
        damage: 10,
        interval: 2.0,
        sporeGen: 24,
        sporeInterval: 7.0,
        next: ['b3']
      },
      b3: {
        nodeId: 'b3',
        branch: 'B',
        nameKey: 'lumina_b3_name',
        descKey: 'lumina_b3_desc',
        cost: 150,
        range: 4.5,
        damage: 14,
        interval: 2.0,
        sporeGen: 36,
        sporeInterval: 6.0,
        relicDropBonus: true,
        next: []
      }
    }
  }

};

const TOWER_ORDER = ['watch', 'mist', 'thorn', 'burst', 'lumina'];

module.exports = {
  TOWERS,
  TOWER_ORDER
};
