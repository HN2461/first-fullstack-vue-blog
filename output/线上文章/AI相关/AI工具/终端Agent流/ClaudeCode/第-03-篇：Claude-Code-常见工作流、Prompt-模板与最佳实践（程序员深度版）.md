---
title: "第 03 篇：Claude Code 常见工作流、Prompt 模板与最佳实践（程序员深度版）"
slug: "ai-agent-claudecode-claudecode-8b6661f9"
summary: "按 2026-10-12 Claude Code 2.1.296 官方 Common Workflows、Best Practices、Agent View、Sub-agents、Agent Teams、Workflows、Headless 与 Changelog 更新，覆盖陌生仓库、修 bug、重构、测试、文档、PR、并行任务、长会话和无人值守脚本。"
category: "ClaudeCode"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "ClaudeCode"
tags:
  - "Claude Code"
  - "工作流"
  - "Prompt 模板"
  - "Debug"
  - "Refactor"
  - "Verify"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf22"
originalSlug: "ai-agent-claudecode-claudecode-8b6661f9"
originalStatus: "published"
publishedAt: "2026-05-30T08:58:26.838Z"
updatedAt: "2026-10-12T15:13:40.092Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 03 篇：Claude Code 常见工作流、Prompt 模板与最佳实践（程序员深度版）

> 好的 Claude Code 工作流不是“让模型一次写完”，而是把目标、范围、证据和批准点设计清楚。本文以当前 `2.1.296` 的 CLI、交互模式、Workflows 和并行能力为基线，给出能直接复制的程序员工作流。

[[toc]]

---

## 先给一条主线

```text
定位目标 → 只读研究 → 明确计划 → 小步实施 → 运行验证 → 检查 diff → 记录剩余风险
```

这条主线可以映射到 Claude Code 的入口：

| 阶段 | 推荐入口 |
| --- | --- |
| 定位和只读研究 | 普通提示、`plan` 模式、Explore subagent、`/deep-research` |
| 计划 | `/plan`、`claude --permission-mode plan` |
| 小步实施 | `default` / `acceptEdits`，明确文件范围 |
| 并行 | `/subtask`、`/fork`、Agent Teams、`/batch` |
| 验证 | `/run`、`/verify`、项目测试、构建和真实启动 |
| 长会话维护 | `/compact`、`/context`、`/goal`、`/resume` |
| 交付 | `/diff`、`/code-review`、`gh pr create` 或平台集成 |

---

## 1. 接任务前先决定四件事

每次输入前先写清：

1. **结果**：最终要看到什么文件、行为或报告。
2. **范围**：允许读取、修改和运行哪些目录/命令。
3. **约束**：兼容性、编码、性能、权限、不能改的接口。
4. **证据**：什么测试、构建、截图、日志或 diff 才算完成。

模糊输入：

```text
帮我优化这个项目。
```

可执行输入：

```text
目标：把登录接口的超时从偶发 30 秒降低到 3 秒以内。
范围：只检查 backend/src/auth 和相关测试，不改数据库 schema。
约束：保持现有错误响应格式，使用项目现有日志工具。
步骤：先只读定位和给计划，批准后再修改。
完成证据：运行 auth 测试、构建后端，展示关键 diff 和仍未覆盖的风险。
```

---

## 2. 第一次读陌生仓库

### 2.1 最小可用 prompt

```text
请只读检查当前仓库：
1. 说明技术栈和启动入口；
2. 列出主要目录及职责；
3. 找出认证、数据访问、前端路由和测试入口；
4. 读取 package.json/构建脚本，给出正确的安装、开发、测试、构建命令；
5. 输出你不确定的地方。
不要修改文件，不要安装依赖，不要启动长期服务。
```

### 2.2 大仓库的分层探索

先让主会话看目录和入口，再把局部问题交给 Explore subagent：

```text
先找出所有处理“订单取消”的文件、接口、数据库模型和测试。只读，返回文件路径、调用链和关键风险，不要修改文件。
```

如果研究会产生大量日志，用 subagent 或 `/subtask` 隔离上下文；如果要跨很多文件做重复审计，可使用 `/batch`，让它先拆分并等待计划批准。

### 2.3 用 Code Intelligence 而不是盲目全文搜索

当前 Claude Code 可以通过语言服务器提供符号级跳转、引用和实时诊断。类型语言的大仓库优先安装对应 code intelligence plugin；纯文本搜索仍然适合配置、模板、日志和跨语言目录。不要为了“看起来高级”给所有项目安装一堆插件，先确认它能减少读取量和误报。

---

## 3. 修 bug：先复现，再修改

### 3.1 稳定模板

```text
请修复这个 bug。

现象：<完整错误或错误截图的文字转录>
复现：<命令、输入、预期、实际>
范围：<允许改动的目录>
约束：保持公共接口和现有数据格式不变。
步骤：
1. 先读取相关实现和测试，确认根因；
2. 给出最小修复计划，不要立即修改；
3. 我批准后实现；
4. 增加能失败于旧行为的回归测试；
5. 运行最小测试，再运行受影响模块的完整测试；
6. 展示 diff、测试输出和未验证风险。
```

### 3.2 已有日志时不要只贴最后一行

把命令、退出码、堆栈、环境（Node/Python/数据库版本）、第一次出现时间和最近一次改动一起提供。让 Claude 区分：

- 真正根因与连锁错误。
- 代码问题与环境/依赖问题。
- 必现与偶发。
- 可以自动修复与需要人工确认的外部状态。

### 3.3 让它验证修复而不是“解释修复”

```text
不要只说明为什么修复看起来正确。请实际运行 `npm test -- --run auth`，再运行一次原始复现命令；如果环境不足，明确列出缺失条件和未执行的命令。
```

`/verify` bundled skill 会引导 Claude 构建、启动并观察应用；它和“只跑单元测试”不同，适合前端交互、路由、编译产物或服务启动问题。

---

## 4. 重构：用 plan、边界和可回退步骤

重构最容易失控，建议先进入计划模式：

```bash
claude --permission-mode plan
```

Prompt：

```text
请把 `src/services/legacyUserService.ts` 拆成数据访问、业务规则和序列化三个职责。
先只读分析：列出所有调用方、公共导出、测试、循环依赖和行为风险。
给出分 3 个可回退步骤的计划，每一步都包含受影响文件和验证命令。
保持导出的函数签名和错误码不变，不要顺手升级依赖。
```

批准后按步骤推进，每一步都检查：

- 公共 API 和序列化格式是否保持。
- 旧测试是否继续覆盖真实行为。
- 新增抽象是否被多个调用方复用。
- 是否出现“为了降行数而拆文件”的无意义结构。

需要对很多近似文件执行同一迁移时，`/batch migrate ...` 会先研究、拆成 5～30 个独立单元、等待计划批准，然后在隔离 worktree 中并行执行；没有 Git 仓库或 WorktreeCreate hook 时要先解决隔离条件。

---

## 5. 补测试：要求覆盖行为和边界

```text
请为 `NotificationsService` 补测试：
- 先阅读实现、现有测试和项目测试约定；
- 列出未覆盖的分支和边界；
- 只新增有行为断言的测试，不写重复实现的测试；
- 覆盖成功、超时、空数据、重复调用、权限失败和下游异常；
- 先运行新增测试，再运行受影响测试集；
- 如果无法稳定构造某个边界，说明原因，不要伪造测试通过。
```

让 Claude 解释“为什么这条测试能在旧代码上失败”比单纯要求“加几个测试”更能避免样板。

---

## 6. 文档、README 和笔记

### 6.1 先确认读者和证据

```text
请把这份 README 改成面向第一次部署的开发者文档。
读者：熟悉 Node.js，但不了解本仓库。
必须包含：系统要求、安装、环境变量（只能列变量名和示例占位符）、开发、测试、构建、部署、排障。
所有命令先从 package.json 和脚本中核验，不要猜。
保留现有有效说明，删除已经不存在的命令，并在结尾列出你无法验证的步骤。
```

文章型内容要把“事实、经验、推测”分开；如果资料来自外部网站，记录 URL、访问日期和版本，不要用旧截图证明当前行为。

### 6.2 修改文档前先做链接和版本检查

要求 Claude 搜索官方 changelog、当前命令参考和项目实际脚本，再改文案。涉及 CLI、配置、SDK 或服务时，优先查询官方一手资料，第三方资料只用于补充部署经验。

---

## 7. PR、Diff 和安全审查

本地改动完成后按顺序执行：

```text
/diff
/code-review medium
/security-review
```

`/code-review` 当前支持 `low|medium|high|xhigh|max|ultra`，可加 `--fix`、`--comment` 和目标 PR/分支/路径。`ultra` 是云端深度审查，需对应账号能力。`/simplify` 主要找重复、复杂度和抽象层级问题，不代替正确性审查。

Prompt 例子：

```text
请只审查当前分支相对 origin/main 的差异。
重点：认证绕过、越权、注入、敏感数据泄露、并发竞态和回滚风险。
每条发现给出严重性、文件/行号、触发条件和修复建议，不要因为风格偏好制造低价值问题。
不要修改文件。
```

高风险动作（生产部署、迁移、强制推送、批量删除、把秘密发送到外部系统）应在人工批准点执行，即使当前处于 `auto` 或后台会话。

---

## 8. 并行、worktree、subagent、agent team 怎么选

| 场景 | 推荐方式 | 原因 |
| --- | --- | --- |
| 小型研究或单文件定位 | 主会话 | 上下文简单，沟通成本最低 |
| 研究会产生大量日志 | `/subtask` 或 Explore subagent | 只把摘要回传主会话 |
| 需要保留当前方向、尝试另一条方案 | `/branch` | 分支会话可随时 `/resume` |
| 同一个仓库的独立改动 | `/fork` + worktree | 避免并行写同一工作树 |
| 多个角色互相沟通 | Agent Team | lead 与 teammate 可消息协作 |
| 大量重复单元、可暂停/恢复 | Workflow 或 `/batch` | 脚本协调并行、结果汇总 |
| 单个长命令 | `Ctrl+B` 或 `/background` | 让终端继续接受提示 |

`/fork` 是复制会话到后台；`/subtask` 是结果回传主会话的 forked subagent。二者都不是 Git 分支本身。`claude --worktree feature-name` 才是创建隔离 Git worktree 的 CLI 入口。

Agent Team 的默认显示为 in-process；tmux/iTerm2 分屏不支持 Windows Terminal、VS Code 集成终端。不要因为终端上出现多个窗口就以为它们已经共享任务状态，先检查 `/list-agents`、任务清单和消息。

---

## 9. 长会话和上下文管理

### `/compact`

适合目标不变、上下文太长的会话：

```text
/compact 保留当前修复目标、已确认的根因、已运行的测试和未解决风险
```

### `/context`

查看规则、Skill、MCP、工具输出和对话占用；如果某个扩展消耗异常，先停用或改为 subagent。

### `/goal`

目标可以让 Claude 跨多个 turn 继续工作：

```text
/goal 直到 auth 回归测试通过并且 git diff 只包含本次修复
```

长时间目标必须给停止条件、预算和安全边界；不要用 `/goal` 代替人工批准生产动作。

### `/resume`、`/clear`、`/rewind`

- `/resume`：恢复一个仍有上下文的会话。
- `/clear`：开启空上下文的新会话，可给旧会话命名。
- `/rewind`：回到对话或代码检查点，适合撤回本轮误改。
- `/branch`：从当前消息分出另一条对话方向。

---

## 10. 计划、权限和验证的最小组合

| 任务风险 | 模式 | 验证 |
| --- | --- | --- |
| 只读分析 | `plan` 或 `default` | 文件路径、调用链、无 diff |
| 小功能 | `default` / `acceptEdits` | 单测 + diff |
| 跨模块重构 | `plan` → 手动批准 | 分步测试 + 构建 |
| 批量迁移 | `/batch` | 每个 worktree 测试 + 汇总审查 |
| 线上修复 | `plan` + 人工执行部署 | 回归、监控、回滚方案 |
| 无人值守 CI | `-p` + `--permission-prompt-tool` 或 `--permission-prompts none` | 结构化输出、退出码、预算 |

Headless 示例：

```bash
git diff --name-only origin/main...HEAD \
  | claude -p --output-format json \
  "只审查这些文件的安全风险，返回 findings 数组和 summary。"
```

需要严格 JSON 时使用 `--json-schema`；需要跟踪 subagent 和 hook 事件时使用 `--output-format stream-json --verbose` 与对应的 `--include-hook-events`、`--forward-subagent-text`。

---

## 11. 任务模板收藏

### 模板一：研究但不修改

```text
只读研究 <目标>。请先列出搜索范围、已读取文件、证据和不确定性。
禁止写文件、安装依赖、提交、推送和调用外部副作用工具。
最后给出最小建议和下一步验证命令。
```

### 模板二：计划后实施

```text
目标：<结果>
范围：<目录/文件>
约束：<兼容性、编码、安全、性能>
先进入 plan，列出步骤、风险、回滚点和验证命令。
等待我批准后再修改；实施后展示 diff 和实际验证结果。
```

### 模板三：严格限制改动

```text
只允许修改：<文件列表>。
不要重命名、移动、格式化无关文件，不要升级依赖，不要修改生成物。
如果必须扩大范围，先停止并说明原因。
```

### 模板四：修复并证明

```text
先复现旧行为，保存失败证据；实现最小修复；补一个会在旧实现失败的回归测试；
运行最小测试、完整受影响测试和构建；最后列出仍未覆盖的环境差异。
```

### 模板五：文档更新

```text
请搜索官方文档、当前版本发布说明和至少一个可靠的第三方实现资料。
逐条标记旧内容、当前事实、版本门槛和来源 URL；然后更新正文。
不要把未核实的推测写成稳定 API。
```

### 模板六：要求承认不确定性

```text
每个结论都标记为“已从代码/命令验证”“来自官方文档”或“推测”。
无法执行的命令不要声称已执行；如果资料之间冲突，保留冲突并说明采用哪一份及原因。
```

---

## 12. 常见误区

1. **一句话要求大改**：没有范围和验证，返工概率最高。
2. **把 plan 当成只读沙盒**：计划模式仍会读取和分析，批准后可能继续执行。
3. **把 `auto` 当成安全开关**：它会减少提示，但高风险动作和组织策略仍可能拒绝。
4. **把 `/fork` 当成 Git 分支**：需要代码隔离时显式使用 worktree。
5. **并行修改同一文件**：先划清文件边界，否则合并成本抵消并行收益。
6. **只生成测试不运行**：测试文件存在不代表行为被验证。
7. **长篇规则重复写三遍**：重复会消耗上下文并制造冲突。
8. **把第三方网关当官方模型行为**：模型 alias、上下文、计费和 fallback 取决于 Provider 与 gateway 实现。
9. **只信成功退出码**：检查 hook、MCP、插件加载错误和结构化输出中的 `is_error`。
10. **没有停止条件的 `/goal` 或后台任务**：要给预算、时间和明确完成条件。

---

## 13. 参考资料

本文核验日期：2026-10-12；版本快照：Claude Code `2.1.296`。

- Common workflows：https://code.claude.com/docs/en/common-workflows
- Best practices：https://code.claude.com/docs/en/best-practices
- Interactive mode：https://code.claude.com/docs/en/interactive-mode
- Agent View：https://code.claude.com/docs/en/agent-view
- Sub-agents：https://code.claude.com/docs/en/sub-agents
- Agent Teams：https://code.claude.com/docs/en/agent-teams
- Workflows：https://code.claude.com/docs/en/workflows
- Headless：https://code.claude.com/docs/en/headless
- Code review：https://code.claude.com/docs/en/code-review
- Changelog：https://code.claude.com/docs/en/changelog
- 官方 GitHub Actions：https://github.com/anthropics/claude-code-action

Prompt 模板是工程约定，不是 Claude Code API；真正可用的命令和参数请以本机 `claude --help`、`/help` 和官方页面为准。
