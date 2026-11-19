---
title: "第 03 篇：CLAUDE.md 与 Claude Code 记忆系统"
slug: "ai-rules-claude-claude-md-claudecode-ff6cd587"
summary: "按 2026-11-18 官方文档更新 Claude Code 的 CLAUDE/AGENTS 默认选择、内置插件配置、路径规则、自动记忆类型与目录信任边界，并说明版本门槛和排障方法。"
category: "Rules"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Rules"
tags:
  - "CLAUDE.md"
  - "Claude Code"
  - "Auto Memory"
  - "记忆系统"
  - ".claude/rules"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabff8"
originalSlug: "ai-rules-claude-claude-md-claudecode-ff6cd587"
originalStatus: "published"
publishedAt: "2026-05-24T12:56:24.678Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 03 篇：CLAUDE.md 与 Claude Code 记忆系统

> 核验日期：2026-11-18。以下版本门槛来自当前 Claude Code 官方文档；核验日期不等于功能发布日期。旧版本或企业托管环境需同时核对可用设置。

[[toc]]

## 一、两种持久上下文

Claude Code 用两类机制跨会话保留指导：

| 机制 | 谁维护 | 适合记录 | 关键边界 |
| --- | --- | --- | --- |
| CLAUDE.md / AGENTS.md 与 rules | 人或团队 | 规范、构建命令、架构边界 | 是模型上下文，不是强制权限配置 |
| Auto Memory | Claude，可人工审阅修改 | 用户偏好、纠正、项目背景、外部参考位置 | 通常保存在本机；不同会话类型可能有不同默认开关 |

它们不能替代真实权限与 CI。需要在工具调用前阻断某类动作时，应使用当前宿主支持的权限策略或 `PreToolUse` Hook，而不是只在文档里反复强调。

## 二、CLAUDE 文件放在哪里

| 层级 | 路径 | 用途 |
| --- | --- | --- |
| 用户 | `~/.claude/CLAUDE.md` | 跨项目个人偏好 |
| 项目 | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 团队共享的项目指导 |
| 项目个人 | `./CLAUDE.local.md` | 不提交的个人项目说明，需加入 `.gitignore` |
| 组织托管 | 系统规定的 CLAUDE.md 路径 | 管理员统一提供的组织指导 |

组织托管路径包括：

```text
macOS: /Library/Application Support/ClaudeCode/CLAUDE.md
Linux / WSL: /etc/claude-code/CLAUDE.md
Windows: C:\Program Files\ClaudeCode\CLAUDE.md
```

这些是指导文件位置。组织强制设置、权限和文件系统隔离仍需在相应管理配置中落实。

### 加载顺序与时机

Claude Code 启动时读取工作目录及祖先目录的 CLAUDE 文件，按从上到下的顺序组合进上下文。同一目录的 `CLAUDE.local.md` 追加在 `CLAUDE.md` 后面。

子目录文件按需加载：当 Claude 读取、写入或编辑该目录中的其他文件时，才加载相应指导。并不是每次启动都递归装入整个仓库。

多份文件是组合上下文，并非配置对象逐键覆盖。相互矛盾的规则仍可能造成不稳定结果，应在维护时消除冲突。

## 三、AGENTS.md 已有直接支持

当前官方文档明确：**v2.1.277 及以上版本可直接读取 AGENTS.md**。因此，“Claude Code 不支持 AGENTS，只能手动导入”已经不准确。

### 3.1 默认选择逻辑

| 仓库情况 | 默认读取 |
| --- | --- |
| 有 AGENTS，工作目录及祖先没有项目 CLAUDE 文件 | AGENTS |
| 有 AGENTS，同时存在 `CLAUDE.md`、`.claude/CLAUDE.md` 或 `CLAUDE.local.md` | 项目 CLAUDE 文件 |
| CLAUDE 文件中已经写了 `@AGENTS.md` | CLAUDE 加上导入的 AGENTS |

用户级 `~/.claude/CLAUDE.md`、组织托管文件和 `.claude/rules/` 不触发这个“有项目 CLAUDE 就替代 AGENTS”的条件。

一个容易忽略的边界：给原本只使用 AGENTS 的项目增加 `CLAUDE.local.md`，也会改变默认选择。如果需要两者同时读，应显式调整设置。

### 3.2 Project instructions 设置

在 `/config` 的 **Project instructions** 中可选择：

| 值 | 含义 |
| --- | --- |
| `claude-md-or-agents-md` | 默认：有项目 CLAUDE 就读 CLAUDE，否则读 AGENTS |
| `claude-md-and-agents-md` | 两者一起读，并对已导入 AGENTS 去重 |
| `claude-md` | 只读 CLAUDE 系列 |
| `managed-only` | 启动时仅保留组织托管指导与自动记忆；不是禁止所有后续按需加载 |

对应用户设置示例：

```json
{
  "pluginConfigs": {
    "cc-plugin-agents-md@builtin": {
      "options": {
        "instructionFiles": "claude-md-and-agents-md"
      }
    }
  }
}
```

该设置从用户、`--settings` 或托管设置读取，项目级与 local 设置中的此项不生效。v2.1.285 之前插件 ID 是 `agents-md@builtin`；v2.1.285 及以后兼容两个名称。跨版本共享设置时不能只替换名称而不看版本。

### 3.3 直接加载的边界

- 支持工作目录及祖先的 `AGENTS.md`、`.claude/AGENTS.md`，也支持子目录按需发现。
- 不读取 `AGENTS.local.md`、`AGENTS.override.md` 或 `.agents/` 下的规则文件。
- 禁用对应内置插件、旧版本或升级后的部分首个会话可能无法直接读取。
- 通过设置直接加载 AGENTS 与通过 CLAUDE 导入，在 `InstructionsLoaded` Hook、额外目录及外部导入审批方面存在差异。

旧版本或确需跨版本兼容时，可保留：

```markdown
@AGENTS.md

## Claude 专属说明
- 涉及指定业务模块时，先阅读该模块的设计文档。
```

在 Windows 团队中，这种导入通常比提交符号链接更易维护。普通“请阅读 AGENTS”文字只是在提示模型，不等同于导入语法的加载保证。

## 四、导入与路径规则

### 4.1 `@path` 导入

CLAUDE.md 可以使用：

```markdown
# 项目指导
@docs/architecture.md
@docs/testing.md
```

相对路径以导入文件自身所在目录为基准。导入可以递归，但当前文档限制最多四次跳转。代码围栏和行内代码里的 `@` 不作为导入展开。

导入帮助拆分文件，但**不会减少这些内容进入上下文的成本**。希望只在特定模块加载的内容，应使用路径规则。

指向工作目录外的项目导入属于外部导入，可能触发工作区审批；不要把此机制当作读取任意本机文件的授权。

### 4.2 `.claude/rules/`

```text
.claude/
└── rules/
    ├── general.md
    ├── api.md
    └── testing.md
```

无路径限制的规则作为一般指导加载。指定 `paths` 可以让规则只在 Claude 处理匹配文件时进入上下文：

```markdown
---
paths:
  - "backend/src/**/*.js"
  - "backend/tests/**/*.js"
---

# 后端约定
- 复用模块已有参数校验和错误处理方式。
- 修改权限逻辑时覆盖无权限和资源不存在的情况。
```

用户级规则可放在 `~/.claude/rules/`。跨项目共享规则、符号链接和排除模式还要核对工作区信任及路径限制。

大型仓库可以用 `claudeMdExcludes` 排除不相关文件，但不要把它写成能够排除组织托管指导的通用机制。

## 五、Auto Memory 的当前机制

### 5.1 记什么

当前文档明确列出四类 frontmatter `type`：

| 类型 | 内容 |
| --- | --- |
| `user` | 用户角色、经验和工作偏好 |
| `feedback` | 用户纠正或确认的工作方式 |
| `project` | 从代码和 Git 历史无法直接得到的项目背景与决策 |
| `reference` | 外部信息所在位置，例如问题跟踪器或知识库 |

代码里已经能找到的目录、架构和修复记录，以及 CLAUDE.md 已经说明的内容，不宜重复塞进记忆。记忆也需要清理过时事实。

### 5.2 保存位置与共享边界

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md
├── user_role.md
├── feedback_testing.md
└── ...
```

默认项目目录根据 Git 仓库派生，同一仓库的 worktree 和子目录共享自动记忆。它通常是机器本地数据，不自动在电脑和云环境之间同步。

主会话自动记忆也不应被理解为所有子 Agent 的共同数据库；子 Agent 的独立 memory 配置和继承会话有各自规则。

### 5.3 200 行 / 25KB 的真实含义

会话启动时加载 `MEMORY.md` 的前 200 行或前 25KB，以先达到者为准。主题文件按需读取。

这个限制只针对自动记忆索引，**不是 CLAUDE.md 的统一 200 行截断线**。官方仍建议每份 CLAUDE.md 保持约 200 行以内以提升可读性和遵守率，但建议长度与硬限制不同。

### 5.4 开关和自定义目录

本地普通会话默认开启自动记忆；自托管或特殊会话的默认值与开关限制可能不同。使用 `/memory` 查看当前实际状态。

可以在设置中关闭：

```json
{
  "autoMemoryEnabled": false
}
```

也可通过 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` 关闭。

当前文档允许 `autoMemoryDirectory` 从用户、项目、local、托管或 `--settings` 作用域读取：

```json
{
  "autoMemoryDirectory": "~/my-project-memory"
}
```

值必须是绝对路径或以 `~/` 开头。项目提供的目录受工作区信任约束；启用 `permissions.blockReadsOutsideWorkingDirectories` 时，对仓库指定目录还有额外限制。旧文“不接受项目级 autoMemoryDirectory”已不适用于当前文档。

## 六、检查加载、审阅与排障

- `/memory`：查看或编辑指导与记忆文件，检查自动记忆开关。
- `/context all`：查看启动时 Memory files 等上下文信息；子目录按需加载文件不一定出现在启动列表。
- `/doctor prompt-audit`：v2.1.283+ 可审查过时指令、无效引用与冲突；依赖相应 bundled skill 可用，默认给出建议，不自动改文件。
- `claude --version`：记录实际客户端版本，再判断文档中某项行为是否可用。

规则未生效时按此顺序检查：

1. 文件名、实际工作目录、祖先路径和信任状态。
2. 是否因为项目 CLAUDE 文件使 AGENTS fallback 不再启用。
3. `paths` 是否匹配，以及文件是否已经被访问。
4. 是否被排除、插件禁用、版本过旧或预算限制影响。
5. 是否有互相冲突或无法执行的指令。

压缩会话不是给不完整规则兜底的办法。长期要求应保存到正确的指导文件；只在当前任务有效的要求保留在任务上下文中。

## 官方资料

- [Claude Code：Memory 完整文档](https://code.claude.com/docs/en/memory)
- [AGENTS.md 直接支持与设置](https://code.claude.com/docs/en/memory#agents-md)
- [Settings reference](https://code.claude.com/docs/en/settings-reference)
- [Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code permissions](https://code.claude.com/docs/en/permissions)

本篇加载细节、版本门槛、自动记忆类型与目录约束均以本次实际读取的官方 Memory 页面为依据，避免把早期教程的实现固定为长期规则。
