---
title: Python 零基础入门 20：常用标准库
slug: python-zero-standard-library
summary: 介绍 datetime、pathlib、json、random、os、logging、csv 等常用标准库，通过贴近日常工作的例子说明，全程对照 JavaScript。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 20：常用标准库

标准库是 Python 自带的工具箱。不需要额外安装，直接 `import` 就能用。

前端 JS 里你也经常用内置工具：`Date`、`JSON`、`Math`、`console`。Python 标准库更丰富，覆盖文件、网络、日期、日志等各个方面。

## 一、datetime：处理日期时间

Python：

```python
from datetime import datetime

# 当前时间
now = datetime.now()
print(now)   # 2026-06-22 10:30:15.123456

# 格式化为字符串
text = now.strftime("%Y-%m-%d %H:%M:%S")
print(text)  # 2026-06-22 10:30:15

# 从字符串解析
dt = datetime.strptime("2026-06-22", "%Y-%m-%d")
print(dt)    # 2026-06-22 00:00:00
```

常见格式符号：

| 符号 | 含义 | 示例 |
| --- | --- | --- |
| `%Y` | 四位年 | `2026` |
| `%m` | 两位月 | `06` |
| `%d` | 两位日 | `22` |
| `%H` | 24小时 | `14` |
| `%M` | 分钟 | `30` |
| `%S` | 秒 | `15` |

JS 对照：

```js
const now = new Date()

// 格式化（JS 没有内置 strftime，需要手动或用 dayjs）
const text = now.toISOString().slice(0, 19).replace('T', ' ')

// 解析
const dt = new Date('2026-06-22')
```

**Python 的 datetime 格式化比 JS 原生 Date 强大得多。** JS 通常需要 dayjs / date-fns 等库。

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 当前时间 | `datetime.now()` | `new Date()` |
| 格式化 | `dt.strftime("%Y-%m-%d")` | `dayjs(dt).format('YYYY-MM-DD')` |
| 解析 | `datetime.strptime(str, fmt)` | `dayjs(str)` |
| 日期差 | `(dt2 - dt1).days` | `dayjs(dt2).diff(dt1, 'day')` |

### 日期计算

```python
from datetime import datetime, timedelta

now = datetime.now()

# 明天
tomorrow = now + timedelta(days=1)

# 一周后
next_week = now + timedelta(weeks=1)

# 30 天前
month_ago = now - timedelta(days=30)

print(f"明天：{tomorrow.strftime('%Y-%m-%d')}")
print(f"一周后：{next_week.strftime('%Y-%m-%d')}")
print(f"30天前：{month_ago.strftime('%Y-%m-%d')}")
```

## 二、pathlib：处理文件路径

`pathlib` 比直接拼接字符串更适合处理路径。

```python
from pathlib import Path

# 拼接路径
file_path = Path("data") / "note.txt"
print(file_path)   # data\note.txt

# 判断是否存在
print(file_path.exists())

# 判断是否是文件
print(file_path.is_file())

# 创建文件夹
folder = Path("output")
folder.mkdir(exist_ok=True)   # 已存在不报错

# 读取文件内容
# content = file_path.read_text(encoding="utf-8")

# 写入文件
# file_path.write_text("内容", encoding="utf-8")
```

JS 对照（Node.js）：

```js
const path = require('path')
const fs = require('fs')

const filePath = path.join('data', 'note.txt')
console.log(filePath)  // data/note.txt

console.log(fs.existsSync(filePath))

fs.mkdirSync('output', { recursive: true })
```

对照：

| 功能 | Python | JS (Node.js) |
| --- | --- | --- |
| 拼接路径 | `Path("a") / "b"` | `path.join("a", "b")` |
| 是否存在 | `path.exists()` | `fs.existsSync(path)` |
| 创建目录 | `path.mkdir(exist_ok=True)` | `fs.mkdirSync(dir, { recursive: true })` |
| 读取文件 | `path.read_text()` | `fs.readFileSync(path, 'utf-8')` |
| 写入文件 | `path.write_text()` | `fs.writeFileSync(path, content)` |

Python `pathlib` 的 `/` 运算符拼接路径非常方便，比 JS 的 `path.join()` 更直观。

## 三、json：处理 JSON 数据

```python
import json

# 字典 → JSON 字符串
user = {"name": "小明", "age": 18}
text = json.dumps(user, ensure_ascii=False)
print(text)   # {"name": "小明", "age": 18}

# JSON 字符串 → 字典
parsed = json.loads(text)
print(parsed["name"])   # 小明

# 写入 JSON 文件
with open("user.json", "w", encoding="utf-8") as file:
    json.dump(user, file, ensure_ascii=False, indent=2)

# 读取 JSON 文件
with open("user.json", "r", encoding="utf-8") as file:
    loaded = json.load(file)
```

JS 对照：

```js
const user = { name: '小明', age: 18 }

// 对象 → JSON 字符串
const text = JSON.stringify(user)
console.log(text)   // {"name":"小明","age":18}

// JSON 字符串 → 对象
const parsed = JSON.parse(text)
console.log(parsed.name)   // 小明

// 格式化
const pretty = JSON.stringify(user, null, 2)
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 序列化 | `json.dumps(obj)` | `JSON.stringify(obj)` |
| 反序列化 | `json.loads(str)` | `JSON.parse(str)` |
| 文件序列化 | `json.dump(obj, file)` | 无（手动 write） |
| 文件反序列化 | `json.load(file)` | 无（手动 read + parse） |
| 格式化缩进 | `indent=2` | `JSON.stringify(obj, null, 2)` |
| 中文处理 | `ensure_ascii=False` | 默认支持 |

## 四、random：生成随机数

```python
import random

# 随机整数
print(random.randint(1, 100))     # 1-100 之间的随机整数

# 随机小数
print(random.random())            # 0.0-1.0 之间的随机小数

# 从列表随机选一个
names = ["小明", "小红", "小刚"]
print(random.choice(names))

# 打乱列表顺序
nums = [1, 2, 3, 4, 5]
random.shuffle(nums)
print(nums)    # [3, 1, 5, 2, 4]（每次不同）

# 随机选多个（不重复）
print(random.sample(names, 2))   # ['小红', '小明']
```

JS 对照：

```js
// 随机小数
console.log(Math.random())   // 0.0-1.0

// 随机整数（需要自己写）
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
console.log(randInt(1, 100))

// 从数组随机选一个
const names = ['小明', '小红', '小刚']
console.log(names[Math.floor(Math.random() * names.length)])

// 打乱（Fisher-Yates）
const shuffled = [...names].sort(() => Math.random() - 0.5)
```

Python 的 `random` 模块比 JS 的 `Math.random()` 功能丰富得多。

## 五、os：读取环境变量

```python
import os

# 读取环境变量
app_env = os.getenv("APP_ENV", "development")
db_url = os.getenv("DATABASE_URL", "localhost:27017")
secret = os.getenv("JWT_SECRET")

print(f"环境：{app_env}")
print(f"数据库：{db_url}")

if secret is None:
    print("警告：未设置 JWT_SECRET")
```

JS 对照（Node.js）：

```js
const appEnv = process.env.APP_ENV || 'development'
const dbUrl = process.env.DATABASE_URL || 'localhost:27017'
const secret = process.env.JWT_SECRET

console.log(`环境：${appEnv}`)
console.log(`数据库：${dbUrl}`)

if (!secret) {
  console.log('警告：未设置 JWT_SECRET')
}
```

对照：

| 功能 | Python | JS (Node.js) |
| --- | --- | --- |
| 读环境变量 | `os.getenv("KEY", default)` | `process.env.KEY \|\| default` |
| 设置环境变量 | `os.environ["KEY"] = "val"` | `process.env.KEY = 'val'` |

## 六、logging：记录程序运行日志

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

logging.info("程序开始运行")
logging.warning("这是一个警告")
logging.error("这里发生了错误")
```

输出类似：

```text
2026-06-22 10:30:15,123 [INFO] 程序开始运行
2026-06-22 10:30:15,124 [WARNING] 这是一个警告
2026-06-22 10:30:15,125 [ERROR] 这里发生了错误
```

日志级别（从低到高）：

| 级别 | 用途 |
| --- | --- |
| `DEBUG` | 调试信息 |
| `INFO` | 普通运行信息 |
| `WARNING` | 需要注意，但程序还能继续 |
| `ERROR` | 出现错误，需要排查 |
| `CRITICAL` | 严重错误，程序可能无法继续 |

JS 对照：

```js
// 简单方式
console.log('程序开始运行')       // ≈ info
console.warn('这是一个警告')     // ≈ warning
console.error('这里发生了错误')  // ≈ error

// 企业方式：winston、pino 等日志库
const winston = require('winston')
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

logger.info('程序开始运行')
logger.warn('这是一个警告')
logger.error('这里发生了错误')
```

Python 内置 `logging` 就够用，JS 需要第三方库。

## 七、标准库对照总表

| Python 标准库 | 用途 | JS 对照 |
| --- | --- | --- |
| `datetime` | 日期时间 | `Date`、`dayjs` |
| `pathlib` | 路径处理 | `path` 模块 |
| `json` | JSON 读写 | `JSON` + `fs` |
| `random` | 随机数 | `Math.random()` |
| `os` | 系统/环境变量 | `process.env` |
| `logging` | 日志 | `console` / `winston` |
| `csv` | CSV 读写 | `csv-parse` |
| `re` | 正则表达式 | `RegExp` |
| `math` | 数学函数 | `Math` |
| `collections` | 高级数据结构 | 无内置 |
| `itertools` | 迭代器工具 | 无内置 |

## 八、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 日期格式化 | `strftime("%Y-%m-%d")` | `dayjs().format('YYYY-MM-DD')` | Python 用 %，JS 用字母 |
| 路径拼接 | `Path("a") / "b"` | `path.join("a", "b")` | Python 用除号 |
| JSON 序列化 | `json.dumps()` | `JSON.stringify()` | Python 用 dumps |
| JSON 反序列化 | `json.loads()` | `JSON.parse()` | Python 用 loads |
| 随机整数 | `random.randint(1, 10)` | 手写函数 | Python 内置 |
| 环境变量 | `os.getenv("KEY")` | `process.env.KEY` | Python 函数，JS 属性 |
| 日志 | `logging` 内置 | 需要 winston | Python 内置更方便 |
| 中文 JSON | `ensure_ascii=False` | 默认支持 | Python 要手动关 |

## 九、本篇练习

练习一：生成带时间戳的文件名。

```python
from datetime import datetime
from pathlib import Path

now = datetime.now()
timestamp = now.strftime("%Y%m%d_%H%M%S")
filename = f"report_{timestamp}.json"

output = Path("output")
output.mkdir(exist_ok=True)

file_path = output / filename
file_path.write_text('{"status": "ok"}', encoding="utf-8")

print(f"文件已保存：{file_path}")
```

练习二：随机生成验证码。

```python
import random
import string

def generate_code(length=6):
    chars = string.digits
    return "".join(random.choice(chars) for _ in range(length))

code = generate_code()
print(f"验证码：{code}")
```

## 本篇小结

1. Python 标准库比 JS 内置工具更丰富，很多 JS 需要第三方库的功能，Python 内置就有。
2. `datetime` 格式化用 `strftime()`，JS 需要 dayjs 等库。
3. `pathlib` 用 `/` 拼接路径，比 JS `path.join()` 更直观。
4. `json.dumps()` / `json.loads()` 对应 JS `JSON.stringify()` / `JSON.parse()`。
5. `random` 模块比 JS `Math.random()` 功能丰富得多。
6. `os.getenv()` 读环境变量，JS 用 `process.env`。
7. `logging` 内置日志，JS 需要 winston 等第三方库。
8. Python JSON 中文需要 `ensure_ascii=False`，JS 默认支持。
