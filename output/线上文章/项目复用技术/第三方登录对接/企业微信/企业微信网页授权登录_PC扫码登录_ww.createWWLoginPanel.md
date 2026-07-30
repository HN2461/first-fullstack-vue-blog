---
title: "企业微信网页授权登录_PC扫码登录_ww.createWWLoginPanel"
slug: "pc-pc-ww-createwwloginpanel-55975a93"
summary: ""
category: "企业微信"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "企业微信"
tags: []
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d29208a2b1c68f2cac7d2"
originalSlug: "pc-pc-ww-createwwloginpanel-55975a93"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.464Z"
updatedAt: "2026-06-13T14:03:18.908Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 企业微信网页授权登录\_PC扫码登录\_ww.createWWLoginPanel

> 官方文档：
>
> - 登录简介：https://developer.work.weixin.qq.com/document/path/98151
> - Web 登录组件：https://developer.work.weixin.qq.com/document/path/98152

---

## 1. 这是什么场景

**网页授权登录**是指在**系统浏览器（PC 端）**中打开的网站，引导成员使用企业微信扫码或快速登录，获取成员身份信息。

与 H5 微应用 OAuth2 的区别：

| 对比项     | H5 微应用 OAuth2                              | 网页授权登录                                 |
| ---------- | --------------------------------------------- | -------------------------------------------- |
| 打开环境   | 企业微信内置浏览器                            | 系统浏览器（PC/移动端均可）                  |
| 授权方式   | 自动重定向，静默/手动授权                     | 扫码登录 或 企业微信桌面端快速登录           |
| 授权 URL   | `open.weixin.qq.com/connect/oauth2/authorize` | `login.work.weixin.qq.com/wwlogin/sso/login` |
| 适用场景   | 企业微信内打开的 H5 页面                      | PC 管理后台、独立 Web 系统                   |
| 典型场景   | 手机端 H5 微应用                              | PC 管理后台、独立 Web 系统                   |

---

## 2. 登录方式

企业微信网页授权登录支持两种方式：

### 方式一：使用 @wecom/jssdk 内嵌登录组件（推荐）

将企业微信登录组件内嵌到网站中，用户无需跳转到企业微信域下，直接在网站内完成登录。

- 支持二维码扫码登录
- 满足条件时自动显示**快速登录**（企业微信桌面端一键登录）
- 需要 `@wecom/jssdk >= 2.3.2`

### 方式二：构造登录链接跳转

在新窗口打开企业微信登录页，用户授权后携带 `auth code` 跳转回 `redirect_uri`。

---

## 3. 开发前准备

### 3.1 管理后台开启授权登录

1. 登录企业微信管理后台 → 进入目标自建应用
2. 点击「企业微信授权登录」
3. 点击「设置授权回调域」，填入回调域名，保存
4. 要求：授权回调域必须与访问链接的域名完全一致（含端口）

### 3.2 记录关键信息

- **corpId**：我的企业 → 企业信息 → 企业 ID
- **agentId**：应用详情页的 AgentId（`login_type=CorpApp` 时需要）

---

## 4. 方式一：内嵌登录组件

### 4.1 安装 SDK

```bash
npm install @wecom/jssdk
```

或 CDN：

```html
<script src="https://wwcdn.weixin.qq.com/node/open/js/wecom-jssdk-2.3.4.js"></script>
```

### 4.2 初始化登录组件

```javascript
import * as ww from "@wecom/jssdk";

ww.createWWLoginPanel({
  el: "#wx-login-container", // 挂载的 DOM 元素选择器或 DOM 节点
  params: {
    login_type: "CorpApp", // 企业自建应用登录
    appid: "ww1234567890abcdef", // 企业 corpId
    agentid: "1000002", // 应用 agentId
    redirect_uri: encodeURIComponent("https://your-domain.com/callback"),
    state: "random_state_string", // 建议用随机数，防 CSRF
    lang: "zh",
  },
  onCheckWeComLogin({ isWeComLogin }) {
    // 判断用户是否已登录企业微信桌面端
    // isWeComLogin=true 时可直接显示快速登录面板，提升体验
    console.log("企业微信桌面端登录状态：", isWeComLogin);
  },
  onLoginSuccess({ code }) {
    // 登录成功，拿到 auth code，发给后端换取用户信息
    handleLoginCode(code);
  },
  onLoginFail(err) {
    console.error("登录失败：", err);
  },
});
```

### 4.3 登录组件 UI 规范

- 默认面板尺寸：480×416px
- 可通过 `panel_size` 参数指定为小面板：320×380px
- 不支持自定义样式

### 4.4 快速登录显示条件

满足以下全部条件时，登录组件会显示快速登录面板（企业微信桌面端一键登录）：

1. 用户企业微信桌面端（Win/Mac）版本 ≥ 3.1.23，且已运行并登录
2. 开发者网页域名使用 HTTPS 协议
3. `login_type=CorpApp` 场景下，当前登录用户在应用可见范围内
4. 网页在桌面端系统浏览器中打开（不支持企业微信内置 Webview）
5. `@wecom/jssdk >= 2.3.2`（Chrome 142+ 需要此版本）

---

## 5. 方式二：构造登录链接

```javascript
/**
 * 构造企业微信网页授权登录链接
 * @param {string} corpId - 企业 corpId
 * @param {string} agentId - 应用 agentId（CorpApp 时必填）
 * @param {string} redirectUri - 回调地址（需 URLEncode）
 * @param {string} state - 防 CSRF 随机串
 */
export const buildWWLoginUrl = ({
  corpId,
  agentId,
  redirectUri,
  state = "",
}) => {
  const encodedUri = encodeURIComponent(redirectUri);
  const encodedState = encodeURIComponent(state);
  return `https://login.work.weixin.qq.com/wwlogin/sso/login?login_type=CorpApp&appid=${corpId}&agentid=${agentId}&redirect_uri=${encodedUri}&state=${encodedState}`;
};
```

**登录链接参数说明**：

| 参数           | 必填 | 说明                                                     |
| -------------- | ---- | -------------------------------------------------------- |
| `login_type`   | 是   | `CorpApp`：企业自建/代开发应用；`ServiceApp`：服务商登录 |
| `appid`        | 是   | `CorpApp` 填企业 corpId；`ServiceApp` 填登录授权 SuiteID |
| `agentid`      | 否   | `login_type=CorpApp` 时填写                              |
| `redirect_uri` | 是   | 需 URLEncode，域名必须配置为可信域名                     |
| `state`        | 否   | 防 CSRF，建议填随机数+session，需 URLEncode              |
| `lang`         | 否   | `zh`：中文；`en`：英文                                   |

用户授权后跳转到：

```
redirect_uri?code=CODE&state=STATE
```

---

## 6. 后端用 code 换取用户信息

登录成功后拿到的 `code`（auth code），后端调用接口换取用户信息，接口与 H5 微应用 OAuth2 相同：

```
GET https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo
  ?access_token=ACCESS_TOKEN
  &code=CODE
```

返回：

```json
{
  "errcode": 0,
  "errmsg": "ok",
  "userid": "zhangsan"
}
```

> 详细说明见：`企业微信H5微应用-从0到1开发指南.md` 第 4 节

---

## 7. 常见错误码

| 错误码   | 含义                                        |
| -------- | ------------------------------------------- |
| `-31020` | redirect_uri 与配置的登录授权回调域名不一致 |
| `-31027` | appid 参数错误                              |
| `-31028` | agentid 参数错误                            |
| `-31033` | 校验请求来源错误                            |
| `-31039` | redirect_uri 与配置的可信域名不一致         |
| `-31040` | login_type 参数错误                         |

---

## 8. 与 H5 微应用 OAuth2 的选择建议

| 场景                             | 推荐方案                                                          |
| -------------------------------- | ----------------------------------------------------------------- |
| 在企业微信 App 内打开的 H5 页面  | H5 微应用 OAuth2（`open.weixin.qq.com/connect/oauth2/authorize`） |
| PC 浏览器打开的管理后台/Web 系统 | 网页授权登录（`login.work.weixin.qq.com/wwlogin/sso/login`）      |
| 需要嵌入登录组件，不跳转         | `ww.createWWLoginPanel`                                           |
| 需要跳转到企业微信登录页         | 构造登录链接                                                      |
