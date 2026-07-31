---
title: "SortableJS拖拽排序库实战说明：标签拖拽、列表重排与Vue接入"
slug: "js-sortablejs-vue-0390c773"
summary: "围绕 SortableJS 这类成熟拖拽排序库，整理它适合解决什么问题、为什么比自己手搓更稳、最小接入方式、常用配置项、Vue 项目里的数据同步方式，以及标签栏拖拽场景下最容易踩到的坑。"
category: "JS库"
tags:
  - "JavaScript"
  - "JS库"
  - "SortableJS"
  - "Vue"
  - "拖拽排序"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d29208a2b1c68f2cac6ba"
originalSlug: "js-sortablejs-vue-0390c773"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# SortableJS拖拽排序库实战说明：标签拖拽、列表重排与Vue接入

## 先说为什么要研究这种库

以后做项目时，一定会不断遇到各种功能：

- 拖拽排序
- 图表
- 时间处理
- 防抖节流
- 文件导入导出
- 富文本编辑
- 二维码生成
- 虚拟滚动

这些功能不是完全不能自己写。

但很多时候，自己手搓出来的版本会有几个典型问题：

- 只满足当前页面，通用性不够
- 鼠标、触摸、滚动、边界吸附这些细节处理不成熟
- 一遇到兼容性和交互细节就越来越乱
- 下个项目还得重复造轮子

所以很多真实项目的思路其实是：

**基础业务自己写，通用能力尽量借成熟库。**

而 `SortableJS` 就是“拖拽排序”这个场景里非常典型的一类成熟库。

## SortableJS 是什么

`SortableJS` 是一个专门做“可排序拖拽列表”的 JavaScript 库。

它最常见的用途就是：

- 同一个列表里拖动顺序
- 从左边列表拖到右边列表
- 从一个分组拖到另一个分组
- 标签栏、卡片墙、表单项、面板区块重排

它的特点是：

- 不依赖 jQuery
- 适合现代浏览器和触摸设备
- 支持动画
- 支持拖拽手柄
- 支持多列表互拖
- 支持插件扩展

用一句最白的话说：

**它帮我们把“拖起来、放下去、看到位置变化、拿到拖拽结果”这一整套底层交互先做好。**

## 为什么项目里常用它，而不是自己手搓

因为拖拽排序这种功能，看起来简单，真自己写会很快遇到很多边界：

- 鼠标拖拽和触摸拖拽的行为不一样
- 列表滚动时要不要自动滚
- 拖动时占位元素怎么表现
- 跨列表移动时数据怎么算
- 某些区域能拖，某些按钮不能拖
- 横向列表和纵向列表规则不同

如果只是做一个很轻量、一次性的玩具功能，自己写原生拖拽事件也可以。

但如果是后台系统、组件库、低代码页面、可配置面板、标签栏、工作台模块这类会长期维护的东西，直接借成熟库通常更划算。

## 最适合在哪些场景用

`SortableJS` 特别适合下面这些场景：

- 后台管理系统标签栏拖拽排序
- 表格外层卡片、区块、面板顺序调整
- 表单构建器字段拖拽
- 左右两栏项目移动
- 看板列内重排和跨列移动

不太适合的场景：

- 复杂画布编辑器
- 强依赖精准碰撞检测的自由拖放系统
- 需要物理引擎或吸附网格的设计器

这些更偏“可视化编辑器”级别的场景，往往要更重的拖拽方案。

## 最小接入方式

官方最基础的接法很简单：

```bash
npm install sortablejs --save
```

```js
import Sortable from 'sortablejs'

const el = document.getElementById('items')
Sortable.create(el)
```

只要目标容器里有一组子元素，`SortableJS` 就能先把“基本拖动排序”跑起来。

例如：

```html
<ul id="items">
  <li>标签1</li>
  <li>标签2</li>
  <li>标签3</li>
</ul>
```

```js
Sortable.create(document.getElementById('items'))
```

这就是最小可用版本。

## 在 Vue 项目里怎么接

在 Vue 项目里，最常见的方式是：

1. 模板里给列表容器加 `ref`
2. 等 DOM 渲染完成后初始化
3. 在拖拽结束事件里同步数据顺序

示例：

```vue
<template>
  <ul ref="listRef">
    <li v-for="item in list" :key="item.id">
      {{ item.title }}
    </li>
  </ul>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Sortable from 'sortablejs'

const listRef = ref(null)
const list = ref([
  { id: 1, title: '标签1' },
  { id: 2, title: '标签2' },
  { id: 3, title: '标签3' }
])

onMounted(() => {
  Sortable.create(listRef.value, {
    animation: 300,
    onEnd(evt) {
      const movedItem = list.value.splice(evt.oldIndex, 1)[0]
      list.value.splice(evt.newIndex, 0, movedItem)
    }
  })
})
</script>
```

这段代码最关键的地方不在“能拖”，而在：

```js
onEnd(evt) {
  const movedItem = list.value.splice(evt.oldIndex, 1)[0]
  list.value.splice(evt.newIndex, 0, movedItem)
}
```

因为真正决定页面长期稳定的，不是 DOM 位置临时变了，而是：

**响应式数据顺序有没有同步更新。**

## 为什么“能拖动”不等于“功能就做完了”

这是看项目源码时非常容易忽略的一点。

很多项目会写成这样：

```js
Sortable.create(target, {
  draggable: 'li',
  animation: 300
})
```

这样做以后，页面上通常已经可以拖动了。

但这里只是让库接管了 DOM 层的拖拽表现，不一定代表业务数据真的改了。

如果没有在 `onEnd`、`onUpdate`、`onAdd` 这类事件里同步更新数组或 `store`，就可能出现下面这些现象：

- 页面上看起来拖成功了
- 一次重新渲染后顺序又恢复
- 刷新页面后顺序丢失
- 和缓存、标签关闭、路由切换逻辑对不上

所以以后看到项目里只写了 `Sortable.create(...)`，您要立刻追问一句：

**它有没有把排序结果同步回数据层。**

## 这个库里最常用的配置项

下面这些是项目里最常见、最值得先记住的配置。

### `animation`

```js
animation: 300
```

控制拖拽排序时的动画时长，单位是毫秒。

### `draggable`

```js
draggable: '.item'
```

指定哪些子元素可以被拖动。

### `handle`

```js
handle: '.drag-handle'
```

只允许用户从某个拖拽手柄区域开始拖，这样就不会和点击按钮、选中文字冲突。

### `filter`

```js
filter: '.ignore'
```

指定哪些元素点击后不触发拖拽，常用于删除按钮、更多菜单按钮。

### `group`

```js
group: 'tags'
```

用于多列表互拖。两个列表 `group` 一样时，元素才能在它们之间移动。

### `sort`

```js
sort: true
```

表示是否允许在当前列表内部排序。

### `disabled`

```js
disabled: true
```

用于临时禁用拖拽。

### `ghostClass`、`chosenClass`、`dragClass`

```js
ghostClass: 'sortable-ghost',
chosenClass: 'sortable-chosen',
dragClass: 'sortable-drag'
```

这几个类名用于控制拖拽过程中的视觉状态：

- `ghostClass`：占位状态
- `chosenClass`：被选中准备拖拽
- `dragClass`：正在拖动

如果想让交互更像成熟产品，这几个样式通常值得单独调。

## 事件里最常用的是哪些

### `onEnd`

拖拽结束时触发。

最常用来做：

- 同步数组顺序
- 更新 `store`
- 调接口持久化顺序

常见字段：

- `evt.oldIndex`
- `evt.newIndex`
- `evt.from`
- `evt.to`

### `onUpdate`

同一个列表内部排序变化时触发。

适合处理：

- 列表内重排
- 更新当前列表数据

### `onAdd`

元素从别的列表拖进当前列表时触发。

适合处理：

- 跨列表加入数据
- 看板列间移动

### `onRemove`

元素从当前列表被拖走时触发。

适合处理：

- 当前列表移除数据
- 统计变化

### `onMove`

拖动过程中持续触发。

适合处理：

- 动态阻止某些放置行为
- 自定义插入规则

如果只是普通项目排序，先记 `onEnd` 就够了。  
如果是复杂一点的多列表移动，再继续看 `onAdd`、`onRemove`、`onMove`。

## 针对您现在这个标签栏场景，最值得记住什么

如果是后台标签栏这种场景，最容易踩的坑就是：

### 第一，拖拽改变的是标签顺序，不只是 DOM 顺序

标签栏一般都和下面这些逻辑绑在一起：

- 当前激活标签
- 关闭左侧或右侧标签
- 标签缓存
- 路由切换
- 刷新页面后的恢复

所以如果只让 DOM 拖动，但不更新数据源，后面很多逻辑都会慢慢对不上。

### 第二，标签里往往有关闭按钮

这时最好用 `handle` 或 `filter`，否则很容易出现：

- 用户本来想点关闭
- 结果变成拖拽开始

例如：

```js
Sortable.create(listRef.value, {
  handle: '.tag-title',
  filter: '.tag-close'
})
```

### 第三，横向标签栏要留意方向和滚动体验

如果标签是横向排列，通常要注意：

- 拖拽方向是否自动识别正确
- 横向滚动时的体验是否自然
- 标签过多时自动滚动是否正常

有些项目会显式加：

```js
direction: 'horizontal'
```

来减少歧义。

## 一个更接近后台标签栏的 Vue 示例

```vue
<template>
  <ul ref="tagsRef" class="tags">
    <li
      v-for="tag in tags"
      :key="tag.fullPath"
      class="tag-item"
    >
      <span class="drag-handle">{{ tag.title }}</span>
      <button class="tag-close">x</button>
    </li>
  </ul>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Sortable from 'sortablejs'

const tagsRef = ref(null)
const tags = ref([
  { fullPath: '/dashboard', title: '首页' },
  { fullPath: '/user/list?page=1', title: '用户列表' },
  { fullPath: '/role/list', title: '角色列表' }
])

onMounted(() => {
  Sortable.create(tagsRef.value, {
    animation: 300,
    direction: 'horizontal',
    handle: '.drag-handle',
    filter: '.tag-close',
    onEnd(evt) {
      if (evt.oldIndex === evt.newIndex) return
      const movedTag = tags.value.splice(evt.oldIndex, 1)[0]
      tags.value.splice(evt.newIndex, 0, movedTag)
    }
  })
})
</script>
```

这个写法更适合标签场景，因为它同时考虑了：

- 横向拖拽
- 点击关闭按钮不触发拖拽
- 真正同步标签数组顺序

## 什么时候要继续往深了学

如果后面项目里出现下面这些需求，就可以继续研究 `SortableJS` 的更进阶能力：

- 多选拖拽
- 两列互拖
- 克隆拖拽
- 只允许部分列表接收元素
- 自动滚动优化
- 自定义占位视觉
- 插件机制

这时重点看：

- `group`
- `pull`
- `put`
- `onMove`
- `Swap` 插件
- `MultiDrag` 插件

## 最后给自己留一版最短记忆

以后忘了时，先回想这几句：

- `SortableJS` 是成熟的拖拽排序库
- 项目里能借库时，优先别自己硬手搓
- 它解决的是“拖拽交互底座”，不是自动帮你处理全部业务
- Vue 里最关键的是 `ref + onMounted + onEnd`
- `onEnd` 不同步数据，就只是“DOM 看起来拖动了”
- 标签栏场景尤其要注意关闭按钮和横向拖拽

## 参考资料

- 官方仓库：<https://github.com/SortableJS/Sortable>
- 官方演示：<http://sortablejs.github.io/Sortable/>

我这篇主要参考了官方 README 里的库定位、安装方式、基础用法、配置项和事件说明，再结合 Vue 后台标签栏的常见项目场景做了整理。
