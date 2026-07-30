---
title: "Vue2 性能优化清单"
slug: "vue-ai-vue-vue2-925ccc25"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 90
cover: ""
originalId: "6a2d291e8a2b1c68f2cac27a"
originalSlug: "vue-ai-vue-vue2-925ccc25"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第22章 Vue2 性能优化清单

> 目标：掌握 Vue2 项目中最常用、最有效的性能优化手段，做到“能定位、能解释、能落地”。

---

## 22.1 `v-if` vs `v-show` 的性能选择

- 频繁切换显示/隐藏：优先 `v-show`
- 很少显示、内容很重：优先 `v-if`

核心直觉：

- `v-if` 有创建/销毁成本
- `v-show` 有初次渲染成本，但切换成本低

---

## 22.2 `key` 的正确用法与误区

- 列表渲染必须提供稳定唯一的 `key`（优先用 id）
- 避免用 index 做 key（插入/删除/排序会错位）

---

## 22.3 `keep-alive` 页面缓存

`keep-alive` 用于缓存组件实例，适合：

- 列表页返回时保留滚动位置/筛选条件
- Tab 页切换保留状态

注意：

- 缓存不是越多越好
- 可配合 `include/exclude` 控制

---

## 22.4 组件拆分与复用策略

- 大组件拆成小组件：减少渲染范围、提升可维护性
- 可复用的 UI 抽成基础组件：减少重复代码

实践建议：

- 列表页：Table/Filter/Form/Dialog 拆分
- 复杂表单：按模块拆成多个子表单组件

---

## 22.5 路由懒加载与组件懒加载

路由懒加载：

```js
{ path: '/about', component: () => import('@/views/About.vue') }
```

收益：

- 首屏包更小
- 访问某个页面时再加载

---

## 22.6 图片懒加载（业务级优化）

- 列表页图片很多时，优先懒加载
- 结合占位图/骨架屏提升体验

常见做法：

- IntersectionObserver
- 或使用成熟库/指令

---

## 22.7 打包优化方向

### 22.7.1 gzip

- 服务端开启 gzip 压缩
- 能显著降低资源体积

### 22.7.2 CDN

- 静态资源走 CDN
- 加速下载与缓存

### 22.7.3 chunk 拆分

- 大型依赖拆分
- 合理配置缓存策略（hash）

---

## 本章小结

- 条件渲染与列表 key 是最基础也最容易忽视的性能点。
- `keep-alive` 能显著提升“返回体验”，但要控制范围。
- 懒加载是 Vue2 工程里最直接有效的首屏优化手段。
- 构建层优化（gzip/CDN/chunk）是上线前的关键环节。

**下一章预告**

第23章整理常见问题与面试高频点：data 为什么是函数、computed vs watch、nextTick、响应式缺陷、虚拟 DOM 与 diff 等。
