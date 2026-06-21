---
title: Python 零基础入门 08：条件判断 if else
slug: python-zero-if-else
summary: 介绍条件判断的基本写法，讲解 if、elif、else、比较运算符、缩进规则，并通过成绩判断练习理解分支逻辑。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 08：条件判断 if else

条件判断就是：**如果满足某个条件，就做一件事；否则做另一件事。**

生活里到处都是条件判断：

- 如果下雨，就带伞。
- 如果余额足够，就支付成功。
- 如果成绩及格，就显示通过。

## 最简单的 if

```python
age = 18

if age >= 18:
    print("你已经成年")
```

运行结果：

```text
你已经成年
```

意思是：如果 `age >= 18` 成立，就执行缩进里的代码。

## 缩进很重要

Python 用缩进表示代码属于哪一块。

正确写法：

```python
age = 18

if age >= 18:
    print("你已经成年")
    print("可以继续办理")
```

错误写法：

```python
age = 18

if age >= 18:
print("你已经成年")
```

第二段会报错，因为 `print` 前面没有缩进。

新手建议统一使用 4 个空格缩进。

## if else

`else` 表示“否则”。

```python
age = 16

if age >= 18:
    print("你已经成年")
else:
    print("你还未成年")
```

运行结果：

```text
你还未成年
```

## if elif else

如果有多个条件，可以用 `elif`。

```python
score = 85

if score >= 90:
    print("优秀")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

运行结果：

```text
及格
```

Python 会从上往下判断：

1. `score >= 90` 不成立
2. `score >= 60` 成立
3. 执行“及格”
4. 后面的 `else` 不再执行

## 常见比较运算符

```text
==  等于
!=  不等于
>   大于
<   小于
>=  大于等于
<=  小于等于
```

注意：判断相等用 `==`，不是 `=`。

```python
password = "123456"

if password == "123456":
    print("登录成功")
```

`=` 是赋值，`==` 才是判断是否相等。

## 多个条件：and

`and` 表示“并且”，两个条件都成立才算成立。

```python
age = 20
has_ticket = True

if age >= 18 and has_ticket:
    print("可以入场")
else:
    print("不能入场")
```

运行结果：

```text
可以入场
```

## 多个条件：or

`or` 表示“或者”，只要有一个条件成立就算成立。

```python
is_admin = False
is_owner = True

if is_admin or is_owner:
    print("可以编辑")
else:
    print("不能编辑")
```

运行结果：

```text
可以编辑
```

## 本篇小练习

写一个成绩判断程序：

```python
score = int(input("请输入成绩："))

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

运行示例：

```text
请输入成绩：86
良好
```

## 本篇小结

- `if` 用来做条件判断。
- `else` 表示否则。
- `elif` 用来判断多个条件。
- Python 非常依赖缩进。
- 判断相等用 `==`，赋值用 `=`。
