---
title: Python 零基础入门 12：函数 function
slug: python-zero-functions
summary: 解释函数为什么存在，讲解 def、参数、返回值、默认参数、关键字参数、作用域，全程对照 JavaScript。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 12：函数 function

函数可以理解成：**给一段代码起名字，之后需要时直接调用。**

前端 JS 里你天天写函数：

```js
function greet(name) {
  return `你好，${name}`
}

const result = greet('小明')
```

Python 逻辑一样，但语法不同——用 `def` 而不是 `function`，靠缩进而不是花括号。

## 一、定义第一个函数

Python：

```python
def say_hello():
    print("你好，欢迎学习 Python")

say_hello()
```

运行结果：

```text
你好，欢迎学习 Python
```

JS 对照：

```js
function sayHello() {
  console.log('你好，欢迎学习 Python')
}

sayHello()
```

**核心区别：**

1. Python 用 `def`，JS 用 `function`。
2. Python 有冒号 `:`，JS 没有。
3. Python 靠缩进控制代码块，JS 用 `{}`。
4. Python 函数名通常用蛇形 `say_hello`，JS 用驼峰 `sayHello`。

## 二、带参数的函数

```python
def say_hello(name):
    print(f"你好，{name}")

say_hello("小明")
say_hello("小红")
```

运行结果：

```text
你好，小明
你好，小红
```

JS 对照：

```js
function sayHello(name) {
  console.log(`你好，${name}`)
}

sayHello('小明')
sayHello('小红')
```

## 三、多个参数

```python
def introduce(name, age):
    print(f"我叫{name}，今年{age}岁")

introduce("小明", 18)
```

调用时，参数顺序要对应。

JS 一样：

```js
function introduce(name, age) {
  console.log(`我叫${name}，今年${age}岁`)
}

introduce('小明', 18)
```

## 四、返回值 return

有些函数不只是输出内容，还要把计算结果交给外面使用。这时用 `return`。

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)   # 8
```

JS 对照：

```js
function add(a, b) {
  return a + b
}

const result = add(3, 5)
console.log(result)  // 8
```

### print 和 return 的区别

`print` 是显示给人看。`return` 是把结果交给程序继续使用。

```python
def add(a, b):
    return a + b

total = add(10, 20)
final_price = total + 5    # 可以继续用返回值计算

print(final_price)         # 35
```

如果函数只 `print`，外面就不方便继续拿结果计算：

```python
def add(a, b):
    print(a + b)     # 只显示，不返回

total = add(10, 20)  # total 是 None！
final_price = total + 5   # TypeError! None 不能加数字
```

**企业项目里，函数几乎都应该 `return` 结果，而不是直接 `print`。**

## 五、默认参数

参数可以有默认值。

```python
def say_hello(name="朋友"):
    print(f"你好，{name}")

say_hello()          # 你好，朋友（使用默认值）
say_hello("小明")    # 你好，小明（使用传入值）
```

JS 对照：

```js
function sayHello(name = '朋友') {
  console.log(`你好，${name}`)
}

sayHello()       // 你好，朋友
sayHello('小明')  // 你好，小明
```

默认参数在 Python 和 JS 里语法相同。

企业场景：

```python
def get_articles(page=1, page_size=10, status="published"):
    print(f"查询：第{page}页，每页{page_size}条，状态：{status}")

get_articles()                          # 默认值
get_articles(page=2)                    # 只改页码
get_articles(status="draft")            # 只改状态
```

## 六、关键字参数

Python 支持关键字参数——调用时可以指定参数名，不用按顺序。

```python
def get_articles(page=1, page_size=10, status="published"):
    print(f"查询：第{page}页，每页{page_size}条，状态：{status}")

get_articles(status="draft", page=2)   # 不按顺序！
```

输出：

```text
查询：第2页，每页10条，状态：draft
```

JS 没有关键字参数，通常用对象解构实现类似效果：

```js
function getArticles({ page = 1, pageSize = 10, status = 'published' } = {}) {
  console.log(`查询：第${page}页，每页${pageSize}条，状态：${status}`)
}

getArticles({ status: 'draft', page: 2 })
```

**这是 Python 比 JS 方便的地方——原生支持关键字参数，不需要包对象。**

## 七、返回多个值

Python 函数可以返回多个值：

```python
def get_user_info():
    name = "小明"
    age = 18
    return name, age

user_name, user_age = get_user_info()
print(f"姓名：{user_name}，年龄：{user_age}")
```

实际上返回的是元组（tuple），可以用一个变量接收：

```python
result = get_user_info()
print(result)      # ('小明', 18)
print(type(result))  # <class 'tuple'>
```

JS 没有多返回值，通常返回对象或数组：

```js
function getUserInfo() {
  const name = '小明'
  const age = 18
  return { name, age }   // 返回对象
}

const { name, age } = getUserInfo()  // 解构赋值
```

## 八、*args 和 **kwargs

Python 有两个特殊语法，用来接收任意数量的参数。

### *args：接收任意数量的位置参数

```python
def calculate_total(*prices):
    total = sum(prices)
    return total

print(calculate_total(10, 20, 30))    # 60
print(calculate_total(5, 15))         # 20
```

`*prices` 会把所有传入的参数打包成元组 `(10, 20, 30)`。

JS 对照：rest 参数

```js
function calculateTotal(...prices) {
  return prices.reduce((a, b) => a + b, 0)
}

console.log(calculateTotal(10, 20, 30))  // 60
```

### **kwargs：接收任意数量的关键字参数

```python
def create_article(title, **options):
    print(f"标题：{title}")
    for key, value in options.items():
        print(f"  {key}: {value}")

create_article("Python 入门", status="draft", category="Python")
```

输出：

```text
标题：Python 入门
  status: draft
  category: Python
```

`**options` 会把所有关键字参数打包成字典 `{"status": "draft", "category": "Python"}`。

JS 对照：对象作为最后一个参数

```js
function createArticle(title, options = {}) {
  console.log(`标题：${title}`)
  for (const [key, value] of Object.entries(options)) {
    console.log(`  ${key}: ${value}`)
  }
}

createArticle('Python 入门', { status: 'draft', category: 'Python' })
```

## 九、函数作为参数（高阶函数）

Python 函数是一等公民，可以像变量一样传递。

```python
def greet(name):
    return f"你好，{name}"

def process_user(name, handler):
    return handler(name)

result = process_user("小明", greet)
print(result)   # 你好，小明
```

JS 一样，而且 JS 更常用回调函数：

```js
function greet(name) {
  return `你好，${name}`
}

function processUser(name, handler) {
  return handler(name)
}

const result = processUser('小明', greet)
console.log(result)  // 你好，小明
```

### lambda 匿名函数

Python 用 `lambda` 定义简单匿名函数：

```python
nums = [3, 1, 4, 1, 5]
sorted_nums = sorted(nums, key=lambda x: -x)   # 按降序排列

print(sorted_nums)   # [5, 4, 3, 1, 1]
```

JS 对照：箭头函数

```js
const nums = [3, 1, 4, 1, 5]
const sortedNums = [...nums].sort((a, b) => b - a)

console.log(sortedNums)  // [5, 4, 3, 1, 1]
```

**lambda 和箭头函数的区别：**

| 对比 | Python lambda | JS 箭头函数 |
| --- | --- | --- |
| 语法 | `lambda x: x * 2` | `x => x * 2` |
| 限制 | 只能写单个表达式 | 可以写多行 |
| 使用频率 | 较少，更推荐 def | 非常频繁 |
| 可读性 | 复杂逻辑难读 | 相对清晰 |

Python 里如果逻辑复杂，推荐用 `def` 定义普通函数，不要写长 lambda。

## 十、作用域

### Python 作用域

```python
x = 10           # 全局变量

def foo():
    x = 20       # 局部变量（不会修改全局的 x）
    print(x)

foo()             # 20
print(x)          # 10（全局 x 没变）
```

如果想在函数内修改全局变量，要用 `global` 关键字：

```python
count = 0

def increment():
    global count    # 声明使用全局变量
    count += 1

increment()
print(count)   # 1
```

### JS 作用域

```js
let x = 10

function foo() {
  let x = 20   // 局部变量
  console.log(x)
}

foo()           // 20
console.log(x)  // 10
```

JS 不需要 `global` 关键字，但 `let` / `const` 的块级作用域和 Python 不完全一样。

### 核心差异

| 对比 | Python | JS |
| --- | --- | --- |
| 修改全局变量 | 需要 `global` 声明 | 直接赋值即可（`let` / `var` 不同） |
| 块级作用域 | 无（只有函数/模块/类作用域） | `let` / `const` 有块级作用域 |
| 闭包 | 支持 | 支持 |

高频踩坑：

```python
count = 0

def increment():
    count += 1   # UnboundLocalError! Python 认为这是局部变量，但还没赋值

increment()
```

正确：

```python
count = 0

def increment():
    global count
    count += 1

increment()
```

## 十一、函数语法对照总表

| 功能 | Python | JS |
| --- | --- | --- |
| 定义函数 | `def func():` | `function func() {}` |
| 箭头/匿名 | `lambda x: x * 2` | `x => x * 2` |
| 默认参数 | `def f(x=10):` | `function f(x = 10) {}` |
| 关键字参数 | `f(name="小明")` | 无（用对象解构） |
| 多返回值 | `return a, b` | 返回对象/数组 |
| rest 参数 | `*args` | `...args` |
| 关键字 rest | `**kwargs` | 无（用对象） |
| 修改全局变量 | `global x` | 直接赋值 |
| 文档字符串 | `"""docstring"""` | JSDoc 注释 |

## 十二、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 定义关键字 | `def` | `function` | Python 用 def |
| 命名风格 | 蛇形 `say_hello` | 驼峰 `sayHello` | Python 蛇形 |
| 代码块 | 缩进 | `{}` | Python 靠缩进 |
| 冒号 | `def f():` | `function f() {}` | Python 有冒号 |
| 关键字参数 | 原生支持 | 需要对象解构 | Python 特色 |
| 修改全局 | 需要 `global` | 直接赋值 | Python 更严格 |
| 匿名函数 | `lambda` | 箭头函数 | lambda 只能单表达式 |
| 多返回值 | `return a, b` | 返回对象 | Python 元组 |

## 十三、企业项目实战：文章查询函数

```python
def query_articles(category=None, status=None, page=1, page_size=10):
    """查询文章列表"""
    print(f"查询参数：")
    print(f"  分类：{category or '全部'}")
    print(f"  状态：{status or '全部'}")
    print(f"  页码：{page}")
    print(f"  每页：{page_size}")

    # 模拟返回结果
    skip = (page - 1) * page_size
    return {
        "total": 153,
        "page": page,
        "page_size": page_size,
        "skip": skip
    }

# 不同调用方式
result1 = query_articles()                                # 全部默认
result2 = query_articles(category="Python")               # 只过滤分类
result3 = query_articles(status="draft", page=2)          # 关键字参数
result4 = query_articles(category="Vue", page_size=20)    # 混合使用

print(f"\n结果：{result4}")
```

JS 对照：

```js
function queryArticles({ category = null, status = null, page = 1, pageSize = 10 } = {}) {
  console.log('查询参数：')
  console.log(`  分类：${category ?? '全部'}`)
  console.log(`  状态：${status ?? '全部'}`)
  console.log(`  页码：${page}`)
  console.log(`  每页：${pageSize}`)

  const skip = (page - 1) * pageSize
  return { total: 153, page, pageSize, skip }
}

queryArticles()
queryArticles({ category: 'Python' })
queryArticles({ status: 'draft', page: 2 })
```

注意 Python 的关键字参数比 JS 的对象解构更简洁。

## 十四、本篇练习

练习一：计算总价函数。

Python：

```python
def calculate_total(price, count, discount=1.0):
    total = price * count * discount
    return round(total, 2)

print(calculate_total(9.9, 3))            # 29.7
print(calculate_total(9.9, 3, 0.9))       # 26.73（9折）
```

练习二：格式化文章标题。

```python
def format_title(title, max_length=50):
    title = title.strip()
    if len(title) > max_length:
        title = title[:max_length] + "..."
    return title

print(format_title("Python 零基础入门：字符串的详细讲解和练习"))      # 不截断
print(format_title("很长的标题" * 10, max_length=20))               # 截断
```

练习三：找错误。

```python
# 错误 1：忘了 return
def add(a, b):
    a + b       # 没有 return！结果是 None

result = add(3, 5)
print(result)   # None

# 正确
def add(a, b):
    return a + b
```

```python
# 错误 2：修改全局变量没声明 global
count = 0
def increment():
    count += 1   # UnboundLocalError!

# 正确
def increment():
    global count
    count += 1
```

## 本篇小结

1. Python 用 `def` 定义函数，JS 用 `function`。
2. Python 函数名用蛇形 `say_hello`，JS 用驼峰 `sayHello`。
3. `return` 返回结果，没有 `return` 则返回 `None`。
4. `print` 和 `return` 不同：`print` 只是显示，`return` 才能继续使用结果。
5. 默认参数 `def f(x=10):`，Python 和 JS 语法相同。
6. **关键字参数**是 Python 特色，JS 需要对象解构模拟。
7. Python 可以返回多个值 `return a, b`，JS 返回对象或数组。
8. `*args` 收集位置参数，`**kwargs` 收集关键字参数。
9. 修改全局变量需要 `global` 声明，JS 不需要。
10. `lambda` 是 Python 的匿名函数，只能写单个表达式，JS 的箭头函数更灵活。
