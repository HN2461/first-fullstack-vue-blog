---
title: FastAPI 从 0 到 1 02：路由与请求参数
slug: fastapi-routing-request-parameters
summary: 系统掌握路径、查询、请求头、Cookie、请求体、表单和文件参数，以及参数约束和常见接口设计规则。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - 路由
  - 参数校验
status: draft
cover:
---

# FastAPI 从 0 到 1 02：路由与请求参数

## FastAPI 如何判断参数来自哪里

基本规则：

- 路径模板中出现的同名参数来自 Path。
- 简单类型通常来自 Query。
- Pydantic 模型通常来自 JSON Body。
- 使用 `Header`、`Cookie`、`Form`、`File` 时显式指定来源。
- 使用 `Depends` 时表示依赖，不是普通请求参数。

清楚标注来源能提高可读性，也能让 OpenAPI 文档更准确。

## 路径参数

```python
from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get('/articles/{article_id}')
async def get_article(
    article_id: Annotated[int, Path(gt=0, description='文章 ID')]
):
    return {'article_id': article_id}
```

访问 `/articles/abc` 或 `/articles/0` 会得到 422。`Annotated` 把 Python 类型和 FastAPI 元数据放在一起，是现代推荐写法。

枚举路径参数：

```python
from enum import StrEnum


class ArticleStatus(StrEnum):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'


@app.get('/articles/status/{status}')
async def list_by_status(status: ArticleStatus):
    return {'status': status}
```

枚举能限制合法值并自动出现在文档里，比散落的字符串判断更可靠。

## 查询参数

```python
from fastapi import Query


@app.get('/articles')
async def list_articles(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    keyword: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    status: ArticleStatus | None = None
):
    return {
        'page': page,
        'page_size': page_size,
        'keyword': keyword,
        'status': status
    }
```

注意区分：

- `str | None` 表示类型允许 `None`。
- `= None` 表示参数可不传。
- 一个参数可以允许 `None`，但仍然是必传参数；类型和默认值表达的是不同信息。

多个同名查询参数：

```python
@app.get('/search')
async def search(tag: Annotated[list[str] | None, Query()] = None):
    return {'tags': tag or []}
```

请求可以写成 `/search?tag=python&tag=fastapi`。

## 查询参数模型

筛选项较多时可用 Pydantic 模型集中定义：

```python
from typing import Literal

from pydantic import BaseModel, Field


class ArticleFilter(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    keyword: str | None = Field(default=None, max_length=100)
    status: ArticleStatus | None = None
    order: Literal['created_at', '-created_at', 'title'] = '-created_at'


@app.get('/article-search')
async def article_search(filters: Annotated[ArticleFilter, Query()]):
    return filters
```

是否支持查询参数模型取决于项目 FastAPI 版本；若团队版本较旧，可使用依赖函数封装筛选参数。

## Header 参数

```python
from fastapi import Header


@app.get('/request-context')
async def request_context(
    user_agent: Annotated[str | None, Header()] = None,
    x_request_id: Annotated[str | None, Header()] = None
):
    return {
        'user_agent': user_agent,
        'request_id': x_request_id
    }
```

FastAPI 默认把 Python 参数名中的下划线转换成 Header 中的连字符，因此 `x_request_id` 对应 `X-Request-ID`。

不要把敏感请求头完整写入日志，尤其是 `Authorization`、Cookie、API Key。

## Cookie 参数

```python
from fastapi import Cookie


@app.get('/session-info')
async def session_info(
    session_id: Annotated[str | None, Cookie()] = None
):
    return {'has_session': session_id is not None}
```

如果使用 Cookie 保存登录状态，应设置 `HttpOnly`、`Secure`、合适的 `SameSite`，并考虑 CSRF 防护。不能因为前端读不到 HttpOnly Cookie 就关闭安全属性。

## JSON 请求体

```python
from pydantic import BaseModel, Field


class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    published: bool = False


@app.post('/articles', status_code=201)
async def create_article(payload: ArticleCreate):
    return payload
```

客户端必须发送：

```http
Content-Type: application/json
```

以及合法 JSON。Python 字典的单引号写法不是合法 JSON，JSON 必须使用双引号。

## 同时使用 Path、Query 和 Body

```python
from fastapi import Body


@app.patch('/articles/{article_id}')
async def update_article(
    article_id: Annotated[int, Path(gt=0)],
    payload: ArticleCreate,
    notify: Annotated[bool, Query()] = False,
    reason: Annotated[str | None, Body(max_length=200)] = None
):
    return {
        'article_id': article_id,
        'payload': payload,
        'notify': notify,
        'reason': reason
    }
```

多个 Body 参数会共同组成一个 JSON 对象。真实项目更推荐定义一个完整请求模型，避免请求体结构被函数参数拆散。

## 表单参数

需要先安装：

```powershell
python -m pip install python-multipart
```

```python
from fastapi import Form


@app.post('/login-form')
async def login_form(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()]
):
    return {'username': username}
```

OAuth2 Password 登录表单通常使用 `application/x-www-form-urlencoded`。普通前后端业务接口仍更常使用 JSON。

## 直接访问 Request

```python
from fastapi import Request


@app.get('/raw-request')
async def raw_request(request: Request):
    return {
        'method': request.method,
        'path': request.url.path,
        'client': request.client.host if request.client else None
    }
```

只在框架参数无法表达或编写通用基础设施时直接使用 `Request`。业务参数仍应显式声明，否则校验和文档会变差。

## REST 路径设计

推荐：

```text
GET    /api/v1/articles
POST   /api/v1/articles
GET    /api/v1/articles/{article_id}
PATCH  /api/v1/articles/{article_id}
DELETE /api/v1/articles/{article_id}
POST   /api/v1/articles/{article_id}/publish
```

规则：

- 路径使用名词，动作优先由 HTTP 方法表达。
- 真正的领域动作可使用子资源或动作路径，如 `/publish`。
- URL 不暴露数据库实现细节。
- 版本通常放在 `/api/v1`，破坏性契约变化再升级大版本。
- 同一项目统一复数或单数风格。

## 常见错误

### 把复杂筛选写进路径

筛选、分页、排序通常放 Query，不要写成 `/articles/page/1/size/20/status/draft`。

### GET 携带 JSON Body

虽然底层协议不完全禁止，但代理、客户端和文档工具支持不一致。查询条件使用 Query；复杂查询确有需要时可设计专用 POST 搜索接口。

### 不限制分页大小

`page_size` 必须有上限，否则一次请求可能拖垮数据库和响应序列化。

### 用客户端参数决定权限范围

例如 `user_id` 由前端传入后直接查询，会形成越权。当前用户身份应来自认证依赖，查询条件由服务端追加。

## 本章练习

实现文章列表接口，支持：

- `page`：最小 1。
- `page_size`：1 到 100。
- `keyword`：最多 100 字符。
- `status`：只能是 draft、published、archived。
- `tag`：可以重复传多个值。
- `X-Request-ID`：可选请求头。

再实现文章更新接口：路径传 `article_id`，JSON Body 传修改字段，Query 传 `notify`。

## 本章检查

- 能准确判断参数属于 Path、Query、Header、Cookie、Body 还是 Form。
- 能使用约束限制长度、范围和枚举值。
- 能设计稳定、可读、可版本化的资源路径。
- 知道用户身份和权限范围不能由普通请求参数决定。

