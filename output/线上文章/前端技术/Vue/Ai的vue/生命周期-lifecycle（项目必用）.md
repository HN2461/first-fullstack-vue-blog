---
title: "生命周期 lifecycle（项目必用）"
slug: "vue-ai-vue-lifecycle-48e90c0f"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 200
cover: ""
originalId: "6a2d291e8a2b1c68f2cac262"
originalSlug: "vue-ai-vue-lifecycle-48e90c0f"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第11章 生命周期 lifecycle（项目必用）

> 目标：掌握 Vue2 生命周期钩子及其在项目中的典型用途。
> 
> - 认识完整生命周期流程
> - 会在正确的钩子里做：请求接口 / DOM 操作 / 事件监听与清理
> - 理解父子组件生命周期执行顺序

---

## 11.1 生命周期钩子完整流程

Vue2 生命周期可以理解为：

- 组件从“创建”到“挂载到页面”再到“更新”，最后“销毁”的一系列阶段

常见钩子（按顺序）：

- `beforeCreate`
- `created`
- `beforeMount`
- `mounted`
- `beforeUpdate`
- `updated`
- `beforeDestroy`
- `destroyed`

> 你不需要死记每个钩子内部发生了什么，学习阶段建议先抓住：
> 
> - `created`：数据已可用，适合发请求
> - `mounted`：DOM 已可用，适合操作 DOM/第三方库
> - `beforeDestroy`：适合清理资源

---

## 11.2 `beforeCreate / created`

### 11.2.1 `beforeCreate`

这个阶段：

- 数据、方法、计算属性等还没初始化完成
- 你几乎很少需要在这里写业务逻辑

### 11.2.2 `created`

这个阶段：

- `data`、`methods`、`computed` 等都已经初始化
- 但组件还没有挂到真实 DOM 上

适合做：

- 发起接口请求（拿数据、写入 data）
- 初始化定时器/防抖函数（不依赖 DOM 的那种）

示例：

```js
created() {
  this.fetchList()
}
```

---

## 11.3 `beforeMount / mounted`

### 11.3.1 `beforeMount`

- 模板已编译
- 即将把渲染结果挂到页面

一般业务里用得不多。

### 11.3.2 `mounted`

这个阶段：

- 组件已经被挂载到页面
- 你能拿到真实 DOM

适合做：

- DOM 操作（例如测量元素宽高）
- 初始化依赖 DOM 的第三方库（如 ECharts、Swiper、富文本编辑器等）
- 绑定 window/document 级事件监听

示例：

```js
mounted() {
  window.addEventListener('resize', this.onResize)
}
```

---

## 11.4 `beforeUpdate / updated`

### 11.4.1 `beforeUpdate`

- 数据已变化
- 但 DOM 还没更新

### 11.4.2 `updated`

- DOM 已更新

实践建议：

- 尽量不要在 `updated` 里写“修改 data 的逻辑”，否则可能造成循环更新
- 如果你需要在“DOM 更新后”做事，更常用的是 `this.$nextTick()`

示例：

```js
methods: {
  async changeAndMeasure() {
    this.visible = true
    await this.$nextTick()
    const el = this.$refs.box
    console.log(el.getBoundingClientRect())
  }
}
```

---

## 11.5 `beforeDestroy / destroyed`

### 11.5.1 `beforeDestroy`

这是项目里非常关键的一个钩子：

- 组件即将被销毁
- 但此时你还能访问到实例与数据

适合做：

- 清理定时器：`clearTimeout/clearInterval`
- 解绑事件监听：`removeEventListener`
- 销毁第三方实例（如 ECharts 的 `dispose()`）

示例：

```js
mounted() {
  this.timer = setInterval(() => {
    console.log('polling')
  }, 1000)
  window.addEventListener('resize', this.onResize)
},
beforeDestroy() {
  clearInterval(this.timer)
  window.removeEventListener('resize', this.onResize)
}
```

### 11.5.2 `destroyed`

- 实例已被销毁
- 通常不需要在这里做业务

---

## 11.6 生命周期的典型使用场景

- **请求接口**：`created`（数据准备好即可，不依赖 DOM）
- **DOM 操作/第三方库初始化**：`mounted`
- **事件监听与定时器清理**：`beforeDestroy`

一条常用经验：

- “要不要依赖 DOM？”
  - 不依赖：优先 `created`
  - 依赖：放到 `mounted`

---

## 11.7 父子组件生命周期执行顺序

这里给你一个常用结论（足够应付大多数开发与面试场景）：

- **挂载阶段**（父包含子）：
  - 父 `beforeCreate` → 父 `created`
  - 父 `beforeMount`
  - 子 `beforeCreate` → 子 `created`
  - 子 `beforeMount` → 子 `mounted`
  - 父 `mounted`

- **更新阶段**（子依赖父的数据变化时可能触发）：
  - 父 `beforeUpdate`
  - 子 `beforeUpdate` → 子 `updated`
  - 父 `updated`

- **销毁阶段**：
  - 父 `beforeDestroy`
  - 子 `beforeDestroy` → 子 `destroyed`
  - 父 `destroyed`

---

## 本章小结

- `created` 常用于初始化与请求数据。
- `mounted` 常用于 DOM 相关操作与第三方库初始化。
- `beforeDestroy` 必须重视：清理定时器/解绑事件/销毁实例，避免内存泄漏。
- 父子生命周期有固定顺序，理解它能帮你定位很多“为什么此时拿不到数据/DOM”的问题。

**下一章预告**

第12章将进入组件化开发：从“组件是什么”到“如何注册与组织组件”，并认识单文件组件 `.vue` 的结构。
