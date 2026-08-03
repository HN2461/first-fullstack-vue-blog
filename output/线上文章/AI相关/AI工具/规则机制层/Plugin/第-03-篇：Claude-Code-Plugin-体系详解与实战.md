---
title: "第 03 篇：Claude Code Plugin 体系详解与实战"
slug: "ai-plugin-claudecode-claudecodeplugin-ed613976"
summary: "深入解析 Claude Code Plugin 的定位、scope、官方与社区 marketplace、manifest 规则、`/plugin` 命令族，以及前端开发者可以怎样把 Skills、Commands、Hooks、MCP 等能力打包成可安装插件。"
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
updatedAt: "2026-07-31T11:16:25.215Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 03 篇：Claude Code Plugin 体系详解与实战

> 资料来源：Claude Code 官方《Create plugins》文档与 Anthropic 官方 / 社区 marketplace 仓库。2026-07-04 按官方文档重新校对命令、Marketplace 与 manifest 规则。

[[toc]]

---

## 一、先把定位说准：Plugin 是“打包层”

为了方便理解 Claude Code 的扩展体系，你可以把常见扩展面粗分成几类：

- `CLAUDE.md`：规则与上下文偏好
- Hooks：事件触发的自动化
- Skills：任务流程模板
- MCP：外部能力接入
- Subagents：并行或专责代理
- Plugin：把多种能力组织成可安装单元
- Memory / settings：跨会话偏好与配置

这里最关键的一句是：

> **Plugin 不是新的底层能力，而是把已有能力按 Claude Code 认可的方式打包、安装、启用、禁用和更新。**

也就是说，Claude Code 的 Plugin 更像：

- 一个可安装包
- 一个带 scope 的配置对象
- 一个能挂接 marketplace 的分发单元

而不是单独取代 Skill、Hooks、MCP 或 Subagent。

---

## 二、一个 Claude Code Plugin 现在可以包含什么

你的原稿里把 Claude Code Plugin 写成只能包含五类能力，这已经偏窄了。按当前官方文档，更稳妥的说法是：

Claude Code Plugin 可以组织的内容至少包括：

- Skills
- Slash Commands
- Subagents
- Hooks
- MCP servers
- LSP servers
- Monitors
- Themes
- Output styles
- Bin executables
- Settings

也就是说，Plugin 在 Claude Code 里更像一个**统一插件容器**。

一个更贴近当前文档的抽象结构示意：

```text
my-claude-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
├── commands/
├── agents/
├── hooks/
├── .mcp.json
├── lsp/
├── monitors/
├── themes/
└── settings/
```

不是每个插件都会同时拥有这些目录，但它说明了 Claude Code 的插件系统已经不是"只打包几个 markdown 文件"那么简单。

---

## 三、Claude Code 的安装 scope 现在怎么理解

这是官方文档里非常明确、而社区文章经常略过的一块。

Claude Code 的 Plugin 使用和其他配置一样，走统一 scope 体系：

| Scope | 配置文件 | 适用场景 |
| --- | --- | --- |
| `user` | `~/.claude/settings.json` | 个人插件，所有项目可用 |
| `project` | `.claude/settings.json` | 团队共享，进入版本控制 |
| `local` | `.claude/settings.local.json` | 仅本地项目使用，通常 gitignore |
| `managed` | managed settings | 受管环境中的只读插件配置 |

这一点会直接影响你怎么写团队落地建议：

- 想全局自用 -> `user`
- 想团队统一 -> `project`
- 想只在自己机器对当前仓库试验 -> `local`
- 企业或平台托管 -> `managed`

所以别再把 Claude Code 插件只理解成"装到某个固定目录里"。**它本质上还是一组带 scope 的配置与组件。**

---

## 四、Marketplace 现在分哪几类

这一块比原稿写得要丰富，而且官方名称非常具体。

### 4.1 官方 marketplace：`claude-plugins-official`

官方文档明确写到：

- 官方 Anthropic marketplace 名叫 **`claude-plugins-official`**
- 它在 Claude Code 启动时会自动可用
- 可以在 `/plugin` 的 **Discover** 标签里浏览
- 也可以去 `claude.com/plugins` 看目录

安装官方插件的示意写法是：

```bash
/plugin install github@claude-plugins-official
```

### 4.2 社区 marketplace：`anthropics/claude-plugins-community`

官方文档同时给出了社区市场：

- 仓库是 `anthropics/claude-plugins-community`
- 托管第三方插件
- 会经过自动校验与安全筛查
- catalog 中每个插件会 pin 到特定 commit SHA

这比"有个社区仓库"的说法精确得多，也比你原稿中的 `anthropics/claude-code-plugins` 更接近当前官方口径。

### 4.3 demo marketplace：`anthropics/claude-code`

官方还提供一个 demo marketplace：

- 来源仓库是 `anthropics/claude-code`
- 其中 `plugins/` 目录展示示例插件
- 更偏"演示能力边界"和"给开发者看怎么做"

所以更稳妥的区分方式是：

| 类型 | 名称 / 来源 | 用途 |
| --- | --- | --- |
| 官方 | `claude-plugins-official` | 正式官方插件目录 |
| 社区 | `anthropics/claude-plugins-community` | 第三方插件市场 |
| Demo | `anthropics/claude-code` | 官方示例与演示 |

---

## 五、`/plugin` 命令族现在怎么写才不误导

你原稿里写的命令表有一部分方向是对的，但细节有两个问题：

1. 少了 `enable` / `disable`
2. 把 `status` 写成了主命令，而官方现在更接近 `details`

结合当前官方文档，更稳妥的常用命令表如下：

| 命令 | 作用 |
| --- | --- |
| `/plugin` | 打开插件界面，浏览 Discover / 已安装插件等 |
| `/plugin install <name>` | 安装插件 |
| `/plugin uninstall <name>` | 卸载插件 |
| `/plugin enable <name>` | 启用插件 |
| `/plugin disable <name>` | 禁用插件 |
| `/plugin list` | 列出插件 |
| `/plugin details <name>` | 查看插件详情 |
| `/plugin marketplace add <source>` | 添加 marketplace |
| `/plugin marketplace list` | 查看已添加 marketplace |
| `/plugin marketplace update <name>` | 更新 marketplace |
| `/plugin marketplace remove <name>` | 移除 marketplace |

另外，Claude Code 也有 CLI 形式的 `claude plugin ...` 命令族。写文章时，最好明确区分：

- **交互式 TUI / slash command**
- **CLI 形式**

不要把两个入口混成一句"就用 /plugin"。

---

## 六、手动安装与添加源，官方现在支持到什么程度

Claude Code 官方文档对安装源的说明比很多二手文章要细：

- 可以从官方 marketplace 安装
- 可以手动添加 community / demo marketplace
- 可以 **add from local paths**
- 也支持添加远程 URL

所以更稳妥的安装思路是：

### 6.1 安装官方插件

```bash
/plugin install github@claude-plugins-official
```

### 6.2 添加社区 marketplace

```bash
/plugin marketplace add anthropics/claude-plugins-community
```

### 6.3 添加 demo marketplace

```bash
/plugin marketplace add anthropics/claude-code
```

### 6.4 本地路径开发与试装

如果你在本地开发插件，可以直接通过本地路径加入或安装，这对团队内试运行非常有用。

这也是为什么 Claude Code 的插件系统会比"把几个 Skill 手动放目录里"更完整：它不只是支持内容复用，还支持**官方市场、社区市场、本地路径、远程源**几种不同分发路线。

---

## 七、`.claude-plugin/plugin.json` 现在要怎么讲

这是本文里最需要纠正的一块之一。

### 7.1 manifest 不是必需文件

官方文档当前明确写到：

> `.claude-plugin/plugin.json` 是可选的。

如果你不写 manifest：

- Claude Code 会按默认位置自动发现组件
- 插件名会从目录名推导

也就是说，你不能再把 Claude Code 写成"每个插件根目录必须有 `plugin.json`"。

### 7.2 如果写 manifest，唯一必填字段是 `name`

官方文档当前明确写到：

> If you include a manifest, `name` is the only required field.

因此更稳妥的最小示例应该是：

```json
{
  "name": "frontend-dev-toolkit"
}
```

而不是你原稿里的 `name + version + description` 三项全必填。

### 7.3 `version` 是可选的

官方文档还明确说明：

- `version` 可选
- 如果省略，Claude Code 会回退到 **git commit SHA**
- 这意味着每个提交都可能被视为一个新版本

因此更稳妥的字段理解是：

| 字段 | 当前更稳妥的说明 |
| --- | --- |
| `name` | 如果写 manifest，这是唯一必填字段 |
| `version` | 可选；省略时回退到 git commit SHA |
| `description` | 可选说明字段 |
| `author` 等元信息 | 可选 |
| 自定义组件路径 | 在需要时可提供 |

### 7.4 什么时候应该写 manifest

如果你只是按默认结构写一个简单插件，manifest 甚至可以不写。

更适合写 manifest 的情况是：

- 需要显式元信息
- 需要自定义路径
- 需要更稳定的版本控制
- 需要让插件在 marketplace / 团队分发中更清晰可识别

---

## 八、前端开发者实际可以怎么用 Claude Code Plugin

这一部分你的方向是对的，我把口径收紧一下。

### 8.1 组件开发工具包

一个前端团队可以把以下内容打成插件：

- `/create-component` 命令
- 组件生成 Skill
- 组件审查 Subagent
- ESLint / 测试 Hook
- Figma / GitHub / 文档类 MCP 集成

这样插件装上后，团队成员拿到的不只是"一个命令"，而是一套能协作的前端生产流。

### 8.2 代码审查工作流

适合打成插件的组合包括：

- `/review-pr`
- PR 审查 Skill
- reviewer subagent
- GitHub MCP
- 提交前检查 Hook

### 8.3 部署与发布工作流

如果你的流程里同时涉及：

- 部署命令
- 环境检查 Skill
- 平台集成
- 审批或通知逻辑

它就已经很像一个 Plugin，而不只是"再多写一个 markdown 命令"。

---

## 九、Claude Code Plugin 当前更稳妥的结论

### 9.1 已经可以明确说对的

- Claude Code 官方支持插件体系
- 官方 marketplace 名叫 `claude-plugins-official`
- 社区 marketplace 是 `anthropics/claude-plugins-community`
- demo marketplace 来源是 `anthropics/claude-code`
- 插件支持 user / project / local / managed scope
- `.claude-plugin/plugin.json` 是可选文件
- 如果写 manifest，`name` 是唯一必填字段
- `version` 可省略，省略时回退到 git commit SHA

### 9.2 不要再写成定论的

- "每个 Claude Code 插件都必须有 plugin.json"
- "最小 manifest 必须包含 `name/version/description`"
- "官方 marketplace 仓库叫 `anthropics/claude-code-plugins`"
- "`/plugin status` 是主命令"
- "Plugin 只能包含五类能力"

### 9.3 给读者的实操建议

1. 先从官方 marketplace 装 1 个插件体验
2. 再理解 scope，决定是装到 `user`、`project` 还是 `local`
3. 自己开发插件时，先按默认目录结构跑通，再决定要不要补 manifest

---

## 十、参考资料

- [Claude Code: Create plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code: Skills](https://code.claude.com/docs/en/skills)
- [Anthropic 官方 marketplace：claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- [Anthropic 社区 marketplace：claude-plugins-community](https://github.com/anthropics/claude-plugins-community)
- [Anthropic Claude Code 仓库中的 demo plugins](https://github.com/anthropics/claude-code/tree/main/plugins)
