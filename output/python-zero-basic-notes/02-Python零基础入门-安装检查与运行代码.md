---
title: Python 零基础入门 02：安装检查与运行代码
slug: python-zero-install-and-run
summary: 讲解如何确认电脑是否安装 Python，如何创建 py 文件，如何在命令行运行代码，并解释常见运行问题。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 02：安装检查与运行代码

这一篇解决一个最实际的问题：代码写在哪里，怎么让它跑起来。

## 检查是否安装 Python

打开命令行工具。

Windows 可以打开 PowerShell 或命令提示符，然后输入：

```powershell
python --version
```

如果看到类似结果：

```text
Python 3.12.4
```

说明已经安装成功。

如果提示找不到 `python`，说明可能还没有安装，或者安装时没有加入环境变量。

## Python 版本怎么看

版本号通常长这样：

```text
Python 3.12.4
```

可以简单理解为：

- `3` 是大版本
- `12` 是中版本
- `4` 是小版本

新手只要记住：现在学习 Python，使用 Python 3 就可以。

## 创建第一个 py 文件

Python 代码文件通常以 `.py` 结尾。

例如创建一个文件：

```text
hello.py
```

在文件里写：

```python
print("你好，Python")
```

保存文件。

## 在命令行运行文件

假设 `hello.py` 在当前目录，运行：

```powershell
python hello.py
```

运行结果：

```text
你好，Python
```

这就表示你的 Python 文件成功运行了。

## 文件名不要乱起

新手建议文件名使用：

- 小写英文字母
- 数字
- 下划线

例如：

```text
hello.py
my_first_code.py
lesson_01.py
```

暂时不要使用：

```text
我的代码.py
第一节 练习.py
```

不是说一定不能用中文，而是新手阶段容易遇到路径、编码、命令行输入问题。先用简单文件名更稳。

## 常见问题一：运行后什么都没有

如果代码是：

```python
"你好，Python"
```

运行后可能没有明显输出。

因为你只是写了一个文本，但没有告诉电脑显示它。

应该写成：

```python
print("你好，Python")
```

## 常见问题二：文件没有保存

很多新手改了代码，但没有保存文件，就去运行。

结果看到的还是旧内容。

所以每次运行前先保存。

在 VS Code 里，常用快捷键是：

```text
Ctrl + S
```

## 常见问题三：命令行位置不对

如果命令行当前目录里没有 `hello.py`，运行：

```powershell
python hello.py
```

可能会提示找不到文件。

你需要先进入文件所在目录，或者在编辑器里打开对应文件夹。

## 本篇小练习

创建文件：

```text
lesson_02.py
```

写入：

```python
print("这是我的第二个 Python 文件")
print("我已经学会运行 py 文件了")
```

运行：

```powershell
python lesson_02.py
```

运行结果：

```text
这是我的第二个 Python 文件
我已经学会运行 py 文件了
```

## 本篇小结

- Python 文件通常以 `.py` 结尾。
- 可以用 `python --version` 检查 Python 版本。
- 可以用 `python 文件名.py` 运行代码。
- 运行前要保存文件，并确认命令行位置正确。
