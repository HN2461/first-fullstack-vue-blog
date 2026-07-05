---
title: Python 网络爬虫入门 00：基础概念
slug: python-crawler-basic-concepts
summary: 梳理网络机器人、网络爬虫、robots.txt、请求、响应、HTML、解析、XPath、数据保存等入门概念，先建立整体地图再写代码。
category: Python应用实例
tags:
  - Python
  - 网络爬虫
  - 网络机器人
  - 基础概念
status: draft
cover:
---

# Python 网络爬虫入门 00：基础概念

学习网络爬虫时，先不要急着背代码。

你要先知道自己在做什么：

> 用程序自动访问网页，把网页或接口返回的数据取回来，再从里面提取自己需要的信息。

这件事听起来像“自动化浏览器”，但入门阶段更准确地说，它是“自动发送网络请求 + 解析返回内容”。

## 什么是网络机器人

网络机器人，也常被叫做 bot、spider、crawler。

它不是实体机器人，而是运行在电脑或服务器上的程序。它会按照规则自动访问网页或接口。

常见网络机器人包括：

- 搜索引擎爬虫：抓取网页，让搜索引擎可以建立索引。
- 监控机器人：定时检查网站是否正常。
- 采集脚本：抓取公开页面上的标题、链接、价格、公告等信息。
- 自动化测试脚本：模拟用户访问页面，检查功能是否正常。

我们学习 Python 爬虫时，写的通常是“采集脚本”或“网页数据分析脚本”。

## 什么是网络爬虫

网络爬虫是一类网络机器人。

它的核心流程一般是：

1. 发送请求：访问一个 URL。
2. 接收响应：拿到 HTML、JSON、图片或其他内容。
3. 解析内容：从 HTML / JSON 里提取字段。
4. 保存数据：写入 CSV、JSON、数据库或 Excel。
5. 分析数据：统计、筛选、排序、可视化。

所以爬虫不是一个单独知识点，而是一串知识组合：

- 网络基础：URL、HTTP、请求、响应、状态码。
- Python 基础：字符串、列表、字典、函数、文件读写、异常处理。
- 第三方库：`requests`、`lxml`、`pandas` 等。
- 数据意识：字段、表格、清洗、去重、统计。
- 规则意识：robots.txt、频率控制、合法合规。

## 什么是 URL

URL 就是网页地址。

例如：

```text
https://example.com/articles?page=1&keyword=python
```

可以拆成几部分：

| 部分 | 示例 | 含义 |
| --- | --- | --- |
| 协议 | `https` | 用什么方式通信 |
| 域名 | `example.com` | 访问哪个网站 |
| 路径 | `/articles` | 访问网站里的哪个资源 |
| 查询参数 | `page=1&keyword=python` | 附加筛选条件 |

爬虫通常就是围绕 URL 工作：构造 URL、请求 URL、分析 URL 返回的数据。

## 什么是请求和响应

你在浏览器输入网址时，浏览器会向服务器发送请求。

服务器处理后，会返回响应。

用 Python 写爬虫，就是把“浏览器发送请求”这件事交给代码做。

```python
import requests

response = requests.get('https://example.com', timeout=10)

print(response.status_code)
print(response.text)
```

这里：

- `requests.get()`：发送 GET 请求。
- `response`：服务器返回的响应对象。
- `status_code`：响应状态码。
- `text`：响应正文。

## 什么是状态码

状态码用来表示请求结果。

| 状态码 | 含义 |
| --- | --- |
| 200 | 成功 |
| 301 / 302 | 跳转 |
| 400 | 请求参数错误 |
| 401 | 未登录或身份无效 |
| 403 | 没有权限 |
| 404 | 地址不存在 |
| 429 | 请求太频繁 |
| 500 | 服务器异常 |

入门时最常见的是：

- 200：可以继续解析。
- 403：可能不允许访问。
- 404：URL 写错或页面不存在。
- 429：请求太快，需要停止或降低频率。

## 什么是 robots.txt

`robots.txt` 是网站放在根目录下的一份规则文件。

例如：

```text
https://example.com/robots.txt
```

它用于告诉网络机器人：

- 哪些路径可以访问。
- 哪些路径不建议访问。
- 是否有站点地图。

它常被称为“君子协议”，意思是：它主要依靠爬虫开发者自觉遵守，而不是强制技术锁。

但学习和写真实脚本时，应该把它当成基本规则来尊重。

## robots.txt 常见写法

```text
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /public/
```

含义：

- `User-agent: *`：对所有网络机器人生效。
- `Disallow: /admin/`：不希望访问 `/admin/` 路径。
- `Disallow: /private/`：不希望访问 `/private/` 路径。
- `Allow: /public/`：允许访问 `/public/` 路径。

Python 标准库里有 `urllib.robotparser` 可以读取 robots 规则。

```python
from urllib.robotparser import RobotFileParser

parser = RobotFileParser()
parser.set_url('https://www.python.org/robots.txt')
parser.read()

print(parser.can_fetch('*', 'https://www.python.org/'))
```

## 什么是 requests 库

`requests` 是 Python 常用的 HTTP 请求库。

它负责“请求网页或接口”。

常见用法：

```python
import requests

response = requests.get(
    'https://httpbin.org/get',
    params={'keyword': 'python'},
    headers={'User-Agent': 'PythonLearningBot/1.0'},
    timeout=10
)

print(response.status_code)
print(response.url)
print(response.text)
```

你可以先记住：

- `params`：查询参数。
- `headers`：请求头。
- `timeout`：超时时间。
- `response.text`：文本内容。
- `response.json()`：把 JSON 响应转成字典或列表。
- `response.raise_for_status()`：遇到 4xx / 5xx 状态码时抛出异常。

## 什么是 HTML

HTML 是网页结构文本。

例如：

```html
<html>
  <body>
    <h1>Python 爬虫入门</h1>
    <a href="/articles/python">阅读全文</a>
  </body>
</html>
```

浏览器会把 HTML 渲染成页面。

爬虫则关心：

- `h1` 里的标题是什么。
- `a` 标签的 `href` 链接是什么。
- 列表、表格、时间、价格等内容在哪里。

## 什么是解析

解析就是把一大段 HTML 字符串变成可以查询的结构。

如果不解析，你只能把 HTML 当普通字符串处理，很容易写出脆弱的代码。

解析后，你可以问：

- 找所有 `a` 标签。
- 找 class 为 `title` 的元素。
- 找某个标签里的文本。
- 找某个标签的属性。

目前你学到的 `lxml` 就是用来做 HTML / XML 解析的库。

## 什么是 lxml

`lxml` 是 Python 中常用的 HTML / XML 解析库。

在爬虫入门里，它通常配合 XPath 使用：

```python
from lxml import html

page = html.fromstring('<h1>Python 爬虫入门</h1>')
titles = page.xpath('//h1/text()')

print(titles)
```

输出：

```text
['Python 爬虫入门']
```

你可以先这样分工：

- `requests`：负责请求网页。
- `lxml`：负责解析网页。
- `XPath`：负责定位网页里的内容。
- `csv` / `json` / `pandas`：负责保存和分析数据。

## 什么是 XPath

XPath 是一种在 HTML / XML 结构里定位节点的语法。

常见写法：

| XPath | 含义 |
| --- | --- |
| `//h1/text()` | 获取所有 h1 的文本 |
| `//a/@href` | 获取所有 a 标签的 href 属性 |
| `//div[@class="title"]/text()` | 获取 class 为 title 的 div 文本 |
| `//article//a/text()` | 获取 article 内部所有 a 文本 |

入门阶段不用追求一次写出复杂 XPath，先会定位标题、链接、列表就够了。

## 什么是数据保存

爬虫提取出来的数据一般要保存，否则程序结束后就没了。

常见保存方式：

| 方式 | 适合场景 |
| --- | --- |
| TXT | 简单文本 |
| CSV | 表格数据，适合 Excel / pandas |
| JSON | 层级结构数据 |
| 数据库 | 长期存储、查询、后台系统 |

入门阶段建议优先用 CSV。

因为它简单、直观，也方便下一步用 pandas 做数据分析。

## 一个完整流程长什么样

```python
import csv
import requests
from lxml import html

url = 'https://example.com'
response = requests.get(url, timeout=10)
response.raise_for_status()

page = html.fromstring(response.text)
titles = page.xpath('//h1/text()')

records = []

for title in titles:
    records.append({
        'title': title.strip()
    })

with open('result.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title'])
    writer.writeheader()
    writer.writerows(records)
```

这段代码虽然简单，但已经包含了爬虫主线：

1. 请求网页。
2. 检查响应。
3. 解析 HTML。
4. XPath 提取文本。
5. 整理成列表字典。
6. 保存 CSV。

## 本篇小结

你目前学到的知识可以这样归类：

- 网络机器人：自动访问网络资源的程序。
- 网络爬虫：网络机器人中的一种，重点是抓取和提取数据。
- robots.txt：网站给网络机器人的访问规则，常被称为君子协议。
- requests：负责请求网页或接口。
- HTML：网页结构文本。
- lxml：负责解析 HTML / XML。
- XPath：负责从解析后的结构里定位内容。
- CSV / pandas：负责保存和分析数据。

参考资料：

- Requests 官方文档：https://requests.readthedocs.io/
- Python `urllib.robotparser` 官方文档：https://docs.python.org/3/library/urllib.robotparser.html
- lxml 官方文档：https://lxml.de/
