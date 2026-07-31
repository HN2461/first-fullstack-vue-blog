---
title: "Vuex 进阶（项目组织方式）"
slug: "vue-ai-vue-vuex-d65018ae"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 130
cover: ""
originalId: "6a2d291e8a2b1c68f2cac270"
originalSlug: "vue-ai-vue-vuex-d65018ae"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第18章 Vuex 进阶（项目组织方式）

> 目标：掌握 Vue2 项目里 Vuex 的组织与工程化实践。
> 
> - modules 模块化拆分
> - 命名空间 `namespaced`
> - 持久化策略（localStorage / sessionStorage）
> - 常见业务状态设计

---

## 18.1 modules 模块化拆分

当 store 越写越大时（几十个 state/mutations/actions），可维护性会迅速下降。

Vuex 提供 `modules` 用于拆分：

- 按业务域拆：user、permission、cart、settings
- 每个模块各自维护 state/mutations/actions/getters

示例：

```js
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import cart from './modules/cart'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    cart
  }
})
```

一个模块文件：

```js
// store/modules/user.js
export default {
  state: {
    token: '',
    info: null
  },
  mutations: {
    setToken(state, token) {
      state.token = token
    },
    setInfo(state, info) {
      state.info = info
    }
  },
  actions: {
    async login({ commit }, payload) {
      // await api.login(payload)
      commit('setToken', 'mock-token')
    }
  }
}
```

---

## 18.2 命名空间 `namespaced`

多个模块如果都叫 `setToken`、`reset` 之类的方法，很容易冲突。

此时建议开启命名空间：

```js
export default {
  namespaced: true,
  state: { token: '' },
  mutations: {
    setToken(state, token) {
      state.token = token
    }
  }
}
```

调用时需要带上模块名：

```js
this.$store.commit('user/setToken', 'abc')
this.$store.dispatch('user/login', { username: 'a', password: 'b' })
```

配合 map 系列函数时，也要写模块名：

```js
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('user', ['token'])
  },
  methods: {
    ...mapActions('user', ['login'])
  }
}
```

---

## 18.3 持久化策略（localStorage / sessionStorage）

很多状态需要跨刷新保留，例如 token。

常见策略：

- **localStorage**：长期保存（关闭浏览器也在）
- **sessionStorage**：会话保存（关闭标签页就没）

### 18.3.1 最常见做法：在 mutation/action 里同步写入

```js
mutations: {
  setToken(state, token) {
    state.token = token
    localStorage.setItem('token', token)
  }
}
```

初始化时读回：

```js
state: {
  token: localStorage.getItem('token') || ''
}
```

注意：

- 本地存储属于副作用，写在 action 里也可以
- 关键是：要保证“state 与本地存储一致”

### 18.3.2 更工程化的方式

- 使用插件（例如 `vuex-persistedstate`）统一持久化
- 优点：逻辑集中，业务 mutation 更干净

---

## 18.4 常见业务状态设计

### 18.4.1 用户信息

通常包含：

- 用户基础信息（昵称、头像、id）
- token
- 登录状态

建议：

- token 与用户信息分开存
- 退出登录要“一键清空”并清理持久化

### 18.4.2 权限菜单

后台系统常见：

- 后端返回权限点/菜单
- 前端基于权限生成路由或菜单

建议：

- permission 模块负责：
  - 原始权限数据
  - 处理后的菜单树

### 18.4.3 全局配置

例如：

- 主题色
- 语言
- 是否折叠菜单

建议：

- settings 模块统一管理
- 部分配置可以持久化

---

## 18.5 模块划分与命名建议

一个常见划分：

- `user`：token、用户信息、登录/退出
- `permission`：角色、菜单、动态路由
- `app/settings`：主题、布局开关
- `cart`：购物车（电商类）

建议：

- 模块名用小写业务名
- mutation/action 名用动词短语：`setToken`、`reset`、`fetchInfo`
- 尽量开启 `namespaced: true`

---

## 本章小结

- modules 让 store 从“一个大文件”变成“按业务域拆分”。
- namespaced 解决同名冲突，让调用路径更清晰。
- token 等状态通常需要持久化，本地存储是最常见方案。
- 状态设计要贴合业务域（user/permission/settings 等）。

**下一章预告**

第19章将进入工程化：Vue CLI 工程体系、目录分层、环境变量、跨域代理、构建部署等。
