---
title: "前端里的各种\"帧\"——Frame 全解"
slug: "frame-6e6d3264"
summary: "前端学习中会反复遇到\"帧\"这个词，但它在不同场景含义完全不同。本文系统梳理前端开发中高频出现的各种\"帧\"，包括渲染帧、关键帧、动画帧、调用栈帧、视频帧、iframe、WebSocket 数据帧等，一次搞清楚。"
category: "浏览器与网络"
tags:
  - "帧"
  - "渲染"
  - "动画"
  - "性能"
  - "JavaScript"
  - "CSS"
  - "WebSocket"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291f8a2b1c68f2cac35c"
originalSlug: "frame-6e6d3264"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 前端里的各种"帧"——Frame 全解

学前端时"帧"这个词会在很多地方冒出来，但每次含义都不一样。这篇文章把前端开发里所有叫"帧"的东西统一梳理一遍。

---

## 一、渲染帧（Render Frame）

### 是什么

浏览器每次把页面"画"到屏幕上，就完成了一帧。显示器有刷新率，60Hz 的屏幕每秒刷新 60 次，也就是每秒 60 帧（60fps）。

```
屏幕刷新率 60Hz  →  每秒 60 帧  →  每帧预算 ≈ 16.7ms
屏幕刷新率 120Hz →  每秒 120 帧 →  每帧预算 ≈ 8.3ms
```

### 帧预算（Frame Budget）

浏览器每帧能用的时间叫"帧预算"。在 60fps 下，一帧只有 16.7ms。这 16.7ms 里浏览器要完成：

```
JS 执行 → 样式计算 → 布局 → 绘制 → 合成 → 显示
```

`16.7ms` 只是理论上限，不是"你可以放心把 JS 跑满 16.7ms"。  
真实页面里，样式、布局、绘制、合成也都要占时间，所以留给业务 JS 的预算通常会更少。实战里尽量把主线程工作压在 `10ms` 以内，会更稳妥。

### 掉帧（Dropped Frame / Jank）

如果某一帧的工作超过了 16.7ms，浏览器来不及在下一次刷新前完成，就会跳过这一帧，用户看到的就是"卡顿"或"抖动"，英文叫 **jank**。

```
正常：帧1(16ms) → 帧2(16ms) → 帧3(16ms) → 流畅
掉帧：帧1(16ms) → 帧2(50ms) → 帧3(16ms) → 卡顿！
```

### 在哪里能看到

Chrome DevTools → Performance 面板录制后，顶部绿色条就是帧率，红色块表示掉帧。

---

## 二、关键帧（Keyframe）

### CSS 关键帧 `@keyframes`

CSS 动画里，你只需要定义几个"关键时间点"的状态，浏览器自动补全中间的过渡，这些关键时间点就叫关键帧。

```css
@keyframes slide-in {
  0%   { transform: translateX(-100%); opacity: 0; }
  60%  { transform: translateX(10px); }
  100% { transform: translateX(0);    opacity: 1; }
}

.box {
  animation: slide-in 0.4s ease-out;
}
```

`0%`、`60%`、`100%` 就是三个关键帧，中间的动画由浏览器插值计算。

`from` 等价于 `0%`，`to` 等价于 `100%`。

### Web Animations API 关键帧

JS 里也可以用关键帧，通过 `element.animate()` 传入关键帧数组：

```javascript
element.animate(
  [
    { transform: 'translateX(-100%)', opacity: 0 },  // 关键帧 1
    { transform: 'translateX(10px)',  offset: 0.6 }, // 关键帧 2（60% 处）
    { transform: 'translateX(0)',     opacity: 1 },  // 关键帧 3
  ],
  { duration: 400, easing: 'ease-out' }
)
```

### 视频/编解码里的关键帧（I 帧）

视频压缩里也有关键帧，叫 **I 帧（Intra-coded frame）**，是完整的图像数据。其他帧（P 帧、B 帧）只存储与关键帧的差异，依赖关键帧才能解码。前端处理视频时偶尔会遇到这个概念，但通常不需要手动干预。

---

## 三、动画帧请求（requestAnimationFrame）

### 是什么

`requestAnimationFrame`（简称 rAF）是浏览器提供的 API，让你在**下一帧渲染前**执行一段代码。

```javascript
function animate(timestamp) {
  // timestamp 是当前帧的时间戳（毫秒）
  box.style.transform = `translateX(${timestamp * 0.1 % 500}px)`
  requestAnimationFrame(animate) // 注册下一帧
}

requestAnimationFrame(animate) // 启动
```

### 和 setInterval 的区别

| 对比项 | `setInterval` | `requestAnimationFrame` |
|--------|--------------|------------------------|
| 执行时机 | 固定时间间隔，不管屏幕刷新 | 与屏幕刷新同步 |
| 后台标签页 | 通常会被浏览器节流，但不和渲染帧对齐 | 通常暂停或大幅降频，更省电 |
| 帧率适配 | 固定，120Hz 屏幕不受益 | 自动适配屏幕刷新率 |
| 动画流畅度 | 可能和刷新率错位，抖动 | 天然同步，流畅 |

### 取消动画帧

```javascript
const id = requestAnimationFrame(animate)
cancelAnimationFrame(id) // 取消
```

### 常见用途

- 手写 JS 动画（Canvas、WebGL）
- 滚动监听节流（比 scroll 事件更高效）
- 游戏循环
- 把动画更新安排到绘制前统一执行

### 一个常见误区

`requestAnimationFrame` 只是让你的回调更接近浏览器的渲染节奏，**并不会自动避免强制同步布局**。  
如果你在一帧里反复"读布局 → 改样式 → 再读布局"，照样可能触发性能问题。更稳的思路是：

1. 先集中读取布局信息
2. 再集中写入样式
3. 动画更新尽量放进同一轮 `requestAnimationFrame`

---

## 四、调用栈帧（Stack Frame / Call Frame）

### 是什么

JS 引擎执行函数时，会把函数的执行上下文压入调用栈，每一个执行上下文就叫一个**栈帧（Stack Frame）**。

```javascript
function c() { /* 执行中 */ }
function b() { c() }
function a() { b() }
a()
```

调用栈变化过程：

```
调用 a()  →  [a]
调用 b()  →  [a, b]
调用 c()  →  [a, b, c]
c 返回    →  [a, b]
b 返回    →  [a]
a 返回    →  []
```

### 在哪里能看到

Chrome DevTools → Sources 面板打断点后，右侧 **Call Stack** 面板显示的就是当前所有栈帧。

Performance 面板里的**火焰图（Flame Chart）**，每一个色块也是一个栈帧，纵向堆叠表示调用深度。

### 栈溢出（Stack Overflow）

递归没有终止条件时，栈帧不断叠加，超出引擎限制就会报错：

```javascript
function infinite() { infinite() }
infinite()
// Uncaught RangeError: Maximum call stack size exceeded
```

---

## 五、视频帧（Video Frame）

### 是什么

视频本质是连续的图像序列，每一张图像就是一帧。前端用 `<video>` 播放视频时，浏览器每次解码并显示的一张图像就是一个视频帧。

### 抓取视频帧

用 Canvas 可以把当前视频帧"截图"下来：

```javascript
const video = document.querySelector('video')
const canvas = document.createElement('canvas')
canvas.width = video.videoWidth
canvas.height = video.videoHeight

const ctx = canvas.getContext('2d')
ctx.drawImage(video, 0, 0) // 把当前帧画到 canvas

// 导出为图片
const dataURL = canvas.toDataURL('image/png')
```

### VideoFrame API（新）

现代浏览器提供了 `VideoFrame` API，可以更精细地操作视频帧，常用于 WebCodecs（视频编解码）场景：

```javascript
// 从 canvas 创建一帧
const frame = new VideoFrame(canvas, { timestamp: 0 })
frame.close() // 用完必须手动释放
```

### 帧率（FPS）

视频的帧率决定流畅度。常见值：

- 24fps：电影标准，有"电影感"
- 30fps：普通视频
- 60fps：游戏录屏、高帧率视频
- 120fps：高刷屏内容

---

## 六、iframe（内联框架）

### 是什么

`<iframe>` 是 HTML 标签，全称 **Inline Frame（内联框架）**，用于在当前页面里嵌入另一个独立的 HTML 页面。

```html
<iframe
  src="https://example.com"
  width="800"
  height="600"
  title="嵌入的页面"
></iframe>
```

### 和其他"帧"的关系

iframe 里的"frame"是"框架/窗口"的意思，和动画帧、渲染帧是完全不同的概念，只是中文都翻译成"帧"。

### 常见用途

- 嵌入第三方内容（地图、支付页面、视频播放器）
- 沙箱隔离（用 `sandbox` 属性限制权限）
- 微前端架构（子应用隔离）

### sandbox 属性

```html
<!-- 最严格的沙箱，禁止几乎所有操作 -->
<iframe src="demo.html" sandbox></iframe>

<!-- 允许脚本执行，但仍然隔离 -->
<iframe src="demo.html" sandbox="allow-scripts"></iframe>

<!-- 允许脚本 + 允许同源访问 -->
<iframe src="demo.html" sandbox="allow-scripts allow-same-origin"></iframe>
```

> `allow-scripts` 和 `allow-same-origin` 一起开时，隔离强度会明显下降。  
> 如果嵌入的是第三方页面，要特别谨慎，不要只是因为"功能能跑"就把权限一次性全放开。

### 性能注意

每个 iframe 都是独立的浏览上下文，有独立的 DOM、JS 引擎、渲染管线，开销比普通 DOM 大得多。不要滥用。

---

## 七、媒体流帧（本地采集 / WebRTC 传输场景）

### 是什么

用 `getUserMedia` 获取摄像头/麦克风时，视频流也是由连续的帧组成的。  
如果再进入 WebRTC 传输链路，双方还会继续协商分辨率、码率和帧率（如 `30fps`）。

```javascript
const stream = await navigator.mediaDevices.getUserMedia({ video: true })
const video = document.querySelector('video')
video.srcObject = stream

// 用 canvas 抓取实时帧
function captureFrame() {
  ctx.drawImage(video, 0, 0)
  requestAnimationFrame(captureFrame) // 每帧都抓
}
```

---

## 八、网络协议里的帧（WebSocket Frame）

### 是什么

在网络协议里，"帧"通常指的是一段有边界的数据单元。  
前端最常碰到的是 **WebSocket 数据帧（WebSocket Frame）**。

如果用最白话的话说：

- `WebSocket frame` 是协议层切出来的一段数据
- `WebSocket message` 是应用层通常感知到的一条完整消息
- 如果你在 WebSocket 上再跑 `STOMP`，那还会再多一层 `STOMP frame`

所以这 3 个词不能混着用：

1. `WebSocket frame`
2. `WebSocket message`
3. `STOMP frame`

### 常见类型

WebSocket 帧里最常见的是：

- 文本帧（Text Frame）
- 二进制帧（Binary Frame）
- 关闭帧（Close Frame）
- Ping / Pong 控制帧

前端日常最常直接接触的是文本帧和二进制帧，因为它们最终会承载 JSON、聊天消息、流式数据、音视频片段等业务内容。

### 为什么这个概念容易混

浏览器里的 `socket.onmessage`，通常给你的已经是一条 **完整的 WebSocket message**。  
所以很多人会下意识以为：

`message = frame`

但更严谨地说，不一定。

因为协议层可能存在：

1. 一条 message 由多个 frame 组成
2. 控制帧和数据帧穿插出现
3. WebSocket 上面还叠了 STOMP、私有协议等更高一层的"帧"

所以你在项目里看到：

- WebSocket 帧
- STOMP 帧
- AI 流式分块

不要把它们当成同一层。

### 在哪里能看到

Chrome DevTools → Network → 选中一个 `WS` 请求 → `Messages` 面板，能看到收发的消息内容。  
这里更适合观察业务消息本身；如果要精确研究协议分帧、控制帧和更底层行为，往往还要结合更底层抓包工具一起看。

### 一个前端最常见的误区

如果项目里用了 `STOMP`：

- WebSocket 只是底层通道
- STOMP 会在上面再定义自己的 frame 结构

这就是为什么很多实时通信项目里会同时出现：

1. `WebSocket`
2. `WebSocket message`
3. `STOMP frame`

它们不是重复概念，而是不同层。

---

## 九、WebGL 帧缓冲（Framebuffer）

### 是什么

WebGL 渲染时，GPU 把渲染结果先写入**帧缓冲（Framebuffer）**，再输出到屏幕。可以创建离屏帧缓冲，实现后处理效果（模糊、阴影等）。

```javascript
const gl = canvas.getContext('webgl')
const framebuffer = gl.createFramebuffer()
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
// 渲染到这个帧缓冲，而不是直接到屏幕
```

这个概念主要在 WebGL / Three.js 深度开发时才会遇到。

---

## 十、一张图总结

```
前端里的"帧"
│
├── 渲染帧（Render Frame）
│   屏幕每次刷新 = 一帧，60fps = 每帧 16.7ms
│   超时 → 掉帧 → 卡顿（jank）
│
├── 关键帧（Keyframe）
│   CSS @keyframes / Web Animations API
│   动画的"锚点"，浏览器自动补中间过渡
│
├── 动画帧请求（requestAnimationFrame）
│   在下一帧渲染前执行回调
│   比 setInterval 更流畅、更省电
│
├── 调用栈帧（Stack Frame）
│   函数调用时压栈的执行上下文
│   DevTools Call Stack / 火焰图里能看到
│
├── 视频帧（Video Frame）
│   视频的每一张图像
│   可用 canvas.drawImage(video) 抓取
│
├── iframe（内联框架）
│   嵌入独立页面的 HTML 标签
│   "frame" = 框架，和动画帧无关
│
├── 媒体流帧（Media Stream Frame）
│   摄像头/麦克风视频流的每一帧
│   可配合 rAF + canvas 实时处理
│
├── 网络协议帧（WebSocket Frame）
│   协议层切出来的数据单元
│   不能和 WebSocket message / STOMP frame 混为一谈
│
└── 帧缓冲（Framebuffer）
    WebGL 渲染目标，GPU 写入的缓冲区
    用于离屏渲染和后处理效果
```

---

## 十一、快速记忆

| 场景 | 叫什么 | 核心概念 |
|------|--------|---------|
| 屏幕刷新 | 渲染帧 | 60fps = 16.7ms/帧，超时掉帧 |
| CSS 动画 | 关键帧 | `@keyframes` 定义锚点状态 |
| JS 动画循环 | 动画帧 | `requestAnimationFrame` |
| 函数调用栈 | 栈帧 | DevTools Call Stack |
| 视频播放 | 视频帧 | canvas 可抓取当前帧 |
| 嵌入页面 | iframe | 独立浏览上下文，开销大 |
| 摄像头 / 实时音视频 | 媒体流帧 | `getUserMedia` / WebRTC |
| 实时通信协议 | WebSocket 数据帧 | 不等于 WebSocket message，也不等于 STOMP frame |
| WebGL 渲染 | 帧缓冲 | GPU 离屏渲染目标 |
