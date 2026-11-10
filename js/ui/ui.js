/**
 * 商业级奇幻森林手绘 UI 与 HUD 系统 (js/ui/ui.js)
 * 视觉体系：自然奇幻 × 手绘森林 × 雕刻深色木纹 × 暖色羊皮纸 × 古铜金属 × 森林绿珐琅
 * 界面布局：
 * 1. 全屏 960x540 俯视森林战场作为第一视觉主体（移除右侧常驻大面板）
 * 2. 左上角：深色木质藤蔓资源条（生命种子、黄金孢子、波次进度、提前迎敌号角/下波预告）
 * 3. 右上角：古铜木质快捷控制栏（倍速、暂停、图鉴、设置）
 * 4. 底部居中：植物塔防式蘑菇建造卡片栏（瞭望菇、菌雾菇、荆棘菇、爆裂菇）
 * 5. 动态弹出式：防御塔选中与升级羊皮纸木框面板（仅在点击防御塔或空地格时贴靠弹出，不遮挡道路与防御塔）
 */

const CONFIG = require('../data/config');
const PALETTE = require('../data/palette');
const { TOWERS, TOWER_ORDER } = require('../data/towers');
const { ENEMIES } = require('../data/enemies');
const { MAPS, MAP_ORDER } = require('../data/maps');
const { UI_ATLAS, MAP_ATLAS_LAYOUT } = require('../data/atlas');
const { drawUiIcon, drawSpellIcon, drawTowerSprite, drawEnemySprite, drawSubImage } = require('../core/atlasRenderer');
const platform = require('../core/platform');
const i18n = require('../i18n/index');
const storage = require('../save/storage');

const TILE_SIZE = CONFIG.RESOLUTION.TILE_SIZE; // 32

// 规范成熟的现代游戏无衬线字体栈（确保中英文字符在不同操作系统下均笔画清晰、绝不糊成黑团）
const UI_FONT = '"PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
// 典雅史诗风标题衬线字体栈（用于关卡大标题、胜利横幅）
const TITLE_FONT = '"Cinzel", "Noto Serif SC", "Songti SC", "SimSun", serif';
const GAME_FONT = UI_FONT;
const CN_FONT = UI_FONT;

// 四大材质标准色值
const THEME = {
  WOOD_DARK: '#3B2718',
  WOOD_MID: '#5E3E26',
  WOOD_LIGHT: '#875C39',
  PARCHMENT_BG: '#EBDAB2',
  PARCHMENT_LIGHT: '#F5E9C9',
  PARCHMENT_BORDER: '#C4A675',
  INK_DARK: '#2C180A',
  INK_MID: '#543820',
  BRONZE_DARK: '#8C5E2A',
  BRONZE_MID: '#C68F45',
  BRONZE_BRIGHT: '#F2CA74',
  ENAMEL_GREEN: '#3E6B38',
  ENAMEL_GREEN_BRIGHT: '#598E4E',
  CRIMSON_SELL: '#8C2D29',
  SAPPHIRE_PRIO: '#2E5678'
};

function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/**
 * 商业级游戏艺术字渲染器：
 * - 针对小号 UI 字体（<=15px）严格采用发丝级微描边（0.8px）与精细软阴影，彻底消除汉字笔画糊成黑泥团的劣质感；
 * - 羊皮纸/白底背景上采用清爽印刷墨色（无多余描边），保证字字清晰珠玑；
 * - 按钮及高亮字采用自适应双色微渐变与投影高光。
 */
function drawArtText(ctx, text, x, y, options = {}) {
  if (text === undefined || text === null || text === '') return;
  const str = String(text);
  const style = options.style || 'gold';
  const size = options.size || 14;
  const weight = options.weight || 'bold';
  const align = options.align || 'center';
  const baseline = options.baseline || 'middle';
  const fontFam = options.font || (size >= 24 ? TITLE_FONT : UI_FONT);

  ctx.save();
  ctx.font = `${weight} ${size}px ${fontFam}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  // 羊皮纸或浅色面板上的深色印刷文字：零描边、纯正雅致墨色
  if (style === 'ink' || style === 'parchment_body') {
    ctx.fillStyle = options.color || (style === 'ink' ? THEME.INK_DARK : THEME.INK_MID);
    ctx.fillText(str, x, y);
    ctx.restore();
    return;
  }

  // 按钮及徽章等深色/彩色背景文字的色彩方案
  let strokeColor = 'rgba(18, 10, 5, 0.78)';
  let gradColors = ['#FFF9DB', '#FFE58F', '#E6A728', '#8C5611'];
  let shadowColor = 'rgba(0, 0, 0, 0.65)';
  let shadowBlur = 1.5;
  let shadowY = 1.0;

  if (style === 'emerald') {
    strokeColor = 'rgba(8, 26, 7, 0.82)';
    gradColors = ['#F6FFED', '#D9F7BE', '#95DE64', '#389E0D'];
  } else if (style === 'crimson') {
    strokeColor = 'rgba(32, 7, 7, 0.82)';
    gradColors = ['#FFF1F0', '#FFCCC7', '#FF7875', '#CF1322'];
  } else if (style === 'azure') {
    strokeColor = 'rgba(5, 20, 36, 0.82)';
    gradColors = ['#E6F7FF', '#BAE7FF', '#69C0FF', '#1890FF'];
  } else if (style === 'parchment') {
    strokeColor = 'rgba(20, 14, 8, 0.75)';
    gradColors = ['#FFFDF5', '#F5ECD0', '#E5D3A6', '#C9B178'];
  } else if (style === 'white') {
    strokeColor = 'rgba(0, 0, 0, 0.82)';
    gradColors = ['#FFFFFF', '#FFFFFF', '#F0F0F0', '#D9D9D9'];
  }

  if (options.strokeColor) strokeColor = options.strokeColor;
  if (options.shadowColor) shadowColor = options.shadowColor;

  // 描边宽度限制：小字严控在 0.8~1.0px，彻底告别笔画被黑边吞没
  let effectiveStroke = 0;
  if (options.strokeWidth !== undefined) {
    effectiveStroke = options.strokeWidth;
  } else {
    effectiveStroke = size <= 15 ? 0.8 : (size <= 18 ? 1.1 : Math.min(2.0, size * 0.10));
  }

  // 性能飞跃优化：用 1px 偏移轻投影彻底替换极其昂贵的 ctx.shadowBlur（消除每秒上千次高斯模糊软光栅化）
  if (shadowColor && shadowColor !== 'transparent') {
    ctx.fillStyle = shadowColor;
    ctx.fillText(str, x, y + 1);
  }

  // 2. 发丝级描边（若开启）
  if (effectiveStroke > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = effectiveStroke * 1.3;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(str, x, y);
  }

  // 3. 字体字面（小字直接采用亮色常数，大字避免每帧频繁分配线性渐变对象）
  if (size <= 15 || style !== 'gold') {
    ctx.fillStyle = gradColors[0];
    ctx.fillText(str, x, y);
  } else {
    const h = size;
    const topY = baseline === 'middle' ? y - h * 0.5 : (baseline === 'top' ? y : y - h);
    const grad = ctx.createLinearGradient(x, topY, x, topY + h);
    grad.addColorStop(0.0, gradColors[0]);
    grad.addColorStop(0.45, gradColors[1]);
    grad.addColorStop(1.0, gradColors[2]);
    ctx.fillStyle = grad;
    ctx.fillText(str, x, y);
  }

  // 4. 大号黄金标题顶边微高光
  if (size >= 16 && style === 'gold') {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(str, x, y - 0.6);
    ctx.restore();
  }

  ctx.restore();
}

class UiManager {
  constructor() {
    this.buttons = [];
    this.hoverX = -1;
    this.hoverY = -1;
    this.uiAnimTime = 0;
    this.uiZenMode = false;
    this.zenTransitionAlpha = 0;

    // 弹窗与动态悬浮面板状态
    this.showSettingsModal = false;
    this.showGuideModal = false;
    this.guideStep = 0;
    this.codexTab = 0; // 0: 守林神卫, 1: 虫潮图鉴, 2: 领袖战术
    this.codexSelectedTower = 'watch';
    this.codexSelectedEnemy = 'beetle';
    this.codexEnemyPage = 0;
    this.inspectorOpen = false;
    this.inspectorRect = null;
    this.showTowerDetailBoard = false;

    // 顶部资源变化缩放反馈与建造冷却动画
    this.lastSeeds = null;
    this.lastSpores = null;
    this.seedPopTimer = 0;
    this.sporePopTimer = 0;
    this.cardCooldowns = { watch: 0, mist: 0, thorn: 0, burst: 0, lumina: 0 };
    this.cardMaxCooldowns = { watch: 4.5, thorn: 16.0, lumina: 7.0, mist: 8.0, burst: 20.0 };

    this.toastText = '';
    this.toastTimer = 0;

    // 拖拽放置守卫系统状态 (Drag-and-Drop)
    this.draggingTowerId = null;
    this.dragStartX = -1;
    this.dragStartY = -1;
    this.dragCurrentX = -1;
    this.dragCurrentY = -1;
    this.isDragging = false;
    this.pressedSlotButton = null;

// 轻度UI与自动褪去：维持当前玩家期望的展开度，不强制重置展开
  }

  update(realDt) {
    this.uiAnimTime += realDt;
    // 底部一体化控制舱与轻语言药丸平滑弹性插值
    const lerpSpeed = 14.0;
    this.dockExpansion += (this.dockTargetExpansion - this.dockExpansion) * Math.min(1.0, realDt * lerpSpeed);
    if (this.toastTimer > 0) {
      this.toastTimer = Math.max(0, this.toastTimer - realDt);
    }
    if (this.seedPopTimer > 0) {
      this.seedPopTimer = Math.max(0, this.seedPopTimer - realDt);
    }
    if (this.sporePopTimer > 0) {
      this.sporePopTimer = Math.max(0, this.sporePopTimer - realDt);
    }
    for (let i = 0; i < TOWER_ORDER.length; i++) {
      const k = TOWER_ORDER[i];
      if (this.cardCooldowns[k] > 0) {
        this.cardCooldowns[k] = Math.max(0, this.cardCooldowns[k] - realDt);
      }
    }
  }

  notifyTowerBuilt(towerId) {
    if (towerId && this.cardCooldowns[towerId] !== undefined) {
      this.cardCooldowns[towerId] = (this.cardMaxCooldowns && this.cardMaxCooldowns[towerId]) || 5.0;
    }
  }

  showToast(text, duration = 1.4) {
    this.toastText = text;
    this.toastTimer = duration;
  }

  clearButtons() {
    this.buttons.length = 0;
  }

  registerButton(id, x, y, w, h, onClick, meta = {}) {
    this.buttons.push({ id, x, y, w, h, onClick, meta });
  }

  handlePointerMove(x, y, scene) {
    this.hoverX = x;
    this.hoverY = y;
    if (this.draggingTowerId) {
      this.dragCurrentX = x;
      this.dragCurrentY = y;
      const dist = Math.hypot(x - this.dragStartX, y - this.dragStartY);
      // 只有当玩家手指明确向上拖出底栏（y < 425）且移动距离达到 18px 时，才进入拖拽放置模式
      if (dist >= 14 && (y < 460 || dist >= 22)) {
        this.isDragging = true;
        if (scene) {
          scene.selectedBuildTowerId = this.draggingTowerId;
        }
      }
    }

    // 手机移动端滑动扫线拾取能量 (Swipe-to-collect)
    if (scene && scene.state === 'BATTLE') {
      // 触碰战场区域时自动让重型UI褪去收缩，保持战场开阔纯净零误触
      if (!this.showGuideModal && !this.showSettingsModal && y < 435 && y > 58) {
        if (!this.inspectorOpen || !this.inspectorRect || x < this.inspectorRect.x || x > this.inspectorRect.x + this.inspectorRect.w || y < this.inspectorRect.y || y > this.inspectorRect.y + this.inspectorRect.h) {
          this.dockTargetExpansion = 0.0;
        }
      }
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const mx = (x - mv.OFFSET_X) / (mv.SCALE || 1);
      const my = (y - mv.OFFSET_Y) / (mv.SCALE || 1);
      if (scene.sporeDropManager) {
        scene.sporeDropManager.handlePointerDown(mx, my, scene.economy, scene.fx);
      }
      if (scene.relicManager) {
        scene.relicManager.checkClick(mx, my, scene);
      }
      if (scene.contraptions) {
        scene.contraptions.handlePointerDown(mx, my, scene);
      }
    }
  }

  /**
   * 处理按压事件（支持短点击与拖拽起步）
   */
  handlePointerDown(x, y, scene) {
    this.hoverX = x;
    if (scene && scene.fx && typeof scene.fx.spawnTouchRipple === 'function') {
      scene.fx.spawnTouchRipple(x, y);
    }
    this.hoverY = y;
    this.dragStartX = x;
    this.dragStartY = y;
    this.dragCurrentX = x;
    this.dragCurrentY = y;
    this.isDragging = false;
    this.draggingTowerId = null;
    this.pressedSlotButton = null;

    // 若当前开启了图鉴秘典弹窗，优先拦截并处理弹窗内按钮交互与外部点击关闭
    if (this.showGuideModal) {
      for (let i = this.buttons.length - 1; i >= 0; i--) {
        const b = this.buttons[i];
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          if (b.onClick) b.onClick(b);
          return true;
        }
      }
      const mw = 800;
      const mh = 480;
      const mx = (960 - mw) * 0.5;
      const my = (540 - mh) * 0.5;
      if (x < mx || x > mx + mw || y < my || y > my + mh) {
        this.showGuideModal = false;
        storage.markGuideSeen();
        platform.playSfx('sfx_click');
        return true;
      }
      return true;
    }

    if (scene && scene.state === 'BATTLE') {
      // 触碰战场区域时自动让重型UI褪去收缩，保持战场开阔纯净零误触
      if (!this.showGuideModal && !this.showSettingsModal && y < 435 && y > 58) {
        if (!this.inspectorOpen || !this.inspectorRect || x < this.inspectorRect.x || x > this.inspectorRect.x + this.inspectorRect.w || y < this.inspectorRect.y || y > this.inspectorRect.y + this.inspectorRect.h) {
          this.dockTargetExpansion = 0.0;
        }
      }
      // (0) 实时战斗统计面板开关与点击 (屏幕空间)
      if (scene.combatAnalytics && scene.combatAnalytics.handleClick(x, y)) {
        return true;
      }
      if (scene.heroSkills && scene.heroSkills.handleClick(x, y, scene)) {
        return true;
      }

      // 计算精准地图世界坐标 (mx, my)
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const mx = (x - mv.OFFSET_X) / (mv.SCALE || 1);
      const my = (y - mv.OFFSET_Y) / (mv.SCALE || 1);

      // (A) 晨露金孢即时触控点击收集 (支持手机大判定区)
      if (scene.sporeDropManager && scene.sporeDropManager.handlePointerDown(mx, my, scene.economy, scene.fx)) {
        return true;
      }

      // (A2) 精英怪/Boss掉落战利品道具拾取 (Relic Coin/Clover/Shield/Lightning)
      if (scene.relicManager && scene.relicManager.checkClick(mx, my, scene)) {
        return true;
      }

      // (A3) 奇幻森林环境晨露与生灵机关互动拾取
      if (scene.contraptions && scene.contraptions.handlePointerDown(mx, my, scene)) {
        return true;
      }

      // (B) 掘地潜行怪点击踩踏 & 自爆蝉点击泄气
      if (scene.enemyManager && scene.enemyManager.handleClickOnEnemy(mx, my, scene.fx)) {
        return true;
      }

      // (C) 茧丝缠绕快速点击救援 (Tap-to-Rescue，统一交由 towerManager.rescueWeb 扣减蛛丝血点)
      if (scene.towerManager && scene.towerManager.towers) {
        for (let i = 0; i < scene.towerManager.towers.length; i++) {
          const tw = scene.towerManager.towers[i];
          if (tw.isWebbed && Math.hypot(mx - tw.x, my - tw.y) <= 38) {
            if (scene.towerManager.rescueWeb(tw, scene.fx, scene.economy)) {
              return true;
            }
          }
        }
      }
    }
    this.hoverX = x;
    this.hoverY = y;
    this.dragStartX = x;
    this.dragStartY = y;
    this.dragCurrentX = x;
    this.dragCurrentY = y;
    this.isDragging = false;
    this.draggingTowerId = null;
    this.pressedSlotButton = null;

    // 先检测是否按在底部卡牌插槽上
    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        if (b.id && (b.id.indexOf('slot_') === 0 || b.id.indexOf('dock_card_') === 0)) {
          const tId = (b.meta && b.meta.towerId) || b.id.replace('slot_', '').replace('dock_card_', '');
          this.draggingTowerId = tId;
          this.pressedSlotButton = b;
          // 手机端关键优化：按下瞬间即时选中卡牌（零延迟响应，告别卡顿感）
          if (scene && typeof scene.selectBuildTowerType === 'function') {
            scene.selectBuildTowerType(tId);
          }
          platform.playSfx('sfx_click');
          return true;
        } else {
          if (b.onClick) {
            try {
              b.onClick(b);
            } catch (btnErr) {
              if (typeof console !== 'undefined' && console.error) {
                console.error('[Button Click Recovered]:', btnErr);
              }
            }
          }
          return true;
        }
      }
    }

    if (this.inspectorOpen && this.inspectorRect) {
      const r = this.inspectorRect;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        return true;
      }
    }
    return false;
  }

  /**
   * 处理释放事件（松手放置守卫或响应按钮短按）
   */
  handlePointerUp(x, y, scene) {
    // 手机端极速响应：若手指只是点按卡牌（未大幅拖拽），立即视为点击选中卡牌
    const dragDist = Math.hypot(x - this.dragStartX, y - this.dragStartY);
    if (this.pressedSlotButton && (!this.isDragging || dragDist < 14)) {
      if (this.pressedSlotButton.onClick) {
        try {
          this.pressedSlotButton.onClick(this.pressedSlotButton);
        } catch (btnErr) {}
      }
      this.draggingTowerId = null;
      this.isDragging = false;
      this.pressedSlotButton = null;
      return;
    }

    if (this.isDragging && this.draggingTowerId && scene && scene.state === 'BATTLE') {
      const tId = this.draggingTowerId;
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const mx = (x - mv.OFFSET_X) / mv.SCALE;
      const my = (y - mv.OFFSET_Y) / mv.SCALE;
      const col = Math.floor(mx / TILE_SIZE);
      const row = Math.floor(my / TILE_SIZE);

      // 智能磁吸吸附：若手指偏离在草地边缘或道路旁几个像素内，自动锁定最近的有效建造格
      if (scene.map && scene.towerManager) {
        if (!scene.map.canBuildAt(col, row) || scene.towerManager.getTowerAt(col, row)) {
          const offsets = [
            [0, -1], [0, 1], [-1, 0], [1, 0],
            [-1, -1], [1, -1], [-1, 1], [1, 1]
          ];
          let bestD = 1.35;
          let bestC = col, bestR = row;
          for (let k = 0; k < offsets.length; k++) {
            const nc = col + offsets[k][0];
            const nr = row + offsets[k][1];
            if (scene.map.inBounds(nc, nr) && scene.map.canBuildAt(nc, nr) && !scene.towerManager.getTowerAt(nc, nr)) {
              const d = Math.hypot((nc + 0.5) - (mx / TILE_SIZE), (nr + 0.5) - (my / TILE_SIZE));
              if (d < bestD) {
                bestD = d;
                bestC = nc;
                bestR = nr;
              }
            }
          }
          if (bestD < 1.35) {
            col = bestC;
            row = bestR;
          }
        }
      }

      if (scene.map && scene.map.inBounds(col, row)) {
        if (scene.map.canBuildAt(col, row)) {
          const tDef = TOWERS[tId];
          const cost = tDef ? tDef.nodes.base.cost : 100;
          if (scene.economy && scene.economy.canAfford(cost)) {
            const tower = scene.towerManager.buildTower(tId, col, row, scene.map, scene.economy, scene.fx);
            if (tower) {
              this.notifyTowerBuilt(tId);
              // 触发落地弹性压扁回弹动画 (Squash & Stretch)
              tower.squashTimer = 0.30;
              // 触发相机微震动
              scene.fx.triggerScreenShake(3.0, 0.12);
              // 仙女环生机绿叶与金色孢子爆发冲击波
              scene.fx.spawnParticles(tower.x, tower.y, 22, [PALETTE.BRANCH_A, '#FFE58F', '#52C41A', '#FFFFFF'], 35, 110, 0.25, 0.55, 4.5);
              scene.fx.spawnFloatingText(tower.x, tower.y - 18, `-${cost} 孢子`, '#FFE58F', 1.15);
              platform.playSfx('sfx_build');
              // 放置后保持战场干净清爽，不显示任何攻击距离特效（仅在后续点击该守卫时才展示）
              scene.selectedTile = { col: -1, row: -1 };
              this.inspectorOpen = false;
            }
          } else {
            scene.fx.spawnFloatingText(x, y - 20, '黄金孢子不足!', '#FF4D4F', 1.1);
            scene.fx.triggerScreenShake(1.5, 0.08);
            platform.playSfx('sfx_hurt');
          }
        } else {
          // 非法格子（在道路或障碍物或已有塔上）
          scene.fx.spawnFloatingText(x, y - 20, '此处无法扎根!', '#FF7875', 1.0);
          scene.fx.spawnParticles(x - mv.OFFSET_X, y - mv.OFFSET_Y, 8, ['#D9D9D9', '#8C8C8C'], 15, 40, 0.15, 0.3, 2.5);
          platform.playSfx('sfx_hurt');
        }
      } else {
        platform.playSfx('sfx_hurt');
      }
    } else if (this.pressedSlotButton && !this.isDragging) {
      if (this.pressedSlotButton.onClick) {
        try {
          this.pressedSlotButton.onClick(this.pressedSlotButton);
        } catch (btnErr) {
          if (typeof console !== 'undefined' && console.error) {
            console.error('[Slot Button Click Recovered]:', btnErr);
          }
        }
      }
    }

    this.draggingTowerId = null;
    this.isDragging = false;
    this.pressedSlotButton = null;

  }

  isPointHovered(x, y, w, h) {
    return this.hoverX >= x && this.hoverX <= x + w && this.hoverY >= y && this.hoverY <= y + h;
  }

  /**
   * 绘制 AI 绘画 UI 框架组件（带优雅阴影与退化回退）
   */
  drawAiFrame(ctx, frameKey, x, y, w, h, alpha = 1.0) {
    const uiImg = platform.getImage(UI_ATLAS.path);
    const rect = UI_ATLAS.frames && UI_ATLAS.frames[frameKey];
    if (uiImg && rect) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = true;
      if (typeof ctx.imageSmoothingQuality !== 'undefined') {
        ctx.imageSmoothingQuality = 'low';
      }

      const k = (uiImg.width && uiImg.width >= 1024) ? 4 : 1;
      const sx = rect.x * k;
      const sy = rect.y * k;
      const sw = rect.w * k;
      const sh = rect.h * k;

      // 按钮类元素采用成熟的 3-Slice 水平切片：
      // 两端精致的金属包角固定在 16~18px 比例，绝不拉伸变形；
      // 中间平滑延展，为内部文本与图标留出宽阔舒适的放置空间！
      if (frameKey.startsWith('btn_')) {
        const srcCapW = Math.round(sw * 0.25);
        const dstCapW = Math.min(18, Math.max(12, Math.round(h * 0.45)));
        // 1. 左侧金属端头
        ctx.drawImage(uiImg, sx, sy, srcCapW, sh, Math.round(x), Math.round(y), dstCapW, Math.round(h));
        // 2. 中间平展底色
        const midDstW = Math.max(0, Math.round(w) - dstCapW * 2);
        if (midDstW > 0) {
          ctx.drawImage(uiImg, sx + srcCapW, sy, sw - srcCapW * 2, sh, Math.round(x + dstCapW), Math.round(y), midDstW, Math.round(h));
        }
        // 3. 右侧金属端头
        ctx.drawImage(uiImg, sx + sw - srcCapW, sy, srcCapW, sh, Math.round(x + w - dstCapW), Math.round(y), dstCapW, Math.round(h));
      } else {
        ctx.drawImage(uiImg, sx, sy, sw, sh, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
      }

      ctx.restore();
      platform.recordDrawCall(1);
      return true;
    }
    return false;
  }

  /**
   * 森林木质羊皮纸面板
   */
  drawWoodlandPanel(ctx, x, y, w, h, borderColor = THEME.BRONZE_MID, bgAlpha = 0.96, radius = 12, useParchment = false) {
    ctx.save();
    // 底部投影
    roundRectPath(ctx, x + 2, y + 5, w, h, radius);
    ctx.fillStyle = 'rgba(8, 14, 10, 0.46)';
    ctx.fill();

    if (useParchment && this.drawAiFrame(ctx, 'inspector_board', x, y, w, h, bgAlpha)) {
      ctx.restore();
      return;
    }

    roundRectPath(ctx, x, y, w, h, radius);
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    if (useParchment) {
      grad.addColorStop(0, THEME.PARCHMENT_LIGHT);
      grad.addColorStop(1, THEME.PARCHMENT_BG);
    } else {
      grad.addColorStop(0, `rgba(68, 46, 28, ${bgAlpha})`);
      grad.addColorStop(1, `rgba(38, 25, 15, ${bgAlpha})`);
    }
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    roundRectPath(ctx, x + 4, y + 4, w - 8, h - 8, Math.max(4, radius - 3));
    ctx.lineWidth = 1;
    ctx.strokeStyle = useParchment ? 'rgba(110, 74, 38, 0.35)' : 'rgba(255, 224, 150, 0.25)';
    ctx.stroke();
    ctx.restore();
    platform.recordDrawCall(2);
  }

  /**
   * 纯 AI 质感按钮（支持 btn_green / btn_wood / btn_red / btn_blue 等 AI 手绘按钮皮）
   */
  drawPixelButton(ctx, id, x, y, w, h, label, options = {}, onClick = null) {
    const hovered = this.isPointHovered(x, y, w, h);
    const disabled = Boolean(options.disabled);
    const skin = options.skin || (options.bgColor === '#3B1F2B' ? 'btn_red' : (options.bgColor ? 'btn_green' : 'btn_wood'));
    const drawY = hovered && !disabled ? y - 1 : y;

    ctx.save();
    // 按钮底部阴影
    roundRectPath(ctx, x + 1, drawY + 3, w - 2, h, 8);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.fill();

    const drewAi = this.drawAiFrame(ctx, skin, x, drawY, w, h, disabled ? 0.52 : 1.0);
    if (!drewAi) {
      roundRectPath(ctx, x, drawY, w, h, 8);
      ctx.fillStyle = disabled ? '#2A2622' : (skin === 'btn_green' ? THEME.ENAMEL_GREEN : (skin === 'btn_red' ? THEME.CRIMSON_SELL : THEME.WOOD_MID));
      ctx.fill();
      ctx.strokeStyle = hovered && !disabled ? THEME.BRONZE_BRIGHT : THEME.BRONZE_MID;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (hovered && !disabled) {
      roundRectPath(ctx, x + 2, drawY + 2, w - 4, h - 4, 7);
      ctx.strokeStyle = 'rgba(255, 238, 170, 0.78)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    const iconSize = options.iconSize || Math.min(22, h - 10);
    if (options.iconKey) {
      drawUiIcon(ctx, options.iconCat || 16, options.iconKey, x + 12, drawY + Math.floor((h - iconSize) * 0.5), iconSize);
    }

    let fSize = 13;
    if (options.font) {
      const match = options.font.match(/(\d+(?:\.\d+)?)px/);
      if (match) fSize = Math.round(parseFloat(match[1]));
    }
    const textX = options.align === 'left'
      ? (x + (options.iconKey ? iconSize + 16 : 14))
      : (x + w * 0.5 + (options.iconKey ? iconSize * 0.35 : 0));

    const artStyle = disabled
      ? 'parchment'
      : (skin === 'btn_green' ? 'emerald' : (skin === 'btn_red' ? 'crimson' : (skin === 'btn_blue' ? 'azure' : 'gold')));

    drawArtText(ctx, label, textX, drawY + h * 0.5, {
      style: artStyle,
      size: fSize,
      align: options.align || 'center',
      baseline: 'middle',
      strokeWidth: disabled ? 0.8 : 1.0
    });

    if (options.subLabel) {
      drawArtText(ctx, options.subLabel, x + w - 20, drawY + h * 0.5, {
        style: options.subStyle || (options.subColor === '#FF7875' ? 'crimson' : 'gold'),
        size: 12,
        align: 'right',
        baseline: 'middle',
        strokeWidth: 1.0
      });
    }
    ctx.restore();

    if (onClick && !disabled) {
      this.registerButton(id, x, y, w, h, onClick);
    }
  }

  // =========================================================================
  // 1. 标题画面 (TITLE)
  // =========================================================================
  renderTitleScreen(ctx, scene) {
    this.clearButtons();

    const titleBg = platform.getImage(UI_ATLAS.titleBgPath);
    if (titleBg) {
      ctx.drawImage(titleBg, 0, 0, 960, 540);
      platform.recordDrawCall(1);
    } else {
      ctx.fillStyle = PALETTE.NIGHT_DEEP;
      ctx.fillRect(0, 0, 960, 540);
    }

    // 森林萤火孢子微粒动画
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 97 + Math.floor(this.uiAnimTime * (12 + (i % 5) * 4))) % 920) + 20;
      const sy = ((i * 61 - Math.floor(this.uiAnimTime * (10 + (i % 4) * 3))) % 460 + 460) % 460 + 20;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 228, 130, 0.72)' : 'rgba(145, 255, 165, 0.65)';
      ctx.beginPath();
      ctx.arc(sx, sy, i % 2 === 0 ? 2.4 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 顶部大气手绘木纹金匾标题（纯净无任何图像烘焙文字，支持实时语言切换）
    const titleBannerW = 430;
    const titleBannerH = 74;
    const titleBannerX = (960 - titleBannerW) * 0.5;
    const titleBannerY = 34;
    this.drawAiFrame(ctx, 'top_bar', titleBannerX, titleBannerY, titleBannerW, titleBannerH, 0.94);
    drawArtText(ctx, i18n.getLang() === 'zh' ? '蘑菇守林' : 'MUSHROOM GUARD', 480, titleBannerY + 32, {
      style: 'gold',
      size: 32,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 2.2
    });
    drawArtText(ctx, i18n.getLang() === 'zh' ? '奇幻森林策略塔防 · 双线固守' : 'FANTASY FOREST DEFENSE', 480, titleBannerY + 57, {
      style: 'parchment',
      size: 11,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.9
    });

    // 底部雕刻木质命令栏
    this.drawAiFrame(ctx, 'top_bar', 106, 450, 748, 76, 0.96);

    const btns = [
      { id: 'title_start', label: i18n.t('btn_start'), icon: 'play', cat: 16, skin: 'btn_green', cb: () => scene.enterLevelSelect() },
      { id: 'title_levels', label: i18n.t('btn_level_select'), icon: 'star_full', cat: 16, skin: 'btn_wood', cb: () => scene.enterLevelSelect() },
      { id: 'title_guide', label: i18n.t('btn_guide'), icon: 'guide', cat: 24, skin: 'btn_wood', cb: () => { this.guideStep = 0; this.showGuideModal = true; } },
      { id: 'title_settings', label: i18n.t('btn_settings'), icon: 'settings', cat: 16, skin: 'btn_wood', cb: () => { this.showSettingsModal = true; } }
    ];
    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      const bx = 136 + i * 176;
      this.drawPixelButton(ctx, b.id, bx, 466, 160, 44, b.label, {
        skin: b.skin,
        font: `bold 16px ${CN_FONT}`,
        iconCat: b.cat,
        iconKey: b.icon
      }, () => {
        platform.playSfx('sfx_click');
        b.cb();
      });
    }

    this.drawPixelButton(ctx, 'title_lang', 18, 18, 114, 36, i18n.getLang() === 'zh' ? '语言：中文' : 'Lang: EN', {
      skin: 'btn_wood',
      font: `bold 13px ${CN_FONT}`
    }, () => {
      const nextLang = i18n.toggleLang();
      storage.updateSettings({ lang: nextLang });
      platform.playSfx('sfx_click');
    });

    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx, scene);
    } else if (this.showGuideModal) {
      this.renderGuideModal(ctx, scene);
    }
  }

  // =========================================================================
  // 2. 关卡选择画面 (LEVEL_SELECT)
  // =========================================================================
  renderLevelSelect(ctx, scene) {
    this.clearButtons();

    const titleBg = platform.getImage(UI_ATLAS.titleBgPath);
    if (titleBg) {
      ctx.drawImage(titleBg, 0, 0, 960, 540);
      ctx.fillStyle = 'rgba(14, 22, 16, 0.76)';
      ctx.fillRect(0, 0, 960, 540);
    } else {
      ctx.fillStyle = PALETTE.NIGHT_DEEP;
      ctx.fillRect(0, 0, 960, 540);
    }

    // 顶部木质横幅
    this.drawAiFrame(ctx, 'top_bar', 270, 10, 420, 56, 0.98);
    ctx.fillStyle = THEME.BRONZE_BRIGHT;
    ctx.font = 'bold 22px ' + CN_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i18n.t('btn_level_select'), 480, 38);

    this.drawPixelButton(ctx, 'lvl_back', 24, 18, 112, 40, i18n.t('btn_back'), {
      skin: 'btn_wood',
      font: `bold 15px ${CN_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      scene.enterTitle();
    });

    this.drawPixelButton(ctx, 'lvl_settings', 700, 18, 112, 40, i18n.t('btn_settings'), {
      skin: 'btn_wood',
      iconKey: 'settings',
      font: `bold 14px ${CN_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      this.showSettingsModal = true;
    });

    const save = storage.getSave();

    for (let i = 0; i < MAP_ORDER.length; i++) {
      const mapId = MAP_ORDER[i];
      const mData = MAPS[mapId];
      const rec = (save.maps && save.maps[mapId]) || { unlocked: i === 0, stars: 0, bestTime: null, bestSeeds: 0 };
      const cardX = 24 + i * 312;
      const cardY = 80;
      const cardW = 288;
      const cardH = 430;

      // 使用 AI 手绘木框羊皮纸大卡片
      this.drawWoodlandPanel(ctx, cardX, cardY, cardW, cardH, rec.unlocked ? THEME.BRONZE_MID : '#5A554C', 0.98, 14, true);

      const prevX = cardX + 24;
      const prevY = cardY + 24;
      const prevW = cardW - 48;
      const prevH = 132;
      const mAtlas = platform.getImage(mData.atlasPath);
      if (mAtlas && MAP_ATLAS_LAYOUT.sceneBg) {
        const sb = MAP_ATLAS_LAYOUT.sceneBg;
        drawSubImage(ctx, mAtlas, sb.x, sb.y, sb.w, sb.h, prevX, prevY, prevW, prevH);
      } else {
        ctx.fillStyle = mData.parallaxColors[1] || PALETTE.GROUND_DARK;
        ctx.fillRect(prevX, prevY, prevW, prevH);
      }
      // 缩略图保留手绘原生道路质感，仅用极精简点位标记出怪巢穴与守护林屋
      const mapPadX = prevX + prevW * (160 / 960);
      const mapPadY = prevY + prevH * (30 / 540);
      const mapDrawW = prevW * (640 / 960);
      const mapDrawH = prevH * (480 / 540);
      const drawLandmarkDot = (tile, fillCol, rimCol, rad) => {
        if (!tile) return;
        const px = mapPadX + ((tile[0] + 0.5) / 20) * mapDrawW;
        const py = mapPadY + ((tile[1] + 0.5) / 15) * mapDrawH;
        ctx.save();
        ctx.fillStyle = rimCol;
        ctx.beginPath();
        ctx.arc(px, py, rad + 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = fillCol;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawLandmarkDot(mData.spawnTile, '#FF4D4F', 'rgba(20, 12, 10, 0.85)', 3.2);
      drawLandmarkDot(mData.spawnTile2, '#B37FEB', 'rgba(20, 12, 18, 0.85)', 2.8);
      drawLandmarkDot(mData.warehouseTile, '#FFD666', 'rgba(42, 24, 10, 0.90)', 3.6);

      ctx.strokeStyle = THEME.WOOD_DARK;
      ctx.lineWidth = 3;
      ctx.strokeRect(prevX, prevY, prevW, prevH);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 19px ${CN_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(i18n.t(mData.nameKey), cardX + cardW * 0.5, cardY + 178);

      ctx.fillStyle = THEME.ENAMEL_GREEN;
      ctx.font = `bold 13px ${CN_FONT}`;
      ctx.fillText(i18n.t(mData.subtitleKey), cardX + cardW * 0.5, cardY + 201);

      for (let s = 0; s < 3; s++) {
        const starKey = s < rec.stars ? 'star_full' : 'star_empty';
        drawUiIcon(ctx, 16, starKey, cardX + 96 + s * 34, cardY + 216, 28);
      }

      this.drawWrappedText(ctx, i18n.t(mData.descKey), cardX + 26, cardY + 258, cardW - 52, 18, THEME.INK_MID, `12px ${CN_FONT}`);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 12px ${CN_FONT}`;
      ctx.textAlign = 'left';
      const timeStr = rec.bestTime !== null ? (rec.bestTime + 's') : i18n.t('record_none');
      const seedStr = rec.bestSeeds > 0 ? (rec.bestSeeds + ' / 20') : i18n.t('record_none');
      ctx.fillText(i18n.t('best_time') + ': ' + timeStr, cardX + 26, cardY + 322);
      ctx.fillText(i18n.t('best_seeds') + ': ' + seedStr, cardX + 26, cardY + 342);

      if (rec.unlocked) {
        const hasCleared = rec.stars > 0;
        const startW = hasCleared ? (cardW - 146) : (cardW - 56);
        this.drawPixelButton(ctx, 'play_' + mapId, cardX + 24, cardY + 362, startW, 44, i18n.t('btn_start'), {
          skin: 'btn_green',
          font: `bold ${hasCleared ? 14 : 16}px ${CN_FONT}`,
          iconKey: 'play'
        }, () => {
          platform.playSfx('sfx_click');
          scene.startLevel(mapId);
        });
        if (hasCleared) {
          this.drawPixelButton(ctx, 'endless_' + mapId, cardX + 30 + startW, cardY + 362, 92, 44, '无尽模式', {
            skin: 'btn_wood',
            font: `bold 12px ${CN_FONT}`
          }, () => {
            platform.playSfx('sfx_horn');
            scene.startEndlessMode(mapId);
          });
        }
      } else {
        this.drawPixelButton(ctx, 'locked_' + mapId, cardX + 28, cardY + 362, cardW - 56, 44, i18n.t('map_locked'), {
          skin: 'btn_wood',
          disabled: true,
          font: `bold 13px ${CN_FONT}`,
          iconKey: 'lock'
        });
      }
    }

    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx, scene);
    }
  }

  // =========================================================================
  // 3. 战斗 HUD：全屏森林战场环绕式布局
  // =========================================================================
  /**
   * 纯净全景地图模式切换（一键隐藏全部UI，享受纯正森林大地图全景）
   */
  toggleZenMode(fx = null) {
    this.uiZenMode = !this.uiZenMode;
    platform.playSfx('sfx_click');
    if (fx) {
      if (this.uiZenMode) {
        fx.spawnFloatingText(480, 200, '纯净全景地图已开启 (按 H 键恢复界面)', '#FFE58F', 1.8);
      } else {
        fx.spawnFloatingText(480, 200, '战术指挥界面已恢复', '#BAE7FF', 1.5);
      }
    }
  }

  renderBattleHud(ctx, scene) {
    this.clearButtons();

    // 纯净全景地图模式：全屏无任何遮挡，仅保留左上角半透明恢复按钮与全局模态弹窗
    if (this.uiZenMode) {
      const rw = 142;
      const rh = 34;
      const rx = 14;
      const ry = 14;
      ctx.save();
      roundRectPath(ctx, rx, ry, rw, rh, 8);
      ctx.fillStyle = 'rgba(20, 14, 8, 0.75)';
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      drawArtText(ctx, '👁️ 恢复界面 [H]', rx + rw * 0.5, ry + rh * 0.5, {
        style: 'gold',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.2
      });
      ctx.restore();

      this.registerButton('btn_zen_restore', rx, ry, rw, rh, () => {
        this.toggleZenMode(scene.fx);
      });

      if (this.showSettingsModal) {
        this.renderSettingsModal(ctx, scene);
      } else if (this.showGuideModal) {
        this.renderGuideModal(ctx, scene);
      } else if (scene.state === 'PAUSED') {
        this.renderPauseOverlay(ctx, scene);
      } else if (scene.state === 'SETTLEMENT') {
        this.renderSettlementOverlay(ctx, scene);
      }
      return;
    }

    // 若处于结算或暂停状态，直接渲染专属结算/暂停面板并返回，彻底杜绝下层任何操作冲突与UI残留
    if (scene.state === 'SETTLEMENT') {
      this.renderSettlementOverlay(ctx, scene);
      return;
    }
    if (scene.state === 'PAUSED') {
      this.renderPauseOverlay(ctx, scene);
      if (this.showSettingsModal) {
        this.renderSettingsModal(ctx, scene);
      }
      return;
    }

    // 0. 顶部极简天候微章 (可随时轻触自由切换晨曦晴空、幽夜微光、林地迷雾等沉浸天候)
    if (scene.weather) {
      scene.weather.renderWeatherHudBadge(ctx, 16, 14);
      this.registerButton('pvz_weather_badge', 16, 14, 100, 26, () => {
        platform.playSfx('sfx_click');
        scene.weather.cycleWeather(scene);
      });
    }

    // 1. 【植物大战僵尸风格】顶部一体化经典木质卡槽栏 (PvZ Top Seed Bank: 阳光金孢 + 5蘑菇卡牌 + 觉醒豆)
    this.renderPvZTopSeedBank(ctx, scene);

    // 2. 顶部波次推进旗舰进度槽 (PvZ Wave Flag Meter)
    this.renderPvZTopWaveBar(ctx, scene);

    // 3. 顶部右上角极简控制栏 (仅 3 个清晰木质按钮: [倍速], [暂停], [菜单])
    this.renderPvZTopRightMenu(ctx, scene);

    // 4. 【彻底释放全屏战场】左下角极简圆盘英雄徽章与3大自然神术法球 (占据极小空间，95%画面完全纯净沉浸！)
    this.renderPvZBottomLeftHeroAndSpells(ctx, scene);

    if (scene.achievements) {
      scene.achievements.renderToast(ctx);
    }

    // 5. 动态弹出式：防御塔选中与升级羊皮纸木框面板（仅在点击交互时弹出）
    if (this.inspectorOpen) {
      this.renderTowerInspectorPopup(ctx, scene);
    } else {
      this.inspectorRect = null;
    }

    // 6. 处于战术法术施法瞄准时绘制动态准星与范围环
    if (scene.activeSpellCasting) {
      this.renderSpellTargetingReticle(ctx, scene);
    }
    if (scene.activeRallyTargeting) {
      this.renderRallyTargetingReticle(ctx, scene);
    }

    // 6.5 拖拽放置守卫全息射程环与磁吸吸附高亮
    this.renderTowerDragPreview(ctx, scene);

    // 7. 轻量化提示气泡
    if (this.toastTimer > 0 && this.toastText) {
      ctx.save();
      this.drawAiFrame(ctx, 'btn_wood', 330, 74, 300, 38, 0.95);
      drawArtText(ctx, this.toastText, 480, 93, {
        style: 'parchment',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.5
      });
      ctx.restore();
    }

    // 8. 模态弹窗（暂停、结算、新手引导、设置）
    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx, scene);
    } else if (this.showGuideModal) {
      this.renderGuideModal(ctx, scene);
    } else if (scene.state === 'PAUSED') {
      this.renderPauseOverlay(ctx, scene);
    } else if (scene.state === 'SETTLEMENT') {
      this.renderSettlementOverlay(ctx, scene);
    }

    // 8.5 实时战斗DPS战报分析仪表盘 (全屏弹窗)
    if (scene.combatAnalytics) {
      scene.combatAnalytics.renderAnalyticsDashboard(ctx);
    }
  }

  /**
   * 3.1 左上角深色雕刻木质资源栏（生命种子、黄金孢子、波次进度、提前迎敌）
   */
  renderTopResourceBar(ctx, scene) {
    const seeds = scene.economy.seeds;
    const spores = scene.economy.spores;
    if (this.lastSeeds !== null && this.lastSeeds !== seeds) {
      this.seedPopTimer = 0.28;
    }
    if (this.lastSpores !== null && this.lastSpores !== spores) {
      this.sporePopTimer = 0.24;
    }
    this.lastSeeds = seeds;
    this.lastSpores = spores;

    const barX = 10;
    const barY = 8;
    const barW = 370;
    const barH = 44;

    // 顶部 AI 雕刻木纹藤蔓横梁 (严格限制于 X:10..380 范围，为天气、神器、战报留出充裕空间)
    this.drawAiFrame(ctx, 'top_bar', barX, barY, barW, barH, 0.98);

    // (A) 生命种子胶囊槽
    ctx.save();
    roundRectPath(ctx, barX + 8, barY + 8, 72, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const seedScale = 1 + (this.seedPopTimer > 0 ? Math.sin((this.seedPopTimer / 0.28) * Math.PI) * 0.22 : 0);
    drawUiIcon(ctx, 16, 'seed', barX + 12, barY + 9, 22);
    ctx.translate(barX + 52, barY + 22);
    ctx.scale(seedScale, seedScale);
    drawArtText(ctx, String(seeds), 0, 0, {
      style: seeds <= 5 ? 'crimson' : 'parchment',
      size: 15,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.5
    });
    ctx.restore();

    // (B) 黄金孢子胶囊槽
    ctx.save();
    roundRectPath(ctx, barX + 84, barY + 8, 88, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const sporeScale = 1 + (this.sporePopTimer > 0 ? Math.sin((this.sporePopTimer / 0.24) * Math.PI) * 0.22 : 0);
    drawUiIcon(ctx, 16, 'spore', barX + 88, barY + 9, 22);
    ctx.translate(barX + 138, barY + 22);
    ctx.scale(sporeScale, sporeScale);
    drawArtText(ctx, String(spores), 0, 0, {
      style: 'gold',
      size: 15,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.8
    });
    ctx.restore();

    // (C) 波次进度与状态铭牌
    const waveMgr = scene.waveManager;
    ctx.save();
    roundRectPath(ctx, barX + 176, barY + 8, 96, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.58)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawUiIcon(ctx, 16, 'skull', barX + 180, barY + 10, 20);
    drawArtText(ctx, `${waveMgr.currentWaveIndex}/${waveMgr.totalWaves}`, barX + 220, barY + 22, {
      style: 'parchment',
      size: 12,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.2
    });

    const statusTag = waveMgr.isPrepPhase()
      ? `${Math.ceil(waveMgr.prepTimerSec)}s`
      : '迎战';
    drawArtText(ctx, statusTag, barX + 262, barY + 22, {
      style: waveMgr.isPrepPhase() ? 'azure' : 'crimson',
      size: 10.5,
      align: 'right',
      baseline: 'middle',
      strokeWidth: 1.2
    });
    ctx.restore();

    // (D) 备战期「提前迎敌」号角按钮 或 战斗期「下波预告」胶囊 (紧随其后 X: 276..364)
    const callX = barX + 276;
    const callY = barY + 6;
    const callW = 88;
    const callH = 32;

    if (waveMgr.isPrepPhase()) {
      const earlyBonus = Math.min(
        CONFIG.ECONOMY.EARLY_CALL_MAX,
        Math.floor(waveMgr.prepTimerSec * CONFIG.ECONOMY.EARLY_CALL_PER_SEC)
      );
      this.drawPixelButton(
        ctx,
        'hud_call_wave',
        callX,
        callY,
        callW,
        callH,
        `提前 +${earlyBonus}`,
        {
          skin: 'btn_green',
          font: `bold 11px ${CN_FONT}`,
          iconKey: 'horn',
          iconSize: 16
        },
        () => {
          scene.callWaveEarly();
        }
      );
    } else {
      const summary = waveMgr.getUpcomingWaveSummary();
      ctx.save();
      this.drawAiFrame(ctx, 'btn_wood', callX, callY, callW, callH, 0.92);
      if (summary.length > 0) {
        const first = summary[0];
        if (first && first.type && Number.isFinite(first.count)) {
          drawEnemySprite(ctx, first.type, 'walk', 0, callX + 14, callY + 16, false);
          drawArtText(ctx, `×${first.count}`, callX + 32, callY + 16, {
            style: 'parchment',
            size: 10.5,
            align: 'left',
            baseline: 'middle',
            strokeWidth: 1.0
          });
        }
      } else {
        drawArtText(ctx, '迎敌就绪', callX + callW * 0.5, callY + 16, {
          style: 'gold',
          size: 10.5,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 1.0
        });
      }
      ctx.restore();
    }
  }
  renderTopRightControls(ctx, scene) {
    // 1. 纯净全景地图切换按钮 (Zen Mode: [纯净[H]])
    this.drawPixelButton(
      ctx,
      'hud_zen',
      668,
      12,
      50,
      34,
      '全景',
      {
        skin: 'btn_wood',
        font: `bold 10.5px ${CN_FONT}`
      },
      () => {
        this.toggleZenMode(scene.fx);
      }
    );

    // 2. 倍速切换按钮 (1x / 2x / 3x)
    this.drawPixelButton(
      ctx,
      'hud_speed',
      722,
      12,
      50,
      34,
      `${scene.speedMultiplier}×速`,
      {
        skin: scene.speedMultiplier > 1 ? 'btn_blue' : 'btn_wood',
        font: `bold 11px ${CN_FONT}`
      },
      () => {
        scene.cycleSpeed();
      }
    );

    // 3. 暂停按钮
    this.drawPixelButton(
      ctx,
      'hud_pause',
      776,
      12,
      50,
      34,
      '暂停',
      {
        skin: 'btn_wood',
        font: `bold 11px ${CN_FONT}`
      },
      () => {
        scene.pauseGame();
      }
    );

    // 4. 战术图鉴按钮
    this.drawPixelButton(
      ctx,
      'hud_guide',
      830,
      12,
      50,
      34,
      '图鉴',
      {
        skin: 'btn_wood',
        font: `bold 11px ${CN_FONT}`
      },
      () => {
        platform.playSfx('sfx_click');
        this.guideStep = 0;
        this.showGuideModal = true;
      }
    );

    // 5. 设置按钮
    this.drawPixelButton(
      ctx,
      'hud_settings',
      884,
      12,
      52,
      34,
      '设置',
      {
        skin: 'btn_wood',
        font: `bold 11px ${CN_FONT}`
      },
      () => {
        platform.playSfx('sfx_click');
        this.showSettingsModal = true;
      }
    );
  }

  /**
   * 已全面融入底部一体化控制舱 (renderBottomUnifiedCommandDeck)
   */
  renderCommanderSpellDock(ctx, scene) {
  }
  renderRallyTargetingReticle(ctx, scene) {
    if (!scene || !scene.activeRallyTargeting || !scene.map) return;
    const mx = this.hoverX;
    const my = this.hoverY;
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const mapX = (mx - mv.OFFSET_X) / (mv.SCALE || 1);
    const mapY = (my - mv.OFFSET_Y) / (mv.SCALE || 1);
    const col = Math.floor(mapX / TILE_SIZE);
    const row = Math.floor(mapY / TILE_SIZE);
    const isValid = scene.map.inBounds(col, row) && scene.map.isPath(col, row);

    ctx.save();
    if (scene.map.inBounds(col, row)) {
      const bx = mv.OFFSET_X + col * TILE_SIZE * mv.SCALE;
      const by = mv.OFFSET_Y + row * TILE_SIZE * mv.SCALE;
      const bsz = TILE_SIZE * mv.SCALE;
      roundRectPath(ctx, bx + 1, by + 1, bsz - 2, bsz - 2, 6);
      ctx.fillStyle = isValid ? 'rgba(82, 196, 26, 0.30)' : 'rgba(255, 77, 79, 0.25)';
      ctx.fill();
      ctx.strokeStyle = isValid ? '#95DE64' : '#FF4D4F';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    const flagImg = platform.getImage('assets/vfx/prop_rally_flag.png');
    if (mx > 0 && my > 0) {
      if (flagImg && flagImg.width) {
        ctx.globalAlpha = 0.88;
        ctx.drawImage(flagImg, mx - 16, my - 30, 32, 34);
      }
      drawArtText(ctx, isValid ? '点击道路集结菇精卫 [R]' : '请移动到道路格上设防', mx, my - 38, {
        style: isValid ? 'emerald' : 'crimson',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.8
      });
    }
    ctx.restore();
  }

  renderSpellTargetingReticle(ctx, scene) {
    if (!scene.activeSpellCasting) return;
    const spellId = scene.activeSpellCasting;
    const sp = scene.spells[spellId];
    if (!sp) return;

    const mx = this.hoverX;
    const my = this.hoverY;
    if (mx < 0 || my < 0) return;

    const rad = sp.radius || 100;
    const isRain = spellId === 'rain';
    const mainColor = isRain ? '#52C41A' : '#FFE58F';
    const ringColor = isRain ? 'rgba(82, 196, 26, 0.22)' : 'rgba(255, 229, 143, 0.25)';

    ctx.save();
    // 1. 绘制 100% AI 手绘高清战术罗盘瞄准光圈
    const reticleImg = platform.getImage('assets/vfx/range_commander_reticle.png');
    if (reticleImg) {
      ctx.save();
      ctx.translate(mx, my);
      ctx.scale(1.0, 0.78); // 贴合 45 度俯视斜视角地面透视
      ctx.rotate(-this.uiAnimTime * 0.45);
      const dSize = rad * 2;
      ctx.globalAlpha = 0.52; // 轻柔半透明
      ctx.drawImage(reticleImg, -rad, -rad, dSize, dSize);
      ctx.restore();
    } else {
      ctx.fillStyle = ringColor;
      ctx.beginPath();
      ctx.ellipse(mx, my, rad, rad * 0.78, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2.0;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -Math.round((this.uiAnimTime * 32) % 14);
      ctx.beginPath();
      ctx.ellipse(mx, my, rad, rad * 0.78, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. 内同心辅助圆环与准星 (贴合地面透视)
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.ellipse(mx, my, rad * 0.45, rad * 0.45 * 0.78, 0, 0, Math.PI * 2);
    ctx.stroke();

    const crX = 14;
    const crY = 14 * 0.78;
    ctx.beginPath();
    ctx.moveTo(mx - crX, my);
    ctx.lineTo(mx + crX, my);
    ctx.moveTo(mx, my - crY);
    ctx.lineTo(mx, my + crY);
    ctx.stroke();

    // 4. 瞄准光圈上方提示文字
    drawArtText(ctx, `点击释放【${sp.name}】`, mx, my - rad - 16, {
      style: isRain ? 'emerald' : 'gold',
      size: 14,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 2.0
    });
    drawArtText(ctx, '按键或点击空白取消', mx, my - rad - 2, {
      style: 'parchment',
      size: 10,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.2
    });

    ctx.restore();
  }

  /**
   * 拖拽放置守卫时的动态全息射程环、网格磁吸吸附高亮与 1.2 倍悬浮投影
   */
  renderTowerDragPreview(ctx, scene) {
    if (!this.isDragging || !this.draggingTowerId || !scene || scene.state !== 'BATTLE') return;

    const tId = this.draggingTowerId;
    const tDef = TOWERS[tId];
    if (!tDef) return;

    const curX = this.dragCurrentX;
    const curY = this.dragCurrentY;
    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const mx = (curX - mv.OFFSET_X) / mv.SCALE;
    const my = (curY - mv.OFFSET_Y) / mv.SCALE;
    const col = Math.floor(mx / TILE_SIZE);
    const row = Math.floor(my / TILE_SIZE);

    const inBounds = scene.map && scene.map.inBounds(col, row);
    const canBuild = inBounds && scene.map.canBuildAt(col, row);
    const cost = tDef.nodes.base.cost;
    const affordable = scene.economy && scene.economy.canAfford(cost);
    const isValid = inBounds && canBuild && affordable;

    // 1. 若指针落在地图格子内，仅展示磁吸目标格子底框（拉取与放置过程不显示任何攻击距离特效，保持画面干净）
    if (inBounds) {
      ctx.save();
      const tileBoxX = mv.OFFSET_X + col * TILE_SIZE * mv.SCALE;
      const tileBoxY = mv.OFFSET_Y + row * TILE_SIZE * mv.SCALE;
      const tileBoxSize = TILE_SIZE * mv.SCALE;

      roundRectPath(ctx, tileBoxX + 1, tileBoxY + 1, tileBoxSize - 2, tileBoxSize - 2, 6);
      if (isValid) {
        ctx.fillStyle = 'rgba(82, 196, 26, 0.22)';
        ctx.strokeStyle = 'rgba(82, 196, 26, 0.65)';
      } else {
        ctx.fillStyle = 'rgba(245, 34, 45, 0.20)';
        ctx.strokeStyle = 'rgba(255, 77, 79, 0.65)';
      }
      ctx.lineWidth = 1.8;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. 悬浮在光标下方的 1.2 倍比例立体蘑菇守卫投影与柔和地面阴影
    ctx.save();
    // 地面软阴影
    ctx.fillStyle = 'rgba(8, 14, 10, 0.45)';
    ctx.beginPath();
    ctx.ellipse(curX, curY + 12, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 蘑菇头像图标 (48x48 悬浮呼吸动画)
    const bob = Math.sin(this.uiAnimTime * 8) * 3;
    const avatarX = curX - 24;
    const avatarY = curY - 38 + bob;
    drawUiIcon(ctx, 24, tId, avatarX, avatarY, 48);

    // 悬浮状态提示标签
    if (isValid) {
      drawArtText(ctx, `可种植 (花费 ${cost} 孢子)`, curX, curY - 50 + bob, { style: 'gold', size: 13 });
    } else if (!inBounds) {
      drawArtText(ctx, '移入地图区域种植', curX, curY - 50 + bob, { style: 'parchment', size: 12 });
    } else if (!canBuild) {
      drawArtText(ctx, '此处无法扎根', curX, curY - 50 + bob, { style: 'crimson', size: 12 });
    } else if (!affordable) {
      drawArtText(ctx, `孢子不足 (需 ${cost})`, curX, curY - 50 + bob, { style: 'crimson', size: 12 });
    }
    ctx.restore();
  }

  /**
   * 3.3 底部植物塔防式蘑菇建造卡片船坞（4 张精致木质羊皮纸+绿珐琅卡片）
   */
  renderBottomBuildDock(ctx, scene) {
    // 已全面融入底部一体化控制舱 (renderBottomUnifiedCommandDeck)
  }

  /**
   * 3.25 & 3.3 底部全功能一体化统御控制舱 (Unified Bottom Command Deck)
   * 融合：英雄头像+微操集结+HP/XP+大招[F]+姿态[Z] + 四大自然神术[Q/W/E/R] + 5大守卫卡牌[1..5] + 灵能觉醒[空格]
   * 空间布局：严格限定于 Y:444..534 (高度 90px)，上部 Y:48..440 完全开阔，零遮挡战场任何区域！
   */
  renderBottomUnifiedCommandDeck(ctx, scene) {
    const baseY = 444;
    const deckH = 90;
    const hero = scene.hero;

    // (A) 若处于收缩/沉浸轻度状态，绘制悬浮“轻语言UI”微光胶囊 (Whisper Command Capsule)
    if (this.dockExpansion < 0.88) {
      const pillW = 360;
      const pillH = 32;
      const pillX = Math.round((960 - pillW) * 0.5);
      const pillY = 502;
      const pillAlpha = Math.min(1.0, (0.88 - this.dockExpansion) / 0.65);

      ctx.save();
      ctx.globalAlpha = pillAlpha;

      // 翡翠黑曜石透光玻璃胶囊
      const pGrad = ctx.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
      pGrad.addColorStop(0, 'rgba(12, 28, 20, 0.94)');
      pGrad.addColorStop(1, 'rgba(8, 18, 13, 0.96)');
      roundRectPath(ctx, pillX, pillY, pillW, pillH, 16);
      ctx.fillStyle = pGrad;
      ctx.fill();

      // 呼吸微光律动金边
      const pulse = 1.0 + Math.sin(this.uiAnimTime * 3.8) * 0.25;
      ctx.strokeStyle = `rgba(211, 242, 97, ${0.45 + pulse * 0.25})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      drawArtText(ctx, '🍃 战备指令', pillX + 46, pillY + pillH * 0.5, {
        style: 'emerald',
        size: 11.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      drawArtText(ctx, '▲ 轻触展开 (5塔 / 4术 / 英雄)', pillX + pillW * 0.5 + 10, pillY + pillH * 0.5, {
        style: 'gold',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      drawArtText(ctx, `🪙 ${scene.economy.spores}`, pillX + pillW - 38, pillY + pillH * 0.5, {
        style: 'parchment',
        size: 11.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      ctx.restore();

      this.registerButton('dock_whisper_pill', pillX, pillY, pillW, pillH, () => {
        this.dockTargetExpansion = 1.0;
        platform.playSfx('sfx_click');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(10); } catch (e) {}
        }
      });
    }

    // (B) 若未完全隐藏，绘制平滑下滑与淡入淡出的一体化控制舱
    if (this.dockExpansion <= 0.05) return;

    const slideY = Math.round((1.0 - this.dockExpansion) * 105);
    const deckAlpha = Math.max(0, Math.min(1.0, (this.dockExpansion - 0.15) / 0.85));

    ctx.save();
    ctx.translate(0, slideY);
    ctx.globalAlpha = deckAlpha;

    // 1. 远古灵木精工雕刻卡牌底座托盘 (Ancient Carved Bark Command Deck)
    roundRectPath(ctx, 10, baseY, 940, deckH, 12);
    ctx.fillStyle = 'rgba(20, 14, 8, 0.94)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.70)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 右上角折叠/沉浸战场小按钮
    roundRectPath(ctx, 894, baseY + 3, 52, 16, 4);
    ctx.fillStyle = 'rgba(40, 28, 16, 0.75)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();
    drawArtText(ctx, '⌵ 沉浸', 920, baseY + 11, {
      style: 'parchment',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.6
    });

    // 区域垂直分割金线 (不绘制贯穿文字的水平横线，确保全部文字清晰利落)
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.40)';
    ctx.beginPath();
    ctx.moveTo(140, baseY + 6);
    ctx.lineTo(140, baseY + deckH - 6);
    ctx.moveTo(300, baseY + 6);
    ctx.lineTo(300, baseY + deckH - 6);
    ctx.moveTo(724, baseY + 6);
    ctx.lineTo(724, baseY + deckH - 6);
    ctx.stroke();
    ctx.restore();

    // =========================================================================
    // [分区 1] 远古树人·战术英雄统御专区 (X: 14..136)
    // =========================================================================
    const isHeroRallying = scene.activeHeroRally || (hero && hero.isSelected);
    const hx = 18;
    const hy = baseY + 16;
    const hw = 42;
    const hh = 42;

    ctx.save();
    drawArtText(ctx, '远古树人', 74, baseY + 8, {
      style: 'gold',
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    // 英雄头像底框
    roundRectPath(ctx, hx, hy, hw, hh, 8);
    ctx.fillStyle = 'rgba(10, 14, 10, 0.95)';
    ctx.fill();
    ctx.strokeStyle = isHeroRallying ? '#FFD700' : 'rgba(198, 143, 69, 0.65)';
    ctx.lineWidth = isHeroRallying ? 2.5 : 1.2;
    ctx.stroke();

    // 英雄手绘头像
    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    if (heroImg && heroImg.width) {
      ctx.drawImage(heroImg, hx + 2, hy + 2, hw - 4, hh - 4);
    }

    // 等级标 (精致角标)
    roundRectPath(ctx, hx - 2, hy - 4, 22, 13, 3);
    ctx.fillStyle = '#8C5E2A';
    ctx.fill();
    drawArtText(ctx, 'Lv.' + (hero ? hero.level : 1), hx + 9, hy + 2.5, {
      style: 'gold',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    // 右侧生命/经验条与大招 [F]
    if (hero) {
      const barX = hx + 48;
      const barW = 68;

      // 血条
      const hpRatio = Math.max(0, hero.hp / hero.maxHp);
      roundRectPath(ctx, barX, hy + 1, barW, 9, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();
      roundRectPath(ctx, barX, hy + 1, barW * hpRatio, 9, 3);
      ctx.fillStyle = hero.state === 'dead' ? '#8C2D29' : (hpRatio > 0.4 ? '#52C41A' : '#FF4D4F');
      ctx.fill();
      drawArtText(ctx, hero.hp + '/' + hero.maxHp, barX + barW * 0.5, hy + 5.5, {
        style: 'parchment',
        size: 8,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.5
      });

      // 经验条
      const xpRatio = Math.max(0, Math.min(1, hero.xp / hero.xpToNext));
      roundRectPath(ctx, barX, hy + 13, barW, 4, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();
      roundRectPath(ctx, barX, hy + 13, barW * xpRatio, 4, 2);
      ctx.fillStyle = '#1890FF';
      ctx.fill();

      // 大招快捷键 [F]
      const skillOnCd = hero.skillCooldown > 0 || hero.state === 'dead';
      roundRectPath(ctx, barX, hy + 20, barW, 21, 4);
      ctx.fillStyle = skillOnCd ? 'rgba(30, 20, 15, 0.85)' : 'rgba(24, 75, 40, 0.95)';
      ctx.fill();
      ctx.strokeStyle = skillOnCd ? '#5E3E26' : '#FFD700';
      ctx.lineWidth = 1;
      ctx.stroke();

      const cdText = skillOnCd
        ? (hero.state === 'dead' ? ('复活 ' + Math.ceil(hero.reviveTimer) + 's') : ('大招 ' + Math.ceil(hero.skillCooldown) + 's'))
        : '大招 [F] 撼地!';
      drawArtText(ctx, cdText, barX + barW * 0.5, hy + 30.5, {
        style: skillOnCd ? 'dim' : 'gold',
        size: 9,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });
    }

    // 姿态切换按钮 [Z]
    const curStance = hero ? hero.stance : 'guardian';
    const stanceConfig = {
      guardian: { label: '姿态: 磐石巨盾', color: '#40A9FF' },
      aggressive: { label: '姿态: 狂暴战斧', color: '#FF4D4F' },
      scout: { label: '姿态: 灵木游侠', color: '#52C41A' }
    };
    const curStCfg = stanceConfig[curStance] || stanceConfig.guardian;
    const stX = hx;
    const stY = baseY + 63;
    const stW = 116;
    const stH = 21;

    roundRectPath(ctx, stX, stY, stW, stH, 4);
    ctx.fillStyle = 'rgba(26, 18, 12, 0.88)';
    ctx.fill();
    ctx.strokeStyle = curStCfg.color;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    drawArtText(ctx, '[Z] ' + curStCfg.label, stX + stW * 0.5, stY + 10.5, {
      style: 'gold',
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });
    ctx.restore();

    // 注册英雄微操按钮
    this.registerButton('hero_portrait', hx, hy, hw, hh, () => {
      if (scene.hero) {
        scene.activeHeroRally = !scene.activeHeroRally;
        scene.hero.isSelected = scene.activeHeroRally;
        platform.playSfx('sfx_click');
        if (scene.activeHeroRally) {
          scene.fx.spawnFloatingText(scene.hero.x, scene.hero.y - 24, '树人集结：点击地面移动!', '#FFE58F', 1.2);
        }
      }
    });

    if (hero) {
      this.registerButton('hero_f_ult', hx + 48, hy + 20, 68, 21, () => {
        scene.hero.castUltimateSkill(scene.enemyManager, scene.fx);
      });
    }

    this.registerButton('hero_stance_cycle', stX, stY, stW, stH, () => {
      if (scene.hero) {
        scene.hero.cycleStance(scene.fx);
      }
    });

    // =========================================================================
    // [分区 2] 指挥官四大战术神术舱 (X: 144..296)
    // =========================================================================
    const spellList = [
      { id: 'rain', hotkey: 'Q', name: '甘霖', cost: 45, vfx: 'assets/vfx/relic_clover.png', tip: '复苏' },
      { id: 'shock', hotkey: 'W', name: '天雷', cost: 75, vfx: 'assets/vfx/relic_lightning.png', tip: '眩晕' },
      { id: 'harvest', hotkey: 'E', name: '丰饶', cost: 0, vfx: 'assets/vfx/item_golden_spore.png', tip: '+120' },
      { id: 'rally', hotkey: 'R', name: '集结', cost: 0, vfx: 'assets/vfx/sporeling_guard.png', tip: '布防' }
    ];

    drawArtText(ctx, '自然神术', 220, baseY + 8, {
      style: 'gold',
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    const spGemW = 34;
    const spGemH = 34;
    const spStartX = 144;
    const spGap = 4;

    for (let sIdx = 0; sIdx < spellList.length; sIdx++) {
      const item = spellList[sIdx];
      const sp = scene.spells[item.id] || { timer: 0, cost: item.cost };
      const onCd = sp.timer > 0;
      const affordable = scene.economy.spores >= sp.cost;
      const disabled = onCd || !affordable;
      const isCasting = scene.activeSpellCasting === item.id || (item.id === 'rally' && scene.activeRallyTargeting);

      const bx = spStartX + sIdx * (spGemW + spGap);
      const by = baseY + 16;

      ctx.save();
      // 法术底盘圆形宝石
      ctx.beginPath();
      ctx.arc(bx + spGemW * 0.5, by + spGemH * 0.5, spGemW * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = isCasting
        ? 'rgba(40, 32, 10, 0.95)'
        : (disabled ? 'rgba(20, 16, 12, 0.85)' : 'rgba(28, 22, 14, 0.92)');
      ctx.fill();
      ctx.strokeStyle = isCasting ? '#FFD700' : (disabled ? 'rgba(120, 90, 60, 0.45)' : 'rgba(198, 143, 69, 0.70)');
      ctx.lineWidth = isCasting ? 2.2 : 1.2;
      ctx.stroke();

      // 法术 AI 手绘图标
      const spellImg = platform.getImage(item.vfx);
      if (spellImg && spellImg.width) {
        ctx.drawImage(spellImg, bx + 5, by + 5, spGemW - 10, spGemH - 10);
      }

      // 快捷键角标 [Q/W/E/R]
      roundRectPath(ctx, bx - 2, by - 2, 13, 12, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fill();
      drawArtText(ctx, item.hotkey, bx + 4.5, by + 4, {
        style: 'gold',
        size: 8.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.6
      });

      // 冷却倒计时遮罩
      if (onCd) {
        ctx.beginPath();
        ctx.arc(bx + spGemW * 0.5, by + spGemH * 0.5, spGemW * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fill();
        drawArtText(ctx, Math.ceil(sp.timer) + 's', bx + spGemW * 0.5, by + spGemH * 0.5, {
          style: 'crimson',
          size: 10,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 1.0
        });
      }

      // 底部名称与消耗标签（清晰利落，无任何杂线干扰）
      drawArtText(ctx, item.name, bx + spGemW * 0.5, baseY + 58, {
        style: disabled ? 'dim' : 'gold',
        size: 9.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      const costText = item.cost > 0 ? (item.cost + '孢') : item.tip;
      drawArtText(ctx, costText, bx + spGemW * 0.5, baseY + 72, {
        style: affordable ? 'parchment' : 'crimson',
        size: 8.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.6
      });
      ctx.restore();

      this.registerButton('dock_spell_' + item.id, bx, by, spGemW, deckH - 20, () => {
        if (item.id === 'rally') {
          scene.startRallyTargeting();
        } else {
          scene.castSpell(item.id);
        }
      });
    }

    // =========================================================================
    // [分区 3] 5 大蘑菇守卫者战术卡牌舱 (X: 306..720) - 100% 官方正版 AI 手绘原画
    // =========================================================================
    const cardW = 76;
    const cardH = 82;
    const cardGap = 8;
    const cardsStartX = 306;

    for (let i = 0; i < TOWER_ORDER.length; i++) {
      const tId = TOWER_ORDER[i];
      const def = TOWERS[tId];
      const cost = def.nodes.base.cost;
      const isSelected = scene.selectedBuildTowerId === tId;
      const affordable = scene.economy.canAfford(cost);
      const cx = cardsStartX + i * (cardW + cardGap);
      const hovered = this.isPointHovered(cx, baseY + 4, cardW, cardH);
      const liftY = isSelected ? -4 : (hovered ? -2 : 0);
      const cy = baseY + 4 + liftY;

      ctx.save();
      // 卡牌投影
      roundRectPath(ctx, cx + 2, cy + 3, cardW - 4, cardH - 2, 8);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // 选中光晕 / 悬停发光
      if (isSelected) {
        roundRectPath(ctx, cx - 2, cy - 2, cardW + 4, cardH + 4, 10);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (hovered) {
        roundRectPath(ctx, cx - 1, cy - 1, cardW + 2, cardH + 2, 9);
        ctx.strokeStyle = '#BAE7FF';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 卡牌主体材质
      roundRectPath(ctx, cx, cy, cardW, cardH, 8);
      ctx.fillStyle = isSelected
        ? 'rgba(45, 32, 18, 0.95)'
        : (affordable ? 'rgba(28, 20, 12, 0.92)' : 'rgba(20, 15, 12, 0.85)');
      ctx.fill();
      ctx.strokeStyle = isSelected
        ? '#FFD700'
        : (affordable ? 'rgba(198, 143, 69, 0.70)' : 'rgba(120, 90, 60, 0.40)');
      ctx.lineWidth = isSelected ? 2 : 1.2;
      ctx.stroke();

      // 卡牌名称
      drawArtText(ctx, i18n.t(def.nameKey), cx + cardW * 0.5, cy + 9, {
        style: isSelected ? 'gold' : (affordable ? 'parchment' : 'dim'),
        size: 10.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 快捷键角标 [1..5]
      roundRectPath(ctx, cx + 2, cy + 2, 14, 13, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();
      drawArtText(ctx, String(i + 1), cx + 9, cy + 8.5, {
        style: 'gold',
        size: 9,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });

      // 【核心守卫UI显示】读取 100% AI 手绘卡牌原画 assets/ui/cards/card_${tId}.png 并自适应居中渲染
      const cardArtImg = platform.getImage("assets/ui/cards/card_" + tId + ".png");
      if (cardArtImg && cardArtImg.width) {
        const maxArtW = 54;
        const maxArtH = 50;
        const artAspect = cardArtImg.width / cardArtImg.height;
        let dw = maxArtW, dh = maxArtH;
        if (artAspect > (maxArtW / maxArtH)) {
          dh = maxArtW / artAspect;
        } else {
          dw = maxArtH * artAspect;
        }
        // 柔和微光底座聚光
        ctx.save();
        ctx.fillStyle = isSelected ? 'rgba(255, 215, 0, 0.25)' : 'rgba(120, 255, 175, 0.12)';
        ctx.beginPath();
        ctx.ellipse(cx + cardW * 0.5, cy + 38, dw * 0.48, dh * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.drawImage(cardArtImg, cx + (cardW - dw) * 0.5, cy + 14 + (maxArtH - dh) * 0.5, dw, dh);
      } else {
        drawTowerSprite(ctx, tId, "base", "idle", 0, cx + (cardW - 32) * 0.5, cy + 32);
      }

      // PvZ 经典垂直扫光冷却遮罩 (Card Recharge Sweep)
      const curCd = this.cardCooldowns[tId] || 0;
      const maxCd = (this.cardMaxCooldowns && this.cardMaxCooldowns[tId]) || 5.0;
      if (curCd > 0) {
        const cdRatio = Math.min(1.0, curCd / maxCd);
        const maskH = Math.round(cardH * cdRatio);
        ctx.save();
        roundRectPath(ctx, cx, cy, cardW, cardH, 8);
        ctx.clip();
        ctx.fillStyle = 'rgba(12, 10, 8, 0.68)';
        ctx.fillRect(cx, cy, cardW, maskH);
        // 金色扫光刻度线
        ctx.strokeStyle = 'rgba(255, 229, 143, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy + maskH);
        ctx.lineTo(cx + cardW, cy + maskH);
        ctx.stroke();
        ctx.restore();
      }

      // 底部孢子消耗胶囊
      roundRectPath(ctx, cx + 8, cy + cardH - 18, cardW - 16, 15, 6);
      ctx.fillStyle = 'rgba(15, 10, 6, 0.85)';
      ctx.fill();
      drawUiIcon(ctx, 16, 'spore', cx + 12, cy + cardH - 18, 14);
      drawArtText(ctx, String(cost), cx + cardW * 0.5 + 6, cy + cardH - 10, {
        style: affordable ? 'gold' : 'crimson',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });
      ctx.restore();

      const isCardInCooldown = (this.cardCooldowns[tId] || 0) > 0;
      this.registerButton('slot_' + tId, cx, cy, cardW, cardH, () => {
        if ((this.cardCooldowns[tId] || 0) > 0) {
          platform.playSfx('sfx_click', 0.5, 0.7);
          return;
        }
        scene.selectBuildTowerType(tId);
        platform.playSfx('sfx_click');
      }, { towerId: tId, disabled: isCardInCooldown });
    }

    // =========================================================================
    // [分区 4] 远古灵能觉醒超载舱 (X: 730..940)
    // =========================================================================
    const awkX = 736;
    const awkY = baseY + 6;
    const awkW = 204;
    const awkH = cardH;
    const isAwkTargeting = scene.activeAwakeningTargeting;

    ctx.save();
    roundRectPath(ctx, awkX, awkY, awkW, awkH, 8);
    ctx.fillStyle = isAwkTargeting ? 'rgba(80, 20, 110, 0.92)' : 'rgba(26, 18, 12, 0.90)';
    ctx.fill();
    ctx.strokeStyle = isAwkTargeting ? '#D3ADF7' : 'rgba(198, 143, 69, 0.65)';
    ctx.lineWidth = isAwkTargeting ? 2.2 : 1.2;
    ctx.stroke();

    const seedImg = platform.getImage('assets/vfx/item_awakening_seed.png');
    if (seedImg && seedImg.width) {
      ctx.drawImage(seedImg, awkX + 8, awkY + 22, 28, 28);
    }

    drawArtText(ctx, '灵能觉醒 [空格]', awkX + 68, awkY + 14, {
      style: isAwkTargeting ? 'gold' : 'parchment',
      size: 11,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });

    drawArtText(ctx, '古种 ×' + (scene.awakeningSeeds || 0), awkX + 68, awkY + 36, {
      style: (scene.awakeningSeeds > 0) ? 'gold' : 'dim',
      size: 11.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    drawArtText(ctx, (scene.awakeningSeeds > 0 ? '超载全屏觉醒' : '精英敌人掉落'), awkX + 68, awkY + 56, {
      style: isAwkTargeting ? 'azure' : 'parchment',
      size: 8.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.6
    });
    ctx.restore();

    this.registerButton('dock_awakening', awkX, awkY, awkW, awkH, () => {
      if (scene.awakeningSeeds > 0) {
        scene.activeAwakeningTargeting = !scene.activeAwakeningTargeting;
        platform.playSfx('sfx_click');
        if (scene.activeAwakeningTargeting) {
          this.showToast('请点击场上的蘑菇触发灵能觉醒超载!');
        }
      } else {
        this.showToast('灵能觉醒种子不足(击败精英敌人获取)!');
      }
    });

    if (this.dockExpansion >= 0.65) {
      this.registerButton('dock_fold_btn', 894, baseY + 3, 52, 16, () => {
        this.dockTargetExpansion = 0.0;
        platform.playSfx('sfx_click');
      });
    }

    ctx.restore();
  }
  /**
   * 战地即时灵动快捷环（Tower Tactical Micro Quick-Actions）
   * 专为手机端触控优化：点击防御塔后，在塔身周围直接浮现「A线升级」「B线升级」「索敌」「详情」微胶囊
   * 拇指一键触达，无需将视线与手指大幅移动至屏幕侧板
   */
  renderTowerTacticalQuickRing(ctx, scene, tower, tileScreenX, tileScreenY) {
    if (!tower) return;
    const upgrades = scene.towerManager.getAvailableUpgrades(tower);
    const priStr = i18n.t('prio_' + (tower.priority || 'first'));
    // 安全钳制边界：绝不让边缘/底行守卫的快捷环被底部卡槽栏(Y>=474)或屏幕左右边框裁切遮挡
    const minAnchorX = (tileScreenY > 350) ? 252 : 108;
    const anchorX = Math.max(minAnchorX, Math.min(852, tileScreenX));
    const topY = Math.max(46, Math.min(392, tileScreenY - 50));
    const botY = Math.min(436, Math.max(108, tileScreenY + 36));

    ctx.save();

    // 1. 顶部：升级选项胶囊
    if (upgrades.length === 1) {
      const up = upgrades[0];
      const canAfford = scene.economy.canAfford(up.cost);
      const uw = 108;
      const uh = 28;
      const ux = Math.round(anchorX - uw * 0.5);
      const uy = Math.round(topY);

      roundRectPath(ctx, ux, uy, uw, uh, 14);
      ctx.fillStyle = canAfford ? 'rgba(16, 42, 28, 0.94)' : 'rgba(28, 20, 16, 0.92)';
      ctx.fill();
      ctx.strokeStyle = canAfford ? 'rgba(82, 196, 26, 0.85)' : 'rgba(140, 100, 70, 0.55)';
      ctx.lineWidth = canAfford ? 1.6 : 1.0;
      ctx.stroke();

      ctx.fillStyle = canAfford ? '#FFE58F' : '#D9D9D9';
      ctx.font = `bold 11px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`强化 · ${up.cost}孢`, ux + uw * 0.5, uy + 14);

      this.registerButton('quick_up_single', ux, uy, uw, uh, () => {
        scene.tryUpgradeSelectedTower(up.nodeId);
      });
    } else if (upgrades.length === 2) {
      // 双分支 A/B 并排胶囊
      for (let i = 0; i < 2; i++) {
        const up = upgrades[i];
        const canAfford = scene.economy.canAfford(up.cost);
        const uw = 92;
        const uh = 28;
        const ux = Math.round(i === 0 ? anchorX - uw - 4 : anchorX + 4);
        const uy = Math.round(topY);

        roundRectPath(ctx, ux, uy, uw, uh, 14);
        ctx.fillStyle = canAfford ? (i === 0 ? 'rgba(12, 36, 56, 0.94)' : 'rgba(16, 44, 28, 0.94)') : 'rgba(28, 20, 16, 0.92)';
        ctx.fill();
        ctx.strokeStyle = canAfford ? (i === 0 ? 'rgba(64, 169, 255, 0.85)' : 'rgba(82, 196, 26, 0.85)') : 'rgba(140, 100, 70, 0.55)';
        ctx.lineWidth = canAfford ? 1.6 : 1.0;
        ctx.stroke();

        ctx.fillStyle = canAfford ? '#FFE58F' : '#D9D9D9';
        ctx.font = `bold 10.5px ${UI_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i === 0 ? '甲线' : '乙线'} · ${up.cost}`, ux + uw * 0.5, uy + 14);

        this.registerButton('quick_up_branch_' + up.nodeId, ux, uy, uw, uh, () => {
          scene.tryUpgradeSelectedTower(up.nodeId);
        });
      }
    } else {
      // 已升至顶级
      const uw = 88;
      const uh = 24;
      const ux = Math.round(anchorX - uw * 0.5);
      const uy = Math.round(topY + 2);

      roundRectPath(ctx, ux, uy, uw, uh, 12);
      ctx.fillStyle = 'rgba(28, 24, 12, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#FFD700';
      ctx.font = `bold 10.5px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('宗师满阶', ux + uw * 0.5, uy + 12);
    }

    // 2. 底部：战术微操双胶囊（索敌 + 属性详情）
    const ph = 28;
    const py = Math.round(botY);
    const px1 = Math.round(anchorX - 74); // 索敌
    const px2 = Math.round(anchorX + 4);  // 详情属性

    // (1) 索敌胶囊
    roundRectPath(ctx, px1, py, 70, ph, 14);
    ctx.fillStyle = 'rgba(20, 24, 28, 0.94)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 140, 180, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#BAE7FF';
    ctx.font = `bold 11px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`索敌 · ${priStr}`, px1 + 35, py + 14);

    this.registerButton('quick_pri_btn', px1, py, 70, ph, () => {
      if (scene.towerManager) {
        scene.towerManager.cyclePriority(tower);
      }
      platform.playSfx('sfx_click');
      const nextPrio = i18n.t('prio_' + tower.priority);
      if (scene.fx) scene.fx.spawnFloatingText(tower.x, tower.y - 18, `索敌: ${nextPrio}`, '#FFE58F', 1.0);
    });

    // (2) 详情面板轻量开关胶囊
    roundRectPath(ctx, px2, py, 70, ph, 14);
    ctx.fillStyle = this.showTowerDetailBoard ? 'rgba(56, 38, 18, 0.96)' : 'rgba(22, 28, 36, 0.92)';
    ctx.fill();
    ctx.strokeStyle = this.showTowerDetailBoard ? 'rgba(255, 215, 0, 0.85)' : 'rgba(120, 160, 200, 0.60)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = this.showTowerDetailBoard ? '#FFD700' : '#E6F7FF';
    ctx.font = `bold 11px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('详细属性', px2 + 35, py + 14);

    this.registerButton('quick_detail_btn', px2, py, 70, ph, () => {
      this.showTowerDetailBoard = !this.showTowerDetailBoard;
      platform.playSfx('sfx_click');
    });

    ctx.restore();
  }

  renderTowerInspectorPopup(ctx, scene) {
    const col = scene.selectedTile.col;
    const row = scene.selectedTile.row;
    if (!scene.map || !scene.map.inBounds(col, row)) {
      this.inspectorRect = null;
      return;
    }

    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
    const tileScreenX = mv.OFFSET_X + (col + 0.5) * TILE_SIZE * mv.SCALE;
    const tileScreenY = mv.OFFSET_Y + (row + 0.5) * TILE_SIZE * mv.SCALE;

    const existingTower = scene.towerManager.getTowerAt(col, row);
    const canBuild = scene.map.canBuildAt(col, row);
    if (!existingTower && !canBuild) {
      this.inspectorRect = null;
      return;
    }

    // 1. 若为已有防御塔且详情面板未展开：呈现轻量战地灵动快捷环（0 遮挡，与详情木板互不重叠）
    if (existingTower) {
      if (!this.showTowerDetailBoard) {
        this.renderTowerTacticalQuickRing(ctx, scene, existingTower, tileScreenX, tileScreenY);
        this.inspectorRect = {
          x: tileScreenX - 110,
          y: tileScreenY - 60,
          w: 220,
          h: 128
        };
        return;
      }
    }

    const pw = 328;
    const ph = existingTower ? 264 : 224;
    // 智能停靠：停靠在屏幕边缘，确保地面的 360 度攻击范围完整无遮挡展示
    let px = tileScreenX < 480 ? Math.min(Math.round(tileScreenX + 32), 960 - pw - 14) : Math.max(14, Math.round(tileScreenX - pw - 32));
    px = Math.max(14, Math.min(960 - pw - 14, px));
    let py = Math.max(26, Math.min(526 - ph, Math.round(tileScreenY - ph * 0.5)));

    this.inspectorRect = { x: px, y: py, w: pw, h: ph };

    // 指向被选地块的青铜指引锚点
    ctx.save();
    ctx.fillStyle = THEME.WOOD_MID;
    ctx.strokeStyle = THEME.BRONZE_MID;
    ctx.lineWidth = 2;
    const arrowY = Math.max(py + 32, Math.min(py + ph - 32, tileScreenY));
    ctx.beginPath();
    if (px > tileScreenX) {
      ctx.moveTo(px + 2, arrowY - 8);
      ctx.lineTo(px - 10, arrowY);
      ctx.lineTo(px + 2, arrowY + 8);
    } else {
      ctx.moveTo(px + pw - 2, arrowY - 8);
      ctx.lineTo(px + pw + 10, arrowY);
      ctx.lineTo(px + pw - 2, arrowY + 8);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 绘制主面板木框+羊皮纸
    this.drawWoodlandPanel(ctx, px, py, pw, ph, THEME.BRONZE_MID, 0.98, 14, true);

    // 右上角关闭按钮 [×]（规范尺寸 22x22，距右边框 14px，距顶 12px）
    this.drawPixelButton(ctx, 'insp_close', px + pw - 36, py + 12, 22, 22, '×', {
      skin: 'btn_wood',
      font: `bold 14px ${UI_FONT}`
    }, () => {
      platform.playSfx('sfx_click');
      this.showTowerDetailBoard = false;
      if (!existingTower) {
        this.inspectorOpen = false;
        scene.selectedTile = { col: -1, row: -1 };
      }
    });

    if (existingTower) {
      this.renderSelectedTowerPopupBody(ctx, scene, existingTower, px, py, pw, ph);
    } else {
      this.renderBuildSlotPopupBody(ctx, scene, col, row, px, py, pw, ph);
    }
  }


  /**
   * 已建塔状态面板：头像、等级徽章、属性药丸胶囊、分支升级按钮、索敌/出售
   */
  renderSelectedTowerPopupBody(ctx, scene, tower, x, y, w, h) {
    const def = tower.def;
    const node = tower.node;
    const cov = scene.map.getRangeCoverage(tower.col, tower.row, node.range, def.canHitGround, def.canHitAir);

    // 1. 头像框（42x42，内边距左 26px，距顶 30px，完全在羊皮纸安全区内）
    ctx.save();
    roundRectPath(ctx, x + 26, y + 30, 42, 42, 10);
    ctx.fillStyle = 'rgba(72, 48, 28, 0.18)';
    ctx.fill();
    ctx.strokeStyle = THEME.BRONZE_MID;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawUiIcon(ctx, 24, tower.typeId, x + 27, y + 31, 40);

    // 标题：守卫名字 · 节点名字（下移至 y+40，完全避开顶部厚木框，绝无遮挡）
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 15px ${UI_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const fullName = `${i18n.t(def.nameKey)} · ${i18n.t(node.nameKey)}`;
    ctx.fillText(fullName, x + 76, y + 40, Math.max(80, w - 118));

    // 等级阶级徽章（胶囊型，y+54）
    const lvMap = { base: '基础 1阶', lv1: '强化 2阶', a2: '甲线 3阶', a3: '甲线 顶阶', b2: '乙线 3阶', b3: '乙线 顶阶' };
    const lvBadgeW = 62;
    roundRectPath(ctx, x + 76, y + 54, lvBadgeW, 18, 9);
    ctx.fillStyle = tower.branch === 'A' ? '#1D6373' : (tower.branch === 'B' ? '#8C4D18' : '#33612E');
    ctx.fill();
    ctx.fillStyle = '#FFFDF5';
    ctx.font = `bold 11px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lvMap[tower.nodeId] || '1阶', x + 76 + lvBadgeW * 0.5, y + 63);

    // 战术定位微胶囊（规范放进边框内部，绝不横向溢出，y+54）
    const roleStr = i18n.t(def.roleKey) || '林地守卫';
    // 菌丝共振羁绊微标
    let synName = '';
    let synBg = '#389E0D';
    if (tower.synergies) {
      if (tower.synergies.hasGrandResonance) {
        synName = '大共振';
        synBg = '#D48806';
      } else if (tower.synergies.hasTwinWatch && tower.typeId === 'watch') {
        synName = '双哨暴击';
        synBg = '#096DD9';
      } else if (tower.synergies.hasToxicBurst && (tower.typeId === 'burst' || tower.typeId === 'mist')) {
        synName = '剧毒爆轰';
        synBg = '#389E0D';
      } else if (tower.synergies.hasPoisonThorn && (tower.typeId === 'thorn' || tower.typeId === 'mist')) {
        synName = '荆棘毒刺';
        synBg = '#237804';
      }
    }
    if (synName) {
      const synTagX = x + 76 + lvBadgeW + 8 + 88;
      roundRectPath(ctx, synTagX, y + 54, 58, 18, 9);
      ctx.fillStyle = synBg;
      ctx.fill();
      ctx.fillStyle = '#FFFDF5';
      ctx.font = `bold 10px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(synName, synTagX + 29, y + 63);
    }

    const roleTagX = x + 76 + lvBadgeW + 8;
    const roleTagW = 84;
    roundRectPath(ctx, roleTagX, y + 54, roleTagW, 18, 9);
    ctx.fillStyle = 'rgba(92, 64, 40, 0.10)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 94, 42, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = THEME.INK_MID;
    ctx.font = `bold 10px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(roleStr, roleTagX + roleTagW * 0.5, y + 63);
    ctx.restore();

    // 2. 核心战斗属性药丸胶囊（攻击 / 间隔 / 射程，三等分铺满 276px 可用内宽，y+78）
    const statsY = y + 78;
    const pillW = 86;
    const pillGap = 9;
    let dmgVal = `${node.damage}`;
    let dmgLabel = '攻击';
    let dmgIcon = 'atk';
    let dmgCat = 24;
    if (tower.typeId === 'lumina') {
      if (node.branch === 'A') {
        dmgVal = `${node.damage}/+${node.auraHeal || 25}`;
        dmgLabel = '圣光·疗';
        dmgIcon = 'atk';
      } else {
        dmgVal = `+${node.sporeGen || 12}/次`;
        dmgLabel = '产孢';
        dmgIcon = 'spore';
        dmgCat = 16;
      }
    } else if (tower.typeId === 'mist') {
      dmgVal = `${node.dps}/秒`;
      dmgLabel = '雾伤';
    }
    const statItems = [
      { cat: dmgCat, icon: dmgIcon, label: dmgLabel, val: dmgVal },
      { cat: 24, icon: 'aspd', label: '间隔', val: `${node.interval}s` },
      { cat: 16, icon: 'target', label: '射程', val: `${node.range}格` }
    ];
    for (let i = 0; i < 3; i++) {
      const st = statItems[i];
      const sx = x + 26 + i * (pillW + pillGap);
      ctx.save();
      roundRectPath(ctx, sx, statsY, pillW, 32, 8);
      ctx.fillStyle = 'rgba(84, 56, 32, 0.10)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawUiIcon(ctx, st.cat, st.icon, sx + 5, statsY + 6, 20);
      ctx.fillStyle = '#855F38';
      ctx.font = `9.5px ${UI_FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.label, sx + 27, statsY + 9);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 11.5px ${UI_FONT}`;
      ctx.fillText(st.val, sx + 27, statsY + 23);
      ctx.restore();
    }

    // 3. 升级卡片或双分支选择
    const upgrades = scene.towerManager.getAvailableUpgrades(tower);
    const btnW = 276;
    const bx = x + 26;

    if (upgrades.length === 0) {
      // 已升至顶级
      ctx.save();
      roundRectPath(ctx, bx, y + 114, btnW, 76, 10);
      ctx.fillStyle = 'rgba(62, 107, 56, 0.14)';
      ctx.fill();
      ctx.strokeStyle = THEME.BRONZE_MID;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawUiIcon(ctx, 24, 'crown', x + w * 0.5 - 18, y + 120, 36);
      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 13px ${UI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`已升至最高阶 · 覆盖道路 ${cov.coveredTiles} 格`, x + w * 0.5, y + 170);
      ctx.restore();
    } else if (upgrades.length === 1) {
      // 单分支升级 (Base -> LV1)
      const up = upgrades[0];
      const canAfford = scene.economy.canAfford(up.cost);
      const upIcon = up.branch === 'A' ? 'branch_a' : (up.branch === 'B' ? 'branch_b' : 'upgrade');
      const upCat = (up.branch === 'A' || up.branch === 'B') ? 24 : 16;

      this.drawPixelButton(
        ctx,
        'btn_upgrade_single',
        bx,
        y + 114,
        btnW,
        38,
        `强化: ${i18n.t(up.nameKey)}`,
        {
          skin: canAfford ? 'btn_green' : 'btn_wood',
          align: 'left',
          font: `bold 13px ${UI_FONT}`,
          iconCat: upCat,
          iconKey: upIcon,
          iconSize: 20,
          subLabel: `${up.cost} 孢子`,
          subColor: canAfford ? '#FFE58F' : '#FF7875'
        },
        () => {
          scene.tryUpgradeSelectedTower(up.nodeId);
        }
      );

      // 升级效果预览胶囊
      ctx.save();
      roundRectPath(ctx, bx, y + 158, btnW, 28, 6);
      ctx.fillStyle = 'rgba(92, 64, 40, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = THEME.INK_MID;
      ctx.font = `11px ${UI_FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`效果: ${i18n.t(up.descKey)}`, bx + 10, y + 172, btnW - 20);
      ctx.restore();
    } else if (upgrades.length === 2) {
      // 双分支路线选择（甲线 vs 乙线）
      for (let i = 0; i < 2; i++) {
        const up = upgrades[i];
        const canAfford = scene.economy.canAfford(up.cost);
        const by = y + 114 + i * 42;
        this.drawPixelButton(
          ctx,
          'btn_upgrade_branch_' + up.nodeId,
          bx,
          by,
          btnW,
          36,
          `${up.branch === 'A' ? '甲线' : '乙线'}: ${i18n.t(up.nameKey)}`,
          {
            skin: canAfford ? (up.branch === 'A' ? 'btn_blue' : 'btn_green') : 'btn_wood',
            align: 'left',
            font: `bold 13px ${UI_FONT}`,
            iconCat: 24,
            iconKey: up.branch === 'A' ? 'branch_a' : 'branch_b',
            iconSize: 18,
            subLabel: `${up.cost} 孢子`,
            subColor: canAfford ? '#FFE58F' : '#FF7875'
          },
          () => {
            scene.tryUpgradeSelectedTower(up.nodeId);
          }
        );
      }
    }

    // 4. 底部动作栏：全宽战术索敌优先级切换按钮 (276px 铺满，y+202)
    const prioKey = 'prio_' + tower.priority;
    const canCyclePrio = (def.priorities && def.priorities.length > 1);
    this.drawPixelButton(
      ctx,
      'btn_tower_prio',
      bx,
      y + 202,
      276,
      36,
      `切换索敌策略：${i18n.t(prioKey)}`,
      {
        skin: 'btn_blue',
        disabled: !canCyclePrio,
        align: 'center',
        font: `bold 13px ${UI_FONT}`,
        iconKey: 'target',
        iconSize: 18
      },
      () => {
        scene.towerManager.cyclePriority(tower);
      }
    );
  }

  /**
   * 选中古树空地时的快捷建造弹窗
   */
  renderBuildSlotPopupBody(ctx, scene, col, row, x, y, w, h) {
    const tId = scene.selectedBuildTowerId || 'watch';
    const def = TOWERS[tId];
    const baseNode = def.nodes.base;
    const canBuild = scene.map.canBuildAt(col, row);
    const canAfford = scene.economy.canAfford(baseNode.cost);
    const cov = scene.map.getRangeCoverage(col, row, baseNode.range, def.canHitGround, def.canHitAir);
    const tile = scene.map.getTile(col, row);
    const isMoss = tile && tile.type === 'moss';
    const bx = x + 26;
    const btnW = 276;

    // 头像与定位
    drawUiIcon(ctx, 24, tId, bx, y + 30, 42);
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 15px ${UI_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i18n.t(def.nameKey)} · ${i18n.t(def.roleKey)}`, x + 76, y + 40);

    ctx.fillStyle = isMoss ? THEME.ENAMEL_GREEN : THEME.INK_MID;
    ctx.font = `bold 11px ${UI_FONT}`;
    ctx.fillText(isMoss ? `◆ 雕石地基 · 覆盖道路 ${cov.coveredTiles} 格` : `草地建造位 · 覆盖道路 ${cov.coveredTiles} 格`, x + 76, y + 56);

    // 描述与属性
    this.drawWrappedText(ctx, i18n.t(def.descKey), bx, y + 78, btnW, 16, THEME.INK_MID, `11px ${UI_FONT}`);

    const isLumina = tId === 'lumina';
    const dmgVal = isLumina ? `+${baseNode.sporeGen || 8}/次` : (tId === 'mist' ? `${baseNode.dps}/秒` : `${baseNode.damage}`);
    const statLabel1 = isLumina ? '产孢' : '伤害';
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 12px ${UI_FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${statLabel1}: ${dmgVal}   间隔: ${baseNode.interval}s   射程: ${baseNode.range}格`, bx, y + 122);

    // 种植按钮
    this.drawPixelButton(
      ctx,
      'btn_confirm_build',
      bx,
      y + 160,
      btnW,
      40,
      `种植 ${i18n.t(def.nameKey)}`,
      {
        skin: canBuild && canAfford ? 'btn_green' : 'btn_wood',
        disabled: !canBuild || !canAfford,
        align: 'left',
        font: `bold 13px ${UI_FONT}`,
        iconKey: 'spore',
        iconSize: 20,
        subLabel: `${baseNode.cost} 孢子`,
        subColor: canAfford ? '#FFE58F' : '#FF7875'
      },
      () => {
        if (scene.tryBuildOnSelectedTile()) {
          this.inspectorOpen = false;
        }
      }
    );
  }

  renderMapPlacementPreview(ctx, scene) {
    const map = scene.map;
    if (!map) return;

    // 核心设计：拉出去到放置都没有特效，只有点击已种植守卫时才能够查看到攻击距离的特效
    if (!this.inspectorOpen) return;
    if (!scene.selectedTile || scene.selectedTile.col < 0 || scene.selectedTile.row < 0) return;

    const selCol = scene.selectedTile.col;
    const selRow = scene.selectedTile.row;
    if (!map.inBounds(selCol, selRow)) return;

    // 必须是已种植的守卫！空地不显示任何范围特效，保持画面干净
    const existingTower = scene.towerManager.getTowerAt(selCol, selRow);
    if (!existingTower) return;

    const towerDef = existingTower.def;
    const node = existingTower.node;
    if (!node) return;

    const tileX = selCol * TILE_SIZE;
    const tileY = selRow * TILE_SIZE;
    const cov = map.getRangeCoverage(selCol, selRow, node.range, towerDef.canHitGround, towerDef.canHitAir);
    const ringColor = existingTower.branch === 'A' ? '#6FE8FF' : (existingTower.branch === 'B' ? '#FFC069' : '#B7EB8F');

    ctx.save();
    // 严格按照每个守卫的定位与真实攻击距离制作专属特效，杜绝千篇一律统一法阵：
    // 1. 瞭望菇(watch, 6.0~9.0格超远程): 金色星轨日光罗盘法阵，凸显超远距离精密狙击
    // 2. 雾菇(mist, 3.5格近身范围): 幽蓝荧光毒雾水涟环，紧凑贴身环绕，绝不蔓延全图
    // 3. 尖刺菇(thorn, 4.5~5.0格中距离): 四叶草翡翠荆棘仙女环，德鲁伊自然破甲荆棘
    // 4. 爆裂菇(burst, 4.0格抛物线炮击): 熔金地脉震波落点法阵，炮击碎裂生机落点
    const typeId = existingTower.typeId;
    let circleKey = 'assets/vfx/range_thorn_bramble.png';
    if (typeId === 'mist') {
      circleKey = 'assets/vfx/range_mist_poison.png';
    } else if (typeId === 'burst') {
      circleKey = 'assets/vfx/range_burst_mortar.png';
    } else if (typeId === 'watch') {
      circleKey = 'assets/vfx/range_watch_sniper.png';
    } else if (typeId === 'lumina') {
      circleKey = 'assets/vfx/range_sunburst_gold.png';
    } else {
      circleKey = 'assets/vfx/range_thorn_bramble.png';
    }

    const circleImg = platform.getImage(circleKey);

    // 点击展开时的平滑呼吸绽放动效（0.0 ~ 0.22 秒）
    const enterAge = scene.selectedTileAgeSec || 0;
    const enterProg = Math.min(1.0, enterAge / 0.22);
    const enterScale = 0.88 + 0.12 * Math.sin(enterProg * Math.PI * 0.5);

    if (circleImg) {
      ctx.save();
      ctx.translate(cov.centerX, cov.centerY);
      ctx.scale(1.0, 0.78); // 契合 45 度俯视斜视角地面透视，使法阵平贴草地
      ctx.rotate(this.uiAnimTime * 0.22);
      ctx.scale(enterScale, enterScale);
      // 轻柔透明仙灵光环（基准透明度 0.38 - 0.46），完全不遮挡草地与道路纹理
      const softAlpha = (0.42 + Math.sin(this.uiAnimTime * 3) * 0.05) * enterProg;
      ctx.globalAlpha = softAlpha;

      // 归一化精准映射：图集外环比例精准为 0.85，除以 0.85 使得光环物理半径精确等于守卫真实射程像素
      const drawRadius = cov.radiusPx / 0.85;
      ctx.drawImage(circleImg, -drawRadius, -drawRadius, drawRadius * 2, drawRadius * 2);
      ctx.restore();
    } else {
      // 低透明柔和光环回退
      ctx.fillStyle = ringColor;
      ctx.globalAlpha = 0.06 * enterProg;
      ctx.beginPath();
      ctx.ellipse(cov.centerX, cov.centerY, cov.radiusPx * enterScale, cov.radiusPx * 0.78 * enterScale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.55 * enterProg;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 5]);
      ctx.lineDashOffset = -Math.round((this.uiAnimTime * 18) % 12);
      ctx.beginPath();
      ctx.ellipse(cov.centerX, cov.centerY, cov.radiusPx * enterScale, cov.radiusPx * 0.78 * enterScale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 射程覆盖路线柔和光点（金色仙灵微粒，严格对齐椭圆透视）
    ctx.globalAlpha = 0.65 * enterProg;
    ctx.fillStyle = '#FFE58F';
    const rX = node.range * TILE_SIZE;
    for (let i = 0; i < cov.coveredGroundSamples.length; i += 2) {
      const s = cov.coveredGroundSamples[i];
      const dx = s.x - cov.centerX;
      const dy = (s.y - cov.centerY) / 0.78;
      if (dx * dx + dy * dy <= rX * rX) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 选中守卫高亮基底：绘制贴地椭圆仙灵生机生根光晕
    ctx.save();
    ctx.fillStyle = 'rgba(82, 196, 26, 0.20)';
    ctx.strokeStyle = 'rgba(255, 229, 143, 0.60)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(tileX + TILE_SIZE * 0.5, tileY + TILE_SIZE * 0.65, 18, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // 4. 暂停、结算、设置与新手引导木质羊皮纸弹窗
  // =========================================================================
  renderPauseOverlay(ctx, scene) {
    this.clearButtons(); // 清空按钮防穿透
    ctx.fillStyle = 'rgba(6, 12, 8, 0.80)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 360;
    const mh = 314;
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 16, true);

    // 顶部典雅铜边木牌标题 (垂直居中于羊皮纸内层顶部，绝不压在边框外缘)
    const headW = 180;
    const headH = 34;
    const headX = mx + (mw - headW) * 0.5;
    const headY = my + 26;
    roundRectPath(ctx, headX, headY, headW, headH, 8);
    ctx.fillStyle = 'rgba(28, 18, 10, 0.95)';
    ctx.fill();
    ctx.strokeStyle = THEME.BRONZE_MID;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    drawArtText(ctx, i18n.t('state_paused'), mx + mw * 0.5, headY + headH * 0.5, {
      style: 'gold',
      size: 16,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.2
    });

    // 优雅内敛的羊皮纸装饰分割线
    ctx.strokeStyle = 'rgba(110, 74, 38, 0.28)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(mx + 50, my + 72);
    ctx.lineTo(mx + mw - 50, my + 72);
    ctx.stroke();

    const bx = mx + 50;
    const bw = mw - 100;
    const btnH = 40;

    this.drawPixelButton(ctx, 'pause_resume', bx, my + 86, bw, btnH, i18n.t('btn_resume'), {
      skin: 'btn_green',
      iconKey: 'play'
    }, () => {
      platform.playSfx('sfx_click');
      scene.resumeGame();
    });

    this.drawPixelButton(ctx, 'pause_restart', bx, my + 138, bw, btnH, i18n.t('btn_restart'), {
      skin: 'btn_wood'
    }, () => {
      platform.playSfx('sfx_click');
      scene.restartLevel();
    });

    this.drawPixelButton(ctx, 'pause_settings', bx, my + 190, bw, btnH, i18n.t('btn_settings'), {
      skin: 'btn_wood',
      iconKey: 'settings'
    }, () => {
      platform.playSfx('sfx_click');
      this.showSettingsModal = true;
    });

    this.drawPixelButton(ctx, 'pause_exit', bx, my + 242, bw, btnH, i18n.t('btn_exit_title'), {
      skin: 'btn_red'
    }, () => {
      platform.playSfx('sfx_click');
      scene.enterLevelSelect();
    });
  }

  renderSettlementOverlay(ctx, scene) {
    ctx.fillStyle = 'rgba(10, 16, 12, 0.78)';
    ctx.fillRect(0, 0, 960, 540);

    const isEndless = Boolean(scene.isEndlessMode);
    const isWin = scene.settlementResult.victory;
    const stars = scene.settlementResult.stars || 0;
    const save = storage.getSave();
    const bestEndless = (save && save.endlessRecord) ? save.endlessRecord.bestWave : 0;

    const mw = 440;
    const mh = isEndless ? 340 : (isWin ? (scene.hasNextMap() ? 404 : 358) : 344);
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, (isWin || isEndless) ? THEME.BRONZE_BRIGHT : THEME.CRIMSON_SELL, 0.98, 16, true);

    ctx.save();
    ctx.textAlign = 'center';
    if (isEndless) {
      drawArtText(ctx, '无尽深渊试炼报告', mx + mw * 0.5, my + 48, {
        style: 'ink',
        color: '#8C1D18',
        size: 22,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });

      const currentWave = scene.waveManager ? scene.waveManager.currentWaveIndex : 1;
      drawArtText(ctx, `本次坚持至：第 ${currentWave} 波`, mx + mw * 0.5, my + 84, {
        style: 'ink',
        color: '#8C4D00',
        size: 17,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
      drawArtText(ctx, `历史最高纪录：第 ${Math.max(currentWave, bestEndless)} 波`, mx + mw * 0.5, my + 118, {
        style: 'ink',
        color: '#237804',
        size: 15,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
      drawArtText(ctx, '深渊虫群无休止涌现，林地英魂永垂不朽！', mx + mw * 0.5, my + 152, {
        style: 'ink',
        color: '#543820',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });

      const bx = mx + 65;
      const bw = mw - 130;

      this.drawPixelButton(ctx, 'settle_endless_retry', bx, my + 192, bw, 42, '🔥 再次挑战深渊', {
        skin: 'btn_green'
      }, () => {
        platform.playSfx('sfx_click');
        scene.startEndlessMode();
      });

      this.drawPixelButton(ctx, 'settle_levels', bx, my + 246, bw, 42, i18n.t('btn_level_select'), {
        skin: 'btn_wood'
      }, () => {
        platform.playSfx('sfx_click');
        scene.enterLevelSelect();
      });
    } else {
      ctx.fillStyle = isWin ? THEME.ENAMEL_GREEN : THEME.CRIMSON_SELL;
      ctx.font = 'bold 21px ' + CN_FONT;
      ctx.textBaseline = 'middle';
      ctx.fillText(isWin ? i18n.t('state_victory') : i18n.t('state_defeat'), mx + mw * 0.5, my + 58);

      for (let s = 0; s < 3; s++) {
        const sKey = s < stars ? 'star_full' : 'star_empty';
        drawUiIcon(ctx, 16, sKey, mx + 156 + s * 46, my + 78, 34);
      }

      // 战功总结手卷内嵌卡（2x2 真实战绩面板：耗时 / 种子 / 灭虫 / 核心主力）
      const timeSec = Math.round(scene.settlementResult.clearTimeSec * 10) / 10;
      let totalKills = 0;
      let mvpName = '树人守卫';
      let maxCatDmg = -1;
      let totalDmg = 0;
      if (scene.combatAnalytics) {
        totalDmg = scene.combatAnalytics.totalDamageDealt || 0;
        const stats = scene.combatAnalytics.categoryStats || {};
        for (const key of Object.keys(stats)) {
          const item = stats[key];
          totalKills += (item.kills || 0);
          if ((item.damage || 0) > maxCatDmg) {
            maxCatDmg = item.damage || 0;
            mvpName = item.name || mvpName;
          }
        }
      }

      const cardX = mx + 36;
      const cardY = my + 124;
      const cardW = mw - 72;
      const cardH = 78;
      roundRectPath(ctx, cardX, cardY, cardW, cardH, 10);
      ctx.fillStyle = 'rgba(88, 58, 28, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const cells = [
        { k: i18n.t('best_time'), v: `${timeSec}s` },
        { k: i18n.t('seeds_label'), v: `${scene.settlementResult.remainingSeeds} / 20` },
        { k: '累计歼灭', v: `${totalKills} 只` },
        { k: '全场核心', v: maxCatDmg > 0 ? `${mvpName} (${Math.round(totalDmg / 100) / 10}k)` : '稳固防线' }
      ];
      for (let ci = 0; ci < 4; ci++) {
        const colI = ci % 2;
        const rowI = Math.floor(ci / 2);
        const cx = cardX + 14 + colI * (cardW * 0.5);
        const cy = cardY + 20 + rowI * 36;
        ctx.textAlign = 'left';
        ctx.fillStyle = THEME.INK_MID;
        ctx.font = `11px ${CN_FONT}`;
        ctx.fillText(cells[ci].k, cx, cy);
        ctx.fillStyle = THEME.INK_DARK;
        ctx.font = `bold 13.5px ${CN_FONT}`;
        ctx.fillText(cells[ci].v, cx, cy + 16);
      }

      const bx = mx + 65;
      const bw = mw - 130;

      if (isWin) {
        let curBtnY = my + 216;
        if (scene.hasNextMap()) {
          this.drawPixelButton(ctx, 'settle_next', bx, curBtnY, bw, 36, i18n.t('btn_next_map'), {
            skin: 'btn_green',
            iconKey: 'play'
          }, () => {
            platform.playSfx('sfx_click');
            scene.startNextMap();
          });
          curBtnY += 44;
        }

        // 无尽深渊挑战入口按钮
        this.drawPixelButton(ctx, 'settle_start_endless', bx, curBtnY, bw, 36, '挑战无尽深渊', {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.startEndlessMode();
        });
        curBtnY += 44;

        this.drawPixelButton(ctx, 'settle_levels', bx, curBtnY, bw, 36, i18n.t('btn_level_select'), {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.enterLevelSelect();
        });
      } else {
        this.drawPixelButton(ctx, 'settle_restart', bx, my + 220, bw, 40, i18n.t('btn_restart'), {
          skin: 'btn_green'
        }, () => {
          platform.playSfx('sfx_click');
          scene.restartLevel();
        });

        this.drawPixelButton(ctx, 'settle_levels', bx, my + 268, bw, 40, i18n.t('btn_level_select'), {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.enterLevelSelect();
        });
      }
    }
    ctx.restore();
  }

  renderSettingsModal(ctx, scene) {
    const curScene = scene || this.scene;
    const inBattle = Boolean(curScene && (curScene.state === 'BATTLE' || curScene.state === 'PAUSED'));
    ctx.fillStyle = 'rgba(10, 16, 12, 0.82)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 380;
    const mh = inBattle ? 360 : 276;
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 16, true);

    ctx.save();
    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = 'bold 20px ' + CN_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('森林守卫 · 系统设置', mx + mw * 0.5, my + 48);

    ctx.strokeStyle = 'rgba(110, 74, 38, 0.26)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(mx + 50, my + 64);
    ctx.lineTo(mx + mw - 50, my + 64);
    ctx.stroke();
    ctx.restore();

    const audioCfg = platform.getAudioConfig();
    const bx = mx + 40;
    const bw = mw - 80;
    const btnH = 34;
    const gap = 8;
    let curY = my + 76;

    // 1. 音效开关
    this.drawPixelButton(
      ctx,
      'set_sfx',
      bx,
      curY,
      bw,
      btnH,
      '游戏音效：' + (audioCfg.sfx ? '开启' : '关闭'),
      { skin: 'btn_wood', iconKey: audioCfg.sfx ? 'sfx_on' : 'sfx_off' },
      () => {
        const next = !audioCfg.sfx;
        platform.setAudioConfig({ sfx: next });
        storage.updateSettings({ sfx: next });
        platform.playSfx('sfx_click');
      }
    );
    curY += btnH + gap;

    // 2. 音乐开关
    this.drawPixelButton(
      ctx,
      'set_bgm',
      bx,
      curY,
      bw,
      btnH,
      '背景音乐：' + (audioCfg.bgm ? '开启' : '关闭'),
      { skin: 'btn_wood', iconKey: audioCfg.bgm ? 'bgm_on' : 'bgm_off' },
      () => {
        const next = !audioCfg.bgm;
        platform.setAudioConfig({ bgm: next });
        storage.updateSettings({ bgm: next });
        platform.playSfx('sfx_click');
      }
    );
    curY += btnH + gap;

    // 3. 查阅图鉴
    this.drawPixelButton(
      ctx,
      'set_codex',
      bx,
      curY,
      bw,
      btnH,
      '查阅森林图鉴与秘典',
      { skin: 'btn_wood', iconKey: 'guide' },
      () => {
        platform.playSfx('sfx_click');
        this.guideStep = 0;
        this.showGuideModal = true;
        this.showSettingsModal = false;
      }
    );
    curY += btnH + gap;

    if (inBattle) {
      // 4. 战况战报统计
      this.drawPixelButton(
        ctx,
        'set_analytics',
        bx,
        curY,
        bw,
        btnH,
        '查看实时战况与输出统计',
        { skin: 'btn_wood' },
        () => {
          platform.playSfx('sfx_click');
          if (curScene && curScene.combatAnalytics) {
            curScene.combatAnalytics.isOpen = true;
          }
          this.showSettingsModal = false;
        }
      );
      curY += btnH + gap;

      // 5. 重新挑战本关
      this.drawPixelButton(
        ctx,
        'set_restart',
        bx,
        curY,
        bw,
        btnH,
        '重新挑战本关',
        { skin: 'btn_wood' },
        () => {
          platform.playSfx('sfx_click');
          this.showSettingsModal = false;
          if (curScene && typeof curScene.startLevel === 'function') {
            curScene.startLevel(curScene.currentMapId);
          }
        }
      );
      curY += btnH + gap;
    }

    // 6. 返回游戏 / 关闭设置
    this.drawPixelButton(ctx, 'set_close', bx, curY, bw, btnH, inBattle ? '返回战场继续战斗' : '关闭系统设置', {
      skin: 'btn_green',
      iconKey: inBattle ? 'play' : undefined
    }, () => {
      platform.playSfx('sfx_click');
      this.showSettingsModal = false;
    });
  }

  /**
   * 【林地秘典 · 全景手绘图鉴与战术殿堂】 (Grand Codex & Bestiary)
   * 包含 3 大核心篇章：
   * 1. 🌲 守林神树卫士 (5大蘑菇炮塔：立绘、基础数值、双分支终极形态、灵能觉醒超载大招)
   * 2. 🐛 暗黑虫潮首领 (16大怪物种群：高清手绘立绘、数值抗性、特殊行为机制、针对弱点与克制战法)
   * 3. 📜 领袖战术心得 (森林守卫前线战术总则与无尽深渊微操)
   */
  /**
   * 【林地秘典 · 全景手绘图鉴与战术殿堂】 (Grand Codex & Bestiary)
   * 采用 AAA 级古典羊皮纸与古铜精雕画框材质，100% 修复属性获取与文字换行崩溃异常，
   * 包含三大核心篇章：
   * 1. 🌲 守林神树卫士 (5大防御塔详细数据、双分支三阶终极进阶形态、灵能觉醒超载全屏大招)
   * 2. 🐛 暗黑虫潮首领 (16大怪物种群全部同屏直选展示、生态威胁、针对弱点与克制战法)
   * 3. 📜 领袖战术心得 (英雄肉搏要义、能量豆超频时机、战场即时撕网破茧、踩踏掘地怪、自爆泄气)
   */
  renderGuideModal(ctx, scene) {
    const curScene = scene || this.scene || (typeof window !== 'undefined' && window.__SPOREGUARD__ && window.__SPOREGUARD__.scene);
    ctx.save();
    // 沉浸式暗林边缘微虚化半透明背景
    ctx.fillStyle = 'rgba(6, 12, 8, 0.88)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 800;
    const mh = 480;
    const mx = (960 - mw) * 0.5; // 80
    const my = (540 - mh) * 0.5; // 30

    // 绘制古典林地木纹雕花边框与羊皮纸底盘
    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 18, true);

    // 1. 秘典大标题与顶部华丽徽章
    drawArtText(ctx, '林地秘典 · 全景手绘图鉴与战术殿堂', mx + mw * 0.5, my + 22, {
      style: 'gold',
      size: 19,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.4
    });

    // 右上角关闭按钮 [×]
    const cx = mx + mw - 38;
    const cy = my + 10;
    this.drawPixelButton(ctx, 'codex_close_btn', cx, cy, 28, 28, '×', {
      skin: 'btn_wood',
      font: `bold 16px ${CN_FONT}`
    }, () => {
      this.showGuideModal = false;
      storage.markGuideSeen();
      platform.playSfx('sfx_click');
    });

    // 2. 顶部三大篇章分页标签 (Tabs)
    const tabs = [
      { id: 0, label: '🍄 蘑菇守卫 (5/5)' },
      { id: 1, label: '🐛 林区害虫 (16/16)' },
      { id: 2, label: '🌿 远古真菌知识之树' },
      { id: 3, label: '🏆 王国成就 (20)' }
    ];
    const tabY = my + 40;
    const tabW = 180;
    const tabH = 32;
    const tabStartX = mx + (mw - tabs.length * tabW - (tabs.length - 1) * 12) * 0.5;

    for (let i = 0; i < tabs.length; i++) {
      const tb = tabs[i];
      const tbx = tabStartX + i * (tabW + 12);
      const isCur = this.codexTab === tb.id;

      ctx.save();
      roundRectPath(ctx, tbx, tabY, tabW, tabH, 8);
      ctx.fillStyle = isCur ? 'rgba(88, 56, 32, 0.98)' : 'rgba(30, 20, 12, 0.70)';
      ctx.fill();
      ctx.strokeStyle = isCur ? '#FFD700' : 'rgba(196, 143, 69, 0.5)';
      ctx.lineWidth = isCur ? 2.2 : 1.2;
      ctx.stroke();

      drawArtText(ctx, tb.label, tbx + tabW * 0.5, tabY + tabH * 0.5, {
        style: isCur ? 'gold' : 'parchment',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: isCur ? 1.0 : 0.8
      });
      ctx.restore();

      this.registerButton(`codex_tab_${tb.id}`, tbx, tabY, tabW, tabH, () => {
        this.codexTab = tb.id;
        platform.playSfx('sfx_click');
      });
    }

    // 3. 篇章具体内容渲染
    const bodyY = my + 78;
    const bodyH = mh - 144;

    if (this.codexTab === 0) {
      this.renderCodexGuardiansTab(ctx, mx + 24, bodyY, mw - 48, bodyH);
    } else if (this.codexTab === 1) {
      this.renderCodexBestiaryTab(ctx, mx + 24, bodyY, mw - 48, bodyH);
    } else if (this.codexTab === 2) {
      if (curScene && curScene.ancientKnowledgeTree) {
        curScene.ancientKnowledgeTree.renderKnowledgePanel(ctx, mx + 24, bodyY, mw - 48, bodyH, this);
      } else {
        this.renderCodexTacticsTab(ctx, mx + 24, bodyY, mw - 48, bodyH);
      }
    } else {
      this.renderCodexAchievementsTab(ctx, mx + 24, bodyY, mw - 48, bodyH);
    }

    // 4. 底部右下角核心主交互按钮：进入林地·开启保卫战
    const playBtnW = 220;
    const playBtnH = 38;
    const playBtnX = mx + mw - playBtnW - 24;
    const playBtnY = my + mh - playBtnH - 12;

    this.drawPixelButton(ctx, 'codex_play_btn', playBtnX, playBtnY, playBtnW, playBtnH, '⚔️ 开启保卫战 · 进入战场', {
      skin: 'btn_green',
      font: `bold 14px ${CN_FONT}`,
      iconKey: 'play'
    }, () => {
      this.showGuideModal = false;
      storage.markGuideSeen();
      platform.playSfx('sfx_upgrade');
    });

    // 底部左下角提示文案（绘制于深色木边框安全区内，明亮羊皮纸字体清晰可读）
    roundRectPath(ctx, mx + 52, playBtnY + 7, 456, 24, 12);
    ctx.fillStyle = 'rgba(20, 13, 8, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(196, 143, 69, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawArtText(ctx, '💡 点击任意空白区域或右上角 [×] 即可关闭秘典继续游玩', mx + 280, playBtnY + playBtnH * 0.5, {
      style: 'parchment',
      size: 11.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.9
    });

    ctx.restore();
  }

  /**
   * 篇章 1：守林神树卫士图鉴（修复属性获取与换行异常，提高美术排版质感）
   */
  renderCodexGuardiansTab(ctx, x, y, w, h) {
    const towers = [
      { id: 'watch', name: '瞭望菇', role: '防空远程', cost: TOWERS.watch.nodes.base.cost, desc: '射程覆盖广，精准破甲点杀空中飞蛾与高速突袭怪。' },
      { id: 'mist', name: '雾菇', role: '范围减速', cost: TOWERS.mist.nodes.base.cost, desc: '释放大范围孢子迷雾，极寒减速并融毁敌军坚硬护甲。' },
      { id: 'thorn', name: '尖刺菇', role: '破甲割裂', cost: TOWERS.thorn.nodes.base.cost, desc: '刺穿地面造成连续破甲割裂与巨额流血创伤。' },
      { id: 'burst', name: '爆裂菇', role: '高爆重炮', cost: TOWERS.burst.nodes.base.cost, desc: '发射熔岩高爆弹丸，巨额AOE溅射击退密集聚拢虫潮。' },
      { id: 'lumina', name: '灵光菇', role: '神圣丰收', cost: TOWERS.lumina.nodes.base.cost, desc: '持续生产黄金孢子与祝福晨露，增幅邻塔并维系防线经济命脉。' }
    ];

    const curTowerId = this.codexSelectedTower || 'watch';
    const curDef = TOWERS[curTowerId] || TOWERS.watch;
    const leftW = 205;

    // 左侧：5 大蘑菇精致木牌卡片
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      const cy = y + i * 66;
      const isSel = t.id === curTowerId;

      ctx.save();
      roundRectPath(ctx, x, cy, leftW, 60, 10);
      ctx.fillStyle = isSel ? 'rgba(84, 52, 28, 0.98)' : 'rgba(32, 20, 12, 0.72)';
      ctx.fill();
      ctx.strokeStyle = isSel ? '#FFD700' : 'rgba(196, 143, 69, 0.45)';
      ctx.lineWidth = isSel ? 2.2 : 1.2;
      ctx.stroke();

      // 防御塔动画模型
      const demoFrame = Math.floor(this.uiAnimTime * 4) % 4;
      if (t.id === 'lumina') {
        const lImg = platform.getImage('assets/vfx/prop_lumina_base.png');
        if (lImg && lImg.width) {
          const sc = Math.min(38 / lImg.width, 40 / lImg.height);
          const lw = lImg.width * sc;
          const lh = lImg.height * sc;
          ctx.drawImage(lImg, x + 38 - lw * 0.5, cy + 31 - lh * 0.5, lw, lh);
        }
      } else {
        drawTowerSprite(ctx, t.id, 'lv1', 'idle', demoFrame, x + 30, cy + 31);
      }

      // 名称
      drawArtText(ctx, t.name, x + 66, cy + 20, {
        style: isSel ? 'gold' : 'parchment',
        size: 14,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 战术定位胶囊标
      roundRectPath(ctx, x + 66, cy + 35, 62, 18, 9);
      ctx.fillStyle = 'rgba(62, 107, 56, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#73D13D';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      drawArtText(ctx, t.role, x + 97, cy + 44, {
        style: 'gold',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.6
      });

      // 造价
      drawArtText(ctx, `${t.cost} 孢子`, x + leftW - 12, cy + 20, {
        style: 'gold',
        size: 11,
        align: 'right',
        baseline: 'middle',
        strokeWidth: 0.8
      });
      ctx.restore();

      this.registerButton(`codex_t_${t.id}`, x, cy, leftW, 62, () => {
        this.codexSelectedTower = t.id;
        platform.playSfx('sfx_click');
      });
    }

    // 右侧：详细高精度羊皮纸档案与觉醒展示面板
    const rx = x + leftW + 14;
    const rw = w - leftW - 14;
    ctx.save();
    roundRectPath(ctx, rx, y, rw, h, 14);
    ctx.fillStyle = 'rgba(238, 222, 185, 0.98)';
    ctx.fill();
    ctx.strokeStyle = '#8C5E2A';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // 顶部立绘与基本信息
    const tItem = towers.find(it => it.id === curTowerId) || towers[0];
    const topFrame = Math.floor(this.uiAnimTime * 6) % 4;
    if (curTowerId === 'lumina') {
      const lHeadImg = platform.getImage('assets/vfx/prop_lumina_a.png') || platform.getImage('assets/vfx/prop_lumina_base.png');
      if (lHeadImg && lHeadImg.width) {
        const sc = Math.min(54 / lHeadImg.width, 56 / lHeadImg.height);
        const lw = lHeadImg.width * sc;
        const lh = lHeadImg.height * sc;
        ctx.drawImage(lHeadImg, rx + 52 - lw * 0.5, y + 40 - lh * 0.5, lw, lh);
      }
    } else {
      drawTowerSprite(ctx, curTowerId, 'a3', 'idle', topFrame, rx + 44, y + 40);
    }

    drawArtText(ctx, `${tItem.name} · ${tItem.role}`, rx + 92, y + 24, {
      style: 'ink',
      size: 18,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, tItem.desc, rx + 92, y + 42, rw - 110, 18, '#4A3319', `12px ${CN_FONT}`);

    // 属性横向数值条 (实时读取 TOWERS 数据表数值)
    const statsY = y + 74;
    const baseNode = curDef.nodes.base || {};
    const statDmgLabel = curTowerId === 'mist'
      ? { k: '雾伤', v: `${baseNode.dps || 5}/秒` }
      : (curTowerId === 'lumina'
        ? { k: '产孢', v: `+${baseNode.sporeGen || 12}/${baseNode.sporeInterval || 10}s` }
        : { k: '伤害', v: baseNode.damage || 0 });
    const statRoleLabel = curTowerId === 'thorn' ? '穿透' : ((curTowerId === 'mist' || curTowerId === 'lumina') ? '领域' : (curTowerId === 'burst' ? '溅射' : '精准'));
    const statsList = [
      statDmgLabel,
      { k: '射程', v: `${baseNode.range || 0} 格 (${Math.round((baseNode.range || 0) * 32)}px)` },
      { k: '攻速', v: `${(1 / (baseNode.interval || 1)).toFixed(1)} 次/秒` },
      { k: '类型', v: statRoleLabel }
    ];
    const statW = Math.floor((rw - 32 - 24) / 4);
    for (let si = 0; si < statsList.length; si++) {
      const st = statsList[si];
      const sx = rx + 16 + si * (statW + 8);
      roundRectPath(ctx, sx, statsY, statW, 26, 6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.fill();
      ctx.strokeStyle = '#C4A675';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawArtText(ctx, `${st.k}: ${st.v}`, sx + statW * 0.5, statsY + 13, {
        style: 'ink',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0
      });
    }

    // 分支演化进阶预览 (Branch A & Branch B - 100% 修复 undefined 崩溃)
    const branchY = y + 110;
    const aNode = curDef.nodes.a3 || curDef.nodes.lv1 || {};
    const bNode = curDef.nodes.b3 || curDef.nodes.lv1 || {};

    const aName = (aNode.nameKey && i18n.t(aNode.nameKey)) || aNode.name || '进阶分支 A';
    const aDesc = (aNode.descKey && i18n.t(aNode.descKey)) || aNode.desc || '强化射程、攻速与基础战术威能。';
    const bName = (bNode.nameKey && i18n.t(bNode.nameKey)) || bNode.name || '进阶分支 B';
    const bDesc = (bNode.descKey && i18n.t(bNode.descKey)) || bNode.desc || '赋予质变特性、范围强化与高额附加创伤。';

    // 分支 A 卡片 (典雅蓝宝石古铜镶边)
    const sideCardW = Math.floor((rw - 42) * 0.5);
    const sideCard2X = rx + 16 + sideCardW + 10;
    roundRectPath(ctx, rx + 16, branchY, sideCardW, 82, 8);
    ctx.fillStyle = 'rgba(240, 248, 255, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#69C0FF';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    drawArtText(ctx, `【分支A】${aName}`, rx + 26, branchY + 16, {
      style: 'ink',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, aDesc, rx + 26, branchY + 32, sideCardW - 20, 18, '#1F3A52', `11px ${CN_FONT}`);

    // 分支 B 卡片 (典雅琥珀金古铜镶边)
    roundRectPath(ctx, sideCard2X, branchY, sideCardW, 82, 8);
    ctx.fillStyle = 'rgba(255, 248, 235, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#FFC069';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    drawArtText(ctx, `【分支B】${bName}`, sideCard2X + 10, branchY + 16, {
      style: 'ink',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, bDesc, sideCard2X + 10, branchY + 32, sideCardW - 20, 18, '#593815', `11px ${CN_FONT}`);

    // 【灵能超载全屏觉醒大招】皇室紫金神圣展台
    const ultY = y + 200;
    roundRectPath(ctx, rx + 16, ultY, rw - 32, 124, 12);
    ctx.fillStyle = 'rgba(38, 16, 52, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#D3ADF7';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const ultInfo = {
      watch: { title: '【千里巡林·万矢齐发】', desc: '在3.5秒内向全图范围的所有存活敌人连续倾泻30枚破甲追踪圣光箭矢，无视闪避与潜地，贯穿撕碎敌军阵型！' },
      mist: { title: '【幽冥瘴气·剧毒风暴】', desc: '引爆遮天蔽日的极寒剧毒风暴，使全图敌人移速骤降85%，瞬间融毁所有护甲归零，并造成高额毒素腐蚀！' },
      thorn: { title: '【千刃荆棘·地刺破空】', desc: '召唤贯穿全图地底的千刃神木荆棘破土而出，全屏地面敌军全体定身缠绕4秒并附加260点巨额割裂创伤！' },
      burst: { title: '【熔岩地核·天坠轰击】', desc: '召唤巨型天火陨石轰塌地面，爆发出420点毁灭性巨额范围溅射伤害，全图强烈地动山摇并将残存敌人震退！' },
      lumina: { title: '【天穹极光·万木逢春】', desc: '唤醒天穹极光沐浴全境：立即生成+150黄金孢子，瞬间驱散所有防御塔的蛛网封印与虚弱状态，并在8秒内全员攻速狂暴翻倍！' }
    }[curTowerId] || { title: '【灵能爆发】', desc: '瞬间超频全屏打击。' };

    // 绘制灵能觉醒种子高清图标
    const uSeed = platform.getImage('assets/vfx/item_awakening_seed.png');
    if (uSeed && uSeed.width) {
      ctx.drawImage(uSeed, rx + 28, ultY + 16, 44, 48);
    }

    drawArtText(ctx, `灵能觉醒超载大招：${ultInfo.title}`, rx + 84, ultY + 28, {
      style: 'gold',
      size: 16,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 1.2
    });
    drawArtText(ctx, '击溃高危精英或首领获取觉醒种子，点击战场蘑菇瞬间释放！', rx + 84, ultY + 50, {
      style: 'parchment',
      size: 12,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    this.drawWrappedText(ctx, ultInfo.desc, rx + 28, ultY + 76, rw - 56, 20, '#F5EBFF', `bold 12px ${CN_FONT}`);
    ctx.restore();
  }

  /**
   * 篇章 2：暗黑虫潮首领百兽全书图鉴（16大虫怪双列全部直选，无需翻页）
   */
  renderCodexBestiaryTab(ctx, x, y, w, h) {
    const allEnemies = [
      { id: 'beetle', name: '腐蚀幼甲虫', danger: '★☆☆☆☆', speed: '中速', tag: '前锋兵' },
      { id: 'swift', name: '疾风飞蛾', danger: '★★☆☆☆', speed: '极速', tag: '突击兵' },
      { id: 'armored', name: '重装坚盾甲虫', danger: '★★★☆☆', speed: '缓慢', tag: '装甲先锋' },
      { id: 'moth', name: '幻翼魔蛾', danger: '★★★☆☆', speed: '快速', tag: '浮空飞行' },
      { id: 'splitter', name: '母体裂殖虫', danger: '★★★☆☆', speed: '中速', tag: '亡语分裂' },
      { id: 'larva', name: '分裂幼虫', danger: '★★☆☆☆', speed: '极速', tag: '虫海群攻' },
      { id: 'burrower', name: '掘地潜行蝎', danger: '★★★★☆', speed: '较快', tag: '潜地特种' },
      { id: 'volatile_pod', name: '烈性酸蚀蝉', danger: '★★★★☆', speed: '极速', tag: '蓄力自爆' },
      { id: 'weaver', name: '幽林织网蛛', danger: '★★★★☆', speed: '中速', tag: '吐网封塔' },
      { id: 'leaper', name: '疾风飞跃蝗', danger: '★★★★☆', speed: '跳跃', tag: '跃迁突袭' },
      { id: 'shaman', name: '幽林菌巫', danger: '★★★★☆', speed: '缓慢', tag: '群体治疗' },
      { id: 'skeletal_husk', name: '枯骨虫骸', danger: '★★★★☆', speed: '中速', tag: '复生残骸' },
      { id: 'siege_beetle', name: '铁壁攻城巨兜', danger: '★★★★★', speed: '极慢', tag: '正面坚盾' },
      { id: 'boss_m1', name: '腐化蛀王', danger: '★★★★★', speed: '冲锋', tag: '第一关首领' },
      { id: 'boss_m2', name: '剧毒幽蛾后', danger: '★★★★★', speed: '盘旋', tag: '第二关首领' },
      { id: 'boss_m3', name: '万巢裂殖母体', danger: '★★★★★★', speed: '狂暴', tag: '最终首领' }
    ];

    const curEnemyId = this.codexSelectedEnemy || 'beetle';
    const leftW = 226; // 双列展示 16 只怪物

    // 左侧双列 2x8 布局：直接容纳 16 只怪物，无需翻页
    const colW = 110;
    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      const ci = i % 2;
      const ri = Math.floor(i / 2);
      const ex = x + ci * (colW + 6);
      const ey = y + ri * 41;
      const isSel = e.id === curEnemyId;

      ctx.save();
      roundRectPath(ctx, ex, ey, colW, 37, 6);
      ctx.fillStyle = isSel ? 'rgba(96, 32, 28, 0.98)' : 'rgba(32, 18, 12, 0.72)';
      ctx.fill();
      ctx.strokeStyle = isSel ? '#FF7875' : 'rgba(196, 143, 69, 0.45)';
      ctx.lineWidth = isSel ? 2.0 : 1.0;
      ctx.stroke();

      drawArtText(ctx, e.name, ex + 30, ey + 19, {
        style: isSel ? 'gold' : 'parchment',
        size: 10.5,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0.6
      });
      // 小型怪物头像微章（匹配守卫图鉴视觉密度与手绘辨识度）
      const thumbImg = platform.getImage(`assets/vfx/enemy_${e.id}.png`) ||
        platform.getImage(`assets/enemies/enemy_${e.id}.png`) ||
        platform.getImage(`assets/enemies/boss_${e.id}.png`);
      if (thumbImg && thumbImg.width) {
        const tsc = Math.min(22 / thumbImg.width, 22 / thumbImg.height);
        const tdw = thumbImg.width * tsc;
        const tdh = thumbImg.height * tsc;
        ctx.drawImage(thumbImg, ex + 16 - tdw * 0.5, ey + 18.5 - tdh * 0.5, tdw, tdh);
      } else {
        ctx.save();
        ctx.translate(ex + 16, ey + 18.5);
        const tsc = e.id.startsWith('boss_') ? 0.36 : 0.72;
        ctx.scale(tsc, tsc);
        drawEnemySprite(ctx, e.id, 'walk', 0, 0, 0);
        ctx.restore();
      }
      ctx.restore();

      this.registerButton(`codex_e_${e.id}`, ex, ey, colW, 38, () => {
        this.codexSelectedEnemy = e.id;
        platform.playSfx('sfx_click');
      });
    }

    // 右侧：怪物详细档案与深度克制战法
    const rx = x + leftW + 12;
    const rw = w - leftW - 12;
    ctx.save();
    roundRectPath(ctx, rx, y, rw, h, 14);
    ctx.fillStyle = 'rgba(238, 222, 185, 0.98)';
    ctx.fill();
    ctx.strokeStyle = '#8C2D29';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const eItem = allEnemies.find(it => it.id === curEnemyId) || allEnemies[0];
    const eData = ENEMIES[eItem.id] || {};
    const realHp = eData.baseHp || eItem.hp;
    const realArmor = eData.armor !== undefined ? eData.armor : eItem.armor;

    // 怪物立绘与名称
    const enemyImg = platform.getImage(`assets/vfx/enemy_${curEnemyId}.png`) ||
      platform.getImage(`assets/enemies/enemy_${curEnemyId}.png`) ||
      platform.getImage(`assets/enemies/boss_${curEnemyId}.png`);
    if (enemyImg && enemyImg.width) {
      const sc = Math.min(64 / enemyImg.width, 64 / enemyImg.height);
      const dw = enemyImg.width * sc;
      const dh = enemyImg.height * sc;
      ctx.drawImage(enemyImg, rx + 52 - dw * 0.5, y + 48 - dh * 0.5, dw, dh);
    } else {
      const bestiaryFrame = Math.floor(this.uiAnimTime * 5) % 4;
      drawEnemySprite(ctx, curEnemyId, 'walk', bestiaryFrame, rx + 52, y + 48);
    }

    drawArtText(ctx, `${eItem.name} 【${eItem.tag}】`, rx + 98, y + 28, {
      style: 'ink',
      size: 18,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    drawArtText(ctx, `威胁：${eItem.danger} | 移速：${eItem.speed} | 生命：${realHp} | 护甲：${realArmor}`, rx + 98, y + 54, {
      style: 'ink',
      size: 12,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });

    // 深度克制战法数据库
    const counterTactics = {
      beetle: {
        behavior: '成群结队的前锋轻装虫，单兵血量虽然单薄，但数量极多容易掩护后续高危怪物。',
        counter: '【战法】瞭望菇远程精准单体击杀；若敌军密集聚拢，爆裂菇一发重炮即可全歼清场。'
      },
      swift: {
        behavior: '长有高速双翼的疾风飞虫，移动极快，极易穿透单体防线造成漏怪。',
        counter: '【战法】雾菇的范围减速对其非常有效。先用雾气压低它的速度，再由后排蘑菇集中输出。'
      },
      armored: {
        behavior: '身披厚重硬质角质甲壳，大幅度削减普通物理投射物伤害。',
        counter: '【战法】尖刺菇的地底穿透与流血可无视坚甲；雾菇的毒瘴可直接融毁其护甲！'
      },
      moth: {
        behavior: '高空浮空飞行的荧光飞蛾，完全无视地面任何荆棘与英雄的肉搏拦截！',
        counter: '【战法】唯有防空瞭望菇可锁定高空射击！务必在前排多保留至少 2 座瞭望菇！'
      },
      splitter: {
        behavior: '死亡时腹部会爆裂并分裂出数只极速幼虫，极易引发漏怪悲剧。',
        counter: '【战法】预先在其行进后方部署尖刺菇或爆裂菇，在其爆裂瞬间立即以范围伤害歼灭幼虫。'
      },
      larva: {
        behavior: '极速奔跑的微型幼虫，单只血薄，但成群狂奔时极具威胁。',
        counter: '【战法】爆裂菇重炮溅射、英雄裂地斩震荡清场。'
      },
      burrower: {
        behavior: '钻入地下潜行移动，在地下期间完全免疫防御塔的任何远程攻击！',
        counter: '【即时微操】在其潜地经过时，直接用手指/鼠标快速点击地面土堆！将其踩踏震出地面打回原形！'
      },
      volatile_pod: {
        behavior: '接近我方防线时开始蓄力膨胀，倒计时结束自爆摧毁周围我方防御塔！',
        counter: '【即时微操】在其蓄力膨胀变红期间，狂暴点击恶蝉本体！每次点击为其中断蓄力并泄气！'
      },
      weaver: {
        behavior: '向我方防线防御塔喷吐粘稠毒蛛网，被封印的防御塔完全瘫痪无法射击！',
        counter: '【三连解救】快速用手指三连点击被封印的蘑菇防御塔！撕开蛛网破茧救出！破茧后还可获得 4 秒攻速狂暴！'
      },
      leaper: {
        behavior: '蓄力跳跃越过前排防御塔，直扑后排脆弱的灵光菇经济作物！',
        counter: '【战法】后排不可全放经济作物，务必在灵光菇旁边穿插 1 座尖刺菇或英雄就近调遣拦截！'
      },
      shaman: {
        behavior: '持续吟唱巫毒光环，为周围所有虫潮源源不断恢复大量生命值！',
        counter: '【战法】指挥英雄使用裂地斩优先击晕，后排瞭望菇切换集火优先级为“强敌优先”集火狙杀！'
      },
      skeletal_husk: {
        behavior: '坚硬如岩石的枯骨甲壳，能吸收正面大额直射弹丸。',
        counter: '【战法】尖刺菇从地底破防穿透，配合爆裂菇的曲射高爆迫击炮绕后打击。'
      },
      siege_beetle: {
        behavior: '体型庞大的攻城重装怪，践踏地面产生震荡波短暂震晕周围防御塔。',
        counter: '【战法】派遣森林英雄在前线坚守阻击，后排全员开启灵能觉醒全力歼灭！'
      },
      boss_m1: {
        behavior: '第一关首领【巨角天牛王】：高血量冲锋首领，具备硬化甲壳与震地狂暴。',
        counter: '【战术】英雄前置抗住接怪，施放【W 雷霆震爆】打断其冲锋，爆裂菇重炮全力轰击！'
      },
      boss_m2: {
        behavior: '第二关首领【剧毒飞蛾后】：盘旋空中的飞天巨兽，散播全屏毒粉减缓我方攻速。',
        counter: '【战术】使用【Q 自然甘霖】驱散毒粉并翻倍攻速，瞭望菇开启【千里巡林·万矢齐发】集火射落！'
      },
      boss_m3: {
        behavior: '第三关终极首领【万虫巢母】：拥有三重狂暴阶段，召唤无尽飞虫与分裂幼虫！',
        counter: '【终极战术】英雄持续肉搏阻挡核心，全员使用灵能超载大招连环轰击，灵光菇觉醒万木逢春保持战力！'
      }
    }[curEnemyId] || { behavior: '普通敌军虫潮。', counter: '合理搭配防御塔进行击退。' };

    // 习性与威胁分析框
    const behY = y + 84;
    roundRectPath(ctx, rx + 16, behY, rw - 32, 98, 8);
    ctx.fillStyle = 'rgba(255, 245, 245, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#FFA39E';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    drawArtText(ctx, '【生态行为与危险机制】', rx + 26, behY + 18, {
      style: 'ink',
      color: '#8C1D18',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, counterTactics.behavior, rx + 26, behY + 36, rw - 52, 20, '#431418', `12px ${CN_FONT}`);

    // 克制弱点与领袖战术框
    const couY = y + 190;
    roundRectPath(ctx, rx + 16, couY, rw - 32, 134, 10);
    ctx.fillStyle = 'rgba(246, 255, 237, 0.90)';
    ctx.fill();
    ctx.strokeStyle = '#B7EB8F';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawArtText(ctx, '【针对弱点与领袖克制战术】', rx + 26, couY + 20, {
      style: 'ink',
      color: '#135200',
      size: 14,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, counterTactics.counter, rx + 26, couY + 42, rw - 52, 22, '#135200', `bold 13px ${CN_FONT}`);

    ctx.restore();
  }

  /**
   * 篇章 3：领袖战术心得手卷
   */
  renderCodexTacticsTab(ctx, x, y, w, h) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 14);
    ctx.fillStyle = 'rgba(238, 222, 185, 0.98)';
    ctx.fill();
    ctx.strokeStyle = '#8C5E2A';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const scrolls = [
      {
        title: '一、英雄调遣与近身拦截',
        body: '森林领袖·奥克可以前往地图任意位置驻守。点击英雄后再点击地面，即可下达移动指令。英雄最多拦截 2 只地面敌人；击杀与承伤会积累经验，升级（最高 Lv.5）时恢复全部生命。敌人扎堆时，按 F 释放大招「撼地」可造成范围眩晕。'
      },
      {
        title: '二、灵能觉醒种子',
        body: '击败精英敌人或首领有较高概率掉落灵能觉醒种子。按空格键或点击底部「灵能觉醒」后，再点击场上任意蘑菇，即可释放该蘑菇的专属大招：瞭望菇齐射、尖刺菇破土、爆裂菇陨落、灵光菇增益。'
      },
      {
        title: '三、战场即时操作',
        body: '1. 蛛网封印：连续点击被封印的蘑菇 3 次可将其解救，解救后短时间内攻速提升。\n2. 掘地敌人：点击其潜行的土堆，可将其踩出地面。\n3. 自爆蝉：它变红蓄力时快速点击可使其泄气，避免蘑菇被炸毁。'
      },
      {
        title: '四、无尽模式与生死阵型',
        body: '通关后解锁无尽模式，敌人的属性会逐波提升。林地坑位珍贵且固定，守卫一旦扎根便坚守到底，生命耗尽阵亡后方会空出位置。请合理安排前线坦度与后排火力，选中蘑菇按 P 键切换索敌偏好！'
      }
    ];

    const cardW = (w - 30) * 0.5;
    const cardH = (h - 30) * 0.5;

    for (let i = 0; i < scrolls.length; i++) {
      const sc = scrolls[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = x + 10 + col * (cardW + 10);
      const cy = y + 10 + row * (cardH + 10);

      roundRectPath(ctx, cx, cy, cardW, cardH, 8);
      ctx.fillStyle = 'rgba(255, 250, 235, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#C4A675';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      drawArtText(ctx, sc.title, cx + 14, cy + 18, {
        style: 'ink',
        size: 13,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0
      });

      this.drawWrappedText(ctx, sc.body, cx + 14, cy + 36, cardW - 28, 18, '#3D2817', `11px ${CN_FONT}`);
    }
    ctx.restore();
  }
  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, color, font) {
    if (text === null || text === undefined || text === '') return;
    text = String(text);
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let line = '';
    let curY = y;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const testLine = line + ch;
      if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
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
    ctx.restore();
    platform.recordDrawCall(1);
  }

  /**
   * 篇章 4：战术成就殿堂 (Kingdom Rush 20 大勋章殿堂)
   */
  renderCodexAchievementsTab(ctx, x, y, w, h) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 14);
    ctx.fillStyle = 'rgba(238, 222, 185, 0.98)';
    ctx.fill();
    ctx.strokeStyle = '#8C5E2A';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const achManager = require('../game/achievements');
    const allList = achManager.getAllAchievements();
    const unlockedCount = achManager.getUnlockedCount();
    const totalCount = achManager.getTotalCount();
    const totalStars = achManager.totalStarsEarned || 0;

    // 顶部统计栏
    roundRectPath(ctx, x + 12, y + 8, w - 24, 30, 8);
    ctx.fillStyle = 'rgba(59, 39, 24, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawArtText(ctx, '🏆 战术成就殿堂：已达成 ' + unlockedCount + ' / ' + totalCount + ' 项 · 获得荣誉星级：⭐ ' + totalStars + ' / 30', x + (w * 0.5), y + 23, {
      style: 'gold',
      size: 13,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });

    // 20 项成就以 2 列 × 10 行网格自适应展示（严密适配羊皮纸安全高度）
    const cardW = (w - 32) * 0.5;
    const cardH = 26;
    const startY = y + 44;

    for (let i = 0; i < allList.length; i++) {
      const a = allList[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = x + 12 + col * (cardW + 8);
      const cy = startY + row * (cardH + 2.5);

      roundRectPath(ctx, cx, cy, cardW, cardH, 6);
      ctx.fillStyle = a.unlocked ? 'rgba(255, 250, 235, 0.96)' : 'rgba(64, 46, 32, 0.72)';
      ctx.fill();
      ctx.strokeStyle = a.unlocked ? '#FFD700' : 'rgba(140, 94, 42, 0.45)';
      ctx.lineWidth = a.unlocked ? 1.4 : 1.0;
      ctx.stroke();

      // 统一徽章底托圆框（消除同列双表情混杂）
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx + 15, cy + 13, 9.5, 0, Math.PI * 2);
      ctx.fillStyle = a.unlocked ? 'rgba(212, 136, 6, 0.22)' : 'rgba(20, 14, 10, 0.65)';
      ctx.fill();
      ctx.strokeStyle = a.unlocked ? '#D48806' : 'rgba(196, 143, 69, 0.40)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(a.icon, cx + 15, cy + 13);
      ctx.restore();

      // 标题
      drawArtText(ctx, a.title, cx + 30, cy + 8.5, {
        style: a.unlocked ? 'ink' : 'gold',
        size: 10.5,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0
      });

      // 描述简述
      ctx.fillStyle = a.unlocked ? '#5E3E26' : '#D9CBA8';
      ctx.font = '9px ' + CN_FONT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const shortDesc = a.desc.length > 26 ? a.desc.slice(0, 25) + '...' : a.desc;
      ctx.fillText(shortDesc, cx + 30, cy + 19.5);

      // 右侧星级与状态
      drawArtText(ctx, a.unlocked ? ('+' + a.rewardStars + '⭐') : '🔒', cx + cardW - 18, cy + 13, {
        style: a.unlocked ? 'ink' : 'parchment',
        color: a.unlocked ? '#237804' : undefined,
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: a.unlocked ? 0 : 0.6
      });
    }

    ctx.restore();
  }

  // =========================================================================
  // 【植物大战僵尸经典一体化顶栏 Seed Bank】(全高度饱满卡牌、大字体清晰可读)
  // =========================================================================
  renderPvZTopSeedBank(ctx, scene) {
    const bankX = 10;
    const bankY = 478;
    const bankH = 58; // 贴底安放，让行 0~13 战场完全无遮挡！

    // 1. 金孢阳光存储槽 (Spore Bank Oval Plaque: 90x56px 舒展大气)
    const sporeW = 90;
    const sporeH = 56;
    const sporeX = bankX + 2;
    const sporeY = bankY + 2;

    ctx.save();
    roundRectPath(ctx, sporeX, sporeY, sporeW, sporeH, 12);
    ctx.fillStyle = 'rgba(28, 18, 10, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 阳光金孢大珍珠图标 (32x32)
    const sporeImg = platform.getImage('assets/vfx/item_golden_spore.png') || platform.getImage('assets/ui/icons/icon_spore.png');
    if (sporeImg && sporeImg.width) {
      ctx.drawImage(sporeImg, sporeX + 5, sporeY + 15, 32, 32);
    } else {
      drawUiIcon(ctx, 16, 'spore', sporeX + 7, sporeY + 17, 28);
    }

    // 金黄粗体孢子数字 (大号清晰 17px 粗体)
    const spores = scene.economy.spores;
    drawArtText(ctx, String(spores), sporeX + 56, sporeY + 36, {
      style: 'gold',
      size: 17,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.8
    });

    // 顶部生命守护值 (❤️ 20，字号升级至 12px 大字)
    const seeds = scene.economy.seeds;
    drawArtText(ctx, '❤️ ' + seeds, sporeX + 56, sporeY + 13, {
      style: seeds <= 5 ? 'crimson' : 'parchment',
      size: 12,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });
    ctx.restore();

    // 2. 5大蘑菇植物卡牌栏 (PvZ 经典纵向饱满卡槽: 54x56px)
    const towerOrder = ['watch', 'mist', 'thorn', 'burst', 'lumina'];
    const cardW = 54;
    const cardH = 56;
    const startX = sporeX + sporeW + 8;

    for (let i = 0; i < towerOrder.length; i++) {
      const tId = towerOrder[i];
      const def = TOWERS[tId];
      if (!def) continue;

      const cx = startX + i * (cardW + 5);
      const cy = bankY + 2;
      const cost = def.nodes ? def.nodes.base.cost : 100;
      const affordable = scene.economy.spores >= cost;
      const isSelected = scene.selectedBuildTowerId === tId;

      ctx.save();
      // 卡牌木质底板
      roundRectPath(ctx, cx, cy, cardW, cardH, 7);
      ctx.fillStyle = isSelected
        ? 'rgba(60, 44, 22, 0.98)'
        : (affordable ? 'rgba(32, 22, 14, 0.95)' : 'rgba(22, 16, 12, 0.88)');
      ctx.fill();
      ctx.strokeStyle = isSelected
        ? '#FFD700'
        : (affordable ? 'rgba(198, 143, 69, 0.80)' : 'rgba(95, 70, 45, 0.45)');
      ctx.lineWidth = isSelected ? 2.2 : 1.2;
      ctx.stroke();

      // 手绘蘑菇大原画 (42x40)
      const cardArtImg = platform.getImage('assets/ui/cards/card_' + tId + '.png');
      if (cardArtImg && cardArtImg.width) {
        ctx.save();
        if (!affordable) ctx.globalAlpha = 0.46;
        ctx.drawImage(cardArtImg, cx + 6, cy + 3, cardW - 12, 40);
        ctx.restore();
      } else {
        drawTowerSprite(ctx, tId, 'base', 'idle', 0, cx + 11, cy + 22);
      }

      // 底部金黄色标价药丸胶囊 (大字号 12px 标价清晰醒目)
      roundRectPath(ctx, cx + 3, cy + cardH - 17, cardW - 6, 15, 5);
      ctx.fillStyle = 'rgba(12, 7, 4, 0.92)';
      ctx.fill();
      ctx.strokeStyle = affordable ? 'rgba(255, 215, 0, 0.50)' : 'rgba(255, 77, 79, 0.45)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      drawArtText(ctx, String(cost), cx + cardW * 0.5, cy + cardH - 9.5, {
        style: affordable ? 'gold' : 'crimson',
        size: 12,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.1
      });

      // 快捷键角标 [1..5]
      roundRectPath(ctx, cx + 2, cy + 2, 13, 12, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fill();
      drawArtText(ctx, String(i + 1), cx + 8.5, cy + 8, {
        style: 'gold',
        size: 9.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.7
      });

      // 选中卡牌圆角流金脉冲外框（与圆角卡底完全贴合，无尖角突出）
      if (isSelected) {
        roundRectPath(ctx, cx + 1, cy + 1, cardW - 2, cardH - 2, 7);
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 2.0;
        ctx.stroke();
      }

      ctx.restore();

      this.registerButton('slot_' + tId, cx, cy, cardW, cardH, () => {
        scene.selectBuildTowerType(tId);
        platform.playSfx('sfx_click');
      }, { towerId: tId });
    }

    // 3. 远古灵能觉醒槽 (Awakening Plant Food: 68x60px 紧邻卡槽)
    const awkX = startX + towerOrder.length * (cardW + 5) + 6;
    const awkY = bankY + 2;
    const awkW = 68;
    const awkH = cardH;
    const isAwk = Boolean(scene.activeAwakeningTargeting);

    ctx.save();
    roundRectPath(ctx, awkX, awkY, awkW, awkH, 7);
    ctx.fillStyle = isAwk ? 'rgba(38, 92, 18, 0.95)' : 'rgba(24, 20, 14, 0.94)';
    ctx.fill();
    ctx.strokeStyle = isAwk ? '#D3F261' : 'rgba(115, 209, 61, 0.65)';
    ctx.lineWidth = isAwk ? 2.2 : 1.2;
    ctx.stroke();

    const seedImg = platform.getImage('assets/vfx/item_awakening_seed.png') || platform.getImage('assets/ui/icons/icon_seed.png');
    if (seedImg && seedImg.width) {
      ctx.drawImage(seedImg, awkX + (awkW - 28) * 0.5, awkY + 6, 28, 28);
    } else {
      drawArtText(ctx, '🍃', awkX + awkW * 0.5, awkY + 18, {
        style: 'emerald',
        size: 16,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });
    }

    const awkCount = scene.awakeningSeeds || 0;
    drawArtText(ctx, '觉醒 ×' + awkCount, awkX + awkW * 0.5, awkY + awkH - 11, {
      style: awkCount > 0 ? 'emerald' : 'dim',
      size: 11,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.9
    });
    ctx.restore();

    this.registerButton('pvz_awakening', awkX, awkY, awkW, awkH, () => {
      if (typeof scene.toggleAwakening === 'function') {
        scene.toggleAwakening();
      }
    });
  }

  // =========================================================================
  // 【顶部波次推进旗舰进度槽 PvZ Wave Flag】(放大按键与清晰粗体，彻底告别微缩字体)
  // =========================================================================
  renderPvZTopWaveBar(ctx, scene) {
    const waveMgr = scene.waveManager;
    const barX = 492;
    const barY = 486;
    const barW = 200;
    const barH = 42; // 高度 42px，按键舒适，大字号完全舒展

    if (waveMgr.isPrepPhase()) {
      const earlyBonus = Math.min(
        CONFIG.ECONOMY.EARLY_CALL_MAX,
        Math.floor(waveMgr.prepTimerSec * CONFIG.ECONOMY.EARLY_CALL_PER_SEC)
      );
      this.drawPixelButton(
        ctx,
        'pvz_call_wave',
        barX,
        barY,
        barW,
        barH,
        '📢 提前迎战 +' + earlyBonus + ' 🪙',
        {
          skin: 'btn_green',
          font: 'bold 15px ' + CN_FONT
        },
        () => {
          scene.callWaveEarly();
        }
      );
      return;
    }

    ctx.save();
    roundRectPath(ctx, barX, barY, barW, barH, 9);
    ctx.fillStyle = 'rgba(18, 12, 8, 0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.80)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    const currentW = waveMgr.currentWaveIndex;
    const totalW = waveMgr.totalWaves;
    const ratio = Math.max(0, Math.min(1.0, currentW / totalW));

    roundRectPath(ctx, barX + 3, barY + 3, (barW - 6) * ratio, barH - 6, 7);
    ctx.fillStyle = 'rgba(82, 196, 26, 0.65)';
    ctx.fill();

    drawArtText(ctx, '第 ' + currentW + ' / ' + totalW + ' 波', barX + barW * 0.5, barY + barH * 0.5, {
      style: currentW >= totalW ? 'crimson' : 'gold',
      size: 15,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.2
    });
    ctx.restore();
  }

  // =========================================================================
  // 【右上角极简大字号功能键 PvZ Top Right Menu】(尺寸 42px 高度，字号 15px 醒目易触)
  // =========================================================================
  renderPvZTopRightMenu(ctx, scene) {
    const btnH = 42;
    const btnY = 486;

    this.drawPixelButton(
      ctx,
      'pvz_speed',
      700,
      btnY,
      68,
      btnH,
      scene.speedMultiplier + '×速',
      {
        skin: scene.speedMultiplier > 1 ? 'btn_blue' : 'btn_wood',
        font: 'bold 15px ' + CN_FONT
      },
      () => {
        scene.cycleSpeed();
      }
    );

    this.drawPixelButton(
      ctx,
      'pvz_pause',
      774,
      btnY,
      68,
      btnH,
      '⏸ 暂停',
      {
        skin: 'btn_wood',
        font: 'bold 15px ' + CN_FONT
      },
      () => {
        scene.pauseGame();
      }
    );

    this.drawPixelButton(
      ctx,
      'pvz_menu',
      848,
      btnY,
      92,
      btnH,
      '⚙️ 菜单',
      {
        skin: 'btn_wood',
        font: 'bold 15px ' + CN_FONT
      },
      () => {
        platform.playSfx('sfx_click');
        this.showSettingsModal = true;
      }
    );
  }

  // =========================================================================
  // 【左下角极简圆盘英雄徽章与神术法球 PvZ Hero Emblem & Spell Orbs】
  // =========================================================================
  renderPvZBottomLeftHeroAndSpells(ctx, scene) {
    const hero = scene.hero;
    if (!hero) return;

    // 统一质感底托：精致暗木黄铜英雄与神术统筹盘（X: 8..190, Y: 384..464），告别松散悬空图标
    ctx.save();
    roundRectPath(ctx, 8, 384, 178, 82, 10);
    const panelGrad = ctx.createLinearGradient(8, 384, 8, 466);
    panelGrad.addColorStop(0, 'rgba(28, 21, 14, 0.90)');
    panelGrad.addColorStop(1, 'rgba(16, 12, 8, 0.94)');
    ctx.fillStyle = panelGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.65)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // 1. 左侧边缘英雄统御竖栏（紧凑整合于统筹盘内）
    const hx = 34;
    const hy = 434;
    const hr = 19;

    // 1.1 英雄战术姿态快速切换微章 [Z] (位于头像正上方 y=390)
    const stanceMeta = {
      guardian: { label: '🛡️ 守卫', bg: 'rgba(18, 42, 68, 0.92)', bd: '#69C0FF', col: '#BAE7FF' },
      aggressive: { label: '⚔️ 狂暴', bg: 'rgba(68, 22, 22, 0.92)', bd: '#FF7875', col: '#FFD8BF' },
      scout: { label: '🏹 游侠', bg: 'rgba(20, 56, 26, 0.92)', bd: '#73D13D', col: '#D9F7BE' }
    }[hero.stance || 'guardian'] || { label: '🛡️ 守卫', bg: 'rgba(18, 42, 68, 0.92)', bd: '#69C0FF', col: '#BAE7FF' };

    ctx.save();
    roundRectPath(ctx, 12, hy - hr - 24, 58, 18, 9);
    ctx.fillStyle = stanceMeta.bg;
    ctx.fill();
    ctx.strokeStyle = stanceMeta.bd;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    drawArtText(ctx, stanceMeta.label, 41, hy - hr - 15, {
      style: 'parchment',
      color: stanceMeta.col,
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.7
    });
    ctx.restore();

    this.registerButton('pvz_hero_stance', 12, hy - hr - 24, 58, 18, () => {
      hero.cycleStance(scene.fx);
      if (hero.stanceSwitchedCount >= 3 && scene.achievements) {
        scene.achievements.unlock('tactical_stances', scene.fx);
      }
    });

    // 1.2 英雄大招 [F] 触发胶囊（位于头像右侧 y=hy-hr-24）
    const ultCd = hero.skillCooldown || 0;
    const ultReady = ultCd <= 0 && hero.state !== 'dead';
    ctx.save();
    roundRectPath(ctx, 74, hy - hr - 24, 72, 18, 9);
    ctx.fillStyle = ultReady ? 'rgba(62, 42, 10, 0.94)' : 'rgba(24, 18, 12, 0.88)';
    ctx.fill();
    ctx.strokeStyle = ultReady ? '#FFD700' : 'rgba(140, 110, 70, 0.45)';
    ctx.lineWidth = ultReady ? 1.5 : 1.0;
    ctx.stroke();
    drawArtText(ctx, ultReady ? '⚡裂地斩[F]' : `奥义 ${Math.ceil(ultCd)}s`, 110, hy - hr - 15, {
      style: ultReady ? 'gold' : 'dim',
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.7
    });
    ctx.restore();

    this.registerButton('pvz_hero_ult', 74, hy - hr - 24, 72, 18, () => {
      if (ultReady && typeof hero.castUltimateSkill === 'function') {
        hero.castUltimateSkill(scene.enemyManager, scene.fx);
        platform.playSfx('sfx_thunder');
      } else {
        this.showToast(hero.state === 'dead' ? '英雄正在复活中' : `大招冷却中: ${Math.ceil(ultCd)}s`);
      }
    });

    // 1.3 英雄圆形头像盘（点击选中并调遣英雄站位）
    ctx.save();
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 14, 8, 0.94)';
    ctx.fill();
    ctx.strokeStyle = (scene.activeHeroRally || hero.isSelected) ? '#FFD700' : '#C68F45';
    ctx.lineWidth = (scene.activeHeroRally || hero.isSelected) ? 2.2 : 1.6;
    ctx.stroke();

    const hpRatio = Math.max(0, Math.min(1.0, hero.hp / (hero.maxHp || 1)));
    ctx.beginPath();
    ctx.arc(hx, hy, hr + 2, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * hpRatio);
    ctx.strokeStyle = hpRatio > 0.35 ? '#52C41A' : '#FF4D4F';
    ctx.lineWidth = 3.0;
    ctx.stroke();

    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    if (heroImg && heroImg.width) {
      ctx.drawImage(heroImg, hx - 18, hy - 18, 36, 36);
    } else {
      drawArtText(ctx, '🌲', hx, hy, { style: 'emerald', size: 17, align: 'center', baseline: 'middle' });
    }

    if (ultReady) {
      const uPulse = 1.0 + Math.sin(this.uiAnimTime * 8) * 0.10;
      ctx.strokeStyle = 'rgba(255, 215, 0, ' + (0.65 + Math.sin(this.uiAnimTime * 8) * 0.25) + ')';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(hx, hy, (hr + 4) * uPulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    roundRectPath(ctx, hx - 14, hy + hr - 8, 28, 12, 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fill();
    drawArtText(ctx, 'Lv.' + (hero.level || 1), hx, hy + hr - 2, {
      style: 'gold',
      size: 9.5,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.7
    });
    ctx.restore();

    this.registerButton('pvz_hero_badge', hx - hr, hy - hr, hr * 2, hr * 2, () => {
      scene.activeHeroRally = !scene.activeHeroRally;
      hero.isSelected = scene.activeHeroRally;
      platform.playSfx('sfx_click');
      if (scene.activeHeroRally && scene.fx) {
        scene.fx.spawnFloatingText(hero.x, hero.y - 26, '请点击道路/地面调遣英雄!', '#FFE58F', 1.1);
      }
    });

    // 2. 四大自然战术法球 ([Q]甘霖45, [W]天雷75, [E]丰饶0, [R]菇精卫集结0) 紧凑对齐于左侧栏
    const spellList = [
      { id: 'rain', name: '甘霖', key: 'Q', cost: 45, icon: 'assets/ui/icons/spell_rain.png', vfx: 'assets/vfx/relic_clover.png' },
      { id: 'shock', name: '天雷', key: 'W', cost: 75, icon: 'assets/ui/icons/spell_shock.png', vfx: 'assets/vfx/relic_lightning.png' },
      { id: 'harvest', name: '丰饶', key: 'E', cost: 0, icon: 'assets/ui/icons/spell_harvest.png', vfx: 'assets/vfx/relic_amber.png' },
      { id: 'rally', name: '集结', key: 'R', cost: 0, icon: 'assets/vfx/prop_rally_flag.png', vfx: 'assets/vfx/prop_rally_flag.png' }
    ];

    const orbR = 13;
    const orbStartX = hx + hr + 16;

    for (let sIdx = 0; sIdx < spellList.length; sIdx++) {
      const spItem = spellList[sIdx];
      const sp = scene.spells ? scene.spells[spItem.id] : null;
      const spCd = (sp && sp.timer) || 0;
      const spMaxCd = (sp && sp.cd) || 15;
      const canCast = spCd <= 0 && scene.economy.spores >= spItem.cost;
      const ox = orbStartX + sIdx * (orbR * 2 + 4);
      const oy = hy;

      ctx.save();
      ctx.beginPath();
      ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
      ctx.fillStyle = canCast ? 'rgba(20, 28, 22, 0.94)' : 'rgba(16, 14, 12, 0.88)';
      ctx.fill();
      ctx.strokeStyle = (spItem.id === 'rally' && scene.activeRallyTargeting)
        ? '#FFD700'
        : (canCast ? '#73D13D' : 'rgba(150, 120, 80, 0.45)');
      ctx.lineWidth = (spItem.id === 'rally' && scene.activeRallyTargeting) ? 2.0 : 1.3;
      ctx.stroke();

      const spImg = platform.getImage(spItem.icon) || platform.getImage(spItem.vfx);
      if (spImg && spImg.width) {
        if (!canCast) ctx.globalAlpha = 0.45;
        ctx.drawImage(spImg, ox - 10, oy - 10, 20, 20);
      } else {
        drawArtText(ctx, spItem.name[0], ox, oy - 1, {
          style: canCast ? 'emerald' : 'dim',
          size: 12,
          align: 'center',
          baseline: 'middle'
        });
      }

      roundRectPath(ctx, ox - 13, oy + orbR - 7, 26, 11, 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.fill();
      drawArtText(ctx, spItem.cost > 0 ? (spItem.cost + '') : spItem.key, ox, oy + orbR - 1.5, {
        style: canCast ? 'gold' : 'dim',
        size: 8.5,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.5
      });

      if (spCd > 0) {
        const sweepRatio = spCd / Math.max(1, spMaxCd);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.arc(ox, oy, orbR, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * sweepRatio);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fill();
      }

      ctx.restore();

      this.registerButton('pvz_spell_' + spItem.id, ox - orbR, oy - orbR, orbR * 2, orbR * 2, () => {
        if (canCast) {
          scene.triggerSpell(spItem.id);
          platform.playSfx('sfx_click');
        } else {
          this.showToast(spCd > 0 ? `冷却中: ${Math.ceil(spCd)}s` : `孢子不足 (需 ${spItem.cost})`);
        }
      });
    }
  }
}

module.exports = UiManager;
