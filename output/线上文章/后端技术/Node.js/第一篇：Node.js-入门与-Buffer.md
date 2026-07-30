---
title: "第一篇：Node.js 入门与 Buffer"
slug: "node-js-node-js-buffer-52d2c595"
summary: "从前端视角深入理解 Node.js 的架构原理、事件循环机制、全局对象体系，以及 Buffer 二进制数据处理的完整用法，配合官方文档深度解析。"
category: "Node.js"
tags:
  - "Node.js"
  - "Buffer"
  - "后端开发"
  - "运行环境"
  - "全局对象"
  - "事件循环"
  - "libuv"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291e8a2b1c68f2cac1ba"
originalSlug: "node-js-node-js-buffer-52d2c595"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 第一篇：Node.js 入门与 Buffer

> 前端工程师学 Node.js，不是"换语言"，而是把 JavaScript 的能力延伸到服务器端。这篇文章会带你从架构层面真正理解 Node.js 是什么，而不只是"会用"。

---

## 一、为什么要学 Node.js

### 1.1 前端开发者的天然优势

作为前端开发者，你已经掌握了 JavaScript。Node.js 让同一门语言可以运行在服务器端，这意味着：

- **不需要学新语言**：语法、数据结构、异步模型都是熟悉的 JS
- **全栈能力**：前后端都能写，沟通成本大幅降低
- **工具链基础**：webpack、vite、eslint 这些前端工具本身就是 Node.js 程序
- **npm 生态**：世界上最大的包注册表，数百万个开源模块可以直接用

### 1.2 Node.js 能做什么

| 场景 | 说明 | 代表工具/框架 |
|------|------|--------------|
| Web API 服务器 | 搭建 RESTful / GraphQL 接口 | Express、Koa、Fastify |
| 命令行工具 | 脚手架、构建脚本 | vite、create-react-app、eslint |
| 文件处理 | 批量重命名、格式转换、日志分析 | 原生 fs 模块 |
| 实时应用 | WebSocket 聊天室、在线协作 | Socket.io |
| BFF 层 | 前端专属后端，聚合多个微服务接口 | Next.js API Routes |
| 爬虫 | 抓取网页数据 | Puppeteer、Playwright |
| 桌面应用 | 跨平台桌面软件 | Electron |
| 微服务 | 轻量级服务节点 | NestJS |

### 1.3 Node.js 不擅长什么

Node.js 是**单线程**的，主线程不适合 CPU 密集型任务：

```
❌ 不适合 Node.js 的场景：
- 大量数学计算（机器学习、图像处理）
- 视频编解码
- 大规模数据压缩

✅ 这类场景更适合：
- Go（高并发 + CPU 密集）
- Python（机器学习生态）
- Java/C++（高性能计算）
```

> **注意**：Node.js 有 `worker_threads` 模块可以开多线程处理 CPU 密集任务，但这不是它的主战场。

---

## 二、Node.js 的架构深度解析

### 2.1 核心组成

```
┌──────────────────────────────────────────────────┐
│              你写的 JavaScript 代码                │
├──────────────────────────────────────────────────┤
│              Node.js 内置模块                      │
│   fs / http / path / events / stream / crypto ... │
├──────────────────────────────────────────────────┤
│         Node.js Bindings（C++ 绑定层）              │
│   把 JS 调用转换为底层 C/C++ 函数调用               │
├────────────────────┬─────────────────────────────┤
│   V8 引擎           │   libuv                      │
│   执行 JS 代码       │   事件循环 + 异步 I/O + 线程池  │
├────────────────────┴─────────────────────────────┤
│              操作系统（Linux / macOS / Windows）    │
└──────────────────────────────────────────────────┘
```

**V8 引擎**：
- Google 开发，Chrome 和 Node.js 共用
- 把 JavaScript 编译成机器码（JIT 编译）
- 管理 JS 堆内存和垃圾回收（GC）
- 不负责 I/O，只负责执行 JS

**libuv**：
- C 语言编写的跨平台异步 I/O 库
- 实现了事件循环（Event Loop）
- 提供线程池（Thread Pool，默认 4 个线程）处理文件 I/O、DNS 查询等阻塞操作
- 在 Linux 上用 epoll，macOS 上用 kqueue，Windows 上用 IOCP 实现高效 I/O 多路复用

**Node.js Bindings**：
- 用 C++ 写的桥接层
- 让 JavaScript 能调用 libuv 和操作系统的底层功能

### 2.2 Node.js 与浏览器的区别

| 对比项 | 浏览器 | Node.js |
|--------|--------|---------|
| JS 引擎 | V8（Chrome）/ SpiderMonkey（Firefox） | V8 |
| 全局对象 | `window` / `globalThis` | `global` / `globalThis`（跨环境统一时优先认识 `globalThis`） |
| DOM/BOM | 有 | 无 |
| 文件系统 | 无（沙箱限制） | 有（`fs` 模块） |
| 模块系统 | ES Module（原生） | CommonJS（默认）+ ES Module |
| 网络 | `fetch`、`XMLHttpRequest` | `http`/`https` 模块 + 内置 `fetch`（Node 18+） |
| 用途 | 渲染页面、用户交互 | 服务器、工具、脚本 |
| 多线程 | Web Workers | `worker_threads` 模块 |

---

## 三、事件循环（Event Loop）深度解析

这是 Node.js 最核心的概念，也是面试必考题。理解了事件循环，才能真正理解 Node.js 的异步模型。

### 3.1 为什么 Node.js 是单线程却能高并发

Node.js 主线程是单线程的，但它通过**事件循环 + 异步 I/O** 实现了高并发：

```
传统多线程模型（如 Java）：
  请求1 → 线程1（等待数据库）
  请求2 → 线程2（等待文件）
  请求3 → 线程3（等待网络）
  → 线程多了，内存和上下文切换开销大

Node.js 事件循环模型：
  请求1 → 发起数据库查询（不等待，继续）
  请求2 → 发起文件读取（不等待，继续）
  请求3 → 发起网络请求（不等待，继续）
  → 数据库返回 → 执行回调
  → 文件读完 → 执行回调
  → 网络响应 → 执行回调
  → 一个线程处理了所有请求，I/O 等待期间不占用 CPU
```

### 3.2 事件循环的六个阶段

根据 Node.js 官方文档，事件循环按以下顺序循环执行：

```
   ┌───────────────────────────┐
   │           timers          │  ← setTimeout / setInterval 回调
   └─────────────┬─────────────┘
                 │
   ┌─────────────▼─────────────┐
   │     pending callbacks     │  ← 上一轮循环延迟的 I/O 回调
   └─────────────┬─────────────┘
                 │
   ┌─────────────▼─────────────┐
   │       idle, prepare       │  ← 内部使用，开发者不关心
   └─────────────┬─────────────┘
                 │
   ┌─────────────▼─────────────┐
   │           poll            │  ← 获取新的 I/O 事件，执行 I/O 回调
   └─────────────┬─────────────┘
                 │
   ┌─────────────▼─────────────┐
   │           check           │  ← setImmediate 回调
   └─────────────┬─────────────┘
                 │
   ┌─────────────▼─────────────┐
   │      close callbacks      │  ← socket.on('close') 等
   └─────────────┬─────────────┘
                 │
                 └──────────────── 回到 timers 阶段
```

**各阶段详解：**

**timers 阶段**：执行 `setTimeout` 和 `setInterval` 的回调。注意：定时器指定的是"最早执行时间"，不是精确时间，实际执行可能稍晚。

**poll 阶段**：这是最重要的阶段。
- 如果 poll 队列不为空：依次执行回调，直到队列清空或达到系统上限
- 如果 poll 队列为空：
  - 如果有 `setImmediate` 待执行：进入 check 阶段
  - 否则：等待新的 I/O 事件（阻塞），直到有定时器到期

**check 阶段**：执行 `setImmediate` 的回调。

### 3.3 微任务队列（Microtask Queue）

微任务不属于事件循环的任何阶段，而是在**每个阶段切换之前**清空：

```javascript
// 执行顺序演示
console.log('1 - 同步代码')

setTimeout(() => console.log('5 - setTimeout'), 0)

setImmediate(() => console.log('4 - setImmediate'))

Promise.resolve().then(() => console.log('3 - Promise.then'))

process.nextTick(() => console.log('2 - nextTick'))

console.log('1.5 - 同步代码结束')

// 输出顺序：
// 1 - 同步代码
// 1.5 - 同步代码结束
// 2 - nextTick          ← 微任务，最先
// 3 - Promise.then      ← 微任务，次之
// 4 - setImmediate      ← check 阶段
// 5 - setTimeout        ← timers 阶段（0ms 不保证顺序，但通常在 setImmediate 后）
```

**优先级从高到低：**

```
同步代码
  ↓
process.nextTick（nextTick 队列）
  ↓
Promise.then / queueMicrotask（微任务队列）
  ↓
setImmediate（check 阶段）
  ↓
setTimeout / setInterval（timers 阶段）
```

### 3.4 setImmediate vs setTimeout(fn, 0)

```javascript
// 在主模块中（非 I/O 回调内），顺序不确定
setTimeout(() => console.log('timeout'), 0)
setImmediate(() => console.log('immediate'))
// 可能输出 timeout → immediate，也可能 immediate → timeout

// 在 I/O 回调内，setImmediate 一定先于 setTimeout
const fs = require('fs')
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0)
  setImmediate(() => console.log('immediate'))
  // 一定输出：immediate → timeout
})
```

**原因**：在 I/O 回调中，当前处于 poll 阶段，poll 阶段结束后直接进入 check 阶段（setImmediate），然后才回到 timers 阶段（setTimeout）。

### 3.5 process.nextTick 的特殊性

`process.nextTick` 不属于事件循环的任何阶段，它在**当前操作完成后、事件循环继续之前**立即执行：

```javascript
// 实际应用：确保回调异步执行
function readData(callback) {
  // 如果直接调用 callback()，它会同步执行
  // 用 nextTick 确保它在当前调用栈清空后执行
  process.nextTick(callback, null, '数据')
}

readData((err, data) => {
  console.log(data) // '数据'
})
console.log('这行先执行')
// 输出：这行先执行 → 数据
```

> **警告**：递归调用 `process.nextTick` 会"饿死"事件循环，导致 I/O 永远无法执行。官方建议优先使用 `setImmediate`。

---

## 四、安装与运行

### 4.1 安装 Node.js

推荐通过 **nvm**（Node Version Manager）安装，方便后续切换版本。

> **版本建议（按 2026-06-05 官方发布线核对）**：
> 当前学习和做新项目，优先安装 **Node.js 24 LTS（Active LTS）**。Node.js 26 是 Current / Latest 线，适合体验新能力，但不建议作为默认生产基线；Node.js 20 已经 EOL，不再建议用于新项目。旧课件如果使用 Node 14/16/18/20，请只把它当成历史环境参考，实际写法以当前 LTS 文档为准。

```bash
# Windows 用 nvm-windows
# 下载地址：https://github.com/coreybutler/nvm-windows/releases

# 安装后，安装 LTS 版本
nvm install 24
nvm use 24

# 验证安装
node -v    # v24.x.x
npm -v     # v11.x.x（随 Node 24 安装的 npm 小版本会继续更新）
```

也可以直接去 [nodejs.org](https://nodejs.org) 下载安装包，选 **LTS（长期支持版）**。

### 4.2 第一个 Node.js 程序

新建 `hello.js`：

```javascript
// hello.js
console.log('Hello, Node.js!')
console.log('当前 Node 版本:', process.version)
console.log('当前目录:', __dirname)
console.log('当前文件:', __filename)
console.log('操作系统:', process.platform)  // win32 / darwin / linux
```

在终端运行：

```bash
node hello.js
# Hello, Node.js!
# 当前 Node 版本: v24.x.x
# 当前目录: C:\Users\xxx\projects
# 当前文件: C:\Users\xxx\projects\hello.js
# 操作系统: win32
```

**REPL 交互模式**（Read-Eval-Print Loop）：

```bash
# 直接输入 node 进入交互模式
node
> 1 + 1
2
> const arr = [1, 2, 3]
> arr.map(x => x * 2)
[ 2, 4, 6 ]
> .exit  # 退出
```

### 4.3 编码注意事项

Node.js 默认使用 **UTF-8** 编码，但有几个坑要注意：

```javascript
// 读取文件时指定编码，否则返回 Buffer
const fs = require('fs')

// ❌ 不指定编码，返回 Buffer 对象
const data1 = fs.readFileSync('file.txt')
console.log(data1) // <Buffer e4 b8 ad e6 96 87>

// ✅ 指定 utf8，返回字符串
const data2 = fs.readFileSync('file.txt', 'utf8')
console.log(data2) // 中文内容

// Windows 下注意 BOM 问题
// 如果文件开头有 BOM（\ufeff），需要手动去除
const content = data2.replace(/^\ufeff/, '')
```

---

## 五、全局对象深度解析

Node.js 中没有 `window`，全局对象是 `global`（Node 21+ 也可以用 `globalThis`）。

### 5.1 常用全局变量

```javascript
// __dirname：当前文件所在目录的绝对路径（CommonJS 专有）
console.log(__dirname)
// Windows: C:\Users\xxx\projects\my-app
// Linux/Mac: /Users/xxx/projects/my-app

// __filename：当前文件的绝对路径（含文件名）
console.log(__filename)
// C:\Users\xxx\projects\my-app\index.js

// 注意：在 ES Module（.mjs 或 "type":"module"）中没有 __dirname 和 __filename
// 需要手动实现：
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

### 5.2 process 对象详解

`process` 是 Node.js 中最重要的全局对象，提供了当前进程的信息和控制能力：

```javascript
// ── 版本与环境信息 ──
console.log(process.version)      // 'v20.11.0'
console.log(process.versions)     // { node: '20.11.0', v8: '11.3.244.8', ... }
console.log(process.platform)     // 'win32' / 'darwin' / 'linux'
console.log(process.arch)         // 'x64' / 'arm64'
console.log(process.pid)          // 进程 ID，如 12345
console.log(process.ppid)         // 父进程 ID
console.log(process.cwd())        // 当前工作目录（运行 node 命令的目录）
console.log(process.execPath)     // node 可执行文件路径

// ── 环境变量 ──
console.log(process.env.NODE_ENV)  // 'development' / 'production'
console.log(process.env.PATH)      // 系统 PATH 变量
// 设置环境变量（只影响当前进程）
process.env.MY_VAR = 'hello'

// ── 命令行参数 ──
// 运行：node script.js --port 3000 --env production
console.log(process.argv)
// [
//   'C:\\Program Files\\nodejs\\node.exe',  // argv[0]: node 路径
//   'C:\\projects\\script.js',              // argv[1]: 脚本路径
//   '--port',                               // argv[2]: 第一个参数
//   '3000',
//   '--env',
//   'production'
// ]

// 解析命令行参数
const args = process.argv.slice(2)
// ['--port', '3000', '--env', 'production']

// 简单解析
const params = {}
for (let i = 0; i < args.length; i += 2) {
  params[args[i].replace('--', '')] = args[i + 1]
}
// { port: '3000', env: 'production' }

// ── 标准输入输出 ──
process.stdout.write('Hello\n')  // 标准输出（不换行）
process.stderr.write('Error\n')  // 标准错误输出

// ── 进程控制 ──
process.exit(0)   // 正常退出（0 = 成功）
process.exit(1)   // 异常退出（非 0 = 失败）

// 监听进程退出
process.on('exit', (code) => {
  console.log(`进程退出，退出码: ${code}`)
  // 注意：这里只能执行同步代码
})

// 监听未捕获的异常（防止进程崩溃）
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err)
  process.exit(1)  // 建议退出，因为进程状态可能不稳定
})

// 监听未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
})

// ── 内存使用 ──
const memUsage = process.memoryUsage()
console.log(memUsage)
// {
//   rss: 30932992,        // 常驻内存（Resident Set Size）
//   heapTotal: 6537216,   // V8 堆总大小
//   heapUsed: 4512456,    // V8 堆已使用
//   external: 1234567,    // C++ 对象占用（如 Buffer）
//   arrayBuffers: 9898    // ArrayBuffer 占用
// }

// ── CPU 使用 ──
const cpuUsage = process.cpuUsage()
// { user: 38579, system: 6986 }（微秒）
```

### 5.3 定时器深度解析

```javascript
// ── setTimeout：延迟执行 ──
const timer = setTimeout(() => {
  console.log('1秒后执行')
}, 1000)

// 取消定时器
clearTimeout(timer)

// ── setInterval：循环执行 ──
let count = 0
const interval = setInterval(() => {
  count++
  console.log(`第 ${count} 次执行`)
  if (count >= 5) clearInterval(interval)
}, 500)

// ── setImmediate：I/O 回调后立即执行 ──
// 在 poll 阶段结束后、timers 阶段之前执行
setImmediate(() => {
  console.log('setImmediate 执行')
})

// ── process.nextTick：当前操作完成后立即执行 ──
// 优先级高于所有其他异步操作
process.nextTick(() => {
  console.log('nextTick 执行')
})

// ── queueMicrotask：标准微任务（Node 11+）──
queueMicrotask(() => {
  console.log('微任务执行')
})

// 完整执行顺序示例：
console.log('A')
setTimeout(() => console.log('E - setTimeout'), 0)
setImmediate(() => console.log('D - setImmediate'))
Promise.resolve().then(() => console.log('C - Promise'))
process.nextTick(() => console.log('B - nextTick'))
console.log('A2')
// 输出：A → A2 → B → C → D → E
```

---

## 六、Buffer：二进制数据处理完全指南

### 6.1 为什么需要 Buffer

JavaScript 最初设计用于处理文本（字符串），但服务器端经常需要处理：

- 文件读写（图片、视频、PDF、压缩包）
- 网络数据传输（TCP 数据包、HTTP 请求体）
- 加密解密（二进制密钥、哈希值）
- 音视频流处理

这些场景都是**二进制数据**，字符串搞不定，所以 Node.js 提供了 `Buffer`。

**Buffer 的本质**：
- 一段**固定大小的连续内存空间**，存储在 V8 堆外（C++ 层）
- 不受 V8 垃圾回收直接管理，处理大数据时更高效
- 每个元素是一个 0-255 的整数（一个字节）
- 类似于 `Uint8Array`，实际上 Node.js 10+ 的 Buffer 就是 `Uint8Array` 的子类

### 6.2 创建 Buffer

> ⚠️ **废弃警告**：旧写法 `new Buffer(size)` / `new Buffer(string)` 很早就已废弃，现代 Node.js 会继续保留兼容但会给出运行时弃用提示。原因是它存在内存安全风险（未初始化内存可能泄露敏感数据）。请统一使用下面三个静态方法替代。

```javascript
// ── 方式一：Buffer.alloc(size[, fill[, encoding]]) ──
// 作用：创建一个指定字节长度的 Buffer，内存全部初始化为 0（或指定填充值）。
// 参数：
//   size: number — Buffer 的字节长度
//   fill: string | Buffer | Uint8Array | number — 填充值（默认 0）
//   encoding: string — fill 为字符串时的编码（默认 'utf8'）
// 特点：安全，内存清零，适合存储敏感数据或需要确定初始值的场景。
const buf1 = Buffer.alloc(10)
console.log(buf1)
// <Buffer 00 00 00 00 00 00 00 00 00 00>

// 指定填充值
const buf1b = Buffer.alloc(5, 0xff)
console.log(buf1b)
// <Buffer ff ff ff ff ff>

const buf1c = Buffer.alloc(6, 'ab', 'utf8')
console.log(buf1c.toString())
// 'ababab'（循环填充）

// ── 方式二：Buffer.allocUnsafe(size) ──
// 作用：创建指定字节长度的 Buffer，但不初始化内存（内容不确定，可能含旧数据）。
// 参数：
//   size: number — Buffer 的字节长度
// 特点：比 alloc 快约 2-3 倍（省去清零操作），但内容随机。
//       只在"创建后立即全部写入"的场景使用，不要用于存储敏感信息。
const buf2 = Buffer.allocUnsafe(10)
// 内容不确定，可能是之前内存中的数据！

// ── 方式三：Buffer.from(string[, encoding]) ──
// 作用：把字符串按指定编码转成二进制 Buffer。
// 参数：
//   string: string — 要转换的字符串
//   encoding: string — 字符编码（默认 'utf8'，支持 'hex'、'base64'、'latin1' 等）
// 特点：复制数据，新 Buffer 与原字符串互不影响。
const buf3 = Buffer.from('Hello', 'utf8')
console.log(buf3)
// <Buffer 48 65 6c 6c 6f>

const buf3b = Buffer.from('你好', 'utf8')
console.log(buf3b)
// <Buffer e4 bd a0 e5 a5 bd>
// 中文 UTF-8 编码，每个汉字 3 字节

// ── 方式四：Buffer.from(array) ──
// 作用：从字节数组（每个元素为 0-255 的整数）创建 Buffer。
// 参数：
//   array: number[] — 字节值数组，超出 0-255 的值会被截断取低 8 位
// 特点：复制数据。
const buf4 = Buffer.from([72, 101, 108, 108, 111])
console.log(buf4.toString())
// 'Hello'

// ── 方式五：Buffer.from(buffer) ──
// 作用：复制一个已有的 Buffer，生成内容相同但内存独立的新 Buffer（深拷贝）。
// 参数：
//   buffer: Buffer | Uint8Array — 要复制的源 Buffer
// 特点：修改新 Buffer 不影响原 Buffer，反之亦然。
const original = Buffer.from('Hello')
const copy = Buffer.from(original)
copy[0] = 0x68  // 修改 copy 不影响 original
console.log(original.toString())  // 'Hello'
console.log(copy.toString())      // 'hello'

// ── 方式六：Buffer.from(arrayBuffer[, byteOffset[, length]]) ──
// 作用：基于 ArrayBuffer 创建 Buffer，两者共享同一块内存（不复制）。
// 参数：
//   arrayBuffer: ArrayBuffer | SharedArrayBuffer — 底层内存
//   byteOffset: number — 从第几个字节开始（默认 0）
//   length: number — 取多少字节（默认到末尾）
// 特点：修改 Buffer 会同步影响原 ArrayBuffer，反之亦然，适合与 WebAssembly 等互操作。
const ab = new ArrayBuffer(8)
const buf5 = Buffer.from(ab, 0, 4)  // 只取前 4 字节
```

> **alloc vs allocUnsafe 性能对比**：
> `allocUnsafe` 比 `alloc` 快约 2-3 倍，因为省去了内存清零操作。
> 但如果 Buffer 内容会被读取（而不是立即覆盖），必须用 `alloc` 避免信息泄露。

### 6.3 Buffer 与字符串互转

#### buf.toString([encoding[, start[, end]]])

**作用**：把 Buffer 的二进制数据按指定编码解码成字符串。这是 Buffer 最常用的方法之一。

**参数**：
- `encoding`：字符编码，决定如何把字节解读成字符（默认 `'utf8'`）
- `start`：从第几个字节开始解码（默认 `0`）
- `end`：解码到第几个字节（不含，默认 `buf.length`）

**返回值**：`string`

```javascript
const buf = Buffer.from('你好，Node.js', 'utf8')
console.log(buf.length)   // 16（字节数）
console.log(buf.toString())           // '你好，Node.js'（默认 utf8）
console.log(buf.toString('utf8'))     // '你好，Node.js'（同上）

// start / end 参数：只解码一部分字节
const buf2 = Buffer.from('Hello World', 'utf8')
console.log(buf2.toString('utf8', 0, 5))   // 'Hello'（第 0-4 字节）
console.log(buf2.toString('utf8', 6, 11))  // 'World'（第 6-10 字节）
```

**注意**：`start` / `end` 是**字节**偏移，不是字符偏移。中文等多字节字符如果截断位置不对，会出现乱码：

```javascript
const buf3 = Buffer.from('你好', 'utf8')
// '你' 占 3 字节（e4 bd a0），'好' 占 3 字节（e5 a5 bd）
console.log(buf3.toString('utf8', 0, 3))  // '你'（完整的 3 字节）
console.log(buf3.toString('utf8', 0, 2))  // '??'（截断了，乱码！）
```

---

**各编码的用途和效果对比**：

| 编码 | 说明 | 典型场景 |
|------|------|----------|
| `'utf8'`（默认） | 支持全部 Unicode，变长 1-4 字节/字符 | 文本文件、JSON、HTML |
| `'ascii'` | 只支持 0-127，超出截断低 7 位 | 纯英文协议头 |
| `'latin1'` / `'binary'` | 单字节，0-255 直接映射 | 二进制数据透传 |
| `'base64'` | 每 3 字节编码为 4 个可打印字符 | 图片/文件嵌入 HTML、JSON |
| `'base64url'` | 同 base64，但用 `-_` 替换 `+/`，无 `=` 填充 | URL 参数、JWT |
| `'hex'` | 每字节编码为 2 位十六进制字符 | 调试、哈希值展示 |
| `'ucs2'` / `'utf16le'` | UTF-16 小端序，每字符 2 字节 | Windows 文件、某些协议 |

```javascript
const buf = Buffer.from('Hi!')

// utf8（默认）
console.log(buf.toString())          // 'Hi!'

// hex：每字节变成两位十六进制，常用于调试
console.log(buf.toString('hex'))     // '486921'
// 48=H, 69=i, 21=!

// base64：3字节 → 4个字符，常用于图片传输
console.log(buf.toString('base64'))  // 'SGkh'

// base64url：URL 安全版，不含 + / =
console.log(buf.toString('base64url'))  // 'SGkh'（本例无差异，含特殊字符时才不同）

// ascii：只取低 7 位
console.log(buf.toString('ascii'))   // 'Hi!'

// latin1：0-255 直接映射
console.log(buf.toString('latin1'))  // 'Hi!'
```

**实际场景示例**：

```javascript
const fs = require('fs')

// 场景一：读取文本文件
const textBuf = fs.readFileSync('./readme.txt')
const text = textBuf.toString('utf8')          // ✅ 正确读取中文

// 场景二：图片转 base64 给前端用
const imgBuf = fs.readFileSync('./photo.jpg')
const dataUrl = `data:image/jpeg;base64,${imgBuf.toString('base64')}`
// 直接赋值给 <img src="...">

// 场景三：查看文件头魔数（调试用）
const fileBuf = fs.readFileSync('./unknown.bin')
console.log(fileBuf.subarray(0, 4).toString('hex'))
// 'ffd8ffe0' → JPEG
// '89504e47' → PNG
// '25504446' → PDF

// 场景四：哈希值展示
const crypto = require('crypto')
const hash = crypto.createHash('sha256').update('hello').digest()
console.log(hash.toString('hex'))
// '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'

// 场景五：从 base64 字符串还原 Buffer
const b64 = 'SGVsbG8='
const restored = Buffer.from(b64, 'base64')
console.log(restored.toString('utf8'))  // 'Hello'
```

### 6.4 Buffer 的常用操作

```javascript
const buf = Buffer.from('Hello World', 'utf8')

// ── 长度（字节数）──
console.log(buf.length)  // 11

// ── 访问和修改单个字节 ──
console.log(buf[0])           // 72（'H' 的 ASCII 码）
console.log(buf[0].toString(16))  // '48'（十六进制）
buf[0] = 0x68  // 修改为 'h'
console.log(buf.toString())   // 'hello World'

// ── 截取（subarray / slice）──
// ⚠️ 兼容提醒：buf.slice() 仍可运行，但它在 Buffer 上返回共享内存视图
// 新代码优先用 subarray() 表达“视图截取”，需要复制时用 Buffer.from()
// 注意：返回的是原 Buffer 的视图，共享内存！
const view = buf.subarray(0, 5)   // ✅ 推荐
// const view = buf.slice(0, 5)   // 可运行，但新代码更推荐 subarray，语义更清晰
console.log(view.toString())  // 'hello'
view[0] = 0x48  // 修改 view 会影响 buf！
console.log(buf.toString())   // 'Hello World'（被改回来了）

// 如果不想共享内存，用 Buffer.from() 复制
const independent = Buffer.from(buf.subarray(0, 5))

// ── 复制 ──
// buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])
const target = Buffer.alloc(5)
buf.copy(target, 0, 0, 5)
console.log(target.toString())  // 'Hello'

// ── 合并多个 Buffer ──
const buf1 = Buffer.from('Hello ')
const buf2 = Buffer.from('World')
const merged = Buffer.concat([buf1, buf2])
console.log(merged.toString())  // 'Hello World'

// 指定总长度（性能优化）
const merged2 = Buffer.concat([buf1, buf2], buf1.length + buf2.length)

// ── 比较 ──
const a = Buffer.from('abc')
const b = Buffer.from('abc')
const c = Buffer.from('abd')

console.log(a.equals(b))    // true（内容相同）
console.log(a.equals(c))    // false
console.log(Buffer.compare(a, c))  // -1（a < c）

// ── 查找 ──
const buf3 = Buffer.from('Hello World Hello')
console.log(buf3.indexOf('Hello'))     // 0
console.log(buf3.lastIndexOf('Hello')) // 12
console.log(buf3.includes('World'))    // true

// ── 填充 ──
const buf4 = Buffer.alloc(10)
buf4.fill(0xAB)
console.log(buf4)  // <Buffer ab ab ab ab ab ab ab ab ab ab>

buf4.fill(0, 5)  // 从索引 5 开始填充 0
console.log(buf4)  // <Buffer ab ab ab ab ab 00 00 00 00 00>

// ── 读写数值（处理二进制协议时常用）──
const numBuf = Buffer.alloc(8)

// 写入 32 位无符号整数（大端序）
// buf.writeUInt32BE(value, offset)
//   value: 要写入的数值（0 ~ 4294967295）
//   offset: 写入的字节偏移量（默认 0）
numBuf.writeUInt32BE(0x12345678, 0)
console.log(numBuf.subarray(0, 4))  // <Buffer 12 34 56 78>

// 写入 32 位无符号整数（小端序）
// buf.writeUInt32LE(value, offset)
numBuf.writeUInt32LE(0x12345678, 4)
console.log(numBuf.subarray(4, 8))  // <Buffer 78 56 34 12>

// 读取
// buf.readUInt32BE(offset)  offset: 读取的字节偏移量
console.log(numBuf.readUInt32BE(0).toString(16))  // '12345678'
console.log(numBuf.readUInt32LE(4).toString(16))  // '12345678'

// 其他读写方法（参数均为 offset）：
// buf.readInt8(offset) / buf.writeInt8(value, offset)
// buf.readUInt16BE(offset) / buf.writeUInt16BE(value, offset)
// buf.readInt32LE(offset) / buf.writeInt32LE(value, offset)
// buf.readFloatBE(offset) / buf.writeFloatBE(value, offset)
// buf.readDoubleBE(offset) / buf.writeDoubleBE(value, offset)
// buf.readBigInt64BE(offset) / buf.writeBigInt64BE(value, offset)（Node 10.4+）
```

### 6.5 Buffer 与文件操作

```javascript
const fs = require('fs')

// ── 读取二进制文件 ──
const imageBuffer = fs.readFileSync('./photo.jpg')
console.log(imageBuffer.length)  // 文件字节数
console.log(imageBuffer.subarray(0, 4))  // ✅ 查看文件头（魔数）
// imageBuffer.slice(0, 4) 也能运行，但新代码优先用 subarray 表达共享视图
// JPEG: <Buffer ff d8 ff e0>
// PNG:  <Buffer 89 50 4e 47>
// PDF:  <Buffer 25 50 44 46>

// ── 写入 Buffer 到文件 ──
fs.writeFileSync('./copy.jpg', imageBuffer)

// ── 转为 base64 Data URL（前端直接用）──
const base64Image = imageBuffer.toString('base64')
const dataUrl = `data:image/jpeg;base64,${base64Image}`
// 可以直接赋值给 <img src="">

// ── 流式处理大文件（避免内存溢出）──
const chunks = []
const rs = fs.createReadStream('./large-video.mp4')
rs.on('data', chunk => chunks.push(chunk))
rs.on('end', () => {
  const fullBuffer = Buffer.concat(chunks)
  console.log('文件大小:', fullBuffer.length, 'bytes')
})
```

### 6.6 Buffer 的内存特性与性能

```javascript
// ── Buffer 存储在 V8 堆外内存 ──
// 好处：不受 V8 GC 暂停影响，处理大数据更稳定
// 坏处：需要手动管理（但 Node.js 会在 Buffer 对象被 GC 时自动释放）

// ── Buffer 大小固定 ──
const buf = Buffer.alloc(5)
// buf.length 永远是 5，不能动态扩容
// 需要动态大小时，用 Buffer.concat 合并

// ── 性能对比 ──
// 字符串拼接（慢）：
let str = ''
for (let i = 0; i < 10000; i++) str += 'x'

// Buffer 合并（快）：
const chunks = []
for (let i = 0; i < 10000; i++) chunks.push(Buffer.from('x'))
const result = Buffer.concat(chunks)

// ── Buffer 池（allocUnsafe 的优化）──
// Node.js 内部维护一个 8KB 的 Buffer 池
// 小于 4KB 的 allocUnsafe 会从池中分配，避免频繁申请内存
// 大于 4KB 的 allocUnsafe 直接申请新内存

// ── 检查是否为 Buffer ──
console.log(Buffer.isBuffer(buf))  // true
console.log(Buffer.isBuffer('hello'))  // false

// ── 检查编码是否有效 ──
console.log(Buffer.isEncoding('utf8'))    // true
console.log(Buffer.isEncoding('utf-8'))   // true
console.log(Buffer.isEncoding('gbk'))     // false（Node.js 不原生支持 GBK）
```

---

## 七、Node.js 24 LTS 时代的新能力速览

截至 2026-06-05，Node.js 官方发布线里 **24.x 是 Active LTS**，**26.x 是 Current / Latest**。学习和生产基线优先看 LTS；Current 线的新能力可以了解，但不要默认写进生产项目要求。

| 能力 | 当前状态 | 学习建议 |
|------|----------|----------|
| 全局 `fetch` | Node 18+ 可用，现代 LTS 可直接用 | 新项目可以不用 `node-fetch` |
| WebSocket 客户端 | Node 22.4+ 稳定 | 这是客户端能力；服务端仍常用 `ws`、Socket.IO 或框架封装 |
| `node:test` | 已稳定 | 小型库、脚本工具可直接用；大型前端项目仍常见 Vitest/Jest |
| `node:sqlite` | Node 24 中仍需留意官方稳定级别 | 适合学习和轻量试验；生产选型前先复查 API 稳定等级 |
| TypeScript 去类型运行 | Node 22+ 引入，Node 24 可直接体验 | 只去除类型，不等于完整 TS 编译 |

### 7.1 内置 fetch（Node 18+ 可用，Node 21+ 稳定）

```javascript
// Node 18+ 内置 fetch，无需安装 node-fetch
// 注意：await 需要放在 async 函数里，或者放在 ESM 顶层
async function main() {
  const res = await fetch('https://api.example.com/users')
  const data = await res.json()
  console.log(data)

  const res2 = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '张三' })
  })

  console.log(res2.status)
}

main().catch(console.error)
```

### 7.2 内置 WebSocket 客户端（Node 22.4+ 稳定）

```javascript
// Node 22.4+ 稳定提供全局 WebSocket（无需 ws 库）
// 注意：这是客户端 WebSocket，不是服务端
const ws = new WebSocket('ws://127.0.0.1:8080')

ws.addEventListener('open', () => {
  ws.send('Hello WebSocket!')
})

ws.addEventListener('message', (event) => {
  console.log('收到消息:', event.data)
})

ws.addEventListener('close', () => {
  console.log('连接关闭')
})
```

### 7.3 内置测试运行器（node:test，Node 18+ 稳定）

```javascript
// 无需安装 Jest/Vitest，直接用内置测试框架
// 运行：node --test test.js
import { test, describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'

// 基础测试
test('加法测试', () => {
  assert.equal(1 + 1, 2)
})

// 分组测试
describe('数学工具', () => {
  it('加法', () => {
    assert.equal(1 + 1, 2)
  })

  it('减法', () => {
    assert.equal(5 - 3, 2)
  })
})

// 异步测试
test('异步测试', async () => {
  const result = await Promise.resolve(42)
  assert.equal(result, 42)
})

// 运行所有测试文件
// node --test
// node --test --watch  （监听模式，Node 22+）
```

### 7.4 内置 SQLite（node:sqlite，生产前先核对稳定等级）

```javascript
// Node.js 已提供 node:sqlite，适合学习和轻量试验
// 注意：不同 Node 小版本的稳定等级可能继续变化，生产选型前先看官方 API 文档
// 本系列真正的数据库主线仍以 MongoDB / Mongoose 为主
import { DatabaseSync } from 'node:sqlite'

const db = new DatabaseSync(':memory:')  // 内存数据库

// 创建表
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE
  )
`)

// 插入数据
const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
insert.run('张三', 'zhangsan@example.com')

// 查询数据
const select = db.prepare('SELECT * FROM users WHERE name = ?')
const user = select.get('张三')
console.log(user)  // { id: 1, name: '张三', email: 'zhangsan@example.com' }
```

### 7.5 TypeScript 去类型支持（Node 22.6+ 引入，22.18+/23.6+ 默认开启）

```bash
# Node 22+ 可以直接运行 TypeScript 文件（去除类型注解，不做类型检查）
node --experimental-strip-types index.ts

# 当前 Node 24 LTS 可直接体验
node index.ts
```

```typescript
// index.ts
function greet(name: string): string {
  return `Hello, ${name}!`
}
console.log(greet('World'))
```

> **注意**：这只是“去除类型注解”，不是完整的 TypeScript 编译。不支持 `enum`、`namespace` 等需要转换的 TypeScript 特性。做正式项目时，仍然优先用 `tsc`、`tsx`、Vite 或框架脚手架来管理 TS。

---

## 八、小结

| 知识点 | 核心要点 |
|--------|----------|
| Node.js 定位 | 服务器端 JS 运行环境，基于 V8 + libuv |
| 架构 | V8 执行 JS，libuv 处理异步 I/O 和事件循环 |
| 事件循环阶段 | timers → pending → poll → check → close |
| 微任务优先级 | nextTick > Promise.then > setImmediate > setTimeout |
| 全局对象 | `__dirname`、`__filename`、`process`、`global` |
| process 常用 | `process.env`、`process.argv`、`process.exit()`、`process.on()` |
| Buffer 创建 | `alloc(size)`（安全清零）、`allocUnsafe(size)`（快但不清零）、`from(data)`（从数据创建） |
| Buffer 转换 | `buf.toString(encoding)` 转字符串，`Buffer.from(str, encoding)` 转 Buffer |
| Buffer 操作 | `concat(list)`（合并）、`copy(target)`（复制）、`subarray(start, end)`（视图） |
| ⚠️ 废弃/旧写法 | `new Buffer()` 不用于新代码；`buf.slice()` 可运行但新代码优先用 `buf.subarray()` 表达共享视图 |
| 当前 LTS 值得认识的新能力 | 全局 `fetch`、WebSocket 客户端、`node:test`、`node:sqlite`、TypeScript 去类型支持 |

**下一篇**预告：深入 `fs` 模块，学习文件读写的三种写法（同步/回调/Promise）、目录操作、流式处理，以及 `path` 模块的跨平台路径处理。
