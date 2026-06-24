---
title: Python 零基础入门 21：面试复盘与项目表达
slug: python-zero-interview-and-project-review
summary: 汇总 Python 基础面试高频问题，说明如何把记账本练习包装成项目表达，给出 Python vs JS 核心差异速查表，以及下一步学习路线。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 21：面试复盘与项目表达

学完前面的内容，你已经不是"完全没接触过 Python"的状态了。

但企业面试不只看你背了多少概念，还会看你能不能把概念讲清楚，能不能用代码解决一个小问题。

作为前端开发者学 Python，你还有一个独特优势——你能说清楚 Python 和 JS 的差异，这本身就是很好的技术表达。

## 一、你现在应该掌握什么

学完这套笔记后，至少要能说明：

- Python 代码如何运行
- 变量是什么，和 JS 的 `const` / `let` 有什么区别
- 字符串、整数、小数、布尔值有什么区别
- `input()` 为什么得到字符串
- `if else` 怎么做条件判断，和 JS 语法有什么不同
- `for` 和 `while` 怎么循环
- 列表和字典分别适合保存什么数据
- 函数为什么能减少重复
- 文件如何读写
- 异常处理有什么用
- 模块、包、pip、虚拟环境是什么
- 类、对象、属性、方法、self 是什么
- 常用标准库能解决哪些问题
- Python 和 JS 的核心差异有哪些

## 二、Python vs JS 核心差异速查表

这是面试时最能体现你深度的地方——不只会 Python，还能对比 JS。

### 语法差异

| 对比 | Python | JS |
| --- | --- | --- |
| 代码块 | 缩进 | `{}` |
| 语句结束 | 换行 | 分号（可选） |
| 条件后冒号 | `if x:` | `if (x) {` |
| else if | `elif` | `else if` |
| 逻辑运算 | `and` / `or` / `not` | `&&` / `\|\|` / `!` |
| 自增 | `i += 1` | `i++` |
| 三元表达式 | `A if X else B` | `X ? A : B` |
| 多值匹配 | `match/case` (3.10+) | `switch/case` |
| 解构赋值 | `a, b = [1, 2]` | `const [a, b] = [1, 2]` |
| 收集剩余 | `*rest` | `...rest` |
| 类型提示 | `def f(x: int) -> str:` | TypeScript `x: number` |

### 数据类型差异

| 对比 | Python | JS |
| --- | --- | --- |
| 数字类型 | `int` + `float` | `number` |
| 布尔值 | `True` / `False` | `true` / `false` |
| 空值 | `None` | `null` + `undefined` |
| 获取长度 | `len(x)` | `x.length` |
| 除法 | `/` 总返回 float | `/` 可能返回整数 |
| 整除 | `//` | `Math.floor()` |
| 字符串+数字 | 报错 TypeError | 隐式拼接 |
| 空列表真假 | `bool([])` → `False` | `Boolean([])` → `true` |

### 字符串差异

| 对比 | Python | JS |
| --- | --- | --- |
| 格式化 | `f"你好 {name}"` | `` `你好 ${name}` `` |
| 去空格 | `strip()` | `trim()` |
| 判断包含 | `"key" in text` | `text.includes("key")` |
| 替换默认 | 替换全部 | 只替换第一个 |
| 合并 | `"sep".join(list)` | `array.join("sep")` |
| 反转 | `text[::-1]` | `text.split('').reverse().join('')` |

### 数据结构差异

| 对比 | Python | JS |
| --- | --- | --- |
| 数组末尾添加 | `append()` | `push()` |
| 数组合并 | `extend()` | `concat()` |
| 按值删除 | `remove()` | `filter()` |
| 映射 | 列表推导式 | `map()` |
| 过滤 | 列表推导式 | `filter()` |
| 去重 | `list(set(x))` | `[...new Set(x)]` |
| 不可变序列 | 元组 `tuple` | 无原生类型 |
| 集合运算 | `&` 交集 `\|` 并集 `-` 差集 | 无运算符，需手动 filter |
| 字典访问 | `dict["key"]` | `obj.key` 或 `obj["key"]` |
| 键不存在 | 报错 KeyError | 返回 undefined |
| 点号访问 | 不支持 | 支持 |

### 错误处理差异

| 对比 | Python | JS |
| --- | --- | --- |
| 捕获 | `except` | `catch` |
| 指定类型 | `except ValueError:` | catch 里判断 |
| 除以零 | 报错 | 返回 Infinity |
| 越界访问 | 报错 | 返回 undefined |
| 主动抛出 | `raise` | `throw` |

### 面向对象差异

| 对比 | Python | JS |
| --- | --- | --- |
| 当前对象 | `self`（必须写） | `this`（自动） |
| 创建对象 | `User()` | `new User()` |
| 构造方法 | `__init__` | `constructor` |
| 继承 | `class Dog(Animal):` | `class Dog extends Animal` |
| 静态方法 | `@staticmethod` | `static` 关键字 |
| 类方法 | `@classmethod` | 无原生 |
| 魔术方法 | `__str__`、`__repr__`、`__eq__` | `toString()` |

### 工具链差异

| 对比 | Python | JS |
| --- | --- | --- |
| 包管理器 | `pip` | `npm` |
| 依赖文件 | `requirements.txt` | `package.json` |
| 依赖隔离 | 虚拟环境 | `node_modules` |
| JSON 序列化 | `json.dumps()` | `JSON.stringify()` |
| 日期格式化 | `datetime.strftime()` | 需要第三方库 |
| 日志 | `logging` 内置 | 需要 winston |

## 三、高频面试问题

### 问题一：列表和字典有什么区别

```text
列表适合保存一组有顺序的数据，比如多个商品名称、多个用户记录。
字典适合保存键值对，比如一个用户的姓名、年龄、城市。
实际项目里经常把它们组合起来，用列表保存多个用户字典。

JS 里对应的是数组和对象，区别是 Python 字典键必须加引号，不支持点号访问，
访问不存在的键会报错而不是返回 undefined。
```

### 问题二：函数有什么作用

```text
函数可以把一段可复用的逻辑封装起来，减少重复代码。
函数可以接收参数，也可以通过 return 返回结果。
Python 的特色是支持关键字参数，调用时可以指定参数名，不用按顺序传。
在项目里，我会把独立职责的逻辑拆成函数，让代码更清晰。
```

### 问题三：print 和 return 有什么区别

```text
print 是把内容输出到屏幕，主要给人看。
return 是把函数结果返回给程序，方便后续继续计算或处理。
如果一个函数的结果还要被其他代码使用，就应该 return，而不是只 print。
Python 里没有 return 的函数返回 None，类似 JS 函数没有 return 返回 undefined。
```

### 问题四：什么是异常处理

```text
异常处理用于处理运行时可能出现的问题，比如输入格式错误、文件不存在、除数为 0。
Python 用 try-except，JS 用 try-catch。Python 可以按异常类型捕获，更精确。
比如 ValueError、KeyError、FileNotFoundError 都是不同类型的异常。
不建议裸写 except，因为那会隐藏真正的错误原因。
```

### 问题五：Python 和 JS 有什么主要区别

这是最能体现你深度的问题：

```text
作为前端开发者，我感受到几个核心区别：

1. Python 靠缩进控制代码块，JS 用花括号。
2. Python 的逻辑运算符是 and/or/not，JS 是 &&/||/!。
3. Python 除法总返回 float，字符串不能直接和数字拼接——比 JS 更严格。
4. Python 的 replace 默认替换全部，JS 默认只替换第一个。
5. Python 的 join 是 "分隔符".join(list)，方向和 JS 的 array.join() 相反。
6. Python 字典不支持点号访问，键不存在报错而不是返回 undefined。
7. Python 有列表推导式替代 JS 的 map/filter。
8. Python 异常处理用 except，JS 用 catch。
9. Python 类的 self 必须显式写，JS 的 this 自动绑定。
10. Python 创建对象不需要 new，JS 需要。

这些差异让我意识到，Python 在类型安全和错误提示上比 JS 更严格，
很多 JS 隐式处理的情况，Python 会直接报错，反而不容易出 bug。
```

## 四、把记账本练习说成项目

不要只说："我写了一个记账本。"

可以这样说：

```text
我做过一个命令行记账本练习。
它支持循环录入消费名称和金额，使用列表保存多条记录，使用字典保存单条记录。
录入结束后，程序会统计总支出，并把明细写入本地文本文件。
后续我还加入了异常处理，避免用户输入非数字金额时程序直接崩溃。
升级版使用 JSON 保存数据，配合 pathlib 处理路径，使用函数拆分录入、统计、保存逻辑。

这个练习让我理解了输入、类型转换、循环、列表、字典、函数拆分和文件写入之间如何配合。
也让我对比了 Python 和 JS 在数据结构、异常处理、文件操作上的差异。
```

这段表达比"我会 Python 基础"更有说服力。

## 五、面试前自查清单

面试前至少能做到：

- [ ] 能手写一个 `if else` 判断
- [ ] 能写一个 `for` 循环遍历列表
- [ ] 能用字典保存一条业务数据
- [ ] 能写一个带参数和返回值的函数
- [ ] 能解释 `try except` 的作用
- [ ] 能解释虚拟环境为什么存在
- [ ] 能解释 `self` 是什么
- [ ] 能说清楚 Python 和 JS 至少 5 个核心差异
- [ ] 能讲清楚自己的记账本练习

## 六、上手工作前的最低训练标准

### 训练一：能独立运行项目

你需要能做到：

- 拉到代码后知道先看 README
- 知道创建虚拟环境
- 知道安装依赖
- 知道从入口文件启动程序
- 看到报错时能读懂最后几行错误信息

### 训练二：能读懂一个小功能

拿到一个小项目时，先找：

- 入口文件在哪里
- 数据从哪里来
- 经过哪些函数处理
- 结果输出到哪里

### 训练三：能改一个小需求

以记账本为例，尝试完成：

- 新增收入记录
- 支持按类型统计支出
- 保存记录时增加日期字段
- 输入错误时不让程序崩溃

### 训练四：能写最小测试

```python
def calculate_total(records):
    total = 0
    for record in records:
        total += record["amount"]
    return total

# 简单断言测试
records = [
    {"name": "早餐", "amount": 8},
    {"name": "地铁", "amount": 4}
]

assert calculate_total(records) == 12
```

### 训练五：能写清楚变更说明

```text
本次修改：
1. 新增消费记录的金额校验，避免输入非数字导致程序崩溃。
2. 将记录保存格式从 txt 改为 JSON，方便后续读取和统计。
3. 拆分 load_records、save_records、show_summary 函数，降低 main 函数复杂度。

验证方式：
1. 手动添加一条消费记录。
2. 输入非法金额，确认程序提示重新输入。
3. 退出后重新运行，确认历史记录仍可读取。
```

## 七、从这里继续学什么

如果目标是 Python 后端：

- HTTP 基础
- Flask 或 FastAPI
- 数据库 SQL / MongoDB
- 接口设计
- 登录鉴权
- 单元测试

如果目标是数据分析：

- Excel / CSV 处理
- pandas
- 数据清洗
- matplotlib 可视化
- 基础统计

如果目标是自动化测试：

- pytest
- requests
- Selenium 或 Playwright
- 接口测试

## 本篇小结

1. 面试不是只背概念，要能结合代码和项目表达。
2. 作为前端开发者，能对比 Python 和 JS 的差异是独特优势。
3. 列表、字典、函数、异常、虚拟环境、面向对象都是基础高频点。
4. Python 和 JS 最容易混淆的：`except` vs `catch`、`and/or/not` vs `&&/||/!`、`strip()` vs `trim()`、`append()` vs `push()`、`self` vs `this`。
5. 学完这套笔记后，下一步要选择方向继续深入，并完成至少一个可运行、可说明、可验证的小项目。
