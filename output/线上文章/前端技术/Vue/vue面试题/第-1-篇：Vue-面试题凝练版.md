---
title: "第 1 篇：Vue 面试题凝练版"
slug: "vue-vue-vue-80f4d76c"
summary: "Vue 面试核心复习稿，适合面试前快速过一遍 Vue 基础、虚拟 DOM、Diff、MVVM、组件和常见机制。"
category: "vue面试题"
categoryPath:
  - "前端技术"
  - "Vue"
  - "vue面试题"
tags: []
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291f8a2b1c68f2cac2e0"
originalSlug: "vue-vue-vue-80f4d76c"
originalStatus: "published"
publishedAt: "2026-03-27T13:29:33.808Z"
updatedAt: "2026-07-31T11:16:24.216Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 1 篇：Vue 面试题凝练版

#  Vue 面试题核心内容，供复习和面试时参考：
---

### 1. Vue 功能及与传统开发的区别
+ **Vue 功能：**
    - 是一个用于构建用户界面的开源 JavaScript 框架。
    - 适合创建单页应用（SPA）。
+ **与传统开发的区别：**
    - Vue 操作的是数据，数据变化自动驱动 DOM 更新；而 jQuery 等传统方式直接操作 DOM。

---

### 2. 为什么使用 Vue？
+ **轻量级：** 压缩后体积仅 ~30KB。
+ **移动优先：** 对移动端事件（如 Touch）支持良好。
+ **易上手：** 学习曲线平缓、文档齐全。
+ **融合优点：** 吸取 Angular 的模块化和 React 的虚拟 DOM，同时引入计算属性等独特功能。
+ **开源社区活跃。**

---

### 3. 虚拟 DOM
+ **定义：** 用普通 JS 对象描述真实 DOM 结构的轻量副本。
+ **原理：** 通过 diff 算法对比新旧虚拟 DOM 的差异，只更新发生改变的部分，从而提升性能。

---

### 4. Diff 算法
+ **步骤：**
    1. 将真实 DOM 转为虚拟 DOM 对象树。
    2. 数据变化时生成新的虚拟 DOM 树。
    3. 逐层对比（diff），标记出增删改。
    4. 只更新有变化的真实 DOM 节点。
+ **重点：** 通过 key 的比较匹配相同节点，递归比较子节点。

---

### 5. MVVM 架构
+ **概念：**
    - **Model:** 数据模型。
    - **View:** UI 展现。
    - **ViewModel:** 数据和视图之间的桥梁，实现数据双向绑定。
+ **与 MVC 的区别：**
    - MVC：Controller 负责中介。
    - MVVM：通过数据双向绑定实现自动同步，无需直接操作 DOM。

---

### 6. .vue 文件组成
+ `<template>`**：** 定义组件的结构。
+ `<script>`**：** 编写业务逻辑、数据和方法。
+ `<style>`**：** 编写 CSS 样式。

---

### 7. data 必须是函数的原因
+ **每次调用返回一个新的数据副本**，防止多个组件实例间数据引用污染。

---

### 8. computed、watch、methods 的区别
+ **computed 与 watch：**
    - **computed：** 缓存计算结果，只在依赖变化时重新计算，适合依赖多个数据进行计算。
    - **watch：** 用于数据变化监听，可处理异步任务，不缓存值。
+ **computed 与 methods：**
    - **computed：** 基于依赖缓存，只在依赖变化时执行。
    - **methods：** 每次渲染都会执行，适用于无缓存需求的操作。

---

### 9. Vue 指令
常用指令包括：

+ `v-html`、`v-text`、`v-bind`（简写 `:`）、`v-on`（简写 `@`）、`v-for`、`v-if`（与 `v-else`、`v-else-if`）、`v-show`、`v-model`、`v-pre`、`v-cloak`、`v-once`。

---

### 10. ref 的作用
+ 用于获取 DOM 元素或子组件实例，从而访问内部数据和方法。

---

### 11. v-if 与 v-show 的区别
+ **v-if：** 真正渲染与销毁组件，适用于不频繁切换场景。
+ **v-show：** 通过 `display: none` 控制显示隐藏，适用于频繁切换场景。

---

### 12. Vue 的两个核心
+ **数据驱动**
+ **组件化**

---

### 13. 关于 key
+ **为什么 v-for 要使用 key：** 帮助 Vue 快速定位节点，提高渲染效率。
+ **用 index 作为 key 的问题：** 可能导致 DOM 更新不准确，特别是列表顺序变动或含有输入框时。

---

### 14. $set 的作用
+ 用于为对象或数组添加响应式属性，例如：`this.$set(obj, "key", value)` 或 `Vue.set(obj, "key", value)`。

---

### 15. scoped 样式
+ **作用：** 限定组件内部 CSS 作用域，防止样式污染。
+ **原理：** 通过添加自定义属性（如 `v-data-xxxx`）来提高 CSS 选择器权重。

---

### 16. 样式穿透
+ **Vue2：** 使用 `>>>`、`/deep/`、`::v-deep`。
+ **Vue3：** 使用 `:deep()` 或 `::v-deep()`。

---

### 17. 生命周期
+ **单组件生命周期：**
    - 初始化：`beforeCreate`、`created`
    - 挂载：`beforeMount`、`mounted`
    - 更新：`beforeUpdate`、`updated`
    - 销毁：`beforeDestroy`、`destroyed`
+ **父子组件生命周期关系：**
    - 挂载时子组件先 mounted，再父组件 mounted。
    - 更新时子组件先更新，再父组件更新。
    - 销毁时子组件先销毁，再父组件销毁。
+ **常用场景：**
    - 初始化数据（`created`）
    - 操作 DOM（`mounted`）
    - 清理资源（`beforeDestroy`）
+ **$nextTick：** 在下次 DOM 更新循环结束后执行回调，常用于数据更新后操作 DOM。
+ **Vue 异步渲染：** 将多次数据更新合并，在一次事件循环后统一渲染，提升性能。

---

### 18. 组件通信方式
+ **父子组件：**
    - 父传子：使用 `props`。
    - 子传父：通过 `$emit` 触发自定义事件、使用 `ref`、`$parent`（慎用）。
+ **兄弟组件：**
    - 使用全局事件总线（EventBus）或消息订阅发布。
+ **跨级组件：**
    - 使用 `$attrs` 与 `$listeners` 或 `Provide/Inject`。
+ **复杂状态管理：**
    - 使用 Vuex。

---

### 19. 双向绑定（v-model）原理
+ **实现方式：** 利用 `Object.defineProperty()` 劫持数据，
    - 输入框绑定 data 数据，通过 `input` 事件更新 data，从而实现数据与视图的双向绑定。

---

### 20. 优先级顺序
+ **优先级：** `props` == `methods` > `data` > `computed` > `watch`  
（同名时模板会根据优先级进行选择）

---

### 21. Vue 性能优化
+ 合理使用 `v-if`/`v-show`、`computed` 以及动态 key。
+ 自定义事件和 DOM 事件及时解绑。
+ 使用异步组件、`keep-alive` 缓存，避免 data 层级过深。
+ 利用构建工具对模板进行预编译和代码压缩。

---

### 22. Vuex 相关
+ **Vuex 是什么：**
    - 为 Vue 应用提供集中式状态管理，适合多个组件共享状态。
+ **核心属性：**
    - **State:** 数据存储。
    - **Getter:** 对 state 的派生状态，相当于计算属性。
    - **Mutation:** 同步修改 state 的方法。
    - **Action:** 支持异步操作，通过提交 mutation 修改 state。
    - **Module:** 模块化管理，将 state 分块管理。
+ **常见问题：**
    - 页面刷新导致 state 重置：解决方案可以使用 localStorage/sessionStorage 或插件 vuex-persistedState。
    - 多组件共享数据：使用 Vuex 可避免“传参地狱”。
+ **组件中使用 Vuex：**
    - 利用 `mapState` 等辅助函数将 Vuex state 挂载到 computed 中。

---

### 23. Vue 动态组件
+ **概念：** 在一个挂载点上动态切换组件（如 Tab 切换）。
+ **实现方式：**
    - 使用 `<component :is="componentName">` 或条件渲染（`v-if`）。

---

### 24. 数组更新问题
+ **原因：** Vue 能监测到数组顺序和数量的变化，但直接修改数组元素（非索引操作）无法检测。
+ **解决办法：** 使用 `Vue.set()` 或 `vm.$set()` 来确保响应式更新。

---

### 25. mixin 的作用
+ **作用：** 用于分发可复用功能，将多个组件共用的选项（data、methods、生命周期钩子等）进行混入。

---

### 26. 获取 DOM
+ **方式：**
    1. **通过 **`el`** 属性：** `this.$el` 获取组件根元素。
    2. **通过 **`ref`** 属性：** 例如 `<button ref="btn">` 后通过 `this.$refs.btn` 获取。
    3. **事件修饰符 **`.native`**：** 获取原生 DOM 元素（适用于组件内绑定原生事件）。

---

### 27. Axios 请求与拦截器
+ **请求方式：**
    - `get`、`post`、`put`、`patch`、`delete` 等，根据场景选择合适的方法。
+ **拦截器：**
    - **请求拦截器：** 用于在发送请求前设置 headers、token 等。
    - **响应拦截器：** 处理响应数据、错误处理、统一状态码处理（如 token 失效）。

---

### 28. 跨域处理
+ **原理：** 利用 CORS（跨域资源共享）解决跨域问题。
+ **Vue 开发：** 在 vue-cli 配置 `devServer.proxy`，将请求转发到后端接口，实现跨域代理。

---

### 29. 路由相关
+ **参数传递：**
    - **params：** 需要配合 `name` 使用，刷新后参数会丢失。
    - **query：** 参数显示在 URL 上，可配合 `path` 或 `name` 使用。
+ **路由跳转：**
    - 标签方式：`<router-link>`
    - 编程式：`this.$router.push()`、`replace()`、`go(n)`
+ **路由模式：**
    - **hash 模式：** URL 带 `#`，兼容性好。
    - **history 模式：** URL 干净（无 `#`），需后端配合处理 404 问题。
+ **路由守卫：**
    - 全局守卫（`beforeEach`、`beforeResolve`、`afterEach`）
    - 组件内守卫（`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`）
    - 作用：如登录验证、权限管理等。
+ $ router 与  $**route：**
    - `$router` 是全局路由实例，提供跳转方法等。
    - `$route` 是当前路由信息对象，包含 path、params、query 等。

---

### 30. 插槽（slot）
+ **作用：** 在组件中占位，方便灵活传递内容。
+ **类型：**
    - 默认插槽
    - 具名插槽
    - 作用域插槽（用于子传父数据）

---

### 31. 组件缓存
+ **使用 **`<keep-alive>`** 标签** 缓存组件，避免频繁重新渲染，提升性能。
+ **应用场景：** 列表、购物车等需要频繁切换的组件。

---

### 32. SPA（单页应用）
+ **优点：**
    - 流畅的用户交互体验，避免页面频繁刷新。
    - 前后端分离，后端只提供数据接口，前端负责页面渲染。
    - 减轻服务器压力，复用后端代码。
+ **缺点：**
    - SEO 难度较高。
    - 浏览器前进、后退管理需手动处理。
    - 初次加载资源较多，可能会影响加载速度。

---

### 33. Vue 与 React 的区别
+ **相同点：**
    - 组件化思想、虚拟 DOM、数据驱动视图、支持服务端渲染等。
+ **区别：**
    - **数据流向：** React 主张单向数据流，而 Vue 默认支持双向绑定。
    - **数据变化：** React 使用不可变数据；Vue 使用可变数据，配合数据劫持。
    - **组件通信：** React 依赖回调函数；Vue 子传父支持事件、回调及其他方式。
    - **Diff 算法：** 两者在实现细节上有所不同。

---

### 34. Vue2 与 Vue3 的区别
+ **性能提升：** Vue3 使用 Proxy 替代 Object.defineProperty，实现响应式更高效。
+ **体积更小：** 移除了不常用的 API（如 filter、EventBus 等），支持按需导入和 Tree Shaking。
+ **TS 支持更好：** 源码使用 TypeScript 重写。
+ **新特性：** Composition API、Fragment、Teleport、Suspense 等。

---

### 35. npm install 执行过程
1. 检查项目的 `node_modules` 是否存在依赖模块。
2. 若不存在，则读取 `.npmrc` 配置，从 registry 获取模块压缩包 URL。
3. 下载压缩包存放于本地缓存目录（如 `.npm`）。
4. 解压并安装至项目的 `node_modules` 中。

---

这份总结涵盖了从 Vue 基础、数据绑定、组件通信、生命周期到 Vuex、路由、Axios、跨域、SPA 优缺点等各方面的内容。可作为复习或面试时的参考资料。如果需要更详细的示例代码或有其他问题，欢迎继续讨论！





#  Vue3 相比 Vue2 的改进和新特性：
---

### 1. 性能更快
+ **Proxy 响应式**  
    - **Vue2：** 每个属性都要一个一个地去监听，就像给每个抽屉都装了报警器。  
    - **Vue3：** 用 Proxy 直接监控整个对象，就像监控整个房间，一旦有改动马上通知，无需单独监控每个属性。
+ **编译优化**  
    - Vue3 在编译阶段会标记哪些内容是动态的（例如 `{{ count }}`），哪些是静态的（纯文本）。更新时只刷新变化的部分，从而大幅提高渲染效率。

---

### 2. 体积更小
+ **Tree-shaking 优化**  
    - 打包时只包含你实际用到的代码，减少最终的包体积，让应用加载更快。

---

### 3. 更好用、更灵活
+ **Composition API（组合式 API）**  
    - **传统 Options API（Vue2 风格）：** 把代码按类型（data、methods、生命周期等）分块，适合简单组件，但复杂逻辑容易分散。  
    - **Composition API（Vue3 风格）：** 把相同功能的代码放到一起（比如一个搜索功能的相关 data 和方法），像搭积木一样组合逻辑，逻辑复用更方便，类似 React Hooks。
+ **新增组件**  
    - `<Teleport>`**：** 可以将组件渲染到任意位置（例如弹窗放到 body 下），避免被父组件的样式影响。  
    - `<Suspense>`**：** 用于处理异步加载组件时的场景（如数据加载时显示 Loading 状态），让用户体验更平滑。

---

### 4. 数据响应式和双向绑定
+ **使用 Proxy 实现响应式**  
    - 修改数据时，Proxy 会拦截操作并自动通知视图更新，不再需要像 Vue2 那样用 `this.$set` 来处理新增属性或数组下标变化。
+ **ref 与 reactive 的选择**  
    - **ref：** 用于包装简单数据类型（数字、字符串等），使用时需要 `.value` 访问。  
    - **reactive：** 用于包装对象或数组，可以直接操作属性，就像直接用一个容器装菜，不需要拆包装。
+ **toRefs 辅助解构**  
    - 当你想解构一个 reactive 对象但又不想失去响应性，可以使用 `toRefs`，这样每个属性都会变成 ref 对象，模板中直接使用无需 `.value`。

---

### 5. watch 与 watchEffect
+ **watch：**  
    - 适合明确监听某个数据变化，进行精确控制，比如监听搜索关键词变化后发起请求。
+ **watchEffect：**  
    - 会自动追踪其内部所有依赖，适合写副作用逻辑，当相关数据一变化就执行，不需要手动列出所有依赖。

---

### 6. Provide/Inject 组件通信
+ 在组件层级较深的情况下，可以通过 **provide/inject** 实现跨层级传值：
    - **provide：** 在父组件（或祖先组件）中提供数据。  
    - **inject：** 在后代组件中注入并使用这些数据。

---

### 7. 新的生命周期钩子
+ **命名变化**  
    - Vue2 中的 `beforeDestroy` 和 `destroyed` 分别变成了 Vue3 的 `beforeUnmount` 和 `unmounted`。
+ **组合式 API 中的生命周期**  
    - 例如在 `setup()` 内可以直接使用 `onMounted`、`onBeforeUnmount` 等钩子来代替 Options API 的写法。

---

### 8. 自定义 Hook（自定义组合函数）
+ **自定义 Hook：**  
    - Vue3 提倡把可复用逻辑写成独立函数（函数名以 `use` 开头），方便在不同组件中引用。这种方式比 Vue2 中的 mixin 更加清晰，不容易产生命名冲突，也更容易追溯代码来源。

---

### 9. 其他新特性
+ **customRef 自定义响应式**  
    - 通过 `customRef` 你可以自定义依赖追踪和更新策略，比如实现防抖的双向绑定。
+ **判断响应式数据**  
    - Vue3 提供了 `isRef`、`isReactive`、`isReadonly` 和 `isProxy` 等工具函数，方便判断数据的响应式状态。
+ **路由守卫的新写法**  
    - Vue Router 在 Vue3 中支持 `onBeforeRouteLeave` 和 `onBeforeRouteUpdate` 钩子，可以在任意组件中使用，并且在组件销毁时自动移除守卫。
+ **全局属性绑定**  
    - 通过 `app.config.globalProperties` 或 `provide/inject`，可以更方便地设置和获取全局变量。
+ **keep-alive 使用**  
    - `<keep-alive>` 组件依然用于缓存组件实例，在需要保持组件状态、避免重新渲染的场景非常有用。
+ **废弃过滤器**  
    - Vue3 取消了内置过滤器功能，认为大部分情况下可以用 methods 或计算属性替代，从而简化源码和 API 设计。

---

以上就是 Vue3 相对于 Vue2 的一些主要改进和新特性。总体来说，Vue3 在性能、体积、开发体验以及逻辑复用上都有显著提升，更加适合开发大型和复杂应用。
