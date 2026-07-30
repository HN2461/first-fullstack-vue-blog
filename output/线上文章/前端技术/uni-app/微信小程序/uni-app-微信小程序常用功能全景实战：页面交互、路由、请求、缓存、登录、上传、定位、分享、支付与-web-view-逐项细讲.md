---
title: "uni-app 微信小程序常用功能全景实战：页面交互、路由、请求、缓存、登录、上传、定位、分享、支付与 web-view 逐项细讲"
slug: "uni-app-uni-app-web-view-b6e991ff"
summary: "面向基础还不牢的新手，按真实业务顺序把 uni-app 做微信小程序时最常用的功能几乎都过一遍，讲清页面交互、跳转、请求、缓存、登录、手机号、上传下载、定位、扫码、分享、支付、web-view、订阅消息和权限处理。"
category: "微信小程序"
categoryPath:
  - "前端技术"
  - "uni-app"
  - "微信小程序"
tags:
  - "uni-app"
  - "微信小程序"
  - "能力接入"
  - "登录"
  - "分享"
  - "支付"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291e8a2b1c68f2cac22e"
originalSlug: "uni-app-uni-app-web-view-b6e991ff"
originalStatus: "published"
publishedAt: "2026-04-03T13:55:17.904Z"
updatedAt: "2026-06-13T10:28:27.891Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# uni-app 微信小程序常用功能全景实战：页面交互、路由、请求、缓存、登录、上传、定位、分享、支付与 web-view 逐项细讲

> 这是这一组 `uni-app 微信小程序` 笔记的第 8 篇。  
> 截至 `2026-04-02`，这一篇我不再只讲“大框架”，而是专门按新手真正会碰到的功能场景，一项一项掰开讲。  
> 你可以把它当成一份 `uni-app 做微信小程序时的常用能力手册`。以后你写页面卡住了，不一定非要从头通读，直接按目录定位功能也可以。

> 建议先读 `uni-app/通用基础`：
> 1. 第 1 篇《uni-app 到底是什么：跨端编译、运行时与平台边界》
> 2. 第 4 篇《uni-app 跨端开发通用方法：路由、请求、缓存、上传下载与条件编译》
> 这一篇我会默认你已经知道 `uni.*` 的基本概念，所以不会只停留在“API 是什么”，而会继续讲“这段代码为什么要这么写、每一步在负责什么、真实业务里最容易在哪一层写乱”。

> 这篇的使用方式也建议你先记一下：
> 1. 如果你是新手，按目录从上往下看，会更容易建立一条完整业务链。
> 2. 如果你在维护老项目，可以直接跳到对应功能章节，把“示例代码 + 代码解释 + 常见坑”对照着改。
> 3. 如果某个能力已经在前面专题篇里讲得更深，我会把这里保留成“够用手册版”，重点放在落地判断和代码阅读上。

## 一、先给你一张功能地图：你平时写页面，最常碰到的其实就是这些

| 场景 | 你最常写的能力 | 常见 API | 先用谁 |
| --- | --- | --- | --- |
| 页面反馈 | 提示、确认框、加载中、操作菜单 | `uni.showToast`、`uni.showModal`、`uni.showLoading`、`uni.showActionSheet` | 优先 `uni.*` |
| 页面跳转 | 列表进详情、登录后回跳、切 tab | `uni.navigateTo`、`uni.redirectTo`、`uni.switchTab`、`uni.reLaunch`、`uni.navigateBack` | 优先 `uni.*` |
| 请求接口 | 拉列表、提表单、查详情 | `uni.request` | 优先 `uni.*` |
| 本地缓存 | token、草稿、最近选择项 | `uni.setStorageSync`、`uni.getStorageSync` | 优先 `uni.*` |
| 登录 | 换微信登录凭证、换业务 token | `uni.login`、`uni.checkSession` | 优先 `uni.*` |
| 资料补全 | 头像、昵称 | `open-type="chooseAvatar"`、`type="nickname"` | 微信协议能力 |
| 手机号 | 快速绑定手机号 | `open-type="getPhoneNumber"` | 微信协议能力 |
| 媒体文件 | 选图、拍照、上传、下载、预览 | `uni.chooseImage`、`uni.uploadFile`、`uni.downloadFile`、`uni.previewImage` | 优先 `uni.*` |
| 位置地图 | 定位、选门店、打开地图导航 | `uni.getLocation`、`uni.chooseLocation`、`uni.openLocation` | 优先 `uni.*` |
| 扫码剪贴板 | 扫活动码、复制口令 | `uni.scanCode`、`uni.setClipboardData` | 优先 `uni.*` |
| 分享 | 转发给好友、分享到朋友圈 | `onShareAppMessage`、`onShareTimeline` | 微信页面协议 |
| 订阅消息 | 下单后提醒发货、到店提醒 | `wx.requestSubscribeMessage` | 微信专属能力 |
| 支付 | 订单支付、充值支付 | `wx.requestPayment` | 微信专属能力 |
| H5 承接 | 协议页、活动页、外部业务页 | `web-view`、`postMessage` | 微信容器能力 |
| 权限恢复 | 相册、定位、相机被拒后恢复 | `uni.getSetting`、`uni.openSetting` | 优先 `uni.*` |

如果你先把这张表记住，后面就不容易乱。

很多新手最容易犯的错，不是不会写代码，而是把这几类东西全混在一起：

1. `uni-app` 已经封装好的通用能力
2. 微信小程序页面协议能力
3. 微信专属开放能力
4. `web-view` 这种宿主容器能力

一旦你脑子里先把层次分开，很多“为什么明明能跑却总出怪问题”的坑，就会少一大半。

## 二、先用一个真实业务场景把全文串起来

为了不讲空，我下面都围绕一个真实感比较强的小程序来讲。

假设你在做一个 `门店活动报名 + 商品购买` 的微信小程序，常见页面会是这样：

1. 首页：活动列表、推荐商品、门店入口
2. 活动详情页：报名按钮、分享按钮
3. 登录/资料补全页：微信登录、头像昵称、手机号
4. 订单确认页：地址、门店、优惠券、支付
5. 订单列表页：支付结果、订阅消息、联系客服
6. 协议页/H5 活动页：用 `web-view` 承接

你会发现，大部分功能都不是孤立存在的，而是一条链：

`进页面 -> 看提示 -> 拉数据 -> 没登录就登录 -> 补手机号 -> 选图上传 -> 选门店 -> 下单支付 -> 订阅消息 -> 分享给朋友 -> 需要时跳 web-view`

所以这一篇不是在给你背 API 清单，而是在告诉你：

`这些能力在真实 uni-app 微信小程序项目里，应该按什么顺序理解，应该怎么串起来用。`

## 三、页面交互能力：提示、确认、加载中这些最基础，但也最容易写乱

很多新手一上来就盯着登录、支付、分享，结果最基础的页面反馈反而写得很乱。

你至少要先把下面 4 个能力用顺：

1. `uni.showToast`
2. `uni.showLoading` 和 `uni.hideLoading`
3. `uni.showModal`
4. `uni.showActionSheet`

### 1. `showToast` 适合轻提示，不适合承担完整错误说明

适合：

- 保存成功
- 网络开小差
- 请先选择图片
- 手机号绑定成功

不适合：

- 一大段后端报错堆栈
- 很长的业务规则说明
- 需要二次确认的危险操作

### 2. `showLoading` 一定要和 `hideLoading` 成对出现

很多页面会出“永远转圈”的问题，不是接口没返回，而是你漏了 `hideLoading`。

最稳的写法是放到 `try/finally` 里：

```js
export async function submitActivity(payload) {
  uni.showLoading({
    title: '提交中...'
  })

  try {
    const result = await request({
      url: '/activity/signup',
      method: 'POST',
      data: payload
    })

    uni.showToast({
      title: '报名成功',
      icon: 'success'
    })

    return result
  } catch (error) {
    uni.showToast({
      title: error.message || '提交失败',
      icon: 'none'
    })
    throw error
  } finally {
    uni.hideLoading()
  }
}
```

这段提交代码建议你抓住 4 个阅读点：

1. `uni.showLoading` 和 `uni.hideLoading()` 被 `try/finally` 包住，说明“无论成功失败都要关 loading”是硬规则。
2. `request(...)` 被单独抽成请求层，所以这里的职责只剩“发起一次报名提交”。
3. `catch` 分支里先给用户提示，再把错误继续 `throw` 出去，是为了让上层页面还有机会决定要不要回滚 UI。
4. 这种写法非常适合提交表单、支付前置、审批确认等所有“有 loading + 有失败提示 + 有结果回传”的动作。

### 3. `showModal` 用来做“你确定吗”

比如：

- 确认删除草稿
- 放弃当前编辑
- 去设置页打开权限
- 支付前再次确认金额

它不是为了好看，而是为了拦危险操作。

### 4. `showActionSheet` 适合“给几个并列选择”

比如：

- 拍照还是从相册选
- 上传身份证正面还是反面
- 导航去门店还是复制地址

一个典型组合是：

```js
export function chooseImageSource() {
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: ({ tapIndex }) => {
        resolve(tapIndex === 0 ? 'camera' : 'album')
      },
      fail: reject
    })
  })
}
```

### 5. 页面反馈最容易踩的 4 个坑

1. 错误一来就一股脑 `toast`，用户根本看不懂
2. `showLoading` 开了以后，没有在失败分支关闭
3. 危险操作不确认，用户误删后只能找你
4. 把所有弹层都放在 `onLoad` 自动弹，体验非常差

## 四、页面跳转：五个方法一定要分清，不然页面栈会越来越乱

在小程序里，跳转不是“随便换个 URL”那么简单。

最常用的 5 个方法是：

| 方法 | 适合什么场景 | 你可以怎么理解 |
| --- | --- | --- |
| `uni.navigateTo` | 列表进详情、详情进编辑页 | 往前再压一层页面 |
| `uni.redirectTo` | 当前页不需要保留，比如登录页跳回业务页 | 用新页替掉当前页 |
| `uni.switchTab` | 切 `tabBar` 页 | 只能去 tab 页 |
| `uni.reLaunch` | 重新回到首页或主流程起点 | 清空旧链路，重新开局 |
| `uni.navigateBack` | 返回上一页或返回多层 | 退栈 |

### 1. 最常见的真实用法

活动列表进详情：

```js
uni.navigateTo({
  url: '/pages/activity/detail?id=1001'
})
```

登录成功后不想留登录页：

```js
uni.redirectTo({
  url: '/pages/order/confirm?id=1001'
})
```

支付完成后直接回订单列表：

```js
uni.reLaunch({
  url: '/pages/order/list'
})
```

切到底部 tab 的“我的”：

```js
uni.switchTab({
  url: '/pages/mine/index'
})
```

### 2. 什么时候别乱跳

下面这些情况最容易把流程弄乱：

1. 已经在登录页了，还继续 `navigateTo` 登录页
2. 从 `tabBar` 页去另一个 `tabBar` 页还想用 `navigateTo`
3. 明明只是登录后回跳，却层层叠加页面
4. 分享进入页、扫码进入页、支付回流页全都各写一套跳转逻辑

### 3. 新手特别容易漏的两个细节

1. `switchTab` 不是万能跳转，它只负责去 `tabBar` 页面
2. 复杂参数不要无限塞进 URL，能存本地草稿或由后端查详情时，就别把整个对象都拼进 query

## 五、请求接口：不要在每个页面里散着写一堆 `uni.request`

新手最常见的写法是：

1. 页面 A 自己拼 token
2. 页面 B 自己判断状态码
3. 页面 C 自己弹错误提示
4. 页面 D 又自己写一遍超时和重试

这样项目一大，后面根本收不回来。

更稳的思路是统一封装一层请求函数。

```js
export function request(options = {}) {
  const token = uni.getStorageSync('token')

  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://api.example.com${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        ...(options.header || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (res) => {
        const data = res.data || {}

        if (res.statusCode === 401) {
          reject(new Error('登录已失效，请重新登录'))
          return
        }

        if (res.statusCode >= 400) {
          reject(new Error(data.message || '请求失败'))
          return
        }

        resolve(data)
      },
      fail: (error) => {
        reject(new Error(error.errMsg || '网络异常'))
      }
    })
  })
}
```

这个请求封装的关键不是代码长短，而是它把通用规则都收拢进了一处：

1. `const token = uni.getStorageSync('token')` 只负责取业务 token，不碰微信 `code`、`session_key` 这类底层状态。
2. `url`、`method`、`data` 都由 `options` 传入，说明业务层只需要关心本次请求本身的输入。
3. `header` 里合并 `Authorization`，避免每个页面自己重复拼 token。
4. `401` 被单独拦出来，是为了让后续统一接“登录失效怎么办”的链路。
5. `res.statusCode >= 400` 和 `fail` 分支分别代表“服务端返回错误”和“网络层失败”，排查问题时要分层看。

### 1. 为什么我建议你先封这一层

因为后面这些东西都会用到它：

- 登录换 token
- 拉活动详情
- 绑定手机号
- 上传后回写文件地址
- 支付前拿预支付参数
- 订阅消息后记录用户选择

### 2. 请求能力最容易踩的 5 个坑

1. 域名白名单没配，代码写得再对也发不出去
2. 页面里散着写 token 拼装，后面改 header 规则时全项目一起改
3. 把接口失败直接当成“页面空白”，不提示用户
4. 接口返回慢时没有 loading，用户以为按钮没点上
5. 登录失效了不做统一处理，导致每个页面都各自报错

## 六、本地缓存：不是所有东西都适合存，也不是存了就一劳永逸

微信小程序里，本地缓存真的很好用，但别滥用。

### 1. 最适合缓存的内容

- 业务 token
- 已登录用户的基础资料
- 草稿表单
- 最近选择的门店、城市、筛选条件
- 已读提示标记

### 2. 不建议长期缓存的内容

- `uni.login` 换回来的短期 `code`
- `session_key`
- 超大的列表响应
- 安全敏感且应该实时校验的服务端结果

### 3. 一套够用的缓存封装

```js
export const storageKeys = {
  token: 'token',
  userInfo: 'userInfo',
  selectedStore: 'selectedStore',
  orderDraft: 'orderDraft'
}

export function saveOrderDraft(draft) {
  uni.setStorageSync(storageKeys.orderDraft, draft || {})
}

export function getOrderDraft() {
  return uni.getStorageSync(storageKeys.orderDraft) || {}
}

export function clearOrderDraft() {
  uni.removeStorageSync(storageKeys.orderDraft)
}
```

### 4. 缓存最容易踩的 4 个坑

1. 把旧草稿永远留着，结果用户下次进来看到过期数据
2. 本地 token 过期了还照用，不校验
3. 以为本地有缓存就不用再请求服务端
4. 重要业务数据只存本地，不做后端兜底

## 七、登录：你要真正搞清楚的是“微信登录”和“业务登录”是两层

这是新手最容易绕晕的地方。

你要先记住一句话：

`uni.login` 拿到的是微信侧登录凭证，不是你项目最终可用的业务 token。

更稳的流程应该是：

1. 前端调用 `uni.login`
2. 拿到微信返回的 `code`
3. 立即发给后端
4. 后端通过微信侧接口换身份信息
5. 后端签发你自己系统的业务 token
6. 前端把业务 token 缓存起来

示例：

```js
export function loginByWechatMiniProgram() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (!loginRes.code) {
          reject(new Error('微信登录失败，未拿到 code'))
          return
        }

        uni.request({
          url: 'https://api.example.com/auth/wechat-mini/login',
          method: 'POST',
          data: {
            loginCode: loginRes.code
          },
          success: (requestRes) => {
            const data = requestRes.data || {}

            uni.setStorageSync('token', data.token || '')
            uni.setStorageSync('userInfo', data.userInfo || {})
            resolve(data)
          },
          fail: reject
        })
      },
      fail: reject
    })
  })
}
```

这段登录代码和第 3 篇专题篇是一致的，但在这份手册里你尤其要记住 5 个动作：

1. `uni.login` 先向微信宿主拿 `code`，它只解决“微信身份入口”。
2. `loginCode: loginRes.code` 这个命名是故意的，就是为了和手机号链路里的 `phoneCode` 区分。
3. `uni.request` 发给的是你自己的后端登录接口，业务 token 必须由后端签发。
4. `uni.setStorageSync('token', ...)` 说明前端后续实际带着跑业务的是你的业务登录态。
5. 只要你把这段逻辑收成一个函数，后面页面守卫、401 重登、登录后回跳都会好接很多。

### 1. 登录这一块最重要的 4 个认识

1. `code` 不是永久票据，别拿了不立刻用
2. `uni.checkSession` 检查的是微信登录态，不等于你的业务 token 一定有效
3. `session_key` 不应该存前端
4. 你的页面不用每打开一次就重新 `uni.login`

### 2. 更像真实项目的做法

更推荐你做成：

- `App` 启动时检查本地 token
- 需要身份的页面再做登录守卫
- 401 时统一走“重新登录或刷新 token”
- 登录成功后回原业务页，而不是把页面栈搞乱

如果你对登录态恢复、`session_key`、前后台切换后的稳定性更关心，继续看第 6 篇会更深入。

## 八、头像昵称：别把它和登录强绑，很多项目更适合做成“补资料”

现在做新项目，我更建议把“头像昵称”理解成资料补全能力，而不是登录主链路的一部分。

原因很简单：

1. 用户先登录，不一定马上愿意补全资料
2. 头像昵称拿到了，也不等于你的业务资料就完整了
3. 很多业务真正需要的是“先识别身份，再引导补资料”

一个更稳的页面写法示意：

```vue
<template>
  <view class="profile-form">
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="chooseAvatar" class="avatar-btn" @chooseavatar="onChooseAvatar">
      <image :src="form.avatarUrl || defaultAvatar" class="avatar" mode="aspectFill" />
    </button>

    <input
      type="nickname"
      :value="form.nickName"
      placeholder="请输入昵称"
      @blur="onNicknameBlur"
    />
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      defaultAvatar: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
      form: {
        avatarUrl: '',
        nickName: ''
      }
    }
  },
  methods: {
    onChooseAvatar(e) {
      this.form.avatarUrl = e.detail.avatarUrl || ''
    },
    onNicknameBlur(e) {
      this.form.nickName = (e.detail.value || '').trim()
    }
  }
}
</script>
```

### 1. 这里真正要做的事情

1. 前端先拿到头像临时地址和昵称输入值
2. 再交给你自己的后端存业务资料
3. 后端按你自己的规则决定是否审核、是否落库

### 2. 最容易踩的坑

1. 把开发者工具效果当成真机最终效果
2. 拿到头像昵称后，直接认为资料一定可靠
3. 把资料补全和登录链路写死绑在一起

## 九、手机号：最容易混淆的不是写法，而是“这又是另一条独立链路”

手机号能力你一定要单独记住，因为它和 `uni.login` 的 `code` 不是同一种东西。

你可以这样理解：

1. `uni.login` 的 `code` 用来换微信登录身份
2. `getPhoneNumber` 回调里的 `code` 用来换手机号

它们都叫 `code`，但用途完全不同。

### 1. 正常接法

```vue
<template>
  <!-- #ifdef MP-WEIXIN -->
  <button open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
    绑定手机号
  </button>
  <!-- #endif -->
</template>

<script>
export default {
  methods: {
    async onGetPhoneNumber(e) {
      const { code, errMsg } = e.detail || {}

      if (!code) {
        uni.showToast({
          title: errMsg || '用户未授权手机号',
          icon: 'none'
        })
        return
      }

      await request({
        url: '/user/bind-phone',
        method: 'POST',
        data: {
          phoneCode: code
        }
      })

      uni.showToast({
        title: '手机号绑定成功',
        icon: 'success'
      })
    }
  }
}
</script>
```

这段手机号代码最适合拿来提醒自己“两个 code 不是一回事”：

1. `open-type="getPhoneNumber"` 决定了它必须由用户点击触发，不能改造成静默流程。
2. `const { code, errMsg } = e.detail || {}` 这里拿到的是“换手机号用的凭证”，不是登录凭证。
3. `request({ url: '/user/bind-phone', ... })` 说明手机号绑定最好走统一请求层，而不是在页面里直接散写 `uni.request`。
4. 绑定成功后最好继续补一件事：刷新本地 `userInfo`，否则页面上的手机号展示可能还是旧数据。

### 2. 这里最重要的 5 个实战提醒

1. 字段名最好明确区分成 `loginCode` 和 `phoneCode`
2. 手机号能力要靠用户点击触发，不要页面一进来就乱弹
3. 绑定手机号成功后，要同步刷新本地用户资料
4. 手机号能力通常有官方计费和规则要求，接入前要同步产品和运营
5. 不要把“登录成功”和“手机号已绑定”混成一个状态

## 十、上传、下载、预览、打开文档：这是小程序里非常高频的一组能力

很多业务场景都会用到它：

- 上传头像
- 上传报销单
- 上传身份证照片
- 下载活动海报
- 下载 PDF 报告
- 打开说明文档

### 1. 先分成三步理解

1. 选文件
2. 上传或下载
3. 预览、保存或打开

### 2. 你会高频用到的 API

- `uni.chooseImage`
- `uni.chooseMedia`
- `uni.chooseVideo`
- `uni.previewImage`
- `uni.uploadFile`
- `uni.downloadFile`
- `uni.saveFile`
- `uni.openDocument`

如果你要选的是聊天文件、非媒体文件，微信环境下还可能会碰到 `wx.chooseMessageFile`，这种就要用 `#ifdef MP-WEIXIN` 收口。

### 3. 一个比较稳的上传流程

```js
export function uploadVoucher(filePath) {
  return new Promise((resolve, reject) => {
    const uploadTask = uni.uploadFile({
      url: 'https://api.example.com/common/upload',
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${uni.getStorageSync('token')}`
      },
      formData: {
        bizType: 'voucher'
      },
      success: (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`上传失败，状态码：${res.statusCode}`))
          return
        }

        resolve(JSON.parse(res.data || '{}'))
      },
      fail: reject
    })

    uploadTask.onProgressUpdate((progressRes) => {
      console.log('上传进度', progressRes.progress)
    })
  })
}
```

上传这段代码你要重点看“职责拆分”：

1. 上层只传 `filePath`，说明选文件这件事和上传实现被拆开了。
2. `Authorization` 放 header，`bizType` 放 `formData`，这样认证信息和业务语义不会混在一起。
3. `res.statusCode !== 200` 先挡 HTTP 层错误，再解析 `res.data`，方便你判断到底是网络问题还是业务返回问题。
4. `uploadTask.onProgressUpdate` 给了你接进度条和取消逻辑的基础，长文件上传时很关键。

### 4. 一个比较稳的下载流程

```js
export function downloadPdfReport(url) {
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode !== 200) {
          reject(new Error('下载失败'))
          return
        }

        uni.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
          fail: reject,
          success: resolve
        })
      },
      fail: reject
    })
  })
}
```

下载这段代码要记住“临时下载”和“后续处理”是两步：

1. `uni.downloadFile` 只是先把文件拉到本地临时路径，不代表它已经被长期保存。
2. `uni.openDocument` 紧跟在成功回调里，说明这个场景的目标是“下载后立即打开”，而不是做离线缓存。
3. 如果你们业务要长期保存，就应该把这里补成 `downloadFile -> saveFile -> openDocument` 三段式，而不是直接复用这段代码。

### 5. 这里最容易踩的 6 个坑

1. 以为多文件能一次性传完，结果小程序端往往要自己循环
2. 把临时文件路径当永久地址用
3. 下载完不区分“临时预览”和“长期缓存”
4. 没配域名白名单或下载域名
5. 只校验文件后缀，不校验实际内容
6. 大文件没有取消、重试和进度反馈

## 十一、扫码和剪贴板：轻量能力，但业务上特别实用

### 1. 扫码能力

常见场景：

- 扫门店码签到
- 扫活动码领券
- 扫商品码进详情

示例：

```js
export async function scanActivityCode() {
  const result = await new Promise((resolve, reject) => {
    uni.scanCode({
      onlyFromCamera: false,
      success: resolve,
      fail: reject
    })
  })

  const rawValue = result.result || ''

  if (!rawValue.includes('activityId=')) {
    uni.showToast({
      title: '二维码内容不受支持',
      icon: 'none'
    })
    return null
  }

  const activityId = rawValue.split('activityId=')[1]
  return activityId || null
}
```

### 2. 剪贴板能力

常见场景：

- 复制活动口令
- 复制订单号
- 复制门店地址

```js
export function copyOrderNo(orderNo) {
  uni.setClipboardData({
    data: orderNo
  })
}
```

### 3. 这组能力的实战提醒

1. 扫码返回的内容可能是 URL，也可能只是纯文本，不要默认它一定是你自己系统的值
2. 复制成功最好给出明确反馈
3. 涉及跳转时，要先校验内容再路由

## 十二、位置和地图：不是拿到经纬度就结束了，权限和回退流程同样重要

位置能力常见于：

- 选择最近门店
- 打开地图导航
- 填写到店地址
- 活动按城市筛选

你最常用的 3 个 API：

1. `uni.getLocation`
2. `uni.chooseLocation`
3. `uni.openLocation`

### 1. 一个常见的业务流

用户点击“选择门店”：

1. 先尝试获取定位权限
2. 用户同意后，打开地图选点
3. 选完后回填门店或地址

```js
export function chooseStoreLocation() {
  return new Promise((resolve, reject) => {
    uni.chooseLocation({
      success: (res) => {
        resolve({
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: reject
    })
  })
}

export function openStoreMap(store) {
  uni.openLocation({
    latitude: Number(store.latitude),
    longitude: Number(store.longitude),
    name: store.name,
    address: store.address
  })
}
```

位置这组代码要特别注意“选择”和“打开”被拆成了两个动作：

1. `chooseStoreLocation` 负责把微信地图选择结果收回来，并整理成业务真正需要的 `name / address / latitude / longitude`。
2. `openStoreMap` 则只负责把门店信息重新交给系统地图打开，两者不要混成一个函数。
3. 这种拆法的好处是，上层可以先缓存用户选择的门店，再决定什么时候跳地图、什么时候只回填表单。

### 2. 位置能力最容易踩的 5 个坑

1. 权限被拒后，没有明确引导用户去设置页恢复
2. 把定位能力做成页面一打开就强拉，用户非常反感
3. 没考虑隐私合规要求，结果真机才报问题
4. 只拿经纬度，不把门店名和地址一起存
5. 选择门店后不做缓存，返回上一页数据全丢

## 十三、分享：真正要设计的不是“能不能分享”，而是“别人点开后能不能还原场景”

很多新手会把分享理解成：

`只要 onShareAppMessage 能返回 title 和 path 就行`

但在真实业务里，最重要的是：

1. 分享出去的是哪一页
2. 带的是哪个业务参数
3. 别人点开后能不能回到正确状态

### 1. 最常见的两类分享

1. 转发给好友：`onShareAppMessage`
2. 分享到朋友圈：`onShareTimeline`

`uni-app` 页面里可以这样写：

```js
import { ref } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

const activityId = ref('1001')

onShareAppMessage(() => {
  return {
    title: '这个活动不错，一起来报名',
    path: `/pages/activity/detail?id=${activityId.value}`,
    imageUrl: 'https://cdn.example.com/activity-share.jpg'
  }
})

onShareTimeline(() => {
  return {
    title: '周末活动报名中',
    query: `id=${activityId.value}`,
    imageUrl: 'https://cdn.example.com/activity-share.jpg'
  }
})
```

分享这段示例最值得你学的是“页面状态如何恢复”：

1. `activityId` 单独做成响应式值，是为了让分享参数始终来自当前页面真实状态。
2. `onShareAppMessage` 返回的是小程序页面 `path`，这保证了好友点开后能落回小程序宿主。
3. `onShareTimeline` 单独返回 `query`，是因为朋友圈分享和好友转发本来就不是同一套参数协议。
4. `imageUrl` 也建议和业务内容一起维护，不要等分享到线上才发现默认图不对。

### 2. 分享这块你一定要记住的几个点

1. `onShareAppMessage` 里的 `path` 必须是小程序页面路径，不要直接丢 H5 链接
2. `onShareTimeline` 是另一套规则，它主要带 `title`、`query`、`imageUrl`
3. 如果页面里有 `web-view`，分享参数恢复要单独设计，不能假设 H5 状态天然存在
4. 如果要显式放一个分享按钮，用 `<button open-type="share">`

### 3. 分享最常见的 4 个坑

1. 分享出去的是首页，别人点开根本落不到活动详情
2. 忘带业务参数，点开后只能看默认内容
3. 以为分享成功就等于业务场景一定恢复
4. `web-view` 页面直接把 H5 地址丢出去，导致微信端体验割裂

如果你高频碰到的是 `web-view` 分享、登录联动、页面通信这类更难的场景，第 7 篇会更细。

## 十四、订阅消息：一定是“用户有明确动机时再申请”，不是一进页面就弹

订阅消息常见场景：

- 报名成功后提醒开场时间
- 支付成功后提醒发货
- 到店前提醒核销

在微信小程序里，通常要在 `#ifdef MP-WEIXIN` 下调用 `wx.requestSubscribeMessage`。

```js
export function requestOrderSubscribe() {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    wx.requestSubscribeMessage({
      tmplIds: ['你的模板 id'],
      success: resolve,
      fail: reject
    })
    // #endif
  })
}
```

订阅消息这段代码虽然短，但它背后的治理点很明确：

1. `requestOrderSubscribe` 单独成函数，说明微信专属能力不该散在普通页面逻辑里。
2. `tmplIds` 放在封装里只是最小示意，真实项目更推荐由业务场景传入，或者由 service 根据场景映射模板。
3. 申请成功以后，不要只顾着弹提示，最好把用户的选择结果同步给后端，后面消息发送时才有依据。

### 1. 最稳的申请时机

比较推荐放在这些节点：

1. 用户刚提交成功，最能理解“为什么提醒我”
2. 用户主动点了“订阅发货通知”
3. 用户主动点了“订阅活动提醒”

### 2. 这块最容易踩的 4 个坑

1. 页面一打开就申请，用户根本不知道你想干嘛
2. 把模板消息权限当成永久同意，后面不做结果判断
3. 前端只申请不记录业务场景，后端不知道该发什么
4. 没有给用户一个明确可理解的订阅理由

## 十五、支付：前端只负责拉起，不负责最终判定

这是一个必须有敬畏心的能力。

小程序支付最常见的链路是：

1. 前端提交订单
2. 后端创建支付单
3. 后端返回拉起支付所需参数
4. 前端调用 `wx.requestPayment`
5. 支付结束后，前端刷新订单状态
6. 最终订单结果以后端确认通知为准

示例：

```js
export async function payOrder(orderId) {
  const paymentParams = await request({
    url: '/pay/create-mini-order',
    method: 'POST',
    data: {
      orderId
    }
  })

  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    wx.requestPayment({
      timeStamp: String(paymentParams.timeStamp || ''),
      nonceStr: paymentParams.nonceStr || '',
      package: paymentParams.package || '',
      signType: paymentParams.signType || 'RSA',
      paySign: paymentParams.paySign || '',
      success: resolve,
      fail: reject
    })
    // #endif
  })
}
```

支付这段代码你最好按“创建支付单”和“拉起支付”两段来读：

1. `request({ url: '/pay/create-mini-order' ... })` 先让后端创建支付单并返回已经签好的参数。
2. `wx.requestPayment` 只负责把这份参数交给微信客户端拉起支付，不负责生成签名。
3. `timeStamp` 被显式转成字符串，是为了避免类型不一致导致的支付拉起失败。
4. 无论 `success` 还是 `fail`，业务页后面都应该继续去刷新订单状态，而不是只依赖前端回调。

### 1. 支付这块一定要记住的 5 条

1. 支付动作必须尽量由用户点击触发
2. 前端支付成功回调，不等于后端订单一定最终成功
3. 支付完成后要主动刷新订单状态，不要只改本地变量
4. 失败、取消、重复点击都要考虑
5. 支付参数只能由后端签发，前端不要自己拼

### 2. 常见流程建议

比较稳的交互一般是：

1. 点击支付按钮
2. 禁用按钮并显示 loading
3. 拉支付参数
4. 拉起支付
5. 无论成功、失败还是取消，都刷新订单详情

## 十六、`web-view`：它不是普通 H5 页面嵌进去这么简单

很多项目都会碰到：

- 活动页用 H5 承接
- 协议页、报表页、历史系统页面复用
- 某个专题页更新很频繁，不想每次都重新发版小程序

这时候就会用到 `web-view`。

### 1. 一个简单壳页写法

```vue
<template>
  <web-view :src="webviewUrl" @message="handleWebviewMessage" />
</template>

<script setup>
import { ref } from 'vue'

const webviewUrl = ref('https://h5.example.com/activity?id=1001')

const handleWebviewMessage = (event) => {
  const messageList = event.detail?.data || []
  const latestMessage = messageList[messageList.length - 1] || {}

  if (latestMessage.type === 'need-login') {
    uni.navigateTo({
      url: '/pages/login/index'
    })
  }
}
</script>
```

这个 `web-view` 壳页示例最重要的不是模板本身，而是你要意识到“它在消费消息协议”：

1. `webviewUrl` 是壳页控制 H5 入口的唯一来源，所以最好由壳页统一拼装和校验。
2. `handleWebviewMessage` 先取 `event.detail?.data` 的最后一条消息，说明你要把通信当成消息队列，而不是一次性回调。
3. `need-login` 这种消息不要让 H5 自己硬跳业务页，而是回到小程序壳层来决定怎么登录、怎么回流。

### 2. 你必须先记住的官方规则

截至 `2026-04-02`，微信官方文档仍强调下面这些点：

1. `web-view` 需要业务域名等相关配置
2. 一个页面里不要指望叠很多 `web-view`
3. 它会覆盖整个页面区域，不要把它当普通嵌套组件想
4. 页面通信不是你什么时候发消息，壳页就什么时候必然收到
5. H5 和小程序是两层上下文，不会天然共享登录态和页面状态

### 3. 什么时候适合用 `web-view`

适合：

1. 已有 H5 页面要复用
2. 协议说明、活动专题、报表展示
3. 更新特别频繁的展示型内容

不太适合：

1. 高度依赖小程序原生交互的重业务页
2. 支付、分享、登录全都纠缠在一起的主链路页
3. 需要大量原生弹层和复杂容器协作的页面

### 4. `web-view` 最容易踩的 5 个坑

1. H5 已经登录了，就以为小程序也天然登录了
2. 直接分享 H5 链接，而不是设计小程序落地页
3. 消息通信不设计协议，只靠临时拼 query
4. 域名和白名单配置没做好，真机才发现打不开
5. 把 `web-view` 当成“省事捷径”，最后把主业务链路越做越碎

如果你要深入看 `web-view` 通信、登录联动、分享回流，建议和第 7 篇一起看。

## 十七、权限恢复：真正影响体验的往往不是第一次授权，而是“用户拒绝以后怎么办”

你做这些能力时，迟早会碰到权限问题：

- 定位
- 相册
- 相机
- 录音

新手最容易漏的，不是第一次授权，而是用户点了“不允许”之后的恢复流程。

### 1. 一个比较稳的思路

1. 先由用户点击触发能力
2. 如果失败，判断是不是权限被拒
3. 弹窗说明用途
4. 用户确认后，跳 `openSetting`

```js
export function openLocationSetting() {
  uni.showModal({
    title: '需要定位权限',
    content: '开启后才能帮你选择附近门店，是否前往设置？',
    success: (res) => {
      if (!res.confirm) {
        return
      }

      uni.openSetting({})
    }
  })
}
```

权限恢复这段代码的重点在于“先解释，再跳设置”，不要直接把用户丢进系统设置页：

1. `uni.showModal` 先把为什么需要这个权限说清楚，这是把“技术动作”翻译成“用户能理解的业务理由”。
2. `if (!res.confirm) return` 让拒绝路径也显式存在，避免你默认用户一定会去设置。
3. `uni.openSetting({})` 是恢复流程的最后一步，不是权限被拒后的第一反应。

### 2. 权限这块最容易踩的 4 个坑

1. 一进入页面就申请一堆权限
2. 用户拒绝后，页面直接死掉，没有解释
3. 只在开发者工具测，不在真机看授权链路
4. 忘了同时关注隐私合规说明和页面文案

## 十八、别忘了两个常见补充能力：客服和版本更新

这两个能力经常不是一开始就做，但项目上线久了非常常见。

### 1. 客服入口

常见场景：

- 订单异常找客服
- 活动问题咨询
- 退款售后

微信侧常见做法是用客服相关 `open-type` 能力，前提是你的小程序后台已经完成对应配置。

这里你要记住的不是某个按钮怎么写，而是：

1. 入口要放在用户遇到问题时最容易找到的位置
2. 没配置好后台能力时，前端光写按钮也不会生效

### 2. 版本更新

很多小程序明明已经发了新版，但用户还在旧包里。

比较常见的做法是在启动时接 `wx.getUpdateManager`，检查有没有新版本，并在下载完成后提示重启。

这类能力适合统一放在应用启动层，不要散着写到业务页里。

## 十九、到底什么时候该用 `uni.*`，什么时候该用 `wx.*`

这是很多人一开始最想问的问题。

我给你的判断顺序是：

| 你在做什么 | 更推荐的做法 |
| --- | --- |
| 请求、缓存、跳转、定位、上传下载、扫码 | 先找 `uni.*` |
| 头像昵称、手机号、页面分享这类微信页面协议能力 | 按微信规定的页面/组件能力接 |
| 订阅消息、支付、部分微信专属开放能力 | `#ifdef MP-WEIXIN` 下用 `wx.*` |
| `web-view`、分享回流、登录联动这类宿主问题 | 先按“容器能力”设计，不要只盯 API |

你可以直接记一句：

`能用 uni 的先用 uni，能力本质就是微信协议的就按微信协议来，能力本质就是微信专属的再用 wx，并且收口。`

## 二十、如果你是新手，上线前至少过一遍这份检查清单

1. 页面提示、确认、加载中有没有成对和分场景使用
2. 跳转是不是分清了 `navigateTo`、`redirectTo`、`switchTab`、`reLaunch`
3. 请求有没有统一封装，token 和错误处理有没有收口
4. 本地缓存有没有只存该存的内容
5. 登录链路里有没有把微信登录和业务登录分开
6. 手机号绑定是不是单独链路，字段名有没有跟登录 `code` 区分开
7. 上传下载有没有考虑临时文件和永久文件的区别
8. 位置、相册、相机权限被拒后，是否能明确引导恢复
9. 分享出去的路径，别人点开后能不能还原到正确页面
10. 支付结果是不是以后端最终状态为准
11. `web-view` 是不是只放在真正合适的场景里
12. 微信专属代码有没有收口到 `#ifdef MP-WEIXIN`

## 二十一、这一篇适合和哪几篇一起搭配读

如果你现在的目标是“先能做，再逐渐做稳”，我更建议这样搭配：

1. 先看第 1 篇，建立宿主环境和运行机制认知
2. 再看第 2 篇，搞清楚工程结构、`pages.json`、`manifest.json`
3. 然后把这一篇当常用能力手册，写页面时随查随用
4. 再补第 3 篇，理解这些常规能力在工程里如何统一收口
5. 最后结合第 6 篇和第 7 篇，把登录态、稳定性、`web-view` 这些难点补齐

这样你的学习顺序会更像真实开发顺序，而不是“先背一堆 API，再一点点返工”。

## 参考资料

- [uni-app 页面](https://uniapp.dcloud.io/tutorial/page.html)
- [uni-app 路由](https://zh.uniapp.dcloud.io/api/router.html)
- [uni-app 网络请求](https://uniapp.dcloud.net.cn/api/request/request.html)
- [uni-app 上传、下载与文件](https://uniapp.dcloud.net.cn/api/request/network-file.html)
- [uni-app 数据缓存](https://uniapp.dcloud.net.cn/api/storage/storage.html)
- [uni-app 位置](https://uniapp.dcloud.net.cn/api/location/location.html)
- [uni-app 扫码](https://uniapp.dcloud.net.cn/api/system/barcode.html)
- [微信开放文档：Page](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html)
- [微信开放文档：wx.login](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html)
- [微信开放文档：手机号快速验证组件](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html)
- [微信开放文档：web-view](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html)
- [微信开放文档：wx.requestSubscribeMessage](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/subscribe-message/wx.requestSubscribeMessage.html)
- [微信开放文档：wx.requestPayment](https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestPayment.html)
