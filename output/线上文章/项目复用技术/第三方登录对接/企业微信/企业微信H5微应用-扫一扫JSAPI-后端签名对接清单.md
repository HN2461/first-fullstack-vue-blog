---
title: "企业微信H5微应用-扫一扫JSAPI-后端签名对接清单"
slug: "h5-h5-jsapi-d82c6607"
summary: ""
category: "企业微信"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "企业微信"
tags: []
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d29208a2b1c68f2cac7c8"
originalSlug: "h5-h5-jsapi-d82c6607"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.460Z"
updatedAt: "2026-06-13T14:03:18.905Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 企业微信 H5 微应用 — 扫一扫 JSAPI 后端签名对接清单

> 场景：`uni-app` 编译 H5 部署后，登录已通，但 `scanQRCode / ww.scanQRCode` 调不起来，需和后端补齐企业微信签名链路。
>
> 本文按当前仓库已落地模式编写：前端只调用一个企业微信签名接口 `GET /register/wecom/jsapi-config`，后端完成 `access_token -> jsapi_ticket -> signature` 全链路。

---

## 一、先说结论

| 项目 | 结论 |
| --- | --- |
| 企业微信 H5 扫一扫接口 | `ww.scanQRCode`（旧版写法 `wx.scanQRCode`） |
| 是否需要鉴权 | 需要，调用前必须先完成 `ww.register`（或旧版 `wx.config`） |
| 签名由谁算 | 后端，前端不能持有 `access_token/jsapi_ticket` |
| 后端最小接口 | `GET /register/wecom/jsapi-config?url=...` |
| 核心容易错点 | 签名 URL 必须是当前页面完整 URL（含 query，不含 `#`） |
| 可信域名要求 | 当前页面域名必须在企业微信应用「可信域名」里 |

---

## 二、最小对接流程（和钉钉一样走单接口）

```text
前端进入 H5 页面
  -> 前端加载 wecom-jssdk，调用 ww.register
  -> ww.register 回调 getConfigSignature(url)
  -> 前端请求后端 GET /register/wecom/jsapi-config?url=当前页面URL
  -> 后端生成并返回 { timestamp, nonceStr, signature }
  -> ww.register 成功
  -> 前端调用 ww.scanQRCode
```

当前仓库对应文件：

- `api/wecom.js`：`getWeComJsapiConfig`
- `util/platform/wecom.js`：`ensureWeComJsapiConfig` + `callWeComJsApi`
- `util/platform/scan.js`：企业微信移动端分支调用 `scanQRCode`

---

## 三、后端接口协议（建议直接按这个给）

### 3.1 请求

```http
GET /register/wecom/jsapi-config?url=https%3A%2F%2Fh5.example.com%2Fpages%2Fspace%3Fa%3D1
```

参数说明：

- `url`：前端当前页面完整地址，后端用于签名；规则是「含 query，不含 hash」。
- `corpId`：可选；多租户/多学校可显式带入。
- `schoolID`：可选；当前仓库可按学校路由企业配置。

### 3.2 响应（与当前前端兼容）

```json
{
  "code": 200,
  "data": {
    "timestamp": "1714000000",
    "nonceStr": "Wm3WZYTPz0wzccnW",
    "signature": "0f9de62fce790f9a083d5c99e95740ceb90c27ed"
  },
  "msg": "ok"
}
```

说明：

- `timestamp`/`timeStamp` 前端都兼容，但建议统一 `timestamp`。
- `nonceStr`/`noncestr` 前端都兼容，但建议统一 `nonceStr`。
- `signature` 必填。

---

## 四、后端实现步骤（必须做）

### 4.1 第一步：获取 `access_token`

```http
GET https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ID&corpsecret=SECRET
```

要点：

- 每个应用 `secret` 独立，`access_token` 也必须按应用分开缓存。
- `expires_in` 通常 7200 秒。
- 不要把 `access_token` 返回前端。

### 4.2 第二步：获取 `jsapi_ticket`

```http
GET https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=ACCESS_TOKEN
```

要点：

- 这个 ticket 用于企业级身份签名（`getConfigSignature`）。
- 官方要求必须做服务端缓存。
- 频率限制严格：一小时内一个企业最多 400 次，且单应用不超过 100 次。

### 4.3 第三步：生成签名

固定拼接规则（顺序不能变）：

```text
jsapi_ticket=JSAPI_TICKET&noncestr=NONCESTR&timestamp=TIMESTAMP&url=URL
```

然后对整个字符串做 SHA-1，得到 `signature`。

关键细节：

- 不要改参数顺序。
- 不要对拼接串再做 URL encode。
- `url` 必须是当前页面 URL，且不含 `#` 后面的部分。

### 4.4 第四步：返回签名三元组

后端返回：

- `timestamp`
- `nonceStr`
- `signature`

前端 `ww.register` 会用这三个字段完成注册。

---

## 五、缓存与失效策略（后端必须实现）

建议缓存键：

- `wecom:access_token:{corpId}:{agentId}`
- `wecom:jsapi_ticket:{corpId}:{agentId}`

建议策略：

1. 读取缓存命中直接用。
2. 未命中再请求企业微信接口。
3. 设置过期时间用 `expires_in - 300`（预留 5 分钟）。
4. 并发时做单飞锁（同一 key 只允许一个线程刷新）。
5. 企业微信返回 token/ticket 失效时，删除缓存并重试一次。

---

## 六、最常见报错与排查顺序

### 6.1 `invalid url domain`

原因：页面域名没配进企业微信应用可信域名。  
处理：在企业微信管理后台给对应应用配置可信域名，确保与当前页面域名一致。

### 6.2 `invalid signature`

优先按这个顺序查：

1. 签名算法是否严格按官方规则。
2. `nonceStr` / `timestamp` 是否和参与签名的一致。
3. `url` 是否为当前页面完整 URL（含 query，不含 `#`）。
4. 是否把登录授权 URL 当成签名 URL（这点很常见，必须用实际 JS-SDK 页面 URL）。
5. `access_token` 与 `jsapi_ticket` 是否做了缓存并正确刷新。

### 6.3 `fail_nopermission` / `the permission value is offline verifying`

原因：`register/config` 没通过，或者 `jsApiList` 没包含要调用的接口。  
处理：确认前端注册成功，且声明了 `scanQRCode`。

---

## 七、给后端同学的最小伪代码

```js
// 伪代码：Express 风格
app.get('/register/wecom/jsapi-config', async (req, res) => {
  const url = decodeURIComponent(String(req.query.url || '').trim());
  if (!url) return res.json({ code: 400, msg: 'url不能为空' });

  const corpId = getCorpIdByRequest(req);       // 按学校/租户路由
  const corpSecret = getCorpSecretByRequest(req);

  const accessToken = await getOrRefreshAccessToken(corpId, corpSecret);
  const jsapiTicket = await getOrRefreshJsapiTicket(corpId, accessToken);

  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonceStr = randomString(16);
  const raw = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  const signature = sha1(raw);

  return res.json({
    code: 200,
    msg: 'ok',
    data: { timestamp, nonceStr, signature }
  });
});
```

---

## 八、与你当前项目的对齐建议

1. 保持单接口：继续使用 `GET /register/wecom/jsapi-config`，不拆多个签名接口。
2. 后端统一返回 `timestamp + nonceStr + signature`，前端无需改动。
3. 若后端暂时返回字段是 `timeStamp/noncestr`，当前前端也能兜底，但建议后端尽快统一字段命名。
4. 先在手机企业微信里验证 `ww.register` 成功，再测扫码；PC 企业微信不作为扫码验证环境。

---

## 九、官方依据（后端必读）

- 获取 `access_token`：<https://developer.work.weixin.qq.com/document/path/91039>
- JS-SDK 签名算法 + `jsapi_ticket` 获取：<https://developer.work.weixin.qq.com/document/path/90539>
- `ww.register`（新版注册方式）：<https://developer.work.weixin.qq.com/document/path/94325>
- 调起扫一扫 `ww.scanQRCode`：<https://developer.work.weixin.qq.com/document/path/90525>
- 常见错误排查：<https://developer.work.weixin.qq.com/document/path/90542>

文档核验时间：2026-04-25。
