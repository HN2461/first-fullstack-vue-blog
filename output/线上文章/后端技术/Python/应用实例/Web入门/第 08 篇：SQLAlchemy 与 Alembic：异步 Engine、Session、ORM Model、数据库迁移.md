---
title: "第 8 篇：SQLAlchemy 与 Alembic：异步 Engine、Session、ORM Model、数据库迁移"
slug: "fastapi-sqlalchemy-alembic"
summary: "FastAPI 数据库接入实践，从内存存储升级到 PostgreSQL，搭建 Settings、异步 Engine、Session、Article ORM Model、Repository 和 Alembic 迁移。"
category: "Web入门"
tags:
  - "Python"
  - "FastAPI"
  - "SQLAlchemy"
  - "Alembic"
  - "PostgreSQL"
status: "draft"
sortOrder: 90
cover: ""
originalId: "6a6b57a2fca6347974f5d1a0"
originalSlug: "fastapi-sqlalchemy-alembic"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 8 篇：SQLAlchemy 与 Alembic：异步 Engine、Session、ORM Model、数据库迁移

前五章的文章保存在 Python 内存中。服务一重启，数据就消失；多 worker 运行时，每个进程还有各自不同的数据。

本章完成一次真正的升级：

```text
ArticleStore + 内存字典
  -> ArticleRepository + AsyncSession + PostgreSQL
```

为了让小白能跑通，本章只建立 Article 表，不提前引用尚未创建的 User。第 09 章加入登录时，再通过新迁移增加 users 表和 author_id 外键。

完成后你应该能够：

- 用 Docker 启动本地 PostgreSQL。
- 解释 Engine、连接池、Session、ORM Model 和数据库表的区别。
- 用 Alembic 创建和升级表结构。
- 重启 API 后再次查到之前创建的文章。
- 知道为什么生产环境不能依赖 `create_all()` 自动改表。

## 本章新增依赖

在项目根目录、虚拟环境已激活的 PowerShell 中执行：

```powershell
python -m pip install sqlalchemy asyncpg alembic pydantic-settings
```

| 包 | 作用 |
| --- | --- |
| SQLAlchemy | 用 Python 表达表、查询和事务 |
| asyncpg | PostgreSQL 异步驱动 |
| Alembic | 记录并执行表结构迁移 |
| pydantic-settings | 从环境变量和 `.env` 读取配置 |

把当前依赖保存到 `requirements.txt`：

```powershell
python -m pip freeze > requirements.txt
```

学习项目可以这样做；团队项目通常使用 `pyproject.toml` 和锁文件固定可重复安装版本。

## 第一步：启动本地 PostgreSQL

如果已经安装并会管理 PostgreSQL，可以跳过 Docker 步骤，但数据库名、用户和密码要与后文一致。

在项目根目录创建完整文件 `compose.yaml`：

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: knowledge
      POSTGRES_USER: app
      POSTGRES_PASSWORD: development-only
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d knowledge"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  postgres_data:
```

启动：

```powershell
docker compose up -d postgres
docker compose ps
```

正常情况下，等待一会儿后状态会显示 `healthy`。

查看日志：

```powershell
docker compose logs postgres
```

这里的密码只用于本机练习，不能复制到生产环境。

## 第二步：创建 `.env`

项目根目录创建：

```dotenv
APP_NAME=小白文章 API
APP_ENV=development
DEBUG=true
DATABASE_URL=postgresql+asyncpg://app:development-only@127.0.0.1:5432/knowledge
```

再创建可提交的 `.env.example`，内容可以相同，但所有敏感值只能是占位符。

`.gitignore` 至少加入：

```gitignore
.venv/
.env
__pycache__/
.pytest_cache/
```

数据库 URL 拆解：

```text
postgresql+asyncpg://app:development-only@127.0.0.1:5432/knowledge
数据库类型 + 驱动   用户  密码             主机       端口 数据库名
```

## 第三步：扩展项目目录

```text
app/
├─ core/
│  ├─ __init__.py
│  └─ config.py
├─ db/
│  ├─ __init__.py
│  ├─ base.py
│  └─ session.py
├─ models/
│  ├─ __init__.py
│  └─ article.py
├─ repositories/
│  ├─ __init__.py
│  └─ article_repository.py
├─ routers/
│  └─ articles.py
├─ errors.py
├─ main.py
├─ schemas.py
└─ services.py
```

每个新目录都创建空的 `__init__.py`。Python 才能稳定地按包路径导入。

## 第四步：完整的 `app/core/config.py`

```python
from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = '小白文章 API'
    app_env: Literal['development', 'test', 'production'] = 'development'
    debug: bool = False
    database_url: str = Field(min_length=1)

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

解释：

- `BaseSettings` 会从环境变量和 `.env` 读取字段。
- 环境变量名不区分大小写，所以 `DATABASE_URL` 能填入 `database_url`。
- `Literal` 限制环境只能是三个明确值。
- `@lru_cache` 让同一进程重复调用时复用 Settings 对象。
- `extra='ignore'` 忽略 `.env` 中当前模型不认识的其他字段。

配置文件只描述配置，不在这里创建数据库 Session 或执行业务查询。

## 第五步：完整的 `app/db/base.py`

```python
from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

naming_convention = {
    'ix': 'ix_%(column_0_label)s',
    'uq': 'uq_%(table_name)s_%(column_0_name)s',
    'ck': 'ck_%(table_name)s_%(constraint_name)s',
    'fk': 'fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s',
    'pk': 'pk_%(table_name)s'
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=naming_convention)
```

`Base` 是所有 ORM Model 的共同父类。它的 metadata 会收集有哪些表、列和约束，Alembic 通过 metadata 比较代码模型与数据库现状。

命名约定让主键、唯一、外键和索引在各环境得到稳定名称。以后数据库报错时，可以根据约束名准确判断是哪条规则冲突。

## 第六步：完整的 `app/models/article.py`

```python
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Article(Base):
    __tablename__ = 'articles'

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    summary: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
```

### `Mapped` 和 `mapped_column`

```python
title: Mapped[str] = mapped_column(String(100), nullable=False)
```

同一行表达两层信息：

- `Mapped[str]` 是 Python/ORM 侧类型。
- `String(100)` 是数据库列类型。
- `nullable=False` 是数据库不允许 NULL 的约束。

Pydantic 的 `Field(min_length=1)` 与数据库 `nullable=False` 也不是重复：

- Pydantic 提前给 API 调用者友好错误。
- 数据库约束保护从任何入口写入的数据完整性。

### `Text` 为什么没有固定长度

PostgreSQL 的 Text 适合正文。接口层仍用 Pydantic 限制 10000 字符，数据库层的选择不意味着请求可以无限大。

### 服务端默认时间

```python
server_default=func.now()
```

由数据库生成创建时间，即使将来不是通过 FastAPI 写入，也会得到值。

## 第七步：让 Alembic 能导入模型

完整的 `app/models/__init__.py`：

```python
from app.models.article import Article

__all__ = ['Article']
```

这个导入不只是方便。模型模块被导入后，Article 表才会注册到 Base.metadata。

## 第八步：完整的 `app/db/session.py`

```python
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine
)

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True
)

SessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionFactory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


DbSessionDep = Annotated[AsyncSession, Depends(get_db)]
```

## Engine、连接和 Session 不要混淆

```text
Engine
  -> 管理数据库方言和连接池
  -> 一个进程通常一个

数据库连接
  -> 连接池中的真实网络连接
  -> Session 需要执行 SQL 时借用

AsyncSession
  -> 一次请求/业务用例的事务和 ORM 工作区
  -> 不能跨请求全局共享
  -> 不能被多个并发 task 同时使用
```

`expire_on_commit=False` 避免提交后立刻访问属性时自动重新查询，但不表示对象永远是数据库最新值。

`pool_pre_ping=True` 在借连接时检查失效连接，能应对一部分断线情况，不等于数据库故障自动恢复。

## 第九步：更新 `app/schemas.py`

把 ArticleRead 改为：

```python
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ArticleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    summary: str | None
    created_at: datetime
```

其余 ArticleCreate、ArticleUpdate、ArticleList 保持第 04 章定义。

`from_attributes=True` 允许 Pydantic 从 ORM 对象属性读取数据：

```text
article.title
article.content
```

没有它时，Pydantic 默认更偏向验证字典数据。

## 第十步：完整 Repository

创建 `app/repositories/article_repository.py`：

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article


async def list_articles(
    session: AsyncSession,
    keyword: str | None = None
) -> list[Article]:
    statement = select(Article).order_by(Article.id.desc())

    if keyword:
        statement = statement.where(
            Article.title.ilike(f'%{keyword}%')
        )

    result = await session.scalars(statement)
    return list(result)


async def get_by_id(
    session: AsyncSession,
    article_id: int
) -> Article | None:
    return await session.get(Article, article_id)


def add(session: AsyncSession, article: Article) -> None:
    session.add(article)


async def delete(session: AsyncSession, article: Article) -> None:
    await session.delete(article)
```

Repository 负责 SQLAlchemy 查询和持久化细节，不负责 404 文案、HTTP 状态码和提交事务。

### 查询语句怎样读

```python
select(Article)
.where(...)
.order_by(...)
```

读成：选择 Article 行，按条件过滤，再排序。真正访问数据库发生在：

```python
await session.scalars(statement)
```

构造 statement 本身不会立刻执行 SQL。

当前 `ilike(f'%{keyword}%')` 通过 SQLAlchemy 绑定参数，不是字符串拼完整 SQL；但前后通配符在大表上通常无法使用普通 B-tree 索引，第 08 章再讨论搜索性能。

## 第十一步：完整替换 `app/services.py`

```python
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import ArticleNotFoundError
from app.models.article import Article
from app.repositories import article_repository
from app.schemas import ArticleCreate, ArticleUpdate


async def list_articles(
    session: AsyncSession,
    keyword: str | None = None
) -> list[Article]:
    return await article_repository.list_articles(session, keyword)


async def get_article(
    session: AsyncSession,
    article_id: int
) -> Article:
    article = await article_repository.get_by_id(session, article_id)
    if article is None:
        raise ArticleNotFoundError('文章不存在')
    return article


async def create_article(
    session: AsyncSession,
    payload: ArticleCreate
) -> Article:
    article = Article(**payload.model_dump())
    article_repository.add(session, article)
    await session.commit()
    await session.refresh(article)
    return article


async def update_article(
    session: AsyncSession,
    article_id: int,
    payload: ArticleUpdate
) -> Article:
    article = await get_article(session, article_id)
    changes = payload.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(article, field, value)

    await session.commit()
    await session.refresh(article)
    return article


async def delete_article(
    session: AsyncSession,
    article_id: int
) -> None:
    article = await get_article(session, article_id)
    await article_repository.delete(session, article)
    await session.commit()
```

### `Article(**payload.model_dump())`

假设字典是：

```python
{
    'title': '标题',
    'content': '正文',
    'summary': None
}
```

前面的 `**` 把字典展开为关键字参数，相当于：

```python
Article(
    title='标题',
    content='正文',
    summary=None
)
```

### `commit()` 和 `refresh()`

- `commit()` 提交事务，使本次写入持久化。
- `refresh(article)` 从数据库重新读取，取得数据库生成的 ID 和 created_at。

Repository 不随意 commit，是因为事务应该覆盖完整业务用例。当前创建只有一张表，第 08 章发布文章会同时写多个对象。

### `setattr`

```python
setattr(article, field, value)
```

等价于动态执行 `article.title = value`。字段来自受控的 ArticleUpdate Schema，不是让客户端任意指定数据库列名。

## 第十二步：完整替换文章 Router

`app/routers/articles.py`：

```python
from typing import Annotated

from fastapi import APIRouter, Path, Query, Response, status

from app import services
from app.db.session import DbSessionDep
from app.schemas import (
    ArticleCreate,
    ArticleList,
    ArticleRead,
    ArticleUpdate
)

router = APIRouter(prefix='/articles', tags=['articles'])


@router.get('', response_model=ArticleList)
async def list_articles(
    session: DbSessionDep,
    keyword: Annotated[
        str | None,
        Query(min_length=1, max_length=50)
    ] = None
) -> ArticleList:
    articles = await services.list_articles(session, keyword)
    return ArticleList(items=articles, total=len(articles))


@router.get('/{article_id}', response_model=ArticleRead)
async def get_article(
    session: DbSessionDep,
    article_id: Annotated[int, Path(gt=0)]
):
    return await services.get_article(session, article_id)


@router.post(
    '',
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED
)
async def create_article(
    payload: ArticleCreate,
    session: DbSessionDep
):
    return await services.create_article(session, payload)


@router.patch('/{article_id}', response_model=ArticleRead)
async def update_article(
    payload: ArticleUpdate,
    session: DbSessionDep,
    article_id: Annotated[int, Path(gt=0)]
):
    return await services.update_article(session, article_id, payload)


@router.delete(
    '/{article_id}',
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_article(
    session: DbSessionDep,
    article_id: Annotated[int, Path(gt=0)]
) -> Response:
    await services.delete_article(session, article_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

路由改成 `async def`，因为内部开始 `await` 异步数据库操作。`DbSessionDep` 让 FastAPI 为每个请求创建 Session，请求结束后自动关闭。

## 第十三步：关闭 Engine

完整替换 `app/main.py`：

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import get_settings
from app.db.session import engine
from app.errors import AppError, handle_app_error
from app.routers.articles import router as article_router


@asynccontextmanager
async def lifespan(application: FastAPI):
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        version='0.6.0',
        lifespan=lifespan
    )
    application.add_exception_handler(AppError, handle_app_error)
    application.include_router(article_router)

    @application.get('/health', tags=['system'])
    async def health_check() -> dict[str, str]:
        return {'status': 'ok'}

    return application


app = create_app()
```

应用关闭时 `engine.dispose()` 关闭连接池。启动时不执行 `create_all()`，表结构交给 Alembic。

## 第十四步：初始化 Alembic

在项目根目录执行一次：

```powershell
alembic init -t async alembic
```

会生成：

```text
alembic/
├─ versions/
├─ env.py
└─ script.py.mako
alembic.ini
```

完整替换 `alembic/env.py`：

```python
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import get_settings
from app.db.base import Base
from app import models

config = context.config
config.set_main_option('sqlalchemy.url', get_settings().database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option('sqlalchemy.url'),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
        compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio
    asyncio.run(run_migrations_online())
```

`from app import models` 看起来没有直接使用，但它触发 `app/models/__init__.py` 导入 Article，让 Base.metadata 知道 articles 表。

## 第十五步：生成并审查第一份迁移

```powershell
alembic revision --autogenerate -m "create articles"
```

在 `alembic/versions` 中打开新文件。`upgrade()` 应该创建 articles 表，`downgrade()` 应该删除它。

自动生成只是草稿，至少检查：

- 表名是否为 articles。
- title 是否 String(100) 且非空。
- content 是否 Text 且非空。
- summary 是否允许空。
- created_at 是否带服务器默认值。
- 没有意外删除其他表或列。

执行迁移：

```powershell
alembic upgrade head
alembic current
```

`current` 应显示当前 revision，并带 `(head)`。

## 第十六步：验证真正持久化

启动 API：

```powershell
uvicorn app.main:app --reload
```

在 `/docs` 创建文章，再查询列表。然后：

1. 按 Ctrl+C 完全停止 Uvicorn。
2. 重新启动。
3. 再次请求 GET `/articles`。

文章仍然存在，说明数据已写入 PostgreSQL，而不是 Python 内存。

## 为什么不用 `create_all()`

```python
Base.metadata.create_all(...)
```

它可以在空数据库中创建缺失表，但不能可靠描述已有表如何从旧版本演进到新版本，也没有可审查的迁移历史。

生产结构变更必须通过 Alembic：

```text
修改 ORM Model
  -> 生成 migration 草稿
  -> 人工审查 upgrade/downgrade
  -> 在测试数据库执行
  -> 备份与发布评估
  -> 受控执行生产迁移
```

不要在每个 Web 实例启动时并发跑生产迁移。

## `flush`、`commit`、`refresh` 的区别

| 操作 | 含义 |
| --- | --- |
| `flush()` | 把待处理 SQL 发给数据库，但不结束事务 |
| `commit()` | 提交事务，使修改持久化 |
| `rollback()` | 回滚当前事务中的未提交修改 |
| `refresh(obj)` | 从数据库重新加载对象字段 |

以后一个业务动作要先取得新对象 ID，再继续写关联时，可以 `flush()`；等整个业务用例都成功后只 `commit()` 一次。

## 常见错误

### 连接被拒绝

检查：

```powershell
docker compose ps
docker compose logs postgres
```

确认端口、数据库名、用户和密码与 DATABASE_URL 一致。

### `password authentication failed`

PostgreSQL volume 已用旧密码初始化时，后来改 compose 密码不会自动改数据库用户密码。学习环境可使用新数据库 volume，重要数据环境绝不能随意删除 volume。

### Alembic 生成空迁移

检查：

- `target_metadata = Base.metadata`。
- `alembic/env.py` 是否导入 `app.models`。
- `app/models/__init__.py` 是否导入 Article。
- Article 是否继承同一个 Base。

### `MissingGreenlet`

通常是异步 ORM 在不允许的时机尝试懒加载。当前模型没有关联；第 08 章加入关联后要使用显式预加载，避免响应序列化偷偷查询。

### 数据库表不存在

创建 ORM 类不会自动创建表。执行：

```powershell
alembic upgrade head
```

### 请求挂住或连接越来越多

确认 Session 通过 `async with` 请求级关闭，没有存成全局对象，也没有在持有事务时等待无关外部 HTTP。

## Express 对照：Mongoose 持久化与迁移边界

你当前 Express 项目使用 MongoDB/Mongoose，因此没有 SQLAlchemy 的 Engine、关系表和 Alembic 迁移文件，但“连接、模型、索引、数据变更脚本”四个职责仍然存在。

```js
import mongoose from 'mongoose'

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }
  await mongoose.connect(process.env.MONGODB_URI)
  return mongoose.connection
}
```

```js
import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  content: { type: String, required: true, maxlength: 10_000 },
  summary: { type: String, default: null, maxlength: 200 },
  slug: { type: String, required: true, unique: true, index: true }
}, {
  timestamps: true,
  optimisticConcurrency: true
})

export const Article = mongoose.model('Article', articleSchema)
```

对照关系：

| FastAPI + SQLAlchemy | Express + Mongoose |
| --- | --- |
| `AsyncEngine` | Mongoose 全局连接池 |
| `AsyncSession` | 普通 Model 操作；事务时使用 ClientSession |
| ORM Model + 列约束 | Schema + validator + MongoDB index |
| Alembic migration | 版本化迁移脚本，默认 dry-run，显式 `--apply` |

MongoDB 不要求每次加字段都执行 DDL，但生产数据仍需要迁移：回填新字段、建立索引、修复旧枚举、调整关联 ID 都必须用可审查、幂等、可统计影响范围的脚本完成。不能因为数据库是“无模式”就跳过迁移纪律。

## 本章动手改

1. 给文章增加唯一 `slug` 字段，并在 Pydantic 创建模型中校验格式。
2. 生成第二份 Alembic 迁移，不要手改第一份已执行迁移。
3. 先 `alembic downgrade -1`，再 `upgrade head`，观察结构变化。
4. 创建一篇文章，重启 API，确认数据仍在。
5. 暂时停止 PostgreSQL，调用接口并观察终端异常，再恢复服务。

增加 slug 时先考虑已有行。如果表中已有数据，直接新增无默认值的非空列会失败。学习阶段可以先新增可空列、回填，再改非空；这正是迁移需要人工设计的原因。

## 本章完成检查

- PostgreSQL 容器 healthy，API 能连接。
- Article ORM Model 不依赖尚未创建的 User。
- Session 按请求创建和关闭，不是全局单例。
- Alembic 能发现 Article 并从空库升级到 head。
- 应用重启后文章仍存在。
- 知道 Model 改动后要新增迁移，而不是修改已在线上执行的历史迁移。

下一章会在这套数据库基础上实现更完整的 CRUD、分页、唯一冲突、关联和事务。先确保本章所有检查通过，再继续。
