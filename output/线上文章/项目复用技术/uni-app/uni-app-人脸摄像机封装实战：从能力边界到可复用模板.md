---
title: "uni-app 人脸摄像机封装实战：从能力边界到可复用模板"
slug: "uni-app-uni-app-b0f67933"
summary: "从 uni-app 和微信小程序的人脸识别能力边界讲起，系统梳理相机、权限、图片转换、识别流程与业务适配该如何拆分，并给出可直接复制使用的目录结构、工具函数、页面模板、接入顺序与排障方法。"
category: "uni-app"
tags:
  - "uni-app"
  - "微信小程序"
  - "人脸识别"
  - "摄像头"
  - "组合式函数"
  - "工程化"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d29208a2b1c68f2cac6d6"
originalSlug: "uni-app-uni-app-b0f67933"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# uni-app 人脸摄像机封装实战：从能力边界到可复用模板

> 这是 `项目复用技术 / uni-app` 目录下的第 1 篇。  
> 这类文章默认按“脱离业务背景、看完能直接用”的方式来写。  
> 这一篇先从人脸摄像机封装开始，专门讲一个很多人都会碰到、但很少一次性讲透的问题：
>
> `uni-app 里做人脸识别页面，相机、权限、Base64、接口、重试、成功回调，到底应该怎么拆？`

> 这篇文章不是一份“API 摘抄”。  
> 我会按真正做项目的顺序来讲：
>
> 1. 先讲能力边界  
> 2. 再讲为什么很多人脸页会越写越乱  
> 3. 再讲一套可复用的结构应该怎么分层  
> 4. 最后给你可以直接起步的模板代码、接入顺序和排障清单

> 你可以把这一篇当成：
>
> `以后再做人脸登录 / 人脸打卡 / 人脸签名 / 人脸查人时都能反复回看的长期模板文档`

## 一、先把问题讲透：为什么人脸识别页面特别容易写乱

很多人第一次做人脸识别时，脑子里想的通常很简单：

1. 调起相机
2. 拍一张照片
3. 转 Base64
4. 调接口
5. 成功后跳页面

看起来没有几步，但真正落到 uni-app 页面里时，很快就会多出很多问题：

1. 微信小程序和 App 的拍照方式是不是一样？
2. 用户拒绝了摄像头权限怎么办？
3. 用户第一次拒绝以后，为什么后面 `authorize` 不再弹了？
4. 接口到底要纯 Base64，还是带 `data:image/jpeg;base64,` 前缀？
5. 要连续拍照识别，还是点一次识别一次？
6. 接口响应慢的时候，下一次拍照要不要暂停？
7. 页面切后台、返回上页、组件卸载时，定时器要不要清？
8. 登录场景、打卡场景、查询场景，成功以后是不是同一套逻辑？

你会发现，真正让人脸页变复杂的，不是“拍照”本身，而是：

`平台能力差异 + 权限状态 + 图片处理 + 异步流程控制 + 业务分叉`

这也是为什么很多项目里的人脸识别页会越来越长，最后变成一个大杂烩：

```txt
页面里同时写
相机能力
+ 权限判断
+ Base64 处理
+ 定时器
+ 接口请求
+ 成功后的登录/打卡/跳转
```

短期能跑，长期一定难维护。

## 二、真正的核心不是“会调 API”，而是先把层次想清楚

如果这一篇你只记住一个结论，我希望是这句：

`人脸识别页最重要的不是某个 API，而是你有没有把“能力”和“业务”拆开。`

我建议把整件事固定拆成 5 层：

1. `相机能力层`
   只负责相机本身的拍照、录像、错误输出
2. `图片处理层`
   只负责 Base64 转换、本地图片读取、格式统一
3. `权限处理层`
   只负责判断权限、申请权限、跳设置页
4. `识别流程层`
   只负责识别状态、重试次数、定时器、提交节奏
5. `业务适配层`
   只负责识别成功以后做什么

一旦这 5 层分清，你以后换业务时只需要替换最后一层。

比如：

1. 人脸登录  
   成功后去拿 token、存用户信息、跳首页
2. 人脸打卡  
   成功后继续调打卡接口、刷新列表、返回上一页
3. 人脸查人  
   成功后拿到用户 ID、跳详情页
4. 人脸签名验证  
   成功后通过 `eventChannel` 回传结果

也就是说：

前面 4 层大部分可以复用，最后 1 层才是业务差异。

## 三、先讲平台边界：为什么不能一套拍照方式走天下

这一步很重要。  
因为很多问题不是“代码写错了”，而是你一开始就把平台能力想错了。

### 1. `camera` 组件到底是什么

在 uni-app 里，`camera` 组件不是“打开系统相机”的意思，而是：

`在当前页面内嵌一个相机预览区域`

这种能力特别适合下面这类场景：

1. 页面中持续预览摄像头画面
2. 页面中连续拍照
3. 页面中不断做识别尝试
4. 页面中显示“请将脸部对准摄像头”

也就是说，如果你想做的是：

1. 打开一个专门的人脸识别页
2. 用户进入后看到相机取景区
3. 系统每隔 2 秒拍一张图去识别

那 `<camera>` 是很自然的方案。

### 2. `uni.createCameraContext()` 真正的定位是什么

很多人看到这个名字，会误以为它是“通用拍照对象”。  
其实不是。

它本质上是：

`给 camera 组件配套用的上下文`

它干的事情主要是：

1. `takePhoto`
2. `startRecord`
3. `stopRecord`

所以这里有一个很重要的理解：

如果你的页面里没有 `<camera>`，那你通常也不需要 `uni.createCameraContext()`。

### 3. 为什么 App 端很多时候更适合 `uni.chooseImage`

如果你的需求不是：

1. 页面里一直挂着相机预览
2. 连续自动拍照识别

而是：

1. 点击“拍摄并识别”
2. 调起系统拍照
3. 拿到一张图片去识别

那 `uni.chooseImage({ sourceType: ['camera'] })` 往往更省事。

这也是很多跨端项目里常见的更稳方案：

1. 小程序端：页面嵌入式相机
2. App 端：系统拍照

这两个方案不是谁更“高级”，而是谁更适合当前平台。

### 4. 一个特别容易混淆的点：流程能统一，不代表入口必须统一

很多人做跨端时，特别想把代码写成“所有端完全一样”。  
但相机这里经常做不到，也没必要。

真正应该统一的是：

1. 图片最后怎么转 Base64
2. 接口怎么调
3. 重试次数怎么算
4. 成功后怎么停
5. 成功后如何进入下一步业务

而不是强迫所有平台都用同一种拍照入口。

所以你后面封装的时候，应该统一的是：

`识别流程`

而不是死磕：

`所有端都用同一个拍照 API`

## 四、再讲权限：很多人脸页真正翻车，不是因为识别，而是因为权限

很多新手以为权限这件事只要写一段：

```js
uni.authorize({
  scope: 'scope.camera'
})
```

就结束了。

实际项目里根本没这么简单。

### 1. 小程序端权限为什么容易反复出问题

因为小程序端权限通常有几个阶段：

1. 用户从没被问过
2. 第一次弹窗，用户允许
3. 第一次弹窗，用户拒绝
4. 用户后来进设置手动改

这就意味着你的人脸页不能只会“第一次申请”，还要会：

1. 识别“现在已经没法再自动弹了”
2. 告诉用户为什么必须开权限
3. 引导用户进入设置页

### 2. 为什么不能一直反复 `authorize`

因为一旦用户之前明确拒绝过，很多时候再次调用并不会再出现第一次那种授权体验。  
这时候应该做的是：

1. 给用户一个清楚说明
2. 再引导去设置页

所以完整的人脸页权限流程，应该至少包括：

1. 先尝试授权
2. 授权成功就开始识别
3. 授权失败就提示原因
4. 再给一个“去设置”入口

### 3. App 端权限的复杂度其实更高

因为 App 端除了“用户拒绝”，还有一种情况很坑：

`工程配置没写对`

这时候你页面里再怎么弹提示都没用。

所以 App 端权限问题至少要分成三类来看：

1. 用户没决定
2. 用户拒绝了
3. 工程配置错误

这就是为什么我前面说：

不要把所有相机打不开的问题都归结成“用户没授权”。

### 4. 一个实战上很重要的经验

权限处理不要写散。

不要这样：

1. 登录页里写一套权限逻辑
2. 打卡页里再写一套
3. 查询页里再写一套

因为过一阵你自己都会忘了这三套谁和谁不一样。

权限这件事非常适合单独抽成一个工具文件。

## 五、Base64 处理为什么也值得单独成层

很多人觉得：

“不就是读个文件，然后传给后端吗？”

但图片处理在真实项目里其实很容易出坑。

### 1. 你拿到的图片数据不一定长得一样

有时候你拿到的是：

```txt
xxxxxx
```

有时候你拿到的是：

```txt
data:image/jpeg;base64,xxxxxx
```

表面上看它们都叫 Base64，但实际用途不一样。

### 2. 为什么页面里最好同时保留两种格式概念

我建议你脑子里把它们分成两类：

1. `DataURL`
   更适合页面预览、前端展示
2. `纯 Base64`
   更适合发给后端接口

如果你不提前把这两个概念分开，后面就特别容易出现这种问题：

1. 页面预览正常，接口报格式错
2. 某个接口能收，另一个接口不能收
3. 小程序端正常，App 端失败

### 3. 所以这一层最适合抽出 3 个函数

我建议最少固定抽这 3 个：

1. `toDataUrl`
2. `toPureBase64`
3. `readImageAsBase64`

这 3 个函数看起来不大，但会极大减少你后面在每个页面里重复写低价值代码。

## 六、为什么识别流程一定要单独抽，而不是继续堆在页面里

真正让人脸页难维护的，不是拍照，也不是 Base64，而是：

`识别流程本身是一个小状态机`

你可以观察一下，一个完整的人脸页至少会经历这些状态：

1. 页面刚进来，还没开始
2. 正在申请权限
3. 相机启动中
4. 请把脸对准摄像头
5. 第 1 次识别中
6. 第 2 次识别中
7. 网络异常
8. 识别失败，继续尝试
9. 达到最大重试次数
10. 识别成功
11. 成功后进入业务动作

这说明它本来就不是一段“顺着跑完的代码”，而是一个状态流。

### 1. 如果不抽流程层，页面里最容易出现什么

最常见的 4 类问题是：

1. 定时器没停
2. 上一次请求还没回来，下一次又发了
3. 已经识别成功了，后面还继续识别
4. 页面返回了，后台还在偷偷跑识别逻辑

### 2. 所以我建议把流程层当成一个小状态机来封

它至少应该统一管理：

1. `statusText`
2. `retryCount`
3. `submitting`
4. `finished`
5. `timer`
6. `start`
7. `stop`
8. `runOnce`

你以后所有人脸页都可以围绕这套状态来写，不容易乱。

## 七、推荐的目录结构为什么是这样

我再把目录结构单独展开解释一下，不然容易只记住路径，忘了为什么这么分。

```txt
src/
  composables/
    useCamera.js
    useFaceCaptureFlow.js
  utils/
    faceImage.js
    facePermission.js
  api/
    face.js
  pages/
    faceVerify/
      index.vue
```

### 1. 为什么 `useCamera.js` 放 `composables`

因为它本质上是组合式能力，不是单纯工具函数。  
它持有响应式状态，比如：

1. `cameraContext`
2. `cameraReady`
3. `cameraError`

### 2. 为什么 `faceImage.js` 放 `utils`

因为这几个函数都是纯工具函数：

1. 输入固定
2. 输出固定
3. 没有页面状态
4. 没有组件生命周期

### 3. 为什么 `facePermission.js` 也放 `utils`

因为权限这一层虽然有异步，但本质仍然是“工具决策层”，不是页面状态机。

### 4. 为什么 `useFaceCaptureFlow.js` 放 `composables`

因为它要管理：

1. 响应式状态
2. 生命周期函数
3. 定时器
4. 识别节奏

所以它更像组合式流程控制器。

### 5. 为什么业务接口单独放 `api/face.js`

因为页面以后改，工具以后改，接口未必改。  
分开以后更容易替换。

## 八、开始写代码：第一层相机能力层完整怎么想

这一层很多人上来就写代码，但其实应该先想清楚目标。

### 1. 这一层到底要解决什么

它要解决的是：

1. 相机上下文何时创建
2. 相机准备好没有
3. 拍照怎么调用
4. 错误怎么暴露给页面

它不应该去解决：

1. 人脸接口怎么调
2. 识别成功后要不要跳首页
3. 失败后要不要重试 10 次

### 2. 推荐模板：`useCamera.js`

```js
import { ref, nextTick } from 'vue'
import { onReady } from '@dcloudio/uni-app'

/**
 * 创建相机能力封装。
 * 用途：统一管理 camera 上下文创建、拍照、录像和基础错误状态。
 * 参数：componentId 可选，相机组件 id；不传时使用当前页面默认 camera 上下文。
 * 返回值：相机上下文、准备状态、错误信息，以及拍照/录像/停止录像等方法。
 * 边界行为：当前平台不支持 createCameraContext 时会记录错误，并在调用拍照/录像时 reject。
 */
export function useCamera(componentId = '') {
  const cameraContext = ref(null)
  const cameraReady = ref(false)
  const cameraError = ref('')

  /**
   * 创建相机上下文。
   * 用途：在页面 ready 后绑定 camera 组件，供后续 takePhoto/startRecord/stopRecord 使用。
   * 参数：无，读取外层 componentId。
   * 返回值：CameraContext 或 null。
   * 边界行为：平台不支持 createCameraContext 时返回 null。
   */
  const createContext = () => {
    if (typeof uni.createCameraContext !== 'function') {
      cameraError.value = '当前平台不支持 createCameraContext'
      return null
    }

    cameraContext.value = componentId
      ? uni.createCameraContext(componentId)
      : uni.createCameraContext()

    return cameraContext.value
  }

  onReady(() => {
    nextTick(() => {
      createContext()
      cameraReady.value = true
    })
  })

  /**
   * 拍摄照片。
   * 用途：调用 cameraContext.takePhoto 获取临时图片路径。
   * 参数：options 可覆盖 takePhoto 配置，如 quality。
   * 返回值：Promise<Object>；成功时通常包含 tempImagePath。
   * 边界行为：相机上下文不存在时 reject。
   */
  const takePhoto = (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!cameraContext.value) {
        reject(new Error(cameraError.value || '相机上下文未初始化'))
        return
      }

      cameraContext.value.takePhoto({
        quality: 'high',
        ...options,
        success: resolve,
        fail: reject
      })
    })
  }

  /**
   * 开始录像。
   * 用途：调用 cameraContext.startRecord 开始录制视频。
   * 参数：options 可传入 startRecord 支持的配置。
   * 返回值：Promise<Object>。
   * 边界行为：相机上下文不存在时 reject。
   */
  const startRecord = (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!cameraContext.value) {
        reject(new Error(cameraError.value || '相机上下文未初始化'))
        return
      }

      cameraContext.value.startRecord({
        ...options,
        success: resolve,
        fail: reject
      })
    })
  }

  /**
   * 停止录像。
   * 用途：调用 cameraContext.stopRecord 停止录制并获取视频临时路径。
   * 参数：options 可传入 stopRecord 支持的配置。
   * 返回值：Promise<Object>。
   * 边界行为：相机上下文不存在时 reject。
   */
  const stopRecord = (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!cameraContext.value) {
        reject(new Error(cameraError.value || '相机上下文未初始化'))
        return
      }

      cameraContext.value.stopRecord({
        ...options,
        success: resolve,
        fail: reject
      })
    })
  }

  /**
   * 处理 camera 组件错误。
   * 用途：将组件错误转换成页面可展示的错误文本，同时保留控制台日志。
   * 参数：e 为 camera 组件 error 事件对象。
   * 返回值：无。
   * 边界行为：没有 detail.errMsg 时使用通用错误文案。
   */
  const onCameraError = (e) => {
    cameraError.value = e?.detail?.errMsg || '相机初始化失败'
    console.error('camera error:', e)
  }

  return {
    cameraContext,
    cameraReady,
    cameraError,
    createContext,
    takePhoto,
    startRecord,
    stopRecord,
    onCameraError
  }
}
```

### 3. 逐段解释为什么要这么写

#### `cameraContext` 为什么是 `ref`

因为它不是常量，而是页面准备完成后才有。

#### 为什么在 `onReady + nextTick` 里创建

因为 `camera` 属于页面渲染相关组件。  
太早拿上下文，很可能还没挂好。

#### 为什么 `takePhoto` 包成 Promise

因为页面后面肯定会用 `await` 串起来：

1. 拍照
2. 读取文件
3. 转 Base64
4. 调接口

如果不统一 Promise 风格，后面代码很快会变丑。

#### 为什么错误不在这里直接 `showToast`

因为工具层不应该决定 UI 怎么提示。  
它只应该把错误交给页面层。

## 九、第二层图片处理层完整怎么想

这一层很多人会低估它的重要性。  
但只要你做过两三个页面，就会发现它是最该抽的。

### 1. 这一层到底负责什么

只负责：

1. 统一格式
2. 读取文件
3. 输出给页面或接口可用的数据

### 2. 推荐模板：`faceImage.js`

```js
/**
 * 转换为 DataURL。
 * 用途：将纯 Base64 统一包装成可预览的 data:image/...;base64 格式。
 * 参数：raw 为原始 Base64 或 DataURL；mimeType 为媒体类型，默认 image/jpeg。
 * 返回值：DataURL 字符串；输入为空时返回空字符串。
 * 边界行为：已是 DataURL 时原样返回，避免重复拼接前缀。
 */
export const toDataUrl = (raw, mimeType = 'image/jpeg') => {
  const text = String(raw || '').trim()
  if (!text) return ''
  if (text.startsWith('data:')) return text
  return `data:${mimeType};base64,${text}`
}

/**
 * 提取纯 Base64。
 * 用途：将 DataURL 中逗号后的内容取出，适配后端只收纯 Base64 的接口。
 * 参数：raw 为纯 Base64 或 DataURL。
 * 返回值：纯 Base64 字符串；无法解析时返回空字符串。
 * 边界行为：输入本来就是纯 Base64 时原样返回。
 */
export const toPureBase64 = (raw) => {
  const text = String(raw || '').trim()
  if (!text) return ''
  if (!text.startsWith('data:')) return text

  const commaIndex = text.indexOf(',')
  if (commaIndex === -1) return ''
  return text.slice(commaIndex + 1)
}

/**
 * 使用文件系统读取图片为 Base64。
 * 用途：小程序或支持 getFileSystemManager 的环境中读取本地临时图片。
 * 参数：filePath 为本地图片路径。
 * 返回值：Promise<string>；成功时返回 DataURL。
 * 边界行为：文件系统不可用、读取失败或结果为空时 reject。
 */
const readByFs = (filePath) => {
  return new Promise((resolve, reject) => {
    if (typeof uni.getFileSystemManager !== 'function') {
      reject(new Error('getFileSystemManager 不可用'))
      return
    }

    uni.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (res) => {
        const base64 = toDataUrl(res?.data)
        if (!base64) {
          reject(new Error('文件读取结果为空'))
          return
        }
        resolve(base64)
      },
      fail: reject
    })
  })
}

/**
 * 使用 HTML5+ plus.io 读取图片为 Base64。
 * 用途：App 端优先通过 plus.io 读取本地文件，提升兼容性。
 * 参数：filePath 为本地图片路径。
 * 返回值：Promise<string>；成功时返回 DataURL。
 * 边界行为：plus.io 不可用、读取失败或结果为空时 reject。
 */
const readByPlus = (filePath) => {
  return new Promise((resolve, reject) => {
    if (
      typeof plus === 'undefined' ||
      !plus.io ||
      typeof plus.io.resolveLocalFileSystemURL !== 'function'
    ) {
      reject(new Error('plus.io 不可用'))
      return
    }

    plus.io.resolveLocalFileSystemURL(
      filePath,
      (entry) => {
        entry.file(
          (file) => {
            const reader = new plus.io.FileReader()
            reader.onloadend = (evt) => {
              const base64 = toDataUrl(evt?.target?.result)
              if (!base64) {
                reject(new Error('plus.io 读取结果为空'))
                return
              }
              resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          },
          reject
        )
      },
      reject
    )
  })
}

/**
 * 读取图片并转换为 Base64。
 * 用途：统一 App 与小程序端图片读取入口，对外始终返回 DataURL。
 * 参数：filePath 为本地图片路径。
 * 返回值：Promise<string>。
 * 边界行为：App 端优先 plus.io，失败后降级 getFileSystemManager；非 App 端直接走文件系统。
 */
export const readImageAsBase64 = (filePath) => {
  // #ifdef APP-PLUS
  return readByPlus(filePath).catch(() => readByFs(filePath))
  // #endif

  // #ifndef APP-PLUS
  return readByFs(filePath)
  // #endif
}
```

### 3. 为什么要同时保留 `toDataUrl` 和 `toPureBase64`

因为页面和接口的需求通常不一样。

#### `toDataUrl` 更适合：

1. 图片预览
2. 页面内临时展示
3. 组件接收图片源

#### `toPureBase64` 更适合：

1. 发给后端
2. 统一接口协议
3. 避免后端解析不一致

### 4. 为什么 `readImageAsBase64` 要做多层兜底

因为真实项目里，不同端、不同容器、不同运行环境的文件读取能力并不完全一致。

所以更稳的思路是：

1. 在 App 端优先试更底层能力
2. 失败再降级到通用文件系统读取
3. 在小程序端直接走文件系统读取

### 5. 这一层最容易踩的坑

1. 只写了一种读取方式，换端就挂
2. 直接把原始 Base64 和 DataURL 混着用
3. 接口层和页面层都各自处理一遍格式，最后谁都说不清

## 十、第三层权限处理层完整怎么想

权限层不是“顺手写一下”，而是整个识别页是否顺畅的关键。

### 1. 这一层到底要解决什么

它要解决的是：

1. 当前有没有权限
2. 第一次怎么申请
3. 拒绝了以后怎么办
4. 怎么带用户去设置页
5. App 端是不是配置就错了

### 2. 推荐模板：`facePermission.js`

```js
/**
 * 获取 App 端摄像头授权状态。
 * 用途：读取 uni.getAppAuthorizeSetting().cameraAuthorized，区分授权、拒绝和配置错误。
 * 参数：无。
 * 返回值：授权状态字符串；非 App 或 API 不可用时返回空字符串。
 * 边界行为：非 App 端不做权限状态判断。
 */
export const getAppCameraPermissionState = () => {
  // #ifdef APP-PLUS
  if (typeof uni.getAppAuthorizeSetting !== 'function') return ''
  const setting = uni.getAppAuthorizeSetting()
  return setting?.cameraAuthorized || ''
  // #endif

  // #ifndef APP-PLUS
  return ''
  // #endif
}

/**
 * 申请小程序摄像头权限。
 * 用途：封装 scope.camera 授权流程。
 * 参数：无。
 * 返回值：Promise<boolean>；授权成功时 resolve true。
 * 边界行为：授权失败时 reject，交由上层引导打开设置页。
 */
export const requestMiniCameraPermission = () => {
  return new Promise((resolve, reject) => {
    uni.authorize({
      scope: 'scope.camera',
      success: () => resolve(true),
      fail: reject
    })
  })
}

/**
 * 打开摄像头权限设置页。
 * 用途：在用户拒绝权限后，引导其恢复摄像头授权。
 * 参数：无。
 * 返回值：Promise<boolean>；小程序端返回设置页里 scope.camera 是否开启。
 * 边界行为：App 端无法直接得知用户是否最终开启时，成功打开设置页即 resolve true。
 */
export const openCameraPermissionSetting = () => {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    uni.openSetting({
      success: (res) => resolve(!!res?.authSetting?.['scope.camera']),
      fail: () => resolve(false)
    })
    return
    // #endif

    // #ifdef APP-PLUS
    if (typeof uni.openAppAuthorizeSetting === 'function') {
      uni.openAppAuthorizeSetting({
        success: () => resolve(true),
        fail: () => resolve(false)
      })
      return
    }
    resolve(false)
    return
    // #endif

    resolve(false)
  })
}

/**
 * 确保当前环境具备摄像头权限。
 * 用途：统一小程序授权申请和 App 授权状态读取。
 * 参数：无。
 * 返回值：Promise<{granted: boolean, state: string, error?: unknown}>。
 * 边界行为：不支持的平台返回 granted false 和 unsupported 状态。
 */
export const ensureCameraPermission = async () => {
  // #ifdef MP-WEIXIN
  try {
    await requestMiniCameraPermission()
    return { granted: true, state: 'authorized' }
  } catch (error) {
    return { granted: false, state: 'denied', error }
  }
  // #endif

  // #ifdef APP-PLUS
  const state = getAppCameraPermissionState()
  return {
    granted: state === '' || state === 'authorized' || state === 'not determined',
    state
  }
  // #endif

  return { granted: false, state: 'unsupported' }
}
```

### 3. 逐段解释这层为什么这么拆

#### 为什么 App 端要单独做 `getAppCameraPermissionState`

因为 App 端权限除了“给了没给”，还可能是：

1. 还没问过
2. 拒绝了
3. 工程配置错误

把这一层单独抽出来，页面层就不用每次都自己猜。

#### 为什么 `openCameraPermissionSetting` 也要公共化

因为页面里每次都去写条件编译非常烦，而且容易写漏某个平台。

### 4. 这层最容易踩的坑

1. 只会申请，不会恢复
2. 权限拒绝后没有“去设置”路径
3. 把配置错误误判成用户拒绝

## 十一、第四层识别流程层完整怎么想

这一层是全文最重要的一层，因为它直接决定页面会不会乱。

### 1. 为什么说它本质上是一个小状态机

因为它至少有这些状态：

1. 待开始
2. 正在启动相机
3. 正在识别第 1 次
4. 正在识别第 2 次
5. 识别未通过，继续中
6. 网络异常
7. 达到最大重试次数
8. 识别成功
9. 已暂停

如果你不把它当状态机来看，而只是写一堆散乱的 `if`，页面很快就会失控。

### 2. 推荐模板：`useFaceCaptureFlow.js`

```js
import { ref, onUnmounted } from 'vue'
import { onHide } from '@dcloudio/uni-app'

/**
 * 创建人脸识别拍照流程控制器。
 * 用途：统一管理定时拍照、最大重试次数、提交中保护、成功停止和页面隐藏清理。
 * 参数：options.capture 负责采集照片；options.verify 负责识别；options.onVerified 为识别成功回调。
 * 返回值：识别状态、重试次数、提交状态，以及 start/stop/runOnce 方法。
 * 边界行为：已成功或正在提交时不会重复触发识别；超过最大重试次数会自动停止定时器。
 */
export function useFaceCaptureFlow(options) {
  const {
    interval = 2000,
    maxRetry = 10,
    capture,
    verify,
    onVerified
  } = options

  const statusText = ref('待开始')
  const retryCount = ref(0)
  const finished = ref(false)
  const submitting = ref(false)

  let timer = null

  /**
   * 清理识别定时器。
   * 用途：识别成功、失败达到上限、暂停或页面隐藏时停止自动拍照。
   * 参数：无。
   * 返回值：无。
   * 边界行为：没有定时器时直接返回。
   */
  const clearTimer = () => {
    if (!timer) return
    clearInterval(timer)
    timer = null
  }

  /**
   * 暂停识别流程。
   * 用途：用户主动停止或页面生命周期结束时中断自动识别。
   * 参数：无。
   * 返回值：无。
   * 边界行为：如果已经识别成功，不覆盖成功状态文案。
   */
  const stop = () => {
    clearTimer()
    if (!finished.value) {
      statusText.value = '识别已暂停'
    }
  }

  /**
   * 执行单次拍照识别。
   * 用途：串联 capture、verify 和 onVerified，完成一次识别尝试。
   * 参数：无。
   * 返回值：Promise<void>。
   * 边界行为：已完成或正在提交时直接返回；异常时展示识别异常状态。
   */
  const runOnce = async () => {
    if (finished.value || submitting.value) return

    submitting.value = true
    try {
      retryCount.value += 1
      if (retryCount.value > maxRetry) {
        statusText.value = '识别失败，请手动重试'
        clearTimer()
        return
      }

      statusText.value = `正在识别... (${retryCount.value}/${maxRetry})`

      const photo = await capture()
      const result = await verify(photo, retryCount.value)

      if (result?.passed) {
        finished.value = true
        clearTimer()
        statusText.value = '识别成功'
        await onVerified?.(result, photo)
        return
      }

      statusText.value = result?.message || '识别未通过，请保持正脸'
    } catch (error) {
      statusText.value = error?.message || '识别异常，请重试'
    } finally {
      submitting.value = false
    }
  }

  /**
   * 启动连续识别流程。
   * 用途：重置状态后立即识别一次，并按 interval 定时继续识别。
   * 参数：无。
   * 返回值：无。
   * 边界行为：启动前会清理旧定时器，避免重复定时任务。
   */
  const start = () => {
    clearTimer()
    retryCount.value = 0
    finished.value = false
    statusText.value = '请将脸部对准摄像头'
    runOnce()
    timer = setInterval(runOnce, interval)
  }

  onHide(clearTimer)
  onUnmounted(clearTimer)

  return {
    statusText,
    retryCount,
    finished,
    submitting,
    start,
    stop,
    runOnce
  }
}
```

### 3. 为什么它比页面里自己写更稳

#### `submitting`

防止上一次请求没回来，下一次又发。

#### `finished`

防止识别成功后还继续发请求。

#### `retryCount`

用来做统一的最大尝试次数控制。

#### `clearTimer`

统一负责停表，避免页面隐藏后还在识别。

#### `onHide` 和 `onUnmounted`

这是很关键的两个兜底点。  
很多 bug 都来自页面已经不在了，但定时器还在。

## 十二、完整页面应该怎么搭

前面讲了四层，现在把它们拼回一个页面，你就会更容易理解为什么要这么拆。

### 1. 页面模板先别写复杂

一个最小可运行的人脸页，模板层不需要花哨，先把结构搭对。

```vue
<template>
  <view class="face-page">
    <!-- #ifdef MP-WEIXIN -->
    <camera
      device-position="front"
      flash="off"
      class="camera"
      @error="onCameraError"
    ></camera>
    <!-- #endif -->

    <view class="status">{{ statusText }}</view>

    <view class="actions">
      <button @click="startVerify" :disabled="submitting">开始识别</button>
      <button @click="stop">停止</button>
    </view>

    <!-- #ifdef APP-PLUS -->
    <view class="actions">
      <button @click="captureForApp" :disabled="submitting">拍摄并识别</button>
    </view>
    <!-- #endif -->
  </view>
</template>
```

### 2. 页面逻辑骨架

```js
<script setup>
import { onMounted } from 'vue'
import { useCamera } from '@/composables/useCamera'
import { useFaceCaptureFlow } from '@/composables/useFaceCaptureFlow'
import { readImageAsBase64, toPureBase64 } from '@/utils/faceImage'
import { ensureCameraPermission, openCameraPermissionSetting } from '@/utils/facePermission'
import { faceCompare } from '@/api/face'

const { takePhoto, onCameraError } = useCamera()

const captureMiniPhoto = async () => {
  const res = await takePhoto({ quality: 'high' })
  return await readImageAsBase64(res.tempImagePath)
}

const captureForApp = async () => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: async (res) => {
        try {
          const filePath = res?.tempFilePaths?.[0]
          const base64 = await readImageAsBase64(filePath)
          await runOnceWithPhoto(base64)
          resolve(base64)
        } catch (error) {
          reject(error)
        }
      },
      fail: reject
    })
  })
}

const verifyFace = async (photo) => {
  const res = await faceCompare({
    username: '这里替换成你的业务账号',
    facebase64: toPureBase64(photo)
  })

  return {
    passed: res.code === 200 && !!res.data,
    message: res.errorMessage || res.msg || '识别未通过'
  }
}

const {
  statusText,
  submitting,
  start,
  stop
} = useFaceCaptureFlow({
  capture: captureMiniPhoto,
  verify: verifyFace,
  onVerified: async () => {
    // 这里写识别成功后的业务动作
  }
})

const runOnceWithPhoto = async (photo) => {
  const result = await verifyFace(photo)
  statusText.value = result.passed ? '识别成功' : result.message
}

const startVerify = async () => {
  const permission = await ensureCameraPermission()
  if (permission.granted) {
    start()
    return
  }

  uni.showModal({
    title: '需要摄像头权限',
    content: '请先开启摄像头权限后再进行人脸识别',
    success: async (res) => {
      if (!res.confirm) return
      await openCameraPermissionSetting()
    }
  })
}

onMounted(() => {
  statusText.value = '准备开始识别'
})
</script>
```

### 3. 这一套代码真正要你学会的，不是逐字复制，而是理解这 4 个边界

#### `captureMiniPhoto`

只负责：

1. 拍照
2. 读文件
3. 返回图片数据

#### `verifyFace`

只负责：

1. 调接口
2. 把结果转成统一结构

#### `useFaceCaptureFlow`

只负责：

1. 节奏
2. 状态
3. 停止条件

#### `onVerified`

只负责：

1. 识别成功后的业务动作

只要这 4 块不混，页面就会非常清楚。

## 十三、不同业务场景怎么套

这部分非常关键，因为你以后很可能不是只做一个人脸页。

### 1. 登录场景怎么套

登录场景通常是：

1. 用户先输入账号
2. 再做人脸识别
3. 识别成功后换 token

常见接口形式：

```js
await faceLogin({
  username: loginName,
  facebase64: toPureBase64(photo)
})
```

成功后的动作一般是：

1. 再请求用户信息
2. 存 token
3. 存用户资料
4. 跳首页

### 2. 打卡场景怎么套

打卡场景通常不是“识别成功就结束”，而是：

1. 识别成功
2. 再继续调用打卡接口

常见接口形式：

```js
await faceCompare({
  username: idCardOrPhone,
  facebase64: toPureBase64(photo)
})
```

成功后的动作一般是：

1. 继续调打卡提交接口
2. 刷新打卡列表
3. 返回上一页

### 3. 查人场景怎么套

这种场景常见于：

1. 门卫查学生
2. 人脸快速查档案
3. 面向管理侧的快速检索

常见接口形式：

```js
await getUserList({
  facebase64: toPureBase64(photo)
})
```

成功后的动作一般是：

1. 取回用户 ID
2. 跳详情页

### 4. 审批确认 / 签名确认场景怎么套

这种场景的重点不是跳新页面，而是：

1. 识别成功后要把结果回传给上一个页面

比较常见的方式是：

1. `eventChannel`
2. 本地存储兜底

成功后的动作一般是：

1. 回传结果
2. 返回上一页
3. 由上一页继续提交流程

## 十四、最容易踩的 12 个坑

这一段你以后做新项目时非常值得反复看。

### 1. 不要每个页面都复制 `toPureBase64`

这是最容易失控的重复代码之一。

### 2. 不要把 DataURL 和纯 Base64 混着传接口

预览和接口要分开对待。

### 3. 不要把相机能力和业务成功动作写在一起

不然以后改登录逻辑时，连相机代码都要跟着看。

### 4. 不要漏掉 `submitting`

否则上一个请求没回来，下一个又发了。

### 5. 不要漏掉 `finished`

否则识别成功后还会继续跑。

### 6. 不要忘记最大重试次数

不然用户会陷入无限识别循环。

### 7. 不要只在 `onUnmounted` 清理定时器

很多时候页面只是切后台、切页，并没有立刻卸载。

### 8. 不要默认 App 端最适合 `<camera>`

很多时候 `chooseImage({ sourceType: ['camera'] })` 更稳更省事。

### 9. 不要把所有权限问题都当成用户拒绝

还有可能是配置层问题。

### 10. 不要在人脸识别页里继续依赖全局错误提示

这类页面更适合：

1. 页面内状态文案
2. 必要时再弹窗

### 11. 不要直接在 uni-app 页面里写 `alert`

统一走：

1. `uni.showToast`
2. `uni.showModal`
3. 页面内状态文案

### 12. 不要把实验页直接当模板扩散

能跑只是第一步，能复用才值得沉淀。

## 十五、建议的接入顺序

以后你换项目再做人脸识别，我非常建议固定按这个顺序接。

### 第一步：先问清楚接口协议

先搞明白：

1. 接口是收纯 Base64 还是 DataURL
2. 接口是否还要账号、手机号、身份证等额外字段
3. 成功返回什么
4. 失败返回什么

### 第二步：先确认拍照方案

再问清楚：

1. 小程序端要嵌入式相机还是单次拍照
2. App 端要嵌入式相机还是系统拍照

### 第三步：先建工具层

先把：

1. `useCamera.js`
2. `faceImage.js`
3. `facePermission.js`

建出来。

### 第四步：再建流程层

也就是：

1. `useFaceCaptureFlow.js`

### 第五步：最后接具体业务页

这个时候再写登录、打卡、查人、签名，就会清楚很多。

## 十六、如何调试：页面出问题时你应该先查哪一层

这一段我专门补上，因为很多文章只教你写，不教你排。

### 1. 相机打不开

先查：

1. 页面里是否真的有 `<camera>`
2. `cameraContext` 是否成功创建
3. 是否进入了 `onCameraError`
4. App 端是不是应该改走 `chooseImage`
5. `manifest.json` 权限和模块有没有配

### 2. 能拍照，但接口一直说图片格式不对

先查：

1. 传给接口的是不是纯 Base64
2. 有没有把 `data:image/jpeg;base64,` 一起传上去
3. 文件读取后有没有出现空字符串

### 3. 页面一直在识别，停不下来

先查：

1. `finished` 有没有置成 `true`
2. `clearTimer()` 有没有真的执行
3. `onHide` 和 `onUnmounted` 有没有清理

### 4. 请求会重复发很多次

先查：

1. `submitting` 有没有拦住并发
2. `runOnce` 里是不是少了 return
3. 成功以后有没有清掉 timer

### 5. 权限弹了一次后，再也不弹了

先查：

1. 用户是不是已经拒绝过
2. 现在是不是应该改走设置页
3. App 端是不是其实是配置错误

## 十七、最后再浓缩成一句话

如果只留一句总结，我会写：

`人脸识别页最值得沉淀的，不是某一段拍照代码，而是“平台边界 + 公共工具 + 流程状态机 + 业务适配”这四层结构。`

只要你先按这四层去想，后面不管是做人脸登录、打卡、查询还是签名，代码都会比“一个页面全包”清楚得多。

## 参考资料

1. [uni-app camera 组件文档](https://uniapp.dcloud.net.cn/component/camera.html)
2. [uni.createCameraContext 官方文档](https://uniapp.dcloud.net.cn/api/media/camera-context.html)
3. [uni.chooseImage 官方文档](https://uniapp.dcloud.net.cn/api/media/image.html)
4. [uni.authorize 官方文档](https://uniapp.dcloud.net.cn/api/other/authorize.html)
5. [uni.openAppAuthorizeSetting 官方文档](https://uniapp.dcloud.net.cn/api/system/openappauthorizesetting.html)
6. [uni.getAppAuthorizeSetting 官方文档](https://uniapp.dcloud.net.cn/api/system/getappauthorizesetting.html)
7. [HTML5+ Camera 文档](https://www.html5plus.org/doc/zh_cn/camera.html)
8. [HTML5+ IO 文档](https://www.html5plus.org/specification/IO.html)
