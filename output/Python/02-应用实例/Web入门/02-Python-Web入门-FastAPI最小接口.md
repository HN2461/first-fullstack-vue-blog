---
title: Python Web 入门 02：FastAPI 最小接口
slug: python-web-fastapi-minimal-api
summary: 用 FastAPI 写第一个接口，理解路径参数、查询参数、类型提示、自动校验和自动接口文档。
category: Python应用实例
tags:
  - Python
  - Web
  - FastAPI
status: draft
cover:
---

# Python Web 入门 02：FastAPI 最小接口

FastAPI 是现代 Python API 框架，特别适合写前后端分离项目里的 JSON 接口。

如果 Flask 更像“先让你看懂 Web 是什么”，FastAPI 更像“直接用现代 API 项目习惯来写”。

它最明显的特点是：

- 通过类型提示做参数转换和校验。
- 自动生成接口文档。
- 很适合写 JSON API。

## 安装 FastAPI

FastAPI 本身是框架，运行本地开发服务通常会配合 ASGI 服务器。

```powershell
python -m pip install fastapi uvicorn
```

## 第一个 FastAPI 应用

新建 `main.py`：

```python
from fastapi import FastAPI

app = FastAPI()


@app.get('/')
def read_root():
    return {'message': 'Hello, FastAPI'}
```

运行：

```powershell
uvicorn main:app --reload
```

访问：

```text
http://127.0.0.1:8000/
```

返回：

```json
{
  "message": "Hello, FastAPI"
}
```

## main:app 是什么意思

```text
uvicorn main:app --reload
```

可以拆开理解：

- `main`：文件名 `main.py`。
- `app`：代码里的 `app = FastAPI()`。
- `--reload`：开发模式下代码改动后自动重启。

## 路径参数

路径参数写在 URL 路径里。

```python
from fastapi import FastAPI

app = FastAPI()


@app.get('/api/articles/{article_id}')
def read_article(article_id: int):
    return {
        'article_id': article_id,
        'title': f'文章 {article_id}'
    }
```

这里的 `article_id: int` 很重要。

如果访问：

```text
/api/articles/100
```

FastAPI 会把 `100` 转成整数。

如果访问：

```text
/api/articles/abc
```

FastAPI 会自动返回参数校验错误，因为 `abc` 不能转换成整数。

## 查询参数

查询参数是问号后面的内容。

```python
from fastapi import FastAPI

app = FastAPI()


@app.get('/api/search')
def search(keyword: str = '', page: int = 1):
    return {
        'keyword': keyword,
        'page': page,
        'items': []
    }
```

访问：

```text
/api/search?keyword=python&page=2
```

返回：

```json
{
  "keyword": "python",
  "page": 2,
  "items": []
}
```

FastAPI 会根据函数参数自动识别：

- 路径里有的，是路径参数。
- 路径里没有但函数里声明的，是查询参数。

## 可选参数

如果参数可以不传，可以写成：

```python
from fastapi import FastAPI

app = FastAPI()


@app.get('/api/articles')
def list_articles(category: str | None = None):
    return {
        'category': category,
        'items': []
    }
```

`str | None` 表示这个参数可能是字符串，也可能是空值。

## 自动接口文档

启动服务后访问：

```text
http://127.0.0.1:8000/docs
```

你会看到 FastAPI 自动生成的接口文档，可以直接在页面里测试接口。

再访问：

```text
http://127.0.0.1:8000/redoc
```

可以看到另一种文档展示形式。

这是 FastAPI 很适合学习 API 的原因：你写完接口，就能马上在文档里看到参数和返回结构。

## 一个小型文章接口

```python
from fastapi import FastAPI

app = FastAPI()

articles = [
    {'id': 1, 'title': 'Python 基础', 'category': 'Python'},
    {'id': 2, 'title': 'Python 爬虫', 'category': 'Python'},
    {'id': 3, 'title': 'Vue 入门', 'category': '前端'}
]


@app.get('/api/articles')
def list_articles(category: str | None = None):
    if category is None:
        result = articles
    else:
        result = [
            article for article in articles
            if article['category'] == category
        ]

    return {
        'total': len(result),
        'items': result
    }


@app.get('/api/articles/{article_id}')
def get_article(article_id: int):
    for article in articles:
        if article['id'] == article_id:
            return article

    return {
        'message': '文章不存在'
    }
```

这个例子没有连接数据库，只是先用列表和字典模拟数据。

等基础稳了，再把 `articles` 换成数据库查询。

## async def 和 def 怎么选

FastAPI 支持两种写法：

```python
@app.get('/sync')
def sync_api():
    return {'type': 'sync'}
```

```python
@app.get('/async')
async def async_api():
    return {'type': 'async'}
```

入门阶段可以先用普通 `def`。

当你使用异步数据库、异步 HTTP 请求等异步库时，再学习 `async def`。

不要为了“看起来高级”强行把所有函数都写成异步。

## 小练习

写三个接口：

1. `/api/health`：返回 `{'status': 'ok'}`。
2. `/api/users/{user_id}`：`user_id` 必须是整数。
3. `/api/search?keyword=python&page=1`：返回查询参数。

写完后打开：

```text
http://127.0.0.1:8000/docs
```

在文档里测试这三个接口。

## 本篇小结

这一篇你需要记住：

- FastAPI 用 `app = FastAPI()` 创建应用。
- `@app.get()` 定义 GET 接口。
- `{article_id}` 表示路径参数。
- `article_id: int` 会触发自动类型转换和校验。
- 函数里有默认值的参数通常是查询参数。
- `/docs` 会生成可交互接口文档。

## 下一步：从最小接口进入项目开发

如果你已经能独立完成上面的健康检查、路径参数和查询参数练习，不要继续只堆更多“返回字典”的小例子。下一步应按公司项目的方式补齐：

1. 项目目录和路由拆分。
2. Pydantic 请求/响应模型与统一错误。
3. 数据库 Session、ORM 和 Alembic 迁移。
4. 登录、JWT、角色和对象级权限。
5. pytest/API 测试、日志、部署和回滚。

完整的可复制骨架见：`04-Python-Web入门-FastAPI公司项目开发手册.md`。

参考资料：

- FastAPI 官方文档：https://fastapi.tiangolo.com/
- Uvicorn 官方文档：https://www.uvicorn.org/
