---
title: "Python 数据清洗入门 03：正则表达式清洗爬虫文本"
slug: "python-data-cleaning-regex-crawler-text"
summary: "面向零基础学习 Python re 模块在爬虫数据清洗中的常见用法，掌握 search、findall、sub、split、compile、分组、命名分组、贪婪与非贪婪，并理解企业开发中的字段规则、原始数据保留、校验、日志、测试和性能边界。"
category: "网络爬虫与数据分析"
categoryPath:
  - "后端技术"
  - "Python"
  - "应用实例"
  - "网络爬虫与数据分析"
tags:
  - "Python"
  - "网络爬虫"
  - "正则表达式"
  - "数据清洗"
  - "re"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a6b57a2fca6347974f5d18d"
originalSlug: "python-data-cleaning-regex-crawler-text"
originalStatus: "published"
publishedAt: "2026-07-30T14:44:46.174Z"
updatedAt: "2026-07-30T14:44:46.174Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# Python 数据清洗入门 03：正则表达式清洗爬虫文本

前面几篇已经学过：

1. 用 `requests` 请求网页或接口。
2. 用 `lxml` 和 XPath 解析 HTML。
3. 用 `csv` 保存爬虫结果。

这一篇补一块真实开发中绕不开的内容：

> 爬虫字段提取出来之后，往往还不能直接保存或分析，需要先做数据清洗。

比如你从网页里提取到了这些内容：

```text
  Python 爬虫入门 - 阅读 1,234 次  
发布时间：2026年07月07日
价格：￥ 99.00 元
标签：Python / 爬虫 / 数据分析
```

人能看懂，但程序不一定好处理。

你可能真正想保存的是：

```python
{
    'title': 'Python 爬虫入门',
    'views': 1234,
    'published_at': '2026-07-07',
    'price': 99.0,
    'tags': ['Python', '爬虫', '数据分析']
}
```

这就是正则表达式经常出场的地方。

## 一、本篇你会学到什么

学完这一篇，你应该能做到：

- 理解正则表达式在爬虫里的位置。
- 知道什么时候该用正则，什么时候不该用正则。
- 使用 Python 标准库 `re`。
- 使用 `re.search()` 查找第一个匹配。
- 使用 `re.findall()` 提取全部匹配。
- 使用 `re.sub()` 替换和清洗文本。
- 使用 `re.split()` 按多个分隔符拆分文本。
- 使用 `re.compile()` 复用正则规则。
- 理解 `\d`、`\s`、`.`、`*`、`+`、`?`、`[]`、`()` 等基础语法。
- 提取数字、日期、价格、标签等常见字段，并理解邮箱、手机号等敏感信息的处理边界。
- 把正则清洗函数接到爬虫和 CSV 流程里。
- 理解企业开发中的字段规则、原始数据保留、校验、日志、测试和性能风险。

先给你一张 `re` 模块能力地图：

| 能力 | 常用写法 | 爬虫清洗里解决什么问题 |
| --- | --- | --- |
| 查第一个 | `re.search()` | 从一段文本里找阅读量、日期、价格 |
| 从开头匹配 | `re.match()` | 判断文本是否以某种格式开头 |
| 完整匹配 | `re.fullmatch()` | 校验字段是否完全符合规则 |
| 查全部 | `re.findall()` | 提取所有数字、所有标签、所有编号 |
| 迭代匹配 | `re.finditer()` | 数据量较大时逐个处理匹配结果 |
| 替换清洗 | `re.sub()` | 删除多余符号、压缩空白、脱敏 |
| 多分隔符拆分 | `re.split()` | 拆标签、拆关键词、拆多值字段 |
| 复用规则 | `re.compile()` | 把字段规则集中起来，循环里复用 |
| 分组提取 | `()`、`(?P<year>\d{4})` | 提取年月日、价格整数和小数部分 |
| 匹配模式 | `re.I`、`re.S`、`re.M` | 忽略大小写、跨行匹配、多行处理 |

所以正则不是只会写 `\d+`。

在项目里，它通常承担这条链路：

```text
原始字段文本 -> 字段正则规则 -> 清洗函数 -> 校验函数 -> 结构化字段
```

## 二、正则在爬虫流程中的位置

一条比较完整的爬虫数据流程通常是：

```text
请求网页 -> 解析 HTML -> 提取字段 -> 清洗字段 -> 校验字段 -> 保存数据 -> 分析数据
```

前面学过的 `lxml` 主要负责：

```text
从 HTML 结构里找到字段
```

这一篇的正则主要负责：

```text
把已经提取出来的字段整理成统一格式
```

比如：

| 原始文本 | 清洗目标 |
| --- | --- |
| `阅读 1,234 次` | `1234` |
| `发布时间：2026年07月07日` | `2026-07-07` |
| `价格：￥ 99.00 元` | `99.0` |
| `Python / 爬虫 / 数据分析` | `['Python', '爬虫', '数据分析']` |
| `  标题\n\t` | `标题` |

## 三、一个重要边界：不要用正则解析整份 HTML

入门时要先记住这个边界：

> 正则适合清洗字段文本，不适合解析复杂 HTML 结构。

比如你想提取所有文章标题，应该优先用：

```python
from lxml import html

page = html.fromstring(html_text)
titles = page.xpath('//article//h2/a/text()')
```

不要优先写：

```python
re.findall(r'<h2>.*?</h2>', html_text)
```

为什么？

因为 HTML 结构可能有嵌套、属性、换行、空格、大小写差异、脚本内容等复杂情况。用正则硬解析 HTML 很容易脆弱。

更稳的分工是：

| 任务 | 推荐工具 |
| --- | --- |
| 请求网页 | `requests` |
| 解析 HTML 结构 | `lxml` + XPath |
| 提取 JSON 字段 | 字典 / 列表操作 |
| 清洗字段里的文本 | `re` / 字符串方法 |
| 保存表格 | `csv` |
| 分析表格 | `pandas` |

正则不是万能钥匙，它更像一把小刀。用在合适的位置，非常锋利；用错位置，维护起来会很痛苦。

## 四、导入 re 模块

Python 的正则模块叫 `re`，属于标准库，不需要安装。

```python
import re
```

你可以新建文件：

```text
regex_clean_demo.py
```

后面的代码都可以放在这个文件里练习。

运行：

```powershell
python regex_clean_demo.py
```

## 五、为什么正则前面经常加 r

你会经常看到这种写法：

```python
pattern = r'\d+'
```

前面的 `r` 表示 raw string，原始字符串。

正则里大量使用反斜杠，比如：

- `\d`：数字。
- `\s`：空白字符。
- `\w`：字母、数字、下划线等。

Python 字符串本身也用反斜杠表示转义。为了减少混乱，写正则时通常使用 `r''`。

推荐：

```python
pattern = r'\d+'
```

不推荐：

```python
pattern = '\\d+'
```

两种都可能运行，但第一种更清楚。

## 六、先认识几个基础符号

先记住这些常用符号：

| 写法 | 含义 | 示例 |
| --- | --- | --- |
| `\d` | 一个数字 | `0` 到 `9` |
| `\D` | 一个非数字 | 字母、中文、符号等 |
| `\s` | 一个空白字符 | 空格、换行、制表符 |
| `\S` | 一个非空白字符 | 不是空白的内容 |
| `\w` | 一个单词字符 | 字母、数字、下划线等 |
| `.` | 任意字符，默认不含换行 | `a`、`1`、`中` |
| `+` | 前面的内容出现 1 次或多次 | `\d+` |
| `*` | 前面的内容出现 0 次或多次 | `\s*` |
| `?` | 前面的内容出现 0 次或 1 次 | `https?` |
| `{m,n}` | 出现 m 到 n 次 | `\d{2,4}` |
| `[]` | 字符集合 | `[0-9]` |
| `()` | 分组 | `(\d+)` |
| `|` | 或 | `阅读|浏览` |
| `^` | 字符串开头 | `^Python` |
| `$` | 字符串结尾 | `.csv$` |

不用一口气背完。

入门阶段最常用的是：

```python
r'\d+'
r'\s+'
r'(\d{4})年(\d{1,2})月(\d{1,2})日'
```

## 七、re.search：查找第一个匹配

`re.search()` 会在字符串里查找第一个匹配项。

```python
import re

text = '阅读 1,234 次'

match = re.search(r'[\d,]+', text)

if match:
    print(match.group())
```

输出：

```text
1,234
```

解释：

```python
r'[\d,]+'
```

表示匹配“数字或逗号”，并且出现一次或多次。

`match.group()` 表示拿到匹配到的内容。

注意：`re.search()` 找不到时会返回 `None`。

所以不要直接写：

```python
print(match.group())
```

更稳的写法是：

```python
if match:
    print(match.group())
else:
    print('没有匹配到')
```

## 八、把阅读量清洗成数字

真实爬虫里，你不只是要提取 `1,234`，还要把它变成整数 `1234`。

```python
import re


def clean_views(text):
    match = re.search(r'[\d,]+', text)

    if not match:
        return 0

    number_text = match.group().replace(',', '')
    return int(number_text)


print(clean_views('阅读 1,234 次'))
print(clean_views('浏览量：98'))
print(clean_views('暂无阅读量'))
```

输出：

```text
1234
98
0
```

这里有一个重要习惯：

> 给每个字段写独立清洗函数。

这样后面字段规则变了，只改一个函数，不会把整份爬虫脚本搅乱。

## 九、re.findall：提取全部匹配

`re.findall()` 会返回所有匹配结果。

```python
import re

text = 'Python 120 次，Vue 98 次，Express 45 次'

numbers = re.findall(r'\d+', text)

print(numbers)
```

输出：

```python
['120', '98', '45']
```

注意：这里得到的是字符串列表，不是数字列表。

如果要变成数字：

```python
numbers = [int(item) for item in numbers]
print(numbers)
```

输出：

```python
[120, 98, 45]
```

如果匹配结果很多，或者你还想知道每个匹配的位置，可以用 `re.finditer()`：

```python
import re

text = 'Python 120 次，Vue 98 次，Express 45 次'

for match in re.finditer(r'\d+', text):
    print(match.group(), match.start(), match.end())
```

`finditer()` 返回的是一个可迭代对象，每次拿到一个 `match`。

企业脚本里，如果要逐个处理匹配结果、记录位置、避免一次性创建大列表，`finditer()` 会比 `findall()` 更合适。

### 补充：match 和 fullmatch 用于格式判断

`re.search()` 是“在字符串任意位置找”。

`re.match()` 是“从字符串开头开始匹配”。

`re.fullmatch()` 是“整个字符串必须完全匹配”。

例子：

```python
import re

print(bool(re.search(r'\d+', '阅读 123 次')))
print(bool(re.match(r'\d+', '阅读 123 次')))
print(bool(re.fullmatch(r'\d+', '123')))
print(bool(re.fullmatch(r'\d+', '123 次')))
```

输出：

```text
True
False
True
False
```

在爬虫清洗里可以这样理解：

| 方法 | 更适合什么 |
| --- | --- |
| `search()` | 从一段混杂文本里找目标 |
| `match()` | 判断开头是否符合格式 |
| `fullmatch()` | 校验整个字段是否符合格式 |

比如校验日期是否已经是标准格式：

```python
def is_standard_date(text):
    return bool(re.fullmatch(r'\d{4}-\d{2}-\d{2}', text or ''))
```

### 补充：常用匹配模式 flags

有些正则需要额外模式。

常用 flags：

| flag | 含义 | 常见场景 |
| --- | --- | --- |
| `re.I` / `re.IGNORECASE` | 忽略大小写 | 匹配 `python` / `Python` |
| `re.S` / `re.DOTALL` | 让 `.` 匹配换行 | 提取跨行文本片段 |
| `re.M` / `re.MULTILINE` | 多行模式，影响 `^` 和 `$` | 按行匹配日志或文本 |

示例：忽略大小写。

```python
import re

text = 'Python python PYTHON'
result = re.findall(r'python', text, flags=re.I)

print(result)
```

示例：跨行匹配。

```python
import re

text = '<div>第一行\n第二行</div>'
result = re.search(r'<div>.*?</div>', text, flags=re.S)

print(result.group() if result else '')
```

注意：跨行匹配 HTML 片段只是为了理解 `re.S`，解析 HTML 结构仍然优先使用 `lxml + XPath`。

## 十、re.sub：替换和清洗文本

`re.sub()` 最常用于数据清洗。

它的意思是：

```text
把匹配到的内容替换成指定内容
```

例子：把连续空白压成一个空格。

```python
import re

text = '  Python   爬虫\n\n入门\t教程  '

clean_text = re.sub(r'\s+', ' ', text).strip()

print(clean_text)
```

输出：

```text
Python 爬虫 入门 教程
```

解释：

- `\s+`：一个或多个空白字符。
- `' '`：替换成一个普通空格。
- `.strip()`：去掉开头和结尾的空白。

这个清洗标题、摘要、分类名时很常用。

## 十一、清洗标题

很多网页标题会夹杂阅读量、换行、制表符、多余后缀。

比如：

```text
  Python 爬虫入门 - 阅读 1,234 次  
```

我们想得到：

```text
Python 爬虫入门
```

代码：

```python
import re


def clean_title(text):
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'\s*-\s*阅读\s*[\d,]+\s*次$', '', text)
    return text.strip()


print(clean_title('  Python 爬虫入门 - 阅读 1,234 次  '))
```

输出：

```text
Python 爬虫入门
```

这里的 `$` 表示字符串结尾。

所以：

```python
r'\s*-\s*阅读\s*[\d,]+\s*次$'
```

只会清理标题末尾的阅读量后缀，不会误删标题中间的内容。

## 十二、re.split：按多个分隔符拆分

标签经常是这种格式：

```text
Python / 爬虫 / 数据分析
```

也可能是：

```text
Python, 爬虫，数据分析
```

分隔符可能有 `/`、英文逗号、中文逗号。

可以用 `re.split()`：

```python
import re


def clean_tags(text):
    parts = re.split(r'[/,，、]+', text)
    return [part.strip() for part in parts if part.strip()]


print(clean_tags('Python / 爬虫 / 数据分析'))
print(clean_tags('Python, 爬虫，数据分析'))
```

输出：

```python
['Python', '爬虫', '数据分析']
['Python', '爬虫', '数据分析']
```

这里：

```python
r'[/,，、]+'
```

表示一个或多个分隔符，分隔符可以是：

- `/`
- `,`
- `，`
- `、`

## 十三、分组：提取日期

假设你提取到：

```text
发布时间：2026年07月07日
```

想转换成：

```text
2026-07-07
```

可以用分组：

```python
import re


def clean_date(text):
    match = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', text)

    if not match:
        return ''

    year = match.group(1)
    month = match.group(2).zfill(2)
    day = match.group(3).zfill(2)

    return f'{year}-{month}-{day}'


print(clean_date('发布时间：2026年07月07日'))
print(clean_date('发布时间：2026年7月7日'))
```

输出：

```text
2026-07-07
2026-07-07
```

解释：

```text
(\d{4})
```

表示第 1 组，匹配 4 位年份。

```text
(\d{1,2})
```

表示匹配 1 到 2 位数字，比如 `7` 或 `07`。

```python
match.group(1)
match.group(2)
match.group(3)
```

分别取第 1、2、3 个分组。

`zfill(2)` 表示不满两位时左侧补 `0`。

## 十四、命名分组：让代码更清楚

分组多了以后，`group(1)`、`group(2)` 容易看不懂。

可以使用命名分组：

```python
import re


def clean_date(text):
    pattern = r'(?P<year>\d{4})年(?P<month>\d{1,2})月(?P<day>\d{1,2})日'
    match = re.search(pattern, text)

    if not match:
        return ''

    year = match.group('year')
    month = match.group('month').zfill(2)
    day = match.group('day').zfill(2)

    return f'{year}-{month}-{day}'


print(clean_date('发布时间：2026年7月7日'))
```

输出：

```text
2026-07-07
```

命名分组写法：

```text
(?P<year>\d{4})
```

意思是：这一组叫 `year`。

企业项目里，如果正则稍微复杂一点，命名分组会比纯数字分组更适合维护。

## 十五、清洗价格

网页价格可能是：

```text
价格：￥ 99.00 元
```

也可能是：

```text
¥1,299.50
```

可以这样清洗：

```python
import re


def clean_price(text):
    match = re.search(r'[\d,]+(?:\.\d+)?', text)

    if not match:
        return None

    price_text = match.group().replace(',', '')
    return float(price_text)


print(clean_price('价格：￥ 99.00 元'))
print(clean_price('¥1,299.50'))
print(clean_price('暂无价格'))
```

输出：

```text
99.0
1299.5
None
```

入门阶段用 `float` 方便理解。

企业项目里如果金额要参与结算、对账或财务计算，不建议长期使用浮点数保存金额。更常见的做法是：

- 使用整数保存“分”，比如 `1299` 表示 `12.99` 元。
- 使用 `Decimal` 保存精确小数。

爬虫学习阶段先掌握“把价格文本清洗成数字”的思路，后面做真实业务时再根据金额精度要求选择存储方式。

这里：

```text
(?:\.\d+)?
```

表示可选的小数部分。

`?:` 表示非捕获分组。简单理解就是：这里需要分组控制结构，但不需要后面用 `group()` 取它。

## 十六、贪婪和非贪婪

正则默认是贪婪匹配，也就是尽可能多地匹配。

看例子：

```python
import re

text = '<span>Python</span><span>爬虫</span>'

print(re.findall(r'<span>.*</span>', text))
```

输出：

```python
['<span>Python</span><span>爬虫</span>']
```

因为 `.*` 会尽可能多地匹配。

如果改成非贪婪：

```python
print(re.findall(r'<span>.*?</span>', text))
```

输出：

```python
['<span>Python</span>', '<span>爬虫</span>']
```

`.*?` 表示尽可能少地匹配。

不过再次提醒：这只是理解贪婪和非贪婪，不建议用正则解析复杂 HTML。结构提取还是优先用 `lxml`。

## 十七、re.compile：复用正则规则

如果同一个正则要用很多次，可以先编译：

```python
import re

views_pattern = re.compile(r'[\d,]+')


def clean_views(text):
    match = views_pattern.search(text)

    if not match:
        return 0

    return int(match.group().replace(',', ''))


print(clean_views('阅读 1,234 次'))
print(clean_views('浏览 98 次'))
```

好处：

- 代码更清楚。
- 同一个规则可以复用。
- 在循环里反复使用时更合适。

企业项目里，常见做法是把字段正则放在文件顶部，或集中放到清洗工具模块里。

## 十八、把正则接到爬虫记录里

假设你已经从页面里提取到了原始字段：

```python
raw_records = [
    {
        'title': '  Python 爬虫入门 - 阅读 1,234 次  ',
        'date': '发布时间：2026年07月07日',
        'price': '价格：￥ 99.00 元',
        'tags': 'Python / 爬虫 / 数据分析'
    },
    {
        'title': '  pandas 数据分析 - 阅读 98 次  ',
        'date': '发布时间：2026年7月8日',
        'price': '免费',
        'tags': 'Python, pandas，数据分析'
    }
]
```

我们可以清洗成结构化数据：

```python
import re


def normalize_space(text):
    return re.sub(r'\s+', ' ', text or '').strip()


def clean_title(text):
    text = normalize_space(text)
    text = re.sub(r'\s*-\s*阅读\s*[\d,]+\s*次$', '', text)
    return text.strip()


def clean_views(text):
    match = re.search(r'[\d,]+', text or '')

    if not match:
        return 0

    return int(match.group().replace(',', ''))


def clean_date(text):
    pattern = r'(?P<year>\d{4})年(?P<month>\d{1,2})月(?P<day>\d{1,2})日'
    match = re.search(pattern, text or '')

    if not match:
        return ''

    year = match.group('year')
    month = match.group('month').zfill(2)
    day = match.group('day').zfill(2)

    return f'{year}-{month}-{day}'


def clean_price(text):
    match = re.search(r'[\d,]+(?:\.\d+)?', text or '')

    if not match:
        return None

    return float(match.group().replace(',', ''))


def clean_tags(text):
    parts = re.split(r'[/,，、]+', text or '')
    return [part.strip() for part in parts if part.strip()]


raw_records = [
    {
        'title': '  Python 爬虫入门 - 阅读 1,234 次  ',
        'date': '发布时间：2026年07月07日',
        'price': '价格：￥ 99.00 元',
        'tags': 'Python / 爬虫 / 数据分析'
    },
    {
        'title': '  pandas 数据分析 - 阅读 98 次  ',
        'date': '发布时间：2026年7月8日',
        'price': '免费',
        'tags': 'Python, pandas，数据分析'
    }
]

clean_records = []

for record in raw_records:
    clean_records.append({
        'title': clean_title(record['title']),
        'views': clean_views(record['title']),
        'published_at': clean_date(record['date']),
        'price': clean_price(record['price']),
        'tags': clean_tags(record['tags'])
    })

print(clean_records)
```

输出类似：

```python
[
    {
        'title': 'Python 爬虫入门',
        'views': 1234,
        'published_at': '2026-07-07',
        'price': 99.0,
        'tags': ['Python', '爬虫', '数据分析']
    },
    {
        'title': 'pandas 数据分析',
        'views': 98,
        'published_at': '2026-07-08',
        'price': None,
        'tags': ['Python', 'pandas', '数据分析']
    }
]
```

这就是爬虫清洗的核心套路：

1. 原始字段先提取出来。
2. 每个字段单独写清洗函数。
3. 清洗函数处理空值和异常格式。
4. 最后组装成干净记录。

## 十九、保存 CSV 时怎么处理列表字段

CSV 是二维表，不太适合直接保存 Python 列表。

比如：

```python
['Python', '爬虫', '数据分析']
```

保存到 CSV 时可以转成字符串：

```python
'Python;爬虫;数据分析'
```

完整例子：

```python
import csv

rows = []

for record in clean_records:
    rows.append({
        'title': record['title'],
        'views': record['views'],
        'published_at': record['published_at'],
        'price': record['price'] if record['price'] is not None else '',
        'tags': ';'.join(record['tags'])
    })

with open('clean_articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(
        file,
        fieldnames=['title', 'views', 'published_at', 'price', 'tags']
    )
    writer.writeheader()
    writer.writerows(rows)

print('清洗结果已保存')
```

真实企业项目里，如果标签是多对多关系，最终可能会存数据库关联表；但入门阶段保存 CSV 时，用分号拼接已经足够清楚。

## 二十、pandas 里也可以用正则清洗

如果数据已经保存成 CSV，也可以在 pandas 中清洗。

```python
import pandas as pd

df = pd.read_csv('clean_articles.csv')

df['title'] = df['title'].str.replace(r'\s+', ' ', regex=True).str.strip()
df['views'] = pd.to_numeric(df['views'], errors='coerce').fillna(0)

print(df.head())
```

注意：

```python
regex=True
```

表示按正则表达式替换。

pandas 适合批量清洗已经成表的数据；普通 `re` 函数适合清洗单条爬虫记录。

入门阶段可以先掌握普通 `re`，再慢慢用 pandas 的字符串方法批量处理。

## 二十一、企业开发里的数据清洗规则

企业项目里，数据清洗不是“看着顺眼就删一点”。

更成熟的做法是先定义字段规则。

比如文章数据：

| 字段 | 原始来源 | 清洗规则 | 异常处理 |
| --- | --- | --- | --- |
| `title` | 页面标题 | 压缩空白，移除阅读量后缀 | 为空则丢弃或标记异常 |
| `views` | 标题或统计区 | 提取数字，逗号去掉，转整数 | 缺失则为 0 |
| `published_at` | 发布时间 | 转为 `YYYY-MM-DD` | 解析失败则为空 |
| `price` | 价格文本 | 提取数字，转浮点数 | 免费或缺失则为 `None` |
| `tags` | 标签区 | 多分隔符拆分，去空白 | 为空则空列表 |

这张表非常重要。

因为它把“代码怎么写”变成了“业务规则是什么”。

后续如果别人接手，不需要猜你的正则为什么这么写。

代码里也建议把常用规则集中管理，不要散落在几十个函数里：

```python
import re

PATTERNS = {
    'views': re.compile(r'[\d,]+'),
    'date': re.compile(
        r'(?P<year>\d{4})年(?P<month>\d{1,2})月(?P<day>\d{1,2})日'
    ),
    'price': re.compile(r'[\d,]+(?:\.\d+)?'),
    'tag_separator': re.compile(r'[/,，、]+')
}
```

这样做的好处是：

- 字段规则集中，一眼能看到这份数据怎么清洗。
- 多个清洗函数可以复用同一个规则。
- 页面格式变化时，优先检查规则表，不用满文件搜索正则。
- 写测试时，可以围绕每个字段规则准备样例。

再进一步，企业项目里常把清洗逻辑拆成三个层次：

```text
正则规则 -> 单字段清洗函数 -> 整条记录清洗函数
```

比如：

```python
def clean_record(raw_record):
    return {
        'raw_title': raw_record.get('title', ''),
        'title': clean_title(raw_record.get('title', '')),
        'views': clean_views(raw_record.get('title', '')),
        'published_at': clean_date(raw_record.get('date', '')),
        'tags': clean_tags(raw_record.get('tags', ''))
    }
```

这比把所有 `re.search()` 都写在一个大循环里更好维护，也更适合后续加日志、校验和测试。

企业爬虫还要提前想清楚去重规则。

比如文章数据可以用这些字段做去重键：

| 去重键 | 适合场景 |
| --- | --- |
| `url` | 页面地址稳定 |
| `slug` | 文章路径或别名稳定 |
| `source + original_id` | 来源站点有原始 ID |
| `source + title + published_at` | 没有 ID 时的弱去重 |

脚本重复运行时，应该尽量做到幂等：同一条来源数据重复抓取，不应该生成多条重复记录。

入门阶段保存 CSV 时，可以先用一个 `set` 做简单去重：

```python
seen_urls = set()
clean_records = []

for record in raw_records:
    url = record.get('url', '')

    if url in seen_urls:
        continue

    seen_urls.add(url)
    clean_records.append(record)
```

后续写入数据库时，再把去重键变成唯一索引或导入逻辑的一部分。

## 二十二、保留原始数据

企业开发中，不建议只保存清洗后的数据。

更稳的做法是至少在调试阶段保留原始字段：

```python
clean_records.append({
    'raw_title': record['title'],
    'title': clean_title(record['title']),
    'views': clean_views(record['title']),
    'raw_date': record['date'],
    'published_at': clean_date(record['date'])
})
```

为什么要保留原始数据？

- 清洗规则错了，可以回头排查。
- 网站格式变了，可以对比原始字段。
- 数据异常时，知道问题来自提取还是清洗。
- 后续规则升级时，可以重新清洗。

正式入库时是否保留原始字段，要看存储成本和业务要求。

但在爬虫开发、导入预览、数据迁移这些场景里，保留原始字段非常有价值。

## 二十三、清洗和校验要分开

清洗是把数据整理成目标格式。

校验是判断数据是否符合规则。

比如：

```python
def clean_views(text):
    match = re.search(r'[\d,]+', text or '')

    if not match:
        return 0

    return int(match.group().replace(',', ''))
```

负责把 `阅读 1,234 次` 转成 `1234`。

而：

```python
def validate_record(record):
    errors = []

    if not record['title']:
        errors.append('标题不能为空')

    if record['views'] < 0:
        errors.append('浏览量不能为负数')

    if record['published_at'] and len(record['published_at']) != 10:
        errors.append('发布时间格式不正确')

    return errors
```

负责判断清洗后的结果是否可信。

这样代码层次更清楚：

```text
原始数据 -> 清洗 -> 校验 -> 保存
```

## 二十四、记录清洗日志

企业项目里，清洗脚本最好能输出基本统计。

比如：

```python
total_count = len(raw_records)
valid_count = 0
invalid_records = []

for record in raw_records:
    cleaned = {
        'title': clean_title(record['title']),
        'views': clean_views(record['title']),
        'published_at': clean_date(record['date'])
    }

    errors = validate_record(cleaned)

    if errors:
        invalid_records.append({
            'raw': record,
            'errors': errors
        })
    else:
        valid_count += 1

print(f'原始记录：{total_count}')
print(f'有效记录：{valid_count}')
print(f'异常记录：{len(invalid_records)}')
```

日志不一定要一开始就写得很复杂。

但至少要知道：

- 原始数据多少条。
- 清洗成功多少条。
- 失败多少条。
- 失败原因是什么。

这对调试、上线、回滚都很重要。

## 二十五、给清洗函数写简单测试

正则很容易“改一个地方，坏另一个地方”。

所以关键清洗函数最好写几个测试样例。

入门阶段可以先用 `assert`：

```python
assert clean_views('阅读 1,234 次') == 1234
assert clean_views('浏览量：98') == 98
assert clean_views('暂无阅读量') == 0

assert clean_date('发布时间：2026年07月07日') == '2026-07-07'
assert clean_date('发布时间：2026年7月7日') == '2026-07-07'
assert clean_date('未知时间') == ''

assert clean_tags('Python / 爬虫 / 数据分析') == ['Python', '爬虫', '数据分析']
assert clean_tags('Python, 爬虫，数据分析') == ['Python', '爬虫', '数据分析']
```

如果没有输出，说明断言都通过。

如果某个断言失败，Python 会报错。

企业项目里可以用 `pytest` 或其他测试框架，但入门阶段先用 `assert` 建立测试意识就很好。

## 二十六、性能和安全边界

正则写得不好，可能会非常慢。

尤其是大文本里使用复杂嵌套模式时，可能出现严重回溯。

入门阶段先记住几条规则：

- 能用字符串方法解决的，不一定要用正则。
- 不要对整份巨大 HTML 反复跑复杂正则。
- 不要写过于宽泛的 `.*.*.*`。
- 能限定长度就限定长度，比如 `\d{1,4}` 比 `\d+` 更明确。
- 对外部输入或超长文本先做长度限制。
- 复杂规则先用少量样本测试，再放进大批量脚本。
- 正则用于清洗公开数据时，也要避免采集和保存敏感信息。

比如手机号、邮箱这类信息，即使能用正则提取，也不代表应该采集。

爬虫开发要同时考虑技术边界和合规边界。

如果业务确实需要处理这类字段，至少要先考虑脱敏：

```python
import re


def mask_email(text):
    return re.sub(r'([\w.-])[\w.-]*(@[\w.-]+)', r'\1***\2', text)


def mask_phone(text):
    return re.sub(r'(\d{3})\d{4}(\d{4})', r'\1****\2', text)


print(mask_email('contact@example.com'))
print(mask_phone('13812345678'))
```

输出：

```text
c***@example.com
138****5678
```

这类规则在企业里通常还要配合权限、日志、数据保留周期一起设计，不能只看正则能不能匹配。

## 二十七、常见错误和排查

### 1. re.search 找不到时报错

错误代码：

```python
match = re.search(r'\d+', text)
print(match.group())
```

如果没匹配到，`match` 是 `None`，会报错。

稳妥写法：

```python
match = re.search(r'\d+', text)

if match:
    print(match.group())
```

### 2. 忘了写 r''

正则里有反斜杠时，推荐：

```python
r'\d+'
```

不要写得让自己看不懂：

```python
'\\d+'
```

### 3. findall 返回结果和预期不一样

如果正则里有分组，`findall()` 的返回结构会受分组影响。

```python
import re

text = 'width=20 height=10'

print(re.findall(r'\w+=\d+', text))
print(re.findall(r'(\w+)=(\d+)', text))
```

输出：

```python
['width=20', 'height=10']
[('width', '20'), ('height', '10')]
```

有分组时，返回的是分组内容。

### 4. 贪婪匹配吃掉太多内容

如果你写：

```python
r'<span>.*</span>'
```

可能会匹配过多。

可以改成：

```python
r'<span>.*?</span>'
```

但解析 HTML 结构时，仍然优先用 `lxml`。

### 5. 清洗后数字还是字符串

正则提取出来默认是字符串。

需要自己转换：

```python
views = int(number_text)
price = float(price_text)
```

### 6. 中文空格没清干净

网页里可能有普通空格、换行、制表符、全角空格、不间断空格。

可以先做基础替换：

```python
text = text.replace('\xa0', ' ').replace('\u3000', ' ')
text = re.sub(r'\s+', ' ', text).strip()
```

`\xa0` 常见于网页里的不间断空格。

`\u3000` 是全角空格。

## 二十八、小练习

### 练习 1：清洗阅读量

把下面文本转换成整数：

```python
texts = [
    '阅读 1,234 次',
    '浏览量：98',
    '暂无阅读量'
]
```

目标结果：

```python
[1234, 98, 0]
```

### 练习 2：清洗日期

把下面文本转换成 `YYYY-MM-DD`：

```python
texts = [
    '发布时间：2026年07月07日',
    '更新于：2026年7月8日',
    '未知时间'
]
```

目标结果：

```python
['2026-07-07', '2026-07-08', '']
```

### 练习 3：清洗标签

把下面文本转换成列表：

```python
texts = [
    'Python / 爬虫 / 数据分析',
    'Vue, 前端，组件',
    '  后端、Express、MongoDB  '
]
```

目标结果：

```python
[
    ['Python', '爬虫', '数据分析'],
    ['Vue', '前端', '组件'],
    ['后端', 'Express', 'MongoDB']
]
```

### 练习 4：保存清洗结果

给定：

```python
raw_records = [
    {
        'title': '  Python 爬虫入门 - 阅读 1,234 次  ',
        'date': '发布时间：2026年07月07日',
        'tags': 'Python / 爬虫 / 数据分析'
    }
]
```

要求保存为 `clean_articles.csv`，字段为：

- `title`
- `views`
- `published_at`
- `tags`

其中 `tags` 用分号拼接。

## 本篇小结

这一篇你需要记住：

- 正则适合清洗字段文本，不适合解析复杂 HTML 结构。
- 写正则时推荐使用 `r''` 原始字符串。
- `re.search()` 查找第一个匹配，找不到返回 `None`。
- `re.findall()` 查找全部匹配。
- `re.sub()` 常用于替换和清洗文本。
- `re.split()` 可以按多个分隔符拆分。
- `()` 是分组，命名分组让复杂规则更清楚。
- `.*` 是贪婪匹配，`.*?` 是非贪婪匹配。
- 同一个正则反复使用时，可以用 `re.compile()`。
- 爬虫清洗建议按字段写独立函数。
- 企业开发里要定义字段规则、保留原始数据、做校验、记录日志、写测试。
- 正则要注意性能和合规边界，不要盲目采集敏感信息。

现在这组爬虫文章的主线就更完整了：

```text
请求网页 -> 解析 HTML -> 提取字段 -> 正则清洗 -> 保存 CSV -> pandas 统计
```

下一篇我们会读取清洗后的 CSV，用 pandas 做分类统计、排序和导出。

参考资料：

- Python `re` 官方文档：https://docs.python.org/3/library/re.html
- Python 正则表达式 HOWTO：https://docs.python.org/3/howto/regex.html
