---
title: "第 01 篇：JavaScript 变量与作用域详解：var、let、const、作用域链"
slug: "js-js-javascript-4f1a5c58"
summary: "JavaScript变量声明方式（var/let/const）的核心特性、作用域规则、提升机制及最佳实践。"
category: "辅助资料"
categoryPath:
  - "我的总结"
  - "js"
  - "辅助资料"
tags:
  - "JavaScript"
  - "变量"
  - "作用域"
  - "var"
  - "let"
  - "const"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291f8a2b1c68f2cac38c"
originalSlug: "js-js-javascript-4f1a5c58"
originalStatus: "published"
publishedAt: "2026-05-07T13:25:33.654Z"
updatedAt: "2026-07-31T11:16:24.356Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 01 篇：JavaScript 变量与作用域详解：var、let、const、作用域链
## 一、变量声明方式核心特性

### 1. var（ES5）

+ **作用域**：函数作用域或全局作用域
+ **提升机制**：声明提升到作用域顶部，赋值为 `undefined`
+ **重复声明**：允许在同一作用域重复声明
+ **循环问题**：循环变量共享同一个绑定
+ **访问特点**：声明前访问返回 `undefined`

### 2. let（ES6+）

+ **作用域**：块级作用域（`{}` 内有效）
+ **提升机制**：有提升但存在暂时性死区（TDZ）
+ **重复声明**：不允许在同一作用域重复声明
+ **循环优势**：每次迭代创建独立绑定
+ **访问特点**：声明前访问抛出 `ReferenceError`

### 3. const（ES6+）

+ **不变性**：声明时必须初始化，不能重新赋值
+ **对象特性**：对象属性可修改（引用不变）
+ **其他特性**：与 `let` 相同的作用域和TDZ规则
+ **循环使用**：适用于 `for...of`、`for...in` 循环

---

## 二、作用域层级体系

### 作用域结构

```plain
全局作用域（Global Scope）
    ├── 函数作用域（Function Scope）- var的作用域
    │    ├── 块级作用域（Block Scope）- let/const的作用域
    │    │    ├── if 语句块
    │    │    ├── for/while 循环块
    │    │    └── {} 任意代码块
    │    └── 嵌套函数作用域
    └── 其他块级作用域
```

### 作用域对比示例

```javascript
// 全局作用域
var globalVar = "global";

function example() {
  // 函数作用域
  var functionVar = "function";

  if (true) {
    // 块级作用域
    let blockVar = "block";
    console.log(globalVar);    // "global" - 可访问
    console.log(functionVar);  // "function" - 可访问
    console.log(blockVar);     // "block" - 可访问
  }

  console.log(globalVar);        // "global" - 可访问
  console.log(functionVar);      // "function" - 可访问
  // console.log(blockVar);      // ReferenceError - 不可访问
}
```

---

## 三、变量提升与暂时性死区

### 1. 变量提升机制

```javascript
// var 的提升
console.log(a); // undefined（提升并初始化为undefined）
var a = 10;

// 实际执行顺序：
// var a;
// console.log(a); // undefined
// a = 10;

// let/const 的提升（有TDZ）
// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;
```

### 2. 暂时性死区（TDZ）

+ **概念**：从作用域开始到变量声明之间的区域
+ **表现**：变量存在但不可访问
+ **目的**：避免在声明前意外使用变量

```javascript
function tdzExample() {
  // TDZ开始
  // console.log(value); // ReferenceError

  let value = "initialized"; // TDZ结束
  console.log(value); // "initialized"
}
```

---

## 四、循环中的变量作用域

### 1. 经典循环问题对比

```javascript
// ===== var 的问题：共享绑定 =====
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log('var:', i); // 输出: 3, 3, 3
  }, 100);
}
// 相当于：
// var i;
// for (i = 0; i < 3; i++) { ... }

// ===== let 的解决方案：独立绑定 =====
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log('let:', i); // 输出: 0, 1, 2
  }, 100);
}
// 相当于：
// { let i = 0; ... }
// { let i = 1; ... }
// { let i = 2; ... }
```

### 2. 核心原理（一句话版）

| 关键字 | 循环中的行为 | 定时器输出 |
|--------|--------------|------------|
| `var` | 只有一个 i，所有定时器共用 | 3, 3, 3 |
| `let` | 每轮创建独立的新 i | 0, 1, 2 |

### 3. 详细解析

#### var 为什么输出 3, 3, 3？

1. `var` 是**函数级作用域**，没有块级作用域
2. 整个循环**只声明一次 i**，所有 `setTimeout` 引用同一个变量
3. 定时器是异步的，**100ms 后执行时循环已结束**，i 已变成 3
4. 所以三个定时器打印的都是**最终值 3**

#### let 为什么输出 0, 1, 2？

1. `let` 是**块级作用域**
2. ES6 规定：**for 循环里用 let，每轮创建一个独立的新变量**
3. 第一轮 i=0，第二轮 i=1，第三轮 i=2，互不干扰
4. 每个定时器绑定的是**当前轮自己的 i**，所以输出正确

### 4. 底层等效代码

```javascript
// var 的等效写法（共享一个 i）
var i;                    // 声明提升到循环外
for (i = 0; i < 3; i++) {
  setTimeout(() => console.log('var:', i), 100);
}

// let 的等效写法（每轮独立的 i）
{ let i = 0; setTimeout(() => console.log('let:', i), 100); }
{ let i = 1; setTimeout(() => console.log('let:', i), 100); }
{ let i = 2; setTimeout(() => console.log('let:', i), 100); }
```

### 5. 总结

+ **var**：共享一个变量 → 输出最终值
+ **let**：每轮独立变量 → 输出当前值

### 6. 循环作用域原理

```javascript
// let 循环的底层实现（概念模型）
for (let i = 0; i < 3; i++) {
  // 每次迭代都创建新的作用域
  console.log(i);
}
// 等价于：
{
  let i = 0;
  console.log(i);
}
{
  let i = 1;
  console.log(i);
}
{
  let i = 2;
  console.log(i);
}
```

### 7. 事件处理中的循环变量

```javascript
// 错误：使用 var
for (var i = 0; i < 3; i++) {
  button.addEventListener('click', () => {
    console.log(i); // 总是输出 3
  });
}

// 正确：使用 let
for (let i = 0; i < 3; i++) {
  button.addEventListener('click', () => {
    console.log(i); // 输出 0, 1, 2
  });
}
```

---

## 五、函数提升机制

### 1. 函数声明 - 完全提升

```javascript
// 函数声明提升
sayHello(); // "Hello!" - 函数完全提升

function sayHello() {
  console.log("Hello!");
}
```

### 2. 函数表达式 - 仅变量提升

```javascript
// 函数表达式
// sayHi(); // TypeError: sayHi is not a function

var sayHi = function() {
  console.log("Hi!");
};

// 相当于：
// var sayHi;
// sayHi(); // TypeError
// sayHi = function() { ... };
```

### 3. 箭头函数 - 同函数表达式规则

```javascript
// console.log(greet()); // ReferenceError
const greet = () => "Hello";

// var 声明箭头函数
// console.log(greet2()); // TypeError
var greet2 = () => "Hi";
```

---

## 六、const 的特殊性

### 1. 基本类型 vs 引用类型

```javascript
// 基本类型 - 完全不可变
const PI = 3.14159;
// PI = 3.14; // TypeError

// 引用类型 - 引用不变，内容可变
const person = { name: "Alice" };
person.name = "Bob";      // 允许：修改属性
person.age = 25;          // 允许：添加属性
// person = { name: "Charlie" }; // TypeError：不能重新赋值
```

### 2. const 在循环中的应用

```javascript
// for 循环不能用 const（需要修改循环变量）
// for (const i = 0; i < 3; i++) { } // TypeError

// for...of 循环可以使用 const
const numbers = [1, 2, 3];
for (const num of numbers) {
  console.log(num); // 每次迭代都是新的常量
}

// for...in 循环也可以使用 const
const obj = { a: 1, b: 2 };
for (const key in obj) {
  console.log(key); // 每次迭代都是新的常量
}
```

---

## 七、实践应用与最佳实践

### 1. 现代开发建议

```javascript
// 1. 优先使用 const
const API_URL = "https://api.example.com";
const config = { theme: "dark" };

// 2. 需要重新赋值时使用 let
let counter = 0;
for (let i = 0; i < 10; i++) {
  counter += i;
}

// 3. 避免使用 var
// var oldVariable = "avoid"; // 不推荐

// 4. 声明顺序：常量 → 变量 → 函数
const DEFAULT_SETTINGS = {};
let currentUser = null;

function initialize() {
  // 初始化逻辑
}
```

### 2. 循环优化模式

```javascript
// 推荐：使用 let 处理异步循环
async function processItems(items) {
  for (let i = 0; i < items.length; i++) {
    const result = await fetchItem(items[i]);
    console.log(`Item ${i}:`, result);
  }
}

// 推荐：for...of 循环
for (const item of items) {
  processItem(item);
}

// 需要索引时使用 entries()
for (const [index, item] of items.entries()) {
  console.log(index, item);
}
```

### 3. 作用域管理技巧

```javascript
// 使用块级作用域隔离变量
{
  const tempData = processData();
  // 仅在此块内使用 tempData
  console.log(tempData);
}
// tempData 在此不可访问

// IIFE 模拟块级作用域（ES5）
(function() {
  var privateVar = "secret";
  // 私有作用域
})();
```

---

## 八、兼容性与降级方案

### 1. ES5 中模拟块级作用域

```javascript
// 使用 IIFE 模拟 let 的作用域
for (var i = 0; i < 3; i++) {
  (function(index) {
    setTimeout(function() {
      console.log(index); // 0, 1, 2
    }, 100);
  })(i);
}
```

### 2. Polyfill 策略

```javascript
// 使用严格模式避免意外全局变量
"use strict";

// 检查环境支持
if (typeof let === "undefined") {
  // 降级方案
  console.log("使用 var 模拟或引入 polyfill");
}
```

---

## 九、总结表格

| 特性 | var | let | const |
| --- | --- | --- | --- |
| **作用域** | 函数/全局作用域 | 块级作用域 | 块级作用域 |
| **提升** | 是（初始化为undefined） | 是（有TDZ） | 是（有TDZ） |
| **重复声明** | ✅ 允许 | ❌ 不允许 | ❌ 不允许 |
| **重新赋值** | ✅ 允许 | ✅ 允许 | ❌ 不允许* |
| **循环绑定** | 共享 | 独立 | 独立** |
| **TDZ** | 无 | 有 | 有 |
| **声明要求** | 可后初始化 | 可后初始化 | 必须立即初始化 |

> *const 对象属性可修改  
> **适用于 for...of/for...in 循环

---

## 十、核心记忆要点

1. **作用域规则**：var 看函数，let/const 看花括号
2. **提升差异**：var 提升可访问，let/const 提升不可访问（TDZ）
3. **循环关键**：var 共享，let 独立
4. **const 本质**：绑定不变，内容可改（对象）
5. **函数提升**：声明完全提升，表达式只提升变量
6. **最佳实践**：const > let > var

---

## 十一、常见面试问题解答

### Q1：let 和 const 有变量提升吗？

**A**：有，但存在暂时性死区，在声明前访问会报错，与 var 返回 undefined 不同。

### Q2：为什么 for 循环中使用 let 能解决闭包问题？

**A**：let 在每次循环迭代中创建新的块级作用域，每个闭包捕获的是各自迭代中的变量值。

### Q3：const 声明的对象为什么可以修改？

**A**：const 保证的是变量绑定不变（引用不变），而不是对象内容不变。对象存储在堆中，修改属性不会改变引用。

### Q4：如何选择 let 和 const？

**A**：优先使用 const，只有当变量需要重新赋值时才使用 let，避免使用 var。

---

## 十二、var 声明的全局变量会挂载到 window，let / const 不会

### 核心原因（必答点）

+ `var` 是**函数作用域**，在全局声明时会同时成为 **全局对象的属性**；
+ `let / const` 是 **ES6 新增的块级作用域**，全局变量被绑定到一个**独立的全局词法环境**，与 `window` 解耦。

### 设计意义（加分点）

+ 避免污染 `window`，防止覆盖原生属性（如 `alert`）；
+ 让全局变量更安全、更可控，是 ES6 对旧设计的改进。

### 补充易考点

+ **未声明直接赋值**（`a = 1`）仍会挂载到 `window`，这是隐式全局变量，不推荐。

### 面试 3 句话标准口述版

1. **var 声明的全局变量会挂载到 window，而 let / const 不会。**
2. **原因是 var 属于函数作用域，全局声明时会绑定到全局对象；而 let / const 是 ES6 的块级作用域设计，全局变量存放在独立的词法环境中，与 window 解耦。**
3. **这样可以避免全局变量污染 window，是 ES6 对作用域模型的重要改进。**
