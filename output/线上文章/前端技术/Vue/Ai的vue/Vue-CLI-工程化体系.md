---
title: "Vue CLI 工程化体系"
slug: "vue-ai-vue-vue-cli-15ca9855"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 120
cover: ""
originalId: "6a2d291e8a2b1c68f2cac272"
originalSlug: "vue-ai-vue-vue-cli-15ca9855"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第19章 Vue CLI 工程化体系

> 目标：从“能跑 Demo”过渡到“能写项目”。掌握 Vue CLI 创建、开发、构建、部署的完整链路。

---

## 19.1 Vue CLI 创建项目流程

Vue2 工程化项目通常通过 Vue CLI 创建，它会帮你搭好：

- 开发服务器（热更新）
- 构建打包（输出 `dist`）
- 依赖管理（package.json）
- 代码规范与工具链（可选）

常见创建方式：

```bash
vue create my-vue2-project
```

学习建议：

- 第一遍用默认预设快速跑通
- 第二遍手动选择 Router/Vuex/Lint 等，体验更接近真实项目

---

## 19.2 项目结构深度解析（推荐目录分层）

一个常见目录（示意）：

```
src/
├── api/            # 接口封装
├── assets/         # 静态资源（会参与打包）
├── components/     # 通用组件
├── router/         # 路由
├── store/          # Vuex
├── styles/         # 全局样式/变量
├── utils/          # 工具函数
├── views/          # 页面级组件
├── App.vue
└── main.js
public/
└── index.html      # 唯一 HTML 模板
```

核心区分：

- `public/`：不会被 webpack 处理，直接原样拷贝
- `src/assets/`：会被打包处理（可做 hash、压缩等）

---

## 19.3 `main.js` 与应用启动流程

在 Vue2 CLI 项目里，`main.js` 一般负责：

- 引入 Vue
- 引入根组件 `App.vue`
- 引入 router/store（如果有）
- 创建 Vue 实例并挂载到 `#app`

典型写法：

```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
```

---

## 19.4 环境变量

Vue CLI 支持通过 `.env` 文件管理不同环境配置。

### 19.4.1 `.env.development`

开发环境变量：

```txt
VUE_APP_BASE_API=/api
```

### 19.4.2 `.env.production`

生产环境变量：

```txt
VUE_APP_BASE_API=https://api.example.com
```

使用方式：

```js
const baseURL = process.env.VUE_APP_BASE_API
```

注意：

- Vue CLI 约定：只有以 `VUE_APP_` 开头的变量才会暴露到前端代码

---

## 19.5 跨域解决方案：`devServer.proxy`

开发时前端（`localhost:8080`）请求后端（`localhost:3000`）会遇到跨域。

Vue CLI 常用方案是代理：在 `vue.config.js` 配置 `devServer.proxy`。

示例：

```js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}
```

这样你在前端请求：

- `/api/users`

开发服务器会转发到：

- `http://localhost:3000/api/users`

---

## 19.6 打包构建与部署基础（dist、静态资源路径）

### 19.6.1 构建命令

```bash
npm run build
```

生成 `dist/` 目录。

### 19.6.2 静态资源路径（publicPath）

如果你的项目不是部署在域名根路径（例如部署在 `/app/`），可能需要配置 `publicPath`。

在 `vue.config.js`：

```js
module.exports = {
  publicPath: './'
}
```

### 19.6.3 部署的基本原则

- SPA 应用通常需要服务端把所有路径都回退到 `index.html`
- history 模式尤其需要后端配置回退

---

## 本章小结

- Vue CLI 帮你搭好开发与构建工具链。
- 项目结构要按职责分层（api/router/store/views/components）。
- 环境变量用于区分开发/生产配置。
- 开发跨域用 `devServer.proxy`。
- 构建产物在 `dist`，部署要关注静态资源路径与 history 回退。

**下一章预告**

第20章将学习 Axios 请求封装：baseURL、拦截器、token 注入、统一错误处理、API 模块拆分，以及上传/下载。
