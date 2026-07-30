---
title: "第 7 篇：Vue + Express + MongoDB 从 0 到 1 完整上线实战"
slug: "legacy-dee56a61-dee56a61"
summary: "面向零基础小白的 Vue + Node + Express + MongoDB 前后端分离项目完整部署实战，从本地打包、服务器购买登录、环境安装、前后端上传、MongoDB 安全、PM2 守护、Nginx 反向代理、域名 HTTPS、防火墙到故障排查一步步跑通。"
category: "全栈部署入门"
tags:
  - "上线实战"
  - "Vue"
  - "Express"
  - "MongoDB"
  - "Nginx"
  - "HTTPS"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5b8"
originalSlug: "legacy-dee56a61-dee56a61"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 第 7 篇：Vue + Express + MongoDB 从 0 到 1 完整上线实战

资料核对时间：2026-06-08。

这一篇是整套“全栈部署入门”的主线实战。

你可以把它当成一张超详细操作单：从本机项目准备开始，到买服务器、登录服务器、安装环境、部署前端、部署后端、连接 MongoDB、配置 PM2、配置 Nginx、绑定域名、申请 HTTPS、放行防火墙，最后排查常见错误。

先记住一句大白话：

```txt
前端负责给用户看页面，后端负责处理接口，数据库负责存数据。
Nginx 是网站大门，PM2 是后端保姆，MongoDB 不能直接裸露在公网。
```

## 0. 最终要搭成什么样

本文用一个典型前后端分离项目做例子：

```txt
my-fullstack-app/
  frontend/      Vue + Vite 前端项目
  backend/       Node.js + Express 后端项目
```

上线后的访问链路是：

```txt
用户浏览器
  |
  | 访问 https://example.com
  v
Nginx
  |
  |-- 普通页面请求：直接返回 Vue 打包后的 dist 文件
  |
  |-- /api 接口请求：转发到本机 Express 服务
          |
          v
       Express
          |
          v
       MongoDB
```

本文统一使用这些示例值，复制命令前要替换成你自己的：

| 占位符 | 你要替换成什么 |
|---|---|
| `example.com` | 你的真实域名 |
| `1.2.3.4` | 你的服务器公网 IP |
| `root` | 你的服务器登录用户名 |
| `my-fullstack-app` | 你的项目名 |
| `my-fullstack-api` | 你的后端服务名 |
| `my_app` | 你的 MongoDB 数据库名 |
| `app_user` | 你的 MongoDB 应用用户 |
| `strong_password` | 你的强密码 |

**成功标准：**

- 浏览器能打开 `https://example.com`。
- 浏览器能打开 `https://example.com/api/health` 并看到 JSON。
- 刷新前端子页面不 404。
- 服务器重启后，后端能自动恢复。
- MongoDB 开启认证，27017 不对全公网开放。
- HTTP 会自动跳转到 HTTPS。

## 1. 开始前先准备这些东西

### 1.1 你本机需要准备

在自己电脑上准备：

- 一个能正常运行的 Vue 前端项目。
- 一个能正常运行的 Express 后端项目。
- 一个 Git 仓库，建议把前后端代码都提交进去。
- 一个终端工具：Windows 可以用 PowerShell，macOS / Linux 可以用系统终端。
- 一个代码编辑器，比如 VS Code。

本机先确认项目能跑：

```bash
# 进入前端
cd frontend

# 安装依赖
npm install

# 启动开发服务
npm run dev
```

再开一个终端确认后端能跑：

```bash
# 进入后端
cd backend

# 安装依赖
npm install

# 启动后端，具体命令按你的 package.json 来
npm run dev
```

**成功标准：**

- 本机能打开前端开发地址，例如 `http://localhost:5173`。
- 本机能访问后端健康检查，例如 `http://localhost:3000/api/health`。

### 1.2 你要理解的 8 个词

| 名词 | 大白话解释 |
|---|---|
| 服务器 | 一台长期开机、能被公网访问的远程电脑 |
| SSH | 远程登录服务器命令行的安全通道 |
| Linux | 服务器常用操作系统，本文以 Ubuntu 为例 |
| Node.js | 运行 Express 后端的 JavaScript 环境 |
| Nginx | 网站入口，负责静态页面、反向代理、HTTPS |
| 反向代理 | 用户访问 Nginx，Nginx 再把接口请求转给 Express |
| PM2 | Node 进程守护工具，负责后台运行、崩溃重启、开机恢复 |
| 环境变量 | 生产环境的配置，例如端口、数据库地址、密码 |

## 2. 购买服务器和域名

### 2.1 服务器怎么选

新手练习可以选最小配置：

```txt
系统：Ubuntu 24.04 LTS 或 Ubuntu 22.04 LTS
CPU：1 核起步
内存：2 GB 起步，跑 MongoDB 更建议 2 GB 以上
硬盘：40 GB 起步
公网 IP：必须有
地区：离主要访问用户近一点
```

**LTS** 的意思是长期支持版本。新手部署不要选太奇怪的系统，后续查资料会轻松很多。

购买时常见按钮路径大概是：

```txt
云厂商控制台 -> 云服务器 / ECS / CVM / 轻量应用服务器 -> 创建实例
```

创建时注意：

1. 镜像选择 `Ubuntu 24.04 LTS` 或 `Ubuntu 22.04 LTS`。
2. 登录方式可以先选密码，熟练后再改 SSH 密钥。
3. 记下公网 IP。
4. 安全组先放行 `22`、`80`、`443`。

**不要为了省事选择“开放全部端口到公网”。**

### 2.2 安全组怎么点

安全组是云厂商给服务器外面套的一层“门禁”。

一般入口：

```txt
云服务器控制台 -> 找到你的服务器 -> 安全组 / 防火墙 -> 入站规则 / 入方向规则 -> 添加规则
```

建议规则：

| 协议 | 端口 | 来源 | 用途 |
|---|---:|---|---|
| TCP | 22 | 你的本机 IP，练习期也可临时 0.0.0.0/0 | SSH 登录 |
| TCP | 80 | 0.0.0.0/0 | HTTP 和证书校验 |
| TCP | 443 | 0.0.0.0/0 | HTTPS |

不建议开放：

| 端口 | 为什么 |
|---:|---|
| 3000 | Express 应用端口，交给 Nginx 从本机转发即可 |
| 27017 | MongoDB 默认端口，数据库不要直接暴露给公网 |

**成功标准：**

- 云控制台里能看到 22、80、443 已放行。
- 3000、27017 没有对全公网放行。

### 2.3 域名和 DNS

域名是用户访问的网站名字，例如：

```txt
example.com
```

DNS 是把域名翻译成服务器 IP 的系统。

添加解析时，一般入口：

```txt
域名控制台 -> DNS 解析 / 域名解析 -> 添加记录
```

常见记录：

| 主机记录 | 记录类型 | 记录值 |
|---|---|---|
| `@` | A | 服务器公网 IP |
| `www` | A | 服务器公网 IP |

说明：

- `@` 表示根域名，例如 `example.com`。
- `www` 表示 `www.example.com`。
- `A` 记录表示把域名指向一个 IPv4 地址。

添加后在本机验证：

```bash
# Windows PowerShell、macOS、Linux 都可用
nslookup example.com
```

**成功标准：**

- 输出里能看到你的服务器公网 IP。
- 如果刚配置完还没生效，等几分钟到几十分钟再测。

## 3. SSH 登录服务器

在本机终端执行：

```bash
# 把 1.2.3.4 换成你的服务器公网 IP
ssh root@1.2.3.4
```

第一次连接会问：

```txt
Are you sure you want to continue connecting?
```

确认 IP 没输错后，输入：

```txt
yes
```

然后输入服务器密码。

登录成功后，先执行：

```bash
# 看当前登录用户
whoami

# 看当前所在目录
pwd

# 看系统版本
cat /etc/os-release

# 看磁盘空间
df -h

# 看内存
free -h
```

**成功标准：**

- `whoami` 能看到 `root` 或你的用户名。
- `cat /etc/os-release` 能看到 Ubuntu 版本。
- `df -h` 和 `free -h` 能正常输出。

## 4. 初始化服务器环境

下面命令在服务器上执行。

### 4.1 更新系统包

```bash
# 更新软件包索引
sudo apt update

# 升级已安装软件包
sudo apt upgrade -y

# 安装常用工具
sudo apt install -y curl wget git vim nano unzip build-essential
```

**成功标准：**

- 命令没有红色报错。
- `git --version` 能输出版本号。

### 4.2 安装 Node.js LTS

Node.js 版本更新比较快。2026-06 生产项目建议优先使用 Node.js LTS，也就是长期支持版本。

下面以 NodeSource 的 LTS 安装脚本为例：

```bash
# 安装 curl
sudo apt install -y curl

# 下载 Node.js LTS 源配置脚本
curl -fsSL https://deb.nodesource.com/setup_lts.x -o nodesource_setup.sh

# 执行源配置脚本
sudo -E bash nodesource_setup.sh

# 安装 Node.js，npm 会一起装上
sudo apt install -y nodejs

# 验证 Node.js
node -v

# 验证 npm
npm -v
```

**成功标准：**

- `node -v` 能输出版本号，例如 `v24.x.x` 或当前最新 LTS。
- `npm -v` 能输出版本号。

### 4.3 安装 Nginx

```bash
# 安装 Nginx
sudo apt install -y nginx

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 查看状态
sudo systemctl status nginx
```

如果状态里看到 `active (running)`，说明 Nginx 已经运行。

本机浏览器访问：

```txt
http://1.2.3.4
```

**成功标准：**

- 能看到 Nginx 默认欢迎页。
- 如果打不开，先查云安全组 80 端口是否放行。

### 4.4 配置 Ubuntu 系统防火墙

云安全组是云平台外层门禁，`ufw` 是 Ubuntu 系统内部防火墙。

先放行 SSH，避免把自己锁在服务器外：

```bash
# 允许 SSH
sudo ufw allow 22

# 允许 HTTP
sudo ufw allow 80

# 允许 HTTPS
sudo ufw allow 443

# 查看规则
sudo ufw status
```

如果 `ufw` 还没启用，可以启用：

```bash
# 启用前确认 22 已放行
sudo ufw enable

# 再看状态
sudo ufw status
```

**成功标准：**

- `sudo ufw status` 能看到 22、80、443 为 `ALLOW`。
- 仍然可以新开终端 SSH 登录服务器。

## 5. 本地项目改成生产可部署形态

这一步在你自己的电脑项目里做。

### 5.1 前端接口地址不要写死 localhost

开发时很多人会这样写：

```js
fetch('http://localhost:3000/api/health')
```

上线后用户电脑里的 `localhost` 是用户自己的电脑，不是你的服务器。

更推荐这样：

```js
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

fetch(`${apiBaseUrl}/api/health`)
```

前端根目录新建开发环境文件：

```bash
# frontend/.env.development
VITE_API_BASE_URL=http://localhost:3000
```

再新建生产环境文件：

```bash
# frontend/.env.production
VITE_API_BASE_URL=
```

生产环境留空的意思是使用同源地址：

```txt
页面：https://example.com
接口：https://example.com/api/health
```

这样接口请求会先到 Nginx，再由 Nginx 转发给 Express。

**成功标准：**

- 代码里不再写死 `localhost:3000`。
- 本地开发仍然能正常请求接口。

### 5.2 开发代理和生产代理不要混在一起

Vite 开发环境可以在 `vite.config.js` 里配置代理：

```js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}
```

但这个代理只在 `npm run dev` 时生效。上线后的代理是 Nginx 做的。

小白记法：

```txt
本地开发：Vite proxy 帮你转发 /api。
生产上线：Nginx proxy_pass 帮你转发 /api。
```

### 5.3 后端端口和数据库地址放进环境变量

后端不要这样写死：

```js
app.listen(3000)
```

建议这样：

```js
const port = Number(process.env.PORT || 3000)

app.listen(port, '127.0.0.1', () => {
  console.log(`api listening on http://127.0.0.1:${port}`)
})
```

`127.0.0.1` 表示只监听服务器本机。外网用户不能直接访问 3000，只能从 Nginx 进来。

后端项目根目录准备 `.env.example`，提交到 Git：

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app
```

真实 `.env` 不要提交到 Git：

```bash
# backend/.gitignore
.env
node_modules
```

**成功标准：**

- 后端能从 `process.env.PORT` 读取端口。
- 后端能从 `process.env.MONGODB_URI` 读取数据库连接。
- `.env` 没有提交到公开仓库。

### 5.4 后端准备健康检查接口

健康检查就是一个最简单的接口，用来确认后端活着。

```js
import express from 'express'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'server is healthy',
    env: process.env.NODE_ENV || 'development'
  })
})

const port = Number(process.env.PORT || 3000)

app.listen(port, '127.0.0.1', () => {
  console.log(`api listening on http://127.0.0.1:${port}`)
})
```

**成功标准：**

- 本机访问 `http://localhost:3000/api/health` 能看到 JSON。

### 5.5 CORS 生产环境怎么改

CORS 是浏览器的跨域规则。大白话是：

```txt
网页地址和接口地址不是同一个来源时，浏览器会先问后端：这个前端能不能访问你？
```

开发时可以临时放开：

```js
app.use(cors())
```

生产环境更建议只允许自己的域名：

```js
import cors from 'cors'

const allowedOrigins = [
  'https://example.com',
  'https://www.example.com'
]

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
```

如果前端和后端最终都走同一个域名，例如：

```txt
前端：https://example.com
接口：https://example.com/api
```

很多普通请求就不再是跨域，CORS 问题会少很多。

## 6. 本地构建前端

在本机执行：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 构建生产文件
npm run build
```

Vite 默认会生成：

```txt
frontend/dist/
  index.html
  assets/
    xxx.js
    xxx.css
```

本地预览构建结果：

```bash
npm run preview
```

注意：

```txt
vite preview 只用来本地预览 dist，不要把它当生产服务器。
```

**成功标准：**

- `frontend/dist/index.html` 存在。
- `frontend/dist/assets/` 存在。
- 本地 `npm run preview` 能打开页面。

## 7. 准备服务器目录

下面命令在服务器上执行。

```bash
# 前端静态资源目录
sudo mkdir -p /var/www/my-fullstack-app/dist

# 后端应用目录
sudo mkdir -p /opt/my-fullstack-api

# 查看目录
ls -ld /var/www/my-fullstack-app/dist /opt/my-fullstack-api
```

如果你直接用 `root` 部署，权限问题少一些。后续正式项目建议创建普通部署用户，这属于进阶内容。

**成功标准：**

- 两个目录都存在。

## 8. 上传前端 dist

这一步在本机执行，不是在服务器里执行。

### 8.1 Windows PowerShell 上传

进入前端目录：

```bash
cd frontend
```

上传 `dist` 里的内容：

```bash
scp -r ./dist/* root@1.2.3.4:/var/www/my-fullstack-app/dist/
```

如果服务器 SSH 不是 22 端口：

```bash
scp -P 2222 -r ./dist/* root@1.2.3.4:/var/www/my-fullstack-app/dist/
```

注意：

- `scp -P` 是大写 `P`。
- `ssh -p` 是小写 `p`。

### 8.2 服务器上验证前端文件

回到服务器 SSH 里执行：

```bash
ls -la /var/www/my-fullstack-app/dist
```

你应该能看到：

```txt
index.html
assets
```

**成功标准：**

- `/var/www/my-fullstack-app/dist/index.html` 存在。
- 不是 `/var/www/my-fullstack-app/dist/dist/index.html`。

## 9. 部署后端代码

推荐用 Git 拉后端代码。下面命令在服务器上执行。

```bash
# 进入 /opt
cd /opt

# 如果目录为空，可以直接克隆
git clone https://github.com/your-name/my-fullstack-api.git my-fullstack-api

# 进入后端目录
cd /opt/my-fullstack-api

# 安装生产依赖
npm install --omit=dev
```

如果你的项目是前后端放在一个仓库：

```bash
cd /opt
git clone https://github.com/your-name/my-fullstack-app.git my-fullstack-app
cd /opt/my-fullstack-app/backend
npm install --omit=dev
```

创建生产环境变量：

```bash
nano .env
```

写入：

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app
```

保存方式：

```txt
nano 里按 Ctrl + O 保存，按 Enter 确认文件名，再按 Ctrl + X 退出。
```

**成功标准：**

- `npm install --omit=dev` 没有失败。
- `.env` 已创建。
- `.env` 没有出现在 Git 仓库里。

## 10. 安装和配置 MongoDB

MongoDB 可以自建，也可以用云数据库。

学习完整部署链路时，可以先自建一次。重要生产项目更建议使用云数据库或托管服务，备份和安全会省心很多。

### 10.1 安装 MongoDB Community

下面以 Ubuntu 24.04 / 22.04 + MongoDB 8.0 官方仓库为例。MongoDB 安装命令会随版本变化，真实项目建议先对照官方文档确认系统版本。

```bash
# 安装 gnupg 和 curl
sudo apt-get install -y gnupg curl

# 导入 MongoDB 8.0 GPG key
curl -fsSL https://pgp.mongodb.com/server-8.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
  --dearmor
```

如果你的服务器是 Ubuntu 24.04：

```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
```

如果你的服务器是 Ubuntu 22.04：

```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
```

继续安装：

```bash
# 更新软件包索引
sudo apt-get update

# 安装 MongoDB
sudo apt-get install -y mongodb-org

# 启动 MongoDB
sudo systemctl start mongod

# 设置开机自启
sudo systemctl enable mongod

# 查看状态
sudo systemctl status mongod
```

**成功标准：**

- `sudo systemctl status mongod` 显示 `active (running)`。
- 执行 `mongosh` 能进入 MongoDB shell。

### 10.2 创建数据库用户

第一次创建用户时，先进入：

```bash
mongosh
```

在 `mongosh` 里执行：

```js
use my_app

db.createUser({
  user: 'app_user',
  pwd: 'strong_password',
  roles: [
    {
      role: 'readWrite',
      db: 'my_app'
    }
  ]
})
```

退出：

```js
exit
```

**成功标准：**

- 命令返回 `ok: 1`。

### 10.3 开启认证并限制本机访问

编辑 MongoDB 配置：

```bash
sudo nano /etc/mongod.conf
```

确认或修改成下面这样：

```yaml
net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled
```

解释：

- `bindIp: 127.0.0.1` 表示 MongoDB 只接受本机连接。
- `authorization: enabled` 表示开启用户名密码认证。

重启：

```bash
sudo systemctl restart mongod
sudo systemctl status mongod
```

测试连接：

```bash
mongosh "mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app"
```

**成功标准：**

- 使用正确用户名密码能连上。
- 不带用户名密码访问业务库会受限。
- 云安全组和 ufw 都没有开放 27017 给全公网。

## 11. 先直接启动后端验证

在服务器上进入后端目录：

```bash
cd /opt/my-fullstack-api
```

如果你的入口文件是 `app.js`：

```bash
NODE_ENV=production node app.js
```

另开一个 SSH 终端，测试：

```bash
curl http://127.0.0.1:3000/api/health
```

能看到类似：

```json
{
  "ok": true,
  "message": "server is healthy",
  "env": "production"
}
```

说明 Express 本身没问题。

回到第一个终端按 `Ctrl + C` 停掉临时启动。

**成功标准：**

- `curl http://127.0.0.1:3000/api/health` 能返回 JSON。
- 如果失败，先看 `.env`、入口文件名、端口、MongoDB 连接。

## 12. 用 PM2 守护后端

### 12.1 安装 PM2

```bash
sudo npm install -g pm2

pm2 -v
```

### 12.2 启动后端

```bash
cd /opt/my-fullstack-api

pm2 start app.js --name my-fullstack-api
```

如果你的启动命令写在 `package.json` 里，例如：

```json
{
  "scripts": {
    "start": "node app.js"
  }
}
```

也可以：

```bash
pm2 start npm --name my-fullstack-api -- start
```

查看状态：

```bash
pm2 list
```

查看日志：

```bash
pm2 logs my-fullstack-api
```

再次测试：

```bash
curl http://127.0.0.1:3000/api/health
```

### 12.3 配置开机自启

```bash
# 保存当前 PM2 进程列表
pm2 save

# 生成开机自启命令
pm2 startup
```

执行 `pm2 startup` 后，PM2 会输出一段 `sudo env ...` 开头的命令。复制它，粘贴执行。

然后再执行一次：

```bash
pm2 save
```

**成功标准：**

- `pm2 list` 里应用状态是 `online`。
- `curl http://127.0.0.1:3000/api/health` 正常。
- 执行过 `pm2 save` 和 `pm2 startup` 输出的命令。

## 13. 配置 Nginx 静态站点和反向代理

### 13.1 创建站点配置

Ubuntu / Debian 常见 Nginx 配置目录是：

```txt
/etc/nginx/sites-available/
/etc/nginx/sites-enabled/
```

创建配置：

```bash
sudo nano /etc/nginx/sites-available/my-fullstack-app
```

写入：

```nginx
server {
  listen 80;
  server_name example.com www.example.com;

  root /var/www/my-fullstack-app/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

解释：

- `root` 指向 Vue 的 `dist` 目录。
- `try_files` 解决 Vue Router history 模式刷新 404。
- `location /api/` 把接口请求转给 Express。
- `proxy_pass http://127.0.0.1:3000` 表示 Express 只在本机提供服务。

### 13.2 启用站点配置

```bash
# 建立软链接
sudo ln -s /etc/nginx/sites-available/my-fullstack-app /etc/nginx/sites-enabled/my-fullstack-app

# 如果默认站点占用了同一个域名或 IP，可以先停用默认站点
sudo rm -f /etc/nginx/sites-enabled/default

# 检查 Nginx 配置语法
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

**成功标准：**

- `sudo nginx -t` 输出 `syntax is ok` 和 `test is successful`。
- 浏览器访问 `http://example.com` 能看到前端页面。
- 浏览器访问 `http://example.com/api/health` 能看到 JSON。

## 14. 申请 HTTPS 证书

HTTPS 是加密访问。用户看到 `https://`，浏览器不会提示“不安全”。

### 14.1 申请前确认

先确认：

- 域名已经 A 记录解析到服务器 IP。
- 云安全组开放 80 和 443。
- `ufw` 开放 80 和 443。
- `http://example.com` 已经能访问。

### 14.2 用 Certbot 自动配置 Nginx

在服务器执行：

```bash
# 安装 snapd
sudo apt install -y snapd

# 更新 snap core
sudo snap install core
sudo snap refresh core

# 安装 certbot
sudo snap install --classic certbot

# 建立命令软链接，如果提示已存在可以忽略
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# 申请证书并让 Certbot 自动修改 Nginx
sudo certbot --nginx -d example.com -d www.example.com
```

中途会问邮箱、服务条款、是否重定向 HTTP 到 HTTPS。新手一般选择自动重定向到 HTTPS。

验证自动续签：

```bash
sudo certbot renew --dry-run
```

**成功标准：**

- 浏览器访问 `https://example.com` 正常。
- `http://example.com` 会跳转到 `https://example.com`。
- `sudo certbot renew --dry-run` 没有失败。

## 15. 最终全链路验收

在服务器上执行：

```bash
# Nginx 配置正确
sudo nginx -t

# Nginx 正在运行
sudo systemctl status nginx

# PM2 后端在线
pm2 list

# MongoDB 正在运行
sudo systemctl status mongod

# 后端本机通
curl http://127.0.0.1:3000/api/health

# 域名 HTTP 通，正常会跳转
curl -I http://example.com

# 域名 HTTPS 通
curl -I https://example.com

# 域名 API 通
curl https://example.com/api/health

# 防火墙规则
sudo ufw status
```

浏览器里检查：

```txt
https://example.com
https://www.example.com
https://example.com/api/health
```

如果前端有子路由，例如：

```txt
https://example.com/articles/1
```

打开后刷新页面，确认不 404。

**最终成功标准：**

- 首页正常。
- 接口正常。
- HTTPS 正常。
- 刷新前端路由正常。
- PM2 在线。
- MongoDB 认证开启。
- 3000 和 27017 没有直接对公网开放。

## 16. 更新项目时怎么做

### 16.1 更新前端

本机：

```bash
cd frontend
npm install
npm run build
scp -r ./dist/* root@1.2.3.4:/var/www/my-fullstack-app/dist/
```

服务器验证：

```bash
ls -la /var/www/my-fullstack-app/dist
```

前端静态文件更新通常不需要重启 PM2。

### 16.2 更新后端

服务器：

```bash
cd /opt/my-fullstack-api

# 拉最新代码
git pull

# 如果依赖变化，重新安装
npm install --omit=dev

# 重启后端
pm2 restart my-fullstack-api

# 看日志
pm2 logs my-fullstack-api

# 测试
curl http://127.0.0.1:3000/api/health
curl https://example.com/api/health
```

### 16.3 更新 Nginx 配置

```bash
# 修改配置后先检查
sudo nginx -t

# 没问题再重载
sudo systemctl reload nginx
```

**不要跳过 `sudo nginx -t`。**

## 17. 常见报错 FAQ

### 17.1 域名打不开

先查：

```bash
nslookup example.com
sudo systemctl status nginx
sudo ufw status
```

再去云控制台看安全组：

```txt
80 和 443 是否放行
域名是否解析到正确 IP
服务器是否欠费或关机
```

### 17.2 首页 403 Forbidden

常见原因：

- Nginx 没权限读取目录。
- `root` 指向了没有 `index.html` 的目录。

排查：

```bash
ls -la /var/www/my-fullstack-app/dist
sudo tail -n 50 /var/log/nginx/error.log
```

### 17.3 首页 404

常见原因：

- 前端 dist 上传错层级。
- Nginx `root` 路径写错。

正确结构应该是：

```txt
/var/www/my-fullstack-app/dist/index.html
/var/www/my-fullstack-app/dist/assets/
```

不要变成：

```txt
/var/www/my-fullstack-app/dist/dist/index.html
```

### 17.4 刷新前端子路由 404

如果你用 Vue Router history 模式，Nginx 必须有：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

如果你用 hash 模式，例如 `/#/articles/1`，这个问题通常少一些。

### 17.5 API 502 Bad Gateway

502 大白话：

```txt
Nginx 想找 Express，但没找到或 Express 没接住。
```

排查顺序：

```bash
pm2 list
pm2 logs my-fullstack-api
curl http://127.0.0.1:3000/api/health
sudo tail -n 50 /var/log/nginx/error.log
```

如果本机 `curl 127.0.0.1:3000` 都失败，先修 Express / PM2。

如果本机成功，域名失败，先修 Nginx `proxy_pass`。

### 17.6 API 404

常见原因是 `/api` 前缀不一致。

推荐新手统一保留 `/api`：

Nginx：

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3000;
}
```

Express：

```js
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})
```

### 17.7 CORS 报错

浏览器控制台看到 CORS，先确认：

- 前端请求地址是不是还写着 `localhost`。
- 生产环境是不是应该请求 `/api/...`。
- Express 的 CORS 白名单是否包含 `https://example.com`。
- 如果使用 Cookie，前后端是否都配置了 `credentials`。

### 17.8 MongoDB Authentication failed

常见原因：

- 用户名错。
- 密码错。
- 用户建在 `my_app`，但连接串没写 `authSource=my_app`。
- `.env` 没被后端加载。

排查：

```bash
cat /opt/my-fullstack-api/.env
mongosh "mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app"
pm2 logs my-fullstack-api
```

注意不要把真实 `.env` 截图发到公开地方。

### 17.9 MongoDB ECONNREFUSED

常见原因：

- MongoDB 没启动。
- 地址写错。
- Express 和 MongoDB 不在同一台服务器，但你写了 `127.0.0.1`。

排查：

```bash
sudo systemctl status mongod
sudo tail -n 50 /var/log/mongodb/mongod.log
```

### 17.10 HTTPS 证书申请失败

先查：

```bash
nslookup example.com
curl -I http://example.com
sudo ufw status
sudo nginx -t
```

常见原因：

- 域名还没解析到服务器。
- 80 端口没放行。
- Nginx 配置语法错误。
- 云厂商安全组拦截了 80。

### 17.11 PM2 显示 online 但接口不对

先看日志：

```bash
pm2 logs my-fullstack-api
```

再确认 PM2 启动的是不是正确目录、正确入口：

```bash
pm2 describe my-fullstack-api
```

常见原因：

- 启动文件不是 `app.js`。
- `.env` 不在当前工作目录。
- 端口被另一个进程占用。

查看端口：

```bash
sudo ss -lntp | grep 3000
```

## 18. 上线安全底线

至少做到这些：

- **不要提交 `.env`。**
- **不要把数据库密码写进前端代码。**
- **不要开放 27017 给全公网。**
- **不要开放所有端口。**
- **不要用数据库管理员账号给应用连接。**
- **Nginx 配置改完先 `sudo nginx -t`。**
- **PM2 改完记得 `pm2 save`。**
- **MongoDB 至少定期 `mongodump` 备份。**

最小备份命令：

```bash
mkdir -p /backup/mongodb

mongodump \
  --uri="mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app" \
  --out="/backup/mongodb/$(date +%F)"
```

恢复前一定确认目标库，避免覆盖错数据：

```bash
mongorestore \
  --uri="mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app" \
  "/backup/mongodb/2026-06-08/my_app"
```

## 19. 一张总流程图

```txt
本机确认项目可运行
  |
  v
前端改生产接口地址，后端改环境变量
  |
  v
本机 npm run build 生成 dist
  |
  v
购买 Ubuntu 服务器，安全组放行 22 / 80 / 443
  |
  v
SSH 登录服务器，安装 Node.js / Nginx / MongoDB / PM2
  |
  v
上传 Vue dist 到 /var/www/my-fullstack-app/dist
  |
  v
后端代码放到 /opt/my-fullstack-api，写 .env
  |
  v
MongoDB 开认证、建用户、限制 127.0.0.1
  |
  v
PM2 启动 Express，curl 本机健康检查
  |
  v
Nginx 配静态站点和 /api 反向代理
  |
  v
域名 A 记录解析到服务器 IP
  |
  v
Certbot 申请 HTTPS，HTTP 跳 HTTPS
  |
  v
浏览器验收首页、接口、刷新路由、HTTPS
```

## 20. 官方资料和权威参考

- Vite Static Deploy：https://vite.dev/guide/static-deploy.html
- Vite Env Variables and Modes：https://vite.dev/guide/env-and-mode
- Vue Router History Mode：https://router.vuejs.org/guide/essentials/history-mode
- Node.js Releases：https://nodejs.org/en/about/previous-releases
- NodeSource Binary Distributions：https://github.com/nodesource/distributions
- Express Production Best Practices：https://expressjs.com/en/advanced/best-practice-performance.html
- Express Security Best Practices：https://expressjs.com/en/advanced/best-practice-security.html
- PM2 Process Management：https://pm2.io/docs/runtime/guide/process-management/
- Nginx Reverse Proxy：https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/
- Certbot Instructions：https://certbot.eff.org/instructions
- Ubuntu Firewall：https://ubuntu.com/server/docs/firewalls
- MongoDB Install on Ubuntu：https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-ubuntu/
- MongoDB Security Checklist：https://www.mongodb.com/docs/rapid/administration/security-checklist/
- MongoDB Database Tools：https://www.mongodb.com/docs/database-tools/
- Cloudflare DNS A Record：https://www.cloudflare.com/learning/dns/dns-records/dns-a-record/
- 阿里云 ECS 安全组：https://help.aliyun.com/zh/ecs/user-guide/start-using-security-groups
- 腾讯云安全组规则：https://intl.cloud.tencent.com/document/product/213/34272
