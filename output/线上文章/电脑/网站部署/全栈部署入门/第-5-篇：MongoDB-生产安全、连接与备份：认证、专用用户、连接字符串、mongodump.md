---
title: "第 5 篇：MongoDB 生产安全、连接与备份：认证、专用用户、连接字符串、mongodump"
slug: "mongodb-ad14cd5a"
summary: "MongoDB 上线安全笔记，讲清认证、专用用户、网络暴露限制、连接字符串、mongodump 备份和生产数据库常见安全边界。"
category: "全栈部署入门"
categoryPath:
  - "电脑"
  - "网站部署"
  - "全栈部署入门"
tags:
  - "MongoDB"
  - "数据库安全"
  - "备份"
  - "mongodump"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5ac"
originalSlug: "mongodb-ad14cd5a"
originalStatus: "published"
publishedAt: "2026-06-08T11:09:58.538Z"
updatedAt: "2026-08-16T14:39:48.203Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---

# 第 5 篇：MongoDB 生产安全、连接与备份：认证、专用用户、连接字符串、mongodump

以 Linux 同机部署为例。Express 与 MongoDB 在一台服务器，应用库使用 `my_app`。已经运行的库应先确认管理员账号、备份和维护窗口，再调整网络或认证。云数据库使用服务商的私有网络、TLS、账号与备份控制台。

| 使用场景 | 连接与权限 |
| --- | --- |
| Express 应用 | 连接 `127.0.0.1:27017`，`my_app` 库的 `readWrite` |
| 生产备份 | 从生产服务器本机读取 `my_app`，单独的备份用户 |
| 恢复演练 | 在独立演练实例恢复至 `my_app_restore_drill`，用演练账号验证 |

## 1. 配置监听和认证

从 MongoDB 官方软件源安装与发行版匹配的受支持版本。数据库服务、`mongosh` 和 MongoDB Database Tools 是不同的组件，可分别用 `mongod --version`、`mongosh --version`、`mongodump --version` 和 `mongorestore --version` 检查。

Linux 官方软件包常用 `/etc/mongod.conf`。用 `systemctl cat mongod` 可确认服务实际加载的配置位置。将以下键合并到已有 YAML。每个顶级键只出现一次，因为重复定义可能覆盖原有设置。

```yaml
net:
  port: 27017
  bindIp: 127.0.0.1
security:
  authorization: enabled
```

```bash
sudo systemctl restart mongod
sudo systemctl status mongod --no-pager
sudo ss -ltnp 'sport = :27017'
```

监听结果应包含 `127.0.0.1:27017`。同机应用用这个地址，云安全组和主机防火墙都可保持 27017 对外关闭。异机应用走受限的私有地址，用网络规则限定应用来源，并按部署要求启用 TLS。 [MongoDB 安全检查清单](https://www.mongodb.com/docs/manual/administration/security-checklist/)

### 新实例创建第一个管理员

只有实例还没有任何用户或角色时，启用认证后可在服务器本机使用 MongoDB 的 localhost exception 创建第一个管理员。运行 `mongosh --host 127.0.0.1 --port 27017`，在 Shell 执行如下命令。`passwordPrompt()` 会提示输入密码。

```js
db.getSiblingDB('admin').createUser({
  user: 'user_admin',
  pwd: passwordPrompt(),
  roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }]
})
```

已有用户的实例请用现有管理员登录。`userAdminAnyDatabase` 能授予其他权限，应作为独立的管理身份使用。创建首个用户后退出，使用以下命令重新登录。`--username` 提供用户名，省略 `--password` 由客户端提示输入。

```bash
mongosh --host 127.0.0.1 --port 27017 --username user_admin --authenticationDatabase admin
```

确认可以执行用户查询，例如 `db.getSiblingDB('admin').getUser('user_admin')`。确认登录成功再退出当前管理会话。 [MongoDB 本机例外](https://www.mongodb.com/docs/manual/core/localhost-exception/) · [MongoDB 内置角色](https://www.mongodb.com/docs/manual/reference/built-in-roles/)

## 2. 给应用和备份分配不同账号

在已认证的管理员 Shell 中执行。分别输入两份独立密码。

```js
db.getSiblingDB('my_app').createUser({
  user: 'app_user',
  pwd: passwordPrompt(),
  roles: [{ role: 'readWrite', db: 'my_app' }]
})

db.getSiblingDB('my_app').createUser({
  user: 'my_app_backup',
  pwd: passwordPrompt(),
  roles: [{ role: 'read', db: 'my_app' }]
})
```

应用账号的角色作用域为 `my_app`。备份示例只导出该数据库，角色按单库读取配置。如果改成全实例备份或涉及集群额外对象，按对应拓扑核对 MongoDB 备份权限。 [MongoDB mongodump：所需访问权限](https://www.mongodb.com/docs/database-tools/mongodump/#required-access)

退出管理员 Shell，验证应用登录。MongoDB `ping` 可以在未认证时返回成功，因此使用 `connectionStatus` 确认当前身份，再用 `getCollectionInfos` 验证实际业务库的读取权限。

```bash
mongosh --host 127.0.0.1 --port 27017 --username app_user --authenticationDatabase my_app my_app
```

```js
db.runCommand({ connectionStatus: 1 }).authInfo.authenticatedUsers
db.getCollectionInfos({}, { nameOnly: true })
```

第一条应返回 `app_user` 和认证库 `my_app`，第二条可列出应用集合。还可直接打开一个未提供用户名的 `mongosh` 会话，对 `my_app` 运行同一列表命令。认证正常时应报 `Unauthorized`。

## 3. 应用使用连接字符串

修改部署用户自己的 `.env`。把密码位置替换成应用账号密码在 URI 中对应的百分号编码文本。`@` 写作 `%40`，`#` 写作 `%23`，`%` 写作 `%25`。`authSource=my_app` 对应创建用户的数据库。

```dotenv
MONGODB_URI=mongodb://app_user:REPLACE_WITH_ENCODED_PASSWORD@127.0.0.1:27017/my_app?authSource=my_app
```

保持 `.env` 权限为 600。以第 4 篇的 Node.js 24 示例为基础，先运行 `npm install mongoose`，然后在入口添加 `import mongoose from 'mongoose'`。在 `app.listen` 前执行如下代码。文件没有变量或数据库不可用时进程退出，PM2 日志能看到哪个阶段失败。

```js
if (!process.env.MONGODB_URI) {
  throw new Error('请检查 .env 中的 MONGODB_URI')
}

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
await mongoose.connection.db.command({ ping: 1 })
console.log('MongoDB connection ready')
```

用 `node --env-file=.env server.mjs` 前台验证，正式进程用原 PM2 配置启动。检查健康接口以及一个实际读库的业务接口。 [MongoDB 连接字符串](https://www.mongodb.com/docs/manual/reference/connection-string/) · [第 4 篇：Node 和 PM2 加载环境变量](/console/article-directory/articles/node-express-pm2-b0b0327c)

## 4. 备份单个业务库

确认实例地址、数据库名和可用空间后，在源服务器本机执行。密码由工具交互提示，备份文件由当前用户持有。

```bash
umask 077
mkdir -p "$HOME/mongo-backups"
archive="$HOME/mongo-backups/my_app-$(date -u +%Y%m%dT%H%M%SZ).archive.gz"
mongodump --host 127.0.0.1 --port 27017 \
  --username my_app_backup --authenticationDatabase my_app \
  --db my_app --archive="$archive" --gzip
```

确认 `mongodump` 以 0 退出，再运行以下命令确认文件非空并生成校验记录。保存到有权限控制的独立存储或备份服务，并保留文件和校验记录。

```bash
test -s "$archive" && sha256sum "$archive" > "$archive.sha256"
ls -lh "$archive" "$archive.sha256"
```

有持续写入的实例应根据恢复目标选用一致性备份方案。单库逻辑导出适用于本节演练。跨集合一致性要求较高时，应计划暂停相关写入，或采用部署拓扑支持的快照及时间点恢复。自动化备份可按所用版本的 Database Tools 文档使用受限权限的 `--config` 文件或备份服务。先验证手工备份和恢复，再定时执行。 [MongoDB 备份方式](https://www.mongodb.com/docs/manual/core/backups/) · [mongodump 参数](https://www.mongodb.com/docs/database-tools/mongodump/)

## 5. 仅在独立实例演练恢复

下面的示例在独立演练机上运行。它假设已有启用认证的演练 MongoDB 监听 `127.0.0.1:27018`，且该实例中没有正式应用。演练实例管理员可在该实例的 `admin` 库给 `drill_restore` 配置 `restore` 角色，用于恢复操作。另用演练实例管理员创建专用读取账号 `drill_reader`，只授予 `my_app_restore_drill` 的 `read`。

将备份和校验文件复制到演练机。下面将备份改名为 `my_app.backup.archive.gz` 时，校验值仍须与源服务器生成的值一致。也可以保留原名，并使用原文件名校验。

```bash
archive="$HOME/mongo-backups/my_app.backup.archive.gz"
sha256sum "$archive"
```

先预演，并检查日志只匹配 `my_app.*`，目标是 `my_app_restore_drill.*`。如果已经存在演练数据，另选一个空的演练库名。恢复命令使用固定的演练端口和显式命名空间。

```bash
mongorestore --host 127.0.0.1 --port 27018 \
  --username drill_restore --authenticationDatabase admin \
  --archive="$archive" --gzip \
  --nsInclude='my_app.*' --nsFrom='my_app.*' --nsTo='my_app_restore_drill.*' \
  --dryRun --verbose
```

预演成功后，保留相同地址、账号和命名空间，执行对应恢复命令。

```bash
mongorestore --host 127.0.0.1 --port 27018 \
  --username drill_restore --authenticationDatabase admin \
  --archive="$archive" --gzip \
  --nsInclude='my_app.*' --nsFrom='my_app.*' --nsTo='my_app_restore_drill.*' \
  --stopOnError
```

在演练实例用读取账号核对恢复结果。`--authenticationDatabase` 应填写实际创建读取账号的数据库。

```bash
mongosh --host 127.0.0.1 --port 27018 --username drill_reader \
  --authenticationDatabase my_app_restore_drill my_app_restore_drill
```

先用 `db.getName()` 确认当前库，再用 `db.getCollectionNames()` 核对集合。用应用关键集合和备份时记录的基准对照文档数、索引、样本记录及只读业务查询。将恢复耗时和失败条目记入演练结果。正式库故障的处理由独立发布或恢复流程决定。 [mongorestore 的命名空间映射与预演](https://www.mongodb.com/docs/database-tools/mongorestore/)

## 6. 按错误定位

| 症状 | 先检查 |
| --- | --- |
| `Authentication failed` | 用户创建在哪个库、`authSource` 是否一致、URI 中的密码特殊字符是否编码 |
| `Unauthorized` | 使用 `connectionStatus` 确认身份，再检查操作针对哪个库、角色是否包含所需权限 |
| `ECONNREFUSED` | 服务状态、实际监听地址和端口，用 `ss` 和 `journalctl -u mongod` 核对 |
| 程序迟迟连不上数据库 | 本机绑定或私网路由、网络规则、认证和 TLS 配置，先用 `mongosh` 验证 |
| 恢复日志显示 0 个集合 | 核对备份来源、`--archive`、`--gzip` 和 `--nsInclude` 是否匹配源库 |
