/**
 * 战术成就殿堂与勋章进阶系统 (js/game/achievements.js)
 * 丛林战术成就殿堂，包含 20 大战术勋章与即时弹窗
 */

const storage = require('../save/storage');
const platform = require('../core/platform');

const ACHIEVEMENTS_DATA = [
  { id: 'first_blood', title: '丛林初捷', desc: '击杀首只入侵害虫打响反击', icon: '⚔️', rewardStars: 1 },
  { id: 'flawless_defense', title: '滴水不漏', desc: '满 20 颗种子完美通关任一地图', icon: '👑', rewardStars: 2 },
  { id: 'hero_awakened', title: '守护神觉醒', desc: '大橡树升至 5 级并释放奥义', icon: '🌟', rewardStars: 1 },
  { id: 'subterranean_slayer', title: '侧翼肃清', desc: '击破侧翼小径或潜地突袭害虫', icon: '🐛', rewardStars: 1 },
  { id: 'spore_tycoon', title: '孢子大亨', desc: '单局保有超过 2500 黄金孢子', icon: '🪙', rewardStars: 2 },
  { id: 'multikill_overload', title: '破军狂澜', desc: '瞬间达成 10 连杀连锁清场', icon: '🔥', rewardStars: 1 },
  { id: 'iron_wall', title: '永固棱堡', desc: '场上同时拥有 4 座终极三阶塔', icon: '💎', rewardStars: 2 },
  { id: 'weather_survivor', title: '血月征服者', desc: '在血月天象下坚守并赢下关卡', icon: '🌙', rewardStars: 1 },
  { id: 'spider_regicide', title: '初战告捷', desc: '击破第 10 波首领光复晨雾林地', icon: '🏆', rewardStars: 3 },
  { id: 'endless_champion', title: '深渊开拓者', desc: '无尽深渊模式坚持突破第 15 波', icon: '✨', rewardStars: 3 },
  { id: 'pitcher_gluttony', title: '奇幻猪笼草', desc: '激发食人猪笼草成功消化 3 次', icon: '🍃', rewardStars: 1 },
  { id: 'thunder_conduit', title: '灵脉雷音', desc: '古木天雷单次连锁电击 6 敌', icon: '⚡', rewardStars: 1 },
  { id: 'tactical_stances', title: '兵无常势', desc: '单场战斗中切换大橡树 3 种姿态', icon: '🛡️', rewardStars: 1 },
  { id: 'holy_cornucopia', title: '丰收晨露', desc: '灵光菇单局生产 800 以上孢子', icon: '🍄', rewardStars: 1 },
  { id: 'permafrost_hold', title: '深度冻结', desc: '雾菇同时冻结减速 8 名以上敌人', icon: '❄️', rewardStars: 1 },
  { id: 'laceration_field', title: '荆棘绝阵', desc: '尖刺菇单场累计造成 3000 伤害', icon: '🌿', rewardStars: 1 },
  { id: 'artillery_barrage', title: '熔岩落日', desc: '爆裂菇单发炮弹炸毁 5 只聚集敌', icon: '💣', rewardStars: 1 },
  { id: 'audacious_commander', title: '兵贵神速', desc: '累计 5 次吹响号角提前迎战', icon: '📯', rewardStars: 1 },
  { id: 'last_stand', title: '绝境逆转', desc: '仅剩 1 颗生命种子逆转赢下对局', icon: '❤️', rewardStars: 2 },
  { id: 'codex_grandmaster', title: '博学大典', desc: '翻阅林地秘典全守卫与害虫图鉴', icon: '📜', rewardStars: 1 }
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
    ctx.fillText(`成就达成 · ${item.title}`, tx + 56, ty + 16);

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
