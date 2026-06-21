---
title: Python 零基础入门 07：input 输入和类型转换
slug: python-zero-input-and-convert
summary: 讲解 input 如何接收用户输入，为什么 input 得到的是字符串，以及如何使用 int、float、str 做类型转换。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 07：input 输入和类型转换

前面的代码都是我们提前写好数据。

这一篇开始，让用户在运行时输入内容。

## 使用 input 接收输入

```python
name = input("请输入你的名字：")
print(f"你好，{name}")
```

运行时，屏幕会显示：

```text
请输入你的名字：
```

如果你输入：

```text
小明
```

运行结果：

```text
你好，小明
```

## input 括号里的文字是什么

`input("请输入你的名字：")` 里面的文字叫提示语。

它会告诉用户应该输入什么。

```python
city = input("请输入你的城市：")
print(f"你来自{city}")
```

运行示例：

```text
请输入你的城市：杭州
你来自杭州
```

## input 得到的都是字符串

这是新手必须记住的一点：

**input 得到的内容，默认都是字符串。**

看下面代码：

```python
age = input("请输入年龄：")
print(type(age))
```

输入：

```text
18
```

运行结果：

```text
<class 'str'>
```

虽然你输入的是 `18`，但 Python 把它当成文本 `"18"`。

## 字符串不能直接做数字计算

下面代码会报错：

```python
age = input("请输入年龄：")
next_year_age = age + 1
print(next_year_age)
```

原因是：`age` 是字符串，`1` 是整数，不能直接相加。

## 使用 int 转成整数

可以用 `int()` 把合适的字符串转成整数。

```python
age_text = input("请输入年龄：")
age = int(age_text)
next_year_age = age + 1

print(f"明年你 {next_year_age} 岁")
```

输入：

```text
18
```

运行结果：

```text
明年你 19 岁
```

也可以简写：

```python
age = int(input("请输入年龄："))
print(f"明年你 {age + 1} 岁")
```

## 使用 float 转成小数

如果输入的是价格、身高、体重这类可能带小数的数据，可以用 `float()`。

```python
price = float(input("请输入商品单价："))
count = int(input("请输入购买数量："))
total = price * count

print(f"总价：{total} 元")
```

输入示例：

```text
请输入商品单价：9.9
请输入购买数量：3
```

运行结果：

```text
总价：29.700000000000003 元
```

这里出现小数精度现象，暂时不用紧张。

## 使用 str 转成字符串

有时需要把数字转成字符串。

```python
age = 18
text = "年龄：" + str(age)
print(text)
```

运行结果：

```text
年龄：18
```

不过实际输出时，更推荐使用 f-string：

```python
age = 18
print(f"年龄：{age}")
```

## 输入不合法会报错

如果代码需要整数：

```python
age = int(input("请输入年龄："))
```

但用户输入：

```text
十八
```

程序会报错，因为 `int()` 不知道怎么把“十八”转成数字。

新手阶段先保证自己输入数字。后面会学习如何处理这种错误。

## 本篇小练习

写一个简单的年龄计算器：

```python
name = input("请输入姓名：")
age = int(input("请输入年龄："))

print(f"{name}，你好")
print(f"你今年 {age} 岁")
print(f"五年后你 {age + 5} 岁")
```

运行示例：

```text
请输入姓名：小明
请输入年龄：18
小明，你好
你今年 18 岁
五年后你 23 岁
```

## 本篇小结

- `input()` 可以接收用户输入。
- `input()` 得到的内容默认是字符串。
- `int()` 可以转整数。
- `float()` 可以转小数。
- `str()` 可以转字符串。
