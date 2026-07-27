# 前五章配套项目：小白文章 API

这是一个可以直接运行的最小项目。它先用 Python 字典保存数据，目的是让你把注意力放在 HTTP、路由、Schema、异常和分层上。应用重启后数据会消失，这是刻意设计，不是故障。第 6 章再学习如何替换成数据库。

## 运行

在本目录打开 PowerShell：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

浏览器打开：

```text
http://127.0.0.1:8000/docs
```

先调用 `POST /articles` 创建文章，再调用 `GET /articles` 查看列表。

## 测试

```powershell
pytest -q
```

正常结果应为 `3 passed`。

## 文件职责

| 文件 | 作用 |
| --- | --- |
| `app/main.py` | 创建应用并组装路由、异常处理器 |
| `app/schemas.py` | 定义客户端可以传什么、服务端返回什么 |
| `app/routers/articles.py` | 接收 HTTP 请求，声明路径和状态码 |
| `app/services.py` | 表达查询、创建、更新、删除文章等业务动作 |
| `app/store.py` | 暂时把文章保存在内存字典中 |
| `app/errors.py` | 定义业务异常以及统一 404 响应 |
| `tests/test_articles.py` | 验证成功和失败路径 |

不要一次背下所有文件。按照教程顺序，先看 `main.py`，再看 Router 和 Schema，最后再理解 Service 与 Store 的拆分。
