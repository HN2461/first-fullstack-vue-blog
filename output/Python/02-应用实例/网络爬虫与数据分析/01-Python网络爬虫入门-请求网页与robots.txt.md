---
title: Python 网络爬虫入门 01：请求网页与 robots.txt
slug: python-crawler-request-and-robots
summary: 从 requests 发起 HTTP 请求开始，理解状态码、响应内容、超时、异常处理，以及为什么写爬虫前要先检查 robots.txt。
category: Python应用实例
tags:
  - Python
  - 网络爬虫
  - 数据分析
status: draft
cover:
---

# Python 网络爬虫入门 01：请求网页与 robots.txt

网络爬虫本质上不是“神秘机器人”，而是一个自动访问网页、读取内容、提取数据的小程序。

你可以先把它理解成三步：

1. 请求网页：像浏览器一样访问一个 URL。
2. 读取内容：拿到网页返回的 HTML / JSON / 文本。
3. 提取数据：从内容里找出标题、链接、价格、时间等字段。

这一篇只做第一步：用 Python 请求网页，并建立一个很重要的习惯：访问前先看目标站点的规则。

## 安装 requests

`requests` 是 Python 里常用的 HTTP 请求库，语法比标准库更适合入门。

```powershell
python -m pip install requests
```

如果你已经学过虚拟环境，建议先创建并激活 `.venv`，再安装依赖。

## 第一个请求

```python
import requests

url = 'https://httpbin.org/get'
response = requests.get(url, timeout=10)

print(response.status_code)
print(response.text)
```

这段代码做了几件事：

- `requests.get(url)`：向指定地址发送 GET 请求。
- `timeout=10`：最多等待 10 秒，避免网络卡住时程序一直不结束。
- `response.status_code`：查看 HTTP 状态码。
- `response.text`：查看响应正文。

常见状态码可以先记这些：

| 状态码 | 含义 |
| --- | --- |
| 200 | 请求成功 |
| 301 / 302 | 页面跳转 |
| 403 | 没有权限访问 |
| 404 | 页面不存在 |
| 500 | 服务器内部错误 |

## 请求 JSON 接口

很多网站前端页面背后会请求 JSON 接口。JSON 接口比 HTML 页面更适合入门分析，因为它已经是结构化数据。

```python
import requests

response = requests.get('https://httpbin.org/json', timeout=10)
data = response.json()

print(type(data))
print(data)
```

`response.json()` 会把 JSON 字符串解析成 Python 的字典或列表。

但是要注意：如果响应内容不是合法 JSON，这里会报错。所以真实项目里通常会配合异常处理。

## 加上异常处理

```python
import requests

url = 'https://httpbin.org/status/404'

try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    print(response.text)
except requests.exceptions.Timeout:
    print('请求超时，请稍后重试')
except requests.exceptions.HTTPError as error:
    print(f'HTTP 状态异常：{error}')
except requests.exceptions.RequestException as error:
    print(f'请求失败：{error}')
```

这里最重要的是 `raise_for_status()`。

如果状态码是 4xx 或 5xx，它会抛出异常；如果请求成功，则不会做额外事情。

## 带查询参数

查询参数就是 URL 问号后面的内容，例如：

```text
https://example.com/search?q=python&page=1
```

用 `requests` 时，不建议手动拼字符串，而是使用 `params`。

```python
import requests

params = {
    'q': 'python',
    'page': 1
}

response = requests.get('https://httpbin.org/get', params=params, timeout=10)
print(response.url)
print(response.json())
```

这样可以减少中文、空格、特殊符号导致的 URL 编码问题。

## 设置请求头

有些网站会根据请求头判断访问来源。

```python
import requests

headers = {
    'User-Agent': 'PythonLearningBot/1.0'
}

response = requests.get('https://httpbin.org/headers', headers=headers, timeout=10)
print(response.json())
```

这里的 `User-Agent` 不是用来伪装成浏览器横冲直撞，而是让对方知道这是一个学习脚本。

## 写爬虫前先看 robots.txt

大多数网站会在根路径提供 `robots.txt`，用于说明哪些路径允许爬虫访问，哪些路径不希望爬虫访问。

例如：

```text
https://example.com/robots.txt
```

Python 标准库提供了 `urllib.robotparser` 来读取 robots 规则。

```python
from urllib.robotparser import RobotFileParser

robots_url = 'https://www.python.org/robots.txt'
target_url = 'https://www.python.org/'
user_agent = 'PythonLearningBot'

parser = RobotFileParser()
parser.set_url(robots_url)
parser.read()

can_fetch = parser.can_fetch(user_agent, target_url)

print(can_fetch)
```

如果返回 `True`，表示按当前规则可以访问；如果返回 `False`，就不要抓取这个地址。

## 新手爬虫的基本礼貌

写爬虫时至少做到：

- 不抓取 robots.txt 禁止的路径。
- 不高频请求，不要几毫秒请求一次。
- 设置超时时间。
- 遇到 403、429、5xx 时停止或降低频率。
- 只抓取学习、公开、允许访问的数据。
- 不绕过登录、验证码、付费墙或反爬限制。
- 不采集隐私、账号、联系方式等敏感信息。

## 小练习

写一个脚本完成下面任务：

1. 请求 `https://httpbin.org/get`。
2. 添加查询参数 `keyword=python`。
3. 设置 `timeout=10`。
4. 打印状态码。
5. 打印返回 JSON 里的 `args` 字段。

参考代码：

```python
import requests

response = requests.get(
    'https://httpbin.org/get',
    params={'keyword': 'python'},
    timeout=10
)

response.raise_for_status()
data = response.json()

print(response.status_code)
print(data['args'])
```

## 本篇小结

这一篇先建立网络请求的基础直觉：

- `requests.get()` 用来请求网页或接口。
- `status_code` 用来看请求结果。
- `text` 是响应文本，`json()` 会解析 JSON。
- `timeout` 很重要，避免程序卡死。
- `raise_for_status()` 可以把失败状态转成异常。
- 写爬虫前要先检查 robots.txt，并控制请求频率。

参考资料：

- Requests 官方文档：https://requests.readthedocs.io/
- Python `urllib.robotparser` 官方文档：https://docs.python.org/3/library/urllib.robotparser.html
