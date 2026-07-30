---
title: "附录B Vue 指令速查表"
slug: "vue-ai-vue-b-vue-0374bedc"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291e8a2b1c68f2cac292"
originalSlug: "vue-ai-vue-b-vue-0374bedc"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 附录B：Vue 指令速查表

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
