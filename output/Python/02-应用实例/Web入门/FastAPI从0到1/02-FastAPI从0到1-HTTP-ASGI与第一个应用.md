---
title: FastAPI 从 0 到 1 02：HTTP、ASGI 与第一个应用
slug: fastapi-http-asgi-first-application
summary: 从空目录创建并运行第一个 FastAPI 接口，逐行理解应用对象、路由装饰器、请求响应、Uvicorn 和 ASGI 的职责。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - HTTP
  - ASGI
status: draft
sortOrder: 30
cover:
---

# FastAPI 从 0 到 1 02：HTTP、ASGI 与第一个应用

这一章只做一件事：从空目录启动一个真正可访问的 FastAPI 服务，并看懂代码为什么能工作。

完成后你应该能够：

- 创建项目和虚拟环境。
- 解释 `app = FastAPI()` 和 `@app.get('/health')`。
- 启动 Uvicorn，并知道 `main:app` 的含义。
- 区分浏览器请求、Uvicorn、FastAPI 和路由函数的职责。
- 看懂 200、404、405 等最常见状态码。

本章不会加入数据库、登录、项目分层或应用工厂。这些内容现在只会分散注意力。

## 第一步：创建项目目录

在你准备存放练习项目的位置打开 PowerShell：

```powershell
mkdir beginner-article-api
cd beginner-article-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install fastapi "uvicorn[standard]"
```

命令逐条解释：

| 命令 | 作用 |
| --- | --- |
| `mkdir beginner-article-api` | 创建项目目录 |
| `cd beginner-article-api` | 进入项目目录，后续文件都放在这里 |
| `python -m venv .venv` | 创建只属于当前项目的 Python 环境 |
| `Activate.ps1` | 激活虚拟环境，让安装命令使用当前项目 |
| `python -m pip install ...` | 把依赖安装进当前虚拟环境 |

激活后，终端提示符前通常会出现 `(.venv)`。

检查 Python 是否来自当前项目：

```powershell
python -c "import sys; print(sys.executable)"
```

输出路径应包含：

```text
beginner-article-api\.venv\Scripts\python.exe
```

如果仍指向系统 Python，先不要继续。重新执行激活命令。

Linux 或 macOS 的激活命令是：

```bash
source .venv/bin/activate
```

后面的代码在各平台相同。

## 第二步：写一份完整的 `main.py`

在 `beginner-article-api` 目录中新建 `main.py`。这是一个完整文件，不需要从其他章节补代码：

```python
from fastapi import FastAPI

app = FastAPI(
    title='小白文章 API',
    version='0.1.0'
)


@app.get('/health', tags=['system'])
def health_check() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/hello/{name}', tags=['examples'])
def say_hello(name: str) -> dict[str, str]:
    return {'message': f'你好，{name}'}
```

保存后，目录应该是：

```text
beginner-article-api/
├─ .venv/
└─ main.py
```

`.venv` 中的文件是 Python 自动生成的，不要手动修改，也不要提交到 Git。

## 第三步：逐行读懂代码

### 导入 FastAPI 类

```python
from fastapi import FastAPI
```

这行从已经安装的 `fastapi` 包中导入 `FastAPI` 类。当前文件只有导入后，才能使用这个名字。

注意大小写：

- `fastapi` 是包名，全部小写。
- `FastAPI` 是类名，`F`、`A`、`P`、`I` 大写。

写错大小写会出现导入错误。

### 创建应用对象

```python
app = FastAPI(
    title='小白文章 API',
    version='0.1.0'
)
```

`FastAPI(...)` 调用类并创建一个应用对象，变量名叫 `app`。

- `title` 会显示在自动接口文档顶部。
- `version` 是当前 API 版本说明。
- 变量名 `app` 不是强制的，但启动命令必须和它一致。

假如写成：

```python
application = FastAPI()
```

启动命令右侧也要改成 `main:application`。

### 登记 GET 路由

```python
@app.get('/health', tags=['system'])
```

`@app.get(...)` 是装饰器。程序启动并导入 `main.py` 时，它在 FastAPI 的路由表中登记：

```text
HTTP 方法：GET
路径：/health
处理函数：紧跟在下面的 health_check
文档分组：system
```

它不是现在就发送 GET 请求。真正的请求要等客户端访问 `/health` 时才发生。

### 定义路由函数

```python
def health_check() -> dict[str, str]:
    return {'status': 'ok'}
```

- `def` 定义普通 Python 函数。
- `health_check` 是函数名。
- 空括号表示它暂时不接收参数。
- `-> dict[str, str]` 表示预期返回“键和值都是字符串的字典”。
- `return` 把字典交给 FastAPI。

FastAPI 会把 Python 字典自动转换成 JSON：

```json
{
  "status": "ok"
}
```

Python 字典代码使用单引号没有问题；真正通过 HTTP 发出的 JSON 会使用双引号。

### 路径参数

```python
@app.get('/hello/{name}', tags=['examples'])
def say_hello(name: str) -> dict[str, str]:
    return {'message': f'你好，{name}'}
```

路径中的 `{name}` 是一个变化的位置，叫路径参数。函数参数也必须叫 `name`，FastAPI 才能把路径中的内容传进来。

请求：

```text
GET /hello/小明
```

执行函数时，相当于：

```python
say_hello(name='小明')
```

`f'你好，{name}'` 是 Python f-string，会把变量值放进字符串。

## 第四步：启动服务

确认 PowerShell 当前仍在包含 `main.py` 的目录，然后执行：

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

参数解释：

| 参数 | 含义 |
| --- | --- |
| `main:app` | 从 `main.py` 导入名为 `app` 的对象 |
| `--reload` | 代码保存后自动重启，只用于开发环境 |
| `--host 127.0.0.1` | 只允许本机访问 |
| `--port 8000` | 监听 8000 端口 |

正常会看到类似输出：

```text
Uvicorn running on http://127.0.0.1:8000
Application startup complete.
```

终端停在这里不是卡死，而是服务器正在持续等待请求。不要关闭这个终端。

停止服务时按：

```text
Ctrl + C
```

## 第五步：在浏览器验证

依次打开：

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/hello/小明
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/openapi.json
```

你应该看到：

| 地址 | 结果 |
| --- | --- |
| `/health` | `{"status":"ok"}` |
| `/hello/小明` | `{"message":"你好，小明"}` |
| `/docs` | 可交互的 Swagger UI |
| `/openapi.json` | 描述所有接口的 JSON 文档 |

在 `/docs` 中展开接口，点击 `Try it out`，输入参数，再点击 `Execute`。页面会显示请求地址、状态码和响应体。

## 第六步：不用浏览器调用接口

保持服务器终端运行，再打开一个新的 PowerShell：

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health' -Method Get
```

正常输出：

```text
status
------
ok
```

使用 curl 也可以：

```powershell
curl.exe 'http://127.0.0.1:8000/hello/Codex'
```

这里明确写 `curl.exe`，是为了避免旧版 PowerShell 把 `curl` 当成其他命令别名。

## 一次请求到底发生了什么

现在再看完整链路：

```text
浏览器访问 http://127.0.0.1:8000/health
  -> 操作系统把请求交给监听 8000 端口的 Uvicorn
  -> Uvicorn 把网络请求转换成 ASGI 消息
  -> FastAPI 在路由表中匹配 GET + /health
  -> FastAPI 调用 health_check()
  -> 函数返回 Python 字典
  -> FastAPI 序列化为 JSON
  -> Uvicorn 把 HTTP 响应发回浏览器
```

职责不要混淆：

- Uvicorn 是服务器，负责监听端口、接收和发送网络数据。
- FastAPI 是 Web 框架，负责路由、参数校验、依赖和响应转换。
- `health_check` 是你写的业务入口函数。
- 浏览器、前端或 App 是客户端。

## HTTP 请求和响应是什么

浏览器发出的请求可以抽象为：

```http
GET /health HTTP/1.1
Host: 127.0.0.1:8000
Accept: application/json
```

服务器响应可以抽象为：

```http
HTTP/1.1 200 OK
content-type: application/json

{"status":"ok"}
```

一次 HTTP 交互至少要关注：

- 方法：想做什么，例如 GET 查询、POST 创建。
- 路径：操作哪个资源，例如 `/articles`。
- 状态码：结果如何，例如 200、404、422。
- 请求头和响应头：内容类型、认证信息等元数据。
- 请求体和响应体：真正传输的数据。

## 本章常见状态码

| 状态码 | 小白读法 | 本章怎样触发 |
| --- | --- | --- |
| 200 | 成功 | 正常访问 `/health` |
| 404 | 路径不存在 | 访问 `/not-found` |
| 405 | 路径存在，但方法不允许 | 对 `/health` 发送 POST |
| 422 | 参数格式不符合声明 | 后续把路径参数声明为整数后传字母 |
| 500 | 服务端出现未处理异常 | 路由函数中发生未捕获错误 |

404 和 405 不一样：

- 404：路由表中没有这个路径。
- 405：有这个路径，但没有当前 HTTP 方法。

可以故意执行：

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health' -Method Post
```

PowerShell 会把非 2xx 响应显示成错误，但服务端返回 405 是正确行为。

## ASGI 到底是什么

ASGI 是 Python Web 服务器与应用之间的一套接口约定。你暂时不需要手写 ASGI，只需理解：

```text
Uvicorn 按 ASGI 约定调用 FastAPI
FastAPI 也按 ASGI 约定接收请求和返回响应
```

因为有共同约定，FastAPI 不需要自己实现底层端口监听，Uvicorn 也不需要知道文章业务怎么处理。

ASGI 支持异步请求、WebSocket 和应用生命周期。它是 FastAPI 能处理现代异步 Web 场景的重要基础，但“使用 ASGI”不代表你写的所有代码都会自动变快。

## 为什么本章先用 `def`

本章函数只返回内存中的字典，没有等待数据库或外部网络：

```python
def health_check() -> dict[str, str]:
    return {'status': 'ok'}
```

普通 `def` 足够清晰。

后面使用异步数据库时会看到：

```python
async def get_article():
    article = await session.get(Article, 1)
    return article
```

此时 `await` 表示数据库等待期间把执行机会交还给事件循环。

不要机械地认为 `async def` 比 `def` 高级。选择取决于内部调用的是同步库还是异步库。

## 路由顺序的第一个坑

局部示例：

```python
@app.get('/users/me')
def read_current_user():
    return {'id': 'me'}


@app.get('/users/{user_id}')
def read_user(user_id: str):
    return {'id': user_id}
```

固定路径 `/users/me` 应放在动态路径 `/users/{user_id}` 前面。否则 `me` 可能先被当成一个普通 `user_id`。

这里是局部示例，不需要加入当前文章项目。记住“固定路径通常放在同级动态路径前面”即可。

## 常见报错与排查

### `uvicorn` 不是命令

常见原因：虚拟环境没有激活，或者依赖安装到了另一个 Python。

改用：

```powershell
python -m uvicorn main:app --reload
```

再检查：

```powershell
python -m pip show uvicorn
```

### `Could not import module "main"`

先检查：

1. 当前目录是否真的有 `main.py`。
2. 文件是否被误保存成 `main.py.txt`。
3. 是否在项目根目录执行命令。
4. 终端上方是否还有更具体的 Python 语法错误。

### `Attribute "app" not found`

Uvicorn 已找到 `main.py`，但文件中没有名为 `app` 的变量。检查是否写成了其他名字，或启动命令右侧写错。

### 端口已被占用

看到 `address already in use` 或 Windows 套接字错误时，说明 8000 端口已有程序监听。可以先停止旧服务，或临时换端口：

```powershell
uvicorn main:app --reload --port 8001
```

访问地址也要改成 `http://127.0.0.1:8001`。

### 修改代码后没有变化

检查启动命令是否带 `--reload`，保存的是不是当前运行目录里的 `main.py`，终端是否因为语法错误导致重载失败。

## 本章动手改

不要直接看答案，自己完成：

1. 新增 `GET /version`，返回 `{"version": "0.1.0"}`。
2. 把 `/hello/{name}` 的响应增加 `length`，表示名字长度。
3. 用 GET 正常访问 `/health`，再用 POST 访问并观察 405。
4. 打开 `/openapi.json`，搜索 `/health`。
5. 把应用变量暂时从 `app` 改成 `application`，调整启动命令后再次运行。

第 2 题参考响应：

```json
{
  "message": "你好，小明",
  "length": 2
}
```

## 本章完成检查

- 当前终端的 Python 来自 `.venv`。
- `/health` 返回 200 和 `{"status":"ok"}`。
- 能解释 `main:app` 两边分别是什么。
- 能说明 Uvicorn 与 FastAPI 的职责差异。
- 知道装饰器是在登记路由。
- 遇到 404、405 时能区分路径不存在和方法不允许。

全部通过后，再进入第 03 章。下一章会把文章列表、详情和创建接口加入同一个项目。
