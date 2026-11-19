---
title: "第 02 篇：Codex Plugin 体系详解与实战"
slug: "ai-plugin-codex-codexplugin-9b9edb10"
summary: "依据 2026-11-18 OpenAI 官方插件仓库与 CLI 实现，讲解 Codex manifest、marketplace、plugin add/list/remove、技能包制作和团队安装验证。"
category: "Plugin"
categoryPath:
  - "AI相关"
  - "AI工具"
  - "规则机制层"
  - "Plugin"
tags:
  - "Plugin"
  - "Codex"
  - "OpenAI"
  - "Marketplace"
  - "plugin.json"
  - ".codex-plugin"
  - "技能包"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cabfd6"
originalSlug: "ai-plugin-codex-codexplugin-9b9edb10"
originalStatus: "published"
publishedAt: "2026-05-24T14:22:01.415Z"
updatedAt: "2026-10-30T15:00:00.000Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---
# 第 02 篇：Codex Plugin 体系详解与实战

> 核验日期：2026-11-18。本次以 OpenAI 官方 `openai/plugins` 示例仓库和 `openai/codex` 的 CLI 实现为依据。文档站请求返回 403；仓库 `main` 的能力需与已安装版本的 `--help` 对照。

[[toc]]

## 一、Plugin 为工作流提供安装与分发边界

Codex Plugin 可以把技能、MCP、应用集成、命令、代理、hooks 和配套资源组织成一个可安装单元。单个 `SKILL.md` 描述任务流程，插件则负责让这套流程及依赖一起被发现和管理。

以团队前端工作流为例：组件设计 Skill 说明实现步骤，浏览器测试 Skill 规定验证方法，MCP 接入外部设计资料，插件统一提供这些内容。账号授权、运行环境和执行权限仍由客户端与组织配置决定，安装插件不等于自动授权所有操作。

## 二、官方仓库的实际结构

`openai/plugins` README 当前明确要求每个示例插件具备 `.codex-plugin/plugin.json`：

```text
plugins/team-review/
├── .codex-plugin/
│   └── plugin.json
├── skills/
│   └── review-pr/
│       ├── SKILL.md
│       └── references/checklist.md
├── agents/          # 可选：插件级代理
├── commands/        # 可选
├── hooks.json       # 可选
├── .mcp.json        # 可选：MCP 配置
├── .app.json        # 可选：应用集成
└── assets/          # 可选：图标、模板等
```

不要因为本机缓存中出现 `openai-primary-runtime/<name>/<version>`，就要求所有用户把插件手动复制进去。缓存由客户端管理，可能随产品、版本和来源变化；应通过原生安装入口加载。

另一个需要区分的概念是 Agent Plugins 开放格式，其核心 manifest 位于根目录 `plugin.json`。本节描述 OpenAI 仓库当前使用的 Codex 专属结构，不能仅改一个文件名就假设完成格式转换。

## 三、manifest：从可核对的官方示例开始

官方 `build-web-apps` 示例包含 `name`、`version`、`description`、`skills` 和 `interface` 等字段。下面是按该示例精简的教学版本，并非宣称所有字段都必填：

```json
{
  "name": "team-review",
  "version": "1.0.0",
  "description": "Review project changes using the team's checklist.",
  "skills": "./skills/",
  "interface": {
    "displayName": "Team Review",
    "shortDescription": "Review changes and report regression risks"
  }
}
```

三个容易混淆的位置：

| 文件/目录 | 职责 |
| --- | --- |
| `.codex-plugin/plugin.json` | 插件元数据、组件与界面配置 |
| `skills/<name>/SKILL.md` | 具体技能元信息与任务步骤 |
| 技能中的 `agents/openai.yaml` | Codex 技能适配元数据，属于产品扩展 |

`interface` 不是 Agent Skills Front Matter 的通用标准；技能内部的 `agents/` 也不能直接等同于插件根目录的代理组件。

## 四、marketplace、安装缓存和用户设置

官方仓库目前有两份 catalog：

```text
.agents/plugins/marketplace.json
.agents/plugins/api_marketplace.json
```

前者是默认 marketplace，后者用于 API key 登录用户对应的目录。默认文件本次登记名称为 `openai-curated`；名称属于 catalog 数据，可能与客户端预置源、API key 源不同，因此先列出实际 source，再选择插件。

这两份文件是 **发布仓库里的插件索引**。它们不等于用户应自行创建的全局配置文件，也不等于安装缓存。用户端配置与启用状态由客户端维护；复制 catalog 文件到错误目录通常不能完成安装。

## 五、当前 CLI 已包含插件安装、列出和删除

旧版文章仅列 `codex plugin marketplace ...`，现在已不完整。核验的官方 CLI 源码明确包含：

```bash
codex plugin --help
codex plugin marketplace --help
codex plugin marketplace list
codex plugin list
```

插件管理支持以下形式：

```bash
codex plugin add <plugin>@<marketplace>
codex plugin add <plugin> --marketplace <marketplace>
codex plugin remove <plugin>@<marketplace>
```

尖括号是占位符，执行时替换成真实名称，不要原样输入。`plugin list` 当前也提供 JSON 输出及按 marketplace 筛选；以安装版本的帮助信息确认参数。

marketplace 管理与插件管理是不同操作：

```bash
codex plugin marketplace add <source>
codex plugin marketplace list
codex plugin marketplace upgrade <marketplace>
codex plugin marketplace remove <marketplace>
```

`upgrade` 刷新来源快照，不能在没有依据时解释为“所有已安装插件、全部依赖、全部账号连接均已升级”。移除来源与卸载某个插件也应分别理解。

## 六、从官方示例开始安装

支持这些命令的版本可以按以下顺序操作：

```bash
codex plugin marketplace add openai/plugins
codex plugin marketplace list
codex plugin list
```

确认列出的 marketplace 名称和目标插件后，再执行 `codex plugin add`。例如默认 catalog 确实显示为 `openai-curated` 且包含 `build-web-apps` 时：

```bash
codex plugin add build-web-apps@openai-curated
```

API key 登录、组织策略或不同产品入口可能显示另一组可用插件。安装失败时记录具体错误：是源不存在、插件名不匹配、版本缺少命令、组织禁止安装，还是连接器尚未授权。不要通过盲改缓存目录规避这些问题。

## 七、自建一个只含 Skill 的团队插件

先准备上一节的 `team-review` 目录与 manifest，再写 `skills/review-pr/SKILL.md`：

```markdown
---
name: review-pr
description: Review changed code for correctness, regressions, and missing tests. Use when reviewing a pull request or preparing a change for merge.
---

## Workflow

1. Inspect the changed files and the relevant project instructions.
2. Read references/checklist.md for the team's review criteria.
3. Verify the risky behavior with the smallest relevant checks.
4. Report findings with file locations, impact, and evidence.
```

随包提供 `references/checklist.md`，其中写项目真正需要的检查，例如权限判定、输入边界和数据兼容。然后将插件登记到团队 marketplace，并按当前客户端提供的 source 管理方式安装。

团队应该版本化 **插件源文件和 catalog**。密钥、个人配置和安装缓存不进入插件包。共享配置可声明所需环境变量，但每位使用者仍需在自己的环境中完成授权。

## 八、前端开发插件案例

OpenAI 当前示例仓库可直接核对：

| 官方插件示例 | 可借鉴的组织方式 |
| --- | --- |
| `build-web-apps` | 页面构建、前端测试、组件和支付/数据库相关技能分工 |
| `figma` | 设计资料获取、Code Connect、设计系统工作流 |
| `expo` | Expo / React Native、SDK 升级及 EAS 工作流 |
| `netlify` | 部署相关工作流与服务接入 |
| `remotion` | 面向视频生成的技能组合 |

案例代表仓库当前内容，不代表这些插件在每个账号和客户端上默认启用。引用社区插件时还要单独检查作者、许可证、脚本依赖与更新记录。

## 九、安装后验证什么

1. 插件出现在当前客户端可用列表中，名称与来源符合预期。
2. 点名具体技能能够加载正确说明，任务描述也能合理匹配。
3. 相对引用能找到随包文件，脚本没有依赖作者机器的绝对路径。
4. 需要 MCP 或应用连接时，确认服务可用、账号授权和操作范围。
5. 用一个真实小任务检查结果；记录插件版本或提交、客户端版本和验证命令。

浏览器、发消息、部署等动作是否允许，仍依据当前任务授权和项目规则。写进 Skill 的步骤不应覆盖更高优先级的限制。

## 参考资料

- [OpenAI Plugins README](https://github.com/openai/plugins/blob/main/README.md)
- [build-web-apps 官方 manifest](https://github.com/openai/plugins/blob/main/plugins/build-web-apps/.codex-plugin/plugin.json)
- [默认 marketplace catalog](https://github.com/openai/plugins/blob/main/.agents/plugins/marketplace.json)
- [Codex plugin CLI 官方实现](https://github.com/openai/codex/blob/main/codex-rs/cli/src/plugin_cmd.rs)
- [Codex marketplace CLI 官方实现](https://github.com/openai/codex/blob/main/codex-rs/cli/src/marketplace_cmd.rs)
- [Build plugins 指南](https://developers.openai.com/codex/plugins/build)（本次抓取返回 403，作为进一步阅读入口）
