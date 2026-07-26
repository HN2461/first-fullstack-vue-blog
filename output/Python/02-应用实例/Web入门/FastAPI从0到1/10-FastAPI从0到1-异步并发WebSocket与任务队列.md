---
title: FastAPI 从 0 到 1 10：异步、并发、WebSocket 与任务队列
slug: fastapi-async-concurrency-websocket-task-queue
summary: 理解事件循环、阻塞 I/O、并发控制、WebSocket 连接管理和持久化任务队列的适用边界。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - 异步
  - WebSocket
  - 任务队列
status: draft
cover:
---

# FastAPI 从 0 到 1 10：异步、并发、WebSocket 与任务队列

## 并发不是并行

- 并发：多个任务在同一时间段内推进，适合等待网络、数据库等 I/O。
- 并行：多个 CPU 核心同一时刻执行计算，适合 CPU 密集任务。

`asyncio` 通过事件循环在任务等待 I/O 时切换任务。它不会让纯 Python CPU 计算自动并行。

## 异步路由正确示例

```python
@router.get('/profiles/{user_id}')
async def get_profile(user_id: int, client: HttpClientDep):
    response = await client.get(
        f'https://profiles.example.com/{user_id}'
    )
    return response.json()
```

错误示例：

```python
import requests


@router.get('/blocked')
async def blocked_route():
    response = requests.get('https://example.com', timeout=10)
    return response.json()
```

`requests.get()` 是同步阻塞调用，会卡住事件循环。可改用 HTTPX AsyncClient，或将无法替换的同步调用放线程池。

## 在线程池运行同步函数

```python
from starlette.concurrency import run_in_threadpool


result = await run_in_threadpool(sync_library_call, argument)
```

线程池适合阻塞 I/O，不适合无限量提交，也不能消除 CPU 密集计算受 GIL 和资源竞争的影响。必须设置并发上限和超时。

## CPU 密集任务

典型任务：

- 图片/视频转码。
- 大型 Excel 生成。
- 加密压缩。
- 机器学习推理。
- 大规模文本解析。

应使用独立进程、任务队列 worker 或专用服务。请求接口通常返回 202 和 task_id：

```json
{
  "taskId": "task_123",
  "status": "queued"
}
```

客户端再轮询任务状态或通过 WebSocket/SSE 接收进度。

## 并发执行多个独立 I/O

Python 3.11+ 推荐 `TaskGroup`：

```python
import asyncio


async def load_dashboard(user_id: int):
    async with asyncio.TaskGroup() as group:
        profile_task = group.create_task(fetch_profile(user_id))
        stats_task = group.create_task(fetch_stats(user_id))
        notices_task = group.create_task(fetch_notices(user_id))

    return {
        'profile': profile_task.result(),
        'stats': stats_task.result(),
        'notices': notices_task.result()
    }
```

只有相互独立的 I/O 才适合并发。不能用同一个 AsyncSession 同时发多个查询；每个并发任务需要独立 Session，或在同一任务串行执行数据库操作。

## 并发上限

```python
semaphore = asyncio.Semaphore(10)


async def limited_fetch(url: str):
    async with semaphore:
        return await fetch(url)
```

没有上限的 `gather` 可能瞬间占满连接池、文件描述符或外部服务配额。并发上限应与数据库池、HTTP 连接池、第三方限额一起设计。

## 超时和取消

```python
async with asyncio.timeout(5):
    result = await slow_operation()
```

被取消的协程应及时释放资源，不要吞掉 `CancelledError`。数据库事务、临时文件、锁都要在 `finally` 或上下文管理器中清理。

应用级超时要小于反向代理超时，外部调用超时又应小于应用请求超时，给错误处理和响应留出时间。

## WebSocket 基础

```python
from fastapi import WebSocket, WebSocketDisconnect


@app.websocket('/ws/notifications')
async def notifications(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            await websocket.send_json({'echo': message})
    except WebSocketDisconnect:
        pass
```

WebSocket 是长连接，不走普通 HTTP 路由依赖的完全相同流程。需要单独处理：

- 握手认证和令牌过期。
- 心跳与空闲超时。
- 消息大小、频率和 Schema。
- 断线清理与重连。
- 慢消费者和发送队列上限。
- 多实例间广播。

## WebSocket 认证

浏览器原生 WebSocket API 不便自定义 Authorization Header，常见方案：

- HttpOnly Cookie。
- 握手查询参数中的短时、一次性 ticket。
- 首条消息发送认证数据，并在认证前不接受业务消息。

不要把长期访问令牌放在 URL，因为 URL 可能进入代理日志和历史记录。

## 单进程连接管理器

```python
class ConnectionManager:
    def __init__(self):
        self.connections: dict[int, set[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.connections.setdefault(user_id, set()).add(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        sockets = self.connections.get(user_id)
        if not sockets:
            return
        sockets.discard(websocket)
        if not sockets:
            self.connections.pop(user_id, None)
```

内存连接表只知道当前进程的连接。多 worker、多实例广播需要 Redis Pub/Sub、消息中间件或专用实时服务。Pub/Sub 不持久化，离线通知仍应保存数据库。

## SSE 作为替代

Server-Sent Events 适合服务器单向推送：任务进度、通知、日志流。它基于 HTTP，浏览器支持自动重连，通常比双向 WebSocket 简单。需要双向实时协作或高频消息时再选择 WebSocket。

## 任务队列设计

```text
API 事务提交
  -> 写 outbox/job 记录
  -> 调度器投递队列
  -> Worker 执行
  -> 更新任务状态、结果、重试次数
  -> 通知客户端
```

任务必须尽量幂等，因为消息系统常提供“至少一次”投递，重复执行是正常边界。

任务记录常见字段：

```text
id, type, status, payload_ref, progress,
attempts, max_attempts, scheduled_at,
started_at, finished_at, error_code, created_by
```

payload 不要无限膨胀或保存敏感明文；大型输入放对象存储，任务只保存引用。

## 重试原则

适合重试：

- 网络超时。
- 临时 5xx。
- 短暂数据库连接失败。

不适合直接重试：

- 参数非法。
- 权限不足。
- 业务状态不允许。
- 明确的 4xx（429/408 等需按语义处理）。

使用指数退避、抖动和最大次数。超过次数进入死信或人工处理，不能无限重试制造流量风暴。

## 优雅关闭

应用收到终止信号时需要：

- 停止接收新流量。
- 等待或取消在途请求。
- 关闭 HTTP、Redis、数据库连接。
- WebSocket 告知客户端重连。
- Worker 停止拉新任务并处理当前任务到安全点。

任务只有在结果持久化后才能确认消息，否则可能丢任务；同时要接受崩溃后的重复执行。

## 本章练习

1. 找出项目中可能阻塞事件循环的同步调用并替换。
2. 并发调用三个独立外部服务，并设置总超时和并发上限。
3. 实现通知 WebSocket，包含认证、心跳和断开清理。
4. 用 Redis Pub/Sub 让两个进程间广播通知，同时把离线通知写数据库。
5. 设计一个文章导出任务，支持状态查询、重试和幂等执行。

## 本章检查

- `async def` 中没有直接执行阻塞 I/O。
- 同一个 AsyncSession 不被多个并发 task 共用。
- 高并发 fan-out 有上限、超时和取消清理。
- 关键任务使用持久化队列并按重复投递设计。
- WebSocket 多实例广播和离线消息分别处理。

