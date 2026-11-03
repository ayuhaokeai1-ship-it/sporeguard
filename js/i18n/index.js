/**
 * 国际化 (i18n) 管理器
 */

const zh = require('./zh');
const en = require('./en');

const PACKS = { zh, en };
let currentLang = 'zh';

function setLang(lang) {
  if (PACKS[lang]) {
    currentLang = lang;
  }
}

function getLang() {
  return currentLang;
}

function toggleLang() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  return currentLang;
}

function t(key, ...args) {
  const pack = PACKS[currentLang] || PACKS.zh;
  let str = pack[key] !== undefined ? pack[key] : (PACKS.zh[key] || key);
  for (let i = 0; i < args.length; i++) {
    str = str.replace('{' + i + '}', String(args[i]));
  }
  return str;
}

module.exports = {
  setLang,
  getLang,
  toggleLang,
  t
};
