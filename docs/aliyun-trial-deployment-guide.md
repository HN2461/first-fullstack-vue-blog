# 阿里云试用服务器部署与数据迁移实战手册

本文档基于一次真实部署过程整理，目标是让你下次可以不依赖对话，自己独立把项目从本地部署到阿里云试用 ECS，并完成本地 MongoDB 数据迁移。

适用对象：

- 已经有一台阿里云 ECS 试用服务器
- 已经安装 Xshell 和 XFTP
- 本地项目可以正常运行
- 本地 MongoDB 里已经有博客数据

本文档假设本次项目名称为 `个人全栈博客系统`，部署路径为：

```text
/opt/fullstack-blog/current
```

公网访问地址示例为：

```text
http://8.146.236.23
```

如果你下次使用的是另一台服务器，只需要替换 IP、账号密码、目录路径即可。

## 1. 最终部署结构

部署完成后的结构如下：

```text
浏览器
  -> Nginx :80
     -> /            前端静态资源 /var/www/fullstack-blog
     -> /api         反向代理到 Express 127.0.0.1:3001
     -> /uploads     反向代理到 Express 静态资源
     -> /legacy-notes 反向代理到 Express 静态资源

Express API
  -> 127.0.0.1:3001
  -> MongoDB 127.0.0.1:27017

MongoDB
  -> 数据库名 personal_fullstack_blog
```

为什么这样设计：

- 前端由 Nginx 托管，访问更稳定
- 后端只监听本机，减少暴露面
- 数据库只监听本机，避免公网风险
- 前后端访问都走同一个域名/IP，前端不用改接口地址逻辑

### 1.1 先理解这次到底在部署什么

这次部署不是“把一个文件夹传到服务器”这么简单，而是把一个完整系统拆成几块，再分别放到它们最合适的位置：

1. 代码
   例如 `client/`、`server/`、`shared/` 这些源码目录，它们放在 `/opt/fullstack-blog/current`。
2. 前端发布产物
   也就是 `npm run build` 之后生成的网页静态文件，它们不再是源码，而是浏览器真正访问的成品，所以放在 `/var/www/fullstack-blog`。
3. 运行配置
   例如 `.env`，用来告诉程序“当前服务器该怎么运行”。
4. 数据库数据
   例如文章、分类、标签、用户、点赞、评论等，这些不在代码目录里，而在 MongoDB 中。
5. 资源文件
   例如图片、头像、封面、附件、旧静态博客里的图片资源，这些通常不放进数据库正文里，而是单独放在磁盘目录中。

如果把这 5 类东西分清楚，后面你看到任何部署命令就都不会迷糊。

### 1.2 为什么代码放在 `/opt/fullstack-blog/current`

`/opt` 在 Linux 里通常用来放“自己安装的软件”和“自己部署的项目”。这比把项目丢在 `/root`、`/tmp` 或杂乱目录里更适合长期维护。

本次选择：

```text
/opt/fullstack-blog/current
```

原因是：

- `fullstack-blog` 是这个项目的总目录
- `current` 表示当前正在运行的版本
- 后面如果你想做多版本切换，可以再建立 `releases/` 目录
- 代码目录、备份目录、资源目录都能围绕它组织起来

这是一种标准化部署思路：不是为了“能跑一次”，而是为了以后还看得懂、改得动、换得了版本。

### 1.3 为什么前端成品放在 `/var/www/fullstack-blog`

`client/` 里的 Vue 代码是“源码”，浏览器不能直接稳定地拿来生产运行，所以必须经过：

```bash
npm run build
```

构建之后得到的是：

- `index.html`
- `assets/*.js`
- `assets/*.css`

这些是“网页成品”，不再是源码，所以更适合放在：

```text
/var/www/fullstack-blog
```

这样做的原因：

- `Nginx` 非常擅长直接返回静态文件
- 源码目录和发布目录分开，更清晰
- 即使源码目录以后调整，`Nginx` 也只关心发布成品目录

所以一定要区分这两件事：

- `/opt/fullstack-blog/current/client`：前端源码
- `/var/www/fullstack-blog`：前端发布文件

### 1.4 为什么一定要有 `.env`

`.env` 不是“多余文件”，而是部署里最重要的配置文件之一。

它解决的是：同一套代码，在不同环境里运行参数不一样。

比如本地开发时你可能需要：

- `NODE_ENV=development`
- `CLIENT_ORIGIN=http://127.0.0.1:5173`

但服务器上需要：

- `NODE_ENV=production`
- `CLIENT_ORIGIN=http://你的服务器IP或域名`

再比如这些信息也都应该放进 `.env`：

- 后端监听端口
- 数据库连接地址
- JWT 密钥
- 管理员初始化账号
- 上传目录路径
- 旧静态资源目录路径

为什么不写死在代码里：

- 本地和服务器参数不一样
- 有些信息是敏感信息，不适合写死进仓库
- 换服务器时，只改 `.env`，代码可以不动

你可以把 `.env` 理解成：这台服务器运行这套博客系统时的“操作说明书”。

### 1.5 为什么资源要放 `uploads/` 和 `legacy-notes/`

数据库很适合存结构化数据，例如：

- 文章标题
- 正文
- 分类
- 标签
- 用户资料

但数据库不适合直接拿大量二进制文件当正文去塞，例如：

- 封面图
- 附件
- 头像
- 历史文章里的静态图片

所以通常会分成两部分：

1. 数据库存“路径和元信息”
2. 磁盘目录存“真实文件本体”

`uploads/` 的作用是存当前系统上传出来的文件，比如：

- 媒体库图片
- 用户头像
- 封面图
- 附件

`legacy-notes/` 的作用是存旧静态博客留下来的资源，例如旧 markdown 文章里引用的图片、附件、嵌入内容。

为什么旧资源也要带上：

- 只迁数据库，不迁旧文件，文章会 404
- 文章正文里往往只记录资源路径，不包含资源本体

所以“文章内容能显示”不代表“文章里的图片附件就一定完整”，这也是部署时经常被忽略的一层。

### 1.6 数据库、迁移、覆盖、备份到底是什么关系

这次你用的是 MongoDB。可以把它理解成博客系统的数据仓库，里面存的是：

- 文章
- 分类
- 标签
- 用户
- 媒体记录
- 评论、点赞、收藏等业务数据

#### 什么叫迁移

这次你做的“迁移”主要是：

- 把本机 MongoDB 的数据导出
- 上传到服务器
- 再恢复到服务器 MongoDB 中

这属于“环境之间的数据迁移”。

另一种“迁移”是把旧静态 markdown 导入新系统数据库，那属于“内容形态迁移”。

#### 迁移会不会覆盖

会，尤其是你使用：

```bash
mongorestore --drop ...
```

这里的 `--drop` 就表示：

- 先删服务器里同名集合
- 再按备份里的内容重建

所以这不是“合并”，而更像“用备份重铺一遍”。

#### 本地和服务器能不能来回覆盖

技术上可以，管理上要谨慎。

在试运行阶段：

- 本地可当主数据源
- 服务器可以反复被本地覆盖

在正式运行阶段：

- 服务器通常才是主数据源
- 不要再随意拿本地整库覆盖服务器

否则很容易出现这种问题：

- 本地新增了内容
- 服务器后台也新增了内容
- 你再用本地整库恢复
- 服务器新加的内容就被冲掉了

#### 为什么必须备份

因为恢复、覆盖、脚本执行、误删、环境损坏都可能让当前状态丢失。

部署里至少要备份 3 类东西：

1. MongoDB 数据库
2. `uploads/` 和 `legacy-notes/` 文件资源
3. `.env` 配置文件

备份的意义不是“形式上更规范”，而是出问题时你能回退。

## 2. 本地部署前检查

在本地项目根目录执行：

```powershell
cd "C:\Users\HN246\Desktop\全栈\个人全栈博客系统"
npm run test
npm run build
npm run check:encoding
```

检查通过后再开始上传服务器。

本地数据检查：

```powershell
mongosh personal_fullstack_blog --quiet --eval "print('articles=' + db.articles.countDocuments())"
mongosh personal_fullstack_blog --quiet --eval "print('categories=' + db.categories.countDocuments())"
mongosh personal_fullstack_blog --quiet --eval "print('tags=' + db.tags.countDocuments())"
mongosh personal_fullstack_blog --quiet --eval "print('users=' + db.users.countDocuments())"
mongosh personal_fullstack_blog --quiet --eval "print('media=' + db.media.countDocuments())"
```

本次真实部署时，本机数据为：

```text
articles=414
categories=79
tags=791
users=9
media=5
```

如果你的数据量接近预期，说明本机数据库就是正确的数据源。

## 3. 服务器基础信息确认

使用 Xshell 登录服务器后执行：

```bash
cat /etc/os-release
uname -a
whoami
df -h
free -h
```

本次实际环境：

```text
系统：Alibaba Cloud Linux 3
架构：x86_64
用户：root
磁盘：49G
内存：3.5G
```

这类配置足够支撑个人博客试跑。

## 4. 安全组和端口建议

阿里云安全组建议只放开：

```text
22   SSH
80   HTTP
443  HTTPS（以后绑定域名再用）
```

不要放开：

```text
3001  Express 内部端口
27017 MongoDB 数据库端口
```

原因很简单：后端和数据库都只应该给本机访问。

## 5. 安装服务器依赖

### 5.1 更新系统和安装基础工具

```bash
dnf makecache
dnf upgrade-minimal --security -y
dnf install -y curl wget git unzip tar gzip vim nano rsync lsof net-tools bind-utils gcc gcc-c++ make openssl
```

### 5.2 安装 Node.js

Alibaba Cloud Linux 3 的仓库中已经提供 Node 20，可直接安装：

```bash
dnf install -y nodejs npm
node -v
npm -v
```

### 5.3 安装 PM2

```bash
npm install -g pm2
pm2 -v
```

### 5.4 安装并确认 Nginx

安装方式因服务器源配置可能不同，但本次环境最终已成功安装并可执行：

```bash
nginx -v
```

### 5.5 安装并确认 MongoDB 与工具

确认以下命令存在：

```bash
mongod --version
mongosh --version
mongodump --version
```

## 6. 核心命令自检

在服务器上执行：

```bash
for cmd in node npm pm2 nginx mongod mongosh mongodump git curl rsync unzip; do
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "[已安装] $cmd -> $(command -v $cmd)"
  else
    echo "[未安装] $cmd"
  fi
done
```

如果这几个命令都存在，说明部署环境完整：

- `node`
- `npm`
- `pm2`
- `nginx`
- `mongod`
- `mongosh`
- `mongodump`

## 7. 创建部署目录

在服务器执行：

```bash
mkdir -p /opt/fullstack-blog/current
mkdir -p /opt/fullstack-blog/backups
mkdir -p /var/www/fullstack-blog
mkdir -p /opt/fullstack-blog/current/uploads
mkdir -p /opt/fullstack-blog/current/legacy-notes
```

目录用途说明：

```text
/opt/fullstack-blog/current       项目源码
/opt/fullstack-blog/backups       数据库与文件备份
/var/www/fullstack-blog           前端构建产物
/opt/fullstack-blog/current/uploads      上传资源
/opt/fullstack-blog/current/legacy-notes 旧静态笔记资源
```

## 8. 用 XFTP 上传项目

本地项目目录：

```text
C:\Users\HN246\Desktop\全栈\个人全栈博客系统
```

上传到服务器：

```text
/opt/fullstack-blog/current
```

建议不要上传这些目录：

```text
node_modules
client/node_modules
server/node_modules
client/dist
```

可以上传但非必需的开发痕迹：

```text
.git
.codex-logs
.playwright-cli
.qoder
```

本次真实上传后，服务器目录应至少包含：

```text
client
server
shared
scripts
package.json
package-lock.json
README.md
.env 或 .env.example
uploads
legacy-notes
```

检查命令：

```bash
ls /opt/fullstack-blog/current
ls /opt/fullstack-blog/current/package.json
ls /opt/fullstack-blog/current/client/package.json
ls /opt/fullstack-blog/current/server/package.json
ls /opt/fullstack-blog/current/shared
```

## 9. 启动 MongoDB

```bash
systemctl enable --now mongod
systemctl is-active mongod
ss -lntp | grep 27017
```

理想结果：

```text
active
LISTEN 127.0.0.1:27017
```

这代表 MongoDB 正常启动，且只监听本机。

## 10. 配置生产环境 .env

本次本地上传的 `.env` 是开发环境配置：

```env
NODE_ENV=development
CLIENT_ORIGIN=http://127.0.0.1:5173
JWT_SECRET=local-development-secret-change-before-production
```

上线前需要改成生产环境。

在服务器项目根目录执行：

```bash
cd /opt/fullstack-blog/current
```

然后写入生产配置：

```bash
cat > .env <<'EOF'
NODE_ENV=production
SERVER_PORT=3001
CLIENT_ORIGIN=http://8.146.236.23
MONGODB_URI=mongodb://127.0.0.1:27017/personal_fullstack_blog
JWT_SECRET=请替换为你生成的强随机密钥
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
OLD_NOTES_DIR=/opt/fullstack-blog/current/legacy-notes
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=请替换为强密码
EOF
```

生成随机密钥可用：

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

然后给 `.env` 限权：

```bash
chmod 600 .env
```

## 11. 安装依赖并构建前端

### 11.1 安装依赖

```bash
cd /opt/fullstack-blog/current
npm ci
```

### 11.2 构建前端

```bash
npm run build
```

本次真实构建结果是成功的，只出现了 Vite 大包体积告警，不影响部署。

### 11.3 同步前端构建产物到 Nginx 目录

```bash
rsync -a --delete client/dist/ /var/www/fullstack-blog/
ls /var/www/fullstack-blog
```

## 12. 创建或更新管理员账号

```bash
cd /opt/fullstack-blog/current
npm run create:admin --workspace server
```

这一步会根据 `.env` 中的管理员信息创建账号，或更新现有账号密码。

### 12.1 为什么要单独创建管理员

很多人第一次部署时会疑惑：为什么数据库都已经恢复了，还要执行一次 `create:admin`？

原因是“后台管理员”不是一个自动存在的概念，而是系统里一类特殊用户。

这个命令的作用是：

- 读取 `.env` 中的 `ADMIN_USERNAME`、`ADMIN_EMAIL`、`ADMIN_PASSWORD`
- 在数据库里查找是否已有这个管理员邮箱
- 如果没有，就创建一个管理员用户
- 如果有，就更新它的用户名、角色、状态和密码

你可以把它理解成“初始化后台入口”的命令。

它解决的是这些问题：

- 新环境刚部署时没有管理员账号怎么办
- 你改了管理员密码后怎么同步到数据库
- 万一恢复的数据里管理员账号异常，怎么重新扶正

这一步不是“创建数据库”，也不是“创建集合”，而是在现有数据库里确保后台可登录的管理员存在。

### 12.2 `npm run create:admin --workspace server` 为什么一执行就能生效

这条命令能生效，不是因为 npm 有魔法，而是因为项目里已经把执行路径写死了。

完整执行链如下：

1. 你在项目根目录执行：

```bash
npm run create:admin --workspace server
```

2. 根目录 `npm` 会进入 `server` 工作区执行它自己的脚本定义：

```json
"create:admin": "node src/scripts/createAdmin.js"
```

3. 所以真正被 Node 执行的文件其实是：

```text
/opt/fullstack-blog/current/server/src/scripts/createAdmin.js
```

4. 这个脚本内部又做了几件事：

- 读取 `env.js`
- `env.js` 会加载项目根目录的 `.env`
- 脚本检查 `ADMIN_USERNAME`、`ADMIN_EMAIL`、`ADMIN_PASSWORD` 是否存在
- 脚本连接 MongoDB
- 去 `users` 集合里按邮箱查找是否已存在对应用户
- 如果存在：更新用户名、角色、状态、密码哈希
- 如果不存在：新建一个管理员用户

5. 执行完成后退出数据库连接

也就是说，这条命令背后的本质是：

```text
npm -> server/package.json -> createAdmin.js -> 读取 .env -> 连接 MongoDB -> 查用户 -> 创建/更新管理员
```

你可以把它理解成一条“自动化维护数据库管理员记录”的命令，而不是一条抽象口令。

### 12.3 这个逻辑在代码里具体写在哪里

如果你下次想自己顺着代码看，可以从这几个文件开始：

- `server/package.json`
  这里定义了 `create:admin` 脚本实际运行 `node src/scripts/createAdmin.js`
- `server/src/scripts/createAdmin.js`
  这里实现了管理员创建/更新逻辑
- `server/src/config/env.js`
  这里负责读取项目根目录 `.env`
- `server/src/config/database.js`
  这里负责连接 MongoDB

你下次如果想验证文档说的是不是真的，不要只盯命令，直接去看这几处代码，会非常清楚。

## 13. 启动后端 API

### 13.1 使用 PM2 启动

```bash
cd /opt/fullstack-blog/current
pm2 start server/src/server.js --name fullstack-blog-api --cwd /opt/fullstack-blog/current --time
pm2 save
pm2 list
```

### 13.2 开机自启

```bash
pm2 startup systemd
```

执行它输出的那条 `sudo env PATH=... pm2 startup systemd ...` 命令后，再执行：

```bash
pm2 save
```

### 13.3 验证后端健康状态

```bash
curl http://127.0.0.1:3001/api/health
```

期望返回：

```json
{"success":true,"message":"success","data":{"service":"personal-fullstack-blog-api","status":"ok"}}
```

## 14. 配置 Nginx

创建配置文件：

```bash
cat > /etc/nginx/conf.d/fullstack-blog.conf <<'EOF'
server {
    listen 80;
    server_name 8.146.236.23;

    root /var/www/fullstack-blog;
    index index.html;

    client_max_body_size 30m;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /legacy-notes/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
```

验证配置：

```bash
nginx -t
```

启动并设为开机自启：

```bash
systemctl enable --now nginx
systemctl is-active nginx
```

验证首页：

```bash
curl http://127.0.0.1
curl http://8.146.236.23
```

验证代理后的后端接口：

```bash
curl http://8.146.236.23/api/health
```

## 15. 本机 MongoDB 数据迁移到服务器

### 15.1 本机确认数据源是否正确

在本机 PowerShell 执行：

```powershell
mongosh personal_fullstack_blog --quiet --eval "print('articles=' + db.articles.countDocuments())"
mongosh personal_fullstack_blog --quiet --eval "print('categories=' + db.categories.countDocuments())"
mongosh personal_fullstack_blog --quiet --eval "print('tags=' + db.tags.countDocuments())"
mongosh personal_fullstack_blog --quiet --eval "print('users=' + db.users.countDocuments())"
mongosh personal_fullstack_blog --quiet --eval "print('media=' + db.media.countDocuments())"
```

如果这里是你预期的数据量，再进行导出。

### 15.2 本机导出数据库

如果 `mongodump` 没进 PATH，可以直接使用工具完整路径。

本次真实路径为：

```text
E:\MongoDB\Tools\bin\mongodump.exe
```

执行导出：

```powershell
& "E:\MongoDB\Tools\bin\mongodump.exe" --db=personal_fullstack_blog --archive="$env:USERPROFILE\Desktop\personal_fullstack_blog_new.gz" --gzip
```

导出完成后，桌面会生成：

```text
C:\Users\HN246\Desktop\personal_fullstack_blog_new.gz
```

### 15.3 上传备份文件到服务器

上传到：

```text
/opt/fullstack-blog/backups/personal_fullstack_blog_new.gz
```

检查大小：

```bash
ls -lh /opt/fullstack-blog/backups/personal_fullstack_blog_new.gz
```

### 15.4 恢复前备份服务器现有数据库

```bash
mongodump --uri="mongodb://127.0.0.1:27017/personal_fullstack_blog" --archive="/opt/fullstack-blog/backups/server-before-restore-$(date +%F-%H%M%S).gz" --gzip
```

### 15.5 恢复本机数据到服务器

```bash
mongorestore --drop --gzip --archive=/opt/fullstack-blog/backups/personal_fullstack_blog_new.gz
```

### 15.6 恢复后检查数据量

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

如果数字与本机接近，说明数据库迁移成功。

### 15.7 重启后端服务

```bash
pm2 restart fullstack-blog-api
curl http://127.0.0.1:3001/api/health
```

## 16. 上传文件与旧笔记资源

数据库之外，还要确认：

- `uploads/` 已上传到服务器
- `legacy-notes/` 已上传到服务器

否则文章里的图片、附件、旧内容资源会 404。

检查命令：

```bash
ls /opt/fullstack-blog/current/uploads
ls /opt/fullstack-blog/current/legacy-notes
```

## 17. 浏览器验收

部署完成后，建议按这个顺序验收：

### 17.1 前台验收

打开：

```text
http://8.146.236.23
```

检查：

- 首页是否正常
- 文章列表是否正常
- 文章详情是否正常
- 图片、上传资源是否正常
- 搜索、分类、标签是否正常

### 17.2 后台验收

打开：

```text
http://8.146.236.23/console
```

检查：

- 管理员能否登录
- 文章管理页是否正常
- 迁移配置页是否正常
- 分类树是否正常
- “默认分类” 是否正常显示
- 媒体管理是否正常

### 17.3 文章阅读体验验收

重点检查：

- 文章详情页滚动是否正常
- 目录浮块是否正常
- 底部工具栏是否正常
- 图片、代码块、Mermaid 是否正常渲染

## 18. 常见问题与排查

### 18.1 `mongodump` 无法识别

现象：

```text
mongodump : 无法将“mongodump”项识别为 cmdlet...
```

原因：

- 工具未安装
- 工具安装了但不在 PATH

解决：

- 找到 `mongodump.exe` 的完整路径，直接执行

### 18.2 服务器有管理员但没有本机文章

现象：

```text
articles=0
categories=1
users=1
```

原因：

- 恢复的是空库
- 导出时库名不对
- 导入的备份文件不是目标库的真实数据

解决：

- 先在本机用 `mongosh personal_fullstack_blog` 查数据量
- 确认有数据后重新导出
- 重新上传并 `mongorestore --drop`

### 18.3 `mongosh --eval` 和别的命令串在一起

现象：

```text
MongoshUnimplementedError: unrecognized option: --update-env
```

原因：

- 把 `pm2 restart ...` 一起粘进了 `mongosh --eval` 命令后面

解决：

- `mongosh` 命令和 `pm2` 命令必须分开执行

### 18.4 Nginx 已启动但页面打不开

检查：

```bash
nginx -t
systemctl status nginx
curl http://127.0.0.1
curl http://8.146.236.23
```

同时检查安全组是否放行了 `80` 端口。

### 18.5 前台打开正常，但接口报错

检查：

```bash
curl http://127.0.0.1:3001/api/health
curl http://8.146.236.23/api/health
pm2 list
pm2 logs fullstack-blog-api --lines 100
```

## 19. 部署成功后的建议动作

部署跑通后，建议继续做这几件事：

### 19.1 修改管理员密码

不要长期使用示例密码。

修改 `.env` 中的：

```env
ADMIN_PASSWORD=新的强密码
```

然后执行：

```bash
npm run create:admin --workspace server
pm2 restart fullstack-blog-api
```

### 19.2 做线上快照备份

```bash
mongodump --uri="mongodb://127.0.0.1:27017/personal_fullstack_blog" --archive="/opt/fullstack-blog/backups/after-online-success-$(date +%F-%H%M%S).gz" --gzip
tar -czf /opt/fullstack-blog/backups/uploads-and-notes-$(date +%F-%H%M%S).tar.gz -C /opt/fullstack-blog/current uploads legacy-notes
```

### 19.3 清理非生产必需目录

这些目录可以后续删除：

```text
.git
.codex-logs
.playwright-cli
.qoder
```

### 19.4 后续再做 MongoDB 鉴权

当前部署阶段用的是本地监听无认证连接，试跑可以接受；正式长期使用时，建议：

- 创建专用数据库用户
- 开启 MongoDB `authorization`
- 修改 `.env` 中的 `MONGODB_URI`

### 19.5 为什么后面建议给数据库加密码

这里说的“数据库密码”，不是让浏览器去连数据库，而是让后端服务以一个专用数据库用户身份连接 MongoDB。

也就是说，最终理想形态不是：

```env
MONGODB_URI=mongodb://127.0.0.1:27017/personal_fullstack_blog
```

而是类似：

```env
MONGODB_URI=mongodb://blog_app:强密码@127.0.0.1:27017/personal_fullstack_blog?authSource=personal_fullstack_blog
```

这样做的原因：

- 即使数据库只监听本机，也不代表完全不需要认证
- 后端程序应该用“专用账号”而不是“默认裸连”
- 可以做到最小权限控制
- 以后正式长期运行时更安全

为什么第一次部署没有强制你立刻做：

- 第一次部署最重要的是先把“前后端链路跑通”
- 数据库认证属于第二阶段加固动作
- 先跑通，再加固，通常更适合学习和排障

如果你后面准备把试用服升级成长期正式环境，这一步就很建议补上。

## 20. 下次独立部署的最短清单

如果你已经熟悉流程，下次可以直接照这个短清单走：

1. 登录 ECS，确认系统和资源
2. 安装 `node/npm/pm2/nginx/mongod/mongosh/mongodump`
3. 创建 `/opt/fullstack-blog/current`、`/var/www/fullstack-blog`
4. XFTP 上传项目源码
5. 启动 `mongod`
6. 写生产 `.env`
7. `npm ci`
8. `npm run build`
9. `npm run create:admin --workspace server`
10. `rsync -a --delete client/dist/ /var/www/fullstack-blog/`
11. `pm2 start server/src/server.js --name fullstack-blog-api --cwd /opt/fullstack-blog/current --time`
12. 配置 Nginx 并 `systemctl enable --now nginx`
13. 本机导出 MongoDB，上传 `.gz`
14. `mongorestore --drop --gzip --archive=...`
15. 上传 `uploads/` 与 `legacy-notes/`
16. `pm2 restart fullstack-blog-api`
17. 浏览器验收前后台

这份手册的核心目标不是“只把项目跑起来”，而是让你下次能知道每一步为什么做、出了问题去哪一层排查。

## 21. 小白复习版补充问答

> 这一段是专门给“下次自己复习时看”的，尽量按“小白先提问，再大白话解释”的方式来写。

### 疑问1：这个项目到底是怎么跑起来的？
#### 大白话解答
- 浏览器先访问 `Nginx`
- `Nginx` 直接把前端页面返回给浏览器
- 浏览器里的前端页面如果要拿文章、登录、评论，就会请求 `/api`
- `Nginx` 再把 `/api` 转发给 `Express` 后端
- `Express` 后端再去 `MongoDB` 数据库里查数据

你可以把它想成：

```text
浏览器 -> Nginx -> 前端页面 / 后端接口 -> MongoDB
```

所以部署不是只“传代码”，而是把这整条链路都搭起来。

### 疑问2：为什么项目代码放在 `/opt/fullstack-blog/current`？
#### 大白话解答
- `/opt` 是 Linux 里适合放第三方项目和自建应用的目录
- `fullstack-blog` 是这个项目自己的总目录
- `current` 表示“当前正在运行的版本”

这样放的好处：

- 代码不会和系统文件混在一起
- 后续升级、回滚、备份都清晰
- 以后你想做 `releases/` 多版本切换也很方便

简单说：这不是为了装样子，而是为了以后还能维护得住。

### 疑问3：为什么前端页面不直接用 `client/`，而要放到 `/var/www/fullstack-blog`？
#### 大白话解答
因为 `client/` 里是 Vue 源码，不是浏览器直接吃的成品。

你执行：

```bash
npm run build
```

之后，Vue 源码才会变成：

- `index.html`
- `assets/*.js`
- `assets/*.css`

这些才是浏览器真正访问的网页成品。

所以：

- `/opt/fullstack-blog/current/client`：源码
- `/var/www/fullstack-blog`：发布后的网页成品

这两个目录不是重复，而是一个负责开发，一个负责对外服务。

### 疑问4：为什么必须有 `.env`？
#### 大白话解答
`.env` 是运行配置文件，可以理解成“这台服务器怎么跑这套代码”的说明书。

它里面放的不是业务逻辑，而是运行参数，比如：

- 当前是开发还是生产环境
- 后端监听哪个端口
- 前端允许从哪个地址访问
- 数据库连接地址是什么
- JWT 密钥是什么
- 管理员初始化账号密码是什么
- 上传目录在哪里

为什么不把这些写死在代码里：

- 本地和服务器环境不一样
- 有些内容是敏感信息
- 以后换服务器时不想改代码，只想改配置

所以 `.env` 不是多出来的文件，而是部署里最重要的文件之一。

### 疑问5：为什么资源要分 `uploads/` 和 `legacy-notes/`？
#### 大白话解答
数据库适合存结构化数据，例如：

- 文章标题
- 正文
- 分类
- 标签
- 用户信息

但不适合直接拿大量图片、附件、历史静态资源去硬塞。

所以通常会分两层：

1. 数据库存“资源路径和元信息”
2. 磁盘目录存“真实文件本体”

`uploads/` 是当前系统上传出来的文件。  
`legacy-notes/` 是旧静态博客留下来的资源。

如果只迁数据库、不迁这些目录，文章可能能打开，但图片和附件会 404。

### 疑问6：数据库迁移是什么意思？是合并还是覆盖？
#### 大白话解答
这次你做的数据迁移，本质上是：

1. 从本机 MongoDB 导出数据
2. 把导出的备份文件传到服务器
3. 在服务器里恢复

如果恢复时用了：

```bash
mongorestore --drop
```

那就是“覆盖式恢复”。

意思是：

- 先把服务器里同名集合删掉
- 再把备份里的内容重新灌进去

所以它更像“用备份重铺一遍”，不是智能合并。

### 疑问7：本地和服务器可以来回覆盖吗？
#### 大白话解答
技术上可以，管理上要分阶段。

试运行阶段：

- 本地可以作为主数据源
- 可以拿本机整库覆盖服务器

正式运行阶段：

- 服务器通常才是主数据源
- 不建议再随意拿本地整库覆盖服务器

因为一旦两边都有人在改数据，就会出现“谁覆盖谁”的问题，最后很容易把线上新内容冲掉。

### 疑问8：为什么一定要备份？备份什么？
#### 大白话解答
因为恢复、覆盖、误删、脚本执行出错、系统损坏都可能发生。

至少要备份 3 类东西：

1. MongoDB 数据库
2. `uploads/` 和 `legacy-notes/`
3. `.env`

为什么 `.env` 也要备份：

- 它里面有 JWT 密钥
- 有数据库连接地址
- 有管理员初始化信息
- 有路径配置

少了它，代码可能还在，但站不一定能立刻重新跑起来。

### 疑问9：`create:admin` 到底是干嘛的？
#### 大白话解答
它不是创建数据库，也不是创建表，而是创建“后台管理员账号”。

这个命令会：

- 读取 `.env` 里的管理员用户名、邮箱、密码
- 去数据库里看这个管理员是否已存在
- 没有就创建
- 有了就更新

它的目的很简单：保证你能登录后台。

所以 `create:admin` 更像“初始化后台入口”，不是“搭数据库结构”。

### 疑问10：为什么后面你还建议给数据库加密码？
#### 大白话解答
这里说的“数据库密码”，不是给浏览器用的，而是给后端程序连接 MongoDB 用的。

现在你的 MongoDB 虽然只监听 `127.0.0.1`，已经比暴露公网安全很多，但它还是无认证连接。

更理想的形态是：

```env
MONGODB_URI=mongodb://app_blog:强密码@127.0.0.1:27017/personal_fullstack_blog?authSource=admin
```

这样做的好处：

- 后端用专用数据库账号连接
- 不是任何本机连接都默认裸连
- 更符合最小权限原则
- 正式长期运行时更安全

第一次部署没有强制你立刻做，是因为第一次最重要的是先把链路跑通。跑通之后，再做数据库加固更稳。

### 疑问11：为什么要同时备份数据库和文件资源？
#### 大白话解答
因为数据库和文件资源不是一回事。

例如：

- 数据库里记录“某篇文章的封面路径是 `/uploads/2026/06/abc.png`”
- 真正的 `abc.png` 文件却在磁盘里

如果你只备份数据库，不备份 `uploads/`，恢复后数据库里还是有路径，但图片本体已经丢了。

所以完整恢复一个博客，不是只恢复 MongoDB，还要一起恢复资源目录。

### 小白速查命令

```bash
# 看后端是不是在线
pm2 list

# 看前端静态页能不能正常返回
curl http://127.0.0.1

# 看后端接口健不健康
curl http://127.0.0.1:3001/api/health

# 导出数据库
mongodump --uri="mongodb://127.0.0.1:27017/personal_fullstack_blog" --archive="xxx.gz" --gzip

# 恢复数据库
mongorestore --drop --gzip --archive=xxx.gz

# 初始化管理员
npm run create:admin --workspace server
```

## 22. 首次部署完成后，后续新增或修改功能怎么办

> 这部分是“以后你继续开发，然后要把新功能发到服务器”时用的。核心思路不是每次都从零部署，而是判断你改的是哪一层，然后只更新那一层。

### 22.1 先记住一个总原则

以后你每次改完功能，不要一上来就慌着传全项目。先问自己：

1. 我改的是前端页面吗？
2. 我改的是后端接口吗？
3. 我改的是前后端共用代码吗？
4. 我改的是数据库结构或脚本吗？
5. 我改的是图片、附件、旧资源吗？
6. 我改的是 `.env` 这种运行配置吗？

不同改动，发版动作不一样。

还有一个最容易被忽略的前提：

> 服务器不会自动知道你本地改了什么。

也就是说，你本地把 Vue、Express、脚本、配置改完之后，如果没有把变更后的文件上传到服务器，那么服务器上执行再多 `npm run build`、`pm2 restart` 都不会得到新功能，因为它读到的还是旧文件。

所以“服务器执行命令”之前，一定先确认：

- 代码是否已经上传到服务器
- 上传的是不是这次真正改过的文件
- 服务器上的文件时间是不是已经更新

### 22.1.1 先判断你改了哪些文件

最简单的方法是在本地项目根目录执行：

```bash
git status --short
```

如果你想看更细：

```bash
git diff --name-only
```

这两条命令的作用不是部署，而是先回答一个关键问题：

> 你这次到底改了哪些文件？

因为只有知道改了哪些文件，后面你才知道该上传哪些、该重建哪一层、该不该重启后端。

### 22.1.2 怎么从“改动文件”判断“改动类型”

下面这张判断表很重要：

| 你改动的位置 | 说明 | 属于哪类改动 | 服务器通常要做什么 |
|---|---|---|---|
| `client/src/**` | Vue 页面、样式、前端交互 | 前端改动 | 上传代码，重新 `build` 前端 |
| `server/src/**` | Express 路由、服务、校验、后端逻辑 | 后端改动 | 上传代码，重启 PM2 |
| `shared/src/**` | 前后端公用常量、枚举、规则 | 前后端联动改动 | 上传代码，通常要 `build` 前端并重启 PM2 |
| `package.json`、`package-lock.json` | 根工作区依赖/脚本变化 | 依赖或脚本改动 | 上传文件，执行 `npm ci` |
| `client/package.json`、`server/package.json` | 子工作区依赖变化 | 依赖改动 | 上传文件，执行 `npm ci` |
| `.env` | 运行配置变化 | 配置改动 | 上传或修改 `.env`，重启 PM2 |
| `uploads/**` | 上传资源变化 | 资源改动 | 上传资源文件 |
| `legacy-notes/**` | 旧静态资源变化 | 资源改动 | 上传资源文件 |
| `server/src/scripts/**` | 迁移/修复/初始化脚本变化 | 脚本或数据库改动 | 上传脚本，谨慎执行，通常先备份数据库 |

这张表的作用就是把“我改了代码”翻译成“服务器该做哪些动作”。

### 22.1.3 服务器执行命令前，完整前置步骤是什么

这是你这次指出得最对的一点：**如果本地改动还没传到服务器，直接在服务器执行命令，根本不会生效。**

所以标准顺序永远是：

1. 本地改代码
2. 本地测试
3. 确认这次改了哪些文件
4. 把这些文件上传到服务器
5. 再根据改动类型执行构建、重启、备份、迁移等命令

少了第 4 步，后面的操作都是在旧文件上白忙。

### 22.1.4 本地改完代码后，怎么把变更带到服务器

如果你现在主要用 XFTP，那么最实用的做法是：

#### 做法 A：直接覆盖上传改动后的文件

适合：

- 改动不多
- 你清楚改了哪些目录
- 当前仍是手工部署阶段

例如：

- 改了 `client/src/`：把对应前端源码目录上传覆盖
- 改了 `server/src/`：把对应后端源码目录上传覆盖
- 改了 `shared/src/`：把共享目录上传覆盖
- 改了根目录 `package.json`、`package-lock.json`：也要一并上传

#### 做法 B：整个项目目录重新上传关键源码

适合：

- 改动较大
- 你不想一个个挑文件
- 当前服务器体量还不大

但即使这样，也建议仍然不要上传：

- `node_modules`
- `client/node_modules`
- `server/node_modules`
- `client/dist`

因为这些东西应该由服务器自己重新生成。

### 22.1.5 上传完以后，怎么确认服务器真的拿到新代码了

你可以在服务器上执行：

```bash
cd /opt/fullstack-blog/current
ls -la
```

重点看：

- 文件修改时间是否已经变成你刚上传的时间
- 关键文件是否已经存在

如果你改的是某个确定文件，也可以直接看它：

```bash
ls -la /opt/fullstack-blog/current/client/src
ls -la /opt/fullstack-blog/current/server/src
```

如果服务器上还是旧时间，说明文件其实没传到位。

### 22.2 如果只是改了前端页面，怎么办？
#### 大白话解答
这种情况最轻。

例如你改了这些：

- Vue 页面样式
- 菜单位置
- 阅读页布局
- 前端交互逻辑

这类改动一般只影响：

- `client/`
- 有时候也会影响 `shared/`

这种情况下，服务器上通常不用重装 MongoDB，也不用动 Nginx 配置，只需要：

1. 上传新源码
2. 重新构建前端
3. 用新 `dist` 覆盖旧 `dist`

命令流程：

```bash
cd /opt/fullstack-blog/current
npm run build
rsync -a --delete client/dist/ /var/www/fullstack-blog/
```

为什么这样就行：

- 前端页面最终是静态文件
- 浏览器访问的是新的 `dist`
- 后端和数据库都没变

### 22.3 如果只是改了后端接口，怎么办？
#### 大白话解答
例如你改了这些：

- 登录逻辑
- 接口参数校验
- 文章发布逻辑
- 分类统计逻辑
- 数据读写规则

这类改动主要影响：

- `server/`
- 有时候会连带 `shared/`

这种情况下：

- 前端静态文件不一定需要重建
- 但后端必须重启

命令流程：

```bash
cd /opt/fullstack-blog/current
pm2 restart fullstack-blog-api
```

如果你同时改了 `shared/` 并且前端也依赖它，那还要补一次前端构建：

```bash
cd /opt/fullstack-blog/current
npm run build
rsync -a --delete client/dist/ /var/www/fullstack-blog/
pm2 restart fullstack-blog-api
```

### 22.4 如果 `package.json` 或依赖变了，怎么办？
#### 大白话解答
这是非常重要的判断点。

如果你新增了依赖，或者升级了依赖，例如改了：

- 根目录 `package.json`
- 根目录 `package-lock.json`
- `client/package.json`
- `server/package.json`

那服务器上不能只重启，必须重新安装依赖：

```bash
cd /opt/fullstack-blog/current
npm ci
```

然后再按改动类型决定：

- 前端变了：`npm run build` + `rsync`
- 后端变了：`pm2 restart fullstack-blog-api`

为什么不是每次都 `npm ci`：

- 因为它会花时间
- 没改依赖时没必要重复安装

但只要依赖文件变了，就最好执行一次，避免“本地能跑，服务器缺包”的问题。

### 22.5 如果改了数据库相关逻辑，怎么办？
#### 大白话解答
这是最需要谨慎的一类更新。

例如你改了：

- 数据结构
- 分类树修复脚本
- 迁移脚本
- 统计口径
- 初始化逻辑

这时候不要直接在线上库乱跑，正确顺序应该是：

1. 先备份数据库
2. 再执行修复或迁移脚本
3. 再验证数据量和关键页面

先备份：

```bash
mongodump --uri="mongodb://127.0.0.1:27017/personal_fullstack_blog" --archive="/opt/fullstack-blog/backups/before-db-change-$(date +%F-%H%M%S).gz" --gzip
```

然后再执行你的脚本，例如：

```bash
cd /opt/fullstack-blog/current
npm run migrate --workspace server
```

或者其他修复脚本。

做完后一定要检查：

- 文章数
- 分类数
- 标签数
- 用户数
- 关键页面是否显示正确

### 22.6 如果只是改了图片、附件、旧资源，怎么办？
#### 大白话解答
这种情况不一定要动数据库，也不一定要重启服务。

例如你只是：

- 新传了一批图片
- 替换了旧资源
- 上传了新的附件

那通常只需要把对应文件传到：

- `/opt/fullstack-blog/current/uploads`
- `/opt/fullstack-blog/current/legacy-notes`

如果数据库里路径没变，上传完刷新页面就可能直接生效。

如果你同时改了数据库里记录的资源路径，那就要连数据库一起处理。

### 22.7 如果改了 `.env`，怎么办？
#### 大白话解答
例如你改了这些：

- `CLIENT_ORIGIN`
- `MONGODB_URI`
- `ADMIN_PASSWORD`
- `UPLOAD_DIR`
- `OLD_NOTES_DIR`

这种属于“运行配置变化”。代码文件没变，但服务必须重启，因为程序要重新读取 `.env`。

执行：

```bash
cd /opt/fullstack-blog/current
pm2 restart fullstack-blog-api
```

为什么这次通常不用纠结 `--update-env`：

- 你的项目不是靠 shell 临时环境变量启动的
- 而是程序启动时自己读取项目根目录里的 `.env`
- 所以只要重启进程，它就会重新读文件

### 22.8 后续发版的标准顺序是什么？
#### 大白话解答
以后你每次更新，可以按这个固定套路走：

1. 本地先测试
2. 上传修改后的源码
3. 判断有没有改依赖
4. 判断要不要重建前端
5. 判断要不要重启后端
6. 如果涉及数据库，先备份再执行
7. 最后浏览器验收

最常见的标准发版流程：

```bash
cd /opt/fullstack-blog/current
npm ci
npm run build
rsync -a --delete client/dist/ /var/www/fullstack-blog/
pm2 restart fullstack-blog-api
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1
```

注意：这里的 `npm ci` 不是每次必须，而是“依赖变了时必须，没变时可以省略”。

### 22.9 后续更新前，最稳的备份做法是什么？
#### 大白话解答
如果这次更新只是改样式，风险很小，可以不做全量备份。

如果这次更新涉及：

- 数据库脚本
- 后端核心逻辑
- 上传资源批量替换
- `.env` 核心配置变化

那建议至少做这两个备份：

```bash
mongodump --uri="mongodb://127.0.0.1:27017/personal_fullstack_blog" --archive="/opt/fullstack-blog/backups/pre-release-db-$(date +%F-%H%M%S).gz" --gzip
tar -czf /opt/fullstack-blog/backups/pre-release-files-$(date +%F-%H%M%S).tar.gz -C /opt/fullstack-blog/current uploads legacy-notes .env
```

这样即使更新翻车，也能回退。

### 22.10 更新完以后怎么验收？
#### 大白话解答
至少看这几项：

1. 后端健康检查是否正常
2. 首页能不能打开
3. 你改过的页面是不是符合预期
4. 关键接口是否正常
5. 后台能不能登录
6. 图片、附件、旧资源是否正常

最少执行：

```bash
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1
pm2 list
```

然后再去浏览器点你刚刚改过的页面。

### 22.11 以后最容易踩的坑有哪些？
#### 大白话解答

#### 坑1：本地改了代码，但忘记重新 build 前端
结果：

- 服务器源码变了
- 浏览器看到的还是旧页面

#### 坑2：改了后端代码，但忘记 `pm2 restart`
结果：

- 文件虽然更新了
- 运行中的还是旧进程

#### 坑3：改了依赖，但没执行 `npm ci`
结果：

- 本地能跑
- 服务器直接报缺包

#### 坑4：改数据库逻辑前没备份
结果：

- 一旦脚本跑坏
- 没法快速回退

#### 坑5：只迁数据库，不迁资源目录
结果：

- 页面看起来有文章
- 图片和附件一堆 404

### 22.12 以后更新时，你可以这样快速判断
#### 大白话解答

- 改了 `client/`：重建前端
- 改了 `server/`：重启 PM2
- 改了 `shared/`：通常前后端都要处理
- 改了 `package*.json`：先 `npm ci`
- 改了 `.env`：重启 PM2
- 改了数据库脚本：先备份再执行
- 改了 `uploads/` 或 `legacy-notes/`：把文件重新上传
