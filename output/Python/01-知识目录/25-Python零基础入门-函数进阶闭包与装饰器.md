---
title: Python 零基础入门 25：函数进阶、闭包与装饰器
slug: python-zero-advanced-functions-closures-decorators
summary: 补齐 Python 函数的高频工程知识，讲解参数绑定、可变默认参数、LEGB 作用域、nonlocal、闭包、函数作为对象、装饰器、functools.wraps、带参数装饰器和递归边界。
category: Python入门
tags:
  - Python
  - 零基础入门
  - 函数
  - 装饰器
status: draft
cover:
---

# Python 零基础入门 25：函数进阶、闭包与装饰器

前面的函数文章已经讲过参数、返回值、默认参数、`*args`、`**kwargs`、类型提示和 `global`。真实项目还经常出现几类问题：

- 为什么默认参数不能随手写成空列表。
- `/` 和单独的 `*` 为什么会出现在函数签名里。
- 内层函数怎样记住外层函数的变量。
- `@property`、`@classmethod`、`@dataclass` 到底是什么语法。
- 装饰器怎样在不修改业务函数的情况下加入日志、计时或权限检查。

## 一、先理解参数绑定

调用函数时，Python 会把实参绑定到形参：

```python
def create_article(title, status="draft"):
    return {"title": title, "status": status}


create_article("Python 入门")
create_article("Python 入门", "published")
create_article(title="Python 入门", status="published")
```

前两个调用使用位置参数，最后一个使用关键字参数。

参数顺序通常遵循：

```text
普通参数 -> 默认参数 -> *args -> 仅限关键字参数 -> **kwargs
```

## 二、仅限位置参数 /

`/` 左边的参数只能按位置传递：

```python
def calculate_page(offset, limit, /):
    return offset // limit + 1


print(calculate_page(20, 10))
```

下面的调用会报错：

```python
calculate_page(offset=20, limit=10)
```

很多内置函数使用这种设计。例如 `len(obj)` 的参数名称属于实现细节，调用者不需要依赖名称。

业务函数不必到处使用 `/`。只有当参数名不应成为公开接口，或者需要兼容已有调用方式时才考虑它。

## 三、仅限关键字参数 *

单独的 `*` 右边的参数必须写出参数名：

```python
def query_articles(keyword, *, page=1, page_size=20, include_draft=False):
    return {
        "keyword": keyword,
        "page": page,
        "page_size": page_size,
        "include_draft": include_draft
    }


query_articles("Python", page=2, include_draft=True)
```

下面的写法会报错：

```python
query_articles("Python", 2, 20, True)
```

布尔值、分页配置等参数如果全部按位置传递，很难看懂每个值的含义。仅限关键字参数能让调用更明确。

## 四、可变默认参数陷阱

下面的函数看起来会为每次调用创建一个新列表：

```python
def add_tag(tag, tags=[]):
    tags.append(tag)
    return tags
```

实际结果却是：

```python
print(add_tag("Python"))   # ['Python']
print(add_tag("FastAPI"))  # ['Python', 'FastAPI']
```

原因是：**默认参数在函数定义时只计算一次**。后续调用会继续使用同一个列表。

正确写法是使用 `None` 作为哨兵值：

```python
def add_tag(tag, tags=None):
    if tags is None:
        tags = []

    tags.append(tag)
    return tags
```

字典、集合和自定义可变对象也有同样问题：

```python
def create_options(options=None):
    if options is None:
        options = {}

    return options
```

字符串、数字、元组等不可变值通常可以安全地作为默认参数。

## 五、对象可变性与函数调用

Python 传递的是对象引用。函数能否影响外部对象，取决于函数是在修改对象，还是让局部变量指向另一个对象。

修改传入列表会影响外部：

```python
def normalize_tags(tags):
    tags.append("python")


article_tags = ["fastapi"]
normalize_tags(article_tags)
print(article_tags)  # ['fastapi', 'python']
```

重新赋值不会替换外部变量：

```python
def replace_tags(tags):
    tags = ["python"]
    return tags


article_tags = ["fastapi"]
replace_tags(article_tags)
print(article_tags)  # ['fastapi']
```

如果函数不应该修改调用方的数据，可以先复制，或者返回一个新对象并在函数名、注释中说明行为。

## 六、LEGB 作用域查找顺序

Python 查找变量时遵循 LEGB：

| 缩写 | 作用域 | 说明 |
| --- | --- | --- |
| L | Local | 当前函数局部作用域 |
| E | Enclosing | 外层函数作用域 |
| G | Global | 当前模块全局作用域 |
| B | Built-in | `len`、`print` 等内置名称 |

```python
app_name = "知识库"  # Global

def outer():
    section = "Python"  # Enclosing

    def inner():
        title = "函数进阶"  # Local
        print(title, section, app_name, len(title))

    inner()


outer()
```

不要把变量命名成 `list`、`str`、`dict`、`id` 等内置名称，否则会遮蔽内置函数。

## 七、闭包是什么

内层函数引用了外层函数的变量，并且在外层函数结束后仍能使用这些变量，这种组合叫闭包。

```python
def create_title_formatter(prefix):
    def format_title(title):
        return f"{prefix}：{title}"

    return format_title


python_formatter = create_title_formatter("Python")
fastapi_formatter = create_title_formatter("FastAPI")

print(python_formatter("生成器"))
print(fastapi_formatter("依赖注入"))
```

`format_title` 记住了创建它时的 `prefix`。

## 八、使用 nonlocal 修改外层变量

如果内层函数只读取外层变量，不需要特殊声明。要修改外层函数的变量，需要 `nonlocal`：

```python
def create_counter():
    count = 0

    def increment():
        nonlocal count
        count += 1
        return count

    return increment


counter = create_counter()
print(counter())  # 1
print(counter())  # 2
```

对照：

- `global` 修改模块级变量。
- `nonlocal` 修改最近一层外部函数变量。
- 普通局部赋值只影响当前函数。

状态复杂时更适合使用类，不要用多层闭包堆积大量业务状态。

## 九、函数也是对象

Python 函数可以赋值给变量、放进容器、作为参数传递，也可以作为返回值：

```python
def publish(article):
    return {**article, "status": "published"}


operation = publish
result = operation({"title": "Python 入门"})
print(result)
```

函数作为参数：

```python
def process_article(article, operation):
    return operation(article)


print(process_article({"title": "Python 入门"}, publish))
```

装饰器正是利用了“函数可以接收并返回另一个函数”。

## 十、第一个装饰器

下面的装饰器会在业务函数前后打印日志：

```python
def log_call(func):
    def wrapper():
        print(f"开始调用：{func.__name__}")
        result = func()
        print(f"调用结束：{func.__name__}")
        return result

    return wrapper


@log_call
def import_articles():
    print("正在导入文章")
    return 3


count = import_articles()
print(count)
```

这段代码：

```python
@log_call
def import_articles():
    ...
```

等价于：

```python
def import_articles():
    ...

import_articles = log_call(import_articles)
```

装饰器接收原函数，返回包装后的函数，然后用返回结果替换原来的函数名。

## 十一、让装饰器支持任意参数

业务函数通常有参数，因此包装函数应接收 `*args` 和 `**kwargs`：

```python
def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"开始调用：{func.__name__}")
        result = func(*args, **kwargs)
        print(f"调用结束：{func.__name__}")
        return result

    return wrapper


@log_call
def get_article(article_id, *, include_draft=False):
    return {"id": article_id, "include_draft": include_draft}


print(get_article("article-001", include_draft=True))
```

## 十二、使用 functools.wraps 保留元数据

上面的包装会让函数名变成 `wrapper`，影响日志、调试和自动生成文档：

```python
print(get_article.__name__)  # wrapper
```

标准写法应使用 `functools.wraps`：

```python
from functools import wraps


def log_call(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"开始调用：{func.__name__}")
        return func(*args, **kwargs)

    return wrapper
```

`@wraps(func)` 会保留原函数的名称、文档字符串、注解等信息。编写通用装饰器时应默认使用它。

## 十三、带参数的装饰器

如果装饰器本身也需要配置，就会多一层函数：

```python
from functools import wraps


def require_role(required_role):
    def decorator(func):
        @wraps(func)
        def wrapper(user, *args, **kwargs):
            if user.get("role") != required_role:
                raise PermissionError("没有操作权限")

            return func(user, *args, **kwargs)

        return wrapper

    return decorator


@require_role("admin")
def delete_article(user, article_id):
    return f"已删除文章：{article_id}"
```

执行顺序可以从外向内理解：

```text
require_role("admin") -> decorator -> wrapper
```

真实权限系统不能只靠这个简单示例，但它能说明带参数装饰器的结构。

## 十四、多个装饰器的顺序

```python
@decorator_a
@decorator_b
def run():
    pass
```

等价于：

```python
run = decorator_a(decorator_b(run))
```

离函数最近的 `decorator_b` 先包装，调用时则先进入最外层的 `decorator_a`。多个装饰器叠加时应保持数量克制，并通过测试确认顺序。

## 十五、前面见过的装饰器

| 装饰器 | 用途 |
| --- | --- |
| `@property` | 把方法作为属性读取 |
| `@staticmethod` | 定义不依赖实例和类的方法 |
| `@classmethod` | 接收类本身作为第一个参数 |
| `@dataclass` | 自动生成数据类常用方法 |
| `@contextmanager` | 用生成器创建上下文管理器 |

框架中也大量使用装饰器，例如 FastAPI 的 `@app.get()` 和 pytest 的 `@pytest.mark.parametrize()`。

## 十六、递归的边界

函数直接或间接调用自身叫递归：

```python
def factorial(number):
    if number <= 1:
        return 1

    return number * factorial(number - 1)


print(factorial(5))  # 120
```

递归必须有终止条件。Python 对递归深度有限制，也不会像部分语言那样自动优化尾递归。遍历普通列表、累计求和等场景通常优先用循环；树形目录、嵌套结构等天然递归数据才适合考虑递归。

## 十七、Python 和 JavaScript 对照

| 概念 | Python | JavaScript |
| --- | --- | --- |
| 闭包 | 支持 | 支持 |
| 修改外层变量 | `nonlocal` | 直接修改闭包变量 |
| 可变默认参数问题 | 定义时计算一次 | 调用时计算，行为不同 |
| 仅限关键字参数 | 单独的 `*` | 通常使用对象参数模拟 |
| 装饰器 | `@decorator` 广泛使用 | 新装饰器语法常见于类生态 |
| 保留函数元数据 | `functools.wraps` | 通常手动处理 |

不要把 JS 默认参数的经验直接套到 Python。Python 的可变默认参数是非常高频的面试题和真实缺陷来源。

## 十八、常见错误

1. 使用 `[]`、`{}`、`set()` 作为默认参数。
2. 在闭包里赋值却忘记 `nonlocal`，导致 `UnboundLocalError`。
3. 装饰器没有返回业务函数的结果。
4. 装饰器没有透传 `*args` 和 `**kwargs`。
5. 忘记 `@wraps`，导致函数名称、文档和框架元数据丢失。
6. 用装饰器隐藏过多业务逻辑，导致调用链难以理解。

## 十九、本篇练习

1. 修复一个使用 `tags=[]` 默认参数的函数，并连续调用两次验证结果互不影响。
2. 编写 `create_counter(start=0)`，用闭包和 `nonlocal` 返回递增计数器。
3. 编写 `log_call` 装饰器，支持任意参数、返回值并保留原函数名称。
4. 编写 `repeat(times)` 装饰器，让被装饰函数执行指定次数。

## 本篇小结

1. `/` 左边是仅限位置参数，单独 `*` 右边是仅限关键字参数。
2. 可变默认参数只创建一次，应使用 `None` 再在函数内部创建新容器。
3. Python 按 LEGB 顺序查找名称，`nonlocal` 用于修改外层函数变量。
4. 闭包是函数与它记住的外层环境的组合。
5. 函数是一等对象，因此可以接收并返回函数。
6. 装饰器本质上是“接收函数并返回包装后函数”的可调用对象。
7. 通用装饰器应支持 `*args`、`**kwargs`，返回原结果，并使用 `functools.wraps`。
8. 递归必须有明确终止条件，普通线性任务优先使用循环。
