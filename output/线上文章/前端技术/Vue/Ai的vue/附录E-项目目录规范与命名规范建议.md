---
title: "附录E 项目目录规范与命名规范建议"
slug: "vue-ai-vue-e-72e17220"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291e8a2b1c68f2cac298"
originalSlug: "vue-ai-vue-e-72e17220"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 附录E：项目目录规范与命名规范建议

> 目标：给出一套“够用、易落地”的 Vue2 项目目录与命名建议，减少团队协作成本。

---

## E.1 推荐目录结构（示意）

```txt
src/
├── api/
├── assets/
├── components/
│   ├── base/
│   └── business/
├── router/
├── store/
├── styles/
├── utils/
├── views/
├── App.vue
└── main.js
```

---

## E.2 组件命名规范

- 文件名：PascalCase
  - `UserCard.vue`
  - `BaseButton.vue`
- 组件 name：PascalCase
  - `name: 'UserCard'`

---

## E.3 变量/函数命名

- JS/TS 变量：camelCase
- 常量：UPPER_SNAKE_CASE

---

## E.4 CSS 命名建议

- class：kebab-case
  - `user-card`
  - `btn-primary`

---

## E.5 API 文件拆分

按业务域：

- `api/user.js`
- `api/order.js`
- `api/product.js`

好处：

- 便于定位
- 便于权限与边界划分
