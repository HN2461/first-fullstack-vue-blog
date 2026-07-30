---
title: "第05篇：JavaScript this 指向规则详解"
slug: "js-js-this-515c53fa"
summary: "JavaScript this 指向的完整规则，包括普通函数调用、方法调用、构造函数调用和箭头函数特性。"
category: "辅助资料"
tags:
  - "JavaScript"
  - "this"
  - "函数调用"
  - "箭头函数"
status: "draft"
sortOrder: 230
cover: ""
originalId: "6a2d291f8a2b1c68f2cac3ac"
originalSlug: "js-js-this-515c53fa"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第05篇：JavaScript this 指向规则详解

你原来的 4 条结论抓住了主干，但有两处容易误导：

1. `this` 不是“永远是 window”，而是取决于调用方式与是否严格模式。
2. `call/apply` 的第一个参数不总是“默认 window”，严格模式与箭头函数要单独看。

下面给你一版可直接记忆、能覆盖绝大多数面试和实战场景的规则。

## 1. 一句话总规则

`this` 在普通函数里由“调用方式”决定，不由“定义位置”决定。

```javascript
const obj = {
  x: 1,
  fn() {
    return this.x
  }
}

obj.fn() // 1，this 是 obj
const g = obj.fn
g() // 非严格模式下 this 是 globalThis；严格模式下 this 是 undefined
```

## 2. 你的 4 条结论，校正后版本

### 2.1 普通函数调用（直接调用）

原结论“以函数形式调用时，this 永远是 window”不严谨。

准确说法：

- 非严格模式：`this` 会被替换为全局对象（浏览器里通常是 `window`，更通用写法是 `globalThis`）
- 严格模式：`this` 保持 `undefined`

```javascript
function a() {
  return this
}

function b() {
  'use strict'
  return this
}

a() // 浏览器中通常是 window
b() // undefined
```

### 2.2 作为对象方法调用

这个你原来是对的：`obj.fn()` 中 `this === obj`。

```javascript
const user = {
  name: 'Tom',
  say() {
    return this.name
  }
}

user.say() // 'Tom'
```

注意：把方法“摘出来”再调用，规则会变回“普通函数调用”。

```javascript
const say = user.say
say() // 非严格模式下通常是 globalThis.name；严格模式下 this 是 undefined
```

### 2.3 构造调用（new）

这个你也对：`new Fn()` 时，`this` 指向新实例。

```javascript
function Person(name) {
  this.name = name
}

const p = new Person('Alice')
p.name // 'Alice'
```

### 2.4 call / apply / bind

你的主结论对，但“默认 window”要改成更精确版本。

- `call` / `apply`：立即执行，显式指定 `this`
- `bind`：不立即执行，返回绑定了 `this` 的新函数
- 第一个参数传 `null`/`undefined` 时：
- 对非严格普通函数，`this` 会被替换为全局对象
- 对严格普通函数，`this` 保持原值（`null` 或 `undefined`）
- 对箭头函数，`this` 不受 `call/apply/bind` 影响

```javascript
function normal() {
  return this
}

function strictFn() {
  'use strict'
  return this
}

const arrow = () => this

normal.call(null) // 非严格：通常是 globalThis
strictFn.call(null) // null
arrow.call({ a: 1 }) // 仍是定义处外层 this，不会变成 { a: 1 }
```

## 3. 箭头函数：只看定义位置，不看调用方式

你的理解方向是对的。补一句关键点：

- 箭头函数没有自己的 `this`
- 它会捕获定义时外层作用域的 `this`
- 不能当构造函数（`new` 会报错）

```javascript
const obj = {
  x: 10,
  normal() {
    return this.x
  },
  arrow: () => this
}

obj.normal() // 10
obj.arrow() // 不是 obj，取决于 arrow 定义时的外层 this
```

## 4. 为什么定时器和事件里总“丢 this”

本质不是 this 随机变化，而是“调用者变了”。

### 4.1 setTimeout

```javascript
class Counter {
  constructor() {
    this.count = 0
  }

  increment() {
    this.count += 1
  }

  start() {
    setTimeout(this.increment, 1000)
  }
}
```

`this.increment` 被当作普通函数传入，执行时不再是 `实例.方法()` 形式，类方法又是严格模式，因此 `this` 是 `undefined`，会报错。

修复方式：

```javascript
setTimeout(() => this.increment(), 1000)
// 或
setTimeout(this.increment.bind(this), 1000)
```

### 4.2 addEventListener

```javascript
class Counter {
  constructor(btn) {
    this.btn = btn
    this.count = 0
    this.btn.addEventListener('click', this.increment)
  }

  increment() {
    this.count += 1
  }
}
```

DOM 事件回调里的普通函数，`this` 默认指向触发事件的元素（`currentTarget`），不是类实例。

修复同样是 `bind` 或箭头函数包装：

```javascript
this.btn.addEventListener('click', this.increment.bind(this))
// 或
this.btn.addEventListener('click', () => this.increment())
```

## 5. 回调函数 this 的常见误区（你提到的核心问题）

误区：`obj.method(callback)` 里 callback 的 this 会继承 method 的 this。

纠正：method 的 this 和 callback 的 this 是两套独立规则。

- `arr.forEach(fn, thisArg)`：`fn` 的 this 可由 `thisArg` 指定
- `Promise.then(fn)`：`fn` 的 this 不会被 promise 实例设为回调 this
- 事件监听：回调普通函数的 this 默认是事件目标元素

```javascript
const ctx = { total: 0 }
;[1, 2, 3].forEach(function (n) {
  this.total += n
}, ctx)

ctx.total // 6
```

## 6. 高效记忆版

1. 先判断是否箭头函数。
2. 是箭头函数：this 看定义位置外层 this。
3. 不是箭头函数：this 看调用方式。
4. `new` 调用优先级高，this 指向新实例。
5. `call/apply/bind` 可以显式指定普通函数 this。
6. 严格模式下，普通函数直接调用 this 是 `undefined`。

## 7. 箭头函数小白版（最通俗）

如果你只想先搞懂 80%，先背这 4 句：

1. 普通函数：`this` 看“谁调用它”。
2. 箭头函数：`this` 不看调用者，只看“它写在哪里”。
3. 定时器和事件监听会把方法拆出来单独调，所以常丢 `this`。
4. 防丢就两招：`bind(this)` 或 `() => this.xxx()`。

### 7.1 把 setTimeout 和事件监听放在一起看（最容易秒懂）

你只要记住：它们都会把你的方法拆出来再调用，所以类实例 this 会丢。

第一组：`setTimeout` 丢 this

```javascript
setTimeout(this.increment, 1000)
```

等价拆解：

```javascript
const fn = this.increment
setTimeout(fn, 1000)
```

关键点：执行时是“裸调用”`fn()`，不是 `实例.increment()`，类方法又是严格模式，所以 `this` 变成 `undefined`。

直接后果：

- `this.count++` 会直接报错
- `this.xxx()` 这种实例方法调用也会报错

第二组：`addEventListener` 丢 this

```javascript
btn.addEventListener('click', this.increment)
```

等价拆解：

```javascript
const fn = this.increment
btn.addEventListener('click', fn)
// 触发点击时可理解为 fn.call(btn)
```

关键点：事件回调是普通函数时，浏览器默认把 `this` 设为当前绑定元素（更准确是 `currentTarget`），所以此时 `this` 是 `btn`，不是类实例。

直接后果：

- 你的 `increment()` 本来要改实例 `this.count`，现在可能在 DOM 元素上读写属性，实例状态不更新
- 如果你在回调里继续调用实例方法，通常会出现 `is not a function` 一类错误

一句话对比：

1. `setTimeout(this.fn)` 在严格模式里常见是 `this === undefined`
2. `addEventListener('click', this.fn)` 常见是 `this === DOM 元素`
3. 共同点：都不是类实例 `this`

### 7.2 终极防丢模板（直接套）

```javascript
class Counter {
  constructor(btn) {
    this.btn = btn
    this.count = 0
    this.btn.addEventListener('click', () => this.increment())
    // 或 this.btn.addEventListener('click', this.increment.bind(this))
  }

  increment() {
    this.count += 1
    console.log(this.count)
  }

  start() {
    setTimeout(() => this.increment(), 1000)
    // 或 setTimeout(this.increment.bind(this), 1000)
  }
}
```

### 7.3 一步判断法（做题秒用）

1. 这个函数是不是箭头函数？
2. 是箭头函数：去定义位置找外层 `this`。
3. 不是箭头函数：去调用位置看谁在点它（`obj.fn()` 里的 `obj`）。
4. 如果是“被传来传去的回调”，优先怀疑 `this` 丢失，先用箭头函数或 `bind` 修复。

## 8. 你这篇原文中的关键纠错清单

- “普通函数 this 永远是 window” -> 改为“非严格模式下直接调用通常是全局对象，严格模式下是 undefined”。
- “call/apply 不写第一个参数默认 window” -> 改为“非严格普通函数会替换到全局对象，严格函数保留 null/undefined，箭头函数不受影响”。
- “谁调用接收回调的方法，回调 this 就跟谁” -> 改为“接收回调的方法 this 与回调 this 分开判断”。

## 9. 参考资料（权威）

- MDN: this
  https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this
- MDN: Strict mode（No this substitution）
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
- MDN: Arrow function expressions
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
- MDN: Function.prototype.bind
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
- MDN: Array.prototype.forEach（thisArg）
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
- MDN: addEventListener
  https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
- MDN: setTimeout
  https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
