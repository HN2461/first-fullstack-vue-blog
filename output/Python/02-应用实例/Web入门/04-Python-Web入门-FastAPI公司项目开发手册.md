---
title: Python Web 入门 04：FastAPI 公司项目开发手册
slug: python-web-fastapi-company-project-guide
summary: 从项目初始化、分层、配置、数据库、认证授权到测试部署，整理一套可以直接迁移到公司 API 项目的 FastAPI 开发方法。
category: Python应用实例
tags:
  - Python
  - Web
  - FastAPI
  - API
  - 工程化
  - 公司项目
status: draft
cover:
---

# Python Web 入门 04：FastAPI 公司项目开发手册

前两篇已经能让你写出最小接口，但公司项目真正难的地方通常不在 `@app.get()`，而在于：

- 多人如何同时修改而不互相覆盖。
- 配置、数据库连接和密钥如何区分开发与生产。
- 输入校验、错误码、分页和权限如何保持一致。
- 代码如何测试，服务如何发布、监控和回滚。

这篇笔记把 FastAPI 放进一个真实的“文章管理 API”场景，给出从零到可交付项目的骨架。示例使用 Python 3.12、FastAPI、Pydantic v2、SQLAlchemy 2.0、PostgreSQL、Alembic、pytest；如果公司使用 MySQL，只需要替换数据库驱动和少量方言差异。

## 读完后应该能做什么

读完并亲手敲一遍示例后，你应该可以：

1. 创建一个有明确目录边界的 FastAPI 服务。
2. 用 Pydantic Settings 读取环境变量，避免把密钥写进代码。
3. 用 SQLAlchemy 2.0 的异步 Session 完成增删改查。
4. 把路由、业务服务、数据访问和响应模型分开。
5. 使用统一的错误响应、分页参数、请求 ID 和日志。
6. 实现基于 OAuth2 Password + JWT 的登录和角色检查。
7. 用 pytest 和 HTTPX 写接口测试，并在 CI 中运行。
8. 使用 Alembic 做数据库迁移，使用 Uvicorn/Gunicorn 或容器发布。

这不是把所有框架都背下来，而是形成一个可复制的“需求 -> 接口 -> 数据 -> 测试 -> 发布”闭环。

## 一、先理解公司项目的请求链路

一个典型的前后端分离请求，经过的层次大致如下：

```text
浏览器 / Vue / 移动端
        |
        | HTTPS + JSON
        v
反向代理（Nginx / 云负载均衡）
        |
        v
FastAPI 应用
  -> 中间件：CORS、请求 ID、日志、异常兜底
  -> 路由：匹配 HTTP 方法和 URL
  -> 依赖：认证、数据库 Session、当前用户
  -> Schema：校验输入，定义输出
  -> Service：编排业务规则和事务
  -> Repository / SQLAlchemy：读写数据库
        |
        v
PostgreSQL / Redis / 对象存储 / 外部服务
```

不要把所有逻辑都写在路由函数里。路由应该像“控制器”：解析请求、调用服务、返回响应；业务规则放在 Service，数据库细节放在数据访问层，这样测试和替换基础设施会容易得多。

## 二、初始化项目和依赖

### 1. 创建虚拟环境

Windows PowerShell：

```powershell
mkdir fastapi-company-demo
cd fastapi-company-demo
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

Linux/macOS：

```bash
mkdir fastapi-company-demo && cd fastapi-company-demo
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

### 2. 安装第一批依赖

```powershell
pip install fastapi "uvicorn[standard]" pydantic-settings
pip install sqlalchemy asyncpg alembic
pip install pyjwt "pwdlib[argon2]" python-multipart
pip install email-validator
pip install pytest pytest-asyncio httpx
```

说明：

- `fastapi`：路由、依赖注入、OpenAPI 文档和 ASGI 应用。
- `uvicorn[standard]`：开发和生产都常用的 ASGI 服务器能力。
- `pydantic-settings`：Pydantic v2 的环境变量配置包，不能再假设 Settings 直接来自 `pydantic`。
- `sqlalchemy` + `asyncpg`：异步 ORM 和 PostgreSQL 驱动。
- `alembic`：数据库结构的版本化迁移工具。
- `pyjwt`：JWT 编解码；`pwdlib[argon2]`：密码哈希。
- `python-multipart`：使用表单登录（OAuth2PasswordRequestForm）时需要。
- `httpx`：FastAPI 官方测试示例常用的异步 HTTP 客户端。

公司项目应将依赖锁定在 `pyproject.toml` 或锁文件中，并在 CI 使用锁定版本。不要在生产服务器上临时 `pip install -U`，否则同一提交可能得到不同运行环境。

### 3. 推荐目录结构

```text
fastapi-company-demo/
├─ app/
│  ├─ __init__.py
│  ├─ main.py                 # 创建应用、挂载中间件和路由
│  ├─ core/
│  │  ├─ config.py            # 环境变量和配置
│  │  ├─ security.py          # 密码、JWT、安全依赖
│  │  └─ logging.py           # 日志配置
│  ├─ db/
│  │  ├─ base.py              # ORM Base 和模型导入
│  │  ├─ session.py           # Engine、Session 工厂
│  │  └─ deps.py              # get_db 依赖
│  ├─ models/                 # SQLAlchemy 持久化模型
│  ├─ schemas/                # Pydantic 请求和响应模型
│  ├─ repositories/           # 数据访问查询
│  ├─ services/               # 业务用例和事务编排
│  ├─ api/
│  │  ├─ router.py            # 总路由
│  │  ├─ deps.py              # 当前用户、权限依赖
│  │  └─ v1/                  # API 版本
│  │     ├─ auth.py
│  │     └─ articles.py
│  └─ common/                 # 分页、异常、响应等可复用代码
├─ alembic/
├─ tests/
│  ├─ conftest.py
│  └─ test_articles.py
├─ .env.example
├─ pyproject.toml
└─ README.md
```

中小项目可以先省略 `repositories`，让 Service 直接使用 Session；当查询变多、需要复用或切换数据源时再抽出 Repository。目录是边界提示，不是为了制造空文件。

## 三、配置：开发、测试、生产分离

### 1. `.env.example`

```dotenv
APP_NAME=Company API
APP_ENV=development
DEBUG=true
DATABASE_URL=postgresql+asyncpg://app:app@127.0.0.1:5432/company
JWT_SECRET_KEY=replace-me-in-real-environment
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGINS=http://localhost:5173
```

`.env.example` 可以提交仓库，但 `.env` 必须加入 `.gitignore`，生产密钥由部署平台的 Secret 或服务器环境变量维护。不要把 JWT 密钥、数据库密码、第三方 API Key 写进 Python 文件、前端代码或示例截图。

### 2. Settings 类

```python
# app/core/config.py
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'Company API'
    app_env: str = 'development'
    debug: bool = False
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 30
    frontend_origins: list[str] = Field(default_factory=list)

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )

    @field_validator('frontend_origins', mode='before')
    @classmethod
    def split_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(',') if item.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

这里的关键点：

- `BaseSettings` 会从环境变量和 `.env` 读取值，并按照类型转换。
- `@lru_cache` 让同一个进程复用 Settings，避免每个请求重新读取文件。
- `frontend_origins` 做成列表，CORS 配置可以直接使用。
- 密钥缺失时让应用启动失败，比服务启动后每次请求才报错更容易定位。

生产环境建议再加校验：当 `app_env=production` 时禁止使用短密钥、默认密码和 `debug=true`。

## 四、应用工厂、路由和生命周期

### 1. 数据库 Session

```python
# app/db/session.py
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()
engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=settings.debug
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
```

`pool_pre_ping=True` 会在取连接前检查连接是否仍然可用，减少数据库连接被服务端回收后的偶发错误。Session 是请求级资源，使用依赖生成器保证请求结束后释放。

### 2. ORM Base 和模型

```python
# app/db/base.py
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
```

```python
# app/models/article.py
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Article(Base):
    __tablename__ = 'articles'

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    content: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default='draft', index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
```

生产项目要明确：主键策略、唯一约束、索引、时区、软删除字段、审计字段和关联删除策略。`unique=True` 是数据库约束，不要只在 Python 里判断“是否重复”。

### 3. Pydantic Schema

```python
# app/schemas/article.py
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$', max_length=220)
    content: str = Field(min_length=1)


class ArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, pattern=r'^(draft|published|archived)$')


class ArticleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    content: str
    status: str
    created_at: datetime
    updated_at: datetime


class PageMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class ArticlePage(BaseModel):
    items: list[ArticleRead]
    meta: PageMeta
```

不要把 ORM 模型直接作为输入或输出：输入模型需要限制客户端可写字段，输出模型需要隐藏密码、内部标记和敏感列。Pydantic v2 使用 `ConfigDict(from_attributes=True)` 把 ORM 对象转换为响应模型。

## 五、路由、Service 和事务边界

### 1. Repository 查询

```python
# app/repositories/article_repository.py
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article


async def get_by_slug(session: AsyncSession, slug: str) -> Article | None:
    result = await session.execute(select(Article).where(Article.slug == slug))
    return result.scalar_one_or_none()


async def list_articles(
    session: AsyncSession,
    *,
    page: int,
    page_size: int,
    keyword: str | None = None
) -> tuple[list[Article], int]:
    filters = []
    if keyword:
        filters.append(Article.title.ilike(f'%{keyword}%'))

    total = await session.scalar(
        select(func.count()).select_from(Article).where(*filters)
    )
    rows = await session.scalars(
        select(Article)
        .where(*filters)
        .order_by(Article.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(rows), int(total or 0)
```

`keyword` 来自用户输入时，使用 SQLAlchemy 表达式参数化查询，不要拼接完整 SQL。模糊搜索的大数据量场景应使用合适索引或搜索引擎，不能无限制地 `LIKE '%keyword%'`。

### 2. Service 编排业务规则

```python
# app/services/article_service.py
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article
from app.repositories import article_repository
from app.schemas.article import ArticleCreate, ArticleUpdate


async def create_article(
    session: AsyncSession,
    payload: ArticleCreate
) -> Article:
    if await article_repository.get_by_slug(session, payload.slug):
        raise ValueError('文章 slug 已存在')

    article = Article(**payload.model_dump())
    session.add(article)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        # 并发请求仍可能同时通过上面的查询，数据库约束是最后防线。
        raise ValueError('文章 slug 已存在') from None
    await session.refresh(article)
    return article


async def update_article(
    session: AsyncSession,
    article: Article,
    payload: ArticleUpdate
) -> Article:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(article, key, value)
    await session.commit()
    await session.refresh(article)
    return article
```

事务由 Service 控制：一个业务用例需要修改多张表时，应在同一个 Session 中完成并统一提交。不要在 Repository 的每个小函数里随意 `commit()`，否则上层无法回滚整个业务操作。

### 3. API 路由

```python
# app/api/v1/articles.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.repositories import article_repository
from app.schemas.article import ArticleCreate, ArticlePage, ArticleRead, ArticleUpdate
from app.services import article_service

router = APIRouter(prefix='/articles', tags=['articles'])


@router.get('', response_model=ArticlePage)
async def list_articles(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    keyword: str | None = Query(default=None, max_length=100),
    session: AsyncSession = Depends(get_db)
):
    rows, total = await article_repository.list_articles(
        session, page=page, page_size=page_size, keyword=keyword
    )
    total_pages = (total + page_size - 1) // page_size
    return {
        'items': rows,
        'meta': {
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': total_pages
        }
    }


@router.post('', response_model=ArticleRead, status_code=status.HTTP_201_CREATED)
async def create_article(
    payload: ArticleCreate,
    session: AsyncSession = Depends(get_db)
):
    try:
        return await article_service.create_article(session, payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get('/{slug}', response_model=ArticleRead)
async def get_article(slug: str, session: AsyncSession = Depends(get_db)):
    article = await article_repository.get_by_slug(session, slug)
    if article is None:
        raise HTTPException(status_code=404, detail='文章不存在')
    return article


@router.patch('/{slug}', response_model=ArticleRead)
async def update_article(
    slug: str,
    payload: ArticleUpdate,
    session: AsyncSession = Depends(get_db)
):
    article = await article_repository.get_by_slug(session, slug)
    if article is None:
        raise HTTPException(status_code=404, detail='文章不存在')
    return await article_service.update_article(session, article, payload)
```

注意路由顺序：`/{slug}` 这样的动态路由应放在更具体的固定路径之后，例如 `/stats`、`/mine`，避免把固定路径误当成 slug。列表接口已经统一返回分页对象：

```json
{
  "items": [],
  "meta": {"page": 1, "page_size": 20, "total": 0, "total_pages": 0}
}
```

### 4. 总路由和应用入口

```python
# app/api/router.py
from fastapi import APIRouter

from app.api.v1 import articles

api_router = APIRouter(prefix='/api/v1')
api_router.include_router(articles.router)
```

```python
# app/main.py
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 这里放连接池预热、消息消费者等进程级资源初始化。
    yield
    await engine.dispose()


settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version='1.0.0',
    docs_url='/docs' if settings.app_env != 'production' else None,
    redoc_url='/redoc' if settings.app_env != 'production' else None,
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PATCH', 'DELETE'],
    allow_headers=['Authorization', 'Content-Type', 'X-Request-ID']
)
app.include_router(api_router)


@app.get('/health', tags=['system'])
async def health() -> dict[str, str]:
    return {'status': 'ok'}
```

`lifespan` 适合管理应用级资源。不要在模块导入时创建数据库表；生产数据库结构由 Alembic 管理，应用启动只负责连接和服务。

## 六、统一响应和错误处理

### 1. 错误分类

建议先约定状态码，再写业务：

| 场景 | HTTP 状态码 | 说明 |
| --- | --- | --- |
| 参数格式错误 | 422 | FastAPI/Pydantic 校验失败 |
| 未登录 | 401 | 缺少或无效凭证，通常带 `WWW-Authenticate` |
| 无权限 | 403 | 已登录但不允许操作 |
| 资源不存在 | 404 | slug、ID 或文件不存在 |
| 资源冲突 | 409 | slug、邮箱等唯一字段重复 |
| 业务规则不允许 | 400 | 请求格式正确但业务条件不满足 |
| 服务端异常 | 500 | 未预期错误，不能把堆栈返回客户端 |

不要所有失败都返回 200，也不要把数据库异常、Python 堆栈或 SQL 返回给用户。客户端需要稳定的错误结构，例如：

```json
{
  "error": {
    "code": "ARTICLE_SLUG_EXISTS",
    "message": "文章 slug 已存在",
    "request_id": "req_01J..."
  }
}
```

### 2. 自定义业务异常

```python
# app/common/exceptions.py
class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)
```

```python
# app/main.py（片段）
from fastapi import Request
from fastapi.responses import JSONResponse

from app.common.exceptions import AppError


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    request_id = getattr(request.state, 'request_id', None)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'error': {
                'code': exc.code,
                'message': exc.message,
                'request_id': request_id
            }
        }
    )
```

在更大的团队里，建议把错误码整理成常量或枚举，并在前后端接口契约中维护。错误消息可以给用户看，内部日志则记录异常类型、路径和堆栈。

## 七、认证、JWT 和角色权限

### 1. 认证模型

常见流程如下：

```text
POST /api/v1/auth/login
  -> 校验邮箱和密码
  -> 返回 access_token（短时效）

请求受保护接口
  -> Authorization: Bearer <token>
  -> 解码 token，查询用户状态
  -> 检查角色 / 权限
  -> 执行业务
```

JWT 只证明“令牌由服务签发且未过期”，不能代替数据库中的用户禁用、角色变更和会话撤销检查。高安全场景还需要 refresh token 轮换、黑名单或集中会话存储。

### 2. 密码和 JWT 工具

```python
# app/core/security.py
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings

password_hash = PasswordHash.recommended()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def create_access_token(subject: str, role: str) -> str:
    settings = get_settings()
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {'sub': subject, 'role': role, 'exp': expires_at}
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )
```

不要使用明文密码、MD5 或普通 SHA-256 保存密码。密码哈希需要专用慢算法（例如 Argon2），并且不能把原密码写入日志、异常或数据库。

### 3. 当前用户依赖

```python
# app/api/deps.py
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/v1/auth/login')


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    settings = get_settings()
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='无法验证登录凭证',
        headers={'WWW-Authenticate': 'Bearer'}
    )
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        user_id = payload.get('sub')
        if not user_id:
            raise credentials_error
    except jwt.InvalidTokenError as exc:
        raise credentials_error from exc

    # 这里应按 user_id 查询数据库，并检查 is_active 等状态。
    user = await load_user_by_id(session, int(user_id))
    if user is None or not user.is_active:
        raise credentials_error
    return user
```

真实代码中要实现 `load_user_by_id`，并对 `sub` 做整数或 UUID 校验。角色依赖可以这样写：

```python
def require_roles(*allowed_roles: str):
    async def checker(user=Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail='没有执行此操作的权限')
        return user
    return checker


@router.delete('/{slug}')
async def delete_article(
    slug: str,
    user=Depends(require_roles('admin', 'editor'))
):
    ...
```

公司项目更推荐细粒度权限（如 `article:delete`）而不是把所有判断写成 `if user.role == 'admin'`。权限表和角色绑定应由数据库或权限服务作为事实来源，前端只负责隐藏不应出现的操作，后端必须再次校验。

## 八、数据库迁移和数据安全

### 1. 初始化 Alembic

```powershell
alembic init alembic
```

在 `alembic/env.py` 中导入 `Base.metadata` 和 Settings，把同步 URL 转换为迁移使用的驱动（常用 `postgresql://`），或按项目约定配置异步迁移。生成迁移：

```powershell
alembic revision --autogenerate -m "create articles"
alembic upgrade head
```

### 2. 迁移原则

- 迁移文件必须提交到代码仓库，生产环境按版本顺序执行。
- 自动生成后必须人工检查：删除列、改类型、唯一索引和数据转换不能盲信自动生成。
- 破坏性变更分阶段发布：先加新列并兼容旧代码，再迁移数据，最后删除旧列。
- 发布前备份数据库，迁移失败要能回滚或执行修复迁移。
- 生产不要在应用启动时自动 `create_all()`，避免多个实例同时改表。

### 3. 查询和事务检查表

每个列表接口上线前确认：

- 是否有稳定排序，避免翻页时重复或漏数据。
- 是否限制 `page_size` 最大值。
- 过滤字段是否有索引或可接受的查询计划。
- 是否发生 N+1 查询，需要 `selectinload` / `joinedload` 时明确选择。
- 写操作是否在异常时 `rollback()`。
- 外部服务调用是否放在数据库事务之外，避免长事务占用连接。

## 九、接口契约、分页和版本化

### 1. URL 和方法约定

```text
GET    /api/v1/articles          列表
POST   /api/v1/articles          创建
GET    /api/v1/articles/{slug}   详情
PATCH  /api/v1/articles/{slug}   局部更新
DELETE /api/v1/articles/{slug}   删除
```

资源名使用复数名词，动作用 HTTP 方法表达。需要复杂动作时使用明确的子资源或动作端点，例如 `POST /articles/{id}/publish`，不要把所有请求都设计成 `POST /doSomething`。

### 2. 分页模型

```python
from math import ceil
from pydantic import BaseModel, Field


class PageQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


def build_page_meta(page: int, page_size: int, total: int) -> dict[str, int]:
    return {
        'page': page,
        'page_size': page_size,
        'total': total,
        'total_pages': ceil(total / page_size) if total else 0
    }
```

数据量很大、需要深度翻页时，使用基于游标的分页（例如 `created_at + id`）通常比 `OFFSET` 更稳定。分页方式应在接口契约中固定，不要同一个接口今天返回数组、明天改成对象。

### 3. OpenAPI 文档的正确用法

`/docs` 是开发、联调和生成客户端的工具，不是权限系统。生产是否暴露文档要按公司安全策略决定；如果关闭文档，要保留版本化 OpenAPI 文件或内部文档平台，不能让接口变成“没有契约的黑盒”。

## 十、测试：从健康检查到业务回归

### 1. 测试分层

| 类型 | 测试内容 | 运行速度 |
| --- | --- | --- |
| 单元测试 | 纯函数、权限规则、Schema 边界 | 快 |
| Service 测试 | 业务用例和事务行为，可使用测试数据库 | 中 |
| API 测试 | 状态码、响应 JSON、认证和依赖覆盖 | 中 |
| 集成测试 | 真数据库、Redis、外部服务容器 | 慢 |
| 端到端测试 | 前端到后端完整用户流程 | 最慢 |

不要只测 200 成功路径。至少覆盖：未登录、无权限、参数非法、资源不存在、重复唯一字段、数据库异常和分页边界。

### 2. HTTPX 测试示例

```python
# tests/test_articles.py
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        response = await client.get('/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}
```

真实 API 测试应通过 `app.dependency_overrides` 注入测试数据库 Session 和假认证用户，避免测试连接生产数据库。测试结束要清理数据，推荐使用独立测试数据库或事务回滚。

### 3. `pyproject.toml` 测试配置

```toml
[tool.pytest.ini_options]
addopts = "-q"
asyncio_mode = "auto"
testpaths = ["tests"]
```

运行：

```powershell
pytest
```

CI 至少执行：依赖安装、格式检查、静态检查、单元/API 测试和迁移检查。提交前不要只打开 `/docs` 看页面能否加载。

## 十一、日志、请求 ID 和可观测性

### 1. 请求 ID 中间件

```python
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = request.headers.get('X-Request-ID') or f'req_{uuid4().hex}'
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers['X-Request-ID'] = request_id
        return response
```

日志至少记录：时间、级别、请求 ID、方法、路径、状态码、耗时、用户 ID（允许时）和异常堆栈。不要记录密码、Authorization 完整值、身份证号和银行卡号。生产日志输出到标准输出，由平台收集；不要依赖容器内本地文件长期保存日志。

### 2. 健康检查和指标

- `/health`：进程是否能响应。
- `/ready`：是否已经连接必要依赖，适合负载均衡摘除未就绪实例。
- 指标：请求总数、延迟分位数、错误率、数据库连接池、队列长度。
- 告警：5xx 比例、登录失败突增、数据库连接耗尽、磁盘和内存不足。

健康检查不要把所有外部依赖都串行检查到每个探针请求里；重检查可以缓存或独立做就绪状态。

## 十二、安全边界

上线前逐项确认：

- 仅允许 HTTPS，生产禁止把 HTTP 明文密码发到服务器。
- CORS 使用明确的前端 origin，不使用 `*` 配合凭证。
- 登录、验证码、密码重置和搜索接口配置限流。
- 上传文件校验大小、扩展名、MIME、内容签名和存储路径，禁止直接执行上传文件。
- SQL 使用 ORM 参数化查询；HTML/Markdown 展示时做 XSS 清洗。
- JWT 密钥使用 Secret 管理，定期轮换；访问令牌短时效。
- 对象级权限必须在后端查询条件中体现，不能只靠前端按钮隐藏。
- 依赖定期扫描漏洞，生产镜像使用固定基础镜像版本。
- 反向代理设置请求体大小、超时和安全响应头。
- 错误响应不泄露内部路径、SQL、堆栈和环境变量。

## 十三、开发、发布和回滚

### 1. 本地运行

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

检查：

```powershell
curl http://127.0.0.1:8000/health
```

### 2. 生产启动

容器或 Linux 服务中可以使用：

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

worker 数量取决于 CPU、内存、数据库连接池和请求类型，不要盲目开很多进程。每个 worker 都会创建自己的连接池；连接池上限应按数据库最大连接数反推。前面通常放 Nginx、云负载均衡或平台网关处理 TLS、压缩和静态资源。

### 3. 发布顺序

```text
1. 代码评审和 CI 全绿
2. 备份数据库，确认回滚点
3. 发布兼容性迁移
4. 部署应用并执行健康检查
5. 小流量验证关键接口和日志
6. 扩大流量，观察错误率和延迟
7. 记录版本、迁移号和验证结果
```

回滚应用版本不一定能回滚数据库，所以要采用向后兼容迁移。真正破坏数据的操作需要单独脚本、备份和人工确认。

## 十四、从需求到接口的公司项目工作流

### 第一步：把需求写成用例

以“文章管理”为例先写清楚角色和规则：

- 访客可以查看已发布文章。
- 编辑可以创建和修改自己的草稿。
- 管理员可以发布、归档和删除任意文章。
- slug 全局唯一，标题必填，正文长度有上限。

### 第二步：画数据和状态

```text
Article: id, title, slug, content, status, author_id, created_at, updated_at
status: draft -> published -> archived
                     \-> draft（允许撤回时明确规则）
```

状态转换要在 Service 中集中实现，不能让每个路由随意修改字符串。非法转换返回明确业务错误。

### 第三步：先定接口契约

写出请求、响应、状态码和权限，再开始编码。前后端可以根据 OpenAPI 并行开发，减少“字段名称靠猜”的返工。

### 第四步：完成一条垂直切片

先做“创建文章 -> 查询详情 -> 列表分页 -> 编辑 -> 测试”这一条完整链路，再扩展评论、标签、上传和通知。每完成一条切片就可演示、评审和部署，不要先把所有空路由搭完。

### 第五步：交付前清单

- 正常和异常状态码是否符合契约。
- 权限是否在后端真实校验。
- 所有输入是否有长度、范围和格式限制。
- 数据库约束、索引和迁移是否提交。
- 测试是否覆盖主要规则和边界。
- 日志能否通过 request ID 定位一次请求。
- 配置和密钥是否脱离代码。
- 部署、健康检查和回滚步骤是否写入 README。

## 十五、常见错误和改进方式

### 把所有代码写进 `main.py`

小练习可以这样做，公司项目会很快失控。按“路由 -> Schema -> Service -> 数据访问”拆分，先保持依赖方向单一。

### 所有函数都写 `async def`

异步不是性能装饰。只有调用异步库时才需要异步；同步 CPU 密集任务要放线程池、任务队列或独立服务，不能在事件循环里执行长时间计算。

### 在每个查询后立即 `commit()`

这会破坏业务事务边界。让 Service 决定一次用例何时提交，异常统一回滚。

### 用 `create_all()` 代替迁移

它无法表达安全的数据变更，多个实例并发启动也可能带来问题。生产使用 Alembic 迁移。

### 直接返回 ORM 对象

没有 `response_model` 时容易泄露内部字段、触发懒加载或产生循环序列化。为输入和输出定义独立 Schema。

### 把 JWT 当成完整权限系统

角色变化、用户禁用和主动退出仍需服务端状态。令牌内容只放必要、非敏感、短期有效的声明。

### 把异常消息直接返回给用户

客户端需要稳定错误码，开发者需要内部日志。两者分开，避免泄露实现细节。

### 只验证 `/docs` 能打开

文档页面能打开不代表数据库事务、权限、分页、错误码和部署都正确。必须用自动化测试验证行为。

## 十六、建议学习与实战节奏

如果每天有 2-3 小时，可以按下面顺序练习：

1. 第 1 天：重写最小接口，掌握路径/查询/Body、响应模型和 `/docs`。
2. 第 2 天：完成目录拆分、Settings、CORS、统一异常和健康检查。
3. 第 3-4 天：接 PostgreSQL，完成 Article 模型、CRUD、分页和 Alembic。
4. 第 5 天：增加登录、密码哈希、JWT、当前用户和角色权限。
5. 第 6 天：写 API/Service 测试，补齐 401、403、404、409 和 422 场景。
6. 第 7 天：容器化或服务器部署，接日志、请求 ID、备份和回滚演练。

学习时优先做一个业务闭环，不要同时学习十个插件。遇到问题先查官方文档和最小复现，再把解决方案记录到项目 README 或团队知识库。

## 十七、官方资料与版本基线

本笔记写作时检索了以下官方资料。链接用于继续查阅，具体 API 以当前安装版本文档为准：

- FastAPI 教程与用户指南：https://fastapi.tiangolo.com/tutorial/
- FastAPI 大型应用拆分：https://fastapi.tiangolo.com/tutorial/bigger-applications/
- FastAPI 依赖注入：https://fastapi.tiangolo.com/tutorial/dependencies/
- FastAPI OAuth2 + JWT：https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- FastAPI 测试：https://fastapi.tiangolo.com/tutorial/testing/
- FastAPI 多进程部署：https://fastapi.tiangolo.com/deployment/server-workers/
- Pydantic 模型：https://docs.pydantic.dev/latest/concepts/models/
- Pydantic Settings：https://docs.pydantic.dev/latest/concepts/pydantic_settings/
- SQLAlchemy 2.0 ORM 快速入门：https://docs.sqlalchemy.org/en/20/orm/quickstart.html
- Alembic 教程：https://alembic.sqlalchemy.org/en/latest/tutorial.html
- pytest 文档：https://docs.pytest.org/en/stable/
- Uvicorn 文档：https://www.uvicorn.org/

## 最后记住这条主线

```text
需求和权限
  -> 数据模型与状态
  -> OpenAPI 接口契约
  -> Schema 校验
  -> Service 业务事务
  -> Repository 数据访问
  -> 测试和迁移
  -> 日志、部署、回滚
```

当你可以独立走完这条主线时，FastAPI 就不再只是“会写几个接口”，而是已经具备接手公司后端任务的基本方法。具体项目仍要服从团队已有的数据库、认证、日志、部署和代码评审规范。
