---
title: "第二篇：fs 模块与 path 模块"
slug: "node-js-fs-path-e956bb19"
summary: "深入掌握 Node.js 文件系统模块（fs）的同步/异步/Promise 三种写法，以及 path 模块的跨平台路径处理，是后端开发的必备基础。"
category: "Node.js"
tags:
  - "Node.js"
  - "fs模块"
  - "path模块"
  - "文件操作"
  - "流式处理"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291e8a2b1c68f2cac1d0"
originalSlug: "node-js-fs-path-e956bb19"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 第二篇：fs 模块与 path 模块

> 服务器端开发绕不开文件操作。fs 模块是 Node.js 最常用的内置模块之一，path 模块则解决了跨平台路径拼接的痛点。

---

## 一、fs 模块概览

`fs`（File System）是 Node.js 内置的文件系统模块，提供了对文件和目录的完整操作能力。

```javascript
// 三种引入方式
const fs = require('fs')                    // 传统 CommonJS
const { promises: fsp } = require('fs')    // 解构出 Promise 版本
import { readFile, writeFile } from 'fs/promises'  // ESM（推荐）
```

fs 模块的每个操作都有**三种写法**：

| 写法 | 特点 | 适用场景 |
|------|------|----------|
| 同步（Sync） | 阻塞，等待完成再继续 | 启动时一次性读取配置 |
| 异步回调 | 非阻塞，完成后调用回调 | 兼容旧代码 |
| Promise（`fs/promises`） | 非阻塞，配合 async/await | **现代推荐写法** |

---

## 二、文件读取

### 2.1 读取文件内容

```javascript
const fs = require('fs')
const { promises: fsp } = require('fs')
const path = require('path')

// path.join(__dirname, 'data.txt') 的含义：
//   __dirname — Node.js 自动提供的变量，值是当前这个 js 文件所在目录的绝对路径
//               比如文件在 C:\projects\my-app\index.js，__dirname 就是 C:\projects\my-app
//   path.join — 把两段路径拼在一起，结果就是"当前文件所在目录 + data.txt"
//
// 为什么不直接写 './data.txt'？
//   './data.txt' 是相对路径，相对的是"你在哪个目录运行 node 命令"，不是文件本身的位置
//   如果在别的目录运行 node，路径就会找错
//   用 path.join(__dirname, ...) 不管在哪里运行都能找到正确的文件，是标准写法
const filePath = path.join(__dirname, 'data.txt')

// ── 方式一：同步读取 ──
// fs.readFileSync(path[, options])
//
// 必选参数：
//   path — 文件路径，最常用写法是字符串，如 './data.txt' 或 '/home/user/file.js'
//           也支持 Buffer / URL / FileHandle，但极少用到
//
// 可选参数 options，两种写法：
//   写法一：直接传字符串 = 指定编码（最简用法）
//     fs.readFileSync('./data.txt', 'utf8')  → 返回字符串
//   写法二：传配置对象（高级用法）
//     { encoding }  指定编码，不传则返回 Buffer（适合读图片、视频等二进制文件）
//     { flag }      文件系统标志，默认 'r'（只读），一般不需要改
//     { signal }    AbortSignal，用于中途取消文件读取，一般不需要
try {
  const content = fs.readFileSync(filePath, 'utf8')  // 最常用写法
  console.log(content)
} catch (err) {
  console.error('读取失败:', err.message)
}

// ── 方式二：异步回调（不推荐新代码使用）──
// fs.readFile(path[, options], callback)
//
// 必选参数：
//   path     — 同上，文件路径字符串
//   callback — 读取完成后调用，格式固定为 (err, data) => {}
//     err  为 null 表示成功，否则是错误对象
//     data 是读取到的内容（指定编码时为字符串，否则为 Buffer）
//
// 可选参数 options：同 readFileSync，写法一样
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('读取失败:', err.message)
    return
  }
  console.log(data)
})

// ── 方式三：Promise + async/await（推荐）──
// fsp.readFile(path[, options]) → Promise<string | Buffer>
//
// 参数和 readFileSync 完全一样，只是返回 Promise 而不是直接返回值
async function readFileExample() {
  try {
    const data = await fsp.readFile(filePath, 'utf8')
    console.log(data)
  } catch (err) {
    console.error('读取失败:', err.message)
  }
}
readFileExample()
```

### 2.2 不指定编码时返回 Buffer

```javascript
// 不传编码参数，返回 Buffer（适合读取图片、视频等二进制文件）
const buffer = fs.readFileSync('./image.png')
console.log(buffer)          // <Buffer 89 50 4e 47 ...>
console.log(buffer.length)   // 文件字节数

// 读取文本文件时，Buffer 转字符串
const text = buffer.toString('utf8')
```

---

## 三、文件写入

### 3.1 写入文件（覆盖）

```javascript
const fs = require('fs')
const { promises: fsp } = require('fs')

const content = '这是要写入的内容\n第二行'

// fs.writeFileSync(file, data[, options])
//
// 必选参数：
//   file — 文件路径字符串，如 './output.txt'
//   data — 要写入的内容，最常用是字符串；也支持 Buffer（写二进制文件时用）
//
// 可选参数 options，两种写法：
//   写法一：直接传字符串 = 指定编码（最简用法）
//     fs.writeFileSync('./output.txt', content, 'utf8')
//   写法二：传配置对象（高级用法）
//     { encoding } 字符编码，默认 'utf8'
//     { flag }     文件系统标志，默认 'w'（覆盖写入）；改成 'a' 就是追加
//     { mode }     文件权限，默认 0o666，一般不需要改
//     { flush }    写入后是否强制刷新到磁盘（Node 21.1+），默认 false
fs.writeFileSync('./output.txt', content, 'utf8')

// 异步写入（参数完全一样，多一个 callback）
fs.writeFile('./output.txt', content, 'utf8', (err) => {
  if (err) throw err
  console.log('写入成功')
})

// Promise 写入（推荐）
await fsp.writeFile('./output.txt', content, 'utf8')
```

> `writeFile` 会**覆盖**原有内容。如果文件不存在，会自动创建。

### 3.2 追加写入

```javascript
// 追加内容（不覆盖）
fs.appendFileSync('./log.txt', `[${new Date().toISOString()}] 新日志\n`)

// 异步追加
fs.appendFile('./log.txt', '追加内容\n', (err) => {
  if (err) throw err
})
```

### 3.3 写入 Buffer（二进制文件）

```javascript
// 复制图片
const imageData = fs.readFileSync('./original.jpg')
fs.writeFileSync('./copy.jpg', imageData)
// 不需要指定编码，直接写 Buffer
```

---

## 四、文件与目录信息

### 4.1 获取文件状态

```javascript
const fs = require('fs')

// fs.statSync(path[, options]) → fs.Stats
//
// 必选参数：
//   path — 文件或目录路径字符串
//
// 可选参数 options（高级用法，一般不需要）：
//   { bigint: true } — 让返回的 Stats 里的数值用 BigInt 表示（处理超大文件时用）
//
// 返回值 fs.Stats 对象，常用属性和方法：
//   .isFile()         → 是否是普通文件
//   .isDirectory()    → 是否是目录
//   .isSymbolicLink() → 是否是符号链接
//   .size             → 文件大小（字节数）
//   .mtime            → 最后修改时间（Date 对象）
//   .atime            → 最后访问时间
//   .birthtime        → 创建时间（部分系统不支持，会回退到 mtime）

const stats = fs.statSync('./data.txt')

console.log(stats.isFile())         // true — 是否为普通文件
console.log(stats.isDirectory())    // false — 是否为目录
console.log(stats.isSymbolicLink()) // false — 是否为符号链接
console.log(stats.size)             // 文件大小（字节）
console.log(stats.mtime)            // 最后修改时间（Date 对象）
console.log(stats.atime)            // 最后访问时间
console.log(stats.ctime)            // 状态变更时间
console.log(stats.birthtime)        // 创建时间（部分系统不支持）
console.log(stats.mode)             // 文件权限（八进制）
console.log(stats.nlink)            // 硬链接数量

// 异步版本（参数一样，多一个 callback）
fs.stat('./data.txt', (err, stats) => {
  if (err) {
    // 文件不存在时 err.code === 'ENOENT'
    if (err.code === 'ENOENT') {
      console.log('文件不存在')
    }
    return
  }
  console.log('文件大小:', stats.size)
})

// 检查文件是否存在（推荐方式）
// ⚠️ 废弃：fs.exists() 已废弃，不要使用
// ✅ 推荐：用 try/catch 或 fs.access()
try {
  fs.accessSync('./data.txt', fs.constants.F_OK)
  console.log('文件存在')
} catch {
  console.log('文件不存在')
}
```

### 4.2 目录操作

```javascript
const fs = require('fs')
const { promises: fsp } = require('fs')

// fs.mkdirSync(path[, options])
//
// 必选参数：
//   path — 要创建的目录路径字符串，如 './logs' 或 './a/b/c'
//
// 可选参数 options（高级用法）：
//   { recursive: true }  递归模式，最常用，建议默认加上
//     不加：只能创建单层目录，目录已存在会报错
//     加了：可以创建多级目录（a/b/c/d），目录已存在也不报错（更安全）
//   { mode: 0o755 }      目录权限，默认 0o777，一般不需要改
//
// 创建单级目录
fs.mkdirSync('./logs')

// 递归创建多级目录（推荐写法，不用担心父目录是否存在）
fs.mkdirSync('./a/b/c', { recursive: true })

// fs.readdirSync(path[, options]) → string[] | Buffer[] | fs.Dirent[]
//
// 必选参数：
//   path — 目录路径字符串
//
// 可选参数 options：
//   { withFileTypes: true }  返回 Dirent 对象（含 isFile/isDirectory 方法），推荐用法
//   { encoding: 'utf8' }     文件名编码，默认 'utf8'，一般不需要改
//   { recursive: true }      递归读取子目录（Node 20.1+），返回所有层级的文件路径
//
// 读取目录内容（返回文件名数组）
const files = fs.readdirSync('./')
console.log(files)
// ['index.js', 'package.json', 'node_modules', ...]

// 读取目录，获取详细信息（推荐写法）
const entries = fs.readdirSync('./', { withFileTypes: true })
entries.forEach(entry => {
  if (entry.isFile()) {
    console.log('文件:', entry.name)
  } else if (entry.isDirectory()) {
    console.log('目录:', entry.name)
  }
})

// 删除目录
// ⚠️ 废弃警告：fs.rmdir() 的 recursive 选项在 Node.js 16+ 已废弃
// fs.rmdirSync('./empty-dir')  // 只能删除空目录，仍可用但不推荐
// fs.rmdirSync('./logs', { recursive: true })  // ⚠️ recursive 选项已废弃

// ✅ 推荐：使用 fs.rm()（Node.js 14.14+）
// fs.rmSync(path[, options])
//
// 必选参数：
//   path — 要删除的路径（文件或目录）
//
// 可选参数 options：
//   { recursive: true }  递归删除目录及其内容（最常用）
//   { force: true }      路径不存在时不报错（推荐加上，避免删除不存在的路径时崩溃）
//   { maxRetries: 3 }    删除失败时的重试次数，默认 0（Windows 文件占用时可能需要）
//   { retryDelay: 100 }  重试间隔毫秒数，默认 100
fs.rmSync('./logs', { recursive: true, force: true })

// Promise 版本
await fsp.rm('./logs', { recursive: true, force: true })
```

### 4.3 文件重命名与删除

```javascript
// fs.renameSync(oldPath, newPath)
//
// 必选参数：
//   oldPath — 原路径（文件或目录）
//   newPath — 新路径
// 注意：跨磁盘分区移动会失败，同分区内可以用来移动文件
fs.renameSync('./old-name.txt', './new-name.txt')
fs.renameSync('./file.txt', './subdir/file.txt')  // 移动（同分区）

// fs.unlinkSync(path) — 删除文件
//
// 必选参数：
//   path — 要删除的文件路径
// 注意：只能删除文件，不能删除目录（目录用 fs.rmSync）
fs.unlinkSync('./temp.txt')

// 异步版本（多一个 callback）
fs.unlink('./temp.txt', (err) => {
  if (err) throw err
  console.log('删除成功')
})

// Promise 版本（推荐）
await fsp.unlink('./temp.txt')

// fs.copyFileSync(src, dest[, mode]) — 复制文件（Node 8.5+）
//
// 必选参数：
//   src  — 源文件路径
//   dest — 目标文件路径
//
// 可选参数 mode（复制模式（可选））：
//   fs.constants.COPYFILE_EXCL      — 如果目标文件已存在，就报错，不覆盖！
//   fs.constants.COPYFILE_FICLONE   — 尝试写时复制（CoW），失败则回退普通复制
fs.copyFileSync('./source.txt', './dest.txt')

// fs.cpSync(src, dest[, options]) — 递归复制目录（Node 16.7+）
//
// 必选参数：
//   src  — 源目录路径
//   dest — 目标目录路径
//
// 可选参数 options：
//   { recursive: true }  递归复制子目录（必须加，否则只复制顶层文件）
//   { force: false }     目标存在时是否覆盖，默认 true（覆盖）
fs.cpSync('./src-dir', './dest-dir', { recursive: true })
```

---

## 五、流式读写（Stream）

### 5.1 为什么需要流

读取大文件时，`readFile` 会把整个文件加载到内存，可能导致内存溢出：

```javascript
// ❌ 危险：读取 1GB 文件，内存直接爆
const data = fs.readFileSync('./huge-file.mp4')

// ✅ 安全：创建写入流，流式读取，每次只处理一小块
const stream = fs.createReadStream('./huge-file.mp4')
```

### 5.2 可读流（ReadStream）

```javascript
const fs = require('fs')

// fs.createReadStream(path[, options]) → fs.ReadStream
//
// 必选参数：
//   path — 文件路径字符串
//
// 可选参数 options，两种写法：
//   写法一：直接传字符串 = 指定编码（最简用法）
//     fs.createReadStream('./file.txt', 'utf8')
//   写法二：传配置对象（高级用法）
//     { encoding }       字符编码，不传则每次 data 事件收到的是 Buffer
//     { highWaterMark }  每次读取的字节数，默认 64 * 1024（64KB），调大可提升吞吐量
//     { start }          从第几个字节开始读，默认 0（文件开头）
//     { end }            读到第几个字节停止（包含该字节），默认读到文件末尾
//     { autoClose }      读完后是否自动关闭文件，默认 true，一般不需要改
//     { flags }          文件系统标志，默认 'r'，一般不需要改
const rs = fs.createReadStream('./large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024  // 每次读取 64KB
})

// 监听数据事件（进入流动模式）
rs.on('data', (chunk) => {
  console.log('收到数据块，大小:', chunk.length)
})

rs.on('end', () => {
  console.log('读取完成')
})

rs.on('error', (err) => {
  console.error('读取错误:', err.message)
})

// 只读取文件的一部分（如只读前 1024 字节）
const partialStream = fs.createReadStream('./file.bin', {
  start: 0,
  end: 1023  // 读取第 0-1023 字节（共 1024 字节）
})
```

### 5.3 可写流（WriteStream）

```javascript
//创建写入流
const ws = fs.createWriteStream('./output.txt', {
  encoding: 'utf8',
  flags: 'a'  // 'w' 覆盖（默认）/ 'a' 追加
})

ws.write('第一行内容\n')
ws.write('第二行内容\n')

// 结束写入（必须调用，否则文件不会关闭）
ws.end('最后一行\n')

ws.on('finish', () => {
  console.log('写入完成')
})
```

### 5.4 pipe：管道传输（最优雅的写法）

```javascript
// 复制文件：读取流 → 写入流
// 流式复制文件（大文件专用，不爆内存）
// 原理：读一点 → 写一点，分批处理
const rs = fs.createReadStream('./source.mp4')
const ws = fs.createWriteStream('./destination.mp4')

rs.pipe(ws)// pipe = 管道：自动把读取流接到写入流

// 监听写入完成事件
ws.on('finish', () => {
  console.log('文件复制完成')
})

// 实际应用：HTTP 响应中直接发送文件（流式传输，不占内存）
//
// 原理：
//   浏览器发来请求，Node 收到后自动构造两个对象：
//     req — 可读流（浏览器发给服务器的数据）
//     res — 可写流（服务器发给浏览器的数据）
//   把文件读取流直接 pipe 到 res，边读边发，不需要一次性把文件加载进内存
const http = require('http')
const server = http.createServer((req, res) => {
  const fileStream = fs.createReadStream('./video.mp4')
  res.setHeader('Content-Type', 'video/mp4')
  fileStream.pipe(res)  // 文件流 → 响应流，内存占用极低
})
```

---

## 六、path 模块

### 6.1 为什么需要 path 模块

路径拼接看起来简单，但有两个坑：

1. **跨平台问题**：Windows 用 `\`，Linux/Mac 用 `/`
2. **相对路径问题**：直接用字符串拼接容易出错

```javascript
// ❌ 错误写法：在 Windows 上会出问题
const filePath = __dirname + '/data/' + 'file.txt'

// ✅ 正确写法：用 path.join
const path = require('path')
const filePath = path.join(__dirname, 'data', 'file.txt')
```

### 6.2 path.join：路径拼接

```javascript
const path = require('path')

// path.join([...paths]) → string
//
// 参数：
//   ...paths — 任意多个路径片段字符串，按顺序拼接
//
// 特点：
//   自动处理路径分隔符（Windows 用 \，Linux/Mac 用 /）
//   自动处理多余的斜杠和 ..（上级目录）
//   不会把相对路径转成绝对路径（这点和 resolve 不同）

path.join('/users', 'john', 'documents')
// Linux/Mac: /users/john/documents
// Windows:   \users\john\documents

// 处理多余的斜杠
path.join('/users/', '/john/', '/file.txt')
// /users/john/file.txt

// 处理 ..（上级目录）
path.join('/users/john', '..', 'jane')
// /users/jane

// 实际使用（最常见写法）
const configPath = path.join(__dirname, 'config', 'app.json')
```

### 6.3 path.resolve：解析为绝对路径

```javascript
// path.resolve([...paths]) → string
//
// 参数：
//   ...paths — 任意多个路径片段字符串
//
// 特点：
//   从右往左处理参数，遇到绝对路径就停止，前面的参数被忽略
//   如果所有参数都是相对路径，会以当前工作目录（process.cwd()）为基础
//   结果一定是绝对路径

path.resolve('a', 'b', 'c')
// /当前工作目录/a/b/c

path.resolve('/a', 'b', 'c')
// /a/b/c

path.resolve('/a', '/b', 'c')
// /b/c（遇到 /b 这个绝对路径，前面的 /a 被忽略）

// join vs resolve 的区别
path.join('/a', '/b')    // /a/b（直接拼接，不管是否绝对路径）
path.resolve('/a', '/b') // /b（遇到绝对路径会重置）
```

> **经验法则**：拼接文件路径用 `path.join(__dirname, ...)`，解析用户输入的路径用 `path.resolve`。

### 6.4 获取路径信息

```javascript
const filePath = '/users/john/documents/report.pdf'

// path.dirname(path) — 取目录部分
// 参数：path — 路径字符串
path.dirname(filePath)   // '/users/john/documents'

// path.basename(path[, ext]) — 取文件名部分
// 必选参数：path — 路径字符串
// 可选参数：ext — 要去掉的扩展名（如 '.pdf'），传了就返回不含扩展名的文件名
path.basename(filePath)          // 'report.pdf'（含扩展名）
path.basename(filePath, '.pdf')  // 'report'（去掉扩展名）

// path.extname(path) — 取扩展名（含点号）
// 参数：path — 路径字符串
path.extname(filePath)   // '.pdf'
path.extname('index.js') // '.js'
path.extname('README')   // ''（没有扩展名返回空字符串）

// path.parse(path) — 把路径拆成对象
// 参数：path — 路径字符串
path.parse(filePath)
// {
//   root: '/',                      ← 根路径
//   dir: '/users/john/documents',   ← 目录部分（同 dirname）
//   base: 'report.pdf',             ← 文件名（同 basename）
//   ext: '.pdf',                    ← 扩展名（同 extname）
//   name: 'report'                  ← 不含扩展名的文件名
// }

// path.format(pathObject) — 把对象拼回路径字符串（parse 的逆操作）
// 参数：pathObject — 含 dir/root/base/name/ext 的对象
path.format({
  dir: '/users/john/documents',
  name: 'report',
  ext: '.pdf'
})
// '/users/john/documents/report.pdf'
```

### 6.5 其他常用方法

```javascript
// 路径分隔符（跨平台）
path.sep      // Linux/Mac: '/'  Windows: '\'

// 路径定界符（PATH 环境变量中的分隔符）
path.delimiter  // Linux/Mac: ':'  Windows: ';'

// 标准化路径（处理多余的 / 和 ..）
path.normalize('/users//john/../jane/./file.txt')
// '/users/jane/file.txt'

// 计算相对路径
path.relative('/users/john', '/users/jane/file.txt')
// '../jane/file.txt'

// 判断是否为绝对路径
path.isAbsolute('/users/john')  // true
path.isAbsolute('./relative')   // false
```

---

## 七、综合实战：递归遍历目录

```javascript
const fs = require('fs')
const path = require('path')

/**
 * 递归遍历目录，返回所有文件路径
 * @param {string} dirPath - 目录路径
 * @param {string[]} result - 结果数组
 * @returns {string[]}
 */
function walkDir(dirPath, result = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      // 跳过 node_modules
      if (entry.name === 'node_modules') continue
      walkDir(fullPath, result)
    } else if (entry.isFile()) {
      result.push(fullPath)
    }
  }

  return result
}

const allFiles = walkDir('./src')
console.log(`共找到 ${allFiles.length} 个文件`)

// 只找 .js 文件
const jsFiles = allFiles.filter(f => path.extname(f) === '.js')
console.log('JS 文件:', jsFiles)
```

---

## 八、小结

| 模块 | 核心方法 | 说明 |
|------|----------|------|
| `fs` | `readFile` / `readFileSync` | 读取文件 |
| `fs` | `writeFile` / `writeFileSync` | 写入文件（覆盖） |
| `fs` | `appendFile` | 追加写入 |
| `fs` | `stat` / `statSync` | 获取文件/目录信息 |
| `fs` | `mkdir` / `readdir` / `unlink` | 目录与文件管理 |
| `fs` | `createReadStream` / `createWriteStream` | 流式读写大文件 |
| `path` | `join` | 拼接路径（推荐日常使用） |
| `path` | `resolve` | 解析为绝对路径 |
| `path` | `dirname` / `basename` / `extname` | 提取路径各部分 |
| `path` | `normalize` | 标准化路径 |

**下一篇**预告：HTTP 协议原理 + Node.js 原生 `http` 模块，从零搭建一个 Web 服务器，理解请求与响应的完整流程。
