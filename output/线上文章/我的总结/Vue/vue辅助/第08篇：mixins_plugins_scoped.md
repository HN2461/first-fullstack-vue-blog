---
title: "第08篇：mixins_plugins_scoped"
slug: "vue-vue-mixins-plugins-scoped-5091c143"
summary: "mixins（混入）、plugins（插件）、scoped（样式隔离）这三个核心特性的用法和差异，我会从概念定义、Vue2/Vue3用法对比、核心差异三个维度，帮你理清它们的区别和适用场景。"
category: "vue辅助"
categoryPath:
  - "我的总结"
  - "Vue"
  - "vue辅助"
tags:
  - "Vue"
  - "mixins"
  - "plugins"
  - "scoped"
  - "代码复用"
status: "published"
sortOrder: 80
cover: ""
originalId: "6a2d291f8a2b1c68f2cac4c0"
originalSlug: "vue-vue-mixins-plugins-scoped-5091c143"
originalStatus: "published"
publishedAt: "2026-05-07T13:56:51.095Z"
updatedAt: "2026-06-13T10:28:29.066Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
`mixins`（混入）、`plugins`（插件）、`scoped`（样式隔离）这三个核心特性的用法和差异，我会从**概念定义**、**Vue2/Vue3 用法对比**、**核心差异**三个维度，帮你理清它们的区别和适用场景。

### 一、先明确三者的核心定位
在开始对比前，先帮你分清三者的本质，避免混淆：

| 特性 | 核心定位 | 作用范围 |
| --- | --- | --- |
| `mixins` | 组件级代码复用（逻辑片段） | 单个/多个组件 |
| `plugins` | 全局功能扩展（工具/能力） | 整个 Vue 应用 |
| `scoped` | 样式隔离（避免样式污染） | 单个组件样式 |


---

## 1. Mixins（混入）：Vue2 vs Vue3
### 核心不变点
+ 本质仍是**组件逻辑复用**，支持混入数据、方法、生命周期；
+ 优先级规则：组件自身 > mixin（同名属性/方法覆盖）；
+ 多 mixin 混入时，按数组顺序执行生命周期。

### 关键差异（Vue3 更推荐 Composables 替代 Mixin）
| 维度 | Vue2 用法 | Vue3 用法 |
| --- | --- | --- |
| 定义方式 | 纯对象形式 | 可兼容 Vue2 写法，但更推荐 `setup` 风格的 Composables |
| 生命周期 | 基于 Options API（`created`/`mounted`） | 可兼容 Options API，也可在 `setup` 中用 `onMounted` 等钩子 |
| 响应式 | 依赖 `data()` 返回对象 | 依赖 `ref`/`reactive` 实现响应式 |
| 推荐方案 | 直接用 Mixin | 优先用 Composables（`useXXX` 函数）替代 Mixin |


#### 示例：Vue2 vs Vue3 Mixin 写法对比
```javascript
// ---------------- Vue2 Mixin 示例 ----------------
const myMixin = {
  data() {
    return { count: 0 }
  },
  methods: {
    add() { this.count++ }
  },
  created() {
    console.log('Vue2 mixin created')
  }
}

new Vue({
  el: '#app',
  mixins: [myMixin],
  created() {
    console.log('Vue2 component created', this.count) // 0
  }
})

// ---------------- Vue3 Mixin 示例（兼容写法） ----------------
const myMixin = {
  data() {
    return { count: 0 }
  },
  methods: {
    add() { this.count++ }
  },
  created() {
    console.log('Vue3 mixin created')
  }
}

// Vue3 组件中使用
import { createApp } from 'vue'
createApp({
  mixins: [myMixin],
  created() {
    console.log('Vue3 component created', this.count) // 0
  }
}).mount('#app')

// ---------------- Vue3 推荐：Composables 替代 Mixin ----------------
// 定义 Composables（更清晰、可追溯）
import { ref, onMounted } from 'vue'
export function useCount() {
  const count = ref(0)
  const add = () => count.value++
  onMounted(() => {
    console.log('Composables mounted')
  })
  return { count, add }
}

// 组件中使用
import { useCount } from './useCount'
export default {
  setup() {
    const { count, add } = useCount()
    return { count, add }
  }
}
```

---

## 2. Plugins（插件）：Vue2 vs Vue3
### 核心不变点
+ 本质是**扩展 Vue 全局功能**（如注册全局组件、指令、原型方法）；
+ 插件必须暴露 `install` 方法（Vue2 也支持直接传函数）；
+ 可接收自定义参数。

### 关键差异（核心是 Vue 实例创建方式改变）
| 维度 | Vue2 用法 | Vue3 用法 |
| --- | --- | --- |
| 安装方式 | `Vue.use(plugin)` | `app.use(plugin)`（`app` 是 `createApp()` 返回的实例） |
| 全局原型 | `Vue.prototype.$xxx = xxx` | `app.config.globalProperties.$xxx = xxx` |
| 全局组件 | `Vue.component('Comp', Comp)` | `app.component('Comp', Comp)` |
| 全局指令 | `Vue.directive('dir', dir)` | `app.directive('dir', dir)` |
| 上下文 | 依赖 `Vue` 构造函数 | 依赖 `app` 实例（更隔离，支持多实例） |


#### 示例：Vue2 vs Vue3 插件开发/使用对比
```javascript
// ---------------- 1. 定义插件（通用逻辑，仅安装方式不同） ----------------
const myPlugin = {
  install(app, options) { // Vue3 中 app 是实例，Vue2 中是 Vue 构造函数
    // 1. 注册全局组件
    app.component('MyButton', {
      template: '<button>{{ text }}</button>',
      props: ['text']
    })

    // 2. 注册全局指令
    app.directive('focus', {
      mounted(el) { el.focus() } // Vue3 用 mounted 替代 Vue2 的 inserted
    })

    // 3. 扩展全局属性
    app.config.globalProperties.$sayHello = (name) => {
      console.log(`Hello ${name || options.defaultName}`)
    }
  }
}

// ---------------- 2. Vue2 中使用插件 ----------------
import Vue from 'vue'
Vue.use(myPlugin, { defaultName: 'Vue2' }) // 传入自定义参数
new Vue({
  el: '#app',
  mounted() {
    this.$sayHello() // Hello Vue2
  }
})

// ---------------- 3. Vue3 中使用插件 ----------------
import { createApp } from 'vue'
const app = createApp({
  mounted() {
    this.$sayHello() // Hello Vue3
  }
})
app.use(myPlugin, { defaultName: 'Vue3' }) // 传入自定义参数
app.mount('#app')
```

---

## 3. scoped（样式隔离）：Vue2 vs Vue3
### 核心不变点
+ 作用：给组件内的样式添加**唯一属性选择器**（如 `data-v-xxx`），避免样式污染；
+ 使用方式：在 `<style>` 标签加 `scoped`，如 `<style scoped>`；
+ 穿透 scoped：Vue2 用 `/deep/`，Vue3 兼容 `/deep/` 但推荐 `:deep()`。

### 关键差异（主要是底层实现细节，用法几乎不变）
| 维度 | Vue2 实现 | Vue3 实现 |
| --- | --- | --- |
| 编译方式 | 给元素添加 `data-v-hash` 属性，样式加属性选择器 | 逻辑一致，但 hash 生成规则优化，更稳定 |
| 插槽样式 | 父组件 scoped 样式不会影响子组件插槽内容 | 同 Vue2，但 Vue3 插槽默认归子组件，需用 `:slotted()` 精准控制 |
| 全局样式穿透 | `/deep/ .class` 或 `::v-deep .class` | 兼容 `/deep/`，推荐 `:deep(.class)`（CSS 标准写法） |
| 全局样式 | `<style>` + `<style scoped>` 分开写 | 同 Vue2，或用 `:global(.class)` 在 scoped 内写全局样式 |


#### 示例：Vue2 vs Vue3 scoped 样式写法
```vue
<!-- ---------------- Vue2 scoped 示例 ---------------- -->
<template>
  <div class="box">
    <p class="text">Vue2 样式</p>
    <child-component></child-component> <!-- 子组件 -->
  </div>
</template>
<style scoped>
/* 组件内样式（自动加 data-v-xxx） */
.box { background: #f5f5f5; }

/* 穿透 scoped 影响子组件（Vue2 写法） */
/deep/ .child-class { color: red; }
::v-deep .child-class { color: red; } /* 兼容写法 */
</style>
<!-- ---------------- Vue3 scoped 示例 ---------------- -->
<template>
  <div class="box">
    <p class="text">Vue3 样式</p>
    <child-component></child-component>
    <slot></slot> <!-- 插槽内容 -->
  </div>
</template>
<style scoped>
/* 组件内样式（逻辑同 Vue2） */
.box { background: #eee; }

/* Vue3 推荐的穿透写法（CSS 标准） */
:deep(.child-class) { color: blue; }

/* 控制插槽内容样式（Vue3 新增精准控制） */
:slotted(.slot-text) { font-size: 16px; }

/* 在 scoped 内写全局样式 */
:global(.global-class) { margin: 10px; }
</style>

```

---

### 总结
#### 1. Mixins 核心要点
+ Vue2 直接用**对象形式**的 Mixin 实现组件逻辑复用；
+ Vue3 兼容 Mixin，但**优先用 Composables（useXXX 函数）**，更清晰、可追溯；
+ 共性：组件逻辑 > Mixin 逻辑（同名覆盖）。

#### 2. Plugins 核心要点
+ 作用：扩展 Vue 全局功能（组件、指令、方法）；
+ 差异：Vue2 基于 `Vue` 构造函数，Vue3 基于 `createApp()` 返回的 `app` 实例；
+ 全局属性：Vue2 用 `Vue.prototype`，Vue3 用 `app.config.globalProperties`。

#### 3. scoped 核心要点
+ 作用：隔离组件样式，避免污染；
+ 穿透：Vue2 用 `/deep/`，Vue3 推荐 `:deep()`（兼容 `/deep/`）；
+ Vue3 新增 `:slotted()` 精准控制插槽样式，更灵活。

如果需要针对某一个特性（比如 Vue3 插件开发实战、scoped 穿透踩坑）展开讲解，我可以补充更具体的示例。
