---
title: "第15篇：Map 与 Set 事件订阅管理器"
slug: "js-js-map-set-696642c1"
summary: "从 ES6 Map/Set 基础概念到事件订阅管理器实战，详解如何使用 Map 和 Set 构建高效、可维护的事件系统。"
category: "辅助资料"
tags:
  - "JavaScript"
  - "Map"
  - "Set"
  - "事件订阅"
  - "设计模式"
status: "draft"
sortOrder: 150
cover: ""
originalId: "6a2d291f8a2b1c68f2cac400"
originalSlug: "js-js-map-set-696642c1"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第15篇：Map 与 Set 事件订阅管理器

目标：**一次复习，长期可用**。这篇笔记从 ES6 的 Map / Set 概念讲起，再过渡到事件订阅管理器（EventManager），由浅入深，避免以后复习时还要先翻 Map / Set 的资料。

---

## 一、为什么要学 Map / Set（先讲“为什么”）
在实际开发中，我们经常遇到这些需求：

+ 需要 **用某个“标识”快速找到对应的数据**（例如：事件名 -> 回调列表）
+ 需要 **保证数据不重复**（例如：同一个回调不要被绑定多次）
+ 需要 **频繁增删、查询**，而不是只读

如果只用：

+ **普通对象 + 数组**：
  - 对象键只能是 **字符串或 Symbol**
  - 数组需要手动去重
  - API 语义不清晰

ES6 提供了 **Map / Set**，专门解决这些问题。

---

## 二、Map：键值对集合

### 1. Map 是什么（概念）
**Map = 键值对的集合**（程序员常叫：映射 / 字典）

+ 一个键，只能对应一个值
+ 键具有唯一性，不会重复
+ 键可以是 **任意类型**（字符串、对象、函数都行）

心智模型：

+ 键 -> 门牌号
+ 值 -> 房子
+ 用键找值

### 2. Map 创建方法

```javascript
// 空 Map
const m1 = new Map()

// 从二维数组初始化
const m2 = new Map([
  ['name', '张三'],
  ['age', 18],
  ['city', '北京']
])

// 从其他可迭代对象
const m3 = new Map([
  [{ id: 1 }, '用户1'],
  [Symbol('key'), '符号键']
])
```

### 3. Map 的核心特性
+ 不会出现重复键
+ 键存在时，`set` 会 **覆盖值，不会新建键**
+ 非常适合「**一一对应关系**」的场景
+ 保持插入顺序
+ 键比较遵循 `SameValueZero`

### 4. Map 常用 API（必背）

| API | 作用 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `map.set(key, value)` | 新增/覆盖键值对 | 返回 Map 自身（可链式） | 键存在时覆盖原值 |
| `map.get(key)` | 通过键取值 | `value` 或 `undefined` | 键不存在返回 `undefined` |
| `map.has(key)` | 判断键是否存在 | `boolean` | 支持任意类型键 |
| `map.delete(key)` | 删除键值对 | `boolean` | 成功删除返回 `true` |
| `map.clear()` | 清空全部 | `undefined` | 清空所有键值对 |
| `map.size` | 键值对数量 | `number` | 属性，不是方法 |

### 5. Map 使用示例

```javascript
const m = new Map()

m.set('click', 123)
m.set('click', 456) // 覆盖，不是新增
m.set('hover', 789)

console.log(m.size) // 2
console.log(m.get('click')) // 456
console.log(m.has('hover')) // true

// 链式调用
m.set('focus', '获得焦点').set('blur', '失去焦点')

// 遍历
for (const [key, value] of m) {
  console.log(key, value)
}

m.delete('hover') // true
m.clear() // undefined
```

---

## 三、Set：唯一值集合

### 1. Set 是什么（概念）
**Set = 一组不重复的值的集合**（程序员常叫：集合）

+ 没有键名，只有值
+ 值具有唯一性
+ 适合用来 **去重、存唯一成员**

心智模型：

+ 一个箱子
+ 只关心「有没有这个东西」
+ 没有索引访问语义，但遍历时保持插入顺序

### 2. Set 创建方法

```javascript
// 空 Set
const s1 = new Set()

// 从数组初始化（自动去重）
const s2 = new Set([1, 2, 2, 3, 3, 4]) // {1, 2, 3, 4}

// 从字符串（每个字符成为独立元素）
const s3 = new Set('hello') // {'h', 'e', 'l', 'o'}

// 从其他可迭代对象
const s4 = new Set(document.querySelectorAll('div'))
```

### 3. Set 的核心特性
+ 没有 `get` 方法（因为没有键）
+ 自动去重
+ 可迭代（`forEach` / `for...of`）
+ 保持插入顺序
+ 值比较遵循 `SameValueZero`

### 4. 迭代器（Iterator）是什么
迭代器是一个知道如何**逐个访问**集合中所有元素的对象。

核心接口：对象有一个 `next()` 方法，每次调用返回 `{ value, done }`。

```javascript
const set = new Set(['a', 'b', 'c'])
const it = set.values() // 拿到迭代器

it.next() // { value: 'a', done: false }
it.next() // { value: 'b', done: false }
it.next() // { value: 'c', done: false }
it.next() // { value: undefined, done: true }
```

为什么你总会遇到它：

+ `for...of`
+ 展开运算符 `[...xxx]`
+ `Array.from()`

本质都依赖迭代器协议。

### 5. Set 常用 API（必背）

| API | 作用 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `set.add(value)` | 添加值（自动去重） | 返回 Set 自身（可链式） | 重复值会被忽略 |
| `set.has(value)` | 判断值是否存在 | `boolean` | 精确匹配，包括对象引用 |
| `set.delete(value)` | 删除值 | `boolean` | 成功删除返回 `true` |
| `set.clear()` | 清空全部 | `undefined` | 清空所有元素 |
| `set.size` | 元素个数 | `number` | 属性，不是方法 |

### 6. Set 使用示例

```javascript
const s = new Set()

const fn1 = () => console.log('fn1')

s.add(1)
s.add(2)
s.add(2) // 重复，不会添加
s.add(fn1)
s.add(fn1) // 同一个函数引用，不会添加

console.log(s.size) // 3
console.log(s.has(2)) // true
console.log(s.has(fn1)) // true

// 链式调用
s.add('hello').add('world')

// 遍历
for (const value of s) {
  console.log(value)
}

s.delete(2) // true
s.clear() // undefined
```

---

## 四、Map 和 Set API 设计对称性分析

### API 为什么长得像
Map 和 Set 的设计是**刻意对称**的，这样更容易记忆：

| 功能 | Map | Set | 区别 |
| --- | --- | --- | --- |
| 新增 | `set(key, val)` | `add(val)` | Map 有键有值，Set 只有值 |
| 判断存在 | `has(key)` | `has(val)` | 一样 |
| 删除 | `delete(key)` | `delete(val)` | 一样 |
| 取值 | `get(key)` | 无 | Set 无 `get`，遍历拿值 |
| 清空 | `clear()` | `clear()` | 一样 |
| 数量 | `size` | `size` | 都是属性（不是方法） |

一句话记忆：

**Map 是 `set` 存、`get` 取；Set 是 `add` 存、没有 `get`（用 `has` 判断，用遍历取）**

---

## 五、为什么 Map + Set 是黄金组合
这是事件管理器设计的核心思想。

### 组合含义
+ **Map**：事件名 -> 回调集合
+ **Set**：同一事件下的所有回调（唯一）

```text
Map
├── 'login'  -> Set(fn1, fn2)
├── 'logout' -> Set(fn3)
```

### 对比普通方案
| 方案 | 问题 |
| --- | --- |
| 对象 + 数组 | 键受限、回调重复、维护复杂 |
| Map + Set | 语义清晰、自动去重、易维护 |

---

## 六、事件订阅管理器（EventManager）实战

### 1. 设计目标
+ 一个事件 -> 多个回调
+ 回调不重复
+ 可绑定 / 可解绑 / 可触发
+ 支持跨文件、跨组件通信

### 2. 完整实现（可直接复制）

```javascript
class EventManager {
  constructor() {
    // Map: event -> Set<callback>
    this.listeners = new Map()
  }

  on(event, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function')
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const bucket = this.listeners.get(event)
    bucket.add(callback)

    // 返回取消订阅函数，方便在调用方释放
    return () => this.off(event, callback)
  }

  once(event, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function')
    }

    const wrapper = (data) => {
      this.off(event, wrapper)
      callback(data)
    }

    return this.on(event, wrapper)
  }

  off(event, callback) {
    const bucket = this.listeners.get(event)
    if (!bucket) {
      return false
    }

    const deleted = bucket.delete(callback)

    // 空桶及时回收，避免长期积累空 Set
    if (bucket.size === 0) {
      this.listeners.delete(event)
    }

    return deleted
  }

  emit(event, data) {
    const bucket = this.listeners.get(event)
    if (!bucket || bucket.size === 0) {
      return 0
    }

    // 做一次快照，避免回调内部 on/off 影响当前轮遍历
    const callbacks = [...bucket]
    callbacks.forEach((cb) => cb(data))

    return callbacks.length
  }

  clear(event) {
    if (typeof event === 'undefined') {
      this.listeners.clear()
      return
    }
    this.listeners.delete(event)
  }

  listenerCount(event) {
    return this.listeners.get(event)?.size ?? 0
  }
}
```

### 3. 三个核心动作
+ `on`：Map 按事件分组，Set 存唯一回调
+ `off`：从指定事件的 Set 中精准删回调
+ `emit`：遍历 Set，执行所有回调

关键点：

+ 必须用**同一个函数引用**才能精准解绑
+ 匿名函数直接写在 `on` 里，后续通常无法 `off`

---

## 七、实战使用场景
+ 登录成功后同时：更新用户信息、关闭登录弹窗、显示欢迎语
+ 全局通知 / 消息系统
+ 跨组件通信（不依赖 props / emit）

---

## 八、Map / Set 速记口诀（复习用）
+ **Map**：有键有值，用 `set` 存，用 `get` 取
+ **Set**：只有值，用 `add` 存，不用 `get`
+ **去重 -> Set**
+ **映射关系 -> Map**

---

以后复习可以这样看：

1. 想不起 Map / Set -> 看前半部分
2. 想不起事件管理器 -> 看后半部分

这样能直接从概念过渡到实战。
