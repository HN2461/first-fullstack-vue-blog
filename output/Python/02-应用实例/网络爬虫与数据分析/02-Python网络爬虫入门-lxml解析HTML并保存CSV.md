---
title: Python 网络爬虫入门 02：lxml 解析 HTML 并保存 CSV
slug: python-crawler-lxml-parse-html-save-csv
summary: 使用 lxml 解析 HTML，通过 XPath 提取标题、链接和文本内容，再用 csv 标准库把结构化结果保存为 CSV 文件。
category: Python应用实例
tags:
  - Python
  - lxml
  - XPath
  - CSV
  - 网络爬虫
status: draft
cover:
---

# Python 网络爬虫入门 02：lxml 解析 HTML 并保存 CSV

上一篇已经学了 `requests` 请求网页和 `robots.txt` 规则。

这一篇继续做第二步：解析 HTML。

目前按你正在学的内容，我们先用 `lxml`，它常和 XPath 一起使用：

- `requests`：拿到网页源码。
- `lxml`：把 HTML 字符串解析成结构。
- `XPath`：从结构里定位标题、链接、文本。
- `csv`：把结果保存成表格文件。

## 安装 lxml

```powershell
python -m pip install lxml
```

如果你已经使用虚拟环境，要先激活虚拟环境，再安装。

## 第一个 lxml 解析

```python
from lxml import html

html_text = '''
<html>
  <body>
    <h1>Python 应用实例</h1>
    <a href="/articles/crawler">网络爬虫入门</a>
    <a href="/articles/pandas">数据分析入门</a>
  </body>
</html>
'''

page = html.fromstring(html_text)

titles = page.xpath('//h1/text()')
links = page.xpath('//a/@href')

print(titles)
print(links)
```

输出大概是：

```text
['Python 应用实例']
['/articles/crawler', '/articles/pandas']
```

这里最核心的是两句：

```python
page = html.fromstring(html_text)
titles = page.xpath('//h1/text()')
```

`html.fromstring()` 把 HTML 字符串解析成可以查询的对象。

`xpath()` 使用 XPath 表达式查找内容。

## XPath 基础写法

XPath 是一种定位 HTML / XML 节点的语法。

先记住这些就够用：

| XPath | 含义 |
| --- | --- |
| `//h1` | 找所有 h1 标签 |
| `//h1/text()` | 找所有 h1 的文本 |
| `//a` | 找所有 a 标签 |
| `//a/text()` | 找所有 a 标签文本 |
| `//a/@href` | 找所有 a 标签的 href 属性 |
| `//div[@class="title"]` | 找 class 为 title 的 div |
| `//article//a/@href` | 找 article 内部所有 a 链接 |

两个符号要特别注意：

- `//`：从任意层级查找。
- `/`：从当前层级的下一层查找。

入门阶段先多用 `//`，等页面结构清楚后再写得更精确。

## 提取文本

```python
from lxml import html

html_text = '''
<div class="article">
  <h2>Python 爬虫入门</h2>
  <p>学习 requests、lxml 和 CSV 保存。</p>
</div>
'''

page = html.fromstring(html_text)

title = page.xpath('//h2/text()')
summary = page.xpath('//p/text()')

print(title)
print(summary)
```

注意：`xpath()` 返回的通常是列表。

即使页面里只有一个 `h2`，结果也会是：

```python
['Python 爬虫入门']
```

如果你只想取第一项，可以这样写：

```python
title_list = page.xpath('//h2/text()')
title = title_list[0] if title_list else ''

print(title)
```

这里的 `if title_list else ''` 是为了避免列表为空时报错。

## 提取属性

链接地址一般放在 `href` 属性里。

```python
from lxml import html

html_text = '''
<a href="/articles/python-crawler">Python 爬虫入门</a>
'''

page = html.fromstring(html_text)

title = page.xpath('//a/text()')
href = page.xpath('//a/@href')

print(title)
print(href)
```

`text()` 取文本，`@href` 取属性。

这个区别非常重要。

## 提取多条记录

真实页面通常是一组列表，比如文章列表、商品列表、公告列表。

```python
from lxml import html

html_text = '''
<div class="article-list">
  <article>
    <h2><a href="/a/python-basic">Python 基础</a></h2>
    <span class="category">Python</span>
  </article>
  <article>
    <h2><a href="/a/python-crawler">Python 爬虫</a></h2>
    <span class="category">Python</span>
  </article>
</div>
'''

page = html.fromstring(html_text)
article_nodes = page.xpath('//article')

records = []

for node in article_nodes:
    title_list = node.xpath('.//h2/a/text()')
    href_list = node.xpath('.//h2/a/@href')
    category_list = node.xpath('.//span[@class="category"]/text()')

    records.append({
        'title': title_list[0].strip() if title_list else '',
        'url': href_list[0].strip() if href_list else '',
        'category': category_list[0].strip() if category_list else ''
    })

print(records)
```

这里有一个新写法：

```python
node.xpath('.//h2/a/text()')
```

前面的 `.` 表示从当前 `article` 节点内部查找，而不是从整个页面重新查找。

在循环解析列表时，这个点很重要。

## 保存为 CSV

```python
import csv

records = [
    {'title': 'Python 基础', 'url': '/a/python-basic', 'category': 'Python'},
    {'title': 'Python 爬虫', 'url': '/a/python-crawler', 'category': 'Python'}
]

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title', 'url', 'category'])
    writer.writeheader()
    writer.writerows(records)
```

这里几个参数要记住：

- `encoding='utf-8'`：保证中文可读。
- `newline=''`：避免 Windows 下 CSV 多出空行。
- `DictWriter`：适合写字典列表。
- `writeheader()`：写入表头。
- `writerows()`：写入多条数据。

## 请求网页并解析

把 `requests` 和 `lxml` 合起来：

```python
import csv
import requests
from lxml import html

url = 'https://www.python.org/blogs/'

response = requests.get(url, timeout=10)
response.raise_for_status()

page = html.fromstring(response.text)
article_nodes = page.xpath('//ul[contains(@class, "list-recent-posts")]/li')

records = []

for node in article_nodes:
    title_list = node.xpath('.//a/text()')
    href_list = node.xpath('.//a/@href')
    date_list = node.xpath('.//time/text()')

    records.append({
        'title': title_list[0].strip() if title_list else '',
        'url': href_list[0].strip() if href_list else '',
        'date': date_list[0].strip() if date_list else ''
    })

with open('python_blogs.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title', 'url', 'date'])
    writer.writeheader()
    writer.writerows(records)

print(f'已保存 {len(records)} 条记录')
```

真实网站页面结构可能变化。如果 XPath 找不到内容，先打印一小段 `response.text`，或者用浏览器开发者工具重新确认结构。

## 相对链接转完整链接

有些链接是这样的：

```text
/articles/python-crawler
```

这叫相对路径。可以用 `urljoin` 转成完整地址。

```python
from urllib.parse import urljoin

base_url = 'https://example.com'
path = '/articles/python-crawler'

full_url = urljoin(base_url, path)

print(full_url)
```

输出：

```text
https://example.com/articles/python-crawler
```

## 常见错误

### xpath 返回空列表

可能原因：

1. XPath 写错。
2. 页面结构和你看到的不一样。
3. 内容由 JavaScript 后续渲染，原始 HTML 里没有。
4. 请求被拦截，拿到的不是正常页面。

排查方式：

```python
print(response.status_code)
print(response.text[:500])
```

先确认你请求到的内容到底是什么。

### 直接取 `[0]` 报错

错误示例：

```python
title = page.xpath('//h1/text()')[0]
```

如果没找到 `h1`，列表为空，取 `[0]` 会报错。

更稳的写法：

```python
title_list = page.xpath('//h1/text()')
title = title_list[0].strip() if title_list else ''
```

### 中文乱码

保存 CSV 时统一使用：

```python
open('articles.csv', 'w', encoding='utf-8', newline='')
```

如果 Excel 打开显示异常，先用 VS Code 检查文件内容是否正常。

## 小练习

使用下面 HTML，提取所有文章标题、链接、分类，并保存为 `practice_articles.csv`。

```python
html_text = '''
<div class="article-list">
  <article>
    <h2><a href="/a/python-basic">Python 基础</a></h2>
    <span class="category">Python</span>
  </article>
  <article>
    <h2><a href="/a/python-crawler">Python 爬虫</a></h2>
    <span class="category">Python</span>
  </article>
</div>
'''
```

提示：

- 用 `html.fromstring(html_text)` 解析。
- 用 `//article` 找所有文章节点。
- 在循环里用 `.//h2/a/text()` 找标题。
- 用 `.//h2/a/@href` 找链接。
- 用 `.//span[@class="category"]/text()` 找分类。
- 用 `csv.DictWriter` 保存。

## 本篇小结

这一篇把 HTML 解析和保存数据串起来了：

- `lxml.html.fromstring()` 用来解析 HTML 字符串。
- `xpath('//h1/text()')` 用来提取文本。
- `xpath('//a/@href')` 用来提取属性。
- 循环列表节点时，使用 `.//` 从当前节点内部查找。
- `xpath()` 通常返回列表，要处理空列表。
- `csv.DictWriter` 可以把字典列表保存成 CSV。

参考资料：

- lxml 官方文档：https://lxml.de/
- Python `csv` 官方文档：https://docs.python.org/3/library/csv.html
