---
title: Python 零基础入门 13：文件读写
slug: python-zero-file-read-write
summary: 介绍如何用 Python 写入文本文件、读取文本文件、追加内容，以及为什么推荐使用 with 和 UTF-8 编码。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 13：文件读写

前面的数据运行结束后就没了。

如果想把内容保存下来，可以写入文件。

这一篇学习最基础的文本文件读写。

## 写入文件

```python
with open("note.txt", "w", encoding="utf-8") as file:
    file.write("这是我的第一条笔记")
```

运行后，当前目录会出现一个文件：

```text
note.txt
```

里面内容是：

```text
这是我的第一条笔记
```

## 代码解释

```python
open("note.txt", "w", encoding="utf-8")
```

意思是打开 `note.txt`。

其中：

- `"note.txt"` 是文件名。
- `"w"` 表示写入模式。
- `encoding="utf-8"` 表示使用 UTF-8 编码，中文更不容易乱码。

`with` 可以帮我们在用完文件后自动关闭文件。

新手阶段建议固定使用这种写法。

## 写入多行内容

```python
with open("note.txt", "w", encoding="utf-8") as file:
    file.write("第一行\n")
    file.write("第二行\n")
    file.write("第三行\n")
```

文件内容：

```text
第一行
第二行
第三行
```

`\n` 表示换行。

## 读取文件

```python
with open("note.txt", "r", encoding="utf-8") as file:
    content = file.read()

print(content)
```

运行结果：

```text
第一行
第二行
第三行
```

`"r"` 表示读取模式。

## 追加内容

如果使用 `"w"`，会覆盖原文件。

如果想在文件末尾追加内容，使用 `"a"`。

```python
with open("note.txt", "a", encoding="utf-8") as file:
    file.write("追加的一行\n")
```

再次读取文件，会看到新内容加在最后。

## 按行读取

```python
with open("note.txt", "r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())
```

`strip()` 用来去掉每行末尾的换行和多余空白。

## 常见问题一：文件找不到

如果读取一个不存在的文件：

```python
with open("missing.txt", "r", encoding="utf-8") as file:
    content = file.read()
```

会报错。

因为读取模式要求文件已经存在。

## 常见问题二：中文乱码

如果文件里有中文，建议读写时都加：

```python
encoding="utf-8"
```

这样可以减少乱码问题。

## 本篇小练习

写一个简单日记文件：

```python
today = input("请输入今天的日期：")
content = input("请输入今天的学习内容：")

with open("diary.txt", "a", encoding="utf-8") as file:
    file.write(f"{today}：{content}\n")

print("日记已保存")
```

运行示例：

```text
请输入今天的日期：2026-06-20
请输入今天的学习内容：学习了 Python 文件读写
日记已保存
```

`diary.txt` 文件中会追加：

```text
2026-06-20：学习了 Python 文件读写
```

## 本篇小结

- `open()` 可以打开文件。
- `"w"` 是写入，会覆盖原内容。
- `"r"` 是读取。
- `"a"` 是追加。
- 推荐使用 `with open(...) as file`。
- 处理中文时建议指定 `encoding="utf-8"`。
