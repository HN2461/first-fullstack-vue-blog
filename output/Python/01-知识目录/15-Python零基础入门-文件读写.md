---
title: Python 零基础入门 15：文件读写
slug: python-zero-file-read-write
summary: 介绍如何用 Python 读写文本与二进制文件、追加内容、读写 JSON、CSV，使用 with、pathlib、shutil、tempfile 管理文件与路径，处理编码与大文件，全程对照 JavaScript。
category: Python入门
tags:
  - Python
  - 零基础入门
status: draft
cover:
---

# Python 零基础入门 15：文件读写

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

### 同时打开多个文件

Python 可以在一个 `with` 里同时打开多个文件，用逗号分隔：

```python
with open("input.txt", "r", encoding="utf-8") as src, \
     open("output.txt", "w", encoding="utf-8") as dst:
    for line in src:
        dst.write(line.upper())
```

更好的写法是用括号换行（避免反斜杠）：

```python
from pathlib import Path

src_path = Path("input.txt")
dst_path = Path("output.txt")

with src_path.open("r", encoding="utf-8") as src, \
     dst_path.open("w", encoding="utf-8") as dst:
    content = src.read()
    dst.write(content.upper())
```

JS 对照（Node.js 没有 `with`，需要手动管理）：

```js
const fs = require('fs')
const content = fs.readFileSync('input.txt', 'utf-8')
fs.writeFileSync('output.txt', content.toUpperCase(), 'utf-8')
```

## 三、文件模式

| 模式 | 含义 | 文件不存在时 | 文件已存在时 |
| --- | --- | --- | --- |
| `"r"` | 读取 | 报错 | 从头读 |
| `"w"` | 写入 | 创建新文件 | **覆盖原内容** |
| `"a"` | 追加 | 创建新文件 | 在末尾追加 |
| `"r+"` | 读写 | 报错 | 从头读写 |
| `"w+"` | 写读 | 创建新文件 | 覆盖 |
| `"a+"` | 追加读 | 创建新文件 | 末尾追加，可读 |
| `"x"` | 独占创建 | 创建新文件 | **已存在则报错** |

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

### 二进制模式

在模式后加 `"b"` 表示二进制模式：`"rb"`、`"wb"`、`"ab"`。二进制模式适用于图片、音频、视频、压缩包等非文本文件。

```python
# 复制一张图片
with open("logo.png", "rb") as src, open("logo_copy.png", "wb") as dst:
    dst.write(src.read())
```

二进制模式的关键区别：

1. **不能指定 `encoding`**——二进制模式读写的是原始字节（`bytes`），不做字符解码。
2. `read()` 返回 `bytes` 而不是 `str`。
3. `write()` 必须传入 `bytes`（如 `b"hello"`），不能传 `str`。

```python
# 写入二进制数据
data = b"\x48\x65\x6c\x6c\x6f"   # Hello 的字节
with open("data.bin", "wb") as f:
    f.write(data)

# 读取
with open("data.bin", "rb") as f:
    content = f.read()
    print(content)        # b'Hello'
    print(type(content))  # <class 'bytes'>
```

JS 对照（Node.js 的 Buffer）：

```js
const fs = require('fs')

// 读取为 Buffer
const buf = fs.readFileSync('logo.png')
console.log(Buffer.isBuffer(buf)) // true

// 写入 Buffer
fs.writeFileSync('copy.png', buf)
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

### 换行符的坑：Windows 与 Linux

不同操作系统的换行符不一样：

| 系统 | 换行符 | 说明 |
| --- | --- | --- |
| Linux / macOS | `\n` | LF |
| Windows | `\r\n` | CRLF |

Python 的文本模式默认会做转换：在 Windows 上写 `\n` 会自动变成 `\r\n`，读取时再转回来。如果你想要完全控制（不转换），用 `newline=""` 参数：

```python
# 不做换行符转换，原样写入
with open("note.txt", "w", encoding="utf-8", newline="") as f:
    f.write("第一行\n第二行\n")
```

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
| `file.read(n)` | 前 n 个字符 | 分段读取 |
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

### 文件指针：tell 和 seek

文件对象内部有一个「指针」，记录当前读到的位置。

```python
with open("note.txt", "r", encoding="utf-8") as f:
    print(f.tell())       # 0，在开头
    print(f.read(3))      # 读 3 个字符
    print(f.tell())       # 当前位置

    f.seek(0)             # 回到开头
    print(f.read(3))      # 再读 3 个字符
```

- `tell()`：返回当前指针位置。
- `seek(n)`：把指针移动到第 n 个字节。

注意 `seek` 是按字节移动的，中文等多字节字符要小心。

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

### JSON 序列化的限制

Python 的 `json` 只能序列化基本类型（dict、list、str、int、float、bool、None）。遇到日期、自定义对象会报错：

```python
import json
from datetime import datetime

data = {"time": datetime.now()}
json.dumps(data)   # TypeError: Object of type datetime is not JSON serializable
```

需要先转换成字符串或用 `default` 参数：

```python
def to_serializable(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"不可序列化: {type(obj)}")

json.dumps(data, default=to_serializable, ensure_ascii=False)
```

## 七、读写 CSV

CSV（逗号分隔值）是表格数据的通用格式，Python 内置 `csv` 模块。

### 写入 CSV

```python
import csv

articles = [
    ["标题", "状态", "浏览量"],
    ["Python 入门", "published", 128],
    ["JS 基础", "draft", 0]
]

with open("articles.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(articles)
```

注意两点：

1. `encoding="utf-8-sig"`：带 BOM 的 UTF-8，让 Excel 正确识别中文。
2. `newline=""`：避免 Windows 上出现空行。

### 读取 CSV

```python
import csv

with open("articles.csv", "r", encoding="utf-8-sig", newline="") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)
```

输出：

```text
['标题', '状态', '浏览量']
['Python 入门', 'published', '128']
['JS 基础', 'draft', '0']
```

### 用 DictReader / DictWriter（推荐）

```python
import csv

# 写入
articles = [
    {"title": "Python 入门", "status": "published"},
    {"title": "JS 基础", "status": "draft"}
]

with open("articles.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["title", "status"])
    writer.writeheader()
    writer.writerows(articles)

# 读取
with open("articles.csv", "r", encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["title"], row["status"])
```

`DictReader` 把每行读成字典，用表头当 key，比按索引取值更安全。

## 八、文件路径

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

### pathlib 常用方法大全

```python
from pathlib import Path

p = Path("data/notes/python.txt")

# --- 路径组成部分 ---
print(p.name)      # python.txt  文件名（含后缀）
print(p.stem)      # python       文件名（不含后缀）
print(p.suffix)    # .txt         后缀名
print(p.suffixes)  # ['.txt']     所有后缀
print(p.parent)    # data/notes   父目录
print(p.parts)     # ('data', 'notes', 'python.txt')

# --- 判断 ---
print(p.exists())    # 是否存在
print(p.is_file())   # 是否是文件
print(p.is_dir())    # 是否是目录

# --- 读写（一行搞定） ---
# p.read_text(encoding="utf-8")        # 读文本
# p.write_text("内容", encoding="utf-8")  # 写文本
# p.read_bytes()                       # 读二进制
# p.write_bytes(b"内容")               # 写二进制

# --- 创建 / 删除 ---
# p.parent.mkdir(parents=True, exist_ok=True)  # 创建目录
# p.unlink()        # 删除文件
# p.rename("新名")  # 重命名

# --- 遍历目录 ---
data = Path("data")
for child in data.iterdir():       # 当前目录下所有内容
    print(child)

for py_file in data.glob("*.py"):  # 当前目录下的 .py 文件
    print(py_file)

for py_file in data.rglob("*.py"): # 递归所有子目录的 .py 文件
    print(py_file)
```

**`glob` 只查当前层，`rglob` 递归查所有子目录**（`r` = recursive）。

JS 对照（Node.js）：

```js
const path = require('path')
const fs = require('fs')

const filePath = path.join('data', 'note.txt')
const exists = fs.existsSync(filePath)
const content = fs.readFileSync(filePath, 'utf-8')

// 路径组成部分
path.basename(filePath)   // note.txt
path.extname(filePath)    // .txt
path.dirname(filePath)    // data
```

## 九、文件与目录操作：shutil 和 os

Python 处理文件不止 `open()`，还有两个常用模块：

- `os`：底层文件系统操作（创建目录、删除文件、重命名）。
- `shutil`：高级文件操作（复制、移动、删除目录树）。

### os 模块

```python
import os

# 创建目录（可递归）
os.makedirs("data/notes/2026", exist_ok=True)

# 删除文件
os.remove("old.txt")

# 重命名 / 移动（同盘）
os.rename("old.txt", "new.txt")

# 列出目录内容
print(os.listdir("data"))

# 获取文件大小（字节）
size = os.path.getsize("note.txt")

# 当前工作目录
print(os.getcwd())

# 切换工作目录
os.chdir("data")
```

`exist_ok=True` 很重要：目录已存在时不报错。

### shutil 模块

```python
import shutil

# 复制文件（保留内容，不保留元数据）
shutil.copy("src.txt", "dst.txt")

# 复制文件（保留修改时间、权限等元数据，推荐）
shutil.copy2("src.txt", "dst.txt")

# 复制整个目录树
shutil.copytree("project", "project_backup")

# 删除整个目录树（包括非空目录）
shutil.rmtree("project_backup")

# 移动文件或目录（跨磁盘也能用）
shutil.move("dst.txt", "archive/dst.txt")
```

**`shutil.move` 比 `os.rename` 更稳**：`os.rename` 跨磁盘会报错，`shutil.move` 会自动降级为「复制 + 删除」。

### 三种删除方式对照

| 方法 | 作用 | 适用场景 |
| --- | --- | --- |
| `os.remove("file.txt")` | 删除文件 | 删单个文件 |
| `os.rmdir("empty_dir")` | 删除空目录 | 目录必须为空 |
| `shutil.rmtree("dir")` | 删除整个目录树 | 删非空目录（谨慎！） |

JS 对照（Node.js）：

```js
const fs = require('fs')

fs.mkdirSync('data/notes/2026', { recursive: true })  // 创建目录
fs.unlinkSync('old.txt')        // 删除文件
fs.renameSync('old.txt', 'new.txt')  // 重命名
fs.rmSync('project_backup', { recursive: true, force: true })  // 删目录树

// 复制文件（Node.js 没有内置 copy，需要读 + 写）
const content = fs.readFileSync('src.txt')
fs.writeFileSync('dst.txt', content)
```

## 十、临时文件：tempfile

写测试或处理中间数据时，经常需要临时文件。手动建临时文件容易忘记删，`tempfile` 模块自动处理。

```python
import tempfile

# 临时文件，用完自动删
with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
    f.write("临时数据")
    temp_path = f.name
    print(f"临时文件在：{temp_path}")

# 用完手动删
import os
os.remove(temp_path)
```

- `delete=False`：离开 `with` 后不自动删（默认 `True` 会自动删）。
- `suffix` / `prefix`：指定文件名后缀 / 前缀，方便识别。

### 临时目录

```python
import tempfile

with tempfile.TemporaryDirectory() as tmp_dir:
    # 在临时目录里干活
    file_path = f"{tmp_dir}/data.txt"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("数据")
    print(f"临时目录：{tmp_dir}")
# 离开 with 后自动删除整个目录
```

JS 对照（Node.js 没有 `with`，需要手动管理）：

```js
const fs = require('fs')
const os = require('os')
const path = require('path')

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myapp-'))
fs.writeFileSync(path.join(tmpDir, 'data.txt'), '数据')
// 用完手动删
fs.rmSync(tmpDir, { recursive: true })
```

## 十一、编码深入

### 为什么总要用 UTF-8

`encoding="utf-8"` 不是可选项，是必须的。不同系统的默认编码不同：

| 系统 | 默认编码 | 不指定会怎样 |
| --- | --- | --- |
| Windows（中文） | GBK | 写入 UTF-8 文件会乱码 |
| Linux | UTF-8 | 一般没问题 |
| macOS | UTF-8 | 一般没问题 |

在 Windows 上，不指定编码：

```python
# Windows 上：默认用 GBK
with open("note.txt", "w") as f:     # 没有 encoding
    f.write("你好")                   # 文件可能是 GBK 编码
```

换成别的电脑读取（默认 UTF-8）就会乱码。**所以企业代码必须显式写 `encoding="utf-8"`。**

### errors 参数：编码出错怎么办

读取文件遇到无法解码的字节时，默认会报错。可以用 `errors` 参数控制：

```python
# errors="ignore"：跳过无法解码的字节
content = open("note.txt", "r", encoding="utf-8", errors="ignore").read()

# errors="replace"：用 �替换无法解码的字节
content = open("note.txt", "r", encoding="utf-8", errors="replace").read()

# errors="strict"（默认）：直接报 UnicodeDecodeError
```

只在抢救损坏文件时用，正常情况不要用。

## 十二、大文件处理

如果文件很大（几个 G），不能一次性 `read()` 全部内容，会撑爆内存。

### 方法一：逐行读取（最推荐）

```python
with open("huge.log", "r", encoding="utf-8") as f:
    for line in f:          # 一行一行读，内存占用极小
        if "ERROR" in line:
            print(line.strip())
```

### 方法二：分块读取二进制

```python
chunk_size = 1024 * 1024   # 每次读 1MB

with open("huge.bin", "rb") as f:
    while chunk := f.read(chunk_size):   # 海象运算符，Python 3.8+
        process(chunk)                    # 处理这一块
```

### 方法三：用 readline 逐行控制

```python
with open("huge.log", "r", encoding="utf-8") as f:
    line = f.readline()
    while line:
        print(line.strip())
        line = f.readline()
```

**记住：`file.read()` 会把整个文件读进内存，大文件绝对不要用。**

## 十三、自定义 with：上下文管理器

`with` 语句不只能管文件。任何实现了 `__enter__` 和 `__exit__` 方法的对象都能用 `with`，这叫**上下文管理器**。

```python
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.cost = time.time() - self.start
        print(f"耗时 {self.cost:.3f} 秒")
        return False   # 不吞异常

with Timer():
    total = sum(range(1000000))
    print(f"结果：{total}")
```

`__exit__` 的三个参数是异常信息（如果有异常发生）。返回 `False` 表示不吞掉异常。

### 用 contextlib 简化

```python
from contextlib import contextmanager
import time

@contextmanager
def timer():
    start = time.time()
    yield                    # yield 前面是 __enter__，后面是 __exit__
    print(f"耗时 {time.time() - start:.3f} 秒")

with timer():
    total = sum(range(1000000))
```

`@contextmanager` 装饰器把生成器函数变成上下文管理器，比写类更简洁。

JS 对照（Node.js 没有内置 `with`，可用 try-finally 模拟）：

```js
function withTimer(fn) {
  const start = Date.now()
  try {
    return fn()
  } finally {
    console.log(`耗时 ${(Date.now() - start) / 1000} 秒`)
  }
}

withTimer(() => {
  let total = 0
  for (let i = 0; i < 1000000; i++) total += i
  console.log('结果：', total)
})
```

## 十四、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS (Node.js) | 怎么记 |
| --- | --- | --- | --- |
| 读取文件 | `open()` + `with` | `fs.readFileSync()` | Python 用 with |
| 写入文件 | `file.write()` | `fs.writeFileSync()` | Python 用方法 |
| 自动关闭 | `with` 自动关 | 不需要手动关（sync） | Python 用 with |
| 读取模式 | `"r"` | 默认就是读 | Python 要指定模式 |
| 写入模式 | `"w"` 覆盖，`"a"` 追加 | 默认覆盖 | Python 有专门追加模式 |
| 二进制模式 | `"rb"` / `"wb"` | `Buffer` | Python 模式加 b |
| JSON 序列化 | `json.dumps()` | `JSON.stringify()` | Python 用 dumps |
| JSON 反序列化 | `json.loads()` | `JSON.parse()` | Python 用 loads |
| 中文 JSON | `ensure_ascii=False` | 默认支持 | Python 要手动关 |
| 路径拼接 | `pathlib` 的 `/` 运算符 | `path.join()` | Python 用除号拼路径 |
| 复制文件 | `shutil.copy2()` | 无内置，读+写 | Python 有 shutil |
| 删目录树 | `shutil.rmtree()` | `fs.rmSync({recursive})` | 都有递归删 |
| 编码 | 必须写 `encoding="utf-8"` | 默认 utf-8 | Python 要显式 |

## 十五、企业项目实战：安全的配置文件读写

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


def load_config(path):
    """安全读取配置，出错时返回默认值"""
    if not path.exists():
        save_config(path, default_config)
        print("配置文件不存在，已创建默认配置")
        return default_config

    try:
        with path.open("r", encoding="utf-8") as f:
            config = json.load(f)
        print("配置文件读取成功")
        return config
    except json.JSONDecodeError as e:
        print(f"配置文件格式错误：{e}，使用默认配置")
        return default_config


def save_config(path, config):
    """保存配置"""
    # 确保父目录存在
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


# 使用
config = load_config(config_path)
print(f"站点名称：{config['site_name']}")
print(f"每页条数：{config['page_size']}")

# 修改并保存
config["page_size"] = 20
save_config(config_path, config)
print("配置已更新")
```

## 十六、本篇练习

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
    with file_path.open("r", encoding="utf-8") as file:
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
from pathlib import Path

articles = [
    {"title": "Python 入门", "status": "draft"},
    {"title": "JS 基础", "status": "published"},
    {"title": "Vue 实战", "status": "draft"}
]

path = Path("articles.json")
with path.open("w", encoding="utf-8") as file:
    json.dump(articles, file, ensure_ascii=False, indent=2)

print(f"保存了 {len(articles)} 篇文章")

# 读取验证
with path.open("r", encoding="utf-8") as file:
    loaded = json.load(file)

print("验证：")
for article in loaded:
    print(f"  {article['title']} ({article['status']})")
```

练习四：备份目录（综合练习）。

```python
import shutil
from pathlib import Path
from datetime import datetime

def backup_directory(src, backup_root="backups"):
    """把目录备份到 backups 目录，带时间戳"""
    src_path = Path(src)
    if not src_path.exists():
        print(f"源目录不存在：{src}")
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path(backup_root) / f"{src_path.name}_{timestamp}"
    backup_dir.parent.mkdir(parents=True, exist_ok=True)

    shutil.copytree(src_path, backup_dir)
    print(f"备份完成：{backup_dir}")

    # 统计备份文件数
    file_count = sum(1 for _ in backup_dir.rglob("*") if _.is_file())
    print(f"共备份 {file_count} 个文件")


backup_directory("data")
```

## 本篇小结

1. Python 用 `open()` 打开文件，JS (Node.js) 用 `fs` 模块。
2. 推荐用 `with open(...) as file:` 自动关闭文件，企业代码必须用。
3. `"r"` 读，`"w"` 写（覆盖），`"a"` 追加，`"b"` 二进制，`"x"` 独占创建。
4. 始终指定 `encoding="utf-8"` 避免中文乱码，Windows 默认编码是 GBK。
5. `file.read()` 读全部，`for line in file` 逐行读（推荐大文件）。
6. 二进制模式用 `"rb"` / `"wb"`，读写 `bytes`，不指定 `encoding`。
7. JSON 读写用 `json.dump()` / `json.load()`，字符串用 `json.dumps()` / `json.loads()`，中文要 `ensure_ascii=False`。
8. CSV 用 `csv` 模块，`DictReader` / `DictWriter` 比按索引更安全。
9. 推荐用 `pathlib` 处理路径，`Path("a") / "b"` 比 `"a/b"` 更安全。
10. `pathlib` 的 `glob` 查当前层，`rglob` 递归查所有子目录。
11. `os` 管底层操作（`makedirs`、`remove`、`rename`），`shutil` 管高级操作（`copy2`、`copytree`、`rmtree`、`move`）。
12. `tempfile` 自动管理临时文件，离开 `with` 自动删。
13. 大文件必须逐行或分块读取，不能用 `read()` 全读。
14. 自定义 `__enter__` / `__exit__` 或用 `@contextmanager` 可以造自己的 `with`。
