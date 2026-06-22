---
title: Python 零基础入门 17：面向对象 class
slug: python-zero-object-oriented-programming
summary: 用小白能理解的方式解释类、对象、属性、方法、self、构造方法和继承，全程对照 JavaScript class。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 17：面向对象 class

面向对象是很多新手听起来最害怕的概念。

先不要背定义。可以这样理解：

**类是图纸，对象是按图纸造出来的具体东西。**

前端 JS 里你其实已经用过类：

```js
class User {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  introduce() {
    console.log(`我叫${this.name}，今年${this.age}岁`)
  }
}

const user1 = new User('小明', 18)
user1.introduce()
```

Python 的 class 逻辑完全一样，只是语法细节不同。

## 一、先看不用 class 的写法

用字典保存用户：

```python
user = {
    "name": "小明",
    "age": 18
}

print(user["name"])
```

这没问题。但如果用户相关操作越来越多，比如登录、修改资料、打印信息，代码会越来越散。

类可以把"数据"和"操作数据的函数"放在一起。

## 二、定义一个类

Python：

```python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def introduce(self):
        print(f"我叫{self.name}，今年{self.age}岁")
```

JS 对照：

```js
class User {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  introduce() {
    console.log(`我叫${this.name}，今年${this.age}岁`)
  }
}
```

对照：

| 对比 | Python | JS |
| --- | --- | --- |
| 定义类 | `class User:` | `class User {` |
| 构造方法 | `def __init__(self, ...)` | `constructor(...)` |
| 当前对象 | `self` | `this` |
| 定义方法 | `def method(self):` | `method() {` |
| 冒号 | 方法后有 `:` | 没有 |
| 缩进 | 靠缩进 | 靠 `{}` |

## 三、创建对象

```python
user1 = User("小明", 18)
user2 = User("小红", 20)

user1.introduce()   # 我叫小明，今年18岁
user2.introduce()   # 我叫小红，今年20岁
```

JS：

```js
const user1 = new User('小明', 18)
const user2 = new User('小红', 20)

user1.introduce()
user2.introduce()
```

**Python 创建对象不需要 `new` 关键字！** `User("小明", 18)` 就行。

JS 必须用 `new User(...)`，否则 `this` 指向不对。

## 四、self vs this

| 对比 | Python `self` | JS `this` |
| --- | --- | --- |
| 含义 | 当前对象 | 当前对象（但更复杂） |
| 必须写 | 方法第一个参数必须写 `self` | 不需要显式传参 |
| 访问属性 | `self.name` | `this.name` |
| 稳定性 | `self` 永远指向当前对象 | `this` 取决于调用方式 |

**`self` 和 `this` 最大的区别：**

Python 的 `self` 必须显式写在方法参数里，而且永远指向当前对象，不会变。

JS 的 `this` 不需要显式传参，但指向取决于调用方式，容易出 bug：

```js
const user = new User('小明', 18)
const fn = user.introduce
fn()   // this 不再指向 user！
```

Python 不会出现这个问题：

```python
user = User("小明", 18)
fn = user.introduce
fn()   # 仍然正常，self 指向 user
```

高频踩坑：

```python
class User:
    def __init__(self, name):   # 必须写 self！
        self.name = name        # 必须写 self.！

    def introduce(self):        # 必须写 self！
        print(self.name)        # 必须写 self.！
```

忘写 `self` 是 Python 新手最常见的错误之一。

## 五、__init__ 构造方法

`__init__` 在创建对象时自动执行，类似 JS 的 `constructor`。

```python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        print(f"用户 {name} 已创建")

user = User("小明", 18)   # 自动执行 __init__，输出 "用户 小明 已创建"
```

JS：

```js
class User {
  constructor(name, age) {
    this.name = name
    this.age = age
    console.log(`用户 ${name} 已创建`)
  }
}

const user = new User('小明', 18)
```

### __str__ 方法

`__str__` 定义 `print(对象)` 时显示什么：

```python
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        return f"User({self.name}, {self.age})"

user = User("小明", 18)
print(user)    # User(小明, 18)
```

不写 `__str__` 时，`print(user)` 会显示类似 `<__main__.User object at 0x...>`。

JS 对照：

```js
class User {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  toString() {
    return `User(${this.name}, ${this.age})`
  }
}

const user = new User('小明', 18)
console.log(String(user))  // User(小明, 18)
```

## 六、属性和方法

属性是对象保存的数据，方法是对象能做的事情。

```python
class Article:
    def __init__(self, title, status="draft"):
        self.title = title       # 属性：标题
        self.status = status     # 属性：状态
        self.view_count = 0      # 属性：浏览次数

    def publish(self):           # 方法：发布
        self.status = "published"

    def add_view(self):          # 方法：增加浏览
        self.view_count += 1

article = Article("Python 入门")
article.publish()
article.add_view()
article.add_view()

print(article.title)        # Python 入门
print(article.status)       # published
print(article.view_count)   # 2
```

JS 对照：

```js
class Article {
  constructor(title, status = 'draft') {
    this.title = title
    this.status = status
    this.viewCount = 0
  }

  publish() {
    this.status = 'published'
  }

  addView() {
    this.viewCount++
  }
}
```

**命名差异：Python 属性蛇形 `view_count`，JS 驼峰 `viewCount`。**

## 七、继承

继承可以理解成：一个类拥有另一个类已有的能力，并可以扩展自己的能力。

Python：

```python
class Animal:
    def eat(self):
        print("正在吃东西")

class Dog(Animal):
    def bark(self):
        print("汪汪")

dog = Dog()
dog.eat()    # 正在吃东西（继承自 Animal）
dog.bark()   # 汪汪（Dog 自己的）
```

JS 对照：

```js
class Animal {
  eat() {
    console.log('正在吃东西')
  }
}

class Dog extends Animal {
  bark() {
    console.log('汪汪')
  }
}

const dog = new Dog()
dog.eat()
dog.bark()
```

对照：

| 对比 | Python | JS |
| --- | --- | --- |
| 继承语法 | `class Dog(Animal):` | `class Dog extends Animal {` |
| 调用父类方法 | `super().method()` | `super.method()` |

### 重写父类方法

```python
class Animal:
    def speak(self):
        print("...")

class Dog(Animal):
    def speak(self):
        print("汪汪")

class Cat(Animal):
    def speak(self):
        print("喵喵")

animals = [Dog(), Cat()]
for animal in animals:
    animal.speak()
```

输出：

```text
汪汪
喵喵
```

这就是**多态**——同样的方法调用，不同对象有不同的行为。Python 和 JS 都支持。

## 八、类属性 vs 实例属性

```python
class User:
    total_count = 0    # 类属性，所有对象共享

    def __init__(self, name):
        self.name = name          # 实例属性，每个对象独立
        User.total_count += 1     # 修改类属性

user1 = User("小明")
user2 = User("小红")

print(user1.name)             # 小明（实例属性）
print(User.total_count)       # 2（类属性）
```

JS 对照：

```js
class User {
  static totalCount = 0

  constructor(name) {
    this.name = name
    User.totalCount++
  }
}

const user1 = new User('小明')
const user2 = new User('小红')

console.log(user1.name)       // 小明
console.log(User.totalCount)  // 2
```

对照：

| 对比 | Python | JS |
| --- | --- | --- |
| 类属性 | 直接在类里定义 | `static` 关键字 |
| 访问类属性 | `ClassName.attr` | `ClassName.attr` |
| 实例属性 | `self.attr` | `this.attr` |

Python 的类属性不需要 `static` 关键字，直接定义就行。JS 需要加 `static`。

## 九、class 语法对照总表

| 功能 | Python | JS |
| --- | --- | --- |
| 定义类 | `class User:` | `class User {` |
| 构造方法 | `def __init__(self):` | `constructor() {` |
| 当前对象 | `self` | `this` |
| 创建对象 | `User()` | `new User()` |
| 定义方法 | `def method(self):` | `method() {` |
| 继承 | `class Dog(Animal):` | `class Dog extends Animal {` |
| 调用父类 | `super().__init__()` | `super()` |
| 类属性 | 直接定义 | `static` |
| 打印对象 | `__str__` | `toString()` |
| 多态 | 自然支持 | 自然支持 |

## 十、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 当前对象 | `self`（必须显式传参） | `this`（自动绑定） | Python 必须写 self |
| 创建对象 | `User()` | `new User()` | Python 不需要 new |
| 构造方法 | `__init__` | `constructor` | Python 双下划线 |
| 方法第一个参数 | 必须写 `self` | 不需要 | Python 最容易忘的 |
| 继承 | `class Dog(Animal):` | `class Dog extends Animal` | Python 用括号 |
| 类属性 | 直接定义 | `static` | Python 不需要 static |
| 属性命名 | 蛇形 `view_count` | 驼峰 `viewCount` | 风格差异 |
| 打印对象 | `__str__` | `toString()` | Python 双下划线 |

## 十一、企业项目实战：文章类

```python
class Article:
    """文章类"""
    total_count = 0    # 类属性：文章总数

    def __init__(self, title, status="draft", category=None):
        self.title = title
        self.status = status
        self.category = category
        self.tags = []
        self.view_count = 0
        Article.total_count += 1

    def publish(self):
        """发布文章"""
        if self.status == "published":
            print(f"'{self.title}' 已经是发布状态")
            return
        self.status = "published"
        print(f"'{self.title}' 已发布")

    def add_tag(self, tag):
        """添加标签"""
        tag = tag.strip().lower()
        if tag and tag not in self.tags:
            self.tags.append(tag)

    def add_view(self):
        """增加浏览"""
        self.view_count += 1

    def summary(self):
        """摘要信息"""
        tags_str = ", ".join(self.tags) if self.tags else "无"
        return f"[{self.status}] {self.title} | 浏览: {self.view_count} | 标签: {tags_str}"

    def __str__(self):
        return self.summary()


# 使用
article = Article("Python 零基础入门：字符串", category="Python")
article.add_tag("Python")
article.add_tag("字符串")
article.add_tag("python")   # 重复，不会添加
article.publish()
article.add_view()
article.add_view()

print(article)
# [published] Python 零基础入门：字符串 | 浏览: 2 | 标签: python, 字符串
```

## 十二、本篇练习

练习一：商品类。

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

练习二：找错误。

```python
# 错误 1：忘写 self
class User:
    def __init__(name, age):     # 缺少 self！
        self.name = name         # NameError!

# 正确
class User:
    def __init__(self, name, age):
        self.name = name
        self.age = age
```

```python
# 错误 2：用 new 创建对象
user = new User("小明", 18)    # SyntaxError! Python 没有 new

# 正确
user = User("小明", 18)
```

```python
# 错误 3：忘写 self.
class User:
    def __init__(self, name):
        name = name      # 这只是局部变量，不是属性！

# 正确
class User:
    def __init__(self, name):
        self.name = name  # 属性需要 self.
```

## 本篇小结

1. Python `class` ≈ JS `class`，逻辑一样，语法细节不同。
2. Python 用 `self`，JS 用 `this`——Python 必须显式写在参数里。
3. Python 构造方法 `__init__`，JS `constructor`。
4. Python 创建对象不需要 `new`，JS 需要。
5. Python 继承 `class Dog(Animal):`，JS `class Dog extends Animal`。
6. Python 类属性直接定义，JS 需要 `static`。
7. `__str__` 控制 `print(对象)` 的输出，JS 用 `toString()`。
8. 属性命名 Python 蛇形 `view_count`，JS 驼峰 `viewCount`。
