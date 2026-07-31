---
title: "第 3 篇：Axios 请求库实战：实例封装、拦截器、文件上传、Vue 接入"
slug: "js-axios-61754a5a"
summary: "Axios 请求库实战，讲清请求封装、实例、拦截器、文件上传、错误处理以及 Vue 项目里的常见使用方式。"
category: "JS库"
tags:
  - "JavaScript"
  - "Axios"
  - "HTTP请求"
  - "拦截器"
  - "文件上传"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d29208a2b1c68f2cac6c2"
originalSlug: "js-axios-61754a5a"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 3 篇：Axios 请求库实战：实例封装、拦截器、文件上传、Vue 接入

## 先说它到底是什么

`Axios` 是一个专门用来发送 HTTP 请求的 JavaScript 库。

它最常见的用途就是：

- 调登录接口
- 拉列表数据
- 提交表单
- 上传文件
- 下载文件
- 统一处理 token、超时、报错

如果只用一句话概括：

**它解决的是“前端怎么更稳定地和后端接口打交道”这件事。**

## 为什么它在前端项目里这么常见

因为真实项目里的请求，不只是简单写一句 `fetch('/api')` 就结束了。

真正做业务时，经常还要处理：

- 接口基础地址 `baseURL`
- 请求头统一携带 token
- 超时时间
- 响应数据统一解包
- 登录失效统一跳转
- 错误提示统一处理
- 文件上传进度
- 某些请求取消或重复提交拦截

这些事如果分散在每个页面里单独写，项目会很快变乱。

所以很多项目的做法是：

**用 `Axios` 作为请求底座，再在项目里封装一层统一的请求模块。**

## 它适合解决什么问题

特别适合：

- 中后台管理系统接口请求
- Vue / React 项目的统一请求封装
- 需要请求拦截器和响应拦截器
- 文件上传、下载
- 统一处理错误提示和登录态失效

不太适合把它理解成：

- 状态管理库
- 数据缓存框架
- 权限系统本身

它更像：

**请求通信工具**

而不是：

**整个数据流方案**

## 为什么很多项目不会直接到处写 `axios.get`

这是一个很实战的问题。

如果每个页面都直接写：

```js
axios.get('/users')
axios.post('/login', form)
axios.put('/profile', data)
```

一开始好像很快，但后面会慢慢出现几个问题：

- 每个文件都在重复拼接地址
- token 注入逻辑到处复制
- 报错提示不统一
- 后端返回结构一变，很多页面都要改
- 文件上传和普通请求写法分裂

所以更稳的做法通常是：

1. 先创建一个 `axios` 实例
2. 给实例挂请求拦截器和响应拦截器
3. 再对外封装 `get / post / upload` 之类的方法

## 最小接入方式

```bash
npm install axios
```

最基础的调用：

```js
import axios from 'axios'

axios({
  url: '/api/user/list',
  method: 'get'
}).then((res) => {
  console.log(res.data)
})
```

也可以直接写：

```js
axios.get('/api/user/list')
axios.post('/api/login', {
  username: 'admin',
  password: '123456'
})
```

这只是最小可用版本。

项目里真正常见的重点，往往在实例、默认配置和拦截器。

## 实例为什么重要

官方文档支持通过 `axios.create()` 创建实例。

这非常适合项目开发，因为您可以给这个实例统一配置：

- `baseURL`
- `timeout`
- 默认请求头
- 请求拦截器
- 响应拦截器

示例：

```js
import axios from 'axios'

const service = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export default service
```

这样后面业务代码里就不用每次都重复写完整配置了。

## 请求拦截器通常做什么

官方文档明确支持请求拦截器。

请求发出去之前，最常做这些事：

- 给请求头加 token
- 统一加租户 ID、语言、版本号
- 在提交前处理参数
- 记录请求日志
- 阻止某些非法请求

示例：

```js
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

以后看到项目里有这一段，您就知道它的意义不是“语法仪式感”，而是：

**把每次请求都要做的公共动作，统一收口。**

## 响应拦截器通常做什么

官方文档也支持响应拦截器。

它最常见的用途是：

- 统一拿 `response.data`
- 统一判断业务码是否成功
- token 失效时跳登录
- 统一弹错误提示
- 把错误转换成项目更好处理的格式

示例：

```js
service.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data.code === 200) {
      return data
    }
    return Promise.reject(data)
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      location.hash = '#/login'
    }
    return Promise.reject(error)
  }
)
```

这里最值得记住的是：

**很多项目真正统一的不是 HTTP 本身，而是“后端返回结构 + 业务错误处理方式”。**

## 在 Vue 项目里最常见的封装姿势

常见结构大概会像这样：

```js
// src/utils/request.js
import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

export default request
```

然后业务模块里再拆接口：

```js
// src/api/user.js
import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

export function createUser(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}
```

页面里调用：

```js
import { getUserList } from '@/api/user'

getUserList({ page: 1, pageSize: 10 }).then((res) => {
  console.log(res)
})
```

这个结构的好处是：

- 请求底座统一
- 业务接口集中
- 页面层更干净

## `params` 和 `data` 最容易混在哪

这是初学时很常见的一个点。

通常可以这样记：

- `params`：更常用于 `GET` 查询参数
- `data`：更常用于 `POST / PUT / PATCH` 请求体

例如：

```js
request({
  url: '/user/list',
  method: 'get',
  params: {
    page: 1,
    pageSize: 10
  }
})
```

```js
request({
  url: '/user/create',
  method: 'post',
  data: {
    username: 'tom',
    nickname: 'Tom'
  }
})
```

以后如果接口总是传不对，先检查是不是把 `params` 和 `data` 用反了。

## 文件上传为什么很多项目也喜欢用 Axios

因为官方请求配置支持 `onUploadProgress`，这对上传场景特别实用。

最典型的流程是：

1. 先构造 `FormData`
2. 把文件 append 进去
3. 发 `post` 请求
4. 在上传进度回调里更新 UI

示例：

```js
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/upload/avatar',
    method: 'post',
    data: formData,
    onUploadProgress(progressEvent) {
      const percent = Math.round(
        (progressEvent.loaded / progressEvent.total) * 100
      )
      console.log('上传进度:', percent)
    }
  })
}
```

所以以后您看到上传组件里有 `FormData`、`onUploadProgress`、`http-request` 之类的组合，十有八九就是和这套思路连着的。

## 项目里最常见的几个坑

### 第一，别把库返回的 `response` 和后端业务数据混成一层

`Axios` 默认拿到的是完整响应对象，不只是后端返回体。

它里面一般会有：

- `data`
- `status`
- `headers`
- `config`

所以如果项目响应拦截器已经 `return response.data` 了，页面里就别再写一层 `res.data.data`。

### 第二，超时、报错、401 处理最好别散落在每个页面

这些都应该尽量放在拦截器或统一封装里。

否则项目后面会出现：

- A 页面报错写法一种
- B 页面报错写法另一种
- token 失效有的页面会跳登录，有的不会

### 第三，上传文件时不要手动瞎改 `Content-Type`

很多时候用 `FormData` 上传，浏览器会自动处理边界信息。

如果手动硬写错了，反而容易让后端收不到正确内容。

### 第四，接口模块不要和页面逻辑搅在一起

更清晰的分工通常是：

- `request.js` 负责请求底座
- `api/*.js` 负责业务接口函数
- 页面组件负责调用和展示

## 它和 `fetch` 是什么关系

很多人后面都会问这个问题。

可以先这样理解：

- `fetch` 是浏览器原生能力
- `Axios` 是更偏工程化的请求库

如果只是做一个很简单的小页面，直接用 `fetch` 也完全可以。

但如果是中后台、内容平台、长期维护项目，`Axios` 这种带实例、默认配置、拦截器、上传进度方案的库，通常会更省心。

## 什么时候值得学，学到什么程度够用

如果您以后会做这些东西，`Axios` 基本都值得掌握：

- 管理后台
- 博客后台
- 电商后台
- 用户中心
- 内容平台
- 各类增删改查页面

先掌握这几个点就已经很够用了：

- 它是干什么的
- `axios.create()` 为什么重要
- 请求拦截器和响应拦截器做什么
- `params` 和 `data` 的区别
- 文件上传怎么配 `FormData`
- 为什么项目里通常会封装 `request.js`

## 给自己留一版最短记忆

以后忘了时，先回想这几句：

- `Axios` 是前端常见的 HTTP 请求库
- 它常用来做统一请求封装，不只是简单发请求
- 实例、默认配置、拦截器是它最核心的项目价值
- `params` 更偏查询参数，`data` 更偏请求体
- 上传文件时常见组合是 `FormData + onUploadProgress`
- 页面里少直接堆请求细节，尽量把公共逻辑收进请求层

## 参考资料

- 官方主页：<https://axios-http.com/>
- 请求配置：<https://axios-http.com/docs/req_config>
- 默认配置：<https://axios-http.com/docs/config_defaults>
- 拦截器：<https://axios-http.com/docs/interceptors>

这篇文章主要基于 Axios 官方文档里的请求配置、默认配置、拦截器能力，再结合 Vue 项目中最常见的请求封装、统一鉴权和文件上传场景做实战化整理。
