/**
 * 战术菌灵羁绊共鸣与星轨协同系统 (js/game/guardianSynergies.js)
 * 深度借鉴成熟塔防神作 (Arknights / Bloons TD6 Monkey Knowledge / TFT) 的羁绊设计：
 * 场上部署特定守卫者组合时，自动激活太古森林共鸣星轨，赋予全军独特质感战斗被动与华丽环境视觉联动。
 */

const platform = require('../core/platform');

class GuardianSynergiesSystem {
  constructor() {
    this.synergies = {
      twin_rangers: {
        id: 'twin_rangers',
        name: '双星瞭望',
        nameKey: 'synergy_twin_rangers',
        desc: '部署 2 座及以上瞭望菇：射程 +25%，弹道速度 +35%，神圣木羽箭穿透 2 名敌军。',
        icon: 'assets/ui/cards/card_watch.png',
        color: '#FFD700',
        active: false,
        reqTypes: ['watch'],
        minCount: 2
      },
      toxic_nova: {
        id: 'toxic_nova',
        name: '毒爆云雾',
        nameKey: 'synergy_toxic_nova',
        desc: '部署雾菇 + 爆裂菇：爆裂重炮在迷雾中引爆剧毒蒸汽，造成 2.5 倍腐蚀范围爆轰并破甲。',
        icon: 'assets/ui/cards/card_mist.png',
        color: '#52C41A',
        active: false,
        reqTypes: ['mist', 'burst'],
        minCount: 1
      },
      bramble_entangle: {
        id: 'bramble_entangle',
        name: '荆棘缠绕',
        nameKey: 'synergy_bramble_entangle',
        desc: '部署尖刺菇 + 雾菇：迷雾中行进的敌军触碰地刺将被太古藤蔓强制缠绕禁锢 1.8 秒。',
        icon: 'assets/ui/cards/card_thorn.png',
        color: '#13C2C2',
        active: false,
        reqTypes: ['thorn', 'mist'],
        minCount: 1
      },
      celestial_blessing: {
        id: 'celestial_blessing',
        name: '圣光照耀',
        nameKey: 'synergy_celestial_blessing',
        desc: '部署灵光菇 + 任意输出菇：灵光每 5 秒释放圣光脉冲，驱散蛛网并为相邻守卫加持 40% 攻速。',
        icon: 'assets/ui/cards/card_lumina.png',
        color: '#FAAD14',
        active: false,
        reqTypes: ['lumina'],
        minCount: 1,
        needOffensive: true
      },
      grand_awakening: {
        id: 'grand_awakening',
        name: '森罗万象',
        nameKey: 'synergy_grand_awakening',
        desc: '集齐全部 5 类守卫者：解锁始源盖亚之怒，每 12 秒引发林地共鸣地震，重创并眩晕全图地面怪物。',
        icon: 'assets/vfx/item_awakening_seed.png',
        color: '#B37FEB',
        active: false,
        reqTypes: ['watch', 'mist', 'thorn', 'burst', 'lumina'],
        minCount: 1
      }
    };

    this.gaiaWrathTimer = 0;
    this.celestialPulseTimer = 0;
    this.activeSynergyCount = 0;
    this.synergyAuras = [];
  }

  reset() {
    this.gaiaWrathTimer = 0;
    this.celestialPulseTimer = 0;
    this.activeSynergyCount = 0;
    this.synergyAuras.length = 0;
    for (let k in this.synergies) {
      this.synergies[k].active = false;
    }
  }

  /**
   * 依据场上建筑更新羁绊激活状态
   */
  updateSynergies(towers) {
    if (!towers) return;
    const counts = {};
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      counts[t.typeId] = (counts[t.typeId] || 0) + 1;
    }

    let prevActiveCount = this.activeSynergyCount;
    let newActiveCount = 0;

    // 1. 双星瞭望
    const twinActive = (counts.watch || 0) >= 2;
    this.synergies.twin_rangers.active = twinActive;
    if (twinActive) newActiveCount++;

    // 2. 毒爆云雾
    const toxicActive = (counts.mist || 0) >= 1 && (counts.burst || 0) >= 1;
    this.synergies.toxic_nova.active = toxicActive;
    if (toxicActive) newActiveCount++;

    // 3. 荆棘缠绕
    const brambleActive = (counts.thorn || 0) >= 1 && (counts.mist || 0) >= 1;
    this.synergies.bramble_entangle.active = brambleActive;
    if (brambleActive) newActiveCount++;

    // 4. 圣光照耀
    const offensiveCount = (counts.watch || 0) + (counts.mist || 0) + (counts.thorn || 0) + (counts.burst || 0);
    const celestialActive = (counts.lumina || 0) >= 1 && offensiveCount >= 1;
    this.synergies.celestial_blessing.active = celestialActive;
    if (celestialActive) newActiveCount++;

    // 5. 森罗万象
    const grandActive = (counts.watch || 0) >= 1 && (counts.mist || 0) >= 1 && (counts.thorn || 0) >= 1 && (counts.burst || 0) >= 1 && (counts.lumina || 0) >= 1;
    this.synergies.grand_awakening.active = grandActive;
    if (grandActive) newActiveCount++;

    this.activeSynergyCount = newActiveCount;
  }

  /**
   * 每帧战术更新
   */
  update(dt, scene) {
    if (!scene || scene.state !== 'BATTLE') return;
    const towers = scene.towerManager ? scene.towerManager.towers : [];
    this.updateSynergies(towers);

    // 盖亚之怒自动蓄力
    if (this.synergies.grand_awakening.active) {
      this.gaiaWrathTimer += dt;
      if (this.gaiaWrathTimer >= 12.0) {
        this.gaiaWrathTimer = 0;
        this.triggerGaiaWrath(scene);
      }
    } else {
      this.gaiaWrathTimer = 0;
    }

    // 圣光脉冲自动蓄力
    if (this.synergies.celestial_blessing.active) {
      this.celestialPulseTimer += dt;
      if (this.celestialPulseTimer >= 5.0) {
        this.celestialPulseTimer = 0;
        this.triggerCelestialPulse(scene);
      }
    } else {
      this.celestialPulseTimer = 0;
    }

    // 更新光环微粒生命
    for (let i = this.synergyAuras.length - 1; i >= 0; i--) {
      const a = this.synergyAuras[i];
      a.life -= dt;
      a.radius += dt * 38;
      if (a.life <= 0) {
        this.synergyAuras.splice(i, 1);
      }
    }
  }

  /**
   * 触发始源盖亚之怒全图共鸣
   */
  triggerGaiaWrath(scene) {
    if (!scene) return;
    if (scene.fx) {
      scene.fx.showBanner('🌿 始源盖亚之怒·全域震颤！', '#B37FEB', '森罗万象共鸣激荡，全图地面怪物遭受太古神木冲击', 2.0);
      scene.fx.spawnShockwave(320, 240, 340, '#D3ADF7', 0.85);
    }
    if (scene.combatJuice) {
      scene.combatJuice.addTrauma(0.45);
    }
    platform.playSfx('sfx_boom');

    if (scene.enemyManager) {
      const enemies = scene.enemyManager.getAliveEnemies();
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e.isFlying) {
          if (typeof scene.enemyManager.applyDamage === 'function') {
            scene.enemyManager.applyDamage(e, 160, false, 'nature', scene.fx, 'reactions');
          } else {
            e.takeDamage(160, scene.fx, 'nature', 'reactions');
          }
          e.stunTimer = Math.max(e.stunTimer || 0, 1.2);
          if (scene.fx) {
            scene.fx.spawnParticles(e.x, e.y, 8, ['#B37FEB', '#D3ADF7', '#52C41A'], 15, 35, 0.2, 0.45, 2.5);
            scene.fx.spawnFloatingText(e.x, e.y - 14, '🌍 盖亚重击!', '#D3ADF7', 0.9);
          }
        }
      }
    }
  }

  /**
   * 触发圣光脉冲
   */
  triggerCelestialPulse(scene) {
    if (!scene || !scene.towerManager) return;
    const tws = scene.towerManager.towers;
    let luminaFound = null;
    for (let i = 0; i < tws.length; i++) {
      if (tws[i].typeId === 'lumina') {
        luminaFound = tws[i];
        break;
      }
    }
    if (!luminaFound) return;

    if (scene.fx) {
      scene.fx.spawnRing(luminaFound.x, luminaFound.y, 160, '#FFE58F', 0.6);
      scene.fx.spawnFloatingText(luminaFound.x, luminaFound.y - 20, '✨ 圣光圣域!', '#FFE58F', 1.0);
    }
    platform.playSfx('sfx_upgrade');

    // 解除被困蛛网并提升相邻守卫攻速
    for (let i = 0; i < tws.length; i++) {
      const t = tws[i];
      const d = Math.hypot(t.x - luminaFound.x, t.y - luminaFound.y);
      if (d <= 180) {
        if (t.isWebbed) {
          t.isWebbed = false;
          if (scene.fx) scene.fx.spawnFloatingText(t.x, t.y - 16, '🛡️ 净化解封!', '#52C41A', 0.85);
        }
        t.celestialBuffTimer = 4.0; // 4 秒 +40% 攻速加速光环
      }
    }
  }

  /**
   * 绘制羁绊光环与林地星轨连接
   */
  render(ctx) {
    if (this.synergyAuras.length === 0 && this.activeSynergyCount === 0) return;

    ctx.save();
    for (let i = 0; i < this.synergyAuras.length; i++) {
      const a = this.synergyAuras[i];
      const alpha = Math.max(0, a.life / a.maxLife);
      ctx.strokeStyle = a.color;
      ctx.globalAlpha = alpha * 0.45;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 绘制顶部羁绊共鸣指示器 (HUD)
   */
  renderHudBadge(ctx, x, y) {
    const keys = Object.keys(this.synergies);
    const boxW = 24;
    const boxH = 24;
    const gap = 5;

    ctx.save();
    for (let i = 0; i < keys.length; i++) {
      const syn = this.synergies[keys[i]];
      const bx = x + i * (boxW + gap);
      const by = y;

      // 边框底板
      ctx.fillStyle = syn.active ? 'rgba(30, 45, 25, 0.90)' : 'rgba(15, 20, 16, 0.75)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, boxW, boxH, 4) : ctx.rect(bx, by, boxW, boxH);
      ctx.fill();

      // 激活高亮边框
      ctx.strokeStyle = syn.active ? syn.color : 'rgba(80, 90, 80, 0.40)';
      ctx.lineWidth = syn.active ? 1.5 : 1.0;
      ctx.stroke();

      // 对应守卫/原画图标
      const img = platform.getImage(syn.icon);
      if (img && img.width) {
        ctx.globalAlpha = syn.active ? 1.0 : 0.35;
        ctx.drawImage(img, bx + 2, by + 2, boxW - 4, boxH - 4);
      }

      // 激活微光角标
      if (syn.active) {
        ctx.fillStyle = syn.color;
        ctx.beginPath();
        ctx.arc(bx + boxW - 3, by + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

module.exports = GuardianSynergiesSystem;
