---
title: Python 零基础入门 04：变量和基本数据类型
slug: python-zero-variables-and-types
summary: 用生活例子解释变量是什么，介绍字符串、整数、小数、布尔值四种常见数据类型，并演示 type 的用法。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 04：变量和基本数据类型

变量可以理解成：**给一个数据起名字。**

比如你想记住一个人的名字：

```python
name = "小明"
```

这里的 `name` 就是变量名，`"小明"` 是变量保存的内容。

## 为什么需要变量

如果不用变量，代码可能会重复很多内容：

```python
print("小明")
print("小明")
print("小明")
```

使用变量后：

```python
name = "小明"
print(name)
print(name)
print(name)
```

运行结果：

```text
小明
小明
小明
```

以后如果要把“小明”改成“小红”，只需要改一处。

## 变量名怎么起

新手建议变量名做到：

- 使用英文单词
- 小写字母开头
- 多个单词用下划线连接
- 能看出含义

例如：

```python
user_name = "小明"
user_age = 18
total_price = 99.5
```

不建议这样写：

```python
a = "小明"
b = 18
c = 99.5
```

短代码里也许能看懂，代码多了就容易混乱。

## 字符串 str

字符串就是文本内容。

在 Python 里，字符串通常放在引号里：

```python
name = "小明"
city = "上海"
```

运行：

```python
print(name)
print(city)
```

结果：

```text
小明
上海
```

## 整数 int

整数就是没有小数点的数字。

```python
age = 18
count = 100
```

运行：

```python
print(age)
print(count)
```

结果：

```text
18
100
```

## 小数 float

小数就是带小数点的数字。

```python
price = 9.9
height = 1.75
```

运行结果：

```text
9.9
1.75
```

## 布尔值 bool

布尔值只有两个：

```python
True
False
```

它们表示“真”和“假”。

例如：

```python
is_student = True
is_admin = False

print(is_student)
print(is_admin)
```

运行结果：

```text
True
False
```

注意：`True` 和 `False` 首字母必须大写。

## 查看数据类型

可以用 `type()` 查看一个数据是什么类型。

```python
name = "小明"
age = 18
price = 9.9
is_student = True

print(type(name))
print(type(age))
print(type(price))
print(type(is_student))
```

运行结果：

```text
<class 'str'>
<class 'int'>
<class 'float'>
<class 'bool'>
```

这里的：

- `str` 表示字符串
- `int` 表示整数
- `float` 表示小数
- `bool` 表示布尔值

## 本篇小练习

复制运行：

```python
name = "小明"
age = 18
city = "广州"
is_beginner = True

print("姓名：", name)
print("年龄：", age)
print("城市：", city)
print("是否零基础：", is_beginner)
```

运行结果：

```text
姓名： 小明
年龄： 18
城市： 广州
是否零基础： True
```

然后把变量值改成自己的信息。

## 本篇小结

- 变量是给数据起名字。
- 常见数据类型有字符串、整数、小数、布尔值。
- 字符串要写在引号里。
- `type()` 可以查看数据类型。
