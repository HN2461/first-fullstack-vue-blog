---
title: Python 零基础入门 16：模块、包、pip 和虚拟环境
slug: python-zero-modules-pip-venv
summary: 讲解模块和包是什么，如何 import，如何使用 pip 安装第三方库，为什么企业项目常用虚拟环境，以及 requirements.txt 的作用。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 16：模块、包、pip 和虚拟环境

写小脚本时，一个文件就够了。

但企业项目通常不会把所有代码写在一个文件里。

这一篇学习 Python 项目里很常见的几个词：

- 模块
- 包
- import
- pip
- 虚拟环境
- requirements.txt

## 什么是模块

一个 `.py` 文件就是一个模块。

比如创建文件：

```text
math_tools.py
```

内容：

```python
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b
```

再创建文件：

```text
main.py
```

内容：

```python
import math_tools

print(math_tools.add(3, 5))
print(math_tools.multiply(3, 5))
```

运行 `main.py`：

```text
8
15
```

这里 `math_tools.py` 就是一个模块。

## 从模块导入指定函数

也可以只导入需要的函数：

```python
from math_tools import add

print(add(3, 5))
```

运行结果：

```text
8
```

这种写法调用时不用写 `math_tools.add`。

## 什么是包

包可以简单理解成：**放了多个模块的文件夹。**

例如：

```text
my_project/
  main.py
  tools/
    __init__.py
    math_tools.py
    string_tools.py
```

`tools` 文件夹里放了多个工具模块。

`__init__.py` 可以先留空，它的存在表示这个文件夹可以作为包使用。

## 使用标准库

Python 自带很多模块，叫标准库。

比如 `random` 可以生成随机数：

```python
import random

number = random.randint(1, 10)
print(number)
```

运行结果可能是：

```text
7
```

每次运行结果可能不同。

## 什么是第三方库

Python 自带的标准库不可能覆盖所有需求。

别人写好并发布出来的库，叫第三方库。

比如：

- `requests` 常用于发送 HTTP 请求
- `pandas` 常用于处理表格数据
- `flask` 常用于写 Web 服务
- `pytest` 常用于写测试

## 使用 pip 安装第三方库

安装第三方库通常使用 `pip`。

例如安装 `requests`：

```powershell
pip install requests
```

安装后可以在代码里使用：

```python
import requests

response = requests.get("https://example.com")
print(response.status_code)
```

如果你暂时没有网络，先理解流程即可。

## 为什么需要虚拟环境

假设你电脑上有两个项目：

- 项目 A 需要 `requests` 2.25
- 项目 B 需要 `requests` 2.31

如果所有项目共用同一个 Python 环境，就可能互相影响。

虚拟环境的作用是：**给每个项目准备一套独立的 Python 依赖环境。**

企业项目通常会使用虚拟环境，避免依赖混乱。

## 创建虚拟环境

在项目目录运行：

```powershell
python -m venv .venv
```

这里 `.venv` 是虚拟环境文件夹名。

## 激活虚拟环境

Windows PowerShell：

```powershell
.\.venv\Scripts\Activate.ps1
```

激活后，命令行前面通常会出现：

```text
(.venv)
```

表示当前正在使用这个虚拟环境。

## 记录依赖 requirements.txt

项目安装了哪些第三方库，可以记录到：

```text
requirements.txt
```

生成命令：

```powershell
pip freeze > requirements.txt
```

别人拿到项目后，可以运行：

```powershell
pip install -r requirements.txt
```

这样就能安装项目需要的依赖。

## 面试怎么说

如果面试官问：“为什么要用虚拟环境？”

可以这样回答：

```text
虚拟环境可以让不同项目使用独立依赖，避免包版本冲突。
比如一个项目需要旧版本 requests，另一个项目需要新版本，如果都装在全局环境里就容易互相影响。
企业项目通常会配合 requirements.txt 或其他依赖文件，把依赖版本记录下来，方便部署和协作。
```

## 本篇小练习

创建两个文件。

`calculator.py`：

```python
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b
```

`main.py`：

```python
from calculator import add, subtract

print(add(10, 3))
print(subtract(10, 3))
```

运行：

```powershell
python main.py
```

结果：

```text
13
7
```

## 本篇小结

- 一个 `.py` 文件就是一个模块。
- 包是包含多个模块的文件夹。
- `import` 用来导入模块。
- `pip` 用来安装第三方库。
- 虚拟环境用于隔离不同项目的依赖。
- `requirements.txt` 用于记录和恢复依赖。
