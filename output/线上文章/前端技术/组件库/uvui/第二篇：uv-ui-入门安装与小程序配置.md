---
title: "第二篇：uv-ui 入门安装与小程序配置"
slug: "uv-ui-uvui-uv-ui-0ffe625b"
summary: "从安装方式、扩展配置、主题样式到微信小程序常见踩坑，梳理一份适合 uni-app 项目落地 uv-ui 的入门配置清单。"
category: "uvui"
categoryPath:
  - "前端技术"
  - "组件库"
  - "uvui"
tags:
  - "uv-ui"
  - "uni-app"
  - "微信小程序"
  - "easycom"
  - "SCSS"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291f8a2b1c68f2cac66c"
originalSlug: "uv-ui-uvui-uv-ui-0ffe625b"
originalStatus: "published"
publishedAt: "2026-05-03T12:31:10.921Z"
updatedAt: "2026-06-13T10:28:29.717Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 第二篇：uv-ui 入门安装与小程序配置

> 如果你的小程序项目已经决定用 `uv-ui`，最先要解决的不是“先学哪个组件”，而是“先把底座搭稳”。  
> 这篇就按这个顺序来：先认识框架，再安装，再做扩展配置，最后把微信小程序里最容易踩的坑一次补齐。

这篇内容已按 **2026-05-03** 再次核对 `uv-ui` 官方安装、扩展配置、注意事项、常见问题和更新日志文档。  
当前公开更新日志页顶部版本仍是 `1.1.20（2024-01-20）`，所以更适合把它理解成一套**稳定可用、但要重视真机验证**的多端框架。

## 一、uv-ui 适合放在什么位置理解

结合官方文档和仓库说明，`uv-ui` 可以理解成：

- 基于 `uni-app` 生态、承接 `uView2.x` 能力演进的一套 UI 框架
- 同时兼容 Vue 2、Vue 3、H5、App 和多种小程序
- 除了组件，还提供工具库、主题变量、请求封装和一些通用能力

如果你做的是微信小程序，它的价值主要不在“按钮长得更好看”，而在于：

- 表单、弹窗、上传、导航这些高频组件比较全
- 多端差异已经被框架帮你抹平了一部分
- 主题、工具库、请求能力可以统一组织

## 二、安装方式先选对

官方安装文档里给了两条主路。

### 1. HBuilderX 导入 `uni_modules`，这是最省心的

如果你本来就是 HBuilderX 开发 `uni-app`，更推荐直接通过插件市场导入。

优点是：

- 升级路径比较顺
- easycom 基本不用你再手写太多额外配置
- 更贴近官方示例和社区使用习惯

官方还特别提醒了一点：

`不要用“下载插件 ZIP”去代替推荐的导入方式。`

### 2. npm 安装也可以，但要补 easycom

```bash
npm i @climblee/uv-ui
```

安装后要在 `pages.json` 里加 `easycom`：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^uv-(.*)": "@climblee/uv-ui/components/uv-$1/uv-$1.vue"
    }
  }
}
```

如果是 Vue 2 CLI 项目，还要额外处理 `node_modules` 转译问题：

```js
module.exports = {
  transpileDependencies: ['@climblee/uv-ui']
}
```

## 三、扩展配置才是“真正开始能用”的那一步

官方文档明确提到，`uv-ui` 的很多内置方法默认不会直接挂到 `uni` 上。想在项目里稳定使用 `uni.$uv.xxx`，要先完成扩展配置。

### 1. 在 `main.js` 注册工具库

HBuilderX 导入方式：

```js
import App from './App'
import { createSSRApp } from 'vue'
import uvUI from '@/uni_modules/uv-ui-tools'

// #ifndef VUE3
Vue.use(uvUI)
// #endif

// #ifdef VUE3
export function createApp() {
  const app = createSSRApp(App)
  app.use(uvUI)
  return {
    app
  }
}
// #endif
```

注册完成后，你就可以在项目里使用：

- `uni.$uv.toast()`
- `uni.$uv.http`
- `uni.$uv.random()`
- `this.$uv.getRect()` 这类工具方法

注意一个细节：

有些方法不能写成 `uni.$uv.xxx`，而要通过 `this.$uv.xxx` 调，比如获取节点信息这类依赖 mixin 的方法。

### 2. 在 `uni.scss` 引入主题文件

```scss
@import '@/uni_modules/uv-ui-tools/theme.scss'
@import '@/common/css/theme-self.scss'
```

如果你还没有自己的主题文件，可以先只引入 `theme.scss`，后面再覆盖变量。

### 3. 在 `App.vue` 全局引入基础样式

```html
<style lang="scss">
@import '@/uni_modules/uv-ui-tools/index.scss'
</style>
```

这一步很重要，官方给出的理由很实际：

- 隐藏 `scroll-view` 的滚动条
- 避免 `uv-modal` 之类的组件挡住 `uni.showToast`
- 可以直接使用 `uv-line-1`、`uv-border`、`uv-hover-class` 等内置样式

### 4. 需要时再补 `setConfig`

如果你想统一默认单位、默认组件属性，可以用：

```js
uni.$uv.setConfig({
  config: {
    unit: 'rpx'
  },
  props: {
    text: {
      color: {
        default: '#303133'
      }
    }
  }
})
```

这一步不是刚装完就必须写，但项目准备长期维护时很值得做。

## 四、微信小程序里推荐先会用这几类组件

你不用一上来就把所有组件都学完。更推荐按场景学。

### 1. 表单流

先学这组：

- `uv-form`
- `uv-input`
- `uv-textarea`
- `uv-picker`
- `uv-datetime-picker`
- `uv-upload`

这套学会了，登录、地址表单、资料编辑、下单页基本都能覆盖。

### 2. 反馈流

再学这组：

- `uv-toast`
- `uv-notify`
- `uv-modal`
- `uv-popup`
- `uv-loading-page`
- `uv-empty`

小程序项目体验感差，很多时候不是接口慢，而是“没反馈”。

### 3. 导航和列表流

最后补这组：

- `uv-navbar`
- `uv-tabs`
- `uv-list`
- `uv-cell`
- `uv-load-more`
- `uv-sticky`

它们决定的是页面组织效率，不是最先要学，但会高频用到。

## 五、主题不要等项目做大了再补

官方文档把主题变量放在 `theme.scss` 里，本质上就是给你一套统一视觉入口。

如果你现在就定下主色、边框色、提示色，后面会省很多事。

例如：

```scss
$uv-primary: #1677ff
$uv-main-color: #1f2329
$uv-content-color: #4e5969
$uv-border-color: #dcdfe6
$uv-bg-color: #f5f7fa
```

主题这件事越晚做，后面越容易出现：

- 页面 A 一个蓝
- 页面 B 又是另一个蓝
- Toast、按钮、标签的强调色不统一

## 六、微信小程序常见坑，最好在一开始就知道

### 1. 先确认技术前提

根据官方注意事项：

- `uv-ui` 依赖 `SCSS`
- 项目建议使用 `uni-app` 的 V3 模式
- 微信小程序基础库建议在 `2.19.2` 及以上

所以你遇到“明明照着文档配了，结果不生效”时，先别急着怀疑组件，先查这三个前提。

### 2. 安装后别只点“重新编译”

官方安装文档和注意事项都强调过，微信小程序场景下缓存很顽固。更稳的做法是：

1. 关闭微信开发者工具
2. 删除一次 `unpackage`
3. 重新运行项目

很多“组件解析失败”“样式没更新”的问题，根本不是代码错，而是缓存没清。

### 3. Vue 3 下 `ref` 名不要和组件名撞

官方常见问题提到，在 `script setup` 场景里，`uv-picker` 这类组件的 `ref` 不要写成同名风格。

错误示例：

```html
<uv-picker ref="uvPicker"></uv-picker>
```

更稳的写法：

```html
<uv-picker ref="pickerRef"></uv-picker>
```

### 4. 弹窗滚动穿透要自己收口

小程序里常见的问题是：`uv-popup` 打开了，下面页面还能滚。

官方推荐配合 `page-meta` 控制页面样式：

```html
<template>
  <page-meta :page-style="'overflow:' + (popupVisible ? 'hidden' : 'visible')"></page-meta>

  <uv-popup
    ref="popupRef"
    @open="popupVisible = true"
    @close="popupVisible = false"
  >
    <view>内容</view>
  </uv-popup>
</template>
```

### 5. 涉及 `open-type` 的场景，原生 `button` 反而更好用

官方基础样式文档里专门提到，像登录授权、分享、手机号获取这类场景，有时更适合直接用原生 `button`，再加 `uv-reset-button` 去掉默认样式。

```html
<button
  class="uv-reset-button"
  open-type="getPhoneNumber"
  @getphonenumber="handlePhone"
>
  获取手机号
</button>
```

这类情况不要强行追求“全项目所有按钮都必须是 `uv-button`”。

### 6. 宽度和样式别总想着直接改组件根节点

官方建议大多数组件用 `custom-style` 去改内部样式。如果你要控制整体宽度，外面再包一层 `view`，通常比硬改组件更稳。

## 七、我更推荐的学习顺序

如果你是边做项目边学，顺序可以这样排：

1. 安装、扩展配置、主题和基础样式
2. 表单组件和反馈组件
3. 请求封装
4. 上传下载
5. 导航、列表和复杂布局
6. 再去学那些“看起来很酷”的扩展组件

这个顺序的好处是：

- 先解决项目能跑和能维护的问题
- 再解决业务页面的交互问题
- 最后再补体验和视觉层

## 八、这一篇学完后，下一篇最该接什么

下一篇最适合接：

`第三篇：uv-ui 请求封装与使用指南`

因为一旦安装和配置搞定，真正最影响项目维护成本的，就不是“会不会用组件”，而是“请求层有没有统一收口”。

## 参考资料

- [uv-ui 安装文档](https://www.uvui.cn/components/install.html)
- [uv-ui 扩展配置](https://www.uvui.cn/components/setting.html)
- [uv-ui 基础样式](https://www.uvui.cn/components/common.html)
- [uv-ui 注意事项](https://www.uvui.cn/guide/note.html)
- [uv-ui 常见问题](https://www.uvui.cn/components/problem.html)
- [uv-ui GitHub 仓库](https://github.com/climblee/uv-ui)
