---
title: "第 2 篇：YAML、JSON、TOML 配置文件入门：语法差异、适用场景、Vue、Node.js、Docker、Actions"
slug: "yaml-json-toml-config-files-for-beginners"
summary: "面向开发初学者讲清 YAML、JSON、TOML 三类配置文件的语法差异、适用场景、优缺点，以及在 Vue、Node.js、Docker、GitHub Actions、Codex 等项目中的用法。"
category: "开发基础"
categoryPath:
  - "AI相关"
  - "AI开发"
  - "开发基础"
tags: []
status: "published"
sortOrder: 20
cover: ""
originalId: "6a4a4564f9ac958d29178036"
originalSlug: "yaml-json-toml-config-files-for-beginners"
originalStatus: "published"
publishedAt: "2026-07-05T11:55:50.508Z"
updatedAt: "2026-07-31T11:16:25.726Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 2 篇：YAML、JSON、TOML 配置文件入门：语法差异、适用场景、Vue、Node.js、Docker、Actions

> 你在学习开发时，可能先认识了 `.js`、`.vue`、`.py` 这类“代码文件”，后来又突然看到 `.json`、`.yml`、`.yaml`、`.toml`。它们看起来不像代码，却经常决定项目怎么运行、依赖怎么安装、工具怎么检查代码、服务怎么部署。本文就用初学者能看懂的方式，把 YAML、JSON、TOML 三种常见配置文件讲清楚。

---

## 一、先理解：配置文件到底是什么？

开发项目里有很多内容并不是“业务代码”，但程序、框架、工具必须知道它们。

例如：

| 问题                              | 配置文件会告诉工具什么            |
| --------------------------------- | --------------------------------- |
| 项目叫什么名字？                  | `name`、`version`                 |
| 项目依赖哪些库？                  | `dependencies`、`devDependencies` |
| 运行命令是什么？                  | `scripts`                         |
| 开发服务器端口是多少？            | `port`                            |
| 数据库地址在哪里？                | `DATABASE_URL`                    |
| 代码格式规则是什么？              | 缩进、引号、分号规则              |
| 自动化部署怎么执行？              | 拉代码、安装依赖、构建、发布      |
| AI 编程工具该使用什么模型和权限？ | 模型、审批策略、沙箱策略          |

一句话理解：

```text
配置文件就是给程序、框架、工具看的“说明书”。
```

代码负责“做事”，配置负责“告诉工具按什么规则做事”。

比如你运行：

```powershell
npm run dev
```

终端并不是天生知道 `dev` 是什么意思，它会去读 `package.json`：

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0"
  }
}
```

于是 npm 才知道：你输入 `npm run dev` 时，真正要执行的是 `vite --host 0.0.0.0`。

这就是配置文件的作用。

## 二、为什么配置文件有这么多格式？

因为不同工具的需求不一样。

有些工具更重视机器读取，例如前端项目常用的 `package.json`，需要被 npm、Vite、Vue、ESLint 等工具稳定解析。

有些工具更重视人类阅读和手写，例如 GitHub Actions、Docker Compose，里面经常有多层任务、命令、环境变量，用 YAML 写起来更像说明文档。

有些工具希望配置既清晰又不容易因为缩进出错，例如 Rust 项目的 `Cargo.toml`、Python 项目的 `pyproject.toml`、Codex 的 `config.toml`，常会选择 TOML。

所以不是“谁高级谁淘汰谁”，而是：

```text
JSON：机器友好，生态极广。
YAML：人类友好，适合复杂层级和运维流程。
TOML：配置友好，结构清楚，适合工具和项目设置。
```

## 三、JSON：前端项目最常见的配置格式

### 3.1 JSON 是什么？

JSON 全称是 JavaScript Object Notation，直译是 JavaScript 对象表示法。

虽然名字里有 JavaScript，但 JSON 早就不是前端专属了。后端接口、数据库导入导出、配置文件、日志数据、API 返回值都大量使用 JSON。

你在 Vue 前端项目里最常见的 JSON 文件通常是：

```text
package.json
package-lock.json
tsconfig.json
jsconfig.json
.prettierrc.json
```

### 3.2 JSON 长什么样？

一个简化版 `package.json`：

```json
{
  "name": "personal-blog-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.5.0",
    "pinia": "^3.0.0"
  }
}
```

你可以把它看成一个“键值对集合”：

```text
"name" 是键，"personal-blog-frontend" 是值。
"scripts" 是键，它的值又是一个对象。
"dependencies" 是键，它的值也是一个对象。
```

### 3.3 JSON 的基本规则

JSON 规则很严格：

| 规则               | 说明                               |
| ------------------ | ---------------------------------- |
| 字符串必须用双引号 | `"name"` 可以，`'name'` 不可以     |
| 键名必须用双引号   | `"scripts"` 可以，`scripts` 不可以 |
| 不允许注释         | 不能写 `// 说明` 或 `/* 说明 */`   |
| 不能有多余逗号     | 最后一项后面不能再写 `,`           |
| 支持对象和数组     | `{}` 表示对象，`[]` 表示数组       |
| 适合程序读取       | 解析规则简单，跨语言支持非常好     |

最常见的新手错误是最后多写一个逗号：

```json
{
  "name": "demo",
  "version": "1.0.0"
}
```

上面这个 JSON 是错误的，因为 `"version": "1.0.0"` 后面多了一个逗号。

正确写法：

```json
{
  "name": "demo",
  "version": "1.0.0"
}
```

### 3.4 JSON 适合什么场景？

JSON 特别适合：

- 前后端接口数据传输
- npm 项目配置
- TypeScript / JavaScript 工程配置
- VS Code 配置
- 数据导入导出
- 需要被程序稳定读取的结构化数据

例如后端接口常返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "1001",
    "title": "YAML、JSON、TOML 配置文件入门"
  }
}
```

前端拿到后，就可以通过 `data.title` 显示文章标题。

### 3.5 JSON 的优缺点

优点：

- 规则明确，机器解析稳定
- 跨语言支持非常好
- 前端、后端、接口、数据库都高频使用
- 非常适合表达对象、数组、字符串、数字、布尔值

缺点：

- 不能写注释，对人类维护不够友好
- 字符串和键名都必须双引号，手写时略繁琐
- 多层嵌套后可读性下降
- 最后一项不能有逗号，新手容易踩坑

## 四、YAML：运维、部署、自动化里特别常见

### 4.1 YAML 是什么？

YAML 常见扩展名有两种：

```text
.yaml
.yml
```

它们通常表示同一种格式，只是后缀长短不同。

YAML 的特点是“像写大纲一样写配置”。它大量依赖缩进来表达层级，所以读起来很自然，但也因为依赖缩进，新手容易因为空格写错导致配置失效。

你可能会在这些地方遇到 YAML：

```text
docker-compose.yml
.github/workflows/deploy.yml
application.yml
mkdocs.yml
kubernetes.yaml
```

### 4.2 YAML 长什么样？

一个简化版 Docker Compose 配置：

```yaml
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
```

这段配置的意思是：

```text
定义 services。
services 下面有一个 web 服务。
web 服务使用 nginx:latest 镜像。
把本机 8080 端口映射到容器 80 端口。
把本机 ./html 目录挂载到容器指定目录。
```

同样的结构如果写成 JSON，大概是这样：

```json
{
  "services": {
    "web": {
      "image": "nginx:latest",
      "ports": ["8080:80"],
      "volumes": ["./html:/usr/share/nginx/html"]
    }
  }
}
```

你会发现，YAML 少了很多 `{}`、`[]` 和双引号，更像人写的配置说明。

### 4.3 YAML 的基本规则

| 规则                     | 说明                             |
| ------------------------ | -------------------------------- |
| 用缩进表示层级           | 通常使用 2 个空格                |
| 不建议用 Tab             | 很多 YAML 解析器对 Tab 不友好    |
| `key: value` 表示键值对  | 冒号后面通常要有空格             |
| `-` 表示数组项           | 常用于列表                       |
| 可以写注释               | 使用 `#`                         |
| 字符串很多时候可不加引号 | 但特殊字符、布尔值、数字建议谨慎 |

示例：

```yaml
# 这是一个文章配置
title: YAML、JSON、TOML 配置文件入门
status: draft
tags:
  - "配置文件"
  - "YAML"
  - "JSON"
  - "TOML"
  - "Docker"
  - "GitHub Actions"
```

这里的 `tags` 是一个数组，包含三个标签。

### 4.4 YAML 最容易踩的坑：缩进

YAML 靠缩进表达层级，所以缩进错了，意思就变了。

正确示例：

```yaml
user:
  name: HN246
  role: admin
```

意思是：

```text
user 下面有 name 和 role。
```

错误示例：

```yaml
user:
name: HN246
role: admin
```

这时 `name` 和 `role` 不再属于 `user`，整个配置结构就变了。

另一个常见错误是漏写冒号后面的空格：

```yaml
title:配置文件入门
```

更推荐写成：

```yaml
title: 配置文件入门
```

### 4.5 YAML 适合什么场景？

YAML 特别适合：

- Docker Compose 服务编排
- GitHub Actions 自动化流程
- Kubernetes 部署配置
- Spring Boot 应用配置
- 文档站点配置
- 内容系统的 Front Matter

例如很多 Markdown 文章顶部会写 Front Matter：

```yaml
---
title: YAML、JSON、TOML 配置文件入门
slug: yaml-json-toml-config-files-for-beginners
category: 开发基础
tags:
  - 配置文件
  - YAML
  - JSON
  - TOML
status: draft
---
```

这段内容不是正文，而是给博客系统看的文章元信息。

博客系统可以根据它知道：

```text
文章标题是什么
文章分类是什么
文章有哪些标签
文章是否为草稿
访问路径 slug 是什么
```

### 4.6 YAML 的优缺点

优点：

- 可读性强，适合人类手写
- 支持注释，便于解释配置意图
- 写多层配置时比 JSON 清爽
- 在部署、运维、自动化场景非常常见

缺点：

- 缩进敏感，空格写错就可能变成另一种结构
- 语法灵活，反而容易出现隐性歧义
- 某些值可能被自动识别成布尔值、数字或日期
- 不同工具对 YAML 细节支持可能略有差异

## 五、TOML：越来越常见的“项目配置专用格式”

### 5.1 TOML 是什么？

TOML 的目标很直接：让配置文件容易读、容易写、不容易产生歧义。

它常见于：

```text
Cargo.toml
pyproject.toml
config.toml
taplo.toml
netlify.toml
```

如果你用过 Codex、Rust、Python 新式项目管理，或者一些现代 CLI 工具，很容易遇到 TOML。

你提到 codex 配置采用 TOML，这类场景就很典型：工具需要保存一组清晰的设置，例如主题、路径、编译器、插件、启动参数等。TOML 用分区表的方式组织配置，比纯 JSON 更适合人手动阅读和修改。

### 5.2 TOML 长什么样？

一个简化版工具配置：

```toml
model = "gpt-5-codex"
approval_policy = "never"
sandbox_mode = "danger-full-access"

[shell]
program = "powershell"
timeout_ms = 10000

[features]
web_search = true
auto_format = false
```

这段配置里：

```text
model、approval_policy、sandbox_mode 是顶层配置。
[shell] 表示 shell 配置分区。
[features] 表示功能开关配置分区。
timeout_ms 是数字。
web_search 和 auto_format 是布尔值。
```

### 5.3 TOML 的基本规则

| 规则                               | 说明                          |
| ---------------------------------- | ----------------------------- |
| `key = value` 表示键值对           | 等号左右通常留空格            |
| `[section]` 表示分区               | 用来组织同类配置              |
| 字符串通常用双引号                 | `"powershell"`                |
| 支持数字、布尔值、数组、日期等类型 | `true`、`10000`、`["a", "b"]` |
| 支持注释                           | 使用 `#`                      |
| 结构比 YAML 更显式                 | 不靠缩进判断层级              |

示例：

```toml
title = "个人知识库"
draft = true
tags = ["配置文件", "TOML", "开发基础"]

[server]
host = "127.0.0.1"
port = 5173
```

### 5.4 TOML 的分区很适合配置工具

假设一个编辑器要保存这些设置：

- 基础信息
- 主题设置
- 终端设置
- 插件设置
- AI 助手设置

用 TOML 可以写成：

```toml
name = "my-dev-profile"
language = "zh-CN"

[theme]
mode = "dark"
font_size = 14

[terminal]
shell = "powershell"
cwd = "C:\\Users\\HN246\\Desktop"

[plugins]
enabled = ["git", "docker", "markdown"]

[ai]
provider = "openai"
model = "gpt-5-codex"
```

它的好处是：每个分区边界很清楚，不需要像 JSON 一样写很多大括号，也不像 YAML 那样完全依赖缩进层级。

### 5.5 TOML 适合什么场景？

TOML 特别适合：

- CLI 工具配置
- 编译器配置
- 项目元数据配置
- 包管理配置
- 开发环境偏好设置
- 不需要特别复杂嵌套，但希望人能手动维护的配置

例如 Rust 项目的 `Cargo.toml`：

```toml
[package]
name = "hello-rust"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }
```

这和 Node.js 项目的 `package.json` 很像，都是在描述项目名称、版本、依赖等信息，只是使用的格式不同。

### 5.6 TOML 的优缺点

优点：

- 比 JSON 更适合人手写，因为可以写注释
- 比 YAML 更显式，不那么依赖缩进
- 分区结构清楚，配置项归类自然
- 类型表达明确，适合工具读取

缺点：

- 生态普及度不如 JSON
- 表达特别复杂的深层结构时不如 YAML 灵活
- 前端项目中不如 JSON 常见
- 初学者第一次看到 `[section]` 可能需要适应

## 六、三种格式放在一起对比

### 6.1 同一份配置，三种写法

假设我们要表达一个博客项目配置：

```text
项目名：personal-blog
端口：5173
是否开启搜索：true
标签：Vue、Node.js、MongoDB
```

JSON 写法：

```json
{
  "name": "personal-blog",
  "port": 5173,
  "searchEnabled": true,
  "tags": ["Vue", "Node.js", "MongoDB"]
}
```

YAML 写法：

```yaml
name: personal-blog
port: 5173
searchEnabled: true
tags:
  - Vue
  - Node.js
  - MongoDB
```

TOML 写法：

```toml
name = "personal-blog"
port = 5173
search_enabled = true
tags = ["Vue", "Node.js", "MongoDB"]
```

三者表达的是同一件事，只是语法不同。

### 6.2 核心差异表

| 对比项         | JSON             | YAML                     | TOML                 |
| -------------- | ---------------- | ------------------------ | -------------------- |
| 常见后缀       | `.json`          | `.yml` / `.yaml`         | `.toml`              |
| 主要特点       | 机器友好         | 人类友好                 | 配置友好             |
| 是否支持注释   | 不支持           | 支持 `#`                 | 支持 `#`             |
| 是否依赖缩进   | 不依赖           | 强依赖                   | 不强依赖             |
| 新手易错点     | 多余逗号、双引号 | 缩进、冒号空格、类型误判 | 分区理解、字符串引号 |
| 前端项目常见度 | 很高             | 中等                     | 较低                 |
| 运维部署常见度 | 中等             | 很高                     | 中等                 |
| 工具配置常见度 | 很高             | 高                       | 越来越高             |
| 适合手写维护   | 一般             | 好                       | 好                   |
| 适合接口传输   | 很适合           | 不适合                   | 不适合               |

## 七、在真实开发项目里分别会遇到什么？

### 7.1 Vue 前端项目：JSON 高频出现

Vue 项目里最典型的是 `package.json`：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "ant-design-vue": "^4.2.0",
    "lucide-vue-next": "^0.468.0"
  }
}
```

你平时执行的命令：

```powershell
npm run build
```

其实就是在读取 `scripts.build`。

依赖安装：

```powershell
npm install
```

则会读取 `dependencies` 和 `devDependencies`，知道要安装哪些包。

### 7.2 Node.js 后端项目：JSON 用于项目和接口

Node.js 后端同样会有 `package.json`：

```json
{
  "scripts": {
    "start": "node src/server.js",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^8.0.0"
  }
}
```

同时，后端 API 和前端通信时也常用 JSON：

```json
{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

登录接口收到这段 JSON 后，才能知道用户提交的邮箱和密码。

### 7.3 Docker Compose：YAML 常见

如果项目需要同时启动后端、数据库、缓存，YAML 很适合表达这种多服务结构：

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/blog

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

这种配置如果用 JSON 写，也可以，但可读性会差一些。

### 7.4 GitHub Actions：YAML 常见

自动化构建、测试、部署通常使用 YAML：

```yaml
name: Build

on:
  push:
    branches:
      - main

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
```

这段配置告诉 GitHub：

```text
当 main 分支有 push 时，启动一个构建任务。
先拉取代码，再安装 Node.js，再安装依赖，最后执行构建。
```

### 7.5 Codex、Rust、Python 工具链：TOML 常见

TOML 在现代工具配置中越来越常见。

例如 Python 项目的 `pyproject.toml`：

```toml
[project]
name = "demo"
version = "0.1.0"
description = "A demo Python project"

[tool.pytest.ini_options]
testpaths = ["tests"]
```

再如一个 CLI 工具的偏好配置：

```toml
[editor]
theme = "dark"
font_size = 14

[format]
indent_size = 2
quote_style = "single"
```

这种配置的特点是：不是给接口传数据，而是长期放在项目或用户目录里，让工具启动时读取。

## 八、新手应该怎么判断该用哪一种？

大多数时候，你不用自己选择格式，而是工具已经规定好了。

例如：

| 你在做什么                   | 通常使用 |
| ---------------------------- | -------- |
| npm / Vue / Node.js 项目配置 | JSON     |
| API 请求和响应数据           | JSON     |
| Docker Compose               | YAML     |
| GitHub Actions               | YAML     |
| Kubernetes 部署              | YAML     |
| Markdown 文章元信息          | YAML     |
| Rust 项目配置                | TOML     |
| Python 新式项目配置          | TOML     |
| CLI 工具个人配置             | TOML     |

如果你自己开发一个小工具，需要选配置格式，可以这样判断：

```text
给程序传数据、做接口：优先 JSON。
写部署流程、多服务编排：优先 YAML。
写工具配置、项目元数据、用户偏好：优先 TOML。
```

## 九、学习时最重要的不是背语法，而是看懂结构

初学者不需要一开始记住所有语法细节。

更重要的是先能判断：

```text
这个文件是配置文件，不是业务代码。
它在告诉某个工具如何运行。
它由键值对、对象、数组、层级结构组成。
修改它会影响项目启动、构建、依赖、部署或工具行为。
```

看到 JSON 时，先找：

```text
外层 `{}` 是对象。
`"key": value` 是配置项。
`[]` 是列表。
```

看到 YAML 时，先找：

```text
缩进表示上下级。
`-` 表示列表项。
`#` 是注释。
```

看到 TOML 时，先找：

```text
`key = value` 是配置项。
`[section]` 是分区。
`#` 是注释。
```

## 十、修改配置文件前的安全习惯

配置文件看起来简单，但改错后项目可能启动不了。

建议养成这几个习惯：

1. 修改前先复制一份或用 Git 提交当前状态。
2. 每次只改一小块，不要一次改很多配置。
3. 改完立即运行项目或对应命令验证。
4. JSON 改完注意检查双引号和逗号。
5. YAML 改完重点检查缩进，不要混用 Tab。
6. TOML 改完重点检查分区是否写对。
7. 不要把密码、Token、生产数据库地址直接写进公开仓库。

尤其是下面这些内容要谨慎：

```text
数据库密码
API Key
访问令牌
生产服务器地址
管理员账号密码
```

这类敏感信息通常应该放在 `.env` 文件或服务器环境变量里，并确保不会提交到公开代码仓库。

## 十一、一个最小实战练习

你可以自己建三个文件，感受它们的差异。

### 11.1 `demo.json`

```json
{
  "name": "config-demo",
  "port": 3000,
  "enabled": true,
  "tags": ["json", "config", "beginner"]
}
```

### 11.2 `demo.yml`

```yaml
name: config-demo
port: 3000
enabled: true
tags:
  - yaml
  - config
  - beginner
```

### 11.3 `demo.toml`

```toml
name = "config-demo"
port = 3000
enabled = true
tags = ["toml", "config", "beginner"]
```

三份文件都表达类似含义。你可以重点观察：

```text
JSON 靠大括号、方括号、双引号组织结构。
YAML 靠缩进和短横线组织结构。
TOML 靠等号和分区组织结构。
```

## 十二、总结：三句话记住它们

如果只记三句话，可以这样记：

```text
JSON：最常见的数据交换和前端项目配置格式，机器特别爱读。
YAML：最常见的部署、自动化、文章元信息配置格式，人看起来比较舒服，但怕缩进错。
TOML：越来越常见的工具和项目配置格式，分区清楚，适合长期手动维护。
```

以后你在项目中看到：

```text
package.json
docker-compose.yml
config.toml
```

就不用慌了。

它们不是神秘代码，而是在告诉工具：

```text
这个项目叫什么、怎么运行、依赖什么、服务怎么启动、工具按什么规则工作。
```

读懂配置文件，是从“会运行项目”走向“能掌控项目”的第一步。
