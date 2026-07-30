---
title: "第21篇：for 家族完全指南"
slug: "js-js-for-ae3e60e0"
summary: "一次讲清 JavaScript 里的 for、for...of、for...in、forEach、for await...of 的语法、场景、区别、陷阱和选择方法。"
category: "辅助资料"
tags:
  - "JavaScript"
  - "for循环"
  - "for...of"
  - "for...in"
  - "遍历"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291f8a2b1c68f2cac428"
originalSlug: "js-js-for-ae3e60e0"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第21篇：for 家族完全指南

很多人不是不会写循环，而是还没先分清：**我现在到底要的是索引、值、键，还是异步结果？**  
只要这个问题先想清楚，`for` 相关写法就会一下子顺很多。

这篇文章就专门把 JavaScript 里和 `for` 有关的高频写法一次讲透：普通 `for`、`for...of`、`for...in`、`forEach`，以及容易让人更乱的异步循环。

[[toc]]

---

## 一、先背这 5 句话
1. 要自己控制下标、步长、倒序、跳项，用普通 `for`
2. 要拿“每一项的值”，遍历数组、字符串、Set、Map，用 `for...of`
3. 要拿“键名 / 属性名”，遍历对象，用 `for...in`
4. `forEach` 是方法，不是语法；它不能 `break`，也不适合直接配 `await`
5. 需要异步一个一个处理时，优先 `for...of + await`；遇到异步可迭代对象时，再用 `for await...of`

如果你现在只想先有个“不再搞混”的记忆版本，就记这一句：

> `for` 看控制，`for...of` 看值，`for...in` 看键，`forEach` 看回调，异步逐个等结果看 `await`

---

## 二、为什么这些东西特别容易混
因为它们表面上都像是在“循环”，但它们回答的根本不是同一个问题。

| 你真正想拿到什么 | 最常用写法 |
| --- | --- |
| 我想自己控制第几个、走几步、能不能倒着走 | `for` |
| 我想直接拿每一项的值 | `for...of` |
| 我想拿对象里每个属性名 | `for...in` |
| 我只是想对数组每项执行一个回调 | `forEach` |
| 我想一边遍历，一边等待异步结果 | `for...of + await` / `for await...of` |

所以以后不要先问“我要不要写 `for...of`”，而是先问：

1. 我要的是索引，还是值，还是键？
2. 中途需不需要 `break` / `continue`？
3. 这次循环里是不是有 `await`？

这三个问题一想清楚，90% 的混乱就没了。

---

## 三、一张总表先建立全局印象

| 写法 | 你拿到的东西 | 适合什么数据 | 能 `break` | 能 `continue` | 适合 `await` | 常见场景 |
| --- | --- | --- | --- | --- | --- | --- |
| `for` | 索引由你自己控制 | 几乎都行 | 可以 | 可以 | 可以 | 倒序、跳步、删元素、同时看前后项 |
| `for...of` | 每一项的值 | 可迭代对象 | 可以 | 可以 | 可以 | 数组、字符串、Set、Map 遍历 |
| `for...in` | 键名 / 属性名 | 对象 | 可以 | 可以 | 可以 | 枚举对象属性 |
| `forEach` | 回调参数中的值、索引 | 数组，或集合自带的 `forEach` | 不可以 | 不是真正支持 | 不推荐 | 简单遍历执行 |
| `for await...of` | 异步迭代出来的值 | 异步可迭代对象 | 可以 | 可以 | 就是干这个的 | 流、异步生成器、分批读取 |

先有一个总印象：

- `for` 最自由
- `for...of` 最像“给我一个个值”
- `for...in` 最像“给我一个个键”
- `forEach` 最像“帮我把这个回调挨个执行一下”
- `for await...of` 最像“异步版本的一个个取值”

---

## 四、普通 `for`：控制力最强的基础循环

### 1. 基本语法

```javascript
for (初始化; 条件; 更新) {
  要重复执行的代码
}
```

例如：

```javascript
for (let i = 0; i < 3; i++) {
  console.log(i)
}
```

执行过程可以理解成：

1. 先执行 `let i = 0`
2. 判断 `i < 3` 是否成立
3. 成立就进入循环体
4. 循环体结束后执行 `i++`
5. 再次判断条件

### 2. 它最适合什么场景

普通 `for` 适合你需要“自己掌控节奏”的时候，比如：

- 你需要索引 `i`
- 你需要跳着走，比如 `i += 2`
- 你需要倒序遍历
- 你需要在遍历时删除数组元素
- 你需要同时访问当前项、上一项、下一项

### 3. 开发里最常见的几个例子

#### 按索引遍历数组

```javascript
const list = ['a', 'b', 'c']

for (let i = 0; i < list.length; i++) {
  console.log(i, list[i])
}
```

#### 每次走两步

```javascript
const nums = [10, 20, 30, 40, 50, 60]

for (let i = 0; i < nums.length; i += 2) {
  console.log(nums[i])
}
```

#### 倒序遍历

```javascript
const list = ['a', 'b', 'c']

for (let i = list.length - 1; i >= 0; i--) {
  console.log(list[i])
}
```

### 4. `break` 和 `continue`

#### `break`：立刻结束整个循环

```javascript
const nums = [3, 5, 8, 10, 12]

for (let i = 0; i < nums.length; i++) {
  if (nums[i] === 10) {
    break
  }

  console.log(nums[i])
}
```

输出是：

```javascript
3
5
8
```

#### `continue`：跳过本次，直接进入下一轮

```javascript
for (let i = 0; i < 5; i++) {
  if (i === 2) {
    continue
  }

  console.log(i)
}
```

输出是：

```javascript
0
1
3
4
```

### 5. 一个特别常见的坑：`var` 导致循环变量混乱

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i)
  }, 0)
}
```

很多人以为会输出 `0 1 2`，其实通常是：

```javascript
3
3
3
```

原因不是“循环坏了”，而是 `var` 只有一个共享的变量绑定。等定时器执行时，循环早就结束了，`i` 已经变成 `3` 了。

改成 `let` 就对了：

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i)
  }, 0)
}
```

这时输出才是：

```javascript
0
1
2
```

记忆点：

- `var`：像大家共用一个盒子
- `let`：每一轮循环都有自己那一份

---

## 五、`for...of`：拿“值”的首选写法

### 1. 基本语法

```javascript
for (const value of 可迭代对象) {
  console.log(value)
}
```

它最核心的特点只有一句话：

> `for...of` 关心的是“每一项的值”，不关心键名长什么样

### 2. 哪些东西能用 `for...of`

常见可迭代对象包括：

- 数组
- 字符串
- Set
- Map
- NodeList 等现代可迭代集合

### 3. 遍历数组

```javascript
const list = ['html', 'css', 'js']

for (const item of list) {
  console.log(item)
}
```

输出就是值：

```javascript
'html'
'css'
'js'
```

### 4. 遍历字符串

```javascript
for (const ch of 'hello') {
  console.log(ch)
}
```

### 5. 遍历 Set

```javascript
const set = new Set([1, 2, 2, 3])

for (const value of set) {
  console.log(value)
}
```

输出：

```javascript
1
2
3
```

### 6. 遍历 Map

Map 比较特别，因为它每一项本质上是 `[key, value]`。

```javascript
const userMap = new Map([
  ['name', '张三'],
  ['age', 18]
])

for (const [key, value] of userMap) {
  console.log(key, value)
}
```

### 7. 既想拿值，又想拿索引怎么办

用 `entries()`：

```javascript
const list = ['a', 'b', 'c']

for (const [index, value] of list.entries()) {
  console.log(index, value)
}
```

### 8. `for...of` 的优点

- 写法简洁
- 直接拿值，脑子不容易乱
- 支持 `break` / `continue`
- 非常适合配合 `await`

### 9. 一个关键点：普通对象不能直接用 `for...of`

```javascript
const user = {
  name: '张三',
  age: 18
}

// 这类写法会报错
for (const item of user) {
  console.log(item)
}
```

因为普通对象默认不是可迭代对象。

如果你想遍历对象的键值对，更稳的写法通常是：

```javascript
const user = {
  name: '张三',
  age: 18
}

for (const [key, value] of Object.entries(user)) {
  console.log(key, value)
}
```

---

## 六、`for...in`：拿“键名 / 属性名”的写法

### 1. 基本语法

```javascript
for (const key in 对象) {
  console.log(key)
}
```

它最核心的特点只有一句话：

> `for...in` 关心的是“键名”，不是值

### 2. 遍历普通对象

```javascript
const user = {
  name: '张三',
  age: 18
}

for (const key in user) {
  console.log(key, user[key])
}
```

输出大致是：

```javascript
'name', '张三'
'age', 18
```

### 3. 为什么很多人说它遍历对象时要小心

因为 `for...in` 会枚举**可枚举属性名**，而且可能连原型链上的可枚举属性也一起扫到。

所以更稳一点的写法是加一层判断：

```javascript
const user = {
  name: '张三',
  age: 18
}

for (const key in user) {
  if (Object.hasOwn(user, key)) {
    console.log(key, user[key])
  }
}
```

### 4. 为什么不推荐用 `for...in` 遍历数组

因为数组更关注“值”和“顺序”，而 `for...in` 给你的是键名，而且键名还是字符串。

```javascript
const list = ['a', 'b', 'c']

for (const key in list) {
  console.log(key, list[key])
}
```

这里的 `key` 实际是：

```javascript
'0'
'1'
'2'
```

它不是数组值，而是索引名。

更重要的是，数组如果被额外挂了自定义属性，`for...in` 也可能把它们扫出来：

```javascript
const list = ['a', 'b', 'c']
list.extra = '额外属性'

for (const key in list) {
  console.log(key)
}
```

这时除了 `0`、`1`、`2`，还可能出现 `extra`。

所以结论很直接：

- 遍历数组的值，用 `for...of`
- 遍历数组并且需要索引控制，用普通 `for`
- 遍历对象键名，才考虑 `for...in`

### 5. 现代开发里一个更稳的对象遍历思路

很多时候，与其写 `for...in`，不如：

```javascript
for (const [key, value] of Object.entries(user)) {
  console.log(key, value)
}
```

因为这相当于：

1. 先把对象自己的键值对取出来
2. 再用 `for...of` 去遍历

这样通常更直观，也更不容易踩到原型链相关的坑。

---

## 七、`forEach`：常和 `for` 放一起比较，但它不是 `for` 语法

### 1. 基本写法

```javascript
const list = ['a', 'b', 'c']

list.forEach((item, index) => {
  console.log(index, item)
})
```

它的心智模型是：

> “把这个回调函数，对每一项都执行一次”

### 2. 它适合什么场景

适合那种非常简单的“把每一项处理一下”的场景，比如：

- 打印日志
- 组装展示数据
- 简单副作用处理

### 3. 它最大的限制

#### 不能用 `break`

```javascript
const list = [1, 2, 3, 4, 5]

list.forEach(item => {
  if (item === 3) {
    // break // 这里不能这样写
  }
})
```

#### 也没有真正的 `continue`

你可以在回调里 `return`，但这只是结束当前这一次回调，不是真正的循环级 `continue`。

```javascript
const list = [1, 2, 3, 4]

list.forEach(item => {
  if (item === 3) {
    return
  }

  console.log(item)
})
```

### 4. 它最容易让人翻车的点：`forEach` + `async`

很多人会这样写：

```javascript
list.forEach(async item => {
  await saveItem(item)
})

console.log('结束')
```

表面看像是“一个个保存完再结束”，但实际上外层代码不会等待 `forEach` 里的 `await` 全部完成。

也就是说，`console.log('结束')` 很可能先执行。

### 5. 真正稳的异步写法

#### 需要按顺序一个一个执行

```javascript
for (const item of list) {
  await saveItem(item)
}
```

#### 需要并发执行

```javascript
await Promise.all(list.map(item => saveItem(item)))
```

所以这块一定要记住：

- `forEach` 适合简单同步遍历
- 有 `await` 时，优先想到 `for...of`

---

## 八、异步循环：`for...of + await` 和 `for await...of`

这是初学者最容易再次混乱的一块，所以分开看。

### 1. 日常业务里最常见的是 `for...of + await`

```javascript
async function loadUsers(ids) {
  for (const id of ids) {
    const user = await fetchUser(id)
    console.log(user)
  }
}
```

这表示：

1. 先拿到第一个 `id`
2. 等第一个请求完成
3. 再处理下一个

这种写法最适合“必须按顺序来”的业务。

### 2. `for await...of` 是给异步可迭代对象准备的

例如异步生成器：

```javascript
async function* createData() {
  yield '第一批'
  yield '第二批'
  yield '第三批'
}

async function run() {
  for await (const item of createData()) {
    console.log(item)
  }
}
```

它的感觉像是：

> 每来一批异步数据，我就处理一批

### 3. 该怎么区分这两个写法

你可以这样记：

- **普通数组里做异步操作**：优先 `for...of + await`
- **数据源本身就是异步一批批吐出来**：考虑 `for await...of`

大部分日常前端业务代码里，你更常写到的是前者，不是后者。

---

## 九、`break`、`continue`、`return` 一次讲清

| 写法 | `break` | `continue` | `return` 的效果 |
| --- | --- | --- | --- |
| `for` | 支持 | 支持 | 退出所在函数 |
| `for...of` | 支持 | 支持 | 退出所在函数 |
| `for...in` | 支持 | 支持 | 退出所在函数 |
| `forEach` | 不支持 | 不是真正支持 | 只退出当前回调 |

最容易说错的一句就是：

> `forEach` 里的 `return`，不是“结束整个循环”，只是“结束这次回调”

---

## 十、开发里最容易踩的 6 个坑

### 1. 用 `for...in` 遍历数组

这是最经典的混淆之一。

你以为自己在拿数组值，实际上你拿到的是索引名。

错误心智：

```javascript
for (const item in list) {
  console.log(item)
}
```

这里的 `item` 根本不是值，而是键名。

### 2. 拿普通对象直接 `for...of`

普通对象默认不是可迭代对象，不能直接这样写：

```javascript
for (const item of obj) {
  console.log(item)
}
```

更稳的写法：

```javascript
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value)
}
```

### 3. `forEach` 里写 `await`

这通常不是你想要的执行顺序。

要么改成：

```javascript
for (const item of list) {
  await doSomething(item)
}
```

要么改成：

```javascript
await Promise.all(list.map(item => doSomething(item)))
```

### 4. 遍历数组时一边删一边往前走

```javascript
const nums = [1, 2, 3, 4, 5, 6]

for (let i = 0; i < nums.length; i++) {
  if (nums[i] % 2 === 0) {
    nums.splice(i, 1)
  }
}
```

这种写法容易漏项，因为删掉一个元素后，后面的元素会往前补位。

更稳的做法是倒序删：

```javascript
const nums = [1, 2, 3, 4, 5, 6]

for (let i = nums.length - 1; i >= 0; i--) {
  if (nums[i] % 2 === 0) {
    nums.splice(i, 1)
  }
}
```

### 5. `Map` 的 `for...of` 每项不是单个值

这个也经常把人绕晕。

```javascript
const m = new Map([
  ['name', '张三'],
  ['age', 18]
])

for (const item of m) {
  console.log(item)
}
```

这里的 `item` 实际上是：

```javascript
['name', '张三']
['age', 18]
```

所以更常见的写法是解构：

```javascript
for (const [key, value] of m) {
  console.log(key, value)
}
```

### 6. 需要索引，却硬用 `for...of`

`for...of` 很适合拿值，但如果你的逻辑非常依赖索引，比如：

- 比较前后两项
- 每次跨两格
- 倒序
- 删除当前项后还要调整位置

那普通 `for` 往往更清楚。

不要为了“写法高级”强行用 `for...of`，代码能不能让自己两天后看懂更重要。

---

## 十一、到底该怎么选

你可以直接按下面这套思路选：

### 1. 我需要下标控制吗

如果答案是“需要”，优先普通 `for`。

典型情况：

- `i += 2`
- 倒序
- 比较 `arr[i]` 和 `arr[i - 1]`
- 遍历时删除元素

### 2. 我只是想拿每一项的值吗

如果答案是“是”，优先 `for...of`。

典型情况：

- 遍历数组
- 遍历字符串字符
- 遍历 Set
- 遍历 Map 的键值对

### 3. 我是在遍历对象属性吗

如果答案是“是”，考虑：

- 简单枚举键名：`for...in`
- 更稳地拿键值对：`Object.entries(obj)` + `for...of`

### 4. 我需不需要 `break` 或 `continue`

如果需要，中优先级排除 `forEach`。

### 5. 我这轮循环里有 `await` 吗

如果有：

- 顺序执行：`for...of + await`
- 并发执行：`Promise.all`
- 异步可迭代对象：`for await...of`

---

## 十二、一套非常好记的口诀

### 1. 一句话版本

> 索引用 `for`，值用 `for...of`，键用 `for...in`，回调用 `forEach`，异步顺序用 `await`

### 2. 拟人化版本

- `for`：路线我自己开
- `for...of`：把每一项直接递给我
- `for...in`：把每个名字先报给我
- `forEach`：你替我一个个调用回调
- `for await...of`：异步来一个，我处理一个

---

## 十三、面试里怎么用 30 秒说清楚

你可以直接这样答：

> JavaScript 里常见的循环写法里，普通 `for` 控制力最强，适合需要索引、步长、倒序和复杂控制的场景；`for...of` 适合遍历可迭代对象的值，比如数组、字符串、Set、Map；`for...in` 主要用于遍历对象键名，不推荐拿它遍历数组；`forEach` 适合简单同步遍历，但不能 `break`，也不适合直接配 `await`；如果循环里需要顺序等待异步结果，通常用 `for...of + await`。

这段话够稳，也够像真正理解了，不只是背概念。

---

## 十四、最后帮你做一个“见招拆招”速判

看到下面这些需求时，第一反应应该是：

| 需求 | 第一反应 |
| --- | --- |
| 我要拿数组里的每个值 | `for...of` |
| 我要拿数组索引并跳步 | `for` |
| 我要遍历对象属性 | `for...in` 或 `Object.entries()` + `for...of` |
| 我要中途停掉 | 不选 `forEach` |
| 我要循环里写 `await` | `for...of + await` |
| 我要处理异步生成器 / 流 | `for await...of` |

---

## 十五、总结

把 `for` 相关写法真正分开，其实只靠这三个问题：

1. 我拿的是索引、值，还是键
2. 我需不需要 `break` / `continue`
3. 我这次是不是要等异步结果

最后再给你压缩成终极速记版：

1. 想“自己掌控循环节奏”就用普通 `for`
2. 想“拿到每一项的值”就用 `for...of`
3. 想“拿到对象的键名”就用 `for...in`
4. 想“简单执行回调”可以用 `forEach`
5. 想“循环里等待异步”优先想 `for...of + await`

如果你把这篇记住，以后再看到 `for` 相关写法，就不要先死背语法，而是先问自己一句：

> 我现在到底是要索引、值、键，还是异步结果？

这句一想对，循环逻辑基本就不容易乱了。
