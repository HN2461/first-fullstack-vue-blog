---
title: Python 零基础入门 17：面向对象 class
slug: python-zero-object-oriented-programming
summary: 用小白能理解的方式解释类、对象、属性、方法、self、构造方法和继承，并给出企业面试中面向对象的表达方式。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 17：面向对象 class

面向对象是很多新手听起来最害怕的概念。

先不要背定义。可以这样理解：

**类是图纸，对象是按图纸造出来的具体东西。**

比如“用户”是一类东西，而“小明这个用户”是一个具体对象。

## 先看不用 class 的写法

用字典保存用户：

```python
user = {
    "name": "小明",
    "age": 18
}

print(user["name"])
```

运行结果：

```text
小明
```

这没问题。但如果用户相关操作越来越多，比如登录、修改资料、打印信息，代码可能会越来越散。

类可以把“数据”和“操作数据的函数”放在一起。

## 定义一个类

```python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def introduce(self):
        print(f"我叫{self.name}，今年{self.age}岁")
```

这里：

- `class User` 定义了一个用户类。
- `__init__` 是创建对象时自动执行的方法。
- `self.name` 和 `self.age` 是对象自己的属性。
- `introduce` 是对象的方法。

## 创建对象

```python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def introduce(self):
        print(f"我叫{self.name}，今年{self.age}岁")

user1 = User("小明", 18)
user2 = User("小红", 20)

user1.introduce()
user2.introduce()
```

运行结果：

```text
我叫小明，今年18岁
我叫小红，今年20岁
```

`User("小明", 18)` 就是在创建一个具体用户对象。

## self 是什么

`self` 表示当前这个对象自己。

比如：

```python
user1 = User("小明", 18)
user2 = User("小红", 20)
```

调用 `user1.introduce()` 时，`self` 指向 `user1`。

调用 `user2.introduce()` 时，`self` 指向 `user2`。

所以同一个方法可以处理不同对象的数据。

## 属性和方法

属性是对象保存的数据：

```python
self.name
self.age
```

方法是对象能做的事情：

```python
def introduce(self):
    print("介绍自己")
```

简单说：

- 属性回答“它有什么”
- 方法回答“它能做什么”

## 修改对象属性

```python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

user = User("小明", 18)
user.age = 19

print(user.age)
```

运行结果：

```text
19
```

## 继承

继承可以理解成：一个类拥有另一个类已有的能力，并可以扩展自己的能力。

```python
class Animal:
    def eat(self):
        print("正在吃东西")

class Dog(Animal):
    def bark(self):
        print("汪汪")

dog = Dog()
dog.eat()
dog.bark()
```

运行结果：

```text
正在吃东西
汪汪
```

`Dog` 继承了 `Animal`，所以它可以调用 `eat()`。

## 企业代码里为什么常见 class

企业项目里，类常用于组织复杂业务。

比如：

- 用户对象
- 订单对象
- 数据库连接对象
- 爬虫任务对象
- 服务层对象

类不是为了炫技，而是为了让相关数据和行为放在一起，代码更容易维护。

## 面试怎么说

如果面试官问：“你怎么理解面向对象？”

可以这样回答：

```text
我理解面向对象是把现实或业务中的事物抽象成类。
类定义属性和方法，对象是类创建出来的具体实例。
属性表示对象的数据，方法表示对象的行为。
在项目里使用类，可以把相关的数据和操作放在一起，减少代码分散，提高可维护性。
```

如果继续问 `self`：

```text
self 表示当前对象本身。
同一个类可以创建多个对象，方法执行时通过 self 访问当前对象自己的属性。
```

## 本篇小练习

写一个商品类：

```python
class Product:
    def __init__(self, name, price, count):
        self.name = name
        self.price = price
        self.count = count

    def total_price(self):
        return self.price * self.count

product = Product("键盘", 199, 2)

print(f"商品：{product.name}")
print(f"总价：{product.total_price()} 元")
```

运行结果：

```text
商品：键盘
总价：398 元
```

## 本篇小结

- 类是图纸，对象是具体实例。
- 属性表示对象的数据。
- 方法表示对象能做的事情。
- `self` 表示当前对象。
- `__init__` 在创建对象时执行。
- 继承可以复用已有类的能力。
