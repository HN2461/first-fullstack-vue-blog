---
title: "企业微信小程序登录接入方案_wx.qy.login_code2Session"
slug: "wx-qy-login-code2session-56702606"
summary: ""
category: "企业微信"
tags: []
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d29208a2b1c68f2cac7d8"
originalSlug: "wx-qy-login-code2session-56702606"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 企业微信小程序登录接入方案\_wx.qy.login_code2Session

> 官方文档：
>
> - wx.qy.login：https://developer.work.weixin.qq.com/document/path/91506
> - code2Session：https://developer.work.weixin.qq.com/document/path/91507

---

## 1. 登录流程总览

```
前端小程序                    后端服务                    企业微信服务端
    │                            │                              │
    │  wx.qy.login()             │                              │
    │──────────────────────────► │                              │
    │  返回 code（5分钟有效）     │                              │
    │◄────────────────────────── │                              │
    │                            │                              │
    │  POST /api/login {code}    │                              │
    │──────────────────────────► │                              │
    │                            │  GET code2Session            │
    │                            │─────────────────────────────►│
    │                            │  返回 corpId + userId        │
    │                            │◄─────────────────────────────│
    │                            │                              │
    │                            │  查询/创建用户，生成 token    │
    │                            │                              │
    │  返回 token + 用户信息      │                              │
    │◄────────────────────────── │                              │
```

---

## 2. 前端实现

### 2.1 基础登录调用

```javascript
// util/auth/wxworkLogin.js

/**
 * 企业微信小程序登录
 * @returns {Promise<string>} code
 */
export const getWxworkCode = () => {
  return new Promise((resolve, reject) => {
    wx.qy.login({
      // 自建应用不填 suiteId
      // suiteId: 'wwxxxxxx', // 第三方应用才需要填
      success: (res) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error("wx.qy.login 失败：" + res.errMsg));
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

/**
 * 企业微信小程序完整登录流程
 */
export const wxworkLogin = async () => {
  try {
    const code = await getWxworkCode();
    // 将 code 发给后端换取 token
    const res = await uni.$uv.http.post("/api/wxwork/login", { code });
    if (res.data.code === 200) {
      // 存储 token 和用户信息
      uni.setStorageSync("token", res.data.data.token);
      uni.setStorageSync("userInfo", res.data.data.userInfo);
      return res.data.data;
    } else {
      throw new Error(res.data.msg || "登录失败");
    }
  } catch (err) {
    uni.showToast({ title: "登录失败，请重试", icon: "error" });
    throw err;
  }
};
```

### 2.2 在 App.vue 中调用

```javascript
// App.vue
import { wxworkLogin } from "@/util/auth/wxworkLogin.js";

export default {
  onLaunch() {
    // #ifdef MP-WEIXIN
    // 判断是否在企业微信环境
    const systemInfo = uni.getSystemInfoSync();
    if (systemInfo.environment === "wxwork") {
      wxworkLogin();
    }
    // #endif
  },
};
```

### 2.3 检测企业微信环境

```javascript
/**
 * 判断当前是否在企业微信小程序环境
 * 企业微信小程序与普通微信小程序共用 MP-WEIXIN 平台
 * 通过 wx.qy 是否存在来区分
 */
export const isWxworkEnv = () => {
  // #ifdef MP-WEIXIN
  return typeof wx !== "undefined" && typeof wx.qy !== "undefined";
  // #endif
  return false;
};
```

---

## 3. 后端接口说明（前后端对接）

### 3.1 code2Session 接口

```
GET https://qyapi.weixin.qq.com/cgi-bin/miniprogram/jscode2session
  ?access_token=ACCESS_TOKEN
  &js_code=CODE
  &grant_type=authorization_code
```

**返回值**：

```json
{
  "corpid": "ww1234567890abcdef",
  "userid": "zhangsan",
  "session_key": "kJtdi6RF+Dv67QkbLlPGjw==",
  "errcode": 0,
  "errmsg": "ok"
}
```

**注意事项**：

- `access_token` 必须是与小程序关联的企业微信应用的 access_token
- 返回的是 `userid`（企业内账号），不是 `openId`
- 第三方应用返回的 `userid` 是加密的，需要解密
- `session_key` 不能下发到前端

### 3.2 前端登录接口约定

```
POST /api/wxwork/login
Body: { code: "xxx" }

Response:
{
  "code": 200,
  "data": {
    "token": "Bearer xxx",
    "userInfo": {
      "userId": "zhangsan",
      "name": "张三",
      "avatar": "https://xxx.com/avatar.jpg",
      "corpId": "ww1234567890abcdef"
    }
  }
}
```

---

## 4. 与普通微信小程序登录的差异

| 对比项            | 普通微信小程序                                 | 企业微信小程序                                                   |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| 登录 API          | `wx.login()`                                   | `wx.qy.login()`                                                  |
| code2Session URL  | `https://api.weixin.qq.com/sns/jscode2session` | `https://qyapi.weixin.qq.com/cgi-bin/miniprogram/jscode2session` |
| 返回用户标识      | `openId`                                       | `userId`（企业账号）                                             |
| access_token 来源 | 小程序 appId + secret                          | 企业 corpId + 应用 secret                                        |
| 第三方应用        | 不涉及                                         | userId 是加密的                                                  |

---

## 5. 常见问题

### Q1：wx.qy 不存在，调用报错

**原因**：当前不在企业微信环境，或企业微信版本过低。

**处理**：

```javascript
if (typeof wx.qy === "undefined") {
  // 降级到普通微信登录，或提示用户在企业微信中打开
  uni.showToast({ title: "请在企业微信中打开", icon: "none" });
  return;
}
```

### Q2：code2Session 返回 40029 invalid code

**原因**：code 已过期（5分钟有效）或已被使用过。

**处理**：重新调用 `wx.qy.login` 获取新 code。

### Q3：access_token 获取失败

**原因**：corpId 或 Secret 配置错误，或可信 IP 未配置。

**处理**：

1. 检查 corpId 和 Secret 是否匹配
2. 检查服务器 IP 是否在企业微信管理后台的「可信 IP」列表中

### Q4：第三方应用 userId 是加密的

**原因**：第三方应用出于安全考虑，userId 会加密返回。

**处理**：后端调用解密接口 `/cgi-bin/user/convert_to_userid` 解密。

---

## 6. 会话保持建议

参考企业微信官方建议（OAuth2 缓存方案）：

1. 前端登录成功后，将 token 存入本地存储
2. 每次请求携带 token，后端校验有效性
3. token 过期时，重新调用 `wx.qy.login` 刷新
4. 不要频繁调用 `wx.qy.login`，优先复用本地 token

```javascript
// 登录态检查示例
export const checkLoginStatus = async () => {
  const token = uni.getStorageSync("token");
  if (token) {
    // 校验 token 有效性
    try {
      await uni.$uv.http.get("/api/user/info");
      return true;
    } catch {
      // token 失效，重新登录
    }
  }
  await wxworkLogin();
};
```
