---
title: "第 2 篇：requests 请求体系与 robots.txt：方法、参数、Header、Session、异常处理"
slug: "python-crawler-request-and-robots"
summary: "Python requests 请求体系学习，覆盖 GET、POST、PUT、PATCH、DELETE、HEAD、OPTIONS、params、data、json、headers、cookies、Session、Response、timeout、异常处理、重试、限流、流式下载、上传、认证和 robots.txt。"
category: "网络爬虫与数据分析"
tags:
  - "Python"
  - "requests"
  - "HTTP"
  - "Session"
  - "robots.txt"
  - "异常处理"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a4a44b5f9ac958d291774eb"
originalSlug: "python-crawler-request-and-robots"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 2 篇：requests 请求体系与 robots.txt：方法、参数、Header、Session、异常处理

上一篇先建立了爬虫的整体地图。

这一篇开始学习爬虫的第一块核心能力：

> 用 Python 发起 HTTP 请求，并判断请求结果是否可信。

很多入门文章一上来只写：

```python
requests.get(url)
```

这会让人误以为 `requests` 只能发 GET 请求。

其实不是。

`requests` 是一个完整的 HTTP 客户端库。它不只是能请求网页，还能请求接口、发送表单、发送 JSON、上传文件、下载文件、携带 Cookie、保持会话、设置超时、处理异常、控制重试和封装企业项目里的统一请求层。

这一篇会按体系讲，而不是只堆几个零散例子。

你可以先记住一句话：

> `requests` 负责把“我要怎么访问服务器”这件事，用 Python 代码表达出来。

## 一、本篇你会学到什么

学完这一篇，你应该能建立一套完整的 `requests` 模块认知：

- 知道 HTTP 请求由方法、URL、请求头、请求体组成。
- 会用 `requests.get()` 请求网页和接口。
- 会用 `params` 传查询参数。
- 会用 `requests.post()` 发送表单和 JSON。
- 知道 `put`、`patch`、`delete`、`head`、`options` 分别适合什么场景。
- 会读取 `Response` 对象里的状态码、最终 URL、响应头、文本、JSON、二进制内容。
- 会设置 `headers`、`cookies`、`timeout`。
- 会用 `Session` 复用连接、公共请求头和 Cookie。
- 会用 `raise_for_status()` 发现失败状态码。
- 会捕获 `Timeout`、`HTTPError`、`RequestException` 等常见异常。
- 会检查 robots.txt。
- 知道企业开发中如何封装统一请求函数、有限重试、请求频率、分页请求、stream 下载、日志和敏感信息边界。

## 二、requests 在爬虫流程中的位置

一条基础爬虫流程通常是：

```text
检查规则 -> 请求网页或接口 -> 检查响应 -> 解析内容 -> 清洗字段 -> 保存数据 -> 分析数据
```

`requests` 主要负责前半段：

```text
请求网页或接口 -> 检查响应
```

它不负责解析 HTML，也不负责分析数据。

工具分工可以这样理解：

| 工具 | 负责什么 |
| --- | --- |
| `requests` | 发送 HTTP 请求，拿到服务器响应 |
| `urllib.robotparser` | 检查 robots.txt 规则 |
| `lxml` | 解析 HTML |
| `re` | 清洗字段文本 |
| `csv` | 保存表格结果 |
| `pandas` | 统计分析 CSV |

所以本篇只解决一个核心问题：

> 怎样稳定、清楚、可控地把服务器返回内容拿回来。

## 三、安装 requests

`requests` 不是 Python 标准库，需要先安装。

在命令行运行：

```powershell
python -m pip install requests
```

如果你已经使用虚拟环境，建议先激活虚拟环境，再安装依赖。

安装后可以检查版本：

```powershell
python -m pip show requests
```

如果能看到版本信息，说明安装成功。

## 四、先理解 HTTP 请求由什么组成

在写代码前，先理解一个请求大概由四块组成：

| 组成部分 | 示例 | 作用 |
| --- | --- | --- |
| 请求方法 | `GET`、`POST` | 告诉服务器你想做什么 |
| URL | `https://example.com/articles` | 告诉服务器访问哪里 |
| 请求头 | `User-Agent`、`Authorization` | 附加说明，比如身份、内容类型 |
| 请求体 | 表单、JSON、文件 | 提交给服务器的数据 |

例如：

```text
GET https://example.com/articles?page=1
```

表示：

- 用 GET 方法。
- 请求文章列表。
- 查询第 1 页。

再比如：

```text
POST https://example.com/api/articles
Content-Type: application/json

{"title": "Python 爬虫入门"}
```

表示：

- 用 POST 方法。
- 请求创建或提交数据。
- 请求体是 JSON。

学 `requests` 时，不要只背方法名，要把它放回 HTTP 请求结构里理解。

## 五、requests 的方法体系

`requests` 常用方法不是只有 `get()`。

它提供了这些常见 HTTP 方法：

| requests 写法 | HTTP 方法 | 常见用途 |
| --- | --- | --- |
| `requests.get()` | GET | 读取网页、读取列表、查询数据 |
| `requests.post()` | POST | 提交表单、提交 JSON、创建数据 |
| `requests.put()` | PUT | 整体更新资源 |
| `requests.patch()` | PATCH | 局部更新资源 |
| `requests.delete()` | DELETE | 删除资源 |
| `requests.head()` | HEAD | 只获取响应头，不下载正文 |
| `requests.options()` | OPTIONS | 查询服务器支持哪些方法或跨域能力 |
| `requests.request()` | 任意方法 | 根据变量动态指定方法 |

你可以先这样理解：

- 爬虫抓公开列表和详情页，最常用 GET。
- 请求 JSON 接口时，GET 和 POST 都常见。
- 后台系统、API 测试、企业接口对接中，POST、PUT、PATCH、DELETE 都会遇到。
- 下载大文件、检查文件大小时，HEAD 和 stream 下载会遇到。

通用写法是：

```python
import requests

response = requests.request('GET', 'https://httpbin.org/get', timeout=10)
print(response.status_code)
```

实际代码里，如果方法固定，通常直接用：

```python
requests.get('https://httpbin.org/get', timeout=10)
requests.post('https://httpbin.org/post', json={'name': 'demo'}, timeout=10)
```

## 六、第一个 GET 请求

新建文件：

```text
request_demo.py
```

写入：

```python
import requests

url = 'https://httpbin.org/get'
response = requests.get(url, timeout=10)

print(response.status_code)
print(response.url)
print(response.text)
```

运行：

```powershell
python request_demo.py
```

你会看到类似输出：

```text
200
https://httpbin.org/get
{
  "args": {},
  "headers": {
    "Accept": "*/*",
    "User-Agent": "Mozilla/5.0 Chrome/120"
  },
  "origin": "当前网络出口 IP",
  "url": "https://httpbin.org/get"
}
```

这里用的是 `httpbin.org`，它是一个专门用来练习 HTTP 请求的网站，很适合入门。

逐行解释：

```python
import requests
```

导入 `requests` 库。

```python
response = requests.get(url, timeout=10)
```

向这个 URL 发送 GET 请求。

`timeout=10` 表示最多等待 10 秒。如果网络一直没响应，程序不会永远卡住。

```python
print(response.status_code)
```

打印状态码。`200` 表示请求成功。

```python
print(response.url)
```

打印最终访问的 URL。加了查询参数或发生跳转时，这个很有用。

```python
print(response.text)
```

打印响应正文。它可能是 HTML、JSON、普通文本等。

## 七、GET 查询参数：params

查询参数就是 URL 问号后面的内容。

比如：

```text
https://example.com/search?q=python&page=1
```

这里：

- `q=python`
- `page=1`

都是查询参数。

用 `requests` 时，不建议手动拼字符串，而是使用 `params`：

```python
import requests

params = {
    'q': 'python',
    'page': 1
}

response = requests.get('https://httpbin.org/get', params=params, timeout=10)
response.raise_for_status()

print(response.url)
print(response.json()['args'])
```

输出类似：

```text
https://httpbin.org/get?q=python&page=1
{'page': '1', 'q': 'python'}
```

为什么推荐 `params`？

因为它会帮你处理空格、中文、特殊符号的 URL 编码问题。

企业项目里，只要是查询条件、分页条件、搜索关键字，通常都放在 `params` 里：

```python
params = {
    'keyword': 'Python 爬虫',
    'page': 1,
    'page_size': 20
}
```

## 八、POST 表单：data

GET 常用于读取数据。

POST 常用于提交数据。

提交普通表单时，使用 `data`：

```python
import requests

data = {
    'username': 'demo',
    'password': '123456'
}

response = requests.post('https://httpbin.org/post', data=data, timeout=10)
response.raise_for_status()

print(response.json()['form'])
```

这里：

```python
data=data
```

表示把字典作为表单数据提交。

注意：这个例子只是说明表单提交方式。真实项目里不要把密码写死在代码里，也不要采集或提交不该处理的账号信息。

## 九、POST JSON：json

现在很多接口使用 JSON 请求体。

这时使用 `json` 参数：

```python
import requests

payload = {
    'title': 'Python 爬虫入门',
    'category': 'Python'
}

response = requests.post('https://httpbin.org/post', json=payload, timeout=10)
response.raise_for_status()

data = response.json()
print(data['json'])
```

`json=payload` 会做两件事：

- 把 Python 字典转换成 JSON 字符串。
- 设置合适的 JSON 请求头。

新手容易混淆 `data` 和 `json`：

| 参数 | 发送什么 | 常见场景 |
| --- | --- | --- |
| `params` | URL 查询参数 | 搜索、分页、筛选 |
| `data` | 表单请求体 | 传统表单提交 |
| `json` | JSON 请求体 | 现代 API 接口 |

如果接口文档写的是：

```http
Content-Type: application/json
```

通常使用：

```python
json=payload
```

如果接口文档写的是：

```http
application/x-www-form-urlencoded
```

通常使用：

```python
data=form_data
```

## 十、PUT、PATCH、DELETE、HEAD、OPTIONS

这些方法在传统网页爬虫里不一定高频，但在企业接口对接、后台管理系统、接口测试里很常见。

### 1. PUT：整体更新

```python
import requests

payload = {
    'title': '更新后的标题',
    'category': 'Python'
}

response = requests.put('https://httpbin.org/put', json=payload, timeout=10)
response.raise_for_status()

print(response.json()['json'])
```

PUT 常用于“整体替换一个资源”。

### 2. PATCH：局部更新

```python
import requests

payload = {
    'title': '只修改标题'
}

response = requests.patch('https://httpbin.org/patch', json=payload, timeout=10)
response.raise_for_status()

print(response.json()['json'])
```

PATCH 常用于“只更新部分字段”。

### 3. DELETE：删除资源

```python
import requests

response = requests.delete('https://httpbin.org/delete', timeout=10)
response.raise_for_status()

print(response.status_code)
```

DELETE 通常用于删除资源。真实项目里要特别谨慎，不要在生产环境随便运行删除请求。

### 4. HEAD：只看响应头

```python
import requests

response = requests.head('https://httpbin.org/get', timeout=10)
response.raise_for_status()

print(response.headers)
```

HEAD 不下载响应正文，常用于检查：

- 文件是否存在。
- 文件类型。
- 文件大小。
- 是否发生跳转。

### 5. OPTIONS：查看服务支持能力

```python
import requests

response = requests.options('https://httpbin.org/get', timeout=10)
response.raise_for_status()

print(response.headers)
```

OPTIONS 在浏览器跨域、API 调试中更常见。入门阶段知道它存在即可。

## 十一、设置请求头：headers

请求头是浏览器或程序发给服务器的附加信息。

入门阶段最常见的是 `User-Agent`：

```python
import requests

headers = {
    'User-Agent': 'PythonLearningBot/1.0 (+learning example)'
}

response = requests.get('https://httpbin.org/headers', headers=headers, timeout=10)
response.raise_for_status()

print(response.json()['headers'])
```

这里的 `User-Agent` 不是让你伪装成浏览器横冲直撞。

更好的理解是：给你的学习脚本一个明确身份，便于对方知道这是一个程序请求。

企业接口里还常见这些请求头：

| 请求头 | 作用 |
| --- | --- |
| `User-Agent` | 说明客户端身份 |
| `Accept` | 告诉服务器希望接收什么格式 |
| `Content-Type` | 告诉服务器请求体是什么格式 |
| `Authorization` | 携带认证信息 |

如果涉及 `Authorization`、Token、Cookie，不要直接打印到日志里，也不要写进公开代码仓库。

## 十二、Cookie 和 Session

Cookie 可以理解成服务器给客户端保存的一小段状态。

如果只是单次请求，可以直接传 `cookies`：

```python
import requests

cookies = {
    'theme': 'light'
}

response = requests.get('https://httpbin.org/cookies', cookies=cookies, timeout=10)
response.raise_for_status()

print(response.json())
```

如果要连续请求同一个网站，更推荐使用 `Session`。

`Session` 有两个常见作用：

- 复用连接，提高连续请求同一个站点时的效率。
- 保持公共配置，比如请求头、Cookie、认证信息。

示例：

```python
import requests

session = requests.Session()
session.headers.update({
    'User-Agent': 'PythonLearningBot/1.0'
})

session.get('https://httpbin.org/cookies/set/session_id/abc123', timeout=10)
response = session.get('https://httpbin.org/cookies', timeout=10)
response.raise_for_status()

print(response.json())
```

企业项目里，只要是批量请求同一个站点或同一组接口，通常都会封装一个 `Session`，而不是到处散写 `requests.get()`。

## 十三、Response 对象体系

`requests` 返回的不是普通字符串，而是 `Response` 对象。

常用属性和方法如下：

| 写法 | 含义 | 常见用途 |
| --- | --- | --- |
| `response.status_code` | 状态码 | 判断请求是否成功 |
| `response.url` | 最终 URL | 查看跳转后地址或参数拼接结果 |
| `response.headers` | 响应头 | 查看内容类型、文件大小等 |
| `response.encoding` | 文本编码 | 排查中文乱码 |
| `response.text` | 文本内容 | HTML、普通文本 |
| `response.content` | 二进制内容 | 图片、文件、压缩包 |
| `response.json()` | JSON 转字典或列表 | API 返回 JSON 时使用 |
| `response.history` | 跳转历史 | 排查 301、302 |
| `response.request` | 实际发出的请求 | 调试请求头、方法、URL |

例子：

```python
import requests

response = requests.get('https://httpbin.org/json', timeout=10)
response.raise_for_status()

print(response.status_code)
print(response.headers.get('Content-Type'))
print(response.url)
print(response.json())
```

注意：

```python
response.json()
```

只有在响应内容真的是合法 JSON 时才能用。

如果返回的是 HTML，你却调用 `response.json()`，就会报错。

排查时可以先打印前 500 个字符：

```python
print(response.text[:500])
```

如果你看到的是：

```html
<html>
```

那大概率是 HTML。

如果你看到的是：

```json
{"name": "demo"}
```

那大概率是 JSON。

## 十四、状态码和 raise_for_status()

状态码是判断请求结果的第一道信号。

常见状态码：

| 状态码 | 含义 | 新手处理建议 |
| --- | --- | --- |
| 200 | 请求成功 | 可以继续看内容 |
| 201 | 创建成功 | 常见于 POST 创建资源 |
| 204 | 成功但没有响应体 | 不要再调用 `json()` |
| 301 / 302 | 跳转 | 打印 `response.url` 和 `response.history` |
| 400 | 请求参数错误 | 检查参数 |
| 401 | 未登录或身份无效 | 不要绕过登录限制 |
| 403 | 没有权限访问 | 停止抓取或换公开目标 |
| 404 | 页面不存在 | 检查 URL |
| 429 | 请求太频繁 | 降低频率或停止 |
| 500 | 服务器内部错误 | 稍后再试 |
| 502 / 503 / 504 | 服务临时不可用 | 可以有限重试 |

请求失败时，`requests.get()` 本身不一定会直接报错。

比如访问：

```python
import requests

response = requests.get('https://httpbin.org/status/404', timeout=10)

print(response.status_code)
print('程序继续执行')
```

它会打印 `404`，但程序仍然继续。

如果你想让 4xx / 5xx 状态码变成异常，可以使用：

```python
response.raise_for_status()
```

完整例子：

```python
import requests

response = requests.get('https://httpbin.org/status/404', timeout=10)
response.raise_for_status()

print('如果状态码失败，这行不会执行')
```

这样能更早发现请求失败，而不是后面解析 HTML 或 JSON 时才发现数据不对。

## 十五、timeout 为什么必须写

不写 `timeout` 时，如果网络一直没响应，程序可能卡很久。

入门写法：

```python
response = requests.get(url, timeout=10)
```

企业脚本里更常见的是拆成连接超时和读取超时：

```python
response = requests.get(url, timeout=(3, 10))
```

含义：

- `3`：连接服务器最多等 3 秒。
- `10`：服务器连接成功后，读取响应最多等 10 秒。

如果你抓取很多页面，更应该设置超时，否则某一个请求卡住，整个脚本都会停在那里。

## 十六、异常处理体系

真实网络请求可能会失败。

常见原因包括：

- 网络超时。
- 域名无法访问。
- 状态码是 404、500。
- 跳转次数太多。
- 响应不是 JSON。

可以这样写：

```python
import requests

url = 'https://httpbin.org/status/404'

try:
    response = requests.get(url, timeout=(3, 10))
    response.raise_for_status()
    print(response.text)
except requests.exceptions.Timeout:
    print('请求超时，请稍后重试')
except requests.exceptions.HTTPError as error:
    print(f'HTTP 状态异常：{error}')
except requests.exceptions.TooManyRedirects:
    print('跳转次数过多')
except requests.exceptions.RequestException as error:
    print(f'请求失败：{error}')
```

这里的顺序是：

1. 先发送请求。
2. 再用 `raise_for_status()` 检查状态码。
3. 如果出错，就进入对应的 `except`。

`RequestException` 是很多 requests 异常的父类。

如果你暂时分不清具体异常，至少要捕获它：

```python
import requests

try:
    response = requests.get(url, timeout=(3, 10))
    response.raise_for_status()
except requests.exceptions.RequestException as error:
    print(f'请求失败：{error}')
```

JSON 解析也要单独注意：

```python
try:
    data = response.json()
except requests.exceptions.JSONDecodeError:
    print('响应内容不是合法 JSON')
```

## 十七、重定向：allow_redirects 和 history

有些 URL 会跳转。

比如旧地址跳到新地址，HTTP 跳到 HTTPS。

默认情况下，GET 请求会自动跟随重定向。

你可以查看最终 URL：

```python
print(response.url)
```

也可以查看跳转历史：

```python
for item in response.history:
    print(item.status_code, item.url)
```

如果不想自动跳转，可以写：

```python
response = requests.get(
    'https://httpbin.org/redirect/1',
    allow_redirects=False,
    timeout=10
)

print(response.status_code)
print(response.headers.get('Location'))
```

爬虫里遇到跳转时，要确认最终 URL 是否仍然是你允许访问的范围。

## 十八、请求前先看 robots.txt

大多数网站会在根路径提供 `robots.txt`。

例如：

```text
https://example.com/robots.txt
```

它用于说明哪些路径允许爬虫访问，哪些路径不希望爬虫访问。

Python 标准库提供了 `urllib.robotparser` 来读取 robots 规则：

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

如果返回：

```text
True
```

表示按当前规则可以访问。

如果返回：

```text
False
```

就不要抓取这个地址。

可以把检查逻辑单独放进函数：

```python
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser


def can_fetch_url(url, user_agent='PythonLearningBot'):
    parsed_url = urlparse(url)
    site_root = f'{parsed_url.scheme}://{parsed_url.netloc}'
    robots_url = urljoin(site_root, '/robots.txt')

    parser = RobotFileParser()
    parser.set_url(robots_url)
    parser.read()

    return parser.can_fetch(user_agent, url)


target_url = 'https://www.python.org/'

if can_fetch_url(target_url):
    print('允许访问')
else:
    print('robots.txt 不允许访问')
```

这里有两个新工具：

- `urlparse()`：拆解 URL。
- `urljoin()`：拼接 URL。

现在不用背，先知道它们能帮你从目标地址推导出 robots.txt 地址。

## 十九、一个更完整的请求模板

下面是入门阶段比较稳的请求模板：

```python
import requests
from urllib.robotparser import RobotFileParser

url = 'https://www.python.org/'
robots_url = 'https://www.python.org/robots.txt'
user_agent = 'PythonLearningBot'

parser = RobotFileParser()
parser.set_url(robots_url)
parser.read()

if not parser.can_fetch(user_agent, url):
    print('robots.txt 不允许访问，停止请求')
else:
    try:
        response = requests.get(
            url,
            headers={'User-Agent': user_agent},
            timeout=(3, 10)
        )
        response.raise_for_status()

        print(response.status_code)
        print(response.text[:500])
    except requests.exceptions.RequestException as error:
        print(f'请求失败：{error}')
```

这段代码还没有解析 HTML，只是完成了请求前检查和请求结果检查。

这一步做好，后面解析会轻松很多。

## 二十、企业开发中 requests 的成熟封装

前面讲的是 `requests` 的基础能力。企业项目里，更常见的是把这些能力组织成统一请求层。

成熟请求层通常会统一处理：

- 公共请求头。
- `Session` 复用。
- 超时时间。
- 有边界的重试。
- 请求频率。
- JSON 解析。
- 文本和二进制下载。
- 错误日志。
- 敏感信息脱敏。

### 1. 用配置集中管理公共参数

不要把超时、请求头、间隔时间散落在各个函数里。

```python
REQUEST_TIMEOUT = (3, 10)
REQUEST_INTERVAL_SECONDS = 1
USER_AGENT = 'PythonLearningBot/1.0 (+learning example)'
```

这样后续要调整策略，只改一个地方。

### 2. 使用 Session 作为统一入口

```python
import requests

session = requests.Session()
session.headers.update({
    'User-Agent': USER_AGENT,
    'Accept': 'text/html,application/json'
})
```

后续请求都通过 `session` 发出：

```python
response = session.get(url, timeout=REQUEST_TIMEOUT)
```

### 3. 封装通用 request 函数

真实项目里，不建议每个地方都散落一段请求代码。

可以先封装一个函数：

```python
import time
import requests

REQUEST_TIMEOUT = (3, 10)
REQUEST_INTERVAL_SECONDS = 1

session = requests.Session()
session.headers.update({
    'User-Agent': 'PythonLearningBot/1.0'
})


def request_with_limit(method, url, **kwargs):
    time.sleep(REQUEST_INTERVAL_SECONDS)

    response = session.request(
        method,
        url,
        timeout=kwargs.pop('timeout', REQUEST_TIMEOUT),
        **kwargs
    )
    response.raise_for_status()

    return response
```

使用时：

```python
response = request_with_limit('GET', 'https://httpbin.org/get')
print(response.text[:200])
```

好处是：

- 请求入口统一。
- 超时策略统一。
- 请求频率统一。
- 后续要加日志、重试、认证时，不需要到处改。

### 4. 按返回类型拆出函数

企业脚本里常见做法是把“拿文本”“拿 JSON”“下载文件”拆开。

```python
def fetch_text(url, params=None):
    response = request_with_limit('GET', url, params=params)
    return response.text


def fetch_json(url, params=None):
    response = request_with_limit('GET', url, params=params)
    return response.json()


def post_json(url, payload):
    response = request_with_limit('POST', url, json=payload)
    return response.json()
```

这样业务代码会更清楚：

```python
html_text = fetch_text('https://example.com/articles')
data = fetch_json('https://httpbin.org/json')
```

### 5. 有边界的自动重试

请求失败时可以重试，但不要无限重试。

适合重试的情况：

- 临时网络失败。
- `502`、`503`、`504` 这类服务临时异常。
- 短暂超时。

不适合盲目重试的情况：

- `401`：未登录。
- `403`：没有权限。
- `404`：地址不存在。
- `429`：请求太频繁。

入门可以先手写有限重试：

```python
import time
import requests


def fetch_text_with_retry(url, retry_count=3):
    for attempt in range(1, retry_count + 1):
        try:
            response = session.get(url, timeout=(3, 10))
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as error:
            print(f'第 {attempt} 次请求失败：{error}')

            if attempt == retry_count:
                raise

            time.sleep(attempt)
```

更成熟的项目里，也可以用 `HTTPAdapter` 和 `Retry` 配置重试：

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()

retry = Retry(
    total=3,
    connect=3,
    read=3,
    status=3,
    backoff_factor=0.5,
    status_forcelist=[502, 503, 504],
    allowed_methods=['GET', 'HEAD', 'OPTIONS']
)

adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)
session.mount('https://', adapter)
```

注意 `allowed_methods`。

GET、HEAD、OPTIONS 这类读取型请求相对适合重试。

POST 可能创建数据或提交订单，盲目重试可能造成重复提交，所以要根据业务幂等性决定。

### 6. 分页请求是高频场景

很多列表页都有分页。

常见套路是：

```python
import time

all_records = []

for page in range(1, 11):
    response = session.get(
        'https://httpbin.org/get',
        params={'page': page},
        timeout=(3, 10)
    )
    response.raise_for_status()

    data = response.json()
    all_records.append(data['args'])

    time.sleep(1)

print(all_records)
```

真实接口里通常还要判断：

- 当前页是否为空。
- 是否还有下一页。
- 是否达到最大页数。
- 是否出现重复数据。
- 请求频率是否符合目标站点规则。

### 7. 下载大文件要使用 stream

如果下载图片、附件或大文件，不建议一次性读取全部内容。

可以使用 `stream=True` 分块写入：

```python
import requests

url = 'https://httpbin.org/image/png'

with requests.get(url, stream=True, timeout=(3, 20)) as response:
    response.raise_for_status()

    with open('image.png', 'wb') as file:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                file.write(chunk)
```

这在媒体资源采集、附件下载、备份脚本里很常见。

如果只是 HTML 页面，不需要 `stream=True`。

### 8. 上传文件：files

爬虫里上传文件不高频，但 `requests` 模块本身经常用于接口对接和自动化测试。

上传文件使用 `files`：

```python
import requests

with open('article.csv', 'rb') as file:
    response = requests.post(
        'https://httpbin.org/post',
        files={'file': file},
        timeout=(3, 20)
    )
    response.raise_for_status()

print(response.status_code)
```

这里文件要用二进制方式打开：

```python
open('article.csv', 'rb')
```

### 9. 认证：auth 和 Authorization

有些接口需要认证。

Basic Auth 可以这样写：

```python
import requests

response = requests.get(
    'https://httpbin.org/basic-auth/user/pass',
    auth=('user', 'pass'),
    timeout=10
)

print(response.status_code)
```

很多企业接口使用 Token，通常放在请求头里：

```python
headers = {
    'Authorization': 'Bearer your-token'
}

response = requests.get('https://example.com/api/profile', headers=headers, timeout=10)
```

注意：

- 不要把真实 Token 写进教程、日志或 Git 仓库。
- 本地开发可以用环境变量读取敏感配置。
- 如果接口需要登录、验证码、付费权限，不要绕过限制。

### 10. 代理和证书边界

`requests` 支持 `proxies` 和 `verify` 参数。

企业内网环境有时会通过公司代理访问外部服务：

```python
proxies = {
    'http': 'http://proxy.example.com:8080',
    'https': 'http://proxy.example.com:8080'
}

response = requests.get('https://httpbin.org/get', proxies=proxies, timeout=10)
```

HTTPS 证书校验默认开启：

```python
verify=True
```

不要为了省事随便写：

```python
verify=False
```

关闭证书校验会带来安全风险。只有在明确的内网测试、临时排查场景下才考虑，并且要知道自己在做什么。

代理也不应该被用来绕过网站限制。

### 11. 日志里不要打印敏感信息

请求失败时可以记录：

- URL。
- 状态码。
- 请求方法。
- 错误类型。
- 重试次数。

但不要把下面内容直接打印到日志：

- Cookie。
- Token。
- 密码。
- 身份证、手机号等隐私字段。
- 完整请求头里的认证信息。

可以这样记录：

```python
print(f'请求失败：method=GET, url={response.url}, status={response.status_code}')
```

不要这样：

```python
print(response.request.headers)
```

后者可能把敏感请求头打出来。

## 二十一、新手爬虫的基本礼貌

写爬虫时至少做到：

- 不抓取 robots.txt 禁止的路径。
- 不高频请求，不要几毫秒请求一次。
- 设置超时时间。
- 遇到 403、429、5xx 时停止或降低频率。
- 只抓取学习、公开、允许访问的数据。
- 不绕过登录、验证码、付费墙或反爬限制。
- 不采集隐私、账号、联系方式等敏感信息。
- 不用代理、伪造身份等方式绕过对方限制。

如果只是练习，可以优先使用：

- `https://httpbin.org/`
- 自己写的本地 HTML 文件。
- 官方文档、示例页面等公开内容。

## 二十二、常见错误和排查

### 1. ModuleNotFoundError: No module named 'requests'

说明当前 Python 环境没有安装 `requests`。

运行：

```powershell
python -m pip install requests
```

如果你用了虚拟环境，确认已经激活。

### 2. 请求一直卡住

检查是否写了：

```python
timeout=10
```

或：

```python
timeout=(3, 10)
```

### 3. response.json() 报错

原因通常是返回内容不是 JSON。

先打印：

```python
print(response.text[:500])
```

如果看到 `<html>`，说明它是 HTML，不应该直接用 `json()`。

如果状态码是 `204`，表示成功但没有响应体，也不要调用 `json()`。

### 4. 状态码 403

说明服务器拒绝访问。

不要试图绕过限制。可以换一个公开允许访问的练习目标。

### 5. 状态码 429

说明请求太频繁。

应该停止或降低频率。

### 6. 中文乱码

先查看响应头：

```python
print(response.headers.get('Content-Type'))
print(response.encoding)
```

如果确认编码识别错误，可以手动设置：

```python
response.encoding = 'utf-8'
print(response.text)
```

但不要盲目设置。先看真实响应头和页面内容。

### 7. POST 接口收不到数据

检查接口到底要表单还是 JSON。

表单：

```python
requests.post(url, data=form_data)
```

JSON：

```python
requests.post(url, json=payload)
```

这两个不要混用。

### 8. 重试后数据重复

如果是 POST、导入、创建订单、创建文章这类操作，重试可能产生重复数据。

企业项目里要先确认：

- 接口是否幂等。
- 是否有唯一请求 ID。
- 是否能用业务唯一键去重。
- 是否允许失败后人工处理。

## 二十三、小练习

### 练习 1：GET 查询参数

写一个脚本完成下面任务：

1. 请求 `https://httpbin.org/get`。
2. 添加查询参数 `keyword=python`、`page=1`。
3. 设置 `timeout=10`。
4. 打印状态码。
5. 打印最终 URL。
6. 打印返回 JSON 里的 `args` 字段。

参考代码：

```python
import requests

response = requests.get(
    'https://httpbin.org/get',
    params={'keyword': 'python', 'page': 1},
    timeout=10
)

response.raise_for_status()
data = response.json()

print(response.status_code)
print(response.url)
print(data['args'])
```

### 练习 2：POST JSON

向 `https://httpbin.org/post` 提交一段 JSON：

```python
import requests

payload = {
    'title': 'Python 爬虫入门',
    'category': 'Python'
}

response = requests.post(
    'https://httpbin.org/post',
    json=payload,
    timeout=10
)

response.raise_for_status()
data = response.json()

print(data['json'])
```

### 练习 3：封装 fetch_json

把 GET 请求 JSON 的逻辑封装成函数：

```python
import requests


def fetch_json(url, params=None):
    response = requests.get(url, params=params, timeout=(3, 10))
    response.raise_for_status()
    return response.json()


data = fetch_json('https://httpbin.org/get', params={'page': 1})
print(data['args'])
```

如果你能看懂这些代码，下一篇学习 `lxml` 解析 HTML 就会顺很多。

## 本篇小结

这一篇不是只学 `requests.get()`，而是建立 `requests` 请求体系：

- HTTP 请求由方法、URL、请求头、请求体组成。
- `requests.get()` 常用于读取网页、列表和详情。
- `params` 用于 URL 查询参数。
- `requests.post()` 可以用 `data` 发送表单，也可以用 `json` 发送 JSON。
- `put`、`patch`、`delete`、`head`、`options` 在接口对接和企业开发中也很常见。
- `headers` 用于设置请求头，认证信息不要写进日志。
- `cookies` 可以传 Cookie，`Session` 可以保持会话和复用连接。
- `Response` 对象里有 `status_code`、`url`、`headers`、`text`、`content`、`json()`、`history` 等常用能力。
- `timeout` 必须设置，企业脚本里常用 `(连接超时, 读取超时)`。
- `raise_for_status()` 可以把 4xx / 5xx 状态码转成异常。
- 请求失败要捕获 `Timeout`、`HTTPError`、`TooManyRedirects`、`RequestException`。
- 写爬虫前要检查 robots.txt，并控制请求频率。
- 企业项目里通常会封装统一请求层，集中处理 Session、超时、重试、限流、日志和敏感信息边界。

下一篇我们会把请求到的 HTML 交给 `lxml`，再用 XPath 提取标题、链接和日期，并保存为 CSV。

参考资料：

- Requests 官方文档：https://requests.readthedocs.io/
- Python `urllib.robotparser` 官方文档：https://docs.python.org/3/library/urllib.robotparser.html
