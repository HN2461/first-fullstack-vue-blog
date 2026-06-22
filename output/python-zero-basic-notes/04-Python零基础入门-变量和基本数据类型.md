---
title: Python 零基础入门 04：变量和基本数据类型
slug: python-zero-variables-and-types
summary: 从最底层解释变量、赋值、命名规则、字符串、整数、小数、布尔值、None 和类型查看，并逐项对照 JavaScript 的 const/let、string、number、boolean、null、undefined 和 typeof。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 04：变量和基本数据类型

变量和数据类型是后面所有 Python 代码的基础。

你写接口、写脚本、处理文章、读取配置、操作数据库，都会不停遇到：

```python
title = "Python 入门"
views = 100
is_published = False
published_at = None
```

前端 JS 里你也天天写：

```js
const title = 'Python 入门'
const views = 100
const isPublished = false
const publishedAt = null
```

它们看起来很像，但又有很多容易混的地方。

这一篇要解决：

1. 变量到底是什么。
2. Python 变量怎么定义。
3. Python 和 JS 的变量声明差异。
4. 变量名怎么起。
5. Python 常见基础类型：`str`、`int`、`float`、`bool`、`None`。
6. JS 对应类型：`string`、`number`、`boolean`、`null`、`undefined`。
7. 怎么查看类型。
8. 类型之间怎么转换。
9. 企业项目里类型为什么非常重要。

## 一、变量是什么

变量可以先理解成：**给一个数据起名字。**

比如：

```python
name = "小明"
```

意思是：

```text
把"小明"这个值保存起来，并给它起名叫 name。
```

后面你再写：

```python
print(name)
```

Python 就会找到 `name` 保存的值，然后输出：

```text
小明
```

### 更准确的理解：变量是"标签"而不是"容器"

很多教程会把变量比作"装东西的盒子"。这个比喻不太准确。

更准确的比喻是：**变量是一张贴在数据上的标签（名字贴）。**

```python
name = "小明"
```

这句代码做的事是：

1. 在内存里创建了一个字符串 `"小明"`
2. 给这个字符串贴上一个标签，标签上写着 `name`

当你写 `print(name)` 的时候，Python 根据 `name` 这个标签找到它指向的数据，然后输出。

为什么这个比喻重要？因为你后面会遇到这样的情况：

```python
a = [1, 2, 3]
b = a
```

这里 `a` 和 `b` 指向的是**同一个列表**，不是两个独立的副本。修改 `b` 也会影响 `a`。这个后面讲列表时会展开，现在只要先建立"变量是标签"的概念。

JS 里也一样：

```js
const a = [1, 2, 3]
const b = a  // b 和 a 指向同一个数组
```

JS 的变量也是"标签"而不是"容器"。

### `=` 是赋值，不是"等于"

代码里的 `=` 不是数学里的"相等"，而是"赋值"。

```python
age = 18
```

意思是：

```text
把 18 赋给变量 age。
```

如果要比较两个值是否相等，用 `==`：

```python
print(age == 18)  # True，判断 age 是否等于 18
```

这个区别在 Python 和 JS 里都一样。

JS 对照：

```js
const age = 18       // 赋值
console.log(age === 18)  // 比较，JS 推荐用 ===
```

| 运算符 | Python | JS | 含义 |
| --- | --- | --- | --- |
| 赋值 | `=` | `=` | 把右边的值赋给左边的变量 |
| 判断相等 | `==` | `==` 或 `===` | 比较两边的值是否相等 |
| 判断不等 | `!=` | `!=` 或 `!==` | 比较两边的值是否不相等 |

**注意**：JS 有 `==`（宽松比较，会自动转换类型）和 `===`（严格比较，不转换类型）。Python 只有 `==`，不存在 `===`，因为 Python 的 `==` 本身就是严格比较。

JS 对照：

```js
1 == '1'   // true（JS 自动转换类型后比较）
1 === '1'  // false（不转换类型，数字和字符串不相等）
```

Python：

```python
1 == '1'   # False（Python 不会自动转换类型来比较）
```

JS 对照：

```js
const name = '小明'
console.log(name)
```

相同点：

1. 变量都是给数据起名字。
2. 变量可以让数据重复使用。
3. 变量能让代码更容易维护。
4. 变量名应该表达业务含义。

核心区别：

1. Python 定义变量不需要 `let` / `const`。
2. JS 定义变量通常需要 `const` 或 `let`。
3. Python 更常用下划线命名。
4. JS 更常用小驼峰命名。

## 二、Python 变量赋值

Python 变量赋值格式：

```python
变量名 = 值
```

示例：

```python
name = "小明"
age = 18
city = "上海"
```

这里有三个变量：

| 变量名 | 保存的值 | 类型 |
| --- | --- | --- |
| `name` | `"小明"` | 字符串 str |
| `age` | `18` | 整数 int |
| `city` | `"上海"` | 字符串 str |

Python 的赋值方向是从右到左：先计算右边的值，然后把结果赋给左边的变量。

```python
x = 10 + 5
```

Python 先计算 `10 + 5` 得到 `15`，然后把 `15` 赋给 `x`。

### 同时赋值多个变量

Python 支持一行给多个变量赋值：

```python
x, y, z = 1, 2, 3
```

等价于：

```python
x = 1
y = 2
z = 3
```

也可以给多个变量赋同一个值：

```python
a = b = c = 0
```

JS 也支持类似写法，但不常用：

```js
let x = 1, y = 2, z = 3
```

JS 对照：

```js
const name = '小明'
let age = 18
const city = '上海'
```

JS 常见变量声明：

| 关键字 | 含义 | 使用建议 |
| --- | --- | --- |
| `const` | 变量名不能重新赋值 | 默认首选 |
| `let` | 变量后续可以重新赋值 | 需要变化时用 |
| `var` | 老写法，有作用域问题 | 新项目一般少用 |

如果你对 `const` 和 `let` 的区别还不太清楚：

- `const age = 18` → 之后不能写 `age = 19`，会报错
- `let age = 18` → 之后可以写 `age = 19`，没问题
- 日常开发推荐默认用 `const`，只有确实需要变化的变量才用 `let`

**Python 没有 `const` 和 `let` 的区分**，所有变量都可以重新赋值。

高频踩坑：

Python 里不要写：

```python
const name = "小明"
```

这是 JS 写法，Python 不认识 `const`。

JS 里现代项目不要随便写：

```js
name = '小明'
```

不声明直接赋值虽然不会报错，但会创建全局变量，可能导致 bug。应该明确声明：

```js
const name = '小明'
```

## 三、变量为什么有用

不用变量：

```python
print("小明")
print("小明")
print("小明")
```

如果要把"小明"改成"小红"，要改三处。

使用变量：

```python
name = "小明"

print(name)
print(name)
print(name)
```

只需要改一处：

```python
name = "小红"
```

变量的价值：

1. 减少重复。
2. 方便修改。
3. 提高可读性。
4. 让数据和逻辑分离。

企业项目中很常见：

```python
article_status = "draft"
print(f"当前文章状态：{article_status}")
```

JS 对照：

```js
const articleStatus = 'draft'
console.log(`当前文章状态：${articleStatus}`)
```

## 四、变量命名规则

Python 变量名可以包含：

1. 字母（包括中文，但不推荐）。
2. 数字。
3. 下划线 `_`。

但不能以数字开头。

正确：

```python
name = "小明"
user_name = "小明"
user1 = "小明"
_user = "内部用户"
```

错误：

```python
1user = "小明"     # 以数字开头，不允许
user-name = "小明" # 里的 - 会被理解成减号
user name = "小明" # 中间有空格，不允许
class = "小明"     # class 是 Python 关键字，不允许
```

原因：

1. `1user` 以数字开头，不允许。
2. `user-name` 里的 `-` 会被理解成减号。
3. `user name` 中间有空格，不允许。
4. `class` 是 Python 保留关键字，不允许当变量名。

### Python 常见关键字

这些词 Python 已经占用了，不能当变量名：

```python
# 常见关键字（不用背，报错了再查）
if, else, elif, for, while, def, class, return, import, from, 
True, False, None, and, or, not, in, is, with, try, except, 
finally, raise, pass, break, continue, lambda, yield, del, 
global, nonlocal, assert, async, await
```

JS 也有类似的关键字限制：`if`, `else`, `for`, `while`, `function`, `return`, `class`, `true`, `false`, `null` 等也不能当变量名。

JS 对照：

```js
const name = '小明'
const userName = '小明'
const user1 = '小明'
const _user = '内部用户'
```

JS 也不能写：

```js
const 1user = '小明'
const user-name = '小明'
const user name = '小明'
```

相同点：

1. 都不能以数字开头。
2. 都不能包含空格。
3. `-` 不能用于普通变量名。
4. 变量名要避开语言关键字。

核心区别：

1. Python 推荐 `user_name`（下划线命名/蛇形命名）。
2. JS 推荐 `userName`（小驼峰命名）。
3. Python 不需要声明关键字。
4. JS 通常需要 `const` / `let`。

## 五、变量命名风格

Python 推荐下划线命名（也叫蛇形命名 snake_case）：

```python
user_name = "小明"
article_title = "Python 入门"
total_price = 99.5
is_admin = True
```

JS 推荐小驼峰（camelCase）：

```js
const userName = '小明'
const articleTitle = 'Python 入门'
const totalPrice = 99.5
const isAdmin = true
```

对照：

| 含义 | Python 推荐 | JS 推荐 |
| --- | --- | --- |
| 用户名 | `user_name` | `userName` |
| 文章标题 | `article_title` | `articleTitle` |
| 总价格 | `total_price` | `totalPrice` |
| 是否管理员 | `is_admin` | `isAdmin` |
| 最大重试次数 | `max_retry_count` | `maxRetryCount` |
| 默认页大小 | `default_page_size` | `defaultPageSize` |

**这个命名风格差异非常容易混**。新手常犯的错误：

- 在 Python 里写 `userName`（应该写 `user_name`）
- 在 JS 里写 `user_name`（应该写 `userName`）

虽然不影响程序运行，但不符合团队约定，别人读代码会觉得别扭。

不要这样写：

```python
a = "小明"
b = "Python 入门"
c = 99.5
```

短代码里也许能看懂，项目大了会非常痛苦。

企业项目里，变量名要尽量做到：

1. 见名知意。
2. 不用拼音缩写。
3. 不用无意义单字母。
4. 同一个项目风格统一。

## 六、变量可以重新赋值

Python 变量可以重新赋值。

```python
age = 18
print(age)

age = 19
print(age)
```

输出：

```text
18
19
```

文章状态示例：

```python
article_status = "draft"
article_status = "published"
```

JS 对照：

```js
let age = 18
console.log(age)

age = 19
console.log(age)
```

如果 JS 用 `const`：

```js
const age = 18
age = 19  // 报错！Assignment to constant variable
```

相同点：

1. Python 普通变量可以重新赋值。
2. JS 的 `let` 变量可以重新赋值。
3. 重新赋值后，后续读取的是新值。

核心区别：

1. Python 没有 `let` / `const` 的语法区分。
2. JS 推荐默认用 `const`，需要变化时才用 `let`。
3. Python 常量更多靠命名约定。
4. JS `const` 是语法层面禁止重新赋值。

Python 常量约定：

```python
MAX_RETRY_COUNT = 3
DEFAULT_PAGE_SIZE = 20
PI = 3.14159
```

全大写+下划线的变量名表示"这是常量，不应该被修改"。虽然技术上还能改，但团队约定上不应该改。

## 七、基本数据类型是什么

变量保存的数据有不同类型。

Python：

```python
name = "小明"
age = 18
height = 1.75
is_admin = False
published_at = None
```

这些值不是同一种类型。

| 变量 | 值 | Python 类型 | 含义 |
| --- | --- | --- | --- |
| `name` | `"小明"` | `str` | 字符串 |
| `age` | `18` | `int` | 整数 |
| `height` | `1.75` | `float` | 浮点数/小数 |
| `is_admin` | `False` | `bool` | 布尔值 |
| `published_at` | `None` | `NoneType` | 空值 |

JS：

```js
const name = '小明'
const age = 18
const height = 1.75
const isAdmin = false
const publishedAt = null
```

| 变量 | 值 | JS 类型 | 含义 |
| --- | --- | --- | --- |
| `name` | `'小明'` | `string` | 字符串 |
| `age` | `18` | `number` | 数字 |
| `height` | `1.75` | `number` | 数字 |
| `isAdmin` | `false` | `boolean` | 布尔值 |
| `publishedAt` | `null` | `object`（历史遗留） | 空值 |

**类型对照总表：**

| 含义 | Python 类型 | JS 类型 | Python 示例 | JS 示例 |
| --- | --- | --- | --- | --- |
| 字符串 | `str` | `string` | `"小明"` | `'小明'` |
| 整数 | `int` | `number` | `18` | `18` |
| 小数 | `float` | `number` | `1.75` | `1.75` |
| 布尔值 | `bool` | `boolean` | `True` / `False` | `true` / `false` |
| 空值 | `NoneType` | `object`（坑） | `None` | `null` |
| 未定义 | 不存在 | `undefined` | 不存在 | `undefined` |

为什么要区分类型？

因为不同类型能做的事不同。

数字可以计算：

```python
print(age + 1)
```

字符串可以拼接：

```python
print("姓名：" + name)
```

布尔值可以判断：

```python
if is_admin:
    print("管理员")
```

类型搞错，程序就会出问题。

## 八、字符串 str

Python 字符串类型叫 `str`。

```python
name = "小明"
title = "Python 入门"
city = "上海"
phone = "13800138000"
```

字符串适合保存：

1. 用户名。
2. 文章标题。
3. 手机号。
4. 邮箱。
5. 地址。
6. 状态文本。
7. 错误信息。
8. 接口返回的文本字段。

注意：手机号虽然看起来是数字，但通常应该用字符串保存。

```python
phone = "13800138000"
```

因为手机号不是用来做数学计算的，而且可能有前导零、区号等情况。如果用整数保存，前导零就丢了。

JS 对照：

```js
const name = '小明'
const title = 'Python 入门'
const phone = '13800138000'
```

相同点：

1. 都用字符串保存文本。
2. 手机号、身份证号、订单号通常也保存为字符串。
3. 字符串可以输出、拼接、截取、查找。

核心区别：

1. Python 类型名是 `str`。
2. JS 类型名是 `string`。
3. Python 格式化推荐 f-string。
4. JS 格式化推荐模板字符串。

## 九、整数 int

Python 整数类型是 `int`。

```python
age = 18
count = 100
page_size = 20
retry_count = 3
```

整数适合保存：

1. 年龄。
2. 数量。
3. 页码。
4. 每页条数。
5. 重试次数。
6. 阅读量。
7. 点赞数。
8. 评论数。

整数可以做计算：

```python
count = 10
print(count + 1)
print(count - 2)
print(count * 3)
```

JS 对照：

```js
const count = 10
console.log(count + 1)
console.log(count - 2)
console.log(count * 3)
```

核心区别：

1. Python 整数是 `int`。
2. JS 普通数字是 `number`。
3. Python `int` 和 `float` 区分明确。
4. JS 的 `number` 同时表示整数和小数。

这意味着在 Python 里：

```python
x = 10       # int
y = 10.0     # float
print(type(x))  # <class 'int'>
print(type(y))  # <class 'float'>
```

而在 JS 里：

```js
const x = 10     // number
const y = 10.0   // number
console.log(typeof x)  // 'number'
console.log(typeof y)  // 'number'
```

JS 不区分整数和小数，它们都是 `number`。

高频踩坑：

URL 参数常常是字符串。

Python：

```python
page = "1"
page_size = 10
print(page + page_size)
```

会报错：`TypeError: can only concatenate str (not "int") to str`。

JS：

```js
const page = '1'
const pageSize = 10
console.log(page + pageSize)
```

输出：

```text
110
```

这不是分页想要的结果。JS 没有报错，但结果更危险——你可能很久都发现不了 bug。

## 十、小数 float

Python 小数类型叫 `float`。

```python
price = 19.9
height = 1.75
rate = 0.85
```

小数适合保存：

1. 价格。
2. 身高。
3. 比率。
4. 折扣。
5. 平均值。
6. 百分比计算结果。

示例：

```python
price = 19.9
count = 3

total = price * count
print(total)
```

可能输出：

```text
59.699999999999996
```

这不是 Python 出了 bug，而是**浮点数精度问题**。计算机内部用二进制表示小数，有些十进制小数无法精确表示。

Python 和 JS 都会遇到这个问题：

JS 对照：

```js
const price = 19.9
const count = 3

const total = price * count
console.log(total)
```

也可能输出：

```text
59.699999999999996
```

展示金额时通常格式化：

Python：

```python
print(f"{total:.2f}")
```

JS：

```js
console.log(total.toFixed(2))
```

高频踩坑：

严肃财务金额不要随便用普通 `float` / `number` 做最终精确计算。后面项目进阶可学 Python `Decimal`，前端常用"分"为单位展示后端计算结果。

## 十一、布尔值 bool

Python 布尔值只有两个：

```python
True
False
```

**注意首字母大写！** 这是 Python 和 JS 最容易混的地方之一。

```python
is_admin = True
is_published = False
```

常用于判断：

```python
if is_admin:
    print("可以进入后台")
```

布尔变量命名常用 `is_`、`has_`、`can_` 前缀：

```python
is_admin = True
has_permission = False
can_edit = True
```

JS 对照：

```js
const isAdmin = true
const isPublished = false
```

核心区别：

1. Python 是 `True` / `False`，**首字母大写**。
2. JS 是 `true` / `false`，**全小写**。
3. Python 类型名是 `bool`。
4. JS 类型名是 `boolean`。

高频踩坑：

Python 错误：

```python
is_admin = true   # NameError: name 'true' is not defined
```

Python 不认识小写的 `true`，会以为你引用了一个不存在的变量。

JS 错误：

```js
const isAdmin = True  // True 会被当成变量名，如果未定义则报错
```

JS 不认识大写的 `True`，会以为你引用了一个变量。

**怎么记：**

> Python 布尔值首字母大写，像专有名词：`True` / `False`
> JS 布尔值全小写，像普通词：`true` / `false`

## 十二、空值 None

Python 表示"没有值"的特殊值是：

```python
None
```

首字母大写，和 `True` / `False` 一样。

示例：

```python
nickname = None
```

意思是：

```text
nickname 现在没有值。
```

它和空字符串不同。

```python
nickname = ""
```

表示有一个字符串，只是内容为空。

对照：

| 写法 | 含义 | 类型 |
| --- | --- | --- |
| `nickname = None` | 暂时没有值 | `NoneType` |
| `nickname = ""` | 有值，是空字符串 | `str` |

什么时候用 `None`，什么时候用 `""`？

- `None`：数据不存在、未设置、未赋值。比如用户没填昵称。
- `""`：数据存在但是空的。比如用户填了昵称但留空了。

判断 None 推荐：

```python
user = None

if user is None:
    print("用户不存在")
```

判断 None 用 `is None`，不用 `== None`。这是 Python 的推荐写法。

JS 对照：

```js
let nickname = null
let user
```

JS 常见"空"：

| 写法 | 含义 | 类型 |
| --- | --- | --- |
| `null` | 主动设置为空 | `object`（历史遗留坑） |
| `undefined` | 未定义或未赋值 | `undefined` |
| `''` | 空字符串 | `string` |

JS 的 `null` 和 `undefined` 区别：

- `null` 是你**主动**设置成"没有值"
- `undefined` 是变量**自然**没有值（声明了但没赋值，或者属性不存在）

```js
let a = null       // 你主动设为空
let b              // 没有赋值，自然就是 undefined
console.log(a)     // null
console.log(b)     // undefined
```

Python 没有 `undefined`，未定义的变量直接使用会报错：

```python
print(user)  # NameError: name 'user' is not defined
```

Python 更严格：你要么给变量赋值，要么赋 `None`，不能"声明但不赋值"。

核心区别：

1. Python 主要用 `None` 表示空值。
2. JS 有 `null` 和 `undefined` 两种空值。
3. Python 未定义变量直接使用会报错。
4. JS 声明但未赋值的变量是 `undefined`，不会报错。
5. Python 的 `None` 首字母大写，JS 的 `null` 全小写。

## 十三、查看数据类型

Python 用 `type()`：

```python
name = "小明"
age = 18
price = 19.9
is_admin = True
nickname = None

print(type(name))
print(type(age))
print(type(price))
print(type(is_admin))
print(type(nickname))
```

输出：

```text
<class 'str'>
<class 'int'>
<class 'float'>
<class 'bool'>
<class 'NoneType'>
```

JS 用 `typeof`：

```js
const name = '小明'
const age = 18
const price = 19.9
const isAdmin = true
const nickname = null

console.log(typeof name)
console.log(typeof age)
console.log(typeof price)
console.log(typeof isAdmin)
console.log(typeof nickname)
```

输出：

```text
string
number
number
boolean
object    ← 这是 JS 的历史遗留坑
```

注意 JS 里 `typeof null` 结果是 `object`，这是一个历史 bug，永远改不了了。所以判断 JS 的 null 不能用 `typeof`，要用 `=== null`。

**查看类型的方法对照：**

| 操作 | Python | JS |
| --- | --- | --- |
| 查看类型 | `type(value)` | `typeof value` |
| 判断是否为 None/null | `value is None` | `value === null` |

相同点：

1. 都能查看变量类型。
2. 学习阶段都适合排查问题。
3. 接口数据不确定时，可以先输出类型。

核心区别：

1. Python 用 `type(value)`，是函数调用。
2. JS 用 `typeof value`，是运算符。
3. Python `None` 类型是 `NoneType`。
4. JS `typeof null` 是 `object`（坑）。

## 十四、类型转换

类型转换在实际开发中非常常见。

### Python 类型转换函数

| 函数 | 作用 | 示例 |
| --- | --- | --- |
| `int()` | 转成整数 | `int("18")` → `18` |
| `float()` | 转成小数 | `float("19.9")` → `19.9` |
| `str()` | 转成字符串 | `str(18)` → `"18"` |
| `bool()` | 转成布尔值 | `bool(0)` → `False` |

示例：

```python
# 字符串转数字
page = int("1")         # "1" → 1
price = float("19.9")   # "19.9" → 19.9

# 数字转字符串
age_str = str(18)       # 18 → "18"

# 数字转布尔值
print(bool(0))          # False
print(bool(1))          # True
print(bool(100))        # True
```

Python 中哪些值转布尔值是 `False`？

```python
bool(0)         # False
bool(0.0)       # False
bool("")        # False
bool(None)      # False
bool([])        # False（空列表）
bool({})        # False（空字典）

bool(1)         # True
bool("hello")   # True
bool([1, 2])    # True
```

### JS 类型转换

| 操作 | JS 写法 | 示例 |
| --- | --- | --- |
| 转数字 | `Number()` / `parseInt()` / `parseFloat()` | `Number("18")` → `18` |
| 转字符串 | `String()` / `.toString()` | `String(18)` → `"18"` |
| 转布尔值 | `Boolean()` | `Boolean(0)` → `false` |

```js
Number('18')        // 18
parseInt('18')      // 18
parseFloat('19.9')  // 19.9
String(18)          // '18'
(18).toString()     // '18'
Boolean(0)          // false
```

### 类型转换对照

| 操作 | Python | JS |
| --- | --- | --- |
| 字符串转整数 | `int("18")` | `parseInt("18")` 或 `Number("18")` |
| 字符串转小数 | `float("19.9")` | `parseFloat("19.9")` |
| 数字转字符串 | `str(18)` | `String(18)` 或 `(18).toString()` |
| 转布尔值 | `bool(0)` | `Boolean(0)` |

### 类型转换失败

Python 转换失败会报错：

```python
int("hello")  # ValueError: invalid literal for int()
```

JS 转换失败不会报错，而是返回 `NaN`：

```js
parseInt('hello')  // NaN
Number('hello')    // NaN
```

**`NaN` 的意思是"不是数字"（Not a Number），但它本身的类型是 `number`。** 这也是 JS 的坑之一。

Python 没有 `NaN`，转换失败直接报错，更直观。

## 十五、动态类型

Python 和 JS 都是动态类型语言。

也就是说，变量本身不固定只能保存某一种类型。

Python：

```python
value = "小明"
print(type(value))

value = 18
print(type(value))
```

JS：

```js
let value = '小明'
console.log(typeof value)

value = 18
console.log(typeof value)
```

相同点：

1. 变量可以先保存字符串，再保存数字。
2. 类型是在运行时根据值决定的。
3. 写起来灵活。
4. 也更容易因为类型变化导致 bug。

核心区别：

1. Python 虽然动态，但类型转换相对严格。
2. JS 有更多隐式类型转换。
3. Python 字符串加数字会报错。
4. JS 字符串加数字可能拼接。

Python：

```python
value = "18"
print(value + 1)  # 报错！TypeError
```

JS：

```js
let value = '18'
console.log(value + 1)  // 输出 '181'，不会报错
```

**总结**：Python 和 JS 都是动态类型，但 Python 在类型混合操作时更严格，不容易出隐藏 bug；JS 更"宽容"，但更容易踩坑。

## 十六、企业项目场景：文章数据变量

Python 后端处理文章：

```python
article_title = "Python 入门"
article_views = 120
article_rating = 4.8
is_published = False
published_at = None

print(f"文章标题：{article_title}")
print(f"阅读量：{article_views}")
print(f"评分：{article_rating}")
print(f"是否发布：{is_published}")
print(f"发布时间：{published_at}")
```

字段类型：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `article_title` | `str` | 文章标题 |
| `article_views` | `int` | 阅读量 |
| `article_rating` | `float` | 评分 |
| `is_published` | `bool` | 是否发布 |
| `published_at` | `NoneType` | 暂无发布时间 |

JS 前端可能拿到：

```js
const article = {
  articleTitle: 'Python 入门',
  articleViews: 120,
  articleRating: 4.8,
  isPublished: false,
  publishedAt: null
}

console.log(`文章标题：${article.articleTitle}`)
console.log(`阅读量：${article.articleViews}`)
console.log(`评分：${article.articleRating}`)
console.log(`是否发布：${article.isPublished}`)
console.log(`发布时间：${article.publishedAt}`)
```

核心区别：

1. Python 后端变量常用下划线。
2. JS 前端字段常用小驼峰。
3. Python 空值是 `None`。
4. JS 空值常用 `null`。
5. Python 布尔值是 `False`（大写）。
6. JS 布尔值是 `false`（小写）。

## 十七、企业项目场景：分页参数类型转换

前端请求：

```text
/api/articles?page=1&pageSize=10
```

URL 查询参数天然是文本。

Python 后端拿到的可能是：

```python
page = "1"
page_size = "10"
```

如果要计算偏移量：

```python
offset = (page - 1) * page_size
```

会报错，因为 `page` 是字符串，不能做减法。

正确：

```python
page = int("1")
page_size = int("10")

offset = (page - 1) * page_size
print(offset)
```

JS 对照：

```js
const page = '1'
const pageSize = '10'

const offset = (Number(page) - 1) * Number(pageSize)
console.log(offset)
```

相同点：

1. URL 参数通常是字符串。
2. 做数学计算前要转数字。
3. 分页计算非常常见。
4. 类型不对会导致分页 bug。

核心区别：

1. Python 用 `int()` 转换。
2. JS 用 `Number()`、`parseInt()` 等。
3. Python 字符串和数字计算会直接报错——帮你尽早发现问题。
4. JS 可能自动转换，也可能拼接，坑更隐蔽。

## 十八、容易和 JS 混淆的地方汇总

这篇内容很多，帮你把最容易混的几个点集中一下：

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 声明变量 | `name = "小明"` | `const name = '小明'` | Python 不需要声明关键字 |
| 命名风格 | `user_name` | `userName` | Python 蛇形，JS 驼峰 |
| 布尔值 | `True` / `False` | `true` / `false` | Python 首字母大写 |
| 空值 | `None` | `null` / `undefined` | Python 只有 None，首字母大写 |
| 查看类型 | `type(value)` | `typeof value` | Python 函数，JS 运算符 |
| 判断相等 | `==` | `===` | Python 没有全等运算符 |
| 字符串+数字 | 报错 | 隐式转换拼接 | Python 严格，JS 宽容 |
| 类型转换 | `int("1")` | `Number("1")` / `parseInt("1")` | 函数名不同 |
| 转换失败 | 报错 ValueError | 返回 NaN | Python 更直观 |

## 十九、完整实操：用户信息卡片

Python：

```python
user_name = "小明"
user_age = 18
user_height = 1.75
is_vip = True
last_login_at = None

print("用户信息")
print(f"姓名：{user_name}")
print(f"年龄：{user_age}")
print(f"身高：{user_height}")
print(f"是否会员：{is_vip}")
print(f"最后登录时间：{last_login_at}")

print(type(user_name))
print(type(user_age))
print(type(user_height))
print(type(is_vip))
print(type(last_login_at))
```

JS：

```js
const userName = '小明'
const userAge = 18
const userHeight = 1.75
const isVip = true
const lastLoginAt = null

console.log('用户信息')
console.log(`姓名：${userName}`)
console.log(`年龄：${userAge}`)
console.log(`身高：${userHeight}`)
console.log(`是否会员：${isVip}`)
console.log(`最后登录时间：${lastLoginAt}`)

console.log(typeof userName)
console.log(typeof userAge)
console.log(typeof userHeight)
console.log(typeof isVip)
console.log(lastLoginAt === null)
```

## 二十、本篇练习

练习一：定义个人信息。

Python：

```python
name = "你的名字"
age = 18
city = "你的城市"
is_beginner = True

print(f"姓名：{name}")
print(f"年龄：{age}")
print(f"城市：{city}")
print(f"是否 Python 初学者：{is_beginner}")
```

JS：

```js
const name = '你的名字'
const age = 18
const city = '你的城市'
const isBeginner = true

console.log(`姓名：${name}`)
console.log(`年龄：${age}`)
console.log(`城市：${city}`)
console.log(`是否 Python 初学者：${isBeginner}`)
```

练习二：查看类型。

Python：

```python
title = "Python 变量"
views = 100
score = 4.9
is_published = False
published_at = None

print(type(title))
print(type(views))
print(type(score))
print(type(is_published))
print(type(published_at))
```

JS：

```js
const title = 'Python 变量'
const views = 100
const score = 4.9
const isPublished = false
const publishedAt = null

console.log(typeof title)
console.log(typeof views)
console.log(typeof score)
console.log(typeof isPublished)
console.log(publishedAt === null)
```

练习三：找错误。

Python 错误：

```python
is_admin = true
print(is_admin)
```

问题：Python 布尔值首字母要大写。

正确：

```python
is_admin = True
print(is_admin)
```

JS 错误：

```js
const isAdmin = True
console.log(isAdmin)
```

问题：JS 布尔值要全小写。

正确：

```js
const isAdmin = true
console.log(isAdmin)
```

练习四：类型转换。

Python：

```python
page = "3"
page_size = "10"

# 把字符串转成整数，然后计算偏移量
offset = (int(page) - 1) * int(page_size)
print(f"偏移量：{offset}")
```

JS：

```js
const page = '3'
const pageSize = '10'

const offset = (Number(page) - 1) * Number(pageSize)
console.log(`偏移量：${offset}`)
```

## 本篇小结

1. 变量是给数据起名字，本质是贴在数据上的"标签"。
2. Python 变量赋值格式是 `变量名 = 值`，`=` 是赋值不是"等于"。
3. JS 通常用 `const` / `let` 声明变量，Python 不需要声明关键字。
4. Python 变量命名推荐下划线（`user_name`），JS 推荐小驼峰（`userName`）。
5. Python 字符串类型是 `str`，JS 是 `string`。
6. Python 整数类型是 `int`，JS 普通数字类型是 `number`。
7. Python 小数类型是 `float`，JS 小数仍然是 `number`。
8. Python 布尔值是 `True` / `False`（首字母大写），JS 是 `true` / `false`（全小写）。
9. Python 空值是 `None`（首字母大写），JS 空值常见是 `null` / `undefined`。
10. Python 查看类型用 `type()`，JS 用 `typeof`。
11. Python 类型转换用 `int()`、`float()`、`str()`、`bool()`。
12. JS 类型转换用 `Number()`、`parseInt()`、`String()`、`Boolean()`。
13. Python 字符串和数字不能直接相加，会报错；JS 会隐式转换拼接。
14. Python 和 JS 都是动态类型语言，但 Python 类型检查更严格。
15. URL 参数、表单输入、接口数据经常需要类型转换。
16. 企业项目里，变量类型决定了数据能不能正确计算、展示、判断和保存。
