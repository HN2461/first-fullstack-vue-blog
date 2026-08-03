---
title: "第 24 章：从 Vue 2 迁移到 Vue 3"
slug: "vue-ai-vue-vue2-vue3-a7bca734"
summary: "Vue 2 到 Vue 3 迁移指南，整理迁移思路、API 差异、兼容注意事项和过渡方案。"
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 240
cover: ""
originalId: "6a2d291e8a2b1c68f2cac27e"
originalSlug: "vue-ai-vue-vue2-vue3-a7bca734"
originalStatus: "published"
publishedAt: "2026-02-02T13:17:53.475Z"
updatedAt: "2026-07-31T11:16:23.864Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 24 章：从 Vue 2 迁移到 Vue 3

> 目标：建立 Vue3 的整体认知，并掌握从 Vue2 迁移到 Vue3 的主要变化点。

---

## 24.1 Vue3 为什么更快（Proxy 响应式）

Vue3 的响应式核心从：

- Vue2：`Object.defineProperty`

升级为：

- Vue3：`Proxy`

Proxy 的优势（直觉层面）：

- 能监听“新增/删除属性”
- 数组索引等很多场景更自然
- 更适合做完整的对象拦截

---

## 24.2 Composition API 出现的原因

Vue2 的 Options API（data/methods/computed/watch）在小组件里很清晰。

但当组件逻辑很复杂时：

- 同一块业务逻辑被拆散在 data/methods/watch 各处
- 复用逻辑要靠 mixins，容易命名冲突

Composition API 的目标：

- 让同一块业务逻辑“聚合在一起”
- 更容易复用与组合（composables）

---

## 24.3 Vuex vs Pinia（迁移建议）

在 Vue3 生态中，Pinia 逐渐成为更主流的状态管理方案：

- 更轻量
- TypeScript 体验更好
- API 更直观

迁移建议：

- Vue2 项目继续用 Vuex 完成学习与项目即可
- 新项目（Vue3）优先考虑 Pinia

---

## 24.4 Vue CLI vs Vite（构建工具变化）

Vue CLI 基于 webpack，生态成熟，但在开发体验上相对“重”。

Vite 的特点：

- 基于原生 ESM 的开发服务器
- 冷启动快
- 热更新更快

迁移建议：

- Vue2 学习阶段先掌握 CLI（理解工程化概念）
- Vue3 新项目优先考虑 Vite

---

## 24.5 Vue2 → Vue3 常见迁移差异清单（概览）

下面是概览级差异（不展开细节）：

- 响应式：defineProperty → Proxy
- 根实例：`new Vue()` → `createApp()`
- 组件语法：Options API 仍可用，新增 Composition API
- 生命周期钩子名称在 Composition API 中有对应（如 `onMounted`）
- v-model 在组件上的写法与事件约定更灵活（Vue3 有变体）
- 插槽语法更统一（v-slot 更主流）

---

## 本章小结

- Vue3 的性能与能力提升，很大部分来自 Proxy 响应式。
- Composition API 为复杂组件与逻辑复用提供更好的组织方式。
- 构建工具趋势从 Vue CLI（webpack）逐渐转向 Vite。
- 学 Vue2 是为了打基础，学 Vue3 是为了跟上主流。

**全书完结**

你已经具备从零到独立完成 Vue2 项目开发的关键能力，并理解了向 Vue3 过渡的核心方向。
