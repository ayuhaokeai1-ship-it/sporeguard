/**
 * 《蘑菇守林》(Sporeguard) 游戏主入口 (game.js)
 * 初始化画布、加载主包透明图集资源、绑定输入适配层并启动 60fps 固定步长主循环
 */

const platform = require('./js/core/platform');
const input = require('./js/input/input');
const SceneController = require('./js/core/scene');
const GameLoop = require('./js/core/loop');
const { SPRITE_ATLAS, UI_ATLAS } = require('./js/data/atlas');
const { MAPS } = require('./js/data/maps');

function bootstrapGame() {
  platform.initCanvas();
  input.initInput();

  const scene = new SceneController();
  scene.init();

  const loop = new GameLoop(scene);

  // 预加载主包透明 PNG 精灵图集、UI图集、标题背景原画、AI 范围特效法阵与地图分包
  const vfxAssets = [
    'assets/vfx/range_watch_sniper.png',
    'assets/vfx/range_mist_poison.png',
    'assets/vfx/range_thorn_bramble.png',
    'assets/vfx/range_burst_mortar.png',
    'assets/vfx/range_fairy_green.png',
    'assets/vfx/range_sunburst_gold.png',
    'assets/vfx/range_bramble_red.png',
    'assets/vfx/range_toxic_acid.png',
    'assets/vfx/range_earthshaker.png',
    'assets/vfx/range_commander_reticle.png',
    'assets/vfx/vfx_needle.png',
    'assets/vfx/vfx_mist.png',
    'assets/vfx/vfx_spikes.png',
    'assets/vfx/vfx_bomb.png',
    'assets/vfx/vfx_explosion.png',
    'assets/vfx/vfx_web_cocoon.png',
    'assets/vfx/prop_scarab.png',
    'assets/vfx/prop_stump.png',
    'assets/vfx/prop_dew.png',
    'assets/vfx/prop_pitcher.png',
    'assets/vfx/prop_pitcher_eating.png',
    'assets/vfx/prop_thunder_stump.png',
    'assets/vfx/relic_amber.png',
    'assets/vfx/relic_coin.png',
    'assets/vfx/relic_shield.png',
    'assets/vfx/relic_lightning.png',
    'assets/vfx/relic_clover.png',
    'assets/vfx/prop_spring.png',
    'assets/vfx/prop_debris.png',
    'assets/vfx/prop_lumina_base.png',
    'assets/vfx/prop_lumina_a.png',
    'assets/vfx/prop_lumina_b.png',
    'assets/vfx/guard_shield.png',
    'assets/vfx/guard_spear.png',
    'assets/vfx/relic_lumina.png',
    'assets/vfx/enemy_burrower.png',
    'assets/vfx/enemy_burrow_mound.png',
    'assets/vfx/enemy_volatile_pod.png',
    'assets/vfx/enemy_shaman.png',
        'assets/vfx/enemy_skeletal_husk.png',
    'assets/vfx/vfx_acid_puddle.png',
    'assets/vfx/enemy_leaper.png',
    'assets/vfx/enemy_leaper_jump.png',
    'assets/vfx/enemy_siege_beetle.png',
    'assets/vfx/vfx_leap_wind.png'
  ];

  Promise.all([
    platform.loadImage(SPRITE_ATLAS.path),
    platform.loadImage(UI_ATLAS.path),
    platform.loadImage(UI_ATLAS.titleBgPath),
    platform.loadMapSubpackage('map1', MAPS.map1.atlasPath),
    ...vfxAssets.map(p => platform.loadImage(p))
  ]).then(() => {
    // 后台预热地图 2 与地图 3 图集
    platform.loadMapSubpackage('map2', MAPS.map2.atlasPath);
    platform.loadMapSubpackage('map3', MAPS.map3.atlasPath);
  });

  loop.start();

  const g = typeof GameGlobal !== 'undefined' ? GameGlobal : (typeof globalThis !== 'undefined' ? globalThis : window);
  g.__SPOREGUARD__ = {
    scene,
    loop,
    platform,
    input
  };
}

bootstrapGame();
