---
title: Python Web 入门 03：Flask、FastAPI、Django 怎么选
slug: python-web-framework-choice
summary: 对比 Flask、FastAPI、Django 的定位、适合场景和学习顺序，帮助零基础学习者从“能写接口”逐步过渡到完整后端项目。
category: Python应用实例
tags:
  - Python
  - Web
  - Flask
  - FastAPI
  - Django
status: draft
cover:
---

# Python Web 入门 03：Flask、FastAPI、Django 怎么选

学 Python Web 时最容易卡住的问题不是语法，而是：

> Flask、FastAPI、Django 到底先学哪个？

这三个都能写 Web 应用，但定位不一样。

## 先给结论

如果你是零基础刚学完 Python 语法，建议：

1. 先用 Flask 理解 Web 后端最小模型。
2. 再用 FastAPI 学现代 JSON API 和类型提示。
3. 最后根据需要学习 Django 的完整项目能力。

不要一上来同时学三个框架。框架越多，越容易把路由、配置、数据库、目录结构混在一起。

## 三个框架的直觉区别

| 框架 | 直觉 | 适合做什么 |
| --- | --- | --- |
| Flask | 小而清楚 | 入门、简单接口、小工具、理解 Web 基础 |
| FastAPI | 现代 API | 前后端分离接口、自动文档、类型校验 |
| Django | 大而完整 | 后台系统、内容管理、用户权限、数据库驱动应用 |

可以这样理解：

- Flask 像一张白纸，适合看清楚每一笔。
- FastAPI 像现代接口工作台，适合写清晰的 API。
- Django 像一整套后端系统框架，很多能力已经内置。

## Flask 适合什么时候学

Flask 适合用来理解这些概念：

- 什么是路由。
- 什么是请求。
- 什么是响应。
- 如何返回 JSON。
- 如何读取查询参数。
- 前端请求后端时，后端代码到底执行了什么。

你不需要一开始就用 Flask 做完整系统。它最适合做“Web 后端第一课”。

## FastAPI 适合什么时候学

FastAPI 适合在你已经理解路由和请求之后学习。

它会把 Python 类型提示用到 API 参数上：

```python
@app.get('/api/articles/{article_id}')
def get_article(article_id: int):
    return {'article_id': article_id}
```

这里的 `int` 不只是注释，它会参与参数转换和校验。

FastAPI 还会自动生成文档，这对前后端分离开发很友好。

## Django 适合什么时候学

Django 适合做更完整的后端项目。

它内置了很多能力：

- 项目结构
- 路由系统
- ORM 数据库操作
- 管理后台
- 表单
- 用户认证
- 权限
- 模板

这也是它的优点和难点：你会一下子遇到很多概念。

如果你的目标是“快速理解 Python 怎么写接口”，Django 不是最轻的第一步。

如果你的目标是“做一个完整内容管理系统、后台系统、数据库应用”，Django 很值得学。

## 和当前全栈博客系统的关系

你现在这个博客系统后端是 Node.js + Express + MongoDB。

学 Python Web 时，可以先做类比：

| 当前项目 | Python Web 对应 |
| --- | --- |
| Express 路由 | Flask / FastAPI 路由 |
| Controller / route handler | 路由函数 |
| req.query | Flask `request.args` / FastAPI 查询参数 |
| res.json() | 返回 dict |
| Mongoose Model | Django ORM / SQLAlchemy / ODM |
| API 文档 | FastAPI `/docs` |

这样学 Python Web 时，不是另起炉灶，而是在已有全栈经验上迁移概念。

## 推荐学习路线

### 第一阶段：Web 基本概念

目标：知道请求进来后，后端函数怎么执行。

练习：

- 写 `/api/health`。
- 写 `/api/articles`。
- 写 `/api/articles/{id}`。
- 写查询参数筛选。

建议框架：Flask 或 FastAPI。

### 第二阶段：接口规范

目标：接口更像真实项目。

练习：

- 统一返回格式。
- 参数校验。
- 错误处理。
- 分页。
- 搜索。

建议框架：FastAPI。

### 第三阶段：连接数据库

目标：从假数据过渡到真实数据。

练习：

- 新增文章。
- 查询文章列表。
- 修改文章。
- 删除文章。
- 按分类筛选。

可选技术：

- FastAPI + SQLAlchemy
- Flask + SQLAlchemy
- Django ORM

### 第四阶段：完整系统能力

目标：理解一个后端项目怎么组织。

练习：

- 用户登录。
- 权限控制。
- 后台管理。
- 文件上传。
- 配置管理。
- 日志和测试。

建议框架：Django 或 FastAPI 项目化结构。

## 新手不要同时追的东西

刚入门时，不建议同时追：

- 三个框架一起学。
- 异步、协程、并发一起学。
- ORM、数据库迁移、缓存一起学。
- 认证、权限、OAuth、JWT 一起学。
- Docker、Nginx、部署一起学。

这些都重要，但不是第一天一起重要。

先让一个接口跑起来，能被浏览器或前端请求到，这一步最关键。

## 一个现实选择

如果你主要目的是学习 Python，并和全栈开发连接起来：

1. Flask 学 1-2 天，理解 Web 后端最小模型。
2. FastAPI 学 3-5 天，完成一组文章 API。
3. pandas / 爬虫方向穿插练习，提升脚本和数据处理能力。
4. 后面要做完整 Python 后端项目时，再决定 Django 或 FastAPI 深入。

## 小练习

对照你自己的学习目标，写下三个答案：

1. 我现在学 Python Web 是为了看懂接口、写脚本，还是做完整项目？
2. 我更需要快速写 JSON API，还是需要完整后台系统？
3. 我当前最应该补的是 Python 基础、Web 请求响应，还是数据库？

这三个问题比“哪个框架最好”更有价值。

## 本篇小结

你可以先这样记：

- Flask：适合理解 Web 基础。
- FastAPI：适合写现代 API。
- Django：适合完整后端系统。
- 零基础不要同时学三个框架。
- 最推荐路线：Flask 入门、FastAPI 实战、Django 按项目需要补。

参考资料：

- Flask 官方文档：https://flask.palletsprojects.com/
- FastAPI 官方文档：https://fastapi.tiangolo.com/
- Django 官方文档：https://docs.djangoproject.com/
