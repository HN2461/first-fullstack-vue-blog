---
title: "FastAPI 从 0 到 1 11：异步、并发、WebSocket 与任务队列"
slug: "fastapi-async-concurrency-websocket-task-queue"
summary: "理解事件循环、阻塞 I/O、并发控制、WebSocket 连接管理和持久化任务队列的适用边界。"
category: "FastAPI从0到1"
tags:
  - "Python"
  - "FastAPI"
  - "异步"
  - "WebSocket"
  - "任务队列"
status: "draft"
sortOrder: 110
cover: ""
originalId: "6a6b57a2fca6347974f5d1a8"
originalSlug: "fastapi-async-concurrency-websocket-task-queue"
originalStatus: "draft"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# FastAPI 从 0 到 1 11：异步、并发、WebSocket 与任务队列

这一章是进阶运行机制，不是普通 CRUD 项目的前置条件。第一次阅读的最低目标是：不在 `async def` 中塞同步阻塞调用，不并发共享 AsyncSession，知道重要后台任务不能只靠 Web 进程。

本章代码块默认是局部机制示例。`fetch_profile`、`fetch_stats`、`sync_library_call` 等名字代表项目中已有的具体函数，教程不会假装它们可以脱离业务单独运行；真正需要接入时，应把它们替换为自己的 HTTPX、数据库或任务实现。

## 并发不是并行

- 并发：多个任务在同一时间段内推进，适合等待网络、数据库等 I/O。
- 并行：多个 CPU 核心同一时刻执行计算，适合 CPU 密集任务。

`asyncio` 通过事件循环在任务等待 I/O 时切换任务。它不会让纯 Python CPU 计算自动并行。

## 异步路由正确示例

```python
from fastapi import Request


@router.get('/profiles/{user_id}')
async def get_profile(user_id: int, request: Request):
    client = request.app.state.http_client
    response = await client.get(
        f'https://profiles.example.com/{user_id}'
    )
    return response.json()
```

这里的 `http_client` 来自第 10 章 lifespan 中创建的共享 `httpx.AsyncClient`。`await client.get(...)` 等待网络响应时允许事件循环处理其他连接。真实代码还必须检查状态码、验证响应 Schema，并转换超时异常。

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

`sync_library_call` 和 `argument` 是占位名称，分别表示“无法替换的同步库函数”和传给它的参数。例如旧 SDK 只有同步 I/O API 时才这样包裹，不要把普通计算机械丢进线程池。

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

TaskGroup 中任一任务发生未处理异常，会取消同组其他任务，并在退出上下文时抛出异常组。只有 profile、stats、notices 互不依赖时才并发；若后一步需要前一步结果，就必须按顺序 await。

只有相互独立的 I/O 才适合并发。不能用同一个 AsyncSession 同时发多个查询；每个并发任务需要独立 Session，或在同一任务串行执行数据库操作。

## 并发上限

```python
semaphore = asyncio.Semaphore(10)


async def limited_fetch(url: str):
    async with semaphore:
        return await fetch(url)
```

Semaphore 像 10 个并发许可证。进入代码块占一个，结束后归还。它限制的是当前进程内并发，多个 worker 各有自己的 Semaphore，不能替代全局第三方配额控制。

没有上限的 `gather` 可能瞬间占满连接池、文件描述符或外部服务配额。并发上限应与数据库池、HTTP 连接池、第三方限额一起设计。

## 超时和取消

```python
async with asyncio.timeout(5):
    result = await slow_operation()
```

超时触发后，当前等待会被取消。被调用代码必须在 `finally` 或上下文管理器中释放连接、文件和锁，不能吞掉取消异常后继续做不可控工作。

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

这个管理器只维护当前 Python 进程内的集合：

- `dict` 的键是用户 ID。
- `set` 允许同一用户多个页面或设备连接。
- 断开时必须移除 WebSocket，集合为空再删除用户键。

它不是多实例方案，也没有离线消息、心跳、慢消费者队列和认证。把它当成理解连接生命周期的最小骨架。

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

## Express 对照：Promise、Socket.IO 与 BullMQ

Node.js 的路由天然运行在事件循环上，但这不代表同步 CPU 计算不会阻塞。多个互不依赖的 I/O 可以并发等待：

```js
const [profile, stats] = await Promise.all([
  fetchProfile(userId),
  fetchStats(userId)
])
```

并发数量仍应受控。不要对几万条记录直接 `Promise.all`；可以使用 `p-limit`、队列批次或数据库批量能力。

你当前项目使用 Socket.IO，最小服务端可以这样挂到 HTTP Server，而不是直接挂到 Express `app`：

```js
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const app = createApp()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: allowedOrigins } })

io.use(async (socket, next) => {
  try {
    socket.user = await verifySocketToken(socket.handshake.auth.token)
    next()
  } catch (error) {
    next(error)
  }
})

io.on('connection', (socket) => {
  socket.join(`user:${socket.user.id}`)
})
```

多实例部署时，单进程房间信息不足，需要 Redis Adapter；可靠后台任务使用 BullMQ Worker，并在关闭进程时依次停止接收新请求、关闭 Socket.IO、等待 Worker、断开 Redis 和 MongoDB。

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
