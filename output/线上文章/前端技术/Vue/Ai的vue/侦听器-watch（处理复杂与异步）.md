---
title: "侦听器 watch（处理复杂与异步）"
slug: "vue-ai-vue-watch-79d389b8"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 210
cover: ""
originalId: "6a2d291e8a2b1c68f2cac260"
originalSlug: "vue-ai-vue-watch-79d389b8"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第10章 侦听器 watch（处理复杂/异步）

> 目标：掌握 Vue2 的侦听器 `watch`，用于处理“数据变化后需要做事”的场景（尤其是异步与副作用）。
> 
> - watch 的基本写法
> - `immediate` 与 `deep`
> - 监听对象/数组
> - watch vs computed 的选择策略
> - 防抖/节流与 watch 结合

---

## 10.1 watch 的基本写法

当你需要在某个数据变化后执行一段逻辑，可以用 `watch`。

```html
<div id="app">
  <input v-model.trim="keyword" placeholder="输入关键词" />
  <p>keyword: {{ keyword }}</p>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      keyword: ''
    },
    watch: {
      keyword(newVal, oldVal) {
        console.log('keyword变化：', oldVal, '=>', newVal)
      }
    }
  })
</script>
```

watch 回调参数：

- `newVal`：新值
- `oldVal`：旧值

---

## 10.2 `immediate` 与 `deep`

### 10.2.1 `immediate`

默认情况下，watch 只在数据变化时触发；如果你希望“初始化就先执行一次”，用 `immediate: true`。

```js
watch: {
  keyword: {
    handler(newVal) {
      console.log('触发：', newVal)
    },
    immediate: true
  }
}
```

常见用途：

- 页面初始化就要根据某个默认条件加载数据
- 让 watch 充当“初始化 + 变化监听”的统一入口

### 10.2.2 `deep`

当你监听一个对象时：

```js
data: {
  form: {
    username: '',
    age: 0
  }
}
```

如果你写：

```js
watch: {
  form(newVal) {
    console.log('form变了')
  }
}
```

只有当 `form` 这个引用整体替换时才会触发（例如 `this.form = { ... }`）。

若你希望监听对象内部字段变化（深层变化），需要：

```js
watch: {
  form: {
    handler(newVal) {
      console.log('form内部字段变化：', newVal)
    },
    deep: true
  }
}
```

注意：

- `deep` 会增加监听成本，尽量只在确实需要时使用

---

## 10.3 监听对象/数组

### 10.3.1 精准监听某个字段（推荐）

相比 deep watch 整个对象，更推荐监听具体字段：

```js
watch: {
  'form.username'(val) {
    console.log('username变了：', val)
  }
}
```

这种方式：

- 更精准
- 成本更低
- 可读性更强

### 10.3.2 监听数组

监听数组时：

- `push/splice` 等变更会触发 watch
- 但你需要区分“监听引用变化”和“监听内容变化”

```js
data: {
  list: []
},
watch: {
  list(newVal) {
    console.log('list 变化：', newVal)
  }
}
```

如果你要监听数组内部对象字段变化，通常也需要 `deep: true`，或者监听更具体的字段路径。

---

## 10.4 watch vs computed 的选择策略

你可以用一句话记忆：

- **computed**：用来“算出一个值”（派生状态），尽量保持纯计算
- **watch**：用来“做一件事”（副作用），例如请求、写缓存、打点、同步路由参数

### 10.4.1 适合用 computed 的场景

- 总价
- 过滤列表
- 拼接展示字段

### 10.4.2 适合用 watch 的场景

- 关键词变化后请求接口
- 路由参数变化后加载详情
- 表单字段变化后做校验提示
- 需要防抖/节流

---

## 10.5 防抖/节流与 watch 结合（搜索建议）

### 10.5.1 为什么需要防抖

例如做搜索建议：用户输入 `v`、`vu`、`vue`，如果每次输入都请求接口，会产生大量无意义请求。

防抖的目标：

- 用户停止输入一段时间后再触发

### 10.5.2 一个简单的防抖实现

```js
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

new Vue({
  // ...
  data: {
    keyword: ''
  },
  created() {
    this.fetchSuggestDebounced = debounce(this.fetchSuggest, 300)
  },
  watch: {
    keyword() {
      this.fetchSuggestDebounced()
    }
  },
  methods: {
    fetchSuggest() {
      // 这里写请求逻辑
      // axios.get(...)
      console.log('请求搜索建议：', this.keyword)
    }
  }
})
```

说明：

- 防抖函数不要每次 watch 触发都重新创建
- 推荐在 `created` 里创建一次并复用

---

## 本章小结

- watch 用于“监听变化后执行逻辑”（副作用/异步）。
- `immediate` 让监听器初始化就执行一次。
- `deep` 用于深度监听，但有成本，能精确监听字段就不要 deep。
- computed 负责算值，watch 负责做事。

**下一章预告**

第11章将学习生命周期：从 created/mounted 到 destroyed，搞清楚“什么时候做请求、什么时候操作 DOM、什么时候清理资源”。
