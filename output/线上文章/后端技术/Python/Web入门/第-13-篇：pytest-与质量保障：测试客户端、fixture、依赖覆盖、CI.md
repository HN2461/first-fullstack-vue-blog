---
title: "第 13 篇：pytest 与质量保障：测试客户端、fixture、依赖覆盖、CI"
slug: "fastapi-pytest-quality-assurance"
summary: "FastAPI 测试与质量保障，覆盖 Pydantic 单元测试、独立 PostgreSQL 测试库、HTTPX、依赖覆盖、注册登录、文章 CRUD、异常路径和 CI。"
category: "Web入门"
categoryPath:
  - "后端技术"
  - "Python"
  - "Web入门"
tags:
  - "Python"
  - "FastAPI"
  - "pytest"
  - "测试"
  - "CI"
status: "published"
sortOrder: 140
cover: ""
originalId: "6a6b57a2fca6347974f5d1aa"
originalSlug: "fastapi-pytest-quality-assurance"
originalStatus: "published"
publishedAt: "2026-07-30T14:44:46.205Z"
updatedAt: "2026-07-31T11:16:22.156Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 13 篇：pytest 与质量保障：测试客户端、fixture、依赖覆盖、CI

测试不是“最后点一下接口”。它要在代码变更后自动回答：原来能工作的功能是否仍然正确，错误路径是否仍被阻止。

本章先实现三层：

```text
Schema 单元测试：不启动 API，不连接数据库
Service/规则测试：直接验证业务规则
API 测试：通过真实 ASGI 请求 + 独立 PostgreSQL 测试库
```

完成后运行一条命令就能验证注册、登录、认证、创建文章、重复 slug 和不存在资源。

## 测试最重要的安全规则

测试数据库必须与开发库、生产库物理或逻辑隔离。

本章会创建：

```text
knowledge_test
```

Fixture 会删除和重建测试表，因此绝不能把 DATABASE_URL 直接复制给 TEST_DATABASE_URL。代码还会强制检查数据库名以 `_test` 结尾。

## 安装测试依赖

```powershell
python -m pip install pytest pytest-asyncio httpx coverage
```

项目根目录创建或补充 `pyproject.toml`：

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
addopts = "-q --strict-markers"
markers = [
  "integration: requires PostgreSQL or another external service"
]

[tool.coverage.run]
branch = true
source = ["app"]

[tool.coverage.report]
show_missing = true
skip_covered = true
```

- `testpaths` 告诉 pytest 从 tests 查找。
- `asyncio_mode=auto` 让异步 fixture 和测试正常运行。
- `-q` 减少无关输出。
- `strict-markers` 防止测试标记拼错后被静默忽略。

## 第一个无需数据库的测试

创建：

```text
tests/test_schemas.py
```

完整文件：

```python
import pytest
from pydantic import ValidationError

from app.schemas import ArticleCreate, ArticleUpdate


def test_article_create_accepts_valid_data() -> None:
    payload = ArticleCreate(
        title='FastAPI 测试',
        slug='fastapi-testing',
        content='正文'
    )

    assert payload.title == 'FastAPI 测试'
    assert payload.slug == 'fastapi-testing'


def test_article_slug_rejects_uppercase() -> None:
    with pytest.raises(ValidationError):
        ArticleCreate(
            title='标题',
            slug='FastAPI-Testing',
            content='正文'
        )


def test_update_keeps_only_submitted_fields() -> None:
    payload = ArticleUpdate(title='新标题', version=2)

    changes = payload.model_dump(
        exclude_unset=True,
        exclude={'version'}
    )

    assert changes == {'title': '新标题'}
```

运行：

```powershell
pytest tests/test_schemas.py
```

预期：

```text
3 passed
```

## 测试代码怎样读

### Arrange、Act、Assert

测试通常分三步：

```text
Arrange：准备输入
Act：执行被测代码
Assert：断言结果
```

第一个测试创建合法模型，然后断言字段值。

### 测试预期异常

```python
with pytest.raises(ValidationError):
    ArticleCreate(...)
```

代码块内必须抛出 ValidationError，测试才通过。若错误输入被意外接受，测试失败。

测试不是“代码不报错就通过”，每个测试都应有能证明行为的断言。

## 创建独立测试数据库

第 07 章 PostgreSQL 容器运行时执行：

```powershell
docker compose exec postgres `
    createdb -U app knowledge_test
```

若提示数据库已存在，可以忽略该次创建错误。

在本机环境增加测试变量，不要写进生产配置：

```powershell
$env:TEST_DATABASE_URL='postgresql+asyncpg://app:development-only@127.0.0.1:5432/knowledge_test'
```

这个变量只对当前 PowerShell 会话生效。运行测试前需要设置。

团队项目可以维护 `.env.test.example`，但真实凭证仍不提交。

## 完整的 `tests/conftest.py`

```python
import os
from collections.abc import AsyncGenerator

import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine
)

from app import models
from app.db.base import Base
from app.db.session import get_db
from app.main import create_app

TEST_DATABASE_URL = os.environ.get('TEST_DATABASE_URL', '')
if not TEST_DATABASE_URL:
    raise RuntimeError('必须设置 TEST_DATABASE_URL')

test_database_name = make_url(TEST_DATABASE_URL).database or ''
if not test_database_name.endswith('_test'):
    raise RuntimeError(
        '拒绝运行：测试数据库名必须以 _test 结尾'
    )

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    pool_pre_ping=True
)
TestSessionFactory = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest_asyncio.fixture
async def app() -> AsyncGenerator[FastAPI, None]:
    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

    application = create_app()

    async def override_get_db():
        async with TestSessionFactory() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise

    application.dependency_overrides[get_db] = override_get_db
    yield application
    application.dependency_overrides.clear()

    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(
    app: FastAPI
) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url='http://test'
    ) as test_client:
        yield test_client
```

## conftest 关键解释

### 为什么导入 `app.models`

```python
from app import models
```

变量没有直接使用，但导入会把 User、Article 注册到 Base.metadata。否则 create_all 可能缺表。

### 为什么再次检查数据库名

环境变量可能配错。Fixture 会执行 drop_all，必须在执行任何删除前验证目标数据库明确是测试库。后缀检查不是绝对安全证明，但能阻止最常见误配置；CI 还应使用独立账号和实例限制权限。

### 为什么测试这里允许 create_all

API 测试重点是接口和业务行为，create_all 能快速为独立 PostgreSQL 测试库建立当前模型。

它不能替代迁移测试。CI 仍要单独从空数据库执行：

```powershell
alembic upgrade head
alembic check
```

这样分别验证“当前 Model 行为”和“历史 migration 能走到当前结构”。

### 依赖覆盖

```python
application.dependency_overrides[get_db] = override_get_db
```

应用路由仍声明 get_db，但测试把它换成 TestSessionFactory。生产数据库 Engine 不会被接口测试使用。

### ASGITransport

HTTPX 直接调用 ASGI 应用，不需要真的监听 8000 端口。请求仍经过 FastAPI 路由、参数验证、依赖和响应序列化。

ASGITransport 默认不一定执行 lifespan。当前 API 测试不依赖启动初始化；若项目在 lifespan 创建必需客户端，要显式使用 lifespan 管理工具，不能让测试与生产初始化不一致。

## 健康检查测试

创建 `tests/test_health.py`：

```python
from httpx import AsyncClient


async def test_health_check(client: AsyncClient) -> None:
    response = await client.get('/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}
```

这里已经不需要手写 `@pytest.mark.asyncio`，因为 pyproject 设置了 asyncio_mode=auto。团队也可以选择显式标记，但要保持统一。

## 认证辅助函数

创建 `tests/helpers.py`：

```python
from httpx import AsyncClient


async def register_user(
    client: AsyncClient,
    *,
    email: str = 'user@example.com'
) -> dict:
    response = await client.post(
        '/auth/register',
        json={
            'email': email,
            'display_name': '测试用户',
            'password': 'test-password-123'
        }
    )
    assert response.status_code == 201
    return response.json()


async def login_user(
    client: AsyncClient,
    *,
    email: str = 'user@example.com'
) -> str:
    response = await client.post(
        '/auth/login',
        data={
            'username': email,
            'password': 'test-password-123'
        }
    )
    assert response.status_code == 200
    return response.json()['access_token']


def bearer_headers(token: str) -> dict[str, str]:
    return {'Authorization': f'Bearer {token}'}
```

测试帮助函数减少重复准备，但不要把真正要断言的业务行为藏进去。注册辅助函数只负责建立前置数据。

## 完整认证测试

创建 `tests/test_auth.py`：

```python
from httpx import AsyncClient

from tests.helpers import (
    bearer_headers,
    login_user,
    register_user
)


async def test_register_login_and_read_me(
    client: AsyncClient
) -> None:
    user = await register_user(client)
    token = await login_user(client)

    response = await client.get(
        '/auth/me',
        headers=bearer_headers(token)
    )

    assert response.status_code == 200
    assert response.json()['id'] == user['id']
    assert response.json()['email'] == 'user@example.com'
    assert 'password_hash' not in response.json()


async def test_login_rejects_wrong_password(
    client: AsyncClient
) -> None:
    await register_user(client)

    response = await client.post(
        '/auth/login',
        data={
            'username': 'user@example.com',
            'password': 'wrong-password-123'
        }
    )

    assert response.status_code == 401
    assert response.json()['error']['code'] == (
        'AUTH_INVALID_CREDENTIALS'
    )


async def test_me_requires_authentication(
    client: AsyncClient
) -> None:
    response = await client.get('/auth/me')

    assert response.status_code == 401
```

成功路径还断言响应不含 password_hash。安全字段是否泄露是接口契约的一部分，应该自动测试。

## 完整文章 API 测试

创建 `tests/test_articles.py`：

```python
from httpx import AsyncClient

from tests.helpers import (
    bearer_headers,
    login_user,
    register_user
)


async def authenticated_headers(
    client: AsyncClient
) -> dict[str, str]:
    await register_user(client)
    token = await login_user(client)
    return bearer_headers(token)


async def test_create_then_get_article(
    client: AsyncClient
) -> None:
    headers = await authenticated_headers(client)
    create_response = await client.post(
        '/articles',
        headers=headers,
        json={
            'title': 'FastAPI 测试',
            'slug': 'fastapi-testing',
            'content': '正文'
        }
    )

    assert create_response.status_code == 201
    article_id = create_response.json()['id']

    detail_response = await client.get(
        f'/articles/{article_id}',
        headers=headers
    )

    assert detail_response.status_code == 200
    assert detail_response.json()['slug'] == 'fastapi-testing'


async def test_duplicate_slug_returns_409(
    client: AsyncClient
) -> None:
    headers = await authenticated_headers(client)
    payload = {
        'title': '标题',
        'slug': 'duplicate-slug',
        'content': '正文'
    }

    first = await client.post(
        '/articles',
        headers=headers,
        json=payload
    )
    second = await client.post(
        '/articles',
        headers=headers,
        json=payload
    )

    assert first.status_code == 201
    assert second.status_code == 409
    assert second.json()['error']['code'] == (
        'ARTICLE_SLUG_CONFLICT'
    )


async def test_missing_article_returns_404(
    client: AsyncClient
) -> None:
    headers = await authenticated_headers(client)

    response = await client.get(
        '/articles/999',
        headers=headers
    )

    assert response.status_code == 404
    assert response.json()['error']['code'] == (
        'ARTICLE_NOT_FOUND'
    )


async def test_create_requires_authentication(
    client: AsyncClient
) -> None:
    response = await client.post(
        '/articles',
        json={
            'title': '未登录文章',
            'slug': 'unauthenticated-article',
            'content': '正文'
        }
    )

    assert response.status_code == 401
```

如果你的文章详情是公开接口，不应要求 headers；测试要按实际契约调整。测试不是死抄模板，而是把项目已经决定的权限规则固定下来。

## 测试对象级权限

至少加入以下流程：

1. 用户 A 注册、登录、创建文章。
2. 用户 B 注册、登录。
3. 用户 B PATCH 用户 A 的文章。
4. 断言返回统一 404。
5. 重新查询数据库，确认文章内容没有变化。

最后一步很重要。只断言“接口报错”不能证明事务没有错误地修改部分数据。

## 测试事务回滚

发布文章同时写审核记录和审计日志时，可以模拟中途失败：

```python
from unittest.mock import patch


async def test_publish_rolls_back_when_audit_fails(...):
    with patch(
        'app.services.create_audit_log',
        side_effect=RuntimeError('failed')
    ):
        with pytest.raises(RuntimeError):
            await publish_article(...)

    reloaded = await load_article_with_new_session(...)
    assert reloaded.status == 'pending_review'
```

这是局部模式示例，省略号要替换为项目 fixture。验证目标是失败后数据库状态没提交一半，而不仅是“确实抛了异常”。

## 测试并发唯一约束

顺序发两次请求能测试冲突转换，但不能证明并发边界。集成测试可以用两个独立客户端/连接同时创建相同 slug：

```python
import asyncio

responses = await asyncio.gather(
    client_a.post('/articles', json=payload, headers=headers_a),
    client_b.post('/articles', json=payload, headers=headers_b)
)

assert sorted(item.status_code for item in responses) == [201, 409]
```

不能让两个并发任务共享同一个 AsyncSession。测试库连接池也要允许至少两个连接。

## 外部 HTTP、Redis 和文件怎么测

### 外部 HTTP

不要在自动化测试访问真实第三方。使用 HTTPX MockTransport、respx 或注入的假客户端，覆盖：

- 200 正常响应。
- 连接或读取超时。
- 429 + Retry-After。
- 500 后有限重试。
- JSON 结构不合法。

测试重试不要真的 sleep。把 sleep 函数或时钟作为依赖注入。

### Redis

单元测试可用 Fake；需要验证 Lua 原子性、过期和并发时使用独立真实 Redis 测试实例。明确 Redis 故障时接口是降级查库还是返回错误。

### 文件上传

```python
response = await client.post(
    '/media',
    headers=headers,
    files={
        'file': ('avatar.png', b'fake-content', 'image/png')
    }
)
```

覆盖超大、空文件、伪造 MIME、非法扩展和路径穿越式文件名。使用 pytest 临时目录，测试后不污染项目 uploads。

## 覆盖率怎样用

```powershell
coverage run -m pytest
coverage report -m
```

覆盖率只能告诉你哪些代码执行过，不能证明断言正确。优先测试：

- 权限拒绝。
- 状态转换。
- 数据库唯一冲突。
- 事务失败。
- token 过期和用户禁用。
- 外部服务超时。
- 缓存失效。

不要为了数字给简单 getter 写大量无意义测试，却遗漏数据一致性和越权。

## CI 建议顺序

```text
1. 从锁文件安装依赖
2. 检查 UTF-8、格式、lint、类型
3. 启动独立 PostgreSQL/Redis 测试服务
4. 从空库执行 alembic upgrade head
5. 执行 Schema、Service、API 测试
6. 执行标记为 integration 的测试
7. alembic check，确认 Model 变化没有漏迁移
8. 构建并启动 Docker 镜像
```

常用命令：

```powershell
ruff format --check .
ruff check .
mypy app
pytest
alembic check
```

具体规则和版本写进 pyproject，不要只存在某个人 IDE 中。

## 常见错误

### 测试误连开发库

立即停止。确保 TEST_DATABASE_URL 独立，并在 Fixture 删除数据前验证目标。数据库账号也应限制为只能访问测试库。

### 测试单独通过，一起运行失败

通常存在共享状态、测试数据未清理、全局依赖覆盖未恢复或用例顺序依赖。每个测试必须能独立运行。

### ASGI 测试没有执行 lifespan

如果接口依赖 app.state.http_client 或 Redis，显式进入应用生命周期。不要因为测试里手工塞假 state，就忽略生产初始化问题。

### 用 SQLite 代替 PostgreSQL 后全绿

SQLite 与 PostgreSQL 的 Enum、锁、并发、JSON、全文检索和约束行为不同。纯 Repository 逻辑可有轻量测试，但依赖 PostgreSQL 特性的集成测试必须使用 PostgreSQL。

### 用 `time.sleep()` 等后台结果

测试会变慢且偶发失败。等待可观察状态、事件或使用可控时钟。

## Express 对照：Vitest、Supertest 与 MongoDB 测试隔离

Express 的接口测试不需要真的监听端口。`createApp()` 返回应用对象后，Supertest 可以直接发送请求：

```js
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { Article } from '../src/modules/articles/article.model.js'

const app = createApp()

describe('articles api', () => {
  beforeEach(async () => {
    await Article.deleteMany({})
  })

  it('creates an article', async () => {
    const response = await request(app)
      .post('/api/articles')
      .send({ title: '第一篇', content: '正文' })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe('第一篇')
  })

  it('rejects an empty title', async () => {
    const response = await request(app)
      .post('/api/articles')
      .send({ title: '', content: '正文' })

    expect(response.status).toBe(422)
  })
})
```

开发库和测试库必须物理隔离。你当前栈可使用 `mongodb-memory-server` 做快速测试，但涉及事务、索引、文本搜索或真实副本集行为时，应补充容器化 MongoDB 集成测试。对应 FastAPI 章节中“不要用 SQLite 假装 PostgreSQL”的原则在这里同样成立。

## 本章动手改

1. 完成用户 B 不能修改用户 A 文章的测试。
2. 完成 version 冲突返回 409 的测试。
3. 禁用用户后，断言旧 access token 立即失败。
4. 用两个独立客户端并发创建相同 slug。
5. 给发布事务写中途失败回滚测试。

## 本章完成检查

- Schema 测试无需数据库即可运行。
- API 测试只连接 `_test` 数据库。
- 依赖覆盖在测试结束后清理。
- 201、401、404、409、422 都有明确断言。
- 安全字段不泄露、对象权限和事务回滚有测试。
- CI 同时验证 migration 和当前 Model，而不是只跑单元测试。

下一章会把“测试通过的项目”打包成可重复启动的服务，并加入日志、健康检查、Docker 和发布验证。
