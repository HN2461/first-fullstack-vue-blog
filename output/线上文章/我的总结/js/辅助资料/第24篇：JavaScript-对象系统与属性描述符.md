---
title: "第24篇：JavaScript 对象系统与属性描述符"
slug: "js-js-d03088d0"
summary: "系统补齐对象创建、原型关联、属性描述符、可枚举性和冻结封印等高频对象题，避免只会讲原型链不会讲对象本身。"
category: "辅助资料"
categoryPath:
  - "我的总结"
  - "js"
  - "辅助资料"
tags:
  - "JavaScript"
  - "对象"
  - "属性描述符"
  - "Object.defineProperty"
  - "面试题"
status: "published"
sortOrder: 230
cover: ""
originalId: "6a2d291f8a2b1c68f2cac442"
originalSlug: "js-js-d03088d0"
originalStatus: "published"
publishedAt: "2026-05-10T11:51:43.091Z"
updatedAt: "2026-06-22T02:08:44.095Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 第24篇：JavaScript 对象系统与属性描述符

很多人原型链能答，但一到对象本身就只会说“对象是键值对”。

这在面试里很容易被继续追问：

- 属性到底分哪几类
- `in` 和 `hasOwnProperty` 有什么区别
- `Object.create()` 做了什么
- `Object.defineProperty()` 为什么能做响应式
- `freeze`、`seal`、`preventExtensions` 差别是什么

这篇就是专门补这个断层。

---

## 一、这篇要解决什么问题

学完后至少要能讲清：

1. JavaScript 对象如何创建
2. 自有属性和继承属性有什么区别
3. 数据属性和访问器属性有什么区别
4. 什么是属性描述符
5. 如何控制属性的可写、可枚举、可配置
6. `freeze` / `seal` / `preventExtensions` 怎么区分

---

## 二、对象不是“只有键值对”这么简单

对象至少包含两层重要信息：

1. 属性集合
2. 内部原型指向

也就是说，一个对象不仅有“自己身上的属性”，还可能沿原型链继承别的属性和方法。

---

## 三、常见创建对象的方式

### 1. 对象字面量

```javascript
const user = {
  name: 'Tom'
}
```

适合最常见场景。

### 2. `new Object()`

```javascript
const user = new Object()
user.name = 'Tom'
```

能用，但现代开发一般不主推。

### 3. 构造函数 / class

```javascript
function User(name) {
  this.name = name
}

const user = new User('Tom')
```

适合一批结构相似的实例。

### 4. `Object.create(proto)`

```javascript
const parent = {
  sayHi() {
    return 'hi'
  }
}

const child = Object.create(parent)
child.name = 'Tom'
```

这在面试里很重要，因为它能显式指定新对象的原型。

---

## 四、自有属性 vs 继承属性

### 1. 自有属性

直接挂在对象本身上的属性。

### 2. 继承属性

通过原型链从上层拿到的属性。

### 3. 必会对比

```javascript
const parent = { city: 'Shanghai' }
const child = Object.create(parent)
child.name = 'Tom'

console.log(child.name) // 自有属性
console.log(child.city) // 继承属性
```

---

## 五、`in`、`hasOwnProperty`、`Object.hasOwn()` 的区别

### 1. `in`

只要对象自己或原型链上存在这个属性，就返回 `true`。

### 2. `hasOwnProperty`

只看对象自己身上的属性。

### 3. `Object.hasOwn()`

现代更推荐，语义更清晰，也避免对象自己改写 `hasOwnProperty` 的问题。

### 4. 面试一句话版

> `in` 会查原型链，`hasOwnProperty` 和 `Object.hasOwn()` 只查对象自身属性。

---

## 六、属性其实分两大类

### 1. 数据属性

最常见，就是普通的值属性：

```javascript
const obj = {
  name: 'Tom'
}
```

### 2. 访问器属性

通过 `get` / `set` 控制读取和赋值过程：

```javascript
const obj = {
  _name: 'Tom',
  get name() {
    return this._name
  },
  set name(value) {
    this._name = value
  }
}
```

很多响应式原理、封装校验都和访问器属性有关。

---

## 七、什么是属性描述符

### 1. 数据属性描述符

主要有 4 个关键字段：

- `value`
- `writable`
- `enumerable`
- `configurable`

### 2. 访问器属性描述符

主要看：

- `get`
- `set`
- `enumerable`
- `configurable`

### 3. 为什么面试爱问

因为这块能看出你是否真的知道对象属性“不是随便挂上去就完了”。

---

## 八、`Object.defineProperty()` 的核心用法

### 1. 控制可写性

```javascript
const obj = {}

Object.defineProperty(obj, 'name', {
  value: 'Tom',
  writable: false,
  enumerable: true,
  configurable: true
})
```

### 2. 做访问拦截

```javascript
const obj = {
  _age: 18
}

Object.defineProperty(obj, 'age', {
  get() {
    return this._age
  },
  set(value) {
    if (value < 0) return
    this._age = value
  }
})
```

### 3. 面试连接点

- Vue 2 响应式为什么大量依赖它
- 为什么它对新增属性监听不天然友好
- 为什么后来很多场景转向 `Proxy`

---

## 九、可枚举性到底在说什么

`enumerable` 决定属性在“枚举行为”里会不会被遍历出来。

常见相关行为：

- `for...in`
- `Object.keys()`
- `JSON.stringify()` 的可见结果

面试里很适合补一句：

> 属性能访问到，不代表它一定能被枚举出来。

---

## 十、`freeze`、`seal`、`preventExtensions` 区别

### 1. `Object.preventExtensions(obj)`

- 不能新增属性
- 但已有属性通常还能改值、也可能还能删

### 2. `Object.seal(obj)`

- 不能新增属性
- 不能删除属性
- 但已有可写属性通常还能改值

### 3. `Object.freeze(obj)`

- 不能新增属性
- 不能删除属性
- 已有数据属性通常也不能改值

### 4. 一句话记忆

```plain
preventExtensions 最松
seal 封口
freeze 冻住
```

---

## 十一、这篇和已有原型链文章怎么配合

可以这样串：

1. 先用原型链文章理解对象的继承关系
2. 再用这篇理解对象自身属性如何定义和控制
3. 最后把 `Object.create()`、属性描述符、枚举规则拼起来

这样对象系统才算完整。

---

## 十二、面试高频追问清单

1. `Object.create(null)` 有什么特点
2. `in` 和 `hasOwnProperty` 的区别
3. `Object.defineProperty` 默认哪些字段是 `false`
4. 为什么有的属性 `for...in` 遍历不到
5. `freeze` 是浅冻结还是深冻结
6. Vue 2 为什么用 `defineProperty`，Vue 3 为什么偏向 `Proxy`

---

## 十三、30 秒回答模板

> JavaScript 对象不只是键值对，它还包含属性描述信息和原型关联。对象属性既有自有属性也有继承属性，判断时 `in` 会查原型链，`hasOwnProperty` 只查自身。属性还分数据属性和访问器属性，可以通过 `Object.defineProperty` 控制 `writable`、`enumerable`、`configurable` 这些行为。再往下，`preventExtensions`、`seal`、`freeze` 则分别控制对象能不能扩展、删除和修改。

---

## 十四、你后续补全这篇时建议继续写什么

1. `Object.getOwnPropertyDescriptor()` 和批量描述符
2. `Object.assign()` 是浅拷贝以及覆盖规则
3. `Object.create(null)` 作为纯字典对象的优缺点
4. `Proxy` 和 `defineProperty` 在对象拦截上的差异
5. 一组输出题，专门练可枚举性和原型链判断

---

## 十五、记忆口诀

```plain
对象看两层
一层是属性
一层是原型
属性有描述
枚举看规则
冻结分三级
```
