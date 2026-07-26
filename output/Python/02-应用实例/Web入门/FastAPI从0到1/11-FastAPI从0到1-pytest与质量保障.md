---
title: FastAPI 从 0 到 1 11：pytest 与质量保障
slug: fastapi-pytest-quality-assurance
summary: 使用 pytest、HTTPX 和依赖覆盖构建单元、Service、API 与集成测试，并建立静态检查和 CI 质量门禁。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - pytest
  - 测试
  - CI
status: draft
cover:
---

# FastAPI 从 0 到 1 11：pytest 与质量保障

## 测试金字塔

| 层次 | 目标 | 依赖 | 速度 |
| --- | --- | --- | --- |
| 单元测试 | 纯函数、状态规则、Schema | 无真实基础设施 | 最快 |
| Service 测试 | 业务用例、事务、权限 | 测试数据库或替身 | 快/中 |
| API 测试 | HTTP 契约、认证、序列化 | ASGI 应用、测试数据库 | 中 |
| 集成测试 | PostgreSQL、Redis、外部协议 | 真实容器 | 慢 |
| 端到端测试 | 从客户端完成用户流程 | 完整系统 | 最慢 |

不要把所有规则都塞进慢速端到端测试，也不要只测无数据库的函数后宣称接口可靠。

## 安装

```powershell
python -m pip install pytest pytest-asyncio httpx coverage
```

`pyproject.toml`：

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
addopts = "-q --strict-markers"
markers = [
  "integration: requires external infrastructure"
]

[tool.coverage.run]
branch = true
source = ["app"]

[tool.coverage.report]
show_missing = true
skip_covered = true
```

## 最小异步 API 测试

```python
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url='http://test'
    ) as client:
        response = await client.get('/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}
```

根据 HTTPX/ASGITransport 版本，应用 lifespan 可能不会自动运行。可使用合适的 lifespan 管理工具或在 fixture 中显式进入应用生命周期，不要让测试与生产初始化行为不一致。

## Fixture 结构

```python
# tests/conftest.py
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import create_app


@pytest_asyncio.fixture
async def app():
    application = create_app()
    yield application
    application.dependency_overrides.clear()


@pytest_asyncio.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url='http://test'
    ) as test_client:
        yield test_client
```

Fixture 作用域要谨慎。跨测试共享应用、Session 或数据会形成顺序依赖和偶发失败。

## 测试数据库

原则：

- 独立测试数据库，绝不连接开发/生产库。
- 测试前执行迁移，验证真实数据库结构。
- 每个测试清理数据或回滚事务。
- PostgreSQL 特有功能应使用 PostgreSQL 测，不用 SQLite 假装等价。

可选隔离方式：

1. 每个测试事务 + 回滚，速度快。
2. 每个测试清空表，行为直观但较慢。
3. 每个测试创建临时数据库/schema，隔离强但成本高。
4. Testcontainers 启动真实 PostgreSQL，适合 CI 集成测试。

如果应用 Service 会 `commit()`，简单外层事务回滚可能失效，需要使用嵌套事务/savepoint 或在测试中调整事务所有权。

## 覆盖数据库依赖

```python
async def override_get_db():
    async with TestSessionFactory() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db
```

测试配置必须在创建 Engine 前生效，避免应用模块 import 时已经连接错误数据库。这也是使用应用工厂和集中配置的重要原因。

## 覆盖认证依赖

```python
@pytest_asyncio.fixture
async def authenticated_client(app, client, test_user):
    async def fake_current_user():
        return test_user

    app.dependency_overrides[get_current_user] = fake_current_user
    yield client
    app.dependency_overrides.pop(get_current_user, None)
```

需要测试 JWT 解码本身时不要覆盖认证；需要测试文章业务时可以覆盖，减少无关准备。

## Schema 单元测试

```python
import pytest
from pydantic import ValidationError


def test_article_slug_rejects_uppercase():
    with pytest.raises(ValidationError):
        ArticleCreate(
            title='标题',
            slug='FastAPI-Guide',
            content='正文'
        )
```

## 状态转换测试

```python
@pytest.mark.parametrize(
    ('current', 'target', 'allowed'),
    [
        ('draft', 'pending_review', True),
        ('pending_review', 'published', True),
        ('published', 'draft', False),
        ('archived', 'published', False)
    ]
)
def test_article_status_transition(current, target, allowed):
    assert can_transition(current, target) is allowed
```

纯业务规则提取成纯函数后，测试更快、边界更完整。

## API 成功与失败路径

创建文章至少测试：

- 201 成功。
- 401 未登录。
- 403 无创建权限。
- 422 标题为空、slug 非法、标签过多。
- 409 slug 重复。
- 请求响应不包含内部字段。
- 幂等键重复请求返回同一结果。

文章详情至少测试：

- 200 已发布文章。
- 404 不存在。
- 404 无权查看他人草稿。
- 401 私有空间未登录。

## 事务测试

模拟业务中途失败：

```python
async def test_publish_rolls_back_when_audit_insert_fails(...):
    with patch(
        'app.services.article_service.create_audit_log',
        side_effect=RuntimeError('failed')
    ):
        with pytest.raises(RuntimeError):
            await publish_article(...)

    reloaded = await repository.get_by_id(new_session, article.id)
    assert reloaded.status == ArticleStatus.DRAFT
```

验证的是失败后数据库没有提交一半，不只是“抛了异常”。

## 并发测试

两个请求同时创建相同 slug：

```python
results = await asyncio.gather(
    client.post('/api/v1/articles', json=payload, headers=headers_a),
    client.post('/api/v1/articles', json=payload, headers=headers_b)
)

assert sorted(response.status_code for response in results) == [201, 409]
```

并发测试必须使用允许并发连接的真实测试数据库配置，不能共享同一个 AsyncSession。

## 外部 HTTP 测试

不要访问真实第三方服务。可以使用 HTTPX MockTransport、respx 或依赖注入的假客户端，覆盖：

- 正常 200。
- 超时。
- 429 与 Retry-After。
- 500 后有限重试。
- 非法响应 JSON。
- 熔断/降级结果。

测试重试时不要真的等待，可注入 sleep 函数或时间控制器。

## 文件上传测试

```python
response = await client.post(
    '/api/v1/media',
    files={'file': ('avatar.png', b'fake-content', 'image/png')}
)
```

应覆盖超大文件、伪造 MIME、非法扩展、空文件和路径穿越式文件名。测试结束清理临时目录，不能污染仓库。

## 时间、随机数和 ID

业务测试如果直接依赖 `datetime.now()`、随机 UUID，会难以断言。可通过参数、Clock/ID 依赖或 monkeypatch 注入确定值。

不要用 `time.sleep()` 等待异步结果；使用可观察状态、事件或可控时钟。

## 覆盖率的正确用法

```powershell
coverage run -m pytest
coverage report -m
```

覆盖率能发现未执行代码，不能证明断言正确。优先覆盖：

- 权限分支。
- 状态转换。
- 事务失败。
- 并发冲突。
- 外部服务超时。
- 缓存失效。

不要为了数字测试无意义 getter，却遗漏资金、权限和数据一致性。

## 静态质量

常见命令：

```powershell
ruff format --check .
ruff check .
mypy app
pytest
alembic upgrade head
alembic check
```

具体命令取决于锁定版本。CI 中应从干净环境安装依赖，验证当前迁移能从空库升级，也验证模型变化是否遗漏迁移。

## CI 建议顺序

```text
1. 安装锁定依赖
2. 编码、格式、lint、类型检查
3. 启动 PostgreSQL/Redis 测试服务
4. 执行 Alembic 迁移
5. 单元与 API 测试
6. 集成测试
7. 构建镜像
8. 镜像漏洞与启动检查
```

测试失败时不得继续发布。生产迁移要单独受控，不应由每个应用副本并发自动执行。

## 本章练习

1. 为文章 CRUD 编写完整成功和异常测试矩阵。
2. 使用真实 PostgreSQL 测试事务回滚、唯一约束和关联删除。
3. 覆盖认证依赖测试业务，再单独测试 JWT 过期、算法、issuer、禁用用户。
4. 模拟 HTTPX 超时和 Redis 不可用，验证降级策略。
5. 建立 Ruff、mypy、pytest、Alembic 检查的 CI。

## 本章检查

- 测试从不连接生产或个人开发数据库。
- 每个测试可独立运行，没有顺序依赖。
- 异常、权限、事务和并发路径有断言。
- 外部服务和时间可控，不靠真实网络和 sleep。
- CI 能从干净环境验证依赖、迁移、测试和构建。

