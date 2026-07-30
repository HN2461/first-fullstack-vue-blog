---
title: "安装与引入：把 Element Plus 真正接进 Vue 3 项目"
slug: "element-plus-elementplus-975655e4"
summary: "基于 2026-04-28 查阅的 Element Plus 最新官方资料，详细整理安装、完整引入、自动按需导入、手动导入、Volar 支持和全局配置的实际用法。"
category: "ElementPlus"
tags:
  - "Element Plus"
  - "Vue3"
  - "Vite"
  - "按需导入"
  - "全局配置"
status: "draft"
sortOrder: 100
cover: ""
originalId: "6a2d291f8a2b1c68f2cac624"
originalSlug: "element-plus-elementplus-975655e4"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 安装与引入：把 Element Plus 真正接进 Vue 3 项目

> 主人前一篇已经知道 `Element Plus` 是 Vue 3 常见的 PC 端组件库。  
> 这一篇我们不再停留在“知道它是什么”，而是直接解决更实际的问题：
>
> **在真实项目里，到底怎么把它接进去。**

---

## 一、先看官方最新口径

我这篇是按 **2026-04-28** 查到的官方文档写的。

当前 Element Plus 官网顶部显示的版本是：

- `2.13.7`

GitHub Releases 页面里，最新正式版也是：

- `2.13.7`
- 发布时间：`2026-04-10`

所以后面这一整套写法，主人都可以理解成：

**按当前最新版官方推荐方案来接。**

---

## 二、安装前先知道兼容性

官方安装页有几句很关键，主人最好先记住。

### 1. 它不支持 IE

原因不是 Element Plus 单独不支持，而是：

- `Vue 3` 本身就不支持 `IE11`
- 所以 `Element Plus` 也不支持 IE

### 2. 官方说支持最近两个版本的浏览器

安装页给了兼容性说明。

对于 `2.5.0+` 版本，大致是：

- Chrome `>= 85`
- Edge `>= 85`
- Firefox `>= 79`
- Safari `>= 14.1`

如果主人项目还要兼容更老环境，就不能只装组件库完事，还得自己补：

- Babel
- Polyfill

### 3. 如果你要改主题并且项目里用了 Sass

官方安装页还特别写了：

- 从 `2.8.5` 起，Sass 最低支持版本是 `1.79.0`

如果终端提示：

```txt
legacy JS API Deprecation Warning
```

官方建议在 `vite.config.ts` 里加：

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' }
    }
  }
})
```

这个不是“必须一开始就加”，而是主人遇到 Sass 警告时要知道官方怎么处理。

---

## 三、最基础安装

官方安装页先给的是包管理器安装。

最常见的就是：

```bash
npm install element-plus --save
```

你也可以用：

```bash
yarn add element-plus
pnpm install element-plus
```

如果网络不稳定，官方也提到可以切镜像。

不过对主人现在来说，先记这一句就够：

**现代 Vue 项目里，先 `npm install element-plus`。**

---

## 四、第一种接法：完整引入

这是主人最容易上手的方式。

官方快速开始明确写了：

- 如果你对打包体积不是特别敏感
- 完整引入最方便

### 1. 入口文件写法

```js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
```

这段代码的意思非常直接：

- `import ElementPlus from 'element-plus'`
  - 导入整个组件库
- `import 'element-plus/dist/index.css'`
  - 导入默认样式
- `app.use(ElementPlus)`
  - 把组件库挂到 Vue 应用上

### 2. 这种方式的优点

- 接入速度最快
- 配置最少
- 最适合初学、演示、小项目、快速验证

### 3. 缺点

- 不是按需的
- 理论上会比只引你用到的组件更重

所以主人可以这样理解：

- 学习阶段、试验阶段：完整引入很舒服
- 正式项目：更常见的是按需导入

---

## 五、如果你在用 TypeScript 和 Volar

官方快速开始里还专门提了一件事：

如果你使用 `Volar`，可以在 `tsconfig.json` 里补类型：

```json
{
  "compilerOptions": {
    "types": ["element-plus/global"]
  }
}
```

这个点的目的不是让页面跑起来，而是让编辑器更懂全局组件类型。

主人如果是纯 JavaScript 项目，可以先不管。

如果是 TypeScript 项目，看到这个配置不要陌生。

---

## 六、第二种接法：自动按需导入

这才是现在真实项目里最常见的方案。

官方快速开始把它标成了：

- `自动导入`
- `推荐`

### 1. 先装两个插件

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

### 2. 配 `vite.config.js`

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
})
```

### 3. 这种方案最爽的地方是什么

你在页面里直接写：

```vue
<template>
  <el-button type="primary">保存</el-button>
  <el-input v-model="keyword" placeholder="请输入关键词" />
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('')
</script>
```

很多情况下就不用自己手写：

```js
import { ElButton, ElInput } from 'element-plus'
```

### 4. 为什么官方推荐它

因为它兼顾了两件事：

- 写法省心
- 仍然是按需的

这很适合真实业务项目。

主人如果问我现代 `Vue 3 + Vite` 项目最推荐哪种接法，我会直接答：

**自动按需导入。**

---

## 七、第三种接法：手动导入

官方也给了“手动导入”的方案。

它的意思是：

- 组件你自己导
- 样式通过插件处理

官方示例大致是这样：

```vue
<template>
  <el-button>I am ElButton</el-button>
</template>

<script setup>
import { ElButton } from 'element-plus'
</script>
```

再配 `unplugin-element-plus`：

```js
import { defineConfig } from 'vite'
import ElementPlus from 'unplugin-element-plus/vite'

export default defineConfig({
  plugins: [ElementPlus()]
})
```

### 什么时候会用这种方案

一般是：

- 你想更清楚地控制导入行为
- 项目本来就偏显式导入风格
- 或者你后面要配合 Sass 源码样式做主题定制

但如果主人不是在做特殊工程化定制，一开始不一定非要走这条。

---

## 八、Nuxt 项目也有官方接法

官方快速开始里还提到：

Nuxt 用户可以直接装：

```bash
npm install -D @element-plus/nuxt
```

然后在 `nuxt.config.ts` 里加：

```ts
export default defineNuxtConfig({
  modules: ['@element-plus/nuxt']
})
```

这说明 Element Plus 官方不是只顾 Vite，也给 Nuxt 做了专门接法。

不过主人当前博客仓库是 Vite，所以这里知道就行。

---

## 九、全局配置：size 和 zIndex

官方快速开始里还给了一个很重要的入口：

**全局配置对象。**

### 1. 完整引入时

```js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus, {
  size: 'small',
  zIndex: 3000
})
```

这里官方特别说明了：

- `size`
  - 设置表单类组件默认尺寸
- `zIndex`
  - 设置弹出类组件层级
- `zIndex` 默认值是 `2000`

### 2. 按需引入时

官方建议用 `ConfigProvider`：

```vue
<template>
  <el-config-provider :size="size" :z-index="zIndex">
    <app />
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'

const zIndex = 3000
const size = 'small'
</script>
```

这就意味着：

- 完整引入时，很多全局配置可以放在 `app.use()`
- 按需导入时，更常见的是用 `ConfigProvider`

---

## 十、到底该选哪种接法

主人实际做项目时，可以直接这样选。

### 1. 只是想先跑起来

选：

- 完整引入

因为最省脑子。

### 2. 做正式 Vue 3 + Vite 项目

优先选：

- 自动按需导入

因为它兼顾开发体验和工程化。

### 3. 你要做更细致的样式控制

可以考虑：

- 手动导入
- `unplugin-element-plus`
- 配合 Sass 主题定制

---

## 十一、主人最容易踩的坑

### 1. 只装包，不引样式

完整引入时，很多人只写：

```js
app.use(ElementPlus)
```

却忘了：

```js
import 'element-plus/dist/index.css'
```

页面就会出现“组件能用，但看起来不对”的情况。

### 2. Vue 3 项目还去找 Element UI 教程

这个坑非常常见。

要记住：

- `Element UI` 对应 `Vue 2`
- `Element Plus` 对应 `Vue 3`

### 3. 自动按需导入只装一个插件

官方推荐的是两件套：

- `unplugin-vue-components`
- `unplugin-auto-import`

别只装一个，然后怪它“不自动”。

### 4. 以为按需导入就一定零配置

不是。

你还是要在 `vite.config.js` 里把 resolver 配上。

### 5. 弹层层级和项目自己样式打架

如果你项目里有：

- 自己的固定头部
- 地图弹窗
- 富文本浮层
- 多层弹窗

就要早点考虑 `zIndex`，别等页面套深了再补。

---

## 十二、给主人一份最短落地步骤

如果主人现在就想开一个新的 Vue 3 + Vite 项目并接入 Element Plus，最短可以这样做：

### 方案 A：先跑起来

1. `npm install element-plus`
2. 在 `main.js` 引入 `ElementPlus`
3. 引入 `element-plus/dist/index.css`
4. `app.use(ElementPlus)`

### 方案 B：更像真实项目

1. `npm install element-plus`
2. `npm install -D unplugin-vue-components unplugin-auto-import`
3. 在 `vite.config.js` 配 `ElementPlusResolver`
4. 组件模板里直接写 `el-button`、`el-input`
5. 用 `ConfigProvider` 统一全局尺寸和层级

---

## 十三、这一篇学完后你应该会什么

学完这篇，主人至少应该搞清楚：

1. Element Plus 安装包怎么装
2. 完整引入怎么写
3. 自动按需导入为什么是官方推荐
4. 手动导入和 `unplugin-element-plus` 是干嘛的
5. 全局 `size`、`zIndex` 应该放哪

如果这些点都清楚了，后面再去学具体组件就不会乱。

---

## 十四、官方资料入口

- 安装：
  - [https://element-plus.org/zh-CN/guide/installation](https://element-plus.org/zh-CN/guide/installation)
- 快速开始：
  - [https://element-plus.org/zh-CN/guide/quickstart.html](https://element-plus.org/zh-CN/guide/quickstart.html)
- 发布记录：
  - [https://github.com/element-plus/element-plus/releases](https://github.com/element-plus/element-plus/releases)

---

## 十五、最后一句话总结

Element Plus 的接入并不复杂。

真正要分清的只有一件事：

**你现在是要“先跑起来”，还是要“按正式项目方式接”。**

前者用完整引入，后者优先用官方推荐的自动按需导入。
