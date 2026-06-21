---
title: Python 零基础入门 06：数字和简单计算
slug: python-zero-numbers-and-operators
summary: 介绍整数、小数、加减乘除、取余、整除、幂运算和赋值运算，帮助新手理解 Python 如何进行简单计算。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 06：数字和简单计算

Python 可以像计算器一样做计算。

这一篇先学习最常见的数字运算。

## 加减乘除

```python
print(10 + 3)
print(10 - 3)
print(10 * 3)
print(10 / 3)
```

运行结果：

```text
13
7
30
3.3333333333333335
```

符号含义：

- `+` 加法
- `-` 减法
- `*` 乘法
- `/` 除法

注意，乘法不是 `×`，而是英文星号 `*`。

## 整除

整除使用 `//`，结果只保留整数部分。

```python
print(10 // 3)
```

运行结果：

```text
3
```

因为 10 除以 3 是 3 点多，整除只取 3。

## 取余

取余使用 `%`，表示除完之后剩多少。

```python
print(10 % 3)
```

运行结果：

```text
1
```

因为 10 除以 3，商是 3，剩 1。

取余常用于判断奇偶数。

```python
number = 8
print(number % 2)
```

运行结果：

```text
0
```

一个数字除以 2 余数为 0，就说明它是偶数。

## 幂运算

幂运算使用 `**`。

```python
print(2 ** 3)
```

运行结果：

```text
8
```

意思是 2 的 3 次方，也就是：

```text
2 * 2 * 2
```

## 运算顺序

Python 也遵守常见数学顺序：先乘除，后加减。

```python
print(2 + 3 * 4)
```

运行结果：

```text
14
```

如果想先算加法，可以加括号。

```python
print((2 + 3) * 4)
```

运行结果：

```text
20
```

## 变量参与计算

```python
price = 20
count = 3
total = price * count

print(total)
```

运行结果：

```text
60
```

这比直接写 `20 * 3` 更清楚，因为变量名说明了含义。

## 简写赋值

假设你有一个分数：

```python
score = 10
score = score + 5
print(score)
```

运行结果：

```text
15
```

可以简写成：

```python
score = 10
score += 5
print(score)
```

运行结果一样：

```text
15
```

常见简写：

- `+=` 加后再赋值
- `-=` 减后再赋值
- `*=` 乘后再赋值
- `/=` 除后再赋值

## 小数计算可能不完全精确

运行下面代码：

```python
print(0.1 + 0.2)
```

你可能看到：

```text
0.30000000000000004
```

这不是你写错了，而是计算机表示小数时会有精度问题。

新手阶段先知道这个现象就可以。以后做金额计算时，会学习更合适的方式。

## 本篇小练习

计算买 4 本书的总价：

```python
book_price = 35
book_count = 4
total_price = book_price * book_count

print(f"单价：{book_price} 元")
print(f"数量：{book_count} 本")
print(f"总价：{total_price} 元")
```

运行结果：

```text
单价：35 元
数量：4 本
总价：140 元
```

## 本篇小结

- Python 可以做加减乘除。
- `//` 是整除，`%` 是取余，`**` 是幂运算。
- 可以用变量保存计算结果。
- 小数计算可能出现精度现象，新手先知道即可。
