# Console Layout Style Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复控制台导航、侧栏、主题和目录结构的基础问题，让后续知识库和管理功能能在稳定企业级框架上继续扩展。

**Architecture:** 本阶段只治理控制台基础设施：布局组件、控制台专属样式入口、路由视图分组和品牌一致性。管理页面内部文案、搜索页双模板、空状态规范等作为下一阶段逐页治理，避免一次性重写过多业务页面。

**Tech Stack:** Vue 3、Vue Router、Pinia、Ant Design Vue、CSS custom properties、Vite。

---

### Task 1: 控制台布局交互修复

**Files:**
- Modify: `client/src/views/ConsoleLayout.vue`
- Modify: `client/src/styles/console.css`

- [ ] **Step 1: 调整顶部导航**

移除 `.enterprise-topnav` 左右 padding，让顶部一级菜单和侧栏左边线对齐。右侧工具区保持紧凑、无边框、hover 高亮。

- [ ] **Step 2: 后台管理直接展示子菜单**

将管理模式侧栏根级从「后台管理 > 管理工作台/内容资产/运营治理」改为直接展示「管理工作台、内容资产、运营治理」。点击顶部「后台管理」后，用户不需要再展开一层。

- [ ] **Step 3: 个人信息改为悬浮弹出**

将 `<a-dropdown trigger="click">` 改为 `:trigger="['hover']"`，符合企业系统常见顶部个人信息交互。

- [ ] **Step 4: 折叠按钮移动到底部**

移除侧栏头部折叠按钮，将折叠按钮固定在侧栏底部。折叠状态下仍显示按钮，避免按钮消失。

- [ ] **Step 5: 修正侧栏高度计算**

统一侧栏菜单高度为 `calc(100vh - var(--console-header-height) - var(--console-sider-head-height) - var(--console-sider-footer-height))`，不再出现多个不同 magic number。

### Task 2: 控制台样式抽离与 token 化

**Files:**
- Create: `client/src/styles/console.css`
- Modify: `client/src/styles/index.css`
- Modify: `client/src/main.js`

- [ ] **Step 1: 创建控制台样式文件**

新增 `console.css`，集中放置 `.enterprise-*` 控制台布局、主题、菜单、工作台通用样式。

- [ ] **Step 2: 添加控制台设计 token**

在 `console.css` 定义：

```css
:root {
  --console-header-height: 64px;
  --console-sider-width: 280px;
  --console-sider-collapsed-width: 72px;
  --console-sider-head-height: 48px;
  --console-sider-footer-height: 48px;
  --console-content-padding: 20px;
  --console-page-gap: 16px;
}
```

- [ ] **Step 3: 从 `index.css` 移除末尾控制台覆盖块**

删除 `/* Console theme normalization... */` 到登录页样式前的控制台覆盖内容，避免新旧样式继续靠书写顺序竞争。

- [ ] **Step 4: 在 `main.js` 导入控制台样式**

保留 `index.css` 作为公共基础样式，新增：

```js
import './styles/console.css'
```

### Task 3: 视图目录按职责分组

**Files:**
- Move: `client/src/views/LoginPage.vue` -> `client/src/views/auth/LoginPage.vue`
- Move: `client/src/views/RegisterPage.vue` -> `client/src/views/auth/RegisterPage.vue`
- Move: `client/src/views/HomePage.vue` -> `client/src/views/public/HomePage.vue`
- Move: `client/src/views/PublicLayout.vue` -> `client/src/views/public/PublicLayout.vue`
- Move: `client/src/views/ArticleListPage.vue` -> `client/src/views/public/ArticleListPage.vue`
- Move: `client/src/views/ArticleDetailPage.vue` -> `client/src/views/public/ArticleDetailPage.vue`
- Move: `client/src/views/SearchPage.vue` -> `client/src/views/public/SearchPage.vue`
- Move: `client/src/views/ConsoleLayout.vue` -> `client/src/views/console/ConsoleLayout.vue`
- Move: `client/src/views/ProfilePage.vue` -> `client/src/views/console/ProfilePage.vue`
- Move: `client/src/views/Admin*.vue` -> `client/src/views/admin/*.vue`
- Modify: `client/src/router/index.js`

- [ ] **Step 1: 创建分组目录**

创建 `auth`、`public`、`console`、`admin` 四个目录。

- [ ] **Step 2: 移动 Vue 文件**

使用文件移动保持文件内容不变。

- [ ] **Step 3: 更新路由懒加载导入路径**

将路由导入改为分组路径，例如：

```js
const LoginPage = () => import('@/views/auth/LoginPage.vue')
const ConsoleLayout = () => import('@/views/console/ConsoleLayout.vue')
const AdminComments = () => import('@/views/admin/AdminComments.vue')
```

### Task 4: 品牌与首屏密度修正

**Files:**
- Modify: `client/src/views/auth/LoginPage.vue`
- Modify: `client/src/views/auth/RegisterPage.vue`
- Modify: `client/src/views/console/ConsoleLayout.vue`
- Modify: `client/src/views/admin/AdminStats.vue`

- [ ] **Step 1: 统一品牌标识**

登录、注册、控制台统一使用 `K` 和 `Knowledge OS`。

- [ ] **Step 2: 统计卡片高度改为最小高度**

将 `.admin-metric-card .ant-card-body` 从固定 `height` 改为 `min-height`，避免内容增加后截断。

- [ ] **Step 3: 管理页面描述文案后续治理**

本阶段只移除明显的“后续可扩展”等内部建设口吻。其他页面标题区压缩作为下一阶段页面级精修。

### Task 5: 验证

**Files:**
- None

- [ ] **Step 1: 构建前端**

Run: `npm run build --workspace client`
Expected: exit code 0。

- [ ] **Step 2: 服务端测试**

Run: `npm run test --workspace server`
Expected: 6 files, 30 tests passed。

- [ ] **Step 3: 编码检查**

Run: `npm run check:encoding`
Expected: 未发现 UTF-8 BOM。

- [ ] **Step 4: 浏览器验证**

打开并检查：

```text
http://127.0.0.1:5173/console
http://127.0.0.1:5173/console/manage/comments
http://127.0.0.1:5173/login
```

检查点：
- 顶部导航无左右多余留白。
- 后台管理模式侧栏直接展示管理工作台、内容资产、运营治理。
- 个人信息 hover 弹出。
- 折叠按钮位于侧栏底部，折叠后仍可见。
- 浅色和深色主题下顶部、侧栏背景一致。
