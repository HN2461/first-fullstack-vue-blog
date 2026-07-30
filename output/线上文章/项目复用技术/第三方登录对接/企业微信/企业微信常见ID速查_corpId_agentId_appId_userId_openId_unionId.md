---
title: "企业微信常见ID速查_corpId_agentId_appId_userId_openId_unionId"
slug: "id-corpid-agentid-appid-userid-openid-unionid-e704ba37"
summary: ""
category: "企业微信"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "企业微信"
tags: []
status: "published"
sortOrder: 100
cover: ""
originalId: "6a2d29208a2b1c68f2cac7c0"
originalSlug: "id-corpid-agentid-appid-userid-openid-unionid-e704ba37"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.454Z"
updatedAt: "2026-06-13T14:03:18.894Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 企业微信常见ID速查\_corpId_agentId_appId_userId_openId_unionId

> 参考钉钉文档：`docs/钉钉/01-知识文档/uni-app迁移钉钉时最容易搞混的各种id_corpId_agentId_miniAppId_clientId_userId_unionId_openid.md`

---

## 1. 核心 ID 速查表

| ID 名称     | 含义           | 获取位置                       | 用途                                 | 唯一性            |
| ----------- | -------------- | ------------------------------ | ------------------------------------ | ----------------- |
| **corpId**  | 企业 ID        | 管理后台 → 我的企业 → 企业信息 | 标识企业，调用服务端 API 必传        | 企业唯一          |
| **agentId** | 应用 ID        | 应用管理 → 应用详情            | 标识企业内的某个应用                 | 企业内唯一        |
| **appId**   | 小程序 appId   | 微信公众平台                   | 企业微信小程序关联的微信小程序 ID    | 全局唯一          |
| **userId**  | 成员账号       | code2Session 返回 / 通讯录接口 | 企业内唯一标识成员，对应管理端账号   | 企业内唯一        |
| **openId**  | 外部联系人标识 | 外部联系人接口                 | 标识企业外部用户（客户）             | 企业+外部用户唯一 |
| **unionId** | 跨应用用户标识 | 需绑定微信开放平台             | 同一微信开放平台下多应用统一用户标识 | 开放平台下唯一    |

---

## 2. 详细说明

### 2.1 corpId（企业 ID）

**定义**：企业微信的企业唯一标识。

**获取方式**：

- 管理后台 → 我的企业 → 企业信息 → 企业 ID
- 格式：`ww` 开头，例如 `wwabcd1234567890`

**使用场景**：

- 服务端调用 API 时必传（如获取 access_token）
- 前端 JSSDK `wx.config` 的 `appId` 参数填 corpId
- 前端 JSSDK `wx.agentConfig` 的 `corpid` 参数填 corpId

**注意事项**：

- corpId 是企业级别的，不是应用级别的
- 一个企业只有一个 corpId，所有应用共用

---

### 2.2 agentId（应用 ID）

**定义**：企业内某个自建应用的唯一标识。

**获取方式**：

- 管理后台 → 应用管理 → 自建 → 选择应用 → AgentId
- 格式：纯数字，例如 `1000002`

**使用场景**：

- 获取应用的 access_token（需要 corpId + Secret）
- 前端 JSSDK `wx.agentConfig` 的 `agentid` 参数
- 发送应用消息时指定应用

**注意事项**：

- 每个应用有独立的 agentId 和 Secret
- 不同应用的 agentId 不同，不能混用

---

### 2.3 appId（小程序 appId）

**定义**：企业微信小程序关联的微信小程序 appId。

**获取方式**：

- 微信公众平台 → 开发 → 开发管理 → 开发设置 → AppID(小程序ID)
- 格式：`wx` 开头，例如 `wx1234567890abcdef`

**使用场景**：

- uni-app `manifest.json` 中 `mp-weixin.appid` 配置
- 企业微信管理后台关联小程序时填写

**注意事项**：

- 企业微信小程序本质上是微信小程序，复用微信小程序的 appId
- 企业微信小程序编译时使用 `MP-WEIXIN` 平台，不是独立平台

---

### 2.4 userId（成员账号）

**定义**：企业内成员的唯一标识，对应管理端的账号。

**获取方式**：

- 小程序：`wx.qy.login` → `code2Session` 返回 `userid`
- H5：OAuth2 授权 → 后端换取 `UserId`
- 通讯录接口：`/cgi-bin/user/get`

**使用场景**：

- 标识企业内成员身份
- 发送消息时指定接收人
- 调用通讯录接口获取成员详细信息

**注意事项**：

- userId 是企业内唯一的，不是全局唯一
- 不同企业的 userId 可能重复
- 第三方应用获取的 userId 是加密的，需要解密

---

### 2.5 openId（外部联系人标识）

**定义**：企业外部联系人（客户）的标识。

**获取方式**：

- 外部联系人接口：`/cgi-bin/externalcontact/get`

**使用场景**：

- 标识企业的外部客户
- 客户联系功能、客户群管理

**注意事项**：

- openId 是企业+外部用户维度唯一
- 与微信小程序的 openId 不是同一个概念

---

### 2.6 unionId（跨应用用户标识）

**定义**：同一微信开放平台下多个应用的统一用户标识。

**获取方式**：

- 需要将企业微信绑定到微信开放平台
- 通过接口获取成员信息时返回

**使用场景**：

- 打通企业微信、微信小程序、公众号的用户体系
- 实现跨应用的用户识别

**注意事项**：

- 必须绑定微信开放平台才有 unionId
- 同一开放平台下的所有应用，同一用户的 unionId 相同

---

## 3. 常见混淆场景

### 场景 1：前端 JSSDK 配置

```javascript
// wx.config 使用 corpId
wx.config({
  appId: "ww1234567890abcdef", // 这里是 corpId，不是 appId
  // ...
});

// wx.agentConfig 使用 corpId + agentId
wx.agentConfig({
  corpid: "ww1234567890abcdef", // corpId
  agentid: "1000002", // agentId
  // ...
});
```

### 场景 2：服务端获取 access_token

```javascript
// 获取应用的 access_token
GET https://qyapi.weixin.qq.com/cgi-bin/gettoken
  ?corpid=ww1234567890abcdef  // corpId
  &corpsecret=SECRET           // 应用的 Secret（不是 agentId）
```

### 场景 3：小程序登录

```javascript
// 前端
wx.qy.login({
  success: (res) => {
    // res.code 发给后端
  }
})

// 后端
GET https://qyapi.weixin.qq.com/cgi-bin/miniprogram/jscode2session
  ?access_token=ACCESS_TOKEN
  &js_code=CODE
  &grant_type=authorization_code

// 返回
{
  "corpid": "ww1234567890abcdef",  // corpId
  "userid": "zhangsan",            // userId（不是 openId）
  "session_key": "xxx"
}
```

---

## 4. 与钉钉 ID 对照表

| 企业微信             | 钉钉      | 说明           |
| -------------------- | --------- | -------------- |
| corpId               | corpId    | 企业唯一标识   |
| agentId              | agentId   | 应用唯一标识   |
| appId（小程序）      | miniAppId | 小程序 ID      |
| userId               | userId    | 企业内成员标识 |
| openId（外部联系人） | -         | 钉钉无此概念   |
| unionId              | unionId   | 跨应用用户标识 |

---

## 5. 快速排查清单

遇到 ID 相关问题时，按以下顺序排查：

1. **corpId 是否正确**：检查管理后台「我的企业」→「企业信息」
2. **agentId 是否正确**：检查应用详情页的 AgentId
3. **Secret 是否匹配**：确认使用的 Secret 对应正确的应用
4. **userId 来源是否正确**：确认是通过 code2Session 或 OAuth2 获取
5. **前端配置是否混淆**：`wx.config` 用 corpId，`wx.agentConfig` 用 corpId + agentId
