---
title: FastAPI 从 0 到 1 04：响应、异常与 OpenAPI
slug: fastapi-response-errors-openapi
summary: 设计清晰的响应模型、状态码和统一错误契约，处理文件与流式响应，并维护可靠 OpenAPI 文档。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - OpenAPI
  - 异常处理
status: draft
cover:
---

# FastAPI 从 0 到 1 04：响应、异常与 OpenAPI

## 响应模型是输出防线

```python
from fastapi import FastAPI, status

app = FastAPI()


@app.post(
    '/articles',
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED
)
async def create_article(payload: ArticleCreate):
    return {
        'id': 1,
        'title': payload.title,
        'slug': payload.slug,
        'content': payload.content,
        'status': 'draft',
        'created_at': '2026-07-26T10:00:00+08:00',
        'updated_at': '2026-07-26T10:00:00+08:00',
        'internal_note': '不会出现在响应中'
    }
```

`response_model` 会验证和过滤输出。即使内部对象带有密码哈希、内部标记等字段，只要响应模型没有声明，就不会被正常序列化出去。

对于路由返回类型，也可写：

```python
@app.get('/articles/{article_id}')
async def get_article(article_id: int) -> ArticleRead:
    ...
```

项目应统一一种清晰风格。涉及多状态响应或框架 `Response` 类型时，显式 `response_model` 往往更直观。

## 常见响应结构

单个资源：

```json
{
  "id": 1,
  "title": "FastAPI"
}
```

分页列表：

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

错误：

```json
{
  "error": {
    "code": "ARTICLE_NOT_FOUND",
    "message": "文章不存在",
    "details": null,
    "requestId": "req_123"
  }
}
```

是否再包一层 `data` 没有唯一答案。重要的是全项目稳定，客户端不需要根据不同接口猜测结构。不要让同一个列表接口有时返回数组、有时返回对象。

## `HTTPException`

```python
from fastapi import HTTPException, status


@app.get('/articles/{article_id}', response_model=ArticleRead)
async def get_article(article_id: int):
    article = None
    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='文章不存在'
        )
    return article
```

`HTTPException` 适合简单接口或路由边界。大型项目不应让 Service 到处依赖 HTTP 概念，可以在 Service 抛领域异常，再由全局处理器映射状态码。

## 领域异常

```python
class AppError(Exception):
    code = 'APP_ERROR'
    status_code = 400

    def __init__(self, message: str, *, details: object = None):
        self.message = message
        self.details = details
        super().__init__(message)


class NotFoundError(AppError):
    code = 'RESOURCE_NOT_FOUND'
    status_code = 404


class ConflictError(AppError):
    code = 'RESOURCE_CONFLICT'
    status_code = 409


class ForbiddenError(AppError):
    code = 'FORBIDDEN'
    status_code = 403
```

全局处理：

```python
from fastapi import Request
from fastapi.responses import JSONResponse


@app.exception_handler(AppError)
async def handle_app_error(request: Request, exc: AppError):
    request_id = getattr(request.state, 'request_id', None)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'error': {
                'code': exc.code,
                'message': exc.message,
                'details': exc.details,
                'requestId': request_id
            }
        }
    )
```

稳定的机器可读 `code` 供前端判断，`message` 供用户或开发者阅读。不要让前端根据中文消息文本分支。

## 自定义 422 响应

FastAPI 参数失败默认返回 422 和 `detail` 列表。若项目要求统一格式，可处理 `RequestValidationError`：

```python
from fastapi.exceptions import RequestValidationError


@app.exception_handler(RequestValidationError)
async def handle_validation_error(
    request: Request,
    exc: RequestValidationError
):
    return JSONResponse(
        status_code=422,
        content={
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': '请求参数不合法',
                'details': exc.errors(),
                'requestId': getattr(request.state, 'request_id', None)
            }
        }
    )
```

生产返回的 details 应评估是否包含不适合公开的原始输入。密码等敏感字段不能回显。

## 未预期异常

可以增加兜底处理器，但必须先记录完整堆栈：

```python
import logging

logger = logging.getLogger(__name__)


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception):
    logger.exception(
        'Unhandled error',
        extra={'request_id': getattr(request.state, 'request_id', None)}
    )
    return JSONResponse(
        status_code=500,
        content={
            'error': {
                'code': 'INTERNAL_SERVER_ERROR',
                'message': '服务暂时不可用',
                'details': None,
                'requestId': getattr(request.state, 'request_id', None)
            }
        }
    )
```

客户端看到通用消息，内部日志保留真实异常。绝不能把堆栈、SQL、文件路径和环境变量直接返回。

## 204 响应

删除成功通常返回 204：

```python
from fastapi import Response


@app.delete('/articles/{article_id}', status_code=204)
async def delete_article(article_id: int) -> Response:
    return Response(status_code=204)
```

204 不应带 JSON Body。

## 自定义 Header 和 Cookie

```python
from fastapi import Response


@app.post('/session')
async def create_session(response: Response):
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

本地 HTTP 开发时 `secure=True` 的 Cookie 不会被浏览器发送，可按环境配置，但生产必须使用 HTTPS。

## 文件、流式和重定向响应

```python
from pathlib import Path

from fastapi.responses import FileResponse, RedirectResponse, StreamingResponse


@app.get('/downloads/report')
async def download_report():
    path = Path('exports/report.csv')
    return FileResponse(path, filename='report.csv')


@app.get('/docs-home')
async def docs_home():
    return RedirectResponse('/docs', status_code=307)


def generate_rows():
    yield 'id,title\n'
    for index in range(1, 1000):
        yield f'{index},Article {index}\n'


@app.get('/exports/articles.csv')
async def export_articles():
    return StreamingResponse(
        generate_rows(),
        media_type='text/csv',
        headers={
            'Content-Disposition': 'attachment; filename=articles.csv'
        }
    )
```

下载路径必须由服务端控制，不能把用户输入直接拼成任意文件路径。大型导出应考虑离线任务和对象存储，而不是让一个 HTTP 请求长时间占用 worker。

## OpenAPI 元数据

```python
@router.post(
    '/articles',
    response_model=ArticleRead,
    status_code=201,
    summary='创建文章',
    description='创建当前用户的草稿文章。slug 必须全局唯一。',
    responses={
        409: {'description': 'slug 已存在'},
        401: {'description': '未登录'}
    },
    tags=['articles']
)
```

文档重点写业务边界、权限、幂等和错误条件，不要重复代码已经能表达的字段类型。

## 生产文档策略

```python
app = FastAPI(
    docs_url='/docs' if settings.debug else None,
    redoc_url='/redoc' if settings.debug else None,
    openapi_url='/openapi.json' if settings.expose_openapi else None
)
```

关闭生产 `/docs` 不代表可以不维护契约。团队应保存版本化 OpenAPI、导入内部 API 平台或限制为内部访问。

## 本章练习

1. 为文章创建、详情、列表、删除定义响应模型和正确状态码。
2. 定义 `NotFoundError`、`ConflictError`、`ForbiddenError`。
3. 统一处理业务异常、422 和未预期异常。
4. 确认所有错误包含稳定 code 和 requestId。
5. 实现一个 CSV 流式下载接口。

## 本章检查

- 输出使用明确 `response_model`，不直接暴露 ORM 全字段。
- 401、403、404、409、422 的语义清楚。
- 未预期异常记录堆栈但不泄露给客户端。
- OpenAPI 描述了关键业务边界和错误响应。
