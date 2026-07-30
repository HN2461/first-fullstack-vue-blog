---
title: "第七篇：Codex 当前常用功能与进阶工作流手册"
slug: "ai-agent-codex-codex-1c9633e1"
summary: "面向日常开发高频场景系统梳理 Codex 当前仍在主线中的常用功能、进阶工作流与最近该升级的认知，减少多篇重复查阅。"
category: "Codex"
tags:
  - "Codex"
  - "功能手册"
  - "App"
  - "IDE"
  - "CLI"
  - "OpenAI官方"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf80"
originalSlug: "ai-agent-codex-codex-1c9633e1"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第七篇：Codex 当前常用功能与进阶工作流手册

> 更新时间：2026-07-26（按本机当前 Codex CLI 0.146 系列、Windows App 26.721.4979.0 与模型目录复核）
> 定位：主线大总手册。专门解决“我知道 Codex 大概能做什么，但开发时到底该用哪个入口、哪些旧说法该删、哪些进阶能力该什么时候补”的问题。
> 适合谁看：主人已经开始真正把 Codex 用进日常开发，希望文档既能查功能，也能防止自己继续按旧认知误用。
> 本篇原则：把原本分散在“当前常用功能”“官方进阶补充”“最近更新差异”里的重复内容合成一篇，主线只保留真正值得长期查的东西。
> 前置建议：第三篇先读配置总手册，第五篇看三端联动；官方进阶、桌面端和 IDE 新能力统一在本篇维护。
> 小白读完目标：你应该能知道今天开发时最常用的功能分别从 CLI、IDE、App 的哪个入口进入，也能知道 `codex exec`、MCP 治理、profile、Windows / WSL、最近产品升级这些内容该怎么放进长期工作流。

章节导航（点击跳转）：

[[toc]]

---

## 0. 先定一条文档维护原则：不是“旧的都删”，而是“看官方主线还在不在”

以后主人更新 Codex 资料，建议一律按下面 3 条判断：

1. 如果官方当前文档里还保留独立页面、独立导航或明确说明，这个功能就不该因为“看起来老”而直接删掉
2. 如果官方已经把旧入口升级成新工作流，就不要继续拿旧表述当主线，例如把 App 说成“只是桌面壳”、把 IDE 说成“只是编辑器里的 CLI 壳”
3. 如果某个说法只剩历史样例价值，没有继续作为官方推荐路径出现，就保留到“历史快照 / 排障样本”里，不再放进“新手默认配置”或“当前常用功能”里

这套标准用到本篇时，最典型的几组判断是：

1. `AGENTS.md`、`profiles`、`MCP`、`codex exec` 这些能力没过时，因为官方主线还在
2. “一个仓库只对应一个工作目录”这种理解过时了，因为 App 已经明确支持 `worktrees`
3. “Windows 主要就是凑合能跑，复杂项目只能靠 WSL”这种说法不该继续当主线，因为官方现在单独维护 Windows 页面，而且 App 已支持 Windows-native agent 和 native Windows sandbox
4. “IDE 只能文字对话 + 代码上下文”这种说法也该删，因为官方已经补了云任务、图片拖拽、图像生成和 web search

---

## 1. 模型：GPT-5.6 要按任务角色选，不再固定一个默认名

当前 Codex CLI 模型目录已经进入 GPT-5.6 分层：

| 模型 | 定位 | 适合场景 |
|---|---|---|
| `gpt-5.6-sol` | 最新旗舰 Agent 编码模型 | 最难的重构、复杂排错、研究和质量优先任务 |
| `gpt-5.6-terra` | 日常平衡档 | 常规读仓库、改代码、补测试、写文档和多数桌面 App 任务 |
| `gpt-5.6-luna` | 快速轻量档 | 高吞吐整理、分类、简单检查和严格延迟任务 |
| `gpt-5.5` | 上一代旗舰 | 既有配置、第三方 provider 或兼容场景 |

更稳妥的选择顺序是：

1. 日常任务先评估 `gpt-5.6-terra`
2. 任务很难、失败代价高或质量优先时切 `gpt-5.6-sol`
3. 任务简单、量大、延迟敏感时评估 `gpt-5.6-luna`
4. 既有第三方线路不要只因为名字旧就机械升级，先看后台是否真实支持 GPT-5.6

### 1.1 推理强度也要跟模型一起看

当前 CLI 中，Sol 和 Terra 可见 `low / medium / high / xhigh / max / ultra`，Luna 可见到 `max`，旧模型通常只到 `xhigh`。不同版本和账号仍可能不同，所以：

1. 以当前 `/model` 列表为准
2. 日常任务从模型默认档或 `medium` 起步
3. Sol 当前默认可以从较低 effort 开始，难任务再逐级提高
4. `max` 和 `ultra` 不是长期默认；只有代表性任务证明质量收益时才使用
5. CLI 档位和 API 的 `reasoning.effort` 不能直接混写

### 1.2 第三方线路该怎么写模型，才不会过时

任何第三方线路都建议统一用这句模板：

1. “以下模型名仅作当前示例，更新前请先核对该服务商后台当前开放模型”
2. “如果服务商未开放官方当前默认示例，请直接以后台真实可选模型为准”
3. “不要把历史线路样例模型名当长期固定默认答案”

---

## 2. App：这里只保留能力地图，细节统一放到第八篇

从桌面版 `26.707` 起，Codex 已并入 macOS 和 Windows 的 ChatGPT desktop app。App 的更新频率明显高于普通教程的维护频率，因此本篇只回答“该去哪里做”，不再重复具体按钮和平台边界。

| 需求 | App 入口或能力 | 主要作用 |
|---|---|---|
| 同时管理多个相关目录 | 多文件夹项目 | primary folder 决定 Git 与配置自动发现，secondary folders 参与搜索、读写 |
| 并行处理仓库任务 | Local / Worktree / Cloud | 本地连续修改、隔离并行、云端委派各自分工 |
| 在环境之间继续同一任务 | Handoff / Remote | Local 与 Worktree、匹配的本地与远程 host 有明确迁移流程 |
| 检查与修正改动 | Git / Review / PR Chat | 查看 diff、inline comment、stage、commit、push，并处理 GitHub PR 反馈 |
| 直接处理产物 | Markdown / code 编辑与 annotations | 选中文本后让 Codex 定点修改，不必只在对话里描述 |
| 验证网页和桌面 UI | Browser / Developer mode / Computer Use | 浏览器预览、CDP 调试、Windows/macOS 桌面操作 |
| 安排持续工作 | Scheduled tasks / Goals | 定时运行或让长线程持续追踪明确目标 |
| 扩展外部能力 | Plugins / Skills / MCP | 安装工作流、连接器、工具与生命周期能力 |
| 跨设备继续工作 | Remote | 手机或其他受支持设备连接 Mac/Windows host |
| 口头协调多个线程 | ChatGPT Voice | 在 Chat、Work、Codex 中启动、检查和 steer 任务 |

当前 App 的版本检查、账号与灰度边界、工作流步骤、Computer Use 的 Windows 前台限制，以及 Remote、Voice、Record & Replay 的平台差异，全部集中在[第八篇：Codex 桌面 App 当前功能与 Windows 实战](#/note/AI工具/02_终端Agent流/Codex/08_Codex桌面App当前功能与Windows实战)。后续 App 更新也只维护第八篇，避免同一事实散落在多篇文章里。

---

## 3. IDE 扩展：当前最常用的开发协作入口

今天的 IDE 扩展已经不是“编辑器里套了个聊天面板”。

### 3.1 三种工作模式要分清

官方当前页面里，IDE 至少要区分：

1. `Chat`：聊天、规划、先讨论方案
2. `Agent`：默认模式，可自动读文件、改代码、在工作目录里跑命令
3. `Agent (Full Access)`：需要更高权限和网络访问时用，风险也最高

正确理解：

1. 不是所有问题一上来都该开 full access
2. 先用 `Agent` 就够解决大多数本地开发问题
3. 只有明确需要时，才切更高权限

### 3.2 `Cloud delegation`

这是今天 IDE 最值得保留并写细的功能点之一。

官方当前流程很明确：

1. 先配置 cloud environment
2. 在 IDE 里选 Run in the cloud
3. 可以从 `main` 起跑，也可以基于你本地当前改动起跑
4. 本地对话上下文会被带过去
5. 云端跑完以后，还能把 cloud task 再拉回 IDE 继续跟进

主人最实用的用法：

1. 大改造、长耗时任务、需要更干净环境的任务丢给云端
2. 本地保留审查、验证、微调、最终提交
3. 把“云端跑长任务 + 本地收尾”当成标准工作流

### 3.3 `Web search`

官方当前对 IDE 扩展的默认行为写得很清楚：

1. 本地任务下，web search 默认启用
2. 默认使用 OpenAI 维护的 web search cache，而不是直接 live 抓取
3. 这样能降低来自任意 live 页面 prompt injection 的暴露面
4. 如果你把 sandbox 配成 full access，web search 默认会走 live results

主人开发时要知道：

1. 缓存搜索更稳，也更适合日常开发
2. 需要查“刚发布、刚更新”的资料时，再考虑 live
3. 搜索结果依旧是外部信息，不能无脑信

### 3.4 图片拖拽

这是现在 IDE 扩展里非常实用的多模态入口。

官方当前说明：

1. 可以把图片直接拖进 prompt composer
2. 在 VS Code 里拖图时要按住 `Shift`，否则编辑器可能拦截掉扩展接收

这块的高频场景：

1. UI 稿还原
2. 页面异常截图分析
3. 控件布局问题定位
4. 视觉回归排查

### 3.5 内置图像生成

这也是现在应该保留的新能力，不该继续省略。

官方当前页面明确写到：

1. 可以不离开编辑器直接生成或编辑图片
2. 适合做 UI 资产、布局草图、插画、sprite sheet、占位图
3. 可以直接自然语言要求生成，也可以显式写 `$imagegen`
4. 内置图像生成使用的是 `gpt-image-2`

主人开发时怎么用最值：

1. 快速出前端占位图
2. 做界面视觉草图
3. 让一张参考图派生多个版本

### 3.6 Windows 下的 WSL 开关

IDE 设置页里当前有一个特别实用的项：

`chatgpt.runCodexInWindowsSubsystemForLinux`

主人要知道的点：

1. 当仓库和工具链都主要在 WSL2 时，可以打开它
2. 当你主要在 Windows-native 工作时，不必强开
3. 改这个设置会触发 VS Code reload 才生效

### 3.7 还有哪些编辑器设置仍然值得保留

当前还值得保留到文档里的设置有：

1. `chatgpt.commentCodeLensEnabled`：在 TODO 等注释上方显示 CodeLens，方便直接交给 Codex 处理
2. `chatgpt.openOnStartup`：扩展完成启动后是否自动聚焦 Codex 侧边栏
3. `chatgpt.cliExecutable`：一般不需要改，除非你自己在开发 Codex CLI

---

## 4. CLI：这些老能力没过时，反而还是底层核心

虽然 App 和 IDE 变强了，但 CLI 并没有过时。

### 4.1 `codex`

交互式主入口。

适合：

1. 进入当前仓库直接协作
2. 本地快速排查
3. 需要更透明地看模型、配置、审批和沙箱时

### 4.2 `codex exec`

这是自动化和批处理的底座。

适合：

1. 一次性非交互任务
2. CI/CD 流水线
3. 定时脚本
4. 机器可读输出链路

高频搭配：

1. `codex exec "..."`
2. `codex exec --json "..."`
3. `codex exec --profile <name> "..."`

### 4.3 `resume`

这条能力仍然很值。

适合：

1. 长任务中断后续跑
2. 重开终端继续之前的上下文
3. 把会话拆成多段完成

### 4.4 `approval_policy` + `sandbox_mode`

这俩仍然是所有入口最核心的安全边界。

主人日常最推荐的起步组合：

```toml
approval_policy = 'on-request'
sandbox_mode = 'workspace-write'
```

如果只是审计或看代码：

```toml
approval_policy = 'never'
sandbox_mode = 'read-only'
```

历史参数说明：

1. 当前 CLI 已移除 `--full-auto`，新文档必须使用显式的审批和沙箱参数
2. `--yolo` 仍可能作为隐藏高风险别名被接受，但正式说明应使用 `--dangerously-bypass-approvals-and-sandbox`

### 4.5 `AGENTS.md`

它没有过时，反而越用越重要。

当前最值得写清楚的点：

1. 它决定项目长期规则
2. 离当前目录越近的说明文件覆盖力越强
3. 真要长期稳定协作，`AGENTS.md` 的价值比你临时打一段 prompt 更高

### 4.6 `MCP`

也完全没过时。

它解决的是：

1. 给 Codex 接第三方工具
2. 把浏览器、GitHub、内部脚本、数据源接进工作流
3. 让 Codex 不只是“看代码”，而是能操作真实工具环境

### 4.7 `Profiles`

这条也不该删。

最实用的价值：

1. 同一个人切换“日常开发 / 审计 / 自动化”时，不用每次重写一堆参数
2. 团队能把几套常用权限模板固定下来

### 4.8 `Plugins` 与 Marketplace

当前 CLI 已提供正式的 `codex plugin` 命令，桌面 App 安装包也包含插件和 skills 运行资源。排查扩展能力时要按层看：

1. `codex plugin list` 看市场、安装和启用状态
2. `/plugins` 看当前会话里插件来源
3. `/skills` 看插件或本地目录带进来的工作流
4. `/mcp` 看插件附带或单独配置的实时工具

### 4.9 多 Agent、Goals 与 Hooks

当前功能目录已把 `multi_agent`、`goals` 和 `hooks` 标为稳定能力，但具体 UI、账号开放和默认开关仍可能变化：

1. 多 Agent 适合真正可以并行的独立子任务，不能为了“看起来高级”重复派工
2. Goals 适合长线程持续追踪完成目标
3. Hooks 适合在工具调用、命令或文件编辑前后做机械治理
4. 这三类能力都要和审批、沙箱、项目规则一起设计

---

## 5. 官方进阶能力：这部分已经并入本篇

原来拆出去的“官方资料补充与进阶实践”，现在并入这里。
以后主人不用再额外点一篇去看 `codex exec`、MCP 治理、`AGENTS.md` 进阶和 profile 策略。

### 5.1 `codex exec`

`codex exec` 仍然是 Codex 最值得保留的进阶能力之一。
它不是“没有聊天界面的 codex”，而是更适合脚本化、流水线化、可重复执行任务的入口。

高频用法：

```bash
codex exec "summarize the repository structure and list the top 5 risky areas"
codex exec --json "summarize the repo structure"
codex exec --profile ci "run CI triage and output a short report"
codex exec resume --last "continue from previous run"
```

主人真正开发时最实用的场景：

1. CI 失败后自动出风险摘要
2. 定时扫仓库，生成待办清单
3. 对某个大目录做一次性结构化整理
4. 用 `--json` 把结果继续交给别的脚本消费

### 5.2 MCP 治理

MCP 的“怎么连上”，第一篇、第六篇、第二篇已经够用了。
这里保留更偏工程治理的一层。

主人以后给团队或长期项目接 MCP，重点看这 4 个问题：

1. 哪些工具起不来就应该直接 fail-fast
2. 哪些工具应该只开白名单，而不是全量暴露
3. 哪些工具只该在某个 profile 下启用
4. 哪些工具适合本地开发，不适合自动化或云端环境

真正高频的治理点：

1. `required = true`
2. `enabled_tools`
3. `disabled_tools`
4. `startup_timeout_ms`
5. `tool_timeout_ms`

### 5.3 `AGENTS.md` 进阶

`AGENTS.md` 不只是“写点规则”。
当项目规模变大后，它更像长期协作规范的分层入口。

比较稳的分层思路：

1. 用户级 `~/.codex/AGENTS.md`：放个人长期习惯
2. 仓库根 `AGENTS.md`：放团队统一流程
3. 子目录 `AGENTS.md`：只放该模块特有约束

如果你怀疑说明文件没被正确读取，再去看：

1. `project_doc_max_bytes`
2. `project_doc_fallback_filenames`

### 5.4 Profiles

Profile 的价值不是“字段更高级”，而是把不同工作模式固定下来，减少每次临时切参数。

长期最值得保留的通常不是很多套花哨 profile，而是 2 到 3 套够明确的：

1. `safe`：日常开发
2. `audit`：只读审查
3. `ci`：自动化或批处理

官方当前 profile 是独立文件，而不是主 `config.toml` 里的 `[profiles.<name>]` 表。一个够实用的最小例子是分别创建这些文件：

`~/.codex/safe.config.toml`

```toml
approval_policy = 'on-request'
sandbox_mode = 'workspace-write'
```

`~/.codex/audit.config.toml`

```toml
approval_policy = 'never'
sandbox_mode = 'read-only'
```

`~/.codex/ci.config.toml`

```toml
approval_policy = 'never'
sandbox_mode = 'read-only'
```

调用时用 `codex --profile safe`、`codex --profile audit` 或 `codex exec --profile ci "..."`。

---

## 6. 最近产品口径更新：这部分也并进本篇

原来拆出去的“近期待补全更新总表”，现在也并入这里。
以后主人只要读这一节，就能知道哪些旧认知该升级。

### 6.1 还没过时的部分

下面这些主干判断仍然成立：

1. Codex 的底层核心仍然是认证、配置层级、审批策略、沙箱、`AGENTS.md`、MCP、非交互执行
2. `approval_policy` 和 `sandbox_mode` 依旧是最重要的安全边界
3. 命令行、项目级 `.codex/config.toml`、profile 文件、用户级 `~/.codex/config.toml` 之间仍然要按优先级排查，但 profile 的官方写法已从表结构转为独立文件
4. `codex exec` 仍然是自动化、批处理、CI 场景的关键入口
5. IDE 和 App 仍然高度复用同一套 Codex 能力，而不是三套完全不同的产品

### 6.2 已经明显不够新的部分

下面这些地方，如果继续按旧文理解，就会漏掉最近最重要的变化：

1. 桌面版不再只是“读取同一份配置的图形壳”
2. IDE 扩展不再只是“在编辑器里调一下 CLI”
3. 云端任务已经是官方明确强调的主能力
4. Windows 相关说明要从“能用但建议 WSL”升级成“原生已补出更多官方能力”
5. 模型建议不能继续写成某个固定模型名的长期结论

### 6.3 今天最值得补齐的更新主题

如果你只记一张清单，就记这 7 组：

1. 桌面版新增并独立成体系的能力：多文件夹项目、`Worktrees`、`Handoff`、`Local environments`、Scheduled tasks
2. 桌面版工作流增强：Voice、Built-in Git、PR Chat、Integrated terminal、Browser、Computer Use
3. IDE 扩展增强：Cloud delegation、图片拖拽、图像生成
4. Windows 专题增强：原生 Windows 页面、原生沙箱说明、WSL 切换与 `CODEX_HOME` 边界
5. 模型口径更新：默认本地示例应优先对齐官方当前模型页，不再把历史模型名写成长期固定答案
6. 扩展体系更新：插件 Marketplace、插件共享、skills 与 MCP 的职责边界
7. Agent 工作流更新：多 Agent、Goals、Hooks、会话 fork / archive，以及 Remote 产品 GA 与 CLI 实验命令的边界

---

## 7. 哪些旧描述现在该删，哪些该留

这里给主人一张最实用的判断表。

### 7.1 建议删除或重写的旧描述

1. “App 就是读取同一份配置的桌面壳”
2. “IDE 扩展就是编辑器里的 CLI 壳”
3. “Windows 主要还是不推荐，复杂项目只能靠 WSL”
4. “默认模型就写死成某个旧模型名”
5. “图像、多模态、云任务都只是边缘能力”
6. “一仓库一线程一目录基本够用了”

### 7.2 应该保留，但要换成新边界写法的旧能力

1. `AGENTS.md`
2. `MCP`
3. `codex exec`
4. `profiles`
5. `approval_policy`
6. `sandbox_mode`
7. `resume`

### 7.3 该留在“历史样本 / 排障样本”里的内容

1. 某台机器的旧 `.codex/config.toml` 快照
2. 某条第三方线路曾经开放过的旧模型名
3. 某次 PowerShell / Node / 中转切换故障现场

这些不是“删除”，而是不能再写成今天的默认推荐。

---

## 8. 主人真正开发时的推荐使用顺序

如果是今天开始一个真实开发任务，我更推荐这样走：

1. 先看模型与权限：确认当前线路可用模型、`approval_policy`、`sandbox_mode`
2. 如果主要在 IDE 里做，先用 `Agent` 模式进入本地任务
3. 要长跑或大改造时用 `Cloud delegation`；要迁移既有 chat 时按 App 的 `Handoff` / `Remote` 流程处理
4. 桌面 App 里要并行任务，就开 `Worktrees`
5. 高频命令和环境准备，写进 `Local environments`
6. 改完先过 `Review pane` / diff，再决定 stage、commit、push
7. 页面与前端可视化问题，优先用 IDE 图片拖拽、图像生成或 App 的 Browser
8. 需要自动化重复工作时，再上 Scheduled tasks

---

## 9. 合并后整套文章怎么分工

为了避免以后内容再打架，主人可以这样记：

1. [第三篇：Codex 配置总手册](#/note/AI工具/02_终端Agent流/Codex/03_Codex配置总手册)
   负责配置心智模型。
2. [第五篇：Codex CLI / 插件 / App 三端联动实战](#/note/AI工具/02_终端Agent流/Codex/05_Codex_CLI插件App三端联动实战)
   负责三端联动与排障。
3. [第四篇：Codex 多线路接入与迁移总手册](#/note/AI工具/02_终端Agent流/Codex/04_Codex多线路接入与迁移总手册)
   负责官方、Packy、yunyi、rpcod 等线路选择与迁移。
4. [第六篇：Codex 命令与配置文件速查](#/note/AI工具/02_终端Agent流/Codex/06_Codex命令与配置文件速查)
   负责命令、配置文件和 slash command 速查。
5. **第七篇（本篇）**
   负责当前常用功能、官方进阶能力和最近该升级的产品认知。
6. **第八篇：Codex 桌面 App 当前功能与 Windows 实战**
   负责 App 版本检查、多文件夹项目、Voice、Local / Worktree / Cloud、Git / PR Chat、Browser / Computer Use、Scheduled tasks、Remote、插件与 Windows-native / WSL 实战。

专题当前收束为 8 篇主文，不再保留“已并入”的历史跳转页。

---

## 10. 官方资料入口

- Codex 模型页：<https://developers.openai.com/codex/models>
- App 功能：<https://developers.openai.com/codex/app/features>
- App Review：<https://developers.openai.com/codex/app/review>
- App Worktrees：<https://developers.openai.com/codex/app/worktrees>
- App Local Environments：<https://developers.openai.com/codex/app/local-environments>
- App Scheduled tasks：<https://developers.openai.com/codex/app/automations>
- App Browser：<https://learn.chatgpt.com/docs/browser?surface=app>
- App Computer Use：<https://learn.chatgpt.com/docs/computer-use>
- App Voice：<https://learn.chatgpt.com/docs/features/voice>
- App Remote：<https://learn.chatgpt.com/docs/remote-connections>
- App Windows：<https://developers.openai.com/codex/app/windows>
- Codex Changelog：<https://learn.chatgpt.com/docs/changelog>
- Codex Plugins：<https://developers.openai.com/codex/plugins>
- IDE 功能：<https://developers.openai.com/codex/ide/features>
- IDE 设置：<https://developers.openai.com/codex/ide/settings>
- CLI 概览：<https://developers.openai.com/codex/cli>
- CLI 功能：<https://developers.openai.com/codex/cli/features>
- CLI 参数参考：<https://developers.openai.com/codex/cli/reference>
- CLI Slash Commands：<https://developers.openai.com/codex/cli/slash-commands>
- Config Basics：<https://developers.openai.com/codex/config-basic>
- Config Reference：<https://developers.openai.com/codex/config-reference>
- AGENTS.md：<https://developers.openai.com/codex/guides/agents-md>
- Non-interactive：<https://developers.openai.com/codex/noninteractive>
- MCP：<https://developers.openai.com/codex/mcp>
