---
title: "第 13 篇：uni-app 项目 wx 替换清单：uni、dd、dingtalk-jsapi、条件编译、适配层模板"
slug: "uni-app-uni-app-wx-616a50b5"
summary: "uni-app 项目常见 wx 写法迁移钉钉清单，区分 uni、dd、dingtalk-jsapi 的替换边界，附条件编译和适配层代码模板。"
category: "钉钉"
tags:
  - "uni-app"
  - "钉钉小程序"
  - "wx替换"
  - "条件编译"
  - "dingtalk-jsapi"
status: "published"
sortOrder: 130
cover: ""
originalId: "6a2d29208a2b1c68f2cac7a2"
originalSlug: "uni-app-uni-app-wx-616a50b5"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 13 篇：uni-app 项目 wx 替换清单：uni、dd、dingtalk-jsapi、条件编译、适配层模板

> 这篇文章就是给你拿去开改项目用的。
>
> 它不讲“钉钉是什么”，也不讲“开放平台是什么”，而是专门解决一个很实际的问题：
>
> `我项目里已经有一堆 wx.* 了，现在迁到钉钉，到底怎么替？`

## 一、先记一句最重要的话

不是所有 `wx.*` 都应该替换成 `dd.*`。

更准确的思路是：

### 第一类：通用小程序能力

优先改成 `uni.*`

例如：

- 请求
- 跳转
- 存储
- Toast
- Loading
- 上传下载

### 第二类：钉钉容器专属能力

改成：

- `dd.*`
- `dingtalk-jsapi`

例如：

- 免登
- 选人
- 选部门
- 组织能力

### 第三类：微信专属业务能力

不要直接替换，应该重设计。

例如：

- 微信手机号授权
- 微信支付
- 微信订阅消息
- 微信开放数据组件

一句话版本：

`能上 uni 的先上 uni，只有组织和容器能力才进钉钉专属层。`

## 二、先给你一张总表

| 你项目里可能看到的东西 | 推荐处理方式 | 备注 |
|---|---|---|
| `wx.request` | 改 `uni.request` | 通用能力，优先复用 |
| `wx.navigateTo` | 改 `uni.navigateTo` | 通用能力 |
| `wx.redirectTo` | 改 `uni.redirectTo` | 通用能力 |
| `wx.reLaunch` | 改 `uni.reLaunch` | 通用能力 |
| `wx.switchTab` | 改 `uni.switchTab` | 通用能力 |
| `wx.showToast` | 改 `uni.showToast` | 通用能力 |
| `wx.showLoading` | 改 `uni.showLoading` | 通用能力 |
| `wx.hideLoading` | 改 `uni.hideLoading` | 通用能力 |
| `wx.setStorageSync` | 改 `uni.setStorageSync` | 通用能力 |
| `wx.getStorageSync` | 改 `uni.getStorageSync` | 通用能力 |
| `wx.removeStorageSync` | 改 `uni.removeStorageSync` | 通用能力 |
| `wx.chooseImage` | 优先改 `uni.chooseImage` | 通用上传选择能力 |
| `wx.uploadFile` | 优先改 `uni.uploadFile` | 通用上传能力 |
| `wx.downloadFile` | 优先改 `uni.downloadFile` | 通用下载能力 |
| `wx.previewImage` | 改 `uni.previewImage` | 通用预览能力 |
| `wx.login` | 改 `dd.getAuthCode` + 后端换身份 | 这是免登链路，不是通用 API |
| 组织选人 | 改 `dingtalk-jsapi` 的 `complexPicker` | 钉钉组织能力 |
| `open-type="getPhoneNumber"` | 不要直接替 | 需重设计 |
| 微信支付 | 不要直接替 | 需单独确认产品方案 |
| 微信订阅消息 | 不要直接替 | 改工作通知/群消息/机器人消息 |

## 三、第一部分：这类 `wx.*`，你基本可以直接改成 `uni.*`

这是你最应该优先清理的一层。

### 1. 请求类

#### 原来

```js
wx.request({
  url: '/api/list',
  success(res) {
    console.log(res)
  }
})
```

#### 推荐改成

```js
uni.request({
  url: '/api/list',
  success(res) {
    console.log(res)
  }
})
```

### 2. 路由类

#### 原来

```js
wx.navigateTo({
  url: '/pages/detail/detail?id=1'
})
```

#### 推荐改成

```js
uni.navigateTo({
  url: '/pages/detail/detail?id=1'
})
```

同理：

- `wx.redirectTo` -> `uni.redirectTo`
- `wx.reLaunch` -> `uni.reLaunch`
- `wx.switchTab` -> `uni.switchTab`
- `wx.navigateBack` -> `uni.navigateBack`

### 3. 交互提示类

#### 原来

```js
wx.showToast({
  title: '保存成功',
  icon: 'success'
})
```

#### 推荐改成

```js
uni.showToast({
  title: '保存成功',
  icon: 'success'
})
```

同理：

- `wx.showLoading` -> `uni.showLoading`
- `wx.hideLoading` -> `uni.hideLoading`
- `wx.showModal` -> `uni.showModal`

### 4. 存储类

#### 原来

```js
wx.setStorageSync('token', token)
const token = wx.getStorageSync('token')
wx.removeStorageSync('token')
```

#### 推荐改成

```js
uni.setStorageSync('token', token)
const token = uni.getStorageSync('token')
uni.removeStorageSync('token')
```

### 5. 上传下载与预览

#### 原来

```js
wx.chooseImage({})
wx.uploadFile({})
wx.downloadFile({})
wx.previewImage({})
```

#### 推荐改成

```js
uni.chooseImage({})
uni.uploadFile({})
uni.downloadFile({})
uni.previewImage({})
```

### 这一类的结论

这类替换你可以理解成：

`先把微信写法整理成 uni 写法，后面迁钉钉才更顺。`

## 四、第二部分：`wx.login` 不要改成 `uni.login` 思维，而要改成“钉钉免登思维”

这是整个迁移里最关键的点。

### 微信里常见是

```js
wx.login({
  success(res) {
    console.log(res.code)
  }
})
```

### 钉钉官方小程序免登文档对应的是

```js
dd.getAuthCode({
  success: (res) => {
    console.log(res.authCode)
  }
})
```

### 你必须理解的区别

这不是“同一个 API 不同名字”，而是：

- 微信给你 `code`
- 钉钉给你 `authCode`
- 都要交给你自己的后端换身份

### 推荐做法：封成统一适配层

新建：

`src/utils/platformAuth.js`

```js
export function getPlatformAuthCode() {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    wx.login({
      success: (res) => resolve(res.code),
      fail: (err) => reject(err)
    })
    // #endif

    // #ifdef MP-DINGTALK
    dd.getAuthCode({
      success: (res) => resolve(res.authCode),
      fail: (err) => reject(err)
    })
    // #endif
  })
}
```

### 页面里怎么用

```js
import { getPlatformAuthCode } from '@/utils/platformAuth'

async function login() {
  const authCode = await getPlatformAuthCode()
  await uni.request({
    url: '/api/auth/login',
    method: 'POST',
    data: { authCode }
  })
}
```

### 这一块的结论

`登录一定要抽出来，不要在每个页面里到处写 wx.login / dd.getAuthCode。`

## 五、第三部分：组织选人、选部门，不要自己硬做，优先接钉钉组织能力

这类能力在学校场景很常见：

- 选择老师
- 选择班主任
- 选择教研组
- 选择部门

钉钉官方“小程序使用网页应用客户端 API”文档给了 `complexPicker` 示例。

### 第一步：安装 SDK

```bash
npm install dingtalk-jsapi --save
```

### 第二步：在 `app.js` 初始化

```js
import 'dingtalk-jsapi/entry/mobile'
```

### 第三步：封装选择器

新建：

`src/utils/platformPicker.js`

```js
// #ifdef MP-DINGTALK
import complexPicker from 'dingtalk-jsapi/api/biz/contact/complexPicker'
// #endif

export function pickUsersAndDepartments(options = {}) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-DINGTALK
    complexPicker({
      title: options.title || '请选择人员',
      corpId: options.corpId,
      multiple: options.multiple ?? true,
      maxUsers: options.maxUsers ?? 100,
      pickedUsers: options.pickedUsers || [],
      pickedDepartments: options.pickedDepartments || [],
      disabledUsers: [],
      disabledDepartments: [],
      requiredUsers: [],
      requiredDepartments: [],
      permissionType: 'GLOBAL',
      responseUserOnly: false,
      startWithDepartmentId: 0,
      onSuccess: (res) => resolve(res),
      onFail: (err) => reject(err)
    })
    // #endif

    // #ifdef MP-WEIXIN
    reject(new Error('当前未接入微信版组织选人能力'))
    // #endif
  })
}
```

### 页面里怎么用

```js
import { pickUsersAndDepartments } from '@/utils/platformPicker'

async function handlePickTeacher() {
  const result = await pickUsersAndDepartments({
    title: '请选择老师',
    corpId: this.corpId,
    multiple: true
  })

  console.log(result)
}
```

### 这一块的结论

`组织能力不要自己凭空造 UI，优先用钉钉已有能力。`

## 六、第四部分：这类微信专属能力，不要找“同名替换”，要换方案

这是最容易踩坑的一层。

### 1. `open-type="getPhoneNumber"`

#### 不要这么想

`微信按钮怎么写，钉钉就找一个类似按钮`

#### 更稳的做法

把需求拆开：

- 你拿手机号是为了识别用户？
- 还是为了注册绑定？
- 还是为了显示用户联系方式？

然后在钉钉里改成：

- 先组织免登拿身份
- 再做账号绑定
- 或让用户补充填写
- 或通过后端权限接口补齐

### 2. 微信支付

这一块不要自己偷偷开始改。

你应该先确认：

1. 钉钉版本到底还要不要支付
2. 如果要，支付对象是谁
3. 是机构结算还是个人支付
4. 支付入口要不要仍然放在小程序里

### 3. 微信订阅消息

钉钉里更像这些：

- 工作通知
- 企业群消息
- 企业机器人消息

所以不要按“订阅消息模板”思维迁移。

### 这一块的结论

`越是微信专属能力，越不要急着改代码，先确认钉钉里的业务替代方案。`

## 七、第五部分：给你 5 个最适合项目里直接建的适配文件

如果你现在准备开工，我建议你先把下面几个文件建起来。

### 1. `src/utils/platformAuth.js`

处理：

- 登录
- 获取平台凭证

### 2. `src/utils/platformPicker.js`

处理：

- 选人
- 选部门

### 3. `src/utils/platformMessage.js`

处理：

- 页面内消息提醒
- 前端和后端消息参数约定

### 4. `src/utils/platformStorage.js`

虽然大部分可以直接用 `uni.*`，但你如果想统一风格，也可以包一层：

```js
export function setToken(token) {
  uni.setStorageSync('token', token)
}

export function getToken() {
  return uni.getStorageSync('token')
}

export function clearToken() {
  uni.removeStorageSync('token')
}
```

### 5. `src/utils/platformRuntime.js`

用来统一判断当前平台。

```js
export function isDingTalkPlatform() {
  // #ifdef MP-DINGTALK
  return true
  // #endif

  // #ifndef MP-DINGTALK
  return false
  // #endif
}
```

## 八、第六部分：页面里最推荐怎么改

### 不推荐

```js
onLoad() {
  // #ifdef MP-WEIXIN
  wx.login(...)
  // #endif

  // #ifdef MP-DINGTALK
  dd.getAuthCode(...)
  // #endif
}
```

### 更推荐

```js
import { getPlatformAuthCode } from '@/utils/platformAuth'

export default {
  async onLoad() {
    const authCode = await getPlatformAuthCode()
    await this.fetchUserInfo(authCode)
  },
  methods: {
    async fetchUserInfo(authCode) {
      await uni.request({
        url: '/api/auth/login',
        method: 'POST',
        data: { authCode }
      })
    }
  }
}
```

### 这样做的好处

- 页面更干净
- 平台差异不散
- 后面你继续加飞书、企业微信，也有位置放

## 九、第七部分：给你一个“明天就能照着改”的顺序

如果你明天就开始动手，我建议你按这个顺序：

1. 先把所有 `wx.request`、`wx.navigateTo`、`wx.showToast`、`wx.setStorageSync` 统一改成 `uni.*`
2. 新建 `platformAuth.js`
3. 把所有 `wx.login` 收口到 `platformAuth.js`
4. 新建 `platformPicker.js`
5. 把所有“选老师、选部门”的自定义能力整理出来
6. 把 `open-type="getPhoneNumber"` 相关代码单独列清单，不要急着改
7. 把支付代码单独列清单，不要急着改
8. 把消息推送相关代码单独列清单，准备改成钉钉消息体系

### 这样做的核心目标

先把“能机械整理的”整理掉，再把“要设计方案的”单独拿出来。

## 十、再给你一个更短的速查版

### 可以直接替成 `uni.*`

- `wx.request`
- `wx.navigateTo`
- `wx.redirectTo`
- `wx.reLaunch`
- `wx.switchTab`
- `wx.showToast`
- `wx.showLoading`
- `wx.hideLoading`
- `wx.showModal`
- `wx.setStorageSync`
- `wx.getStorageSync`
- `wx.removeStorageSync`
- `wx.chooseImage`
- `wx.uploadFile`
- `wx.downloadFile`
- `wx.previewImage`

### 应该抽成钉钉专属适配层

- `wx.login`
- 组织选人
- 组织选部门
- 组织身份相关能力

### 不要直接找同名替换

- 微信手机号授权
- 微信支付
- 微信订阅消息
- 微信开放数据

## 十一、这篇清单主要参考的官方资料

### uni-app 官方

1. `package.json` 扩展配置
   https://uniapp.dcloud.net.cn/collocation/package.html

2. 条件编译处理多端差异
   https://uniapp.dcloud.net.cn/tutorial/platform.html

### 钉钉官方

1. 小程序应用免登
   https://open.dingtalk.com/document/dingstart/small-program-application-free-of-registration

2. 客户端 SDK 介绍
   https://open.dingtalk.com/document/dingstart/mini-app-client-jsapi-overview

3. 小程序使用网页应用客户端 API
   https://open.dingtalk.com/document/dingstart/mini-app-steps

## 十二、最后给你一句最实用的话

如果你现在已经被项目里一堆 `wx.*` 吓到了，你先不要想着全部改完。

你只要先完成这 3 件事：

1. 先把通用 `wx.*` 改成 `uni.*`
2. 再把登录抽成 `platformAuth.js`
3. 再把组织能力抽成 `platformPicker.js`

做到这一步，你的项目就已经从“微信绑死”走向“可迁移结构”了。
