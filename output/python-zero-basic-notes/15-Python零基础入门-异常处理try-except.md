---
title: Python 零基础入门 15：异常处理 try except
slug: python-zero-exception-handling
summary: 讲解程序为什么会报错，如何使用 try except 捕获异常，如何处理输入错误、文件不存在等常见问题，并说明面试中异常处理的表达方式。
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

这些问题在 Python 里通常叫异常。

异常处理的目标不是“让错误消失”，而是：**遇到可预期的问题时，让程序有更友好的处理方式。**

## 一个会报错的例子

```python
age = int(input("请输入年龄："))
print(f"明年你 {age + 1} 岁")
```

如果用户输入：

```text
18
```

运行正常。

如果用户输入：

```text
十八
```

程序会报错，因为 `int()` 不能把“十八”转成整数。

## 使用 try except

```python
try:
    age = int(input("请输入年龄："))
    print(f"明年你 {age + 1} 岁")
except ValueError:
    print("年龄必须输入数字")
```

运行示例：

```text
请输入年龄：十八
年龄必须输入数字
```

代码意思是：

- `try` 里面放可能出错的代码。
- 如果出现 `ValueError`，就执行 `except ValueError` 里的代码。
- 程序不会直接崩掉，而是给出友好提示。

## 捕获文件不存在

```python
try:
    with open("data.txt", "r", encoding="utf-8") as file:
        content = file.read()
    print(content)
except FileNotFoundError:
    print("文件不存在，请先创建 data.txt")
```

如果 `data.txt` 不存在，运行结果：

```text
文件不存在，请先创建 data.txt
```

## 不建议直接捕获所有异常

你可能见过这种写法：

```python
try:
    number = int(input("请输入数字："))
except:
    print("出错了")
```

它能运行，但不推荐新手长期这样写。

原因是：它会把所有错误都吞掉，你不知道真正发生了什么。

更好的写法是明确捕获异常类型：

```python
try:
    number = int(input("请输入数字："))
except ValueError:
    print("请输入合法数字")
```

## finally：无论是否出错都会执行

`finally` 里的代码，不管前面有没有异常，都会执行。

```python
try:
    number = int(input("请输入数字："))
    print(number)
except ValueError:
    print("输入不合法")
finally:
    print("程序结束")
```

输入错误时：

```text
请输入数字：abc
输入不合法
程序结束
```

输入正确时：

```text
请输入数字：123
123
程序结束
```

## else：没有异常时执行

`else` 表示 try 里面没有出错时执行。

```python
try:
    number = int(input("请输入数字："))
except ValueError:
    print("输入不合法")
else:
    print(f"你输入的是 {number}")
```

运行示例：

```text
请输入数字：10
你输入的是 10
```

## 实战：让记账本更稳

前面的记账本里有一行：

```python
amount = float(input("请输入金额："))
```

如果用户输入“十元”，程序会报错。

可以改成：

```python
while True:
    amount_text = input("请输入金额：")

    try:
        amount = float(amount_text)
        break
    except ValueError:
        print("金额必须是数字，请重新输入")
```

这样用户输错时，可以重新输入。

## 面试怎么说

如果面试官问：“你怎么理解 Python 异常处理？”

可以这样回答：

```text
异常处理是为了处理程序运行中可预期的错误，比如输入格式错误、文件不存在、网络请求失败。
我会把可能出错的代码放在 try 里，然后针对具体异常类型写 except。
一般不建议裸写 except，因为它会隐藏真实错误。
必要时可以用 finally 做资源清理，比如关闭连接、记录日志。
```

这个回答比只说“try except 可以捕获错误”更像工程表达。

## 本篇小练习

写一个安全除法程序：

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

运行示例：

```text
请输入第一个数字：10
请输入第二个数字：2
计算结果：5.0
计算结束
```

## 本篇小结

- 异常是程序运行时出现的问题。
- `try` 放可能出错的代码。
- `except` 处理指定异常。
- `else` 在没有异常时执行。
- `finally` 无论是否异常都会执行。
- 面试时要强调“针对具体异常处理”，不要只会裸写 `except`。
