---
title: "第五篇：Kiro MCP 集成与工具扩展（2026-04）"
slug: "ai-ai-kiro-kiro-mcp-d2d54239"
summary: "详解 Kiro 的 MCP（Model Context Protocol）集成：工作区级与用户级配置文件、本地服务器与远程服务器两种接入方式、关键配置字段、环境变量引用语法，以及内置 fetch MCP server 的使用。"
category: "Kiro"
tags:
  - "Kiro"
  - "MCP"
  - "Model Context Protocol"
  - "工具扩展"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cabed8"
originalSlug: "ai-ai-kiro-kiro-mcp-d2d54239"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第五篇：Kiro MCP 集成与工具扩展（2026-04）

[[toc]]

---

## MCP 是什么

MCP，全称 Model Context Protocol（模型上下文协议），是由 Anthropic 主导推出的一套开放标准协议，旨在解决 AI 模型与外部工具、数据源之间的互操作性问题。在 MCP 出现之前，每个 AI 工具都需要为不同的外部服务单独开发适配层，维护成本极高，且难以复用。MCP 的出现统一了这一接口规范，让任何遵循协议的工具服务器都可以被任何支持 MCP 的 AI 客户端直接调用。

Kiro 作为一款深度集成 AI 能力的 IDE，原生支持 MCP 协议。通过 MCP，Kiro 的 Agent 可以在对话和任务执行过程中调用外部工具，例如查询数据库、读取文件系统之外的资源、调用第三方 API、抓取网页内容等。这极大地扩展了 Kiro Agent 的能力边界，使其不再局限于本地代码库的操作，而是可以与整个外部世界进行交互。

从架构角度来看，MCP 采用客户端-服务器模型。Kiro 作为 MCP 客户端，负责发起工具调用请求；MCP 服务器则是实际执行工具逻辑的进程，可以是本地运行的子进程，也可以是远程部署的 HTTP 服务。两者之间通过标准化的 JSON-RPC 协议进行通信，Kiro 会在需要时自动启动本地服务器进程，或向远程服务器发送请求。

MCP 生态目前已经相当丰富，社区中存在大量开源的 MCP 服务器实现，覆盖数据库访问、代码执行、网页抓取、文件操作、云服务调用等各类场景。Kiro 用户可以直接复用这些现成的服务器，也可以根据自身需求开发私有的 MCP 服务器。

---

## 配置文件位置

Kiro 的 MCP 配置通过 JSON 文件进行管理，支持两个层级的配置文件，分别对应不同的作用范围：

**工作区级配置**（仅对当前项目生效）：

```
{项目根目录}/.kiro/settings/mcp.json
```

**用户级配置**（对当前用户的所有项目生效）：

```
~/.kiro/settings/mcp.json
```

两个层级的配置文件格式完全相同，区别仅在于作用范围。工作区级配置优先级高于用户级配置——当同一个服务器名称在两个文件中都有定义时，工作区级的配置会覆盖用户级的配置。

推荐的使用策略是：将通用的、与项目无关的 MCP 服务器（例如网页抓取、通用数据库工具）配置在用户级文件中，这样所有项目都可以复用；将项目专属的服务器（例如连接特定业务数据库、调用内部 API）配置在工作区级文件中，并将该文件纳入版本控制，方便团队成员共享同一套工具配置。

需要注意的是，如果工作区级配置文件不存在，Kiro 会自动回退到用户级配置。两个文件可以同时存在，Kiro 会将它们合并使用，同名服务器以工作区级为准。

---

## 本地 MCP 服务器配置

本地 MCP 服务器是指运行在用户本机上的服务器进程。Kiro 会在需要时自动启动该进程，并通过标准输入输出（stdio）与其通信。这种方式适合需要访问本地文件系统、本地数据库或本地开发环境的工具。

配置本地服务器时，核心字段是 `command` 和 `args`。`command` 指定要执行的命令（通常是 `node`、`python`、`npx` 等），`args` 是传递给该命令的参数数组。

以下是一个完整的工作区级 `mcp.json` 示例，包含多个本地服务器的配置：

```json
{
  "mcpServers": {
    "filesystem": {
      // 本地文件系统访问服务器，使用 npx 直接运行官方包
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/projects",
        "/tmp"
      ],
      // 是否禁用该服务器，false 表示启用
      "disabled": false,
      // 自动批准的工具列表，列出的工具调用无需用户确认
      "autoApprove": ["read_file", "list_directory"]
    },
    "sqlite": {
      // 本地 SQLite 数据库访问服务器
      "command": "node",
      "args": ["/usr/local/lib/node_modules/mcp-server-sqlite/dist/index.js"],
      // 通过 env 字段向服务器进程注入环境变量
      "env": {
        "DB_PATH": "${SQLITE_DB_PATH}"
      },
      "disabled": false,
      "autoApprove": [],
      // 禁用服务器中的特定工具，即使服务器提供了这些工具也不会暴露给 Agent
      "disabledTools": ["drop_table", "delete_rows"]
    },
    "github": {
      // GitHub 操作服务器，通过 npx 运行
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      },
      "disabled": false,
      "autoApprove": ["search_repositories", "get_file_contents"]
    }
  }
}
```

Kiro 在检测到配置文件发生变更后会自动重新连接服务器，无需手动重启 IDE。这意味着你可以在开发过程中随时调整 MCP 配置，改动会立即生效。

---

## 远程 MCP 服务器配置

远程 MCP 服务器是部署在网络上的 HTTP 服务，通过 SSE（Server-Sent Events）或 HTTP 流式传输与 Kiro 通信。这种方式适合团队共享的工具服务、云端 API 封装，或者不方便在本地运行的重型服务。

配置远程服务器时，使用 `url` 字段替代 `command` 和 `args`，并可通过 `headers` 字段传递认证信息：

```json
{
  "mcpServers": {
    "remote-api-tools": {
      // 远程服务器使用 url 字段，而非 command + args
      "url": "https://mcp.example.com/api/v1/sse",
      // headers 用于传递认证令牌或其他 HTTP 请求头
      "headers": {
        "Authorization": "Bearer ${API_SECRET_TOKEN}",
        "X-Team-ID": "${TEAM_ID}",
        "Content-Type": "application/json"
      },
      "disabled": false,
      "autoApprove": ["query_knowledge_base"]
    },
    "internal-db-proxy": {
      // 公司内网部署的数据库代理服务
      "url": "https://db-proxy.internal.company.com/mcp",
      "headers": {
        "Authorization": "Bearer ${INTERNAL_API_KEY}"
      },
      "disabled": false,
      "autoApprove": [],
      "disabledTools": ["execute_raw_sql"]
    }
  }
}
```

远程服务器的一个重要优势是集中管理：团队可以在服务端统一维护工具逻辑，所有成员只需在配置文件中填写 URL 和认证信息即可使用，无需在每台机器上安装和维护本地依赖。

需要注意的是，远程服务器的网络延迟会影响工具调用的响应速度。对于需要频繁调用的工具，建议优先考虑本地服务器方案。此外，远程服务器的认证信息（如 API 密钥）应通过环境变量引用，而不是直接硬编码在配置文件中，尤其是当配置文件需要提交到版本控制系统时。

---

## 关键配置字段详解

理解每个配置字段的含义和用途，是正确配置 MCP 服务器的基础。以下对所有关键字段进行详细说明：

### command

类型：`string`，仅用于本地服务器。

指定启动 MCP 服务器进程的可执行命令。常见值包括：

- `node`：运行 Node.js 脚本
- `python` 或 `python3`：运行 Python 脚本
- `npx`：通过 npm 包执行器运行，无需全局安装
- `uvx`：Python 的 uv 包执行器，类似 npx

### url

类型：`string`，仅用于远程服务器。

远程 MCP 服务器的完整 URL，支持 `https://` 协议。与 `command` 字段互斥，两者不能同时出现在同一个服务器配置中。

### args

类型：`string[]`，仅用于本地服务器。

传递给 `command` 的命令行参数数组。例如，当 `command` 为 `npx` 时，`args` 通常包含包名和传递给该包的参数。

### env

类型：`object`，键值对均为字符串。

向本地服务器进程注入的环境变量。这些变量会合并到进程的环境变量中，可以在服务器代码中通过 `process.env`（Node.js）或 `os.environ`（Python）访问。支持使用 `${VAR_NAME}` 语法引用宿主机上已有的环境变量。

### disabled

类型：`boolean`，默认值 `false`。

控制是否禁用该服务器。设置为 `true` 时，Kiro 不会启动或连接该服务器，但配置会保留，方便后续重新启用。这在临时关闭某个服务器时非常有用，无需删除整个配置块。

### autoApprove

类型：`string[]`，默认值 `[]`。

列出无需用户手动确认即可自动执行的工具名称。默认情况下，Agent 调用 MCP 工具时会弹出确认提示，用户需要点击批准才能执行。将常用的、低风险的工具加入此列表，可以减少打断，提升工作流的流畅度。

建议只将只读类工具（如 `read_file`、`search`、`query`）加入自动批准列表，写入类或破坏性操作（如 `write_file`、`delete`、`execute_sql`）应保留手动确认。

### disabledTools

类型：`string[]`，默认值 `[]`。

列出需要从该服务器中屏蔽的工具名称。即使服务器本身提供了这些工具，Kiro 也不会将其暴露给 Agent。这在以下场景中非常有用：服务器提供了一些危险操作（如删除数据库表），你希望在当前环境中禁止 Agent 使用这些操作，但又不想修改服务器代码。

### headers

类型：`object`，键值对均为字符串，仅用于远程服务器。

附加到每次 HTTP 请求的请求头。通常用于传递认证令牌（`Authorization`）、API 密钥或其他自定义头信息。

---

## 环境变量引用语法

在 MCP 配置文件中，敏感信息（如 API 密钥、数据库密码、访问令牌）不应直接以明文写入配置文件，尤其是当配置文件需要提交到 Git 仓库时。Kiro 提供了环境变量引用语法来解决这个问题。

引用语法格式为：

```
${VAR_NAME}
```

其中 `VAR_NAME` 是宿主机操作系统中已定义的环境变量名称。Kiro 在读取配置文件时，会自动将 `${VAR_NAME}` 替换为对应环境变量的实际值。

以下是环境变量引用的完整使用示例：

```json
{
  "mcpServers": {
    "openai-tools": {
      "command": "npx",
      "args": ["-y", "mcp-server-openai"],
      "env": {
        // 引用系统环境变量 OPENAI_API_KEY
        "OPENAI_API_KEY": "${OPENAI_API_KEY}",
        // 引用系统环境变量 OPENAI_ORG_ID
        "OPENAI_ORG_ID": "${OPENAI_ORG_ID}"
      }
    },
    "remote-service": {
      "url": "https://api.example.com/mcp",
      "headers": {
        // 在 headers 中同样支持环境变量引用
        "Authorization": "Bearer ${MY_SERVICE_TOKEN}",
        "X-User-ID": "${USER_ID}"
      }
    }
  }
}
```

在 macOS 和 Linux 系统上，可以在 `~/.zshrc`、`~/.bashrc` 或 `~/.profile` 中定义这些环境变量：

```bash
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxx"
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxx"
export MY_SERVICE_TOKEN="your-secret-token"
```

在 Windows 系统上，可以通过系统属性 → 高级 → 环境变量进行设置，或在 PowerShell 中使用 `$env:VAR_NAME = "value"` 临时设置。

这种方式的好处是：配置文件本身不包含任何敏感信息，可以安全地提交到版本控制系统；不同的团队成员可以在自己的机器上配置不同的密钥，而无需修改共享的配置文件。

---

## 内置 fetch MCP server

Kiro 内置了一个名为 `fetch` 的 MCP 服务器，专门用于抓取网页内容。这个服务器无需任何额外安装或配置，开箱即用，是 Kiro 默认提供的工具能力之一。

内置 fetch 服务器的主要功能包括：

- 抓取指定 URL 的网页内容，并将其转换为 Markdown 格式返回给 Agent
- 支持抓取文档页面、博客文章、API 参考等各类网页
- 自动处理 HTML 到纯文本的转换，过滤掉导航栏、广告等无关内容
- 支持通过 URL 直接读取在线文档，无需手动复制粘贴

在实际使用中，你可以直接在对话中要求 Kiro 访问某个网页，例如：

> "请帮我查看 https://kiro.dev/docs/mcp/ 的内容，总结一下 MCP 的配置方式。"

Kiro 会自动调用内置 fetch 工具抓取该页面，并基于内容给出回答。这对于查阅最新文档、参考在线示例、获取实时信息等场景非常实用。

内置 fetch 服务器的工具调用同样受到 `autoApprove` 机制的控制。默认情况下，首次调用时会弹出确认提示。如果你希望 Kiro 在对话中可以自由访问网页而无需每次确认，可以在配置文件中将 fetch 相关工具加入自动批准列表。

---

## 通过 Kiro 面板管理 MCP

除了直接编辑 JSON 配置文件，Kiro 还提供了图形化的 MCP 管理面板，方便用户查看和管理已配置的 MCP 服务器。

在 Kiro 的侧边栏中，找到 MCP 相关的标签页（通常标注为"MCP Servers"或通过 Powers 面板访问），可以看到当前所有已配置服务器的状态列表，包括：

- 服务器名称和类型（本地/远程）
- 当前连接状态（已连接/断开/错误）
- 该服务器提供的工具列表
- 每个工具的描述和参数信息

通过面板，你可以：

- 快速查看哪些服务器处于活跃状态
- 手动触发服务器重连（当服务器进程异常退出时）
- 查看服务器提供的工具详情，了解每个工具的功能和参数
- 在不修改配置文件的情况下临时禁用某个服务器

当你修改了 `mcp.json` 配置文件后，Kiro 会自动检测到变更并重新连接受影响的服务器。这个自动重连机制意味着你不需要重启 IDE 来使配置生效，大大提升了配置调试的效率。

如果服务器连接失败，面板会显示错误信息，帮助你快速定位问题。常见的连接失败原因包括：命令路径不正确、依赖包未安装、环境变量未设置、网络访问受限等。

---

## 实战示例

### 示例一：接入 GitHub MCP 服务器

GitHub MCP 服务器允许 Kiro Agent 直接操作 GitHub 仓库，包括搜索代码、读取文件、创建 Issue、提交 PR 等。

首先，在 GitHub 设置中生成一个 Personal Access Token（PAT），赋予必要的权限（`repo`、`read:org` 等），然后将其设置为环境变量：

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

然后在 `~/.kiro/settings/mcp.json` 中添加配置：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      },
      "disabled": false,
      "autoApprove": [
        "search_repositories",
        "get_file_contents",
        "list_issues"
      ],
      "disabledTools": ["delete_repository"]
    }
  }
}
```

配置完成后，你可以在 Kiro 对话中直接说："帮我搜索 GitHub 上关于 MCP 的热门仓库"，Kiro 会自动调用 GitHub 工具完成搜索。

### 示例二：接入本地 PostgreSQL 数据库

对于需要查询本地开发数据库的场景，可以使用 PostgreSQL MCP 服务器：

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "${DATABASE_URL}"
      ],
      "env": {
        "DATABASE_URL": "${PG_DEV_URL}"
      },
      "disabled": false,
      "autoApprove": ["query", "list_tables", "describe_table"],
      "disabledTools": ["execute", "create_table", "drop_table"]
    }
  }
}
```

通过 `disabledTools` 屏蔽了所有写操作，确保 Agent 只能读取数据，不会意外修改开发数据库。

### 示例三：接入团队内部知识库

对于团队共享的知识库服务，使用远程服务器配置：

```json
{
  "mcpServers": {
    "team-knowledge": {
      "url": "https://knowledge.internal.company.com/mcp/sse",
      "headers": {
        "Authorization": "Bearer ${KNOWLEDGE_API_KEY}",
        "X-Department": "engineering"
      },
      "disabled": false,
      "autoApprove": ["search_docs", "get_document"]
    }
  }
}
```

将此配置放在工作区级 `mcp.json` 并提交到仓库，团队所有成员只需在本地设置 `KNOWLEDGE_API_KEY` 环境变量即可使用。

---

## 注意事项与常见问题

### 配置文件格式要求

`mcp.json` 必须是合法的 JSON 格式，不支持注释（上文示例中的注释仅为说明用途，实际文件中不能包含 `//` 注释）。建议使用支持 JSON 语法检查的编辑器编写配置，避免因格式错误导致服务器无法加载。

### 环境变量未生效

如果配置中引用的环境变量在 Kiro 启动时未设置，`${VAR_NAME}` 会被替换为空字符串，可能导致服务器启动失败或认证错误。确保在启动 Kiro 之前，相关环境变量已在当前 shell 会话中设置。在 macOS 上，通过 Launchpad 或 Dock 启动的应用可能无法继承终端中设置的环境变量，建议通过终端命令 `open -a Kiro` 启动，或将环境变量写入 `~/.zshenv`（该文件在所有 shell 会话中都会被加载）。

### 服务器进程启动失败

本地服务器启动失败时，首先检查 `command` 指定的可执行文件是否在系统 PATH 中，以及 `args` 中引用的包是否已安装。使用 `npx -y` 可以自动安装缺失的包，但首次运行需要网络连接。

### autoApprove 的安全考量

`autoApprove` 列表中的工具会在 Agent 决策时自动执行，不会弹出确认提示。在将工具加入此列表之前，务必充分了解该工具的行为，确认其不会产生不可逆的副作用。对于文件写入、数据库修改、API 调用等操作，建议保留手动确认机制。

### 工作区配置与用户配置的冲突

当工作区级和用户级配置中存在同名服务器时，工作区级配置完全覆盖用户级配置（不是合并，而是替换）。如果你在用户级配置了一个服务器，并希望在某个项目中使用不同的参数，只需在工作区级配置中定义同名服务器即可。

### 服务器自动重连机制

Kiro 会监听 `mcp.json` 文件的变更，并在检测到变更后自动重新连接受影响的服务器。这意味着你可以在 IDE 运行时修改配置，无需重启。但如果服务器进程本身崩溃，需要通过 MCP 面板手动触发重连，或重启 Kiro。

### 版本控制建议

工作区级 `mcp.json` 建议提交到版本控制，但需确保其中不包含任何硬编码的密钥或密码。所有敏感信息都应通过 `${VAR_NAME}` 语法引用环境变量。可以在 `.gitignore` 中排除用户级配置文件（`~/.kiro/settings/mcp.json`），因为该文件通常包含个人凭证。

---

## 参考资料

- [Kiro 官方文档 - MCP 集成](https://kiro.dev/docs/mcp/)
- [Kiro 官方网站](https://kiro.dev)
- [Model Context Protocol 官方规范](https://modelcontextprotocol.io)
- [MCP 服务器社区列表](https://github.com/modelcontextprotocol/servers)
- [Kiro Powers 文档](https://kiro.dev/docs/powers/)

> 本文内容基于 Kiro 官方文档（https://kiro.dev），资料快照时间：2026-04。如有出入，请以官方最新文档为准。
