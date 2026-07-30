---
title: "Fetch API 避坑指南"
slug: "fetch-api-d4229b6f"
summary: "深度梳理 Fetch API 的核心用法与常见陷阱，涵盖两层错误判断、超时控制、请求取消、通用封装等实战技巧，避免上线踩坑。"
category: "网络请求"
tags:
  - "Fetch API"
  - "网络请求"
  - "异步编程"
  - "错误处理"
  - "AbortController"
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac36a"
originalSlug: "fetch-api-d4229b6f"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# Fetch API 避坑指南

> Fetch 是浏览器原生的异步请求 API，语法简洁、基于 Promise，但有几个"反直觉"的坑，不踩一次很难记住。这篇笔记专门整理这些坑和对应的解法。

---

## 一、核心特点速览

- 默认请求方式为 GET，无需额外配置
- 基于 Promise，支持 `.then()` 链式调用和 `async/await`（推荐后者）
- **不自动处理 HTTP 错误状态码**（404、500 不会进 catch，这是最大的坑）
- 响应数据需通过专门方法解析（`json()`、`text()` 等）
- 原生不支持超时，需借助 `AbortController` 实现

---

## 二、核心语法

### 基础 GET 请求

```javascript
async function fetchData() {
  try {
    const response = await fetch('请求URL')
    // fetch 返回 Promise<Response>，await 后得到 Response 对象
    // 注意：此时只是"收到了响应头"，响应体还没解析

    // ⚠️ 第一层：HTTP 层面判断（必须写！）
    // fetch 只有网络断开才会 reject，404/500 不会自动报错
    if (!response.ok) {
      // response.ok 为 false 表示状态码不在 200~299 之间
      throw new Error(`请求失败，状态码：${response.status}`)
    }

    // 解析响应体为 JSON（返回 Promise，需要再次 await）
    const data = await response.json()

    // ⚠️ 第二层：业务层面判断（根据项目约定，不是所有项目都有 code 字段）
    // 示例约定：code === 0 表示业务成功
    if (data.code !== 0) {
      throw new Error(data.msg || '业务请求失败')
    }

    console.log('请求成功：', data)
  } catch (error) {
    // 统一捕获：网络错误 + HTTP 错误 + 业务错误 + JSON 解析错误
    console.error('请求出错：', error.message)
  }
}
```

### POST 请求

```javascript
async function postData() {
  try {
    const response = await fetch('请求URL', {
      method: 'POST',                          // 指定请求方法
      headers: {
        'Content-Type': 'application/json'     // 告诉后端请求体是 JSON 格式
      },
      body: JSON.stringify({                   // 请求体必须序列化为字符串
        username: 'test',
        password: '123456'
      })
    })

    // 同样需要两层判断，和 GET 一致
    if (!response.ok) {
      throw new Error(`请求失败，状态码：${response.status}`)
    }

    const data = await response.json()

    if (data.code !== 0) {
      throw new Error(data.msg || '业务请求失败')
    }

    console.log('提交成功：', data)
  } catch (error) {
    console.error('提交出错：', error.message)
  }
}
```

---

## 三、关键概念解析

### 3.1 response.ok 与 response.status 的区别

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `response.ok` | 布尔值 | 状态码在 200~299 之间为 `true`，否则为 `false` |
| `response.status` | 数字 | 真实的 HTTP 状态码，无论成功失败都能获取 |

**核心坑**：Fetch 只在**网络断开**时才自动进入 `catch`，404、500 等 HTTP 错误不会自动报错，必须通过 `response.ok` 手动判断并抛出错误。

### 3.2 HTTP 状态码 vs 业务 code（两套独立规则）

| 类型 | 定义主体 | 作用 | 示例 |
| --- | --- | --- | --- |
| HTTP 状态码 | HTTP 官方协议（全球统一） | 判断网络/协议层面是否正常 | 200 成功、404 接口不存在、500 服务器错误 |
| 业务 code | 项目内部约定（后端定义） | 判断业务逻辑是否正常 | code:0 成功、code:1001 密码错误 |

**现实场景**：后端可能返回「HTTP 200 + code:401（业务未登录）」，两层都要判断。

### 3.3 响应数据解析方法

根据后端返回格式选择，解析前必须确保 HTTP 层面正常：

| 方法 | 适用场景 |
| --- | --- |
| `response.json()` | JSON 格式（最常用） |
| `response.text()` | 纯文本 |
| `response.blob()` | 文件、图片等二进制数据 |
| `response.formData()` | 表单数据 |

> 注意：响应体只能被消费一次，调用 `.json()` 后不能再调用 `.text()`，否则会报错。

---

## 四、超时控制

Fetch 原生不支持超时参数，有两种实现方式。

### 方式一：AbortSignal.timeout()（推荐，现代浏览器）

Chrome 103+、Firefox 100+、Safari 16.4+ 支持，写法最简洁。

```javascript
async function fetchWithTimeout(url, ms = 5000) {
  try {
    const response = await fetch(url, {
      // AbortSignal.timeout(ms) 会在 ms 毫秒后自动触发中止信号
      // 超时后 fetch 会 reject，error.name 为 'TimeoutError'
      signal: AbortSignal.timeout(ms)
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()

  } catch (error) {
    if (error.name === 'TimeoutError') {
      // AbortSignal.timeout() 超时触发，error.name === 'TimeoutError'
      console.error('请求超时')
    } else if (error.name === 'AbortError') {
      // 外部手动调用 controller.abort() 触发，error.name === 'AbortError'
      console.error('请求被取消')
    } else {
      // 网络错误或 HTTP 错误
      console.error('请求失败：', error.message)
    }
    throw error  // 继续向上抛出，让调用方决定如何处理
  }
}
```

### 方式二：AbortController + setTimeout（兼容性更好）

适用于需要兼容旧版浏览器的场景。

```javascript
async function fetchWithTimeout(url, ms = 5000) {
  const controller = new AbortController()
  // setTimeout 到期后调用 abort()，触发请求中止
  const timer = setTimeout(() => controller.abort(), ms)

  try {
    const response = await fetch(url, {
      signal: controller.signal  // 将中止信号绑定到请求
    })
    clearTimeout(timer)  // 请求成功，清除定时器，避免误触发

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()

  } catch (error) {
    clearTimeout(timer)  // 请求失败也要清除定时器
    if (error.name === 'AbortError') {
      // 此处的 AbortError 是由超时定时器触发的，语义上是"超时"
      throw new Error('请求超时')
    }
    throw error
  }
}
```

> **两种方式的区别**：方式一超时触发的 `error.name` 是 `'TimeoutError'`，方式二是 `'AbortError'`。如果同时使用了手动取消和超时，方式一可以通过 error.name 区分两种情况，方式二无法区分。

---

## 五、主动取消请求

适用场景：用户切换页面、搜索框防抖、组件卸载时取消未完成的请求。

```javascript
// 创建 AbortController 实例，一个实例对应一个可取消的请求
const controller = new AbortController()

fetch('/api/data', {
  signal: controller.signal  // 将 signal 绑定到请求
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      // 主动取消不是真正的错误，单独处理，不要当作异常上报
      console.log('请求已取消')
    } else {
      console.error('请求失败：', err)
    }
  })

// 在需要取消的时机调用（如组件卸载、用户跳转）
controller.abort()

// ⚠️ 注意：一个 controller 只能取消一次，取消后不能复用
// 如果需要再次发请求，必须 new AbortController() 创建新实例
```

**Vue/React 组件中的典型用法：**

```javascript
// Vue 3 示例：组件卸载时自动取消请求
import { onUnmounted } from 'vue'

const controller = new AbortController()

fetch('/api/data', { signal: controller.signal })
  .then(res => res.json())
  .then(data => { /* 更新状态 */ })
  .catch(err => {
    if (err.name !== 'AbortError') console.error(err)
  })

// 组件卸载时取消，防止组件已销毁还在更新状态导致报错
onUnmounted(() => controller.abort())
```

---

## 六、通用封装（直接复制可用）

```javascript
/**
 * 通用 Fetch 封装
 * @param {string} url - 请求地址
 * @param {object} options - 请求配置（method、headers、body、signal 等）
 * @param {number} timeout - 超时时间（ms），默认 8000ms，传 0 表示不限时
 * @returns {Promise<any>} 返回业务数据（已剥离外层 code/msg 包装）
 */
async function request(url, options = {}, timeout = 8000) {
  // 合并默认配置，注意 headers 需要单独合并，避免覆盖调用方传入的自定义头
  const mergedOptions = {
    method: 'GET',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers  // 调用方的 headers 优先级更高，可覆盖默认值
    }
  }

  // 非 GET 请求且 body 是对象时，自动序列化为 JSON 字符串
  if (
    mergedOptions.method.toUpperCase() !== 'GET' &&
    mergedOptions.body &&
    typeof mergedOptions.body === 'object'
  ) {
    mergedOptions.body = JSON.stringify(mergedOptions.body)
  }

  // 超时控制：调用方没有手动传 signal 时才自动添加
  // 这样调用方可以传自己的 AbortController 来手动取消
  if (!mergedOptions.signal && timeout > 0) {
    if (typeof AbortSignal.timeout === 'function') {
      // 优先使用新 API（Chrome 103+）
      mergedOptions.signal = AbortSignal.timeout(timeout)
    } else {
      // 降级方案：兼容旧版浏览器
      const controller = new AbortController()
      setTimeout(() => controller.abort(), timeout)
      mergedOptions.signal = controller.signal
    }
  }

  try {
    const response = await fetch(url, mergedOptions)

    // 第一层：HTTP 层面判断
    if (!response.ok) {
      throw new Error(`HTTP 请求失败，状态码：${response.status}`)
    }

    const data = await response.json()

    // 第二层：业务层面判断
    // 用 data.code !== undefined 判断，避免后端不返回 code 字段时误报错
    if (data.code !== undefined && data.code !== 0) {
      throw new Error(data.msg || '业务请求失败')
    }

    return data

  } catch (error) {
    // 统一判断是否为超时/取消
    const isAborted = error.name === 'TimeoutError' || error.name === 'AbortError'
    const msg = isAborted ? '请求超时，请稍后重试' : error.message
    console.error('请求异常：', msg)
    throw new Error(msg)  // 继续抛出，让调用方的 catch 也能感知到
  }
}

// ── 调用示例 ──────────────────────────────────────────

// GET 请求
request('/api/users')
  .then(data => console.log('用户列表：', data))
  .catch(err => console.error('获取失败：', err.message))

// POST 请求（body 传对象即可，封装内部自动 JSON.stringify）
request('/api/login', {
  method: 'POST',
  body: { username: 'test', password: '123456' }
})
  .then(data => console.log('登录成功：', data))
  .catch(err => console.error('登录失败：', err.message))

// 带自定义请求头（如 Token 鉴权）
request('/api/profile', {
  headers: { 'Authorization': 'Bearer your-token-here' }
})
  .then(data => console.log('用户信息：', data))

// 手动控制取消（传入自己的 signal，封装不会再添加超时）
const controller = new AbortController()
request('/api/search', { signal: controller.signal })
  .catch(err => {
    if (err.message === '请求超时，请稍后重试') return  // 超时
    console.error(err)
  })
controller.abort()  // 需要时取消
```

---

## 七、常见疑问

**Q：不写 `if (!response.ok)` 行不行？**

能跑，但上线必踩坑。后端返回 404、502 时，响应体可能是 HTML 而非 JSON，导致 `response.json()` 解析失败直接崩溃，后续的业务 code 判断根本执行不到。

**Q：我通过业务 code 拦截错误，为什么还要判断 `response.ok`？**

能拿到 `data` 的前提是"HTTP 层面正常且返回 JSON 格式"。遇到 404 页面、跨域拦截、服务器报错时，根本拿不到正常的 `data`，此时 `response.ok` 是唯一可靠的判断依据。

**Q：Fetch 默认会带 Cookie 吗？**

不会。跨域请求默认不携带 Cookie，需要显式配置：

```javascript
fetch(url, {
  credentials: 'include'        // 跨域也携带 Cookie（需后端配合设置 CORS 头）
  // credentials: 'same-origin' // 仅同源携带，这是默认值
  // credentials: 'omit'        // 任何情况都不携带 Cookie
})
```

**Q：`response.json()` 和 `JSON.parse(text)` 有什么区别？**

本质一样，`response.json()` 等价于先调用 `response.text()` 再 `JSON.parse()`，只是更简洁。区别在于 `response.json()` 返回 Promise，需要 `await`。

---

## 八、避坑核心原则

1. **两层判断缺一不可**：先判断 HTTP 层面（`response.ok`），再判断业务层面（`data.code`）
2. **不要依赖 Fetch 自动处理 HTTP 错误**：手动判断并抛出，才能让 `catch` 捕获所有异常
3. **解析前先确认 HTTP 正常**：避免 `response.json()` 解析失败导致代码崩溃
4. **超时不能省**：生产环境必须设置超时，防止请求无限挂起
5. **AbortError 单独处理**：主动取消和超时触发的 `AbortError` 不是真正的"错误"，需区分对待
6. **headers 合并而非覆盖**：封装时注意 `headers` 要深合并，否则调用方传的自定义头会丢失
