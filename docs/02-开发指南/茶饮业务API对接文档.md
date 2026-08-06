# 茶饮业务 API 对接文档

| 项目 | 内容 |
|---|---|
| 文档版本 | `v1.0` |
| 接口版本 | `v1` |
| 更新日期 | `2026-08-06` |
| 通信协议 | `HTTPS` |
| 数据格式 | `application/json` |

## 1. 接入信息

### 1.1 Base URL

```text
https://haonan.online/api/tea-demo/v1
```

请求示例：

```http
GET https://haonan.online/api/tea-demo/v1/products?page=1&pageSize=12
```

### 1.2 认证方式

公开商品接口不需要登录。认证接口和管理员接口按下表要求携带 Token：

```http
Authorization: Bearer <token>
```

```http
Content-Type: application/json
```

### 1.3 成功响应

```json
{
  "success": true,
  "message": "success",
  "data": {}
}
```

### 1.4 失败响应

```json
{
  "success": false,
  "message": "账号或密码不正确",
  "code": "INVALID_CREDENTIALS",
  "details": null
}
```

前端应同时判断 HTTP 状态码和 `success` 字段。业务数据统一从 `data` 中读取。

## 2. 接口清单

| 模块 | 方法 | 路径 | 登录 | 权限 |
|---|---|---|---|---|
| 服务 | `GET` | `/health` | 否 | 无 |
| 认证 | `GET` | `/auth/challenge` | 否 | 无 |
| 认证 | `POST` | `/auth/register` | 否 | 无 |
| 认证 | `POST` | `/auth/login` | 否 | 无 |
| 认证 | `GET` | `/auth/me` | 是 | 登录用户 |
| 认证 | `POST` | `/auth/refresh` | 是 | 登录用户 |
| 认证 | `POST` | `/auth/logout` | 是 | 登录用户 |
| 商品 | `GET` | `/product-categories` | 否 | 无 |
| 商品 | `GET` | `/products` | 否 | 无 |
| 商品 | `GET` | `/products/:id` | 否 | 无 |
| 商品管理 | `GET` | `/admin/products` | 是 | `ADMIN` |
| 商品管理 | `GET` | `/admin/products/:id` | 是 | `ADMIN` |
| 商品管理 | `POST` | `/admin/products` | 是 | `product:create` |
| 商品管理 | `PUT` | `/admin/products/:id` | 是 | `product:update` |
| 商品管理 | `PATCH` | `/admin/products/:id/status` | 是 | `product:publish` |
| 商品管理 | `DELETE` | `/admin/products/:id` | 是 | `product:delete` |

## 3. 登录加密约定

登录和注册不直接提交明文密码。前后端约定使用 `RSA-OAEP-SHA256`：

1. 前端请求一次性 Challenge。
2. 后端返回 `challengeId`、`nonce` 和 RSA 公钥。
3. 前端使用公钥加密完整登录或注册数据。
4. 前端只提交密文 `payload`。
5. Challenge 使用一次后立即失效，有效期为 2 分钟。

公钥可以发送给前端，私钥只保存在服务端。前端不需要保存固定密钥。

### 3.1 可直接使用的前端封装

```js
const API_BASE_URL = 'https://haonan.online/api/tea-demo/v1'

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '')
  const binary = atob(base64)
  return Uint8Array.from(binary, char => char.charCodeAt(0)).buffer
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

async function encryptPayload(publicKeyPem, payload) {
  const publicKey = await crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(publicKeyPem),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )

  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    new TextEncoder().encode(JSON.stringify(payload))
  )

  return arrayBufferToBase64(encrypted)
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })

  const result = await response.json()
  if (!response.ok || !result.success) {
    const error = new Error(result.message || '请求失败')
    error.code = result.code
    error.status = response.status
    throw error
  }
  return result.data
}

async function submitEncryptedAuth(purpose, formData) {
  const challenge = await request(`/auth/challenge?purpose=${purpose}`)
  const payload = await encryptPayload(challenge.publicKey, {
    purpose,
    challengeId: challenge.challengeId,
    nonce: challenge.nonce,
    ...formData
  })

  return request(`/auth/${purpose}`, {
    method: 'POST',
    body: JSON.stringify({
      credential: {
        challengeId: challenge.challengeId,
        payload
      }
    })
  })
}

export function login(identifier, password) {
  return submitEncryptedAuth('login', { identifier, password })
}

export function register(username, email, password, nickname = '') {
  return submitEncryptedAuth('register', {
    username,
    email,
    password,
    nickname
  })
}

export { request }
```

登录调用：

```js
const data = await login('admin', '123456')
localStorage.setItem('token', data.token)
```

注册调用：

```js
await register('zhangsan', 'zhangsan@example.com', '123456', '张三')
```

## 4. 认证接口

### 4.1 获取 Challenge

```http
GET /auth/challenge?purpose=login
```

查询参数：

| 参数 | 类型 | 必填 | 可选值 | 说明 |
|---|---|---|---|---|
| `purpose` | string | 是 | `login`、`register` | 本次加密用途 |

响应 `data`：

```json
{
  "challengeId": "8a3db1a5-4c9d-4c48-a8d0-1a2a7e1b6d77",
  "nonce": "D9TzRXYaej4C7kG8P1nC5A",
  "purpose": "login",
  "expiresAt": "2026-08-06T10:00:00.000Z",
  "algorithm": "RSA-OAEP-SHA256",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
}
```

### 4.2 注册

```http
POST /auth/register
```

加密前字段：

| 字段 | 类型 | 必填 | 规则 |
|---|---|---|---|
| `username` | string | 是 | 2 到 32 个字符 |
| `email` | string | 是 | 有效邮箱地址 |
| `password` | string | 是 | 6 到 72 个字符 |
| `nickname` | string | 否 | 最多 40 个字符 |

最终请求体：

```json
{
  "credential": {
    "challengeId": "8a3db1a5-4c9d-4c48-a8d0-1a2a7e1b6d77",
    "payload": "Base64编码的RSA密文"
  }
}
```

成功状态码：`201`

成功响应 `data` 为新用户信息。注册完成后，前端再调用登录接口获取 Token。

### 4.3 登录

```http
POST /auth/login
```

加密前字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `identifier` | string | 是 | 用户名或邮箱 |
| `password` | string | 是 | 登录密码 |

成功响应：

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": "2h",
    "user": {
      "id": "66b1c6c1a1d1d7f3f1111111",
      "username": "admin",
      "email": "admin@tea-demo.local",
      "nickname": "茶饮管理员",
      "avatar": "/images/default-avatar.png",
      "role": "admin",
      "roles": ["ADMIN"],
      "permissions": [
        "product:view",
        "product:create",
        "product:update",
        "product:delete",
        "product:publish",
        "auth:refresh",
        "auth:logout"
      ],
      "status": "active"
    }
  }
}
```

### 4.4 获取当前用户

```http
GET /auth/me
Authorization: Bearer <token>
```

用于页面刷新后恢复用户信息。响应 `data` 字段结构与登录响应中的 `user` 一致。

### 4.5 刷新 Token

```http
POST /auth/refresh
Authorization: Bearer <token>
```

响应：

```json
{
  "success": true,
  "message": "刷新成功",
  "data": {
    "token": "新的JWT Token",
    "tokenType": "Bearer",
    "expiresIn": "2h"
  }
}
```

前端收到新 Token 后应替换原 Token。

### 4.6 退出登录

```http
POST /auth/logout
Authorization: Bearer <token>
```

响应：

```json
{
  "success": true,
  "message": "退出登录成功",
  "data": null
}
```

退出后原 Token 失效，前端应清除本地 Token 和用户信息。

## 5. 商品接口

### 5.1 商品分类

```http
GET /product-categories
```

响应 `data`：

```json
[
  { "id": "all", "code": "all", "name": "全部", "nameEn": "All", "sort": 0 },
  { "id": "fruit", "code": "fruit", "name": "水果茶", "nameEn": "Fruit Tea", "sort": 10 },
  { "id": "cheese", "code": "cheese", "name": "芝士茶", "nameEn": "Cheese Tea", "sort": 20 }
]
```

实际会返回全部分类，前端使用 `code` 作为筛选值。

### 5.2 商品列表

```http
GET /products?page=1&pageSize=12&categoryCode=fruit&isHot=true
```

查询参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `page` | number | 否 | `1` | 正整数页码 |
| `pageSize` | number | 否 | `12` | 每页 1 到 100 条 |
| `keyword` | string | 否 | - | 搜索中英文名称和描述 |
| `categoryCode` | string | 否 | `all` | 分类编码 |
| `isHot` | boolean | 否 | - | `true` 或 `false` |
| `isNew` | boolean | 否 | - | `true` 或 `false` |

响应：

```json
{
  "success": true,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "66b1c6c1a1d1d7f3f2222222",
        "name": "多肉葡萄",
        "nameEn": "Juicy Grape",
        "desc": "满杯葡萄果肉和清爽茶底，每一口都有果香。",
        "description": "满杯葡萄果肉和清爽茶底，每一口都有果香。",
        "price": 26,
        "category": "fruit",
        "categoryCode": "fruit",
        "categoryName": "水果茶",
        "image": "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=900&q=82",
        "imageUrl": "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=900&q=82",
        "isNew": false,
        "isHot": true,
        "status": "ON_SALE",
        "stock": 999,
        "sortOrder": 20
      }
    ],
    "total": 8,
    "page": 1,
    "pageSize": 12
  }
}
```

兼容字段说明：

| 简写字段 | 规范字段 | 说明 |
|---|---|---|
| `desc` | `description` | 两个字段内容相同 |
| `image` | `imageUrl` | 两个字段内容相同，均可直接用于 `<img>` |
| `category` | `categoryCode` | 两个字段内容相同 |
| `sort` | `sortOrder` | 两个字段内容相同 |

### 5.3 商品详情

```http
GET /products/:id
```

响应包含列表接口全部字段，并增加：

```json
{
  "bannerImages": ["https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=900&q=82"],
  "specs": {
    "sizes": [
      { "code": "small", "name": "小杯", "nameEn": "Small", "extraPrice": -2 },
      { "code": "medium", "name": "中杯", "nameEn": "Medium", "extraPrice": 0 },
      { "code": "large", "name": "大杯", "nameEn": "Large", "extraPrice": 3 }
    ],
    "sweetness": [
      { "code": "none", "name": "无糖", "nameEn": "No Sugar" },
      { "code": "less", "name": "少糖", "nameEn": "Less Sugar" },
      { "code": "normal", "name": "正常糖", "nameEn": "Normal Sugar" }
    ],
    "toppings": [
      { "code": "pearl", "name": "珍珠", "nameEn": "Pearl", "price": 3 },
      { "code": "coconut", "name": "椰果", "nameEn": "Coconut Jelly", "price": 3 }
    ]
  },
  "createdAt": "2026-08-06T08:00:00.000Z",
  "updatedAt": "2026-08-06T08:00:00.000Z"
}
```

不存在或已下架商品返回 `404 PRODUCT_NOT_FOUND`。

## 6. 商品管理接口

所有 `/admin/products` 接口都需要管理员 Token。普通用户调用返回 `403 FORBIDDEN`。

### 6.1 管理端商品列表

```http
GET /admin/products?page=1&pageSize=12&status=OFF_SALE
Authorization: Bearer <token>
```

参数和公开商品列表一致，额外支持：

| 参数 | 类型 | 可选值 | 说明 |
|---|---|---|---|
| `status` | string | `ON_SALE`、`OFF_SALE`、`SOLD_OUT` | 按状态筛选 |

管理端列表会返回全部状态商品。

### 6.2 新增商品

```http
POST /admin/products
Authorization: Bearer <token>
```

请求体：

```json
{
  "name": "黑糖珍珠奶茶",
  "nameEn": "Brown Sugar Bubble Milk Tea",
  "description": "黑糖香气搭配弹牙珍珠。",
  "descriptionEn": "Brown sugar aroma with chewy pearls.",
  "price": 25,
  "categoryCode": "tea",
  "imageUrl": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=82",
  "isNew": true,
  "isHot": false,
  "status": "ON_SALE",
  "stock": 200,
  "sortOrder": 90
}
```

必填字段：`name`、`price`、`categoryCode`。成功状态码为 `201`，`data` 返回完整商品详情。

### 6.3 管理端商品详情

```http
GET /admin/products/:id
Authorization: Bearer <token>
```

可以查询包含下架状态在内的商品，响应结构与公开商品详情一致。

### 6.4 更新商品

```http
PUT /admin/products/:id
Authorization: Bearer <token>
```

该接口支持只提交需要修改的字段：

```json
{
  "price": 27,
  "isHot": true,
  "stock": 180
}
```

至少提交一个字段。成功后 `data` 返回更新后的完整商品详情。

### 6.5 修改商品状态

```http
PATCH /admin/products/:id/status
Authorization: Bearer <token>
```

请求体：

```json
{
  "status": "OFF_SALE"
}
```

状态说明：

| 状态 | 说明 |
|---|---|
| `ON_SALE` | 上架，可在公开列表查询 |
| `OFF_SALE` | 下架，公开接口不可查询 |
| `SOLD_OUT` | 售罄，公开接口仍可展示 |

### 6.6 删除商品

```http
DELETE /admin/products/:id
Authorization: Bearer <token>
```

响应：

```json
{
  "success": true,
  "message": "商品已删除",
  "data": {
    "deleted": true
  }
}
```

## 7. 角色与权限

| 角色 | `role` | `roles` | 说明 |
|---|---|---|---|
| 普通用户 | `user` | `["USER"]` | 使用认证接口、查看商品 |
| 管理员 | `admin` | `["ADMIN"]` | 使用商品管理接口 |

权限码：

| 权限码 | 说明 |
|---|---|
| `product:view` | 查看商品 |
| `product:create` | 新增商品 |
| `product:update` | 更新商品 |
| `product:delete` | 删除商品 |
| `product:publish` | 修改商品状态 |

前端可以根据 `roles` 控制路由和菜单，根据 `permissions` 控制按钮显示。后端仍会独立校验权限。

## 8. 状态码与错误码

### 8.1 HTTP 状态码

| 状态码 | 说明 |
|---|---|
| `200` | 请求成功 |
| `201` | 创建成功 |
| `400` | 参数或加密凭据不正确 |
| `401` | 未登录或 Token 已失效 |
| `403` | 当前角色无权限或来源不在白名单 |
| `404` | 商品或接口不存在 |
| `409` | 用户名或邮箱重复 |
| `423` | 连续登录失败，账号临时锁定 |
| `429` | 请求过于频繁 |
| `500` | 服务内部错误 |

### 8.2 常见业务错误码

| 错误码 | 说明 | 前端处理建议 |
|---|---|---|
| `VALIDATION_ERROR` | 参数校验失败 | 展示 `message` |
| `INVALID_CREDENTIALS` | 账号或密码错误 | 保留账号，清空密码 |
| `AUTH_CHALLENGE_EXPIRED` | Challenge 过期或已使用 | 重新执行完整登录流程 |
| `INVALID_ENCRYPTED_CREDENTIAL` | 密文无法解析 | 重新获取 Challenge 并加密 |
| `USERNAME_EXISTS` | 用户名已存在 | 提示更换用户名 |
| `EMAIL_EXISTS` | 邮箱已存在 | 提示更换邮箱或直接登录 |
| `UNAUTHORIZED` | Token 无效 | 清除登录态并跳转登录页 |
| `FORBIDDEN` | 权限不足 | 提示无权限 |
| `PRODUCT_NOT_FOUND` | 商品不存在 | 返回列表页或提示已下架 |
| `RATE_LIMITED` | 请求过于频繁 | 根据提示稍后重试 |

## 9. 联调账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | `admin` | `123456` |
| 普通用户 | `user` | `123456` |

以上账号仅用于接口联调。注册接口创建的账号默认是普通用户。

## 10. 前端接入顺序

1. 将 Base URL 配置到请求模块。
2. 对接 `/auth/challenge` 和 RSA 加密封装。
3. 对接注册、登录并保存 Token。
4. 在请求拦截逻辑中自动添加 Bearer Token。
5. 页面刷新时调用 `/auth/me` 恢复用户信息。
6. 对接分类、商品列表、搜索和商品详情。
7. 使用普通账号验证管理员接口返回 `403`。
8. 使用管理员账号对接商品新增、编辑、上下架和删除。
9. 收到 `401` 时清除登录态并跳转登录页。

## 11. CORS 说明

当前允许从以下本地开发地址发起浏览器请求：

```text
http://localhost:5173
http://127.0.0.1:5173
http://localhost:5174
http://127.0.0.1:5174
http://localhost:5175
http://127.0.0.1:5175
```

前端部署到新域名后，需要将该域名加入接口来源白名单。通过 Postman、Apifox 或服务端程序调用时不受浏览器 CORS 限制。

## 12. 健康检查

```http
GET /health
```

响应：

```json
{
  "success": true,
  "message": "success",
  "data": {
    "service": "tea-demo-api",
    "status": "ok",
    "time": "2026-08-06T08:00:00.000Z"
  }
}
```
