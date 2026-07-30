---
title: "FastAPI 从 0 到 1 08：CRUD、事务、关联、分页与查询"
slug: "fastapi-crud-transactions-relations-pagination"
summary: "在 PostgreSQL 文章项目中完成 slug 唯一约束、CRUD、分页筛选、事务和冲突处理，再理解关联加载、并发锁与批量操作。"
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
  - "CRUD"
  - "事务"
  - "分页"
status: "published"
sortOrder: 100
cover: ""
originalId: "6a6b57a2fca6347974f5d1a2"
originalSlug: "fastapi-crud-transactions-relations-pagination"
originalStatus: "published"
publishedAt: "2026-07-30T14:44:46.197Z"
updatedAt: "2026-07-30T14:44:46.197Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# FastAPI 从 0 到 1 08：CRUD、事务、关联、分页与查询

第 07 章已经把文章保存到 PostgreSQL。本章不急着加入十张表，先让一条核心业务链真正可用：

```text
创建 -> 列表/筛选/分页 -> 详情 -> 局部更新 -> 删除
```

同时解决三个真实问题：

- 两个请求创建相同 slug 时，只能成功一个。
- 列表不能一次返回全部数据。
- 业务失败时，数据库不能只提交一半。

## CRUD 不是四个装饰器

CRUD 是 Create、Read、Update、Delete 的缩写，但真实接口还需要：

```text
输入校验
  -> 权限范围
  -> 数据库约束
  -> 事务
  -> 错误转换
  -> 响应模型
  -> 测试
```

只写 `@router.post` 并 `session.add`，还不能算可交付功能。

## 第一步：给文章增加 slug、status 和 version

完整替换 `app/models/article.py`：

```python
from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ArticleStatus(StrEnum):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'


class Article(Base):
    __tablename__ = 'articles'
    __table_args__ = (
        UniqueConstraint('slug', name='uq_articles_slug'),
        CheckConstraint(
            "status IN ('draft', 'published', 'archived')",
            name='valid_status'
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(
        String(20),
        default=ArticleStatus.DRAFT,
        server_default=ArticleStatus.DRAFT,
        nullable=False,
        index=True
    )
    version: Mapped[int] = mapped_column(
        Integer,
        default=1,
        server_default='1',
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
```

新增字段用途：

| 字段 | 用途 |
| --- | --- |
| `slug` | 稳定、可读的文章标识，例如 `fastapi-routing` |
| `status` | 草稿、已发布、已归档 |
| `version` | 后续检测两人同时编辑造成的覆盖 |

### 为什么 slug 必须有数据库唯一约束

应用可以先查“是否存在”，但两个并发请求可能同时得到“不存在”，然后同时插入。只有数据库唯一约束能在最终写入点保证只成功一个。

显式命名 `uq_articles_slug`，后面捕获 IntegrityError 时可以确认冲突来自 slug，而不是其他约束。

### 为什么状态还有 CHECK

Pydantic 会检查 API 输入，但脚本、管理工具或其他服务也可能写数据库。CHECK 让数据库拒绝任意错误状态字符串。

## 第二步：迁移已有数据

不要直接生成并盲目执行迁移。当前表可能已有文章，新加非空且唯一的 slug 不能给所有旧行同一个默认值。

学习环境数据不重要时，最简单的做法是先清空文章；如果要保留数据，迁移应分阶段：

1. slug 先允许 NULL。
2. 为每条旧数据生成唯一 slug。
3. 增加唯一约束。
4. 再改为 NOT NULL。

生成迁移草稿：

```powershell
alembic revision --autogenerate -m "add article slug status version"
```

打开迁移文件审查。若数据库已有数据，不能把自动生成结果直接用于生产。学习阶段可以在确认不需保留本地文章后删除旧行，再执行：

```powershell
alembic upgrade head
```

生产迁移必须根据真实数据设计回填，不能照搬“清空数据”。

## 第三步：更新完整 Schema

`app/schemas.py` 中文章相关模型调整为：

```python
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


SLUG_PATTERN = r'^[a-z0-9]+(?:-[a-z0-9]+)*$'


class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    slug: str = Field(
        min_length=1,
        max_length=120,
        pattern=SLUG_PATTERN
    )
    content: str = Field(min_length=1, max_length=10_000)
    summary: str | None = Field(default=None, max_length=200)


class ArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    slug: str | None = Field(
        default=None,
        min_length=1,
        max_length=120,
        pattern=SLUG_PATTERN
    )
    content: str | None = Field(default=None, min_length=1, max_length=10_000)
    summary: str | None = Field(default=None, max_length=200)
    version: int = Field(ge=1)


class ArticleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    content: str
    summary: str | None
    status: str
    version: int
    created_at: datetime


class ArticleBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    summary: str | None
    status: str
    version: int
    created_at: datetime


class PageMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class ArticlePage(BaseModel):
    items: list[ArticleBrief]
    meta: PageMeta
```

### 列表为什么不用 ArticleRead

ArticleRead 包含完整正文。列表页一次返回 20 篇完整正文会浪费数据库、网络和前端渲染资源。ArticleBrief 只保留扫描列表需要的字段。

### 为什么更新请求带 version

客户端编辑时读到 version=2，提交更新时也带 2。数据库只在当前版本仍为 2 时更新，并把版本加到 3。若另一个人已经改成 3，本次更新影响 0 行，返回 409，避免静默覆盖。

## 第四步：增加冲突异常

在 `app/errors.py` 中加入：

```python
class ConflictError(AppError):
    code = 'RESOURCE_CONFLICT'
    status_code = 409


class ArticleSlugConflictError(ConflictError):
    code = 'ARTICLE_SLUG_CONFLICT'


class ArticleVersionConflictError(ConflictError):
    code = 'ARTICLE_VERSION_CONFLICT'
```

前端可以分别提示“换一个 slug”和“刷新后重新编辑”，不需要解析中文 message。

## 第五步：完整 Repository

完整替换 `app/repositories/article_repository.py`：

```python
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article


async def list_articles(
    session: AsyncSession,
    *,
    page: int,
    page_size: int,
    keyword: str | None,
    status: str | None
) -> tuple[list[Article], int]:
    filters = []
    if keyword:
        filters.append(Article.title.ilike(f'%{keyword}%'))
    if status:
        filters.append(Article.status == status)

    total = int(await session.scalar(
        select(func.count())
        .select_from(Article)
        .where(*filters)
    ) or 0)

    rows = await session.scalars(
        select(Article)
        .where(*filters)
        .order_by(Article.created_at.desc(), Article.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(rows), total


async def get_by_id(
    session: AsyncSession,
    article_id: int
) -> Article | None:
    return await session.get(Article, article_id)


def add(session: AsyncSession, article: Article) -> None:
    session.add(article)


async def update_with_version(
    session: AsyncSession,
    *,
    article_id: int,
    expected_version: int,
    changes: dict
) -> bool:
    statement = (
        update(Article)
        .where(
            Article.id == article_id,
            Article.version == expected_version
        )
        .values(
            **changes,
            version=Article.version + 1
        )
    )
    result = await session.execute(statement)
    return result.rowcount == 1


async def delete(session: AsyncSession, article: Article) -> None:
    await session.delete(article)
```

## 分页查询逐段解释

### 动态筛选列表

```python
filters = []
if keyword:
    filters.append(...)
if status:
    filters.append(...)
```

只把客户端真正提供的筛选加入 SQL。`where(*filters)` 中的 `*` 把列表展开为多个条件。

### 总数和当前页是两次查询

- count 查询得到符合筛选的总条数。
- list 查询用 offset 和 limit 只取当前页。

后台表格通常需要总数和跳页，所以这种 Offset 分页很实用。

### 稳定排序

```python
.order_by(Article.created_at.desc(), Article.id.desc())
```

多个文章可能有相同 created_at，再加唯一 ID 作为第二排序键，顺序才稳定。

### Offset 怎样计算

```python
(page - 1) * page_size
```

| page | page_size | 跳过 |
| --- | --- | --- |
| 1 | 20 | 0 |
| 2 | 20 | 20 |
| 3 | 20 | 40 |

大偏移量会越来越慢，信息流场景可改游标分页，后文再讲。

## 第六步：Service 中处理事务和冲突

下面是本章需要替换的核心方法。导入：

```python
from math import ceil

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import (
    ArticleNotFoundError,
    ArticleSlugConflictError,
    ArticleVersionConflictError
)
from app.models.article import Article, ArticleStatus
from app.repositories import article_repository
from app.schemas import ArticleCreate, ArticleUpdate
```

列表：

```python
async def list_articles(
    session: AsyncSession,
    *,
    page: int,
    page_size: int,
    keyword: str | None,
    status: str | None
) -> dict:
    items, total = await article_repository.list_articles(
        session,
        page=page,
        page_size=page_size,
        keyword=keyword,
        status=status
    )
    return {
        'items': items,
        'meta': {
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': ceil(total / page_size) if total else 0
        }
    }
```

创建：

```python
async def create_article(
    session: AsyncSession,
    payload: ArticleCreate
) -> Article:
    article = Article(
        **payload.model_dump(),
        status=ArticleStatus.DRAFT
    )
    article_repository.add(session, article)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        constraint_name = getattr(exc.orig, 'constraint_name', None)
        if constraint_name == 'uq_articles_slug':
            raise ArticleSlugConflictError('文章 slug 已存在') from None
        raise

    await session.refresh(article)
    return article
```

更新：

```python
async def update_article(
    session: AsyncSession,
    article_id: int,
    payload: ArticleUpdate
) -> Article:
    article = await get_article(session, article_id)
    changes = payload.model_dump(
        exclude_unset=True,
        exclude={'version'}
    )

    try:
        updated = await article_repository.update_with_version(
            session,
            article_id=article.id,
            expected_version=payload.version,
            changes=changes
        )
        if not updated:
            raise ArticleVersionConflictError('文章已被其他人修改')
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        constraint_name = getattr(exc.orig, 'constraint_name', None)
        if constraint_name == 'uq_articles_slug':
            raise ArticleSlugConflictError('文章 slug 已存在') from None
        raise
    except Exception:
        await session.rollback()
        raise

    return await get_article(session, article_id)
```

### 为什么捕获后必须 rollback

数据库语句发生 IntegrityError 后，当前事务处于失败状态。继续使用前必须回滚，否则后续 SQL 也会失败。

### 为什么不能把所有 IntegrityError 都说成 slug 重复

IntegrityError 还可能来自非空、外键和其他唯一约束。只有约束名是 `uq_articles_slug` 时，才转换成 slug 冲突；其他错误继续抛出，让日志暴露真正问题。

### `from None`

```python
raise ArticleSlugConflictError(...) from None
```

向客户端表达的是业务冲突，不需要把底层数据库异常链作为接口错误。服务端若要诊断，可以在转换前记录必要上下文，但不能记录敏感数据。

## 第七步：Router 分页参数

列表路由改为：

```python
from typing import Annotated, Literal

from fastapi import Query

from app.models.article import ArticleStatus
from app.schemas import ArticlePage


@router.get('', response_model=ArticlePage)
async def list_articles(
    session: DbSessionDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    keyword: Annotated[
        str | None,
        Query(min_length=1, max_length=50)
    ] = None,
    status: ArticleStatus | None = None
):
    return await services.list_articles(
        session,
        page=page,
        page_size=page_size,
        keyword=keyword,
        status=status
    )
```

请求示例：

```text
GET /articles?page=2&page_size=10&status=draft&keyword=fastapi
```

`page_size` 上限是保护服务端资源，不应完全信任前端“不会传太大”。

## 事务到底保证什么

事务保证一组数据库修改要么全部提交，要么全部回滚。

假设发布文章需要：

1. 把文章状态改成 published。
2. 写一条审核记录。
3. 写一条审计日志。

应该在同一事务内：

```python
async with session.begin():
    article.status = ArticleStatus.PUBLISHED
    session.add(review_record)
    session.add(audit_log)
```

任一步失败，三步都不提交。

外部邮件不能放进持锁事务：

```text
数据库事务内：更新文章 + 写待发送事件
提交后：独立 worker 发送邮件
```

否则邮件服务超时会让数据库事务长时间占连接和锁。

一个项目要统一事务所有权。本教程由 Service 提交；Repository 不 commit；Router 不直接操作事务。

## 一对多关系

第 09 章加入 User 后，用户和文章是一对多：一个用户有多篇文章，一篇文章只有一个作者。

局部示例：

```python
class User(Base):
    articles: Mapped[list['Article']] = relationship(
        back_populates='author'
    )


class Article(Base):
    author_id: Mapped[int] = mapped_column(
        ForeignKey('users.id', ondelete='RESTRICT'),
        nullable=False,
        index=True
    )
    author: Mapped['User'] = relationship(
        back_populates='articles'
    )
```

外键放在“多”的一方，也就是 articles 表。

## 多对多关系

文章和标签是多对多：一篇文章有多个标签，一个标签属于多篇文章。

局部示例：

```python
from sqlalchemy import Column, ForeignKey, Table

article_tags = Table(
    'article_tags',
    Base.metadata,
    Column(
        'article_id',
        ForeignKey('articles.id', ondelete='CASCADE'),
        primary_key=True
    ),
    Column(
        'tag_id',
        ForeignKey('tags.id', ondelete='CASCADE'),
        primary_key=True
    )
)
```

两个主键列共同保证同一文章和标签不能重复关联。若关联本身还需要排序、创建人、创建时间，就把中间表定义成独立 ORM Model。

## N+1 查询是什么

先查询 20 篇文章，再逐篇访问 author，如果每次访问都额外发一条 SQL：

```text
1 条文章列表 SQL
+ 20 条作者 SQL
= 21 条 SQL
```

这就是 N+1。

显式预加载：

```python
from sqlalchemy.orm import selectinload

statement = select(Article).options(
    selectinload(Article.author),
    selectinload(Article.tags)
)
```

- `selectinload` 常适合集合关系。
- `joinedload` 可用于部分多对一、一对一。
- `lazy='raise'` 能在意外懒加载时立即报错。

异步 ORM 更不能依赖响应序列化阶段偷偷查询。响应会访问的关联应在 Repository 明确加载。

## 游标分页什么时候用

Offset 适合后台表格：跳页、总数、指定页码。

信息流或百万级深翻页可以使用游标：

```text
GET /articles?limit=20&after=opaque_cursor
```

游标通常编码上一页最后一条的 `(created_at, id)`，下一页查询“小于这个组合”的记录。

游标应签名或安全编码，不能把客户端任意字符串直接拼 SQL。第一次项目先把 Offset 做正确，不要同时实现两套分页。

## 安全排序

客户端不能直接传数据库列或 SQL 片段。使用白名单：

```python
sort_columns = {
    'created_at': Article.created_at,
    'title': Article.title
}

column = sort_columns[sort_by]
order_by = column.desc() if direction == 'desc' else column.asc()
```

这样既防止 SQL 注入，也避免开放未评估的昂贵排序字段。

## 悲观锁和乐观锁

本章实际实现的是乐观锁：默认冲突少，不提前锁行，提交时检查 version。

悲观锁局部示例：

```python
statement = (
    select(Article)
    .where(Article.id == article_id)
    .with_for_update()
)
```

它会锁住行，让其他事务等待。适合确实需要串行修改的短事务，但要注意等待、死锁和锁顺序。绝不能持锁调用外部 HTTP。

## 批量操作必须先定语义

批量发布前先回答：

- 是全部成功或全部失败，还是允许部分成功？
- 单次最多多少条？
- 每条是否做对象级权限？
- 部分失败怎样返回？
- 审计日志按批次还是按资源？

不要在循环中逐条 commit。根据业务选择单事务或明确的分批事务。

## 验证流程

1. 创建 slug 为 `fastapi-guide` 的文章，得到 201。
2. 再创建相同 slug，得到 409 和 `ARTICLE_SLUG_CONFLICT`。
3. 创建 25 篇测试文章，访问 page=2、page_size=20，确认当前页 5 条。
4. 用 version=1 修改文章，响应 version 变 2。
5. 再拿旧 version=1 更新，得到 `ARTICLE_VERSION_CONFLICT`。
6. 重启 API，确认数据和 version 仍在。

## 常见错误

### 预检查后仍出现数据库唯一异常

这是并发正常边界。预检查只优化提示，数据库约束才是最终保证，必须捕获真实约束冲突。

### 更新接口把 version 写成客户端值

version 只用于 WHERE 比较，真正的新版本由数据库 `version + 1` 生成。不要把 payload.version 放进普通 changes。

### total 与 items 筛选不一致

count 查询和 list 查询必须使用同一组 filters，否则分页总数错误。集中构造筛选条件。

### 相同时间排序不稳定

排序最后加唯一键 ID，保证稳定。

### Repository 自动 commit

Repository 一旦自行提交，上层多个写操作无法组成完整事务。提交由 Service 控制。

## Express 对照：Mongoose 分页、事务与并发冲突

下面的列表查询与本章 SQLAlchemy 版本保持同一契约：筛选条件同时用于 `items` 和 `total`，排序字段固定白名单，并使用稳定的第二排序键。

```js
export async function listArticles({ keyword, page = 1, pageSize = 20 }) {
  const filter = keyword
    ? { title: { $regex: escapeRegExp(keyword), $options: 'i' } }
    : {}

  const [items, total] = await Promise.all([
    Article.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Article.countDocuments(filter)
  ])

  return { items, total, page, pageSize }
}
```

需要原子写入多份文档时显式开启事务：

```js
export async function createArticleWithAudit(payload) {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const article = await Article.create([payload], { session })
      await AuditLog.create([{ action: 'ARTICLE_CREATED' }], { session })
      return article[0]
    })
  } finally {
    await session.endSession()
  }
}
```

启用 Mongoose `optimisticConcurrency` 后，保存过期文档会抛出 `VersionError`。Service 应把它转换成稳定的 409 冲突错误，而不是静默覆盖后来提交的数据。MongoDB 事务还要求副本集环境，单机开发实例不一定能直接验证，这一点要写进运行说明和测试环境配置。

## 本章动手改

1. 增加 `sort_by` 和 `direction`，只允许白名单字段。
2. 为公开文章列表固定 `status=published`，不允许客户端取消。
3. 创建 Category 表并实现文章多对一分类。
4. 用 SQL 日志观察加载分类前后的查询数量。
5. 为“发布文章 + 审计记录”设计一个事务失败测试。

## 本章完成检查

- slug 由数据库唯一约束保证，并准确转换为 409。
- 列表有 page_size 上限、总数和稳定排序。
- 列表响应不返回完整正文。
- PATCH 使用 version 防止静默覆盖。
- Repository 不 commit，事务由 Service 控制。
- 能解释一对多、多对多和 N+1，但不会为了展示概念一次建完所有表。

下一章加入 User、密码哈希、登录令牌和“只能修改自己的文章”。它会在本章 Article 表上新增 author_id，而不是假设用户模型已经存在。
