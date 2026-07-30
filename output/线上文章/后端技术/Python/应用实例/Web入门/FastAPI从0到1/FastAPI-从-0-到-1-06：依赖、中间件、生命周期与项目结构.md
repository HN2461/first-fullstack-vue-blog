---
title: "FastAPI 从 0 到 1 06：依赖、中间件、生命周期与项目结构"
slug: "fastapi-dependencies-middleware-lifespan-structure"
summary: "把单文件文章 API 拆成 Router、Service、Store 和应用入口，并在可运行项目中理解依赖注入、中间件、生命周期和配置边界。"
category: "FastAPI从0到1"
categoryPath:
  - "后端技术"
  - "Python"
  - "应用实例"
  - "Web入门"
  - "FastAPI从0到1"
tags:
  - "Python"
  - "FastAPI"
  - "依赖注入"
  - "工程化"
status: "published"
sortOrder: 80
cover: ""
originalId: "6a6b57a2fca6347974f5d19e"
originalSlug: "fastapi-dependencies-middleware-lifespan-structure"
originalStatus: "published"
publishedAt: "2026-07-30T14:44:46.194Z"
updatedAt: "2026-07-30T14:44:46.194Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# FastAPI 从 0 到 1 06：依赖、中间件、生命周期与项目结构

前四章把路由、数据、业务判断和应用创建都写在 `main.py`。代码少时很直观，继续加入登录、数据库和文件上传后会出现问题：

- 找一个文章规则要在几百行路由中翻找。
- 多个接口重复“查文章，不存在就报错”。
- 测试一个业务动作必须先构造 HTTP 请求。
- 换数据库时容易同时改坏路由和响应。

拆分不是为了让目录显得“企业级”，而是让变化发生在正确边界。

本章先完成可运行拆分，再讲 Depends、中间件和生命周期。不要一开始创建几十个空目录。

## 一次请求应该怎样流动

当前项目只需要四个边界：

```text
客户端 HTTP 请求
  -> Router：路径、参数、状态码、响应模型
  -> Service：查找、创建、更新、删除等业务动作
  -> Store：怎样保存和读取数据
  -> 内存字典
```

返回时反向经过：

```text
内存数据
  -> Service 返回业务结果
  -> Router 交给 response_model
  -> FastAPI 序列化 JSON
  -> 客户端
```

第 07 章把 Store 换成数据库 Repository 时，Router 的 HTTP 契约不需要推倒重写。

## 本章最终目录

```text
beginner-article-api/
├─ app/
│  ├─ __init__.py
│  ├─ errors.py
│  ├─ main.py
│  ├─ schemas.py
│  ├─ services.py
│  ├─ store.py
│  └─ routers/
│     ├─ __init__.py
│     └─ articles.py
└─ requirements.txt
```

保留第 04、05 章创建的 `schemas.py` 和 `errors.py`。下面给出的都是本章新增或需要完整替换的文件。

## 第一步：创建 `app/store.py`

完整文件：

```python
from datetime import UTC, datetime

from app.schemas import ArticleCreate, ArticleRead, ArticleUpdate


class ArticleStore:
    def __init__(self) -> None:
        self._articles: dict[int, ArticleRead] = {}
        self._next_id = 1

    def list(self, keyword: str | None = None) -> list[ArticleRead]:
        articles = list(self._articles.values())
        if keyword:
            normalized_keyword = keyword.casefold()
            articles = [
                article
                for article in articles
                if normalized_keyword in article.title.casefold()
            ]
        return articles

    def get(self, article_id: int) -> ArticleRead | None:
        return self._articles.get(article_id)

    def create(self, payload: ArticleCreate) -> ArticleRead:
        article = ArticleRead(
            id=self._next_id,
            title=payload.title,
            content=payload.content,
            summary=payload.summary,
            created_at=datetime.now(UTC)
        )
        self._articles[article.id] = article
        self._next_id += 1
        return article

    def update(
        self,
        article: ArticleRead,
        payload: ArticleUpdate
    ) -> ArticleRead:
        changes = payload.model_dump(exclude_unset=True)
        updated = article.model_copy(update=changes)
        self._articles[article.id] = updated
        return updated

    def delete(self, article_id: int) -> None:
        del self._articles[article_id]


article_store = ArticleStore()
```

## Store 逐段解释

### 私有状态

```python
self._articles: dict[int, ArticleRead] = {}
self._next_id = 1
```

- `_articles` 用字典保存文章，键是 ID，值是 ArticleRead。
- `_next_id` 记录下一个可用 ID。
- 前导下划线表示“仅供类内部使用”的约定，不是绝对权限机制。

使用字典后，按 ID 查询不需要每次遍历列表：

```python
return self._articles.get(article_id)
```

找不到键时，`get` 返回 `None`，而不是抛出 KeyError。

### 为什么 Store 不抛 404

Store 只知道“有没有数据”，不知道 HTTP。它返回 `ArticleRead | None`，由 Service 决定找不到文章代表什么业务异常。

### 为什么 ID 不再使用 `len + 1`

删除文章后，列表长度可能变小。`len + 1` 可能生成已经使用过的 ID。独立 `_next_id` 每次创建后递增，更符合教学需求。

它仍不适合多进程和生产环境。数据库序列会在第 07 章接管 ID 生成。

### 全局 `article_store`

```python
article_store = ArticleStore()
```

这里创建一个供当前进程共享的实例。它让入门项目保持简单，但应用重启后数据仍会消失。后面数据库 Session 会通过 Depends 按请求提供，不会照搬这个全局方式。

## 第二步：创建 `app/services.py`

完整文件：

```python
from app.errors import ArticleNotFoundError
from app.schemas import ArticleCreate, ArticleRead, ArticleUpdate
from app.store import article_store


def list_articles(keyword: str | None = None) -> list[ArticleRead]:
    return article_store.list(keyword)


def get_article(article_id: int) -> ArticleRead:
    article = article_store.get(article_id)
    if article is None:
        raise ArticleNotFoundError('文章不存在')
    return article


def create_article(payload: ArticleCreate) -> ArticleRead:
    return article_store.create(payload)


def update_article(
    article_id: int,
    payload: ArticleUpdate
) -> ArticleRead:
    article = get_article(article_id)
    return article_store.update(article, payload)


def delete_article(article_id: int) -> None:
    get_article(article_id)
    article_store.delete(article_id)
```

## Service 负责什么

当前规则很简单，但职责已经清楚：

- `get_article` 把 Store 的 `None` 转成业务异常。
- `update_article` 先确保文章存在，再更新。
- `delete_article` 先复用存在性检查，再删除。

以后可以在这里加入：

- 当前用户是否为作者。
- 文章状态是否允许修改。
- slug 是否冲突。
- 一个操作需要同时写哪些表。

为什么不让 Router 直接调用 Store？因为权限和状态规则会被多个入口复用。规则集中在 Service，HTTP 路由、后台任务和命令行脚本可以共享。

为什么当前 Service 看起来只是转发？项目很小时确实会这样。不要为了分层给每个简单字典表创建四层空壳；这里保留 Service 是因为文章很快会加入权限、事务和状态转换。

## 第三步：创建 Router 包

创建空文件：

```text
app/routers/__init__.py
```

再创建 `app/routers/articles.py`。

完整文件：

```python
from typing import Annotated

from fastapi import APIRouter, Path, Query, Response, status

from app import services
from app.schemas import (
    ArticleCreate,
    ArticleList,
    ArticleRead,
    ArticleUpdate
)

router = APIRouter(
    prefix='/articles',
    tags=['articles']
)


@router.get('', response_model=ArticleList)
def list_articles(
    keyword: Annotated[
        str | None,
        Query(min_length=1, max_length=50)
    ] = None
) -> ArticleList:
    articles = services.list_articles(keyword)
    return ArticleList(items=articles, total=len(articles))


@router.get('/{article_id}', response_model=ArticleRead)
def get_article(
    article_id: Annotated[int, Path(gt=0)]
) -> ArticleRead:
    return services.get_article(article_id)


@router.post(
    '',
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED
)
def create_article(payload: ArticleCreate) -> ArticleRead:
    return services.create_article(payload)


@router.patch('/{article_id}', response_model=ArticleRead)
def update_article(
    article_id: Annotated[int, Path(gt=0)],
    payload: ArticleUpdate
) -> ArticleRead:
    return services.update_article(article_id, payload)


@router.delete(
    '/{article_id}',
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_article(
    article_id: Annotated[int, Path(gt=0)]
) -> Response:
    services.delete_article(article_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

## `APIRouter` 是可组装的小路由表

```python
router = APIRouter(
    prefix='/articles',
    tags=['articles']
)
```

- `prefix='/articles'` 给当前文件所有路径加共同前缀。
- `tags=['articles']` 把当前文件接口放进同一文档分组。

因此：

```python
@router.get('')
```

最终路径是：

```text
GET /articles
```

而：

```python
@router.get('/{article_id}')
```

最终路径是：

```text
GET /articles/{article_id}
```

Router 现在只做 HTTP 边界工作：参数来源、状态码、响应模型。它不再知道数据保存在字典还是数据库。

## 第四步：完整替换 `app/main.py`

```python
from fastapi import FastAPI

from app.errors import AppError, handle_app_error
from app.routers.articles import router as article_router


def create_app() -> FastAPI:
    application = FastAPI(
        title='小白文章 API',
        version='0.5.0'
    )
    application.add_exception_handler(
        AppError,
        handle_app_error
    )
    application.include_router(article_router)

    @application.get('/health', tags=['system'])
    def health_check() -> dict[str, str]:
        return {'status': 'ok'}

    return application


app = create_app()
```

## `main.py` 现在只负责组装

应用入口做四件事：

1. 创建 FastAPI 对象。
2. 注册全局异常处理器。
3. 挂载文章 Router。
4. 提供健康检查。

它不再保存文章，也不再执行文章业务。

### 为什么使用应用工厂

```python
def create_app() -> FastAPI:
    application = FastAPI()
    return application
```

工厂函数每次调用都能创建一个应用实例，测试时更容易获得干净应用，也便于按环境传入配置。

文件末尾仍然创建：

```python
app = create_app()
```

所以启动命令保持：

```powershell
uvicorn app.main:app --reload
```

### `router as article_router`

```python
from app.routers.articles import router as article_router
```

原文件中变量叫 `router`，导入时重命名为 `article_router`，这样以后再导入用户 Router 时不会都叫 `router`。

## 第五步：完整验证拆分结果

启动：

```powershell
uvicorn app.main:app --reload
```

打开 `/docs`，依次验证：

1. `POST /articles` 创建文章，得到 201。
2. `GET /articles` 能看到文章。
3. `PATCH /articles/{id}` 只改标题，正文保留。
4. `GET /articles/999` 返回统一错误。
5. `DELETE /articles/{id}` 返回 204。

拆文件后接口行为应保持不变。结构调整如果改变了 API 契约，说明重构混入了业务变化，应分开处理。

## 四层职责速查

| 文件 | 应该放 | 不应该放 |
| --- | --- | --- |
| `main.py` | 创建应用、挂载 Router、全局注册 | 文章 CRUD 细节 |
| `routers/articles.py` | HTTP 参数、状态码、响应模型 | 数据库 SQL、复杂业务规则 |
| `services.py` | 权限、状态、业务动作、事务协调 | 路由装饰器 |
| `store.py` | 数据存取实现 | HTTP 状态码、前端文案 |
| `schemas.py` | 输入输出形状与格式校验 | 查询数据库、发送通知 |
| `errors.py` | 领域异常与统一 HTTP 映射 | 正常业务流程 |

## 依赖注入解决什么问题

上面的 Router 直接导入全局 `article_store` 的间接使用还比较简单。数据库到来后，每个请求需要一个 Session；登录接口还需要当前用户。FastAPI 用 `Depends` 声明：执行当前接口前，需要先获得什么。

完整可运行的小例子：

```python
from typing import Annotated

from fastapi import Depends, Header, HTTPException


def verify_api_key(
    x_api_key: Annotated[str | None, Header()] = None
) -> str:
    if x_api_key != 'development-key':
        raise HTTPException(status_code=401, detail='API key 无效')
    return x_api_key


ApiKeyDep = Annotated[str, Depends(verify_api_key)]


@app.get('/internal')
def internal_api(api_key: ApiKeyDep):
    return {'authenticated': True}
```

调用链：

```text
请求 /internal
  -> FastAPI 先调用 verify_api_key
  -> 从 Header 读取 X-API-Key
  -> 验证失败直接返回 401
  -> 验证成功把返回字符串传给 api_key
  -> 再执行 internal_api
```

这段代码是机制示例，不加入文章主线项目。真实登录会在第 09 章实现，不能把固定开发 key 当生产认证。

## `Annotated[..., Depends(...)]` 怎么读

```python
ApiKeyDep = Annotated[str, Depends(verify_api_key)]
```

拆开：

- 最终提供给路由的是 `str`。
- 这个值来自 `verify_api_key` 的返回值。
- FastAPI 负责调用依赖并传参。
- 类型别名 `ApiKeyDep` 避免每个路由重复长写法。

数据库章节会用同样方式定义：

```python
DbSessionDep = Annotated[AsyncSession, Depends(get_db)]
```

读法是“一个由 get_db 依赖提供的 AsyncSession”。

## 带 `yield` 的资源依赖

局部示例：

```python
from collections.abc import AsyncGenerator


async def get_resource() -> AsyncGenerator[dict, None]:
    resource = {'connected': True}
    try:
        yield resource
    finally:
        resource['connected'] = False
```

执行阶段：

```text
yield 前：创建请求级资源
yield：把资源交给路由和下游依赖
请求处理结束：回到 finally 做清理
```

数据库 Session 是最典型用法。`finally` 确保成功或异常时都能释放资源。

## 依赖树和请求内缓存

真实认证常形成：

```text
路由
  -> require_permission
      -> get_current_user
          -> oauth2_scheme
          -> get_db
  -> get_db
```

FastAPI 默认在同一请求中缓存同一个依赖的结果。因此多个下游都依赖 `get_db` 时，通常得到同一个请求级 Session。

这里的“缓存”只存在当前请求，不是 Redis，也不会跨请求保存用户数据。

## 中间件是什么

依赖只在声明它的路由运行。中间件包围每个 HTTP 请求，适合：

- 生成请求 ID。
- 计算耗时。
- 添加安全响应头。
- 记录访问日志。
- 处理 CORS。

在 `create_app` 中定义中间件的完整片段：

```python
from time import perf_counter
from uuid import uuid4

from fastapi import Request


@application.middleware('http')
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get('X-Request-ID')
    if not request_id:
        request_id = f'req_{uuid4().hex}'

    request.state.request_id = request_id
    started_at = perf_counter()

    response = await call_next(request)

    duration_ms = (perf_counter() - started_at) * 1000
    response.headers['X-Request-ID'] = request_id
    response.headers['Server-Timing'] = f'app;dur={duration_ms:.2f}'
    return response
```

关键点：

- `call_next(request)` 把请求交给后续中间件和路由。
- 之前的代码发生在路由前。
- 之后的代码发生在路由返回后。
- `request.state` 保存当前请求的上下文。

正式项目还要验证客户端传入 request ID 的长度和字符，避免任意超长值进入日志。

## 生命周期 lifespan 管理进程级资源

数据库 Engine、共享 HTTPX Client、Redis Client 的生命周期通常和应用进程一致，而不是每个请求都创建一次。

局部示例：

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.ready = False
    # 在这里创建进程级共享客户端。
    app.state.ready = True
    try:
        yield
    finally:
        app.state.ready = False
        # 在这里关闭进程级共享客户端。


app = FastAPI(lifespan=lifespan)
```

区分两类资源：

| 资源 | 生命周期 | 管理方式 |
| --- | --- | --- |
| 数据库 Engine | 进程级 | lifespan |
| 共享 HTTPX Client | 进程级 | lifespan |
| Redis Client | 进程级 | lifespan |
| 数据库 Session | 请求/用例级 | yield 依赖 |
| 当前用户 | 请求级 | Depends |

不要把 Session 存成全局单例。多个请求共享同一事务状态会导致严重错误。

## CORS 不是认证

前端开发服务器在 `http://localhost:5173`，API 在 `http://127.0.0.1:8000`，浏览器会把它们视为不同 Origin。此时要配置 CORS。

局部示例：

```python
from fastapi.middleware.cors import CORSMiddleware


application.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allow_headers=['Authorization', 'Content-Type', 'X-Request-ID']
)
```

CORS 只是浏览器跨域访问规则：

- 它不会验证用户身份。
- curl 和服务端调用通常不受浏览器 CORS 限制。
- 生产应列出明确 Origin。
- 使用凭证时不要随意配置通配符。

## Settings 配置先认识边界

开发、测试、生产的数据库地址和密钥不同，不能写死在代码里。

`.env.example` 可以记录字段名和开发占位：

```dotenv
APP_ENV=development
DEBUG=true
DATABASE_URL=postgresql+asyncpg://app:app@127.0.0.1:5432/knowledge
JWT_SECRET_KEY=replace-with-a-long-random-secret
```

真实 `.env` 不提交 Git。`.env.example` 可以提交，但不能包含生产密钥。

第 07 章会给出完整 Settings 和数据库连接代码。现在只需记住：配置描述“环境有什么”，业务代码不应到处读取环境变量。

## 不要过度拆分

下面的目录看起来整齐，却可能全是空转发：

```text
controllers/
use_cases/
services/
repositories/
gateways/
adapters/
```

是否拆一层，看它是否承担真实职责：

- 是否集中业务规则？
- 是否隔离数据库实现？
- 是否被多个入口复用？
- 是否让测试更直接？

如果一个 Repository 永远只调用一行 `session.get`，Service 也只原样转发，可以先保持简单。文章是本课程核心业务，后面确实会复杂，所以保留完整边界。

## 常见错误

### 循环导入

例如 `services.py` 导入 Router，Router 又导入 services，会形成循环。推荐依赖方向：

```text
main -> router -> service -> store
                 -> schema / error
```

下层不要反向导入上层。

### 拆分后 404

检查 `main.py` 是否执行：

```python
application.include_router(article_router)
```

只创建 APIRouter 但没有挂载，应用不会知道这些路径。

### 路径多了两个 `/articles`

如果 Router 已设置 `prefix='/articles'`，路由装饰器中列表路径写空字符串，不要再写一次 `/articles`。

### 把业务规则留在 Router

Router 中出现大量权限判断、事务提交和状态流转时，应移到 Service。Router 应该能快速看出接口契约。

### 每次请求新建共享 HTTP 客户端

共享 HTTPX Client、Redis Client 等应在 lifespan 创建并复用连接池。数据库 Session 则必须按请求或用例创建，二者不要混淆。

## Express 对照：Router、Service、Repository 与生命周期

Express 没有 `Depends`，通常用中间件把认证结果、校验结果或请求上下文挂到 `req`，再由 Router 调用 Service。对应目录可以保持和 FastAPI 相同的职责边界：

```text
src/
├─ app.js
├─ server.js
└─ modules/articles/
   ├─ article.routes.js
   ├─ article.service.js
   ├─ article.repository.js
   └─ article.schemas.js
```

```js
// article.routes.js
import { Router } from 'express'
import * as articleService from './article.service.js'

export const articleRouter = Router()

articleRouter.get('/', async (req, res) => {
  const result = await articleService.list({ keyword: req.query.keyword })
  res.json(result)
})

// app.js
export function createApp() {
  const app = express()
  app.use(express.json())
  app.use(requestContextMiddleware)
  app.use('/articles', articleRouter)
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}

// server.js
async function bootstrap() {
  await connectDatabase()
  const app = createApp()
  const server = app.listen(env.port)

  async function shutdown() {
    server.close(async () => {
      await mongoose.disconnect()
      process.exit(0)
    })
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}
```

FastAPI 的请求级依赖更适合提供 Session 和当前用户；Express 的 Mongoose Model 通常使用全局连接池，不需要每个请求创建 Session。只有事务操作才显式创建 `mongoose.startSession()`，并在 `finally` 中结束。

## 本章动手改

1. 增加 `app/routers/system.py`，把 `/health` 从 `main.py` 拆出去。
2. 新增 `publish_article` Service，暂时只返回文章，思考状态字段应放在哪个 Schema。
3. 给应用加入请求 ID 中间件，在 `/docs` 中观察响应 Header。
4. 写一个 `get_store` 依赖返回 article_store，并尝试在测试中替换。
5. 画出创建文章请求从 Router 到 Store 再返回的调用链。

## 本章完成检查

- 能说明 Router、Service、Store、Schema 各自职责。
- `main.py` 只负责组装应用和全局能力。
- 能解释 Depends 是“先获得路由需要的对象或前置结果”。
- 能区分中间件与路由依赖。
- 能区分 lifespan 进程级资源和请求级 Session。
- 项目没有为了形式创建大量空目录和一行转发层。

到这里，第一阶段文章 API 已经形成完整学习闭环。下一章开始接 PostgreSQL。数据库会替换 Store，但前五章建立的 HTTP、Schema、错误和 Router 边界会继续保留。
