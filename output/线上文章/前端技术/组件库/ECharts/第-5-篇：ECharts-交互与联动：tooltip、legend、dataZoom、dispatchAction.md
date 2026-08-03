---
title: "第 5 篇：ECharts 交互与联动：tooltip、legend、dataZoom、dispatchAction"
slug: "echarts-echarts-tooltip-legend-datazoom-dispatchaction-f27b2d4a"
summary: "基于 2026-05-02 查阅的 Apache ECharts 官方 Event and Action、Legend、Axis、Chart Size、Intelligent Pointer Snapping 与 Feature 文档，系统讲清 tooltip、legend、dataZoom、事件监听、dispatchAction、双轴和移动端指针优化，帮助前端快速做出真正能分析、能联动的后台图表。"
category: "ECharts"
categoryPath:
  - "前端技术"
  - "组件库"
  - "ECharts"
tags:
  - "ECharts"
  - "legend"
  - "dataZoom"
  - "dispatchAction"
  - "图表联动"
  - "Tooltip"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5e2"
originalSlug: "echarts-echarts-tooltip-legend-datazoom-dispatchaction-f27b2d4a"
originalStatus: "published"
publishedAt: "2026-05-02T08:36:26.616Z"
updatedAt: "2026-07-31T11:16:23.559Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 5 篇：ECharts 交互与联动：tooltip、legend、dataZoom、dispatchAction

> 主人前面几篇已经把“图怎么选、数据怎么喂、组件怎么封”理顺了。  
> 接下来真正让图表像项目成品的，往往不是再多加一种图，而是把 **交互和联动** 做顺。

这一篇我按 **2026-05-02** 查到的 Apache ECharts 官方资料来写，重点参考：

- `Event and Action`
- `Legend`
- `Axis`
- `Chart Container and Size`
- `Intelligent Pointer Snapping`
- 官方 `Features`

这一篇的目标很明确：

- 让你知道后台分析页里最常用的交互能力怎么配
- 让你知道 `tooltip`、`legend`、`dataZoom` 各自解决什么问题
- 让你知道怎么监听事件、怎么用代码主动驱动图表
- 让你知道图表和图表、图表和列表之间怎么联动

---

## 一、先记住一句话

图表从“能看”到“能分析”，通常就差这几样：

- `tooltip`
- `legend`
- `dataZoom`
- 事件监听
- `dispatchAction`

前两项解决“看得清”，  
后两项解决“能操作”和“能联动”。

---

## 二、`tooltip` 是最先该补上的交互

很多人一开始把 `tooltip` 当成“鼠标移上去弹个框”。

但项目里它的价值远不止这个。

它本质上是在解决：

- 当前点到底对应哪条数据
- 一次能不能把多个系列放在一起看
- 当前分类下不同指标怎么对照

### 1. 最常见的两个触发方式

#### `trigger: 'item'`

更适合：

- 饼图
- 散点图
- 单点解释更重要的图

```js
tooltip: {
  trigger: 'item'
}
```

#### `trigger: 'axis'`

更适合：

- 折线图
- 柱状图
- 组合图
- 多系列对比图

```js
tooltip: {
  trigger: 'axis'
}
```

主人先记最实用的判断：

- 一个点自己看自己，用 `item`
- 同一类目下多条线/多根柱一起比，用 `axis`

---

## 三、`axisPointer` 是让 `tooltip` 更像分析工具

官方 `Axis` 示例里很常见：

```js
tooltip: {
  trigger: 'axis',
  axisPointer: {
    type: 'cross'
  }
}
```

这个配置的价值是：

- 不只是看到 tooltip
- 还能看到当前横纵轴落点
- 对双轴图和趋势分析尤其友好

最常见的 `axisPointer.type`：

- `line`
  - 一根线

- `shadow`
  - 一整块阴影

- `cross`
  - 十字准星

项目里最常用的经验是：

- 折线图、双轴图常用 `cross`
- 柱状图常用 `shadow`

---

## 四、`legend` 不是装饰，是最轻量的筛选器

官方 `Legend` 文档明确强调：

- 图例用来解释不同系列
- 点击图例可以显示或隐藏对应分类

这件事在后台图表里特别实用。

### 最基本写法

```js
legend: {}
```

只要系列名清楚，很多时候就已经能正常用。

### 常见布局

```js
legend: {
  orient: 'vertical',
  right: 10,
  top: 'center'
}
```

如果图例很多，官方推荐：

```js
legend: {
  type: 'scroll'
}
```

这个对品类多、渠道多、地区多的分析页非常重要。

---

## 五、图例事件 `legendselectchanged` 很常用

官方 `Event and Action` 文档特别点出来一个细节：

- 图例切换时触发的是 `legendselectchanged`
- 不是 `legendselected`

这点很容易记错。

监听方式：

```js
chart.on('legendselectchanged', (params) => {
  const currentSelected = params.selected
  console.log(currentSelected)
})
```

这在项目里可以做很多事：

- 同步外部筛选状态
- 联动旁边的数字卡片
- 记录用户当前只看哪些系列

---

## 六、`dataZoom` 是大时间跨度图表的必备件

官方 `Axis` 文档里明确提到：

当 x 轴跨度很大时，可以用 zoom 的方式只显示一部分数据。

这就是 `dataZoom` 最核心的落点。

### 最常见的两种

#### 1. 滑块型

```js
dataZoom: [
  {
    type: 'slider'
  }
]
```

#### 2. 内置缩放型

```js
dataZoom: [
  {
    type: 'inside'
  }
]
```

很多项目里会两个一起上：

```js
dataZoom: [
  { type: 'inside' },
  { type: 'slider' }
]
```

这样鼠标滚轮、手势和底部滑块都能用。

---

## 七、什么时候必须上 `dataZoom`

只要你出现这些情况，就该优先想到它：

- 时间跨度很长
- 数据点很多
- 用户需要查看局部区间
- 趋势图被压得太密

典型场景：

- 近一年日活
- 过去 90 天销售趋势
- 设备监控时序图
- K 线或资金走势

---

## 八、事件监听是把图表接进业务逻辑的入口

官方 `Event and Action` 文档把事件分成两类：

1. 鼠标类事件
2. 组件交互类事件

### 1. 鼠标类事件

官方列出的常见事件有：

- `click`
- `dblclick`
- `mousedown`
- `mousemove`
- `mouseup`
- `mouseover`
- `mouseout`
- `globalout`
- `contextmenu`

最常用的还是：

```js
chart.on('click', (params) => {
  console.log(params.name)
})
```

这个在项目里常拿来做：

- 点击柱子进入详情页
- 点击扇区切换列表
- 点击点位打开弹窗

### 2. 组件交互类事件

最常见的是：

- `legendselectchanged`
- `datazoom`

这类事件的价值在于：

**你不仅知道“点了什么”，还知道“图现在处于什么交互状态”。**

---

## 九、`dispatchAction` 是联动能力的核心

如果说事件监听是“接收用户操作”，  
那 `dispatchAction` 就是“主动驱动图表行为”。

官方文档里最经典的例子就是：

- 先取消旧高亮
- 再高亮当前项
- 再显示当前项的 tooltip

你可以把它理解成：

**代码也能像用户一样操作图表。**

### 最常见的动作

- `highlight`
- `downplay`
- `showTip`
- `hideTip`
- `legendSelect`
- `legendUnSelect`
- `dataZoom`

### 最典型例子：轮播高亮

```js
chart.dispatchAction({
  type: 'highlight',
  seriesIndex: 0,
  dataIndex: 2
})

chart.dispatchAction({
  type: 'showTip',
  seriesIndex: 0,
  dataIndex: 2
})
```

这在这些场景特别常见：

- 大屏自动播报
- 首页轮播重点指标
- 图表和表格 hover 联动

---

## 十、图表和图表怎么联动

最常见的联动并不复杂。

### 1. 图例联动

一个图例切换后，  
旁边图也跟着切系列。

### 2. 区域缩放联动

主图 `dataZoom` 后，  
辅图或明细列表同步跟着只看当前区间。

### 3. 高亮联动

左侧列表 hover 某条数据时，  
右侧图表自动 `highlight + showTip`。

### 4. 钻取联动

点击柱子后：

- 更新下一级图
- 刷新列表
- 改标题 breadcrumb

这类联动做出来，图表页面的项目感会明显增强。

---

## 十一、图表和列表联动，比图表和图表联动更常见

前端项目里很常见的真实结构其实是：

- 左边图
- 右边表

或者：

- 上面图
- 下面明细列表

这时候最顺的做法通常是：

1. 图表点击触发 `click`
2. 从 `params` 里拿当前维度值
3. 更新外部状态
4. 表格按这个状态重新查询或过滤

也就是说：

**图表不要自己吞掉交互，要把交互变成业务状态。**

---

## 十二、双轴图的交互配置要更细一点

官方 `Axis` 示例里很典型地用了：

- 两个 `yAxis`
- `tooltip.trigger = 'axis'`
- `axisPointer.type = 'cross'`

双轴图最适合的场景是：

- 一边看量
- 一边看率

比如：

- 订单量 + 转化率
- 销售额 + 毛利率
- 降雨量 + 温度

要点就三个：

1. 两组数据量纲要真的不同
2. tooltip 要能同时对照
3. 轴标题和格式化必须写清楚

---

## 十三、移动端和触屏场景别忽略指针吸附

官方 `Intelligent Pointer Snapping` 文档是个很容易被忽略、但很实用的点。

官方说明：

- 从 `5.4.0` 开始
- 默认在移动端启用 pointer snapping
- 默认在非移动端关闭

也可以在 `echarts.init` 时自己控制：

- `useCoarsePointer: true`
- `useCoarsePointer: false`
- `pointerSize`

主人先记一个项目判断：

如果你的图表：

- 点很小
- 触屏点击不容易点准
- 又不是大规模 `large: true` 数据

那这类吸附优化就很有价值。

官方还明确提到：

- 默认范围是 `44px`
- 对开启了 `large: true` 的大数据系列，不会启用 snapping

---

## 十四、后台分析页里最实用的一套交互组合

如果主人想快速把一个图做得“像项目成品”，  
我最推荐先上这一组：

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

这套配置的价值是：

- 看数据更顺
- 多系列更清楚
- 时间跨度大也不怕
- 交互成熟度一下就上来了

---

## 十五、项目里最容易犯的几个交互坑

### 1. `tooltip` 用错 trigger

多系列折线图却还用 `item`，  
用户会很难横向比较。

### 2. 图例太多还硬塞普通 `legend`

分类一多，应该优先上 `type: 'scroll'`。

### 3. 数据很多却没 `dataZoom`

结果图挤成一团，只能看个大概。

### 4. 只监听事件，不会主动驱动

很多联动效果真正的关键在 `dispatchAction`，  
不是只会 `chart.on(...)`。

### 5. 交互状态没同步到业务层

图表自己看起来会动，  
但旁边列表、筛选、标题完全不跟。

这就会很割裂。

---

## 十六、如果你是前端，最值得先练哪三个小场景

我建议你直接练这三个。

### 1. 多系列折线图

练：

- `tooltip.trigger = 'axis'`
- `legend`
- `axisPointer.cross`

### 2. 长时间序列图

练：

- `dataZoom.inside`
- `dataZoom.slider`
- `datazoom` 事件

### 3. 列表 hover 联动图表

练：

- `dispatchAction.highlight`
- `dispatchAction.showTip`
- `dispatchAction.downplay`

这三个一练，你在后台项目里就已经能干很多活了。

---

## 十七、这一篇看完后，主人应该直接记住什么

就记这 10 句：

1. `tooltip` 解决的是“看得清”
2. `legend` 解决的是“系列筛选”
3. `dataZoom` 解决的是“跨度太大看不清”
4. 多系列趋势图优先 `trigger: 'axis'`
5. 双轴图常配 `axisPointer.type = 'cross'`
6. 图例多时优先 `legend.type = 'scroll'`
7. `chart.on(...)` 是接收用户操作
8. `dispatchAction(...)` 是代码主动驱动图表
9. 图表交互最好同步成业务状态
10. 移动端图表还要考虑 pointer snapping

---

## 十八、官方参考

- Event and Action: <https://echarts.apache.org/handbook/en/concepts/event/>
- Legend: <https://echarts.apache.org/handbook/en/concepts/legend/>
- Axis: <https://echarts.apache.org/handbook/en/concepts/axis/>
- Intelligent Pointer Snapping: <https://echarts.apache.org/handbook/en/how-to/interaction/coarse-pointer/>
- Chart Container and Size: <https://echarts.apache.org/handbook/en/concepts/chart-size/>
- Features: <https://echarts.apache.org/en/feature.html>
