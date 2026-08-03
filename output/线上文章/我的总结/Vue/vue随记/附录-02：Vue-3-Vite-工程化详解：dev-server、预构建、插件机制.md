---
title: "附录 02：Vue 3 Vite 工程化详解：dev server、预构建、插件机制"
slug: "vue-vue-02-vue3-vite-b6a24a54"
summary: "Vue3时代最主流的工程化选择是Vite。如果你之前长期写Vue2+Webpack，会明显感觉到：项目启动更快、热更新更\"秒\"、配置更少（但并不是没有\"工程化能力\"）。"
category: "vue随记"
categoryPath:
  - "我的总结"
  - "Vue"
  - "vue随记"
tags:
  - "Vue3"
  - "Vite"
  - "工程化"
  - "ESM"
  - "Rollup"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291f8a2b1c68f2cac500"
originalSlug: "vue-vue-02-vue3-vite-b6a24a54"
originalStatus: "published"
publishedAt: "2026-05-07T13:57:05.886Z"
updatedAt: "2026-07-31T11:16:24.688Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 附录 02：Vue 3 Vite 工程化详解：dev server、预构建、插件机制

Vue3 时代最主流的工程化选择是 **Vite**。如果你之前长期写 Vue2 + Webpack，会明显感觉到：

- 项目启动更快
- 热更新更“秒”
- 配置更少（但并不是没有“工程化能力”）

本文用中文把 Vite 在 Vue3 工程里到底做了什么、开发/构建的原理差异、常用配置、插件机制、性能与排错思路讲清楚。

---

## 一、Vite 到底是什么？

Vite 是一个现代前端构建工具，核心目标是：

- **开发环境：不打包（或尽量少打包），直接基于浏览器的 ESM（原生模块）运行**
- **生产环境：使用 Rollup 进行打包构建，输出可部署产物**

你可以把它理解成“开发和生产分离的最优解”：

- 开发：追求极致的启动速度与 HMR 体验
- 生产：追求稳定、可控、可优化的 bundle 产物

---

## 二、为什么 Vite 在开发环境比 Webpack 快？

### 1. Webpack 的开发模式（典型痛点）

Webpack 在开发时通常需要：

- 从 entry 开始构建依赖图
- 把大量模块打到内存里
- 任何修改都会触发“重新构建图的一部分”

当项目越来越大，依赖越来越多时：

- 首次启动慢
- HMR 更新链路变重

### 2. Vite 的开发模式（核心思想）

Vite 开发环境的关键点：

- 以 **ESM** 的方式让浏览器按需加载模块
- 你打开一个页面，浏览器才会请求它真正依赖的模块
- 只对“发生变化的模块”做精确热更新

这就把“打包器的工作”大幅转移到了“浏览器的模块加载机制”。

### 3. 预构建（Pre-bundling）：解决依赖加载过碎

如果完全不处理依赖，`node_modules` 可能会：

- 模块太多，请求太碎
- CommonJS 包浏览器不能直接运行

Vite 用 **esbuild** 做“依赖预构建”：

- 把第三方依赖（尤其是 CommonJS/UMD）预构建成浏览器友好的 ESM
- 合并与缓存，提升后续启动速度

你常见到的现象：

- 第一次启动会有“依赖预构建”的耗时
- 后面就很快（命中缓存）

---

## 三、Vue3 项目里 Vite 的入口与基本结构

通过 `create-vue` 创建的项目常见结构：

- `vite.config.ts`：Vite 配置入口
- `index.html`：注意！**它在 Vite 里是“项目入口的一部分”**（不是简单模板）
- `src/main.ts`：应用入口

Vite 的 `index.html` 里会直接写：

```html
<script type="module" src="/src/main.ts"></script>
```

这就是它“基于 ESM”的关键之一。

---

## 四、Vite 的核心配置（你会经常用到）

### 1. 基础配置示例（Vue3）

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
```

### 2. base：部署到非根路径

如果你的站点部署在子路径（例如 `https://domain.com/blog/`），需要：

```ts
export default defineConfig({
  base: '/blog/',
})
```

### 3. 环境变量（Vite）

Vite 环境变量常见文件：

- `.env`
- `.env.development`
- `.env.production`

并且默认要求以 `VITE_` 开头才会注入到客户端：

```ini
VITE_API_BASE=/api
```

使用方式：

```ts
console.log(import.meta.env.VITE_API_BASE)
```

你会注意到它不是 `process.env`，而是 `import.meta.env`。

---

## 五、Vite 的 CSS 与静态资源处理

### 1. CSS / 预处理器

Vite 对 CSS 的体验通常更“开箱即用”，并且支持：

- 普通 CSS
- CSS Modules
- Sass/Less/Stylus（装对应依赖即可）

全局注入变量（示意，Sass）：

```ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/variables.scss" as *;'
      }
    }
  }
})
```

### 2. 静态资源（图片/字体）

常用规则：

- `src/assets`：参与构建处理
- `public`：原样拷贝（不经打包处理），通过根路径访问

例如：

- `src/assets/logo.png`：通过 `import` 使用，会被打包并生成 hash
- `public/favicon.ico`：直接 `/favicon.ico`

---

## 六、生产构建：Vite 实际用的是 Rollup

Vite 的生产构建本质是：

- 以 Rollup 为核心做 bundle
- 输出优化后的静态资源

你可以在 `build` 里配置 Rollup：

```ts
export default defineConfig({
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'],
        },
      },
    },
  },
})
```

### 1. 代码分割（manualChunks）

当你希望把某些依赖拆成独立 chunk（便于缓存/首屏优化），可以使用 `manualChunks`。

### 2. 兼容性（需要你更主动）

Vite 默认面向现代浏览器。要兼容更老的浏览器，可以引入官方插件：

- `@vitejs/plugin-legacy`

（是否需要取决于你项目的目标浏览器范围）

---

## 七、插件机制：Vite 如何扩展能力？

Vite 插件体系与 Rollup 插件兼容（很多场景可以复用生态）。Vue3 常见插件：

- `@vitejs/plugin-vue`：处理 `.vue`
- `unplugin-auto-import`：自动导入 API（需团队规范）
- `unplugin-vue-components`：自动注册组件
- `vite-plugin-svg-icons`：SVG 雪碧图方案

你需要掌握的核心点：

- 插件可以在开发和构建阶段参与转换
- 很多“Webpack loader”的需求在 Vite 里会变成“plugin 的 transform”

---

## 八、常见坑与排查思路（非常实用）

### 1. 开发时依赖更新不生效

可能原因：

- 依赖预构建缓存未更新

处理方式：

- 删除 `node_modules/.vite` 缓存后重启（或执行带强制优化的启动方式，取决于脚手架命令）

### 2. 路径别名 TS 不识别

你在 `vite.config.ts` 配了 `@`，但 TS 仍报错，通常是 `tsconfig.json` 没配 `paths`：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 3. 生产环境资源路径不对

常见原因：

- `base` 没配置正确
- 静态资源引用方式不符合 Vite 的处理规则

优先检查：

- `base`
- 资源是否放在 `public` / `src/assets`

### 4. 依赖是 CommonJS，构建报错或运行异常

Vite 大多能处理，但遇到老库：

- 可能需要 `optimizeDeps.include` 强制预构建
- 或需要替换为更现代的依赖

---

## 九、Vue3 + Vite 的定位总结

你可以用一句话记住 Vite：

- **开发环境用浏览器原生 ESM 提速，生产环境用 Rollup 打包产出。**

它对前端工程师的价值是：

- 更快的开发反馈
- 更轻的配置心智负担
- 更贴近现代模块化标准（ESM）

如果你从 Vue2 + Webpack 迁移到 Vue3 + Vite，建议你重点建立的新心智模型是：

- `index.html` 是入口
- 开发不等于打包
- 生产构建才是 Rollup 的“最终打包”
- 环境变量用 `import.meta.env`
