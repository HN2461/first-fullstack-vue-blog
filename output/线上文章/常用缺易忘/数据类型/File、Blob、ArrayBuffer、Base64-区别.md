---
title: "File、Blob、ArrayBuffer、Base64 区别"
slug: "file-blob-arraybuffer-base64-537d7c38"
summary: "一次理清 File、Blob、ArrayBuffer、Base64 各自代表什么、彼此怎么转换，以及上传、下载、预览、二进制处理时分别该优先用哪一种，避免把编码结果和数据类型混为一谈。"
category: "数据类型"
tags:
  - "File"
  - "Blob"
  - "ArrayBuffer"
  - "Base64"
  - "二进制"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291f8a2b1c68f2cac32c"
originalSlug: "file-blob-arraybuffer-base64-537d7c38"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# File、Blob、ArrayBuffer、Base64 区别

> 这几个词经常同时出现在上传、下载、预览、Canvas、音视频、接口传输里。
>
> 真正容易乱的原因只有一个：
>
> `它们不是同一类东西。`

有的是“文件对象”，有的是“二进制容器”，有的是“原始内存”，还有的只是“编码后的字符串”。

## 一、先用一句话拆开

| 名词 | 一句话理解 |
| --- | --- |
| File | 带文件名、修改时间等元信息的文件对象 |
| Blob | 一段不可变的二进制数据容器 |
| ArrayBuffer | 浏览器里的一块原始二进制内存 |
| Base64 | 把二进制转成文本字符串的一种编码方式 |

最关键的一句是：

`Base64 不是二进制对象，它只是字符串。`

## 二、它们之间的关系

### 1. File 是 Blob 的“带文件信息版本”

`File` 本质上就是更具体的 `Blob`。

它比 Blob 多了这些东西：

- `name`
- `lastModified`
- 通常来自 `<input type="file">`、拖拽上传、系统文件选择器

所以你可以把它理解成：

`File = Blob + 文件元信息`

### 2. Blob 更像“可传输、可预览的二进制包”

Blob 常见于：

- 下载接口返回文件
- 前端把文本/图片片段重新组装成文件
- `canvas.toBlob()`
- `response.blob()`

它适合做：

- 预览
- 下载
- 上传
- 交给 URL.createObjectURL 使用

### 3. ArrayBuffer 更偏底层

`ArrayBuffer` 是一整块连续的原始内存，本身不会告诉你“这是什么文件”，它只负责装字节。

真正读写它时，通常会配合：

- `Uint8Array`
- `Int16Array`
- `DataView`

它适合做：

- 解析二进制协议
- 自己按字节读写数据
- 音视频、加密、压缩、文件格式解析

### 4. Base64 是“为了文本传输而编码出来的字符串”

Base64 常见于：

- `data:image/png;base64,...`
- 某些只收文本的接口
- 图片临时内嵌

它的代价也很明确：

- 体积通常会膨胀约三分之一
- 本质上还是字符串，不适合大文件长期折腾

## 三、最实用的对照表

| 维度 | File | Blob | ArrayBuffer | Base64 |
| --- | --- | --- | --- | --- |
| 本质 | 文件对象 | 二进制容器 | 原始字节内存 | 文本字符串 |
| 是否带文件名 | 带 | 不带 | 不带 | 不带 |
| 是否适合上传 | 很适合 | 适合 | 需再包装 | 不推荐大文件 |
| 是否适合下载 | 可 | 很适合 | 需转 Blob | 不适合 |
| 是否适合字节级处理 | 一般 | 一般 | 最适合 | 不适合 |
| 是否可直接放到 JSON | 不能直接 | 不能直接 | 不能直接 | 可以，但体积变大 |
| 常见来源 | 文件选择器 | fetch/canvas/拼装 | blob.arrayBuffer() | FileReader/data URL |

## 四、项目里最常见的 4 个场景

## 1. 文件上传

优先用：

- `File`
- `FormData`

例如：

```javascript
const file = input.files[0]
const formData = new FormData()
formData.append('file', file)
```

这是最自然、最省事的方案。

## 2. 文件下载或预览

优先用：

- `Blob`
- `URL.createObjectURL(blob)`

例如：

```javascript
const blob = await response.blob()
const url = URL.createObjectURL(blob)
window.open(url)
```

用完记得：

```javascript
URL.revokeObjectURL(url)
```

这样可以释放临时对象 URL。

## 3. 需要自己按字节解析

优先用：

- `ArrayBuffer`
- `TypedArray`

例如你要做：

- 解析文件头
- 按字节读协议
- 做二进制计算

这时 `ArrayBuffer` 才是主角。

## 4. 只能走文本通道

才考虑：

- `Base64`

比如：

- 某些老接口只收 JSON
- 你想把一张很小的图内嵌进 HTML/CSS

否则不建议把大文件转成 Base64 再传。

## 五、最常见的转换关系

### 1. File -> ArrayBuffer

```javascript
const file = input.files[0]
const buffer = await file.arrayBuffer()
```

### 2. Blob -> ArrayBuffer

```javascript
const buffer = await blob.arrayBuffer()
```

### 3. Blob -> Object URL

```javascript
const url = URL.createObjectURL(blob)
```

### 4. File / Blob -> Base64

```javascript
const reader = new FileReader()
reader.readAsDataURL(file)
reader.onload = () => {
  console.log(reader.result)
}
```

这里拿到的通常不是“纯 Base64”，而是：

```text
data:image/png;base64,xxxxxx
```

也就是常说的 Data URL。

## 六、几个非常容易踩的坑

### 1. 把 Base64 当成“文件类型”

不是。

Base64 只是编码结果。你把图片转成 Base64，它也不会自动变成“更适合上传”的形态，反而通常更大。

### 2. 把 Blob 当成“有文件名的文件”

Blob 默认没有文件名。需要文件名时，你要么额外维护名字，要么转成 `File`。

### 3. 上传时一上来就转 Base64

大多数上传接口，直接 `File + FormData` 更自然，也更节省体积。

### 4. 预览完 Object URL 不释放

频繁创建 Blob URL 又不回收，容易让页面内存持续增长。

### 5. 想用 `btoa` 直接处理任意文本或任意二进制

`btoa` / `atob` 适合非常基础的场景，但碰到 Unicode 文本或复杂二进制时很容易踩坑。实际项目里更常见的还是：

- `FileReader`
- `Blob`
- `ArrayBuffer`
- `TextEncoder` / `TextDecoder`

## 七、到底该优先选谁

### 1. 从文件选择器拿到的数据

优先看成：

- `File`

### 2. 从接口下载回来的文件流

优先看成：

- `Blob`

### 3. 你要自己解析字节

优先看成：

- `ArrayBuffer`

### 4. 你只是为了走文本通道

才考虑：

- `Base64`

## 八、一句话记忆版

- `File`：像“系统里的真实文件”
- `Blob`：像“打包好的二进制包裹”
- `ArrayBuffer`：像“裸字节内存”
- `Base64`：像“把二进制翻译成文本”

如果只记一句，就记：

`上传首选 File，预览下载常用 Blob，底层处理看 ArrayBuffer，Base64 只在必须走文本时再用。`
