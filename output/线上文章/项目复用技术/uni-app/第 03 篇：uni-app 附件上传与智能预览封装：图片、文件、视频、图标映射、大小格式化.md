---
title: "第 3 篇：uni-app 附件上传与智能预览封装：图片、文件、视频、图标映射、大小格式化"
slug: "uni-app-uni-app-7432a1ba"
summary: "uni-app 附件上传与智能预览封装实战，覆盖图片预览、文档打开、视频上传、文件大小格式化和文件图标映射。"
category: "uni-app"
tags:
  - "uni-app"
  - "文件上传"
  - "附件预览"
  - "图片上传"
  - "视频上传"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d29208a2b1c68f2cac6ea"
originalSlug: "uni-app-uni-app-7432a1ba"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 3 篇：uni-app 附件上传与智能预览封装：图片、文件、视频、图标映射、大小格式化

> 这是 `项目复用技术 / uni-app` 目录下的第 3 篇。  
> 这一篇不讲某个来源文件，也不讲某个业务页面，而是直接把附件能力写成一套通用手册：
>
> `附件上传、图片预览、文档打开、视频上传、文件大小展示、文件图标映射，到底怎么封才适合长期复用？`

> 你以后在这些场景里几乎都会用到它：
>
> 1. 表单附件上传
> 2. OA / 审批上传材料
> 3. 聊天或工单上传图片与文件
> 4. 内容发布页上传图片 / 视频
> 5. 详情页点击预览图片或文档
> 6. 列表页展示文件大小、文件图标和附件类型

> 这篇文章的目标是把这些零散能力收成一套：
>
> `以后再接图片、文件、视频上传与预览时，直接照着搭的附件处理模板`

## 一、先把问题讲透：为什么附件相关代码特别容易越写越乱

很多项目刚开始做附件功能时，思路都很简单：

1. 选一个文件
2. 上传到服务器
3. 拿到地址
4. 详情页点击时打开

但真正写进项目后，很快就会多出很多分支：

1. 图片和普通文件是不是应该走同一套预览逻辑？
2. 视频上传是不是和图片上传接口一样？
3. 后端返回的数据结构到底是对象、数组，还是套了一层 `data.data`？
4. 点击文档时，是直接打开链接，还是先下载再打开？
5. 小程序端和 H5 端打开文件的方式一样吗？
6. 远程文件和本地临时文件的处理方式一样吗？
7. 页面展示时，怎么知道这个附件应该显示什么图标？
8. 文件大小怎么转成 `KB / MB / GB`？
9. 图片是否应该直接 `previewImage`？
10. 文档打开失败后，用户还能怎么继续查看？

你会发现，真正让附件功能变复杂的，不是“上传”这一步，而是：

`文件类型分流 + 平台差异 + 返回结构兼容 + 预览失败兜底 + 页面展示信息`

这也是为什么很多团队里的工具文件会慢慢长成一个“大杂烩”：

```txt
一个工具文件里同时写
上传图片
+ 上传视频
+ 预览图片
+ 打开文档
+ 远程下载
+ 本地路径复制
+ 文件大小格式化
+ 文件图标映射
```

它们本身未必写错，但如果没有一个明确的封装思路，后面就会出现：

1. 页面 A 自己判断是不是图片
2. 页面 B 再写一套文件后缀判断
3. 页面 C 预览失败后直接 toast
4. 页面 D 预览失败后复制链接

最后变成谁都能用，但谁都不够统一。

## 二、先给结论：附件相关能力也应该拆层

如果这一篇只记住一句话，我希望是：

`附件上传和预览不要按页面去堆，而要按能力去拆。`

我建议固定拆成 4 层：

1. `上传层`
   只负责把本地文件上传到后端，并统一返回结果结构
2. `预览层`
   只负责根据文件类型决定预览方式
3. `文件信息层`
   只负责大小格式化、图片判断、图标映射
4. `业务接入层`
   只负责页面里怎么选文件、上传成功后怎么回填表单、点击附件后怎么触发预览

这四层分清以后，很多场景都能复用：

1. 上传图片
2. 上传视频
3. 上传审批材料
4. 点击详情页附件预览
5. 聊天消息里的文件展示

## 三、真正值得拆开理解的，是这三个主题

如果从附件能力本身去看，最值得单独拆开的其实不是零散函数名，而是下面这三块能力。

### 1. 第一块：附件上传封装

对应能力：

1. 图片上传
2. 视频上传
3. 统一 token/header/formData
4. 统一解析后端响应

这块特别适合复用，因为后续每个“上传页”都会用到。

### 2. 第二块：智能预览封装

对应能力：

1. 图片直接预览
2. 文档下载后打开
3. H5 端新窗口打开
4. 打不开时复制链接兜底

这块也特别适合写成独立文章，因为页面里很难每次都判断完整。

### 3. 第三块：文件展示信息工具

对应能力：

1. 文件大小格式化
2. 图片类型判断
3. 文件图标映射

这块虽然小，但非常高频，而且特别适合沉淀成统一展示规范。

### 4. 不太适合优先单独写成一篇的内容

像下面这几类基础工具，我反而不建议优先单独写一篇：

1. `dateFormat`
2. `MD5`
3. `BASE64`
4. `AES`

不是它们不重要，而是：

1. 它们更偏基础工具
2. 单独成篇的复用价值没有“上传与预览方案”高
3. 更适合以后放进“前端通用工具函数整理”这类总篇里

所以如果你现在要优先沉淀，我建议先写：

`附件上传与智能预览`

## 四、先讲平台边界：为什么附件预览一定要考虑平台差异

很多人写附件预览时最容易犯的错是：

`我能拿到 URL，就默认所有端都能一样打开`

其实完全不是这样。

### 1. 图片预览：最简单，也最适合统一

图片通常最适合统一走：

```js
uni.previewImage({
  urls: [url],
  current: url,
})
```

这类能力跨端表现通常比较一致，也最适合统一收口到一个公共预览函数里。

### 2. 文档预览：小程序端和 H5 端思路不一样

文档这类附件，比如：

1. `pdf`
2. `doc`
3. `docx`
4. `xls`
5. `xlsx`
6. `ppt`
7. `pptx`

uni-app 官方 `uni.openDocument` 文档说明得很明确：

1. 小程序和 App 端支持直接打开文档
2. H5 端不支持 `uni.openDocument`

这意味着：

1. 小程序 / App 端更适合先下载，再用 `openDocument`
2. H5 端更适合直接 `window.open(url, '_blank')`

### 3. 本地临时文件和远程文件也不完全一样

远程文件更常见的路径是：

1. `https://xxx.com/file.pdf`

本地文件可能是：

1. 小程序临时路径
2. App 本地文件路径

这两种情况的预览方式和兜底方式都不一样，所以预览层最好先判断：

1. 这是远程文件还是本地文件
2. 是图片还是普通文件

## 五、附件上传层应该怎么封

上传层的目标不是“简单调用 `uni.uploadFile`”，而是：

`把不同页面里重复的上传逻辑统一掉`

比如这些东西，不应该在每个页面里重复写：

1. token 获取
2. schoolID / tenantID 一类上下文字段
3. header 拼接
4. formData 固定字段
5. 后端响应解析
6. 成功返回格式统一

### 1. 推荐模板：图片上传封装

```js
/**
 * 上传图片文件。
 * 用途：将本地临时图片路径上传到后端，并统一返回图片附件信息。
 * 参数：filePath 为本地图片路径；schoolID 为可选业务上下文标识。
 * 返回值：Promise<{success: boolean, data?: {id: string, fileName: string, src: string}, message: string}>。
 * 边界行为：后端返回 data 为数组或对象时都兼容解析；解析失败时返回 success false 而不是直接抛错。
 */
export const uploadImageFile = (filePath, schoolID) => {
  const uploadToken =
    uni.getStorageSync('USER_INFO_TOKEN') ||
    uni.getStorageSync('USER_INFO')?.token ||
    uni.getStorageSync('token') ||
    ''

  const currentSchoolID = schoolID || '112'

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: '请替换成你的图片上传接口',
      filePath,
      name: 'file',
      formData: {
        type: 1,
        schoolID: currentSchoolID,
      },
      header: {
        Authorization: uploadToken ? `Bearer ${uploadToken}` : '',
        schoolID: currentSchoolID,
      },
      success: (uploadFileRes) => {
        try {
          const response = JSON.parse(uploadFileRes.data)

          if (response.code === 200 && response.data) {
            let fileData = null

            if (Array.isArray(response.data) && response.data.length > 0) {
              const first = response.data[0]
              fileData = first?.data ? first.data : first
            } else if (typeof response.data === 'object') {
              fileData = response.data
            }

            if (fileData && fileData.id && fileData.src) {
              resolve({
                success: true,
                data: {
                  id: fileData.id,
                  fileName: fileData.fileName || '',
                  src: fileData.src,
                },
                message: response.message || response.msg || '上传成功',
              })
              return
            }
          }

          resolve({
            success: false,
            message: response.message || response.msg || '上传失败',
          })
        } catch (error) {
          resolve({
            success: false,
            message: '解析响应失败',
          })
        }
      },
      fail: reject,
    })
  })
}
```

### 2. 逐段解释为什么要这么写

#### 为什么 token 获取要统一收口

因为上传通常不只是某一个页面的能力，而是多个页面都会复用。  
如果每个页面自己取 token，后面一旦 token 存储字段改了，就到处都要改。

#### 为什么后端响应要兼容“数组”和“对象”

实际对接后端时，这类上传接口经常会出现下面几种结构：

1. `data` 直接是对象
2. `data` 是数组，数组里第一项才是真正文件对象
3. `data[0].data` 又套了一层

所以上传层最重要的事情之一，就是：

`把后端不稳定的结构收口成前端稳定结构`

### 3. 视频上传也应该统一一个返回结构

视频上传和图片上传最大的区别通常不在“前端调用方式”，而在：

1. 接口地址不同
2. 有时返回结构略有不同

但对页面层来说，最舒服的方式仍然是：

`无论图片还是视频，统一返回 success/data/message`

### 4. 推荐模板：视频上传封装

```js
/**
 * 上传视频文件。
 * 用途：将本地临时视频路径上传到后端，并统一返回视频附件信息。
 * 参数：filePath 为本地视频路径；schoolID 为可选业务上下文标识。
 * 返回值：Promise<{success: boolean, data?: {id: string, fileName: string, src: string}, message: string}>。
 * 边界行为：HTTP 状态码非 200 时优先返回上传失败；JSON 解析失败时返回具体解析错误信息。
 */
export const uploadVideo = (filePath, schoolID) => {
  const uploadToken =
    uni.getStorageSync('USER_INFO_TOKEN') ||
    uni.getStorageSync('USER_INFO')?.token ||
    uni.getStorageSync('token') ||
    ''

  const currentSchoolID = schoolID || '112'

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: '请替换成你的视频上传接口',
      filePath,
      name: 'file',
      formData: {
        type: 1,
        schoolID: currentSchoolID,
      },
      header: {
        Authorization: uploadToken ? `Bearer ${uploadToken}` : '',
        schoolID: currentSchoolID,
      },
      success: (uploadFileRes) => {
        if (uploadFileRes.statusCode && uploadFileRes.statusCode !== 200) {
          resolve({
            success: false,
            message: `上传失败 (HTTP ${uploadFileRes.statusCode})`,
          })
          return
        }

        try {
          const response =
            typeof uploadFileRes.data === 'string'
              ? JSON.parse(uploadFileRes.data)
              : uploadFileRes.data

          if (response.code === 200) {
            resolve({
              success: true,
              data: {
                id: response.data.id,
                fileName: response.data.fileName,
                src: response.data.src,
              },
              message: response.msg || '上传成功',
            })
            return
          }

          resolve({
            success: false,
            message: response?.msg || response?.message || '上传失败',
          })
        } catch (error) {
          resolve({
            success: false,
            message: `解析响应失败: ${error?.message || '未知错误'}`,
          })
        }
      },
      fail: (error) => {
        reject(new Error(error?.errMsg || error?.message || '上传失败'))
      },
    })
  })
}
```

## 六、预览层为什么比上传层更值得统一

很多项目里上传层其实写得还行，但预览层非常散。  
因为大家通常会在页面里临时写：

1. 是图片就 `previewImage`
2. 是文件就 `downloadFile + openDocument`
3. H5 打不开就 `window.open`
4. 再不行就复制链接

这种逻辑一旦不统一，页面体验会非常不一致。

### 1. 一个合格的“通用附件预览函数”至少应该解决这些问题

1. 支持传字符串 URL，也支持传对象
2. 能从多种字段名中解析出 URL
3. 能推断是不是图片
4. 能区分远程文件和本地文件
5. 图片直接预览
6. 文档在小程序端先下载再打开
7. H5 端新窗口打开
8. 打不开时还能给出兜底路径

### 2. 推荐模板：智能附件预览封装

```js
/**
 * 预览附件。
 * 用途：统一处理图片预览、文档打开、远程文件下载、本地文件路径兜底等逻辑。
 * 参数：attachment 可为 URL 字符串，也可为对象；支持 filePath、serverPath、src、url、path、fileUrl 等字段。
 * 返回值：无。
 * 边界行为：图片直接预览；文档按平台分流；打开失败时复制链接或提示用户手动处理。
 */
export const previewAttachment = (attachment) => {
  if (!attachment) {
    uni.showToast({ title: '附件信息无效', icon: 'none' })
    return
  }

  const getUrl = (f) => {
    if (!f) return ''
    if (typeof f === 'string') return f
    return f.filePath || f.serverPath || f.src || f.url || f.path || f.fileUrl || ''
  }

  const getName = (f) => {
    if (!f || typeof f === 'string') return ''
    return f.fileName || f.name || ''
  }

  const inferType = (f) => {
    if (!f) return 'file'

    const imageExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'bmp',
      'webp',
      'svg',
      'ico',
      'heic',
      'heif',
    ]

    if (typeof f === 'object' && f.type) {
      const typeStr = String(f.type).toLowerCase()
      if (typeStr === 'image' || typeStr === 'file') {
        return typeStr
      }
      if (imageExtensions.includes(typeStr)) {
        return 'image'
      }
    }

    if (typeof f === 'object' && f.mime) {
      if (String(f.mime).toLowerCase().startsWith('image/')) {
        return 'image'
      }
    }

    if (typeof f === 'object' && f.fileType) {
      const fileTypeStr = String(f.fileType).toLowerCase()
      if (imageExtensions.includes(fileTypeStr)) {
        return 'image'
      }
    }

    const nameOrUrl = (getName(f) || getUrl(f)).toLowerCase()
    if (/(\.jpg|\.jpeg|\.png|\.gif|\.bmp|\.webp|\.svg|\.ico|\.heic|\.heif)(\?|#|$)/i.test(nameOrUrl)) {
      return 'image'
    }

    return 'file'
  }

  const isRemote = (f, url) => {
    if (typeof f === 'string') {
      return /^https?:\/\//i.test(f)
    }
    if (f && typeof f === 'object' && f.uploaded === true) {
      return true
    }
    return /^https?:\/\//i.test(url)
  }

  const url = getUrl(attachment)
  if (!url) {
    uni.showToast({ title: '附件地址无效', icon: 'none' })
    return
  }

  const type = inferType(attachment)
  const remote = isRemote(attachment, url)

  if (type === 'image') {
    uni.previewImage({
      urls: [url],
      current: url,
      fail: () => {
        uni.showToast({
          title: '图片预览失败',
          icon: 'none',
        })
      },
    })
    return
  }

  uni.showToast({
    title: '正在打开文件...',
    icon: 'loading',
    duration: 2000,
  })

  if (remote) {
    // #ifdef MP
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            fail: () => {
              uni.setClipboardData({
                data: url,
                success: () => {
                  uni.showModal({
                    title: '提示',
                    content: '暂不支持预览此类型文件，链接已复制到剪贴板，请在浏览器中打开查看',
                    showCancel: false,
                  })
                },
              })
            },
          })
        } else {
          uni.showToast({
            title: '文件下载失败',
            icon: 'none',
          })
        }
      },
      fail: () => {
        uni.setClipboardData({
          data: url,
          success: () => {
            uni.showModal({
              title: '提示',
              content: '文件下载失败，链接已复制到剪贴板，请在浏览器中打开查看',
              showCancel: false,
            })
          },
        })
      },
    })
    // #endif

    // #ifdef H5
    window.open(url, '_blank')
    // #endif
  } else {
    uni.setClipboardData({
      data: url,
      success: () => {
        uni.showModal({
          title: '提示',
          content: '本地文件路径已复制到剪贴板',
          showCancel: false,
        })
      },
    })
  }
}
```

### 3. 这里最值得你学的，不是代码量，而是预览兜底思路

一个真正适合复用的预览函数，不是只在“理想情况”下可用，而是：

1. 图片能预览
2. 文档能打开
3. 打不开还能继续给用户路径

这种“失败兜底”能力，通常比单纯 `openDocument()` 更值钱。

## 七、文件信息层为什么也值得抽

很多人觉得这些只是小工具：

1. `formatFileSize`
2. `isImage`
3. `getFileIcon`
4. `getFileIconName`

但它们其实很高频，而且特别适合统一到项目级别。

### 1. 文件大小格式化

```js
/**
 * 格式化文件大小。
 * 用途：将字节数转成 B、KB、MB、GB，便于在附件列表中展示。
 * 参数：bytes 为文件大小，单位字节。
 * 返回值：格式化后的字符串。
 * 边界行为：传入 0、空值或无效数字时统一返回 0 B。
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
```

### 2. 图片类型判断

```js
/**
 * 判断文件名是否为图片类型。
 * 用途：在没有 mime 信息时，快速根据扩展名判断附件是否为图片。
 * 参数：fileName 为文件名。
 * 返回值：Boolean。
 * 边界行为：文件名为空时返回 false。
 */
export const isImage = (fileName) => {
  if (!fileName) return false
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  return imageExts.includes(ext)
}
```

### 3. 文件图标映射

如果你项目里有：

1. 附件列表
2. 审批材料列表
3. 聊天文件消息

那图标映射就很有价值，因为它让页面层只负责展示，不用每次自己判断类型。

```js
/**
 * 获取文件图标名称。
 * 用途：根据文件扩展名返回统一的 UI 图标标识，供附件列表或文件卡片使用。
 * 参数：fileName 为文件名。
 * 返回值：图标名称字符串。
 * 边界行为：未知类型统一回退到 file-text。
 */
export const getFileIconName = (fileName) => {
  if (!fileName) return 'file-text'

  const extension = fileName.toLowerCase().split('.').pop()
  const iconMap = {
    pdf: 'file-text',
    doc: 'file-text',
    docx: 'file-text',
    xls: 'file-text',
    xlsx: 'file-text',
    ppt: 'file-text',
    pptx: 'file-text',
    jpg: 'photo',
    jpeg: 'photo',
    png: 'photo',
    gif: 'photo',
    webp: 'photo',
    mp4: 'play-right',
    mov: 'play-right',
    mp3: 'volume',
    wav: 'volume',
  }

  return iconMap[extension] || 'file-text'
}
```

## 八、真正适合页面复用的，不是“低级 API”，而是“稳定返回结构”

这一点特别重要。

页面层最怕的不是 API 多，而是：

`每个函数返回值都长得不一样`

所以如果你真想把附件能力沉淀成复用技术，建议从一开始就统一返回这种结构：

```js
{
  success: true,
  data: {
    id: 'xxx',
    fileName: 'xxx.pdf',
    src: 'https://...'
  },
  message: '上传成功'
}
```

不管是：

1. 上传图片
2. 上传视频
3. 上传普通文件

都尽量统一成这套返回形状。

### 为什么这点这么重要

因为这样页面层后面可以直接写：

```js
const result = await uploadImageFile(filePath)

if (!result.success) {
  uni.showToast({
    title: result.message,
    icon: 'none',
  })
  return
}

formData.value.coverImage = result.data
```

而不用每次去猜：

1. `res.data`
2. `res.data[0]`
3. `res.data.data`
4. `res.msg`
5. `res.message`

## 九、这一篇最适合落到哪些场景

如果以后你要判断“这个能力值不值得放进项目复用技术”，我建议用一个简单标准：

`它是不是会在至少 3 个页面里重复出现？`

附件上传和预览几乎一定满足。

### 特别适合直接套这篇的场景

1. 发布页上传图片、视频、文件
2. OA / 审批上传附件
3. 作业 / 资料提交
4. 详情页附件预览
5. 文件卡片列表展示
6. 聊天文件消息展示

## 十、最容易踩的 12 个坑

### 1. 上传函数直接把后端原始结构透给页面

短期省事，长期最难维护。

### 2. 图片和文件预览完全分散在各个页面里

最终体验很不一致。

### 3. 文档预览失败后没有兜底

用户只会看到“打开失败”，没有下一步。

### 4. H5 端还在尝试用 `uni.openDocument`

这本来就不是它的主要打开方式。

### 5. 图片附件和普通文件用同一个粗暴判断

最后图片也被拿去下载。

### 6. 只靠文件后缀判断，不兼容 type / mime / fileType

很多后端字段命名不统一。

### 7. 上传失败只在 `fail` 里处理，不处理 HTTP 非 200

有些失败会被误判成“成功但解析错误”。

### 8. `uploadFileRes.data` 没判断字符串 / 对象

解析时经常出问题。

### 9. 文件大小直接展示字节数

用户几乎无法快速理解。

### 10. 图标映射各个页面各写一份

后面一改样式要全项目找。

### 11. token/header 由每个页面自己拼

维护成本很高。

### 12. 本地文件和远程文件不区分

最后预览逻辑全乱。

## 十一、建议的接入顺序

以后你再做附件能力，我建议固定按这个顺序来：

1. 先统一上传返回结构
2. 再统一预览分流逻辑
3. 再统一文件信息展示工具
4. 最后页面层只负责调用

这个顺序会比“先页面能跑再说”轻松很多。

## 十二、最后浓缩成一句话

如果只留一句总结，我会写：

`附件能力最值得沉淀的，不是某个 uploadFile 调用，而是“上传统一返回结构 + 智能预览分流 + 文件展示信息工具”这三层。`

只要先把这三层收口，以后换项目时，图片、文件、视频这类能力都会比零散写在页面里稳定得多。

## 参考资料

1. [uni.uploadFile 官方文档](https://uniapp.dcloud.net.cn/api/)
2. [uni.previewImage 官方文档](https://uniapp.dcloud.net.cn/api/media/image)
3. [uni.openDocument 官方文档](https://uniapp.dcloud.net.cn/api/file/file.html)
