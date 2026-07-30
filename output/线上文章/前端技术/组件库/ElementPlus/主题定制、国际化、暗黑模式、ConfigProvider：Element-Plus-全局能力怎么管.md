---
title: "主题定制、国际化、暗黑模式、ConfigProvider：Element Plus 全局能力怎么管"
slug: "element-plus-elementplus-configprovider-f9cb9b2c"
summary: "基于 2026-04-28 查阅的 Element Plus 官方文档，系统讲解 ConfigProvider、国际化、Day.js 本地化、CSS 变量主题、SCSS 主题与暗黑模式的实际用法。"
category: "ElementPlus"
categoryPath:
  - "前端技术"
  - "组件库"
  - "ElementPlus"
tags:
  - "Element Plus"
  - "ConfigProvider"
  - "国际化"
  - "暗黑模式"
  - "主题定制"
status: "published"
sortOrder: 70
cover: ""
originalId: "6a2d291f8a2b1c68f2cac646"
originalSlug: "element-plus-elementplus-configprovider-f9cb9b2c"
originalStatus: "published"
publishedAt: "2026-04-28T13:45:18.644Z"
updatedAt: "2026-06-13T10:28:29.649Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 主题定制、国际化、暗黑模式、ConfigProvider：Element Plus 全局能力怎么管

> 主人前面几篇解决的是：
>
> - 组件怎么接
> - 基础组件怎么用
> - 表单、表格、弹层怎么配
>
> 但项目真正做深一点之后，一定会碰到另一层问题：
>
> - 默认语言不对怎么办
> - 日期语言为什么没跟着变
> - 主色怎么统一替换
> - 暗黑模式怎么切
> - 全局尺寸和弹层层级放哪里管

这一篇就专门讲这些“全局层”的能力。

---

## 一、先把 ConfigProvider 理解成“全局控制面板”

Element Plus 官方在国际化和快速开始里都提到了 `ConfigProvider`。

主人可以先把它理解成：

**一个给组件库全局喂配置的容器。**

它能承载的典型配置包括：

- `locale`
- `size`
- `zIndex`

也就是说，很多“不是某一个组件自己的事”，都适合放进它。

---

## 二、国际化：默认其实是英文

官方国际化文档开头就明确说了：

- Element Plus 组件默认使用英文

所以如果你项目主要面向中文用户，不主动配语言，很多默认文案会是英文。

例如：

- 分页
- 日期选择器
- 时间选择器

---

## 三、国际化第一种方式：在 `app.use` 时全局传入

官方文档给出的写法是：

```js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')
```

这种方式适合：

- 完整引入
- 想一步到位设置全局语言

---

## 四、国际化第二种方式：用 ConfigProvider 包起来

官方国际化文档同样给了这种写法：

```vue
<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>
```

这更适合：

- 按需导入项目
- 想把全局配置统一放到应用壳子里

主人可以直接记：

- 完整引入
  - `app.use(ElementPlus, { locale })`
- 组件树方式
  - `ConfigProvider`

---

## 五、日期组件语言为什么有时还不对

这个地方特别容易踩坑。

官方国际化文档专门提醒：

- Element Plus 的日期时间组件使用 `Day.js`
- 你必须单独导入 Day.js 的语言包

也就是除了：

```js
import zhCn from 'element-plus/es/locale/lang/zh-cn'
```

还常常要再加：

```js
import 'dayjs/locale/zh-cn'
```

这件事的本质是：

- 组件库自己的语言
- 日期库自己的语言

是两层，不是一层。

如果主人只配了前者，某些日期相关显示还是可能不完整。

---

## 六、全局尺寸和层级也适合统一管理

官方快速开始文档里明确说了：

- `size`
  - 设置表单组件默认尺寸
- `zIndex`
  - 设置弹出组件层级
- `zIndex` 默认值是 `2000`

### 1. 在 `app.use` 里配

```js
app.use(ElementPlus, {
  size: 'small',
  zIndex: 3000
})
```

### 2. 在 ConfigProvider 里配

```vue
<template>
  <el-config-provider :locale="zhCn" :size="size" :z-index="zIndex">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const size = 'small'
const zIndex = 3000
</script>
```

### 3. 为什么这两个值很重要

`size` 关系到：

- 表单密度
- 后台页面紧凑程度

`zIndex` 关系到：

- Dialog
- Drawer
- Message
- Select 下拉层
- DatePicker 面板

如果项目自己也有很多浮层，这个值一定要有统一认知。

---

## 七、主题定制第一优先：CSS 变量

官方主题文档提到：

- 几乎所有组件的样式系统都被 CSS 变量重构了

这句话非常关键。

它意味着：

**很多定制，不需要你一上来就走 SCSS 重编译。**

### 1. 全局主色覆盖

```css
:root {
  --el-color-primary: #0f766e;
}
```

### 2. 改圆角、背景等

```css
:root {
  --el-color-primary: #0f766e;
  --el-border-radius-base: 10px;
}
```

### 3. 局部区域定制

官方主题文档还特别建议：

- 出于性能原因
- 更推荐在类名下添加自定义变量
- 而不是全局一股脑写在 `:root`

例如：

```css
.finance-panel {
  --el-color-primary: #166534;
  --el-card-border-color: #bbf7d0;
}
```

然后这块区域里的 Element Plus 组件就会吃到这些变量。

这个思路非常强。

---

## 八、为什么官方现在更推 CSS 变量

因为它解决了几个很现实的问题：

### 1. 改动快

不需要为了改一两个颜色就重编译整套样式。

### 2. 动态性强

切主题、切品牌色、做局部视觉分区都更方便。

### 3. 和 SCSS 主题系统兼容

官方文档明确写了：

- CSS 变量系统和 SCSS 变量系统兼容
- 他们会用 SCSS 函数生成对应 CSS 变量

所以不是二选一，而是：

- 小改动优先 CSS 变量
- 大改动再上 SCSS

---

## 九、主题定制第二层：SCSS 变量方案

如果主人不是只想改一个主色，而是要重做整套主题，那就可以走官方给的 SCSS 方案。

官方主题文档核心写法是：

```scss
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': green
    )
  )
);
```

然后在入口引：

```js
import './styles/element/index.scss'
```

### 1. 官方特别强调的一件事

要用：

- `@use`
- `@forward`

不要再优先写旧式：

- `@import`

官方文档直接提醒：

- 应该用 `@use 'xxx.scss' as *`

这是和 Sass 模块体系一致的。

### 2. 为什么要单独建 `styles/element/index.scss`

官方建议你专门建一个文件来合并自定义变量和 Element Plus 变量。

因为这样：

- 结构清楚
- 变量入口统一
- 不容易乱

### 3. 官方还提醒了一个性能点

不要把你自己的普通业务 SCSS 和 Element Plus 变量 SCSS 全搅在一起。

否则：

- 每次热更新
- 都会编译很多 SCSS
- 开发速度会变慢

这条提醒非常实际。

---

## 十、按需导入时怎么定制主题

官方主题文档没有只讲“完整引入”，它还专门讲了：

**按需导入时怎么配主题。**

核心思路有两步：

### 1. `scss.additionalData`

在 `vite.config.ts` 里：

```js
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ElementPlus from 'unplugin-element-plus/vite'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;`
      }
    }
  },
  plugins: [
    vue(),
    ElementPlus({
      useSource: true
    })
  ]
})
```

### 2. `useSource: true`

这一步的意思是：

- 用组件源码样式
- 让你的 Sass 变量有机会参与编译

如果主人后面走按需导入 + 深度主题定制，这个配置就非常关键。

---

## 十一、暗黑模式：官方已经有标准接法

官方暗黑模式文档开头直接说：

- Element Plus 支持暗黑模式了

而且它的实现思路和主题定制是一脉相承的：

- 基于 CSS Vars

### 1. 先引入暗黑变量文件

```js
import 'element-plus/theme-chalk/dark/css-vars.css'
```

### 2. 固定暗黑模式

官方文档说得很直白：

如果只需要暗色模式，只要在 `html` 上加：

```html
<html class="dark">
```

### 3. 动态切换

官方建议可以用 `VueUse` 的 `useDark`。

如果不依赖它，本质上也是切 `html.dark`。

比如：

```js
document.documentElement.classList.toggle('dark')
```

---

## 十二、暗黑模式自定义变量怎么改

官方暗黑模式文档给了两条路。

### 1. 直接用 CSS 覆盖

比如新建：

- `styles/dark/css-vars.css`

写：

```css
html.dark {
  --el-bg-color: #0f172a;
}
```

然后在入口里：

```js
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/dark/css-vars.css'
```

### 2. 用 SCSS 覆盖

官方也给了：

```scss
@forward 'element-plus/theme-chalk/src/dark/var.scss' with (
  $bg-color: (
    'page': #0a0a0a,
    '': #626aef,
    'overlay': #1d1e1f
  )
);
```

这个适合更系统的深色主题重做。

---

## 十三、给主人一个统一的全局入口示例

如果主人现在要搭一个比较标准的全局壳子，我会更推荐下面这种写法：

```vue
<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'dayjs/locale/zh-cn'
</script>

<template>
  <el-config-provider :locale="zhCn" size="small" :z-index="3000">
    <router-view />
  </el-config-provider>
</template>
```

如果项目还支持暗黑模式，在入口再引：

```js
import 'element-plus/theme-chalk/dark/css-vars.css'
```

如果还要自定义主题，再继续引：

```js
import './styles/element/index.scss'
import './styles/dark/css-vars.css'
```

这套结构已经很像真实项目了。

---

## 十四、主人最容易踩的坑

### 1. 只配 Element Plus 语言，不配 Day.js 语言

结果分页是中文，日期面板还是没完全对。

### 2. 一上来就只会暴力覆盖 class

现在很多情况下优先看：

- 有没有 CSS 变量

这往往比硬盖 class 更稳。

### 3. 按需导入时改 SCSS 主题，却没配 `useSource`

那你的变量可能根本没参与进正确的样式编译流程。

### 4. 暗黑模式只切类名，不引暗黑变量文件

那当然不会正常生效。

### 5. 把全局配置散落在很多页面里

像：

- `locale`
- `size`
- `zIndex`

这些更适合统一收在 `ConfigProvider` 或入口层。

---

## 十五、这一篇学完后你应该会什么

学完这篇，主人应该能做到：

1. 知道 Element Plus 默认是英文
2. 会用 `locale` 和 `ConfigProvider` 切中文
3. 知道日期组件还要单独处理 Day.js 语言
4. 会优先用 CSS 变量改主题
5. 会在需要时用 SCSS 变量做深度主题定制
6. 会开启和覆盖暗黑模式

这已经是“把组件库接进项目”之后真正进阶的一层能力了。

---

## 十六、官方资料入口

- 国际化：
  - [https://element-plus.org/zh-CN/guide/i18n.html](https://element-plus.org/zh-CN/guide/i18n.html)
- 主题定制：
  - [https://element-plus.org/zh-CN/guide/theming.html](https://element-plus.org/zh-CN/guide/theming.html)
- 暗黑模式：
  - [https://element-plus.org/zh-CN/guide/dark-mode.html](https://element-plus.org/zh-CN/guide/dark-mode.html)
- 快速开始：
  - [https://element-plus.org/zh-CN/guide/quickstart.html](https://element-plus.org/zh-CN/guide/quickstart.html)
- ConfigProvider：
  - [https://element-plus.org/zh-CN/component/config-provider.html](https://element-plus.org/zh-CN/component/config-provider.html)

---

## 十七、最后一句话总结

Element Plus 用到后面，真正拉开项目成熟度差距的，往往不是某一个组件会不会写。

而是你会不会统一管理：

- 语言
- 尺寸
- 层级
- 主题
- 暗黑模式

这就是 `ConfigProvider + 主题系统 + 国际化` 这一层的价值。
