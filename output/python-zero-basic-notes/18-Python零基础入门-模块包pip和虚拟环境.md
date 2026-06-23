---
title: Python 零基础入门 18：模块、包、pip 和虚拟环境
slug: python-zero-modules-pip-venv
summary: 讲解模块和包是什么，如何 import，如何使用 pip 安装第三方库，为什么企业项目常用虚拟环境，全程对照 JavaScript。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 18：模块、包、pip 和虚拟环境

写小脚本时，一个文件就够了。

但企业项目通常不会把所有代码写在一个文件里。

前端 JS 里你也天天 import：

```js
import { ref } from 'vue'
import axios from 'axios'
import BlogTable from '@/components/BlogTable.vue'
```

Python 也有 import，但语法和 JS 不完全一样。

## 一、什么是模块

一个 `.py` 文件就是一个模块。

比如创建文件 `math_tools.py`：

```python
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b
```

再创建文件 `main.py`：

```python
import math_tools

print(math_tools.add(3, 5))       # 8
print(math_tools.multiply(3, 5))  # 15
```

JS 对照：

```js
// mathTools.js
export function add(a, b) {
  return a + b
}

export function multiply(a, b) {
  return a * b
}

// main.js
import * as mathTools from './mathTools.js'

console.log(mathTools.add(3, 5))       // 8
console.log(mathTools.multiply(3, 5))  // 15
```

## 二、import 的几种写法

### 导入整个模块

```python
import math_tools

math_tools.add(3, 5)
```

JS 对照：

```js
import * as mathTools from './mathTools.js'
mathTools.add(3, 5)
```

### 导入指定函数

```python
from math_tools import add

add(3, 5)    # 不需要 math_tools. 前缀
```

JS 对照：

```js
import { add } from './mathTools.js'
add(3, 5)
```

### 导入多个

```python
from math_tools import add, multiply
```

JS：

```js
import { add, multiply } from './mathTools.js'
```

### 导入并重命名

```python
from math_tools import add as my_add

my_add(3, 5)
```

JS：

```js
import { add as myAdd } from './mathTools.js'
```

### import 对照表

| Python | JS | 说明 |
| --- | --- | --- |
| `import module` | `import * as module from '...'` | 导入整个模块 |
| `from module import func` | `import { func } from '...'` | 导入指定函数 |
| `from module import a, b` | `import { a, b } from '...'` | 导入多个 |
| `from module import a as b` | `import { a as b } from '...'` | 重命名 |

**核心区别：**

1. Python 的模块不需要 `export`，所有顶级变量和函数自动可导入。
2. JS 必须用 `export` 导出才能 `import`。
3. Python 不需要写文件扩展名，JS 需要写 `.js` 或配置路径别名。

## 三、什么是包

包可以简单理解成：**放了多个模块的文件夹。**

```text
my_project/
  main.py
  tools/
    __init__.py
    math_tools.py
    string_tools.py
```

`tools` 文件夹里放了多个工具模块。

`__init__.py` 可以先留空，它的存在表示这个文件夹可以作为包使用（Python 3.3+ 可以省略，但建议保留）。

使用：

```python
from tools import math_tools
from tools.string_tools import clean_tag
```

JS 对照：

```js
// 目录结构
// src/
//   tools/
//     mathTools.js
//     stringTools.js

import { add } from './tools/mathTools.js'
import { cleanTag } from './tools/stringTools.js'
```

Python 的包和 JS 的文件夹模块概念类似，但 Python 需要 `__init__.py`。

## 四、常用标准库

Python 自带很多模块，叫标准库。不需要安装，直接 `import` 就能用。

| 模块 | 用途 | JS 对照 |
| --- | --- | --- |
| `json` | JSON 读写 | `JSON.stringify()` / `JSON.parse()` |
| `os` | 操作系统接口 | `process.env`、`path` 模块 |
| `sys` | 系统参数 | `process.argv` |
| `pathlib` | 路径处理 | `path` 模块 |
| `math` | 数学函数 | `Math` 对象 |
| `random` | 随机数 | `Math.random()` |
| `datetime` | 日期时间 | `Date`、`dayjs` |
| `re` | 正则表达式 | `RegExp` |
| `logging` | 日志 | `console` 或 `winston` |
| `collections` | 高级数据结构 | 无内置 |
| `itertools` | 迭代器工具 | 无内置 |
| `unittest` | 单元测试 | `jest`、`vitest` |

使用示例：

```python
import random
import json
from pathlib import Path
from datetime import datetime

# 随机数
print(random.randint(1, 10))        # 1-10 随机整数

# JSON
data = json.loads('{"name": "小明"}')
print(data["name"])                 # 小明

# 路径
file = Path("data") / "note.txt"
print(file)                         # data/note.txt

# 日期
print(datetime.now())               # 2026-06-22 10:30:00
```

## 五、什么是第三方库

标准库不可能覆盖所有需求。别人写好并发布出来的库，叫第三方库。

前端 JS 里你天天用第三方库：

```js
import axios from 'axios'
import { createApp } from 'vue'
import dayjs from 'dayjs'
```

Python 也有同样的生态：

| Python 库 | 用途 | JS 对照 |
| --- | --- | --- |
| `requests` | HTTP 请求 | `axios` |
| `flask` / `fastapi` | Web 框架 | `express` |
| `pandas` | 数据分析 | `d3.js` |
| `pytest` | 测试框架 | `jest` / `vitest` |
| `sqlalchemy` | ORM | `mongoose` / `prisma` |
| `pillow` | 图片处理 | `sharp` |
| `pydantic` | 数据校验 | `zod` / `joi` |

## 六、使用 pip 安装第三方库

Python 用 `pip` 安装第三方库，JS 用 `npm`。

| 操作 | Python | JS |
| --- | --- | --- |
| 安装 | `pip install requests` | `npm install axios` |
| 卸载 | `pip uninstall requests` | `npm uninstall axios` |
| 查看已安装 | `pip list` | `npm list` |
| 记录依赖 | `pip freeze > requirements.txt` | `npm init` → `package.json` |
| 安装依赖 | `pip install -r requirements.txt` | `npm install` |

安装示例：

```powershell
pip install requests
```

使用：

```python
import requests

response = requests.get("https://api.example.com/articles")
data = response.json()
print(data)
```

JS 对照：

```powershell
npm install axios
```

```js
import axios from 'axios'

const response = await axios.get('https://api.example.com/articles')
console.log(response.data)
```

## 七、为什么需要虚拟环境

假设你电脑上有两个项目：

- 项目 A 需要 `requests` 2.25
- 项目 B 需要 `requests` 2.31

如果所有项目共用同一个 Python 环境，就可能互相影响。

**虚拟环境的作用：给每个项目准备一套独立的 Python 依赖环境。**

前端 JS 里，每个项目有自己的 `node_modules`，天然隔离。Python 默认不是这样——所有包装在全局，所以需要虚拟环境来隔离。

| 对比 | Python | JS |
| --- | --- | --- |
| 依赖隔离 | 需要手动创建虚拟环境 | `node_modules` 天然隔离 |
| 依赖文件 | `requirements.txt` | `package.json` |
| 锁定版本 | `pip freeze` | `package-lock.json` |

## 八、创建和使用虚拟环境

### 创建

```powershell
python -m venv .venv
```

### 激活

Windows PowerShell：

```powershell
.\.venv\Scripts\Activate.ps1
```

Windows CMD：

```powershell
.\.venv\Scripts\activate.bat
```

激活后，命令行前面会出现：

```text
(.venv)
```

### 退出

```powershell
deactivate
```

### 完整流程

```powershell
# 1. 创建虚拟环境
python -m venv .venv

# 2. 激活
.\.venv\Scripts\Activate.ps1

# 3. 安装依赖
pip install requests flask

# 4. 记录依赖
pip freeze > requirements.txt

# 5. 编写代码
# ...

# 6. 退出虚拟环境
deactivate
```

别人拿到项目后：

```powershell
# 1. 创建虚拟环境
python -m venv .venv

# 2. 激活
.\.venv\Scripts\Activate.ps1

# 3. 安装依赖
pip install -r requirements.txt
```

## 九、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 导入语法 | `import module` | `import { x } from '...'` | Python 更简单 |
| 导出 | 不需要 export | 需要 export | Python 自动可导入 |
| 文件扩展名 | 不写 `.py` | 需要写 `.js` 或配置别名 | Python 省略 |
| 包管理器 | `pip` | `npm` | pip = npm |
| 依赖文件 | `requirements.txt` | `package.json` | 格式不同 |
| 版本锁定 | `pip freeze` | `package-lock.json` | npm 更自动化 |
| 依赖隔离 | 需要虚拟环境 | `node_modules` 天然隔离 | Python 需要手动 |
| 第三方 HTTP 库 | `requests` | `axios` | 不同库 |
| Web 框架 | `flask` / `fastapi` | `express` | 不同库 |

## 十、本篇练习

练习一：创建自己的工具模块。

`string_tools.py`：

```python
def clean_tag(tag):
    """清理标签：去空格、转小写"""
    return tag.strip().lower()

def is_valid_tag(tag):
    """判断标签是否有效"""
    return len(tag.strip()) > 0
```

`main.py`：

```python
from string_tools import clean_tag, is_valid_tag

raw_tags = [" Python ", "JS", "  ", "Vue"]
clean_tags = []

for tag in raw_tags:
    if is_valid_tag(tag):
        clean_tags.append(clean_tag(tag))

print(clean_tags)   # ['python', 'js', 'vue']
```

练习二：使用标准库。

```python
import json
from pathlib import Path
from datetime import datetime

# 记录当前时间
now = datetime.now()
print(f"当前时间：{now}")

# 创建目录
data_dir = Path("data")
data_dir.mkdir(exist_ok=True)    # 目录不存在就创建，已存在不报错

# 保存数据
article = {"title": "Python 入门", "created_at": str(now)}
with open(data_dir / "article.json", "w", encoding="utf-8") as file:
    json.dump(article, file, ensure_ascii=False, indent=2)

print("数据已保存")
```

## 本篇小结

1. Python `.py` 文件就是模块，JS 需要 `export` 才能被 `import`。
2. Python `import module`，JS `import { x } from '...'`。
3. Python 包是含 `__init__.py` 的文件夹，类似 JS 的目录模块。
4. 标准库不需要安装，直接 `import`，类似 JS 的 `Math`、`JSON`、`Date`。
5. 第三方库用 `pip install` 安装，类似 `npm install`。
6. 虚拟环境隔离依赖，类似 JS 的 `node_modules` 隔离。
7. `requirements.txt` 记录依赖，类似 `package.json`。
8. Python 不需要写文件扩展名，JS 需要写或配置别名。
