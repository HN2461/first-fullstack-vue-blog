---
title: "第 9 章：计算属性 computed"
slug: "vue-ai-vue-computed-e0e31524"
summary: "Vue 计算属性笔记，整理 computed 的缓存机制、使用场景和与 methods 的区别。"
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 90
cover: ""
originalId: "6a2d291e8a2b1c68f2cac28e"
originalSlug: "vue-ai-vue-computed-e0e31524"
originalStatus: "published"
publishedAt: "2026-02-02T13:05:32.026Z"
updatedAt: "2026-07-31T11:16:23.813Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 9 章：计算属性 computed

> 目标：掌握 Vue2 的计算属性 `computed`。
> 
> - 理解 computed 的核心特点：缓存
> - 会区分 computed / methods / watch 的使用场景
> - 掌握 getter / setter 写法
> - 能在真实业务中用 computed 做“派生状态”（总价、过滤、拼接字段等）

---

## 9.1 computed 的核心特点：缓存

`computed` 最重要的特点是：

- **依赖不变时，computed 会直接返回缓存结果**
- **依赖变化时，computed 才会重新计算**

这让 computed 非常适合做“基于现有数据计算出来的值”，也叫“派生状态”。

### 9.1.1 一个直观例子：总价

```html
<div id="app">
  <p>单价：{{ price }}</p>
  <p>数量：{{ count }}</p>
  <p>总价：{{ total }}</p>

  <button @click="count++">数量+1</button>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      price: 10,
      count: 1
    },
    computed: {
      total() {
        return this.price * this.count
      }
    }
  })
</script>
```

这里 `total` 不需要你手动维护，它由 `price` 和 `count` 推导而来。

---

## 9.2 computed vs methods 的差异与选择策略

你也可以用 methods 写出同样效果：

```html
<p>总价：{{ getTotal() }}</p>
```

```js
methods: {
  getTotal() {
    return this.price * this.count
  }
}
```

但它们差别很大：

- `computed`：
  - 有缓存
  - 依赖不变时不会重复计算

- `methods`：
  - 每次渲染都会重新调用
  - 只要页面发生一次更新（哪怕无关数据变了），方法也会再次执行

### 9.2.1 什么时候用 computed

- 你要展示一个“由数据计算出来”的结果
- 这个结果会在模板里反复使用
- 你希望避免重复计算

例如：

- 总价、折扣价
- 过滤后的列表
- 拼接后的显示文本
- 是否显示某个按钮（由多个状态组合决定）

### 9.2.2 什么时候用 methods

- 你要执行一个动作（点击、提交、请求、修改数据）
- 或者你确实希望每次渲染都重新执行

---

## 9.3 getter / setter 写法

多数 computed 只需要 getter：

```js
computed: {
  fullName() {
    return this.firstName + ' ' + this.lastName
  }
}
```

当你希望 computed “可读可写”时，可以写成对象形式：

```js
computed: {
  fullName: {
    get() {
      return this.firstName + ' ' + this.lastName
    },
    set(val) {
      const parts = String(val).split(' ')
      this.firstName = parts[0] || ''
      this.lastName = parts.slice(1).join(' ') || ''
    }
  }
}
```

使用：

- 读取：`{{ fullName }}`
- 写入：`this.fullName = 'Tom Lee'`

注意：setter 本质上还是在修改 `data`。

---

## 9.4 典型使用场景（总价、过滤、拼接字段）

### 9.4.1 过滤列表（推荐写法）

```html
<div id="app">
  <input v-model.trim="keyword" placeholder="搜索" />

  <ul>
    <li v-for="p in filteredList" :key="p.id">
      {{ p.name }} - ￥{{ p.price }}
    </li>
  </ul>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      keyword: '',
      list: [
        { id: 1, name: '苹果', price: 5 },
        { id: 2, name: '香蕉', price: 3 },
        { id: 3, name: '橘子', price: 4 }
      ]
    },
    computed: {
      filteredList() {
        const k = this.keyword.toLowerCase()
        if (!k) return this.list
        return this.list.filter((x) => x.name.toLowerCase().includes(k))
      }
    }
  })
</script>
```

优点：

- 过滤逻辑集中在 computed
- 模板更干净
- 依赖不变时有缓存

### 9.4.2 拼接显示字段

```js
data: {
  user: { firstName: 'Tom', lastName: 'Lee' }
},
computed: {
  displayName() {
    return this.user.lastName + this.user.firstName
  }
}
```

---

## 9.5 computed 的注意事项

- computed 里尽量写“纯计算”逻辑：
  - **不要在 computed 里发请求**
  - **不要在 computed 里写副作用（比如修改 data）**

原因是：

- computed 可能会因为依赖变化而多次触发
- 带副作用会让行为不可预测，难以排查问题

如果你需要“依赖变化就做事”（比如发请求、写日志、做防抖），通常应该使用 `watch`。

---

## 本章小结

- computed 用于派生状态，核心优势是**缓存**。
- 展示型、可由现有数据推导出的值：优先用 computed。
- 动作/事件处理：用 methods。
- 需要监听变化并执行副作用：用 watch。

**下一章预告**

第10章将学习 `watch`：处理复杂/异步逻辑（含 `immediate/deep`、监听对象、以及与防抖节流结合）。
