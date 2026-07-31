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

### 前端技术 / uni-app / 通用基础

- 处理 4 篇 uni-app 通用基础文章。文章摘要和标签已有基础质量，主要问题是原排序为 04、03、02、01，阅读顺序倒置。
- 已整理为：uni-app 到底是什么、应用生命周期、工程结构与配置基础、跨端开发通用方法。
- 将 `sortOrder` 调整为 10、20、30、40，使线上目录按基础认知、生命周期、工程配置、通用 API 方法展示；本地文件名采用 `第 01 篇` 到 `第 04 篇`，保证文件管理器阅读顺序一致。
- 同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`；保留已有高质量摘要和标签，仅按新标题收敛展示名称。
- 保持分类路径 `前端技术 / uni-app / 通用基础` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/uniapp-general-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/uniapp-general-folder-before-semantic-cleanup-20260731-1655`。

### 前端技术 / uni-app / 微信小程序

- 处理 9 篇 uni-app 微信小程序文章。原排序将 eventChannel、特殊能力放在前面，底层逻辑排到最后，不适合从基础到实战阅读。
- 已整理为：底层逻辑、工程结构与联调、常用功能全景、常见能力接法、登录态缓存权限与稳定性治理、组件设计与跨端差异、特殊能力与微信能力边界、eventChannel 页面通信、性能优化与包体治理。
- 将 `sortOrder` 调整为 10 到 90，使线上目录按基础认知、工程配置、功能总览、专项能力、治理与性能的顺序展示；本地文件名采用 `第 01 篇` 到 `第 09 篇`，并明显缩短旧长文件名。
- 对 `08-常用功能全景` 和 `04-性能优化` 未机械按 sourcePath 排序：总览型文章提前到常见能力前，性能优化放到最后；历史 `sourcePath` 保留用于溯源。
- 同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`，摘要和标签按新标题做轻量收敛。
- 保持分类路径 `前端技术 / uni-app / 微信小程序` 不变，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/uniapp-wechat-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/uniapp-wechat-folder-before-semantic-cleanup-20260731-1705`。

### 前端技术 / 组件库 / ECharts

- 处理 6 篇 ECharts 文章。内容顺序和摘要标签已有基础质量，主要问题是标题使用 `第一篇` 到 `第六篇`，本地文件名未使用两位序号。
- 已整理为：快速认识 ECharts、常见四类图表、dataset/dimensions/encode/transform、Vue 3 + Vite 图表组件封装、交互与联动、项目开发速查清单。
- 保持 `sortOrder` 为 10 到 60 的原正向顺序；本地文件名改为 `第 01 篇` 到 `第 06 篇`，同时保留关键内容范围，例如 `dataset、dimensions、encode、transform`、`tooltip、legend、dataZoom、dispatchAction`。
- 同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`；保留原有带官方资料核对日期的摘要和已有标签。
- 按用户反馈补强“见名知意”要求：不再将 `交互与联动`、`项目开发速查清单` 等文件名压缩到只剩主题，而是补回安装、封装、上线排查或具体交互组件信息。
- 保持分类路径 `前端技术 / 组件库 / ECharts` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/echarts-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/echarts-folder-before-semantic-cleanup-20260731-1715`。

### 前端技术 / 组件库 / ElementPlus

- 处理 10 篇 Element Plus 文章。原排序为基础组件、反馈补全、表单进阶、数据展示、导航体系、快速认识、主题全局能力、中后台核心、表单体系、安装引入，第一篇和安装篇被排到中后段。
- 已整理为：快速认识 Element Plus、安装与引入、基础组件、表单体系、表单进阶组件、中后台核心组件、导航体系、全局能力、数据展示扩展组件、反馈/浮层/虚拟化组件。
- 将 `sortOrder` 调整为 10 到 100，使线上目录按认知、接入、基础组件、业务高频组件、全局能力和扩展组件的路径展示；本地文件名采用 `第 01 篇` 到 `第 10 篇`，并保留核心组件范围，例如 `Button、Icon、Container`、`Form、Input、Select`、`Table、Pagination、Dialog`。
- 表单进阶未机械保留旧第八篇位置，而是放到表单体系后；主题和全局能力放到核心组件、导航之后，避免刚接入就进入全局配置细节。
- 同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`；保留原有带官方资料核对日期的摘要，并收敛标签命名，例如 `input` 统一为 `Input`。
- 按用户反馈补强“见名知意”要求：已将过短的 `基础组件`、`表单体系`、`中后台核心组件` 等标题和本地文件名补充为具体组件清单，避免只看文件名无法判断文章范围。
- 保持分类路径 `前端技术 / 组件库 / ElementPlus` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/element-plus-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/element-plus-folder-before-semantic-cleanup-20260731-1725`。

### 前端技术 / 组件库 / uvui

- 处理 3 篇 uv-ui 文章。内容顺序和摘要标签已有基础质量，主要问题是标题使用 `第一篇` 到 `第三篇`，本地文件名未使用两位序号。
- 已整理为：快速认识 uv-ui、uv-ui 入门安装与小程序配置、uv-ui 请求封装与使用指南。
- 保持 `sortOrder` 为 10、20、30 的原正向顺序；本地文件名改为 `第 01 篇` 到 `第 03 篇`，并保留关键内容范围，例如安装、扩展配置、组件地图、easycom、SCSS、HTTP、拦截器、上传下载。
- 同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`；保留原有带官方资料核对日期的摘要和已有标签。
- 按用户反馈补强“见名知意”要求：不再将第一篇文件名压缩为 `快速认识 uv-ui`，已补回安装、扩展配置、组件地图和项目路线。
- 保持分类路径 `前端技术 / 组件库 / uvui` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/uvui-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/uvui-folder-before-semantic-cleanup-20260731-1735`。

### 组件库体系整理状态

- `前端技术 / 组件库` 下 3 个子目录已完成本地文章层整理：`ECharts`、`ElementPlus`、`uvui`。
- 共涉及 19 篇组件库文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 后续文章整理新增命名规则：标题和本地导出文件名必须在保持阅读序号的同时保留核心内容范围，不能为了缩短文件名牺牲见名知意。
- 分类路径暂不改名，避免把分类树变更与文章内容整理混在一起；如后续要把 `uvui` 改成 `uv-ui`、`ElementPlus` 改成 `Element Plus`，应单独 dry-run 分类迁移。

### 常用缺易忘 / 工具速查

- 处理 4 篇直接归属于 `常用缺易忘 / 工具速查` 的通用速查文章。原排序为时间戳、window API、Markdown、Canvas，且 Markdown、时间戳、Canvas 缺少摘要和标签。
- 已整理为：Markdown 完全指南、JavaScript 时间戳完全指南、window 对象常用 API 速查、HTML5 Canvas 入门笔记。
- 将 `sortOrder` 调整为 10、20、30、40，使线上目录按通用写作工具、时间处理、浏览器 BOM、图形绘制的路径展示；本地文件名采用 `第 01 篇` 到 `第 04 篇`。
- 按见名知意要求保留关键内容范围，例如 Markdown 的标题、列表、表格、代码块，时间戳的获取、转换、格式化、时区，window API 的 location、history、navigator、postMessage，Canvas 的画布、路径、图形、文字、图片绘制。
- 为缺少摘要和标签的文章补齐摘要和检索标签，同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `常用缺易忘 / 工具速查` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 常用缺易忘 / 工具速查 / Git

- 处理 3 篇 Git 速查文章。原排序整体可用，但本地文件名缺少阅读序号，标题格式不统一。
- 已整理为：Git 账号密码与平台认证、Git 命令速查与常见问题、Git 分支追踪与 VSCode 发布提示排障。
- 保持语义顺序为认证概念、常用命令、分支追踪排障；本地文件名采用 `第 01 篇` 到 `第 03 篇`。
- 按见名知意要求保留关键内容范围，例如平台认证、HTTPS、SSH、Token，提交、分支、撤销、回退、GitHub 连接，upstream、fetch、远程分支。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 变更明细：`docs/02-开发指南/文章同步报告/common-tools-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/common-tools-folder-before-semantic-cleanup-20260731-1745`。

### 常用缺易忘 / 浏览器与网络

- 处理 7 篇浏览器与网络文章。原排序将前端各种帧放在第一、DNS 放在最后，且 DNS、TCP、HTTP、HTTP 缓存、输入 URL 全过程、浏览器渲染等文章缺少摘要和标签。
- 已整理为：DNS 域名解析、TCP 三次握手、HTTP 协议、HTTP 缓存机制、从输入 URL 到页面显示全过程、浏览器渲染原理、前端里的各种帧。
- 将 `sortOrder` 调整为 10 到 70，使线上目录按网络基础、协议与缓存、完整访问链路、浏览器渲染、帧概念辨析的路径展示；本地文件名采用 `第 01 篇` 到 `第 07 篇`。
- 按见名知意要求保留关键内容范围，例如 DNS 的分层查询、记录类型、缓存与排障，TCP 的 SYN/ACK 和两次/四次问题，HTTP 的请求报文、响应报文、状态码与请求头，渲染原理的 DOM、CSSOM、布局、绘制、合成。
- 为缺少摘要和标签的文章补齐摘要和检索标签，同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `常用缺易忘 / 浏览器与网络` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/browser-network-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/browser-network-folder-before-semantic-cleanup-20260731-1755`。

### 常用缺易忘 / 数据类型

- 处理 7 篇数据类型文章。原排序从浏览器三大存储开始，编码、MIME、JSON/FormData、二进制类型和 IndexedDB 混在一起，且多数文章缺少摘要和标签。
- 已整理为：字符 vs 字节与 charset=utf-8、MIME 媒体类型、JSON 与 FormData、File/Blob/ArrayBuffer/Base64 区别、Blob 底层本质、浏览器三大存储、IndexedDB 什么时候该上。
- 将 `sortOrder` 调整为 10 到 70，使线上目录按编码基础、HTTP 数据类型、请求体格式、二进制处理、浏览器存储的路径展示；本地文件名采用 `第 01 篇` 到 `第 07 篇`。
- 按见名知意要求保留关键内容范围，例如 ASCII、UTF-8、密钥长度、Content-Type、文件上传、上传下载预览、构造函数、类型转换、localStorage、sessionStorage、Cookie、事务与复杂度取舍。
- 为缺少摘要和标签的文章补齐摘要和检索标签，同步规范 Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `常用缺易忘 / 数据类型` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/data-types-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/data-types-folder-before-semantic-cleanup-20260731-1805`。

### 常用缺易忘 / 网络请求

- 处理 4 篇网络请求文章。原排序将认证、安全与文件上传放在第一，基础 HTTP 请求与请求工具对比放在后面，阅读路径不够自然。
- 已整理为：前端 HTTP 请求与接口联调手册、Fetch/Axios/XHR 详解、Fetch API 避坑指南、前端认证安全与文件上传协作手册。
- 将 `sortOrder` 调整为 10、20、30、40，使线上目录按 HTTP 联调心智、请求工具对比、Fetch 专项避坑、认证安全与上传协作展示；本地文件名采用 `第 01 篇` 到 `第 04 篇`。
- 按见名知意要求保留关键内容范围，例如请求头、状态码、缓存、下载、实时通信，Fetch、Axios、XHR，response.ok、业务 code、超时、取消、通用封装，Token、Cookie、CORS、OAuth2、FormData。
- 为缺少摘要和标签的 `Fetch、Axios、XHR 详解` 补齐摘要和检索标签，同步规范其他文章摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `常用缺易忘 / 网络请求` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/network-request-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/network-request-folder-before-semantic-cleanup-20260731-1815`。

### 常用缺易忘整理状态

- `常用缺易忘` 下已完成本地文章层整理：`工具速查`、`工具速查/Git`、`浏览器与网络`、`数据类型`、`网络请求`。
- 共涉及 25 篇常用速查文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 分类路径暂不改名，避免把分类树变更与文章内容整理混在一起。

### 电脑 / 电脑网络 / 代理与VPN

- 处理 5 篇代理与 VPN 文章。原排序将代理网络排障放在第 2 位，基础线路和协议认知放在后面，不利于先理解概念再排障。
- 已整理为：代理模式与流量接管方式、线路与代理协议基础、延迟测试与测速方法、IP 类型与风控判断、代理网络问题处理指南。
- 将 `sortOrder` 调整为 10 到 50，使线上目录按代理模式、线路协议、测速方法、IP 风控、Windows/VPN 排障的路径展示；本地文件名采用 `第 01 篇` 到 `第 05 篇`。
- 按见名知意要求保留关键内容范围，例如 Rule、Global、Direct、System Proxy、TUN，直连、中转、专线、VLESS Reality、Hysteria2，TCPing、ICMP、URL Test、RTT，家宽、机房、ISP、住宅代理，Windows 代理残留、WinHTTP、DNS、VPN 排障。
- 为缺少标签的文章补齐检索标签，同步规范摘要、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `电脑 / 电脑网络 / 代理与VPN` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/proxy-vpn-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/proxy-vpn-folder-before-semantic-cleanup-20260731-1825`。

### 电脑 / 电脑网络 / 网络基础

- 处理 3 篇 Windows 与开发网络基础文章。原顺序基本可用，但本地文件名缺少阅读序号，标题对文章范围的提示不够统一。
- 已整理为：开发必懂网络基础概念、Windows IP/DNS/网关/DHCP/私网公网速查、Windows hosts/DNS 缓存/网络类型/防火墙基础。
- 将 `sortOrder` 调整为 10、20、30，使线上目录按开发通用概念、Windows 网络配置、Windows 网络排障基础展示；本地文件名采用 `第 01 篇` 到 `第 03 篇`。
- 按见名知意要求保留关键内容范围，例如 IP、127.0.0.1、localhost、端口、DNS，IP、DNS、网关、DHCP、私网公网，hosts、DNS 缓存、网络类型、防火墙。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `电脑 / 电脑网络 / 网络基础` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/windows-network-basics-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/windows-network-basics-folder-before-semantic-cleanup-20260731-1835`。

### 电脑 / 电脑网络 / 网络排障

- 处理 1 篇 Windows 网络排障文章。原标题 `电脑WIFI图标消失修复` 信息量不足，本地文件名也缺少阅读序号。
- 已整理为：Windows WiFi 图标消失修复：WLAN AutoConfig、网络重置、开机自启。
- 保持 `sortOrder` 为 10；本地文件名采用 `第 01 篇`，并保留 WLAN AutoConfig、网络重置、开机自启等关键排障范围。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `电脑 / 电脑网络 / 网络排障` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/windows-network-troubleshooting-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/windows-network-troubleshooting-folder-before-semantic-cleanup-20260731-1845`。

### 电脑网络整理状态

- `电脑 / 电脑网络` 下已完成本地文章层整理：`代理与VPN`、`网络基础`、`网络排障`。
- 共涉及 9 篇电脑网络文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 分类路径暂不改名，避免把分类树变更与文章内容整理混在一起。

### 电脑 / 网站部署

- 处理 1 篇直接归属于 `电脑 / 网站部署` 的 GitHub Pages 部署文章。原标题已有基础质量，本次按见名知意要求补充阅读序号和关键范围。
- 已整理为：GitHub Pages 部署 Vue 博客完整教程：Vite base、Hash 路由、Actions 自动部署。
- 保持 `sortOrder` 为 10；本地文件名采用 `第 01 篇`，并保留 Vite base、Hash 路由、GitHub Actions 自动部署等关键部署范围。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `电脑 / 网站部署` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 电脑 / 网站部署 / 全栈部署入门

- 处理 7 篇全栈部署入门文章。原文件名使用 `第-1-篇` 一类连字符格式，阅读顺序可用但本地文件名和标题缺少关键范围。
- 已整理为：部署学习路线、SSH 与 Linux 服务器基础、Nginx/Vue 静态资源/反向代理/HTTPS、Node/Express/PM2 与环境变量、MongoDB 生产安全与备份、宝塔面板部署入门、Vue + Express + MongoDB 完整上线实战。
- 保持 `sortOrder` 为 10 到 70 的正向部署学习顺序；本地文件名采用 `第 01 篇` 到 `第 07 篇`。
- 按见名知意要求保留关键内容范围，例如 SSH、Linux、Nginx、PM2、MongoDB、安全、登录、密钥、端口、防火墙、刷新 404、证书、502、生产运行、日志、开机自启、认证、连接字符串、mongodump、宝塔、反向代理、SSL、HTTPS。
- 说明：Nginx 文章标题和 H1 保留 `/api`，但 Windows 文件名不能包含 `/`，因此本地文件名中使用 `api`。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `电脑 / 网站部署 / 全栈部署入门` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/website-deployment-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/website-deployment-folder-before-semantic-cleanup-20260731-1855`。

### 电脑部署整理状态

- `电脑 / 网站部署` 下已完成本地文章层整理：直接部署文章、`全栈部署入门`。
- 共涉及 8 篇部署文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 分类路径暂不改名，避免把分类树变更与文章整理混在一起。

### 电脑 / 系统与文件

- 处理 10 篇 Windows 系统与文件基础文章。原排序基本可用，主要问题是本地文件名没有统一阅读序号，部分文件名仍带有导出阶段的连字符残留。
- 已整理为：电脑卡死救急与常用快捷键、Windows 电脑基础概念入门、开发常用快捷键速查、管理员权限与 UAC、启动项与系统配置工具、常见系统路径与环境变量、用户目录体系、文件显示设置、C 盘空间清理、C 盘系统文件夹说明。
- 保持 `sortOrder` 为 10 到 100 的基础阅读顺序；本地文件名采用 `第 01 篇` 到 `第 10 篇`。
- 按见名知意要求保留关键内容范围，例如任务管理器、黑屏恢复、窗口操作、复制保存、开始菜单、任务栏、资源管理器、设置、终端、VS Code、Cursor、AI 编程工具、UAC、MSConfig、服务、干净启动、USERPROFILE、APPDATA、ProgramData、ProgramFiles、Users、Public、扩展名、隐藏文件、默认应用、Storage Sense、Windows.old、System32。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `电脑 / 系统与文件` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/windows-system-files-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/windows-system-files-folder-before-semantic-cleanup-20260731-1910`。

### 电脑整理状态

- `电脑` 根目录下已完成本地文章层整理：`电脑网络`、`网站部署`、`系统与文件`。
- 共涉及 27 篇电脑类文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 分类路径暂不改名，避免把分类树变更与文章整理混在一起。

### 后端技术 / Node.js

- 处理 6 篇直接归属于 `后端技术 / Node.js` 的 Node.js 基础文章。原顺序正确，主要问题是标题使用 `第一篇` 到 `第六篇`，本地文件名带导出连字符。
- 已整理为：Node.js 入门与 Buffer、fs 与 path 模块、HTTP 协议与 http 模块、Node.js 模块化系统、npm 包管理与 nvm 版本管理、Express 框架全解。
- 保持 `sortOrder` 为 10 到 60 的 Node.js 基础学习顺序；本地文件名采用 `第 01 篇` 到 `第 06 篇`。
- 按见名知意要求保留关键内容范围，例如运行环境、事件循环、全局对象、二进制数据、文件读写、目录操作、流式处理、跨平台路径、请求响应、状态码、GET/POST、原生服务器、CommonJS、require、module.exports、ESM、package.json、semver、本地全局包、Node 版本、路由、中间件、静态资源、模板、错误处理。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `后端技术 / Node.js` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/nodejs-direct-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/nodejs-direct-folder-before-semantic-cleanup-20260731-1925`。

### 后端技术 / Node.js / 接口与会话控制详解

- 处理 8 篇接口与会话控制文章。原顺序正确，但标题重复携带专题目录名，文件名也混有导出连字符，列表阅读噪音较大。
- 已整理为：RESTful 接口设计规范、Apipost 接口测试工具、Cookie 原理与实战、Session 原理与实战、JWT 认证原理与实战、密码安全与接口防护、完整认证系统实战、前后端联调与常见问题排查。
- 保持 `sortOrder` 为 10 到 80 的接口与认证学习顺序；本地文件名采用 `第 01 篇` 到 `第 08 篇`。
- 按见名知意要求保留关键内容范围，例如 URL 命名、HTTP 方法、状态码、统一响应、请求发送、Header、Token、环境变量、文档生成、Express 读写删除 Cookie、httpOnly、secure、sameSite、签名、express-session、Redis 存储、JWT 三段结构、签名验证、鉴权中间件、双 Token、bcrypt、参数校验、限流、helmet、安全响应头、注册登录、角色权限、CORS、Axios 拦截器、Refresh Token。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `后端技术 / Node.js / 接口与会话控制详解` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/nodejs-api-session-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/nodejs-api-session-folder-before-semantic-cleanup-20260731-1935`。

### 后端技术 / Node.js / MongoDB详解

- 处理 7 篇 MongoDB 系列文章。原顺序正确，但标题使用 `MongoDB 详解第一篇` 等格式，本地文件名带导出连字符。
- 已整理为：MongoDB 安装与基础概念、MongoDB 原生 CRUD、Mongoose 连接与 Schema 建模、Mongoose CRUD 与中间件、MongoDB 关联查询与聚合管道、MongoDB 索引优化与事务、Express + MongoDB 完整项目实战。
- 保持 `sortOrder` 为 10 到 70 的 MongoDB 学习顺序；本地文件名采用 `第 01 篇` 到 `第 07 篇`。
- 按见名知意要求保留关键内容范围，例如文档模型、BSON、ObjectId、mongosh、Node.js Driver、过滤、分页、更新操作符、Model、字段校验、默认值、索引、查询链、lean、文档钩子、嵌入引用、populate、$lookup、$group、explain、复合索引、ESR、TTL、Mongoose 事务、建模、鉴权、分页搜索、软删除。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `后端技术 / Node.js / MongoDB详解` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/nodejs-mongodb-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/nodejs-mongodb-folder-before-semantic-cleanup-20260731-1945`。

### Node.js 体系整理状态

- `后端技术 / Node.js` 下已完成本地文章层整理：直接基础文章、`接口与会话控制详解`、`MongoDB详解`。
- 共涉及 21 篇 Node.js 文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 分类路径暂不改名，避免把分类树变更与文章整理混在一起。

### 后端技术 / Python

- 处理 1 篇 Python 根目录总目录文章。原标题已经能看出是总目录，但标题和本地文件名缺少 `第 00 篇` 的统一形式。
- 已整理为：Python 学习资料总目录：知识目录、应用实例、工具链、学习顺序。
- 保持 `sortOrder` 为 10；本地文件名采用 `第 00 篇`，用于总目录和学习入口。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `后端技术 / Python` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 后端技术 / Python / 应用实例 / 网络爬虫与数据分析

- 处理 6 篇 Python 网络爬虫与数据分析文章。原顺序已经是从基础概念到可视化的连续路径，主要问题是标题仍使用 `00` 到 `05` 的导出格式，文件名还带连字符残留。
- 已整理为：网络爬虫基础概念、requests 请求体系与 robots.txt、XPath 解析 HTML 并保存 CSV、正则表达式清洗爬虫文本、用 pandas 统计 CSV、用 matplotlib 绘制统计图。
- 保持 `sortOrder` 为 10 到 60 的正向学习顺序；本地文件名采用 `第 01 篇` 到 `第 06 篇`。
- 按见名知意要求保留关键内容范围，例如 URL、HTTP、robots.txt、HTML、解析、数据保存、requests、Session、XPath、CSV、re、pandas、DataFrame、matplotlib、折线图、柱状图、散点图、饼图、多子图。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `后端技术 / Python / 应用实例 / 网络爬虫与数据分析` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/python-root-crawler-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/python-root-crawler-folder-before-semantic-cleanup-20260731-2000`。

### 后端技术 / Python / 应用实例 / Web入门

- 处理 18 篇 FastAPI 从 0 到 1 Web 入门文章。原章节 00 到 16 顺序基本正确，但学习总目录排在最后，标题和文件名仍保留导出阶段的连字符格式。
- 已整理为：FastAPI 从 0 到 1 学习总目录、学习路线与开发环境、读懂代码前必会 Python、HTTP/ASGI 与第一个应用、路由与请求参数、Pydantic v2 与数据建模、响应异常与 OpenAPI、依赖中间件生命周期与项目结构、SQLAlchemy 与 Alembic、CRUD 事务关联分页与查询、登录 JWT RBAC 与安全、文件后台任务 HTTPX 与 Redis、异步并发 WebSocket 与任务队列、pytest 与质量保障、日志监控性能安全与部署、企业知识库 API 综合实战、高频问题面试与交付清单、学习成效评估与 Express 对照交付。
- 将学习总目录调整为 `sortOrder: 10`，原章节顺延为 20 到 180，使线上目录先读总览，再进入第 1 篇到第 17 篇；本地文件名采用 `第 00 篇` 到 `第 17 篇`。
- 按见名知意要求保留关键内容范围，例如路线、章节、项目实战、交付清单、虚拟环境、依赖安装、import、类对象、装饰器、类型注解、main.py、Uvicorn、Path、Query、Body、Pydantic v2、response_model、HTTPException、Depends、Middleware、lifespan、SQLAlchemy、Alembic、JWT、RBAC、UploadFile、BackgroundTasks、HTTPX、Redis、WebSocket、pytest、Docker、审核流、状态机、Express 对照。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `后端技术 / Python / 应用实例 / Web入门` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/python-fastapi-web-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/python-fastapi-web-folder-before-semantic-cleanup-20260731-2015`。

### 后端技术 / Python / 知识目录

- 处理 29 篇 Python 零基础入门文章。原顺序已经是从学习路线到正则、命令行参数、安全随机数与时区的完整基础主线，主要问题是标题和文件名仍使用 `00` 到 `28` 的导出格式。
- 已整理为：Python 学习路线与运行方式、Python 是什么、安装检查与运行代码、print 输出与注释、变量和基本数据类型、字符串、数字和简单计算、input 输入和类型转换、条件判断、循环、列表、元组、集合、字典、函数、文件读写、记账本练习、异常处理、模块包 pip 与虚拟环境、面向对象、常用标准库、面试复盘与项目表达、csv 模块、logging 日志模块、可迭代对象/迭代器/生成器、函数进阶/闭包/装饰器、Unicode/str/bytes、pytest 测试调试与代码质量、正则/命令行参数/安全随机数/时区。
- 保持 `sortOrder` 为 10 到 290 的正向学习顺序；本地文件名采用 `第 01 篇` 到 `第 29 篇`。
- 按见名知意要求保留关键内容范围，例如解释器、脚本、交互模式、VS Code、Python、pip、终端、print、sep/end、int、float、str、bool、None、索引切片、f-string、input、if else、match、range、列表推导式、tuple、set、dict、open、with、try except、venv、requirements、class、datetime、pathlib、json、csv、logging、iter、next、yield、装饰器、UTF-8、pytest、fixture、argparse、secrets、zoneinfo。
- 摘要已有基础质量，本批保留原摘要，只同步规范标题、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `后端技术 / Python / 知识目录` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/python-knowledge-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/python-knowledge-folder-before-semantic-cleanup-20260731-2030`。

### Python 体系整理状态

- `后端技术 / Python` 下已完成本地文章层整理：根目录总目录、`知识目录`、`应用实例 / Web入门`、`应用实例 / 网络爬虫与数据分析`。
- 共涉及 54 篇 Python 文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 分类路径暂不改名，避免把分类树变更与文章整理混在一起。

### 后端技术整理状态

- `后端技术` 下已完成本地文章层整理：`Node.js`、`Python`。
- 共涉及 75 篇后端技术文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 分类路径暂不改名，避免把分类树变更与文章整理混在一起。

### 项目复用技术 / WebSocket

- 处理 12 篇 WebSocket 专题文章。原排序从性能优化、第 10 篇、StompClient 等中后段内容开始，零基础入门和总览排在后面，不符合学习顺序。
- 已整理为：WebSocket 零基础入门、WebSocket 与 STOMP 总览、STOMP 帧封装、StompClient 封装、连接管理与自动重连、消息解析与服务层、MessageServiceAdapter 与页面接入、接入检查清单、跨运行时适配、WebSocket 与 AI 流式传输、STOMP 协议速查、性能优化与高并发实战。
- 将 `sortOrder` 调整为 10 到 120，使线上目录按基础概念、分层封装、页面接入、跨端适配、专项扩展、速查与性能优化展示；本地文件名采用 `第 01 篇` 到 `第 12 篇`。
- 按见名知意要求保留关键内容范围，例如协议概念、握手流程、浏览器、uni-app、心跳重连、分层设计、STOMP 帧、命令拼装、拆帧、粘包处理、StompClient、状态机、指数退避、消息标准化、订阅分发、事件桥接、页面验收、runtime adapter、SSE、AI 流式 API、帧结构、连接拆分、压缩、节流、内存泄漏、组件生命周期。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `项目复用技术 / WebSocket` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 项目复用技术 / JS库

- 处理 5 篇 JS 库文章。原排序为 CryptoJS、qrcode、Axios、Cropper.js、SortableJS，与历史 sourcePath 的 01 到 05 相反。
- 已整理为：SortableJS 拖拽排序库实战、Cropper.js 图片裁剪库实战、Axios 请求库实战、qrcode 二维码生成库实战、CryptoJS 前端加密库实战。
- 将 `sortOrder` 调整为 10 到 50，使线上目录按拖拽交互、图片处理、请求封装、二维码生成、前端加密的复用能力顺序展示；本地文件名采用 `第 01 篇` 到 `第 05 篇`。
- 按见名知意要求保留关键内容范围，例如标签拖拽、列表重排、Vue 数据同步、上传前裁剪、1.x 与 2.x、实例封装、拦截器、文件上传、登录码、分享码、toCanvas、toDataURL、MD5、SHA256、HMAC、AES、参数签名。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `项目复用技术 / JS库` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 项目复用技术 / uni-app

- 处理 5 篇 uni-app 复用方案文章。原排序为头像上传、tabBar、附件、语音、人脸摄像机，整体与历史 sourcePath 的 01 到 05 相反。
- 已整理为：人脸摄像机封装、语音输入与语音转文字封装、附件上传与智能预览封装、自定义 tabBar 与角标同步封装、头像上传与圆形裁剪封装。
- 将 `sortOrder` 调整为 10 到 50，使线上目录按专项能力封装、附件能力、全局导航能力、头像裁剪链路展示；本地文件名采用 `第 01 篇` 到 `第 05 篇`。
- 按见名知意要求保留关键内容范围，例如能力边界、权限、图片转换、可复用模板、按住说话、上滑取消、H5 兼容、自动发送、图片、文件、视频、图标映射、大小格式化、角色配置、安全区适配、页面路径、全局刷新、选图、拖拽缩放、圆形裁剪框、Canvas 导出。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `项目复用技术 / uni-app` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 项目复用技术 / Vue后台管理

- 处理 1 篇 Vue 后台管理文章，将标题和本地文件名补充为统一阅读序号。
- 已整理为：Vue 后台 TagsView 路由标签理解：`$route`、`fullPath`、`href`、路由监听、首页标签。
- 保持 `sortOrder` 为 10；同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `项目复用技术 / Vue后台管理` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 项目复用技术 / 前端工程化与安全

- 处理 1 篇前端工程化与安全文章，将标题和本地文件名补充为统一阅读序号。
- 已整理为：前端代码混淆接入实施记录：webpack-obfuscator、Vue CLI、Webpack 5、验证脚本。
- 保持 `sortOrder` 为 10；同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `项目复用技术 / 前端工程化与安全` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 项目复用技术阶段状态

- 本批完成 `项目复用技术` 非第三方登录目录 24 篇文章整理，当前本地文件路径均存在，`manifest.json` 指向有效。
- 变更明细：`docs/02-开发指南/文章同步报告/reuse-tech-non-third-party-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/reuse-tech-non-third-party-before-semantic-cleanup-20260731-2100`。

### 项目复用技术 / 第三方登录对接 / 概念速查

- 处理 1 篇第三方登录概念速查文章。原摘要和标签为空，本地文件名也缺少统一阅读序号。
- 已整理为：第三方登录术语与场景速查：OAuth2、微应用、扫码登录、账号绑定、SSO。
- 保持 `sortOrder` 为 10；同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `项目复用技术 / 第三方登录对接 / 概念速查` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 项目复用技术 / 第三方登录对接 / 企业微信

- 处理 11 篇企业微信第三方登录文章。原排序从小程序登录、PC 绑定开始，通用 ID、H5 微应用和开放平台总览排在后面，阅读路径不自然。
- 已整理为：企业微信开发从 0 到 1、企业微信常见 ID 速查、企业微信 H5 微应用开发指南、企业微信 JSSDK 接入、企业微信 H5 扫一扫 JSAPI 对接、uni-app H5 接入企业微信微应用、企业微信单可信域名跨域 OAuth 方案、企业微信 H5 登录 errcode 60020 排障、企业微信 PC 扫码登录、企业微信账号绑定方案、企业微信小程序登录接入方案。
- 将 `sortOrder` 调整为 10 到 110，使线上目录按开放平台总览、ID 速查、H5 微应用、JSSDK/JSAPI、uni-app H5、OAuth 排障、PC 扫码/绑定、小程序登录展示；本地文件名采用 `第 01 篇` 到 `第 11 篇`。
- 按见名知意要求保留关键内容范围，例如开放平台、应用类型、corpId、agentId、appId、userId、openId、unionId、OAuth2、wx.config、agentConfig、签名流程、扫一扫、wx.scanQRCode、可信域名、errcode 60020、可信 IP、ww.createWWLoginPanel、PC 扫码、绑定解绑、wx.qy.login、code2Session、登录态。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `项目复用技术 / 第三方登录对接 / 企业微信` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 项目复用技术 / 第三方登录对接 / 钉钉

- 处理 17 篇钉钉第三方登录文章。原排序将 CE1000.01 排障、迁移过程记录放在最前，通用 ID、H5 微应用、PC 扫码和小程序主线排在后面。
- 已整理为：钉钉开发常见 ID 速查、钉钉 H5 微应用开发指南、uni-app H5 接入钉钉微应用、钉钉 H5 微应用双链路实现梳理、钉钉微应用登录项目核验结论、钉钉 H5 微应用 JSAPI 对接清单、PC 多租户钉钉扫码登录接入方案、PC 端钉钉登录四链路实现指南、钉钉账号绑定方案、钉钉小程序前端开发从 0 到 1、uni-app 微信小程序迁移钉钉小程序指南、uni-app 项目改造钉钉小程序清单、uni-app 项目 wx 替换清单、微信能力迁移到钉钉处理对照、钉钉小程序迁移过程记录、钉钉小程序迁移阶段 1、CE1000.01 cannot resolve module 排障。
- 将 `sortOrder` 调整为 10 到 170，使线上目录按通用 ID、H5 微应用、项目核验、JSAPI、PC 扫码/绑定、小程序开发与迁移、迁移过程和排障记录展示；本地文件名采用 `第 01 篇` 到 `第 17 篇`。
- 按见名知意要求保留关键内容范围，例如 corpId、agentId、miniAppId、clientId、userId、unionId、openId、开放平台配置、uni-app H5、免登、dingtalk-jsapi、登录页改造、入口分流、移动端仓库、官方依据、JSAPI、前后端协议、签名、多租户、一套代码、多学校部署、扫码登录、客户端免登、账号绑定、第三方企业应用、适配层、条件编译、wx 替换、手机号、支付、消息通知、mp-dingtalk、package.json、CE1000.01。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `项目复用技术 / 第三方登录对接 / 钉钉` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 项目复用技术 / 第三方登录对接 / 对比笔记

- 处理 2 篇第三方登录对比文章。原第二篇摘要和标签为空，本地文件名缺少统一阅读序号。
- 已整理为：统一登录中心与子系统切换实战、钉钉与企业微信登录实现对比。
- 保持 `sortOrder` 为 10、20，使线上目录先看统一登录中心和 SSO 子系统切换，再看钉钉与企业微信实现差异；本地文件名采用 `第 01 篇` 到 `第 02 篇`。
- 按见名知意要求保留关键内容范围，例如 SSO、一次性票据、目标系统跳转、安全边界、H5、PC 扫码、小程序、账号绑定、流程差异。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `项目复用技术 / 第三方登录对接 / 对比笔记` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 第三方登录对接整理状态

- `项目复用技术 / 第三方登录对接` 下 4 个子目录已完成本地文章层整理：`概念速查`、`企业微信`、`钉钉`、`对比笔记`。
- 共涉及 31 篇第三方登录文章，当前本地文件路径均存在，`manifest.json` 指向有效。
- 变更明细：`docs/02-开发指南/文章同步报告/third-party-login-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/third-party-login-folder-before-semantic-cleanup-20260731-2200`。

### AI相关 / AI开发 / 开发基础

- 处理 2 篇 AI 开发基础文章。原摘要已有质量，但标签为空，本地文件名也未使用统一阅读序号。
- 已整理为：AI 技术知识体系、YAML/JSON/TOML 配置文件入门。
- 保持 `sortOrder` 为 10、20；本地文件名采用 `第 01 篇` 到 `第 02 篇`。
- 按见名知意要求保留关键内容范围，例如 LLM、Agent、RAG、向量化、OpenAI 协议、Token 计费、语法差异、适用场景、Vue、Node.js、Docker、Actions。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `AI相关 / AI开发 / 开发基础` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### AI相关 / AI开发 / Docker

- 处理 2 篇 Docker 文章。原摘要已有质量，但标签为空，本地文件名也未使用统一阅读序号。
- 已整理为：Docker 学习笔记纯小白版、Docker Desktop 汉化教程。
- 将 Docker 学习笔记放在第 1 篇、Docker Desktop 汉化教程放在第 2 篇，使线上目录先读基础概念，再看工具专项处理；本地文件名采用 `第 01 篇` 到 `第 02 篇`。
- 按见名知意要求保留关键内容范围，例如镜像、容器、端口映射、数据挂载、Dockerfile、Compose、DockerDesktop-CN、版本匹配、文件备份、替换验证、回滚。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `AI相关 / AI开发 / Docker` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/ai-dev-basics-docker-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/ai-dev-basics-docker-before-semantic-cleanup-20260731-2115`。

### 面试

- 处理 10 篇前端面试文章。原目录没有空摘要或空标签，但本地文件名缺少统一阅读序号，且 Vue、WebSocket 等部分文章缺少一级标题。
- 已整理为：HTML CSS 面试题详解、JavaScript 基础面试题、Vue 面试题详解、Vue 响应式原理与扩展面试题、UniApp 框架面试题、WebSocket 协议面试题、前端面试知识点整理、前端开发常见面试题 35 问、前端面试题题库及答案、前端超级面试题汇总。
- 将 `sortOrder` 调整为 10 到 100，使线上目录按 HTML/CSS、JavaScript、Vue、UniApp、WebSocket 专项，再到综合知识点、35 问、题库答案、大型汇总的复习路径展示；本地文件名采用 `第 01 篇` 到 `第 10 篇`。
- 按见名知意要求保留关键内容范围，例如浏览器内核、DOCTYPE、布局、语义化、盒模型、数据类型、作用域、事件循环、原型链、闭包、Promise、虚拟 DOM、diff、MVVM、Vue2、Vue3、provide/inject、Vuex、Three.js、配置文件、打包发布、分包、协议握手、实时通信、ECharts、小程序、工程化、状态管理、认证通信、生命周期、组件通信、综合题库。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`；对原本缺少 H1 的文章已补充同名 H1。
- 保持分类路径 `面试` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/interview-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/interview-folder-before-semantic-cleanup-20260731-2130`。

### Web安全

- 处理 2 篇 Web 安全文章。原顺序合理，主要问题是本地文件名缺少统一阅读序号。
- 已整理为：前端开发常见网络安全攻击、SVG 文件上传 XSS 攻击。
- 保持 `sortOrder` 为 10、20，使线上目录先展示常见攻击总览，再展示 SVG 上传 XSS 专项；本地文件名采用 `第 01 篇` 到 `第 02 篇`。
- 按见名知意要求保留关键内容范围，例如 XSS、CSRF、SQL 注入、SSRF、XXE、点击劫持、XML、脚本执行、Stored XSS、防御方案。
- 同步规范摘要、标签、Front Matter、首个 H1、`manifest.json` 的 `fileName` 和 `contentHash`。
- 保持分类路径 `Web安全` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/web-security-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/web-security-folder-before-semantic-cleanup-20260731-2145`。

### AI相关 / AI工具

- 处理 78 篇 AI 工具文章，覆盖总导航、AI 编辑器流、终端 Agent 流、规则机制层、辅助工具层、Agent 框架层等目录。
- 将 `第一篇`、`第N篇`、`01：`、`补充篇` 等混合格式统一为 `第 01 篇：主题：关键内容范围` 或 `总览/索引` 命名，文件名同步使用两位序号。
- 对 `CCSwitch` 目录重新固化阅读顺序：快速上手、Codex Provider 排障、中转站接入、MiMo Token Plan、跨电脑导出导入、绝对路径污染排障、两台电脑 Node 环境对比报告。
- 对 `Skill` 目录重新固化阅读顺序：开放标准与兼容性、场景模板、高级用法、团队协作、前端开发常用 Skills 清单。
- 对 MCP、Plugin、Rules、Claude Code、Codex、Cursor、Kiro、Windsurf、CatPaw、OpenClaw 等目录统一本地文件名、Front Matter 标题、首个 H1、`sortOrder` 与 `manifest.json` 的 `fileName/contentHash`。
- 保持分类路径 `AI相关 / AI工具` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### AI相关 / AI开发 / AI应用开发平台 / MaxKB

- 处理 33 篇 MaxKB 文章，覆盖公共规则、基础配置与变量、工程治理、接入与展示、节点创建手册、实战开发指南。
- 将 `00-`、`01-`、无序号实战稿等导入文件名统一为 `总览`、`第 00 篇`、`第 01 篇` 等可阅读结构，文件名同步保留 MaxKB、节点、RAG、API、安全、发布回滚等关键内容范围。
- 对 `节点创建手册` 固化阅读顺序：AI 创建节点必读、空白高级智能体创建、添加组件面板、基本信息与开始节点、AI 对话、意图识别、问题优化、判断器、知识库相关、表单收集、指定回复、循环、变量赋值、变量拆分、参数提取、变量聚合、MCP 调用与自定义工具、工具页签与智能体节点。
- 对 `实战开发指南` 固化阅读顺序：接手环境到发布、智能体编排与状态设计、知识库与 RAG、工具/API 接入与安全、调试测试发布回滚、官方资料索引与文档审计。
- 同步规范 Front Matter、首个 H1、`sortOrder`、`manifest.json` 的 `fileName/contentHash`，不修改正文主体段落、不修改标签体系。
- 保持分类路径 `AI相关 / AI开发 / AI应用开发平台 / MaxKB` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/ai-tools-maxkb-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/ai-tools-before-semantic-cleanup-20260731-2230`、`backups/maxkb-before-semantic-cleanup-20260731-2230`。

### 当前整理边界

### 我的总结

- 按最新要求补充处理此前跳过的 `我的总结` 目录，共 52 篇 Markdown。
- JavaScript、Vue、uni-app 三个总目录统一为 `总览：...` 命名，辅助资料统一为 `第 01 篇：主题：关键内容范围`，Vue 随记统一为 `附录 01：主题：关键内容范围`。
- 修正 9 篇 Front Matter 标题与首个 H1 不一致的问题，并将 `第01篇`、无序号文件名、下划线残留文件名统一为可阅读两位序号文件名。
- JavaScript 辅助资料按现有学习顺序补齐第 01 到第 27 篇，保留变量作用域、闭包、this、原型链、Promise、DOM、深浅拷贝、执行上下文、对象描述符、手写题、路径、字符串数组方法、解构赋值等关键范围。
- Vue 辅助资料按第 01 到第 13 篇整理，保留插值、指令、响应式、组件配置、生命周期、组件通信、Axios、Vue Router、Composition API、Vue2/Vue3 差异、虚拟 DOM 与 Diff 等关键范围。
- uni-app 辅助资料按第 01 到第 06 篇整理，保留跨端编译、生命周期、工程结构、微信能力接入、性能优化、高频问题等关键范围。
- 保持分类路径 `我的总结` 不变，历史 `sourcePath` 保留不动，未修改 RBAC 菜单、分类树排序或线上数据库。

### 安卓APK

- 按最新要求补充处理此前跳过的 `安卓APK` 目录，共 1 篇 Markdown 和 2 篇 DOCX 元数据文章。
- Markdown 文章补齐摘要、标签、发布状态和首个 H1，并规范为 `第 01 篇：uni-app 对接自定义 jar 包：HBuilderX、离线 SDK、Android Studio、原生插件`。
- DOCX 型文章补齐 metadata 中的标题、摘要、标签、分类路径、发布状态和排序，并同步规范本地文档目录名。
- 三篇文章按 `第 01 篇` 到 `第 03 篇` 排列：自定义 jar 包实操、电子班牌项目复盘与简历素材、uni-app Android APK 从 0 到 1 手册。
- 保持分类路径 `安卓APK` 不变，未修改 DOCX 原件内容、RBAC 菜单、分类树排序或线上数据库。
- 变更明细：`docs/02-开发指南/文章同步报告/remaining-my-summary-android-folder-semantic-cleanup-20260731.json`。
- 本地备份：`backups/my-summary-before-semantic-cleanup-20260731-2245`、`backups/android-apk-before-semantic-cleanup-20260731-2245`。

### 全量校验状态

- `output/线上文章` 当前权威快照读取通过：512 篇文章、96 个分类。
- 全部文章状态均为 `published`，Markdown Front Matter 与 manifest 状态已对齐。
- 未发现缺文件、空摘要、空标签、H1 与标题不一致、不规范本地文件名、标题超长、摘要超长或序号断档问题。
- 编码检查通过：未发现 UTF-8 BOM。

### 菜单排序保护

- 知识库侧栏分类按分类 `sortOrder` 升序展示，文章按文章 `sortOrder` 升序展示；顶部和后台管理菜单按 RBAC 菜单 `sortOrder` 展示。
- 本地文章整理阶段只允许改目标文件夹内文章的 `sortOrder`，不改 RBAC 菜单排序。
- 标题整理时必须同步整理本地导出文件名和 `manifest.json` 的 `fileName`，避免本地阅读和后续对比继续显示旧导入残留名称。
- 同步线上前必须 dry-run 输出文章排序变更清单；涉及分类排序或 RBAC 菜单排序时必须单独确认，不能混在文章内容同步中直接写入。
