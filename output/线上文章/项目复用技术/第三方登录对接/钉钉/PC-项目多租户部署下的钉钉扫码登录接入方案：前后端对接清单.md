---
title: "PC 项目多租户部署下的钉钉扫码登录接入方案：前后端对接清单"
slug: "pc-pc-f80d8c7b"
summary: "面向\"一套代码、多租户独立部署、按域名返回租户配置\"的 PC 项目，梳理钉钉第三方企业应用扫码登录的接入思路、配置项、接口约定与常见坑位。"
category: "钉钉"
tags:
  - "钉钉扫码登录"
  - "第三方企业应用"
  - "PC 项目"
  - "多租户部署"
  - "前后端联调"
status: "draft"
sortOrder: 110
cover: ""
originalId: "6a2d29208a2b1c68f2cac786"
originalSlug: "pc-pc-f80d8c7b"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# PC 项目多租户部署下的钉钉扫码登录接入方案：前后端对接清单

> 适用场景
> 一套前端代码，部署到多个租户（如多所学校）各自的服务器上。
> 每个租户一个独立域名。
> 前端构建阶段只切换 2 个基础变量：API 域名 + WebSocket 域名。
> 页面打开后，前端根据当前域名请求后端，后端返回该租户的基础信息、权限配置和第三方登录参数。

---

## 一、先说结论

这种多租户架构下，钉钉登录建议这样设计：

1. 应用类型按**第三方企业应用**设计（不是企业内部应用）
2. 保持一套代码 + 多租户独立部署 + 不同域名
3. 前端构建阶段只保留 `API_BASE_URL` 和 `WS_BASE_URL`
4. 租户差异和钉钉登录参数全部由后端按域名动态返回
5. 用户绑定主键优先使用 `corpId + unionId`
6. 第一阶段先把登录链路跑通：`authCode → userAccessToken → 用户信息 → 自己的登录态`

一句话记忆：

> 前端只负责拿配置、展示二维码、接住回调；后端负责换钉钉身份、绑定租户用户、签发自己的登录态。

---

## 二、为什么要用第三方企业应用

如果产品要给多个不同组织（不同钉钉企业）使用，就必须用**第三方企业应用**。

钉钉官方明确说明：**企业内部应用不支持跨组织授权登录**。

只要目标是"多个租户都能用钉钉登录同一套产品"，主方案就必须按第三方企业应用设计。

---

## 三、这套架构和钉钉登录完全兼容

按域名返回租户配置的架构和钉钉扫码登录不冲突，真正需要补的只有三件事：

1. 后端返回租户基础信息时，顺便返回钉钉登录配置
2. 登录回调页固定在当前租户域名下
3. 前后端统一钉钉字段命名和登录失败分支

---

## 四、官方主线登录流程

截至 2026-03-31，钉钉网页登录推荐按下面这条链路理解：

```
前端展示钉钉扫码入口
  → 用户扫码或跳转钉钉授权页
  → 钉钉回调到当前租户域名下的 redirect_uri
  → 前端从地址栏拿到 authCode
  → 前端把 authCode 发给后端
  → 后端调"获取用户 token"接口，换用户级 accessToken
  → 后端调"获取用户通讯录个人信息"接口，拿到用户身份
  → 后端根据 corpId + unionId 查本地账号
  → 后端生成自己的 session/jwt
  → 前端登录完成，进入系统
```

简记：`二维码/授权页 → authCode → userAccessToken → 用户信息 → 本地登录态`

---

## 五、不要先把旧接口当主线

钉钉开放平台里还能搜到旧接口"根据 sns 临时授权码获取用户信息"，但这个接口已经被放在历史文档路径下，和新网页登录主线不完全一致。

新链路重点看这两个接口：
- 获取用户 token
- 获取用户通讯录个人信息

如果后端还在走旧链路，后面越改越乱。

---

## 六、前端构建配置策略

构建阶段只保留：
- `API_BASE_URL`
- `WS_BASE_URL`

运行阶段由后端按域名返回：
- 租户基础信息（名称、Logo、主题色）
- 是否开启钉钉登录
- 钉钉登录参数（clientId、corpId、redirectUri 等）
- 登录后可见模块

钉钉登录的 `clientId`、`corpId`、`redirectUri` 不建议长期写死在前端环境文件里。联调阶段可以先写死，正式上线前改成后端返回。

---

## 七、前后端统一的字段命名约定

钉钉文档里的叫法很乱（Client ID / AppKey / SuiteKey 混用），建议项目内部统一：

### 应用级字段
- `clientId`（钉钉应用标识，即 Client ID / AppKey）
- `clientSecret`

### 租户/组织级字段
- `corpId`（租户在钉钉里的组织标识）

### 登录过程字段
- `authCode`（钉钉回调返回的临时授权码）
- `userAccessToken`
- `refreshToken`

### 用户标识字段
- `unionId`（跨应用唯一标识，推荐作为绑定主键）
- `openId`（应用内唯一标识）
- `mobile`（可能脱敏，不建议作为主键）

---

## 八、用户绑定主键策略

### 租户主键
- 系统内部的租户 ID
- 该租户在钉钉里的 `corpId`

### 用户绑定主键
第一阶段优先用：`corpId + unionId`

原因：
- `corpId` 确保知道用户属于哪个租户
- `unionId` 比手机号更稳定，不会脱敏
- `openId` 可以存，但不建议单独作为唯一主键

不建议第一阶段用手机号、昵称、纯 `openId` 做唯一主键。第三方企业应用场景下手机号可能脱敏。

---

## 九、租户初始化接口建议返回的字段

登录页初始化时，后端按域名返回租户配置，建议把钉钉登录字段一起带回来：

```json
{
  "tenantId": "tenant_001",
  "tenantName": "某某学校",
  "logo": "https://xxx/logo.png",
  "auth": {
    "dingLoginEnabled": true,
    "dingLoginMode": "qrcode",
    "dingClientId": "dingxxxxxx",
    "dingCorpId": "dingyyyyyy",
    "dingRedirectUri": "https://school-a.example.com/#/dingTalkLogin",
    "dingScope": "openid corpid",
    "dingPrompt": "consent"
  }
}
```

字段说明：
- `dingLoginEnabled`：是否显示钉钉登录入口，`false` 时前端直接隐藏按钮
- `dingLoginMode`：`qrcode`（二维码）或 `redirect`（跳转授权页）
- `dingClientId`：钉钉应用标识，前端拼登录地址要用
- `dingCorpId`：租户的钉钉组织标识，有值时 scope 追加 `corpid`
- `dingRedirectUri`：必须是当前租户域名下的地址
- `dingScope`：第一版建议固定 `openid corpid`
- `dingPrompt`：第一版建议固定 `consent`

---

## 十、最少对接字段速查表

### 1. 初始化接口最少返回这些

| 字段 | 必需 | 用途 |
| --- | --- | --- |
| `dingLoginEnabled` | 是 | 是否显示钉钉登录入口 |
| `dingClientId` | 是 | 前端拼登录地址 |
| `dingCorpId` | 建议有 | 指定租户组织，scope 追加 corpid |
| `dingRedirectUri` | 是 | 钉钉授权回调地址 |
| `dingScope` | 是 | 第一版固定 `openid corpid` |
| `dingPrompt` | 是 | 第一版固定 `consent` |

### 2. 回调登录接口前端传这些

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `authCode` | 是 | 钉钉回调的临时授权码，`code` 和 `authCode` 取任一 |
| `state` | 是 | 防重放，回调页必须校验 |
| `tenantId` | 建议有 | 明确当前租户上下文，也可让后端按域名判断 |

### 3. 回调登录接口后端返回这些

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `token` | 是 | 自己系统的登录态，不要把钉钉 token 直接给前端 |
| `userInfo` | 是 | 至少带本地用户 ID、姓名、租户 ID |
| `menus` | 建议有 | 登录后页面权限 |
| `bindStatus` | 建议有 | 是否已完成本地账号绑定，未绑定时走补绑流程 |

### 4. 后端内部最少要拿到这些钉钉字段

| 字段 | 来源 | 是否落库 | 用途 |
| --- | --- | --- | --- |
| `corpId` | 用户 token 接口 | 是 | 校验授权组织是否匹配当前租户 |
| `unionId` | 用户通讯录个人信息接口 | 是 | 跨应用唯一标识，作为绑定主键 |
| `openId` | 用户通讯录个人信息接口 | 建议存 | 便于排查问题 |
| `mobile` | 用户通讯录个人信息接口 | 可选 | 辅助匹配，不建议作为主键 |

---

## 十一、前端如何拼授权地址

如果后端不直接返回完整 `loginUrl`，前端自己拼接时用这套参数：

```
https://login.dingtalk.com/oauth2/auth
  ?redirect_uri=<urlencode后的回调地址>
  &response_type=code
  &client_id=<clientId>
  &scope=openid%20corpid
  &state=<随机字符串>
  &prompt=consent
  &corpId=<corpId>
```

关键点：
1. `redirect_uri` 必须 urlencode
2. `response_type` 固定是 `code`
3. `scope` 官方只支持 `openid` 或 `openid corpid`，已知租户时用 `openid corpid`
4. `state` 必须带，并在回调页校验
5. 已知 `corpId` 时建议带上，可以限定扫码用户必须属于该组织

---

## 十二、二维码模式的关键坑

钉钉官方要求：**嵌入二维码的页面必须和 redirect_uri 页面同源**。

不要做成：
- 登录页在租户域名
- 回调页却跳到另一个认证域名
- 然后还想在当前页内嵌二维码

这种情况很容易出现"二维码能扫、授权后没反应"的问题。

一租户一域名的部署方式天然满足同源要求，登录页和回调页都在当前租户域名下。

官方二维码 SDK：
```html
<script src="https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js"></script>
```

---

## 十三、回调页应该做什么

建议单独做一个固定路由（如 `/#/dingTalkLogin`），这个页面只做三件事：

1. 解析 URL 参数：`authCode`（或 `code`）、`state`、`error`
2. 校验 `state`
3. 把 `authCode` 发给后端登录接口

注意：钉钉文档说 `code` 和 `authCode` 一致，取任一即可：
```js
const authCode = params.get('authCode') || params.get('code')
```

Hash 路由下参数可能在 `window.location.hash` 里，需要从 hash 里解析：
```js
const hash = window.location.hash || ''
const hashQuery = hash.includes('?') ? hash.substring(hash.indexOf('?') + 1) : ''
const authCode = new URLSearchParams(hashQuery).get('authCode')
  || new URLSearchParams(hashQuery).get('code')
```

---

## 十四、后端登录接口内部应完成什么

```
1. 根据请求域名确认租户
2. 校验该租户是否开启钉钉登录
3. 用 authCode 调"获取用户 token"接口
   → 拿到 accessToken、refreshToken、expireIn、corpId
4. 调"获取用户通讯录个人信息"接口
   → 拿到 unionId、openId、mobile、nick
5. 校验 corpId 是否和当前租户匹配
6. 根据 corpId + unionId 查本地账号绑定关系
7. 签发自己的登录态（token + userInfo + menus）
```

---

## 十五、建议统一的失败场景和错误码

前后端提前约定失败分支，联调时省很多事：

| 错误码 | 含义 |
| --- | --- |
| `TENANT_NOT_FOUND` | 域名无法匹配租户 |
| `DING_LOGIN_DISABLED` | 当前租户未开启钉钉登录 |
| `DING_CALLBACK_INVALID` | authCode/state 异常 |
| `DING_AUTH_FAILED` | 钉钉换 token 或取用户信息失败 |
| `DING_CORP_NOT_MATCHED` | 用户授权出来的 corpId 不是当前租户 |
| `USER_NOT_BOUND` | 该钉钉用户未绑定本地账号 |
| `USER_DISABLED` | 本地账号已禁用 |
| `USER_NOT_IN_TENANT` | 账号存在但不属于当前租户 |

---

## 十六、关于手机号的建议

第三方企业应用无法获取用户完整手机号，可能会脱敏。

第一阶段不要依赖"扫码后拿手机号去匹配本地用户"，更稳的做法是先通过 `corpId + unionId` 找绑定关系。手机号可以用于展示和辅助校验，但不建议作为唯一登录主键。

---

## 十七、落地顺序建议

```
1. 前端先写死一套 dingConfig 做联调
2. 后端确认应用类型（第三方企业应用）和主链路（新接口）
3. 后端统一登录接口返回格式
4. 前端完成：登录页入口 + 回调页 + 错误提示
5. 后端把钉钉参数并入租户初始化配置
6. 前端把写死配置改成后端返回变量
```

---

## 十八、安全风险：自动登录模式的账号串用问题

### 问题描述

`DTFrameLogin` SDK 支持两种模式：
- **扫码登录**：渲染二维码 iframe，用户用手机扫码
- **自动登录**：在弹窗内嵌入钉钉授权页 iframe，读取浏览器里已有的钉钉登录 cookie，静默完成授权

### 安全隐患

自动登录在共享电脑或公共机房场景下存在账号串用风险：

1. 用户 A 扫码登录后，浏览器留下了钉钉的登录 cookie
2. 用户 A 离开，没有清除浏览器数据
3. 用户 B 打开登录页，点击"自动登录"
4. 钉钉授权页读取到用户 A 的 cookie，以用户 A 的身份完成授权
5. 用户 B 登入了用户 A 的账号

### 为什么无法从前端修复

- 钉钉的登录 cookie 属于 `login.dingtalk.com` 域，前端无法跨域读取或清除
- 钉钉的 `prompt` 参数只支持 `consent`，不支持 `prompt=login`（强制重新输入账号密码）
- 加了 `prompt=consent` 也只是多弹一个确认页，不会要求重新选择账号

### 使用建议

**一人一机场景**（大多数企业/学校固定工位）：可以保留自动登录，显著提升登录效率。

**公共机房/共享电脑场景**：
- 管理员在后台关闭钉钉登录入口，或
- 用户使用完毕后手动清除浏览器数据

### 后端加固方案（彻底消除串用风险）

如果需要彻底解决，正确做法是后端保障：
1. 钉钉 openId 必须已绑定到本地账号，未绑定的钉钉身份一律拒绝登录
2. 授权出来的 corpId 必须和当前租户匹配

在以上两个后端保障到位的前提下，即使用了别人的 cookie，也只能登入那个 cookie 对应的账号，不会登入当前用户的账号。

---

## 十九、官方资料

- [钉钉开放平台《实现网页方式登录应用》](https://open.dingtalk.com/document/dingstart/tutorial-obtaining-user-personal-information)
- [钉钉开放平台《获取用户 token》](https://open.dingtalk.com/document/development/obtain-user-token)
- [钉钉开放平台《获取用户通讯录个人信息》](https://open.dingtalk.com/document/development/dingtalk-retrieve-user-information)
- [钉钉开放平台《应用类型介绍》](https://open.dingtalk.com/document/dingstart/application-type-introduction)
- [钉钉开放平台《添加接口调用权限》](https://open.dingtalk.com/document/development/add-api-permission)
