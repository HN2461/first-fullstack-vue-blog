---
title: "附录F 常见报错与解决方案合集"
slug: "vue-ai-vue-f-fa05c4ac-revision-20260730"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291e8a2b1c68f2cac29a"
originalSlug: "vue-ai-vue-f-fa05c4ac"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 附录F：常见报错与解决方案合集

> 目标：把 Vue2 学习与项目中最常见的报错按“现象 → 原因 → 解决”整理。

---

## F.1 Cannot read property 'xxx' of undefined

- **现象**：模板或代码中访问了 `undefined.xxx`
- **常见原因**：
  - 数据未初始化
  - 异步请求还没返回
- **解决**：
  - 给 data 默认值
  - 模板使用条件渲染（`v-if="obj"`）

---

## F.2 Avoid mutating a prop directly

- **现象**：控制台警告：不要直接修改 props
- **原因**：props 数据来自父组件，子组件改会导致数据流混乱
- **解决**：
  - `$emit` 通知父组件修改
  - 或复制到本地 data 再编辑

---

## F.3 v-for 缺少 key 或 key 异常

- **现象**：警告或列表更新错乱
- **原因**：没有稳定唯一的 key
- **解决**：
  - 优先用 `id` 做 key
  - 避免用 `index`（插入/删除/排序时）

---

## F.4 Vue2 新增对象字段不更新

- **现象**：`this.obj.newKey = 1` 后页面不变
- **原因**：Vue2 响应式缺陷（初始化时不存在该字段）
- **解决**：
  - `this.$set(this.obj, 'newKey', 1)`
  - 或在 data 初始化时声明完整字段

---

## F.5 401/登录失效不停跳转

- **现象**：接口 401 后页面反复跳登录
- **原因**：
  - token 过期
  - 守卫逻辑/重定向逻辑未处理好
- **解决**：
  - 统一在响应拦截器清 token
  - 登录页放行
  - 使用 `redirect` 记录来源路径
