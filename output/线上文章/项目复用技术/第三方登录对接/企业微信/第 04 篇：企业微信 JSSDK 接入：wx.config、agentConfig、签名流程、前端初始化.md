---
title: "第 4 篇：企业微信 JSSDK 接入：wx.config、agentConfig、签名流程、前端初始化"
slug: "h5-jssdk-wx-config-agentconfig-93be1c59"
summary: "企业微信 JSSDK 接入说明，覆盖 wx.config、agentConfig、SDK 引入、签名流程、前端初始化代码和常见权限配置差异。"
category: "企业微信"
tags:
  - "企业微信"
  - "JSSDK"
  - "wx.config"
  - "agentConfig"
  - "签名流程"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d29208a2b1c68f2cac7c4"
originalSlug: "h5-jssdk-wx-config-agentconfig-93be1c59"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 4 篇：企业微信 JSSDK 接入：wx.config、agentConfig、签名流程、前端初始化

> 官方文档：
>
> - JSSDK 使用说明：https://developer.work.weixin.qq.com/document/path/90497
> - 签名算法：https://developer.work.weixin.qq.com/document/path/90506

---

## 1. 企业微信 JSSDK 与普通微信 JSSDK 的区别

| 对比项      | 普通微信 JSSDK     | 企业微信 JSSDK（旧版）                                | 企业微信 JSSDK（新版）                  |
| ----------- | ------------------ | ----------------------------------------------------- | --------------------------------------- |
| SDK 文件    | `jweixin-1.x.x.js` | `jweixin-1.2.0.js` + `jwxwork-1.0.0.js`               | `wecom-jssdk-2.x.x.js`（单文件）        |
| 初始化      | `wx.config`        | `wx.config`（企业签名）+ `wx.agentConfig`（应用签名） | `ww.register`（一次调用，自动处理顺序） |
| ticket 类型 | 企业 jsapi_ticket  | 企业 jsapi_ticket + 应用 jsapi_ticket                 | 同旧版，两种 ticket                     |
| 应用场景    | H5 网页            | 企业微信 H5 微应用                                    | 企业微信 H5 微应用（推荐）              |

> 官方强烈建议迁移到新版 `wecom-jssdk`，旧版 `jweixin-1.2.0.js` 不再新增接口。
> 本文同时保留新旧两种写法，旧版供存量项目参考，新版供新项目使用。

**核心差异（旧版）**：企业微信需要两层初始化，`wx.config` 用企业签名，`wx.agentConfig` 用应用签名，且 `agentConfig` 必须在 `wx.config` 的 `ready` 回调内调用。

**核心差异（新版）**：`ww.register` 一次调用同时传入企业签名和应用签名回调，SDK 内部自动处理顺序，无需关注 ready 状态。

---

## 2. SDK 引入

### 2.1 新版 SDK（推荐）

官方推荐使用新版 `wecom-jssdk`，支持 npm 和 CDN 两种方式。

**npm 引入**：

```bash
npm install @wecom/jssdk
```

```javascript
import * as ww from "@wecom/jssdk";
```

**CDN 引入**：

```html
<script src="https://wwcdn.weixin.qq.com/node/open/js/wecom-jssdk-2.3.4.js"></script>
```

引入后 `window.ww` 即可使用。

### 2.2 旧版 SDK（存量项目参考）

旧版需要两个文件，注意 `jweixin-1.6.0.js` 在企业微信客户端暂不支持，旧版应使用 `jweixin-1.2.0.js`：

```html
<!-- 旧版，企业微信客户端使用 1.2.0 -->
<script src="https://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
<!-- 企业微信专属扩展 -->
<script src="https://open.work.weixin.qq.com/wwopen/js/jwxwork-1.0.0.js"></script>
```

在 uni-app H5 中引入（旧版）：

```javascript
// main.js
// #ifdef H5
import "@/static/js/jweixin-1.2.0.js";
import "@/static/js/jwxwork-1.0.0.js";
// #endif
```

> 注意：文档中之前写的 CDN 地址 `wwcdn.weixin.qq.com/node/wework/wwopen/js/wwLogin-1.2.7.js` 是企业微信扫码登录组件，不是 JSSDK，不要混淆。

---

## 3. 签名流程

### 3.1 企业签名（用于 wx.config）

```
1. 后端获取企业 access_token
   GET https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=CORPID&corpsecret=SECRET

2. 后端获取企业 jsapi_ticket（有效期 7200 秒，必须缓存）
   GET https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=ACCESS_TOKEN

3. 后端生成签名
   拼接字符串：jsapi_ticket=TICKET&noncestr=NONCESTR&timestamp=TIMESTAMP&url=URL
   对拼接字符串做 SHA-1，得到 signature

4. 前端调用后端接口，传入当前页面 URL，获取签名参数
```

### 3.2 应用签名（用于 wx.agentConfig）

```
1. 后端获取应用 jsapi_ticket（与企业 ticket 不同）
   GET https://qyapi.weixin.qq.com/cgi-bin/ticket/get?access_token=ACCESS_TOKEN&type=agent_config

2. 后端生成应用签名（算法与企业签名相同，但使用应用 ticket）

3. 前端调用后端接口，传入当前页面 URL，获取应用签名参数
```

**注意**：两个 ticket 的获取接口不同，不能混用。

---

## 4. 前端初始化代码

### 4.1 完整初始化流程

```javascript
// util/platform/wxwork.js

/**
 * 企业微信 JSSDK 初始化
 * @param {string} pageUrl - 当前页面完整 URL（不含 # 及后面部分）
 */
export const initWxworkJSSDK = async (pageUrl) => {
  const encodedUrl = encodeURIComponent(pageUrl);

  // 并行获取企业签名和应用签名
  const [wxConfigParams, agentConfigParams] = await Promise.all([
    uni.$uv.http.post("/api/wxwork/getWxConfig", { url: encodedUrl }),
    uni.$uv.http.post("/api/wxwork/getAgentConfig", { url: encodedUrl }),
  ]);

  return new Promise((resolve, reject) => {
    wx.config({
      beta: true, // 必须设置，否则 wx.invoke 形式的 jsapi 会有问题
      debug: false,
      appId: wxConfigParams.data.corpId, // 企业 corpId
      timestamp: wxConfigParams.data.timestamp,
      nonceStr: wxConfigParams.data.nonceStr,
      signature: wxConfigParams.data.signature,
      jsApiList: [
        "scanQRCode",
        "previewFile",
        "chooseImage",
        "getLocation",
        "openLocation",
        "hideOptionMenu",
        "showOptionMenu",
      ],
    });

    wx.ready(() => {
      // wx.config 成功后，再初始化 agentConfig
      initAgentConfig(agentConfigParams.data, resolve, reject);
    });

    wx.error((err) => {
      console.error("wx.config 失败：", err);
      reject(err);
    });
  });
};

/**
 * 初始化 agentConfig（应用级别权限）
 * iOS 和 Android 调用方式不同
 */
const initAgentConfig = (params, resolve, reject) => {
  const ua = navigator.userAgent;
  const isAndroid = /Android|Linux/i.test(ua);
  const isIOS = /\(i[^;]+;( U;)? CPU.+Mac OS X/i.test(ua);

  const agentConfigOptions = {
    corpid: params.corpId,
    agentid: params.agentId,
    timestamp: params.timestamp,
    nonceStr: params.nonceStr,
    signature: params.signature,
    jsApiList: ["selectEnterpriseContact", "openUserProfile", "previewFile"],
  };

  if (isAndroid) {
    // 安卓使用 wx.invoke 方式
    wx.invoke("agentConfig", agentConfigOptions, (res) => {
      if (res.err_msg === "agentConfig:ok") {
        resolve(res);
      } else {
        reject(res);
      }
    });
  } else if (isIOS) {
    // iOS 使用 wx.agentConfig 方式
    wx.agentConfig({
      ...agentConfigOptions,
      success: resolve,
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf("function not exist") > -1) {
          uni.showToast({ title: "企业微信版本过低，请升级", icon: "none" });
        }
        reject(err);
      },
    });
  } else {
    // PC 端
    wx.agentConfig({
      ...agentConfigOptions,
      success: resolve,
      fail: reject,
    });
  }
};
```

### 4.2 在路由守卫中调用

```javascript
// router/index.js 或 main.js 路由钩子

import { initWxworkJSSDK } from "@/util/platform/wxwork.js";

// 每次路由变化后重新初始化（iOS 微信 SPA 的 URL 问题）
router.afterEach((to) => {
  // #ifdef H5
  if (isWxworkBrowser()) {
    // iOS 中 URL 不变，使用首次进入的 URL
    const pageUrl = isIOS()
      ? window.__wxworkInitUrl || window.location.href
      : window.location.href;

    if (!window.__wxworkInitUrl) {
      window.__wxworkInitUrl = window.location.href;
    }

    initWxworkJSSDK(pageUrl.split("#")[0]);
  }
  // #endif
});
```

---

## 5. 常用 JSAPI 调用示例

### 5.1 扫码

```javascript
wx.scanQRCode({
  needResult: 1, // 0: 直接扫描结果，1: 返回扫描结果
  scanType: ["qrCode", "barCode"],
  success: (res) => {
    const result = res.resultStr;
    console.log("扫码结果：", result);
  },
  fail: (err) => {
    console.error("扫码失败：", err);
  },
});
```

### 5.2 选择企业成员

```javascript
wx.invoke(
  "selectEnterpriseContact",
  {
    fromDepartmentId: 0, // 0: 从最上层开始，-1: 从自己所在部门开始
    mode: "single", // single: 单选，multi: 多选
    type: ["user"], // user: 成员，department: 部门
    selectedUserIds: [], // 已选成员 ID（多次选人时可重入）
  },
  (res) => {
    if (res.err_msg === "selectEnterpriseContact:ok") {
      const userList = res.result.userList;
      // userList: [{ id: 'zhangsan', name: '张三', avatar: 'xxx' }]
    }
  },
);
```

### 5.3 预览文件

```javascript
// 注意：size 是必填参数，且大小必须正确，否则会打开失败
wx.previewFile({
  url: "https://xxx.com/file.pdf", // 必填
  size: 1048576, // 必填，文件字节大小，必须正确
  name: "文件名.pdf", // 可选，需带文件格式后缀
});
```

---

## 6. 签名常见错误排查

| 错误信息                                    | 原因             | 解决方案                                        |
| ------------------------------------------- | ---------------- | ----------------------------------------------- |
| `invalid signature`                         | 签名计算错误     | 检查 URL 是否与当前页面完全一致（含端口、路径） |
| `invalid appid`                             | corpId 错误      | 确认使用的是 corpId，不是小程序 appId           |
| `the permission value is offline verifying` | 域名未配置       | 在管理后台配置「可信域名」                      |
| `function not exist`                        | 企业微信版本过低 | 提示用户升级企业微信                            |
| `agentConfig` 未生效                        | 调用顺序错误     | 确保在 `wx.ready` 回调内调用 `agentConfig`      |

### URL 签名注意事项

```javascript
// 正确：不含 # 及后面部分
const url = window.location.href.split("#")[0];

// iOS SPA 问题：iOS 中 URL 不会随路由变化
// 解决方案：记录首次进入的 URL，每次签名都用这个 URL
if (!window.__firstUrl) {
  window.__firstUrl = window.location.href.split("#")[0];
}
const signUrl = isIOS()
  ? window.__firstUrl
  : window.location.href.split("#")[0];
```

---

## 7. ticket 缓存策略

ticket 有效期 7200 秒，调用频率有严格限制：

- 企业 jsapi_ticket：一小时内一个企业最多 400 次
- 应用 jsapi_ticket：一小时内单个应用最多 100 次

**后端必须缓存 ticket**，不能每次请求都重新获取。

```
推荐缓存策略：
1. 首次获取 ticket，存入 Redis，设置 7000 秒过期（留 200 秒余量）
2. 每次需要签名时，先从 Redis 读取
3. Redis 中不存在时，重新获取并缓存
```

---

## 8. 新版 SDK ww.register 用法（推荐新项目使用）

新版 `wecom-jssdk` 用 `ww.register` 替代旧版的 `wx.config + wx.agentConfig`，无需关注 ready 顺序，SDK 内部自动处理。

```javascript
import * as ww from "@wecom/jssdk";

// 企业身份注册（只需企业签名）
ww.register({
  corpId: "ww1234567890abcdef",
  jsApiList: ["scanQRCode", "previewFile"],
  async getConfigSignature(url) {
    // 调用后端接口，传入 url，返回企业签名
    const res = await uni.$uv.http.post("/api/wxwork/getWxConfig", { url });
    const { timestamp, nonceStr, signature } = res.data.data;
    return { timestamp, nonceStr, signature };
  },
});

// 应用身份注册（需要企业签名 + 应用签名，权限更高）
ww.register({
  corpId: "ww1234567890abcdef",
  agentId: 1000002,
  jsApiList: ["selectEnterpriseContact", "openUserProfile"],
  async getConfigSignature(url) {
    const res = await uni.$uv.http.post("/api/wxwork/getWxConfig", { url });
    const { timestamp, nonceStr, signature } = res.data.data;
    return { timestamp, nonceStr, signature };
  },
  async getAgentConfigSignature(url) {
    const res = await uni.$uv.http.post("/api/wxwork/getAgentConfig", { url });
    const { timestamp, nonceStr, signature } = res.data.data;
    return { timestamp, nonceStr, signature };
  },
});

// 注册后直接调用，无需等待 ready
const result = await ww.selectEnterpriseContact({
  fromDepartmentId: 0,
  mode: "single",
  type: ["user"],
});
```

> 新版 SDK 的 iOS URL 问题由 SDK 内部处理，无需手动记录首次 URL。
