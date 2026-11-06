/**
 * 目标指示器 (js/game/tacticalTargetingAI.js)
 * 选中蘑菇时，在其当前锁定的敌人脚下绘制准星，并以细虚线连接，
 * 让玩家直观看到「索敌」优先级的实际效果。
 * 索敌逻辑本身由 TowerManager.selectTarget 负责，此处只负责显示。
 */

class TacticalTargetingAI {
  constructor() {
    this.animTimer = 0;
  }

  update(dt) {
    this.animTimer += dt;
  }

  /**
   * 在地图坐标系内绘制。target 为 null 时不绘制。
   */
  renderTargetHighlight(ctx, tower, target) {
    if (!tower || !target || target.state === 'death' || target.hp <= 0) return;

    ctx.save();
    const pulse = 1.0 + Math.sin(this.animTimer * 8) * 0.08;
    const color = '#FFE58F';

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.4;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -Math.round((this.animTimer * 24) % 8);
    ctx.beginPath();
    ctx.moveTo(tower.x, tower.y - 12);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.translate(target.x, target.y + 4);
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    const mk = 13;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-mk, 0); ctx.lineTo(-mk + 5, 0);
    ctx.moveTo(mk, 0); ctx.lineTo(mk - 5, 0);
    ctx.moveTo(0, -mk * 0.6); ctx.lineTo(0, -mk * 0.6 + 3);
    ctx.moveTo(0, mk * 0.6); ctx.lineTo(0, mk * 0.6 - 3);
    ctx.stroke();
    ctx.restore();
  }
}

module.exports = {
  TacticalTargetingAI
};
