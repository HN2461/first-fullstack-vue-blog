# 域名备案与 HTTPS 配置记录

记录日期：2026-06-25

本文记录 `haonan.online` 从 ICP 备案通过到手动配置 Nginx HTTPS 的完整过程。目标是让后续自己能看懂：当前有哪些信息、每个信息是什么意思、证书文件放在哪里、Nginx 为什么这样改、以后证书续期应该怎么做。

## 1. 当前关键信息

### 1.1 域名与服务器

| 项目 | 当前值 | 说明 |
| --- | --- | --- |
| 主域名 | `haonan.online` | 网站裸域名 |
| www 域名 | `www.haonan.online` | 常见访问入口，已解析到同一台服务器 |
| 服务器公网 IP | `121.41.11.78` | 阿里云轻量应用服务器公网地址 |
| 网站名称 | 浩南知识库系统 | ICP 备案中的网站名称 |
| 网站内容 | 博客/个人空间 | ICP 备案中的网站内容类型 |
| ICP 备案号 | `皖ICP备2026019318号-1` | 工信部备案通过后生成的网站备案号 |
| 公安备案 | 已提交，等待审核 | 审核通过后再把公安备案号放到网站底部 |

### 1.2 DNS 解析状态

阿里云轻量应用服务器域名页中已有两条解析：

| 主机记录 | 记录类型 | 记录值 | 含义 |
| --- | --- | --- | --- |
| `haonan.online` | A 记录 | `121.41.11.78` | 访问裸域名时进入这台服务器 |
| `www.haonan.online` | A 记录 | `121.41.11.78` | 访问 www 域名时进入这台服务器 |

可以用下面命令验证：

```powershell
nslookup haonan.online
nslookup www.haonan.online
```

只要解析结果能看到 `121.41.11.78`，说明 DNS 已经指向服务器。

## 2. 几个备案概念的区别

### 2.1 ICP 备案

ICP 备案是工信部/管局侧的网站备案。你现在已经通过，备案号是：

```text
皖ICP备2026019318号-1
```

网站开通后，需要在首页底部展示该备案号，并链接到：

```text
https://beian.miit.gov.cn/
```

本次已经在前端新增备案链接组件，并挂到公开站点、登录页和注册页。

### 2.2 公安联网备案

公安联网备案和 ICP 备案不是同一个东西。ICP 备案通过后，网站开通后还需要到全国互联网安全管理服务平台提交公安备案：

```text
https://beian.mps.gov.cn/
```

当前状态是：已经提交，等待审核。

公安备案审核通过后，会获得类似下面格式的编号：

```text
皖公网安备 xxxxxxxxxxxxxx号
```

拿到编号后，再更新前端备案组件中的公安备案号和链接/图标。

## 3. 证书文件说明

阿里云 SSL 证书下载目录：

```text
C:\Users\HN246\Downloads\25752078_haonan.online_nginx
```

目录中有两个文件：

```text
haonan.online.pem
haonan.online.key
```

含义如下：

| 文件 | 作用 | 注意事项 |
| --- | --- | --- |
| `haonan.online.pem` | 证书文件，给浏览器验证网站身份 | 可以放到服务器上，权限可读即可 |
| `haonan.online.key` | 私钥文件，和证书配套使用 | 必须保护好，不要提交 Git，不要公开发送 |

服务器上用 `openssl` 检查证书，确认该证书覆盖两个域名：

```text
DNS:haonan.online
DNS:www.haonan.online
```

证书有效期：

```text
生效时间：2026-06-25
到期时间：2026-09-22
```

这意味着到期前需要续签或重新下载新证书，并替换服务器上的 `.pem` 和 `.key`。

## 4. 服务器上的证书位置

本次把证书上传到了服务器：

```text
/etc/nginx/ssl/haonan.online/haonan.online.pem
/etc/nginx/ssl/haonan.online/haonan.online.key
```

权限设置：

```bash
chmod 644 /etc/nginx/ssl/haonan.online/haonan.online.pem
chmod 600 /etc/nginx/ssl/haonan.online/haonan.online.key
```

这样做的原因：

1. `pem` 是证书链，Nginx 需要读取，普通只读权限足够。
2. `key` 是私钥，必须限制权限，避免被其他用户读取。

## 5. Nginx 配置变更

### 5.1 原始配置

原始项目配置文件：

```text
/etc/nginx/conf.d/personal-blog.conf
```

修改前只监听 80 端口，且 `server_name` 还是服务器 IP：

```nginx
server {
    listen 80;
    server_name 121.41.11.78;

    root /www/personal-blog/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3001/uploads/;
    }
}
```

这种配置只能支持 HTTP，不能支持 HTTPS。

### 5.2 配置备份

修改前先备份：

```text
/etc/nginx/conf.d/personal-blog.conf.bak-20260625-215414
```

如果以后 Nginx 配置改坏，可以参考这个备份恢复。

### 5.3 当前配置逻辑

现在 Nginx 分成两个 `server`：

1. 80 端口：只负责把 HTTP 跳转到 HTTPS。
2. 443 端口：真正承载 HTTPS 网站、前端静态页面和 API 反向代理。

核心配置如下：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name haonan.online www.haonan.online 121.41.11.78;

    return 301 https://haonan.online$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name haonan.online www.haonan.online;

    root /www/personal-blog/frontend;
    index index.html;

    client_max_body_size 20m;

    ssl_certificate /etc/nginx/ssl/haonan.online/haonan.online.pem;
    ssl_certificate_key /etc/nginx/ssl/haonan.online/haonan.online.key;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3001/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 6. 每段 Nginx 配置是什么意思

### 6.1 HTTP 跳 HTTPS

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name haonan.online www.haonan.online 121.41.11.78;

    return 301 https://haonan.online$request_uri;
}
```

作用：

1. 用户访问 `http://haonan.online` 时，自动跳到 `https://haonan.online`。
2. 用户访问 `http://www.haonan.online` 时，也自动跳到 `https://haonan.online`。
3. 统一主站入口，避免同一网站同时存在多个访问地址。

### 6.2 HTTPS 服务

```nginx
listen 443 ssl http2;
server_name haonan.online www.haonan.online;
```

作用：

1. 监听 HTTPS 标准端口 `443`。
2. 启用 SSL。
3. 启用 HTTP/2。
4. 接收 `haonan.online` 和 `www.haonan.online` 两个域名的 HTTPS 请求。

### 6.3 前端静态页面

```nginx
root /www/personal-blog/frontend;
index index.html;

location / {
    try_files $uri $uri/ /index.html;
}
```

作用：

1. 前端打包后的文件放在 `/www/personal-blog/frontend`。
2. Vue Router 是前端路由，所以刷新 `/login`、`/console/articles` 等页面时，需要回退到 `index.html`。
3. `try_files $uri $uri/ /index.html;` 就是为了解决前端路由刷新 404。

### 6.4 后端 API 代理

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
}
```

作用：

1. 用户访问 `https://haonan.online/api/health`。
2. Nginx 转发到服务器本机的 Express 服务 `http://127.0.0.1:3001/api/health`。
3. 外部用户不需要直接访问 3001 端口。

### 6.5 上传资源代理

```nginx
location /uploads/ {
    proxy_pass http://127.0.0.1:3001/uploads/;
}
```

作用：

1. 网站中的上传图片、媒体文件仍由后端服务处理。
2. 浏览器访问 `/uploads/...` 时，Nginx 转发给 Express。

## 7. 验证过程

### 7.1 Nginx 配置检查

每次改 Nginx 都先执行：

```bash
nginx -t
```

本次结果：

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

说明语法正确。

### 7.2 重载 Nginx

语法正确后执行：

```bash
systemctl reload nginx
```

`reload` 是平滑重载，不是强制停服。

### 7.3 检查端口监听

执行：

```bash
ss -lntp | grep -E ':80|:443|:3001'
```

需要看到：

```text
80   nginx
443  nginx
3001 node
```

本次已经确认 80、443、3001 都在监听。

### 7.4 公网访问验证

本地执行：

```powershell
Invoke-WebRequest -Uri "https://haonan.online/" -UseBasicParsing -TimeoutSec 20
Invoke-WebRequest -Uri "https://www.haonan.online/" -UseBasicParsing -TimeoutSec 20
Invoke-WebRequest -Uri "https://haonan.online/api/health" -UseBasicParsing -TimeoutSec 20
Invoke-WebRequest -Uri "https://www.haonan.online/api/health" -UseBasicParsing -TimeoutSec 20
```

验证结果：

| URL | 结果 |
| --- | --- |
| `https://haonan.online/` | 200 |
| `https://www.haonan.online/` | 200 |
| `https://haonan.online/api/health` | 200 |
| `https://www.haonan.online/api/health` | 200 |
| `http://haonan.online/` | 301 跳转到 HTTPS |

后端健康检查返回：

```json
{
  "success": true,
  "message": "success",
  "data": {
    "service": "personal-fullstack-blog-api",
    "status": "ok"
  }
}
```

## 8. 前端备案号展示

本次新增组件：

```text
frontend/src/components/SiteBeianLinks.vue
```

当前展示：

```text
© 2026 Knowledge OS
皖ICP备2026019318号-1
```

ICP备案号链接到：

```text
https://beian.miit.gov.cn/
```

已挂载位置：

| 页面 | 文件 |
| --- | --- |
| 公开站点统一布局 | `frontend/src/views/public/PublicLayout/index.vue` |
| PC 登录页 | `frontend/src/views/auth/LoginPage/PcView.vue` |
| PC 注册页 | `frontend/src/views/auth/RegisterPage/PcView.vue` |
| 移动登录页 | `frontend/src/views/auth/LoginPage/MobileView.vue` |
| 移动注册页 | `frontend/src/views/auth/RegisterPage/MobileView.vue` |

公安备案号还没有填，因为公安备案还在审核中。审核通过后，更新：

```text
frontend/src/components/SiteBeianLinks.vue
```

把：

```js
const policeBeianNumber = ''
```

改成实际公安备案号，并按公安平台给出的 HTML 代码补充图标或专用链接。

## 9. 以后证书续期怎么做

证书到期时间：

```text
2026-09-22
```

到期前建议提前 7 到 15 天处理。

续期流程：

1. 在阿里云 SSL 证书控制台申请或续签新证书。
2. 下载 Nginx 格式证书。
3. 得到新的 `.pem` 和 `.key` 文件。
4. 上传到服务器：

```text
/etc/nginx/ssl/haonan.online/haonan.online.pem
/etc/nginx/ssl/haonan.online/haonan.online.key
```

5. 设置权限：

```bash
chmod 644 /etc/nginx/ssl/haonan.online/haonan.online.pem
chmod 600 /etc/nginx/ssl/haonan.online/haonan.online.key
```

6. 检查 Nginx：

```bash
nginx -t
```

7. 平滑重载：

```bash
systemctl reload nginx
```

8. 验证：

```bash
curl -I https://haonan.online/
curl -I https://www.haonan.online/
curl https://haonan.online/api/health
```

## 10. 常见问题

### 10.1 为什么阿里云控制台不能自动配置 HTTPS？

轻量应用服务器的自动 HTTPS 功能不一定支持当前实例、当前站点形态或当前 Nginx 配置。你的站点是自己部署的 Nginx + Vue + Express 结构，所以采用手动配置最稳定。

### 10.2 为什么要同时配置 `haonan.online` 和 `www.haonan.online`？

用户习惯不同，有人会输入裸域名，有人会输入 www 域名。DNS 已经让两个域名都指向服务器，证书也覆盖两个域名，所以 Nginx 同时接收两个域名最合理。

### 10.3 为什么 HTTP 要跳转到 HTTPS？

原因有三个：

1. 浏览器不再显示“不安全”。
2. 登录 Cookie、密码提交、后台操作更安全。
3. 搜索引擎和备案审核访问时，站点入口更统一。

### 10.4 为什么不现在显示公安备案号？

公安备案还没有审核通过。不能提前填写不存在或未通过的公安备案号。等审核通过后，再按照公安平台提供的备案号和 HTML 代码展示。

## 11. 本次结果

当前最终访问入口：

```text
https://haonan.online/
https://www.haonan.online/
```

当前 HTTP 跳转：

```text
http://haonan.online/ -> https://haonan.online/
http://www.haonan.online/ -> https://haonan.online/
```

当前服务器关键路径：

```text
项目目录：/www/personal-blog
前端目录：/www/personal-blog/frontend
后端目录：/www/personal-blog/backend
上传目录：/www/personal-blog/uploads
Nginx 配置：/etc/nginx/conf.d/personal-blog.conf
Nginx 配置备份：/etc/nginx/conf.d/personal-blog.conf.bak-20260625-215414
证书目录：/etc/nginx/ssl/haonan.online
```

这次的核心经验可以记成一句话：

```text
域名解析负责把域名指到服务器，ICP 备案负责合法开站，SSL 证书负责 HTTPS 身份验证，Nginx 负责把这些能力接到实际的网站和 API 服务上。
```
