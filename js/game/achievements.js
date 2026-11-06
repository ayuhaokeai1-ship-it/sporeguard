/**
 * 战术成就殿堂与勋章进阶系统 (js/game/achievements.js)
 * 丛林战术成就殿堂，包含 20 大战术勋章与即时弹窗
 */

const storage = require('../save/storage');
const platform = require('../core/platform');

const ACHIEVEMENTS_DATA = [
  { id: 'first_blood', title: '🌲 丛林初捷', desc: '击杀首只入侵甲虫，打响林地保卫战第一枪', icon: '⚔️', rewardStars: 1 },
  { id: 'flawless_defense', title: '🛡️ 滴水不漏', desc: '以 20 颗种子完全无损的完美战绩通关任意地图', icon: '👑', rewardStars: 2 },
  { id: 'hero_awakened', title: '🌳 守护神觉醒', desc: '大橡树英雄达到 5 级并释放「大地轰鸣」奥义', icon: '🌟', rewardStars: 1 },
  { id: 'subterranean_slayer', title: '🕳️ 潜行覆灭', desc: '全歼自侧翼腐化地穴绕行的全部暗影潜行突袭怪', icon: '🐛', rewardStars: 1 },
  { id: 'spore_tycoon', title: '💰 孢子大亨', desc: '单局积累超过 2500 黄金孢子，经济命脉固若金汤', icon: '🪙', rewardStars: 2 },
  { id: 'multikill_overload', title: '💥 破军狂澜', desc: '触发 10 只以上敌军瞬间连环爆裂群杀', icon: '🔥', rewardStars: 1 },
  { id: 'iron_wall', title: '🏰 永固棱堡', desc: '场上同时拥有 4 座三阶终极进阶形态防御塔', icon: '💎', rewardStars: 2 },
  { id: 'weather_survivor', title: '🩸 血月征服者', desc: '在狂暴血月天候下坚守阵地并全歼狂暴虫潮', icon: '🌙', rewardStars: 1 },
  { id: 'spider_regicide', title: '🕷️ 斩灭蛛后', desc: '击破第 10 波织网蜘蛛女王，光复图一晨曦薄雾', icon: '🏆', rewardStars: 3 },
  { id: 'endless_champion', title: '🌌 深渊开拓者', desc: '在无尽深渊极限模式中突破第 15 波狂暴挑战', icon: '✨', rewardStars: 3 },
  { id: 'pitcher_gluttony', title: '🪴 奇幻猪笼草', desc: '激活食人猪笼草捕食巨怪并成功消化 3 次', icon: '🍃', rewardStars: 1 },
  { id: 'thunder_conduit', title: '⚡ 灵脉雷音', desc: '激活古树雷石释放连锁闪电轰击 6 只以上虫群', icon: '🌩️', rewardStars: 1 },
  { id: 'tactical_stances', title: '🥋 兵无常势', desc: '在同一场战斗中灵活切换大橡树的三大战斗姿态', icon: '🎖️', rewardStars: 1 },
  { id: 'holy_cornucopia', title: '☀️ 丰收晨露', desc: '建造神圣灵光菇并在单局产出超过 800 黄金孢子', icon: '🍄', rewardStars: 1 },
  { id: 'permafrost_hold', title: '❄️ 深度冻结', desc: '使用极寒雾菇使至少 8 只敌人同时陷入重度减速', icon: '🧊', rewardStars: 1 },
  { id: 'laceration_field', title: '🌵 荆棘绝阵', desc: '尖刺菇单场割裂创伤累计造成超过 3000 点物理伤害', icon: '🌵', rewardStars: 1 },
  { id: 'artillery_barrage', title: '💣 熔岩落日', desc: '爆裂重炮单发熔岩迫击炮弹直接消灭 5 只聚集敌怪', icon: '🎯', rewardStars: 1 },
  { id: 'audacious_commander', title: '⏱️ 兵贵神速', desc: '累计 5 次提前吹响号角迎战，累积丰厚军功孢子', icon: '📯', rewardStars: 1 },
  { id: 'last_stand', title: '❤️ 绝境逆转', desc: '在生命种子仅剩最后 1 颗时绝境反击取得关卡胜利', icon: '🔥', rewardStars: 2 },
  { id: 'codex_grandmaster', title: '📜 博学大典', desc: '翻阅林地秘典全部守林神树卫士与暗黑虫潮图鉴档案', icon: '📖', rewardStars: 1 }
];

class AchievementManager {
  constructor() {
    this.unlockedIds = new Set();
    this.pendingToasts = [];
    this.currentToast = null;
    this.toastTimer = 0;
    this.totalStarsEarned = 0;

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = platform.getStorageSync('sporeguard_achievements');
      const list = Array.isArray(saved) ? saved : (typeof saved === 'string' ? JSON.parse(saved) : []);
      this.unlockedIds = new Set(list);
      this.calculateStars();
    } catch (e) {
      this.unlockedIds = new Set();
    }
  }

  saveToStorage() {
    try {
      platform.setStorageSync('sporeguard_achievements', Array.from(this.unlockedIds));
    } catch (e) {}
  }

  calculateStars() {
    let s = 0;
    for (let i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
      const a = ACHIEVEMENTS_DATA[i];
      if (this.unlockedIds.has(a.id)) {
        s += a.rewardStars || 1;
      }
    }
    this.totalStarsEarned = s;
  }

  unlock(id, fx = null) {
    if (this.unlockedIds.has(id)) return;
    const item = ACHIEVEMENTS_DATA.find(it => it.id === id);
    if (!item) return;

    this.unlockedIds.add(id);
    this.saveToStorage();
    this.calculateStars();

    this.pendingToasts.push(item);
    platform.playSfx('sfx_upgrade');

    if (fx && typeof fx.triggerScreenShake === 'function') {
      fx.triggerScreenShake(2.0, 0.15);
    }
  }

  isUnlocked(id) {
    return this.unlockedIds.has(id);
  }

  getAllAchievements() {
    return ACHIEVEMENTS_DATA.map(item => ({
      ...item,
      unlocked: this.unlockedIds.has(item.id)
    }));
  }

  getUnlockedCount() {
    return this.unlockedIds.size;
  }

  getTotalCount() {
    return ACHIEVEMENTS_DATA.length;
  }

  update(dt) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) {
        this.currentToast = null;
      }
    } else if (this.pendingToasts.length > 0) {
      this.currentToast = this.pendingToasts.shift();
      this.toastTimer = 3.6;
    }
  }

  renderAchievementToast(ctx) {
    if (!this.currentToast || this.toastTimer <= 0) return;

    ctx.save();
    const item = this.currentToast;
    const tw = 360;
    const th = 48;
    const tx = (960 - tw) * 0.5;
    
    // 顶部平滑滑出动画
    let ty = 24;
    if (this.toastTimer > 3.2) {
      const prog = (3.6 - this.toastTimer) / 0.4;
      ty = -50 + prog * 74;
    } else if (this.toastTimer < 0.4) {
      const prog = this.toastTimer / 0.4;
      ty = -50 + prog * 74;
    }

    // 古典林地木纹与羊皮纸底框
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(28, 18, 10, 0.95)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(tx, ty, tw, th, 10) : ctx.rect(tx, ty, tw, th);
    ctx.fill();

    ctx.strokeStyle = '#FFE58F';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 左侧徽章大图标
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, tx + 28, ty + 24);

    // 标题：成就解锁
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🏆 成就达成：${item.title}`, tx + 56, ty + 16);

    // 描述详情
    ctx.fillStyle = '#D9D9D9';
    ctx.font = '10px "Microsoft YaHei", sans-serif';
    ctx.fillText(item.desc, tx + 56, ty + 34);

    // 右侧奖励星级
    ctx.fillStyle = '#FFE58F';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`+${item.rewardStars}⭐`, tx + tw - 16, ty + 24);

    ctx.restore();
  }

  renderToast(ctx) {
    return this.renderAchievementToast(ctx);
  }
}

const achievements = new AchievementManager();
module.exports = achievements;
