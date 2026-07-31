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
- 同步重命名本地导出 Markdown 文件，例如 `路由》.md` 改为 `第 05 篇：Vue Router 路由.md`，并更新 `manifest.json` 的 `fileName`；历史 `sourcePath` 保留不动，仅用于溯源。
- 将目录内文章 `sortOrder` 调整为 10、20、30、40、50、60，使左侧知识库目录按学习路径展示：初相识、基本语法、组件通信、Pinia、Vue Router、其他 API。
- 为 6 篇文章补充摘要和检索标签，标签按主题控制在 4 个左右，避免继续产生无意义长尾标签。
- 保持分类路径 `前端技术 / Vue / vue3` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/vue3-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/vue3-folder-before-semantic-cleanup-20260731-1450`。

### 前端技术 / Vue / vue2

- 处理 23 篇 Vue 2 系列文章，将旧导入标题 `vue2初体验》`、`.1、模版语法》`、`route》`、`Vuex的使用》` 等规范为连续阅读标题。
- 拆分稿作为主线阅读顺序，按 `第 1 篇` 到 `第 22 篇` 排列：初体验、模板语法、MVVM、事件处理、计算/侦听、样式绑定、渲染、列表、表单/过滤器、指令、响应式、生命周期、组件、单文件组件、脚手架、组件通信、mixins/plugins/scoped、Ajax、axios、Vuex、Vue Router、动画与过渡。
- `vue2.md` 为 43 万字符综合稿，未删除，改名为 `Vue 2 完整整理版` 并放在 `sortOrder: 230`，作为备查资料，不抢占主线阅读入口。
- 同步重命名 23 个本地导出 Markdown 文件，主线文件名采用两位序号，例如 `第 01 篇：Vue 2 初体验.md`，并更新 `manifest.json` 的 `fileName`；历史 `sourcePath` 保留不动，仅用于溯源。
- 为 23 篇文章补充摘要和检索标签，标签按主题控制在 4 个左右，避免空标签和无意义长尾标签。
- 保持分类路径 `前端技术 / Vue / vue2` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/vue2-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/vue2-folder-before-semantic-cleanup-20260731-1510`。
- 说明：为兼顾本地阅读，主线文件名已使用 `第 01 篇` 到 `第 22 篇` 的两位序号，避免 Windows 文件管理器字典序把 `第 10 篇` 排到 `第 2 篇` 前。

### 前端技术 / Vue / vue面试题

- 处理 4 篇 Vue 面试题文章，按复习路径整理为：凝练版、Vue 2 面试题、Vue 3 面试题、修订完整版。
- 将旧标题 `Vue面试题凝练版`、`vue2面试题`、`vue3面试题`、`面试题修改篇` 规范为 `第 1 篇` 到 `第 4 篇` 的阅读标题。
- 将 `sortOrder` 调整为 10、20、30、40，使线上目录先展示短复习稿，再展示分版本题目，最后展示完整修订题库。
- 同步重命名 4 个本地导出 Markdown 文件，文件名采用 `第 01 篇` 到 `第 04 篇` 的两位序号，并更新 `manifest.json` 的 `fileName`；历史 `sourcePath` 保留不动，仅用于溯源。
- 为 4 篇文章补充摘要和检索标签，保持分类路径 `前端技术 / Vue / vue面试题` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/vue-interview-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/vue-interview-folder-before-semantic-cleanup-20260731-1530`。

### 前端技术 / Vue / Ai的vue

- 处理 30 篇 AI 辅助 Vue 学习文章。原排序从附录 F、附录 E 开始，真正第 1 章排在最后；已改为第 1 章到第 24 章、附录 A 到附录 F 的正向学习顺序。
- 标题规范为 `第 1 章：...` 到 `第 24 章：...`，附录规范为 `附录 A：...` 到 `附录 F：...`。
- 将 `sortOrder` 调整为 10 到 300，使线上目录按章节顺序展示：Vue 概念、环境准备、实例绑定、模板语法、渲染、表单、响应式、计算/监听、生命周期、组件、路由、Vuex、工程化、Axios、实战、优化、问题、迁移、附录。
- 同步重命名 30 个本地导出 Markdown 文件，章节文件名采用 `第 01 章` 到 `第 24 章` 的两位序号，附录文件名采用 `附录 A` 到 `附录 F`，并更新 `manifest.json` 的 `fileName`。
- 为 30 篇文章补充摘要和检索标签，保持分类路径 `前端技术 / Vue / Ai的vue` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/ai-vue-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/ai-vue-folder-before-semantic-cleanup-20260731-1545`。

### Vue 体系整理状态

- `前端技术 / Vue` 下 4 个子目录已完成本地文章层整理：`vue2`、`vue3`、`vue面试题`、`Ai的vue`。
- 共涉及 63 篇 Vue 文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 分类路径暂不改名，避免把分类树变更与文章内容整理混在一起；如后续要把 `Ai的vue` 改成更规范的分类名，应单独 dry-run 分类迁移。

### 前端技术 / 前端三剑客 / AI版HTML

- 处理 9 篇 AI 辅助 HTML 教程文章。原排序为 SVG、目录、第四篇、第六篇、第二篇、第五篇、第三篇、第一篇、番外，阅读路径被打乱。
- 已整理为：HTML 完整教程目录、初识 HTML、HTML 基础语法、构建网页内容、表单与交互、现代 HTML 实践、HTML 实战与进阶方向、SVG 入门、HTML 补充知识。
- 将 `sortOrder` 调整为 10 到 90，使线上目录按学习顺序展示；本地文件名采用 `第 01 篇` 到 `第 09 篇`，保证文件管理器阅读顺序一致。
- 清理标题中的书名号残留，例如 `《现代HTML实践——迈向专业前端》` 规范为 `第 5 篇：现代 HTML 实践`。
- 为 9 篇文章补充摘要和检索标签，保持分类路径 `前端技术 / 前端三剑客 / AI版HTML` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/ai-html-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/ai-html-folder-before-semantic-cleanup-20260731-1610`。

### 前端技术 / 前端三剑客 / AI版CSS

- 处理 9 篇 AI 辅助 CSS 教程文章。原排序为第三篇、SCSS 补充篇、第四篇、第六篇、第五篇、第二篇、第一篇、番外、第七篇，阅读路径被打乱。
- 已整理为：认识 CSS、CSS 核心、现代布局、强化视觉、构建真实页面、CSS 进阶、综合实战、工具技巧速查、SCSS 常见写法速通。
- 将 `sortOrder` 调整为 10 到 90，使线上目录按 CSS 学习顺序展示；本地文件名采用 `第 01 篇` 到 `第 09 篇`，保证文件管理器阅读顺序一致。
- 将 SCSS 文章从原先第 2 位调整到补充篇位置，避免在 CSS 基础尚未铺开时提前进入预处理器语法。
- 为 9 篇文章补充摘要和检索标签，保持分类路径 `前端技术 / 前端三剑客 / AI版CSS` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/ai-css-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/ai-css-folder-before-semantic-cleanup-20260731-1625`。

### 前端技术 / 前端三剑客 / AI版JS

- 处理 31 篇 AI 辅助 JavaScript 教程文章。原排序从第 9 章、第 8 章等中段内容开始，目录页和第 1 章排在后面，阅读路径被明显打乱。
- 已整理为：JavaScript 完整教程目录、第 1 章到第 30 章，覆盖语言认知、运行机制、变量、类型、运算符、流程控制、函数、对象、原型、数组、DOM、BOM、事件、异步、ES6、模块化、工程化、Node.js 和 Express。
- 将 `sortOrder` 调整为 10 到 310，使线上目录先展示教程目录，再按第 1 章到第 30 章展示；本地文件名采用 `第 00 篇` 和 `第 01 章` 到 `第 30 章`，保证文件管理器阅读顺序一致。
- 为 31 篇文章补充摘要和检索标签，并同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `前端技术 / 前端三剑客 / AI版JS` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/ai-js-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/ai-js-folder-before-semantic-cleanup-20260731-1635`。

### 前端技术 / 前端三剑客 / 青鸟版三剑客

- 处理 4 篇青鸟版三剑客旧课堂笔记。原排序为 JavaScript 高级、JavaScript 基础、HTML/CSS、`ess`，不符合基础学习顺序。
- 已整理为：HTML 与 CSS 综合笔记、JavaScript 基础笔记、ES6+ 语法笔记、JavaScript 高级笔记。
- 将 `sortOrder` 调整为 10、20、30、40，使线上目录按前端三剑客学习路径展示；本地文件名采用 `第 01 篇` 到 `第 04 篇`，保证文件管理器阅读顺序一致。
- 将旧标题 `html+css笔记`、`js`、`ess`、`js高级` 规范为可阅读标题，补充摘要和检索标签，并同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `前端技术 / 前端三剑客 / 青鸟版三剑客` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/qingniao-trio-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/qingniao-trio-folder-before-semantic-cleanup-20260731-1645`。

### 菜单排序保护

- 知识库侧栏分类按分类 `sortOrder` 升序展示，文章按文章 `sortOrder` 升序展示；顶部和后台管理菜单按 RBAC 菜单 `sortOrder` 展示。
- 本地文章整理阶段只允许改目标文件夹内文章的 `sortOrder`，不改 RBAC 菜单排序。
- 标题整理时必须同步整理本地导出文件名和 `manifest.json` 的 `fileName`，避免本地阅读和后续对比继续显示旧导入残留名称。
- 同步线上前必须 dry-run 输出文章排序变更清单；涉及分类排序或 RBAC 菜单排序时必须单独确认，不能混在文章内容同步中直接写入。
