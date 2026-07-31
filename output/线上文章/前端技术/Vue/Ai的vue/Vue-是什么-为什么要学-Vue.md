---
title: "Vue 是什么 为什么要学 Vue"
slug: "vue-ai-vue-vue-vue-0208816f"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 300
cover: ""
originalId: "6a2d291e8a2b1c68f2cac274"
originalSlug: "vue-ai-vue-vue-vue-0208816f"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第1章 Vue 是什么？为什么要学 Vue？

> 目标：建立对 Vue 的整体认知——知道它解决什么问题、核心思想是什么、适合用在什么场景，以及学习 Vue2 时需要顺带了解的生态（Router/Vuex/工程化）。

---

## 1.1 前端开发为什么需要框架

在最早的网页开发里，页面大多是“静态展示”。随着业务越来越复杂，前端逐渐承担了更多工作：

- 页面结构越来越多（列表、表单、复杂布局）
- 交互越来越频繁（筛选、分页、弹窗、实时校验）
- 状态越来越复杂（登录态、权限、购物车、草稿、缓存）
- 团队协作更需要规范（目录结构、组件复用、工程化构建）

如果只用原生 JavaScript 操作 DOM，常见痛点会很明显：

- **DOM 操作繁琐**：你要自己查找元素、创建节点、插入/删除节点、维护事件。
- **状态和界面容易不同步**：数据变了，界面不一定更新；界面更新了，也可能忘了同步数据。
- **代码可维护性下降**：当一个页面几十个交互点时，逻辑很容易变成“到处改 DOM”。

一个典型例子：用原生 JS 去维护一个计数器（你会手写“更新 UI”）

```html
<div>
  <button id="btn-dec">-</button>
  <span id="count">0</span>
  <button id="btn-inc">+</button>
</div>
<script>
  let count = 0;
  const countEl = document.getElementById('count');

  function render() {
    countEl.textContent = String(count);
  }

  document.getElementById('btn-inc').addEventListener('click', () => {
    count++;
    render();
  });

  document.getElementById('btn-dec').addEventListener('click', () => {
    count--;
    render();
  });

  render();
</script>
```

这种写法在简单 Demo 里没问题，但当状态变多、页面变复杂时，`render()` 会越来越大，更新逻辑分散在各处，维护成本快速上升。

框架（Vue/React/Angular）的核心价值之一就是：

- 让你用更“声明式”的方式描述界面
- 让数据变化自动驱动界面更新
- 提供更成熟的组件化、工程化和生态能力

---

## 1.2 Vue 的核心思想：数据驱动视图

Vue 的核心思想可以概括为：

- **你只需要维护数据（状态）**
- **框架负责把数据映射成界面（视图）**

在 Vue 中，你通常不会手写“去改哪个 DOM 节点的文字”，而是写成类似：

- 页面上显示 `count`
- 点击按钮时修改 `count`
- `count` 变了，页面自动跟着变

用 Vue2 的写法看起来像这样：

```html
<div id="app">
  <button @click="count--">-</button>
  <span>{{ count }}</span>
  <button @click="count++">+</button>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      count: 0
    }
  })
</script>
```

你会发现：

- 代码里几乎看不到 `document.getElementById`
- 也没有 `render()` 这种“手动同步 UI”函数
- 数据和界面之间的关系更直观

这就是“数据驱动视图”。

---

## 1.3 渐进式框架的含义

Vue 经常被称为“渐进式框架”，意思不是“功能少”，而是：**你可以按需使用它的能力**。

常见的渐进式路线：

1. **只用 Vue 做局部增强**（传统多页面里某个模块想做交互）
2. **用 Vue 做单页应用（SPA）**
3. **配套使用生态**：Vue Router（路由）/ Vuex（状态管理）
4. **引入工程化**：Vue CLI、构建、代码规范、环境区分、部署

对初学者而言，这种“先能跑起来，再逐步变专业”的体验很友好。

---

## 1.4 SPA 单页应用概念

SPA（Single Page Application）指的是：

- 应用只有一个主页面（通常是 `index.html`）
- 页面切换不再依赖后端返回整页 HTML，而是前端在浏览器里切换组件
- 数据通过 API 获取，界面通过前端渲染

你可以把 SPA 理解为：

- **路由切换 ≈ 组件切换**
- **页面更新主要发生在浏览器**

SPA 的优点：

- **体验更流畅**：页面切换更快，减少整页刷新。
- **前后端分离更清晰**：后端提供接口，前端负责渲染。
- **更适合复杂应用**：后台管理、内容平台、业务系统等。

SPA 的常见挑战：

- **首屏可能更慢**（需要下载 JS/渲染）
- **SEO 更复杂**（需要 SSR/预渲染等方案）
- **路由与权限、缓存、状态管理要更规范**

Vue2 的典型项目形态就是 SPA + Vue Router + Vuex。

---

## 1.5 Vue 的生态体系概览（Vue Router / Vuex / CLI / UI库）

学习 Vue2 做项目时，通常会接触下面这些组件：

### 1.5.1 Vue Router：前端路由

Vue Router 负责：

- URL 变化时切换对应组件
- 提供声明式导航（`<router-link>`）和视图容器（`<router-view>`）
- 提供导航守卫做登录鉴权

你会在项目里看到类似：

```js
// 路由表：路径对应页面组件
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login }
]
```

### 1.5.2 Vuex：状态管理

当组件越来越多、组件之间共享状态越来越复杂时，Vuex 提供一种“集中式管理状态”的方案。

典型共享状态：

- 登录用户信息
- token
- 权限菜单
- 全局配置

你会看到类似：

```js
const store = new Vuex.Store({
  state: { token: '' },
  mutations: {
    setToken(state, token) {
      state.token = token
    }
  }
})
```

### 1.5.3 Vue CLI：工程化工具

Vue CLI 帮你搭好项目骨架，包括：

- 项目结构与开发服务器
- 构建打包、热更新
- 环境变量区分
- 代码规范（可选）

它解决的问题是：**让你不需要从零搭 webpack**。

### 1.5.4 UI 库：提高开发效率

Vue2 常见 UI 组件库：

- Element UI
- iView（View UI）
- Vant（偏移动端）

UI 库的价值：

- 提供成熟的交互与视觉规范
- 减少重复造轮子
- 让你把精力放在业务逻辑上

---

## 本章小结

- Vue 这类框架出现的背景，是前端业务复杂度不断提升，原生 DOM 操作维护成本太高。
- Vue 的核心思想是 **数据驱动视图**：你更新数据，界面自动更新。
- Vue 的“渐进式”意味着可以从小模块开始用，逐步过渡到完整 SPA 工程。
- SPA 是 Vue2 项目最典型的应用形态；配套生态通常包括 Vue Router、Vuex 和工程化工具。

**下一章预告**

第2章将开始做环境准备，并完成第一个 Vue 项目（从快速体验到工程化创建）。
