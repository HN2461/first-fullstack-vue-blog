---
title: "环境准备与第一个 Vue 项目"
slug: "vue-ai-vue-vue-aa8054ba-revision-20260730"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 290
cover: ""
originalId: "6a2d291e8a2b1c68f2cac280"
originalSlug: "vue-ai-vue-vue-aa8054ba"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 第2章 环境准备与第一个 Vue 项目

> 目标：把 Vue2 的开发环境一次性搭好，并分别用两种方式跑起来：
> 
> - 快速体验：CDN 引入（理解 Vue 是怎么工作的）
> - 工程化开发：Vue CLI 创建项目（以后做项目都用它）

---

## 2.1 Node.js 与 npm/yarn（版本选择建议）

Vue CLI 本质上是一套基于 Node.js 的工程化工具链（脚手架 + 开发服务器 + 构建打包）。因此你需要先装好 Node.js。

### 2.1.1 Node.js 是什么

- Node.js 是一个 JavaScript 运行时环境（让 JS 不只在浏览器跑，也能在本地/服务器跑）
- 你安装 Node.js 时通常会一起安装 `npm`
  - `npm` 是 Node 的包管理器（下载依赖、运行脚本）

### 2.1.2 npm / yarn / pnpm 的关系

- `npm`：Node 自带，最常用
- `yarn`：社区常用替代方案（一些团队更喜欢）
- `pnpm`：更省磁盘、更快（很多新项目使用）

本教程你用 `npm` 或 `yarn` 都可以，命令思路一致。

### 2.1.3 版本建议（Vue2 项目）

如果你是为了学习和做 Vue2 项目：

- 建议使用 **Node.js LTS（长期支持版）**
- 如果你装的是较新的 LTS，通常也没问题

在命令行里确认安装是否成功：

```bash
node -v
npm -v
```

---

## 2.2 VSCode 开发环境建议（插件、格式化、代码规范）

Vue 项目开发，VSCode 是非常合适的选择。

### 2.2.1 推荐插件

- `Vetur`（Vue2 时代常用）
- `ESLint`（代码规范检查）
- `Prettier - Code formatter`（格式化）
- `Path Intellisense`（路径提示）

如果你后面会写 Vue3（或希望插件更统一），也可以用 `Vue - Official`（替代 Vetur），但 Vue2 学习阶段用 Vetur 也完全 OK。

### 2.2.2 格式化建议

- 建议设置：保存时自动格式化
- 建议统一：团队里只选一种格式化方案（Prettier 或 ESLint 的格式规则）

这一步的核心目的只有一个：**减少无意义的格式差异，让你专注写逻辑**。

---

## 2.3 Vue Devtools 安装与使用

Vue Devtools 是 Vue 的“开发者工具”，可以帮助你调试组件树、查看数据状态。

### 2.3.1 能做什么

- 查看页面上有哪些 Vue 组件，以及它们的父子关系
- 查看组件的 `data/props/computed` 当前值
- 观察 Vuex 状态（如果项目用了 Vuex）

### 2.3.2 使用建议

- 调试时优先用 Devtools 看：
  - 数据是否按预期变化
  - 组件是否按预期渲染
  - 某个 props 值是否正确传到了子组件

---

## 2.4 Vue 的两种开发方式

你会经常看到 Vue 的两种“起手方式”：

- CDN 引入：适合快速体验、理解概念
- Vue CLI：适合真实项目开发

### 2.4.1 CDN 引入 Vue（快速体验）

创建一个 `index.html`（任意目录都行），写入：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue2 CDN Demo</title>
  </head>
  <body>
    <div id="app">
      <h1>{{ title }}</h1>
      <p>count: {{ count }}</p>
      <button @click="count++">+1</button>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <script>
      new Vue({
        el: '#app',
        data: {
          title: 'Hello Vue2',
          count: 0
        }
      })
    </script>
  </body>
</html>
```

你能从 CDN 方式学到的关键点：

- Vue2 通过 `new Vue({ ... })` 创建实例
- `data` 里的数据会变成响应式（改变后页面跟着变）
- `{{ }}` 是插值语法
- `@click` 是事件绑定（`v-on:click` 的简写）

### 2.4.2 Vue CLI 创建项目（工程化开发）

CDN 方式能让你快速理解 Vue，但真实项目基本都用 Vue CLI，因为它提供：

- 本地开发服务器（热更新）
- 单文件组件（`.vue`）
- 构建打包（输出 `dist`）
- 依赖管理、环境区分

---

## 2.5 Vue CLI 创建项目（从 0 到能跑）

### 2.5.1 安装 Vue CLI

如果你从没装过 Vue CLI，可以全局安装：

```bash
npm i -g @vue/cli
```

安装后确认：

```bash
vue --version
```

### 2.5.2 创建项目

在你希望放项目的目录里执行：

```bash
vue create my-vue2-demo
```

通常你会遇到两种选择：

- 默认预设（Default）：快速创建
- 手动选择（Manually select features）：按需选择 Babel/Router/Vuex/Lint 等

学习阶段建议：

- 先用默认预设跑起来
- 之后再手动创建一个带 Router/Vuex 的项目练习

### 2.5.3 启动开发服务器

进入项目目录后：

```bash
npm run serve
```

你会看到类似 `http://localhost:8080/` 的地址，打开即可看到页面。

---

## 2.6 Vue CLI 项目目录结构初识（src、public、main.js、App.vue）

一个典型 Vue CLI 项目（Vue2）结构大致如下：

```
my-vue2-demo/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   ├── App.vue
│   └── main.js
├── package.json
└── ...
```

### 2.6.1 public/index.html：页面入口模板

- 这是 SPA 唯一的 HTML 模板
- 里面会有一个挂载点（通常是 `<div id="app"></div>`）

### 2.6.2 src/main.js：应用启动入口

`main.js` 的职责是：

- 引入 Vue
- 引入根组件 `App.vue`
- 把 Vue 实例挂到 `#app`

典型代码形态：

```js
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App)
}).$mount('#app')
```

### 2.6.3 src/App.vue：根组件

`App.vue` 是整个应用的根组件，后面你会把路由容器、布局等都放在这里。

`.vue` 文件一般由三部分组成：

- `<template>`：模板（写 HTML）
- `<script>`：逻辑（写 JS）
- `<style>`：样式（写 CSS）

---

## 本章小结

- Vue2 工程化开发离不开 Node.js 与包管理器（npm/yarn）。
- VSCode + Devtools 能显著提升开发效率与调试体验。
- CDN 方式适合理解概念；Vue CLI 适合做项目。
- 你需要认识 Vue CLI 的几个关键文件：`public/index.html`、`src/main.js`、`src/App.vue`。

**下一章预告**

第3章将从 Vue2 的核心入门：`new Vue({})`、`el/data/methods`、数据绑定与常见错误开始，快速建立可写可用的基础能力。
