---
title: "HTTP缓存机制详解"
slug: "http-8498fced-revision-20260730"
summary: ""
category: "浏览器与网络"
tags: []
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac348"
originalSlug: "http-8498fced"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# HTTP缓存机制详解

## 一、为什么需要缓存？

### 1. 缓存的核心价值
想象你每天上班都要从家里拿一份文件到公司，有两种方式：
- **方式A（无缓存）**：每天早上回家拿文件，路上花1小时
- **方式B（有缓存）**：提前把文件复印一份放办公室，需要时直接用（只花1秒）

HTTP缓存就是"方式B"——把资源（HTML/CSS/JS/图片等）的副本存在本地，下次需要时直接用，避免重复下载。

### 2. 缓存的好处
| 受益方 | 好处 |
|-------|------|
| **用户** | 页面打开更快（几十毫秒vs几秒），节省流量 |
| **服务器** | 减少带宽消耗，降低服务器压力 |
| **开发者** | 提升性能指标，用户体验更好 |

### 3. 缓存的挑战
**核心矛盾**：缓存提升速度，但可能导致用户看到"旧版本"内容。

**场景**：
```
1. 用户访问网站，CSS文件被缓存1年
2. 第10天，你修改了CSS（改了按钮颜色）
3. 用户再次访问，浏览器直接用缓存的"旧CSS"
4. 结果：用户看到的还是旧版样式（bug！）
```

**解决方案**：合理设置缓存策略，平衡"速度"和"新鲜度"。


## 二、缓存的两大类型

```
HTTP缓存
  ├─ 强缓存（不向服务器发请求）
  │   ├─ Cache-Control: max-age=3600
  │   └─ Expires: Wed, 21 Oct 2025 07:28:00 GMT
  │
  └─ 协商缓存（询问服务器是否可用缓存）
      ├─ ETag / If-None-Match
      └─ Last-Modified / If-Modified-Since
```

### 核心区别
| 对比 | 强缓存 | 协商缓存 |
|------|--------|---------|
| **是否发请求** | ❌ 不发（直接用缓存） | ✅ 发请求（询问服务器） |
| **速度** | 最快（0ms网络耗时） | 较快（有网络耗时，但不传输内容） |
| **状态码** | 200（from disk cache） | 304 Not Modified |
| **流量消耗** | 0（不联网） | 少（只传输HTTP头，不传内容） |
| **适用场景** | 不常变的资源（如logo、库文件） | 可能变化的资源（如HTML、API数据） |


## 三、强缓存详解

### 1. Cache-Control（现代标准，优先级高）

**基础用法**：
```http
Cache-Control: max-age=3600
```
表示：资源在3600秒（1小时）内直接用缓存，不向服务器发请求。

**完整指令**：

| 指令 | 含义 | 示例 |
|------|------|------|
| **max-age=秒数** | 缓存有效期（秒） | `max-age=86400`（缓存1天） |
| **public** | 任何缓存都可存（浏览器、CDN） | `public, max-age=3600` |
| **private** | 只有浏览器可存，CDN不可存 | `private, max-age=3600` |
| **no-cache** | 不是"不缓存"！而是"协商缓存"（每次都问服务器） | `no-cache` |
| **no-store** | 真正的"不缓存"（敏感信息） | `no-store` |
| **must-revalidate** | 缓存过期后必须验证 | `max-age=3600, must-revalidate` |
| **immutable** | 资源永不变化（如CDN上的带hash的文件） | `max-age=31536000, immutable` |

**实际案例**：

```http
# 案例1：长期缓存（适合不变的资源）
# 如：app.abc123.js（文件名带hash，内容变了文件名就变）
Cache-Control: public, max-age=31536000, immutable
解释：缓存1年，所有地方都可存，且永不变化

# 案例2：协商缓存（适合可能变化的资源）
# 如：index.html（内容可能更新）
Cache-Control: no-cache
解释：每次都问服务器"资源变了吗"，没变就用缓存

# 案例3：完全不缓存（适合敏感信息）
# 如：银行账户信息、个人隐私数据
Cache-Control: no-store, no-cache, must-revalidate
解释：绝不缓存，每次都重新下载
```

### 2. Expires（旧标准，优先级低）

**格式**：
```http
Expires: Wed, 21 Oct 2025 07:28:00 GMT
```
表示：资源在这个时间点之前都可以用缓存。

**缺点**：
- 依赖客户端时间，如果用户手动改了系统时间，缓存就失效了
- 已被`Cache-Control`取代（但为了兼容老浏览器，通常两者都设置）

### 3. 强缓存的工作流程

```
用户访问 www.example.com/style.css
    ↓
浏览器检查本地缓存
    ↓
有缓存 且 未过期（在max-age时间内）
    ↓
直接用缓存（200 from disk cache）
    ↓
页面显示（0ms网络耗时）

------------------------

有缓存 但 已过期（超过max-age时间）
    ↓
进入协商缓存流程（见下文）
```

### 4. Chrome DevTools查看强缓存

打开开发者工具（F12） → Network面板：
```
Name          Status   Type      Size      Time
style.css     200      css       (disk cache)  0ms
```
- **Status**: 200（成功）
- **Size**: `(disk cache)` 或 `(memory cache)`（从缓存读取）
- **Time**: 0ms（无网络耗时）


## 四、协商缓存详解

### 1. 核心思想
强缓存过期后，不是直接重新下载，而是**先问服务器"资源变了吗？"**
- 如果没变：服务器回`304 Not Modified`，浏览器用缓存
- 如果变了：服务器回`200 OK`，并返回新资源

### 2. 两种协商方式

#### **(1) ETag / If-None-Match（基于内容）**

**第一次请求**：
```http
# 请求
GET /style.css HTTP/1.1

# 响应
HTTP/1.1 200 OK
ETag: "abc123"                    ← 服务器生成资源的"指纹"（内容的哈希值）
Cache-Control: no-cache
...
[CSS内容]
```

**第二次请求**（强缓存已过期）：
```http
# 请求（带上上次的ETag）
GET /style.css HTTP/1.1
If-None-Match: "abc123"           ← 询问：指纹还是"abc123"吗？

# 响应（资源未变化）
HTTP/1.1 304 Not Modified         ← 没变！用缓存
ETag: "abc123"
...
[无响应体，不传输内容]

# 响应（资源变化了）
HTTP/1.1 200 OK                   ← 变了！给你新的
ETag: "xyz789"                    ← 新指纹
...
[新的CSS内容]
```

**ETag生成方式**（服务器实现）：
- 基于文件内容的MD5哈希值
- 基于文件修改时间+大小
- Nginx默认：`inode-size-mtime`

**优点**：
- 精确（内容变了才认为变了）
- 适合频繁修改的文件

**缺点**：
- 服务器需要计算哈希值（消耗CPU）

#### **(2) Last-Modified / If-Modified-Since（基于时间）**

**第一次请求**：
```http
# 请求
GET /style.css HTTP/1.1

# 响应
HTTP/1.1 200 OK
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT  ← 资源最后修改时间
Cache-Control: no-cache
...
[CSS内容]
```

**第二次请求**：
```http
# 请求（带上上次的修改时间）
GET /style.css HTTP/1.1
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT  ← 询问：之后有改过吗？

# 响应（资源未变化）
HTTP/1.1 304 Not Modified         ← 没改过！用缓存

# 响应（资源变化了）
HTTP/1.1 200 OK                   ← 改过了！给你新的
Last-Modified: Wed, 21 Oct 2025 10:00:00 GMT
...
[新的CSS内容]
```

**缺点**：
- 精度只到秒（1秒内多次修改，检测不出变化）
- 文件内容没变但修改时间变了，也会重新下载（如`touch`命令）

### 3. ETag vs Last-Modified

| 对比 | ETag | Last-Modified |
|------|------|---------------|
| **判断依据** | 内容哈希值 | 修改时间 |
| **精确度** | 高（内容真的变了才算变） | 低（时间变了就算变） |
| **服务器开销** | 高（需计算哈希） | 低（直接读文件时间） |
| **优先级** | 高（ETag存在时优先用） | 低 |
| **适用场景** | 频繁变化的资源 | 不常变的资源 |

**最佳实践**：两者都设置，浏览器优先用ETag。

### 4. 协商缓存的工作流程

```
强缓存过期
    ↓
浏览器发请求（带If-None-Match或If-Modified-Since）
    ↓
服务器比对ETag/修改时间
    ↓
资源未变化 → 304 Not Modified → 用缓存
    ↓
资源变化了 → 200 OK → 下载新资源 → 更新缓存
```


## 五、缓存位置（存在哪里？）

浏览器缓存有多个存储位置，优先级从高到低：

### 1. Memory Cache（内存缓存）
- **存储位置**：浏览器进程的内存中
- **速度**：最快（几毫秒）
- **容量**：小（几十MB）
- **生命周期**：关闭标签页就清空
- **存储内容**：当前页面的资源（JS/CSS/图片）

```
Name          Status   Type      Size            Time
app.js        200      js        (memory cache)  1ms
```

### 2. Disk Cache（磁盘缓存）
- **存储位置**：硬盘
- **速度**：较快（几十毫秒）
- **容量**：大（几百MB到几GB）
- **生命周期**：持久化（关浏览器也在）
- **存储内容**：所有资源

```
Name          Status   Type      Size          Time
style.css     200      css       (disk cache)  20ms
```

### 3. Service Worker Cache
- **存储位置**：Service Worker控制的缓存空间
- **特点**：完全由开发者控制（离线应用、PWA）
- **使用**：需要手动编写Service Worker代码

```javascript
// Service Worker缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 4. Push Cache（推送缓存）
- HTTP/2的特性，服务器主动推送资源
- 了解即可，实际应用较少


## 六、实战：常见资源的缓存策略

### 1. HTML文件（入口页面）
```http
# index.html
Cache-Control: no-cache
ETag: "abc123"
```
**原因**：
- HTML是入口，经常更新（添加新功能、改文案）
- 必须每次询问服务器，确保用户看到最新版
- 用协商缓存：没变就304，节省流量

### 2. CSS/JS文件（带hash的）
```http
# app.abc123.js（文件名包含内容哈希）
Cache-Control: public, max-age=31536000, immutable
```
**原因**：
- 文件名带hash（如Webpack打包），内容变了文件名就变
- 可以永久缓存（1年），提升性能
- HTML更新时会引用新的文件名，自动失效旧缓存

**打包后的文件示例**：
```html
<!-- 旧版 index.html -->
<script src="app.abc123.js"></script>

<!-- 新版 index.html（代码改了） -->
<script src="app.xyz789.js"></script>  ← 文件名变了，浏览器会下载新文件
```

### 3. 图片/字体（不常变）
```http
# logo.png
Cache-Control: public, max-age=2592000
```
**原因**：
- Logo、字体等不常更新
- 缓存1个月（2592000秒），平衡速度和新鲜度

### 4. API数据（动态内容）
```http
# GET /api/user/profile
Cache-Control: no-store, no-cache, must-revalidate
```
**原因**：
- 用户数据实时变化（如余额、订单状态）
- 绝不缓存，每次都重新请求

### 5. 第三方库（CDN）
```html
<script src="https://cdn.jsdelivr.net/npm/vue@3.2.0/dist/vue.global.js"></script>
```
```http
Cache-Control: public, max-age=31536000, immutable
```
**原因**：
- 版本号固定（@3.2.0），内容永不变
- CDN全球分发，强缓存1年


## 七、缓存失效策略（如何更新缓存？）

### 问题场景
```
1. 用户访问网站，style.css被缓存1年
2. 第10天，你修改了CSS
3. 用户再访问，还是用旧缓存
4. 怎么让用户看到新版？
```

### 解决方案

#### **(1) 文件名hash（最推荐）**
```html
<!-- 旧版 -->
<link rel="stylesheet" href="style.abc123.css">

<!-- 新版（CSS改了，hash变了） -->
<link rel="stylesheet" href="style.xyz789.css">
```
**优点**：
- 旧文件继续缓存（老用户不受影响）
- 新文件自动下载（新用户看到新版）
- Webpack/Vite等工具自动生成hash

**Webpack配置**：
```javascript
output: {
  filename: '[name].[contenthash:8].js',  // 根据内容生成hash
  chunkFilename: '[name].[contenthash:8].chunk.js'
}
```

#### **(2) 版本号查询参数**
```html
<!-- 旧版 -->
<link rel="stylesheet" href="style.css?v=1.0">

<!-- 新版 -->
<link rel="stylesheet" href="style.css?v=1.1">
```
**缺点**：部分CDN可能忽略查询参数

#### **(3) 手动清除缓存（不推荐）**
让用户按 `Ctrl + F5` 强制刷新？  
❌ 用户体验差，不可控


## 八、常见问题与调试

### 1. 如何查看缓存？
**Chrome DevTools**：
```
F12 → Network面板
勾选 "Disable cache" 可禁用缓存（开发时用）
```

**查看缓存文件**：
```
chrome://cache/  （Chrome缓存列表）
```

### 2. 如何清除缓存？
**开发者**：
```javascript
// 清除特定资源
location.reload(true);  // 强制刷新

// Service Worker清除
caches.delete('cache-name');
```

**用户**：
```
Chrome：Ctrl + Shift + Delete → 清除浏览数据
```

### 3. 为什么改了代码，用户还是看到旧版？
**原因**：
- HTML被强缓存了（不应该！）
- CSS/JS文件名没变（应该用hash）

**解决**：
- HTML设置`Cache-Control: no-cache`
- CSS/JS用hash文件名


## 九、核心总结

### 1. 缓存类型对比
| 类型 | 发请求 | 状态码 | 速度 | 适用场景 |
|------|--------|--------|------|---------|
| **强缓存** | ❌ | 200 (from cache) | 最快 | 不常变的资源（CSS/JS/图片） |
| **协商缓存** | ✅ | 304 Not Modified | 较快 | 可能变化的资源（HTML） |
| **不缓存** | ✅ | 200 OK | 慢 | 动态数据（API） |

### 2. 缓存策略推荐
```http
# HTML（入口）
Cache-Control: no-cache

# CSS/JS（带hash）
Cache-Control: public, max-age=31536000, immutable

# 图片/字体
Cache-Control: public, max-age=2592000

# API数据
Cache-Control: no-store
```

### 3. 记忆口诀
```
强缓存不问服务器
协商缓存问一声
ETag看内容变没变
时间戳看改没改
文件名hash是王道
HTML永远要验证
```

**一句话总结**：缓存是性能优化的核心，合理设置`Cache-Control`、`ETag`等响应头，让浏览器智能决定"用缓存"还是"重新下载"，在速度和新鲜度之间找到平衡。
