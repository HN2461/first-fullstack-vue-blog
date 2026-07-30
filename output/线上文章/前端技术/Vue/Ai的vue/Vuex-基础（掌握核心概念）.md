---
title: "Vuex 基础（掌握核心概念）"
slug: "vue-ai-vue-vuex-7c0c8832"
summary: ""
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 140
cover: ""
originalId: "6a2d291e8a2b1c68f2cac26e"
originalSlug: "vue-ai-vue-vuex-7c0c8832"
originalStatus: "published"
publishedAt: "2026-02-02T13:14:11.770Z"
updatedAt: "2026-06-19T06:25:04.821Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 第17章 Vuex 基础（掌握核心概念）

> 目标：理解为什么需要 Vuex，并掌握 Vuex 的核心概念与最常用的开发方式。
> 
> - 为什么需要 Vuex
> - store 与单一数据源思想
> - 核心概念：`state / getters / mutations / actions`
> - mutation 必须同步的原因
> - 辅助函数：`mapState / mapGetters / mapMutations / mapActions`

---

## 17.1 为什么需要 Vuex（解决什么问题）

当项目变大后，你会经常遇到“多个组件共享同一份状态”的需求，例如：

- 登录 token
- 当前用户信息
- 权限菜单
- 购物车
- 全局配置（主题、语言、地区）

如果不使用状态管理，常见做法是：

- 父子组件：props / $emit
- 兄弟组件：父组件中转
- 跨层：provide/inject、EventBus

这些方案在小规模时可用，但在中大型项目里会出现：

- 传参链路太长（“层层传递”）
- 状态来源不清晰
- 难以追踪“是谁改了数据”

Vuex 的核心价值：

- 把共享状态集中管理
- 让状态变化可预测、可追踪

---

## 17.2 store 与单一数据源思想

Vuex 的 store 可以理解为：

- 一个全局状态仓库
- 整个应用共享的一棵状态树

单一数据源（Single Source of Truth）的思想是：

- 共享状态只保存在 store 的 `state` 中
- 组件不要各自维护一份“同名状态”，避免数据不一致

---

## 17.3 核心概念

Vuex 的核心构成：

- `state`：状态（数据）
- `getters`：派生状态（类似 computed）
- `mutations`：同步修改 state 的唯一入口
- `actions`：异步逻辑/复杂逻辑，最终通过 mutation 改 state

下面给一个最小可理解的示例结构：

```js
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  },
  mutations: {
    inc(state) {
      state.count++
    },
    add(state, n) {
      state.count += n
    }
  },
  actions: {
    asyncAdd({ commit }, n) {
      setTimeout(() => {
        commit('add', n)
      }, 500)
    }
  }
})
```

---

## 17.4 `state`

`state` 是数据源，组件里读取它：

```js
this.$store.state.count
```

你也可以在模板里用：

```vue
<p>{{ $store.state.count }}</p>
```

---

## 17.5 `getters`

`getters` 类似组件的 computed，用于从 state 计算出“派生数据”。

读取方式：

```js
this.$store.getters.doubleCount
```

注意：

- getters 适合做纯计算
- 不要在 getters 里做副作用（请求、写本地存储等）

---

## 17.6 `mutations`

mutation 是“修改 state 的唯一入口”，调用方式：

```js
this.$store.commit('inc')
this.$store.commit('add', 10)
```

mutation 的特点：

- 必须是同步函数
- 参数通常是 `(state, payload)`

---

## 17.7 `actions`

action 用于处理：

- 异步逻辑（请求接口、延迟）
- 复杂流程（先校验再提交、链式调用等）

调用方式：

```js
this.$store.dispatch('asyncAdd', 10)
```

action 内部最终通过 `commit` 调用 mutation：

```js
actions: {
  async fetchUser({ commit }) {
    const user = await api.getUser()
    commit('setUser', user)
  }
}
```

---

## 17.8 mutation 必须同步的原因

这是 Vuex 的一个关键设计：

- mutation 统一负责同步修改 state
- 这样 Devtools 才能记录每一次状态变更的“前后差异”

如果 mutation 里允许异步：

- 你会很难追踪某次异步回调到底在什么时候修改了 state
- 时间线不稳定，调试困难

因此：

- 异步写在 action
- 同步修改写在 mutation

---

## 17.9 辅助函数（简化组件写法）

当你在组件里频繁读写 store，会写很多 `this.$store.xxx`。

Vuex 提供了映射函数简化写法。

### 17.9.1 `mapState`

```js
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['count'])
  }
}
```

模板中：

```vue
<p>{{ count }}</p>
```

### 17.9.2 `mapGetters`

```js
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['doubleCount'])
  }
}
```

### 17.9.3 `mapMutations`

```js
import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations(['inc', 'add'])
  }
}
```

### 17.9.4 `mapActions`

```js
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['asyncAdd'])
  }
}
```

---

## 本章小结

- Vuex 解决“共享状态难管理”的问题，让数据流更清晰。
- 核心概念：state（数据）→ getters（派生）→ mutations（同步改）→ actions（异步/复杂）。
- mutation 必须同步，异步放在 action。
- map 系列辅助函数能显著减少模板与脚本的样板代码。

**下一章预告**

第18章将学习 Vuex 的模块化（modules）与命名空间（namespaced），以及项目里常见的状态设计与持久化策略。
