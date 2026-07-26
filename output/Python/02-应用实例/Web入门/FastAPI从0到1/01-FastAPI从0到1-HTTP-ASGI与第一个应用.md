---
title: FastAPI 从 0 到 1 01：HTTP、ASGI 与第一个应用
slug: fastapi-http-asgi-first-application
summary: 理解 HTTP 请求响应、ASGI 调用链、Uvicorn 运行方式，并创建可维护的 FastAPI 应用入口。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - HTTP
  - ASGI
status: draft
cover:
---

# FastAPI 从 0 到 1 01：HTTP、ASGI 与第一个应用

## 一次请求经历了什么

```text
浏览器 / Vue / App
  -> DNS 找到服务器
  -> HTTPS 建立连接
  -> 反向代理或负载均衡
  -> Uvicorn 接收 ASGI 请求
  -> FastAPI 中间件、路由、依赖、业务代码
  -> JSON / 文件 / 流式响应
  -> 客户端处理状态码和响应体
```

FastAPI 是应用框架，Uvicorn 是 ASGI 服务器。开发时常把二者一起说，但职责不同：Uvicorn 监听端口并转换网络请求，FastAPI 决定如何匹配和处理请求。

## HTTP 请求的组成

示例：

```http
POST /api/v1/articles?notify=true HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJ...
Content-Type: application/json
X-Request-ID: req_123

{
  "title": "FastAPI 入门",
  "content": "正文"
}
```

它包括：

- 方法：`POST`。
- 路径：`/api/v1/articles`。
- 查询字符串：`notify=true`。
- 请求头：认证、内容类型、追踪信息等。
- 请求体：JSON 数据。

响应同样包含状态码、响应头和响应体。

## 高频 HTTP 方法

| 方法 | 常见用途 | 是否应幂等 |
| --- | --- | --- |
| GET | 查询资源 | 是 |
| POST | 创建资源、触发动作 | 通常否 |
| PUT | 完整替换资源 | 是 |
| PATCH | 部分更新资源 | 设计上应尽量幂等 |
| DELETE | 删除资源 | 是 |

幂等表示同一请求执行一次或多次，服务器最终状态相同。支付、创建订单等非幂等操作通常需要幂等键防止客户端重试造成重复写入。

## 高频状态码

| 状态码 | 含义 | 常见场景 |
| --- | --- | --- |
| 200 | 成功 | 查询、更新成功 |
| 201 | 已创建 | 创建资源成功 |
| 204 | 成功但无响应体 | 删除成功 |
| 400 | 请求语义错误 | 无法归类到更具体状态的业务错误 |
| 401 | 未认证或令牌无效 | 没登录、令牌过期 |
| 403 | 已认证但无权限 | 普通用户访问管理员接口 |
| 404 | 资源不存在 | 指定文章不存在或不可见 |
| 409 | 状态冲突 | 唯一字段重复、版本冲突 |
| 422 | 参数校验失败 | 类型、长度、格式不符合 Schema |
| 429 | 请求过多 | 触发限流 |
| 500 | 服务器内部错误 | 未预期异常 |

## 创建第一个应用

新建 `main.py`：

```python
from fastapi import FastAPI

app = FastAPI(
    title='Knowledge API',
    version='0.1.0'
)


@app.get('/health', tags=['system'])
async def health_check() -> dict[str, str]:
    return {'status': 'ok'}
```

启动：

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

`main:app` 表示从 `main.py` 导入名为 `app` 的 ASGI 应用。`--reload` 只用于开发。

访问：

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/redoc
http://127.0.0.1:8000/openapi.json
```

## 路由匹配

```python
@app.get('/articles')
async def list_articles():
    return {'items': []}


@app.post('/articles', status_code=201)
async def create_article():
    return {'id': 1}
```

路径相同但方法不同，是两个不同接口。客户端对不存在的方法发请求时通常得到 `405 Method Not Allowed`。

路由顺序可能影响静态路径和动态路径：

```python
@app.get('/users/me')
async def read_current_user():
    return {'id': 'me'}


@app.get('/users/{user_id}')
async def read_user(user_id: str):
    return {'id': user_id}
```

应把 `/users/me` 放在 `/users/{user_id}` 前面，否则 `me` 可能先被当成 `user_id`。

## `def` 和 `async def`

FastAPI 支持两种路由函数：

```python
@app.get('/sync')
def sync_route():
    return {'mode': 'sync'}


@app.get('/async')
async def async_route():
    return {'mode': 'async'}
```

选择原则：

- 调用异步数据库、异步 HTTP 客户端、异步 Redis 时使用 `async def` 并 `await`。
- 必须调用同步阻塞库时，可以使用普通 `def`，FastAPI 会在线程池执行。
- CPU 密集任务不应长期占用请求进程，应交给任务队列或独立计算服务。
- 不要在 `async def` 中直接调用 `time.sleep()`、`requests.get()` 或同步大文件 I/O。

## 应用工厂

项目变大后可以使用工厂函数：

```python
from fastapi import FastAPI


def create_app() -> FastAPI:
    application = FastAPI(
        title='Knowledge API',
        version='0.1.0'
    )

    @application.get('/health', tags=['system'])
    async def health_check() -> dict[str, str]:
        return {'status': 'ok'}

    return application


app = create_app()
```

工厂便于按环境创建应用、注册中间件、覆盖测试依赖。不要为了形式把所有逻辑塞进工厂，路由仍应拆到独立模块。

## OpenAPI 是接口契约

FastAPI 根据路由、类型提示、Schema、状态码和描述生成 OpenAPI。它可以用于：

- 前后端联调。
- 生成客户端 SDK。
- 导入 API 管理平台。
- 自动测试和契约检查。

`/docs` 只是 OpenAPI 的一个交互界面，不是权限系统，也不能代替自动化测试。

## 本章练习

1. 实现 `/health`、`/ready`、`/version` 三个接口。
2. 分别用 GET、POST 请求同一路径，观察 405。
3. 创建 `/users/me` 和 `/users/{user_id}`，验证路由顺序。
4. 打开 `openapi.json`，找到 `/health` 对应定义。
5. 用 `curl` 或 PowerShell `Invoke-RestMethod` 调用接口。

PowerShell 示例：

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health' -Method Get
```

## 本章检查

- 能说明 FastAPI 与 Uvicorn 的职责差异。
- 能拆解一个 HTTP 请求。
- 能正确选择常见状态码。
- 知道何时使用 `def` 和 `async def`。

