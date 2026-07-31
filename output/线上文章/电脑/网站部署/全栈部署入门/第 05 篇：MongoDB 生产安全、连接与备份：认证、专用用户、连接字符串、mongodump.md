---
title: "第 5 篇：MongoDB 生产安全、连接与备份：认证、专用用户、连接字符串、mongodump"
slug: "mongodb-ad14cd5a"
summary: "MongoDB 上线安全笔记，讲清认证、专用用户、网络暴露限制、连接字符串、mongodump 备份和生产数据库常见安全边界。"
category: "全栈部署入门"
tags: ["MongoDB","数据库安全","认证","连接字符串","mongodump","备份"]
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5ac"
originalSlug: "mongodb-ad14cd5a"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 5 篇：MongoDB 生产安全、连接与备份：认证、专用用户、连接字符串、mongodump

资料核对时间：2026-06-08。

MongoDB 本地学习时很简单：

```txt
能连接，能增删改查，就觉得可以了。
```

但生产环境不一样。

生产数据库最怕：

- 没有认证。
- 端口暴露到公网。
- 所有人共用管理员账号。
- 密码写在代码里。
- 没有备份。
- 出问题才想起安全。

MongoDB 官方安全清单明确强调访问控制、认证授权、网络暴露控制、最小权限等原则。

## 1. 自建 MongoDB 和云数据库怎么选

### 自建 MongoDB

意思是你在自己的服务器上安装 MongoDB。

优点：

- 便宜。
- 能完整练习部署。
- 能了解数据库服务怎么运行。

缺点：

- 安全要自己管。
- 备份要自己管。
- 升级要自己管。
- 服务器压力也要自己看。

### 云数据库

例如 MongoDB Atlas 或云厂商数据库。

优点：

- 安全配置更规范。
- 备份和监控更省心。
- 适合上线项目。

缺点：

- 成本可能更高。
- 部分配置要按平台规则来。

小白建议：

```txt
学习部署链路：可以自建一次 MongoDB。
真正上线重要项目：优先考虑云数据库或至少做好备份和访问控制。
```

## 2. 不要把 27017 裸露到公网

MongoDB 默认端口是：

```txt
27017
```

如果你在云安全组或 ufw 里随手开放：

```bash
# 不建议这样做
sudo ufw allow 27017
```

就可能让公网机器都能尝试访问你的数据库。

更推荐：

```txt
Express 和 MongoDB 在同一台服务器：
  MongoDB 只监听 127.0.0.1。
  Express 用 mongodb://127.0.0.1:27017 连接。

Express 和 MongoDB 不在同一台服务器：
  使用云数据库白名单、内网连接、VPN 或 SSH 隧道。
```

小白理解：

```txt
前端页面要公开。
后端 API 要受控制地公开。
数据库不要直接公开给所有人。
```

## 3. 开启认证和专用用户

生产环境要创建应用专用用户。

示例目标：

```txt
数据库名：my_app
用户名：app_user
权限：只能读写 my_app
```

在 `mongosh` 中创建用户：

```js
// 切换到业务数据库
use my_app

// 创建项目专用用户
db.createUser({
  user: 'app_user',

  // 真实项目要换成强密码，不要使用示例密码
  pwd: 'strong_password',

  roles: [
    {
      // readWrite 表示只能读写这个数据库
      role: 'readWrite',

      // 限制权限只作用于 my_app 数据库
      db: 'my_app'
    }
  ]
})
```

为什么不直接用管理员账号？

- 管理员权限太大。
- 应用被攻破时，数据库损失会更大。
- 最小权限是生产环境基本原则。

## 4. 连接字符串怎么写

Express `.env` 示例：

```bash
# 用户名 app_user
# 密码 strong_password
# 连接本机 MongoDB
# authSource=my_app 表示用 my_app 数据库里的用户认证
MONGODB_URI=mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app
```

Node 里读取：

```js
import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI

if (!uri) {
  // 启动时就发现配置缺失，比运行中才报错更好排查
  throw new Error('MONGODB_URI 未配置')
}

await mongoose.connect(uri)

console.log('MongoDB connected')
```

小白重点：

- 连接字符串里有密码。
- 不要把它写进 GitHub。
- 不要截图发到公开地方。

## 5. MongoDB 配置文件里要注意什么

MongoDB 常见配置文件路径可能是：

```txt
/etc/mongod.conf
```

核心思路：

```yaml
# mongod.conf 示例片段
net:
  # 只监听本机地址，Express 和 MongoDB 同机时很适合
  bindIp: 127.0.0.1

  # MongoDB 默认端口
  port: 27017

security:
  # 开启认证
  authorization: enabled
```

修改后需要重启 MongoDB：

```bash
# 重启 MongoDB 服务
sudo systemctl restart mongod

# 查看运行状态
sudo systemctl status mongod
```

注意：

```txt
不同系统、不同安装方式，配置路径和服务名可能不同。
以你实际安装方式和官方文档为准。
```

## 6. 备份：不要等出事才想起来

MongoDB 官方 Database Tools 里包含 `mongodump` 和 `mongorestore`。

备份命令示例：

```bash
# 创建备份目录
mkdir -p /backup/mongodb

# 备份 my_app 数据库
# --uri 使用连接字符串
# --out 指定备份输出目录
mongodump \
  --uri="mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app" \
  --out="/backup/mongodb/$(date +%F)"
```

恢复命令示例：

```bash
# 从某一天的备份恢复
# 恢复前一定确认目标数据库和环境，避免覆盖错库
mongorestore \
  --uri="mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app" \
  "/backup/mongodb/2026-06-08/my_app"
```

更安全的做法是：

- 备份不要只放在同一台服务器。
- 备份要定期测试能不能恢复。
- 重要项目前先做恢复演练。

## 7. 定时备份脚本示例

可以创建一个脚本，例如：

```bash
#!/usr/bin/env bash

# 一旦命令失败就停止，避免备份失败还继续往下执行
set -e

# 数据库连接字符串，真实项目建议从安全位置读取，不要写死在公开脚本里
MONGO_URI="mongodb://app_user:strong_password@127.0.0.1:27017/my_app?authSource=my_app"

# 备份根目录
BACKUP_ROOT="/backup/mongodb"

# 使用日期作为本次备份目录名
TODAY="$(date +%F)"

# 创建当天备份目录
mkdir -p "$BACKUP_ROOT/$TODAY"

# 执行备份
mongodump --uri="$MONGO_URI" --out="$BACKUP_ROOT/$TODAY"

# 删除 14 天前的旧备份，避免磁盘被备份撑满
# 真实项目删除前要确认备份策略符合业务要求
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -r {} \;

echo "MongoDB backup finished: $BACKUP_ROOT/$TODAY"
```

设置定时任务前，先手动运行一次确认没有报错。

## 8. Express 连接 MongoDB 的启动顺序

推荐：

```js
import express from 'express'
import mongoose from 'mongoose'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

const port = Number(process.env.PORT || 3000)
const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  throw new Error('MONGODB_URI 未配置')
}

// 先连接数据库，再启动 HTTP 服务
// 这样启动成功就代表核心依赖已经准备好
await mongoose.connect(mongoUri)

app.listen(port, '127.0.0.1', () => {
  console.log(`api listening on http://127.0.0.1:${port}`)
})
```

好处：

- 数据库连不上时，应用不会假装启动成功。
- PM2 日志里能更快看到原因。
- Nginx 502 时能更快定位到后端启动失败。

## 9. 常见错误

### Authentication failed

可能原因：

- 用户名错。
- 密码错。
- `authSource` 写错。
- 用户建在别的数据库。

### ECONNREFUSED

可能原因：

- MongoDB 没启动。
- 端口不对。
- `bindIp` 只监听了别的地址。
- Express 和 MongoDB 不在同一台机器，但连接地址写成了 `127.0.0.1`。

### 连接很慢或超时

可能原因：

- 网络不通。
- 云安全组没放行。
- 防火墙拦截。
- 云数据库白名单没加服务器 IP。

## 10. 上线前 MongoDB 检查清单

- 已开启认证。
- 已创建应用专用用户。
- 应用用户只拥有必要权限。
- `.env` 没提交到 Git。
- 连接字符串没有出现在前端代码里。
- MongoDB 没有对全公网裸露。
- 生产数据库有备份。
- 至少做过一次恢复演练。
- 日志里没有打印完整数据库密码。

## 官方资料

- MongoDB Security Checklist：https://www.mongodb.com/docs/manual/administration/security-checklist/
- MongoDB Database Tools：https://www.mongodb.com/docs/database-tools/
- MongoDB `mongodump`：https://www.mongodb.com/docs/database-tools/mongodump/
- MongoDB `mongorestore`：https://www.mongodb.com/docs/database-tools/mongorestore/
