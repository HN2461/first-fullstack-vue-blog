---
title: "PC端钉钉登录四链路实现指南"
slug: "pc-pc-738e0cc4"
summary: ""
category: "钉钉"
tags: []
status: "draft"
sortOrder: 100
cover: ""
originalId: "6a2d29208a2b1c68f2cac78a"
originalSlug: "pc-pc-738e0cc4"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# PC 端钉钉登录四链路实现指南

> 本文从实际项目代码中提炼，记录 PC 端钉钉登录完整的四条链路实现模式。
> 脱离具体项目，可直接作为下次开发的参考模板。

---

## 一、整体架构：四条链路

PC 端钉钉登录不是单点实现，而是四条链路的组合：

| 链路 | 触发场景 | 核心文件 |
| --- | --- | --- |
| 链路一：PC 扫码 / 自动登录 | 普通浏览器打开登录页 | 登录页 + 扫码组件 + OAuth 回调页 |
| 链路二：钉钉客户端内 H5 免登 | 在钉钉 PC 客户端内打开应用 | ddLogin 免登页 |
| 链路三：账号绑定 / 解绑 | 已登录用户在用户中心绑定钉钉 | 绑定组件 + 绑定回调页 |
| 链路四：退出登录 / 强制下线回流 | 退出时判断环境，钉钉环境回免登页 | userbar 退出逻辑 |

一句话记忆：

> 登录页发起授权，回调页吃 code，ddLogin 负责钉钉内免登，用户中心负责绑定，退出时钉钉环境回免登页。

---

## 二、链路一：PC 扫码 / 自动登录

### 2.1 登录入口：学校配置驱动显示

登录页在 `created` 阶段调用初始化接口，按当前域名获取租户配置：

```js
async getSchoolSet() {
  let domainUrl = window.location.origin
  // 本地开发环境特殊处理：用 API 域名替代 localhost
  const isLocalDomain = /^(https?:\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(domainUrl)
  if (isLocalDomain) {
    const apiBaseUrl = process.env.VUE_APP_API_BASEURL || ''
    if (/^https?:\/\//i.test(apiBaseUrl)) {
      domainUrl = new URL(apiBaseUrl).origin
    }
  }
  if (!domainUrl.endsWith('/')) domainUrl += '/'

  const { code, data } = await this.$API.login.getSchool.post({ domainUrl })
  if (code === 200) {
    // 把钉钉配置存到 loginConfig 和 localStorage
    this.loginConfig = {
      dingtalkLoginPc: data.dingtalkLoginPc || 0,  // 1=开启
      dingtalkClientID: data.dingtalkClientID || '',
      dingtalkCorpID: data.dingtalkCorpID || '',
      // ...其他字段
    }
    tool.data.set('LOGIN_SCHOOL_CONFIG', this.loginConfig)
    tool.cookie.set('APP_NAME', data.schoolName)
    tool.cookie.set('APP_Logo', data.schoolLogo)
    tool.cookie.set('schoolID', data.schoolID)
  }
}
```

钉钉登录按钮的显示条件（两个都要满足）：
```html
<div
  v-if="loginConfig.dingtalkLoginPc === 1 && loginConfig.dingtalkClientID"
  @click="openDingTalkLogin"
>
  钉钉登录
</div>
```

点击按钮时做二次校验再打开弹窗：
```js
openDingTalkLogin() {
  if (this.loginConfig.dingtalkLoginPc !== 1 || !this.loginConfig.dingtalkClientID) {
    this.$message.warning('当前租户未开启钉钉登录')
    return
  }
  this.showDingTalkLogin = true
}
```

弹窗配置（`destroy-on-close` 很重要，关闭后销毁组件重置状态）：
```html
<el-dialog
  v-model="showDingTalkLogin"
  title="钉钉登录"
  :width="720"
  top="6vh"
  destroy-on-close
>
  <DingTalkLogin :ding-talk-config="loginConfig" />
</el-dialog>
```

> 设计说明：扫码组件不自己发接口拿配置，而是依赖登录页预加载的租户配置（通过 prop 传入，fallback 到 localStorage）。登录页已经完成了按域名获取租户配置的工作，扫码组件只需要消费结果，不需要重复发请求。如果 prop 为空（比如直接访问弹窗），会自动从 `LOGIN_SCHOOL_CONFIG` 里读取兜底。

### 2.2 扫码组件：DingTalkLogin.vue

#### 组件职责

接收父组件传入的 `dingTalkConfig`，动态加载钉钉 SDK，渲染扫码二维码或自动登录 iframe，扫码成功后跳转到 OAuth 回调页。

#### 关键 data 字段

```js
data() {
  return {
    isLoading: true,          // SDK 加载 + 配置初始化期间
    loadingFailed: false,     // 任意初始化步骤失败
    errorText: '',
    useOfficialAuthMode: false, // false=扫码模式，true=自动登录模式
    officialFrameLoading: false,
    appId: '',                // 钉钉 Client ID
    corpId: '',               // 钉钉 CorpId，有值时 scope 追加 corpid
    redirectUri: '',          // 回调地址，固定为 window.location.origin + '/#/dingTalkLogin'
    authUrl: '',              // 自动登录模式用的完整授权 URL
    hasRedirected: false,     // 防止 success 回调多次触发重复跳转
    scanStage: { type: 'idle', text: '请使用手机钉钉扫码', detail: '' },
  }
}
```

#### 初始化流程

```js
async initDingTalkLogin() {
  // 1. 读取配置（优先用 prop，fallback 到 localStorage）
  const config = this.dingTalkConfig && Object.keys(this.dingTalkConfig).length > 0
    ? this.dingTalkConfig
    : tool.data.get('LOGIN_SCHOOL_CONFIG')

  if (!config) throw new Error('租户钉钉配置未加载')

  // 2. 校验开关
  if (config.dingtalkLoginPc !== 1 && config.dingtalkLoginPc !== true) {
    this.loadingFailed = true
    this.errorText = '钉钉PC端登录未启用'
    return
  }

  // 3. 取 appId 和 corpId
  this.appId = config.dingtalkClientID || config.appId || config.appKey
  this.corpId = config.dingtalkCorpID || config.corpId || ''
  if (!this.appId) throw new Error('钉钉AppId配置缺失')

  // 4. 固定回调地址
  this.redirectUri = window.location.origin + '/#/dingTalkLogin'

  // 5. 构建自动登录 URL（备用）
  this.authUrl = this.buildDingTalkAuthUrl(this.redirectUri)

  // 6. 进入扫码模式
  await this.switchToQrCodeMode()
}
```

#### scope 规则

```js
buildScopeConfig() {
  return this.corpId
    ? { scopeRaw: 'openid corpid', scopeEncoded: 'openid%20corpid' }
    : { scopeRaw: 'openid', scopeEncoded: 'openid' }
}
```

#### 构建授权 URL

```js
buildDingTalkAuthUrl(redirectUri) {
  const state = encodeURIComponent(`dingtalk_login_${Date.now()}`)
  const scope = this.buildScopeConfig()
  let url = `https://login.dingtalk.com/oauth2/auth`
    + `?redirect_uri=${encodeURIComponent(redirectUri)}`
    + `&response_type=code`
    + `&client_id=${encodeURIComponent(this.appId)}`
    + `&scope=${scope.scopeEncoded}`
    + `&state=${state}`
    + `&prompt=consent`
  if (this.corpId) url += `&corpId=${encodeURIComponent(this.corpId)}`
  return url
}
```

#### SDK 加载（单例，避免重复插入 script）

```js
loadDingTalkSDK() {
  if (window.DTFrameLogin) return Promise.resolve()
  if (this.sdkLoadingPromise) return this.sdkLoadingPromise

  this.sdkLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      this.loadingFailed = true
      this.errorText = 'SDK加载失败'
      this.sdkLoadingPromise = null
      reject(new Error('钉钉SDK加载失败'))
    }
    document.head.appendChild(script)
  })
  return this.sdkLoadingPromise
}
```

#### 切换到扫码模式（关键时序）

```js
async switchToQrCodeMode() {
  this.useOfficialAuthMode = false
  this.isLoading = true

  await this.loadDingTalkSDK()

  this.isLoading = false
  // 必须先关 loading，等 DOM 渲染完，再调 SDK
  // 否则容器还在 v-if 里，SDK 报 Element not found
  await this.$nextTick()
  await this.waitForContainerReady()
  this.renderQrCode()
}

// 等待容器可见并有尺寸
waitForContainerReady(maxWaitMs = 2000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const check = () => {
      const el = document.getElementById('dingtalk_login_container')
      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) { resolve(); return }
      if (Date.now() - startTime >= maxWaitMs) { reject(new Error('二维码容器初始化失败')); return }
      window.requestAnimationFrame(check)
    }
    check()
  })
}
```

#### 渲染二维码

```js
renderQrCode() {
  const container = document.getElementById('dingtalk_login_container')
  container.innerHTML = '' // 清空，防止重复渲染

  const scope = this.buildScopeConfig()
  const loginParams = {
    redirect_uri: encodeURIComponent(this.redirectUri),
    redirectUri: encodeURIComponent(this.redirectUri), // 兼容不同版本 SDK
    response_type: 'code',
    responseType: 'code',
    client_id: this.appId,
    clientId: this.appId,
    scope: scope.scopeRaw,
    state: `dingtalk_login_${Date.now()}`,
    prompt: 'consent',
  }
  if (this.corpId) loginParams.corpId = this.corpId

  window.DTFrameLogin(
    { id: 'dingtalk_login_container', width: 300, height: 300 },
    loginParams,
    // success 回调
    (result) => {
      if (this.hasRedirected) return  // 防重
      this.hasRedirected = true
      this.scanStage = { type: 'success', text: '扫码成功，正在跳转...' }

      // 优先用本地拼的回调地址，保证 hash 路由正确
      const authCode = result && (result.authCode || result.code)
      let callbackUrl = ''
      if (authCode) {
        callbackUrl = `${window.location.origin}/#/dingTalkLogin?authCode=${encodeURIComponent(authCode)}`
        if (result.state) callbackUrl += `&state=${encodeURIComponent(result.state)}`
      }
      window.location.href = callbackUrl || (result && result.redirectUrl) || this.redirectUri
    },
    // error 回调
    (errorMsg) => {
      const message = typeof errorMsg === 'string' ? errorMsg.trim() : ''
      const hasFrame = this.isQrCodeFrameRendered()

      // 空消息且二维码已渲染：SDK 初始化时的非致命回调，忽略
      if (!message || message === 'undefined') {
        if (hasFrame) return
        // 延迟检查，给 SDK 时间渲染
        setTimeout(() => {
          if (this.isQrCodeFrameRendered()) return
          this.loadingFailed = true
          this.errorText = '钉钉扫码初始化失败'
        }, 1500)
        return
      }

      // 二维码已渲染时的非致命错误，忽略
      if (hasFrame) return

      this.loadingFailed = true
      this.errorText = message
    }
  )
}

isQrCodeFrameRendered() {
  const container = document.getElementById('dingtalk_login_container')
  if (!container) return false
  const iframe = container.querySelector('iframe')
  return !!(iframe && iframe.src && iframe.src.includes('login.dingtalk.com'))
}
```

#### 自动登录模式（注意安全风险）

```js
switchToOfficialMode() {
  if (!this.authUrl) return

  // 本地/局域网环境 iframe 跨域受限，改为新窗口打开
  if (this.isLocalNetworkOrigin()) {
    window.open(this.authUrl, '_blank', 'noopener=yes,noreferrer=yes')
    return
  }

  this.useOfficialAuthMode = true
  this.officialFrameLoading = true
}

isLocalNetworkOrigin() {
  const { hostname } = window.location
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  )
}
```

> 安全提示：自动登录依赖浏览器钉钉 cookie，共享电脑存在账号串用风险，详见文档一第十八节。

#### 组件清理

```js
beforeUnmount() {
  const container = document.getElementById('dingtalk_login_container')
  if (container) container.innerHTML = ''
  if (this.qrCodeFailureTimer) clearTimeout(this.qrCodeFailureTimer)
  this.sdkLoadingPromise = null
}
```

### 2.3 OAuth 回调页：dingTalkLogin

#### 职责

这个页面是整个登录链路的落盘点，不只是展示成功页，而是承担了：
- 解析 authCode
- 调后端登录接口
- 写入 TOKEN、USER_INFO、schoolID
- 获取菜单权限
- 跳转首页
- 完整的错误分支处理

#### authCode 解析（兼容三种来源）

Hash 路由下，钉钉回调参数可能出现在三个地方：

```js
resolveAuthCodeAndState() {
  // 1. Vue Router 解析的 query（最常见）
  const routeCode = this.$route.query.code || this.$route.query.authCode || ''
  if (routeCode) return { code: routeCode, state: this.$route.query.state || '' }

  // 2. window.location.search（部分场景）
  const searchCode = new URLSearchParams(window.location.search).get('code')
    || new URLSearchParams(window.location.search).get('authCode')
  if (searchCode) return { code: searchCode, state: new URLSearchParams(window.location.search).get('state') || '' }

  // 3. window.location.hash（hash 路由下参数在 # 后面）
  const hash = window.location.hash || ''
  const hashQuery = hash.includes('?') ? hash.substring(hash.indexOf('?') + 1) : ''
  const hashCode = new URLSearchParams(hashQuery).get('code')
    || new URLSearchParams(hashQuery).get('authCode')
  if (hashCode) return { code: hashCode, state: new URLSearchParams(hashQuery).get('state') || '' }

  return { code: '', state: '' }
}
```

#### 完整登录流程

```js
async dingTalkLogin() {
  // 1. 解析 authCode
  const { code } = this.resolveAuthCodeAndState()
  if (!code) {
    this.showPageError('未获取到授权码', '请检查钉钉回调地址配置后重试。', 2)
    return
  }

  // 2. 获取租户 ID（从 cookie）
  const schoolID = this.$TOOL.cookie.get('schoolID')
  if (!schoolID) {
    this.showPageError('学校信息缺失', '未获取到学校信息，请重新进入登录页。', 2)
    return
  }

  // 3. 调后端登录接口
  const res = await this.$API.login.dingTalkOAuthLogin.post({
    code,
    schoolID,
    clientType: 'PC'
  })

  if (res.code !== 200) {
    // 未绑定账号的专属提示
    if (res.code === 201 && (res.msg || '').includes('未绑定')) {
      this.showPageError('该钉钉账号未绑定系统账号', '请先绑定系统账号后再使用钉钉登录。', 3)
    } else {
      this.showPageError('登录失败', res.msg || '系统未完成登录，请返回后重试。', 2)
    }
    return
  }

  // 4. 提取 token 和用户数据（兼容两种响应结构）
  const token = res.data.TOKEN || res.TOKEN
  const userData = res.data.data || res.data
  if (!token || !userData) {
    this.showPageError('登录失败', '登录响应数据不完整，请返回登录页重试。', 2)
    return
  }

  // 5. 写入登录态
  this.$TOOL.cookie.set('TOKEN', token)
  this.$TOOL.data.set('USER_INFO', userData)
  this.$TOOL.cookie.set('schoolID', userData.schoolID)
  this.$TOOL.cookie.set('schoolid', userData.schoolID)

  // 6. 获取菜单
  const menuRes = await this.$API.menu.loginMenu.get({ accountID: userData.accountid })
  if (menuRes.code !== 200) {
    this.showPageError('获取菜单失败', menuRes.message || '请返回登录页重新登录。', 2)
    return
  }
  if (!menuRes.data.menu || menuRes.data.menu.length === 0) {
    this.showPageError('当前账号无菜单权限', '请联系系统管理员为该账号分配菜单权限。', 2)
    return
  }

  this.$TOOL.data.set('MENU', menuRes.data.menu)
  this.$TOOL.data.set('PERMISSIONS', menuRes.data.permissions)
  this.$TOOL.data.set('DASHBOARDGRID', menuRes.data.dashboardGrid)

  // 7. 跳转首页
  setTimeout(() => {
    window.location.href = `/#${config.DASHBOARD_URL}`
  }, 500)
}
```

#### 错误状态页（带倒计时回退）

```js
showPageError(title, description, seconds = 2) {
  this.pageStatus = 'error'
  this.pageTitle = title
  this.pageDescription = description
  this.scheduleBackToLogin(seconds)
}

scheduleBackToLogin(seconds = 2) {
  this.countdown = seconds
  this.backTimer = setInterval(() => {
    this.countdown -= 1
    if (this.countdown <= 0) {
      clearInterval(this.backTimer)
      this.$router.replace({ path: '/login' })
    }
  }, 1000)
}
```

#### 防 iframe 嵌套

```js
mounted() {
  // 防止被嵌入 iframe（钉钉 SDK 内部可能触发）
  if (window.top !== window.self) {
    window.top.location.href = window.location.href
    return
  }
  this.dingTalkLogin()
}
```

---

## 三、链路二：钉钉客户端内 H5 免登

### 3.1 适用场景

用户在钉钉 PC 客户端内打开应用，不需要扫码，直接调用 `dd.runtime.permission.requestAuthCode` 获取免登授权码。

### 3.2 入口地址

钉钉工作台配置的应用首页地址建议带上 corpId：
```
https://your-domain.com/#/ddLogin?corpId=$CORPID$
```

`$CORPID$` 是钉钉工作台的变量占位符，会自动替换为当前企业的 corpId。

### 3.3 学校信息获取（多级兜底）

```js
async loadSchoolConfig() {
  // 第一步：按域名获取租户配置
  try {
    const res = await this.$API.login.getSchool.post({ domainUrl: this.buildDomainUrl() })
    if (res.code === 200 && res.data) {
      this.applySchoolConfig(res.data)
      if (this.schoolID) return  // 拿到了就结束
    }
  } catch (e) { /* 继续兜底 */ }

  // 第二步：如果已有 schoolID（从路由参数或 cookie），用 schoolID 补充
  if (!this.schoolID) throw new Error('无法获取学校信息，请联系管理员配置')

  try {
    const res = await this.$API.login.getSchoolInfo.post({ schoolID: this.schoolID })
    if (res.code === 200 && res.data) this.applySchoolConfig(res.data)
  } catch (e) { /* 忽略 */ }
}

buildDomainUrl() {
  let domainUrl = window.location.origin
  const isLocalDomain = /^(https?:\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(domainUrl)
  if (isLocalDomain) {
    const apiBaseUrl = process.env.VUE_APP_API_BASEURL || ''
    if (/^https?:\/\//i.test(apiBaseUrl)) domainUrl = new URL(apiBaseUrl).origin
  }
  if (!domainUrl.endsWith('/')) domainUrl += '/'
  return domainUrl
}

applySchoolConfig(schoolData = {}) {
  this.schoolName = schoolData.schoolName || this.schoolName
  this.schoolLogo = schoolData.schoolLogo || this.schoolLogo
  this.schoolID = schoolData.schoolID || this.schoolID
  // corpId 优先用路由参数，没有才用学校配置里的
  if (!this.corpId && schoolData.dingtalkCorpID) this.corpId = schoolData.dingtalkCorpID

  // 写入 localStorage 和 cookie，供其他页面使用
  tool.data.set('LOGIN_SCHOOL_CONFIG', { dingtalkCorpID: schoolData.dingtalkCorpID, ... })
  if (this.schoolID) {
    tool.cookie.set('schoolID', this.schoolID)
    tool.cookie.set('schoolid', this.schoolID)
  }
}
```

### 3.4 完整免登流程

```js
async performDingTalkLogin() {
  // 1. 等待钉钉 JSAPI 加载
  const dd = await this.waitForDingTalkJsApi()

  // 2. 等待钉钉 ready
  await this.waitDingTalkReady(dd)

  // 3. 获取免登授权码
  const authCode = await this.requestAuthCode(dd)

  // 4. 调后端登录接口
  const loginRes = await this.$API.login.dingTalkH5Login.post({
    authCode,
    schoolID: this.schoolID
  })

  // 5. 处理登录结果（和 PC 回调页逻辑相同）
  await this.handleLoginResult(loginRes)
}

waitForDingTalkJsApi() {
  return new Promise((resolve, reject) => {
    if (window.dd?.runtime?.permission) { resolve(window.dd); return }
    let count = 0
    const timer = setInterval(() => {
      count++
      if (window.dd?.runtime?.permission) { clearInterval(timer); resolve(window.dd); return }
      if (count >= 50) { clearInterval(timer); reject(new Error('钉钉组件加载超时')) }
    }, 100)
  })
}

waitDingTalkReady(dd) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('钉钉环境初始化超时')), 5000)
    dd.ready(() => { clearTimeout(timeout); resolve() })
    dd.error((err) => { clearTimeout(timeout); reject(new Error(err.message || '钉钉初始化失败')) })
  })
}

requestAuthCode(dd) {
  return new Promise((resolve, reject) => {
    dd.runtime.permission.requestAuthCode({
      corpId: this.corpId,
      onSuccess: (res) => resolve(res.code || res.authCode || ''),
      onFail: (err) => reject(new Error(err?.errorMessage || err?.message || '获取授权码失败'))
    })
  })
}
```

### 3.5 页面三态 UI

```
loading → 转圈动画 + 动态状态文字（"正在获取学校信息..." / "正在获取授权..." / "正在登录..."）
success → 绿色图标 + "登录成功"，500ms 后跳转首页
error   → 红色图标 + 错误信息 + "重试"按钮
```

重试按钮重新走完整初始化流程：
```js
retryLogin() {
  this.loginStatus = 'loading'
  this.errorMessage = ''
  this.initDingTalkLogin()
}
```

---

## 四、链路三：账号绑定 / 解绑

### 4.1 与登录的核心区别

| 对比项 | 登录 | 绑定 |
| --- | --- | --- |
| 触发时机 | 未登录，在登录页扫码 | 已登录，在用户中心主动绑定 |
| 成功后动作 | 写入 TOKEN，跳转首页 | 调绑定接口，通知父组件关闭弹窗 |
| 页面形态 | 独立页面 | el-dialog 内嵌组件 |
| code 处理 | 跳转回调页 | DTFrameLogin success 回调原地处理 |

### 4.2 原地处理原理

钉钉官方文档明确说明两种方式均可：

> "这里可以直接进行重定向，**也可以在不跳转页面的情况下，使用 code 进行授权**"

`redirect_uri` 对 `DTFrameLogin` 而言只是钉钉后台的**域名白名单校验参数**，SDK 内部拦截了跳转行为，通过 success 回调直接把 `authCode` 返回给页面，不会真正触发浏览器跳转。

### 4.3 绑定组件关键实现

```js
// 初始化：isLoading = false → $nextTick → 调 SDK（时序必须正确）
async initDingTalkBind() {
  const config = await this.getDingTalkConfig()
  this.appId = config.dingtalkClientID
  this.corpId = config.dingtalkCorpID || ''
  this.redirectUri = window.location.origin + '/#/dingTalkBind'  // 仅用于域名白名单校验

  this.isLoading = false
  await this.$nextTick()  // 等容器渲染到 DOM
  this.showDingTalkQRCode()
}

// success 回调：isBinding 防重标志位
window.DTFrameLogin(
  { id: 'dingtalk_bind_container', width: 300, height: 300 },
  loginParams,
  (result) => {
    if (this.isBinding) return  // 防止 success 回调多次触发
    this.isBinding = true
    const authCode = result.authCode || result.code || ''
    if (!authCode) { this.isBinding = false; return }
    this.handleBindCode(authCode)
  },
  (errorMsg) => { /* 同扫码组件的 error 处理逻辑 */ }
)

// 原地调绑定接口
async handleBindCode(code) {
  const res = await this.$API.login.bindDingTalk.post({ code })
  if (res.code !== 200) { ElMessage.error(res.msg || '绑定失败'); return }

  // 更新本地缓存
  const userInfo = this.$TOOL.data.get('USER_INFO')
  if (userInfo) { userInfo.dingTalkOpenID = 'bound'; this.$TOOL.data.set('USER_INFO', userInfo) }

  ElMessage.success('钉钉账号绑定成功')
  this.$emit('bindSuccess')  // 通知父组件关闭弹窗
}
```

> 安全设计：绑定成功后只把本地缓存里的 `dingTalkOpenID` 标记为 `'bound'`，不把钉钉原始身份字段（`unionId`、`openId` 等）暴露给前端页面层。前端只需要知道“已绑定/未绑定”这个状态，具体的钉钉身份信息由后端持久化管理。

### 4.4 父组件协作（account.vue）

```js
// 打开绑定弹窗
openDingTalkBindDialog() {
  this.dialog.dingTalkBind = true
}

// 绑定成功回调
handleDingTalkBindSuccess() {
  this.dialog.dingTalkBind = false   // 关闭弹窗
  this.isDingTalkLoginResult = true  // 乐观更新 UI
  this.getAccountInfo()              // 重拉服务端数据兜底
}
```

弹窗必须加 `destroy-on-close`，关闭后销毁子组件，重置 `isBinding`、`isLoading` 等状态：
```html
<el-dialog
  v-model="dialog.dingTalkBind"
  :width="800"
  destroy-on-close
>
  <DingTalkBindLogin @bindSuccess="handleDingTalkBindSuccess" />
</el-dialog>
```

### 4.5 解绑

```js
async DingTalkDel() {
  await this.$confirm('是否解绑钉钉', '提示', { type: 'warning' })
  const res = await this.$API.login.unbindDingTalk.post()
  if (res.code === 200) {
    // 同步清空本地缓存，避免刷新前状态不一致
    const userInfo = this.$TOOL.data.get('USER_INFO')
    if (userInfo) { userInfo.dingTalkOpenID = ''; this.$TOOL.data.set('USER_INFO', userInfo) }
    this.isDingTalkLoginResult = false
    this.$message.success('解绑成功')
  }
}
```

### 4.6 扫码业务错误感知

钉钉扫码后的业务错误（如"不在组织内"）不走 `onLoginFail`，而是通过 iframe 的 `postMessage` 传出：

```js
// 在 mounted 里监听
window.addEventListener('message', (event) => {
  if (event.data?.success === false && event.data?.errorMsg) {
    const msg = event.data.errorCode
      ? `${event.data.errorMsg}（错误码：${event.data.errorCode}）`
      : event.data.errorMsg
    ElMessage.error(msg)
  }
})

// 在 beforeUnmount 里移除
window.removeEventListener('message', this.handleBindMessage)
```

---

## 五、链路四：退出登录 / 强制下线回流

### 5.1 核心逻辑

退出时先判断当前环境，钉钉客户端内退出要回到免登页，普通浏览器回到普通登录页：

```js
// 判断是否在钉钉客户端
isInDingTalkClient() {
  return /DingTalk/i.test(navigator.userAgent || '')
}

// 计算退出后的目标页
getLogoutTargetRoute() {
  if (!this.isInDingTalkClient()) {
    return { path: '/login' }
  }

  const loginConfig = this.$TOOL.data.get('LOGIN_SCHOOL_CONFIG') || {}
  const schoolID = this.$TOOL.cookie.get('schoolID') || this.$TOOL.cookie.get('schoolid') || ''
  const query = {}
  if (loginConfig.dingtalkCorpID) query.corpId = loginConfig.dingtalkCorpID
  if (schoolID) query.schoolID = schoolID

  return { path: '/ddLogin', query }
}
```

### 5.2 关键顺序：先算目标页，再清缓存

```js
handleUser(command) {
  if (command === 'outLogin') {
    this.$confirm('确认是否退出当前用户？', '提示', { type: 'info' })
      .then(() => {
        // 1. 先算目标页（此时缓存还在，能拿到 corpId 和 schoolID）
        const logoutTargetRoute = this.getLogoutTargetRoute()

        // 2. 再清缓存
        this.performLogout('manual')

        // 3. 跳转
        setTimeout(() => {
          const resolvedRoute = this.$router.resolve(logoutTargetRoute)
          window.location.replace(resolvedRoute.href)
        }, 1000)
      })
  }
}

performLogout(reason = 'manual') {
  if (this.HNWS) this.HNWS.disconnect()  // 断开 WebSocket
  this.$TOOL.data.clear()
  this.$TOOL.session.clear()
  this.$TOOL.cookie.remove('TOKEN')
  // 清理消息状态...
}
```

### 5.3 强制下线复用同一套逻辑

```js
handleForceOfflineMessage(message) {
  if (this.forceOfflineHandled) return
  this.forceOfflineHandled = true

  // 先算目标页
  const logoutTargetRoute = this.getLogoutTargetRoute()
  // 再清缓存
  this.performLogout('force_offline')

  // 弹提示，确认后跳转
  this.$alert(alertContent, '提示', { ... })
    .then(() => {
      setTimeout(() => {
        const resolvedRoute = this.$router.resolve(logoutTargetRoute)
        window.location.replace(resolvedRoute.href)
      }, 200)
    })
}
```

---

## 六、路由注册

需要在系统路由（不需要登录态的路由）里注册这三个页面：

```js
// systemRouter.js
[
  { path: '/dingTalkLogin', component: () => import('@/views/dingTalkLogin/index.vue') },
  { path: '/ddLogin',       component: () => import('@/views/ddLogin/index.vue') },
  { path: '/dingTalkBind',  component: () => import('@/views/dingTalkBind/index.vue') },
]
```

---

## 七、后端接口清单

| 接口 | 方法 | 用途 |
| --- | --- | --- |
| `/school/listRole` | POST | 按域名获取租户配置（含钉钉登录参数） |
| `/school/information` | POST | 按 schoolID 获取租户配置（兜底） |
| `/login/dingtalk` | POST | PC 扫码登录，传 code + schoolID + clientType |
| `/login/dingtalk/h5` | POST | 钉钉客户端内免登，传 authCode + schoolID |
| `/login/dingtalk/bind` | POST | 绑定钉钉账号，传 code |
| `/login/dingtalk/unbind` | POST | 解绑钉钉账号 |
| `/menu/loginMenu` | GET | 登录成功后获取菜单权限，传 accountID |

---

## 八、常见坑位汇总

### ① success 回调触发多次 → "不合法的临时授权码"

原因：`DTFrameLogin` SDK 已知行为，success 回调在某些情况下会多次触发，authCode 是一次性的。

解决：`isBinding` / `hasRedirected` 标志位，第一次进入后立即锁住。

### ② Element not found（二次打开弹窗报错）

原因：容器在 `v-if` / `v-else` 里，`isLoading=true` 时不在 DOM 里，SDK 调用时机早于渲染。

解决：`isLoading = false` → `await $nextTick()` → 再调 SDK。

### ③ DTFrameLogin 返回空错误但二维码已渲染

原因：SDK 初始化时会触发一次空的 error 回调，非致命。

解决：error 回调里检查容器内是否已有 `iframe`，有则忽略。

### ④ 扫码业务错误无提示（如"不在组织内"）

原因：此类错误由 iframe 内部处理，通过 `postMessage` 传出，`onLoginFail` 不触发。

解决：监听 `window.message` 事件，过滤 `{success: false, errorMsg}` 结构。

### ⑤ Hash 路由下 authCode 解析失败

原因：Hash 路由下，钉钉回调参数在 `#` 后面，`window.location.search` 拿不到。

解决：同时从 `route.query`、`window.location.search`、`window.location.hash` 三处解析，取第一个有值的。

### ⑥ 退出后回到普通登录页而不是 ddLogin

原因：退出时 `LOGIN_SCHOOL_CONFIG` 或 `schoolID` cookie 已被清空，`getLogoutTargetRoute` 拿不到 corpId。

解决：严格保证"先算目标页，再清缓存"的顺序。

### ⑦ 本地开发环境域名是 localhost，按域名获取租户配置失败

原因：后端按域名匹配租户，localhost 匹配不到。

解决：检测到本地域名时，用 `VUE_APP_API_BASEURL` 的域名替代 `window.location.origin`。

---

## 九、接入优先级建议

第一次在新项目里接入钉钉 PC 登录，建议按这个顺序推进，完成度从高到低：

**阶段 1：先把 PC 扫码登录跑通**（完成度最高，优先验证）

验收清单：
- 后台已填 `clientId`、`corpId`，并开启 PC 端登录开关
- 登录页能显示钉钉按钮
- 弹窗中的二维码能正常渲染
- 扫码后能回到回调页（`/#/dingTalkLogin`）
- 回调页能成功写入 TOKEN、USER_INFO、MENU 并跳首页

**阶段 2：再把账号绑定跑通**

验收清单：
- 用户中心能打开钉钉绑定弹窗
- 绑定二维码能正常显示
- 扫码后原地完成绑定（不跳转页面）
- 绑定成功后 `dingTalkOpenID` 有回显
- 解绑接口可用

**阶段 3：核验钉钉客户端内 H5 免登**

在真正推进前，先确认两件事：
- 钉钉工作台入口是否稳定透传 `corpId`（`$` 占位符是否生效）
- 后端 `/login/dingtalk/h5` 返回的数据结构是否完整

**阶段 4：补做退出回流验证**

验收清单：
- 在钉钉客户端里退出登录后，是否回到 `/#/ddLogin`
- 回流地址里是否仍然带了 `corpId`、`schoolID`
- 强制下线场景下是否也会回到 `ddLogin`
- 普通浏览器环境退出时是否仍然回到普通登录页

---

## 十、四个关键路由地址

| 路由 | 地址 | 说明 |
| --- | --- | --- |
| 登录页 | `https://域名/#/login` | 登录页会自动按域名取租户配置，钉钉按钮挂在这里 |
| PC 扫码回调页 | `https://域名/#/dingTalkLogin` | 钉钉开放平台配置的 redirect_uri 必须指向这里 |
| 钉钉客户端免登入口 | `https://域名/#/ddLogin?corpId=$` | 钉钉工作台配置的应用首页地址 |
| 绑定回调页 | `https://域名/#/dingTalkBind` | 仅用于域名白名单校验，当前绑定流程不实际跳转到此页 |

---

## 十一、后台配置字段清单

接入时需要在租户配置表里维护以下字段：

**前端直接使用的核心字段（必须有值）：**
- `dingtalkLoginPc`：PC 端登录开关，值为 `1` 时显示钉钉登录按钮
- `dingtalkClientID`：钉钉应用的 Client ID，前端拼授权地址要用
- `dingtalkCorpID`：租户的钉钉组织 ID，有值时 scope 追加 `corpid`，退出回流时也要用

**后端使用、前端存储的字段：**
- `dingtalkClientSecret`：后端换 token 要用，前端不直接使用
- `dingtalkAgentID`：工作台应用管理场景要用，PC 扫码登录不需要

**其他端的开关（按需开启）：**
- `dingtalkLoginApp`：App 端开关
- `dingtalkLoginMini`：小程序端开关

---

## 十二、退出回流排障步骤

如果发现"退出后回到了普通登录页而不是 ddLogin"，按这个顺序排查：

1. 当前会话里是否成功缓存了 `LOGIN_SCHOOL_CONFIG`
   - 检查：`localStorage.getItem('LOGIN_SCHOOL_CONFIG')`
2. `LOGIN_SCHOOL_CONFIG` 里是否有 `dingtalkCorpID`
   - 如果为空，说明学校配置里没有填 corpId，或者初始化接口没有返回
3. 当前会话里是否存在 `schoolID` cookie
   - 检查：`document.cookie` 里是否有 `schoolID`

三个条件都满足，`getLogoutTargetRoute()` 才会返回 `ddLogin` 路由。任何一个缺失都会 fallback 到普通登录页。

---
## 十三、下次项目开发速查

**需要准备的后台配置：**
- 钉钉开放平台创建第三方企业应用，获取 Client ID
- 安全设置里配置回调域名（redirect_uri 的域名）
- 申请 `Contact.User.mobile` 和 `Contact.User.Read` 权限

**需要准备的前端配置：**
- 租户配置表里存 `dingtalkLoginPc`、`dingtalkClientID`、`dingtalkCorpID`
- 路由里注册 `/dingTalkLogin`、`/ddLogin`、`/dingTalkBind`

**最小实现步骤（PC 扫码登录）：**
1. 登录页按域名拉租户配置，`dingtalkLoginPc === 1 && dingtalkClientID` 时显示钉钉按钮
2. 点击按钮打开弹窗，弹窗内挂载扫码组件（`destroy-on-close`）
3. 扫码组件：动态加载 SDK → `isLoading=false` → `$nextTick` → 调 `DTFrameLogin`
4. success 回调：`hasRedirected` 防重 → 拼回调地址 → `window.location.href` 跳转
5. 回调页：解析 authCode → 调后端登录接口 → 写 TOKEN/USER_INFO/MENU → 跳首页
