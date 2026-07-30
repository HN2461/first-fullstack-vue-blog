---
title: "第五篇：npm 包管理与 nvm 版本管理"
slug: "node-js-npm-nvm-0ada380c"
summary: "掌握 npm 核心命令、package.json 各字段含义、semver 版本规则、本地与全局包的区别，以及用 nvm 管理多个 Node.js 版本。"
category: "Node.js"
categoryPath:
  - "后端技术"
  - "Node.js"
tags:
  - "Node.js"
  - "npm"
  - "nvm"
  - "package.json"
  - "包管理"
  - "版本管理"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291e8a2b1c68f2cac1da"
originalSlug: "node-js-npm-nvm-0ada380c"
originalStatus: "published"
publishedAt: "2026-06-05T11:32:01.047Z"
updatedAt: "2026-06-13T10:28:27.772Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 第五篇：npm 包管理与 nvm 版本管理

> npm 是 Node.js 的包管理器，也是世界上最大的软件注册表。搞懂它，才能高效使用 Node.js 生态。

---

## 零、基础概念

### 0.1 包是什么

**包**（package）代表一组实现特定功能的源码集合。比如处理日期的 `dayjs`、发送 HTTP 请求的 `axios`，都是"包"。

### 0.2 包管理工具是什么

包管理工具是专门用来管理"包"的应用软件，可以对包进行：

- **下载 / 安装**：一条命令拉取所有依赖
- **更新**：升级到新版本
- **删除**：移除不再需要的包
- **上传**：把自己写的包发布给别人用

借助包管理工具，可以快速复用社区成果，大幅提升开发效率。包管理工具是通用概念，很多编程语言都有自己的实现（Python 有 pip，Java 有 Maven，Rust 有 Cargo），**掌握好包管理工具非常重要**。

### 0.3 前端常用的包管理工具

| 工具 | 说明 |
|------|------|
| **npm** | Node.js 官方内置，必须掌握 |
| **yarn** | Facebook 出品，速度快、输出更友好 |
| **pnpm** | 硬链接共享依赖，节省磁盘空间，monorepo 首选 |
| **cnpm** | 淘宝镜像版 npm，国内网络环境下载更快 |

本篇重点讲 **npm**，它是其他工具的基础，概念完全互通。

### 0.4 没有包管理器的世界

想象一下，你要在项目里用一个日期处理库。没有包管理器的时候，你需要：

1. 去官网找到下载链接
2. 手动下载 `.zip` 或 `.js` 文件
3. 放到项目目录里
4. 如果这个库还依赖其他库，重复以上步骤
5. 版本升级？再来一遍

这还只是一个库。真实项目往往依赖几十甚至上百个包。

### 0.5 nvm 又是什么

不同项目可能需要不同版本的 Node.js：老项目可能还停在 Node 18/20，新项目建议用 Node 24 LTS，某些工具链可能会声明自己的最低 Node 版本。

**nvm（Node Version Manager）** 让你在同一台机器上安装多个 Node.js 版本，随时切换，互不干扰。

```bash
# 没有 nvm：只能装一个版本，项目冲突时很头疼
# 有了 nvm：
nvm use 20   # 切到历史项目要求的旧版本（只做维护，不建议新项目继续用）
nvm use 24   # 切到当前 LTS，跑新项目
```

---

## 一、npm 基础概念

### 1.1 npm 是什么

npm（Node Package Manager）有三层含义：
1. **命令行工具**：`npm install`、`npm run` 等命令
2. **包注册表**：[npmjs.com](https://www.npmjs.com)，存放了数百万个开源包
3. **包管理规范**：`package.json` 描述项目依赖

安装 Node.js 时，npm 会自动安装。

```bash
node -v   # v24.x.x（当前 Active LTS）
npm -v    # v11.x.x（随 Node 24 安装的小版本可能继续更新）
```

> **版本提醒（2026-06-05）**：Node.js 24 是当前 LTS 基线，Node.js 26 是 Current / Latest 线；Node.js 20 已 EOL，不再建议作为新项目运行时。遇到旧教程要求 Node 14/16/20 时，先确认项目依赖是否真的只能跑旧版本。

### 1.2 初始化项目

```bash
# 交互式创建 package.json
npm init

# 快速创建（全部使用默认值）
npm init -y
```

**package.json 中 name 字段的命名规则**：
- 不能使用中文
- 不能使用大写字母
- 默认值是文件夹名称，所以文件夹名也不能用中文和大写

### 1.3 搜索包

```bash
# 命令行搜索
npm search <关键字>
npm s <关键字>   # 简写

# 网站搜索（推荐）
# https://www.npmjs.com/
```

> 实际开发中更常用网站搜索，可以看到包的下载量、更新时间、README 文档，判断包的质量更直观。

---

## 二、package.json 字段详解

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "一个示例项目",
  "main": "index.js",
  "exports": {
    ".": "./index.js",
    "./utils": "./src/utils.js"
  },
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "webpack --mode production",
    "test": "jest"
  },
  "keywords": ["node", "express"],
  "author": "Alice <alice@example.com>",
  "license": "MIT",
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "overrides": {
    "lodash": "^4.17.21"
  }
}
```

| 字段 | 说明 |
|------|------|
| `name` | 包名，发布到 npm 时的唯一标识 |
| `version` | 版本号，遵循 semver 规范 |
| `main` | 入口文件（CommonJS），`require('my-app')` 时加载 |
| `exports` | 包导出映射（Node 12.7+ 引入，12.17+ 稳定），比 `main` 更精确，支持条件导出 |
| `type` | `"module"` 启用 ESM，默认 CommonJS |
| `scripts` | 自定义命令，用 `npm run xxx` 执行 |
| `dependencies` | 生产依赖（运行时需要） |
| `devDependencies` | 开发依赖（只在开发时需要），如 `nodemon`（自动重启）、`jest`（测试）、`eslint`（代码检查） |
| `peerDependencies` | 对等依赖（插件/库声明宿主环境要求） |
| `engines` | 声明支持的 Node.js 版本范围 |
| `overrides` | 强制覆盖依赖版本（npm 8.3+，解决依赖冲突） |

**exports 字段详解（Node 12.17+ 稳定，推荐）**：

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    },
    "./utils": "./src/utils.js"
  }
}
```

**overrides 字段（npm 8.3+）**：

```json
{
  "overrides": {
    "lodash": "^4.17.21",
    "some-package": {
      "lodash": "^4.17.21"
    }
  }
}
```

---

## 三、semver 版本规范

版本号格式：`主版本.次版本.修订版本`（MAJOR.MINOR.PATCH）

```
1.2.3
│ │ └── PATCH：修复 bug，向后兼容
│ └──── MINOR：新增功能，向后兼容
└────── MAJOR：破坏性变更，不向后兼容
```

### 3.1 版本范围符号

```json
{
  "dependencies": {
    "express": "4.18.2",    // 精确版本，只安装 4.18.2
    "express": "^4.18.2",   // 兼容版本，允许 4.x.x（不升级主版本）
    "express": "~4.18.2",   // 近似版本，允许 4.18.x（只升级修订版）
    "express": ">=4.0.0",   // 大于等于 4.0.0
    "express": "*",         // 任意版本（不推荐）
    "express": "latest"     // 最新版本
  }
}
```

| 符号 | 含义 | 示例 |
|------|------|------|
| `^` | 允许次版本和修订版升级 | `^4.18.2` → `4.x.x` |
| `~` | 只允许修订版升级 | `~4.18.2` → `4.18.x` |
| 无符号 | 精确版本 | `4.18.2` → 只有 `4.18.2` |

> **推荐**：生产项目用 `^`（默认），对稳定性要求极高时用精确版本。

---

## 四、npm 核心命令

### 4.1 安装依赖

```bash
# 安装所有依赖（根据 package.json）
npm install
npm i  # 简写

# 安装指定包（生产依赖，自动写入 dependencies）
npm install express
npm i express

# 安装指定版本
npm i express@4.18.2

# 安装开发依赖（只在开发时用，写入 devDependencies）
npm i nodemon --save-dev
npm i nodemon -D  # 简写

# 全局安装（安装到系统，可在任意目录使用）
npm i -g nodemon
npm i -g create-react-app

# 只安装生产依赖（跳过 devDependencies，npm 7+ 推荐写法）
npm install --omit=dev
# 旧写法：npm install --production（仍可见于历史资料，但 npm 7+ 更推荐 --omit=dev）
```

> **注意**：npm 5 之后，`npm install <包名>` 默认就会写入 `package.json` 的 `dependencies`，不再需要手动加 `--save`。但 `--save-dev`（`-D`）仍然需要显式指定。

### 4.2 卸载依赖

```bash
# 卸载包（同时从 package.json 移除）
npm uninstall express
npm un express  # 简写
npm r express   # 也可以用 r

# 卸载全局包
npm uninstall -g nodemon
```

### 4.3 查看依赖

```bash
# 查看已安装的包（当前项目）
npm list
npm ls

# 只看顶层依赖（不显示嵌套）
npm list --depth=0

# 查看全局安装的包
npm list -g --depth=0

# 查看包的详细信息
npm info express
npm info express version  # 只看版本

# 查看过时的包
npm outdated
```

### 4.4 更新依赖

```bash
# 更新所有包（在 semver 范围内）
npm update

# 更新指定包
npm update express

# 强制更新到最新版（忽略 semver 限制）
npm i express@latest
```

### 4.5 运行脚本

```bash
# 运行 package.json 中 scripts 定义的命令
npm run dev
npm run build
npm run test

# start 和 test 可以省略 run
npm start
npm test
```

---

## 五、本地包 vs 全局包

| 对比项 | 本地安装 | 全局安装 |
|--------|----------|----------|
| 命令 | `npm i xxx` | `npm i -g xxx` |
| 安装位置 | 项目的 `node_modules/` | 系统全局目录 |
| 使用方式 | 在代码中 `require` | 在终端直接运行命令 |
| 适用场景 | 项目依赖（express、vue） | 命令行工具（nodemon、create-react-app） |

```bash
# 查看全局安装目录
npm root -g
# /usr/local/lib/node_modules（Mac/Linux）
# C:\Users\xxx\AppData\Roaming\npm\node_modules（Windows）
```

> **不是所有包都适合全局安装**，只有需要在命令行任意位置使用的工具类包才适合全局安装，项目依赖一律本地安装。

### 5.1 require 导入包的查找流程

当你在代码里写 `require('express')` 时，Node.js 按以下顺序查找：

1. 在**当前文件所在目录**的 `node_modules` 中查找 `express` 文件夹
2. 找不到则去**上级目录**的 `node_modules` 中查找
3. 继续向上，直到**磁盘根目录**
4. 全部找不到则报错 `Cannot find module`

这也是为什么 `npm run` 脚本能找到本地安装的命令行工具——它会把当前项目的 `node_modules/.bin` 加入临时 PATH。

### 5.2 Windows 全局包执行策略问题

Windows 默认不允许执行 npm 全局命令的脚本文件，运行 `nodemon` 等全局工具时可能报错。解决方法：

1. 以**管理员身份**打开 PowerShell
2. 执行：`set-ExecutionPolicy remoteSigned`
3. 输入 `A` 回车确认
4. 如不生效，重启 VS Code 或终端

---

## 六、开发环境 vs 生产环境

理解这两个概念，才能明白为什么要区分 `dependencies` 和 `devDependencies`。

| | 开发环境 | 生产环境 |
|--|---------|---------|
| 是什么 | 程序员写代码的环境（本地电脑） | 代码正式运行的环境（服务器） |
| 谁能访问 | 只有开发者自己 | 所有用户 |
| 需要哪些包 | 全部依赖（含开发工具） | 只需要运行时依赖 |

**类比**：做蛋炒饭需要大米、油、鸡蛋（生产依赖，最终食物里有），也需要锅、铲子、煤气（开发依赖，只在制作阶段用）。部署到服务器时，只需要带上"食材"，不需要把"厨具"也搬过去。

---

## 七、node_modules 与 package-lock.json

### 6.1 node_modules

- 存放所有安装的包
- **不要提交到 git**（在 `.gitignore` 中排除）
- 可以随时通过 `npm install` 重新生成

### 6.2 package-lock.json

- 锁定所有依赖的**精确版本**（包括间接依赖）
- **必须提交到 git**，确保团队成员安装相同版本
- `npm install` 时优先读取 lock 文件

```bash
# 严格按照 lock 文件安装（CI/CD 推荐）
npm ci
```

---

## 八、npm scripts 进阶

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js --watch src",
    "build": "npm run clean && webpack",
    "clean": "rm -rf dist",
    "test": "jest --coverage",
    "lint": "eslint src/**/*.js",
    "prepare": "husky install",

    "prebuild": "echo '构建前执行'",
    "postbuild": "echo '构建后执行'"
  }
}
```

> **nodemon 说明**：`nodemon` 是开发阶段最常用的自动重启工具，监听文件变化后自动重启 Node.js 进程，省去手动 `Ctrl+C` 再重启的麻烦。需要单独安装（`npm i nodemon -D`）。
>
> Node.js 18.11+ 内置了 `--watch` 标志，无需安装任何包：
> ```bash
> node --watch index.js
> ```
> 简单项目用内置 `--watch` 即可；需要自定义监听路径、忽略规则、延迟重启等高级配置时，仍推荐 nodemon。

**生命周期钩子**：`pre` 和 `post` 前缀会在对应命令前后自动执行：
- `prebuild` → `build` → `postbuild`
- `preinstall` → `install` → `postinstall`

**在脚本中使用环境变量**：

```json
{
  "scripts": {
    "start:dev": "NODE_ENV=development node index.js",
    "start:prod": "NODE_ENV=production node index.js"
  }
}
```

---

## 九、发布自己的 npm 包

```bash
# 1. 注册 npm 账号（npmjs.com）

# 2. 登录
npm login

# 3. 确认 package.json 中 name 唯一、version 正确

# 4. 发布
npm publish

# 5. 更新版本后重新发布
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
npm publish

# 发布带 scope 的包（私有或组织包）
# package.json: "name": "@username/my-package"
npm publish --access public
```

---

## 十、nvm：Node.js 版本管理

### 9.1 为什么需要 nvm

不同项目可能需要不同的 Node.js 版本：
- 老项目：Node.js 20 或更早版本
- 新项目：Node.js 24 LTS
- 某个工具：声明最低 Node.js 18/20/22

nvm 让你在同一台机器上安装多个 Node.js 版本，随时切换。

### 9.2 安装 nvm

```bash
# Windows：下载 nvm-windows
# https://github.com/coreybutler/nvm-windows/releases
# 下载 nvm-setup.exe 安装

# Mac/Linux：
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# 安装后重启终端，或执行：
source ~/.bashrc  # 或 source ~/.zshrc
```

### 9.3 nvm 常用命令

```bash
# 查看可安装的 Node.js 版本
nvm list available   # Windows
nvm ls-remote        # Mac/Linux
nvm ls-remote --lts  # 只看 LTS 版本

# 安装指定版本
nvm install 24       # 安装 24.x.x 最新 LTS
nvm install 18.17.0  # 安装精确版本
nvm install --lts    # 安装最新 LTS 版本

# 切换版本
nvm use 24
nvm use 18.17.0

# 查看已安装的版本
nvm list    # Windows
nvm ls      # Mac/Linux

# 设置默认版本（新终端窗口使用）
nvm alias default 24   # Mac/Linux
nvm use 24             # Windows（每次需要手动切换）

# 卸载版本
nvm uninstall 16

# 查看当前使用的版本
nvm current
```

### 9.4 .nvmrc 文件：锁定项目 Node.js 版本

在项目根目录创建 `.nvmrc`：

```
24
```

然后（`nvm-sh` / Mac/Linux 原生支持）：

```bash
# 进入项目目录后，自动切换到 .nvmrc 指定的版本
nvm use

# 安装 .nvmrc 指定的版本（如果没装）
nvm install
```

> **Windows 注意**：传统 `nvm-windows` **不支持** `.nvmrc` 文件，需要手动执行 `nvm use 24`。但团队里依然建议保留 `.nvmrc`，它作为"项目推荐 Node 版本"的文档说明仍然有价值，Mac/Linux 的同事可以直接用。若团队改用 Volta / fnm / mise 等工具，也可以按项目规范自动读取版本文件。

---

## 十一、常见问题

### 10.1 npm 安装慢

```bash
# 查看当前源
npm config get registry
# 默认官方源：
# https://registry.npmjs.org

# 恢复官方源
npm config set registry https://registry.npmjs.org

# 如果你的网络环境访问官方源明显偏慢，
# 可以临时切换到社区镜像（例如 npmmirror）
npm config set registry https://registry.npmmirror.com

# 使用 nrm 管理镜像源（更方便）
npm i -g nrm
nrm ls       # 列出所有镜像
nrm use taobao  # 切换到淘宝镜像
nrm use npm     # 切换回官方
```

### 10.2 权限问题（Mac/Linux）

```bash
# 不要用 sudo npm install -g（会导致权限混乱）
# 正确做法：修改 npm 全局目录权限
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# 然后把 ~/.npm-global/bin 加入 PATH（写入 ~/.bashrc 或 ~/.zshrc）
export PATH=~/.npm-global/bin:$PATH
```

### 10.3 清除缓存

```bash
npm cache clean --force
```

### 10.4 查看包的依赖树

```bash
# 查看某个包的依赖
npm ls express

# 查看为什么安装了某个包（npm 7+ 正式命令）
npm explain lodash
# 或用别名
npm why lodash

# 检查安全漏洞
npm audit

# 自动修复漏洞（只修复 semver 兼容范围内的版本）
npm audit fix

# 强制修复（可能升级主版本，有破坏性变更风险，谨慎使用）
npm audit fix --force
```

> **`npm audit fix` 的局限**：它只会在 semver 兼容范围内升级，如果漏洞修复需要跨主版本，它不会自动处理，需要手动评估后再用 `--force`。

---

## 十二、cnpm：淘宝镜像工具

cnpm 是淘宝构建的 npmjs.com 完整镜像，服务器部署在国内阿里云，下载速度更快。

### 12.1 安装 cnpm

```bash
npm install -g cnpm --registry=https://registry.npmmirror.com
```

### 12.2 常用命令

cnpm 命令与 npm 完全对应，把 `npm` 换成 `cnpm` 即可：

| 功能 | 命令 |
|------|------|
| 初始化 | `cnpm init` |
| 安装生产依赖 | `cnpm i -S uniq` |
| 安装开发依赖 | `cnpm i -D less` |
| 全局安装 | `cnpm i -g nodemon` |
| 安装项目依赖 | `cnpm i` |
| 删除包 | `cnpm r uniq` |

> **实际上更推荐**：不安装 cnpm，直接给 npm 配置淘宝镜像源（见十一章 10.1 节），这样只用一个工具，不容易混乱。

---

## 十三、yarn：Facebook 出品的包管理工具

### 13.1 yarn 的特点

- **速度快**：缓存每个下载过的包，并行下载
- **安全**：安装前校验包的完整性
- **可靠**：使用 `yarn.lock` 锁文件保证跨系统一致性

### 13.2 安装 yarn

```bash
npm i -g yarn
```

### 13.3 常用命令

| 功能 | npm 命令 | yarn 命令 |
|------|---------|---------|
| 初始化 | `npm init -y` | `yarn init -y` |
| 安装所有依赖 | `npm install` | `yarn` |
| 安装生产依赖 | `npm i express` | `yarn add express` |
| 安装开发依赖 | `npm i webpack -D` | `yarn add webpack --dev` |
| 全局安装 | `npm i -g nodemon` | `yarn global add nodemon` |
| 删除包 | `npm r express` | `yarn remove express` |
| 运行脚本 | `npm run dev` | `yarn dev`（不需要 run） |

### 13.4 配置淘宝镜像

```bash
yarn config set registry https://registry.npmmirror.com/

# 查看配置
yarn config list
```

### 13.5 如何选择 npm 还是 yarn

- **个人项目**：哪个都行，按喜好选
- **公司项目**：看项目已有的锁文件来判断
  - 有 `package-lock.json` → 用 npm
  - 有 `yarn.lock` → 用 yarn
  - **切记不要混用**，同一项目只用一种工具

## 十四、小结

---

| 知识点 | 核心要点 |
|--------|----------|
| semver | `^` 允许次版本升级，`~` 只允许修订版升级，无符号精确版本 |
| 安装依赖 | `npm i xxx`（生产）/ `npm i xxx -D`（开发）/ `npm i -g xxx`（全局） |
| 生产安装 | `npm install --omit=dev` 跳过开发依赖（历史资料中的 `--production` 可迁移到新写法） |
| package-lock.json | 锁定精确版本，必须提交 git，CI/CD 用 `npm ci` |
| npm scripts | `npm run xxx` 执行自定义命令，`pre/post` 前缀自动执行 |
| nodemon / --watch | 开发自动重启：简单项目用 `node --watch`（Node 18.11+ 内置），复杂配置用 nodemon |
| nvm | 多版本管理，`.nvmrc` 锁定项目版本（nvm-windows 不支持 .nvmrc） |
| registry | 官方默认源是 `https://registry.npmjs.org`，社区镜像适合作为网络兜底 |
| 安全检查 | `npm audit` 检查漏洞，`npm audit fix` 自动修复（`--force` 有破坏性变更风险） |


| 工具选择 | 看锁文件：`package-lock.json` → npm，`yarn.lock` → yarn，同一项目不要混用 |

---

## 十五、扩展：各语言 / 系统的包管理工具

包管理工具是通用概念，不只是前端才有：

**编程语言：**

| 语言 | 包管理工具 |
|------|-----------|
| JavaScript | npm / yarn / pnpm / cnpm |
| Python | pip |
| Java | Maven / Gradle |
| Go | go mod |
| PHP | Composer |
| Ruby | RubyGems |
| Rust | Cargo |

**操作系统：**

| 系统 | 包管理工具 | 网址 |
|------|-----------|------|
| CentOS / RHEL | yum / dnf | — |
| Ubuntu / Debian | apt | https://packages.ubuntu.com |
| macOS | Homebrew | https://brew.sh |
| Windows | Chocolatey | https://chocolatey.org |

> 操作系统层面的"包"指的是**软件包**（应用程序），和 npm 里的代码包是不同层面的概念，但管理思路完全一样。

---

**下一篇**预告：Express 框架全解，路由系统、中间件机制、静态资源服务、ejs 模板引擎，以及 Express 5 新特性和生产级项目结构。
