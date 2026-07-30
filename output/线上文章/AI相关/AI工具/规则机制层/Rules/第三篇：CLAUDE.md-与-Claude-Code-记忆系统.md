---
title: "第三篇：CLAUDE.md 与 Claude Code 记忆系统"
slug: "ai-rules-claude-claude-md-claudecode-ff6cd587"
summary: "深度解析 Claude Code 的完整记忆系统，包括 CLAUDE.md 四层文件层级、@import 语法、.claude/rules/ 路径作用域规则、Auto Memory 自动记忆机制，以及 /memory 命令的使用与调试技巧。"
category: "Rules"
tags:
  - "CLAUDE.md"
  - "Claude Code"
  - "Auto Memory"
  - "记忆系统"
  - ".claude/rules"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabff8"
originalSlug: "ai-rules-claude-claude-md-claudecode-ff6cd587"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第三篇：CLAUDE.md 与 Claude Code 记忆系统

> 资料来源：Anthropic Claude Code 官方文档。初稿整理：2026-04；按官方文档复核更新：2026-05-22。

[[toc]]

---

## 一、Claude Code 的两套记忆机制

Claude Code 的每次会话都从空白上下文开始。为了跨会话保持知识，它提供了两套互补的记忆机制：

| 机制 | 谁来写 | 写什么 | 作用域 | 加载时机 |
|------|--------|--------|--------|---------|
| **CLAUDE.md 文件** | 你（手动） | 指令和规则 | 项目 / 用户 / 组织 | 每次会话开始 |
| **Auto Memory（自动记忆）** | Claude（自动） | 学到的模式和经验 | 每个工作树 | 每次会话开始（前 200 行） |

两者相互补充：`CLAUDE.md` 用于你主动定义的规范，Auto Memory 用于 Claude 从对话中积累的经验。

---

## 二、CLAUDE.md 文件层级

### 2.1 四层作用域

Claude Code 支持多层 `CLAUDE.md`，从大到小：

| 层级 | 路径 | 作用范围 | 是否提交 git |
|------|------|---------|------------|
| **组织级（托管策略）** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md` | 所有用户，IT 管理员部署 | 不适用 |
| **项目级** | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 当前项目所有成员 | ✅ 提交共享 |
| **用户级** | `~/.claude/CLAUDE.md` | 个人所有项目 | ❌ 仅本人 |
| **本地私有** | `./CLAUDE.local.md` | 当前项目，本人专用 | ❌ 加入 .gitignore |

### 2.2 加载规则

Claude Code 从当前工作目录向上遍历，**所有找到的文件都会被拼接加载**（不是覆盖）：

```
当前目录：foo/bar/
加载顺序：
  foo/bar/CLAUDE.md
  foo/bar/CLAUDE.local.md
  foo/CLAUDE.md
  foo/CLAUDE.local.md
  （继续向上直到根目录）
```

子目录中的 `CLAUDE.md` 不在启动时加载，而是在 Claude 读取该目录文件时**按需加载**。

> **重要**：`CLAUDE.md` 文件**全量加载**，不受 200 行限制（200 行限制只适用于 Auto Memory 的 MEMORY.md）。但文件越长，遵守率越低，官方建议控制在 200 行以内。

### 2.2.1 加载额外目录的 CLAUDE.md

使用 `--add-dir` 给 Claude 访问额外目录时，默认不加载这些目录的 CLAUDE.md。通过环境变量开启：

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 claude --add-dir ../shared-config
```

开启后，额外目录中的 `CLAUDE.md`、`.claude/CLAUDE.md` 和 `.claude/rules/*.md` 都会被加载。注意：额外目录中的 `CLAUDE.local.md` 不会被加载。

### 2.3 两个 .claude 目录

项目中有两个 `.claude` 目录，职责不同：

```
your-project/
└── .claude/              # 项目级，提交到 git，团队共享
    ├── CLAUDE.md         # 项目规则
    ├── rules/            # 路径作用域规则
    └── settings.json     # 项目权限配置

~/.claude/                # 用户级，仅本人，跨所有项目
├── CLAUDE.md             # 个人偏好
├── rules/                # 个人规则
└── projects/             # Auto Memory 存储位置
    └── <project>/
        └── memory/
```

---

## 三、创建与管理 CLAUDE.md

### 3.1 三种创建方式

**方式一：手动创建**

在项目根目录新建 `CLAUDE.md`，直接写入内容。最灵活，完全自定义。

**方式二：/init 命令自动生成**

在 Claude Code 中运行：

```
/init
```

Claude 会扫描项目结构，自动生成一份基础 `CLAUDE.md`，包含检测到的构建命令、目录结构、技术栈等信息。生成后再手动补充团队规范。

**方式三：通过对话让 Claude 更新**

在会话中直接说：

```
把"始终使用 pnpm，不用 npm"加到 CLAUDE.md
```

或：

```
记住：我们的测试框架是 Vitest，不是 Jest，把这个加到 CLAUDE.md
```

Claude 会自动编辑文件。

### 3.2 @import 语法

`CLAUDE.md` 支持用 `@` 语法引入其他文件，避免重复维护：

```markdown
# CLAUDE.md

# 项目概览
参见 @README 了解项目背景，@package.json 查看可用命令。

# Git 工作流
@docs/git-instructions.md

# 如果仓库已有 AGENTS.md，直接引用（避免重复维护）
@AGENTS.md

## Claude Code 专属规则
- 在 `src/billing/` 下的改动使用 plan mode
- 权限边界：不允许执行 rm -rf 命令
```

引用规则：
- 支持相对路径和绝对路径
- 相对路径相对于包含 `@import` 的文件，不是工作目录
- 支持递归引用，最多 5 层
- 引用的文件在会话启动时与 `CLAUDE.md` 一起加载

### 3.3 HTML 注释（维护备注）

`CLAUDE.md` 中的 HTML 注释会在注入上下文前被自动剥离，不消耗 token：

```markdown
<!-- 
  这段是给人类维护者看的备注，不会被 Claude 读到。
  上次更新：2026-04-11，原因：迁移到 Vitest
-->

## 测试规范
- 测试框架：Vitest（已从 Jest 迁移）
```

代码块内的注释不会被剥离。

---

## 四、.claude/rules/ 路径作用域规则

### 4.1 为什么需要路径作用域

大型项目中，不同目录有不同的规范：

- `src/api/` 需要 API 设计规范
- `src/components/` 需要 UI 组件规范
- `tests/` 需要测试编写规范

把所有规范都写在根目录的 `CLAUDE.md` 里会导致文件过长，而且每次会话都加载所有规则，浪费 token。

`.claude/rules/` 目录解决了这个问题：规则只在处理匹配文件时才加载。

### 4.2 目录结构

```
your-project/
└── .claude/
    ├── CLAUDE.md           # 主规则文件（始终加载）
    └── rules/
        ├── code-style.md   # 代码风格（始终加载，无 paths）
        ├── testing.md      # 测试约定（始终加载，无 paths）
        ├── api-design.md   # API 规范（只在处理 src/api/ 时加载）
        └── security.md     # 安全要求（只在处理特定文件时加载）
```

### 4.3 路径作用域配置

在规则文件顶部添加 YAML frontmatter，指定 `paths` 字段：

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API 开发规范

- 所有端点必须包含输入校验
- 使用标准错误响应格式：`{ code, message, data }`
- 必须包含 OpenAPI 注释
- 异步路由处理器必须有错误处理
```

没有 `paths` 字段的规则文件在启动时无条件加载。

**支持的 glob 模式：**

| 模式 | 匹配范围 |
|------|---------|
| `**/*.ts` | 任意目录下的 TypeScript 文件 |
| `src/**/*` | src/ 目录下的所有文件 |
| `*.md` | 项目根目录的 Markdown 文件 |
| `src/components/*.tsx` | 特定目录的 React 组件 |
| `src/**/*.{ts,tsx}` | 多扩展名匹配 |

**多路径配置：**

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```

### 4.4 用户级规则

个人规则放在 `~/.claude/rules/`，对所有项目生效：

```
~/.claude/rules/
├── preferences.md    # 个人编码偏好
└── workflows.md      # 个人工作流偏好
```

用户级规则在项目规则之前加载，项目规则优先级更高。

### 4.5 symlink 支持

`.claude/rules/` 支持符号链接，可以在多个项目间共享规则：

```bash
# 链接共享规则目录
ln -s ~/shared-claude-rules .claude/rules/shared

# 链接单个规则文件
ln -s ~/company-standards/security.md .claude/rules/security.md
```

---

## 五、Auto Memory 自动记忆

### 5.1 是什么

Auto Memory 让 Claude 在工作过程中自动积累知识，无需你手动记录。Claude 会保存：

- 构建命令和环境配置
- 调试经验和已知问题
- 架构决策
- 代码风格偏好
- 工作流习惯

Claude 不会每次会话都保存内容，它会判断哪些信息在未来的会话中有价值。

### 5.2 官方口径下，Auto Memory 更适合记什么

Anthropic 官方文档对 Auto Memory 的描述重点，不是某套固定的内部分类，而是**它应该保存什么类型的信息**。更稳妥的理解是：

- 你反复纠正 Claude 后形成的偏好
- 构建命令、调试经验、项目里的已知坑
- 代码本身不容易直接看出来的背景信息
- 以后开新会话时仍然值得复用的做法

反过来说，如果一条信息本来就能从代码、README、测试或 git 历史里直接看出来，它通常更适合写进仓库文件，而不是依赖 Auto Memory。

### 5.3 存储位置

每个项目有独立的记忆目录：

```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # 简洁索引，每次会话加载前 200 行
├── debugging.md       # 调试模式详细记录
├── api-conventions.md # API 设计决策
└── ...                # Claude 自动创建的其他主题文件
```

`<project>` 路径从 git 仓库派生，同一仓库的所有工作树和子目录共享一个记忆目录。

### 5.4 加载机制与 200 行阈值

- `MEMORY.md` 的前 **200 行**，或前 **25KB**（以先到者为准）会在每次会话开始时加载
- 超出这个阈值的内容不会在会话启动时自动进入上下文
- 主题文件（如 `debugging.md`、`patterns.md`）不在启动时加载，而是在需要时按需读取
- Auto Memory 是机器本地的，不跨机器同步

> **实践建议**：定期通过 `/memory` 检查 Auto Memory 文件；如果 `MEMORY.md` 越写越长，就把细节整理进 topic files，避免真正重要的开场信息被挤到阈值之外。

### 5.5 开启与关闭

Auto Memory 默认开启。关闭方式：

```bash
# 通过环境变量关闭
CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 claude

# 通过项目设置关闭
# .claude/settings.json
{
  "autoMemoryEnabled": false
}
```

也可以在会话中通过 `/memory` 命令切换开关。

### 5.6 自定义存储位置

```json
// ~/.claude/settings.json（用户级或本地级设置）
{
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```

注意：此设置不接受项目级配置（`.claude/settings.json`），防止共享项目将记忆写入敏感位置。

---

## 六、/memory 命令

`/memory` 是管理所有记忆文件的入口命令：

```
/memory
```

执行后可以：
- 查看当前会话加载的所有 `CLAUDE.md`、`CLAUDE.local.md` 和规则文件列表
- 切换 Auto Memory 开关
- 打开 Auto Memory 文件夹链接
- 选择任意文件在编辑器中打开

**让 Claude 主动记住某件事：**

```
记住：我们的 API 测试需要本地 Redis 实例，端口 6379
```

Claude 会把这条信息保存到 Auto Memory。

**把内容加到 CLAUDE.md 而不是 Auto Memory：**

```
把这条加到 CLAUDE.md：始终使用 pnpm，不用 npm
```

---

## 七、写出高质量 CLAUDE.md

### 7.1 结构建议

```markdown
# CLAUDE.md

## 常用命令
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm test` - 运行测试

## 项目架构
（简要说明各目录职责和关键设计决策）

## 代码规范
（最关键的几条，不是完整规范文档）

## 注意事项
（容易踩坑的地方、特殊约定）
```

### 7.2 大小控制

- **目标 200 行以内**：超长文件消耗更多 token，遵守率反而下降
- 超出时用 `@import` 引用外部文件，或拆分到 `.claude/rules/`
- 用 `/memory` 命令查看上下文可视化，了解 `CLAUDE.md` 在启动上下文中的位置

### 7.3 Anthropic 官方建议：什么该写，什么不该写

来自 Anthropic 工程博客的官方建议：

| ✅ 应该写 | ❌ 不应该写 |
|----------|-----------|
| Claude 无法从代码中猜到的 Bash 命令 | Claude 通过读代码就能知道的内容 |
| 与默认不同的代码风格规则 | 标准语言约定（Claude 已知） |
| 测试指令和首选测试运行器 | 详细的 API 文档（链接即可） |
| 仓库礼仪（分支命名、PR 约定） | 频繁变化的信息 |
| 项目特有的架构决策 | 冗长的解释或教程 |
| 开发环境特殊要求（必需的环境变量） | 逐文件的代码库描述 |
| 常见坑和非显而易见的行为 | 不言而喻的实践（如"写干净的代码"） |

**判断标准**：对每一行问自己"如果删掉这行，Claude 会犯错吗？"如果不会，就删掉。

### 7.4 强调词提升遵守率

对于关键规则，可以加强调词提升 Claude 的遵守率：

```markdown
## 重要规则

- **IMPORTANT**: 提交前必须运行 `npm test`，不允许跳过
- **YOU MUST**: 所有 SQL 使用参数化查询，禁止字符串拼接
- **NEVER**: 不要硬编码 API 密钥或凭证
```

### 7.5 规则 vs Hooks

如果某条规则 Claude 反复不遵守，考虑改用 **Hooks** 而不是在 `CLAUDE.md` 里加更多强调：

- `CLAUDE.md` 规则是**建议性的**，Claude 会尽力遵守但不保证
- Hooks 是**确定性的**，保证在特定时机执行

```
# 与其在 CLAUDE.md 写：
# "每次编辑文件后运行 eslint"

# 不如配置一个 Hook：
# postToolUse（write 类型）→ 运行 eslint
```

### 7.6 避免冲突

多个 `CLAUDE.md` 文件（项目级、用户级、子目录）的内容会被拼接，如果两个文件对同一行为给出不同指令，Claude 可能随机选一个。

定期检查：
- 根目录 `CLAUDE.md`
- 子目录 `CLAUDE.md`
- `.claude/rules/` 中的规则文件
- 用户级 `~/.claude/CLAUDE.md`

### 7.4 大型团队管理

**排除不相关的 CLAUDE.md**

在大型 monorepo 中，其他团队的 `CLAUDE.md` 可能被误加载。用 `claudeMdExcludes` 排除：

```json
// .claude/settings.local.json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

**组织级托管策略**

IT 管理员可以部署组织级 `CLAUDE.md`，对所有用户生效且不可被排除：

```
macOS: /Library/Application Support/ClaudeCode/CLAUDE.md
Linux: /etc/claude-code/CLAUDE.md
Windows: C:\Program Files\ClaudeCode\CLAUDE.md
```

---

## 八、常见问题排查

### Claude 没有遵守 CLAUDE.md 的规则

1. 运行 `/memory`，确认文件出现在加载列表中
2. 检查文件路径是否正确（见"加载规则"一节）
3. 让规则更具体：`"使用 2 空格缩进"` 比 `"格式化代码"` 有效
4. 检查是否有冲突规则（多个文件对同一行为给出不同指令）

### /compact 后规则消失了

项目根目录的 `CLAUDE.md` 在 `/compact` 后会重新从磁盘读取并注入。子目录的 `CLAUDE.md` 不会自动重新注入，需要等 Claude 下次读取该目录文件时才会加载。

如果某条指令在 `/compact` 后消失，说明它只存在于对话中，需要把它加到 `CLAUDE.md`。

### CLAUDE.md 太大了

- 超过 200 行时，把详细内容移到 `@import` 引用的文件中
- 或拆分到 `.claude/rules/` 目录，用路径作用域按需加载

---

> 参考资料：
> - [Claude Code 记忆系统官方文档 - Anthropic](https://docs.anthropic.com/en/docs/claude-code/memory)
> - [Claude Code 最佳实践官方博客 - Anthropic](https://www.anthropic.com/engineering/claude-code-best-practices)
> - [.claude/ 文件夹完整解析 - dailydoseofds.com](https://blog.dailydoseofds.com/p/anatomy-of-the-claude-folder)
> - [Claude Code 记忆指南 2026 - blog.laozhang.ai](https://blog.laozhang.ai/en/posts/claude-code-memory)
> - [Claude Code 记忆源码深度分析（200 行截断、四种类型）- mem0.ai](https://mem0.ai/blog/how-memory-works-in-claude-code)
