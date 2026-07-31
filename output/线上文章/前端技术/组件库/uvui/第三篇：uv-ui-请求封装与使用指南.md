---
title: "第三篇：uv-ui 请求封装与使用指南"
slug: "uv-ui-uvui-uv-ui-a5e9c7ec"
summary: "结合 uv-ui 官方 Http 文档、扩展配置和 uni-app 请求能力，整理一套适合微信小程序项目落地的请求封装、拦截器与上传下载方案。"
category: "uvui"
tags:
  - "uv-ui"
  - "uni-app"
  - "微信小程序"
  - "HTTP"
  - "请求封装"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac66a"
originalSlug: "uv-ui-uvui-uv-ui-a5e9c7ec"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第三篇：uv-ui 请求封装与使用指南

> 这篇不是把官方 API 原样搬过来，而是把 `uv-ui` 的 `http` 能力整理成一套适合微信小程序项目直接落地的写法。  
> 重点是三件事：先把扩展配置接好、再把请求收口、最后把上传下载和常见坑补齐。

这篇内容已按 **2026-05-03** 再次核对 `uv-ui` 官方 `Http`、扩展配置和常见问题文档。  
官方也明确说明，这层请求能力集成自 `luch-request`，所以后面如果主人遇到更进阶的请求问题，可以把 `uv-ui` 文档和 `luch-request` 原文档配合着看。

## 一、先说结论：页面里别散着写 `uni.$uv.http`

如果你只是在页面里临时写几个请求，前期会觉得很快，后期就会越来越乱：

- token 注入到处复制
- 加载态和错误提示每页各写一套
- 登录失效后跳转逻辑重复
- 上传下载和普通请求风格不统一

更稳的方式是：

1. `main.js` 完成 `uv-ui` 扩展配置
2. `@/utils/request/index.js` 统一写全局配置和拦截器
3. `@/api/*.js` 只暴露具体接口方法
4. 页面只关心“调用哪个接口”和“成功后怎么展示”

## 二、前置条件：先把 `uni.$uv` 挂起来

官方文档明确提到，`uv-ui` 内置方法默认不会直接挂到 `uni` 上，要先完成扩展配置，之后才能稳定使用 `uni.$uv.http`、`uni.$uv.toast` 这些能力。

### 1. `main.js` 引入工具库

```js
import App from './App'
import { createSSRApp } from 'vue'
import uvUI from '@/uni_modules/uv-ui-tools'
import { setupRequest } from '@/utils/request'

// #ifndef VUE3
Vue.use(uvUI)
setupRequest()

const app = new Vue({
  ...App
})

app.$mount()
// #endif

// #ifdef VUE3
export function createApp() {
  const app = createSSRApp(App)
  app.use(uvUI)
  setupRequest(app)
  return {
    app
  }
}
// #endif
```

如果你是 Vue 2 项目，也是在 `Vue.use(uvUI)` 之后再调用请求初始化方法。

### 2. 推荐目录结构

```text
api/
  auth.js
  user.js
  goods.js
utils/
  request/
    index.js
```

## 三、请求层建议这样封装

下面这套写法，核心思路是：

- `setConfig` 放全局默认值
- `custom` 传业务开关
- 请求拦截器处理 token、loading、公共 header
- 响应拦截器处理业务码、401、统一 toast

### 1. `@/utils/request/index.js`

```js
export const setupRequest = (vm) => {
  uni.$uv.http.setConfig((config) => {
    config.baseURL = 'https://api.example.com'
    config.timeout = 15000
    config.header = {
      'Content-Type': 'application/json'
    }
    config.custom = {
      auth: true,
      loading: false,
      toast: true,
      unwrap: true
    }
    config.validateStatus = (statusCode) => {
      return statusCode >= 200 && statusCode < 500
    }
    return config
  })

  uni.$uv.http.interceptors.request.use((config) => {
    config.header = config.header || {}
    config.custom = config.custom || {}

    if (config.custom.auth !== false) {
      const token = uni.getStorageSync('token')
      if (token) {
        config.header.Authorization = `Bearer ${token}`
      }
    }

    if (config.custom.loading) {
      uni.showLoading({
        title: config.custom.loadingText || '加载中...',
        mask: true
      })
    }

    return config
  }, (config) => {
    uni.hideLoading()
    return Promise.reject(config)
  })

  uni.$uv.http.interceptors.response.use((response) => {
    const data = response.data || {}
    const custom = response.config?.custom || {}

    if (custom.loading) {
      uni.hideLoading()
    }

    if (data.code === 401) {
      uni.removeStorageSync('token')
      uni.showToast({
        title: data.message || '登录已过期',
        icon: 'none'
      })

      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }, 1200)

      return Promise.reject(data)
    }

    if (data.code !== 200) {
      if (custom.toast !== false) {
        uni.showToast({
          title: data.message || '请求失败',
          icon: 'none'
        })
      }
      return Promise.reject(data)
    }

    if (custom.unwrap === false) {
      return data
    }

    return data.data
  }, (error) => {
    uni.hideLoading()

    const statusCode = error?.statusCode || error?.response?.statusCode
    const messageMap = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '没有权限访问',
      404: '接口不存在',
      500: '服务器异常',
      502: '网关错误',
      503: '服务暂不可用'
    }

    uni.showToast({
      title: messageMap[statusCode] || '网络异常，请稍后重试',
      icon: 'none'
    })

    return Promise.reject(error)
  })
}
```

### 2. 在 `main.js` 里初始化

```js
import App from './App'
import uvUI from '@/uni_modules/uv-ui-tools'
import { setupRequest } from '@/utils/request'

Vue.use(uvUI)
setupRequest()

const app = new Vue({
  ...App
})

app.$mount()
```

如果你想在拦截器里访问 `store`，可以把 `app` 或 `vm` 传进去，再从 `vm.$store` 里读 token。

## 四、接口文件不要写成“大杂烩”

### 1. 登录相关接口

```js
export const login = (data) => {
  return uni.$uv.http.post('/auth/login', data, {
    custom: {
      auth: false,
      loading: true,
      loadingText: '登录中...'
    }
  })
}

export const getUserInfo = () => {
  return uni.$uv.http.get('/user/profile')
}
```

### 2. 列表接口

```js
export const getGoodsList = (params) => {
  return uni.$uv.http.get('/goods/list', {
    params
  })
}

export const createOrder = (data) => {
  return uni.$uv.http.post('/order/create', data)
}
```

这里最容易写错的一点是：

- `get` 的参数和配置都在第二个参数里
- `post` 的第二个参数是请求体，第三个参数才是配置

## 五、页面里只保留业务流程

```js
import { login } from '@/api/auth'

export default {
  data() {
    return {
      form: {
        mobile: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      if (!this.form.mobile || !this.form.password) {
        uni.showToast({
          title: '请先填写完整信息',
          icon: 'none'
        })
        return
      }

      try {
        const data = await login(this.form)
        uni.setStorageSync('token', data.token)
        uni.setStorageSync('userInfo', data.userInfo)
        uni.switchTab({
          url: '/pages/index/index'
        })
      } catch (error) {
        console.error('登录失败', error)
      }
    }
  }
}
```

这样页面层就只剩下：

- 表单校验
- 成功后保存状态
- 成功后跳转

请求细节都留在请求层和接口层。

## 六、上传下载是小程序里最容易踩坑的地方

### 1. 上传文件

官方文档里说明，`upload` 和普通请求一样支持 `custom`、`header`、`getTask` 等配置。对微信小程序来说，最常用的仍然是 `filePath + name` 这种写法。

```js
export const uploadAvatar = (filePath) => {
  return uni.$uv.http.upload('/file/upload', {
    filePath,
    name: 'file',
    formData: {
      scene: 'avatar'
    },
    custom: {
      loading: true,
      loadingText: '上传中...'
    },
    getTask: (task) => {
      task.onProgressUpdate((res) => {
        console.log('上传进度', res.progress)
      })
    }
  })
}
```

### 2. 下载文件

```js
export const downloadContract = () => {
  return uni.$uv.http.download('/file/contract.pdf', {
    custom: {
      loading: true,
      loadingText: '下载中...'
    }
  })
}
```

调用时记得区分“临时路径”和“持久保存”：

```js
const res = await downloadContract()

await uni.saveFile({
  tempFilePath: res.tempFilePath
})
```

很多同学下载完就直接把 `tempFilePath` 当永久文件路径使用，这在小程序里很容易出问题。

## 七、`custom` 是最值得用好的一个点

官方文档里提到，全局 `custom` 和局部 `custom` 会合并，同名属性局部优先。这个设计很适合做“请求开关”。

我更推荐你把它当成统一约定来用：

```js
uni.$uv.http.get('/public/banner', {
  custom: {
    auth: false,
    loading: true,
    toast: false,
    unwrap: true
  }
})
```

常用约定可以是：

- `auth` 是否自动带 token
- `loading` 是否显示全局加载中
- `loadingText` 加载文案
- `toast` 业务错误时是否自动提示
- `unwrap` 是否只返回 `data.data`

## 八、请求取消、并发请求都可以收进来

### 1. 搜索联想取消上一次请求

```js
let searchTask = null

export const searchGoods = (keyword) => {
  return uni.$uv.http.get('/goods/search', {
    params: {
      keyword
    },
    getTask: (task) => {
      searchTask = task
    }
  })
}

export const abortSearchGoods = () => {
  if (searchTask) {
    searchTask.abort()
    searchTask = null
  }
}
```

### 2. 首页多个接口并发加载

```js
const [userInfo, bannerList, noticeList] = await Promise.all([
  uni.$uv.http.get('/user/profile'),
  uni.$uv.http.get('/banner/list', {
    custom: {
      auth: false
    }
  }),
  uni.$uv.http.get('/notice/list', {
    custom: {
      auth: false
    }
  })
])
```

## 九、微信小程序里最常见的几个坑

### 1. 安装好 `uv-ui` 后组件或请求能力不生效

官方安装文档和注意事项都提到，安装后最好重新运行项目。微信小程序场景下，建议：

1. 关闭微信开发者工具
2. 删除一次 `unpackage`
3. 重新运行项目

否则很容易被缓存干扰。

### 2. 你能用 `uv-button`，但涉及 `open-type` 时别太死磕

`uv-ui` 的基础样式文档提到，微信小程序某些授权或分享场景，更适合直接用原生 `button`，再配合 `uv-reset-button` 清理默认样式。

```html
<button
  class="uv-reset-button"
  open-type="getPhoneNumber"
  @getphonenumber="handleGetPhoneNumber"
>
  获取手机号
</button>
```

这类场景不要为了“统一组件风格”强行全改成 `uv-button`。

### 3. 弹窗打开后页面还能滚动

官方常见问题里给出的处理方式是配合 `page-meta` 控制页面 `overflow`：

```html
<template>
  <page-meta :page-style="'overflow:' + (popupVisible ? 'hidden' : 'visible')"></page-meta>
  <uv-popup
    ref="detailPopup"
    @open="popupVisible = true"
    @close="popupVisible = false"
  />
</template>
```

### 4. Vue 3 下 `ref` 名不要和组件名撞车

例如 `uv-picker` 组件，`ref` 不要写成 `uvPicker` 或 `uvpicker`，否则可能在 `script setup` 场景报错。

## 十、我更推荐的落地规则

1. 所有请求都从 `@/api` 进入，不要在页面直接写裸请求
2. token、loading、错误提示统一交给拦截器
3. 公共业务开关统一走 `custom`
4. 下载后的临时文件要分清是否需要 `saveFile`
5. 搜索联想、上传进度、并发首页这类高频场景提前收口
6. 微信小程序授权按钮、滚动穿透、安装缓存这些坑提前规避

## 参考资料

- [uv-ui Http 请求文档](https://www.uvui.cn/js/http.html)
- [uv-ui 扩展配置](https://www.uvui.cn/components/setting.html)
- [uv-ui 基础样式](https://www.uvui.cn/components/common.html)
- [uv-ui 安装文档](https://www.uvui.cn/components/install.html)
- [uv-ui 常见问题](https://www.uvui.cn/components/problem.html)
- [uv-ui GitHub 仓库](https://github.com/climblee/uv-ui)
