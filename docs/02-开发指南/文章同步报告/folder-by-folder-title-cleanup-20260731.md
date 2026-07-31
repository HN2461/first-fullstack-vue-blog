# 文章文件夹分批基础配置整改报告

## 范围

- 处理范围：`output/线上文章` 中除 `安卓APK` 外的根目录。
- 跳过范围：`安卓APK`，按当前要求暂不处理。
- 写入范围：仅本地 `output/线上文章` 的 Markdown Front Matter、必要的首个同名 H1 和 `manifest.json`。
- 未执行：未写入线上数据库，未修改正文主体，未执行分类迁移。

## 文件夹审计结果

| 根目录 | 文章数 | 处理结果 |
| --- | ---: | --- |
| AI相关 | 115 | 修改 28 篇标题格式 |
| 常用缺易忘 | 25 | 未发现机械可修问题 |
| 电脑 | 27 | 未发现机械可修问题；部署系列标题已符合 `第 N 篇：` |
| 后端技术 | 75 | 未发现机械可修问题 |
| 面试 | 10 | 未发现机械可修问题 |
| 前端技术 | 148 | 修改 7 篇标题分隔符格式；保留 `session_key` 字段名 |
| 我的总结 | 52 | 修改 43 篇标题格式 |
| 项目复用技术 | 55 | 修改 8 篇标题分隔符格式 |
| Web安全 | 2 | 未发现机械可修问题 |
| 安卓APK | 3 | 按要求跳过 |

## 已执行修改

### AI相关

- 将 MaxKB 系列 `NN-标题` 统一为 `NN：标题`。
- 将 CatPaw 系列 `第N篇：标题` 统一为 `第 N 篇：标题`。
- 同步更新 Front Matter、首个同名 H1、`manifest.json` 的 `title` 与 `contentHash`。
- 变更明细：`docs/02-开发指南/文章同步报告/ai-related-title-cleanup-20260731.json`。
- 本地备份：`backups/ai-related-before-title-cleanup-20260731-1210`。

### 我的总结

- 将 `第16篇：标题`、`第04篇：标题` 等统一为 `第 16 篇：标题`、`第 4 篇：标题`。
- 将标题中的 `_` 统一为空格，例如 `Vue3_Composition_API核心笔记` 调整为 `Vue3 Composition API核心笔记`。
- 同步更新 Front Matter、首个同名 H1、`manifest.json` 的 `title` 与 `contentHash`。
- 变更明细：`docs/02-开发指南/文章同步报告/my-summary-title-cleanup-20260731.json`。
- 本地备份：`backups/my-summary-before-title-cleanup-20260731-1220`。

### 项目复用技术

- 修改 8 篇标题分隔符格式，将标题中的分隔性 `_` 统一为中文冒号、顿号或连接词。
- 保留 `wx.qy.login`、`ww.createWWLoginPanel`、`corpId`、`agentId` 等技术标识原文，不做字段名破坏性替换。
- 同步更新 Front Matter 与 `manifest.json` 的 `title` 与 `contentHash`。
- 变更明细：`docs/02-开发指南/文章同步报告/reuse-frontend-title-cleanup-20260731.json`。
- 本地备份：`backups/reuse-tech-before-title-cleanup-20260731-1430`。

### 前端技术

- 修改 7 篇 `AI版CSS` 标题分隔符格式，将标题中的分隔性 `_` 统一为中文冒号、顿号或空格。
- 保留 `session_key` 等技术字段名原文，不作为标题异常处理。
- 同步更新 Front Matter 与 `manifest.json` 的 `title` 与 `contentHash`。
- 变更明细：`docs/02-开发指南/文章同步报告/reuse-frontend-title-cleanup-20260731.json`。
- 本地备份：`backups/frontend-tech-before-title-cleanup-20260731-1430`。

## 验证结果

- 权威快照读取通过：512 篇文章、96 个分类。
- 除 `安卓APK` 外，剩余 1 个下划线候选为 `session_key` 技术字段名，已确认保留，不属于标题格式异常。
- 编码检查通过：未发现 UTF-8 BOM。

## 后续事项

当前修改仍停留在本地权威快照。若要同步线上数据库，需要走文章权威对比和按 slug 分批同步流程，写库前必须先执行 dry-run 并确认 MongoDB 备份。

## 人工语义整理追加批次

### 前端技术 / Vue / vue3

- 处理 6 篇 Vue 3 系列文章，将旧导入标题 `vue3初相识》`、`Vue3基本语法》`、`组件通讯》`、`Pinia》`、`路由》`、`其他Apis》` 规范为 `第 1 篇` 到 `第 6 篇` 的连续阅读标题。
- 同步重命名本地导出 Markdown 文件，例如 `路由》.md` 改为 `第 5 篇：Vue Router 路由.md`，并更新 `manifest.json` 的 `fileName`；历史 `sourcePath` 保留不动，仅用于溯源。
- 将目录内文章 `sortOrder` 调整为 10、20、30、40、50、60，使左侧知识库目录按学习路径展示：初相识、基本语法、组件通信、Pinia、Vue Router、其他 API。
- 为 6 篇文章补充摘要和检索标签，标签按主题控制在 4 个左右，避免继续产生无意义长尾标签。
- 保持分类路径 `前端技术 / Vue / vue3` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/vue3-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/vue3-folder-before-semantic-cleanup-20260731-1450`。

### 前端技术 / Vue / vue2

- 处理 23 篇 Vue 2 系列文章，将旧导入标题 `vue2初体验》`、`.1、模版语法》`、`route》`、`Vuex的使用》` 等规范为连续阅读标题。
- 拆分稿作为主线阅读顺序，按 `第 1 篇` 到 `第 22 篇` 排列：初体验、模板语法、MVVM、事件处理、计算/侦听、样式绑定、渲染、列表、表单/过滤器、指令、响应式、生命周期、组件、单文件组件、脚手架、组件通信、mixins/plugins/scoped、Ajax、axios、Vuex、Vue Router、动画与过渡。
- `vue2.md` 为 43 万字符综合稿，未删除，改名为 `Vue 2 完整整理版` 并放在 `sortOrder: 230`，作为备查资料，不抢占主线阅读入口。
- 同步重命名 23 个本地导出 Markdown 文件，并更新 `manifest.json` 的 `fileName`；历史 `sourcePath` 保留不动，仅用于溯源。
- 为 23 篇文章补充摘要和检索标签，标签按主题控制在 4 个左右，避免空标签和无意义长尾标签。
- 保持分类路径 `前端技术 / Vue / vue2` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/vue2-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/vue2-folder-before-semantic-cleanup-20260731-1510`。
- 说明：Windows 文件管理器按文件名字典序显示时，`第 10 篇` 可能排在 `第 2 篇` 前；线上知识库目录不依赖文件名字典序，而是按文章 `sortOrder` 升序展示。

### 前端技术 / Vue / vue面试题

- 处理 4 篇 Vue 面试题文章，按复习路径整理为：凝练版、Vue 2 面试题、Vue 3 面试题、修订完整版。
- 将旧标题 `Vue面试题凝练版`、`vue2面试题`、`vue3面试题`、`面试题修改篇` 规范为 `第 1 篇` 到 `第 4 篇` 的阅读标题。
- 将 `sortOrder` 调整为 10、20、30、40，使线上目录先展示短复习稿，再展示分版本题目，最后展示完整修订题库。
- 同步重命名 4 个本地导出 Markdown 文件，并更新 `manifest.json` 的 `fileName`；历史 `sourcePath` 保留不动，仅用于溯源。
- 为 4 篇文章补充摘要和检索标签，保持分类路径 `前端技术 / Vue / vue面试题` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/vue-interview-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/vue-interview-folder-before-semantic-cleanup-20260731-1530`。

### 菜单排序保护

- 知识库侧栏分类按分类 `sortOrder` 升序展示，文章按文章 `sortOrder` 升序展示；顶部和后台管理菜单按 RBAC 菜单 `sortOrder` 展示。
- 本地文章整理阶段只允许改目标文件夹内文章的 `sortOrder`，不改 RBAC 菜单排序。
- 标题整理时必须同步整理本地导出文件名和 `manifest.json` 的 `fileName`，避免本地阅读和后续对比继续显示旧导入残留名称。
- 同步线上前必须 dry-run 输出文章排序变更清单；涉及分类排序或 RBAC 菜单排序时必须单独确认，不能混在文章内容同步中直接写入。
