---
title: "列表渲染 v-for（高频重点）"
slug: "vue-ai-vue-v-for-7d30ba15"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 250
cover: ""
originalId: "6a2d291e8a2b1c68f2cac288"
originalSlug: "vue-ai-vue-v-for-7d30ba15"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第6章 列表渲染 v-for（高频重点）

> 目标：掌握 Vue2 中高频使用的列表渲染：
> 
> - 遍历数组 / 对象 / 数字
> - `key` 的作用与原理（为什么必须写）
> - `index` 作为 key 的风险
> - `v-for` 与 `v-if` 的优先级坑与最佳实践
> - 实战：商品列表/评论列表

---

## 6.1 遍历数组

最常见的场景是渲染一组数组数据：

```html
<ul>
  <li v-for="item in list" :key="item.id">
    {{ item.name }} - ￥{{ item.price }}
  </li>
</ul>
```

```js
data: {
  list: [
    { id: 1, name: '苹果', price: 5 },
    { id: 2, name: '香蕉', price: 3 },
    { id: 3, name: '橘子', price: 4 }
  ]
}
```

### 6.1.1 获取索引

你也可以拿到索引：

```html
<ul>
  <li v-for="(item, index) in list" :key="item.id">
    {{ index + 1 }}. {{ item.name }}
  </li>
</ul>
```

---

## 6.2 遍历对象

Vue2 支持遍历对象的键值对：

```html
<ul>
  <li v-for="(value, key) in user" :key="key">
    {{ key }}: {{ value }}
  </li>
</ul>
```

```js
data: {
  user: {
    name: 'Tom',
    age: 18,
    city: 'Shanghai'
  }
}
```

你还可以拿到第三个参数（索引）：

```html
<ul>
  <li v-for="(value, key, index) in user" :key="key">
    {{ index }} - {{ key }}: {{ value }}
  </li>
</ul>
```

---

## 6.3 遍历数字（`n in 10`）

当你想渲染固定次数（比如骨架屏、占位）时，可以遍历数字：

```html
<ul>
  <li v-for="n in 5" :key="n">占位项 {{ n }}</li>
</ul>
```

这里的 `n` 从 1 开始。

---

## 6.4 `key` 的作用与原理（为什么必须写）

在 Vue 的列表渲染中，`key` 是一个非常重要的属性：

- 用于帮助 Vue **识别每一项是谁**
- 让 Vue 在更新列表时能更精准地复用/移动 DOM 节点
- 避免不必要的重渲染与状态错乱

### 6.4.1 为什么“必须写 key”

当列表发生变化时（插入、删除、排序），Vue 需要对比新旧两份列表。

- **有 key**：Vue 可以准确知道“哪一项移动了/新增了/删除了”
- **没 key**：Vue 可能会用“就地复用”的策略，导致本应属于 A 的 DOM 被复用到 B 上

这在包含表单输入、组件内部状态时尤其容易出问题。

### 6.4.2 key 选什么

推荐 key 的原则：

- **稳定**：同一条数据在多次渲染中 key 不变
- **唯一**：不能重复

通常选：

- `id`
- 业务唯一字段（比如订单号、文章 slug）

---

## 6.5 `index` 作为 key 的问题与风险

很多初学者会写：

```html
<li v-for="(item, index) in list" :key="index">{{ item.name }}</li>
```

这在列表内容**不会变化顺序**、也**不会插入/删除**时，问题不大。

但只要你做了这些操作之一：

- 在中间插入一条数据
- 删除中间某条数据
- 列表排序

使用 `index` 做 key 就容易出现问题：

- DOM 节点被错误复用
- 输入框内容“串行”（上一行的输入跑到下一行）
- 子组件状态错位

结论：

- **能用 id 就别用 index**

---

## 6.6 `v-for` 与 `v-if` 的优先级坑与最佳实践

你可能会写出这样的代码：

```html
<li v-for="item in list" v-if="item.visible" :key="item.id">{{ item.name }}</li>
```

这种写法不推荐，原因包括：

- 可读性差（条件和遍历混在一起）
- 容易踩优先级与性能问题

更推荐：

- 先过滤数据
- 再渲染过滤后的列表

### 6.6.1 用 computed 过滤（推荐）

```html
<li v-for="item in visibleList" :key="item.id">{{ item.name }}</li>
```

```js
data: {
  list: [
    { id: 1, name: 'A', visible: true },
    { id: 2, name: 'B', visible: false }
  ]
},
computed: {
  visibleList() {
    return this.list.filter((x) => x.visible)
  }
}
```

---

## 6.7 列表渲染实战（商品列表/评论列表）

### 6.7.1 商品列表示例

```html
<div id="app">
  <h2>商品列表</h2>
  <ul>
    <li v-for="p in products" :key="p.id">
      {{ p.name }} - ￥{{ p.price }}
      <button @click="addToCart(p)">加入购物车</button>
    </li>
  </ul>

  <h3>购物车（{{ cart.length }}）</h3>
  <ul>
    <li v-for="c in cart" :key="c.id">{{ c.name }} × {{ c.count }}</li>
  </ul>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      products: [
        { id: 1, name: '苹果', price: 5 },
        { id: 2, name: '香蕉', price: 3 }
      ],
      cart: []
    },
    methods: {
      addToCart(p) {
        const exists = this.cart.find((x) => x.id === p.id)
        if (exists) {
          exists.count++
        } else {
          this.cart.push({ id: p.id, name: p.name, count: 1 })
        }
      }
    }
  })
</script>
```

### 6.7.2 评论列表示例

```html
<ul>
  <li v-for="c in comments" :key="c.id">
    <strong>{{ c.author }}</strong>：{{ c.content }}
  </li>
</ul>
```

---

## 本章小结

- `v-for` 可遍历数组/对象/数字。
- `key` 用来标识列表项身份，建议使用稳定唯一的 `id`。
- 尽量避免使用 `index` 作为 key，尤其是列表会插入/删除/排序的场景。
- `v-for` 与 `v-if` 不要混写，推荐先用 `computed` 过滤再渲染。

**下一章预告**

第7章将学习表单处理 `v-model`：各种输入控件绑定与修饰符、以及一个表单实战。
