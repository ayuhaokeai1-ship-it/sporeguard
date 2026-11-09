/**
 * 波次结构数据表（严格对齐第七章 7.3 - 7.5 节奏与第五章 5.2 经济预算目标）
 * 每波由 2-5 个组构成，组内包含 type, count, interval, start
 * 地图 1（10 波，总预算 ≈1600）
 * 地图 2（12 波，总预算 ≈2000）
 * 地图 3（15 波，总预算 ≈2800）
 */

const WAVES = {
  // 地图 1：晨雾林地（10 波，节奏紧凑成梯队推进）
  map1: [
    // Wave 1: 晨雾初现，林地先头步兵集群
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 6, interval: 0.9, start: 0 },
        { type: 'beetle', count: 7, interval: 0.85, start: 6 },
        { type: 'beetle', count: 8, interval: 0.75, start: 13 }
      ]
    },
    // Wave 2: 极速突袭，迅捷飞蠓蜂拥而至
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 5, interval: 1.0, start: 0 },
        { type: 'swift', count: 9, interval: 0.65, start: 5 },
        { type: 'beetle', count: 5, interval: 0.9, start: 14 },
        { type: 'swift', count: 8, interval: 0.60, start: 18 }
      ]
    },
    // Wave 3: 树冠空袭，林光飞蛾掠空（教学性空袭：6 只飞蛾平滑进阶，杜绝猝死）
    {
      wave: 3,
      groups: [
        { type: 'beetle', count: 6, interval: 1.0, start: 0 },
        { type: 'moth', count: 3, interval: 1.2, start: 4 },
        { type: 'swift', count: 8, interval: 0.70, start: 9 },
        { type: 'moth', count: 3, interval: 1.2, start: 15 },
        { type: 'volatile_pod', count: 2, interval: 1.4, start: 20, routeIndex: 1 }
      ]
    },
    // Wave 4: 坚甲逼近，暗影潜行者侧翼回旋绕袭
    {
      wave: 4,
      groups: [
        { type: 'armored', count: 1, interval: 2.0, start: 0 },
        { type: 'beetle', count: 5, interval: 0.9, start: 3 },
        { type: 'armored', count: 1, interval: 2.0, start: 9 },
        { type: 'weaver', count: 2, interval: 2.5, start: 10 },
        { type: 'leaper', count: 3, interval: 1.2, start: 12, routeIndex: 1 },
        { type: 'beetle', count: 3, interval: 1.0, start: 15, routeIndex: 1 },
        { type: 'swift', count: 4, interval: 0.7, start: 18 },
        { type: 'moth', count: 4, interval: 1.3, start: 20 }
      ]
    },
    // Wave 5: 空地一体混合冲锋
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 2, interval: 2.5, start: 0 },
        { type: 'swift', count: 8, interval: 0.7, start: 4 },
        { type: 'moth', count: 6, interval: 1.2, start: 12 },
        { type: 'beetle', count: 8, interval: 0.8, start: 20 },
        { type: 'shaman', count: 1, interval: 1.0, start: 24, routeIndex: 1 }
      ]
    },
    // Wave 6: 异化裂殖，潜伏掘地虫破土偷袭
    {
      wave: 6,
      groups: [
        { type: 'siege_beetle', count: 1, interval: 1.0, start: 0 },
        { type: 'leaper', count: 2, interval: 1.5, start: 2 },
        { type: 'splitter', count: 3, interval: 2.0, start: 5 },
        { type: 'weaver', count: 2, interval: 2.0, start: 2 },
        { type: 'beetle', count: 6, interval: 0.9, start: 6 },
        { type: 'burrower', count: 3, interval: 1.5, start: 10, routeIndex: 1 },
        { type: 'splitter', count: 2, interval: 2.2, start: 14 },
        { type: 'swift', count: 8, interval: 0.7, start: 20 }
      ]
    },
    // Wave 7: 重装压境与裂殖包夹
    {
      wave: 7,
      groups: [
        { type: 'armored', count: 2, interval: 2.5, start: 0 },
        { type: 'splitter', count: 3, interval: 2.0, start: 6 },
        { type: 'moth', count: 10, interval: 0.95, start: 12 },
        { type: 'swift', count: 8, interval: 0.65, start: 22 },
        { type: 'burrower', count: 3, interval: 2.0, start: 25 }
      ]
    },
    // Wave 8: 狂暴大迁徙与后排钳形围猎
    {
      wave: 8,
      groups: [
        { type: 'swift', count: 16, interval: 0.55, start: 0 },
        { type: 'moth', count: 12, interval: 0.85, start: 8 },
        { type: 'leaper', count: 6, interval: 0.95, start: 12, routeIndex: 1 },
        { type: 'armored', count: 3, interval: 2.2, start: 16 },
        { type: 'splitter', count: 4, interval: 1.8, start: 24 }
      ]
    },
    // Wave 9: 决战前夕黑潮
    {
      wave: 9,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.0, start: 0 },
        { type: 'leaper', count: 4, interval: 1.0, start: 5 },
        { type: 'splitter', count: 4, interval: 1.8, start: 7 },
        { type: 'swift', count: 18, interval: 0.50, start: 14 },
        { type: 'moth', count: 12, interval: 0.80, start: 20 }
      ]
    },
    // Wave 10: 最终决战 腐化蛀王登场
    {
      wave: 10,
      groups: [
        { type: 'boss_m1', count: 1, interval: 1.0, start: 0 },
        { type: 'armored', count: 3, interval: 2.0, start: 5 },
        { type: 'moth', count: 10, interval: 0.95, start: 12 },
        { type: 'leaper', count: 6, interval: 1.0, start: 16, routeIndex: 1 },
        { type: 'splitter', count: 5, interval: 1.6, start: 22 },
        { type: 'burrower', count: 5, interval: 1.3, start: 26, routeIndex: 1 },
        { type: 'swift', count: 14, interval: 0.55, start: 30 }
      ]
    }
  ],

  // 地图 2：苔藓溪谷（12 波）
  // 第1波小甲虫与飞蛾；第3波疾蛾；第5波甲壳虫；第7波裂殖虫；第9波起混编；第12波蛾后
  map2: [
    // Wave 1: 小甲虫与飞蛾混编试探
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 6, interval: 1.1, start: 0 },
        { type: 'moth', count: 4, interval: 1.4, start: 7 },
        { type: 'beetle', count: 6, interval: 0.9, start: 14 }
      ]
    },
    // Wave 2: 小甲虫与飞蛾强化
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 6, interval: 1.0, start: 0 },
        { type: 'moth', count: 5, interval: 1.2, start: 6 },
        { type: 'beetle', count: 6, interval: 0.9, start: 14 }
      ]
    },
    // Wave 3: 引入疾蛾
    {
      wave: 3,
      groups: [
        { type: 'swift', count: 6, interval: 0.8, start: 0 },
        { type: 'beetle', count: 6, interval: 0.9, start: 5 },
        { type: 'moth', count: 5, interval: 1.2, start: 12 }
      ]
    },
    // Wave 4: 疾蛾与飞蛾快攻
    {
      wave: 4,
      groups: [
        { type: 'moth', count: 6, interval: 1.1, start: 0 },
        { type: 'swift', count: 8, interval: 0.7, start: 6 },
        { type: 'beetle', count: 6, interval: 0.9, start: 14 }
      ]
    },
    // Wave 5: 引入甲壳虫
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 2, interval: 2.2, start: 0 },
        { type: 'beetle', count: 7, interval: 0.9, start: 5 },
        { type: 'moth', count: 6, interval: 1.1, start: 12 }
      ]
    },
    // Wave 6: 重甲与快虫交替
    {
      wave: 6,
      groups: [
        { type: 'armored', count: 2, interval: 2.0, start: 0 },
        { type: 'swift', count: 8, interval: 0.7, start: 5 },
        { type: 'moth', count: 6, interval: 1.1, start: 12 },
        { type: 'beetle', count: 6, interval: 0.8, start: 18 }
      ]
    },
    // Wave 7: 引入裂殖虫
    {
      wave: 7,
      groups: [
        { type: 'splitter', count: 3, interval: 2.0, start: 0 },
        { type: 'beetle', count: 7, interval: 0.8, start: 6 },
        { type: 'moth', count: 6, interval: 1.1, start: 14 }
      ]
    },
    // Wave 8: 裂殖与重甲
    {
      wave: 8,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.0, start: 0 },
        { type: 'leaper', count: 4, interval: 1.0, start: 5 },
        { type: 'splitter', count: 4, interval: 1.8, start: 6 },
        { type: 'swift', count: 8, interval: 0.7, start: 14 },
        { type: 'moth', count: 6, interval: 1.1, start: 20 }
      ]
    },
    // Wave 9: 混编开始
    {
      wave: 9,
      groups: [
        { type: 'armored', count: 3, interval: 1.8, start: 0 },
        { type: 'moth', count: 7, interval: 1.0, start: 6 },
        { type: 'splitter', count: 4, interval: 1.6, start: 14 },
        { type: 'swift', count: 8, interval: 0.7, start: 21 }
      ]
    },
    // Wave 10: 混编强袭
    {
      wave: 10,
      groups: [
        { type: 'swift', count: 9, interval: 0.65, start: 0 },
        { type: 'armored', count: 3, interval: 1.8, start: 6 },
        { type: 'moth', count: 8, interval: 1.0, start: 13 },
        { type: 'splitter', count: 5, interval: 1.6, start: 22 }
      ]
    },
    // Wave 11: 混编高潮
    {
      wave: 11,
      groups: [
        { type: 'armored', count: 4, interval: 1.8, start: 0 },
        { type: 'splitter', count: 5, interval: 1.6, start: 7 },
        { type: 'moth', count: 9, interval: 0.9, start: 15 },
        { type: 'swift', count: 10, interval: 0.6, start: 24 }
      ]
    },
    // Wave 12: 最终波 蛾后登场（空中首领 + 护卫）
    {
      wave: 12,
      groups: [
        { type: 'boss_m2', count: 1, interval: 1.0, start: 0 },
        { type: 'moth', count: 7, interval: 2.2, start: 6 },
        { type: 'armored', count: 3, interval: 4.2, start: 20 },
        { type: 'splitter', count: 4, interval: 3.2, start: 32 },
        { type: 'swift', count: 8, interval: 1.4, start: 44 }
      ]
    }
  ],

  // 地图 3：夜光蕈林（15 波）
  // 第1波小甲虫与疾蛾；第4波甲壳虫与飞蛾；第6波裂殖虫；第9波起全部类型混编；第15波裂殖母体
  map3: [
    // Wave 1: 小甲虫与疾蛾
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 7, interval: 2.4, start: 0 },
        { type: 'swift', count: 6, interval: 1.8, start: 16 }
      ]
    },
    // Wave 2: 小甲虫与疾蛾密集突进
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 8, interval: 2.0, start: 0 },
        { type: 'swift', count: 7, interval: 1.5, start: 15 },
        { type: 'beetle', count: 6, interval: 1.8, start: 28 }
      ]
    },
    // Wave 3: 高速地面虫群
    {
      wave: 3,
      groups: [
        { type: 'swift', count: 8, interval: 1.4, start: 0 },
        { type: 'beetle', count: 9, interval: 1.7, start: 12 },
        { type: 'swift', count: 7, interval: 1.4, start: 28 }
      ]
    },
    // Wave 4: 引入甲壳虫与飞蛾
    {
      wave: 4,
      groups: [
        { type: 'armored', count: 3, interval: 4.5, start: 0 },
        { type: 'moth', count: 6, interval: 2.4, start: 12 },
        { type: 'beetle', count: 7, interval: 1.8, start: 26 }
      ]
    },
    // Wave 5: 陆空夹击
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 3, interval: 4.0, start: 0 },
        { type: 'swift', count: 8, interval: 1.4, start: 12 },
        { type: 'moth', count: 7, interval: 2.0, start: 24 },
        { type: 'beetle', count: 7, interval: 1.7, start: 38 }
      ]
    },
    // Wave 6: 引入裂殖虫
    {
      wave: 6,
      groups: [
        { type: 'splitter', count: 5, interval: 3.2, start: 0 },
        { type: 'moth', count: 6, interval: 2.2, start: 16 },
        { type: 'swift', count: 8, interval: 1.4, start: 30 }
      ]
    },
    // Wave 7: 裂殖与重甲推进
    {
      wave: 7,
      groups: [
        { type: 'armored', count: 4, interval: 3.8, start: 0 },
        { type: 'splitter', count: 5, interval: 3.0, start: 14 },
        { type: 'moth', count: 7, interval: 2.0, start: 28 },
        { type: 'swift', count: 7, interval: 1.4, start: 40 }
      ]
    },
    // Wave 8: 双路压境
    {
      wave: 8,
      groups: [
        { type: 'splitter', count: 6, interval: 2.8, start: 0 },
        { type: 'armored', count: 4, interval: 3.6, start: 14 },
        { type: 'moth', count: 8, interval: 1.8, start: 28 },
        { type: 'beetle', count: 8, interval: 1.5, start: 42 }
      ]
    },
    // Wave 9: 全部类型混编 I
    {
      wave: 9,
      groups: [
        { type: 'armored', count: 4, interval: 3.5, start: 0 },
        { type: 'swift', count: 9, interval: 1.2, start: 10 },
        { type: 'moth', count: 7, interval: 1.9, start: 20 },
        { type: 'splitter', count: 5, interval: 2.8, start: 32 },
        { type: 'beetle', count: 8, interval: 1.4, start: 44 }
      ]
    },
    // Wave 10: 全部类型混编 II
    {
      wave: 10,
      groups: [
        { type: 'splitter', count: 6, interval: 2.6, start: 0 },
        { type: 'moth', count: 8, interval: 1.8, start: 12 },
        { type: 'armored', count: 4, interval: 3.4, start: 24 },
        { type: 'swift', count: 10, interval: 1.1, start: 36 },
        { type: 'beetle', count: 8, interval: 1.4, start: 46 }
      ]
    },
    // Wave 11: 全部类型混编 III
    {
      wave: 11,
      groups: [
        { type: 'armored', count: 5, interval: 3.2, start: 0 },
        { type: 'splitter', count: 6, interval: 2.5, start: 12 },
        { type: 'moth', count: 8, interval: 1.7, start: 24 },
        { type: 'swift', count: 10, interval: 1.1, start: 36 },
        { type: 'beetle', count: 8, interval: 1.3, start: 46 }
      ]
    },
    // Wave 12: 全部类型混编 IV
    {
      wave: 12,
      groups: [
        { type: 'swift', count: 11, interval: 1.0, start: 0 },
        { type: 'armored', count: 5, interval: 3.2, start: 10 },
        { type: 'splitter', count: 7, interval: 2.4, start: 22 },
        { type: 'moth', count: 9, interval: 1.6, start: 36 },
        { type: 'beetle', count: 8, interval: 1.3, start: 48 }
      ]
    },
    // Wave 13: 全部类型混编 V
    {
      wave: 13,
      groups: [
        { type: 'armored', count: 5, interval: 3.0, start: 0 },
        { type: 'moth', count: 10, interval: 1.5, start: 10 },
        { type: 'splitter', count: 7, interval: 2.3, start: 24 },
        { type: 'swift', count: 11, interval: 1.0, start: 38 },
        { type: 'beetle', count: 9, interval: 1.2, start: 48 }
      ]
    },
    // Wave 14: 终局前夜全军突击
    {
      wave: 14,
      groups: [
        { type: 'armored', count: 6, interval: 2.8, start: 0 },
        { type: 'splitter', count: 8, interval: 2.2, start: 12 },
        { type: 'moth', count: 10, interval: 1.5, start: 26 },
        { type: 'swift', count: 12, interval: 0.9, start: 40 },
        { type: 'beetle', count: 10, interval: 1.1, start: 50 }
      ]
    },
    // Wave 15: 最终波 裂殖母体登场
    {
      wave: 15,
      groups: [
        { type: 'boss_m3', count: 1, interval: 1.0, start: 0 },
        { type: 'armored', count: 4, interval: 3.5, start: 8 },
        { type: 'moth', count: 8, interval: 1.8, start: 20 },
        { type: 'splitter', count: 6, interval: 2.6, start: 34 },
        { type: 'swift', count: 10, interval: 1.1, start: 48 }
      ]
    }
  ]
};

module.exports = {
  WAVES
};
