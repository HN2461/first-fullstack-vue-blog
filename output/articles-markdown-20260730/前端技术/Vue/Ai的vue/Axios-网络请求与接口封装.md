---
title: "Axios 网络请求与接口封装"
slug: "vue-ai-vue-axios-00b046d5-revision-20260730"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 110
cover: ""
originalId: "6a2d291e8a2b1c68f2cac276"
originalSlug: "vue-ai-vue-axios-00b046d5"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 第20章 Axios 网络请求与接口封装

> 目标：掌握 Vue2 项目中最常见的网络请求方案：axios + 封装。

---

## 20.1 axios 基础用法与请求方式

常见请求方法：

- GET：查询
- POST：新增
- PUT/PATCH：更新
- DELETE：删除

示例：

```js
import axios from 'axios'

axios.get('/api/users', { params: { page: 1 } })
axios.post('/api/login', { username: 'a', password: 'b' })
```

---

## 20.2 request 封装思路

封装目标：

- 统一 baseURL、超时、headers
- 统一注入 token
- 统一处理错误（弹窗/提示/跳转登录）
- 让业务层只关心：`api.xxx()`

一个典型封装入口（示意）：

```js
// utils/request.js
import axios from 'axios'

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000
})

export default request
```

---

## 20.3 baseURL / timeout / headers

### 20.3.1 baseURL

- 开发环境可用 `/api` 走代理
- 生产环境用真实域名

### 20.3.2 timeout

- 建议设置，避免请求“永远挂住”

### 20.3.3 headers

常见：

- `Content-Type: application/json`
- 文件上传时使用 `multipart/form-data`（axios 会帮你处理 FormData）

---

## 20.4 请求拦截器：注入 token

在请求发出前统一注入 token：

```js
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## 20.5 响应拦截器：错误统一处理

在响应返回后统一处理：

- 业务成功/失败
- HTTP 状态码（401、403、500）

示意：

```js
request.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const status = error.response && error.response.status

    if (status === 401) {
      // token 失效：清理并跳转登录
      localStorage.removeItem('token')
      // router.push('/login')
    }

    return Promise.reject(error)
  }
)
```

---

## 20.6 API 模块拆分策略（按业务域划分）

建议按业务域拆分：

- `api/user.js`
- `api/order.js`
- `api/product.js`

示意：

```js
// api/user.js
import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}
```

业务层只调用：

- `login(form)`
- `getUserInfo()`

---

## 20.7 文件上传/下载（FormData、Blob）

### 20.7.1 上传

```js
export function uploadFile(file) {
  const fd = new FormData()
  fd.append('file', file)

  return request({
    url: '/upload',
    method: 'post',
    data: fd
  })
}
```

### 20.7.2 下载

下载通常要用 `responseType: 'blob'`：

```js
export function downloadExcel() {
  return request({
    url: '/export',
    method: 'get',
    responseType: 'blob'
  })
}
```

---

## 本章小结

- axios 封装的核心是：统一配置、统一拦截、统一错误处理。
- 请求拦截器注入 token，响应拦截器处理异常与登录失效。
- API 按业务域拆分，避免“一个巨大的 api.js”。
- 上传用 FormData，下载用 Blob。

**下一章预告**

第21章将进入 Vue2 实战项目：以后台管理系统为例，完成布局、登录、权限、CRUD、图表与部署。
