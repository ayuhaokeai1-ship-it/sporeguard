/**
 * 场景与核心战斗状态机 (js/core/scene.js)
 * 串联标题、选关、备战、战斗、暂停、结算全流程
 * 处理统一输入动作并驱动地图、波次、经济、炮塔、敌人、子弹与特效系统
 */

const CONFIG = require('../data/config');
const { MAPS, MAP_ORDER } = require('../data/maps');
const { TOWERS, TOWER_ORDER } = require('../data/towers');
const { GameMap } = require('../game/map');
const EconomyManager = require('../game/economy');
const EnemyManager = require('../game/enemy');
const SporelingPatrol = require('../game/sporeling');
const SporeDropManager = require('../game/sporeDrop');
const ForestContraptions = require('../game/contraption');
const ForestHero = require('../game/hero');
const WeatherManager = require('../game/weather');
const achievements = require('../game/achievements');
const RelicDropManager = require('../game/relic');
const ElementalReactionSystem = require('../game/elementalReactions');
const HeroSkillSystem = require('../game/heroSkills');
const CombatAnalyticsSystem = require('../game/combatAnalytics');
const RelicArsenalSystem = require('../game/relicArsenal');
const { TacticalTargetingSystem } = require('../game/tacticalTargeting');
const CombatJuiceEngine = require('../game/combatJuice');
const { MushroomMasterySystem } = require('../game/mushroomMastery');
const HeroTranscendence = require('../game/heroTranscendence');
const ElementalComboEngine = require('../game/elementalCombos');
const GuardianSynergies = require('../game/guardianSynergies');
const CombatVfxEngine = require('../game/combatVfxEngine');
const TacticalFeats = require('../game/tacticalFeats');
const { AncientKnowledgeTree } = require('../game/ancientKnowledgeTree');
const { TacticalTargetingAI } = require('../game/tacticalTargetingAI');
const CombatScreenJuice = require('../game/combatScreenJuice');
const BossOverdriveEngine = require('../game/bossOverdriveEngine');
const BulletManager = require('../game/bullet');
const TowerManager = require('../game/tower');
const WaveManager = require('../game/wave');
const FxSystem = require('../fx/fx');
const UiManager = require('../ui/ui');
const input = require('../input/input');
const platform = require('./platform');
const storage = require('../save/storage');
const i18n = require('../i18n/index');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

class SceneController {
  constructor() {
    this.state = 'TITLE'; // 'TITLE' | 'LEVEL_SELECT' | 'BATTLE' | 'PAUSED' | 'SETTLEMENT'
    this.currentMapId = 'map1';
    this.map = new GameMap('map1');
    this.economy = new EconomyManager('map1');
    this.enemyManager = new EnemyManager();
    this.bulletManager = new BulletManager();
    this.towerManager = new TowerManager();
    this.sporelingPatrol = new SporelingPatrol();
    this.sporeDropManager = new SporeDropManager();
    this.shovelActive = false;
    this.flankAlertTimer = 0;
    this.crisisSlowMoTriggered = false;
    this.contraptions = new ForestContraptions();
    this.elderRootTriggered = false;
    this.elderRootActiveTimer = 0;
    this.comboKillCount = 0;
    this.comboKillTimer = 0;
    this.relicManager = new RelicDropManager();
    this.activeRallyTargeting = false;
    this.waveManager = new WaveManager('map1');
    this.fx = new FxSystem();
    this.fx.scene = this;
    this.ui = new UiManager();

    this.speedMultiplier = 1;
    this.hero = new ForestHero(this.map);
    this.awakeningSeeds = 2;
    this.weather = new WeatherManager();
    this.achievements = achievements;
    this.elementalReactions = new ElementalReactionSystem();
    this.heroSkills = new HeroSkillSystem(this.hero);
    this.combatAnalytics = new CombatAnalyticsSystem();
    this.relicArsenal = new RelicArsenalSystem();
    this.combatJuice = new CombatJuiceEngine();
    this.mushroomMastery = new MushroomMasterySystem();
    this.heroTranscendence = new HeroTranscendence(this.hero);
    this.elementalCombos = new ElementalComboEngine();
    this.guardianSynergies = new GuardianSynergies();
    this.combatVfx = new CombatVfxEngine();
    this.tacticalFeats = new TacticalFeats();
    this.ancientKnowledgeTree = new AncientKnowledgeTree();
    this.tacticalTargeting = new TacticalTargetingAI();
    this.combatScreenJuice = new CombatScreenJuice();
    this.bossOverdriveEngine = new BossOverdriveEngine();
    this.ancientKnowledgeTree.applyToCombatScene(this);
    if (this.hero) this.hero.transcendence = this.heroTranscendence;
    this.bulletManager.elementalCombos = this.elementalCombos;
    this.bulletManager.combatVfx = this.combatVfx;
    this.enemyManager.combatVfx = this.combatVfx;
    this.enemyManager.tacticalFeats = this.tacticalFeats;
    this.towerManager.guardianSynergies = this.guardianSynergies;
    if (this.hero) this.hero.transcendence = this.heroTranscendence;
    this.towerManager.scene = this;
    this.towerManager.tacticalTargeting = this.tacticalTargeting;
    this.towerManager.mushroomMastery = this.mushroomMastery;
    this.bulletManager.combatJuice = this.combatJuice;
    this.bulletManager.mushroomMastery = this.mushroomMastery;
    this.bulletManager.elementalCombos = this.elementalCombos;
    this.enemyManager.combatJuice = this.combatJuice;
    this.enemyManager.scene = this;
    this.bulletManager.scene = this;
    this.earlyCallsCount = 0;
    this.activeHeroRally = false;
    this.activeAwakeningTargeting = false; // 1 | 2 | 3
    this.selectedBuildTowerId = 'watch';
    this.selectedTile = { col: 5, row: 3 };
    this.logicalCombatTimeSec = 0;
    this.animTimeSec = 0;

    this.settlementResult = {
      victory: false,
      stars: 0,
      clearTimeSec: 0,
      remainingSeeds: 0
    };

    // 指挥官三大主动战术魔法技能 (Q: 生命甘霖, W: 雷霆震爆, E: 大地丰收)
    this.spells = {
      rain: { id: 'rain', name: '自然甘霖', cost: 45, cd: 25, timer: 0, key: 'Q', radius: 120 },
      shock: { id: 'shock', name: '雷霆震爆', cost: 75, cd: 35, timer: 0, key: 'W', radius: 90 },
      harvest: { id: 'harvest', name: '大地丰收', cost: 0, cd: 50, timer: 0, key: 'E', gain: 120 }
    };
    this.activeSpellCasting = null;
  }

  init() {
    const save = storage.loadSave();
    i18n.setLang(save.settings.lang || 'zh');
    platform.setAudioConfig({
      sfx: save.settings.sfx,
      bgm: save.settings.bgm
    });

    // 注册前后台生命周期：切到后台自动暂停；回到前台保持暂停，不自动继续
    platform.registerLifecycle(
      () => {
        if (this.state === 'BATTLE') {
          this.pauseGame();
        }
      },
      () => {
        // 回到前台保持 PAUSED 状态，不自动恢复
      }
    );

    this.enterTitle();
  }

  enterTitle() {
    this.state = 'TITLE';
    this.speedMultiplier = 1;
    platform.playBgm('bgm_title');
  }

  enterLevelSelect() {
    this.state = 'LEVEL_SELECT';
    this.speedMultiplier = 1;
    platform.playBgm('bgm_title');
  }

  startLevel(mapId) {
    const mData = MAPS[mapId] || MAPS.map1;
    this.currentMapId = mData.id;

    // 异步确保当前地图分包图集已加载
    platform.loadMapSubpackage(mData.subpackage, mData.atlasPath);

    this.map = new GameMap(this.currentMapId);
    this.economy.reset(this.currentMapId);
    this.enemyManager.clear();
    this.bulletManager.clear();
    this.towerManager.clear();
    this.sporelingPatrol.initDefaultRally(this.map);
    this.sporeDropManager.reset();
    this.shovelActive = false;
    this.flankAlertTimer = 0;
    this.crisisSlowMoTriggered = false;
    this.contraptions.initForMap(this.currentMapId);
    this.elderRootTriggered = false;
    this.elderRootActiveTimer = 0;
    this.comboKillCount = 0;
    this.comboKillTimer = 0;
    this.relicManager.reset();
    this.activeRallyTargeting = false;
    this.waveManager.reset(this.currentMapId);
    this.fx.resetBattleState();

    this.speedMultiplier = 1;
    this.hero = new ForestHero(this.map);
    this.awakeningSeeds = 2;
    this.weather = new WeatherManager();
    this.achievements = achievements;
    this.elementalReactions = new ElementalReactionSystem();
    this.heroSkills = new HeroSkillSystem(this.hero);
    this.combatAnalytics = new CombatAnalyticsSystem();
    this.relicArsenal = new RelicArsenalSystem();
    this.tacticalTargeting = new TacticalTargetingAI();
    this.combatJuice = new CombatJuiceEngine();
    this.mushroomMastery = new MushroomMasterySystem();
    this.heroTranscendence = new HeroTranscendence(this.hero);
    this.elementalCombos = new ElementalComboEngine();
    this.guardianSynergies = new GuardianSynergies();
    this.combatVfx = new CombatVfxEngine();
    this.tacticalFeats = new TacticalFeats();
    if (this.hero) this.hero.transcendence = this.heroTranscendence;
    this.bulletManager.elementalCombos = this.elementalCombos;
    this.bulletManager.combatVfx = this.combatVfx;
    this.enemyManager.combatVfx = this.combatVfx;
    this.enemyManager.tacticalFeats = this.tacticalFeats;
    this.towerManager.guardianSynergies = this.guardianSynergies;
    this.towerManager.scene = this;
    this.towerManager.tacticalTargeting = this.tacticalTargeting;
    this.towerManager.mushroomMastery = this.mushroomMastery;
    this.bulletManager.combatJuice = this.combatJuice;
    this.bulletManager.mushroomMastery = this.mushroomMastery;
    this.enemyManager.combatJuice = this.combatJuice;
    this.enemyManager.scene = this;
    this.bulletManager.scene = this;
    if (this.ancientKnowledgeTree) this.ancientKnowledgeTree.applyToCombatScene(this);
    if (this.bossOverdriveEngine) this.bossOverdriveEngine.reset();
    if (this.combatScreenJuice) this.combatScreenJuice.reset();
    this.earlyCallsCount = 0;
    this.activeHeroRally = false;
    this.activeAwakeningTargeting = false;
    this.selectedBuildTowerId = 'watch';
    for (let k in this.spells) {
      this.spells[k].timer = 0;
    }
    this.activeSpellCasting = null;
    this.selectedBuildTowerId = null;
    this.selectedTile = { col: -1, row: -1 };
    this.ui.inspectorOpen = false;
    input.setGridCursor(this.selectedTile.col, this.selectedTile.row, false);

    this.logicalCombatTimeSec = 0;
    this.state = 'BATTLE';

    // 首次进入关卡不阻断玩家，弹出轻量化横幅指引，保证零阻塞极致丝滑
    const save = storage.getSave();
    if (!save.guideSeen) {
      storage.markGuideSeen();
      this.fx.showBanner('欢迎来到守林前线', '#BAE7FF', '轻触顶部木槽卡牌，再点击草地即可种植防御塔；右上角「菜单」随时查看图鉴秘典。', 3.8);
    }

    platform.playBgm('bgm_battle');
  }

  /**
   * 开启无尽深渊试炼模式
   */
  startEndlessMode() {
    this.isEndlessMode = true;
    this.state = 'BATTLE';
    if (this.waveManager) {
      this.waveManager.startEndlessMode(this.economy, this.fx);
    }
    this.fx.showBanner('🔥 无尽深渊降临！', '#FF4D4F', '无穷无尽的暗黑虫潮正从四面八方涌来，坚持越久奖励越丰厚！', 2.5);
    this.fx.triggerScreenShake(4.5, 0.4);
    platform.playSfx('sfx_horn');
    platform.playBgm('boss_map3');
  }

  restartLevel() {
    this.startLevel(this.currentMapId);
  }

  hasNextMap() {
    const idx = MAP_ORDER.indexOf(this.currentMapId);
    return idx >= 0 && idx < MAP_ORDER.length - 1;
  }

  startNextMap() {
    const idx = MAP_ORDER.indexOf(this.currentMapId);
    if (idx >= 0 && idx < MAP_ORDER.length - 1) {
      this.startLevel(MAP_ORDER[idx + 1]);
    } else {
      this.enterLevelSelect();
    }
  }

  pauseGame() {
    if (this.state === 'BATTLE') {
      this.state = 'PAUSED';
    }
  }

  resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'BATTLE';
    }
  }

  cycleSpeed() {
    const list = CONFIG.TIMING.SPEED_MULTIPLIERS;
    const idx = list.indexOf(this.speedMultiplier);
    this.speedMultiplier = list[(idx + 1) % list.length];
    platform.playSfx('sfx_click');
  }

  selectBuildTowerType(towerId) {
    if (TOWERS[towerId]) {
      this.selectedBuildTowerId = towerId;
    }
  }

  callWaveEarly() {
    if (this.state !== 'BATTLE') return;
    this.waveManager.callNextWaveEarly(this.economy, this.fx);
  }

  tryBuildOnSelectedTile() {
    if (this.state !== 'BATTLE') return false;
    const { col, row } = this.selectedTile;
    if (!this.map.canBuildAt(col, row)) {
      this.ui.showToast(i18n.t('place_hint_invalid'));
      return false;
    }
    const def = TOWERS[this.selectedBuildTowerId];
    if (!def) return false;
    if (!this.economy.canAfford(def.nodes.base.cost)) {
      this.ui.showToast(i18n.t('no_spores_hint'));
      return false;
    }
    const built = this.towerManager.buildTower(this.selectedBuildTowerId, col, row, this.map, this.economy, this.fx);
    if (built) {
      if (this.ui.notifyTowerBuilt) {
        this.ui.notifyTowerBuilt(this.selectedBuildTowerId);
      }
      this.selectedBuildTowerId = null;
      this.selectedTile = { col: -1, row: -1 };
      this.ui.inspectorOpen = false;
    }
    return Boolean(built);
  }

  tryUpgradeSelectedTower(targetNodeId) {
    if (this.state !== 'BATTLE') return false;
    const tower = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
    if (!tower) return false;

    const upgrades = this.towerManager.getAvailableUpgrades(tower);
    if (upgrades.length === 0) return false;

    let chosen = null;
    if (targetNodeId === 'A' || targetNodeId === 'B') {
      if (upgrades.length === 1) {
        chosen = upgrades[0];
      } else {
        chosen = upgrades.find((u) => u.branch === targetNodeId) || upgrades[0];
      }
    } else {
      chosen = upgrades.find((u) => u.nodeId === targetNodeId) || upgrades[0];
    }

    if (!chosen) return false;
    if (!this.economy.canAfford(chosen.cost)) {
      this.ui.showToast(i18n.t('no_spores_hint'));
      return false;
    }

    return this.towerManager.upgradeTower(tower, chosen.nodeId, this.economy, this.fx);
  }

  toggleShovel() {
    this.shovelActive = !this.shovelActive;
    if (this.shovelActive) {
      this.ui.showToast('铲子模式已激活：点击任意蘑菇即可移植回收！');
      platform.playSfx('sfx_click');
    } else {
      this.ui.showToast('已取消铲子模式');
    }
  }

  shovelTower(tower) {
    if (!tower) return;
    const tile = this.map.getTile(tower.col, tower.row);
    if (tile) {
      tile.tower = null;
    }
    const idx = this.towerManager.towers.indexOf(tower);
    if (idx !== -1) {
      this.towerManager.towers.splice(idx, 1);
    }
    const refund = Math.floor((tower.totalInvested || 75) * 0.85);
    this.economy.addSpores(refund);
    this.ui.inspectorOpen = false;
    this.selectedTile = { col: -1, row: -1 };
    this.shovelActive = false;

    this.fx.spawnFloatingText(tower.x, tower.y - 20, 移植回收 + 孢子, '#FFE58F', 1.3);
    this.fx.spawnParticles(tower.x, tower.y, 18, ['#8C6842', '#D48806', '#52C41A', '#FFFDF5'], 25, 45);
    platform.playSfx('sfx_sell');
  }

  triggerFlankAlert() {
    this.flankAlertTimer = 4.0;
    platform.playSfx('sfx_horn');
  }

  sellSelectedTower() {
    if (this.state !== 'BATTLE') return 0;
    const tower = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
    if (!tower) return 0;
    return this.towerManager.sellTower(tower, this.map, this.economy, this.fx);
  }

  onVictory() {
    if (this.state === 'SETTLEMENT') return;
    this.state = 'SETTLEMENT';
    this.shovelActive = false;
    this.activeAwakeningTargeting = false;
    this.selectedBuildTowerId = null;
    if (this.ui) this.ui.inspectorOpen = false;
    if (this.bulletManager) {
      if (this.bulletManager.hazardPool) this.bulletManager.hazardPool.clear();
      if (this.bulletManager.bulletPool) this.bulletManager.bulletPool.clear();
    }
    if (this.enemyManager && this.enemyManager.flyingWebs) {
      this.enemyManager.flyingWebs.length = 0;
    }
    if (this.bulletManager) {
      if (this.bulletManager.hazardPool) this.bulletManager.hazardPool.clear();
      if (this.bulletManager.bulletPool) this.bulletManager.bulletPool.clear();
    }
    if (this.enemyManager && this.enemyManager.flyingWebs) {
      this.enemyManager.flyingWebs.length = 0;
    }
    if (this.bulletManager) {
      if (this.bulletManager.hazardPool) this.bulletManager.hazardPool.clear();
      if (this.bulletManager.bulletPool) this.bulletManager.bulletPool.clear();
    }
    if (this.enemyManager && this.enemyManager.flyingWebs) {
      this.enemyManager.flyingWebs.length = 0;
    }
    const stars = this.economy.calculateStars();
    this.settlementResult = {
      victory: true,
      stars,
      clearTimeSec: this.logicalCombatTimeSec,
      remainingSeeds: this.economy.seeds
    };
    storage.recordMapVictory(this.currentMapId, stars, this.logicalCombatTimeSec, this.economy.seeds);
    platform.playSfx('sfx_win');
    if (this.achievements) {
      if (this.economy.seeds >= 20) this.achievements.unlock('flawless_defense', this.fx);
      if (this.economy.seeds === 1) this.achievements.unlock('last_stand', this.fx);
      if (this.currentMapId === 'map1') this.achievements.unlock('spider_regicide', this.fx);
      if (this.weather && this.weather.currentWeather === 'blood_moon') this.achievements.unlock('weather_survivor', this.fx);
    }
  }

  onDefeat() {
    if (this.state === 'SETTLEMENT') return;
    this.state = 'SETTLEMENT';
    this.shovelActive = false;
    this.activeAwakeningTargeting = false;
    this.selectedBuildTowerId = null;
    if (this.ui) this.ui.inspectorOpen = false;
    if (this.bulletManager) {
      if (this.bulletManager.hazardPool) this.bulletManager.hazardPool.clear();
      if (this.bulletManager.bulletPool) this.bulletManager.bulletPool.clear();
    }
    if (this.enemyManager && this.enemyManager.flyingWebs) {
      this.enemyManager.flyingWebs.length = 0;
    }
    if (this.bulletManager) {
      if (this.bulletManager.hazardPool) this.bulletManager.hazardPool.clear();
      if (this.bulletManager.bulletPool) this.bulletManager.bulletPool.clear();
    }
    if (this.enemyManager && this.enemyManager.flyingWebs) {
      this.enemyManager.flyingWebs.length = 0;
    }
    if (this.bulletManager) {
      if (this.bulletManager.hazardPool) this.bulletManager.hazardPool.clear();
      if (this.bulletManager.bulletPool) this.bulletManager.bulletPool.clear();
    }
    if (this.enemyManager && this.enemyManager.flyingWebs) {
      this.enemyManager.flyingWebs.length = 0;
    }
    this.settlementResult = {
      victory: false,
      stars: 0,
      clearTimeSec: this.logicalCombatTimeSec,
      remainingSeeds: 0
    };
    platform.playSfx('sfx_lose');
  }

  /**
   * 消费统一输入动作队列
   */
  triggerSpell(spellId) {
    if (this.state !== 'BATTLE') return;
    const sp = this.spells[spellId];
    if (!sp) return;
    if (sp.timer > 0) {
      this.ui.showToast(`技能冷却中: ${Math.ceil(sp.timer)}s`);
      return;
    }
    if (sp.cost > 0 && !this.economy.canAfford(sp.cost)) {
      this.ui.showToast('孢子不足，无法施法！');
      return;
    }
    if (spellId === 'rally') {
      this.activeRallyTargeting = !this.activeRallyTargeting;
      if (this.activeRallyTargeting) {
        this.activeSpellCasting = null;
        this.activeHeroRally = false;
        platform.playSfx('sfx_click');
        this.fx.spawnFloatingText(480, 240, '请在巡逻道路上点击设防集合点!', '#95DE64', 1.5);
      }
      return;
    }
    if (spellId === 'harvest') {
      sp.timer = sp.cd;
      this.economy.spores += sp.gain;
      this.fx.showBanner('大地丰收！+120 黄金孢子', '#FFE58F', '全场真菌共鸣喷涌', 1.5);
      this.fx.spawnParticles(480, 270, 28, ['#FFE58F', '#FFA940', '#FFFFFF'], 60, 180, 0.4, 0.8, 5);
      platform.playSfx('sfx_win');
      return;
    }
    if (this.activeSpellCasting === spellId) {
      this.activeSpellCasting = null;
    } else {
      this.activeSpellCasting = spellId;
      platform.playSfx('sfx_click');
    }
  }

  castActiveSpell(lx, ly) {
    if (!this.activeSpellCasting) return false;
    const spellId = this.activeSpellCasting;
    const sp = this.spells[spellId];
    if (!sp || sp.timer > 0) {
      this.activeSpellCasting = null;
      return false;
    }
    if (sp.cost > 0 && !this.economy.spendSpores(sp.cost)) {
      this.ui.showToast('孢子不足！');
      this.activeSpellCasting = null;
      return false;
    }

    sp.timer = sp.cd;
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const mx = (lx - mv.OFFSET_X) / mv.SCALE;
    const my = (ly - mv.OFFSET_Y) / mv.SCALE;

    if (spellId === 'rain') {
      let affected = 0;
      for (let i = 0; i < this.towerManager.towers.length; i++) {
        const t = this.towerManager.towers[i];
        if (Math.hypot(t.x - mx, t.y - my) <= sp.radius) {
          this.towerManager.healTower(t, 999, true, this.fx);
          affected++;
        }
      }
      this.fx.spawnRing(mx, my, sp.radius, '#52C41A', 0.55, true);
      this.fx.spawnParticles(mx, my, 28, ['#52C41A', '#B7EB8F', '#95DE64'], 40, 140, 0.35, 0.7, 4);
      this.fx.showBanner('生命甘霖！防线狂暴', '#52C41A', `滋养 ${affected} 座防御塔，攻速翻倍6秒`, 1.5);
      platform.playSfx('sfx_upgrade');
    } else if (spellId === 'shock') {
      let enemiesHit = 0;
      const alive = this.enemyManager.getAliveEnemies();
      for (let i = 0; i < alive.length; i++) {
        const e = alive[i];
        if (Math.hypot(e.x - mx, e.y - my) <= sp.radius) {
          e.hp -= 180;
          e.residualSlowTimer = 3.0;
          e.residualSlowValue = 0.95;
          enemiesHit++;
          if (e.hp <= 0) {
            this.enemyManager.handleEnemyDeath(e, 180, this.logicalCombatTimeSec, this.map, this.economy, this.fx);
          }
        }
      }
      this.fx.triggerShake(8, 350);
      this.fx.spawnRing(mx, my, sp.radius, '#FFE58F', 0.45, false);
      this.fx.spawnParticles(mx, my, 32, ['#FFE58F', '#73D13D', '#FFFFFF', '#40A9FF'], 60, 200, 0.3, 0.65, 5);
      this.fx.showBanner('雷霆震爆！群怪麻痹', '#FFE58F', `轰击 ${enemiesHit} 名敌人，定身3秒`, 1.5);
      platform.playSfx('sfx_boom');
    }

    this.activeSpellCasting = null;
    return true;
  }

  processInputActions() {
    const actions = input.consumeActions();
    for (let i = 0; i < actions.length; i++) {
      try {
        const act = actions[i];

      if (act.type === 'pointer_move') {
        this.ui.handlePointerMove(act.x, act.y, this);
      } else if (act.type === 'pointer_down') {
        if (this.activeSpellCasting) {
          this.castActiveSpell(act.x, act.y);
          continue;
        }

        // 0.5 如果处于菇精卫集结防线布防模式，点击道路任意点设定集结旗帜
        if (this.activeRallyTargeting && this.sporelingPatrol) {
          const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
          const mx = (act.x - mv.OFFSET_X) / mv.SCALE;
          const my = (act.y - mv.OFFSET_Y) / mv.SCALE;
          const col = Math.floor(mx / TILE_SIZE);
          const row = Math.floor(my / TILE_SIZE);
          if (this.map.inBounds(col, row) && this.map.isPath(col, row)) {
            this.sporelingPatrol.setRallyPoint(col, row, this.map, this.fx, false);
            platform.playSfx('sfx_place');
            this.activeRallyTargeting = false;
            continue;
          } else {
            this.fx.spawnFloatingText(act.x, act.y - 14, '只能在行进道路上设防集结!', '#FF7875', 1.0);
            this.activeRallyTargeting = false;
            continue;
          }
        }
        // 1. 如果处于灵能觉醒目标指定模式，点击防御塔直接超频觉醒
        if (this.activeAwakeningTargeting) {
          const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
          const mx = (act.x - mv.OFFSET_X) / mv.SCALE;
          const my = (act.y - mv.OFFSET_Y) / mv.SCALE;
          const col = Math.floor(mx / TILE_SIZE);
          const row = Math.floor(my / TILE_SIZE);
          const tw = this.towerManager.getTowerAt(col, row);
          if (tw && this.awakeningSeeds > 0) {
            this.awakeningSeeds -= 1;
            this.towerManager.triggerAwakening(tw, this, this.fx, this.economy);
            this.activeAwakeningTargeting = false;
            continue;
          } else {
            this.activeAwakeningTargeting = false;
          }
        }

        // 2. 如果处于英雄集结驻守指派模式，点击战场任意坐标命令英雄移动
        if (this.activeHeroRally && this.hero) {
          const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
          const mx = (act.x - mv.OFFSET_X) / mv.SCALE;
          const my = (act.y - mv.OFFSET_Y) / mv.SCALE;
          this.hero.moveTo(mx, my, this.fx);
          this.hero.isSelected = false;
          this.activeHeroRally = false;
          continue;
        }

        // 先交给 UI 按钮与拖拽系统处理；若未命中 UI，则转换为全屏战场网格坐标
        const consumedByUi = this.ui.handlePointerDown(act.x, act.y, this);
        if (!consumedByUi && this.state === 'BATTLE') {
          const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
          const mx = (act.x - mv.OFFSET_X) / mv.SCALE;
          const my = (act.y - mv.OFFSET_Y) / mv.SCALE;

          // 战场晨露金孢、精英战利品与森林自然机关拾取
          if (this.sporeDropManager && this.sporeDropManager.handlePointerDown(mx, my, this.economy, this.fx)) {
            continue;
          }
          if (this.relicManager && this.relicManager.checkClick(mx, my, this)) {
            continue;
          }
          if (this.contraptions && this.contraptions.handlePointerDown(mx, my, this)) {
            continue;
          }
          if (mx >= 0 && mx < CONFIG.LAYOUT.MAP.WIDTH && my >= 0 && my < CONFIG.LAYOUT.MAP.HEIGHT) {
            const col = Math.floor(mx / TILE_SIZE);
            const row = Math.floor(my / TILE_SIZE);
            if (this.map.inBounds(col, row)) {
              // 检查是否点击在英雄身上：选中英雄并进入移动集结模式
              if (this.hero && Math.hypot(mx - this.hero.x, my - this.hero.y) <= 28) {
                this.hero.isSelected = true;
                this.activeHeroRally = true;
                platform.playSfx('sfx_click');
                if (this.fx) this.fx.spawnFloatingText(this.hero.x, this.hero.y - 28, '听候指挥!', '#FFE58F', 1.0);
                continue;
              }

              // 检查是否点中被蛛网封印的防御塔（进行三连击破茧解救微操）
              const existingTower = this.towerManager.getTowerAt(col, row);
              if (existingTower && existingTower.isWebbed) {
                this.towerManager.rescueWeb(existingTower, this.fx);
                continue;
              }

              let targetCol = col;
              let targetRow = row;
              // 手机端智能微距吸附：如果在草地边缘差了几个像素，自动吸附到最近的有效建造格
              if (!existingTower && !this.map.canBuildAt(targetCol, targetRow) && this.selectedBuildTowerId) {
                const subX = (mx / TILE_SIZE) - col;
                const subY = (my / TILE_SIZE) - row;
                const offsets = [];
                if (subX < 0.35) offsets.push([-1, 0]);
                if (subX > 0.65) offsets.push([1, 0]);
                if (subY < 0.35) offsets.push([0, -1]);
                if (subY > 0.65) offsets.push([0, 1]);
                for (const [ox, oy] of offsets) {
                  if (this.map.inBounds(col + ox, row + oy) && this.map.canBuildAt(col + ox, row + oy)) {
                    targetCol = col + ox;
                    targetRow = row + oy;
                    break;
                  }
                }
              }

              const canBuild = this.map.canBuildAt(targetCol, targetRow);
              if (existingTower) {
                // 点击已种植的我方守卫：展开其专属地面轻柔范围法阵与升级面板
                this.selectedTile.col = targetCol;
                this.selectedTile.row = targetRow;
                this.selectedTileAgeSec = 0;
                this.selectedBuildTowerId = null; // 切换至检视模式，取消待建造卡牌
                this.ui.inspectorOpen = true;
                input.setGridCursor(col, row, false);
                platform.playSfx('sfx_click');
              } else if (canBuild) {
                if (this.selectedBuildTowerId) {
                  this.selectedTile.col = targetCol;
                  this.selectedTile.row = targetRow;
                  this.selectedTileAgeSec = 0;
                  input.setGridCursor(col, row, false);
                  const built = this.tryBuildOnSelectedTile();
                  if (built) {
                    this.ui.inspectorOpen = false;
                  }
                } else {
                  // 手中未选中建造卡牌时，点击战场空草地使所有面板与范围自动褪去（轻度UI，零视觉遮挡）
                  this.selectedTile.col = -1;
                  this.selectedTile.row = -1;
                  this.ui.inspectorOpen = false;
                  this.ui.showTowerDetailBoard = false;
                }
              } else {
                // 点击道路、障碍物或空白无效区域：收起范围展示与面板，战场自然褪去
                this.ui.inspectorOpen = false;
                this.ui.showTowerDetailBoard = false;
                this.selectedTile.col = -1;
                this.selectedTile.row = -1;
                this.selectedBuildTowerId = null;
              }
            }
          } else {
            this.ui.inspectorOpen = false;
            this.ui.showTowerDetailBoard = false;
            this.selectedTile.col = -1;
            this.selectedTile.row = -1;
            this.selectedBuildTowerId = null;
          }
        }
      } else if (act.type === 'pointer_up') {
        this.ui.handlePointerUp(act.x, act.y, this);
      } else if (act.type === 'cursor_move') {
        if (this.state === 'BATTLE') {
          this.selectedTile.col = act.col;
          this.selectedTile.row = act.row;
        }
      } else if (act.type === 'select_tower_slot') {
        const tId = TOWER_ORDER[act.slot];
        if (tId) {
          this.selectBuildTowerType(tId);
          platform.playSfx('sfx_click');
        }
      } else if (act.type === 'cycle_tower_slot') {
        const curIdx = TOWER_ORDER.indexOf(this.selectedBuildTowerId);
        const nextIdx = (curIdx + act.dir + TOWER_ORDER.length) % TOWER_ORDER.length;
        this.selectBuildTowerType(TOWER_ORDER[nextIdx]);
        platform.playSfx('sfx_click');
      } else if (act.type === 'confirm_tile') {
        if (this.ui.showGuideModal || this.ui.showSettingsModal) {
          this.ui.showGuideModal = false;
          this.ui.showSettingsModal = false;
          storage.markGuideSeen();
        } else if (this.state === 'TITLE') {
          this.enterLevelSelect();
        } else if (this.state === 'LEVEL_SELECT') {
          this.startLevel(this.currentMapId || 'map1');
        } else if (this.state === 'BATTLE') {
          const existing = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
          if (!existing) {
            this.tryBuildOnSelectedTile();
          } else {
            this.tryUpgradeSelectedTower('A');
          }
        }
      } else if (act.type === 'upgrade_branch') {
        if (this.state === 'BATTLE') {
          this.tryUpgradeSelectedTower(act.branch);
        }
      } else if (act.type === 'sell_selected') {
        if (this.state === 'BATTLE') {
          this.sellSelectedTower();
        } else if (this.state === 'LEVEL_SELECT') {
          this.enterTitle();
        }
      } else if (act.type === 'cycle_priority') {
        if (this.state === 'BATTLE') {
          const tower = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
          if (tower) {
            const prio = this.towerManager.cyclePriority(tower);
            if (prio && this.fx) {
              this.fx.spawnFloatingText(tower.x, tower.y - 26, '索敌：' + i18n.t('prio_' + prio), '#FFE58F', 1.0);
            }
          }
        }
      } else if (act.type === 'call_wave') {
        this.callWaveEarly();
      } else if (act.type === 'trigger_spell') {
        if (this.state === 'BATTLE') {
          this.triggerSpell(act.spellId);
        }
      } else if (act.type === 'cycle_hero_stance') {
        if (this.state === 'BATTLE' && this.hero) {
          this.hero.cycleStance(this.fx);
          if (this.hero.stanceSwitchedCount >= 3) {
            this.achievements.unlock('tactical_stances', this.fx);
          }
        }
      } else if (act.type === 'hero_ultimate') {
        if (this.state === 'BATTLE' && this.hero) {
          const cast = this.hero.castUltimateSkill(this.enemyManager, this.fx);
          if (cast) {
            platform.playSfx('sfx_shock');
          }
        }
      } else if (act.type === 'hero_battlecry') {
        if (this.state === 'BATTLE' && this.heroTranscendence) {
          this.heroTranscendence.castBattlecry(this.sporelingPatrol, this.fx);
        }
      } else if (act.type === 'hero_leyline') {
        if (this.state === 'BATTLE' && this.heroTranscendence) {
          this.heroTranscendence.castLeylineSurge(this.towerManager, this.fx);
        }
      } else if (act.type === 'toggle_awakening') {
        if (this.state === 'BATTLE') {
          if (this.awakeningSeeds > 0) {
            this.activeAwakeningTargeting = !this.activeAwakeningTargeting;
            platform.playSfx('sfx_click');
            if (this.activeAwakeningTargeting) {
              this.fx.spawnFloatingText(480, 240, '请点击场上的蘑菇触发灵能觉醒超载!', '#722ED1', 1.5);
            }
          } else {
            this.fx.spawnFloatingText(480, 240, '灵能觉醒种子不足(击败精英敌人获取)!', '#FF4D4F', 1.2);
          }
        }
      } else if (act.type === 'cycle_speed') {
        if (this.state === 'BATTLE') {
          this.cycleSpeed();
        }
      } else if (act.type === 'toggle_zen_mode') {
        if (this.state === 'BATTLE') {
          this.ui.toggleZenMode(this.fx);
        }
      } else if (act.type === 'toggle_mastery') {
        if (this.mushroomMastery) {
          this.mushroomMastery.togglePanel();
        }
      } else if (act.type === 'toggle_pause') {
        if (this.ui.showSettingsModal || this.ui.showGuideModal) {
          this.ui.showSettingsModal = false;
          this.ui.showGuideModal = false;
        } else if (this.state === 'BATTLE') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }
      } catch (actionErr) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('[Action Processing Safe-Catch]:', actionErr);
        }
      }
    }
  }

  /**
   * 固定逻辑步更新 (dt = 1/60s)
   * 5.6 1×/2×/3× 速度下每个逻辑步都执行碰撞检测
   * 5.7 顿帧期间游戏逻辑暂停，不计入关卡用时
   */
  fixedStep(dt) {
    if (this.state !== 'BATTLE') return;
    if (this.ui.showGuideModal || this.ui.showSettingsModal) return;

    this.logicalCombatTimeSec += dt;

    // 技能冷却推进
    for (let k in this.spells) {
      if (this.spells[k].timer > 0) {
        this.spells[k].timer = Math.max(0, this.spells[k].timer - dt);
      }
    }

    // 1. 波次与备战倒计时更新
    this.waveManager.update(
      dt,
      this.map,
      this.enemyManager,
      this.economy,
      this.fx,
      () => {
        this.onVictory();
      },
      this
    );

    // 1.5 战利品与菇精卫小队更新
    this.relicManager.update(dt, this);
    // 最后一波胜利彻底杜绝卡顿结算保底防护
    if (this.state === 'BATTLE' && this.waveManager) {
      if (this.waveManager.currentWaveIndex >= this.waveManager.totalWaves && this.waveManager.phase !== 'prep') {
        const alive = this.enemyManager.getAliveEnemies();
        const activeCount = this.enemyManager.getActiveWaveEnemyCount();
        let allGroupsDone = true;
        for (let i = 0; i < this.waveManager.activeGroups.length; i++) {
          const g = this.waveManager.activeGroups[i];
          if (g.type && typeof g.count === 'number' && g.spawned < g.count) {
            allGroupsDone = false;
            break;
          }
        }
        if (allGroupsDone && alive.length === 0 && activeCount === 0) {
          this.onVictory();
        }
      }
    }
    this.contraptions.update(dt, this);
    if (this.weather) {
      this.weather.update(dt, this);
    }
    if (this.elementalReactions) {
      this.elementalReactions.update(dt, this);
    }
    if (this.heroSkills) {
      this.heroSkills.update(dt, this);
    }
    if (this.heroTranscendence) {
      this.heroTranscendence.update(dt, this.enemyManager, this.sporelingPatrol, this.towerManager, this.fx);
    }
    if (this.elementalCombos) {
      this.elementalCombos.update(dt, this.enemyManager, this.fx);
    }
    if (this.guardianSynergies) {
      this.guardianSynergies.update(dt, this);
    }
    if (this.combatVfx) {
      this.combatVfx.update(dt);
    }
    if (this.tacticalFeats) {
      this.tacticalFeats.update(dt, this);
    }
    if (this.combatAnalytics) {
      this.combatAnalytics.update(dt);
    }
    if (this.relicArsenal) {
      this.relicArsenal.update(dt, this);
    }
    if (this.achievements) {
      this.achievements.update(dt, this.fx);
    }
    if (this.ancientKnowledgeTree) this.ancientKnowledgeTree.update(dt, this);
    if (this.tacticalTargeting) this.tacticalTargeting.update(dt);
    if (this.combatScreenJuice) this.combatScreenJuice.update(dt, this.state === 'BATTLE');
    if (this.bossOverdriveEngine) this.bossOverdriveEngine.update(dt, this);
    if (this.elderRootActiveTimer > 0) {
      this.elderRootActiveTimer = Math.max(0, this.elderRootActiveTimer - dt);
    }
    if (this.comboKillTimer > 0) {
      this.comboKillTimer = Math.max(0, this.comboKillTimer - dt);
      if (this.comboKillTimer <= 0) {
        this.comboKillCount = 0;
      }
    }

    // 仓库最后一道防线：圣树古根逆袭 (Elder Root Slam)
    if (!this.elderRootTriggered && this.map && this.map.mapData) {
      const wTile = this.map.mapData.warehouseTile || [19, 12];
      const wx = (wTile[0] + 0.5) * TILE_SIZE;
      const wy = (wTile[1] + 0.5) * TILE_SIZE;
      const alive = this.enemyManager.getAliveEnemies();
      for (let i = 0; i < alive.length; i++) {
        const em = alive[i];
        if (em.isFlying || em.state === 'death') continue;
        if (Math.hypot(em.x - wx, em.y - wy) <= 72) {
          // 触发最后绝境逆袭！
          this.elderRootTriggered = true;
          this.elderRootActiveTimer = 4.5;
          this.fx.triggerScreenShake(6.0, 0.55);
          this.fx.showBanner(i18n.t('banner_elder_roots'), '#52C41A', '绝境逆转', 2.0);
          this.fx.spawnParticles(wx, wy, 35, ['#5C4028', '#389E0D', '#8C6842', '#D4B106'], 60, 150, 0.4, 0.8, 5);
          platform.playSfx('sfx_bomb');

          // 将逼近的敌人全部往回击退 130px 并缠绕定身 4.5 秒
          for (let j = 0; j < alive.length; j++) {
            const tgt = alive[j];
            if (tgt.isFlying || tgt.state === 'death') continue;
            if (Math.hypot(tgt.x - wx, tgt.y - wy) <= 140) {
              tgt.distPx = Math.max(0, tgt.distPx - 130);
              tgt.residualSlowTimer = 4.5;
              tgt.residualSlowValue = 1.0; // 彻底扎根定身
              this.fx.spawnParticles(tgt.x, tgt.y, 8, ['#5C4028', '#52C41A'], 20, 50, 0.2, 0.4, 3);
            }
          }
          break;
        }
      }
    }
    if (this.hero) {
      this.hero.update(dt, this.enemyManager, this.fx);
    }
    this.sporelingPatrol.update(dt, this.enemyManager, this.fx);

    // 2. 炮塔索敌与开火
    this.towerManager.update(dt, this.map, this.enemyManager, this.bulletManager, this.economy, this.fx, this.sporelingPatrol);
    this.sporeDropManager.update(dt, this.map, this.economy, this.fx, this);
    // 绝境缓时救急机制：当敌人逼近生命核心 (<= 68px) 或守护种子 <= 4 时触发一次电影级子弹时间
    if (!this.crisisSlowMoTriggered && this.map && this.map.mapData) {
      const wTile = this.map.mapData.warehouseTile || [19, 12];
      const wx = (wTile[0] + 0.5) * TILE_SIZE;
      const wy = (wTile[1] + 0.5) * TILE_SIZE;
      const alive = this.enemyManager.getAliveEnemies();
      let danger = false;
      for (let i = 0; i < alive.length; i++) {
        const em = alive[i];
        if (em.state !== 'death' && Math.hypot(em.x - wx, em.y - wy) <= 68) {
          danger = true;
          break;
        }
      }
      if (danger || this.economy.seeds <= 4) {
        this.crisisSlowMoTriggered = true;
        this.fx.triggerScreenShake(4.5, 0.35);
        this.fx.showBanner('⚠️ 绝境破釜！圣树受袭，速出技能！', '#FF4D4F', '全场时光缓流 1.5s', 2.0);
        this.fx.fxSlowMoTimerSec = 1.5;
        this.fx.fxTimeScale = 0.38;
        if (this.gameSpeed > 1) {
          this.gameSpeed = 1;
        }
        platform.playSfx('sfx_bomb');
      }
    }

    if (this.flankAlertTimer > 0) {
      this.flankAlertTimer = Math.max(0, this.flankAlertTimer - dt);
    }

    // 3. 子弹飞行、碰撞检测与雾团/灼烧区状态注入
    this.bulletManager.update(
      dt,
      this.logicalCombatTimeSec,
      this.map,
      this.enemyManager,
      this.economy,
      this.fx
    );

    // 4. 敌人移动、反向攻击防御塔、持续伤害结算、Boss 阶段切换与漏怪扣血判定
    this.enemyManager.update(
      dt,
      this.logicalCombatTimeSec,
      this.map,
      this.economy,
      this.fx,
      (defeated) => {
        if (defeated) {
          this.onDefeat();
        }
      },
      this.towerManager,
      this.relicManager,
      this
    );
  }

  /**
   * 真实帧更新（驱动手柄轮询、界面动画、震屏与顿帧恢复）
   */
  updateRealTime(realDt) {
    this.animTimeSec += realDt;
    this.selectedTileAgeSec = (this.selectedTileAgeSec || 0) + realDt;
    input.pollGamepad(realDt);
    this.processInputActions();
    this.ui.update(realDt);

    const isPaused = this.state !== 'BATTLE' || this.ui.showGuideModal || this.ui.showSettingsModal;
    this.fx.update(realDt, this.state === 'BATTLE', isPaused);
  }

  /**
   * 渲染完整一帧画面
   */

  onEnemyKilled(enemy) {
    if (this.comboKillTimer > 0) {
      this.comboKillCount += 1;
    } else {
      this.comboKillCount = 1;
    }
    this.comboKillTimer = 1.4;
    if (this.combatScreenJuice) this.combatScreenJuice.onKill(enemy, this);

    platform.playMusicalScale(this.comboKillCount - 1);
    if (this.achievements) {
      this.achievements.unlock('first_blood', this.fx);
      if (enemy && (enemy.id === 'shadow_stalker' || enemy.type === 'flank')) {
        this.achievements.unlock('subterranean_slayer', this.fx);
      }
      if (this.comboKillCount >= 10) {
        this.achievements.unlock('multikill_overload', this.fx);
      }
      if (this.economy && this.economy.spores >= 2500) {
        this.achievements.unlock('spore_tycoon', this.fx);
      }
    }

    if (this.comboKillCount >= 4) {
      this.fx.spawnFloatingText(enemy.x, enemy.y - 18, `${this.comboKillCount} 连杀!`, '#FFE58F', 0.9);
      this.fx.triggerScreenShake(1.2, 0.08);
    }

    if (this.comboKillCount === 8) {
      this.economy.addSpores(35);
      this.fx.showBanner(i18n.t('banner_spore_frenzy'), '#FFD700', '连杀爆发', 1.6);
      this.fx.triggerScreenShake(4.0, 0.25);
      if (this.towerManager && this.towerManager.towers) {
        for (let i = 0; i < this.towerManager.towers.length; i++) {
          const tw = this.towerManager.towers[i];
          if (tw.dormantTimer <= 0) {
            tw.superchargeTimer = Math.max(tw.superchargeTimer || 0, 4.0);
          }
        }
      }
    }
  }

  render(ctx) {
    if (this.state === 'TITLE') {
      this.ui.renderTitleScreen(ctx, this);
      return;
    }

    if (this.state === 'LEVEL_SELECT') {
      this.ui.renderLevelSelect(ctx, this);
      return;
    }

    // 战斗场景（含 BATTLE, PAUSED, SETTLEMENT）：全屏 960x540 森林战场作为第一视觉主体
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CONFIG.RESOLUTION.LOGICAL_WIDTH, CONFIG.RESOLUTION.LOGICAL_HEIGHT);
    ctx.clip();
    const jx = this.combatScreenJuice ? this.combatScreenJuice.shakeOffsetX : 0;
    const jy = this.combatScreenJuice ? this.combatScreenJuice.shakeOffsetY : 0;
    ctx.translate(mv.OFFSET_X + this.fx.shakeOffsetX + jx, mv.OFFSET_Y + this.fx.shakeOffsetY + jy);
    ctx.scale(mv.SCALE, mv.SCALE);

    this.map.render(ctx, this.animTimeSec, this.waveManager.currentWaveIndex);
    // 绘制地下发光菌丝脉络网络与战地集结小队
    this.towerManager.renderMyceliumNetwork(ctx);
    this.sporelingPatrol.render(ctx);
    if (this.hero) {
      this.hero.render(ctx, this.animTimeSec);
    }
    this.relicManager.render(ctx);
    this.contraptions.render(ctx, this.animTimeSec);

    // 绘制圣树古根逆袭破土树根
    if (this.elderRootActiveTimer > 0 && this.map && this.map.mapData) {
      const wTile = this.map.mapData.warehouseTile || [19, 12];
      const wx = (wTile[0] + 0.5) * TILE_SIZE;
      const wy = (wTile[1] + 0.5) * TILE_SIZE;
      ctx.save();
      ctx.strokeStyle = '#5C381E';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      const rootPulse = Math.sin(this.animTimeSec * 15) * 3;
      for (let rIdx = 0; rIdx < 4; rIdx++) {
        const ang = (rIdx / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.quadraticCurveTo(wx + Math.cos(ang) * 35 + rootPulse, wy + Math.sin(ang) * 35, wx + Math.cos(ang) * 60, wy + Math.sin(ang) * 60);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 在地图坐标系内绘制柔和攻击范围与选中高亮（不抢戏、位于UI层之下）
    this.ui.renderMapPlacementPreview(ctx, this);
    this.bulletManager.renderHazards(ctx, this.animTimeSec);
    this.towerManager.render(ctx);
    this.enemyManager.render(ctx);
    this.bulletManager.renderBullets(ctx);
    if (this.heroSkills) {
      this.heroSkills.renderMapVfx(ctx);
    }
    if (this.elementalCombos) {
      this.elementalCombos.render(ctx);
    }
    if (this.guardianSynergies) {
      this.guardianSynergies.render(ctx);
    }
    if (this.combatVfx) {
      this.combatVfx.renderCombatVfx(ctx);
    }
    if (this.tacticalFeats) {
      this.tacticalFeats.render(ctx);
    }
    if (this.heroTranscendence) {
      this.heroTranscendence.render(ctx);
    }
    if (this.elementalReactions) {
      this.elementalReactions.render(ctx, this.animTimeSec);
    }
    this.fx.renderMapFx(ctx);
    this.sporeDropManager.render(ctx);
    if (this.combatJuice) {
      this.combatJuice.renderFx(ctx);
      this.combatJuice.renderStreakWidget(ctx);
    }
    // 以下元素使用地图坐标，必须在地图变换内绘制
    if (this.bossOverdriveEngine) {
      this.bossOverdriveEngine.renderBossAura(ctx);
    }
    if (this.state === 'BATTLE' && this.selectedTile && this.selectedTile.col >= 0 && this.tacticalTargeting) {
      const hlTower = this.towerManager.getTowerAt(this.selectedTile.col, this.selectedTile.row);
      if (hlTower && hlTower.typeId !== 'lumina' && !hlTower.isWebbed) {
        const hlTarget = this.towerManager.selectTarget(hlTower, this.enemyManager.getAliveEnemies(), this.map);
        this.tacticalTargeting.renderTargetHighlight(ctx, hlTower, hlTarget);
      }
    }

    ctx.restore();

    // 天候生态全屏环境滤镜、雨滴与雾气
    if (this.weather) {
      this.weather.renderWeatherOverlay(ctx);
    }
    if (!this.ui.uiZenMode && this.state !== 'PAUSED') {
      if (this.bossOverdriveEngine) {
        this.bossOverdriveEngine.renderBossHud(ctx);
      }
      if (this.combatScreenJuice) {
        this.combatScreenJuice.renderJuiceOverlays(ctx);
      }
    }

    // 屏幕级特效横幅与红边闪烁
    this.fx.renderScreenOverlayFx(ctx);

    // 环绕式奇幻森林战斗 HUD（顶部资源条、右上控制栏、底部植物塔卡片栏、动态弹出式防御塔升级面板）
    this.ui.renderBattleHud(ctx, this);
  }
}

module.exports = SceneController;
