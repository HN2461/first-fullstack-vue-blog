---
title: Python 零基础入门 19：面向对象 class
slug: python-zero-object-oriented-programming
summary: 用小白能理解的方式解释类、对象、属性、方法、self、构造方法、继承、多继承、property、dataclass 和组合，全程对照 JavaScript class。
category: Python入门
tags:
  - Python
  - 零基础入门
status: draft
cover:
---

# Python 零基础入门 19：面向对象 class

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

## 七、属性封装：下划线与 `__name`

Python 没有 `private` / `public` 关键字。属性默认全部公开，但有两套约定来表示"不想被外部直接访问"。

### 单下划线 `_name`：约定私有

```python
class User:
    def __init__(self, name):
        self._name = name    # 约定为私有，但外部仍可访问

user = User("小明")
print(user._name)   # 小明（技术上能访问，但约定上不应该）
```

单下划线只是**约定**，告诉其他开发者"这是内部实现，别直接用"。Python 不会阻止访问。

JS 对照：JS 的 `#privateField`（ES2022）是真正的私有，外部访问会报错。Python 的 `_name` 更像是一种"君子协定"。

### 双下划线 `__name`：名称改写（name mangling）

```python
class User:
    def __init__(self, name):
        self.__name = name    # 双下划线，触发名称改写

    def get_name(self):
        return self.__name

user = User("小明")
# print(user.__name)          # AttributeError！外部无法直接访问
print(user.get_name())        # 小明（通过方法访问）
print(user._User__name)       # 小明（技术上能访问，但不应该）
```

双下划线开头的属性会被 Python 自动改名（`__name` → `_User__name`），外部无法用原名访问。这是"名称改写"机制，主要目的是**避免子类意外覆盖父类的属性**。

| 写法 | 含义 | 外部能访问吗 | 类比 JS |
| --- | --- | --- | --- |
| `name` | 公开 | 能 | 普通属性 |
| `_name` | 约定私有 | 能（但不建议） | 无直接对应 |
| `__name` | 名称改写 | 不能用原名 | `#name`（但机制不同） |

企业项目中，一般用单下划线 `_name` 表示私有就够了，双下划线 `__name` 较少使用（除非确实需要防止子类冲突）。

## 八、@property：属性化方法

`@property` 可以把方法变成"属性"来访问——读取时像属性，但背后可以加逻辑。

### 计算属性

```python
class Article:
    def __init__(self, title, views, likes):
        self.title = title
        self.views = views
        self.likes = likes

    @property
    def engagement_rate(self):
        """互动率 = 点赞 / 浏览，自动计算"""
        if self.views == 0:
            return 0
        return round(self.likes / self.views, 2)

article = Article("Python 入门", 100, 30)
print(article.engagement_rate)   # 0.3（注意：不加括号！）
```

加了 `@property` 后，`engagement_rate` 像属性一样用 `article.engagement_rate` 访问，不用写 `()`。

JS 对照（getter）：

```js
class Article {
  constructor(title, views, likes) {
    this.title = title
    this.views = views
    this.likes = likes
  }

  get engagementRate() {
    if (this.views === 0) return 0
    return Math.round((this.likes / this.views) * 100) / 100
  }
}

const article = new Article('Python 入门', 100, 30)
console.log(article.engagementRate)  // 0.3
```

### getter + setter：数据校验

```python
class User:
    def __init__(self, name):
        self.name = name     # 赋值时自动走 setter

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not value or not value.strip():
            raise ValueError("名字不能为空")
        self._name = value.strip()

user = User("小明")
print(user.name)        # 小明（走 getter）
user.name = "  小红  "  # 走 setter，自动去空格
print(user.name)        # 小红
# user.name = ""        # ValueError: 名字不能为空
```

注意 `__init__` 里写 `self.name = name` 会自动触发 setter，所以校验逻辑只写一处就行。

JS 对照（getter + setter）：

```js
class User {
  #name = ''

  constructor(name) {
    this.name = name
  }

  get name() {
    return this.#name
  }

  set name(value) {
    if (!value || !value.trim()) throw new Error('名字不能为空')
    this.#name = value.trim()
  }
}
```

**什么时候用 `@property`？**

- 计算属性（如互动率、总价）
- 需要校验的属性（如年龄不能为负）
- 只读属性（只写 getter 不写 setter）
- 想把方法伪装成属性，让调用更自然

## 九、继承

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

### super() 调用父类构造方法

子类需要自己的 `__init__` 时，必须手动调用父类的 `__init__`，否则父类的初始化不会执行：

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def eat(self):
        print(f"{self.name} 正在吃东西")

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)    # 调用父类构造，初始化 name
        self.breed = breed        # 子类自己的属性

    def bark(self):
        print(f"{self.name} 汪汪")

dog = Dog("旺财", "金毛")
dog.eat()     # 旺财 正在吃东西（继承自父类）
dog.bark()    # 旺财 汪汪（自己的）
print(dog.breed)  # 金毛
```

**忘记写 `super().__init__()` 是新手最常见的继承错误**——父类的属性不会被初始化，后面用到 `self.name` 会报 `AttributeError`。

JS 对照：

```js
class Animal {
  constructor(name) {
    this.name = name
  }

  eat() {
    console.log(`${this.name} 正在吃东西`)
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name)       // 必须在 this 之前调用
    this.breed = breed
  }

  bark() {
    console.log(`${this.name} 汪汪`)
  }
}
```

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

## 十、多继承

Python 支持**多继承**——一个类可以同时继承多个父类。JS 不支持（只能单继承 + mixin）。

```python
class Flyable:
    def fly(self):
        print("飞行中")

class Swimmable:
    def swim(self):
        print("游泳中")

class Duck(Flyable, Swimmable):
    pass

duck = Duck()
duck.fly()    # 飞行中
duck.swim()   # 游泳中
```

### MRO：方法解析顺序

当多个父类有同名方法时，Python 按什么顺序找？这由 **MRO（Method Resolution Order，方法解析顺序）** 决定，使用 C3 线性化算法。

```python
class A:
    def greet(self):
        print("A")

class B(A):
    def greet(self):
        print("B")

class C(A):
    def greet(self):
        print("C")

class D(B, C):
    pass

d = D()
d.greet()    # B（按 MRO 顺序，B 在 C 前面）

# 查看 MRO 顺序
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
```

MRO 规则简单理解：**子类永远在父类前面，多个父类按声明顺序排**。

### 菱形继承与 super()

当继承结构形成菱形（D → B → A，D → C → A）时，用 `super()` 可以保证 A 的 `__init__` 只被调用一次：

```text
    A
   / \
  B   C
   \ /
    D
```

```python
class A:
    def __init__(self):
        print("A.__init__")

class B(A):
    def __init__(self):
        print("B.__init__")
        super().__init__()

class C(A):
    def __init__(self):
        print("C.__init__")
        super().__init__()

class D(B, C):
    def __init__(self):
        print("D.__init__")
        super().__init__()

D()
# D.__init__
# B.__init__
# C.__init__
# A.__init__（只调用一次！）
```

如果用 `A.__init__(self)` 直接调用，A 会被调用两次。`super()` 按 MRO 链传递，每个类只调用一次。

> 多继承很强大但也容易混乱。企业项目中，建议优先用单继承 + 组合，多继承主要用于混入（Mixin）模式。

## 十一、组合 vs 继承

继承表达"是一个"（is-a）关系，组合表达"有一个"（has-a）关系。

```python
# 继承：Dog "是一个" Animal
class Animal:
    def eat(self):
        print("吃东西")

class Dog(Animal):
    def bark(self):
        print("汪汪")

# 组合：Car "有一个" Engine
class Engine:
    def start(self):
        print("引擎启动")

class Car:
    def __init__(self):
        self.engine = Engine()    # 组合：Car 拥有 Engine

    def drive(self):
        self.engine.start()       # 委托给组件
        print("行驶中")

car = Car()
car.drive()
# 引擎启动
# 行驶中
```

**什么时候用组合？**

- 功能可插拔、可替换（如换不同的引擎）
- "拥有"而非"是"的关系
- 想避免继承链过深

**什么时候用继承？**

- 明确的"是一个"关系（Dog 是 Animal）
- 需要多态（同一接口不同实现）
- 框架强制要求（如 Django View）

| 对比 | 继承 | 组合 |
| --- | --- | --- |
| 关系 | is-a（是一个） | has-a（有一个） |
| 耦合 | 紧密（子类依赖父类实现） | 松散（通过接口交互） |
| 灵活性 | 编译时确定 | 运行时可替换 |
| 适用 | 明确分类关系 | 功能拼装、策略切换 |

JS 对照：JS 同样推崇"组合优于继承"，用 mixin / 高阶函数实现组合。

## 十二、类属性 vs 实例属性

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

**常见坑**：通过实例修改类属性

```python
user1.total_count = 100    # 这不会改类属性！而是给 user1 创建了一个实例属性
print(User.total_count)    # 2（类属性没变）
print(user1.total_count)   # 100（实例属性遮蔽了类属性）
print(user2.total_count)   # 2（user2 仍读类属性）
```

修改类属性要用 `User.total_count = 100`，不要用 `self.total_count`。

## 十三、静态方法和类方法

### @staticmethod：不需要 self 的方法

有些方法和实例无关，只是逻辑上属于这个类。用 `@staticmethod` 定义：

```python
class MathUtils:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def is_positive(n):
        return n > 0

# 不需要创建实例就能调用
print(MathUtils.add(3, 5))         # 8
print(MathUtils.is_positive(-1))   # False
```

静态方法不需要 `self` 参数，因为它不访问实例属性。

JS 对照：

```js
class MathUtils {
  static add(a, b) {
    return a + b
  }
  static isPositive(n) {
    return n > 0
  }
}

console.log(MathUtils.add(3, 5))    // 8
```

Python 用 `@staticmethod` 装饰器，JS 用 `static` 关键字。

### @classmethod：操作类本身的方法

类方法的第一个参数是 `cls`（类本身），不是 `self`（实例）。常用于**替代构造方法**：

```python
class Article:
    def __init__(self, title, status="draft"):
        self.title = title
        self.status = status

    @classmethod
    def from_dict(cls, data):
        """从字典创建文章对象"""
        return cls(data["title"], data.get("status", "draft"))

# 普通创建
a1 = Article("Python 入门")

# 从字典创建（替代构造方法）
data = {"title": "JS 基础", "status": "published"}
a2 = Article.from_dict(data)

print(a2.title)    # JS 基础
print(a2.status)   # published
```

`cls` 就是类本身，`cls(...)` 等价于 `Article(...)`。好处是子类继承时 `cls` 会自动变成子类。

JS 对照：JS 没有原生的类方法，通常用 `static` 方法模拟：

```js
class Article {
  constructor(title, status = 'draft') {
    this.title = title
    this.status = status
  }

  static fromDict(data) {
    return new Article(data.title, data.status ?? 'draft')
  }
}

const a2 = Article.fromDict({ title: 'JS 基础', status: 'published' })
```

### 三种方法对照

| 类型 | 第一个参数 | 访问实例 | 访问类 | 用途 |
| --- | --- | --- | --- | --- |
| 实例方法 | `self` | 能 | 能 | 最常用，操作实例数据 |
| 类方法 | `cls` | 不能 | 能 | 替代构造、工厂方法 |
| 静态方法 | 无 | 不能 | 不能 | 工具函数，逻辑上属于类 |

## 十四、类型判断：isinstance 与鸭子类型

### isinstance()：判断对象类型

```python
class Animal:
    pass

class Dog(Animal):
    pass

dog = Dog()

print(isinstance(dog, Dog))     # True
print(isinstance(dog, Animal))  # True（考虑继承关系）
print(type(dog) is Dog)         # True
print(type(dog) is Animal)      # False（type 不考虑继承）
```

`isinstance` 考虑继承关系（Dog 也是 Animal），`type()` 不考虑。推荐用 `isinstance`。

JS 对照：

```js
console.log(dog instanceof Dog)     // true
console.log(dog instanceof Animal)  // true
```

### 鸭子类型

Python 有个核心理念叫**鸭子类型**（Duck Typing）：

> "如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子。"

意思是不关心对象的具体类型，只关心它有没有需要的方法：

```python
def make_sound(animal):
    animal.speak()    # 不关心 animal 是什么类型，只要有 speak 方法

class Dog:
    def speak(self):
        print("汪汪")

class Cat:
    def speak(self):
        print("喵喵")

make_sound(Dog())   # 汪汪
make_sound(Cat())   # 喵喵
```

JS 也是鸭子类型——你传什么对象进来都行，只要有对应的方法。

企业 Python 中，优先用鸭子类型（直接调用方法），只在必要时用 `isinstance` 做类型检查。

## 十五、常用魔术方法

Python 类里以双下划线开头和结尾的方法叫**魔术方法（dunder method）**，它们在特定场景下自动被调用。

前面已经学过 `__init__`（构造）和 `__str__`（打印）。以下是企业项目中最常见的几个：

### `__repr__`：开发者调试用的字符串

```python
class Article:
    def __init__(self, title, status="draft"):
        self.title = title
        self.status = status

    def __str__(self):
        return f"《{self.title}》- {self.status}"

    def __repr__(self):
        return f"Article(title='{self.title}', status='{self.status}')"

a = Article("Python 入门")

print(a)          # 《Python 入门》- draft（__str__）
print(repr(a))    # Article(title='Python 入门', status='draft')（__repr__）
```

`__str__` 给用户看，`__repr__` 给开发者看（调试时更详细）。

### `__len__`：支持 `len()` 函数

```python
class Article:
    def __init__(self, title, tags=None):
        self.title = title
        self.tags = tags or []

    def __len__(self):
        return len(self.tags)

a = Article("Python 入门", ["Python", "入门", "基础"])
print(len(a))    # 3
```

### `__eq__`：支持 `==` 比较

```python
class Article:
    def __init__(self, title, status):
        self.title = title
        self.status = status

    def __eq__(self, other):
        return self.title == other.title and self.status == other.status

a1 = Article("Python 入门", "draft")
a2 = Article("Python 入门", "draft")

print(a1 == a2)    # True（默认是 False，因为是不同对象）
```

### 常用魔术方法对照

| 魔术方法 | 触发场景 | JS 对应 |
| --- | --- | --- |
| `__init__` | 创建对象时 | `constructor` |
| `__str__` | `print(obj)` / `str(obj)` | `toString()` |
| `__repr__` | `repr(obj)` / 调试显示 | 无直接对应 |
| `__len__` | `len(obj)` | `obj.length`（属性） |
| `__eq__` | `obj1 == obj2` | 需手动实现 |
| `__lt__` | `obj1 < obj2` | 需手动实现 |
| `__contains__` | `x in obj` | `obj.has(x)` / `obj.includes(x)` |
| `__getitem__` | `obj[key]` | 原生支持 |
| `__setitem__` | `obj[key] = value` | 原生支持 |

企业项目中最常用的是 `__init__`、`__str__`、`__repr__` 和 `__eq__`，其他了解即可。

## 十六、@dataclass：现代数据类

Python 3.7+ 提供了 `@dataclass` 装饰器，自动生成 `__init__`、`__repr__`、`__eq__` 等方法，大幅减少样板代码。

### 手写 vs dataclass

```python
# 传统写法：手写一堆样板
class Article:
    def __init__(self, title, status="draft", views=0):
        self.title = title
        self.status = status
        self.views = views

    def __repr__(self):
        return f"Article(title={self.title!r}, status={self.status!r}, views={self.views})"

    def __eq__(self, other):
        return self.title == other.title and self.status == other.status
```

```python
# dataclass 写法：一行搞定
from dataclasses import dataclass

@dataclass
class Article:
    title: str
    status: str = "draft"
    views: int = 0

article = Article("Python 入门")
print(article)
# Article(title='Python 入门', status='draft', views=0)

a1 = Article("Python 入门")
a2 = Article("Python 入门")
print(a1 == a2)   # True（自动生成 __eq__）
```

`@dataclass` 自动生成了 `__init__`、`__repr__`、`__eq__`，你只需要声明字段。

### 可变默认值用 `field`

```python
from dataclasses import dataclass, field

@dataclass
class Article:
    title: str
    tags: list = field(default_factory=list)    # 不能直接写 tags: list = []

article = Article("Python 入门")
article.tags.append("基础")
print(article.tags)   # ['基础']
```

> Python 中可变默认值（列表、字典）不能直接写 `= []`，要用 `field(default_factory=list)`，否则所有实例会共享同一个列表。

JS 对照：JS 的 class 字段语法更简洁，天然隔离：

```js
class Article {
  title
  status = 'draft'
  views = 0
  tags = []    // 每个实例独立，不存在共享问题

  constructor(title) {
    this.title = title
  }
}
```

### frozen：不可变数据类

```python
@dataclass(frozen=True)
class Point:
    x: float
    y: float

p = Point(1.0, 2.0)
# p.x = 3.0    # FrozenInstanceError！不可修改
```

类似 JS 的 `Object.freeze()`。

**什么时候用 dataclass？**

- 主要用来存储数据的类（DTO、模型、配置）
- 需要自动生成 `__init__` / `__repr__` / `__eq__`
- 数据类的属性较多，手写太冗长

**什么时候不用？**

- 类有大量复杂业务逻辑（用普通 class 更灵活）
- 需要在 `__init__` 里做复杂操作

## 十七、__slots__：限制属性

默认情况下，Python 对象可以随意添加任意属性（存在 `__dict__` 里）。`__slots__` 可以限制允许的属性，同时节省内存：

```python
class Article:
    __slots__ = ["title", "status", "views"]    # 只允许这三个属性

    def __init__(self, title):
        self.title = title
        self.status = "draft"
        self.views = 0

article = Article("Python 入门")
# article.author = "小明"    # AttributeError！不在 __slots__ 里
```

| 对比 | 不用 `__slots__` | 用 `__slots__` |
| --- | --- | --- |
| 能否动态加属性 | 能 | 不能 |
| 内存占用 | 较大（有 `__dict__`） | 较小 |
| 灵活性 | 高 | 低 |

企业项目中，当需要创建大量对象（如百万级数据行）时，`__slots__` 能显著节省内存。日常开发了解即可。

## 十八、class 语法对照总表

| 功能 | Python | JS |
| --- | --- | --- |
| 定义类 | `class User:` | `class User {` |
| 构造方法 | `def __init__(self):` | `constructor() {` |
| 当前对象 | `self` | `this` |
| 创建对象 | `User()` | `new User()` |
| 定义方法 | `def method(self):` | `method() {` |
| 单继承 | `class Dog(Animal):` | `class Dog extends Animal {` |
| 多继承 | `class D(B, C):` | 不支持 |
| 调用父类 | `super().__init__()` | `super()` |
| 类属性 | 直接定义 | `static` |
| 计算属性 | `@property` | `get xxx()` |
| 私有约定 | `_name` / `__name` | `#name` |
| 静态方法 | `@staticmethod` | `static` |
| 类方法 | `@classmethod`（`cls`） | `static`（模拟） |
| 打印对象 | `__str__` | `toString()` |
| 多态 | 自然支持 | 自然支持 |
| 数据类 | `@dataclass` | class 字段语法 |
| 不可变对象 | `@dataclass(frozen=True)` | `Object.freeze()` |

## 十九、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 当前对象 | `self`（必须显式传参） | `this`（自动绑定） | Python 必须写 self |
| 创建对象 | `User()` | `new User()` | Python 不需要 new |
| 构造方法 | `__init__` | `constructor` | Python 双下划线 |
| 方法第一个参数 | 必须写 `self` | 不需要 | Python 最容易忘的 |
| 继承 | `class Dog(Animal):` | `class Dog extends Animal` | Python 用括号 |
| 多继承 | `class D(B, C):` | 不支持 | Python 独有 |
| 调用父类构造 | `super().__init__()` | `super()` | Python 要写方法名 |
| 类属性 | 直接定义 | `static` | Python 不需要 static |
| 私有属性 | `_name` / `__name` | `#name` | Python 用下划线约定 |
| 计算属性 | `@property` | `get xxx()` | Python 用装饰器 |
| 属性命名 | 蛇形 `view_count` | 驼峰 `viewCount` | 风格差异 |
| 打印对象 | `__str__` | `toString()` | Python 双下划线 |
| 类型判断 | `isinstance(obj, Cls)` | `obj instanceof Cls` | 函数 vs 运算符 |
| 数据类 | `@dataclass` | class 字段 | Python 用装饰器 |

## 二十、企业项目实战：文章类

```python
from dataclasses import dataclass, field


@dataclass
class Article:
    """文章数据类"""
    title: str
    status: str = "draft"
    category: str = ""
    tags: list = field(default_factory=list)
    view_count: int = 0

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

    @property
    def is_published(self):
        """是否已发布（计算属性）"""
        return self.status == "published"

    @property
    def engagement_rate(self):
        """标签密度 = 标签数 / (浏览数+1)"""
        return round(len(self.tags) / (self.view_count + 1), 2)

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

print(article.is_published)      # True（@property，不加括号）
print(article.engagement_rate)   # 0.67（自动计算）
```

这个实战综合运用了 `@dataclass`、`@property`、方法定义和魔术方法，体现了现代 Python 类的典型写法。

## 二十一、本篇练习

练习一：商品类。

```python
class Product:
    def __init__(self, name, price, count):
        self.name = name
        self.price = price
        self.count = count

    @property
    def total_price(self):
        """总价（计算属性）"""
        return self.price * self.count

product = Product("键盘", 199, 2)
print(f"商品：{product.name}")
print(f"总价：{product.total_price} 元")   # 不加括号！
```

练习二：用 dataclass 重写。

```python
from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    count: int

    @property
    def total_price(self):
        return self.price * self.count

product = Product("键盘", 199, 2)
print(product)                     # 自动生成 __repr__
print(f"总价：{product.total_price} 元")
```

练习三：找错误。

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

```python
# 错误 4：继承时忘记调用 super().__init__()
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, breed):
        self.breed = breed    # 忘了 super().__init__(name)！

dog = Dog("金毛")
# print(dog.name)    # AttributeError! name 没被初始化

# 正确
class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)    # 先初始化父类
        self.breed = breed
```

```python
# 错误 5：可变默认值
class Article:
    def __init__(self, title, tags=[]):    # 危险！所有实例共享同一个列表
        self.title = title
        self.tags = tags

# 正确
class Article:
    def __init__(self, title, tags=None):
        self.title = title
        self.tags = tags or []    # 每次创建新列表
```

## 本篇小结

1. Python `class` ≈ JS `class`，逻辑一样，语法细节不同。
2. Python 用 `self`，JS 用 `this`——Python 必须显式写在参数里。
3. Python 构造方法 `__init__`，JS `constructor`。
4. Python 创建对象不需要 `new`，JS 需要。
5. Python 继承 `class Dog(Animal):`，JS `class Dog extends Animal`。
6. 继承时子类 `__init__` 必须调用 `super().__init__()`，否则父类属性不初始化。
7. Python 支持**多继承**，JS 不支持；多继承按 MRO 顺序解析方法。
8. Python 类属性直接定义，JS 需要 `static`。
9. `_name` 是约定私有，`__name` 触发名称改写；JS 用 `#name` 真正私有。
10. `@property` 把方法变属性，做计算属性和数据校验；JS 用 `get` / `set`。
11. `@dataclass` 自动生成样板代码，适合数据类；类似 JS class 字段语法。
12. 优先用组合而非继承（has-a vs is-a），避免继承链过深。
13. 鸭子类型：不关心类型，只关心有没有方法；`isinstance` 考虑继承，`type()` 不考虑。
14. `__str__` 控制 `print(对象)` 的输出，JS 用 `toString()`。
15. 属性命名 Python 蛇形 `view_count`，JS 驼峰 `viewCount`。
