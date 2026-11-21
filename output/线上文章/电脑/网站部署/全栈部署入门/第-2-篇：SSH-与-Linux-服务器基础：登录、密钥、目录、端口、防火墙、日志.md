---
title: "第 2 篇：SSH 与 Linux 服务器基础：登录、密钥、目录、端口、防火墙、日志"
slug: "ssh-linux-8e509843"
summary: "部署小白入门 SSH 与 Linux 服务器，讲清 SSH 登录、密钥登录、服务器目录、常用 Linux 命令、端口、防火墙和日志查看。"
category: "全栈部署入门"
categoryPath:
  - "电脑"
  - "网站部署"
  - "全栈部署入门"
tags:
  - "SSH"
  - "Linux"
  - "服务器"
  - "防火墙"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291f8a2b1c68f2cac598"
originalSlug: "ssh-linux-8e509843"
originalStatus: "published"
publishedAt: "2026-06-08T11:09:58.534Z"
updatedAt: "2026-08-16T14:39:48.203Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 2 篇：SSH 与 Linux 服务器基础：登录、密钥、目录、端口、防火墙、日志

资料核对时间：2026-06-08。

这一篇解决一个最基础的问题：

> 我买了服务器以后，怎么进去？进去以后我该看什么、做什么？

## 1. SSH 是什么

SSH 可以理解成：

```txt
用一条安全的远程通道，进入你的服务器命令行。
```

你在自己电脑上输入：

```bash
ssh deploy@203.0.113.10
```

意思是：

```txt
我要用 deploy 账户，登录地址为 203.0.113.10 的服务器。实际操作需替换成自己的服务器和账号。
```

OpenSSH 官方手册提供了 `ssh`、`scp`、`sftp` 等命令说明，所以 SSH 不是某个云厂商私有功能，而是非常通用的远程登录方式。

## 2. 第一次登录服务器

云服务器一般会给你：

```txt
公网 IP
用户名
密码或密钥
```

在自己电脑的 PowerShell 或终端运行下面的命令。示例用文档地址 `203.0.113.10` 和普通账户 `deploy`。请换成云控制台提供的实际公网 IP、登录账户及端口。

```bash
# 默认 SSH 端口为 22。如使用其他端口，加上 -p 与端口号
ssh deploy@203.0.113.10
```

第一次登录时，终端可能提示：

```txt
Are you sure you want to continue connecting?
```

可以理解成：

```txt
这是你第一次连接这台服务器，要不要把它记住？
```

首次连接提示还会显示主机密钥类型和 `SHA256:...` 指纹。先从独立可信渠道取得正确信息，例如已登录云账号后使用该实例的 Web/VNC 控制台，或向管理服务器的人通过已确认身份的官方渠道索取指纹。在可信控制台中如果有权限，可查看对应的主机公钥指纹。下面以 ED25519 为例。

```bash
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

比较相同算法下的完整 SHA256 指纹。匹配后回到本机提示输入 `yes`。若指纹对不上或没有可信来源，终止连接并检查实例及主机密钥。已知服务器后来出现 `REMOTE HOST IDENTIFICATION HAS CHANGED` 时，先通过可信控制台确认是否发生了重装或密钥轮换，再让管理员更新已知主机记录。

## 3. 密钥登录是什么

密码登录像“知道门锁密码”。

密钥登录像“你电脑上有一把私钥，服务器上登记了对应公钥”。

命令示例：

```bash
# -i 指定私钥文件
# ~/.ssh/my-server-key 是私钥路径，真实文件名以你自己创建的为准
ssh -i ~/.ssh/my-server-key deploy@203.0.113.10
```

注意：

- 私钥不要发给别人。
- 私钥不要提交到 Git 仓库。
- 私钥文件权限过宽时，某些系统会拒绝使用。

## 4. 进入服务器后先做什么

建议先执行：

```bash
# 看当前登录用户
whoami

# 看当前所在目录
pwd

# 看系统版本，方便以后查文档和排错
cat /etc/os-release

# 看磁盘空间，磁盘满了会导致构建、日志、数据库都出问题
df -h

# 看内存，内存太小会影响 Node、MongoDB 和构建
free -h
```

小白不要急着复制复杂命令。先确认：

- 我是谁。
- 我在哪。
- 服务器是什么系统。
- 服务器有没有空间。
- 服务器有没有内存。

## 5. 部署常用目录

Linux 目录很多，但部署小项目时先记这些：

| 路径 | 常见用途 |
|---|---|
| `/var/www/` | 放网站静态资源或前端项目构建产物 |
| `/opt/` | 放应用程序、后端项目、工具 |
| `/etc/nginx/` | Nginx 配置 |
| `/var/log/nginx/` | Nginx 日志 |
| `/home/用户名/` | 普通用户主目录 |
| `/root/` | root 用户主目录 |
| `/tmp/` | 临时文件 |

一个比较清晰的项目摆放方式：

```txt
/var/www/my-vue-app/       放 Vue 打包后的 dist 文件
/opt/my-express-api/       放 Express 后端代码
/opt/my-express-api/.env   放后端环境变量
```

为什么前后端分开放？

- 前端构建后只是静态文件，Nginx 直接读。
- 后端需要 Node 运行，PM2 负责守护。
- 分开后排查问题更清楚。

## 6. 常用 Linux 命令

### 查看文件和目录

```bash
# 查看当前目录内容
ls

# 查看详细信息，包括权限、大小、修改时间
ls -la

# 进入目录
cd /opt/my-express-api

# 回到上一级
cd ..
```

### 创建目录

```bash
# -p 表示父目录不存在也一起创建
mkdir -p /var/www/my-vue-app
mkdir -p /opt/my-express-api
```

### 复制和移动

```bash
# 复制文件
cp source.txt target.txt

# 复制整个目录
# -r 表示递归复制
cp -r dist /var/www/my-vue-app

# 移动或重命名
mv old-name new-name
```

### 查看文件

```bash
# 查看完整文件，适合短文件
cat .env

# 分页查看长文件
less /var/log/nginx/error.log

# 查看最后 50 行
tail -n 50 /var/log/nginx/error.log

# 实时看日志，新错误出现时会继续往下滚
tail -f /var/log/nginx/error.log
```

### 删除文件

```bash
# 删除单个文件
rm old.log

# 删除目录要非常谨慎
# -r 表示递归删除，路径写错会很危险
rm -r old-folder
```

小白提醒：

```txt
看到 rm -rf 先停一下。
确认路径。
不要复制来路不明的一整段删除命令。
```

## 7. 端口是什么

服务器 IP 像一栋楼地址，端口像楼里的门牌。

常见端口：

| 端口 | 用途 |
|---|---|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 3000 | Node / Express 常用开发端口 |
| 5173 | Vite 常用开发端口 |
| 27017 | MongoDB 默认端口 |

部署时常见做法：

```txt
公网开放：22、80、443
本机使用：3000、27017
```

也就是说：

- 用户访问 80/443。
- Nginx 把 API 转发给本机 3000。
- Express 连接本机 27017。
- 不建议把 3000 和 27017 直接暴露给所有公网用户。

## 8. 防火墙和安全组

云服务器通常有两层入口控制：

```txt
云厂商安全组：在云平台控制台配置。
系统防火墙：在服务器系统里配置，例如 Ubuntu 的 ufw。
```

Ubuntu 官方文档说明，`ufw` 是 Ubuntu 常用的简化防火墙工具。

常见命令：

```bash
# 允许 SSH，避免启用防火墙后把自己锁在服务器外面
sudo ufw allow 22

# 允许 HTTP
sudo ufw allow 80

# 允许 HTTPS
sudo ufw allow 443

# 查看规则
sudo ufw status

# 启用 ufw
# 启用前一定确认 SSH 端口已经放行
sudo ufw enable
```

不建议这样做：

```bash
# 不要随手把 MongoDB 默认端口开放给所有公网
sudo ufw allow 27017
```

如果确实需要远程连接数据库，优先考虑：

- 云数据库白名单。
- VPN。
- SSH 隧道。
- 只允许指定 IP。

## 9. 上传代码的三种方式

### 方式一：Git 拉代码

适合项目已经在 GitHub、Gitee 或 GitLab。

```bash
# 进入应用目录
cd /opt

# 拉取项目
git clone https://github.com/your-name/your-project.git
```

优点：

- 更新方便。
- 能看到版本。
- 不容易漏文件。

### 方式二：scp 上传

适合简单上传构建后的 `dist`。

```bash
# 把本地 dist 上传到服务器
# 注意把 user、server-ip、路径换成自己的
scp -r ./dist user@server-ip:/var/www/my-vue-app/
```

### 方式三：宝塔文件管理

适合刚开始练习。

优点是直观，缺点是：

- 大项目上传慢。
- 不如 Git 有版本记录。
- 出问题仍然要回到日志和命令排查。

## 10. 环境变量文件

生产环境不要把数据库密码写死在代码里。

建议后端项目里用 `.env`：

```bash
# .env
# NODE_ENV=production 告诉 Express 当前是生产环境
NODE_ENV=production

# Express 监听端口，通常让 Nginx 转发到这个端口
PORT=3000

# 数据库连接字符串，密码要换成真实强密码
MONGODB_URI=mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app
```

`.env` 应该加入 `.gitignore`：

```bash
# .gitignore
# 环境变量里常有密码，不提交到仓库
.env
```

## 11. 日志排查入门

部署报错时，先不要乱改配置。按顺序看：

```bash
# 看 Nginx 配置是否语法正确
sudo nginx -t

# 看 Nginx 错误日志
sudo tail -n 50 /var/log/nginx/error.log

# 看 Nginx 运行状态
sudo systemctl status nginx

# 看 Node 应用日志
pm2 logs my-api
```

常见判断：

| 现象 | 先看哪里 |
|---|---|
| 网站打不开 | 云安全组、ufw、Nginx 状态 |
| 502 Bad Gateway | Express 是否运行、Nginx `proxy_pass` 是否写对 |
| Vue 刷新页面 404 | Nginx `try_files` 或 Vue Router 模式 |
| 接口 404 | Nginx `/api` 转发路径和 Express 路由 |
| 数据库连不上 | `.env`、MongoDB 用户、端口、网络 |

## 12. 第一次登录后的练习

1. 先从可信控制台取得主机指纹，再在自己的电脑上执行前面的 `ssh` 命令。看到指纹时逐一核对。连接成功后，终端会显示远端的命令提示符。
2. 在远端执行下列命令。练习文件建在当前账号自己的目录里，无需管理员权限。

```bash
whoami
hostname
cat /etc/os-release
mkdir -p ~/deploy-practice
printf 'ssh ok\n' > ~/deploy-practice/connection.txt
cat ~/deploy-practice/connection.txt
```

3. 对照云控制台确认登录的是预期实例。最后一条命令应显示 `ssh ok`。练完执行 `exit`，确认命令提示符回到本机。
4. 下一步按需看服务记录。如果 Ubuntu 开了 UFW，可用 `sudo ufw status` 查看主机规则。Nginx 已安装时，可用 `sudo journalctl -u nginx -n 20 --no-pager` 查看近期日志。云安全组在云控制台查看。

## 官方资料

- OpenSSH Manual Pages：https://www.openssh.com/manual.html
- Ubuntu Server Firewall：https://ubuntu.com/server/docs/security-firewall
