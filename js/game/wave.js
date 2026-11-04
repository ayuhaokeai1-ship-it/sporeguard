/**
 * 波次与备战倒计时管理器 (js/game/wave.js)
 * 严格实现 5.1 备战倒计时（首波40秒，后续20秒）、5.2 提前召唤奖励与波次奖励、
 * 以及 7.3 波次组出生节奏与同屏波次敌人 <= 12 上限控制
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { WAVES } = require('../data/waves');
const { ENEMIES } = require('../data/enemies');
const platform = require('../core/platform');
const i18n = require('../i18n/index');

class WaveManager {
  constructor(mapId) {
    this.reset(mapId);
  }

  reset(mapId) {
    this.mapId = mapId;
    this.waveList = WAVES[mapId] || WAVES.map1;
    this.totalWaves = this.waveList.length;
    this.currentWaveIndex = 1; // 1..totalWaves
    this.phase = 'prep';       // 'prep' | 'combat' | 'completed'
    this.prepTimerSec = CONFIG.ECONOMY.PREP_TIME_FIRST_WAVE; // 第一波前 40 秒
    this.waveElapsedSec = 0;
    this.activeGroups = [];
  }

  isPrepPhase() {
    return this.phase === 'prep';
  }

  isCombatPhase() {
    return this.phase === 'combat';
  }

  /**
   * 获取下一波（或当前备战波）的敌人种类与数量汇总，供 HUD 备战预告展示
   */
  getUpcomingWaveSummary() {
    const idx = Math.min(this.totalWaves, this.currentWaveIndex) - 1;
    const waveDef = this.waveList[idx];
    if (!waveDef) return [];

    const counts = {};
    const order = [];
    for (let i = 0; i < waveDef.groups.length; i++) {
      const g = waveDef.groups[i];
      if (!counts[g.type]) {
        counts[g.type] = 0;
        order.push(g.type);
      }
      counts[g.type] += g.count;
    }

    return order.map((type) => ({
      type,
      def: ENEMIES[type],
      count: counts[type]
    }));
  }

  /**
   * 进入无尽深渊模式
   */
  startEndlessMode(economy, fx) {
    this.totalWaves = Math.max(this.totalWaves, this.currentWaveIndex + 1);
    this.currentWaveIndex += 1;
    this.phase = 'prep';
    this.prepTimerSec = 4.0;
  }

  /**
   * 手动提前召唤下一波（仅在备战阶段有效）
   */
  callNextWaveEarly(economy, fx) {
    if (this.waveList && this.currentWaveIndex < this.waveList.length && !this.isPrepPhase()) {
      // 战斗中强制双重召怪：触发【贪婪激怒狂潮】
      this.isEnraged = true;
      if (fx) {
        fx.showBanner(i18n.t('banner_enraged_wave'), '#FF4D4F', '双倍战利品', 1.8);
        fx.triggerScreenShake(4.0, 0.35);
      }
      platform.playSfx('sfx_horn');
    }
    if (this.phase !== 'prep') return 0;
    const bonus = economy.grantEarlyCallBonus(this.prepTimerSec);
    if (fx) {
      if (bonus > 0) {
        fx.spawnFloatingText(480, 260, `提前迎敌 +${bonus} 孢子!`, PALETTE.BRANCH_B, 1.35);
        fx.spawnParticles(480, 260, 26, ['#FFE58F', '#FFA940', '#52C41A', '#FFFFFF'], 60, 160, 0.35, 0.7, 4.5);
      }
      fx.showBanner('虫潮先锋突袭！', PALETTE.CRIMSON_SELL, '林地号角长鸣，全军进入战备状态', 1.6);
      fx.triggerScreenShake(2.5, 0.15);
    }
    this.startCurrentWave(economy, fx);
    platform.playSfx('sfx_upgrade');
    return bonus;
  }

  /**
   * 正式开始当前波次
   */
  startCurrentWave(economy, fx) {
    let waveDef = this.waveList[this.currentWaveIndex - 1];
    if (!waveDef) {
      // 动态生成无尽深渊波次
      const extraWaves = this.currentWaveIndex - this.waveList.length;
      const enemyPool = ['beetle', 'swift', 'armored', 'moth', 'splitter', 'burrower', 'weaver', 'leaper', 'siege_beetle', 'volatile_pod'];
      const gCount = Math.min(6, 2 + Math.floor(extraWaves / 2));
      const groups = [];
      for (let gi = 0; gi < gCount; gi++) {
        const eType = (gi === gCount - 1 && extraWaves % 5 === 0)
          ? (extraWaves % 10 === 0 ? 'boss_m3' : 'boss_m1')
          : enemyPool[Math.floor(Math.random() * enemyPool.length)];
        groups.push({
          type: eType,
          count: Math.min(16, 4 + Math.floor(extraWaves * 1.5) + gi * 2),
          interval: Math.max(0.4, 1.4 - extraWaves * 0.05),
          start: gi * 3.5,
          routeIndex: (gi % 2 === 1) ? 1 : 0
        });
      }
      waveDef = { groups };
    }

    this.phase = 'combat';
    this.waveElapsedSec = 0;
    economy.onWaveStart();

    // 同一组出生带一致或微扰的 ±6 像素横向偏移
    this.activeGroups = waveDef.groups.map((g, idx) => ({
      type: g.type,
      count: g.count,
      interval: Math.max(0.2, g.interval || 1.5),
      start: g.start || 0,
      spawned: 0,
      timer: g.interval || 1.5, // 到达 start 时间后立即刷出第 1 只
      groupLateralBase: ((idx % 3) - 1) * 3
    }));

    // 检查是否包含首领，若包含则切换首领战 BGM 并弹出首领警告横幅
    const hasBoss = this.activeGroups.some((g) => ENEMIES[g.type] && ENEMIES[g.type].isBoss);
    if (hasBoss) {
      platform.playBgm('boss_' + this.mapId);
      if (fx) {
        fx.showBanner(
          i18n.t('banner_boss_incoming'),
          PALETTE.ENEMY_EYE,
          i18n.t('wave_label') + ' ' + this.currentWaveIndex + '/' + this.totalWaves,
          1.8
        );
      }
    } else {
      platform.playBgm('bgm_battle');
    }
  }

  /**
   * 固定步长更新备战倒计时或波次出怪
   */
  update(dt, map, enemyManager, economy, fx, onAllWavesCleared, scene = null) {
    if (this.phase === 'completed') return;

    if (this.phase === 'prep') {
      this.prepTimerSec -= dt;
      if (this.prepTimerSec <= 0) {
        this.prepTimerSec = 0;
        this.startCurrentWave(economy, fx);
      }
      return;
    }

    if (this.phase === 'combat') {
      this.waveElapsedSec += dt;

      let allGroupsFinished = true;
      for (let i = 0; i < this.activeGroups.length; i++) {
        const g = this.activeGroups[i];
        if (g.spawned >= g.count) continue;
        allGroupsFinished = false;

        if (this.waveElapsedSec < g.start) continue;

        g.timer += dt;
        if (g.timer >= g.interval) {
          const isBoss = Boolean(ENEMIES[g.type] && ENEMIES[g.type].isBoss);
          const activeWaveEnemies = enemyManager.getActiveWaveEnemyCount();

          // 7.3 同一时刻场上出生的敌人不超过 12 个（首领不受排队阻塞）
          if (isBoss || activeWaveEnemies < CONFIG.COMBAT.MAX_ACTIVE_WAVE_ENEMIES) {
            const jitter = (Math.random() * 2 - 1) * 3;
            const lat = Math.max(
              -CONFIG.COMBAT.SPAWN_LATERAL_OFFSET_PX,
              Math.min(CONFIG.COMBAT.SPAWN_LATERAL_OFFSET_PX, g.groupLateralBase + jitter)
            );
            const spawned = enemyManager.spawnEnemy(g.type, map, this.currentWaveIndex, {
              fromWave: true,
              startDistPx: 0,
              lateralOffsetPx: lat,
              routeIndex: g.routeIndex || 0
            });
            if (spawned) {
              if (g.routeIndex === 1 && scene && typeof scene.triggerFlankAlert === 'function') {
                scene.triggerFlankAlert();
              }
              g.spawned += 1;
              g.timer = 0;
            } else if (!ENEMIES[g.type]) {
              console.warn('Unknown enemy type in wave:', g.type);
              g.spawned += 1;
              g.timer = 0;
            } else {
              g.timer = Math.max(0, g.interval - 0.25);
            }
          }
        }
      }

      // 当本波所有组均已出完，且场上没有任何存活敌人时，本波完成
      if (allGroupsFinished && enemyManager.getAliveEnemies().length === 0) {
        const rewardInfo = economy.grantWaveClearReward(this.currentWaveIndex);

        if (this.currentWaveIndex >= this.totalWaves) {
          if (scene && scene.isEndlessMode) {
            // 无尽模式：持续突破波次上限
            this.currentWaveIndex += 1;
            this.totalWaves = Math.max(this.totalWaves, this.currentWaveIndex);
            this.phase = 'prep';
            this.prepTimerSec = 8.0; // 无尽备战紧凑 8 秒
            storage.recordEndlessWave(this.currentWaveIndex);
            if (fx) {
              fx.showBanner(`🔥 无尽深渊 第 ${this.currentWaveIndex} 波！`, '#FF4D4F', `虫群狂暴加剧 +${Math.round((this.currentWaveIndex - 10) * 12)}% 属性`, 1.8);
              fx.triggerScreenShake(3.0, 0.25);
            }
          } else {
            this.phase = 'completed';
            if (onAllWavesCleared) {
              onAllWavesCleared(rewardInfo);
            }
          }
        } else {
          if (fx) {
            const sub = rewardInfo.flawlessBonus > 0
              ? ('+' + rewardInfo.waveReward + ' / ' + i18n.t('banner_flawless'))
              : ('+' + rewardInfo.waveReward + ' ' + i18n.t('spores_label'));
            fx.showBanner(i18n.t('banner_wave_clear'), PALETTE.UI_SPORE, sub, 1.4);
          }
          this.currentWaveIndex += 1;
          this.phase = 'prep';
          this.prepTimerSec = CONFIG.ECONOMY.PREP_TIME_NEXT_WAVE; // 之后每波备战 20 秒
        }
      }
    }
  }
}

module.exports = WaveManager;
