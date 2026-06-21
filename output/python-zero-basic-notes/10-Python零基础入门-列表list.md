---
title: Python 零基础入门 10：列表 list
slug: python-zero-lists
summary: 讲解列表的概念、创建列表、读取元素、添加删除元素、循环列表和列表长度，适合零基础理解一组数据的处理方式。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 10：列表 list

列表用于保存一组数据。

比如保存多个学生姓名：

```python
students = ["小明", "小红", "小刚"]
```

这就是一个列表。

## 为什么需要列表

如果不用列表，你可能会这样写：

```python
student1 = "小明"
student2 = "小红"
student3 = "小刚"
```

当学生越来越多时，变量会越来越乱。

列表可以把同类数据放在一起。

## 创建列表

```python
numbers = [1, 2, 3, 4, 5]
names = ["小明", "小红", "小刚"]
mixed = ["小明", 18, True]
```

列表用中括号 `[]` 表示，里面的元素用英文逗号隔开。

新手阶段建议一个列表里尽量放同一类数据，比如都放姓名，或都放数字。

## 读取列表元素

列表里的位置叫索引。

Python 的索引从 0 开始。

```python
students = ["小明", "小红", "小刚"]

print(students[0])
print(students[1])
print(students[2])
```

运行结果：

```text
小明
小红
小刚
```

## 修改列表元素

```python
students = ["小明", "小红", "小刚"]
students[1] = "小李"

print(students)
```

运行结果：

```text
['小明', '小李', '小刚']
```

## 添加元素

用 `append()` 可以在列表末尾添加元素。

```python
students = ["小明", "小红"]
students.append("小刚")

print(students)
```

运行结果：

```text
['小明', '小红', '小刚']
```

## 删除元素

用 `remove()` 可以按内容删除。

```python
students = ["小明", "小红", "小刚"]
students.remove("小红")

print(students)
```

运行结果：

```text
['小明', '小刚']
```

如果要删除的内容不存在，会报错。

## 获取列表长度

```python
students = ["小明", "小红", "小刚"]
print(len(students))
```

运行结果：

```text
3
```

## 循环列表

列表经常和 `for` 循环一起使用。

```python
students = ["小明", "小红", "小刚"]

for student in students:
    print(student)
```

运行结果：

```text
小明
小红
小刚
```

这段代码的意思是：每次从列表里取出一个学生，放到变量 `student` 里。

## 判断元素是否在列表里

```python
students = ["小明", "小红", "小刚"]

print("小明" in students)
print("小李" in students)
```

运行结果：

```text
True
False
```

## 本篇小练习

统计购物清单：

```python
shopping_list = ["苹果", "牛奶", "面包"]

print("购物清单：")
for item in shopping_list:
    print("-", item)

print(f"一共有 {len(shopping_list)} 件商品")
```

运行结果：

```text
购物清单：
- 苹果
- 牛奶
- 面包
一共有 3 件商品
```

## 本篇小结

- 列表用于保存一组数据。
- 列表索引从 0 开始。
- `append()` 可以添加元素。
- `remove()` 可以删除元素。
- `len()` 可以获取列表长度。
- `for` 循环常用于逐个处理列表元素。
