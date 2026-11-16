/**
 * 首领过载与多阶段战役引擎 (js/game/bossOverdriveEngine.js)
 * 深度汲取《王国保卫战》(Kingdom Rush) 首领战精髓
 * 提供首领护甲蜕壳、狂暴冲锋、全场践踏晕眩与绝境地穴援军召唤机制
 * 附带顶部史诗级分段 Boss 血条与狂暴阶段视觉光环
 */

const platform = require('../core/platform');
const i18n = require('../i18n');
const UI_FONT = '"PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", sans-serif';

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
    this.pendingSpawns = [];
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
    if (typeof platform !== 'undefined' && typeof platform.playSfx === 'function') {
      platform.playSfx('sfx_boss_horn');
    }
  }

  clear() {
    this.pendingSpawns = [];
    this.activeBoss = null;
    this.phase = 1;
    this.currentHp = 0;
  }

  reset() {
    this.clear();
  }

  update(dt, scene) {
    if (this.pendingSpawns && this.pendingSpawns.length > 0 && scene && scene.state === 'BATTLE') {
      for (let i = this.pendingSpawns.length - 1; i >= 0; i--) {
        const ps = this.pendingSpawns[i];
        ps.delay -= dt;
        if (ps.delay <= 0) {
          this.pendingSpawns.splice(i, 1);
          if (scene.enemyManager && scene.map) scene.enemyManager.spawnEnemy(ps.type, scene.map, ps.waveIdx);
        }
      }
    }
    if (!this.activeBoss || this.activeBoss.state === 'death' || this.activeBoss.hp <= 0) {
      this.activeBoss = null;
      return;
    }

    this.overdriveAuraAnim += dt;
    this.maxHp = Math.max(1, this.activeBoss.maxHp || this.maxHp || 1);
    this.currentHp = Math.max(0, this.activeBoss.hp);
    const hpRatio = Math.min(1.0, this.currentHp / this.maxHp);

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

    // 2. 二阶段狂暴践踏技能（仅陆地重甲首领发动撼地践踏；空中蛾后专注毒粉狂暴）
    if (this.phase >= 2 && !this.activeBoss.isFlying) {
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

    const waveIdx = (scene.waveManager && scene.waveManager.currentWaveIndex) || 1;
    for (let i = 0; i < 3; i++) {
      this.pendingSpawns.push({ delay: i * 0.35, type: 'swift', waveIdx });
    }
  }

  /**
   * 渲染首领身下战术过载光环与顶部史诗级 Boss 血条
   */
  /**
   * 首领脚下过载光环（须在地图坐标系内调用）
   */
  renderBossAura(ctx) {
    if (!this.activeBoss || this.activeBoss.state === 'death' || this.activeBoss.hp <= 0) return;
    const bx = this.activeBoss.x;
    const by = this.activeBoss.y;
    const auraImg = platform.getImage(this.phase >= 2 ? 'assets/vfx/range_bramble_red.png' : 'assets/vfx/range_sunburst_gold.png');
    const pulse = 1.0 + Math.sin(this.overdriveAuraAnim * 5) * 0.08;
    ctx.save();
    ctx.translate(Math.round(bx), Math.round(by + 10));
    ctx.scale(pulse, pulse * 0.65);
    const gCol = this.phase === 3 ? 'rgba(179, 127, 235,' : (this.phase === 2 ? 'rgba(255, 77, 79,' : 'rgba(255, 169, 64,');
    const rg = ctx.createRadialGradient(0, 0, 6, 0, 0, 34);
    rg.addColorStop(0, gCol + ' 0.34)');
    rg.addColorStop(0.6, gCol + ' 0.14)');
    rg.addColorStop(1, gCol + ' 0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    if (auraImg && auraImg.width) {
      ctx.rotate(this.overdriveAuraAnim * 1.1);
      ctx.globalAlpha = 0.58;
      ctx.drawImage(auraImg, -30, -30, 60, 60);
    }
    ctx.restore();
  }

  /**
   * 屏幕顶部分段首领血条（屏幕坐标）
   */
  renderBossHud(ctx) {
    if (!this.activeBoss || this.activeBoss.state === 'death' || this.activeBoss.hp <= 0) return;
    const auraColor = this.phase === 3 ? '#D3ADF7' : (this.phase === 2 ? '#FF7875' : '#FFC069');
    ctx.save();

    const safeMaxHp = Math.max(1, this.activeBoss.maxHp || this.maxHp || 1);
    const safeCurHp = Math.max(0, this.activeBoss.hp !== undefined ? this.activeBoss.hp : this.currentHp);
    const hpRatio = Math.max(0, Math.min(1.0, safeCurHp / safeMaxHp));

    const bossName = (this.activeBoss.def && this.activeBoss.def.nameKey)
      ? i18n.t(this.activeBoss.def.nameKey)
      : (this.activeBoss.name || '林地首领');
    const phaseLabel = this.phase === 3 ? '阶段 III · 绝境狂暴' : (this.phase === 2 ? '阶段 II · 蜕壳暴走' : '阶段 I · 巨壳护体');

    const frameImg = platform.getImage('assets/ui/frames/boss_hud_frame.png');
    if (frameImg && frameImg.width) {
      const fw = 456;
      const fh = Math.round(fw * (frameImg.height / frameImg.width)); // ~92px
      const fx = Math.round((960 - fw) * 0.5);
      const fy = 54;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.drawImage(frameImg, fx, fy, fw, fh);
      ctx.restore();
      platform.recordDrawCall(1);

      // 内槽精密坐标映射 (严格置入黑曜石金属框槽内)
      const wellX = fx + Math.round(fw * 0.215);
      const wellW = Math.round(fw * 0.625);
      const nameY = fy + Math.round(fh * 0.38);
      const barY = fy + Math.round(fh * 0.51);
      const barH = 14;

      ctx.font = `bold 11.5px ${UI_FONT}`;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = auraColor;
      ctx.textAlign = 'left';
      ctx.fillText(`${bossName} · ${phaseLabel}`, wellX, nameY, wellW - 88);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFE58F';
      ctx.fillText(`${Math.ceil(safeCurHp)} / ${safeMaxHp}`, wellX + wellW, nameY, 84);

      ctx.fillStyle = 'rgba(18, 10, 8, 0.90)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(wellX, barY, wellW, barH, 4) : ctx.rect(wellX, barY, wellW, barH);
      ctx.fill();

      if (hpRatio > 0) {
        const grad = ctx.createLinearGradient(wellX, barY, wellX + wellW, barY);
        if (this.phase === 3) {
          grad.addColorStop(0, '#722ED1');
          grad.addColorStop(1, '#F5222D');
        } else if (this.phase === 2) {
          grad.addColorStop(0, '#CF1322');
          grad.addColorStop(1, '#FF7A45');
        } else {
          grad.addColorStop(0, '#D46B08');
          grad.addColorStop(1, '#FFC53D');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(wellX + 1, barY + 1, Math.max(2, (wellW - 2) * hpRatio), barH - 2, 3) : ctx.rect(wellX + 1, barY + 1, Math.max(2, (wellW - 2) * hpRatio), barH - 2);
        ctx.fill();

        // 顶部柔和光泽高光线
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(wellX + 2, barY + 2, Math.max(0, (wellW - 4) * hpRatio), 3);
      }

      ctx.strokeStyle = 'rgba(255, 229, 143, 0.85)';
      ctx.lineWidth = 1.4;
      [0.60, 0.25].forEach((thresh) => {
        const tx = Math.round(wellX + wellW * thresh);
        ctx.beginPath();
        ctx.moveTo(tx, barY);
        ctx.lineTo(tx, barY + barH);
        ctx.stroke();
      });

      ctx.restore();
      return;
    }

    // 降级精雕框兜底
    const barW = 360;
    const barH = 16;
    const barX = (960 - barW) * 0.5;
    const barY = 86;

    ctx.fillStyle = 'rgba(20, 14, 9, 0.95)';
    ctx.strokeStyle = '#C68F45';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX - 12, barY - 24, barW + 24, barH + 32, 9) : ctx.rect(barX - 12, barY - 24, barW + 24, barH + 32);
    ctx.fill();
    ctx.stroke();

    ctx.font = `bold 12px ${UI_FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = auraColor;
    ctx.textAlign = 'left';
    ctx.fillText(`${bossName} 【${phaseLabel}】`, barX, barY - 11, barW - 108);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFE58F';
    ctx.fillText(`${Math.ceil(safeCurHp)} / ${safeMaxHp}`, barX + barW, barY - 11, 104);

    ctx.fillStyle = 'rgba(40, 20, 15, 0.85)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX, barY, barW, barH, 4) : ctx.rect(barX, barY, barW, barH);
    ctx.fill();

    ctx.fillStyle = this.phase === 3 ? '#9254DE' : (this.phase === 2 ? '#F5222D' : '#FA8C16');
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(barX, barY, barW * hpRatio, barH, 4) : ctx.rect(barX, barY, barW * hpRatio, barH);
    ctx.fill();

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
