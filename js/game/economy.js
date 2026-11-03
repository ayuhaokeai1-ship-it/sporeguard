/**
 * 资源与经济系统 (js/game/economy.js)
 * 严格实现 5.2 资源与经济表：种子、孢子、击杀奖励、波次完成奖励、无损奖励、提前召唤奖励、群杀奖励、60%出售返还与评星计算
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');

class EconomyManager {
  constructor(mapId) {
    this.reset(mapId);
  }

  reset(mapId) {
    this.mapId = mapId;
    this.seeds = CONFIG.ECONOMY.INITIAL_SEEDS;
    this.maxSeeds = CONFIG.ECONOMY.INITIAL_SEEDS;
    this.spores = CONFIG.ECONOMY.INITIAL_SPORES[mapId] || 300;
    this.totalEarnedSpores = this.spores;
    this.totalKills = 0;
    this.waveLeaks = 0;

    // 0.5 秒群杀滑动窗口与同帧爆炸批处理
    this.killWindow = [];
    this.clusterRewardedCount = 0;
    this.clusterTierTriggered = 0; // 0: 无, 1: 3-4只, 2: 5-9只, 3: 10+只
    this.inBatch = false;
    this.batchKills = 0;
    this.batchLastX = 320;
    this.batchLastY = 240;
  }

  canAfford(cost) {
    return this.spores >= cost;
  }

  spendSpores(cost) {
    if (this.spores < cost) return false;
    this.spores -= cost;
    return true;
  }

  addSpores(amount) {
    if (amount <= 0) return;
    this.spores += amount;
    this.totalEarnedSpores += amount;
  }

  /**
   * 敌人到达种子仓库终点：扣除威胁值
   */
  onEnemyLeak(threat) {
    const dmg = Math.max(1, threat || 1);
    this.seeds = Math.max(0, this.seeds - dmg);
    this.waveLeaks += 1;
    return this.seeds <= 0;
  }

  onWaveStart() {
    this.waveLeaks = 0;
  }

  /**
   * 5.2 提前召唤奖励：剩余备战秒数 × 1，上限 15
   */
  grantEarlyCallBonus(remainingPrepSec) {
    const raw = Math.floor(remainingPrepSec * CONFIG.ECONOMY.EARLY_CALL_PER_SEC);
    const bonus = Math.max(0, Math.min(CONFIG.ECONOMY.EARLY_CALL_MAX, raw));
    this.addSpores(bonus);
    return bonus;
  }

  /**
   * 5.2 波次完成奖励：20 + 4 × 波次序号；无损额外奖励 10
   */
  grantWaveClearReward(waveIndex) {
    const waveReward = CONFIG.ECONOMY.WAVE_CLEAR_BASE + CONFIG.ECONOMY.WAVE_CLEAR_PER_WAVE * waveIndex;
    const flawlessBonus = this.waveLeaks === 0 ? CONFIG.ECONOMY.FLAWLESS_WAVE_BONUS : 0;
    this.addSpores(waveReward + flawlessBonus);
    return {
      waveReward,
      flawlessBonus,
      total: waveReward + flawlessBonus
    };
  }

  /**
   * 5.2 出售返还：按该炮塔已投入总额（基础 + 全部升级）的 60% 计算
   */
  calculateSellRefund(totalInvested) {
    return Math.round(totalInvested * CONFIG.ECONOMY.SELL_REFUND_RATE);
  }

  /**
   * 开始同一次爆炸批处理（用于爆裂菇同帧范围结算）
   */
  beginExplosionBatch() {
    this.inBatch = true;
    this.batchKills = 0;
  }

  /**
   * 结束同一次爆炸批处理，统一结算群杀
   */
  endExplosionBatch(combatTimeSec, fx) {
    this.inBatch = false;
    if (this.batchKills > 0) {
      this.evaluateMultiKillCluster(combatTimeSec, this.batchLastX, this.batchLastY, fx);
    }
    this.batchKills = 0;
  }

  /**
   * 记录单次敌人击杀，发放基础击杀奖励并检测 0.5 秒群杀窗口
   */
  registerKill(enemy, finalDamage, combatTimeSec, fx) {
    const reward = enemy.reward || 0;
    this.addSpores(reward);
    this.totalKills += 1;

    if (fx) {
      fx.onSingleKill(enemy.x, enemy.y, finalDamage, reward, enemy.tintColor || PALETTE.UI_SPORE);
    }

    // 清理超过 0.5 秒的旧击杀记录
    const windowSec = CONFIG.ECONOMY.MULTIKILL_WINDOW_SEC;
    while (this.killWindow.length > 0 && combatTimeSec - this.killWindow[0].t > windowSec) {
      this.killWindow.shift();
    }
    if (this.killWindow.length === 0) {
      this.clusterRewardedCount = 0;
      this.clusterTierTriggered = 0;
    }

    this.killWindow.push({ t: combatTimeSec, x: enemy.x, y: enemy.y });

    if (this.inBatch) {
      this.batchKills += 1;
      this.batchLastX = enemy.x;
      this.batchLastY = enemy.y;
    } else {
      this.evaluateMultiKillCluster(combatTimeSec, enemy.x, enemy.y, fx);
    }
  }

  /**
   * 评估当前 0.5 秒窗口内的群杀数量，发放群杀奖励并触发对应档位反馈
   */
  evaluateMultiKillCluster(combatTimeSec, x, y, fx) {
    const count = this.killWindow.length;
    if (count < CONFIG.ECONOMY.MULTIKILL_MIN_COUNT) {
      return;
    }

    const targetBonus = Math.min(
      CONFIG.ECONOMY.MULTIKILL_MAX_BONUS,
      count * CONFIG.ECONOMY.MULTIKILL_PER_KILL
    );
    const deltaBonus = Math.max(0, targetBonus - this.clusterRewardedCount);
    if (deltaBonus > 0) {
      this.addSpores(deltaBonus);
      this.clusterRewardedCount = targetBonus;
    }

    let tier = 1;
    if (count >= CONFIG.FEEDBACK.MULTIKILL_OVERLOAD.minKills) {
      tier = 3;
    } else if (count >= CONFIG.FEEDBACK.MULTIKILL_CHAIN.minKills) {
      tier = 2;
    }

    if (tier > this.clusterTierTriggered || (this.inBatch === false && this.batchKills >= 3)) {
      this.clusterTierTriggered = tier;
      if (fx) {
        fx.onMultiKill(x, y, count, targetBonus);
      }
    }
  }

  /**
   * 5.8 评星判定：>=16 为 3 星，>=10 为 2 星，>=1 为 1 星
   */
  calculateStars() {
    if (this.seeds >= CONFIG.STARS.THREE_STAR_SEEDS) return 3;
    if (this.seeds >= CONFIG.STARS.TWO_STAR_SEEDS) return 2;
    if (this.seeds >= CONFIG.STARS.ONE_STAR_SEEDS) return 1;
    return 0;
  }
}

module.exports = EconomyManager;
