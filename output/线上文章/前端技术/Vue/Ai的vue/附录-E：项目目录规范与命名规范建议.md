---
title: "附录 E：项目目录规范与命名规范建议"
slug: "vue-ai-vue-e-72e17220"
summary: "Vue 项目目录和命名规范附录，整理目录拆分、文件命名和项目组织建议。"
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 290
cover: ""
originalId: "6a2d291e8a2b1c68f2cac298"
originalSlug: "vue-ai-vue-e-72e17220"
originalStatus: "published"
publishedAt: "2026-02-02T13:22:00.011Z"
updatedAt: "2026-07-31T11:16:23.877Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 附录 E：项目目录规范与命名规范建议

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
