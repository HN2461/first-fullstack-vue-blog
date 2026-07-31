---
title: "第 14 篇：MaxKB 变量拆分节点"
slug: "maxkb-13-adde6b4f"
summary: "本文整理 13-变量拆分节点，归纳 MaxKB 节点创建手册相关的配置方法、实践步骤、边界条件与常见注意事项。"
category: "节点创建手册"
tags:
  - "MaxKB"
  - "AI应用开发"
  - "节点创建手册"
  - "智能体"
status: "published"
sortOrder: 150
cover: ""
originalId: "6a6b691f4bf50146e9b95e58"
originalSlug: "maxkb-13-adde6b4f"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 14 篇：MaxKB 变量拆分节点
> 文档状态（2026-07-01）：根据空白高级智能体验证截图、MaxKB 官方文档和JSON 字段处理通用实践，记录变量拆分节点配置、JSON Path 表达式和高频搭配用法。

## 1. 节点定位

`变量拆分` 属于添加组件面板中的：

```text
基础组件 -> 数据处理 -> 变量拆分
```

官方节点说明：

```text
用 JSON Path 表达式把输入的 JSON 变量一次拆成多个独立变量。
```

通用理解：

```text
变量拆分是工具节点、AI JSON 输出、表单收集、变量赋值、判断器之间的常用衔接节点。
它负责把一个大的 JSON 结构拆成后续节点能直接引用的小字段。
```

典型用途：

```text
1. 从工具返回 JSON 中拆出 selectedFlowDefineID、selectedFlowName、success、message。
2. 从表单收集 form_data 中拆出附件、文本字段、选择项。
3. 从 AI 输出的结构化 JSON 中拆出 intent、action、fields。
4. 从附件数组或组件字段数组中拆出某个字段，交给判断器或变量赋值。
5. 从复杂接口响应中拆出业务需要的结果，避免后续节点手写长路径。
```

## 2. 节点初始配置

当前截图中，变量拆分节点包含：

| 配置项 | 当前可见内容 | 说明 |
| --- | --- | --- |
| 输入变量 | 下拉选择变量 | 必填，选择待拆分的 JSON 变量 |
| 拆分变量 | `+` 添加 | 必填，配置一个或多个输出字段 |
| 输出参数 | `结果(result)` | 默认输出所有拆分结果 |

节点输出区域默认显示：

```text
结果(result)
```

官方文档补充：

```text
结果{result}：输出所有拆分变量的内容。
显示名称{拆分变量}：单个拆分变量的内容，随拆分变量更新。
```

也就是说：

```text
添加拆分变量后，变量拆分节点会额外出现对应的单字段输出。
```

## 3. 输入变量

`输入变量` 是要被拆分的源 JSON。

适合选择：

```text
1. 工具节点返回的 JSON 对象。
2. 表单收集节点的 form_data。
3. AI 对话节点返回的结构化 JSON。
4. 变量赋值保存过的 json 类型会话变量。
5. 循环开始的 item，如果 item 本身是对象。
```

注意：

```text
输入变量最好是真 JSON 对象或 JSON 数组。
如果输入是普通字符串，JSON Path 拆分可能失败或返回空。
```

项目建议：

```text
1. 工具节点尽量返回标准 JSON，不要返回一段人话里包 JSON。
2. AI 节点如果要给变量拆分使用，提示词必须要求只输出 JSON。
3. 如果变量赋值保存 JSON，应使用自定义 json 类型，不要用 string 保存 JSON 字符串。
```

## 4. 添加拆分变量

点击 `拆分变量` 右侧的 `+` 后，弹出添加变量弹窗。

当前截图中弹窗字段为：

| 字段 | 说明 |
| --- | --- |
| 变量 | 输出变量名，最多 64 字符 |
| 显示名称 | 画布展示名称，最多 64 字符 |
| 表达式 | JSON Path 表达式，最多 64 字符 |

截图中表达式提示为：

```text
请使用 JSON Path 表达式拆分变量，例如：$.store.book
点击查看详情 -> pypi.org
```

使用规则：

```text
1. 变量：后续节点引用时使用的英文变量名。
2. 显示名称：给人看的中文名称。
3. 表达式：从输入 JSON 中取值的 JSON Path。
```

示例：

```text
变量：selectedFlowDefineID
显示名称：选中流程 ID
表达式：$.selectedFlowDefineID
```

输出引用：

```text
{{变量拆分.selectedFlowDefineID}}
```

注意：

```text
变量名建议使用英文，不要用中文或空格。
显示名称可以用中文。
```

## 5. JSON Path 常用写法

以下是常见 JSON Path 示例，实际以当前 MaxKB 支持范围为准：

| 目标 | 示例表达式 | 说明 |
| --- | --- | --- |
| 根对象字段 | `$.success` | 取根对象的 success |
| 嵌套字段 | `$.data.id` | 取 data 下的 id |
| 数组第一个元素 | `$.data[0]` | 取 data 数组第 1 项 |
| 数组第一个元素字段 | `$.data[0].id` | 取 data 数组第 1 项的 id |
| 整个数组 | `$.items` | 取 items 数组 |
| 对象中的列表字段 | `$.form.fields` | 取 form.fields |

项目高频示例：

```text
$.selectedFlowDefineID
$.selectedFlowName
$.message
$.data
$.data.formItems
$.form_data.attachment_test
$.attachment_test
$.currentApprovers
```

注意：

```text
不要在指定回复节点里直接写复杂数组路径。
复杂结构优先用变量拆分拆成独立变量，再交给指定回复、判断器或变量赋值。
```

## 6. 与变量赋值配合

常见链路：

```text
工具节点
  -> 变量拆分
  -> 变量赋值
```

用途：

```text
把工具返回的大 JSON 拆成多个字段，再保存到会话变量中。
```

示例：

```text
工具输出：
{
  "selectedFlowDefineID": "xxx",
  "selectedFlowName": "请假申请",
  "message": "已选择请假申请流程"
}
```

变量拆分：

| 变量 | 显示名称 | 表达式 |
| --- | --- | --- |
| `selectedFlowDefineID` | 选中流程 ID | `$.selectedFlowDefineID` |
| `selectedFlowName` | 选中流程名称 | `$.selectedFlowName` |
| `message` | 提示文案 | `$.message` |

变量赋值：

```text
selectedFlowDefineID <- {{变量拆分.selectedFlowDefineID}}
selectedFlowName <- {{变量拆分.selectedFlowName}}
lastMessage <- {{变量拆分.message}}
```

## 7. 与判断器配合

常见链路：

```text
工具节点
  -> 变量拆分
  -> 判断器
```

推荐判断：

```text
selectedFlowDefineID 不为空
selectedKeys 不为空
message 不为空
attachmentList 不为空
```

谨慎判断：

```text
success 等于 true
```

原因：

```text
MaxKB 里布尔 true 和字符串 true 容易混用。
项目里更稳的做法是判断关键业务字段不为空。
```

注意：

```text
如果 JSON Path 没取到值，后续判断器大概率会得到空值。
因此拆分后进入判断器前，要优先判断关键字段是否不为空。
```

## 8. 与表单收集配合

表单收集默认输出：

```text
表单全部内容(form_data)
```

变量拆分可以从 `form_data` 中拆出具体字段。

示例：

```text
输入变量：{{表单收集.form_data}}
拆分变量：
attachment_test -> $.attachment_test
remark -> $.remark
fieldValues -> $.fieldValues
```

注意：

```text
MaxKB 表单收集文件上传拿到的是 MaxKB 内部 file_id。
如果要提交到业务系统，仍需工具节点转成目标项目自己的附件字段协议。
```

## 9. 与循环节点配合

循环节点中，`循环开始.item` 可能是一个对象。

常见链路：

```text
循环开始.item
  -> 变量拆分
  -> 判断器 / 工具节点 / 变量赋值
```

示例：

```text
输入变量：{{循环开始.item}}
拆分变量：
fieldKey -> $.fieldKey
fieldName -> $.fieldName
componentType -> $.componentType
value -> $.value
```

适合：

```text
1. 循环处理组件字段。
2. 循环处理附件对象。
3. 循环处理候选流程或审批人。
```

## 10. result 输出怎么理解

变量拆分节点默认输出：

```text
结果(result)
```

官方口径：

```text
result 输出所有拆分变量的内容。
```

项目理解：

```text
result 适合整体传给工具节点或调试查看。
如果后续只需要某一个字段，优先引用对应的单字段输出。
```

示例：

```text
{{变量拆分.result}}
{{变量拆分.selectedFlowDefineID}}
{{变量拆分.message}}
```

## 11. 易错点

```text
1. 输入变量不是 JSON，而是字符串，导致拆分为空。
2. 表达式漏写 `$`，例如写成 data.id 而不是 $.data.id。
3. JSON Path 写错层级，后续判断器一直走空值分支。
4. 想取数组第一个元素却写成 $.data.id，实际 data 是数组。
5. 拆分变量名和显示名称混用，引用时写了中文显示名称。
6. AI 输出 JSON 外面带了说明文字，变量拆分无法直接解析。
7. 工具返回字段有时为对象、有时为字符串，导致同一个 JSON Path 不稳定。
8. 对数组复杂过滤表达式依赖过强，当前 MaxKB 版本支持范围需要实测。
```

## 12. 推荐用法

```text
1. 工具节点优先返回稳定 JSON，再用变量拆分拆字段。
2. 重要字段拆出来后，再用判断器判断“不为空”。
3. 需要跨轮使用的字段，拆分后用变量赋值保存到会话变量。
4. 复杂数组处理优先配合循环节点，不要在一个 JSON Path 里写太复杂。
5. 变量名使用英文，显示名称使用中文，方便后续变量选择。
6. 变量拆分节点名称要按业务改名，例如“拆分流程选择结果”“拆分附件上传结果”。
```

## 13. 资料补充

| 来源 | 补充点 |
| --- | --- |
| MaxKB 官方高级智能体文档 | 变量拆分节点使用 JSON Path 表达式拆分输入 JSON 变量；输入变量为待拆分 JSON；拆分变量包含名称、显示名称和 JSON Path 表达式；输出包含 `result` 和单个拆分变量 |
| FIT2CLOUD 发布说明 | MaxKB v2.3.0 新增变量拆分节点，用于把 JSON 格式变量拆成多个独立变量，便于后续节点独立调用与处理 |
| MaxKB 更新日志 | 后续版本优化过变量拆分节点的拆分表达式组件，复杂 JSON Path 支持范围要以当前版本实测为准 |

注意：

```text
资料只作为补充，最终以当前 MaxKB 实际界面和截图为准。
```

## 14. 待继续核对

```text
1. 输入变量下拉是否会限制 JSON 类型，还是所有变量都可选。
2. JSON Path 拆不到值时，单字段输出是 null、空字符串，还是不出现。
3. 表达式最多 64 字符是否足够复杂业务路径使用。
4. 是否支持数组通配 `[*]`、过滤表达式、递归查找等扩展 JSON Path。
5. 拆分变量输出的类型是否保留原始类型，还是统一转字符串。
6. result 的实际结构是对象、字符串，还是数组。
7. 变量拆分失败时是否进入异常捕获，还是继续执行并输出空值。
```
