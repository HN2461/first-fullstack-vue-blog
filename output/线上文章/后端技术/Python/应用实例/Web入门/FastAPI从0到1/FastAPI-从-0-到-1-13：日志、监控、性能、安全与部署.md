---
title: "FastAPI 从 0 到 1 13：日志、监控、性能、安全与部署"
slug: "fastapi-observability-performance-security-deployment"
summary: "建立生产级日志、指标、追踪、性能诊断、安全基线、Docker 镜像、代理配置、发布与回滚流程。"
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
  - "可观测性"
  - "Docker"
  - "部署"
status: "published"
sortOrder: 150
cover: ""
originalId: "6a6b57a2fca6347974f5d1ac"
originalSlug: "fastapi-observability-performance-security-deployment"
originalStatus: "published"
publishedAt: "2026-07-30T14:44:46.207Z"
updatedAt: "2026-07-30T14:44:46.207Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# FastAPI 从 0 到 1 13：日志、监控、性能、安全与部署

这一章不是要求小白第一天搭建完整云平台，而是把项目从“我的电脑能跑”推进到“别人能按文档重复启动、出现故障能定位”。

第一次交付先完成最小闭环：

```text
固定依赖版本
  -> 测试通过
  -> Alembic 从空库升级成功
  -> 构建非 root Docker 镜像
  -> 配置通过环境变量注入
  -> /health 与 /ready 可用
  -> 标准输出能按 request ID 找到错误
  -> 有发布与回滚步骤
```

指标、分布式追踪、灰度平台和 PITR 是生产环境的重要能力，但要按团队基础设施接入。本章没有文件路径的代码块属于局部示例，不能脱离前面项目直接运行。

## 生产可用的含义

服务能在本地 `/docs` 返回 200，不等于可上线。生产服务至少需要：

- 配置和密钥分离。
- 数据库迁移、备份和回滚方案。
- 日志、指标、追踪和告警。
- 健康检查与优雅关闭。
- 超时、连接池、限流和资源上限。
- 安全响应头、依赖漏洞管理。
- 可重复构建的镜像和自动化测试。
- 发布后验证与故障处置流程。

## 日志分层

常见日志：

- 访问日志：方法、路径模板、状态码、耗时、请求 ID。
- 应用日志：业务流程和重要状态变化。
- 错误日志：异常类型、堆栈和上下文。
- 审计日志：谁在何时对什么资源做了什么操作。

审计日志不是普通调试日志。它应结构稳定、访问受控、不可由普通用户篡改，并按合规要求留存。

## 结构化日志

建议输出 JSON 到标准输出，由容器平台收集：

```json
{
  "timestamp": "2026-07-26T10:00:00.123Z",
  "level": "INFO",
  "service": "knowledge-api",
  "environment": "production",
  "request_id": "req_123",
  "trace_id": "abc",
  "method": "GET",
  "route": "/api/v1/articles/{article_id}",
  "status_code": 200,
  "duration_ms": 18.6,
  "user_id": 42,
  "message": "request completed"
}
```

记录路由模板而非每个实际 URL，可避免指标和日志维度爆炸。日志不得包含：

- 密码、验证码。
- Authorization、Cookie 完整值。
- JWT、刷新令牌、API Key。
- 身份证、银行卡等敏感信息。
- 完整请求体和上传文件。

## Request ID 与 Trace ID

Request ID 用于串联单次请求日志。分布式系统还应传播 W3C Trace Context（`traceparent`），通过 OpenTelemetry 等工具追踪跨服务调用。

不要盲目信任客户端任意长度的 request ID；应限制格式和长度，非法时重新生成。

## 指标

RED 方法：

- Rate：请求速率。
- Errors：错误率。
- Duration：延迟分布。

基础设施指标：

- CPU、内存、文件描述符。
- Uvicorn worker 存活数。
- 数据库连接池使用/等待。
- SQL 延迟、慢查询、锁等待。
- Redis 命中率、内存、拒绝连接。
- 任务队列积压、失败和重试。

使用直方图观察 p50、p95、p99，不只看平均值。指标标签不能放 user_id、article_id 等高基数字段。

## 健康检查

```python
@app.get('/health', include_in_schema=False)
async def health():
    return {'status': 'ok'}


@app.get('/ready', include_in_schema=False)
async def ready(request: Request):
    if not request.app.state.ready:
        raise HTTPException(status_code=503, detail='not ready')
    return {'status': 'ready'}
```

两条接口不要混用：

- `/health` 只回答进程能否响应，失败通常触发重启。
- `/ready` 回答当前实例能否接新流量，失败时负载均衡应暂时摘除实例。
- `include_in_schema=False` 表示不在业务 OpenAPI 中展示运维探针。
- `app.state.ready` 应由 lifespan 在必要资源初始化成功后设置，关闭阶段恢复 false。

这里只演示状态骨架。真实 readiness 若检查数据库，必须使用很短超时；不要串行检查所有第三方服务，否则一个非关键依赖故障会让整个 API 被摘流量。

- liveness：进程是否卡死，失败会重启。
- readiness：是否可接流量，失败会从负载均衡摘除。
- startup：慢启动应用是否已经完成初始化。

不要在每次 liveness 中串行调用所有第三方服务，否则外部故障会让应用反复重启。Readiness 只检查接流量所必需的依赖，并设置极短超时。

## 性能诊断顺序

不要先改成 async 或先加缓存。按证据定位：

1. 明确慢接口和延迟分位数。
2. 拆分应用、SQL、Redis、外部 HTTP 耗时。
3. 检查 N+1、缺索引、返回体过大。
4. 检查事件循环阻塞、连接池等待。
5. 用生产相近数据量压测。
6. 优化后重复测量并对比。

## 高频性能问题

### SQL 慢

- 缺少合适索引。
- `LIKE '%keyword%'` 扫全表。
- N+1。
- OFFSET 过大。
- 单请求加载大量关联。
- 长事务和锁等待。

使用数据库慢查询日志、`EXPLAIN (ANALYZE, BUFFERS)` 分析。不要直接在生产对昂贵查询随意执行 ANALYZE。

### 连接池耗尽

假设 4 个实例，每实例 4 worker，每 worker pool_size=10，理论基础连接已达 160，还未算 overflow、任务 worker 和管理工具。必须从数据库最大连接数反推。

### 响应过大

- 分页上限。
- 列表使用摘要 Schema。
- 大型导出离线生成。
- 合理压缩。
- 静态文件和媒体走 CDN/对象存储。

### 事件循环阻塞

检查同步 HTTP、同步数据库驱动、磁盘 I/O、CPU 计算、JSON 大对象序列化。使用事件循环延迟指标或分析器定位。

## Worker 数量

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

worker 数不是简单的 CPU x 2 + 1。需要综合：

- CPU 和内存。
- 请求是 I/O 还是 CPU 密集。
- 每个 worker 的数据库池。
- 平台实例数和扩容策略。
- 长连接数量。

容器编排中常让每容器一个或少量 worker，通过多副本扩容，便于健康检查和资源隔离。

## 安全基线

### 输入和输出

- 所有输入有类型、长度、范围和数量上限。
- ORM 参数化查询，不拼接 SQL。
- HTML/Markdown 展示前做 XSS 清洗。
- 响应模型隐藏内部字段。
- 错误不暴露堆栈和配置。

### 网络和浏览器

- 只提供 HTTPS。
- CORS 精确 origin。
- Cookie 使用 Secure、HttpOnly、合适 SameSite。
- Cookie 认证处理 CSRF。
- 配置 HSTS、X-Content-Type-Options 等安全头。

### 身份和权限

- 密码使用 Argon2 等专用哈希。
- 登录和重置流程限流。
- 最小权限、对象级授权、后台审计。
- 令牌短时效、密钥轮换、刷新令牌撤销。
- 服务间凭证独立管理。

### 基础设施

- 非 root 用户运行容器。
- 镜像和依赖扫描。
- 数据库/Redis 不暴露公网。
- Secret 不进入镜像和仓库。
- 备份加密并定期恢复演练。
- 上传目录和运行代码隔离。

## Dockerfile 示例

```dockerfile
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY requirements.txt ./
RUN python -m pip install --upgrade pip \
    && python -m pip install --requirement requirements.txt

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./

USER app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Dockerfile 逐段含义：

- `python:3.12-slim` 提供较小的 Python 运行环境。
- 三个 ENV 关闭 pyc、让日志立即输出、避免 pip 缓存进入镜像。
- 先复制 requirements 再安装，业务代码变化时可复用依赖缓存层。
- 单独创建 `app` 系统用户，避免服务以 root 运行。
- 复制 app、alembic 和配置后切换 `USER app`。
- CMD 使用生产监听地址，不带开发用 `--reload`。

真实项目还应锁定基础镜像 digest，确保依赖有锁文件，并在 `.dockerignore` 排除 `.env`、`.git`、`.venv`、缓存和本地上传目录。

真实项目应锁定基础镜像 digest、使用构建缓存、根据依赖工具复制锁文件，并通过 `.dockerignore` 排除 `.env`、`.git`、测试缓存和本地上传。

数据库迁移不应由每个 Web 副本启动时并发执行。使用部署前一次性 Job 或受控发布步骤。

## Docker Compose 开发环境

```yaml
services:
  api:
    build: .
    env_file: .env
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: knowledge
      POSTGRES_USER: app
      POSTGRES_PASSWORD: development-only
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d knowledge"]
      interval: 5s
      timeout: 3s
      retries: 10

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10
```

`depends_on: condition: service_healthy` 只帮助本地 Compose 按健康状态启动，不等于应用运行期间数据库永远可用，也不等于生产编排的就绪探针。API 仍要处理连接中断、超时和恢复。

第一次验证镜像按下面顺序：

```powershell
docker compose build api
docker compose run --rm api alembic upgrade head
docker compose up -d api
docker compose ps
docker compose logs api
```

迁移使用一次性受控命令执行，不要让每个 API 副本启动时并发执行。

开发密码只用于本地。生产使用独立托管服务或受控配置，不能复制 Compose 示例密码。

## 反向代理关注点

Nginx/网关通常负责：

- TLS 终止。
- 请求体大小。
- 连接和读取超时。
- 客户端真实 IP 可信代理链。
- 压缩和安全头。
- 限流和负载均衡。
- WebSocket Upgrade。

只有部署在受信代理后，才允许应用信任 `X-Forwarded-*`。否则攻击者可伪造协议和客户端 IP。

## 发布流程

```text
1. PR 评审、CI、依赖与镜像扫描通过
2. 备份并验证可恢复点
3. 审查迁移及向后兼容性
4. 执行 expand 迁移
5. 部署少量新实例
6. 验证 health、ready、核心读写、日志和指标
7. 逐步扩大流量
8. 观察错误率、延迟、连接池和队列
9. 完成发布记录
10. 后续版本再执行 contract 清理
```

对个人项目也不要省略验证。至少记录本次镜像/提交版本、迁移 revision、备份位置、核心接口验证结果和回滚命令。只有“知道上一版本是什么”，回滚才不是临时猜测。

## 回滚

应用回滚和数据库回滚是两件事：

- 应用镜像应可快速切回上一版本。
- 数据库迁移若已丢弃或转换数据，可能不可逆。
- 向后兼容迁移允许旧应用继续工作，是可靠回滚的基础。
- 破坏性迁移前必须有备份和恢复演练。

回滚后仍要验证核心接口、任务 worker、缓存和数据一致性，不能只看进程启动成功。

## 备份与恢复

“有备份”不等于“能恢复”。需要明确：

- RPO：最多可接受丢多少时间的数据。
- RTO：最多多久恢复服务。
- 全量与增量/PITR 策略。
- 备份加密、权限、异地保存。
- 定期在隔离环境恢复并验证。

## Express 对照：生产启动、结构化日志与优雅关闭

Express 的生产入口应把数据库连接、HTTP Server 和关闭流程放在一起，避免测试导入 `app.js` 时就开始监听端口：

```js
import { createServer } from 'node:http'
import mongoose from 'mongoose'
import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'

await connectDatabase()
const server = createServer(createApp())
server.listen(process.env.PORT ?? 3000)

async function shutdown(signal) {
  console.info(JSON.stringify({ level: 'info', event: 'shutdown', signal }))
  server.close(async () => {
    await mongoose.disconnect()
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
```

生产日志应至少包含 `timestamp`、`level`、`requestId`、`method`、`path`、`status`、`durationMs` 和业务错误码；不要记录密码、完整 token、Cookie 和敏感正文。可使用 Pino 生成结构化日志，Prometheus Client 暴露指标，Helmet 设置常用安全响应头。

Node 版本的 Dockerfile 同样要固定依赖并使用非 root 用户：

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
USER node
CMD ["node", "src/server.js"]
```

无论 FastAPI 还是 Express，迁移、健康检查、回滚、备份恢复和 Secret 管理才是交付能力，单独写出一个 Dockerfile 还不能称为“完成生产部署”。

## 本章练习

1. 输出结构化访问日志并关联 request ID。
2. 增加请求速率、错误率、延迟和数据库池指标。
3. 创建独立 liveness/readiness，并模拟数据库不可用。
4. 对文章列表做 SQL 和响应体性能分析，给出优化前后数据。
5. 构建非 root Docker 镜像，并在干净环境执行迁移和启动。
6. 编写一份发布、验证、回滚和数据库恢复操作手册。

## 本章检查

- 日志可关联但不含凭证和敏感数据。
- 指标标签无高基数业务 ID。
- 连接池按所有实例和 worker 总量计算。
- 迁移由受控单次任务执行。
- 发布前有备份，发布后有指标验证，回滚考虑数据库兼容。
