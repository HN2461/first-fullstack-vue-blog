---
title: "Vue Router 入门（从 0 到能用）"
slug: "vue-ai-vue-vue-router-0-a8f63d97"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 160
cover: ""
originalId: "6a2d291e8a2b1c68f2cac26a"
originalSlug: "vue-ai-vue-vue-router-0-a8f63d97"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第15章 Vue Router 入门（从 0 到能用）

> 目标：学会在 Vue2 项目中使用 Vue Router 完成页面切换，并掌握最常见的路由能力。
> 
> - 前端路由概念
> - hash 模式与 history 模式
> - Router 基础配置与路由表
> - `router-link` 与 `router-view`
> - 编程式导航：`push / replace / go`
> - 动态路由
> - `params` 与 `query`

---

## 15.1 前端路由概念

前端路由解决的问题是：

- 在 SPA（单页应用）中实现“页面切换”的体验
- URL 变化时不刷新整页，而是切换组件

你可以把它理解为：

- URL（路径） → 对应渲染哪个组件

---

## 15.2 hash 模式与 history 模式对比

### 15.2.1 hash 模式

- URL 形如：`/#/home`
- 基于浏览器 `hashchange`
- 优点：
  - 兼容性好
  - 部署简单（不需要后端配合）
- 缺点：
  - URL 不够美观

### 15.2.2 history 模式

- URL 形如：`/home`
- 基于 History API（`pushState`）
- 优点：
  - URL 更美观
- 缺点：
  - 部署需要后端支持：所有路径都应回退到 `index.html`

---

## 15.3 Router 基础配置与路由表结构

Vue2 项目里常见文件：

- `src/router/index.js`

典型写法：

```js
import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/login', component: Login }
  ]
})
```

---

## 15.4 `router-link` 与 `router-view`

- `router-view`：路由出口（渲染当前路径对应的组件）
- `router-link`：声明式导航

```vue
<template>
  <div>
    <router-link to="/home">首页</router-link>
    <router-link to="/login">登录</router-link>

    <router-view></router-view>
  </div>
</template>
```

常用点：

- `router-link` 默认渲染成 `<a>`
- 当前命中的路由会加上默认 class：`router-link-active`（可用于高亮）

---

## 15.5 编程式导航：`push / replace / go`

当你在逻辑代码里做跳转（例如登录成功后跳首页），用编程式导航：

```js
this.$router.push('/home')
```

### 15.5.1 push

- 往历史栈压入一条记录

```js
this.$router.push({ path: '/home' })
```

### 15.5.2 replace

- 替换当前历史记录（常用于不希望用户返回到某个页面）

```js
this.$router.replace('/home')
```

### 15.5.3 go

- 前进/后退

```js
this.$router.go(-1)
```

---

## 15.6 动态路由

动态路由用于：

- 详情页（`/detail/:id`）
- 用户页（`/user/:userId`）

路由配置：

```js
{ path: '/detail/:id', component: Detail }
```

获取参数：

```js
const id = this.$route.params.id
```

---

## 15.7 `params` 与 `query` 的区别与选择建议

### 15.7.1 query

- URL 形如：`/search?keyword=vue&page=2`
- 获取：`this.$route.query.keyword`

```js
this.$router.push({
  path: '/search',
  query: { keyword: 'vue', page: 2 }
})
```

适合：

- 筛选条件
- 分页参数
- 可选参数

### 15.7.2 params

- URL 形如：`/detail/123`
- 获取：`this.$route.params.id`

```js
this.$router.push({
  name: 'detail',
  params: { id: 123 }
})
```

适合：

- 资源标识（详情 id）
- 必填且更“路径化”的信息

---

## 本章小结

- Vue Router 让 SPA 拥有“多页面切换”的能力。
- hash 模式部署简单，history 模式 URL 更美观但需要后端配合。
- `router-view` 是路由出口，`router-link` 是声明式导航。
- 逻辑跳转用 `this.$router.push/replace/go`。
- 参数分两类：`params`（路径参数）与 `query`（查询参数）。

**下一章预告**

第16章将学习 Router 进阶：嵌套路由、重定向/别名、路由懒加载、导航守卫与登录鉴权流程。
