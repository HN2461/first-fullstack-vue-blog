---
title: FastAPI 从 0 到 1 09：文件、后台任务、HTTPX 与 Redis
slug: fastapi-files-background-httpx-redis
summary: 处理文件上传下载、轻量后台任务、外部 HTTP 服务、缓存、限流、幂等和分布式短期状态。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - Redis
  - HTTPX
  - 文件上传
status: draft
cover:
---

# FastAPI 从 0 到 1 09：文件、后台任务、HTTPX 与 Redis

## 文件上传基础

安装表单解析依赖：

```powershell
python -m pip install python-multipart
```

```python
from typing import Annotated

from fastapi import File, UploadFile


@router.post('/media', status_code=201)
async def upload_media(
    file: Annotated[UploadFile, File(description='图片文件')]
):
    return {
        'filename': file.filename,
        'content_type': file.content_type
    }
```

`UploadFile` 使用临时文件式接口，更适合大文件；直接声明 `bytes` 会把整个文件读入内存。

读取：

```python
chunk = await file.read(1024 * 1024)
await file.seek(0)
await file.close()
```

大文件必须分块处理，不能无上限 `await file.read()`。

## 上传安全

客户端提供的 `filename` 和 `content_type` 都不可信。至少校验：

- 请求体和单文件大小。
- 允许的 MIME 和扩展名。
- 文件内容签名（magic bytes）。
- 图片真实尺寸、解码是否成功。
- 文件名由服务端重新生成。
- 存储路径不能被 `../` 穿越。
- 上传目录不允许执行脚本。
- 对公开文件考虑病毒扫描、内容审核和访问权限。

示例分块保存：

```python
from pathlib import Path
from uuid import uuid4

MAX_FILE_SIZE = 10 * 1024 * 1024
CHUNK_SIZE = 1024 * 1024
UPLOAD_DIR = Path('uploads/media').resolve()


async def save_upload(file: UploadFile) -> tuple[str, int]:
    extension = Path(file.filename or '').suffix.lower()
    if extension not in {'.jpg', '.jpeg', '.png', '.webp'}:
        raise ValueError('不支持的文件类型')

    stored_name = f'{uuid4().hex}{extension}'
    target = (UPLOAD_DIR / stored_name).resolve()
    if UPLOAD_DIR not in target.parents:
        raise ValueError('非法文件路径')

    total = 0
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        with target.open('wb') as output:
            while chunk := await file.read(CHUNK_SIZE):
                total += len(chunk)
                if total > MAX_FILE_SIZE:
                    raise ValueError('文件超过大小限制')
                output.write(chunk)
    except Exception:
        target.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    return stored_name, total
```

同步磁盘写入在高并发大文件场景会阻塞；生产更常通过反向代理限制大小、预签名 URL 直传对象存储，或将耗时处理交给 worker。

## 对象存储

生产文件通常放 S3、MinIO 或云对象存储：

```text
客户端请求上传凭证
  -> API 校验权限并生成预签名 URL
  -> 客户端直传对象存储
  -> 客户端提交 object_key
  -> API 校验对象并保存媒体记录
```

数据库保存 `object_key`、大小、MIME、哈希、所有者和状态，不保存短期带签名 URL。下载时按权限重新生成短时 URL。

## BackgroundTasks 的边界

```python
from fastapi import BackgroundTasks


def write_audit_file(article_id: int) -> None:
    ...


@router.post('/articles/{article_id}/publish')
async def publish_article(
    article_id: int,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(write_audit_file, article_id)
    return {'status': 'accepted'}
```

`BackgroundTasks` 在响应后由同一应用进程执行，适合短小、失败后可容忍或可重试的非关键任务。它不保证：

- 进程崩溃后继续执行。
- 多实例协调。
- 持久化重试。
- 任务进度和死信处理。

发送重要通知、视频转码、大型导出、AI 推理、批量同步应使用 Celery、Dramatiq、RQ、Arq 等持久化任务队列或公司统一调度平台。

不要把请求级 Session 或 UploadFile 对象传给后台任务；请求结束后它们可能已被关闭。只传 ID、对象 key 等可重新获取的数据。

## HTTPX 外部调用

```powershell
python -m pip install httpx
```

共享客户端：

```python
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    timeout = httpx.Timeout(connect=3.0, read=10.0, write=10.0, pool=3.0)
    app.state.http_client = httpx.AsyncClient(
        timeout=timeout,
        limits=httpx.Limits(
            max_connections=100,
            max_keepalive_connections=20
        )
    )
    yield
    await app.state.http_client.aclose()
```

调用：

```python
async def fetch_user_profile(
    client: httpx.AsyncClient,
    user_id: int
) -> dict:
    try:
        response = await client.get(
            f'https://profiles.example.com/users/{user_id}'
        )
        response.raise_for_status()
        return response.json()
    except httpx.TimeoutException as exc:
        raise ExternalServiceError('用户资料服务超时') from exc
    except httpx.HTTPStatusError as exc:
        raise ExternalServiceError('用户资料服务响应异常') from exc
```

外部调用必须考虑：

- 连接、读取、写入、连接池超时。
- 只对幂等请求或有幂等键的操作重试。
- 指数退避和抖动。
- 熔断、并发隔离、降级。
- 认证密钥和敏感日志脱敏。
- 响应 Schema 校验。
- 追踪 request ID / traceparent。

不要每次请求新建一个客户端，连接池无法复用。

## Redis 连接

```powershell
python -m pip install redis
```

```python
from redis.asyncio import Redis

redis = Redis.from_url(
    settings.redis_url,
    encoding='utf-8',
    decode_responses=True
)
```

在 lifespan 关闭连接。Redis 常用于：

- 短时缓存。
- 限流计数。
- 幂等结果。
- JWT jti 撤销。
- 短期验证码和会话。
- 分布式锁（必须谨慎）。

Redis 不是默认事实来源。用户、订单、权限等核心数据仍应落可靠数据库。

## Cache Aside

```python
import json


async def get_article_cached(article_id: int) -> ArticleRead:
    key = f'article:v1:{article_id}'
    cached = await redis.get(key)
    if cached:
        return ArticleRead.model_validate_json(cached)

    article = await article_service.get_public_article(article_id)
    result = ArticleRead.model_validate(article)
    await redis.set(key, result.model_dump_json(), ex=300)
    return result
```

更新时先提交数据库，再删除缓存：

```python
await session.commit()
await redis.delete(f'article:v1:{article.id}')
```

还要考虑：

- 删除缓存失败后的短期不一致。
- 热点 key 失效造成缓存击穿。
- 大量 key 同时过期造成雪崩。
- 查询不存在资源的缓存穿透。
- 权限相关数据不能用公共缓存泄露。
- key 要带版本和租户/用户范围。

缓存是性能优化，不应改变正确性。先测量数据库瓶颈再加缓存。

## 限流

固定窗口简化示例：

```python
async def check_rate_limit(key: str, limit: int, window_seconds: int):
    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, window_seconds)
    if current > limit:
        raise RateLimitError('请求过于频繁')
```

生产需用 Lua 脚本保证原子性，或采用成熟网关/库实现滑动窗口、令牌桶。限流维度可能是 IP、用户、API key、租户和接口组合。

响应 429，并可返回 `Retry-After`。代理后获取客户端 IP 时，只信任来自已知代理的转发头。

## 幂等键

创建支付、订单或关键写操作时，客户端发送：

```http
Idempotency-Key: 94b7...
```

服务端流程：

1. 校验键格式并绑定用户、接口。
2. 原子占用 key，记录处理中状态和请求摘要。
3. 执行业务事务。
4. 保存最终状态码与响应。
5. 相同 key + 相同请求返回原结果。
6. 相同 key + 不同请求摘要返回 409。

只用 `SETNX` 后立即执行业务仍需处理进程崩溃、超时、数据库已提交但 Redis 未写结果等边界。关键业务可把幂等记录落数据库，并以唯一约束保证。

## 分布式锁

Redis 锁不是修复数据库竞态的首选。唯一性优先用数据库约束，库存扣减优先用原子 UPDATE、乐观锁或行锁。确需分布式锁时要处理：

- 唯一 owner token。
- 原子校验 owner 后释放。
- TTL 和任务超时。
- 自动续期。
- 锁服务故障和 fencing token。

不能简单 `SET lock 1` 后 `DEL lock`。

## 本章练习

1. 实现图片上传，限制 5 MB、扩展名和内容签名，服务端生成文件名。
2. 改为对象存储预签名 URL 方案，并保存媒体元数据。
3. 使用共享 HTTPX 客户端调用一个假外部服务，覆盖超时与 5xx。
4. 为公开文章详情增加 5 分钟缓存和更新失效。
5. 为登录接口增加按 IP + 账号维度限流。
6. 为创建文章接口增加幂等键并测试重复提交。

## 本章检查

- 不信任 filename、MIME 和扩展名。
- 关键任务不依赖进程内 BackgroundTasks 保证执行。
- 外部请求配置超时并只安全重试。
- 缓存 key 包含版本和数据范围，更新后有失效策略。
- 幂等和分布式锁的正确性有持久化或原子操作保证。

