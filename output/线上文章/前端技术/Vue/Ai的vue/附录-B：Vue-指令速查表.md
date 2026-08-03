---
title: "附录 B：Vue 指令速查表"
slug: "vue-ai-vue-b-vue-0374bedc"
summary: "Vue 指令速查表附录，整理常见内置指令及其使用场景。"
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 260
cover: ""
originalId: "6a2d291e8a2b1c68f2cac292"
originalSlug: "vue-ai-vue-b-vue-0374bedc"
originalStatus: "published"
publishedAt: "2026-02-02T13:21:58.978Z"
updatedAt: "2026-07-31T11:16:23.870Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 附录 B：Vue 指令速查表

> 目标：把 Vue2 高频指令按用途整理成速查表。

---

## B.1 渲染相关

- `{{ }}`：文本插值
- `v-text`：渲染文本（等价 textContent）
- `v-html`：渲染 HTML（注意 XSS 风险）

---

## B.2 属性与事件

- `v-bind` / `:`：绑定属性（`src/class/style` 等）
- `v-on` / `@`：绑定事件

常用事件修饰符：

- `.stop` `.prevent` `.once` `.capture` `.self`

常用按键修饰符：

- `.enter` `.esc` `.tab`

---

## B.3 条件与列表

- `v-if` / `v-else-if` / `v-else`：条件渲染（不满足就不创建 DOM）
- `v-show`：显示隐藏（display none）
- `v-for`：列表渲染（必须配合 `:key`）

---

## B.4 表单与其它

- `v-model`：表单双向绑定
  - 修饰符：`.lazy` `.trim` `.number`
- `v-cloak`：防止闪烁（配合 CSS）
- `v-once`：只渲染一次（静态内容优化）

---

## B.5 自定义指令（概念）

- `Vue.directive('focus', { inserted(el){ el.focus() } })`

适用场景：

- 统一处理 DOM 行为（自动聚焦、权限显示、拖拽等）
