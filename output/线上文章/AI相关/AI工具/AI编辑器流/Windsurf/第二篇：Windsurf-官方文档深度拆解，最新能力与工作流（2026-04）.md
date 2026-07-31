---
title: "第二篇：Windsurf 官方文档深度拆解，最新能力与工作流（2026-04）"
slug: "ai-ai-windsurf-windsurf-4667d3b6"
summary: "基于 Windsurf 官方文档、官方定价页与官方 changelog 交叉核对到 2026-04-14，详细拆解当前版本的安装要求、Code/Plan/Ask 模式、Adaptive 与配额体系、Tab/Command、Fast Context、Rules/AGENTS.md/Skills/Workflows、MCP、Hooks、Previews 与 App Deploys。"
category: "Windsurf"
tags:
  - "Windsurf"
  - "官方文档"
  - "最新动态"
  - "Cascade"
  - "工作流"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cabefc"
originalSlug: "ai-ai-windsurf-windsurf-4667d3b6"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第二篇：Windsurf 官方文档深度拆解，最新能力与工作流（2026-04）

> 资料快照时间：2026-04-14，最新更新：2026-05-08（添加 Windsurf 2.0 说明）
> 本篇只参考 Windsurf 官方文档、官方定价页和官方 changelog。
> 由于 Windsurf 官方文档首页明确提示“部分文档可能落后于实际产品”，本文对“容易过时”的内容，优先以更新时间更近的 changelog、pricing 页和更具体的功能页为准。
> **重要更新**：2026-05 发布的 Windsurf 2.0 带来了 Devin 集成、Agent Command Center 等重大更新，详见[第五篇文档](#/note/AI工具/01_AI编辑器流/Windsurf/第五篇_Windsurf_2.0与Devin集成实战_2026-05)。

[[toc]]

---

## 一、先说结论：截至 2026-05-08，Windsurf 的"最新官方状态"是什么

如果主人只想先抓重点，我先把这次深搜后最值得记住的结论放前面。

**重要更新（2026-05）**：Windsurf 2.0 已发布，带来了 Devin 集成、Agent Command Center 等重大更新。详见[第五篇文档](#/note/AI工具/01_AI编辑器流/Windsurf/第五篇_Windsurf_2.0与Devin集成实战_2026-05)。

### 1. 截至 2026-04-14 的最新稳定版 changelog

我核对到的官方 `Windsurf Editor Changelog` 最新稳定记录是：

- `2026-04-07`：`1.9600.41`
- `2026-04-06`：`1.9600.40`
- `2026-04-06`：`1.9600.38`

这几条里最重要的新变化不是单个模型上新，而是 **Adaptive** 和 **新的模型计价可视化**：

- `2026-04-06` 官方发布 `Adaptive`
- `2026-04-06` 开始在模型选择器里展示 token 价格上下文
- `2026-04-07` 修复了 Adaptive 在首个请求后无法切换模型的 bug，并为受影响用户恢复了 quota / overage

这说明，如果你现在看 Windsurf，已经不能只按“固定选一个模型”的老理解来写，而要把 **Adaptive 路由** 和 **按 token 的 quota / extra usage** 一起理解。

### 2. 自助付费体系在 2026 年 3 月已经切到 quota，不再是老的 prompt credits 叙事

官方 `Quota-Based Usage` 页面明确写着：

- **2026 年 3 月**，Windsurf 把 self-serve 用户从 credit-based system 切到了 quota-based usage
- 现在是按 **daily + weekly allowance** 管理内含使用量
- 超出后按 **extra usage** 继续计费

但同时，官方 `Plans and Usage` 页面又写明：

- **Enterprise** 仍然沿用 credit-based usage

所以当前最准确的理解应该是：

- `Free / Pro / Max / Teams`：已经进入 quota 叙事
- `Enterprise`：文档仍按 credit 叙事说明

### 3. “当前模式”以 `Code / Plan / Ask` 为准，不建议继续沿用旧的 `Code / Chat` 说法

这一点是我这次深搜里最需要纠正的地方之一。

`Cascade Overview` 页仍写着 `Code / Chat`，但更具体、明显更新过的 `Cascade Modes` 页面已经写成：

- `Code`
- `Plan`
- `Ask`

再结合 `2026-01-30` Wave 14 changelog 里正式推出 `Plan Mode`，以及 `2026-02-12` changelog 继续补强 Plan Mode 自动切回 Code Mode，可以判断：

- **当前更准确的模式划分是 `Code / Plan / Ask`**
- 总览页里的 `Code / Chat` 更像是旧表述尚未完全刷新

所以后面文章里，我会统一按 `Code / Plan / Ask` 来讲，这也是更符合“最新官方状态”的写法。

### 4. Windsurf 官方文档已经把“项目定制体系”讲得非常完整了

截至 2026-04-14，Windsurf 在“长期上下文 / 项目规范 / 自动化工作流”这块，官方文档已经形成了一整套比较成熟的体系：

- `Memories`
- `Rules`
- `AGENTS.md`
- `Skills`
- `Workflows`
- `Hooks`

这也是 Windsurf 区别于“只会补全代码的 AI 插件”的核心之一。它不是只有一个聊天框，而是在认真做“项目级 AI 协作层”。

---

## 二、当前官方价格与套餐，应该怎么理解

### 1. 官方 pricing 页面当前展示的套餐价格

我核对到 `windsurf.com/pricing` 在 **2026-04-14** 页面上显示的当前方案是：

- `Free`：`$0/month`
- `Pro`：`$20/month`
- `Max`：`$200/month`
- `Teams`：`$40/user/month`
- `Enterprise`：`Let's talk`

页面还把比较项直接列了出来，包括：

- `Tab`
- `Previews`
- `Deploys`
- `All premium models`
- `Fast Context`
- `SWE-1.5 model`
- `Knowledge base`
- `SSO + Access control features`
- `RBAC`

如果主人之后还要写“Windsurf 值不值得买”，这页应该作为最新价格锚点，而不是继续拿 2025 年的 Flow Action Credits 或旧 prompt credits 表来讲。

### 2. 当前 quota 是怎么计的

官方 `Quota-Based Usage` 页对 self-serve 的说法可以总结成这样：

- 套餐内含的是每日和每周刷新的一组预算
- 预算消耗按 **模型 token 成本** 来计算
- 免费模型不消耗 quota
- 同样一句需求，带的上下文越大，token 越多，消耗越高

官方还给了几个非常实用的建议：

- 指令更精确，减少不必要上下文
- 例行任务优先用 `SWE-1.5` 这类免费模型
- 不要让会话无意义地变长
- 尽量在同类任务中持续使用同一个 frontier model，以利用缓存降低成本

这比老式“每次对话扣 1 个 credit”的理解更接近真实成本。

### 3. 当前 usage 页面和 quota 页面要一起看

`Plans and Usage` 页面主要负责说明：

- 你有哪些套餐
- 去哪里升级
- 去哪里看 usage
- 去哪里看 billing / invoice

`Quota-Based Usage` 页面主要负责说明：

- daily / weekly allowance 怎么算
- 超额后 extra usage 怎么算
- 2026 年 3 月迁移时旧用户怎么 grandfather

如果只看其中一页，容易漏掉信息。

### 4. 旧用户迁移这块，官方已经给了明确日期和口径

`Quota-Based Usage` 页写得很具体：

- 原 `Pro $15/mo` 用户继续 grandfather
- 原 `Teams $30/seat/mo` 用户继续 grandfather
- 所有现有付费订阅用户都获得了额外 7 天试用周
- Teams 新方案不再包含 `SSO`，而是转成 Enterprise-only

这类信息变化很快，所以文章里最好带明确日期，不要写成“最近变了”这种模糊表述。

---

## 三、安装、启动、迁移，官方现在到底支持到什么程度

### 1. 最低系统要求

根据 `Getting Started` 页面，当前最低要求是：

- macOS：`OS X Yosemite`
- Windows：`Windows 10`
- Ubuntu：`>= 20.04` 或 `glibc >= 2.31 / glibcxx >= 3.4.26`
- 其他 Linux：`glibc >= 2.28 / glibcxx >= 3.4.25`

这个细节很有用，因为很多同类文章只会写“支持 Mac / Win / Linux”，但不会写到 glibc 版本门槛。

### 2. 首次 onboarding 支持三种入口

官方写得很明确：

- `Start fresh`
- `Import from VS Code`
- `Import from Cursor`

并且在 onboarding 阶段还可以顺手做几件事：

- 选默认 VS Code 键位还是 Vim 键位
- 迁移 settings
- 迁移 extensions
- 安装 `windsurf` 到 PATH

对已经深度依赖 VS Code / Cursor 的用户来说，这就是 Windsurf 上手门槛低的关键原因之一。

### 3. 登录失败时，不是只能网页跳转

官方文档专门留了一套 `Having Trouble?` 流程：

1. 复制认证链接
2. 在浏览器打开
3. 手动复制 authentication code
4. 粘回 Windsurf

如果后续主人写排障文，这一段非常值得保留，因为很多“浏览器打不开回跳”的问题，靠这套兜底流程就能过。

### 4. 忘了导入 VS Code / Cursor 配置，也能后补

官方写明：

- onboarding 后仍可在命令面板中补做 `Import from VS Code`
- onboarding 后仍可在命令面板中补做 `Import from Cursor`

这意味着新手不需要担心“第一次选错就没法迁移”。

### 5. Windsurf Next 是官方的预发布通道

`Getting Started` 页还说明了 `Windsurf Next`：

- 属于 prerelease 版本
- 通常会先上新功能，再稍后进入 stable

如果主人以后要写“怎么第一时间试新功能”，这应该单独讲；但如果是主力开发环境，建议还是把 `stable` 和 `Next` 区分开来。

---

## 四、当前 Windsurf 的交互主轴，应该按什么方式理解

我更建议把 Windsurf 理解成四层：

1. `Tab`：减少停顿，负责你敲代码时的下一步建议
2. `Command`：当前文件内最快速的自然语言编辑
3. `Cascade`：跨文件、多步骤、可调用工具的 agent 层
4. `Context / Rules / Skills / Workflows / Hooks`：把项目经验沉淀下来

这样理解，会比把它当成“另一个带 AI 的 VS Code”更准确。

---

## 五、Tab：它现在已经不是简单补全，而是编辑意图引擎

### 1. 官方对 Tab 的当前定义

`Windsurf Tab` 页面当前把它描述为：

- AI-powered code suggestions
- `Tab to Jump`
- `Tab to Import`
- inline suggestions
- 由自研模型驱动

并强调它已经从传统 autocomplete 演进成：

- diff suggestion engine
- navigation engine

这意味着它的职责已经从“补一段文本”变成了“预判你下一步怎么编辑、跳哪里、补什么导入”。

### 2. Tab 当前依赖哪些上下文

官方列出的上下文来源包括：

- 当前代码
- 终端活动
- Cascade 聊天历史
- 编辑器里的最近操作
- 剪贴板内容

其中剪贴板默认不是一直开，而是需要在高级设置里 opt in。

### 3. `Tab to Jump` 为什么有辨识度

官方写法很清晰：

- 它会预测你下一个最可能落点
- 看到标签后按 `Tab`
- 光标直接跳过去继续工作

这比传统补全更像“导航协助”。

### 4. `Tab to Import` 解决的不是“不会写 import”，而是“少打断流”

它的价值在于：

- 你先在当前光标位置写逻辑
- 提示出现后按 `Tab`
- import 自动补到文件顶部
- 光标仍留在原地

这个细节非常符合 Windsurf 整体“keep you in the flow”的产品思路。

### 5. 当前可配置项

官方文档写到：

- Tab 有 `Autocomplete` 和 `Supercomplete` 两种模式
- 推荐使用 `Supercomplete`
- `Tab to Jump` 与 `Tab to Import` 可以分别开关

如果主人以后写“Windsurf 设置项”，Tab 是值得单独拆一篇的。

---

## 六、Command：当前文件内最划算的一层

### 1. 官方对 Command 的最新说法

`Command` 页当前最关键的三句话是：

- 快捷键：`Cmd/Ctrl + I`
- 用于当前文件内的自然语言生成与编辑
- **不消耗 premium credits**

这点和 Cascade 很不一样，意味着：

- 当前文件范围内的小修改
- 局部重写
- 函数重构
- 快速生成一段代码

这些事情，优先用 Command 往往更划算。

### 2. 选中与不选中的两种行为

官方说明：

- 先选中代码：对选中区域做编辑
- 不选中代码：在当前光标位置直接生成

这个交互很直观，但很多新手第一次用时并不清楚，所以在教程里要明确写。

### 3. Terminal 里也能用 Command

官方 `Command` 页和 `Terminal` 页都写了：

- 在终端里同样可以按 `Cmd/Ctrl + I`
- 用自然语言生成对应 CLI 语法

所以 Command 不只是编辑器里的改代码按钮，它还是“命令行自然语言转命令”的入口。

---

## 七、Cascade：最新官方理解，应该按 `Code / Plan / Ask` 来看

### 1. 为什么这部分一定要按最新页面纠正

`Cascade Overview` 页的总览文字还保留着 `Code / Chat` 说法。  
但 `Cascade Modes` 专页当前已经明确写成：

- `Code`
- `Plan`
- `Ask`

再结合 2026 年 1 月到 2 月的 changelog 更新，当前更可靠的理解是：

- **Code**：默认主模式，负责真正动手
- **Plan**：先拆方案，再实现
- **Ask**：只读问答与探索

如果文章还继续按 `Code / Chat` 去讲，严格说已经不是“最新官方说法”了。

### 2. Code Mode 现在能做什么

官方 `Modes` 页列得非常直白：

- 创建、编辑、删除文件
- 运行终端命令
- 搜索和分析代码库
- 安装依赖
- 自主执行多步骤任务

而且官方明确建议：

- 大多数任务把 `Code Mode` 当默认模式

### 3. Plan Mode 是 Windsurf 现在很值得重视的点

`Plan Mode` 页和 changelog 一起看，会发现这不是“做个提纲”那么简单。

官方描述它会：

- 先探索代码库理解现状
- 主动问澄清问题
- 给出多个方案供你选择
- 把计划写到外部 Markdown 文件
- 支持点击 `Implement` 后自动切回 Code Mode

计划文件默认存放在：

- `~/.windsurf/plans`

并且还能通过 `@mentions` 再次引用。

这意味着 Plan Mode 的价值不只是“先想再做”，而是把计划本身变成一个可复用、可跨会话恢复的中间产物。

### 4. Ask Mode 的价值是边界清晰

官方写得很明确：

- Ask Mode 是只读
- 可搜索和分析代码库
- 不能做修改

这很适合：

- 看陌生仓库
- 先理解结构
- 先问设计问题
- 先做风险评估

对团队来说，Ask Mode 也天然更安全。

### 5. Cascade 本身还有哪些核心能力

综合 `Cascade Overview` 页，当前值得重点记住的包括：

- `Todo list` 规划与持续更新
- `Queued Messages` 排队消息
- 每次提示最多 `20` 次工具调用
- `Auto-Continue`
- 语音输入
- `Named Checkpoints`
- `Revert`
- 实时感知你刚刚的动作
- `Send to Cascade`
- `Explain and Fix`
- 多个 Cascade 同时运行

这些能力拼起来，才构成了 Windsurf 的 agent 体验。

### 6. `Queued Messages` 很像“给正在干活的代理继续排单”

官方说明是：

- Cascade 正在忙时，你可以继续输入下一条消息
- 它会按顺序排队执行

这个设计解决的是一个高频痛点：  
代理还没做完，你已经想到下一步了，不必等它结束再重新组织一遍上下文。

### 7. `Checkpoints` 和 `Revert` 是真实生产环境里很重要的保险丝

官方写到：

- 可以从原始 prompt 上直接回退
- 也可以创建命名 checkpoint
- 目前 revert 是不可逆的

这意味着：

- 它很强
- 但不能把它当“随便撤销”的玩具

### 8. 多个 Cascade 并行时，要认真考虑 Worktrees

官方总览页写得很坦诚：

- 多个 Cascade 可同时运行
- 如果同时改同一文件，可能 race
- 如果涉及相近文件，建议改用 `Worktrees`

这也是 Windsurf 在并行 agent 上比很多产品更成熟的一点：它不只是允许并行，还提供了隔离路径。

---

## 八、Arena Mode + Worktrees：这是 2026 年当前版本里非常新的高级玩法

### 1. Arena Mode 现在已经是正式文档能力

根据官方 `Arena Mode` 文档和 `2026-01-30` Wave 14 changelog：

- 你可以在 model picker 里进入 Arena
- 让多个模型对同一任务并行作答
- 每个模型各自独立运行一个 Cascade 会话
- 每个会话配一棵独立 worktree

这个设计很有 Windsurf 风格，因为它不是停留在“比较两段文本回复”，而是直接比较两个真实 agent 的执行结果。

### 2. 什么时候该用 Arena

官方给的适用场景很准确：

- 对比不同模型的代码质量
- 探索同一个难题的不同做法
- 想试新模型，但又不想放弃原来的常用模型
- 用 battle groups 低成本比较模型表现

### 3. Arena 的代价也很明确

官方写得很清楚：

- 每个模型按各自成本单独计费
- 两个模型一起跑，就是把成本相加

所以 Arena 很适合难题、分歧题、探索题，不适合日常每个小需求都开。

### 4. Worktrees 的当前规则

`Worktrees` 文档写到：

- worktree 模式要在会话开始前选
- 会话开始后不能迁移到别的 worktree
- 修改完成后可以 `merge` 回主工作区
- 默认只复制 Git 跟踪文件
- `.env` 等未跟踪内容不会自动带过去

worktree 的本地位置是：

- `~/.windsurf/worktrees/<repo_name>`

每个工作区最多保留：

- `20` 个 worktree

而且还支持 `post_setup_worktree` hook 自动补 `.env`、安装依赖等。

这套设计特别适合：

- 多代理并行
- 大改动隔离试验
- 模型对比实验

---

## 九、Context Awareness：Windsurf 真正拉开差距的地方

### 1. 它不是“知道代码语法”，而是“持续构建项目上下文”

官方 `Context Awareness Overview` 页明确写：

- 基于 `RAG`
- 会索引整个本地代码库
- 会从相关位置取回片段
- 目标是减少 hallucinations、提高 suggestion 质量

默认上下文源包括：

- 当前文件
- 已打开文件
- 本地整个代码库

并且按套餐继续扩展：

- `Pro`：更长上下文、更高索引与 pinned context 上限
- `Teams / Enterprise`：可以索引 remote repositories

### 2. Fast Context 是现在值得单独记住的新能力

官方 `Fast Context` 页把它定义成一个 specialized subagent，并给出几个关键指标：

- 最多可比传统 agent 搜索快 `20x`
- 使用 `SWE-grep` 与 `SWE-grep-mini`
- 每轮最多 `8` 个并行工具调用
- 最多 `4` 轮
- 使用受限工具集：`grep / read / glob`

这实际上是在告诉你：

- Windsurf 不希望主模型自己慢慢翻整仓库
- 而是先让专门的检索子系统把相关代码找准，再把主模型算力留给真正的推理和改动

这也是为什么它在大仓库里更强调“搜索速度 + 上下文洁净度”。

### 3. Knowledge Base 不是个人功能，而是团队能力

官方写明：

- `Knowledge Base (Beta)` 仅限 `Teams / Enterprise`
- 当前只支持 `Google Docs`
- 最多 `50` 份文档
- 由管理员通过 OAuth 接入

而且文档特别提醒：

- 一旦管理员把某份文档放给团队，它不再受 Google Drive 侧的个人访问控制约束

这在企业内是很重要的安全边界，文章里最好明确标出来。

### 4. pin context 不是越多越好

官方明确提醒：

- pin 太多内容会拖慢或影响模型表现

它给出的更好策略是 pin：

- 模块定义文件
- 内部框架示例目录
- 当前任务真正依赖的接口或模板
- 当前工作区的最低公共目录

这套建议其实很实用，因为很多人第一次用 AI IDE，最容易犯的就是“把半个仓库全 pin 进去”。

### 5. `.codeiumignore` 与索引资源消耗

官方 `Windsurf Ignore` 页还给了一些容易被忽略，但很关键的信息：

- 默认会忽略 `gitignore`
- 默认忽略 `node_modules`
- 默认忽略隐藏路径
- 被忽略文件不会被索引，也不计入索引文件数
- `.gitignore` 中的文件 Cascade 也不能编辑

资源方面，官方写的是：

- 首次索引通常 `5-10` 分钟
- 大约 `5000` 文件需要约 `300MB` RAM
- 如果机器大概只有 `10GB` RAM，`Max Workspace Size` 建议别高过 `10000`

这类细节非常适合写进“性能优化和排障”类文章。

---

## 十、Memories、Rules、AGENTS.md、Skills、Workflows：当前官方分工已经很清晰

### 1. 官方自己给了选择表

`Memories & Rules` 页面已经很直接地给出了一张“什么时候用哪个”的选择表。按我的中文化理解可以归纳为：

- `Memories`：AI 自动沉淀的本机经验
- `Rules`：人为定义的长期行为约束
- `AGENTS.md`：基于目录位置自动生效的规则
- `Skills`：带资源文件的复杂能力包
- `Workflows`：你手动触发的流程模板

### 2. Memories 当前的真实边界

官方写得很明确：

- 与 workspace 绑定
- 只保存在本机
- 路径在 `~/.codeium/windsurf/memories/`
- 不会提交进仓库
- 不同 workspace 之间不互通
- 创建和使用自动记忆不消耗 credits

这意味着：

- 适合记“当前仓库里的一些经验”
- 不适合承载团队长期规范

如果主人想让团队都能稳定复用，官方建议是：

- 写成 `.windsurf/rules/`
- 或写进仓库里的 `AGENTS.md`

### 3. Rules 的当前存储位置和限制

官方文档写到：

- 全局规则：`~/.codeium/windsurf/memories/global_rules.md`
- 工作区规则：`.windsurf/rules/*.md`
- Enterprise 系统级规则：OS 特定目录

并且限制也写得很清楚：

- 全局规则文件：`6000` 字符上限
- 每个工作区规则文件：`12000` 字符上限

### 4. Rules 的四种激活方式，是 Windsurf 很强的一点

工作区规则通过 frontmatter 的 `trigger` 声明激活方式，官方给出的四种模式是：

- `always_on`
- `model_decision`
- `glob`
- `manual`

它们分别解决不同问题：

- `always_on`：全局长期硬约束
- `model_decision`：只把 description 常驻，让模型自己按需拉全文
- `glob`：触碰特定文件模式时再生效
- `manual`：你用 `@rule-name` 时才生效

这比很多产品单一的“全局 system prompt”细很多，也更省上下文。

### 5. AGENTS.md 的当前机制，已经完全官方化了

`AGENTS.md` 页面给出的最新机制是：

- 根目录 `AGENTS.md`：当成 always-on 规则
- 子目录 `AGENTS.md`：自动变成 `<directory>/**` 的 glob 规则
- 同时识别 `AGENTS.md` 和 `agents.md`
- 会向上搜索到 git root

这一点很重要，因为它意味着：

- Windsurf 不是“顺便兼容一下 AGENTS.md”
- 而是已经把它正式纳入 Rules engine

对我们这种已经习惯在仓库里写 `AGENTS.md` 的工作流，这几乎是零学习成本。

### 6. Skills 在 2026 年 3 月有过一次很关键的补强

当前 `Skills` 文档写到：

- 工作区技能路径：`.windsurf/skills/<skill-name>/`
- 全局技能路径：`~/.codeium/windsurf/skills/<skill-name>/`
- 还兼容 `.agents/skills/`
- 如果启用了 Claude Code config reading，也会扫描 `.claude/skills/`

同时，`2026-03-09` changelog 专门写了一条：

- 新增从 `.windsurf/skills/` 加载 `SKILL.md`

这说明 Skill 体系并不是“讲了很久但没完全落地”，而是在最近几个月还在持续补齐。

### 7. Skills 和 Workflows 的根本差别

官方的区分非常值得记住：

- `Skills`：模型可自动决定调用，也可手动 `@mention`
- `Workflows`：只会通过 `/workflow-name` 手动触发

所以经验法则是：

- 要自动捡起来的复杂流程，用 `Skill`
- 你每次都想手动显式启动的 runbook，用 `Workflow`

### 8. Workflow 当前的路径与优先级

官方 `Workflows` 页写到：

- 工作区：`.windsurf/workflows/*.md`
- 全局：`~/.codeium/windsurf/global_workflows/*.md`
- 内置：Windsurf 自带，例如 `/plan`
- 系统级：Enterprise OS 特定目录

当前优先级是：

1. System
2. Workspace
3. Global
4. Built-in

而且同名时高优先级覆盖低优先级。

---

## 十一、MCP：Windsurf 现在已经做得比较完整，但边界也非常明确

### 1. 当前支持三种传输方式

官方 `MCP` 文档写到，Windsurf 目前支持：

- `stdio`
- `Streamable HTTP`
- `SSE`

并支持：

- OAuth

这说明它并不是只支持本地命令型 MCP，而是已经能覆盖本地与远程两种主流接法。

### 2. 当前接入 MCP 的两条路

官方给出的路径是：

- 从 `MCP Marketplace` 安装
- 手动编辑 `mcp_config.json`

其中用户级配置文件在：

- `~/.codeium/windsurf/mcp_config.json`

### 3. 当前工具总量上限

官方明确写了一个非常关键的数字：

- Cascade 同时可访问的工具总量上限是 `100`

这就意味着：

- MCP 不是装得越多越好
- 真正合理的方式，是围绕工作流只打开需要的工具

### 4. 远程 HTTP MCP 的写法和本地不一样

官方单独提醒了：

- 远程 HTTP MCP 需要 `serverUrl` 或 `url`

这和本地 `command + args` 的 stdio 接法不同，教程里最好别混着写。

### 5. 当前已经支持变量插值，避免明文写密钥

`mcp_config.json` 支持：

- `${env:VAR_NAME}`
- `${file:/path/to/file}`

而且适用字段包括：

- `command`
- `args`
- `env`
- `serverUrl`
- `url`
- `headers`

这意味着你完全没必要把 token 硬编码进 JSON。

### 6. Teams / Enterprise 的 MCP 治理已经非常重

官方文档已经把这一层做得很细了，包括：

- 团队级开关
- whitelist
- custom registries
- regex 匹配
- 一旦 whitelist 任意一个 server，其余未白名单的全部阻断

这说明 Windsurf 已经把 MCP 当成“企业治理能力”，不是简单插件市场。

---

## 十二、Terminal：真正重要的是执行权限模型，而不只是“能不能跑命令”

### 1. Terminal 当前的四档自动执行等级

官方 `Terminal` 页面写得非常清楚：

- `Disabled`
- `Allowlist Only`
- `Auto`
- `Turbo`

它们的区别不是 UI 风格，而是 Cascade 在运行命令前需要多少人工确认。

### 2. `Auto` 并不等于无脑放行

官方说明：

- Auto 模式下，Cascade 会自己判断安全性
- 仍然会把潜在风险命令拦出来等你批准
- 这个特性只对 premium models 的消息可用

所以 Auto 更像“风险分级放行”，不是完全全自动。

### 3. `Turbo` 才是真正的高风险高速档

官方写的是：

- 除 deny list 外，其余命令都立即自动执行

这个模式当然很爽，但团队环境里一般更适合作为有边界的高级选项，而不是默认设置。

### 4. Team / Enterprise 已经能控到组织级别

官方写到管理员可以设置：

- 团队允许的最高 auto-execution 级别
- 团队级 allowlist / denylist

并且：

- team 与 user 列表会合并
- denylist 永远优先于 allowlist

这套逻辑很适合写进企业落地文章里。

### 5. macOS 当前有 Dedicated Terminal

官方 `Terminal` 页明确写：

- 从 `Wave 13` 开始
- macOS 上为 Cascade 引入 dedicated terminal
- 这个 terminal 总是用 `zsh`

如果用户平时不用 zsh，官方建议把共用环境变量抽到两个 shell 都能 source 的共享配置文件里。

这类“看起来是小细节，实际会踩坑”的地方，恰恰最值得写。

---

## 十三、Web Search、Docs Search、Previews、App Deploys：Windsurf 已经把“查资料 + 看页面 + 分享结果”串起来了

### 1. Web and Docs Search 的当前入口

官方说明可以通过几种方式触发：

- 提一个明显需要联网的问题
- 使用 `@web`
- 使用 `@docs`
- 直接贴 URL

并且它特别说明：

- admin 的 Enable Web Search 只控制开放互联网搜索
- 不影响读取具体 URL
- 读取页面发生在用户设备本地网络环境里

这个区分很关键，因为它解释了为什么“关了开放搜索，不代表完全不能读网页”。

### 2. Previews 的核心价值，是让 Cascade 直接“看见前端页面”

官方 `Previews` 页写到：

- 可在 IDE 或浏览器里本地预览
- 对 Chrome / Arc / Chromium 体验最佳
- 可以把元素直接作为 `@mention` 送回 Cascade
- 可以把 console errors 发回 Cascade

这比“给 AI 截图”更自然，因为它直接把 DOM 元素和报错串进当前 agent 上下文。

### 3. App Deploys 当前仍是 Beta，而且主要定位 preview

官方 `App Deploys` 页非常明确：

- 当前 provider 只有 `Netlify`
- 这是 beta
- 主要用于 preview purposes
- 代码会被上传到官方服务器再部署

如果是带敏感数据的生产应用，官方建议：

- 尽快 claim 到自己的 provider account
- 按正式安全最佳实践处理

### 4. App Deploys 当前支持的主流前端栈

官方列举了：

- Next.js
- React
- Vue
- Svelte
- 静态 HTML/CSS/JS

### 5. 当前 deploy 限制也写得很具体

文档给出：

- Free：每天 `1` 次部署，最多 `1` 个未认领站点
- Pro：每天 `10` 次部署，最多 `5` 个未认领站点

这些是非常典型的“最新易变信息”，应该优先以官方页面当天数据为准。

### 6. App Deploys 页面目前有一处官方命名不一致，写文章时不能忽略

这是我这次深搜里发现的第二个重要“最新文档细节”。

同一页里：

- `Project Configuration` 小节写的是 `windsurf_deployment.yaml`
- 后面的 Troubleshooting 小节又写到删除 `windsurf_config.yaml`

这说明官方页面当前存在文件名表述不一致。

更稳妥的写法应该是：

- 以 Windsurf 实际在你项目根目录里生成的文件名为准
- 如果目的是强制新建部署配置，就删除当前真实存在的那个部署配置文件

而不是在文章里武断只写其中一个名字。

---

## 十四、Hooks：这是当前官方体系里最强也最需要敬畏的一层

### 1. Hooks 的定位不是“脚本糖衣”，而是治理接口

官方中文文档第一页就写得很清楚：

- 用于日志
- 用于安全控制
- 用于验证
- 用于企业级治理

这意味着 Hooks 不是“顺手自动化一下”的级别，而是可以真正影响 agent 行为边界的能力。

### 2. 当前 hooks 会从三个层级合并

官方当前支持：

- 系统级
- 用户级
- 工作区级

并按这个顺序执行：

- `system -> user -> workspace`

对应路径分别是：

- 系统级：OS 特定路径
- 用户级：`~/.codeium/windsurf/hooks.json`
- 工作区级：`.windsurf/hooks.json`

### 3. 当前一共有 12 类 hook 事件

官方文档列出的 12 个事件包括：

- `pre_read_code`
- `post_read_code`
- `pre_write_code`
- `post_write_code`
- `pre_run_command`
- `post_run_command`
- `pre_mcp_tool_use`
- `post_mcp_tool_use`
- `pre_user_prompt`
- `post_cascade_response`
- `post_cascade_response_with_transcript`
- `post_setup_worktree`

从这里就能看出 Windsurf 已经把 Hook 深度插到了 agent 工作流的各个关键节点。

### 4. `exit code 2` 是真正的阻断信号

官方写得非常明确：

- 对预钩子来说，退出码 `2` 会阻止该操作

所以你可以用它来：

- 阻止读敏感文件
- 阻止危险命令
- 阻止违反策略的 prompt
- 阻止危险 MCP 操作

### 5. `post_cascade_response_with_transcript` 很强，也很敏感

官方文档说明：

- 它会把完整 transcript 写到 `~/.windsurf/transcripts/`
- 可能包含文件内容、命令输出、会话历史等敏感信息

这对审计、分析很有价值，但如果团队启用它，一定要同步写明数据保留与权限策略。

### 6. Hooks 非常适合和 Worktrees 联动

官方文档直接给了 `post_setup_worktree` 示例：

- 自动拷贝 `.env`
- 自动安装依赖
- 用 `$ROOT_WORKSPACE_PATH` 指向原始仓库

如果一个团队已经在用 Arena 或多 Cascade 并行，这几乎是必学内容。

---

## 十五、我会怎样建议新手按“当前最新版”来学 Windsurf

如果按照 2026-04-14 的官方状态，我会建议按这个顺序学：

1. 先装 stable 版，不急着上 `Windsurf Next`
2. onboarding 时导入 VS Code / Cursor 配置
3. 先把 `Tab` 和 `Command` 用顺
4. 再用 `Cascade Code Mode` 做真实改动
5. 遇到复杂需求时切 `Plan Mode`
6. 仓库稳定后开始写 `AGENTS.md`
7. 再补 `.windsurf/rules/`
8. 复杂流程再做 `Skills` 和 `Workflows`
9. 需要外部工具时接 `MCP`
10. 团队治理阶段再上 `Hooks`
11. 前端项目最后再吃透 `Previews` 和 `App Deploys`

这样会比一上来就研究全部功能轻松很多。

---

## 十六、我的最终判断

如果只用一句话概括当前版本的 Windsurf：

**它已经不是“一个带 AI 的编辑器”，而是在往“以 IDE 为核心的工程化 agent 平台”走。**

它的最新官方状态最值得关注的，不只是某个模型上新，而是这几条线已经逐渐接起来了：

- 交互层：`Tab / Command / Cascade`
- 规划层：`Plan Mode / Todo / Checkpoints`
- 上下文层：`RAG / Fast Context / Knowledge Base / .codeiumignore`
- 约束层：`Rules / AGENTS.md / Skills / Workflows`
- 执行层：`Terminal / MCP / Hooks / Worktrees`
- 结果层：`Previews / App Deploys`
- 计费层：`Adaptive / quota / extra usage / pricing context`

如果主人后面还要继续扩这个专题，我建议下一篇最值得单独拆的是这几个方向：

- 第三篇：Windsurf `Code / Plan / Ask` 三种模式到底怎么分工
- 第四篇：Windsurf `Rules / AGENTS.md / Skills / Workflows` 项目治理实战
- 第五篇：Windsurf `MCP / Hooks / Terminal / Worktrees` 自动化与安全边界
- 第六篇：Windsurf `Adaptive / Models / Quota / Extra Usage` 最新计费体系全解

## 资料来源

- Windsurf Getting Started：https://docs.windsurf.com/windsurf/getting-started
- Windsurf Models：https://docs.windsurf.com/windsurf/models
- Windsurf Cascade Overview：https://docs.windsurf.com/windsurf/cascade
- Windsurf Cascade Modes：https://docs.windsurf.com/windsurf/cascade/modes
- Windsurf Arena Mode：https://docs.windsurf.com/windsurf/cascade/arena
- Windsurf Memories & Rules：https://docs.windsurf.com/windsurf/cascade/memories
- Windsurf AGENTS.md：https://docs.windsurf.com/windsurf/cascade/agents-md
- Windsurf Skills：https://docs.windsurf.com/windsurf/cascade/skills
- Windsurf Workflows：https://docs.windsurf.com/windsurf/cascade/workflows
- Windsurf Worktrees：https://docs.windsurf.com/windsurf/cascade/worktrees
- Windsurf MCP：https://docs.windsurf.com/windsurf/cascade/mcp
- Windsurf Hooks：https://docs.windsurf.com/zh/windsurf/cascade/hooks
- Windsurf Terminal：https://docs.windsurf.com/windsurf/terminal
- Windsurf Web and Docs Search：https://docs.windsurf.com/windsurf/cascade/web-search
- Windsurf Previews：https://docs.windsurf.com/windsurf/previews
- Windsurf App Deploys：https://docs.windsurf.com/windsurf/cascade/app-deploys
- Context Awareness Overview：https://docs.windsurf.com/context-awareness/overview
- Fast Context：https://docs.windsurf.com/context-awareness/fast-context
- Windsurf Ignore：https://docs.windsurf.com/context-awareness/windsurf-ignore
- Plans and Usage：https://docs.windsurf.com/windsurf/accounts/usage
- Quota-Based Usage：https://docs.windsurf.com/windsurf/accounts/quota
- Pricing：https://windsurf.com/pricing
- Official Changelog：https://windsurf.com/changelog
