---
title: "第 9 篇：Windows C 盘空间清理：Storage Sense、临时文件、Windows.old"
slug: "windows-c-storage-sense-windows-old-4fcfcbe9"
summary: "Windows C 盘空间清理手册，覆盖 Storage Sense、Temporary files、Cleanup recommendations、Windows.old 和不建议手动乱删的目录。"
category: "系统与文件"
tags:
  - "Windows"
  - "C盘清理"
  - "Storage Sense"
  - "临时文件"
  - "Windows.old"
  - "存储设置"
status: "draft"
sortOrder: 90
cover: ""
originalId: "6a2d291f8a2b1c68f2cac54c"
originalSlug: "windows-c-storage-sense-windows-old-4fcfcbe9"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 9 篇：Windows C 盘空间清理：Storage Sense、临时文件、Windows.old

> 资料来源：Microsoft Support，整理时间：2026-04-12。  
> 适用范围：Windows 10 / Windows 11 的官方清理路径。

[[toc]]

---

## 一、先说结论：清 C 盘最好先走系统自带路径

微软当前给出的主线非常明确，优先顺序基本是：

1. 看 `Storage` 设置
2. 用 `Storage Sense`
3. 看 `Temporary files` / `Cleanup recommendations`
4. 删个人大文件或移到外部存储
5. 必要时再用 `Disk Cleanup`

这比直接打开 `C:\Windows` 或 `C:\ProgramData` 看到哪个大就删，稳得多。

---

## 二、先去哪里看 C 盘占用

微软在“Storage settings in Windows”里给出的路径是：

1. 打开 `Settings`
2. 进入 `System`
3. 进入 `Storage`

这里能看到 Windows 按类别拆出来的空间占用，例如：

- `Installed apps`
- `Temporary files`
- `System & reserved`
- 其他分类

### 2.1 这一步的价值是什么

不是立刻删文件，而是先判断：

- 是应用太大
- 是临时文件太多
- 还是你自己的下载/视频/图片太大

这一步能避免“还没看明白就开删”。

---

## 三、`Storage Sense` 是什么

微软对 `Storage Sense` 的定义很直接：它可以自动帮你释放空间，典型对象包括：

- 临时文件
- 回收站内容

微软还强调了两个关键点：

### 3.1 关键点一：它默认主要作用在系统盘

官方说明里明确写到，`Storage Sense` 工作在**系统驱动器**上，也就是通常的 `C:`。

### 3.2 关键点二：默认不会随便碰你的下载文件夹

微软支持文档说明：

- 默认设置下，它会在设备空间紧张时清理不必要的临时文件
- 回收站内容会按规则清理
- `Downloads` 和 OneDrive 等云文件，不会默认乱动，除非你自己配置

这对普通用户很重要，因为很多人最怕“系统自动清理把自己文件清掉”。

---

## 四、如果你不想全靠自动清理，可以看 `Cleanup recommendations`

微软在“Free up drive space in Windows”里提到，除了 `Storage Sense`，还可以看：

```text
Settings > System > Storage > Cleanup recommendations
```

系统会按分类建议你清理内容，例如：

- `Temporary files`
- `Large or unused files`
- `Files synced to the cloud`
- `Unused apps`

### 4.1 这一步为什么实用

因为它不是让你自己在整个磁盘里盲找，而是由系统先帮你做一轮归类。

如果你是“空间不够，但又不确定从哪里下手”，这个入口通常比手动翻目录更高效。

---

## 五、`Temporary files` 能清什么

微软对 `Temporary files` 的使用路径非常明确：

1. 打开 `Settings > System > Storage`
2. 进入 `Temporary files`
3. 勾选你确认要删的内容
4. 点击 `Remove files`

这也是很多系统级可清理项的官方入口。

### 5.1 为什么它比手动删临时目录更稳

因为它是 Windows 自己识别后给出的可清理列表，而不是你凭感觉去删：

- 临时文件
- 某些缓存
- 特定系统残留

这比手动翻 `Temp`、`AppData`、`ProgramData` 去猜哪些能删要保守得多。

---

## 六、`Windows.old` 什么时候能删

微软有一篇单独的官方说明专门讲这个。

结论是：

- 如果你升级过 Windows，可能会留下 `Windows.old`
- 在升级后 **10 天内**，它关系到“回退到旧版本 Windows”的能力
- 10 天后，旧版本通常会被自动删除

如果你确认不需要回退，可以按微软给出的路径删除：

1. `Settings > System > Storage`
2. 进入 `Temporary files`
3. 勾选 `Previous version of Windows`
4. 点击 `Remove files`

### 6.1 删 `Windows.old` 前一定要想清楚什么

微软明确提醒：

- 删了之后就**不能撤销**
- 你会失去回退到旧版 Windows 的机会
- 这个操作通常需要管理员权限

所以它不是“看到大文件夹就删”的那种类型，而是“确认已经稳定使用新系统后再删”。

---

## 七、微软官方更推荐先清哪里

结合微软“Free up drive space in Windows”的顺序，我建议你优先按这个路线处理：

### 7.1 先清个人大文件

微软明确点名了几个容易出大文件的位置：

- `Videos`
- `Music`
- `Pictures`
- `Downloads`

这些通常都在你的用户目录下。

### 7.2 再处理不用的应用

看 `Installed apps` 或系统应用列表，把不常用又大的程序卸载。

### 7.3 再处理临时文件和系统建议项

这一步再用：

- `Storage Sense`
- `Temporary files`
- `Cleanup recommendations`

---

## 八、什么时候还可以用 `Disk Cleanup`

微软官方并没有把 `Disk Cleanup` 完全淘汰，而是说明：

- 如果系统没有 `Storage Sense`
- 或你更习惯传统工具

依然可以使用 `Disk Cleanup`。

官方路径是：

1. 搜索 `disk cleanup`
2. 选择驱动器
3. 选择要删的文件类型
4. 需要更多空间时可选择 `Clean up system files`

这仍然是比手动翻系统目录更稳的路径。

---

## 九、哪些目录不建议你把它们当“清理入口”

下面这句是我基于微软对目录角色的定义和官方清理路径做出的**保守推断**：

如果你的目标只是“释放 C 盘空间”，那么下面这些目录**不应该被当作第一清理入口**：

- `C:\Windows`
- `C:\Program Files`
- `C:\Program Files (x86)`
- `C:\ProgramData`
- `C:\Users\<用户名>\AppData`

原因不是“里面绝对不能删任何文件”，而是：

- 它们承担的是系统、程序本体或程序数据职责
- 微软官方给普通用户推荐的清理入口并不是“直接翻这些根目录”
- 手动误删的代价通常比清出来的空间更大

---

## 十、如果你经常报“磁盘空间不足”，该怎么养成习惯

建议固定这么做：

1. 资源管理器默认从 `This PC` 看各盘剩余空间
2. 定期看 `Settings > System > Storage`
3. 大文件优先处理 `Downloads`、视频、镜像、压缩包
4. 系统项优先走 `Temporary files`、`Storage Sense`
5. 遇到 `Windows.old` 时先确认还要不要回退系统

---

## 十一、最短记忆版

1. 清 C 盘先去 `Settings > System > Storage`
2. `Storage Sense` 主要作用在系统盘 `C:`
3. `Temporary files` 和 `Cleanup recommendations` 是官方清理主入口
4. `Windows.old` 关系到回退旧版系统，删前要想清楚
5. 个人大文件优先看 `Downloads`、视频、图片、音乐
6. 不要把 `Windows`、`Program Files`、`ProgramData`、`AppData` 根目录当成第一清理入口

---

## 参考资料

- [Microsoft Support: Storage settings in Windows](https://support.microsoft.com/en-us/windows/storage-settings-in-windows-5bc98443-0711-8038-4621-6a18ddc904f2)
- [Microsoft Support: Manage drive space with Storage Sense](https://support.microsoft.com/en-us/windows/manage-drive-space-with-storage-sense-654f6ada-7bfc-45e5-966b-e24aded96ad5)
- [Microsoft Support: Free up drive space in Windows](https://support.microsoft.com/en-us/windows/free-up-drive-space-in-windows-85529ccb-c365-490d-b548-831022bc9b32)
- [Microsoft Support: Delete your previous version of Windows](https://support.microsoft.com/en-us/windows/delete-your-previous-version-of-windows-f8b26680-e083-c710-b757-7567d69dbb74)
