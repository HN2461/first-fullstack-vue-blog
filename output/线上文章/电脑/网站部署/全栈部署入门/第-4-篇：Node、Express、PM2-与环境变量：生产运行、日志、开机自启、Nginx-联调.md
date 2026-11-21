---
title: "第 4 篇：Node、Express、PM2 与环境变量：生产运行、日志、开机自启、Nginx 联调"
slug: "node-express-pm2-b0b0327c"
summary: "Express 生产运行入门，讲清为什么不能只靠 npm run dev，如何配置健康检查、环境变量、PM2 常驻运行、日志、开机自启和 Nginx 反向代理联调。"
category: "全栈部署入门"
categoryPath:
  - "电脑"
  - "网站部署"
  - "全栈部署入门"
tags:
  - "Node.js"
  - "Express"
  - "PM2"
  - "环境变量"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5a4"
originalSlug: "node-express-pm2-b0b0327c"
originalStatus: "published"
publishedAt: "2026-06-08T11:09:58.537Z"
updatedAt: "2026-08-16T14:39:48.203Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---

# 第 4 篇：Node、Express、PM2 与环境变量：生产运行、日志、开机自启、Nginx 联调

本篇使用 Linux 服务器、Node.js 24 LTS 和 Express 5。在服务器上建一个最小 API，先直接运行，再交给 PM2。配置、入口和验证命令都使用同一个项目目录。已有项目可用自己的路径、入口和健康检查替换示例。

| 示例值 | 用途 |
| --- | --- |
| `$HOME/apps/my-api` | 当前部署用户的项目目录 |
| `127.0.0.1:3000` | Express 的监听地址，供同机 Nginx 转发 |
| `/api/health` | 直接访问和经过 Nginx 时共用的健康检查 |

## 1. 准备最小 Express 项目

用平时管理此应用的部署用户登录服务器。`node --version` 应显示 `v24.` 开头的版本号，`npm --version` 应能正常输出。

```bash
mkdir -p "$HOME/apps/my-api"
cd "$HOME/apps/my-api"
npm init -y
npm install express@5
```

新建 `server.mjs`，写入以下内容。使用 `.mjs` 可以直接运行 ES 模块。

```js
import express from 'express'

const port = Number(process.env.PORT)
const label = process.env.APP_LABEL
const nodeEnv = process.env.NODE_ENV
if (!Number.isInteger(port) || port < 1 || port > 65535 || !label || nodeEnv !== 'production') {
  throw new Error('请先检查 .env 中的 PORT、APP_LABEL 和 NODE_ENV')
}

const app = express()
app.disable('x-powered-by')

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: label, environment: nodeEnv })
})

app.listen(port, '127.0.0.1', () => {
  console.log('API listening on 127.0.0.1:' + port)
})
```

健康检查只返回示例服务名称和当前环境。生产项目的健康响应保持简短，数据库凭据、内部堆栈和可用于定位配置文件的路径放在服务端。

## 2. 创建并验证 `.env`

在项目目录执行以下命令。`umask 077` 让当前 shell 创建的配置文件默认仅向文件所有者开放。

```bash
cd "$HOME/apps/my-api"
umask 077
cat > .env <<'EOF'
NODE_ENV=production
PORT=3000
APP_LABEL=my-api-from-dotenv
EOF
chmod 600 .env
printf '%s\n' '.env' 'node_modules/' >> .gitignore
```

Node.js 会通过 `--env-file=.env` 加载配置。先在前台运行，方便看到错误。

```bash
node --env-file=.env server.mjs
```

另开一个服务器终端，运行以下命令。看到 `200` 和给定的 `service` 字段，就验证了示例读取到了环境文件。确认后回第一个终端按 `Ctrl + C`，释放 3000 端口。

```bash
curl -fsS -w '\nHTTP %{http_code}\n' http://127.0.0.1:3000/api/health
```

```text
{"ok":true,"service":"my-api-from-dotenv","environment":"production"}
HTTP 200
```

同名环境变量已经由 shell 或服务管理器设置时，Node 会优先使用那些值。示例让 `.env` 提供这三个变量。在正式项目中从相同来源管理同一变量，并使用 `.env.example` 记录变量名和无敏感性的示例。拥有锁文件的已有项目可在服务器中执行 `npm ci --omit=dev`。如果项目要先编译，按项目构建说明生成产物，再安装或保留运行所需依赖。 [Node.js 的环境变量](https://nodejs.org/docs/latest-v24.x/api/environment_variables.html)

## 3. 交给 PM2 并验证工作目录

按部署用户的 Node/npm 安装方式准备 PM2，例如使用该用户可写的全局 npm 前缀后运行 `npm install --global pm2`。运行 `pm2 --version` 确认命令可用。之后启动、保存和查看进程都用同一个部署用户。

在 `$HOME/apps/my-api` 新建 `ecosystem.config.cjs`。`__dirname` 指向配置文件所在的绝对目录。`cwd` 明确了相对脚本路径和 `.env` 的查找位置。

```js
module.exports = {
  apps: [
    {
      name: 'my-api',
      cwd: __dirname,
      script: './server.mjs',
      node_args: '--env-file=.env',
      autorestart: true,
      restart_delay: 2000
    }
  ]
}
```

```bash
cd "$HOME/apps/my-api"
pm2 start ecosystem.config.cjs --only my-api
pm2 describe my-api
pm2 logs my-api --lines 30 --nostream
curl -fsS -w '\nHTTP %{http_code}\n' http://127.0.0.1:3000/api/health
```

在 `pm2 describe` 中核对 `exec cwd` 为实际项目目录、脚本为 `server.mjs`，日志应包含端口提示。返回的 `service` 仍须为 `my-api-from-dotenv`。把 `.env` 中的 `APP_LABEL` 改为 `my-api-restart-check`，再执行以下命令，两次结果的服务名不同即可确认 PM2 确实重新读取了配置。

```bash
pm2 restart my-api
curl -fsS http://127.0.0.1:3000/api/health
```

如果修改的是 `ecosystem.config.cjs` 的启动配置，从项目目录按配置重载 `pm2 restart ecosystem.config.cjs --only my-api --update-env`，再核对进程和健康检查。

Linux 使用 systemd 时，在部署用户下运行 `pm2 startup`，按它输出的命令安装启动服务，再以同一部署用户运行 `pm2 save`。重启计划允许时，重启后执行 `pm2 list` 和健康检查验收。升级 Node 安装路径后，按 PM2 指引重新生成 systemd 启动配置。 [PM2 配置文件](https://pm2.keymetrics.io/docs/usage/application-declaration/) · [PM2 开机启动](https://pm2.keymetrics.io/docs/usage/startup/)

## 4. 接入 Nginx

先确认本机直连接口返回 200，再将以下 `location` 放进该站点已有的 `server` 配置。`proxy_pass` 只写上游地址，保留 `/api/health` 路径。

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -fsS -w '\nHTTP %{http_code}\n' https://你的域名/api/health
```

最后一条命令需要把 `你的域名` 换成已有 HTTPS 配置的域名。若直连工作、域名失败，先确认请求命中正确的 Nginx 站点。正式项目依赖代理转发的客户端 IP 或协议时，按实际代理拓扑设置 Express 的 `trust proxy`。同源部署可通过 `/api` 请求后端。跨源部署按允许的前端来源配置 CORS。 [第 3 篇：Nginx、反向代理与 HTTPS](/console/article-directory/articles/nginx-https-f134e6f0) · [Express：代理后的部署](https://expressjs.com/en/guide/behind-proxies.html)

## 5. 按现象排查

| 现象 | 检查 |
| --- | --- |
| Node 提示找不到 `.env` | 看 `pwd` 或 `pm2 describe my-api` 的 `exec cwd`，确认文件在该目录，且部署用户有读取权限 |
| PM2 显示 `online`，本机接口无法访问 | 看 `pm2 logs my-api --lines 50 --nostream`，检查端口、启动错误及是否反复重启 |
| `EADDRINUSE` | 检查前台测试进程是否已停止，或者本机是否已有服务监听 3000 |
| `service` 与 `.env` 不同 | 检查同名 shell/PM2 环境变量，确认启动参数含 `--env-file=.env` 并重启 |
| 域名返回 502，本机接口正常 | 核对 Nginx 上游地址和端口、站点配置及 Nginx 错误日志 |
| 域名返回 404，本机接口正常 | 核对 `location` 和 `proxy_pass` 得到的实际路径 |

接下来可把数据库连接加入应用启动流程。 [第 5 篇：MongoDB 生产安全、连接与备份](/console/article-directory/articles/mongodb-ad14cd5a)
