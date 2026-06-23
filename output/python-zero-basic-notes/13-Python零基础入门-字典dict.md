---
title: Python 零基础入门 13：字典 dict
slug: python-zero-dictionaries
summary: 用个人信息示例解释字典的键值对结构，讲解读取、修改、添加、删除、循环字典以及字典和列表的组合，全程对照 JavaScript 对象。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 13：字典 dict

字典用于保存"名称和值"的对应关系。

前端 JS 里你天天用对象：

```js
const user = {
  name: '小明',
  age: 18,
  city: '北京'
}
```

Python 字典 ≈ JS 对象，但语法和用法有不少差异。

## 一、字典是什么

```python
user = {
    "name": "小明",
    "age": 18,
    "city": "北京"
}
```

这里的 `"name"`、`"age"`、`"city"` 叫**键（key）**。

对应的 `"小明"`、`18`、`"北京"` 叫**值（value）**。

合在一起叫**键值对（key-value pair）**。

你可以把字典理解成：

```text
name -> 小明
age  -> 18
city -> 北京
```

它适合保存一个对象的多项信息。

### 字典 vs JS 对象

| 对比 | Python 字典 | JS 对象 |
| --- | --- | --- |
| 定义语法 | `{"key": value}` | `{key: value}` 或 `{"key": value}` |
| 键的类型 | 可以是字符串、数字、元组等 | 通常是字符串或 Symbol |
| 键的引号 | **必须加引号** | 可以省略 |
| 访问方式 | `dict["key"]` | `obj.key` 或 `obj["key"]` |
| 顺序 | Python 3.7+ 保持插入顺序 | ES2015+ 保持插入顺序 |

## 二、创建字典

```python
# 基本创建
user = {
    "name": "小明",
    "age": 18,
    "city": "北京"
}

# 空字典
empty = {}

# 从关键字参数创建
config = dict(host="localhost", port=3306)

# 从键值对列表创建
items = dict([("name", "小明"), ("age", 18)])
```

JS 对照：

```js
const user = {
  name: '小明',    // 键可以不加引号
  age: 18,
  city: '北京'
}

const empty = {}

const config = { host: 'localhost', port: 3306 }
```

**高频踩坑：Python 字典键必须加引号**

```python
user = {name: "小明"}   # NameError! name 没定义
```

正确：

```python
user = {"name": "小明"}
```

JS 里键可以不加引号（前提是合法标识符），Python 不行。

## 三、读取值

### 用方括号

```python
user = {"name": "小明", "age": 18}

print(user["name"])   # 小明
print(user["age"])    # 18
```

键不存在时报错：

```python
print(user["email"])  # KeyError: 'email'
```

### 用 get() 更安全

```python
user = {"name": "小明"}

print(user.get("email"))          # None（不报错）
print(user.get("email", "无"))    # 无（设置默认值）
```

**企业项目中，从字典/对象读取值时，推荐用 `get()`，避免 KeyError。**

JS 对照：

```js
const user = { name: '小明' }

console.log(user.email)          // undefined（不报错）
console.log(user.name)           // '小明'
console.log(user['email'])       // undefined
```

JS 用点号或方括号访问，不存在返回 `undefined`，不报错。

对照表：

| 功能 | Python | JS |
| --- | --- | --- |
| 读取值 | `dict["key"]` | `obj.key` 或 `obj["key"]` |
| 键不存在 | 报错 `KeyError` | 返回 `undefined` |
| 安全读取 | `dict.get("key")` | `obj.key`（本身安全） |
| 带默认值 | `dict.get("key", default)` | `obj.key \|\| default` 或 `obj.key ?? default` |

## 四、修改值

```python
user = {"name": "小明", "age": 18}

user["age"] = 19
print(user)   # {'name': '小明', 'age': 19}
```

JS 一样：

```js
const user = { name: '小明', age: 18 }
user.age = 19
```

## 五、添加新内容

```python
user = {"name": "小明", "age": 18}

user["city"] = "上海"    # 键不存在就添加
print(user)              # {'name': '小明', 'age': 18, 'city': '上海'}
```

Python 字典添加就是给新键赋值，和 JS 一样。

## 六、删除内容

```python
user = {"name": "小明", "age": 18, "city": "北京"}

del user["city"]
print(user)   # {'name': '小明', 'age': 18}
```

或用 `pop()`：

```python
city = user.pop("city")    # 删除并返回值
print(city)                # 北京
```

JS 对照：

```js
delete user.city
// 或
delete user['city']
```

对照表：

| 功能 | Python | JS |
| --- | --- | --- |
| 删除键值对 | `del dict["key"]` | `delete obj.key` |
| 删除并返回值 | `dict.pop("key")` | 无直接等价 |

## 七、循环字典

### 遍历键

```python
user = {"name": "小明", "age": 18, "city": "北京"}

for key in user:
    print(key)
```

或更明确：

```python
for key in user.keys():
    print(key)
```

### 遍历值

```python
for value in user.values():
    print(value)
```

### 遍历键和值

```python
for key, value in user.items():
    print(f"{key}: {value}")
```

输出：

```text
name: 小明
age: 18
city: 北京
```

JS 对照：

```js
const user = { name: '小明', age: 18, city: '北京' }

// 遍历键
for (const key of Object.keys(user)) {
  console.log(key)
}

// 遍历值
for (const value of Object.values(user)) {
  console.log(value)
}

// 遍历键值对
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`)
}
```

对照表：

| 功能 | Python | JS |
| --- | --- | --- |
| 所有键 | `dict.keys()` | `Object.keys(obj)` |
| 所有值 | `dict.values()` | `Object.values(obj)` |
| 所有键值对 | `dict.items()` | `Object.entries(obj)` |
| 默认遍历 | 遍历键 | `for...in` 遍历键（含原型链） |

## 八、判断键是否存在

Python：

```python
user = {"name": "小明"}

print("name" in user)    # True
print("email" in user)   # False
```

JS：

```js
const user = { name: '小明' }

console.log('name' in user)      // true
console.log(user.hasOwnProperty('name'))  // true
```

Python 的 `in` 更直观，JS 的 `in` 可能包含原型链上的属性。

## 九、字典常用方法

| 功能 | Python | JS |
| --- | --- | --- |
| 长度 | `len(dict)` | `Object.keys(obj).length` |
| 合并 | `dict.update(other)` | `Object.assign(obj, other)` 或 `{...obj, ...other}` |
| 安全获取 | `dict.get("key", default)` | `obj.key \|\| default` |
| 删除 | `del dict["key"]` 或 `dict.pop("key")` | `delete obj.key` |
| 清空 | `dict.clear()` | `obj = {}` 或逐个 delete |
| 复制 | `dict.copy()` | `{...obj}` 或 `Object.assign({}, obj)` |

### 合并字典

```python
default_config = {"host": "localhost", "port": 3306}
user_config = {"port": 5432, "debug": True}

default_config.update(user_config)
print(default_config)
# {'host': 'localhost', 'port': 5432, 'debug': True}
```

Python 3.9+ 还可以用 `|` 运算符：

```python
merged = default_config | user_config   # 返回新字典
```

JS 对照：

```js
const defaultConfig = { host: 'localhost', port: 3306 }
const userConfig = { port: 5432, debug: true }

const merged = { ...defaultConfig, ...userConfig }
```

### setdefault()：安全获取并设置默认值

`setdefault()` 在键存在时返回值，不存在时设置默认值并返回：

```python
article = {"title": "Python 入门"}

# 键不存在：设置默认值并返回
tags = article.setdefault("tags", [])
print(tags)           # []
print(article)        # {'title': 'Python 入门', 'tags': []}

# 键已存在：返回已有值，不修改
title = article.setdefault("title", "无标题")
print(title)          # Python 入门（不会改成"无标题"）
```

`setdefault()` 和 `get()` 的区别：

| 方法 | 键存在时 | 键不存在时 |
| --- | --- | --- |
| `get(key, default)` | 返回值 | 返回默认值，**不修改字典** |
| `setdefault(key, default)` | 返回值 | 设置默认值并返回，**会修改字典** |

企业场景——分组数据：

```python
# 按分类分组文章
articles = [
    {"title": "Python 入门", "category": "Python"},
    {"title": "JS 基础", "category": "JS"},
    {"title": "Python 进阶", "category": "Python"},
    {"title": "Vue 实战", "category": "Vue"},
]

# 用 setdefault 分组
grouped = {}
for article in articles:
    category = article["category"]
    grouped.setdefault(category, []).append(article["title"])

print(grouped)
# {'Python': ['Python 入门', 'Python 进阶'], 'JS': ['JS 基础'], 'Vue': ['Vue 实战']}
```

如果不用 `setdefault`，每次都要判断键是否存在：

```python
# 不用 setdefault 的写法（更啰嗦）
grouped = {}
for article in articles:
    category = article["category"]
    if category not in grouped:
        grouped[category] = []
    grouped[category].append(article["title"])
```

### defaultdict：自动初始化默认值

`collections.defaultdict` 可以自动为不存在的键创建默认值，比 `setdefault` 更优雅：

```python
from collections import defaultdict

# 创建一个 value 默认为列表的字典
grouped = defaultdict(list)

for article in articles:
    grouped[article["category"]].append(article["title"])

print(dict(grouped))
# {'Python': ['Python 入门', 'Python 进阶'], 'JS': ['JS 基础'], 'Vue': ['Vue 实战']}
```

`defaultdict(list)` 表示：访问不存在的键时，自动创建一个空列表作为值。

常用默认工厂：

| 工厂 | 默认值 | 用途 |
| --- | --- | --- |
| `defaultdict(list)` | `[]` | 分组数据 |
| `defaultdict(int)` | `0` | 计数统计 |
| `defaultdict(str)` | `""` | 字符串拼接 |

计数统计示例：

```python
from collections import defaultdict

words = ["Python", "JS", "Python", "Vue", "JS", "Python"]
counts = defaultdict(int)

for word in words:
    counts[word] += 1    # 不需要判断键是否存在

print(dict(counts))    # {'Python': 3, 'JS': 2, 'Vue': 1}
```

JS 对照：JS 没有原生 `defaultdict`，通常需要手动判断：

```js
const counts = {}
words.forEach(word => {
  counts[word] = (counts[word] || 0) + 1
})
```

或者用 `Map` + 空值处理：

```js
const grouped = new Map()
articles.forEach(a => {
  if (!grouped.has(a.category)) grouped.set(a.category, [])
  grouped.get(a.category).push(a.title)
})
```

Python 的 `defaultdict` 比手动判断简洁得多。

## 十、字典推导式

和列表推导式类似，创建字典。

```python
# 把列表转成字典：键是名字，值是名字长度
names = ["Python", "JS", "Vue"]
name_lengths = {name: len(name) for name in names}

print(name_lengths)   # {'Python': 6, 'JS': 2, 'Vue': 3}
```

```python
# 从已有字典筛选
scores = {"小明": 85, "小红": 42, "小刚": 91, "小李": 58}
passed = {name: score for name, score in scores.items() if score >= 60}

print(passed)   # {'小明': 85, '小刚': 91}
```

JS 对照：

```js
const names = ['Python', 'JS', 'Vue']
const nameLengths = Object.fromEntries(
  names.map(name => [name, name.length])
)

const scores = { 小明: 85, 小红: 42, 小刚: 91, 小李: 58 }
const passed = Object.fromEntries(
  Object.entries(scores).filter(([_, score]) => score >= 60)
)
```

## 十一、列表和字典的组合

实际开发中，最常见的数据结构是"列表里放字典"。

### 多个用户

```python
users = [
    {"name": "小明", "age": 18},
    {"name": "小红", "age": 20},
    {"name": "小刚", "age": 17}
]

for user in users:
    print(f"{user['name']}：{user['age']}岁")
```

JS 对照：

```js
const users = [
  { name: '小明', age: 18 },
  { name: '小红', age: 20 },
  { name: '小刚', age: 17 }
]

users.forEach(user => {
  console.log(`${user.name}：${user.age}岁`)
})
```

### 查找特定用户

```python
users = [
    {"name": "小明", "age": 18},
    {"name": "小红", "age": 20},
    {"name": "小刚", "age": 17}
]

# 查找小红
for user in users:
    if user["name"] == "小红":
        print(f"找到了：{user['name']}，年龄 {user['age']}")
        break
```

### 字典里放列表

```python
article = {
    "title": "Python 入门",
    "tags": ["Python", "编程", "入门"],
    "comments": [
        {"user": "小明", "text": "写得好"},
        {"user": "小红", "text": "有帮助"}
    ]
}

print(f"文章标题：{article['title']}")
print(f"标签数量：{len(article['tags'])}")

for tag in article["tags"]:
    print(f"  - {tag}")
```

这种结构和 MongoDB 存储的文档几乎一样，后端开发中非常常见。

## 十二、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 键必须加引号 | `{"name": "值"}` | `{name: "值"}` | Python 字典键是字符串 |
| 点号访问 | 不支持 `dict.key` | 支持 `obj.key` | Python 只能用 `[]` 或 `get()` |
| 键不存在 | 报错 `KeyError` | 返回 `undefined` | Python 更严格 |
| 安全访问 | `dict.get("key")` | `obj.key` 本身安全 | Python 需要主动用 get |
| 遍历键值对 | `dict.items()` | `Object.entries(obj)` | Python 方法，JS 静态方法 |
| 长度 | `len(dict)` | `Object.keys(obj).length` | Python 用函数 |
| 删除 | `del dict["key"]` | `delete obj.key` | Python 用关键字 |
| 合并 | `dict.update()` 或 `\|` | `Object.assign()` 或 `...` | 语法完全不同 |

### Python 字典不支持点号访问

```python
user = {"name": "小明"}
print(user.name)   # AttributeError!
```

正确：

```python
print(user["name"])        # 小明
print(user.get("name"))    # 小明
```

这是从 JS 转 Python 最不习惯的地方之一——JS 用 `user.name`，Python 必须用 `user["name"]`。

## 十三、企业项目实战：文章数据结构

```python
# 模拟数据库中的一篇文章
article = {
    "title": "Python 零基础入门：字符串",
    "slug": "python-zero-string",
    "status": "draft",
    "category": {"name": "Python", "slug": "python"},
    "tags": ["Python", "字符串", "入门"],
    "author": {"name": "admin", "role": "admin"},
    "view_count": 128,
    "created_at": "2026-06-21",
    "updated_at": "2026-06-22"
}

# 读取基本信息
print(f"标题：{article.get('title', '无标题')}")
print(f"状态：{article.get('status', 'unknown')}")
print(f"分类：{article['category']['name']}")

# 遍历标签
print("标签：")
for tag in article["tags"]:
    print(f"  - {tag}")

# 判断是否已发布
if article["status"] == "published":
    print("文章已发布")
else:
    print("文章未发布")
```

JS 对照（更贴近这个项目的前端代码）：

```js
const article = {
  title: 'Python 零基础入门：字符串',
  slug: 'python-zero-string',
  status: 'draft',
  category: { name: 'Python', slug: 'python' },
  tags: ['Python', '字符串', '入门'],
  author: { name: 'admin', role: 'admin' },
  viewCount: 128,
  createdAt: '2026-06-21',
  updatedAt: '2026-06-22'
}

console.log(`标题：${article.title ?? '无标题'}`)
console.log(`状态：${article.status ?? 'unknown'}`)
console.log(`分类：${article.category.name}`)

console.log('标签：')
article.tags.forEach(tag => {
  console.log(`  - ${tag}`)
})
```

注意命名风格差异：

- Python 字典键通常用蛇形：`view_count`、`created_at`
- JS 对象键通常用驼峰：`viewCount`、`createdAt`

## 十四、本篇练习

练习一：保存书本信息。

Python：

```python
book = {
    "title": "Python 入门",
    "author": "张三",
    "price": 59
}

print(f"书名：{book['title']}")
print(f"作者：{book['author']}")
print(f"价格：{book['price']} 元")

# 添加新字段
book["publisher"] = "技术出版社"
print(f"出版社：{book.get('publisher', '未知')}")
```

练习二：统计文章标签出现次数。

```python
articles = [
    {"title": "Python 入门", "tags": ["Python", "入门"]},
    {"title": "JS 基础", "tags": ["JS", "入门"]},
    {"title": "Vue 实战", "tags": ["Vue", "前端"]},
    {"title": "Python 进阶", "tags": ["Python", "进阶"]}
]

# 统计每个标签出现几次
tag_counts = {}

for article in articles:
    for tag in article["tags"]:
        if tag in tag_counts:
            tag_counts[tag] += 1
        else:
            tag_counts[tag] = 1

print("标签统计：")
for tag, count in tag_counts.items():
    print(f"  {tag}: {count} 次")
```

练习三：找错误。

```python
# 错误 1：键没加引号
user = {name: "小明"}    # NameError!

# 错误 2：用点号访问
user = {"name": "小明"}
print(user.name)          # AttributeError!

# 错误 3：键不存在没有用 get
user = {"name": "小明"}
print(user["email"])      # KeyError!
```

## 本篇小结

1. Python 字典 ≈ JS 对象，用 `{}` 定义，键值对结构。
2. Python 字典键**必须加引号**，JS 对象键可以省略。
3. Python **不支持点号访问** `dict.key`，只能用 `dict["key"]` 或 `dict.get("key")`。
4. 键不存在时 `dict["key"]` 报错 `KeyError`，`dict.get("key")` 返回 `None`。
5. `dict.get("key", default)` 设置默认值，类似 JS 的 `obj.key ?? default`。
6. 遍历用 `dict.items()`，JS 用 `Object.entries(obj)`。
7. 删除用 `del dict["key"]`，JS 用 `delete obj.key`。
8. 合并用 `dict.update()` 或 `|`，JS 用 `...` 或 `Object.assign()`。
9. 列表+字典组合是最常见的数据结构，对应 JS 的数组+对象。
10. Python 键用蛇形命名 `view_count`，JS 用驼峰 `viewCount`。
