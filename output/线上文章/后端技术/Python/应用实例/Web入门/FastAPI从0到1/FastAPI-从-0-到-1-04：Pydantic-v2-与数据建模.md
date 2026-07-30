---
title: "FastAPI 从 0 到 1 04：Pydantic v2 与数据建模"
slug: "fastapi-pydantic-v2-data-modeling"
summary: "通过文章创建、局部更新和响应过滤，理解 Pydantic 模型、字段约束、必填与可选、exclude_unset 以及输入输出模型分离。"
category: "FastAPI从0到1"
tags:
  - "Python"
  - "FastAPI"
  - "Pydantic"
  - "数据校验"
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a6b57a2fca6347974f5d19a"
originalSlug: "fastapi-pydantic-v2-data-modeling"
originalStatus: "draft"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# FastAPI 从 0 到 1 04：Pydantic v2 与数据建模

上一章把所有数据都写成普通字典，创建文章只有一个 `ArticleCreate`。真实项目还会遇到三个问题：

1. 创建时哪些字段必须传？
2. 修改时怎样只改客户端真正传来的字段？
3. 返回数据时怎样避免把内部字段泄露出去？

Pydantic 的核心价值不是“少写几个 `if`”，而是把接口数据契约集中定义并交给 FastAPI 使用。

本章完成后，项目会支持：

```text
POST  /articles              创建文章
GET   /articles              查看列表
GET   /articles/{article_id} 查看详情
PATCH /articles/{article_id} 只修改提交的字段
```

## 先分清三个容易混淆的概念

| 概念 | 负责什么 | 当前例子 |
| --- | --- | --- |
| Pydantic Schema | 接口输入、输出和格式校验 | `ArticleCreate` |
| 业务规则 | 资源是否存在、当前状态能否修改 | 找不到文章返回 404 |
| 数据库 Model | 表、列、外键、唯一约束 | 第 07 章加入 |

Pydantic 能判断标题是否为空，却不能单独判断：

- 数据库中是否已有同名 slug。
- 当前用户是否有权修改这篇文章。
- 指定分类是否真实存在。
- 文章当前状态是否允许发布。

这些需要业务层查询数据后判断。

## 第一步：创建应用包

为了让 Schema 不继续堆在 `main.py`，把项目调整为：

```text
beginner-article-api/
├─ .venv/
└─ app/
   ├─ __init__.py
   ├─ main.py
   └─ schemas.py
```

操作步骤：

1. 在项目根目录创建 `app` 文件夹。
2. 在 `app` 中创建空文件 `__init__.py`。
3. 创建下面的 `schemas.py` 和 `main.py`。
4. 根目录旧的 `main.py` 不再使用，可以在确认新结构运行成功后删除。

`__init__.py` 告诉 Python：`app` 是一个可以导入的包。它暂时可以是空文件。

## 第二步：完整的 `app/schemas.py`

```python
from datetime import datetime

from pydantic import BaseModel, Field


class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=10_000)
    summary: str | None = Field(default=None, max_length=200)


class ArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    content: str | None = Field(default=None, min_length=1, max_length=10_000)
    summary: str | None = Field(default=None, max_length=200)


class ArticleRead(BaseModel):
    id: int
    title: str
    content: str
    summary: str | None
    created_at: datetime


class ArticleList(BaseModel):
    items: list[ArticleRead]
    total: int
```

这是完整文件。下面逐个模型解释。

## `BaseModel` 是模型的共同父类

```python
from pydantic import BaseModel, Field
```

- `BaseModel` 提供数据验证、转换和序列化能力。
- `Field` 给字段增加长度、范围、默认值和说明等规则。

自定义模型需要继承 `BaseModel`：

```python
class ArticleCreate(BaseModel):
    title: str
```

可以读成“ArticleCreate 是一种 Pydantic 数据模型”。

## 创建模型：客户端能提交什么

```python
class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=10_000)
    summary: str | None = Field(default=None, max_length=200)
```

逐行解释：

### `title`

```python
title: str = Field(min_length=1, max_length=100)
```

- 类型是字符串。
- 没有默认值，所以创建时必须传。
- 至少 1 个字符，最多 100 个字符。

### `content`

```python
content: str = Field(min_length=1, max_length=10_000)
```

正文也是必填字符串。长度上限可以防止客户端一次提交无限大的文本，但生产项目还需要在反向代理和服务器层限制整个请求体大小。

### `summary`

```python
summary: str | None = Field(default=None, max_length=200)
```

- `str | None`：值可以是字符串，也可以是空值。
- `default=None`：客户端可以完全不传。
- 传字符串时最多 200 个字符。

## 必填、可不传、可为 `null`

这四种写法要仔细区分：

```python
class Example(BaseModel):
    required_text: str
    nullable_but_required: str | None
    optional_text: str | None = None
    text_with_default: str = '默认值'
```

| 字段 | 可以不传 | 可以传 `null` | 不传时 |
| --- | --- | --- | --- |
| `required_text` | 否 | 否 | 422 |
| `nullable_but_required` | 否 | 是 | 422 |
| `optional_text` | 是 | 是 | `None` |
| `text_with_default` | 是 | 否 | `'默认值'` |

“允许空值”和“允许不传”是两件不同的事。PATCH 更新尤其依赖这个区别。

## 更新模型：为什么所有字段都可不传

```python
class ArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    content: str | None = Field(default=None, min_length=1, max_length=10_000)
    summary: str | None = Field(default=None, max_length=200)
```

PATCH 表示局部更新。客户端只改标题时，请求体应该可以是：

```json
{
  "title": "新标题"
}
```

如果继续使用 `ArticleCreate`，正文也是必填，客户端每次改标题都要重复发送完整正文，这不符合局部更新语义。

因此创建模型和更新模型必须分开。

## 响应模型：服务端允许公开什么

```python
class ArticleRead(BaseModel):
    id: int
    title: str
    content: str
    summary: str | None
    created_at: datetime
```

这个模型描述服务端返回给客户端的数据：

- `id` 和 `created_at` 由服务端生成，创建模型中没有它们。
- 客户端提交的字段和服务端返回的字段并不相同。
- 以后即使内部文章对象多了 `internal_note`，响应模型不声明就不会返回。

这就是输入模型和输出模型分离的原因。

## 列表模型：不要让列表结构忽左忽右

```python
class ArticleList(BaseModel):
    items: list[ArticleRead]
    total: int
```

返回结构固定为：

```json
{
  "items": [],
  "total": 0
}
```

以后加入分页信息时，可以扩展对象，而不用把“裸数组”突然改成完全不同的类型。

## 第三步：完整的 `app/main.py`

```python
from datetime import UTC, datetime
from typing import Annotated

from fastapi import FastAPI, HTTPException, Path, Query, status

from app.schemas import (
    ArticleCreate,
    ArticleList,
    ArticleRead,
    ArticleUpdate
)

app = FastAPI(
    title='小白文章 API',
    version='0.3.0'
)

articles: list[ArticleRead] = [
    ArticleRead(
        id=1,
        title='认识 FastAPI',
        content='这是第一篇示例文章',
        summary='从第一个接口开始认识 FastAPI',
        created_at=datetime.now(UTC)
    )
]


def find_article(article_id: int) -> ArticleRead:
    for article in articles:
        if article.id == article_id:
            return article

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail='文章不存在'
    )


@app.get('/health', tags=['system'])
def health_check() -> dict[str, str]:
    return {'status': 'ok'}


@app.get(
    '/articles',
    response_model=ArticleList,
    tags=['articles']
)
def list_articles(
    keyword: Annotated[
        str | None,
        Query(min_length=1, max_length=50)
    ] = None
) -> ArticleList:
    if keyword is None:
        result = articles
    else:
        result = [
            article
            for article in articles
            if keyword.casefold() in article.title.casefold()
        ]

    return ArticleList(items=result, total=len(result))


@app.get(
    '/articles/{article_id}',
    response_model=ArticleRead,
    tags=['articles']
)
def get_article(
    article_id: Annotated[int, Path(gt=0)]
) -> ArticleRead:
    return find_article(article_id)


@app.post(
    '/articles',
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED,
    tags=['articles']
)
def create_article(payload: ArticleCreate) -> ArticleRead:
    article = ArticleRead(
        id=max((item.id for item in articles), default=0) + 1,
        title=payload.title,
        content=payload.content,
        summary=payload.summary,
        created_at=datetime.now(UTC)
    )
    articles.append(article)
    return article


@app.patch(
    '/articles/{article_id}',
    response_model=ArticleRead,
    tags=['articles']
)
def update_article(
    article_id: Annotated[int, Path(gt=0)],
    payload: ArticleUpdate
) -> ArticleRead:
    article = find_article(article_id)
    changes = payload.model_dump(exclude_unset=True)
    updated_article = article.model_copy(update=changes)

    article_index = articles.index(article)
    articles[article_index] = updated_article
    return updated_article
```

启动命令现在必须变化：

```powershell
uvicorn app.main:app --reload
```

原来是 `main:app`，现在 `main.py` 位于 `app` 包内，所以模块路径是 `app.main`。

## `from app.schemas import ...` 在做什么

```python
from app.schemas import ArticleCreate, ArticleRead
```

路径映射：

```text
app.schemas
  -> app/schemas.py
```

导入后，`main.py` 才能使用这些模型。

如果出现：

```text
ModuleNotFoundError: No module named 'app'
```

最常见原因是在 `app` 文件夹内部执行了启动命令。请回到包含 `app` 的项目根目录执行。

## 为什么列表从字典变成了模型对象

```python
articles: list[ArticleRead] = [
    ArticleRead(...)
]
```

上一章的列表元素是普通字典，需要写：

```python
article['title']
```

现在元素是 `ArticleRead` 对象，写：

```python
article.title
```

好处是创建对象时也会校验字段，编辑器能提示属性名。它仍然只是内存数据，并不是数据库记录。

## `response_model` 是输出防线

```python
@app.post(
    '/articles',
    response_model=ArticleRead,
    status_code=201
)
```

`response_model=ArticleRead` 告诉 FastAPI：

1. 按 ArticleRead 验证返回结果。
2. 只序列化 ArticleRead 声明的字段。
3. 在 OpenAPI 中生成准确的响应结构。

局部实验：假如内部返回字典多了字段：

```python
return {
    'id': 1,
    'title': '标题',
    'content': '正文',
    'summary': None,
    'created_at': datetime.now(UTC),
    'internal_note': '内部备注'
}
```

只要响应模型没有 `internal_note`，正常响应就不会包含它。

响应模型能降低意外泄露风险，但不能代替权限检查。无权查看整篇文章时，不能先查出文章再指望 Schema 自动判断权限。

## PATCH 的关键：`exclude_unset=True`

代码：

```python
changes = payload.model_dump(exclude_unset=True)
updated_article = article.model_copy(update=changes)
```

假设请求体只有：

```json
{
  "title": "只修改标题"
}
```

Pydantic 对象中其他字段虽然有默认 `None`，但客户端并没有传。执行：

```python
payload.model_dump(exclude_unset=True)
```

得到：

```python
{'title': '只修改标题'}
```

如果不写 `exclude_unset=True`，可能得到：

```python
{
    'title': '只修改标题',
    'content': None,
    'summary': None
}
```

这会把原正文错误地清空。

`model_copy(update=changes)` 以旧文章为基础，覆盖 `changes` 中存在的字段，返回新的 `ArticleRead` 对象。

## “没有传”和“传了 null”

下面两个请求含义不同：

```json
{}
```

表示一个字段也不修改。

```json
{
  "summary": null
}
```

表示明确把摘要清空。

`exclude_unset=True` 会保留第二种请求中的 `summary: None`，因为客户端确实传了这个字段。

不要在允许显式清空的更新接口中随意使用 `exclude_none=True`，否则“清空摘要”的意图会被丢掉。

## Pydantic v2 常用方法

```python
payload = ArticleCreate(
    title='Pydantic 入门',
    content='正文',
    summary=None
)
```

### 转成 Python 字典

```python
payload.model_dump()
```

### 转成 JSON 字符串

```python
payload.model_dump_json()
```

### 从字典校验并创建

```python
ArticleCreate.model_validate({
    'title': '标题',
    'content': '正文'
})
```

### 复制并更新

```python
payload.model_copy(update={'title': '新标题'})
```

旧教程常见 `.dict()`、`.json()`、`parse_obj()` 是 Pydantic v1 时代接口。新项目以 v2 的 `model_dump()`、`model_dump_json()`、`model_validate()` 为准。

## 字段验证器：需要清洗单个字段时再用

下面是局部进阶示例，不需要加入当前项目：

```python
from pydantic import BaseModel, field_validator


class UserRegister(BaseModel):
    email: str

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()
```

逐行含义：

- `@field_validator('email')` 登记一个只处理 email 的验证器。
- `mode='before'` 表示在 Pydantic 完成类型解析前处理原始输入。
- `strip()` 去掉首尾空白。
- `lower()` 统一为小写。
- 返回值继续进入后续验证流程。

不要在验证器中查数据库、发送邮件或调用外部 API。验证器应该快速、确定、没有副作用。需要 I/O 的规则放到 Service。

## 模型验证器：多个字段互相约束时使用

局部进阶示例：

```python
from typing import Self

from pydantic import BaseModel, Field, model_validator


class PasswordChange(BaseModel):
    new_password: str = Field(min_length=12)
    confirm_password: str

    @model_validator(mode='after')
    def passwords_match(self) -> Self:
        if self.new_password != self.confirm_password:
            raise ValueError('两次输入的密码不一致')
        return self
```

它适合“结束时间必须晚于开始时间”“两次密码必须一致”等字段间关系。当前用户是否有权限仍不是 Schema 的职责。

## 嵌套模型

局部示例：

```python
class AuthorBrief(BaseModel):
    id: int
    display_name: str


class ArticleDetail(BaseModel):
    id: int
    title: str
    author: AuthorBrief
```

对应 JSON：

```json
{
  "id": 1,
  "title": "标题",
  "author": {
    "id": 7,
    "display_name": "小明"
  }
}
```

嵌套模型适合表达文章中的作者摘要。数据库章节需要注意预加载关联，否则序列化时可能触发额外 SQL。

## 枚举和 Literal

当字段只允许少量固定值时，不要接受任意字符串再到处手写判断。

可复用的领域值使用枚举：

```python
from enum import StrEnum


class ArticleStatus(StrEnum):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'
```

只在局部使用的有限值可用 `Literal`：

```python
from typing import Literal


sort_by: Literal['created_at', 'title'] = 'created_at'
```

它们会自动进入 OpenAPI，让前端看到允许值。

## 本章验证流程

启动：

```powershell
uvicorn app.main:app --reload
```

在 `/docs` 中依次验证：

1. POST 创建一篇带摘要的文章，状态码为 201。
2. PATCH 只提交 `title`，确认正文没有丢失。
3. PATCH 提交 `{"summary": null}`，确认摘要被清空。
4. POST 提交空标题，确认得到 422。
5. GET 一个不存在的 ID，确认得到 404。

## 常见错误

### `No module named 'app'`

在包含 `app` 文件夹的项目根目录运行 `uvicorn app.main:app --reload`，不要进入 `app` 后再执行。

### `No module named 'app.schemas'`

检查文件名是否真的是 `schemas.py`，以及 `app/__init__.py` 是否存在。

### PATCH 后其他字段变成 null

检查是否漏了：

```python
payload.model_dump(exclude_unset=True)
```

### 返回数据校验失败导致 500

`response_model` 与实际返回结构不一致。检查缺少的字段、类型以及日期格式。响应校验失败说明服务端代码违反了自己声明的契约，不是客户端 422。

## Express 对照：用 Zod 区分输入模型和输出模型

Pydantic 的 `ArticleCreate`、`ArticleUpdate` 和 `ArticleRead` 在 Express 中通常对应三份 Zod Schema。不要直接把 Mongoose 文档或 `req.body` 原样返回：输入和输出是两条不同的契约。

```js
import { z } from 'zod'

export const articleCreateSchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().min(1).max(10_000),
  summary: z.string().max(200).nullable().optional()
}).strict()

export const articleUpdateSchema = articleCreateSchema.partial()

export const articleReadSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  summary: z.string().nullable(),
  createdAt: z.coerce.date()
})

export function parseArticleCreate(req, res, next) {
  const result = articleCreateSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      details: result.error.flatten()
    })
  }
  req.validatedBody = result.data
  return next()
}
```

`partial()` 解决的是“字段可以不传”，而不是“字段一定允许传 `null`”；这和 Pydantic 中“未设置、可选、可空”三种状态的区分完全一样。Express 没有 `response_model`，可以在 Service 返回前调用 `articleReadSchema.parse(article)`，或在统一响应工具中集中执行输出校验。

## 本章动手改

1. 给文章增加 `tags: list[str]`，默认空列表，最多 10 个。
2. 使用 `Field(default_factory=list, max_length=10)`，不要直接共享可变默认列表。
3. 新增 `ArticleBrief`，列表只返回 id、title、summary，不返回完整正文。
4. 新增 slug 字段，限制为小写字母、数字和短横线。
5. 故意让响应模型要求一个不存在字段，观察终端错误并恢复。

slug 规则参考：

```python
slug: str = Field(
    min_length=1,
    max_length=120,
    pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$'
)
```

## 本章完成检查

- 能解释 Schema、业务规则、数据库 Model 的区别。
- 知道创建、更新、响应模型为什么要分开。
- 能区分必填、可不传和可为 null。
- PATCH 使用 `exclude_unset=True`，不会误清空未提交字段。
- 能通过 `response_model` 固定输出结构。
- 不在 Pydantic 验证器中执行数据库或外部 API 调用。

下一章会把目前简单的 `HTTPException` 升级为稳定错误格式，并解释 OpenAPI 如何成为前后端都能阅读的接口契约。
