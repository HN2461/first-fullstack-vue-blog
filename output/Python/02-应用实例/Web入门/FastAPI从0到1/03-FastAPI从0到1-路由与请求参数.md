---
title: FastAPI 从 0 到 1 03：路由与请求参数
slug: fastapi-routing-request-parameters
summary: 在同一个文章 API 中实现列表、详情和创建，重点理解 Path、Query、JSON Body 的来源、校验、调用方法和错误响应。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - 路由
  - 参数校验
status: draft
sortOrder: 40
cover:
---

# FastAPI 从 0 到 1 03：路由与请求参数

上一章的接口没有真正接收业务数据。本章继续使用 `beginner-article-api` 项目，完成三条文章接口：

```text
GET  /articles              查看文章列表
GET  /articles/{article_id} 查看一篇文章
POST /articles              创建一篇文章
```

完成后你应该能回答：

- 路径参数 Path、查询参数 Query、请求体 Body 分别放在哪里。
- FastAPI 为什么能把字符串转换成整数。
- 为什么错误数据会得到 422，而不是进入路由函数。
- 为什么文章 ID 不能由客户端在创建时随便指定。
- 怎样在 Swagger UI 和 PowerShell 中发送请求。

## 先认识三种最重要的参数

先看三个请求：

```http
GET /articles/3
GET /articles?keyword=python
POST /articles
Content-Type: application/json

{
  "title": "FastAPI 入门",
  "content": "这是正文"
}
```

对应关系：

| 参数 | 在请求中的位置 | 例子 | 适合表达 |
| --- | --- | --- | --- |
| Path | URL 路径内部 | `/articles/3` 中的 `3` | 明确指定一个资源 |
| Query | `?` 后的查询字符串 | `?keyword=python` | 筛选、分页、排序 |
| Body | 请求体 | 创建文章的 JSON | 结构化业务数据 |

小白先掌握这三种，就能完成绝大多数 CRUD 接口。

## 本章完整代码

用下面内容完整替换上一章的 `main.py`。这是完整文件，可以直接运行：

```python
from typing import Annotated

from fastapi import FastAPI, HTTPException, Path, Query, status
from pydantic import BaseModel, Field

app = FastAPI(
    title='小白文章 API',
    version='0.2.0'
)


class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=10_000)


articles = [
    {
        'id': 1,
        'title': '认识 FastAPI',
        'content': '这是第一篇示例文章'
    },
    {
        'id': 2,
        'title': '学习请求参数',
        'content': '这是第二篇示例文章'
    }
]


@app.get('/health', tags=['system'])
def health_check() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/articles', tags=['articles'])
def list_articles(
    keyword: Annotated[
        str | None,
        Query(min_length=1, max_length=50, description='按标题搜索')
    ] = None
) -> dict:
    if keyword is None:
        result = articles
    else:
        result = [
            article
            for article in articles
            if keyword.casefold() in article['title'].casefold()
        ]

    return {
        'items': result,
        'total': len(result)
    }


@app.get('/articles/{article_id}', tags=['articles'])
def get_article(
    article_id: Annotated[
        int,
        Path(gt=0, description='文章 ID')
    ]
) -> dict:
    for article in articles:
        if article['id'] == article_id:
            return article

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail='文章不存在'
    )


@app.post(
    '/articles',
    tags=['articles'],
    status_code=status.HTTP_201_CREATED
)
def create_article(payload: ArticleCreate) -> dict:
    article = {
        'id': len(articles) + 1,
        'title': payload.title,
        'content': payload.content
    }
    articles.append(article)
    return article
```

保存后，原来的 Uvicorn 会自动重载。若已经停止，在项目根目录重新执行：

```powershell
uvicorn main:app --reload
```

打开：

```text
http://127.0.0.1:8000/docs
```

现在应该看到 `system` 和 `articles` 两组接口。

## 先运行，再解释

按下面顺序调用，先建立直观感受。

### 1. 查看全部文章

访问：

```text
http://127.0.0.1:8000/articles
```

预期响应：

```json
{
  "items": [
    {
      "id": 1,
      "title": "认识 FastAPI",
      "content": "这是第一篇示例文章"
    },
    {
      "id": 2,
      "title": "学习请求参数",
      "content": "这是第二篇示例文章"
    }
  ],
  "total": 2
}
```

### 2. 按关键词搜索

访问：

```text
http://127.0.0.1:8000/articles?keyword=FastAPI
```

预期只返回标题中包含 `FastAPI` 的文章，`total` 为 1。

### 3. 查看文章详情

访问：

```text
http://127.0.0.1:8000/articles/1
```

预期返回 ID 为 1 的文章。

再访问：

```text
http://127.0.0.1:8000/articles/999
```

预期状态码是 404：

```json
{
  "detail": "文章不存在"
}
```

### 4. 创建文章

浏览器地址栏只能方便地发送 GET。创建文章使用 `/docs`：

1. 展开 `POST /articles`。
2. 点击 `Try it out`。
3. 输入 JSON。
4. 点击 `Execute`。

请求体：

```json
{
  "title": "我的第一篇文章",
  "content": "我已经会用 JSON 创建文章了"
}
```

预期状态码为 201，响应类似：

```json
{
  "id": 3,
  "title": "我的第一篇文章",
  "content": "我已经会用 JSON 创建文章了"
}
```

再调用 `GET /articles`，新文章应该出现在列表中。

## Path：路径参数怎样工作

代码：

```python
@app.get('/articles/{article_id}')
def get_article(
    article_id: Annotated[int, Path(gt=0)]
) -> dict:
    return {'article_id': article_id}
```

逐层拆解：

1. 路径模板中写了 `{article_id}`。
2. 函数参数也叫 `article_id`，名字必须对应。
3. `int` 要求 FastAPI 把路径字符串转换成整数。
4. `Path(gt=0)` 进一步要求整数必须大于 0。
5. 转换和校验成功后，函数才会执行。

`gt` 是 greater than 的缩写：

| 写法 | 含义 |
| --- | --- |
| `gt=0` | 大于 0 |
| `ge=0` | 大于等于 0 |
| `lt=100` | 小于 100 |
| `le=100` | 小于等于 100 |

故意测试：

```text
/articles/abc
/articles/0
/articles/-1
```

它们都会返回 422。`abc` 不能转换成整数，`0` 和 `-1` 不满足 `gt=0`。

这类错误由 FastAPI 在进入函数前处理，所以你写的 `for` 循环根本不会执行。

## Query：查询参数怎样工作

代码：

```python
keyword: Annotated[
    str | None,
    Query(min_length=1, max_length=50)
] = None
```

拆开阅读：

- `keyword`：Python 函数参数名，也是 URL 中的查询参数名。
- `str | None`：值可以是字符串，也可以是 `None`。
- `Query(...)`：明确告诉 FastAPI 它来自查询字符串。
- `min_length=1`：只要传了，就至少有 1 个字符。
- `max_length=50`：最多 50 个字符。
- `= None`：整个参数可以不传。

三种请求对应的值：

| 请求 | 函数中的 `keyword` |
| --- | --- |
| `/articles` | `None` |
| `/articles?keyword=python` | `'python'` |
| `/articles?keyword=` | 校验失败，返回 422 |

为什么筛选条件放 Query，而不是 Path？因为 `/articles` 表示文章集合，关键词只是“怎样筛选这批文章”，不是一个新的资源身份。

## 列表筛选代码逐行解释

```python
if keyword is None:
    result = articles
else:
    result = [
        article
        for article in articles
        if keyword.casefold() in article['title'].casefold()
    ]
```

普通话翻译：

```text
如果没有关键词
  -> 结果就是所有文章
否则
  -> 遍历所有文章
  -> 只保留标题中包含关键词的文章
```

`casefold()` 用于不区分大小写比较。这样搜索 `fastapi` 也能匹配标题中的 `FastAPI`。

列表推导式如果暂时看不熟，可以等价写成：

```python
result = []
for article in articles:
    title = article['title'].casefold()
    if keyword.casefold() in title:
        result.append(article)
```

两种写法结果相同。小白优先选择自己能读懂的版本，不必为了少写几行牺牲理解。

## Body：JSON 请求体怎样工作

创建文章要一次提交标题和正文，所以使用 JSON Body。

### 先定义数据形状

```python
class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=10_000)
```

`ArticleCreate` 是 Pydantic 模型，描述创建文章时客户端允许提交的字段：

- 必须有 `title`，而且长度是 1 到 100。
- 必须有 `content`，而且长度是 1 到 10000。
- 没有声明 `id`，因为 ID 应由服务端生成。

下一章会深入讲 Pydantic。本章先把它理解为“请求体检查表”。

### FastAPI 怎样知道它来自 Body

```python
def create_article(payload: ArticleCreate) -> dict:
```

当一个函数参数的类型是 Pydantic 模型时，FastAPI 默认从 JSON 请求体中读取它。

合法 JSON：

```json
{
  "title": "FastAPI 入门",
  "content": "正文"
}
```

FastAPI 校验后创建 `ArticleCreate` 对象，所以函数里用：

```python
payload.title
payload.content
```

这不是字典下标，而是对象属性。

### JSON 不是 Python 字典文本

下面是合法 JSON：

```json
{"title": "标题", "content": "正文"}
```

下面不是合法 JSON：

```text
{'title': '标题', 'content': '正文'}
```

JSON 的键和字符串必须使用双引号。Python 源码中的字典可以使用单引号，这两个场景不要混淆。

## 创建逻辑逐行解释

```python
article = {
    'id': len(articles) + 1,
    'title': payload.title,
    'content': payload.content
}
articles.append(article)
return article
```

流程：

1. 创建一个新的 Python 字典。
2. 临时用“当前文章数加 1”生成 ID。
3. 从通过校验的 `payload` 读取标题和正文。
4. `append` 把新字典加入全局列表。
5. 把新文章返回给客户端。

这只是教学用内存存储，有三个明确限制：

- 应用重启后，新建的数据会消失。
- 多进程运行时，每个进程有自己的列表，数据不一致。
- 删除文章后再用 `len + 1` 生成 ID，可能重复。

这些不是一个线上项目能接受的设计。第 07 章会用数据库和数据库主键替换它。本阶段先用最少概念理解请求链路。

## 201、404 和 422 各表示什么

### 201 Created

```python
status_code=status.HTTP_201_CREATED
```

创建新资源成功使用 201，比笼统返回 200 更准确。`status.HTTP_201_CREATED` 的值就是整数 201，但名字更容易读懂。

### 404 Not Found

```python
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail='文章不存在'
)
```

循环结束仍没有返回，说明指定 ID 不存在。`raise` 抛出 HTTP 异常，当前函数立即停止，FastAPI 返回 404。

### 422 Unprocessable Entity

参数能作为 HTTP 请求到达服务器，但不符合类型或字段约束时，FastAPI 默认返回 422。例如：

- `article_id` 传字母。
- 标题为空字符串。
- 缺少正文。
- 关键词超过 50 个字符。

422 通常说明客户端提交的数据结构或值不合法，不表示服务器崩溃。

## 用 PowerShell 完成完整流程

创建：

```powershell
$body = @{
    title = 'PowerShell 创建的文章'
    content = '这是请求正文'
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri 'http://127.0.0.1:8000/articles' `
    -Method Post `
    -ContentType 'application/json' `
    -Body $body
```

查询列表：

```powershell
Invoke-RestMethod `
    -Uri 'http://127.0.0.1:8000/articles?keyword=PowerShell' `
    -Method Get
```

反引号 `` ` `` 是 PowerShell 的换行续写符，后面不能再放空格。

## 其他参数来源先认识即可

真实项目还会遇到 Header、Cookie 和 Form。本节代码都是局部示例，不要直接粘到当前 `main.py`，等具体业务需要时再使用。

### Header

```python
from fastapi import Header


def read_request_id(
    x_request_id: Annotated[str | None, Header()] = None
):
    return {'request_id': x_request_id}
```

Python 参数 `x_request_id` 默认对应请求头 `X-Request-ID`。认证令牌、内容类型、请求追踪信息常放 Header。

### Cookie

```python
from fastapi import Cookie


def read_session(
    session_id: Annotated[str | None, Cookie()] = None
):
    return {'has_session': session_id is not None}
```

Cookie 常用于浏览器会话。登录 Cookie 还涉及 `HttpOnly`、`Secure`、`SameSite` 和 CSRF，第 09 章再讲。

### Form

需要额外安装：

```powershell
python -m pip install python-multipart
```

局部示例：

```python
from fastapi import Form


def login(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()]
):
    raise NotImplementedError('这里只演示表单参数声明')
```

表单不是 JSON。普通前后端分离业务接口通常优先使用 JSON；OAuth2 登录和文件上传会用到表单编码。

## 参数来源速查

FastAPI 的常见判断规则：

| 代码特征 | 默认来源 |
| --- | --- |
| 名字出现在路径 `{...}` | Path |
| `int`、`str` 等简单类型 | Query，路径同名参数除外 |
| Pydantic `BaseModel` | JSON Body |
| `Header()` | Header |
| `Cookie()` | Cookie |
| `Form()` | 表单 |
| `File()` / `UploadFile` | multipart 文件 |
| `Depends()` | 依赖注入，不是普通业务参数 |

不确定时，在参数中显式写 `Path()`、`Query()` 等，代码和 OpenAPI 都更清楚。

## 常见错误

### 请求 POST 却在浏览器地址栏输入 URL

地址栏通常只发送 GET。POST、PATCH、DELETE 请使用 `/docs`、PowerShell、curl 或 API 客户端。

### POST 返回 422

按顺序检查：

1. `Content-Type` 是否是 `application/json`。
2. JSON 是否使用双引号。
3. 字段名是否正好是 `title` 和 `content`。
4. 是否漏了必填字段。
5. 字符串是否为空或超过长度。

### 返回 405

路径存在，但请求方法不对。例如用 GET 请求只定义了 POST 的创建接口。

### 新文章重启后消失

这是当前使用内存列表的预期限制，不是 FastAPI 丢数据。数据库章节会解决。

### 搜索中文或特殊字符时 URL 很奇怪

客户端会对 URL 进行百分号编码，服务端会解码。正常使用浏览器或 `Invoke-RestMethod` 即可，不要手工拼复杂编码。

## 本章动手改

1. 给列表增加 `limit` 查询参数，范围 1 到 100，默认 20。
2. 使用 `result[:limit]` 限制返回数量。
3. 给 `ArticleCreate` 增加可选字段 `summary`，最多 200 字。
4. 故意提交空标题，找到 422 响应中指向 `title` 的错误位置。
5. 新增 `GET /articles/count` 时，把它放在 `/{article_id}` 前面，并解释原因。

第 1 题参数参考：

```python
limit: Annotated[int, Query(ge=1, le=100)] = 20
```

## 本章完成检查

- 能从 URL 中指出 Path 和 Query。
- 能用 JSON Body 创建文章。
- 能解释 `Annotated[int, Path(gt=0)]`。
- 能区分 201、404、405、422。
- 知道当前全局列表只用于教学，不能作为生产数据库。
- 能在 `/docs` 中完成创建、查询和错误请求。

下一章会把 `ArticleCreate` 讲透，并补上更新模型与响应模型，解决“输入和输出为什么不能都用一个字典”的问题。
