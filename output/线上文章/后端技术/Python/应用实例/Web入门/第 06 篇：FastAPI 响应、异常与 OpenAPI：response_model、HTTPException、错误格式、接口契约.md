---
title: "第 6 篇：FastAPI 响应、异常与 OpenAPI：response_model、HTTPException、错误格式、接口契约"
slug: "fastapi-response-errors-openapi"
summary: "FastAPI 响应、异常与 OpenAPI 契约，覆盖 response_model、201、204、404、422、领域异常、全局处理器和接口文档。"
category: "Web入门"
tags:
  - "Python"
  - "FastAPI"
  - "OpenAPI"
  - "异常处理"
  - "response_model"
status: "published"
sortOrder: 70
cover: ""
originalId: "6a6b57a2fca6347974f5d19c"
originalSlug: "fastapi-response-errors-openapi"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 6 篇：FastAPI 响应、异常与 OpenAPI：response_model、HTTPException、错误格式、接口契约

接口不仅要“能返回数据”，还要让前端稳定地知道：

- 成功时有哪些字段。
- 创建、删除分别返回什么状态码。
- 失败时错误代码和消息放在哪里。
- 参数错误与资源不存在有什么区别。

本章继续第 04 章项目，不重建目录。完成后会新增统一错误文件，并增加删除接口：

```text
beginner-article-api/
└─ app/
   ├─ __init__.py
   ├─ errors.py   <- 本章新增
   ├─ main.py     <- 本章修改
   └─ schemas.py
```

## 响应包含什么

一次 HTTP 响应由三类信息组成：

```http
HTTP/1.1 200 OK
content-type: application/json
X-Request-ID: req_123

{"id":1,"title":"标题"}
```

| 部分 | 例子 | 用途 |
| --- | --- | --- |
| 状态码 | `200` | 机器快速判断成功或失败类别 |
| 响应头 | `content-type` | 描述内容类型、缓存、追踪等 |
| 响应体 | JSON | 具体业务数据或错误详情 |

不要只看 JSON。前端通常先根据状态码进入成功或失败流程，再读取响应体。

## 成功响应的状态码

文章项目中使用：

| 场景 | 状态码 | 响应体 |
| --- | --- | --- |
| 查询列表、详情 | 200 | 有 JSON |
| 创建文章 | 201 | 返回创建后的文章 |
| 修改文章 | 200 | 返回修改后的文章 |
| 删除文章 | 204 | 没有响应体 |

### 为什么创建用 201

```python
@app.post(
    '/articles',
    status_code=status.HTTP_201_CREATED
)
```

201 明确表示服务器成功创建了新资源。虽然返回 200 也能传 JSON，但契约不够准确。

### 为什么删除用 204

删除成功后没有需要返回的数据，可以使用 204 No Content。204 的规则就是没有响应体，不要再返回：

```json
{"message": "删除成功"}
```

客户端只看状态码即可。

## `response_model` 做了三件事

第 04 章已经写过：

```python
@app.get(
    '/articles/{article_id}',
    response_model=ArticleRead
)
```

现在把作用说完整：

1. 验证服务端返回的数据是否符合 ArticleRead。
2. 过滤 ArticleRead 没声明的字段。
3. 把响应结构写进 OpenAPI。

它是输出防线，但不是万能安全机制。假设无权查看文章的用户调用详情接口，正确做法是在查询或 Service 中拒绝，而不是先返回完整对象后寄希望于响应模型隐藏。

## 为什么需要稳定错误代码

临时写法：

```json
{
  "detail": "文章不存在"
}
```

用户能看懂，但前端不应该根据中文句子做判断：

```javascript
if (error.detail === '文章不存在') {
  // 这种判断很脆弱
}
```

中文文案以后可能调整，国际化也会改变它。更稳定的格式是：

```json
{
  "error": {
    "code": "ARTICLE_NOT_FOUND",
    "message": "文章不存在",
    "details": null
  }
}
```

- `code` 给程序判断，发布后尽量保持稳定。
- `message` 给人阅读，可以优化措辞。
- `details` 放字段错误、冲突信息等可选上下文。

## 第一步：创建完整的 `app/errors.py`

```python
from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    code = 'APP_ERROR'
    status_code = 400

    def __init__(
        self,
        message: str,
        *,
        details: object = None
    ) -> None:
        self.message = message
        self.details = details
        super().__init__(message)


class ArticleNotFoundError(AppError):
    code = 'ARTICLE_NOT_FOUND'
    status_code = 404


async def handle_app_error(
    request: Request,
    exc: AppError
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'error': {
                'code': exc.code,
                'message': exc.message,
                'details': exc.details
            }
        }
    )
```

这是完整文件。下面拆解关键点。

## 自定义异常怎样工作

```python
class AppError(Exception):
```

`AppError` 继承 Python 内置 `Exception`，所以可以被 `raise` 抛出。

类属性：

```python
code = 'APP_ERROR'
status_code = 400
```

提供默认错误代码和状态码。子类可以覆盖：

```python
class ArticleNotFoundError(AppError):
    code = 'ARTICLE_NOT_FOUND'
    status_code = 404
```

以后抛出：

```python
raise ArticleNotFoundError('文章不存在')
```

对象同时带有：

- 从构造函数得到的 `message`。
- 从子类得到的 `code` 和 `status_code`。

## `*` 为什么出现在参数中

```python
def __init__(self, message: str, *, details: object = None):
```

`*` 后面的参数只能使用名字传入：

```python
AppError('请求失败', details={'field': 'title'})
```

不能模糊地写：

```python
AppError('请求失败', {'field': 'title'})
```

这让调用位置更容易读懂。

## 异常处理器怎样转换成 HTTP

```python
async def handle_app_error(
    request: Request,
    exc: AppError
) -> JSONResponse:
```

处理器会接收：

- 当前请求 `request`。
- 被抛出的异常对象 `exc`。

然后创建 `JSONResponse`，显式指定状态码和 JSON 内容。

当前版本暂时没有使用 `request`，但函数签名必须符合 FastAPI 异常处理器约定。后面可以从 `request.state` 读取请求 ID。

## 第二步：修改 `app/main.py` 的导入

删除：

```python
from fastapi import FastAPI, HTTPException, Path, Query, status
```

改成：

```python
from fastapi import FastAPI, Path, Query, Response, status

from app.errors import (
    AppError,
    ArticleNotFoundError,
    handle_app_error
)
```

为什么删除 `HTTPException`？文章不存在会改用领域异常。为什么新增 `Response`？删除接口要返回没有 Body 的 204 响应。

## 第三步：注册异常处理器

紧跟在 `app = FastAPI(...)` 后加入：

```python
app.add_exception_handler(AppError, handle_app_error)
```

普通话翻译：

```text
应用运行期间，只要抛出 AppError 或它的子类
  -> 交给 handle_app_error
  -> 转换成统一 JSON 响应
```

注册一次后，所有路由都能复用，不必每个接口重复组装错误 JSON。

## 第四步：替换 `find_article`

把第 04 章的 `find_article` 替换为：

```python
def find_article(article_id: int) -> ArticleRead:
    for article in articles:
        if article.id == article_id:
            return article

    raise ArticleNotFoundError('文章不存在')
```

这里不再关心 HTTP JSON 长什么样。函数只表达业务事实：“文章不存在”。全局处理器负责把事实翻译成 HTTP 404。

这种分工的好处是，以后 Service 可以被命令行任务或后台 worker 复用，不必处处依赖 `HTTPException`。

## 第五步：增加删除接口

把下面代码加到 `app/main.py` 末尾：

```python
@app.delete(
    '/articles/{article_id}',
    status_code=status.HTTP_204_NO_CONTENT,
    tags=['articles']
)
def delete_article(
    article_id: Annotated[int, Path(gt=0)]
) -> Response:
    article = find_article(article_id)
    articles.remove(article)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

执行顺序：

1. FastAPI 校验 article_id 是大于 0 的整数。
2. `find_article` 查找文章，不存在则抛出统一 404。
3. `articles.remove(article)` 从内存列表删除该对象。
4. 返回只有 204 状态码、没有 JSON 的 Response。

## 验证统一错误

启动：

```powershell
uvicorn app.main:app --reload
```

请求不存在文章：

```powershell
try {
    Invoke-RestMethod `
        -Uri 'http://127.0.0.1:8000/articles/999' `
        -Method Get
} catch {
    $_.ErrorDetails.Message
}
```

预期响应体：

```json
{
  "error": {
    "code": "ARTICLE_NOT_FOUND",
    "message": "文章不存在",
    "details": null
  }
}
```

在 `/docs` 删除存在文章，应该得到 204，并且 Response body 为空。再查同一 ID，应该得到统一 404。

## 422 为什么还是另一种结构

请求 `/articles/abc` 时，参数错误发生在进入路由函数之前，由 FastAPI 的 `RequestValidationError` 处理。默认响应类似：

```json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "article_id"],
      "msg": "Input should be a valid integer",
      "input": "abc"
    }
  ]
}
```

先读懂 `loc`：

```text
["path", "article_id"]
```

表示错误发生在路径参数 article_id。

如果团队要求所有错误完全统一，可以再注册 422 处理器。

## 可选：统一 422 错误

这是完整的追加代码。先修改 `app/errors.py` 导入：

```python
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
```

再在文件末尾加入：

```python
async def handle_validation_error(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': '请求参数不合法',
                'details': exc.errors()
            }
        }
    )
```

在 `app/main.py` 中导入它和 `RequestValidationError`：

```python
from fastapi.exceptions import RequestValidationError

from app.errors import handle_validation_error
```

注册：

```python
app.add_exception_handler(
    RequestValidationError,
    handle_validation_error
)
```

生产项目返回 `exc.errors()` 前要检查其中是否可能回显密码、令牌等敏感原始输入。统一格式不等于可以原样公开所有内部细节。

## 401、403、404、409、422 的区别

| 状态码 | 含义 | 文章项目例子 |
| --- | --- | --- |
| 401 | 没有有效身份 | 未登录或 token 失效 |
| 403 | 已确认身份，但没有权限 | 普通用户访问管理员接口 |
| 404 | 指定资源不存在或不可见 | 文章 ID 不存在 |
| 409 | 当前请求与已有状态冲突 | slug 已存在、版本冲突 |
| 422 | 输入格式或字段约束失败 | 标题为空、ID 不是整数 |

不要把所有业务失败都返回 200，再在 JSON 中写 `success: false`。这会破坏 HTTP 客户端、监控和网关对结果的正常判断。

## 未预期异常怎样处理

程序 bug、数据库断开等不在预期业务异常中的错误，通常返回 500。生产系统可以添加兜底处理器，但必须先在服务端记录完整堆栈。

局部示例：

```python
import logging

from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


async def handle_unexpected_error(
    request: Request,
    exc: Exception
) -> JSONResponse:
    logger.exception('Unhandled error')
    return JSONResponse(
        status_code=500,
        content={
            'error': {
                'code': 'INTERNAL_SERVER_ERROR',
                'message': '服务暂时不可用',
                'details': None
            }
        }
    )
```

关键原则：

- 客户端只看到通用消息。
- 服务端日志保留异常类型和堆栈。
- 不把 SQL、磁盘路径、环境变量和密钥返回给客户端。
- 开发环境也不要因为有兜底处理器就忽略终端日志。

## OpenAPI 是什么

FastAPI 根据路由和模型生成 OpenAPI JSON。它描述：

- 路径和 HTTP 方法。
- Path、Query、Body 字段。
- 必填项、类型和约束。
- 成功响应模型。
- 文档说明和标签。

Swagger UI `/docs` 只是 OpenAPI 的一个可交互界面。真正的接口契约在：

```text
http://127.0.0.1:8000/openapi.json
```

OpenAPI 可以用于前后端联调、生成客户端、导入 API 平台和做契约检查，但不能代替权限系统或自动化测试。

## 给接口补业务说明

局部示例，应用到创建文章路由：

```python
@app.post(
    '/articles',
    response_model=ArticleRead,
    status_code=201,
    summary='创建文章',
    description='创建一篇新文章。标题和正文不能为空。',
    responses={
        422: {'description': '请求字段不合法'}
    },
    tags=['articles']
)
```

- `summary` 是接口列表中的短标题。
- `description` 说明业务边界。
- `responses` 补充可能出现的状态码说明。

文档应重点解释代码看不出来的权限、状态和冲突条件，不要把字段类型机械抄一遍。

## 自定义 Header 和 Cookie

下面是局部示例，不加入当前主线项目。

```python
from fastapi import Response


@app.post('/session')
def create_session(response: Response):
    response.headers['X-Request-Result'] = 'created'
    response.set_cookie(
        key='session_id',
        value='opaque-token',
        httponly=True,
        secure=True,
        samesite='lax',
        max_age=1800
    )
    return {'status': 'ok'}
```

`HttpOnly` 限制 JavaScript 读取 Cookie，`Secure` 要求 HTTPS，`SameSite` 影响跨站发送。Cookie 登录还需要 CSRF 防护，第 09 章再展开。

## 文件和流式响应先认识

局部示例：

```python
from pathlib import Path

from fastapi.responses import FileResponse


@app.get('/downloads/report')
def download_report() -> FileResponse:
    path = Path('exports/report.csv')
    return FileResponse(path, filename='report.csv')
```

它告诉 FastAPI 返回文件，而不是把路径字符串当 JSON 返回。文件路径必须由服务端控制，不能把用户输入直接拼进磁盘路径。

大型导出不应让一个请求长时间占用进程。更合理的流程是提交任务、后台生成、保存对象存储，再返回短时下载地址。

## 常见错误

### 204 仍返回 JSON

删除接口既然选择 204，就返回空 Response。想返回删除后的对象或消息，请使用 200，并保持项目契约一致。

### 所有异常都捕获成 200

不要写一个大 `try/except` 后无论什么错误都返回 `{"success": false}`。使用准确的 4xx 和 5xx。

### 前端根据 message 判断错误

程序判断使用稳定 `code`，message 只用于展示或开发阅读。

### 把真实异常直接返回

`str(exc)` 可能含 SQL、路径和外部服务信息。未预期异常记录到内部日志，客户端只返回通用消息。

## Express 对照：统一异常与接口文档

Express 5 可以把异步路由抛出的异常自动转交给四参数错误处理中间件。领域异常仍应保持稳定 `code`，不要让前端解析自然语言 `message`。

```js
export class AppError extends Error {
  constructor(message, { status = 400, code = 'APP_ERROR', details } = {}) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export class ArticleNotFoundError extends AppError {
  constructor(articleId) {
    super(`文章 ${articleId} 不存在`, {
      status: 404,
      code: 'ARTICLE_NOT_FOUND'
    })
  }
}

app.get('/articles/:id', async (req, res) => {
  const article = await articleService.getById(req.params.id)
  if (!article) throw new ArticleNotFoundError(req.params.id)
  res.json(article)
})

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)

  const status = error.status ?? 500
  res.status(status).json({
    error: {
      code: error.code ?? 'INTERNAL_SERVER_ERROR',
      message: status === 500 ? '服务器内部错误' : error.message,
      details: error.details
    }
  })
})
```

FastAPI 会自动生成 OpenAPI；Express 本身不会。Express 项目通常用 `swagger-jsdoc`、`@asteasolutions/zod-to-openapi` 或独立 OpenAPI 文件维护契约。企业项目必须把“路由实际行为”和“文档声明”放进 CI 校验，否则文档很容易与代码漂移。

## 本章动手改

1. 新增 `ConflictError`，状态码 409、代码 `RESOURCE_CONFLICT`。
2. 创建文章前检查标题是否完全相同，重复时先用 ConflictError 演示冲突。
3. 给所有文章接口补 `summary`。
4. 在 OpenAPI JSON 中找到 `ArticleRead` Schema。
5. 为 404 和 422 各发送一次错误请求，比较状态码和错误 code。

注意：应用层先检查重复只能提供友好提示，不能保证并发正确。第 07、08 章会用数据库唯一约束做最终保证。

## 本章完成检查

- 查询、创建、删除分别使用 200、201、204。
- 204 响应没有 JSON Body。
- 文章不存在返回稳定的 `ARTICLE_NOT_FOUND`。
- 能解释领域异常与全局 HTTP 处理器的分工。
- 能区分 401、403、404、409、422。
- 知道 `/docs` 是 OpenAPI 界面，不是权限系统和测试工具的替代品。

下一章会把越来越长的 `main.py` 拆成 Router、Service 和 Store，并解释每一层为什么存在。
