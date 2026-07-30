---
title: "uni-app 跨端开发通用方法：路由、请求、缓存、上传下载与条件编译"
slug: "uni-app-uni-app-66402eae"
summary: "从路由、请求、缓存、上传下载到条件编译与平台适配，梳理一套适用于 uni-app 多端项目的通用开发方法。"
category: "通用基础"
categoryPath:
  - "前端技术"
  - "uni-app"
  - "通用基础"
tags:
  - "uni-app"
  - "路由"
  - "条件编译"
  - "请求"
  - "缓存"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291e8a2b1c68f2cac25a"
originalSlug: "uni-app-uni-app-66402eae"
originalStatus: "published"
publishedAt: "2026-05-09T12:50:17.704Z"
updatedAt: "2026-06-13T10:28:27.950Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# uni-app 跨端开发通用方法：路由、请求、缓存、上传下载与条件编译

> 这是这一组 `uni-app 通用基础` 笔记的第 4 篇。  
> 前面几篇已经把"uni-app 是什么""生命周期""工程结构"立住了，这一篇开始往日常开发落。  
> 它不先讲微信、钉钉的独有能力，而是先讲所有 uni-app 项目都会高频遇到的通用方法。

## 一、先说结论：跨端项目最稳的写法，不是"所有页面都懂平台"，而是"业务层尽量无平台感"

很多项目后期越来越难维护，不是因为业务真的特别复杂，而是因为：

- 页面里散着写请求
- 页面里散着写缓存
- 页面里散着写上传下载
- 页面里散着写平台专属 API

最后就会变成：

- 改一个登录逻辑，十几个页面一起改
- 换一个平台，满项目找 `wx.*`
- 某个平台权限或能力变更，根本不知道影响了哪里

更稳的开发方法应该是：

1. 业务层描述"我要什么能力"
2. 通用层优先用 `uni.*`
3. 平台差异用条件编译和适配层单点收口

## 二、路由先分清 5 个最常用方法

### 1. `uni.navigateTo`

适合：打开新页面（保留当前页面在页面栈中）。

**注意**：页面栈有层级限制，通常最多 10 层。如果已经打开了 10 个页面，再调用 `navigateTo` 会失败。

### 2. `uni.redirectTo`

适合：替换当前页面（关闭当前页面，不保留在页面栈中）。

### 3. `uni.switchTab`

适合：跳转到 `tabBar` 页面（会关闭所有非 tabBar 页面）。

### 4. `uni.reLaunch`

适合：清空页面栈后进入新页面（关闭所有页面，包括 tabBar 页面）。

### 5. `uni.navigateBack`

适合：返回上级页面（可通过 `delta` 参数指定返回层数）。

最重要的一条路由规则是：

`tabBar 页面只能用 switchTab 跳，不能用 navigateTo 和 redirectTo。`

所以业务里以后遇到：

- 登录后进首页
- 详情页回列表
- 从活动页回主 tab

你先别急着写代码，先判断：

`目标到底是普通页面，还是 tabBar 页面。`

### 页面栈管理建议

如果你的业务流程会连续打开多个页面（比如：列表 → 详情 → 评论 → 回复），建议：

- 超过 3-4 层时考虑用 `redirectTo` 替换中间页面
- 或者在关键节点用 `reLaunch` 重置页面栈
- 避免无限 `navigateTo` 导致页面栈溢出

## 三、请求不要散着写，统一封装比"每页都会写"更重要

官方文档里提到，`uni.request` 是通用请求入口，网络超时时间也可以统一在 `manifest.json` 里配置。

所以更推荐的思路是：

### 1. 页面里别直接到处写裸 `uni.request`

页面最好只写：

- 调服务方法
- 处理结果展示
- 处理加载态、空态、异常态

### 2. 请求层单独封装

例如：

```js
export function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: options.method || 'GET',
      data: options.data,
      header: options.header,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    })
  })
}
```

### 3. 把通用规则统一进去

例如：

- baseURL
- token 注入
- 统一错误处理
- 超时提示
- 登录失效处理

这样以后平台变了、接口规则变了，改一层就够了。

### 4. 网络超时配置

在 `manifest.json` 中可以统一配置各类网络请求的超时时间：

```json
{
  "networkTimeout": {
    "request": 60000,
    "connectSocket": 60000,
    "uploadFile": 60000,
    "downloadFile": 60000
  }
}
```

这样可以避免在每个请求里单独设置超时，统一管理更方便。

## 四、本地缓存不是"会存就行"，而是要先分类型

很多项目的缓存问题，不是不会用 `uni.setStorage`，而是"什么都想存"。

我更推荐你先把缓存分 3 类：

### 1. 可长期稳定复用的轻量配置

例如：

- 主题偏好
- 搜索历史
- 最近使用记录

### 2. 可以短期复用，但必须校验时效的数据

例如：

- 某些字典
- 某些筛选条件
- 列表快照

### 3. 不适合长期缓存的运行时状态

例如：

- 页面临时 loading 状态
- 当前弹窗开关
- 某次接口过程中的中间变量

不要把第 3 类硬塞进缓存，否则后面最容易出现：

- 页面重进状态错乱
- 老数据覆盖新状态
- 用户明明退出了，缓存还残留旧身份

### 缓存容量限制

**重要提示**：不同平台的本地缓存有容量限制：

- **微信小程序**：单个 key 最大 1MB，总容量限制 10MB
- **支付宝小程序**：单个 key 最大 200KB，总容量限制 10MB
- **App 端**：无明确限制，但建议控制在合理范围

所以缓存设计时要注意：

- 不要存储大量数据或大文件
- 定期清理过期缓存
- 重要数据考虑服务端存储
- 可以用 `uni.getStorageInfo` 查看当前缓存使用情况

## 五、上传下载要带着"临时文件思维"去写

官方文档里专门提到：

`下载得到的文件路径很多时候是临时路径，如需持久使用，需要主动保存。`

这意味着你做上传下载时要分清 3 件事：

### 1. 这是临时用一次，还是要长期保留

### 2. 这是页面内流程，还是用户资产

### 3. 失败后要不要支持重试或回退

更推荐的做法是：

- 上传统一用服务层封装
- 下载和预览拆开
- 需要长期使用的文件，单独走保存逻辑

### 临时文件处理示例

```js
// 选择图片后上传
uni.chooseImage({
  success: (res) => {
    // res.tempFilePaths 是临时文件路径数组
    const tempFilePath = res.tempFilePaths[0]
    
    // 上传到服务器
    uni.uploadFile({
      url: 'https://example.com/upload',
      filePath: tempFilePath,
      name: 'file',
      success: (uploadRes) => {
        console.log('上传成功', uploadRes.data)
      }
    })
  }
})

// 下载文件并持久化保存
uni.downloadFile({
  url: 'https://example.com/file.pdf',
  success: (res) => {
    if (res.statusCode === 200) {
      // res.tempFilePath 是临时文件路径
      // 需要持久化保存
      uni.saveFile({
        tempFilePath: res.tempFilePath,
        success: (saveRes) => {
          console.log('保存成功', saveRes.savedFilePath)
          // saveRes.savedFilePath 是永久路径
        }
      })
    }
  }
})
```

**关键点**：

- `uni.chooseImage`、`uni.chooseVideo` 等选择文件的 API 返回的都是临时路径
- `uni.downloadFile` 下载的文件也是临时路径
- 临时文件可能会被系统清理，需要持久化时必须用 `uni.saveFile`
- 上传时直接使用临时路径即可，不需要先保存

## 六、条件编译是长期维护项目最重要的朋友之一

做 uni-app 很多人一开始不愿意写条件编译，觉得"这样不优雅"。

但长期维护后你会发现：

`真正不优雅的，不是写 #ifdef，而是把平台代码散在全项目里。`

更推荐的原则是：

### 1. 能用 `uni.*` 的，先用 `uni.*`

### 2. 只有平台专属能力时，再写平台代码

### 3. 平台代码一定要收口

例如：

```js
export function requestSubscribe() {
  // #ifdef MP-WEIXIN
  return wx.requestSubscribeMessage({
    tmplIds: ['模板id']
  })
  // #endif

  return Promise.resolve(null)
}
```

这样业务页只知道"我要申请订阅消息"，而不需要自己知道这是微信专属能力。

## 七、什么时候该用运行时判断，什么时候该用编译时判断

这一点也很关键。

### 更适合编译时判断的场景

- 某个平台根本不应该编进去的代码
- 某个平台专属组件
- 某个平台专属 API
- 某个平台专属样式或配置

### 更适合运行时判断的场景

- 当前环境是开发还是生产
- 某个功能是否开启
- 某个接口结果决定页面行为

简单说：

- `条件编译` 更偏"这段代码该不该进包"
- `运行时判断` 更偏"代码进包后要不要执行"

## 八、我更推荐的一种通用能力组织方式

如果项目会长期做多端，我更建议你把常用能力按下面方式收：

```text
services/
  request.js
  auth.js
  upload.js
  download.js
  storage.js
platform/
  weixin.js
  dingding.js
utils/
  route.js
  env.js
```

这样职责会更清楚：

- `services` 管通用能力
- `platform` 管平台差异
- `utils` 管纯工具

## 九、把这一篇压成 13 条通用开发规则

1. 业务层尽量不要直接和平台 API 绑死。
2. 页面跳转前先分清普通页和 `tabBar` 页。
3. 注意页面栈层级限制（通常最多 10 层），避免无限 `navigateTo`。
4. 请求统一封装，不要每页散着写裸请求。
5. 在 `manifest.json` 中统一配置网络超时时间。
6. 缓存先分类型，再决定要不要存。
7. 注意不同平台的缓存容量限制（通常 10MB），定期清理过期数据。
8. 运行时状态不要滥存成本地缓存。
9. 上传下载要带着"临时文件"意识去设计流程。
10. 能用 `uni.*` 的能力先用 `uni.*`。
11. 平台专属能力必须单点收口。
12. 能编译时排除的差异，不要等运行时才判断。
13. 多端项目真正稳定的关键，不是少写代码，而是少写散代码。

## 十、这一篇后面最适合接什么

如果把通用方法理顺了，后面就可以非常自然地进入平台篇：

1. 微信小程序专属登录与宿主能力
2. 微信/钉钉等平台的开发工具联调
3. 平台专属权限、支付、分享、消息订阅
4. 平台专属性能与包体治理

这也是我更推荐的知识顺序：

`先学怎么写共性，再学每个平台到底多了什么差异。`

## 参考资料

- [uni.request](https://uniapp.dcloud.net.cn/api/request/request.html)
- [uni.uploadFile / uni.downloadFile](https://uniapp.dcloud.net.cn/api/request/network-file)
- [pages.json 页面路由](https://uniapp.dcloud.net.cn/collocation/pages.html)
- [开发环境和生产环境](https://uniapp.dcloud.net.cn/worktile/running-env)
- [uni-app 组成和跨端原理](https://uniapp.dcloud.net.cn/tutorial/index.html)
