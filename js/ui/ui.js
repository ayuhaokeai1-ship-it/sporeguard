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

  // 1. 底层精细投影
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = shadowY;

  // 2. 发丝级描边（若开启）
  if (effectiveStroke > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = effectiveStroke * 1.4;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(str, x, y);
  }

  // 关闭投影以渲染清晰字面
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 3. 字体字面（小字优先高对比度第一阶颜色，大字采用微渐变）
  if (size <= 13 && style !== 'gold') {
    ctx.fillStyle = gradColors[0];
    ctx.fillText(str, x, y);
  } else {
    const h = size;
    const topY = baseline === 'middle' ? y - h * 0.5 : (baseline === 'top' ? y : y - h);
    const grad = ctx.createLinearGradient(x, topY, x, topY + h);
    grad.addColorStop(0.0, gradColors[0]);
    grad.addColorStop(0.40, gradColors[1]);
    grad.addColorStop(0.80, gradColors[2]);
    grad.addColorStop(1.0, gradColors[3]);
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

    // 顶部资源变化缩放反馈与建造冷却动画
    this.lastSeeds = null;
    this.lastSpores = null;
    this.seedPopTimer = 0;
    this.sporePopTimer = 0;
    this.cardCooldowns = { watch: 0, mist: 0, thorn: 0, burst: 0 };

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
  }

  update(realDt) {
    this.uiAnimTime += realDt;
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
      this.cardCooldowns[towerId] = 0.45;
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
      if (dist >= 7) {
        this.isDragging = true;
        if (scene) {
          scene.selectedBuildTowerId = this.draggingTowerId;
        }
      }
    }
  }

  /**
   * 处理按压事件（支持短点击与拖拽起步）
   */
  handlePointerDown(x, y, scene) {
    this.hoverX = x;
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
      // (A) PvZ 式阳光/晨露金孢点击即时收集
      if (scene.sporeDropManager && scene.sporeDropManager.handlePointerDown(x, y, scene.economy, scene.fx)) {
        return true;
      }

      // (B) 掘地潜行怪点击踩踏 & 自爆蝉点击泄气
      if (scene.enemyManager && scene.enemyManager.handleClickOnEnemy(x, y, scene.fx)) {
        return true;
      }

      // (C) 茧丝缠绕快速点击救援 (Tap-to-Rescue)
      if (scene.towerManager && scene.towerManager.towers) {
        for (let i = 0; i < scene.towerManager.towers.length; i++) {
          const tw = scene.towerManager.towers[i];
          if (tw.isWebbed && Math.hypot(x - tw.x, y - tw.y) <= 32) {
            tw.webTapCount = (tw.webTapCount || 0) + 1;
            scene.economy.addSpores(5);
            scene.fx.spawnFloatingText(tw.x, tw.y - 20, '+5 孢子 撕扯!', '#BAE7FF', 1.0);
            scene.fx.spawnParticles(tw.x, tw.y, 8, ['#BAE7FF', '#FFFFFF'], 15, 30);
            platform.playSfx('sfx_thorn');

            if (tw.webTapCount >= 3) {
              tw.isWebbed = false;
              tw.webTapCount = 0;
              tw.superchargeTimer = 4.0; // 破茧狂暴 2.2 倍攻速！
              scene.fx.spawnFloatingText(tw.x, tw.y - 26, '破茧狂暴 攻速翻倍!', '#FFD700', 1.4);
              scene.fx.spawnParticles(tw.x, tw.y, 20, ['#FFD700', '#FFA940', '#FFFFFF'], 30, 60);
              platform.playSfx('sfx_upgrade');
            }
            return true;
          }
        }
      }

      // (D) 铲子模式点击铲除移植
      if (scene.shovelActive && scene.towerManager) {
        const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
        const mx = (x - mv.OFFSET_X) / mv.SCALE;
        const my = (y - mv.OFFSET_Y) / mv.SCALE;
        const col = Math.floor(mx / TILE_SIZE);
        const row = Math.floor(my / TILE_SIZE);
        const tw = scene.towerManager.getTowerAt(col, row);
        if (tw) {
          scene.shovelTower(tw);
          return true;
        } else {
          scene.toggleShovel(); // 点击空地取消铲子
          return true;
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
        if (b.id && b.id.indexOf('slot_') === 0) {
          const tId = (b.meta && b.meta.towerId) || b.id.replace('slot_', '');
          this.draggingTowerId = tId;
          this.pressedSlotButton = b;
          platform.playSfx('sfx_click');
          return true;
        } else {
          if (b.onClick) {
            b.onClick(b);
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
    if (this.isDragging && this.draggingTowerId && scene && scene.state === 'BATTLE') {
      const tId = this.draggingTowerId;
      const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
      const mx = (x - mv.OFFSET_X) / mv.SCALE;
      const my = (y - mv.OFFSET_Y) / mv.SCALE;
      const col = Math.floor(mx / TILE_SIZE);
      const row = Math.floor(my / TILE_SIZE);

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
        this.pressedSlotButton.onClick(this.pressedSlotButton);
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
        ctx.imageSmoothingQuality = 'high';
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
      const match = options.font.match(/(\d+)px/);
      if (match) fSize = parseInt(match[1], 10);
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

    this.drawPixelButton(ctx, 'title_lang', 824, 18, 114, 36, i18n.getLang() === 'zh' ? '语言：中文' : 'Lang: EN', {
      skin: 'btn_wood',
      font: `bold 13px ${CN_FONT}`
    }, () => {
      const nextLang = i18n.toggleLang();
      storage.updateSettings({ lang: nextLang });
      platform.playSfx('sfx_click');
    });

    if (this.showSettingsModal) {
      this.renderSettingsModal(ctx);
    } else if (this.showGuideModal) {
      this.renderGuideModal(ctx);
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
    ctx.font = `bold 22px ${CN_FONT}`;
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

    this.drawPixelButton(ctx, 'lvl_settings', 824, 18, 112, 40, i18n.t('btn_settings'), {
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
        this.drawPixelButton(ctx, 'play_' + mapId, cardX + 28, cardY + 362, cardW - 56, 44, i18n.t('btn_start'), {
          skin: 'btn_green',
          font: `bold 16px ${CN_FONT}`,
          iconKey: 'play'
        }, () => {
          platform.playSfx('sfx_click');
          scene.startLevel(mapId);
        });
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
      this.renderSettingsModal(ctx);
    }
  }

  // =========================================================================
  // 3. 战斗 HUD：全屏森林战场环绕式布局
  // =========================================================================
  renderBattleHud(ctx, scene) {
    this.clearButtons();

    // 1. 左上角：深色木质资源栏 + 波次状态与提前召唤号角
    this.renderTopResourceBar(ctx, scene);

    // 侧翼突袭动态警报横幅 (Flank Incursion Banner)
    if (scene.flankAlertTimer > 0) {
      ctx.save();
      const bannerW = 420;
      const bannerH = 40;
      const bx = (960 - bannerW) * 0.5;
      const by = 68;
      const pulse = 1.0 + Math.sin(this.uiAnimTime * 12) * 0.04;

      ctx.translate(480, 88);
      ctx.scale(pulse, pulse);
      ctx.translate(-480, -88);

      roundRectPath(ctx, bx, by, bannerW, bannerH, 10);
      ctx.fillStyle = 'rgba(140, 29, 24, 0.92)';
      ctx.fill();
      ctx.strokeStyle = '#FFA39E';
      ctx.lineWidth = 2;
      ctx.stroke();

      drawArtText(ctx, '⚠️ 敌军侧翼突袭! 注意防范南路溪径!', 480, 88, {
        style: 'gold',
        size: 15,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.8
      });
      ctx.restore();
    }

    // 铲子模式全屏指示
    if (scene.shovelActive) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 77, 79, 0.15)';
      ctx.fillRect(0, 0, 960, 540);
      drawArtText(ctx, '【铲子模式】点击任意蘑菇进行移植回收，点击空地退出', 480, 395, {
        style: 'gold',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.5
      });
      ctx.restore();
    }

    // 2. 右上角：古铜木质快捷控制栏（倍速、暂停、图鉴、设置）
    this.renderTopRightControls(ctx, scene);

    // 3. 左下角：指挥官战术主动技能勋章栏（自然甘霖 [Q]、雷霆震爆 [W]、大地丰收 [E]）
    this.renderCommanderSpellDock(ctx, scene);

    // 4. 底部居中：植物塔防式蘑菇建造卡片栏
    this.renderBottomBuildDock(ctx, scene);

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
      this.renderSettingsModal(ctx);
    } else if (this.showGuideModal) {
      this.renderGuideModal(ctx);
    } else if (scene.state === 'PAUSED') {
      this.renderPauseOverlay(ctx, scene);
    } else if (scene.state === 'SETTLEMENT') {
      this.renderSettlementOverlay(ctx, scene);
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

    const barX = 12;
    const barY = 8;
    const barW = 446;
    const barH = 54;

    // 顶部 AI 雕刻木纹藤蔓横梁
    this.drawAiFrame(ctx, 'top_bar', barX, barY, barW, barH, 0.98);

    // (A) 生命种子胶囊槽
    ctx.save();
    roundRectPath(ctx, barX + 26, barY + 13, 98, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const seedScale = 1 + (this.seedPopTimer > 0 ? Math.sin((this.seedPopTimer / 0.28) * Math.PI) * 0.22 : 0);
    drawUiIcon(ctx, 16, 'seed', barX + 32, barY + 14, 26);
    ctx.translate(barX + 82, barY + 27);
    ctx.scale(seedScale, seedScale);
    drawArtText(ctx, String(seeds), 0, 0, {
      style: seeds <= 5 ? 'crimson' : 'parchment',
      size: 17,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.8
    });
    ctx.restore();

    // (B) 黄金孢子胶囊槽
    ctx.save();
    roundRectPath(ctx, barX + 132, barY + 13, 122, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const sporeScale = 1 + (this.sporePopTimer > 0 ? Math.sin((this.sporePopTimer / 0.24) * Math.PI) * 0.22 : 0);
    drawUiIcon(ctx, 16, 'spore', barX + 138, barY + 14, 26);
    ctx.translate(barX + 202, barY + 27);
    ctx.scale(sporeScale, sporeScale);
    drawArtText(ctx, String(spores), 0, 0, {
      style: 'gold',
      size: 17,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 2.0
    });
    ctx.restore();

    // (C) 波次进度与状态铭牌
    const waveMgr = scene.waveManager;
    ctx.save();
    roundRectPath(ctx, barX + 262, barY + 13, 160, 28, 14);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.58)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 187, 96, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawUiIcon(ctx, 16, 'skull', barX + 268, barY + 15, 24);
    drawArtText(ctx, `第 ${waveMgr.currentWaveIndex}/${waveMgr.totalWaves} 波`, barX + 295, barY + 27, {
      style: 'parchment',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 1.5
    });

    const statusTag = waveMgr.isPrepPhase()
      ? `${Math.ceil(waveMgr.prepTimerSec)}s`
      : '迎战';
    drawArtText(ctx, statusTag, barX + 414, barY + 27, {
      style: waveMgr.isPrepPhase() ? 'azure' : 'crimson',
      size: 12,
      align: 'right',
      baseline: 'middle',
      strokeWidth: 1.5
    });
    ctx.restore();

    // (D) 紧邻资源条右侧：备战期「提前迎敌 (+奖励)」号角按钮 或 战斗期「下波预告」胶囊
    if (waveMgr.isPrepPhase()) {
      const earlyBonus = Math.min(
        CONFIG.ECONOMY.EARLY_CALL_MAX,
        Math.floor(waveMgr.prepTimerSec * CONFIG.ECONOMY.EARLY_CALL_PER_SEC)
      );
      this.drawPixelButton(
        ctx,
        'hud_call_wave',
        464,
        14,
        154,
        40,
        `提前迎敌 +${earlyBonus}`,
        {
          skin: 'btn_green',
          font: `bold 13px ${CN_FONT}`,
          iconKey: 'horn',
          iconSize: 22
        },
        () => {
          scene.callWaveEarly();
        }
      );
    } else {
      const summary = waveMgr.getUpcomingWaveSummary();
      if (summary.length > 0) {
        ctx.save();
        this.drawAiFrame(ctx, 'btn_wood', 464, 14, 154, 40, 0.92);
        const first = summary[0];
        drawEnemySprite(ctx, first.type, 'walk', 0, 488, 34, false);
        drawArtText(ctx, `波次: ${i18n.t(first.def.nameKey)} ×${first.count}`, 506, 34, {
          style: 'parchment',
          size: 12,
          align: 'left',
          baseline: 'middle',
          strokeWidth: 1.5
        });
        ctx.restore();
      }
    }
  }

  /**
   * 3.2 右上角快捷控制栏（倍速、暂停、图鉴、设置）
   */
  renderTopRightControls(ctx, scene) {
    // 倍速切换按钮 (1x / 2x / 3x)
    this.drawPixelButton(
      ctx,
      'hud_speed',
      648,
      14,
      82,
      40,
      `${scene.speedMultiplier}× 加速`,
      {
        skin: scene.speedMultiplier > 1 ? 'btn_blue' : 'btn_wood',
        font: `bold 12px ${CN_FONT}`,
        iconKey: 'speed',
        iconSize: 20
      },
      () => {
        scene.cycleSpeed();
      }
    );

    // 暂停按钮
    this.drawPixelButton(
      ctx,
      'hud_pause',
      736,
      14,
      72,
      40,
      '暂停',
      {
        skin: 'btn_wood',
        font: `bold 12px ${CN_FONT}`,
        iconKey: 'pause',
        iconSize: 18
      },
      () => {
        scene.pauseGame();
      }
    );

    // 战术图鉴按钮
    this.drawPixelButton(
      ctx,
      'hud_guide',
      814,
      14,
      66,
      40,
      '图鉴',
      {
        skin: 'btn_wood',
        font: `bold 12px ${CN_FONT}`,
        iconCat: 24,
        iconKey: 'guide',
        iconSize: 18
      },
      () => {
        platform.playSfx('sfx_click');
        this.guideStep = 0;
        this.showGuideModal = true;
      }
    );

    // 设置按钮
    this.drawPixelButton(
      ctx,
      'hud_settings',
      886,
      14,
      62,
      40,
      '设置',
      {
        skin: 'btn_wood',
        font: `bold 12px ${CN_FONT}`,
        iconKey: 'settings',
        iconSize: 18
      },
      () => {
        platform.playSfx('sfx_click');
        this.showSettingsModal = true;
      }
    );
  }

  /**
   * 3.25 左下角指挥官战术主动技能勋章栏（自然甘霖 [Q]、雷霆震爆 [W]、大地丰收 [E]）
   */
  renderCommanderSpellDock(ctx, scene) {
    const spellList = [
      { id: 'rain', hotkey: 'Q', tip: '自然甘霖 (急救回血/攻速翻倍)' },
      { id: 'shock', hotkey: 'W', tip: '雷霆震爆 (轰击眩晕/定身3秒)' },
      { id: 'harvest', hotkey: 'E', tip: '大地丰收 (+120黄金孢子)' },
      { id: 'rally', hotkey: 'R', tip: '菇精卫 (调兵接怪阻挡)' }
    ];

    const dockX = 14;
    const btnSize = 52;
    const gap = 12;
    const totalW = spellList.length * btnSize + (spellList.length - 1) * gap; // 244

    // -----------------------------------------------------------------
    // [A] 上层领袖指挥台：英雄调遣 + 裂地斩 [F] + 灵能觉醒种子 [空格]
    // -----------------------------------------------------------------
    const heroBarY = 370;
    const heroBarH = 62;
    ctx.save();
    roundRectPath(ctx, dockX - 6, heroBarY, totalW + 12, heroBarH, 14);
    ctx.fillStyle = 'rgba(22, 14, 8, 0.82)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    drawArtText(ctx, '森林领袖 · 灵能超载', dockX + totalW * 0.5, heroBarY + 8, {
      style: 'gold',
      size: 10,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });
    ctx.restore();

    // 1. 英雄头像与状态槽 (X = dockX + 4, Y = heroBarY + 16, 44x40)
    const hx = dockX + 6;
    const hy = heroBarY + 16;
    const hero = scene.hero;
    const isHeroRallying = scene.activeHeroRally || (hero && hero.isSelected);

    ctx.save();
    roundRectPath(ctx, hx, hy, 44, 40, 10);
    ctx.fillStyle = 'rgba(15, 20, 15, 0.9)';
    ctx.fill();
    ctx.strokeStyle = isHeroRallying ? '#FFE58F' : '#8C5E2A';
    ctx.lineWidth = isHeroRallying ? 2.5 : 1.5;
    ctx.stroke();

    // 绘制英雄头像
    const heroImg = platform.getImage('assets/vfx/hero_oak.png');
    if (heroImg && heroImg.width) {
      ctx.drawImage(heroImg, hx + 2, hy + 2, 40, 36);
    }

    // 等级角标
    roundRectPath(ctx, hx - 2, hy - 4, 22, 14, 4);
    ctx.fillStyle = '#8C5E2A';
    ctx.fill();
    drawArtText(ctx, `L${hero ? hero.level : 1}`, hx + 9, hy + 3, {
      style: 'gold',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });

    // 英雄血条
    if (hero) {
      const hpRatio = Math.max(0, hero.hp / hero.maxHp);
      roundRectPath(ctx, hx + 2, hy + 34, 40, 4, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fill();
      roundRectPath(ctx, hx + 2, hy + 34, 40 * hpRatio, 4, 2);
      ctx.fillStyle = hero.state === 'dead' ? '#8C2D29' : (hpRatio > 0.4 ? '#52C41A' : '#FF4D4F');
      ctx.fill();
    }
    ctx.restore();

    this.registerButton('hero_portrait', hx, hy, 44, 40, () => {
      if (scene.hero) {
        scene.activeHeroRally = !scene.activeHeroRally;
        scene.hero.isSelected = scene.activeHeroRally;
        platform.playSfx('sfx_click');
        if (scene.activeHeroRally) {
          scene.fx.spawnFloatingText(scene.hero.x, scene.hero.y - 24, '集结驻守：点击战场移动', '#FFE58F', 1.2);
        }
      }
    });

    // 2. 英雄专属大招【大地裂地斩】 [F]
    const sx = dockX + 66;
    const sy = heroBarY + 16;
    const skillOnCd = hero ? (hero.skillCooldown > 0 || hero.state === 'dead') : true;

    ctx.save();
    roundRectPath(ctx, sx, sy, 48, 40, 10);
    ctx.fillStyle = 'rgba(20, 15, 10, 0.9)';
    ctx.fill();

    if (!skillOnCd) {
      const pulse = 1 + Math.sin(this.uiAnimTime * 8) * 0.08;
      ctx.save();
      ctx.translate(sx + 24, sy + 20);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = !skillOnCd ? '#FFD700' : '#5E3E26';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    drawArtText(ctx, '裂地斩', sx + 24, sy + 15, {
      style: !skillOnCd ? 'gold' : 'parchment',
      size: 11,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });

    if (skillOnCd && hero) {
      const cdSec = hero.state === 'dead' ? Math.ceil(hero.reviveTimer) : Math.ceil(hero.skillCooldown);
      drawArtText(ctx, `${cdSec}s`, sx + 24, sy + 28, {
        style: 'crimson',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });
    } else {
      drawArtText(ctx, '就绪', sx + 24, sy + 28, {
        style: 'emerald',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
      });
    }

    // 快捷键角标 [F]
    roundRectPath(ctx, sx - 2, sy - 4, 16, 14, 4);
    ctx.fillStyle = '#1D39C4';
    ctx.fill();
    drawArtText(ctx, 'F', sx + 6, hy + 3, {
      style: 'gold',
      size: 9,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });
    ctx.restore();

    this.registerButton('hero_ult_btn', sx, sy, 48, 40, () => {
      if (scene.hero) {
        scene.hero.castUltimateSkill(scene.enemyManager, scene.fx);
      }
    });

    // 3. 灵能超载觉醒种子 [空格]
    const ax = dockX + 130;
    const ay = heroBarY + 16;
    const isAwakeningActive = Boolean(scene.activeAwakeningTargeting);

    ctx.save();
    roundRectPath(ctx, ax, ay, 52, 40, 10);
    ctx.fillStyle = 'rgba(25, 12, 35, 0.92)';
    ctx.fill();

    if (isAwakeningActive) {
      const pulse = 1 + Math.sin(this.uiAnimTime * 10) * 0.10;
      ctx.save();
      ctx.translate(ax + 26, ay + 20);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#B37FEB';
      ctx.lineWidth = 2.8;
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = isAwakeningActive ? '#D3ADF7' : '#722ED1';
    ctx.lineWidth = isAwakeningActive ? 2.4 : 1.6;
    ctx.stroke();

    const seedImg = platform.getImage('assets/vfx/item_awakening_seed.png');
    if (seedImg && seedImg.width) {
      ctx.drawImage(seedImg, ax + 4, ay + 4, 28, 32);
    }

    // 数量角标
    const seedCount = scene.awakeningSeeds || 0;
    drawArtText(ctx, `×${seedCount}`, ax + 38, ay + 20, {
      style: seedCount > 0 ? 'gold' : 'parchment',
      size: 13,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.2
    });

    // 快捷键提示
    roundRectPath(ctx, ax - 2, ay - 4, 24, 14, 4);
    ctx.fillStyle = '#722ED1';
    ctx.fill();
    drawArtText(ctx, '空格', ax + 10, ay + 3, {
      style: 'gold',
      size: 8,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });
    ctx.restore();

    this.registerButton('awakening_btn', ax, ay, 52, 40, () => {
      if ((scene.awakeningSeeds || 0) > 0) {
        scene.activeAwakeningTargeting = !scene.activeAwakeningTargeting;
        platform.playSfx('sfx_click');
        if (scene.activeAwakeningTargeting) {
          scene.fx.spawnFloatingText(480, 240, '请点击场上的蘑菇触发灵能觉醒超载!', '#722ED1', 1.5);
        }
      } else {
        scene.fx.spawnFloatingText(480, 240, '灵能觉醒种子不足(击退精英虫怪获取)!', '#FF4D4F', 1.2);
        platform.playSfx('sfx_sell');
      }
    });

    // 4. 林地秘典图鉴快捷入口按钮 [图鉴]
    const gx = dockX + 196;
    const gy = heroBarY + 16;
    ctx.save();
    roundRectPath(ctx, gx, gy, 44, 40, 10);
    ctx.fillStyle = 'rgba(28, 20, 10, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#C68F45';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    drawArtText(ctx, '图鉴', gx + 22, gy + 15, {
      style: 'gold',
      size: 12,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });
    drawArtText(ctx, '秘典', gx + 22, gy + 28, {
      style: 'parchment',
      size: 10,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 0.8
    });
    ctx.restore();

    this.registerButton('dock_guide_btn', gx, gy, 44, 40, () => {
      this.showGuideModal = true;
      platform.playSfx('sfx_click');
    });

    // -----------------------------------------------------------------
    // [B] 下层指挥官战术法术栏（自然甘霖 [Q]、雷霆震爆 [W]、大地丰收 [E]、菇精卫 [R]）
    // -----------------------------------------------------------------
    const dockY = 444;

    // 绘制木纹古铜底盘
    ctx.save();
    roundRectPath(ctx, dockX - 6, dockY - 14, totalW + 12, btnSize + 28, 14);
    ctx.fillStyle = 'rgba(24, 16, 9, 0.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    drawArtText(ctx, '战术法术', dockX + totalW * 0.5, dockY - 6, {
      style: 'gold',
      size: 10,
      align: 'center',
      baseline: 'middle',
      strokeWidth: 1.0
    });
    ctx.restore();

    for (let i = 0; i < spellList.length; i++) {
      const item = spellList[i];
      let sp = scene.spells[item.id];
      if (item.id === 'rally') {
        const cd = scene.sporelingPatrol ? scene.sporelingPatrol.repositionCooldown : 0;
        sp = { timer: cd, maxCooldown: 2.0, cost: 0 };
      }
      if (!sp) continue;

      const bx = dockX + i * (btnSize + gap);
      const by = dockY + 4;
      const hovered = this.isPointHovered(bx, by, btnSize, btnSize);
      const isCasting = scene.activeSpellCasting === item.id;
      const onCd = sp.timer > 0;
      const affordable = sp.cost === 0 || scene.economy.canAfford(sp.cost);
      const disabled = onCd || !affordable;

      ctx.save();
      // 技能勋章底部柔和投影
      roundRectPath(ctx, bx + 1, by + 3, btnSize - 2, btnSize, 26);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fill();

      // 处于瞄准激活状态时的华丽金色光环
      if (isCasting) {
        ctx.save();
        const pulse = 1 + Math.sin(this.uiAnimTime * 8) * 0.08;
        ctx.translate(bx + btnSize * 0.5, by + btnSize * 0.5);
        ctx.scale(pulse, pulse);
        ctx.beginPath();
        ctx.arc(0, 0, btnSize * 0.5 + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // 绘制 AI 原生圆形技能勋章
      if (item.id === 'rally') {
        const sImg = platform.getImage('assets/vfx/relic_shield.png');
        if (sImg && sImg.width) {
          ctx.drawImage(sImg, bx + 8, by + 8, btnSize - 16, btnSize - 16);
        } else {
          drawSpellIcon(ctx, 'rain', bx + 2, by + 2, btnSize - 4);
        }
      } else {
        drawSpellIcon(ctx, item.id, bx + 2, by + 2, btnSize - 4);
      }

      // 古铜外环金属框
      ctx.beginPath();
      ctx.arc(bx + btnSize * 0.5, by + btnSize * 0.5, (btnSize - 4) * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = hovered && !disabled ? THEME.BRONZE_BRIGHT : THEME.BRONZE_MID;
      ctx.lineWidth = hovered && !disabled ? 2.5 : 1.8;
      ctx.stroke();

      // 技能冷却遮罩扇面
      if (onCd) {
        const ratio = sp.timer / sp.cd;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bx + btnSize * 0.5, by + btnSize * 0.5);
        ctx.arc(
          bx + btnSize * 0.5,
          by + btnSize * 0.5,
          (btnSize - 4) * 0.5,
          -Math.PI * 0.5,
          -Math.PI * 0.5 + Math.PI * 2 * ratio,
          false
        );
        ctx.closePath();
        ctx.fillStyle = 'rgba(10, 16, 12, 0.72)';
        ctx.fill();
        ctx.restore();

        drawArtText(ctx, `${Math.ceil(sp.timer)}s`, bx + btnSize * 0.5, by + btnSize * 0.5, {
          style: 'parchment',
          size: 14,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 2.0
        });
      } else if (!affordable) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx + btnSize * 0.5, by + btnSize * 0.5, (btnSize - 4) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 10, 10, 0.45)';
        ctx.fill();
        ctx.restore();
      }

      // 左上角快捷键徽章 [Q] [W] [E]
      roundRectPath(ctx, bx - 2, by - 4, 18, 16, 4);
      ctx.fillStyle = isCasting ? '#D49B3B' : '#3E2919';
      ctx.fill();
      ctx.strokeStyle = THEME.BRONZE_MID;
      ctx.lineWidth = 1;
      ctx.stroke();
      drawArtText(ctx, item.hotkey, bx + 7, by + 4, {
        style: 'parchment',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 底部消耗价格/免费微标签
      roundRectPath(ctx, bx + 2, by + btnSize - 6, btnSize - 4, 15, 7);
      ctx.fillStyle = 'rgba(16, 24, 14, 0.88)';
      ctx.fill();
      ctx.strokeStyle = sp.cost === 0 ? THEME.ENAMEL_GREEN : THEME.BRONZE_MID;
      ctx.lineWidth = 1;
      ctx.stroke();

      const costText = sp.cost === 0 ? '免费' : `${sp.cost}`;
      if (sp.cost > 0) {
        drawUiIcon(ctx, 16, 'spore', bx + 6, by + btnSize - 5, 12);
        drawArtText(ctx, costText, bx + 28, by + btnSize + 1, {
          style: affordable ? 'gold' : 'crimson',
          size: 10,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 1.0
        });
      } else {
        drawArtText(ctx, costText, bx + btnSize * 0.5, by + btnSize + 1, {
          style: 'emerald',
          size: 10,
          align: 'center',
          baseline: 'middle',
          strokeWidth: 1.0
        });
      }

      ctx.restore();

      this.registerButton('spell_' + item.id, bx, by, btnSize, btnSize, () => {
        if (item.id === 'rally') {
          scene.activeRallyTargeting = !scene.activeRallyTargeting;
          scene.activeSpellCasting = null;
          platform.playSfx('sfx_click');
        } else {
          scene.activeRallyTargeting = false;
          scene.triggerSpell(item.id);
        }
      });
    }
  }

  /**
   * 绘制法术施法瞄准光圈
   */
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
    const cardW = 80;
    const cardH = 96;
    const gap = 8;
    const totalW = TOWER_ORDER.length * cardW + (TOWER_ORDER.length - 1) * gap; // 5 * 80 + 32 = 432
    const startX = 280; // Leaves 14..260 clean for spell dock, perfectly placed
    const baseY = 432;

    // 底部木质托盘底座
    ctx.save();
    roundRectPath(ctx, startX - 12, baseY + 58, totalW + 24, 46, 14);
    ctx.fillStyle = 'rgba(26, 17, 10, 0.82)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(198, 143, 69, 0.70)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    const roleShort = {
      watch: '防空远程',
      mist: '范围减速',
      thorn: '破甲割裂',
      burst: '高爆重炮',
      lumina: '神圣丰收'
    };

    for (let i = 0; i < TOWER_ORDER.length; i++) {
      const tId = TOWER_ORDER[i];
      const def = TOWERS[tId];
      const cost = def.nodes.base.cost;
      const isSelected = scene.selectedBuildTowerId === tId;
      const affordable = scene.economy.canAfford(cost);
      const cx = startX + i * (cardW + gap);
      const hovered = this.isPointHovered(cx, baseY - 6, cardW, cardH + 6);
      const liftY = isSelected ? -7 : (hovered ? -3 : 0);
      const cy = baseY + liftY;

      ctx.save();
      // 卡片阴影
      roundRectPath(ctx, cx + 2, cy + 4, cardW - 4, cardH - 2, 8);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      ctx.fill();

      // 选中发光外框
      if (isSelected) {
        roundRectPath(ctx, cx - 2, cy - 2, cardW + 4, cardH + 4, 10);
        ctx.strokeStyle = '#FFE58F';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.fillStyle = '#FFE58F';
        ctx.beginPath();
        ctx.moveTo(cx + cardW * 0.5, cy - 3);
        ctx.lineTo(cx + cardW * 0.5 - 5, cy - 10);
        ctx.lineTo(cx + cardW * 0.5 + 5, cy - 10);
        ctx.closePath();
        ctx.fill();
      }

      // 绘制 AI 羊皮纸木框底板
      this.drawAiFrame(ctx, 'tower_card', cx, cy, cardW, cardH, affordable ? 1.0 : 0.65);

      // 1) 左上角快捷键角标 [1..4]
      roundRectPath(ctx, cx + 6, cy + 5, 18, 16, 4);
      ctx.fillStyle = isSelected ? '#D49B3B' : '#3D2817';
      ctx.fill();
      drawArtText(ctx, String(i + 1), cx + 15, cy + 13, {
        style: 'parchment',
        size: 11,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 2) 右上角职能微章（小胶囊底色提高可读性）
      roundRectPath(ctx, cx + cardW - 54, cy + 5, 48, 16, 4);
      ctx.fillStyle = 'rgba(26, 17, 10, 0.45)';
      ctx.fill();
      drawArtText(ctx, roleShort[tId] || '', cx + cardW - 30, cy + 13, {
        style: 'parchment',
        size: 10,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });

      // 3) 羊皮纸视窗中央：高清 AI 蘑菇防御塔立绘 (42x42 悬浮居中)
      const luminaCardImg = platform.getImage('assets/ui/cards/card_lumina.png');
      if (tId === 'lumina' && luminaCardImg && luminaCardImg.width) {
        ctx.drawImage(luminaCardImg, cx + Math.floor((cardW - 44) * 0.5), cy + 18, 44, 44);
      } else {
        drawUiIcon(ctx, 24, tId, cx + Math.floor((cardW - 42) * 0.5), cy + 20, 42);
      }

      // 4) 羊皮纸底部防御塔中文名（金色/羊皮纸清晰立体字）
      drawArtText(ctx, i18n.t(def.nameKey), cx + cardW * 0.5, cy + 64, {
        style: 'gold',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.6
      });

      // 5) 底部森林绿珐琅价格铭牌：孢子图标 + 建造成本
      drawUiIcon(ctx, 16, 'spore', cx + 22, cy + 78, 18);
      drawArtText(ctx, String(cost), cx + 48, cy + 87, {
        style: affordable ? 'gold' : 'crimson',
        size: 14,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 1.8
      });

      // 6) 金币不足或冷却遮罩反馈
      if (!affordable) {
        roundRectPath(ctx, cx + 3, cy + 3, cardW - 6, cardH - 6, 8);
        ctx.fillStyle = 'rgba(14, 18, 22, 0.28)';
        ctx.fill();
      }
      const cd = this.cardCooldowns[tId] || 0;
      if (cd > 0) {
        const ratio = Math.min(1, cd / 0.45);
        roundRectPath(ctx, cx + 4, cy + 4, cardW - 8, (cardH - 8) * ratio, 6);
        ctx.fillStyle = 'rgba(10, 16, 12, 0.52)';
        ctx.fill();
      }
      ctx.restore();

      this.registerButton('slot_' + tId, cx, cy, cardW, cardH, () => {
        platform.playSfx('sfx_click');
        scene.selectBuildTowerType(tId);
        this.inspectorOpen = true;
      }, { towerId: tId });
    }

    // PvZ 战术小铲/移植按钮 [T]
    const shovelX = startX + totalW + 8;
    const shovelY = baseY + 46;
    const isShovelActive = scene.shovelActive;
    ctx.save();
    roundRectPath(ctx, shovelX, shovelY, 46, 46, 10);
    ctx.fillStyle = isShovelActive ? 'rgba(180, 40, 20, 0.95)' : 'rgba(38, 25, 14, 0.88)';
    ctx.fill();
    ctx.strokeStyle = isShovelActive ? '#FF7875' : 'rgba(198, 143, 69, 0.70)';
    ctx.lineWidth = isShovelActive ? 2.5 : 1.5;
    ctx.stroke();

    ctx.fillStyle = isShovelActive ? '#FFF1F0' : '#EBDAB2';
    ctx.font = `bold 16px ${UI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('铲', shovelX + 23, shovelY + 18);
    ctx.fillStyle = '#FFD591';
    ctx.font = `bold 10px ${UI_FONT}`;
    ctx.fillText('[T]', shovelX + 23, shovelY + 34);
    ctx.restore();

    this.registerButton('btn_shovel', shovelX, shovelY, 46, 46, () => {
      scene.toggleShovel();
    });
  }

  /**
   * 3.4 动态弹出式：防御塔选中与升级羊皮纸木框面板（Bloons TD 6 × Kingdom Rush 风格）
   * 贴靠在选中地块左/右侧空白处，绝不遮挡选中防御塔本身或顶部/底部栏
   */
  renderTowerInspectorPopup(ctx, scene) {
    const col = scene.selectedTile.col;
    const row = scene.selectedTile.row;
    if (!scene.map || !scene.map.inBounds(col, row)) {
      this.inspectorRect = null;
      return;
    }

    const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 120, OFFSET_Y: 0, SCALE: 1.125 };
    const tileScreenX = mv.OFFSET_X + (col + 0.5) * TILE_SIZE * mv.SCALE;
    const tileScreenY = mv.OFFSET_Y + (row + 0.5) * TILE_SIZE * mv.SCALE;

    const existingTower = scene.towerManager.getTowerAt(col, row);
    const canBuild = scene.map.canBuildAt(col, row);
    if (!existingTower && !canBuild) {
      this.inspectorRect = null;
      return;
    }

    const pw = 328;
    const ph = existingTower ? 264 : 224;
    // 智能停靠：停靠在屏幕边缘，确保地面的 360 度攻击范围完整无遮挡展示
    let px = tileScreenX < 480
      ? Math.max(Math.round(tileScreenX + (existingTower ? existingTower.node.range * TILE_SIZE * 1.05 : 90)), 960 - pw - 20)
      : Math.min(Math.round(tileScreenX - (existingTower ? existingTower.node.range * TILE_SIZE * 1.05 : 90) - pw), 20);
    px = Math.max(16, Math.min(960 - pw - 16, px));
    let py = Math.round(tileScreenY - ph * 0.5);
    py = Math.max(66, Math.min(418 - ph, py));

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
      this.inspectorOpen = false;
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
    ctx.fillText(fullName, x + 76, y + 40);

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
    let dmgLabel = '伤害';
    let dmgIcon = 'atk';
    if (tower.typeId === 'lumina') {
      dmgVal = `+${node.sporeGen || 8}/次`;
      dmgLabel = '产孢';
      dmgIcon = 'spore';
    } else if (tower.typeId === 'mist') {
      dmgVal = `${node.dps}/秒`;
      dmgLabel = '雾伤';
      dmgIcon = 'atk';
    }
    const statItems = [
      { cat: 24, icon: 'atk', label: '攻击', val: dmgVal },
      { cat: 24, icon: 'aspd', label: '间隔', val: `${node.interval}s` },
      { cat: 16, icon: 'target', label: '射程', val: `${node.range}格` }
    ];
    for (let i = 0; i < 3; i++) {
      const st = statItems[i];
      const sx = x + 26 + i * (pillW + pillGap);
      ctx.save();
      roundRectPath(ctx, sx, statsY, pillW, 30, 8);
      ctx.fillStyle = 'rgba(84, 56, 32, 0.10)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 94, 42, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawUiIcon(ctx, st.cat, st.icon, sx + 5, statsY + 5, 20);
      ctx.fillStyle = '#855F38';
      ctx.font = `10px ${UI_FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.label, sx + 27, statsY + 10);

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 12px ${UI_FONT}`;
      ctx.fillText(st.val, sx + 27, statsY + 21);
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

    // 4. 底部动作栏：索敌切换按钮（142px）+ 出售按钮（126px），间距 8px，完美铺满 276px，y+202
    const prioKey = 'prio_' + tower.priority;
    const canCyclePrio = (def.priorities && def.priorities.length > 1);
    this.drawPixelButton(
      ctx,
      'btn_tower_prio',
      bx,
      y + 202,
      142,
      34,
      `索敌: ${i18n.t(prioKey)}`,
      {
        skin: 'btn_blue',
        disabled: !canCyclePrio,
        align: 'left',
        font: `bold 12px ${UI_FONT}`,
        iconKey: 'target',
        iconSize: 16
      },
      () => {
        scene.towerManager.cyclePriority(tower);
      }
    );

    const refund = scene.economy.calculateSellRefund(tower.totalInvested);
    this.drawPixelButton(
      ctx,
      'btn_tower_sell',
      bx + 150,
      y + 202,
      126,
      34,
      `出售 +${refund}`,
      {
        skin: 'btn_red',
        align: 'left',
        font: `bold 12px ${UI_FONT}`,
        iconKey: 'sell',
        iconSize: 16
      },
      () => {
        scene.sellSelectedTower();
        this.inspectorOpen = false;
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
    ctx.fillText(isMoss ? `◆ 黄金苔藓格 · 覆盖道路 ${cov.coveredTiles} 格` : `草地建造位 · 覆盖道路 ${cov.coveredTiles} 格`, x + 76, y + 56);

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
    ctx.fillStyle = 'rgba(10, 16, 12, 0.72)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 350;
    const mh = 300;
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 16, true);

    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 22px ${CN_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(i18n.t('state_paused'), mx + mw * 0.5, my + 44);

    const bx = mx + 55;
    const bw = mw - 110;

    this.drawPixelButton(ctx, 'pause_resume', bx, my + 76, bw, 42, i18n.t('btn_resume'), {
      skin: 'btn_green',
      iconKey: 'play'
    }, () => {
      platform.playSfx('sfx_click');
      scene.resumeGame();
    });

    this.drawPixelButton(ctx, 'pause_restart', bx, my + 128, bw, 42, i18n.t('btn_restart'), {
      skin: 'btn_wood'
    }, () => {
      platform.playSfx('sfx_click');
      scene.restartLevel();
    });

    this.drawPixelButton(ctx, 'pause_settings', bx, my + 180, bw, 42, i18n.t('btn_settings'), {
      skin: 'btn_wood',
      iconKey: 'settings'
    }, () => {
      platform.playSfx('sfx_click');
      this.showSettingsModal = true;
    });

    this.drawPixelButton(ctx, 'pause_exit', bx, my + 232, bw, 42, i18n.t('btn_exit_title'), {
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
    const mh = isEndless ? 340 : (isWin ? 370 : 330);
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, (isWin || isEndless) ? THEME.BRONZE_BRIGHT : THEME.CRIMSON_SELL, 0.98, 16, true);

    ctx.save();
    ctx.textAlign = 'center';
    if (isEndless) {
      drawArtText(ctx, '🔥 无尽深渊试炼报告', mx + mw * 0.5, my + 38, {
        style: 'crimson',
        size: 24,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.5
      });

      const currentWave = scene.waveManager ? scene.waveManager.currentWaveIndex : 1;
      drawArtText(ctx, `本次坚持至：第 ${currentWave} 波`, mx + mw * 0.5, my + 84, {
        style: 'gold',
        size: 18,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.2
      });
      drawArtText(ctx, `历史最高纪录：第 ${Math.max(currentWave, bestEndless)} 波`, mx + mw * 0.5, my + 118, {
        style: 'emerald',
        size: 16,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 1.0
      });
      drawArtText(ctx, '深渊虫群无休止涌现，林地英魂永垂不朽！', mx + mw * 0.5, my + 152, {
        style: 'parchment',
        size: 13,
        align: 'center',
        baseline: 'middle',
        strokeWidth: 0.8
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
      ctx.font = `bold 26px ${CN_FONT}`;
      ctx.fillText(isWin ? i18n.t('state_victory') : i18n.t('state_defeat'), mx + mw * 0.5, my + 44);

      for (let s = 0; s < 3; s++) {
        const sKey = s < stars ? 'star_full' : 'star_empty';
        drawUiIcon(ctx, 16, sKey, mx + 156 + s * 46, my + 72, 36);
      }

      ctx.fillStyle = THEME.INK_DARK;
      ctx.font = `bold 15px ${CN_FONT}`;
      const timeSec = Math.round(scene.settlementResult.clearTimeSec * 10) / 10;
      ctx.fillText(i18n.t('best_time') + ': ' + timeSec + 's', mx + mw * 0.5, my + 134);
      ctx.fillText(i18n.t('seeds_label') + ': ' + scene.settlementResult.remainingSeeds + ' / 20', mx + mw * 0.5, my + 160);

      const bx = mx + 65;
      const bw = mw - 130;

      if (isWin) {
        let curBtnY = my + 188;
        if (scene.hasNextMap()) {
          this.drawPixelButton(ctx, 'settle_next', bx, curBtnY, bw, 38, i18n.t('btn_next_map'), {
            skin: 'btn_green',
            iconKey: 'play'
          }, () => {
            platform.playSfx('sfx_click');
            scene.startNextMap();
          });
          curBtnY += 46;
        }

        // 无尽深渊挑战入口按钮
        this.drawPixelButton(ctx, 'settle_start_endless', bx, curBtnY, bw, 38, '🔥 挑战无尽深渊', {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.startEndlessMode();
        });
        curBtnY += 46;

        this.drawPixelButton(ctx, 'settle_levels', bx, curBtnY, bw, 38, i18n.t('btn_level_select'), {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.enterLevelSelect();
        });
      } else {
        this.drawPixelButton(ctx, 'settle_restart', bx, my + 196, bw, 42, i18n.t('btn_restart'), {
          skin: 'btn_green'
        }, () => {
          platform.playSfx('sfx_click');
          scene.restartLevel();
        });

        this.drawPixelButton(ctx, 'settle_levels', bx, my + 248, bw, 42, i18n.t('btn_level_select'), {
          skin: 'btn_wood'
        }, () => {
          platform.playSfx('sfx_click');
          scene.enterLevelSelect();
        });
      }
    }
    ctx.restore();
  }

  renderSettingsModal(ctx) {
    ctx.fillStyle = 'rgba(10, 16, 12, 0.76)';
    ctx.fillRect(0, 0, 960, 540);

    const mw = 370;
    const mh = 290;
    const mx = (960 - mw) * 0.5;
    const my = (540 - mh) * 0.5;

    this.drawWoodlandPanel(ctx, mx, my, mw, mh, THEME.BRONZE_MID, 0.98, 16, true);

    ctx.fillStyle = THEME.INK_DARK;
    ctx.font = `bold 20px ${CN_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(i18n.t('settings_title'), mx + mw * 0.5, my + 42);

    const audioCfg = platform.getAudioConfig();
    const bx = mx + 45;
    const bw = mw - 90;

    this.drawPixelButton(
      ctx,
      'set_sfx',
      bx,
      my + 72,
      bw,
      40,
      i18n.t('settings_sfx') + ': ' + (audioCfg.sfx ? i18n.t('on') : i18n.t('off')),
      { skin: 'btn_wood', iconKey: audioCfg.sfx ? 'sfx_on' : 'sfx_off' },
      () => {
        const next = !audioCfg.sfx;
        platform.setAudioConfig({ sfx: next });
        storage.updateSettings({ sfx: next });
        platform.playSfx('sfx_click');
      }
    );

    this.drawPixelButton(
      ctx,
      'set_bgm',
      bx,
      my + 124,
      bw,
      40,
      i18n.t('settings_bgm') + ': ' + (audioCfg.bgm ? i18n.t('on') : i18n.t('off')),
      { skin: 'btn_wood', iconKey: audioCfg.bgm ? 'bgm_on' : 'bgm_off' },
      () => {
        const next = !audioCfg.bgm;
        platform.setAudioConfig({ bgm: next });
        storage.updateSettings({ bgm: next });
        platform.playSfx('sfx_click');
      }
    );

    this.drawPixelButton(
      ctx,
      'set_lang',
      bx,
      my + 176,
      bw,
      40,
      i18n.t('settings_lang') + ': ' + (i18n.getLang() === 'zh' ? i18n.t('lang_zh') : i18n.t('lang_en')),
      { skin: 'btn_wood' },
      () => {
        const nextLang = i18n.toggleLang();
        storage.updateSettings({ lang: nextLang });
        platform.playSfx('sfx_click');
      }
    );

    this.drawPixelButton(ctx, 'set_close', bx, my + 228, bw, 40, i18n.t('btn_back'), {
      skin: 'btn_green'
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
   * 3. 📜 领袖战术心得 (深度对标《王国保卫战》《植物大战僵尸》核心微操与无尽深渊法则)
   */
  /**
   * 【林地秘典 · 全景手绘图鉴与战术殿堂】 (Grand Codex & Bestiary)
   * 采用 AAA 级古典羊皮纸与古铜精雕画框材质，100% 修复属性获取与文字换行崩溃异常，
   * 包含三大核心篇章：
   * 1. 🌲 守林神树卫士 (5大防御塔详细数据、双分支三阶终极进阶形态、灵能觉醒超载全屏大招)
   * 2. 🐛 暗黑虫潮首领 (16大怪物种群全部同屏直选展示、生态威胁、针对弱点与克制战法)
   * 3. 📜 领袖战术心得 (英雄肉搏要义、能量豆超频时机、战场即时撕网破茧、踩踏掘地怪、自爆泄气)
   */
  renderGuideModal(ctx) {
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
      { id: 0, label: '🌲 守林神树卫士 (5/5)' },
      { id: 1, label: '🐛 暗黑虫潮首领 (16/16)' },
      { id: 2, label: '📜 领袖战术心得' }
    ];
    const tabY = my + 40;
    const tabW = 230;
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
    const bodyH = mh - 130;

    if (this.codexTab === 0) {
      this.renderCodexGuardiansTab(ctx, mx + 16, bodyY, mw - 32, bodyH);
    } else if (this.codexTab === 1) {
      this.renderCodexBestiaryTab(ctx, mx + 16, bodyY, mw - 32, bodyH);
    } else {
      this.renderCodexTacticsTab(ctx, mx + 16, bodyY, mw - 32, bodyH);
    }

    // 4. 底部右下角核心主交互按钮：进入林地·开启保卫战
    const playBtnW = 220;
    const playBtnH = 38;
    const playBtnX = mx + mw - playBtnW - 20;
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

    // 底部左下角提示文案
    drawArtText(ctx, '提示：点击任意空白区域或右上角 [×] 即可随时关闭秘典继续游玩', mx + 24, playBtnY + playBtnH * 0.5, {
      style: 'parchment',
      size: 11,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0.6
    });

    ctx.restore();
  }

  /**
   * 篇章 1：守林神树卫士图鉴（修复属性获取与换行异常，提高美术排版质感）
   */
  renderCodexGuardiansTab(ctx, x, y, w, h) {
    const towers = [
      { id: 'watch', name: '瞭望菇', role: '防空远程', cost: 100, desc: '射程覆盖广，精准破甲点杀空中飞蛾与高速突袭怪。' },
      { id: 'mist', name: '雾菇', role: '范围减速', cost: 125, desc: '释放大范围孢子迷雾，极寒减速并融毁敌军坚硬护甲。' },
      { id: 'thorn', name: '尖刺菇', role: '破甲割裂', cost: 110, desc: '刺穿地面造成连续破甲割裂与巨额流血创伤。' },
      { id: 'burst', name: '爆裂菇', role: '高爆重炮', cost: 135, desc: '发射熔岩高爆弹丸，巨额AOE溅射击退密集聚拢虫潮。' },
      { id: 'lumina', name: '灵光菇', role: '神圣丰收', cost: 75, desc: '持续生产黄金孢子与祝福晨露，维系全线防守经济命脉。' }
    ];

    const curTowerId = this.codexSelectedTower || 'watch';
    const curDef = TOWERS[curTowerId] || TOWERS.watch;
    const leftW = 205;

    // 左侧：5 大蘑菇精致木牌卡片
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      const cy = y + i * 68;
      const isSel = t.id === curTowerId;

      ctx.save();
      roundRectPath(ctx, x, cy, leftW, 62, 10);
      ctx.fillStyle = isSel ? 'rgba(84, 52, 28, 0.98)' : 'rgba(32, 20, 12, 0.72)';
      ctx.fill();
      ctx.strokeStyle = isSel ? '#FFD700' : 'rgba(196, 143, 69, 0.45)';
      ctx.lineWidth = isSel ? 2.2 : 1.2;
      ctx.stroke();

      // 防御塔动画模型
      const demoFrame = Math.floor(this.uiAnimTime * 4) % 4;
      drawTowerSprite(ctx, t.id, 'lv1', 'idle', demoFrame, x + 30, cy + 31);

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
    drawTowerSprite(ctx, curTowerId, 'a3', 'idle', topFrame, rx + 44, y + 40);

    drawArtText(ctx, `${tItem.name} · ${tItem.role}`, rx + 92, y + 24, {
      style: 'ink',
      size: 18,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, tItem.desc, rx + 92, y + 42, rw - 110, 18, '#4A3319', `12px ${CN_FONT}`);

    // 属性横向数值条 (修复射程像素计算)
    const statsY = y + 74;
    const baseNode = curDef.nodes.base || {};
    const statsList = [
      { k: '伤害', v: baseNode.damage || 0 },
      { k: '射程', v: `${baseNode.range || 0} 格 (${Math.round((baseNode.range || 0) * 32)}px)` },
      { k: '攻速', v: `${(1 / (baseNode.interval || 1)).toFixed(1)} 次/秒` },
      { k: '类型', v: baseNode.damageType === 'pierce' ? '穿透' : (baseNode.damageType === 'magic' ? '魔法' : '物理') }
    ];
    for (let si = 0; si < statsList.length; si++) {
      const st = statsList[si];
      const sx = rx + 16 + si * 130;
      roundRectPath(ctx, sx, statsY, 122, 26, 6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.fill();
      ctx.strokeStyle = '#C4A675';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawArtText(ctx, `${st.k}: ${st.v}`, sx + 61, statsY + 13, {
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
    roundRectPath(ctx, rx + 16, branchY, 254, 82, 8);
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
    this.drawWrappedText(ctx, aDesc, rx + 26, branchY + 32, 234, 18, '#1F3A52', `11px ${CN_FONT}`);

    // 分支 B 卡片 (典雅琥珀金古铜镶边)
    roundRectPath(ctx, rx + 280, branchY, 254, 82, 8);
    ctx.fillStyle = 'rgba(255, 248, 235, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#FFC069';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    drawArtText(ctx, `【分支B】${bName}`, rx + 290, branchY + 16, {
      style: 'ink',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, bDesc, rx + 290, branchY + 32, 234, 18, '#593815', `11px ${CN_FONT}`);

    // 【灵能超载全屏觉醒大招】皇室紫金神圣展台
    const ultY = y + 202;
    roundRectPath(ctx, rx + 16, ultY, rw - 32, 134, 12);
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
      { id: 'beetle', name: '甲壳幼虫', danger: '★☆☆☆☆', hp: 35, speed: '中速', armor: '无', tag: '前锋兵' },
      { id: 'swift', name: '疾风甲虫', danger: '★★☆☆☆', hp: 28, speed: '极速', armor: '轻甲', tag: '突击兵' },
      { id: 'armored', name: '重甲巨甲虫', danger: '★★★☆☆', hp: 120, speed: '龟速', armor: '高硬甲', tag: '装甲先锋' },
      { id: 'moth', name: '荧光飞蛾', danger: '★★★☆☆', hp: 45, speed: '快速', armor: '无', tag: '浮空飞行' },
      { id: 'splitter', name: '裂殖母虫', danger: '★★★☆☆', hp: 90, speed: '中速', armor: '中甲', tag: '亡语分裂' },
      { id: 'larva', name: '分裂幼虫', danger: '★★☆☆☆', hp: 18, speed: '极速', armor: '无', tag: '虫海群攻' },
      { id: 'burrower', name: '掘地潜行者', danger: '★★★★☆', hp: 80, speed: '快速', armor: '地底免伤', tag: '潜地特种' },
      { id: 'volatile_pod', name: '自爆恶蝉', danger: '★★★★☆', hp: 70, speed: '快速', armor: '轻甲', tag: '蓄力自爆' },
      { id: 'weaver', name: '纺织毒蛛', danger: '★★★★☆', hp: 110, speed: '中速', armor: '中甲', tag: '吐网封塔' },
      { id: 'leaper', name: '跃迁跳蚤', danger: '★★★★☆', hp: 75, speed: '跳跃', armor: '轻甲', tag: '越线偷袭' },
      { id: 'shaman', name: '巫毒蝉俑', danger: '★★★★☆', hp: 130, speed: '缓慢', armor: '高抗性', tag: '群体治疗' },
      { id: 'skeletal_husk', name: '枯骨巨蝎', danger: '★★★★☆', hp: 160, speed: '缓慢', armor: '坚韧骨盾', tag: '正面减伤' },
      { id: 'siege_beetle', name: '攻城巨角兽', danger: '★★★★★', hp: 280, speed: '极慢', armor: '重型装甲', tag: '践踏震晕' },
      { id: 'boss_m1', name: '巨角天牛王', danger: '★★★★★', hp: 450, speed: '冲锋', armor: '首领护甲', tag: '第一关首领' },
      { id: 'boss_m2', name: '剧毒飞蛾后', danger: '★★★★★', hp: 600, speed: '盘旋', armor: '毒瘴屏障', tag: '第二关首领' },
      { id: 'boss_m3', name: '万虫巢母', danger: '★★★★★★', hp: 950, speed: '狂暴', armor: '繁衍神甲', tag: '深渊终极首领' }
    ];

    const curEnemyId = this.codexSelectedEnemy || 'beetle';
    const leftW = 230; // 双列展示 16 只怪物

    // 左侧双列 2x8 布局：直接容纳 16 只怪物，无需翻页
    const colW = 112;
    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      const ci = i % 2;
      const ri = Math.floor(i / 2);
      const ex = x + ci * (colW + 6);
      const ey = y + ri * 42;
      const isSel = e.id === curEnemyId;

      ctx.save();
      roundRectPath(ctx, ex, ey, colW, 38, 6);
      ctx.fillStyle = isSel ? 'rgba(96, 32, 28, 0.98)' : 'rgba(32, 18, 12, 0.72)';
      ctx.fill();
      ctx.strokeStyle = isSel ? '#FF7875' : 'rgba(196, 143, 69, 0.45)';
      ctx.lineWidth = isSel ? 2.0 : 1.0;
      ctx.stroke();

      drawArtText(ctx, e.name, ex + 6, ey + 19, {
        style: isSel ? 'gold' : 'parchment',
        size: 11,
        align: 'left',
        baseline: 'middle',
        strokeWidth: 0.6
      });
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

    // 怪物立绘与名称
    const enemyImg = platform.getImage(`assets/enemies/enemy_${curEnemyId}.png`) || platform.getImage(`assets/enemies/boss_${curEnemyId}.png`);
    if (enemyImg && enemyImg.width) {
      ctx.drawImage(enemyImg, rx + 20, y + 16, 64, 64);
    } else {
      drawEnemySprite(ctx, curEnemyId, 'walk', 0, rx + 52, y + 48);
    }

    drawArtText(ctx, `${eItem.name} 【${eItem.tag}】`, rx + 98, y + 28, {
      style: 'ink',
      size: 18,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    drawArtText(ctx, `威胁星级：${eItem.danger} | 移速：${eItem.speed} | 基础生命：${eItem.hp} | 护甲：${eItem.armor}`, rx + 98, y + 54, {
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
        counter: '【战法】雾菇范围减速是其绝对克星！将其减速至蜗牛爬行后，由后排防御塔轻松收割。'
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
        counter: '【战法】预先在其行进后方部署尖刺菇或爆裂菇，在其爆裂瞬间立即AOE秒杀幼虫。'
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
        counter: '【战法】派遣森林英雄在前线肉搏拉住仇恨，后排全员开启灵能觉醒超载秒杀！'
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
      style: 'crimson',
      size: 13,
      align: 'left',
      baseline: 'middle',
      strokeWidth: 0
    });
    this.drawWrappedText(ctx, counterTactics.behavior, rx + 26, behY + 36, rw - 52, 20, '#431418', `12px ${CN_FONT}`);

    // 克制弱点与领袖战术框
    const couY = y + 192;
    roundRectPath(ctx, rx + 16, couY, rw - 32, 142, 10);
    ctx.fillStyle = 'rgba(246, 255, 237, 0.90)';
    ctx.fill();
    ctx.strokeStyle = '#B7EB8F';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawArtText(ctx, '【针对弱点与领袖克制战术】', rx + 26, couY + 20, {
      style: 'emerald',
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
        title: '一、英雄调遣与肉搏接怪法则',
        body: '对标《王国保卫战》：森林领袖·奥克拥有全图自由集结能力。点击英雄头像或战场英雄本体，即可指挥其驻守任意要塞路口。英雄最多可肉搏拦截 2 只地面敌人！杀敌与承受伤害可提升英雄等级（Lv.1 ~ Lv.5），升级不仅大幅强化攻防血量，更会瞬间恢复满血！善用【F 裂地斩】在虫潮扎堆时打出全屏大范围群体眩晕！'
      },
      {
        title: '二、灵能觉醒超载与大招时刻',
        body: '对标《植物大战僵尸》能量豆：击败精英敌人或首领均有高概率掉落【灵能觉醒种子】。按下空格或点击灵能种子后，点击场上任意蘑菇，即可瞬间引爆华丽的全屏大招！瞭望菇万矢齐发全屏秒杀飞蛾、尖刺菇千刃破土定身全屏、爆裂菇天坠流星轰碎重甲、灵光菇万木逢春攻速狂暴！'
      },
      {
        title: '三、即时战场微操手册 (Tap-to-Action)',
        body: '1. 快速救塔：纺织毒蛛喷吐蛛网封印防御塔时，用手指三连点击被封印的蘑菇即可破茧救出，破茧后更附带狂暴攻速加成！\n2. 潜地踩踏：掘地潜行者潜地免伤时，点击地面土堆直接将其踩出硬控！\n3. 恶蝉泄气：自爆恶蝉蓄力变红时快速点击泄气，避免防御塔被毁！'
      },
      {
        title: '四、深渊生存与铲除移植优化',
        body: '通关战役后将解锁【无尽深渊试炼模式】！深渊虫潮将无止境增强，属性指数级提升。充分利用【铲子 [T]】功能随时铲除前期过渡蘑菇，无损回收孢子并根据后期怪群结构动态转型极寒减速与高爆重炮阵型，创造全网最高生存记录！'
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
}

module.exports = UiManager;
