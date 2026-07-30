---
title: "钉钉账号绑定实现方案_PC端扫码绑定"
slug: "pc-pc-44f7ba8c"
summary: ""
category: "钉钉"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "钉钉"
tags: []
status: "published"
sortOrder: 90
cover: ""
originalId: "6a2d29208a2b1c68f2cac78c"
originalSlug: "pc-pc-44f7ba8c"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.438Z"
updatedAt: "2026-06-13T14:03:18.889Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 钉钉账号绑定实现方案：PC 端扫码绑定

> 场景：已登录系统的用户，在用户中心将当前账号与钉钉关联，后续可直接使用钉钉扫码登录。
>
> 本文记录了从"页面跳转方案"到"原地处理方案"的完整演进过程，包含核心原理、完整实现代码、UI 结构、父子组件协作、踩坑记录，可作为下次项目开发的直接参考模板。

---

## 0. 快速掌握（先读这里）

**做什么**：在已登录的用户中心页面，弹出一个对话框，内嵌钉钉扫码二维码，用户扫码后完成账号绑定，全程不离开当前页面。

**核心原理**：钉钉 `DTFrameLogin` SDK 会在容器 div 里渲染一个 iframe 二维码。用户扫码后，SDK 通过 **success 回调**把 `authCode` 直接交给你，你拿着这个 code 调后端绑定接口即可。`redirect_uri` 参数只是钉钉后台的域名白名单校验，**SDK 不会真的跳转页面**。

**最容易踩的坑**：
1. `DTFrameLogin` success 回调会触发多次，必须加 `isBinding` 标志位防重，否则 authCode 被消费后再次调用报"不合法的临时授权码"
2. 二维码容器在 `v-else` 里，必须先把 `isLoading` 关掉、等 `$nextTick` 后再调 SDK，否则找不到容器
3. 不要用 `window.location.href` 跳转，那是旧方案，会导致当前页面丢失
4. error 回调的参数可能是字符串也可能是对象 `{errorCode, errorMsg}`，需要兼容两种格式

**接口**：`bindDingTalk.post({ code })`，成功后 `$emit('bindSuccess')` 通知父组件关闭弹窗。

---

## 1. 与登录的区别

| 对比项 | 登录 | 绑定 |
| --- | --- | --- |
| 触发时机 | 未登录，在登录页扫码 | 已登录，在用户中心主动绑定 |
| 成功后动作 | 写入 TOKEN、跳转首页 | 调绑定接口、通知父组件关闭弹窗 |
| 页面形态 | 独立页面 | `el-dialog` 内嵌组件 |
| code 处理 | 跳转回调页 `/#/dingTalkLogin` | `DTFrameLogin` success 回调原地处理 |
| 鉴权方式 | code 换 token | 已有登录态，code 直接换绑定关系 |
| 用户感知 | 页面跳转 | 弹窗内完成，无跳转感 |
| 配置来源 | 登录页预加载的学校配置（prop 传入） | 组件自己调接口拉取学校配置 |

---

## 2. 方案演进：从跳转到原地处理

### 2.1 旧方案：页面跳转（已废弃，理解即可）

最初参考钉钉官方文档的"构造链接跳转"示例，在 success 回调里做页面跳转：

```
用户扫码
  → DTFrameLogin success 回调
  → window.location.href 跳转到 /#/dingTalkBind?authCode=xxx（当前窗口跳走）
  → dingTalkBind/index.vue 挂载，从 URL 取 authCode，调绑定接口
  → window.opener.postMessage 通知父窗口（但 opener 为 null，失败）
  → window.close() 关不掉，fallback 到强制跳转用户中心
```

**为什么废弃**：
- 当前窗口跳走，用户中心页面丢失，体验割裂
- `window.opener` 为 null（不是 `window.open` 弹窗打开），`postMessage` 失效，`bindSuccess` 发不出去
- `DTFrameLogin` success 回调多次触发，每次都跳转并调接口，authCode 一次性消费后后续报"不合法的临时授权码"

### 2.2 新方案：原地处理（当前实现）

钉钉官方文档明确说明两种方式均可：

> 参考：https://open.dingtalk.com/document/orgapp/tutorial-obtaining-user-personal-information
>
> "这里可以直接进行重定向 `window.location.href = redirectUrl`，**也可以在不跳转页面的情况下，使用 code 进行授权**"

`redirect_uri` 对 `DTFrameLogin` 而言只是钉钉后台的**域名白名单校验参数**，SDK 内部拦截了跳转行为，通过 success 回调直接把 `authCode` 返回给页面，不会真正触发浏览器跳转。企业微信的 `createWWLoginPanel` 也是完全相同的机制。

```
用户扫码
  → DTFrameLogin success 回调，直接拿到 authCode
  → isBinding 标志位防重
  → 原地调 bindDingTalk 接口
  → 成功：更新本地缓存，$emit('bindSuccess')
  → 父组件关闭弹窗，重拉账号信息
```

---

## 3. 完整流程（新方案）

```
用户点击"马上绑定"
  ↓
account.vue：dialog.dingTalkBind = true，打开 el-dialog
  ↓
DingTalkBindLogin 组件挂载
  ↓
created：读取 APP_NAME cookie
  └─ 若为空：启动重试机制（最多 5 次，间隔 500ms）
     └─ 重试成功：继续等待 mounted 里的 SDK 加载
     └─ 超时仍空：显示"配置加载失败"错误状态，不再加载 SDK
  ↓
mounted：动态插入 <script> 加载钉钉 SDK（CDN）
  └─ 若已加载（window.DTFrameLogin 存在）：直接调 initDingTalkBind
  └─ 加载成功（onload）：调 initDingTalkBind
  └─ 加载失败（onerror）：显示"SDK加载失败"错误状态
  ↓
initDingTalkBind：调 school.detailList.get() 拉取学校配置
  └─ dingtalkLoginPc !== 1：显示"钉钉PC端登录未启用"
  └─ dingtalkClientID 为空：抛出"钉钉AppId配置缺失"
  └─ 校验通过：赋值 appId、corpId、redirectUri
  ↓
isLoading = false → await $nextTick()（等容器渲染到 DOM）
  ↓
showDingTalkQRCode：清空容器，调 window.DTFrameLogin 渲染二维码
  ↓
用户用手机钉钉扫码
  ↓
DTFrameLogin success 回调
  └─ isBinding 已为 true：直接 return（防重）
  └─ isBinding = false：设为 true，取 authCode
  └─ authCode 为空：ElMessage.error，isBinding 重置为 false
  ↓
handleBindCode(authCode)：调 bindDingTalk.post({ code })
  └─ 失败：ElMessage.error(res.msg)
  └─ 成功：更新 USER_INFO 缓存，ElMessage.success，$emit('bindSuccess')
  ↓
account.vue handleDingTalkBindSuccess：
  → dialog.dingTalkBind = false（关闭弹窗）
  → isDingTalkLoginResult = true（乐观更新 UI）
  → getAccountInfo()（重拉服务端数据兜底）
  → $message.success('钉钉账号绑定成功')
```

---

## 4. 绑定组件完整实现（DingTalkBindLogin.vue）

### 4.1 组件三态状态机

```
isLoading=true       → 转圈动画 + loadingText（动态文字）
loadingFailed=true   → 错误图标 + errorText + "点击刷新页面"按钮
else（正常）         → 双栏布局：左侧二维码区（360px）+ 右侧引导说明
```

关键 data 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `isLoading` | Boolean | SDK 加载 + 配置拉取期间为 true |
| `loadingFailed` | Boolean | 任意初始化步骤失败时为 true |
| `loadingText` | String | loading 状态下的动态提示文字 |
| `errorText` | String | 失败状态下的错误描述 |
| `appId` | String | 钉钉 Client ID，来自 `dingtalkClientID` |
| `corpId` | String | 钉钉 CorpId，有值时 scope 追加 `corpid` |
| `redirectUri` | String | 仅用于域名白名单校验，不实际跳转 |
| `isBinding` | Boolean | 防止 success 回调多次触发，第一次进入后锁住 |

### 4.2 UI 模板结构

```html
<template>
  <div class="dt-bind-shell">
    <!-- 加载中 -->
    <div v-if="isLoading" class="dt-bind-state">
      <div class="loading-spinner"></div>
      <div class="state-text">{{ loadingText }}</div>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="loadingFailed" class="dt-bind-state dt-bind-state--error">
      <div class="error-icon">✕</div>
      <div class="state-text state-text--error">{{ errorText }}</div>
      <div class="error-subtitle">请检查钉钉开放平台配置，或联系管理员</div>
      <button type="button" class="retry-btn" @click="reloadPage">点击刷新页面</button>
    </div>

    <!-- 正常：双栏布局 -->
    <div v-else class="dt-bind-panel">
      <!-- 左侧：二维码容器 -->
      <div class="dt-bind-panel__main">
        <div id="dingtalk_bind_container" class="dt-bind-container"></div>
      </div>
      <!-- 右侧：引导说明 -->
      <div class="dt-bind-panel__aside">
        <img class="aside-icon" src="@/assets/images/dingtalk.svg" alt="钉钉" />
        <div class="aside-title">绑定钉钉</div>
        <div class="aside-desc">扫描左侧二维码，完成账号绑定。</div>
        <!-- 常见错误提示，减少用户困惑 -->
        <div class="aside-tip">若提示"不在组织内"，请联系管理员确认钉钉应用可见范围配置。</div>
        <div class="aside-steps">
          <div class="aside-step"><span class="aside-step__num">1</span><span>打开手机钉钉</span></div>
          <div class="aside-step"><span class="aside-step__num">2</span><span>点击右上角"扫一扫"</span></div>
          <div class="aside-step"><span class="aside-step__num">3</span><span>扫描左侧二维码确认绑定</span></div>
        </div>
        <!-- 二维码过期时手动刷新 -->
        <button type="button" class="refresh-btn" @click="refreshQRCode">二维码已过期？点击刷新</button>
      </div>
    </div>
  </div>
</template>
```

### 4.3 SDK 加载（复用单例，避免重复插入）

```js
loadDingTalkSDK() {
  // 已加载则直接复用，避免重复插入 script 标签
  if (window.DTFrameLogin) {
    this.initDingTalkBind()
    return
  }
  const script = document.createElement('script')
  script.src = 'https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js'
  script.onload = () => this.initDingTalkBind()
  script.onerror = () => {
    this.loadingFailed = true
    this.errorText = 'SDK加载失败'
    ElMessage.error('钉钉SDK加载失败，请刷新页面重试')
  }
  document.head.appendChild(script)
}
```

### 4.4 初始化：拉取配置 + 渲染二维码

```js
async initDingTalkBind() {
  try {
    // 1. 拉取学校配置（绑定组件自己发接口，不依赖登录页预加载）
    const res = await this.$API.school.detailList.get()
    if (res.code !== 200) throw new Error(res.msg || '获取配置失败')
    const config = res.data

    // 2. 校验开关
    if (config.dingtalkLoginPc !== 1 && config.dingtalkLoginPc !== true) {
      this.loadingFailed = true
      this.errorText = '钉钉PC端登录未启用'
      return
    }

    // 3. 取 appId 和 corpId
    this.appId = config.dingtalkClientID || config.appId
    this.corpId = config.dingtalkCorpID || config.corpId || ''
    if (!this.appId) throw new Error('钉钉AppId配置缺失')

    // 4. redirectUri 仅用于域名白名单校验，不实际跳转
    this.redirectUri = window.location.origin + '/#/dingTalkBind'

    // 5. 关 loading，等 DOM 渲染，再调 SDK（时序必须正确）
    this.isLoading = false
    await this.$nextTick()
    this.showDingTalkQRCode()

  } catch (error) {
    this.loadingFailed = true
    this.errorText = error.message || '初始化失败'
    ElMessage.error('初始化失败，请刷新页面重试')
  }
}
```

### 4.5 scope 规则

```js
buildLoginScopeConfig() {
  return this.corpId
    ? { scopeRaw: 'openid corpid', scopeEncoded: 'openid%20corpid' }
    : { scopeRaw: 'openid', scopeEncoded: 'openid' }
}
```

| 场景 | scope 值 | 说明 |
| --- | --- | --- |
| 未配置 corpId | `openid` | 只获取用户 openid |
| 已配置 corpId | `openid corpid` | 同时获取 openid 和组织 corpid |

### 4.6 渲染二维码（含完整 error 处理）

```js
showDingTalkQRCode() {
  const container = document.getElementById('dingtalk_bind_container')
  if (container) container.innerHTML = ''  // 清空，防止重复渲染

  const scopeConfig = this.buildLoginScopeConfig()
  const loginParams = {
    redirect_uri: encodeURIComponent(this.redirectUri),
    redirectUri: encodeURIComponent(this.redirectUri),  // 兼容不同版本 SDK
    response_type: 'code',
    responseType: 'code',
    client_id: this.appId,
    clientId: this.appId,
    scope: scopeConfig.scopeRaw,
    state: `dingtalk_bind_${Date.now()}`,
    prompt: 'consent',
  }
  if (this.corpId) loginParams.corpId = this.corpId

  window.DTFrameLogin(
    { id: 'dingtalk_bind_container', width: 300, height: 300 },
    loginParams,
    // success 回调
    (result) => {
      if (this.isBinding) return  // 防重：success 回调可能多次触发
      this.isBinding = true
      const authCode = result.authCode || result.code || ''
      if (!authCode) {
        ElMessage.error('未获取到授权码，请重试')
        this.isBinding = false
        return
      }
      this.handleBindCode(authCode)
    },
    // error 回调：参数可能是字符串或对象 {errorCode, errorMsg, success}
    (errorMsg) => {
      const isObj = errorMsg && typeof errorMsg === 'object'
      const code = isObj ? errorMsg.errorCode : ''
      const message = isObj
        ? (errorMsg.errorMsg || String(errorMsg))
        : (typeof errorMsg === 'string' ? errorMsg.trim() : '')
      const hasFrame = this.isDingTalkFrameRendered()

      // 空消息且二维码已渲染：SDK 初始化时的非致命回调，忽略
      if (!message || message === 'undefined') {
        if (hasFrame) return
        setTimeout(() => {
          if (this.isDingTalkFrameRendered()) return
          this.loadingFailed = true
          this.errorText = '钉钉绑定二维码初始化失败'
        }, 300)
        return
      }

      // 二维码已渲染时的非致命错误，忽略
      if (hasFrame) return

      this.loadingFailed = true
      this.errorText = code ? `${message}（错误码：${code}）` : message
    }
  )
}

// 检查二维码 iframe 是否已渲染
isDingTalkFrameRendered() {
  const container = document.getElementById('dingtalk_bind_container')
  if (!container) return false
  const iframe = container.querySelector('iframe')
  return !!(iframe && iframe.src && iframe.src.includes('login.dingtalk.com'))
}
```

### 4.7 原地调绑定接口

```js
async handleBindCode(code) {
  try {
    const res = await this.$API.login.bindDingTalk.post({ code })
    if (res.code !== 200) {
      ElMessage.error(res.msg || '绑定失败')
      return
    }
    // 更新本地缓存（只标记已绑定，不暴露钉钉原始身份字段）
    const userInfo = this.$TOOL.data.get('USER_INFO')
    if (userInfo) {
      userInfo.dingTalkOpenID = 'bound'
      this.$TOOL.data.set('USER_INFO', userInfo)
    }
    ElMessage.success('钉钉账号绑定成功')
    this.$emit('bindSuccess')  // 通知父组件关闭弹窗
  } catch {
    ElMessage.error('绑定失败，请重试')
  }
}
```

### 4.8 扫码业务错误感知（postMessage）

钉钉扫码后的业务错误（如"不在组织内"）**不走 error 回调**，而是通过 iframe 的 `postMessage` 传出：

```js
// mounted 里注册
listenForBindCallback() {
  this.handleBindMessage = (event) => {
    if (!event.data) return
    const data = event.data
    // 来自 https://login.dingtalk.com 的错误消息结构
    // { success: false, errorMsg: '操作失败，你不在组织内', errorCode: 11055 }
    if (data.success === false && data.errorMsg) {
      const msg = data.errorCode
        ? `${data.errorMsg}（错误码：${data.errorCode}）`
        : data.errorMsg
      ElMessage.error(msg)
    }
  }
  window.addEventListener('message', this.handleBindMessage)
}

// beforeUnmount 里移除，防止内存泄漏
beforeUnmount() {
  window.removeEventListener('message', this.handleBindMessage)
}
```

### 4.9 APP_NAME cookie 重试机制

绑定组件在 `created` 时读取 `APP_NAME` cookie，但 cookie 可能是异步写入的（登录页写入后，用户中心页面还没刷新），需要重试：

```js
created() {
  this.schoolName = tool.cookie.get('APP_NAME')
  if (!this.schoolName) {
    this.loadingText = '正在加载配置信息...'
    this.retryLoadSchoolName()
    // 注意：此时 mounted 里的 loadDingTalkSDK 也会执行
    // 如果重试成功，retryLoadSchoolName 会再次调用 loadDingTalkSDK
    // 如果 SDK 已加载，loadDingTalkSDK 会直接调 initDingTalkBind，不会重复加载
  }
}

retryLoadSchoolName() {
  const maxRetries = 5
  const retry = (attempt) => {
    if (attempt > maxRetries) {
      this.isLoading = false
      this.loadingFailed = true
      this.errorText = '配置加载失败'
      ElMessage.error({ message: '学校配置加载失败，请刷新页面重试', duration: 0, showClose: true })
      return
    }
    setTimeout(() => {
      this.schoolName = tool.cookie.get('APP_NAME')
      this.loadingText = `正在加载配置信息(${attempt}/${maxRetries})...`
      if (!this.schoolName) {
        retry(attempt + 1)
      } else {
        this.loadingText = '配置加载完成，正在初始化...'
        this.loadDingTalkSDK()  // 重试成功后重新触发 SDK 加载
      }
    }, 500)
  }
  retry(1)
}
```

### 4.10 刷新二维码

```js
refreshQRCode() {
  this.isBinding = false  // 重置防重标志
  this.showDingTalkQRCode()
}
```

---

## 5. 父组件协作（account.vue）

### 5.1 整体结构

```
account.vue
├── data：
│   ├── schoolConfig：学校第三方登录开关配置
│   ├── dialog：{ dingTalkBind: false }
│   ├── isDingTalkLoginResult：绑定状态（布尔值）
│   └── form：账号信息（含 dingTalkOpenID）
├── computed：
│   ├── showDingTalkBind = Number(schoolConfig.dingtalkLoginPc) === 1
│   └── showThirdPartySection = 任意一个平台开关开启
├── created：并行调 getSchoolConfig() + getAccountInfo()
├── template：
│   ├── 绑定区块（v-if="showDingTalkBind"）
│   │   ├── 已绑定：彩色图标 + "点击解绑"按钮（绿色）
│   │   └── 未绑定：灰色图标（CSS filter）+ "马上绑定"按钮（蓝色）
│   └── el-dialog（destroy-on-close）
│       └── DingTalkBindLogin @bindSuccess="handleDingTalkBindSuccess"
└── methods：
    ├── getSchoolConfig：拉取学校配置，决定显示哪些第三方绑定入口
    ├── getAccountInfo：拉取账号信息，用 lodash.merge 深合并本地缓存
    ├── openDingTalkBindDialog：dialog.dingTalkBind = true
    ├── handleDingTalkBindSuccess：关弹窗 + 乐观更新 + 重拉数据
    └── DingTalkDel：解绑确认 + 调接口 + 清缓存
```

### 5.2 学校配置控制显示

```js
// computed：数字开关转布尔值
showDingTalkBind() {
  return Number(this.schoolConfig.dingtalkLoginPc) === 1
}

// getSchoolConfig：拉取学校配置
async getSchoolConfig() {
  const res = await this.$API.school.detailList.get()
  if (res.code === 200 && res.data) {
    this.schoolConfig = {
      weixinLoginPc: res.data.weixinLoginPc ?? 0,
      qqLoginPc: res.data.qqLoginPc ?? 0,
      dingtalkLoginPc: res.data.dingtalkLoginPc ?? 0,
      weComLoginPc: res.data.weComLoginPc ?? 0,
    }
  }
}
```

### 5.3 账号信息获取（lodash.merge 深合并）

```js
async getAccountInfo() {
  const localeUserInfo = this.$TOOL.data.get('USER_INFO')
  const res = await this.$API.basics.accountSel.post()
  if (res.code === 200) {
    const _ = require('lodash')
    // 以本地缓存为基础，用接口数据覆盖，保留本地独有字段
    // 避免接口没有返回的字段被清空
    const result = _.merge({}, localeUserInfo, res.data)
    this.$TOOL.data.set('USER_INFO', result)
    this.form = result
    // !! 双取反：有值=已绑定，null/空字符串=未绑定
    this.isDingTalkLoginResult = !!res.data.dingTalkOpenID
  }
}
```

### 5.4 弹窗配置（destroy-on-close 是关键）

```html
<el-dialog
  v-model="dialog.dingTalkBind"
  title="钉钉账号绑定"
  :width="800"
  top="6vh"
  class="wecom-bind-dialog"
  destroy-on-close
>
  <DingTalkBindLogin @bindSuccess="handleDingTalkBindSuccess" />
</el-dialog>
```

`destroy-on-close` 的作用：关闭弹窗后销毁 `DingTalkBindLogin`，下次打开时重新挂载，`isBinding`、`isLoading` 等状态全部重置，避免二次打开时状态残留。

### 5.5 绑定成功回调

```js
handleDingTalkBindSuccess() {
  this.dialog.dingTalkBind = false   // 关闭弹窗
  this.isDingTalkLoginResult = true  // 乐观更新 UI（不等接口）
  this.getAccountInfo()              // 重拉服务端数据兜底
  this.$message.success('钉钉账号绑定成功')
}
```

### 5.6 图标灰化（未绑定状态）

```scss
// 用 CSS filter 将彩色图标变灰，避免维护两套图片
.image_box--dingtalk-unbound {
  filter: grayscale(1) brightness(0.72);
}
```

---

## 6. 解绑

```js
DingTalkDel() {
  this.$confirm('是否解绑钉钉', '提示', { type: 'warning' })
    .then(async () => {
      const res = await this.$API.login.unbindDingTalk.post()
      if (res.code === 200) {
        this.form.dingTalkOpenID = ''
        // 同步清空本地缓存，避免刷新前状态不一致
        const userInfo = this.$TOOL.data.get('USER_INFO')
        if (userInfo) {
          userInfo.dingTalkOpenID = ''
          this.$TOOL.data.set('USER_INFO', userInfo)
        }
        this.isDingTalkLoginResult = false
        this.$message.success('解绑成功')
      } else {
        this.$message.error(res.msg || '解绑失败')
      }
    })
    .catch(() => this.$message.info('已取消解绑'))
}
```

---

## 7. 与企业微信绑定的实现对比

两者实现方式完全一致，核心差异只在 SDK 和错误感知方式：

| 对比项 | 钉钉绑定 | 企业微信绑定 |
| --- | --- | --- |
| SDK | `window.DTFrameLogin`（CDN） | `window.ww.createWWLoginPanel`（CDN） |
| code 获取 | success 回调直接拿 `authCode` | `onLoginSuccess` 直接拿 `code` |
| 绑定接口 | `bindDingTalk.post({ code })` | `bindWeCom.post({ code })` |
| 防重机制 | `isBinding` 标志位 | `isInitializing` 标志位 |
| 扫码业务错误 | `postMessage {success:false, errorMsg}` | `postMessage ww-iframe-handle:call` |
| `redirect_uri` 用途 | 仅域名白名单校验 | 仅域名白名单校验 |
| 弹窗样式 | `wecom-bind-dialog`（共用） | `wecom-bind-dialog`（共用） |

**结论**：两个 SDK 的设计理念相同，`redirect_uri` 都只做域名校验，code 都通过回调直接返回，不需要页面跳转。下次接入其他平台的扫码绑定，可以直接参照这个模式复刻。

---

## 8. 踩坑记录

### ① success 回调触发多次 → "不合法的临时授权码"

**现象**：接口被调用 3 次，第 1 次成功，第 2、3 次报错。

**原因**：`DTFrameLogin` SDK 已知行为，success 回调在某些情况下会多次触发。authCode 是一次性的。

**解决**：`isBinding` 标志位，第一次进入后立即锁住，后续触发直接 return。

---

### ② 旧方案：window.opener 为 null，postMessage 失效

**现象**：`dingTalkBind/index.vue` 里 `window.opener.postMessage` 不执行。

**原因**：`window.location.href` 在当前窗口跳转，不是 `window.open` 弹窗，`opener` 为 null。

**解决**：改为原地处理，不跳转。

---

### ③ Element not found（二次打开弹窗报错）

**现象**：第二次打开弹窗时，SDK 报找不到容器元素。

**原因**：容器在 `v-else` 分支，`isLoading=true` 时不在 DOM 里，SDK 调用时机早于渲染。

**解决**：`isLoading = false` → `await $nextTick()` → 再调 SDK。

---

### ④ DTFrameLogin 返回空错误但二维码已渲染

**现象**：error 回调触发，但二维码正常显示。

**原因**：SDK 初始化时会触发一次空的 error 回调，非致命。

**解决**：error 回调里先检查容器内是否已有 `iframe`，有则忽略。

---

### ⑤ APP_NAME cookie 为空导致初始化失败

**现象**：组件显示"配置加载失败"，但实际上学校配置是有的。

**原因**：用户中心页面是在登录后直接进入的，`APP_NAME` cookie 由登录页写入，但 cookie 写入是异步的，`created` 时可能还未就绪。

**解决**：重试机制，最多 5 次（间隔 500ms），超时后显示错误。

---

### ⑥ 扫码业务错误无提示（如"不在组织内"）

**现象**：用户扫码后手机提示错误，PC 端无任何反馈。

**原因**：此类错误由 iframe 内部处理，通过 `postMessage` 传出，`onLoginFail` 不触发。

**解决**：在 `mounted` 里监听 `window.message` 事件，过滤 `{success: false, errorMsg}` 结构。

---

### ⑦ error 回调参数格式不一致

**现象**：有时 error 回调收到字符串，有时收到对象 `{errorCode, errorMsg, success}`。

**原因**：不同版本的 SDK 或不同错误类型，回调参数格式不同。

**解决**：兼容两种格式：
```js
const isObj = errorMsg && typeof errorMsg === 'object'
const code = isObj ? errorMsg.errorCode : ''
const message = isObj ? (errorMsg.errorMsg || String(errorMsg)) : (typeof errorMsg === 'string' ? errorMsg.trim() : '')
```

---

## 9. 下次项目开发速查

**需要准备的后台配置**：
- 钉钉开放平台创建应用，获取 `Client ID`
- 安全设置里配置回调域名（`redirect_uri` 的域名，即 `/#/dingTalkBind` 所在域名）
- 申请 `Contact.User.mobile` 和 `Contact.User.Read` 权限

**需要准备的前端配置**：
- 租户配置表里存 `dingtalkLoginPc`、`dingtalkClientID`、`dingtalkCorpID`
- 路由里注册 `/#/dingTalkBind`（仅用于域名白名单校验，不需要实际业务逻辑）
- 用户中心账号页引入 `DingTalkBindLogin` 组件

**最小实现步骤**：
1. 动态加载 SDK（`https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js`）
2. 拉取配置，取 `appId`、`corpId`，设置 `redirectUri = origin + '/#/dingTalkBind'`
3. `isLoading = false` → `$nextTick` → 调 `DTFrameLogin`
4. success 回调：`isBinding` 防重 → 取 `authCode` → 调绑定接口
5. 成功：更新本地缓存 `dingTalkOpenID = 'bound'` → `$emit('bindSuccess')`
6. 父组件：`destroy-on-close` 弹窗 + 监听 `bindSuccess` 关弹窗 + 重拉账号信息
7. `mounted` 里监听 `window.message` 捕获扫码业务错误，`beforeUnmount` 里移除

---

## 10. 相关接口

| 接口 | 方法 | 用途 |
| --- | --- | --- |
| `school.detailList.get()` | GET | 拉取学校配置，取 `dingtalkLoginPc`、`dingtalkClientID`、`dingtalkCorpID` |
| `login.bindDingTalk.post({ code })` | POST | 绑定钉钉账号 |
| `login.unbindDingTalk.post()` | POST | 解绑钉钉账号 |
| `basics.accountSel.post()` | POST | 拉取账号信息，判断 `dingTalkOpenID` 是否有值 |
