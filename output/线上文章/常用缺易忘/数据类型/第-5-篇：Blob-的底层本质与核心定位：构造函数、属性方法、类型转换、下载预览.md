---
title: "第 5 篇：Blob 的底层本质与核心定位：构造函数、属性方法、类型转换、下载预览"
slug: "blob-2000f47d"
summary: "Blob 深入笔记，讲清 Blob 的底层定位、构造函数、type/size、slice、stream、arrayBuffer、text、与 File/ArrayBuffer/Base64 的转换，以及下载预览等高频场景。"
category: "数据类型"
categoryPath:
  - "常用缺易忘"
  - "数据类型"
tags: []
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac31e"
originalSlug: "blob-2000f47d"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.362Z"
updatedAt: "2026-07-31T11:16:21.480Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 5 篇：Blob 的底层本质与核心定位：构造函数、属性方法、类型转换、下载预览

### 一、Blob的底层本质与核心定位
在前端生态中，Blob是**<font style="color:#DF2A3F;">浏览器提供的用于封装「不可变原始二进制数据」的内置对象</font>**，它的核心价值在于：

+ 作为「二进制数据载体」，打通前端字符串、数组与文件/二进制流之间的桥梁；
+ 支持与DOM API（`<a>`、`<img>`）、网络请求API（fetch/XHR）、文件API（File/FileReader）无缝协作；
+ 数据存储在浏览器内存中（大Blob可能会缓存到磁盘），无需依赖后端即可完成二进制数据的本地处理。

不同于JavaScript原生数据类型，Blob的设计目标就是专门处理「非字符型」数据（如图片、视频、PDF、Excel等），这也是它在文件上传、下载、预览等场景中不可或缺的原因。

### 二、Blob构造函数详解（前端实战必掌握）
Blob的创建依赖`new Blob(array, options)`构造函数，两个参数的细节直接影响实际使用效果，需重点掌握：

#### 1. 第一个参数：`array`（数据数组）
用于传入待封装的二进制数据，支持多种数据类型的混合数组，浏览器会自动将其转换为二进制流：

+ 支持的数据类型：字符串（String）、ArrayBuffer、ArrayBufferView（Uint8Array/Uint16Array等类型化数组）、其他Blob对象、DataView；
+ 混合传入示例（实战中常见场景）：

```javascript
// 混合字符串与Uint8Array（比如给文本添加字节级前缀）
const text = "前端开发Blob实战";
const prefix = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM头
const blob = new Blob([prefix, text], { type: "text/plain; charset=utf-8" });
```

#### 2. 第二个参数：`options`（可选配置对象）
用于指定Blob的元信息，核心属性有两个：

+ `type`：字符串类型，指定Blob的MIME媒体类型，默认值为空字符串。
+ 常用MIME类型（前端高频）：

| 场景 | MIME类型 |
| --- | --- |
| 文本文件 | text/plain; charset=utf-8 |
| JSON文件 | application/json; charset=utf-8 |
| 图片（JPG/PNG） | image/jpeg / image/png |
| PDF文件 | application/pdf |
| Excel文件（xlsx） | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| ZIP压缩包 | application/zip |


+ `endings`：可选值为`"transparent"`（默认）或`"native"`，用于处理文本中的换行符：
    - `"transparent"`：保持原有换行符（\n）不变；
    - `"native"`：自动将换行符转换为当前操作系统的换行格式（Windows：\r\n，Linux/Mac：\n），仅对文本类型Blob有效。

[MIME媒体类型](https://www.yuque.com/chenhaonan-b76av/wcyi7i/ldg1efzb69l7a1tm)

| <font style="color:rgba(0, 0, 0, 0.85);">分类</font> | <font style="color:rgba(0, 0, 0, 0.85);">常见类型</font> | <font style="color:rgba(0, 0, 0, 0.85);">说明</font> |
| --- | --- | --- |
| <font style="color:rgba(0, 0, 0, 0.85);">文本类</font> | `<font style="color:rgba(0, 0, 0, 0.85);">text/html</font>`<font style="color:rgba(0, 0, 0, 0.85);"> </font>`<font style="color:rgba(0, 0, 0, 0.85);">text/plain</font>`<font style="color:rgba(0, 0, 0, 0.85);"> </font>`<font style="color:rgba(0, 0, 0, 0.85);">text/css</font>` | <font style="color:rgba(0, 0, 0, 0.85);">HTML文件、纯文本（.txt）、CSS文件</font> |
| <font style="color:rgba(0, 0, 0, 0.85);">图片类</font> | `<font style="color:rgba(0, 0, 0, 0.85);">image/png</font>`<font style="color:rgba(0, 0, 0, 0.85);"> </font>`<font style="color:rgba(0, 0, 0, 0.85);">image/jpeg</font>`<font style="color:rgba(0, 0, 0, 0.85);"> </font>`<font style="color:rgba(0, 0, 0, 0.85);">image/gif</font>` | <font style="color:rgba(0, 0, 0, 0.85);">PNG图、JPG图、GIF动/静图</font> |
| <font style="color:rgba(0, 0, 0, 0.85);">音视频类</font> | `<font style="color:rgba(0, 0, 0, 0.85);">audio/mp3</font>`<font style="color:rgba(0, 0, 0, 0.85);"> </font>`<font style="color:rgba(0, 0, 0, 0.85);">video/mp4</font>` | <font style="color:rgba(0, 0, 0, 0.85);">MP3音频、MP4视频</font> |
| <font style="color:rgba(0, 0, 0, 0.85);">应用/二进制类</font> | `<font style="color:rgba(0, 0, 0, 0.85);">application/json</font>`<font style="color:rgba(0, 0, 0, 0.85);"> </font>`<font style="color:rgba(0, 0, 0, 0.85);">application/pdf</font>`<font style="color:rgba(0, 0, 0, 0.85);"> </font>`<font style="color:rgba(0, 0, 0, 0.85);">application/octet-stream</font>` | <font style="color:rgba(0, 0, 0, 0.85);">JSON数据、PDF文档、通用二进制（默认，触发下载）</font> |
| <font style="color:rgba(0, 0, 0, 0.85);">多部分类</font> | `<font style="color:rgba(0, 0, 0, 0.85);">multipart/form-data</font>` | <font style="color:rgba(0, 0, 0, 0.85);">表单上传（含文本+文件），需</font>`<font style="color:rgba(0, 0, 0, 0.85);">boundary</font>`<font style="color:rgba(0, 0, 0, 0.85);">分割</font> |


## <font style="color:rgba(0, 0, 0, 0.85);">五、核心应用场景</font>
1. **HTTP协议**<font style="color:rgba(0, 0, 0, 0.85);">：通过</font>`<font style="color:rgba(0, 0, 0, 0.85);">Content-Type</font>`<font style="color:rgba(0, 0, 0, 0.85);">头传递类型，响应头告知客户端数据类型（如</font>`<font style="color:rgba(0, 0, 0, 0.85);">application/json</font>`<font style="color:rgba(0, 0, 0, 0.85);">），请求头告知服务器发送数据类型（如表单</font>`<font style="color:rgba(0, 0, 0, 0.85);">application/x-www-form-urlencoded</font>`<font style="color:rgba(0, 0, 0, 0.85);">）。</font>
2. **HTML标签**<font style="color:rgba(0, 0, 0, 0.85);">：</font>`<font style="color:rgba(0, 0, 0, 0.85);"><img></font>`<font style="color:rgba(0, 0, 0, 0.85);">用Data URI指定类型（如</font>`<font style="color:rgba(0, 0, 0, 0.85);">data:image/png;base64,...</font>`<font style="color:rgba(0, 0, 0, 0.85);">），</font>`<font style="color:rgba(0, 0, 0, 0.85);"><a></font>`<font style="color:rgba(0, 0, 0, 0.85);">结合</font>`<font style="color:rgba(0, 0, 0, 0.85);">download</font>`<font style="color:rgba(0, 0, 0, 0.85);">属性指定下载文件类型。</font>
3. **电子邮件**<font style="color:rgba(0, 0, 0, 0.85);">：原生场景，标识附件格式，多附件用</font>`<font style="color:rgba(0, 0, 0, 0.85);">multipart/mixed</font>`<font style="color:rgba(0, 0, 0, 0.85);">+</font>`<font style="color:rgba(0, 0, 0, 0.85);">boundary</font>`<font style="color:rgba(0, 0, 0, 0.85);">分割。</font>
4. **文件处理**<font style="color:rgba(0, 0, 0, 0.85);">：云存储、本地应用通过类型判断文件格式，避免依赖扩展名出错。</font>

## <font style="color:rgba(0, 0, 0, 0.85);">六、关键注意事项</font>
1. <font style="color:rgba(0, 0, 0, 0.85);">浏览器优先识别MIME类型，而非文件扩展名，需确保服务器配置正确。</font>
2. <font style="color:rgba(0, 0, 0, 0.85);">避免滥用</font>`<font style="color:rgba(0, 0, 0, 0.85);">application/octet-stream</font>`<font style="color:rgba(0, 0, 0, 0.85);">，已知类型用具体标识（如</font>`<font style="color:rgba(0, 0, 0, 0.85);">application/pdf</font>`<font style="color:rgba(0, 0, 0, 0.85);">）。</font>
3. <font style="color:rgba(0, 0, 0, 0.85);">文本类类型需指定</font>`<font style="color:rgba(0, 0, 0, 0.85);">charset=utf-8</font>`<font style="color:rgba(0, 0, 0, 0.85);">，防止非ASCII字符乱码。</font>
4. <font style="color:rgba(0, 0, 0, 0.85);">参考IANA官方列表（</font>[https://www.iana.org/assignments/media-types/media-types.xhtml](https://www.iana.org/assignments/media-types/media-types.xhtml)<font style="color:rgba(0, 0, 0, 0.85);">），使用标准类型保障兼容性。</font>

### 三、Blob的核心属性与方法（完整API解析）
Blob的API简洁但实用，所有属性和方法都是前端处理二进制数据的基础，需熟练掌握：

#### 1. 核心属性（只读，不可修改）
+ `size`：返回Blob的字节大小（Number类型），实战中用于「文件大小限制校验」：

```javascript
// 限制上传文件不超过10MB
function checkFileSize(blob) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (blob.size > maxSize) {
    alert("文件大小超过10MB，请压缩后上传！");
    return false;
  }
  return true;
}
```

+ `type`：返回Blob的MIME类型（字符串类型），实战中用于「文件格式校验」：

```javascript
// 仅允许上传图片格式（jpg/png/webp）
function checkFileType(blob) {
  const allowTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowTypes.includes(blob.type)) {
    alert("仅支持jpg、png、webp格式图片！");
    return false;
  }
  return true;
}
```

#### 2. 核心方法：`slice()`（分片核心，实战高频）
用于从原Blob中截取部分二进制数据，返回一个「新的Blob对象」（原Blob不变，体现Blob的不可变性），是大文件分片上传的核心API。

##### 语法
```javascript
blob.slice(start, end, contentType);
```

+ `start`：可选，起始字节索引（默认0，支持负数，-1表示最后一个字节）；
+ `end`：可选，结束字节索引（不包含该索引，默认到Blob末尾）；
+ `contentType`：可选，新Blob的MIME类型，默认与原Blob一致。

##### 实战示例：大文件分片（按1MB分片）
```javascript
function sliceBigFile(originalFile) {
  const chunkSize = 1 * 1024 * 1024; // 1MB每片
  const totalChunks = Math.ceil(originalFile.size / chunkSize); // 总片数
  const chunks = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, originalFile.size); // 最后一片避免超出
    // 截取分片，生成新Blob
    const chunkBlob = originalFile.slice(start, end, originalFile.type);
    chunks.push({
      blob: chunkBlob,
      index: i, // 分片索引，用于后端合并
      total: totalChunks // 总片数
    });
  }

  return chunks;
}

// 使用：获取<input type="file">的文件对象（File继承自Blob）
const fileInput = document.querySelector('input[type="file"]');
fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const fileChunks = sliceBigFile(file);
    console.log(`文件已分片为${fileChunks.length}片`);
    // 后续可分批上传分片
  }
};
```

##### 兼容性说明
早期浏览器对`slice()`有兼容性前缀：

+ Chrome < 21、Firefox < 13：使用`webkitSlice()`/`mozSlice()`；
+ 实战兼容处理：

```javascript
function blobSlice(blob, start, end) {
  if (blob.slice) {
    return blob.slice(start, end);
  } else if (blob.webkitSlice) {
    return blob.webkitSlice(start, end);
  } else if (blob.mozSlice) {
    return blob.mozSlice(start, end);
  } else {
    return null;
  }
}
```

### 四、Blob与其他前端数据类型的转换（实战核心需求）
前端开发中，经常需要在Blob与字符串、ArrayBuffer、Base64之间转换，这是处理二进制数据的关键技能：

#### 1. Blob ↔ 字符串（JSON/文本处理）
+ **Blob → 字符串**：借助`FileReader`的`readAsText()`方法

```javascript
function blobToText(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // 读取完成回调
    reader.onload = () => resolve(reader.result); // result为字符串
    // 读取失败回调
    reader.onerror = () => reject(reader.error);
    // 开始读取Blob为文本（指定编码，默认utf-8）
    reader.readAsText(blob, "utf-8");
  });
}

// 使用示例
const jsonBlob = new Blob([JSON.stringify({ name: "前端开发" })], { type: "application/json" });
blobToText(jsonBlob).then(text => {
  console.log(JSON.parse(text)); // 解析为JSON对象
});
```

+ **字符串 → Blob**：直接通过Blob构造函数（最常用）

```javascript
const text = "Blob与字符串转换";
const textBlob = new Blob([text], { type: "text/plain; charset=utf-8" });
```

#### 2. Blob ↔ ArrayBuffer（字节级操作，如加密、解析二进制文件）
+ **Blob → ArrayBuffer**：借助`FileReader`的`readAsArrayBuffer()`方法

```javascript
function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // result为ArrayBuffer
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

// 使用示例：读取Blob的字节数据
blobToArrayBuffer(textBlob).then(arrayBuffer => {
  const uint8Array = new Uint8Array(arrayBuffer);
  console.log("字节数组：", uint8Array); // 可进行字节级操作
});
```

+ **ArrayBuffer → Blob**：通过Blob构造函数（传入ArrayBuffer或类型化数组）

```javascript
const arrayBuffer = new ArrayBuffer(16); // 16字节的缓冲区
const uint16Array = new Uint16Array(arrayBuffer);
uint16Array[0] = 65535; // 填充数据
const bufferBlob = new Blob([arrayBuffer], { type: "application/octet-stream" });
```

#### 3. Blob ↔ Base64（图片预览、小文件传输）
+ **Blob → Base64**：两种方式，按需选择  
方式1：`FileReader`的`readAsDataURL()`（支持所有Blob，推荐）

```javascript
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // result为Base64字符串（data:xxx;base64,xxx）
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// 图片预览实战示例
const imgInput = document.querySelector('input[type="file"][accept="image/*"]');
const imgPreview = document.querySelector('#preview');
imgInput.onchange = async (e) => {
  const imgFile = e.target.files[0];
  if (imgFile) {
    const base64Url = await blobToBase64(imgFile);
    imgPreview.src = base64Url; // 直接赋值给img标签预览
  }
};
```

方式2：`URL.createObjectURL()`（生成临时Blob URL，性能更好，适合大图片）

```javascript
// 图片预览（性能更优，无需转换Base64）
imgInput.onchange = (e) => {
  const imgFile = e.target.files[0];
  if (imgFile) {
    const blobUrl = URL.createObjectURL(imgFile);
    imgPreview.src = blobUrl;
    // 页面卸载时释放内存，避免泄漏
    window.onunload = () => URL.revokeObjectURL(blobUrl);
  }
};
```

+ **Base64 → Blob**：先解码为字符串/ArrayBuffer，再转换为Blob

```javascript
function base64ToBlob(base64Str) {
  // 分离Base64头部（data:xxx;base64,）和数据部分
  const [header, data] = base64Str.split(',');
  // 解码Base64为二进制字符串
  const binaryStr = atob(data);
  // 创建Uint8Array存储字节数据
  const uint8Array = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    uint8Array[i] = binaryStr.charCodeAt(i);
  }
  // 获取MIME类型
  const mimeType = header.match(/data:(.*?);/)[1];
  // 生成Blob
  return new Blob([uint8Array], { type: mimeType });
}

// 使用示例：Base64图片转换为Blob并下载
const base64Img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";
const imgBlob = base64ToBlob(base64Img);
const aTag = document.createElement('a');
aTag.href = URL.createObjectURL(imgBlob);
aTag.download = "预览图片.png";
aTag.click();
URL.revokeObjectURL(aTag.href);
```

### 五、Blob的前端实战高频场景（深度拆解）
作为前端开发，以下场景是Blob的核心应用场景，需掌握完整实现逻辑：

#### 场景1：前端生成并下载各类文件（JSON/Excel/图片）
+ 生成Excel（借助SheetJS库，前端无后端生成Excel）

```html
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<button onclick="downloadExcel()">下载Excel文件</button>
<script>
  function downloadExcel() {
    // 1. 构造表格数据
    const data = [
      ["姓名", "职业", "年龄"],
      ["张三", "前端开发", 28],
      ["李四", "后端开发", 30]
    ];
    // 2. 通过SheetJS创建工作簿
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "员工信息");
    // 3. 生成Excel二进制数据（ArrayBuffer）
    const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    // 4. 转换为Blob
    const excelBlob = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    // 5. 下载
    const blobUrl = URL.createObjectURL(excelBlob);
    const aTag = document.createElement('a');
    aTag.href = blobUrl;
    aTag.download = "员工信息表.xlsx";
    aTag.click();
    URL.revokeObjectURL(blobUrl);
  }
</script>

```

#### 场景2：大文件分片上传（完整流程）
1. 前端分片：通过`slice()`分割文件；
2. 分批上传：按索引上传分片，携带分片信息（索引、总片数、文件唯一标识）；
3. 后端合并：接收所有分片后，按索引合并为完整文件；
4. 前端校验：上传完成后校验文件完整性。

```javascript
// 前端上传逻辑
async function uploadChunks(chunks, fileHash) {
  const uploadPromises = chunks.map(async (chunk) => {
    const formData = new FormData();
    formData.append("chunk", chunk.blob); // 分片Blob
    formData.append("index", chunk.index); // 分片索引
    formData.append("total", chunk.total); // 总片数
    formData.append("fileHash", fileHash); // 文件唯一标识（如通过MD5生成）
    formData.append("fileName", "大文件.mp4"); // 原文件名

    // 上传分片
    const response = await fetch("/api/upload/chunk", {
      method: "POST",
      body: formData
    });

    return response.json();
  });

  // 等待所有分片上传完成
  await Promise.all(uploadPromises);

  // 通知后端合并分片
  await fetch("/api/upload/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileHash,
      fileName: "大文件.mp4",
      total: chunks.length
    })
  });

  alert("大文件上传完成！");
}
```

#### 场景3：拦截网络请求，处理二进制响应（如下载文件并修改文件名）
通过`fetch`请求后端接口，获取二进制响应并转换为Blob，再实现自定义文件名下载：

```javascript
async function downloadFileFromApi() {
  try {
    const response = await fetch("/api/export/data", {
      method: "GET",
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });

    if (!response.ok) throw new Error("文件下载失败");

    // 将响应体转换为Blob（关键：response.blob()方法）
    const fileBlob = await response.blob();

    // 获取后端返回的文件名（通过响应头）
    const fileName = decodeURIComponent(
      response.headers.get("Content-Disposition").split("filename=")[1]
    );

    // 下载文件
    const blobUrl = URL.createObjectURL(fileBlob);
    const aTag = document.createElement('a');
    aTag.href = blobUrl;
    aTag.download = fileName;
    aTag.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
```

### 六、Blob使用的常见坑与避坑指南（前端开发必看）
1. **Blob URL内存泄漏问题**
    - 问题：`URL.createObjectURL(blob)`生成的临时URL会占用浏览器内存，若不主动释放，长期使用会导致内存泄漏；
    - 解决方案：使用后通过`URL.revokeObjectURL(blobUrl)`释放，或在页面卸载时统一清理：

```javascript
// 单个Blob URL释放
const blobUrl = URL.createObjectURL(blob);
// 使用完成后
URL.revokeObjectURL(blobUrl);

// 页面卸载时统一释放所有Blob URL（可选）
window.addEventListener("unload", () => {
  // 若有多个Blob URL，需存储后批量释放
});
```

2. **Blob大小限制问题**
    - 问题：部分浏览器对Blob大小有内存限制（如Chrome默认限制约500MB），创建超大Blob会导致浏览器崩溃；
    - 解决方案：大文件采用分片处理，避免一次性创建超大Blob；
3. **MIME类型设置错误导致文件无法正常打开**
    - 问题：创建Blob时`type`设置错误（如将Excel设为`application/json`），会导致下载后的文件无法正常打开；
    - 解决方案：参考标准MIME类型表，根据文件格式准确设置，不确定时可设为`application/octet-stream`（通用二进制流）；
4. **IE浏览器兼容性问题**
    - 问题：IE10及以下不支持Blob构造函数，IE11对`URL.createObjectURL`支持有限；
    - 解决方案：
        * 兼容IE11：使用`msSaveBlob`/`msSaveOrOpenBlob`方法下载Blob：

```javascript
function downloadBlobCompat(blob, fileName) {
  if (window.navigator.msSaveBlob) {
    // IE11兼容
    window.navigator.msSaveBlob(blob, fileName);
  } else {
    // 现代浏览器
    const blobUrl = URL.createObjectURL(blob);
    const aTag = document.createElement('a');
    aTag.href = blobUrl;
    aTag.download = fileName;
    aTag.click();
    URL.revokeObjectURL(blobUrl);
  }
}
```

        * 无需兼容IE10及以下（目前大部分项目已放弃IE低版本）。
5. **Blob不可变导致的修改问题**
    - 问题：Blob是不可变对象，无法直接修改内部数据，只能通过`slice()`截取或重新创建Blob；
    - 解决方案：若需修改Blob内容，先将其转换为ArrayBuffer/字符串，修改后再重新创建Blob。

### 七、总结（前端开发核心要点提炼）
1. **核心定位**：Blob是前端处理二进制数据的「容器」，是连接字符串、数组与文件/网络二进制流的核心桥梁；
2. **关键API**：
    - 构造函数：`new Blob([数据], { type: MIME类型 })`；
    - 属性：`size`（字节大小）、`type`（MIME类型）；
    - 方法：`slice()`（分片）；
    - 转换：`FileReader`（Blob转文本/ArrayBuffer/Base64）、`URL.createObjectURL`（Blob转临时URL）；
3. **实战场景**：前端文件生成与下载、大文件分片上传、图片/文件预览、网络二进制响应处理；
4. **避坑重点**：释放Blob URL内存、准确设置MIME类型、大文件分片、兼容IE11；
5. **关联生态**：Blob与File（子类关系）、FormData（文件上传）、SheetJS（前端生成Excel）、fetch/XHR（网络二进制请求）紧密协作，是前端工程化中文件处理模块的核心依赖。
