---
title: "第 2 篇：Docker Desktop 汉化教程：DockerDesktop-CN、版本匹配、文件备份、替换验证、回滚"
slug: "docker-desktop-cn-localization-guide"
summary: "Windows 环境下使用 DockerDesktop-CN 对 Docker Desktop 进行汉化的完整流程，覆盖版本匹配、下载校验、文件备份、管理员权限替换、运行验证、回滚和升级维护。"
category: "Docker"
tags:
  - "Docker Desktop"
  - "DockerDesktop-CN"
  - "Windows"
  - "汉化"
  - "版本匹配"
  - "回滚"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a4a4564f9ac958d2917802c"
originalSlug: "docker-desktop-cn-localization-guide"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 2 篇：Docker Desktop 汉化教程：DockerDesktop-CN、版本匹配、文件备份、替换验证、回滚

> 本文记录 Windows 环境下 Docker Desktop 汉化的一套通用流程。重点不是某一台电脑的路径，而是讲清楚版本匹配、备份、替换、验证和回滚这些关键步骤。
> 
> 本次实操日期：2026-07-03

---

## 一、先说明：Docker Desktop 能不能官方汉化？

Docker Desktop 目前没有稳定的官方中文界面选项。

如果只是使用 Docker 命令行，`docker ps`、`docker images`、`docker run` 这些命令本身也不会变成中文，因为它们属于 CLI 命令和参数。

所以常见的汉化方式主要有两类：

1. **不修改 Docker Desktop，只自己整理中文命令笔记或 PowerShell 别名。**
2. **使用第三方汉化包替换 Docker Desktop 前端文件。**

本文讲的是第二种方式：使用第三方项目 `DockerDesktop-CN` 替换 Docker Desktop 的前端资源文件。

这类方案可以让 Docker Desktop 图形界面变成中文，但要注意：

```text
它不是 Docker 官方支持的能力。
它会修改 Docker Desktop 安装目录中的程序文件。
Docker Desktop 升级后，汉化通常会被覆盖。
汉化包版本不匹配时，可能导致 Docker Desktop 启动失败。
```

因此，整个流程最重要的原则是：

```text
版本必须匹配。
替换前必须备份。
替换后必须验证。
出问题必须能回滚。
```

## 二、准备工作

### 2.1 确认 Docker Desktop 版本

先在 PowerShell 执行：

```powershell
docker version
```

重点看 `Server` 部分：

```text
Server: Docker Desktop 4.80.0 (232116)
 Engine:
  Version: 29.6.1
  OS/Arch: linux/amd64
```

这里的关键版本是：

```text
Docker Desktop 4.80.0
```

汉化包必须找同版本，不能随便拿旧版本或新版本覆盖。

如果 Docker daemon 没有启动，也可以先打开 Docker Desktop，等它启动完成后再执行 `docker version`。

### 2.2 找到对应版本的汉化包

本次使用的第三方项目：

```text
https://github.com/asxez/DockerDesktop-CN
```

进入 Releases 页面，找到和本机 Docker Desktop 一致的版本。

本次实操版本：

```text
Docker Desktop：4.80.0
汉化包版本：4.80.0
```

Windows x86 环境下载：

```text
https://github.com/asxez/DockerDesktop-CN/releases/download/4.80.0/app-Windows-x86.zip
```

这里的 `Windows-x86` 是第三方项目 Release 里的包名，实际使用时以项目 Releases 中与你系统架构对应的文件为准。普通 64 位 Windows 电脑通常选择 Windows x86 包；ARM 设备则应选择 Windows arm 包。

如果你的 Docker Desktop 是其他版本，就把上面的 `4.80.0` 换成你自己的版本号，并确认 Releases 中确实存在对应文件。

## 三、下载并校验汉化包

可以新建一个临时目录保存汉化包，例如：

```powershell
$work = Join-Path $env:USERPROFILE 'Downloads\DockerDesktop-CN-4.80.0'
New-Item -ItemType Directory -Force -Path $work | Out-Null
```

下载汉化包：

```powershell
$url = 'https://github.com/asxez/DockerDesktop-CN/releases/download/4.80.0/app-Windows-x86.zip'
$zip = Join-Path $work 'app-Windows-x86.zip'
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
```

查看文件大小和哈希：

```powershell
Get-Item $zip | Select-Object FullName,Length,LastWriteTime
Get-FileHash $zip -Algorithm SHA256
```

本次实操下载结果：

```text
文件：app-Windows-x86.zip
大小：113302429
SHA256：D77D1BFC1E8BDB11F7A91E866A5119E3ECA42D2AC02ED76418B7B12FE5060C3B
```

哈希值不是必须和本文一样，因为后续项目发布可能会变化。这里记录它的意义是：确认你后续回看时知道当时下载的是哪一个包。

## 四、检查压缩包内容

替换前先看压缩包里有什么，不要下载完就直接覆盖。

执行：

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($zip)
$archive.Entries | Select-Object -First 30 FullName,Length
$archive.Dispose()
```

以 Docker Desktop 4.80.0 的 Windows 汉化包为例，里面应该能看到：

```text
Docker Desktop.exe
app.asar
app.asar.unpacked/
```

这三个是后面要替换的核心目标。

## 五、理解要替换哪些文件

Docker Desktop 的前端界面是 Electron 应用，界面资源主要在 `frontend` 目录里。

Windows 默认安装目录通常是：

```text
C:\Program Files\Docker\Docker
```

需要替换的目标一般是：

```text
C:\Program Files\Docker\Docker\frontend\Docker Desktop.exe
C:\Program Files\Docker\Docker\frontend\resources\app.asar
C:\Program Files\Docker\Docker\frontend\resources\app.asar.unpacked
```

注意：

```text
Docker Desktop 4.74 及以上版本，只替换 app.asar 通常不够。
需要同时替换 Docker Desktop.exe、app.asar、app.asar.unpacked。
```

如果你的 Docker Desktop 安装路径不是默认路径，需要根据实际安装目录调整。

## 六、替换前先备份

替换前必须备份原始文件。建议备份到下载目录下，并带上时间戳。

示例：

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $work "backup-$stamp"
$frontend = 'C:\Program Files\Docker\Docker\frontend'
$resources = Join-Path $frontend 'resources'

New-Item -ItemType Directory -Path $backup -Force | Out-Null

Copy-Item -LiteralPath (Join-Path $frontend 'Docker Desktop.exe') -Destination (Join-Path $backup 'Docker Desktop.exe') -Force
Copy-Item -LiteralPath (Join-Path $resources 'app.asar') -Destination (Join-Path $backup 'app.asar') -Force
Copy-Item -LiteralPath (Join-Path $resources 'app.asar.unpacked') -Destination (Join-Path $backup 'app.asar.unpacked') -Recurse -Force
```

备份完成后，你应该得到：

```text
backup-时间戳/
  Docker Desktop.exe
  app.asar
  app.asar.unpacked/
```

这一步很关键。后续如果汉化失败，就是靠这个目录恢复。

## 七、用管理员权限替换文件

`C:\Program Files` 是系统保护目录，普通 PowerShell 直接复制通常会失败，提示没有权限。

正确做法是：

```text
关闭 Docker Desktop。
用管理员权限打开 PowerShell。
停止残留的 Docker Desktop 相关进程。
再替换文件。
```

### 7.1 解压汉化包

```powershell
$extract = Join-Path $work 'extract'
Remove-Item -LiteralPath $extract -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $extract -Force | Out-Null
Expand-Archive -LiteralPath $zip -DestinationPath $extract -Force
```

确认解压后的文件存在：

```powershell
Test-Path (Join-Path $extract 'Docker Desktop.exe')
Test-Path (Join-Path $extract 'app.asar')
Test-Path (Join-Path $extract 'app.asar.unpacked')
```

三个结果都应该是：

```text
True
```

### 7.2 停止 Docker Desktop 相关进程

```powershell
Get-Process | Where-Object {
  $_.ProcessName -like '*Docker*' -or $_.ProcessName -like 'com.docker*'
} | Stop-Process -Force -ErrorAction SilentlyContinue
```

这一步只是关闭 Docker Desktop 相关进程，不会删除镜像、容器和数据卷。

如果电脑上还有其他名称中包含 Docker 的辅助工具，执行前可以先只运行 `Get-Process | Where-Object { $_.ProcessName -like '*Docker*' -or $_.ProcessName -like 'com.docker*' }` 看一眼进程列表，确认没有误关无关程序。

### 7.3 替换目标文件

```powershell
$frontend = 'C:\Program Files\Docker\Docker\frontend'
$resources = Join-Path $frontend 'resources'
$targetUnpacked = Join-Path $resources 'app.asar.unpacked'

Copy-Item -LiteralPath (Join-Path $extract 'Docker Desktop.exe') -Destination (Join-Path $frontend 'Docker Desktop.exe') -Force
Copy-Item -LiteralPath (Join-Path $extract 'app.asar') -Destination (Join-Path $resources 'app.asar') -Force

Remove-Item -LiteralPath $targetUnpacked -Recurse -Force
Copy-Item -LiteralPath (Join-Path $extract 'app.asar.unpacked') -Destination $targetUnpacked -Recurse -Force
```

替换完成后可以记录一下新文件哈希：

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath `
  (Join-Path $frontend 'Docker Desktop.exe'), `
  (Join-Path $resources 'app.asar')
```

本次实操替换后的哈希：

```text
E929FEC237D3D1D87AD0B326B1FC44B480BAD2D7872BA5D5F440D4DEDF2ED259  Docker Desktop.exe
EBD42B0200C185193E1CB7DC9E1746E086E2E739233F2A2E13955613668895A2  app.asar
```

## 八、重新启动 Docker Desktop

替换完成后启动 Docker Desktop：

```powershell
Start-Process -FilePath 'C:\Program Files\Docker\Docker\frontend\Docker Desktop.exe'
```

等待 Docker Desktop 完成初始化后，再验证命令行。

## 九、验证 Docker 是否仍然正常

汉化界面能打开不代表 Docker 一定正常，还要验证 Docker daemon 和容器运行链路。

### 9.1 验证 Docker 版本

```powershell
docker version
```

正常时应该能看到 Client 和 Server 两部分，例如：

```text
Client:
 Version: 29.6.1
 Context: desktop-linux

Server: Docker Desktop 4.80.0 (232116)
 Engine:
  Version: 29.6.1
  OS/Arch: linux/amd64
```

如果只有 Client，没有 Server，通常说明 Docker Desktop 后端没有启动成功。

### 9.2 验证容器运行

```powershell
docker run --rm hello-world
```

成功时会输出：

```text
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

这说明以下链路都正常：

```text
Docker CLI 能连接 Docker daemon。
Docker daemon 能拉取镜像。
Docker daemon 能创建并运行容器。
容器日志能返回到终端。
```

## 十、回滚方式

如果汉化后 Docker Desktop 无法启动，或者 Docker daemon 无法正常响应，就用备份文件回滚。

先关闭 Docker Desktop：

```powershell
Get-Process | Where-Object {
  $_.ProcessName -like '*Docker*' -or $_.ProcessName -like 'com.docker*'
} | Stop-Process -Force -ErrorAction SilentlyContinue
```

再以管理员 PowerShell 执行：

```powershell
$backup = '你的备份目录'
$frontend = 'C:\Program Files\Docker\Docker\frontend'
$resources = Join-Path $frontend 'resources'

Copy-Item -LiteralPath (Join-Path $backup 'Docker Desktop.exe') -Destination (Join-Path $frontend 'Docker Desktop.exe') -Force
Copy-Item -LiteralPath (Join-Path $backup 'app.asar') -Destination (Join-Path $resources 'app.asar') -Force

Remove-Item -LiteralPath (Join-Path $resources 'app.asar.unpacked') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $backup 'app.asar.unpacked') -Destination (Join-Path $resources 'app.asar.unpacked') -Recurse -Force
```

然后重新启动 Docker Desktop：

```powershell
Start-Process -FilePath (Join-Path $frontend 'Docker Desktop.exe')
```

最后重新验证：

```powershell
docker version
docker run --rm hello-world
```

## 十一、升级后的维护方式

Docker Desktop 自动升级后，汉化通常会被覆盖。

升级后按这个顺序处理：

```text
1. 先确认新的 Docker Desktop 版本号。
2. 到 DockerDesktop-CN Releases 中查找相同版本汉化包。
3. 如果没有对应版本，不要用旧版汉化包强行覆盖。
4. 下载新版本汉化包。
5. 重新备份当前版本的原始文件。
6. 再替换新版本汉化文件。
7. 最后执行 docker version 和 docker run --rm hello-world 验证。
```

不要跨版本替换的原因很简单：

```text
Docker Desktop.exe、app.asar、app.asar.unpacked 是一组配套文件。
版本不一致时，界面可能打不开，也可能能打开但部分功能异常。
```

## 十二、本次实操结果

本次实操环境：

```text
Docker Desktop：4.80.0 (232116)
Docker Engine：29.6.1
Docker CLI：29.6.1
系统：Windows
```

本次替换文件：

```text
C:\Program Files\Docker\Docker\frontend\Docker Desktop.exe
C:\Program Files\Docker\Docker\frontend\resources\app.asar
C:\Program Files\Docker\Docker\frontend\resources\app.asar.unpacked
```

本次备份目录：

```text
C:\Users\Administrator\Downloads\DockerDesktop-CN-4.80.0\backup-admin-20260703-164457
```

本次验证结果：

```text
docker version：正常返回 Client 和 Server 信息。
docker run --rm hello-world：成功输出 Hello from Docker。
```

结论：

```text
Docker Desktop 汉化成功。
Docker CLI、Docker daemon、镜像拉取、容器创建和容器运行链路均正常。
```

## 十三、总结

Docker Desktop 汉化的核心不是“复制几个文件”这么简单，而是要按工程化流程处理：

```text
确认版本
下载对应汉化包
校验压缩包内容
备份原文件
管理员权限替换
重新启动 Docker Desktop
验证 Docker 后端和容器运行
保留回滚方案
```

只要做到版本匹配和备份可回滚，这类汉化操作的风险就可控。反过来，如果不看版本、不备份、直接覆盖安装目录，一旦 Docker Desktop 启动失败，排查成本会很高。
