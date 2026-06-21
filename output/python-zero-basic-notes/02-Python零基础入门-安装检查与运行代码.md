---
title: Python 零基础入门 02：安装检查与运行代码
slug: python-zero-install-and-run
summary: 面向已有前端 JS 基础的学习者，讲清楚 Python 解释器、命令行、py 文件运行、PATH、VS Code 运行配置，并对照 Node.js、npm、浏览器控制台和前端项目运行方式。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 02：安装检查与运行代码

这一篇解决一个最实际的问题：**代码写在哪里，怎么让它真正跑起来。**

如果你学过前端，可能已经习惯了：

```bash
npm run dev
```

然后打开浏览器看页面。

Python 入门阶段不太一样。你最常见的动作是：

```bash
python hello.py
```

也就是写一个 `.py` 文件，然后让 Python 解释器执行它。

这篇你要搞清楚：

1. Python 环境到底是什么。
2. 怎么检查 Python 是否安装成功。
3. `.py` 文件怎么运行。
4. 命令行当前目录是什么意思。
5. VS Code 运行 Python 和命令行运行有什么关系。
6. Python 的运行方式和前端 JS / Node.js 有什么区别。

## 一、先理解“环境”是什么意思

你写的代码文件本身不会自己运行。

比如你写：

```python
print("你好，Python")
```

电脑不会天然理解这行 Python 代码。它需要一个能读懂 Python 的程序来执行，这个程序叫：

```text
Python 解释器
```

可以理解成：

```text
你写的 hello.py
      ↓
Python 解释器读取
      ↓
电脑执行
      ↓
输出结果
```

前端 JavaScript 也一样。

如果你写：

```js
console.log('你好，JavaScript')
```

这段 JS 也需要运行环境。

常见运行环境有两种：

1. 浏览器：执行页面里的 JS。
2. Node.js：执行命令行或服务端 JS。

对照表：

| 语言 | 你写的文件 | 谁来执行 |
| --- | --- | --- |
| Python | `.py` 文件 | Python 解释器 |
| 浏览器 JS | HTML 里的 script 或前端构建后的 JS | 浏览器 JS 引擎 |
| Node.js JS | `.js` 文件 | Node.js |

所以先记住一句话：

> 代码文件只是文本，必须交给对应运行环境执行。

## 二、检查 Python 是否安装成功

打开命令行工具。

Windows 可以打开 PowerShell 或命令提示符，然后输入：

```powershell
python --version
```

如果看到类似结果：

```text
Python 3.12.4
```

说明 Python 命令能被系统识别。

有些电脑上命令可能是：

```powershell
py --version
```

macOS 或 Linux 上更常见：

```bash
python3 --version
```

只要能看到 `Python 3.x.x`，就说明你已经能调用 Python。

如果看到：

```text
python 不是内部或外部命令
```

或者：

```text
command not found: python
```

通常说明：

1. Python 没安装。
2. 安装了，但没有加入 PATH。
3. 当前系统命令不是 `python`，而是 `py` 或 `python3`。
4. 安装后没有重新打开命令行窗口。

## 三、JS 对照：检查 Node.js 是否安装

前端里你检查 Node.js 通常会写：

```bash
node --version
```

可能输出：

```text
v20.11.1
```

检查 npm：

```bash
npm --version
```

Python 对应关系：

| 目的 | Python | JS / Node.js |
| --- | --- | --- |
| 检查语言运行环境 | `python --version` | `node --version` |
| 检查包管理工具 | `pip --version` | `npm --version` |
| 运行单个文件 | `python hello.py` | `node hello.js` |
| 安装第三方包 | `pip install 包名` | `npm install 包名` |

相同点：

1. 都需要先安装运行环境。
2. 都可以通过 `--version` 检查版本。
3. 都可以在命令行里运行文件。
4. 都有包管理工具。

核心区别：

1. Python 的包管理工具常用 `pip`。
2. JS / Node.js 的包管理工具常用 `npm`、`pnpm`、`yarn`。
3. Python 文件交给 Python 解释器执行。
4. JS 文件可以交给浏览器或 Node.js 执行。

高频踩坑：

1. 不要用 `node hello.py` 运行 Python 文件。
2. 不要用 `python hello.js` 运行 JS 文件。
3. `pip` 不是 `npm`，不要混着写。
4. `python --version` 能成功，不代表 `pip` 一定正常，`pip` 也要单独检查。

## 四、创建第一个 Python 文件

新建一个文件：

```text
hello.py
```

注意后缀是 `.py`。

文件内容：

```python
print("你好，Python")
```

这是一个最小 Python 程序。

它只做一件事：把一段文字输出到终端。

拆开看：

| 代码部分 | 含义 |
| --- | --- |
| `print` | Python 内置输出函数 |
| `()` | 调用函数 |
| `"你好，Python"` | 要输出的字符串 |

现在先不用深挖“函数”概念，后面会专门讲。这里你只要知道：

> `print()` 可以把括号里的内容显示出来。

## 五、JS 对照：创建并运行 JS 文件

JS 里类似文件：

```text
hello.js
```

内容：

```js
console.log('你好，JavaScript')
```

如果用 Node.js 运行：

```bash
node hello.js
```

对照：

| 操作 | Python | JS / Node.js |
| --- | --- | --- |
| 文件名 | `hello.py` | `hello.js` |
| 输出代码 | `print("你好")` | `console.log('你好')` |
| 运行命令 | `python hello.py` | `node hello.js` |
| 输出位置 | 命令行终端 | 命令行终端 |

相同点：

1. 都可以写成单独文件。
2. 都可以通过命令行运行。
3. 都会从文件第一行开始执行。
4. 都能在终端输出结果。

核心区别：

1. Python 用 `print()`。
2. JS 用 `console.log()`。
3. Python 文件后缀是 `.py`。
4. JS 文件后缀是 `.js`。
5. 前端项目里的 JS 还可能被 Vite、Webpack、浏览器共同处理。

## 六、运行 Python 文件

假设你的文件在：

```text
C:\code\python-practice\hello.py
```

先进入目录：

```powershell
cd C:\code\python-practice
```

再运行：

```powershell
python hello.py
```

如果正常，会输出：

```text
你好，Python
```

基本格式就是：

```bash
python 文件名.py
```

如果你的电脑用的是 `py`：

```powershell
py hello.py
```

如果是 macOS / Linux：

```bash
python3 hello.py
```

## 七、当前目录是什么意思

很多新手运行失败，不是代码错了，而是命令行所在目录不对。

比如文件在：

```text
C:\code\python-practice\hello.py
```

但你当前命令行在：

```text
C:\Users\你的用户名
```

你直接运行：

```powershell
python hello.py
```

系统会在当前目录找 `hello.py`。如果当前目录没有这个文件，就会报：

```text
can't open file 'hello.py': No such file or directory
```

解决方式有两个。

第一，先进入文件所在目录：

```powershell
cd C:\code\python-practice
python hello.py
```

第二，使用完整路径：

```powershell
python C:\code\python-practice\hello.py
```

JS 里也一样。

```bash
node hello.js
```

也会在当前目录找 `hello.js`。

相同点：

1. 命令行运行文件时，都要考虑当前目录。
2. 文件不在当前目录，就需要 `cd` 过去，或者写完整路径。
3. 报“找不到文件”时，优先检查路径，不要先怀疑语法。

高频踩坑：

1. 文件名拼错。
2. 后缀写错，比如保存成 `hello.py.txt`。
3. 命令行不在文件所在目录。
4. 文件在桌面，终端在用户目录。
5. 路径里有空格或中文时，新手更容易输错。

入门练习建议放在简单目录：

```text
C:\code\python-practice
```

## 八、PATH 环境变量简单理解

你输入：

```bash
python --version
```

系统为什么知道去哪里找 Python？

因为系统有一个环境变量叫：

```text
PATH
```

PATH 里保存了一堆目录。

当你输入 `python`，系统会去 PATH 里的目录一个个找，看有没有 Python 可执行程序。

如果找到了，就运行。

如果找不到，就提示命令不存在。

Node.js 也是一样。

```bash
node --version
npm --version
```

也依赖 PATH。

对照：

| 命令 | 依赖什么 |
| --- | --- |
| `python` | PATH 中能找到 Python |
| `pip` | PATH 中能找到 pip |
| `node` | PATH 中能找到 Node.js |
| `npm` | PATH 中能找到 npm |

高频踩坑：

1. Python 安装时没勾选加入 PATH。
2. 安装完不重启终端。
3. 电脑里有多个 Python 版本，不知道当前用的是哪个。
4. 教程用 `python3`，你的电脑只有 `python` 或 `py`。

## 九、VS Code 运行 Python 是怎么回事

VS Code 只是编辑器，不是 Python 本身。

它负责：

1. 打开文件。
2. 写代码。
3. 代码高亮。
4. 语法提示。
5. 调用 Python 解释器运行代码。

真正执行 Python 的仍然是 Python 解释器。

也就是说：

```text
VS Code 不等于 Python
```

你在 VS Code 里点击运行，本质上底层还是类似：

```bash
python 当前文件.py
```

前端也是一样。

VS Code 不等于 Node.js，也不等于浏览器。

你写 Vue / React 时，真正运行项目的是：

```bash
npm run dev
```

背后可能是 Vite 或其他工具。

对照：

| 工具 | 作用 |
| --- | --- |
| VS Code | 写代码的编辑器 |
| Python 解释器 | 执行 Python |
| Node.js | 执行 JS / 前端工具链 |
| npm | 管理 JS 依赖和脚本 |
| 浏览器 | 运行前端页面 |

高频踩坑：

1. VS Code 选择了错误的 Python 解释器。
2. 命令行能运行，VS Code 不能运行，可能是解释器配置不同。
3. VS Code 终端当前目录不是文件所在目录。
4. 安装了 VS Code Python 插件，但没装 Python 本体。

## 十、Python 交互模式

除了运行 `.py` 文件，Python 还可以进入交互模式。

命令行输入：

```bash
python
```

可能看到：

```text
Python 3.12.4
>>>
```

这个 `>>>` 表示你进入了 Python 交互环境。

可以直接输入：

```python
print("你好")
```

也可以输入：

```python
1 + 2
```

退出：

```python
exit()
```

Node.js 也有交互模式：

```bash
node
```

然后可以输入：

```js
console.log('你好')
```

退出 Node.js 交互模式常用：

```js
.exit
```

对照：

| 功能 | Python | JS / Node.js |
| --- | --- | --- |
| 进入交互模式 | `python` | `node` |
| 提示符 | `>>>` | `>` |
| 输出 | `print("你好")` | `console.log('你好')` |
| 退出 | `exit()` | `.exit` |

高频踩坑：

如果你已经进入 Python 交互模式，不要输入：

```text
>>> python hello.py
```

这是错的。你需要先：

```python
exit()
```

回到系统命令行，再运行：

```bash
python hello.py
```

## 十一、企业项目里为什么这一步重要

你可能觉得 `hello.py` 很简单，公司项目肯定不是这样。

但所有复杂项目底层都离不开：

```text
运行环境 + 入口文件 / 启动命令
```

Python 后端可能这样启动：

```bash
python app.py
```

也可能是：

```bash
uvicorn main:app --reload
```

Django 可能是：

```bash
python manage.py runserver
```

前端项目可能是：

```bash
npm run dev
```

对照：

| 项目类型 | 常见启动命令 | 背后含义 |
| --- | --- | --- |
| Python 单文件 | `python hello.py` | 用 Python 执行一个文件 |
| Python FastAPI | `uvicorn main:app --reload` | 启动 API 服务 |
| Python Django | `python manage.py runserver` | 启动 Django 开发服务 |
| 前端 Vite | `npm run dev` | 启动前端开发服务器 |
| Node.js 后端 | `node app.js` | 用 Node 执行入口文件 |

所以学会 `python hello.py`，不是只会运行玩具代码，而是在理解 Python 项目运行的最底层模型。

## 十二、本篇练习

创建文件：

```text
run_check.py
```

写入：

```python
print("Python 环境检查成功")
print("我正在学习如何运行 Python 文件")
print("我知道 Python 文件后缀是 .py")
```

运行：

```bash
python run_check.py
```

再写 JS 对照文件：

```text
run_check.js
```

内容：

```js
console.log('Node.js 环境检查成功')
console.log('我正在复习如何运行 JS 文件')
console.log('我知道 JS 文件后缀是 .js')
```

运行：

```bash
node run_check.js
```

你要能自己说出：

```text
Python 文件用 python 命令运行，JS 文件可以用 node 命令运行。它们都需要对应的运行环境。Python 常见文件后缀是 .py，JS 常见文件后缀是 .js。运行文件时，命令行必须在正确目录，或者写完整路径。
```

## 本篇小结

1. Python 代码需要 Python 解释器执行。
2. JS 代码需要浏览器 JS 引擎或 Node.js 执行。
3. 检查 Python 版本常用 `python --version`、`py --version` 或 `python3 --version`。
4. 检查 Node.js 版本常用 `node --version`。
5. Python 文件后缀是 `.py`。
6. JS 文件后缀是 `.js`。
7. 运行 Python 文件常用 `python 文件名.py`。
8. 运行 JS 文件常用 `node 文件名.js`。
9. 命令行当前目录非常重要，找不到文件时优先检查路径。
10. VS Code 只是编辑器，真正执行代码的是 Python 或 Node.js。
11. Python 交互模式可以临时试代码，但正式练习建议写 `.py` 文件。
12. 企业项目启动命令虽然更复杂，但底层也是“运行环境 + 入口文件 / 启动命令”。
