---
title: Python 零基础入门 05：字符串
slug: python-zero-string
summary: 详细讲解 Python 字符串 str 的定义、引号、转义、多行字符串、长度、索引、切片、不可变、拼接、格式化、清洗、查找、替换、分割、合并，并全程对照 JavaScript 字符串。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 05：字符串

字符串是 Python 里使用频率最高的数据类型之一。

你写后台接口、处理文章标题、用户名、分类名、标签、搜索关键词、文件路径、错误信息、日志内容，都会大量遇到字符串。

前端 JS 里你也天天用字符串：

```js
const title = '文章标题'
const url = `/api/articles/${id}`
```

Python 里也一样，只是写法、方法名、格式化方式和一些细节不完全相同。

这一篇会把 Python 字符串和 JS 字符串放在一起讲。

## 一、字符串是什么

一句话：

> 字符串就是一段文本数据。

Python：

```python
name = "小明"
title = "Python 入门"
status = "draft"
```

JS：

```js
const name = '小明'
const title = 'Python 入门'
const status = 'draft'
```

企业项目里，字符串常见于：

1. 用户名。
2. 文章标题。
3. 文章摘要。
4. 分类名称。
5. 标签名称。
6. 接口地址。
7. 文件路径。
8. 错误提示。
9. 日志内容。
10. 搜索关键词。
11. 状态值，比如 `"draft"`、`"published"`。
12. 时间字符串，比如 `"2026-06-21"`。

## 二、字符串的底层直觉

字符串可以理解成由一个个字符按顺序组成的文本。

```python
text = "Python"
```

可以看成：

```text
P y t h o n
```

每个字符都有位置，下标从 `0` 开始。

```text
P   y   t   h   o   n
0   1   2   3   4   5
```

Python：

```python
text = "Python"
print(text[0])
```

输出：

```text
P
```

JS：

```js
const text = 'Python'
console.log(text[0])
```

输出也是：

```text
P
```

相同点：

1. 字符串都有顺序。
2. 都可以通过下标取字符。
3. 下标都从 0 开始。

核心区别：

1. Python 支持负数下标，比如 `text[-1]`。
2. JS 普通 `text[-1]` 不是取最后一个字符，现代 JS 可用 `text.at(-1)`。

### Python 负数下标详解

Python 可以用负数从后往前数：

```text
P    y    t    h    o    n
0    1    2    3    4    5
-6   -5   -4   -3   -2   -1
```

```python
text = "Python"
print(text[-1])   # n（最后一个字符）
print(text[-2])   # o（倒数第二个）
print(text[-6])   # P（和 text[0] 一样）
```

这在实际开发中特别方便，比如取文件扩展名：

```python
filename = "article.md"
print(filename[-3:])  # .md
```

JS 没有这么方便的负数下标。`text[-1]` 在 JS 里返回 `undefined`，不是最后一个字符。现代 JS 可以用 `text.at(-1)`。

## 三、定义字符串

Python 可以用单引号：

```python
name = '小明'
```

也可以用双引号：

```python
name = "小明"
```

如果字符串里包含单引号，外面可以用双引号：

```python
text = "I'm learning Python"
```

如果字符串里包含双引号，外面可以用单引号：

```python
text = '他说："你好"'
```

JS 对照：

```js
const name = '小明'
const text1 = "I'm learning JavaScript"
const text2 = '他说："你好"'
```

JS 还可以用模板字符串：

```js
const name = `小明`
```

相同点：

1. Python 和 JS 都可以用单引号。
2. Python 和 JS 都可以用双引号。
3. 如果内容里有单引号，外面可以用双引号。
4. 如果内容里有双引号，外面可以用单引号。

核心区别：

1. JS 有反引号模板字符串。
2. Python 没有 JS 同款反引号字符串。
3. Python 常用 f-string 做变量插入。
4. JS 常用模板字符串做变量插入。

高频踩坑：

```python
name = "小明'  # 左右引号不匹配，报错
```

## 四、空字符串不是 None / null

Python 空字符串：

```python
text = ""
```

它表示"有一个字符串，只是内容为空"。

Python 空值：

```python
value = None
```

表示"没有值"。

对照：

| 写法 | 含义 |
| --- | --- |
| `""` | 空字符串（有值，但内容为空） |
| `None` | 没有值 |

JS：

| 写法 | 含义 |
| --- | --- |
| `''` | 空字符串 |
| `null` | 主动设置为空 |
| `undefined` | 未定义或未赋值 |

高频踩坑：

Python：

```python
nickname = ""

if nickname is None:       # False！空字符串不是 None
    print("没有昵称")

if nickname == "":         # True！这才是判断空字符串
    print("昵称为空")
```

JS：

```js
const nickname = ''

if (nickname === null) {   // false！空字符串不是 null
  console.log('没有昵称')
}

if (nickname === '') {     // true！这才是判断空字符串
  console.log('昵称为空')
}
```

## 五、多行字符串

Python 可以用三引号写多行字符串。

```python
text = """第一行
第二行
第三行"""

print(text)
```

也可以用三个单引号：

```python
text = '''第一行
第二行'''
```

适合保存：

1. 多行文本。
2. 长说明。
3. 模板内容。
4. SQL 语句。
5. 文档字符串 docstring。

SQL 示例：

```python
sql = """
SELECT id, title, status
FROM articles
WHERE status = 'published'
"""
```

JS 对照：

```js
const sql = `
SELECT id, title, status
FROM articles
WHERE status = 'published'
`
```

核心区别：

1. Python 用三引号 `"""` 或 `'''`。
2. JS 用反引号模板字符串。
3. Python 三引号也常用于 docstring。
4. JS 模板字符串还常用于 `${}` 插值。

高频踩坑：

Python 三引号本质是字符串，不是普通注释。普通多行注释更推荐多个 `#`。

## 六、转义字符

如果字符串里面需要特殊字符，可以用反斜杠转义。

Python：

```python
text = "他说：\"你好\""
print(text)
```

输出：

```text
他说："你好"
```

常见转义：

| 写法 | 含义 |
| --- | --- |
| `\n` | 换行 |
| `\t` | 制表符（Tab） |
| `\"` | 双引号 |
| `\'` | 单引号 |
| `\\` | 反斜杠本身 |

换行：

```python
text = "第一行\n第二行"
print(text)
```

输出：

```text
第一行
第二行
```

Windows 路径：

```python
path = "C:\\code\\python"
```

也可以用原始字符串（raw string），前面加 `r`：

```python
path = r"C:\code\python"
```

`r""` 的意思就是"这个字符串里的反斜杠不要转义，原样保留"。在写正则表达式和 Windows 路径时特别有用。

JS 对照：

```js
const text = "他说：\"你好\""
const path = 'C:\\code\\js'
```

JS 没有原始字符串的写法。

相同点：

1. 都用 `\` 转义。
2. `\n` 都表示换行。
3. `\t` 都表示制表符。
4. `\\` 都表示反斜杠本身。

高频踩坑：

Python：

```python
path = "C:\new\test"
```

这里 `\n` 会被当成换行，`\t` 会被当成 Tab。

更稳：

```python
path = r"C:\new\test"
# 或
path = "C:\\new\\test"
```

## 七、字符串长度

Python 用 `len()`。

```python
text = "Python"
print(len(text))
```

输出：

```text
6
```

中文：

```python
text = "你好"
print(len(text))
```

输出：

```text
2
```

企业场景：

1. 校验用户名长度。
2. 校验密码长度。
3. 限制文章标题长度。
4. 判断摘要是否为空。
5. 截断过长内容。

JS 对照：

```js
const text = 'Python'
console.log(text.length)  // 6
```

核心区别：

1. Python 用 `len(text)`——这是内置函数。
2. JS 用 `text.length`——这是属性。
3. Python 没有 `text.length`。
4. JS 没有内置 `len(text)`。

高频踩坑：

```python
text = "Python"
print(text.length)  # AttributeError! Python 没有 .length
```

正确：

```python
print(len(text))
```

## 八、索引：取某个字符

Python：

```python
text = "Python"
print(text[0])   # P
print(text[1])   # y
print(text[-1])  # n
```

JS：

```js
const text = 'Python'
console.log(text[0])      // P
console.log(text[1])      // y
console.log(text.at(-1))  // n（现代 JS）
```

相同点：

1. 都能用 `[0]` 取第一个字符。
2. 下标都从 0 开始。
3. 都能按位置读取字符。

核心区别：

1. Python 原生支持 `text[-1]`。
2. JS 的 `text[-1]` 不等价，现代 JS 用 `text.at(-1)`。
3. Python 越界索引会报错 `IndexError`。
4. JS 越界通常得到 `undefined`。

### 越界对比

Python：

```python
text = "Python"
print(text[10])  # IndexError: string index out of range
```

JS：

```js
const text = 'Python'
console.log(text[10])  // undefined（不会报错）
```

Python 更严格：越界直接报错，让你立刻知道出了问题。JS 静默返回 `undefined`，可能导致后续逻辑出问题但不报错。

## 九、切片：取一段内容

切片是 Python 的特色功能，非常好用。

### 基本格式

```python
字符串[开始位置:结束位置]
```

**包含开始，不包含结束。**

```python
text = "Python"

print(text[0:2])   # Py（取下标 0 和 1，不包含 2）
print(text[:3])    # Pyt（省略开始，默认从 0 开始）
print(text[3:])    # hon（省略结束，默认到末尾）
print(text[-3:])   # hon（从倒数第 3 个到末尾）
```

### 切片图解

```text
P    y    t    h    o    n
0    1    2    3    4    5
                         6（结束位置可以到长度）
```

```python
text[0:2]   → P, y     → "Py"
text[:3]    → P, y, t  → "Pyt"
text[3:]    → h, o, n  → "hon"
text[2:5]   → t, h, o  → "tho"
text[-3:]   → h, o, n  → "hon"
text[-5:-2] → y, t, h  → "yth"
```

### 带步长的切片

```python
字符串[开始:结束:步长]
```

```python
text = "Python"

print(text[::2])    # Pto（每隔 1 个取 1 个）
print(text[1::2])   # yhn（从下标 1 开始，每隔 1 个取 1 个）
print(text[::-1])   # nohtyP（反转字符串）
```

步长为负数时，方向反转。`[::-1]` 是反转字符串的经典写法。

JS 对照：

```js
const text = 'Python'

console.log(text.slice(0, 2))   // Py
console.log(text.slice(0, 3))   // Pyt
console.log(text.slice(3))      // hon
console.log(text.slice(-3))     // hon
```

相同点：

1. 都能截取字符串的一部分。
2. 都是包含开始，不包含结束。
3. 都不会修改原字符串。
4. 都返回新字符串。

核心区别：

1. Python 用 `text[0:3]`——方括号切片语法。
2. JS 用 `text.slice(0, 3)`——方法调用。
3. Python 支持步长 `text[::2]`、反转 `text[::-1]`。
4. JS 没有内置步长和反转切片，反转需要 `text.split('').reverse().join('')`。

高频踩坑：

`text[0:2]` 只取下标 0 和 1，不包含下标 2。这个"包含开始、不包含结束"的规则在 Python 和 JS 的 `slice()` 里都一样。

## 十、字符串不可变

Python 字符串是不可变的。你不能修改字符串中的某个字符。

```python
text = "Python"
text[0] = "J"  # TypeError: 'str' object does not support item assignment
```

如果想得到 `"Jython"`：

```python
text = "Python"
new_text = "J" + text[1:]

print(new_text)
```

输出：

```text
Jython
```

JS 字符串也不可变：

```js
const text = 'Python'
const newText = 'J' + text.slice(1)

console.log(newText)  // Jython
```

相同点：

1. 字符串本身都不可变。
2. 修改效果通常通过创建新字符串实现。
3. 字符串方法通常返回新字符串，不会修改原字符串。

高频踩坑：

Python：

```python
title = "python"
title.upper()
print(title)    # 仍然是 python！
```

`upper()` 返回新字符串，不会修改原字符串。正确写法：

```python
title = title.upper()
print(title)    # PYTHON
```

JS 同理：

```js
let title = 'python'
title.toUpperCase()
console.log(title)  // 仍然是 python
```

正确：

```js
title = title.toUpperCase()
```

## 十一、字符串拼接和格式化

Python 可以用 `+` 拼接：

```python
name = "小明"
print("你好，" + name)
```

但字符串不能直接和数字拼：

```python
age = 18
print("年龄：" + age)  # TypeError!
```

要写：

```python
print("年龄：" + str(age))
```

更推荐 f-string：

```python
name = "小明"
age = 18

print(f"姓名：{name}，年龄：{age}")
```

JS 对照：

```js
const name = '小明'
const age = 18

console.log(`姓名：${name}，年龄：${age}`)
```

核心区别：

1. Python 用 `f"你好，{name}"`。
2. JS 用 `` `你好，${name}` ``。
3. Python `{}` 里不需要 `$`。
4. JS 必须写 `${}`。
5. Python 字符串拼数字要显式 `str()`。
6. JS 会自动转换，但容易隐藏 bug。

### format() 方法

f-string 是 Python 3.6+ 才引入的。在此之前，Python 用 `format()` 方法做格式化。很多企业项目老代码和日志模板仍然用 `format()`。

```python
# 位置参数
text = "我叫{}，今年{}岁".format("小明", 18)
print(text)    # 我叫小明，今年18岁

# 编号参数（可以重复使用）
text = "{0}说：你好，{1}。{0}又说了：再见，{1}。".format("小明", "小红")
print(text)    # 小明说：你好，小红。小明又说了：再见，小红。

# 关键字参数
text = "我叫{name}，今年{age}岁".format(name="小明", age=18)
print(text)    # 我叫小明，今年18岁
```

JS 对照：JS 没有类似的 `format()` 方法，通常用模板字符串。

f-string vs format 选择：

| 场景 | 推荐 | 原因 |
| --- | --- | --- |
| 日常代码 | f-string | 更简洁 |
| 日志模板 | `format()` | 模板可以单独定义 |
| 国际化 i18n | `format()` | 翻译文件里放占位符 |
| 老项目兼容 | `format()` | Python 3.6 以下不支持 f-string |

### f-string 高级用法

f-string 不仅仅是简单插值，还支持格式化：

```python
price = 19.9

# 保留小数位数
print(f"价格：{price:.2f}")          # 价格：19.90

# 千分位分隔
big_num = 1234567
print(f"人数：{big_num:,}")          # 人数：1,234,567

# 百分比
ratio = 0.856
print(f"通过率：{ratio:.1%}")         # 通过率：85.6%

# 对齐（左/右/居中）
name = "小明"
print(f"[{name:<10}]")               # [小明      ]（左对齐，宽度10）
print(f"[{name:>10}]")               # [      小明]（右对齐）
print(f"[{name:^10}]")               # [   小明   ]（居中对齐）

# 日期格式化
from datetime import datetime
now = datetime.now()
print(f"今天是 {now:%Y-%m-%d %H:%M}")  # 今天是 2026-06-22 10:30

# 表达式
print(f"2的10次方 = {2**10}")         # 2的10次方 = 1024
print(f"{'小明'.upper()}")             # 小明→但中文无大写，英文有效
```

JS 对照：JS 模板字符串没有内置格式化能力，需要手动处理：

```js
const price = 19.9
console.log(`价格：${price.toFixed(2)}`)    // 价格：19.90

const bigNum = 1234567
console.log(`人数：${bigNum.toLocaleString()}`)  // 人数：1,234,567

const ratio = 0.856
console.log(`通过率：${(ratio * 100).toFixed(1)}%`)  // 通过率：85.6%

const name = '小明'
console.log(`[${name.padEnd(10)}]`)   // [小明      ]
```

Python f-string 的格式化语法比 JS 模板字符串强大得多，不需要额外函数调用。

### 字符串 count() 和 index() 方法

前面对照表里只列了 `find()`，这里补充几个常用方法：

```python
text = "Python 是最好的语言，Python 很简单"

# count()：统计子串出现次数
print(text.count("Python"))     # 2

# index()：查找位置，找不到报错 ValueError
print(text.index("Python"))     # 0（第一次出现的位置）

# rfind()：从右边查找
print(text.rfind("Python"))     # 13（最后一次出现的位置）

# rindex()：从右边查找，找不到报错
print(text.rindex("Python"))    # 13
```

find vs index 区别：

| 方法 | 找到时 | 找不到时 |
| --- | --- | --- |
| `find()` | 返回位置 | 返回 `-1` |
| `index()` | 返回位置 | 报错 `ValueError` |
| `rfind()` | 返回最后位置 | 返回 `-1` |
| `rindex()` | 返回最后位置 | 报错 `ValueError` |

企业项目推荐用 `find()`，因为不报错更安全。如果你确定子串一定存在，用 `index()` 更明确。

JS 对照：

```js
const text = 'Python 是最好的语言，Python 很简单'
console.log(text.indexOf('Python'))     // 0
console.log(text.lastIndexOf('Python')) // 13
```

## 十二、字符串方法对照总表

这是整篇最核心的对照表，建议收藏：

| 功能 | Python | JS |
| --- | --- | --- |
| 获取长度 | `len(text)` | `text.length` |
| 取某个字符 | `text[0]` | `text[0]` |
| 取最后一个 | `text[-1]` | `text.at(-1)` |
| 截取子串 | `text[0:3]` | `text.slice(0, 3)` |
| 反转字符串 | `text[::-1]` | `text.split('').reverse().join('')` |
| 去两端空格 | `text.strip()` | `text.trim()` |
| 去左边空格 | `text.lstrip()` | `text.trimStart()` |
| 去右边空格 | `text.rstrip()` | `text.trimEnd()` |
| 转大写 | `text.upper()` | `text.toUpperCase()` |
| 转小写 | `text.lower()` | `text.toLowerCase()` |
| 判断包含 | `"key" in text` | `text.includes('key')` |
| 查找位置 | `text.find("key")` | `text.indexOf('key')` |
| 替换 | `text.replace("a", "b")` | `text.replace('a', 'b')` |
| 替换全部 | `text.replace("a", "b")`（默认全替换） | `text.replaceAll('a', 'b')` |
| 分割 | `text.split(",")` | `text.split(',')` |
| 合并 | `",".join(list)` | `array.join(',')` |
| 判断开头 | `text.startswith("abc")` | `text.startsWith('abc')` |
| 判断结尾 | `text.endswith(".md")` | `text.endsWith('.md')` |
| 判断纯数字 | `text.isdigit()` | `/^\d+$/.test(text)` |
| 判断纯字母 | `text.isalpha()` | `/^[a-zA-Z]+$/.test(text)` |
| 重复字符串 | `"ha" * 3` → `"hahaha"` | `'ha'.repeat(3)` → `'hahaha'` |

### 方法名风格差异

观察上面的对照表，你会发现一个规律：

**Python 字符串方法名用小写+下划线**：`startswith()`、`endswith()`、`isalpha()`、`isdigit()`

**JS 字符串方法名用小驼峰**：`startsWith()`、`endsWith()`、`toUpperCase()`、`toLowerCase()`

这个差异和变量命名风格一致：Python 喜欢蛇形，JS 喜欢驼峰。

## 十三、去空格 strip / trim

Python：

```python
username = "  xiaoming  "
clean_username = username.strip()

print(clean_username)
```

输出：

```text
xiaoming
```

只去左边：

```python
text.lstrip()
```

只去右边：

```python
text.rstrip()
```

JS：

```js
const username = '  xiaoming  '
const cleanUsername = username.trim()
```

只去左边/右边：

```js
text.trimStart()  // 或 trimLeft()
text.trimEnd()    // 或 trimRight()
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 去两端空格 | `strip()` | `trim()` |
| 去左边空格 | `lstrip()` | `trimStart()` |
| 去右边空格 | `rstrip()` | `trimEnd()` |

企业场景：

1. 清理用户输入。
2. 清理 Excel 导入数据。
3. 清理文章标题。
4. 判断输入是否为空。
5. 保存数据库前做标准化。

高频踩坑：

```python
title = "  Python  "
title.strip()
print(title)  # 仍然是 "  Python  "，原字符串不变
```

正确：

```python
title = title.strip()
```

## 十四、大小写转换

Python：

```python
text = "python"

print(text.upper())        # PYTHON
print(text.lower())        # python
print(text.title())        # Python（每个单词首字母大写）
print(text.capitalize())   # Python（只有第一个字母大写）
```

| 方法 | 作用 | 示例 |
| --- | --- | --- |
| `upper()` | 转大写 | `"python".upper()` → `"PYTHON"` |
| `lower()` | 转小写 | `"PYTHON".lower()` → `"python"` |
| `title()` | 每个单词首字母大写 | `"hello world".title()` → `"Hello World"` |
| `capitalize()` | 首字母大写，其余小写 | `"hello WORLD".capitalize()` → `"Hello world"` |

JS：

```js
const text = 'python'

console.log(text.toUpperCase())  // PYTHON
console.log(text.toLowerCase())  // python
```

JS 没有内置的 `title()` 和 `capitalize()`，需要自己写。

核心区别：

1. Python 是 `upper()` / `lower()`。
2. JS 是 `toUpperCase()` / `toLowerCase()`。
3. Python 有 `title()` 和 `capitalize()`。
4. JS 没有完全同款内置方法。

企业场景：

```python
email = "USER@EXAMPLE.COM"
email = email.lower()  # 标准化邮箱，统一小写
```

## 十五、查找字符串

Python 判断包含用 `in`：

```python
title = "Python 零基础入门"

print("Python" in title)   # True
print("Java" in title)     # False
```

查找位置用 `find()`：

```python
print(title.find("零基础"))  # 7（找到位置）
print(title.find("Java"))    # -1（找不到返回 -1）
```

JS：

```js
const title = 'Python 零基础入门'

console.log(title.includes('Python'))   // true
console.log(title.includes('Java'))     // false
console.log(title.indexOf('零基础'))     // 7
console.log(title.indexOf('Java'))      // -1
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 判断是否包含 | `"key" in text` | `text.includes('key')` |
| 查找位置 | `text.find("key")` | `text.indexOf('key')` |
| 找不到返回 | `-1` | `-1` |

高频踩坑：

Python 没有 JS 字符串的 `includes()` 方法。不要在 Python 里写 `text.includes("key")`。

反过来，JS 没有 Python 的 `in` 关键字做字符串包含判断。`"key" in text` 在 JS 里不是判断字符串包含，而是判断对象属性。

## 十六、替换字符串 replace

Python：

```python
text = "我喜欢 Java"
new_text = text.replace("Java", "Python")

print(new_text)
```

输出：

```text
我喜欢 Python
```

**Python `replace()` 默认替换全部匹配：**

```python
print("aaa".replace("a", "b"))     # bbb（全部替换）
print("aaa".replace("a", "b", 1))  # baa（只替换第一个）
```

**JS `replace()` 默认只替换第一个匹配：**

```js
console.log('aaa'.replace('a', 'b'))       // baa（只替换第一个）
console.log('aaa'.replaceAll('a', 'b'))    // bbb（全部替换）
```

**这是一个非常重要的区别！**

| 功能 | Python | JS |
| --- | --- | --- |
| 默认行为 | 替换**全部** | 只替换**第一个** |
| 全部替换 | `text.replace("a", "b")` | `text.replaceAll("a", "b")` |
| 只替换第一个 | `text.replace("a", "b", 1)` | `text.replace("a", "b")` |

高频踩坑：

从 JS 转 Python 时，如果你习惯 `replace` 只替换第一个，在 Python 里会发现它替换了全部——这可能不是你要的效果。

反过来，Python 转 JS 时，如果你以为 `replace` 替换全部，结果它只替换了第一个。

## 十七、分割 split 与合并 join

Python 分割：

```python
tags = "Python,JS,Vue"
tag_list = tags.split(",")

print(tag_list)
```

输出：

```text
['Python', 'JS', 'Vue']
```

不传参数时，Python 按任意空白智能分割：

```python
text = "Python   JS   Vue"
print(text.split())
```

输出：

```text
['Python', 'JS', 'Vue']
```

这个特性在清理输入时特别方便——不管中间有多少空格、Tab、换行，都会被当作分隔符。

JS：

```js
const tags = 'Python,JS,Vue'
console.log(tags.split(','))  // ['Python', 'JS', 'Vue']
```

JS `split()` 不传参数时，不会按空白分割：

```js
const text = 'Python   JS   Vue'
console.log(text.split())  // ['Python   JS   Vue']（整个字符串作为一个元素）
```

如果要按多个空白分割：

```js
console.log(text.trim().split(/\s+/))
```

Python 合并：

```python
tags = ["Python", "JS", "Vue"]
text = ",".join(tags)

print(text)
```

输出：

```text
Python,JS,Vue
```

JS 合并：

```js
const tags = ['Python', 'JS', 'Vue']
const text = tags.join(',')

console.log(text)  // Python,JS,Vue
```

**join 的方向差异是最容易混的：**

| 语言 | 写法 | 记忆方式 |
| --- | --- | --- |
| Python | `"分隔符".join(list)` | 分隔符是主动方，把列表"拉"到一起 |
| JS | `array.join("分隔符")` | 数组是主动方，用分隔符"粘"起来 |

高频踩坑：

Python：

```python
tags = ["Python", "JS", "Vue"]
tags.join(",")  # AttributeError! 列表没有 join 方法
```

正确：

```python
",".join(tags)  # 分隔符调用 join，列表做参数
```

另外一个坑：Python 的 `join()` 要求列表元素必须都是字符串：

```python
nums = [1, 2, 3]
",".join(nums)  # TypeError! 数字不能直接 join
```

正确：

```python
nums = [1, 2, 3]
",".join(str(n) for n in nums)  # '1,2,3'
```

JS 不会报这个错，它会自动把数组元素转成字符串。

## 十八、判断开头和结尾

Python：

```python
filename = "article.md"

print(filename.startswith("article"))  # True
print(filename.endswith(".md"))        # True
```

JS：

```js
const filename = 'article.md'

console.log(filename.startsWith('article'))  // true
console.log(filename.endsWith('.md'))        // true
```

注意方法名差异：

| 功能 | Python | JS |
| --- | --- | --- |
| 判断开头 | `startswith()` | `startsWith()` |
| 判断结尾 | `endswith()` | `endsWith()` |

Python 全小写，JS 驼峰。

企业场景：

```python
filename = "avatar.png"

if filename.endswith((".png", ".jpg", ".jpeg")):
    print("这是图片文件")
```

注意 `endswith()` 和 `startswith()` 可以接受元组，匹配任意一个即可。

## 十九、判断字符串内容

Python 判断是否全是数字字符：

```python
text = "123"
print(text.isdigit())   # True
print("12a".isdigit())  # False
```

判断是否全是字母：

```python
text = "abc"
print(text.isalpha())   # True
print("ab1".isalpha())  # False
```

判断是否全是数字或字母：

```python
text = "abc123"
print(text.isalnum())   # True
print("ab 1".isalnum()) # False（有空格）
```

**注意：这些都是字符串方法，不是数字方法。**

```python
value = 123
value.isdigit()  # AttributeError! 数字没有 isdigit 方法
```

JS 常用正则：

```js
const text = '123'
console.log(/^\d+$/.test(text))         // 判断纯数字
console.log(/^[a-zA-Z]+$/.test('abc'))  // 判断纯字母
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 判断纯数字 | `text.isdigit()` | `/^\d+$/.test(text)` |
| 判断纯字母 | `text.isalpha()` | `/^[a-zA-Z]+$/.test(text)` |
| 判断数字或字母 | `text.isalnum()` | `/^[a-zA-Z0-9]+$/.test(text)` |

Python 的方法更直观，JS 的正则更灵活但更难读。

## 二十、重复字符串

Python 用 `*`：

```python
print("ha" * 3)    # hahaha
print("-" * 20)    # --------------------
```

JS 用 `.repeat()`：

```js
console.log('ha'.repeat(3))     // hahaha
console.log('-'.repeat(20))    // --------------------
```

这个在企业项目里其实挺常用，比如生成分隔线、填充字符、生成测试数据。

## 二十一、企业项目实战：清理文章标题和标签

需求：

1. 标题去掉左右空格。
2. 标题不能为空。
3. 标题不能超过 50 个字符。
4. 标签字符串按逗号拆分。
5. 每个标签去空格。
6. 空标签过滤掉。

Python：

```python
raw_title = "  Python 字符串 str  "
raw_tags = " Python, JS, Vue,  "

# 清理标题
title = raw_title.strip()

if title == "":
    print("标题不能为空")
elif len(title) > 50:
    print("标题太长")
else:
    print(f"文章标题：{title}")

# 清理标签
tag_parts = raw_tags.split(",")
clean_tags = []

for tag in tag_parts:
    clean_tag = tag.strip()
    if clean_tag != "":
        clean_tags.append(clean_tag)

print(f"标签数量：{len(clean_tags)}")
print(f"标签列表：{clean_tags}")
print("标签字符串：" + ",".join(clean_tags))
```

JS：

```js
const rawTitle = '  Python 字符串 str  '
const rawTags = ' Python, JS, Vue,  '

// 清理标题
const title = rawTitle.trim()

if (title === '') {
  console.log('标题不能为空')
} else if (title.length > 50) {
  console.log('标题太长')
} else {
  console.log(`文章标题：${title}`)
}

// 清理标签
const tagParts = rawTags.split(',')
const cleanTags = []

for (const tag of tagParts) {
  const cleanTag = tag.trim()
  if (cleanTag !== '') {
    cleanTags.push(cleanTag)
  }
}

console.log(`标签数量：${cleanTags.length}`)
console.log('标签列表：', cleanTags)
console.log('标签字符串：' + cleanTags.join(','))
```

这段代码很贴近真实项目，因为后台文章管理、导入文章、保存标签，经常要做这种字符串清洗。

## 二十二、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 获取长度 | `len(text)` | `text.length` | Python 是函数，JS 是属性 |
| 取最后一个 | `text[-1]` | `text.at(-1)` | Python 原生支持负数下标 |
| 截取子串 | `text[0:3]` | `text.slice(0, 3)` | Python 切片语法，JS 方法调用 |
| 去空格 | `strip()` | `trim()` | strip=剥除，trim=修剪 |
| 转大写 | `upper()` | `toUpperCase()` | Python 简短，JS 驼峰 |
| 判断包含 | `"key" in text` | `text.includes('key')` | Python 用关键字 in |
| 查找位置 | `find()` | `indexOf()` | 方法名不同 |
| 替换默认行为 | 替换**全部** | 只替换**第一个** | 最容易出 bug 的差异！ |
| 合并字符串 | `"分隔符".join(list)` | `array.join('分隔符')` | 方向完全相反 |
| 判断开头 | `startswith()` | `startsWith()` | Python 全小写，JS 驼峰 |
| 重复字符串 | `"ha" * 3` | `'ha'.repeat(3)` | Python 用乘法，JS 用方法 |
| 判断纯数字 | `text.isdigit()` | 正则 | Python 有专门方法 |

## 二十三、本篇练习

练习一：清理用户名。

Python：

```python
raw_username = "  xiaoming  "
username = raw_username.strip()

print(f"用户名：{username}")
print(f"长度：{len(username)}")
```

JS：

```js
const rawUsername = '  xiaoming  '
const username = rawUsername.trim()

console.log(`用户名：${username}`)
console.log(`长度：${username.length}`)
```

练习二：判断文件类型。

Python：

```python
filename = "article.md"

if filename.endswith(".md"):
    print("这是 Markdown 文件")
else:
    print("不是 Markdown 文件")
```

JS：

```js
const filename = 'article.md'

if (filename.endsWith('.md')) {
  console.log('这是 Markdown 文件')
} else {
  console.log('不是 Markdown 文件')
}
```

练习三：关键词搜索。

Python：

```python
title = "Python 零基础字符串入门"
keyword = "字符串"

if keyword in title:
    print("找到了关键词")
else:
    print("没有找到关键词")
```

JS：

```js
const title = 'Python 零基础字符串入门'
const keyword = '字符串'

if (title.includes(keyword)) {
  console.log('找到了关键词')
} else {
  console.log('没有找到关键词')
}
```

练习四：找错误。

Python：

```python
tags = ["Python", "JS"]
tags.join(",")    # 错误！列表没有 join 方法
```

正确：

```python
",".join(tags)
```

Python：

```python
text = "aaa"
text.replace("a", "b")  # 如果只想替换第一个，这样写不对
```

Python `replace()` 默认替换全部，如果想只替换第一个：

```python
text.replace("a", "b", 1)  # 第三个参数限制替换次数
```

## 本篇小结

1. Python 字符串类型叫 `str`，JS 叫 `string`。
2. Python 和 JS 都可以用单引号、双引号定义字符串。JS 还有模板字符串。
3. Python 多行字符串用三引号，JS 常用模板字符串。
4. Python 获取长度用 `len(text)`，JS 用 `text.length`。
5. Python 支持 `text[-1]` 取最后一个字符，JS 用 `text.at(-1)`。
6. Python 切片用 `text[start:end]`，JS 用 `text.slice(start, end)`。
7. Python 切片支持步长 `text[::2]` 和反转 `text[::-1]`。
8. Python 和 JS 字符串都不可变，方法返回新字符串。
9. Python 推荐 f-string，JS 推荐模板字符串。
10. Python 去空格用 `strip()`，JS 用 `trim()`。
11. Python 判断包含用 `in`，JS 用 `includes()`。
12. Python `replace()` 默认替换全部，JS `replace()` 默认只替换第一个。
13. Python 合并用 `"分隔符".join(list)`，JS 用 `array.join('分隔符')`——方向相反。
14. Python `startswith()` / `endswith()` 全小写，JS `startsWith()` / `endsWith()` 驼峰。
15. Python 有 `isdigit()`、`isalpha()` 等方法，JS 常用正则。
16. 企业项目中，字符串常用于输入清理、校验、搜索、替换和格式化。
