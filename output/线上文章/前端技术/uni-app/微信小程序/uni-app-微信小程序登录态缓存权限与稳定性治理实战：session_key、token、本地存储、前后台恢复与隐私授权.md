---
title: "uni-app 微信小程序登录态缓存权限与稳定性治理实战：session_key、token、本地存储、前后台恢复与隐私授权"
slug: "uni-app-uni-app-session-key-token-8af791f8"
summary: "面向长期维护公司 uni-app 项目的开发者，从 session_key、业务 token、本地存储、前后台恢复到隐私授权，梳理微信小程序最容易混乱的状态治理与稳定性问题。"
category: "微信小程序"
tags:
  - "uni-app"
  - "微信小程序"
  - "登录态"
  - "本地缓存"
  - "隐私授权"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291e8a2b1c68f2cac222"
originalSlug: "uni-app-uni-app-session-key-token-8af791f8"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# uni-app 微信小程序登录态缓存权限与稳定性治理实战：session_key、token、本地存储、前后台恢复与隐私授权

> 这是这一组 `uni-app 微信小程序` 笔记的第 6 篇。  
> 截至 `2026-03-31`，我继续对照 `uni-app` 和微信开放文档，把公司项目里最容易“越维护越乱”的一层单独拎出来讲。  
> 前 5 篇已经把运行机制、工程结构、常见能力、性能治理、组件边界拆开了，这一篇就专门解决一个更现实的问题：`为什么项目功能没多复杂，但登录、缓存、授权、前后台恢复总是越来越难改？`

> 建议先读 `uni-app/通用基础`：
> 1. 第 2 篇《uni-app 应用生命周期、页面生命周期与常见页面事件》
> 2. 第 4 篇《uni-app 跨端开发通用方法：路由、请求、缓存、上传下载与条件编译》
> 这一篇默认你已经知道通用缓存和生命周期概念，下面会重点补微信项目最容易写乱的状态治理：微信登录态、业务登录态、本地缓存态、隐私权限态分别该怎么拆。

## 一、先说结论：最容易被写乱的，不是接口，而是 4 套状态混在了一起

很多人维护 `uni-app` 微信小程序时，脑子里其实只分两类东西：

1. 登录没登录
2. 缓存有没有

但项目一旦做久了，你会发现这根本不够。真正要分清楚的，至少有下面 4 套状态：

| 状态层 | 你平时会看到什么 | 谁负责 | 失效方式 |
| --- | --- | --- | --- |
| 微信登录态 | `code`、`session_key`、`wx.checkSession` | 微信侧 | 微信维护时效，重新拿 `code` 会顶掉旧 `session_key` |
| 业务登录态 | `token`、`refreshToken`、用户会话 | 你的后端 | 后端自己的过期、踢下线、风控、签名校验 |
| 本地缓存态 | `uni.setStorageSync` 里的数据 | 客户端本地 | 被覆盖、被清除、版本变更后结构不兼容 |
| 隐私与权限态 | 隐私协议同意、手机号授权、位置授权 | 微信平台 + 用户操作 | 用户拒绝、重装/清缓存、协议更新、基础库差异 |

只要这 4 套状态没有拆开，项目里就一定会出现下面这些经典误判：

- `storage` 里有 token，就以为用户一定还在线
- `wx.checkSession` 成功，就以为后端 token 也没过期
- 用户昨天同意过隐私协议，就以为今天永远还能直接调隐私接口
- 切后台回来页面还能显示，就以为业务状态也一定还是对的

这篇最重要的一句话是：

`微信登录态不等于业务登录态，本地缓存不等于真实状态，页面还亮着也不等于链路没断。`

## 二、先把登录链路彻底拆开：code、session_key、token 根本不是一回事

微信官方登录文档里，真正的登录链路是这样的：

1. 小程序调用 `wx.login` 或 `uni.login({ provider: 'weixin' })` 获取临时登录凭证 `code`
2. 前端把 `code` 传给你自己的后端
3. 后端再通过微信接口换取 `openid`、`unionid`、`session_key`
4. 后端基于自己的用户体系生成业务 `token`
5. 前端后续真正带着跑业务接口的，通常是你自己的 `token`

这里最容易混淆的点有两个。

### 1. 前端平时真正拿到的，通常不是 `session_key`

微信官方“小程序登录”文档明确写了，`session_key` 是会话密钥，用来做加密签名；开发者服务器不应该把它下发给小程序，也不应该对外提供这个密钥。

所以你在日常前端代码里最应该建立的认知是：

- 前端拿到的是 `code`
- 后端换的是 `session_key`
- 前端持有的是业务 `token`

如果你把这三个概念混成一个“登录态”，后面就会不断出现边界错误。

### 2. `wx.checkSession` 检查的不是你的业务 token

截至 `2026-03-31`，微信官方 `wx.checkSession` 文档写得非常直接：

- 它检查的是登录态 `session_key` 是否过期
- 它校验的是“最后一次获取 `code` 操作对应的登录态 `session_key`”
- 成功表示该 `session_key` 还没过期
- 失败表示该 `session_key` 已失效，需要重新 `wx.login`

也就是说，下面这种写法思路是错的：

```js
if (await checkSession()) {
  // 这里直接认为整个系统“已登录”
}
```

因为它最多只能说明：

`微信这层 session_key 可能还有效。`

它完全不能说明：

- 你的业务 token 还有效
- 用户在你后端没有被踢下线
- 当前用户资料、角色、学校、租户、权限还没变

### 3. 更稳的判断顺序应该是什么

我更建议你在公司项目里建立下面这个顺序：

1. 先判断本地是否有业务 token
2. 再判断 token 是否还在你定义的有效期内
3. 关键页面回前台时，再做一次服务端校验或刷新
4. 仅在需要重新走微信登录链路时，才去检查 `wx.checkSession`
5. `wx.checkSession` 失败，就重新 `uni.login`
6. 重新拿到 `code` 后，再让后端决定是否换发新 token

也就是说，`wx.checkSession` 是微信登录链路里的一个环节，不是整个登录系统的总闸门。

## 三、给项目一个最小可维护模型：微信态、业务态、缓存态分别建函数

如果你现在维护的是公司里的 `uni-app` 项目，我非常建议你不要把这些判断散落在十几个页面里，而是至少收口成 3 层函数：

1. 检查微信登录态
2. 检查业务登录态
3. 恢复页面和缓存状态

下面这段骨架就很适合当长期维护的起点：

这里我同样故意避开了直接 `await uni.login()` 取结果的写法，原因不是它不能用，而是 uni-app 在 Vue 2 / Vue 3 项目里的 Promise 返回格式并不一致，文档示例最好优先写成跨版本都稳的形式。

```js
// utils/auth.js
const TOKEN_KEY = 'access_token'
const TOKEN_EXPIRE_AT_KEY = 'access_token_expire_at'
const USER_KEY = 'current_user'

export function hasUsableToken() {
  const token = uni.getStorageSync(TOKEN_KEY)
  const expireAt = Number(uni.getStorageSync(TOKEN_EXPIRE_AT_KEY) || 0)

  if (!token) return false
  if (!expireAt) return false

  return Date.now() < expireAt
}

export function checkWeChatSession() {
  // #ifdef MP-WEIXIN
  return new Promise(resolve => {
    wx.checkSession({
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
  // #endif

  return Promise.resolve(true)
}

export function fetchFreshCode() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (!res.code) {
          reject(new Error('微信登录未拿到 code'))
          return
        }

        resolve(res.code)
      },
      fail: reject
    })
  })
}

export function persistLoginResult(data) {
  uni.setStorageSync(TOKEN_KEY, data.token)
  uni.setStorageSync(TOKEN_EXPIRE_AT_KEY, data.expireAt)
  uni.setStorageSync(USER_KEY, data.userInfo || null)
}

export async function ensureBusinessLogin({ force = false } = {}) {
  if (!force && hasUsableToken()) {
    return {
      ok: true,
      from: 'storage'
    }
  }

  const sessionValid = force ? false : await checkWeChatSession()
  const code = sessionValid ? null : await fetchFreshCode()

  const loginResult = await exchangeCodeOrToken({
    code,
    token: uni.getStorageSync(TOKEN_KEY) || ''
  })

  persistLoginResult(loginResult)

  return {
    ok: true,
    from: code ? 'wx-login' : 'token-refresh'
  }
}

export function clearAuthState() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(TOKEN_EXPIRE_AT_KEY)
  uni.removeStorageSync(USER_KEY)
}
```

这段 `auth.js` 骨架建议你按“一个函数只守一层状态”来读：

1. `hasUsableToken` 只看本地业务 token 是否存在且没到你定义的过期时间，不去碰微信底层状态。
2. `checkWeChatSession` 只负责问微信宿主“当前 session_key 还在不在”，所以它放在 `MP-WEIXIN` 分支里非常合理。
3. `fetchFreshCode` 只做一件事，就是重新拿新的 `code`，不顺手改页面状态、不顺手弹提示。
4. `persistLoginResult` 和 `clearAuthState` 只处理持久化读写，这样你后续要换 key、加版本号、加缓存迁移都很好收。
5. `ensureBusinessLogin` 把整条链真正串起来了，但它依然是先判断本地业务态，再决定要不要走微信换登，这就是状态分层的核心。

这段代码最重要的不是语法本身，而是它把边界拆清楚了：

- `checkWeChatSession` 只关心微信态
- `hasUsableToken` 只关心业务 token
- `persistLoginResult` 只关心本地持久化
- `clearAuthState` 只做清理，不顺手塞业务逻辑

只要边界清楚，后续你要加多学校、多租户、角色切换、静默刷新，都会比“每页自己写一套”好维护得多。

## 四、本地缓存最大的坑，不是不会存，而是把“旧数据”当成“真实状态”

很多项目真正崩掉，不是因为不会用 `storage`，而是因为太相信 `storage`。

你要先接受一个现实：

`本地缓存只能证明“这个设备上曾经写过一份数据”，不能证明这份数据此刻仍然正确。`

### 1. 什么适合长期缓存，什么不适合

我更建议把本地存储分成下面 3 类：

| 类型 | 适合放什么 | 为什么 |
| --- | --- | --- |
| 可长期缓存 | 主题配置、搜索历史、字典表、草稿、非敏感展示配置 | 即使旧一点，也不会直接打坏核心链路 |
| 可短期缓存 | 列表筛选条件、最近浏览记录、非关键页签状态 | 可以提升体验，但失效后可重建 |
| 不适合直接信任 | 登录结果、权限结果、用户身份、强校验状态 | 这些东西必须由服务端或当前运行态再次确认 |

这里不要理解成“token 绝对不能存”。更准确的说法是：

- 业务 token 可以缓存
- 但不能因为本地还有 token，就跳过后续的有效性校验
- 更不能把上次缓存的用户信息、权限树、学校信息，直接当成当前真相

### 2. 缓存最常见的 4 个坏味道

你可以快速排查项目里有没有下面这些情况：

1. `storage` 里只要有 `token` 字段，就默认首页直进
2. 登录成功时把整份用户对象原样缓存，后面所有页面直接读缓存不再校验
3. 权限按钮显示逻辑依赖上一次缓存的权限结果
4. 版本升级后数据结构变了，但没有做缓存迁移或兜底清理

只要中了这些，项目在“用户切账号”“后台改权限”“学校切换”“长时间未使用后重开”这几类场景下就很容易出错。

### 3. 缓存容量不要靠背诵，要靠实际检查

截至 `2026-03-31`，微信官方 `wx.getStorageInfoSync` 文档给出的稳定字段是：

- `keys`
- `currentSize`
- `limitSize`

而且单位是 `KB`。

所以更稳的做法不是在项目里到处背一个固定容量数字，而是：

1. 用 `wx.getStorageInfoSync()` 或 `uni.getStorageInfoSync()` 实际看当前占用
2. 结合当前微信官方存储文档与 `limitSize` 结果判断是否接近上限
3. 对缓存做分层清理，而不是等爆了再查

示例：

```js
export function inspectStorageUsage() {
  const info = uni.getStorageInfoSync()

  console.log('keys:', info.keys)
  console.log('currentSize(KB):', info.currentSize)
  console.log('limitSize(KB):', info.limitSize)
}
```

### 4. 更稳的缓存原则

如果让我给公司项目定一个简单原则，我会这么写：

`缓存是体验优化层，不是认证真相层。`

## 五、前后台恢复不是“补个 onShow 就行”，而是要把恢复策略设计出来

很多人第一次接手微信小程序项目时，会下意识按 Web 的习惯理解页面状态：

- 页面还在
- 组件还在
- 列表也还在
- 那应该一切都还在

但微信小程序不是这么工作的。

截至 `2026-03-31`，微信官方 `App` 和“小程序运行机制”文档里，几个关键点非常值得你记牢：

- `onLaunch` 全局只触发一次
- `onShow` 在小程序启动或从后台进入前台时触发
- `onHide` 在小程序从前台进入后台时触发
- 小程序进入后台一段时间后，目前官方文档写的是 `5 秒` 会进入“挂起”
- 挂起后 JS 执行会停止，事件和接口回调会在再次回前台时触发
- 挂起后如果长期不再进入前台，目前官方文档写的是 `30 分钟` 可能被销毁

这意味着什么？

这意味着你不能把“切后台再回来”理解成一个完全无感的空操作。

### 1. 切回前台时，最应该做的不是重刷整个页面，而是补关键状态

我更推荐你在 `App.vue` 的 `onShow` 里做“轻量恢复”，重点补下面几类东西：

1. 登录态是否还可用
2. 当前用户、学校、租户是否还匹配
3. 关键列表是否需要补拉
4. 切后台时发出的请求是否需要重新确认结果
5. 是否有必须重新弹起的授权或隐私流程

一个比较稳的骨架是这样：

```js
// App.vue
export default {
  globalData: {
    lastHideAt: 0
  },

  onHide() {
    this.globalData.lastHideAt = Date.now()
  },

  async onShow() {
    const hiddenDuration = Date.now() - (this.globalData.lastHideAt || 0)

    if (hiddenDuration < 1000) return

    await restoreCriticalState({
      hiddenDuration
    })
  }
}
```

然后把真正复杂的恢复逻辑下沉：

```js
export async function restoreCriticalState({ hiddenDuration }) {
  const tokenOk = hasUsableToken()

  if (!tokenOk) {
    await ensureBusinessLogin()
    return
  }

  if (hiddenDuration > 5 * 60 * 1000) {
    await refreshUserProfile()
    await refreshCurrentTenant()
  }

  await retryInterruptedTasks()
}
```

前后台恢复这组代码的关键不在语法，而在“恢复策略被显式写出来了”：

1. `onHide` 先记录 `lastHideAt`，说明你不再把“切后台再回来”当成一个无成本动作。
2. `onShow` 里先算 `hiddenDuration`，是为了区分“刚切一下回来”和“已经挂起一段时间后回来”。
3. `restoreCriticalState` 先看 token，再决定要不要补登录，说明恢复顺序仍然是业务态优先，不是先无脑重刷所有页面。
4. `hiddenDuration > 5 * 60 * 1000` 时才补用户资料和租户信息，体现的是“关键状态按时长分级恢复”，而不是每次回前台都重拉全站数据。
5. `retryInterruptedTasks` 的存在很重要，它提醒你提交、支付前置、上传这类动作切后台回来后，要有结果补偿思路。

### 2. 不要把“页面还显示着”理解成“数据一定还是新的”

维护久了你就会发现，前后台恢复最常见的问题通常是：

- 页面上的昵称还是旧的
- 切换学校后列表没刷新
- 权限刚被后台收回，按钮却还显示
- 支付、报名、提交类动作切后台回来后页面还停在“加载中”

这些本质上都在说明一件事：

`视图能显示，不代表业务状态已经重新确认。`

### 3. 后台期间的请求，不要默认它一定安全落地

对请求链路更稳的做法是：

1. 关键写操作要有幂等设计
2. 页面回前台时，对“刚刚提交成功但页面没拿到最终状态”的动作做补查
3. 对长链路任务保存任务单号或业务流水号
4. 前端不要只依赖一次回调去定义最终业务结果

尤其是报名、支付前置、审批提交、上传资料这类动作，回前台后的“结果补偿”往往比“请求发没发出去”更重要。

## 六、权限与隐私治理，最怕的不是没弹窗，而是项目上线后才发现链路不合规

如果前几篇更多是在讲“怎么接能力”，那这一篇就要再往前一步：

`能力能接，不等于链路就治理对了。`

截至 `2026-03-31`，微信官方“小程序隐私协议开发指南”里，下面几个点你一定要知道。

### 1. 先声明，再调用，不要反过来

官方文档明确写了：

- 处理用户个人信息的小程序，需要提示用户阅读隐私政策等收集使用规则
- 只有在隐私保护指引中声明过的信息类型，才能调用对应接口或组件
- 如果没声明，对应接口或组件会直接禁用

也就是说，项目里不能出现这种思路：

1. 功能先上线
2. 接口先调起来
3. 提审前再去补隐私声明

这在维护阶段是非常危险的，因为别人改了一个能力入口，很可能不知道它背后还依赖隐私声明。

### 2. 用户同意链路要有显式入口

官方文档给出的典型方式之一，就是使用：

```html
<button open-type='agreePrivacyAuthorization'>
  同意隐私协议
</button>
```

如果你用 `uni-app`，在 `mp-weixin` 端本质上也是走这套微信能力。

更实际一点说，你至少要在项目里明确两件事：

1. 隐私弹窗是谁来弹
2. 同意后哪些动作会继续执行

不要把它做成“某个页面里临时写的一段按钮逻辑”，最好收口成统一的隐私守卫。

### 3. 被动触发链路要接住：`wx.onNeedPrivacyAuthorization`

官方文档说明，从基础库 `2.32.3` 开始支持 `wx.onNeedPrivacyAuthorization`。

它的意义非常大：

- 当用户触发了一个微信侧还没有记录过同意的隐私接口调用时，会触发该事件
- 你可以在这个时机弹自己的隐私确认 UI
- 微信还提供了 `wx.requirePrivacyAuthorize` 用于模拟这类场景

一个更适合长期维护的接法是：

```js
// utils/privacy.js
export function registerPrivacyGuard() {
  // #ifdef MP-WEIXIN
  if (!wx.onNeedPrivacyAuthorization) return

  wx.onNeedPrivacyAuthorization((resolve, eventInfo) => {
    uni.$emit('privacy:need-authorize', {
      resolve,
      eventInfo
    })
  })
  // #endif
}
```

这段隐私守卫代码最有价值的地方，是它把“微信回调入口”和“页面展示入口”拆成了两层：

1. `registerPrivacyGuard` 只在微信环境注册一次全局监听，不让每个页面都自己重复接 `onNeedPrivacyAuthorization`。
2. `if (!wx.onNeedPrivacyAuthorization) return` 先做能力判断，可以兼容基础库差异。
3. 监听回调里不直接弹窗，而是统一 `uni.$emit('privacy:need-authorize', ...)`，这样页面层只管展示，治理层只管接入。
4. `resolve` 被继续透传出去，说明真正的“用户已同意，可以继续调用接口”还是由微信链路来闭环，而不是你自己伪造一个前端状态。

页面侧只负责展示：

```html
<button
  open-type='agreePrivacyAuthorization'
  @agreeprivacyauthorization='handleAgreePrivacyAuthorization'
>
  同意并继续
</button>
```

这个按钮虽然只有几行，但它体现的是合规链路上的两个边界：

1. `open-type='agreePrivacyAuthorization'` 说明“同意隐私协议”本身就是微信协议入口，不要把它写成普通按钮文案后就自认合规了。
2. `@agreeprivacyauthorization` 让页面层拿到一个明确事件，这样你才能把“用户同意后继续原动作”串回当前业务流程。

这样做的价值是，后面无论你把隐私能力挂到手机号、用户信息、位置还是别的能力入口，都不会变成“每个页面各弹各的”。

### 4. 低版本基础库不拦截，不代表你就可以不治理

官方文档同样提到：

- 低于 `2.32.3` 的基础库未集成隐私相关功能
- 低版本也不会拦截隐私接口调用

这句话千万不要误读成“低版本不用管”。

它真正表达的是：

- 老版本在技术表现上可能不会帮你拦
- 但你的项目治理和合规认知不能因此后退

### 5. 用户删掉最近使用记录后，隐私同步状态可能重来

官方文档专门说明了：

- 如果用户从“最近使用的小程序”里删除该小程序
- 历史同步状态会被清空
- 下次访问时需要重新同步隐私同意状态

这件事很容易被维护者忽略，因为平时开发环境里很少主动测这种场景。

但真实线上用户非常会触发它。

### 6. 常见报错别只记错误文案，要知道问题在哪一层

官方指南里列出的典型报错包括：

- `api scope is not declared in the privacy agreement`
- `appid privacy api banned`

你应该把它们理解成两种不同问题：

1. 声明没配对
2. 平台权限被禁用或回收

这两类都不是“前端再点一次试试”能解决的。

## 七、把状态治理落到日常开发里，我建议你固定成 9 条规则

如果你不想让项目一年后又回到满地 if else，我建议把下面这些规则直接写进团队共识里。

1. `wx.checkSession` 只校验微信 `session_key`，绝不拿它代替业务 token 校验。
2. 前端把 `code`、业务 token、用户缓存分开存，不要统称一个“loginInfo”对象糊在一起。
3. 本地只缓存“可丢失、可恢复、非强安全”的数据，不把旧缓存当成当前真相。
4. 页面回前台时优先补关键状态，不要默认界面还在就说明链路没问题。
5. 写操作必须有结果补偿思路，尤其是提交、支付前置、上传、报名这类动作。
6. 用户身份、权限、租户、学校等关键信息，必须能被服务端重新确认。
7. 隐私接口上线前先核对后台声明，再核对前端同意链路，不走“先调通再补文档”。
8. 隐私守卫尽量全局收口，不要让每个页面各自维护一套弹窗逻辑。
9. 每次做登录态或授权改造时，都至少手测“切后台回来”“切账号”“清缓存重进”“从最近使用删除后再进”这几类场景。

## 八、最后给你一个判断模型：以后遇到问题，先问自己是哪一层坏了

以后你再遇到下面这些问题：

- 为什么首页明明有 token 还被打回登录页
- 为什么切后台回来后按钮权限错了
- 为什么用户昨天授权过今天又弹一次
- 为什么缓存里有资料但接口还说未登录

不要第一反应就说：

- “微信抽风”
- “uni-app 有坑”
- “缓存不稳定”

你先按这 4 层问自己：

1. 是微信登录态失效了
2. 还是业务 token 失效了
3. 还是本地缓存过时了
4. 还是隐私/权限链路没有重新确认

只要这 4 层分得开，项目再复杂，问题也会比现在好查很多。

## 参考资料

- 微信开放文档 `wx.checkSession`：<https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.checkSession.html>
- 微信开放文档 `wx.login`：<https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html>
- 微信开放文档 `小程序登录`：<https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html>
- 微信开放文档 `App`：<https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html>
- 微信开放文档 `小程序运行机制`：<https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/operating-mechanism.html>
- 微信开放文档 `wx.getStorageInfoSync`：<https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.getStorageInfoSync.html>
- 微信开放文档 `小程序隐私协议开发指南`：<https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/PrivacyAuthorize.html>
