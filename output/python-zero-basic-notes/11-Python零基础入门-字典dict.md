---
title: Python 零基础入门 11：字典 dict
slug: python-zero-dictionaries
summary: 用个人信息示例解释字典的键值对结构，讲解读取、修改、添加、删除、循环字典以及字典和列表的组合。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 11：字典 dict

字典用于保存“名称和值”的对应关系。

比如一个人的信息：

```python
user = {
    "name": "小明",
    "age": 18,
    "city": "北京"
}
```

这里的 `"name"`、`"age"`、`"city"` 叫键。

对应的 `"小明"`、`18`、`"北京"` 叫值。

## 字典像一张信息表

你可以把字典理解成：

```text
name -> 小明
age  -> 18
city -> 北京
```

它适合保存一个对象的多项信息。

## 读取字典里的值

```python
user = {
    "name": "小明",
    "age": 18,
    "city": "北京"
}

print(user["name"])
print(user["age"])
```

运行结果：

```text
小明
18
```

## 修改值

```python
user = {
    "name": "小明",
    "age": 18
}

user["age"] = 19
print(user)
```

运行结果：

```text
{'name': '小明', 'age': 19}
```

## 添加新内容

```python
user = {
    "name": "小明",
    "age": 18
}

user["city"] = "上海"
print(user)
```

运行结果：

```text
{'name': '小明', 'age': 18, 'city': '上海'}
```

## 删除内容

```python
user = {
    "name": "小明",
    "age": 18,
    "city": "北京"
}

del user["city"]
print(user)
```

运行结果：

```text
{'name': '小明', 'age': 18}
```

## 使用 get 更安全

如果直接读取不存在的键，会报错：

```python
user = {"name": "小明"}
print(user["city"])
```

可以用 `get()`：

```python
user = {"name": "小明"}
print(user.get("city"))
```

运行结果：

```text
None
```

也可以设置默认值：

```python
user = {"name": "小明"}
print(user.get("city", "未知城市"))
```

运行结果：

```text
未知城市
```

## 循环字典

循环键和值：

```python
user = {
    "name": "小明",
    "age": 18,
    "city": "北京"
}

for key, value in user.items():
    print(key, value)
```

运行结果：

```text
name 小明
age 18
city 北京
```

## 列表里放字典

实际开发中，经常会有多个用户。

这时可以用列表保存多个字典：

```python
users = [
    {"name": "小明", "age": 18},
    {"name": "小红", "age": 20},
    {"name": "小刚", "age": 17}
]

for user in users:
    print(f"{user['name']}：{user['age']}岁")
```

运行结果：

```text
小明：18岁
小红：20岁
小刚：17岁
```

## 本篇小练习

保存一本书的信息：

```python
book = {
    "title": "Python 入门",
    "author": "张三",
    "price": 59
}

print(f"书名：{book['title']}")
print(f"作者：{book['author']}")
print(f"价格：{book['price']} 元")
```

运行结果：

```text
书名：Python 入门
作者：张三
价格：59 元
```

## 本篇小结

- 字典用来保存键值对。
- 可以通过键读取对应的值。
- `get()` 读取不存在的键时更安全。
- 字典适合保存一条完整信息。
- 列表和字典经常组合使用。
