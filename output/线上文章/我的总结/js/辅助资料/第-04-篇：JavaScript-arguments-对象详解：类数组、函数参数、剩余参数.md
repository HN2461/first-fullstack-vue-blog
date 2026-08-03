---
title: "第 04 篇：JavaScript arguments 对象详解：类数组、函数参数、剩余参数"
slug: "js-js-arguments-c45f50a4"
summary: "JavaScript arguments 对象的特性、使用方法和现代替代方案（rest parameters）。"
category: "辅助资料"
categoryPath:
  - "我的总结"
  - "js"
  - "辅助资料"
tags:
  - "JavaScript"
  - "arguments"
  - "函数参数"
  - "rest parameters"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac3a4"
originalSlug: "js-js-arguments-c45f50a4"
originalStatus: "published"
publishedAt: "2026-05-07T13:25:33.657Z"
updatedAt: "2026-07-31T11:16:24.369Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 04 篇：JavaScript arguments 对象详解：类数组、函数参数、剩余参数
在调用函数时，浏览器每次都会传递两个隐含参数：

1. 函数的上下文对象 `this`
2. 封装实参的对象 `arguments`

当我们不确定有多少参数传递时，可以使用 `arguments` 获取。在 JS 中，`arguments` 是当前函数的内置对象，存储了传递的所有实参。

（1）`arguments` 是**类数组对象**（Array-like Object），不是真正的数组：

- 具有数组的 `length` 属性
- 按索引顺序存储数据
- 没有真正数组的方法（如 `map`、`forEach`、`push` 等）
- 有一个特殊属性 `callee`，指向当前执行的函数本身

```javascript
function fn() {
  console.log(arguments.length)    // 实参数量
  console.log(arguments[0])        // 第一个实参
  console.log(arguments.callee === fn)  // true，指向 fn 本身
}
fn(1, 2, 3)
```

（2）在调用函数时，传递的实参都会在 `arguments` 中保存。

（3）即使不定义形参，也可以通过 `arguments` 访问实参，只是可读性稍差：

- `arguments[0]` 表示第一个实参
- `arguments[1]` 表示第二个实参

---

### 重要补充

**箭头函数没有 `arguments`**：ES6 箭头函数没有自己的 `arguments` 对象，如果访问，会沿用外层普通函数的 `arguments`。这种情况下应使用 rest parameters（剩余参数）代替。

```javascript
// 普通函数：有 arguments
function fn() {
  console.log(arguments)  // [Arguments] { '0': 1, '1': 2 }
}
fn(1, 2)

// 箭头函数：没有 arguments
const arrowFn = () => {
  console.log(arguments)  // ReferenceError
}
arrowFn(1, 2)
```

**ES6 推荐替代方案：rest parameters（剩余参数）**

`...args` 是更现代的做法，它创建一个真实数组，可以直接使用数组方法：

```javascript
function fn(...args) {
  console.log(args)       // [1, 2, 3]，是真实数组
  console.log(args.map(x => x * 2))  // [2, 4, 6]
}
fn(1, 2, 3)
```

`arguments` 是历史遗留用法，新代码推荐使用 rest parameters。
