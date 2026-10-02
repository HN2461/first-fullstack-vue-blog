---
title: "第 10 篇：uni-app App 拨号与短信能力适配：平台边界、权限与原生模块"
slug: "uniapp-app-phone-and-sms-capabilities"
summary: "梳理 uni-app App 端拨号和短信能力的平台差异，涵盖号码处理、条件编译、原生模块、权限最小化与真机故障定位。"
category: "uni-app"
categoryPath:
  - "项目复用技术"
  - "uni-app"
tags:
  - "uni-app"
  - "App"
  - "原生模块"
status: "published"
sortOrder: 100
cover: ""
originalId: "6abf80f2b29038327447c267"
originalSlug: "uniapp-app-phone-and-sms-capabilities"
originalStatus: "published"
publishedAt: "2026-10-02T10:01:22.438Z"
updatedAt: "2026-10-02T10:01:22.492Z"
exportedAt: "2026-10-02T10:18:25.336Z"
---
# 第 10 篇：uni-app App 拨号与短信能力适配：平台边界、权限与原生模块

## 1. 平台能力结论

| 平台 | 拨号 | 短信 |
| --- | --- | --- |
| App | `uni.makePhoneCall` | 5+ `plus.messaging`，需要原生模块 |
| 微信小程序 | 支持 `uni.makePhoneCall` | 不支持直接调用系统短信发送能力 |
| H5 | 移动浏览器可尝试 `tel:` / `sms:` | 受浏览器和系统限制，不能作为稳定能力 |

只修改 JavaScript 不足以启用 App 原生短信能力。修改原生模块或权限后，必须重新打包、卸载旧包并安装新包验证。

## 2. 电话号码预处理

不要把空值、显示用空格或未知字符直接传给平台 API：

```javascript
export function normalizePhoneNumber(value) {
  return String(value || '')
    .trim()
    .replace(/[\s()-]/g, '')
}

export function isCallablePhoneNumber(value) {
  const phone = normalizePhoneNumber(value)
  return /^\+?[0-9]{5,20}$/.test(phone)
}
```

国际号码可能带 `+`，不要简单删除所有非数字字符。业务如果只允许特定地区号码，应把校验规则作为业务配置，不要写死在通用工具里。

## 3. 拨号封装

```javascript
export function makePhoneCall(rawPhone) {
  const phoneNumber = normalizePhoneNumber(rawPhone)

  if (!isCallablePhoneNumber(phoneNumber)) {
    uni.showToast({ title: '电话号码无效', icon: 'none' })
    return Promise.resolve({ success: false, reason: 'invalid-phone' })
  }

  return new Promise((resolve) => {
    uni.makePhoneCall({
      phoneNumber,
      success: () => resolve({ success: true }),
      fail: (error) => {
        console.error('[Phone] 拨号失败', error)
        uni.showToast({ title: '无法拉起拨号，请检查系统权限', icon: 'none' })
        resolve({ success: false, reason: 'platform-failed', error })
      }
    })
  })
}
```

页面点击事件只调用该函数，不在多个页面重复校验和提示。

## 4. App 短信封装

```javascript
export function openSmsComposer(rawPhone, body = '') {
  const phone = normalizePhoneNumber(rawPhone)

  if (!isCallablePhoneNumber(phone)) {
    uni.showToast({ title: '电话号码无效', icon: 'none' })
    return Promise.resolve({ success: false, reason: 'invalid-phone' })
  }

  // #ifdef APP-PLUS
  return new Promise((resolve) => {
    if (typeof plus === 'undefined' || !plus.messaging) {
      uni.showToast({
        title: '当前安装包未包含短信模块，请重新打包安装',
        icon: 'none'
      })
      resolve({ success: false, reason: 'module-missing' })
      return
    }

    try {
      const message = plus.messaging.createMessage(plus.messaging.TYPE_SMS)
      message.to = [phone]
      message.body = String(body || '')

      plus.messaging.sendMessage(
        message,
        () => resolve({ success: true }),
        (error) => {
          console.error('[SMS] 拉起短信失败', error)
          uni.showToast({ title: '无法使用系统短信能力', icon: 'none' })
          resolve({ success: false, reason: 'platform-failed', error })
        }
      )
    } catch (error) {
      console.error('[SMS] 调用短信模块异常', error)
      uni.showToast({ title: '短信能力调用异常', icon: 'none' })
      resolve({ success: false, reason: 'exception', error })
    }
  })
  // #endif

  // #ifdef MP-WEIXIN
  uni.showToast({ title: '微信小程序暂不支持发短信', icon: 'none' })
  return Promise.resolve({ success: false, reason: 'unsupported' })
  // #endif

  // #ifdef H5
  uni.showToast({ title: '当前浏览器不保证支持短信能力', icon: 'none' })
  return Promise.resolve({ success: false, reason: 'unsupported' })
  // #endif

  return Promise.resolve({ success: false, reason: 'unsupported' })
}
```

不要在模块顶层直接访问 `plus`。必须放在 `APP-PLUS` 条件编译和运行时检测内，否则 H5、小程序或 SSR 构建可能报 `plus is not defined`。

## 5. 原生模块和权限

App 打包配置中需要启用 5+ `Messaging` 模块。Android 权限遵守最小化原则：

- 只做拨号页面拉起时，先验证 `uni.makePhoneCall` 的实际打包行为，不要无理由申请联系人、短信读取等权限。
- 只做短信编写或发送，不应顺手申请 `READ_SMS`、`WRITE_SMS`、`RECEIVE_SMS`。
- 只有业务确实读取短信验证码、监听短信或直接发送时，才按官方文档和应用商店政策补权限及隐私说明。
- Android 对短信和电话权限审查严格，权限与功能不匹配可能导致上架被拒。
- iOS 能力由系统界面控制，也必须真机验证取消、设备不支持等分支。

配置变化后执行：重新云打包 -> 卸载旧包 -> 安装新包 -> 查看版本号 -> 真机测试。运行基座不一定包含新勾选模块。

## 6. 页面接入示例

```vue
<template>
  <view class="contact-actions">
    <button @click="handleCall">打电话</button>
    <button :disabled="smsPending" @click="handleSms">发短信</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  phone: {
    type: String,
    default: ''
  }
})

const smsPending = ref(false)

const handleCall = () => makePhoneCall(props.phone)

const handleSms = async () => {
  if (smsPending.value) return
  smsPending.value = true
  try {
    await openSmsComposer(props.phone)
  } finally {
    smsPending.value = false
  }
}
</script>
```

实际项目中把工具函数放入现有平台能力模块，页面不要复制整套实现。

## 7. 常见故障

### 提示未包含 Messaging 模块

检查打包配置是否启用模块，并确认设备安装的是重新打包后的新包。最常见原因是只改了配置但仍在测试旧安装包。

### 点击无反应

检查手机号、点击事件、防重复状态、运行平台和失败回调。真机系统可能没有 SIM 卡、默认短信应用或电话能力。

### 小程序短信无效

这是平台能力边界，不是页面 bug。隐藏按钮、显示禁用态，或改为复制手机号，不要尝试调用 App API。

### Android 拒绝权限后持续失败

不要循环弹权限申请。给出明确提示，并在需要时引导用户进入系统设置。是否引导应符合平台审核政策。

## 8. 验证清单

- [ ] 空号码、非法号码和国际号码处理正确。
- [ ] Android App 拨号、短信成功和用户取消均验证。
- [ ] iOS App 拨号、短信成功和设备不支持均验证。
- [ ] 微信小程序拨号正常，短信显示能力边界提示。
- [ ] H5 不会因为引用 `plus` 导致运行时报错。
- [ ] 新原生模块使用重新打包后的安装包验证。
- [ ] Android 权限与实际功能一致，没有过度申请。
- [ ] 日志中不打印联系人隐私信息或短信正文。
