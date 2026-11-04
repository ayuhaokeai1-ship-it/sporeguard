/**
 * 远古菌族精通专精与古木天赋树系统 (js/game/mushroomMastery.js)
 * 深度汲取《王国保卫战》(Kingdom Rush) 英雄星级天赋与《植物大战僵尸2》植物家族专精精髓：
 * - 5 大蘑菇守卫专属远古精通树 (3 阶递进战术天赋):
 *   1. 瞭望箭菇: 鹰眼洞悉 (射程+25%/破隐) -> 双重离弦 (22%连射) -> 破风碎甲 (贯穿破甲)
 *   2. 迷雾孢子: 蚀骨瘴气 (滞留+40%/腐蚀) -> 剧毒裂变 (击杀死灵毒爆) -> 迟缓深渊 (50%深度泥潭)
 *   3. 刺棘地刺: 铁棘倒钩 (流血创伤) -> 扇形刺浪 (5向广角齐射) -> 扎根陷阵 (强袭定身截击)
 *   4. 爆裂重炮: 巨型爆轰 (范围+35%/击退) -> 母子散弹 (3枚子母雷次生破片) -> 炽炎焦土 (地面灼烧)
 *   5. 日曜金菇: 日光滋养 (3格攻速光环) -> 圣光致盲 (全场失准目眩) -> 神圣复苏 (巨量孢子+英雄回血)
 * - 与局内战术完全融汇：升级点数由波次三星通关与远古神圣种子兑换
 */

const platform = require('../core/platform');

const MASTERY_DATA = {
  watch: [
    { id: 'watch_m1', tier: 1, name: '鹰眼洞悉', icon: '🦅', desc: '射程提升 25%，并能直接洞察击中潜地土丘中的潜伏者', cost: 1, stat: { rangeBonus: 0.25, detectBurrow: true } },
    { id: 'watch_m2', tier: 2, name: '双重离弦', icon: '🏹', desc: '巡林金矢有 22% 几率同时齐射出两支羽箭，双倍火力压制', cost: 2, stat: { twinShotChance: 0.22 } },
    { id: 'watch_m3', tier: 3, name: '破风碎甲', icon: '🌪️', desc: '箭矢附带破风气旋，贯穿目标并粉碎 3 点护甲持续 4 秒', cost: 3, stat: { pierceCount: 1, armorShred: 3 } }
  ],
  mist: [
    { id: 'mist_m1', tier: 1, name: '蚀骨瘴气', icon: '🧪', desc: '迷雾持续时间延长 40%，对重甲敌怪额外造成真实腐蚀伤害', cost: 1, stat: { durationBonus: 0.40, trueDmgBonus: 4 } },
    { id: 'mist_m2', tier: 2, name: '剧毒裂变', icon: '☣️', desc: '在迷雾中被消灭的敌怪会引爆小型孢子毒云，伤害临近敌群', cost: 2, stat: { deathPoisonNova: true } },
    { id: 'mist_m3', tier: 3, name: '迟缓深渊', icon: '🕸️', desc: '减速幅度跃升至 52%，大幅打断急行跳跃怪与织网者的突击步伐', cost: 3, stat: { slowBonus: 0.22 } }
  ],
  thorn: [
    { id: 'thorn_m1', tier: 1, name: '铁棘倒钩', icon: '🩸', desc: '尖刺直伤提升 30%，暴击时附带持续 3 秒的割裂流血效果', cost: 1, stat: { dmgBonus: 0.30, bleedDps: 6 } },
    { id: 'thorn_m2', tier: 2, name: '扇形刺浪', icon: '🌿', desc: '每次齐射发射 5 枚刺棘覆盖 65 度扇形面，形成严密的拒马防线', cost: 2, stat: { spikeCount: 5 } },
    { id: 'thorn_m3', tier: 3, name: '扎根陷阵', icon: '🛡️', desc: '对空中跳跃或冲锋的敌怪产生强力拦截，使其定身 1.2 秒', cost: 3, stat: { antiLeapStun: 1.2 } }
  ],
  burst: [
    { id: 'burst_m1', tier: 1, name: '巨型爆轰', icon: '💥', desc: '爆炸冲击波半径扩展 35%，强力震退并击晕轻型怪 0.4 秒', cost: 1, stat: { aoeRadiusBonus: 0.35, knockback: true } },
    { id: 'burst_m2', tier: 2, name: '母子散弹', icon: '💣', desc: '主炮弹着地瞬间散落 3 颗微型子母雷，造成二次破片爆炸', cost: 2, stat: { clusterBomblets: 3 } },
    { id: 'burst_m3', tier: 3, name: '炽炎焦土', icon: '🔥', desc: '爆破留下持续 3.2 秒的灼烧烈焰泥土，每秒造成 16 点火系面伤', cost: 3, stat: { fireGroundDuration: 3.2, fireGroundDps: 16 } }
  ],
  lumina: [
    { id: 'lumina_m1', tier: 1, name: '日光滋养', icon: '☀️', desc: '以自身为中心 3 格范围内的所有蘑菇守卫攻击速度提升 18%', cost: 1, stat: { auraAtkSpeed: 0.18, auraRadius: 3 } },
    { id: 'lumina_m2', tier: 2, name: '圣光致盲', icon: '✨', desc: '周期性释放神圣脉冲时，使全图敌怪致盲 1.2 秒无法施展技能', cost: 2, stat: { screenBlind: 1.2 } },
    { id: 'lumina_m3', tier: 3, name: '神圣复苏', icon: '🌟', desc: '自然采收孢子量增加 50%，同时为橡木树人英雄注入 90 点生命痊愈', cost: 3, stat: { harvestBonus: 0.50, heroHeal: 90 } }
  ]
};

class MushroomMasterySystem {
  constructor() {
    this.masteryPoints = 6; // 初始赠送6点天赋点让玩家尽情体验顶级专精
    this.unlockedTiers = {
      watch: 1,
      mist: 1,
      thorn: 1,
      burst: 1,
      lumina: 1
    };
    this.isPanelOpen = false;
    this.selectedTowerType = 'watch';
  }

  isUnlocked(towerType, tier) {
    return (this.unlockedTiers[towerType] || 0) >= tier;
  }

  hasMastery(towerType, masteryId) {
    const list = MASTERY_DATA[towerType];
    if (!list) return false;
    const m = list.find(item => item.id === masteryId);
    if (!m) return false;
    return this.isUnlocked(towerType, m.tier);
  }

  unlockNextTier(towerType) {
    const cur = this.unlockedTiers[towerType] || 0;
    if (cur >= 3) return false;
    const nextTier = cur + 1;
    const list = MASTERY_DATA[towerType];
    const m = list.find(item => item.tier === nextTier);
    if (!m) return false;

    if (this.masteryPoints >= m.cost) {
      this.masteryPoints -= m.cost;
      this.unlockedTiers[towerType] = nextTier;
      platform.playSfx('sfx_upgrade');
      return true;
    }
    return false;
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;
    return this.isPanelOpen;
  }

  /**
   * 渲染古代真菌精通天赋法典面板 (Codex Mastery Sub-panel)
   */
  renderMasteryPanel(ctx) {
    if (!this.isPanelOpen) return;

    ctx.save();
    // 半透明古林遮罩
    ctx.fillStyle = 'rgba(10, 15, 12, 0.82)';
    ctx.fillRect(0, 0, 960, 640);

    // 羊皮纸/青苔树皮主卷轴
    const px = 180, py = 70, pw = 600, ph = 420;
    ctx.fillStyle = 'rgba(24, 18, 12, 0.96)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(px, py, pw, ph, 14) : ctx.rect(px, py, pw, ph);
    ctx.fill();

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 顶部标题
    ctx.fillStyle = '#FFE58F';
    ctx.font = 'bold 17px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🍄 远古真菌精通天赋法典 (Mushroom Mastery)', px + 24, py + 34);

    ctx.fillStyle = '#52C41A';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`可用天赋点: ${this.masteryPoints} ★`, px + pw - 24, py + 34);

    // 左侧防御塔分类标签切换
    const towerTabs = [
      { id: 'watch', name: '瞭望箭菇' },
      { id: 'mist', name: '迷雾孢子' },
      { id: 'thorn', name: '刺棘地刺' },
      { id: 'burst', name: '爆裂重炮' },
      { id: 'lumina', name: '日曜金菇' }
    ];

    const tabW = 100;
    for (let i = 0; i < towerTabs.length; i++) {
      const tab = towerTabs[i];
      const isSel = this.selectedTowerType === tab.id;
      const tx = px + 24;
      const ty = py + 60 + i * 52;

      ctx.fillStyle = isSel ? 'rgba(82, 196, 26, 0.28)' : 'rgba(35, 25, 18, 0.65)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tx, ty, tabW, 42, 8) : ctx.rect(tx, ty, tabW, 42);
      ctx.fill();

      ctx.strokeStyle = isSel ? '#73D13D' : '#5C4028';
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSel ? '#FFFFFF' : '#D9D9D9';
      ctx.font = isSel ? 'bold 12px sans-serif' : '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tab.name, tx + tabW * 0.5, ty + 25);
    }

    // 右侧当前选中毒菇的 3 阶精通展示
    const curList = MASTERY_DATA[this.selectedTowerType] || [];
    const contentX = px + tabW + 40;
    const unlockedTier = this.unlockedTiers[this.selectedTowerType] || 0;

    for (let i = 0; i < curList.length; i++) {
      const m = curList[i];
      const cy = py + 60 + i * 105;
      const cw = pw - tabW - 64;
      const ch = 90;
      const isUnlocked = m.tier <= unlockedTier;

      ctx.fillStyle = isUnlocked ? 'rgba(38, 55, 30, 0.85)' : 'rgba(28, 22, 18, 0.75)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(contentX, cy, cw, ch, 8) : ctx.rect(contentX, cy, cw, ch);
      ctx.fill();

      ctx.strokeStyle = isUnlocked ? '#95DE64' : '#5C4028';
      ctx.lineWidth = isUnlocked ? 1.8 : 1.0;
      ctx.stroke();

      // 天赋图标与名称
      ctx.font = 'bold 14px "Microsoft YaHei UI", sans-serif';
      ctx.fillStyle = isUnlocked ? '#FFE58F' : '#8C8C8C';
      ctx.textAlign = 'left';
      ctx.fillText(`${m.icon} 阶位 ${m.tier}: ${m.name}`, contentX + 16, cy + 24);

      // 状态标签
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      if (isUnlocked) {
        ctx.fillStyle = '#52C41A';
        ctx.fillText('✓ 已领悟', contentX + cw - 16, cy + 24);
      } else if (m.tier === unlockedTier + 1) {
        ctx.fillStyle = this.masteryPoints >= m.cost ? '#FFD666' : '#FF4D4F';
        ctx.fillText(`[点击领悟 消耗 ${m.cost} ★]`, contentX + cw - 16, cy + 24);
      } else {
        ctx.fillStyle = '#595959';
        ctx.fillText('🔒 前置阶位未解锁', contentX + cw - 16, cy + 24);
      }

      // 天赋描述
      ctx.font = '11px "Microsoft YaHei UI", sans-serif';
      ctx.fillStyle = isUnlocked ? '#E8E8E8' : '#8C8C8C';
      ctx.textAlign = 'left';
      ctx.fillText(m.desc, contentX + 16, cy + 54);
    }

    // 底部关闭提示
    ctx.fillStyle = '#8C8C8C';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点击空白处或右上角 ✖ 退出天赋法典', px + pw * 0.5, py + ph - 16);

    ctx.restore();
  }
}

module.exports = {
  MushroomMasterySystem,
  MASTERY_DATA
};
