---
title: "单可信域名跨域OAuth解决方案"
slug: "h5-oauth-e33b6d35"
summary: ""
category: "企业微信"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "企业微信"
tags: []
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d29208a2b1c68f2cac7ce"
originalSlug: "h5-oauth-e33b6d35"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.462Z"
updatedAt: "2026-06-13T14:03:18.901Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 企业微信 H5 OAuth 单可信域名跨域解决方案

## 背景

项目同时有两个前端：

- PC 端：`admin.runlan.ltd`（Vue SPA，hash 路由）
- H5 端：`app.runlan.ltd`（uniapp H5）

企业微信自建应用的 OAuth2 回调域名（可信域名）**只能填一个**，填的是 PC 端域名 `admin.runlan.ltd`。

H5 端在企微 App 工作台内打开，需要走企微 OAuth 静默授权（`snsapi_base`）实现免登，但 H5 域名 `app.runlan.ltd` 不在可信域名内，`redirect_uri` 填 H5 域名会被企微直接拒绝（报 redirect_uri 参数错误）。

---

## 踩过的坑

### 坑 1：state 参数不能塞 URL

最初想把 H5 回调地址编码后放进 `state` 参数传递。

**官方文档明确：state 只允许 `a-zA-Z0-9`，最大 128 字节。**

URL 里有 `/`、`:`、`#`、`?`、`=` 等字符，全部不合法，企微会直接拒绝授权请求。base64、encodeURIComponent 都不行，因为编码后仍然包含 `+`、`/`、`=` 等非法字符。

### 坑 2：localStorage 跨域隔离

想在 H5 端发起授权前把回调地址存入 `localStorage`，让 PC 端回调页读取后转发。

`app.runlan.ltd` 写入的 `localStorage`，`admin.runlan.ltd` 根本读不到，两个域名完全隔离，这是浏览器安全机制，无法绕过。

### 坑 3：PC 前端中转时 hash 参数被截断

改为 PC 前端做中转：H5 端把 `redirect_uri` 指向 PC 域名，PC 端收到 code 后用 JS 跳转到 H5。

跳转 URL 格式：`https://app.runlan.ltd/#/secondary/weComH5Login/index?code=xxx`

企微内置浏览器在 302 跳转时会截断 `#` 后面的内容，H5 端收到的 URL 里没有 code，导致 state 校验失败，登录报"企业微信登录状态校验失败"。

**结论：code 必须放在 `?` 后面（URL search 部分），不能放在 `#` 后面（hash 部分）。**

### 坑 4：nginx 反代静态资源路径错误

改用 nginx 反代 `/app/` 路径到 `app.runlan.ltd`，反代后 HTML 能返回，但 HTML 里的静态资源路径是绝对路径（`/static/js/xxx.js`），浏览器用 `admin.runlan.ltd` 去请求，404，页面空白。

**结论：反代不适合 SPA，静态资源路径会错乱。应该用 302 跳转，让浏览器自己去目标域名加载资源。**

### 坑 5：nginx `^~` 不支持捕获组

nginx 配置写成：

```nginx
location ^~ /app/ {
    return 302 https://app.runlan.ltd/$1$is_args$args;
}
```

`^~` 前缀匹配不支持捕获组，`$1` 为空，跳转到 `https://app.runlan.ltd/?code=xxx`，路径丢失。

**结论：要用正则匹配 `location ~ ^/app/(.*)$` 才支持 `$1` 捕获组。**

---

## 最终解决方案

**nginx 正则捕获 + 302 跳转**，在 `admin.runlan.ltd` 的 nginx 配置里加：

```nginx
location ~ ^/app/(.*)$ {
    return 302 https://app.runlan.ltd/$1$is_args$args;
}
```

### 原理

企业微信官方文档明确：**可信域名只校验域名部分，不校验路径**。

所以 `redirect_uri` 填 `https://admin.runlan.ltd/app/weComH5Login`，企微只看 `admin.runlan.ltd` 是否在可信域名内，路径 `/app/weComH5Login` 它不管，直接放行。

企微回调后，nginx 正则捕获 `/app/` 后面的路径，302 跳转到 `app.runlan.ltd`，浏览器地址栏切换到 H5 域名，所有静态资源正常加载。

### 完整登录流程

```
1. 用户在企微 App 工作台打开 H5 应用
   ↓
2. H5 端 weComH5Login 页面加载，发起 OAuth 授权
   redirect_uri = https://admin.runlan.ltd/app/weComH5Login
   state = wecomh5{时间戳}（纯字母数字，存入 uni.storage 用于回调校验）
   ↓
3. 企微静默授权完成，302 回调到：
   https://admin.runlan.ltd/app/weComH5Login?code=xxx&state=wecomh5xxx
   ↓
4. nginx 匹配 ^/app/(.*)$，302 跳转到：
   https://app.runlan.ltd/weComH5Login?code=xxx&state=wecomh5xxx
   ↓
5. H5 端页面重新加载，从 URL search 部分取到 code
   ↓
6. 校验 state（与 uni.storage 中存的比对，防 CSRF）
   ↓
7. 携带 code 请求后端换取业务 token，登录完成
```

---

## 前端代码改动

### `configInfo/index.js`（小程序端）

各环境加 `PC_H5_REDIRECT_HOST` 字段，值为企微可信域名的 PC 端地址：

```js
runlan: {
    // ...其他配置
    PC_H5_REDIRECT_HOST: 'https://admin.runlan.ltd',
}
```

### `secondary/weComH5Login/index.vue`（小程序端）

**`redirect_uri` 改为 PC 域名下的 `/app/weComH5Login`：**

```js
const pcHost = String(configInfo.PC_H5_REDIRECT_HOST || '').trim();
if (!pcHost) {
    throw new Error('未配置 PC_H5_REDIRECT_HOST，无法发起企微授权');
}
const redirectUri = `${pcHost}/app/weComH5Login`;
// 最终值：https://admin.runlan.ltd/app/weComH5Login
```

**`state` 格式改为纯字母数字：**

```js
// 符合企微 state 只允许 a-zA-Z0-9、≤128字节的限制
const createState = () => `wecomh5${Date.now()}`;
// 例：wecomh51777017057851，约20字节
```

### PC 端 `weComH5Login/index.vue`

**不需要改**，PC 前端完全不参与中转，nginx 在网络层直接处理，PC 前端不会收到 H5 来源的请求。

---

## nginx 完整配置片段

```nginx
server {
    listen 443 ssl http2;
    server_name *.runlan.ltd;

    # 企微 H5 OAuth 中转：/app/xxx → app.runlan.ltd/xxx（302 跳转）
    # 注意：必须用正则匹配才支持 $1 捕获组，^~ 前缀匹配不支持
    location ~ ^/app/(.*)$ {
        return 302 https://app.runlan.ltd/$1$is_args$args;
    }

    # 其他配置...
}
```

同时 `app.runlan.ltd` 的 nginx 需要有 SPA 兜底配置，否则 `/weComH5Login` 路径会 404：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 关键结论汇总

| 结论 | 说明 |
|------|------|
| 企微可信域名只校验域名，不校验路径 | 可以利用路径做路由分发 |
| state 只能用 `a-zA-Z0-9`，≤128字节 | 不能塞任何编码后的 URL |
| code 必须在 URL search 部分 | 企微内置浏览器跳转会截断 hash 后的内容 |
| 302 跳转优于 nginx 反代 | 反代会导致 SPA 静态资源路径错乱 |
| nginx 正则 `~ ^/app/(.*)$` 才支持捕获组 | `^~` 前缀匹配不支持 `$1` |
| localStorage 跨域完全隔离 | 不同域名之间无法共享 localStorage |
