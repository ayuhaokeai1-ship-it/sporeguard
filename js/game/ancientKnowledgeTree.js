/**
 * 远古真菌知识之树 (js/game/ancientKnowledgeTree.js)
 * 参考 Kingdom Rush 星级科技树与 Bloons TD6 猴子知识体系
 * 为全系蘑菇、英雄、神术与经济提供永久深度强化与战术流派构筑
 */

const storage = require('../save/storage');
const PALETTE = require('../data/palette');
const platform = require('../core/platform');

const TALENT_BRANCHES = {
  BLOOM: 'bloom',       // 丰饶繁育分支 (经济与资源)
  TIMBER: 'timber',     // 苍翠坚木分支 (肉盾与防线)
  ELEMENT: 'element',   // 元素共鸣分支 (反应与范围)
  COMMAND: 'command'    // 自然神术分支 (英雄与微操)
};

const TALENT_DEFS = {
  // 1. 丰饶繁育分支
  mycelium_network: {
    id: 'mycelium_network',
    branch: TALENT_BRANCHES.BLOOM,
    tier: 1,
    name: '菌丝网络',
    icon: '🌱',
    desc: '开局额外获得 +30 基础孢子，且每秒自然凝聚 +1 孢子',
    maxRank: 3,
    costPerRank: 1,
    effect: (rank) => ({ startingSpores: rank * 30, sporeTricklePerSec: rank * 1.0 })
  },
  bountiful_harvest: {
    id: 'bountiful_harvest',
    branch: TALENT_BRANCHES.BLOOM,
    tier: 2,
    name: '丰收祝福',
    icon: '🌾',
    desc: '[E] 孢子丰饶神术额外产出 +40 孢子，且击杀精英怪必定掉落双倍金孢子',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ extraHarvestSpores: rank * 40, doubleSporeChance: rank * 0.4 })
  },
  photosynthetic_surge: {
    id: 'photosynthetic_surge',
    branch: TALENT_BRANCHES.BLOOM,
    tier: 3,
    name: '光合激涌',
    icon: '☀️',
    desc: '当场上守卫达 3 株及以上时，激活光合激涌使全队攻击与产孢速度 +10%（满级 +20%）',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ teamAtkSpeedBonus: rank * 0.10 })
  },
  elder_photosynthesis: {
    id: 'elder_photosynthesis',
    branch: TALENT_BRANCHES.BLOOM,
    tier: 4,
    name: '远古光合',
    icon: '☀️',
    desc: '波次结算时，剩余未使用的孢子产生 +12% 丰厚利息（最高180孢子）',
    maxRank: 1,
    costPerRank: 3,
    effect: (rank) => ({ waveInterestRate: 0.12, maxInterest: 180 })
  },

  // 2. 苍翠坚木分支
  bark_armor: {
    id: 'bark_armor',
    branch: TALENT_BRANCHES.TIMBER,
    tier: 1,
    name: '远古树皮',
    icon: '🛡️',
    desc: '树人英雄生命上限 +100，受到近战攻击时向四周迸发 8 片尖刺反伤',
    maxRank: 3,
    costPerRank: 1,
    effect: (rank) => ({ heroBonusHp: rank * 100, thornThornsDmg: rank * 18 })
  },
  iron_sporelings: {
    id: 'iron_sporelings',
    branch: TALENT_BRANCHES.TIMBER,
    tier: 2,
    name: '钢盔小蘑兵',
    icon: '🍄',
    desc: '巡逻小蘑兵生命值翻倍，首次受到致命伤害时免疫死亡并击晕周围敌人 1.2 秒',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ sporelingShield: true, deathStunDuration: rank * 0.8 })
  },
  deep_entanglement: {
    id: 'deep_entanglement',
    branch: TALENT_BRANCHES.TIMBER,
    tier: 3,
    name: '深根盘缚',
    icon: '🌿',
    desc: '尖刺菇与藤蔓对迅捷甲虫、跃击者等敏捷型敌人的减速效果额外提升 +30%',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ extraSlowRatio: rank * 0.18 })
  },
  living_citadel: {
    id: 'living_citadel',
    branch: TALENT_BRANCHES.TIMBER,
    tier: 4,
    name: '生命壁垒',
    icon: '🏰',
    desc: '基地蘑菇小屋获得 1 层自然神圣结界，单局可彻底免除一次怪物入仓扣血',
    maxRank: 1,
    costPerRank: 3,
    effect: (rank) => ({ warehouseHolyShield: 1 })
  },

  // 3. 元素共鸣分支
  superconduct_resonance: {
    id: 'superconduct_resonance',
    branch: TALENT_BRANCHES.ELEMENT,
    tier: 1,
    name: '超导共振',
    icon: '⚡',
    desc: '闪电链传导跳跃目标数 +2，且对重甲甲虫额外造成 +35% 破甲雷爆',
    maxRank: 3,
    costPerRank: 1,
    effect: (rank) => ({ extraChainJumps: rank * 1, armorBreakBonus: rank * 0.20 })
  },
  pyro_fissure: {
    id: 'pyro_fissure',
    branch: TALENT_BRANCHES.ELEMENT,
    tier: 2,
    name: '烈焰地裂',
    icon: '🔥',
    desc: '爆裂菇抛射炮弹爆炸后，在地面残留 3.5 秒熔岩烈焰，经过敌人每秒受 45 点灼伤',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ lavaPoolDuration: rank * 2.0, lavaDps: rank * 35 })
  },
  toxic_miasma: {
    id: 'toxic_miasma',
    branch: TALENT_BRANCHES.ELEMENT,
    tier: 3,
    name: '深渊剧毒',
    icon: '🟣',
    desc: '雾菇剧毒迷雾附带神经衰弱毒素，中毒敌人的护甲与法抗降低 40%',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ miasmaResistDebuff: rank * 0.25 })
  },
  prismatic_singularity: {
    id: 'prismatic_singularity',
    branch: TALENT_BRANCHES.ELEMENT,
    tier: 4,
    name: '棱镜奇点',
    icon: '✨',
    desc: '当敌人同时附带 2 种以上元素异常时，受到的所有伤害提升 +50% 并引发极光核爆',
    maxRank: 1,
    costPerRank: 3,
    effect: (rank) => ({ multiElementAmp: 0.50, elementalSupernova: true })
  },

  // 4. 自然神术分支
  quickened_mysticism: {
    id: 'quickened_mysticism',
    branch: TALENT_BRANCHES.COMMAND,
    tier: 1,
    name: '疾速通灵',
    icon: '⏳',
    desc: '所有指挥官神术 [Q/W/E/R] 冷却时间缩短 20%（满级 35%）',
    maxRank: 3,
    costPerRank: 1,
    effect: (rank) => ({ cdrRatio: rank * 0.12 })
  },
  tempest_surge: {
    id: 'tempest_surge',
    branch: TALENT_BRANCHES.COMMAND,
    tier: 2,
    name: '风暴狂涌',
    icon: '⛈️',
    desc: '[W] 天雷震击范围扩大 40%，落雷处产生聚怪吸引风暴，持续 2.0 秒',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ thunderRadiusMod: 1.0 + rank * 0.25, vortexPull: true })
  },
  fertile_awakening: {
    id: 'fertile_awakening',
    branch: TALENT_BRANCHES.COMMAND,
    tier: 3,
    name: '始源觉醒',
    icon: '🌟',
    desc: '战斗开局额外获赠 +1 颗始源觉醒古种，且觉醒守卫攻击速度永久额外 +20%',
    maxRank: 2,
    costPerRank: 2,
    effect: (rank) => ({ startingAwakeningSeeds: rank * 1, awakenedAtkSpeedMod: 1.0 + rank * 0.15 })
  },
  avatar_of_nature: {
    id: 'avatar_of_nature',
    branch: TALENT_BRANCHES.COMMAND,
    tier: 4,
    name: '森之化身',
    icon: '👑',
    desc: '树人英雄大招【撼地重击】冷却缩短 30%，施放后赋予全场守卫 5 秒狂暴攻速',
    maxRank: 1,
    costPerRank: 3,
    effect: (rank) => ({ heroUltCdr: 0.30, teamFrenzyDuration: 5.0 })
  }
};

class AncientKnowledgeTree {
  constructor() {
    this.ranks = {};
    this.totalPointsEarned = 12; // 默认赋予玩家初始领悟点数，确保立即可体验丰富配点
    this.activeTab = TALENT_BRANCHES.BLOOM;
    this.selectedTalentId = 'mycelium_network';
    this.loadState();
  }

  loadState() {
    const save = storage.getSave ? storage.getSave() : {};
    const savedTree = (save && save.knowledgeTree) || {};
    this.ranks = savedTree.ranks || {
      mycelium_network: 1,
      bark_armor: 1,
      superconduct_resonance: 1,
      quickened_mysticism: 1
    };
    if (this.ranks.root_recycling) {
      delete this.ranks.root_recycling;
    }
    if (typeof savedTree.totalPoints === 'number') {
      this.totalPointsEarned = Math.max(12, savedTree.totalPoints);
    }
  }

  saveState() {
    try {
      const save = storage.getSave ? storage.getSave() : {};
      save.knowledgeTree = {
        ranks: this.ranks,
        totalPoints: this.totalPointsEarned
      };
      if (storage.saveNow) {
        storage.saveNow();
      }
    } catch (e) {}
  }

  getRank(talentId) {
    return this.ranks[talentId] || 0;
  }

  getSpentPoints() {
    let spent = 0;
    for (let k in this.ranks) {
      const def = TALENT_DEFS[k];
      if (def) {
        spent += this.ranks[k] * def.costPerRank;
      }
    }
    return spent;
  }

  getAvailablePoints() {
    return Math.max(0, this.totalPointsEarned - this.getSpentPoints());
  }

  canUpgrade(talentId) {
    const def = TALENT_DEFS[talentId];
    if (!def) return false;
    const curRank = this.getRank(talentId);
    if (curRank >= def.maxRank) return false;
    if (this.getAvailablePoints() < def.costPerRank) return false;
    return true;
  }

  upgradeTalent(talentId) {
    if (!this.canUpgrade(talentId)) return false;
    const def = TALENT_DEFS[talentId];
    this.ranks[talentId] = (this.ranks[talentId] || 0) + 1;
    this.saveState();
    return true;
  }

  resetBranch(branch) {
    for (let k in TALENT_DEFS) {
      if (TALENT_DEFS[k].branch === branch) {
        delete this.ranks[k];
      }
    }
    this.saveState();
  }

  resetAll() {
    this.ranks = {};
    this.saveState();
  }

  /**
   * 应用所有激活天赋至当前战斗场景
   */
  applyToCombatScene(scene) {
    if (!scene) return;

    // 1. 菌丝网络：开局额外孢子与自然产出
    const myRank = this.getRank('mycelium_network');
    if (myRank > 0 && scene.economy) {
      scene.economy.spores += myRank * 30;
      scene.economy.passiveTrickleBonus = myRank * 1.0;
    }

    // 2. 远古树皮：英雄生命与刺甲
    const barkRank = this.getRank('bark_armor');
    if (barkRank > 0 && scene.hero) {
      scene.hero.maxHp += barkRank * 100;
      scene.hero.hp = scene.hero.maxHp;
      scene.hero.thornReflectDmg = barkRank * 18;
    }

    // 3. 光合激涌：全队攻速与产孢提速
    const psRank = this.getRank('photosynthetic_surge');
    if (psRank > 0) {
      scene.photosyntheticSurgeBonus = psRank * 0.10;
    }

    // 4. 始源觉醒：额外觉醒古种
    const awakRank = this.getRank('fertile_awakening');
    if (awakRank > 0) {
      scene.awakeningSeeds += awakRank;
    }

    // 5. 疾速通灵：神术冷却缩减
    const cdrRank = this.getRank('quickened_mysticism');
    if (cdrRank > 0) {
      scene.spellCdrMultiplier = 1.0 - cdrRank * 0.12;
    }

    // 6. 生命壁垒：基地结界
    const citRank = this.getRank('living_citadel');
    if (citRank > 0) {
      scene.holyShieldCharges = 1;
    }

    // 7. 棱镜奇点：多元素增幅
    if (this.getRank('prismatic_singularity') > 0) {
      scene.hasPrismaticSingularity = true;
    }
  }

  /**
   * 每秒持续更新（例如微量孢子自然凝聚、利息结算等）
   */
  update(dt, scene) {
    if (!scene || scene.state !== 'BATTLE') return;

    // 菌丝网络：每秒自然凝聚额外孢子
    const myRank = this.getRank('mycelium_network');
    if (myRank > 0 && scene.economy) {
      this.trickleTimer = (this.trickleTimer || 0) + dt;
      if (this.trickleTimer >= 1.0) {
        this.trickleTimer -= 1.0;
        scene.economy.addSpores(Math.round(myRank * 1.0));
      }
    }
  }

  /**
   * 渲染图鉴中的远古知识之树 UI 面板
   */
  renderKnowledgePanel(ctx, x, y, w, h, ui) {
    ctx.save();

    // 1. 顶部领悟点数与流派切换标签
    ctx.fillStyle = '#4A2E14';
    ctx.font = 'bold 14px "PingFang SC", "Microsoft YaHei UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const avail = this.getAvailablePoints();
    ctx.fillText(`✨ 领悟之光: ${avail} 点可用 (已用 ${this.getSpentPoints()})`, x + 16, y + 25);

    const branches = [
      { id: TALENT_BRANCHES.BLOOM, name: '🌱 丰饶繁育' },
      { id: TALENT_BRANCHES.TIMBER, name: '🛡️ 苍翠坚木' },
      { id: TALENT_BRANCHES.ELEMENT, name: '⚡ 元素共鸣' },
      { id: TALENT_BRANCHES.COMMAND, name: '👑 自然神术' }
    ];

    const tabW = 108;
    const tabH = 30;
    const tabStartX = x + w - (branches.length * tabW + (branches.length - 1) * 6) - 12;
    for (let i = 0; i < branches.length; i++) {
      const b = branches[i];
      const tx = tabStartX + i * (tabW + 6);
      const ty = y + 10;
      const isCur = this.activeTab === b.id;

      ctx.fillStyle = isCur ? 'rgba(42, 82, 34, 0.96)' : 'rgba(34, 24, 16, 0.84)';
      ctx.strokeStyle = isCur ? '#FFD700' : 'rgba(196, 143, 69, 0.55)';
      ctx.lineWidth = isCur ? 2.0 : 1.2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tx, ty, tabW, tabH, 7) : ctx.rect(tx, ty, tabW, tabH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCur ? '#FFE58F' : '#E8D8B8';
      ctx.font = 'bold 12px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.name, tx + tabW * 0.5, ty + tabH * 0.5);

      if (ui) {
        ui.registerButton('tal_tab_' + b.id, tx, ty, tabW, tabH, () => {
          this.activeTab = b.id;
        });
      }
    }

    // 2. 当前分支下的 4 个阶梯天赋卡片（严密契合羊皮纸安全内容高度）
    const currentTalents = Object.values(TALENT_DEFS).filter(t => t.branch === this.activeTab);
    const cardW = (w - 56) / 4;
    const cardH = Math.max(250, Math.min(266, h - 66));
    const startY = y + 52;

    for (let i = 0; i < currentTalents.length; i++) {
      const t = currentTalents[i];
      const cx = x + 16 + i * (cardW + 8);
      const cy = startY;
      const curRank = this.getRank(t.id);
      const isMax = curRank >= t.maxRank;
      const canUp = this.canUpgrade(t.id);

      ctx.fillStyle = curRank > 0 ? 'rgba(32, 45, 30, 0.90)' : 'rgba(20, 16, 12, 0.82)';
      ctx.strokeStyle = isMax ? '#FFD700' : (curRank > 0 ? '#52C41A' : 'rgba(140, 94, 42, 0.40)');
      ctx.lineWidth = isMax ? 2.2 : 1.2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(cx, cy, cardW, cardH, 8) : ctx.rect(cx, cy, cardW, cardH);
      ctx.fill();
      ctx.stroke();

      // 天赋手绘原画徽章圆盘（彻底替代 Windows 方块 Emoji，统一暗黑奇幻插画质感）
      const iconAssets = {
        mycelium_network: 'assets/vfx/item_awakening_seed.png',
        bountiful_harvest: 'assets/vfx/prop_dew.png',
        photosynthetic_surge: 'assets/vfx/relic_lumina.png',
        elder_photosynthesis: 'assets/vfx/item_golden_spore.png',
        bark_armor: 'assets/vfx/relic_shield.png',
        iron_sporelings: 'assets/vfx/sporeling_guard.png',
        deep_entanglement: 'assets/vfx/vfx_spikes.png',
        living_citadel: 'assets/vfx/prop_lumina_a.png',
        superconduct_resonance: 'assets/vfx/relic_lightning.png',
        pyro_fissure: 'assets/vfx/vfx_explosion.png',
        toxic_miasma: 'assets/vfx/vfx_acid_puddle.png',
        prismatic_singularity: 'assets/vfx/relic_amber.png',
        quickened_mysticism: 'assets/vfx/relic_clover.png',
        tempest_surge: 'assets/vfx/vfx_mist.png',
        fertile_awakening: 'assets/vfx/card_lumina.png',
        avatar_of_nature: 'assets/vfx/hero_oak.png'
      };
      const iconImg = platform.getImage(iconAssets[t.id] || 'assets/vfx/item_golden_spore.png');
      const medCx = cx + cardW * 0.5;
      const medCy = cy + 36;
      const medR = 23;
      ctx.save();
      ctx.beginPath();
      ctx.arc(medCx, medCy, medR, 0, Math.PI * 2);
      ctx.fillStyle = curRank > 0 ? 'rgba(28, 48, 24, 0.96)' : 'rgba(18, 14, 10, 0.92)';
      ctx.fill();
      ctx.strokeStyle = isMax ? '#FFD700' : (curRank > 0 ? '#73D13D' : 'rgba(196, 143, 69, 0.55)');
      ctx.lineWidth = isMax ? 2.0 : 1.3;
      ctx.stroke();
      if (iconImg && iconImg.width) {
        const sc = Math.min(34 / iconImg.width, 34 / iconImg.height);
        const dw = iconImg.width * sc;
        const dh = iconImg.height * sc;
        ctx.drawImage(iconImg, medCx - dw * 0.5, medCy - dh * 0.5, dw, dh);
      } else {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.icon, medCx, medCy);
      }
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 14px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      ctx.fillStyle = isMax ? '#FFE58F' : '#FFFDF5';
      ctx.fillText(t.name, cx + cardW * 0.5, cy + 72);

      // 等级角标
      ctx.font = 'bold 11.5px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      ctx.fillStyle = isMax ? '#FFD700' : '#91D5FF';
      ctx.fillText(`等级: ${curRank} / ${t.maxRank}`, cx + cardW * 0.5, cy + 92);

      // 天赋描述
      ctx.font = '11px "Microsoft YaHei UI", "PingFang SC", sans-serif';
      ctx.fillStyle = '#E8DEC8';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      this.wrapText(ctx, t.desc, cx + 12, cy + 114, cardW - 24, 17);

      // 升级按钮（统一采用秘典手绘翡翠/木质按钮皮肤）
      const btnW = cardW - 24;
      const btnH = 32;
      const btnX = cx + 12;
      const btnY = cy + cardH - 44;
      const btnLabel = isMax ? '已臻化境' : (canUp ? `参悟 (${t.costPerRank}点)` : '点数不足');

      if (ui && typeof ui.drawPixelButton === 'function') {
        ui.drawPixelButton(ctx, 'tal_up_' + t.id, btnX, btnY, btnW, btnH, btnLabel, {
          skin: canUp && !isMax ? 'btn_green' : 'btn_wood',
          disabled: isMax || !canUp,
          font: 'bold 12px "Microsoft YaHei UI", "PingFang SC", sans-serif'
        }, () => {
          this.upgradeTalent(t.id);
        });
      } else {
        ctx.fillStyle = isMax ? 'rgba(60, 60, 60, 0.6)' : (canUp ? 'rgba(42, 112, 34, 0.94)' : 'rgba(100, 30, 30, 0.5)');
        ctx.strokeStyle = canUp ? '#95DE64' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(btnX, btnY, btnW, btnH, 6) : ctx.rect(btnX, btnY, btnW, btnH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFDF5';
        ctx.font = 'bold 12px "PingFang SC", "Microsoft YaHei UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btnLabel, btnX + btnW * 0.5, btnY + btnH * 0.5);
      }
    }

    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const paragraphs = String(text || '').split('\n');
    const noLineStart = '，。！？、；：）】》」』·,.!?;:)]}%';
    let curY = y;
    for (let p = 0; p < paragraphs.length; p++) {
      const chars = paragraphs[p].split('');
      let line = '';
      for (let n = 0; n < chars.length; n++) {
        const ch = chars[n];
        const testLine = line + ch;
        if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
          if (noLineStart.indexOf(ch) !== -1) {
            if (ctx.measureText(testLine).width <= maxWidth + 8) {
              line = testLine;
              continue;
            }
            if (line.length > 1) {
              const carry = line.slice(-1);
              ctx.fillText(line.slice(0, -1), x, curY);
              line = carry + ch;
              curY += lineHeight;
              continue;
            }
          }
          ctx.fillText(line, x, curY);
          line = ch;
          curY += lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line.length > 0) {
        ctx.fillText(line, x, curY);
      }
      curY += lineHeight;
    }
  }
}

module.exports = {
  AncientKnowledgeTree,
  TALENT_DEFS,
  TALENT_BRANCHES
};
