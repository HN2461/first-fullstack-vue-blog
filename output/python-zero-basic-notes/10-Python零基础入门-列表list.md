---
title: Python 零基础入门 10：列表 list
slug: python-zero-lists
summary: 讲解列表的概念、创建列表、读取元素、添加删除元素、切片、列表方法、列表推导式，全程对照 JavaScript 数组。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 10：列表 list

列表用于保存一组数据。

前端 JS 里你天天用数组：

```js
const tags = ['Python', 'JS', 'Vue']
const articles = [{ id: 1, title: '文章1' }, { id: 2, title: '文章2' }]
```

Python 的列表就是 JS 的数组，但方法名和操作方式有不少差异。

## 一、为什么需要列表

如果不用列表：

```python
student1 = "小明"
student2 = "小红"
student3 = "小刚"
```

当学生越来越多时，变量会越来越乱。

列表可以把同类数据放在一起：

```python
students = ["小明", "小红", "小刚"]
```

## 二、创建列表

```python
numbers = [1, 2, 3, 4, 5]
names = ["小明", "小红", "小刚"]
mixed = ["小明", 18, True]     # 可以混合类型，但不推荐
empty = []                      # 空列表
```

列表用中括号 `[]` 表示，里面的元素用英文逗号隔开。

新手阶段建议一个列表里尽量放同一类数据，比如都放姓名，或都放数字。

JS 对照：

```js
const numbers = [1, 2, 3, 4, 5]
const names = ['小明', '小红', '小刚']
const mixed = ['小明', 18, true]
const empty = []
```

语法几乎完全相同。

## 三、读取列表元素

列表里的位置叫索引，从 0 开始。

```python
students = ["小明", "小红", "小刚"]

print(students[0])   # 小明
print(students[1])   # 小红
print(students[2])   # 小刚
print(students[-1])  # 小刚（最后一个）
```

JS 对照：

```js
const students = ['小明', '小红', '小刚']

console.log(students[0])      // 小明
console.log(students.at(-1))  // 小刚
```

**Python 支持负数索引，JS 需要 `at(-1)`。**

越界行为：

```python
students[10]   # IndexError: list index out of range
```

```js
students[10]   // undefined（不报错）
```

Python 越界报错，JS 返回 `undefined`。

## 四、修改列表元素

```python
students = ["小明", "小红", "小刚"]
students[1] = "小李"

print(students)
```

输出：

```text
['小明', '小李', '小刚']
```

JS 一样：

```js
const students = ['小明', '小红', '小刚']
students[1] = '小李'
```

**列表和 JS 数组一样，是可变的（mutable）。**

## 五、列表切片

列表切片和字符串切片语法完全一样。

```python
nums = [10, 20, 30, 40, 50]

print(nums[0:2])    # [10, 20]
print(nums[:3])     # [10, 20, 30]
print(nums[2:])     # [30, 40, 50]
print(nums[-2:])    # [40, 50]
print(nums[::2])    # [10, 30, 50]（步长为 2）
print(nums[::-1])   # [50, 40, 30, 20, 10]（反转）
```

JS 对照：

```js
const nums = [10, 20, 30, 40, 50]

console.log(nums.slice(0, 2))   // [10, 20]
console.log(nums.slice(0, 3))   // [10, 20, 30]
console.log(nums.slice(2))      // [30, 40, 50]
console.log(nums.slice(-2))     // [40, 50]
```

JS 没有 `[::-1]` 反转语法，需要 `nums.reverse()`（原地反转）或 `[...nums].reverse()`。

## 六、添加元素

### append()：末尾添加一个

```python
students = ["小明", "小红"]
students.append("小刚")

print(students)   # ['小明', '小红', '小刚']
```

JS 对照：`array.push()`

```js
const students = ['小明', '小红']
students.push('小刚')
```

### insert()：指定位置插入

```python
students = ["小明", "小刚"]
students.insert(1, "小红")    # 在索引 1 的位置插入

print(students)   # ['小明', '小红', '小刚']
```

JS 对照：`array.splice(1, 0, '小红')`

### extend()：合并另一个列表

```python
a = [1, 2]
b = [3, 4]
a.extend(b)

print(a)   # [1, 2, 3, 4]
```

JS 对照：`array.concat()` 或展开运算符

```js
const a = [1, 2]
const b = [3, 4]

a.push(...b)    // 原地修改
// 或
const c = a.concat(b)  // 返回新数组
const d = [...a, ...b] // 展开运算符
```

### 添加元素对照表

| 功能 | Python | JS |
| --- | --- | --- |
| 末尾添加 | `list.append(x)` | `array.push(x)` |
| 指定位置插入 | `list.insert(i, x)` | `array.splice(i, 0, x)` |
| 合并列表 | `list.extend(other)` | `array.concat(other)` 或 `push(...other)` |
| 末尾添加多个 | 无（用 extend） | `array.push(a, b, c)` |

**高频踩坑：`append()` 添加整个列表作为单个元素**

```python
a = [1, 2]
a.append([3, 4])

print(a)   # [1, 2, [3, 4]]  ——不是 [1, 2, 3, 4]！
```

如果需要合并，用 `extend()`：

```python
a = [1, 2]
a.extend([3, 4])

print(a)   # [1, 2, 3, 4]
```

## 七、删除元素

### remove()：按值删除

```python
students = ["小明", "小红", "小刚"]
students.remove("小红")

print(students)   # ['小明', '小刚']
```

如果要删除的内容不存在，会报 `ValueError`。

JS 对照：没有直接按值删除的方法，通常用 `filter()`：

```js
const students = ['小明', '小红', '小刚']
const filtered = students.filter(s => s !== '小红')
```

### pop()：按索引删除

```python
students = ["小明", "小红", "小刚"]
removed = students.pop(1)    # 删除索引 1，返回被删除的值

print(removed)    # 小红
print(students)   # ['小明', '小刚']
```

不传索引时，删除最后一个：

```python
students.pop()   # 删除并返回最后一个元素
```

JS 的 `pop()` 也是删除最后一个，完全相同：

```js
const students = ['小明', '小红', '小刚']
const removed = students.pop()  // '小刚'
```

JS 的 `splice()` 可以删除指定位置：

```js
students.splice(1, 1)  // 删除索引 1 的元素
```

### del 语句

```python
students = ["小明", "小红", "小刚"]
del students[1]

print(students)   # ['小明', '小刚']
```

`del` 是 Python 关键字，不是方法。也可以删除整个变量：

```python
del students   # 变量 students 不再存在
```

### 删除对照表

| 功能 | Python | JS |
| --- | --- | --- |
| 按值删除 | `list.remove(x)` | `array.filter(item => item !== x)` |
| 按索引删除 | `list.pop(i)` 或 `del list[i]` | `array.splice(i, 1)` |
| 删除最后一个 | `list.pop()` | `array.pop()` |
| 清空列表 | `list.clear()` | `array.length = 0` 或 `array.splice(0)` |

## 八、列表常用方法

| 功能 | Python | JS |
| --- | --- | --- |
| 长度 | `len(list)` | `array.length` |
| 排序 | `list.sort()` 或 `sorted(list)` | `array.sort()` |
| 反转 | `list.reverse()` | `array.reverse()` |
| 查找位置 | `list.index(x)` | `array.indexOf(x)` |
| 统计次数 | `list.count(x)` | 无内置 |
| 判断包含 | `x in list` | `array.includes(x)` |
| 最大值 | `max(list)` | `Math.max(...array)` |
| 最小值 | `min(list)` | `Math.min(...array)` |
| 求和 | `sum(list)` | `array.reduce((a, b) => a + b, 0)` |
| 清空 | `list.clear()` | `array.length = 0` |

### 排序

```python
nums = [3, 1, 4, 1, 5]
nums.sort()         # 原地排序
print(nums)         # [1, 1, 3, 4, 5]

names = ["小明", "小红", "小刚"]
sorted_names = sorted(names)   # 返回新列表，不修改原列表
```

JS 对照：

```js
const nums = [3, 1, 4, 1, 5]
nums.sort((a, b) => a - b)  // JS 默认按字符串排序，数字要传比较函数

const names = ['小明', '小红', '小刚']
const sortedNames = [...names].sort()  // 不修改原数组
```

**注意：JS 的 `sort()` 默认按字符串排序，数字排序必须传比较函数。Python 的 `sort()` 对数字直接按数值排序，更合理。**

## 九、列表推导式

这是 Python 的特色语法，可以用一行代码创建新列表。等价于 JS 的 `map()` + `filter()`。

### 基本格式

```python
[表达式 for 变量 in 可迭代对象]
```

### 示例：每个元素乘以 2

Python 列表推导式：

```python
nums = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in nums]

print(doubled)   # [2, 4, 6, 8, 10]
```

JS 对照（map）：

```js
const nums = [1, 2, 3, 4, 5]
const doubled = nums.map(n => n * 2)
```

### 带条件过滤

```python
nums = [1, 2, 3, 4, 5, 6]
evens = [n for n in nums if n % 2 == 0]

print(evens)   # [2, 4, 6]
```

JS 对照（filter）：

```js
const nums = [1, 2, 3, 4, 5, 6]
const evens = nums.filter(n => n % 2 === 0)
```

### map + filter 组合

```python
nums = [1, 2, 3, 4, 5, 6]
doubled_evens = [n * 2 for n in nums if n % 2 == 0]

print(doubled_evens)   # [4, 8, 12]
```

JS 对照：

```js
const doubledEvens = nums.filter(n => n % 2 === 0).map(n => n * 2)
```

### 对照表

| 功能 | Python | JS |
| --- | --- | --- |
| 映射 | `[f(x) for x in list]` | `list.map(x => f(x))` |
| 过滤 | `[x for x in list if cond]` | `list.filter(x => cond)` |
| 映射+过滤 | `[f(x) for x in list if cond]` | `list.filter(...).map(...)` |

列表推导式是 Python 最常用的特性之一，建议熟练掌握。

## 十、浅拷贝与深拷贝

### 列表赋值不是复制

```python
a = [1, 2, 3]
b = a           # b 和 a 指向同一个列表！

b[0] = 99
print(a)        # [99, 2, 3] —— a 也被改了！
```

`b = a` 不是复制列表，而是让 `b` 也指向同一个列表。修改 `b` 会影响 `a`。

JS 一样：

```js
const a = [1, 2, 3]
const b = a        // 同一个数组
b[0] = 99
console.log(a)     // [99, 2, 3]
```

### 浅拷贝

创建一个新列表，但里面的元素仍然是原来的引用：

```python
import copy

a = [1, 2, 3]
b = a.copy()              # 方法 1：list.copy()
c = list(a)               # 方法 2：list() 构造
d = a[:]                  # 方法 3：切片
e = copy.copy(a)          # 方法 4：copy 模块

b[0] = 99
print(a)    # [1, 2, 3] —— a 没变，说明确实复制了
```

JS 对照：

```js
const a = [1, 2, 3]
const b = [...a]          // 展开运算符
const c = a.slice()       // slice()
const d = Array.from(a)   // Array.from()
```

### 浅拷贝的问题：嵌套列表

```python
a = [[1, 2], [3, 4]]
b = a.copy()              # 浅拷贝

b[0][0] = 99
print(a)    # [[99, 2], [3, 4]] —— a 也被改了！
```

浅拷贝只复制了第一层。嵌套的列表仍然是共享的。

理解方式：

```text
浅拷贝后：
a → [  指针1,   指针2  ]
b → [  指针1,   指针2  ]    ← 外层列表不同，但内部指针相同
         ↓        ↓
      [1, 2]   [3, 4]       ← 内层列表是共享的
```

### 深拷贝

完全复制所有层级：

```python
import copy

a = [[1, 2], [3, 4]]
b = copy.deepcopy(a)      # 深拷贝

b[0][0] = 99
print(a)    # [[1, 2], [3, 4]] —— a 没变
print(b)    # [[99, 2], [3, 4]]
```

JS 对照：JS 没有内置深拷贝，常用方式：

```js
const a = [[1, 2], [3, 4]]

// 方法 1：JSON（有限制，不支持函数/undefined/循环引用）
const b = JSON.parse(JSON.stringify(a))

// 方法 2：structuredClone（现代浏览器/Node.js 17+）
const c = structuredClone(a)
```

### 拷贝对照表

| 类型 | Python | JS | 嵌套安全 |
| --- | --- | --- | --- |
| 赋值 | `b = a` | `const b = a` | ❌ |
| 浅拷贝 | `a.copy()` / `a[:]` | `[...a]` / `a.slice()` | ❌ |
| 深拷贝 | `copy.deepcopy(a)` | `structuredClone(a)` | ✅ |

**企业项目中，嵌套数据结构（如列表里放字典）修改前一定要确认是否需要深拷贝。**

## 十一、排序进阶：key 参数

基础排序只能排数字和字符串。实际项目里更常见的是按对象的某个字段排序。

在讲排序之前，先认识一个新语法：**lambda（匿名函数）**。

### 什么是 lambda

`lambda` 就是"一次性小函数"，不需要用 `def` 定义，直接写在表达式里。

```python
# 普通函数
def get_views(article):
    return article["views"]

# 等价的 lambda 写法
get_views = lambda article: article["views"]
```

格式：

```text
lambda 参数: 返回值
```

你可以这样理解：

```text
lambda article: article["views"]
       ↑ 参数      ↑ 返回值
     输入什么    从输入里取什么
```

几个简单例子：

```python
# 取绝对值
f = lambda x: abs(x)
print(f(-5))         # 5

# 取字典的某个键
get_name = lambda user: user["name"]
print(get_name({"name": "小明", "age": 18}))   # 小明

# 两个参数相加
add = lambda a, b: a + b
print(add(3, 5))     # 8
```

**lambda 只能写单个表达式，不能写多行代码。** 如果逻辑复杂，还是用 `def` 定义普通函数。

JS 对照：Python 的 lambda 等价于 JS 的箭头函数（单表达式版本）：

```js
// Python lambda
// lambda article: article["views"]

// JS 箭头函数
const getViews = (article) => article.views
const add = (a, b) => a + b
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 匿名函数 | `lambda x: x + 1` | `(x) => x + 1` |
| 多参数 | `lambda a, b: a + b` | `(a, b) => a + b` |
| 多行逻辑 | ❌ 不行，用 `def` | ✅ 可以用 `{}` |
| 常见用途 | `sort(key=...)`、`map()`、`filter()` | `sort()`、`map()`、`filter()` |

### key 参数怎么用

`sort()` 的 `key` 参数接受一个函数，这个函数对每个元素执行一次，返回一个"比较值"，Python 按这个值排序。

```text
原列表：   [   文章A,    文章B,    文章C   ]
key 函数：  ↓         ↓         ↓
比较值：   [   128,      256,      64     ]
排序结果：  文章C(64) → 文章A(128) → 文章B(256)   ← 按比较值从小到大
```

**不需要自己写比较逻辑，只需要告诉 Python "拿什么来比"。**

### 按字段排序

```python
articles = [
    {"title": "Python 入门", "views": 128},
    {"title": "JS 基础", "views": 256},
    {"title": "Vue 实战", "views": 64},
]

# 按浏览量排序
articles.sort(key=lambda article: article["views"])
print("按浏览量升序：")
for a in articles:
    print(f"  {a['title']}: {a['views']}")
```

输出：

```text
按浏览量升序：
  Vue 实战: 64
  Python 入门: 128
  JS 基础: 256
```

### 降序

```python
# 方法 1：reverse=True
articles.sort(key=lambda a: a["views"], reverse=True)

# 方法 2：取负数（只适用于数字）
articles.sort(key=lambda a: -a["views"])
```

### 按多个字段排序

```python
articles = [
    {"title": "Python 入门", "views": 128, "status": "draft"},
    {"title": "JS 基础", "views": 256, "status": "published"},
    {"title": "Vue 实战", "views": 64, "status": "published"},
    {"title": "CSS 技巧", "views": 128, "status": "draft"},
]

# 先按状态，再按浏览量降序
articles.sort(key=lambda a: (a["status"], -a["views"]))

for a in articles:
    print(f"[{a['status']}] {a['title']}: {a['views']}")
```

输出：

```text
[draft] Python 入门: 128
[draft] CSS 技巧: 128
[published] JS 基础: 256
[published] Vue 实战: 64
```

### 不区分大小写排序

```python
names = ["alice", "Bob", "charlie", "Alice"]

# 默认排序：大写排在小写前面
names.sort()
print(names)   # ['Alice', 'Bob', 'alice', 'charlie']

# 不区分大小写
names.sort(key=str.lower)
print(names)   # ['alice', 'Alice', 'Bob', 'charlie']
```

JS 对照：

```js
const articles = [
  { title: 'Python 入门', views: 128 },
  { title: 'JS 基础', views: 256 },
  { title: 'Vue 实战', views: 64 },
]

// 按浏览量排序
articles.sort((a, b) => a.views - b.views)

// 降序
articles.sort((a, b) => b.views - a.views)

// 按多字段
articles.sort((a, b) => {
  if (a.status !== b.status) return a.status.localeCompare(b.status)
  return b.views - a.views
})
```

Python 的 `key=lambda` 比 JS 的 `(a, b) => a - b` 更直观——你只需要告诉 Python"用什么来比较"，不需要自己写比较逻辑。

## 十二、列表和 JS 数组的核心差异

| 差异 | Python 列表 | JS 数组 |
| --- | --- | --- |
| 添加到末尾 | `append(x)` | `push(x)` |
| 合并列表 | `extend()` | `concat()` / `push(...arr)` |
| 按值删除 | `remove(x)` | `filter()` |
| 切片 | `list[0:3]` | `list.slice(0, 3)` |
| 反转 | `list[::-1]` 或 `reverse()` | `reverse()` |
| 长度 | `len(list)` | `list.length` |
| 映射 | 列表推导式 | `map()` |
| 过滤 | 列表推导式 | `filter()` |
| 查找 | `x in list` | `list.includes(x)` |
| 负数索引 | `list[-1]` | `list.at(-1)` |
| 越界访问 | 报错 | 返回 `undefined` |
| 排序 | `sort()` 默认按数值 | `sort()` 默认按字符串 |

## 十一、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 末尾添加 | `append()` | `push()` | Python 用 append |
| 合并数组 | `extend()` | `concat()` | Python 用 extend |
| 按值删除 | `remove()` | `filter()` | Python 有专门方法 |
| 长度 | `len(list)` | `list.length` | Python 是函数 |
| 判断包含 | `x in list` | `list.includes(x)` | Python 用 in |
| 映射 | 列表推导式 | `map()` | Python 特色 |
| 过滤 | 列表推导式 | `filter()` | Python 特色 |
| 越界 | 报错 | 返回 undefined | Python 更严格 |

## 十二、企业项目实战：文章标签处理

```python
# 模拟从数据库获取的文章标签
raw_tags = ["Python", "JS", "Vue", "python", "js", "Vue"]

# 需求：
# 1. 统一转小写（去重时不分大小写）
# 2. 去重
# 3. 首字母大写显示

# 第一步：统一转小写
lower_tags = [tag.lower() for tag in raw_tags]
print(f"统一小写：{lower_tags}")

# 第二步：去重（用 set）
unique_tags = list(set(lower_tags))
print(f"去重后：{unique_tags}")

# 第三步：首字母大写
display_tags = [tag.capitalize() for tag in unique_tags]
print(f"最终展示：{display_tags}")

# 第四步：排序
display_tags.sort()
print(f"排序后：{display_tags}")
```

JS 对照：

```js
const rawTags = ['Python', 'JS', 'Vue', 'python', 'js', 'Vue']

const lowerTags = rawTags.map(tag => tag.toLowerCase())
console.log('统一小写：', lowerTags)

const uniqueTags = [...new Set(lowerTags)]
console.log('去重后：', uniqueTags)

const displayTags = uniqueTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1))
console.log('最终展示：', displayTags)

displayTags.sort()
console.log('排序后：', displayTags)
```

## 十三、本篇练习

练习一：购物清单。

Python：

```python
shopping_list = ["苹果", "牛奶", "面包"]

print("购物清单：")
for item in shopping_list:
    print("-", item)

print(f"一共有 {len(shopping_list)} 件商品")
```

练习二：数字过滤。

Python：

```python
nums = [12, 5, 8, 3, 20, 15, 7, 10]

# 找出所有大于 10 的数字
big_nums = [n for n in nums if n > 10]
print(f"大于 10 的数：{big_nums}")

# 每个数字乘以 2
doubled = [n * 2 for n in nums]
print(f"乘以 2：{doubled}")
```

JS：

```js
const nums = [12, 5, 8, 3, 20, 15, 7, 10]

const bigNums = nums.filter(n => n > 10)
console.log('大于 10 的数：', bigNums)

const doubled = nums.map(n => n * 2)
console.log('乘以 2：', doubled)
```

练习三：找错误。

```python
# 错误 1：append 添加了整个列表
a = [1, 2]
a.append([3, 4])
print(a)    # [1, 2, [3, 4]]，不是 [1, 2, 3, 4]

# 正确
a = [1, 2]
a.extend([3, 4])
print(a)    # [1, 2, 3, 4]
```

```python
# 错误 2：remove 不存在的元素
tags = ["Python", "JS"]
tags.remove("Vue")   # ValueError!
```

## 本篇小结

1. Python 列表 ≈ JS 数组，用 `[]` 定义。
2. 索引从 0 开始，支持负数索引和切片。
3. `append()` 添加末尾（JS `push()`），`extend()` 合并（JS `concat()`）。
4. `remove()` 按值删除，`pop()` 按索引删除（JS 用 `splice()`）。
5. `len(list)` 获取长度（JS `list.length`）。
6. `x in list` 判断包含（JS `list.includes(x)`）。
7. 列表推导式是 Python 特色，等价于 JS 的 `map()` + `filter()`。
8. `list.sort()` 原地排序，`sorted(list)` 返回新列表。
9. 越界访问 Python 报错，JS 返回 `undefined`。
