# AGENTS.md

## 项目定位

本项目是一个全新的前后端分离全栈个人知识库 / 技术博客系统，不是旧静态博客的兼容改造项目。

旧项目仅可作为内容迁移参考，不应为了兼容旧静态 Markdown 或旧页面结构牺牲当前全栈系统架构。后续文章内容可以通过导入脚本或后台录入进入数据库。

## 技术栈

- 前端：Vue 3、Vite、Pinia、Vue Router、Ant Design Vue、lucide-vue-next。
- 后端：Node.js、Express、MongoDB、Mongoose。
- 架构：前端、后端独立项目；仓库只作为代码收纳，不再使用根 npm workspaces。
- 主要目录：
  - `frontend`：前端应用，拥有独立 `package.json` / `package-lock.json` / `node_modules`。
  - `backend`：Express API 服务，拥有独立 `package.json` / `package-lock.json` / `node_modules`。
  - `backend/src/constants`：后端领域常量；前端如需展示字典，自行在前端维护展示配置。
  - `uploads`：本地媒体上传目录。

## 产品结构原则

系统采用成熟企业级管理系统结构：

- 公开门户：面向访客，展示博客/知识库入口、公开文章、搜索等。
- 登录控制台：面向登录用户，是实际知识库系统。
- 管理后台：管理员在控制台内进入后台管理域，不再单独做一个套娃式后台。

控制台布局必须保持：

- 顶部导航为一级主菜单。
- 普通用户仅展示「知识库」主类目。
- 管理员额外展示「后台管理」主类目。
- 右上角操作区使用图标按钮，配 tooltip，不使用冗余文字按钮。
- 用户信息区使用成熟企业系统样式：头像、用户名、角色、下拉菜单。
- 左侧侧边栏为当前一级菜单下的二级/三级菜单。
- 左侧菜单必须支持折叠，避免后续功能增多导致页面过长。
- 知识库侧栏结构应支持「主类目 - 分类 - 文章」三层。
- 后台管理侧栏结构应支持「模块组 - 功能菜单」多级折叠。

不要恢复成：

- 顶部面包屑作为主导航。
- 左侧平铺所有菜单。
- 页面里再套一个后台系统。
- 大面积营销风、卡片堆砌、AI 味重的装饰风格。

## UI/UX 风格规则

目标风格：成熟、克制、企业级、知识库管理系统。

设计要求：

- 使用 Ant Design Vue 组件作为基础工作台语言。
- 页面主体优先使用「页面标题区 + 筛选/工具条 + 表格/表单/列表工作区」结构。
- 卡片圆角保持 8px 或以下。
- 避免夸张渐变、大装饰图形、大面积英雄区、过度留白。
- 后台页面应信息密度适中，适合长期管理使用。
- 浅色/深色主题都要完整适配，顶部、侧栏、内容区不能混色。
- 浅色模式下选中菜单项必须有明显辨识度。
- 子菜单展开背景必须和当前主题同化，不能出现突兀异色包裹层。
- 图标按钮必须有 tooltip 或明确上下文。
- 登录、注册页面需保持企业级认证页风格，不能退回简陋表单页。
- 所有业务弹窗必须设置最大高度阈值，超出后仅允许弹窗内部内容区滚动，禁止图片、列表、资源卡片或长表单直接撑高弹窗破坏布局。
- 弹窗中的图片预览、资源选择、长列表必须使用固定尺寸容器或组件库原生滚动区域，优先保证操作稳定性和信息可读性。

## 当前关键页面

- `/`：公开门户首页。
- `/login`：企业风登录页。
- `/register`：企业风注册页。
- `/console/articles`：登录后知识库文章列表。
- `/console/search`：控制台全文检索。
- `/console/articles/:slug`：控制台文章详情。
- `/console/profile`：个人信息。
- `/console`：管理员工作台。
- `/console/manage/articles`：文章管理。
- `/console/manage/comments`：评论审核。
- `/console/manage/users`：用户管理。
- `/console/manage/media`：媒体资产。
- `/console/manage/notifications`：公告管理。
- `/console/manage/settings`：系统设置。

## 权限与流程

- 未登录访问控制台页面必须跳转登录。
- 普通用户登录后进入知识库系统，可查看文章、搜索、互动、查看个人信息。
- 管理员登录后可切换到后台管理，访问内容管理、用户管理、评论审核、系统设置等。
- 登录 / 注册成功后进入 `/console` 或对应重定向地址。

## 开发约束

- 所有源码和配置文件使用 UTF-8 无 BOM。
- 保持中文可读，禁止乱码。
- Vue / JS 代码风格：
  - 2 空格缩进。
  - 单引号。
  - 不使用分号。
- 不要随意重构无关模块。
- 不要回退用户已经确认过的整体控制台骨架。
- 若要修改控制台布局，必须先确认是否会影响：
  - 顶部一级导航。
  - 左侧折叠菜单。
  - 浅色/深色主题一致性。
  - 普通用户/管理员权限差异。

## 通用表格组件规则

- 涉及后台列表、控制台列表、分页数据表格、带筛选/操作列的数据展示时，优先使用 `frontend/src/components/BlogTable.vue`，不要在业务页面重复手写 `a-table + a-pagination` 的通用封装逻辑。
- 使用 `BlogTable` 时，优先通过组件已有能力完成需求，例如 `columns`、`scroll`、`height`、`rowSelection`、`toolbar` 插槽、`bodyCell` 插槽、`show-column-setting`、`column-border`、`striped`、`bordered`、固定列 `fixed: 'left' | 'right'`、列宽 `width` 等。
- 业务页面需要个性化表格样式时，优先在业务页面通过传参、列配置、插槽或局部样式实现，避免为了单个页面直接改动 `BlogTable`。
- `BlogTable.vue` 是高复用公共组件，默认禁止主动修改它。只有当用户明确要求修改该组件，或已经向用户说明影响范围并获得同意后，才可以编辑 `frontend/src/components/BlogTable.vue`。
- 如果确实需要扩展 `BlogTable`，必须保持向后兼容：新增能力优先做成可选 prop / slot / columns 配置，不能改变现有页面默认表现；修改后需要运行前端构建并抽查 UTF-8 无 BOM。

## 验证命令

重要改动后至少运行：

```powershell
cd frontend
npm run build
cd ..\backend
npm run test
cd ..
pwsh -File scripts\check-encoding.ps1
```

前端视觉改动还应打开浏览器检查：

```text
http://127.0.0.1:5173/console/articles
http://127.0.0.1:5173/console/manage/comments
http://127.0.0.1:5173/login
http://127.0.0.1:5173/register
```

## 当前本地管理员账号

开发环境默认管理员：

```text
admin@example.com
admin123456
```

不要把生产密钥、真实密码或敏感配置写进代码。
