---
title: "第 2 篇：读懂 FastAPI 代码前必会 Python：import、类对象、装饰器、类型注解"
slug: "fastapi-python-reading-prerequisites"
summary: "读懂 FastAPI 代码前必须掌握的 Python 前置知识，覆盖 import、类与对象、装饰器、类型注解、异步、异常、上下文管理器和模块路径。"
category: "Web入门"
tags:
  - "Python"
  - "FastAPI"
  - "前置知识"
  - "装饰器"
  - "类型注解"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a6b57a2fca6347974f5d194"
originalSlug: "fastapi-python-reading-prerequisites"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 2 篇：读懂 FastAPI 代码前必会 Python：import、类对象、装饰器、类型注解

FastAPI 代码很短，但短不等于简单。一行路由可能同时包含装饰器、对象方法、路径规则、类型注解和异步函数。如果这些符号没有讲清楚，小白只能照抄。

这一章不追求完整讲完 Python，只解释后续教程马上会遇到的写法。

## 先读懂最小应用

完整文件 `main.py`：

```python
from fastapi import FastAPI

app = FastAPI()


@app.get('/hello')
def say_hello() -> dict[str, str]:
    return {'message': '你好，FastAPI'}
```

先用普通话翻译：

```text
从 fastapi 包中拿到 FastAPI 这个类
  -> 调用 FastAPI() 创建一个应用对象，名字叫 app
  -> 告诉 app：收到 GET /hello 时调用 say_hello
  -> say_hello 返回一个字典
  -> FastAPI 把字典转换成 JSON 响应
```

下面逐个拆开。

## `from ... import ...` 是拿到一个名字

```python
from fastapi import FastAPI
```

- 第一个小写 `fastapi` 是已经安装的 Python 包。
- 第二个大写 `FastAPI` 是包中提供的类。
- 导入后，当前文件才能写 `FastAPI()`。

如果没有安装包，会看到：

```text
ModuleNotFoundError: No module named 'fastapi'
```

这通常不是代码逻辑错，而是当前 Python 环境没有安装依赖，或者终端没有激活项目虚拟环境。

检查：

```powershell
python -c "import sys; print(sys.executable)"
python -m pip show fastapi
```

## 类、对象和方法

```python
app = FastAPI()
```

可以先用一个不严谨但好理解的比喻：类像生产说明书，对象是按说明书创建出来的成品。

- `FastAPI` 是类。
- `FastAPI()` 表示创建对象。
- `app` 是变量，保存创建出的对象。
- `app.get` 是这个对象提供的方法。

后面会看到：

```python
router = APIRouter()
settings = Settings()
article = ArticleRead(...)
```

它们都是同一种基本结构：调用类，得到对象，再通过对象使用能力。

## 装饰器 `@app.get()` 到底做了什么

```python
@app.get('/hello')
def say_hello():
    return {'message': '你好'}
```

`@` 开头的这一行叫装饰器。这里不是“立即调用接口”，而是在程序启动导入模块时完成路由登记：

```text
请求方法：GET
请求路径：/hello
处理函数：say_hello
```

可以把它理解为在应用的路由表中登记一条规则。之后客户端真的请求 `GET /hello`，FastAPI 才调用 `say_hello()`。

装饰器必须紧挨着它要登记的函数，不能在二者之间插入其他语句。

## 函数名、参数和返回值

```python
def say_hello() -> dict[str, str]:
    return {'message': '你好，FastAPI'}
```

- `def`：定义普通函数。
- `say_hello`：函数名，主要给代码和日志阅读。
- `()`：这里没有参数。
- `-> dict[str, str]`：返回值类型注解。
- `return`：结束函数并交回结果。

`dict[str, str]` 表示“键是字符串、值也是字符串的字典”。类型注解主要帮助人、编辑器和框架理解数据，不是另起一个变量。

## 常见类型注解

```python
name: str
age: int
enabled: bool
tags: list[str]
article: ArticleRead
```

读法：

| 写法 | 含义 |
| --- | --- |
| `str` | 字符串 |
| `int` | 整数 |
| `bool` | 布尔值 |
| `list[str]` | 由字符串组成的列表 |
| `dict[str, int]` | 键为字符串、值为整数的字典 |
| `ArticleRead` | 一个 ArticleRead 对象 |

FastAPI 会读取路由参数的类型注解。例如：

```python
@app.get('/articles/{article_id}')
def get_article(article_id: int):
    return {'article_id': article_id}
```

请求 `/articles/12` 时，FastAPI 会把路径中的字符串 `12` 转成整数。请求 `/articles/abc` 时无法转换，FastAPI 自动返回 422，函数不会执行。

## `str | None` 和默认值不是一回事

```python
keyword: str | None = None
```

分两半读：

- `str | None`：值允许是字符串，也允许是空值 `None`。
- `= None`：调用者不提供它时，默认使用 `None`。

在接口中，这通常表示一个可不传的查询参数：

```python
@app.get('/articles')
def list_articles(keyword: str | None = None):
    return {'keyword': keyword}
```

- 请求 `/articles?keyword=python`，`keyword` 是 `'python'`。
- 请求 `/articles`，`keyword` 是 `None`。

## `Annotated` 是“类型加说明”

后面经常看到：

```python
from typing import Annotated

from fastapi import Path


article_id: Annotated[int, Path(gt=0)]
```

不要被长度吓到。它仍然表示一个整数，只是额外告诉 FastAPI：这个整数来自路径，而且必须大于 0。

可以这样拆读：

```text
Annotated[
    int,          # 真正的数据类型
    Path(gt=0)    # FastAPI 使用的额外规则
]
```

## `def`、`async def` 和 `await`

普通函数：

```python
def add(a: int, b: int) -> int:
    return a + b
```

异步函数：

```python
async def load_data():
    result = await async_client.get('/data')
    return result
```

现阶段先记住三条：

1. `async def` 定义异步函数。
2. `await` 只能直接写在异步函数中。
3. 只有调用异步数据库、异步 HTTP 客户端等可等待操作时，异步才真正有价值。

入门配套项目暂时使用普通 `def`，因为内存字典没有网络等待。第 07 章使用异步数据库后，再切换成 `async def` 和 `await`。不要为了看起来高级，把所有函数机械改成异步。

## `if value is None` 为什么常见

```python
article = article_store.get(article_id)
if article is None:
    raise ArticleNotFoundError(article_id)
return article
```

仓库找不到文章时返回 `None`。Service 不能继续假装文章存在，所以抛出异常。

这里使用 `is None`，而不是 `== None`，是 Python 判断空对象的惯用方式。

## `raise` 是主动停止当前流程

```python
raise ArticleNotFoundError(article_id)
```

`raise` 抛出异常后，当前函数不会继续向下执行。FastAPI 的异常处理器可以捕获它并转换为 404 响应。

这和直接 `return {'error': ...}` 的区别是：成功结果和失败流程不会混在一起，多个接口也能复用同一个错误规则。

## `try / except / finally`

```python
try:
    result = risky_operation()
except ValueError:
    print('输入不合法')
finally:
    close_resource()
```

- `try`：尝试执行可能失败的代码。
- `except`：捕获指定异常并处理。
- `finally`：无论成功失败都执行，常用于关闭文件、连接或 Session。

不要写一个空泛的 `except Exception: pass`。它会把真正错误吞掉，让程序表面没报错、实际数据却不正确。

## `with` 和 `async with`

```python
with open('note.txt', encoding='utf-8') as file:
    content = file.read()
```

`with` 管理资源的进入和退出。代码块结束时，即使发生异常，文件也会关闭。

异步资源使用：

```python
async with SessionFactory() as session:
    pass  # 在这里执行需要 Session 的异步操作。
```

它表达同一种思想，只是进入和退出过程需要异步等待。

## `yield` 为什么会出现在数据库依赖中

```python
async def get_db():
    async with SessionFactory() as session:
        yield session
```

在 FastAPI 依赖里，可以先这样理解：

```text
yield 前：创建资源
yield 的值：交给路由函数使用
路由完成后：回到依赖中做清理
```

它和普通 `return` 不同，`yield` 之后的清理代码还有机会执行。

## 模块路径 `app.main:app`

启动命令：

```powershell
uvicorn app.main:app --reload
```

冒号两边不是随便写的：

```text
app.main : app
模块路径   模块中的变量名
```

Uvicorn 会找到 `app/main.py`，导入它，再取出名为 `app` 的 FastAPI 对象。

因此命令必须在包含 `app` 目录的项目根目录执行。若站在 `app` 目录里面执行同一命令，常会出现找不到模块。

## 相对路径和当前工作目录

下面的路径：

```python
Path('uploads/media')
```

通常相对于“启动命令所在目录”，不一定相对于当前 `.py` 文件。真实项目应统一启动目录，必要时基于明确的项目根路径构造绝对路径。

## 看不懂一段代码时怎么拆

例如：

```python
changes = payload.model_dump(exclude_unset=True)
```

按从右到左拆：

1. `payload` 是谁创建的对象？
2. `model_dump` 是这个对象的什么方法？
3. `exclude_unset=True` 这个参数控制什么？
4. 方法返回什么？
5. 返回值被变量 `changes` 保存后在哪里使用？

这里的答案是：`payload` 是 Pydantic 更新模型；`model_dump` 把模型转成字典；`exclude_unset=True` 排除客户端没有传的字段；最终字典用于只修改明确提交的字段。

遇到长代码不要整块硬记，先找输入、处理和输出。

## Express 对照：同一段代码在 Node.js 中怎样读

FastAPI 的 Python 语法不需要逐字翻译成 JavaScript，但可以先建立下面这组映射：

| FastAPI / Python | Express / JavaScript | 关键差异 |
| --- | --- | --- |
| `def` / `async def` | 普通函数 / `async function` | Express 5 会自动把异步路由的 rejected Promise 交给错误处理中间件 |
| 类型注解 | JSDoc 或 TypeScript 类型 | JavaScript 类型不会在运行时自动校验 |
| `@app.get(...)` | `app.get(...)` | Python 装饰器是在导入时登记路由，Express 直接调用方法登记 |
| `yield` 依赖 | `try/finally` 包裹资源 | 两边都要保证请求结束时释放资源 |

例如，下面两段代码表达的是同一个“返回健康状态”的接口：

```python
@app.get('/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}
```

```js
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})
```

Python 的 `-> dict[str, str]` 主要帮助阅读器和 FastAPI 生成契约；Express 不会因为函数返回了对象就自动发送响应，必须显式调用 `res.json`。这也是从 FastAPI 转回 Express 时最容易漏掉的边界。

## 本章动手练习

创建 `main.py`，写入本章最小应用并启动：

```powershell
uvicorn main:app --reload
```

然后完成：

1. 把路径 `/hello` 改为 `/welcome`。
2. 把函数名改成 `welcome`，观察接口行为是否变化。
3. 新增路径参数 `/hello/{name}`，返回传入的名字。
4. 故意把导入写成错误名字，读懂 ImportError 后再恢复。
5. 故意在启动目录的上一级执行命令，观察模块路径错误。

## 本章检查

- 能用自己的话解释 `app = FastAPI()`。
- 知道 `@app.get()` 是登记路由，不是立即执行请求。
- 能读懂 `str | None = None`。
- 知道 `async def` 不等于代码自动变快。
- 能解释 `app.main:app` 两边分别是什么。
- 遇到未定义名字时，会先检查导入和代码上下文，而不是盲目重装 Python。
