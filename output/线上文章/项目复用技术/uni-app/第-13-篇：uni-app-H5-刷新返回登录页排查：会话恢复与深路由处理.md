---
title: "第 13 篇：uni-app H5 刷新返回登录页排查：会话恢复与深路由处理"
slug: "uniapp-h5-session-route-recovery"
summary: "排查 H5 刷新或返回登录页但会话仍有效的问题，整理会话就绪、登录页自恢复、深路由还原、缓存合并写入与退出流程验证。"
category: "uni-app"
categoryPath:
  - "项目复用技术"
  - "uni-app"
tags:
  - "uni-app"
  - "H5"
  - "会话控制"
  - "路由"
  - "路由守卫"
status: "published"
sortOrder: 130
cover: ""
originalId: "6abf80f2b29038327447c26d"
originalSlug: "uniapp-h5-session-route-recovery"
originalStatus: "published"
publishedAt: "2026-10-02T10:01:22.438Z"
updatedAt: "2026-10-02T10:01:22.515Z"
exportedAt: "2026-10-02T10:18:25.336Z"
---
# 第 13 篇：uni-app H5 刷新返回登录页排查：会话恢复与深路由处理

## 1. 最终结论

H5 浏览器刷新后看到登录页，不一定代表 token 失效。常见真实链路是：

1. 浏览器仍保留深页面 URL。
2. uni-app H5 运行时重新启动，页面栈被清空。
3. 深路由没有被运行时稳定接住，应用先落到根入口。
4. 根入口是登录页，于是登录页生命周期执行。
5. 登录页没有“已登录自恢复”，用户停留在登录页。
6. 登录页又覆盖用户缓存或请求验证码，视觉上更像真正退出。

先区分“会话失效”和“路由恢复失败”，再决定修复请求拦截器还是登录页/导航。

## 2. 会话就绪判定

不要只检查 token。定义一个单一的会话谓词：

```javascript
const SESSION_KEYS = {
  token: 'ACCESS_TOKEN',
  user: 'CURRENT_USER',
  tenant: 'TENANT_CONTEXT',
  loginInProgress: 'LOGIN_IN_PROGRESS'
}

export function isSessionReady() {
  const token = uni.getStorageSync(SESSION_KEYS.token)
  const user = uni.getStorageSync(SESSION_KEYS.user)
  const tenant = uni.getStorageSync(SESSION_KEYS.tenant)
  const loginInProgress = uni.getStorageSync(SESSION_KEYS.loginInProgress)

  return Boolean(
    token &&
    user?.id &&
    tenant?.id &&
    !loginInProgress
  )
}
```

如果新项目没有租户概念，删除 `tenant` 条件；如果有组织选择窗口，必须把“正在登录/正在切换身份”状态考虑进去。

## 3. 先判断是不是真退出

发生问题时记录以下信息，不要第一时间清缓存：

```javascript
export function inspectSession() {
  const user = uni.getStorageSync(SESSION_KEYS.user)
  return {
    hasToken: Boolean(uni.getStorageSync(SESSION_KEYS.token)),
    userId: user?.id || '',
    tenantId: uni.getStorageSync(SESSION_KEYS.tenant)?.id || '',
    loginInProgress: Boolean(
      uni.getStorageSync(SESSION_KEYS.loginInProgress)
    ),
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    href: typeof window !== 'undefined' ? window.location.href : ''
  }
}
```

生产环境不要记录 token、用户隐私、完整授权码或带敏感查询参数的 URL。日志只记录布尔值、脱敏 ID、路由名和事件顺序。

重点证据：

- token、用户 ID、租户上下文仍存在。
- 没有执行统一退出函数。
- H5 应用启动后先变成根 hash。
- 登录页生命周期执行了。
- 登录页请求了验证码或其他只属于未登录流程的接口。

如果证据成立，根因优先是路由入口，不是 token。

## 4. 登录页必须有自恢复保护

登录页在初始化和显示阶段都做一次保护，但要避免重复跳转：

```javascript
let recovering = false

function recoverIfAlreadyLoggedIn() {
  if (recovering || !isSessionReady()) return false
  recovering = true

  const user = uni.getStorageSync(SESSION_KEYS.user)
  const target = resolveHomePage(user)
  navigateAfterLogin(target)
  return true
}

onBeforeMount(() => {
  if (recoverIfAlreadyLoggedIn()) return
  prepareActualLoginPage()
})

onMounted(() => {
  if (recoverIfAlreadyLoggedIn()) return
  requestCaptchaForActualLogin()
})

onShow(() => {
  if (recoverIfAlreadyLoggedIn()) return
  consumeAndShowExitNotice()
})
```

`requestCaptchaForActualLogin()` 只能在确认确实未登录后执行。这样 `/system` 一类验证码接口才是“真实进入登录流程”的信号，不会把误回登录页放大成网络噪音。

## 5. 登录成功后的导航

### 5.1 根据用户状态决定落点

```javascript
function resolveHomePage(user = {}) {
  if (user.role === 'operator') return '/pages/workbench/index'
  return '/pages/home/index'
}
```

不要把原有项目的账号类型数字、页面路径或角色字段直接复制到新项目。先让 AI 找到目标项目现有的用户角色和 tabBar 配置。

### 5.2 H5 用 replace，其他平台用 switchTab

```javascript
function buildH5HashUrl(pageUrl) {
  if (typeof window === 'undefined') return ''
  const normalized = pageUrl.startsWith('/') ? pageUrl : `/${pageUrl}`
  return `${window.location.origin}${window.location.pathname}#${normalized}`
}

export function navigateAfterLogin(targetUrl) {
  if (!targetUrl) return

  // #ifdef H5
  const h5Url = buildH5HashUrl(targetUrl)
  if (h5Url) {
    window.location.replace(h5Url)
    return
  }
  // #endif

  uni.switchTab({
    url: targetUrl,
    fail: (error) => {
      console.error('[Auth] 登录后跳转失败', error)
    }
  })
}
```

H5 登录成功后使用 `replace` 的目的不是改变登录目标页，而是不要把登录页继续留在浏览器回退历史中。小程序和 App 继续使用原有页面栈跳转。

## 6. 登录页写入用户信息必须合并

错误写法：

```javascript
uni.setStorageSync('CURRENT_USER', { tenantId })
```

这会覆盖用户 ID、角色、名称等完整资料。正确写法：

```javascript
const current = uni.getStorageSync('CURRENT_USER') || {}
uni.setStorageSync('CURRENT_USER', {
  ...current,
  tenantId
})
```

更好的做法是把“补齐上下文”和“正式登录落盘”分开：

```javascript
export function mergeTenantContext(tenant) {
  const current = uni.getStorageSync('CURRENT_USER') || {}
  uni.setStorageSync('CURRENT_USER', { ...current, tenantId: tenant.id })
  uni.setStorageSync('TENANT_CONTEXT', tenant)
}
```

补充字段不能改变会话判定，也不能在用户已登录时创建一个只有租户字段的半成品用户对象。

## 7. 更完整的深路由恢复

如果产品要求刷新后回到原来的详情页，而不是只回首页，需要额外保存安全的返回地址：

```javascript
const RETURN_ROUTE_KEY = 'H5_RETURN_ROUTE'
const ALLOWED_PREFIXES = [
  '/pages/home/',
  '/pages/workbench/',
  '/packages/'
]

function isSafeReturnRoute(route) {
  return ALLOWED_PREFIXES.some((prefix) => route.startsWith(prefix))
}

export function saveReturnRoute(route) {
  const normalized = String(route || '')
  if (!isSafeReturnRoute(normalized)) return
  sessionStorage.setItem(RETURN_ROUTE_KEY, normalized)
}

export function consumeReturnRoute() {
  const route = sessionStorage.getItem(RETURN_ROUTE_KEY) || ''
  sessionStorage.removeItem(RETURN_ROUTE_KEY)
  return isSafeReturnRoute(route) ? route : ''
}
```

不要把任意 URL、`javascript:`、外部域名或未过滤的查询参数交给 `location.replace`。返回路由允许列表必须由新项目实际页面结构维护。

在 H5 应用启动早期，若能读取当前 hash 且不是登录页，就保存路由；登录成功后消费一次。若构建器在应用代码执行前已经把 hash 重置为根入口，则需要在 H5 入口 HTML 或更早的启动脚本捕获原始 hash，不能等到登录页再猜。

## 8. 退出流程与登录页提示

统一退出必须完成：

1. 防重复执行。
2. 停止 WebSocket、定时器和消息监听。
3. 清理 token、用户、租户和仅属于当前用户的缓存。
4. 保留设备级偏好。
5. 保存一次性退出原因。
6. 只执行一次回登录跳转。

登录页只消费一次性提示：

```javascript
function consumeAndShowExitNotice() {
  const notice = uni.getStorageSync('SESSION_EXIT_NOTICE')
  if (!notice) return

  uni.removeStorageSync('SESSION_EXIT_NOTICE')
  uni.showModal({
    title: notice.reason === 'force-offline' ? '账号已下线' : '登录失效',
    content: notice.message || '请重新登录',
    showCancel: false
  })
}
```

提示消费要与会话清理解耦，否则跳转过程中容易丢提示或重复弹窗。

## 9. 错误判断表

| 现象 | 更可能的原因 | 先查什么 |
| --- | --- | --- |
| token 不在，且统一退出执行 | 真实会话失效 | 请求响应、退出日志、后端鉴权 |
| token 在，用户 ID 在，落到登录页 | 路由恢复/登录页自恢复缺失 | H5 hash、页面生命周期 |
| 用户资料只剩租户字段 | 登录页覆盖写缓存 | 所有 `setStorageSync` 写入 |
| 一回登录页就请求验证码 | 登录页未区分已登录回访 | `onMounted/onShow` 条件 |
| 登录后浏览器返回又见登录页 | 未替换 H5 history | 登录成功导航 |
| H5 正常，小程序不复现 | 平台路径不同 | 不要用小程序结果否定 H5 问题 |

## 10. AI 排查步骤

1. 搜索统一退出函数和所有清理 token 的位置。
2. 搜索登录页的 `onLoad/onBeforeMount/onMounted/onShow`。
3. 检查会话谓词，而不是只搜 token。
4. 检查登录页是否在初始化时覆盖用户对象。
5. 检查验证码、学校配置等未登录接口是否被重复调用。
6. 检查 H5 hash 在刷新前、应用启动后和登录页显示时的变化。
7. 检查登录成功是否使用 `replace`，并确认其他端跳转不被改变。
8. 如果需要深路由，增加允许列表和一次性消费逻辑。

## 11. 验证清单

- [ ] 已登录用户直接访问登录入口会自动回首页。
- [ ] 已登录用户刷新 H5 深页面不会停在登录页。
- [ ] 已登录误回登录页不会请求验证码。
- [ ] 补租户/组织字段不会覆盖完整用户资料。
- [ ] 真正 token 失效仍能统一清理并显示原因。
- [ ] 并发多个请求失效只跳转一次。
- [ ] 登录成功后浏览器返回不会回到登录页。
- [ ] 小程序和 App 登录后原有页面栈行为不变。
- [ ] 深路由恢复只允许站内页面，不接受外部或危险 URL。
- [ ] 日志不泄露 token、授权码和隐私查询参数。
