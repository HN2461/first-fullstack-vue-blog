---
title: "Windows 文件扩展名、隐藏文件与资源管理器显示设置"
slug: "windows-7c8d9756-revision-20260709"
summary: "基于微软官方说明整理 Windows 里最常用的文件显示设置，重点解释文件扩展名、隐藏文件、This PC 入口和按扩展名修改默认打开方式的正确路径。"
category: "系统与文件"
tags:
  - "Windows"
  - "文件扩展名"
  - "隐藏文件"
  - "资源管理器"
  - "默认应用"
status: "draft"
cover: ""
originalId: "6a2d291f8a2b1c68f2cac568"
originalSlug: "windows-7c8d9756"
exportedAt: "2026-07-09T13:48:30.432Z"
---
# Windows 文件扩展名、隐藏文件与资源管理器显示设置

> 资料来源：Microsoft Support，整理时间：2026-04-12。  
> 适用范围：Windows 10 / Windows 11 的资源管理器常用设置。

[[toc]]

---

## 一、为什么这篇很重要

如果你经常折腾电脑配置，资源管理器里有 3 个开关最好尽早学会：

- 显示**文件扩展名**
- 显示**隐藏文件**
- 知道怎么按扩展名修改**默认打开方式**

因为很多配置问题，本质上都不是“文件不存在”，而是你**没看到它真实长什么样**。

---

## 二、文件扩展名到底是什么

微软在“Common file name extensions in Windows”里明确说明，Windows 文件名通常由两部分组成：

- 前半部分：文件名本身
- 后半部分：扩展名

例如：

```text
settings.json
```

其中：

- `settings` 是文件名
- `json` 是扩展名

微软的解释重点是：**扩展名用来告诉 Windows 这是什么类型的文件，以及默认用什么应用打开它。**

### 2.1 为什么扩展名对折腾配置的人特别重要

因为你需要分清这些文件到底是不是同一种东西：

| 扩展名 | 大致含义 |
| --- | --- |
| `.txt` | 纯文本 |
| `.md` | Markdown 文档 |
| `.json` | 配置/数据文件 |
| `.zip` | 压缩包 |
| `.bat` | 批处理脚本 |
| `.reg` | 注册表导入文件 |
| `.exe` | 可执行程序 |
| `.dll` | 动态链接库 |
| `.msi` | 安装包 |
| `.iso` | 镜像文件 |

如果你把扩展名隐藏了，很多文件会只剩一个“看起来差不多的名字”，特别容易判断错。

### 2.2 只改扩展名，不等于转换格式

微软官方还特别强调了一点：**改扩展名不会把文件真正转换成另一种格式。**

也就是说：

- 把 `a.txt` 改成 `a.jpg`
- 或把 `data.json` 改成 `data.exe`

都不会让文件真的变成图片或程序，只是**名字变了**。

---

## 三、怎么显示文件扩展名

微软支持页给出的路径很直接：

### Windows 11 常用路径

1. 打开文件资源管理器
2. 选择 `View`
3. 选择 `Show`
4. 勾选 `File name extensions`

### 传统选项路径

微软也保留了更传统的设置方式：

1. 打开文件资源管理器
2. 进入 `View > Options > Change folder and search options`
3. 进入 `View` 标签
4. 取消勾选 `Hide extensions for known file types`

### 3.1 建议你长期打开吗

如果你经常：

- 改配置
- 跑脚本
- 下载压缩包
- 看系统目录
- 分辨 `.bat`、`.reg`、`.json`、`.zip`

那我的建议是：**长期打开。**

---

## 四、怎么显示隐藏文件

微软支持页给出的常用路径是：

### Windows 11 常用路径

1. 打开文件资源管理器
2. 选择 `View`
3. 选择 `Show`
4. 勾选 `Hidden items`

### 传统选项路径

1. 打开文件资源管理器
2. 进入 `View > Options > Change folder and search options`
3. 进入 `View` 标签
4. 选择 `Show hidden files, folders, and drives`

### 4.1 为什么你平时看不到它们

因为像下面这些内容，本来就经常默认隐藏：

- `AppData`
- `ProgramData`
- 某些程序自己的配置目录
- 一些系统辅助文件

这也是为什么很多人第一次看到教程里写“去 `AppData` 里找配置”时，会感觉自己电脑里根本没有这个文件夹。

---

## 五、为什么资源管理器最好切到 `This PC`

微软在 File Explorer 官方说明里提到，资源管理器默认更偏 `Home / Quick access`。但如果你经常看磁盘结构，`This PC` 会更直观，因为你能直接看到：

- 各个驱动器
- 剩余空间
- `C:`、`D:` 这类入口

微软给出的修改路径是：

1. 打开文件资源管理器
2. 进入 `See more > Options`
3. 在 `Open File Explorer to` 中选择 `This PC`
4. 点击 `Apply`

### 5.1 什么人更适合 `This PC`

如果你经常做这些事：

- 看 C 盘、D 盘空间
- 找 `Program Files`
- 找 `Users`
- 手动处理下载和压缩包
- 看移动硬盘或 U 盘

那 `This PC` 往往比默认首页更顺手。

---

## 六、如果文件打不开，怎么按扩展名改默认应用

微软在“Change Default Apps in Windows”里给了官方路径：

1. 打开 `Settings`
2. 进入 `Apps > Default Apps`
3. 在搜索栏里输入文件扩展名，例如 `.txt`
4. 选择结果
5. 改成你想用的应用

### 6.1 这适合哪些场景

例如：

- 想让 `.md` 默认用某个编辑器打开
- 想让 `.txt` 默认用 VS Code 或 Notepad++
- 想让图片或 PDF 改成你更习惯的软件

### 6.2 如果根本不知道扩展名该用什么软件

微软官方建议的路径有两种：

- 右键文件，选择 `Open with > Choose another app`
- 或 `Open with > Search the Microsoft Store`

---

## 七、折腾配置时最容易踩的坑

### 7.1 误区一：文件名一样，就以为文件一样

不是。

比如：

- `config.txt`
- `config.json`
- `config.reg`

这三个文件用途完全不同。

### 7.2 误区二：双击打不开，就说明文件坏了

不一定。也可能只是**默认应用没配对**，或者你拿错程序打开了。

### 7.3 误区三：隐藏文件显示出来后就能随便改

也不对。

显示出来的意义是：

- 让你看得到
- 让你能定位
- 让你确认文件真实类型

不是鼓励你不看用途就乱删。

---

## 八、如果你经常折腾电脑，建议长期这样设置

我的建议是：

1. 资源管理器默认打开到 `This PC`
2. 长期开启“显示文件扩展名”
3. 需要看配置时临时开启“显示隐藏文件”

这样做的好处是：

- 你更容易看懂文件真实类型
- 更容易找到系统目录和用户目录
- 遇到教程写 `AppData`、`.bat`、`.reg` 时不会迷路

---

## 九、最短记忆版

1. 扩展名决定文件类型和默认打开方式
2. 改扩展名不等于改格式
3. `View > Show > File name extensions` 可以显示扩展名
4. `View > Show > Hidden items` 可以显示隐藏文件
5. 经常折腾配置的人，资源管理器更适合默认打开到 `This PC`
6. 默认打开方式去 `Settings > Apps > Default Apps` 改

---

## 参考资料

- [Microsoft Support: Common file name extensions in Windows](https://support.microsoft.com/en-au/windows/common-file-name-extensions-in-windows-da4a4430-8e76-89c5-59f7-1cdbbc75cb01)
- [Microsoft Support: File Explorer in Windows](https://support.microsoft.com/en-us/windows/finding-items-in-the-file-explorer-context-menu-2c458eb5-d27a-4b69-9301-60df221caaa0)
- [Microsoft Support: Change Default Apps in Windows](https://support.microsoft.com/en-us/windows/change-default-apps-in-windows-e5d82cad-17d1-c53b-3505-f10a32e1894d)
