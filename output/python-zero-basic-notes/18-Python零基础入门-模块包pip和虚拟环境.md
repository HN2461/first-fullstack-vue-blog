---
title: Python 零基础入门 18：模块、包、pip 和虚拟环境
slug: python-zero-modules-pip-venv
summary: 讲解模块和包是什么，如何 import，搜索路径与相对导入，模块缓存与循环导入，如何使用 pip 安装第三方库（版本指定与镜像源），为什么企业项目常用虚拟环境，以及 uv/poetry 等现代工具，全程对照 JavaScript。
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

Python 也有 import，但语法和 JS 不完全一样。本章会从模块、包、搜索路径，讲到 pip、虚拟环境和现代工具链。

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

**核心区别：** Python 的模块不需要 `export`，文件里所有顶级变量和函数自动可导入。JS 必须用 `export` 导出才能 `import`。

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

### 导入模块并重命名

```python
import math_tools as mt

mt.add(3, 5)
```

JS：

```js
import * as mt from './mathTools.js'
```

### import 对照表

| Python | JS | 说明 |
| --- | --- | --- |
| `import module` | `import * as module from '...'` | 导入整个模块 |
| `import module as m` | `import * as m from '...'` | 导入并重命名 |
| `from module import func` | `import { func } from '...'` | 导入指定函数 |
| `from module import a, b` | `import { a, b } from '...'` | 导入多个 |
| `from module import a as b` | `import { a as b } from '...'` | 重命名 |

**核心区别：**

1. Python 的模块不需要 `export`，所有顶级变量和函数自动可导入。
2. JS 必须用 `export` 导出才能 `import`。
3. Python 不需要写文件扩展名，JS 需要写 `.js` 或配置路径别名。

## 三、`from module import *` 和 `__all__`

### 通配符导入

Python 支持用 `*` 一次导入模块里所有公开的名字：

```python
from math_tools import *

add(3, 5)        # 直接用，不需要前缀
multiply(3, 5)
```

JS 没有完全等价的语法（ES Module 不支持 `import *` 展开到当前作用域）。

**为什么不推荐？**

| 问题 | 说明 |
| --- | --- |
| 命名冲突 | 多个模块的同名函数会互相覆盖，且很难发现 |
| 可读性差 | 看不出某个函数来自哪个模块 |
| 调试困难 | IDE 和工具难以追踪来源 |

企业项目中通常禁止 `from module import *`，建议显式导入：

```python
# 不推荐
from math_tools import *

# 推荐
from math_tools import add, multiply
```

### `__all__`：控制导入范围

如果你写了一个模块，只想暴露部分函数给外部用，可以定义 `__all__`：

```python
# math_tools.py

__all__ = ["add", "multiply"]    # 只允许 * 导入这两个

def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

def _internal_helper():          # 以下划线开头，约定为内部使用
    pass
```

```python
from math_tools import *

print(add(3, 5))        # 8
print(multiply(3, 5))   # 15
# _internal_helper()    # NameError，没有被 * 导入
```

`__all__` 的作用：

1. 控制 `from module import *` 能导入哪些名字。
2. 给 IDE 和文档工具提示"这个模块的公开 API 是什么"。

JS 对照：JS 用 `export` 显式导出，天然控制了范围。Python 没有这个机制，所以用 `__all__` 模拟。

另外，Python 约定**以单下划线开头的名字**（如 `_internal_helper`）是私有的，`from module import *` 默认不会导入它们，即使不写 `__all__`。

## 四、模块搜索路径：Python 去哪找模块

当你写 `import math_tools` 时，Python 不是随便找的，它按固定顺序搜索：

```text
1. sys.modules 缓存（已加载过的模块直接返回）
2. 内置模块（如 sys、os）
3. 当前脚本所在目录
4. PYTHONPATH 环境变量中的目录
5. 第三方库安装目录（site-packages）
```

可以用 `sys.path` 查看搜索路径：

```python
import sys

for path in sys.path:
    print(path)
```

输出类似：

```text
C:\Users\me\project         # 当前脚本所在目录
C:\Python312\python312.zip  # 标准库
C:\Python312\Lib            # 标准库
C:\Python312\Lib\site-packages  # 第三方库
```

### 找不到模块怎么办

如果你创建了 `tools/math_tools.py`，但在项目根目录直接 `import math_tools`，会报错：

```text
ModuleNotFoundError: No module named 'math_tools'
```

因为 Python 只在 `sys.path` 里搜索，不会递归搜索子文件夹。

解决方法：

```python
# 正确：用包路径
from tools import math_tools
from tools.math_tools import add
```

### PYTHONPATH 环境变量

`PYTHONPATH` 类似 JS 的 `NODE_PATH`，可以添加额外的搜索目录：

```powershell
# Windows PowerShell
$env:PYTHONPATH = "C:\my_libs"

# Linux/macOS
export PYTHONPATH=/opt/my_libs
```

但企业项目中一般不依赖 `PYTHONPATH`，而是把项目组织成合理的包结构，让 Python 自动找到。

JS 对照：JS 的模块解析也有类似机制——`node_modules` 逐级向上查找，加上 `tsconfig.json` / `vite.config.js` 里的路径别名（`@/` → `src/`）。Python 没有别名机制，靠包路径和 `sys.path`。

## 五、什么是包

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

### `__init__.py` 的作用

`__init__.py` 不仅仅是标记，它还能做以下事情：

```python
# tools/__init__.py

# 1. 包初始化代码（导入包时自动执行）
print("tools 包已加载")

# 2. 暴露子模块，简化外部导入
from .math_tools import add, multiply
from .string_tools import clean_tag

# 3. 定义 __all__ 控制包级别导入
__all__ = ["add", "multiply", "clean_tag"]
```

外部使用时就简化了：

```python
# 不用 __init__.py 时的写法
from tools.math_tools import add

# 用了 __init__.py 后的简化写法
from tools import add
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

### 命名空间包（了解）

Python 3.3+ 支持没有 `__init__.py` 的包，叫**命名空间包**。主要用于把一个大包拆分到多个目录。日常项目很少用到，知道有这回事即可。

## 六、相对导入

在包内部，模块之间互相导入时，可以用相对导入。

```text
my_project/
  main.py
  tools/
    __init__.py
    math_tools.py
    string_tools.py
    sub/
      __init__.py
      advanced.py
```

### 绝对导入

```python
# tools/sub/advanced.py
from tools.math_tools import add       # 从项目根开始写完整路径
from tools.string_tools import clean_tag
```

### 相对导入

```python
# tools/sub/advanced.py
from ..math_tools import add           # .. 表示上一级包（tools）
from ..string_tools import clean_tag
from . import __init__                 # . 表示当前包（sub）
```

| 写法 | 含义 |
| --- | --- |
| `from . import module` | 当前包（同级目录） |
| `from .. import module` | 上一级包 |
| `from ... import module` | 上上一级包 |

JS 对照：JS 的相对导入用 `./` 和 `../`：

```js
import { add } from '../mathTools.js'       // 上一级
import { foo } from './sub/advanced.js'     // 当前目录下
```

### 相对导入的坑

相对导入**不能直接运行**，必须用 `python -m` 方式启动：

```bash
# 直接运行会报错：ImportError: attempted relative import with no known parent package
python tools/sub/advanced.py

# 正确方式：从项目根目录用 -m 运行
python -m tools.sub.advanced
```

企业项目中，包内部推荐用相对导入（改包名不用改导入语句），入口文件用绝对导入。

## 七、`if __name__ == '__main__'`：模块入口

这是 Python 项目里非常常见的写法，也是面试常考点。

当你直接运行一个 `.py` 文件时，Python 会把特殊变量 `__name__` 设为 `'__main__'`。但如果这个文件是被其他文件 `import` 的，`__name__` 就是模块名而不是 `'__main__'`。

```python
# calculator.py

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

# 只有直接运行时才执行测试代码
if __name__ == "__main__":
    print(add(3, 5))       # 8
    print(subtract(10, 4)) # 6
```

```bash
# 直接运行 → __name__ 是 '__main__'，会执行测试代码
python calculator.py
# 输出：8 和 6
```

```python
# 在其他文件中导入 → __name__ 是 'calculator'，不会执行测试代码
from calculator import add

result = add(1, 2)   # 只导入函数，不会打印测试结果
```

**为什么要这样写？**

| 场景 | 不写 `if __name__` | 写了 `if __name__` |
| --- | --- | --- |
| 直接运行文件 | 正常 | 正常 |
| 被其他文件导入 | 测试代码也会执行 | 测试代码不执行 |

企业项目中，每个模块的测试代码、示例用法、启动入口都应放在 `if __name__ == "__main__":` 里面。

JS 对照：JS 没有这个机制，但 Node.js 有类似的检测方式：

```js
// Node.js 中检测是否直接运行
import { fileURLToPath } from 'url'

if (import.meta.url === `file://${process.argv[1]}`) {
  // 直接运行时执行
  console.log(add(3, 5))
}
```

Python 的 `if __name__ == "__main__"` 更简洁、更通用。

## 八、模块缓存与 `__pycache__`

### 模块只加载一次

Python 的模块是**单例**的——同一个模块无论 `import` 多少次，只加载一次。已加载的模块缓存在 `sys.modules` 字典中：

```python
import sys
import math_tools

# math_tools 已经在缓存里了
print("math_tools" in sys.modules)   # True

# 再次 import 不会重新执行模块代码
import math_tools    # 什么都不会发生
```

这意味着如果你修改了 `math_tools.py`，重新 `import` 不会生效，需要重启程序。

JS 对照：JS 的 ES Module 也有类似缓存机制，同一个模块只执行一次。

### `importlib.reload()`：重新加载模块

调试时如果需要热更新模块，可以用 `importlib.reload()`：

```python
import importlib
import math_tools

# 假设此时修改了 math_tools.py
importlib.reload(math_tools)    # 重新加载，代码会重新执行
```

注意：`reload()` 只对已经 `import` 过的模块有效，且不会更新之前 `from module import func` 导入的引用。主要用于调试，生产环境不要依赖。

### `__pycache__` 目录

你会在项目里看到自动生成的 `__pycache__` 文件夹：

```text
my_project/
  math_tools.py
  __pycache__/
    math_tools.cpython-312.pyc    # 编译后的字节码缓存
```

这是 Python 为了加快下次启动速度，把模块编译成字节码（`.pyc`）缓存起来。类似 JS 的 V8 引擎编译缓存。

- 可以安全删除，下次运行会自动重新生成。
- 应该加入 `.gitignore`，不要提交到版本库。

```text
# .gitignore
__pycache__/
*.pyc
```

## 九、循环导入问题

循环导入是 Python 项目中最常见的坑之一：模块 A 导入了模块 B，模块 B 又导入了模块 A。

```python
# a.py
from b import hello_b

def hello_a():
    print("A")
    hello_b()
```

```python
# b.py
from a import hello_a

def hello_b():
    print("B")
```

运行 `python a.py` 会报错：

```text
ImportError: cannot import name 'hello_b' from partially initialized module 'b'
```

原因：Python 导入 `a` → 执行 `a` → 发现要导入 `b` → 开始导入 `b` → 执行 `b` → 发现要导入 `a` → 但 `a` 还没执行完（只加载了一半）→ `hello_a` 还不存在 → 报错。

### 解决方法

**方法一：把导入移到函数内部（延迟导入）**

```python
# a.py
def hello_a():
    from b import hello_b    # 用到时才导入
    print("A")
    hello_b()
```

**方法二：重构代码，消除循环依赖**

把共享的部分抽到第三个模块：

```text
# 重构后
models/
  user.py       # 只定义数据
  article.py    # 只定义数据
  service.py    # 业务逻辑放这里，导入 user 和 article
```

**方法三：只导入模块，不导入具体名字**

```python
# a.py
import b    # 不用 from b import ...

def hello_a():
    print("A")
    b.hello_b()
```

JS 对照：JS 的 ES Module 在设计上能更好地处理循环依赖（通过"绑定"而非"值拷贝"），但实际开发中也应尽量避免循环依赖。

## 十、常用标准库

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

> 标准库的详细用法（datetime、pathlib、json、random、os、logging、csv 等）将在下一篇单独讲解。

## 十一、什么是第三方库

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

## 十二、使用 pip 安装第三方库

Python 用 `pip` 安装第三方库，JS 用 `npm`。

### 基本操作

| 操作 | Python | JS |
| --- | --- | --- |
| 安装 | `pip install requests` | `npm install axios` |
| 卸载 | `pip uninstall requests` | `npm uninstall axios` |
| 查看已安装 | `pip list` | `npm list` |
| 查看详情 | `pip show requests` | `npm info axios` |
| 升级 | `pip install --upgrade requests` | `npm update axios` |
| 记录依赖 | `pip freeze > requirements.txt` | `npm init` → `package.json` |
| 安装依赖 | `pip install -r requirements.txt` | `npm install` |
| 清除缓存 | `pip cache purge` | `npm cache clean --force` |

### 安装指定版本

```powershell
# 安装特定版本
pip install requests==2.31.0

# 安装最低版本
pip install requests>=2.28.0

# 安装版本范围
pip install "requests>=2.28.0,<3.0.0"

# 兼容版本（~= 表示同一次版本内的最新补丁）
pip install "requests~=2.31.0"
```

版本说明符对照：

| 说明符 | 含义 | 示例 |
| --- | --- | --- |
| `==` | 精确版本 | `requests==2.31.0` |
| `>=` | 最低版本 | `requests>=2.28.0` |
| `<=` | 最高版本 | `requests<=3.0.0` |
| `~=` | 兼容版本 | `requests~=2.31`（≥2.31，<3.0） |
| `!=` | 排除版本 | `requests!=2.30.0` |

JS 对照：`package.json` 里 `"axios": "^1.6.0"` 的 `^` 类似 Python 的 `~=`。

### `python -m pip` vs `pip`

你经常看到两种写法：

```powershell
pip install requests           # 直接调用 pip
python -m pip install requests  # 通过 Python 解释器调用 pip
```

推荐用 `python -m pip`，因为它确保用的是当前 Python 解释器对应的 pip，避免环境混乱（尤其是有多个 Python 版本时）。

### 国内镜像加速

国内直接从 PyPI 下载可能很慢，可以使用国内镜像源：

```powershell
# 临时使用（单次安装）
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久配置（推荐）
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

常用国内镜像：

| 镜像源 | 地址 |
| --- | --- |
| 清华大学 | `https://pypi.tuna.tsinghua.edu.cn/simple` |
| 阿里云 | `https://mirrors.aliyun.com/pypi/simple` |
| 中科大 | `https://pypi.mirrors.ustc.edu.cn/simple` |
| 腾讯云 | `https://mirrors.cloud.tencent.com/pypi/simple` |

### 安装示例

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

## 十三、为什么需要虚拟环境

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

## 十四、创建和使用虚拟环境

### 创建

```powershell
python -m venv .venv
```

### 激活

不同系统激活命令不同：

**Windows PowerShell：**

```powershell
.\.venv\Scripts\Activate.ps1
```

**Windows CMD：**

```powershell
.\.venv\Scripts\activate.bat
```

**macOS / Linux：**

```bash
source .venv/bin/activate
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

# 2. 激活（Windows PowerShell）
.\.venv\Scripts\Activate.ps1

# 2. 激活（macOS / Linux）
# source .venv/bin/activate

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

### `.gitignore` 配置

虚拟环境和缓存不应提交到版本库：

```text
# .gitignore
.venv/
__pycache__/
*.pyc
*.pyo
```

JS 对照：JS 的 `.gitignore` 里排除 `node_modules/`，道理一样。

### PowerShell 激活报错？

如果激活时报 `execution of scripts is disabled`，需要修改执行策略（只需一次）：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 十五、现代包管理工具概览

`venv` + `pip` + `requirements.txt` 是 Python 最基础的方案。但现代 Python 生态有更强大的工具：

### 工具对比

| 工具 | 定位 | 对标 JS | 特点 |
| --- | --- | --- | --- |
| `venv` + `pip` | 基础方案 | `npm` 基础用法 | Python 自带，够用但不够自动化 |
| `pipenv` | pip + venv 合体 | `npm` | 自动管理虚拟环境，用 `Pipfile` |
| `poetry` | 全能项目管理 | `npm` + `yarn` | 依赖管理 + 打包 + 发布，用 `pyproject.toml` |
| `uv` | 高性能替代品 | `pnpm` | Rust 编写，极快，兼容 pip |
| `conda` | 科学计算环境 | — | 管理非 Python 依赖（如 C 库），适合数据科学 |

### `pyproject.toml`：现代 Python 项目标准

`pyproject.toml` 是 Python 官方推荐的项目配置文件（PEP 518/621），类似 JS 的 `package.json`：

```toml
[project]
name = "my-blog-tools"
version = "0.1.0"
description = "博客工具集"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.31.0",
    "flask>=3.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "ruff>=0.4.0",
]
```

JS 对照：

```json
{
  "name": "my-blog-tools",
  "version": "0.1.0",
  "description": "博客工具集",
  "dependencies": {
    "axios": "^1.6.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

### `uv`：新一代极速工具

`uv` 是目前最热门的 Python 包管理工具，用 Rust 编写，速度比 `pip` 快 10-100 倍：

```powershell
# 安装
pip install uv

# 创建项目
uv init my-project

# 添加依赖（自动创建虚拟环境 + 安装 + 写入 pyproject.toml）
uv add requests flask

# 安装全部依赖
uv sync

# 运行脚本
uv run main.py
```

`uv add` 类似 `npm install axios`——自动处理虚拟环境、安装依赖、更新配置文件，一条命令搞定。

> 入门阶段先用 `venv` + `pip` 打好基础，等熟悉后再尝试 `uv` 或 `poetry` 提升效率。

## 十六、企业项目实战：完整项目结构

一个典型的 Python 项目结构：

```text
my_blog/
  pyproject.toml          # 项目配置和依赖（或 requirements.txt）
  .gitignore
  main.py                 # 入口文件
  src/                    # 源码目录
    __init__.py
    config.py             # 配置
    models/               # 数据模型
      __init__.py
      article.py
      user.py
    services/             # 业务逻辑
      __init__.py
      article_service.py
      user_service.py
    utils/                # 工具函数
      __init__.py
      string_tools.py
      file_tools.py
  tests/                  # 测试
    __init__.py
    test_article.py
```

`main.py` 入口示例：

```python
"""博客系统入口"""

from src.config import load_config
from src.services.article_service import ArticleService
from src.utils.string_tools import clean_tag


def main():
    # 加载配置
    config = load_config()
    print(f"站点名称：{config['site_name']}")

    # 使用服务
    service = ArticleService()

    # 清理标签
    raw_tag = "  Python  "
    print(f"清理后的标签：{clean_tag(raw_tag)}")  # python


if __name__ == "__main__":
    main()
```

`src/utils/string_tools.py` 工具模块：

```python
"""字符串工具"""


def clean_tag(tag):
    """清理标签：去空格、转小写"""
    return tag.strip().lower()


def is_valid_tag(tag):
    """判断标签是否有效"""
    return len(tag.strip()) > 0
```

`src/services/article_service.py` 服务模块：

```python
"""文章服务"""

from src.utils.string_tools import clean_tag, is_valid_tag


class ArticleService:
    def __init__(self):
        self.articles = []

    def create(self, title, tags=None):
        """创建文章"""
        clean_tags = []
        for tag in (tags or []):
            if is_valid_tag(tag):
                clean_tags.append(clean_tag(tag))

        article = {
            "title": title,
            "tags": clean_tags,
            "status": "draft",
        }
        self.articles.append(article)
        return article


if __name__ == "__main__":
    # 模块自测：直接运行时执行
    service = ArticleService()
    article = service.create("Python 入门", [" Python ", "JS", "  "])
    print(article)
    # {'title': 'Python 入门', 'tags': ['python', 'js'], 'status': 'draft'}
```

这个结构体现了企业 Python 项目的关键实践：

1. 每个目录有 `__init__.py`，构成包。
2. 模块间用绝对导入（`from src.utils...`）。
3. 入口文件用 `if __name__ == "__main__":`。
4. 每个模块都可以独立自测。
5. `.gitignore` 排除 `.venv/` 和 `__pycache__/`。

## 十七、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 导入语法 | `import module` | `import { x } from '...'` | Python 更简单 |
| 导出 | 不需要 export | 需要 export | Python 自动可导入 |
| 文件扩展名 | 不写 `.py` | 需要写 `.js` 或配置别名 | Python 省略 |
| 通配符导入 | `from m import *`（不推荐） | 不支持 | Python 有但不建议用 |
| 控制导出范围 | `__all__` | `export` | Python 用列表声明 |
| 搜索路径 | `sys.path` | `node_modules` 逐级查找 | 机制不同 |
| 相对导入 | `from . import m` | `import m from './m.js'` | Python 用点号 |
| 模块入口 | `if __name__ == '__main__'` | `import.meta.url` 检测 | Python 更通用 |
| 模块缓存 | `sys.modules` | ES Module 缓存 | 都只加载一次 |
| 编译缓存 | `__pycache__/*.pyc` | V8 编译缓存 | 可安全删除 |
| 包管理器 | `pip` | `npm` | pip = npm |
| 依赖文件 | `requirements.txt` / `pyproject.toml` | `package.json` | 格式不同 |
| 版本锁定 | `pip freeze` | `package-lock.json` | npm 更自动化 |
| 版本说明符 | `>=2.31,<3.0` | `^1.6.0` | 语法不同 |
| 依赖隔离 | 需要虚拟环境 | `node_modules` 天然隔离 | Python 需要手动 |
| 第三方 HTTP 库 | `requests` | `axios` | 不同库 |
| Web 框架 | `flask` / `fastapi` | `express` | 不同库 |

## 十八、本篇练习

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

练习三：查看搜索路径并理解模块查找。

```python
import sys

print("=== 模块搜索路径 ===")
for i, path in enumerate(sys.path):
    print(f"{i}: {path}")

print("\n=== 已加载的模块（前 10 个）===")
for name in list(sys.modules.keys())[:10]:
    print(name)
```

## 本篇小结

1. Python `.py` 文件就是模块，JS 需要 `export` 才能被 `import`。
2. Python `import module`，JS `import { x } from '...'`。
3. `from module import *` 可以通配导入但不推荐，用 `__all__` 控制范围。
4. Python 按 `sys.path` 搜索模块，顺序：缓存 → 内置 → 当前目录 → PYTHONPATH → site-packages。
5. Python 包是含 `__init__.py` 的文件夹，类似 JS 的目录模块。
6. 包内部可用相对导入（`from . import`），但必须用 `python -m` 运行。
7. `if __name__ == "__main__"` 区分直接运行和被导入，企业项目必备。
8. 模块只加载一次，缓存在 `sys.modules`；`__pycache__` 是字节码缓存，可安全删除。
9. 循环导入是常见坑，用延迟导入或重构解决。
10. 标准库不需要安装，直接 `import`，类似 JS 的 `Math`、`JSON`、`Date`。
11. 第三方库用 `pip install` 安装，类似 `npm install`；支持版本指定和国内镜像加速。
12. 虚拟环境隔离依赖，类似 JS 的 `node_modules` 隔离；`requirements.txt` 类似 `package.json`。
13. 现代工具 `uv` / `poetry` + `pyproject.toml` 提供了更高效的项目管理方式。
