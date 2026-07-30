---
title: "第二篇：Codex Plugin 体系详解与实战"
slug: "ai-plugin-codex-codexplugin-9b9edb10"
summary: "深入解析 Codex Plugin 的目录结构、manifest 形态、官方 `openai/plugins` 仓库、本机实装目录，以及 `codex plugin marketplace` 的配置与管理方式，帮助开发者更稳地理解 Codex 插件体系。"
category: "Plugin"
tags:
  - "Plugin"
  - "Codex"
  - "OpenAI"
  - "Marketplace"
  - "plugin.json"
  - ".codex-plugin"
  - "技能包"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabfd6"
originalSlug: "ai-plugin-codex-codexplugin-9b9edb10"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第二篇：Codex Plugin 体系详解与实战

> 资料来源：OpenAI Academy、OpenAI Codex 官方文档、OpenAI Codex 官方产品页、`openai/plugins` 官方仓库、本机 `~/.codex/plugins/` 与 `~/.codex/config.toml` 实装。2026-07-04 按官方口径与本机行为重校。

[[toc]]

---

## 一、Codex Plugin 的发布背景

OpenAI 已经把 Plugin 作为 Codex 的正式能力之一来描述。

当前可以直接对应官方资料的几条口径：

- OpenAI Academy 明确把 **Plugins** 和 **Skills** 并列介绍
- OpenAI 产品页写明：Codex 已被 **300 万+ 开发者每周使用**
- 同一产品页写明：Codex 当前已有 **90+ additional plugins**

这意味着 Codex 的插件体系已经不是"零散试验"，而是被放进官方产品叙事里的正式扩展层。

从工程角度看，Codex Plugin 的定位可以概括为：

- 把 Skill、应用集成、MCP 配置和其他配套资源组织成可安装单元
- 让插件能被 marketplace / 配置系统识别和管理
- 把"个人机器上的能力目录"升级成"可分发的能力包"

---

## 二、Codex 官方如何区分 Plugin 与 Skill

OpenAI 官方对两者的区分很值得单独拎出来：

| 维度 | Skill | Plugin |
| --- | --- | --- |
| **更像什么** | 单一代码库或工作流里的方法模板 | 可安装、可复用的更广义能力包 |
| **使用范围** | 更偏个人、本地、具体任务 | 更偏团队、共享、跨项目 |
| **包含内容** | `SKILL.md` 与辅助资源 | 一个或多个 skill，加上应用或配置层 |
| **分发方式** | 更像内容复用 | 更像原生安装和 marketplace 复用 |

这也是为什么你写这组文章时，不能把两者简单写成"只是名字不同"。**Skill 更偏内容本体，Plugin 更偏打包与分发。**

---

## 三、Codex Plugin 的实际目录长什么样

### 3.1 本机已安装插件目录

当前本机能看到的已安装官方插件在：

```text
~/.codex/plugins/
└── cache/
    └── openai-primary-runtime/
        ├── documents/
        ├── presentations/
        └── spreadsheets/
```

其中 `documents` 的实际结构大致如下：

```text
~/.codex/plugins/cache/openai-primary-runtime/documents/26.521.10419/
├── .codex-plugin/
│   └── plugin.json
├── assets/
│   ├── icon.png
│   └── logo.png
├── README.md
└── skills/
    └── documents/
        ├── agents/
        │   └── openai.yaml
        ├── assets/
        ├── examples/
        ├── ooxml/
        ├── references/
        ├── scripts/
        ├── tasks/
        ├── troubleshooting/
        ├── render_docx.py
        └── SKILL.md
```

从这个实装结构里，至少能确认几件事：

1. **Codex Plugin 不是只有一个 manifest 文件**，而是完整目录包
2. **一个 Plugin 可以内含 skill 目录**，skill 仍然是具体工作流的主体
3. **安装后会落到本地缓存目录**，而不是只存在远端
4. **插件具备版本目录**，例如 `26.521.10419`

### 3.2 `openai/plugins` 官方仓库给出的结构线索

`openai/plugins` 官方仓库 README 写得很清楚：

- 每个插件都需要 `.codex-plugin/plugin.json`
- 可选的伴随结构包括：
  - `skills/`
  - `.app.json`
  - `.mcp.json`
  - plugin-level `agents/`
  - `commands/`
  - `hooks.json`
  - `assets/`

这条信息非常关键，因为它比"社区文章里的猜测字段"更权威，也更贴近当前实际形态。

---

## 四、`.codex-plugin/plugin.json` 现在到底长什么样

### 4.1 本机官方插件真实示例

`documents` 插件本机 manifest 的核心内容是：

```json
{
  "name": "documents",
  "version": "26.521.10419",
  "description": "Create and edit document artifacts in Codex, including Word files and Google Docs.",
  "author": {
    "name": "OpenAI",
    "email": "support@openai.com",
    "url": "https://openai.com/"
  },
  "homepage": "https://openai.com/",
  "repository": "https://github.com/openai/openai",
  "license": "MIT",
  "keywords": ["doc", "docs", "document"],
  "skills": "./skills/",
  "interface": {
    "displayName": "Documents",
    "shortDescription": "Create and edit document artifacts",
    "category": "Productivity",
    "capabilities": ["Interactive", "Write"],
    "composerIcon": "./assets/icon.png",
    "logo": "./assets/logo.png"
  }
}
```

### 4.2 现在更稳妥的字段判断

结合本机官方插件和 `openai/plugins` 官方仓库，当前更稳妥的判断是：

| 字段 | 当前能确认什么 |
| --- | --- |
| `name` | 插件标识符，官方插件都显式提供 |
| `version` | 官方插件显式提供，不一定必须是 semver，也可能是运行时版本号 |
| `description` | 官方插件显式提供 |
| `skills` | 当前官方插件常见写法是指向 `./skills/` |
| `interface` | 当前 Codex 插件里很重要，用于显示名、图标、分类、默认提示等 UI / 产品元信息 |
| `author` / `homepage` / `repository` / `license` / `keywords` | 官方插件中也常见 |
| `apps` | 在部分插件里出现，例如 `slack`、`notion` 这类集成型插件会指向 `./.app.json` |

这里要特别注意两点：

1. **不要把你自己举的完整 JSON 示例当成官方 schema**
2. **不要把 Codex 的 `plugin.json` 误写成和 Claude Code 完全同一套字段**

Codex 当前更明显的特征是：它把 plugin-level 的产品展示信息直接放在 `interface` 字段里。

### 4.3 `agents/openai.yaml` 应该怎么理解

在已安装 skill 目录里，你还能看到 `skills/<name>/agents/openai.yaml`。例如：

```yaml
interface:
  display_name: "Documents"
  short_description: "Create and edit Word and Google Docs files"
  icon_small: "./assets/file-document.png"
  icon_large: "./assets/file-document.png"
  brand_color: "#2563EB"
```

更稳妥的理解方式是：

- 它确实承担了展示层 / 发现层信息
- 但它**不是**你能对外宣称的"所有 Codex Plugin 的唯一标准入口"
- 真正对插件打包最关键、最稳定的还是 `.codex-plugin/plugin.json`

换句话说：

> `openai.yaml` 更像运行时或 skill 侧附属元信息，`plugin.json` 才是插件包级别的正式 manifest。

---

## 五、Codex 的 marketplace 现在应该怎么理解

这一块最容易被社区文章写乱。

### 5.1 官方仓库、已安装插件、用户配置不是一回事

它们至少是三层不同概念：

1. **插件仓库内容本身**
   例如 `openai/plugins` 仓库，里面每个插件目录都包含 `.codex-plugin/plugin.json`
2. **安装到本机后的缓存内容**
   例如 `~/.codex/plugins/cache/openai-primary-runtime/...`
3. **用户本机对 marketplace 和插件启用状态的配置**
   例如 `~/.codex/config.toml`

本机 `config.toml` 里当前能看到：

```toml
[marketplaces.openai-primary-runtime]
last_updated = "2026-07-04T13:52:43Z"
source_type = "local"
source = '\\?\C:\Users\HN246\.cache\codex-runtimes\codex-primary-runtime\plugins\openai-primary-runtime'

[plugins."documents@openai-primary-runtime"]
enabled = true
```

这说明：

- marketplace 的配置持久化在 **`~/.codex/config.toml`**
- 插件启用状态也记录在 **`~/.codex/config.toml`**
- 文章里不该把用户侧配置路径写成 `~/.agents/plugins/marketplace.json`

### 5.2 `.agents/plugins/marketplace.json` 是什么

在 `openai/plugins` 仓库内部，确实能看到类似：

```text
.agents/plugins/marketplace.json
```

但它更像是**marketplace 仓库自身的目录与 catalog 文件结构**，不是你个人机器上日常持久化配置 marketplace 的主路径。

这一点一定要和用户侧配置区分开。

### 5.3 `codex plugin marketplace` CLI 现在能做什么

本机 `codex plugin --help` 和 `codex plugin marketplace --help` 能确认当前 CLI 明确提供：

- `codex plugin marketplace add <SOURCE>`
- `codex plugin marketplace upgrade [MARKETPLACE_NAME]`
- `codex plugin marketplace remove <MARKETPLACE_NAME>`

而且 `add` 的帮助信息明确写了 `SOURCE` 支持：

- `owner/repo[@ref]`
- HTTP(S) Git URL
- SSH URL
- 本地目录

这意味着一个重要结论：

> **当前 Codex 不是“只能本地路径装社区插件”。至少在 marketplace source 这一层，它已经支持 GitHub / Git URL / SSH / local directory。**

### 5.4 现在不要再写成“Marketplace 三级分发”

把 Codex 直接概括成"官方 / 项目 / 用户三级 marketplace"容易误导，原因是：

- 官方文档和本机行为更直接体现的是 **marketplace source + config.toml 持久化**
- `.agents/plugins/marketplace.json` 更像仓库内部 catalog 文件，而不是统一用户配置路径
- CLI 当前明确暴露的是 **marketplace 管理命令**，不是你文里原来那套 `/plugin install` 斜杠命令体系

更稳妥的写法应该是：

- **官方 curated marketplace / runtime**
- **用户添加的 marketplace sources**
- **每个 marketplace 源内部自己的 catalog 结构**

---

## 六、Codex 的插件安装与管理，哪些是“确认过”的

### 6.1 已确认的管理入口

当前我能通过本机 CLI 确认的，是 marketplace 管理能力：

```bash
codex plugin marketplace add <SOURCE>
codex plugin marketplace upgrade
codex plugin marketplace remove <MARKETPLACE_NAME>
```

这部分是硬事实，因为 `--help` 就能直接看到。

### 6.2 不要再写成 `/plugin install`

你原稿里最需要修正的点之一，就是把 Codex 写成：

```bash
/plugin install documents
/plugin status documents
```

但本机 `codex --help` / `codex plugin --help` 并没有暴露这套斜杠命令为 Codex CLI 主入口。更稳妥的表述应该是：

- **Codex CLI 明确提供的是 marketplace 管理命令**
- **插件的发现、启用、实际使用会体现在应用内 / 运行时 / 配置文件中**
- **不要把 Claude Code 的 `/plugin ...` 直接套到 Codex 上**

### 6.3 现在更适合怎么教读者

如果是写给读者的实操建议，推荐这样说：

1. 先理解插件包结构和 manifest
2. 再看 `~/.codex/config.toml` 中 marketplace 与 plugins 的记录方式
3. 通过 `codex plugin marketplace add ...` 管理插件源
4. 结合运行时已安装插件目录，理解插件真正落到了哪里

这样更贴近当前 Codex 的真实行为。

---

## 七、从本机实装理解 Codex Plugin 的工作方式

以 `Documents` 插件为例，安装后你并不只是得到一个名字，而是得到一整套可调用的工作流资源：

| 能力 | 来源 | 说明 |
| --- | --- | --- |
| 文档工作流定义 | `skills/documents/SKILL.md` | 负责什么时候用、怎么做 |
| 辅助脚本 | `skills/documents/scripts/` | 包含大量 Python / 处理脚本 |
| 任务模板 | `skills/documents/tasks/` | 把常见任务拆成更细的操作说明 |
| 参考资料 | `skills/documents/references/` | 作为稳定的内部参考 |
| OOXML 细节说明 | `skills/documents/ooxml/` | 负责底层格式处理 |
| 显示元信息 | `plugin.json` 与 `agents/openai.yaml` | 控制发现、展示和提示语 |

更有意思的是，`Documents` skill 还会引用其他插件能力。例如它会引导使用 Google Drive 插件完成 Google Docs 原生导入。这说明：

> **Codex Plugin 不是孤岛，它可以与其他插件和应用能力形成协作网络。**

---

## 八、Codex Plugin 当前更稳妥的结论

### 8.1 已经可以明确说对的

- Codex 官方支持插件体系
- 官方存在 `.codex-plugin/plugin.json`
- 官方存在 `openai/plugins` 仓库
- 本机有 `~/.codex/plugins/cache/` 安装缓存目录
- marketplace 与插件启用状态会写入 `~/.codex/config.toml`
- `codex plugin marketplace add` 支持 GitHub、Git URL、SSH 与本地目录源

### 8.2 不建议再写成定论的

- "Codex 用 `/plugin install` 管理插件"
- "社区插件只能本地路径安装"
- "Marketplace 明确分官方 / 项目 / 用户三级，且路径就是 `~/.agents/plugins/marketplace.json`"
- "manifest 必填字段只有 `name/version/description`，其他字段是固定 schema"

### 8.3 面向读者的实操建议

1. **先看官方仓库**
   从 `openai/plugins` 理解插件包的组成，而不是先看二手博客
2. **再看本机实装**
   用 `~/.codex/plugins/cache/` 对照官方目录，理解安装结果
3. **最后看配置**
   用 `~/.codex/config.toml` 观察 marketplace 源和插件启用状态

---

## 九、参考资料

- [OpenAI Academy: Codex Plugins and Skills](https://openai.com/academy/codex-plugins-and-skills/)
- [OpenAI: Codex for almost everything](https://openai.com/index/codex-for-almost-everything/)
- [OpenAI Plugins 官方仓库](https://github.com/openai/plugins)
- [OpenAI Codex 官方仓库](https://github.com/openai/codex)
- 本机 `~/.codex/plugins/cache/openai-primary-runtime/` 实装目录
- 本机 `~/.codex/config.toml` marketplace 与 plugins 配置
