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

    this.toggleBtnRect = { x: 880, y: 16, w: 76, h: 26 };
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
    ctx.fillStyle = this.isOpen ? 'rgba(82, 196, 26, 0.88)' : 'rgba(25, 36, 28, 0.82)';
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
    ctx.fillText(this.isOpen ? '✖ 关闭战报' : '📊 战况DPS', x + this.toggleBtnRect.w * 0.5, y + this.toggleBtnRect.h * 0.5);
    ctx.restore();
  }

  /**
   * 渲染弹出的高质感 DPS 战报仪表盘
   */
  renderAnalyticsDashboard(ctx) {
    if (!this.isOpen) return;

    const pw = 420;
    const ph = 330;
    const px = Math.round((960 - pw) * 0.5);
    const py = Math.round((640 - ph) * 0.5);

    ctx.save();
    // 1. 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, 960, 640);

    // 2. 羊皮纸/深林木纹底框
    ctx.fillStyle = 'rgba(20, 28, 22, 0.95)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(px, py, pw, ph, 12) : ctx.rect(px, py, pw, ph);
    ctx.fill();

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // 3. 标题与总览
    ctx.fillStyle = '#FFE58F';
    ctx.font = 'bold 15px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📊 实时战斗输出统计与DPS战报', px + 18, py + 26);

    const dps = this.combatDuration > 0 ? Math.round(this.totalDamageDealt / this.combatDuration) : 0;
    ctx.fillStyle = '#D9D9D9';
    ctx.font = '11px "Microsoft YaHei UI", sans-serif';
    ctx.fillText(`战斗总伤: ${this.totalDamageDealt.toLocaleString()}  |  全队DPS: ${dps}/s  |  单发最高: ${this.highestSingleHit.damage}`, px + 18, py + 48);

    // 4. 各单元伤害占比横向柱状图
    const sorted = Object.entries(this.categoryStats)
      .map(([k, v]) => ({ key: k, ...v }))
      .sort((a, b) => b.damage - a.damage);

    const maxDmg = Math.max(1, sorted[0].damage);
    const startY = py + 72;
    const rowH = 28;
    const barMaxW = 180;

    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      const ry = startY + i * rowH;

      // 单位名称与击杀数
      ctx.fillStyle = item.color;
      ctx.font = 'bold 12px "Microsoft YaHei UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}. ${item.name}`, px + 18, ry + 14);

      // 柱状图外框与进度
      const barX = px + 130;
      const barY = ry + 4;
      const barW = Math.max(2, Math.round((item.damage / maxDmg) * barMaxW));
      const pct = this.totalDamageDealt > 0 ? ((item.damage / this.totalDamageDealt) * 100).toFixed(1) : '0.0';

      // 槽位底色
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(barX, barY, barMaxW, 14);

      // 伤害条
      ctx.fillStyle = item.color;
      ctx.fillRect(barX, barY, barW, 14);

      // 数值文本 (伤害 + 占比%)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.damage.toLocaleString()} (${pct}%)  [${item.kills}杀]`, barX + barMaxW + 8, ry + 14);
    }

    // 5. 底部关闭说明
    ctx.fillStyle = '#8C8C8C';
    ctx.font = '11px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点击任意区域或右上角按钮关闭战报面板', px + pw * 0.5, py + ph - 14);

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
