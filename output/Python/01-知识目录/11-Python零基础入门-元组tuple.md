---
title: Python 零基础入门 11：元组 tuple
slug: python-zero-tuples
summary: 讲解元组是什么、元组和列表的区别、元组的创建和操作、元组不可变意味着什么、元组解包、命名元组，全程对照 JavaScript 中的 const 数组与 Object.freeze。
category: Python入门
tags:
  - Python
  - 零基础入门
status: draft
cover:
---

# Python 零基础入门 11：元组 tuple

前面学了列表，列表可以增删改。

但有些数据一旦确定就不应该被修改。比如一年的月份、星期几的名称、一个坐标点、数据库查询返回的一行记录。

Python 提供了**元组（tuple）**，它和列表很像，但**不可变**——创建后就不能增删改。

前端 JS 里你可能会用 `const` 声明数组来"防止修改"：

```js
const months = ['一月', '二月', '三月']
months[0] = '1月'   // const 阻止不了修改内容！
```

`const` 只是阻止重新赋值，不阻止修改数组内容。Python 元组是真正不可变的。

## 一、元组是什么

元组是用小括号 `()` 定义的一组数据，元素之间用逗号隔开。

```python
point = (3, 4)
months = ("一月", "二月", "三月")
empty = ()
```

元组和列表的核心区别：

| 对比 | 元组 tuple | 列表 list |
| --- | --- | --- |
| 符号 | `()` | `[]` |
| 可变性 | **不可变** | 可变 |
| 用途 | 固定数据、保护数据 | 需要增删改的数据 |
| 性能 | 略快 | 略慢 |
| 可做字典键 | **可以** | 不可以 |
| 可做集合元素 | **可以** | 不可以 |

一句话总结：**元组就是"加了锁的列表"。**

## 二、创建元组

### 基本创建

```python
# 多个元素
colors = ("红", "绿", "蓝")
coords = (3.14, 2.71)

# 空元组
empty = ()

# 一个元素的元组——注意逗号！
single = (42,)      # 正确：一个元素的元组
not_tuple = (42)    # 错误：这只是数字 42，不是元组
```

**高频踩坑：单元素元组必须加逗号！**

```python
print(type((42,)))   # <class 'tuple'>
print(type((42)))    # <class 'int'>
```

括号里只有一个值且没有逗号时，Python 认为这只是一个普通值外面的括号（像数学里 `(1 + 2)` 的括号），不是元组。

### 省略括号

Python 允许省略小括号创建元组：

```python
point = 3, 4           # 等价于 (3, 4)
name, age = "小明", 18  # 等价于 ("小明", 18)
```

逗号才是元组的关键，括号只是为了分组和提高可读性。

JS 对照：

```js
const colors = ['红', '绿', '蓝']  // JS 用数组，没有专门的元组类型
const point = [3, 4]               // 用数组代替
```

JS 没有原生的不可变数组类型。`const` 数组的内容仍然可以修改。如果真需要不可变，只能用 `Object.freeze()`：

```js
const months = Object.freeze(['一月', '二月', '三月'])
months[0] = '1月'   // 严格模式下报错，非严格模式下静默失败
```

但 `Object.freeze()` 是浅冻结，嵌套的数组/对象仍然可以改。Python 元组的不可变是深层的——元组里的所有不可变元素都不能改。

### 从其他类型转换

```python
# 列表转元组
nums = [1, 2, 3]
t = tuple(nums)
print(t)           # (1, 2, 3)

# 字符串转元组
chars = tuple("ABC")
print(chars)       # ('A', 'B', 'C')

# 元组转列表
back = list(t)
print(back)        # [1, 2, 3]
```

## 三、读取元组

元组的读取方式和列表完全一样。

### 索引

```python
colors = ("红", "绿", "蓝")

print(colors[0])    # 红
print(colors[-1])   # 蓝
```

### 切片

```python
nums = (10, 20, 30, 40, 50)

print(nums[1:3])    # (20, 30)
print(nums[:2])     # (10, 20)
print(nums[-2:])    # (40, 50)
print(nums[::-1])   # (50, 40, 30, 20, 10)
```

切片的结果仍然是元组。

### 长度和包含

```python
colors = ("红", "绿", "蓝")

print(len(colors))       # 3
print("绿" in colors)    # True
print("黄" in colors)    # False
```

这些操作和列表完全一样。

JS 对照：

```js
const colors = ['红', '绿', '蓝']

console.log(colors[0])           // 红
console.log(colors.slice(1, 3))  // ['绿', '蓝']
console.log(colors.length)       // 3
console.log(colors.includes('绿'))  // true
```

## 四、元组不可变意味着什么

### 不能修改元素

```python
colors = ("红", "绿", "蓝")
colors[0] = "黄"    # TypeError: 'tuple' object does not support item assignment
```

### 不能添加元素

```python
colors = ("红", "绿", "蓝")
colors.append("黄")   # AttributeError! 元组没有 append 方法
```

### 不能删除元素

```python
colors = ("红", "绿", "蓝")
del colors[0]          # TypeError! 元组不支持删除元素
```

### 但元组里的可变元素可以改

这是一个容易混淆的点：

```python
data = ([1, 2], [3, 4])   # 元组里包含两个列表
data[0].append(3)          # 可以！修改的是列表，不是元组本身

print(data)   # ([1, 2, 3], [3, 4])
```

元组不可变的意思是：**元组里每个位置指向的对象不能换。** 但如果那个对象本身是可变的（比如列表），它的内容可以改。

理解方式：

```text
元组：  (  指针1,   指针2  )   ← 指针不能换
           ↓        ↓
        [1, 2]   [3, 4]       ← 列表内容可以改
```

JS 对照：

```js
const data = [[1, 2], [3, 4]]   // const 数组
data[0].push(3)                  // 可以！修改的是内部数组
data[0] = [99]                   // 严格模式下报错（重新赋值）
```

## 五、元组方法

元组只有两个方法（因为不可变，不需要增删改的方法）：

```python
nums = (1, 2, 3, 2, 2, 4)

# 统计某个值出现几次
print(nums.count(2))    # 3

# 查找某个值第一次出现的位置
print(nums.index(3))    # 2
```

对比列表的方法：

| 操作 | 列表 | 元组 |
| --- | --- | --- |
| 读取 | `list[0]` | `tuple[0]` |
| 切片 | `list[0:2]` | `tuple[0:2]` |
| 长度 | `len(list)` | `len(tuple)` |
| 包含 | `x in list` | `x in tuple` |
| 统计 | `list.count(x)` | `tuple.count(x)` |
| 索引 | `list.index(x)` | `tuple.index(x)` |
| 追加 | `list.append(x)` | ❌ |
| 插入 | `list.insert(i, x)` | ❌ |
| 删除 | `list.remove(x)` | ❌ |
| 排序 | `list.sort()` | ❌（用 `sorted()` 返回列表） |
| 反转 | `list.reverse()` | ❌（用 `reversed()` 或切片） |

排序元组：

```python
nums = (3, 1, 4, 1, 5)
sorted_nums = sorted(nums)      # 返回列表 [1, 1, 3, 4, 5]
sorted_tuple = tuple(sorted(nums))  # 转回元组 (1, 1, 3, 4, 5)
```

## 六、元组解包

元组解包是 Python 非常常用的特性——把元组里的值一次性赋给多个变量。

### 基本解包

```python
point = (3, 4)
x, y = point

print(x)    # 3
print(y)    # 4
```

### 多变量赋值

```python
name, age, city = "小明", 18, "北京"

print(name)   # 小明
print(age)    # 18
print(city)   # 北京
```

这里 `"小明", 18, "北京"` 其实就是省略括号的元组。

### 交换变量

Python 用元组解包交换变量，不需要临时变量：

```python
a, b = 1, 2
a, b = b, a    # 交换！

print(a)   # 2
print(b)   # 1
```

JS 对照（解构赋值）：

```js
let a = 1, b = 2;
[a, b] = [b, a]   // JS 用数组解构交换

console.log(a)   // 2
console.log(b)   // 1
```

### * 收集剩余元素

```python
scores = (90, 85, 78, 92, 88)

first, *rest = scores
print(first)    # 90
print(rest)     # [85, 78, 92, 88]（注意：rest 是列表）

first, second, *middle, last = scores
print(first)    # 90
print(second)   # 85
print(middle)   # [78, 92]
print(last)     # 88
```

`*rest` 收集剩余的元素，结果总是列表。

JS 对照：

```js
const scores = [90, 85, 78, 92, 88]

const [first, ...rest] = scores
console.log(first)   // 90
console.log(rest)    // [85, 78, 92, 88]
```

### _ 忽略不需要的值

```python
point = (3, 4, 5)
x, _, z = point    # 中间的值不关心

print(x)    # 3
print(z)    # 5
```

`_` 是一个合法变量名，但 Python 社区约定用它表示"不关心的值"。

### 函数返回多值的本质

前面讲函数时说过 Python 函数可以返回多个值，本质上就是返回元组：

```python
def get_user():
    return "小明", 18    # 实际返回 ("小明", 18)

result = get_user()
print(type(result))      # <class 'tuple'>

# 解包接收
name, age = get_user()
print(name)    # 小明
print(age)     # 18
```

## 七、元组作为字典的键

列表不能做字典的键，但元组可以——因为字典的键必须是不可变类型。

```python
# 用坐标作为字典的键
distances = {
    (0, 0): "原点",
    (1, 0): "右一步",
    (0, 1): "上一步",
}

print(distances[(0, 0)])    # 原点
```

列表不行：

```python
wrong = {
    [0, 0]: "原点"    # TypeError! 列表不可哈希
}
```

JS 对照：JS 对象的键只能是字符串或 Symbol，不能用数组做键。如果需要复合键，通常把数组转成字符串：

```js
const distances = {
  '0,0': '原点',
  '1,0': '右一步',
}
```

或者用 `Map`：

```js
const distances = new Map()
distances.set([0, 0], '原点')  // 但每次 [0,0] 都是新的引用，查找会出问题
```

Python 的元组做字典键更直观、更安全。

## 八、命名元组 namedtuple

普通元组通过索引访问，可读性差：

```python
point = (3, 4)
print(point[0])    # 3 —— 这是什么？x 坐标？还是 y？
```

命名元组可以给每个位置起名字：

```python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)

print(p.x)       # 3（通过名字访问）
print(p.y)       # 4
print(p[0])      # 3（仍然可以通过索引访问）
print(p)         # Point(x=3, y=4)
```

企业项目示例——数据库查询结果：

```python
from collections import namedtuple

ArticleRow = namedtuple("ArticleRow", ["id", "title", "status"])

row = ArticleRow(id=1, title="Python 入门", status="draft")
print(row.title)    # Python 入门
print(row.status)   # draft
```

JS 对照：JS 没有命名元组，通常直接用对象：

```js
const point = { x: 3, y: 4 }
console.log(point.x)  // 3

const row = { id: 1, title: 'Python 入门', status: 'draft' }
console.log(row.title)
```

Python 的命名元组介于普通元组和类之间：比元组可读性好，比类轻量。

## 九、什么时候用元组，什么时候用列表

| 场景 | 推荐 | 原因 |
| --- | --- | --- |
| 一周的星期名称 | 元组 | 固定不变 |
| 一年的月份 | 元组 | 固定不变 |
| 坐标点 (x, y) | 元组 | 固定不变，且可做字典键 |
| RGB 颜色值 | 元组 | 固定不变 |
| 数据库一行记录 | 元组或命名元组 | 查询结果不应被修改 |
| 函数返回多个值 | 元组 | Python 的约定 |
| 文章标签列表 | 列表 | 需要增删改 |
| 用户列表 | 列表 | 需要增删改 |
| 购物车商品 | 列表 | 需要增删改 |

一句话：**数据需要改就用列表，数据不需要改就用元组。**

## 十、元组和列表的完整对照

| 对比 | Python 元组 | Python 列表 | JS 数组 |
| --- | --- | --- | --- |
| 定义 | `(1, 2, 3)` | `[1, 2, 3]` | `[1, 2, 3]` |
| 可变性 | 不可变 | 可变 | 可变 |
| 做字典键 | ✅ | ❌ | 不适用 |
| 方法数量 | 2 个 | 多个 | 多个 |
| 性能 | 略快 | 略慢 | - |
| 单元素写法 | `(1,)` | `[1]` | `[1]` |
| 解包 | 原生支持 | 原生支持 | 解构赋值 |
| 排序 | `sorted()` 返回列表 | `.sort()` 原地排序 | `.sort()` |
| 保护数据 | 天然保护 | 无保护 | `Object.freeze()` 浅保护 |

## 十一、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 不可变序列 | 元组 `tuple` | 无原生类型 | JS 用 `Object.freeze()` 模拟 |
| 单元素元组 | `(42,)` 要加逗号 | 不存在 | 逗号是元组的标志 |
| 省略括号 | `x, y = 1, 2` 合法 | 不行 | Python 逗号创建元组 |
| 解包 | `a, b = (1, 2)` | `[a, b] = [1, 2]` | Python 用元组，JS 用数组 |
| 交换变量 | `a, b = b, a` | `[a, b] = [b, a]` | 语法不同 |
| 收集剩余 | `*rest` | `...rest` | Python 用星号 |
| 做字典键 | 元组可以 | 不适用 | Python 特色 |

## 十二、企业项目实战：函数返回多值与数据库行

```python
from collections import namedtuple

# 模拟数据库查询返回的文章行
ArticleRow = namedtuple("ArticleRow", ["id", "title", "status", "view_count"])

def query_article(article_id):
    """模拟查询单篇文章"""
    # 实际项目中从数据库获取
    if article_id == 1:
        return ArticleRow(id=1, title="Python 入门", status="draft", view_count=128)
    return None

# 使用
result = query_article(1)

if result is not None:
    print(f"文章ID：{result.id}")
    print(f"标题：{result.title}")
    print(f"状态：{result.status}")
    print(f"浏览量：{result.view_count}")

# 也可以解包
article_id, title, status, views = result
print(f"{title} - {status} - {views}次浏览")
```

JS 对照：

```js
function queryArticle(articleId) {
  if (articleId === 1) {
    return { id: 1, title: 'Python 入门', status: 'draft', viewCount: 128 }
  }
  return null
}

const result = queryArticle(1)

if (result) {
  console.log(`文章ID：${result.id}`)
  console.log(`标题：${result.title}`)
  console.log(`状态：${result.status}`)
  console.log(`浏览量：${result.viewCount}`)

  const { id, title, status, viewCount: views } = result
  console.log(`${title} - ${status} - ${views}次浏览`)
}
```

## 十三、本篇练习

练习一：创建和读取。

```python
# 创建一个坐标元组
point = (3, 4)

# 解包
x, y = point
print(f"坐标：({x}, {y})")
print(f"距离原点：{(x**2 + y**2)**0.5:.2f}")
```

练习二：函数返回多值。

```python
def calculate_stats(scores):
    """计算统计信息，返回多个值"""
    count = len(scores)
    total = sum(scores)
    average = total / count if count > 0 else 0
    return count, total, average

scores = [85, 90, 78, 92, 88]
count, total, average = calculate_stats(scores)

print(f"人数：{count}")
print(f"总分：{total}")
print(f"平均分：{average:.1f}")
```

练习三：找错误。

```python
# 错误 1：单元素元组没加逗号
t = (42)
print(type(t))    # <class 'int'>，不是元组！

# 正确
t = (42,)
print(type(t))    # <class 'tuple'>

# 错误 2：尝试修改元组
colors = ("红", "绿", "蓝")
colors[0] = "黄"   # TypeError!

# 错误 3：用列表做字典键
data = {[0, 0]: "原点"}   # TypeError!
# 正确：用元组
data = {(0, 0): "原点"}
```

## 本篇小结

1. 元组是不可变序列，用 `()` 定义，和列表语法接近但**不能增删改**。
2. 单元素元组必须加逗号：`(42,)` 不是 `(42)`。
3. 元组可以用索引、切片读取，和列表一样。
4. 元组只有 `count()` 和 `index()` 两个方法。
5. **元组解包**是 Python 特色：`x, y = point`，`a, b = b, a`。
6. `*rest` 收集剩余元素，`_` 忽略不需要的值。
7. 元组可以做字典的键，列表不行。
8. `namedtuple` 给元组元素起名字，比普通元组可读性好。
9. 选择原则：**数据需要改用列表，不需要改用元组**。
10. JS 没有原生元组类型，`const` 数组内容仍可修改，`Object.freeze()` 是浅冻结。
