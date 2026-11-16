/**
 * 目标指示器 (js/game/tacticalTargetingAI.js)
 * 选中蘑菇时，在其当前锁定的敌人脚下绘制准星，并以细虚线连接，
 * 让玩家直观看到「索敌」优先级的实际效果。
 * 索敌逻辑本身由 TowerManager.selectTarget 负责，此处只负责显示。
 */

const platform = require('../core/platform');

class TacticalTargetingAI {
  constructor() {
    this.animTimer = 0;
  }

  update(dt) {
    this.animTimer += dt;
  }

  /**
   * 在地图坐标系内绘制 100% AI 手绘德鲁伊索敌法阵准星。target 为 null 时不绘制。
   */
  renderTargetHighlight(ctx, tower, target) {
    if (!tower || !target || target.state === 'death' || target.hp <= 0) return;

    ctx.save();
    const pulse = 1.0 + Math.sin(this.animTimer * 6.5) * 0.07;

    // 柔和灵光连线
    ctx.strokeStyle = 'rgba(255, 229, 143, 0.36)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 5]);
    ctx.lineDashOffset = -Math.round((this.animTimer * 24) % 9);
    ctx.beginPath();
    ctx.moveTo(tower.x, tower.y - 12);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const lockImg = platform.getImage('assets/vfx/vfx_target_lock.png');
    if (lockImg && lockImg.width) {
      ctx.translate(target.x, target.y + 4);
      ctx.scale(pulse, pulse * 0.72);
      ctx.rotate(this.animTimer * 1.1);
      ctx.globalAlpha = 0.88;
      ctx.drawImage(lockImg, -19, -19, 38, 38);
      platform.recordDrawCall(1);
    }
    ctx.restore();
  }
}

module.exports = {
  TacticalTargetingAI
};
