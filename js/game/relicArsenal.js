/**
 * Sporeguard - 远古遗物军械库与十二大传奇神器系统 (Ancient Relic Arsenal & Grove Artifacts)
 * 借鉴杀戮尖塔 / 怪物火车 / 铁甲神策的 Roguelite 战术神器构筑
 * 收集 12 件独一无二的苍翠林海远古圣物，触发强大的被动与主动增益
 */

const platform = require('../core/platform');
const storage = require('../save/storage');

class RelicArsenalSystem {
  constructor() {
    this.maxSlots = 4;
    this.relicDefinitions = {
      chlorophyll_prism: {
        id: 'chlorophyll_prism',
        nameKey: 'relic_prism_name',
        name: '叶绿晶棱镜',
        desc: '全塔射程 +12%，瞭望菇与刺棘菇有 10% 几率额外穿透目标',
        icon: 'assets/vfx/relic_clover.png',
        rarity: 'rare',
        unlockStars: 0,
        stats: { rangeBonus: 0.12, pierceChance: 0.10 }
      },
      amber_crown: {
        id: 'amber_crown',
        nameKey: 'relic_crown_name',
        name: '琥珀菌王冠',
        desc: '击杀/掉落金孢子收益 +15%，树人英雄每秒持续再生 12 点生命',
        icon: 'assets/vfx/relic_coin.png',
        rarity: 'legendary',
        unlockStars: 0,
        stats: { sporeBonus: 0.15, heroRegen: 12 }
      },
      thunder_core: {
        id: 'thunder_core',
        nameKey: 'relic_thunder_name',
        name: '古雷木核晶',
        desc: '雨天落雷频率缩短 35%，[R] 雷霆震爆冷却缩短 15% 并额外连击护盾目标',
        icon: 'assets/vfx/relic_lightning.png',
        rarity: 'epic',
        unlockStars: 0,
        stats: { thunderCooldownReduction: 0.35, shockCdReduction: 0.15 }
      },
      heart_of_groves: {
        id: 'heart_of_groves',
        nameKey: 'relic_heart_name',
        name: '苍翠圣林始源之心',
        desc: '全元素反应(烈焰/超导/极寒/爆轰/光合/腐蚀)触发伤害提升 35%',
        icon: 'assets/vfx/item_awakening_seed.png',
        rarity: 'legendary',
        unlockStars: 0,
        stats: { reactionDmgBonus: 0.35 }
      },
      heroic_standard: {
        id: 'heroic_standard',
        nameKey: 'relic_standard_name',
        name: '孢子近卫荣耀战旗',
        desc: '巡逻菇精卫最大生命 +45%，阵亡复活冷却时间缩短 35%',
        icon: 'assets/vfx/prop_rally_flag.png',
        rarity: 'rare',
        unlockStars: 0,
        stats: { guardHpBonus: 0.45, respawnCut: 0.35 }
      },
      windseeker_feather: {
        id: 'windseeker_feather',
        nameKey: 'relic_feather_name',
        name: '追风迅捷之羽',
        desc: '弹道飞行速度与英雄移速 +25%，英雄闪避敌方伤害 20% 几率',
        icon: 'assets/vfx/proj_watch_arrow.png',
        rarity: 'rare',
        unlockStars: 0,
        stats: { speedBonus: 0.25, dodgeChance: 0.20 }
      },
      clover_providence: {
        id: 'clover_providence',
        nameKey: 'relic_clover_name',
        name: '天命幸运四叶草',
        desc: '全守卫塔获得 +14% 暴击率，暴击倍率提升至 215%',
        icon: 'assets/vfx/relic_clover.png',
        rarity: 'rare',
        unlockStars: 2,
        stats: { critChance: 0.14, critMultiplier: 2.15 }
      },
      glacial_tear: {
        id: 'glacial_tear',
        nameKey: 'relic_tear_name',
        name: '玄冰霜华之泪',
        desc: '迷雾菇迷雾额外附加 16% 寒霜减速，并使滞留毒雾伤害 +18%',
        icon: 'assets/vfx/prop_dew.png',
        rarity: 'rare',
        unlockStars: 4,
        stats: { extraSlow: 0.16, mistDpsBonus: 0.18 }
      },
      silk_carapace: {
        id: 'silk_carapace',
        nameKey: 'relic_carapace_name',
        name: '黑曜蛛王坚甲',
        desc: '防御塔被蛛丝缠绕后 2.0 秒内自动破茧反震，对周围造成 95 点范围反噬',
        icon: 'assets/vfx/vfx_web_cocoon.png',
        rarity: 'epic',
        unlockStars: 6,
        stats: { autoCleanseSec: 2.0, counterDmg: 95 }
      },
      solar_vial: {
        id: 'solar_vial',
        nameKey: 'relic_solar_name',
        name: '日光日曜精魄瓶',
        desc: '灵光菇产孢提升 25%，圣域光环使邻近防御塔额外 +18% 攻速',
        icon: 'assets/vfx/prop_lumina_base.png',
        rarity: 'epic',
        unlockStars: 8,
        stats: { sporeHarvestBonus: 0.25, auraAtkSpd: 0.18 }
      },
      volcanic_geode: {
        id: 'volcanic_geode',
        nameKey: 'relic_geode_name',
        name: '熔岩炽火晶核',
        desc: '爆裂重炮命中直接引燃范围内敌人，附加 3 秒每秒 20 点炽火灼烧',
        icon: 'assets/vfx/proj_burst_shell.png',
        rarity: 'epic',
        unlockStars: 10,
        stats: { burnDps: 20, burnDuration: 3.0 }
      },
      deep_roots_charm: {
        id: 'deep_roots_charm',
        nameKey: 'relic_charm_name',
        name: '神木太古深根印',
        desc: '圣树生命种子上限 +3，逼近终点仓库的敌军受古根鞭笞重创 40% 当前生命',
        icon: 'assets/vfx/hero_oak.png',
        rarity: 'legendary',
        unlockStars: 12,
        stats: { extraSeeds: 3, breachPunishRatio: 0.40 }
      }
    };

    this.syncFromStorage();
  }

  syncFromStorage() {
    const saved = storage.getEquippedRelics ? storage.getEquippedRelics() : null;
    if (Array.isArray(saved) && saved.length > 0) {
      this.equippedRelicIds = saved.filter((id) => Boolean(this.relicDefinitions[id])).slice(0, this.maxSlots);
    } else {
      this.equippedRelicIds = ['chlorophyll_prism', 'amber_crown', 'thunder_core', 'heart_of_groves'];
    }
  }

  isRelicUnlocked(id) {
    const def = this.relicDefinitions[id];
    if (!def) return false;
    const req = def.unlockStars || 0;
    if (req <= 0) return true;
    const stars = storage.getTotalStars ? storage.getTotalStars() : 0;
    return stars >= req;
  }

  hasRelic(id) {
    return this.equippedRelicIds.includes(id) && this.isRelicUnlocked(id);
  }

  getRelic(id) {
    return this.relicDefinitions[id] || null;
  }

  equipRelic(id) {
    if (!this.relicDefinitions[id] || !this.isRelicUnlocked(id)) return false;
    if (this.equippedRelicIds.includes(id)) return true;
    if (this.equippedRelicIds.length >= this.maxSlots) return false;
    this.equippedRelicIds.push(id);
    if (storage.setEquippedRelics) storage.setEquippedRelics(this.equippedRelicIds);
    platform.playSfx('sfx_relic_equip');
    return true;
  }

  toggleEquipRelic(id) {
    if (!this.relicDefinitions[id]) return { ok: false, reason: 'missing' };
    if (!this.isRelicUnlocked(id)) {
      platform.playSfx('sfx_hurt');
      return { ok: false, reason: 'locked', needStars: this.relicDefinitions[id].unlockStars || 0 };
    }
    const idx = this.equippedRelicIds.indexOf(id);
    if (idx !== -1) {
      this.equippedRelicIds.splice(idx, 1);
      if (storage.setEquippedRelics) storage.setEquippedRelics(this.equippedRelicIds);
      platform.playSfx('sfx_click');
      return { ok: true, equipped: false };
    }
    if (this.equippedRelicIds.length >= this.maxSlots) {
      // 自动替换最早装配的一件圣物，零操作摩擦！
      this.equippedRelicIds.shift();
    }
    this.equippedRelicIds.push(id);
    if (storage.setEquippedRelics) storage.setEquippedRelics(this.equippedRelicIds);
    platform.playSfx('sfx_relic_equip');
    return { ok: true, equipped: true };
  }

  update(dt, scene) {
    // 琥珀王冠：英雄每秒自动回复
    if (this.hasRelic('amber_crown') && scene && scene.hero) {
      if (scene.hero.hp > 0 && scene.hero.hp < scene.hero.maxHp && scene.hero.state !== 'dead') {
        scene.hero.hp = Math.min(scene.hero.maxHp, scene.hero.hp + 12 * dt);
      }
    }

    // 黑曜蛛王甲：自动解救被封印的防御塔并反震周围敌军
    if (this.hasRelic('silk_carapace') && scene && scene.towerManager) {
      const tws = scene.towerManager.towers;
      for (let i = 0; i < tws.length; i++) {
        const t = tws[i];
        if (t.isWebbed) {
          t.webCleanseTimer = (t.webCleanseTimer || 0) + dt;
          if (t.webCleanseTimer >= 2.0) {
            t.isWebbed = false;
            t.webHealth = 0;
            t.webCleanseTimer = 0;
            if (scene.enemyManager) {
              const enemies = scene.enemyManager.getAliveEnemies();
              for (let ei = 0; ei < enemies.length; ei++) {
                const e = enemies[ei];
                if (Math.hypot(e.x - t.x, e.y - t.y) <= 95) {
                  scene.enemyManager.applyDamage(e, 95, false, 'magic', scene.fx, t);
                }
              }
            }
            platform.playSfx('sfx_web_snap', 0.9, 1.2, true, t.x);
            if (scene.fx) {
              scene.fx.spawnDamageText(Math.round(t.x), Math.round(t.y - 18), '黑曜破茧反震!', '#B37FEB');
              scene.fx.spawnRing(t.x, t.y, 70, '#D3ADF7', 0.4);
            }
          }
        } else {
          t.webCleanseTimer = 0;
        }
      }
    }

    // 神木太古深根印：敌军逼近终点仓库 (<= 75px) 触发一次 40% 当前生命根鞭惩罚
    if (this.hasRelic('deep_roots_charm') && scene && scene.map && scene.map.mapData && scene.enemyManager) {
      const wTile = scene.map.mapData.warehouseTile || [19, 12];
      const wx = (wTile[0] + 0.5) * 32;
      const wy = (wTile[1] + 0.5) * 32;
      const enemies = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e._deepRootPunished || e.isTreasure || e.state === 'death') continue;
        if (Math.hypot(e.x - wx, e.y - wy) <= 78) {
          e._deepRootPunished = true;
          const burstDmg = Math.max(40, Math.round(e.hp * 0.40));
          scene.enemyManager.applyDamage(e, burstDmg, true, 'magic', scene.fx, 'reactions');
          e.residualSlowTimer = Math.max(e.residualSlowTimer || 0, 2.2);
          e.residualSlowValue = Math.max(e.residualSlowValue || 0, 0.65);
          if (scene.fx) {
            scene.fx.spawnFloatingText(e.x, e.y - 24, `深根制裁 -${burstDmg}`, '#73D13D', 1.15);
          }
        }
      }
    }
  }

  /**
   * 绘制顶部神器徽章状态栏
   */
  renderHudRelicBadges(ctx, startX, startY) {
    const bSize = 20;
    const gap = 3;

    ctx.save();
    for (let i = 0; i < this.equippedRelicIds.length; i++) {
      const rid = this.equippedRelicIds[i];
      const rDef = this.relicDefinitions[rid];
      if (!rDef) continue;

      const bx = startX + i * (bSize + gap);
      const by = startY;

      // 边框底色
      ctx.fillStyle = 'rgba(15, 20, 16, 0.88)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bSize, bSize, 4) : ctx.rect(bx, by, bSize, bSize);
      ctx.fill();

      // 神器稀有度高光金边
      ctx.strokeStyle = rDef.rarity === 'legendary' ? '#FFD700' : (rDef.rarity === 'epic' ? '#D3ADF7' : '#91D5FF');
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 图标
      const img = platform.getImage(rDef.icon);
      if (img && img.width) {
        ctx.drawImage(img, bx + 2, by + 2, bSize - 4, bSize - 4);
      }
    }
    ctx.restore();
  }
}

module.exports = RelicArsenalSystem;
