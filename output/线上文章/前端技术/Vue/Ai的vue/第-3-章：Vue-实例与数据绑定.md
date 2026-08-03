---
title: "第 3 章：Vue 实例与数据绑定"
slug: "vue-ai-vue-vue-f2943706"
summary: "Vue 实例和数据绑定基础，整理实例挂载、数据驱动视图和基础绑定方式。"
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291e8a2b1c68f2cac282"
originalSlug: "vue-ai-vue-vue-f2943706"
originalStatus: "published"
publishedAt: "2026-02-02T12:59:09.413Z"
updatedAt: "2026-07-31T11:16:23.783Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 3 章：Vue 实例与数据绑定

> 目标：掌握 Vue2 的“起手式”——会写 `new Vue({})`，理解 `el/data/methods`，能完成最常见的数据绑定与事件交互，并避开初学者最容易踩的 `this` 相关坑。

---

## 3.1 Vue 实例：`new Vue({})` 的基本结构

在 Vue2 中，一个页面最基本的启动方式通常是：

- 页面里准备一个挂载点（容器）
- 用 `new Vue({ ... })` 创建实例
- 把实例挂到容器上

```html
<div id="app">
  <h1>{{ title }}</h1>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      title: 'Hello Vue2'
    }
  })
</script>
```

你可以把它理解成：

- `#app` 这个 DOM 容器由 Vue 接管
- Vue 会根据 `data` 里的数据去渲染模板
- 数据变化时，会触发视图更新

---

## 3.2 `el`、`data`、`methods` 的作用

### 3.2.1 `el`：告诉 Vue 接管哪一块 DOM

`el` 指定挂载点，常见写法：

- `el: '#app'`

如果你用 Vue CLI 创建项目，很多时候你会看到另一种写法：

```js
new Vue({
  render: (h) => h(App)
}).$mount('#app')
```

它和 `el` 的效果本质一致。

### 3.2.2 `data`：组件/实例的状态（视图的来源）

`data` 里存放页面渲染所需的数据。

```js
data: {
  title: '订单列表',
  total: 3,
  list: ['A', 'B', 'C']
}
```

**重要约束（Vue2 里非常常见）**：

- 在组件（`.vue`）里，`data` 必须是函数（后面在组件章节会详细讲）

### 3.2.3 `methods`：事件回调与业务函数

`methods` 里写的通常是：

- 点击按钮触发的事件处理函数
- 表单提交函数
- 对数据进行修改的动作

```html
<div id="app">
  <p>count: {{ count }}</p>
  <button @click="inc">+1</button>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      count: 0
    },
    methods: {
      inc() {
        this.count++
      }
    }
  })
</script>
```

---

## 3.3 数据响应式与视图更新机制（概念）

Vue2 的响应式可以先记住一句话：

- **data 里的数据变化会触发视图更新**

你不需要自己手动去改 DOM。

例如：

```html
<div id="app">
  <p>{{ msg }}</p>
  <button @click="change">修改</button>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      msg: '初始文本'
    },
    methods: {
      change() {
        this.msg = '更新后的文本'
      }
    }
  })
</script>
```

点击按钮后：

- `this.msg` 改了
- `{{ msg }}` 对应的内容自动变

你可以把 Vue 的更新过程理解为：

- 你写“数据是什么”
- Vue 自动把“数据的当前值”渲染到模板上
- 数据变化时，Vue 负责把变化同步到页面

---

## 3.4 `this` 指向与常见错误

Vue2 初学者最容易出错的地方之一，就是在 `methods` 或异步回调里 `this` 指向不对。

### 3.4.1 在 `methods` 里，`this` 指向当前 Vue 实例

```js
methods: {
  inc() {
    console.log(this) // Vue 实例
    this.count++
  }
}
```

### 3.4.2 常见错误：把方法写成箭头函数

```js
methods: {
  inc: () => {
    // 这里的 this 不再是 Vue 实例
    this.count++
  }
}
```

**建议**：在 Vue2 的 `methods` 中，优先使用普通函数写法。

### 3.4.3 常见错误：异步回调里 `this` 丢失

比如定时器：

```js
methods: {
  start() {
    setTimeout(function () {
      // 这里的 this 不是 Vue 实例
      this.count++
    }, 1000)
  }
}
```

常见解决方案：

- 方案1：缓存 `this`

```js
methods: {
  start() {
    const vm = this
    setTimeout(function () {
      vm.count++
    }, 1000)
  }
}
```

- 方案2：用箭头函数让 `this` 继承外层

```js
methods: {
  start() {
    setTimeout(() => {
      this.count++
    }, 1000)
  }
}
```

### 3.4.4 常见错误：解构导致响应式/上下文问题

不要在需要响应式的场景里随意解构 `this` 上的数据后再赋值：

```js
methods: {
  bad() {
    const { count } = this
    // 下面这句并不会更新 this.count
    // count++
  }
}
```

如果你的目标是更新页面，应该直接更新 `this.xxx`。

---

## 本章小结

- Vue2 的基本启动方式是 `new Vue({ el, data, methods })`。
- `data` 存状态，`methods` 放行为；改变 `data` 会驱动视图更新。
- `this` 在 `methods` 中通常指向 Vue 实例，但在某些写法（箭头函数/异步回调）中会丢失，需要注意。

**下一章预告**

第4章将进入 Vue 模板语法体系：插值、`v-bind`、`v-on`、修饰符等（高频必会）。
