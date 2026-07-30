---
title: "01-MaxKB渲染标签与快捷问题规则"
slug: "maxkb-01-maxkb-affa7c4c"
summary: "本文整理 01-MaxKB渲染标签与快捷问题规则，归纳 MaxKB 接入与展示相关的配置方法、实践步骤、边界条件与常见注意事项。"
category: "接入与展示"
tags:
  - "MaxKB"
  - "AI应用开发"
  - "接入与展示"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a6b691f4bf50146e9b95e68"
originalSlug: "maxkb-01-maxkb-affa7c4c"
originalStatus: "draft"
exportedAt: "2026-07-30T15:12:30.579Z"
---
# 01-MaxKB渲染标签与快捷问题规则

> 文档状态（2026-07-19）：根据 FIT2CLOUD 社区帖《MaxKB 中的特殊标签》、当前环境实测和 MaxKB 官方更新日志整理。本文用于优化候选项、下一步引导、图表和 HTML 展示，不记录某个项目或某个智能体的完整链路。
>
> 安全基线：官方 v2.8.0 曾修复 `html_rander` 的存储型 XSS 和 `echarts_rander` 的代码注入问题。使用前必须确认目标环境版本和安全修复状态；正式环境只允许固定模板和经过转义、允许列表校验的变量内容。

## 1. 适用范围

本文记录 MaxKB 回复内容中可用于前端渲染的特殊标签：

```text
<quick_question>
<echarts_rander>
<html_rander>
```

这些标签适合用于提升对话体验，但不能替代真实业务状态、表单校验或正式提交逻辑。

统一安全规则：

```text
1. 不让模型自由生成 script、事件处理器、任意 URL 或完整 HTML 页面。
2. 用户输入、知识库内容和工具返回进入 HTML 前必须转义。
3. jump/sendMessage 等能力只使用允许列表中的动作和地址。
4. token、内网地址、文件内部 ID、隐私字段不进入 HTML 或图表配置。
5. 更换 MaxKB 版本、发布入口或嵌入容器后重新回归。
```

## 2. quick_question 快捷问题

`<quick_question>` 用于在对话回复结束后生成快捷问题按钮。

基础写法：

```html
<quick_question>我能发起哪些流程？</quick_question>
<quick_question>周末请假</quick_question>
<quick_question>退出选择</quick_question>
```

### 2.1 开场白快捷入口

`基本信息 -> 开场白` 中的快捷入口优先用短横线列表，不需要写 `<quick_question>` 标签。

推荐写法：

```text
您好，我是智慧校园工作流助手。

您可以直接说出要办理的事项，例如“我要请假”“我要报销”“我要报修”。

也可以先选择下面的快捷入口：

- 我要发起申请
- 查看待办审批
- 查询我的流程
```

规则：

```text
1. 开场白中的 `- 快捷入口` 会被 MaxKB 发布页或自定义前端识别为开场快捷问题。
2. 开场白快捷入口建议 2 到 4 个，只放总入口最高频动作。
3. 开场白不要使用 `<quick_question>`，避免不同客户端把标签当普通文本展示。
4. `<quick_question>` 主要用于普通回复节点、AI 回复或工具渲染后的快捷按钮。
5. 开场白快捷入口和普通回复快捷按钮都必须遵守真实链路原则。
6. 不要在开场白放“退出当前流程”，因为用户刚进入时通常还没有当前流程状态。
```

对照：

| 场景 | 推荐写法 |
| --- | --- |
| 基本信息开场白 | `- 我要发起申请` |
| 回复节点 / AI 输出 / 工具输出 | `<quick_question>正式提交</quick_question>` |

在有候选项或下一步动作的智能体中，适合用于：

```text
候选流程编号
任务列表编号
退出选择
返回列表
查看详情
保存草稿
正式提交
审批确认 / 取消
同意 / 驳回 / 退回
审批人候选，例如：选1 张三
```

不适合用于：

```text
继续修改
到小程序继续办理
查看审批进度
继续验证
小程序安全验证
重新描述需求
```

原因：

```text
1. 继续修改、重新描述需求需要用户输入具体字段或具体办理事项，空按钮没有业务信息。
2. 到小程序继续办理、查看审批进度、安全验证当前如果没有真实跳转能力，就不能用 quick_question 假装跳转。
3. 失败状态下不要给容易反复触发失败的按钮，例如未修正内容前继续点正式提交或保存草稿。
4. quick_question 只是把一句话发送回对话，不等于页面跳转、组件上传或后端动作。
```

## 3. 推荐用于候选流程回复

候选流程列表仍然保留普通文本，确保即使快捷问题渲染失败，用户也能手动回复编号：

```text
请选择要办理的流程：

【候选流程】
1. 流程 A
   分类：业务分类
2. 流程 B
   分类：业务分类
3. 流程 C
   分类：业务分类

【下一步】
直接回复编号即可，例如：1 或 2。

【不在列表中】
回复“退出选择”，再重新描述办理需求。

<quick_question>1</quick_question>
<quick_question>2</quick_question>
<quick_question>3</quick_question>
<quick_question>退出选择</quick_question>
```

原则：

```text
1. 正文里必须写清楚可手动回复的编号，不要只依赖快捷按钮。
2. 快捷问题内容尽量短，优先使用编号、短动作、短流程名。
3. 候选流程超过 3 个时，快捷问题优先给编号，不要塞长流程名。
4. 需要退出候选状态时，固定提供“退出选择”。
```

## 4. 推荐用于指定回复固定操作

快捷按钮最适合“用户下一步动作有限且明确”的指定回复。

推荐原则：

```text
1. 能固定的操作就给快捷按钮，减少用户组织语言。
2. 快捷按钮只降低输入成本，不替代会话变量、后端校验和二次确认。
3. 高风险动作可以给按钮，但必须继续走确认链路，不能点击按钮后直接提交。
4. 按钮文案要短，优先使用用户自然会说的话。
5. 每个回复建议 2 到 4 个快捷按钮，超过 5 个会像菜单堆叠，降低选择效率。
6. 如果候选项已经用 quick_question 承载，HTML 正文不要再完整重复一遍候选列表；HTML 只做步骤说明即可。
7. 详情页内容较长时，不强行追加快捷按钮，优先在正文末尾用自然语言提示可继续怎么说。
8. 只给链路明确能接住的按钮；如果按钮只是“继续修改”“重新描述”这类空动作，应改为正文提示用户直接输入具体内容。
9. 小程序安全验证、签名、人脸、密码、附件上传等需要原生页面或安全组件的动作，不做 quick_question。
```

通用按钮场景：

| 场景 | 推荐按钮类型 | 说明 |
| --- | --- | --- |
| 总入口开场白 | 2 到 4 个高频入口 | 只放跨用户最常用入口，避免像菜单堆叠 |
| 兜底追问 | 2 到 4 个澄清入口 | 帮用户从模糊表达回到明确路径 |
| 候选列表 | 编号、退出选择 | 正文仍必须展示候选项，按钮只降低输入成本 |
| 详情页后续动作 | 查看、返回、低风险动作 | 高风险动作必须继续确认 |
| 二次确认 | 确认、取消 | 确认按钮文案应和当前动作一致 |
| 候选人 / 节点选择 | 编号、姓名、取消 | 候选项放按钮时，HTML 正文只做说明，避免重复 |
| 成功 / 失败兜底 | 返回列表、重新查询、回到入口 | 通常保留 2 个高频按钮即可 |
| 发起草稿确认 | 正式提交、保存草稿 | 修改字段靠用户自然语言输入具体内容，不输出“继续修改”按钮 |
| 发起审批人选择 | 选1 张三 | 审批人候选通常是必选项，应输出全部候选，不截断 |
| 小程序安全验证 | 不输出按钮 | 正文提示到小程序完成，不在聊天中收集密码、人脸、签名 |
| 不支持字段 | 可正文提示保存草稿 | 不支持内容需要到小程序补充，不能继续在聊天中填写 |

## 5. 不要让模型自由生成标签

风险：AI 对话节点可能把标签写错，例如把 `<quick_question>` 写成 `<quick_uestion>`，最终会直接显示成普通文本，影响用户体验。

更稳的方式：

```text
1. 前置工具或节点先输出候选流程、候选编号、推荐快捷问题。
2. 用变量拆分节点把需要展示的短值拆成独立变量。
3. 在指定回复节点中固定写死标签结构。
4. 只把标签内部的内容做变量替换。
```

推荐模板：

```html
请选择要办理的流程：

【候选流程】
1. {{候选流程1名称}}
2. {{候选流程2名称}}
3. {{候选流程3名称}}

直接回复编号即可，例如：1 或 2。

<quick_question>1</quick_question>
<quick_question>2</quick_question>
<quick_question>3</quick_question>
<quick_question>退出选择</quick_question>
```

如果候选数量不固定，优先在自定义工具里生成完整 `quickQuestionText`，但仍要确保工具输出的是固定模板拼接，不让大模型自由生成标签名。

## 6. html_rander 使用边界

`<html_rander>` 可用于展示 HTML 内容，适合轻量卡片或说明型内容。

当前项目客户端已在 2026-07-08 验证：`html_rander` 内可以用 `button onclick="jump('https://www.baidu.com')"` 打开外部页面，且 `html_rander` 外部继续追加 `<quick_question>` 快捷按钮时，两者可以共存。

已验证的跳转测试写法：

```html
<html_rander>
<button onclick="jump('https://www.baidu.com')">点我</button>
</html_rander>
```

说明：

```text
1. 该结论只代表当前 MaxKB 客户端和当前嵌入环境已支持 jump 跳转。
2. 如果后续更换 MaxKB 版本、前端发布入口、客户端容器或小程序 WebView，需要重新验证。
3. quick_question 建议继续放在 html_rander 外面，不要塞进 HTML 结构里。
```

工作流场景中不建议用 `html_rander` 承载：

```text
正式提交按钮
保存草稿按钮
审批人选择的正式提交
安全验证
人脸识别
签名
附件上传
```

这些动作应由后端接口、uni-app 原生页面或 MaxKB 正式节点链路承载。

可以谨慎用于：

```text
字段说明卡片
只读预览
办理提示
风险提醒
格式化结果展示
附件预览跳转按钮
审批人 / 退回节点选择的步骤说明
```

说明：

```text
审批人或退回节点选择可以用 html_rander 展示“当前还没有提交，请先选择”的说明卡。
真正候选选择建议用 quick_question 发送自然语言，例如“选1 张三”或“取消”，继续进入识别、解析和后端校验链路。
不要用 HTML button 直接承载审批人选择、退回节点选择或正式提交。
```

### 6.1 发起智能体展示边界

发起智能体在 2026-07-09 的体验优化中确认以下边界：

```text
1. 字段说明、草稿确认、提交成功、失败提示、安全验证提示、审批人选择说明，适合使用 html_rander 轻量卡片。
2. AI 整理 + 回复引用节点，优先改 AI 节点提示词，让 AI 输出固定 html_rander；回复节点保持引用变量。
3. 固定回复节点可以直接写 html_rander，但不要为了样式追加无效 quick_question。
4. 草稿确认只保留“正式提交”“保存草稿”按钮；修改字段靠用户直接说具体内容。
5. 审批人选择用 html_rander 做步骤说明，候选审批人用 quick_question 全量输出，例如“选1 张三”。
6. 候选流程列表如果由工具生成 candidateText，先保持工具输出一致；不要在回复节点手工拼不完整按钮。
7. 不支持字段、附件失败、安全验证等场景只说明原因和去小程序处理方向，不输出无法跳转的按钮。
```

### 6.2 附件预览跳转建议

附件可以在详情页中展示文件名，并在具备安全预览地址时追加预览按钮。

推荐写法：

```html
<html_rander>
<table border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;margin:4px 0;">
  <tbody>
    <tr>
      <td style="border:1px solid #e8e8e8;background:#fff;padding:8px 10px;word-break:break-all;">请假证明.jpg</td>
      <td style="width:64px;border:1px solid #e8e8e8;background:#fff;padding:8px 6px;text-align:center;">
        <button onclick="jump('https://example.com/preview/xxx')" style="padding:3px 8px;border:1px solid #1677ff;background:#1677ff;color:#fff;border-radius:3px;">预览</button>
      </td>
    </tr>
  </tbody>
</table>
</html_rander>
```

正式使用前必须满足：

```text
1. 预览地址必须由后端或业务系统生成，且是当前用户有权限访问的安全地址。
2. 不要把 fileID、src、内网地址、downloadUrl、长期 token、用户隐私路径直接拼进 jump。
3. 地址应尽量短期有效，或由后端接口二次鉴权。
4. 如果没有安全 previewUrl，只展示文件名，不输出预览按钮。
5. 如果同一回复中还需要下一步对话操作，quick_question 仍放在 html_rander 外面。
```

多个附件展示规则：

```text
1. 多个附件必须一行一个，不能把多个文件名和多个“预览”按钮挤在同一个 div 里。
2. 每个附件建议用独立 table 行承载：左侧文件名，右侧固定宽度预览按钮。
3. 有安全 previewUrl 时输出按钮列；没有 previewUrl 时只输出单列文件名。
4. 文件名过长时允许自然换行，单元格加 word-break:break-all。
5. 预览按钮列建议宽度 64px；如果按钮拥挤可改为 72px。
6. 附件模块只做查看入口，不承载上传、审批、提交、安全校验等动作。
```

没有 `previewUrl` 时推荐写法：

```html
<html_rander>
<table border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;margin:4px 0;">
  <tbody>
    <tr>
      <td style="border:1px solid #e8e8e8;background:#fff;padding:8px 10px;word-break:break-all;">请假证明.jpg</td>
    </tr>
  </tbody>
</table>
</html_rander>
```

建议后端返回结构：

```json
{
  "fileName": "请假证明.jpg",
  "previewUrl": "https://example.com/office/ai/workflow/attachment-preview?token=xxx",
  "expireTime": "2026-07-08 18:00:00"
}
```

## 7. echarts_rander 使用边界

`<echarts_rander>` 用于图表展示，需要输出 ECharts option。

普通工作流对话不必优先使用图表。后续如果做流程统计、审批耗时分析、待办分布等智能体，可以再接入：

```text
本月流程发起数量
各流程分类占比
审批耗时趋势
待办数量分布
```

图表数据应由工具节点或后端接口生成结构化结果，再由固定模板包裹为图表渲染内容。

## 8. 工作流智能体落地建议

短期优化：

```text
1. 总入口开场白和兜底回复可保留 2 到 4 个高频快捷入口。
2. 候选流程列表回复末尾追加 quick_question 编号。
3. 字段填写阶段可追加“保存草稿”“正式提交”等明确动作；字段修改和补充靠用户直接输入具体内容。
4. 列表、详情和查询类场景可追加“查看详情”“返回列表”“重新查询”等短操作。
5. 确认、候选人选择、候选节点选择等固定操作优先补 quick_question，降低用户输入难度。
```

长期原则：

```text
1. 快捷问题只做体验增强，不做唯一入口。
2. 关键业务状态仍用会话变量和后端草稿保存。
3. 正式提交、审批、安全验证不要依赖 HTML 标签。
4. 标签结构优先由指定回复或工具固定生成，不交给模型自由发挥。
```

## 9. 资料来源

```text
FIT2CLOUD 社区帖：https://bbs.fit2cloud.com/t/topic/11172
主题：MaxKB 中的特殊标签 quick_question、echarts_rander、html_rander
MaxKB 官方 v2.8.0 更新日志：https://maxkb.cn/docs/v2/changelog/#v280
MaxKB 官方 v2.10.2-lts 更新日志：https://maxkb.cn/docs/v2/changelog/#v2102-lts
```
