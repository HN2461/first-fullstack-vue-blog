---
title: "第 2 篇：uni-app 语音输入与语音转文字封装：按住说话、上滑取消、H5 兼容、自动发送"
slug: "uni-app-uni-app-h5-67daf64f"
summary: "uni-app 语音输入与语音转文字封装实战，覆盖录音权限、H5 兼容、语音转文字接口、自动发送和交互状态拆分。"
category: "uni-app"
tags:
  - "uni-app"
  - "语音输入"
  - "语音转文字"
  - "录音权限"
  - "H5"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d29208a2b1c68f2cac6e0"
originalSlug: "uni-app-uni-app-h5-67daf64f"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 2 篇：uni-app 语音输入与语音转文字封装：按住说话、上滑取消、H5 兼容、自动发送

> 这是 `项目复用技术 / uni-app` 目录下的第 2 篇。  
> 这一篇专门讲 `语音输入` 这件事，不是只讲“怎么录音”，而是讲一条完整的可复用链路：
>
> `切到语音输入 -> 按住开始录音 -> 上滑取消 / 松手发送 -> 语音转文字 -> 自动回填输入框 -> 自动发送`

> 你以后可能会在很多场景里用到它：
>
> 1. AI 聊天输入框
> 2. IM 聊天页里的语音转文字输入
> 3. 智能客服
> 4. 表单语音填写
> 5. 搜索页语音搜索

> 这篇文章的目标不是复述某一个页面，而是把整条链路拆成一套：
>
> `以后再接语音输入功能时，直接照着拆就能落地的语音输入模板`

## 一、先把问题讲透：为什么语音输入功能比看起来复杂很多

很多人第一次做语音输入，脑子里想的是：

1. 点一下麦克风
2. 开始录音
3. 结束录音
4. 上传语音
5. 拿到文字
6. 发出去

看起来没几步，但一旦真的放进一个可用的产品页面，你很快就会遇到下面这些问题：

1. 微信小程序、App、H5 的录音方式是不是完全一样？
2. 用户第一次拒绝麦克风权限后，后面怎么办？
3. H5 为什么有时能录，有时直接提示不支持？
4. 按住说话和点按切换语音模式，怎么避免冲突？
5. 上滑取消的阈值怎么判断？
6. 录音时间太短要不要直接丢弃？
7. 录音过程中能不能继续点发送按钮？
8. 正在识别文字时，还能不能继续录？
9. 页面切后台以后，录音和计时器要不要停？
10. 语音转文字接口应该前端直连，还是走后端代理？

你会发现，真正让语音输入复杂的，不是“录音”本身，而是：

`权限 + 交互状态 + 平台差异 + 文件上传 + 识别结果接入现有发送链路`

所以如果你只是把所有逻辑塞进一个页面里，最后很容易变成这样：

```txt
页面里同时写
录音开始
+ 权限申请
+ 录音计时
+ H5 判断
+ 语音文件上传
+ 识别失败提示
+ 输入框回填
+ 自动发送
+ 手势取消
```

短期也许能跑，长期一定越来越乱。

## 二、先给结论：语音输入功能也应该拆层

如果这一篇你只记住一个核心结论，我希望是这句：

`语音输入不要当成一个按钮功能来写，要把它当成一条完整流程来拆。`

我建议固定拆成 5 层：

1. `交互层`
   只负责点按、按住、上滑取消、按钮状态、覆盖层文案
2. `录音能力层`
   只负责开始录音、停止录音、取消录音、录音时长、录音结果
3. `权限层`
   只负责麦克风权限申请、拒绝后的恢复路径
4. `语音转文字层`
   只负责把录音文件传给识别服务，并取回文本结果
5. `业务接入层`
   只负责把识别后的文字接到现有输入框、搜索框或发送链路里

只要这 5 层拆清，你以后不管是：

1. AI 助手聊天
2. IM 语音输入
3. 搜索框语音搜索
4. 表单语音填写

大部分代码都能复用。

## 三、先讲平台能力边界：不是所有端都用同一种录音方式

语音输入最容易被误解的一点就是：

“都叫 uni-app，录音是不是一套代码就行？”

答案是：

`核心流程可以统一，但录音入口不一定完全统一。`

### 1. 小程序 / App 端：更适合 `uni.getRecorderManager()`

uni-app 官方 `uni.getRecorderManager()` 文档说明，它提供：

1. `start()`
2. `stop()`
3. `onStart()`
4. `onStop()`
5. `onError()`

这意味着在非 H5 端，最自然的录音入口通常就是它。

你可以把它理解成：

`uni-app 提供的录音管理器`

它更适合：

1. 按住开始录音
2. 松手结束录音
3. 返回临时音频文件路径
4. 后续再上传到语音转文字服务

### 2. H5 端：更适合 `getUserMedia + MediaRecorder`

H5 端情况不一样。  
你不能指望所有浏览器都像小程序那样直接给你一个 `RecorderManager`。

H5 端更常见的方案是：

1. 用 `navigator.mediaDevices.getUserMedia({ audio: true })` 申请麦克风
2. 得到 `MediaStream`
3. 再用 `MediaRecorder` 录制
4. 把最终的音频片段拼成 `Blob`
5. 再上传到语音转文字接口

所以这里真正应该统一的是：

1. 最终输出“一个可上传的音频对象”
2. 后面转文字的流程

而不是强行让所有平台都走同一个录音 API。

### 3. H5 端还有一个特别现实的前提：必须是安全上下文

MDN 对 `getUserMedia()` 的说明非常明确：

1. 它只允许在 `HTTPS` 或 `localhost` 这样的安全上下文中使用
2. 如果不是安全上下文，`navigator.mediaDevices` 很可能就是 `undefined`

这意味着：

如果你后面在 H5 本地或测试环境调语音输入，一定要先确认：

1. 是不是 `https`
2. 或者是不是 `localhost`

不然你可能会误以为“代码写错了”，实际上是运行环境根本不允许。

### 4. H5 端还要考虑 `MediaRecorder` 的格式兼容问题

浏览器能录音，不代表录出来的 MIME 类型完全一样。

一个比较稳的思路是像下面这样做候选：

1. `audio/webm;codecs=opus`
2. `audio/webm`
3. `audio/mp4`

然后用 `MediaRecorder.isTypeSupported()` 检测，选第一个可用的。

这样做的好处是：

1. 兼容更多浏览器
2. 后面构造 `File` / `Blob` 时更清楚
3. 识别服务更容易知道文件类型

## 四、权限为什么是语音输入里最容易翻车的一层

很多人把麦克风权限当成录音的“顺带部分”，但实际项目里，它经常才是最麻烦的。

### 1. 小程序端权限不是只申请一次就完了

小程序端最常见的权限路径是：

1. 从没问过
2. 第一次询问，用户允许
3. 第一次询问，用户拒绝
4. 用户后来去设置页重新修改

所以真正可用的语音输入页，至少要会处理两件事：

1. 第一次申请权限
2. 用户拒绝后，引导恢复权限

### 2. 为什么建议先 `getSetting` 再 `authorize`

因为这样你可以先判断：

1. 用户是不是明确拒绝过
2. 当前是不是应该直接引导去设置页

如果你每次都只知道无脑 `authorize`，页面体验会比较生硬，也不容易给用户清晰反馈。

### 3. H5 端权限和小程序不一样

H5 端不是 `scope.record` 这一套，而是浏览器自己的麦克风权限模型。

通常你不需要像小程序一样显式调用 `authorize`，而是：

1. `getUserMedia({ audio: true })`
2. 浏览器弹权限
3. 用户允许后给你 `MediaStream`
4. 用户拒绝就抛异常

所以你在封装权限层时，最好把小程序 / App 与 H5 分开看，不要硬揉成一种逻辑。

## 五、真正可复用的交互，不只是“点一下麦克风”

如果你只是做一个“点一下开始，再点一下结束”的简单语音按钮，其实并不复杂。  
真正让语音输入有产品感的，通常是这几个细节：

1. 切换文字输入 / 语音输入模式
2. 按住开始录音
3. 松手发送
4. 上滑取消
5. 录音中显示覆盖层
6. 识别中显示 loading
7. 识别完成后自动回填并发送

这几个细节里，最容易被忽略但特别有用的是：

`上滑取消`

### 1. 上滑取消为什么值得做

因为“按住说话”这类交互里，用户经常会在说到一半时临时改变主意。

如果没有上滑取消，用户要么：

1. 被迫录完一段废话
2. 要么录完再删

这会让体验很差。

### 2. 上滑取消的判断其实不复杂

你只需要记录：

1. 触摸开始时的 `Y`
2. 触摸移动时的 `Y`
3. 如果 `startY - currentY` 超过阈值，就进入“准备取消”

一个比较实用的阈值思路是：

```js
const getVoiceCancelThreshold = () => Math.max(convertRpxToPx(120), 56)
```

这段逻辑的意义不是“120 一定神奇”，而是：

1. 既兼顾不同屏幕密度
2. 又避免阈值太小，用户随手抖一下就触发取消

### 3. 为什么还要单独做录音覆盖层

因为用户在按住时，注意力通常已经不在输入框上了。  
这时候最有效的反馈不是普通按钮变色，而是一个独立的覆盖层提示：

1. 正在录音
2. 松手发送
3. 上滑取消
4. 当前是否已进入取消状态

这会比只改按钮文案清楚很多。

## 六、推荐的目录结构：这套功能以后怎么存才不乱

如果你的目标真的是“以后继续复用”，我建议从一开始就把语音输入相关文件拆好。

```txt
src/
  composables/
    useVoiceRecorder.js
    useVoiceInputFlow.js
  utils/
    voicePermission.js
    voiceFile.js
  api/
    speech.js
  pages/
    voice-demo/
      index.vue
```

### 每一层建议负责什么

#### `useVoiceRecorder.js`

只负责：

1. 开始录音
2. 停止录音
3. 取消录音
4. 返回录音结果
5. H5 / 非 H5 分流

#### `useVoiceInputFlow.js`

只负责：

1. 当前是否在录音
2. 当前是否在识别
3. 当前录音时长
4. 上滑取消状态
5. 覆盖层显示状态

#### `voicePermission.js`

只负责：

1. 麦克风权限
2. 小程序拒绝后的设置页恢复
3. H5 权限异常提示

#### `voiceFile.js`

只负责：

1. H5 `Blob` / `File` 处理
2. 录音文件后缀、MIME 类型推导

#### `speech.js`

只负责：

1. 上传音频文件
2. 调语音转文字接口
3. 返回识别文本

## 七、先写最核心的第一层：录音能力层

语音输入最底层的抽象，不是“识别”，而是：

`先得到一个可以上传的音频结果`

### 1. 非 H5 端录音模板

下面是一套适合小程序 / App 端的 `useVoiceRecorder.js` 模板骨架：

```js
import { ref } from 'vue'

/**
 * 创建跨端录音能力封装。
 * 用途：管理非 H5 端 RecorderManager 的初始化、开始录音、停止录音、取消录音和录音时长。
 * 参数：无。
 * 返回值：录音管理器、录音状态、时长状态，以及开始/停止/取消录音等方法。
 * 边界行为：H5 端直接跳过原生 RecorderManager 初始化，避免调用不存在的录音 API。
 */
export function useVoiceRecorder() {
  const recorderManager = ref(null)
  const isRecording = ref(false)
  const recordDuration = ref(0)
  const recordTimer = ref(null)
  const ignoreNextRecordStop = ref(false)

  /**
   * 清理录音计时器。
   * 用途：在录音结束、取消、异常或页面退出时统一停止计时。
   * 参数：无。
   * 返回值：无。
   * 边界行为：没有计时器时直接返回，避免重复 clearInterval。
   */
  const clearRecordTimer = () => {
    if (recordTimer.value) {
      clearInterval(recordTimer.value)
      recordTimer.value = null
    }
  }

  /**
   * 初始化非 H5 端录音管理器。
   * 用途：绑定录音开始和错误事件，准备后续 start/stop 调用。
   * 参数：无。
   * 返回值：无。
   * 边界行为：H5 端不初始化；已初始化时直接返回，避免重复绑定事件。
   */
  const initRecorderManager = () => {
    // #ifdef H5
    return
    // #endif

    // #ifndef H5
    if (recorderManager.value) return

    recorderManager.value = uni.getRecorderManager()

    recorderManager.value.onStart(() => {
      ignoreNextRecordStop.value = false
      isRecording.value = true
      recordDuration.value = 0
      clearRecordTimer()
      recordTimer.value = setInterval(() => {
        recordDuration.value += 1
      }, 1000)
    })

    recorderManager.value.onError((error) => {
      console.error('录音失败', error)
      isRecording.value = false
      clearRecordTimer()
    })
    // #endif
  }

  /**
   * 启动非 H5 端录音。
   * 用途：按住说话时启动 RecorderManager，并设置最长录音时长、格式和采样参数。
   * 参数：无。
   * 返回值：无。
   * 边界行为：H5 端直接返回；录音管理器不可用或正在录音时不重复启动。
   */
  const startNativeRecord = () => {
    // #ifdef H5
    return
    // #endif

    // #ifndef H5
    initRecorderManager()
    if (!recorderManager.value || isRecording.value) return

    recorderManager.value.start({
      duration: 60000,
      format: 'mp3',
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
    })
    // #endif
  }

  /**
   * 停止非 H5 端录音。
   * 用途：用户松手发送时结束录音，并触发 RecorderManager.onStop。
   * 参数：无。
   * 返回值：无。
   * 边界行为：H5 端直接返回；未初始化或未录音时不执行 stop。
   */
  const stopNativeRecord = () => {
    // #ifdef H5
    return
    // #endif

    // #ifndef H5
    if (!recorderManager.value || !isRecording.value) return
    recorderManager.value.stop()
    // #endif
  }

  /**
   * 取消非 H5 端录音。
   * 用途：用户上滑取消时停止录音，但让 onStop 忽略这次录音结果。
   * 参数：无。
   * 返回值：无。
   * 边界行为：H5 端直接返回；未录音时不处理；会同步清理计时器和录音状态。
   */
  const cancelNativeRecord = () => {
    // #ifdef H5
    return
    // #endif

    // #ifndef H5
    if (!recorderManager.value || !isRecording.value) return
    ignoreNextRecordStop.value = true
    recorderManager.value.stop()
    clearRecordTimer()
    isRecording.value = false
    // #endif
  }

  return {
    recorderManager,
    isRecording,
    recordDuration,
    ignoreNextRecordStop,
    initRecorderManager,
    startNativeRecord,
    stopNativeRecord,
    cancelNativeRecord,
    clearRecordTimer,
  }
}
```

### 2. 为什么录音参数常见是 `mp3 + 16k + 单声道`

这组参数在很多语音转文字场景里都比较常见，因为它在“识别效果”和“上传体积”之间比较平衡：

1. `format: 'mp3'`
   通常通用性比较好
2. `sampleRate: 16000`
   语音识别场景常见
3. `numberOfChannels: 1`
   单声道对语音足够
4. `encodeBitRate: 96000`
   在移动端体积和质量之间比较均衡

这不是说它是唯一答案，而是：

如果你不知道先用什么，这是一组很稳的起点。

### 3. 为什么要做“最短录音时长”判断

如果用户刚按住就松手，很多时候你根本不需要上传文件。  
直接在录音结束回调里做判断会更合理：

```js
if (!res?.tempFilePath || res.duration < 1000) {
  uni.showToast({
    title: '录音时间太短',
    icon: 'none',
  })
  return
}
```

这里的 1000 毫秒不是绝对标准，但很适合作为一个初始阈值。

## 八、第二层：H5 录音兼容层为什么必须单独讲

H5 端如果你不单独处理，最后经常会有两种结果：

1. 干脆不支持
2. 或者录出来的文件不好上传

### 1. H5 端的完整链路应该是什么

我建议你脑子里固定成这 6 步：

1. `getUserMedia({ audio: true })`
2. 拿到 `MediaStream`
3. `new MediaRecorder(stream)`
4. `ondataavailable` 收集音频片段
5. `onstop` 拼成 `Blob`
6. 上传 `Blob / File` 去做语音转文字

### 2. 推荐模板：H5 录音部分

```js
const h5Recorder = ref(null)
const h5MediaStream = ref(null)
const h5VoiceChunks = ref([])

/**
 * 构建 H5 录音 Blob。
 * 用途：将 MediaRecorder 分段收集到的音频 chunk 合并成可上传的 Blob。
 * 参数：无。
 * 返回值：Blob；如果没有有效音频片段则返回 null。
 * 边界行为：优先使用 MediaRecorder 的 mimeType，缺失时退回第一个 chunk 的类型或 audio/webm。
 */
const buildH5VoiceBlob = () => {
  const voiceChunks = h5VoiceChunks.value || []
  if (!voiceChunks.length) {
    return null
  }

  const mediaRecorder = h5Recorder.value
  const mimeType = mediaRecorder?.mimeType || voiceChunks[0]?.type || 'audio/webm'
  return new Blob(voiceChunks, { type: mimeType })
}

/**
 * 停止并释放 H5 麦克风媒体流。
 * 用途：录音结束、取消或异常时释放浏览器麦克风资源。
 * 参数：无。
 * 返回值：无。
 * 边界行为：没有可停止的 track 时只清空本地状态。
 */
const stopH5MediaStreamTracks = () => {
  if (h5MediaStream.value?.getTracks) {
    h5MediaStream.value.getTracks().forEach((track) => track.stop())
  }

  h5MediaStream.value = null
  h5Recorder.value = null
  h5VoiceChunks.value = []
}

/**
 * 启动 H5 录音。
 * 用途：通过 getUserMedia 获取麦克风，再用 MediaRecorder 录制音频。
 * 参数：无。
 * 返回值：Promise<void>。
 * 边界行为：浏览器不支持 getUserMedia 或 MediaRecorder 时提示不可用；录音结束后由 onstop 收口。
 */
const startRecordForH5 = async () => {
  if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    uni.showToast({
      title: '当前浏览器不支持录音',
      icon: 'none',
    })
    return
  }

  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

  const mimeTypeCandidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ]

  const supportedMimeType = mimeTypeCandidates.find((item) => {
    try {
      return typeof MediaRecorder.isTypeSupported === 'function'
        ? MediaRecorder.isTypeSupported(item)
        : false
    } catch (error) {
      return false
    }
  })

  const mediaRecorder = supportedMimeType
    ? new MediaRecorder(mediaStream, { mimeType: supportedMimeType })
    : new MediaRecorder(mediaStream)

  h5MediaStream.value = mediaStream
  h5Recorder.value = mediaRecorder
  h5VoiceChunks.value = []

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      h5VoiceChunks.value = [...h5VoiceChunks.value, event.data]
    }
  }

  mediaRecorder.onstop = async () => {
    const voiceBlob = buildH5VoiceBlob()
    stopH5MediaStreamTracks()
    if (!voiceBlob || voiceBlob.size <= 0) return
    // 后续走语音转文字
  }

  mediaRecorder.start()
}

/**
 * 停止 H5 录音。
 * 用途：用户松手发送时停止 MediaRecorder，并触发 onstop 构建 Blob。
 * 参数：无。
 * 返回值：无。
 * 边界行为：录音器不存在或已 inactive 时直接返回。
 */
const stopRecordForH5 = () => {
  const mediaRecorder = h5Recorder.value
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    return
  }

  mediaRecorder.stop()
}
```

### 3. 为什么要在 `onstop` 里统一收口

因为 H5 端录音结果不是“一开始就完整给你”的，通常是通过：

1. `ondataavailable` 分段给你
2. `onstop` 时你再统一拼起来

所以把最终识别入口放在 `onstop` 后面，逻辑会更清楚。

## 九、第三层：权限层模板怎么写

这一层建议你尽量公共化，不要散落在每个页面里。

### 1. 推荐模板：`voicePermission.js`

```js
/**
 * 申请小程序录音权限。
 * 用途：封装 scope.record 授权请求，供语音输入开始前调用。
 * 参数：无。
 * 返回值：Promise<boolean>；授权成功时 resolve true。
 * 边界行为：授权失败时 reject，交给上层决定是否打开设置页。
 */
export const requestRecordPermission = () =>
  new Promise((resolve, reject) => {
    uni.authorize({
      scope: 'scope.record',
      success: () => resolve(true),
      fail: reject,
    })
  })

/**
 * 确保当前环境具备录音权限。
 * 用途：统一处理 H5 与非 H5 的权限入口；非 H5 端先检查 getSetting 再 authorize。
 * 参数：无。
 * 返回值：Promise<{granted: boolean, needOpenSetting?: boolean, error?: unknown}>。
 * 边界行为：H5 端默认交给浏览器 getUserMedia 弹权限；用户明确拒绝过时返回 needOpenSetting。
 */
export const ensureRecordPermission = () =>
  new Promise((resolve, reject) => {
    // #ifdef H5
    resolve({ granted: true })
    return
    // #endif

    // #ifndef H5
    uni.getSetting({
      success: async (res) => {
        if (res.authSetting['scope.record'] === false) {
          resolve({ granted: false, needOpenSetting: true })
          return
        }

        try {
          await requestRecordPermission()
          resolve({ granted: true })
        } catch (error) {
          resolve({ granted: false, needOpenSetting: true, error })
        }
      },
      fail: async () => {
        try {
          await requestRecordPermission()
          resolve({ granted: true })
        } catch (error) {
          reject(error)
        }
      },
    })
    // #endif
  })
```

### 2. 页面怎么用这层

```js
const requestRecordPermissionAndStart = async () => {
  const permission = await ensureRecordPermission()

  if (permission.granted) {
    startRecord()
    return
  }

  uni.showModal({
    title: '提示',
    content: '需要录音权限才能使用语音输入',
    confirmText: '去设置',
    success: (modalRes) => {
      if (modalRes.confirm) {
        uni.openSetting()
      }
    },
  })
}
```

### 3. 这一层的重点不是代码多，而是体验一致

用户不在乎你是不是封得优雅，用户在乎的是：

1. 为什么不能录
2. 怎么恢复
3. 恢复后能不能继续用

所以权限层一定要有完整闭环。

## 十、第四层：语音转文字接口层怎么封

这一层是很多项目最容易写得危险的地方。  
因为录音成功以后，通常下一步就是上传语音文件给识别服务。

### 1. 这层到底负责什么

只负责：

1. 接收录音文件
2. 上传文件
3. 返回识别文字

### 2. 推荐模板：`api/speech.js`

```js
const AUDIO_TO_TEXT_URL = '请替换成你的后端接口地址'

/**
 * H5 端上传录音文件并请求语音转文字。
 * 用途：将 Blob/File 通过 multipart/form-data 上传到语音识别接口。
 * 参数：params.file 为必填 File/Blob；params.user 为用户标识；params.fileName 为可选文件名。
 * 返回值：Promise<Object>；成功时返回接口 JSON。
 * 边界行为：缺少文件会 reject；HTTP 非 2xx 或 JSON 解析失败时 reject。
 */
const uploadAudioToTextByH5 = (params = {}) =>
  new Promise((resolve, reject) => {
    const file = params.file || null
    const user = params.user || 'anonymous'
    if (!file) {
      reject(new Error('缺少录音文件'))
      return
    }

    const formData = new FormData()
    formData.append('file', file, params.fileName || `voice_${Date.now()}.webm`)
    formData.append('user', user)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', AUDIO_TO_TEXT_URL)

    xhr.onload = () => {
      try {
        const responseData = xhr.responseText ? JSON.parse(xhr.responseText) : {}
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(responseData?.message || `语音识别失败（HTTP ${xhr.status}）`))
          return
        }

        resolve(responseData || {})
      } catch (error) {
        reject(new Error('语音识别结果解析失败'))
      }
    }

    xhr.onerror = () => reject(new Error('语音识别请求失败'))
    xhr.send(formData)
  })

/**
 * 上传录音并转换为文字。
 * 用途：统一 H5 的 File/Blob 上传和非 H5 的 filePath 上传，向上层返回识别结果。
 * 参数：H5 传 file/fileName/user；非 H5 传 filePath/user。
 * 返回值：Promise<Object>；通常包含 text 字段。
 * 边界行为：缺少录音文件、上传失败、非 2xx 状态或结果解析失败时 reject。
 */
export const postAudioToTextApi = (params = {}) => {
  // #ifdef H5
  return uploadAudioToTextByH5(params)
  // #endif

  // #ifndef H5
  return new Promise((resolve, reject) => {
    if (!params.filePath) {
      reject(new Error('缺少录音文件'))
      return
    }

    uni.uploadFile({
      url: AUDIO_TO_TEXT_URL,
      filePath: params.filePath,
      name: 'file',
      formData: {
        user: params.user || 'anonymous',
      },
      success: (res) => {
        try {
          const responseData =
            typeof res.data === 'string' ? JSON.parse(res.data) : res.data

          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(responseData?.message || `语音识别失败（HTTP ${res.statusCode}）`))
            return
          }

          resolve(responseData || {})
        } catch (error) {
          reject(new Error('语音识别结果解析失败'))
        }
      },
      fail: reject,
    })
  })
  // #endif
}
```

### 3. 为什么 H5 和非 H5 上传也要分开

因为它们拿到的不是同一种对象：

1. H5 更自然的是 `Blob / File`
2. 小程序 / App 更自然的是临时文件路径 `tempFilePath`

所以这一层公共化时，最好的抽象不是强行统一参数，而是统一出口：

`不管传进来的是 file 还是 filePath，最后都返回识别结果对象`

### 4. 一个非常重要的安全提醒

如果你用的是第三方语音转文字服务，比如 Dify 一类接口，官方文档已经明确建议：

`API Key 应该放在服务端，不要直接暴露在客户端。`

所以真正上线时，更推荐的做法是：

1. 前端把录音文件上传到你自己的后端
2. 后端再去请求第三方语音识别服务
3. 前端只拿识别后的文本

前端直连更适合：

1. 临时联调
2. 可行性验证
3. 本地测试

不适合长期生产环境。

## 十一、第五层：怎么把识别结果接回你现有输入框

很多文章写到“识别到文本”就停了，但真正落地时，这一步才决定复用价值。

### 1. 最常见的接法：回填输入框，再走现有发送链路

这是我最推荐的思路，因为它复用性最高。

```js
/**
 * 识别非 H5 端录音并自动发送。
 * 用途：将临时录音文件上传到语音转文字接口，识别成功后回填输入框并复用文本发送链路。
 * 参数：filePath 为录音临时文件路径。
 * 返回值：Promise<void>。
 * 边界行为：无文件路径或正在识别时直接返回；未识别到文本时提示但不发送。
 */
const recognizeVoiceAndSend = async (filePath) => {
  if (!filePath || isRecognizingVoice.value) {
    return
  }

  isRecognizingVoice.value = true

  uni.showLoading({
    title: '语音识别中',
    mask: true,
  })

  try {
    const response = await postAudioToTextApi({
      filePath,
      user: getVoiceUserIdentifier(),
    })

    const recognizedText = String(response?.text || '').trim()

    if (!recognizedText) {
      uni.showToast({
        title: '未识别到有效内容',
        icon: 'none',
      })
      return
    }

    draftMessage.value = recognizedText
    await submitMessage(recognizedText)
  } catch (error) {
    uni.showToast({
      title: error?.message || '语音识别失败',
      icon: 'none',
    })
  } finally {
    isRecognizingVoice.value = false
    uni.hideLoading()
  }
}
```

### 2. 为什么我推荐“走原有文本发送链路”

因为这样你不用再维护第二套发送逻辑。

也就是说，语音输入这条链路最后只需要负责：

1. 把语音变成文字
2. 把文字塞回你已有的文本发送函数

后面像：

1. 消息风格
2. 会话上下文
3. 特殊流程路由
4. 聊天记录更新

这些都还能继续走原来的文本发送逻辑。

这才是真正的“可复用”。

## 十二、如果要做“按住说话 + 上滑取消”，页面层应该怎么写

这一层是你最容易直接在业务页里写的，但我建议你也尽量保持结构清楚。

### 1. 按住开始

```js
/**
 * 处理按住说话开始事件。
 * 用途：记录触摸起点、显示录音覆盖层，并在权限通过后开始录音。
 * 参数：event 为 touchstart 事件对象。
 * 返回值：无。
 * 边界行为：切换锁定、非语音模式、识别中、发送中或录音中都会直接返回。
 */
const handleVoiceHoldStart = (event) => {
  if (voiceToggleLocked.value || !voiceInputMode.value || isRecognizingVoice.value || isSending.value || isRecording.value) {
    return
  }

  const clientY = getTouchClientY(event)
  voiceTouchStartY.value = clientY
  voiceTouchCurrentY.value = clientY
  isVoiceCancelReady.value = false
  showVoiceRecordOverlay.value = true
  requestRecordPermissionAndStart()
}
```

### 2. 移动时判断是否进入取消态

```js
/**
 * 处理按住说话移动事件。
 * 用途：根据手指上滑距离判断是否进入“松手取消”状态。
 * 参数：event 为 touchmove 事件对象。
 * 返回值：无。
 * 边界行为：非语音模式或未录音时直接返回。
 */
const handleVoiceHoldMove = (event) => {
  if (!voiceInputMode.value || !isRecording.value) {
    return
  }

  const clientY = getTouchClientY(event)
  voiceTouchCurrentY.value = clientY
  isVoiceCancelReady.value = voiceTouchStartY.value - clientY >= getVoiceCancelThreshold()
}
```

### 3. 松手结束

```js
/**
 * 处理按住说话结束事件。
 * 用途：根据当前是否进入取消态，决定取消录音或停止录音并发送。
 * 参数：无。
 * 返回值：无。
 * 边界行为：未处于语音模式或未录音时只重置触摸状态。
 */
const handleVoiceHoldEnd = () => {
  if (!voiceInputMode.value || !isRecording.value) {
    resetVoiceTouchState()
    return
  }

  if (isVoiceCancelReady.value) {
    cancelActiveVoiceRecord()
    return
  }

  stopRecord()
}
```

### 4. 为什么还要做 `voiceToggleLocked`

这是一个特别容易被忽视但很有用的小细节。  
它的作用是：

防止用户刚切到语音输入模式时，因为连续点击太快，立刻又误触发其他动作。

一个很短的锁定就够了，比如：

```js
/**
 * 短暂锁定语音模式切换。
 * 用途：防止用户刚切换到语音输入后，因为连续点击导致误触发录音或切回文本。
 * 参数：无。
 * 返回值：无。
 * 边界行为：重复调用会覆盖旧计时器，只保留最后一次锁定窗口。
 */
const lockVoiceToggleBriefly = () => {
  voiceToggleLocked.value = true
  setTimeout(() => {
    voiceToggleLocked.value = false
  }, 220)
}
```

这种小优化会让交互更稳。

## 十三、推荐的完整状态设计

如果你后面打算把语音输入真正抽成可复用模块，我建议至少固定这些状态。

### 1. 核心状态

1. `voiceInputMode`
   当前是不是语音输入模式
2. `isRecording`
   当前是不是正在录音
3. `isRecognizingVoice`
   当前是不是正在做语音转文字
4. `recordDuration`
   当前录音时长
5. `isVoiceCancelReady`
   当前是不是准备取消
6. `showVoiceRecordOverlay`
   是否显示录音覆盖层

### 2. H5 专属状态

1. `h5Recorder`
2. `h5MediaStream`
3. `h5VoiceChunks`

### 3. 非 H5 端专属状态

1. `recorderManager`
2. `ignoreNextRecordStop`

### 4. 为什么这些状态最好明确定义

因为语音输入最怕出现“看起来能录，但边界状态混乱”。  
把状态先定义清楚，很多 bug 会直接少一半。

## 十四、最容易踩的 14 个坑

这一段你以后再做语音输入时非常值得反复看。

### 1. 只做录音，不做权限恢复

第一次拒绝后体验会很差。

### 2. 只做小程序录音，不考虑 H5

后面一上 H5 就得重写。

### 3. H5 端忘了 `HTTPS / localhost` 前提

最后会误判成代码不支持。

### 4. 录音成功后没做时长下限判断

一堆 0.2 秒废录音也上传了。

### 5. 录音结束后没清计时器

时长会一直加。

### 6. 页面隐藏时不清理录音状态

切后台后状态会脏。

### 7. 取消录音时还继续走识别流程

这就是为什么要有 `ignoreNextRecordStop` 或移除 H5 `onstop`。

### 8. 识别中还允许继续录音

会造成并发冲突。

### 9. 录音中还允许发送按钮继续触发

同样会造成流程混乱。

### 10. H5 端不做 MIME 类型兼容

某些浏览器直接不录，或者后续文件类型不稳定。

### 11. 语音转文字接口直接把 API Key 写死在客户端

只适合临时验证，不适合长期生产。

### 12. 识别成功后又自己写一套“语音消息发送逻辑”

很多时候其实直接复用文本发送链路就够了。

### 13. 按住说话没有取消态提示

用户很难知道自己当前是在“发送”还是“取消”。

### 14. 忘了给用户及时反馈

比如：

1. 录音时间太短
2. 识别中
3. 未识别到有效内容
4. 识别失败

这些提示都很重要。

## 十五、建议的接入顺序

以后你换项目再接语音输入，我建议固定按这个顺序来。

### 第一步：先确定最终是“语音消息”还是“语音转文字”

这两种场景不要一开始混了。

这一篇讲的是：

`语音转文字后继续走文本输入链路`

### 第二步：先选录音方案

1. 非 H5：`uni.getRecorderManager()`
2. H5：`getUserMedia + MediaRecorder`

### 第三步：先把权限层抽出来

不要一上来就在页面里写一堆 `authorize`。

### 第四步：再写录音层

只先确保：

1. 能开始
2. 能结束
3. 能取消
4. 能拿到音频结果

### 第五步：再写语音转文字层

确保上传文件和解析结果稳定。

### 第六步：最后才接页面交互

也就是：

1. 按住开始
2. 上滑取消
3. 松手发送
4. 自动回填和发送

这样做会比从页面 UI 倒着写轻松很多。

## 十六、最后浓缩成一句话

如果只留一句总结，我会写：

`语音输入真正值得沉淀的，不是“怎么按住录音”，而是“录音能力 + 权限层 + H5 兼容 + 转文字接口 + 文本发送链路复用”这五层结构。`

你以后再做 AI 聊天、IM、搜索、表单语音输入，只要先按这五层去拆，代码就会清楚很多。

## 参考资料

1. [uni.getRecorderManager() 官方文档](https://en.uniapp.dcloud.io/api/media/record-manager.html)
2. [uni.authorize 官方文档](https://uniapp.dcloud.net.cn/api/other/authorize.html)
3. [uni.uploadFile 官方文档](https://uniapp.dcloud.net.cn/api/request/network-file.html)
4. [MDN: MediaDevices.getUserMedia()](https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia)
5. [MDN: Using the MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API)
6. [Dify: Convert Audio to Text](https://docs.dify.ai/api-reference/tts/convert-audio-to-text)
