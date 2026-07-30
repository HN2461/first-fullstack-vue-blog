---
title: "window 对象常用 API 速查"
slug: "window-api-3e74acb4-revision-20260730"
summary: "系统梳理前端开发中 window 对象最常用的 API，涵盖 location 跳转、history 路由、navigator 设备信息、postMessage 跨窗口通信、open/close 窗口控制、定时器、滚动、存储等，每个 API 配实战用法。"
category: "工具速查"
tags:
  - "window"
  - "BOM"
  - "location"
  - "history"
  - "navigator"
  - "postMessage"
  - "前端基础"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac318"
originalSlug: "window-api-3e74acb4"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# window 对象常用 API 速查

`window` 是浏览器环境的全局对象，所有挂在它上面的属性和方法都可以省略 `window.` 直接调用。本文只讲前端开发中真正高频用到的那些，每个都给实战场景。

---

## 一、window.location —— 页面地址与跳转

`location` 是最常用的子对象，管理当前页面的 URL。

### 1.1 读取 URL 信息

```js
// 假设当前地址：https://example.com:8080/path/page?id=1&tab=info#section2

location.href     // 'https://example.com:8080/path/page?id=1&tab=info#section2'  完整URL
location.origin   // 'https://example.com:8080'  协议+域名+端口
location.protocol // 'https:'
location.host     // 'example.com:8080'  域名+端口
location.hostname // 'example.com'  只有域名
location.port     // '8080'
location.pathname // '/path/page'  路径部分
location.search   // '?id=1&tab=info'  查询字符串（含?）
location.hash     // '#section2'  锚点（含#）
```

### 1.2 解析查询参数（实战）

```js
// 推荐用 URLSearchParams，不要自己手动 split
const params = new URLSearchParams(location.search)
params.get('id')    // '1'
params.get('tab')   // 'info'
params.has('id')    // true
params.getAll('tag') // 多个同名参数返回数组

// 遍历所有参数
for (const [key, value] of params) {
  console.log(key, value)
}
```

### 1.3 页面跳转

```js
// 方式1：直接赋值 href（会产生历史记录，用户可以点返回）
location.href = 'https://example.com/new-page'

// 方式2：replace（不产生历史记录，用户点返回会跳过这一步）
// 适合：OAuth 回调页、登录跳转等不希望用户返回的场景
location.replace('https://example.com/new-page')

// 方式3：assign（等同于 href 赋值，有历史记录）
location.assign('https://example.com/new-page')

// 刷新当前页面
location.reload()        // 普通刷新（可能走缓存）
location.reload(true)    // 强制从服务器重新加载（部分浏览器已废弃此参数）
```

### 1.4 只修改 hash（不刷新页面）

```js
// 修改 hash，页面不刷新，会产生历史记录
location.hash = '#section3'

// 修改 search，页面会刷新！注意区分
location.search = '?page=2'
```

---

## 二、window.history —— 浏览器历史记录

`history` 控制浏览器的前进/后退，也是 Vue Router / React Router 的底层基础。

### 2.1 前进 / 后退

```js
history.back()      // 后退一步，等同于点浏览器返回按钮
history.forward()   // 前进一步
history.go(-1)      // 后退1步
history.go(1)       // 前进1步
history.go(-3)      // 后退3步
history.go(0)       // 刷新当前页
```

### 2.2 pushState —— 修改 URL 不刷新页面（SPA 核心）

```js
// history.pushState(state对象, title, url)
// 修改地址栏 URL，不触发页面刷新，会产生历史记录
history.pushState({ page: 2 }, '', '/list?page=2')

// replaceState：同上，但不产生新历史记录（替换当前条目）
history.replaceState({ page: 2 }, '', '/list?page=2')
```

**实战场景：OAuth 回调后清理 URL 中的 code 参数**

```js
// 用户扫码回调后 URL 变成：/callback?code=xxx&state=yyy
// 处理完 code 后，用 replaceState 清掉参数，避免用户刷新重复提交
const cleanUrl = location.pathname  // '/callback'
history.replaceState(null, '', cleanUrl)
```

### 2.3 监听 popstate 事件

用户点击浏览器前进/后退时触发（pushState/replaceState 不触发）：

```js
window.addEventListener('popstate', (event) => {
  console.log('用户点了前进/后退')
  console.log('state:', event.state)  // pushState 时传入的 state 对象
  console.log('当前路径:', location.pathname)
})
```

---

## 三、window.navigator —— 浏览器与设备信息

### 3.1 常用属性

```js
navigator.userAgent    // 浏览器 UA 字符串（判断浏览器/系统类型）
navigator.language     // 用户语言，如 'zh-CN'、'en-US'
navigator.languages    // 用户语言列表，如 ['zh-CN', 'zh', 'en']
navigator.onLine       // 是否联网，true/false
navigator.cookieEnabled // 是否允许 Cookie
navigator.platform     // 操作系统平台（已逐渐废弃，不推荐依赖）
```

### 3.2 判断设备类型（实战）

```js
// 判断是否移动端
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

// 判断是否 iOS
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

// 判断是否微信内置浏览器
const isWeChat = /MicroMessenger/i.test(navigator.userAgent)

// 判断是否钉钉内置浏览器
const isDingTalk = /DingTalk/i.test(navigator.userAgent)

// 判断是否企业微信
const isWxWork = /wxwork/i.test(navigator.userAgent)
```

### 3.3 navigator.clipboard —— 剪贴板

```js
// 写入剪贴板（需要 HTTPS 或 localhost）
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('复制成功')
  } catch (err) {
    console.error('复制失败', err)
  }
}

// 读取剪贴板
async function pasteText() {
  const text = await navigator.clipboard.readText()
  console.log('剪贴板内容:', text)
}
```

### 3.4 navigator.geolocation —— 地理位置

```js
// 获取当前位置（需要用户授权）
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('纬度:', position.coords.latitude)
    console.log('经度:', position.coords.longitude)
  },
  (error) => {
    console.error('获取位置失败:', error.message)
  }
)
```

### 3.5 navigator.sendBeacon —— 页面关闭前发数据

```js
// 页面关闭/跳转时可靠地发送数据（不会被浏览器取消）
// 常用于埋点、日志上报
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/api/log', JSON.stringify({ event: 'page_leave' }))
})
```

---

## 四、window.postMessage —— 跨窗口 / 跨域通信

这是内嵌 iframe、弹出窗口、跨域页面之间通信的标准方式。

### 4.1 发送消息

```js
// 向 iframe 发消息
const iframe = document.getElementById('my-iframe')
iframe.contentWindow.postMessage({ type: 'LOGIN', data: { token: 'xxx' } }, 'https://target-domain.com')

// 向父页面发消息（在 iframe 内部调用）
window.parent.postMessage({ type: 'CLOSE_MODAL' }, 'https://parent-domain.com')

// 向打开的子窗口发消息
const popup = window.open('https://other.com')
popup.postMessage({ type: 'INIT' }, 'https://other.com')

// targetOrigin 传 '*' 表示不限制来源（不安全，生产环境不推荐）
window.parent.postMessage('hello', '*')
```

### 4.2 接收消息

```js
window.addEventListener('message', (event) => {
  // ⚠️ 必须校验来源，防止恶意页面伪造消息
  const allowedOrigins = ['https://login.dingtalk.com', 'https://open.weixin.qq.com']
  if (!allowedOrigins.includes(event.origin)) return

  console.log('消息来源:', event.origin)
  console.log('消息内容:', event.data)
  console.log('来源窗口:', event.source)  // 可以用 event.source.postMessage 回复

  // 根据消息类型处理
  if (event.data?.type === 'LOGIN_SUCCESS') {
    const { token } = event.data
    // 处理登录成功逻辑
  }
})
```

### 4.3 典型场景：iframe 内嵌扫码登录

```js
// 父页面：监听钉钉/微信 iframe 扫码结果
window.addEventListener('message', (event) => {
  if (event.origin === 'https://login.dingtalk.com') {
    const loginTmpCode = event.data  // 钉钉返回临时码
    // 用 loginTmpCode 换取正式 code
  }
  if (event.origin === 'https://open.weixin.qq.com') {
    const callbackUrl = event.data   // 微信返回完整回调 URL
    const code = new URL(callbackUrl).searchParams.get('code')
  }
})
```

---

## 五、window.open / window.close —— 窗口控制

### 5.1 打开新窗口

```js
// 基本用法
window.open('https://example.com')

// 完整参数：open(url, name, features)
const popup = window.open(
  'https://example.com',
  'popupName',           // 窗口名，相同名字会复用同一个窗口
  'width=600,height=500,left=200,top=100'
)

// 在新标签页打开（不指定 features 时默认新标签）
window.open('https://example.com', '_blank')

// 在当前窗口打开
window.open('https://example.com', '_self')
```

### 5.2 关闭窗口

```js
// 关闭当前窗口（只能关闭由 window.open 打开的窗口）
window.close()

// 关闭子窗口
popup.close()

// 检测子窗口是否已关闭
console.log(popup.closed)  // true / false
```

### 5.3 轮询检测子窗口关闭（OAuth 场景）

```js
// 打开 OAuth 授权页，等用户完成后自动处理
function openOAuthPopup(authUrl) {
  const popup = window.open(authUrl, 'oauth', 'width=500,height=600')

  const timer = setInterval(() => {
    if (popup.closed) {
      clearInterval(timer)
      // 子窗口关闭，检查登录状态
      checkLoginStatus()
    }
  }, 500)
}
```

---

## 六、window.setTimeout / setInterval —— 定时器

### 6.1 基本用法

```js
// 延迟执行一次
const timer = setTimeout(() => {
  console.log('1秒后执行')
}, 1000)

// 取消
clearTimeout(timer)

// 重复执行
const interval = setInterval(() => {
  console.log('每秒执行一次')
}, 1000)

// 取消
clearInterval(interval)
```

### 6.2 实战：防抖（debounce）

```js
// 输入框搜索，停止输入 500ms 后才发请求
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const handleSearch = debounce((keyword) => {
  fetch(`/api/search?q=${keyword}`)
}, 500)
```

### 6.3 实战：节流（throttle）

```js
// 滚动事件，每 200ms 最多执行一次
function throttle(fn, interval) {
  let last = 0
  return function(...args) {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn.apply(this, args)
    }
  }
}
```

---

## 七、window.addEventListener —— 全局事件监听

### 7.1 常用全局事件

```js
// 页面加载完成（DOM + 资源全部加载完）
window.addEventListener('load', () => {
  console.log('页面完全加载')
})

// DOM 解析完成（不等图片等资源）
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 就绪')
})

// 页面即将关闭/跳转（可以弹出确认框）
window.addEventListener('beforeunload', (event) => {
  event.preventDefault()
  event.returnValue = ''  // 触发浏览器默认的"离开页面？"提示
})

// 页面已隐藏/切换到后台
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('页面切到后台，可以暂停视频/动画')
  } else {
    console.log('页面回到前台')
  }
})

// 网络状态变化
window.addEventListener('online', () => console.log('网络已连接'))
window.addEventListener('offline', () => console.log('网络已断开'))

// 窗口大小变化
window.addEventListener('resize', () => {
  console.log('窗口宽度:', window.innerWidth)
})

// 滚动
window.addEventListener('scroll', () => {
  console.log('滚动位置:', window.scrollY)
})

// hash 变化（不含 pushState）
window.addEventListener('hashchange', () => {
  console.log('hash 变了:', location.hash)
})
```

---

## 八、window.scroll / scrollTo —— 滚动控制

```js
// 滚动到指定位置
window.scrollTo(0, 500)          // 滚动到距顶部 500px
window.scrollTo({ top: 500, behavior: 'smooth' })  // 平滑滚动

// 相对当前位置滚动
window.scrollBy(0, 100)          // 向下滚 100px
window.scrollBy({ top: 100, behavior: 'smooth' })

// 回到顶部
window.scrollTo({ top: 0, behavior: 'smooth' })

// 读取当前滚动位置
console.log(window.scrollX)  // 水平滚动距离
console.log(window.scrollY)  // 垂直滚动距离（等同于 pageYOffset）
```

---

## 九、window.localStorage / sessionStorage —— 本地存储

```js
// localStorage：持久化，关闭浏览器不丢失
localStorage.setItem('token', 'abc123')
localStorage.getItem('token')       // 'abc123'
localStorage.removeItem('token')
localStorage.clear()                // 清空所有

// 存对象要序列化
localStorage.setItem('user', JSON.stringify({ name: '张三', age: 18 }))
const user = JSON.parse(localStorage.getItem('user'))

// sessionStorage：会话级，关闭标签页就清除
sessionStorage.setItem('tempCode', 'xyz')
sessionStorage.getItem('tempCode')
```

---

## 十、window.requestAnimationFrame —— 动画帧

比 `setInterval` 更适合做动画，跟屏幕刷新率同步（通常 60fps），页面隐藏时自动暂停。

```js
let progress = 0

function animate() {
  progress += 1
  element.style.left = progress + 'px'

  if (progress < 300) {
    requestAnimationFrame(animate)  // 继续下一帧
  }
}

requestAnimationFrame(animate)  // 启动

// 取消
const rafId = requestAnimationFrame(animate)
cancelAnimationFrame(rafId)
```

---

## 十一、window.confirm / alert / prompt —— 对话框

```js
// 提示框（阻塞，不推荐在生产中用）
window.alert('操作成功')

// 确认框，返回 true/false
const ok = window.confirm('确定要删除吗？')
if (ok) { /* 执行删除 */ }

// 输入框，返回输入的字符串，取消返回 null
const name = window.prompt('请输入你的名字', '默认值')
```

---

## 十二、window.getComputedStyle —— 获取元素最终样式

```js
const el = document.getElementById('box')
const style = window.getComputedStyle(el)

console.log(style.width)        // '200px'
console.log(style.fontSize)     // '16px'
console.log(style.display)      // 'flex'
console.log(style.backgroundColor) // 'rgb(255, 0, 0)'

// 获取伪元素样式
const beforeStyle = window.getComputedStyle(el, '::before')
console.log(beforeStyle.content)
```

---

## 十三、常用属性速查表

| 属性 / 方法 | 作用 | 常见场景 |
|---|---|---|
| `window.innerWidth/Height` | 视口宽高 | 响应式判断 |
| `window.devicePixelRatio` | 设备像素比 | 高清屏适配 |
| `window.screen.width/height` | 屏幕物理分辨率 | 设备信息上报 |
| `window.location` | URL 读写与跳转 | 路由、OAuth 回调 |
| `window.history` | 历史记录控制 | SPA 路由、清理 URL |
| `window.navigator` | 浏览器/设备信息 | UA 判断、剪贴板、定位 |
| `window.postMessage` | 跨窗口通信 | iframe 扫码登录、微前端 |
| `window.open/close` | 窗口控制 | 弹出授权页 |
| `window.localStorage` | 持久化存储 | token、用户信息 |
| `window.sessionStorage` | 会话存储 | 临时状态、防 CSRF state |
| `window.setTimeout/Interval` | 定时器 | 防抖、节流、轮询 |
| `window.requestAnimationFrame` | 动画帧 | 流畅动画 |
| `window.scrollTo/By` | 滚动控制 | 回到顶部、锚点跳转 |
| `window.getComputedStyle` | 获取计算样式 | 动态读取元素尺寸 |
| `window.scrollY/X` | 当前滚动位置 | 滚动进度条 |
| `window.performance` | 性能数据 | 页面加载耗时分析 |
| `window.crypto` | 加密 API | 生成随机 UUID |

---

## 十四、几个容易忽略的实用 API

### window.crypto.randomUUID —— 生成唯一 ID

```js
// 生成 UUID（比 Math.random 更安全）
const id = crypto.randomUUID()  // 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

// 生成随机字节（用于 state 防 CSRF）
const array = new Uint8Array(16)
crypto.getRandomValues(array)
const state = Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
```

### window.performance —— 性能监控

```js
// 页面加载耗时
const timing = performance.timing
const loadTime = timing.loadEventEnd - timing.navigationStart
console.log('页面加载耗时:', loadTime, 'ms')

// 标记时间点（自定义性能埋点）
performance.mark('start')
// ... 执行某段逻辑
performance.mark('end')
performance.measure('耗时', 'start', 'end')
console.log(performance.getEntriesByName('耗时')[0].duration)
```

### window.matchMedia —— 媒体查询

```js
// JS 中判断媒体查询（比 resize 事件更精准）
const mq = window.matchMedia('(max-width: 768px)')

console.log(mq.matches)  // 当前是否匹配

// 监听变化
mq.addEventListener('change', (e) => {
  if (e.matches) {
    console.log('切换到移动端布局')
  } else {
    console.log('切换到桌面端布局')
  }
})
```
