---
title: "第四篇：Node.js 模块化系统详解"
slug: "node-js-5de6ee42"
summary: "深入理解 Node.js 的 CommonJS 模块规范，掌握 require/module.exports/exports 的工作原理，以及 ES6 模块化的 import/export 用法与两者的区别。"
category: "Node.js"
tags:
  - "Node.js"
  - "CommonJS"
  - "ES6模块"
  - "require"
  - "import"
  - "模块化"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291e8a2b1c68f2cac1f2"
originalSlug: "node-js-5de6ee42"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 第四篇：模块化系统详解

> 模块化是工程化的基础。理解 require 的加载机制，能帮你避开很多奇怪的 bug。

---

## 一、为什么需要模块化

没有模块化时，所有代码写在一个文件里，或者用 `<script>` 标签全局引入：

```javascript
// ❌ 没有模块化的问题
var name = 'Alice'  // 全局变量，容易被覆盖

// 另一个文件也定义了 name
var name = 'Bob'    // 覆盖了上面的 name！
```

模块化解决了：
- **命名冲突**：每个模块有自己的作用域
- **依赖管理**：明确声明依赖关系
- **代码复用**：模块可以被多处引用
- **可维护性**：功能拆分，职责清晰

---

## 二、CommonJS 规范

Node.js 默认使用 CommonJS 模块规范，每个 `.js` 文件就是一个模块。

### 2.1 导出：module.exports

```javascript
// math.js — 导出模块

// 方式一：直接赋值（替换整个导出对象）
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  PI: 3.14159
}

// 方式二：逐个添加属性
module.exports.add = (a, b) => a + b
module.exports.PI = 3.14159

// 方式三：导出单个值（函数、类、字符串等）
module.exports = function greet(name) {
  return `Hello, ${name}!`
}

// 方式四：导出一个类
module.exports = class Calculator {
  add(a, b) { return a + b }
  subtract(a, b) { return a - b }
}
```

### 2.2 exports 简写

`exports` 是 `module.exports` 的引用，可以用来简写：

```javascript
// 等价写法
exports.add = (a, b) => a + b
// 等同于
module.exports.add = (a, b) => a + b
```

**但有一个陷阱**：

```javascript
// ❌ 错误：直接给 exports 赋值，会断开与 module.exports 的引用
exports = { add: (a, b) => a + b }
// 这样导出的是空对象 {}，因为 module.exports 没有变

// ✅ 正确：要替换整个导出对象，必须用 module.exports
module.exports = { add: (a, b) => a + b }
```

> **记住**：`require` 返回的是 `module.exports`，不是 `exports`。

### 2.3 导入：require

```javascript
// main.js — 导入模块

// require(id) — 同步加载模块
//   id: 模块标识符
//     内置模块：'fs'、'path'、'http' 等（Node 16+ 推荐加 node: 前缀）
//     本地模块：'./math'、'../utils/string'（必须以 ./ 或 ../ 开头）
//     第三方模块：'express'、'lodash'（从 node_modules 查找）

// ✅ 推荐：使用 node: 前缀引入内置模块（Node 14.18+，避免与第三方包冲突）
const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')

// 也可以不加前缀（兼容旧代码）
const fs2 = require('fs')

// 导入本地模块
const math = require('./math')
console.log(math.add(1, 2))  // 3

// 解构导入
const { add, subtract } = require('./math')
console.log(add(5, 3))  // 8

// 导入第三方模块
const express = require('express')

// 导入 JSON 文件（自动解析为对象）
const config = require('./config.json')
console.log(config.port)  // 3000

// require.resolve(id) — 只解析路径，不加载模块
// 返回模块的绝对路径
const mathPath = require.resolve('./math')
console.log(mathPath)  // '/Users/xxx/project/math.js'

// require.main — 当前进程的入口模块
// 判断当前文件是否是直接运行的（而不是被 require 的）
if (require.main === module) {
  console.log('直接运行')
} else {
  console.log('被 require 引入')
}
```

---

## 三、require 的加载机制

### 3.1 加载顺序

当你写 `require('xxx')` 时，Node.js 按以下顺序查找：

```
1. 内置模块（fs、http、path 等）
   → 直接返回，最快

2. 以 ./ 或 ../ 开头的本地模块
   → 按路径查找文件：
      xxx.js → xxx.json → xxx.node → xxx/index.js

3. 不带路径前缀的第三方模块
   → 从当前目录的 node_modules 开始，逐级向上查找：
      ./node_modules/xxx
      ../node_modules/xxx
      ../../node_modules/xxx
      ...直到根目录
```

### 3.2 模块缓存

**模块只会加载一次**，之后的 `require` 直接返回缓存：

```javascript
// counter.js
let count = 0
module.exports = {
  increment() { count++ },
  getCount() { return count }
}

// main.js
const counter1 = require('./counter')
const counter2 = require('./counter')

// counter1 和 counter2 是同一个对象（缓存）
console.log(counter1 === counter2)  // true

counter1.increment()
console.log(counter2.getCount())  // 1（共享状态！）
```

这个特性很有用：可以用模块来实现单例模式。

```javascript
// 查看模块缓存
console.log(require.cache)

// 清除缓存（强制重新加载）
delete require.cache[require.resolve('./counter')]
const freshCounter = require('./counter')  // 重新加载
```

### 3.3 模块包装器

Node.js 在执行每个模块前，会把代码包裹在一个函数中：

```javascript
// 你写的代码：
const x = 1
module.exports = x

// Node.js 实际执行的是：
(function(exports, require, module, __filename, __dirname) {
  const x = 1
  module.exports = x
})
```

这就是为什么：
- 每个模块有自己的作用域（不污染全局）
- `__filename` 和 `__dirname` 在每个模块中都有值
- `exports`、`require`、`module` 是函数参数，不是全局变量

### 3.4 循环依赖

```javascript
// a.js
console.log('a 开始加载')
const b = require('./b')
console.log('a 中，b.done =', b.done)
exports.done = true

// b.js
console.log('b 开始加载')
const a = require('./a')
console.log('b 中，a.done =', a.done)  // false！a 还没加载完
exports.done = true

// main.js
require('./a')
```

输出：
```
a 开始加载
b 开始加载
b 中，a.done = false   ← a 还没执行完，拿到的是不完整的导出
a 中，b.done = true
```

**结论**：循环依赖不会报错，但可能拿到不完整的模块。最好通过重构代码来避免循环依赖。

---

## 四、ES6 模块化（ESM）

Node.js 12+ 支持 ES6 模块，有两种启用方式：
1. 文件扩展名改为 `.mjs`
2. 在 `package.json` 中设置 `"type": "module"`

### 4.1 导出：export

```javascript
// utils.mjs（或 package.json 中 "type": "module" 时用 .js）

// 命名导出
export const PI = 3.14159
export function add(a, b) { return a + b }
export class Calculator {
  multiply(a, b) { return a * b }
}

// 默认导出（每个模块只能有一个）
export default function greet(name) {
  return `Hello, ${name}!`
}

// 先定义，再统一导出
const subtract = (a, b) => a - b
const multiply = (a, b) => a * b
export { subtract, multiply }

// 导出时重命名
export { subtract as minus }
```

### 4.2 导入：import

```javascript
// main.mjs

// 导入命名导出
import { PI, add, Calculator } from './utils.mjs'

// 导入默认导出
import greet from './utils.mjs'

// 同时导入默认和命名
import greet, { PI, add } from './utils.mjs'

// 导入全部（命名空间导入）
import * as utils from './utils.mjs'
console.log(utils.PI)
console.log(utils.add(1, 2))

// 导入时重命名
import { subtract as minus } from './utils.mjs'

// 动态导入（返回 Promise，可在任意位置使用）
const module = await import('./utils.mjs')
console.log(module.PI)
```

### 4.3 ESM 的特点

```javascript
// 1. import 必须在文件顶部（静态分析）
// ❌ 不能在条件语句中
if (condition) {
  import { add } from './math.mjs'  // 语法错误！
}

// ✅ 动态导入可以在任意位置
if (condition) {
  const { add } = await import('./math.mjs')
}

// 2. ESM 中没有 __dirname 和 __filename
// 需要手动实现
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 3. ESM 默认严格模式（'use strict'）
// 4. ESM 是异步加载，CJS 是同步加载
```

---

## 五、CommonJS vs ES6 模块对比

| 对比项 | CommonJS | ES6 模块（ESM） |
|--------|----------|-----------------|
| 语法 | `require` / `module.exports` | `import` / `export` |
| 加载时机 | 运行时（动态） | 编译时（静态） |
| 加载方式 | 同步 | 异步 |
| 导出值 | 导出的是 `module.exports` 的当前结果，没有 ESM 式 live binding | 值的引用（live binding） |
| `this` 指向 | `module.exports` | `undefined` |
| `__dirname` | 有 | 无（需手动实现） |
| 循环依赖 | 支持（可能不完整） | 支持（更好处理） |
| Tree Shaking | 不支持 | 支持（打包工具可优化） |
| 适用场景 | Node.js 服务端 | 前端 + 现代 Node.js |

### 5.1 导出值的差异（重要！）

```javascript
// counter.cjs（CJS）
let count = 0
module.exports = {
  get count() { return count },
  increment() { count++ }
}

// main.cjs
const counter = require('./counter.cjs')
counter.increment()
console.log(counter.count)  // 1！读取属性时拿到的是当前值

// 但如果你在 require 之后立刻解构，拿到的是“当时的值”
const { count } = require('./counter.cjs')
console.log(count)  // 1
counter.increment()
console.log(count)  // 还是 1，不会像 ESM 那样实时联动

// 想避免歧义时，CJS 最稳妥的做法是导出函数或整个对象

// ESM：导出的是 live binding（实时绑定）
// counter.mjs（ESM）
export let count = 0
export function increment() { count++ }

// main.mjs
import { count, increment } from './counter.mjs'
increment()
console.log(count)  // 1！实时更新
```

---

## 六、在 Node.js 中混用 CJS 和 ESM

```javascript
// ESM 文件中导入 CJS 模块
// 最稳妥的写法是默认导入整个 module.exports
// Node 有时会为 CJS 推断命名导出，但不要把它当成稳定契约
import cjsModule from './legacy.cjs'

// CJS 文件中导入 ESM 模块（需要动态 import）
async function loadESM() {
  const { add } = await import('./utils.mjs')
  console.log(add(1, 2))
}
loadESM()

// 判断当前是 CJS 还是 ESM
// CJS 中：
typeof module !== 'undefined'  // true

// ESM 中：
import.meta.url  // 当前文件的 URL
```

---

## 七、实战：模块化项目结构

```
project/
├── package.json
├── index.js          ← 入口文件
├── utils/
│   ├── math.js       ← 数学工具
│   ├── string.js     ← 字符串工具
│   └── index.js      ← 统一导出（barrel file）
├── config/
│   └── index.js      ← 配置
└── routes/
    ├── users.js
    └── index.js
```

```javascript
// utils/math.js
exports.add = (a, b) => a + b
exports.subtract = (a, b) => a - b
exports.multiply = (a, b) => a * b
exports.divide = (a, b) => {
  if (b === 0) throw new Error('除数不能为 0')
  return a / b
}

// utils/string.js
exports.capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
exports.trim = str => str.trim()
exports.truncate = (str, len) => str.length > len ? str.slice(0, len) + '...' : str

// utils/index.js — barrel file，统一导出
const math = require('./math')
const string = require('./string')

module.exports = { ...math, ...string }

// 使用时只需引入一个路径
const { add, capitalize, truncate } = require('./utils')
```

---

## 八、小结

| 知识点 | 核心要点 |
|--------|----------|
| CommonJS 导出 | `module.exports = xxx` 或 `exports.xxx = xxx` |
| CommonJS 导入 | `const xxx = require('./path')` |
| exports 陷阱 | 不能直接给 `exports` 赋值，要用 `module.exports` |
| 模块缓存 | 同一模块只加载一次，多次 require 返回同一对象 |
| 加载顺序 | 内置模块 → 本地文件（.js/.json/.node/index.js）→ node_modules |
| 模块包装器 | 每个模块被包裹在 `(function(exports, require, module, __filename, __dirname) {})` 中 |
| ESM 导出 | `export const xxx` / `export default xxx` |
| ESM 导入 | `import { xxx } from './path'` |
| CJS vs ESM | CJS 同步/值拷贝，ESM 静态/实时绑定，ESM 支持 Tree Shaking |
| 动态导入 | `const mod = await import('./path')` 在任意位置使用 |

**下一篇**预告：npm 包管理工具全解，从 `install`、`scripts` 到 `semver` 版本规则，以及 nvm 多版本管理。
