---
title: "第 4 篇：uni-app 自定义 tabBar 与角标同步封装：角色配置、安全区适配、页面路径、全局刷新"
slug: "uni-app-uni-app-tabbar-a0f11cca"
summary: "uni-app 自定义 tabBar 与角标同步封装实战，覆盖角色化配置、角标同步、安全区适配、页面路径归一化和全局刷新机制。"
category: "uni-app"
tags:
  - "uni-app"
  - "tabBar"
  - "角标"
  - "安全区"
  - "全局状态"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d29208a2b1c68f2cac6f4"
originalSlug: "uni-app-uni-app-tabbar-a0f11cca"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 4 篇：uni-app 自定义 tabBar 与角标同步封装：角色配置、安全区适配、页面路径、全局刷新

> 这是 `项目复用技术 / uni-app` 目录下的第 4 篇。  
> 这一篇不讲某一个来源工具文件，也不讲某个具体 tabBar 页面，而是直接把这组能力整理成一套通用手册：
>
> `tabBar 配置、角色切换、当前页选中态、角标同步、安全区适配、全局刷新`

> 你以后很可能都会在这些场景里遇到它：
>
> 1. 学生端和教师端 tabBar 不一样
> 2. 家长模式和学生模式共用一套底部栏
> 3. 自定义 tabBar 组件需要同步未读角标
> 4. 某个页面收到了新消息，要让 tabBar 角标立刻刷新
> 5. iPhone 刘海屏、底部手势条设备上，底部按钮要避开安全区

> 这篇文章的目标不是教你把 tabBar 画出来，而是沉淀一套：
>
> `以后再做多角色 tabBar、badge 同步和底部适配时可以直接照着搭的方案`

## 一、先把问题讲透：为什么 tabBar 相关代码特别容易越写越散

很多人刚开始做 tabBar 时，脑子里想得很简单：

1. 配几项菜单
2. 点了跳页面
3. 哪一项选中就高亮
4. 有未读就加个角标

看起来很简单，但一旦页面角色、badge 和底部布局变复杂，就会立刻出现很多分支：

1. 学生端和教师端的 tabBar 配置一样吗？
2. 家长代看学生时，底部栏是不是又要切一种模式？
3. 当前页路径里如果带参数，怎么判断当前选中项？
4. 角标到底是存在本地、存在全局状态，还是每个页面各算一遍？
5. 自定义 tabBar 的角标和系统 tabBar 角标怎么保持一致？
6. 安全区高度不同，底部距离应该怎么统一算？
7. 如果某个非 tab 页面里收到了新消息，tabBar 怎么同步刷新？

你会发现，tabBar 的复杂度其实不在“画几个按钮”，而在：

`配置中心化 + 当前路由匹配 + 全局角标同步 + 安全区适配`

这也是为什么很多应用里 tabBar 最后会变成一堆分散代码：

```txt
页面 A 自己写选中判断
+ 页面 B 自己写 badge
+ 页面 C 自己写 safe-area-bottom
+ 页面 D 再硬编码一套角色 tab 配置
```

短期能跑，但只要一改角色配置或角标逻辑，就会牵一大片。

## 二、先给结论：tabBar 最适合拆成 4 层

如果这一篇你只记住一句话，我希望是：

`tabBar 不应该按页面拆，而应该按“配置、同步、布局、页面接入”这四层拆。`

我建议固定拆成 4 层：

1. `配置层`
   只负责 tab 项配置、角色差异、路径归一化
2. `角标同步层`
   只负责未读数存储、设置角标、广播刷新事件
3. `安全区布局层`
   只负责底部 inset 计算和统一偏移量
4. `组件接入层`
   只负责组件怎么渲染，页面怎么消费上面三层

这 4 层拆开以后，后面无论你是：

1. 改 tabBar 样式
2. 换角色配置
3. 加新的 badge
4. 调整底部安全区

都不用每个页面去找。

## 三、第一层：tabBar 配置为什么一定要集中管理

很多人最开始会把 tabBar 直接写进组件里，像这样：

1. 第一个按钮是消息
2. 第二个按钮是通讯录
3. 第三个按钮是应用
4. 第四个按钮是我的

看起来很快，但只要你一有角色差异，马上就乱了。

### 1. 什么叫“集中配置”

集中配置的意思不是把一坨数组扔到文件里，而是让它承担下面这些职责：

1. 每个 tab 的 `key`
2. 标题
3. 页面路径
4. 图标
5. 角色范围
6. 当前是不是 tab 页面
7. 某些特殊项是不是“智能体”这类自定义入口

### 2. 推荐模板：`tabConfig.js`

```js
const AGENT_TAB_ENTRY_PATH = '/pages/agent/index'

const STUDENT_TAB_ITEMS = [
  {
    key: 'message',
    text: '消息',
    pagePath: '/pages/message/message',
    iconPath: '/static/tabBar/message.png',
    selectedIconPath: '/static/tabBar/message_selected.png',
    roleScope: ['student', 'parent'],
    type: 'tab',
  },
  {
    key: 'contacts',
    text: '通讯录',
    pagePath: '/pages/contactList/contactList',
    iconPath: '/static/tabBar/address_book.png',
    selectedIconPath: '/static/tabBar/address_book_active.png',
    roleScope: ['student', 'parent'],
    type: 'tab',
  },
  {
    key: 'agent',
    text: '智能体',
    pagePath: AGENT_TAB_ENTRY_PATH,
    iconPath: '',
    selectedIconPath: '',
    roleScope: ['student', 'parent'],
    type: 'agent',
  },
]

const STAFF_TAB_ITEMS = [
  {
    key: 'message',
    text: '消息',
    pagePath: '/pages/message/message',
    iconPath: '/static/tabBar/message.png',
    selectedIconPath: '/static/tabBar/message_active.png',
    roleScope: ['teacher', 'training', 'enterprise'],
    type: 'tab',
  },
  {
    key: 'contacts',
    text: '通讯录',
    pagePath: '/pages/contactList/contactList',
    iconPath: '/static/tabBar/address_book.png',
    selectedIconPath: '/static/tabBar/address_book_active.png',
    roleScope: ['teacher', 'training', 'enterprise'],
    type: 'tab',
  },
  {
    key: 'agent',
    text: '智能体',
    pagePath: AGENT_TAB_ENTRY_PATH,
    iconPath: '',
    selectedIconPath: '',
    roleScope: ['teacher', 'training', 'enterprise'],
    type: 'agent',
  },
]

/**
 * 归一化页面路径。
 * 用途：移除路径前导斜杠和查询参数，便于与当前 route 做稳定比较。
 * 参数：pagePath 为页面路径。
 * 返回值：归一化后的路径字符串。
 * 边界行为：空值时返回空字符串。
 */
export function normalizePagePath(pagePath = '') {
  return String(pagePath).replace(/^\/+/, '').split('?')[0]
}

/**
 * 判断当前是否属于学生门户。
 * 用途：统一学生账号和家长代看模式对 tabBar 的归类。
 * 参数：accountType 为账号类型；isParentMode 表示是否处于家长模式。
 * 返回值：Boolean。
 * 边界行为：只要是家长模式，就按学生门户处理。
 */
export function isStudentPortal(accountType, isParentMode = false) {
  return Number(accountType) === 1 || Boolean(isParentMode)
}

/**
 * 获取当前角色可见的 tabBar 配置。
 * 用途：根据账号类型和家长模式切换不同的一组 tab 项。
 * 参数：accountType 为账号类型；isParentMode 表示是否处于家长模式。
 * 返回值：tabBar 配置数组。
 * 边界行为：默认学生与家长共用一套，其他角色共用另一套。
 */
export function getTabBarItems(accountType, isParentMode = false) {
  return isStudentPortal(accountType, isParentMode)
    ? STUDENT_TAB_ITEMS
    : STAFF_TAB_ITEMS
}
```

### 3. 为什么这里最值钱的是 `normalizePagePath`

很多项目判断当前选中 tab 时，最容易踩的坑就是：

1. 页面路径有无前导 `/`
2. 页面路径带不带 `?id=xxx`
3. 当前页面实际 route 是不是和配置路径完全一致

一旦这一步不统一，你后面自定义 tabBar 组件会很容易出现：

1. 明明在当前页，但没高亮
2. 某些带参数页面一直匹配失败

所以路径归一化这件事虽然小，但非常值得单独收口。

## 四、第二层：为什么角标同步一定要单独抽

tabBar 的未读角标看起来只是一个小红点，但在项目里非常容易失控。

### 1. 为什么角标不能让每个页面自己算

因为一个未读数的变化，往往来源很多地方：

1. 消息页收到推送
2. WebSocket 收到新消息
3. 某个详情页处理完未读
4. 登录后拉一次初始化数据

如果每个页面都自己写：

1. 存未读数
2. 设置 tabBar 角标
3. 通知自定义 tabBar 组件刷新

最后一定重复。

### 2. 真正适合抽出来的，不是“画红点”，而是“角标同步机制”

我建议角标层至少统一管理这些事：

1. 未读数的存储 key
2. 数字归一化
3. 设置系统 tabBar 角标
4. 清除系统 tabBar 角标
5. 触发自定义 tabBar 刷新事件
6. 在 tab 页 `onShow` 时做一次兜底校准

### 3. 推荐模板：`badgeSync.js`

```js
const STORAGE_KEY = 'TAB_BAR_UNREAD_TOTAL'
export const TAB_BADGE_REFRESH_EVENT = 'tabBadgeRefreshRequest'
export const TAB_BAR_BADGE_CHANGE_EVENT = 'tabBarBadgeChange'

function normalizeCount(count) {
  const n = Number(count)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.floor(n))
}

function formatBadgeText(count) {
  return count > 99 ? '99+' : String(count)
}

function emitBadgeChange(count, index) {
  try {
    uni.$emit(TAB_BAR_BADGE_CHANGE_EVENT, {
      count,
      index,
    })
  } catch (e) {
    console.error('[TabBarBadge] 同步自定义角标失败', e)
  }
}

/**
 * 尝试设置系统 tabBar 角标。
 * 用途：统一调用 uni.setTabBarBadge / uni.removeTabBarBadge。
 * 参数：count 为角标数量；index 为 tabBar 下标。
 * 返回值：Boolean，表示是否设置成功。
 * 边界行为：count 小于等于 0 时移除角标；设置失败时返回 false。
 */
function tryApply(count, index) {
  try {
    if (count > 0) {
      uni.setTabBarBadge({ index, text: formatBadgeText(count) })
    } else {
      uni.removeTabBarBadge({ index })
    }
    return true
  } catch (e) {
    console.error('[TabBarBadge] 设置角标失败', e)
    return false
  }
}

/**
 * 设置未读角标数量。
 * 用途：持久化未读数，并同步原生 tabBar 角标和自定义 tabBar 状态。
 * 参数：count 为未读数；options.index 为 tabBar 下标。
 * 返回值：无。
 * 边界行为：会自动把 count 转成非负整数。
 */
export function setUnreadBadgeCount(count, options = {}) {
  const index = typeof options.index === 'number' ? options.index : 0
  const normalized = normalizeCount(count)

  try {
    uni.setStorageSync(STORAGE_KEY, normalized)
  } catch (e) {
    console.error('[TabBarBadge] 存储失败', e)
  }

  tryApply(normalized, index)
  emitBadgeChange(normalized, index)
}

/**
 * 刷新未读角标。
 * 用途：从本地存储回读未读数并重新应用到 tabBar。
 * 参数：options.index 为 tabBar 下标；options.sync 表示是否额外广播全局刷新事件。
 * 返回值：无。
 * 边界行为：读取失败时默认按 0 处理。
 */
export function flushUnreadBadge(options = {}) {
  const index = typeof options.index === 'number' ? options.index : 0
  const shouldSync = options.sync !== false

  let count
  try {
    count = uni.getStorageSync(STORAGE_KEY)
  } catch (e) {
    count = 0
  }

  const normalized = normalizeCount(count)
  tryApply(normalized, index)

  if (shouldSync) {
    requestGlobalBadgeRefresh()
  }
}

/**
 * 获取当前未读角标数量。
 * 用途：供页面或自定义 tabBar 组件读取当前缓存值。
 * 参数：无。
 * 返回值：Number。
 * 边界行为：读取异常时返回 0。
 */
export function getUnreadBadgeCount() {
  try {
    return normalizeCount(uni.getStorageSync(STORAGE_KEY))
  } catch (e) {
    return 0
  }
}

/**
 * 请求全局角标刷新。
 * 用途：通过事件总线通知各个自定义 tabBar 或页面重新校准角标。
 * 参数：无。
 * 返回值：无。
 * 边界行为：事件发送失败时只打印日志，不影响主流程。
 */
export function requestGlobalBadgeRefresh() {
  try {
    uni.$emit(TAB_BADGE_REFRESH_EVENT)
  } catch (e) {
    console.error('[TabBarBadge] 触发角标校准事件失败', e)
  }
}
```

### 4. 这层真正值钱的地方不是 `setTabBarBadge` 本身

uni-app 官方本来就有：

1. `uni.setTabBarBadge`
2. `uni.removeTabBarBadge`

真正值钱的是你把它们包装成了：

`全局统一未读数 + 原生角标同步 + 自定义角标同步 + 存储兜底`

这才是项目级复用能力。

## 五、第三层：安全区适配为什么也值得单独抽

很多人对安全区的第一反应是：

“页面里直接加个 `padding-bottom` 不就完了吗？”

但一旦你有：

1. 自定义底部栏
2. 悬浮按钮
3. 底部输入框
4. 刘海屏 / 底部手势条设备

这种写法很快就不够用了。

### 1. 为什么不建议直接在每个页面里自己算 safe area

因为你后面很容易出现：

1. 页面 A 用 `safeArea.bottom`
2. 页面 B 用 `screenHeight - safeArea.bottom`
3. 页面 C 直接硬编码 `34px`
4. 页面 D 又额外加一层偏移量

最后所有页面的底部距离都不统一。

### 2. 更稳的思路：统一抽成底部 inset 工具

我建议安全区层至少抽两个函数：

1. 获取底部安全区
2. 在安全区基础上计算实际底部距离

### 3. 推荐模板：`bottomSafeArea.js`

```js
/**
 * 获取底部安全区距离。
 * 用途：优先读取 safeAreaInsets.bottom，兼容新平台；缺失时退回 screenHeight - safeArea.bottom。
 * 参数：systemInfo 为可选设备信息对象；不传则内部调用 uni.getSystemInfoSync。
 * 返回值：Number，底部安全区距离。
 * 边界行为：没有可用安全区信息时返回 0。
 */
export function getSafeAreaBottomInset(systemInfo) {
  const info = systemInfo || uni.getSystemInfoSync()
  const safeAreaInsetsBottom = Number(info?.safeAreaInsets?.bottom || 0)
  if (safeAreaInsetsBottom > 0) {
    return safeAreaInsetsBottom
  }

  const screenHeight = Number(info?.screenHeight || 0)
  const safeAreaBottom = Number(info?.safeArea?.bottom || 0)
  if (screenHeight > 0 && safeAreaBottom > 0) {
    return Math.max(0, screenHeight - safeAreaBottom)
  }

  return 0
}

/**
 * 统一计算底部距离。
 * 用途：在安全区基础上叠加基础偏移、额外偏移和倍数，供自定义 tabBar、浮层、输入框统一使用。
 * 参数：options.baseOffset 为基础偏移；options.insetMultiplier 为安全区倍数；options.extraOffsetWhenInset 为有安全区时额外偏移。
 * 返回值：Number，最终底部距离。
 * 边界行为：无安全区时只返回基础偏移。
 */
export function getBottomDistance(options = {}) {
  const {
    baseOffset = 0,
    insetMultiplier = 1,
    extraOffsetWhenInset = 0,
  } = options

  const safeAreaBottom = getSafeAreaBottomInset()
  return (
    safeAreaBottom * insetMultiplier +
    baseOffset +
    (safeAreaBottom > 0 ? extraOffsetWhenInset : 0)
  )
}
```

### 4. 为什么这种封法比硬编码更适合长期复用

因为页面层以后只需要表达意图：

1. 我要一个基础距离
2. 我要在有安全区时额外再加一点
3. 我要安全区乘某个倍数

而不是每个页面自己推导设备信息。

## 六、这三个文件组合起来，真正可以沉淀成什么方案

如果把 `tabConfig.js`、`badgeSync.js`、`bottomSafeArea.js` 合起来看，它们其实不是三个零散工具，而是一整套：

`可配置 tabBar + 可同步 badge + 可统一底部适配`

这套方案特别适合下面这些多入口应用：

1. 多角色入口
2. 底部栏长期存在
3. 未读状态高频变化
4. 底部组件较多

### 1. 它们分别解决了什么

#### `tabConfig.js`

解决：

1. 谁能看到哪些 tab
2. tab 的路径和图标从哪来
3. 当前路由如何匹配

#### `badgeSync.js`

解决：

1. 未读数怎么存
2. 原生 tabBar 角标怎么同步
3. 自定义组件怎么收到刷新通知

#### `bottomSafeArea.js`

解决：

1. 底部栏怎么避开安全区
2. 底部浮层怎么统一偏移
3. 输入框 dock 怎么统一底距

## 七、这一套最适合放到哪些场景

如果你以后判断“值不值得沉淀到项目复用技术”，我建议还是用一个简单标准：

`它是不是会在 3 个以上页面或组件里反复出现？`

这套 tabBar + badge + safe area 组合，通常都会满足。

### 特别适合这篇方案的场景

1. 校园类 App / 小程序
2. OA / 教务 / 审批类底部栏
3. 多角色门户
4. 自定义 AI 入口 tab
5. 消息角标高频变化场景

## 八、最容易踩的 12 个坑

### 1. tabBar 配置写死在组件里

一改角色差异就难维护。

### 2. 当前选中态直接拿原始路径字符串比较

带参数后很容易失效。

### 3. 每个页面自己维护未读数

最终 badge 完全不同步。

### 4. 只设置原生 tabBar 角标，不同步自定义组件

用户看到的状态会不一致。

### 5. 角标不做数字归一化

会出现负数、浮点、非法字符串。

### 6. 未读数不持久化

页面重进后状态丢失。

### 7. 只有消息页会刷新角标

其他页面收到未读变化时看起来像失效。

### 8. 安全区直接每页硬编码

后面统一改样式非常痛苦。

### 9. 只使用 `safeArea.bottom`，不兼容 `safeAreaInsets.bottom`

新平台兼容性会差。

### 10. 底部栏和输入框各自算自己的距离

页面布局会越来越不统一。

### 11. badge 文本不做上限处理

`1000` 这种数字会把 UI 撑坏。

### 12. 没有全局刷新机制

非 tab 页面期间的更新很容易漏掉。

## 九、建议的接入顺序

以后你再做这套能力，我建议按下面顺序来：

1. 先统一 tab 配置结构
2. 再统一路径归一化
3. 再统一 badge 存储和刷新机制
4. 最后统一安全区布局工具

这样会比“先把组件画出来再补逻辑”轻松很多。

## 十、最后浓缩成一句话

如果只留一句总结，我会写：

`tabBar 这类能力最值得沉淀的，不是按钮本身，而是“角色配置中心 + 全局 badge 同步 + 安全区统一计算”这三层。`

只要先把这三层收口，后面自定义 tabBar、角标、底部布局这些能力都会比散落在页面里稳定得多。

## 参考资料

1. [pages.json / tabBar 配置文档](https://uniapp.dcloud.net.cn/collocation/pages)
2. [uni.setTabBarBadge / removeTabBarBadge 官方文档](https://uniapp.dcloud.net.cn/api/ui/tabbar)
3. [uni-app API 总览](https://uniapp.dcloud.net.cn/api/)
4. [uni-app 页面样式与布局文档](https://uniapp.dcloud.net.cn/tutorial/syntax-css)
