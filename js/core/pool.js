/**
 * 固定上限对象池 (Object Pool)
 * 用于敌人(上限120)、子弹(上限150)、粒子(上限600)、雾团/灼烧区、伤害数字的零分配复用
 */

class ObjectPool {
  /**
   * @param {Function} factory 创建新对象的工厂函数
   * @param {Function} resetFn 重置对象状态的函数
   * @param {number} maxCap 最大同屏活跃上限
   */
  constructor(factory, resetFn, maxCap) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.maxCap = maxCap;
    this.freeList = [];
    this.activeList = [];

    for (let i = 0; i < maxCap; i++) {
      const item = this.factory();
      item.__active = false;
      this.freeList.push(item);
    }
  }

  /**
   * 获取一个可用对象；若达到上限返回 null（或回收最旧粒子）
   */
  acquire(recycleOldestIfFull = false) {
    let item = null;
    if (this.freeList.length > 0) {
      item = this.freeList.pop();
    } else if (recycleOldestIfFull && this.activeList.length > 0) {
      item = this.activeList.shift();
    } else {
      return null;
    }

    item.__active = true;
    if (this.resetFn) {
      this.resetFn(item);
    }
    item.__poolIndex = this.activeList.length;
    this.activeList.push(item);
    return item;
  }

  /**
   * 释放指定对象回池 (O(1) 尾部互换快速出池，彻底消除 O(N) Array.splice 性能瓶颈)
   */
  release(item) {
    if (!item || !item.__active) return;
    item.__active = false;
    const idx = item.__poolIndex;
    if (idx !== undefined && idx >= 0 && idx < this.activeList.length && this.activeList[idx] === item) {
      const last = this.activeList.pop();
      if (last !== item) {
        this.activeList[idx] = last;
        last.__poolIndex = idx;
      }
    } else {
      const fallbackIdx = this.activeList.indexOf(item);
      if (fallbackIdx !== -1) {
        const last = this.activeList.pop();
        if (last !== item) {
          this.activeList[fallbackIdx] = last;
          last.__poolIndex = fallbackIdx;
        }
      }
    }
    item.__poolIndex = -1;
    this.freeList.push(item);
  }

  /**
   * 根据索引快速释放 (O(1) 尾部互换)
   */
  releaseAt(index) {
    if (index < 0 || index >= this.activeList.length) return;
    const item = this.activeList[index];
    item.__active = false;
    const last = this.activeList.pop();
    if (last !== item) {
      this.activeList[index] = last;
      last.__poolIndex = index;
    }
    item.__poolIndex = -1;
    this.freeList.push(item);
  }

  /**
   * 清空所有活跃对象回池
   */
  clear() {
    while (this.activeList.length > 0) {
      const item = this.activeList.pop();
      item.__active = false;
      this.freeList.push(item);
    }
  }

  getActiveCount() {
    return this.activeList.length;
  }

  getActiveList() {
    return this.activeList;
  }
}

module.exports = ObjectPool;
