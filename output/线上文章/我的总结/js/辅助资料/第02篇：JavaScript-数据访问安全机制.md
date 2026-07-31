---
title: "第 2 篇：JavaScript 数据访问安全机制"
slug: "js-js-f6bc0394"
summary: "JavaScript可选链操作符（?.）和空值合并操作符（??）的使用方法、原理及与相关操作符的区别。"
category: "辅助资料"
tags:
  - "JavaScript"
  - "可选链操作符"
  - "空值合并操作符"
  - "数据访问"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291f8a2b1c68f2cac394"
originalSlug: "js-js-f6bc0394"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 2 篇：JavaScript 数据访问安全机制
### 一、可选链操作符（`?.`）
精准定义：  
可选链操作符（`?.`）允许你安全地访问嵌套对象的属性或调用其方法，而无需明确验证链中的每个引用是否有效。

核心逻辑：  
当 `?.` 左侧的表达式为 `null` 或 `undefined` 时，整个表达式会立即短路，返回 `undefined`。无论后续属性是否存在，都不会再尝试访问，从而避免报错。

与传统 `.` 操作符的关键区别：

1. `obj.property`：
   - `obj` 存在，`property` 不存在，返回 `undefined`（不会报错）
   - `obj` 不存在（为 `null` / `undefined`），抛出 `TypeError`（如：`Cannot read properties of undefined`）
2. `obj?.property`：
   - `obj` 存在，`property` 不存在，返回 `undefined`
   - `obj` 不存在（为 `null` / `undefined`），安全返回 `undefined`

结论：  
可选链的核心价值在于处理链式访问起点可能为 `null/undefined` 的情况，从根本上防止因访问不存在的根对象而导致的运行时错误。

---

### 二、空值合并操作符（`??`）
精准定义：  
空值合并操作符（`??`）是一个逻辑运算符，它在其左侧操作数为 `null` 或 `undefined` 时，返回右侧操作数；否则返回左侧操作数。

空值的含义：  
这里的空值特指 `null` 和 `undefined`。之所以命名为“空值合并”，是因为它专门用于将这两种空值合并为一个预先定义的默认值。

与逻辑或（`||`）的核心区别：

- `||` 会在左侧操作数为任何假值（`false`、`0`、`''`、`null`、`undefined`、`NaN`）时返回右侧
- `??` 只关心 `null` 或 `undefined`，这在处理可能为合法假值（如数字 `0`、空字符串 `''`）的场景时非常关键

面试示例：

```javascript
const count = 0
console.log(count || 10) // 10 (0 是假值，所以被忽略了)
console.log(count ?? 10) // 0 (0 不是 null/undefined，所以被保留)
```
