---
title: "第 6 篇：ECharts 项目开发速查清单：安装、封装、上线排查"
slug: "echarts-echarts-echarts-be0b5cbd"
summary: "基于 2026-05-03 核对的 Apache ECharts 官方 Handbook、Release 与 vue-echarts 官方资料，整理一套从安装、按需引入、Vue 封装、dataset、交互配置到上线排错的项目开发速查清单。"
category: "ECharts"
tags: ["ECharts","Vue3","项目开发","图表封装","数据可视化","排错清单"]
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5ea"
originalSlug: "echarts-echarts-echarts-be0b5cbd"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 6 篇：ECharts 项目开发速查清单：安装、封装、上线排查

> 主人前面五篇已经把 ECharts 的概念、选图、数据组织、Vue 接入和交互联动都铺开了。  
> 这一篇不再继续讲散点知识，而是把它们压缩成一条 **真实项目开发路线**。

这一篇按 **2026-05-03** 重新核对的官方资料来写。

主要参考：

- Apache ECharts 官网、Handbook 与 Releases
- `Get Started`、`Import`、`Chart Container and Size`
- `Dataset`、`Data Transform`、`Dynamic Data`
- `Event and Action`、`Legend`、`Axis`
- `Canvas vs. SVG`、`Security Guidelines`、`Aria`
- `vue-echarts` 官方 README 与 Releases

目标很简单：

**主人后面接到一个“做图表页”的需求时，可以直接照这篇从 0 搭到可上线。**

---

## 一、先做技术选型

如果是 `Vue 3 + Vite` 项目，优先考虑：

```bash
npm install echarts vue-echarts
```

选型判断：

| 场景 | 推荐 |
|------|------|
| 普通 Vue 3 后台图表页 | `vue-echarts` |
| 需要自己完全控制实例生命周期 | 原生 `echarts.init` |
| 大多数业务统计页 | `CanvasRenderer` |
| 图表实例很多、元素不多、想降低部分内存压力 | 可评估 `SVGRenderer` |
| 只是写一个临时静态 demo | CDN 或整包引入 |

版本上先记两点：

- Apache ECharts Release 页当前主线是 `6.0.0`
- `vue-echarts` Release 页顶部有 `8.1.0-beta` 预发布；普通项目优先选标记为 Latest 的稳定版 `v8.0.1`

主人如果不是专门试新功能，先别在业务项目里追 beta。

---

## 二、按需引入先建一个统一入口

正式项目里不要每个页面各自注册一遍 ECharts 模块。

可以建一个类似 `src/plugins/echarts.js` 的文件：

```js
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart
} from 'echarts/charts'
import {
  AriaComponent,
  DataZoomComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  AriaComponent,
  DataZoomComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent
])
```

然后在 `main.js` 或入口文件里引入一次：

```js
import '@/plugins/echarts'
```

主人要特别记住：

**按需引入时，图表类型、组件和渲染器都要注册。**

只注册 `LineChart` 不够，少了 `CanvasRenderer` 或 `SVGRenderer`，图表可能直接起不来。

---

## 三、先封一个能复用的 `BaseChart`

真实项目里不要每张图都散写。

先封一个基础组件：

```vue
<template>
  <section class='chart-shell'>
    <VChart
      v-if='!empty'
      class='chart'
      :option='option'
      :autoresize='autoresize'
      :loading='loading'
      @click='handleClick'
    />
    <div v-else class='chart-empty'>
      暂无图表数据
    </div>
  </section>
</template>

<script setup>
import VChart from 'vue-echarts'

defineOptions({
  name: 'BaseChart'
})

defineProps({
  option: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  empty: {
    type: Boolean,
    default: false
  },
  autoresize: {
    type: [Boolean, Object],
    default: true
  }
})

const emit = defineEmits(['chart-click'])

const handleClick = (params) => {
  emit('chart-click', params)
}
</script>

<style scoped>
.chart-shell {
  width: 100%;
  min-height: 360px;
}

.chart {
  width: 100%;
  height: 360px;
}

.chart-empty {
  display: grid;
  min-height: 360px;
  place-items: center;
  color: #8a93a3;
  border: 1px dashed #ccd3df;
  border-radius: 14px;
  background: #f8fafc;
}
</style>
```

这个组件先解决 5 件事：

- 有固定高度
- 支持 loading
- 支持空态
- 支持自动 resize
- 把图表点击事件抛给业务层

后面再加主题、错误态、导出图片、联动控制，都有地方放。

---

## 四、业务页优先走 `dataset + encode`

后端接口常见返回长这样：

```js
const apiList = [
  { date: '05-01', visits: 1200, orders: 86, ratePercent: 7.1 },
  { date: '05-02', visits: 1320, orders: 94, ratePercent: 7.1 },
  { date: '05-03', visits: 1180, orders: 76, ratePercent: 6.4 }
]
```

不要一上来就拆成三份数组。

更稳的做法是保持对象数组，再用 `encode` 映射：

```js
export const createTrafficOption = (source) => ({
  dataset: {
    source
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    type: 'scroll'
  },
  grid: {
    top: 56,
    right: 48,
    bottom: 56,
    left: 32,
    containLabel: true
  },
  xAxis: {
    type: 'category'
  },
  yAxis: [
    {
      type: 'value',
      name: '访问量'
    },
    {
      type: 'value',
      name: '转化率',
      axisLabel: {
        formatter: '{value}%'
      }
    }
  ],
  dataZoom: [
    { type: 'inside' },
    { type: 'slider' }
  ],
  series: [
    {
      name: '访问量',
      type: 'bar',
      yAxisIndex: 0,
      encode: {
        x: 'date',
        y: 'visits',
        tooltip: ['date', 'visits', 'orders', 'ratePercent']
      }
    },
    {
      name: '转化率',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      encode: {
        x: 'date',
        y: 'ratePercent',
        tooltip: ['date', 'visits', 'orders', 'ratePercent']
      }
    }
  ],
  aria: {
    show: true
  }
})
```

这个模板已经包含了真实项目里很常见的能力：

- 柱线组合
- 双 y 轴
- `dataset`
- `encode`
- `legend`
- `tooltip`
- `dataZoom`
- 无障碍 `aria`

主人后面写业务页时，先复制这个骨架，再按需求删减，比从空对象慢慢凑更稳。

---

## 五、页面里这样接数据

业务页可以长这样：

```vue
<template>
  <BaseChart
    :option='chartOption'
    :loading='loading'
    :empty='!loading && source.length === 0'
    @chart-click='handleChartClick'
  />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseChart from '@/components/BaseChart.vue'
import { createTrafficOption } from '@/charts/trafficOption'

const loading = ref(false)
const source = ref([])

const chartOption = computed(() => createTrafficOption(source.value))

const loadData = async () => {
  loading.value = true

  try {
    const result = await fetch('/api/dashboard/traffic')
    source.value = await result.json()
  } finally {
    loading.value = false
  }
}

const handleChartClick = (params) => {
  console.log('当前点击维度：', params.name)
}

onMounted(() => {
  loadData()
})
</script>
```

真实项目里再把 `fetch` 换成自己的请求方法就行。

这里的关键不是代码多漂亮，而是职责清楚：

- 业务页负责拉接口
- `createTrafficOption` 负责生成配置
- `BaseChart` 负责渲染、尺寸、loading、空态和事件出口

这套结构后面比较好维护。

---

## 六、选图时按问题走，不按喜好走

主人接需求时可以直接这样问：

| 用户想回答的问题 | 先选 |
|------------------|------|
| 这段时间涨了还是跌了 | 折线图 |
| 哪个分类最高 | 柱状图或条形图 |
| 总体里每部分占多少 | 饼图或环形图 |
| 两个指标有没有关系 | 散点图 |
| 既要看量又要看率 | 柱线组合图 |
| 数据点太多想局部查看 | 折线图或柱状图加 `dataZoom` |
| 想按地区看强弱 | 地图或热力图 |

如果产品说“来个酷一点的图”，主人可以温柔但坚定地反问：

**这张图最重要是看趋势、对比、占比，还是关系？**

这个问题一问，图表类型通常就自己浮出来了。像水里的小海獭探头，挺可爱，但也挺实用。

---

## 七、交互配置先上最小成熟组合

后台分析页里，最稳的第一套交互是：

```js
tooltip: {
  trigger: 'axis',
  axisPointer: {
    type: 'cross'
  }
},
legend: {
  type: 'scroll'
},
dataZoom: [
  { type: 'inside' },
  { type: 'slider' }
]
```

适合：

- 多系列折线图
- 柱线组合图
- 时间跨度比较长的趋势图
- 需要横向对比多个指标的分析页

如果是饼图或单个散点，`tooltip.trigger` 通常改成：

```js
tooltip: {
  trigger: 'item'
}
```

一句话：

**多系列同一类目一起看，用 `axis`；单个图形元素自己解释自己，用 `item`。**

---

## 八、联动时记住事件和动作分工

ECharts 里联动最关键的是两类能力：

- `chart.on(...)`
  - 接收用户做了什么

- `chart.dispatchAction(...)`
  - 用代码主动让图表做什么

比如列表 hover 联动图表：

```js
const focusData = (chart, dataIndex) => {
  chart.dispatchAction({
    type: 'downplay',
    seriesIndex: 0
  })

  chart.dispatchAction({
    type: 'highlight',
    seriesIndex: 0,
    dataIndex
  })

  chart.dispatchAction({
    type: 'showTip',
    seriesIndex: 0,
    dataIndex
  })
}
```

典型联动场景：

- 点图表刷新表格
- 表格 hover 高亮图表
- 图例切换同步数字卡片
- `dataZoom` 后刷新明细列表
- 点击柱子进入下一级钻取

项目心法：

**图表交互最后要变成业务状态，不要让图表自己在角落里独自开心。**

---

## 九、上线前排错清单

如果图表没出来，按这个顺序排：

1. 容器有没有宽高
2. 是否在容器可见后再初始化
3. 按需引入时有没有注册渲染器
4. 有没有注册对应图表类型，比如 `LineChart`、`BarChart`
5. 有没有注册对应组件，比如 `GridComponent`、`TooltipComponent`、`DatasetComponent`
6. `xAxis`、`yAxis`、`series.type` 是否匹配
7. `dataset.source` 字段名是否和 `encode` 对上
8. 图例名字和系列 `name` 是否清楚
9. 长数据是否需要 `dataZoom`
10. 组件卸载时是否释放实例或交给 `vue-echarts` 管理

如果 tooltip、标题、label 里用了外部数据，再加一条：

**不要直接拼不可信 HTML。**

官方安全文档明确提醒，`tooltip`、`dataView` 等入口如果允许原始 HTML，就要注意注入风险。

---

## 十、性能和渲染器怎么先做第一判断

不要一上来就神经紧绷地优化。

先按这个顺序：

1. 普通业务图，先用 `CanvasRenderer`
2. 数据点明显很多，再考虑采样、缩放、减少动画
3. 同页图表实例很多、图形元素不复杂时，再评估 `SVGRenderer`
4. 高频更新或大图表，再考虑 `manual-update`
5. 页面切换、标签页显示隐藏后，注意触发 resize

官方 `Canvas vs. SVG` 的重点可以简化成：

**大数据优先 Canvas，多实例轻量图可以评估 SVG。**

---

## 十一、安全、无障碍和可维护性别最后才补

项目开发很容易只盯着图有没有画出来。

但正式页面至少要顺手考虑这几件事：

- 不可信数据不要直接拼 HTML
- 需要读屏支持时注册 `AriaComponent` 并开启 `aria.show`
- 颜色不要只靠红绿区分
- 轴单位、tooltip 单位、百分比格式要写清楚
- 空数据、加载中、接口失败都要有状态
- 图表配置最好放到独立文件或工厂函数里

这些不是“高级洁癖”，而是后面少加班的护身符。

---

## 十二、一张图从 0 到上线的路线

主人后面可以直接照这个流程走：

1. 明确这张图回答什么业务问题
2. 选图：趋势、对比、占比、关系、组合
3. 确定接口字段和展示字段
4. 把接口数据整理成 `dataset.source`
5. 用 `encode` 绑定 x、y、tooltip
6. 加 `tooltip`、`legend`、`grid`
7. 数据多时加 `dataZoom`
8. Vue 项目里放进 `BaseChart`
9. 加 loading、empty、error 状态
10. 做点击、legend、datazoom 等业务联动
11. 检查容器尺寸、移动端、resize
12. 检查安全、无障碍和单位格式

这 12 步走完，一张图就从“能画出来”变成“能放进项目里用”。

---

## 十三、这一篇看完后，主人直接带走什么

就带走这 8 句：

1. Vue 3 + Vite 项目优先用 `echarts + vue-echarts`
2. 按需引入时别漏图表类型、组件和渲染器
3. 先封 `BaseChart`，别把图表散写在页面里
4. 真实接口优先整理成 `dataset.source`
5. 字段映射优先写 `encode`
6. 多系列分析页先配 `tooltip + legend + dataZoom`
7. 联动靠 `chart.on` 接收操作，靠 `dispatchAction` 主动驱动
8. 上线前一定查容器尺寸、模块注册、数据映射、安全和空态

---

## 十四、官方参考

- Apache ECharts 官网：<https://echarts.apache.org/>
- Get Started：<https://echarts.apache.org/handbook/en/get-started/>
- Import：<https://echarts.apache.org/handbook/en/basics/import/>
- Chart Container and Size：<https://echarts.apache.org/handbook/en/concepts/chart-size/>
- Dataset：<https://echarts.apache.org/handbook/en/concepts/dataset/>
- Data Transform：<https://echarts.apache.org/handbook/en/concepts/data-transform/>
- Dynamic Data：<https://echarts.apache.org/handbook/en/how-to/data/dynamic-data/>
- Event and Action：<https://echarts.apache.org/handbook/en/concepts/event/>
- Legend：<https://echarts.apache.org/handbook/en/concepts/legend/>
- Axis：<https://echarts.apache.org/handbook/en/concepts/axis/>
- Canvas vs. SVG：<https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/>
- Security Guidelines：<https://echarts.apache.org/handbook/en/best-practices/security/>
- Aria：<https://echarts.apache.org/handbook/en/best-practices/aria/>
- ECharts Releases：<https://github.com/apache/echarts/releases>
- Vue ECharts README：<https://github.com/ecomfe/vue-echarts>
- Vue ECharts Releases：<https://github.com/ecomfe/vue-echarts/releases>
