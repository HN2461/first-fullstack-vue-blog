---
title: "Windows IP地址、DNS、网关、DHCP、私网公网速查"
slug: "windows-ip-dns-dhcp-fd5c357b"
summary: "结合微软官方网络设置文档整理 Windows 里最常见的 IP、DNS、网关、DHCP、私网公网概念，帮助快速看懂本机网络属性和常见联网问题。"
category: "网络基础"
tags:
  - "Windows"
  - "网络"
  - "IP地址"
  - "DNS"
  - "DHCP"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac524"
originalSlug: "windows-ip-dns-dhcp-fd5c357b"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# Windows IP地址、DNS、网关、DHCP、私网公网速查

> 资料来源：Microsoft Support、Microsoft Learn，整理时间：2026-04-12。  
> 适用范围：Windows 10 / Windows 11。

很多电脑网络问题，本质上都绕不开这几个词：

- IP 地址
- 子网掩码
- 默认网关
- DNS
- DHCP
- 私网 / 公网

如果这些词只记了个大概，排障时就很容易乱。

[[toc]]

---

## 一、先记结论

### 1.1 对大多数家庭电脑来说，IP 和 DNS 都建议先用自动

微软在网络设置文档里明确把 `Automatic (DHCP)` 作为推荐方式。  
也就是说，普通家庭或办公 Wi-Fi 下，大多数设备不需要手动写 IP 和 DNS。

### 1.2 看到 `169.254.x.x`，优先怀疑 DHCP 没分配成功

微软 Learn 里把这类情况解释为 APIPA，也就是自动私有 IP 地址。  
常见含义是：你的电脑没从 DHCP 那里正常拿到地址。

### 1.3 访问网站失败时，IP 正常不代表 DNS 正常

你可能：

- 能连上路由器
- 能拿到本地 IP
- 但域名解析失败

这时问题点往往已经从“连没连上网”转到“DNS 是否正常”了。

---

## 二、这些概念分别是什么意思

### 2.1 IP 地址

IP 地址可以先理解成：**你这台设备在网络里的编号。**

在 Windows 设置里，你最常见看到的是：

- `IPv4 address`
- 有时也会看到 `IPv6`

对大多数家庭网络来说，最常打交道的是 IPv4。

### 2.2 子网掩码

它用来告诉系统：  
“哪些地址算同一个局域网里的邻居，哪些地址要交给路由器去转发。”

在手动设置 IPv4 时，Windows 也会要求你一起填写子网掩码。

### 2.3 默认网关

可以把它理解成：**你这台电脑要出这个局域网时，默认先找谁。**

这个“谁”通常就是：

- 家用路由器
- 公司网络出口设备
- 某个上级三层设备

如果默认网关写错，局域网里也许还能看到一部分设备，但外网往往上不去。

### 2.4 DNS

DNS 的作用是：**把域名翻译成 IP 地址。**

例如你输入一个网站域名时，系统通常先要做域名解析。  
DNS 出问题时，常见现象就是：

- 某些网站打不开
- `ping` IP 能通，但域名不通
- 浏览器报 DNS 解析类错误

### 2.5 DHCP

DHCP 是动态主机配置协议。  
微软的网络设置文档建议大多数用户使用自动分配，也就是由路由器或接入点自动给你发：

- IP 地址
- DNS 服务器地址
- 相关网络参数

对普通用户来说，你可以把 DHCP 理解成：

**“让网络自己给你发配置，别手填。”**

### 2.6 私网 / 公网

结合 Windows 日常使用场景，可以先这样记：

- 私网 IP：你在家里、公司、宿舍局域网内部拿到的地址
- 公网 IP：外部互联网看到的出口地址

这里是基于微软对本机 IP 设置、DHCP 分配和网络连接模型的整理推导。  
对大多数家庭网络而言，电脑通常拿到的是私网地址，对外上网则共用路由器侧的公网出口地址。

---

## 三、在 Windows 里去哪里看这些信息

### 3.1 设置里看

微软支持文档推荐的入口是：

```text
设置 > 网络和 Internet > Wi-Fi / 以太网 > 当前连接 > 属性
```

这里一般可以看到：

- IPv4 地址
- DNS 服务器
- 网络配置方式
- 网络配置的一些基础属性

### 3.2 命令行里看

最常用的是：

```powershell
ipconfig /all
```

你会看到：

- IPv4 地址
- 子网掩码
- 默认网关
- DHCP 是否启用
- DNS 服务器

如果只是快速确认当前网络状态，这条命令很实用。

---

## 四、自动和手动，应该怎么选

### 4.1 自动（DHCP）

微软推荐优先用自动。  
适合：

- 家用路由器
- 手机热点
- 普通公司办公网
- 你不确定网络参数时

优点：

- 换网络时更省心
- 少出错
- DNS 也一起自动下发

### 4.2 手动

只有在你明确知道网络要求时再手动写，例如：

- 固定 IP 的打印机或 NAS 环境
- 某些公司内网
- 特定测试网络
- 你明确需要自定义 DNS

手动配置时，至少要确认下面 4 项别写错：

- IP 地址
- 子网掩码
- 默认网关
- DNS 服务器

只要其中一项不匹配，就可能出现“明明连着网，但就是不通”的情况。

---

## 五、最常见的判断方法

### 5.1 本机地址像正常局域网地址，通常说明已经拿到局域网配置

如果 `ipconfig /all` 里能看到：

- 正常的 IPv4 地址
- 默认网关
- DNS 服务器

说明至少“从网卡到局域网这一段”大概率是通的。

### 5.2 本机地址是 `169.254.x.x`

优先怀疑：

- DHCP 没回应
- 路由器有问题
- 网线 / Wi-Fi 链路异常
- 网络适配器状态异常

微软关于 APIPA 的文档说明，这通常是设备没拿到 DHCP 地址后自动分配出的地址。

### 5.3 域名打不开，但 IP 访问还行

优先看：

- DNS 是否写错
- DNS 服务器是否不可达
- DNS 缓存是否异常
- 是否被 `hosts` 覆盖

### 5.4 局域网能通，公网不通

优先看：

- 默认网关
- 路由器出口
- ISP 是否异常
- 防火墙 / 代理 / 公司策略

---

## 六、一个实用排障顺序

当你遇到“电脑连不上网”时，可以按这个顺序想：

1. 网卡和 Wi-Fi 是否正常连接
2. 本机有没有拿到 IPv4 地址
3. 有没有默认网关
4. DNS 服务器有没有
5. 域名失败是所有网站都失败，还是个别网站失败
6. 是本机问题，还是路由器 / 公司网络问题

一个常用命令组合：

```powershell
ipconfig /all
ping 192.168.1.1
nslookup www.microsoft.com
```

说明：

- 第二条里的地址要换成你自己的默认网关
- 如果网关能通、`nslookup` 异常，问题通常偏 DNS

---

## 七、几个容易混淆的点

### 7.1 “有 IP”不等于“能上网”

你可能只是拿到了局域网地址。  
是否能访问互联网，还要看网关、DNS 和出口是否正常。

### 7.2 改 DNS 不会替你修好所有网络问题

如果根本没拿到 IP、网卡断了、默认网关错了，单改 DNS 没用。

### 7.3 手动写固定 IP 很容易写出冲突

微软在 DHCP 范围和排障文档里也强调了地址规划和保留的必要性。  
如果你手填的地址和别的设备撞了，会出现间歇性断网、设备不可达等问题。

---

## 八、最短记忆版

1. IP 是设备编号
2. 子网掩码决定“谁算同网段”
3. 默认网关决定“出局域网先找谁”
4. DNS 负责把域名翻译成 IP
5. DHCP 负责自动发 IP 和 DNS，普通用户建议优先自动
6. `169.254.x.x` 通常表示 DHCP 分配失败

---

## 九、配套阅读

- [Windows hosts、DNS缓存、网络类型与防火墙基础](./Windows%20hosts、DNS缓存、网络类型与防火墙基础.md)
- [电脑WIFI图标消失修复](../网络排障/电脑WIFI图标消失修复.md)
- [代理网络问题处理指南](../代理与VPN/代理网络问题处理指南.md)

---

## 参考资料

- [Microsoft Support: Essential Network Settings and Tasks in Windows](https://support.microsoft.com/en-us/windows/essential-network-settings-and-tasks-in-windows-f21a9bbc-c582-55cd-35e0-73431160a1b9)
- [Microsoft Learn: DHCP (Dynamic Host Configuration Protocol) Basics](https://learn.microsoft.com/en-us/windows-server/troubleshoot/dynamic-host-configuration-protocol-basics)
- [Microsoft Learn: How to use automatic TCP/IP addressing without a DHCP server](https://learn.microsoft.com/en-us/windows-server/troubleshoot/how-to-use-automatic-tcpip-addressing-without-a-dh)
- [Microsoft Learn: DHCP scopes in Windows Server](https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-scopes)
