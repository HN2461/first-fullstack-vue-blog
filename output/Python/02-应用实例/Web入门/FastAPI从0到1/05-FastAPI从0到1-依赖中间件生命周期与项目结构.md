---
title: FastAPI 从 0 到 1 05：依赖、中间件、生命周期与项目结构
slug: fastapi-dependencies-middleware-lifespan-structure
summary: 掌握依赖注入、中间件、生命周期、配置管理、路由拆分和日志基础，建立企业项目骨架。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - 依赖注入
  - 工程化
status: draft
cover:
---

# FastAPI 从 0 到 1 05：依赖、中间件、生命周期与项目结构

## 依赖注入是 FastAPI 的核心

依赖用于声明“执行接口前需要获得什么”：

- 数据库 Session。
- 当前登录用户。
- 权限检查结果。
- 分页参数。
- Settings、Redis、HTTP 客户端。
- 请求级上下文。

简单依赖：

```python
from typing import Annotated

from fastapi import Depends, Header, HTTPException


async def verify_api_key(
    x_api_key: Annotated[str | None, Header()] = None
) -> str:
    if x_api_key != 'development-key':
        raise HTTPException(status_code=401, detail='API key 无效')
    return x_api_key


@app.get('/internal')
async def internal_api(
    api_key: Annotated[str, Depends(verify_api_key)]
):
    return {'authenticated': True}
```

常用类型别名：

```python
ApiKeyDep = Annotated[str, Depends(verify_api_key)]


@app.get('/internal')
async def internal_api(api_key: ApiKeyDep):
    return {'authenticated': True}
```

## 带清理逻辑的依赖

```python
from collections.abc import AsyncGenerator


async def get_resource() -> AsyncGenerator[dict, None]:
    resource = {'connected': True}
    try:
        yield resource
    finally:
        resource['connected'] = False
```

`yield` 前创建请求级资源，`yield` 后释放。数据库 Session 是最典型场景。

注意：如果响应是长时间流式输出，依赖清理时机需要结合当前 FastAPI 版本和响应行为验证，不要假设所有资源一定在发送最后一个字节后才释放。

## 依赖可以组成依赖树

```text
路由
  -> require_permission
      -> get_current_user
          -> oauth2_scheme
          -> get_db
  -> get_db
```

FastAPI 默认会在同一请求中缓存同一个依赖的结果。因此多个下游依赖使用 `get_db` 时通常得到同一个请求级 Session。特定场景可用 `use_cache=False`，但要清楚资源成本和语义。

## 类依赖和参数对象

```python
class Pagination:
    def __init__(self, page: int = 1, page_size: int = 20):
        if page < 1:
            raise HTTPException(422, 'page 必须大于等于 1')
        if page_size < 1 or page_size > 100:
            raise HTTPException(422, 'page_size 必须在 1 到 100 之间')
        self.page = page
        self.page_size = page_size


@app.get('/articles')
async def list_articles(pagination: Annotated[Pagination, Depends()]):
    return vars(pagination)
```

简单参数更推荐使用 Pydantic/Query 约束。类依赖适合需要行为或复用状态的依赖对象。

## Router 拆分

```python
# app/api/v1/articles.py
from fastapi import APIRouter

router = APIRouter(prefix='/articles', tags=['articles'])


@router.get('')
async def list_articles():
    return {'items': []}
```

```python
# app/api/router.py
from fastapi import APIRouter

from app.api.v1 import articles, auth, users

api_router = APIRouter(prefix='/api/v1')
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(articles.router)
```

```python
# app/main.py
from fastapi import FastAPI

from app.api.router import api_router


def create_app() -> FastAPI:
    app = FastAPI(title='Knowledge API')
    app.include_router(api_router)
    return app


app = create_app()
```

## 推荐目录

```text
knowledge-api/
├─ app/
│  ├─ main.py
│  ├─ api/
│  │  ├─ router.py
│  │  ├─ deps.py
│  │  └─ v1/
│  ├─ core/
│  │  ├─ config.py
│  │  ├─ errors.py
│  │  ├─ logging.py
│  │  └─ security.py
│  ├─ db/
│  │  ├─ base.py
│  │  └─ session.py
│  ├─ models/
│  ├─ schemas/
│  ├─ repositories/
│  ├─ services/
│  ├─ integrations/
│  └─ common/
├─ alembic/
├─ tests/
├─ .env.example
├─ alembic.ini
├─ pyproject.toml
└─ README.md
```

依赖方向建议：

```text
API -> Service -> Repository -> Database
        |             |
        -> Domain     -> ORM Model
```

API 层处理 HTTP；Service 表达业务用例和事务；Repository 封装可复用查询；Model 表达持久化结构；Schema 表达接口数据。

中小项目可以先让 Service 直接使用 Session，不要为了“分层”制造只转发一行代码的 Repository。查询复杂、复用明显或数据源可替换时再抽取。

## Settings 配置

`.env.example`：

```dotenv
APP_NAME=Knowledge API
APP_ENV=development
DEBUG=true
DATABASE_URL=postgresql+asyncpg://app:app@127.0.0.1:5432/knowledge
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGINS=http://localhost:5173
REDIS_URL=redis://127.0.0.1:6379/0
```

`app/core/config.py`：

```python
from functools import lru_cache

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'Knowledge API'
    app_env: str = 'development'
    debug: bool = False
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = Field(default=30, gt=0)
    frontend_origins: list[str] = Field(default_factory=list)
    redis_url: str | None = None

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )

    @field_validator('frontend_origins', mode='before')
    @classmethod
    def parse_origins(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(',') if item.strip()]
        return value

    @model_validator(mode='after')
    def validate_production(self):
        if self.app_env == 'production':
            if self.debug:
                raise ValueError('生产环境不能开启 DEBUG')
            if len(self.jwt_secret_key) < 32:
                raise ValueError('生产 JWT 密钥长度不足')
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

不要在 import 时到处创建 Settings 实例。集中通过缓存函数或应用状态管理，测试时更容易覆盖。

## 生命周期 lifespan

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.ready = False
    # 初始化连接池、共享 HTTP 客户端或缓存客户端。
    app.state.ready = True
    try:
        yield
    finally:
        app.state.ready = False
        # 关闭共享客户端和连接池。


app = FastAPI(lifespan=lifespan)
```

生命周期用于进程级资源，不用于请求级 Session。不要用旧式 startup/shutdown 和 lifespan 混合维护同一资源。

## 中间件

中间件包围每个请求，适合：

- 请求 ID。
- 请求耗时。
- 安全响应头。
- CORS。
- 全局日志上下文。

```python
from time import perf_counter
from uuid import uuid4

from fastapi import Request


@app.middleware('http')
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get('X-Request-ID') or f'req_{uuid4().hex}'
    request.state.request_id = request_id
    started_at = perf_counter()

    response = await call_next(request)

    duration_ms = (perf_counter() - started_at) * 1000
    response.headers['X-Request-ID'] = request_id
    response.headers['Server-Timing'] = f'app;dur={duration_ms:.2f}'
    return response
```

中间件中要正确处理异常，否则可能丢失请求日志。正式项目可使用纯 ASGI 中间件降低 `BaseHTTPMiddleware` 在特定流式或上下文场景的限制。

## CORS

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allow_headers=['Authorization', 'Content-Type', 'X-Request-ID']
)
```

CORS 是浏览器安全策略，不是后端认证。`allow_origins=['*']` 与凭证组合不适合作为生产方案。服务端仍必须校验身份和权限。

## 依赖覆盖测试

```python
app.dependency_overrides[get_current_user] = fake_current_user
app.dependency_overrides[get_db] = override_get_db
```

测试结束要清理：

```python
app.dependency_overrides.clear()
```

依赖注入让测试不需要真实登录或生产数据库，这是 FastAPI 项目可测试性的关键。

## 本章练习

1. 按推荐结构拆分 `main.py` 和三个 Router。
2. 创建 Settings，验证生产环境不能使用短密钥。
3. 添加 request ID、耗时和 CORS。
4. 使用 lifespan 管理一个共享 HTTPX 客户端的创建与关闭。
5. 创建 `get_current_user` 的假依赖，并在测试配置中覆盖。

## 本章检查

- 能区分请求级依赖和进程级生命周期资源。
- 路由不承担配置加载、权限实现和数据库连接创建。
- CORS 使用明确 origin，且不把它当认证系统。
- 项目结构服务于边界，而不是堆空目录。
