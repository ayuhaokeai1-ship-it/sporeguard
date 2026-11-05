/**
 * 首领过载与多阶段战役引擎 (js/game/bossOverdriveEngine.js)
 * 深度汲取《王国保卫战》(Kingdom Rush) 首领战精髓
 * 提供首领护甲蜕壳、狂暴冲锋、全场践踏晕眩与绝境地穴援军召唤机制
 * 附带顶部史诗级分段 Boss 血条与狂暴阶段视觉光环
 */

class BossOverdriveEngine {
  constructor() {
    this.activeBoss = null;
    this.phase = 1; // 1: 坚韧重甲态, 2: 狂暴过载态, 3: 绝境召唤态
    this.maxHp = 0;
    this.currentHp = 0;
    this.enragedTimer = 0;
    this.stompCooldown = 8.0;
    this.summonCooldown = 12.0;
    this.overdriveAuraAnim = 0;
  }

  registerBoss(bossEnemy) {
    if (!bossEnemy) return;
    this.activeBoss = bossEnemy;
    this.phase = 1;
    this.maxHp = bossEnemy.maxHp || bossEnemy.hp || 1000;
    this.currentHp = bossEnemy.hp || this.maxHp;
    this.enragedTimer = 0;
    this.stompCooldown = 6.0;
    this.summonCooldown = 10.0;
  }

  clear() {
    this.activeBoss = null;
    this.phase = 1;
    this.currentHp = 0;
  }

  reset() {
    this.clear();
  }

  update(dt, scene) {
    if (!this.activeBoss || this.activeBoss.state === 'death' || this.activeBoss.hp <= 0) {
      this.activeBoss = null;
      return;
    }

    this.overdriveAuraAnim += dt;
    this.currentHp = this.activeBoss.hp;
    const hpRatio = this.currentHp / this.maxHp;

    // 1. 阶段检查与蜕变
    if (this.phase === 1 && hpRatio <= 0.60) {
      // 触发二阶段：狂暴过载 (Carapace Shed & Enraged Overdrive)
      this.phase = 2;
      this.triggerPhase2Transition(scene);
    } else if (this.phase === 2 && hpRatio <= 0.25) {
      // 触发三阶段：绝境召唤 (Desperation Swarm)
      this.phase = 3;
      this.triggerPhase3Transition(scene);
    }

    // 2. 二阶段狂暴践踏技能
    if (this.phase >= 2) {
      this.stompCooldown -= dt;
      if (this.stompCooldown <= 0) {
        this.stompCooldown = 7.5;
        this.executeEarthStomp(scene);
      }
    }

    // 3. 三阶段地穴援军召唤技能
    if (this.phase >= 3) {
      this.summonCooldown -= dt;
      if (this.summonCooldown <= 0) {
        this.summonCooldown = 11.0;
        this.executeSubterraneanSummon(scene);
      }
    }
  }

  triggerPhase2Transition(scene) {
    if (!scene || !this.activeBoss) return;
    // 移速提升 +40%，全身赤红过载
    this.activeBoss.speed = (this.activeBoss.speed || 1.0) * 1.35;
    this.activeBoss.isEnraged = true;

    if (scene.fx) {
      scene.fx.triggerScreenShake(7.5, 0.65);
      scene.fx.showBanner('🔥 首领狂暴过载！蜕壳暴走！', '#FF4D4F', '全场守卫小心践踏！', 2.8);
      scene.fx.spawnParticles(this.activeBoss.x, this.activeBoss.y, 45, ['#FF4D4F', '#FFA39E', '#D4380D', '#FFD666'], 60, 160, 0.4, 0.85, 6);
    }
  }

  triggerPhase3Transition(scene) {
    if (!scene || !this.activeBoss) return;
    this.activeBoss.speed = (this.activeBoss.speed || 1.0) * 1.25;

    if (scene.fx) {
      scene.fx.triggerScreenShake(9.0, 0.8);
      scene.fx.showBanner('⚡ 首领绝境濒死！呼唤地穴援军！', '#722ED1', '侧翼地穴隧道已开启！', 3.0);
      scene.fx.spawnParticles(this.activeBoss.x, this.activeBoss.y, 55, ['#722ED1', '#B37FEB', '#FF4D4F', '#FFE58F'], 80, 200, 0.5, 1.0, 6.5);
    }
    this.executeSubterraneanSummon(scene);
  }

  /**
   * 首领践踏技能：震击全场地面，使周围防御塔短暂短路眩晕 1.5 秒
   */
  executeEarthStomp(scene) {
    if (!scene || !this.activeBoss) return;
    const bx = this.activeBoss.x;
    const by = this.activeBoss.y;

    if (scene.fx) {
      scene.fx.triggerScreenShake(5.0, 0.35);
      scene.fx.spawnParticles(bx, by, 30, ['#8C6842', '#D4B106', '#5C4028'], 40, 120, 0.3, 0.6, 4.5);
      scene.fx.spawnFloatingText(bx, by - 24, '⚡ 撼地践踏!', '#FF7875', 1.25);
    }

    // 附近的防御塔进入短暂 1.2 秒休眠状态
    if (scene.towerManager && scene.towerManager.towers) {
      for (let i = 0; i < scene.towerManager.towers.length; i++) {
        const tw = scene.towerManager.towers[i];
        if (Math.hypot(tw.x - bx, tw.y - by) <= 160) {
          tw.stunTimer = 1.2;
          if (scene.fx) {
            scene.fx.spawnFloatingText(tw.x, tw.y - 16, '💤 眩晕', '#FFD591', 0.9);
          }
        }
      }
    }
  }

  /**
   * 绝境召唤：从地图次级出生点召唤 4 只迅捷跳跃甲虫
   */
  executeSubterraneanSummon(scene) {
    if (!scene || !scene.enemyManager || !scene.map) return;
    const map = scene.map;
    const spawnPt = (map.mapData && map.mapData.spawnTile2) || [18, 2];
    const sx = (spawnPt[0] + 0.5) * 32;
    const sy = (spawnPt[1] + 0.5) * 32;

    if (scene.fx) {
      scene.fx.spawnParticles(sx, sy, 25, ['#722ED1', '#52C41A', '#FFD700'], 35, 90, 0.3, 0.6, 4.0);
      scene.fx.spawnFloatingText(sx, sy - 18, '🕳️ 地穴裂隙援军涌出!', '#B37FEB', 1.2);
    }

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (scene && scene.enemyManager) {
          scene.enemyManager.spawnEnemy('swift', map, i % 2);
        }
      }, i * 350);
    }
  }

  /**
   * 渲染首领身下战术过载光环与顶部史诗级 Boss 血条
   */
  renderBossHud(ctx) {
    if (!this.activeBoss || this.activeBoss.state === 'death' || this.activeBoss.hp <= 0) return;

    ctx.save();

    // 1. 首领脚下多层流光过载阵法
    const bx = this.activeBoss.x;
    const by = this.activeBoss.y;
    const auraColor = this.phase === 3 ? '#B37FEB' : (this.phase === 2 ? '#FF4D4F' : '#FFA940');
    const pulse = 1.0 + Math.sin(this.overdriveAuraAnim * 8) * 0.15;

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(pulse, pulse * 0.7);
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 2.0;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(this.overdriveAuraAnim * 2.0);
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 16, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. 屏幕顶部史诗级分段 Boss 血条 (Epic Segmented Boss Bar)
    const barW = 380;
    const barH = 18;
    const barX = (960 - barW) * 0.5;
    const barY = 46;
    const hpRatio = Math.max(0, Math.min(1.0, this.currentHp / this.maxHp));

    // 血条底座背框
    ctx.fillStyle = 'rgba(18, 12, 8, 0.94)';
    ctx.strokeStyle = '#D4B106';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX - 4, barY - 18, barW + 8, barH + 24, 8) : ctx.rect(barX - 4, barY - 18, barW + 8, barH + 24);
    ctx.fill();
    ctx.stroke();

    // 首领名称与阶段标识
    const bossName = this.activeBoss.name || '远古腐化甲虫皇';
    const phaseLabel = this.phase === 3 ? '【阶段 III: 绝境狂暴】' : (this.phase === 2 ? '【阶段 II: 蜕壳暴走】' : '【阶段 I: 巨壳护体】');

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = auraColor;
    ctx.textAlign = 'left';
    ctx.fillText(`👑 ${bossName} ${phaseLabel}`, barX + 6, barY - 4);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFE58F';
    ctx.fillText(`${Math.ceil(this.currentHp)} / ${this.maxHp}`, barX + barW - 6, barY - 4);

    // 内部血条充能槽
    ctx.fillStyle = 'rgba(40, 20, 15, 0.85)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX, barY, barW, barH, 4) : ctx.rect(barX, barY, barW, barH);
    ctx.fill();

    // 动态多段渐变血条
    ctx.fillStyle = this.phase === 3 ? 'linear-gradient(to right, #722ED1, #F5222D)' : (this.phase === 2 ? '#F5222D' : '#FA8C16');
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX, barY, barW * hpRatio, barH, 4) : ctx.rect(barX, barY, barW * hpRatio, barH);
    ctx.fill();

    // 阶段分段刻度线 (60% 和 25% 处设金刻度线)
    ctx.strokeStyle = '#FFE58F';
    ctx.lineWidth = 1.5;
    [0.60, 0.25].forEach(thresh => {
      const tx = barX + barW * thresh;
      ctx.beginPath();
      ctx.moveTo(tx, barY);
      ctx.lineTo(tx, barY + barH);
      ctx.stroke();
    });

    ctx.restore();
  }
}

module.exports = BossOverdriveEngine;
