---
title: "企业微信账号绑定实现方案_PC端扫码绑定"
slug: "pc-pc-393c27b2"
summary: ""
category: "企业微信"
tags: []
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d29208a2b1c68f2cac7d4"
originalSlug: "pc-pc-393c27b2"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 企业微信账号绑定实现方案\_PC端扫码绑定

> 场景：已登录系统的用户，在用户中心将当前账号与企业微信关联，后续可直接使用企业微信扫码登录。
>
> 本文包含核心原理、完整实现、踩坑记录，可作为下次项目开发的直接参考。

---

## 0. 快速掌握（先读这里）

**做什么**：在已登录的用户中心页面，弹出对话框，内嵌企业微信扫码二维码，用户扫码后完成账号绑定，全程不离开当前页面。

**核心原理**：企业微信 `createWWLoginPanel` SDK 在容器 div 里渲染一个 iframe 二维码。用户扫码后，SDK 通过 **`onLoginSuccess` 回调**把 `code` 直接交给你，你拿着 code 调后端绑定接口即可。`redirect_uri` 参数只是企业微信后台的域名白名单校验，**SDK 不会真的跳转页面**。

> 关键：必须在 params 里传 `redirect_type: 'callback'`，否则 SDK 默认走跳转模式，`onLoginSuccess` 不会触发，扫码后页面会直接跳走。这个参数在官方文档参数表里没有列出，只在 FAQ 第5条里提到，属于隐藏参数。官方文档：https://developer.work.weixin.qq.com/document/path/98152
>
> 已验证：传了 `redirect_type: 'callback'` 后，绑定流程正常走 `onLoginSuccess` 原地处理，不跳转。同时桌面端企业微信快速登录面板也能正常触发（需满足官方 FAQ 第1条的全部条件：桌面端版本 > 3.1.23、HTTPS、用户在应用可见范围内、系统浏览器打开）。

**与钉钉绑定的核心区别**：
- 企业微信需要额外传 `schoolID` 给绑定接口（`bindWeCom.post({ code, schoolID })`）
- 企业微信需要传 `redirect_type: 'callback'` 才能走回调模式，钉钉不需要
- 企业微信有"点击重试"按钮（`initWeComBind` 可重复调用），钉钉是"刷新页面"
- 企业微信容器就绪检测用 `waitForContainerReady()`（轮询 offsetWidth > 0），钉钉用 `$nextTick`
- 企业微信 postMessage 错误结构是 `ww-iframe-handle:call`，钉钉是 `{success:false,errorMsg}`

**最容易踩的坑**：
1. **必须传 `redirect_type: 'callback'`**，否则扫码后页面跳走，`onLoginSuccess` 不触发
2. `createWWLoginPanel` 不能重复调用，必须加 `isInitializing` 标志位，且重试前要清空容器 innerHTML
3. 容器在 `v-else` 里，必须先关 loading、等容器尺寸 > 0 再挂载 SDK
4. `onLoginFail` 只覆盖初始化错误，扫码后的业务错误（如无权限）走 `postMessage`，需单独监听
5. `redirect_uri` 的域名必须在企业微信后台配置可信域名，否则报 -31020

**接口**：`this.$API.login.bindWeCom.post({ code, schoolID })`，成功后 `$emit('bindSuccess')` 通知父组件关闭弹窗。

---

## 1. 与登录的区别

| 对比项     | 登录（WeComLogin.vue）   | 绑定（WeComBindLogin.vue）          |
| ---------- | ------------------------ | ----------------------------------- |
| 触发时机   | 未登录，在登录页扫码     | 已登录，在用户中心主动绑定          |
| 成功后动作 | 写入 TOKEN、跳转首页     | 调绑定接口、通知父组件关闭弹窗      |
| 页面形态   | 独立页面                 | el-dialog 内嵌组件                  |
| code 处理  | 跳转回调页 `/weComLogin` | `onLoginSuccess` 直接拿 code 调接口 |
| 鉴权方式   | code 换 token            | 已有登录态，code 直接换绑定关系     |
| 用户感知   | 页面跳转                 | 弹窗内完成，无跳转感                |

---

## 2. 整体流程

```
用户点击"马上绑定"
  ↓
account.vue：dialog.weComBind = true，打开 el-dialog
  ↓
WeComBindLogin 组件挂载
  ↓
mounted：initWeComBind() + listenWeComMessage() 同步执行
  ↓
initWeComBind：
  → isInitializing 防重检查
  → 调 $API.school.detailList.get() 拉取学校配置
  → 校验 weComLoginPc=1、weComCorpID、weComAgentID、schoolID cookie
  → loadWeComSDK()（已加载则跳过）
  → isLoading = false → $nextTick → 清空容器 innerHTML
  → waitForContainerReady()（轮询容器 offsetWidth > 0，最多等 2000ms）
  → createWWLoginPanel 渲染内嵌二维码
  ↓
用户用手机企业微信扫码
  ↓
onLoginSuccess 回调，直接拿到 code
  ↓
handleBindCode(code, schoolID)：调 bindWeCom 接口
  └─ 失败：ElMessage.error(res.msg)
  └─ 成功：更新 USER_INFO 缓存，ElMessage.success，$emit('bindSuccess')
  ↓
account.vue handleWeComBindSuccess：
  → dialog.weComBind = false（关闭弹窗）
  → isWeComLoginResult = true（立即更新 UI）
  → getAccountInfo()（重拉服务端数据兜底）
```

**错误路径**：
```
任意步骤抛出异常
  → isLoading = false，isInitializing = false（重置，允许重试）
  → loadingFailed = true，errorText = 错误信息
  → 显示错误状态页（错误文字 + "点击重试"按钮）
  → 用户点击重试 → 重新调 initWeComBind()
```

---

## 3. 关键实现

### 3.1 组件三态状态机

```
isLoading=true       → 转圈动画（绿色 #07c160）
loadingFailed=true   → 错误图标 + errorText + "点击重试"按钮
else（正常）         → 双栏布局：左侧二维码（360px）+ 右侧引导说明
```

关键 data 字段：

| 字段             | 类型    | 说明                                                   |
| ---------------- | ------- | ------------------------------------------------------ |
| `isLoading`      | Boolean | 配置拉取 + SDK 加载期间为 true                         |
| `loadingFailed`  | Boolean | 任意初始化步骤失败时为 true                            |
| `errorText`      | String  | 错误状态下显示的具体原因                               |
| `isInitializing` | Boolean | 防止 `initWeComBind` 重复执行，失败时重置允许重试      |

### 3.2 UI 模板结构

`html
<template>
  <div class="wecom-bind-shell">
    <!-- 加载中：固定文字"正在加载企业微信绑定..." -->
    <div v-if="isLoading" class="wecom-bind-state">
      <div class="loading-spinner"></div>  <!-- 绿色 #07c160 -->
      <div class="state-text">正在加载企业微信绑定...</div>
    </div>

    <!-- 加载失败：错误文字 + "点击重试"按钮（重新调 initWeComBind） -->
    <div v-else-if="loadingFailed" class="wecom-bind-state wecom-bind-state--error">
      <div class="error-icon">✕</div>
      <div class="state-text state-text--error">{{ errorText }}</div>
      <div class="error-subtitle">请检查企业微信后台可信域名配置，或联系管理员</div>
      <button type="button" class="retry-btn" @click="initWeComBind">点击重试</button>
    </div>

    <!-- 正常：双栏布局 -->
    <div v-else class="wecom-bind-panel">
      <!-- 左侧：二维码容器 -->
      <div class="wecom-bind-panel__main">
        <div id="wecom_bind_container" class="wecom-bind-container"></div>
      </div>
      <!-- 右侧：引导说明 -->
      <div class="wecom-bind-panel__aside">
        <img class="aside-icon" src="@/assets/images/wecom.svg" alt="企业微信" />
        <div class="aside-title">绑定企业微信</div>
        <div class="aside-desc">扫描左侧二维码，完成账号绑定。</div>
        <div class="aside-steps">
          <div class="aside-step"><span class="aside-step__num">1</span><span>打开手机企业微信</span></div>
          <div class="aside-step"><span class="aside-step__num">2</span><span>点击右上角"扫一扫"</span></div>
          <div class="aside-step"><span class="aside-step__num">3</span><span>扫描左侧二维码确认绑定</span></div>
        </div>
        <!-- 二维码过期时重新初始化（同"点击重试"，都是调 initWeComBind） -->
        <button type="button" class="refresh-btn" @click="initWeComBind">二维码已过期？点击刷新</button>
      </div>
    </div>
  </div>
</template>
`

> 与钉钉绑定的 UI 差异：
> - loading 文字是固定的，不是动态的（钉钉有动态 loadingText）
> - 步骤数字圆圈是绿色 #07c160（钉钉是蓝色 #1389ff）
> - 失败状态的副标题提示的是"企业微信后台可信域名配置"（钉钉是"钉钉开放平台配置"）
> - "二维码已过期？点击刷新"和"点击重试"都是调 initWeComBind()，不是单独的 efreshQRCode()
### 3.2 SDK 加载

```javascript
loadWeComSDK() {
  // 已加载则直接复用，不重复请求
  if (window.ww && typeof window.ww.createWWLoginPanel === 'function') {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://wwcdn.weixin.qq.com/node/open/js/wecom-jssdk-2.3.4.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('企业微信SDK加载失败'));
    document.head.appendChild(script);
  });
}
```

### 3.3 容器就绪检测（重要）

企业微信 SDK 对容器尺寸有要求，`$nextTick` 不够用，需轮询确认 `offsetWidth > 0`：

```javascript
waitForContainerReady(maxWaitMs = 2000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const el = document.getElementById('wecom_bind_container');
      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) { resolve(); return; }
      if (Date.now() - start >= maxWaitMs) { reject(new Error('容器初始化超时')); return; }
      window.requestAnimationFrame(check);  // 每帧检查一次
    };
    check();
  });
}
```

挂载顺序：

```javascript
this.isLoading = false;
await this.$nextTick();                    // 等 v-else 容器渲染到 DOM
const container = document.getElementById('wecom_bind_container');
if (container) container.innerHTML = '';   // 清空，防止重试时内容叠加
await this.waitForContainerReady();        // 等容器尺寸 > 0
// 此时才调 createWWLoginPanel
```

### 3.4 createWWLoginPanel 配置

```javascript
window.ww.createWWLoginPanel({
  el: '#wecom_bind_container',
  params: {
    login_type: 'CorpApp',
    appid: config.weComCorpID,      // 企业 CorpID
    agentid: config.weComAgentID,   // 应用 AgentID
    redirect_uri: redirectUri,      // 传原始字符串，SDK 内部处理编码
    redirect_type: 'callback',      // ⚠️ 必须传！否则扫码后页面跳走，onLoginSuccess 不触发
                                    // 此参数在官方文档参数表中未列出，见 FAQ 第5条
                                    // 官方文档：https://developer.work.weixin.qq.com/document/path/98152
    state: `wecombind${Date.now()}`,
    lang: 'zh',
  },
  onCheckWeComLogin({ isWeComLogin }) {
    // 可判断桌面端企业微信是否已登录，用于决定是否显示快速登录面板
    console.log('[企微绑定] 桌面端登录状态:', isWeComLogin);
  },
  onLoginSuccess: ({ code }) => {
    this.handleBindCode(code, schoolID);  // 原地处理，不跳转
  },
  onLoginFail: (err) => {
    // 注意：onLoginFail 只覆盖初始化阶段错误
    // 扫码后的业务错误由 postMessage 监听统一处理
    console.warn('[企微绑定] onLoginFail:', err);
  },
});
```

> `redirect_uri` 格式：`${window.location.origin}/#/weComBind?schoolID=${encodeURIComponent(schoolID)}`
> 域名部分必须在企业微信后台配置可信域名，否则报 -31020。
> `redirect_type=callback` 要求业务页面域名与 `redirect_uri` 域名一致，当前 `redirectUri` 使用 `window.location.origin` 拼接，满足条件。

### 3.5 防重复初始化（重要）

`createWWLoginPanel` 不能重复调用，否则渲染多个面板：

```javascript
async initWeComBind() {
  if (this.isInitializing) return;   // 已在初始化中，直接忽略
  this.isInitializing = true;
  this.isLoading = true;
  this.loadingFailed = false;

  try {
    // ... 初始化逻辑
  } catch (error) {
    this.isLoading = false;
    this.isInitializing = false;     // 失败时重置，允许用户点击重试
    this.loadingFailed = true;
    this.errorText = error.message || '初始化失败';
    ElMessage.error(this.errorText);
  }
  // 注意：成功路径不重置 isInitializing，防止面板渲染后再次触发
}
```

### 3.6 绑定接口调用

```javascript
async handleBindCode(code, schoolID) {
  try {
    const bindRes = await this.$API.login.bindWeCom.post({ code, schoolID });
    if (bindRes.code !== 200) {
      ElMessage.error(bindRes.msg || '绑定失败');
      return;
    }
    // 乐观更新本地缓存（真实值下次 getAccountInfo 时覆盖）
    const userInfo = this.$TOOL.data.get('USER_INFO');
    if (userInfo) {
      userInfo.weComOpenUserID = 'bound';
      this.$TOOL.data.set('USER_INFO', userInfo);
    }
    ElMessage.success('企业微信账号绑定成功');
    this.$emit('bindSuccess');
  } catch {
    ElMessage.error('绑定失败，请重试');
  }
}
```

> 注意：企业微信绑定接口需要同时传 `code` 和 `schoolID`，钉钉只传 `code`。`schoolID` 从 `this.$TOOL.cookie.get("schoolID")` 获取。

### 3.7 postMessage 错误监听

企业微信 SDK 通过 `postMessage` 将错误传给父页面，`onLoginFail` 回调**不会**捕获扫码后的业务错误：

```javascript
// mounted 时注册，beforeUnmount 时清理
listenWeComMessage() {
  this.handleWeComMessage = (event) => {
    // 只处理来自企业微信域的消息
    if (!event.data || event.origin.indexOf('weixin.qq.com') === -1) return;
    const data = event.data;

    // 企业微信错误消息结构
    // { type: 'ww-iframe-handle:call', args: { name: 'onLoginFail', data: { errCode, errMsg } } }
    if (
      data.type === 'ww-iframe-handle:call' &&
      data.args?.name === 'onLoginFail' &&
      data.args?.data
    ) {
      const { errCode, errMsg } = data.args.data;
      const hasFrame = document.querySelector('#wecom_bind_container iframe');

      if (!hasFrame) {
        // iframe 未渲染 = 初始化阶段错误，显示在界面上
        this.isInitializing = false;
        this.loadingFailed = true;
        this.errorText = errMsgMap[String(errCode)] || `${errMsg}（错误码：${errCode}）`;
      } else {
        // iframe 已渲染 = 扫码后业务错误，ElMessage 提示，二维码继续显示
        ElMessage.error(scanErrMsgMap[String(errCode)] || `${errMsg}（错误码：${errCode}）`);
      }
    }
  };
  window.addEventListener('message', this.handleWeComMessage);
}
```

**官方错误码对照表**（来源：[企业微信开发者文档](https://developer.work.weixin.qq.com/document/path/98152)）：

| 错误码  | 官方释义                                   | 处理建议                         |
| ------- | ------------------------------------------ | -------------------------------- |
| -31020  | redirect_uri 与配置的登录授权回调域名不一致 | 企业微信后台配置可信域名         |
| -31027  | appid 参数错误                             | 检查学校 CorpID 配置             |
| -31028  | agentid 参数错误                           | 检查学校 AgentID 配置            |
| -31033  | 校验请求来源错误                           | 确认页面域名已加入可信域名       |
| -31034  | 该企业不是服务商                           | 确认应用类型                     |
| -31035  | redirect_uri 不能为空                      | 检查 redirectUri 拼接逻辑        |
| -31037  | appid 非登录授权应用                       | 确认应用已开启企业微信授权登录   |
| -31039  | redirect_uri 与配置的可信域名不一致        | 企业微信后台配置可信域名         |
| -31040  | login_type 参数错误                        | 固定传 `CorpApp`                 |

---

## 4. 父组件协作（account.vue）

### 4.1 整体结构

```
account.vue
├── created：并行调 getSchoolConfig() + getAccountInfo()
├── computed：showWeComBind = weComLoginPc === 1
├── template：
│   ├── 绑定区块（v-if="showWeComBind"）
│   │   ├── 已绑定：彩色图标 + "点击解绑"按钮
│   │   └── 未绑定：灰色图标 + "马上绑定"按钮 → openWeComBindDialog()
│   └── el-dialog（destroy-on-close）
│       └── WeComBindLogin @bindSuccess="handleWeComBindSuccess"
└── methods：
    ├── openWeComBindDialog：dialog.weComBind = true
    ├── handleWeComBindSuccess：关弹窗 + 更新状态 + 重拉数据
    └── WeComDel：解绑确认 + 调接口 + 清缓存
```

### 4.2 绑定状态判断

```javascript
// getAccountInfo 里，接口字段有值即为已绑定
this.isWeComLoginResult = !!res.data.weComOpenUserID
```

### 4.3 弹窗配置

```html
<!-- destroy-on-close：关闭后销毁子组件，重置所有状态，避免二次打开时残留 -->
<el-dialog
  v-model="dialog.weComBind"
  title="企业微信账号绑定"
  :width="800"
  top="6vh"
  class="wecom-bind-dialog"
  destroy-on-close
>
  <div class="wecomBindWrap">
    <WeComBindLogin @bindSuccess="handleWeComBindSuccess" />
  </div>
</el-dialog>
```

### 4.4 绑定成功回调

```javascript
handleWeComBindSuccess() {
  this.dialog.weComBind = false;    // 关闭弹窗
  this.isWeComLoginResult = true;   // 立即更新 UI（乐观更新）
  this.getAccountInfo();            // 重拉服务端数据兜底
  this.$message.success('企业微信账号绑定成功');
}
```

### 4.5 图标灰化（未绑定状态）

```scss
// 用 CSS filter 将彩色图标变灰，避免维护两套图片
.image_box--wecom-unbound {
  filter: grayscale(1) brightness(0.72);
}
```

---

## 5. 解绑

```javascript
WeComDel() {
  this.$confirm('是否解绑企业微信', '提示', { type: 'warning' })
    .then(async () => {
      const res = await this.$API.login.unbindWeCom.post();
      if (res.code === 200) {
        // 同步清空本地缓存，避免刷新前状态不一致
        const userInfo = this.$TOOL.data.get('USER_INFO');
        if (userInfo) {
          userInfo.weComOpenUserID = '';
          this.$TOOL.data.set('USER_INFO', userInfo);
        }
        this.isWeComLoginResult = false;
        this.$message.success('解绑成功');
      } else {
        this.$message.error(res.msg || '解绑失败');
      }
    })
    .catch(() => this.$message.info('已取消解绑'));
}
```

---

## 6. 与钉钉绑定的实现对比

两者整体模式相同，核心差异如下：

| 对比项              | 企业微信绑定                                  | 钉钉绑定                             |
| ------------------- | --------------------------------------------- | ------------------------------------ |
| SDK                 | `window.ww.createWWLoginPanel`（CDN）         | `window.DTFrameLogin`（CDN）         |
| code 获取           | `onLoginSuccess` 回调直接拿 `code`            | success 回调直接拿 `authCode`        |
| 绑定接口参数        | `{ code, schoolID }`                          | `{ code }`                           |
| 防重机制            | `isInitializing` 标志位（失败时重置）         | `isBinding` 标志位（不重置）         |
| 重试方式            | "点击重试"按钮，重新调 `initWeComBind()`      | "点击刷新页面"，`window.location.reload()` |
| 容器就绪检测        | `waitForContainerReady()`（轮询 offsetWidth） | `$nextTick` 即可                     |
| 扫码业务错误        | `postMessage ww-iframe-handle:call`           | `postMessage {success:false,errorMsg}` |
| `redirect_uri` 用途 | 仅域名白名单校验，不实际跳转                  | 仅域名白名单校验，不实际跳转         |
| 弹窗样式            | `wecom-bind-dialog`                           | `wecom-bind-dialog`（共用）          |

---

## 7. 踩坑记录

### ① 不传 redirect_type=callback → 扫码后页面跳走，onLoginSuccess 不触发

**现象**：用户扫码后，当前页面直接跳转到 `redirect_uri` 对应的回调页，弹窗消失，绑定流程断掉。

**原因**：`createWWLoginPanel` 默认走跳转模式，必须显式传 `redirect_type: 'callback'` 才会走回调模式。这个参数在官方文档参数表里没有列出，只在 FAQ 第5条里提到，属于隐藏参数。

**解决**：params 里加 `redirect_type: 'callback'`。注意加了之后要求业务页面域名与 `redirect_uri` 域名一致。

---

### ② createWWLoginPanel 重复调用 → 渲染多个面板

**现象**：弹窗内出现两个二维码，或 SDK 报错。

**原因**：`initWeComBind` 被调用了两次（组件响应式更新、重试等场景）。

**解决**：`isInitializing` 标志位，进入后立即锁住；失败时重置（允许重试），成功后不重置（防止面板渲染后再次触发）。

---

### ② 容器尺寸为 0 导致 SDK 报错

**现象**：`createWWLoginPanel` 报找不到容器或容器尺寸异常。

**原因**：`isLoading=false` 后 `v-else` 容器虽然进入 DOM，但 CSS 布局还未完成，`offsetWidth` 仍为 0。

**解决**：`$nextTick` 后再用 `waitForContainerReady()` 轮询确认尺寸 > 0，最多等 2000ms。

---

### ③ redirect_uri 报 -31020

**现象**：SDK 初始化时报 -31020，二维码无法显示。

**原因**：`redirect_uri` 的域名未在企业微信后台配置可信域名，或 hash 路由的 `#` 导致域名解析异常。

**解决**：
1. 企业微信管理后台 → 应用 → 网页授权及JS-SDK → 可信域名，添加部署域名
2. 绑定场景用 `onLoginSuccess` 原地拿 code，不依赖 `redirect_uri` 跳转

---

### ④ onLoginFail 无法捕获扫码后的业务错误

**现象**：用户扫码后手机提示"无权限"，PC 端无任何反馈。

**原因**：`onLoginFail` 只覆盖 SDK 初始化阶段的错误，扫码后的业务错误由 iframe 内部处理，通过 `postMessage` 传出。

**解决**：监听 `window.message`，过滤 `origin` 含 `weixin.qq.com`，匹配 `type === 'ww-iframe-handle:call'` 且 `args.name === 'onLoginFail'` 的消息。

---

### ⑤ 弹窗样式被其他弹窗污染

**现象**：企业微信弹窗内二维码尺寸异常，或内边距不对。

**原因**：复用了钉钉弹窗的 `dingtalk-bind-dialog` class，其 `.qrCodeLogin` 子样式限制了尺寸。

**解决**：企业微信弹窗使用独立 class `wecom-bind-dialog`，内容包裹 div 用 `wecomBindWrap`。

---

### ⑥ 二次打开弹窗时内容叠加

**现象**：第二次打开弹窗时，容器里有上次残留的 iframe。

**原因**：`destroy-on-close` 销毁了组件，但如果没有 `destroy-on-close`，容器 innerHTML 不会清空。

**解决**：弹窗加 `destroy-on-close`；`initWeComBind` 里在挂载前主动清空容器 `innerHTML`（双重保险）。

---

## 8. 下次项目开发速查

**需要准备的后台配置**：
- 企业微信管理后台创建自建应用，获取 `CorpID` 和 `AgentID`
- 应用 → 网页授权及JS-SDK → 可信域名，添加部署域名
- 应用 → 企业微信授权登录，开启并配置回调域名

**需要准备的前端配置**：
- 学校配置表里存 `weComLoginPc`、`weComCorpID`、`weComAgentID`
- 路由里保留 `/#/weComBind` 路由（`redirect_uri` 域名校验需要）
- `schoolID` 存在 cookie 里（`this.$TOOL.cookie.get("schoolID")`）

**最小实现步骤**：
1. 动态加载 SDK（`https://wwcdn.weixin.qq.com/node/open/js/wecom-jssdk-2.3.4.js`）
2. 拉取配置，校验 `weComCorpID`、`weComAgentID`、`schoolID`
3. `isLoading = false` → `$nextTick` → 清空容器 → `waitForContainerReady()` → 调 `createWWLoginPanel`
4. `onLoginSuccess` 回调：取 `code` → 调 `bindWeCom.post({ code, schoolID })`
5. 成功：更新本地缓存 → `$emit('bindSuccess')`
6. 父组件：`destroy-on-close` 弹窗 + 监听 `bindSuccess` 关弹窗
7. 额外：`listenWeComMessage()` 监听 postMessage 捕获扫码业务错误

---

## 9. 相关文件

| 文件                                                      | 说明                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| `src/views/userCenter/user/components/WeComBindLogin.vue` | 绑定组件（内嵌二维码，原地处理）                             |
| `src/views/userCenter/user/account.vue`                   | 父组件，控制弹窗开关、绑定状态展示、解绑逻辑                 |
| `src/views/weComBind/index.vue`                           | 旧回调页（当前绑定流程已不再依赖，保留备用）                 |
| `src/api/model/login.js`                                  | `bindWeCom`、`unbindWeCom` 接口                              |
| `src/views/general/system/school/index.vue`               | 学校配置管理页，`weComLoginPc`、`weComCorpID`、`weComAgentID` 在此配置 |
