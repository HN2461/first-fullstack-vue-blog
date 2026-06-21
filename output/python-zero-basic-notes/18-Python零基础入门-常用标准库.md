---
title: Python 零基础入门 18：常用标准库
slug: python-zero-standard-library
summary: 介绍 datetime、pathlib、json、random、os 等常用标准库，通过贴近日常工作的例子说明如何处理日期、路径、JSON 和文件目录。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 18：常用标准库

标准库是 Python 自带的工具箱。

你不需要额外安装，就可以直接使用。

这一篇学习几个企业项目和日常脚本里都很常见的标准库。

## datetime：处理日期时间

```python
from datetime import datetime

now = datetime.now()
print(now)
```

运行结果类似：

```text
2026-06-20 21:30:15.123456
```

如果想格式化成更好看的字符串：

```python
from datetime import datetime

now = datetime.now()
text = now.strftime("%Y-%m-%d %H:%M:%S")

print(text)
```

运行结果类似：

```text
2026-06-20 21:30:15
```

常见格式：

- `%Y` 年
- `%m` 月
- `%d` 日
- `%H` 小时
- `%M` 分钟
- `%S` 秒

## pathlib：处理文件路径

`pathlib` 比直接拼接字符串更适合处理路径。

```python
from pathlib import Path

file_path = Path("data") / "note.txt"
print(file_path)
```

运行结果：

```text
data\note.txt
```

在不同系统中，`pathlib` 会更合理地处理路径分隔符。

## 判断文件是否存在

```python
from pathlib import Path

file_path = Path("note.txt")

if file_path.exists():
    print("文件存在")
else:
    print("文件不存在")
```

## 创建文件夹

```python
from pathlib import Path

folder = Path("output")
folder.mkdir(exist_ok=True)

print("文件夹已准备好")
```

`exist_ok=True` 的意思是：如果文件夹已经存在，也不要报错。

## json：处理 JSON 数据

JSON 是一种常见数据格式，接口返回、配置文件、前后端交互里经常见到。

Python 字典转 JSON 字符串：

```python
import json

user = {
    "name": "小明",
    "age": 18
}

text = json.dumps(user, ensure_ascii=False)
print(text)
```

运行结果：

```text
{"name": "小明", "age": 18}
```

`ensure_ascii=False` 可以让中文正常显示，而不是转成一堆编码。

## JSON 字符串转字典

```python
import json

text = '{"name": "小明", "age": 18}'
user = json.loads(text)

print(user["name"])
```

运行结果：

```text
小明
```

## random：生成随机数

```python
import random

number = random.randint(1, 100)
print(number)
```

运行结果可能是：

```text
42
```

每次运行可能不同。

从列表里随机选一个：

```python
import random

names = ["小明", "小红", "小刚"]
name = random.choice(names)

print(name)
```

## os：读取环境变量

企业项目里，数据库密码、接口密钥一般不会直接写进代码，而是放在环境变量里。

读取环境变量：

```python
import os

app_env = os.getenv("APP_ENV", "development")
print(app_env)
```

如果没有设置 `APP_ENV`，就使用默认值 `"development"`。

## logging：记录程序运行日志

工作里排查问题时，不能只靠 `print`。

更常见的做法是写日志。

```python
import logging

logging.basicConfig(level=logging.INFO)

logging.info("程序开始运行")
logging.warning("这是一个警告")
logging.error("这里发生了错误")
```

运行结果类似：

```text
INFO:root:程序开始运行
WARNING:root:这是一个警告
ERROR:root:这里发生了错误
```

日志的好处是可以区分信息级别：

- `info`：普通运行信息
- `warning`：需要注意，但程序还能继续
- `error`：出现错误，需要排查

企业项目里，日志通常会写入文件或日志系统，方便线上排查问题。

## csv：读写表格数据

很多工作数据会以 CSV 文件出现。

CSV 可以理解成一种简单表格文本。

写入 CSV：

```python
import csv

rows = [
    ["name", "score"],
    ["小明", 90],
    ["小红", 85]
]

with open("scores.csv", "w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    writer.writerows(rows)
```

读取 CSV：

```python
import csv

with open("scores.csv", "r", encoding="utf-8") as file:
    reader = csv.reader(file)

    for row in reader:
        print(row)
```

运行结果：

```text
['name', 'score']
['小明', '90']
['小红', '85']
```

注意，CSV 读出来的内容默认是字符串。

## 综合练习：保存一份 JSON 文件

```python
import json
from datetime import datetime
from pathlib import Path

output_dir = Path("output")
output_dir.mkdir(exist_ok=True)

record = {
    "title": "Python 学习记录",
    "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "finished": False
}

file_path = output_dir / "record.json"

with open(file_path, "w", encoding="utf-8") as file:
    json.dump(record, file, ensure_ascii=False, indent=2)

print(f"已保存到 {file_path}")
```

生成的文件内容类似：

```json
{
  "title": "Python 学习记录",
  "createdAt": "2026-06-20 21:30:15",
  "finished": false
}
```

## 面试怎么说

如果面试官问：“你用过哪些 Python 标准库？”

可以这样回答：

```text
我用过 datetime 处理时间格式化，用 pathlib 处理文件路径和目录创建，用 json 做字典和 JSON 字符串之间的转换，也用过 random 做简单随机选择。
另外了解 logging 可以记录运行日志，csv 可以处理简单表格数据。
我理解标准库是 Python 自带能力，优先使用标准库可以减少不必要的第三方依赖。
```

## 本篇小结

- 标准库是 Python 自带工具，不需要额外安装。
- `datetime` 用于日期时间。
- `pathlib` 用于路径和文件夹处理。
- `json` 用于 JSON 数据转换。
- `random` 用于随机数和随机选择。
- `os.getenv()` 常用于读取环境变量。
- `logging` 用于记录程序运行日志。
- `csv` 用于读写简单表格数据。
