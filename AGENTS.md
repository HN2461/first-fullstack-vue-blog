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
- 控制台菜单显示、挂载位置、角色可见性必须以后端数据库菜单和 RBAC 权限为准；前端只保留必要静态路由、路由组件映射和路径识别兜底，不允许把业务菜单可见性写死在前端。
- 知识库文章目录属于系统内置模块菜单，只允许控制显示和挂载位置，不允许承载普通业务菜单。
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
- 页面主体优先使用「筛选/工具条 + 表格/表单/列表工作区」结构；除非明确要求，不要额外增加突兀的页面头部标题、状态文字、说明段落或宣传式描述。
- 必要说明优先放在工具栏、字段标签或操作按钮附近的说明图标中，通过 tooltip / popover 展示，不要直接占用页面头部空间。
- 所有选择器默认必须支持搜索筛选；使用 Ant Design Vue `a-select` / 级联选择 / 树选择等组件时，应开启 `show-search`、`option-filter-prop` 或等价过滤能力，除非选项极少且用户明确不需要。
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
- `/console/article-directory`：知识库文章目录系统模块。
- `/console/article-directory/articles/:slug`：文章目录下文章详情。
- `/console/search`：控制台全文检索。
- `/console/articles/:slug`：控制台文章详情。
- `/console/memos`：个人备忘录。
- `/console/profile`：个人信息。
- `/console`：管理员工作台。
- `/console/manage/articles`：文章管理。
- `/console/manage/articles/import`：文章导入。
- `/console/manage/categories`：分类管理。
- `/console/manage/tags`：标签管理。
- `/console/manage/comments`：评论审核。
- `/console/manage/users`：用户管理。
- `/console/manage/media`：媒体资产。
- `/console/manage/menus`：菜单管理。
- `/console/manage/roles`：角色管理。
- `/console/manage/approvals`：权限审批。
- `/console/manage/notifications`：公告管理。
- `/console/manage/settings`：系统设置。
- `/console/manage/monitor`：服务监控。
- `/console/manage/project-timeline`：项目记录台账。
- `/console/manage/trash`：回收站。

## 权限与流程

- 未登录访问控制台页面必须跳转登录。
- 普通用户登录后进入知识库系统，可查看文章、搜索、互动、查看个人信息。
- 管理员登录后可切换到后台管理，访问内容管理、用户管理、评论审核、系统设置等。
- 登录 / 注册成功后进入 `/console` 或对应重定向地址。

## 开发约束

- 所有源码和配置文件使用 UTF-8 无 BOM。
- 保持中文可读，禁止乱码。
- 完成明确功能、问题修复或重要版本调整后，必须维护当天项目记录文件：
  - 文件路径：`backend/src/data/projectTimeline/daily/YYYY-MM-DD.json`。
  - 当天文件只记录当天协作完成的功能点，不混入其他日期。
  - 项目记录不是碎片流水账；同一功能类、同一问题链路或同一协作主题应尽量合并成一条记录。
  - 需要表达多个动作时，在同一条记录的 `detail` 中使用 `1.`、`2.`、`3.` 分点说明，不要拆成多条相近消息。
  - 若已有对应记录，优先补充完善 `detail`；只有确实属于不同功能类或不同协作主题时才新增一项。
  - 文件格式以 `docs/02-开发指南/项目记录台账导入格式.md` 为准，便于后续在后台页面直接导入线上项目记录台账。
- Vue / JS 代码风格：
  - 2 空格缩进。
  - 单引号。
  - 不使用分号。
- 代码拆分硬约束：
  - 所有源码文件行数统一控制在 450–500 行区间：低于 450 行为正常，超过 450 行必须优先拆分，任何文件不得超过 500 行。
  - Vue 单文件组件、JS / TS 工具文件均适用同一标准。
  - 弹窗、树形、表格、专属业务逻辑、公共选择器必须抽离为独立组件或工具函数。
  - 超大文件禁止继续叠加新业务，避免迭代时覆盖或丢失原有交互逻辑。
- 不要随意重构无关模块。
- 不要回退用户已经确认过的整体控制台骨架。
- 若要修改控制台布局，必须先确认是否会影响：
  - 顶部一级导航。
  - 左侧折叠菜单。
  - 浅色/深色主题一致性。
  - 普通用户/管理员权限差异。

## 后端发布与文件放置规则

- 后端发布包由 `scripts/package-release.ps1` 统一生成，输出到 `release/backend-release.zip`。
- 后端发布采用白名单打包，不要直接压缩整个 `backend` 目录作为发布包。
- 后端发布包默认包含：
  - `backend/package.json`
  - `backend/package-lock.json`
  - `backend/ecosystem.config.cjs`
  - `backend/src`
  - `backend/tests`
  - `backend/.env.example`
  - `backend/README.md`
  - `backend/vitest.config.js`
- 后端发布包必须排除：
  - `backend/.env`
  - `backend/node_modules`
  - `backend/uploads`
  - `backend/logs`
  - `backend/legacy-notes`
- 新增后端业务代码时，优先放到 `backend/src` 下对应目录：`routes`、`services`、`models`、`validators`、`constants`、`middlewares`、`utils`、`scripts`。
- 新增后端测试时放到 `backend/tests`。
- 只要新增文件位于 `backend/src` 或 `backend/tests`，发布脚本会自动打进后端发布包。
- 如果新增 `backend` 根目录下的运行必需目录，例如 `templates`、`public`、`views`、`migrations`、`prisma`、`openapi`，必须同步更新 `scripts/package-release.ps1`，把该目录加入发布白名单。
- 服务器生产 `.env` 必须由服务器独立维护，本地 `.env` 不得进入发布包，也不得覆盖服务器 `.env`。
- 线上上传文件属于运行数据，不能通过本地发布包覆盖。

## 数据库发布与迁移规则

- 数据库发布默认不是整库覆盖；普通发布只做 MongoDB 备份，不迁移、不恢复。
- 发布前必须先判断 `backend/src/models`、`backend/src/services`、`backend/src/scripts`、`backend/src/validators`、`backend/src/constants` 是否存在数据结构、枚举、权限、关联关系变化。
- 需要迁移数据库时，优先新增一次性脚本到 `backend/src/scripts`，脚本默认 dry-run，只有传入 `--apply` 才允许写库。
- 迁移脚本必须先明确筛选范围、打印影响数量，并在发布前确认已有 `mongodump` 备份。
- 项目记录台账不通过整库迁移同步日常协作记录；日常记录优先维护 `backend/src/data/projectTimeline/daily/YYYY-MM-DD.json`，部署后在后台“项目记录台账”页面使用“导入记录”按钮导入线上数据库。
- 每日项目记录 JSON 导入必须保持幂等，依赖 `source + date + records[].id` 去重；同一文件重复导入不得生成重复记录。
- 只有在明确要用本地数据库替换线上数据库时，才允许使用 `mongorestore --drop` 整库覆盖。
- 数据库回滚会丢失发布后新增数据，只有确认数据被改坏时才执行。
- 数据库发布、迁移、验证和回滚流程以 `docs/03-部署发布/数据库发布与迁移流程.md` 为准。

## 文章导出与导入规则

- 导出功能会把每篇文章正文 + 顶部 Front Matter 打包成 ZIP，并附带一个 `README.md` 说明文件。
- Front Matter 中 `originalId`、`originalSlug`、`exportedAt` 是导出专属字段，仅用于人工参考，不参与导入时的自动覆盖更新。
- 导出默认为 slug 追加 `-revision-日期` 后缀，避免重新导入时与原文章 slug 冲突。
- **导入不会覆盖、更新原文章，只作为新草稿创建。** 导入时系统按 slug 检查，已存在则跳过，不存在则新建草稿。
- 导入目前只支持"跳过重复"策略，不支持覆盖更新原文章。
- 完整工作流是：导出 → 在本地或交给 AI 修改 Markdown → 导入为新草稿 → 手动在后台发布、调整分类/目录挂载、下架或删除旧文章。
- 如果后续需要"导入覆盖原文章"能力，必须改造后端导入逻辑（读取 originalId/originalSlug 匹配、新增覆盖策略），并同步更新本规则。

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
http://127.0.0.1:5173/console/article-directory
http://127.0.0.1:5173/console/manage/comments
http://127.0.0.1:5173/console/manage/project-timeline
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
