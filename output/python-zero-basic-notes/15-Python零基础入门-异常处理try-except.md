---
title: Python 零基础入门 15：异常处理 try except
slug: python-zero-exception-handling
summary: 讲解程序为什么会报错，如何使用 try except 捕获异常，如何处理输入错误、文件不存在等常见问题，全程对照 JavaScript。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 15：异常处理 try except

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

## 六、不建议裸写 except

```python
try:
    number = int(input("请输入数字："))
except:            # 裸 except，捕获所有异常
    print("出错了")
```

它能运行，但不推荐。原因是：

1. 会把所有错误都吞掉，包括你没预料到的。
2. 隐藏了真正的 bug，调试时很难定位问题。
3. 企业代码审查中，裸 except 通常会被打回。

更好的写法是明确捕获异常类型：

```python
try:
    number = int(input("请输入数字："))
except ValueError:
    print("请输入合法数字")
```

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

## 九、主动抛出异常 raise

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

## 十、异常处理语法对照总表

| 功能 | Python | JS |
| --- | --- | --- |
| 捕获异常 | `try: ... except:` | `try { ... } catch (e) {` |
| 指定异常类型 | `except ValueError:` | 在 catch 里判断 |
| 获取异常对象 | `except ValueError as e:` | `catch (e) {` |
| 无论如何执行 | `finally:` | `} finally {` |
| 无异常时执行 | `else:` | 无（写在 try 里） |
| 主动抛出 | `raise ValueError("msg")` | `throw new Error("msg")` |
| 关键字差异 | `except` | `catch` |

## 十一、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 捕获关键字 | `except` | `catch` | 最容易写错！ |
| 指定异常类型 | `except ValueError:` | catch 里 if 判断 | Python 更精确 |
| 无异常时执行 | `else:` | 无 | Python 独有 |
| 主动抛出 | `raise` | `throw` | raise vs throw |
| 除以零 | `ZeroDivisionError` | 返回 `Infinity` | Python 报错，JS 不报 |
| 越界访问 | `IndexError` | 返回 `undefined` | Python 报错，JS 不报 |
| 键不存在 | `KeyError` | 返回 `undefined` | Python 报错，JS 不报 |
| 类型错误 | `TypeError` | `TypeError` | 一样 |
| 获取异常信息 | `except E as e:` | `catch (e) { e.message }` | Python 用 as |

## 十二、企业项目实战：安全的配置读取

```python
import json
from pathlib import Path

def load_config(config_path="config.json"):
    """安全读取配置文件"""
    try:
        with open(config_path, "r", encoding="utf-8") as file:
            config = json.load(file)
    except FileNotFoundError:
        print(f"配置文件 {config_path} 不存在，使用默认配置")
        return {"page_size": 10, "site_name": "我的知识库"}
    except json.JSONDecodeError as e:
        print(f"配置文件格式错误：{e}")
        return {"page_size": 10, "site_name": "我的知识库"}
    except Exception as e:
        print(f"读取配置时出错：{e}")
        return {"page_size": 10, "site_name": "我的知识库"}
    else:
        print("配置文件读取成功")
        return config
    finally:
        print("配置加载完成")

# 测试
config = load_config()
print(f"站点名称：{config.get('site_name', '默认站点')}")
```

这个例子展示了企业代码的典型模式：

1. `try` 里放可能出错的代码。
2. `except FileNotFoundError` 处理文件不存在。
3. `except json.JSONDecodeError` 处理 JSON 格式错误。
4. `except Exception` 兜底处理其他错误。
5. `else` 只在成功时执行。
6. `finally` 无论成败都执行。
7. 出错时返回默认值，不崩溃。

## 十三、本篇练习

练习一：安全除法。

Python：

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

练习二：找错误。

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

## 本篇小结

1. Python 用 `try-except`，JS 用 `try-catch`——关键字不同！
2. Python 可以按异常类型捕获 `except ValueError:`，JS 在 catch 里判断。
3. Python 的异常类型比 JS 更细分（`ValueError`、`KeyError`、`IndexError` 等）。
4. Python 除以零、越界、键不存在都会报异常，JS 静默返回特殊值。
5. `finally` 无论是否异常都会执行，Python 和 JS 相同。
6. `else` 是 Python 特有，JS 没有。
7. `raise` 主动抛出异常，JS 用 `throw`。
8. 不要裸写 `except:`，要指定具体异常类型。
