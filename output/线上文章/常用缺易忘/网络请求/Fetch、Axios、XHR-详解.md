---
title: "Fetch、Axios、XHR 详解"
slug: "fetch-axios-xhr-4b58d611"
summary: ""
category: "网络请求"
categoryPath:
  - "常用缺易忘"
  - "网络请求"
tags: []
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac36c"
originalSlug: "fetch-axios-xhr-4b58d611"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.377Z"
updatedAt: "2026-06-13T14:09:43.206Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 前端网络请求三大利器：从基础到实战的全面解析
在前端开发中，“获取后端数据”是贯穿项目始终的核心需求——就像我们在餐厅点餐时需要服务员传递需求，前端也需要“网络请求工具”作为桥梁，连接前端页面与后端服务器。今天，我们就来系统梳理前端网络请求的三大核心工具：XMLHttpRequest（XHR）、Fetch API 和 Axios，带你掌握它们的用法、特性与适用场景，轻松应对不同项目需求。



## 一、先搞懂：什么是网络请求？
用“餐厅点餐”的场景类比，网络请求的流程其实很直观：

+ **你（前端页面）**：告诉服务员“想要一份番茄炒蛋”（发起数据请求，比如“获取用户列表”）；
+ **服务员（网络请求工具）**：将需求传递给厨房（后端服务器）；
+ **厨房（后端服务器）**：按照需求做好菜（处理请求，查询数据库并生成数据）；
+ **服务员（网络请求工具）**：把做好的菜端给你（将后端返回的数据传递给前端，完成页面渲染）。

简单来说，网络请求工具就是前端与后端的“沟通使者”，负责处理“发送请求”和“接收响应”的全部细节。而前端开发中，最常用的“使者”就是 XHR、Fetch 和 Axios。



## 二、老牌使者：XMLHttpRequest（XHR）
作为前端网络请求的“初代工具”，XHR 已经存在多年，就像一位经验丰富但做事略显繁琐的“老服务员”——兼容性极强，功能全面，但写法不够简洁。

### 1. XHR 是什么？
XHR 是浏览器原生提供的 API，是最早实现“异步请求数据”的工具（也就是常说的“AJAX”核心）。无论是早期的 jQuery AJAX，还是一些老项目，底层都依赖 XHR。

### 2. 怎么用 XHR？
#### （1）GET 请求：获取数据
比如“获取用户列表”，步骤分为“创建实例→配置请求→处理响应→发送请求”：

```javascript
// 1. 创建 XHR 实例（叫来服务员）
const xhr = new XMLHttpRequest();

// 2. 配置请求（告诉服务员：要什么菜、去哪里拿）
// 参数：请求方法（GET）、请求地址、是否异步（true 表示异步）
xhr.open('GET', 'https://api.example.com/users', true);

// 3. 处理成功响应（菜做好了怎么端上桌）
xhr.onload = function () {
  // 判断状态码：200 表示请求成功
  if (xhr.status === 200) {
    // 手动解析 JSON 数据（把菜装盘）
    const userData = JSON.parse(xhr.responseText);
    console.log('成功获取用户列表：', userData);
  } else {
    // 非 200 状态码（如 404、500），提示错误
    console.error('请求失败，状态码：', xhr.status);
  }
};

// 4. 处理网络错误（送餐途中出问题）
xhr.onerror = function () {
  console.error('网络错误，请求无法发送！');
};

// 5. 发送请求（正式下单）
xhr.send();
```

#### （2）POST 请求：提交数据
比如“创建新用户”，需要额外设置“请求头”（告诉后端数据格式）和“请求体”（要提交的数据）：

```javascript
const xhr = new XMLHttpRequest();
// 配置 POST 请求
xhr.open('POST', 'https://api.example.com/users', true);

// 关键：设置请求头，说明数据是 JSON 格式
xhr.setRequestHeader('Content-Type', 'application/json');

// 处理成功响应（201 表示“创建成功”）
xhr.onload = function () {
  if (xhr.status === 201) {
    console.log('新用户创建成功！');
  }
};

// 要提交的用户数据
const newUser = {
  name: '小明',
  age: 25
};

// 发送请求：将数据转为 JSON 字符串（避免格式错误）
xhr.send(JSON.stringify(newUser));
```

### 3. XHR 的优缺点
| 优点 | 缺点 |
| --- | --- |
| ✅ 兼容所有浏览器（包括 IE 等老浏览器） | ❌ 代码繁琐，需要手动写“创建→配置→处理”全流程 |
| ✅ 功能全面（支持进度监控、请求取消等） | ❌ 回调函数嵌套多，可读性差（容易出现“回调地狱”） |
| ✅ 无需额外引入依赖（浏览器原生支持） | ❌ 数据解析、错误判断都需要手动处理（比如 JSON.parse） |


## 三、现代使者：Fetch API
随着 ES6 标准的推出，浏览器原生提供了 Fetch API——就像一位年轻、高效的“新服务员”，基于 Promise 设计，语法简洁，更符合现代前端开发习惯。

### 1. Fetch 是什么？
Fetch 是 XHR 的“升级版”，解决了 XHR 回调嵌套的问题，同时保持原生支持的优势（无需装依赖）。但它只兼容现代浏览器（IE 不支持），更适合新项目。

### 2. 怎么用 Fetch？
#### （1）最简 GET 请求
一行代码发起请求，配合 `then` 链式调用处理数据，逻辑更清晰：

```javascript
// 发起 GET 请求，返回 Promise 对象
fetch('https://api.example.com/users')
  // 第一步：将响应转为 JSON 格式（类似 XHR 的 JSON.parse）
  .then(response => response.json())
  // 第二步：处理解析后的数据
  .then(userData => {
    console.log('成功获取用户列表：', userData);
  })
  // 处理错误（网络错误会进入这里）
  .catch(error => {
    console.error('请求失败：', error);
  });
```

#### （2）完整 POST 请求
支持配置“请求方法、请求头、请求体”，还能添加身份验证（如 Token）：

```javascript
fetch('https://api.example.com/users', {
  method: 'POST', // 请求方法
  headers: { // 请求头配置
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123' // 身份验证 Token
  },
  body: JSON.stringify({ // 请求体数据（同 XHR 的 POST）
    name: '小明',
    age: 25
  })
})
.then(response => {
  // 关键：Fetch 只判断“网络错误”，HTTP 错误（如 404）需手动判断
  if (!response.ok) {
    throw new Error(`请求失败，状态码：${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log('新用户创建成功：', data);
})
.catch(error => {
  console.error('错误信息：', error);
});
```

#### （3）用 async/await 简化代码
Fetch 基于 Promise，所以可以配合 `async/await` 语法，彻底告别“链式调用”：

```javascript
// 定义异步函数
async function getUserList() {
  try {
    // 等待请求响应
    const response = await fetch('https://api.example.com/users');
    // 手动判断 HTTP 错误
    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`);
    }
    // 等待数据解析
    const userData = await response.json();
    console.log('用户列表：', userData);
    return userData;
  } catch (error) {
    // 统一捕获所有错误（网络错误 + HTTP 错误）
    console.error('获取数据失败：', error);
  }
}

// 调用函数
getUserList();
```

### 3. Fetch 的优缺点
| 优点 | 缺点 |
| --- | --- |
| ✅ 语法简洁，基于 Promise，支持 async/await | ❌ 错误处理不智能（HTTP 错误需手动判断 response.ok） |
| ✅ 浏览器原生支持（现代浏览器），无需装依赖 | ❌ 不支持超时控制（需要额外写代码实现） |
| ✅ 代码可读性高，避免回调地狱 | ❌ 默认不发送 Cookie（需手动配置 credentials: 'include'） |
| ✅ 支持多种响应格式（json()、text()、blob() 等） | ❌ 不兼容 IE 浏览器（需引入 polyfill） |


## 四、全能使者：Axios
Axios 是基于 XHR 封装的第三方库，就像一支“专业服务团队”——不仅继承了 XHR 的兼容性，还整合了 Fetch 的简洁语法，同时增加了大量实用功能，是企业级项目的首选。

### 1. Axios 是什么？
Axios 不是浏览器原生工具，需要通过 npm 安装（或引入 CDN），但它解决了 XHR 和 Fetch 的诸多痛点（如自动错误处理、拦截器、请求取消），功能全面且易用。

### 2. 怎么用 Axios？
#### （1）基础使用：GET 与 POST
Axios 会自动处理“数据解析”和“请求头”，无需手动配置：

```javascript
// 1. GET 请求：获取用户列表
axios.get('https://api.example.com/users')
  .then(response => {
    // Axios 自动解析 JSON 数据，存在 response.data 中
    console.log('用户列表：', response.data);
  })
  .catch(error => {
    // 自动捕获所有错误（网络错误 + HTTP 错误）
    console.error('请求失败：', error);
  });

// 2. POST 请求：创建新用户
axios.post('https://api.example.com/users', {
  name: '小明',
  age: 25
})
.then(response => {
  console.log('创建成功：', response.data);
})
.catch(error => {
  console.error('错误：', error);
});
```

#### （2）高级功能：请求配置与拦截器
Axios 的核心优势是“灵活配置”和“拦截器”，比如统一设置基础地址、添加全局 Token：

```javascript
// 1. 创建 Axios 实例，配置全局默认值
const api = axios.create({
  baseURL: 'https://api.example.com', // 基础地址（所有请求自动拼接）
  timeout: 5000, // 超时时间（5秒没响应则报错）
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. 请求拦截器：发送请求前做统一处理（如添加 Token）
api.interceptors.request.use(
  config => {
    // 从本地存储获取 Token，添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // 必须返回配置，否则请求会卡住
  },
  error => {
    // 请求发送前的错误（如配置错误）
    return Promise.reject(error);
  }
);

// 3. 响应拦截器：接收响应后做统一处理（如 Token 过期刷新）
api.interceptors.response.use(
  response => {
    // 只返回响应体（简化后续处理）
    return response.data;
  },
  error => {
    // 统一处理错误：比如 Token 过期跳转登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 4. 使用实例发起请求（无需重复配置）
api.get('/users') // 自动拼接为 https://api.example.com/users
  .then(data => console.log('用户列表：', data))
  .catch(error => console.error('错误：', error));
```

#### （3）其他实用功能
+ **请求取消**：比如用户切换页面时，取消未完成的请求，避免资源浪费；
+ **并发请求**：同时发起多个请求，等待所有请求完成后统一处理；
+ **自动转换数据**：请求体自动转为 JSON，响应体自动解析为 JS 对象。

### 3. Axios 的优缺点
| 优点 | 缺点 |
| --- | --- |
| ✅ 功能全面（拦截器、超时控制、请求取消等） | ❌ 需要额外安装（非浏览器原生，增加项目体积） |
| ✅ 错误处理完善（自动捕获网络错误和 HTTP 错误） | ❌ 简单项目用 Axios 会显得“过度设计” |
| ✅ 自动处理 JSON 数据（无需手动 parse/stringify） | - |
| ✅ 兼容所有浏览器（包括 IE，需配合 Promise polyfill） | - |
| ✅ 支持请求/响应拦截器，便于全局配置 | - |


## 五、三大利器对比：该选哪一个？
很多前端开发者会纠结“到底用哪个工具”，其实核心看项目需求。以下是三者的关键特性对比：

| 特性 | XHR | Fetch | Axios |
| --- | --- | --- | --- |
| 语法简洁度 | ❌ 复杂 | ✅ 简洁 | ✅ 很简洁 |
| 浏览器支持 | ✅ 所有浏览器 | ✅ 现代浏览器 | ✅ 所有浏览器 |
| Promise 支持 | ❌ 需手动封装 | ✅ 原生支持 | ✅ 完美支持 |
| 拦截器 | ❌ 无 | ❌ 无 | ✅ 有（核心优势） |
| 取消请求 | ✅ 有 | ⚠️ 需额外代码 | ✅ 有 |
| JSON 处理 | ❌ 手动处理 | ✅ 需调用 .json() | ✅ 自动处理 |
| 错误处理 | ⚠️ 需手动判断 | ⚠️ 不完善 | ✅ 很完善 |
| 额外依赖 | ❌ 无 | ❌ 无 | ✅ 需安装 |


## 六、场景选择建议
1. **简单项目 + 现代浏览器**：选 Fetch API  
比如个人博客、静态页面，不需要兼容老浏览器，且请求逻辑简单——Fetch 语法简洁，无需额外依赖，足够满足需求。
2. **复杂企业项目**：选 Axios  
比如管理系统、电商平台，需要全局配置（如统一 Token）、错误处理、请求取消等功能——Axios 的拦截器和全能特性能大幅提升开发效率，减少重复代码。
3. **需兼容老浏览器（如 IE）**：选 XHR 或 Axios  
如果项目必须兼容 IE，且不想引入依赖，就用 XHR；如果想兼顾开发效率，就用 Axios + Promise polyfill（解决 IE 不支持 Promise 的问题）。



## 七、学习建议与实战
1. **学习顺序**：先掌握 Fetch（入门快，语法简洁）→ 再学 Axios（企业级项目常用，实用性强）→ 最后了解 XHR（知其原理，应对老项目维护）。  
2. **实战练习**：用三种工具实现同一个功能（比如“获取用户列表并渲染页面”），对比写法差异，加深理解。  
3. **避坑提示**：  
    - Fetch 记得手动判断 `response.ok`，否则 404、500 不会进入 catch；  
    - Axios 拦截器要记得返回配置/数据，否则会导致请求“卡住”；  
    - XHR 处理 POST 请求时，必须设置 `Content-Type: application/json`，否则后端无法解析数据。



## 总结
XHR 是“基础”，见证了前端网络请求的发展；Fetch 是“现代”，代表了原生 API 的进步；Axios 是“实用”，整合了前两者的优点，成为企业级项目的首选。作为前端开发者，不需要“死磕”某一个工具，而是要根据项目需求灵活选择——理解它们的核心特性，才能在开发中高效解决“数据请求”问题，让前端与后端的沟通更顺畅。
