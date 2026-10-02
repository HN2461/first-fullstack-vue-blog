---
title: "第 8 篇：uni-app 跨端导航栏适配：默认导航、自定义导航与胶囊尺寸"
slug: "uniapp-cross-platform-navigation-bar"
summary: "对比 uni-app 默认导航栏与自定义导航栏的适用条件，说明胶囊尺寸、安全区、窗口变量、tabBar 和业务吸顶栏的计算方式与常见冲突。"
category: "uni-app"
categoryPath:
  - "项目复用技术"
  - "uni-app"
tags:
  - "uni-app"
  - "导航"
  - "微信小程序"
  - "H5"
status: "published"
sortOrder: 80
cover: ""
originalId: "6abf80f2b29038327447c263"
originalSlug: "uniapp-cross-platform-navigation-bar"
originalStatus: "published"
publishedAt: "2026-10-02T10:01:22.438Z"
updatedAt: "2026-10-02T10:01:22.473Z"
exportedAt: "2026-10-02T10:18:25.336Z"
---
# 第 8 篇：uni-app 跨端导航栏适配：默认导航、自定义导航与胶囊尺寸

## 1. 先做唯一选择

每个页面必须明确采用一种导航模式：

### 默认导航

- 页面配置不写 `navigationStyle: 'custom'`。
- 标题、返回按钮和系统占位由 uni-app/平台处理。
- 页面内可以有业务吸顶栏，但不能覆盖默认导航。

### 自定义导航

- 页面配置明确写 `navigationStyle: 'custom'`。
- 页面自己绘制状态栏、标题栏、返回按钮和占位。
- 内容只为这一套导航预留一次高度。

禁止“默认导航 + 自定义导航组件 + placeholder”同时存在。它会造成双标题、重复占位、大面积顶部空白或返回按钮冲突。

## 2. 快速判断问题类型

| 现象 | 优先检查 |
| --- | --- |
| 默认标题像消失了 | 是否被高层级 `position: fixed; top: 0` 覆盖 |
| 标题下方有大块空白 | 是否同时存在默认导航和自定义组件占位 |
| 刘海屏标题偏上 | 是否写死状态栏高度 |
| H5 正常、小程序底部空白 | 是否错误计算了 tabBar/窗口高度 |
| 小程序正常、H5 顶部遮挡 | 是否忽略 `var(--window-top)` |

使用浏览器或小程序审查工具确认：空白区域是实际节点撑开，还是容器高度大于可视区。不要只靠肉眼不断加减 `padding`。

## 3. 默认导航下的业务吸顶栏

页面保留默认导航，同时有固定 tab 或筛选栏时：

```scss
.business-tabs {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;

  /* #ifdef H5 */
  top: var(--window-top);
  /* #endif */
}

.page-content {
  padding-top: 88rpx;
}
```

业务内容只预留业务 tab 自身高度。既然固定 tab 已通过 `top: var(--window-top)` 避开默认导航，就不要再给内容重复增加默认导航高度。

## 4. 自定义导航高度计算

```javascript
import { computed, ref } from 'vue'

export function useNavigationMetrics() {
  const statusBarHeight = ref(0)
  const contentHeight = ref(44)
  const menuButton = ref(null)

  const navigationHeight = computed(
    () => statusBarHeight.value + contentHeight.value
  )

  function measure() {
    const systemInfo = uni.getSystemInfoSync()
    statusBarHeight.value = Number(systemInfo.statusBarHeight || 0)

    // #ifdef MP-WEIXIN
    const rect = uni.getMenuButtonBoundingClientRect()
    menuButton.value = rect
    const gap = Math.max(0, rect.top - statusBarHeight.value)
    contentHeight.value = gap * 2 + rect.height
    // #endif

    // #ifdef APP-PLUS
    const platform = String(systemInfo.platform || '').toLowerCase()
    contentHeight.value = platform === 'ios' ? 44 : 44
    // #endif

    // #ifdef H5
    statusBarHeight.value = 0
    contentHeight.value = 44
    // #endif
  }

  measure()

  return {
    statusBarHeight,
    contentHeight,
    navigationHeight,
    menuButton,
    measure
  }
}
```

App 导航内容高度应以当前 uni-app 版本、系统和设计组件为准。不要把旧经验中的 iOS 40px/Android 44px 当成不可变平台标准；最可靠的是统一组件尺寸并动态读取状态栏。

## 5. 自定义导航组件

```vue
<template>
  <view
    class="custom-navigation-placeholder"
    :style="{ height: `${navigationHeight}px` }"
  >
    <view
      class="custom-navigation"
      :style="{ height: `${navigationHeight}px` }"
    >
      <view :style="{ height: `${statusBarHeight}px` }" />
      <view
        class="custom-navigation__content"
        :style="{ height: `${contentHeight}px` }"
      >
        <button
          v-if="showBack"
          class="custom-navigation__back"
          aria-label="返回"
          @click="handleBack"
        >
          ‹
        </button>
        <text class="custom-navigation__title">{{ title }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true },
  fallbackPage: { type: String, default: '/pages/home/index' }
})

const { statusBarHeight, contentHeight, navigationHeight } =
  useNavigationMetrics()

function handleBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: props.fallbackPage })
  }
}
</script>

<style scoped lang="scss">
.custom-navigation-placeholder {
  flex: none;
}

.custom-navigation {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  box-sizing: border-box;
  background: #ffffff;
}

.custom-navigation__content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 96rpx;
  box-sizing: border-box;
}

.custom-navigation__title {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 32rpx;
  font-weight: 600;
}

.custom-navigation__back {
  position: absolute;
  left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  padding: 0;
  border: 0;
  background: transparent;
}
</style>
```

微信小程序标题和操作按钮不能侵入右侧胶囊区域。复杂组件应根据 `menuButton` 的 `left/right` 约束标题最大宽度。

## 6. 页面布局模板

### 默认导航页面

```vue
<template>
  <view class="page">
    <view class="business-tabs">...</view>
    <scroll-view class="page-scroll" scroll-y>...</scroll-view>
  </view>
</template>
```

```scss
.page {
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-scroll {
  flex: 1;
  height: 0;
}
```

### 自定义导航页面

```vue
<template>
  <view class="page">
    <CustomNavigation title="详情" />
    <scroll-view class="page-scroll" scroll-y>...</scroll-view>
  </view>
</template>
```

```scss
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-scroll {
  flex: 1;
  height: 0;
}
```

自定义导航组件已经通过 placeholder 占据文档流，内容不需要再加同样高度的 `padding-top`。

## 7. tabBar 与窗口变量

- `var(--window-top)` 表示 uni-app 已处理的顶部窗口区域。
- `var(--window-bottom)` 表示底部窗口区域，tabBar 页面常可直接使用。
- 当前页面从 tabBar 页跳转而来，不代表当前页面本身是 tabBar 页。
- 二级页不要沿用 tabBar 页的底部扣减。
- 页面结构复杂时，使用 `uni.getSystemInfoSync().windowHeight` 获取真实内容窗口高度，比写死 `50px` 更可靠。

## 8. 第三方导航组件

第三方组件常提供 `fixed` 和 `placeholder`：

- `fixed=true`：导航脱离文档流。
- `placeholder=true`：组件额外插入同高占位。

若页面仍使用默认导航，这份占位通常是重复的。解决方法是选择其一：

1. 保留默认导航，删除额外导航组件。
2. 页面改成自定义导航，只保留组件及其一次占位。

不要仅用 CSS 强行把 placeholder 高度改成零。组件仍在，后续升级或样式变化会再次出问题。

## 9. AI 排查步骤

1. 查页面配置是否为默认或自定义导航。
2. 查模板中是否又渲染了导航组件。
3. 查导航组件是否启用 `fixed/placeholder`。
4. 查业务固定顶栏是否 `top: 0` 且层级高。
5. 查内容区是否重复增加导航高度。
6. 查 tabBar 页面是否错误写死高度。
7. 用审查工具定位实际撑开空白的节点或容器。
8. 只保留一套导航和一份占位后再调细节。

## 10. 验证清单

- [ ] H5 默认标题、业务吸顶栏和内容没有覆盖。
- [ ] 自定义导航只占位一次。
- [ ] 微信小程序胶囊、标题、返回按钮不重叠。
- [ ] 刘海屏、非刘海屏状态栏高度正确。
- [ ] 首页面栈返回使用兜底页，不出现空白。
- [ ] tabBar 页底部不遮挡，普通二级页不多留白。
- [ ] 横竖屏或窗口尺寸变化后重新测量。
- [ ] H5、小程序开发者工具和至少两类真机回归。
