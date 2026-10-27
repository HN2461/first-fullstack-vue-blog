---
title: "第 4 篇：ConfigProvider 全局配置：中文国际化、日期语言与主题定制"
slug: "ant-design-vue-config-provider-locale-theme"
summary: "用 ConfigProvider 统一 Ant Design Vue 组件的语言和主题，分别配置中文组件文案、Day.js 日期语言、设计 token、暗色算法和动态切换。"
category: "Ant Design Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design Vue"
tags:
  - "Ant Design Vue"
  - "ConfigProvider"
  - "国际化"
  - "主题定制"
  - "暗色模式"
status: "published"
sortOrder: 40
cover: ""
originalId: "6ae0a8dad7963ed85be766ae"
originalSlug: "ant-design-vue-config-provider-locale-theme"
originalStatus: "published"
publishedAt: "2026-10-27T13:36:26.423Z"
updatedAt: "2026-10-27T13:36:26.475Z"
exportedAt: "2026-10-27T13:37:05.301Z"
---
# 第 4 篇：ConfigProvider 全局配置：中文国际化、日期语言与主题定制

当一个项目有很多 Ant Design Vue 组件时，逐个给组件传语言和主题配置会重复，也容易遗漏。`ConfigProvider` 是官方提供的配置提供者，可以把全局或局部配置放在组件树上层，再让下层组件读取。

## 一、先理解“提供者”和组件树

Vue 页面由组件嵌套组成。父组件可以通过上下文向子孙组件提供配置。`a-config-provider` 就像一个配置范围：放在它里面的组件可以使用它提供的 locale、主题等配置；放在外面的组件不会自动继承。

典型层级如下：

```text
createApp
└─ App.vue
   └─ a-config-provider
      └─ a-app
         └─ router-view
            └─ 页面与 Ant Design Vue 组件
```

`ConfigProvider` 负责配置，`App` 负责一部分应用级反馈 API 的上下文和 reset 样式。下一篇会解释为什么两者的层级会影响 `message`、`modal` 和 `notification`。

## 二、配置组件内置中文文案

例如分页器、日期选择器会显示组件库内置的文字。可以从 Ant Design Vue 提供的 locale 包中导入简体中文配置：

```vue
<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>
```

`:locale="zhCN"` 是动态绑定，传递的是导入的配置对象。它会影响组件库支持国际化的内置文案，不会翻译你自己写的“保存”“用户列表”等业务文字；业务文字需要由应用自身的 i18n 方案管理。

## 三、日期组件的语言还要配置 Day.js

日期时间组件使用的日期库也有自己的语言设置。仅设置 Ant Design Vue 的 locale，可能不会改变日期对象的月份、星期或格式化文字。官方国际化说明还要求按需设置 Day.js：

```js
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
```

这段初始化可以放在应用入口模块中，确保日期组件使用前已执行。两个配置负责不同范围：Ant Design Vue locale 控制组件内置文案，Day.js locale 控制日期库语言。遇到日期仍是英文，分别检查这两处，而不要只重复设置 `ConfigProvider`。

## 四、使用主题 token 改主色

主题 token 是一组有语义的设计变量，例如主色、圆角、字体大小。通过 token 配置比到处覆盖组件内部 CSS 类更稳定，也更容易保持各组件一致。

```vue
<script setup>
const appTheme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6
  }
}
</script>

<template>
  <a-config-provider :theme="appTheme">
    <a-space>
      <a-button type="primary">主按钮</a-button>
      <a-button>普通按钮</a-button>
    </a-space>
  </a-config-provider>
</template>
```

`theme` 对象会传给 Provider；`token` 是基础设计变量。官方可配置 token 的范围会随版本扩展，查看 [主题定制文档](https://www.antdv.com/docs/vue/customize-theme-cn) 的 Design Token 部分，不要只根据其他技术栈 Ant Design 代码推测 Vue 版本支持相同字段。

## 五、切换默认、暗色和紧凑算法

除了调整颜色，Ant Design Vue 还提供主题算法，例如默认、暗色和紧凑。可以根据响应式状态切换：

```vue
<script setup>
import { computed, ref } from 'vue'
import { theme } from 'ant-design-vue'

const isDark = ref(false)

const appTheme = computed(() => ({
  algorithm: isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1677ff'
  }
}))
</script>

<template>
  <a-config-provider :theme="appTheme">
    <a-space direction="vertical">
      <a-switch v-model:checked="isDark" checked-children="暗色" un-checked-children="浅色" />
      <a-card title="主题预览">切换上面的开关，观察组件主题变化。</a-card>
    </a-space>
  </a-config-provider>
</template>
```

这里的 `computed` 会在开关变化时重新生成主题配置。暗色算法改变组件 token 的计算结果，不等同于为整个网站自动补齐所有自定义 CSS；页面自己写的背景、图表和图片仍需考虑暗色可读性。`compactAlgorithm` 可用于更紧凑的组件密度，具体组合方式和限制以当前主题文档为准。

## 六、全局配置还是局部配置

如果整个站点都要统一语言和主色，把 Provider 放到应用较高层级。若只有一个独立区域需要特殊主题，可以在该区域外再放一个局部 `ConfigProvider`。后代组件会按组件树作用域读取更近的配置。

不要在每个按钮周围重复套 Provider。也不要将 Provider 放在弹层触发按钮的同一层之外却期待静态 API 自动继承，静态方法的上下文问题会在下一篇解释。

## 七、常见排查

- **分页中文、日期仍英文**：检查 Day.js locale 文件是否引入并调用 `dayjs.locale()`。
- **主色没有变化**：确认用的是 `:theme="对象"` 而非普通字符串，检查组件是否位于 Provider 子树内，核对 token 名称和版本。
- **切换开关后不更新**：确认主题对象是响应式 `computed`，而不是只在初始化时计算一次的普通常量。
- **只有组件库变暗，自定义区域仍刺眼**：暗色 token 只影响支持 token 的组件，自定义样式需单独适配。
- **全局提示不继承当前主题**：不要先怀疑 token 写错，检查提示是通过静态方法创建，还是通过 `App.useApp()` 的上下文 API 获取。

## 八、官方资料

- [ConfigProvider](https://www.antdv.com/components/config-provider-cn)
- [国际化](https://www.antdv.com/docs/vue/i18n-cn)
- [主题定制](https://www.antdv.com/docs/vue/customize-theme-cn)
- [App 组件](https://www.antdv.com/components/app-cn)
