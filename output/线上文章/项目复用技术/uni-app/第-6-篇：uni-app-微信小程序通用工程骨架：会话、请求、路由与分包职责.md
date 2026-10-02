---
title: "第 6 篇：uni-app 微信小程序通用工程骨架：会话、请求、路由与分包职责"
slug: "uniapp-wechat-mini-program-project-skeleton"
summary: "从微信小程序项目落地出发，梳理 uni-app 工程目录、配置、存储、会话、请求、Pinia、路由与分包的职责边界，并附迁移步骤和验收清单。"
category: "uni-app"
categoryPath:
  - "项目复用技术"
  - "uni-app"
tags:
  - "uni-app"
  - "微信小程序"
  - "Vue 3"
  - "工程结构"
  - "请求封装"
  - "登录态"
status: "published"
sortOrder: 60
cover: ""
originalId: "6abf80f2b29038327447c25f"
originalSlug: "uniapp-wechat-mini-program-project-skeleton"
originalStatus: "published"
publishedAt: "2026-10-02T10:01:22.438Z"
updatedAt: "2026-10-02T10:01:22.443Z"
exportedAt: "2026-10-02T10:18:25.336Z"
---
# 第 6 篇：uni-app 微信小程序通用工程骨架：会话、请求、路由与分包职责

## 1. 目标

这套骨架解决新项目最早需要稳定下来的公共问题：

- 环境配置与平台开关。
- 本地存储访问和键名治理。
- 登录态、会话就绪、退出与失效处理。
- HTTP 请求配置、鉴权头、错误归一化。
- 登录后跳转、返回和 tabBar 路由。
- Pinia 中的会话状态。
- 主包、分包和启动顺序。
- 可选的 WebSocket 注册位置。

核心原则是页面只表达业务，不重复处理 token、租户头、错误码、缓存清理和平台跳转。

## 2. 推荐职责结构

目录名称可以服从新项目现状，但应保留这些职责：

```text
config/               环境地址、成功码、请求头和功能开关
storage/              存储键、序列化和版本迁移
auth/                 token、会话就绪和统一退出
request/              HTTP 配置与拦截器
router/               登录后跳转、返回和 tabBar 路由
platform/             H5、小程序、App 平台能力差异
stores/               Pinia 状态
api/                  按业务域声明接口
components/           跨页面复用组件
pages/                主包启动页面
packages/             低频业务分包
```

AI 接入新项目时，先定位承担这些职责的现有文件。已有成熟封装时应补齐或修复，不要强行创建同名目录。

## 3. 配置层

把环境变化和协议差异收敛为配置，禁止散落到页面：

```javascript
export const appConfig = {
  apiBaseUrl: 'https://api.example.com',
  requestTimeout: 15000,
  successCode: 200,
  authInvalidCodes: [401, 40101],
  loginPage: '/pages/login/index',
  defaultHomePage: '/pages/home/index',
  authHeaderName: 'Authorization',
  authHeaderPrefix: 'Bearer ',
  tenantHeaderEnabled: false,
  tenantHeaderName: 'X-Tenant-Id',
  messageServiceEnabled: false,
  websocketUrl: ''
}
```

生产地址、密钥和第三方标识不应提交到公共模板。使用环境变量或本地忽略配置，并提供不含秘密的示例配置。

## 4. 存储层

### 4.1 统一键名

```javascript
export const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: 'ACCESS_TOKEN',
  CURRENT_USER: 'CURRENT_USER',
  TENANT_CONTEXT: 'TENANT_CONTEXT',
  LOGIN_IN_PROGRESS: 'LOGIN_IN_PROGRESS',
  SESSION_EXIT_NOTICE: 'SESSION_EXIT_NOTICE',
  DEVICE_PREFERENCES: 'DEVICE_PREFERENCES'
})
```

### 4.2 存储封装

```javascript
export const storage = {
  get(key, fallback = null) {
    const value = uni.getStorageSync(key)
    return value === '' || value === undefined || value === null
      ? fallback
      : value
  },

  set(key, value) {
    if (value === undefined) {
      throw new Error(`不能向本地存储写入 undefined: ${key}`)
    }
    uni.setStorageSync(key, value)
  },

  remove(key) {
    uni.removeStorageSync(key)
  },

  mergeObject(key, patch) {
    const current = this.get(key, {})
    const next = {
      ...(current && typeof current === 'object' ? current : {}),
      ...(patch && typeof patch === 'object' ? patch : {})
    }
    this.set(key, next)
    return next
  }
}
```

更新用户或租户的单个字段时必须合并写入，不能用最小对象覆盖完整资料。

## 5. 会话模型

### 5.1 会话就绪不等于 token 存在

```javascript
import { STORAGE_KEYS } from './storage-keys'
import { storage } from './storage'

export function isLoginInProgress() {
  return storage.get(STORAGE_KEYS.LOGIN_IN_PROGRESS, false) === true
}

export function setLoginInProgress(value) {
  if (value) {
    storage.set(STORAGE_KEYS.LOGIN_IN_PROGRESS, true)
  } else {
    storage.remove(STORAGE_KEYS.LOGIN_IN_PROGRESS)
  }
}

export function getSessionSnapshot() {
  return {
    token: storage.get(STORAGE_KEYS.ACCESS_TOKEN, ''),
    user: storage.get(STORAGE_KEYS.CURRENT_USER, null),
    tenant: storage.get(STORAGE_KEYS.TENANT_CONTEXT, null),
    loginInProgress: isLoginInProgress()
  }
}

export function isSessionReady() {
  const session = getSessionSnapshot()
  return Boolean(
    session.token &&
    session.user?.id &&
    !session.loginInProgress
  )
}
```

如果项目必须选择组织、门店或租户后才能请求业务接口，把租户稳定标识也加入 `isSessionReady`，但不要让所有项目无条件依赖租户字段。

### 5.2 登录成功原子落盘

```javascript
export function persistSession({ token, user, tenant = null }) {
  if (!token || !user?.id) {
    throw new Error('登录结果缺少 token 或用户标识')
  }

  storage.set(STORAGE_KEYS.ACCESS_TOKEN, token)
  storage.set(STORAGE_KEYS.CURRENT_USER, user)

  if (tenant) {
    storage.set(STORAGE_KEYS.TENANT_CONTEXT, tenant)
  } else {
    storage.remove(STORAGE_KEYS.TENANT_CONTEXT)
  }

  setLoginInProgress(false)
  uni.$emit('AUTH_SESSION_READY', getSessionSnapshot())
}
```

先完成所有必需缓存，再发会话就绪事件。不要写入 token 后立即启动请求或 WebSocket，而用户资料仍未落盘。

### 5.3 统一退出

```javascript
let exiting = false

export async function exitSession({
  reason = 'manual',
  notice = '',
  redirect = true
} = {}) {
  if (exiting) return { success: true, skipped: true }
  exiting = true

  try {
    if (uni.$messageService?.disconnect) {
      await uni.$messageService.disconnect()
    }
  } catch (error) {
    console.error('[Session] 断开实时连接失败', error)
  }

  storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
  storage.remove(STORAGE_KEYS.CURRENT_USER)
  storage.remove(STORAGE_KEYS.TENANT_CONTEXT)
  storage.remove(STORAGE_KEYS.LOGIN_IN_PROGRESS)

  if (notice) {
    storage.set(STORAGE_KEYS.SESSION_EXIT_NOTICE, { reason, notice })
  }

  if (redirect) {
    uni.reLaunch({ url: appConfig.loginPage })
  }

  setTimeout(() => {
    exiting = false
  }, 1000)

  return { success: true }
}
```

退出时只清理用户会话和用户级缓存。主题、语言、隐私确认等设备偏好应保留；多账号业务缓存必须按用户 ID 隔离。

## 6. 请求层

### 6.1 错误文案归一化

```javascript
export function resolveResponseMessage(data, fallback = '请求失败') {
  return [data?.msg, data?.message, data?.errorMessage, data?.errorMsg]
    .find((value) => typeof value === 'string' && value.trim())
    ?.trim() || fallback
}

let lastToast = { message: '', time: 0 }

export function showRequestError(message) {
  const normalized = String(message || '请求失败')
  const now = Date.now()

  if (lastToast.message === normalized && now - lastToast.time < 800) return
  lastToast = { message: normalized, time: now }

  const display = normalized.length > 30 ? '操作失败，请稍后重试' : normalized
  uni.showToast({ title: display, icon: 'none', mask: true })
}
```

### 6.2 初始化 uv-http

```javascript
export function installRequest() {
  if (!uni.$uv?.http) {
    throw new Error('HTTP 客户端尚未安装')
  }

  uni.$uv.http.setConfig((config) => {
    config.baseURL = appConfig.apiBaseUrl
    config.timeout = appConfig.requestTimeout
    return config
  })

  uni.$uv.http.interceptors.request.use(
    (config) => {
      const { token, tenant } = getSessionSnapshot()
      const custom = config.custom || {}

      if (custom.authRequired && !token) {
        return Promise.reject({
          type: 'AUTH_REQUIRED',
          message: '当前请求需要登录',
          config
        })
      }

      config.header = {
        ...config.header,
        ...(token
          ? {
              [appConfig.authHeaderName]:
                `${appConfig.authHeaderPrefix}${token}`
            }
          : {}),
        ...(appConfig.tenantHeaderEnabled && tenant?.id
          ? { [appConfig.tenantHeaderName]: tenant.id }
          : {})
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  uni.$uv.http.interceptors.response.use(
    async (response) => {
      const data = response.data || {}
      const custom = response.config?.custom || {}
      const message = resolveResponseMessage(data)

      if (!data.msg) data.msg = message
      if (!data.message) data.message = message

      if (appConfig.authInvalidCodes.includes(data.code)) {
        await exitSession({ reason: 'auth-expired', notice: message })
        return Promise.reject({ type: 'AUTH_EXPIRED', response })
      }

      if (data.code !== appConfig.successCode) {
        if (!custom.silent) showRequestError(message)
        return Promise.reject({ type: 'BUSINESS_ERROR', response, message })
      }

      return data
    },
    (error) => {
      const custom = error?.config?.custom || {}
      if (!custom.silent && error?.type !== 'AUTH_REQUIRED') {
        showRequestError(error?.errMsg || error?.message || '网络异常')
      }
      return Promise.reject(error)
    }
  )
}
```

鉴权失效码必须由后端明确约定。不要把同时表示“操作频繁”或“业务失败”的模糊错误码直接当成退出登录。

### 6.3 API 声明和调用

```javascript
export const getProfile = (options = {}) =>
  uni.$uv.http.get('/user/profile', {
    custom: { authRequired: true },
    ...options
  })

export const updateProfile = (data, options = {}) =>
  uni.$uv.http.post('/user/profile', data, {
    custom: { authRequired: true },
    ...options
  })
```

页面只调用语义化 API，并在需要自定义错误展示时传 `custom.silent`。请求拦截器不要直接依赖页面实例。

## 7. Pinia 会话 Store

```javascript
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(storage.get(STORAGE_KEYS.ACCESS_TOKEN, ''))
  const currentUser = ref(storage.get(STORAGE_KEYS.CURRENT_USER, null))
  const tenant = ref(storage.get(STORAGE_KEYS.TENANT_CONTEXT, null))

  const ready = computed(() => Boolean(token.value && currentUser.value?.id))

  function setSession(session) {
    persistSession(session)
    token.value = session.token
    currentUser.value = session.user
    tenant.value = session.tenant || null
  }

  async function logout() {
    await exitSession({ reason: 'manual' })
    token.value = ''
    currentUser.value = null
    tenant.value = null
  }

  return { token, currentUser, tenant, ready, setSession, logout }
})
```

Pinia 持久化插件和手工 `storage` 二选一作为主要事实源。若两者同时存在，必须定义同步顺序，避免 Store 与 storage 值不一致。

## 8. 路由层

```javascript
const TAB_PAGES = new Set([
  '/pages/home/index',
  '/pages/profile/index'
])

export function goTo(url, { replace = false } = {}) {
  if (!url) return Promise.reject(new Error('页面地址不能为空'))

  const method = TAB_PAGES.has(url)
    ? 'switchTab'
    : replace
      ? 'redirectTo'
      : 'navigateTo'

  return new Promise((resolve, reject) => {
    uni[method]({ url, success: resolve, fail: reject })
  })
}

export function goBack(delta = 1) {
  const pages = getCurrentPages()
  if (pages.length > delta) {
    uni.navigateBack({ delta })
  } else {
    uni.reLaunch({ url: appConfig.defaultHomePage })
  }
}
```

登录后跳转还要处理 H5 浏览器历史，具体见 H5 会话专题。

## 9. 应用初始化

### 入口文件

```javascript
import App from './App'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)
  installRequest()

  if (appConfig.messageServiceEnabled) {
    uni.$messageService = createMessageService({
      url: appConfig.websocketUrl,
      getToken: () => getSessionSnapshot().token
    })
  }

  return { app }
}
```

入口只注册能力，不在模块顶层发请求、连接 WebSocket 或读取页面参数。

### 应用生命周期

```vue
<script>
export default {
  onLaunch() {
    // 只做一次性初始化，不放具体业务请求
  },

  async onShow() {
    if (!appConfig.messageServiceEnabled) return
    if (!isSessionReady()) return

    try {
      await uni.$messageService?.connect?.()
    } catch (error) {
      console.error('[App] 恢复实时连接失败', error)
    }
  },

  onHide() {
    // 是否断开连接由业务的在线策略决定
  }
}
</script>
```

## 10. 主包和分包

- 主包保留启动页、登录页、tabBar 页和真正全局的公共模块。
- 低频业务按业务域进入分包。
- 分包之间不要直接依赖彼此的页面代码。
- 大型图表、编辑器、媒体库和平台 SDK 跟随使用页面进入相应分包。
- 公共模块体积过大时，先判断是否真的全局复用，不要因为“公共”就全部塞入主包。
- 页面配置中的分包地址必须与真实文件和跳转方式一致。

最小配置示例：

```json
{
  "pages": [
    {
      "path": "pages/login/index",
      "style": { "navigationBarTitleText": "登录" }
    },
    {
      "path": "pages/home/index",
      "style": { "navigationBarTitleText": "首页" }
    }
  ],
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#2979ff",
    "list": [
      { "pagePath": "pages/home/index", "text": "首页" },
      { "pagePath": "pages/profile/index", "text": "我的" }
    ]
  },
  "subPackages": [
    {
      "root": "packages/example",
      "pages": [
        {
          "path": "detail/index",
          "style": { "navigationBarTitleText": "详情" }
        }
      ]
    }
  ]
}
```

## 11. 可选 WebSocket 边界

WebSocket 服务至少提供：

```javascript
{
  connect,
  disconnect,
  send,
  onMessage,
  offMessage,
  getStatus
}
```

应负责防重复连接、心跳、指数退避、前台补连、重连后恢复订阅和退出断开。页面只注册业务消息回调，不直接维护底层 socket。

不要把历史查询、会话列表和可靠业务提交全部塞入 WebSocket。实时接收使用连接，历史与命令优先使用 HTTP。

## 12. AI 新项目落地步骤

1. 读取目标项目技术栈、协作规则和现有目录。
2. 画出现有配置、存储、会话、请求、路由和状态流。
3. 标出重复逻辑和多套事实源。
4. 先确定后端成功码、鉴权失效码和请求头契约。
5. 建立会话就绪谓词和统一退出入口。
6. 接入请求拦截器，再迁移一个低风险 API 验证。
7. 接入登录成功落盘和跳转。
8. 最后迁移其他页面，避免一次性全仓库替换。
9. 按目标平台编译并真机回归。

## 13. 验收清单

- [ ] 未登录启动不会发需要鉴权的请求或连接实时服务。
- [ ] 登录结果完整落盘后才发会话就绪事件。
- [ ] 请求自动带 token，租户头由配置控制。
- [ ] 业务错误不会误触发退出登录。
- [ ] 并发鉴权失败只执行一次退出和跳转。
- [ ] 退出后设备偏好保留，用户级缓存不会串账号。
- [ ] tabBar、普通页和登录页使用正确跳转方式。
- [ ] 主包体积、分包引用和真机首次加载通过。
- [ ] 页面没有重复实现公共请求头、token 清理和错误提示。
- [ ] H5 刷新、小程序冷启动和 App 前后台恢复分别验证。
