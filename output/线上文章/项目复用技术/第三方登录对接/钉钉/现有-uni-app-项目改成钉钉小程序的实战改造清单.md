---
title: "现有 uni-app 项目改成钉钉小程序的实战改造清单"
slug: "uni-app-uni-app-5b84c227"
summary: "面向真实项目的 uni-app 到钉钉小程序改造清单，结合 uni-app 与钉钉开放平台官方资料，按排查、接入、改造、联调、发布的顺序拆解前端落地步骤。"
category: "钉钉"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "钉钉"
tags:
  - "uni-app"
  - "钉钉小程序"
  - "项目迁移"
  - "条件编译"
  - "dingtalk-jsapi"
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d29208a2b1c68f2cac79e"
originalSlug: "uni-app-uni-app-5b84c227"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.443Z"
updatedAt: "2026-06-13T14:09:43.237Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 现有 uni-app 项目改成钉钉小程序的实战改造清单

> 这篇文章不是讲“钉钉小程序从 0 新建一个 demo”，而是讲：
> 你手上已经有一个正在跑的 `uni-app` 项目，现在老板让你把它改成钉钉小程序，你到底应该怎么一步一步下手。

## 一、先说结论：别想着“整体重写”，应该想着“分层改造”

只要你现在这个项目真的是 `uni-app` 项目，而不是纯原生微信小程序项目硬塞进来的，那么迁移钉钉时最好的思路通常不是重写，而是：

1. 保留大部分页面和通用业务逻辑
2. 先新增一个钉钉编译目标
3. 把微信专属能力拆出来
4. 用条件编译和适配层把平台差异收口
5. 再去钉钉开发者工具联调和发布

一句话记忆：

`页面尽量复用，平台能力单独适配。`

## 二、第一步：先判断这个项目能不能“低成本迁移”

不要一上来就改代码，先做项目体检。

### 你先看这几个文件在不在

- `pages.json`
- `manifest.json`
- `App.vue`
- `main.js`
- `uni.scss`

如果这些都在，而且页面主要是 Vue SFC 写法，那基本就是标准 `uni-app` 项目。

### 再看代码里是不是大量用 `uni.*`

如果你看到的是这种：

```js
uni.request()
uni.navigateTo()
uni.showToast()
uni.setStorageSync()
```

那好消息是：

`这类代码大概率可以继续复用。`

### 但如果搜出来大量 `wx.*`，迁移成本就会上升

你先跑一轮搜索：

```bash
rg 'wx\\.' src
rg 'open-type|open-data|getPhoneNumber|WeixinJSBridge|mp-weixin' src
rg '支付|订阅消息|分享|客服|手机号|chooseMessageFile' src
```

你把结果先分成三堆：

#### 第一堆：通用逻辑

例如：

- 列表渲染
- 表单校验
- 页面跳转
- 普通接口请求

这类一般改动小。

#### 第二堆：微信写法但有 `uni` 替代

例如：

- `wx.request` -> `uni.request`
- `wx.navigateTo` -> `uni.navigateTo`
- `wx.setStorageSync` -> `uni.setStorageSync`

这类属于“整理代码风格”的工作。

#### 第三堆：微信专属业务能力

例如：

- `wx.login`
- 微信手机号授权
- 微信支付
- 微信订阅消息
- 微信开放数据组件
- 微信分享卡片

这类不是简单替换函数名，而是要重新设计钉钉版本能力。

## 三、第二步：先把钉钉编译目标接进 `uni-app`

这一块是整个迁移的起点。

根据 uni-app 官方 `package.json` 配置文档，钉钉小程序推荐按“自定义平台”方式接入。

官方示例的核心思想是：

- 自定义一个平台名，比如 `mp-dingtalk`
- 基准平台仍然是 `mp-alipay`
- 自定义一个条件编译常量 `MP-DINGTALK`

### 你可以在项目根目录 `package.json` 里加这样的配置

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

### 你要理解这 3 个关键点

#### 1. `mp-dingtalk`

这是你自己定义的平台名字。

#### 2. `UNI_PLATFORM: 'mp-alipay'`

这不是说你在做支付宝小程序，而是 uni-app 官方当前对钉钉的适配方式是基于这个基准平台。

#### 3. `MP-DINGTALK: true`

这意味着你可以在代码里写：

```js
// #ifdef MP-DINGTALK
// 这里写钉钉专属代码
// #endif
```

### 这一节最重要的认知

`以后你改钉钉，不是到处写 if/else，而是优先用条件编译。`

## 四、第三步：先别动业务，先证明“项目能编译到钉钉”

很多人最容易犯的错是：

- 编译目标都还没接好
- 就开始改登录、改支付、改组织架构

这样会很乱。

更稳的做法是：

1. 先加 `mp-dingtalk` 配置
2. 不改复杂业务
3. 先让首页跑起来
4. 确认页面能打开、样式没大面积炸掉
5. 再开始逐项改平台能力

这一步的目标不是“功能全通”，而是：

`先证明编译链路和运行链路通了。`

## 五、第四步：马上建立“适配层”，不要把平台判断写散

这是整个迁移里我最推荐你尽早做的事情。

### 错误写法是什么

在每个业务页面里到处写：

```js
if (isWechat) {
  wx.login()
}

if (isDingTalk) {
  dd.getAuthCode()
}
```

或者：

```js
// #ifdef MP-WEIXIN
// 页面里直接写一大段微信逻辑
// #endif

// #ifdef MP-DINGTALK
// 页面里再写一大段钉钉逻辑
// #endif
```

这样页面很快就会烂掉。

### 正确思路是什么

把平台差异集中到少量模块里，例如：

- `src/utils/platformAuth.js`
- `src/utils/platformUserPicker.js`
- `src/utils/platformUpload.js`
- `src/utils/platformBridge.js`

业务页面只调统一方法，不关心底层到底是微信还是钉钉。

## 六、第五步：第一个必须拆出来的，就是登录

这是最关键的一块。

### 微信侧你常见到的是

```js
wx.login({
  success(res) {
    console.log(res.code)
  }
})
```

### 钉钉官方小程序免登文档里，核心入口是

```js
dd.getAuthCode({
  success: (res) => {
    console.log(res.authCode)
  }
})
```

所以你要先接受一个现实：

`微信登录和钉钉免登不是一回事。`

### 前端该怎么改

你应该自己封一个统一的入口，比如：

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

### 但你必须再记住一句话

前端拿到：

- 微信的 `code`
- 钉钉的 `authCode`

都不等于“前端已经登录完成”。

真正的流程应该是：

1. 前端拿到平台凭证
2. 前端把凭证发给你自己的后端
3. 后端再和微信或钉钉服务端做身份交换
4. 后端给你自己系统的登录态

## 七、第六步：把“人员、部门选择”这类能力单独封装

这类需求在教育项目里很常见。

比如：

- 选老师
- 选班主任
- 选组织部门
- 选年级组

钉钉官方“小程序使用网页应用客户端 API”文档里给了 `complexPicker` 示例，说明钉钉这类能力一般通过 `dingtalk-jsapi` 调用。

### 你可以怎么做

先安装：

```bash
npm install dingtalk-jsapi --save
```

然后在适配层里封装：

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
    reject(new Error('当前平台未接入微信版选人能力'))
    // #endif
  })
}
```

### 这样做的好处

以后业务页面只需要写：

```js
const result = await pickUsersAndDepartments({ corpId })
```

而不是在每个页面都直接碰 `complexPicker`。

## 八、第七步：保留 `uni.request`，把钉钉专属能力和通用请求分开

很多人迁移时会问：

`都到钉钉了，我是不是所有请求都要改成 dd.httpRequest？`

我给你的建议是：

`普通业务请求优先继续用 uni.request，钉钉专属能力再单独用 dd / dingtalk-jsapi。`

### 为什么

因为普通接口请求本来就是跨平台能力，`uni.request` 更利于复用。

而钉钉专属能力，例如：

- 免登
- 选人
- 选部门
- 客户端信息

这类才适合放到钉钉适配层里。

### 这样分工更清晰

#### 通用层

- `uni.request`
- `uni.uploadFile`
- `uni.navigateTo`
- `uni.setStorageSync`

#### 钉钉专属层

- `dd.getAuthCode`
- `dingtalk-jsapi`
- 组织通讯录相关能力
- 钉钉容器能力

## 九、第八步：把微信专属组件和页面交互先列清单

这一块很多人会漏。

不是只有 JS API 需要改，模板层也可能有坑。

### 你重点搜这些

```bash
rg 'open-type|open-data|button' src
rg 'share|订阅|手机号|支付|客服' src
```

### 你要特别小心这几类

#### 1. `open-type`

微信很多按钮能力依赖这个属性。

到钉钉里，通常不能原样照搬。

#### 2. 微信手机号授权

这类往往不是直接替换，而是要改成：

- 钉钉免登识别员工
- 或者让用户自己填手机号
- 或者走学校账号体系绑定

#### 3. 订阅消息

微信的订阅消息和钉钉消息体系不是同一个东西。

#### 4. 分享能力

微信的分享语义和钉钉也不完全一样。

### 这一步你应该怎么做

不要边扫边改。

先整理成表格最稳：

| 功能点 | 微信实现 | 钉钉是否有等价能力 | 改造方案 |
|---|---|---|---|
| 登录 | `wx.login` | 有 | 改 `dd.getAuthCode` + 后端联调 |
| 选人 | 微信自定义或无 | 有 | 改 `complexPicker` |
| 手机号授权 | 微信能力 | 未必直接等价 | 改成员工身份绑定/表单输入 |
| 支付 | 微信支付 | 需单独确认 | 可能重做业务流程 |

你不一定真写成表格，但脑子里必须是这个思路。

## 十、第九步：用条件编译做“页面级”和“逻辑级”差异

uni-app 官方“条件编译处理多端差异”文档，就是你这一阶段最该反复看的文档。

### 你最常用到的会是这 3 种

#### 1. 微信专属

```js
// #ifdef MP-WEIXIN
// 微信平台代码
// #endif
```

#### 2. 钉钉专属

```js
// #ifdef MP-DINGTALK
// 钉钉平台代码
// #endif
```

#### 3. 小程序通用

```js
// #ifdef MP
// 所有小程序平台通用代码
// #endif
```

### 一个实用例子：页面进入时自动登录

```js
onLoad() {
  // #ifdef MP-DINGTALK
  this.loginByDingTalk()
  // #endif

  // #ifdef MP-WEIXIN
  this.loginByWechat()
  // #endif
}
```

### 但是注意

不要把整个页面都复制成两份，除非真的差异非常大。

优先顺序应该是：

1. 页面结构复用
2. 逻辑差异抽函数
3. 函数内部做条件编译
4. 只有在差异特别大时才拆页面

## 十一、第十步：如果要在钉钉里调 JSAPI，记得全局初始化

根据钉钉官方“小程序使用网页应用客户端 API”文档，项目里通常要：

1. 安装 `dingtalk-jsapi`
2. 在 `app.js` 顶部引入：

```js
import 'dingtalk-jsapi/entry/mobile'
```

### 这一步你不要拖到后面

因为很多钉钉能力，如果你没把 SDK 初始化好，后面页面里即使 import 了 API，也容易出现各种联调混乱。

## 十二、第十一步：安全域名必须尽早配，不要等到最后

钉钉官方“配置安全域名”文档里这一点说得非常重。

### 你至少要准备 3 类配置

#### 1. HTTP 可信域名

给小程序接口请求用。

#### 2. Webview 可信域名

如果你项目里有 `web-view`，就必须配。

#### 3. 本地联调地址

如果你本地要联调后端，还要考虑本地测试的地址策略。

### 你要牢牢记住一句话

`安全域名变更以后，要重新构建、重新上传版本，不是后台点保存就完事。`

## 十三、第十二步：给自己定一个“联调顺序”，别一口气全测

你要是把全部功能一股脑搬过去，一定会乱。

### 我建议你这样联调

#### 第一轮：只看壳子活不活

1. 应用能打开
2. 首页不白屏
3. 路由跳转正常
4. 静态资源加载正常

#### 第二轮：只看登录链路

1. `dd.getAuthCode` 能拿到值
2. 前端能把值发给后端
3. 后端能返回系统登录态
4. 用户信息能展示

#### 第三轮：只看组织能力

1. 选人
2. 选部门
3. 学校维度权限
4. 角色菜单

#### 第四轮：只看业务功能

1. 列表
2. 详情
3. 表单提交
4. 上传下载

### 这样做的意义

出了问题时你知道是哪一层坏了，而不是全部糊在一起。

## 十四、第十三步：教育行业项目还要额外检查“学校维度”

这一步是你这种项目特有的重点。

因为你们不是单组织内部工具，而是教育公司给多所学校提供能力。

### 所以后端和前端都要开始有“租户意识”

你要想这些问题：

1. 当前用户属于哪所学校
2. 这所学校有没有开通钉钉应用
3. 用户是老师、家长还是管理员
4. 不同学校菜单是不是一样
5. 请求接口时需不需要带学校维度参数

### 前端最常见的改法

登录成功后，在全局状态里明确保存：

- `tenantId`
- `schoolId`
- `corpId`
- `roleCode`

然后后面：

- 菜单渲染
- 页面入口
- 权限判断
- 接口请求头

都围绕这些字段做。

## 十五、第十四步：怎么上传、体验和发布

这一块你可以按钉钉官方文档的标准顺序走：

1. 在开发者工具里确认项目编译通过
2. 点击上传
3. 生成开发版本
4. 在后台设为体验版
5. 让测试同事、老板、学校方去体验
6. 再决定是否发布

### 你在这一阶段最该做的是

不要急着说“上线”。

而是要先拿到一个稳定的体验版，让学校方或内部同事验证：

- 能不能打开
- 登录对不对
- 权限对不对
- 组织关系对不对
- 页面有没有炸

## 十六、给你一份可以直接照着做的执行清单

如果你明天就开始改项目，我建议你按这个顺序推进：

1. 全局搜索微信专属代码
2. 把结果分成“通用 / 可替换 / 必须重做”三类
3. 在 `package.json` 接入 `mp-dingtalk`
4. 先把首页编译到钉钉跑起来
5. 新建钉钉适配层模块
6. 先改登录
7. 再改选人、选部门
8. 保留 `uni.request`，不要过早重构普通请求层
9. 配安全域名
10. 跑通登录联调
11. 再逐个修业务页面
12. 上传开发版本
13. 设体验版验证
14. 最后再走正式发布

## 十七、我最建议你优先改的 4 个文件区域

如果你的时间特别紧，我建议你先盯这几个区域：

### 1. 登录入口

比如：

- `src/pages/login`
- `src/store/user`
- `src/utils/auth`

### 2. 请求封装层

比如：

- `src/utils/request.js`
- `src/api/index.js`

### 3. 平台桥接层

比如你新建：

- `src/utils/platformAuth.js`
- `src/utils/platformPicker.js`

### 4. 菜单和首页

因为这是最容易先验证成败的地方。

## 十八、这篇实战清单主要参考的官方资料

### uni-app 官方

1. `package.json` 扩展配置
   https://uniapp.dcloud.net.cn/collocation/package.html

2. 条件编译处理多端差异
   https://uniapp.dcloud.net.cn/tutorial/platform.html

### 钉钉官方

1. 应用类型介绍
   https://open.dingtalk.com/document/dingstart/application-type-introduction

2. 第三方企业应用学习指南
   https://open.dingtalk.com/document/dingstart/isv-learning-map

3. 开发小程序前端
   https://open.dingtalk.com/document/dingstart/develop-miniapp-fe

4. 客户端 SDK 介绍
   https://open.dingtalk.com/document/dingstart/mini-app-client-jsapi-overview

5. 小程序使用网页应用客户端 API
   https://open.dingtalk.com/document/dingstart/mini-app-steps

6. 小程序应用免登
   https://open.dingtalk.com/document/dingstart/small-program-application-free-of-registration

7. 配置安全域名
   https://open.dingtalk.com/document/dingstart/configure-secure-domain-name

8. 上传小程序
   https://open.dingtalk.com/document/dingstart/upload-miniapp

## 十九、最后送你一句最务实的话

你现在不要把目标定成：

`我要一次性把整个微信小程序完美迁到钉钉。`

你应该把目标拆成：

1. 先让首页在钉钉里跑起来
2. 再把登录链路改通
3. 再把学校维度权限理顺
4. 最后才是把所有业务页补齐

只要你按这个顺序做，这件事就会从“很吓人”变成“有清单可推进”。
