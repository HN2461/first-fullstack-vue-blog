---
title: "Vue2 响应式原理（理解核心机制）"
slug: "vue-ai-vue-vue2-d73035df-revision-20260730"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 230
cover: ""
originalId: "6a2d291e8a2b1c68f2cac28c"
originalSlug: "vue-ai-vue-vue2-d73035df"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 第8章 Vue2 响应式原理（理解核心机制）

> 目标：从“会用”走向“理解”。你需要搞清楚：Vue2 为什么能做到“数据变了页面自动变”，它用的是什么机制，有哪些天然局限，以及在项目里应该怎么规避。

---

## 8.1 响应式是什么

在 Vue2 里，“响应式”指的是：

- 你修改 `data` 里的某个字段
- Vue 能感知到这个变化
- 然后自动触发依赖更新（模板重新渲染、计算属性重算、watch 回调执行等）

对开发者来说，表现为：

- 不需要自己写 `render()` 或自己操作 DOM
- 你只需要改数据即可

---

## 8.2 `Object.defineProperty` 的基本机制

Vue2 的响应式核心依赖 `Object.defineProperty`：

- 通过给对象的每个属性定义 `getter/setter`
- 在读取时（getter）做依赖收集
- 在设置时（setter）触发更新

### 8.2.1 一个简化版示例

下面代码不是 Vue 源码，只是帮助你建立直觉：

```js
function defineReactive(obj, key) {
  let value = obj[key]

  Object.defineProperty(obj, key, {
    get() {
      // 读取：依赖收集（谁在用这个值）
      return value
    },
    set(newVal) {
      // 设置：触发更新（通知谁需要重新计算/渲染）
      value = newVal
      console.log('触发更新：', key)
    }
  })
}

const data = { count: 0 }
defineReactive(data, 'count')

console.log(data.count) // 触发 get
data.count = 1          // 触发 set
```

Vue2 会对 `data` 中的对象做递归处理，把可枚举字段转成这种“可观测”的属性。

---

## 8.3 getter/setter 的触发逻辑

你需要把 Vue2 的响应式理解成一个“读写拦截器”：

- **读（getter）**：记录“谁依赖了它”
  - 比如：模板里渲染了 `count`
  - 或者 computed/watch 里用到了 `count`

- **写（setter）**：通知“依赖它的人去更新”
  - 重新渲染模板
  - 重新计算 computed
  - 触发 watch 回调

这也是为什么：

- 只要你的数据是“被 Vue 转成响应式”的，更新就会自动发生
- 但如果某些变化绕过了 getter/setter，Vue 就可能“感知不到”

---

## 8.4 Vue2 响应式的局限

Vue2 的局限本质上来自：

- `Object.defineProperty` 只能拦截“已有属性”的读写
- 无法天然拦截“新增属性”或“数组某些变更方式”

### 8.4.1 对象新增属性无法监听

示例：

```js
data: {
  user: { name: 'Tom' }
}
```

如果你后面这样写：

```js
this.user.age = 18
```

在 Vue2 中，`age` 这个字段默认不是响应式的（因为初始化时不存在，Vue 没给它加 getter/setter）。

### 8.4.2 数组索引修改无法监听

Vue2 不能可靠拦截这种写法：

```js
this.list[0] = 'new'
```

以及直接修改 length：

```js
this.list.length = 0
```

因此你会遇到一种现象：

- 数据确实变了
- 但页面没更新

---

## 8.5 解决方案

### 8.5.1 `Vue.set / this.$set`

用于：

- 给对象新增一个响应式字段
- 或按索引修改数组并保持更新

#### 1) 给对象新增字段

```js
this.$set(this.user, 'age', 18)
```

或：

```js
Vue.set(this.user, 'age', 18)
```

#### 2) 按索引更新数组

```js
this.$set(this.list, 0, 'new')
```

### 8.5.2 `Vue.delete / this.$delete`

用于删除属性并触发更新：

```js
this.$delete(this.user, 'age')
```

---

## 8.6 项目里的实践建议

- 如果你的对象字段是“可能存在/可能不存在”的，建议：
  - **在 data 初始化时把字段写全**（哪怕先给默认值）
  - 这样就能避免“新增字段不响应”的坑

例如：

```js
data: {
  user: {
    name: '',
    age: null
  }
}
```

- 对数组的更新：
  - 避免直接按索引赋值
  - 尽量用：
    - `push/pop/shift/unshift/splice/sort/reverse`（Vue2 对这些做了处理）
    - 或 `this.$set(arr, index, val)`

---

## 本章小结

- Vue2 的响应式基于 `Object.defineProperty` 给属性加 getter/setter。
- getter 用来依赖收集，setter 用来触发更新。
- 局限：对象新增字段、数组按索引赋值/改 length 这类变化 Vue2 默认感知不到。
- 解决：使用 `Vue.set / this.$set`、`Vue.delete / this.$delete`，或在初始化阶段把字段声明完整。

**下一章预告**

第9章将学习计算属性 `computed`：它为什么有缓存、什么时候该用 computed 而不是 methods。
