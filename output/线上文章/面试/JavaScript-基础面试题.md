---
title: "JavaScript 基础面试题"
slug: "js-8a2a9c20"
summary: "JavaScript 基础面试题，包括数据类型、作用域、事件循环、类型转换、原型链、闭包、Promise 和 ES 新特性等核心概念。"
category: "面试"
categoryPath:
  - "面试"
tags:
  - "JavaScript"
  - "数据类型"
  - "作用域"
  - "异步"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291f8a2b1c68f2cac678"
originalSlug: "js-8a2a9c20"
originalStatus: "published"
publishedAt: "2026-05-12T14:26:37.718Z"
updatedAt: "2026-06-21T12:22:56.222Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# JavaScript 基础

## 1、JavaScript 数据类型有哪些

JavaScript 的数据类型可以分为两类：**原始类型**和**引用类型**。

原始类型有 7 种：

+ `string`
+ `number`
+ `boolean`
+ `undefined`
+ `null`
+ `symbol`
+ `bigint`

引用类型主要是 `object`。数组、函数、日期、正则、普通对象等，本质上都属于对象类型。

面试回答时可以这样说：

> 原始类型保存的是值本身，引用类型保存的是对象的引用。常见说法会提到“基本类型在栈中、引用类型在堆中”，但这属于 JS 引擎实现层面的理解，不应说成规范强制要求。

## 2、typeof 的判断结果

`typeof` 常用于判断基础类型，但它也有一些特殊情况。

```javascript
typeof 'abc' // 'string'
typeof 123 // 'number'
typeof true // 'boolean'
typeof undefined // 'undefined'
typeof Symbol('id') // 'symbol'
typeof 10n // 'bigint'
typeof {} // 'object'
typeof [] // 'object'
typeof null // 'object'
typeof function () {} // 'function'
```

需要注意：

+ `typeof null` 返回 `'object'` 是历史遗留问题，`null` 本身不是对象。
+ `typeof []` 返回 `'object'`，所以不能用 `typeof` 精确判断数组。
+ 函数本质上也是对象，但 `typeof function () {}` 会返回 `'function'`。

## 3、数据类型判断方法

JavaScript 中常见的数据类型判断方式如下：

+ **typeof**：适合判断原始类型和函数，不适合区分数组、对象、`null`。
+ **instanceof**：判断对象是否出现在某个构造函数的原型链上，例如 `arr instanceof Array`。
+ **Object.prototype.toString.call()**：判断类型最稳定，能区分数组、日期、正则、`null` 等。
+ **Array.isArray()**：专门判断数组，推荐使用。
+ **constructor**：可以判断构造函数，但容易被手动修改，不够可靠。
+ **===**：常用于判断某个固定值，例如 `value === null`、`value === undefined`。

示例：

```javascript
Object.prototype.toString.call([]) // '[object Array]'
Object.prototype.toString.call(null) // '[object Null]'
Object.prototype.toString.call(new Date()) // '[object Date]'
Array.isArray([]) // true
```

## 4、如何判断是否是数组

常见方式：

+ `Array.isArray(arr)`：最推荐。
+ `Object.prototype.toString.call(arr) === '[object Array]'`：兼容性和准确性都很好。
+ `arr instanceof Array`：简单，但跨 iframe 时可能失效。
+ `arr.constructor === Array`：不推荐作为核心判断，因为 `constructor` 可以被改写。

推荐答案：

```javascript
function isArray(value) {
  return Array.isArray(value)
}
```

## 5、undefined 和 null 的区别

`undefined` 表示“未定义”，常见场景有：

+ 变量声明后没有赋值。
+ 对象上不存在某个属性。
+ 函数没有显式返回值。
+ 函数参数没有传。

`null` 表示“空值”，通常是开发者主动赋值，用来表达“这里暂时没有对象”。

```javascript
let name
console.log(name) // undefined

const user = null
console.log(user) // null
```

面试重点：

+ `undefined == null` 结果是 `true`。
+ `undefined === null` 结果是 `false`。
+ `typeof null` 返回 `'object'`，这是历史遗留问题。
+ 实际开发中不要简单说“避免使用 null”，更好的说法是按语义选择。

## 6、为什么 typeof null 是 object

这是 JavaScript 早期实现遗留的问题。

早期 JS 使用类型标签区分数据类型，对象的类型标签和 `null` 的内部表示产生了冲突，导致 `typeof null` 返回 `'object'`。后来为了兼容已有代码，这个行为被保留了下来。

正确理解：

```javascript
typeof null // 'object'
null instanceof Object // false
```

所以 `null` 是原始值，不是对象。

## 7、== 和 === 的区别

+ `==`：只比较值是否相等，比较前可能发生隐式类型转换。
+ `===`：比较值和类型，不会做隐式类型转换。

示例：

```javascript
5 == '5' // true
5 === '5' // false
null == undefined // true
null === undefined // false
```

开发中推荐优先使用 `===`，因为它更可预测。

## 8、常见隐式类型转换

`==`、字符串拼接、算术运算、条件判断都可能触发隐式类型转换。

```javascript
'1' + 2 // '12'
'1' - 2 // -1
true + 1 // 2
false + 1 // 1
[] == false // true
```

面试重点：

+ `+` 只要遇到字符串，容易变成字符串拼接。
+ `-`、`*`、`/` 会尽量把值转成数字。
+ 对象参与运算时，会先尝试转成原始值。

## 9、布尔值为 false 的情况

以下 8 个值转成布尔值是 `false`：

+ `false`
+ `0`
+ `-0`
+ `0n`
+ `''`
+ `null`
+ `undefined`
+ `NaN`

其他值基本都是真值，包括：

```javascript
Boolean([]) // true
Boolean({}) // true
Boolean('false') // true
Boolean('0') // true
```

## 10、this 指向

`this` 的值取决于函数的调用方式。

+ 普通函数直接调用：非严格模式下指向全局对象，严格模式下是 `undefined`。
+ 对象方法调用：指向调用该方法的对象。
+ 构造函数配合 `new` 调用：指向新创建的实例对象。
+ DOM 事件普通函数回调：通常指向绑定事件的元素。
+ `call`、`apply`、`bind`：可以显式改变 `this`。
+ 箭头函数：没有自己的 `this`，会捕获外层作用域的 `this`。

示例：

```javascript
const user = {
  name: '小明',
  say() {
    console.log(this.name)
  }
}

user.say() // '小明'
```

箭头函数的重点：

```javascript
const user = {
  name: '小明',
  say: () => {
    console.log(this.name)
  }
}

user.say() // 通常不是 '小明'
```

对象字面量本身不会创建作用域，所以这里箭头函数不会把 `this` 指向 `user`。

## 11、call、apply、bind 的区别

共同点：

+ 都可以改变函数执行时的 `this`。
+ 第一个参数都是要绑定的 `this`。

区别：

+ `call`：立即执行，参数逐个传入。
+ `apply`：立即执行，参数用数组传入。
+ `bind`：不会立即执行，而是返回一个绑定好 `this` 的新函数。

```javascript
function add(a, b) {
  return a + b
}

add.call(null, 1, 2) // 3
add.apply(null, [1, 2]) // 3

const fn = add.bind(null, 1, 2)
fn() // 3
```

## 12、new 做了什么

使用 `new` 调用构造函数时，大致会做 4 件事：

1. 创建一个新的空对象。
2. 将新对象的原型指向构造函数的 `prototype`。
3. 将构造函数内部的 `this` 指向新对象，并执行构造函数。
4. 如果构造函数显式返回对象，则返回这个对象；否则返回新创建的对象。

示例：

```javascript
function Person(name) {
  this.name = name
}

const p = new Person('小明')
console.log(p.name) // '小明'
```

## 13、arguments 的特点

`arguments` 是普通函数内部可用的类数组对象。

+ 只存在于普通函数中，箭头函数没有自己的 `arguments`。
+ 可以通过下标访问参数。
+ 有 `length` 属性。
+ 不是数组，不能直接调用数组方法。
+ 可以用 `Array.from(arguments)` 或剩余参数替代。

```javascript
function fn() {
  const args = Array.from(arguments)
  console.log(args)
}

fn(1, 2, 3) // [1, 2, 3]
```

更推荐使用剩余参数：

```javascript
function fn(...args) {
  console.log(args)
}
```

## 14、continue、break、return 的区别

+ `continue`：结束本次循环，继续下一次循环。
+ `break`：跳出最近一层循环或 `switch`。
+ `return`：结束当前函数，并返回指定结果。如果写在循环里，会因为函数结束而终止循环。

```javascript
function findFirstEven(list) {
  for (const item of list) {
    if (item % 2 === 0) {
      return item
    }
  }

  return null
}
```

## 15、常见数组方法

会修改原数组的方法：

+ `push()`：末尾添加元素，返回新长度。
+ `pop()`：删除最后一个元素，返回被删除的元素。
+ `shift()`：删除第一个元素，返回被删除的元素。
+ `unshift()`：开头添加元素，返回新长度。
+ `splice()`：删除、替换或添加元素。
+ `reverse()`：反转数组。
+ `sort()`：排序数组。

不会修改原数组的方法：

+ `map()`：映射成新数组。
+ `filter()`：过滤出新数组。
+ `reduce()`：累计计算结果。
+ `forEach()`：遍历执行回调，返回 `undefined`。
+ `concat()`：合并数组，返回新数组。
+ `slice()`：截取数组，返回新数组。
+ `join()`：将数组连接成字符串。
+ `find()`：返回第一个符合条件的元素。
+ `some()`：判断是否至少有一个元素符合条件。
+ `every()`：判断是否所有元素都符合条件。

`split()` 是字符串方法，不是数组方法。

## 16、map() 和 forEach() 的区别

+ `map()` 有返回值，会返回一个与原数组长度一致的新数组。
+ `forEach()` 默认返回 `undefined`，主要用于遍历和执行副作用。
+ `map()` 更适合“把 A 数组转换成 B 数组”。
+ `forEach()` 更适合“遍历时执行操作”，例如打印、提交、修改外部状态。
+ 不建议笼统说 `map` 一定比 `forEach` 快，性能和 JS 引擎、数据量、写法有关。

```javascript
const list = [1, 2, 3]

const doubled = list.map(item => item * 2)
console.log(doubled) // [2, 4, 6]

list.forEach(item => {
  console.log(item)
})
```

## 17、数组转字符串、字符串转数组

+ 数组转字符串：`join()`。
+ 字符串转数组：`split()`。

```javascript
[1, 2, 3].join(',') // '1,2,3'
'1,2,3'.split(',') // ['1', '2', '3']
```

## 18、数组去重方法

最常用方式是 `Set`：

```javascript
const list = [1, 2, 2, 3, 3]
const result = [...new Set(list)]

console.log(result) // [1, 2, 3]
```

其他方式：

```javascript
const result = list.filter((item, index) => {
  return list.indexOf(item) === index
})
```

注意：对象键值去重只适合简单字符串或数字场景，因为对象的键会被转成字符串，可能导致 `1` 和 `'1'` 混在一起。

## 19、阻止事件冒泡和默认行为

+ `event.stopPropagation()`：阻止事件继续冒泡。
+ `event.stopImmediatePropagation()`：阻止冒泡，并阻止同一元素后续监听器执行。
+ `event.preventDefault()`：阻止默认行为，例如阻止链接跳转、表单提交。
+ `return false`：只在部分绑定方式中同时阻止默认行为和冒泡，不建议作为通用答案。

```javascript
link.addEventListener('click', event => {
  event.preventDefault()
  event.stopPropagation()
})
```

## 20、innerHTML、innerText、textContent 的区别

+ `innerHTML`：读取或设置元素内部的 HTML，会解析标签，存在 XSS 风险。
+ `innerText`：读取或设置渲染后的文本，受 CSS 影响，会触发布局计算。
+ `textContent`：读取或设置节点文本，不解析 HTML，通常性能更稳定。

```javascript
box.innerHTML = '<strong>标题</strong>'
box.textContent = '<strong>标题</strong>'
```

第一行会渲染加粗标签，第二行会把标签当作普通文本。

## 21、事件代理（事件委托）

事件代理是把事件绑定到父元素上，利用事件冒泡判断真正触发事件的子元素。

优点：

+ 减少事件监听器数量。
+ 动态新增的子元素也能响应事件。
+ 适合列表、表格、菜单等大量重复节点。

缺点：

+ 不适合不冒泡的事件。
+ 需要通过 `event.target` 判断真实触发元素。
+ 如果中间节点阻止冒泡，父元素收不到事件。

```javascript
list.addEventListener('click', event => {
  const item = event.target.closest('li')

  if (!item) {
    return
  }

  console.log(item.dataset.id)
})
```

## 22、本地存储方法及特点

+ `localStorage`：同源页面之间共享，除非手动删除，否则长期保存。
+ `sessionStorage`：同源且同一个标签页内有效，关闭标签页后通常清除，不同标签页一般不共享。
+ `cookie`：可以设置过期时间，会按 `domain`、`path` 等规则随请求自动携带，大小通常较小。

对比：

| 方式 | 生命周期 | 是否随请求发送 | 常见容量 |
| --- | --- | --- | --- |
| `localStorage` | 长期保存 | 否 | 通常约 5MB |
| `sessionStorage` | 当前标签页会话 | 否 | 通常约 5MB |
| `cookie` | 可设置过期时间 | 是 | 通常约 4KB |

## 23、事件三要素

+ 事件源：触发事件的 DOM 元素。
+ 事件类型：例如 `click`、`input`、`mouseover`。
+ 事件处理程序：事件触发时执行的函数。

```javascript
button.addEventListener('click', event => {
  console.log(event.target)
})
```

## 24、DOM 事件流

DOM 事件流分为三个阶段：

1. 捕获阶段：事件从 `window`、`document` 逐层向目标元素传播。
2. 目标阶段：事件到达目标元素。
3. 冒泡阶段：事件从目标元素逐层向外传播。

```javascript
box.addEventListener('click', handler, true) // 捕获阶段
box.addEventListener('click', handler) // 冒泡阶段
```

默认情况下，`addEventListener` 的第三个参数是 `false`，表示在冒泡阶段触发。

## 25、作用域与作用域链

作用域表示变量可以被访问的范围。

+ 全局作用域：整个脚本都可以访问。
+ 函数作用域：函数内部定义的变量只能在函数内部访问。
+ 块级作用域：`let`、`const` 在 `{}` 内形成块级作用域。

作用域链是指：当前作用域找不到变量时，会继续向外层作用域查找，直到全局作用域。

```javascript
const name = '外层'

function fn() {
  const age = 18

  function inner() {
    console.log(name, age)
  }

  inner()
}
```

## 26、变量提升与暂时性死区

`var` 声明会提升，声明前访问结果是 `undefined`。

```javascript
console.log(a) // undefined
var a = 1
```

`let` 和 `const` 也会被提升，但存在暂时性死区，声明前访问会报错。

```javascript
console.log(b) // ReferenceError
let b = 2
```

函数声明会整体提升：

```javascript
say()

function say() {
  console.log('hello')
}
```

# JavaScript 高级

## 1、原型与原型链

每个对象都有一个内部原型，可以通过 `__proto__` 访问。每个函数都有 `prototype` 属性，它会作为构造函数创建出来的实例对象的原型。

```javascript
function Person(name) {
  this.name = name
}

Person.prototype.say = function () {
  console.log(this.name)
}

const p = new Person('小明')
p.say()
```

关系：

```javascript
p.__proto__ === Person.prototype // true
Person.prototype.constructor === Person // true
```

原型链是对象属性查找的链路：访问对象属性时，如果对象自身没有，就沿着原型继续找，直到 `null`。

## 2、闭包

闭包是指函数可以访问它创建时所在词法作用域中的变量，即使外层函数已经执行完毕。

```javascript
function createCounter() {
  let count = 0

  return function () {
    count += 1
    return count
  }
}

const counter = createCounter()
counter() // 1
counter() // 2
```

优点：

+ 可以延长变量生命周期。
+ 可以创建私有变量。
+ 可以保存函数执行时的上下文。

缺点：

+ 如果长期持有不再需要的变量引用，可能导致内存无法释放。
+ 不是闭包天然有害，而是不合理使用闭包才会带来内存问题。

## 3、内存泄漏与内存溢出

+ **内存泄漏**：不再需要的内存没有被释放。
+ **内存溢出**：程序需要的内存超过系统或运行环境能提供的上限。

常见内存泄漏场景：

+ 意外的全局变量。
+ 没有清理的定时器。
+ 没有移除的事件监听器。
+ 被长期引用的 DOM 节点。
+ 不合理的闭包引用。
+ 大量缓存没有淘汰策略。

示例：

```javascript
const timer = setInterval(() => {
  console.log('running')
}, 1000)

clearInterval(timer)
```

## 4、递归函数

递归是函数调用自身。

递归必须满足两个条件：

+ 有明确的终止条件。
+ 每次递归都要向终止条件靠近。

```javascript
function factorial(n) {
  if (n <= 1) {
    return 1
  }

  return n * factorial(n - 1)
}

factorial(5) // 120
```

## 5、对象的创建方式

常见创建对象方式：

+ 对象字面量：`const obj = {}`。
+ `Object` 构造函数：`const obj = new Object()`。
+ 工厂函数。
+ 构造函数。
+ 构造函数 + 原型。
+ `Object.create()`。
+ ES6 `class`。

示例：

```javascript
class Person {
  constructor(name) {
    this.name = name
  }

  say() {
    console.log(this.name)
  }
}
```

## 6、对象继承方式

常见继承方式：

+ 原型链继承。
+ 构造函数继承。
+ 组合继承。
+ 寄生组合继承。
+ ES6 `class extends`。

现代开发中更常见的是 `class extends`：

```javascript
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    console.log(this.name)
  }
}

class Dog extends Animal {
  constructor(name, age) {
    super(name)
    this.age = age
  }
}
```

## 7、同步、异步、宏任务、微任务

同步代码会立即进入调用栈执行，异步任务完成后会把回调放入对应队列。

常见宏任务：

+ `script`
+ `setTimeout`
+ `setInterval`
+ UI 事件
+ 网络请求回调
+ I/O

常见微任务：

+ `Promise.then`
+ `Promise.catch`
+ `Promise.finally`
+ `queueMicrotask`
+ `MutationObserver`

事件循环的大致流程：

1. 执行一个宏任务，例如整体脚本。
2. 执行过程中遇到同步代码立即执行。
3. 遇到异步任务交给宿主环境处理。
4. 当前宏任务结束后，清空微任务队列。
5. 必要时浏览器进行渲染。
6. 执行下一个宏任务。

示例：

```javascript
console.log('1')

setTimeout(() => {
  console.log('2')
})

Promise.resolve().then(() => {
  console.log('3')
})

console.log('4')
```

输出：

```text
1
4
3
2
```

## 8、Promise

`Promise` 是异步编程的一种解决方案，用来表示一个未来才会完成的操作。

三种状态：

+ `pending`：等待中。
+ `fulfilled`：成功。
+ `rejected`：失败。

特点：

+ 状态一旦从 `pending` 变成 `fulfilled` 或 `rejected`，就不可再改变。
+ `.then()` 处理成功结果。
+ `.catch()` 处理错误。
+ `.finally()` 无论成功失败都会执行。
+ `.then()` 会返回一个新的 Promise，所以可以链式调用。

```javascript
fetch('/api/user')
  .then(response => response.json())
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    console.error(error)
  })
```

## 9、Promise.all、race、allSettled、any

+ `Promise.all()`：所有 Promise 都成功才成功；只要有一个失败，就立即失败。
+ `Promise.race()`：最先 settled 的 Promise 决定结果，成功或失败都算。
+ `Promise.allSettled()`：等待所有 Promise 都 settled，返回每个任务的状态和结果。
+ `Promise.any()`：只要有一个成功就成功；全部失败才失败。

```javascript
Promise.all([requestA(), requestB()])
  .then(([a, b]) => {
    console.log(a, b)
  })
```

## 10、async 和 await

`async` 用来声明异步函数，异步函数一定返回 Promise。

`await` 用来等待 Promise 的结果，只能在 `async` 函数或模块顶层使用。

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/user')
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
```

本质上，`async/await` 是 Promise 的语法糖，让异步代码更像同步代码。

## 11、Ajax、Fetch、Axios 的区别

+ **Ajax**：一种异步请求思想，传统上常用 `XMLHttpRequest` 实现。
+ **Fetch**：浏览器原生 API，基于 Promise，语法更现代。
+ **Axios**：第三方请求库，支持请求/响应拦截、自动 JSON 转换、取消请求等能力。

原生 `XMLHttpRequest` 示例：

```javascript
const xhr = new XMLHttpRequest()
xhr.open('GET', '/api/user')
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(JSON.parse(xhr.responseText))
  }
}
xhr.send()
```

Fetch 示例：

```javascript
fetch('/api/user')
  .then(response => response.json())
  .then(data => {
    console.log(data)
  })
```

## 12、跨域

同源策略要求协议、域名、端口完全相同。

只要三者有一个不同，就属于跨域：

```text
https://example.com:443
协议 + 域名 + 端口
```

常见解决方式：

+ **CORS**：服务端设置跨域响应头，是最主流方案。
+ **代理服务器**：开发环境常用 Vite/Webpack dev server 代理。
+ **JSONP**：利用 `script` 标签不受同源策略限制，只支持 GET，现在较少使用。
+ **postMessage**：用于不同窗口、iframe 之间通信。

CORS 常见响应头：

```text
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET,POST,PUT,DELETE
Access-Control-Allow-Headers: Content-Type,Authorization
```

## 13、深拷贝和浅拷贝

浅拷贝只复制对象第一层属性。如果第一层属性是原始值，会复制值；如果是对象，会复制引用。

深拷贝会递归复制所有层级，让新对象和原对象互不影响。

```javascript
const oldObj = {
  name: '小明',
  info: {
    age: 18
  }
}

const newObj = { ...oldObj }
newObj.info.age = 20

console.log(oldObj.info.age) // 20
```

这里扩展运算符是浅拷贝，所以内部对象仍然共用引用。

## 14、如何实现拷贝

浅拷贝方式：

+ 扩展运算符：`{ ...obj }`、`[...arr]`。
+ `Object.assign({}, obj)`。
+ 数组的 `slice()`、`concat()`。

简单深拷贝方式：

```javascript
const newObj = JSON.parse(JSON.stringify(oldObj))
```

缺点：

+ 会丢失函数。
+ 会丢失 `undefined`。
+ `Date` 会变成字符串。
+ `RegExp`、`Map`、`Set` 等特殊对象处理不好。
+ 无法处理循环引用。

更推荐：

+ 现代环境可使用 `structuredClone()`。
+ 复杂项目可使用 `lodash` 的 `cloneDeep()`。
+ 面试中可以手写递归版，并补充循环引用处理。

## 15、简单手写深拷贝

```javascript
function deepClone(value, cache = new WeakMap()) {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (cache.has(value)) {
    return cache.get(value)
  }

  const result = Array.isArray(value) ? [] : {}
  cache.set(value, result)

  Object.keys(value).forEach(key => {
    result[key] = deepClone(value[key], cache)
  })

  return result
}
```

这个版本可以处理普通对象、数组和循环引用，但没有完整处理 `Date`、`RegExp`、`Map`、`Set` 等特殊类型。

## 16、防抖和节流

防抖和节流都是为了限制函数执行频率，减少高频触发带来的性能问题。

**防抖**：一段时间内重复触发，只执行最后一次。

适用场景：

+ 搜索框输入后请求。
+ 表单校验。
+ 窗口大小变化结束后计算布局。

**节流**：一段时间内最多执行一次。

适用场景：

+ 滚动监听。
+ 鼠标移动。
+ 高频点击。
+ 视频播放进度上报。

## 17、手写防抖

```javascript
function debounce(fn, delay) {
  let timer = null

  return function (...args) {
    clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
```

## 18、手写节流

时间戳版：

```javascript
function throttle(fn, delay) {
  let lastTime = 0

  return function (...args) {
    const now = Date.now()

    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}
```

定时器版：

```javascript
function throttle(fn, delay) {
  let timer = null

  return function (...args) {
    if (timer) {
      return
    }

    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}
```

## 19、懒加载

懒加载是指资源先不加载，等到需要时再加载。图片懒加载最常见：当图片进入可视区域时，再设置真实图片地址。

现代浏览器可以直接使用：

```html
<img src="avatar.png" loading="lazy" alt="用户头像">
```

也可以用 `IntersectionObserver` 实现：

```javascript
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return
    }

    const img = entry.target
    img.src = img.dataset.src
    observer.unobserve(img)
  })
})

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img)
})
```

优点：

+ 减少首屏请求。
+ 提升首屏加载速度。
+ 节省流量。
+ 减轻服务器压力。

## 20、预加载

预加载是提前加载后续可能需要的资源，等真正使用时可以直接从缓存读取。

常见方式：

```html
<link rel="preload" href="/main.css" as="style">
<link rel="prefetch" href="/next-page.js" as="script">
```

+ `preload`：当前页面很快就会用到的关键资源。
+ `prefetch`：未来页面可能用到的资源，优先级更低。

# ES6-ES14

## 1、let、const、var 的区别

+ `var` 有函数作用域，没有块级作用域。
+ `var` 声明会提升，声明前访问是 `undefined`。
+ `let` 和 `const` 有块级作用域。
+ `let` 和 `const` 也会被提升，但存在暂时性死区，声明前访问会报错。
+ `var` 在浏览器全局作用域声明时会挂到 `window` 上，`let` 和 `const` 不会。
+ `const` 声明时必须赋值，且不能重新赋值。

注意：

```javascript
const user = {
  name: '小明'
}

user.name = '小红' // 可以
user = {} // 报错
```

`const` 限制的是变量绑定不能被重新赋值，不代表对象内部内容完全不可变。

## 2、箭头函数和普通函数的区别

+ 箭头函数没有自己的 `this`，会捕获外层作用域的 `this`。
+ 箭头函数没有自己的 `arguments`。
+ 箭头函数不能作为构造函数，不能使用 `new`。
+ 箭头函数没有 `prototype`。
+ 箭头函数写法更简洁，适合回调函数。

不适合使用箭头函数的场景：

+ 对象方法需要访问对象自身的 `this`。
+ 构造函数。
+ 需要动态绑定 `this` 的函数。

## 3、模板字符串

模板字符串使用反引号，可以换行，也可以嵌入表达式。

```javascript
const name = '小明'
const age = 18
const text = `姓名：${name}，年龄：${age}`
```

## 4、解构赋值

从数组或对象中提取值，赋给变量。

```javascript
const [first, second] = [1, 2]
const { name, age } = { name: '小明', age: 18 }
```

可以设置默认值：

```javascript
const { title = '默认标题' } = {}
```

## 5、扩展运算符和剩余参数

扩展运算符用于展开：

```javascript
const arr1 = [1, 2]
const arr2 = [...arr1, 3]

const obj1 = { name: '小明' }
const obj2 = { ...obj1, age: 18 }
```

剩余参数用于收集：

```javascript
function sum(...numbers) {
  return numbers.reduce((total, item) => total + item, 0)
}
```

## 6、模块化使用

导出方式：

```javascript
export const name = '小明'
export function say() {}
export default class User {}
```

导入方式：

```javascript
import User from './User.js'
import { name, say } from './user.js'
import * as userModule from './user.js'
import './style.js'
```

+ 默认导入：`import User from './User.js'`。
+ 命名导入：`import { name } from './user.js'`。
+ 命名空间导入：`import * as module from './module.js'`。
+ 副作用导入：`import './style.js'`。
+ 动态导入：`const module = await import('./module.js')`。

## 7、Set、Map、WeakSet、WeakMap

+ `Set`：成员唯一，适合数组去重。
+ `Map`：键值对集合，键可以是任意类型。
+ `WeakSet`：成员只能是对象，弱引用，不能遍历。
+ `WeakMap`：键只能是对象，弱引用，不能遍历。

```javascript
const set = new Set([1, 2, 2])
console.log([...set]) // [1, 2]

const map = new Map()
map.set({}, 'value')
```

`WeakMap` 常用于给对象关联私有数据，不阻止垃圾回收。

## 8、Symbol

`Symbol` 表示唯一且不可变的值，常用于创建唯一属性名。

```javascript
const key = Symbol('id')

const user = {
  [key]: 1,
  name: '小明'
}
```

即使描述相同，两个 Symbol 也不相等：

```javascript
Symbol('id') === Symbol('id') // false
```

## 9、BigInt

`BigInt` 用于表示任意精度整数，解决 `Number` 安全整数范围限制。

```javascript
const big = 123456789012345678901234567890n
```

注意：

```javascript
1n + 1 // TypeError
1n + BigInt(1) // 2n
```

`BigInt` 不能和普通 `Number` 直接混合运算。

## 10、可选链和空值合并

可选链 `?.` 用于安全访问深层属性：

```javascript
const city = user?.address?.city
```

空值合并 `??` 只在左侧是 `null` 或 `undefined` 时使用默认值：

```javascript
const count = value ?? 0
```

对比 `||`：

```javascript
0 || 10 // 10
0 ?? 10 // 0
```

## 11、Proxy 和 Reflect

`Proxy` 用于创建代理对象，拦截对象的读取、赋值、删除等操作。

```javascript
const user = {
  name: '小明'
}

const proxy = new Proxy(user, {
  get(target, key) {
    console.log(`读取 ${String(key)}`)
    return Reflect.get(target, key)
  },
  set(target, key, value) {
    console.log(`设置 ${String(key)}`)
    return Reflect.set(target, key, value)
  }
})
```

`Reflect` 提供一组操作对象的静态方法，常和 `Proxy` 配合使用，让默认行为更规范。

## 12、Object.getOwnPropertyDescriptors

`Object.getOwnPropertyDescriptors()` 会返回对象自身所有属性的描述符。

属性描述符常见字段：

+ `value`：属性值。
+ `writable`：是否可写。
+ `enumerable`：是否可枚举。
+ `configurable`：是否可配置或删除。
+ `get`：getter 函数。
+ `set`：setter 函数。

```javascript
const obj = {
  name: '小明'
}

console.log(Object.getOwnPropertyDescriptors(obj))
```

## 13、class 私有属性、静态属性、静态方法

+ 私有属性和私有方法使用 `#` 定义，只能在类内部访问。
+ 静态属性和静态方法使用 `static` 定义，通过类本身访问，而不是通过实例访问。

```javascript
class Counter {
  static type = 'counter'
  #count = 0

  add() {
    this.#count += 1
  }

  getCount() {
    return this.#count
  }
}
```

## 14、动态 import()

动态导入用于按需加载模块，返回 Promise。

```javascript
async function loadModule() {
  const module = await import('./math.js')
  return module.add(1, 2)
}
```

适用场景：

+ 路由懒加载。
+ 大组件按需加载。
+ 根据条件加载不同模块。

## 15、Array.prototype.flat() 和 flatMap()

`flat()` 用于拍平数组。

```javascript
[1, [2, [3]]].flat(2) // [1, 2, 3]
```

`flatMap()` 先执行 `map()`，再拍平一层。

```javascript
[1, 2, 3].flatMap(item => [item, item * 2])
// [1, 2, 2, 4, 3, 6]
```

## 16、Object.fromEntries()

`Object.fromEntries()` 可以把键值对列表转成对象。

```javascript
const entries = [['name', '小明'], ['age', 18]]
const user = Object.fromEntries(entries)

console.log(user) // { name: '小明', age: 18 }
```

常和 `Object.entries()` 配合使用：

```javascript
const result = Object.fromEntries(
  Object.entries(user).filter(([key]) => key !== 'age')
)
```

## 17、String.prototype.matchAll()

`matchAll()` 返回所有正则匹配结果的迭代器，适合获取多个匹配以及分组内容。

```javascript
const text = 'a1 b2 c3'
const matches = text.matchAll(/([a-z])(\d)/g)

for (const match of matches) {
  console.log(match[1], match[2])
}
```

使用 `matchAll()` 的正则通常需要带 `g` 标记。

## 18、trimStart() 和 trimEnd()

```javascript
const str = '   hello   '

str.trimStart() // 'hello   '
str.trimEnd() // '   hello'
str.trim() // 'hello'
```

## 19、Error Cause

`Error` 支持 `cause` 属性，用来记录错误原因，方便排查链式错误。

```javascript
try {
  throw new Error('原始错误')
} catch (error) {
  throw new Error('业务处理失败', {
    cause: error
  })
}
```

## 20、Map.groupBy 和 Set 新方法

`Map.groupBy()` 用于按条件分组，返回一个 `Map`。

```javascript
const users = [
  { name: '小明', role: 'admin' },
  { name: '小红', role: 'user' }
]

const grouped = Map.groupBy(users, user => user.role)
```

注意：是 `Map.groupBy()`，不是 `Map.prototype.groupBy()`。

`Set` 新方法包括：

+ `union()`：并集。
+ `intersection()`：交集。
+ `difference()`：差集。
+ `symmetricDifference()`：对称差集。
+ `isSubsetOf()`：是否为子集。
+ `isSupersetOf()`：是否为超集。
+ `isDisjointFrom()`：是否没有交集。

```javascript
const a = new Set([1, 2])
const b = new Set([2, 3])

a.union(b) // Set { 1, 2, 3 }
```

## 21、Intl 常用对象

`Intl` 提供国际化能力，常用于日期、数字、货币、列表、相对时间等格式化。

```javascript
new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'full',
  timeStyle: 'short'
}).format(new Date())
```

常见 API：

+ `Intl.DateTimeFormat`：日期时间格式化。
+ `Intl.NumberFormat`：数字、货币、百分比格式化。
+ `Intl.RelativeTimeFormat`：相对时间格式化。
+ `Intl.ListFormat`：列表格式化。
+ `Intl.PluralRules`：复数规则。
+ `Intl.Collator`：字符串比较。
+ `Intl.Segmenter`：文本分词。
+ `Intl.Locale`：语言标签信息。

## 22、Atomics 和 SharedArrayBuffer

`SharedArrayBuffer` 允许多个线程共享同一块内存，`Atomics` 提供原子操作，避免多线程读写共享内存时出现竞争问题。

它们主要用于 Web Worker、多线程计算、音视频处理等高性能场景，普通业务开发中较少直接使用。

# 工程化补充

## 1、模块热替换 HMR

HMR 不是 JavaScript 语言标准特性，而是 Vite、Webpack 等构建工具在开发环境提供的能力。

作用：

+ 修改模块后不刷新整个页面。
+ 保留应用状态。
+ 提升开发体验。

Vue、React 项目中的组件热更新通常就是基于 HMR 实现的。

## 2、前端性能优化常见方向

+ 减少请求数量：合并资源、按需加载、缓存。
+ 减少资源体积：压缩 JS/CSS/图片。
+ 提升首屏速度：路由懒加载、图片懒加载、关键 CSS、预加载。
+ 减少主线程阻塞：拆分长任务、使用 Web Worker。
+ 减少重排重绘：批量 DOM 操作、合理使用 transform。
+ 使用缓存：HTTP 缓存、Service Worker、浏览器存储。

## 3、垃圾回收机制

JavaScript 会自动进行垃圾回收，释放不再被引用的内存。

常见算法：

+ 标记清除：从根对象出发，能访问到的对象标记为可达，无法访问的对象会被回收。
+ 引用计数：记录对象被引用次数，引用为 0 时回收；但循环引用会有问题。

现代 JS 引擎主要使用标记清除及其优化策略。
