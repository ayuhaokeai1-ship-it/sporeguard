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
        { type: 'beetle', count: 5, interval: 0.95, start: 0 },
        { type: 'beetle', count: 6, interval: 0.90, start: 6 },
        { type: 'beetle', count: 6, interval: 0.85, start: 13 }
      ]
    },
    // Wave 2: 极速突袭，迅捷飞蠓双线分进合击
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 5, interval: 1.0, start: 0 },
        { type: 'swift', count: 5, interval: 0.80, start: 5 },
        { type: 'swift', count: 3, interval: 1.10, start: 9, routeIndex: 1 },
        { type: 'beetle', count: 4, interval: 0.95, start: 14 },
        { type: 'swift', count: 5, interval: 0.75, start: 18 }
      ]
    },
    // Wave 3: 树冠空袭，林光飞蛾掠空（教学性空袭：4 只飞蛾平滑进阶，配合侧翼甲虫）
    {
      wave: 3,
      groups: [
        { type: 'beetle', count: 6, interval: 1.0, start: 0 },
        { type: 'moth', count: 2, interval: 1.4, start: 4 },
        { type: 'swift', count: 6, interval: 0.80, start: 9 },
        { type: 'moth', count: 2, interval: 1.4, start: 15 },
        { type: 'beetle', count: 3, interval: 1.2, start: 19, routeIndex: 1 }
      ]
    },
    // Wave 4: 坚甲逼近，暗影潜行者侧翼回旋绕袭
    {
      wave: 4,
      groups: [
        { type: 'armored', count: 1, interval: 2.0, start: 0 },
        { type: 'beetle', count: 5, interval: 0.9, start: 3 },
        { type: 'weaver', count: 1, interval: 2.5, start: 10 },
        { type: 'leaper', count: 1, interval: 1.5, start: 13, routeIndex: 1 },
        { type: 'beetle', count: 3, interval: 1.1, start: 16, routeIndex: 1 },
        { type: 'swift', count: 4, interval: 0.8, start: 18 },
        { type: 'moth', count: 3, interval: 1.35, start: 20 }
      ]
    },
    // Wave 5: 空地一体混合冲锋与爆裂侧袭
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 2, interval: 2.5, start: 0 },
        { type: 'swift', count: 8, interval: 0.75, start: 4 },
        { type: 'moth', count: 5, interval: 1.25, start: 12 },
        { type: 'volatile_pod', count: 2, interval: 1.6, start: 16, routeIndex: 1 },
        { type: 'beetle', count: 6, interval: 0.85, start: 20 },
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
        { type: 'burrower', count: 2, interval: 2.2, start: 10, routeIndex: 1 },
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
        { type: 'leaper', count: 3, interval: 1.5, start: 12, routeIndex: 1 },
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
        { type: 'armored', count: 1, interval: 2.5, start: 6 },
        { type: 'beetle', count: 5, interval: 1.2, start: 8 },
        { type: 'moth', count: 6, interval: 1.3, start: 13 },
        { type: 'leaper', count: 3, interval: 1.4, start: 18, routeIndex: 1 },
        { type: 'splitter', count: 3, interval: 2.0, start: 24 },
        { type: 'burrower', count: 2, interval: 1.8, start: 29, routeIndex: 1 },
        { type: 'swift', count: 10, interval: 0.7, start: 34 }
      ]
    }
  ],

  // 地图 2：苔藓溪谷（12 波，双回环溪谷 + 高台暗穴侧翼突击）
  map2: [
    // Wave 1: 先遣甲虫群试探防线
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 7, interval: 1.1, start: 0 },
        { type: 'beetle', count: 7, interval: 0.95, start: 9 }
      ]
    },
    // Wave 2: 疾风突刺与首批树冠飞蛾空袭
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 6, interval: 1.0, start: 0 },
        { type: 'swift', count: 5, interval: 0.9, start: 6 },
        { type: 'moth', count: 3, interval: 1.5, start: 12 }
      ]
    },
    // Wave 3: 溪谷双线包抄与树冠飞蛾试探
    {
      wave: 3,
      groups: [
        { type: 'swift', count: 6, interval: 0.8, start: 0 },
        { type: 'beetle', count: 6, interval: 0.9, start: 5 },
        { type: 'swift', count: 4, interval: 0.9, start: 7, routeIndex: 1 },
        { type: 'moth', count: 5, interval: 1.2, start: 12 }
      ]
    },
    // Wave 4: 疾虫与飞蛾快攻，侧翼高台跳跃者偷袭
    {
      wave: 4,
      groups: [
        { type: 'moth', count: 6, interval: 1.1, start: 0 },
        { type: 'swift', count: 8, interval: 0.7, start: 6 },
        { type: 'leaper', count: 3, interval: 1.5, start: 8, routeIndex: 1 },
        { type: 'beetle', count: 6, interval: 0.9, start: 14 }
      ]
    },
    // Wave 5: 引入重型甲壳虫
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 2, interval: 2.2, start: 0 },
        { type: 'beetle', count: 7, interval: 0.9, start: 5 },
        { type: 'moth', count: 6, interval: 1.1, start: 12 }
      ]
    },
    // Wave 6: 重甲与蛛丝纺织者协同，侧翼快虫包抄
    {
      wave: 6,
      groups: [
        { type: 'armored', count: 2, interval: 2.0, start: 0 },
        { type: 'weaver', count: 2, interval: 2.2, start: 6 },
        { type: 'swift', count: 7, interval: 0.7, start: 8, routeIndex: 1 },
        { type: 'moth', count: 6, interval: 1.1, start: 14 },
        { type: 'beetle', count: 6, interval: 0.8, start: 20 }
      ]
    },
    // Wave 7: 裂殖母虫与东南掘地伏兵夹击
    {
      wave: 7,
      groups: [
        { type: 'splitter', count: 3, interval: 2.0, start: 0 },
        { type: 'burrower', count: 2, interval: 1.8, start: 4, routeIndex: 1 },
        { type: 'beetle', count: 7, interval: 0.8, start: 7 },
        { type: 'moth', count: 6, interval: 1.1, start: 14 }
      ]
    },
    // Wave 8: 攻城巨甲与暗穴掘地虫夹击，巫毒萨满治疗
    {
      wave: 8,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.0, start: 0 },
        { type: 'shaman', count: 1, interval: 1.0, start: 4 },
        { type: 'burrower', count: 3, interval: 1.6, start: 8, routeIndex: 1 },
        { type: 'splitter', count: 4, interval: 1.8, start: 10 },
        { type: 'swift', count: 8, interval: 0.7, start: 16 },
        { type: 'moth', count: 6, interval: 1.1, start: 22 }
      ]
    },
    // Wave 9: 混编破阵双翼包夹大潮
    {
      wave: 9,
      groups: [
        { type: 'armored', count: 3, interval: 1.8, start: 0 },
        { type: 'moth', count: 7, interval: 1.0, start: 6 },
        { type: 'swift', count: 6, interval: 0.8, start: 10, routeIndex: 1 },
        { type: 'splitter', count: 4, interval: 1.6, start: 14 },
        { type: 'swift', count: 7, interval: 0.7, start: 21 }
      ]
    },
    // Wave 10: 混编强袭与后排回旋飞跃
    {
      wave: 10,
      groups: [
        { type: 'swift', count: 9, interval: 0.65, start: 0 },
        { type: 'weaver', count: 2, interval: 2.0, start: 5 },
        { type: 'leaper', count: 4, interval: 1.2, start: 8, routeIndex: 1 },
        { type: 'armored', count: 3, interval: 1.8, start: 12 },
        { type: 'moth', count: 8, interval: 1.0, start: 18 },
        { type: 'splitter', count: 5, interval: 1.6, start: 24 }
      ]
    },
    // Wave 11: 决战前夕黑潮，地底掘地虫倾巢突围
    {
      wave: 11,
      groups: [
        { type: 'siege_beetle', count: 1, interval: 1.0, start: 0 },
        { type: 'armored', count: 4, interval: 1.8, start: 4 },
        { type: 'burrower', count: 4, interval: 1.5, start: 8, routeIndex: 1 },
        { type: 'splitter', count: 5, interval: 1.6, start: 14 },
        { type: 'moth', count: 9, interval: 0.9, start: 20 },
        { type: 'swift', count: 10, interval: 0.6, start: 26 }
      ]
    },
    // Wave 12: 最终波 剧毒飞蛾后登场（空中首领 + 侧翼暗穴两翼合围）
    {
      wave: 12,
      groups: [
        { type: 'boss_m2', count: 1, interval: 1.0, start: 0 },
        { type: 'moth', count: 7, interval: 2.0, start: 6 },
        { type: 'leaper', count: 3, interval: 1.6, start: 10, routeIndex: 1 },
        { type: 'armored', count: 3, interval: 3.5, start: 18 },
        { type: 'burrower', count: 3, interval: 1.8, start: 24, routeIndex: 1 },
        { type: 'splitter', count: 4, interval: 2.8, start: 30 },
        { type: 'swift', count: 8, interval: 1.2, start: 40 }
      ]
    }
  ],

  // 地图 3：夜光蕈林（15 波，三层平行长廊 + 幽夜地脉暗穴突袭）
  map3: [
    // Wave 1: 小甲虫与疾蛾
    {
      wave: 1,
      groups: [
        { type: 'beetle', count: 7, interval: 2.0, start: 0 },
        { type: 'swift', count: 6, interval: 1.6, start: 14 }
      ]
    },
    // Wave 2: 小甲虫与疾蛾密集突进
    {
      wave: 2,
      groups: [
        { type: 'beetle', count: 8, interval: 1.8, start: 0 },
        { type: 'swift', count: 7, interval: 1.4, start: 14 },
        { type: 'beetle', count: 6, interval: 1.6, start: 26 }
      ]
    },
    // Wave 3: 幽夜上路与下层地脉双线速攻
    {
      wave: 3,
      groups: [
        { type: 'swift', count: 7, interval: 1.3, start: 0 },
        { type: 'beetle', count: 8, interval: 1.4, start: 8 },
        { type: 'swift', count: 5, interval: 1.0, start: 14, routeIndex: 1 },
        { type: 'swift', count: 6, interval: 1.3, start: 24 }
      ]
    },
    // Wave 4: 引入甲壳虫与飞蛾
    {
      wave: 4,
      groups: [
        { type: 'armored', count: 3, interval: 3.8, start: 0 },
        { type: 'moth', count: 6, interval: 2.0, start: 10 },
        { type: 'beetle', count: 7, interval: 1.6, start: 22 }
      ]
    },
    // Wave 5: 陆空夹击与后排暗穴跃击者首现
    {
      wave: 5,
      groups: [
        { type: 'armored', count: 3, interval: 3.5, start: 0 },
        { type: 'swift', count: 8, interval: 1.2, start: 10 },
        { type: 'leaper', count: 3, interval: 1.4, start: 14, routeIndex: 1 },
        { type: 'moth', count: 7, interval: 1.8, start: 22 },
        { type: 'beetle', count: 7, interval: 1.5, start: 34 }
      ]
    },
    // Wave 6: 裂殖母虫与下路跃击伏兵
    {
      wave: 6,
      groups: [
        { type: 'splitter', count: 5, interval: 2.8, start: 0 },
        { type: 'leaper', count: 2, interval: 1.5, start: 8, routeIndex: 1 },
        { type: 'moth', count: 6, interval: 2.0, start: 14 },
        { type: 'swift', count: 8, interval: 1.2, start: 26 }
      ]
    },
    // Wave 7: 裂殖与重甲推进，暗穴掘地虫破土偷袭
    {
      wave: 7,
      groups: [
        { type: 'armored', count: 4, interval: 3.2, start: 0 },
        { type: 'weaver', count: 2, interval: 2.5, start: 10 },
        { type: 'burrower', count: 3, interval: 1.6, start: 14, routeIndex: 1 },
        { type: 'splitter', count: 5, interval: 2.6, start: 20 },
        { type: 'moth', count: 7, interval: 1.8, start: 32 }
      ]
    },
    // Wave 8: 双路重装压境
    {
      wave: 8,
      groups: [
        { type: 'splitter', count: 6, interval: 2.5, start: 0 },
        { type: 'armored', count: 4, interval: 3.2, start: 12 },
        { type: 'beetle', count: 6, interval: 1.2, start: 18, routeIndex: 1 },
        { type: 'moth', count: 8, interval: 1.6, start: 24 },
        { type: 'beetle', count: 7, interval: 1.3, start: 36 }
      ]
    },
    // Wave 9: 巫毒蝉俑治疗支援，暗穴跳跃者群袭
    {
      wave: 9,
      groups: [
        { type: 'armored', count: 4, interval: 3.0, start: 0 },
        { type: 'shaman', count: 1, interval: 1.0, start: 6 },
        { type: 'leaper', count: 4, interval: 1.2, start: 12, routeIndex: 1 },
        { type: 'swift', count: 9, interval: 1.0, start: 18 },
        { type: 'moth', count: 7, interval: 1.6, start: 28 },
        { type: 'splitter', count: 5, interval: 2.4, start: 38 }
      ]
    },
    // Wave 10: 织网蛛封印防线，掘地虫两路夹击
    {
      wave: 10,
      groups: [
        { type: 'splitter', count: 6, interval: 2.4, start: 0 },
        { type: 'weaver', count: 3, interval: 2.2, start: 8 },
        { type: 'burrower', count: 4, interval: 1.5, start: 14, routeIndex: 1 },
        { type: 'armored', count: 4, interval: 3.0, start: 20 },
        { type: 'moth', count: 8, interval: 1.6, start: 30 },
        { type: 'swift', count: 10, interval: 1.0, start: 40 }
      ]
    },
    // Wave 11: 攻城巨甲双重冲锋，暗穴疾虫狂奔
    {
      wave: 11,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.5, start: 0 },
        { type: 'armored', count: 4, interval: 2.8, start: 8 },
        { type: 'swift', count: 8, interval: 0.7, start: 14, routeIndex: 1 },
        { type: 'splitter', count: 6, interval: 2.2, start: 20 },
        { type: 'moth', count: 8, interval: 1.5, start: 32 }
      ]
    },
    // Wave 12: 自爆恶蝉空降侧翼，巫毒双萨满护体
    {
      wave: 12,
      groups: [
        { type: 'shaman', count: 2, interval: 3.0, start: 0 },
        { type: 'armored', count: 5, interval: 2.8, start: 6 },
        { type: 'volatile_pod', count: 3, interval: 1.6, start: 12, routeIndex: 1 },
        { type: 'splitter', count: 7, interval: 2.2, start: 18 },
        { type: 'moth', count: 9, interval: 1.4, start: 30 },
        { type: 'swift', count: 11, interval: 0.9, start: 42 }
      ]
    },
    // Wave 13: 巨角攻城兽破关，地底伏兵两路绞杀
    {
      wave: 13,
      groups: [
        { type: 'siege_beetle', count: 2, interval: 3.8, start: 0 },
        { type: 'leaper', count: 5, interval: 1.1, start: 8, routeIndex: 1 },
        { type: 'armored', count: 5, interval: 2.6, start: 14 },
        { type: 'burrower', count: 4, interval: 1.4, start: 20, routeIndex: 1 },
        { type: 'moth', count: 10, interval: 1.4, start: 28 },
        { type: 'splitter', count: 7, interval: 2.0, start: 40 }
      ]
    },
    // Wave 14: 终局前夜全军突击，天崩地裂海啸攻势
    {
      wave: 14,
      groups: [
        { type: 'armored', count: 6, interval: 2.4, start: 0 },
        { type: 'weaver', count: 3, interval: 2.0, start: 6 },
        { type: 'burrower', count: 5, interval: 1.3, start: 12, routeIndex: 1 },
        { type: 'splitter', count: 8, interval: 1.8, start: 18 },
        { type: 'leaper', count: 6, interval: 1.0, start: 26, routeIndex: 1 },
        { type: 'moth', count: 10, interval: 1.3, start: 34 },
        { type: 'swift', count: 12, interval: 0.8, start: 44 }
      ]
    },
    // Wave 15: 最终决战 深渊万虫巢母（全屏首领 + 攻城巨兽 + 暗穴狂潮）
    {
      wave: 15,
      groups: [
        { type: 'boss_m3', count: 1, interval: 1.0, start: 0 },
        { type: 'siege_beetle', count: 2, interval: 3.0, start: 6 },
        { type: 'shaman', count: 2, interval: 3.0, start: 12 },
        { type: 'leaper', count: 6, interval: 1.2, start: 18, routeIndex: 1 },
        { type: 'armored', count: 5, interval: 2.8, start: 26 },
        { type: 'burrower', count: 5, interval: 1.4, start: 34, routeIndex: 1 },
        { type: 'splitter', count: 6, interval: 2.2, start: 42 },
        { type: 'moth', count: 9, interval: 1.5, start: 50 },
        { type: 'swift', count: 12, interval: 0.8, start: 60 }
      ]
    }
  ]
};

module.exports = {
  WAVES
};
