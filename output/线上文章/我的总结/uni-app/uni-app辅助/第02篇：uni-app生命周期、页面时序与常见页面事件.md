---
title: "第02篇：uni-app生命周期、页面时序与常见页面事件"
slug: "uni-app-uni-app-8c6d7ba1"
summary: "从应用生命周期、页面生命周期到下拉刷新、触底加载、页面滚动等常见页面事件出发，系统梳理 uni-app 项目里最核心的时序认知与落点选择。"
category: "uni-app辅助"
categoryPath:
  - "我的总结"
  - "uni-app"
  - "uni-app辅助"
tags:
  - "uni-app"
  - "生命周期"
  - "页面时序"
  - "onLoad"
  - "onShow"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291f8a2b1c68f2cac468"
originalSlug: "uni-app-uni-app-8c6d7ba1"
originalStatus: "published"
publishedAt: "2026-05-08T13:22:12.473Z"
updatedAt: "2026-06-14T06:31:52.522Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
## uni-app 生命周期、页面时序与常见页面事件

> 这一篇最重要的目标，不是把几个生命周期名字背下来，而是把一个项目里“代码到底该写在哪个时机”这件事讲清楚。  
> 很多 uni-app 项目后期越来越乱，不是因为接口太多，也不是因为组件太多，而是因为从一开始就没把时序想明白。  
> 一旦时序没立住，后面就会出现：页面该刷新时不刷新、初始化逻辑重复跑、前后台恢复状态错乱、返回上一页数据不对、页面销毁后定时器还在跑。

## 一、先把一个总原则记住
`uni-app` 最核心的时序，不是一套，而是两套：

1. 应用生命周期
2. 页面生命周期

它们解决的不是同一个问题。

### 应用生命周期回答的是

+ 整个应用什么时候启动
+ 什么时候进入前台
+ 什么时候进入后台

### 页面生命周期回答的是

+ 当前这个页面什么时候进入
+ 什么时候显示
+ 什么时候完成首屏渲染
+ 什么时候隐藏
+ 什么时候销毁

如果你不先把这两层拆开，后面任何具体 API 都会越写越乱。

## 二、应用生命周期：先理解“整个应用”的时序
应用生命周期主要写在 `App.vue` 里。

最常见的 3 个是：

+ `onLaunch`
+ `onShow`
+ `onHide`

### 1. `onLaunch`
它代表的是应用级第一次启动。

适合放：

+ 应用级初始化
+ 本地配置恢复
+ 全局服务初始化
+ 全局埋点、日志、错误监听
+ 启动参数处理

不适合放：

+ 某个具体页面的请求
+ 某个列表页的初始化逻辑
+ 假设所有页面节点已经准备好的代码

示例：

```javascript
export default {
  onLaunch() {
    const token = uni.getStorageSync('token')
    if (token) {
      console.log('恢复本地登录态')
    }
    console.log('初始化应用级服务')
  }
}
```

### 2. `onShow`
它在两种场景最常见：

+ 应用启动后第一次进入前台
+ 应用从后台重新回到前台

它适合处理的是“应用级恢复动作”，比如：

+ 重新检查登录态
+ 检查配置是否需要刷新
+ 处理回流参数
+ 恢复全局状态

要特别记住一点：

`App.vue` 的 `onShow` 和某个页面的 `onShow` 不是一回事。

### 3. `onHide`
应用进入后台时触发。

适合做：

+ 记录离开时间
+ 持久化少量关键状态
+ 暂停应用级轮询
+ 暂停不必要任务

不建议在这里堆很多重量级清理，因为它不是“页面销毁”，而是“应用暂时不可见”。

## 三、页面生命周期：把它理解成“页面路由状态机”
页面生命周期最常见的有：

+ `onLoad`
+ `onShow`
+ `onReady`
+ `onHide`
+ `onUnload`

它们本质上是围绕“当前页面”的路由状态变化来触发的。

## 四、`onLoad`、`onShow`、`onReady` 必须真正分清
这是最容易写错的三兄弟。

| 生命周期 | 典型触发时机 | 更适合做什么 | 不适合做什么 |
| --- | --- | --- | --- |
| `onLoad` | 页面首次加载 | 接路由参数、一次性初始化、首屏请求 | 依赖节点渲染完成的操作 |
| `onShow` | 页面每次重新显示 | 回流刷新、状态校验、轻量恢复 | 很重的首次初始化 |
| `onReady` | 页面首次渲染完成 | 获取节点、初始化 canvas、依赖首屏渲染的动作 | 普通接口初始化 |

### 1. `onLoad`
`onLoad` 最核心的价值是两件事：

+ 接收页面参数
+ 做页面首次进入的一次性初始化

示例：

```javascript
export default {
  data() {
    return {
      id: '',
      detail: null
    }
  },
  onLoad(options) {
    this.id = options.id || ''
    this.fetchDetail()
  },
  methods: {
    fetchDetail() {
      uni.request({
        url: `/api/detail?id=${this.id}`,
        success: (res) => {
          this.detail = res.data
        }
      })
    }
  }
}
```

这段逻辑为什么放在 `onLoad`？

因为：

+ 它依赖路由参数
+ 它只需要页面首次进来时初始化一次

### 2. `onShow`
`onShow` 容易被低估，但真实项目里非常重要。

它适合做的是“页面重新露出后的判断和刷新”，例如：

+ 从详情页返回列表页后刷新列表
+ 登录完成后回到来源页重新获取用户状态
+ 从权限设置页返回后重新判断权限
+ 页面回流后重新检查某个局部状态

示例：

```javascript
export default {
  onShow() {
    if (this.needRefresh) {
      this.refreshList()
    }
  },
  methods: {
    refreshList() {
      uni.request({
        url: '/api/list',
        success: (res) => {
          this.list = res.data.list || []
        }
      })
    }
  }
}
```

最常见的误区是：

`很多人把所有请求都放在 onLoad，结果从别的页面返回后，页面该刷新却没刷新。`

### 3. `onReady`
`onReady` 更偏向“页面已经完成首次渲染，可以开始做依赖页面节点的操作”。

适合：

+ 获取节点尺寸
+ 操作 canvas
+ 启动依赖节点挂载完成的逻辑
+ 调用依赖页面视图存在的组件方法

例如：

```javascript
export default {
  onReady() {
    const query = uni.createSelectorQuery().in(this)
    query.select('.poster').boundingClientRect((rect) => {
      console.log('节点尺寸', rect)
    }).exec()
  }
}
```

如果你把这种逻辑过早放在 `onLoad`，很可能页面节点还没准备好。

## 五、`onHide` 和 `onUnload` 的区别也很重要
很多人会把这两个钩子混掉。

### 1. `onHide`
表示页面暂时不可见。

更适合：

+ 暂停轮询
+ 暂停动画、音视频
+ 暂停页面级监听

### 2. `onUnload`
表示页面真的要被销毁。

更适合：

+ 清理定时器
+ 解绑监听
+ 释放页面私有资源

简单记忆：

+ `onHide` 是暂时离场
+ `onUnload` 是真正退场

## 六、为什么很多项目会把生命周期写乱
最常见的原因通常有 5 个：

1. 把所有逻辑都堆进 `onLoad`
2. 不理解“页面返回时 onLoad 不一定再执行”
3. 把应用级恢复逻辑错放到页面里
4. 不知道节点相关操作应该延后到 `onReady`
5. 页面离开后没有在 `onUnload` 做清理

一旦这些问题叠在一起，项目就会出现：

+ 回来不刷新
+ 首次进页面太重
+ 定时器重复跑
+ 页面切走后逻辑还没停
+ 前后台恢复后状态错乱

## 七、常见页面事件也要和生命周期一起理解
除了主生命周期，页面事件在真实项目里也非常高频。

### 1. `onPullDownRefresh`
适合做下拉刷新。

更稳的写法是把刷新逻辑统一收成一个方法：

```javascript
export default {
  onPullDownRefresh() {
    this.refreshPageData()
  },
  methods: {
    refreshPageData() {
      uni.request({
        url: '/api/list',
        success: (res) => {
          this.list = res.data.list || []
        },
        complete: () => {
          uni.stopPullDownRefresh()
        }
      })
    }
  }
}
```

这里要记住：

+ 刷新完成后要主动结束下拉状态
+ 刷新逻辑最好和首屏请求逻辑复用，不要写两套

### 2. `onReachBottom`
常用于分页加载。

但不要理解成“触底就无脑请求下一页”，至少要考虑：

+ 是否正在加载
+ 是否还有下一页
+ 是否需要节流

更稳的写法：

```javascript
export default {
  data() {
    return {
      page: 1,
      loading: false,
      finished: false,
      list: []
    }
  },
  onReachBottom() {
    if (this.loading || this.finished) return
    this.loadMore()
  },
  methods: {
    loadMore() {
      this.loading = true
      uni.request({
        url: `/api/list?page=${this.page + 1}`,
        success: (res) => {
          const nextList = res.data.list || []
          if (!nextList.length) {
            this.finished = true
            return
          }
          this.page += 1
          this.list = this.list.concat(nextList)
        },
        complete: () => {
          this.loading = false
        }
      })
    }
  }
}
```

### 3. `onPageScroll`
常用于：

+ 吸顶
+ 返回顶部按钮显隐
+ 滚动进度条
+ 顶部透明度变化

但要注意：

+ 高频触发，别在里面做重计算
+ 别每次滚动都大范围改响应式数据

## 八、页面生命周期和组件生命周期不是一回事
这是 uni-app 很容易混的一点。

页面生命周期更偏“路由驱动”，组件生命周期更偏“组件实例驱动”。

所以：

+ 页面重新显示，不代表里面所有组件都重新创建
+ 组件挂载了，也不代表页面时序问题就解决了

这也是为什么“返回上一页刷新列表”这种问题，通常更应该先看页面 `onShow`，而不是只盯着组件 `mounted`。

## 九、到底怎么判断一段代码该放哪
我更建议你按“这段逻辑属于谁”来判断，而不是死记钩子名。

| 逻辑类型 | 更适合放哪里 |
| --- | --- |
| 应用首次初始化 | `App.vue` 的 `onLaunch` |
| 应用从后台恢复 | `App.vue` 的 `onShow` |
| 页面接收参数 | 页面 `onLoad` |
| 页面首次拉数据 | 页面 `onLoad` |
| 页面回流后刷新 | 页面 `onShow` |
| 操作节点 / canvas | 页面 `onReady` |
| 暂停页面级任务 | 页面 `onHide` |
| 销毁页面资源 | 页面 `onUnload` |

## 十、这一篇最后要落下的核心共识
如果只记最重要的，我建议你记下面这些：

1. `uni-app` 里应用生命周期和页面生命周期必须分开理解。
2. `onLoad` 负责首次进入和参数初始化，`onShow` 负责回流刷新，`onReady` 负责节点依赖逻辑。
3. `onHide` 是暂时不可见，`onUnload` 才是真正销毁。
4. 下拉刷新、触底加载、页面滚动这些页面事件，应该和主生命周期一起配合设计。
5. 真正稳定的项目，不是把所有逻辑塞进某一个钩子，而是先判断这段逻辑到底属于应用级、页面首次进入、页面回流还是页面销毁。
