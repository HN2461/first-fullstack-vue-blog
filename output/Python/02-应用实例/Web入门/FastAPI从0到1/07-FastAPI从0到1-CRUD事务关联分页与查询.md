---
title: FastAPI 从 0 到 1 07：CRUD、事务、关联、分页与查询
slug: fastapi-crud-transactions-relations-pagination
summary: 以文章业务实现 Service、Repository、事务、关联加载、分页筛选、并发控制和批量操作。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - CRUD
  - 事务
  - 分页
status: draft
cover:
---

# FastAPI 从 0 到 1 07：CRUD、事务、关联、分页与查询

## 一条业务请求的分层

```text
Router：HTTP 参数、状态码、响应模型
  -> Service：业务规则、权限前置、事务边界
      -> Repository：查询表达式和持久化细节
          -> AsyncSession / PostgreSQL
```

Router 应薄，Service 应能表达“创建文章”“发布文章”等用例，Repository 聚焦数据访问。不要让路由同时处理密码、SQL、事务和邮件发送。

## Repository 示例

```python
# app/repositories/article_repository.py
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.article import Article, ArticleStatus


async def get_by_id(
    session: AsyncSession,
    article_id: int
) -> Article | None:
    return await session.scalar(
        select(Article).where(Article.id == article_id)
    )


async def get_detail(
    session: AsyncSession,
    article_id: int
) -> Article | None:
    return await session.scalar(
        select(Article)
        .options(
            selectinload(Article.author),
            selectinload(Article.tags)
        )
        .where(Article.id == article_id)
    )


async def exists_by_slug(session: AsyncSession, slug: str) -> bool:
    return bool(await session.scalar(
        select(
            select(Article.id)
            .where(Article.slug == slug)
            .exists()
        )
    ))
```

Repository 不要默认 `commit()`。提交时机属于完整业务用例，否则多个操作无法组成一个事务。

## Service 创建文章

```python
from sqlalchemy.exc import IntegrityError

from app.core.errors import ConflictError


async def create_article(
    session: AsyncSession,
    payload: ArticleCreate,
    *,
    author_id: int
) -> Article:
    article = Article(
        **payload.model_dump(exclude={'tag_ids'}),
        author_id=author_id,
        status=ArticleStatus.DRAFT
    )
    session.add(article)

    try:
        await session.flush()
        await sync_article_tags(session, article, payload.tag_ids)
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        if is_slug_unique_violation(exc):
            raise ConflictError('文章 slug 已存在') from None
        raise

    await session.refresh(article)
    return article
```

可以先查询 slug 提供更友好提示，但并发请求可能同时通过预检查。数据库唯一约束和 `IntegrityError` 处理才是最终保证。

不要把所有 `IntegrityError` 都翻译成“slug 重复”。它也可能来自其他唯一约束、外键或非空约束，应根据数据库约束名识别。

## Router 调用 Service

```python
@router.post('', response_model=ArticleRead, status_code=201)
async def create_article_api(
    payload: ArticleCreate,
    session: DbSessionDep,
    current_user: CurrentUserDep
):
    return await article_service.create_article(
        session,
        payload,
        author_id=current_user.id
    )
```

身份来自认证依赖，不接受客户端提交 `author_id`。

## 更新与 `exclude_unset`

```python
async def update_article(
    session: AsyncSession,
    article: Article,
    payload: ArticleUpdate
) -> Article:
    changes = payload.model_dump(exclude_unset=True, exclude={'tag_ids'})
    for field, value in changes.items():
        setattr(article, field, value)

    if 'tag_ids' in payload.model_fields_set:
        await sync_article_tags(session, article, payload.tag_ids or [])

    await session.commit()
    await session.refresh(article)
    return article
```

`model_fields_set` 可判断字段是否真的传入。这样能区分“不修改标签”和“显式清空标签”。

## 删除、软删除和归档

三种语义：

- 物理删除：数据库行被删除，适合无恢复要求的临时数据。
- 软删除：写 `deleted_at`，所有查询必须排除，唯一约束和关联处理更复杂。
- 业务归档：状态变为 archived，仍属于正常业务生命周期。

不要把软删除当万能方案。它会影响唯一约束、统计、关联和查询性能。需要恢复、审计或法规留存时再设计，并集中封装默认查询条件。

## 一对多关系

```python
class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    articles: Mapped[list['Article']] = relationship(
        back_populates='author'
    )
```

外键放在“多”的一方，即 `articles.author_id`。

## 多对多关系

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


class Article(Base):
    # 省略其他字段
    tags: Mapped[list['Tag']] = relationship(
        secondary=article_tags,
        back_populates='articles',
        lazy='raise'
    )
```

当中间表还需要 `created_at`、`operator_id`、排序等字段时，应把关联表建成独立 ORM 模型，而不是简单 `Table`。

## 避免 N+1 查询

查询 20 篇文章后逐篇访问作者，如果每篇再发一次 SQL，就形成 N+1。

```python
statement = (
    select(Article)
    .options(
        selectinload(Article.author),
        selectinload(Article.tags)
    )
)
```

- `selectinload`：通常适合一对多、多对多集合。
- `joinedload`：适合部分多对一或一对一，但集合 join 会放大行数。
- `lazy='raise'`：可在开发时阻止意外懒加载。

异步 ORM 中尤其要显式预加载响应序列化会访问的关联。

## Offset 分页

```python
from math import ceil


async def list_articles(
    session: AsyncSession,
    *,
    page: int,
    page_size: int,
    keyword: str | None,
    status: ArticleStatus | None
):
    filters = []
    if keyword:
        escaped = keyword.replace('%', r'\%').replace('_', r'\_')
        filters.append(Article.title.ilike(f'%{escaped}%', escape='\\'))
    if status:
        filters.append(Article.status == status)

    total = int(await session.scalar(
        select(func.count()).select_from(Article).where(*filters)
    ) or 0)

    rows = await session.scalars(
        select(Article)
        .where(*filters)
        .order_by(Article.created_at.desc(), Article.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    return {
        'items': list(rows),
        'meta': {
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': ceil(total / page_size) if total else 0
        }
    }
```

排序增加唯一键 `id`，保证相同时间值下顺序稳定。大偏移量会越来越慢，频繁变化的数据还会出现重复或遗漏。

## 游标分页

```text
GET /articles?limit=20&after=opaque_cursor
```

游标可编码上一页最后一条的 `(created_at, id)`，查询条件为“小于上一条”，再按相同字段排序。游标应被签名或安全编码，不能信任客户端随意构造。

游标分页适合信息流、大数据量、连续加载；Offset 适合后台表格跳页和总数展示。接口契约应明确选择。

## 安全排序

不要把客户端 `sort` 直接拼到 SQL：

```python
sort_columns = {
    'created_at': Article.created_at,
    'updated_at': Article.updated_at,
    'title': Article.title
}
column = sort_columns[filters.sort_by]
order_by = column.desc() if filters.direction == 'desc' else column.asc()
```

使用白名单映射，避免 SQL 注入和未索引字段造成昂贵查询。

## 事务边界

“发布文章”可能需要：

1. 更新文章状态和发布时间。
2. 写审计日志。
3. 写站内通知待发送记录。

前三步如果属于同一个数据库一致性要求，应在一个事务中提交。真正发送邮件或消息不应在数据库事务中执行，否则外部超时会长时间占锁。可使用 Outbox：事务内写待发送事件，独立 worker 稍后投递。

```python
async with session.begin():
    article.status = ArticleStatus.PUBLISHED
    session.add(AuditLog(...))
    session.add(OutboxEvent(...))
```

如果 `get_db` 或上层已经控制事务，就不要随意嵌套 `begin()`；项目应统一事务所有权。

## 乐观锁

两个管理员同时编辑同一文章，后提交者可能覆盖前者。可增加 `version`：

```sql
UPDATE articles
SET title = :title, version = version + 1
WHERE id = :id AND version = :expected_version
```

受影响行数为 0 表示发生并发冲突，返回 409，让客户端刷新后处理。SQLAlchemy 也支持 version id 配置。

## 悲观锁

```python
statement = (
    select(Article)
    .where(Article.id == article_id)
    .with_for_update()
)
```

只在确需串行修改的短事务中使用。锁范围过大、顺序不一致会造成等待和死锁。外部 HTTP 调用不能放在持锁事务中。

## 批量操作

批量接口要明确：

- 全部成功或部分成功。
- 最大条数。
- 单条错误如何返回。
- 是否逐条做对象级权限。
- 审计日志如何记录。

不要在循环里逐条 `commit()`。可以分批执行，按业务要求使用单事务或明确的部分成功结果。

## 本章练习

1. 实现文章创建、详情、更新、归档和删除。
2. 创建分类一对多、标签多对多关系。
3. 列表支持分页、状态、分类、关键词和安全排序。
4. 用 SQL 日志观察并修复 N+1。
5. 模拟两个并发请求创建同 slug，确认只成功一个且另一个返回 409。
6. 为文章编辑增加乐观锁版本字段。

## 本章检查

- Router 不直接编排复杂事务。
- Repository 不随意提交事务。
- 并发唯一性由数据库约束保证。
- 关联在响应前按需预加载。
- 排序字段使用白名单，分页有大小上限和稳定排序。

