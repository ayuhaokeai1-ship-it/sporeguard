/**
 * Sporeguard - 实时战斗DPS与战报分析面板 (Real-time Combat Analytics & DPS Meter)
 * 参考魔兽世界 Details! / 刀塔自走棋战力统计 / Kingdom Rush 战后统计
 * 实时监测：各类防御塔伤害输出、英雄微操输出、元素反应爆轰贡献、击杀榜与DPS柱状图
 */

const platform = require('../core/platform');

class CombatAnalyticsSystem {
  constructor() {
    this.isOpen = false;
    this.totalDamageDealt = 0;
    this.combatDuration = 0;
    this.highestSingleHit = { damage: 0, source: 'None' };

    // 各作战单元数据
    this.categoryStats = {
      watch: { name: '瞭望箭菇', damage: 0, kills: 0, color: '#096DD9', icon: 'assets/vfx/proj_watch_arrow.png' },
      burst: { name: '爆裂重炮', damage: 0, kills: 0, color: '#D4380D', icon: 'assets/vfx/proj_burst_shell.png' },
      thorn: { name: '刺棘地刺', damage: 0, kills: 0, color: '#389E0D', icon: 'assets/vfx/vfx_spikes.png' },
      mist: { name: '迷雾孢子', damage: 0, kills: 0, color: '#722ED1', icon: 'assets/vfx/vfx_mist.png' },
      lumina: { name: '日曜金菇', damage: 0, kills: 0, color: '#D48806', icon: 'assets/vfx/item_golden_spore.png' },
      hero: { name: '橡木守护者', damage: 0, kills: 0, color: '#237804', icon: 'assets/vfx/hero_oak.png' },
      sporelings: { name: '孢子近卫军', damage: 0, kills: 0, color: '#5B8C00', icon: 'assets/vfx/sporeling_guard.png' },
      reactions: { name: '自然元素反应', damage: 0, kills: 0, color: '#CF1322', icon: 'assets/vfx/vfx_hit_spark.png' }
    };

    this.toggleBtnRect = { x: 118, y: 14, w: 64, h: 24 };
  }

  reset() {
    this.totalDamageDealt = 0;
    this.combatDuration = 0;
    this.highestSingleHit = { damage: 0, source: 'None' };

    for (const key in this.categoryStats) {
      this.categoryStats[key].damage = 0;
      this.categoryStats[key].kills = 0;
    }
  }

  /**
   * 记录伤害事件
   */
  recordDamage(sourceType, damage, isKill = false) {
    if (damage <= 0) return;
    this.totalDamageDealt += damage;

    if (damage > this.highestSingleHit.damage) {
      this.highestSingleHit.damage = damage;
      this.highestSingleHit.source = sourceType;
    }

    const cat = this.categoryStats[sourceType];
    if (cat) {
      cat.damage += damage;
      if (isKill) cat.kills++;
    }
  }

  /**
   * 仅记一次击杀归因（用于持续伤害击杀结算，避免重复叠加伤害数值）
   */
  recordKill(sourceType) {
    const cat = this.categoryStats[sourceType];
    if (cat) {
      cat.kills++;
    }
  }

  update(dt) {
    this.combatDuration += dt;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    return this.isOpen;
  }

  /**
   * 绘制顶部战况面板开关按钮
   */
  renderToggleButton(ctx, x, y) {
    this.toggleBtnRect.x = x;
    this.toggleBtnRect.y = y;
    const w = this.toggleBtnRect.w;
    const h = this.toggleBtnRect.h;

    ctx.save();
    ctx.fillStyle = this.isOpen ? 'rgba(38, 92, 18, 0.94)' : 'rgba(28, 20, 12, 0.92)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 12) : ctx.rect(x, y, w, h);
    ctx.fill();

    ctx.strokeStyle = this.isOpen ? '#95DE64' : 'rgba(198, 143, 69, 0.78)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 229, 143, 0.28)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 10) : ctx.rect(x + 2, y + 2, w - 4, h - 4);
    ctx.stroke();

    ctx.fillStyle = this.isOpen ? '#F6FFED' : '#FFE58F';
    ctx.font = 'bold 10.5px "Microsoft YaHei UI", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.isOpen ? '✖ 战报' : '📊 战报', x + w * 0.5, y + h * 0.5);
    ctx.restore();
  }

  /**
   * 渲染弹出的高质感 DPS 战报仪表盘（与全作 9-Slice 古树羊皮纸木框保持完全一致的艺术风格）
   */
  renderAnalyticsDashboard(ctx, ui = null) {
    if (!this.isOpen) return;

    const pw = 540;
    const ph = 368;
    const px = Math.round((960 - pw) * 0.5);
    const py = Math.round((540 - ph) * 0.5);

    ctx.save();
    // 1. 全屏半透明暗林遮罩（严格对齐 960x540 逻辑屏）
    ctx.fillStyle = 'rgba(6, 12, 8, 0.78)';
    ctx.fillRect(0, 0, 960, 540);

    // 2. 使用统一 9-Slice 手绘羊皮纸木框底座
    if (ui && typeof ui.drawWoodlandPanel === 'function') {
      ui.drawWoodlandPanel(ctx, px, py, pw, ph, '#8C5E2A', 0.99, 14, true);
    } else {
      ctx.fillStyle = '#F3E5C8';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(px, py, pw, ph, 14) : ctx.rect(px, py, pw, ph);
      ctx.fill();
      ctx.strokeStyle = '#6B4226';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // 顶部木匾牌标题栏
    if (ui && typeof ui.drawAiFrame === 'function') {
      ui.drawAiFrame(ctx, 'top_bar', px + 88, py - 14, pw - 176, 40, 0.99);
    } else {
      ctx.fillStyle = '#3E2714';
      ctx.fillRect(px + 88, py - 14, pw - 176, 40);
    }
    ctx.fillStyle = '#FFE58F';
    ctx.font = 'bold 16px "Microsoft YaHei UI", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('实时战况与输出统计', px + pw * 0.5, py + 6);

    // 右上角木质关闭按钮 [×]
    const closeX = px + pw - 50;
    const closeY = py + 24;
    if (ui && typeof ui.drawAiFrame === 'function') {
      ui.drawAiFrame(ctx, 'btn_wood', closeX, closeY, 26, 26, 0.98);
    } else {
      ctx.fillStyle = '#5C381C';
      ctx.fillRect(closeX, closeY, 26, 26);
    }
    ctx.fillStyle = '#FFF1B8';
    ctx.font = 'bold 14px "Microsoft YaHei UI", sans-serif';
    ctx.fillText('×', closeX + 13, closeY + 13);

    // 3. 战报总览胶囊栏（严格嵌入羊皮纸安全内框）
    const totalShown = Math.round(this.totalDamageDealt);
    const maxHitShown = Math.round(this.highestSingleHit.damage);
    const dps = this.combatDuration > 0 ? Math.round(this.totalDamageDealt / this.combatDuration) : 0;

    ctx.fillStyle = 'rgba(72, 46, 22, 0.11)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(px + 28, py + 34, pw - 90, 26, 7) : ctx.rect(px + 28, py + 34, pw - 90, 26);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 94, 42, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#3A2312';
    ctx.font = 'bold 11.5px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`总伤：${totalShown.toLocaleString()}   |   全队秒伤：${dps}/秒   |   最高单击：${maxHitShown}`, px + 40, py + 47);

    // 4. 各单元伤害占比横向柱状图
    const sorted = Object.entries(this.categoryStats)
      .map(([k, v]) => ({ key: k, ...v }))
      .sort((a, b) => b.damage - a.damage);

    const maxDmg = Math.max(1, sorted[0].damage);
    const startY = py + 70;
    const rowH = 31;
    const barMaxW = 168;

    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      const ry = startY + i * rowH;

      // 偶数行极淡羊皮纸压纹底带，提升视觉可读性
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(105, 72, 36, 0.06)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(px + 26, ry + 1, pw - 52, rowH - 3, 6) : ctx.rect(px + 26, ry + 1, pw - 52, rowH - 3);
        ctx.fill();
      }

      // 单位小图标
      const ic = item.icon && typeof platform !== 'undefined' ? platform.getImage(item.icon) : null;
      if (ic && ic.width) {
        ctx.drawImage(ic, px + 32, ry + 4, 20, 20);
      }

      // 单位名称（深棕高亮色，确保在羊皮纸上锐利清晰）
      ctx.fillStyle = '#3A2312';
      ctx.font = 'bold 12px "Microsoft YaHei UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}. ${item.name}`, px + 58, ry + 14.5);

      const barX = px + 182;
      const barY = ry + 7.5;
      const dmgRounded = Math.round(item.damage);
      const barW = dmgRounded > 0 ? Math.max(4, Math.round((item.damage / maxDmg) * barMaxW)) : 3;
      const pct = this.totalDamageDealt > 0 ? ((item.damage / this.totalDamageDealt) * 100).toFixed(1) : '0.0';

      ctx.fillStyle = 'rgba(58, 35, 18, 0.14)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(barX, barY, barMaxW, 13, 4) : ctx.rect(barX, barY, barMaxW, 13);
      ctx.fill();

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(barX, barY, barW, 13, 4) : ctx.rect(barX, barY, barW, 13);
      ctx.fill();

      // 数值文本（伤害 + 占比% + 击杀）
      ctx.fillStyle = '#3A2312';
      ctx.font = 'bold 11px "Microsoft YaHei UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${dmgRounded.toLocaleString()} (${pct}%) · ${item.kills} 击杀`, barX + barMaxW + 10, ry + 14.5, (px + pw - 28) - (barX + barMaxW + 10));
    }

    // 5. 底部关闭提示（严密内收木框内部底栏）
    ctx.fillStyle = '#6B4E34';
    ctx.font = '11px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点击任意区域关闭战报面板', px + pw * 0.5, py + ph - 24);

    ctx.restore();
  }

  handleClick(x, y) {
    if (x >= this.toggleBtnRect.x && x <= this.toggleBtnRect.x + this.toggleBtnRect.w &&
        y >= this.toggleBtnRect.y && y <= this.toggleBtnRect.y + this.toggleBtnRect.h) {
      return this.toggle();
    }

    if (this.isOpen) {
      this.isOpen = false;
      return true;
    }
    return false;
  }
}

module.exports = CombatAnalyticsSystem;
