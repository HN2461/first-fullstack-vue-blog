---
title: "第 4 篇：Vue 3 + Vite 项目落地：把 ECharts 封成可复用图表组件"
slug: "echarts-echarts-vue3-vite-echarts-03b8ae7e"
summary: "基于 2026-05-03 查阅的 Apache ECharts 官方 chart size、dynamic data、canvas vs svg、安全与 Aria 文档，以及 vue-echarts 官方 README 和 Releases，讲清 Vue 3 + Vite 项目里最稳的图表封装方式、按需引入、自动适配、主题、loading、事件、手动更新和常见坑。"
category: "ECharts"
categoryPath:
  - "前端技术"
  - "组件库"
  - "ECharts"
tags:
  - "ECharts"
  - "Vue3"
  - "Vite"
  - "vue-echarts"
  - "图表组件"
  - "项目落地"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5f0"
originalSlug: "echarts-echarts-vue3-vite-echarts-03b8ae7e"
originalStatus: "published"
publishedAt: "2026-05-03T11:53:30.954Z"
updatedAt: "2026-07-31T11:16:23.554Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 4 篇：Vue 3 + Vite 项目落地：把 ECharts 封成可复用图表组件

> 主人前面三篇已经把“是什么、怎么选图、怎么组织数据”讲清了。  
> 这一篇就直接落到项目里最常见的问题：**我现在要在 Vue 3 + Vite 里把图表真正做成一个稳定可复用的组件，该怎么写最顺？**

这一篇我按 **2026-05-03** 重新核对的官方资料来写，主要参考：

- Apache ECharts 官方 `Chart Container and Size`
- Apache ECharts 官方 `Dynamic Data`
- Apache ECharts 官方 `Canvas vs. SVG`
- Apache ECharts 官方 `Security Guidelines`
- Apache ECharts 官方 `Aria`
- `vue-echarts` 官方 README 和 Releases

目标很明确：

- 让你知道项目里最稳的接法
- 让你知道什么时候用原生 ECharts，什么时候用 `vue-echarts`
- 让你知道封装组件时最容易踩的坑
- 让你能快速把图表接进真实页面

---

## 一、先记住一句话

在 Vue 项目里，ECharts 最好别当成“临时脚本”用。

它更适合当成：

**一个可复用的图表子组件能力。**

原因很简单：

- 图表页通常会反复出现
- 尺寸、loading、主题、事件、刷新逻辑都很像
- 直接散写在页面里，后面很快就乱

---

## 二、先说结论：Vue 3 项目里优先考虑 `vue-echarts`

官方 `vue-echarts` README 里给的就是非常标准的 Vue 接法。

我建议主人先记住这几点：

- `vue-echarts` 是 Apache ECharts 的官方 Vue 组件封装之一
- Release 页面顶部有 `8.1.0-beta` 预发布版本；普通项目建议先选标记为 Latest 的稳定版 `v8.0.1`
- 稳定版 `v8.0.1` 的 Release 说明对应 `echarts ^6.0.0`、`vue ^3.3.0`
- 默认提供更省心的更新策略
- 支持 `autoresize`
- 支持 `manual-update`
- 支持事件绑定和 `theme` 注入

如果你是 Vue 3 + Vite 项目，  
这条路线通常比自己手写 `echarts.init` + `dispose` 更快进入项目。

---

## 三、最稳的安装方式

```bash
npm install echarts vue-echarts
```

然后按需引入图表类型和渲染器。

```js
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
  DataZoomComponent,
  AriaComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  DatasetComponent,
  TransformComponent,
  DataZoomComponent,
  AriaComponent
])
```

主人先记住两个原则：

1. 只注册你会用到的模块
2. 需要 `dataset`、`transform`、`aria` 时别漏组件

---

## 四、一个最实用的封装长什么样

你可以先封成一个基础版 `BaseChart`。

```vue
<template>
  <VChart
    class='chart'
    :option='option'
    :autoresize='true'
    :loading='loading'
  />
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'

const props = defineProps({
  option: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const option = computed(() => props.option)
</script>

<style scoped>
.chart {
  width: 100%;
  height: 360px;
}
</style>
```

这个版本已经能覆盖很多常规页面。

---

## 五、项目里最重要的是“尺寸管理”

官方 `Chart Container and Size` 文档说得很明确：

- 初始化前容器必须有宽高
- 容器尺寸变了要 `resize()`
- 容器节点销毁后要 `dispose()`

如果你用 `vue-echarts`：

- `autoresize` 可以帮你自动处理容器变更
- 但容器本身还是要有明确高度

这句话很关键：

**大多数图表“没显示”，不是 ECharts 坏了，而是容器没尺寸。**

---

## 六、什么时候用 `autoresize`

`vue-echarts` 官方 README 里说明得很清楚：

- `autoresize` 可以是 `boolean`
- 也可以是带 `throttle` 和 `onResize` 的对象

适合这些场景：

- 卡片宽度会变
- 侧栏折叠会变
- 标签页切换会变
- 响应式布局会变

如果你的页面只是在固定宽高容器里展示，  
那也可以不强依赖它。

---

## 七、什么时候用 `manual-update`

`vue-echarts` v8 的 README 明确说明：

- `manual-update` 适合高频或大图表
- 它只把 `option` 用于首次渲染
- 后续 prop 变化不会自动触发更新
- 你需要自己通过 `setOption` 控制更新

这个模式很适合：

- 实时刷新
- 大数据量图表
- 需要精细控制更新时机的页面

但主人要记住：

**普通业务页别一上来就用 `manual-update`，先用默认智能更新更省心。**

---

## 八、主题和暗黑模式怎么接

`vue-echarts` 官方 README 给了 `THEME_KEY`。

```vue
<script setup>
import { provide } from 'vue'
import { THEME_KEY } from 'vue-echarts'

provide(THEME_KEY, 'dark')
</script>
```

也可以给 ref 或 getter。

这个比你在每个图表里手动写主题更适合项目级统一管理。

如果你后面想做：

- 明亮 / 暗黑切换
- 按产品线切换主题
- 按租户切换主题

都可以往这个方向走。

---

## 九、loading、事件和交互怎么接

`vue-echarts` 官方 README 里已经把常用能力收好了：

- `loading`
- `loading-options`
- 事件绑定
- `setOption`
- `resize`
- `dispatchAction`
- `dispose`

### 1. loading

```vue
<VChart :option='option' :loading='loading' />
```

### 2. 事件

```vue
<VChart :option='option' @legendselectchanged='handleLegendChange' />
```

### 3. 原生 DOM 事件

如果你真要绑原生点击，官方 README 说明要用 `native:` 前缀。

```vue
<VChart @native:click='handleNativeClick' />
```

这个点很容易记错。

---

## 十、Canvas 还是 SVG，项目里怎么选

官方 `Canvas vs. SVG` 的意思可以直接记成项目判断句：

- 图元素很多、数据量大，优先 `Canvas`
- 移动端内存压力大、实例很多、或特别在意缩放清晰度时，可以考虑 `SVG`

官方还明确提到：

- 数据量较大时，Canvas 更推荐
- 很多实例同时存在、容易占内存时，SVG 可能更稳

在 tree-shakable 引入下，你需要手动注册对应渲染器：

```js
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
```

---

## 十一、交互联动在项目里很常见

前面第二、三篇已经讲过基础。

这里再把项目里最常见的联动感受说清楚：

- 图例点选
- 数据缩放
- 悬浮高亮
- 列表和图表联动
- 多图联动

如果你后面要做大屏或统计页，  
`dispatchAction` 会非常常用。

---

## 十二、安全别忽略

官方 `Security Guidelines` 提醒得很明确：

- 大部分渲染是 Canvas 或 SVG
- 但 `tooltip`、`dataView` 等特殊组件允许 HTML 渲染
- 如果图表配置可被外部影响，就要警惕注入风险

所以项目里只要数据不是自己本地写死的，  
就别随便把原始 HTML 拼进去。

---

## 十三、无障碍别最后才补

官方 `Aria` 文档里说明：

- ECharts 5 起 `aria` 不再默认导入
- 需要时手动引入 `AriaComponent`
- 然后开启 `aria.show: true`

这对需要更正式展示的项目很有价值。

---

## 十四、一个真正能上项目的工作流

我建议主人后面真做项目时就按这个顺序：

1. 先确认图表容器尺寸
2. 再决定用 `vue-echarts` 还是原生 `echarts.init`
3. 然后按需注册图表类型和组件
4. 把后端数据整理成 `dataset`
5. 用 `encode` 绑定字段
6. 需要联动时再加 `legend`、`tooltip`、`dataZoom`
7. 页面切换时自动 `resize`
8. 页面销毁时 `dispose`

---

## 十五、项目里最容易踩的坑

### 1. 容器没高度

最常见，也最容易误判。

### 2. 图表实例重复初始化

页面切换、组件重渲染时最容易出这个问题。

### 3. 一开始就用太复杂的更新逻辑

普通业务页先让默认更新策略跑起来就够了。

### 4. 忘了注册 `DatasetComponent` 或 `TransformComponent`

你明明用了 `dataset`，结果图起不来。

### 5. 低估移动端内存和渲染差异

多实例页面、低端机、长列表加图表，最好提前考虑 SVG/Canvas 取舍。

---

## 十六、这一篇看完后，主人应该直接带走什么

就记这 9 句：

1. Vue 项目里优先考虑 `vue-echarts`
2. 图表组件要封装，不要散写
3. 容器必须先有尺寸
4. `autoresize` 很实用
5. `manual-update` 适合高频或重图，不是默认首选
6. 主题可以用 `THEME_KEY` 统一管
7. `dataset + encode` 是项目里最稳的组合
8. `Canvas` 和 `SVG` 要按场景选
9. 销毁时记得 `dispose`

---

## 十七、官方参考

- Chart Container and Size: <https://echarts.apache.org/handbook/en/concepts/chart-size/>
- Dynamic Data: <https://echarts.apache.org/handbook/en/how-to/data/dynamic-data/>
- Canvas vs. SVG: <https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/>
- Security Guidelines: <https://echarts.apache.org/handbook/en/best-practices/security/>
- Aria: <https://echarts.apache.org/handbook/en/best-practices/aria/>
- Vue ECharts README: <https://github.com/ecomfe/vue-echarts>
- Vue ECharts Releases: <https://github.com/ecomfe/vue-echarts/releases>
