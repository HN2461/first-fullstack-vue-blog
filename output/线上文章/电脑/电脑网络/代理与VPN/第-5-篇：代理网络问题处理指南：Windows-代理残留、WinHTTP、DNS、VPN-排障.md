---
title: "第 5 篇：代理网络问题处理指南：Windows 代理残留、WinHTTP、DNS、VPN 排障"
slug: "vpn-0373b572"
summary: "用手机热点和浏览器对照缩小 Windows 断网范围，再检查个人代理残留、VPN、WinHTTP、DNS 与 Git 配置。"
category: "代理与VPN"
categoryPath:
  - "电脑"
  - "电脑网络"
  - "代理与VPN"
tags:
  - "Windows"
  - "代理"
  - "VPN"
  - "网络故障排查"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac510"
originalSlug: "vpn-0373b572"
originalStatus: "published"
publishedAt: "2026-06-02T12:59:14.389Z"
updatedAt: "2026-08-16T14:39:48.203Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---

# 第 5 篇：代理网络问题处理指南

**适用环境**　以 Windows 11 为主，兼顾 Windows 10。适合退出代理软件后浏览器打不开网页，以及浏览器能打开、终端连接失败的情况。优先辨别故障范围，再改对应设置。

## 先用手机热点对照

1. 先退出代理客户端或断开个人 VPN，记下当前连接的网络。遇到公司统一配置的 VPN，按 IT 的要求测试。
2. 用同一台电脑、同一个浏览器访问两个平时能打开的网站，并记下错误。
3. 断开原网络，连接自己的手机热点，再访问同样的两个网站。

| 对照结果 | 接下来查什么 |
| --- | --- |
| 热点正常，原网络异常 | 先查原网络、路由器、DNS 或单位网络策略。把对照结果交给 IT，便于核查。 |
| 两边都异常 | 先试另一个浏览器，再查电脑的代理、浏览器扩展，或网站本身。也可用另一台设备打开同一网站。 |
| 只有一个浏览器异常 | 先看该浏览器的代理扩展和设置。 |
| 只有一个网站异常 | 记录该站错误，用另一个浏览器和设备对照。 |
| 只有 Git 或其他命令行工具异常 | 直接看下文「Git 单独排查」。 |

## 在设置里检查个人代理残留

1. 打开「设置 → 网络和 Internet → 代理」，记录「自动检测设置」「使用设置脚本」「使用代理服务器」的当前状态。
2. 如果个人代理软件已经退出，手动代理仍指向 `127.0.0.1` 或 `localhost`，并且你确认那是该软件留下的设置，可关闭「使用代理服务器」。
3. 「自动检测设置」和「使用设置脚本」可由单位网络提供。公司或校园设备按 IT 提供的值使用。若刚刚改过个人代理脚本，可恢复到自己记录的原值。
4. 重新打开浏览器，验证原本打不开的网站。需要回退时，在同一设置页恢复原值。

Windows 中 VPN 的代理设置可以单独配置。只有接入某个 VPN 后复现时，查看「设置 → 网络和 Internet → VPN → 对应 VPN → 高级选项」，并和所用 VPN 的配置要求对照。 [Microsoft：在 Windows 中使用代理服务器](https://support.microsoft.com/en-us/windows/experience/connectivity-networking/use-a-proxy-server-in-windows)

**只有一个浏览器受影响时**，可用其他浏览器或访客窗口复测。隐私窗口也可能加载明确允许在隐私模式运行的扩展。每次只停用一个自己安装的代理扩展，复测并记录，以便还原。

## 用只读命令缩小范围

右键开始按钮，打开「终端」或「Windows PowerShell」，以下测试可用普通权限执行。把示例网址换成故障网站的域名，省略 `https://` 和末尾路径。

```powershell
nslookup www.microsoft.com
Test-NetConnection www.microsoft.com -Port 443
netsh winhttp show proxy
```

- `nslookup` 给出可用地址，说明本次查询得到了 DNS 回答。看到 `Server: UnKnown` 时仍要看下方是否有实际查询结果。
- `TcpTestSucceeded : True` 表示到该目标的 TCP 443 建连成功。网页还需要经过浏览器的代理、TLS 和站点响应。
- TCP 测试失败时，可用另一个网站和手机热点做对照。超时也可能出现在 DNS、路由、网络故障及目标站限流等场景。
- `netsh winhttp show proxy` 查看 WinHTTP 使用的代理。一些应用和系统组件使用 WinHTTP，浏览器和单位配置仍需分别核对。

仅在已确认 WinHTTP 指向废弃的个人代理且应使用直连时，才在管理员终端执行 `netsh winhttp reset proxy`。它会把 WinHTTP 设置为直接访问。先记录原配置，单位设备交由 IT 决定。只有怀疑系统 DNS 缓存过旧时才刷新缓存，然后复测相同站点。 [Microsoft：Test-NetConnection](https://learn.microsoft.com/en-us/powershell/module/nettcpip/test-netconnection) · [Microsoft：WinHTTP 命令](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh-winhttp) · [Windows DNS 缓存与 hosts](/console/article-directory/articles/windows-hosts-dns-a34c6e09)

## Git 单独排查

在已有仓库的目录中打开普通 PowerShell，确认远程地址和生效的代理设置。

```powershell
git remote -v
git config --show-origin --get-urlmatch http.proxy https://github.com/
git ls-remote origin
```

- 远程是 `https://...` 时，查看对应主机的 `http.proxy` 设置，以及终端是否有 `HTTP_PROXY`、`HTTPS_PROXY` 或 `ALL_PROXY` 环境变量。无匹配配置时，第二条命令可能不会输出内容。
- 远程是 `git@...` 或 `ssh://...` 时，从 SSH 连接和远程配置查起。
- `git ls-remote origin` 通常会列出远端引用。如果失败，先区分连接超时、认证失败、仓库地址错误和证书错误。分享诊断结果前，删除远程地址、代理地址里的令牌或个人账号信息。

确认 Git 的正确代理需要由所用客户端或 IT 提供。测试时优先使用仓库或单次命令范围的配置，避免影响其他仓库。Git 的代理配置项是 `http.proxy`，`HTTPS_PROXY` 是环境变量。 [Git：代理配置](https://raw.githubusercontent.com/git/git/master/Documentation/config/http.adoc)

## 两分钟练习

联网时打开 Windows 的代理设置页，辨认自动检测、脚本和手动代理三个区域。运行两条连通性查询，记下正常时 `nslookup` 的地址和 `TcpTestSucceeded` 的结果。下次故障先做热点对照，再比较这些输出。

- [代理模式与流量接管方式](/console/article-directory/articles/proxy-mode-and-traffic-capture-guide-20260705)
- [Windows Wi‑Fi 图标消失修复](/console/article-directory/articles/wifi-09cbf6da)
