---
title: "第 4 篇：Node、Express、PM2 与环境变量：生产运行、日志、开机自启、Nginx 联调"
slug: "node-express-pm2-b0b0327c"
summary: "Express 生产运行入门，讲清为什么不能只靠 npm run dev，如何配置健康检查、环境变量、PM2 常驻运行、日志、开机自启和 Nginx 反向代理联调。"
category: "全栈部署入门"
tags: ["Node.js","Express","PM2","环境变量","日志","开机自启","Nginx"]
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5a4"
originalSlug: "node-express-pm2-b0b0327c"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 4 篇：Node、Express、PM2 与环境变量：生产运行、日志、开机自启、Nginx 联调

资料核对时间：2026-06-08。

这一篇解决后端上线：

> Express 怎么在服务器上稳定运行？

先说结论：

```txt
Express 负责处理接口。
PM2 负责让 Express 在后台持续运行。
Nginx 负责把公网 /api 请求转发给 Express。
```

## 1. 开发运行和生产运行不一样

开发时你可能这样：

```bash
npm run dev
```

这通常会启动热更新、调试日志、开发工具。

生产时更常见：

```bash
# 安装生产依赖
npm install --omit=dev

# 用生产环境变量启动
NODE_ENV=production node app.js
```

但是直接 `node app.js` 还有问题：

- SSH 断开后进程可能停止。
- 应用崩溃后不会自动重启。
- 服务器重启后不会自动启动。
- 日志管理不方便。

所以需要 PM2 或 systemd。

Express 官方生产最佳实践也建议生产环境使用反向代理，并使用进程管理器来提高稳定性。

## 2. 一个最小 Express 入口

下面是一个适合部署练习的 `app.js`：

```js
import express from 'express'
import process from 'node:process'

const app = express()

// 允许 Express 解析 JSON 请求体，例如 POST /api/users 时传入 JSON
app.use(express.json())

// 健康检查接口，用来验证后端进程是否真的活着
// 部署排查时，先 curl 这个接口，比直接猜问题更可靠
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'api is running',
    env: process.env.NODE_ENV || 'development'
  })
})

// 示例接口，确认 Nginx /api 反向代理是否能转到 Express
app.get('/api/articles', (req, res) => {
  res.json([
    { id: 1, title: '第一篇文章' },
    { id: 2, title: '第二篇文章' }
  ])
})

// PORT 从环境变量读取，方便开发、测试、生产使用不同端口
const port = Number(process.env.PORT || 3000)

// 生产部署时通常让 Express 监听 127.0.0.1
// 这样外网不能直接访问 3000，只能通过 Nginx 转发进来
app.listen(port, '127.0.0.1', () => {
  console.log(`api listening on http://127.0.0.1:${port}`)
})
```

如果你暂时没有用 ESM，可以用 CommonJS 写法。关键不是语法，而是：

- 有健康检查。
- 端口从环境变量读。
- 生产环境不要随意监听 `0.0.0.0` 暴露给公网。

## 3. `.env` 环境变量

后端项目根目录放一个 `.env`：

```bash
# 当前运行环境
NODE_ENV=production

# Express 监听端口
PORT=3000

# MongoDB 连接字符串
# 密码要换成强密码，且不要提交到公开仓库
MONGODB_URI=mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app
```

如果项目使用 `dotenv`：

```js
import 'dotenv/config'

// dotenv/config 会把 .env 里的变量加载到 process.env
console.log(process.env.MONGODB_URI)
```

注意：

```bash
# .gitignore
# .env 里通常有密码，不能提交
.env
```

## 4. 在服务器上准备后端项目

假设后端放在：

```txt
/opt/my-express-api
```

命令：

```bash
# 进入 /opt
cd /opt

# 拉代码，地址换成自己的仓库
git clone https://github.com/your-name/my-express-api.git

# 进入项目
cd my-express-api

# 安装依赖
npm install --omit=dev

# 创建生产环境变量文件
nano .env
```

写完 `.env` 后，先本机测试：

```bash
# 先直接启动一次，确认代码和环境变量没问题
NODE_ENV=production node app.js
```

另开一个 SSH 窗口测试：

```bash
# 在服务器本机访问健康检查
curl http://127.0.0.1:3000/api/health
```

能返回 JSON，说明 Express 本身通了。

## 5. PM2 是什么

PM2 是 Node.js 常用进程管理器。

它主要解决：

- 后台运行。
- 崩溃重启。
- 日志查看。
- 多应用管理。
- 开机自启。

安装：

```bash
# 全局安装 PM2
npm install -g pm2
```

启动：

```bash
# 启动 app.js，并把进程命名为 my-api
pm2 start app.js --name my-api
```

查看：

```bash
# 查看 PM2 管理的应用
pm2 list

# 查看日志
pm2 logs my-api

# 重启应用
pm2 restart my-api

# 停止应用
pm2 stop my-api
```

保存进程列表：

```bash
# 保存当前 PM2 进程列表，配合开机自启使用
pm2 save
```

配置开机自启：

```bash
# 生成开机自启命令
# 执行后 PM2 会输出一段 sudo 命令，按它提示复制执行
pm2 startup
```

小白重点：

```txt
pm2 start 是启动应用。
pm2 save 是保存当前启动列表。
pm2 startup 是配置服务器重启后自动恢复。
```

## 6. PM2 配置文件写法

可以新建 `ecosystem.config.cjs`：

```js
module.exports = {
  apps: [
    {
      // PM2 里显示的应用名
      name: 'my-api',

      // Express 入口文件
      script: './app.js',

      // 生产环境变量
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      },

      // 应用异常退出后自动重启
      autorestart: true,

      // 最大内存限制，超过后 PM2 会重启应用
      // 小项目可以先写 300M，后续按服务器内存调整
      max_memory_restart: '300M'
    }
  ]
}
```

启动：

```bash
# 使用配置文件启动
pm2 start ecosystem.config.cjs

# 查看日志
pm2 logs my-api
```

## 7. 让 Nginx 转发给 PM2 管理的 Express

PM2 管的是进程，不负责公网入口。

公网入口仍然是 Nginx：

```nginx
location /api/ {
  # Express 由 PM2 守护，监听本机 3000
  proxy_pass http://127.0.0.1:3000;

  # 传递真实请求信息给 Express
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

联调顺序：

```bash
# 第一步：确认 Express 本机可访问
curl http://127.0.0.1:3000/api/health

# 第二步：确认 Nginx 配置没错
sudo nginx -t

# 第三步：确认域名 API 能访问
curl https://example.com/api/health
```

如果第一步失败，看 Express 和 PM2。

如果第一步成功、第三步失败，看 Nginx。

## 8. Express 生产安全小点

### 不要信任所有代理

如果你要在 Express 里读取真实 IP，需要了解 `trust proxy`。

```js
// 只有当 Express 前面确实有 Nginx 这类反向代理时才考虑开启
// 开启后 Express 会更信任 X-Forwarded-* 头
app.set('trust proxy', 1)
```

不要不理解就乱开。因为请求头可能被伪造，具体要结合部署拓扑判断。

### CORS 不要全放开

开发时可能这样：

```js
// 开发练习可以临时允许所有来源
app.use(cors())
```

生产更建议指定前端域名：

```js
app.use(cors({
  // 只允许自己的前端域名访问接口
  origin: 'https://example.com',

  // 如果使用 Cookie 登录，需要开启 credentials
  credentials: true
}))
```

### 不要把错误详情直接返回给用户

```js
app.use((err, req, res, next) => {
  // 服务端日志可以记录详细错误
  console.error(err)

  // 返回给用户的内容要克制，避免泄漏路径、SQL、连接字符串等敏感信息
  res.status(500).json({
    message: '服务器内部错误'
  })
})
```

## 9. 常见问题

### PM2 显示 online，但接口访问失败

先看日志：

```bash
pm2 logs my-api
```

再本机测试：

```bash
curl http://127.0.0.1:3000/api/health
```

可能原因：

- 端口不是 3000。
- 应用只监听了别的地址。
- `.env` 没加载。
- 代码启动成功，但接口路径不是 `/api/health`。

### Nginx 502

常见原因：

- PM2 里的 Express 没启动。
- `proxy_pass` 端口写错。
- Express 启动后马上崩溃。
- 防火墙或监听地址异常。

### 修改代码后没有生效

检查是否忘了：

```bash
# 拉新代码后重新安装依赖
npm install --omit=dev

# 重启 PM2 应用
pm2 restart my-api
```

## 10. 这一篇的练习

你可以完成：

```bash
# 进入后端项目
cd /opt/my-express-api

# 安装依赖
npm install --omit=dev

# 用 PM2 启动
pm2 start app.js --name my-api

# 查看状态
pm2 list

# 测试健康检查
curl http://127.0.0.1:3000/api/health

# 查看日志
pm2 logs my-api
```

学完这一篇，你应该能说清楚：

```txt
Express 是接口程序。
PM2 让接口程序常驻运行。
Nginx 把用户访问的 /api 转给 Express。
.env 保存生产环境变量和数据库连接。
```

## 官方资料

- Express Production Best Practices：https://expressjs.com/en/advanced/best-practice-performance.html
- PM2 Runtime Overview：https://pm2.io/docs/runtime/overview/
