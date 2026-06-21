---
title: Python 零基础入门 12：函数 function
slug: python-zero-functions
summary: 解释函数为什么存在，讲解 def、参数、返回值、默认参数，并通过问候语和求和示例帮助新手理解代码复用。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 12：函数 function

函数可以理解成：**给一段代码起名字，之后需要时直接调用。**

比如你经常要输出欢迎语，就可以把它写成函数。

## 定义第一个函数

```python
def say_hello():
    print("你好，欢迎学习 Python")
```

这段代码只是定义函数，还不会输出内容。

要调用函数，需要写：

```python
say_hello()
```

完整代码：

```python
def say_hello():
    print("你好，欢迎学习 Python")

say_hello()
```

运行结果：

```text
你好，欢迎学习 Python
```

## 函数为什么有用

如果不用函数，重复输出欢迎语要写很多遍：

```python
print("你好，欢迎学习 Python")
print("你好，欢迎学习 Python")
print("你好，欢迎学习 Python")
```

使用函数：

```python
def say_hello():
    print("你好，欢迎学习 Python")

say_hello()
say_hello()
say_hello()
```

代码更清楚，也更容易修改。

## 带参数的函数

参数可以理解成：调用函数时传进去的数据。

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

这里的 `name` 就是参数。

## 多个参数

```python
def introduce(name, age):
    print(f"我叫{name}，今年{age}岁")

introduce("小明", 18)
```

运行结果：

```text
我叫小明，今年18岁
```

调用时，参数顺序要对应。

## 返回值 return

有些函数不只是输出内容，还要把计算结果交给外面使用。

这时用 `return`。

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)
```

运行结果：

```text
8
```

`return a + b` 的意思是：把 `a + b` 的结果返回出去。

## print 和 return 的区别

`print` 是显示给人看。

`return` 是把结果交给程序继续使用。

看例子：

```python
def add(a, b):
    return a + b

total = add(10, 20)
final_price = total + 5

print(final_price)
```

运行结果：

```text
35
```

如果函数只 `print`，外面就不方便继续拿结果计算。

## 默认参数

参数可以有默认值。

```python
def say_hello(name="朋友"):
    print(f"你好，{name}")

say_hello()
say_hello("小明")
```

运行结果：

```text
你好，朋友
你好，小明
```

如果调用时不传参数，就使用默认值。

## 函数命名建议

函数名建议使用英文动词或动词短语：

```python
get_name()
calculate_total()
print_user_info()
```

名字要尽量说明这个函数做什么。

## 本篇小练习

写一个计算总价的函数：

```python
def calculate_total(price, count):
    return price * count

total = calculate_total(9.9, 3)
print(f"总价：{total} 元")
```

运行结果：

```text
总价：29.700000000000003 元
```

## 本篇小结

- 函数是给一段代码起名字。
- `def` 用来定义函数。
- 参数是传给函数的数据。
- `return` 用来返回结果。
- 函数能让代码更清楚，也能减少重复。
