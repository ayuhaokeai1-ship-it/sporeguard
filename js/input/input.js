/**
 * 统一输入管理器 (js/input/input.js)
 * 将触屏、鼠标、键盘、标准手柄统一转换为“动作 (Action)”队列
 * 游戏逻辑只消费动作，不关心底层物理设备
 */

const platform = require('../core/platform');
const CONFIG = require('../data/config');

const actionQueue = [];
let pointerPos = { x: 320, y: 240 };
let gridCursor = { col: 7, row: 6, active: false };

// 手柄按键与摇杆边沿检测状态
let prevGamepadButtons = [];
let stickCooldown = 0;

function emitAction(type, payload = {}) {
  if (typeof type === 'object' && type !== null) {
    payload = type;
    type = payload.type || 'unknown';
  }
  if (type === 'pointer_down' || type === 'confirm_tile') {
    platform.unlockAudio();
  }
  actionQueue.push(Object.assign({ type }, payload));
}

function clampGridCursor(col, row) {
  const maxCol = CONFIG.LAYOUT.MAP.COLS - 1;
  const maxRow = CONFIG.LAYOUT.MAP.ROWS - 1;
  gridCursor.col = Math.max(0, Math.min(maxCol, col));
  gridCursor.row = Math.max(0, Math.min(maxRow, row));
}

function initInput() {
  // 微信小游戏触屏与键盘事件（浏览器环境下由平台桥接层统一转发至 wx 接口）
  if (typeof wx !== 'undefined') {
    if (typeof wx.onTouchStart === 'function') {
      wx.onTouchStart((res) => {
        const touch = (res && res.changedTouches && res.changedTouches[0]) || (res && res.touches && res.touches[0]);
        if (!touch) return;
        const pos = platform.screenToLogical(touch.clientX, touch.clientY);
        pointerPos.x = pos.x;
        pointerPos.y = pos.y;
        updateCursorFromPointer(pos.x, pos.y);
        emitAction('pointer_down', { x: pos.x, y: pos.y });
      });
    }

    let lastMoveEmitted = 0;
    if (typeof wx.onTouchMove === 'function') {
      wx.onTouchMove((res) => {
        const touch = (res && res.changedTouches && res.changedTouches[0]) || (res && res.touches && res.touches[0]);
        if (!touch) return;
        const pos = platform.screenToLogical(touch.clientX, touch.clientY);
        pointerPos.x = pos.x;
        pointerPos.y = pos.y;
        updateCursorFromPointer(pos.x, pos.y);
        const now = platform.nowMs ? platform.nowMs() : Date.now();
        if (now - lastMoveEmitted >= 16) {
          lastMoveEmitted = now;
          emitAction('pointer_move', { x: pos.x, y: pos.y });
        }
      });
    }

    if (typeof wx.onTouchEnd === 'function') {
      wx.onTouchEnd((res) => {
        const touch = (res && res.changedTouches && res.changedTouches[0]) || (res && res.touches && res.touches[0]);
        const pos = touch ? platform.screenToLogical(touch.clientX, touch.clientY) : pointerPos;
        pointerPos.x = pos.x;
        pointerPos.y = pos.y;
        emitAction('pointer_up', { x: pos.x, y: pos.y });
      });
    }

    if (typeof wx.onKeyDown === 'function') {
      wx.onKeyDown((res) => {
        handleKeyDown(res.code || res.key || '');
      });
    }
  }
}

function screenToMapCoords(lx, ly) {
  const mv = CONFIG.LAYOUT.MAP_VIEW || { OFFSET_X: 160, OFFSET_Y: 30, SCALE: 1.0 };
  const sx = mv.SCALE_X || mv.SCALE || 1;
  const sy = mv.SCALE_Y || mv.SCALE || 1;
  return {
    mx: (lx - mv.OFFSET_X) / sx,
    my: (ly - mv.OFFSET_Y) / sy
  };
}

function updateCursorFromPointer(lx, ly) {
  const { mx, my } = screenToMapCoords(lx, ly);
  if (mx >= 0 && mx < CONFIG.LAYOUT.MAP.WIDTH && my >= 0 && my < CONFIG.LAYOUT.MAP.HEIGHT) {
    const col = Math.floor(mx / CONFIG.RESOLUTION.TILE_SIZE);
    const row = Math.floor(my / CONFIG.RESOLUTION.TILE_SIZE);
    clampGridCursor(col, row);
  }
}

function handleKeyDown(rawKey) {
  const key = String(rawKey).toLowerCase();
  platform.unlockAudio();

  if (key === 'arrowup' || key === 'keyw' || key === 'w') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row - 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'arrowdown' || key === 'keys' || key === 's') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row + 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'arrowleft' || key === 'keya' || key === 'a') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col - 1, gridCursor.row);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'arrowright' || key === 'keyd' || key === 'd') {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col + 1, gridCursor.row);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'digit1' || key === '1') {
    emitAction('select_tower_slot', { slot: 0 });
  } else if (key === 'digit2' || key === '2') {
    emitAction('select_tower_slot', { slot: 1 });
  } else if (key === 'digit3' || key === '3') {
    emitAction('select_tower_slot', { slot: 2 });
  } else if (key === 'digit4' || key === '4') {
    emitAction('select_tower_slot', { slot: 3 });
  } else if (key === 'digit5' || key === '5') {
    emitAction('select_tower_slot', { slot: 4 });
  } else if (key === 'enter') {
    emitAction('confirm_tile', { col: gridCursor.col, row: gridCursor.row });
  } else if (key === 'space' || key === ' ') {
    if (gridCursor.active) {
      emitAction('confirm_tile', { col: gridCursor.col, row: gridCursor.row });
    } else {
      emitAction('toggle_awakening');
    }
  } else if (key === 'keyg' || key === 'g') {
    emitAction('hero_battlecry');
  } else if (key === 'keyv' || key === 'v') {
    emitAction('hero_leyline');
  } else if (key === 'keyq' || key === 'q') {
    emitAction('trigger_spell', { spellId: 'rain' });
  } else if (key === 'keyw' || key === 'w') {
    emitAction('trigger_spell', { spellId: 'shock' });
  } else if (key === 'keye' || key === 'e') {
    emitAction('trigger_spell', { spellId: 'harvest' });
  } else if (key === 'keyu' || key === 'u' || key === 'keyj' || key === 'j') {
    emitAction('upgrade_branch', { branch: 'A' });
  } else if (key === 'keyi' || key === 'i' || key === 'keyk' || key === 'k') {
    emitAction('upgrade_branch', { branch: 'B' });
  } else if (key === 'keyx' || key === 'x' || key === 'delete' || key === 'backspace') {
    emitAction('sell_selected');
  } else if (key === 'tab' || key === 'keyp' || key === 'p') {
    emitAction('cycle_priority');
  } else if (key === 'keyc' || key === 'c') {
    emitAction('call_wave');
  } else if (key === 'keyr' || key === 'r') {
    emitAction('trigger_spell', { spellId: 'rally' });
  } else if (key === 'keyv' || key === 'v') {
    emitAction('cycle_speed');
  } else if (key === 'keyf' || key === 'f') {
    emitAction('hero_ultimate');
  } else if (key === 'keyz' || key === 'z') {
    emitAction('cycle_hero_stance');
  } else if (key === 'keym' || key === 'm') {
    emitAction('toggle_mastery');
  } else if (key === 'keyh' || key === 'h') {
    emitAction('toggle_zen_mode');
  } else if (key === 'escape') {
    emitAction('toggle_pause');
  }
}

/**
 * 每帧轮询标准手柄状态并转换为统一动作
 */
function pollGamepad(realDt) {
  if (stickCooldown > 0) {
    stickCooldown -= realDt;
  }

  const pads = platform.pollGamepadState();
  if (!pads || !pads.length) return;

  let pad = null;
  for (let i = 0; i < pads.length; i++) {
    if (pads[i] && pads[i].connected) {
      pad = pads[i];
      break;
    }
  }
  if (!pad) return;

  const buttons = pad.buttons || [];
  const isPressed = (idx) => Boolean(buttons[idx] && buttons[idx].pressed);
  const justPressed = (idx) => isPressed(idx) && !prevGamepadButtons[idx];

  // D-Pad (12: Up, 13: Down, 14: Left, 15: Right)
  if (justPressed(12)) {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row - 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  }
  if (justPressed(13)) {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col, gridCursor.row + 1);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  }
  if (justPressed(14)) {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col - 1, gridCursor.row);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  }
  if (justPressed(15)) {
    gridCursor.active = true;
    clampGridCursor(gridCursor.col + 1, gridCursor.row);
    emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
  }

  // 左摇杆移动格子光标
  const axes = pad.axes || [0, 0];
  if (stickCooldown <= 0) {
    const ax = axes[0] || 0;
    const ay = axes[1] || 0;
    if (Math.abs(ax) > 0.55 || Math.abs(ay) > 0.55) {
      gridCursor.active = true;
      const dCol = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 1 : -1) : 0;
      const dRow = Math.abs(ay) >= Math.abs(ax) ? (ay > 0 ? 1 : -1) : 0;
      clampGridCursor(gridCursor.col + dCol, gridCursor.row + dRow);
      emitAction('cursor_move', { col: gridCursor.col, row: gridCursor.row });
      stickCooldown = 0.16;
    }
  }

  // A(0): 确认建造/选中, B(1): 出售/返回, X(2): 升级/分支A, Y(3): 分支B/提前召唤
  if (justPressed(0)) {
    emitAction('confirm_tile', { col: gridCursor.col, row: gridCursor.row });
  }
  if (justPressed(1)) {
    emitAction('sell_selected');
  }
  if (justPressed(2)) {
    emitAction('upgrade_branch', { branch: 'A' });
  }
  if (justPressed(3)) {
    emitAction('upgrade_branch', { branch: 'B' });
  }
  // LB(4) / RB(5): 切换炮塔槽位
  if (justPressed(4)) {
    emitAction('cycle_tower_slot', { dir: -1 });
  }
  if (justPressed(5)) {
    emitAction('cycle_tower_slot', { dir: 1 });
  }
  // LT(6): 提前召唤下一波, RT(7): 切换倍速
  if (justPressed(6)) {
    emitAction('call_wave');
  }
  if (justPressed(7)) {
    emitAction('cycle_speed');
  }
  // Back/Select(8): 切换索敌优先级, Start(9): 暂停/恢复
  if (justPressed(8)) {
    emitAction('cycle_priority');
  }
  if (justPressed(9)) {
    emitAction('toggle_pause');
  }

  prevGamepadButtons = buttons.map((b) => Boolean(b && b.pressed));
}

function consumeActions() {
  if (actionQueue.length === 0) return [];
  return actionQueue.splice(0, actionQueue.length);
}

function getPointerPos() {
  return pointerPos;
}

function getGridCursor() {
  return gridCursor;
}

function setGridCursor(col, row, active = true) {
  clampGridCursor(col, row);
  gridCursor.active = active;
}

module.exports = {
  initInput,
  pollGamepad,
  consumeActions,
  emitAction,
  getPointerPos,
  getGridCursor,
  setGridCursor
};
