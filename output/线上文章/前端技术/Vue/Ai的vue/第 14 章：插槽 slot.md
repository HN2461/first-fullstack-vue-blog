---
title: "第 14 章：插槽 slot"
slug: "vue-ai-vue-slot-32fece73"
summary: "Vue 插槽笔记，整理默认插槽、具名插槽、作用域插槽和组件封装场景。"
category: "Ai的vue"
tags:
  - "Vue"
  - "slot"
  - "插槽"
  - "组件封装"
status: "published"
sortOrder: 140
cover: ""
originalId: "6a2d291e8a2b1c68f2cac268"
originalSlug: "vue-ai-vue-slot-32fece73"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 14 章：插槽 slot

> 目标：掌握 Vue2 插槽体系，能用插槽封装“高复用组件”（如 Modal/Table/Card）。
> 
> - 默认插槽
> - 具名插槽
> - 作用域插槽（`slot-scope`）
> - 插槽的典型使用场景

---

## 14.1 默认插槽

默认插槽用于：

- 组件提供一个“容器/布局”
- 组件使用者把内容传进去

子组件（例如 Card）：

```vue
<template>
  <div class="card">
    <slot></slot>
  </div>
</template>
```

父组件使用：

```vue
<Card>
  <h3>标题</h3>
  <p>正文内容...</p>
</Card>
```

直觉：

- 子组件决定“壳”长什么样
- 父组件决定“内容”是什么

---

## 14.2 具名插槽

当组件里需要多个插槽位置（例如：header/body/footer）时，使用具名插槽。

子组件：

```vue
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header"></slot>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>

    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
```

父组件：

```vue
<Card>
  <template v-slot:header>
    <h3>标题</h3>
  </template>

  <p>这里是默认插槽内容</p>

  <template v-slot:footer>
    <button>确定</button>
  </template>
</Card>
```

说明：

- 默认插槽不需要名字
- 具名插槽用 `name="xxx"`
- 父组件使用 `v-slot:xxx`（或简写 `#xxx`）

---

## 14.3 作用域插槽（`slot-scope`）

作用域插槽解决的问题是：

- 插槽内容由父组件写
- 但插槽数据来自子组件

### 14.3.1 一个直观例子：列表组件把 item 暴露给父组件

子组件（List）：

```vue
<template>
  <ul>
    <li v-for="item in list" :key="item.id">
      <slot :item="item"></slot>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    }
  }
}
</script>
```

父组件使用（Vue2 常见写法 `slot-scope`）：

```vue
<List :list="products">
  <template slot-scope="scope">
    <span>{{ scope.item.name }}</span>
    <strong>￥{{ scope.item.price }}</strong>
  </template>
</List>
```

你可以把它理解成：

- 子组件负责遍历与结构
- 父组件负责“每一项怎么渲染”

---

## 14.4 插槽的典型使用场景（Modal、Table、Card 等组件封装）

### 14.4.1 Modal

一个典型弹窗组件通常需要：

- header 插槽（标题/自定义操作）
- body 默认插槽（主体内容）
- footer 插槽（按钮区）

### 14.4.2 Table

表格封装常见需求：

- 表头固定
- 某列自定义渲染（状态标签、操作按钮）

这类“自定义单元格渲染”非常适合用作用域插槽。

### 14.4.3 Card

卡片布局通过默认/具名插槽可以让组件复用性非常强。

---

## 本章小结

- 默认插槽：父传内容，子提供位置。
- 具名插槽：一个组件多个插槽位。
- 作用域插槽：子把数据暴露给父，实现“结构在子、渲染在父”。

**下一章预告**

第15章将开始学习 Vue Router：路由模式、基本配置、`router-link/router-view`、编程式导航、动态路由与参数。
