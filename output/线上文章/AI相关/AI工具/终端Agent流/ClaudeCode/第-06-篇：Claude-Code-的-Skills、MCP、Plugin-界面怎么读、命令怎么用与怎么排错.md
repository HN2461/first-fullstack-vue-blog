---
title: "第 06 篇：Claude Code 的 Skills、MCP、Plugin 界面怎么读、命令怎么用与怎么排错"
slug: "ai-agent-claudecode-claudecode-skills-mcp-plugin-a4c669eb"
summary: "按 2026-10-12 Claude Code 2.1.296 官方 Commands、Skills、MCP、Plugins、Interactive Mode、Agent View 与 Changelog 更新，重新整理 /mcp、/skills、/plugin、权限提示、后台会话、全量斜杠命令和常见排错路径。"
category: "ClaudeCode"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "终端Agent流"
  - "ClaudeCode"
tags:
  - "Claude Code"
  - "Skills"
  - "MCP"
  - "Plugin"
  - "终端界面"
  - "英文提示"
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d291d8a2b1c68f2cabf3e"
originalSlug: "ai-agent-claudecode-claudecode-skills-mcp-plugin-a4c669eb"
originalStatus: "published"
publishedAt: "2026-05-30T09:36:22.756Z"
updatedAt: "2026-10-12T15:17:34.433Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 06 篇：Claude Code 的 Skills、MCP、Plugin 界面怎么读、命令怎么用与怎么排错

> 本文按 2026-10-12 官方页面和 Claude Code `2.1.296` 核验。终端里的英文词、命令和状态项会随版本、账号、Provider、插件和组织策略变化；本文先解释判断方法，再给当前 Commands 页面抓到的完整命令索引。

[[toc]]

---

## 这篇到底帮你解决什么

你看到一个名字时，先判断它的来源：

```text
内置命令/别名 → Claude Code 本体
Skill / Workflow → 可复用提示或编排流程
MCP prompt/tool → 外部 MCP server 提供
Plugin → 打包 Skills、agents、hooks、MCP、LSP 的分发单元
```

同一个 `/name` 可能来自 Skill、Plugin 或 MCP prompt；“在菜单里出现”只代表当前会话发现了它，不代表 Claude 一定会主动调用，也不代表你有权执行它。

---

## 一、`/mcp` 页面怎么读

### 1. 状态词

| 状态/标签 | 解释 | 下一步 |
| --- | --- | --- |
| `connected` | server 连接成功 | 看工具数量，调用一个最小工具验证 |
| `failed` | 启动、认证或协议失败 | `/mcp reconnect <server>`，再看 `claude --debug=mcp` |
| `needs auth` / OAuth | 需要登录或重新授权 | 按提示授权，检查远程 URL 和回调 |
| `deferred` | 工具 schema 按需加载 | 第一次调用会加载；不是失败 |
| `disabled` | 被 `/mcp disable` 或设置键关闭 | 检查 `enabledMcpjsonServers/disabledMcpjsonServers` |
| `2 tools` | 当前已加载的工具数 | server 可能还有延迟工具 |

### 2. MCP 的作用域

- `~/.claude.json`：个人本地配置。
- 项目根 `.mcp.json`：可以随 Git 共享。
- Plugin manifest：随插件加载。
- `--mcp-config`：当前启动会话；配合 `--strict-mcp-config` 可以只使用显式文件。
- Managed MCP：组织控制的 allow/deny、OAuth 和服务器清单。

`.mcp.json` 中不要提交 token、本机绝对路径和个人数据库地址。需要认证时优先 OAuth、环境变量或凭据 helper。

### 3. 最小排障链

```text
/mcp
/mcp reconnect all
claude --debug=mcp
```

然后检查：server 进程是否退出、URL 是否可达、`stdio` command 是否在 PATH、环境变量是否传入、工具 schema 是否超过限制、组织 `allowedMcpServers/deniedMcpServers` 是否拦截。MCP 连接成功但工具不可用时，先确认工具是否 deferred 和当前模型/Provider 是否支持 tool search。

---

## 二、`/skills` 页面怎么读

### 1. Skill、bundled skill 和 plugin skill

- **Project/User Skill**：`.claude/skills/` 或 `~/.claude/skills/`，你可以编辑。
- **Bundled skill**：Claude Code 随版本提供，例如 `/doctor`、`/run`、`/verify`、`/simplify`、`/code-review`、`/deep-research`、`/batch`。
- **Plugin skill**：由插件提供，通常显示 namespace 或 `locked by plugin`。
- **Synced skill**：从 claude.ai 账户同步，受账户和组织策略控制。

### 2. 看到的字段

| 页面文字 | 解释 |
| --- | --- |
| `N skills` | 当前会话发现的 Skill 数量，不是你安装过的总数 |
| `plugin` / `bundled` / `project` / `user` | Skill 来源 |
| `locked by plugin` | 由插件管理，不能用普通 `skillOverrides` 修改 |
| `~40 tok`、`~80 tok` | Skill 描述加载到每次请求的估算上下文成本 |
| `name-only` | 只把名字/描述展示给模型，不载入正文 |
| `user-only` / `user-invocable-only` | 从 Claude 的 Skill 上下文隐藏，但保留用户在 `/` 菜单中的显式调用入口 |
| `off` | 关闭该 Skill 的发现或调用 |
| `Space to cycle` | 在可见、仅名、仅用户、关闭之间切换；保存前按 Esc 取消 |

`disable-model-invocation: true` 的 Skill 仍可由用户显式 `/name` 调用；`user-invocable: false` 则不会作为用户命令出现，但模型可在相关任务中使用。安装很多 Skill 后，优先用 `/skill-doctor` 查上下文成本和使用频率。

### 3. Skill 不触发的排查

1. 描述是否写了自然语言触发场景。
2. 是否被 `disable-model-invocation`、`skillOverrides`、Managed policy 或 `--disable-slash-commands` 关闭。
3. Skill 是否位于当前作用域，或被错误放在旧的 `.claude/commands/` 路径。
4. front matter 是否有不支持的键，`SKILL.md` 是否 UTF-8、YAML 可解析。
5. Skill 是否需要 `context: fork`、Agent 或额外文件，当前 Provider 是否允许。

---

## 三、`/plugin` 页面怎么读

### 1. 四个常见标签

| 标签 | 重点 |
| --- | --- |
| `Discover` | 当前 marketplace 可安装的插件 |
| `Installed` | 已安装、启用/禁用状态和来源 |
| `Marketplaces` | marketplace 来源、更新和策略 |
| `Errors` | Plugin、Hook、MCP、依赖或 manifest 加载错误 |

### 2. 常用操作

```text
/plugin list
/plugin install skill-creator@claude-plugins-official
/plugin enable <name>@<marketplace>
/plugin disable <name>@<marketplace>
/plugin configure <name>@<marketplace>
/plugin update <name>@<marketplace>
/reload-plugins
```

CLI 等价操作：

```bash
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin install skill-creator@claude-plugins-official
claude plugin validate ./my-plugin
claude plugin list --json
claude --plugin-dir ./my-plugin
```

`/reload-plugins` 会重新扫描已启用插件；如果 MCP 工具变化会使 prompt cache 失效，当前版本会先提示，必要时使用 `/reload-plugins --force`。看到插件“安装成功”但命令不见，先检查是否启用、命令是否带命名空间、组件是否在 Errors 中失败。

### 3. 安装前检查

- marketplace 来源是否是组织允许的 `strictKnownMarketplaces`。
- manifest 中的 hooks、MCP、agents、skills 是否符合预期。
- 是否会执行 shell、读取凭据或访问外部网络。
- Plugin 是否锁定了某个 Skill，使得普通 `skillOverrides` 不生效。
- 团队是否应该把 Plugin 声明提交到 `.claude/settings.json`，而不是每个人私下安装。

---

## 四、权限提示和后台转录怎么看

### `Skill(update-config)` 或 `Skill(deploy)`

这表示 Claude 准备调用一个 Skill，括号里是 Skill 名称，不是 shell 命令。看它的描述、front matter、`allowed-tools` 和当前权限模式；部署/提交等副作用 Skill 通常应设置 `disable-model-invocation: true`，由人显式调用。

### `Bash(...)`、`Read(...)`、`MCP(...)`

- `Bash(...)`：显示实际 shell 命令和工作目录，确认是否会写入、删除、联网或触碰敏感文件。
- `Read(...)`：确认路径、是否超出工作目录和是否包含 `.env`/凭据。
- `mcp__server__tool`：确认 server、工具名、参数、外部目标和组织策略。

`allow`、`ask`、`deny` 规则按作用域合并；看到重复确认时不要立刻开启 bypass，先用 `/permissions` 查看规则来源。

### `Backgrounded agent`、`Waiting for ... background agent`

这是 Agent View 的会话状态：主会话把 subagent、后台会话或长命令移出前景。用下面的入口查看：

```text
/agents
/list-agents
/tasks
```

`Ctrl+O` 切换详细转录；`/focus` 只显示当前提示、工具摘要和最终结果；`/tui fullscreen` 使用全屏渲染器。后台 session 可以用 `/resume` 或 shell 的 `claude agents` 查看和重新连接。

---

## 五、终端斜杠命令的四个来源

1. **Built-in command**：Claude Code 本体直接实现，例如 `/help`、`/status`、`/model`、`/config`。
2. **Bundled Skill/Workflow**：随版本提供，例如 `/verify`、`/deep-research`、`/batch`。
3. **Plugin skill/command**：安装 Plugin 后出现，可能带 namespace。
4. **MCP prompt**：服务器提供的 prompt，通常以服务器命名空间出现。

命令菜单会根据当前环境过滤不可用项。输入 `/` 后，起始匹配会高亮；输入拼写错误时不会自动替你执行近似命令。完整命令在当前 CLI 的 `/help` 里优先级最高；本文的完整表按官方 Commands 页面在核验日抓取。

---

## 六、当前官方斜杠命令完整索引

以下 119 条来自 2026-10-12 访问的官方 Commands 页面。`Purpose` 保留官方原文摘要，便于用英文命令名和官方页面交叉检索；是否显示仍受版本、账号、Provider、Plugin 和组织策略影响。已移除的命令也可能出现在旧教程中，文末另列。

| Command | Purpose（官方原文摘要） |
| --- | --- |
| `/add-dir <path>` | Add a working directory for file access during the current session. Type a partial path to see matching directory suggestions; press Tab to accept one. Most .claude/ configuration isn’t discovered from the added directory. You can’t add most network paths, such as \\server\share. After a successful add, your DirectoryAdded hooks run. When you run it while Claude is responding, Claude Code asks you to confirm the directory right away, and once you confirm, Claude’s next tool call in the same turn can access it. Before v2.1.234, Claude Code queued the command until the turn finished |
| `/advisor [model\|off]` | Enable or disable the advisor tool, which consults a second model for guidance at key moments during a task. Accepts fable, opus, sonnet, or a full model ID. fable requires Fable access. Without an argument, opens a picker. In a session without an interactive terminal, or over Remote Control, pass the model or off as an argument; with no argument there, the command prints the current advisor as text. These forms require Claude Code v2.1.260 or later |
| `/agents` | Print a reminder to ask Claude to create or manage subagents, or to edit .claude/agents/ or ~/.claude/agents/ directly. On v2.1.197 and earlier, opens an interactive interface for creating and managing subagent configurations |
| `/artifact-capabilities` | Skill. Load the reference for the runtime capabilities a published artifact can use, such as calling your connectors or offering a file download, including which ones your account has. Claude normally loads it on its own before building a page that uses one. Available where artifacts are |
| `/artifact-diagramming` | Skill. Load diagramming guidance for Claude to follow in artifacts: when a diagram helps, what to draw, and how to write inline SVG that stays legible in light and dark themes. Requires Claude Code v2.1.221 or later |
| `/artifacts` | List the artifacts you own or that are shared with you, then attach one to the session, open it in your browser, or copy its link. Available where artifacts are. Requires Claude Code v2.1.208 or later; attaching with Enter requires v2.1.216 |
| `/auto-mode-setup` | Draft autoMode.environment entries from your project and recent sessions, then review the draft and save it to your user settings. Requires a Pro, Max, or Team plan and Claude Code v2.1.228 or later. On native Windows, requires v2.1.233 or later |
| `/autocompact [auto\|<tokens>]` | Set the auto-compact window: how full the context window gets before Claude Code compacts automatically. Pass a size such as 500k, or auto to return to the window tuned for your model. Claude Code saves the value to user settings and applies it to the current session. See Set the auto-compact window for accepted values and what overrides it. Without an argument, opens a dialog that shows the current window. Requires Claude Code v2.1.221 or later |
| `/autofix-pr [prompt]` | Spawn a cloud session that watches the current branch’s PR and pushes fixes when CI fails or reviewers leave comments. Detects the open PR from your checked-out branch with gh pr view; to watch a different PR, check out its branch first. By default the cloud session is told to fix every CI failure and review comment; pass a prompt to give it different instructions, for example /autofix-pr only fix lint and type errors. Requires the gh CLI and access to cloud sessions |
| `/background [prompt]` | Detach the current session to run as a background agent and free this terminal. Pass a prompt to send one more instruction before detaching. Monitor the session with claude agents. To copy the conversation into a new background session while this one keeps running, use /fork. Alias: /bg |
| `/batch <instruction>` | Skill. Orchestrate large-scale changes across a codebase in parallel. Researches the codebase, decomposes the work into 5 to 30 independent units, and presents a plan. Once approved, spawns one background subagent per unit in an isolated worktree. Each subagent implements its unit, runs tests, and publishes its change. Requires a git repository or a WorktreeCreate hook that creates the worktrees. Outside a git repository, /batch requires Claude Code v2.1.281 or later. Example: /batch migrate src/ from JavaScript to TypeScript |
| `/branch [name]` | Create a branch of the current conversation at this point, so you can try a different direction without losing the conversation as it stands. Switches you into the branch and preserves the original, which you can return to with /resume. To run a copy as a separate background session instead of switching into it, use /fork; to hand a side task to a subagent that reports back into this conversation, use /subtask |
| `/btw [question]` | Ask a side question about the current session without adding to the conversation. If you run /btw without a question, Claude Code shows your most recent side question so you can browse earlier answers; if you haven’t asked one yet, Claude Code prints a usage line. Before v2.1.212, /btw required a question |
| `/bug [report]` | Report a bug or share your conversation. You choose how much session history to include and confirm on a consent screen before anything is sent. When you’re signed in to Anthropic on a first-party connection, the report goes to Anthropic; on a third-party provider, or without Anthropic credentials, Claude Code writes the report to a local archive under ~/.claude/feedback-bundles/ that you forward yourself. In the VS Code extension, /bug opens the extension’s own feedback dialog instead; requires Claude Code v2.1.229 or later. When you run it while Claude is responding, Claude Code opens the dialog immediately. Before v2.1.232, Claude Code queued the command until the turn finished. Alias: /share. Before v2.1.212, /bug and /share were aliases of /feedback |
| `/cd <path>` | Move this session to a new working directory, keeping the conversation. Type a partial path to see matching directory suggestions; press Tab to accept one. The suggestions require Claude Code v2.1.206 or later. For what Claude Code applies from the new directory as soon as you move, and how /cd differs from /add-dir, see Move the session to another directory |
| `/chrome` | Configure Claude in Chrome settings |
| `/claude-api [migrate\|upgrade\|managed-agents-onboard\|prompt-audit\|cost-optimize\|build-eval\|hillclimb\|preserved-thinking-migration]` | Skill. Load Claude API and Managed Agents reference material for your project’s language. Also activates automatically when your code imports anthropic or @anthropic-ai/sdk. For what each subcommand does and the version it requires, see Work on Claude API projects |
| `/claude-in-chrome [task]` | Skill. Have Claude carry out a task in your browser, such as testing a page, filling a form, or reading console logs, through Claude in Chrome. Available when Chrome integration is enabled for the session, for example with claude --chrome, or when Claude Code can offer to install the extension |
| `/clear [name]` | Start a new conversation with empty context. Pass a name to label the previous conversation in the /resume picker. To free up context while continuing the same conversation, use /compact instead. Resume the previous conversation with /resume, or, in the same Claude Code process, restore it from the rewind menu’s previous-session entry. Aliases: /reset, /new |
| `/code-review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [--max-findings n\|all\|default] [pr#\|branch\|path]` | Skill. Review the current diff, or a PR number, branch, or path you pass, for correctness bugs. Depending on your model and effort level, the review also covers cleanup opportunities. Pass --fix to apply findings, --comment to post them on the GitHub PR or GitLab merge request, or ultra to run a deep cloud review. Posting to a GitLab merge request requires Claude Code v2.1.257 or later. With ultra on a github.com PR target, pass --post to preselect posting the finished findings to the PR in the launch dialog; --post requires Claude Code v2.1.227 or later. See Review a diff locally for the effort levels, targeting, and how it relates to /simplify. Alias: /review |
| `/color [color\|default]` | Set the prompt bar color for the current session. Available colors: red, blue, green, yellow, purple, orange, pink, cyan. Use default to reset, or run with no argument to pick a random color. When Remote Control is connected, the color syncs to claude.ai/code. Also available in non-interactive mode (-p); requires Claude Code v2.1.205 or later |
| `/compact [instructions]` | Free up context by summarizing the conversation so far. Optionally pass focus instructions for the summary. See how compaction handles rules, skills, and memory files |
| `/config [key=value ...]` | Open the Settings interface to adjust theme, model, output style, and other preferences. Pass one or more key=value pairs to set a setting directly without opening the interface, for example /config thinking=false, /config theme=dark, or /config model=sonnet. The key=value form also works in non-interactive mode (-p) and from the Claude mobile app via Remote Control. The key=value form can’t turn on a setting that needs your confirmation in the panel, such as autoContinueAtUsageLimit, though it can turn one off. Run /config --help to list the keys it accepts. Alias: /settings |
| `/context [all]` | Visualize current context usage as a colored grid. Shows optimization suggestions for context-heavy tools, memory bloat, and capacity warnings. When the conversation exceeds the context window, the output includes a warning showing how far over the limit you are and which command frees space. In fullscreen mode, /context collapses the per-item breakdown to keep the grid visible. Pass all to expand it |
| `/copy [N]` | Copy the last assistant response to clipboard. Pass a number N to copy the Nth-latest response: /copy 2 copies the second-to-last. When code blocks or blockquotes are present, shows an interactive picker to select individual blocks or the full response. Press w in the picker to write the selection to a file instead of the clipboard, which is useful over SSH |
| `/cost` | Alias for /usage |
| `/dataviz [request]` | Skill. Design guidance for charts, graphs, and dashboards. Claude picks the chart form for the data, assigns color by role, validates the palette for colorblind safety and contrast with a bundled script, and applies mark, interaction, and accessibility rules. Uses a brand-neutral placeholder palette that you replace with your own |
| `/debug [description]` | Skill. Enable debug logging for the current session and troubleshoot issues by reading the session debug log. Debug logging is off by default unless you started with claude --debug, so running /debug mid-session starts capturing logs from that point forward. Optionally describe the issue to focus the analysis |
| `/deep-research <question>` | Workflow. Fan out web searches on a question, fetch and cross-check sources, and synthesize a cited report |
| `/design [brief]` | Skill. Draft UI mockups, screen flows, landing pages, or posters as artboards on one canvas, published as a Claude Design artifact, for example /design a settings screen for a mobile banking app. You edit the artboards in a desktop browser, and your edits save automatically. You can export each artboard as PNG or PDF. Requires Claude Code v2.1.265 or later, a session where artifacts are available, and an account where the Design template is available; if your organization has turned that template off, /design doesn’t draft designs. Available on the Anthropic API. On Amazon Bedrock, Google Cloud’s Agent Platform, Microsoft Foundry, and Claude Platform on AWS, artifacts aren’t available, so the command is unavailable there |
| `/design-login` | Authorize design-system access for /design-sync with your claude.ai account |
| `/design-sync [hint]` | Skill. Convert your repo’s React design system and upload it to Claude Design, so designs it produces use your real components. Optionally name the design system, for example /design-sync Acme DS. A first-time sync verifies every component and can take a few hours on a large repo. Available on the Anthropic API. It needs claude.ai, which the CLI doesn’t contact on Amazon Bedrock, Google Cloud’s Agent Platform, Microsoft Foundry, or Claude Platform on AWS, or through a Claude apps gateway, so the command is unavailable there |
| `/desktop` | Continue the current session in the Claude Code Desktop app. Requires macOS or x64 Windows and a Claude subscription. Alias: /app |
| `/diff` | Review the changes in your working tree, including the edits Claude has made so far. See Review changes with /diff |
| `/doctor [prompt-audit [path]]` | Skill. Run a setup checkup that diagnoses installation, settings, extension, and CLAUDE.md problems and proposes fixes that Claude applies after you confirm. For what the checkup covers, or to audit your instructions with prompt-audit instead, see Check your setup with /doctor. The prompt-audit subcommand requires Claude Code v2.1.283 or later. Alias: /checkup |
| `/effort [level\|auto\|status\|ultracode [on\|off]]` | Set the effort level: low to xhigh, max, or auto; status prints it. ultracode or ultracode on turns ultracode on for the session at the current level, and ultracode off turns it off; the ultracode key persists. max is session-only. The on and off arguments and keeping the current level require Claude Code v2.1.284 or later. Before v2.1.284, /effort ultracode set the session to xhigh, and /effort ultracode off failed with Invalid argument. Run it while Claude is responding and, once you confirm the cache warning, if Claude Code shows one, Claude Code applies the new level to the next request in that turn. Before v2.1.242, Claude Code decided from a feature flag it fetched from Anthropic whether to run the command mid-turn or queue it until the turn finished, and always queued it in a session that doesn’t fetch feature flags, such as on a third-party provider. Works in -p |
| `/exit` | Exit the CLI. In an attached background session, this detaches and the session keeps running. Alias: /quit |
| `/export [filename]` | Export the current conversation as plain text. With a filename, writes directly to that file. Without, opens a dialog to copy to clipboard or save to a file |
| `/fast [on\|off]` | Toggle fast mode on or off. Run it while Claude is responding and Claude Code toggles fast mode without waiting for the turn to end, though the running turn finishes at its original speed. Before v2.1.242, Claude Code decided from a feature flag it fetched from Anthropic whether to run the command mid-turn or queue it until the turn finished, and always queued it in a session that doesn’t fetch feature flags. Availability in non-interactive mode with -p is limited; see Toggle fast mode. Requires Claude Code v2.1.205 or later |
| `/feedback [report]` | Send product feedback about Claude Code. Opens the same dialog as /bug, with the same consent step, sending rules, and mid-turn behavior. In sessions with Claude-drafted feedback, /feedback with no argument opens the drafts queue instead, where you review, edit, send, or discard the drafts Claude queued; the queue includes an option to write a new report in the dialog. With an argument, and for /bug always, the dialog opens directly |
| `/fewer-permission-prompts` | Skill. Scan your transcripts for common read-only Bash and MCP tool calls, then add a prioritized allowlist to project .claude/settings.json to reduce permission prompts |
| `/focus` | Toggle the focus view, which shows only your last prompt, a one-line tool-call summary with edit diffstats, and the final response. The tool-call summary also counts the subagents launched in the turn and collapses completed background-task notifications into a single count. The selection persists across sessions; set viewMode in settings to override it. Only available in fullscreen rendering. From a Remote Control client, run /focus [on/off] to turn the focus view on or off for the current session only, without changing your saved selection; this requires Claude Code v2.1.281 or later. The VS Code extension offers its own Focus view as a command-menu toggle, stored as an extension setting, independent of viewMode |
| `/fork [prompt]` | Copy the current conversation into a new background session and keep working here. Pass a prompt and the copy starts working on it immediately; without one it waits in agent view for its first prompt. Except when the copy edits in place, Claude Code instructs it to create a worktree of its own before making code changes; the isolation instruction requires Claude Code v2.1.221 or later. To hand a side task to a subagent whose result comes back into this conversation, use /subtask; to switch into a copy yourself, use /branch. Requires Claude Code v2.1.212 or later; on v2.1.161 through v2.1.211, and whenever agent view is turned off, /fork starts a forked subagent instead |
| `/goal [condition\|clear]` | Set a goal: Claude keeps working across turns until the condition is met or the goal clears for another reason. With no argument, shows the current or most recently achieved goal. clear, stop, off, reset, none, or cancel removes an active goal early |
| `/heapdump` | Write a JavaScript heap snapshot and a memory breakdown to ~/Desktop, or your home directory on Linux without a Desktop folder, for diagnosing high memory usage. Attach only the -diagnostics.json file when reporting a memory issue; the .heapsnapshot contains your full conversation and credentials, so don’t share it. Hidden from the command menu; type it in full. See what to do with the output |
| `/help` | Show help and available commands |
| `/hooks` | View hook configurations |
| `/ide` | Manage IDE integrations and show status |
| `/import [codex\|gemini\|cursor] [--dry-run] [--yes]` | Bring configuration from OpenAI Codex, Google Gemini CLI, or Cursor on your machine into Claude Code, including instruction files, MCP servers, commands, subagents, and skills. In non-interactive mode with -p, /import lists what it found and gives you the command that confirms the import. Add --dry-run to preview without writing anything, or --yes to skip the interactive picker. Not available on Amazon Bedrock, Google Cloud’s Agent Platform, Microsoft Foundry, or Claude Platform on AWS, or through a Claude apps gateway. Also unavailable when you turn off feature-flag fetching. Requires Claude Code v2.1.213 or later. Importing from Cursor requires v2.1.265 or later |
| `/init` | Initialize project with a CLAUDE.md guide. Set CLAUDE_CODE_NEW_INIT=1 for an interactive flow that also walks through skills, hooks, and personal memory files. If /init finds OpenAI Codex or Google Gemini CLI configuration, it offers to carry it over with /import |
| `/insights` | Generate an HTML report analyzing your recent sessions on this machine: which projects you work in, how you use Claude Code, where things go wrong, and features to try. Not available in cloud sessions. See Analyze your usage patterns for the report location, retention, and cost |
| `/install-github-app` | Install the Claude GitHub App for a repository, with an optional step to set up GitHub Actions workflows and secrets. Walks you through selecting a repo and configuring the integration. Works only with github.com repositories. When your repository’s git remote is on gitlab.com or bitbucket.org, the command prints a notice and exits instead of starting setup. To run Claude Code from GitLab pipelines, see GitLab CI/CD |
| `/install-slack-app` | Install the Claude Slack app. Opens a browser to complete the OAuth flow |
| `/keybindings` | Open your keyboard shortcuts file |
| `/list-agents` | List the subagents, agent team teammates, and other Claude Code sessions Claude can message, with the name to use for each. See cross-session messaging. Also available as /peers. Requires Claude Code v2.1.224 or later; earlier versions report Unknown command: /list-agents. Teammate rows and the first line showing this session’s own name require v2.1.239 or later. Available only in sessions where cross-session messaging is enabled |
| `/login` | Sign in to your Anthropic account |
| `/logout` | Sign out from your Anthropic account |
| `/loop [interval] [prompt]` | Skill. Run a prompt repeatedly while the session stays open. Omit the interval and Claude self-paces between iterations. Omit the prompt and Claude runs the built-in maintenance prompt or your loop.md. Example: /loop 5m check if the deploy finished. See Run prompts on a schedule. Alias: /proactive |
| `/mcp [reconnect (<server>\|all)\|enable\|disable [<server>\|all]]` | Manage MCP server connections and OAuth authentication. Run with no argument to open the interactive list, or pass reconnect, enable, or disable with a server name or all to change connection state without opening it. reconnect all retries every server that failed or needs authentication. In non-interactive mode (-p), running it with no argument prints a text summary of server status instead of opening the list; requires Claude Code v2.1.205 or later |
| `/memory` | Edit CLAUDE.md files, enable or disable auto memory, and view auto memory entries |
| `/mobile` | Show QR code to download the Claude mobile app. Aliases: /ios, /android |
| `/model [model]` | Switch the AI model and save it as your default for new sessions. For models that support it, use left/right arrows to adjust effort level. With no argument, opens a picker; press s on a row to switch for the current session only. See when Claude Code asks you to confirm the switch. Once you confirm the switch, if Claude Code asks, Claude Code applies the change without waiting for the current response to finish. Before v2.1.242, Claude Code decided from a feature flag it fetched from Anthropic whether to run the command mid-turn or queue it until the turn finished, and always queued it in a session that doesn’t fetch feature flags, such as on a third-party provider. Also available in non-interactive mode (-p) with a model argument instead of the picker, where it applies to the current session only and isn’t saved as your default; requires Claude Code v2.1.205 or later |
| `/output-style [style]` | List output styles or switch to one, for example /output-style concise. See Change your output style. Requires Claude Code v2.1.269 or later |
| `/passes` | Share a free week of Claude Code with friends. Only visible if your account is eligible |
| `/permissions` | Manage allow, ask, and deny rules for tool permissions. Opens an interactive dialog where you can view rules by scope, add or remove rules, manage working directories, and review recent auto mode denials. You can also view and edit auto mode classifier rules from the dialog’s Auto mode tab. When you run it while Claude is responding, Claude Code opens the dialog immediately and applies your changes starting with Claude’s next tool call in the same turn. Before v2.1.234, Claude Code queued the command until the turn finished. Alias: /allowed-tools |
| `/plan [description]` | Enter plan mode directly from the prompt. Pass an optional description to enter plan mode and immediately start with that task, for example /plan fix the auth bug |
| `/plugin [subcommand]` | Manage Claude Code plugins. Run with no argument to open the plugin menu, or pass a subcommand such as list, install, enable, or disable to act directly. Claude Code can activate a plugin during the install; the install summary tells you whether it did or whether to run /reload-plugins |
| `/plugin-authoring` | Load the reference Claude works from to write a mod. Claude can load it on its own when you ask for a mod. This is a skill from a built-in plugin, which you can turn off in /plugin. Requires Claude Code v2.1.287 or later |
| `/powerup` | Discover Claude Code features through quick interactive lessons with animated demos |
| `/pr-comments [PR]` | Removed in v2.1.91. Ask Claude directly to view pull request comments instead. On earlier versions, fetches and displays comments from a GitHub pull request; automatically detects the PR for the current branch, or pass a PR URL or number. Requires the gh CLI |
| `/privacy-settings` | View and update your privacy settings. Only available for Pro and Max plan subscribers |
| `/radio` | Open Claude FM lo-fi radio in your browser. Prints the stream URL when no browser is available |
| `/rate-limit-options` | Show ways to keep working when a claude.ai usage limit blocks a request: wait and continue automatically when the limit resets, add usage credits, or upgrade your plan. Claude Code can also open this menu on its own when you hit a limit at your own terminal. See Turn automatic continue off. Requires a claude.ai subscription. The wait-and-continue rows require Claude Code v2.1.234 or later |
| `/recap` | Generate a one-line summary of the current session on demand. See Session recap for the automatic recap that appears after you’ve been away |
| `/release-notes` | View the changelog in an interactive version picker. Select a specific version to see its release notes, or choose to show all versions. The notes appear in your transcript without entering the conversation Claude sees |
| `/reload-plugins [--force]` | Reload all active plugins to apply pending changes without restarting. Reports counts for each reloaded component and flags any load errors. When the reload would change which MCP tools are loaded and invalidate the prompt cache, the command warns and skips unless you pass --force. Also available in non-interactive mode (-p), the Agent SDK, and the desktop app, where it runs only on input typed directly into the session and doesn’t apply plugin MCP server changes; requires Claude Code v2.1.260 or later. See Apply plugin changes without restarting |
| `/reload-skills` | Re-scan skill and command directories so skills added or changed on disk during the session become available without restarting. Reports how many skills are available and how many were added or removed |
| `/remote-control` | Make this session available for Remote Control from claude.ai. Running it while signed out prints that Remote Control requires a claude.ai subscription and tells you how to sign in; before v2.1.206 it reported Unknown command: /remote-control. Alias: /rc |
| `/remote-env` | Choose the default cloud environment for cloud sessions you start from the CLI |
| `/rename [name]` | Rename the current session and show the name on the prompt bar. Without a name, auto-generates one from conversation history. Also available in non-interactive mode (-p); requires Claude Code v2.1.205 or later. From every rename surface, including claude.ai and the desktop app, Claude Code replaces control and invisible characters in the new name with spaces and caps the name at 200 characters. If the name is empty once invisible characters are removed, Claude Code rejects it and shows That name is empty once invisible characters are removed. Usage: /rename <name>. The character replacement and length cap require Claude Code v2.1.221 or later |
| `/resume [session]` | Resume a conversation by ID or name, or open the session picker. Background sessions appear in the picker marked with bg. Resuming one that is still running, from the picker or by ID or name, opens that session: your current conversation moves to the background and this terminal attaches to the running one. Press ← on an empty prompt to return to agent view, which also lists the conversation you left. Before v2.1.285, Claude Code refused and told you to open the session with claude attach or stop it first. Alias: /continue |
| `/review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [--max-findings n\|all\|default] [pr#\|branch\|path]` | Alias of /code-review: reviews the current diff, or a PR number, branch, or path you pass, such as /review 1234, and takes the same effort levels and flags. With no level given, the review reuses the last low through max level you typed; see Review a diff locally for the exact rules. For a deep cloud review, use /code-review ultra. Before v2.1.223, /review was a separate command that ran a single-pass, read-only review of a GitHub pull request by number, listing open PRs to pick from when run with no argument; from v2.1.186 through v2.1.201, it ran the same multi-agent engine as /code-review medium |
| `/rewind` | Rewind the conversation and/or code to a previous point, or summarize from a selected message. See checkpointing. Aliases: /checkpoint, /undo |
| `/run` | Skill. Launch and drive your project’s app to see a change working, not only passing tests. See Run and verify your app |
| `/run-skill-generator` | Skill. Teach /run and /verify how to build, launch, and drive your project’s app from a clean environment by writing a per-project skill |
| `/sandbox` | Toggle sandbox mode. Available on supported platforms only |
| `/schedule [description]` | Create, update, list, or run routines, which execute in the cloud. Claude walks you through the setup conversationally. You can also ask about a routine’s recent runs. Alias: /routines |
| `/scroll-speed` | Adjust mouse wheel scroll speed interactively. Available in fullscreen rendering only and not in the JetBrains IDE terminal |
| `/security-review` | Analyze the changes on your current branch for security vulnerabilities. Reviews the diff between your branch and origin’s default branch, identifying risks like injection, auth issues, and data exposure. Needs an origin remote; if the review fails with an ambiguous argument error, see the error reference |
| `/setup-bedrock` | Configure Amazon Bedrock authentication, region, and model pins through an interactive wizard. Hidden from the command menu until CLAUDE_CODE_USE_BEDROCK=1 is set; type it in full. First-time Amazon Bedrock users can also access this wizard from the login screen |
| `/setup-vertex` | Configure Google Cloud’s Agent Platform authentication, project, region, and model pins through an interactive wizard. Hidden from the command menu until CLAUDE_CODE_USE_VERTEX=1 is set; type it in full. First-time Google Cloud’s Agent Platform users can also access this wizard from the login screen |
| `/simplify [target]` | Skill. Review the changed code for cleanup opportunities and apply the fixes. Four review agents run in parallel, covering reuse of existing helpers, simplification, efficiency, and whether the change is at the right level of abstraction. The review doesn’t look for correctness bugs. Use /code-review to find bugs. Pass a path or PR reference to review a specific target |
| `/skill-doctor` | Show what each of your skills costs in context and how often it gets used, so you can find skills to turn off. Requires Claude Code v2.1.252 or later and feature-flag fetching |
| `/skills` | List available skills. Type to filter the list by name, description, or source. Press t to sort by token count, Space or Enter to cycle a skill’s visibility to Claude and the / menu, and Esc to save and close. You can’t cycle plugin skills, skills whose frontmatter sets disable-model-invocation: true, or skills with a skillOverrides entry in managed settings or the --settings flag |
| `/slides [brief]` | Skill. Make a new presentation as a Claude Slides artifact filled from your brief, for example /slides a quarterly review of the platform team. Requires Claude Code v2.1.265 or later, a session where artifacts are available, and an account where the Slides template is available; otherwise the command doesn’t appear. Available on the Anthropic API. On Amazon Bedrock, Google Cloud’s Agent Platform, Microsoft Foundry, and Claude Platform on AWS, artifacts aren’t available, so the command is unavailable there |
| `/stats` | Alias for /usage. Opens on the Stats tab |
| `/status` | Open the Settings interface on the Status tab, showing version, model, account, and connectivity. A Session kind row reads background job · attached or background job · unattended in a background session, depending on whether a terminal is attached, and interactive in any other session. Before v2.1.221, /status didn’t show this row. Works while Claude is responding |
| `/statusline` | Configure Claude Code’s status line. Describe what you want, or run without arguments to auto-configure from your shell prompt |
| `/stickers` | Order Claude Code stickers |
| `/stop` | Stop the background session you’re attached to, or the one you send it to as a peek reply; the transcript and any worktree are kept. To detach without stopping, use /exit or press ← |
| `/subtask <task>` | Spawn a forked subagent: a background subagent that inherits the full conversation and works on the task while you keep working. Its result returns to this conversation when it finishes. To copy the conversation into a separate background session instead, use /fork. Requires Claude Code v2.1.212 or later; on v2.1.161 through v2.1.211 this command is /fork. When agent view is turned off, /subtask isn’t available and /fork keeps the forked-subagent behavior |
| `/tasks` | View and manage background work in the current session, including subagents that have finished. Also available as /bashes |
| `/team-onboarding` | Generate a team onboarding guide from your Claude Code usage history. Claude analyzes your sessions, commands, and MCP server usage from the past 30 days and produces a markdown guide a teammate can paste as a first message to get set up quickly. For claude.ai subscribers on Pro, Max, Team, and Enterprise plans, also returns a share link teammates can open directly in Claude Code |
| `/teleport` | Pull a cloud session into this terminal. Opens a picker, then fetches the branch and conversation. Also available as /tp. Requires a claude.ai subscription |
| `/terminal-setup` | Install a Shift+Enter keybinding for newlines in VS Code, Cursor, Devin Desktop, Alacritty, or Zed. In Apple Terminal, enable Option+Enter for newlines and turn off the audible bell instead. In iTerm2, turn on clipboard access so that /copy works |
| `/theme` | Change the color theme. Includes an auto option that matches your terminal’s light or dark background, light and dark variants, colorblind-accessible (daltonized) themes, ANSI themes that use your terminal’s color palette, and any custom themes from ~/.claude/themes/ or plugins. Select New custom theme… to create one |
| `/tui [default\|fullscreen]` | Set the terminal UI renderer and relaunch into it with your conversation intact. fullscreen enables the flicker-free alt-screen renderer. With no argument, prints the active renderer |
| `/ultraplan <prompt>` | Removed. Use plan mode instead. Previously sent a planning task to a cloud session for review in your browser |
| `/ultrareview [PR or branch]` | Run a deep, multi-agent code review in a cloud sandbox with ultrareview. Pass a PR reference to review that pull request, or a base branch or commit to change the comparison base. The preferred invocation is /code-review ultra, and /ultrareview is an alias. Includes 3 free runs on Pro and Max, then requires usage credits |
| `/update-config [request]` | Skill. Describe a settings change, such as allowing a command, setting an environment variable, or adding a hook, and Claude edits the matching settings.json file. For options such as theme and model, use /config instead |
| `/upgrade` | Open the upgrade page in your browser to switch to a higher plan tier. When the browser fails to open, the command shows a sign-in prompt without printing the URL |
| `/usage` | Show session cost, plan usage limits, and activity stats. On a Pro, Max, Team, or Enterprise plan, includes a breakdown of what counts against your plan limits. /cost and /stats are aliases |
| `/usage-credits` | Configure usage credits, or request them from your admin, when you hit a limit. Opens your usage-credits billing settings in the browser, except that Team and Enterprise members without billing access instead send a usage-credits request to their admin from the CLI, after confirming in a dialog that the request notifies their admins. When no browser can open the billing page, for example over SSH, the command prints the URL to visit instead; this requires Claude Code v2.1.205 or later, and earlier versions showed nothing in that case. Previously /extra-usage |
| `/verify` | Skill. Confirm a code change does what it should by building your project’s app, running it, and observing the result, rather than relying on tests or type checks. See Run and verify your app |
| `/vim` | Removed in v2.1.92. To toggle between Vim and Normal editing modes, use /config → Editor mode |
| `/voice [hold\|tap\|off]` | Toggle voice dictation, or enable it in a specific mode. Requires a Claude.ai account |
| `/web-setup` | Connect your GitHub account for cloud sessions using your local gh CLI credentials |
| `/workflow-authoring` | Skill. Load the reference for writing dynamic workflow scripts: the script API, resume behavior, quality patterns, and worked examples. Claude normally loads it on its own before writing a script; run it yourself before editing a saved script by hand. Available when dynamic workflows are enabled, and requires Claude Code v2.1.248 or later |
| `/workflows` | Open the workflow progress view to watch, pause, resume, or save running and completed workflows |

### 不能从旧教程直接抄的例子

- `/ultraplan` 已移除，应使用 `/plan`。
- `/pr-comments` 已移除，改为直接让 Claude 查看 PR/MR 评论。
- `/vim` 已移除，使用 `/config` → Editor mode 或 `editorMode`。
- `/extra-usage` 已改名为 `/usage-credits`。
- `/review` 现在是 `/code-review` 的别名；深度云审查优先使用 `/code-review ultra`。
- `/fork` 与 `/subtask` 在新版本中分工不同：前者复制到独立后台会话，后者把 forked subagent 结果回传当前会话。

---

## 七、重点命令的中文速查

### 会话和上下文

```text
/config [key=value ...]   设置主题、模型、输出风格等
/model [model]            切换模型；s 只切当前会话
/effort [level|auto]      调整 effort；支持 ultracode
/autocompact [tokens]     设置当前模型的压缩窗口
/context [all]            检查上下文用量
/compact [instructions]   压缩上下文
/clear [name]             开始空会话
/resume [session]         恢复会话
/rewind                   回到对话或代码检查点
/export [filename]        导出纯文本转录
```

### 研究、实现、审查

```text
/plan [description]       进入计划模式
/deep-research <question> 多角度搜索并交叉核验来源
/batch <instruction>      拆分 5～30 个独立单元并行执行
/run <command>            启动应用/命令并观察结果
/verify [target]          构建、启动并实际验证
/code-review [level]      审查 diff、PR 或分支
/security-review           查安全风险
/simplify [target]        查重复和不必要复杂度
```

### 并行和会话

```text
/background [prompt]      当前会话后台运行
/fork [prompt]            复制成新的后台会话
/subtask <task>           forked subagent，结果回主会话
/agents                   管理 subagent 定义提示
/list-agents              列出可通信会话/teammate
/tasks                    管理当前后台任务
/workflows                查看 workflow 进度
/goal [condition|clear]   跨 turn 持续到目标完成
```

### 扩展与连接

```text
/mcp [reconnect|enable|disable] 管理 MCP server
/skills                   查看 Skill、成本和可见性
/plugin [subcommand]      安装、启用、配置 Plugin
/reload-plugins           热加载 Plugin
/hooks                    查看 Hook 配置
/import [codex|gemini|cursor] 导入其他 CLI 配置
/ide                      管理 IDE 集成
```

---

## 八、遇到英文界面时的三步判断法

1. **先看来源**：built-in、Skill、Plugin、MCP 还是 Agent。
2. **再看状态**：connected、deferred、failed、running、blocked、waiting 的含义不同。
3. **最后看动作**：它是查看、读取、写文件、执行命令、访问外部服务，还是请求权限。

不要仅凭颜色或图标判断安全性；展开详细转录，确认完整路径、命令、参数和权限规则。

---

## 九、常见排错流程

### 命令显示 Unknown command

```text
claude --version
/help
```

再检查命令是否是旧版本、插件命令、MCP prompt、被 `--disable-slash-commands` 关闭，或因组织策略/Provider 不可用。`/help` 和官方 Commands 页都没有时，不要继续尝试旧别名。

### Skill 列表为空或数量突然变化

检查作用域、front matter、`skillOverrides`、Plugin 是否启用、是否处于 `--safe-mode`/`--bare`、是否禁用了 feature flags 或 Claude.ai 同步。运行 `/doctor`、`/skill-doctor`，必要时重启或 `/reload-skills`。

### Plugin 载入失败

```text
/plugin errors
claude plugin validate ./my-plugin
claude plugin list --json
/reload-plugins
```

确认 manifest、依赖版本、hook 退出码、MCP 连接和 marketplace policy。

### MCP failed 或认证循环

```text
/mcp reconnect <server>
claude --debug=mcp
```

不要先删除 `~/.claude.json`。先检查 OAuth 缓存、环境变量、URL、stdio 进程输出、组织 allow/deny 和服务器日志。

### 后台 agent 一直等待

查看 `/tasks`、`/agents`，确认是等待工具权限、等待用户问题、被 usage limit 暂停，还是 subagent 本身失败。可用 `/stop` 停止并保留 transcript，用 `/resume` 重新连接。

### 输出太多、上下文迅速上涨

先 `/focus` 或 `/context`，再关闭不用的 MCP/Skill；把研究交给 subagent；在阶段边界 `/compact`。不要用 `--verbose` 作为日常模式，它适合排障和 headless stream-json。

---

## 十、建议的安装后检查清单

```text
1. claude --version 与 npm/原生安装来源一致
2. /status 能说明当前 provider、模型和凭据来源
3. /context 能看到预期 CLAUDE.md/rules/memory
4. /mcp 只启用必要 server，并能成功调用一个工具
5. /skills 能看到需要的 Skill，成本可接受
6. /plugin Errors 为空或每条错误都已理解
7. /permissions 的 allow/ask/deny 符合项目边界
8. 用一个只读任务 + 一个小编辑 + 一个测试完成闭环
```

---

## 十一、参考资料

本文核验日期：2026-10-12；版本快照：Claude Code `2.1.296`。

- 官方 Commands：https://code.claude.com/docs/en/commands
- 官方 CLI Reference：https://code.claude.com/docs/en/cli-reference
- Interactive mode：https://code.claude.com/docs/en/interactive-mode
- Skills：https://code.claude.com/docs/en/skills
- MCP：https://code.claude.com/docs/en/mcp
- Plugins overview：https://code.claude.com/docs/en/plugins/overview
- Plugin CLI reference：https://code.claude.com/docs/en/plugins/cli-reference
- Agent View：https://code.claude.com/docs/en/agent-view
- Permissions：https://code.claude.com/docs/en/permissions
- Changelog：https://code.claude.com/docs/en/changelog
- Claude Code GitHub Releases：https://github.com/anthropics/claude-code/releases

第三方 Skill、MCP server、Plugin 和配置切换器的界面可能不同；排障时永远保留 `claude --version`、`/status`、`/mcp`、`/skills` 和错误日志，方便对照版本与来源。
