---
title: "第 3 篇：Nginx、Vue 静态资源、反向代理与 HTTPS"
slug: "nginx-https-f134e6f0"
summary: "从小白角度讲清 Vue 打包、Nginx 静态站点、前端路由刷新、/api 反向代理、HTTPS 证书和常见 404/502 排查。"
category: "全栈部署入门"
tags:
  - "Nginx"
  - "HTTPS"
  - "反向代理"
  - "Vue"
  - "Vite"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac5a0"
originalSlug: "nginx-https-f134e6f0"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 第 3 篇：Nginx、Vue 静态资源、反向代理与 HTTPS

资料核对时间：2026-06-08。

这一篇开始接近真正上线。

你需要先记住一句话：

> Nginx 是用户访问你网站时最先遇到的入口。

它可以直接返回 Vue 的静态文件，也可以把接口请求转发给 Express。

## 1. Vue 上线不是 `npm run dev`

开发时：

```bash
# 本地开发服务，适合写代码调试
npm run dev
```

上线时：

```bash
# 生成生产构建产物
npm run build
```

Vite 项目默认会生成：

```txt
dist/
  index.html
  assets/
    index-xxxxx.js
    index-xxxxx.css
```

小白理解：

```txt
Vue 源码是给开发者看的。
dist 是给服务器和浏览器用的。
```

Vite 官方部署文档也强调，`vite preview` 是本地预览构建结果，不应当当成生产服务器。

## 2. Nginx 静态站点最小配置

假设你的 Vue 构建产物放在：

```txt
/var/www/my-vue-app/dist
```

可以写一个 Nginx 配置：

```nginx
server {
  # 监听 80 端口，也就是普通 HTTP
  listen 80;

  # 这里换成你的域名
  server_name example.com;

  # root 指向 Vue 打包后的 dist 目录
  root /var/www/my-vue-app/dist;

  # 默认首页文件
  index index.html;

  location / {
    # 先找真实文件，再找真实目录，最后回退到 index.html
    # 这个回退对 Vue Router 的 history 模式非常重要
    try_files $uri $uri/ /index.html;
  }
}
```

保存后检查配置：

```bash
# 检查 Nginx 配置语法
sudo nginx -t

# 配置没问题后重载 Nginx
sudo systemctl reload nginx
```

## 3. 为什么 Vue 刷新页面会 404

假设你的前端路由是：

```txt
https://example.com/articles/123
```

用户第一次从首页点击进去时，Vue Router 在浏览器里处理路由，页面正常。

但是用户直接刷新这个地址时，浏览器会向服务器请求：

```txt
/articles/123
```

如果 Nginx 按真实文件找：

```txt
/var/www/my-vue-app/dist/articles/123
```

它找不到，就会 404。

解决方式：

```nginx
location / {
  # 找不到真实文件时，交回 index.html，让 Vue Router 接管
  try_files $uri $uri/ /index.html;
}
```

Vue Router 官方文档也说明，使用 HTML5 history 模式时，服务器需要把未知路径回退到入口页面。

如果你使用 hash 路由：

```txt
https://example.com/#/articles/123
```

刷新通常不会出现同样问题，因为 `#` 后面的内容不会作为普通路径发给服务器。

## 4. Nginx 反向代理 Express

假设 Express 服务监听本机：

```txt
http://127.0.0.1:3000
```

你希望用户访问：

```txt
https://example.com/api/users
```

Nginx 转发给 Express：

```txt
http://127.0.0.1:3000/users
```

可以这样写：

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/my-vue-app/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    # 把 /api/ 后面的内容转发给本机 3000 端口
    # 末尾的 / 很重要：/api/users 会转成 /users
    proxy_pass http://127.0.0.1:3000/;

    # 把用户访问的原始域名传给 Express
    proxy_set_header Host $host;

    # 把用户真实 IP 传给 Express，方便日志和限流
    proxy_set_header X-Real-IP $remote_addr;

    # 多层代理时保留完整转发链路
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # 告诉后端用户原本使用的是 http 还是 https
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Nginx 官方反向代理文档说明，`proxy_pass` 用于把请求传给被代理的服务器。

## 5. `/api` 路径到底要不要保留

这里很容易糊涂。

### 写法一：Nginx 去掉 `/api`

Nginx：

```nginx
location /api/ {
  # 末尾有 /
  # /api/users 转发到 Express 的 /users
  proxy_pass http://127.0.0.1:3000/;
}
```

Express：

```js
// Express 里不需要再写 /api 前缀
app.get('/users', (req, res) => {
  res.json({ message: '用户列表' })
})
```

### 写法二：Nginx 保留 `/api`

Nginx：

```nginx
location /api/ {
  # 末尾不加 /
  # /api/users 转发到 Express 的 /api/users
  proxy_pass http://127.0.0.1:3000;
}
```

Express：

```js
// Express 里保留 /api 前缀
app.get('/api/users', (req, res) => {
  res.json({ message: '用户列表' })
})
```

小白建议：

```txt
新手阶段选一种，全项目保持一致。
我更建议 Express 里保留 /api，Nginx 只负责原样转发。
这样本地开发和线上路径更一致。
```

对应配置：

```nginx
location /api/ {
  # 不加末尾斜杠，保留 /api 前缀
  proxy_pass http://127.0.0.1:3000;
}
```

## 6. HTTPS 是怎么来的

HTTP：

```txt
http://example.com
```

HTTPS：

```txt
https://example.com
```

HTTPS 需要证书。常见方式：

- 用 Certbot 给 Nginx 自动申请证书。
- 用宝塔面板在站点里申请 Let's Encrypt 证书。
- 用云厂商证书服务。

Certbot 官方网站提供不同系统和 Web 服务器的安装指引，可以按你的服务器系统、Nginx 类型选择命令。

HTTPS 配好后，Nginx 通常会多出：

```nginx
server {
  # 监听 443，也就是 HTTPS 默认端口
  listen 443 ssl;

  server_name example.com;

  # 证书文件路径，真实路径由 Certbot 或面板生成
  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;

  # 私钥文件路径，不要泄漏
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  root /var/www/my-vue-app/dist;
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

HTTP 跳转 HTTPS：

```nginx
server {
  listen 80;
  server_name example.com;

  # 把 HTTP 永久重定向到 HTTPS
  return 301 https://$host$request_uri;
}
```

## 7. Nginx 常用命令

```bash
# 检查配置文件是否有语法错误
sudo nginx -t

# 启动 Nginx
sudo systemctl start nginx

# 停止 Nginx
sudo systemctl stop nginx

# 重启 Nginx
sudo systemctl restart nginx

# 重载配置，不完全停止服务
sudo systemctl reload nginx

# 查看 Nginx 状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -n 50 /var/log/nginx/error.log

# 实时查看访问日志
sudo tail -f /var/log/nginx/access.log
```

## 8. 常见错误排查

### 网站完全打不开

先查：

```bash
# Nginx 是否运行
sudo systemctl status nginx

# 配置是否正确
sudo nginx -t

# 防火墙是否开放 80 和 443
sudo ufw status
```

还要看云厂商安全组是否开放 80 和 443。

### 访问前端正常，接口 502

502 常见意思：

```txt
Nginx 想转发给 Express，但后端没接住。
```

排查：

```bash
# 看 Express 是否在跑
pm2 list

# 看 Express 日志
pm2 logs my-api

# 在服务器本机测试接口
curl http://127.0.0.1:3000/api/health

# 看 Nginx 错误日志
sudo tail -n 50 /var/log/nginx/error.log
```

### 前端刷新 404

重点看：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

如果项目使用 hash 路由，问题会少一些。但如果是 history 路由，回退配置非常重要。

## 9. 一个完整但简化的 Nginx 配置

```nginx
# HTTP 自动跳转到 HTTPS
server {
  listen 80;
  server_name example.com;

  # 保留原始访问路径，统一跳到 https
  return 301 https://$host$request_uri;
}

# HTTPS 主站点
server {
  listen 443 ssl;
  server_name example.com;

  # Vue 打包产物目录
  root /var/www/my-vue-app/dist;
  index index.html;

  # 证书路径，使用时换成真实域名生成的路径
  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  location / {
    # 支持 Vue Router history 模式刷新不 404
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    # 保留 /api 前缀，转发给 Express
    proxy_pass http://127.0.0.1:3000;

    # 传递请求上下文，方便后端识别域名、协议和真实 IP
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 10. 这一篇的练习

你可以做一个最小验证：

```bash
# 在服务器上创建一个测试 dist
mkdir -p /var/www/my-vue-app/dist

# 写一个临时首页
echo 'hello nginx vue dist' | sudo tee /var/www/my-vue-app/dist/index.html

# 检查 Nginx 配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

然后浏览器访问：

```txt
http://你的服务器IP
```

能看到文字，就说明 Nginx 静态站点这一层通了。

## 官方资料

- Vite Static Deploy：https://vite.dev/guide/static-deploy.html
- Vue Router History Mode：https://router.vuejs.org/guide/essentials/history-mode
- Nginx Reverse Proxy：https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/
- Certbot Instructions：https://certbot.eff.org/instructions
