/**
 * 林地生态天候与动态战场环境系统 (js/game/weather.js)
 * 林地自然天候与动态战场生态系统
 * 
 * 包含四大天候形态：
 * 1. ☀️ 晨曦晴空 (Sunny): 孢子产出 +25%，英雄生命自然恢复 +50%
 * 2. 🌧️ 雷暴骤雨 (Rainstorm): 狂风骤雨，周期性召唤雷霆轰顶劈击重甲巨怪，水坑导电触电
 * 3. 🌫️ 深林迷雾 (Deep Mist): 箭塔射程 +15%，怪物获得 15% 远程攻击轻度闪避
 * 4. 🩸 狂暴血月 (Blood Moon): 虫潮狂化移速 +20%，但击杀掉落双倍黄金孢子与觉醒能量！
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

class WeatherManager {
  constructor() {
    this.currentWeather = 'sunny'; // 'sunny' | 'rain' | 'mist' | 'blood_moon'
    this.weatherTimer = 0;
    this.weatherDuration = 45.0; // 每 45 秒动态演变一次天候
    this.lightningTimer = 4.0;   // 雷暴天候雷击冷却
    this.raindrops = [];
    this.fogWisps = [];
    this.lightningFlash = 0;
    this.weatherNoticeTimer = 0;
    this.weatherNoticeText = '';

    // 初始化雨滴粒子池
    for (let i = 0; i < 90; i++) {
      this.raindrops.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        vy: 420 + Math.random() * 180,
        vx: -60 - Math.random() * 40,
        len: 12 + Math.random() * 10,
        alpha: 0.15 + Math.random() * 0.35
      });
    }

    // 初始化雾气团
    for (let i = 0; i < 8; i++) {
      this.fogWisps.push({
        x: Math.random() * 1000 - 50,
        y: Math.random() * 540,
        radius: 80 + Math.random() * 90,
        vx: 12 + Math.random() * 14,
        alpha: 0.08 + Math.random() * 0.12
      });
    }

    // 初始化萤火虫微光粒子池 (幽夜微光专属)
    this.fireflies = [];
    for (let i = 0; i < 14; i++) {
      this.fireflies.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 14,
        baseAlpha: 0.35 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        speed: 1.8 + Math.random() * 1.5,
        size: 2.2 + Math.random() * 2.0,
        color: Math.random() < 0.65 ? '#BAE7FF' : '#FFE58F'
      });
    }
  }

  initForMap(mapId) {
    if (mapId === 'map1' || mapId === 'map4') {
      this.currentWeather = 'sunny';
    } else if (mapId === 'map2') {
      this.currentWeather = 'mist';
    } else {
      this.currentWeather = 'night';
    }
    this.weatherTimer = 0;
    this.lightningTimer = 4.0;
    this.weatherNoticeTimer = 0;
  }

  setWeather(type, fx = null, scene = null) {
    if (this.currentWeather === type) return;
    const prev = this.currentWeather;
    this.currentWeather = type;
    this.weatherTimer = 0;
    this.weatherNoticeTimer = 3.5;

    const names = {
      sunny: '☀️ 晨曦初晴 · 丰收晨露',
      night: '🌙 幽夜微光 · 月华静谧',
      rain: '🌧️ 林地雷暴 · 雷霆轰顶',
      mist: '🌫️ 幽林浓雾 · 迷雾隐踪',
      blood_moon: '🩸 狂暴血月 · 极夜狂澜'
    };
    const subs = {
      sunny: '全场孢子产出 +25%，神圣大橡树自愈速度 +50%',
      night: '幽静月华微照，真菌生物荧光共鸣，全防线攻速与充能 +15%！',
      rain: '雷霆每隔 6 秒自动天罚轰顶重型虫首，水洼导电连锁',
      mist: '瞭望菇射程 +15%，轻甲虫潮获得 15% 飘忽闪避',
      blood_moon: '虫潮移速狂增 +20%，击败敌军掉落双倍黄金孢子！'
    };

    this.weatherNoticeText = names[type] || '';
    if (fx && typeof fx.showBanner === 'function') {
      const bannerColor = type === 'blood_moon' ? '#FF4D4F' : (type === 'night' ? '#69C0FF' : (type === 'rain' ? '#40A9FF' : '#52C41A'));
      fx.showBanner(names[type], bannerColor, subs[type], 1.8);
      platform.playSfx(type === 'rain' ? 'sfx_thunder' : (type === 'blood_moon' ? 'sfx_horn' : 'sfx_upgrade'));
    }

    if (scene && scene.state === 'BATTLE') {
      if (type === 'night') {
        platform.playBgm('bgm_night');
      } else if (prev === 'night') {
        platform.playBgm('bgm_battle');
      }
    }
  }

  cycleWeather(scene = null) {
    const cycle = ['sunny', 'night', 'mist', 'rain', 'blood_moon'];
    const nextIdx = (cycle.indexOf(this.currentWeather) + 1) % cycle.length;
    const next = cycle[nextIdx];
    this.setWeather(next, scene ? scene.fx : null, scene);
    return next;
  }

  update(dt, enemyManager = null, towerManager = null, hero = null, fx = null) {
    if (enemyManager && enemyManager.enemyManager) {
      const scene = enemyManager;
      enemyManager = scene.enemyManager;
      towerManager = scene.towerManager;
      hero = scene.hero;
      fx = scene.fx;
    }
    this.weatherTimer += dt;
    if (this.weatherNoticeTimer > 0) {
      this.weatherNoticeTimer -= dt;
    }

    // 每到一定波次或时间自动循环天候
    if (this.weatherTimer >= this.weatherDuration) {
      this.weatherTimer = 0;
      const cycle = ['sunny', 'night', 'mist', 'rain', 'blood_moon'];
      const nextIdx = (cycle.indexOf(this.currentWeather) + 1) % cycle.length;
      this.setWeather(cycle[nextIdx], fx, enemyManager ? enemyManager.scene : null);
    }

    // 幽夜与迷雾环境：发光萤火虫飘逸舞动
    if (this.currentWeather === 'night' || this.currentWeather === 'mist') {
      for (let i = 0; i < this.fireflies.length; i++) {
        const ff = this.fireflies[i];
        ff.phase += dt * ff.speed;
        ff.x += ff.vx * dt + Math.sin(ff.phase) * 0.5;
        ff.y += ff.vy * dt + Math.cos(ff.phase * 0.7) * 0.4;
        if (ff.x < 0) ff.x = 960;
        if (ff.x > 960) ff.x = 0;
        if (ff.y < 0) ff.y = 540;
        if (ff.y > 540) ff.y = 0;
      }
    }

    // 1. 雷暴天候：自动天罚轰顶劈击场上最强精英怪
    if (this.currentWeather === 'rain') {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 6.5 + Math.random() * 2.0;
        this.triggerNaturalLightning(enemyManager, fx);
      }
      if (this.lightningFlash > 0) {
        this.lightningFlash = Math.max(0, this.lightningFlash - dt * 3.5);
      }
    }

    // 2. 雨滴粒子物理运动
    if (this.currentWeather === 'rain') {
      for (let i = 0; i < this.raindrops.length; i++) {
        const r = this.raindrops[i];
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        if (r.y > 550 || r.x < -20) {
          r.x = Math.random() * 1000 + 40;
          r.y = -20;
        }
      }
    }

    // 3. 浓雾飘移运动
    if (this.currentWeather === 'mist') {
      for (let i = 0; i < this.fogWisps.length; i++) {
        const f = this.fogWisps[i];
        f.x += f.vx * dt;
        if (f.x > 1050) {
          f.x = -150;
          f.y = Math.random() * 540;
        }
      }
    }
  }

  triggerNaturalLightning(enemyManager, fx) {
    if (!enemyManager) return;
    const alive = enemyManager.getAliveEnemies();
    if (alive.length === 0) return;

    // 优先锁定生命最高或最靠近终点的重甲敌人
    let target = null;
    let maxThreat = -1;
    for (let i = 0; i < alive.length; i++) {
      const e = alive[i];
      if (e.state === 'death') continue;
      const score = e.hp + (e.baseArmor * 60) + (e.isBoss ? 400 : 0);
      if (score > maxThreat) {
        maxThreat = score;
        target = e;
      }
    }

    if (target) {
      this.lightningFlash = 1.0;
      platform.playSfx('sfx_thunder');
      const lightningDmg = 140;
      enemyManager.applyDamage(target, lightningDmg, false, 'magic', fx, null);

      if (fx) {
        fx.spawnFloatingText(target.x, target.y - 18, `⚡ 天罚 -${lightningDmg}!`, '#69C0FF', 1.2);
        fx.spawnParticles(target.x, target.y, 14, ['#69C0FF', '#BAE7FF', '#FFD666'], 40, 90, 0.2, 0.4, 4);
        fx.triggerScreenShake(2.5, 0.16);
      }
    }
  }

  getSporeGenerationModifier() {
    if (this.currentWeather === 'sunny') return 1.25;
    if (this.currentWeather === 'blood_moon') return 1.50;
    return 1.0;
  }

  getEnemySpeedModifier() {
    if (this.currentWeather === 'blood_moon') return 1.20;
    if (this.currentWeather === 'rain') return 0.94; // 雨天道路泥泞微减速
    return 1.0;
  }

  getTowerRangeModifier(towerType) {
    if (this.currentWeather === 'mist' && towerType === 'watch') return 1.15;
    return 1.0;
  }

  getHeroRegenModifier() {
    if (this.currentWeather === 'sunny') return 1.50;
    return 1.0;
  }

  renderWeatherEffects(ctx) {
    ctx.save();

    // 1. 阳光普照轻微暖色滤镜
    if (this.currentWeather === 'sunny') {
      ctx.fillStyle = 'rgba(255, 240, 180, 0.05)';
      ctx.fillRect(0, 0, 960, 540);
    }

    // 幽夜微光环境天候与夜景系统 (Night Atmosphere)
    if (this.currentWeather === 'night') {
      // 1. 幽静冷月夜幕滤镜 (柔和蓝灰冷调，保留战场高辨识度与通透感)
      ctx.fillStyle = 'rgba(8, 22, 44, 0.28)';
      ctx.fillRect(0, 0, 960, 540);

      // 2. 宁静暗角 (Vignette)
      if (!this._cachedNightVig) {
        this._cachedNightVig = ctx.createRadialGradient(480, 270, 260, 480, 270, 540);
        this._cachedNightVig.addColorStop(0, 'rgba(6, 16, 32, 0)');
        this._cachedNightVig.addColorStop(1, 'rgba(4, 12, 28, 0.42)');
      }
      ctx.fillStyle = this._cachedNightVig;
      ctx.fillRect(0, 0, 960, 540);

      // 3. 柔和丁达尔月华倾泻 (Moonlight Beams)
      ctx.save();
      ctx.fillStyle = 'rgba(186, 231, 255, 0.04)';
      ctx.beginPath();
      ctx.moveTo(120, 0);
      ctx.lineTo(340, 0);
      ctx.lineTo(620, 540);
      ctx.lineTo(380, 540);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(480, 0);
      ctx.lineTo(680, 0);
      ctx.lineTo(920, 540);
      ctx.lineTo(720, 540);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 4. 发光萤火虫群 (Dancing Fireflies)
      for (let i = 0; i < this.fireflies.length; i++) {
        const ff = this.fireflies[i];
        const glowAlpha = Math.max(0.05, ff.baseAlpha * (0.6 + Math.sin(ff.phase) * 0.4));
        ctx.save();
        ctx.fillStyle = ff.color;
        ctx.globalAlpha = glowAlpha * 0.35;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.size * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = glowAlpha;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. 浓雾飘浮渲染
    if (this.currentWeather === 'mist') {
      ctx.fillStyle = 'rgba(210, 230, 240, 0.08)';
      ctx.fillRect(0, 0, 960, 540);

      // 高性能柔和环境浓雾（杜绝每帧生成 RadialGradient 对象造成 GC 巨幅卡顿）
      for (let i = 0; i < this.fogWisps.length; i++) {
        const f = this.fogWisps[i];
        ctx.fillStyle = `rgba(220, 238, 245, ${f.alpha * 0.45})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. 雷暴暴雨水线与雷光全屏闪耀
    if (this.currentWeather === 'rain') {
      // 灰暗雷暴背景
      ctx.fillStyle = 'rgba(12, 24, 38, 0.18)';
      ctx.fillRect(0, 0, 960, 540);

      // 雨丝笔刷
      ctx.strokeStyle = 'rgba(160, 210, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < this.raindrops.length; i++) {
        const r = this.raindrops[i];
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + (r.vx * 0.025), r.y + r.len);
      }
      ctx.stroke();

      // 雷光闪白瞬间
      if (this.lightningFlash > 0.02) {
        ctx.fillStyle = `rgba(220, 245, 255, ${this.lightningFlash * 0.45})`;
        ctx.fillRect(0, 0, 960, 540);
      }
    }

    // 4. 血月虫潮暗红天幕
    if (this.currentWeather === 'blood_moon') {
      const pulse = 0.12 + Math.sin(Date.now() * 0.003) * 0.04;
      ctx.fillStyle = `rgba(180, 20, 20, ${pulse})`;
      ctx.fillRect(0, 0, 960, 540);

      // 四周暗夜血光暗角 (单例静态缓存渐变)
      if (!this._cachedVig) {
        this._cachedVig = ctx.createRadialGradient(480, 270, 240, 480, 270, 520);
        this._cachedVig.addColorStop(0, 'rgba(120, 10, 10, 0)');
        this._cachedVig.addColorStop(1, 'rgba(120, 10, 10, 0.45)');
      }
      ctx.fillStyle = this._cachedVig;
      ctx.fillRect(0, 0, 960, 540);
    }

    ctx.restore();
  }

  renderWeatherHudBadge(ctx, x, y) {
    ctx.save();
    const badges = {
      sunny: { icon: '☀️', text: '初晴+25%', color: '#52C41A', border: 'rgba(115, 209, 61, 0.7)' },
      night: { icon: '🌙', text: '幽夜+15%', color: '#69C0FF', border: 'rgba(105, 192, 255, 0.75)' },
      rain: { icon: '🌧️', text: '暴雨轰顶', color: '#1890FF', border: 'rgba(105, 192, 255, 0.7)' },
      mist: { icon: '🌫️', text: '浓雾+15%', color: '#13C2C2', border: 'rgba(92, 219, 211, 0.7)' },
      blood_moon: { icon: '🩸', text: '血月双倍', color: '#FF4D4F', border: 'rgba(255, 120, 117, 0.8)' }
    };

    const b = badges[this.currentWeather] || badges.sunny;
    const bw = 96;
    const bh = 24;

    ctx.fillStyle = 'rgba(28, 20, 12, 0.92)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, bw, bh, 12) : ctx.rect(x, y, bw, bh);
    ctx.fill();

    ctx.strokeStyle = b.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 229, 143, 0.28)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x + 2, y + 2, bw - 4, bh - 4, 10) : ctx.rect(x + 2, y + 2, bw - 4, bh - 4);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${b.icon} ${b.text}`, x + bw * 0.5, y + bh * 0.5);

    ctx.restore();
  }

  renderWeatherOverlay(ctx) {
    return this.renderWeatherEffects(ctx);
  }

  renderTopWeatherBadge(ctx, x, y) {
    return this.renderWeatherHudBadge(ctx, x, y);
  }
}

module.exports = WeatherManager;
