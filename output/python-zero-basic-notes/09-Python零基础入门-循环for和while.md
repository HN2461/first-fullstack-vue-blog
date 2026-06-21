---
title: Python 零基础入门 09：循环 for 和 while
slug: python-zero-loops
summary: 介绍循环的意义，讲解 for、range、while、break、continue 的基础用法，帮助新手理解重复执行代码。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 09：循环 for 和 while

循环就是：**让一段代码重复执行。**

如果不用循环，输出 5 次内容要这样写：

```python
print("学习 Python")
print("学习 Python")
print("学习 Python")
print("学习 Python")
print("学习 Python")
```

有了循环，可以写得更简单。

## for 循环

```python
for i in range(5):
    print("学习 Python")
```

运行结果：

```text
学习 Python
学习 Python
学习 Python
学习 Python
学习 Python
```

`range(5)` 会产生 5 次循环。

## 查看 i 的变化

```python
for i in range(5):
    print(i)
```

运行结果：

```text
0
1
2
3
4
```

注意：Python 里很多计数默认从 0 开始。

## 指定开始和结束

```python
for i in range(1, 6):
    print(i)
```

运行结果：

```text
1
2
3
4
5
```

`range(1, 6)` 表示从 1 开始，到 6 之前结束，所以不包含 6。

## while 循环

`while` 的意思是：当条件成立时，一直循环。

```python
count = 1

while count <= 5:
    print(count)
    count += 1
```

运行结果：

```text
1
2
3
4
5
```

这里每次循环后 `count += 1`，否则条件会一直成立，程序会停不下来。

## 小心死循环

下面代码会一直运行：

```python
count = 1

while count <= 5:
    print(count)
```

因为 `count` 一直是 1，永远小于等于 5。

这就是死循环。

## break：提前结束循环

```python
for i in range(1, 6):
    if i == 3:
        break
    print(i)
```

运行结果：

```text
1
2
```

当 `i == 3` 时，`break` 会结束整个循环。

## continue：跳过本次循环

```python
for i in range(1, 6):
    if i == 3:
        continue
    print(i)
```

运行结果：

```text
1
2
4
5
```

当 `i == 3` 时，`continue` 会跳过本次循环，继续下一次。

## 循环和字符串

字符串也可以被循环。

```python
word = "Python"

for char in word:
    print(char)
```

运行结果：

```text
P
y
t
h
o
n
```

每次循环会取出一个字符。

## 本篇小练习

计算 1 到 100 的总和：

```python
total = 0

for i in range(1, 101):
    total += i

print(total)
```

运行结果：

```text
5050
```

解释：

- `total = 0` 表示先准备一个总和变量。
- 每次循环把当前数字加进去。
- 最后输出总和。

## 本篇小结

- 循环用于重复执行代码。
- `for` 常用于明确循环次数的场景。
- `while` 常用于条件成立就继续的场景。
- `break` 会结束循环。
- `continue` 会跳过本次循环。
