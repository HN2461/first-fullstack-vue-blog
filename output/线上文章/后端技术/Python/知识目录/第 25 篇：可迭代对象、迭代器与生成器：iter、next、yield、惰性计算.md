---
title: "第 25 篇：可迭代对象、迭代器与生成器：iter、next、yield、惰性计算"
slug: "python-zero-iterable-iterator-generator"
summary: "从 for 循环的执行机制出发，系统讲解可迭代对象、迭代器、iter、next、StopIteration、生成器函数、yield、生成器表达式、惰性计算和只能消费一次等核心概念。"
category: "知识目录"
tags:
  - "Python"
  - "可迭代对象"
  - "迭代器与生成器"
  - "iter"
  - "next"
  - "yield"
status: "published"
sortOrder: 250
cover: ""
originalId: "6a6b57a2fca6347974f5d180"
originalSlug: "python-zero-iterable-iterator-generator"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 25 篇：可迭代对象、迭代器与生成器：iter、next、yield、惰性计算

前面已经多次使用 `for`、`range()`、`enumerate()`、`zip()`、文件对象和 `csv.reader`。这些对象看起来不同，却都能被 `for` 遍历，因为它们遵守同一套“迭代协议”。

理解这一篇后，你会知道：

- 什么对象能放在 `for ... in ...` 后面。
- `for` 循环内部到底做了什么。
- 为什么 `next(reader)` 能取出 CSV 的下一行。
- 为什么生成器节省内存。
- 为什么有些结果遍历一次后就空了。

## 一、什么是可迭代对象

能够被 `for` 循环逐个读取的对象，叫作可迭代对象，英文是 iterable。

常见可迭代对象包括：

```python
items = ["文章", "分类", "标签"]       # 列表
name = "Python"                         # 字符串
user = {"name": "小明", "age": 18}   # 字典
numbers = range(3)                       # range 对象

for item in items:
    print(item)
```

整数不能直接遍历：

```python
for item in 10:
    print(item)
```

运行后会得到：

```text
TypeError: 'int' object is not iterable
```

这句话的意思就是：`int` 不是可迭代对象。

## 二、什么是迭代器

迭代器是负责“记住遍历位置，并提供下一个值”的对象，英文是 iterator。

使用 `iter()` 可以从可迭代对象获取迭代器：

```python
articles = ["Python 入门", "文件读写", "异常处理"]
article_iterator = iter(articles)

print(article_iterator)
```

输出形式类似：

```text
<list_iterator object at 0x...>
```

迭代器不是把整个列表重新复制一份。它保存的是遍历状态，例如“下一次应该取第几个元素”。

## 三、使用 next 获取下一个值

`next()` 每调用一次，就让迭代器返回下一个值：

```python
articles = ["Python 入门", "文件读写", "异常处理"]
article_iterator = iter(articles)

print(next(article_iterator))  # Python 入门
print(next(article_iterator))  # 文件读写
print(next(article_iterator))  # 异常处理
```

继续调用一次会发生什么？

```python
print(next(article_iterator))
```

此时迭代器已经没有值，会抛出：

```text
StopIteration
```

可以给 `next()` 提供默认值，避免结束时抛异常：

```python
articles = ["Python 入门"]
article_iterator = iter(articles)

print(next(article_iterator, None))  # Python 入门
print(next(article_iterator, None))  # None
```

CSV 文章里的 `next(reader, None)` 就是同一个原理：取出下一行；如果文件为空，则返回 `None`。

## 四、for 循环内部做了什么

下面的循环：

```python
for article in articles:
    print(article)
```

可以粗略理解成：

```python
article_iterator = iter(articles)

while True:
    try:
        article = next(article_iterator)
    except StopIteration:
        break

    print(article)
```

真实的 `for` 由 Python 解释器完成这些步骤。日常开发不需要手写这个 `while`，但理解它能解释很多现象。

## 五、可迭代对象和迭代器的区别

| 对比 | 可迭代对象 iterable | 迭代器 iterator |
| --- | --- | --- |
| 主要职责 | 提供一个可遍历的数据来源 | 记录位置并逐个返回值 |
| 能否用于 `for` | 可以 | 可以 |
| 能否用于 `next()` | 通常不可以 | 可以 |
| 常见例子 | list、str、dict、set、range | `iter(list)`、文件对象、生成器 |
| 是否通常可重复遍历 | 是 | 通常只能连续消费一次 |

验证列表本身不能直接交给 `next()`：

```python
articles = ["A", "B"]
next(articles)  # TypeError
```

要先得到迭代器：

```python
article_iterator = iter(articles)
print(next(article_iterator))
```

## 六、为什么有些对象只能遍历一次

迭代器会不断向前移动。到达末尾后，它不会自动回到开头：

```python
numbers = iter([1, 2, 3])

print(list(numbers))  # [1, 2, 3]
print(list(numbers))  # []
```

第一次 `list(numbers)` 已经把迭代器消费完了。

`zip()`、`map()`、`filter()`、生成器和很多文件读取对象也有类似特点：

```python
names = ["小明", "小红"]
scores = [90, 95]
pairs = zip(names, scores)

print(list(pairs))  # [('小明', 90), ('小红', 95)]
print(list(pairs))  # []
```

如果确实需要重复使用，可以在第一次消费时保存成列表：

```python
pairs = list(zip(names, scores))

print(pairs)
print(pairs)
```

但大数据量场景不要随意全部转成列表，否则会失去节省内存的优势。

## 七、什么是生成器函数

函数里只要出现 `yield`，调用它时就会返回生成器，而不是一次执行到底。

```python
def generate_numbers():
    yield 1
    yield 2
    yield 3

numbers = generate_numbers()
print(numbers)
```

输出形式类似：

```text
<generator object generate_numbers at 0x...>
```

使用 `next()` 观察执行过程：

```python
numbers = generate_numbers()

print(next(numbers))  # 1
print(next(numbers))  # 2
print(next(numbers))  # 3
```

每次执行到 `yield` 时，函数会交出一个值并暂停；下一次 `next()` 会从暂停的位置继续。

## 八、yield 和 return 的区别

| 对比 | `return` | `yield` |
| --- | --- | --- |
| 作用 | 返回结果并结束函数 | 返回一个值并暂停函数 |
| 一个函数中产生值的次数 | 通常一次 | 可以多次 |
| 调用结果 | 普通值 | 生成器对象 |
| 典型用途 | 计算一个最终结果 | 逐个产生一批结果 |

```python
def get_titles():
    return ["A", "B", "C"]

def generate_titles():
    yield "A"
    yield "B"
    yield "C"
```

两者都能用于循环，但前者先创建完整列表，后者在需要时才产生下一个值。

## 九、惰性计算为什么节省内存

列表推导式会立即创建全部结果：

```python
squares = [number ** 2 for number in range(1_000_000)]
```

生成器表达式使用圆括号，不会立即保存一百万个结果：

```python
squares = (number ** 2 for number in range(1_000_000))
```

只有遍历时才逐个计算：

```python
for square in squares:
    if square > 100:
        break
    print(square)
```

这种“用到时再计算”的方式叫惰性计算。它很适合日志、大文件、数据库结果和爬虫数据流。

## 十、生成器实战：逐条清洗文章

```python
def clean_articles(raw_articles):
    for raw_article in raw_articles:
        title = raw_article.get("title", "").strip()
        if not title:
            continue

        yield {
            "title": title,
            "status": raw_article.get("status", "draft")
        }


raw_articles = [
    {"title": "  Python 入门  ", "status": "published"},
    {"title": ""},
    {"title": "文件读写"}
]

for article in clean_articles(raw_articles):
    print(article)
```

这个函数不会先创建一个新的完整列表，而是清洗成功一条就交出一条。

## 十一、yield from 简单了解

当一个生成器需要继续产生另一个可迭代对象中的所有值时，可以使用 `yield from`：

```python
def generate_all_tags():
    yield from ["Python", "FastAPI"]
    yield from ["Vue", "Vite"]

print(list(generate_all_tags()))
```

输出：

```text
['Python', 'FastAPI', 'Vue', 'Vite']
```

它相当于分别循环两个列表并逐个 `yield`，但写法更简洁。

## 十二、Python 和 JavaScript 对照

JavaScript 也有可迭代协议和生成器：

```js
function* generateNumbers() {
  yield 1
  yield 2
  yield 3
}

const numbers = generateNumbers()
console.log(numbers.next()) // { value: 1, done: false }
console.log(numbers.next()) // { value: 2, done: false }
```

| 概念 | Python | JavaScript |
| --- | --- | --- |
| 获取迭代器 | `iter(value)` | `value[Symbol.iterator]()` |
| 获取下一个值 | `next(iterator)` | `iterator.next()` |
| 结束信号 | `StopIteration` | `{ done: true }` |
| 生成器函数 | `def` + `yield` | `function*` + `yield` |
| 生成器表达式 | `(x * 2 for x in items)` | 无直接对应语法 |

## 十三、常见错误

### 1. 对普通列表直接调用 next

```python
items = [1, 2, 3]
next(items)  # TypeError
```

应先使用 `iter(items)`。

### 2. 重复消费同一个生成器

```python
numbers = (number for number in range(3))
print(list(numbers))  # [0, 1, 2]
print(list(numbers))  # []
```

需要重新创建生成器，或者明确转换并保存为列表。

### 3. 为了重复使用而盲目转成列表

如果数据量很大，`list(generator)` 会一次占用大量内存。应先确认是否真的需要保存所有结果。

## 十四、本篇练习

1. 创建一个字符串迭代器，连续调用 `next()`，观察每次返回的字符。
2. 写一个生成器 `generate_even_numbers(limit)`，逐个产生小于 `limit` 的偶数。
3. 分别使用列表推导式和生成器表达式创建平方数，比较它们打印出来的对象类型。
4. 创建一个 `zip()` 对象，连续转换两次列表，解释第二次为什么为空。

参考实现：

```python
def generate_even_numbers(limit):
    for number in range(limit):
        if number % 2 == 0:
            yield number


print(list(generate_even_numbers(10)))
```

## 本篇小结

1. 可迭代对象可以交给 `for`，迭代器负责记录位置并返回下一个值。
2. `iter()` 获取迭代器，`next()` 获取下一个值，结束时产生 `StopIteration`。
3. `for` 循环会自动完成获取迭代器、调用 `next()` 和处理结束信号。
4. 迭代器和生成器通常只能连续消费一次。
5. 包含 `yield` 的函数是生成器函数，每次产生一个值并暂停。
6. 生成器表达式使用圆括号，适合大数据量和流式处理。
7. 不要为了方便而把所有生成器都转换成列表，应根据数据量和复用需求选择。
