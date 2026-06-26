---
title: Python 零基础入门 17：异常处理 try except
slug: python-zero-exception-handling
summary: 讲解程序为什么会报错，如何使用 try except 捕获异常，自定义异常类，异常链 raise from，断言 assert，异常层次结构，以及 logging 记录错误，全程对照 JavaScript。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 17：异常处理 try except

程序运行时，可能会遇到各种问题。

比如：

- 用户输入了错误内容
- 文件不存在
- 网络断开
- 除数是 0

这些问题在 Python 里通常叫**异常**。

前端 JS 里你也遇到过：

```js
JSON.parse('invalid')       // SyntaxError
undefined.property          // TypeError
const a = 1 / 0            // Infinity（JS 不报错）
```

Python 和 JS 处理错误的方式不同：Python 用 `try-except`，JS 用 `try-catch`。

## 一、一个会报错的例子

```python
age = int(input("请输入年龄："))
print(f"明年你 {age + 1} 岁")
```

如果用户输入 `十八`，程序报错：

```text
ValueError: invalid literal for int() with base 10: '十八'
```

JS 对照——JS 不报错，但结果不对：

```js
const age = parseInt('十八', 10)
console.log(age)   // NaN
```

**Python 的报错比 JS 的 NaN 更好——它让你立刻知道出了问题。**

## 二、使用 try except

Python：

```python
try:
    age = int(input("请输入年龄："))
    print(f"明年你 {age + 1} 岁")
except ValueError:
    print("年龄必须输入数字")
```

JS 对照：

```js
try {
  const age = parseInt(prompt('请输入年龄：'), 10)
  if (isNaN(age)) throw new Error('年龄必须输入数字')
  console.log(`明年你 ${age + 1} 岁`)
} catch (error) {
  console.log(error.message)
}
```

**核心区别：**

1. Python 用 `except`，JS 用 `catch`。
2. Python 可以指定异常类型 `except ValueError:`，JS 的 `catch` 捕获所有错误。
3. Python 的异常类型非常具体，JS 只有 `Error` 及其子类。

## 三、常见异常类型

| 异常类型 | 触发场景 | 例子 |
| --- | --- | --- |
| `ValueError` | 值类型不对 | `int("abc")` |
| `TypeError` | 类型操作不合法 | `"2" + 2` |
| `KeyError` | 字典键不存在 | `d["missing"]` |
| `IndexError` | 索引越界 | `list[100]` |
| `FileNotFoundError` | 文件不存在 | `open("missing.txt")` |
| `ZeroDivisionError` | 除以零 | `1 / 0` |
| `AttributeError` | 属性不存在 | `"hello".upperz()` |
| `NameError` | 变量未定义 | `print(x)` |
| `PermissionError` | 权限不足 | 写入只读文件 |
| `ImportError` | 导入失败 | `import 不存在的模块` |

JS 对照：

| Python 异常 | JS 类似错误 |
| --- | --- |
| `ValueError` | 无直接对应（JS 静默返回 NaN） |
| `TypeError` | `TypeError` |
| `KeyError` | 访问不存在的属性返回 `undefined`（不报错） |
| `IndexError` | 访问越界数组返回 `undefined`（不报错） |
| `FileNotFoundError` | `ENOENT`（Node.js） |
| `ZeroDivisionError` | 无（JS 返回 `Infinity`） |

**Python 更严格——大多数错误情况会直接报异常。JS 更宽松——很多情况静默返回 `undefined` 或 `NaN`。**

## 四、捕获文件不存在

Python：

```python
try:
    with open("data.txt", "r", encoding="utf-8") as file:
        content = file.read()
    print(content)
except FileNotFoundError:
    print("文件不存在，请先创建 data.txt")
```

JS 对照（Node.js）：

```js
const fs = require('fs')

try {
  const content = fs.readFileSync('data.txt', 'utf-8')
  console.log(content)
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('文件不存在')
  } else {
    throw error   // 其他错误重新抛出
  }
}
```

Python 直接按异常类型捕获，JS 需要在 catch 里判断 `error.code`。

## 五、捕获多个异常

```python
try:
    number = int(input("请输入数字："))
    result = 100 / number
except ValueError:
    print("请输入合法数字")
except ZeroDivisionError:
    print("不能输入 0")
```

也可以合并：

```python
try:
    number = int(input("请输入数字："))
    result = 100 / number
except (ValueError, ZeroDivisionError) as e:
    print(f"输入有误：{e}")
```

`as e` 可以获取异常对象，打印具体错误信息。

### except 的匹配顺序

`except` 是从上到下匹配的，先匹配到的就执行。**所以具体的异常类型要写在前面，通用的写在后面：**

```python
# 正确：具体在前，通用在后
try:
    with open("data.json") as f:
        import json
        data = json.load(f)
except FileNotFoundError:        # 具体先匹配
    print("文件不存在")
except json.JSONDecodeError:     # 再具体
    print("JSON 格式错误")
except OSError:                  # FileNotFoundError 的父类，放后面
    print("其他文件错误")
except Exception:                # 最通用，兜底
    print("未知错误")
```

如果把 `except Exception` 写在最前面，后面所有的都不会执行——因为 `Exception` 是所有异常的父类，全部会被它捕获。

JS 对照：

```js
try {
  const number = parseInt(prompt('请输入数字：'), 10)
  if (isNaN(number)) throw new TypeError('请输入合法数字')
  if (number === 0) throw new RangeError('不能输入 0')
  const result = 100 / number
} catch (error) {
  console.log(error.message)
}
```

JS 没有 `except` 分支，所有错误都在一个 `catch` 里处理。

## 六、裸 except、except Exception 和异常层次结构

Python 异常是一个继承树，根是 `BaseException`：

```text
BaseException
├── SystemExit              # sys.exit() 触发
├── KeyboardInterrupt       # Ctrl+C 中断
├── GeneratorExit           # 生成器关闭
└── Exception               # ← 所有常规异常的基类
    ├── ValueError
    ├── TypeError
    ├── KeyError
    ├── IndexError
    ├── OSError
    │   ├── FileNotFoundError
    │   ├── PermissionError
    │   └── ...
    ├── ArithmeticError
    │   ├── ZeroDivisionError
    │   └── ...
    └── ...
```

### 三种捕获方式的区别

```python
# 1. 裸 except：捕获 BaseException，包括 SystemExit 和 KeyboardInterrupt
try:
    number = int(input())
except:
    print("出错了")    # 连 Ctrl+C 都会被吞掉！

# 2. except Exception：捕获 Exception 及子类，不包括 SystemExit / KeyboardInterrupt
try:
    number = int(input())
except Exception:
    print("出错了")    # Ctrl+C 仍然能正常中断程序

# 3. 指定类型：最精确，推荐
try:
    number = int(input())
except ValueError:
    print("请输入数字")
```

**为什么不要裸 except？**

1. `except:` 会捕获 `SystemExit` 和 `KeyboardInterrupt`，导致 `Ctrl+C` 无法中断程序。
2. 会把所有错误都吞掉，包括你没预料到的。
3. 隐藏真正的 bug，调试时很难定位问题。
4. 企业代码审查中，裸 except 通常会被打回。

**底线：实在要兜底，用 `except Exception:`，不要用裸 `except:`。**

JS 的 `catch` 默认就是捕获所有错误，类似裸 except。企业 JS 代码也应该在 catch 里判断错误类型。

## 七、finally：无论是否出错都会执行

```python
try:
    number = int(input("请输入数字："))
    print(number)
except ValueError:
    print("输入不合法")
finally:
    print("程序结束")
```

`finally` 里的代码，不管有没有异常，都会执行。

常见用途：

1. 关闭文件。
2. 关闭数据库连接。
3. 释放资源。
4. 记录日志。

不过 Python 用 `with` 语句时，文件会自动关闭，不需要在 `finally` 里手动关。

JS 也有 `finally`：

```js
try {
  const number = parseInt(prompt('请输入数字：'), 10)
  console.log(number)
} catch (error) {
  console.log('输入不合法')
} finally {
  console.log('程序结束')
}
```

## 八、else：没有异常时执行

```python
try:
    number = int(input("请输入数字："))
except ValueError:
    print("输入不合法")
else:
    print(f"你输入的是 {number}")
```

`else` 表示 try 里没有出错时执行。Python 特有语法，JS 没有 `try-catch-else`。

**else 的价值**：把「可能出错的代码」和「成功后的逻辑」分开，避免不小心捕获了后续代码的异常：

```python
try:
    number = int(input("请输入数字："))
except ValueError:
    print("输入不合法")
else:
    # 如果这里的代码也出错，不会被上面的 except 捕获
    result = 100 / number
    print(f"结果：{result}")
```

如果 `100 / number` 写在 try 里面，且用户输入 0，会被 `except ValueError` 漏掉（实际报的是 `ZeroDivisionError`），导致异常往上抛。

JS 对照：

```js
try {
  const number = parseInt(prompt('请输入数字：'), 10)
  if (isNaN(number)) throw new Error('invalid')
  console.log(`你输入的是 ${number}`)   // 正常逻辑放这里
} catch (error) {
  console.log('输入不合法')
}
```

JS 里正常逻辑直接写在 try 里，不需要 else。

## 九、try-except-else-finally 完整执行顺序

四者可以同时出现，执行顺序是固定的：

```python
def demo(x):
    print("--- 开始 ---")
    try:
        print("1. try 执行")
        if x == 0:
            raise ValueError("x 不能为 0")
        result = 100 / x
    except ValueError as e:
        print(f"2. except 捕获：{e}")
        result = None
    else:
        print(f"3. else 执行，结果：{result}")
    finally:
        print("4. finally 执行")
    print(f"--- 结束，result = {result} ---")
    return result

demo(5)    # 正常流程：try → else → finally
demo(0)    # 异常流程：try → except → finally
```

执行顺序总结：

| 情况 | 执行顺序 |
| --- | --- |
| 没有异常 | `try` → `else` → `finally` |
| 有异常被捕获 | `try` → `except` → `finally` |
| 有异常未被捕获 | `try` → `finally` → 异常继续往上抛 |

**关键：`finally` 永远执行，哪怕 try 里 return 了也会先执行 finally。**

## 十、主动抛出异常 raise

Python 用 `raise` 主动抛出异常：

```python
def set_age(age):
    if age < 0:
        raise ValueError("年龄不能为负数")
    if age > 150:
        raise ValueError("年龄不合理")
    return age

try:
    set_age(-5)
except ValueError as e:
    print(f"错误：{e}")
```

输出：

```text
错误：年龄不能为负数
```

JS 用 `throw`：

```js
function setAge(age) {
  if (age < 0) throw new Error('年龄不能为负数')
  if (age > 150) throw new Error('年龄不合理')
  return age
}

try {
  setAge(-5)
} catch (error) {
  console.log(`错误：${error.message}`)
}
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 主动抛出 | `raise ValueError("msg")` | `throw new Error("msg")` |
| 关键字 | `raise` | `throw` |
| 异常对象 | `ValueError`, `TypeError` 等 | `Error`, `TypeError` 等 |

### 重新抛出当前异常

在 except 块里，可以用 `raise`（不带参数）重新抛出当前异常：

```python
try:
    data = json.load(open("data.json"))
except json.JSONDecodeError as e:
    print(f"JSON 解析失败：{e}")
    # 记录日志后，把异常继续往上抛
    raise
```

## 十一、自定义异常类

企业项目里，内置异常不够用。你可以继承 `Exception` 定义自己的异常。

### 基本写法

```python
class BusinessError(Exception):
    """业务逻辑异常的基类"""
    pass


class ArticleNotFoundError(BusinessError):
    """文章不存在"""
    pass


class PermissionDeniedError(BusinessError):
    """没有权限"""
    pass


# 使用
def get_article(article_id):
    if article_id not in database:
        raise ArticleNotFoundError(f"文章 {article_id} 不存在")
    return database[article_id]


try:
    article = get_article(999)
except ArticleNotFoundError as e:
    print(f"找不到文章：{e}")
except PermissionDeniedError:
    print("你没有权限查看")
except BusinessError:
    # 捕获所有业务异常（因为它们都继承 BusinessError）
    print("业务出错")
```

### 携带上下文信息

好的自定义异常应该携带结构化信息，方便调用方处理：

```python
class ValidationError(Exception):
    """数据校验失败"""

    def __init__(self, message, field=None, value=None):
        super().__init__(message)
        self.field = field    # 哪个字段出错
        self.value = value    # 传入的值是什么

    def __str__(self):
        return f"{super().__str__()} (字段: {self.field}, 值: {self.value})"


# 使用
def validate_email(email):
    if "@" not in email:
        raise ValidationError("邮箱格式错误", field="email", value=email)


try:
    validate_email("invalid-email")
except ValidationError as e:
    print(f"校验失败：{e}")
    print(f"出错字段：{e.field}")
    print(f"出错值：{e.value}")
```

### 自定义异常体系设计

企业项目通常建一个异常基类，其他业务异常从它派生，方便统一捕获：

```python
class AppError(Exception):
    """应用所有异常的基类"""
    def __init__(self, message, code=None):
        super().__init__(message)
        self.code = code    # 错误码，方便前端处理


class DataError(AppError):
    """数据相关异常"""
    pass


class NetworkError(AppError):
    """网络相关异常"""
    pass


class AuthError(AppError):
    """认证授权异常"""
    pass


# 这样可以统一捕获所有应用异常
try:
    do_something()
except AppError as e:
    print(f"应用错误 [{e.code}]：{e}")
```

**自定义异常的规则：**

1. 继承 `Exception`（不要继承 `BaseException`，否则 `except Exception` 捕获不到）。
2. 异常类名以 `Error` 结尾（如 `BusinessError`，不是 `BusinessException`）。
3. 在 `__init__` 里保存结构化信息，别依赖 `args` 元组。
4. 集中定义在 `exceptions.py`，控制 `__all__` 导出。

JS 对照（JS 自定义错误也是继承）：

```js
class BusinessError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
  }
}

class ArticleNotFoundError extends BusinessError {
  constructor(articleId) {
    super(`文章 ${articleId} 不存在`, 'ARTICLE_NOT_FOUND')
    this.name = 'ArticleNotFoundError'
  }
}

throw new ArticleNotFoundError(999)
```

## 十二、异常链：raise from

当你在 except 里抛出一个新异常时，原始异常的信息会丢失。用 `raise ... from ...` 可以保留异常链，方便调试。

### 不用 from（原始异常丢失）

```python
try:
    number = int("abc")
except ValueError:
    raise RuntimeError("数据处理失败")   # 原始的 ValueError 信息没了
```

输出：

```text
RuntimeError: 数据处理失败
```

### 用 from（保留异常链）

```python
try:
    number = int("abc")
except ValueError as e:
    raise RuntimeError("数据处理失败") from e
```

输出：

```text
ValueError: invalid literal for int() with base 10: 'abc'

The above exception was the direct cause of the following exception:

RuntimeError: 数据处理失败
```

可以看到完整的因果链：`ValueError` 导致了 `RuntimeError`。

### raise from None（主动切断链）

如果你确定原始异常对调试没用（或包含敏感信息），可以用 `from None` 切断：

```python
try:
    number = int("abc")
except ValueError:
    raise RuntimeError("数据处理失败") from None   # 不显示原始异常
```

### 两种异常链属性

```python
try:
    try:
        int("abc")
    except ValueError as e:
        raise RuntimeError("上层错误") from e
except RuntimeError as e:
    print(e.__cause__)     # 显式链：ValueError（由 from 设置）
    print(e.__context__)   # 隐式链：ValueError（except 块里自动设置）
```

- `__cause__`：由 `raise ... from ...` 显式设置。
- `__context__`：在 except 块里抛新异常时，Python 自动设置（即使不用 `from`）。

JS 没有原生的异常链机制（ES2022 的 `Error.cause` 是后来加的）：

```js
try {
  // ...
} catch (error) {
  throw new Error('数据处理失败', { cause: error })   // ES2022+
}
```

## 十三、异常的传递（冒泡）

异常如果没被捕获，会沿着函数调用链一直往上抛，直到被捕获或到达最顶层导致程序崩溃。这叫**异常传递**或**冒泡**。

```python
def read_data():
    return int("abc")          # 这里抛出 ValueError

def process_data():
    data = read_data()         # 没有捕获，继续往上抛
    return data * 2

def main():
    try:
        result = process_data()    # 在这里捕获
        print(result)
    except ValueError as e:
        print(f"处理失败：{e}")     # 输出：处理失败：invalid literal...

main()
```

traceback 会显示完整的调用链：

```text
Traceback (most recent call last):
  File "demo.py", line 12, in main
    result = process_data()
  File "demo.py", line 7, in process_data
    data = read_data()
  File "demo.py", line 2, in read_data
    return int("abc")
ValueError: invalid literal for int() with base 10: 'abc'
```

**设计原则：在底层抛出异常，在能处理的地方捕获。** 不要在每一层都 try-except，那样代码会很啰嗦。

## 十四、断言 assert

`assert` 用于「断言某个条件必须为真」，否则抛出 `AssertionError`。主要用于开发和测试阶段检查不变量。

```python
def calculate_average(numbers):
    assert len(numbers) > 0, "列表不能为空"   # 条件为假时报错
    return sum(numbers) / len(numbers)

calculate_average([])   # AssertionError: 列表不能为空
```

等价于：

```python
if not (len(numbers) > 0):
    raise AssertionError("列表不能为空")
```

### assert 的注意事项

1. **assert 可以被禁用**：用 `python -O script.py`（优化模式）运行时，所有 `assert` 语句会被跳过。所以**不要用 assert 做数据校验**，那应该用 `if + raise`。

```python
# 错误：生产环境 -O 模式下这行会被跳过，用户可以绕过校验
assert user.is_admin, "需要管理员权限"

# 正确：用 if + raise
if not user.is_admin:
    raise PermissionError("需要管理员权限")
```

2. **assert 用于检查程序内部的逻辑不变量**，不是外部输入校验。比如函数的前置条件、后置条件。

```python
def withdraw(account, amount):
    assert amount > 0, "取款金额必须为正"           # 内部逻辑检查
    assert amount <= account.balance, "余额不足"     # 内部逻辑检查
    account.balance -= amount
    assert account.balance >= 0, "余额不能为负"      # 后置条件检查
    return account.balance
```

JS 也有 `console.assert`，但行为不同（只打印不抛异常）：

```js
console.assert(amount > 0, '取款金额必须为正')   // 只打印，不中断
```

## 十五、记录异常：logging 和 traceback

企业项目里，异常不能只 `print`，要用 `logging` 模块记录到日志文件。

### logging.exception

`logging.exception()` 会自动记录异常的完整 traceback：

```python
import logging

logging.basicConfig(
    filename="app.log",
    level=logging.ERROR,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def divide(a, b):
    return a / b

try:
    result = divide(10, 0)
except ZeroDivisionError:
    logging.exception("除法计算失败")   # 自动带上 traceback
    # 程序继续运行，不会崩溃
```

`app.log` 内容：

```text
2026-06-26 10:00:00 - ERROR - 除法计算失败
Traceback (most recent call last):
  File "demo.py", line 9, in <module>
    result = divide(10, 0)
  File "demo.py", line 6, in divide
    return a / b
ZeroDivisionError: division by zero
```

### traceback 模块

如果想手动获取或打印异常的 traceback，用 `traceback` 模块：

```python
import traceback

try:
    1 / 0
except ZeroDivisionError:
    # 获取完整的错误信息字符串
    error_msg = traceback.format_exc()
    print("发生错误：")
    print(error_msg)
```

### 记录日志后重新抛出

企业代码的常见模式：记录日志，然后让异常继续往上传：

```python
import logging

logger = logging.getLogger(__name__)

def process_order(order_id):
    try:
        order = fetch_order(order_id)
        return charge_payment(order)
    except Exception:
        logger.exception(f"订单处理失败：{order_id}")
        raise    # 记录完后继续往上抛，让上层决定怎么处理
```

JS 对照（Node.js）：

```js
const winston = require('winston')
const logger = winston.createLogger({ /* ... */ })

try {
  processOrder(orderId)
} catch (error) {
  logger.error('订单处理失败', { orderId, error: error.stack })
  throw error
}
```

## 十六、异常处理语法对照总表

| 功能 | Python | JS |
| --- | --- | --- |
| 捕获异常 | `try: ... except:` | `try { ... } catch (e) {` |
| 指定异常类型 | `except ValueError:` | 在 catch 里判断 |
| 获取异常对象 | `except ValueError as e:` | `catch (e) {` |
| 无论如何执行 | `finally:` | `} finally {` |
| 无异常时执行 | `else:` | 无（写在 try 里） |
| 主动抛出 | `raise ValueError("msg")` | `throw new Error("msg")` |
| 重新抛出 | `raise`（不带参数） | `throw error` |
| 异常链 | `raise X from e` | `new Error(msg, { cause })` |
| 断言 | `assert cond, "msg"` | `console.assert`（不抛异常） |
| 关键字差异 | `except` | `catch` |

## 十七、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 捕获关键字 | `except` | `catch` | 最容易写错！ |
| 指定异常类型 | `except ValueError:` | catch 里 if 判断 | Python 更精确 |
| 无异常时执行 | `else:` | 无 | Python 独有 |
| 主动抛出 | `raise` | `throw` | raise vs throw |
| 重新抛出 | `raise` | `throw error` | Python 不带参数 |
| 异常链 | `raise X from e` | `Error(msg, {cause})` | Python 用 from |
| 断言 | `assert` | `console.assert` | Python 会抛异常 |
| 除以零 | `ZeroDivisionError` | 返回 `Infinity` | Python 报错，JS 不报 |
| 越界访问 | `IndexError` | 返回 `undefined` | Python 报错，JS 不报 |
| 键不存在 | `KeyError` | 返回 `undefined` | Python 报错，JS 不报 |
| 类型错误 | `TypeError` | `TypeError` | 一样 |
| 获取异常信息 | `except E as e:` | `catch (e) { e.message }` | Python 用 as |
| 自定义异常 | `class XError(Exception)` | `class XError extends Error` | 都继承基类 |

## 十八、异常处理最佳实践

### 1. 捕获要具体，不要裸 except

```python
# 不好：裸 except 吞掉一切
try:
    data = json.load(f)
except:
    print("出错了")

# 好：捕获具体异常
try:
    data = json.load(f)
except FileNotFoundError:
    print("文件不存在")
except json.JSONDecodeError as e:
    print(f"JSON 格式错误：{e}")
```

### 2. 不要捕获了不处理（吞异常）

```python
# 不好：捕获了什么都没做
try:
    do_something()
except Exception:
    pass    # 静默吞掉，出了问题完全不知道

# 好：至少记录日志
try:
    do_something()
except Exception:
    logger.exception("do_something 失败")
    raise    # 或者重新抛出
```

### 3. try 里只放可能出错的代码

```python
# 不好：把所有代码都塞进 try
try:
    number = int(input())
    result = number * 2
    print(f"结果是 {result}")     # 这行不会出错，不该在 try 里
except ValueError:
    print("输入错误")

# 好：try 里只放可能出错的
try:
    number = int(input())
except ValueError:
    print("输入错误")
else:
    result = number * 2
    print(f"结果是 {result}")
```

### 4. 底层抛异常，上层捕获

```python
# 底层函数：只管抛
def fetch_user(user_id):
    user = db.find(user_id)
    if user is None:
        raise UserNotFoundError(user_id)
    return user

# 上层函数：决定怎么处理
def show_profile(user_id):
    try:
        user = fetch_user(user_id)
        render(user)
    except UserNotFoundError:
        show_404_page()
```

### 5. 转换异常类型时保留原始信息

```python
# 好：用 raise from 保留原始异常
try:
    response = requests.get(url)
    response.raise_for_status()
except requests.RequestException as e:
    raise NetworkError("获取数据失败") from e
```

## 十九、企业项目实战：安全的配置读取

```python
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class ConfigError(Exception):
    """配置加载异常"""
    def __init__(self, message, path=None):
        super().__init__(message)
        self.path = path


DEFAULT_CONFIG = {"page_size": 10, "site_name": "我的知识库"}


def load_config(config_path="config.json"):
    """安全读取配置文件"""
    try:
        with open(config_path, "r", encoding="utf-8") as file:
            config = json.load(file)
    except FileNotFoundError:
        logger.warning(f"配置文件 {config_path} 不存在，使用默认配置")
        return DEFAULT_CONFIG
    except json.JSONDecodeError as e:
        logger.error(f"配置文件格式错误：{e}")
        raise ConfigError(f"配置文件格式错误：{e}", path=config_path) from e
    except Exception as e:
        logger.exception(f"读取配置时出错：{e}")
        raise ConfigError(f"读取配置出错：{e}", path=config_path) from e
    else:
        logger.info("配置文件读取成功")
        return config
    finally:
        logger.debug("配置加载流程结束")


# 测试
try:
    config = load_config()
    print(f"站点名称：{config.get('site_name', '默认站点')}")
except ConfigError as e:
    print(f"配置加载失败，使用默认值：{e}")
    config = DEFAULT_CONFIG
```

这个例子展示了企业代码的典型模式：

1. `try` 里只放可能出错的代码。
2. `except FileNotFoundError` 处理文件不存在，返回默认值。
3. `except json.JSONDecodeError` 处理 JSON 格式错误，用 `raise from` 转换成业务异常。
4. `except Exception` 兜底，记录完整日志后转换成业务异常。
5. `else` 只在成功时执行。
6. `finally` 无论成败都记录日志。
7. 自定义 `ConfigError` 携带 `path` 等上下文信息。
8. 上层用 `except ConfigError` 统一处理。

## 二十、本篇练习

练习一：安全除法。

```python
try:
    a = float(input("请输入第一个数字："))
    b = float(input("请输入第二个数字："))
    result = a / b
except ValueError:
    print("请输入合法数字")
except ZeroDivisionError:
    print("第二个数字不能是 0")
else:
    print(f"计算结果：{result}")
finally:
    print("计算结束")
```

练习二：自定义异常。

```python
class InvalidScoreError(Exception):
    """分数不合法"""
    def __init__(self, score, reason):
        super().__init__(f"分数 {score} 不合法：{reason}")
        self.score = score
        self.reason = reason


def grade_score(score):
    if not isinstance(score, (int, float)):
        raise InvalidScoreError(score, "必须是数字")
    if score < 0 or score > 100:
        raise InvalidScoreError(score, "必须在 0-100 之间")
    if score >= 90:
        return "优秀"
    elif score >= 60:
        return "及格"
    else:
        return "不及格"


try:
    print(grade_score(85))
    print(grade_score(120))
except InvalidScoreError as e:
    print(f"错误：{e}")
```

练习三：找错误。

```python
# 错误 1：裸 except
try:
    number = int(input("请输入数字："))
except:            # 不好！会吞掉所有错误
    print("出错了")

# 正确
try:
    number = int(input("请输入数字："))
except ValueError:
    print("请输入合法数字")
```

```python
# 错误 2：把 except 和 catch 混了
try:
    x = 1 / 0
catch ZeroDivisionError:    # SyntaxError! Python 没有 catch
    print("不能除以零")

# 正确
try:
    x = 1 / 0
except ZeroDivisionError:
    print("不能除以零")
```

```python
# 错误 3：用 assert 做用户权限校验
assert user.is_admin, "需要管理员权限"   # -O 模式会被跳过！

# 正确：用 if + raise
if not user.is_admin:
    raise PermissionError("需要管理员权限")
```

## 本篇小结

1. Python 用 `try-except`，JS 用 `try-catch`——关键字不同！
2. Python 可以按异常类型捕获 `except ValueError:`，JS 在 catch 里判断。
3. Python 的异常类型比 JS 更细分（`ValueError`、`KeyError`、`IndexError` 等）。
4. Python 除以零、越界、键不存在都会报异常，JS 静默返回特殊值。
5. `finally` 无论是否异常都会执行，Python 和 JS 相同。
6. `else` 是 Python 特有，JS 没有——用于把成功逻辑和可能出错的代码分开。
7. `raise` 主动抛出异常，JS 用 `throw`；`raise`（不带参数）重新抛出当前异常。
8. 不要裸写 `except:`（会捕获 `SystemExit`、`KeyboardInterrupt`），至少用 `except Exception:`。
9. 异常是继承树：`BaseException` → `Exception` → 各种内置异常，`except` 按从上到下匹配，具体的写前面。
10. 自定义异常继承 `Exception`，类名以 `Error` 结尾，在 `__init__` 里保存结构化信息。
11. `raise X from e` 保留异常链，`raise X from None` 切断链；`__cause__` 显式链，`__context__` 隐式链。
12. 异常会沿调用链冒泡，在底层抛出、在能处理的地方捕获。
13. `assert` 用于检查内部不变量，不要用于外部输入校验（`-O` 模式会跳过）。
14. 企业代码用 `logging.exception()` 记录异常，不要只 `print`。
15. 最佳实践：捕获要具体、不要吞异常、try 里只放可能出错的代码、转换异常时用 `raise from`。
