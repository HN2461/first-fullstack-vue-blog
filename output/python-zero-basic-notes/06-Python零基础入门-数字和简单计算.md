---
title: Python 零基础入门 06：数字和简单计算
slug: python-zero-numbers-and-operators
summary: 介绍整数、小数、加减乘除、取余、整除、幂运算和赋值运算，帮助新手理解 Python 如何进行简单计算，全程对照 JavaScript。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 06：数字和简单计算

Python 可以像计算器一样做计算。

在前端 JS 里你也天天做计算：

```js
const total = price * count
const discount = total * 0.9
const pages = Math.ceil(totalItems / pageSize)
```

Python 里也一样，只是有些运算符不同。

## 一、Python 的两种数字类型

Python 里数字主要有两种类型：

| 类型 | Python 名称 | 举例 | 说明 |
| --- | --- | --- | --- |
| 整数 | `int` | `10`, `0`, `-3`, `999999` | 没有小数点 |
| 小数 | `float` | `3.14`, `0.5`, `-1.0` | 有小数点 |

Python：

```python
age = 25            # int
price = 19.9        # float
count = 0           # int
ratio = 0.0         # float（虽然值是 0，但有 .0 就是 float）
```

查看类型：

```python
print(type(25))     # <class 'int'>
print(type(19.9))   # <class 'float'>
```

JS 对照：

```js
const age = 25          // number
const price = 19.9      // number
```

```js
console.log(typeof 25)      // 'number'
console.log(typeof 19.9)    // 'number'
```

**核心区别：**

1. Python 区分 `int` 和 `float`，整数和小数是不同的类型。
2. JS 只有一种 `number` 类型（64 位浮点数），不区分整数和小数。
3. Python 的 `int` 没有大小上限，可以表示任意大的整数。
4. JS 的 `number` 有安全整数范围 `Number.MAX_SAFE_INTEGER`（2^53 - 1），超过就不安全了。

### Python int 的"无限大"

```python
big = 10 ** 100
print(big)
```

输出（1 后面 100 个 0）：

```text
10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
```

Python 不会溢出，JS 就不行：

```js
const big = 10 ** 100
console.log(big)  // 1e+100（精度丢失）
```

前端一般不太需要超大整数，但后端处理 ID、金额等场景就可能遇到。

## 二、加减乘除

Python：

```python
print(10 + 3)   # 13
print(10 - 3)   # 7
print(10 * 3)   # 30
print(10 / 3)   # 3.3333333333333335
```

JS：

```js
console.log(10 + 3)   // 13
console.log(10 - 3)   // 7
console.log(10 * 3)   // 30
console.log(10 / 3)   // 3.3333333333333335
```

符号含义：

| 运算 | 符号 | 说明 |
| --- | --- | --- |
| 加法 | `+` | 和数学一样 |
| 减法 | `-` | 和数学一样 |
| 乘法 | `*` | 不是 `×`，是英文星号 |
| 除法 | `/` | 结果总是小数 |

**核心区别：Python 的除法 `/` 结果总是 float，即使能整除：**

```python
print(10 / 2)   # 5.0（不是 5！）
print(10 / 5)   # 2.0（不是 2！）
```

JS 的除法不会这样：

```js
console.log(10 / 2)  // 5（不是 5.0）
console.log(10 / 5)  // 2（不是 2.0）
```

这个区别在写后端接口时要注意——如果前端期望返回整数，Python 返回 `5.0` 可能会导致类型不匹配。

## 三、整除 //

整除使用 `//`，结果只保留整数部分。

```python
print(10 // 3)   # 3
print(10 // 2)   # 5
print(7 // 2)    # 3
```

整除在企业项目里的常见用途：

1. 分页计算：`total_pages = total_items // page_size`
2. 计算小时数：`hours = total_minutes // 60`
3. 计算周数：`weeks = total_days // 7`

```python
total_items = 53
page_size = 10
total_pages = total_items // page_size

print(f"总页数：{total_pages}")
```

输出：

```text
总页数：5
```

等等，53 条数据，每页 10 条，应该是 6 页才对！整除丢掉了余数。

正确做法（有余数就加 1 页）：

```python
total_pages = (total_items + page_size - 1) // page_size
# 或更直观的写法
import math
total_pages = math.ceil(total_items / page_size)
```

JS 对照：

```js
console.log(Math.floor(10 / 3))  // 3（JS 用 Math.floor 模拟整除）
console.log(Math.floor(10 / 2))  // 5
```

JS 没有专门的整除运算符，通常用 `Math.floor()`。

分页计算：

```js
const totalPages = Math.ceil(totalItems / pageSize)
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 整除 | `10 // 3` | `Math.floor(10 / 3)` |
| 向上取整 | `math.ceil(10 / 3)` | `Math.ceil(10 / 3)` |
| 向下取整 | `math.floor(10 / 3)` | `Math.floor(10 / 3)` |

## 四、取余 %

取余使用 `%`，表示除完之后剩多少。

```python
print(10 % 3)   # 1
print(10 % 2)   # 0
print(7 % 3)    # 1
```

理解方式：10 除以 3，商 3 余 1，所以 `10 % 3` 是 1。

取余的常见用途：

### 1. 判断奇偶数

```python
number = 8
if number % 2 == 0:
    print("偶数")
else:
    print("奇数")
```

JS：

```js
const number = 8
if (number % 2 === 0) {
  console.log('偶数')
} else {
  console.log('奇数')
}
```

### 2. 判断是否整除

```python
if total_items % page_size == 0:
    print("刚好整页")
else:
    print("最后一页不满")
```

### 3. 循环计数取余

```python
# 每 3 个一组
for i in range(10):
    if i % 3 == 0:
        print(f"第 {i} 个，新的一组")
```

### 4. 时间换算

```python
total_seconds = 3725
minutes = total_seconds // 60   # 62
seconds = total_seconds % 60    # 5

print(f"{minutes} 分 {seconds} 秒")
```

JS 取余符号一样：

```js
console.log(10 % 3)  // 1
console.log(10 % 2)  // 0
```

取余运算在 Python 和 JS 里语法完全相同，用法也一样。

## 五、幂运算 **

幂运算使用 `**`。

```python
print(2 ** 3)    # 8（2 的 3 次方：2 × 2 × 2）
print(2 ** 10)   # 1024
print(3 ** 2)    # 9
print(10 ** 0)   # 1（任何数的 0 次方都是 1）
```

企业场景：

```python
# 计算 1 MB 等于多少字节
mb = 1
bytes_per_mb = mb * 1024 ** 2    # 1048576
print(f"1 MB = {bytes_per_mb} 字节")
```

JS 对照：

```js
console.log(2 ** 3)    // 8（ES2016 引入的幂运算符）
console.log(Math.pow(2, 3))  // 8（老写法）
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 幂运算 | `2 ** 3` | `2 ** 3` 或 `Math.pow(2, 3)` |

语法完全相同。不过老项目里 JS 可能用 `Math.pow()`。

## 六、运算顺序

Python 也遵守数学顺序：先乘除，后加减。

```python
print(2 + 3 * 4)   # 14（先算 3*4=12，再加 2）
```

如果想先算加法，可以加括号：

```python
print((2 + 3) * 4)  # 20
```

完整优先级（从高到低）：

| 优先级 | 运算 | 举例 |
| --- | --- | --- |
| 1（最高） | `()` | `(2 + 3) * 4` |
| 2 | `**` | `2 ** 3` |
| 3 | `*` `/` `//` `%` | `10 // 3 + 1` |
| 4（最低） | `+` `-` | `2 + 3 * 4` |

和数学一样，不确定的时候加括号最稳妥。

JS 的运算优先级完全相同。

## 七、变量参与计算

```python
price = 20
count = 3
total = price * count

print(total)   # 60
```

这比直接写 `20 * 3` 更清楚，因为变量名说明了含义。

企业场景——文章统计：

```python
article_count = 128
page_size = 10
total_pages = (article_count + page_size - 1) // page_size

print(f"共 {article_count} 篇文章，每页 {page_size} 篇，共 {total_pages} 页")
```

JS：

```js
const articleCount = 128
const pageSize = 10
const totalPages = Math.ceil(articleCount / pageSize)

console.log(`共 ${articleCount} 篇文章，每页 ${pageSize} 篇，共 ${totalPages} 页`)
```

## 八、简写赋值

假设你有一个分数：

```python
score = 10
score = score + 5
print(score)   # 15
```

可以简写成：

```python
score = 10
score += 5
print(score)   # 15
```

常见简写：

| 简写 | 等价于 | 说明 |
| --- | --- | --- |
| `+=` | `x = x + n` | 加后再赋值 |
| `-=` | `x = x - n` | 减后再赋值 |
| `*=` | `x = x * n` | 乘后再赋值 |
| `/=` | `x = x / n` | 除后再赋值 |
| `//=` | `x = x // n` | 整除后再赋值 |
| `%=` | `x = x % n` | 取余后再赋值 |
| `**=` | `x = x ** n` | 幂运算后再赋值 |

JS 也有同样的简写：

```js
let score = 10
score += 5
console.log(score)  // 15
```

**Python 比 JS 多了 `//=` 和 `**=`**，因为 Python 有专门的整除和幂运算符。

## 九、数字类型转换

### int 和 float 互转

```python
# float 转 int（截断小数部分，不是四舍五入）
x = int(3.9)
print(x)         # 3

# int 转 float
y = float(5)
print(y)         # 5.0
```

**注意：`int()` 是截断，不是四舍五入！**

```python
print(int(3.9))   # 3（不是 4！）
print(int(3.1))   # 3
print(int(-3.9))  # -3（向 0 截断）
```

四舍五入用 `round()`：

```python
print(round(3.9))   # 4
print(round(3.1))   # 3
print(round(3.5))   # 4
print(round(2.5))   # 2（Python 银行家舍入，.5 时取偶数）
```

### 字符串转数字

```python
age_str = "25"
age = int(age_str)
print(age + 1)    # 26

price_str = "19.9"
price = float(price_str)
print(price * 2)  # 39.8
```

### 数字转字符串

```python
age = 25
age_str = str(age)
print("年龄：" + age_str)   # 年龄：25
```

或用 f-string：

```python
print(f"年龄：{age}")   # 不需要手动转 str
```

JS 对照：

```js
// 字符串转数字
const ageStr = '25'
const age = parseInt(ageStr, 10)     // 25
const price = parseFloat('19.9')     // 19.9
const num = Number('25')             // 25
const num2 = +'25'                   // 25（一元加号，不推荐）

// 数字转字符串
const age = 25
const ageStr = String(age)           // '25'
const ageStr2 = age.toString()       // '25'
```

对照表：

| 功能 | Python | JS |
| --- | --- | --- |
| 字符串转整数 | `int("25")` | `parseInt("25", 10)` |
| 字符串转小数 | `float("19.9")` | `parseFloat("19.9")` |
| 数字转字符串 | `str(25)` | `String(25)` 或 `25.toString()` |
| 四舍五入 | `round(3.5)` | `Math.round(3.5)` |

高频踩坑：

```python
age_str = "25"
print(age_str + 1)  # TypeError! 字符串不能直接加数字
```

必须先转：

```python
age = int(age_str)
print(age + 1)  # 26
```

JS 里字符串加数字是拼接而不是报错：

```js
const ageStr = '25'
console.log(ageStr + 1)  // '251'（字符串拼接，不是数学加法！）
```

这是 JS 最经典的坑之一。Python 更严格，不允许隐式拼合，反而更安全。

## 十、小数精度问题

运行下面代码：

```python
print(0.1 + 0.2)
```

输出：

```text
0.30000000000000004
```

这不是你写错了，也不是 Python 的 bug，而是计算机用二进制表示小数时的固有问题。

JS 里完全一样：

```js
console.log(0.1 + 0.2)  // 0.30000000000000004
```

这在做金额计算时要特别小心。

### 解决方案：金额用整数（分）

企业项目中最常见的做法：用**分**作为单位存储，避免小数。

```python
# 价格以分为单位
price_fen = 1990   # 19.90 元
count = 3
total_fen = price_fen * count   # 5970 分

# 展示时转换
print(f"总价：{total_fen / 100} 元")  # 总价：59.7 元
```

### 其他方案

1. `round()` 四舍五入：`round(0.1 + 0.2, 2)` → `0.3`
2. `decimal` 模块（精确小数，适合金额）：

```python
from decimal import Decimal

price = Decimal("19.90")
total = price * 3
print(total)   # 59.70（精确）
```

新手阶段先知道 `round()` 和"用分做单位"两种方式就行，`decimal` 后面会细讲。

## 十一、数学函数

Python 常用数学函数需要 `import math`：

```python
import math

print(math.ceil(3.1))     # 4（向上取整）
print(math.floor(3.9))    # 3（向下取整）
print(math.sqrt(16))      # 4.0（平方根）
print(math.pi)            # 3.141592653589793
print(abs(-5))            # 5（绝对值，不需要 import）
```

JS 对照：

```js
console.log(Math.ceil(3.1))     // 4
console.log(Math.floor(3.9))    // 3
console.log(Math.sqrt(16))      // 4
console.log(Math.PI)            // 3.141592653589793
console.log(Math.abs(-5))       // 5
```

对照表：

| 功能 | Python | JS |
| --- | --- | --- |
| 向上取整 | `math.ceil(3.1)` | `Math.ceil(3.1)` |
| 向下取整 | `math.floor(3.9)` | `Math.floor(3.9)` |
| 平方根 | `math.sqrt(16)` | `Math.sqrt(16)` |
| 绝对值 | `abs(-5)`（内置函数） | `Math.abs(-5)` |
| 圆周率 | `math.pi` | `Math.PI` |
| 最大值 | `max(1, 2, 3)`（内置函数） | `Math.max(1, 2, 3)` |
| 最小值 | `min(1, 2, 3)`（内置函数） | `Math.min(1, 2, 3)` |

注意 Python 的 `abs()`、`max()`、`min()` 是内置函数，不需要 `import math`。

## 十二、运算符对照总表

| 功能 | Python | JS |
| --- | --- | --- |
| 加法 | `+` | `+` |
| 减法 | `-` | `-` |
| 乘法 | `*` | `*` |
| 除法 | `/`（结果总是 float） | `/`（结果可能是整数） |
| 整除 | `//` | `Math.floor(a / b)` |
| 取余 | `%` | `%` |
| 幂运算 | `**` | `**` 或 `Math.pow()` |
| 加等 | `+=` | `+=` |
| 减等 | `-=` | `-=` |
| 乘等 | `*=` | `*=` |
| 除等 | `/=` | `/=` |
| 整除等 | `//=` | 无 |
| 取余等 | `%=` | `%=` |
| 幂等 | `**=` | 无 |

## 十三、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 除法结果 | `10 / 2` → `5.0` | `10 / 2` → `5` | Python `/` 总返回 float |
| 整除运算符 | `//` | `Math.floor()` | Python 有专门运算符 |
| 字符串+数字 | 报错 TypeError | 隐式拼接 `'251'` | Python 更严格 |
| 幂运算 | `**` | `**` 或 `Math.pow()` | Python 和 JS 都支持 `**` |
| 数字类型 | `int` 和 `float` 分开 | 只有 `number` | Python 更细分 |
| 大整数 | 无上限，不溢出 | 超过 2^53 不安全 | Python 更安全 |
| 四舍五入 | `round()`（内置） | `Math.round()` | Python 内置，JS 在 Math 里 |
| 绝对值 | `abs()`（内置） | `Math.abs()` | Python 内置，JS 在 Math 里 |
| 最大最小值 | `max()` / `min()`（内置） | `Math.max()` / `Math.min()` | Python 内置，JS 在 Math 里 |

## 十四、企业项目实战：分页计算

后端接口经常需要分页计算：

```python
# 分页参数
total_items = 153
page_size = 10
current_page = 3

# 计算总页数
total_pages = (total_items + page_size - 1) // page_size

# 计算跳过多少条（数据库查询偏移量）
skip = (current_page - 1) * page_size

# 计算本页有多少条
if current_page < total_pages:
    page_items = page_size
else:
    page_items = total_items - (current_page - 1) * page_size

print(f"总条数：{total_items}")
print(f"每页条数：{page_size}")
print(f"总页数：{total_pages}")
print(f"当前页：{current_page}")
print(f"跳过条数：{skip}")
print(f"本页条数：{page_items}")
```

输出：

```text
总条数：153
每页条数：10
总页数：16
当前页：3
跳过条数：20
本页条数：10
```

JS 对照：

```js
const totalItems = 153
const pageSize = 10
const currentPage = 3

const totalPages = Math.ceil(totalItems / pageSize)
const skip = (currentPage - 1) * pageSize

console.log(`总条数：${totalItems}`)
console.log(`每页条数：${pageSize}`)
console.log(`总页数：${totalPages}`)
console.log(`跳过条数：${skip}`)
```

## 十五、本篇练习

练习一：计算购物总价。

Python：

```python
book_price = 35
book_count = 4
total_price = book_price * book_count

print(f"单价：{book_price} 元")
print(f"数量：{book_count} 本")
print(f"总价：{total_price} 元")
```

JS：

```js
const bookPrice = 35
const bookCount = 4
const totalPrice = bookPrice * bookCount

console.log(`单价：${bookPrice} 元`)
console.log(`数量：${bookCount} 本`)
console.log(`总价：${totalPrice} 元`)
```

练习二：时间换算。

Python：

```python
total_seconds = 3725

hours = total_seconds // 3600
minutes = (total_seconds % 3600) // 60
seconds = total_seconds % 60

print(f"{hours} 时 {minutes} 分 {seconds} 秒")
```

JS：

```js
const totalSeconds = 3725

const hours = Math.floor(totalSeconds / 3600)
const minutes = Math.floor((totalSeconds % 3600) / 60)
const seconds = totalSeconds % 60

console.log(`${hours} 时 ${minutes} 分 ${seconds} 秒`)
```

练习三：判断奇偶。

Python：

```python
number = 7

if number % 2 == 0:
    print(f"{number} 是偶数")
else:
    print(f"{number} 是奇数")
```

JS：

```js
const number = 7

if (number % 2 === 0) {
  console.log(`${number} 是偶数`)
} else {
  console.log(`${number} 是奇数`)
}
```

## 本篇小结

1. Python 数字分 `int`（整数）和 `float`（小数），JS 只有 `number`。
2. Python `int` 无大小上限，JS `number` 超过 2^53 不安全。
3. Python 除法 `/` 总返回 float，`10 / 2` 是 `5.0`。
4. Python 整除用 `//`，JS 用 `Math.floor()`。
5. Python 取余 `%` 和 JS 相同。
6. Python 幂运算 `**` 和 JS 相同。
7. Python 字符串+数字会报错，JS 会隐式拼接——Python 更严格更安全。
8. Python 四舍五入用 `round()`，绝对值用 `abs()`，最大最小值用 `max()` / `min()`——都是内置函数。
9. JS 这些都在 `Math` 对象里：`Math.round()`、`Math.abs()`、`Math.max()`。
10. 小数精度问题 Python 和 JS 都有，金额建议用整数（分）或 `decimal` 模块。
