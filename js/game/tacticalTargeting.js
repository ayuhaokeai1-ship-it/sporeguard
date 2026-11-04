/**
 * 战术索敌指令与微操优先级系统 (js/game/tacticalTargeting.js)
 * 深度借鉴 Bloons TD 6 / Kingdom Rush 顶尖战术微操机制：
 * - 5 大战术索敌优先级 (Target Priorities):
 *   1. FIRST (先头) - 优先锁定距离基地终点最近的敌怪，守门核心
 *   2. LAST (殿后) - 优先锁定距离刷怪点最近的敌怪，阻截后队
 *   3. STRONGEST (强敌) - 优先锁定当前生命值最高或精英/首领怪，破甲攻坚
 *   4. WEAKEST (残血) - 优先斩杀生命值最低的濒死怪，快速减员
 *   5. FASTEST (急行) - 优先击杀移动速度最快的跳跃者/突进织网怪，防漏怪
 * - 塔身悬浮 AI 战术微标与交互切换
 * - 键盘快捷键 [Tab] 或 [P] 快速循环当前选中毒菇的战术模式
 */

const CONFIG = require('../data/config');
const platform = require('../core/platform');

const TARGET_MODES = [
  { id: 'first', name: '先头', desc: '优先攻击最靠近终点的敌怪', icon: '🎯', color: '#69C0FF' },
  { id: 'strongest', name: '强敌', desc: '优先攻击血量最高或首领怪', icon: '👑', color: '#FF7A45' },
  { id: 'weakest', name: '残血', desc: '优先斩杀濒死残血敌怪', icon: '🩸', color: '#FF4D4F' },
  { id: 'fastest', name: '急行', desc: '优先截杀高速突进与跳跃怪', icon: '⚡', color: '#FFD666' },
  { id: 'last', name: '殿后', desc: '优先攻击刚入场的后排敌怪', icon: '🛡️', color: '#95DE64' }
];

class TacticalTargetingSystem {
  constructor() {
    this.towerModes = new Map(); // towerUid -> modeId
    this.animTime = 0;
  }

  getMode(towerUid) {
    return this.towerModes.get(towerUid) || 'first';
  }

  setMode(towerUid, modeId) {
    if (TARGET_MODES.some(m => m.id === modeId)) {
      this.towerModes.set(towerUid, modeId);
      return true;
    }
    return false;
  }

  cycleMode(towerUid, fx = null, towerX = 0, towerY = 0) {
    const cur = this.getMode(towerUid);
    const curIdx = TARGET_MODES.findIndex(m => m.id === cur);
    const nextIdx = (curIdx + 1) % TARGET_MODES.length;
    const nextMode = TARGET_MODES[nextIdx];
    this.towerModes.set(towerUid, nextMode.id);

    if (fx && towerX && towerY) {
      fx.spawnFloatingText(towerX, towerY - 34, `${nextMode.icon} 索敌: ${nextMode.name}`, nextMode.color, 0.95);
    }
    platform.playSfx('sfx_click');
    return nextMode;
  }

  update(dt) {
    this.animTime += dt;
  }

  /**
   * 按照战术优先级从候选存活敌怪中精准决出唯一攻击目标
   */
  pickTarget(tower, candidates, map) {
    if (!candidates || candidates.length === 0) return null;
    const mode = this.getMode(tower.uid || `${tower.col}_${tower.row}`);

    if (candidates.length === 1) return candidates[0];

    if (mode === 'strongest') {
      // 优先首领/精英，其次按当前剩余生命值最高
      let best = candidates[0];
      let bestScore = (best.isBoss ? 100000 : 0) + (best.isElite ? 20000 : 0) + best.hp;
      for (let i = 1; i < candidates.length; i++) {
        const c = candidates[i];
        const score = (c.isBoss ? 100000 : 0) + (c.isElite ? 20000 : 0) + c.hp;
        if (score > bestScore) {
          bestScore = score;
          best = c;
        }
      }
      return best;
    }

    if (mode === 'weakest') {
      // 优先当前剩余生命值最低的怪，便于迅速斩杀减员
      let best = candidates[0];
      for (let i = 1; i < candidates.length; i++) {
        if (candidates[i].hp < best.hp) {
          best = candidates[i];
        }
      }
      return best;
    }

    if (mode === 'fastest') {
      // 优先移动速度最快的怪（如野兔、跳跃蛛怪、织网者）
      let best = candidates[0];
      let maxSpd = best.speed || best.def.baseSpeed || 50;
      if (best.isLeaping) maxSpd += 60;
      for (let i = 1; i < candidates.length; i++) {
        const c = candidates[i];
        let spd = c.speed || c.def.baseSpeed || 50;
        if (c.isLeaping) spd += 60;
        if (spd > maxSpd) {
          maxSpd = spd;
          best = c;
        }
      }
      return best;
    }

    if (mode === 'last') {
      // 离起点最近（路程进度最小）
      let best = candidates[0];
      let minProg = best.pathIndex !== undefined ? (best.pathIndex + (best.segmentProgress || 0)) : (best.totalDistanceTraveled || 0);
      for (let i = 1; i < candidates.length; i++) {
        const c = candidates[i];
        const prog = c.pathIndex !== undefined ? (c.pathIndex + (c.segmentProgress || 0)) : (c.totalDistanceTraveled || 0);
        if (prog < minProg) {
          minProg = prog;
          best = c;
        }
      }
      return best;
    }

    // 默认: 'first' (最靠近终点，路程进度最大)
    let best = candidates[0];
    let maxProg = best.pathIndex !== undefined ? (best.pathIndex + (best.segmentProgress || 0)) : (best.totalDistanceTraveled || 0);
    for (let i = 1; i < candidates.length; i++) {
      const c = candidates[i];
      const prog = c.pathIndex !== undefined ? (c.pathIndex + (c.segmentProgress || 0)) : (c.totalDistanceTraveled || 0);
      if (prog > maxProg) {
        maxProg = prog;
        best = c;
      }
    }
    return best;
  }

  /**
   * 绘制选中毒菇上方的战术指令微标与交互按钮
   */
  renderSelectedTacticalBadge(ctx, tower, isHovered = false) {
    if (!tower) return;
    const modeId = this.getMode(tower.uid || `${tower.col}_${tower.row}`);
    const mode = TARGET_MODES.find(m => m.id === modeId) || TARGET_MODES[0];

    const cx = tower.x;
    const cy = tower.y - 28;
    const pulse = 0.9 + Math.sin(this.animTime * 6) * 0.1;

    ctx.save();
    // 1. 战术底座微框
    const bw = 58;
    const bh = 18;
    const bx = cx - bw * 0.5;
    const by = cy - bh * 0.5;

    ctx.fillStyle = 'rgba(18, 12, 6, 0.90)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 6) : ctx.rect(bx, by, bw, bh);
    ctx.fill();

    ctx.strokeStyle = mode.color;
    ctx.lineWidth = isHovered ? 2.0 : 1.2;
    ctx.stroke();

    // 2. 战术模式图标与文字
    ctx.font = 'bold 10px "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = mode.color;
    ctx.fillText(`${mode.icon} ${mode.name}`, cx, cy);

    // 3. 悬停或交互提示光标
    if (isHovered) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px sans-serif';
      ctx.fillText('点击切换', cx, cy - 14);
    }
    ctx.restore();
  }
}

module.exports = {
  TacticalTargetingSystem,
  TARGET_MODES
};
