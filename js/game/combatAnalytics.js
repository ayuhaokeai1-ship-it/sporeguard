/**
 * Sporeguard - 实时战斗DPS与战报分析面板 (Real-time Combat Analytics & DPS Meter)
 * 参考魔兽世界 Details! / 刀塔自走棋战力统计 / Kingdom Rush 战后统计
 * 实时监测：各类防御塔伤害输出、英雄微操输出、元素反应爆轰贡献、击杀榜与DPS柱状图
 */

class CombatAnalyticsSystem {
  constructor() {
    this.isOpen = false;
    this.totalDamageDealt = 0;
    this.combatDuration = 0;
    this.highestSingleHit = { damage: 0, source: 'None' };

    // 各作战单元数据
    this.categoryStats = {
      watch: { name: '瞭望箭菇', damage: 0, kills: 0, color: '#69C0FF', icon: 'assets/vfx/proj_watch_arrow.png' },
      burst: { name: '爆裂重炮', damage: 0, kills: 0, color: '#FF7A45', icon: 'assets/vfx/proj_burst_shell.png' },
      thorn: { name: '刺棘地刺', damage: 0, kills: 0, color: '#95DE64', icon: 'assets/vfx/vfx_spikes.png' },
      mist: { name: '迷雾孢子', damage: 0, kills: 0, color: '#B37FEB', icon: 'assets/vfx/vfx_mist.png' },
      lumina: { name: '日曜金菇', damage: 0, kills: 0, color: '#FFD666', icon: 'assets/vfx/item_golden_spore.png' },
      hero: { name: '橡木守护者', damage: 0, kills: 0, color: '#52C41A', icon: 'assets/vfx/hero_oak.png' },
      sporelings: { name: '孢子近卫军', damage: 0, kills: 0, color: '#A0D911', icon: 'assets/vfx/sporeling_guard.png' },
      reactions: { name: '自然元素反应', damage: 0, kills: 0, color: '#FF4D4F', icon: 'assets/vfx/vfx_hit_spark.png' }
    };

    this.toggleBtnRect = { x: 598, y: 12, w: 58, h: 32 };
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

    ctx.save();
    ctx.fillStyle = this.isOpen ? 'rgba(82, 196, 26, 0.88)' : 'rgba(25, 36, 28, 0.88)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, this.toggleBtnRect.w, this.toggleBtnRect.h, 6) : ctx.rect(x, y, this.toggleBtnRect.w, this.toggleBtnRect.h);
    ctx.fill();

    ctx.strokeStyle = this.isOpen ? '#B7EB8F' : '#875C39';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.isOpen ? '✖ 关闭' : '📊 战报', x + this.toggleBtnRect.w * 0.5, y + this.toggleBtnRect.h * 0.5);
    ctx.restore();
  }

  /**
   * 渲染弹出的高质感 DPS 战报仪表盘
   */
  renderAnalyticsDashboard(ctx) {
    if (!this.isOpen) return;

    const pw = 476;
    const ph = 336;
    const px = Math.round((960 - pw) * 0.5);
    const py = Math.round((540 - ph) * 0.5);

    ctx.save();
    // 1. 全屏半透明暗林遮罩（严格对齐 960x540 逻辑屏）
    ctx.fillStyle = 'rgba(6, 12, 8, 0.76)';
    ctx.fillRect(0, 0, 960, 540);

    // 2. 深木黄铜边框战报面板
    ctx.fillStyle = 'rgba(22, 16, 11, 0.96)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(px, py, pw, ph, 12) : ctx.rect(px, py, pw, ph);
    ctx.fill();

    ctx.strokeStyle = '#C68F45';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // 右上角关闭按钮 [×]（严密内收 14px 安全边距）
    const closeX = px + pw - 38;
    const closeY = py + 14;
    ctx.fillStyle = 'rgba(64, 38, 20, 0.92)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(closeX, closeY, 24, 24, 5) : ctx.rect(closeX, closeY, 24, 24);
    ctx.fill();
    ctx.strokeStyle = '#E6BB60';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#FFF1B8';
    ctx.font = 'bold 14px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeX + 12, closeY + 12);

    // 3. 标题与总览（纯中文无英文混杂）
    ctx.fillStyle = '#FFE58F';
    ctx.font = 'bold 15px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('实时战况与输出统计', px + 22, py + 26);

    const dps = this.combatDuration > 0 ? Math.round(this.totalDamageDealt / this.combatDuration) : 0;
    ctx.fillStyle = '#E8D8B8';
    ctx.font = '11.5px "Microsoft YaHei UI", sans-serif';
    ctx.fillText(`总伤：${this.totalDamageDealt.toLocaleString()}   |   全队秒伤：${dps}/秒   |   最高单击：${this.highestSingleHit.damage}`, px + 22, py + 49);

    // 4. 各单元伤害占比横向柱状图
    const sorted = Object.entries(this.categoryStats)
      .map(([k, v]) => ({ key: k, ...v }))
      .sort((a, b) => b.damage - a.damage);

    const maxDmg = Math.max(1, sorted[0].damage);
    const startY = py + 72;
    const rowH = 29;
    const barMaxW = 172;

    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      const ry = startY + i * rowH;

      // 单位名称
      ctx.fillStyle = item.color;
      ctx.font = 'bold 12px "Microsoft YaHei UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}. ${item.name}`, px + 22, ry + 13);

      // 槽位底色
      const barX = px + 138;
      const barY = ry + 6;
      const barW = Math.max(3, Math.round((item.damage / maxDmg) * barMaxW));
      const pct = this.totalDamageDealt > 0 ? ((item.damage / this.totalDamageDealt) * 100).toFixed(1) : '0.0';

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(barX, barY, barMaxW, 13, 4) : ctx.rect(barX, barY, barMaxW, 13);
      ctx.fill();

      // 伤害条
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(barX, barY, barW, 13, 4) : ctx.rect(barX, barY, barW, 13);
      ctx.fill();

      // 数值文本 (伤害 + 占比% + 击杀，右侧留足呼吸边距)
      ctx.fillStyle = '#FFFDF5';
      ctx.font = 'bold 10.5px "Microsoft YaHei UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.damage.toLocaleString()} (${pct}%) · ${item.kills} 击杀`, barX + barMaxW + 10, ry + 13, pw - 22 - (barX + barMaxW + 10 - px));
    }

    // 5. 底部关闭说明
    ctx.fillStyle = '#B8A88A';
    ctx.font = '11px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点击任意区域关闭战报面板', px + pw * 0.5, py + ph - 16);

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
