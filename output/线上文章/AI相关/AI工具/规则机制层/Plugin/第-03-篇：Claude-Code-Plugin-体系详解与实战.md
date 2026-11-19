---
title: "第 03 篇：Claude Code Plugin 体系详解与实战"
slug: "ai-plugin-claudecode-claudecodeplugin-ed613976"
summary: "依据 2026-11-18 Claude Code 官方文档，更新插件目录、可选 manifest、命名空间、校验与本地开发、scope、marketplace 和云端加载边界。"
category: "Plugin"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Plugin"
tags:
  - "Plugin"
  - "Claude Code"
  - "Anthropic"
  - "Marketplace"
  - "Subagent"
  - "Hooks"
  - "Slash Commands"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabfde"
originalSlug: "ai-plugin-claudecode-claudecodeplugin-ed613976"
originalStatus: "published"
publishedAt: "2026-05-24T14:23:33.381Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 03 篇：Claude Code Plugin 体系详解与实战

> 核验日期：2026-11-18。本文依据 Claude Code 当前插件安装、manifest、CLI 与 Skills 文档；版本相关参数以本机 `claude plugin --help` 为准。

[[toc]]

## 一、Plugin 如何组合工作流

Claude Code Plugin 可提供 skills、agents、hooks、MCP、LSP 等组件。团队可以把“PR 审查流程 + reviewer agent + 项目工具连接 + 检查脚本”统一分发，再由使用者在相应 scope 启用。

插件只负责能力组织与加载。MCP 凭据、语言服务器程序、脚本依赖和权限仍需单独就绪。例如安装 LSP 插件不代表机器上一定已有对应语言服务器二进制。

## 二、目录：组件放在插件根目录

```text
frontend-dev-toolkit/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── review-pr/
│       ├── SKILL.md
│       └── references/checklist.md
├── agents/
│   └── reviewer.md
├── hooks/
│   └── hooks.json
├── scripts/
│   └── check-format.sh
├── .mcp.json
└── .lsp.json
```

只有 `plugin.json` 放进 `.claude-plugin/`；不要把 `skills/`、`agents/` 或 `hooks/` 放进该目录。新插件优先用 `skills/<name>/SKILL.md`；旧 `commands/*.md` 仍兼容。

插件根目录中的 `CLAUDE.md` 不会自动作为上下文加载。需要提供任务说明时写入 Skill，长期仓库规则仍放在仓库自己的记忆/规则位置。

## 三、manifest 可选，但团队发布建议显式维护

没有 manifest 时，Claude Code 可以从标准目录发现组件；插件名称来自 marketplace 条目，或本地 `--plugin-dir` 加载时的目录名。存在 manifest 时，`name` 是必填字段。

```json
{
  "name": "frontend-dev-toolkit",
  "description": "Frontend review workflows and supporting tools",
  "version": "1.0.0",
  "author": {
    "name": "Example Team"
  }
}
```

这个示例没有强行声明默认组件路径。确实需要自定义路径时，按 manifest reference 指定 `./` 开头、位于插件根目录内且真实存在的路径。

当前字段还包含 `userConfig`、`dependencies` 等能力，部分新字段有最低版本条件。不要把最新示例中的字段全部复制给旧客户端。`version` 可选，但省略与填写时的缓存/更新行为不同；发布新代码时应同步维护版本，不能默认推送 Git 后每台机器都立即刷新。

## 四、先本地加载与校验

在终端执行：

```bash
claude plugin validate ./frontend-dev-toolkit
claude --plugin-dir ./frontend-dev-toolkit
```

`--plugin-dir` 仅为当前会话加载，不等于永久安装到用户配置。多个插件使用多个参数：

```bash
claude --plugin-dir ./frontend-dev-toolkit --plugin-dir ./review-tools
```

校验会检查字段类型和组件路径等问题。`Validation passed with warnings` 应继续审阅警告；团队 CI 可使用当前版本支持的 `--strict`，使警告导致失败。

插件技能使用带命名空间的入口，例如：

```text
/frontend-dev-toolkit:review-pr
```

这样能区分不同插件的同名技能。单独项目 Skill 则可使用 `/review-pr`。

## 五、marketplace：来源和名称要分清

官方安装文档使用的主要市场是 `anthropics/claude-plugins-official` 仓库，登记名称为 `claude-plugins-official`。在全新机器的脚本中，先添加来源再安装：

```bash
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin install commit-commands@claude-plugins-official
claude plugin list
```

在交互会话中也可使用：

```text
/plugin
/plugin install commit-commands@claude-plugins-official
```

`owner/repo` 是来源；`@` 后面是 marketplace 登记名称。不要把名称、GitHub 仓库短名和示例社区名混用。添加团队市场可用真实 `owner/repo`、Git URL 或包含 `.claude-plugin/marketplace.json` 的本地目录，例如：

```text
/plugin marketplace add ./team-marketplace
```

官方目录中的第三方插件仍有各自的作者和授权需求。“在官方市场可见”不意味着所有内容都由 Anthropic 编写，也不代替团队审阅。

## 六、scope 与团队安装

| Scope | 存储/用途 | 团队使用注意 |
| --- | --- | --- |
| `user` | 用户配置，跨本地项目 | 普通安装默认范围 |
| `project` | `.claude/settings.json` | 可提交共享启用配置；同事仍需在自己的 clone 安装 |
| `local` | 项目本地设置 | 仅当前开发者使用，不提交个人配置 |
| `managed` | 管理员策略下发 | 普通用户不能用 `plugin install --scope managed` 自行安装 |

团队安装示例中 `formatter@team-tools` 是占位名称，需要替换为真实 catalog 中的插件：

```bash
claude plugin install formatter@team-tools --scope project
```

提交 `.claude/settings.json` 不等于帮其他人下载插件。每位成员应先能访问 marketplace，再在自己的 clone 执行安装。插件被更高优先级组织策略禁止时，应调整正确的管理配置，而不是修改本地缓存。

## 七、更新与故障排查

常用 shell 命令如下：

| 命令 | 用途 |
| --- | --- |
| `claude plugin list` | 查看已安装插件、版本、scope、状态 |
| `claude plugin enable <plugin>` | 启用插件 |
| `claude plugin disable <plugin>` | 禁用插件 |
| `claude plugin update <plugin>@<marketplace>` | 更新指定插件 |
| `claude plugin uninstall <plugin>` | 卸载 |
| `claude plugin marketplace update <marketplace>` | 刷新 marketplace |
| `claude plugin validate ./plugin-directory` | 校验插件结构 |

操作具体 scope 时可显式传 `--scope`。`managed` 仅在部分管理动作（如当前 `update`）支持，不能把所有命令的 scope 参数视为完全相同。

排查顺序：来源能否访问 → 插件是否已下载 → 当前 scope 是否启用 → manifest/路径是否正确 → 依赖与 MCP 授权是否齐全 → 本会话是否已加载更新。修改后按客户端提示重载或开启新会话，不将“磁盘有文件”当成“本会话已生效”。

## 八、脚本路径、用户配置和云端边界

插件更新时安装根目录可能变化。脚本和随包二进制引用使用 `${CLAUDE_PLUGIN_ROOT}`；持久状态放适用的持久数据位置，不写进版本化安装目录。shell 命令中的路径变量要正确引用，以兼容带空格目录。

`userConfig` 可声明需要向用户收集的配置；敏感项使用文档支持的 sensitive 语义，避免把 token 写入共享仓库。不要假设每种组件都能读取所有配置变量，按 manifest reference 的支持表逐项确认。

本地安装的插件不会自动成为云会话插件。当前官方文档明确：云会话不加载用户本机已安装插件，也不因为仓库 `.claude/settings.json` 启用了插件就自动加载。账号同步与组织管理分发属于另一条流程，使用桌面、终端或云端时应分别验证。

## 九、三个实际工作流

### 9.1 组件开发

将组件实现 Skill、组件审查 agent 与设计资料 MCP 放在一个插件。Skill 先读取项目设计系统，再实现组件；检查脚本只运行与变更相关的构建/测试。需要真实浏览器验证时遵守项目授权规则。

### 9.2 PR 审查

Skill 读取 diff 和 `references/checklist.md`，审查 agent 检查复杂边界，GitHub MCP 提供必要上下文。输出问题、影响与证据；是否提交评论由当前任务授权决定。

### 9.3 发布准备

将发布清单、环境核对脚本、回滚说明和部署工具接入统一分发。清晰区分只读预览与正式写入，不把“安装发布插件”当作对任何环境的永久发布授权。

## 参考资料

- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [安装与管理插件](https://code.claude.com/docs/en/plugins/install)
- [Plugin manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference)
- [Plugin CLI reference](https://code.claude.com/docs/en/plugins/cli-reference)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Anthropic 官方 marketplace](https://github.com/anthropics/claude-plugins-official)
