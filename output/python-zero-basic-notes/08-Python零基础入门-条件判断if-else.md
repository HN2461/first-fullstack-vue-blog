---
title: Python 零基础入门 08：条件判断 if else
slug: python-zero-if-else
summary: 介绍条件判断的基本写法，讲解 if、elif、else、比较运算符、逻辑运算符、缩进规则，全程对照 JavaScript。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 08：条件判断 if else

条件判断就是：**如果满足某个条件，就做一件事；否则做另一件事。**

前端 JS 里你也天天写条件判断：

```js
if (role === 'admin') {
  showAdminMenu()
} else {
  showUserMenu()
}
```

Python 逻辑一样，但语法完全不同——**没有大括号，靠缩进控制代码块。**

## 一、最简单的 if

Python：

```python
age = 18

if age >= 18:
    print("你已经成年")
```

运行结果：

```text
你已经成年
```

JS 对照：

```js
const age = 18

if (age >= 18) {
  console.log('你已经成年')
}
```

区别一眼就能看到：

1. Python 的 `if` 后面有冒号 `:`，JS 没有。
2. Python 没有大括号 `{}`，靠缩进控制代码块。
3. JS 必须用 `{}` 包裹代码块（单行可以省略但不推荐）。

## 二、缩进很重要

Python 用缩进表示代码属于哪一块。这是 Python 最重要的语法规则。

正确写法：

```python
age = 18

if age >= 18:
    print("你已经成年")     # 缩进 4 空格，属于 if
    print("可以继续办理")   # 缩进 4 空格，属于 if
```

错误写法：

```python
age = 18

if age >= 18:
print("你已经成年")   # IndentationError! 没有缩进
```

另一个常见错误：缩进不一致。

```python
if age >= 18:
    print("你已经成年")    # 4 空格
      print("可以继续")    # 6 空格，和上一行不一致，报错
```

**新手建议：统一使用 4 个空格缩进，不要用 Tab。**

### JS 的花括号 vs Python 的缩进

JS 用 `{}` 标记代码块：

```js
if (age >= 18) {
  console.log('你已经成年')    // 在花括号内
  console.log('可以继续办理')  // 在花括号内
}
console.log('这行总执行')      // 在花括号外
```

Python 用缩进标记代码块：

```python
if age >= 18:
    print("你已经成年")     # 缩进内，属于 if
    print("可以继续办理")   # 缩进内，属于 if
print("这行总执行")        # 没有缩进，不属于 if
```

### 缩进的好处

1. 代码天然整齐，不会出现 JS 里花括号风格争论。
2. 少写 `{}`，代码更简洁。
3. 必须养成良好的格式习惯，否则报错。

## 三、if else

`else` 表示"否则"。

Python：

```python
age = 16

if age >= 18:
    print("你已经成年")
else:
    print("你还未成年")
```

运行结果：

```text
你还未成年
```

JS 对照：

```js
const age = 16

if (age >= 18) {
  console.log('你已经成年')
} else {
  console.log('你还未成年')
}
```

## 四、if elif else

如果有多个条件，可以用 `elif`（else if 的缩写）。

Python：

```python
score = 85

if score >= 90:
    print("优秀")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

运行结果：

```text
及格
```

Python 会从上往下判断：

1. `score >= 90` 不成立
2. `score >= 60` 成立
3. 执行"及格"
4. 后面的 `else` 不再执行

**`elif` 是 Python 特有的关键字，JS 写 `else if`（两个单词）。**

JS 对照：

```js
const score = 85

if (score >= 90) {
  console.log('优秀')
} else if (score >= 60) {
  console.log('及格')
} else {
  console.log('不及格')
}
```

对照：

| 语言 | 多条件判断 | 写法 |
| --- | --- | --- |
| Python | `elif` | 一个关键字 |
| JS | `else if` | 两个关键字 |

## 五、常见比较运算符

| 运算符 | 含义 | Python | JS |
| --- | --- | --- | --- |
| `==` | 等于 | `a == b` | `a == b`（宽松） |
| `!=` | 不等于 | `a != b` | `a != b` |
| `>` | 大于 | `a > b` | `a > b` |
| `<` | 小于 | `a < b` | `a < b` |
| `>=` | 大于等于 | `a >= b` | `a >= b` |
| `<=` | 小于等于 | `a <= b` | `a <= b` |

注意：判断相等用 `==`，不是 `=`。

```python
password = "123456"

if password == "123456":   # 判断相等
    print("登录成功")
```

`=` 是赋值，`==` 才是判断是否相等。Python 和 JS 这点一样。

### Python 和 JS 等值判断的核心区别

Python 的 `==` 是严格判断：

```python
1 == "1"    # False（数字和字符串不相等）
0 == False  # True（0 和 False 在 Python 里等价）
```

JS 有 `==`（宽松）和 `===`（严格）：

```js
1 == '1'     // true（宽松，会隐式转换）
1 === '1'    // false（严格，不转换）
0 == false   // true
0 === false  // false
```

**对照：**

| 比较 | Python | JS `==` | JS `===` |
| --- | --- | --- | --- |
| `1 == "1"` | `False` | `true` | `false` |
| `0 == False` | `True` | `true` | `false` |
| `None == None` | `True` | `null == null` → `true` | `true` |

Python 的 `==` 更接近 JS 的 `===`。

Python 还可以用 `is` 判断是否是同一个对象：

```python
a = None
a is None     # True（推荐写法）
a == None     # True（不推荐）
```

## 六、逻辑运算符

### and（与）

`and` 表示"并且"，两个条件都成立才算成立。

Python：

```python
age = 20
has_ticket = True

if age >= 18 and has_ticket:
    print("可以入场")
else:
    print("不能入场")
```

JS：

```js
const age = 20
const hasTicket = true

if (age >= 18 && hasTicket) {
  console.log('可以入场')
} else {
  console.log('不能入场')
}
```

### or（或）

`or` 表示"或者"，只要有一个条件成立就算成立。

Python：

```python
is_admin = False
is_owner = True

if is_admin or is_owner:
    print("可以编辑")
else:
    print("不能编辑")
```

JS：

```js
const isAdmin = false
const isOwner = true

if (isAdmin || isOwner) {
  console.log('可以编辑')
} else {
  console.log('不能编辑')
}
```

### not（非）

`not` 表示"取反"。

Python：

```python
is_banned = False

if not is_banned:
    print("可以发言")
```

JS：

```js
const isBanned = false

if (!isBanned) {
  console.log('可以发言')
}
```

### 逻辑运算符对照表

| 功能 | Python | JS |
| --- | --- | --- |
| 与 | `and` | `&&` |
| 或 | `or` | `\|\|` |
| 非 | `not` | `!` |

**这是最容易混的地方！Python 用英文单词，JS 用符号。**

高频踩坑：

```python
if age >= 18 && has_ticket:   # SyntaxError! Python 不支持 &&
```

正确：

```python
if age >= 18 and has_ticket:
```

```python
if not is_banned:    # Python 写法
if !is_banned:       # SyntaxError! Python 不支持 !
```

## 七、条件嵌套

Python：

```python
role = "admin"
status = "active"

if role == "admin":
    if status == "active":
        print("管理员在线")
    else:
        print("管理员已禁用")
else:
    print("普通用户")
```

JS：

```js
const role = 'admin'
const status = 'active'

if (role === 'admin') {
  if (status === 'active') {
    console.log('管理员在线')
  } else {
    console.log('管理员已禁用')
  }
} else {
  console.log('普通用户')
}
```

嵌套太深时可读性会变差，建议用 `and` 简化：

```python
if role == "admin" and status == "active":
    print("管理员在线")
```

## 八、三元表达式

Python 的三元表达式（条件表达式）：

```python
age = 20
result = "成年" if age >= 18 else "未成年"

print(result)
```

JS 对照：

```js
const age = 20
const result = age >= 18 ? '成年' : '未成年'

console.log(result)
```

对照：

| 语言 | 格式 |
| --- | --- |
| Python | `值1 if 条件 else 值2` |
| JS | `条件 ? 值1 : 值2` |

Python 的三元表达式顺序和 JS 不同：

- Python：**先写结果，再写条件**——"成年 if 年龄>=18 else 未成年"
- JS：**先写条件，再写结果**——"年龄>=18 ? 成年 : 未成年"

企业场景：

```python
# 根据文章状态显示文字
status = "draft"
status_text = "已发布" if status == "published" else "草稿"
```

```js
const status = 'draft'
const statusText = status === 'published' ? '已发布' : '草稿'
```

## 九、pass 语句

Python 要求 `if` 后面必须有代码块。如果暂时不写内容，需要用 `pass` 占位：

```python
if role == "admin":
    pass   # TODO: 后续实现管理员逻辑
else:
    print("普通用户")
```

JS 没有这个要求，可以写空的花括号：

```js
if (role === 'admin') {
  // TODO: 后续实现
} else {
  console.log('普通用户')
}
```

`pass` 在定义空函数、空类时也常用，后面会遇到。

## 十、条件判断语法对照总表

| 功能 | Python | JS |
| --- | --- | --- |
| 基本判断 | `if x:` | `if (x) {` |
| 否则 | `else:` | `} else {` |
| 否则如果 | `elif x:` | `} else if (x) {` |
| 代码块 | 缩进 | `{}` |
| 与 | `and` | `&&` |
| 或 | `or` | `\|\|` |
| 非 | `not` | `!` |
| 等于 | `==` | `==` 或 `===` |
| 不等于 | `!=` | `!=` 或 `!==` |
| 同一对象 | `is` | `===`（近似） |
| 三元表达式 | `A if X else B` | `X ? A : B` |
| 空占位 | `pass` | `{}` |
| 冒号 | `if x:` 必须有 | 没有 |

## 十一、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 代码块 | 缩进 | `{}` | Python 靠缩进 |
| 条件后冒号 | `if x:` | `if (x)` | Python 有冒号 |
| elif vs else if | `elif` | `else if` | Python 合成一个词 |
| 逻辑与 | `and` | `&&` | Python 用英文 |
| 逻辑或 | `or` | `\|\|` | Python 用英文 |
| 逻辑非 | `not` | `!` | Python 用英文 |
| 三元表达式顺序 | `A if X else B` | `X ? A : B` | Python 先结果后条件 |
| 等值判断 | `==` 严格 | `===` 才严格 | Python 默认严格 |
| 空代码块 | `pass` | `{}` | Python 需要 pass |

## 十二、企业项目实战：文章状态判断

```python
# 文章状态判断
status = "draft"
role = "admin"

if status == "published":
    print("文章已发布，所有人可见")
elif status == "draft":
    if role == "admin" or role == "author":
        print("草稿，仅作者和管理员可见")
    else:
        print("无权查看草稿")
elif status == "archived":
    print("文章已归档")
else:
    print("未知状态")
```

JS 对照（更贴近这个项目的实际代码）：

```js
const status = 'draft'
const role = 'admin'

if (status === 'published') {
  console.log('文章已发布，所有人可见')
} else if (status === 'draft') {
  if (role === 'admin' || role === 'author') {
    console.log('草稿，仅作者和管理员可见')
  } else {
    console.log('无权查看草稿')
  }
} else if (status === 'archived') {
  console.log('文章已归档')
} else {
  console.log('未知状态')
}
```

## 十三、本篇练习

练习一：成绩判断。

Python：

```python
score = int(input("请输入成绩："))

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

JS：

```js
const score = parseInt(prompt('请输入成绩：'), 10)

if (score >= 90) {
  console.log('优秀')
} else if (score >= 80) {
  console.log('良好')
} else if (score >= 60) {
  console.log('及格')
} else {
  console.log('不及格')
}
```

练习二：找错误。

```python
age = 16
if age >= 18     # 缺少冒号！
    print("成年")
```

正确：

```python
if age >= 18:
    print("成年")
```

```python
score = 85
if score >= 60 and <= 90:   # 语法错误！
    print("及格")
```

正确：

```python
if score >= 60 and score <= 90:
    print("及格")
```

Python 不支持 `60 <= score <= 90` 的连写——其实支持！Python 有一个 JS 没有的特性叫**链式比较**：

```python
if 60 <= score <= 90:
    print("及格")
```

这比 JS 更直观。

练习三：权限判断。

```python
role = "admin"
is_active = True

if role == "admin" and is_active:
    print("可以进入后台管理")
elif role == "admin" and not is_active:
    print("账号已禁用")
else:
    print("无权访问后台")
```

## 本篇小结

1. Python `if` 后面有冒号 `:`，JS 没有。
2. Python 用缩进控制代码块，JS 用 `{}`。
3. Python 多条件用 `elif`，JS 用 `else if`。
4. Python 逻辑运算符是 `and`、`or`、`not`，JS 是 `&&`、`||`、`!`。
5. Python `==` 严格判断，接近 JS 的 `===`。
6. Python 三元表达式：`A if X else B`，JS 是 `X ? A : B`。
7. Python 空代码块用 `pass`，JS 用空 `{}`。
8. Python 支持链式比较：`60 <= score <= 90`，JS 不支持。
