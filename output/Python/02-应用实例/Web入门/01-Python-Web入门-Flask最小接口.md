---
title: Python Web 入门 01：Flask 最小接口
slug: python-web-flask-minimal-api
summary: 用 Flask 写一个最小 Web 应用，理解路由、请求参数、JSON 返回和本地开发服务器的基本关系。
category: Python应用实例
tags:
  - Python
  - Web
  - Flask
status: draft
cover:
---

# Python Web 入门 01：Flask 最小接口

学 Python Web，不要一开始就背“框架生态”。先理解一个最小问题：

> 浏览器或前端请求一个地址，Python 后端返回一段内容。

Flask 是一个轻量 Web 框架，适合用来理解 Web 后端的基本形状。

## 安装 Flask

```powershell
python -m pip install flask
```

建议在虚拟环境中安装。

## 第一个 Flask 应用

新建 `app.py`：

```python
from flask import Flask

app = Flask(__name__)


@app.route('/')
def index():
    return 'Hello, Flask'
```

运行：

```powershell
flask --app app run
```

然后访问：

```text
http://127.0.0.1:5000/
```

你会看到：

```text
Hello, Flask
```

## 这几行代码是什么意思

```python
from flask import Flask
```

从 Flask 包里导入 `Flask` 类。

```python
app = Flask(__name__)
```

创建一个 Flask 应用对象。后续路由都会挂到这个对象上。

```python
@app.route('/')
def index():
    return 'Hello, Flask'
```

`@app.route('/')` 表示：当用户访问 `/` 路径时，执行下面这个函数。

这个函数返回什么，浏览器就收到什么。

## 返回 JSON

前后端分离项目里，后端通常返回 JSON。

```python
from flask import Flask

app = Flask(__name__)


@app.route('/api/profile')
def profile():
    return {
        'name': '小明',
        'role': 'Python learner'
    }
```

访问：

```text
http://127.0.0.1:5000/api/profile
```

Flask 可以把字典自动转换成 JSON 响应。

## 路由参数

路由参数就是 URL 路径里变化的部分。

```python
from flask import Flask

app = Flask(__name__)


@app.route('/api/articles/<slug>')
def article_detail(slug):
    return {
        'slug': slug,
        'title': f'文章：{slug}'
    }
```

访问：

```text
http://127.0.0.1:5000/api/articles/python-basic
```

返回：

```json
{
  "slug": "python-basic",
  "title": "文章：python-basic"
}
```

## 查询参数

查询参数是问号后面的内容。

```text
/api/search?keyword=python&page=1
```

Flask 里用 `request.args` 获取。

```python
from flask import Flask, request

app = Flask(__name__)


@app.route('/api/search')
def search():
    keyword = request.args.get('keyword', '')
    page = request.args.get('page', 1, type=int)

    return {
        'keyword': keyword,
        'page': page,
        'items': []
    }
```

`request.args.get('page', 1, type=int)` 的意思是：

- 获取 `page` 参数。
- 如果没有传，默认是 `1`。
- 尝试转换成整数。

## 一个小型文章接口

```python
from flask import Flask, request

app = Flask(__name__)

articles = [
    {'id': 1, 'title': 'Python 基础', 'category': 'Python'},
    {'id': 2, 'title': 'Python 爬虫', 'category': 'Python'},
    {'id': 3, 'title': 'Vue 入门', 'category': '前端'}
]


@app.route('/api/articles')
def article_list():
    category = request.args.get('category', '')

    if category:
        result = [
            article for article in articles
            if article['category'] == category
        ]
    else:
        result = articles

    return {
        'total': len(result),
        'items': result
    }
```

访问：

```text
http://127.0.0.1:5000/api/articles?category=Python
```

这个例子用到了：

- 列表保存多篇文章。
- 字典保存单篇文章。
- 查询参数筛选数据。
- 返回 JSON 给前端。

## Flask 和前端的关系

如果你写过 Vue，可以这样对应：

| 前端 Vue | 后端 Flask |
| --- | --- |
| `axios.get('/api/articles')` | `@app.route('/api/articles')` |
| 请求参数 `params` | `request.args` |
| JSON 响应 | 返回字典 |
| 页面路由 | API 路由 |

前端负责展示和交互，后端负责接收请求、处理数据、返回结果。

## 小练习

写一个 `/api/tags` 接口，返回：

```json
{
  "items": ["Python", "Flask", "Web"]
}
```

再写一个 `/api/hello` 接口，支持：

```text
/api/hello?name=小明
```

返回：

```json
{
  "message": "你好，小明"
}
```

## 本篇小结

这一篇你需要记住：

- Flask 应用从 `app = Flask(__name__)` 开始。
- `@app.route()` 用来定义路由。
- 访问某个路径时，会执行对应函数。
- 返回字典时，Flask 可以自动生成 JSON 响应。
- `request.args` 用来读取查询参数。
- Flask 很适合理解 Web 后端的最小模型。

参考资料：

- Flask 官方文档：https://flask.palletsprojects.com/
