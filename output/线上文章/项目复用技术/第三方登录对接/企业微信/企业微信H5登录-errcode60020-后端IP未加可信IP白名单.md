---
title: "企业微信H5登录-errcode60020-后端IP未加可信IP白名单"
slug: "h5-h5-errcode60020-ip-ip-0be8e8e2"
summary: ""
category: "企业微信"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "企业微信"
tags: []
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d29208a2b1c68f2cac7cc"
originalSlug: "h5-h5-errcode60020-ip-ip-0be8e8e2"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.461Z"
updatedAt: "2026-06-13T14:03:18.901Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 企业微信H5登录 errcode=60020 — 后端IP未加可信IP白名单

## 问题现象

企微 H5 免登流程（`weComH5Login`）在 `weComOAuthLogin` 接口返回失败，错误信息如下：

```
not allow to access from your ip, hint: [...], from ip: x.x.x.x,
more info at https://open.work.weixin.qq.com/devtool/query?e=60020 (errcode=60020)
```

前端 OAuth 授权、code 获取、state 校验均正常通过，唯独换 token 这一步失败。

## 根本原因

企业微信自 **2022年6月20日** 起，要求所有新创建的自建应用必须在管理后台配置**企业可信IP**，只有白名单内的服务器 IP 才能调用企微服务端接口（包括用 code 换取用户信息的接口）。

后端服务器 IP 未加入白名单时，企微直接拒绝请求，返回 errcode=60020。

> 官方说明：[开发前必读 - 可信IP](https://developer.work.weixin.qq.com/document/path/90664)

## 解决步骤

1. 用企业**管理员账号**登录 [企业微信管理后台](https://work.weixin.qq.com/wework_admin/frame)
2. 左侧菜单 → 应用管理 → 找到对应自建应用（通过 AgentID 确认）
3. 进入应用详情 → 开发者接口 → **企业可信IP**
4. 点击"编辑"，填入后端服务器的公网 IP，保存

保存后**立即生效**，无需重新部署。

## 注意事项

- 如果后端部署在云服务器且 IP 不固定（如弹性IP、重启后变化），上线后可能再次触发此错误，建议绑定固定公网 IP
- 配置可信IP前，企微后台会要求先完成**可信域名**或**接收消息服务器URL**的配置，两者至少满足其一
- 本地开发时后端跑在本机，本机出口 IP 也需要加入白名单，或使用内网穿透工具暴露固定地址

## 与前端代码的关系

此问题**纯属后端/后台配置问题**，前端代码无需修改。

排查时可借助 `weComH5Login` 页面内置的调试面板，查看 `weComOAuthLogin` 接口的完整响应，确认 errcode 后直接去后台配置即可。

调试面板关键日志示例：

```
[ERROR][API] {
  "说明": "换 token 失败。常见原因：①后端服务器 IP 未加入企微可信 IP（errcode=60020）...",
  "api": "weComOAuthLogin",
  "response": {
    "code": 201,
    "msg": "not allow to access from your ip, ... (errcode=60020)"
  }
}
```

## 相关文件

- 免登页：`secondary/weComH5Login/index.vue`
- 登录工具：`util/auth/weComLogin.js`
- 登录接口：`api/login.js` → `weComOAuthLogin`
