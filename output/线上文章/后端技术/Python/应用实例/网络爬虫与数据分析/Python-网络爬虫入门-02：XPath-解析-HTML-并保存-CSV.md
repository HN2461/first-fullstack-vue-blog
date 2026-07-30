---
title: "Python 网络爬虫入门 02：XPath 解析 HTML 并保存 CSV"
slug: "python-crawler-lxml-parse-html-save-csv"
summary: "面向零基础系统学习 lxml 与 XPath 解析网页，覆盖 etree.HTML、xpath 返回值、文本和属性提取、属性筛选、层级定位、多条件、索引、相对 XPath、列表循环、空值安全、urljoin、CSV 保存、requests 实战模板、调试技巧和企业项目中的列表页/详情页拆分、字段 helper、原始数据保留、结构变化统计。"
category: "网络爬虫与数据分析"
tags:
  - "Python"
  - "lxml"
  - "XPath"
  - "CSV"
  - "网络爬虫"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a4a44b5f9ac958d291774ef"
originalSlug: "python-crawler-lxml-parse-html-save-csv"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# Python 网络爬虫入门 02：XPath 解析 HTML 并保存 CSV

上一篇已经系统学习了 `requests`：

- GET / POST / PUT / PATCH / DELETE 等请求方法。
- `params`、`data`、`json`、`headers`、`cookies`。
- `Response` 对象、状态码、超时、异常、Session。
- robots.txt 和请求频率边界。

这一篇进入爬虫的第二块核心能力：

> 从 HTML 里定位标签、文本、属性，并提取成结构化数据。

这一步最常用的工具组合是：

```text
requests 请求网页 -> lxml 解析 HTML -> XPath 定位字段
```

你不要把 XPath 理解成“背几个表达式”。

更准确地说：

> XPath 是一套在 HTML / XML 树结构中定位节点的查询语言。

学会它以后，换一个网页，你也能自己分析：

- 哪个节点是一条数据的外层容器。
- 标题在哪个标签里。
- 链接在哪个属性里。
- 时间、分类、作者应该从哪里提取。
- 为什么循环里要用 `./` 或 `.//`。
- 为什么直接 `[0]` 会报错。

这才是你后面写项目 demo 时真正需要的能力。

## 一、本篇你会学到什么

学完这一篇，你应该能做到：

- 理解 XPath 是什么，以及它在爬虫流程中的位置。
- 知道 `lxml.etree.HTML()` 和 `xpath()` 的基本使用流程。
- 掌握 `/`、`//`、`.`、`..`、`@`、`text()` 等核心语法。
- 会提取标签文本、属性、多个文本节点。
- 会按 `class`、`id`、`href`、文本内容筛选节点。
- 会使用 `contains()`、`starts-with()`、`and`、`or`。
- 知道 XPath 下标从 1 开始。
- 会在循环中使用相对 XPath：`./`、`.//`。
- 会安全处理空列表，避免 `[0]` 报错。
- 会把相对链接转成完整链接。
- 会把提取结果保存成 CSV。
- 能排查 XPath 空列表、动态页面、中文乱码、class 多值、页面结构变化等常见问题。
- 知道企业项目里如何封装字段提取 helper、拆分列表页和详情页、保留原始字段、保存样本 HTML、统计缺失字段。

## 二、XPath 在爬虫流程中的位置

一条基础爬虫流程是：

```text
请求网页 -> 解析 HTML -> XPath 提取字段 -> 正则清洗字段 -> 保存 CSV -> pandas 统计
```

这一篇只关注中间两步：

```text
解析 HTML -> XPath 提取字段
```

工具分工如下：

| 工具 | 负责什么 |
| --- | --- |
| `requests` | 把网页 HTML 请求回来 |
| `lxml` | 把 HTML 字符串解析成树 |
| XPath | 在树里定位标签、文本、属性 |
| `re` | 清洗提取出来的字段文本 |
| `csv` | 保存结构化结果 |

一个很重要的边界是：

> XPath 负责“从哪里取”，正则负责“取出来之后怎么清洗”。

比如：

- XPath 找到标题标签：`//h1/text()`
- 正则清洗标题里的多余空白：`re.sub(r'\s+', ' ', title).strip()`

不要用正则硬解析整份 HTML，也不要指望 XPath 自动把阅读量、日期、价格变成标准格式。

## 三、安装 lxml 和 requests

在命令行运行：

```powershell
python -m pip install lxml requests
```

检查是否安装成功：

```powershell
python -c "from lxml import etree; print('lxml ok')"
```

能看到：

```text
lxml ok
```

说明安装成功。

## 四、lxml 的两种常见导入写法

XPath 教程里常见这种写法：

```python
from lxml import etree
```

然后用：

```python
html = etree.HTML(html_text)
```

爬虫项目里也常见这种写法：

```python
from lxml import html
```

然后用：

```python
page = html.fromstring(html_text)
```

两种都可以解析 HTML 并使用 XPath。

这一篇主要使用：

```python
from lxml import etree
```

原因是很多 XPath 入门资料、调试示例、企业脚本都会这样写。你看到别人代码时也更容易对上。

## 五、最小流程：字符串 -> HTML 树 -> XPath

先不要请求真实网站。先用一段固定 HTML 练习，避免被网络、反爬、动态页面干扰。

新建文件：

```text
xpath_demo.py
```

写入：

```python
from lxml import etree

html_text = '''
<html>
  <body>
    <h1>Python 爬虫入门</h1>
    <a href="/articles/python">阅读全文</a>
  </body>
</html>
'''

page = etree.HTML(html_text)

titles = page.xpath('//h1/text()')
links = page.xpath('//a/@href')

print(titles)
print(links)
```

运行：

```powershell
python xpath_demo.py
```

输出：

```python
['Python 爬虫入门']
['/articles/python']
```

这个流程就是 XPath 爬虫的最小模型：

```text
HTML 字符串 -> etree.HTML() -> page.xpath("表达式") -> 返回列表
```

## 六、requests + lxml 标准搭配

等本地 HTML 理解后，再接入 `requests`。

```python
import requests
from lxml import etree

headers = {
    'User-Agent': 'PythonLearningBot/1.0'
}

url = 'https://httpbin.org/html'
response = requests.get(url, headers=headers, timeout=10)
response.raise_for_status()
response.encoding = 'utf-8'

page = etree.HTML(response.text)

result = page.xpath('//h1/text()')
print(result)
```

步骤拆开看：

1. `requests.get()` 请求网页，拿到 HTML 文本。
2. `response.raise_for_status()` 检查状态码。
3. `etree.HTML(response.text)` 把字符串变成 HTML 树。
4. `page.xpath('//h1/text()')` 用 XPath 提取内容。

真实项目里，不要一开始就直接写很长的 XPath。

先打印确认页面内容：

```python
print(response.status_code)
print(response.url)
print(response.text[:1000])
```

确认返回内容里确实有你要的字段，再写 XPath。

## 七、XPath 返回值一定要先理解

`xpath()` 的返回值取决于你的表达式。

最常见的是列表：

| XPath 表达式 | 返回内容 | Python 结果示意 |
| --- | --- | --- |
| `//a` | 元素节点 | `[<Element a at 0x123456>]` |
| `//a/text()` | 文本 | `['Python教程']` |
| `//a/@href` | 属性值 | `['/a/python']` |
| `count(//a)` | 数字 | `2.0` |
| `boolean(//h1)` | 布尔值 | `True` |
| `string(//h1)` | 字符串 | `'标题文本'` |

入门阶段最常见的是前三种：

- 取节点列表。
- 取文本列表。
- 取属性列表。

注意：

> `xpath()` 没匹配到时，通常返回空列表 `[]`。

所以不要直接写：

```python
title = page.xpath('//h1/text()')[0]
```

如果页面没有 `h1`，这会报错：

```text
IndexError: list index out of range
```

推荐写法：

```python
title_list = page.xpath('//h1/text()')
title = title_list[0].strip() if title_list else ''
```

这条习惯非常重要，后面所有项目 demo 都会用到。

## 八、核心 XPath 符号

先掌握这些高频符号：

| 符号 | 含义 | 示例 |
| --- | --- | --- |
| `/` | 从当前节点找直接子节点 | `//div/a` |
| `//` | 从任意层级找后代节点 | `//div//a` |
| `.` | 当前节点 | `./a/text()` |
| `..` | 父节点 | `../span/text()` |
| `@` | 属性 | `//a/@href` |
| `text()` | 直接文本节点 | `//h1/text()` |
| `*` | 任意标签 | `//*[@id="main"]` |
| `[]` | 条件筛选 | `//div[@class="box"]` |
| `|` | 合并多个结果 | `//h1/text() | //h2/text()` |

先不要追求复杂表达式。

新手最应该熟练的是：

```xpath
//标签名
//标签名/text()
//标签名/@属性名
//标签名[@属性名="属性值"]
.//标签名/text()
```

## 九、提取文本和属性

示例 HTML：

```html
<div class="box">
  <a href="https://example.com/a/python" id="link1">Python教程</a>
  <p>爬虫学习</p>
</div>
```

Python 代码：

```python
from lxml import etree

html_text = '''
<div class="box">
  <a href="https://example.com/a/python" id="link1">Python教程</a>
  <p>爬虫学习</p>
</div>
'''

page = etree.HTML(html_text)

print(page.xpath('//a/text()'))
print(page.xpath('//a/@href'))
print(page.xpath('//a/@id'))
print(page.xpath('//p/text()'))
```

输出：

```python
['Python教程']
['https://example.com/a/python']
['link1']
['爬虫学习']
```

记忆方式：

- `/text()`：取标签里的文本。
- `/@href`：取 `href` 属性。
- `/@id`：取 `id` 属性。
- `/@src`：取图片地址。

## 十、直接文本、全部文本和 string()

HTML 里经常有嵌套标签：

```html
<div class="title">
  Python <span>爬虫</span> 入门
</div>
```

如果写：

```python
page.xpath('//div[@class="title"]/text()')
```

它只会取 `div` 的直接文本节点，结果可能是：

```python
['\n  Python ', ' 入门\n']
```

里面 `span` 的 `爬虫` 不在直接文本里。

如果想取内部所有文本，可以用：

```python
page.xpath('//div[@class="title"]//text()')
```

结果可能是：

```python
['\n  Python ', '爬虫', ' 入门\n']
```

如果想合成一个字符串，可以用 XPath 的 `string()`：

```python
title = page.xpath('string(//div[@class="title"])')
title = ' '.join(title.split())
print(title)
```

输出：

```text
Python 爬虫 入门
```

你可以这样选：

| 需求 | 推荐写法 |
| --- | --- |
| 只取标签直接文本 | `//h1/text()` |
| 取标签内部所有层级文本 | `//div//text()` |
| 把一个节点内文本合成字符串 | `string(//div)` |

## 十一、按属性精准筛选

按属性筛选是 XPath 里的重点。

示例：

```html
<div id="main" class="article-list">
  <a href="/a/python">Python 爬虫</a>
</div>
```

按 `id` 找：

```xpath
//div[@id="main"]
```

按 `class` 找：

```xpath
//div[@class="article-list"]
```

提取这个 div 下的链接文本：

```python
titles = page.xpath('//div[@class="article-list"]/a/text()')
```

注意：

```xpath
@class="article-list"
```

表示 class 必须刚好等于 `article-list`。

如果 HTML 是：

```html
<div class="article-list active">
```

这个 XPath 就匹配不到。

## 十二、class 多值匹配：contains

网页里的 class 经常有多个值：

```html
<div class="article-list active">
```

这时可以用：

```xpath
//div[contains(@class, "article-list")]
```

代码：

```python
nodes = page.xpath('//div[contains(@class, "article-list")]')
```

不过企业项目里要知道一个细节：

```xpath
contains(@class, "item")
```

可能会误匹配：

```html
<div class="news-item"></div>
```

因为 `news-item` 里也包含 `item`。

更严谨的 class 匹配写法是：

```xpath
//*[contains(concat(" ", normalize-space(@class), " "), " item ")]
```

它的意思是：把 class 前后补空格，再按完整 class 单词匹配。

入门阶段你可以先用：

```xpath
contains(@class, "article-list")
```

但读企业代码时，如果看到：

```xpath
contains(concat(" ", normalize-space(@class), " "), " item ")
```

不要慌，它本质上就是更严谨的 class 包含判断。

## 十三、按属性开头、文本内容筛选

### 1. starts-with

找 `href` 以 `https` 开头的链接：

```xpath
//a[starts-with(@href, "https")]
```

适合筛选外链、图片地址、某类固定前缀路径。

### 2. 文本精准匹配

```xpath
//a[text()="Python教程"]
```

表示找文本刚好等于 `Python教程` 的 `a` 标签。

### 3. 文本包含

```xpath
//a[contains(text(), "Python")]
```

表示找文本里包含 `Python` 的 `a` 标签。

### 4. normalize-space

网页文本经常有空格和换行。

可以用：

```xpath
//a[normalize-space(text())="Python教程"]
```

`normalize-space()` 会去掉前后空白，并把连续空白压成一个空格。

## 十四、层级定位：/ 和 //

这是新手很容易混的地方。

### 1. `/`：直接子节点

```xpath
//div[@class="box"]/a
```

表示：

> 找 class 为 box 的 div 下面，直接一层的 a 标签。

如果 HTML 是：

```html
<div class="box">
  <p>
    <a href="/a/python">Python</a>
  </p>
</div>
```

`/a` 找不到，因为 `a` 不是 `div` 的直接子节点。

### 2. `//`：任意后代节点

```xpath
//div[@class="box"]//a
```

表示：

> 找 class 为 box 的 div 里面，任意层级的 a 标签。

在爬虫里，`//` 用得很多，但不要无脑全局 `//`。

定位列表时，先找到外层容器，再在容器内部用相对路径，会更稳。

## 十五、多条件筛选：and / or

同时满足多个条件：

```xpath
//div[@class="box" and @id="main"]
```

满足其中一个条件：

```xpath
//div[@class="box" or @class="card"]
```

组合文本和属性：

```xpath
//a[contains(@href, "/articles/") and contains(text(), "Python")]
```

这种写法在真实网页里很常见，因为只靠一个 class 有时不够稳定。

## 十六、索引取值：XPath 从 1 开始

XPath 的下标从 1 开始，不是 Python 的 0。

```xpath
//li[1]
```

表示第一个 `li`。

```xpath
//li[last()]
```

表示最后一个 `li`。

```xpath
//li[position() > 2]
```

表示第 3 个及以后的 `li`。

注意和 Python 列表区分：

```python
items = page.xpath('//li')
first_item = items[0]
```

Python 列表下标从 0 开始。

也就是说：

- XPath 里的 `[1]` 是第一个。
- Python 里的 `[0]` 是第一个。

## 十七、父节点和兄弟节点

有时字段不在当前标签里，而在它旁边或父级里。

示例：

```html
<div class="article">
  <span class="label">发布时间</span>
  <span class="value">2026-07-07</span>
</div>
```

找 label 后面的兄弟节点：

```xpath
//span[@class="label"]/following-sibling::span[@class="value"]/text()
```

找父节点：

```xpath
//span[@class="label"]/../span[@class="value"]/text()
```

常见轴语法：

| 写法 | 含义 |
| --- | --- |
| `..` | 父节点 |
| `following-sibling::标签` | 后面的同级节点 |
| `preceding-sibling::标签` | 前面的同级节点 |
| `parent::标签` | 父节点 |

入门阶段不用大量使用轴语法，但看到它们要知道是在“沿着树结构找关系”。

## 十八、循环提取多条数据：爬虫最高频

真实页面通常是一组列表：

```html
<ul class="article-list">
  <li>
    <h3>标题1</h3>
    <a href="/1.html">详情</a>
    <span class="time">2026-07-07</span>
  </li>
  <li>
    <h3>标题2</h3>
    <a href="/2.html">详情</a>
    <span class="time">2026-07-08</span>
  </li>
</ul>
```

正确思路是：

1. 先定位每一条数据的外层节点。
2. 循环每个节点。
3. 在当前节点内部提取字段。

代码：

```python
from lxml import etree

html_text = '''
<ul class="article-list">
  <li>
    <h3>标题1</h3>
    <a href="/1.html">详情</a>
    <span class="time">2026-07-07</span>
  </li>
  <li>
    <h3>标题2</h3>
    <a href="/2.html">详情</a>
    <span class="time">2026-07-08</span>
  </li>
</ul>
'''

page = etree.HTML(html_text)
items = page.xpath('//ul[@class="article-list"]/li')

for item in items:
    title = item.xpath('./h3/text()')
    link = item.xpath('./a/@href')
    time = item.xpath('./span[@class="time"]/text()')

    title = title[0].strip() if title else ''
    link = link[0].strip() if link else ''
    time = time[0].strip() if time else ''

    print(title, link, time)
```

输出：

```text
标题1 /1.html 2026-07-07
标题2 /2.html 2026-07-08
```

关键点：

```python
item.xpath('./h3/text()')
```

这里的 `.` 表示当前 `li`。

## 十九、循环里为什么不能乱用 //

循环里最容易写错的是：

```python
for item in items:
    title = item.xpath('//h3/text()')
```

这会从整个文档找所有 `h3`，而不是只从当前 `item` 里找。

结果很可能每次循环都拿到全页面标题。

循环里推荐：

```python
item.xpath('./h3/text()')
item.xpath('.//h3/text()')
```

区别：

| 写法 | 含义 |
| --- | --- |
| `./h3/text()` | 当前节点的直接子 `h3` |
| `.//h3/text()` | 当前节点内部任意层级的 `h3` |
| `//h3/text()` | 整个页面所有 `h3` |

记住一句话：

> 循环提取单条记录字段时，优先使用 `./` 或 `.//`。

## 二十、封装安全提取函数

如果每个字段都写：

```python
title_list = item.xpath('./h3/text()')
title = title_list[0].strip() if title_list else ''
```

代码会很啰嗦。

企业项目里通常会封装 helper。

```python
def normalize_text(text):
    return ' '.join(str(text).split())


def first_text(node, xpath):
    values = node.xpath(xpath)

    if isinstance(values, list):
        if not values:
            return ''

        return normalize_text(values[0])

    return normalize_text(values)


def first_attr(node, xpath):
    values = node.xpath(xpath)

    if isinstance(values, list):
        if not values:
            return ''

        return str(values[0]).strip()

    return str(values).strip()
```

使用：

```python
title = first_text(item, './h3/text()')
link = first_attr(item, './a/@href')
time = first_text(item, './span[@class="time"]/text()')
```

这样写的好处：

- 不会因为空列表直接报错。
- 空白处理统一。
- 业务代码更清楚。
- 后续要记录缺失字段时更容易扩展。

## 二十一、相对链接转完整链接：urljoin

页面里提取到的链接可能是：

```text
/a/python-crawler
```

这叫相对链接。

如果要保存成完整地址，可以用 `urljoin()`：

```python
from urllib.parse import urljoin

base_url = 'https://example.com/articles'
href = '/a/python-crawler'

full_url = urljoin(base_url, href)

print(full_url)
```

输出：

```text
https://example.com/a/python-crawler
```

在循环里常这样用：

```python
record = {
    'title': first_text(item, './h3/text()'),
    'url': urljoin(base_url, first_attr(item, './a/@href')),
    'published_at': first_text(item, './span[@class="time"]/text()')
}
```

这在列表页提取详情页链接时非常常见。

## 二十二、完整本地项目 demo：解析文章列表并保存 CSV

下面这个 demo 不依赖真实网站，适合先把 XPath 体系练熟。

新建文件：

```text
parse_local_articles.py
```

写入：

```python
import csv
from urllib.parse import urljoin

from lxml import etree


def normalize_text(text):
    return ' '.join(str(text).split())


def first_text(node, xpath):
    values = node.xpath(xpath)

    if isinstance(values, list):
        if not values:
            return ''

        return normalize_text(values[0])

    return normalize_text(values)


def first_attr(node, xpath):
    values = node.xpath(xpath)

    if isinstance(values, list):
        if not values:
            return ''

        return str(values[0]).strip()

    return str(values).strip()


base_url = 'https://example.com'

html_text = '''
<div class="article-list">
  <article class="article-item">
    <h2><a href="/a/python-basic">Python 基础</a></h2>
    <span class="category">Python</span>
    <time datetime="2026-07-07">2026年07月07日</time>
  </article>
  <article class="article-item">
    <h2><a href="/a/python-crawler">Python 爬虫</a></h2>
    <span class="category">Python</span>
    <time datetime="2026-07-08">2026年07月08日</time>
  </article>
  <article class="article-item">
    <h2><a href="/a/vue-basic">Vue 入门</a></h2>
    <span class="category">前端</span>
    <time datetime="2026-07-09">2026年07月09日</time>
  </article>
</div>
'''

page = etree.HTML(html_text)
items = page.xpath('//article[contains(@class, "article-item")]')

records = []

for item in items:
    href = first_attr(item, './/h2/a/@href')

    records.append({
        'title': first_text(item, './/h2/a/text()'),
        'url': urljoin(base_url, href),
        'category': first_text(item, './/span[contains(@class, "category")]/text()'),
        'published_at': first_attr(item, './/time/@datetime')
    })

with open('practice_articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(
        file,
        fieldnames=['title', 'url', 'category', 'published_at']
    )
    writer.writeheader()
    writer.writerows(records)

print(f'已保存 {len(records)} 条记录')
```

运行：

```powershell
python parse_local_articles.py
```

你会得到：

```text
已保存 3 条记录
```

并生成：

```text
practice_articles.csv
```

这就是一个很小但完整的爬虫解析 demo：

```text
HTML -> XPath -> 字典列表 -> CSV
```

## 二十三、requests + XPath 完整模板

等本地 HTML 练熟后，再换成真实请求。

```python
import csv
from urllib.parse import urljoin

import requests
from lxml import etree
from requests.exceptions import RequestException


def normalize_text(text):
    return ' '.join(str(text).split())


def first_text(node, xpath):
    values = node.xpath(xpath)

    if isinstance(values, list):
        if not values:
            return ''

        return normalize_text(values[0])

    return normalize_text(values)


def first_attr(node, xpath):
    values = node.xpath(xpath)

    if isinstance(values, list):
        if not values:
            return ''

        return str(values[0]).strip()

    return str(values).strip()


def fetch_html(url):
    headers = {
        'User-Agent': 'PythonLearningBot/1.0'
    }

    response = requests.get(url, headers=headers, timeout=(3, 10))
    response.raise_for_status()

    return response.text


def parse_articles(html_text, base_url):
    page = etree.HTML(html_text)
    items = page.xpath('//article')
    records = []

    for item in items:
        href = first_attr(item, './/a/@href')

        records.append({
            'title': first_text(item, './/a/text()'),
            'url': urljoin(base_url, href)
        })

    return records


def save_csv(records, file_name):
    with open(file_name, 'w', encoding='utf-8', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=['title', 'url'])
        writer.writeheader()
        writer.writerows(records)


def main():
    url = 'https://example.com'

    try:
        html_text = fetch_html(url)
        records = parse_articles(html_text, url)
        save_csv(records, 'articles.csv')
        print(f'已保存 {len(records)} 条记录')
    except RequestException as error:
        print(f'请求失败：{error}')


if __name__ == '__main__':
    main()
```

这段代码的重点不是 `example.com` 能提取出什么，而是项目结构：

```text
fetch_html() 请求网页
parse_articles() 解析字段
save_csv() 保存结果
main() 串起流程
```

以后换网站时，通常主要改：

- URL。
- 外层列表 XPath。
- 字段 XPath。
- CSV 字段。

而不是把整个脚本推倒重写。

## 二十四、企业常见流程：列表页和详情页拆分

真实项目里，列表页通常只有：

- 标题。
- 链接。
- 简短摘要。

详情页才有：

- 正文。
- 作者。
- 发布时间。
- 标签。
- 阅读量。

常见流程：

```text
列表页 -> 提取详情页 URL -> 请求详情页 -> 解析详情字段 -> 保存记录
```

示例结构：

```python
def parse_list_page(html_text, base_url):
    page = etree.HTML(html_text)
    items = page.xpath('//article')
    detail_urls = []

    for item in items:
        href = first_attr(item, './/h2/a/@href')

        if href:
            detail_urls.append(urljoin(base_url, href))

    return detail_urls


def parse_detail_page(html_text, detail_url):
    page = etree.HTML(html_text)

    return {
        'url': detail_url,
        'title': first_text(page, '//h1/text()'),
        'author': first_text(page, '//span[contains(@class, "author")]/text()'),
        'published_at': first_attr(page, '//time/@datetime'),
        'content': first_text(page, 'string(//article)')
    }
```

这样写的好处是：

- 列表页规则和详情页规则分开。
- 页面结构变化时更好排查。
- 详情页字段可以慢慢扩展。
- 失败重试时可以只重试详情页。

## 二十五、调试 XPath 的方法

### 1. 先保存真实 HTML 样本

浏览器看到的页面，不一定等于 `requests` 拿到的 HTML。

调试时建议保存一份：

```python
from pathlib import Path

Path('debug_page.html').write_text(response.text, encoding='utf-8')
```

然后打开 `debug_page.html` 看真实源码里有没有目标字段。

### 2. 打印前 1000 个字符

```python
print(response.status_code)
print(response.url)
print(response.text[:1000])
```

如果你看到的是登录页、验证码页、错误页，那 XPath 写得再对也提取不到目标数据。

### 3. 浏览器 F12 测试 XPath

浏览器开发者工具里：

```text
F12 -> Elements -> Ctrl+F -> 粘贴 XPath
```

可以快速看表达式是否能匹配。

但要注意：

> 浏览器 Elements 面板显示的是渲染后的 DOM，requests 拿到的是初始 HTML。

如果页面是 JavaScript 动态渲染，浏览器能匹配，不代表 `requests + lxml` 能匹配。

### 4. 不要盲目复制浏览器完整 XPath

浏览器复制出来的 XPath 可能长这样：

```xpath
/html/body/div[2]/div[3]/ul/li[1]/a
```

这种 XPath 非常脆弱。

页面多一个广告位、少一个容器，就可能失效。

更推荐围绕稳定结构写：

```xpath
//ul[contains(@class, "article-list")]//a/@href
//article//h2/a/text()
//time/@datetime
```

## 二十六、结构变化统计

企业爬虫不要默默吞掉所有空字段。

可以统计缺失情况：

```python
missing_title_count = 0
missing_url_count = 0

for item in items:
    title = first_text(item, './/h2/a/text()')
    href = first_attr(item, './/h2/a/@href')

    if not title:
        missing_title_count += 1

    if not href:
        missing_url_count += 1

print(f'标题缺失数量：{missing_title_count}')
print(f'链接缺失数量：{missing_url_count}')
```

如果某天标题缺失数量突然从 0 变成 100，说明页面结构很可能变了。

这比脚本静悄悄保存一堆空数据要可靠得多。

## 二十七、保留原始字段

解析时可以同时保留原始字段和清洗字段：

```python
raw_title = first_text(item, './/h2/a/text()')

record = {
    'raw_title': raw_title,
    'title': raw_title.strip(),
    'url': urljoin(base_url, first_attr(item, './/h2/a/@href'))
}
```

后续正则清洗或入库出问题时，可以知道问题来自：

- 网页原文。
- XPath 解析规则。
- 正则清洗规则。
- 保存或导入逻辑。

企业项目里，调试阶段保留原始字段非常有价值。

## 二十八、常见踩坑

### 1. XPath 下标从 1 开始

```xpath
//li[1]
```

表示第一个 `li`。

Python 列表才是从 0 开始：

```python
items[0]
```

### 2. 循环里误用 //

错误：

```python
item.xpath('//h3/text()')
```

正确：

```python
item.xpath('./h3/text()')
item.xpath('.//h3/text()')
```

### 3. xpath 返回空列表，直接 [0] 报错

错误：

```python
title = page.xpath('//h1/text()')[0]
```

稳妥：

```python
titles = page.xpath('//h1/text()')
title = titles[0].strip() if titles else ''
```

### 4. class 有多个值，精准匹配失败

HTML：

```html
<div class="item active">
```

这个可能匹配不到：

```xpath
//div[@class="item"]
```

可以改成：

```xpath
//div[contains(@class, "item")]
```

更严谨：

```xpath
//div[contains(concat(" ", normalize-space(@class), " "), " item ")]
```

### 5. 浏览器能看到，requests 看不到

通常是动态页面。

排查：

```python
print(response.text[:1000])
```

如果初始 HTML 里没有目标数据，可能要找真实 JSON 接口。

入门阶段先练静态页面和本地 HTML，不要一开始就挑战复杂动态页面。

### 6. 中文乱码

先看响应头和编码：

```python
print(response.headers.get('Content-Type'))
print(response.encoding)
```

必要时可以设置：

```python
response.encoding = response.apparent_encoding
```

保存 CSV 时使用：

```python
open('articles.csv', 'w', encoding='utf-8', newline='')
```

### 7. HTML 残缺

真实网页 HTML 不一定完全规范。

`lxml` 的 HTML 解析器会尽量补全残缺标签。

这是一件好事，但也意味着解析后的树结构可能和你肉眼看的源码略有差异。

遇到问题时，保存样本 HTML，再逐步测试 XPath。

## 二十九、小练习

### 练习 1：提取文本和属性

给定：

```python
html_text = '''
<div class="box">
  <a href="/a/python" id="link1">Python教程</a>
  <p>爬虫学习</p>
</div>
'''
```

要求提取：

- a 标签文本。
- a 标签 href。
- p 标签文本。

### 练习 2：循环提取列表

给定：

```python
html_text = '''
<ul class="article-list">
  <li>
    <h3>标题1</h3>
    <a href="/1.html">详情</a>
  </li>
  <li>
    <h3>标题2</h3>
    <a href="/2.html">详情</a>
  </li>
</ul>
'''
```

要求输出：

```python
[
    {'title': '标题1', 'url': 'https://example.com/1.html'},
    {'title': '标题2', 'url': 'https://example.com/2.html'}
]
```

提示：

- 先用 `//ul[@class="article-list"]/li` 找外层节点。
- 循环里用 `./h3/text()` 和 `./a/@href`。
- 用 `urljoin()` 拼完整链接。

### 练习 3：保存 CSV

把练习 2 的结果保存成：

```text
articles.csv
```

字段：

- `title`
- `url`

使用：

```python
csv.DictWriter
```

## 本篇小结

这一篇要建立的是 XPath 体系，而不是背几个零散表达式：

- XPath 是 HTML / XML 文档查询语言，用来定位标签、文本和属性。
- `requests` 负责请求网页，`lxml.etree.HTML()` 负责把 HTML 字符串解析成树。
- `xpath()` 通常返回列表，没匹配到就是空列表。
- `/text()` 提取文本，`/@href`、`/@src`、`/@id` 提取属性。
- `/` 表示直接子节点，`//` 表示任意后代节点。
- `.` 表示当前节点，循环提取字段时优先用 `./` 或 `.//`。
- `@class="xxx"` 是精准匹配，`contains(@class, "xxx")` 适合 class 多值场景。
- `contains()`、`starts-with()`、`and`、`or` 是高频筛选写法。
- XPath 下标从 1 开始，Python 列表下标从 0 开始。
- 安全提取字段时，要先判断列表是否为空，避免 `[0]` 报错。
- 列表页常用套路是“先找外层节点，再循环提取字段”。
- `urljoin()` 可以把相对链接转成完整链接。
- 企业项目里要封装 `first_text()`、`first_attr()`，拆分列表页和详情页，保存样本 HTML，保留原始字段，统计缺失字段。

下一篇我们会学习用正则表达式清洗爬虫文本，把阅读量、日期、价格、标签等字段整理成更适合保存和分析的格式。

参考资料：

- lxml 官方文档：https://lxml.de/
- lxml XPath 文档：https://lxml.de/xpathxslt.html
- Python `csv` 官方文档：https://docs.python.org/3/library/csv.html
