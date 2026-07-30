---
title: "附录C Vue Router 速查表"
slug: "vue-ai-vue-c-vue-router-8010183d"
summary: ""
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291e8a2b1c68f2cac294"
originalSlug: "vue-ai-vue-c-vue-router-8010183d"
originalStatus: "published"
publishedAt: "2026-02-02T13:21:58.978Z"
updatedAt: "2026-06-19T06:24:52.005Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 附录C：Vue Router 速查表

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
