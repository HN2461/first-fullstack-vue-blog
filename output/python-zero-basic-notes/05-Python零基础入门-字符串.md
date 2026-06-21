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
name = "小明'
```

左右引号不匹配会报错。

JS 里：

```js
const name = '小明"
```

也会报错。

## 四、空字符串不是 None / null

Python 空字符串：

```python
text = ""
```

它表示“有一个字符串，只是内容为空”。

Python 空值：

```python
value = None
```

表示“没有值”。

对照：

| 写法 | 含义 |
| --- | --- |
| `""` | 空字符串 |
| `None` | 没有值 |

JS：

```js
const text = ''
const value = null
let unknown
```

| 写法 | 含义 |
| --- | --- |
| `''` | 空字符串 |
| `null` | 主动设置为空 |
| `undefined` | 未定义或未赋值 |

相同点：

1. 空字符串和空值不是一回事。
2. 表单输入里经常出现空字符串。
3. 数据库字段里经常出现空值。

高频踩坑：

Python：

```python
nickname = ""

if nickname is None:
    print("没有昵称")
```

不会进入，因为它是空字符串，不是 `None`。

JS：

```js
const nickname = ''

if (nickname === null) {
  console.log('没有昵称')
}
```

也不会进入。

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

1. Python 用三引号。
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
| `\t` | 制表符 |
| `\"` | 双引号 |
| `\'` | 单引号 |
| `\\` | 反斜杠本身 |

换行：

```python
text = "第一行\n第二行"
print(text)
```

Windows 路径：

```python
path = "C:\\code\\python"
```

也可以用原始字符串：

```python
path = r"C:\code\python"
```

JS 对照：

```js
const text = "他说：\"你好\""
const path = 'C:\\code\\js'
```

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

这里 `\n` 可能被当成换行，`\t` 可能被当成 Tab。

更稳：

```python
path = r"C:\new\test"
```

或：

```python
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
console.log(text.length)
```

相同点：

1. 都能获取字符串长度。
2. 都常用于表单校验。
3. 都可以判断标题、昵称、密码是否过长。

核心区别：

1. Python 用 `len(text)`。
2. JS 用 `text.length`。
3. Python 没有 `text.length`。
4. JS 没有内置 `len(text)`。

高频踩坑：

```python
text = "Python"
print(text.length)
```

这是 JS 写法，Python 不支持。

## 八、索引：取某个字符

Python：

```python
text = "Python"
print(text[0])
print(text[1])
print(text[-1])
```

输出：

```text
P
y
n
```

负数下标从后往前：

```text
P    y    t    h    o    n
-6   -5   -4   -3   -2   -1
```

JS：

```js
const text = 'Python'
console.log(text[0])
console.log(text[1])
console.log(text.at(-1))
```

相同点：

1. 都能用 `[0]` 取第一个字符。
2. 下标都从 0 开始。
3. 都能按位置读取字符。

核心区别：

1. Python 原生支持 `text[-1]`。
2. JS 的 `text[-1]` 不等价，现代 JS 用 `text.at(-1)`。
3. Python 越界索引会报错。
4. JS 越界通常得到 `undefined`。

## 九、切片：取一段内容

Python 切片格式：

```python
字符串[开始位置:结束位置]
```

包含开始，不包含结束。

```python
text = "Python"

print(text[0:2])
print(text[:3])
print(text[3:])
print(text[-3:])
```

输出：

```text
Py
Pyt
hon
hon
```

JS 对照：

```js
const text = 'Python'

console.log(text.slice(0, 2))
console.log(text.slice(0, 3))
console.log(text.slice(3))
console.log(text.slice(-3))
```

相同点：

1. 都能截取字符串的一部分。
2. 都是包含开始，不包含结束。
3. 都不会修改原字符串。
4. 都返回新字符串。

核心区别：

1. Python 用 `text[0:3]`。
2. JS 用 `text.slice(0, 3)`。
3. Python 可以省略开始或结束。
4. JS 通过参数省略实现类似效果。

高频踩坑：

`text[0:2]` 只取下标 0 和 1，不包含下标 2。

JS `slice(0, 2)` 也一样。

## 十、字符串不可变

Python 字符串是不可变的。

```python
text = "Python"
text[0] = "J"
```

会报错。

如果想得到 `"Jython"`：

```python
text = "Python"
new_text = "J" + text[1:]

print(new_text)
```

JS 字符串也不可变：

```js
const text = 'Python'
const newText = 'J' + text.slice(1)

console.log(newText)
```

相同点：

1. 字符串本身都不可变。
2. 修改效果通常通过创建新字符串实现。
3. 字符串方法通常返回新字符串。

高频踩坑：

Python：

```python
title = "python"
title.upper()
print(title)
```

仍然输出：

```text
python
```

正确：

```python
title = title.upper()
```

JS 同理：

```js
let title = 'python'
title.toUpperCase()
console.log(title)
```

也不会修改原字符串。

## 十一、字符串拼接和格式化

Python 可以用 `+` 拼接：

```python
name = "小明"
print("你好，" + name)
```

但字符串不能直接和数字拼：

```python
age = 18
print("年龄：" + age)
```

会报错。

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

相同点：

1. 都能把变量嵌入字符串。
2. 都能写表达式。
3. 都比一堆 `+` 拼接清晰。

核心区别：

1. Python 用 `f"你好，{name}"`。
2. JS 用 `` `你好，${name}` ``。
3. Python `{}` 里不需要 `$`。
4. JS 必须写 `${}`。
5. Python 字符串拼数字要显式 `str()`。
6. JS 会自动转换，但容易隐藏 bug。

## 十二、去空格 strip / trim

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

只去左边：

```js
text.trimStart()
```

只去右边：

```js
text.trimEnd()
```

企业场景：

1. 清理用户输入。
2. 清理 Excel 导入数据。
3. 清理文章标题。
4. 判断输入是否为空。
5. 保存数据库前做标准化。

高频踩坑：

Python：

```python
title = "  Python  "
title.strip()
print(title)
```

原字符串不变。

正确：

```python
title = title.strip()
```

JS `trim()` 也是一样。

## 十三、大小写转换

Python：

```python
text = "python"

print(text.upper())
print(text.lower())
print(text.title())
print(text.capitalize())
```

常见方法：

| 方法 | 作用 |
| --- | --- |
| `upper()` | 转大写 |
| `lower()` | 转小写 |
| `title()` | 每个单词首字母大写 |
| `capitalize()` | 首字母大写，其余小写 |

JS：

```js
const text = 'python'

console.log(text.toUpperCase())
console.log(text.toLowerCase())
```

相同点：

1. 都能转大写。
2. 都能转小写。
3. 都常用于输入标准化。
4. 都返回新字符串。

核心区别：

1. Python 是 `upper()` / `lower()`。
2. JS 是 `toUpperCase()` / `toLowerCase()`。
3. Python 有 `title()`。
4. JS 没有完全同款内置标题化方法。

企业场景：

```python
email = "USER@EXAMPLE.COM"
email = email.lower()
```

JS：

```js
let email = 'USER@EXAMPLE.COM'
email = email.toLowerCase()
```

## 十四、查找字符串

Python 判断包含用 `in`：

```python
title = "Python 零基础入门"

print("Python" in title)
print("Java" in title)
```

输出：

```text
True
False
```

查找位置用 `find()`：

```python
print(title.find("零基础"))
print(title.find("Java"))
```

找不到返回 `-1`。

JS：

```js
const title = 'Python 零基础入门'

console.log(title.includes('Python'))
console.log(title.includes('Java'))
console.log(title.indexOf('零基础'))
console.log(title.indexOf('Java'))
```

相同点：

1. 都能判断是否包含关键词。
2. 都能查找关键词位置。
3. 找不到位置时都可以返回 `-1`。
4. 都常用于搜索、过滤、校验。

核心区别：

1. Python 判断包含常用 `"关键词" in text`。
2. JS 判断包含常用 `text.includes('关键词')`。
3. Python 找位置用 `find()`。
4. JS 找位置用 `indexOf()`。

高频踩坑：

Python 没有 JS 字符串的 `includes()`。

## 十五、替换字符串 replace

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

Python `replace()` 默认替换全部：

```python
print("aaa".replace("a", "b"))
```

输出：

```text
bbb
```

限制替换次数：

```python
print("aaa".replace("a", "b", 1))
```

输出：

```text
baa
```

JS：

```js
const text = '我喜欢 Java'
console.log(text.replace('Java', 'Python'))
```

JS `replace()` 默认只替换第一个：

```js
console.log('aaa'.replace('a', 'b'))
```

输出：

```text
baa
```

全部替换：

```js
console.log('aaa'.replaceAll('a', 'b'))
```

核心区别：

1. Python `replace()` 默认替换全部。
2. JS `replace()` 默认只替换第一个。
3. JS 全部替换可用 `replaceAll()` 或正则。
4. Python 限制次数用第三个参数。

## 十六、分割 split 与合并 join

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

JS：

```js
const tags = 'Python,JS,Vue'
console.log(tags.split(','))
```

JS `split()` 不传参数时，不会按空白分割：

```js
const text = 'Python   JS   Vue'
console.log(text.split())
```

结果是包含原字符串的数组。

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

JS 合并：

```js
const tags = ['Python', 'JS', 'Vue']
const text = tags.join(',')
```

核心区别：

1. Python 是 `"分隔符".join(list)`。
2. JS 是 `array.join('分隔符')`。
3. Python `join()` 要求列表元素必须都是字符串。
4. JS 会把数组元素转成字符串。

高频踩坑：

Python：

```python
tags.join(",")
```

这是 JS 思路，Python 错。

正确：

```python
",".join(tags)
```

## 十七、判断开头和结尾

Python：

```python
filename = "article.md"

print(filename.startswith("article"))
print(filename.endswith(".md"))
```

JS：

```js
const filename = 'article.md'

console.log(filename.startsWith('article'))
console.log(filename.endsWith('.md'))
```

相同点：

1. 都能判断开头。
2. 都能判断结尾。
3. 都常用于文件、路径、URL 处理。
4. 都返回布尔值。

核心区别：

1. Python 方法名是 `startswith()`、`endswith()`。
2. JS 方法名是 `startsWith()`、`endsWith()`。
3. Python 全小写。
4. JS 驼峰。

企业场景：

```python
filename = "avatar.png"

if filename.endswith(".png"):
    print("这是 PNG 图片")
```

JS：

```js
if (filename.endsWith('.png')) {
  console.log('这是 PNG 图片')
}
```

## 十八、判断字符串内容

Python 判断是否全是数字字符：

```python
text = "123"
print(text.isdigit())
```

判断是否全是字母：

```python
text = "abc"
print(text.isalpha())
```

注意：`isdigit()` 是字符串方法。

```python
value = 123
print(value.isdigit())
```

会报错。

JS 常用正则：

```js
const text = '123'
console.log(/^\d+$/.test(text))
```

判断字母：

```js
console.log(/^[a-zA-Z]+$/.test('abc'))
```

相同点：

1. 都能做字符串格式校验。
2. 都常用于页码、验证码、输入内容判断。
3. 都需要注意边界情况。

核心区别：

1. Python 有 `isdigit()`、`isalpha()`。
2. JS 常用正则。
3. Python 方法更直观。
4. JS 正则更灵活但更难读。

## 十九、企业项目实战：清理文章标题和标签

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

title = raw_title.strip()

if title == "":
    print("标题不能为空")
elif len(title) > 50:
    print("标题太长")
else:
    print(f"文章标题：{title}")

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

const title = rawTitle.trim()

if (title === '') {
  console.log('标题不能为空')
} else if (title.length > 50) {
  console.log('标题太长')
} else {
  console.log(`文章标题：${title}`)
}

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

## 二十、本篇练习

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

## 本篇小结

1. Python 字符串类型叫 `str`。
2. JS 字符串类型叫 `string`。
3. Python 和 JS 都可以用单引号、双引号定义字符串。
4. JS 还有模板字符串反引号。
5. Python 多行字符串用三引号。
6. JS 多行字符串常用模板字符串。
7. Python 和 JS 都支持转义字符。
8. Python 获取长度用 `len(text)`。
9. JS 获取长度用 `text.length`。
10. Python 和 JS 字符串下标都从 0 开始。
11. Python 支持 `text[-1]`。
12. JS 可用 `text.at(-1)`。
13. Python 切片用 `text[start:end]`。
14. JS 切片用 `text.slice(start, end)`。
15. Python 和 JS 字符串都不可变。
16. Python 推荐 f-string。
17. JS 推荐模板字符串。
18. Python 去空格用 `strip()`。
19. JS 去空格用 `trim()`。
20. Python 判断包含用 `in`。
21. JS 判断包含用 `includes()`。
22. Python `replace()` 默认替换全部。
23. JS `replace()` 默认只替换第一个，全部替换用 `replaceAll()`。
24. Python `split()` 不传参数会按空白智能分割。
25. JS `split()` 不传参数不会按空白分割。
26. Python 合并字符串用 `"分隔符".join(list)`。
27. JS 合并字符串用 `array.join('分隔符')`。
28. 企业项目中，字符串常用于用户输入、文章标题、标签、搜索关键词、接口路径、文件路径和日志内容。
