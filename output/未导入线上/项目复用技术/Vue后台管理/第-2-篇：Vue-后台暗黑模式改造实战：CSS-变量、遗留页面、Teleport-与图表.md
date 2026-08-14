---
title: "第 2 篇：Vue 后台暗黑模式改造实战：CSS 变量、遗留页面、Teleport 与图表"
slug: "vue-admin-dark-mode-migration-guide"
summary: "面向 Vue 3 与 Element Plus 后台项目，讲清暗黑模式的状态管理、CSS 变量分层、遗留页面渐进改造、Teleport 浮层、局部浅色区域、Canvas 图表和回归验证。"
category: "Vue后台管理"
categoryPath:
  - "项目复用技术"
  - "Vue后台管理"
tags:
  - "Vue"
  - "Element Plus"
  - "暗黑模式"
  - "主题定制"
status: "draft"
sortOrder: 20
cover: ""
---

# 第 2 篇：Vue 后台暗黑模式改造实战：CSS 变量、遗留页面、Teleport 与图表

暗黑模式的难点不是把白色替换成黑色，而是在不破坏浅色主题的前提下，让页面背景、文字、边框、交互状态、浮层和图表都使用一致的主题语义。

本文聚焦已经存在大量历史页面的 Vue 3 后台项目。目标不是重写所有样式，而是建立一套可以逐页迁移、随时验证、出现问题也容易回退的改造方法。

## 一、先明确验收标准

一个可维护的双主题方案至少应满足：

1. 浅色和暗黑主题共用同一套业务逻辑。
2. 主题状态只有一个可信来源，不由多个组件分别维护。
3. 新页面优先消费语义变量，不直接写死背景、文字和边框颜色。
4. 历史页面可以渐进改造，不要求一次替换全部旧样式。
5. Dialog、Select、Popover 等 Teleport 浮层能够跟随主题。
6. 图表、编辑器、代码高亮等非普通 DOM 内容有独立适配方案。
7. 打印、证书、二维码等天然浅色内容允许保留局部浅色区域。
8. 刷新页面时不出现明显的主题闪烁。

暗黑模式首先是设计令牌和状态管理问题，其次才是具体页面的 CSS 问题。

## 二、主题状态应该如何流转

推荐把主题模式分成三种值：

```text
light   明确使用浅色主题
dark    明确使用暗黑主题
system  跟随操作系统
```

最终生效主题可以统一计算为 `light` 或 `dark`：

```js
const resolveTheme = (mode) => {
  if (mode !== 'system') return mode

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
```

应用主题时，只让一个入口修改根节点：

```js
const applyTheme = (theme) => {
  const root = document.documentElement

  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
  root.style.colorScheme = theme
}
```

这里同时维护三件事：

- `html.dark`：供 Element Plus 和历史覆盖样式使用。
- `data-theme`：供项目自己的主题选择器使用。
- `color-scheme`：让浏览器原生表单、滚动条等尽量匹配当前主题。

组件只负责触发“切换主题”动作，不应该各自直接操作 `document.documentElement`。主题模式、持久化和系统主题监听适合集中放在 Pinia store 或独立主题模块中。

## 三、Element Plus 的前置接入

如果项目使用 Element Plus，需要先引入官方暗黑变量文件：

```js
import 'element-plus/theme-chalk/dark/css-vars.css'
```

只切换 `html.dark`，却没有加载暗黑变量文件，会导致项目自定义区域变暗，而组件库控件仍保持浅色。

项目自己的主题变量可以放在单独样式文件中：

```scss
:root {
  --app-bg-page: #f5f7fa;
  --app-bg-panel: #ffffff;
  --app-bg-soft: #f8fafc;
  --app-text-primary: #1f2937;
  --app-text-secondary: #64748b;
  --app-border: #e5e7eb;
  --app-shadow-panel: 0 4px 16px rgb(15 23 42 / 8%);
}

html.dark {
  --app-bg-page: #0f1115;
  --app-bg-panel: #181b21;
  --app-bg-soft: #20242c;
  --app-text-primary: #e5e7eb;
  --app-text-secondary: #9ca3af;
  --app-border: #303642;
  --app-shadow-panel: 0 4px 18px rgb(0 0 0 / 28%);
}
```

项目变量不应复制所有组件库变量。只有当业务页面反复表达“页面背景、工作面板、次级区域、正文、辅助文字、业务边框”等语义时，才增加项目级令牌。

## 四、避免刷新时先亮后暗

如果等到 Vue 挂载后才从本地存储读取主题，浏览器会先按浅色渲染，再切到暗黑主题，形成明显闪烁。

可以在入口 HTML 中放一段尽量短的初始化脚本，在首屏样式计算前确定主题：

```html
<script>
  try {
    const mode = localStorage.getItem('theme-mode') || 'system'
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode
    const root = document.documentElement

    root.classList.toggle('dark', theme === 'dark')
    root.dataset.theme = theme
    root.style.colorScheme = theme
  } catch (error) {
    document.documentElement.dataset.theme = 'light'
  }
</script>
```

这段脚本只负责首屏初始化。Vue 启动后仍由主题 store 接管状态、系统主题监听和用户切换。

## 五、新页面只写一套语义样式

新页面不应分别维护完整的浅色和暗黑样式，而应优先使用 Element Plus 或项目语义变量：

```vue
<template>
  <section class="user-list-page">
    <div class="filter-panel">...</div>
    <div class="content-panel">...</div>
  </section>
</template>

<style scoped lang="scss">
.user-list-page {
  min-height: 100%;
  background: var(--app-bg-page);
  color: var(--app-text-primary);
}

.filter-panel,
.content-panel {
  background: var(--app-bg-panel);
  border: 1px solid var(--app-border);
  box-shadow: var(--app-shadow-panel);
}

.secondary-text {
  color: var(--app-text-secondary);
}
</style>
```

页面只表达元素承担的角色，具体颜色由主题层决定。这样可以避免后续每新增一个主题，就复制一套业务样式。

## 六、遗留页面的渐进改造策略

历史页面通常存在大量固定颜色：

```scss
.legacy-card {
  background: #fff;
  color: #303133;
  border: 1px solid #e4e7ed;
}
```

改造时不要机械地全局替换十六进制颜色。相同的 `#fff` 可能分别表示卡片、输入框、打印纸张、图标留白或图片背景，语义并不相同。

### 1. 简单样式直接变量化

能明确判断语义，且浅色主题视觉不会变化时，直接替换：

```scss
.legacy-card {
  background: var(--app-bg-panel);
  color: var(--app-text-primary);
  border: 1px solid var(--app-border);
}
```

### 2. 复杂页面先增加暗黑覆盖

对耦合较深、回归成本较高的页面，可以先保留浅色基准，只覆盖暗黑主题下出问题的区域：

```vue
<style scoped lang="scss">
.legacy-card {
  background: #fff;
  color: #303133;
}
</style>

<style lang="scss">
html.dark .legacy-user-page {
  .legacy-card {
    background: var(--app-bg-panel);
    color: var(--app-text-primary);
  }
}
</style>
```

全局覆盖必须带页面根类，例如 `.legacy-user-page`，避免一个页面的修复污染其他页面。

### 3. 在 scoped 样式中使用全局根节点

如果希望把覆盖保留在同一个 `scoped` 样式块中，需要显式声明 `html.dark` 是全局选择器：

```scss
:global(html.dark) .legacy-user-page {
  .legacy-card {
    background: var(--app-bg-panel);
  }
}
```

不要直接假设 `scoped` 中的 `html.dark` 一定能正确命中根节点。不同构建链对作用域选择器的转换细节可能不同，使用 `:global()` 更明确。

## 七、用审计清单替代全局搜索替换

逐页改造时，可以按以下顺序排查：

1. 页面根背景和主工作区背景。
2. 标题、正文、辅助文字和占位文字。
3. 边框、分割线、阴影和 hover 背景。
4. 表格头部、斑马纹、选中行和固定列。
5. 标签、徽标、成功、警告、失败等语义状态。
6. 空状态、加载状态和骨架屏。
7. 弹窗、抽屉、下拉面板、气泡卡片和消息提示。
8. 图表、编辑器、代码块、地图和第三方嵌入内容。
9. 打印、导出、二维码和图片预览。

固定颜色搜索只是定位手段，不是替换规则。重点要判断每个颜色承担的业务语义。

## 八、Teleport 浮层为什么容易漏

Dialog、Drawer、Select 下拉面板、Popover、Tooltip 等内容可能通过 Teleport 挂载到 `body`，不再是页面根节点的后代。

因此下面的选择器通常无法命中浮层：

```scss
html.dark .user-list-page .user-select-popper {
  /* popper 实际不在 user-list-page 内 */
}
```

推荐做法是给浮层增加稳定的专属类，再从全局主题入口限定：

```vue
<el-select
  v-model="role"
  popper-class="user-role-select-popper"
>
  ...
</el-select>
```

```scss
html.dark .user-role-select-popper {
  .custom-option-title {
    color: var(--el-text-color-primary);
  }

  .custom-option-description {
    color: var(--el-text-color-secondary);
  }
}
```

Element Plus 自身已经适配的部分不要重复覆盖。只处理业务模板中写死的自定义区域，并优先使用组件提供的 `popper-class`、`modal-class`、`body-class` 等扩展入口。具体属性以当前项目锁定的 Element Plus 版本为准。

## 九、局部浅色区域不是主题失败

以下内容在暗黑主题下仍可能需要保持浅色：

- 打印和 PDF 预览。
- 证书、成绩单、票据等纸张内容。
- 依赖浅色背景识别的二维码。
- 已经与浅色品牌图融合的登录面板。

可以把这类区域视为“浅色岛”，在局部重置变量：

```scss
html.dark .paper-preview {
  color-scheme: light;
  --el-bg-color: #ffffff;
  --el-bg-color-overlay: #ffffff;
  --el-fill-color: #f5f7fa;
  --el-border-color: #dcdfe6;
  --el-text-color-primary: #303133;
  --el-text-color-regular: #606266;
  --el-text-color-placeholder: #a8abb2;

  background: #ffffff;
  color: #303133;
}
```

这里的目标是保持真实内容和可读性，而不是强制所有区域都变黑。

## 十、语义色、图片和图标

成功、警告、失败、禁用等颜色具有业务含义，暗黑主题不应改变其语义，只需要调整背景透明度、边框和对比度。

```scss
.status-success {
  color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success) 14%, transparent);
}
```

图片和图标还需要单独判断：

- 透明 PNG 可能在暗色背景下出现白边。
- 只提供深色字样的品牌 Logo 需要准备反白版本。
- 不应对所有图片统一使用 `filter: invert()`，照片和业务截图会失真。
- SVG 优先使用 `currentColor` 或主题变量控制可变颜色。

## 十一、Canvas 图表不能只靠 CSS

ECharts、Chart.js 等通常把文字、坐标轴和网格线绘制在 Canvas 中，普通 CSS 变量不会自动改变已经绘制的像素。

可以将图表主题配置从当前主题派生：

```js
const buildChartOption = (isDark) => ({
  backgroundColor: 'transparent',
  textStyle: {
    color: isDark ? '#e5e7eb' : '#303133'
  },
  xAxis: {
    axisLabel: {
      color: isDark ? '#9ca3af' : '#606266'
    },
    splitLine: {
      lineStyle: {
        color: isDark ? '#303642' : '#ebeef5'
      }
    }
  }
})
```

主题切换后需要重新调用 `setOption`，或在图表库要求切换实例主题时销毁并重建实例。重建前要解绑 resize 监听并执行 `dispose`，避免重复实例和内存泄漏。

## 十二、常见失败原因

### 1. 页面仍有白块

重点检查：

- 固定的 `#fff`、`white` 和浅色渐变。
- 内联 `style`。
- 伪元素背景。
- 表格固定列的独立背景。
- Teleport 浮层。
- 第三方组件自己的主题配置。

### 2. 文字在暗色背景下发灰

不要只提高亮度。先区分主文字、正文、辅助文字、占位文字和禁用文字，再映射到不同语义变量。

### 3. 浅色主题被改坏

常见原因是直接修改了全局 `.el-card`、`.el-table`、`.el-dialog`，或者为了压过旧样式大量使用 `!important`。

优先缩小选择器范围，明确页面根类和主题入口。`!important` 只用于无法改变的第三方内联优先级，并记录原因。

### 4. 系统主题变化后页面不更新

当模式为 `system` 时，需要监听：

```js
const media = window.matchMedia('(prefers-color-scheme: dark)')

const handleSystemThemeChange = (event) => {
  if (themeMode.value !== 'system') return
  applyTheme(event.matches ? 'dark' : 'light')
}

media.addEventListener('change', handleSystemThemeChange)
```

组件卸载或应用销毁时应移除监听。用户明确选择 `light` 或 `dark` 后，系统主题变化不应覆盖用户选择。

## 十三、推荐的渐进改造顺序

1. 建立主题 store、持久化和首屏初始化。
2. 引入 Element Plus 暗黑变量文件。
3. 定义少量稳定的项目语义变量。
4. 先改应用骨架：顶部、侧栏、内容区、全局弹层。
5. 再按访问频率逐页改造业务页面。
6. 每页先处理主背景、文字和边框，再处理 hover、选中和异常状态。
7. 单独处理 Teleport、图表、编辑器和第三方组件。
8. 最后清理已经没有用途的历史暗黑覆盖，避免新旧方案长期并存。

这种顺序可以让系统较早获得完整的主题骨架，同时把页面级风险限制在当前改造范围内。

## 十四、交付验证清单

- [ ] 刷新暗黑主题页面时没有明显白屏闪烁。
- [ ] 顶部、侧栏、内容区和子菜单颜色一致。
- [ ] 浅色主题的选中项仍有足够辨识度。
- [ ] 表格固定列、滚动区域、空状态和加载状态没有异色块。
- [ ] Dialog、Drawer、Select、Popover 和 Tooltip 正确适配。
- [ ] hover、focus、active、disabled、selected 状态完整。
- [ ] 成功、警告、失败等状态不只依赖颜色表达。
- [ ] 图表切换主题后文字、坐标轴和网格线同步更新。
- [ ] 打印、二维码和纸张预览仍保持清晰。
- [ ] 浅色和暗黑主题下都检查了长文本、窄屏和滚动区域。
- [ ] 没有为了覆盖样式而新增大范围 `!important`。
- [ ] 主题切换不触发业务请求重放或页面状态丢失。

## 十五、最终结论

成熟的暗黑模式改造可以归纳为四层：

```text
主题状态层
  用户选择、系统主题、持久化、首屏初始化

设计令牌层
  Element Plus 变量、项目语义变量

页面迁移层
  新页面变量化、遗留页面渐进覆盖

特殊渲染层
  Teleport、Canvas、编辑器、图片、打印区域
```

只要这四层边界清楚，暗黑模式就不再是逐页“补黑色样式”，而是一套可以持续维护的主题系统。
