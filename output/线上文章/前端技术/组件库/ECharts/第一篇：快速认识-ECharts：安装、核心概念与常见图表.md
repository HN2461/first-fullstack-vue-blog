---
title: "第一篇：快速认识 ECharts：安装、核心概念与常见图表"
slug: "echarts-echarts-echarts-aca8614a"
summary: "基于 2026-05-02 查阅的 Apache ECharts 官方首页、Handbook、Releases 与安全/无障碍文档，系统讲清 ECharts 的定位、最新版本脉络、安装方式、option 思维、dataset、动态更新、交互、性能与 Vue 项目接入要点。"
category: "ECharts"
tags:
  - "ECharts"
  - "数据可视化"
  - "图表库"
  - "Vue3"
  - "Canvas"
  - "SVG"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5c4"
originalSlug: "echarts-echarts-echarts-aca8614a"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第一篇：快速认识 ECharts：安装、核心概念与常见图表

> 主人前面已经把 `Element Plus` 和 `uv-ui` 都收进“组件库”这条线了。  
> 接下来再补 `ECharts`，刚好就是把“页面组件”和“数据图表”这两条前端高频能力拼完整。

这一篇我按 **2026-05-02** 查到的 **Apache ECharts 官方资料** 来写。

目标不是只教你抄一个 demo，  
而是先把这套图表库的 **位置、思维方式、上手步骤、常见坑和学习顺序** 一次讲清。

---

## 一、先记住一句话

`ECharts` 可以先理解成：

**一套把数据快速画成交互式图表的前端可视化库。**

它擅长的不是“按钮、表单、弹窗”，而是：

- 折线图
- 柱状图
- 饼图
- 散点图
- 雷达图
- 热力图
- 地图
- 关系图
- 桑基图
- 仪表盘
- 树图、矩形树图

如果 `Element Plus` 解决的是“后台页面怎么搭”，  
那 `ECharts` 解决的就是：

**后台里的数据，怎么展示得清楚、好看、还能交互。**

---

## 二、这次我查了哪些官方资料

我这次主要看的是这些官方入口：

- Apache ECharts 官网首页
- Handbook 的 `Get Started`
- Handbook 的 `Download`
- Handbook 的 `Import`
- Handbook 的 `Chart Container and Size`
- Handbook 的 `Dataset`
- Handbook 的 `Dynamic Data`
- Handbook 的 `Event and Action`
- Handbook 的 `Style`
- Handbook 的 `Canvas vs. SVG`
- Handbook 的 `Security Guidelines`
- Handbook 的 `Aria`
- GitHub 官方 `Releases` 页面
- 官方 `ECharts 6 Features`

从这些资料能先得到几个重要结论：

1. 官网明确把它定位成一套 **开源 JavaScript 可视化库**，而且强调 **PC 和移动端都可用**
2. 官网首页明确写到，它开箱就提供 **20 多种图表类型** 和 **十多个组件**
3. 官方 `Releases` 页面里，我在 **2026-05-02** 查到的页首版本是 **`6.0.0`**
4. Handbook 明确说明：如果你想减小包体，应该优先走 **按需引入 / tree-shaking**
5. Handbook 也明确提醒：图表容器在 `echarts.init` 前 **必须先有宽高**

所以主人后面如果看到一些旧教程，  
要先留个心眼：

- 有些教程还是 `v4` / `v5` 写法
- 有些示例默认把所有模块整包引入
- 有些文章不讲容器尺寸、销毁实例、安全和无障碍

这几类资料都容易让小白一开始就踩坑。

---

## 三、ECharts 最适合放在什么项目场景里

它最常见的落点有这些：

- 后台管理系统的数据看板
- 运营分析页
- 销售统计页
- 财务趋势页
- 设备监控页
- 大屏可视化页
- 报表页
- 地图分布页

如果你的页面里经常出现这些问题，就说明 `ECharts` 值得学：

- “这组数据用表格看太累了”
- “我要看趋势，不只是看数字”
- “我要能缩放、悬浮查看、筛选分类”
- “我要在一张图里联动多种维度”

---

## 四、它和别的图表库有什么区别

主人先不用一开始就把所有图表库都背下来。

先记一个最实用的判断：

- 如果你是做 `Vue` / `React` / 原生后台页面里的通用业务图表，`ECharts` 很常见
- 如果你要的是更偏设计型、声明式、轻封装的小图表，也有人选别的库
- 如果你面对的是中国前端生态里的后台、报表、看板项目，`ECharts` 的出现频率非常高

它的强项通常在这些地方：

- 图表类型多
- 交互能力强
- 配置项成熟
- 社区资料多
- 地图、关系图、数据缩放、视觉映射这些进阶能力比较全

---

## 五、安装方式先分清

官方 `Download` 和 `Import` 文档里，核心就三种思路。

### 1. 最快上手：整包引入

适合你现在这种“先把体系学明白”的阶段。

```bash
npm install echarts
```

然后在项目里：

```js
import * as echarts from 'echarts'
```

优点：

- 最省脑子
- 很多示例都能直接照着跑

缺点：

- 包体更大

---

### 2. 更像正式项目：按需引入

官方 `Import` 文档明确支持 tree-shaking。

大概思路是：

```js
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  CanvasRenderer
])
```

主人先记重点：

- `echarts/core` 是核心入口
- 图表类型从 `echarts/charts` 拿
- 坐标轴、标题、提示框、图例、数据集等从 `echarts/components` 拿
- **渲染器一定要自己注册**

这个“渲染器一定要自己注册”，很容易漏。

官方文档已经明确提示：

- 你要选 `CanvasRenderer`
- 或者选 `SVGRenderer`

少了这一步，图通常起不来。

---

### 3. CDN / 直接下载

更适合：

- 纯静态页 demo
- 临时验证
- 不走工程化的简单页面

但如果主人后面是在 `Vue 3 + Vite` 项目里长期用，  
还是更推荐 `npm` 方案。

---

## 六、ECharts 最基本的运行模型是什么

你可以把它先记成三步：

1. 准备一个有宽高的容器
2. `echarts.init(dom)` 创建实例
3. `chart.setOption(option)` 把配置和数据喂进去

最小示意：

```html
<div id='sales-chart' style='width: 100%; height: 360px'></div>
```

```js
import * as echarts from 'echarts'

const chart = echarts.init(document.getElementById('sales-chart'))

chart.setOption({
  title: {
    text: '近七日销售额'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '销售额',
      type: 'line',
      smooth: true,
      data: [120, 180, 160, 240, 300, 260, 320]
    }
  ]
})
```

这个例子虽然简单，但里面已经出现了最核心的五类角色：

- `title`
- `tooltip`
- `xAxis`
- `yAxis`
- `series`

后面你学再复杂的图，本质上也还是在这几类角色上继续扩展。

---

## 七、一定先理解 `option` 思维

很多小白学 ECharts 卡住，不是因为不会写代码，  
而是因为脑子里没有 `option` 这张地图。

你可以把 `option` 理解成：

**“这张图要怎么长、怎么显示、怎么交互、数据从哪来”的总配置对象。**

它最常见的几块是：

- `title`
  - 图标题

- `tooltip`
  - 鼠标移上去时弹出的提示框

- `legend`
  - 图例，可点选显隐

- `grid`
  - 笛卡尔坐标系里图的绘图区范围

- `xAxis` / `yAxis`
  - 坐标轴

- `dataset`
  - 更结构化的数据源

- `series`
  - 真正画图的部分，折线、柱状、饼图等都在这里

- `dataZoom`
  - 数据缩放

- `visualMap`
  - 视觉映射，比如颜色深浅随值变化

所以以后看一个图表配置，先别慌。

先问自己四件事：

1. 这张图的数据从哪里进来
2. 用了哪种坐标系
3. `series.type` 是什么
4. 有没有额外交互，比如 tooltip、legend、dataZoom

只要这四件事清楚，`option` 就不会显得乱。

---

## 八、主人最该先学哪些图表类型

官方首页虽然说有 20 多种图表，  
但学习顺序别一上来就全扑。

先学这几类，性价比最高。

### 1. 折线图 `line`

适合看：

- 趋势
- 变化
- 连续时间序列

比如：

- 日活
- 销售额趋势
- 温度变化
- 接口耗时

---

### 2. 柱状图 `bar`

适合看：

- 分类对比
- 排名
- 同类项之间的高低差

比如：

- 各部门业绩
- 各城市订单量
- 各渠道注册数

---

### 3. 饼图 `pie`

适合看：

- 占比
- 构成

但主人先记一句：

**饼图不是万能图。**

分类很多、差值很接近时，饼图往往不如柱状图清楚。

---

### 4. 散点图 `scatter`

适合看：

- 两个数值维度之间的关系
- 离群点
- 聚类趋势

比如：

- 用户年龄和消费额
- 身高和体重
- 曝光和转化

---

### 5. 雷达图 `radar`

适合看：

- 多维能力对比

比如：

- 员工能力画像
- 产品维度打分
- 模型指标对比

---

### 6. 热力图、地图、关系图、桑基图

这几类更偏进阶，但很有业务价值：

- `heatmap`
  - 看密度、强弱、矩阵类数据

- `map`
  - 看地区分布

- `graph`
  - 看节点关系

- `sankey`
  - 看流向

主人现在第一阶段，先把 `line + bar + pie + scatter` 学会，  
就已经能覆盖很多后台页面需求了。

---

## 九、`dataset` 才是后面越学越香的关键

官方 `Dataset` 文档特别重要。

因为很多人一开始只会这样写：

```js
series: [
  {
    type: 'bar',
    data: [120, 200, 150]
  }
]
```

这在 demo 阶段没问题。

但一到正式项目，后端给你的数据往往不是这么“刚好能喂进去”的。

这时候 `dataset` 的价值就出来了。

你可以把它理解成：

**先把原始数据整理成表，再告诉 ECharts 每一列映射到哪里。**

比如：

```js
option = {
  dataset: {
    source: [
      ['日期', '访问量', '成交量'],
      ['周一', 320, 18],
      ['周二', 280, 12],
      ['周三', 360, 26]
    ]
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {},
  xAxis: {
    type: 'category'
  },
  yAxis: {},
  series: [
    { type: 'bar' },
    { type: 'line' }
  ]
}
```

这样做有几个好处：

- 数据结构更像表格，容易读
- 多个系列可以共用一份源数据
- 后面接 `encode`、`transform`、`visualMap` 会更顺

官方文档里还特别讲了两个关键点：

- `seriesLayoutBy`
  - 你要按“列”映射还是按“行”映射

- `series.encode`
  - 哪一列映射到 `xAxis`、哪一列映射到 `yAxis`、哪一列给 `tooltip`

主人先把这句话记住：

**写 demo 可以先直接写 `series.data`，做中大型项目尽量早点转到 `dataset` 思维。**

---

## 十、动态数据更新其实没有想象中复杂

官方 `Dynamic Data` 文档讲得很直白：

**ECharts 是数据驱动的，数据变了，再 `setOption` 就行。**

最常见场景有两个。

### 1. 首次异步拉数据

先初始化空图，再把接口数据填进去。

```js
chart.showLoading()

fetch('/api/dashboard/sales')
  .then((res) => res.json())
  .then((data) => {
    chart.hideLoading()
    chart.setOption({
      xAxis: {
        data: data.days
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          data: data.values
        }
      ]
    })
  })
```

---

### 2. 定时刷新

比如：

- 实时监控
- 每分钟更新一次报表
- 数据轮询

本质也是继续 `setOption`。

官方文档还特别建议：

**更新系列时尽量带上 `name`，方便 ECharts 更稳定地找到你要更新的是哪一组。**

这点很实用。

---

## 十一、交互不是只有 hover

很多人以为 ECharts 的交互只有鼠标移上去弹 `tooltip`。

其实官方 `Event and Action` 文档里讲得很清楚：

它有两大块：

### 1. 事件 `chart.on(...)`

比如你可以监听：

- `click`
- `legendselectchanged`
- `datazoom`

常见写法：

```js
chart.on('click', (params) => {
  console.log('你点中了', params.name)
})
```

如果你要更精确，还可以按组件或系列类型过滤。

---

### 2. 主动触发行为 `dispatchAction(...)`

这一步很关键。

它意味着：

**不只是用户能操作，代码也能主动驱动图表行为。**

比如你可以：

- 主动高亮某个数据点
- 主动显示 tooltip
- 主动切换 legend 选中状态
- 主动控制数据区域缩放

示意：

```js
chart.dispatchAction({
  type: 'showTip',
  seriesIndex: 0,
  dataIndex: 2
})
```

这类能力在这些场景特别有用：

- 轮播高亮
- 图表联动
- 列表和图表联动
- 大屏自动播报

---

## 十二、坐标轴、图例、缩放是最常见的“实战配置”

官方 `Axis` 和 `Legend` 文档里，有几件事特别值得先记住。

### 1. 坐标轴不是只有 `xAxis.data`

坐标轴还能管：

- `type`
  - `category`、`value`、`time`、`log`

- `name`
  - 轴标题

- `axisLabel`
  - 刻度文字格式

- `axisLine`
  - 轴线样式

- `axisTick`
  - 刻度线样式

官方还明确提到：

- 当时间跨度很大时，可以加 `dataZoom`
- 一张图里也可以同时有多个 `yAxis`

这对“柱状图 + 折线图双轴联动”很常用。

---

### 2. 图例 `legend` 不只是摆设

图例可以：

- 标识系列
- 让用户点选显隐
- 太多时切成滚动图例

官方甚至专门提醒：

**如果图里其实只有一种数据，有时直接用标题说明，比硬放图例更清楚。**

这个提醒很细，但很专业。

---

## 十三、样式别只会改颜色

官方 `Style` 文档把样式入口拆得很清楚。

你可以从四个层次去理解：

### 1. 主题 `theme`

比如直接用：

```js
const chart = echarts.init(dom, 'dark')
```

官方也支持你注册自定义主题。

---

### 2. 调色板 `color`

可以全局给一组配色，  
也可以给某个 `series` 单独配。

---

### 3. 显式样式

常见就是这些：

- `itemStyle`
- `lineStyle`
- `areaStyle`
- `label`

也就是：

- 点、柱、扇区长什么样
- 线长什么样
- 面积区域长什么样
- 文字怎么显示

---

### 4. 视觉映射 `visualMap`

这是做“数值越大颜色越深”“分段着色”“气泡大小随值变化”时非常常见的入口。

---

### 5. 顺手提一下 ECharts 6

我查官方 `ECharts 6 Features` 时，  
里面重点提到了这些方向：

- 新默认主题
- 动态主题切换
- 暗黑模式支持
- 散点抖动
- 断轴
- 金融图表增强
- 新矩阵坐标系
- 自定义系列增强
- 坐标轴标签防溢出优化

主人现在先不用把这些全部吃完。

先知道一个方向就够：

**新版本已经不只是“能画图”，而是在往更复杂、更工程化、更专业的可视化场景走。**

---

## 十四、`Canvas` 还是 `SVG`，别随便选

官方专门有一篇 `Canvas vs. SVG`。

先记最实用的结论：

### 默认一般先用 `Canvas`

更适合：

- 元素很多
- 大数据量
- 热力图
- 大规模散点、折线
- 更强调性能

---

### `SVG` 更适合一些轻量场景

比如：

- 图形元素不算特别多
- 你更关心某些缩放清晰度或 DOM 级特性

初始化时可以这样选：

```js
const chart = echarts.init(dom, null, {
  renderer: 'svg'
})
```

如果是默认：

```js
const chart = echarts.init(dom, null, {
  renderer: 'canvas'
})
```

或者直接不写，默认就是 `canvas`。

---

## 十五、容器宽高、`resize`、`dispose` 是三大高频坑

官方 `Chart Container and Size` 文档里，把这几个坑讲得非常明确。

### 1. 初始化前容器必须有宽高

如果 `div` 没高度，  
很多人第一反应会以为“ECharts 没渲染成功”。

其实经常只是容器高度是 `0`。

---

### 2. 页面尺寸变了，要记得 `resize()`

官方建议监听尺寸变化后调用：

```js
chart.resize()
```

而且官方还特别提醒：

有些场景不是窗口大小变了，而是容器本身被 JS/CSS 改了尺寸。  
这时单靠 `window.resize` 不够，适合配合 `ResizeObserver`。

---

### 3. 页面销毁时要 `dispose()`

如果图表所在 DOM 被移除，  
实例最好一起销毁，不然容易有内存泄漏或重复初始化问题。

这在 `Vue`、`React` 单页应用里尤其重要。

---

## 十六、在 Vue 3 + Vite 项目里怎么理解最稳

主人这个博客本身就是 `Vue 3 + Vite`，  
所以我直接按这个心智来讲。

最稳的思路就是：

1. `onMounted` 里初始化
2. 容器先写死或算出高度
3. 数据变更时更新 `setOption`
4. `onBeforeUnmount` 里 `dispose`

一个简化版组件思路：

```vue
<template>
  <div ref='chartRef' class='chart-box'></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chart = null

onMounted(() => {
  chart = echarts.init(chartRef.value)

  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'bar',
        data: [120, 200, 150, 80, 70]
      }
    ]
  })
})

onBeforeUnmount(() => {
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.chart-box {
  width: 100%;
  height: 360px;
}
</style>
```

这已经是很多业务项目能稳定工作的基础版了。

如果后面要继续封装，可以再往这几个方向走：

- 把 `option` 作为 `props`
- 用 `ResizeObserver` 自动自适应
- 封装 loading / 空态 / 错误态
- 做主题切换
- 做图表组件复用

---

## 十七、安全这块别完全忽略

官方 `Security Guidelines` 很值得看。

很多人会以为图表库只是画图，不太会有安全问题。

但官方明确提醒了一个边界：

`ECharts` 大部分普通文本输入本身不会被当成代码执行，  
但有些能力允许你塞入：

- 原始 HTML
- 原始 URL

官方举例里点到的典型位置有：

- `tooltip`
- `dataView`

所以主人后面如果图表里的内容来自：

- 用户输入
- 外部系统返回
- 可被污染的后端字段

那就不要随便把原始 HTML 直接拼进去。

一句话总结：

**普通数据大多没事，原始 HTML / URL / JS 函数型入口要格外小心。**

---

## 十八、无障碍不是“有空再说”

官方 `Aria` 文档里讲得很清楚：

- 从 `ECharts 5` 开始，`aria` 组件不再默认导入
- 如果你要无障碍支持，要手动引入 `AriaComponent`
- 然后再开 `aria.show: true`

最实用的理解就是：

**图表不只是给眼睛看，也应该尽量让读屏设备能描述它。**

如果你做的是：

- 政务
- 教育
- 企业级平台
- 对无障碍有要求的项目

这块就值得早点纳入习惯。

---

## 十九、主人现在最该怎么学，效率最高

我建议你按这个顺序走。

### 第一步：先把这篇吃透

目标不是记配置项，  
而是搞清：

- 图表实例怎么建立
- `option` 是什么
- `series`、坐标轴、tooltip、legend 各负责什么

---

### 第二步：只练四种图

- 折线图
- 柱状图
- 饼图
- 散点图

把这四种写顺，比你泛泛看十几种图更有用。

---

### 第三步：开始用 `dataset`

因为一旦开始接真实接口，  
你很快就会发现“后端数据结构”和“图表数据结构”不是一回事。

---

### 第四步：补交互和联动

重点学：

- `legend`
- `dataZoom`
- `chart.on`
- `dispatchAction`

---

### 第五步：补性能和封装

重点看：

- `Canvas` vs `SVG`
- `resize`
- `dispose`
- Vue 组件封装

---

## 二十、这一篇你看完后，脑子里应该留下什么

至少留下这 10 句：

1. `ECharts` 是前端常见的数据可视化库，不是页面组件库
2. 它最核心的入口是 `echarts.init` 和 `setOption`
3. 图表容器必须先有宽高
4. `option` 是整张图的总配置
5. `series.type` 决定你画什么图
6. 真项目里尽量早点转向 `dataset`
7. 动态更新本质就是继续 `setOption`
8. 交互不只有 hover，还有事件和 `dispatchAction`
9. 页面尺寸变化要 `resize`，页面销毁要 `dispose`
10. 正式项目还要考虑包体、安全、无障碍和渲染器选择

---

## 二十一、官方参考资料

下面这些都是我这次写这篇时重点参考的官方资料，主人后面继续深挖时，直接从这里接着看最稳：

- 官网首页：<https://echarts.apache.org/>
- Get Started：<https://echarts.apache.org/handbook/en/get-started/>
- Download：<https://echarts.apache.org/handbook/en/basics/download/>
- Import：<https://echarts.apache.org/handbook/en/basics/import/>
- Chart Container and Size：<https://echarts.apache.org/handbook/en/concepts/chart-size/>
- Dataset：<https://echarts.apache.org/handbook/en/concepts/dataset/>
- Dynamic Data：<https://echarts.apache.org/handbook/en/how-to/data/dynamic-data/>
- Event and Action：<https://echarts.apache.org/handbook/en/concepts/event/>
- Style：<https://echarts.apache.org/handbook/en/concepts/style/>
- Canvas vs. SVG：<https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/>
- Security Guidelines：<https://echarts.apache.org/handbook/en/best-practices/security/>
- Aria：<https://echarts.apache.org/handbook/en/best-practices/aria/>
- ECharts 6 Features：<https://echarts.apache.org/handbook/en/basics/release-note/v6-feature/>
- GitHub Releases：<https://github.com/apache/echarts/releases>
