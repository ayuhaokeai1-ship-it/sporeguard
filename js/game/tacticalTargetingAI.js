/**
 * 战术索敌与集火控制引擎 (js/game/tacticalTargetingAI.js)
 * 深度汲取 Bloons TD6 与 Kingdom Rush 战术策略精髓
 * 提供五大核心索敌模式：首位、末位、强敌、极速、就近，并提供集火指示
 */

const TARGET_MODES = {
  FIRST: { id: 'FIRST', name: '首位先锋', icon: '🎯', desc: '锁定行进路程最远、最接近基地的敌人', color: '#52C41A' },
  STRONG: { id: 'STRONG', name: '致命强敌', icon: '👑', desc: '优先集火生命值最高者、精英首领与攻城巨虫', color: '#FF4D4F' },
  FAST: { id: 'FAST', name: '疾行截击', icon: '⚡', desc: '优先狙杀移动速度极快的迅捷虫与跃击潜行者', color: '#FAAD14' },
  CLOSE: { id: 'CLOSE', name: '贴身护卫', icon: '📍', desc: '优先打击与守卫距离最近的敌人，确保安全防线', color: '#1890FF' },
  LAST: { id: 'LAST', name: '殿后拦截', icon: '🛡️', desc: '锁定刚刚踏入林区的后排敌人，遏制后续援军', color: '#722ED1' }
};

const MODE_ORDER = ['FIRST', 'STRONG', 'FAST', 'CLOSE', 'LAST'];

class TacticalTargetingAI {
  constructor() {
    this.towerModes = {}; // tower.id -> mode string
    this.animTimer = 0;
  }

  getMode(tower) {
    if (!tower) return TARGET_MODES.FIRST;
    const modeKey = this.towerModes[tower.id] || tower.targetingMode || 'FIRST';
    return TARGET_MODES[modeKey] || TARGET_MODES.FIRST;
  }

  cycleMode(tower) {
    if (!tower) return TARGET_MODES.FIRST;
    const curKey = (this.towerModes[tower.id] || tower.targetingMode || 'FIRST');
    const idx = MODE_ORDER.indexOf(curKey);
    const nextKey = MODE_ORDER[(idx + 1) % MODE_ORDER.length];
    this.towerModes[tower.id] = nextKey;
    tower.targetingMode = nextKey;
    return TARGET_MODES[nextKey];
  }

  setMode(tower, modeKey) {
    if (!tower || !TARGET_MODES[modeKey]) return;
    this.towerModes[tower.id] = modeKey;
    tower.targetingMode = modeKey;
  }

  /**
   * 根据当前战术模式，从候选敌人列表中精准挑选最优目标
   */
  pickTarget(tower, candidates, map) {
    return this.selectBestTarget(tower, candidates, map);
  }

  selectBestTarget(tower, candidates, map) {
    if (!candidates || candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    const modeKey = (this.towerModes[tower.id] || tower.targetingMode || 'FIRST');

    switch (modeKey) {
      case 'STRONG': {
        // 优先集火当前最大血量 / 剩余生命值最高者（Boss/攻城巨虫优先）
        let best = candidates[0];
        let maxHp = best.hp || 1;
        if (best.isBoss) maxHp += 50000;
        if (best.type === 'siege') maxHp += 10000;

        for (let i = 1; i < candidates.length; i++) {
          const em = candidates[i];
          let score = em.hp || 1;
          if (em.isBoss) score += 50000;
          if (em.type === 'siege') score += 10000;
          if (score > maxHp) {
            maxHp = score;
            best = em;
          }
        }
        return best;
      }

      case 'FAST': {
        // 优先拦截疾速型敌兵（飞蛾、跃击者、迅捷甲虫）
        let best = candidates[0];
        let maxSpeed = best.speed || 1;
        for (let i = 1; i < candidates.length; i++) {
          const em = candidates[i];
          const spd = (em.speed || 1) * (em.isFlying ? 1.5 : (em.type === 'leaper' ? 1.4 : 1.0));
          if (spd > maxSpeed) {
            maxSpeed = spd;
            best = em;
          }
        }
        return best;
      }

      case 'CLOSE': {
        // 优先打击离守卫几何距离最近的敌人
        let best = candidates[0];
        let minDistSq = Math.hypot(best.x - tower.x, best.y - tower.y);
        for (let i = 1; i < candidates.length; i++) {
          const em = candidates[i];
          const dist = Math.hypot(em.x - tower.x, em.y - tower.y);
          if (dist < minDistSq) {
            minDistSq = dist;
            best = em;
          }
        }
        return best;
      }

      case 'LAST': {
        // 优先锁定行进距离最短的敌人（殿后截击）
        let best = candidates[0];
        let minDist = best.distPx || 0;
        for (let i = 1; i < candidates.length; i++) {
          const em = candidates[i];
          if ((em.distPx || 0) < minDist) {
            minDist = em.distPx || 0;
            best = em;
          }
        }
        return best;
      }

      case 'FIRST':
      default: {
        // 默认首位先锋：锁定最接近基地的敌人（行进路程最远）
        let best = candidates[0];
        let maxDist = best.distPx || 0;
        for (let i = 1; i < candidates.length; i++) {
          const em = candidates[i];
          if ((em.distPx || 0) > maxDist) {
            maxDist = em.distPx || 0;
            best = em;
          }
        }
        return best;
      }
    }
  }

  update(dt) {
    this.animTimer += dt;
  }

  /**
   * 绘制当前选中守卫正在集火的目标光环与索敌射线
   */
  renderTargetHighlight(ctx, selectedTower, map, enemyManager) {
    if (!selectedTower || !enemyManager) return;
    const candidates = enemyManager.getAliveEnemies().filter(em => {
      if (em.state === 'death' || em.hp <= 0) return false;
      const d = Math.hypot(em.x - selectedTower.x, em.y - selectedTower.y);
      return d <= selectedTower.range;
    });

    if (candidates.length === 0) return;
    const target = this.selectBestTarget(selectedTower, candidates, map);
    if (!target) return;

    ctx.save();
    const mode = this.getMode(selectedTower);
    const pulse = 1.0 + Math.sin(this.animTimer * 10) * 0.12;

    // 1. 守卫至目标之间的幽光微导引线
    ctx.strokeStyle = mode.color;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.35 + Math.sin(this.animTimer * 8) * 0.15;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -Math.round((this.animTimer * 24) % 8);
    ctx.beginPath();
    ctx.moveTo(selectedTower.x, selectedTower.y - 12);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. 目标脚下的战术聚焦光环
    ctx.translate(target.x, target.y);
    ctx.scale(pulse, pulse);
    ctx.strokeStyle = mode.color;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.85;

    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 战术准星四角羽标
    const mk = 14;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-mk, 0); ctx.lineTo(-mk + 4, 0);
    ctx.moveTo(mk, 0); ctx.lineTo(mk - 4, 0);
    ctx.moveTo(0, -mk * 0.65); ctx.lineTo(0, -mk * 0.65 + 3);
    ctx.moveTo(0, mk * 0.65); ctx.lineTo(0, mk * 0.65 - 3);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 绘制守卫检查面板 (Inspector) 中的索敌切换按钮
   */
  renderInspectorTargetingBadge(ctx, tower, bx, by, bw, bh, ui) {
    if (!tower) return;
    const mode = this.getMode(tower);

    ctx.save();
    // 按钮背景
    ctx.fillStyle = 'rgba(26, 18, 14, 0.92)';
    ctx.strokeStyle = mode.color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 6) : ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.stroke();

    // 图标与标题
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(mode.icon, bx + 8, by + bh * 0.5);

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = mode.color;
    ctx.fillText(mode.name, bx + 28, by + bh * 0.5 - 5);

    ctx.font = '9.5px sans-serif';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('点击切换索敌偏好', bx + 28, by + bh * 0.5 + 7);

    // 切换按钮注册
    if (ui) {
      ui.registerButton('tower_target_mode_' + tower.id, bx, by, bw, bh, () => {
        this.cycleMode(tower);
      });
    }

    ctx.restore();
  }
}

module.exports = {
  TacticalTargetingAI,
  TARGET_MODES
};
