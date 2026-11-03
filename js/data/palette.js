/**
 * 全局调色板与色彩配置（严格 ≤32 色）
 * 集中管理所有美术与界面颜色，禁止在逻辑或渲染代码中硬编码色值
 */

const PALETTE = {
  // 地面（苔绿） 4色
  GROUND: ['#1F3B2C', '#2E5E3E', '#4E8A4F', '#8DBE5E'],
  GROUND_DARKEST: '#1F3B2C',
  GROUND_DARK: '#2E5E3E',
  GROUND_MID: '#4E8A4F',
  GROUND_LIGHT: '#8DBE5E',

  // 路径与泥土 3色
  PATH: ['#5A3E2B', '#8B6240', '#B88A5A'],
  PATH_DARK: '#5A3E2B',
  PATH_MID: '#8B6240',
  PATH_LIGHT: '#B88A5A',

  // 夜色与阴影 2色
  NIGHT_DEEP: '#14213D',
  NIGHT_BLUE: '#1F3A5F',

  // 菌盖与菌褶 3色
  MUSHROOM_CAP: '#C9785A',
  MUSHROOM_GILL: '#F2E3C6',
  MUSHROOM_STEM: '#E8D9B5',

  // 升级分支色 3色
  UPGRADE_LV1: '#FF5FA2',     // 通用升级（Lv1）荧光粉
  BRANCH_A: '#4FD8E8',        // 分支 A 青蓝
  BRANCH_B: '#FFB347',        // 分支 B 橙黄

  // 敌人配色 5色
  ENEMY_BEETLE: '#2B2233',    // 小甲虫主体
  ENEMY_EYE: '#E63946',       // 小甲虫眼睛 / 危险红
  ENEMY_ARMORED: '#6C7A89',   // 甲壳虫
  ENEMY_SPLITTER: '#C77DFF',  // 裂殖虫 / 幼体
  ENEMY_MOTH: '#E9E4D4',      // 飞蛾 / 疾蛾

  // 界面与反馈 5色
  UI_PANEL: '#101820',        // 面板底色（85% 不透明）
  UI_PANEL_RGBA: 'rgba(16, 24, 32, 0.85)',
  UI_PANEL_SOLID: '#101820',
  UI_TEXT: '#F7F4EA',         // 正文与数字白字
  UI_SPORE: '#FFD166',        // 孢子货币黄
  UI_SEED: '#EF476F',         // 种子生命红
  UI_STAR: '#FFD700'          // 星级金
};

module.exports = PALETTE;
