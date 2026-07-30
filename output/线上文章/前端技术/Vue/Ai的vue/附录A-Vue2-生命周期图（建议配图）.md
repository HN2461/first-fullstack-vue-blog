---
title: "附录A Vue2 生命周期图（建议配图）"
slug: "vue-ai-vue-a-vue2-e1001ab4"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291e8a2b1c68f2cac290"
originalSlug: "vue-ai-vue-a-vue2-e1001ab4"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 附录A：Vue2 生命周期图（建议配图）

> 目标：用一张“可背可用”的生命周期流程图，帮助你在项目中快速判断：
> 
> - 什么时候能拿到 data
> - 什么时候能操作 DOM
> - 什么时候需要清理资源

---

## A.1 生命周期全流程（概览）

```txt
创建阶段
beforeCreate
created

挂载阶段
beforeMount
mounted

更新阶段（响应式数据变化触发）
beforeUpdate
updated

销毁阶段
beforeDestroy
destroyed
```

---

## A.2 常用钩子与最常见用途

- **created**
  - 数据/方法已初始化
  - 适合：请求接口、初始化数据、创建防抖函数
- **mounted**
  - DOM 已挂载
  - 适合：DOM 操作、初始化 ECharts/Swiper、绑定 window 事件
- **beforeDestroy**
  - 即将销毁
  - 适合：清理定时器、解绑事件、销毁第三方实例

---

## A.3 父子组件执行顺序（常用记忆版）

```txt
父 created
父 beforeMount
子 created
子 mounted
父 mounted
```

---

## A.4 典型陷阱速查

- **mounted 里才能安全拿到 `this.$refs.xxx` 的真实 DOM**
- **updated 里不要再改 data**（容易形成更新循环）
- **事件监听一定要在 beforeDestroy 对应 remove**（避免内存泄漏）
