---
title: "Windows 用户目录、Public、AppData、ProgramData 详解"
slug: "windows-public-appdata-programdata-d717719e-revision-20260709"
summary: "结合微软官方文档系统梳理 Windows 的用户目录体系，重点解释 Users、Public、AppData、ProgramData 的边界、典型用途和清理时最容易踩的坑。"
category: "系统与文件"
tags:
  - "Windows"
  - "Users"
  - "Public"
  - "AppData"
  - "ProgramData"
  - "用户目录"
status: "draft"
cover: ""
originalId: "6a2d291f8a2b1c68f2cac570"
originalSlug: "windows-public-appdata-programdata-d717719e"
exportedAt: "2026-07-09T13:48:30.432Z"
---
# Windows 用户目录、Public、AppData、ProgramData 详解

> 资料来源：Microsoft Learn、Microsoft Support，整理时间：2026-04-12。  
> 适用范围：默认安装方式的 Windows 10 / Windows 11。

[[toc]]

---

## 一、先记住最核心的划分

如果只记一句话，可以先记这个：

- `Users`：**每个账号自己的资料**
- `Public`：**这台电脑上所有账号都能访问的共享资料**
- `AppData`：**某个账号自己的应用数据**
- `ProgramData`：**整台电脑所有账号共享的应用数据**

也就是说，真正容易混淆的不是“这些文件夹在哪”，而是“它们到底是给谁用的”。

---

## 二、`C:\Users` 到底是什么

微软在 `KNOWNFOLDERID` 文档里把用户配置文件目录定义为 `FOLDERID_Profile`，默认路径就是：

```text
%SystemDrive%\Users\<用户名>
```

你可以把它理解成“**这个用户的个人地盘**”。最常见的内容包括：

- `Desktop`
- `Documents`
- `Downloads`
- `Pictures`
- `Music`
- `Videos`
- `AppData`

这些目录里放的东西，大多都和“当前登录用户自己”有关。

### 2.1 为什么很多 C 盘空间最后都涨在这里

微软在“释放驱动器空间”文档里也明确提示，个人文件通常最容易出现在这些位置：

- `Videos`
- `Music`
- `Pictures`
- `Downloads`

所以如果你是想清理空间，第一反应不应该是去碰 `Windows` 或 `Program Files`，而应该先看看自己的用户目录里是不是塞了大文件。

---

## 三、`C:\Users\Public` 是什么

微软同样把公共用户目录定义成了独立的已知文件夹 `FOLDERID_Public`，默认路径是：

```text
%SystemDrive%\Users\Public
```

这个目录最适合这样理解：

- `Users\<你的用户名>`：更像“你的私人柜子”
- `Users\Public`：更像“所有人共用的公共柜子”

### 3.1 `Public` 里通常会有什么

微软文档列出了很多公共目录的已知文件夹，例如：

- `Public Desktop`
- `Public Documents`
- `Public Downloads`
- `Public Music`
- `Public Pictures`
- `Public Videos`

所以你在 `C:\Users\Public` 下面，通常会看到一整组“公共版”的桌面、文档、图片、视频等目录。

### 3.2 什么时候会用到 `Public`

比较典型的场景有：

- 希望这台电脑上的多个本地账户都能看到同一批资料
- 某些程序给所有用户放置公共快捷方式或公共资源
- 局域网共享或多用户共用机器时，需要有一个中间共享位置

### 3.3 `Public` 不等于“可以随便删”

`Public` 不是系统核心目录，但也不代表可以不看内容就清空。因为有些程序会把快捷方式、共享模板或公共资源放在这里。更稳的做法是：

- 先看具体文件属于谁
- 先删你明确认识的公共文件
- 不要整目录一把清空

---

## 四、`AppData`：为什么很多软件配置都藏在这里

微软文档把用户应用数据拆成了多个已知文件夹，最常见的是：

- `FOLDERID_RoamingAppData`
- `FOLDERID_LocalAppData`
- `FOLDERID_LocalAppDataLow`

它们都位于当前用户目录下的：

```text
C:\Users\<用户名>\AppData
```

这个目录默认经常是隐藏的，所以很多人平时根本没注意过它。

### 4.1 `Roaming`

默认路径：

```text
%USERPROFILE%\AppData\Roaming
```

更适合理解成：

- 用户偏好
- 应用配置
- 账户环境
- 更偏“跟着用户走”的数据

如果一个程序更在意“这个人的配置”，那它更可能把内容放在 `Roaming`。

### 4.2 `Local`

默认路径：

```text
%USERPROFILE%\AppData\Local
```

更适合理解成：

- 本机缓存
- 临时文件
- 只在当前这台电脑有效的数据
- 程序本地资源

很多应用缓存、安装到当前用户的程序、日志文件都会出现在这里。

### 4.3 `LocalLow`

默认路径：

```text
%USERPROFILE%\AppData\LocalLow
```

这个目录平时普通用户接触不多，但微软也把它作为独立的已知文件夹维护。它常见于：

- 受限权限环境
- 某些浏览器或沙箱化应用
- 安全上下文更低的程序数据

普通理解上，你可以先把它看作“比 `Local` 更偏受限环境”的应用数据位置。

### 4.4 为什么有些软件装在 `AppData\Local\Programs`

微软文档还定义了 `FOLDERID_UserProgramFiles`，默认路径是：

```text
%LOCALAPPDATA%\Programs
```

这意味着：

- 不是所有程序都装在 `C:\Program Files`
- 有些软件会按“当前用户安装”的方式，直接装在 `AppData\Local\Programs`

这种程序通常不要求管理员权限，更偏个人使用。

---

## 五、`ProgramData`：为什么它和 `AppData` 不是一回事

微软把 `ProgramData` 定义为 `FOLDERID_ProgramData`，默认路径是：

```text
%SystemDrive%\ProgramData
```

它跟 `AppData` 的核心区别，不在于“长得像不像配置目录”，而在于**作用对象不同**：

| 目录 | 更偏给谁用 |
| --- | --- |
| `AppData` | 当前用户 |
| `ProgramData` | 所有用户 |

### 5.1 `ProgramData` 里常见什么

根据微软对该目录的定义和常见程序实践，这里经常会出现：

- 所有用户共用的程序配置
- 更新器下载的数据
- 软件共享缓存
- 授权、激活或公共模板

### 5.2 为什么它也经常是隐藏的

因为这个目录更偏系统级、程序级共享数据，不是普通用户每天手动整理的地方。所以默认隐藏是很正常的。

---

## 六、四个目录放在一起怎么分

如果你经常折腾配置，最值得记住的是这张表：

| 目录 | 核心定位 | 你最常见的操作 |
| --- | --- | --- |
| `C:\Users\<用户名>` | 当前用户的个人资料 | 找下载、桌面、大文件、个人文档 |
| `C:\Users\Public` | 全机共享资料 | 放所有账户都要看的文件 |
| `C:\Users\<用户名>\AppData` | 当前用户的应用数据 | 找配置、缓存、日志、用户级程序 |
| `C:\ProgramData` | 所有用户共享的应用数据 | 找共享配置、更新缓存、公共模板 |

---

## 七、最容易踩的几个坑

### 7.1 误区一：`AppData` 里东西多，就整目录删

不建议。

因为这里面往往混着：

- 浏览器缓存
- 登录状态
- 软件配置
- 本地数据库
- 插件数据

你直接整目录删，很可能把程序“删坏”。

### 7.2 误区二：`ProgramData` 没显示出来，所以不重要

不是。它只是默认隐藏。微软文档把它定义成所有用户共享的程序数据目录，本身就是系统和软件生态里非常重要的一层。

### 7.3 误区三：`Public` 就等于没用

也不是。它只是使用频率比个人目录低，但在多用户电脑、共享资料、公共快捷方式这些场景里仍然有价值。

---

## 八、如果你要清空间，优先顺序怎么排

结合微软官方对这些目录的角色定义，一个更稳的顺序是：

1. 先看 `Downloads`、桌面、视频、图片这些个人大文件
2. 再通过“设置 > 应用”处理占空间大的程序
3. 再通过系统的存储清理功能处理临时文件
4. 最后才去按需清理某些程序自己的缓存目录

这里最后一步的前提是：**你明确知道那个目录属于哪个程序，而且知道删掉会发生什么。**

---

## 九、最短记忆版

1. `Users` 是“某个用户自己的内容”
2. `Public` 是“所有用户共享的内容”
3. `AppData` 是“某个用户自己的应用数据”
4. `ProgramData` 是“所有用户共享的应用数据”
5. `Local` 更偏本机缓存，`Roaming` 更偏用户配置
6. 很多软件配置问题，最后都要回到 `AppData` 或 `ProgramData`

---

## 参考资料

- [Microsoft Learn: KNOWNFOLDERID](https://learn.microsoft.com/en-us/windows/win32/shell/knownfolderid)
- [Microsoft Support: File Explorer in Windows](https://support.microsoft.com/en-us/windows/finding-items-in-the-file-explorer-context-menu-2c458eb5-d27a-4b69-9301-60df221caaa0)
- [Microsoft Support: Free up drive space in Windows](https://support.microsoft.com/en-us/windows/free-up-drive-space-in-windows-85529ccb-c365-490d-b548-831022bc9b32)
