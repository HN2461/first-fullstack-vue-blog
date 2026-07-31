---
title: "第 15 篇：企业知识库 API 综合实战：审核流、状态机、权限依赖、事务测试"
slug: "fastapi-enterprise-knowledge-api-capstone"
summary: "FastAPI 企业知识库 API 综合实战，基于文章项目实现作者提交审核、审核员通过或驳回、状态机、审核记录、权限依赖、数据库事务和自动化测试。"
category: "Web入门"
tags:
  - "Python"
  - "FastAPI"
  - "企业实战"
  - "知识库"
  - "审核流"
status: "draft"
sortOrder: 160
cover: ""
originalId: "6a6b57a2fca6347974f5d1ae"
originalSlug: "fastapi-enterprise-knowledge-api-capstone"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 15 篇：企业知识库 API 综合实战：审核流、状态机、权限依赖、事务测试

综合实战不能只给一张需求表。本章要在前面已经运行的项目中，交付一条完整业务链：

```text
编辑创建草稿
  -> 提交审核
  -> 审核员查看待审核文章
  -> 通过并发布，或填写原因驳回
  -> 状态变化与审核记录在同一事务提交
  -> 自动化测试成功、越权和非法状态
```

这是知识库最核心的纵向切片。媒体、Redis、搜索和导出都可以以后增加；如果文章状态和权限都不可靠，先加基础设施没有意义。

## 本章前置结果

开始前确认第 09、12 章项目已经具备：

- User、Article 和 author_id。
- 注册、登录、CurrentUserDep。
- PostgreSQL、AsyncSession、Alembic。
- Router、Service、Repository 分层。
- 统一 AppError。
- 独立 PostgreSQL 测试库。

如果这些还没有跑通，请先回到对应章节。综合章不会重新复制每一个基础文件。

## 一、先写清业务规则

角色：

| 角色 | 本章权限 |
| --- | --- |
| editor | 创建、修改自己的草稿，提交审核 |
| reviewer | 查看待审核文章，通过或驳回 |
| admin | 拥有 reviewer 能力，后续扩展管理功能 |

状态：

```text
draft -> pending_review -> published
                  |
                  v
               rejected -> pending_review
```

规则：

1. 新文章只能由服务端设为 draft。
2. 作者只能编辑 draft 或 rejected。
3. 只有作者能提交自己的文章。
4. 提交时标题、slug、正文必须存在。
5. reviewer/admin 才能审核。
6. 只有 pending_review 能通过或驳回。
7. 驳回必须填写原因。
8. 每次审核都写 ReviewRecord。
9. 文章状态与 ReviewRecord 要么一起提交，要么一起回滚。

先写规则再写路由，可以避免“前端有什么按钮就临时加一个接口”。

## 二、第一版角色为什么先用一列

为了让本章可独立跑通，User 先增加：

```python
role: Mapped[str] = mapped_column(
    String(20),
    default='editor',
    server_default='editor',
    nullable=False
)
```

这是一种适合单体小项目的简单角色控制，角色很少且权限组合固定。它不是复杂企业系统的最终 RBAC。

当出现“自定义角色、一个用户多个角色、动态配置权限”时，升级为：

```text
roles
permissions
user_roles
role_permissions
```

本章先把状态、对象范围和事务做正确，不用五张权限表掩盖核心流程。文末给出升级验收标准。

## 三、更新 Article Model

`app/models/article.py` 的状态改为：

```python
class ArticleStatus(StrEnum):
    DRAFT = 'draft'
    PENDING_REVIEW = 'pending_review'
    PUBLISHED = 'published'
    REJECTED = 'rejected'
```

原 CHECK 约束也要同步允许四个值：

```python
CheckConstraint(
    "status IN ('draft', 'pending_review', 'published', 'rejected')",
    name='valid_status'
)
```

Article 增加时间字段：

```python
submitted_at: Mapped[datetime | None] = mapped_column(
    DateTime(timezone=True)
)
published_at: Mapped[datetime | None] = mapped_column(
    DateTime(timezone=True)
)
```

为什么时间不能只看 updated_at？

- updated_at 可能因改摘要、修标签而变化。
- submitted_at 明确回答何时提交审核。
- published_at 明确回答何时正式公开。

## 四、完整 ReviewRecord Model

创建 `app/models/review_record.py`：

```python
from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ReviewAction(StrEnum):
    APPROVE = 'approve'
    REJECT = 'reject'


class ReviewRecord(Base):
    __tablename__ = 'review_records'

    id: Mapped[int] = mapped_column(primary_key=True)
    article_id: Mapped[int] = mapped_column(
        ForeignKey('articles.id', ondelete='RESTRICT'),
        nullable=False,
        index=True
    )
    reviewer_id: Mapped[int] = mapped_column(
        ForeignKey('users.id', ondelete='RESTRICT'),
        nullable=False,
        index=True
    )
    action: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )
    reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
```

设计说明：

- ReviewRecord 是历史事实，不随 Article 级联删除。
- reviewer_id 记录真正执行人，不能由请求体指定。
- reason 对通过可空，对驳回由 Service 强制非空。
- action 使用稳定英文值，展示中文由前端或字典处理。

在 `app/models/__init__.py` 导入 ReviewRecord，Alembic 才能发现表。

## 五、迁移不能只改 Model

生成：

```powershell
alembic revision --autogenerate -m "add article review workflow"
```

审查重点：

1. users 新增 role，已有用户默认 editor。
2. articles 状态 CHECK 先删除旧约束再创建新约束。
3. submitted_at、published_at 允许 NULL。
4. review_records 两个外键和索引正确。
5. downgrade 能按依赖逆序删除。

执行：

```powershell
alembic upgrade head
alembic current
```

手工把一个测试用户设为 reviewer，只用于本地开发：

```sql
UPDATE users
SET role = 'reviewer'
WHERE email = 'reviewer@example.com';
```

生产项目需要管理员接口、审计和“最后一个管理员保护”，不能让普通用户注册时选择 reviewer。

## 六、把状态规则写成纯函数

创建 `app/domain/__init__.py` 空文件，再创建 `app/domain/article_rules.py`：

```python
from app.models.article import ArticleStatus


ALLOWED_TRANSITIONS = {
    ArticleStatus.DRAFT: {ArticleStatus.PENDING_REVIEW},
    ArticleStatus.REJECTED: {ArticleStatus.PENDING_REVIEW},
    ArticleStatus.PENDING_REVIEW: {
        ArticleStatus.PUBLISHED,
        ArticleStatus.REJECTED
    },
    ArticleStatus.PUBLISHED: set()
}


def can_transition(
    current: str,
    target: ArticleStatus
) -> bool:
    try:
        current_status = ArticleStatus(current)
    except ValueError:
        return False

    return target in ALLOWED_TRANSITIONS[current_status]
```

逐段解释：

- 字典的键是当前状态。
- 集合中的值是允许到达的目标状态。
- `draft` 和 `rejected` 都能提交到 pending_review。
- `pending_review` 能发布或驳回。
- `published` 当前没有后续状态。

它没有数据库、HTTP 和当前用户，是纯函数，适合快速覆盖所有状态组合。

## 七、增加业务异常

`app/errors.py` 增加：

```python
class ForbiddenError(AppError):
    code = 'FORBIDDEN'
    status_code = 403


class ArticleInvalidTransitionError(ConflictError):
    code = 'ARTICLE_INVALID_TRANSITION'
```

- 没有审核角色返回 403。
- 文章当前状态不允许该动作返回 409。

状态冲突不是参数格式错误，因此不返回 422。

## 八、角色依赖

在 `app/deps.py` 增加：

```python
from typing import Annotated

from fastapi import Depends

from app.errors import ForbiddenError


async def require_reviewer(
    current_user: CurrentUserDep
) -> User:
    if current_user.role not in {'reviewer', 'admin'}:
        raise ForbiddenError('需要文章审核权限')
    return current_user


ReviewerDep = Annotated[User, Depends(require_reviewer)]
```

执行链：

```text
ReviewerDep
  -> 先执行 CurrentUserDep，确认身份和用户状态
  -> 再检查 role
  -> 成功后把同一个 User 交给审核路由
```

Router 不必重复写认证和角色判断。

## 九、Repository 查询要带数据范围

文章 Repository 增加作者查询：

```python
async def get_owned_article(
    session: AsyncSession,
    *,
    article_id: int,
    author_id: int
) -> Article | None:
    return await session.scalar(
        select(Article).where(
            Article.id == article_id,
            Article.author_id == author_id
        )
    )
```

待审核列表：

```python
async def list_pending_articles(
    session: AsyncSession
) -> list[Article]:
    result = await session.scalars(
        select(Article)
        .where(Article.status == ArticleStatus.PENDING_REVIEW)
        .order_by(Article.submitted_at.asc(), Article.id.asc())
    )
    return list(result)
```

审核员按普通 ID 查询待审核文章时也应固定状态：

```python
async def get_pending_article(
    session: AsyncSession,
    article_id: int
) -> Article | None:
    return await session.scalar(
        select(Article).where(
            Article.id == article_id,
            Article.status == ArticleStatus.PENDING_REVIEW
        )
    )
```

不要让客户端通过 Query 取消服务端必须施加的权限或状态范围。

## 十、审核请求 Schema

在 `app/schemas.py` 增加：

```python
class ReviewDecision(BaseModel):
    reason: str | None = Field(default=None, max_length=500)


class ReviewRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    article_id: int
    reviewer_id: int
    action: str
    reason: str | None
    created_at: datetime
```

通过可以不填 reason，驳回必须填的规则由 reject Service 判断，因为它取决于具体业务动作，不只是字段格式。

## 十一、完整工作流 Service

创建 `app/workflow_service.py`：

```python
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.article_rules import can_transition
from app.errors import (
    ArticleInvalidTransitionError,
    ArticleNotFoundError
)
from app.models.article import Article, ArticleStatus
from app.models.review_record import ReviewAction, ReviewRecord
from app.repositories import article_repository


async def submit_article(
    session: AsyncSession,
    *,
    article_id: int,
    author_id: int
) -> Article:
    article = await article_repository.get_owned_article(
        session,
        article_id=article_id,
        author_id=author_id
    )
    if article is None:
        raise ArticleNotFoundError('文章不存在')

    if not can_transition(
        article.status,
        ArticleStatus.PENDING_REVIEW
    ):
        raise ArticleInvalidTransitionError('当前状态不能提交审核')

    if not article.title.strip() or not article.content.strip():
        raise ArticleInvalidTransitionError('标题和正文不能为空')

    article.status = ArticleStatus.PENDING_REVIEW
    article.submitted_at = datetime.now(UTC)
    await session.commit()
    await session.refresh(article)
    return article


async def approve_article(
    session: AsyncSession,
    *,
    article_id: int,
    reviewer_id: int,
    reason: str | None
) -> Article:
    article = await article_repository.get_pending_article(
        session,
        article_id
    )
    if article is None:
        raise ArticleNotFoundError('待审核文章不存在')

    if not can_transition(
        article.status,
        ArticleStatus.PUBLISHED
    ):
        raise ArticleInvalidTransitionError('当前状态不能发布')

    article.status = ArticleStatus.PUBLISHED
    article.published_at = datetime.now(UTC)
    session.add(ReviewRecord(
        article_id=article.id,
        reviewer_id=reviewer_id,
        action=ReviewAction.APPROVE,
        reason=reason
    ))

    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise

    await session.refresh(article)
    return article


async def reject_article(
    session: AsyncSession,
    *,
    article_id: int,
    reviewer_id: int,
    reason: str | None
) -> Article:
    cleaned_reason = (reason or '').strip()
    if not cleaned_reason:
        raise ArticleInvalidTransitionError('驳回必须填写原因')

    article = await article_repository.get_pending_article(
        session,
        article_id
    )
    if article is None:
        raise ArticleNotFoundError('待审核文章不存在')

    if not can_transition(
        article.status,
        ArticleStatus.REJECTED
    ):
        raise ArticleInvalidTransitionError('当前状态不能驳回')

    article.status = ArticleStatus.REJECTED
    session.add(ReviewRecord(
        article_id=article.id,
        reviewer_id=reviewer_id,
        action=ReviewAction.REJECT,
        reason=cleaned_reason
    ))

    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise

    await session.refresh(article)
    return article
```

## 十二、事务边界说明

审核函数在一次 Session 事务中完成：

```text
修改 article.status
+ session.add(review_record)
-> commit 一次
```

若 ReviewRecord 因外键或数据库故障写入失败，commit 失败并 rollback，文章状态也不会发布。

不要写成：

```text
先 commit 文章
再 commit 审核记录
```

否则第二次失败会留下“已发布但没有审核记录”的半成品。

本章没有在事务中发送邮件。需要通知作者时，事务内再写 OutboxEvent，提交后由 worker 异步发送。

## 十三、工作流 Router

创建 `app/routers/workflow.py`：

```python
from fastapi import APIRouter

from app import workflow_service
from app.db.session import DbSessionDep
from app.deps import CurrentUserDep, ReviewerDep
from app.repositories import article_repository
from app.schemas import ArticleBrief, ArticleRead, ReviewDecision

router = APIRouter(tags=['article-workflow'])


@router.post(
    '/articles/{article_id}/submit',
    response_model=ArticleRead
)
async def submit_article(
    article_id: int,
    session: DbSessionDep,
    current_user: CurrentUserDep
):
    return await workflow_service.submit_article(
        session,
        article_id=article_id,
        author_id=current_user.id
    )


@router.get(
    '/reviews/articles',
    response_model=list[ArticleBrief]
)
async def list_pending_articles(
    session: DbSessionDep,
    reviewer: ReviewerDep
):
    return await article_repository.list_pending_articles(session)


@router.post(
    '/reviews/articles/{article_id}/approve',
    response_model=ArticleRead
)
async def approve_article(
    article_id: int,
    payload: ReviewDecision,
    session: DbSessionDep,
    reviewer: ReviewerDep
):
    return await workflow_service.approve_article(
        session,
        article_id=article_id,
        reviewer_id=reviewer.id,
        reason=payload.reason
    )


@router.post(
    '/reviews/articles/{article_id}/reject',
    response_model=ArticleRead
)
async def reject_article(
    article_id: int,
    payload: ReviewDecision,
    session: DbSessionDep,
    reviewer: ReviewerDep
):
    return await workflow_service.reject_article(
        session,
        article_id=article_id,
        reviewer_id=reviewer.id,
        reason=payload.reason
    )
```

在 `main.py` 挂载：

```python
from app.routers.workflow import router as workflow_router

application.include_router(workflow_router)
```

Router 只负责身份依赖、参数和响应模型；状态转换与事务全部在 workflow_service。

## 十四、状态机单元测试

创建 `tests/test_article_rules.py`：

```python
import pytest

from app.domain.article_rules import can_transition
from app.models.article import ArticleStatus


@pytest.mark.parametrize(
    ('current', 'target', 'allowed'),
    [
        ('draft', ArticleStatus.PENDING_REVIEW, True),
        ('rejected', ArticleStatus.PENDING_REVIEW, True),
        ('pending_review', ArticleStatus.PUBLISHED, True),
        ('pending_review', ArticleStatus.REJECTED, True),
        ('draft', ArticleStatus.PUBLISHED, False),
        ('published', ArticleStatus.PENDING_REVIEW, False),
        ('unknown', ArticleStatus.PUBLISHED, False)
    ]
)
def test_article_status_transition(
    current: str,
    target: ArticleStatus,
    allowed: bool
) -> None:
    assert can_transition(current, target) is allowed
```

一张参数表覆盖多个状态组合。以后增加 archived，先补规则和测试，再修改 Service。

## 十五、API 测试矩阵

综合流程至少测试：

| 场景 | 预期 |
| --- | --- |
| 作者提交 draft | 200，变 pending_review |
| 作者提交别人的草稿 | 404 |
| 重复提交 pending_review | 409 |
| editor 查看审核列表 | 403 |
| reviewer 查看审核列表 | 200 |
| reviewer 通过 | 200，变 published，新增 ReviewRecord |
| reviewer 驳回但无原因 | 409 |
| reviewer 重复审核同一文章 | 404 或 409，项目统一 |
| 写审核记录失败 | 文章状态不变 |
| 未登录提交 | 401 |

## 十六、事务回滚测试的关键断言

不要只断言接口返回 500。失败后用一个新 Session 查询：

```python
reloaded_article = await article_repository.get_by_id(
    verification_session,
    article_id
)
records = await review_repository.list_by_article(
    verification_session,
    article_id
)

assert reloaded_article.status == 'pending_review'
assert records == []
```

新 Session 避免当前 Session identity map 让你误读内存状态。测试目标是数据库没有部分提交。

## 十七、手工验收流程

1. 注册 editor 和 reviewer 两个用户。
2. 在测试数据库把 reviewer 用户 role 改为 reviewer。
3. editor 登录并创建文章。
4. editor 调用 submit，状态变 pending_review。
5. editor 调用审核列表，得到 403。
6. reviewer 登录，能看到待审核文章。
7. reviewer 驳回但不填原因，得到 409。
8. reviewer 填原因后驳回成功。
9. editor 修改文章后重新提交。
10. reviewer 通过，文章变 published。
11. 直接查询 review_records，确认两次审核历史都存在。

## 十八、公开文章接口

公开列表必须由服务端固定：

```python
select(Article).where(
    Article.status == ArticleStatus.PUBLISHED
)
```

不要设计：

```text
GET /public/articles?include_drafts=true
```

并期待前端不传。公开路由根本不提供取消 published 范围的参数。

公开列表使用 ArticleBrief，不返回完整正文；详情按 slug 查询并固定 published。不存在和草稿统一返回 404，避免泄露未公开内容。

## 十九、从简单角色升级为权限 RBAC

出现以下需求时升级：

- 一个用户同时是 editor 和 reviewer。
- 管理员可自定义角色。
- 不同角色共享部分权限。
- 权限变化需要后台配置而不是发版。

目标表：

```text
Role(id, code, name)
Permission(id, code, name)
UserRole(user_id, role_id)
RolePermission(role_id, permission_id)
```

升级验收：

1. 角色和权限 code 有唯一约束。
2. 当前用户查询显式预加载角色和权限，避免 N+1。
3. `require_permissions('article:review')` 取代 role 字符串判断。
4. 对象范围和状态规则仍由 Service 检查。
5. 角色变化能让权限缓存及时失效。
6. 管理权限变更写审计日志。
7. 迁移期间旧 role 列和新关联表按 expand/contract 共存。

不能只建四张表却仍在路由写 `role == admin`，那不算完成 RBAC。

## 二十、综合项目下一批功能

核心审核链通过后，再按需求增加：

### 分类和标签

- Category 多对一、Tag 多对多。
- 提交审核前检查分类存在。
- 列表显式预加载，避免 N+1。

### 媒体

- 预签名上传。
- object_key 与 owner 绑定。
- 完成上传时验证对象大小、类型和归属。

### 公开搜索和缓存

- 查询永远固定 published。
- Cache key 带版本。
- 发布、归档后失效。
- Redis 故障时明确降级策略。

### 导出任务

- 创建 ExportTask 返回 202 和 task_id。
- worker 幂等执行。
- 进度、失败原因、过期下载。
- 大文件放对象存储，不占 Web worker。

每次只增加一条可测试纵向链，不要同时生成所有空目录。

## Express 对照：用 MongoDB 事务实现同一审核工作流

FastAPI Service 中的状态机可以原样复用到 JavaScript，框架不应该改变业务规则。Express Router 只接收请求，Service 在事务中修改文章并写审核记录：

```js
router.post(
  '/articles/:id/review',
  authenticate,
  requirePermission('article:review'),
  async (req, res) => {
    const result = await reviewService.review({
      articleId: req.params.id,
      reviewer: req.user,
      action: req.body.action,
      reason: req.body.reason
    })
    res.json(result)
  }
)
```

```js
export async function review({ articleId, reviewer, action, reason }) {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const article = await Article.findOne({
        _id: articleId,
        status: 'pending_review'
      }).session(session)

      if (!article) throw new ArticleNotReviewableError(articleId)

      article.status = nextStatus(article.status, action)
      await article.save({ session })

      await ReviewRecord.create([{
        articleId: article._id,
        reviewerId: reviewer._id,
        action,
        reason
      }], { session })

      return article.toObject()
    })
  } finally {
    await session.endSession()
  }
}
```

`nextStatus` 应是无数据库依赖的纯函数，FastAPI 和 Express 两边使用同一张状态迁移表测试。通知邮件不要放在事务中发送；事务内写 Outbox 文档，提交后由队列 Worker 处理，才能避免“数据库回滚但邮件已发出”。

## 最终交付清单

- 从空数据库能 `alembic upgrade head`。
- README 写明环境、启动、迁移、测试和管理员初始化。
- editor、reviewer、admin 的权限边界明确。
- 文章创建、提交、审核和公开查询均有测试。
- 非法状态返回稳定 409 code。
- 状态与审核记录同事务。
- 密码、JWT、数据库 URL 不在日志和仓库。
- Docker 镜像非 root 运行。
- health、ready、结构化日志和 request ID 可用。
- 发布前备份，发布后验证，旧镜像可回滚。

## 本章完成检查

- 本章不再只是接口清单，审核纵向链已经能运行。
- 能解释为什么状态机是纯函数、事务在 Service。
- 能证明审核记录失败时文章不会发布。
- editor 不能通过隐藏按钮或手工请求绕过 reviewer 权限。
- 公开接口从查询层固定 published。
- 知道简单角色列的适用边界，以及何时升级权限关联表。

完成这条链后，你已经不只是会写 FastAPI 装饰器，而是能把需求、权限、状态、事务、错误和测试组织成一个可交付用例。
