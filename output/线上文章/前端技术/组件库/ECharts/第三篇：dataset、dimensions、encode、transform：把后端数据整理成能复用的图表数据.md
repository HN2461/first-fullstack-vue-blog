---
title: "第三篇：dataset、dimensions、encode、transform：把后端数据整理成能复用的图表数据"
slug: "echarts-echarts-dataset-dimensions-encode-transform-a720d0bd"
summary: "基于 2026-05-02 查阅的 Apache ECharts 官方 Dataset、Data Transform、Dynamic Data 与 Import 文档，系统讲清 dataset、sourceHeader、seriesLayoutBy、dimensions、encode、多 dataset 与 filter/sort transform 的用法，帮助把后端接口数据整理成可复用的图表数据源。"
category: "ECharts"
tags:
  - "ECharts"
  - "dataset"
  - "encode"
  - "transform"
  - "数据可视化"
  - "Vue3"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5cc"
originalSlug: "echarts-echarts-dataset-dimensions-encode-transform-a720d0bd"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第三篇：dataset、dimensions、encode、transform：把后端数据整理成能复用的图表数据

> 主人前两篇已经把“ECharts 是什么”和“常见图怎么选”理顺了。  
> 接下来真正像项目的部分，其实是：**后端给你的数据，怎么整理成图表能长期复用的结构。**

这一篇我按 **2026-05-02** 查到的 Apache ECharts 官方 `Dataset`、`Data Transform`、`Dynamic Data`、`Import` 文档来写。

目标很明确：

- 让你知道什么时候该从 `series.data` 升级到 `dataset`
- 让你看懂 `sourceHeader`、`seriesLayoutBy`、`dimensions`、`encode`
- 让你知道一份原始数据怎么分发给多张图
- 让你知道 `filter`、`sort`、管道 transform 怎么用

---

## 一、先记住一句话

`series.data` 更像是：

**“直接把这张图要画的数据塞进去。”**

而 `dataset` 更像是：

**“先准备一张结构化数据表，再告诉不同图表该怎么读这张表。”**

这就是它们最大的区别。

---

## 二、什么时候只写 `series.data` 就够了

如果你只是写一个很小的 demo，比如：

- 一张折线图
- 一组柱状图
- 数据量不大
- 不需要复用

那直接写：

```js
series: [
  {
    type: 'line',
    data: [120, 132, 101, 134, 90, 230, 210]
  }
]
```

完全没问题。

这个阶段追求的是：

- 先跑通
- 先看效果
- 先理解图表骨架

---

## 三、什么时候应该换成 `dataset`

一旦出现下面这些情况，就该认真考虑 `dataset` 了：

- 一份接口数据要给多个系列共用
- 一份接口数据要给多个图共用
- 后端返回的是表格型数据
- 你不想在前端手写一堆 `map`
- 你想做筛选、排序、派生数据
- 你想让图表配置和原始数据解耦

主人可以把它理解成：

**`dataset` 是从“写一张图”走向“组织一套图表数据”的分水岭。**

---

## 四、`dataset.source` 最常见的两种写法

官方 `Dataset` 文档里，最常见就是这两类。

### 1. 二维数组

这是最像 Excel 表格的一种。

```js
option = {
  dataset: {
    source: [
      ['月份', '访问量', '成交量'],
      ['1月', 1200, 220],
      ['2月', 1500, 260],
      ['3月', 1800, 310]
    ]
  },
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

这里的第一行就是表头。

也就是说：

- 第一列是“月份”
- 第二列是“访问量”
- 第三列是“成交量”

然后下面每一行都是一条数据记录。

---

### 2. 对象数组

这更像后端接口经常直接返回的结构。

```js
option = {
  dataset: {
    source: [
      { month: '1月', visits: 1200, orders: 220 },
      { month: '2月', visits: 1500, orders: 260 },
      { month: '3月', visits: 1800, orders: 310 }
    ]
  },
  xAxis: {
    type: 'category'
  },
  yAxis: {},
  series: [
    {
      type: 'bar',
      encode: {
        x: 'month',
        y: 'visits'
      }
    },
    {
      type: 'line',
      encode: {
        x: 'month',
        y: 'orders'
      }
    }
  ]
}
```

这类写法的优点很明显：

- 字段名可读性高
- 和后端 JSON 更贴近
- 后面写 `encode` 时很顺

---

## 五、`sourceHeader` 是在告诉 ECharts：有没有表头

官方文档提到，ECharts 会尝试自动判断表头。

但主人最好先记一个更稳的做法：

**当你知道第一行就是表头时，显式写出来。**

```js
dataset: {
  sourceHeader: true,
  source: [
    ['月份', '访问量', '成交量'],
    ['1月', 1200, 220],
    ['2月', 1500, 260]
  ]
}
```

如果第一行不是表头，就写：

```js
dataset: {
  sourceHeader: false,
  source: [
    ['1月', 1200, 220],
    ['2月', 1500, 260]
  ]
}
```

这样比完全交给自动判断更稳。

---

## 六、`seriesLayoutBy` 是在说：按行读还是按列读

这个点很多人第一次看会晕。

你先这样理解：

- `column`
  - 每一列更像一个维度

- `row`
  - 每一行更像一个系列来源

默认更常见的是 `column`。

比如这张表：

```js
[
  ['月份', '访问量', '成交量'],
  ['1月', 1200, 220],
  ['2月', 1500, 260],
  ['3月', 1800, 310]
]
```

这就很适合按列理解。

但如果你的数据长这样：

```js
[
  ['指标', '1月', '2月', '3月'],
  ['访问量', 1200, 1500, 1800],
  ['成交量', 220, 260, 310]
]
```

你就可能会写：

```js
series: [
  { type: 'bar', seriesLayoutBy: 'row' },
  { type: 'line', seriesLayoutBy: 'row' }
]
```

一句话总结：

**当你发现“系列信息横着放了”，就要想到 `seriesLayoutBy: 'row'`。**

---

## 七、`dimensions` 是给维度命名

如果你不写，ECharts 也能推断一部分。

但在这些场景里，显式写 `dimensions` 很有价值：

- 你想把字段名写得更清楚
- 你想指定某些列的顺序
- 你想让 `encode` 更稳定

示意：

```js
dataset: {
  dimensions: ['month', 'visits', 'orders'],
  source: [
    ['1月', 1200, 220],
    ['2月', 1500, 260],
    ['3月', 1800, 310]
  ]
}
```

这样后面就能配：

```js
encode: {
  x: 'month',
  y: 'visits'
}
```

比直接写“第几列”更不容易看懵。

---

## 八、`encode` 是整套数据组织里最关键的桥

这是主人一定要吃透的点。

`encode` 本质上是在说：

**数据表里的哪一列，映射到图表的哪个位置。**

最常见的映射有这些：

- `x`
  - 映射到横轴

- `y`
  - 映射到纵轴

- `tooltip`
  - tooltip 要展示哪些字段

- `seriesName`
  - 系列名来自哪一列

- `itemName`
  - 类目名来自哪一列

- `value`
  - 数值来自哪一列

一个很常见的例子：

```js
series: [
  {
    type: 'bar',
    encode: {
      x: 'month',
      y: 'visits',
      tooltip: ['month', 'visits', 'orders']
    }
  }
]
```

你可以把 `encode` 理解成：

**不是把数据改成图表想要的样子，而是告诉图表该怎么读数据。**

这就是它特别省事的地方。

---

## 九、一份 `dataset` 可以同时服务多个系列

这是 `dataset` 很香的核心原因之一。

```js
option = {
  dataset: {
    source: [
      { month: '1月', visits: 1200, orders: 220 },
      { month: '2月', visits: 1500, orders: 260 },
      { month: '3月', visits: 1800, orders: 310 }
    ]
  },
  legend: {},
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category'
  },
  yAxis: {},
  series: [
    {
      name: '访问量',
      type: 'bar',
      encode: {
        x: 'month',
        y: 'visits'
      }
    },
    {
      name: '成交量',
      type: 'line',
      encode: {
        x: 'month',
        y: 'orders'
      }
    }
  ]
}
```

这样做的好处是：

- 原始数据只有一份
- 配置更集中
- 后面新增系列更容易
- 接接口时更顺

---

## 十、多 `dataset` 才像真实项目

官方文档还支持多个 `dataset`。

这在这些场景里特别常见：

- 同一页多个图
- 一份原始数据 + 多份衍生数据
- 一个 dataset 做原表，一个 dataset 做过滤结果

比如：

```js
option = {
  dataset: [
    {
      id: 'raw',
      source: [
        { region: '华北', product: 'A', sales: 320 },
        { region: '华东', product: 'A', sales: 410 },
        { region: '华北', product: 'B', sales: 280 }
      ]
    },
    {
      id: 'onlyA',
      fromDatasetId: 'raw',
      transform: {
        type: 'filter',
        config: {
          dimension: 'product',
          '=': 'A'
        }
      }
    }
  ]
}
```

这时候你可以让某个系列专门使用 `onlyA`。

主人先记重点：

- `id`
  - 给 dataset 起名字

- `fromDatasetId`
  - 从哪个 dataset 派生

- `fromDatasetIndex`
  - 也可以按下标引用

---

## 十一、`transform` 是让数据先处理，再画图

这一步特别像“图表内置的数据预处理层”。

官方 `Data Transform` 文档重点讲了内置 transform。

最常用的就是：

- `filter`
- `sort`

### 1. `filter`

比如只看华北：

```js
{
  transform: {
    type: 'filter',
    config: {
      dimension: 'region',
      '=': '华北'
    }
  }
}
```

### 2. `sort`

比如按销量倒序：

```js
{
  transform: {
    type: 'sort',
    config: {
      dimension: 'sales',
      order: 'desc'
    }
  }
}
```

这类能力特别适合：

- 排行榜
- Top N
- 只看某个分类
- 过滤脏数据

---

## 十二、transform 可以串成管道

这也是很像正式项目的一步。

比如：

1. 先过滤出产品 A
2. 再按销量倒序

可以写成：

```js
{
  id: 'productA_sorted',
  fromDatasetId: 'raw',
  transform: [
    {
      type: 'filter',
      config: {
        dimension: 'product',
        '=': 'A'
      }
    },
    {
      type: 'sort',
      config: {
        dimension: 'sales',
        order: 'desc'
      }
    }
  ]
}
```

这就是“管道式处理”的感觉。

它的价值在于：

- 原始数据保留
- 派生逻辑清楚
- 后面调试更容易

---

## 十三、Vue 项目里最实用的心法：接口数据尽量先进 `dataset`

主人如果后面是在 `Vue 3 + Vite` 里接真实接口，  
我更建议这样理解：

### 不太推荐的方式

接口回来后，在多个地方各自写：

- `list.map(...)`
- `xAxis.data = ...`
- `series[0].data = ...`
- `series[1].data = ...`

这样一旦图多起来，会越来越乱。

### 更推荐的方式

接口回来后先整理成统一数据表：

```js
const source = apiList.map((item) => ({
  month: item.monthLabel,
  visits: item.visitCount,
  orders: item.orderCount,
  rate: item.convertRate
}))
```

然后：

- `dataset.source = source`
- 各个 `series` 只负责写 `encode`

这样结构会清楚很多。

---

## 十四、按需引入时别忘了 `DatasetComponent` 和 `TransformComponent`

如果你走的是官方推荐的按需引入模式，  
那只引入图表类型还不够。

你还得把相关组件注册进去。

比如：

```js
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TransformComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TransformComponent,
  CanvasRenderer
])
```

如果你用了 `dataset` 或 `transform`，  
却没注册对应组件，图表就可能起不来。

---

## 十五、动态更新时，优先更新 `dataset.source`

官方 `Dynamic Data` 文档的思路是：

**数据变了，再 `setOption`。**

如果你已经用上 `dataset`，  
那很自然的更新方式就是：

```js
chart.setOption({
  dataset: {
    source: latestSource
  }
})
```

这样比你每次手动拆：

- `xAxis.data`
- `series[0].data`
- `series[1].data`

通常更省事，也更不容易错位。

---

## 十六、项目里最容易犯的五个坑

### 1. demo 阶段写顺了，项目里还死守 `series.data`

一开始没问题。  
但一旦图表多了，就会变得很难维护。

### 2. 表头有没有写清楚

如果你用二维数组，却没搞清：

- 第一行是不是表头
- `sourceHeader` 要不要显式写

后面映射就容易乱。

### 3. 行列方向想反了

只要你感觉“怎么系列和类目反了”，  
第一时间就去想：

- `seriesLayoutBy`

### 4. `encode` 没写，靠默认猜

小 demo 还行。  
真实项目更推荐显式写出来。

### 5. 直接在图表层硬编码筛选逻辑

如果你已经能用 `transform` 解决，  
尽量别把筛选和排序都塞进外面一堆零碎 `map/filter/sort` 里。

---

## 十七、主人现在最该怎么练

我建议这样练最稳：

1. 先把第二篇里的折线图或柱状图改成 `dataset` 版本
2. 练一份 `source` 同时喂给两个系列
3. 再练一个 `filter`
4. 最后练一个 `filter + sort` 管道

只要这四步走完，  
你对 ECharts 的数据组织就已经不是“只会抄 demo”的水平了。

---

## 十八、这一篇你看完后，脑子里要留下什么

至少留下这 8 句：

1. `dataset` 是结构化数据源，不只是另一种写法
2. 简单 demo 可以继续写 `series.data`
3. 真项目里尽量早点转到 `dataset`
4. `sourceHeader` 是在说明第一行是不是表头
5. `seriesLayoutBy` 是在说明按行读还是按列读
6. `dimensions` 是给维度命名
7. `encode` 是把数据列映射到图表位置
8. `transform` 可以在图表内部做过滤、排序和派生

---

## 十九、官方参考

- Dataset: <https://echarts.apache.org/handbook/en/concepts/dataset/>
- Data Transform: <https://echarts.apache.org/handbook/en/concepts/data-transform/>
- Dynamic Data: <https://echarts.apache.org/handbook/en/how-to/data/dynamic-data/>
- Import: <https://echarts.apache.org/handbook/en/basics/import/>
