---
title: "附录 C：Vue Router 速查表"
slug: "vue-ai-vue-c-vue-router-8010183d"
summary: "Vue Router 速查表附录，整理常用路由配置、跳转和守卫相关用法。"
category: "Ai的vue"
tags:
  - "Vue Router"
  - "路由"
  - "速查表"
  - "附录"
status: "draft"
sortOrder: 270
cover: ""
originalId: "6a2d291e8a2b1c68f2cac294"
originalSlug: "vue-ai-vue-c-vue-router-8010183d"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 附录 C：Vue Router 速查表

> 目标：把 Router 的常用 API 与概念做成速查。

---

## C.1 常见组件

- `<router-view />`：路由出口
- `<router-link to="/path" />`：声明式导航

---

## C.2 常见 API

- `this.$router.push('/home')`
- `this.$router.replace('/home')`
- `this.$router.go(-1)`

获取当前路由信息：

- `this.$route.path`
- `this.$route.query`
- `this.$route.params`

---

## C.3 动态路由

- 配置：`/detail/:id`
- 获取：`this.$route.params.id`

---

## C.4 query vs params

- query：`/search?keyword=vue`
- params：`/detail/123`

---

## C.5 导航守卫

- 全局前置：`router.beforeEach((to, from, next) => next())`
- 全局后置：`router.afterEach((to) => { ... })`

常见用途：

- 鉴权
- 设置标题
- 埋点统计
