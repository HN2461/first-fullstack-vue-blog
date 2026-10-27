# Ant Design Vue 零基础学习系列

这组文章从 Vue 3 + Vite 项目的基本接入开始，逐步讲到组件模板语法、全局语言与主题配置，以及 `App` 组件如何让全局反馈 API 获得 Vue 应用上下文。适合刚学 Vue、准备开始写后台页面，或从其他组件库转来了解 Ant Design Vue 的读者。

## 适用读者与阅读前准备

读者最好已经见过 Vue 单文件组件，知道 `<template>`、`<script setup>` 和 `import` 的基本含义。没有这些基础也可以读，但遇到 `ref`、事件处理和 Vite 配置时，建议同步补 Vue 3 入门知识。

示例统一使用 Vue 3、Vite 和 JavaScript，不依赖 TypeScript。文章讲的是学习和理解 API 的小例子；接入具体项目时，仍应确认该项目实际依赖版本、路由和组件注册方式。

## 建议阅读顺序

| 顺序 | 文章 | 解决的问题 |
| --- | --- | --- |
| 1 | [快速认识与学习路线](第-1-篇：快速认识-Ant-Design-Vue：定位、核心概念与学习路线.md) | Ant Design Vue 是什么、适合哪些页面、与 Vue 和 Ant Design X 有什么区别？ |
| 2 | [安装注册与按需导入](第-2-篇：Ant-Design-Vue-安装与注册：Vite、完整引入和按需导入.md) | 怎样在 Vue 3 + Vite 项目安装、注册组件，并验证样式和按需导入？ |
| 3 | [组件模板语法与数据绑定](第-3-篇：Ant-Design-Vue-组件用法：模板、属性、事件与数据绑定.md) | 怎样把 Vue 数据绑定到组件属性、接收事件、使用 `v-model` 和插槽？ |
| 4 | [ConfigProvider 国际化与主题](第-4-篇：ConfigProvider-全局配置：中文国际化、日期语言与主题定制.md) | 怎样统一配置组件中文文案、日期语言、主题 token 和暗色算法？ |
| 5 | [App 组件与上下文消息弹窗通知](第-5-篇：App-组件与上下文反馈：message、modal、notification-的正确用法.md) | 静态提示为什么可能拿不到上下文，`App.useApp()` 应放在哪一层、怎样排错？ |
| 6 | [表单校验与提交流程](第-6-篇：Ant-Design-Vue-表单校验与提交流程：从字段绑定到安全提交.md) | 怎样把数据对象、表单项、校验规则、异步提交和重置串起来？ |
| 7 | [表格分页筛选与排序](第-7-篇：Ant-Design-Vue-表格分页、筛选与排序：从本地数据到服务端查询.md) | 怎样管理行键、列定义、受控筛选、排序和服务端分页？ |
| 8 | [Modal 与 Drawer 交互和表单组合](第-8-篇：Ant-Design-Vue-Modal-与-Drawer：交互状态和表单组合.md) | 怎样控制浮层、校验表单、保存状态并处理关闭？ |
| 9 | [常用数据展示组件指南](第-9-篇：Ant-Design-Vue-常用数据展示组件：详情、状态、空态与加载态.md) | 怎样清楚地表达详情、状态、指标、加载、错误和空数据？ |
| 10 | [项目落地规范、常见错误与练习](第-10-篇：Ant-Design-Vue-项目落地规范、常见错误与实战练习.md) | 怎样把组件 API 用在已有后台项目并练习完整管理页面？ |

每篇末尾都提供相关官方资料。学习时先理解正文的最小示例，再打开官方文档核对当前组件 API，最后把示例放进自己的测试页面验证。

## 版本提醒

本文示例面向 Vue 3。编写和整理本系列时以 Vue `3.5.x` 与 Ant Design Vue `4.2.x` 的常见用法为参考，但这不是要求所有项目都升级到该版本，也不代表每个项目此刻安装的就是这些版本。

动手前在项目目录查看实际版本：

```bash
npm ls vue ant-design-vue
```

如果版本不是 Vue `3.5.x` 或 Ant Design Vue `4.2.x`，请使用项目对应版本的官方文档确认导入路径、主题属性和反馈 API。不要用 `--force` 绕过 peer dependency 冲突，也不要仅凭旧教程推断兼容性。

## 官方文档入口

- [Ant Design Vue 中文文档](https://www.antdv.com/)
- [组件总览](https://www.antdv.com/components/overview-cn)
- [快速开始](https://www.antdv.com/docs/vue/getting-started-cn)
- [ConfigProvider](https://www.antdv.com/components/config-provider-cn)
- [App 组件](https://www.antdv.com/components/app-cn)
- [国际化](https://www.antdv.com/docs/vue/i18n-cn)
- [主题定制](https://www.antdv.com/docs/vue/customize-theme-cn)
- [Ant Design Vue npm 包](https://www.npmjs.com/package/ant-design-vue)

官方文档会随版本更新。关于组件属性、事件参数、插槽、主题 token 和组合式方法的细节，以当前安装版本对应的官方 API 页面为准。
