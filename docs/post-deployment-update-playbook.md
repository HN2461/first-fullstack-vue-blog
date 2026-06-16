# 首次部署后的模块化更新发布手册

本文档用于解决：项目首次部署成功后，本地继续迭代开发，后续如何用更标准、更工程化的方式更新服务器。

本文档不再推荐“逐个找文件、逐个上传”的方式作为正式流程。单文件上传只适合临时试错或紧急补丁，不适合作为长期发布规范。

后续正式更新统一拆成 3 个模块：

```text
模块 A：前端整包更新
模块 B：后端整包更新
模块 C：数据库脚本变更
```

不同迭代只组合需要的模块：

| 本次改动 | 需要执行的模块 |
|---|---|
| 只改页面样式、文案、交互 | 模块 A |
| 只改后端接口逻辑，不改数据库字段 | 模块 B |
| 前端页面和后端接口一起改，但不改数据库字段 | 模块 A + 模块 B |
| 新增字段、调整模型、修复历史数据 | 模块 B + 模块 C，通常也会带模块 A |
| 只新增图片、附件、旧文章资源 | 资源模块，见第 8 节 |

当前服务器默认目录：

```text
项目源码目录：/opt/fullstack-blog/current
前端发布目录：/var/www/fullstack-blog
发布包目录：/opt/fullstack-blog/releases
备份目录：/opt/fullstack-blog/backups
后端 PM2 进程：fullstack-blog-api
数据库名称：personal_fullstack_blog
```

如果服务器还没有 `releases` 目录，先执行一次：

```bash
mkdir -p /opt/fullstack-blog/releases
mkdir -p /opt/fullstack-blog/backups
```

## 1. 先判断本次属于哪类发布

### 1.1 本地查看改动

在本地项目根目录执行：

```powershell
cd "C:\Users\HN246\Desktop\全栈\个人全栈博客系统"
git status --short
git diff --name-only
```

这一步不是为了一个个上传文件，而是为了判断本次发布要走哪些模块。

### 1.2 判断规则

| 改动位置 | 说明 | 发布模块 |
|---|---|---|
| `client/src/**` | Vue 页面、样式、交互 | 模块 A |
| `client/package.json` | 前端依赖变化 | 模块 A，且本地或服务器要重新安装依赖 |
| `server/src/routes/**` | 接口路径、入参、出参 | 模块 B |
| `server/src/services/**` | 后端业务逻辑、查询、统计 | 模块 B |
| `server/src/validators/**` | 参数校验 | 模块 B |
| `server/src/models/**` | Mongoose 数据模型 | 模块 B + 模块 C 风险检查 |
| `server/src/scripts/**` | 数据修复、迁移、初始化脚本 | 模块 B + 模块 C |
| `server/package.json` | 后端依赖变化 | 模块 B，服务器要 `npm ci` |
| `shared/src/**` | 前后端共享常量、枚举、规则 | 通常模块 A + 模块 B |
| `.env` | 运行配置 | 配置模块，见第 9 节 |
| `uploads/**`、`legacy-notes/**` | 图片、附件、旧资源 | 资源模块，见第 8 节 |

### 1.3 本次是否涉及数据库的快速判断

只要满足下面任意一条，就按“涉及数据库变更”处理：

```text
改了 server/src/models/**
改了 server/src/scripts/** 并准备执行
新增了需要长期保存的字段
修改了字段类型，例如字符串改数组
新增了索引、唯一约束
需要给历史文章、分类、用户补字段
需要批量修复线上已有数据
```

如果只是：

```text
调整查询排序
调整统计口径
修复接口空值兼容
修改错误提示
修改权限判断
修改接口返回的临时计算字段
```

通常是“改后端接口，但不改数据库结构”，走模块 B 即可。

## 2. 标准发布总流程

后续每次发布都按这个顺序走。

```text
1. 本地确认改动范围
2. 本地测试和构建
3. 按模块制作发布包
4. 上传发布包到 /opt/fullstack-blog/releases
5. 服务器备份当前线上版本
6. 服务器解压发布包到临时目录
7. 用 rsync 同步到正式目录
8. 执行必要的 npm ci、数据库脚本、前端同步、PM2 重启
9. 健康检查
10. 浏览器验收
```

这个流程的重点是：

```text
上传的是包，不是零散文件
服务器用命令解压和同步
每次发布有备份
前端、后端、数据库分模块处理
```

## 3. 模块 A：前端整包更新

适用情况：

```text
只改前端页面
只改样式和交互
前端和后端一起改时的前端部分
```

前端标准发布物不是源码，而是：

```text
client/dist
```

也就是 Vite 打包后的浏览器可访问文件。

### 3.1 本地构建前端

本地 PowerShell 执行：

```powershell
cd "C:\Users\HN246\Desktop\全栈\个人全栈博客系统"
npm run build
```

构建成功后得到：

```text
C:\Users\HN246\Desktop\全栈\个人全栈博客系统\client\dist
```

### 3.2 本地打包 dist

不要用 XFTP 直接拖整个 `assets` 文件夹。大量小文件逐个传输会非常慢，也容易中断。

改成把整个 `dist` 压缩成一个包：

```powershell
cd "C:\Users\HN246\Desktop\全栈\个人全栈博客系统\client\dist"
Compress-Archive -Path * -DestinationPath "$env:USERPROFILE\Desktop\fullstack-blog-frontend.zip" -Force
```

生成：

```text
C:\Users\HN246\Desktop\fullstack-blog-frontend.zip
```

### 3.3 上传前端发布包

用 XFTP 上传：

```text
本地：C:\Users\HN246\Desktop\fullstack-blog-frontend.zip
服务器：/opt/fullstack-blog/releases/fullstack-blog-frontend.zip
```

只上传一个压缩包，速度和稳定性都比上传整个 `assets` 目录好。

### 3.4 服务器备份当前前端

Xshell 执行：

```bash
tar -czf /opt/fullstack-blog/backups/frontend-before-$(date +%F-%H%M%S).tar.gz -C /var/www/fullstack-blog .
```

### 3.5 服务器解压并覆盖发布

```bash
rm -rf /tmp/fullstack-blog-frontend
mkdir -p /tmp/fullstack-blog-frontend
unzip -o /opt/fullstack-blog/releases/fullstack-blog-frontend.zip -d /tmp/fullstack-blog-frontend
rsync -a --delete /tmp/fullstack-blog-frontend/ /var/www/fullstack-blog/
```

解释：

```text
unzip 解压到临时目录，不直接解压到线上目录
rsync --delete 让线上前端目录和新 dist 完全一致
```

### 3.6 前端发布验证

```bash
ls -la /var/www/fullstack-blog
ls -la /var/www/fullstack-blog/assets | head
curl http://127.0.0.1
curl http://你的服务器公网IP
```

浏览器访问：

```text
http://你的服务器公网IP
```

如果页面仍是旧内容，先强制刷新：

```text
Ctrl + F5
```

### 3.7 前端模块不需要做什么

如果本次只改前端，不需要：

```bash
pm2 restart fullstack-blog-api
mongodump
mongorestore
npm run create:admin --workspace server
systemctl restart nginx
```

## 4. 模块 B：后端项目整包更新

适用情况：

```text
只改后端接口
前后端一起改时的后端部分
新增后端依赖
调整 shared 共享规则
新增数据库脚本但尚未执行
```

后端发布不要逐个上传 `server/src` 下的文件。标准做法是打一个后端源码包，服务器统一解压同步。

### 4.1 后端包应该包含什么

后端包建议包含：

```text
server/**
shared/**
package.json
package-lock.json
```

如本次前端源码也希望同步到服务器源码目录，可额外包含：

```text
client/src/**
client/package.json
```

后端包不要包含：

```text
node_modules
client/node_modules
server/node_modules
client/dist
uploads
legacy-notes
.env
coverage
.playwright-cli
```

原因：

```text
node_modules 应由服务器 npm ci 生成
client/dist 是前端发布包负责
uploads 和 legacy-notes 是线上资源，不能被源码包覆盖
.env 是服务器运行配置，不能用本地 .env 覆盖
```

### 4.2 本地制作后端源码包

在本地 PowerShell 执行：

```powershell
cd "C:\Users\HN246\Desktop\全栈\个人全栈博客系统"

$releaseRoot = "$env:TEMP\fullstack-blog-backend-release"
Remove-Item -Recurse -Force $releaseRoot -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $releaseRoot | Out-Null

Copy-Item -Recurse -Force server "$releaseRoot\server"
Copy-Item -Recurse -Force shared "$releaseRoot\shared"
Copy-Item -Force package.json "$releaseRoot\package.json"
Copy-Item -Force package-lock.json "$releaseRoot\package-lock.json"

Remove-Item -Recurse -Force "$releaseRoot\server\node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$releaseRoot\shared\node_modules" -ErrorAction SilentlyContinue

Compress-Archive -Path "$releaseRoot\*" -DestinationPath "$env:USERPROFILE\Desktop\fullstack-blog-backend.zip" -Force
```

生成：

```text
C:\Users\HN246\Desktop\fullstack-blog-backend.zip
```

如果本次也想同步前端源码到服务器源码目录，可以在压缩前补充：

```powershell
New-Item -ItemType Directory -Force "$releaseRoot\client" | Out-Null
Copy-Item -Recurse -Force client\src "$releaseRoot\client\src"
Copy-Item -Force client\package.json "$releaseRoot\client\package.json"
```

注意：同步前端源码不是前端上线的必要条件。前端真正上线看模块 A 的 `dist` 包。

### 4.3 上传后端发布包

用 XFTP 上传：

```text
本地：C:\Users\HN246\Desktop\fullstack-blog-backend.zip
服务器：/opt/fullstack-blog/releases/fullstack-blog-backend.zip
```

### 4.4 服务器备份当前后端源码

```bash
tar -czf /opt/fullstack-blog/backups/backend-before-$(date +%F-%H%M%S).tar.gz \
  -C /opt/fullstack-blog/current \
  server shared package.json package-lock.json
```

如果本次会同步 `client/src`，也可以备份：

```bash
tar -czf /opt/fullstack-blog/backups/client-source-before-$(date +%F-%H%M%S).tar.gz \
  -C /opt/fullstack-blog/current \
  client/src client/package.json
```

### 4.5 服务器解压到临时目录

```bash
rm -rf /tmp/fullstack-blog-backend
mkdir -p /tmp/fullstack-blog-backend
unzip -o /opt/fullstack-blog/releases/fullstack-blog-backend.zip -d /tmp/fullstack-blog-backend
```

### 4.6 服务器同步到项目目录

```bash
rsync -a --delete /tmp/fullstack-blog-backend/server/ /opt/fullstack-blog/current/server/
rsync -a --delete /tmp/fullstack-blog-backend/shared/ /opt/fullstack-blog/current/shared/
cp /tmp/fullstack-blog-backend/package.json /opt/fullstack-blog/current/package.json
cp /tmp/fullstack-blog-backend/package-lock.json /opt/fullstack-blog/current/package-lock.json
```

如果包里包含了 `client/src`：

```bash
rsync -a --delete /tmp/fullstack-blog-backend/client/src/ /opt/fullstack-blog/current/client/src/
cp /tmp/fullstack-blog-backend/client/package.json /opt/fullstack-blog/current/client/package.json
```

这里不使用一个 `rsync` 直接覆盖整个 `/opt/fullstack-blog/current`，是为了保护：

```text
.env
uploads
legacy-notes
node_modules
client/dist
```

这些不是后端源码包应该覆盖的内容。

### 4.7 是否需要 npm ci

如果本次改了这些文件：

```text
package.json
package-lock.json
server/package.json
client/package.json
shared/package.json
```

服务器执行：

```bash
cd /opt/fullstack-blog/current
npm ci
```

如果没有依赖变化，可以跳过。

不确定是否有依赖变化时，执行一次 `npm ci` 也可以，只是会多花一些时间。

### 4.8 重启后端

```bash
cd /opt/fullstack-blog/current
pm2 restart fullstack-blog-api
pm2 list
```

后端是常驻 Node 进程，源码同步后必须重启 PM2，新代码才会被加载。

### 4.9 后端发布验证

```bash
curl http://127.0.0.1:3001/api/health
curl http://你的服务器公网IP/api/health
pm2 logs fullstack-blog-api --lines 50
```

然后验收本次改过的业务接口和页面。

## 5. 模块 C：数据库脚本变更

适用情况：

```text
新增数据库字段
修改 Mongoose 模型字段
需要补历史数据
需要修复线上已有数据
需要执行 server/src/scripts 下的脚本
需要整库迁移或恢复
```

数据库变更必须独立成一个模块，不能混在“后端重启”里顺手做。

### 5.1 数据库变更的基本原则

```text
先备份，再执行
能 dry-run 就先 dry-run
脚本执行前确认目标数据库
脚本执行后检查数据量和关键页面
正式环境不要随便 mongorestore --drop
```

### 5.2 服务器备份数据库

```bash
mongodump --uri="mongodb://127.0.0.1:27017/personal_fullstack_blog" \
  --archive="/opt/fullstack-blog/backups/db-before-$(date +%F-%H%M%S).gz" \
  --gzip
```

确认备份存在：

```bash
ls -lh /opt/fullstack-blog/backups/db-before-*.gz | tail
```

### 5.3 上传数据库脚本

数据库脚本属于后端源码的一部分，通常跟模块 B 的后端整包一起上传。

脚本位置：

```text
server/src/scripts
```

已有脚本命令示例：

```bash
npm run migrate --workspace server
npm run migrate:dry-run --workspace server
npm run migrate:audit --workspace server
npm run migrate:repair --workspace server
npm run fix:timestamps --workspace server
```

### 5.4 执行脚本前确认

执行脚本前，至少确认 4 件事：

```text
脚本要改哪个集合？
脚本是新增、更新还是删除数据？
有没有 dry-run？
执行失败如何回退？
```

如果脚本支持 dry-run：

```bash
cd /opt/fullstack-blog/current
npm run migrate:dry-run --workspace server
```

确认输出符合预期后，再执行真实命令。

### 5.5 执行脚本

示例：

```bash
cd /opt/fullstack-blog/current
npm run migrate:repair --workspace server
```

具体执行哪个脚本，以本次需求为准，不要把所有脚本都跑一遍。

### 5.6 脚本后检查数据量

```bash
mongosh --quiet --eval '
db = db.getSiblingDB("personal_fullstack_blog");
print("articles=" + db.articles.countDocuments());
print("categories=" + db.categories.countDocuments());
print("tags=" + db.tags.countDocuments());
print("users=" + db.users.countDocuments());
print("media=" + db.media.countDocuments());
'
```

如果文章、分类、用户等数量突然异常，先停止继续操作，查看脚本日志和备份。

### 5.7 整库恢复只用于特殊情况

`mongorestore --drop` 是覆盖，不是合并。

只适合：

```text
试运行阶段用本地库覆盖服务器
新服务器迁移
灾难恢复
明确要回滚到某个备份点
```

正式运行后，不要把本地旧库随便覆盖服务器。

## 6. 三种常见组合发布

### 6.1 只改前端

执行：

```text
模块 A
```

不执行：

```text
模块 B
模块 C
PM2 重启
数据库备份
```

除非你想额外备份前端目录。

### 6.2 只改后端接口

执行：

```text
模块 B
```

不执行：

```text
模块 A
模块 C
前端 dist 发布
数据库恢复
```

如果接口改动影响页面展示，但前端代码没变，也不需要重新打包前端。

### 6.3 前后端一起改，但不改数据库

执行：

```text
模块 A
模块 B
```

建议顺序：

```text
1. 后端整包更新
2. PM2 重启
3. 前端整包更新
4. 统一验收
```

原因：

```text
新前端可能会请求新接口
先让后端新接口上线，再发布新前端更稳
```

### 6.4 前后端一起改，并涉及数据库字段或历史数据

执行：

```text
模块 B
模块 C
模块 A
```

建议顺序：

```text
1. 数据库备份
2. 后端整包更新
3. npm ci，如果依赖变化
4. 执行数据库 dry-run，如果有
5. 执行数据库脚本
6. 重启 PM2
7. 前端整包更新
8. 健康检查和业务验收
```

原因：

```text
数据库规则和后端逻辑要先准备好
前端最后发布，避免页面先请求到后端尚不支持的新字段
```

## 7. 多人协作下的发布规范

多人开发时，不能只靠“我记得自己改了哪些文件”。必须有发布边界。

### 7.1 最低协作规范

建议每个需求至少做到：

```text
一个需求一个分支
合并前本地 build/test 通过
合并前说明是否影响数据库
合并前说明是否改 .env
合并前说明是否新增依赖
发布时以合并后的主分支为准打包
```

### 7.2 提交说明必须包含的内容

每次准备发布，写一段发布说明：

```text
发布版本：
发布时间：
发布人：
涉及需求：
前端是否变更：
后端是否变更：
数据库是否变更：
是否新增依赖：
是否修改 .env：
是否需要执行脚本：
回滚方式：
验收页面：
验收接口：
```

### 7.3 仅靠 Git 不能自动解决什么

Git 能解决：

```text
记录谁改了什么
合并代码
发现文本冲突
回退代码版本
```

Git 不能自动解决：

```text
接口字段是否前后端一致
数据库历史数据是否需要补字段
线上 .env 是否需要同步调整
上传资源文件是否完整
脚本执行后数据是否正确
多人需求是否在业务上互相覆盖
```

所以多人协作时，Git 是基础，但还需要发布说明、测试、备份和验收。

### 7.4 企业级方向的推荐演进

当前阶段可以继续使用：

```text
本地打包 zip
XFTP 上传
Xshell 解压发布
```

后续项目变大后，建议演进到：

```text
Git 仓库托管
分支开发
Pull Request / Merge Request
CI 自动构建前端 dist
CI 自动跑测试
CI 产出前端包、后端包
服务器只拉取发布包
数据库迁移脚本有编号和执行记录
```

但在你现在这个阶段，不需要一步到 CI/CD。先把“整包发布 + 模块化发布 + 数据库脚本独立管理”建立起来，就已经比手工传单文件可靠很多。

## 8. 资源文件模块

资源文件包括：

```text
uploads
legacy-notes
```

适用情况：

```text
新增图片
新增附件
替换旧文章图片
补齐历史静态资源
```

### 8.1 资源更新方式

如果资源少，可以 XFTP 上传到对应目录：

```text
/opt/fullstack-blog/current/uploads
/opt/fullstack-blog/current/legacy-notes
```

如果资源多，也建议压缩包上传：

```powershell
Compress-Archive -Path "C:\你的资源目录\*" -DestinationPath "$env:USERPROFILE\Desktop\blog-resources.zip" -Force
```

上传到：

```text
/opt/fullstack-blog/releases/blog-resources.zip
```

服务器：

```bash
rm -rf /tmp/blog-resources
mkdir -p /tmp/blog-resources
unzip -o /opt/fullstack-blog/releases/blog-resources.zip -d /tmp/blog-resources
```

再按目标资源类型同步到对应目录。

### 8.2 资源更新是否要动数据库

只上传文件，不改数据库记录：

```text
不用动数据库
不用重启 PM2
```

如果同时修改文章正文里的图片路径、媒体库记录、资源 URL：

```text
按模块 C 处理
先备份数据库
再改数据或执行脚本
```

## 9. 配置模块：.env 变更

`.env` 是服务器运行配置，不应该跟随源码包被覆盖。

常见配置：

```text
NODE_ENV
SERVER_PORT
CLIENT_ORIGIN
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
UPLOAD_DIR
OLD_NOTES_DIR
ADMIN_USERNAME
ADMIN_EMAIL
ADMIN_PASSWORD
```

### 9.1 修改 .env 的流程

服务器备份：

```bash
cp /opt/fullstack-blog/current/.env /opt/fullstack-blog/backups/env-before-$(date +%F-%H%M%S).bak
```

编辑：

```bash
vim /opt/fullstack-blog/current/.env
```

限权：

```bash
chmod 600 /opt/fullstack-blog/current/.env
```

重启后端：

```bash
pm2 restart fullstack-blog-api
curl http://127.0.0.1:3001/api/health
```

### 9.2 什么时候需要 create:admin

只有改了下面这些时，才需要：

```text
ADMIN_USERNAME
ADMIN_EMAIL
ADMIN_PASSWORD
```

执行：

```bash
cd /opt/fullstack-blog/current
npm run create:admin --workspace server
```

普通 `.env` 改动不需要每次执行 `create:admin`。

## 10. 回滚思路

### 10.1 前端回滚

找到发布前备份：

```bash
ls -lh /opt/fullstack-blog/backups/frontend-before-*.tar.gz
```

恢复：

```bash
rm -rf /tmp/frontend-rollback
mkdir -p /tmp/frontend-rollback
tar -xzf /opt/fullstack-blog/backups/frontend-before-你的时间.tar.gz -C /tmp/frontend-rollback
rsync -a --delete /tmp/frontend-rollback/ /var/www/fullstack-blog/
```

### 10.2 后端回滚

找到备份：

```bash
ls -lh /opt/fullstack-blog/backups/backend-before-*.tar.gz
```

恢复：

```bash
rm -rf /tmp/backend-rollback
mkdir -p /tmp/backend-rollback
tar -xzf /opt/fullstack-blog/backups/backend-before-你的时间.tar.gz -C /tmp/backend-rollback
rsync -a --delete /tmp/backend-rollback/server/ /opt/fullstack-blog/current/server/
rsync -a --delete /tmp/backend-rollback/shared/ /opt/fullstack-blog/current/shared/
cp /tmp/backend-rollback/package.json /opt/fullstack-blog/current/package.json
cp /tmp/backend-rollback/package-lock.json /opt/fullstack-blog/current/package-lock.json
cd /opt/fullstack-blog/current
npm ci
pm2 restart fullstack-blog-api
```

### 10.3 数据库回滚

数据库恢复是高风险操作，确认要回到某个备份点再执行：

```bash
mongorestore --drop --gzip --archive=/opt/fullstack-blog/backups/db-before-你的时间.gz
pm2 restart fullstack-blog-api
```

注意：`--drop` 会覆盖当前线上数据。

## 11. 一页速查

### 11.1 只改前端

本地：

```powershell
npm run build
cd "C:\Users\HN246\Desktop\全栈\个人全栈博客系统\client\dist"
Compress-Archive -Path * -DestinationPath "$env:USERPROFILE\Desktop\fullstack-blog-frontend.zip" -Force
```

上传：

```text
fullstack-blog-frontend.zip -> /opt/fullstack-blog/releases/
```

服务器：

```bash
tar -czf /opt/fullstack-blog/backups/frontend-before-$(date +%F-%H%M%S).tar.gz -C /var/www/fullstack-blog .
rm -rf /tmp/fullstack-blog-frontend
mkdir -p /tmp/fullstack-blog-frontend
unzip -o /opt/fullstack-blog/releases/fullstack-blog-frontend.zip -d /tmp/fullstack-blog-frontend
rsync -a --delete /tmp/fullstack-blog-frontend/ /var/www/fullstack-blog/
curl http://127.0.0.1
```

### 11.2 只改后端

本地制作 `fullstack-blog-backend.zip`，上传到：

```text
/opt/fullstack-blog/releases/fullstack-blog-backend.zip
```

服务器：

```bash
tar -czf /opt/fullstack-blog/backups/backend-before-$(date +%F-%H%M%S).tar.gz -C /opt/fullstack-blog/current server shared package.json package-lock.json
rm -rf /tmp/fullstack-blog-backend
mkdir -p /tmp/fullstack-blog-backend
unzip -o /opt/fullstack-blog/releases/fullstack-blog-backend.zip -d /tmp/fullstack-blog-backend
rsync -a --delete /tmp/fullstack-blog-backend/server/ /opt/fullstack-blog/current/server/
rsync -a --delete /tmp/fullstack-blog-backend/shared/ /opt/fullstack-blog/current/shared/
cp /tmp/fullstack-blog-backend/package.json /opt/fullstack-blog/current/package.json
cp /tmp/fullstack-blog-backend/package-lock.json /opt/fullstack-blog/current/package-lock.json
cd /opt/fullstack-blog/current
npm ci
pm2 restart fullstack-blog-api
curl http://127.0.0.1:3001/api/health
```

### 11.3 前后端一起改

执行：

```text
先模块 B，后模块 A
```

也就是：

```text
先上传并发布后端整包
再上传并发布前端 dist 整包
最后统一验收
```

### 11.4 涉及数据库

先执行：

```bash
mongodump --uri="mongodb://127.0.0.1:27017/personal_fullstack_blog" \
  --archive="/opt/fullstack-blog/backups/db-before-$(date +%F-%H%M%S).gz" \
  --gzip
```

再：

```text
发布后端整包
执行 dry-run，如果有
执行真实数据库脚本
重启后端
发布前端整包
验收数据和页面
```

## 12. 不再推荐的方式

以下方式只适合临时调试，不作为正式发布流程：

```text
逐个查找改动文件
逐个拖文件到服务器
逐个覆盖线上文件
靠记忆判断有没有漏传
直接把本地 .env 覆盖服务器 .env
直接把 node_modules 上传服务器
直接把本地数据库覆盖正式服务器
```

正式流程应该是：

```text
前端 dist 整包
后端源码整包
数据库脚本单独确认
服务器备份
服务器解压
rsync 同步
PM2 重启
验收
```
