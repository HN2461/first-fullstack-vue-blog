---
title: "第 09 篇：Axios 请求库：实例、拦截器、取消请求、错误处理"
slug: "vue-vue-axios-4d3d1aab"
summary: "本文档基于Vue开发场景，从入门原理到企业级封装，涵盖所有核心细节。Axios是一个基于Promise的HTTP网络请求库，可运行于浏览器端和Node.js服务端。"
category: "vue辅助"
categoryPath:
  - "我的总结"
  - "Vue"
  - "vue辅助"
tags:
  - "Vue"
  - "Axios"
  - "HTTP请求"
  - "Promise"
  - "拦截器"
status: "published"
sortOrder: 90
cover: ""
originalId: "6a2d291f8a2b1c68f2cac4c8"
originalSlug: "vue-vue-axios-4d3d1aab"
originalStatus: "published"
publishedAt: "2026-05-08T14:07:54.712Z"
updatedAt: "2026-07-31T11:16:24.629Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 09 篇：Axios 请求库：实例、拦截器、取消请求、错误处理
> 本文档基于 Vue 开发场景，从入门原理到企业级封装，涵盖所有核心细节。
>

---

## 一、Axios 基础认知
### 1.1 什么是 Axios？
+ **官方定义**：Axios 是一个基于 **Promise** 的 HTTP 网络请求库，可运行于浏览器端和 Node.js 服务端。
+ **通俗类比**：Axios 就像一个“快递员”。
    - **前端**：发件人，填写快递单（配置对象）。
    - **后端**：收件人/仓库。
    - **Promise**：表示这是一个异步结果的“承诺”，最终要么成功拿到结果，要么失败抛出错误。

### 1.2 为什么选 Axios 而不是 fetch？
+ **支持 Promise API**：写法优雅。
+ **拦截器机制**：这是核心优势，可以在请求/响应被处理前统一拦截（如加 Token、统一报错）。
+ **转换请求/响应数据**：自动处理 JSON。
+ **取消请求**：可以中断正在进行的请求。
+ **客户端支持防御 XSRF**：内置安全机制。

---

## 二、安装与基础使用
### 2.1 安装
在 Vue 项目根目录下打开终端：

```bash
# npm 方式（推荐）
npm install axios

# yarn 方式
yarn add axios
```

### 2.2 核心方法速查
| 方法 | 描述 |
| --- | --- |
| `axios.get(url)` | 向服务器查询数据（SELECT） |
| `axios.post(url)` | 向服务器提交新数据（INSERT） |
| `axios.put(url)` | 向服务器更新完整数据（UPDATE 全量） |
| `axios.patch(url)` | 向服务器更新部分数据（UPDATE 增量） |
| `axios.delete(url)` | 向服务器删除数据（DELETE） |


### 2.3 GET 请求详解
用于获取数据，参数通常拼接在 URL 后面。

```javascript
import axios from 'axios';

// 写法 1：直接在 url 后面拼（不推荐，麻烦且不优雅）
axios.get('/user?ID=12345&name=zhangsan');

// 写法 2：使用 params 配置对象（推荐）
axios.get('/user', {
  // params 里的对象会自动序列化为 URL 查询字符串
  params: {
    ID: 12345,
    name: 'zhangsan'
  }
})
.then(function (response) {
  // 请求成功处理
  console.log(response.data); // 后端返回的真正数据
  console.log(response.status); // HTTP 状态码，如 200
  console.log(response.headers); // 响应头
})
.catch(function (error) {
  // 请求失败处理
  console.log(error);
});
```

### 2.4 POST 请求详解
用于提交数据，参数通常放在请求体（Body）中。

```javascript
// 发送 JSON 数据（最常用，axios 会自动设置 Content-Type 为 application/json）
axios.post('/user', {
  firstName: 'Fred',
  lastName: 'Flintstone'
});

// 发送 FormData 数据（用于文件上传或后端要求表单格式）
const formData = new FormData();
formData.append('file', fileObj); // 假设有一个文件对象
formData.append('username', 'admin');

// ⚠️ 注意：FormData 无需手动设置 Content-Type
// Axios 会自动识别并设置为 multipart/form-data; boundary=...
axios.post('/upload', formData);
```

### 2.5 现代写法：async/await
这是目前开发的标准写法，避免了 Promise 的 `.then()` 回调地狱，代码看起来像同步执行一样清晰。

**注意：推荐配合 **`try...catch`** 使用来捕获错误，这也是业务代码里最常见、最清晰的写法。**

```javascript
// 在 Vue 的 methods 中
methods: {
  async fetchData() {
    try {
      // await 等待请求完成，直接拿到结果
      const response = await axios.get('/user/12345');
      console.log(response.data);
      
      // 可以继续写同步逻辑
      this.doSomething(response.data);
    } catch (error) {
      // 如果上面任何一步出错，会跳到这里
      console.error('请求出错了:', error);
      alert(error.message);
    }
  }
}
```

---

## 三、Axios 配置项深度解析
### 3.1 配置的优先级
配置可以在多个地方设置，发生冲突时，优先级如下：  
**具体请求配置 > 实例配置 > 全局默认配置**

### 3.2 全局配置对象详解
这是一份完整的配置清单及说明：

```javascript
{
  // 1. 核心 URL 配置
  url: '/user', // 请求的服务器 URL
  method: 'get', // 请求方法，默认 get
  baseURL: 'https://api.example.com/api', // 会自动加在 url 前面（除非 url 是绝对路径）

  // 2. 数据与参数
  params: { ID: 12345 }, // URL 查询参数对象（所有方法都可用，常见于 GET/DELETE）
  data: { firstName: 'Fred' }, // 作为请求体发送的数据（常见于 POST/PUT/PATCH/DELETE；GET 通常不这样用）

  // 3. 序列化与转换（高级）
  // 在发送请求前修改请求数据
  transformRequest: [function (data, headers) {
    // 比如把对象转成 FormData，或者修改 Content-Type
    return data;
  }],
  // 在接收响应后修改响应数据
  transformResponse: [function (data) {
    // 默认会尝试 JSON.parse(data)
    return data;
  }],
  // params 的自定义序列化（解决数组、索引格式等问题）
  paramsSerializer: {
    serialize: function (params) {
      // 也可以配合 qs 库使用：npm install qs
      // return qs.stringify(params, { arrayFormat: 'repeat' })
    }
  },

  // 4. 请求头
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token...'
  },

  // 5. 超时与认证
  timeout: 1000, // 请求超时时间（毫秒），0 表示永不超时
  withCredentials: false, // 跨域请求时是否需要使用凭证（如 Cookie）
  auth: { // HTTP Basic Auth
    username: 'janedoe',
    password: 's00pers3cret'
  },

  // 6. 响应处理
  responseType: 'json', // 服务器响应的数据类型：'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  // 定义 resolve/reject 的 HTTP 状态码
  validateStatus: function (status) {
    return status >= 200 && status < 300; // 默认，只有 2xx 才算成功
  },

  // 7. 取消请求
  cancelToken: new CancelToken(function (cancel) {})
}
```

---

## 四、企业级封装实战（核心重点）
在真实项目中，我们从不直接使用 `axios.get`，而是创建一个**实例**并进行封装。

### 4.1 目录结构
```latex
src/
├── utils/
│   └── request.js      # axios 封装文件
├── api/
│   └── user.js         # 具体的 API 接口管理（可选但推荐）
└── views/
    └── Login.vue       # 业务组件
```

### 4.2 第一步：封装 request.js
这是一个包含了**环境变量、Token 注入、错误统一处理、Loading 状态**的完整封装。

```javascript
import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus'; // 假设用了 ElementPlus，没有可忽略

let loadingInstance = null;

// 1. 创建实例
const service = axios.create({
  // 从环境变量读取基础地址，开发/生产环境自动切换
  // 【Vue CLI 项目】
  // .env.development: VUE_APP_BASE_API = '/dev-api'
  // .env.production: VUE_APP_BASE_API = 'https://api.company.com'
  // baseURL: process.env.VUE_APP_BASE_API,
  
  // 【Vite 项目】（推荐）
  // .env.development: VITE_BASE_API = '/dev-api'
  // .env.production: VITE_BASE_API = 'https://api.company.com'
  baseURL: import.meta.env.VITE_BASE_API,
  
  timeout: 15000 // 15秒超时
});

// 2. 请求拦截器 (Request Interceptor)
service.interceptors.request.use(
  config => {
    // 开启 Loading (可选)
    loadingInstance = ElLoading.service({ fullscreen: true, text: '加载中...' });

    // 逻辑：如果有 Token，就带到请求头里
    const token = localStorage.getItem('Admin-Token');
    if (token) {
      // 让后端每个接口都能识别你是谁
      config.headers['Authorization'] = 'Bearer ' + token;
      // 注意：有些后端不按常理出牌，可能叫 config.headers['X-Access-Token']
    }
    return config;
  },
  error => {
    // 请求错误处理
    console.error('Request Error:', error);
    if (loadingInstance) loadingInstance.close();
    return Promise.reject(error);
  }
);

// 3. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
  response => {
    if (loadingInstance) loadingInstance.close();

    // 文件流等二进制响应不要走统一业务码判断，否则会把下载请求误判为失败
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response;
    }

    const res = response.data;

    // 假设后端返回格式为：{ code: 200, data: {}, msg: "success" }
    // code === 200 表示业务逻辑成功
    if (res.code !== 200) {
      ElMessage.error(res.msg || 'Error');
      
      // 特殊处理：401 Token 过期 / 未登录
      if (res.code === 401) {
        localStorage.removeItem('Admin-Token');
        window.location.href = '/login'; // 示例写法：实际项目也可改用 router.replace('/login')
      }
      
      return Promise.reject(new Error(res.msg || 'Error'));
    } else {
      // 成功：直接返回 data，如果 data 为空则返回整个 res
      return res.data ?? res;
    }
  },
  error => {
    if (loadingInstance) loadingInstance.close();
    
    console.error('Response Error:', error);
    
    // 处理 HTTP 状态码错误（如 404, 500）
    if (error.response) {
      switch (error.response.status) {
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        case 401:
          ElMessage.error('登录状态已失效，请重新登录');
          localStorage.removeItem('Admin-Token');
          break;
        default:
          ElMessage.error(error.message);
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络');
    }
    
    return Promise.reject(error);
  }
);

export default service;
```

### 4.3 第二步：API 接口模块化管理 (推荐)
不要把接口 URL 散落在各个 Vue 文件里，统一管理更方便维护。

**文件：**`src/api/user.js`

```javascript
import request from '@/utils/request';

// 用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  });
}

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  });
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/user/delete/${id}`, // 路径参数
    method: 'delete'
  });
}
```

### 4.4 第三步：在组件中使用
```vue
<template>
  <div>
    <el-button @click="handleLogin">登录</el-button>
  </div>
</template>
<script>
// 引入定义好的 API 函数
import { login, getUserList } from '@/api/user';

export default {
  methods: {
    async handleLogin() {
      try {
        // 调用接口，代码极其简洁
        const token = await login({ username: 'admin', password: '123456' });
        localStorage.setItem('Admin-Token', token);
        
        // 继续调用下一个接口
        const list = await getUserList({ page: 1 });
        console.log('用户列表:', list);
        
      } catch (error) {
        // 错误已经在 request.js 里弹窗提示过了，这里可以只做逻辑处理
        console.log('业务逻辑失败', error);
      }
    }
  }
}
</script>

```

---

## 五、Authorization 与 Token 认证机制详解
### 5.1 什么是 Authorization 请求头？
它是 HTTP 协议中用于身份验证的字段。格式为：

```plain
Authorization: <Type> <Credentials>
```

### 5.2 两种主流认证方式
#### 方式一：Basic Auth（基础认证）
+ **原理**：将 `用户名:密码` 进行 **Base64** 编码，放入 Header。
+ **安全性**：极低。Base64 是**编码**不是**加密**，可以被轻易解码。仅建议在 HTTPS 环境下使用，或内部测试用。
+ **Axios 写法**：

```javascript
axios.get('/api', {
  auth: {
    username: 'admin',
    password: '123456'
  }
  // 自动生成: Authorization: Basic YWRtaW46MTIzNDU2
});
```

#### 方式二：Bearer Token（令牌认证，主流）
+ **原理**：这是目前前后端分离（JWT）的标准做法。
    1. **登录**：前端发送账号密码 -> 后端验证 -> 后端签发 Token（一张有时效的电子门禁卡）。
    2. **请求**：前端在请求头 `Authorization` 中携带这张卡 -> 后端验证卡的有效性 -> 返回数据。
+ **格式**：`Authorization: Bearer <Token字符串>` (注意 Bearer 后面有个空格)。

### 5.3 Token 的生命周期（完整流程）
1. **存储**：登录成功后，将 Token 存入 `localStorage`（持久化）或 `sessionStorage`（会话级）。
2. **携带**：通过 Axios 请求拦截器，统一将 Token 塞入 Header。
3. **验证**：后端拦截器读取 Header 并验证。
4. **过期**：如果 Token 过期，后端返回 401，前端在响应拦截器中清除 Token 并跳转登录页。

---

## 六、高级功能与常见问题
### 6.1 解决跨域问题 (CORS)
**现象**：浏览器控制台报 `Access-Control-Allow-Origin` 错误。  
**原因**：浏览器的同源安全策略（协议、域名、端口任一不同即为跨域）。

#### 开发环境解决方案：配置代理

**Vue CLI 项目（vue.config.js）：**
```javascript
module.exports = {
  devServer: {
    proxy: {
      // 当请求地址以 /api 开头时，代理转发
      '/api': {
        target: 'http://localhost:8080', // 真实后端地址
        changeOrigin: true, // 让代理请求更像直接发给目标服务器，部分后端场景会需要
        pathRewrite: {
          '^/api': '' // 路径重写：如果后端接口没有 /api 前缀，就把它去掉
        }
      }
    }
  }
}
```

**Vite 项目（vite.config.js）：**
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

_⚠️ 注意：修改配置文件后必须重启开发服务器！_

#### 生产环境解决方案

**方案一：后端配置 CORS（最常用）**
```javascript
// Node.js Express 示例
const cors = require('cors');
app.use(cors({
  origin: 'https://your-domain.com', // 允许的前端域名
  credentials: true // 允许携带 Cookie
}));
```

**方案二：Nginx 反向代理**
```nginx
server {
  listen 80;
  server_name your-domain.com;

  location /api {
    proxy_pass http://backend:8080;
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
    add_header Access-Control-Allow-Headers 'Content-Type, Authorization';
  }
}
```

_⚠️ 上面是演示型配置，生产环境通常还要补齐 `OPTIONS` 预检处理、凭证策略和更严格的来源限制。_

**方案三：使用同域部署**  
将前端和后端部署在同一个域名下（如前端在 `/`，后端在 `/api`），从根本上避免跨域。

### 6.2 文件下载 (Blob)
当后端返回文件流时，需要设置 `responseType: 'blob'`。

**什么是 blob？**  
`blob` = **Binary Large Object**，二进制大对象。就是浏览器专门用来存放**文件类型数据**的容器。

```javascript
// api.js（注意：需要返回完整 response 对象以获取文件名）
export function downloadFile(id) {
  return request({
    url: `/file/download/${id}`,
    method: 'get',
    responseType: 'blob' // 关键配置
  });
}

// 组件中使用（完整版：自动提取文件名）
async handleDownload() {
  try {
    // 注意：这里需要拿到完整的 response 对象
    const response = await downloadFile(1);
    
    // 从响应头提取文件名（后端通常会在 Content-Disposition 中返回）
    const disposition = response.headers['content-disposition'];
    let filename = 'download.xlsx'; // 默认文件名
    
    if (disposition) {
      // 解析文件名：Content-Disposition: attachment; filename="report.xlsx"
      const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
      }
    }
    
    // 创建 Blob URL 并触发下载
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // 清理：移除 DOM 元素并释放内存
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('文件下载失败:', error);
  }
}
```

**注意事项：**
1. 如果使用了响应拦截器，需要确保 `blob` / `arraybuffer` 类型的响应不要走统一业务码判断，通常通过判断 `response.config.responseType` 后直接返回完整 `response`。
2. 文件名中如果包含中文，后端需要进行 URL 编码，前端用 `decodeURIComponent` 解码。

### 6.3 取消请求
**场景**：用户在搜索框快速输入，上一次请求还没回来就输入了下一个字，此时需要取消上一次请求。

#### 方式一：AbortController（Axios 1.x+ 推荐，Web 标准）
```javascript
import axios from 'axios';

let controller; // 保存控制器

// 搜索方法
function search(keyword) {
  // 如果之前有请求没完成，先取消它
  if (controller) controller.abort();
  
  // 创建新的控制器
  controller = new AbortController();

  axios.get('/search', {
    params: { keyword },
    signal: controller.signal // 关联信号
  }).catch(error => {
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error.message);
    }
  });
}
```

#### 方式二：CancelToken（Axios 0.x 旧 API，已废弃但仍可用）
```javascript
import axios from 'axios';
const CancelToken = axios.CancelToken;
let cancel; // 保存取消函数

// 搜索方法
function search(keyword) {
  // 如果之前有请求没完成，先取消它
  if (cancel) cancel();

  axios.get('/search', {
    params: { keyword },
    cancelToken: new CancelToken(function executor(c) {
      cancel = c; // 把取消函数赋值给外部变量
    })
  });
}
```

**推荐使用 AbortController**，因为：
1. 它是 Web 标准 API，不依赖 Axios
2. 可以同时取消多个请求（一个 signal 可以传给多个请求）
3. Axios 官方已将 CancelToken 标记为 deprecated

---

## 七、总结与速查表
| 阶段 | 操作 | 关键代码 |
| :--- | :--- | :--- |
| **安装** | 引入库 | `npm i axios` |
| **基础** | GET 请求 | `axios.get(url, { params: {} })` |
| **基础** | POST 请求 | `axios.post(url, data)` |
| **进阶** | 创建实例 | `axios.create({ baseURL, timeout })` |
| **进阶** | 请求拦截 | `config.headers['Authorization'] = token` |
| **进阶** | 响应拦截 | `if (res.code !== 200) 报错` |
| **认证** | 格式 | `Authorization: Bearer <Token>` |
| **问题** | 跨域 | 配置 `vue.config.js` 中的 `devServer.proxy` |


基于你提供的《Axios 实战完全指南与学习笔记》，我将结合刚刚讨论的 Vue Router 中 **params 与 query** 的区别，进行一次**综合性总结**，帮助你理清这两个“同名不同义”的概念，并在实际 Vue 项目中正确运用。

---

## 一、概念澄清：两个不同维度的“params”
### 1. Axios 中的 `params`
+ **位置**：Axios 请求配置对象的一个字段。  
+ **作用**：用于生成 URL 的**查询字符串**（即 `?key=value` 部分）。  
+ **适用请求**：通常用于 GET、DELETE 等需要将参数拼在 URL 上的方法，也可用于其他方法（但 POST/PUT 一般推荐使用 `data`）。  
+ **示例**：

```javascript
axios.get('/user', { params: { id: 123 } });   // 请求 /user?id=123
```

### 2. Vue Router 中的 `params`
+ **位置**：路由跳转时 `$router.push` 或 `<router-link>` 的传参方式之一。  
+ **作用**：对应**路径中的动态段**（占位符），如 `/user/:id` 中的 `id`。  
+ **特点**：如果它本来就是路由路径的一部分（如 `/user/:id` -> `/user/123`），刷新后会保留；真正容易丢失的是那些**没有体现在最终 URL 中**的额外 `params`。  
+ **示例**：

```javascript
// 路由配置: { path: '/user/:id', name: 'user' }
this.$router.push({ name: 'user', params: { id: 123 } });  // 最终 URL: /user/123
```

### 3. Vue Router 中的 `query`
+ **位置**：同样是路由跳转时的传参方式。  
+ **作用**：对应 URL 中的**查询字符串**（即 `?` 之后的部分）。  
+ **特点**：参数显式显示在 URL 中，刷新页面参数依然保留。  
+ **示例**：

```javascript
this.$router.push({ path: '/user', query: { name: '张三' } }); // URL: /user?name=张三
```

---

## 二、核心区别总结表
| 上下文 | 参数名 | 实际含义 | 表现形式 | 刷新是否保留 | 典型使用场景 |
| --- | --- | --- | --- | --- | --- |
| **Axios** | `params` | URL 查询字符串（`?key=value`） | `/api/user?id=123` | 是 | API 请求参数（筛选、分页、ID） |
| **Vue Router** | `params` | 路径动态段（占位符） | `/user/123` | 通常保留（前提是参数体现在 URL 中） | 资源标识（如用户详情页） |
| **Vue Router** | `query` | URL 查询字符串（`?key=value`） | `/user?name=张三` | 是 | 非关键参数（搜索关键词、页码等） |


---

## 三、为什么在 Vue 项目中容易混淆？
1. **命名冲突**：Axios 的 `params` 与 Vue Router 的 `params` 虽然同名，但一个作用于**网络请求**，一个作用于**路由跳转**。  
2. **概念重叠**：Vue Router 的 `query` 和 Axios 的 `params` **功能类似**——都是在 URL 上附加 `?key=value` 形式的参数，但它们的上下文完全不同。  
3. **开发者经验**：初学者往往将两者混为一谈，导致在组件中错误地使用 `this.$route.params` 去获取 Axios 传来的查询参数，或试图用 `params` 传递查询字符串给后端。

---

## 四、实战建议：如何避免混淆
### ✅ 1. 区分使用场景
+ **路由跳转**：决定页面显示什么 → 使用 Vue Router 的 `params` 或 `query`。  
+ **API 请求**：获取数据 → 使用 Axios 的 `params`（用于查询字符串）或 `data`（用于请求体）。

### ✅ 2. 命名规范
在 Vue 组件中，接收路由参数时，可以明确命名：

```javascript
// 获取路由动态段参数
const userId = this.$route.params.id;

// 获取路由查询参数
const page = this.$route.query.page;
```

在 API 模块中，使用 Axios 时：

```javascript
// 显式表明是查询参数
export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params  // 这里的 params 是 Axios 配置
  });
}
```

### ✅ 3. 利用代码注释
在复杂项目中，可以在代码中标注来源，例如：

```javascript
// 路由跳转：传递 userId 作为路径参数
this.$router.push({ name: 'user', params: { userId } });

// API 调用：将 userId 作为查询参数
axios.get('/user', { params: { userId } });
```

### ✅ 4. 利用工具函数统一处理
如果后端同时需要路径参数和查询参数，可以在 API 函数中合并：

```javascript
// 例如：删除用户，id 是路径参数，其他条件用查询参数
export function deleteUser(id, params) {
  return request({
    url: `/user/delete/${id}`,
    method: 'delete',
    params  // 自动拼接为 ?xxx=yyy
  });
}
```

---

## 五、结合笔记的延伸思考
在你的 Axios 笔记中，`params` 字段被详细描述为“URL 查询参数对象”，并强调它适用于 GET 等请求。这与 Vue Router 的 `query` 本质相同，但注意：

+ **Vue Router 的 **`query` 用于前端路由控制，改变的是浏览器地址栏，**不会自动触发 Axios 请求**。  
+ **Axios 的 **`params` 用于后端 API 调用，改变的是 HTTP 请求的 URL，**不会影响路由状态**。

在实际开发中，经常会出现这样的联动：

```javascript
// 监听路由变化，重新请求数据
watch: {
  '$route.query': {
    handler() {
      this.fetchData(); // 内部使用 Axios 的 params 传参
    },
    immediate: true
  }
},
methods: {
  async fetchData() {
    const { page, size } = this.$route.query;
    const res = await getUserList({ page, size }); // Axios 的 params 接收
    this.list = res.data;
  }
}
```

---

## 六、一句话总结
+ **Axios 的 **`params` = 给后端接口传的 **URL 查询参数**（`?` 后的键值对）。  
+ **Vue Router 的 **`params` = 路由路径中的**动态段**（`/user/:id` 中的 `id`）。  
+ **Vue Router 的 **`query` = 路由 URL 中的**查询字符串**（`?` 后的键值对）。

三者虽然名称有重叠，但分别服务于**网络请求**和**前端路由**两个完全不同的层面，理解各自的作用域和语法，就能轻松避免混淆。


---

## 七、总结与速查表
| 阶段 | 操作 | 关键代码 |
| :--- | :--- | :--- |
| **安装** | 引入库 | `npm i axios` |
| **基础** | GET 请求 | `axios.get(url, { params: {} })` |
| **基础** | POST 请求 | `axios.post(url, data)` |
| **进阶** | 创建实例 | `axios.create({ baseURL, timeout })` |
| **进阶** | 请求拦截 | `config.headers['Authorization'] = token` |
| **进阶** | 响应拦截 | `if (res.code !== 200) 报错` |
| **认证** | Bearer Token | `Authorization: Bearer <Token>` |
| **问题** | 跨域（开发） | 配置 `vue.config.js` 或 `vite.config.js` 代理 |
| **问题** | 跨域（生产） | 后端 CORS / Nginx 反向代理 |
| **高级** | 取消请求 | `AbortController` (推荐) / `CancelToken` (已废弃) |
| **高级** | 文件下载 | `responseType: 'blob'` + `window.URL.createObjectURL` |

---

## 八、环境变量配置速查

| 构建工具 | 环境变量前缀 | 访问方式 | 示例 |
| --- | --- | --- | --- |
| **Vue CLI** | `VUE_APP_` | `process.env.VUE_APP_XXX` | `VUE_APP_BASE_API` |
| **Vite** | `VITE_` | `import.meta.env.VITE_XXX` | `VITE_BASE_API` |

**.env.development 示例：**
```bash
# Vue CLI
VUE_APP_BASE_API=/dev-api

# Vite
VITE_BASE_API=/dev-api
```

**.env.production 示例：**
```bash
# Vue CLI
VUE_APP_BASE_API=https://api.company.com

# Vite
VITE_BASE_API=https://api.company.com
```

---

## 九、Axios params 与 Vue Router params/query 的区别

这是 Vue 项目中最容易混淆的概念之一，因为它们名称相同但作用域完全不同：

| 上下文 | 参数名 | 作用域 | 表现形式 | 是否发送到后端 | 典型场景 |
| --- | --- | --- | --- | --- | --- |
| **Axios** | `params` | HTTP 请求 | `/api/user?id=123` | ✅ 是 | 后端 API 查询参数 |
| **Vue Router** | `params` | 前端路由 | `/user/123` | ❌ 否 | 路径动态段（如用户 ID） |
| **Vue Router** | `query` | 前端路由 | `/user?name=张三` | ❌ 否 | URL 查询参数（搜索关键词） |

**关键理解：**
- **Axios 的 `params`** 会通过 HTTP 请求发送到**后端服务器**
- **Vue Router 的 `params`/`query`** 只影响**浏览器地址栏**，不会自动触发 HTTP 请求

**实际开发中的联动示例：**
```javascript
// 监听路由变化，重新请求数据
watch: {
  '$route.query': {
    handler() {
      this.fetchData(); // 内部使用 Axios 的 params 传参
    },
    immediate: true
  }
},
methods: {
  async fetchData() {
    const { page, size } = this.$route.query; // Vue Router 的 query
    const res = await getUserList({ page, size }); // Axios 的 params 接收
    this.list = res.data;
  }
}
```

**一句话总结：**
- Axios 的 `params` = 给后端接口传的 URL 查询参数（会发送到服务器）
- Vue Router 的 `params` = 路由路径中的动态段（仅前端路由）
- Vue Router 的 `query` = 路由 URL 中的查询字符串（仅前端路由）

三者虽然名称有重叠，但分别服务于**网络请求**和**前端路由**两个完全不同的层面。
