---
title: "第 11 篇：uni-app Vue 3 Canvas 名片生成：组件作用域、多实例与图片导出"
slug: "uniapp-vue3-canvas-business-card-export"
summary: "以 uni-app Vue 3 名片图片生成为例，处理 Canvas 组件作用域、多实例标识、网络图片预加载、绘制时机、弹窗交互与导出验证。"
category: "uni-app"
categoryPath:
  - "项目复用技术"
  - "uni-app"
tags:
  - "uni-app"
  - "Canvas"
  - "名片生成"
  - "Vue 3"
status: "published"
sortOrder: 110
cover: ""
originalId: "6abf80f2b29038327447c269"
originalSlug: "uniapp-vue3-canvas-business-card-export"
originalStatus: "published"
publishedAt: "2026-10-02T10:01:22.438Z"
updatedAt: "2026-10-02T10:01:22.500Z"
exportedAt: "2026-10-02T10:18:25.336Z"
---
# 第 11 篇：uni-app Vue 3 Canvas 名片生成：组件作用域、多实例与图片导出

## 1. 典型问题

- 在自定义组件中通过 Canvas 2D 节点 API 获取不到上下文。
- `ctx.draw()` 回调偶发不触发。
- 导出时报 `canvas is empty`。
- Canvas 放在弹窗内，弹窗刚打开就绘制，测量宽高为零。
- 网络图片直接传给 `drawImage`，真机不显示。
- 多个组件同时渲染时，因为共用 `canvas-id` 导出错图。

## 2. 稳定方案选择

对于 uni-app + Vue 3 + 微信小程序自定义组件，优先使用兼容范围更广的旧版 Canvas API：

```javascript
const instance = getCurrentInstance()
const context = uni.createCanvasContext(canvasId, instance)
```

关键规则：

- 组件内创建上下文和导出时都传组件实例。
- `canvas-id`、DOM `id`、创建上下文和导出参数必须一致。
- ID 在组件生命周期内保持稳定；多实例时由父组件传入不同 ID。
- Canvas 必须具有非零宽高并参与渲染，不能 `display: none`。
- 网络图片先下载或通过 `getImageInfo` 转为可绘制本地路径。
- 绘制完成后再导出，回调不可靠时增加超时兜底，而不是无条件等待很久。

## 3. 可复用组件

```vue
<template>
  <view class="poster-generator">
    <canvas
      :id="canvasId"
      :canvas-id="canvasId"
      class="poster-generator__canvas"
      :style="canvasStyle"
    />

    <image
      v-if="previewPath"
      class="poster-generator__preview"
      :src="previewPath"
      mode="widthFix"
    />
  </view>
</template>

<script setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  ref
} from 'vue'

const props = defineProps({
  canvasId: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 600
  },
  height: {
    type: Number,
    default: 800
  }
})

const emit = defineEmits(['success', 'error'])
const instance = getCurrentInstance()
const previewPath = ref('')
const exporting = ref(false)
let fallbackTimer = null

const canvasStyle = computed(
  () => `width:${props.width}px;height:${props.height}px;`
)

function clearFallbackTimer() {
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
    fallbackTimer = null
  }
}

function waitForRender() {
  return new Promise((resolve) => {
    nextTick(() => {
      setTimeout(resolve, 50)
    })
  })
}

function drawAndWait(context, reserve = false) {
  return new Promise((resolve) => {
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      clearFallbackTimer()
      resolve()
    }

    context.draw(reserve, finish)
    fallbackTimer = setTimeout(finish, 350)
  })
}

function exportCanvas(options = {}) {
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath(
      {
        canvasId: props.canvasId,
        x: 0,
        y: 0,
        width: props.width,
        height: props.height,
        destWidth: props.width * 2,
        destHeight: props.height * 2,
        fileType: 'png',
        quality: 1,
        ...options,
        success: resolve,
        fail: reject
      },
      instance
    )
  })
}

async function generate(data) {
  if (exporting.value) return previewPath.value
  exporting.value = true

  try {
    await waitForRender()

    const avatarPath = data.avatarUrl
      ? await resolveDrawableImage(data.avatarUrl)
      : ''

    const context = uni.createCanvasContext(props.canvasId, instance)
    drawPoster(context, {
      ...data,
      avatarPath,
      width: props.width,
      height: props.height
    })

    await drawAndWait(context)
    const result = await exportCanvas()
    previewPath.value = result.tempFilePath
    emit('success', result.tempFilePath)
    return result.tempFilePath
  } catch (error) {
    console.error('[Canvas] 生成图片失败', error)
    emit('error', error)
    throw error
  } finally {
    exporting.value = false
  }
}

onBeforeUnmount(clearFallbackTimer)

defineExpose({ generate, exportCanvas })
</script>

<style scoped lang="scss">
.poster-generator__canvas {
  position: fixed;
  top: 0;
  left: -10000px;
  pointer-events: none;
}

.poster-generator__preview {
  display: block;
  width: 100%;
}
</style>
```

父组件必须保证每个实例 ID 唯一：

```vue
<PosterGenerator ref="generator" canvas-id="profile-poster-main" />
```

不要在每次生成时使用 `Date.now()` 改 ID。ID 变化会让模板、上下文和导出调用在同一轮任务中不一致。需要多实例时，在组件创建时确定唯一值并保持不变。

## 4. 绘制函数

```javascript
function drawPoster(context, data) {
  const { width, height, name = '', subtitle = '', avatarPath = '' } = data

  context.setFillStyle('#ffffff')
  context.fillRect(0, 0, width, height)

  context.setFillStyle('#2979ff')
  context.fillRect(0, 0, width, 180)

  if (avatarPath) {
    context.save()
    context.beginPath()
    context.arc(width / 2, 180, 72, 0, Math.PI * 2)
    context.clip()
    context.drawImage(avatarPath, width / 2 - 72, 108, 144, 144)
    context.restore()
  }

  context.setTextAlign('center')
  context.setTextBaseline('middle')
  context.setFillStyle('#111827')
  context.setFontSize(40)
  context.fillText(name, width / 2, 330, width - 80)

  context.setFillStyle('#6b7280')
  context.setFontSize(28)
  drawWrappedText(context, subtitle, width / 2, 390, width - 100, 42, 3)
}

function drawWrappedText(context, text, centerX, startY, maxWidth, lineHeight, maxLines) {
  const characters = Array.from(String(text || ''))
  const lines = []
  let currentLine = ''

  characters.forEach((character) => {
    const candidate = currentLine + character
    if (context.measureText(candidate).width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = character
      return
    }
    currentLine = candidate
  })

  if (currentLine) lines.push(currentLine)

  lines.slice(0, maxLines).forEach((line, index) => {
    const isTruncated = index === maxLines - 1 && lines.length > maxLines
    const output = isTruncated ? `${line.slice(0, -1)}...` : line
    context.fillText(output, centerX, startY + index * lineHeight, maxWidth)
  })
}
```

## 5. 网络图片预加载

```javascript
function resolveDrawableImage(source) {
  return new Promise((resolve, reject) => {
    if (!source) {
      resolve('')
      return
    }

    uni.getImageInfo({
      src: source,
      success: (result) => resolve(result.path || source),
      fail: (error) => {
        console.error('[Canvas] 图片加载失败', { source, error })
        reject(error)
      }
    })
  })
}
```

微信小程序网络图片还需要合法域名配置。图片跨域、临时 URL 过期或鉴权 URL 无法匿名下载时，应先通过后端或上传服务取得可访问地址。

## 6. 为什么不能完全隐藏 Canvas

以下样式可能导致宽高为零或 Canvas 不参与渲染：

```scss
.canvas {
  display: none;
  opacity: 0;
  width: 0;
  height: 0;
}
```

更稳妥的做法是保留真实宽高并移出视口。若目标平台允许 `opacity: 0`，也不要同时使用 `display: none` 或零尺寸；跨端资料中以移出视口方案为默认。

## 7. 弹窗和异步数据

Canvas 位于 `v-if` 弹窗时，执行顺序必须是：

1. 打开弹窗或让 Canvas 进入渲染树。
2. `await nextTick()`。
3. 必要时测量 Canvas 容器，确认宽高大于零。
4. 等待网络图片和字体依赖。
5. 创建上下文并绘制。
6. 等待 `draw` 完成。
7. 调用导出。

不要在设置 `show = true` 的同一同步调用栈中立即创建上下文。

## 8. 常见错误定位

### `canvas is empty`

检查 Canvas 是否已经渲染、宽高是否大于零、绘制是否执行、ID 是否一致，以及导出是否早于 `draw` 完成。

### 组件外可用，组件内失败

检查 `createCanvasContext` 和 `canvasToTempFilePath` 是否传了相同组件实例。

### 导出的图属于另一个组件

检查多个实例是否共享 `canvas-id`。每个同时存在的 Canvas 必须唯一。

### 真机不显示网络图

检查合法域名、HTTPS、鉴权、临时 URL、`getImageInfo` 返回路径和下载错误。

### 文字被截断或发虚

使用逻辑尺寸绘制，导出时将 `destWidth/destHeight` 放大两倍或按目标清晰度设置；长文本必须测量并换行。

## 9. 验证清单

- [ ] 页面直接渲染和弹窗延迟渲染都能生成。
- [ ] 连续生成两次不会叠加旧画布内容。
- [ ] 两个组件实例同时存在不会串图。
- [ ] 纯文字、远程图片、图片失败分支均验证。
- [ ] 微信开发者工具和 iOS/Android 真机均验证。
- [ ] 导出尺寸、清晰度、文字换行和圆形裁剪正确。
- [ ] 页面卸载后没有遗留定时器和异步回调报错。
