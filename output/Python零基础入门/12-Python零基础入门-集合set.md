---
title: Python 零基础入门 12：集合 set
slug: python-zero-sets
summary: 讲解集合是什么、集合的创建、去重、交集并集差集运算、集合推导式、frozenset，全程对照 JavaScript 的 Set 对象。
category: Python入门
tags:
  - Python
  - 零基础入门
status: draft
cover:
---

# Python 零基础入门 12：集合 set

集合是 Python 四大基础数据结构的最后一个。

前面学了列表（有序可变）、元组（有序不可变）、字典（键值对）。集合的特点是：**无序、不重复。**

前端 JS 里你也用过 `Set`：

```js
const tags = new Set(['Python', 'JS', 'Python'])
console.log(tags)   // Set(2) { 'Python', 'JS' }
```

Python 集合和 JS `Set` 类似，但集合运算符是 Python 的特色——两个集合的交集、并集、差集可以用 `&`、`|`、`-` 直接算，比 JS 简洁得多。

## 一、集合是什么

集合有两个核心特征：

1. **无序**：元素没有固定顺序，不能用索引访问。
2. **不重复**：相同的值只保留一个。

```python
tags = {"Python", "JS", "Vue"}
print(tags)       # {'Python', 'JS', 'Vue'}——顺序可能不同
```

为什么无序？因为集合内部用的是哈希表，和字典的键一样。这也意味着集合的元素必须是不可变类型（字符串、数字、元组），不能放列表或字典。

## 二、创建集合

### 用花括号

```python
tags = {"Python", "JS", "Vue"}
nums = {1, 2, 3, 4, 5}
```

注意：空集合**不能用** `{}`，因为 `{}` 表示空字典：

```python
empty_dict = {}          # 这是空字典！
empty_set = set()        # 这才是空集合

print(type(empty_dict))  # <class 'dict'>
print(type(empty_set))   # <class 'set'>
```

**高频踩坑：空集合必须用 `set()`，不能写 `{}`。**

### 从列表创建（去重）

```python
raw_tags = ["Python", "JS", "Vue", "Python", "JS"]
unique_tags = set(raw_tags)

print(unique_tags)   # {'Python', 'JS', 'Vue'}
```

### 从字符串创建

```python
chars = set("hello")
print(chars)   # {'h', 'e', 'l', 'o'}——注意 'l' 只出现一次
```

### 从元组创建

```python
coords = set([(1, 2), (3, 4), (1, 2)])
print(coords)   # {(1, 2), (3, 4)}
```

JS 对照：

```js
const rawTags = ['Python', 'JS', 'Vue', 'Python', 'JS']
const uniqueTags = new Set(rawTags)

console.log(uniqueTags)   // Set(3) { 'Python', 'JS', 'Vue' }
console.log([...uniqueTags])  // ['Python', 'JS', 'Vue']
```

## 三、集合的基本操作

### 添加元素

```python
tags = {"Python", "JS"}
tags.add("Vue")

print(tags)   # {'Python', 'JS', 'Vue'}
```

如果添加已存在的元素，不会有任何效果（集合自动去重）：

```python
tags.add("Python")   # 已存在，无变化
```

JS 对照：

```js
const tags = new Set(['Python', 'JS'])
tags.add('Vue')
```

### 删除元素

```python
tags = {"Python", "JS", "Vue"}

tags.remove("JS")      # 删除指定元素，不存在会报错 KeyError
tags.discard("Vue")    # 删除指定元素，不存在不报错（推荐）

print(tags)   # {'Python'}
```

`discard()` 比 `remove()` 更安全——元素不存在时不会报错。

JS 对照：

```js
tags.delete('JS')   // 不存在不报错
```

### 随机删除一个元素

```python
tags = {"Python", "JS", "Vue"}
removed = tags.pop()    # 随机删除并返回一个元素

print(f"删除了：{removed}")
print(f"剩余：{tags}")
```

因为集合无序，`pop()` 删除的元素是不确定的。

### 清空

```python
tags.clear()
print(tags)   # set()
```

### 判断包含

```python
tags = {"Python", "JS", "Vue"}

print("Python" in tags)    # True
print("Java" in tags)      # False
```

JS 对照：

```js
console.log(tags.has('Python'))   // true
```

### 长度

```python
print(len(tags))    # 3
```

### 基本操作对照表

| 功能 | Python | JS |
| --- | --- | --- |
| 创建 | `set()` 或 `{1, 2}` | `new Set()` |
| 添加 | `s.add(x)` | `s.add(x)` |
| 删除（安全） | `s.discard(x)` | `s.delete(x)` |
| 删除（严格） | `s.remove(x)` | 无 |
| 判断包含 | `x in s` | `s.has(x)` |
| 长度 | `len(s)` | `s.size` |
| 清空 | `s.clear()` | `s.clear()` |

## 四、集合运算——Python 特色

这是集合最强大的功能，JS `Set` 没有这些运算符。

### 交集 &：两个集合都有的

```python
frontend = {"HTML", "CSS", "JS", "Vue"}
backend = {"Python", "JS", "MongoDB", "Vue"}

both = frontend & backend
print(both)   # {'JS', 'Vue'}
```

### 并集 |：两个集合所有的（去重）

```python
frontend = {"HTML", "CSS", "JS", "Vue"}
backend = {"Python", "JS", "MongoDB", "Vue"}

all_skills = frontend | backend
print(all_skills)   # {'HTML', 'CSS', 'JS', 'Vue', 'Python', 'MongoDB'}
```

### 差集 -：前者有但后者没有的

```python
frontend = {"HTML", "CSS", "JS", "Vue"}
backend = {"Python", "JS", "MongoDB", "Vue"}

frontend_only = frontend - backend
print(frontend_only)   # {'HTML', 'CSS'}

backend_only = backend - frontend
print(backend_only)    # {'Python', 'MongoDB'}
```

### 对称差集 ^：只在其中一个集合出现的

```python
frontend = {"HTML", "CSS", "JS", "Vue"}
backend = {"Python", "JS", "MongoDB", "Vue"}

unique = frontend ^ backend
print(unique)   # {'HTML', 'CSS', 'Python', 'MongoDB'}
```

### 子集和超集

```python
basic = {"HTML", "CSS"}
web = {"HTML", "CSS", "JS", "Vue"}

print(basic <= web)    # True（basic 是 web 的子集）
print(web >= basic)    # True（web 是 basic 的超集）
print(basic < web)     # True（真子集，不等于）
```

### 集合运算对照表

| 运算 | Python | 含义 | JS |
| --- | --- | --- | --- |
| 交集 | `a & b` | 两个都有 | 无运算符，需手动筛选 |
| 并集 | `a \| b` | 所有的 | 无运算符，需手动合并 |
| 差集 | `a - b` | a 有 b 没有 | 无运算符，需手动筛选 |
| 对称差集 | `a ^ b` | 只在一个里 | 无运算符 |
| 子集 | `a <= b` | a 是 b 的子集 | 无运算符 |
| 超集 | `a >= b` | a 是 b 的超集 | 无运算符 |

JS 实现交集/并集/差集：

```js
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])

// 交集
const intersection = new Set([...a].filter(x => b.has(x)))   // {2, 3}

// 并集
const union = new Set([...a, ...b])                           // {1, 2, 3, 4}

// 差集
const difference = new Set([...a].filter(x => !b.has(x)))     // {1}
```

Python 的 `&` `|` `-` 运算符比 JS 简洁太多。

## 五、集合方法版本

运算符可以用方法代替，方法还可以传任意可迭代对象（运算符只接受集合）：

```python
frontend = {"HTML", "CSS", "JS", "Vue"}
backend_list = ["Python", "JS", "MongoDB", "Vue"]   # 列表，不是集合

# 方法可以接受列表
both = frontend.intersection(backend_list)    # {'JS', 'Vue'}

# 运算符不行
# frontend & backend_list   # TypeError!
```

| 运算符 | 方法 |
| --- | --- |
| `a & b` | `a.intersection(b)` |
| `a \| b` | `a.union(b)` |
| `a - b` | `a.difference(b)` |
| `a ^ b` | `a.symmetric_difference(b)` |

**企业项目中，如果另一个对象是列表，用方法更方便；如果两边都是集合，运算符更简洁。**

## 六、集合推导式

和列表推导式语法类似，但用花括号，自动去重：

```python
# 生成平方集合
squares = {x**2 for x in range(1, 6)}
print(squares)   # {1, 4, 9, 16, 25}

# 从列表提取首字母并去重
words = ["Python", "PHP", "PostgreSQL", "Java"]
first_letters = {word[0] for word in words}
print(first_letters)   # {'P', 'J'}
```

JS 对照：

```js
const words = ['Python', 'PHP', 'PostgreSQL', 'Java']
const firstLetters = new Set(words.map(w => w[0]))
console.log([...firstLetters])   // ['P', 'J']
```

## 七、frozenset：不可变集合

`set` 是可变的，`frozenset` 是不可变的——类似列表和元组的关系。

```python
fs = frozenset([1, 2, 3])

fs.add(4)        # AttributeError! 不可变
fs.remove(1)     # AttributeError! 不可变
```

用途：`frozenset` 可以做字典的键，也可以做集合的元素（普通 `set` 不行）。

```python
# 用 frozenset 做字典的键
graph = {
    frozenset({"A", "B"}): "边AB",
    frozenset({"B", "C"}): "边BC",
}

print(graph[frozenset({"A", "B"})])   # 边AB
print(graph[frozenset({"B", "A"})])   # 边AB（集合无序，A/B和B/A一样）
```

实际开发中 `frozenset` 用得不多，知道有这个类型即可。

## 八、集合的实际用途

### 1. 去重

最常见的用途：

```python
raw_tags = ["Python", "JS", "Vue", "python", "JS"]

# 统一大小写后去重
unique = list({tag.lower() for tag in raw_tags})
print(unique)   # ['python', 'js', 'vue']
```

### 2. 判断元素是否存在（比列表快）

```python
# 列表判断包含：需要逐个比较，慢
valid_statuses = ["draft", "published", "archived"]
if "draft" in valid_statuses:   # O(n)
    print("有效状态")

# 集合判断包含：哈希查找，快
valid_statuses_set = {"draft", "published", "archived"}
if "draft" in valid_statuses_set:   # O(1)
    print("有效状态")
```

数据量大时，集合的查找速度远快于列表。企业项目中，如果只需要判断"在不在"，用集合比列表好。

### 3. 找两个列表的共同元素

```python
article_tags = {"Python", "入门", "字符串"}
search_tags = {"Python", "进阶", "字符串"}

common = article_tags & search_tags
print(f"共同标签：{common}")   # {'Python', '字符串'}
```

### 4. 找差异

```python
expected_tags = {"Python", "JS", "Vue", "React"}
actual_tags = {"Python", "JS", "Vue"}

missing = expected_tags - actual_tags
print(f"缺少的标签：{missing}")   # {'React'}
```

## 九、四大数据结构总对比

| 对比 | 列表 list | 元组 tuple | 字典 dict | 集合 set |
| --- | --- | --- | --- | --- |
| 符号 | `[]` | `()` | `{k: v}` | `{}` 或 `set()` |
| 有序 | ✅ | ✅ | ✅（3.7+） | ❌ |
| 可变 | ✅ | ❌ | ✅ | ✅ |
| 重复 | ✅ | ✅ | 键不可重复 | ❌ |
| 索引访问 | ✅ | ✅ | 键访问 | ❌ |
| 主要用途 | 有序数据集合 | 固定数据 | 键值映射 | 去重和集合运算 |
| JS 对应 | Array | 无 | Object | Set |

选择指南：

```text
需要一组有序数据？          → 列表
数据固定不变？              → 元组
需要键值对映射？            → 字典
需要去重或找共同/不同元素？  → 集合
```

## 十、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 创建空集合 | `set()` | `new Set()` | Python 不能用 `{}` |
| 判断包含 | `x in s` | `s.has(x)` | Python 用 in |
| 长度 | `len(s)` | `s.size` | Python 函数，JS 属性 |
| 交集 | `a & b` | 手动 filter | Python 运算符 |
| 并集 | `a \| b` | 手动合并 | Python 运算符 |
| 差集 | `a - b` | 手动 filter | Python 运算符 |
| 转列表 | `list(s)` | `[...s]` | Python 函数 |
| 迭代 | `for x in s:` | `for (const x of s)` | 语法不同 |

## 十一、企业项目实战：标签去重与关联分析

```python
# 模拟数据库中的文章标签
articles = [
    {"title": "Python 入门", "tags": ["Python", "入门", "基础"]},
    {"title": "JS 异步", "tags": ["JS", "异步", "进阶"]},
    {"title": "Python 字符串", "tags": ["Python", "字符串", "基础"]},
    {"title": "Vue 组件", "tags": ["Vue", "组件", "进阶"]},
]

# 1. 所有标签去重
all_tags = set()
for article in articles:
    all_tags.update(article["tags"])

print(f"所有标签（去重）：{sorted(all_tags)}")

# 2. 找和"Python 入门"有共同标签的文章
target = set(articles[0]["tags"])

for article in articles:
    article_tags = set(article["tags"])
    common = target & article_tags
    if common and article["title"] != "Python 入门":
        print(f"相关文章：{article['title']}，共同标签：{common}")

# 3. 统计标签出现次数
tag_counts = {}
for article in articles:
    for tag in article["tags"]:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1

print("\n标签统计：")
for tag, count in sorted(tag_counts.items()):
    print(f"  {tag}: {count} 次")
```

JS 对照：

```js
const articles = [
  { title: 'Python 入门', tags: ['Python', '入门', '基础'] },
  { title: 'JS 异步', tags: ['JS', '异步', '进阶'] },
  { title: 'Python 字符串', tags: ['Python', '字符串', '基础'] },
  { title: 'Vue 组件', tags: ['Vue', '组件', '进阶'] },
]

// 1. 所有标签去重
const allTags = new Set()
articles.forEach(a => a.tags.forEach(t => allTags.add(t)))
console.log('所有标签：', [...allTags].sort())

// 2. 找相关文章
const target = new Set(articles[0].tags)
articles.forEach(a => {
  const articleTags = new Set(a.tags)
  const common = [...articleTags].filter(t => target.has(t))
  if (common.length > 0 && a.title !== 'Python 入门') {
    console.log(`相关文章：${a.title}，共同标签：${common}`)
  }
})
```

## 十二、本篇练习

练习一：去重。

```python
emails = ["a@test.com", "b@test.com", "a@test.com", "c@test.com", "b@test.com"]
unique_emails = list(set(emails))

print(f"原始数量：{len(emails)}")
print(f"去重后：{unique_emails}")
print(f"去重数量：{len(unique_emails)}")
```

练习二：集合运算。

```python
team_a = {"小明", "小红", "小刚", "小李"}
team_b = {"小红", "小李", "小张", "小王"}

# 两个队都有的人
both = team_a & team_b
print(f"两边都有：{both}")

# 只在 A 队的人
a_only = team_a - team_b
print(f"只在 A 队：{a_only}")

# 所有人
everyone = team_a | team_b
print(f"所有人：{everyone}")
```

练习三：找错误。

```python
# 错误 1：用 {} 创建空集合
empty = {}           # 这是字典！
empty_set = set()    # 这才是空集合

# 错误 2：集合里放列表
s = {[1, 2]}         # TypeError! 列表不可哈希
s = {(1, 2)}         # 正确：元组可以

# 错误 3：用索引访问集合
s = {1, 2, 3}
print(s[0])          # TypeError! 集合不支持索引
```

## 本篇小结

1. 集合是无序、不重复的数据结构，用 `{}` 或 `set()` 创建。
2. 空集合必须用 `set()`，`{}` 是空字典。
3. 集合元素必须是不可变类型（字符串、数字、元组），不能放列表或字典。
4. `add()` 添加、`discard()` 安全删除、`remove()` 严格删除。
5. **集合运算**是 Python 特色：`&` 交集、`|` 并集、`-` 差集、`^` 对称差集。
6. 集合查找速度 O(1)，比列表 O(n) 快很多——判断"在不在"优先用集合。
7. 集合推导式用花括号：`{x**2 for x in range(5)}`。
8. `frozenset` 是不可变集合，可以做字典的键。
9. 四大数据结构选择：有序可变用列表，有序不可变用元组，键值对用字典，去重和集合运算用集合。
10. JS `Set` 没有集合运算符，Python 的 `&` `|` `-` `^` 比手动 filter 简洁得多。
