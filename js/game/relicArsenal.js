/**
 * Sporeguard - 远古遗物军械库与十二大传奇神器系统 (Ancient Relic Arsenal & Grove Artifacts)
 * 借鉴杀戮尖塔 / 怪物火车 / 铁甲神策的 Roguelite 战术神器构筑
 * 收集 12 件独一无二的苍翠林海远古圣物，触发强大的被动与主动增益
 */

const platform = require('../core/platform');

class RelicArsenalSystem {
  constructor() {
    this.relicDefinitions = {
      chlorophyll_prism: {
        id: 'chlorophyll_prism',
        nameKey: 'relic_prism_name',
        name: '叶绿晶棱镜',
        desc: '所有植物守卫射程提升 25%，并有 18% 几率破空穿透目标',
        icon: 'assets/vfx/relic_clover.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { rangeBonus: 0.25, pierceChance: 0.18 }
      },
      thunder_core: {
        id: 'thunder_core',
        nameKey: 'relic_thunder_name',
        name: '古雷木核晶',
        desc: '天候雷击频率翻倍，雷电击中潮湿敌人时触发超导电弧连锁',
        icon: 'assets/vfx/relic_lightning.png',
        rarity: 'epic',
        isUnlocked: true,
        stats: { thunderCooldownReduction: 0.5 }
      },
      amber_crown: {
        id: 'amber_crown',
        nameKey: 'relic_crown_name',
        name: '琥珀菌王冠',
        desc: '掉落金孢子价值提升 30%，英雄每秒持续自动再生 12 点生命值',
        icon: 'assets/vfx/relic_coin.png',
        rarity: 'legendary',
        isUnlocked: true,
        stats: { sporeBonus: 0.30, heroRegen: 12 }
      },
      clover_providence: {
        id: 'clover_providence',
        nameKey: 'relic_clover_name',
        name: '天命幸运四叶草',
        desc: '所有战塔与英雄攻击获得 22% 暴击率，造成 240% 致命暴击伤害',
        icon: 'assets/vfx/relic_clover.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { critChance: 0.22, critMultiplier: 2.4 }
      },
      silk_carapace: {
        id: 'silk_carapace',
        nameKey: 'relic_carapace_name',
        name: '黑曜蛛王坚甲',
        desc: '防御塔被蛛丝缠绕封印后，2.0秒内自动破茧反噬，反弹剧毒尖刺',
        icon: 'assets/vfx/vfx_web_cocoon.png',
        rarity: 'epic',
        isUnlocked: true,
        stats: { autoCleanseSec: 2.0 }
      },
      solar_vial: {
        id: 'solar_vial',
        nameKey: 'relic_solar_name',
        name: '日光日曜精魄瓶',
        desc: '日曜菇光合充能效果提升 40%，周围两格内防御塔常驻攻速 +30%',
        icon: 'assets/vfx/relic_lumina.png',
        rarity: 'epic',
        isUnlocked: true,
        stats: { auraAtkSpd: 0.30 }
      },
      heroic_standard: {
        id: 'heroic_standard',
        nameKey: 'relic_standard_name',
        name: '孢子近卫荣耀战旗',
        desc: '近卫巡逻军生命上限提升 50%，战阵重聚冷却时间缩短 50%',
        icon: 'assets/vfx/prop_rally_flag.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { guardHpBonus: 0.50, respawnCut: 0.5 }
      },
      deep_roots_charm: {
        id: 'deep_roots_charm',
        nameKey: 'relic_charm_name',
        name: '神木太古深根印',
        desc: '圣树生命种子上限 +3，任何逼近终点的怪物立刻受到 50% 现存血量重创',
        icon: 'assets/vfx/hero_oak.png',
        rarity: 'legendary',
        isUnlocked: true,
        stats: { extraSeeds: 3, breachPunishRatio: 0.50 }
      },
      glacial_tear: {
        id: 'glacial_tear',
        nameKey: 'relic_tear_name',
        name: '玄冰霜华之泪',
        desc: '迷雾孢子在地面凝结 4 秒冻土，敌人移动速度额外削减 40%',
        icon: 'assets/vfx/prop_dew.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { extraSlow: 0.40 }
      },
      volcanic_geode: {
        id: 'volcanic_geode',
        nameKey: 'relic_geode_name',
        name: '熔岩炽火晶核',
        desc: '爆裂重炮命中必定在地面遗留持续燃烧的熔岩火海，造成百分比最大生命灼烧',
        icon: 'assets/vfx/proj_burst_shell.png',
        rarity: 'epic',
        isUnlocked: true,
        stats: { burnRatio: 0.05 }
      },
      heart_of_groves: {
        id: 'heart_of_groves',
        nameKey: 'relic_heart_name',
        name: '苍翠圣林始源之心',
        desc: '全元素反应(烈焰/超导/极寒/爆轰/光合)波及范围扩大 45%，反应伤害提升 50%',
        icon: 'assets/vfx/item_awakening_seed.png',
        rarity: 'legendary',
        isUnlocked: true,
        stats: { reactionDmgBonus: 0.50, reactionAoeBonus: 0.45 }
      },
      windseeker_feather: {
        id: 'windseeker_feather',
        nameKey: 'relic_feather_name',
        name: '追风迅捷之羽',
        desc: '全军弹道飞行速度与英雄移速提升 35%，闪避敌方远程抛射物 25% 几率',
        icon: 'assets/vfx/proj_watch_arrow.png',
        rarity: 'rare',
        isUnlocked: true,
        stats: { speedBonus: 0.35, dodgeChance: 0.25 }
      }
    };

    this.equippedRelicIds = ['chlorophyll_prism', 'amber_crown', 'thunder_core', 'heart_of_groves'];
  }

  hasRelic(id) {
    return this.equippedRelicIds.includes(id);
  }

  getRelic(id) {
    return this.relicDefinitions[id] || null;
  }

  equipRelic(id) {
    if (this.relicDefinitions[id] && !this.equippedRelicIds.includes(id)) {
      this.equippedRelicIds.push(id);
      return true;
    }
    return false;
  }

  update(dt, scene) {
    // 琥珀王冠：英雄每秒自动回复
    if (this.hasRelic('amber_crown') && scene && scene.hero) {
      if (scene.hero.hp > 0 && scene.hero.hp < scene.hero.maxHp) {
        scene.hero.hp = Math.min(scene.hero.maxHp, scene.hero.hp + 12 * dt);
      }
    }

    // 黑曜蛛王甲：自动解救被封印的防御塔
    if (this.hasRelic('silk_carapace') && scene && scene.towerManager) {
      const tws = scene.towerManager.towers;
      for (let i = 0; i < tws.length; i++) {
        const t = tws[i];
        if (t.isWebbed) {
          t.webCleanseTimer = (t.webCleanseTimer || 0) + dt;
          if (t.webCleanseTimer >= 2.0) {
            t.isWebbed = false;
            t.webCleanseTimer = 0;
            if (scene.fx) {
              scene.fx.spawnDamageText(Math.round(t.x), Math.round(t.y - 18), '🛡️ 黑曜破茧反噬!', '#B37FEB');
              scene.fx.spawnRing(t.x, t.y, 70, '#D3ADF7', 0.4);
            }
          }
        } else {
          t.webCleanseTimer = 0;
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
