---
title: "UniApp 框架面试题"
slug: "uniapp-9cf05b58"
summary: "UniApp 框架面试题，包括配置文件、打包发布、分包设置等核心知识点。"
category: "面试"
tags:
  - "UniApp"
  - "小程序"
  - "跨平台"
  - "移动开发"
status: "draft"
sortOrder: 90
cover: ""
originalId: "6a2d291f8a2b1c68f2cac680"
originalSlug: "uniapp-9cf05b58"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# UniApp 框架面试题

## uniapp的配置文件、入口文件、主组件、页面管理部分

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750725078197-69bf6db9-c853-4570-af76-16bea4533b97.png)

## 微信小程序打包

### 1. 获取AppID

### 2. 在uniapp项目的manifest.json文件，找到微信小程序配置，填写AppID

### 3. 注意事项

#### 分包设置

微信小程序每个分包的大小不能超过2M，总体积不能超过20M。如果主包体积过大，可进行分包处理。在 `manifest.json` -> 源码视图 -> `mp-weixin` 中添加配置开启分包优化：同时，将部分页面从pages文件夹移至分包文件夹，注意分包之后检查页面跳转或者图片路径，避免出现问题。

```javascript
"optimization": {
  "subPackages": true // 是否启用分包优化
}
```

#### 图片等静态资源处理

图片等静态资源单个文件大小尽量避免超过200kb，可将其上传至CDN。

#### 组件按需注入

在manifest.json -> 源码视图 -> mp-weixin中添加配置开启组件按需引入：

```javascript
"lazyCodeLoading": "requiredComponents" // 按需注入
```

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750666212926-2b7c4c0a-cc08-49c7-92e1-8c81917405da.png)

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750753567981-bfbc1c74-f1bb-462d-8c5a-a52277689f60.png)

## 代码上传与审核流程

### 打包流程

1. 打开uni-app项目，找到`manifest.json`文件，确认微信小程序的相关配置信息准确无误，包括AppID、分包设置等
2. 点击HBuilderX中的"发行"选项，选择"小程序-微信"
3. 等待打包过程完成，期间可能会出现提示，根据提示进行相应操作。若打包过程中出现问题，如主包体积过大、图片资源问题等，按照上述解决方法处理后重新打包

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750666470588-d116f7a7-2da8-4bf0-8e03-cb503b6220ec.png)
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750666576552-40610994-bf3b-42e6-aa7d-717997289e42.png)
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750666673116-f74b4770-4649-4f15-a795-21af92e18f0f.png)

### 上传代码

1. 打包完成后，HBuilderX会自动调开微信开发者工具（若未安装需先安装）
2. 在微信开发者工具中，选中右上角的上传按钮
3. 在弹出的框中，版本号默认是1.0.0，一般不要修改默认值；备注可以填写有关提交日期等信息，方便以后备查。都填好后点击上传

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750666651242-1f5cdf64-e732-41cb-a469-d8b4f53cfa55.png)
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750666735643-9ed1d73e-8c9a-4ec8-9a62-d71e7ca79450.png)

### 公众平台提交审核

登录微信公众平台，选择"版本管理"。

找到刚刚上传的版本，点击"提交审核"即可，如果是首发可以尝试来一个"加速审核"，能节省一些时间。

审核时间：初次提交审核，审核时间较久（3-7个工作日），以后版本更新提交审核则审核相对较快。审核通过后，小程序即可正式上线；若不通过，根据反馈意见进行修改后重新提交。

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750666892820-887e8da0-707c-4cf2-b219-23bc32f74e75.png)

## 常见问题及解决方法

### 上传失败

1. **主包体积过大**：进行分包处理，参考上述分包设置的方法
2. **图片等静态资源超过200kb**：将静态资源上传至CDN
3. **未启用组件按需注入**：在manifest.json中添加相应配置开启
4. **IP没有权限**：在小程序管理后台，找到 开发管理 -> 开发设置 -> 小程序代码上传 -> IP白名单，添加本机IP

### 打包报错

检查manifest.json文件中的配置信息是否正确，特别是AppID、分包设置等；检查项目中是否存在语法错误等。

### 审核不通过

仔细阅读审核反馈意见，根据意见修改小程序的内容、功能等，确保符合微信官方的规范和政策要求，修改后重新提交审核。

参考：[uniapp打包微信小程序详细步骤-CSDN博客](https://blog.csdn.net/2401_84093054/article/details/137986164)

## App云打包

参考：[【uniapp小程序】—— APP项目云打包（安卓）-CSDN博客](https://blog.csdn.net/qq_49002903/article/details/126937483)

## uniapp开发微信小程序的关键功能实现

### 1. 小程序页面跳转

在uniapp中，可以使用`uni.navigateTo`、`uni.redirectTo`、`uni.switchTab`等API实现页面跳转：

```javascript
// 保留当前页面，跳转到应用内的某个页面
uni.navigateTo({
  url: '/pages/detail/detail?id=123'
});

// 关闭当前页面，跳转到应用内的某个页面
uni.redirectTo({
  url: '/pages/index/index'
});

// 跳转到tabBar页面，并关闭其他所有非tabBar页面
uni.switchTab({
  url: '/pages/tabbar/home'
});

// 关闭所有页面，打开到应用内的某个页面
uni.reLaunch({
  url: '/pages/login/login'
});
```

### 2. 小程序本地存储
使用`uni.setStorage`、`uni.getStorage`等API进行数据存储：

```javascript
// 存储数据
uni.setStorage({
  key: 'userInfo',
  data: {
    name: '张三',
    age: 25
  },
  success: function () {
    console.log('存储成功');
  }
});

// 异步获取数据
uni.getStorage({
  key: 'userInfo',
  success: function (res) {
    console.log(res.data); // 输出: {name: '张三', age: 25}
  }
});

// 同步获取数据
const userInfo = uni.getStorageSync('userInfo');
console.log(userInfo);

// 删除指定数据
uni.removeStorage({
  key: 'userInfo'
});

// 清空所有本地存储
uni.clearStorage();
```

### 3. 小程序配置文件
微信小程序在uniapp中的主要配置文件：

+ `pages.json` - 页面路径、窗口样式、tabBar等配置
+ `manifest.json` - 应用的基本信息、原生插件配置等
+ `app.vue` - 应用入口文件
+ `main.js` - 应用初始化脚本
+ `uni.scss` - 全局样式变量
+ `App.vue` - 应用全局配置，如生命周期函数

### 4. 小程序生成分享链接
通过页面的`onShareAppMessage`生命周期函数配置分享信息：

```javascript
export default {
  data() {
    return {
      shareTitle: '这是一个分享标题',
      sharePath: '/pages/index/index?from=share',
      shareImageUrl: 'https://example.com/share.png'
    }
  },
  onShareAppMessage() {//默认会同时支持分享给个人和群聊
    return {
      title: this.shareTitle,
      path: this.sharePath,
      imageUrl: this.shareImageUrl,
      success: function (res) {
        // 分享成功
        console.log('分享成功', res);
      },
      fail: function (res) {
        // 分享失败
        console.log('分享失败', res);
      }
    }
  }
}
```

另外，如果需要生成固定的分享卡片，可以使用微信小程序的[分享卡片生成API](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html)，通过后端接口生成带参数的小程序码。

[uniapp —— 小程序实现带参分享微信、朋友圈以及调试获取参数_微信小程序开发者工具获取分享页面的参数-CSDN博客](https://blog.csdn.net/LizequaNNN/article/details/124886268)

## uniapp 相关问题
### 1. 获取硬件信息
```javascript
uni.getSystemInfo({
  success: (res) => {
    console.log('设备信息:', res);
    // res.model: 设备型号
    // res.pixelRatio: 像素比
    // res.windowWidth: 窗口宽度
    // res.system: 操作系统版本
    // res.platform: 客户端平台
  }
});
```

### 2. 路由跳转方式
```javascript
// 1. 保留当前页面，跳转到应用内的某个页面
uni.navigateTo({
  url: '/pages/detail/detail?id=123'
});

// 2. 关闭当前页面，跳转到应用内的某个页面
uni.redirectTo({
  url: '/pages/index/index'
});

// 3. 关闭所有页面，打开到应用内的某个页面
uni.reLaunch({
  url: '/pages/login/login'
});

// 4. 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
uni.switchTab({
  url: '/pages/tabBar/home'
});

// 5. 关闭当前页面，返回上一页面或多级页面
uni.navigateBack({
  delta: 1
});
```

### 3. 支付接口
```javascript
uni.requestPayment({
  provider: 'wxpay', // 支付方式：wxpay/aliapp
  timeStamp: '',
  nonceStr: '',
  package: '',
  signType: 'MD5',
  paySign: '',
  success: (res) => {
    console.log('支付成功:', res);
  },
  fail: (err) => {
    console.log('支付失败:', err);
  }
});
```

### 4. 获取当前定位
```javascript
// 1. 普通定位（需用户授权）
uni.getLocation({
  type: 'wgs84', // 返回 gps 坐标
  success: (res) => {
    console.log('当前位置:', res);
    // res.latitude: 纬度
    // res.longitude: 经度
  },
  fail: (err) => {
    console.log('定位失败:', err);
    // 处理定位失败逻辑，如引导用户授权
  }
});

// 2. 高精度定位（需要用户开启位置权限）
uni.getLocation({
  type: 'gcj02', // 返回国测局坐标
  highAccuracy: true, // 开启高精度定位
  highAccuracyExpireTime: 5000, // 高精度超时时间
  success: (res) => {
    console.log('高精度定位:', res);
  }
});
```

### 5. uniapp的自身请求
uni-app提供了原生的网络请求API，主要是`uni.request()`，其用法类似于浏览器的fetch和axios：

```javascript
uni.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: {
    param1: 'value1',
    param2: 'value2'
  },
  header: {
    'Content-Type': 'application/json'
  },
  success: (res) => {
    console.log('请求成功:', res.data);
  },
  fail: (err) => {
    console.error('请求失败:', err);
  },
  complete: () => {
    // 无论成功或失败都会执行
  }
});
```

**特性**：

1. 支持所有平台（小程序、H5、App等）
2. 自动处理不同平台的网络请求差异
3. 提供统一的请求配置和回调处理
4. 可通过`uni.uploadFile()`和`uni.downloadFile()`处理文件上传下载



## 讲一讲 uni-app 小程序的生命周期
uni-app 生命周期分应用生命周期和页面生命周期。

**应用生命周期**：

- `onLaunch`：应用初始化完成时触发，用于初始化全局变量、获取用户信息等操作
- `onShow`：应用进入前台显示时触发，可用于执行应用可见时操作，如重新获取实时数据
- `onHide`：应用进入后台时触发，用于保存应用状态、清理资源等
- `onError`：应用运行报错时触发，用于记录错误信息等

**页面生命周期**：

- `onInit`：监听页面初始化，其参数同 onLoad 参数，为上个页面传递的数据，触发时机早于 onLoad
- `onLoad`：页面加载时触发，可获取页面参数，用于页面初始化数据获取等操作
- `onShow`：页面显示时触发，每次页面可见都执行，如从其他页面返回也触发
- `onReady`：页面初次渲染完成时触发，此时可操作页面 DOM 元素等
- `onHide`：页面隐藏时触发，如跳转到其他页面或应用进入后台时
- `onUnload`：页面卸载时触发，用于页面销毁时的清理工作，如取消定时器等
- `onResize`：页面尺寸改变时触发，可用于响应页面尺寸变化，动态调整页面布局、样式或内容
- 还有 `onPullDownRefresh`（下拉刷新时触发）、`onReachBottom`（页面滚动到底部时触发）、`onShareAppMessage`（用户点击分享时触发）等页面相关事件函数



## 微信小程序第三方登录的流程
### 前端流程
1. 调用 `wx.login()` 获取临时登录凭证（`code`）。 
2. 将 `code` 发送给后端接口（用于换取 `openid` 和 `session_key` ）。

### 后端流程
1. 使用 `code` 调用微信官方 API 获取 `openid` 和 `session_key` 。 
2. 拿到 `openid` 后进行用户绑定或注册。 
3. 生成自定义 `token`（JWT 或 `sessionId` ），返回给前端。

最后前端保存 `token`，作为登录凭证参与后续接口调用。 

> **主要流程**：在前端调用接口成功的将临时 code 传递给后端时，后端通过调用微信的第三方接口拿到 openid、session_key 这两个参数，查询数据库是否有 openid，如果有则更新 session_key，如果没有则在数据库中新建一条用户信息的数据

##  小程序的支付流程
1. **前端发起支付请求**：用户点击支付后，前端通过 `uni.request` 向后端发起统一下单请求，传入 `openid`、订单号和金额等信息。 
2. **后端调用微信统一下单接口**：后端接收到请求后，调用微信的「统一下单 API」，使用商户号、`AppID`、签名等参数生成 `prepay_id`，再将所需支付参数（如 `timeStamp`、`nonceStr`、`package`、`paySign` ）返回给前端。 
3. **前端调起微信支付**：前端拿到支付参数后，调用 `uni.requestPayment` 发起支付流程，用户完成支付后微信会回调结果。 
4. **微信服务器回调（notify）**：微信支付完成后，异步通知后端服务器。后端校验签名，确认支付成功后更新订单状态，并返回“`SUCCESS`”响应。

## 小程序如何跳转到 web 页面
在小程序中，可通过 `web-view` 组件实现跳转到 web 页面。在小程序页面的 `wxml` 中添加：

```html
<web-view src="https://www.example.com"></web-view>
```

需注意配置好小程序的业务域名，否则无法正常跳转。



## 微信小程序怎么跳转其他小程序、公众号
- **跳转其他小程序**：通过 `uni.navigateToMiniProgram`（如使用 uniapp 开发），示例代码：

```javascript
uni.navigateToMiniProgram({
    appId: '目标小程序的 appid', 
    path: 'pages/index/index?id=123', 
    extraData: { 
        foo: 'bar'
    },
    envVersion: 'release', 
    success(res) {
        console.log('跳转成功');
    },
    fail(err) {
        console.log('跳转失败', err);
    }
});
```

- **公众号跳转第三方小程序**：可通过 `<wx-open-launch-weapp>` 组件（需满足微信开放平台相关配置和权限），示例代码：

```javascript
<wx-open-launch-weapp
@launch="handleLaunch"
@error="handleError"
id="launch-btn"
appid="第三方的 appid"
path="第三方小程序的跳转路径"
style="display: block;"
  >
  <!-- 这里可自定义按钮内容 -->
  <button>跳转公众号相关功能</button>
  </wx-open-launch-weapp>

```



## 小程序退款

1. 退款属于敏感操作，主要核心功能还是在服务器端，主要是调用 `secapi/pay/refund` 这个微信的 API
2. 前端主要是发送三个参数即可：订单号、退款金额、退款原因

```javascript
order_id: this.formData.orderId,
amount: parseFloat(this.formData.amount) * 100, // 转换为分
reason: this.formData.reason
```

**可能问题**：退款状态同步复杂

**问题**：支付平台异步通知可能延迟或丢失，导致客户端状态不同步

**方案**：

- 设计补偿机制：客户端轮询服务器状态（如每5秒查询一次）
- 服务器记录退款流水日志，支持手动对账
- 前端发送退款请求成功后，后台会生成退款单号，同时表示退款申请已经提交。同时会返回一个退款的单号给前端，再通过轮询或者 WebSocket 进行查询退款状态是否成功



## 各种uniApp操作问题
### uniApp中如何进行音频的播放和控制？
答案：可以使用uni.createInnerAudioContext方法创建音频实例，通过调用实例的方法来实现音频的播放和控制。

```javascript
// 创建音频实例
const audio = uni.createInnerAudioContext();
// 设置音频资源
audio.src = 'http://example.com/audio.mp3';
// 播放音频
audio.play();
// 暂停音频
audio.pause();
// 停止音频
audio.stop();
```

### uniApp中如何实现页面间的数据传递？

答案：可以使用 `uni.navigateTo` 方法的 url 参数中添加 query 参数来实现页面间的数据传递。

```javascript
// 页面A跳转到页面B，并传递参数
uni.navigateTo({
  url: '/pages/detail/detail?id=123'
});

// 在页面B中获取传递的参数
export default {
  onLoad(options) {
    console.log(options.id); // 输出：123
  }
};
```

### uniApp中如何实现图片预览功能？

答案：可以使用 `uni.previewImage` 方法实现图片预览功能，通过设置 urls 参数来指定要预览的图片地址。

```javascript
uni.previewImage({
  urls: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg']
});
```

### uniApp中如何实现页面的分享功能？

答案：可以使用 `uni.showShareMenu` 方法开启页面的分享功能，使用 `uni.onShareAppMessage` 方法设置分享的标题、路径等。

```javascript
// 开启页面的分享功能
uni.showShareMenu();

// 设置分享的标题、路径等
uni.onShareAppMessage(() => {
  return {
    title: '分享标题',
    path: '/pages/index/index'
  };
});
```

### uniApp中如何实现页面的转发功能？

答案：可以使用 `uni.share` 方法实现页面的转发功能，通过设置 title、path 等参数来指定转发的标题和路径。

```javascript
uni.share({
  title: '转发标题',
  path: '/pages/index/index'
});
```

### uniApp中如何实现页面的登录授权？

答案：可以使用 `uni.login` 方法获取用户登录凭证，然后将凭证发送到后端进行验证，根据验证结果来判断用户是否登录。

```javascript
// 获取用户登录凭证
uni.login({
  success: (res) => {
    const code = res.code;
    // 将凭证发送到后端进行验证
    uni.request({
      url: 'https://api.example.com/login',
      method: 'POST',
      data: {
        code: code
      },
      success: (res) => {
        console.log(res.data);
        // 根据验证结果来判断用户是否登录
        if (res.data.success) {
          console.log('用户已登录');
        } else {
          console.log('用户未登录');
        }
      },
      fail: (err) => {
        console.error(err);
      }
    });
  },
  fail: (err) => {
    console.error(err);
  }
});
```

### uniApp中如何实现页面的分享到朋友圈功能？

答案：可以使用 `uni.showShareMenu` 方法开启页面的分享功能，然后使用 `uni.share` 方法设置分享的标题、路径等。

```javascript
// 开启页面的分享功能
uni.showShareMenu({
  withShareTicket: true,
  menus: ['shareAppMessage', 'shareTimeline']
});

// 设置分享的标题、路径等
uni.onShareAppMessage(() => {
  return {
    title: '分享标题',
    path: '/pages/index/index'
  };
});

uni.onShareTimeline(() => {
  return {
    title: '分享标题',
    path: '/pages/index/index'
  };
});
```

### uniApp中如何进行图片的懒加载？

答案：可以使用 `uni.lazyLoadImage` 组件实现图片的懒加载，将图片的 src 属性设置为需要加载的图片地址。

```javascript
<!-- 基础用法 -->
  <uni-lazy-load-image 
src="https://example.com/image.jpg" 
mode="aspectFill" 
:style="{ width: '300rpx', height: '200rpx' }"
  />

  <!-- 带占位图的用法 -->
  <uni-lazy-load-image 
src="https://example.com/image.jpg" 
placeholder="https://example.com/placeholder.jpg"
:style="{ width: '300rpx', height: '200rpx' }"
  />
```

### pages.json 和 manifest.json 的作用？

- `pages.json`：配置页面路径、TabBar、窗口属性、路由规则
- `manifest.json`：项目全局配置，包含 App 名称、图标、权限、平台发布配置等
- `easycom`：配置组件自动引入规则

### 如何实现国际化（i18n）？

使用 vue-i18n 插件

1. **安装插件**：在项目中安装 vue-i18n，推荐使用 vue-i18n@9.1.9 固定版本
2. **创建语言文件**：创建一个文件夹用来存放不同语言的 json 文件，如 en.json、zh-Hans.json 等。在这些文件中定义需要翻译的语言键值对
3. **初始化 vue-i18n**：在 main.js 中引入 vue-i18n 和语言文件，并初始化配置，设置默认语言和语言文件
4. **在页面中使用**：在页面模板中使用 `$t()` 获取对应的翻译内容，并传递国际化 json 文件中定义的 key，js 中使用 `this.$t('')`

### 性能优化建议？

- 页面懒加载（分包+延迟加载）、资源压缩（图片压缩、代码压缩）
- 页面缓存（使用 keep-alive）、使用 localStorage 或 indexedDB 缓存接口数据
- 使用 CDN 加速静态资源

- **减少不必要的 npm 包**
- **使用 `subPackages` 进行分包**
- **开启代码压缩**（`webpack`）

### uni-app 的局限性？

- 对复杂 UI 动画支持有限
- Web 性能略逊于原生项目，依赖 WebView 渲染
- 插件生态不如 React Native / Flutter 丰富
- 原生能力调用需依赖 HBuilderX 或自定义插件

### Uniapp的rpx转换px的公式？

在 uni-app 中，`rpx`（responsive pixel）是一种自适应单位，其大小根据屏幕宽度动态调整。

**rpx 转 px 公式**：`px = rpx × 屏幕宽 ÷ 750`

### 什么是 UniApp？它有什么特点？

**UniApp** 是一个基于 **Vue.js** 的跨平台应用开发框架，可以使用 Vue.js 的开发语法编写一次代码，然后通过编译生成可以在多个平台（包括 iOS、Android、H5 等）上运行的应用。UniApp 具有以下特点：

- **跨平台**：开发者可以使用相同的代码基底构建多个平台的应用，避免了针对不同平台的重复开发
- **高性能**：UniApp 在运行时使用原生渲染技术，具有接近原生应用的性能表现
- **开放生态**：UniApp 支持原生插件和原生能力的扩展，可以调用设备的硬件功能和第三方原生 SDK
- **开发便捷**：UniApp 提供了丰富的组件和开发工具，简化了应用开发和调试的流程

### 请解释 UniApp 中的条件编译是如何工作的

答案：UniApp 中的条件编译允许开发者根据不同的平台或条件编译指令来编写不同的代码。在编译过程中，指定的平台或条件将会被处理，并最终生成对应平台的可执行代码。条件编译通过在代码中使用 `#ifdef`、`#ifndef`、`#endif` 等指令进行控制。例如，可以使用 `#ifdef H5` 来编写只在 H5 平台生效的代码块。

### UniApp 的 nvue 是什么？和普通 Vue 组件的区别？

- `nvue` 是 **原生渲染模式**，性能比 `webview` 更高

**区别**：

| 对比项 | nvue | 普通 vue |
| :---: | :---: | :---: |
| 渲染方式 | 原生渲染 | WebView 渲染 |
| 性能 | 更流畅 | 较慢 |
| CSS 支持 | 仅 `flex` | 完整 CSS |


### uniapp上传文件时使用的api
```javascript
uni.uploadFile({
  url: '要上传的地址',
  fileType:'image',
  filePath:'图片路径',
  name:'文件对应的key',
  success: function(res){
    console.log(res)
  },
})
```

### uniapp选择文件、图片上传
```javascript
//选择文件
uni.chooseFile({
  count: 6, //默认100
  extension:['.zip','.doc'],
  success: function (res) {
    console.log(JSON.stringify(res.tempFilePaths));
  }
});

// 选择图片文件
uni.chooseFile({
  count: 10,
  type: 'image',
  success (res) {
    // tempFilePath可以作为img标签的src属性显示图片
    const tempFilePaths = res.tempFiles
  }
})
```

### uniapp实现下拉刷新

实现下拉刷新需要用到 `uni.onPullDownRefresh`（用于监听用户下拉动作）和 `uni.stopPullDownRefresh`（停止当前页面的下拉刷新状态）这两个函数，函数与生命周期同等级可以监听页面下拉动作

```javascript
//1.在pages.json文件里找到需要下拉刷新的页面pages节点，
//并在 style 选项中开启enablePullDownRefresh。
{
  "path": "pages/index/index",
    "style": {
    "navigationBarTitleText": "首页",
      "enablePullDownRefresh": true
  }
},
//2.在页面中调用监听下拉事件函数
onPullDownRefresh() {
  //do some
  this.Fn()
}
//3.获取数据完毕后调用停止下拉刷新动画
Fn(){
  //可以在调用的函数中获取接口数据或则操作其他事项
  //调取完毕后停止下拉刷新动画
  uni.stopPullDownRefresh();
}
```

### uniapp实现上拉加载

uniapp 中的上拉加载是通过 `onReachBottom()` 这个生命周期函数实现，当下拉触底时就会触发。我们可以在此函数内调用分页接口请求数据，用以获取更多的数据。

默认的触底距离是 50px，可以在 json 文件中通过 `onReachBottomDistance` 进行自定义更改

```javascript
/*{
  "pages": [
    {
      "path": "pages/list/index",
      "style": {
        "onReachBottomDistance": 100 // 自定义为 100px
      }
    }
  ]
}*/
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
onReachBottom() {//在页面滚动到底部触发
  let data = this.data;
  let pageNum = data.pageNum;
  let pageStatus = 'loadmore';//表示可以加载更多数据
  if (data.pageNum * data.pageSize >= data.pageTotal) {
    pageStatus = 'nomore';
  }
  if (pageStatus === 'loadmore') {
    pageNum++;
    pageStatus = 'loading';
    this.setData({
      pageNum: pageNum
    }, () => {
      this.getDataList();
    })
  }
  this.setData({pageStatus})
},
/*我司的做法是用total来判断是否还有数据可以请求，还有的话就继续请求接口数据，并更新状态及分页数据；

```

### 【uniapp小程序】配置tabbar底部导航栏

参考：[【uniapp小程序】配置tabbar底部导航栏-CSDN博客](https://blog.csdn.net/qq_49002903/article/details/126395789)

### 小程序中如何实现多端适配（如同时适配手机、平板、电脑等）？

在小程序中，可以通过使用 `wx.getSystemInfo()` 方法获取系统信息，然后根据不同的系统信息来调整界面和逻辑。

参考：[小程序面试题 | 21.精选小程序面试题-CSDN博客](https://blog.csdn.net/m0_49768044/article/details/135162939)

### 扫码
```javascript
wx.scanCode({      //扫码事件函数
   onlyFromCamera: false,     //是否只能摄像头扫码，要关闭
   scanType: ['barCode', 'qrCode'],   //扫描的类型，条形码，二维码
   success: (result) => {},   //成功的回调
   fail: (res) => {},          //失败的回调
   complete: (res) => {}  
})
```

### 小程序中如何使用echart图表库

使用第三方插件 echarts-for-weixin：[https://github.com/ecomfe/echarts-for-weixin](https://github.com/ecomfe/echarts-for-weixin)

可以将该项目直接下载解压，并在本地运行，查看各种不同图表类型的示例，注意导入项目的时候修改自己的 AppId。

在使用 echart 图表的时候，需要注意由于 echart 本身比较大，所以最好是将图表的功能内容规划到分包中去，并且不要在主包中进行图表功能的操作。

### 验证授权是自动弹出还是触发，授权过程如何操作

- 按钮触发的，open-type 指定为 getUserInfo 类型，可以从 bindgetuserinfo 回调中获取到用户信息
- 授权验证操作只执行一次，不会二次执行
- 授权以后可以通过 wx.getUserInfo 获取基础的用户信息

### 微信小程序之用户授权

用户授权包括很多内容：用户信息、地理位置、后台定位、录音功能、保存到相册、摄像头等。

**授权有效期**：一旦用户明确同意或拒绝过授权，其授权关系会记录在后台，直到用户主动删除小程序。

**授权操作主要分两种不同的情况**：

- 弹出授权框用户点击允许，授权信息会直接记录，后续不再确认授权操作
- 弹出授权框用户点击拒绝，授权信息会直接记录，但用户还想再次操作对应功能，需要弹窗再次授权

**查看所拥有权限**：

- `wx.authorize` 发起请求用户授权，利用 `wx.showModal` 弹窗授权确认
- `wx.showModal` 确认后利用 `wx.openSetting` 打开授权设置
- 确认授权设置打开授权信息

### 如何获取用户手机号码（面试重点难点题）

目前该接口针对非个人开发者，且完成了认证的小程序开放（不包含海外主体）。

在微信小程序管理平台设置->基本信息的微信认证中进行确认，是否已经进行认证，认证过程需要提供公司相关信息，并且涉及到一定费用问题（微信公众平台申请微信认证，需支付300元/次认证费）。

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750728969426-64a90ce3-12fa-43e7-b413-06745cc8f982.png)

利用 wx.login 获取登录凭证 code，通过 code 与开发者服务器交互获取加密后的 openId，并将 openId 与 session_key 进行服务器数据库信息存储（后台利用 nodejs、php、java 等操作，具体参见：[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)）。

利用 jsonwebtoken（或者其它加密方式，前后端人员需要确认）对 openId 进行加密传递回小程序端。

利用 button 进行 open-type 的类型设置，值为 getPhoneNumber，并且需要进行 bindgetphonenumber 事件绑定：

```html
<view class="container">
  <button open-type="getPhoneNumber" bindgetphonenumber="getPhoneNumber">getPhoneNumber</button>
</view>
```

绑定回调 getPhoneNumber 中可以找到手机加密数据：

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750729133255-61151aba-c385-45b3-bff3-5ea8de5ac456.png)

将加密的 openId、encryptedData、iv 等数据发送至服务器端。

服务器端通过解密 openId，查询 session_key，获取 encryptedData、iv 以后（4个内容），需要对加密手机等信息数据进行解密处理：

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750729168325-b2314a68-75fb-4f45-b7f9-fa7568a4e10c.png)

通过解密以后的数据类似：

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1750729185483-9e2a5372-cb28-4625-8f9c-0f5cfda7d4f1.png)

可以将解密信息等内容进行返回小程序端处理。

### 分包的操作以及如何来计划分包

分包主要包括：使用分包、独立分包、分包预下载。

**分包**：主包添加跳转路径，分包放内容，在 app.json 配置 subpackages 声明项目分包结构。代码包总包大小为 20M，单个主包/分包大小不能超过 2M。

**按照功能划分的打包原则**：可以按照功能的划分，拆分成几个分包，当需要用到某个功能时，才加载这个功能对应的分包；公共逻辑、组件放在主包内。

首次启动时，先下载小程序主包，显示主包内的页面；如果进入了某个分包的页面，再下载这个对应分包，下载完毕后，显示分包的页面。

**总结**：首先配置好打包路径，tabbar 页面必须在主包内，各分包之间不能互相调用，能调用的都在主包内。

### 小程序的代码版本分成哪几类

- **开发版**：本地代码进行上传提交以后会发布到开发版本
- **体验版**：可以将指定的开发版本设置成体验版本
- **审核版本**：将对应的开发版本进行提交审核操作，审核版本需要小程序官网审核确认
- **线上版**：最终终端用户可以看到的线上应用版本

通过 `__wxConfig.envVersion` 能判断用户所在的小程序版本。

### 【小程序开发】uniapp中引入iconfont方式 保姆级教程

参考：[【小程序开发】uniapp中引入iconfont方式 保姆级教程-CSDN博客](https://blog.csdn.net/m0_64373473/article/details/133145871)



### uni-app 全局变量 4 种实现方式

- **`uni.setStorageSync` 和 `uni.getStorageSync`**：通过 uni-app 提供的存储 API，可以将数据存储到本地存储中作为全局变量。例如，`uni.setStorageSync('globalVar', value)` 存储变量，`uni.getStorageSync('globalVar')` 获取变量。
  - 优点是简单易用，数据可以持久化存储
  - 缺点是存储的数据是异步的，如果有多个页面同时操作可能会出现数据不一致的情况，而且存储的数据没有自动更新机制，如果数据发生变化，需要手动更新存储

- **Vuex**：在 uni-app 中也可以使用 Vuex 进行状态管理。通过定义 Vuex 的 `state`、`getters`、`mutations` 和 `actions` 来管理全局变量。
  - 优点是方便在多个页面和组件之间共享和管理数据，可以很容易地进行数据的同步更新，适合复杂的业务逻辑
  - 缺点是配置相对复杂，需要一定的学习成本

- **`uni-app` 的 `global` 对象**：在某些情况下，可以通过 `global` 对象来定义全局变量。例如，在主线程（如 App.vue 的生命周期函数中）定义 `global.globalData = value`，然后在其他页面通过 `global.globalData` 访问。
  - 简单直接，但这种方式并不推荐，因为可能会导致全局变量污染，而且在子线程（如 Worker 线程）中可能无法访问到主线程的 `global` 对象

- **事件总线（eventBus）**：创建一个全局的事件总线，各个页面和组件通过它来传递和接收数据。
  - 优点是实现简单，对于一些简单的全局变量传递场景比较方便
  - 缺点是可能会导致事件的滥用，增加代码的耦合性，而且对事件的管理（如解绑）需要谨慎处理，否则可能会导致内存泄漏等问题



### 小程序之间是怎么做设备兼容的

- **响应式布局**：使用 rpx（响应式像素）作为单位，根据屏幕宽度自动适配不同尺寸设备（1rpx = 屏幕宽度 / 750）
- **条件编译**：针对不同平台（微信、支付宝、百度等）使用 uniapp 的条件编译语法（如 `#ifdef`、`#endif`），编写平台特定代码
- **组件适配**：使用小程序官方组件（如 view、scroll-view）或第三方 UI 库（如 uView、Taro UI），确保组件在不同设备上的显示一致性
- **屏幕适配工具**：通过计算设备像素比（devicePixelRatio）、屏幕宽度等参数，动态调整样式或布局结构
- **测试覆盖**：在不同型号设备（如 iPhone、华为、小米等）和系统（iOS、Android）上进行兼容性测试，修复显示或功能异常

### 小程序动态更新信息是怎么做到的

- **轮询请求（Polling）**
  - 定时调用 API（如 `setInterval`）从服务器获取最新数据，适用于对实时性要求不高的场景
  - 示例：

```javascript
setInterval(() => {
  uni.request({
    url: '/api/data/update',
    success: (res) => {
      this.data = res.data;
    }
  });
}, 5000); // 每5秒请求一次
```

- **WebSocket 实时推送**
  - 建立长连接，服务器主动推送更新，适用于实时聊天、实时数据监控等场景

- **本地存储缓存 + 版本号比对**
  - 首次获取数据时存储到 `localStorage` 或 `uni.getStorage`，后续请求时携带本地版本号，服务器仅返回变更数据

- **小程序热更新（仅部分平台支持）**
  - 微信小程序可通过 `wxs` 脚本或 `WebView` 加载动态资源，部分平台支持下载新包后重启小程序

### WebSocket 怎么实现的

在 `uniapp` 中实现 WebSocket 的步骤如下：

**建立连接**

```javascript
// 初始化WebSocket
const ws = uni.connectSocket({
  url: 'wss://your-server.com/ws',
  success: () => {
    console.log('WebSocket连接成功');
  },
  fail: (err) => {
    console.error('连接失败', err);
  }
});

// 监听连接状态
ws.onOpen(() => {
  // 连接打开后发送消息
  ws.send({ data: 'Hello WebSocket' });
});
```

**接收和发送消息**

```javascript
// 接收消息
ws.onMessage((res) => {
  const data = res.data; // 服务器返回数据
  this.updateData(data);
});

// 发送消息
ws.send({ data: JSON.stringify({ action: 'getData' }) });
```

**重连机制**

```javascript
// 连接关闭或错误时重连
ws.onClose(() => {
  console.log('连接关闭，准备重连');
  setTimeout(() => {
    this.reconnectWebSocket(); // 重新调用连接方法
  }, 3000);
});

ws.onError((err) => {
  console.error('WebSocket错误', err);
  this.reconnectWebSocket();
});
```

### 小程序的扫码如何实现

小程序扫码功能通过调用官方 API 实现：

**调用扫码接口**

```javascript
uni.scanCode({
  onlyFromCamera: false, // 是否仅从相机扫码（false允许从相册选择二维码）
  success: (res) => {
    const code = res.result; // 扫码结果
    // 处理扫码数据（如跳转页面、解析内容）
    uni.navigateTo({ url: `/pages/scan-result?code=${code}` });
  },
  fail: (err) => {
    console.error('扫码失败', err);
  }
});
```

**扫码权限处理**

首次调用时需用户授权相机权限，可通过 `uni.authorize` 提前申请权限：

```javascript
uni.authorize({
  scope: 'scope.camera',
  success: () => {
    // 已授权，调用扫码接口
    this.scanCode();
  },
  fail: () => {
    // 用户拒绝授权，引导去设置页开启
    uni.showModal({
      title: '提示',
      content: '需要相机权限才能扫码，是否去设置？',
      success: (res) => {
        if (res.confirm) {
          uni.openSetting();
        }
      }
    });
  }
});
```
