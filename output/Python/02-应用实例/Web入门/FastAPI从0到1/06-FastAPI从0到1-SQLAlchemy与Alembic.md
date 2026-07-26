---
title: FastAPI 从 0 到 1 06：SQLAlchemy 与 Alembic
slug: fastapi-sqlalchemy-alembic
summary: 使用 SQLAlchemy 2.x 异步 ORM 连接 PostgreSQL、定义模型和 Session，并通过 Alembic 安全管理数据库迁移。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - SQLAlchemy
  - Alembic
  - PostgreSQL
status: draft
cover:
---

# FastAPI 从 0 到 1 06：SQLAlchemy 与 Alembic

## 为什么选择关系型数据库

企业业务常见用户、角色、文章、分类、标签、评论等实体，存在明确关系、唯一约束和事务要求。PostgreSQL 提供：

- ACID 事务。
- 外键、唯一、检查约束。
- 丰富索引和查询能力。
- JSON、全文检索等扩展能力。
- 成熟备份、复制和监控工具。

FastAPI 不绑定数据库。这里选择 PostgreSQL + SQLAlchemy 2.x，是为了学习一套通用、成熟的关系型业务开发方法。

## 安装依赖

```powershell
python -m pip install sqlalchemy asyncpg alembic
```

- SQLAlchemy：ORM 和 SQL 表达式。
- asyncpg：PostgreSQL 异步驱动。
- Alembic：数据库结构迁移。

异步应用 URL：

```text
postgresql+asyncpg://app:password@127.0.0.1:5432/knowledge
```

## Base 与命名约定

```python
# app/db/base.py
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

稳定约束名能让 Alembic 迁移、数据库排障和跨环境一致性更可靠。

## 时间和主键 Mixin

```python
# app/models/mixins.py
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
```

是否使用整数、UUID、ULID 取决于业务和团队规范。不要因为“分布式”概念就随意换主键；要考虑索引大小、排序局部性、暴露风险和跨系统生成要求。

## Article 模型

```python
# app/models/article.py
from enum import StrEnum

from sqlalchemy import Enum, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class ArticleStatus(StrEnum):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'


class Article(TimestampMixin, Base):
    __tablename__ = 'articles'
    __table_args__ = (
        UniqueConstraint('slug'),
        Index('ix_articles_status_created_at', 'status', 'created_at'),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ArticleStatus] = mapped_column(
        Enum(ArticleStatus, name='article_status'),
        default=ArticleStatus.DRAFT,
        nullable=False
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey('users.id', ondelete='RESTRICT'),
        nullable=False,
        index=True
    )
    author: Mapped['User'] = relationship(back_populates='articles')
```

模型设计需要明确：

- `nullable` 是否允许空值。
- 字符串最大长度。
- 唯一约束和组合唯一约束。
- 外键删除策略。
- 高频筛选和排序索引。
- 时间是否带时区。
- 状态是否用数据库 Enum 或字符串 + CHECK。

数据库约束是并发和多入口写入下的最终防线。Python 校验不能代替唯一约束和外键。

## Engine 与 Session

```python
# app/db/session.py
from collections.abc import AsyncGenerator

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
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800
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
```

关键点：

- Engine 是进程级资源，Session 是请求或业务用例级资源。
- AsyncSession 不能被多个并发 task 同时共享。
- `pool_pre_ping` 检测失效连接，不等于解决所有网络故障。
- 每个 worker 都有独立连接池，总连接数要按实例数反推。
- 不要把 Session 存成全局单例。

`expire_on_commit=False` 减少提交后访问属性触发刷新；但仍要清楚数据可能已被其他事务修改。

## 基本查询

```python
from sqlalchemy import select


async def get_article(session: AsyncSession, article_id: int):
    statement = select(Article).where(Article.id == article_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()
```

列表：

```python
result = await session.scalars(
    select(Article)
    .where(Article.status == ArticleStatus.PUBLISHED)
    .order_by(Article.created_at.desc())
    .limit(20)
)
articles = list(result)
```

新增：

```python
article = Article(
    title=payload.title,
    slug=payload.slug,
    content=payload.content,
    author_id=current_user.id
)
session.add(article)
await session.flush()
await session.commit()
await session.refresh(article)
```

`flush()` 把 SQL 发送到数据库但不提交事务，常用于获取数据库生成的主键或提前触发约束。`commit()` 才使事务持久化。

## 不使用 `create_all()` 管生产迁移

`Base.metadata.create_all()` 适合临时实验，不会安全描述已有表如何演进，也无法记录迁移历史。生产表结构必须通过 Alembic 迁移。

## 初始化 Alembic

```powershell
alembic init -t async alembic
```

在 `alembic/env.py` 中确保：

```python
from app.core.config import get_settings
from app.db.base import Base
from app.models import article, user

config.set_main_option('sqlalchemy.url', get_settings().database_url)
target_metadata = Base.metadata
```

必须导入模型模块，Alembic 才能在 metadata 中发现表。也可以由 `app/models/__init__.py` 统一导入。

## 生成和审查迁移

```powershell
alembic revision --autogenerate -m "create users and articles"
```

自动生成只是草稿，必须人工审查：

- 是否意外删除表、列或索引。
- 字段类型变化是否会丢数据。
- 新增非空列是否给现有行提供默认值或分阶段处理。
- Enum、默认值、外键和约束是否正确。
- upgrade 和 downgrade 是否符合回滚策略。

执行：

```powershell
alembic upgrade head
alembic current
alembic history
alembic downgrade -1
```

生产回滚数据库前必须评估数据是否已经按新结构写入。能执行 `downgrade` 不代表业务数据一定可逆。

## 安全增加非空字段

大表增加必填字段常用分阶段迁移：

1. 先增加可空列。
2. 发布兼容新旧列的应用。
3. 分批回填历史数据并验证。
4. 增加默认值或约束。
5. 将列改为非空。
6. 清理旧兼容代码。

直接在大表增加带复杂默认值的非空列，可能长时间锁表。

## 向后兼容发布

滚动发布期间，新旧应用可能同时运行。迁移遵循 expand/contract：

```text
扩展：先新增，新旧版本都能运行
迁移：新版本开始双读、双写或回填
收缩：所有实例升级后，再删除旧结构
```

删除列、重命名列、收紧约束是高风险操作，不能与依赖它的新代码无协调地一次发布。

## 索引基本原则

适合建索引：

- 主键和唯一字段。
- 外键。
- 高频 WHERE 条件。
- 高频 ORDER BY 与筛选组合。

注意：

- 索引会占空间并增加写入成本。
- 单列索引不一定能满足组合查询。
- 组合索引列顺序应根据真实查询和选择性设计。
- `LIKE '%keyword%'` 通常不能有效使用普通 B-tree。
- 用 `EXPLAIN ANALYZE` 基于真实数据验证，不凭感觉堆索引。

## 本章练习

1. 启动本地 PostgreSQL，创建独立开发数据库。
2. 定义 User、Article 表及唯一、外键、状态和时间字段。
3. 配置异步 Engine、SessionFactory 和 `get_db`。
4. 初始化 Alembic，生成首个迁移并逐行审查。
5. 执行升级、查询 current，再在测试数据库验证降级。

## 本章检查

- Session 不跨请求共享，也不被并发 task 共用。
- 表结构通过 Alembic 管理，不依赖生产启动时 `create_all()`。
- 唯一性、外键和必要约束落在数据库。
- 每个迁移都经过人工审查并考虑滚动发布兼容性。

