---
title: Python 零基础入门 05：字符串
slug: python-zero-strings
summary: 介绍字符串的基本写法、拼接、重复、取长度、格式化输出，以及字符串常用方法，帮助新手处理文本内容。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 05：字符串

字符串就是文本。

姓名、城市、文章标题、用户输入的一句话，都可以用字符串表示。

## 字符串的写法

字符串可以用双引号：

```python
name = "小明"
```

也可以用单引号：

```python
city = '北京'
```

两种写法都可以。新手阶段建议先统一使用双引号，减少混乱。

## 字符串拼接

拼接就是把几段字符串接在一起。

```python
first_name = "张"
last_name = "三"
full_name = first_name + last_name

print(full_name)
```

运行结果：

```text
张三
```

如果想中间加空格：

```python
first_name = "Li"
last_name = "Lei"
full_name = first_name + " " + last_name

print(full_name)
```

运行结果：

```text
Li Lei
```

## 字符串重复

字符串可以用 `*` 重复。

```python
line = "-" * 10
print(line)
```

运行结果：

```text
----------
```

这个技巧常用来做简单分隔线。

## 获取字符串长度

用 `len()` 可以获取字符串长度。

```python
title = "Python 入门"
print(len(title))
```

运行结果：

```text
9
```

这里中文、英文、空格都会被计算。

## f-string 格式化输出

实际写代码时，经常需要把变量放进一段文字里。

推荐使用 f-string：

```python
name = "小明"
age = 18

print(f"我叫{name}，今年{age}岁")
```

运行结果：

```text
我叫小明，今年18岁
```

写法要点：

- 字符串前面加 `f`
- 变量放在 `{}` 里

## 常用方法：去掉两边空格

用户输入的内容可能前后有多余空格。

```python
text = "  hello  "
clean_text = text.strip()

print(clean_text)
```

运行结果：

```text
hello
```

`strip()` 会去掉字符串两边的空白。

## 常用方法：转大写和小写

```python
word = "Python"

print(word.upper())
print(word.lower())
```

运行结果：

```text
PYTHON
python
```

## 常用方法：判断是否包含

可以用 `in` 判断一个字符串里是否包含另一段文字。

```python
message = "我正在学习 Python"

print("Python" in message)
print("Java" in message)
```

运行结果：

```text
True
False
```

## 常见错误：字符串和数字不能直接相加

下面代码会报错：

```python
age = 18
print("年龄：" + age)
```

因为 `"年龄："` 是字符串，`age` 是整数。

可以改成 f-string：

```python
age = 18
print(f"年龄：{age}")
```

运行结果：

```text
年龄：18
```

## 本篇小练习

```python
name = "小明"
skill = "Python"
days = 7

print(f"{name} 已经学习 {skill} {days} 天了")
print("-" * 20)
print(f"标题长度：{len(skill)}")
```

运行结果：

```text
小明 已经学习 Python 7 天了
--------------------
标题长度：6
```

## 本篇小结

- 字符串就是文本内容。
- 字符串可以拼接，也可以重复。
- `len()` 可以获取字符串长度。
- f-string 很适合把变量放进文字里。
- `strip()`、`upper()`、`lower()` 是常用字符串方法。
