---
title: "第 2 篇：Ant Design Vue 安装与注册：Vite、完整引入和按需导入"
slug: "ant-design-vue-install-registration-on-demand"
summary: "一步步在 Vue 3 + Vite 项目安装 Ant Design Vue，比较完整引入和自动按需导入，解释组件解析器、reset 样式、启动验证与常见安装故障。"
category: "Ant Design Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design Vue"
tags:
  - "Ant Design Vue"
  - "Vue3"
  - "Vite"
  - "按需导入"
  - "组件注册"
status: "published"
sortOrder: 20
cover: ""
originalId: "6ae0a8dad7963ed85be766ac"
originalSlug: "ant-design-vue-install-registration-on-demand"
originalStatus: "published"
publishedAt: "2026-10-27T13:36:26.423Z"
updatedAt: "2026-10-27T13:36:26.452Z"
exportedAt: "2026-10-27T13:37:05.301Z"
---
# 第 2 篇：Ant Design Vue 安装与注册：Vite、完整引入和按需导入

本篇要完成一个目标：在 Vue 3 + Vite 项目里成功显示一个 Ant Design Vue 按钮。先用完整引入理解注册，再介绍官方文档推荐的 Vite 自动组件导入方式。

## 一、开始前先确认项目目录

如果你已经有 Vue 3 + Vite 项目，打开该项目终端，确认当前目录能看到 `package.json`。安装命令应在这个目录执行，因为 npm 会把依赖写到当前项目的 `package.json` 和锁文件。

如果还没有项目，可以执行：

```bash
npm create vite@latest ant-vue-demo -- --template vue
cd ant-vue-demo
npm install
```

`npm create vite@latest` 会创建工程骨架，`cd` 进入项目，`npm install` 按照 `package.json` 安装基础依赖。它们和安装 Ant Design Vue 是两件事。

## 二、安装 Ant Design Vue

在项目根目录执行：

```bash
npm install ant-design-vue
```

安装完成后，依赖会记录在 `package.json`，具体解析版本通常写入 `package-lock.json`。团队项目要保留并提交锁文件，其他开发者才能安装同一套依赖树。

Ant Design Vue 4 面向 Vue 3。添加包之前应查看项目 Vue 版本及官方兼容说明；如果 npm 报 peer dependency 冲突，先读清楚冲突包和版本范围，不要先用 `--force` 把问题压下去。

## 三、方案 A：完整引入，适合初学验证

在 `src/main.js` 中注册组件库并加载 reset 样式：

```js
import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'

const app = createApp(App)

app.use(Antd)
app.mount('#app')
```

逐行理解：

- `createApp(App)` 创建一个 Vue 应用实例。
- `app.use(Antd)` 安装组件库插件，将组件注册到这个应用。
- `reset.css` 是官方提供的基础样式重置文件，需要在应用中显式导入。
- `app.mount('#app')` 把应用挂载到 `index.html` 中 id 为 `app` 的元素上。

这里的 reset 样式不是组件本身的安装开关。Ant Design Vue 4 的组件样式采用 CSS-in-JS 机制，组件运行时会生成所需样式；reset.css 用于统一基础 HTML 样式。若样式显示异常，先检查版本和官方快速开始，不要盲目再引入旧版本的整包 CSS 文件。

在 `src/App.vue` 中测试：

```vue
<template>
  <main class="demo">
    <h1>安装成功</h1>
    <a-button type="primary">第一个按钮</a-button>
  </main>
</template>

<style scoped>
.demo {
  padding: 24px;
}
</style>
```

运行 `npm run dev`，打开终端输出的本地地址。看见带 Ant Design Vue 样式的按钮，就说明安装、注册、挂载基本成功。

## 四、完整引入的优点和边界

完整引入配置最少，适合学习、组件试验和小型项目。开发者可以直接使用组件标签，不必逐个导入。

需要注意的是，整个组件库都会进入应用注册流程，项目扩大后可能带来更多代码和维护成本。现代构建工具和包的模块结构会影响最终产物，不能只凭“我全量引入了”就判断包体一定有多大；要精确比较，需检查实际构建产物。

## 五、方案 B：Vite 自动按需导入

官方介绍为 Vite 推荐了 `unplugin-vue-components`。它扫描 Vue 模板里的组件标签，为用到的组件补上导入代码。先安装开发依赖：

```bash
npm install -D unplugin-vue-components
```

修改 `vite.config.js`：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false
        })
      ]
    })
  ]
})
```

`Components` 是自动识别 Vue 组件的 Vite 插件；`AntDesignVueResolver` 告诉它如何将 Ant Design Vue 标签转换为组件导入。官方示例使用 `importStyle: false` 配合 CSS-in-JS。这个选项不表示关闭所有组件样式，而是避免走旧式逐组件 CSS 导入方式。

此时 `main.js` 不需要 `app.use(Antd)` 才能使用自动解析到的组件，但 reset 样式仍应保留：

```js
import { createApp } from 'vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'

createApp(App).mount('#app')
```

模板里照常写：

```vue
<template>
  <a-button type="primary">按需导入的按钮</a-button>
</template>
```

自动组件导入只处理组件标签，不会自动导入你在 `<script setup>` 里使用的 Vue API。例如 `ref` 仍需 `import { ref } from 'vue'`，除非你另行安装和配置了 JavaScript API 自动导入插件。

## 六、也可以手动导入组件

不用全量注册或解析器时，可以显式导入所需组件：

```vue
<script setup>
import { Button } from 'ant-design-vue'
</script>

<template>
  <Button type="primary">明确导入的按钮</Button>
</template>
```

手动导入更清楚地显示依赖，适合偏好显式代码的团队。是否自动按需处理样式需按当前版本官方说明确认。不要同时叠加多套彼此重复的组件注册方案，否则容易让人分不清组件来自哪里。

## 七、怎么选择

| 方式 | 配置成本 | 适合场景 | 需要记住的事 |
| --- | --- | --- | --- |
| 完整引入 | 最低 | 入门、验证、小项目 | `app.use(Antd)`，保留 reset 样式 |
| 自动按需导入 | 中等 | 常见 Vite 项目 | 配好 resolver，组件标签由插件解析 |
| 手动导入 | 逐个声明 | 强调显式依赖的项目 | 组件和样式行为按当前版本核对 |

初学时可以先完整引入跑通页面，再在熟悉 Vite 配置后切换自动导入。切换方案后必须重启 Vite 开发服务器，因为 Vite 配置文件变化需要重新加载。

## 八、常见问题排查

### 标签显示成普通文字或报未解析组件

确认完整引入时确实执行了 `app.use(Antd)`；自动导入时检查 `vite.config.js` 的插件顺序、resolver、文件扩展名是否在扫描范围内，然后重启开发服务器。

### 样式看起来缺了一部分

确认导入了 `ant-design-vue/dist/reset.css`，再确认版本和示例一致。不要复制 Ant Design React 的安装或 CSS 配置到 Vue 项目。

### 安装成功但 npm 报版本冲突

检查 `npm ls vue ant-design-vue` 的实际版本和官方兼容要求。修正依赖版本后重新安装，不要用强制参数掩盖不可兼容的 peer dependency。

## 九、官方资料

- [快速开始](https://www.antdv.com/docs/vue/getting-started-cn)
- [组件总览](https://www.antdv.com/components/overview-cn)
- [Vite 组件按需导入说明](https://www.antdv.com/docs/vue/introduce-cn)
- [npm 包](https://www.npmjs.com/package/ant-design-vue)
