---
title: "Vue Router 进阶（项目级能力）"
slug: "vue-ai-vue-vue-router-b20d1fed"
summary: ""
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 150
cover: ""
originalId: "6a2d291e8a2b1c68f2cac26c"
originalSlug: "vue-ai-vue-vue-router-b20d1fed"
originalStatus: "published"
publishedAt: "2026-02-02T13:12:20.217Z"
updatedAt: "2026-06-13T10:28:27.991Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 第16章 Vue Router 进阶（项目级能力）

> 目标：掌握项目里最常用的 Router 进阶能力。
> 
> - 嵌套路由（多级页面结构）
> - 重定向 `redirect` 与别名 `alias`
> - 路由懒加载
> - 导航守卫体系（全局/路由独享/组件内）
> - 登录鉴权流程（token + 路由拦截）

---

## 16.1 嵌套路由（多级页面结构）

嵌套路由用于：

- 一个页面里有子页面区域
- 例如后台管理：Layout（侧边栏 + 顶栏）固定，右侧内容区切换

示例结构：

- `/admin` 渲染 `AdminLayout`
- `/admin/users` 渲染 `UserList`（在 layout 的 `<router-view>` 中显示）

```js
{
  path: '/admin',
  component: AdminLayout,
  children: [
    { path: 'users', component: UserList },
    { path: 'roles', component: RoleList }
  ]
}
```

注意：

- children 的 `path` 不要以 `/` 开头（否则变成绝对路径）

---

## 16.2 重定向 `redirect` 与别名 `alias`

### 16.2.1 redirect

常见用途：

- 默认首页
- 旧路由兼容

```js
{ path: '/', redirect: '/home' }
```

### 16.2.2 alias

别名是“同一个组件，多条路径都能访问”：

```js
{ path: '/home', component: Home, alias: '/index' }
```

访问 `/home` 或 `/index` 都会渲染 Home。

---

## 16.3 路由懒加载（按需加载）

懒加载的目的：

- 首屏只加载必要代码
- 其他页面在访问时再下载

写法：

```js
{ path: '/about', component: () => import('@/views/About.vue') }
```

通常在项目里：

- 业务页面（views）建议懒加载
- 一些核心页面可不懒加载（视情况而定）

---

## 16.4 导航守卫体系

导航守卫可以理解为：

- 路由跳转前/后你可以插入逻辑
- 典型用途：登录鉴权、埋点、标题设置

### 16.4.1 全局前置守卫

```js
router.beforeEach((to, from, next) => {
  next()
})
```

### 16.4.2 全局后置守卫

```js
router.afterEach((to) => {
  document.title = to.meta.title || 'App'
})
```

### 16.4.3 路由独享守卫

```js
{
  path: '/admin',
  component: Admin,
  beforeEnter(to, from, next) {
    next()
  }
}
```

### 16.4.4 组件内守卫

```js
export default {
  beforeRouteEnter(to, from, next) {
    next()
  },
  beforeRouteUpdate(to, from, next) {
    next()
  },
  beforeRouteLeave(to, from, next) {
    next()
  }
}
```

---

## 16.5 登录鉴权流程（token + 路由拦截）

一个常见的鉴权思路：

- 登录成功后把 token 存到 localStorage（或 Vuex）
- 每次路由跳转前判断：
  - 访问的是公开页面（如 `/login`）→ 放行
  - 访问的是受保护页面 → 没 token 就跳转登录

示例（简化版）：

```js
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.path === '/login') return next()

  if (!token) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  next()
})
```

常见增强：

- 登录后根据 `redirect` 回到原页面
- token 过期处理（配合 axios 响应拦截器）
- 动态路由（权限菜单）

---

## 本章小结

- 嵌套路由用于后台 layout + 内容区结构。
- `redirect` 负责跳转，`alias` 负责“多路径同组件”。
- 懒加载能显著优化首屏体积。
- 守卫是鉴权与项目级路由逻辑的核心。

**下一章预告**

第17章将进入 Vuex：为什么需要状态管理、state/getters/mutations/actions，以及 mutation 必须同步的原因。
