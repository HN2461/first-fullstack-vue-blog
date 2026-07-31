---
title: "钉钉H5微应用-JSAPI能力调用-前后端对接清单"
slug: "h5-h5-jsapi-d670249e"
summary: ""
category: "钉钉"
tags: []
status: "draft"
sortOrder: 120
cover: ""
originalId: "6a2d29208a2b1c68f2cac77c"
originalSlug: "h5-h5-jsapi-d670249e"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 钉钉 H5 微应用 — JSAPI 能力调用前后端对接清单

> 场景：uni-app 编译为 H5 嵌入钉钉微应用，需要调用钉钉原生能力（扫码、选人、预览文件等）。
>
> 项目核心文件：
> - `api/dingtalk.js`：后端签名接口封装
> - `util/platform/dingtalk.js`：SDK 加载、鉴权、通用 JSAPI 调用入口
> - `util/platform/scan.js`：统一扫码入口（屏蔽平台差异）
> - `util/platform/runtime.js`：运行时环境判断

---

## 一、结论速查

| 项目 | 结论 |
|---|---|
| 调用钉钉 JSAPI 是否需要鉴权 | ✅ 需要，调用前必须完成 `dd.config` 签名鉴权 |
| 免登 JSAPI（`requestAuthCode`）是否需要鉴权 | ❌ 不需要，只需等 `dd.ready` |
| 鉴权签名由谁生成 | 后端（需要 jsapi_ticket） |
| PC 端是否支持扫码 | ❌ 不支持，仅移动端可用 |
| 业务页怎么调用 | 直接调 `scanCodeCompat` 或 `callDingTalkJsApi`，不需要手写 `dd.config` |

---

## 二、整体流程

```
业务页调用 scanCodeCompat / callDingTalkJsApi
    │
    ▼
ensureDingTalkJsapiConfig（带缓存，同一页面同一批能力只鉴权一次）
    │
    ├─ 请求后端：GET /register/dingtalk/jsapi-config?url=当前页面URL
    │
    ├─ 后端返回：{ agentId, corpId, timeStamp, nonceStr, signature }
    │
    └─ 调用 dd.config(...)，等待 dd.ready
    │
    ▼
执行具体 JSAPI（dd.biz.util.scan / dd.biz.contact.choose 等）
    │
    ▼
返回结果给业务层
```

---

## 三、前端调用方式

### 3.1 扫码（推荐：直接用 `scanCodeCompat`）

`scanCodeCompat` 封装在 `util/platform/scan.js`，自动处理平台差异：

- 钉钉 PC 端 → 直接抛错（不支持）
- 钉钉移动端 → 调 `dd.biz.util.scan`（自动完成鉴权）
- 其他端（App / 小程序 / 普通 H5）→ 调 `uni.scanCode`

```js
import { scanCodeCompat } from '@/util/platform/scan.js'

const handleScan = async () => {
  const result = await scanCodeCompat({ type: 'all' })
  if (result.cancelled) return  // 用户主动取消，不报错
  console.log(result.text)      // 扫码结果字符串
}
```

返回值结构：

```js
{
  text: string,       // 扫码结果
  rawResult: Object,  // 底层 API 原始返回
  platform: string,   // 'dingtalk-h5' | 'dingtalk-other' | 'uni'
  cancelled: boolean  // 用户是否主动取消
}
```

### 3.2 其他 JSAPI（通用：用 `callDingTalkJsApi`）

`callDingTalkJsApi` 封装在 `util/platform/dingtalk.js`，是所有钉钉 JSAPI 的统一调用入口，自动处理鉴权和 `dd.ready`。

```js
import { callDingTalkJsApi } from '@/util/platform/dingtalk.js'

// 调用任意 JSAPI，传 API 名称和参数即可
const result = await callDingTalkJsApi('biz.contact.choose', {
  // 具体参数见各 JSAPI 文档
})
```

API 名称支持两种写法，效果一样：

```js
callDingTalkJsApi('biz.util.scan', ...)
callDingTalkJsApi('dd.biz.util.scan', ...)  // 带 dd. 前缀也可以，内部会自动去掉
```

`options` 第三个参数说明：

```js
callDingTalkJsApi('biz.util.scan', params, {
  requiresConfig: false,  // 设为 false 则跳过 dd.config，只等 dd.ready（用于免登等不需要鉴权的 API）
  resolveImmediately: true, // 调用后立即 resolve，不等 onSuccess 回调（用于 setRight 等事件型 API）
  corpId: '',             // 可选，透传给鉴权
  url: '',                // 可选，签名 URL，不传则自动取当前页面 URL
})
```

---

## 四、常用 JSAPI 示例

### 4.1 扫码

```js
// 推荐用 scanCodeCompat，见 3.1
// 如果要直接调底层：
const result = await callDingTalkJsApi('biz.util.scan', {
  type: 'all'  // 'qrCode' | 'barCode' | 'all'
})
console.log(result.text)
```

### 4.2 选择企业成员

```js
const result = await callDingTalkJsApi('biz.contact.choose', {
  multiple: false,          // 是否多选
  title: '请选择',
  startWithDepartmentId: 0, // 0: 从根部门开始
  pickedUsers: [],          // 已选用户列表
  pickedDepartments: [],
  disabledUsers: [],
  disabledDepartments: [],
  requiredUsers: [],
  requiredDepartments: [],
  corpId: 'your-corpId',
  isHideMobileInSearch: false,
})
// result.users: [{ name, avatar, emplId }]
// result.departments: [{ id, name }]
```

### 4.3 预览图片

```js
await callDingTalkJsApi('biz.util.previewImage', {
  urls: ['https://xxx.com/a.jpg', 'https://xxx.com/b.jpg'],
  current: 'https://xxx.com/a.jpg',  // 当前显示的图片
})
```

### 4.4 打开链接

```js
await callDingTalkJsApi('biz.util.openLink', {
  url: 'https://xxx.com',
})
```

### 4.5 获取当前地理位置

```js
const result = await callDingTalkJsApi('device.geolocation.get', {
  targetAccuracy: 200,
  coordinate: 1,  // 1: GCJ02（高德），0: WGS84
  withReGeocode: false,
  useCache: true,
})
// result.latitude, result.longitude
```

### 4.6 设置导航栏右侧按钮

```js
// resolveImmediately: true，因为这是事件注册型 API，不会触发 onSuccess
await callDingTalkJsApi('biz.navigation.setRight', {
  show: true,
  control: true,
  text: '完成',
  onSuccess() {
    // 用户点击右侧按钮时触发
    handleRightButtonClick()
  }
}, { resolveImmediately: true })
```

---

## 五、后端要做的事

### 5.1 提供签名接口

```
GET /register/dingtalk/jsapi-config
参数：url（当前页面完整 URL，不含 hash）
     corpId（可选，多学校时用于路由到对应配置）
返回：
{
  "code": 200,
  "data": {
    "agentId": "xxx",
    "corpId": "dingxxxxxxxx",
    "timeStamp": "1712345678",
    "nonceStr": "abc123xyz",
    "signature": "xxxxxxxxxxxxxxxx"
  }
}
```

### 5.2 签名生成步骤

1. 用 `appKey` + `appSecret` 换取 `access_token`
   - `POST https://api.dingtalk.com/v1.0/oauth2/accessToken`

2. 用 `access_token` 换取 `jsapi_ticket`
   - `GET https://oapi.dingtalk.com/get_jsapi_ticket?access_token=xxx`
   - **ticket 有效期 7200 秒，必须缓存，不能每次都请求**

3. 拼接签名字符串（字段按字母序排列），SHA-1 签名：
   ```
   jsapi_ticket=xxx&noncestr=xxx&timestamp=xxx&url=xxx
   ```
   - `url` 必须与前端传来的完全一致（含路径、query，不含 hash）
   - `url` 要做 URL decode 后再参与签名，避免编码不一致

4. 返回 `agentId`、`corpId`、`timeStamp`、`nonceStr`、`signature`

### 5.3 多学校部署注意

每个学校的 `appKey` / `appSecret` / `agentId` 不同，后端需按 `corpId` 或 `schoolID` 路由到对应配置。

---

## 六、前端接口封装

`api/dingtalk.js` 当前实现：

```js
export const getDingTalkJsapiConfig = (params = {}, config = {}) =>
  uni.$uv.http.get('/register/dingtalk/jsapi-config', {
    ...config,
    params,
  })
```

请求头里的 `schoolID` 由请求拦截器统一注入，业务页不需要单独传。

---

## 七、鉴权缓存机制说明

`ensureDingTalkJsapiConfig` 内部有缓存，**同一页面 URL + 同一批 JSAPI 只鉴权一次**，并发调用时第二个请求会等第一个完成，不会重复请求后端签名接口。

缓存 key 由 `url + corpId + jsApiList（排序后）` 构成。

鉴权失败时会从缓存删除，允许下次重新鉴权（如签名过期后重试）。

---

## 八、常见问题

| 问题 | 原因 | 解决 |
|---|---|---|
| `dd is not defined` | SDK 未加载 | 确认走了 `loadDingTalkJsApi` 或 `ensureDingTalkJsapiConfig` |
| 签名校验失败 | url 不一致 / ticket 过期 | 检查前端传的 url 是否含 hash；检查后端 ticket 缓存是否失效 |
| `biz.util.scan` 未授权 | `jsApiList` 里没有声明 | `callDingTalkJsApi` 会自动把 API 名加入 `jsApiList`，无需手动声明 |
| PC 端点击无反应 | PC 钉钉不支持扫码 | `scanCodeCompat` 已自动处理，PC 端会直接抛错 |
| 用户取消扫码也弹错误 | 未过滤 cancel | `scanCodeCompat` 已处理，取消时 `cancelled: true`，不会 reject |
| 选人 JSAPI 报权限错误 | 应用未开通通讯录权限 | 在钉钉开放平台后台给应用开通对应权限点 |
