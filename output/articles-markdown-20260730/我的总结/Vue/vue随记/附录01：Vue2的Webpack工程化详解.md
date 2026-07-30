---
title: "附录01：Vue2的Webpack工程化详解"
slug: "vue-vue-01-vue2-webpack-ba0bd4ed-revision-20260730"
summary: "Vue2时代最主流的工程化方案是Webpack+vue-loader（通常由vue-cli脚手架封装）。它的核心目标是：把浏览器不直接理解的资源（.vue、scss/less、图片、字体、TS、现代JS语法等）通过loader/plugin/打包策略转成浏览器能高效加载的HTML+CSS+JS+静态资源。"
category: "vue随记"
tags:
  - "Vue2"
  - "Webpack"
  - "工程化"
  - "vue-loader"
  - "构建工具"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac4f8"
originalSlug: "vue-vue-01-vue2-webpack-ba0bd4ed"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# Vue2 的 Webpack 工程化详解（面向前端工程师）

Vue2 时代最主流的工程化方案是 **Webpack + vue-loader**（通常由 `vue-cli` 脚手架封装）。它的核心目标是：

- **把浏览器不直接理解的资源**（`.vue`、`scss/less`、图片、字体、TS、现代 JS 语法等）
- 通过 **loader / plugin / 打包策略**
- 转成浏览器能高效加载的 **HTML + CSS + JS + 静态资源**

本文按“你在项目里真正会遇到的问题”来讲：Webpack 在 Vue2 中的职责、关键概念、配置结构、性能优化、常见坑。

---

## 一、Vue2 项目为什么离不开 Webpack？

在 Vue2 项目里，你经常会用到这些能力：

- 写单文件组件：`*.vue`
- 使用 ES6+ / Babel 转译
- 使用 CSS 预处理器：Sass/Less/Stylus
- 使用图片/字体等静态资源，并做 hash、压缩、CDN 路径
- 本地开发：热更新（HMR）、代理（proxy）、SourceMap
- 生产构建：压缩、Tree Shaking（有限）、代码分割、按需加载

Webpack 在 Vue2 中就是“**资源处理 + 构建编排**”的核心。

---

## 二、Webpack 的核心概念（用 Vue2 项目语言理解）

### 1. entry / output：从哪里开始、产物去哪

- **entry**：Webpack 从哪个入口 JS 开始解析依赖图
- **output**：最终输出到哪里、文件名规则、hash 策略

在 Vue2（vue-cli）里，入口通常是：

```js
// src/main.js
import Vue from 'vue'
import App from './App.vue'

new Vue({
  render: h => h(App),
}).$mount('#app')
```

### 2. module + loader：把“非 JS”变成 JS 可理解的模块

Webpack 默认只理解 JS/JSON。Vue2 工程化的关键在于：

- **`vue-loader`**：把 `.vue` 拆成 template/script/style，再分别交给对应 loader
- **`babel-loader`**：把现代 JS 转成目标浏览器可运行的 JS
- **`css-loader` / `style-loader` / `mini-css-extract-plugin`**：把 CSS 变成可注入/可抽离的资源
- **`file-loader` / `url-loader`**（Webpack5 后逐渐被 asset modules 替代）：处理图片、字体等

一个典型的规则（示意）：

```js
module.exports = {
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ]
  }
}
```

### 3. plugin：参与“构建生命周期”的增强能力

loader 更像“文件转换器”，plugin 更像“构建过程的扩展插件”。Vue2 项目常见 plugin：

- **`VueLoaderPlugin`**：配合 `vue-loader` 工作（必需）
- **`HtmlWebpackPlugin`**：生成 `index.html` 并自动注入资源
- **`DefinePlugin`**：注入构建时常量（如 `process.env.NODE_ENV`）
- **`MiniCssExtractPlugin`**：生产环境抽离 CSS
- **`TerserWebpackPlugin`**：压缩 JS
- **`CopyWebpackPlugin`**：拷贝静态资源

### 4. devServer：本地开发体验（HMR / proxy）

Vue2 开发时最常用：

- **HMR（热更新）**：改代码不用刷新页面
- **proxy**：本地代理转发到后端，解决跨域 & 方便联调

示例：

```js
module.exports = {
  devServer: {
    hot: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      }
    }
  }
}
```

---

## 三、Vue2（vue-cli）里的 Webpack 配置到底藏在哪？

很多人觉得“我没写 Webpack 配置啊”，原因是：

- Vue2 常见脚手架是 `vue-cli 2/3/4`
- 它把 Webpack 配置封装在依赖里（`@vue/cli-service`）

### 1. vue-cli 2（老项目）

典型结构：

- `build/webpack.base.conf.js`
- `build/webpack.dev.conf.js`
- `build/webpack.prod.conf.js`

你会直接看到 `webpack-merge` 合并配置。

### 2. vue-cli 3/4（更常见）

- 默认不暴露 Webpack 配置文件
- 你通过 `vue.config.js` 做“二次配置”

常用方式：

- `configureWebpack`：直接合并一段配置
- `chainWebpack`：用 `webpack-chain` 以链式方式精确修改内部配置

示例：

```js
// vue.config.js
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },
  chainWebpack: config => {
    // 比如：自定义 svg 处理规则
    config.module.rule('svg').exclude.add(require('path').resolve('src/icons'))
  }
}
```

---

## 四、Vue2 + Webpack 的关键产物：依赖图（Dependency Graph）

Webpack 的打包过程可以理解成：

- 从 entry 开始
- 遇到 `import` / `require` 就把依赖加入图里
- 每个依赖按 rules 找 loader 处理
- 最后把所有模块按 chunk 规则输出

这也解释了很多问题：

- 为什么某个包变大了？（依赖被引入到主包里）
- 为什么按需加载没生效？（路由/组件没有拆 chunk）
- 为什么改一个小文件构建很慢？（loader 链过长、缓存没开）

---

## 五、面向生产的核心配置：优化（你最关心的部分）

### 1. mode + sourceMap

- `development`：更快构建、保留调试信息
- `production`：压缩、优化、去掉一些开发提示

SourceMap 常用策略：

- 开发：`eval-cheap-module-source-map`（快、够用）
- 生产：视安全与定位需求选择（很多团队会关闭或只对错误上报保留）

### 2. 代码分割（Code Splitting）

目的：

- 首屏只加载必须的
- 其他页面/组件按需加载

#### (1) 路由懒加载

```js
const UserPage = () => import(/* webpackChunkName: "user" */ './pages/UserPage.vue')
```

#### (2) SplitChunks 抽公共包

Vue CLI 默认已经做了很多，但你需要理解它在干什么：

- 抽 `node_modules` 到 `chunk-vendors`
- 抽公共业务代码到 `chunk-common`

典型配置（示意）：

```js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}
```

### 3. 缓存与 hash 策略

生产环境常见文件名：

- `app.[contenthash].js`
- `chunk-vendors.[contenthash].js`

核心目的：

- 文件内容不变，hash 不变
- 浏览器/CDN 可以长期缓存

### 4. Tree Shaking（Vue2 时代“有限但有用”）

Tree Shaking 生效的前提：

- 使用 ESM：`import { xxx } from 'lib'`
- 生产模式（`mode: 'production'`）
- 依赖包本身提供 ESM 构建，并且标注 `sideEffects`

注意：Vue2 时代很多库仍然以 CommonJS 为主，Tree Shaking 效果不如今天。

### 5. 压缩（JS/CSS/图片）

- JS：`terser`（Vue CLI 默认）
- CSS：`css-minimizer`（或老项目的 `optimize-css-assets-webpack-plugin`）
- 图片：通常用 `image-webpack-loader` 或构建后用独立压缩流程

---

## 六、你会经常改的点（实战配置片段）

### 1. 别名 alias

```js
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@assets': path.resolve(__dirname, 'src/assets')
  }
}
```

### 2. 环境变量（Vue2 / Vue CLI）

常见文件：

- `.env.development`
- `.env.production`

Vue CLI 里，默认只有以 `VUE_APP_` 开头的变量会注入到客户端代码：

```ini
VUE_APP_API_BASE=/api
```

使用：

```js
console.log(process.env.VUE_APP_API_BASE)
```

### 3. 处理 IE / 低版本浏览器

核心点：

- Babel target
- polyfill（如 `core-js`）
- 对依赖进行 transpile（有些依赖发布的是未编译代码）

Vue CLI 有 `transpileDependencies`：

```js
module.exports = {
  transpileDependencies: ['some-esm-only-lib']
}
```

---

## 七、调试与排查：包为什么这么大、构建为什么这么慢？

### 1. 分析体积

常用思路：

- 引入 `webpack-bundle-analyzer` 看依赖占比
- 排查是否把整包引入（例如 `lodash` 全量、`moment` 全语言包）

### 2. 构建变慢常见原因

- loader 链太长（尤其是对所有文件都做 babel）
- 没有开启缓存（`cache-loader`/`babel-loader` 的缓存）
- 大型项目没有合理 splitChunks，导致每次重构建都很重

### 3. HMR 不生效

常见原因：

- 组件没有被正确接受更新（某些写法导致全量刷新）
- 样式抽离/配置导致热更新链断

---

## 八、Webpack 在 Vue2 项目里的“定位总结”

你可以用一句话记住它：

- **Webpack 负责“把你写的各种资源组织起来，并按开发/生产的目标，产出可运行、可优化、可部署的前端资源”。**

当你维护 Vue2 老项目时，最有价值的能力不是背配置，而是：

- 理解 loader / plugin / chunk 的作用
- 知道应该去哪里改（`build/*.conf.js` 或 `vue.config.js`）
- 能用体积分析和性能分析定位瓶颈

---

## 九、常见对比：为什么后来 Vue3 更偏向 Vite？

Vue2 + Webpack 的问题并不是“不能用”，而是：

- 开发启动与热更新在大型项目里会越来越慢
- 配置心智负担大（loader/plugin/各种兼容）

这也是 Vue3 时代 Vite 流行的背景。
