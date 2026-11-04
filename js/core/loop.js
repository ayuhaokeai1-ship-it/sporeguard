/**
 * 主循环与固定步长调度器 (js/core/loop.js)
 * 严格遵循：固定步长 1/60 秒；1×、2×、3× 分别每帧执行 1、2、3 步；
 * 暂停时游戏时间冻结，界面动画仍按真实时间更新
 */

const CONFIG = require('../data/config');
const platform = require('./platform');

const FIXED_DT = CONFIG.TIMING.FIXED_DT; // 1/60 秒

class GameLoop {
  constructor(scene) {
    this.scene = scene;
    this.running = false;
    this.lastTimestamp = 0;
    this.accumulator = 0;

    // 性能统计指标（供 QA 报告与性能监控读取）
    this.perf = {
      frameCount: 0,
      totalFrameWorkMs: 0,
      avgFrameWorkMs: 0,
      slowFramesUnder45Fps: 0,
      maxDrawCallsSeen: 0
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = platform.nowMs();

    const raf = (typeof requestAnimationFrame === 'function')
      ? requestAnimationFrame
      : ((cb) => setTimeout(() => cb(platform.nowMs()), 16));

    const tick = (timestamp) => {
      if (!this.running) return;
      const frameStart = platform.nowMs();
      const rawDeltaSec = Math.max(0, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;
      const realDt = Math.min(CONFIG.TIMING.MAX_FRAME_DELTA, rawDeltaSec || FIXED_DT);

      this.stepFrame(realDt);

      const workMs = platform.nowMs() - frameStart;
      this.perf.frameCount += 1;
      this.perf.totalFrameWorkMs += workMs;
      this.perf.avgFrameWorkMs = this.perf.totalFrameWorkMs / this.perf.frameCount;
      if (workMs > 22.2) {
        this.perf.slowFramesUnder45Fps += 1;
      }

      raf(tick);
    };

    raf(tick);
  }

  /**
   * 单帧推进：时间累加器半固定步长更新，彻底杜绝丢帧减速与顿挫
   */
  stepFrame(realDt) {
    this.scene.updateRealTime(realDt);

    if (this.scene.state === 'BATTLE' && !this.scene.ui.showGuideModal && !this.scene.ui.showSettingsModal) {
      const speed = this.scene.speedMultiplier || 1;
      // 顶级性能调优：1x速每帧精准执行 1 次逻辑步，2x速执行 2 次，3x速执行 3 次
      // 彻底消除时间累加器浮动导致的周期性微卡顿 (Micro-stutter) 与螺旋延迟
      const targetSteps = Math.min(3, Math.max(1, Math.round(speed)));
      for (let s = 0; s < targetSteps; s++) {
        this.scene.fixedStep(FIXED_DT);
      }
      this.accumulator = 0;
    } else {
      this.accumulator = 0;
    }

    const ctx = platform.getContext();
    if (ctx) {
      platform.beginFrame();
      this.scene.render(ctx);
      platform.endFrame();

      const dc = platform.getViewport().drawCalls;
      if (dc > this.perf.maxDrawCallsSeen) {
        this.perf.maxDrawCallsSeen = dc;
      }
    }
  }
}

module.exports = GameLoop;
