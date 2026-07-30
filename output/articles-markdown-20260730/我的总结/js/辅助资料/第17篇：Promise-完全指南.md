---
title: "第17篇：Promise 完全指南"
slug: "js-js-promise-6cb6d394-revision-20260730"
summary: "JavaScript Promise 完整指南，从基础概念到实战应用，包含 async/await 语法糖和常见陷阱。"
category: "辅助资料"
tags:
  - "JavaScript"
  - "Promise"
  - "异步编程"
  - "async/await"
status: "draft"
sortOrder: 120
cover: ""
originalId: "6a2d291f8a2b1c68f2cac40c"
originalSlug: "js-js-promise-6cb6d394"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 第17篇：Promise 完全指南

## 1. Promise 概述
### 1.1 诞生背景
+ 前端异步操作（AJAX、定时器、文件读取）传统依赖**回调函数**，多层嵌套形成「回调地狱」：
    - 代码嵌套深、可读性差、维护成本高；
    - 错误处理分散，每个回调需单独处理；
    - 无法灵活控制多个异步操作的执行顺序/结果。
+ Promise 是 ES6 新增语法，核心目标：**解决回调地狱**，为异步操作提供优雅的编程范式。

**先理解 "回调地狱" 是什么**

在 Promise 出现前，前端处理异步（比如先请求 A 接口，再用 A 的结果请求 B 接口，再用 B 的结果请求 C 接口）只能嵌套回调函数，代码会变成这样：

```javascript
// 回调地狱的典型样子：多层嵌套、逻辑混乱
ajax('请求A', (aResult) => {
  ajax('请求B?data=' + aResult, (bResult) => {
    ajax('请求C?data=' + bResult, (cResult) => {
      // 业务逻辑
    }, (bErr) => { /* 处理B的错误 */ });
  }, (aErr) => { /* 处理A的错误 */ });
}, (err) => { /* 处理最外层错误 */ });
```

这种代码的问题：

+ 嵌套层级越深，代码越像 "金字塔"，可读性极差；
+ 错误处理分散在每一层回调里，容易遗漏；
+ 想调整异步操作的顺序（比如先 B 后 A），需要大幅修改代码结构。

### 1.2 核心定位
Promise 是一个**对象**，代表异步操作的「最终结果」—— 要么成功返回值，要么失败返回原因，是前端异步编程的基础（async/await、axios 等工具均基于 Promise 实现）。

---

## 2. Promise 核心基础
### 2.1 三个核心状态（不可逆）
Promise 状态一旦改变，永久固定，无法修改：

| 状态 | 说明 | 触发条件 |
| --- | --- | --- |
| pending（待定） | 初始状态，异步操作未完成 | 创建 Promise 实例时 |
| fulfilled（成功） | 异步操作成功 | 调用 `resolve()` 方法 |
| rejected（失败） | 异步操作失败 | 调用 `reject()` 方法/代码报错 |


### 2.2 基本语法（创建 Promise）
```javascript
// 语法：new Promise(executor函数)
// executor 接收两个参数：resolve（成功回调）、reject（失败回调）
const promise = new Promise((resolve, reject) => {
  // 封装异步操作
  setTimeout(() => {
    const isSuccess = true; // 模拟异步操作结果
    if (isSuccess) {
      resolve("成功结果"); // 状态：pending → fulfilled，传递成功值
    } else {
      reject(new Error("失败原因")); // 状态：pending → rejected，传递错误
    }
  }, 1000);
});
```

+ 关键：executor 函数**创建后立即执行**，无法取消；
+ resolve/reject 仅改变状态，不会终止 executor 函数（如需终止，需加 `return`）。

---

## 3. Promise 实例方法（消费 Promise）
实例方法均返回**新的 Promise**，支持链式调用，是处理异步结果的核心。

### 3.1 then()：处理成功/失败回调
```javascript
// 语法：promise.then(onFulfilled, onRejected)
promise
  .then(
    (res) => { console.log("成功：", res); }, // 状态fulfilled时执行
    (err) => { console.log("失败：", err); }  // 状态rejected时执行（可选）
  )
  .then((res) => {
    // 接收上一个then的返回值，支持链式调用
    return "新的结果"; 
  });
```

+ 核心：链式调用扁平化异步逻辑，替代回调嵌套；
+ 注意：then 中抛出错误，会被后续的 catch 捕获。

### 3.2 catch()：专门处理失败回调
```javascript
// 语法：promise.catch(onRejected)
// 等价于 promise.then(null, onRejected)
promise
  .then((res) => { console.log("成功：", res); })
  .catch((err) => { 
    console.log("捕获错误：", err.message); // 捕获失败/then中的错误
  });
```

+ 推荐用法：用 then 处理成功，catch 统一处理所有错误（更清晰）。

### 3.3 finally()：最终执行逻辑
```javascript
// 语法：promise.finally(onFinally)
promise
  .then((res) => { console.log("成功：", res); })
  .catch((err) => { console.log("失败：", err); })
  .finally(() => {
    console.log("无论成功/失败都执行"); // 如关闭加载动画、清理资源
  });
```

+ 特性：ES2018 新增，无参数，无论状态如何必执行；
+ 坑点：finally 中的 return 会覆盖 try/catch/then 的返回值，尽量避免在 finally 中 return。

---

## 4. Promise 静态方法（处理多个异步操作）
### 4.1 快速创建 Promise：resolve()/reject()
```javascript
// 快速创建成功的 Promise
const p1 = Promise.resolve("成功值"); 
p1.then(res => console.log(res)); // 输出：成功值

// 快速创建失败的 Promise
const p2 = Promise.reject(new Error("失败值"));
p2.catch(err => console.log(err.message)); // 输出：失败值
```

### 4.2 Promise.all()：等待所有 Promise 成功
```javascript
// 语法：Promise.all([p1, p2, p3])
const p1 = Promise.resolve("接口1结果");
const p2 = Promise.resolve("接口2结果");

Promise.all([p1, p2])
  .then(res => console.log(res)) // 输出：["接口1结果", "接口2结果"]（顺序与原数组一致）
  .catch(err => console.log(err)); // 任一失败，立即返回该失败原因
```

+ 使用场景：需等待多个异步操作全部完成（如表单提交前验证多个接口）；
+ 注意：只要有一个 Promise 失败，all 立即终止，返回失败结果。

### 4.3 Promise.race()：取第一个完成的 Promise 结果
```javascript
// 语法：Promise.race([p1, p2])
// 场景：异步操作超时控制（5秒未返回则提示超时）
const request = new Promise((resolve) => setTimeout(() => resolve("请求成功"), 6000));
const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("超时")), 5000));

Promise.race([request, timeout])
  .catch(err => console.log(err.message)); // 输出：超时
```

+ 特性：无论成功/失败，取第一个完成的 Promise 结果。

### 4.4 Promise.allSettled()：等待所有 Promise 完成（ES2020）
```javascript
// 语法：Promise.allSettled([p1, p2])
const p1 = Promise.resolve("成功1");
const p2 = Promise.reject("失败2");

Promise.allSettled([p1, p2])
  .then(res => console.log(res));
// 输出：
// [
//   { status: 'fulfilled', value: '成功1' },
//   { status: 'rejected', reason: '失败2' }
// ]
```

+ 使用场景：需知道所有异步操作的最终状态（如批量提交，统计成功/失败数量）。

### 4.5 Promise.any()：取第一个成功的 Promise 结果（ES2021）
```javascript
// 语法：Promise.any([p1, p2])
const p1 = Promise.reject("失败1");
const p2 = Promise.resolve("成功2");

Promise.any([p1, p2])
  .then(res => console.log(res)) // 输出：成功2
  .catch(err => console.log(err.errors)); // 所有失败时，返回AggregateError
```

+ 使用场景：多源请求（如同时请求多个CDN，取第一个成功的）。

---

## 5. 进阶：async/await（Promise 语法糖）
### 5.1 核心定义
async/await 是 ES2017 新增语法，**底层完全依赖 Promise 实现**，仅简化写法（语法糖），让异步代码更像同步代码。

### 5.2 async：标记函数为异步
+ 被 async 修饰的函数，执行后**必然返回 Promise**：
    - return 普通值 → 自动包装为 `Promise.resolve(值)`；
    - throw 错误 → 自动包装为 `Promise.reject(错误)`。

```javascript
async function fn() {
  return 123; // 等价于 Promise.resolve(123)
}
console.log(fn()); // Promise {<fulfilled>: 123}
```

### 5.3 await：等待 Promise 完成
+ 只能用在 async 函数内部；
+ 作用：暂停 async 函数执行，等待 Promise 状态变更：
    - 成功：返回 Promise 的成功结果，恢复函数执行；
    - 失败：抛出错误，需用 try/catch 捕获。

### 5.4 Promise 链式调用 vs async/await（对比）
```javascript
// 封装异步请求（底层Promise）
function requestUser() { return Promise.resolve({ id: 1, name: "张三" }); }
function requestOrder(userId) { return Promise.resolve({ orderId: 1001, userId }); }

// 写法1：Promise 链式调用
requestUser()
  .then(user => requestOrder(user.id))
  .then(order => console.log(order))
  .catch(err => console.log(err));

// 写法2：async/await（语法糖）
async function getOrder() {
  try {
    const user = await requestUser(); // 同步写法的感觉
    const order = await requestOrder(user.id);
    console.log(order);
  } catch (err) {
    console.log(err); // 统一捕获错误
  }
}
getOrder();
```

### 5.5 异步操作并行优化
+ 错误写法（串行，总耗时=1s+1s=2s）：

```javascript
async function badFn() {
  const res1 = await requestUser(); // 等1s
  const res2 = await requestOrder(1); // 再等1s
}
```

+ 正确写法（并行，总耗时≈1s）：

```javascript
async function goodFn() {
  const p1 = requestUser(); // 先启动所有请求
  const p2 = requestOrder(1);
  const res1 = await p1; // 再等待结果
  const res2 = await p2;
}
```

### 5.6 常见困惑：async 函数明明返回 Promise，为什么打印出来是普通值？

很多人刚用 `async/await` 时都会疑惑：**"不是说 async 函数返回 Promise 吗？为什么我打印出来是实际的值？"**

关键在于：**你打印的是 `await` 之后的结果，而不是 async 函数本身的返回值**。

```javascript
async function getNumber() {
  return 42
}

// 不加 await：得到的是 Promise 对象
const result = getNumber()
console.log(result)        // Promise {<fulfilled>: 42}

// 加 await：Promise 被"解开"，拿到里面的值
const realValue = await getNumber()
console.log(realValue)     // 42
```

**一张表帮你记住：**

| 写法 | 得到的类型 | 打印结果 |
| --- | --- | --- |
| `const x = asyncFunc()` | Promise 对象 | `Promise { <fulfilled>: ... }` |
| `const x = await asyncFunc()` | 普通值（Promise 里装的值） | 具体的数字 / 对象 / 字符串等 |

**封装请求时的典型场景：**

```javascript
async function fetchUser() {
  const response = await axios.get('/user')
  return response.data   // return 的是普通对象
}

// 调用时也加了 await，所以 data 是普通对象，不是 Promise
const data = await fetchUser()
console.log(data)   // { name: '张三' }

// 如果不加 await，立刻就能看到 Promise
const promiseObj = fetchUser()
console.log(promiseObj)   // Promise {<pending>}
```

**一句话总结**：async 函数永远返回 Promise（制造礼物盒）；await 负责拆开礼物盒取出里面的值。你打印的是拆开后的礼物，所以是普通值；别人说"返回 Promise"，是指没拆开的礼物盒。

---

## 6. Promise 错误处理（结合 try/catch）
### 6.1 核心原则
+ Promise 失败/then 中报错 → 可通过 catch() 捕获；
+ async/await 中 Promise 失败 → 会抛出错误，需用 try/catch 捕获；
+ try/catch 只能捕获**同步代码**和 `await` 中的异步错误，无法直接捕获普通异步回调的错误。

### 6.2 不同场景的错误处理
#### 场景1：普通 Promise 错误处理（catch()）
```javascript
new Promise((_, reject) => reject(new Error("失败")))
  .catch(err => console.log(err.message)); // 输出：失败
```

#### 场景2：async/await 错误处理（try/catch）
```javascript
async function fn() {
  try {
    await Promise.reject(new Error("请求失败"));
  } catch (err) {
    console.log("捕获错误：", err.message); // 输出：请求失败
  }
}
```

#### 场景3：多个并行异步操作（单独捕获）
```javascript
async function multiRequest() {
  // 先启动请求，单独捕获每个错误
  const p1 = requestUser().catch(err => ({ err: "用户请求失败" }));
  const p2 = requestOrder(1).catch(err => ({ err: "订单请求失败" }));
  
  // 等待所有结果（即使部分失败）
  const res1 = await p1;
  const res2 = await p2;
}
```

#### 场景4：普通异步回调（内部加 try/catch）
```javascript
// 坑：外层 try/catch 无法捕获 setTimeout 回调的错误
try {
  setTimeout(() => {
    try { // 正确：回调内部加 try/catch
      console.log(undeclaredVar);
    } catch (err) {
      console.log(err.message);
    }
  }, 1000);
} catch (err) {
  // 不会执行！
}
```

---

## 7. 实战场景
### 7.1 解决回调地狱
```javascript
// 传统回调地狱（多层嵌套）
ajax("url1", (res1) => {
  ajax("url2?data=" + res1, (res2) => {
    ajax("url3?data=" + res2, (res3) => {
      console.log(res3);
    });
  });
});

// Promise 改写（扁平化）
function request(url) {
  return new Promise((resolve) => ajax(url, resolve));
}
request("url1")
  .then(res1 => request("url2?data=" + res1))
  .then(res2 => request("url3?data=" + res2))
  .then(res3 => console.log(res3))
  .catch(err => console.log(err));

// async/await 改写（更简洁）
async function fetchAll() {
  try {
    const res1 = await request("url1");
    const res2 = await request("url2?data=" + res1);
    const res3 = await request("url3?data=" + res2);
    console.log(res3);
  } catch (err) {
    console.log(err);
  }
}
```

### 7.2 批量请求并统计结果
```javascript
async function batchRequest() {
  const requests = [
    Promise.resolve("成功1"),
    Promise.reject("失败1"),
    Promise.resolve("成功2")
  ];
  
  const results = await Promise.allSettled(requests);
  // 统计成功/失败数量
  const successCount = results.filter(item => item.status === "fulfilled").length;
  const failCount = results.filter(item => item.status === "rejected").length;
  console.log(`成功：${successCount}，失败：${failCount}`);
}
```

---

## 8. 常见坑点与避坑指南
| 坑点 | 避坑方法 |
| --- | --- |
| Promise 执行器函数立即执行 | 如需延迟执行，将 Promise 封装在函数中，调用函数时才创建实例 |
| try/catch 无法捕获异步回调错误 | 1. 回调内部加 try/catch；2. 改用 async/await 写法 |
| await 串行执行无依赖的异步操作 | 先启动所有 Promise，再 await 结果（并行执行） |
| finally 覆盖返回值 | 避免在 finally 中使用 return |
| Promise.all 一个失败全部失败 | 如需保留所有结果，改用 Promise.allSettled，或给每个 Promise 单独加 catch() |
| 未捕获的 Promise 错误 | 所有 Promise 必须加 catch()，async/await 必须加 try/catch |


---

## 9. 核心总结
1. Promise 是异步操作的封装对象，核心特性是**状态不可逆**（pending→fulfilled/rejected），通过 then/catch 链式调用解决回调地狱；
2. 静态方法适配多异步场景：all（全成功）、race（第一个完成）、allSettled（全完成）、any（任一成功）；
3. async/await 是 Promise 的语法糖：async 让函数返回 Promise，await 等待 Promise 结果，错误用 try/catch 捕获；
4. 错误处理核心：Promise 用 catch()，async/await 用 try/catch，普通异步回调需内部加 try/catch；
5. 性能优化：无依赖的异步操作优先并行执行（先创建 Promise 实例，再 await）。

**关键提醒**：Promise 是前端异步编程的基石，掌握它是理解 axios、async/await、Vue/React 异步逻辑的前提，需结合实战多练！
