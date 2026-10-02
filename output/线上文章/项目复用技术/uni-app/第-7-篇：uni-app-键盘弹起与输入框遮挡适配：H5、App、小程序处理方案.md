---
title: "第 7 篇：uni-app 键盘弹起与输入框遮挡适配：H5、App、小程序处理方案"
slug: "uniapp-keyboard-input-viewport-adaptation"
summary: "围绕软键盘弹起后输入框被遮挡、页面回弹和底部面板错位，比较小程序、App 与 H5 的处理边界，给出布局、监听清理和排查步骤。"
category: "uni-app"
categoryPath:
  - "项目复用技术"
  - "uni-app"
tags:
  - "uni-app"
  - "软键盘"
  - "H5"
  - "微信小程序"
status: "published"
sortOrder: 70
cover: ""
originalId: "6abf80f2b29038327447c261"
originalSlug: "uniapp-keyboard-input-viewport-adaptation"
originalStatus: "published"
publishedAt: "2026-10-02T10:01:22.438Z"
updatedAt: "2026-10-02T10:01:22.464Z"
exportedAt: "2026-10-02T10:18:25.336Z"
---
# 第 7 篇：uni-app 键盘弹起与输入框遮挡适配：H5、App、小程序处理方案

## 1. 问题本质

底部固定输入栏常同时受到三套机制影响：

1. `input/textarea` 的系统自动顶起。
2. 页面或 WebView 可视区随键盘变化。
3. 页面自己通过 `bottom`、高度或滚动位置进行补偿。

如果系统顶起和页面补偿同时启用，就会双重位移；如果两者都没有生效，输入栏会被遮挡。稳定方案必须只选一套主导策略。

对于聊天、评论等固定底栏页面，推荐：

- 输入框使用 `adjust-position="false"`。
- 页面监听键盘高度。
- 让整个内容壳的底边移动到键盘上沿，而不是同时手工减列表高度又移动输入栏。
- 键盘、表情面板、功能面板保持互斥。
- 页面卸载时解除所有监听和定时器。

## 2. 可复用键盘适配器

```javascript
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export function useKeyboardAdapter(options = {}) {
  const {
    onOpen,
    onClose,
    h5Enabled = true,
    debounce = 30
  } = options

  const keyboardHeight = ref(0)
  const platform = ref('')
  const isIOS = computed(() => platform.value === 'ios')
  const visible = computed(() => keyboardHeight.value > 0)

  let keyboardListener = null
  let viewportListener = null
  let debounceTimer = null
  let lastHeight = 0

  function commitHeight(rawHeight) {
    const nextHeight = Math.max(0, Math.round(Number(rawHeight) || 0))
    if (nextHeight === lastHeight) return

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const wasVisible = lastHeight > 0
      lastHeight = nextHeight
      keyboardHeight.value = nextHeight

      if (!wasVisible && nextHeight > 0) onOpen?.(nextHeight)
      if (wasVisible && nextHeight === 0) onClose?.()
    }, debounce)
  }

  function startUniListener() {
    if (typeof uni.onKeyboardHeightChange !== 'function') return

    keyboardListener = (event) => commitHeight(event?.height)
    uni.onKeyboardHeightChange(keyboardListener)
  }

  function stopUniListener() {
    if (!keyboardListener) return
    if (typeof uni.offKeyboardHeightChange === 'function') {
      uni.offKeyboardHeightChange(keyboardListener)
    }
    keyboardListener = null
  }

  function startH5ViewportListener() {
    if (!h5Enabled || typeof window === 'undefined') return
    if (!window.visualViewport) return

    viewportListener = () => {
      const viewport = window.visualViewport
      const obscuredHeight =
        window.innerHeight - viewport.height - viewport.offsetTop
      commitHeight(obscuredHeight > 80 ? obscuredHeight : 0)
    }

    window.visualViewport.addEventListener('resize', viewportListener)
    window.visualViewport.addEventListener('scroll', viewportListener)
  }

  function stopH5ViewportListener() {
    if (!viewportListener || typeof window === 'undefined') return
    window.visualViewport?.removeEventListener('resize', viewportListener)
    window.visualViewport?.removeEventListener('scroll', viewportListener)
    viewportListener = null
  }

  function reset() {
    lastHeight = 0
    keyboardHeight.value = 0
  }

  onMounted(() => {
    const systemInfo = uni.getSystemInfoSync()
    platform.value = String(systemInfo.platform || '').toLowerCase()

    // #ifndef H5
    startUniListener()
    // #endif

    // #ifdef H5
    startH5ViewportListener()
    // #endif
  })

  onBeforeUnmount(() => {
    stopUniListener()
    stopH5ViewportListener()
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  return {
    keyboardHeight,
    visible,
    isIOS,
    reset
  }
}
```

H5 `visualViewport` 的高度差可能包含浏览器工具栏变化，因此示例使用最小阈值过滤轻微波动。实际项目应在目标浏览器真机校准阈值。

## 3. 完整页面布局

```vue
<template>
  <view
    class="chat-page"
    :style="{ bottom: `${keyboardHeight}px` }"
  >
    <scroll-view
      class="message-list"
      scroll-y
      :scroll-into-view="scrollTarget"
      :scroll-with-animation="scrollAnimated"
    >
      <view
        v-for="message in messages"
        :id="`message-${message.id}`"
        :key="message.id"
        class="message-item"
      >
        {{ message.content }}
      </view>
      <view id="message-list-bottom" class="message-list-bottom" />
    </scroll-view>

    <view v-if="activePanel" class="extension-panel">
      <!-- 表情、快捷回复或更多功能 -->
    </view>

    <view class="input-bar">
      <button class="input-bar__tool" @click="togglePanel('emoji')">表情</button>
      <input
        v-model="draft"
        class="input-bar__input"
        :adjust-position="false"
        :hold-keyboard="false"
        confirm-type="send"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        @confirm="sendMessage"
      />
      <button class="input-bar__send" @click="sendMessage">发送</button>
    </view>
  </view>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const messages = ref([])
const draft = ref('')
const activePanel = ref('')
const scrollTarget = ref('')
const scrollAnimated = ref(true)
let scrollTimer = null

function scrollToBottom(delay = 80) {
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(async () => {
    await nextTick()
    scrollTarget.value = ''
    await nextTick()
    scrollTarget.value = 'message-list-bottom'
  }, delay)
}

const { keyboardHeight, isIOS } = useKeyboardAdapter({
  onOpen() {
    activePanel.value = ''
    scrollToBottom(120)
  },
  onClose() {
    scrollToBottom(30)
  }
})

function handleInputFocus() {
  activePanel.value = ''
  scrollToBottom(180)
}

function handleInputBlur() {
  if (!isIOS.value) return

  // #ifdef H5
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.scrollY !== 0) {
      window.scrollTo(0, 0)
    }
  }, 80)
  // #endif
}

function togglePanel(panel) {
  uni.hideKeyboard()
  activePanel.value = activePanel.value === panel ? '' : panel
  scrollToBottom(120)
}

function sendMessage() {
  const content = draft.value.trim()
  if (!content) return
  messages.value.push({ id: Date.now(), content })
  draft.value = ''
  scrollToBottom()
}
</script>

<style scoped lang="scss">
.chat-page {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f3f4f6;
  transition: bottom 0.2s ease-out;
}

.message-list {
  flex: 1;
  height: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 24rpx;
}

.message-list-bottom {
  height: 1px;
}

.extension-panel {
  flex: none;
  height: 420rpx;
  background: #ffffff;
  border-top: 1rpx solid #e5e7eb;
}

.input-bar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #e5e7eb;
}

.input-bar__input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  padding: 0 20rpx;
  border-radius: 8rpx;
  background: #f3f4f6;
}
</style>
```

这套布局通过改变页面壳的 `bottom` 收缩可用区域。不要再额外使用 `windowHeight - keyboardHeight - inputBarHeight` 计算列表高度，否则会重复扣减键盘高度。

## 4. 另一种策略：只移动输入栏

如果页面不能整体收缩，可以只移动输入栏，但必须同步给列表预留同等底部空间：

```vue
<scroll-view
  class="message-list"
  :style="{ paddingBottom: `${inputBarHeight + keyboardHeight}px` }"
/>

<view
  class="fixed-input-bar"
  :style="{ bottom: `${keyboardHeight}px` }"
/>
```

两种策略二选一。AI 修改时应先确认现有页面属于哪一种，不要把两种模板叠加。

## 5. 单位和安全区

- 键盘事件返回值是 `px`，动态 `bottom` 必须使用 `px`。
- 静态尺寸可以继续使用 `rpx`。
- 键盘关闭时底栏需要安全区；键盘打开时，部分平台已经把安全区包含在键盘高度内。
- 若出现键盘上方额外空隙，检查是否同时叠加了 `env(safe-area-inset-bottom)` 和键盘高度。

可以根据可见状态控制安全区：

```vue
<view :class="['input-bar', { 'input-bar--keyboard-open': visible }]" />
```

```scss
.input-bar--keyboard-open {
  padding-bottom: 16rpx;
}
```

## 6. iOS 回弹

`window.scrollTo` 只在 H5 浏览器环境使用。小程序逻辑层不应无条件访问 `window`。

只在页面确实发生整体偏移时回到顶部，不要每次失焦都强制滚动，否则会破坏长表单位置。聊天全屏页可以使用，普通表单应优先滚动当前字段容器。

## 7. 常见故障

### 输入栏移动两次

原因通常是 `adjust-position="true"` 与手工 `bottom` 同时生效，或页面壳和输入栏都加了键盘高度。

### 多次进入页面后抖动加重

键盘监听重复注册且没有解除。必须保存同一个回调引用，并在卸载时传给 `offKeyboardHeightChange`。

### 键盘高度一直为零

检查平台是否支持 API、事件是否只在真机触发、输入框是否真正获得焦点。H5 使用 `visualViewport` 降级。

### 列表不滚到底部

`scroll-into-view` 的目标节点必须已渲染且 ID 唯一。先 `nextTick`，清空旧目标，再设置底部锚点。

### 打开表情面板后高度错乱

键盘和面板必须互斥：打开面板前先 `uni.hideKeyboard()`；输入框 focus 时关闭面板。

## 8. AI 修改步骤

1. 找出输入框的 `adjust-position`。
2. 找出所有键盘监听和页面卸载逻辑。
3. 判断布局是“整体壳收缩”还是“固定输入栏单独移动”。
4. 删除重复的高度扣减或重复安全区。
5. 把监听封装并补 `offKeyboardHeightChange`。
6. H5 补 `visualViewport`，且所有 `window` 调用放在 H5 分支。
7. 统一键盘与扩展面板状态。
8. 真机验证后再调整动画和阈值。

## 9. 验证清单

- [ ] Android 和 iOS 首次打开键盘不遮挡输入栏。
- [ ] 连续开关键盘十次不会累积偏移。
- [ ] 进入退出页面三次没有重复监听。
- [ ] 表情、功能、快捷回复与键盘互斥。
- [ ] 新消息发送和键盘弹起后列表滚到底部。
- [ ] H5 iOS Safari 收起键盘后页面恢复。
- [ ] 普通表单不会因为全局 `scrollTo(0, 0)` 丢失滚动位置。
- [ ] 刘海屏安全区没有额外空隙或遮挡。
