---
title: "第 24 篇：logging 日志模块：日志级别、格式化、文件输出、配置"
slug: "python-zero-logging-module"
summary: "面向零基础系统学习 Python 标准库 logging，掌握日志级别、basicConfig、格式化、文件输出、异常记录、Logger、Handler、Formatter、日志轮转、多模块项目配置和常见问题排查。"
category: "知识目录"
tags:
  - "Python"
  - "logging"
  - "日志模块"
  - "日志级别"
  - "格式化"
  - "文件输出"
status: "draft"
sortOrder: 240
cover: ""
originalId: "6a6b57a2fca6347974f5d17e"
originalSlug: "python-zero-logging-module"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 24 篇：logging 日志模块：日志级别、格式化、文件输出、配置

这一篇学习 Python 标准库里的 `logging` 模块。

很多人第一次接触它时，会把它叫作“logging 打印模块”。这个说法方便理解，但更准确的名称是“日志模块”。

`print()` 主要用于临时查看数据，`logging` 则用于持续记录程序在什么时候、以什么级别、在哪个模块发生了什么事情。

你可以先记住一句话：

> `print()` 适合临时调试，`logging` 适合记录程序的运行过程。

学习路线如下：

```text
先输出一条日志
-> 理解日志级别
-> 设置日志格式
-> 把日志写入文件
-> 记录异常堆栈
-> 在多模块项目中使用 Logger
-> 用 Handler、Formatter 和日志轮转完善配置
```

先看一张能力地图：

| 能力 | 常用对象 / 参数 | 解决的问题 |
| --- | --- | --- |
| 输出日志 | `debug()`、`info()`、`warning()`、`error()`、`critical()` | 区分不同严重程度的信息 |
| 基础配置 | `logging.basicConfig()` | 快速设置级别、格式和输出文件 |
| 创建记录器 | `logging.getLogger(__name__)` | 标记日志来自哪个模块 |
| 格式化日志 | `logging.Formatter` | 统一时间、级别、模块名和消息格式 |
| 指定输出位置 | `StreamHandler`、`FileHandler` | 同时输出到控制台和文件 |
| 记录异常 | `logger.exception()` | 保存错误消息和完整调用堆栈 |
| 控制文件大小 | `RotatingFileHandler` | 日志达到指定大小后自动切分 |
| 按时间切分 | `TimedRotatingFileHandler` | 每天、每小时生成新的日志文件 |

## 一、为什么有了 print 还要 logging

先看最熟悉的 `print()`：

```python
user_id = 1001
print("用户登录成功", user_id)
```

它会输出：

```text
用户登录成功 1001
```

学习语法或临时查看变量时，这样完全没问题。

但真实项目通常还需要知道：

- 这条信息是什么时间产生的。
- 它是普通信息、警告还是错误。
- 它来自哪个 Python 文件或函数。
- 程序关闭后能不能继续查看。
- 错误发生时，完整的调用过程是什么。
- 生产环境中是否应该隐藏调试信息。

`print()` 不会自动解决这些问题，而 `logging` 就是专门做这件事的。

| 对比项 | `print()` | `logging` |
| --- | --- | --- |
| 学习成本 | 很低 | 需要少量配置 |
| 日志级别 | 没有 | 有 DEBUG、INFO、WARNING 等级别 |
| 时间、模块名 | 需要自己拼接 | 可以统一格式化 |
| 输出到文件 | 需要自己处理 | 原生支持 |
| 异常堆栈 | 不方便 | `logger.exception()` 可直接记录 |
| 生产环境控制 | 需要到处修改代码 | 调整级别即可过滤 |
| 多模块项目 | 难统一 | 可以使用同一套配置 |

因此不要把两者理解成“只能二选一”：

- 学习代码、临时看变量，可以用 `print()`。
- 脚本运行记录、爬虫、接口服务和正式项目，应优先用 `logging`。

## 二、第一条 logging 日志

`logging` 是 Python 标准库，不需要执行 `pip install`。

创建 `logging_demo.py`：

```python
import logging

logging.warning("磁盘空间不足")
logging.error("文件保存失败")
```

运行：

```powershell
python logging_demo.py
```

输出类似：

```text
WARNING:root:磁盘空间不足
ERROR:root:文件保存失败
```

这条日志由三部分组成：

```text
WARNING : root : 磁盘空间不足
日志级别   记录器名   日志内容
```

这里的 `root` 是根记录器。直接调用 `logging.warning()`、`logging.error()` 时，使用的就是它。

## 三、五个常用日志级别

`logging` 最常用的日志级别从低到高排列如下：

| 级别 | 数值 | 适合记录什么 |
| --- | ---: | --- |
| `DEBUG` | 10 | 调试细节、变量值、执行分支 |
| `INFO` | 20 | 正常运行过程、任务开始和完成 |
| `WARNING` | 30 | 出现异常迹象，但程序还能继续 |
| `ERROR` | 40 | 某个操作失败，需要排查 |
| `CRITICAL` | 50 | 严重错误，程序可能无法继续 |

对应的方法是：

```python
import logging

logging.debug("正在读取配置文件")
logging.info("服务启动成功")
logging.warning("缓存连接较慢")
logging.error("用户数据保存失败")
logging.critical("数据库完全不可用")
```

如果直接运行，你可能只能看到：

```text
WARNING:root:缓存连接较慢
ERROR:root:用户数据保存失败
CRITICAL:root:数据库完全不可用
```

`DEBUG` 和 `INFO` 没有显示，不是代码失效了，而是 `logging` 默认只显示 `WARNING` 及以上级别。

## 四、日志级别是过滤门槛

可以把配置的日志级别理解成一道门槛。

当级别设置为 `INFO` 时：

| 产生的日志 | 是否输出 |
| --- | --- |
| `DEBUG` | 否 |
| `INFO` | 是 |
| `WARNING` | 是 |
| `ERROR` | 是 |
| `CRITICAL` | 是 |

下面把门槛设置为 `INFO`：

```python
import logging

logging.basicConfig(level=logging.INFO)

logging.debug("调试信息")
logging.info("程序开始运行")
logging.warning("请求响应较慢")
```

输出：

```text
INFO:root:程序开始运行
WARNING:root:请求响应较慢
```

常见环境可以这样选择：

| 环境 | 建议级别 | 原因 |
| --- | --- | --- |
| 本地开发 | `DEBUG` 或 `INFO` | 需要较多排查信息 |
| 测试环境 | `INFO` | 观察主要流程和异常 |
| 生产环境 | `INFO` 或 `WARNING` | 减少噪声，保留重要记录 |

生产环境不一定只能用 `WARNING`。业务开始、任务完成、请求耗时等 `INFO` 信息也经常很有价值，应根据项目需要决定。

## 五、使用 basicConfig 完成基础配置

`logging.basicConfig()` 用来快速配置日志系统。

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)

logging.info("文章导入开始")
logging.warning("发现一条重复文章")
```

输出类似：

```text
2026-07-20 20:30:15,128 [INFO] root - 文章导入开始
2026-07-20 20:30:15,129 [WARNING] root - 发现一条重复文章
```

这里的主要参数是：

| 参数 | 作用 |
| --- | --- |
| `level` | 设置最低输出级别 |
| `format` | 设置每条日志的显示格式 |
| `datefmt` | 设置时间格式 |
| `filename` | 把日志写入指定文件 |
| `filemode` | 文件写入模式，常用 `a` 或 `w` |
| `encoding` | 日志文件编码，中文建议使用 `utf-8` |

### 设置时间格式

默认时间会带毫秒：

```text
2026-07-20 20:30:15,128
```

如果只想保留到秒，可以配置 `datefmt`：

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

logging.info("程序启动")
```

输出：

```text
2026-07-20 20:30:15 [INFO] 程序启动
```

## 六、常用日志格式字段

`format` 中的 `%(...)s` 是日志记录字段占位符。

常见字段如下：

| 字段 | 含义 | 示例 |
| --- | --- | --- |
| `%(asctime)s` | 日志时间 | `2026-07-20 20:30:15` |
| `%(levelname)s` | 日志级别名称 | `INFO` |
| `%(name)s` | Logger 名称 | `services.article` |
| `%(message)s` | 传入的日志内容 | `文章保存成功` |
| `%(filename)s` | 当前文件名 | `article_service.py` |
| `%(lineno)d` | 产生日志的代码行号 | `42` |
| `%(funcName)s` | 当前函数名 | `save_article` |
| `%(process)d` | 进程编号 | `23840` |
| `%(threadName)s` | 线程名称 | `MainThread` |

开发环境可以增加文件名和行号：

```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format=(
        "%(asctime)s [%(levelname)s] %(name)s "
        "(%(filename)s:%(lineno)d) - %(message)s"
    ),
    datefmt="%Y-%m-%d %H:%M:%S"
)

logging.debug("开始校验文章参数")
```

格式不是越长越好。字段过多会影响阅读，应该保留真正有助于排查问题的信息。

## 七、日志消息中怎样插入变量

最直观的写法是 f-string：

```python
import logging

article_id = 1001
logging.info(f"文章保存成功，article_id={article_id}")
```

这可以正常运行。

不过日志系统更推荐使用参数化写法：

```python
import logging

article_id = 1001
logging.info("文章保存成功，article_id=%s", article_id)
```

多个变量也一样：

```python
title = "Python logging 入门"
status = "draft"

logging.info(
    "文章创建成功，title=%s，status=%s",
    title,
    status
)
```

推荐这种写法的原因是：如果当前级别不会输出，日志模块可以推迟字符串格式化，避免提前做无意义的拼接。

注意这里不要自己使用 `%` 提前格式化：

```python
# 不推荐：字符串已经提前完成格式化
logging.info("文章编号：%s" % article_id)
```

推荐：

```python
logging.info("文章编号：%s", article_id)
```

日志里的 `%s` 不限制变量必须是字符串，整数、列表和字典也可以传入，logging 会在输出时完成转换。

## 八、把日志保存到文件

只要在 `basicConfig()` 中增加 `filename`，就能把日志写入文件：

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    filename="app.log",
    filemode="a",
    encoding="utf-8"
)

logging.info("程序启动")
logging.warning("接口响应时间超过 2 秒")
```

运行后，当前目录会生成 `app.log`：

```text
2026-07-20 20:30:15 [INFO] 程序启动
2026-07-20 20:30:18 [WARNING] 接口响应时间超过 2 秒
```

关键参数：

- `filename="app.log"`：日志文件路径。
- `filemode="a"`：追加写入，不覆盖以前的日志。
- `encoding="utf-8"`：使用 UTF-8 保存中文。

`filemode` 的区别：

| 模式 | 作用 | 建议 |
| --- | --- | --- |
| `a` | 每次在文件末尾追加 | 正式日志常用 |
| `w` | 每次启动都覆盖旧文件 | 临时练习可用 |

需要注意：配置了 `filename` 后，基础配置默认只写文件，不再同时输出到控制台。后面会使用 Handler 同时输出到两个位置。

### 先创建日志目录

如果你直接写：

```python
filename="logs/app.log"
```

但 `logs` 目录不存在，程序会报 `FileNotFoundError`。

可以先用 `pathlib` 创建目录：

```python
import logging
from pathlib import Path

log_dir = Path("logs")
log_dir.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    filename=log_dir / "app.log",
    filemode="a",
    encoding="utf-8",
    format="%(asctime)s [%(levelname)s] %(message)s"
)

logging.info("日志目录准备完成")
```

## 九、记录异常：不要只写错误文字

先看一个只记录错误文字的例子：

```python
import logging

try:
    result = 10 / 0
except ZeroDivisionError as error:
    logging.error("计算失败：%s", error)
```

输出类似：

```text
ERROR:root:计算失败：division by zero
```

它告诉你发生了除零错误，但没有说明错误发生在哪一行、经过了哪些函数。

在 `except` 中可以使用 `logging.exception()`：

```python
import logging

try:
    result = 10 / 0
except ZeroDivisionError:
    logging.exception("计算失败")
```

输出会包含完整异常堆栈：

```text
ERROR:root:计算失败
Traceback (most recent call last):
  File "logging_demo.py", line 4, in <module>
    result = 10 / 0
ZeroDivisionError: division by zero
```

这对排查问题非常重要。

可以先记住：

| 场景 | 推荐方法 |
| --- | --- |
| 记录普通失败，不在异常处理块中 | `logger.error()` |
| 在 `except` 中记录当前异常和堆栈 | `logger.exception()` |
| 特殊情况下为错误日志附加堆栈 | `logger.error(..., exc_info=True)` |

`logger.exception()` 应该放在异常处理过程中使用。它的默认日志级别是 `ERROR`。

### 记录后继续，还是重新抛出

日志只负责记录，不会自动决定程序如何处理错误。

下面的代码记录错误后不再抛出，程序会继续：

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    logging.exception("计算失败")

print("程序继续执行")
```

如果当前函数无法正确处理错误，通常应该记录后重新抛出：

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    logging.exception("计算失败")
    raise
```

不要为了“程序不报错”而把所有异常都吞掉。否则上层代码可能误以为操作成功。

## 十、正式项目使用 getLogger

直接调用 `logging.info()` 适合入门练习和很小的单文件脚本。

多文件项目更推荐在每个模块中创建自己的 Logger：

```python
import logging

logger = logging.getLogger(__name__)


def save_article(article_id):
    logger.info("准备保存文章，article_id=%s", article_id)
```

`__name__` 是当前模块名。

假设文件结构是：

```text
blog_app/
├─ main.py
└─ services/
   └─ article_service.py
```

在 `article_service.py` 中：

```python
logger = logging.getLogger(__name__)
```

Logger 名称可能是：

```text
services.article_service
```

如果日志格式中包含 `%(name)s`，就能看出日志来自哪个模块：

```text
2026-07-20 20:30:15 [INFO] services.article_service - 准备保存文章，article_id=1001
```

这比所有日志都显示 `root` 更适合项目排查。

### 为什么不要到处调用 basicConfig

项目中通常只在程序入口配置一次日志：

```python
# main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
```

其他模块只获取 Logger 并记录：

```python
# services/article_service.py
import logging

logger = logging.getLogger(__name__)


def import_articles():
    logger.info("开始导入文章")
```

职责可以这样理解：

```text
程序入口：决定日志输出到哪里、最低级别和显示格式
业务模块：只说明发生了什么、属于什么级别
```

这样修改日志策略时，不需要逐个修改业务文件。

## 十一、理解 Logger、Handler 和 Formatter

当 `basicConfig()` 不够用时，需要认识 logging 的三个核心对象：

```text
Logger -> 创建日志记录
Handler -> 决定日志发送到哪里
Formatter -> 决定日志显示成什么样
```

日志流转过程可以表示为：

```text
业务代码
  -> Logger 判断记录器级别
  -> Handler 判断输出级别和目标
  -> Formatter 生成最终文本
  -> 控制台或日志文件
```

### Logger：日志入口

```python
logger = logging.getLogger("blog")
logger.setLevel(logging.DEBUG)
```

它负责接收 `debug()`、`info()`、`error()` 等调用。

### Handler：输出目的地

常见 Handler：

| Handler | 输出位置 |
| --- | --- |
| `logging.StreamHandler` | 控制台等流 |
| `logging.FileHandler` | 普通文件 |
| `RotatingFileHandler` | 按文件大小轮转 |
| `TimedRotatingFileHandler` | 按时间轮转 |

### Formatter：输出格式

```python
formatter = logging.Formatter(
    "%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
```

同一个 Formatter 可以交给多个 Handler 使用。

## 十二、同时输出到控制台和文件

下面是一套适合学习和小型项目的完整配置：

```python
import logging
from pathlib import Path


def setup_logging():
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    file_handler = logging.FileHandler(
        log_dir / "app.log",
        mode="a",
        encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)


setup_logging()
logger = logging.getLogger(__name__)

logger.debug("这条只写入文件")
logger.info("这条会进入控制台和文件")
logger.error("这条也会进入控制台和文件")
```

这里设置了两层级别：

- 根 Logger 是 `DEBUG`，允许所有 `DEBUG` 及以上记录继续处理。
- 控制台 Handler 是 `INFO`，控制台不显示 `DEBUG`。
- 文件 Handler 是 `DEBUG`，文件保留更完整的信息。

最终效果：

| 日志级别 | 控制台 | `app.log` |
| --- | --- | --- |
| `DEBUG` | 不显示 | 记录 |
| `INFO` | 显示 | 记录 |
| `WARNING` 及以上 | 显示 | 记录 |

这是一种常见策略：控制台保持简洁，日志文件保留调试细节。

## 十三、避免日志重复输出

如果 `setup_logging()` 被调用两次，每次都执行 `addHandler()`，同一条日志可能重复两遍。

简单项目可以在添加 Handler 前判断：

```python
import logging


def setup_logging():
    root_logger = logging.getLogger()

    if root_logger.handlers:
        return

    root_logger.setLevel(logging.INFO)

    console_handler = logging.StreamHandler()
    root_logger.addHandler(console_handler)
```

Python 3.8 及以上使用 `basicConfig()` 时，也可以在明确需要重置已有基础配置的场景使用：

```python
logging.basicConfig(
    level=logging.INFO,
    force=True
)
```

但 `force=True` 会先移除并关闭根 Logger 已有的 Handler。它适合你明确掌控程序入口的脚本，不要在可复用库模块中随意使用。

日志重复的常见原因还有：

- 父 Logger 和子 Logger 都添加了 Handler。
- 日志继续向父级传播，同时两边都输出。
- Web 开发服务器的自动重载让初始化代码执行多次。
- 测试框架或第三方库已经配置过 logging。

如果某个独立 Logger 已经有自己的 Handler，并且不希望继续向根 Logger 传播，可以设置：

```python
logger.propagate = False
```

不过不要把它当作遇到重复日志时的固定答案。应该先确认 Handler 加在哪里，再决定是否关闭传播。

## 十四、basicConfig 为什么有时不生效

`basicConfig()` 的设计是：根 Logger 已经有 Handler 时，默认不重复配置。

因此下面这种情况中，第二次配置可能不会按你预期生效：

```python
import logging

logging.warning("这条日志触发了默认配置")

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

logging.debug("这条可能仍然看不到")
```

正确习惯是：

1. 在程序入口尽早配置日志。
2. 配置之前不要先调用日志方法。
3. 业务模块不要擅自调用 `basicConfig()`。
4. 确实需要覆盖现有配置时，再评估 `force=True`。

## 十五、日志轮转：避免一个文件无限变大

如果程序长期运行，普通 `FileHandler` 会一直向同一个文件追加内容，文件可能越来越大。

### 按文件大小轮转

使用 `RotatingFileHandler`：

```python
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

log_dir = Path("logs")
log_dir.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger("blog")
logger.setLevel(logging.INFO)

handler = RotatingFileHandler(
    log_dir / "app.log",
    maxBytes=5 * 1024 * 1024,
    backupCount=5,
    encoding="utf-8"
)

formatter = logging.Formatter(
    "%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)

handler.setFormatter(formatter)
logger.addHandler(handler)

logger.info("应用启动")
```

参数含义：

- `maxBytes=5 * 1024 * 1024`：单个日志文件最大约 5 MB。
- `backupCount=5`：最多保留 5 个历史文件。
- `encoding="utf-8"`：保证中文可读。

轮转后可能出现：

```text
app.log
app.log.1
app.log.2
app.log.3
```

### 按时间轮转

使用 `TimedRotatingFileHandler`：

```python
import logging
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path

log_dir = Path("logs")
log_dir.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger("blog")
logger.setLevel(logging.INFO)

handler = TimedRotatingFileHandler(
    log_dir / "app.log",
    when="midnight",
    interval=1,
    backupCount=14,
    encoding="utf-8"
)

handler.setFormatter(logging.Formatter(
    "%(asctime)s [%(levelname)s] %(name)s - %(message)s"
))

logger.addHandler(handler)
logger.info("应用启动")
```

这表示：

- 每到午夜轮转一次。
- 每次间隔 1 天。
- 保留最近 14 个历史日志文件。

日志轮转不是“永久归档”。超过 `backupCount` 的旧文件会被清理，重要审计日志还需要根据业务要求进行集中存储和备份。

## 十六、多模块项目配置示例

下面把日志配置抽成独立模块。

目录结构：

```text
blog_app/
├─ main.py
├─ logging_config.py
└─ services/
   ├─ __init__.py
   └─ article_service.py
```

`logging_config.py`：

```python
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


def setup_logging():
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)

    root_logger = logging.getLogger()

    if root_logger.handlers:
        return

    root_logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    file_handler = RotatingFileHandler(
        log_dir / "app.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
```

`services/article_service.py`：

```python
import logging

logger = logging.getLogger(__name__)


def publish_article(article_id):
    logger.info("开始发布文章，article_id=%s", article_id)

    if article_id <= 0:
        logger.warning("文章编号无效，article_id=%s", article_id)
        return False

    logger.info("文章发布成功，article_id=%s", article_id)
    return True
```

`main.py`：

```python
import logging

from logging_config import setup_logging
from services.article_service import publish_article


setup_logging()
logger = logging.getLogger(__name__)

logger.info("程序启动")
publish_article(1001)
publish_article(-1)
logger.info("程序结束")
```

运行：

```powershell
python main.py
```

你会同时在控制台和 `logs/app.log` 中看到主要运行过程。

这套结构的重点不是记住每一行，而是理解职责分离：

| 文件 | 职责 |
| --- | --- |
| `logging_config.py` | 统一配置级别、格式、输出目标和轮转 |
| `main.py` | 程序启动时调用一次配置 |
| 业务模块 | 使用 `getLogger(__name__)` 记录业务事件 |

## 十七、实战：给批量文章处理脚本加日志

假设需要批量处理文章标题，并跳过空标题。

创建 `process_articles.py`：

```python
import logging
from pathlib import Path


def setup_logging():
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(
                log_dir / "article_task.log",
                mode="a",
                encoding="utf-8"
            )
        ]
    )


def normalize_title(title):
    return title.strip()


def process_articles(articles):
    logger = logging.getLogger(__name__)
    success_count = 0

    logger.info("开始处理文章，共 %s 条", len(articles))

    for index, article in enumerate(articles, start=1):
        try:
            title = normalize_title(article["title"])

            if not title:
                logger.warning("第 %s 条文章标题为空，已跳过", index)
                continue

            logger.info("正在处理第 %s 条文章：%s", index, title)
            success_count += 1
        except KeyError:
            logger.exception("第 %s 条文章缺少 title 字段", index)

    logger.info(
        "文章处理完成，成功 %s 条，跳过或失败 %s 条",
        success_count,
        len(articles) - success_count
    )


if __name__ == "__main__":
    setup_logging()

    article_list = [
        {"title": " Python logging 入门 "},
        {"title": ""},
        {"name": "缺少标题字段"},
        {"title": "Python csv 模块"}
    ]

    process_articles(article_list)
```

运行：

```powershell
python process_articles.py
```

这个例子同时练习了：

- 使用 `handlers` 同时输出到控制台和文件。
- 使用参数化日志插入变量。
- 用 `INFO` 记录任务开始、进度和完成。
- 用 `WARNING` 记录可以跳过的问题。
- 用 `exception()` 记录意外数据结构和异常堆栈。
- 用汇总日志记录最终处理结果。

## 十八、什么内容应该写进日志

日志应该帮助你回答：“程序在什么时间，对什么对象，执行了什么操作，结果如何？”

适合记录：

- 服务或脚本启动、停止。
- 批量任务开始、完成、耗时和处理数量。
- 重要业务状态变化。
- 外部接口调用失败、重试和最终结果。
- 文件读取、导入、导出和保存结果。
- 可恢复的异常与不可恢复的错误。
- 排查问题需要的对象编号、任务编号、请求编号。

不建议大量记录：

- 没有排查价值的每一步循环细节。
- 完整的大对象、整篇文章正文或整个响应内容。
- 可以从上下文直接判断的重复信息。
- 高频接口中的无意义 `INFO` 日志。

日志太少无法排查，日志太多则会淹没真正有用的信息。应围绕任务边界、关键状态和异常结果记录。

## 十九、日志中不要泄露敏感信息

不要把下面这些内容直接写进日志：

- 密码和确认密码。
- JWT、Session、Cookie、API Key。
- 数据库连接密码。
- 身份证号、银行卡号等敏感个人信息。
- 完整请求头中的 `Authorization`。
- 上传文件中的隐私正文。

错误示例：

```python
logger.info("用户登录，email=%s，password=%s", email, password)
```

正确做法：

```python
logger.info("用户尝试登录，email=%s", email)
```

必要时应脱敏：

```python
phone = "13812345678"
masked_phone = f"{phone[:3]}****{phone[-4:]}"

logger.info("短信发送成功，phone=%s", masked_phone)
```

日志文件可能被开发、运维、监控平台或备份系统读取，所以敏感信息一旦写入日志，影响范围往往比屏幕输出更大。

## 二十、与 JavaScript 日志的简单对照

Python：

```python
import logging

logger = logging.getLogger(__name__)

logger.debug("调试信息")
logger.info("程序启动")
logger.warning("请求较慢")
logger.error("请求失败")
```

JavaScript 最简单的对照：

```js
console.debug('调试信息')
console.log('程序启动')
console.warn('请求较慢')
console.error('请求失败')
```

但是 `console` 更接近基础输出工具。Node.js 正式项目通常会使用 Pino、Winston 等第三方日志库完成日志级别、结构化输出、文件传输和日志轮转。

Python 的优势是标准库已经内置了一套完整日志框架，不安装第三方库也能满足许多脚本和中小型项目。

## 二十一、常见错误与排查方法

### 1. DEBUG 和 INFO 不显示

原因：默认级别是 `WARNING`。

解决：

```python
logging.basicConfig(level=logging.DEBUG)
```

### 2. basicConfig 修改后没有效果

原因：根 Logger 之前已经创建了 Handler。

解决思路：

- 把配置移到程序入口并尽早执行。
- 不要在配置前先记录日志。
- 在自己完全控制的脚本中评估 `force=True`。

### 3. 日志重复两遍或更多

原因：重复添加 Handler，或子 Logger 和父 Logger 同时输出。

解决思路：

- 确认初始化函数是否执行多次。
- 检查 `logger.handlers` 和根 Logger 的 Handler。
- 根据实际结构决定是否设置 `propagate = False`。

### 4. 日志文件没有生成

检查：

- 目标目录是否存在。
- 当前进程是否有写入权限。
- 使用的是相对路径还是绝对路径。
- 当前工作目录是不是你以为的目录。
- 日志级别是否把所有消息过滤掉了。

可以查看当前工作目录：

```python
from pathlib import Path

print(Path.cwd())
```

### 5. 中文日志乱码

文件 Handler 应明确使用 UTF-8：

```python
logging.FileHandler("app.log", encoding="utf-8")
```

源码和配置文件也应保存为 UTF-8 无 BOM。

### 6. 只记录了错误文字，没有异常堆栈

在 `except` 中使用：

```python
logger.exception("操作失败")
```

不要只写：

```python
logger.error("操作失败：%s", error)
```

后者通常看不到具体出错行和调用链。

### 7. 日志文件越来越大

普通 `FileHandler` 不会自动清理旧内容。长期运行的项目应使用：

- `RotatingFileHandler`：按大小切分。
- `TimedRotatingFileHandler`：按时间切分。
- 容器或服务器提供的集中日志采集方案。

## 二十二、进一步认识：dictConfig

项目变大后，可以使用 `logging.config.dictConfig()` 通过字典统一配置。

简单示例：

```python
import logging
from logging.config import dictConfig

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "standard"
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"]
    }
}

dictConfig(LOGGING_CONFIG)

logger = logging.getLogger(__name__)
logger.info("字典日志配置已加载")
```

入门阶段不需要马上背会 `dictConfig`。先掌握 `basicConfig()`、`getLogger(__name__)`、Handler 和 Formatter，再学习配置字典会更容易。

特别注意 `disable_existing_loggers`。示例中设置为 `False`，避免无意中禁用已经存在的第三方 Logger。

## 二十三、练习题

### 练习一：记录计算过程

要求：

1. 把日志最低级别设置为 `DEBUG`。
2. 用 `DEBUG` 记录两个参与计算的数字。
3. 用 `INFO` 记录计算结果。
4. 除数为 0 时，用 `exception()` 记录异常。

参考代码：

```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s"
)


def divide(number_a, number_b):
    logging.debug("准备计算，number_a=%s，number_b=%s", number_a, number_b)

    try:
        result = number_a / number_b
        logging.info("计算成功，result=%s", result)
        return result
    except ZeroDivisionError:
        logging.exception("计算失败，除数不能为 0")
        return None


divide(10, 2)
divide(10, 0)
```

### 练习二：同时写控制台和文件

要求：

1. 创建 `logs` 目录。
2. 控制台显示 `INFO` 及以上日志。
3. 文件保存 `DEBUG` 及以上日志。
4. 文件使用 UTF-8 编码。
5. 日志格式包含时间、级别、模块名和消息。

可以参考“同时输出到控制台和文件”一节，自己重新写一遍，不要直接复制。

### 练习三：给已有脚本替换 print

选择你以前写过的一个 CSV、文件读写或爬虫脚本：

- 保留真正需要展示给用户的 `print()`。
- 把任务开始、处理数量、跳过数据和异常改为日志。
- 思考每条日志应该使用 `INFO`、`WARNING` 还是 `ERROR`。
- 运行后检查控制台和日志文件是否都符合预期。

重点不是机械地把每个 `print()` 替换为 `logger.info()`，而是重新判断这条信息是用户输出，还是程序运行记录。

## 二十四、本篇小结

这一篇需要掌握：

- `logging` 是日志模块，不只是“打印模块”。
- `DEBUG`、`INFO`、`WARNING`、`ERROR`、`CRITICAL` 从低到高表示不同严重程度。
- 配置级别是一道过滤门槛，低于门槛的日志不会输出。
- `basicConfig()` 适合单文件脚本和基础配置，并且应尽早调用。
- 正式项目中，每个模块推荐使用 `logging.getLogger(__name__)`。
- 日志变量推荐使用 `logger.info("id=%s", article_id)` 这种参数化写法。
- 在 `except` 中使用 `logger.exception()` 可以记录完整异常堆栈。
- Logger 负责创建记录，Handler 决定输出位置，Formatter 决定显示格式。
- 控制台和文件可以设置不同的最低级别。
- 日志文件要明确使用 UTF-8，并通过日志轮转防止无限增长。
- 日志初始化通常只做一次，否则可能重复输出。
- 日志中不能记录密码、Token、Cookie 和其他敏感信息。
- 日志应该围绕任务边界、关键状态和异常结果记录，不能越多越好。

参考资料：

- Python logging 官方文档：https://docs.python.org/3/library/logging.html
- Python logging HOWTO：https://docs.python.org/3/howto/logging.html
- Python logging handlers：https://docs.python.org/3/library/logging.handlers.html
