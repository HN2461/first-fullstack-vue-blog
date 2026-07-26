---
title: FastAPI 从 0 到 1 13：企业知识库 API 综合实战
slug: fastapi-enterprise-knowledge-api-capstone
summary: 通过知识库 API 完成需求、数据模型、接口、权限、事务、测试、缓存、任务和部署的端到端企业实战。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - 企业实战
  - 知识库
status: draft
cover:
---

# FastAPI 从 0 到 1 13：企业知识库 API 综合实战

这一章不是再讲一遍语法，而是把前面能力收束成可交付项目。请按里程碑逐步实现，每个里程碑都要可运行、可测试、可演示。

## 一、业务目标

构建一个供前后端分离系统使用的知识库 API：

- 访客查看已发布文章、分类、标签并搜索。
- 编辑创建和维护自己的草稿，提交审核。
- 审核员审核、发布、驳回和归档文章。
- 管理员管理用户、角色、权限和媒体。
- 系统记录审计日志，支持文章导出任务。

## 二、角色与权限

| 角色 | 权限范围 |
| --- | --- |
| visitor | 查看公开文章 |
| editor | 创建文章、维护自己的草稿、提交审核 |
| reviewer | 查看待审核文章、通过、驳回、归档 |
| admin | 用户角色管理、全量内容管理、审计查看 |

权限代码：

```text
article:read_public
article:create
article:update_own
article:submit
article:review
article:publish
article:archive
article:delete
media:upload
user:manage
role:manage
audit:read
export:create
```

角色只用于组织权限，接口校验具体权限代码。自己的草稿还需要对象级范围判断。

## 三、文章状态机

```text
draft -> pending_review -> published -> archived
  ^            |
  |            v
  +--------- rejected
```

规则：

- 新文章只能是 draft，客户端不能指定状态。
- 作者可以编辑 draft/rejected。
- 提交审核要求标题、slug、正文、分类齐全。
- reviewer 可以将 pending_review 通过为 published 或驳回为 rejected。
- 驳回必须填写原因。
- published 可归档；是否允许撤回为 draft 必须明确，不临时改字符串。
- 所有状态变化写审计日志。

用纯函数维护允许转换，再由 Service 校验角色和业务数据。

## 四、数据模型

```text
User
  id, email, password_hash, display_name, status,
  token_version, created_at, updated_at

Role
  id, code, name

Permission
  id, code, name

UserRole / RolePermission
  组合主键或唯一约束

Article
  id, title, slug, summary, content, status,
  author_id, category_id, version,
  submitted_at, published_at, archived_at,
  created_at, updated_at

Category
  id, name, slug, parent_id, sort_order

Tag
  id, name, slug

ArticleTag
  article_id, tag_id

ReviewRecord
  id, article_id, reviewer_id, action, reason, created_at

Media
  id, object_key, original_name, mime_type, size,
  sha256, owner_id, status, created_at

AuditLog
  id, actor_id, action, resource_type, resource_id,
  before_data, after_data, request_id, created_at

OutboxEvent
  id, event_type, aggregate_id, payload,
  status, attempts, available_at, created_at

ExportTask
  id, creator_id, status, progress, object_key,
  error_code, created_at, finished_at
```

关键约束：

- 用户邮箱唯一并统一大小写规则。
- Article.slug 全局唯一。
- Category.slug、Tag.slug 唯一。
- 关联表组合唯一。
- 状态字段有明确 Enum/CHECK。
- 所有外键明确删除行为。
- 审计日志不随业务资源级联删除。

## 五、接口清单

### 认证

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/change-password
```

### 公开文章

```text
GET /api/v1/public/articles
GET /api/v1/public/articles/{slug}
GET /api/v1/public/categories
GET /api/v1/public/tags
GET /api/v1/public/search
```

公开查询必须固定 `status=published`，不能由客户端通过 Query 取消。草稿无权访问时返回统一 404。

### 编辑工作台

```text
GET    /api/v1/articles
POST   /api/v1/articles
GET    /api/v1/articles/{article_id}
PATCH  /api/v1/articles/{article_id}
DELETE /api/v1/articles/{article_id}
POST   /api/v1/articles/{article_id}/submit
```

### 审核

```text
GET  /api/v1/reviews/articles
POST /api/v1/reviews/articles/{article_id}/approve
POST /api/v1/reviews/articles/{article_id}/reject
POST /api/v1/reviews/articles/{article_id}/archive
```

### 媒体和导出

```text
POST /api/v1/media/upload-url
POST /api/v1/media/complete
GET  /api/v1/media
POST /api/v1/exports/articles
GET  /api/v1/exports/{task_id}
GET  /api/v1/exports/{task_id}/download
```

### 管理

```text
GET   /api/v1/admin/users
PATCH /api/v1/admin/users/{user_id}/status
PUT   /api/v1/admin/users/{user_id}/roles
GET   /api/v1/admin/roles
POST  /api/v1/admin/roles
PUT   /api/v1/admin/roles/{role_id}/permissions
GET   /api/v1/admin/audit-logs
```

## 六、统一契约

分页：

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
    "code": "ARTICLE_SLUG_CONFLICT",
    "message": "文章 slug 已存在",
    "details": null,
    "requestId": "req_123"
  }
}
```

错误码至少定义：

```text
VALIDATION_ERROR
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
AUTH_USER_DISABLED
FORBIDDEN
ARTICLE_NOT_FOUND
ARTICLE_SLUG_CONFLICT
ARTICLE_INVALID_TRANSITION
ARTICLE_VERSION_CONFLICT
MEDIA_INVALID_TYPE
MEDIA_TOO_LARGE
RATE_LIMITED
EXTERNAL_SERVICE_UNAVAILABLE
INTERNAL_SERVER_ERROR
```

## 七、目录结构

```text
app/
├─ main.py
├─ api/
│  ├─ deps.py
│  ├─ router.py
│  └─ v1/
│     ├─ auth.py
│     ├─ public_articles.py
│     ├─ articles.py
│     ├─ reviews.py
│     ├─ media.py
│     ├─ exports.py
│     └─ admin/
├─ core/
│  ├─ config.py
│  ├─ errors.py
│  ├─ logging.py
│  └─ security.py
├─ db/
│  ├─ base.py
│  └─ session.py
├─ models/
├─ schemas/
├─ repositories/
├─ services/
├─ integrations/
│  ├─ object_storage.py
│  ├─ redis.py
│  └─ mailer.py
├─ workers/
└─ common/
```

按业务复杂度拆分，不要求每个实体机械拥有四个空文件。文章是核心聚合，可以完整分层；简单字典表可保持轻量。

## 八、里程碑 1：只读公开 API

完成：

1. 项目、Settings、数据库、Alembic。
2. Article、Category、Tag 表和种子数据脚本。
3. 已发布文章列表、详情、分类、标签。
4. Offset 分页、筛选、安全排序。
5. 404、422 和统一错误。
6. API 测试和 SQL 查询检查。

验收：

- 草稿永远不会从公开接口返回。
- 列表不返回完整正文。
- 详情关联作者、分类、标签且无 N+1。
- page_size 最大 100。

## 九、里程碑 2：认证和个人草稿

完成：

1. 注册、登录、JWT、当前用户。
2. 文章创建、更新、删除。
3. slug 并发唯一冲突。
4. 只能操作自己的草稿。
5. 乐观锁 version。
6. 登录限流与安全日志。

验收：

- 请求不能自行指定 author_id。
- 禁用用户的旧 token 不能使用。
- 两人同时编辑时不会静默覆盖。
- 更新使用 `exclude_unset`，支持显式清空分类。

## 十、里程碑 3：审核和权限

完成：

1. Role、Permission 和 RBAC 管理。
2. 提交、通过、驳回、归档 Service。
3. ReviewRecord 和 AuditLog。
4. 状态转换与对象级权限。
5. 发布事务中写 OutboxEvent。

验收：

- 前端隐藏按钮不能绕过后端权限。
- 非法状态转换返回 409。
- 发布状态、审核记录、审计和 outbox 同事务提交。
- 外部通知不在数据库持锁事务中发送。

## 十一、里程碑 4：媒体、搜索、缓存和导出

完成：

1. 对象存储预签名上传。
2. 媒体完成确认和权限检查。
3. PostgreSQL 全文检索或选定搜索方案。
4. 公开详情 Cache Aside 与失效。
5. 导出任务队列、进度和下载。
6. 幂等创建任务。

验收：

- 伪造 object_key 不能挂载他人文件。
- 缓存不会泄露草稿或跨租户数据。
- 导出重复投递不会生成多份逻辑结果。
- 大型导出不占用 Web worker。

## 十二、里程碑 5：生产交付

完成：

1. 结构化日志、request ID、指标。
2. liveness、readiness、优雅关闭。
3. Dockerfile 和本地 Compose。
4. CI：Ruff、mypy、pytest、迁移检查、镜像构建。
5. 反向代理和 HTTPS 配置说明。
6. 发布、验证、回滚、备份恢复文档。

验收：

- 从空数据库可以迁移到 head。
- 从干净镜像可以启动。
- Secret 不在 Git、镜像层和日志中。
- 发布后能通过指标定位 5xx、慢 SQL 和连接池耗尽。

## 十三、测试矩阵

| 模块 | 必测边界 |
| --- | --- |
| 注册 | 重复邮箱、弱密码、非法邮箱、并发重复 |
| 登录 | 错误密码、禁用用户、限流、令牌过期 |
| 文章 | 越权、非法状态、slug 冲突、版本冲突 |
| 审核 | 非 reviewer、重复审核、事务回滚 |
| 媒体 | 超大、伪类型、越权 object_key、失效签名 |
| 缓存 | 未命中、命中、更新失效、Redis 故障降级 |
| 导出 | 幂等、重试、失败、越权下载、过期文件 |
| 管理 | 403、最后一个管理员保护、角色缓存失效 |

## 十四、项目 README 必须写清

- 项目用途和架构边界。
- Python 与依赖工具版本。
- 本地启动和测试命令。
- 环境变量说明，不包含真实 Secret。
- 数据库迁移和种子数据步骤。
- 认证和权限模型。
- 任务 worker 启动方式。
- OpenAPI 地址。
- 发布和回滚入口。
- 常见故障排查。

## 十五、最终验收题

不看笔记，独立完成：

1. 新增“文章协作者”功能，协作者能编辑指定草稿但不能提交审核。
2. 设计数据表、权限代码、接口契约和迁移。
3. 处理两个管理员同时变更协作者的并发冲突。
4. 写 API、Service、权限、事务测试。
5. 增加审计日志和缓存失效。
6. 说明发布顺序与回滚兼容性。

如果能把这项需求完整交付，并能解释每个层次的职责和边界，就已经跨过“会 FastAPI 语法”，进入能承担企业后端需求的阶段。

