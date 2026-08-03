---
title: "第 11 篇：uni-app 微信小程序迁移钉钉小程序指南：路线选型、编译目标、适配层、登录链路、联调发布"
slug: "uni-app-uni-app-81c6612d"
summary: "uni-app 微信小程序迁移钉钉小程序完整指南，覆盖路线选型、编译目标接入、平台适配层、登录链路、联调和发布流程。"
category: "钉钉"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "钉钉"
tags:
  - "uni-app"
  - "钉钉小程序"
  - "微信小程序"
  - "小程序迁移"
  - "跨端开发"
status: "published"
sortOrder: 110
cover: ""
originalId: "6a2d29208a2b1c68f2cac798"
originalSlug: "uni-app-uni-app-81c6612d"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.441Z"
updatedAt: "2026-07-31T11:16:24.729Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 11 篇：uni-app 微信小程序迁移钉钉小程序指南：路线选型、编译目标、适配层、登录链路、联调发布

> 适用场景：你手上已经有一个正在跑的 uni-app 微信小程序项目，现在要把它改成钉钉小程序。
>
> 核心结论：**不是整体重写，而是分层改造。** 页面和通用业务逻辑尽量复用，平台能力差异单独适配。

---

## 一、先做三个判断，再动代码

### 判断 1：你的项目是不是标准 uni-app 项目

看项目里有没有这些文件：`pages.json`、`manifest.json`、`App.vue`、`main.js`、`uni.scss`，页面主要用 `uni.*` API。

如果有，基本就是标准 uni-app 项目，迁移成本可控。

如果代码里大量是 `wx.login`、`wx.request`、`open-type="getPhoneNumber"`、微信支付、订阅消息，说明项目虽然是 uni-app 壳子，但业务实现偏微信，需要额外的平台改造。

先全局搜一遍：

```bash
rg 'wx\.' pages components
rg 'open-type|open-data|getPhoneNumber|WeixinJSBridge|mp-weixin' pages components
rg '订阅消息|subscribe|支付|分享|客服|手机号' pages components
```

把结果分三类：

| 类型 | 示例 | 处理方式 |
|---|---|---|
| 通用逻辑 | 列表渲染、表单校验、路由跳转 | 直接复用 |
| 微信写法但有 uni 替代 | `wx.request` → `uni.request` | 机械替换 |
| 微信专属业务能力 | 微信登录、手机号授权、支付、订阅消息 | 重新设计方案 |

### 判断 2：你们是内部应用还是第三方企业应用

- **企业内部应用**：只给单一组织内部人员使用（如某一所学校自己用）
- **第三方企业应用**：产品方案商把同一套产品提供给多个企业客户（如教育公司给多所学校）

这个判断影响后续的应用创建路线、授权方式、多租户设计。

如果是给多家学校/机构使用，优先按**第三方企业应用**理解。

### 判断 3：迁移难度评估

- 页面多但平台能力少、大部分用 `uni.*`、没有微信支付/订阅消息/开放数据 → **中等工作量**
- 强依赖微信登录、微信开放能力、后端也绑死了微信身份体系 → **前后端联动迁移**，不是纯前端改造

---

## 二、技术路线选型

### 方案 A：单仓 uni-app + mp-dingtalk 自定义平台（推荐）

在现有项目里新增钉钉编译目标，用条件编译隔离平台差异，新增平台适配层收口能力差异。

**优点**：复用 80%+ 业务代码，单一代码库，长期维护成本最低。

**缺点**：前期需要投入适配层和旧字段治理。

### 方案 B：复制一套钉钉版项目

从现有仓库复制出独立的钉钉版项目。

**缺点**：业务代码很快形成双份事实源，任何功能迭代都需要双边维护。**不推荐。**

### 方案 C：改为原生钉钉小程序重写

完全按钉钉原生小程序目录和语法重做。

**缺点**：现有 Vue 页面和公共组件几乎无法复用，成本极高。**仅在必须深度依赖钉钉原生能力时考虑。**

**结论：推荐方案 A。**

---

## 三、接入钉钉编译目标

### 3.1 在 package.json 里加配置

```json
{
  "uni-app": {
    "scripts": {
      "mp-dingtalk": {
        "title": "钉钉小程序",
        "env": {
          "UNI_PLATFORM": "mp-alipay"
        },
        "define": {
          "MP-DINGTALK": true
        }
      }
    }
  }
}
```

> 注意：`UNI_PLATFORM: 'mp-alipay'` 不是说你在做支付宝小程序，而是 uni-app 官方对钉钉的适配方式是基于这个基准平台。`package.json` 里不要写注释，否则扩展配置无效。

### 3.2 运行方式

**HBuilderX**：配好后重启项目，顶部"运行"菜单会出现"钉钉小程序"选项。

**CLI**：

```bash
npm run dev:custom mp-dingtalk
npm run build:custom mp-dingtalk
```

### 3.3 条件编译

```js
// #ifdef MP-WEIXIN
// 微信专属代码
// #endif

// #ifdef MP-DINGTALK
// 钉钉专属代码
// #endif

// #ifdef MP
// 所有小程序平台通用代码
// #endif
```

---

## 四、建立平台适配层（最重要的一步）

**不要把平台判断写散在业务页面里。** 正确做法是把平台差异集中到少量适配模块，业务页面只调统一方法。

推荐建立这几个文件：

```
util/platform/
├── runtime.js      ← 平台识别（isDingTalk / isWeChat 等）
├── auth.js         ← 登录凭证获取（wx.login / dd.getAuthCode）
├── picker.js       ← 选人选部门（微信自定义 / 钉钉 complexPicker）
└── scan.js         ← 扫码（uni.scanCode / dd.biz.util.scan）
```

### 4.1 平台识别

```js
// util/platform/runtime.js
export const isDingTalkPlatform = () => {
  // #ifdef MP-DINGTALK
  return true
  // #endif
  return false
}
```

### 4.2 登录凭证获取

```js
// util/platform/auth.js
export const getPlatformAuthCode = () =>
  new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    wx.login({
      success: (res) => resolve(res.code),
      fail: reject
    })
    // #endif

    // #ifdef MP-DINGTALK
    dd.getAuthCode({
      success: (res) => resolve(res.authCode),
      fail: reject
    })
    // #endif
  })
```

### 4.3 选人选部门

```js
// util/platform/picker.js
// #ifdef MP-DINGTALK
import complexPicker from 'dingtalk-jsapi/api/biz/contact/complexPicker'
// #endif

export const pickOrgUsers = (options = {}) =>
  new Promise((resolve, reject) => {
    // #ifdef MP-DINGTALK
    complexPicker({
      title: options.title || '请选择人员',
      corpId: options.corpId,
      multiple: options.multiple ?? true,
      maxUsers: options.maxUsers ?? 100,
      pickedUsers: [],
      pickedDepartments: [],
      disabledUsers: [],
      disabledDepartments: [],
      requiredUsers: [],
      requiredDepartments: [],
      permissionType: 'GLOBAL',
      responseUserOnly: false,
      startWithDepartmentId: 0,
      onSuccess: resolve,
      onFail: reject
    })
    // #endif

    // #ifdef MP-WEIXIN
    reject(new Error('当前平台未接入微信版选人能力'))
    // #endif
  })
```

---

## 五、登录链路改造

这是迁移里最关键的一块，也是最容易踩坑的地方。

### 5.1 微信 vs 钉钉登录的本质区别

两者都不是"前端自己完成登录"，而是：

- 微信：前端拿 `code` → 发给后端 → 后端换用户身份
- 钉钉：前端拿 `authCode` → 发给后端 → 后端换用户身份

区别在于后端换身份的接口不同，以及钉钉多了一层"企业组织"维度。

### 5.2 钉钉免登流程

```
前端调用 dd.getAuthCode({ corpId })
    ↓
前端拿到 authCode（有效期 5 分钟，一次性）
    ↓
前端把 authCode 发给后端
    ↓
后端用 clientId + clientSecret 换 access_token
    ↓
后端用 access_token + authCode 换 userId / unionId
    ↓
后端生成业务 token，返回给前端
```

### 5.3 多租户场景额外处理

如果是给多家学校/机构使用，后端还需要：

1. 识别这个用户属于哪所学校（`corpId` → `schoolId` 映射）
2. 判断这所学校是否开通了应用
3. 判断用户角色（老师/学生/管理员）
4. 生成业务登录态

### 5.4 dingtalk-jsapi 接入

```bash
npm install dingtalk-jsapi --save
```

在 `app.js` 或 `main.js` 里初始化（仅钉钉端）：

```js
// #ifdef MP-DINGTALK
import 'dingtalk-jsapi/entry/mobile'
// #endif
```

---

## 六、wx 替换速查

### 可以直接改成 uni.*

| 原写法 | 改成 |
|---|---|
| `wx.request` | `uni.request` |
| `wx.navigateTo` / `wx.redirectTo` / `wx.reLaunch` | `uni.navigateTo` / `uni.redirectTo` / `uni.reLaunch` |
| `wx.showToast` / `wx.showLoading` / `wx.showModal` | `uni.showToast` / `uni.showLoading` / `uni.showModal` |
| `wx.setStorageSync` / `wx.getStorageSync` | `uni.setStorageSync` / `uni.getStorageSync` |
| `wx.chooseImage` / `wx.uploadFile` / `wx.previewImage` | `uni.chooseImage` / `uni.uploadFile` / `uni.previewImage` |

### 需要抽到适配层

| 微信能力 | 钉钉方向 |
|---|---|
| `wx.login` | `dd.getAuthCode` + 后端换身份 |
| 组织选人/选部门 | `dingtalk-jsapi` + `complexPicker` |
| 扫码 | `dd.biz.util.scan`（需先做 `dd.config` 鉴权） |

### 不能直接替换，需要重设计

| 微信能力 | 处理原则 |
|---|---|
| 微信手机号授权 | 改成组织身份绑定 / 表单补录 / 后端权限获取 |
| 微信支付 | 先确认业务是否仍需在钉钉内支付，再定方案 |
| 微信订阅消息 | 改成钉钉工作通知 / 群消息 / 机器人消息 |
| 微信开放数据组件 | 逐项确认钉钉是否有等价能力 |

---

## 七、安全域名配置

钉钉官方明确要求：小程序前端如果要和服务端通信，必须配置 HTTP 可信域名。

**重要**：安全域名变更后，必须重新构建并上传版本，不是后台保存就生效。

至少要配置：

- 接口请求域名
- H5 页面域名（如有 web-view）
- 静态资源域名

---

## 八、推荐实施顺序

```
1. 全局搜索微信专属代码，分类整理
2. 在 package.json 接入 mp-dingtalk
3. 先让首页编译到钉钉跑起来（不改复杂业务）
4. 建立 util/platform/ 适配层
5. 改登录链路（最优先）
6. 改选人/选部门
7. 配安全域名
8. 跑通登录联调
9. 逐个修业务页面
10. 上传开发版本 → 设体验版验证 → 正式发布
```

**核心原则：先证明链路通，再补业务细节。不要一口气把所有代码都改完再联调。**

---

## 九、多租户场景注意事项

如果是教育公司给多所学校提供服务，需要额外注意：

1. **`schoolID` 和 `corpId` 是并存关系，不是替代关系**：`schoolID` 是业务租户标识，`corpId` 是钉钉组织标识，后端需要维护两者的映射关系
2. **登录成功后同时保留两个维度**：业务 token + 钉钉组织信息
3. **接口请求头**：继续携带 `schoolID`，不要改成 `corpId`
4. **多学校部署**：每所学校的 `clientId` / `clientSecret` / `agentId` 不同，后端需按 `corpId` 路由到对应配置

---

## 十、常见坑

| 坑 | 说明 |
|---|---|
| 以为 uni-app = 完全不用改 | uni-app 帮你复用大部分代码，但不能抹平所有平台业务差异 |
| 看到 mp-alipay 就以为方向错了 | 这是 uni-app 对钉钉的适配方式，正常现象 |
| 只改前端，不改后端登录逻辑 | 钉钉登录链路后端也要接钉钉身份识别接口 |
| 后台配了域名但没重新构建上传 | 安全域名变更必须重新上传版本才生效 |
| 业务页里到处写平台判断 | 应该抽适配层，页面只调统一方法 |
| 没有先搜微信专属代码 | 不先排查，编译成功了但到钉钉全坏了 |

---

## 十一、官方资料

### 钉钉官方

- 应用类型介绍：`https://open.dingtalk.com/document/dingstart/application-type-introduction`
- 第三方企业应用学习指南：`https://open.dingtalk.com/document/dingstart/isv-learning-map`
- 开发小程序前端：`https://open.dingtalk.com/document/dingstart/develop-miniapp-fe`
- 小程序应用免登：`https://open.dingtalk.com/document/dingstart/small-program-application-free-of-registration`
- 客户端 SDK 介绍：`https://open.dingtalk.com/document/dingstart/mini-app-client-jsapi-overview`
- 配置安全域名：`https://open.dingtalk.com/document/dingstart/configure-secure-domain-name`
- 上传小程序：`https://open.dingtalk.com/document/dingstart/upload-miniapp`
- 发布应用：`https://open.dingtalk.com/document/dingstart/publish-dingtalk-application`

### uni-app 官方

- package.json 扩展配置：`https://uniapp.dcloud.net.cn/collocation/package.html`
- 条件编译处理多端差异：`https://uniapp.dcloud.net.cn/tutorial/platform.html`
