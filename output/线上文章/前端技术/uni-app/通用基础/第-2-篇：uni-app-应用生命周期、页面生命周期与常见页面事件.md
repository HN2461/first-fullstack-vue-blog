---
title: "第 2 篇：uni-app 应用生命周期、页面生命周期与常见页面事件"
slug: "uni-app-uni-app-4049c58c"
summary: "从 App.vue 的应用生命周期、页面生命周期到常见页面事件，建立一套适用于 uni-app 多端项目的时序认知。"
category: "通用基础"
categoryPath:
  - "前端技术"
  - "uni-app"
  - "通用基础"
tags:
  - "uni-app"
  - "应用生命周期"
  - "页面生命周期"
  - "页面事件"
  - "App.vue"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291e8a2b1c68f2cac24c"
originalSlug: "uni-app-uni-app-4049c58c"
originalStatus: "published"
publishedAt: "2026-05-09T12:50:17.702Z"
updatedAt: "2026-07-31T11:16:23.666Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 2 篇：uni-app 应用生命周期、页面生命周期与常见页面事件

> 这是这一组 `uni-app 通用基础` 笔记的第 2 篇。  
> 这一篇先不讲微信、钉钉、支付宝的专属规则，而是先把所有 `uni-app` 项目都会用到的时序认知讲清楚。  
> 很多项目后期越来越乱，不是因为接口太多，而是因为"代码该写在哪个生命周期"从一开始就没想明白。

## 一、先说结论：uni-app 有两套最重要的时序

你平时最该先分清楚的是：

1. 应用生命周期
2. 页面生命周期

它们不是一回事。

更稳的理解方式是：

- `App.vue` 负责"整个应用什么时候启动、显示、隐藏"
- 页面负责"当前这个页面什么时候进入、显示、就绪、隐藏、销毁"

所以以后凡是遇到：

- 首次进入应用该做什么
- 从后台回前台该做什么
- 页面首次加载该做什么
- 从详情页返回列表该做什么

都不要混着写。

## 二、应用生命周期：只能在 `App.vue` 里看

uni-app 的应用生命周期，最常用的是这 6 个：

### 1. `onLaunch`

触发时机：

- 当 uni-app 初始化完成时触发（全局只触发一次）

参数：

- `onLaunch(options)`：参数为应用启动参数，同 `uni.getLaunchOptionsSync` 的返回值

`options` 参数包含（根据平台不同，字段有所差异）：

- `path`：启动的路径（代码包路径）
- `query`：启动时的 query 参数
- `scene`：启动时的场景值（App、web 端恒为 1001）
- `referrerInfo`：来源信息（如果没有则返回 `{}`）
- `channel`：渠道标识（仅 App 支持）
- `launcher`：应用启动来源（仅 App 支持）

适合做的事：

- 应用级初始化
- 读取启动场景和来源
- 根据启动参数做不同的初始化逻辑
- 初始化埋点、日志、全局服务

不适合做的事：

- 把大量页面逻辑塞进来
- 假设这里做完就能代表所有页面都准备好了

要记住一点：

`onLaunch` 是应用级入口，不是某个页面的入口。

示例：

```javascript
// App.vue
export default {
  onLaunch(options) {
    console.log('启动路径:', options.path)
    console.log('启动参数:', options.query)
    console.log('场景值:', options.scene)
    
    // 初始化全局配置
    this.initGlobalConfig()
  }
}
```

### 2. `onShow`

触发时机：

- 当 uni-app 启动，或从后台进入前台显示

参数：

- `onShow(options)`：参数为应用启动参数，同 `uni.getLaunchOptionsSync` 的返回值

适合做的事：

- 刷新应用级状态
- 检查登录恢复
- 检查是否需要重新拉全局配置
- 处理启动场景或回流参数

示例：

```javascript
// App.vue
export default {
  onShow(options) {
    console.log('应用显示，路径:', options.path)
    // 从后台回到前台，检查登录状态
    this.checkLoginStatus()
  }
}
```

### 3. `onHide`

触发时机：

- 应用从前台进入后台

适合做的事：

- 记录离开时间
- 持久化关键轻量状态
- 停止应用级轮询或定时任务

### 4. `onError`

触发时机：

- 当 uni-app 报错时触发

适合做的事：

- 全局错误日志上报
- 错误监控与埋点
- 降级处理或友好提示

注意：

- `app-uvue` 不支持 `onError`

示例：

```javascript
// App.vue
export default {
  onError(err) {
    console.error('应用错误:', err)
    // 上报错误日志
    this.reportError(err)
  }
}
```

### 5. `onPageNotFound`

触发时机：

- 页面不存在时触发

注意：

- 官方文档说明：「页面实际上已经打开了（比如通过分享卡片、小程序码）且发现页面不存在，才会触发，api 跳转不存在的页面不会触发（如 uni.navigateTo）」
- 可以在这里做重定向到首页或进入客户端原生 404 页面
- 如果回调中又重定向到另一个不存在的页面，将推入客户端原生的页面不存在提示页面，并且不再第二次回调
- `app-uvue` 不支持 `onPageNotFound`

示例：

```javascript
// App.vue
export default {
  onPageNotFound(res) {
    console.log('页面不存在:', res)
    // 重定向到首页
    uni.reLaunch({
      url: '/pages/index/index'
    })
  }
}
```

### 6. `onUnhandledRejection`

触发时机：

- 未处理的 Promise 拒绝事件（2.8.1+ 版本支持）

适合做的事：

- 捕获异步错误
- Promise 异常监控

注意：

- `app-uvue` 暂不支持 `onUnhandledRejection`

示例：

```javascript
// App.vue
export default {
  onUnhandledRejection(res) {
    console.error('未处理的 Promise 错误:', res)
    // 上报异步错误
    this.reportAsyncError(res)
  }
}
```

最重要的一条规则是：

`应用生命周期只能在 App.vue 里监听，在其它页面里写应用生命周期没有意义。`

## 三、页面生命周期：把它想成"页面路由驱动的状态机"

`uni-app` 页面除支持 Vue 组件生命周期（如 `mounted`、`destroyed` 等）外，还支持下方页面生命周期函数。

这些页面特有的钩子是 **Vue 组件生命周期的补充，而非替代**。

页面最常用的生命周期有 5 个：

### 1. `onLoad`

触发时机：

- 监听页面加载，该钩子被调用时，响应式数据、计算属性、方法、侦听器、props、slots 已设置完成
- 一个页面只会调用一次

参数：

- `onLoad(options)`：参数为上个页面传递的数据，参数类型为 Object（用于页面传参）

适合做的事：

- 接收路由参数
- 发起首屏请求
- 初始化页面状态

不适合做的事：

- 依赖页面已经渲染完成的节点操作
- 塞入很重的同步计算

示例：

```javascript
onLoad(options) {
  // 接收路由参数
  const id = options.id
  const type = options.type
  // 发起首屏请求
  this.loadPageData(id, type)
}
```

### 2. `onShow`

这是页面里最容易被低估的一个钩子。

触发时机：

- 监听页面显示，页面每次出现在屏幕上都触发
- 包括从下级页面点返回露出当前页面

适合做的事：

- 返回页面后的数据刷新
- 重新校验页面级状态
- 页面重新露出后的轻量恢复

示例场景：

```javascript
onShow() {
  // 从详情页返回列表页，刷新列表数据
  if (this.needRefresh) {
    this.refreshList()
    this.needRefresh = false
  }
}
```

### 3. `onReady`

触发时机：

- 监听页面初次渲染完成
- 此时组件已挂载完成，DOM 树已可用
- 注意如果渲染速度快，会在页面进入动画完成前触发

可以把它理解成：

`页面第一次渲染基本完成。`

适合做的事：

- 依赖页面已经渲染出来的操作
- 获取节点信息
- 做首屏之后的次级动作

示例：

```javascript
onReady() {
  // 获取节点信息
  const query = uni.createSelectorQuery().in(this)
  query.select('#myElement').boundingClientRect(data => {
    console.log('节点信息:', data)
  }).exec()
}
```

### 4. `onHide`

触发时机：

- 监听页面隐藏

适合做的事：

- 暂停轮询
- 暂停动画或播放器
- 移除页面级事件监听

示例：

```javascript
onHide() {
  // 暂停轮询
  if (this.timer) {
    clearInterval(this.timer)
  }
}
```

### 5. `onUnload`

触发时机：

- 监听页面卸载

适合做的事：

- 清理定时器
- 解绑监听
- 销毁页面私有资源

示例：

```javascript
onUnload() {
  // 清理定时器
  if (this.timer) {
    clearInterval(this.timer)
    this.timer = null
  }
  // 解绑事件监听
  uni.$off('customEvent', this.handleEvent)
}
```

## 四、你最容易写错的，不是钩子名，而是"代码落点"

我更推荐你用下面这张表来放代码：

| 你要做的事 | 更适合放哪 |
| --- | --- |
| 应用首次初始化 | `App.vue` 的 `onLaunch` |
| 应用回前台恢复 | `App.vue` 的 `onShow` |
| 全局错误捕获 | `App.vue` 的 `onError` |
| 接收路由参数 | 页面 `onLoad` |
| 首次请求页面数据 | 页面 `onLoad` |
| 返回页面后刷新数据 | 页面 `onShow` |
| 操作页面节点 | 页面 `onReady` |
| 暂停页面任务 | 页面 `onHide` |
| 页面清理销毁 | 页面 `onUnload` |

如果你老是纠结"这段代码该放哪里"，多数时候不是 API 难，而是没有先判断这段逻辑到底属于：

- 应用级
- 页面首次进入
- 页面重复显示
- 页面销毁清理

## 五、别把页面生命周期和 Vue 组件生命周期硬混

这是 uni-app 新手很容易踩的坑。

页面有页面自己的生命周期，组件也有组件自己的生命周期。

更直白一点：

- 页面生命周期更偏"路由驱动"
- 组件生命周期更偏"组件创建与销毁驱动"

所以以后不要把下面两件事混成一个问题：

1. 页面什么时候显示
2. 组件什么时候挂载

页面切换回来时，很多时候是页面 `onShow` 再次触发，但不代表你页面里每个组件都重新创建了一遍。

这也是为什么很多"返回后刷新"的逻辑更适合写在页面 `onShow`，而不是只盯着组件的 `mounted`。

### 特别注意：应用级 `onShow` 和页面级 `onShow` 的区别

虽然名字相同，但它们的触发时机和作用域完全不同：

**应用级 `onShow`（App.vue）：**
- 触发时机：应用从后台回到前台
- 作用域：整个应用
- 适合做：全局状态恢复、登录检查、全局配置刷新

**页面级 `onShow`（页面.vue）：**
- 触发时机：页面每次显示（包括首次进入、从其他页面返回）
- 作用域：当前页面
- 适合做：页面数据刷新、页面状态恢复

举例说明：

```javascript
// App.vue - 应用级
export default {
  onShow() {
    console.log('应用回到前台')
    // 这里只在"应用从后台回前台"时触发
    // 页面之间的跳转不会触发这里
  }
}

// pages/list/list.vue - 页面级
export default {
  onShow() {
    console.log('列表页显示')
    // 这里在"列表页每次显示"时触发
    // 包括：首次进入、从详情页返回
  }
}
```

实际场景：

- 用户在列表页 → 跳转到详情页 → 返回列表页
  - 应用级 `onShow`：**不触发**（应用一直在前台）
  - 列表页 `onShow`：**触发**（列表页重新显示）

- 用户按 Home 键退出应用 → 重新打开应用
  - 应用级 `onShow`：**触发**（应用回到前台）
  - 当前页面 `onShow`：**触发**（页面重新显示）

## 六、除了 5 个主生命周期，页面事件也很常用

如果你长期维护 uni-app 项目，下面这些页面事件也要尽早熟悉。

说明：官方文档将 `onPullDownRefresh`、`onReachBottom`、`onPageScroll`、`onTabItemTap` 等归类在「页面生命周期」表格中。这里将它们单独归为「页面事件」，是基于工程实践中的认知分层，便于理解它们与主生命周期的区别。

### 1. `onPullDownRefresh`

适合下拉刷新场景。

建议：

- 统一抽成 `refreshPageData`
- 刷新结束后记得主动关闭下拉刷新状态

示例：

```javascript
onPullDownRefresh() {
  // 刷新数据
  this.refreshPageData().then(() => {
    // 关闭下拉刷新
    uni.stopPullDownRefresh()
  })
}
```

### 2. `onReachBottom`

适合分页加载。

建议不要把它当成"到了底就无脑请求下一页"，而是先判断：

- 是否正在加载
- 是否还有下一页
- 是否需要节流

示例：

```javascript
onReachBottom() {
  // 防止重复加载
  if (this.loading || !this.hasMore) {
    return
  }
  this.loading = true
  this.loadMore().finally(() => {
    this.loading = false
  })
}
```

### 3. `onPageScroll`

适合：

- 吸顶
- 滚动进度
- 返回顶部按钮

但不要在里面塞太重的逻辑。

示例：

```javascript
onPageScroll(e) {
  // 显示/隐藏返回顶部按钮
  this.showBackTop = e.scrollTop > 300
}
```

### 4. `onTabItemTap`

只在 `tabBar` 页面更常见。

适合处理：

- 点击当前 tab 重新刷新
- 回到列表顶部
- 重置筛选状态

示例：

```javascript
onTabItemTap(item) {
  console.log('点击的 tab:', item)
  // 如果点击的是当前 tab，刷新数据
  if (item.index === this.currentTabIndex) {
    this.refreshData()
  }
}
```

## 七、记住一个最常见的时序链路

对大多数多页应用来说，先记这一条就够用了：

`应用启动 -> App onLaunch -> App onShow -> 页面 onLoad -> 页面 onShow -> 页面 onReady -> 跳转新页面 -> 当前页 onHide -> 新页面 onLoad -> 新页面 onShow -> 返回 -> 新页面 onUnload -> 原页面 onShow`

你把这个链条记住后，很多问题就会自然想通：

- 为什么列表页回来的时候又触发了 `onShow`
- 为什么有些数据应该放在 `onLoad`
- 为什么有些状态恢复不能只看页面首次进入

## 八、做公司项目时，我更建议你守住这 8 条规则

1. 应用级初始化放 `App.vue`，不要塞进任意页面。
2. 页面首次取参和首屏请求，优先放 `onLoad`。
3. 返回页后的刷新逻辑，优先考虑 `onShow`。
4. 节点相关或依赖页面已渲染的逻辑，优先放 `onReady`。
5. 页面隐藏时暂停任务，页面销毁时彻底清理。
6. 不要把页面生命周期和组件生命周期混着理解。
7. `onReachBottom`、`onPageScroll` 这类高频事件里不要写重逻辑。
8. 页面时序一旦写乱，后面再补缓存、登录、恢复逻辑都会越来越难。

## 九、这篇后面最适合接哪几类内容

把生命周期理顺以后，后面更适合继续看：

1. 工程结构与配置基础
2. 路由与页面栈思维
3. 请求、缓存与状态恢复
4. 平台专属生命周期和宿主行为

也就是说：

`生命周期不是孤立知识，它其实是所有状态管理和页面交互的时间轴。`

## 参考资料

- [App.vue / App.uvue](https://uniapp.dcloud.net.cn/collocation/App.html)
- [应用生命周期](https://uniapp.dcloud.net.cn/api/lifecycle.html)
- [页面](https://uniapp.dcloud.net.cn/tutorial/page.html)
- [pages.json 页面路由](https://uniapp.dcloud.net.cn/collocation/pages.html)
