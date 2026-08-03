---
title: "第 3 篇：Windows hosts、DNS 缓存、网络类型与防火墙基础"
slug: "windows-hosts-dns-a34c6e09"
summary: "Windows 网络排障基础，整理 hosts 文件、DNS 缓存、公共/专用网络类型、Microsoft Defender Firewall 的作用和常见排障点。"
category: "网络基础"
categoryPath:
  - "电脑"
  - "电脑网络"
  - "网络基础"
tags:
  - "Windows"
  - "hosts"
  - "DNS缓存"
  - "防火墙"
  - "网络类型"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac51a"
originalSlug: "windows-hosts-dns-a34c6e09"
originalStatus: "published"
publishedAt: "2026-04-12T13:45:49.794Z"
updatedAt: "2026-07-31T11:16:21.572Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 3 篇：Windows hosts、DNS 缓存、网络类型与防火墙基础

> 资料来源：Microsoft Support、Microsoft Learn，整理时间：2026-04-12。  
> 适用范围：Windows 10 / Windows 11。

有些网络问题不是“没网”，而是：

- 域名被 `hosts` 改写了
- DNS 缓存还记着旧结果
- 网络被当成公共网络
- 防火墙规则把连接拦了

这些东西平时不一定常看，但一旦出问题，现象会很像“网站坏了”“局域网突然看不到了”。

[[toc]]

---

## 一、先记结论

### 1.1 `hosts` 的优先级很高

微软在 Hosts File Editor 文档里明确写到：访问网站时，系统会先检查本地 `hosts` 文件，再去查 DNS。  
所以只要 `hosts` 写了错误映射，DNS 再正常也可能被覆盖。

### 1.2 `ipconfig /flushdns` 不是万能修复，但很适合处理解析缓存问题

微软的 Wi-Fi 故障排查文档把它列进了常用网络修复命令。  
它适合处理：

- 域名解析缓存过旧
- 你刚改了 DNS 或 `hosts`
- 某些网站解析结果异常

### 1.3 公共网络和专用网络，不只是名字不同

微软支持文档说明：

- 公共网络更保守，设备对外更隐藏
- 专用网络更适合你信任的家庭或办公局域网

### 1.4 防火墙不是“能关就关”的障碍物

微软支持文档把防火墙的职责定义得很直接：  
它通过过滤网络流量、阻止未授权访问来降低网络安全风险。

---

## 二、`hosts` 文件是什么

你可以把 `hosts` 理解成：**本机优先使用的一份域名到 IP 的静态对照表。**

微软 Learn 对它的描述是：

- Windows 有一个本地 `hosts` 文件
- 里面保存域名和对应 IP
- 系统访问网站时会先检查它

这意味着：

- `hosts` 可以临时指定某个域名走哪个 IP
- 也可能因为旧条目、错误条目、代理软件残留而导致解析异常

---

## 三、`hosts` 文件通常在哪里

微软文档给出的默认位置是：

```text
%SystemRoot%\System32\drivers\etc
```

也就是常见的：

```text
C:\Windows\System32\drivers\etc\hosts
```

编辑它时要注意两件事：

1. 一般需要管理员权限
2. 改之前最好先备份

微软 PowerToys 的 Hosts File Editor 也默认会先做备份。

---

## 四、什么时候该怀疑 `hosts`

### 4.1 某个网站总是打不开，只有你这台机器不正常

尤其是：

- 别的设备正常
- 手机热点下也不对
- 只有这个域名异常

### 4.2 明明换了 DNS，但解析结果还是老的

这时既要看 DNS 缓存，也要看 `hosts` 有没有强制写死。

### 4.3 装过代理、抓包、开发调试工具

一些工具会：

- 临时改 `hosts`
- 提示你手动写映射
- 留下没清干净的本地解析记录

---

## 五、DNS 缓存是什么

Windows 会缓存一部分域名解析结果，目的是减少重复查询，提高访问效率。  
但副作用就是：当记录过期、错误、被污染，或者你刚改完解析环境时，旧结果可能还留着。

这时常见处理动作就是：

```powershell
ipconfig /flushdns
```

微软支持文档把它放在网络修复命令序列里，和 `release`、`renew`、`netsh` 重置一起使用。

---

## 六、什么时候适合清 DNS 缓存

可以优先考虑这些场景：

- 你刚修改了 `hosts`
- 你刚切换 DNS 服务器
- 某个域名指向明显不对
- 某个网站在别的设备正常，这台电脑一直打不开
- 站点已迁移，但你的电脑还指向旧地址

但要注意：

如果问题是：

- 网卡断了
- DHCP 没发地址
- 默认网关错误
- 防火墙规则阻止

那单独 `flushdns` 不会真正解决根因。

---

## 七、公共网络和专用网络怎么理解

微软支持文档把网络类型大致分成两种常见场景：

### 7.1 公共网络

适合：

- 咖啡店 Wi-Fi
- 商场、机场、酒店网络
- 你不信任的共享网络

特点：

- 更保守
- 电脑对其他设备更不可见
- 不适合开放文件和打印机共享

### 7.2 专用网络

适合：

- 家里路由器
- 你信任的小型办公网络
- 需要设备互相发现的局域网

特点：

- 设备更容易被同网段发现
- 适合文件共享、打印机共享这类需求

微软在网络设置文档里还提到：在 Windows 11 中，初次连接网络时，默认通常会设成公共网络，这是推荐的更保守策略。

---

## 八、网络类型在哪里改

微软推荐的常见路径是：

```text
设置 > 网络和 Internet > Wi-Fi / 以太网 > 当前连接 > 网络配置文件类型
```

如果你遇到这些问题，可以先检查是不是网络类型不合适：

- 共享打印机发现不了
- 局域网共享看不到
- 网络重置后设备突然互相不可见

---

## 九、Microsoft Defender Firewall 在做什么

微软支持文档里把它的作用概括为：

- 过滤网络流量
- 阻止未授权访问
- 根据网络类型应用不同规则

你可以把它理解成：

**“Windows 内置的网络守门员。”**

它不是只拦“外网”，也可能影响：

- 局域网共享
- 某些程序监听端口
- 开发工具本地服务访问
- 远程桌面或文件共享

---

## 十、防火墙和网络类型为什么要一起看

因为微软的防火墙界面本来就是按网络配置文件管理的：

- Domain
- Private
- Public

这意味着同一个程序或功能，可能在专用网络能用，在公共网络就被拦。  
所以遇到问题时，不要只盯着“程序是不是坏了”，也要看：

1. 当前网络是公共还是专用
2. 防火墙是否对当前配置文件启用了更严格规则

---

## 十一、最常见的排障思路

### 11.1 网站只在这台电脑打不开

先查：

1. `hosts`
2. DNS 缓存
3. 浏览器代理
4. 防火墙或安全软件

### 11.2 局域网共享突然失效

先查：

1. 网络是不是被重置成公共网络
2. 防火墙是否拦截相关共享规则
3. 电脑是否还在同一局域网

### 11.3 开发调试环境访问错地址

先查：

1. `hosts` 是否还保留旧映射
2. 是否刚迁站或改 DNS
3. 刷新 DNS 缓存后是否恢复

---

## 十二、一个安全做法

如果你确实要改 `hosts`，建议按这个顺序：

1. 先备份原文件
2. 用管理员权限编辑
3. 只加你明确知道作用的条目
4. 改完马上注明用途
5. 测试完成后及时删掉临时条目

如果只是偶尔需要改，不想手动操作，也可以考虑微软提供的 PowerToys Hosts File Editor。

---

## 十三、最短记忆版

1. `hosts` 会先于 DNS 生效
2. `hosts` 默认在 `%SystemRoot%\\System32\\drivers\\etc`
3. 改完 `hosts` 或 DNS 后，必要时可执行 `ipconfig /flushdns`
4. 公共网络更保守，专用网络更适合共享
5. 防火墙规则和网络类型是联动的

---

## 十四、配套阅读

- [Windows IP地址、DNS、网关、DHCP、私网公网速查](./Windows%20IP地址、DNS、网关、DHCP、私网公网速查.md)
- [代理网络问题处理指南](../代理与VPN/代理网络问题处理指南.md)
- [电脑WIFI图标消失修复](../网络排障/电脑WIFI图标消失修复.md)

---

## 参考资料

- [Microsoft Learn: Hosts File Editor utility](https://learn.microsoft.com/en-us/windows/powertoys/hosts-file-editor)
- [Microsoft Support: Essential Network Settings and Tasks in Windows](https://support.microsoft.com/en-us/windows/essential-network-settings-and-tasks-in-windows-f21a9bbc-c582-55cd-35e0-73431160a1b9)
- [Microsoft Support: Fix Wi-Fi connection issues in Windows](https://support.microsoft.com/en-us/windows/wi-fi-connection-icons-and-what-they-mean-in-windows-35f58c75-bd23-4b8b-dd1a-009fe53f86b3)
- [Microsoft Support: Firewall and network protection in the Windows Security app](https://support.microsoft.com/en-us/windows/firewall-and-network-protection-in-the-windows-security-app-ec0844f7-aebd-0583-67fe-601ecf5d774f)
- [Microsoft Learn: Windows Firewall tools](https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/tools)
