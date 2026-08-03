---
title: "第 1 篇：Python 网络爬虫基础概念：URL、HTTP、robots.txt、HTML、解析、数据保存"
slug: "python-crawler-basic-concepts"
summary: "Python 网络爬虫基础概念入门，覆盖网络机器人、爬虫、URL、HTTP 请求响应、robots.txt、HTML、静态页面、动态页面、解析、保存和分析的完整学习地图。"
category: "网络爬虫与数据分析"
categoryPath:
  - "后端技术"
  - "Python"
  - "网络爬虫与数据分析"
tags:
  - "Python"
  - "网络爬虫"
  - "网络机器人"
  - "基础概念"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a4a44b5f9ac958d291774e7"
originalSlug: "python-crawler-basic-concepts"
originalStatus: "published"
publishedAt: "2026-07-05T11:49:33.224Z"
updatedAt: "2026-07-31T11:16:21.960Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 1 篇：Python 网络爬虫基础概念：URL、HTTP、robots.txt、HTML、解析、数据保存

学习网络爬虫时，先不要急着背代码。

很多初学者一上来就复制一段 `requests.get()`，运行后看到一大堆 HTML，马上就懵了：

- 这些尖括号是什么？
- 为什么浏览器里能看到内容，Python 里却找不到？
- 为什么有的网站返回 403？
- 为什么教程里的 XPath 到自己这里就失效？
- 爬到数据后应该保存在哪里？

这些问题不是你笨，而是爬虫本来就不是一个孤立知识点。它是网络、网页结构、Python 基础、文件保存、数据分析和规则意识组合起来的一条流程。

你可以先记住一句话：

> 网络爬虫就是用程序自动访问网页或接口，把返回内容取回来，再提取需要的数据并保存。

这一篇的目标不是写一个复杂爬虫，而是先把地图铺开。你知道每个概念放在哪，后面写代码时就不会东一榔头西一棒槌。

## 一、这组文章会学什么

这组“网络爬虫与数据分析”会按这个顺序走：

1. 先理解基础概念：网络机器人、请求、响应、HTML、robots.txt。
2. 再用 `requests` 请求网页和 JSON 接口。
3. 再用 `lxml` 和 XPath 从 HTML 里提取字段。
4. 再用正则表达式清洗标题、日期、阅读量、标签等字段。
5. 再用 `csv` 把结果保存成表格。
6. 最后用 `pandas` 读取 CSV 做统计分析。

对应的工具分工是：

| 工具 | 负责什么 | 可以先怎么理解 |
| --- | --- | --- |
| `requests` | 请求网页或接口 | 帮 Python 像浏览器一样访问 URL |
| `lxml` | 解析 HTML | 把网页源码变成能查询的结构 |
| XPath | 定位内容 | 告诉程序去哪里找标题、链接、时间 |
| `re` | 清洗字段文本 | 把阅读量、日期、标签等整理成统一格式 |
| `csv` | 保存结果 | 把爬到的数据写成表格文件 |
| `pandas` | 分析结果 | 统计、筛选、排序 CSV 数据 |

所以你不要把爬虫理解成一个魔法函数。它更像一条流水线。

## 二、网络机器人是什么

网络机器人也叫 bot、spider、crawler。

它不是实体机器人，而是运行在电脑或服务器上的程序。它会按照设定规则自动访问网页或接口。

常见网络机器人包括：

- 搜索引擎爬虫：抓取网页，让搜索引擎建立索引。
- 网站监控脚本：定时访问页面，检查服务是否正常。
- 数据采集脚本：抓取公开页面上的标题、链接、公告、价格等信息。
- 自动化测试脚本：模拟访问页面，检查功能是否正常。

我们入门学习 Python 爬虫时，写的通常是“数据采集脚本”。

比如：

- 抓取公开博客文章标题。
- 抓取公开公告列表。
- 抓取公开文档页面链接。
- 把抓到的数据保存成 CSV。
- 清洗标题、日期、阅读量等字段。
- 再用 pandas 统计分类数量、浏览量、点赞数。

## 三、网络爬虫是什么

网络爬虫是一类网络机器人。

它的核心流程一般是：

1. 准备 URL：确定要访问哪个网页或接口。
2. 发送请求：用程序访问这个 URL。
3. 接收响应：拿到服务器返回的 HTML、JSON、图片或其他内容。
4. 判断结果：检查状态码、编码、内容是否正常。
5. 解析内容：从 HTML 或 JSON 里提取字段。
6. 清洗字段：把阅读量、日期、价格、标签等整理成统一格式。
7. 整理数据：把字段整理成列表、字典、表格。
8. 保存数据：写入 CSV、JSON、数据库或 Excel。
9. 分析数据：统计、筛选、排序、可视化。

这也是后面文章的主线。

## 四、一个爬虫结果长什么样

假设你抓取文章列表，最终想得到的数据可能是这样：

```python
records = [
    {
        'title': 'Python 基础',
        'url': 'https://example.com/a/python-basic',
        'category': 'Python'
    },
    {
        'title': 'Python 爬虫',
        'url': 'https://example.com/a/python-crawler',
        'category': 'Python'
    }
]
```

也就是：

- 一篇文章是一条记录。
- 一条记录用字典表示。
- 多条记录放进列表。

保存成 CSV 后可能是：

```csv
title,url,category
Python 基础,https://example.com/a/python-basic,Python
Python 爬虫,https://example.com/a/python-crawler,Python
```

你写爬虫时，很多代码其实都是为了把网页里乱糟糟的内容整理成这种结构化数据。

## 五、URL 是什么

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

爬虫经常围绕 URL 工作：

- 分析 URL 规律。
- 构造分页 URL。
- 给 URL 添加查询参数。
- 从网页里提取新的 URL。
- 把相对链接转换成完整链接。

## 六、请求和响应是什么

你在浏览器里输入网址时，浏览器会向服务器发送请求。

服务器处理后，会返回响应。

用 Python 写爬虫，就是把“浏览器发送请求”这件事交给代码做。

最简单的例子：

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
- `timeout=10`：最多等待 10 秒，避免程序一直卡住。

你可以把它想象成：

```text
Python -> 请求 URL -> 服务器
Python <- 返回响应 <- 服务器
```

## 七、状态码是什么

状态码用来表示请求结果。

常见状态码：

| 状态码 | 含义 | 新手应该怎么处理 |
| --- | --- | --- |
| 200 | 成功 | 可以继续解析 |
| 301 / 302 | 跳转 | 先看最终 URL 是否正确 |
| 400 | 请求参数错误 | 检查参数是否拼错 |
| 401 | 未登录或身份无效 | 不要绕过登录限制 |
| 403 | 没有权限 | 停止抓取或换公开目标 |
| 404 | 地址不存在 | 检查 URL |
| 429 | 请求太频繁 | 降低频率或停止 |
| 500 | 服务器异常 | 稍后再试，不要频繁重试 |

入门阶段最常见的是：

- `200`：正常。
- `403`：可能不允许访问。
- `404`：URL 写错或页面不存在。
- `429`：请求太快。

看到非 `200` 时，先不要急着解析网页。先把状态码、URL、返回文本前几百个字符打印出来看。

## 八、robots.txt 是什么

`robots.txt` 是网站放在根目录下的一份规则文件。

例如：

```text
https://example.com/robots.txt
```

它用于告诉网络机器人：

- 哪些路径允许访问。
- 哪些路径不希望访问。
- 是否有站点地图。

它常被称为“君子协议”，意思是主要依靠爬虫开发者自觉遵守，而不是强制技术锁。

但学习和写真实脚本时，应该把它当成基本规则来尊重。

## 九、robots.txt 常见写法

例如：

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

Python 标准库里有 `urllib.robotparser` 可以读取 robots 规则：

```python
from urllib.robotparser import RobotFileParser

parser = RobotFileParser()
parser.set_url('https://www.python.org/robots.txt')
parser.read()

print(parser.can_fetch('*', 'https://www.python.org/'))
```

如果结果是 `True`，表示当前规则允许访问。

如果结果是 `False`，就不要抓取这个地址。

## 十、什么是 HTML

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

爬虫关心的是 HTML 里面的数据：

- `h1` 里的标题是什么。
- `a` 标签的 `href` 链接是什么。
- 列表、表格、时间、价格等内容在哪里。

你看到的漂亮网页，其实背后通常是 HTML、CSS 和 JavaScript 一起工作的结果：

- HTML：页面结构和内容。
- CSS：样式。
- JavaScript：交互和动态加载。

爬虫入门主要先处理 HTML 和 JSON。

## 十一、静态页面和动态页面

这是新手非常容易卡住的地方。

### 静态页面

静态页面的主要内容已经在 HTML 里。

你用 `requests.get()` 拿到 `response.text` 后，就能在里面找到标题、链接、正文等内容。

这种页面适合用：

- `requests`
- `lxml`
- XPath

### 动态页面

动态页面打开时，初始 HTML 里可能没有完整数据。

浏览器会继续运行 JavaScript，再请求接口，把数据渲染到页面上。

所以你在浏览器里明明能看到内容，但用 Python 请求网页源码时却找不到。

这种情况通常有几种处理方式：

- 找到真正返回数据的 JSON 接口。
- 如果接口公开且允许访问，直接请求接口。
- 如果需要登录、验证码、付费权限，不要绕过限制。
- 对于复杂浏览器交互，入门阶段先不要急着碰。

判断一个页面是不是动态加载，可以先打印：

```python
print(response.text[:1000])
```

如果里面根本没有你想要的标题或字段，说明数据可能不是直接写在初始 HTML 里。

## 十二、什么是解析

解析就是把一大段 HTML 字符串变成可以查询的结构。

如果不解析，你只能把 HTML 当普通字符串处理。

比如你想找所有链接，手动用字符串查找会很脆弱。

解析后，你可以问：

- 找所有 `a` 标签。
- 找 class 为 `title` 的元素。
- 找某个标签里的文本。
- 找某个标签的属性。

目前这组文章会使用 `lxml` 做解析。

## 十三、什么是 lxml

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

注意：`xpath()` 返回的通常是列表。

即使页面里只有一个 `h1`，它也会返回：

```python
['Python 爬虫入门']
```

所以取第一项时要注意空列表：

```python
title_list = page.xpath('//h1/text()')
title = title_list[0] if title_list else ''
```

## 十四、什么是 XPath

XPath 是一种在 HTML / XML 结构里定位节点的语法。

常见写法：

| XPath | 含义 |
| --- | --- |
| `//h1/text()` | 获取所有 h1 的文本 |
| `//a/@href` | 获取所有 a 标签的 href 属性 |
| `//div[@class="title"]/text()` | 获取 class 为 title 的 div 文本 |
| `//article//a/text()` | 获取 article 内部所有 a 文本 |

先不要追求一次写出复杂 XPath。

入门阶段只要会做三件事：

- 找文本：`//h1/text()`。
- 找属性：`//a/@href`。
- 在循环里从当前节点查找：`.//a/text()`。

## 十五、什么是数据保存

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

## 十六、什么是数据分析

爬虫只负责把数据拿回来。

但很多时候你真正关心的是：

- 哪个分类文章最多？
- 哪类文章浏览量最高？
- 哪些标题出现了关键词？
- 数据里有没有重复项？
- 哪些字段缺失？

这些就是数据分析要做的事。

比如你把文章保存成 CSV 后，可以用 pandas 做统计：

```python
import pandas as pd

df = pd.read_csv('articles.csv')
summary = df.groupby('category').size()

print(summary)
```

所以这组文章的终点不是“爬到了”，而是“爬到之后能看懂数据”。

## 十七、一个完整流程长什么样

下面是一段迷你流程，只看结构，不要求现在完全掌握：

```python
import csv
import re
import requests
from lxml import html


def normalize_text(text):
    return re.sub(r'\s+', ' ', text).strip()


url = 'https://example.com'
response = requests.get(url, timeout=10)
response.raise_for_status()

page = html.fromstring(response.text)
titles = page.xpath('//h1/text()')

records = []

for title in titles:
    records.append({
        'title': normalize_text(title)
    })

with open('result.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title'])
    writer.writeheader()
    writer.writerows(records)
```

这段代码包含爬虫主线：

1. 请求网页。
2. 检查响应。
3. 解析 HTML。
4. XPath 提取文本。
5. 正则清洗字段文本。
6. 整理成列表字典。
7. 保存 CSV。

后面几篇文章就是把这条线拆开，一步一步讲清楚。

## 十八、企业常见爬虫工作流

入门教程会把每个知识点拆开讲，真实企业脚本通常会把它们组织成一条更稳定的流程。

你可以先记住这张表：

| 阶段 | 企业里通常会做什么 | 新手可以先怎么理解 |
| --- | --- | --- |
| 需求确认 | 明确抓哪些公开数据、字段、频率、用途 | 先别急着写代码，先知道要什么 |
| 合规检查 | 看 robots.txt、权限边界、数据敏感性 | 能访问不代表应该抓 |
| URL 规划 | 列表页、详情页、分页、接口参数 | 先找到数据从哪里来 |
| 请求层 | 统一 `Session`、请求头、超时、重试、限速 | 不要到处散写 `requests.get()` |
| 解析层 | 列表页提链接，详情页提字段 | 先拆大节点，再拆小字段 |
| 清洗层 | 正则清洗日期、数字、价格、标签 | 把人能看懂的文本变成程序好处理的数据 |
| 校验层 | 标题不能为空、数字不能为负、日期格式要统一 | 不是什么数据都能直接保存 |
| 去重幂等 | 用 URL、原始 ID、来源组合键去重 | 同一个脚本重复跑，不应该制造重复数据 |
| 存储层 | 保存原始样本、清洗结果、异常记录 | 出问题时能回头查 |
| 运行监控 | 记录总数、成功数、失败数、缺失字段数 | 不要只看到“脚本跑完了” |
| 失败重跑 | 保存失败 URL，后续只重试失败部分 | 不要每次失败都从头抓 |

如果把它画成一条线，大概是：

```text
需求和边界 -> URL 列表 -> 请求网页 -> 解析字段 -> 正则清洗 -> 数据校验 -> 去重 -> 保存 -> 统计和监控 -> 失败重跑
```

新手阶段不用一上来把这些全部做成复杂框架。

但你至少要有这个意识：

- 请求网页时，要有超时和频率控制。
- 解析 HTML 时，要能处理找不到字段的情况。
- 正则清洗时，要把原始值和清洗值区分开。
- 保存 CSV 前，要先想清楚字段顺序和去重方式。
- 分析数据前，要检查缺失值、重复值和字段类型。

这也是企业开发里常说的“工程化”。它不是炫技，而是让脚本在真实数据、真实网络、真实异常里还能稳定工作。

## 十九、新手学习顺序建议

如果你是零基础或刚学完 Python 基础，可以按这个顺序练：

1. 先手写一段 HTML 字符串，用 `lxml` 提取标题和链接。
2. 再用 `requests` 请求 `httpbin.org` 这种练习网站。
3. 再请求一个结构简单、公开允许访问的页面。
4. 再用正则表达式清洗标题、阅读量、日期等字段。
5. 再把提取结果保存成 CSV。
6. 最后用 pandas 读取 CSV 做统计。

不要一开始就挑战复杂网站、登录网站、验证码、无限滚动页面。

那不是入门，是给自己加难度。

## 二十、新手爬虫的基本边界

写爬虫时至少做到：

- 先看 robots.txt。
- 不抓取 robots.txt 禁止的路径。
- 不高频请求，不要几毫秒请求一次。
- 设置超时时间。
- 遇到 403、429、5xx 时停止或降低频率。
- 只抓取学习、公开、允许访问的数据。
- 不绕过登录、验证码、付费墙或反爬限制。
- 不采集隐私、账号、联系方式等敏感信息。

学习爬虫不是学习“怎么绕过别人系统”，而是学习“怎么合法、温和、可控地处理公开数据”。

## 二十一、本篇小结

你目前需要建立这些概念：

- 网络机器人：自动访问网络资源的程序。
- 网络爬虫：网络机器人中的一种，重点是抓取和提取数据。
- URL：网页或接口地址，是爬虫访问的目标。
- 请求和响应：Python 发送请求，服务器返回响应。
- 状态码：判断请求是否成功的数字信号。
- robots.txt：网站给网络机器人的访问规则。
- HTML：网页结构文本。
- 静态页面：数据通常在 HTML 里，适合 `requests + lxml` 入门。
- 动态页面：数据可能由 JavaScript 后续加载，需要先找真实接口。
- lxml：负责解析 HTML / XML。
- XPath：负责从解析后的结构里定位内容。
- re：适合清洗爬虫字段文本。
- CSV：适合保存爬虫结果。
- pandas：适合继续分析爬虫结果。
- 企业爬虫流程：需求边界、请求、解析、清洗、校验、去重、保存、监控和失败重跑要连起来看。

下一篇开始，我们会真正用 `requests` 请求网页，并学习如何检查状态码、处理异常、查看 robots.txt。

参考资料：

- Requests 官方文档：https://requests.readthedocs.io/
- Python `urllib.robotparser` 官方文档：https://docs.python.org/3/library/urllib.robotparser.html
- lxml 官方文档：https://lxml.de/
