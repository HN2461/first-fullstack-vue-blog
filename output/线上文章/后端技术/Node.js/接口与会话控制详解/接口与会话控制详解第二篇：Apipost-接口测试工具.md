---
title: "接口与会话控制详解第二篇：Apipost 接口测试工具"
slug: "node-js-apipost-ea2d5bde"
summary: "从零掌握 Apipost 接口测试工具，包括安装配置、发送各类 HTTP 请求、设置请求头和 token、环境变量管理、接口文档生成，以及常见测试场景的完整操作流程。"
category: "接口与会话控制详解"
tags:
  - "Node.js"
  - "Apipost"
  - "接口测试"
  - "Postman"
  - "HTTP"
status: "draft"
sortOrder: 70
cover: ""
originalId: "6a2d291e8a2b1c68f2cac188"
originalSlug: "node-js-apipost-ea2d5bde"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 接口与会话控制详解第二篇：Apipost 接口测试工具

> 接口写好了，不能每次都靠前端页面来测试。接口测试工具让你直接发请求、看响应，效率高很多。这篇把 Apipost 从安装到实战讲透。

---

## 一、为什么需要接口测试工具

### 1.1 没有工具时的痛点

后端写好一个接口，想测试它，通常有几种方式：

```
方式1：等前端写好页面再测
  → 太慢，而且出问题不知道是前端还是后端的锅

方式2：用浏览器地址栏
  → 只能发 GET 请求，POST/PUT/DELETE 都没法测

方式3：用 curl 命令行
  → 可以，但写起来麻烦，不直观
  curl -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer xxx" \
    -d '{"username":"张三","password":"123456"}'

方式4：接口测试工具（Apipost / Postman）
  → 图形界面，点点点就能发请求，保存接口，团队共享
```

### 1.2 常用工具对比

| 工具 | 特点 | 适合谁 |
|------|------|--------|
| **Apipost** | 国产，中文界面，免费功能完整，支持团队协作 | 国内团队首选 |
| **Postman** | 国际主流，功能最全，部分功能收费 | 有英文基础的开发者 |
| **Insomnia** | 轻量，开源，界面简洁 | 个人开发者 |
| **Thunder Client** | VS Code 插件，不用切换窗口 | 喜欢在编辑器里操作的 |

这篇以 Apipost 为主，操作逻辑和 Postman 基本一致，学会一个另一个也会用。

---

## 二、安装与基础界面

### 2.1 安装

打开 [https://www.apipost.cn](https://www.apipost.cn)，下载对应系统的安装包，安装后注册账号（免费）。

### 2.2 界面结构

```
┌─────────────────────────────────────────────────────┐
│  左侧：项目/接口树形列表                              │
│  ┌──────────────────────────────────────────────┐   │
│  │  中间：请求编辑区                              │   │
│  │  ┌──────────────────────────────────────┐    │   │
│  │  │  上方：URL 输入栏 + 发送按钮           │    │   │
│  │  │  中间：Params / Headers / Body 标签页  │    │   │
│  │  │  下方：响应区（状态码 + 响应体）        │    │   │
│  │  └──────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 三、发送各类请求

### 3.1 GET 请求

**场景**：获取用户列表

```
步骤：
1. 点击左上角"新建请求"
2. 方法选 GET
3. URL 填：http://localhost:3000/api/users
4. 点击"发送"
```

**带查询参数的 GET**：

```
方式一：直接写在 URL 里
http://localhost:3000/api/users?page=1&limit=10&role=admin

方式二：在 Params 标签页填写（推荐，更清晰）
Key: page    Value: 1
Key: limit   Value: 10
Key: role    Value: admin
→ Apipost 自动拼接到 URL
```

### 3.2 POST 请求（JSON 格式）

**场景**：注册用户

```
方法：POST
URL：http://localhost:3000/api/auth/register

Headers 标签页：
  Content-Type: application/json
  （Apipost 选 Body 为 JSON 时会自动加，通常不需要手动填）

Body 标签页：
  选择 "JSON" 格式
  填写：
  {
    "username": "张三",
    "email": "zhangsan@example.com",
    "password": "123456"
  }

点击发送，查看响应
```

### 3.3 POST 请求（表单格式）

有些接口接收 `application/x-www-form-urlencoded` 格式（传统表单）：

```
Body 标签页：
  选择 "x-www-form-urlencoded"
  填写：
  Key: username   Value: 张三
  Key: password   Value: 123456
```

### 3.4 上传文件（multipart/form-data）

```
Body 标签页：
  选择 "form-data"
  填写：
  Key: file    Value: [点击选择文件]    类型选 File
  Key: title   Value: 我的头像          类型选 Text
```

### 3.5 PUT / PATCH / DELETE

操作和 POST 类似，只是方法不同：

```
PUT /api/users/123
Body（JSON）：{ "username": "新名字", "age": 26 }

PATCH /api/users/123
Body（JSON）：{ "username": "新名字" }

DELETE /api/users/123
（通常不需要 Body）
```

---

## 四、设置请求头

### 4.1 常用请求头

```
Content-Type: application/json        → 告诉服务器请求体是 JSON
Authorization: Bearer <token>         → 携带 JWT token
Accept: application/json              → 告诉服务器期望返回 JSON
Accept-Language: zh-CN                → 语言偏好
```

### 4.2 在 Apipost 里设置

```
Headers 标签页 → 点击"添加"
Key: Authorization
Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.3 用变量代替 token（推荐）

每次手动复制粘贴 token 很麻烦，用变量：

```
1. 先登录，拿到 token
2. 在"环境变量"里设置：token = eyJhbGci...
3. 请求头里写：Authorization: Bearer {{token}}
4. Apipost 自动替换 {{token}} 为实际值
```

---

## 五、环境变量

### 5.1 为什么需要环境变量

同一套接口，开发环境和生产环境的 URL 不同：

```
开发：http://localhost:3000/api/users
生产：https://api.myapp.com/api/users
```

如果 URL 写死，切换环境要改几十个接口，很麻烦。

### 5.2 配置环境变量

```
1. 点击右上角"环境管理"（或设置图标）
2. 新建环境：
   - 开发环境：baseUrl = http://localhost:3000
   - 生产环境：baseUrl = https://api.myapp.com

3. 接口 URL 改为：{{baseUrl}}/api/users

4. 切换环境时，所有接口的 URL 自动更新
```

### 5.3 常用变量

```
baseUrl    = http://localhost:3000
token      = eyJhbGci...（登录后手动更新）
userId     = 6642a1b2c3d4e5f678901234
```

---

## 六、自动提取 token（脚本）

每次登录后手动复制 token 很烦，Apipost 支持后置脚本自动提取：

```javascript
// 在登录接口的"后置脚本"里写：
// 从响应体里提取 token，存到环境变量

const response = pm.response.json()
if (response.data && response.data.token) {
  pm.environment.set('token', response.data.token)
  console.log('token 已自动保存')
}
```

这样每次执行登录接口，token 自动更新到环境变量，其他接口直接用 `{{token}}` 就行。

---

## 七、查看响应

### 7.1 响应区域

发送请求后，下方响应区显示：

```
状态码：200 OK（绿色）/ 400 Bad Request（红色）
响应时间：123ms
响应大小：1.2 KB

响应体（Body）：
{
  "code": 200,
  "message": "success",
  "data": { ... }
}

响应头（Headers）：
Content-Type: application/json; charset=utf-8
Set-Cookie: connect.sid=xxx（如果有 Cookie）
```

### 7.2 常见问题排查

```
状态码 404：
  → URL 写错了，或者路由没注册

状态码 400：
  → 请求参数有问题，看响应体里的 message

状态码 401：
  → 没带 token，或 token 过期

状态码 500：
  → 服务器报错，去看终端的错误日志

连接被拒绝（Connection Refused）：
  → 服务器没启动，或端口不对

CORS 错误：
  → 服务器没配置跨域，或 Apipost 里不会有这个问题
    （CORS 是浏览器的限制，Apipost 不是浏览器）
```

---

## 八、接口文档

### 8.1 保存接口

```
1. 发送请求后，点击"保存"
2. 填写接口名称：获取用户列表
3. 选择所属目录：用户模块
4. 保存后，左侧树形列表里就有这个接口了
```

### 8.2 生成文档

Apipost 可以把保存的接口自动生成 API 文档，分享给前端：

```
1. 右键点击项目或目录
2. 选择"导出文档"或"分享文档"
3. 生成在线文档链接，前端可以直接查看
```

---

## 九、完整测试流程示例

以测试"注册 → 登录 → 获取用户信息"为例：

**第一步：测试注册**

```
POST http://localhost:3000/api/auth/register
Body（JSON）：
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}

期望响应：
{
  "code": 201,
  "message": "注册成功",
  "data": { "token": "...", "user": { ... } }
}
```

**第二步：测试登录，自动保存 token**

```
POST http://localhost:3000/api/auth/login
Body（JSON）：
{
  "email": "test@example.com",
  "password": "123456"
}

后置脚本：
const res = pm.response.json()
pm.environment.set('token', res.data.token)
```

**第三步：测试需要登录的接口**

```
GET http://localhost:3000/api/profile
Headers：
  Authorization: Bearer {{token}}

期望响应：
{
  "code": 200,
  "data": { "userId": "...", "username": "testuser" }
}
```

**第四步：测试无 token 时的拦截**

```
GET http://localhost:3000/api/profile
（不带 Authorization 头）

期望响应：
{
  "code": 401,
  "message": "未登录，请先登录"
}
```

---

## 十、小结

| 操作 | 步骤 |
|------|------|
| 发 GET 请求 | 选 GET → 填 URL → 发送 |
| 发 POST 请求 | 选 POST → 填 URL → Body 选 JSON → 填数据 → 发送 |
| 带 token | Headers → Authorization: Bearer {{token}} |
| 设置环境变量 | 环境管理 → 新建变量 → 接口里用 {{变量名}} |
| 自动提取 token | 登录接口后置脚本 → `pm.environment.set('token', ...)` |
| 保存接口 | 发送后点保存 → 填名称 → 选目录 |

**下一篇**：Cookie 原理与实战——HTTP 无状态协议是什么，Cookie 怎么工作，在 Express 里怎么设置、读取、删除，以及各种安全属性的作用。
