---
title: Python 零基础入门 13：文件读写
slug: python-zero-file-read-write
summary: 介绍如何用 Python 写入文本文件、读取文本文件、追加内容、读写 JSON，以及为什么推荐使用 with 和 UTF-8 编码，全程对照 JavaScript。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 13：文件读写

前面的数据运行结束后就没了。如果想把内容保存下来，可以写入文件。

前端 JS 里，浏览器端不能直接读写本地文件（安全限制），但 Node.js 后端可以：

```js
const fs = require('fs')
fs.writeFileSync('note.txt', '内容', 'utf-8')
```

Python 文件读写更简单，内置 `open()` 函数就够了。

## 一、写入文件

```python
with open("note.txt", "w", encoding="utf-8") as file:
    file.write("这是我的第一条笔记")
```

运行后，当前目录会出现 `note.txt`，内容是：

```text
这是我的第一条笔记
```

JS 对照（Node.js）：

```js
const fs = require('fs')
fs.writeFileSync('note.txt', '这是我的第一条笔记', 'utf-8')
```

### 代码解释

```python
open("note.txt", "w", encoding="utf-8")
```

- `"note.txt"` 是文件名。
- `"w"` 表示写入模式（write）。
- `encoding="utf-8"` 表示使用 UTF-8 编码，中文更不容易乱码。

`with` 可以帮我们在用完文件后自动关闭文件，即使出错了也会关闭。

## 二、为什么用 with

不用 `with` 的写法：

```python
file = open("note.txt", "w", encoding="utf-8")
file.write("内容")
file.close()    # 必须手动关闭！忘了就出问题
```

用 `with` 的写法：

```python
with open("note.txt", "w", encoding="utf-8") as file:
    file.write("内容")
# 离开 with 块后自动关闭，不需要手动 close
```

**企业项目里必须用 `with`，不要手动 `close()`。**

JS 对照（Node.js 也没有 `with` 语法，需要手动关或用 `try-finally`）：

```js
const fs = require('fs')

// 简单方式：一次性读写
fs.writeFileSync('note.txt', '内容', 'utf-8')

// 流式方式需要手动关
const ws = fs.createWriteStream('note.txt')
ws.write('内容')
ws.end()
```

## 三、文件模式

| 模式 | 含义 | 文件不存在时 | 文件已存在时 |
| --- | --- | --- | --- |
| `"r"` | 读取 | 报错 | 从头读 |
| `"w"` | 写入 | 创建新文件 | **覆盖原内容** |
| `"a"` | 追加 | 创建新文件 | 在末尾追加 |
| `"r+"` | 读写 | 报错 | 从头读写 |
| `"w+"` | 写读 | 创建新文件 | 覆盖 |

**高频踩坑：`"w"` 模式会覆盖原文件内容！**

```python
with open("note.txt", "w", encoding="utf-8") as file:
    file.write("新内容")     # 原来文件里的内容全没了
```

如果想在文件末尾追加，用 `"a"`：

```python
with open("note.txt", "a", encoding="utf-8") as file:
    file.write("追加的内容\n")
```

## 四、写入多行内容

```python
with open("note.txt", "w", encoding="utf-8") as file:
    file.write("第一行\n")
    file.write("第二行\n")
    file.write("第三行\n")
```

`\n` 表示换行。

或用 `writelines()`：

```python
lines = ["第一行\n", "第二行\n", "第三行\n"]

with open("note.txt", "w", encoding="utf-8") as file:
    file.writelines(lines)
```

注意 `writelines()` 不会自动加换行符，需要自己在每个字符串末尾加 `\n`。

## 五、读取文件

### 读取全部内容

```python
with open("note.txt", "r", encoding="utf-8") as file:
    content = file.read()

print(content)
```

### 按行读取

```python
with open("note.txt", "r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())
```

`strip()` 用来去掉每行末尾的换行和多余空白。

### 读取所有行为列表

```python
with open("note.txt", "r", encoding="utf-8") as file:
    lines = file.readlines()

print(lines)    # ['第一行\n', '第二行\n', '第三行\n']
```

### 读取方法对照

| 方法 | 返回值 | 适合场景 |
| --- | --- | --- |
| `file.read()` | 整个文件为字符串 | 小文件 |
| `file.readline()` | 一行字符串 | 逐行控制 |
| `file.readlines()` | 所有行为列表 | 需要按行处理 |
| `for line in file:` | 逐行迭代（最推荐） | 大文件、通用 |

JS 对照（Node.js）：

```js
const fs = require('fs')

// 读取全部
const content = fs.readFileSync('note.txt', 'utf-8')

// 按行读取
const lines = fs.readFileSync('note.txt', 'utf-8').split('\n')
```

## 六、读写 JSON

JSON 是企业项目中最常用的数据格式，Python 内置 `json` 模块。

### 写入 JSON

```python
import json

article = {
    "title": "Python 入门",
    "tags": ["Python", "入门"],
    "view_count": 128
}

with open("article.json", "w", encoding="utf-8") as file:
    json.dump(article, file, ensure_ascii=False, indent=2)
```

- `ensure_ascii=False`：允许直接写入中文，不转义成 `\uXXXX`。
- `indent=2`：缩进 2 空格，方便阅读。

生成的 `article.json`：

```json
{
  "title": "Python 入门",
  "tags": [
    "Python",
    "入门"
  ],
  "view_count": 128
}
```

### 读取 JSON

```python
import json

with open("article.json", "r", encoding="utf-8") as file:
    article = json.load(file)

print(article["title"])     # Python 入门
print(article["tags"])      # ['Python', '入门']
```

### JSON 字符串转换

```python
import json

# 字典 → JSON 字符串
data = {"name": "小明", "age": 18}
json_str = json.dumps(data, ensure_ascii=False)
print(json_str)   # {"name": "小明", "age": 18}

# JSON 字符串 → 字典
parsed = json.loads(json_str)
print(parsed["name"])   # 小明
```

JS 对照：

```js
const data = { name: '小明', age: 18 }

// 对象 → JSON 字符串
const jsonStr = JSON.stringify(data)
console.log(jsonStr)   // {"name":"小明","age":18}

// JSON 字符串 → 对象
const parsed = JSON.parse(jsonStr)
console.log(parsed.name)   // 小明
```

### JSON 对照表

| 功能 | Python | JS |
| --- | --- | --- |
| 对象 → JSON 字符串 | `json.dumps(obj)` | `JSON.stringify(obj)` |
| JSON 字符串 → 对象 | `json.loads(str)` | `JSON.parse(str)` |
| 写入 JSON 文件 | `json.dump(obj, file)` | `fs.writeFileSync + JSON.stringify` |
| 读取 JSON 文件 | `json.load(file)` | `JSON.parse(fs.readFileSync)` |
| 中文处理 | `ensure_ascii=False` | 默认支持 |
| 缩进格式化 | `indent=2` | `JSON.stringify(obj, null, 2)` |

**注意命名差异：Python 用 `dumps` / `loads`（加 s 表示 string），JS 用 `stringify` / `parse`。**

## 七、文件路径

### 相对路径和绝对路径

```python
# 相对路径（相对于当前运行目录）
with open("data/note.txt", "r", encoding="utf-8") as file:
    content = file.read()

# 绝对路径
with open("C:/code/python/data/note.txt", "r", encoding="utf-8") as file:
    content = file.read()
```

Windows 路径注意用 `/` 或 `\\`：

```python
# 推荐
path = "C:/code/python/data/note.txt"

# 也可以
path = r"C:\code\python\data\note.txt"

# 不推荐（\n 会被当成换行）
path = "C:\code\python\data\note.txt"
```

### 用 pathlib 处理路径（推荐）

```python
from pathlib import Path

# 当前目录
current = Path(".")
print(current.resolve())   # 绝对路径

# 拼接路径
data_dir = Path("data")
file_path = data_dir / "note.txt"   # 用 / 拼接，不是 +

print(file_path)          # data/note.txt
print(file_path.exists()) # 是否存在
print(file_path.is_file()) # 是否是文件

# 读取
content = file_path.read_text(encoding="utf-8")

# 写入
file_path.write_text("新内容", encoding="utf-8")
```

`pathlib` 是 Python 3.4+ 的推荐方式，比手动拼路径更安全。

JS 对照（Node.js）：

```js
const path = require('path')
const fs = require('fs')

const filePath = path.join('data', 'note.txt')
const exists = fs.existsSync(filePath)
const content = fs.readFileSync(filePath, 'utf-8')
```

## 八、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS (Node.js) | 怎么记 |
| --- | --- | --- | --- |
| 读取文件 | `open()` + `with` | `fs.readFileSync()` | Python 用 with |
| 写入文件 | `file.write()` | `fs.writeFileSync()` | Python 用方法 |
| 自动关闭 | `with` 自动关 | 不需要手动关（sync） | Python 用 with |
| 读取模式 | `"r"` | 默认就是读 | Python 要指定模式 |
| 写入模式 | `"w"` 覆盖，`"a"` 追加 | 默认覆盖 | Python 有专门追加模式 |
| JSON 序列化 | `json.dumps()` | `JSON.stringify()` | Python 用 dumps |
| JSON 反序列化 | `json.loads()` | `JSON.parse()` | Python 用 loads |
| 中文 JSON | `ensure_ascii=False` | 默认支持 | Python 要手动关 |
| 路径拼接 | `pathlib` 的 `/` 运算符 | `path.join()` | Python 用除号拼路径 |

## 九、企业项目实战：配置文件读写

```python
import json
from pathlib import Path

# 默认配置
default_config = {
    "site_name": "我的知识库",
    "page_size": 10,
    "allow_register": True,
    "default_role": "user"
}

config_path = Path("config.json")

# 如果配置文件存在，读取；否则用默认值
if config_path.exists():
    with open(config_path, "r", encoding="utf-8") as file:
        config = json.load(file)
    print("读取已有配置")
else:
    config = default_config
    # 保存默认配置
    with open(config_path, "w", encoding="utf-8") as file:
        json.dump(config, file, ensure_ascii=False, indent=2)
    print("创建默认配置")

print(f"站点名称：{config['site_name']}")
print(f"每页条数：{config['page_size']}")
```

## 十、本篇练习

练习一：简单日记。

```python
today = input("请输入今天的日期：")
content = input("请输入今天的学习内容：")

with open("diary.txt", "a", encoding="utf-8") as file:
    file.write(f"{today}：{content}\n")

print("日记已保存")
```

练习二：读取并统计文件行数。

```python
from pathlib import Path

file_path = Path("diary.txt")

if file_path.exists():
    with open(file_path, "r", encoding="utf-8") as file:
        lines = file.readlines()

    print(f"日记共 {len(lines)} 行")
    for line in lines:
        print(f"  {line.strip()}")
else:
    print("日记文件不存在")
```

练习三：保存文章列表到 JSON。

```python
import json

articles = [
    {"title": "Python 入门", "status": "draft"},
    {"title": "JS 基础", "status": "published"},
    {"title": "Vue 实战", "status": "draft"}
]

with open("articles.json", "w", encoding="utf-8") as file:
    json.dump(articles, file, ensure_ascii=False, indent=2)

print(f"保存了 {len(articles)} 篇文章")

# 读取验证
with open("articles.json", "r", encoding="utf-8") as file:
    loaded = json.load(file)

print("验证：")
for article in loaded:
    print(f"  {article['title']} ({article['status']})")
```

## 本篇小结

1. Python 用 `open()` 打开文件，JS (Node.js) 用 `fs` 模块。
2. 推荐用 `with open(...) as file:` 自动关闭文件。
3. `"r"` 读，`"w"` 写（覆盖），`"a"` 追加。
4. 始终指定 `encoding="utf-8"` 避免中文乱码。
5. `file.read()` 读全部，`for line in file` 逐行读（推荐）。
6. JSON 读写用 `json.dump()` / `json.load()`。
7. JSON 字符串转换用 `json.dumps()` / `json.loads()`。
8. 中文 JSON 需要 `ensure_ascii=False`。
9. 推荐用 `pathlib` 处理路径，`Path("a") / "b"` 比 `"a/b"` 更安全。
