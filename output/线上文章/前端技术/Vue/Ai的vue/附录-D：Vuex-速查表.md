---
title: "附录 D：Vuex 速查表"
slug: "vue-ai-vue-d-vuex-8579ca48"
summary: "Vuex 速查表附录，整理 Vuex 核心概念、API 和常见写法。"
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 280
cover: ""
originalId: "6a2d291e8a2b1c68f2cac296"
originalSlug: "vue-ai-vue-d-vuex-8579ca48"
originalStatus: "published"
publishedAt: "2026-02-02T13:22:00.002Z"
updatedAt: "2026-07-31T11:16:23.875Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 附录 D：Vuex 速查表

> 目标：把 Vuex 的读写方式与核心概念快速整理。

---

## D.1 核心概念

- `state`：状态
- `getters`：派生
- `mutations`：同步修改（commit）
- `actions`：异步/复杂逻辑（dispatch）

---

## D.2 常用读写

读取：

- `this.$store.state.xxx`
- `this.$store.getters.xxx`

修改：

- `this.$store.commit('mutationName', payload)`
- `this.$store.dispatch('actionName', payload)`

---

## D.3 map 辅助函数

- `mapState`
- `mapGetters`
- `mapMutations`
- `mapActions`

命名空间模块：

- `mapState('user', ['token'])`
- `this.$store.commit('user/setToken', token)`

---

## D.4 经典约束

- mutation 必须同步
- 异步逻辑放 action
