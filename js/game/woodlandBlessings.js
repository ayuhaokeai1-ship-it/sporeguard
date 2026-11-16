/**
 * 森林圣佑 · 波次里程碑三选一祝福系统 (js/game/woodlandBlessings.js)
 * 在第 3、6（及长关 9、12）波清波瞬间，由远古世界树赐予 3 张战术祝福卡牌抉择，
 * 赋予每次守林战役极具重玩价值与构筑深度（支持触控点击与快捷键 1/2/3 选择）。
 */

const platform = require('../core/platform');
const i18n = require('../i18n');

const BLESSING_CATALOG = [
  {
    id: 'bramble_resonance',
    icon: 'assets/vfx/vfx_spikes.png',
    accent: '#52C41A',
    nameZh: '荆棘穿刺共振',
    nameEn: 'Bramble Resonance',
    tagZh: '穿透 / 易伤',
    tagEn: 'Pierce / Vuln',
    descZh: '瞭望菇与尖刺菇额外 +18% 破甲穿透；受减速敌人承伤 +12%',
    descEn: 'Watch & Thorn gain +18% armor pierce; slowed foes take +12% dmg',
    apply(scene) {
      scene.blessingMods.pierceBonus += 0.18;
      scene.blessingMods.slowVulnBonus += 0.12;
    }
  },
  {
    id: 'dewdrop_echo',
    icon: 'assets/vfx/prop_dew.png',
    accent: '#40A9FF',
    nameZh: '晨露光环回响',
    nameEn: 'Dewdrop Echo',
    tagZh: '经济 / 增幅',
    tagEn: 'Economy / Aura',
    descZh: '丰收神术与掉落孢子收益 +25%；灵光菇邻近塔攻速额外 +10%',
    descEn: '+25% Harvest & drop Spores; Lumina aura grants +10% atk speed',
    apply(scene) {
      scene.blessingMods.sporeGainMult += 0.25;
      scene.blessingMods.luminaAspdBonus += 0.10;
    }
  },
  {
    id: 'pyroclastic_core',
    icon: 'assets/vfx/vfx_explosion.png',
    accent: '#FF7A45',
    nameZh: '炽核连环熔爆',
    nameEn: 'Pyroclastic Core',
    tagZh: '爆裂 / 灼烧',
    tagEn: 'Splash / Burn',
    descZh: '爆裂菇溅射半径 +18%，命中敌人附带 16/s 持续灼烧(3秒)',
    descEn: 'Burst splash +18% & ignites foes for 16 true DPS over 3s',
    apply(scene) {
      scene.blessingMods.burstSplashMult += 0.18;
      if (!scene.pyroFissureCfg) {
        scene.pyroFissureCfg = { radius: 1.05, duration: 3.0, dps: 16 };
      } else {
        scene.pyroFissureCfg.dps = (scene.pyroFissureCfg.dps || 12) + 12;
      }
    }
  },
  {
    id: 'corrosive_haze',
    icon: 'assets/vfx/vfx_mist.png',
    accent: '#B37FEB',
    nameZh: '蚀甲深毒迷雾',
    nameEn: 'Corrosive Haze',
    tagZh: '毒雾 / 削甲',
    tagEn: 'Mist / Shred',
    descZh: '迷雾菇毒雾每秒伤害 +35%，并额外削减敌军 4 点护甲',
    descEn: 'Mist cloud DPS +35% and shreds an extra 4 enemy armor',
    apply(scene) {
      scene.blessingMods.mistDpsMult += 0.35;
      scene.toxicMiasmaDebuff = (scene.toxicMiasmaDebuff || 0) + 1;
    }
  },
  {
    id: 'heartwood_bastion',
    icon: 'assets/vfx/hero_oak.png',
    accent: '#73D13D',
    nameZh: '橡木不屈之心',
    nameEn: 'Heartwood Bastion',
    tagZh: '英雄 / 生命',
    tagEn: 'Hero / Vitality',
    descZh: '立刻恢复 +2 生命种子；树人英雄生命与攻击 +25% 并缓回生命',
    descEn: '+2 Sanctuary Seeds now; Oak Hero +25% Max HP/ATK & regen',
    apply(scene) {
      if (scene.economy) {
        scene.economy.seeds = Math.min(scene.economy.maxSeeds || 20, scene.economy.seeds + 2);
      }
      if (scene.hero) {
        const hpUp = Math.round((scene.hero.maxHp || 360) * 0.25);
        scene.hero.bonusHp = (scene.hero.bonusHp || 0) + hpUp;
        scene.hero.maxHp += hpUp;
        scene.hero.hp = Math.min(scene.hero.maxHp, scene.hero.hp + hpUp);
        scene.hero.baseAtk = Math.round((scene.hero.baseAtk || 25) * 1.25);
        scene.hero.atkDamage = Math.round((scene.hero.atkDamage || 25) * 1.25);
      }
      scene.blessingMods.heroRegenPerSec += 18;
    }
  },
  {
    id: 'galehawk_quiver',
    icon: 'assets/vfx/proj_watch_arrow.png',
    accent: '#FFD666',
    nameZh: '风行鹰眼箭袋',
    nameEn: 'Galehawk Quiver',
    tagZh: '射程 / 攻速',
    tagEn: 'Range / Haste',
    descZh: '全队防御塔攻击间隔缩短 14%，瞭望菇射程额外 +12%',
    descEn: 'All towers attack 14% faster; Watch towers gain +12% range',
    apply(scene) {
      scene.blessingMods.globalAspdBonus += 0.16;
      scene.blessingMods.watchRangeMult += 0.12;
    }
  },
  {
    id: 'leyline_haste',
    icon: 'assets/vfx/relic_lightning.png',
    accent: '#36CFC9',
    nameZh: '古树灵脉极速',
    nameEn: 'Leyline Haste',
    tagZh: '神术 / 冷却',
    tagEn: 'Spells / CDR',
    descZh: '指挥官神术消耗 -15%、冷却缩短 22%，并立刻刷新全神术一半冷却',
    descEn: 'Spells cost -15%, cooldown -22%, and halve current spell CDs',
    apply(scene) {
      scene.spellCdrMultiplier = (scene.spellCdrMultiplier || 1.0) * 0.78;
      if (scene.spells) {
        for (const k in scene.spells) {
          const sp = scene.spells[k];
          if (sp.cost > 0) sp.cost = Math.max(15, Math.round(sp.cost * 0.85));
          if (sp.timer > 0) sp.timer *= 0.5;
        }
      }
    }
  },
  {
    id: 'ancient_sprout',
    icon: 'assets/vfx/item_awakening_seed.png',
    accent: '#FFC53D',
    nameZh: '远古灵种馈赠',
    nameEn: 'Ancient Sprout',
    tagZh: '即时暴富',
    tagEn: 'Instant Boost',
    descZh: '立刻获得 +120 黄金孢子 与 +1 枚灵能觉醒种子（最高 5 枚）',
    descEn: 'Immediately gain +120 Golden Spores and +1 Awakening Seed',
    apply(scene) {
      if (scene.economy) scene.economy.addSpores(120);
      scene.awakeningSeeds = Math.min(5, (scene.awakeningSeeds || 0) + 1);
    }
  },
  {
    id: 'stormwarden_arc',
    icon: 'assets/vfx/prop_thunder_stump.png',
    accent: '#69C0FF',
    nameZh: '圣域天雷守望',
    nameEn: 'Stormwarden Arc',
    tagZh: '波次雷殛',
    tagEn: 'Wave Storm',
    descZh: '每次开波或破丝救援时，对 3 名敌人降下 130 伤麻痹雷链',
    descEn: 'Each wave start or web rescue strikes up to 3 foes for 130 dmg & stun',
    apply(scene) {
      scene.blessingMods.stormOnWave += 1;
    }
  }
];

class WoodlandBlessings {
  constructor() {
    this.reset();
  }

  reset() {
    this.ownedIds = [];
    this.pendingChoices = [];
    this.triggeredWaves = {};
  }

  createDefaultMods() {
    return {
      pierceBonus: 0,
      slowVulnBonus: 0,
      sporeGainMult: 1.0,
      luminaAspdBonus: 0,
      burstSplashMult: 1.0,
      mistDpsMult: 1.0,
      heroRegenPerSec: 0,
      globalAspdBonus: 0,
      watchRangeMult: 1.0,
      stormOnWave: 0
    };
  }

  shouldTriggerForClearedWave(clearedWave) {
    if (this.triggeredWaves[clearedWave]) return false;
    return clearedWave === 3 || clearedWave === 6 || clearedWave === 9 || clearedWave === 12;
  }

  rollChoices(clearedWave) {
    if (!this.shouldTriggerForClearedWave(clearedWave)) return [];
    const pool = BLESSING_CATALOG.filter((b) => this.ownedIds.indexOf(b.id) === -1);
    if (pool.length === 0) return [];
    const copy = pool.slice();
    // Fisher-Yates shuffle
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    this.triggeredWaves[clearedWave] = true;
    this.pendingChoices = copy.slice(0, 3);
    return this.pendingChoices;
  }

  selectChoice(index, scene) {
    if (!this.pendingChoices || this.pendingChoices.length === 0) return null;
    const clampedIdx = Math.max(0, Math.min(this.pendingChoices.length - 1, index || 0));
    const chosen = this.pendingChoices[clampedIdx];
    this.pendingChoices = [];
    if (!chosen) return null;

    if (this.ownedIds.indexOf(chosen.id) === -1) {
      this.ownedIds.push(chosen.id);
    }
    if (scene && typeof chosen.apply === 'function') {
      chosen.apply(scene);
    }
    if (scene && scene.fx) {
      const isZh = i18n.getLang() !== 'en';
      const title = isZh ? chosen.nameZh : chosen.nameEn;
      const desc = isZh ? chosen.descZh : chosen.descEn;
      scene.fx.showBanner(`✨ 林地圣佑 · ${title}`, chosen.accent || '#52C41A', desc, 1.8);
      scene.fx.spawnParticles(480, 260, 24, ['#FFD700', '#73D13D', '#FFE58F', '#FFFFFF'], 45, 130, 0.35, 0.7, 4);
    }
    if (scene && scene.ui) {
      scene.ui.showBlessingModal = false;
    }
    platform.playSfx('sfx_blessing');
    return chosen;
  }

  triggerStormArc(scene, enemyCount = 3, dmg = 130) {
    if (!scene || !scene.blessingMods || scene.blessingMods.stormOnWave <= 0) return 0;
    if (!scene.enemyManager) return 0;
    const alive = scene.enemyManager.getAliveEnemies();
    if (!alive || alive.length === 0) return 0;
    const count = Math.min(enemyCount * scene.blessingMods.stormOnWave, alive.length);
    for (let i = 0; i < count; i++) {
      const e = alive[i];
      scene.enemyManager.applyDamage(e, dmg, true, 'magic', scene.fx, 'reactions');
      if (typeof scene.enemyManager.applyStun === 'function') {
        scene.enemyManager.applyStun(e, 1.2);
      } else {
        e.stunTimer = Math.max(e.stunTimer || 0, 1.2);
      }
      if (scene.fx) {
        scene.fx.spawnFloatingText(e.x, e.y - 20, `⚡ ${dmg}`, '#69C0FF', 1.1);
        scene.fx.spawnParticles(e.x, e.y, 10, ['#69C0FF', '#BAE7FF', '#FFFFFF'], 25, 75, 0.2, 0.45, 3);
      }
    }
    platform.playSfx('sfx_thunder', 0.55, 1.15);
    return count;
  }

  getOwnedDefs() {
    return this.ownedIds
      .map((id) => BLESSING_CATALOG.find((b) => b.id === id))
      .filter(Boolean);
  }
}

module.exports = {
  WoodlandBlessings,
  BLESSING_CATALOG
};
