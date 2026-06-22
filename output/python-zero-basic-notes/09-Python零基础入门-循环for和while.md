---
title: Python 零基础入门 09：循环 for 和 while
slug: python-zero-loops
summary: 介绍循环的意义，讲解 for、range、while、break、continue 的基础用法，全程对照 JavaScript。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 09：循环 for 和 while

循环就是：**让一段代码重复执行。**

前端 JS 里你天天写循环：

```js
for (let i = 0; i < 5; i++) {
  console.log(i)
}

articles.forEach(article => {
  console.log(article.title)
})
```

Python 也有循环，但写法和 JS 完全不同。

## 一、for 循环基础

Python：

```python
for i in range(5):
    print("学习 Python")
```

运行结果：

```text
学习 Python
学习 Python
学习 Python
学习 Python
学习 Python
```

JS 对照：

```js
for (let i = 0; i < 5; i++) {
  console.log('学习 Python')
}
```

**核心区别：**

1. Python 用 `for ... in range()`，JS 用 `for (初始化; 条件; 步进)`。
2. Python 没有 `i++`，`range()` 自动管理计数。
3. Python 有冒号 `:`，靠缩进控制代码块。

## 二、理解 range()

`range()` 是 Python 循环的核心，需要仔细理解。

### range(n)：从 0 到 n-1

```python
for i in range(5):
    print(i)
```

输出：

```text
0
1
2
3
4
```

产生 0、1、2、3、4，共 5 个数。不包含 5。

### range(start, end)：从 start 到 end-1

```python
for i in range(1, 6):
    print(i)
```

输出：

```text
1
2
3
4
5
```

从 1 开始，到 6 之前结束，不包含 6。和切片 `[1:6]` 规则一样——**包含开始，不包含结束**。

### range(start, end, step)：带步长

```python
for i in range(0, 10, 2):
    print(i)
```

输出：

```text
0
2
4
6
8
```

从 0 开始，每次加 2，到 10 之前结束。

### range 对照 JS

| Python | JS 等价 | 说明 |
| --- | --- | --- |
| `range(5)` | `for (let i = 0; i < 5; i++)` | 0 到 4 |
| `range(1, 6)` | `for (let i = 1; i < 6; i++)` | 1 到 5 |
| `range(0, 10, 2)` | `for (let i = 0; i < 10; i += 2)` | 0, 2, 4, 6, 8 |

Python 的 `range()` 比 JS 的三段式 `for` 更简洁，不容易写出越界 bug。

## 三、遍历列表

Python 最常用的循环方式是遍历列表：

```python
tags = ["Python", "JS", "Vue"]

for tag in tags:
    print(tag)
```

输出：

```text
Python
JS
Vue
```

JS 对照：

```js
const tags = ['Python', 'JS', 'Vue']

for (const tag of tags) {
  console.log(tag)
}

// 或
tags.forEach(tag => {
  console.log(tag)
})
```

对照：

| Python | JS | 说明 |
| --- | --- | --- |
| `for tag in tags:` | `for (const tag of tags)` | 直接遍历元素 |
| 无 | `tags.forEach(tag => ...)` | JS 独有 |
| `for i in range(len(tags)):` | `for (let i = 0; i < tags.length; i++)` | 按索引遍历 |

Python 没有 `forEach` 方法，但 `for ... in` 更简洁。

### 同时获取索引和元素

Python 用 `enumerate()`：

```python
tags = ["Python", "JS", "Vue"]

for index, tag in enumerate(tags):
    print(f"{index}: {tag}")
```

输出：

```text
0: Python
1: JS
2: Vue
```

JS 对照：

```js
const tags = ['Python', 'JS', 'Vue']

tags.forEach((tag, index) => {
  console.log(`${index}: ${tag}`)
})
```

或：

```js
for (const [index, tag] of tags.entries()) {
  console.log(`${index}: ${tag}`)
}
```

## 四、遍历字符串

字符串也可以被循环：

```python
word = "Python"

for char in word:
    print(char)
```

输出：

```text
P
y
t
h
o
n
```

JS 对照：

```js
const word = 'Python'

for (const char of word) {
  console.log(char)
}
```

## 五、while 循环

`while` 的意思是：当条件成立时，一直循环。

Python：

```python
count = 1

while count <= 5:
    print(count)
    count += 1
```

输出：

```text
1
2
3
4
5
```

JS 对照：

```js
let count = 1

while (count <= 5) {
  console.log(count)
  count++
}
```

**注意：每次循环后 `count += 1`，否则条件会一直成立，程序停不下来。**

### for 和 while 怎么选

| 场景 | 推荐 | 例子 |
| --- | --- | --- |
| 明确知道循环次数 | `for` | 遍历列表、重复 N 次 |
| 不知道循环次数 | `while` | 等待用户输入正确内容、轮询状态 |
| 遍历集合 | `for` | 遍历标签、文章列表 |

企业项目里 `for` 用得更多，`while` 主要用于不确定次数的场景。

## 六、小心死循环

下面代码会一直运行：

```python
count = 1

while count <= 5:
    print(count)
    # 忘了 count += 1，永远满足条件
```

Ctrl + C 强制停止。

死循环在企业代码里是严重 bug。确保 `while` 循环里有能让条件变为 `False` 的逻辑。

## 七、break：提前结束循环

```python
for i in range(1, 6):
    if i == 3:
        break
    print(i)
```

输出：

```text
1
2
```

当 `i == 3` 时，`break` 会**结束整个循环**。

JS 对照：

```js
for (let i = 1; i <= 5; i++) {
  if (i === 3) break
  console.log(i)
}
```

用法完全相同。

企业场景：在列表中查找目标，找到了就不再继续。

```python
articles = ["文章A", "文章B", "目标文章", "文章C"]

for article in articles:
    if article == "目标文章":
        print(f"找到了：{article}")
        break
```

## 八、continue：跳过本次循环

```python
for i in range(1, 6):
    if i == 3:
        continue
    print(i)
```

输出：

```text
1
2
4
5
```

当 `i == 3` 时，`continue` 会**跳过本次循环的剩余代码**，继续下一次。

JS 对照：

```js
for (let i = 1; i <= 5; i++) {
  if (i === 3) continue
  console.log(i)
}
```

用法完全相同。

企业场景：过滤掉不需要处理的数据。

```python
tags = ["Python", "", "JS", "  ", "Vue"]

for tag in tags:
    clean_tag = tag.strip()
    if clean_tag == "":
        continue     # 跳过空标签
    print(f"有效标签：{clean_tag}")
```

## 九、for else 语法

Python 有一个 JS 没有的独特语法：`for ... else`。

```python
articles = ["文章A", "文章B", "文章C"]
target = "文章D"

for article in articles:
    if article == target:
        print(f"找到了：{article}")
        break
else:
    print(f"没找到：{target}")
```

输出：

```text
没找到：文章D
```

**`else` 在循环正常结束时执行。如果 `break` 跳出循环，`else` 不执行。**

理解方式：

- `else` 其实是 `nobreak`——"如果没有 break"就执行。
- 适合"查找"场景：找到就 break，没找到就执行 else。

JS 没有这个语法，通常用标志变量：

```js
const articles = ['文章A', '文章B', '文章C']
const target = '文章D'
let found = false

for (const article of articles) {
  if (article === target) {
    console.log(`找到了：${article}`)
    found = true
    break
  }
}

if (!found) {
  console.log(`没找到：${target}`)
}
```

Python 的 `for ... else` 更简洁，但可读性有争议——新手知道有这个语法就行。

## 十、嵌套循环

```python
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i} × {j} = {i * j}")
    print("---")
```

输出：

```text
1 × 1 = 1
1 × 2 = 2
1 × 3 = 3
---
2 × 1 = 2
2 × 2 = 4
2 × 3 = 6
---
3 × 1 = 3
3 × 2 = 6
3 × 3 = 9
---
```

JS 对照：

```js
for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= 3; j++) {
    console.log(`${i} × ${j} = ${i * j}`)
  }
  console.log('---')
}
```

嵌套循环不要太多层，超过 3 层建议重构。

## 十一、循环语法对照总表

| 功能 | Python | JS |
| --- | --- | --- |
| 计数循环 | `for i in range(n):` | `for (let i = 0; i < n; i++)` |
| 遍历列表 | `for item in list:` | `for (const item of list)` |
| 遍历+索引 | `for i, item in enumerate(list):` | `list.forEach((item, i) => ...)` |
| 条件循环 | `while condition:` | `while (condition) {` |
| 提前退出 | `break` | `break` |
| 跳过本次 | `continue` | `continue` |
| 循环后执行 | `for ... else` | 无（用标志变量） |
| 死循环 | `while True:` | `while (true) {` |

## 十二、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| for 循环 | `for i in range(5):` | `for (let i = 0; i < 5; i++)` | Python 用 range |
| 遍历列表 | `for item in list:` | `for (const item of list)` | Python 用 in，JS 用 of |
| 遍历字典 | `for key in dict:` | `for (const key of Object.keys(obj))` | Python 直接遍历 key |
| 没有 i++ | `i += 1` | `i++` | Python 没有 ++ |
| 死循环写法 | `while True:` | `while (true) {` | Python 首字母大写 |
| forEach | 无 | `arr.forEach(...)` | Python 用 for 循环 |
| map | 列表推导式 | `arr.map(...)` | 下篇讲列表时会细说 |

### Python 没有 i++ / i--

```python
i = 0
i++   # SyntaxError!
i--   # SyntaxError!
```

正确：

```python
i += 1
i -= 1
```

这是从 JS 转 Python 最容易写错的地方之一。

## 十三、企业项目实战：批量处理文章标签

```python
# 原始标签数据（模拟从数据库或表单获取）
raw_tags = " Python, JS ,Vue, , React,  Node  "

# 需求：
# 1. 按逗号分割
# 2. 每个标签去空格
# 3. 过滤空标签
# 4. 统计有效标签数量

tag_parts = raw_tags.split(",")
clean_tags = []

for part in tag_parts:
    clean_tag = part.strip()
    if clean_tag == "":
        continue    # 跳过空标签
    clean_tags.append(clean_tag)

print(f"有效标签：{clean_tags}")
print(f"标签数量：{len(clean_tags)}")
print(f"标签字符串：{','.join(clean_tags)}")
```

JS 对照：

```js
const rawTags = ' Python, JS ,Vue, , React,  Node  '

const tagParts = rawTags.split(',')
const cleanTags = []

for (const part of tagParts) {
  const cleanTag = part.trim()
  if (cleanTag === '') continue
  cleanTags.push(cleanTag)
}

console.log('有效标签：', cleanTags)
console.log('标签数量：', cleanTags.length)
console.log('标签字符串：', cleanTags.join(','))
```

## 十四、本篇练习

练习一：1 到 100 求和。

Python：

```python
total = 0

for i in range(1, 101):
    total += i

print(f"1 到 100 的和：{total}")
```

JS：

```js
let total = 0

for (let i = 1; i <= 100; i++) {
  total += i
}

console.log(`1 到 100 的和：${total}`)
```

练习二：九九乘法表。

Python：

```python
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}×{i}={i*j}", end="\t")
    print()
```

练习三：猜数字。

```python
import random

target = random.randint(1, 100)
guess = 0

while guess != target:
    guess = int(input("猜一个数字（1-100）："))

    if guess > target:
        print("太大了")
    elif guess < target:
        print("太小了")
    else:
        print("猜对了！")
```

练习四：找错误。

```python
# 错误 1：range 参数不对
for i in range(5, 1):    # 不会执行！range(5, 1) 是空的
    print(i)
```

`range(5, 1)` 从 5 到 1，但步长默认是 1（递增），所以 5 永远到不了 1，循环体不执行。如果需要倒序，用 `range(5, 1, -1)`。

```python
# 错误 2：while 死循环
count = 1
while count <= 5:
    print(count)
    # 忘了 count += 1
```

```python
# 错误 3：用 for 修改列表元素
tags = ["Python", "JS"]
for tag in tags:
    tag = tag.upper()     # 没用！tag 是临时变量，不影响原列表
print(tags)               # 仍然是 ["Python", "JS"]
```

正确做法：

```python
tags = ["Python", "JS"]
new_tags = []

for tag in tags:
    new_tags.append(tag.upper())

print(new_tags)  # ["PYTHON", "JS"]
```

## 本篇小结

1. Python `for` 循环用 `for i in range(n):`，JS 用 `for (let i = 0; i < n; i++)`。
2. `range(n)` 产生 0 到 n-1，`range(a, b)` 产生 a 到 b-1。
3. Python 遍历列表用 `for item in list:`，JS 用 `for (const item of list)`。
4. Python 同时获取索引和值用 `enumerate()`。
5. `while` 用于不确定次数的循环，注意避免死循环。
6. `break` 结束整个循环，`continue` 跳过本次——Python 和 JS 相同。
7. Python 有 `for ... else` 语法，JS 没有。
8. Python 没有 `i++` / `i--`，只能用 `i += 1` / `i -= 1`。
9. Python 死循环写 `while True:`，JS 写 `while (true) {`。
