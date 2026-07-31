---
title: "第 26 篇：字符串数组方法速背卡：开发常用 API、面试记忆、易混点"
slug: "js-516c7d40"
summary: "用速背卡+详细边界说明掌握字符串和数组高频方法，覆盖开发场景、面试话术和易错点。"
category: "辅助资料"
tags:
  - "JavaScript"
  - "字符串"
  - "数组"
  - "面试"
  - "快速掌握"
status: "published"
sortOrder: 260
cover: ""
originalId: "6a2d291f8a2b1c68f2cac44e"
originalSlug: "js-516c7d40"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 26 篇：字符串数组方法速背卡：开发常用 API、面试记忆、易混点

> 目标：5 分钟建立框架，15 分钟吃透边界，开发和面试都能直接用

[[toc]]

---

## 一、先背这 4 句（面试开场）
1. 字符串和数组有不少同名方法，比如 `slice`、`indexOf`、`includes`、`at`。  
2. 字符串是不可变的原始值，数组是可变对象。  
3. 查找是否存在优先 `includes`，查位置用 `indexOf`/`lastIndexOf`。  
4. 取末尾元素或字符优先 `at(-1)`，可读性比 `length - 1` 更好。

---

## 二、开发高频方法速查（真正常用）

### 1) 查找类：开发里最常用
| 方法 | 字符串 | 数组 | 返回值 | 速记 |
|---|---|---|---|---|
| `indexOf(x)` | 找子串首次位置 | 找元素首次位置 | 索引或 `-1` | 查位置 |
| `lastIndexOf(x)` | 找子串最后位置 | 找元素最后位置 | 索引或 `-1` | 从后找 |
| `includes(x)` | 是否包含子串 | 是否包含元素 | `true/false` | 查有没有 |
| `at(i)` | 按索引取字符 | 按索引取元素 | 值或 `undefined` | 支持负索引 |

开发建议：
- 判断存在性：优先 `includes`，代码语义更直接
- 需要位置：用 `indexOf` 或 `lastIndexOf`
- 取最后一个：`arr.at(-1)` / `str.at(-1)`

### 2) 截取/拼接：业务处理必备
| 方法 | 字符串 | 数组 | 是否改原值 | 速记 |
|---|---|---|---|---|
| `slice(start, end)` | 提取子串 | 提取子数组 | 否 | 常用截取 |
| `concat(...)` | 拼接字符串 | 拼接数组 | 否 | 常用拼接 |
| `split(sep)` | 字符串转数组 | 无 | 否 | 分 |
| `join(sep)` | 无 | 数组转字符串 | 否 | 合 |

开发建议：
- 不想改原数据，优先 `slice`、`concat`
- 字符串和数组互转：`split` + `join`

### 3) 易混淆但高频被问
| 问题 | 标准结论 |
|---|---|
| `includes` 和 `indexOf` 区别 | 一个返布尔，一个返索引；`includes` 能识别 `NaN` |
| `slice` 和 `substring` 区别 | `slice` 支持负数；`substring` 负数按 `0`，且会交换 `start/end` |
| 字符串能不能改下标 | 不能，字符串不可变 |

---

## 三、参数与边界（这部分决定你面试是否稳）

### 1) `indexOf(searchValue, fromIndex?)`
- 字符串：找子串第一次出现位置，找不到返回 `-1`
- 数组：找元素第一次出现位置，找不到返回 `-1`
- `fromIndex` 为起始查找下标
- 数组版使用严格相等语义（`===` 风格），所以 `NaN` 找不到

```javascript
'banana'.indexOf('na') // 2
'banana'.indexOf('na', 3) // 4
['a', 'b', 'a'].indexOf('a', 1) // 2
[NaN].indexOf(NaN) // -1
```

### 2) `includes(searchValue, fromIndex?)`
- 字符串：判断是否包含子串，返回布尔值
- 数组：判断是否包含元素，返回布尔值
- `fromIndex` 同样支持从某下标开始
- 数组版可识别 `NaN`
- 字符串版区分大小写

```javascript
'Hello'.includes('he') // false
'Hello'.includes('He') // true
[1, 2, 3].includes(2, 2) // false
[NaN].includes(NaN) // true
```

### 3) `at(index)`
- 支持负索引：`-1` 表示最后一个
- 越界返回 `undefined`
- 更适合读“尾部元素”的语义

```javascript
'abc'.at(-1) // 'c'
[10, 20, 30].at(-1) // 30
[10, 20, 30].at(9) // undefined
```

### 4) `slice(start?, end?)`
- 不改原值，返回新片段
- 支持负数：从尾部反向定位
- `end` 不包含在结果内（左闭右开）

```javascript
'JavaScript'.slice(4, 10) // 'Script'
'JavaScript'.slice(-6) // 'Script'
['J', 'S', 'A', 'B'].slice(1, 3) // ['S', 'A']
```

### 5) `substring(start, end?)`（字符串独有）
- 不支持负数，负数会按 `0` 处理
- 如果 `start > end` 会自动交换
- 返回区间同样是左闭右开

```javascript
'abcd'.substring(1, 3) // 'bc'
'abcd'.substring(-2, 2) // 'ab'
'abcd'.substring(3, 1) // 'bc'
```

### 6) `split(sep, limit?)` 与 `join(sep?)`
- `split`：字符串拆成数组
- `join`：数组合成字符串
- `limit` 可限制拆分结果长度
- `join` 默认分隔符是 `,`

```javascript
'a-b-c'.split('-') // ['a', 'b', 'c']
'a-b-c'.split('-', 2) // ['a', 'b']
['a', 'b', 'c'].join('-') // 'a-b-c'
['a', 'b', 'c'].join() // 'a,b,c'
```

---

## 四、开发最常写的 10 段代码（可直接复用）

```javascript
const str = 'JavaScript'
const arr = ['J', 'a', 'v', 'a', 'S', 'c', 'r', 'i', 'p', 't']

// 1) 是否包含
str.includes('Script') // true
arr.includes('Script') // false

// 2) 查位置
str.indexOf('a') // 1
arr.indexOf('a') // 1

// 3) 取最后一个
str.at(-1) // 't'
arr.at(-1) // 't'

// 4) 截取一段
str.slice(4, 10) // 'Script'
arr.slice(4, 10) // ['S', 'c', 'r', 'i', 'p', 't']

// 5) 字符串 -> 数组
str.split('') // ['J', 'a', ...]

// 6) 数组 -> 字符串
arr.join('') // 'JavaScript'

// 7) 反转字符串（开发常见）
[...str].reverse().join('')

// 8) 统计字符次数（开发常见）
str.split('').reduce((acc, ch) => {
  acc[ch] = (acc[ch] || 0) + 1
  return acc
}, {})

// 9) 去掉首尾空白，再按空格切词
'  front end engineer  '.trim().split(/\s+/) // ['front', 'end', 'engineer']

// 10) 拿数组最后两项，不改原数组
arr.slice(-2) // ['p', 't']
```

---

## 五、开发场景怎么选（实战决策）

1. 只关心是否存在：`includes`  
例：判断用户输入里有没有敏感词。

2. 需要拿到位置：`indexOf` / `lastIndexOf`  
例：定位路径里最后一个 `/`，截取文件名。

3. 需要“从尾部”读取：`at(-1)`  
例：读取最后一条日志、最后一个字符。

4. 不想改原数据又要截取：`slice`  
例：分页、取前 N 条、取最近 N 条。

5. 字符串数组互转：`split` + `join`  
例：关键词输入框、标签序列化、CSV 轻量处理。

---

## 六、面试直接背（30 秒版本）
> 字符串和数组有不少同名方法，比如 `slice`、`indexOf`、`includes`、`at`，这体现了 JS 序列 API 的一致性。  
> 但本质不同：字符串是不可变原始值，数组是可变对象。  
> 所以判断存在性我会优先 `includes`，找位置用 `indexOf`，取末尾用 `at(-1)`，截取用 `slice`。  
> 另外 `includes` 能识别 `NaN`，而 `indexOf` 不能，这是高频追问点。

## 七、面试常问快答（可默背）
1. `includes` 和 `indexOf` 怎么选？  
`includes` 用来判断存在，`indexOf` 用来拿位置；并且 `includes` 能识别 `NaN`。

2. `slice` 和 `substring` 区别是什么？  
`slice` 支持负数；`substring` 遇到负数按 `0` 处理，且 `start > end` 会自动交换。

3. 为什么字符串没有 `push`、`splice`？  
字符串不可变，所有字符串方法都返回新字符串，不会原地改字符。

4. `at(-1)` 有什么价值？  
可读性高，语义直接，避免反复写 `arr[arr.length - 1]`。

5. `split('')` 和 `[...str]` 有什么区别？  
多数英文场景结果一致，但遇到某些 Unicode 字符时，`[...str]`/`Array.from(str)` 通常更稳。

6. `slice` 会不会修改原数据？  
不会，字符串和数组的 `slice` 都是返回新值。

---

## 八、最容易答错的 6 个坑
1. 把 `includes` 写成拿索引：错，`includes` 只返布尔值。  
2. 用 `indexOf` 判断 `NaN`：错，数组里会得到 `-1`。  
3. 说 `substring` 支持负数：错，负数会按 `0`。  
4. 说字符串可以 `push`：错，字符串不可变。  
5. 误以为 `slice` 会改原数组：错，它不改原值。  
6. 脑图里误写 `indexOfLast`：错，正确是 `lastIndexOf`。

---

## 九、速练 8 题（3 分钟自测）

```javascript
const str = 'Hello World'
const arr = ['H', 'e', 'l', 'l', 'o', ' ', 'W', 'o', 'r', 'l', 'd']

// 1
console.log(str.slice(-5)) // ?
// 2
console.log(arr.slice(-5)) // ?
// 3
console.log(str.includes('World')) // ?
// 4
console.log(arr.includes('World')) // ?
// 5
console.log([NaN].indexOf(NaN)) // ?
// 6
console.log([NaN].includes(NaN)) // ?
// 7
console.log('abcd'.substring(-2, 2)) // ?
// 8
console.log('abcd'.slice(-2)) // ?
```

答案：
```javascript
console.log(str.slice(-5)) // 'World'
console.log(arr.slice(-5)) // ['W', 'o', 'r', 'l', 'd']
console.log(str.includes('World')) // true
console.log(arr.includes('World')) // false
console.log([NaN].indexOf(NaN)) // -1
console.log([NaN].includes(NaN)) // true
console.log('abcd'.substring(-2, 2)) // 'ab'
console.log('abcd'.slice(-2)) // 'cd'
```

---

## 十、终极速记口诀
`查找看 includes/indexOf，定位再用 lastIndexOf，截取优先 slice，末尾用 at(-1)，字符串不改只返回新值。`
