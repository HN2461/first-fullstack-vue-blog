---
title: "第一篇：CC Switch 切换 Codex Provider 后 Node 调用失败排查修复实录"
slug: "ai-ccswitch-codex-node-ccswitch-codexprovider-node-5922efbb"
summary: "记录一次“症状爆在 Codex、根因落在 CC Switch provider 配置快照与 shell_environment_policy”的真实排查过程，重点说明为什么外部终端正常、只有 Codex 终端里的 Node / npm 崩溃，并附采集脚本与对比报告。"
category: "CCSwitch"
tags:
  - "故障排查"
  - "Codex"
  - "CCSwitch"
  - "Windows"
  - "Node.js"
  - "PowerShell"
  - "环境配置"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291d8a2b1c68f2cac050"
originalSlug: "ai-ccswitch-codex-node-ccswitch-codexprovider-node-5922efbb"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第一篇：CC Switch 切换 Codex Provider 后 Node 调用失败排查修复实录

> 这篇不是普通的 Node 安装教程，而是一次 **CC Switch 切换 Codex Provider** 之后，Node 只在 Codex 终端里调用失败的真实排障实录。重点不是“怎么装 Node”，而是“为什么系统终端正常、Codex 终端却会崩”，以及为什么根因最后会追到 `CC Switch` 的 provider 快照与数据库源数据。

---

## 零、先把样本身份说清楚

为了避免后面对比时把两台机器混掉，这篇笔记固定采用下面的样本命名：

1. **公司电脑基准样本**
   这次已经采集过的 `DESKTOP-OAP8VID` 报告，视为“公司电脑基准样本”
2. **个人电脑待排查样本**
   主人之后在自己电脑上运行同一份脚本生成的新报告，视为“个人电脑待排查样本”

后续无论是我继续帮主人分析，还是主人以后在自己电脑上新开一个没有当前记忆的 Codex，都按这个叫法沟通，不再用“这台 / 那台”这种模糊说法。

### 以后换电脑、换会话怎么办

Codex 不会自动继承当前这次对话记忆，所以后续接续排查时，要靠**仓库文档 + 两份报告**恢复上下文。

建议固定保留并传给新会话的材料：

1. 这篇笔记本身
2. `AI工具/05_辅助工具层/CCSwitch/Codex切换后Node排障/目录.md`
3. `对比报告/公司电脑/` 里的公司电脑基准报告
4. `对比报告/个人电脑/` 里的个人电脑新生成对比报告

如果以后在自己电脑新开 Codex，直接把下面这句提示词发给它最快：

```text
先看 public/notes/AI工具/05_辅助工具层/CCSwitch/Codex切换后Node排障/目录.md 和 public/notes/AI工具/05_辅助工具层/CCSwitch/Codex切换后Node排障/第一篇_CCSwitch切换CodexProvider后Node调用失败排查修复实录_2026-04.md。
把 public/notes/AI工具/05_辅助工具层/CCSwitch/Codex切换后Node排障/对比报告/公司电脑/ 里的公司电脑基准报告，和 public/notes/AI工具/05_辅助工具层/CCSwitch/Codex切换后Node排障/对比报告/个人电脑/ 里的个人电脑新生成报告逐项对比，告诉我真正的环境差异和最可能的故障点。
```

---

## 一、先说结论

公司电脑基准样本里的 Node 运行正常，而且不是只停留在 `node -v` 能输出版本号。

本次实际验证通过的点包括：

- `node -v`
- `node -e "console.log('node-runtime-ok')"`
- `npm -v`
- `npm doctor`
- `crypto.randomBytes()`
- `tls.rootCertificates`

这说明当前环境的**Node 主程序、npm 调用链、底层加密初始化、证书读取能力**都没有坏。

所以如果主人自己的另一台电脑“不行”，重点不要只盯着“我明明也装了同版本 Node”，而要去看：

1. 命中的到底是不是同一个 `node.exe`
2. `node -e` 能不能跑
3. 用户级 `.npmrc` 有没有差异
4. `PATH` 里是不是混进了多个 Node 目录
5. 当前终端是不是和外部 PowerShell / CMD 用的不是同一套环境
6. Windows 加密提供程序是不是出了问题

---

## 二、公司电脑基准样本的实际环境

### 1. 版本信息

- Node：`v24.12.0`
- npm：`11.6.2`
- corepack：`0.34.5`
- yarn：`1.22.22`
- pnpm：当前未安装

### 2. Node 运行时关键信息

- 平台：`win32`
- 架构：`x64`
- 可执行文件：`D:\DevEnv\nodejs\node.exe`
- LTS：`Krypton`
- OpenSSL：`3.5.4`
- `crypto.getFips()`：`0`
- 根证书数量：`146`

### 3. 预检结果

仓库里的 `scripts/checkNodeRuntime.ps1` 在公司电脑基准样本上执行通过：

- `pwsh`：`7.6.1`
- `node path`：`D:\DevEnv\nodejs\node.exe`
- `node -v`：正常
- `node -e`：正常

这一步很重要。很多环境表面看起来“Node 装好了”，但一到 `node -e` 或 npm 相关命令就崩。公司电脑基准样本没有这个问题。

---

## 三、命令到底命中了谁

### 1. `where` 看到的结果

- `node`：`D:\DevEnv\nodejs\node.exe`
- `npm`：`D:\DevEnv\nodejs\npm`、`D:\DevEnv\nodejs\npm.cmd`
- `npx`：`D:\DevEnv\nodejs\npx`、`D:\DevEnv\nodejs\npx.cmd`
- `corepack`：`D:\DevEnv\nodejs\corepack`、`D:\DevEnv\nodejs\corepack.cmd`

### 2. PowerShell 实际优先命中

- `node`：`D:\DevEnv\nodejs\node.exe`
- `npm`：`D:\DevEnv\nodejs\npm.ps1`
- `npx`：`D:\DevEnv\nodejs\npx.ps1`
- `corepack`：`D:\DevEnv\nodejs\corepack.cmd`

这里非常关键。

同样是“装了 Node”，不同电脑、不同终端，实际命中的可能不是同一套文件。  
比如一台命中 `D:\DevEnv\nodejs\node.exe`，另一台命中旧版 `C:\Program Files\nodejs\node.exe`，甚至命中某个工具自带 shim，最后表现当然会不一样。

---

## 四、这台电脑的 npm 不是默认配置

当前用户级 `.npmrc` 在：

- `C:\Users\Administrator\.npmrc`

关键配置如下：

```ini
prefix=D:\DevEnv\nodejs\node_global
cache=D:\DevEnv\nodejs\node_cache
strict-ssl=false
```

另外还有 npm token，但这类敏感信息不应该写进公开笔记里，所以这里只保留结构，不展示真实值。

### 这意味着什么

1. 当前机器的 npm 全局安装目录不是默认的 `AppData\Roaming\npm`
2. 当前机器的缓存目录也不是默认值
3. 当前机器为了兼容某些网络或证书场景，关闭了 `strict-ssl`

如果另一台电脑没有这些配置，或者路径、代理、证书设置不同，看起来“也是装了 Node”，结果照样会差很多。

---

## 五、这台电脑 PATH 的特点

### 1. 用户级 PATH 里和 Node 直接相关的项

- `D:\DevEnv\nodejs\`
- `C:\Users\Administrator\AppData\Roaming\npm`
- `D:\DevEnv\nodejs\node_global`

### 2. 机器级 PATH 里和 Node 直接相关的项

- `D:\DevEnv\nodejs\`

### 3. 当前进程 PATH 的特点

当前进程 PATH 同时包含：

- 机器级 `D:\DevEnv\nodejs\`
- 用户级 `D:\DevEnv\nodejs\`
- 用户级 `D:\DevEnv\nodejs\node_global`
- 用户级 `C:\Users\Administrator\AppData\Roaming\npm`

这说明公司电脑基准样本本身就不是“最干净的默认安装”，而是做过一些定制。  
但它现在能正常跑，说明这些定制本身没有造成故障。

主人在另一台电脑排查时，要重点看两件事：

1. 有没有多个 Node 路径混在 PATH 里
2. PATH 顺序是不是把旧版 Node 或别的 shim 顶到了前面

---

## 六、当前环境没有看到的危险变量

这次检查里，下面这些变量都没有被显式设置：

- `NODE_OPTIONS`
- `OPENSSL_CONF`
- `SSL_CERT_DIR`
- `SSL_CERT_FILE`
- `npm_config_prefix`
- `npm_config_cache`

这也是一个重点。

很多“同样版本却表现不同”的问题，不是安装包本身坏了，而是某个终端偷偷带了环境变量，结果把 Node 或 npm 的行为改掉了。

---

## 七、注册表信息

当前机器的 Node 安装注册表信息是：

### `HKLM\Software\Node.js`

- `InstallPath`：`D:\DevEnv\nodejs\`
- `Version`：`24.12.0`

### `HKCU\Software\Node.js\Components`

- `NodeStartMenuShortcuts`：`1`
- `DocumentationShortcuts`：`1`
- `EnvironmentPathNpmModules`：`1`

这说明当前机器不是随手解压一个绿色目录那么简单，而是有完整安装痕迹。

---

## 八、为什么一台能跑，另一台不能跑

如果主人另一台电脑表现为：

- `node -v` 正常
- `npm`、`vite`、`vitest`、`node -e` 异常

最常见的根因通常是下面几类。

### 1. 命中的不是同一个 Node

最典型的就是 PATH 里同时存在：

- `C:\Program Files\nodejs`
- `D:\DevEnv\nodejs`
- 某些工具自己的 shim 目录

这样不同终端可能根本没用同一套 Node。

### 2. `.npmrc` 差异

公司电脑基准样本明确改过：

- `prefix`
- `cache`
- `strict-ssl`

如果另一台还是默认值，或者配置了代理、镜像、证书文件，npm 行为就会不同。

### 3. PowerShell 和外部终端不是同一套环境

有些问题只在编辑器内置终端、Codex 终端、某个代理终端里出现；  
你把命令复制到外部 PowerShell / CMD 里，反而是正常的。

这时优先判断“终端环境不同”，不要先把锅甩给 Node 安装包。

### 4. Windows 加密提供程序异常

这一类症状最容易误导人，因为看起来像“Node 能启动”，实际只是最简单的版本命令能跑。

一旦出现下面这些报错，就该往系统加密环境排查，而不是只重复卸载重装 Node：

- `ncrypto::CSPRNG(nullptr, 0)`
- `NTE_PROVIDER_DLL_FAIL`
- `0x8009001d`

---

## 九、最快定位差异的检查顺序

主人如果只想最快定位问题，建议按这个顺序在另一台电脑执行：

1. `node -v`
2. `node -e "console.log('node-runtime-ok')"`
3. `node -e "const crypto=require('crypto'); console.log(crypto.randomBytes(16).toString('hex'))"`
4. `where.exe node`
5. `where.exe npm`
6. `Get-Command node | Format-List *`
7. `Get-Command npm | Format-List *`
8. `npm -v`
9. `npm config ls -l`
10. 查看 `%USERPROFILE%\.npmrc`
11. 查看用户级 / 机器级 PATH
12. 查看 `NODE_OPTIONS` / `OPENSSL_CONF` / `SSL_CERT_FILE`

---

## 十、直接用我附的脚本

为了避免主人手工一条条复制命令，我把一键采集脚本也放成了附件：

- `Node环境一键对比采集脚本.ps1`

它会自动采集：

- Node / npm / corepack / yarn / pnpm 版本
- `where` 与 `Get-Command` 的命中结果
- `process.versions`
- `.npmrc`
- PATH
- 关键环境变量
- `npm config`
- 注册表
- 加密与证书检查
- 全局包列表

并生成一份 Markdown 报告，方便直接和本文对照。

建议生成后立刻按下面目录归档：

```text
公司电脑基准报告 -> public/notes/AI工具/05_辅助工具层/CCSwitch/Codex切换后Node排障/对比报告/公司电脑/
个人电脑新报告   -> public/notes/AI工具/05_辅助工具层/CCSwitch/Codex切换后Node排障/对比报告/个人电脑/
```

### 使用方式

在另一台电脑的 PowerShell 里进入这个脚本所在目录，执行：

```powershell
pwsh -File .\Node环境一键对比采集脚本.ps1
```

如果那台电脑没有 `pwsh`，也可以试：

```powershell
powershell -ExecutionPolicy Bypass -File .\Node环境一键对比采集脚本.ps1
```

执行完成后，脚本会在同目录生成一份类似下面名字的报告：

```text
Node环境对比报告-你的电脑名-日期时间.md
```

然后把那份报告和这篇文章对照，看差异就行。

---

## 十一、这次排查最值得先看的 8 个差异点

如果不想通读全文，先比这 8 项：

1. `node.exe` 路径是否一致
2. `node -e` 是否成功
3. `crypto.randomBytes()` 是否成功
4. PowerShell 命中的 `npm` 是否是 `npm.ps1`
5. `.npmrc` 是否都改了 `prefix` / `cache` / `strict-ssl`
6. PATH 是否都包含全局 npm 目录
7. 是否存在 `NODE_OPTIONS` / `OPENSSL_CONF`
8. `npm doctor` 是版本建议，还是直接崩溃

---

## 十二、最终判断

公司电脑基准样本的 Node 环境属于：

- 安装正常
- 命令解析正常
- npm 可运行
- 加密初始化正常
- 证书可读取
- 做过用户级自定义，但整体链路完整

所以如果个人电脑“不行”，更大概率是**环境差异问题**，而不是“Node 版本号看起来一样，就应该完全等价”。

---

## 十三、这次个人电脑上 Codex 的真实根因与完整修复方案

上面前 12 节解决的是“怎么系统化对比两台机器”。  
这一节补的是这次主人个人电脑上**已经实际查明**的那条故障链：为什么外部 PowerShell 正常，但 Codex 终端里一开始就是不行。

### 1. 先说最终结论

这次真正坏掉的，不是主人电脑上的 Node 安装，也不是仓库代码。

真正的根因是：

1. 主人个人电脑的**外部 PowerShell / CMD 里的 Node 是正常的**
2. 当前这个 **Codex 终端启动子进程时，没有继承完整的 Windows 登录环境**
3. 旧配置下 `C:\Users\HN246\.codex\config.toml` 使用的是：

```toml
[shell_environment_policy]
inherit = "core"
```

4. 在这次实际环境里，Codex 会话里丢失了多项 Windows 基础变量，导致 Node 在初始化随机数与加密能力时失败
5. 把配置改成：

```toml
[shell_environment_policy]
inherit = "all"
```

6. 完全关闭并重新打开 Codex 后，Node 恢复正常，问题解决

也就是说，这次故障的本质不是“Node 装坏了”，而是**Codex 的 Windows 子进程环境继承不完整**。

### 2. 这次故障最容易误判的地方

最开始最迷惑人的地方是：

- `node -v` 能跑
- 但 `node -e` 会崩
- 报错是：

```text
ncrypto::CSPRNG(nullptr, 0)
```

这类现象特别容易让人误以为：

1. Node 版本坏了
2. OpenSSL 坏了
3. 需要卸载重装 Node
4. 甚至怀疑仓库依赖或项目脚本有问题

但这次实际验证下来，这些都不是根因。

### 3. 第一步：先用仓库里的预检脚本确认症状

按仓库约定，先执行：

```powershell
pwsh -File scripts/checkNodeRuntime.ps1
```

在**故障还没修复前**，主人个人电脑上的 Codex 终端里表现是：

- `node -v`：正常
- `node -e`：失败
- 关键报错：`ncrypto::CSPRNG(nullptr, 0)`

这一步的意义是把问题先定性成：

- 不是“命令找不到 node”
- 而是“Node 能启动，但运行时初始化阶段失败”

### 4. 第二步：不要只看 Codex，要和外部终端做对照

后来再看主人自己生成的个人电脑对比报告，会发现一个非常关键的事实：

- 个人电脑普通 PowerShell 里：
  - `node -e "console.log('node-runtime-ok')"` 成功
  - `crypto.randomBytes()` 成功
- 公司电脑普通 PowerShell 里：
  - 同样成功

也就是说，两份对比报告真正证明的是：

1. 公司电脑系统终端里的 Node 正常
2. 主人个人电脑系统终端里的 Node 其实也正常

所以“主人电脑上的 Node 本体坏了”这个结论当场就站不住了。

问题范围被缩小成：

- **外部终端正常**
- **Codex 终端异常**

这时就要优先怀疑：**不是 Node 本身坏了，而是 Codex 当前会话环境和外部终端不一样。**

### 5. 第三步：直接检查 Codex 当前进程环境变量

接着在 Codex 终端里进一步检查环境变量，发现当前会话里丢了很多本应存在的 Windows 基础变量，例如：

- `SystemRoot`
- `ProgramData`
- `COMSPEC`
- `APPDATA`
- `LOCALAPPDATA`
- `HOME`
- `HOMEDRIVE`
- `HOMEPATH`

而同一个会话里只剩下少量变量，例如：

- `PATH`
- `TEMP`
- `TMP`
- `USERNAME`
- `USERPROFILE`

这说明 Codex 当前终端拿到的不是“完整用户登录环境”，而是一份**被裁剪过的环境变量集合**。

### 6. 第四步：做定向复原实验，验证是不是缺变量导致

为了避免只凭猜测判断，这次做了一个非常关键的实验：

1. 先不改 Node，不改系统，不重装任何东西
2. 只是在当前 Codex 会话里，临时补回那批缺失的基础变量
3. 再立即执行 `node -e "console.log('node-runtime-ok')"`

结果是：**立刻恢复正常。**

接着再运行：

```powershell
pwsh -File scripts/checkNodeRuntime.ps1
```

结果整个预检都通过。

这一步非常关键，因为它等于把因果链钉死了：

- 不是 Node 文件损坏
- 不是 npm 配置先导致的
- 不是仓库脚本导致的
- 而是 **Codex 当前进程环境变量缺失，触发了 Node 运行时初始化异常**

### 7. 第五步：继续追 Codex 配置，定位触发点

既然问题在 Codex 终端环境本身，就继续往 `C:\Users\HN246\.codex\config.toml` 查。

最终定位到这一段配置：

```toml
[shell_environment_policy]
inherit = "core"
```

这行配置的意思不是“继承全部登录环境”，而是只继承 Codex 认为属于“核心集合”的那部分环境变量。

再结合官方公开资料与源码，可以得出更准确的判断：

1. Codex 在 Windows 上启动命令时，并不是简单原样继承父进程环境
2. 它会先清理子进程环境，再按策略重新构建环境
3. 当前这次主人机器上的这版 Codex，在 `inherit = "core"` 这条路径下，没有把 Node 需要的那组 Windows 基础变量完整带进去

于是就出现了：

- 外部 PowerShell 正常
- Codex 终端缺变量
- `node -v` 正常但 `node -e` 崩溃

#### 补充：为什么这行配置会突然出现，和 `CC Switch` 到底是什么关系

这次继续往下深挖后，已经能把“为什么主人明明没手动写这行配置，它却突然出现在 `config.toml` 里”解释得更清楚。

先说结论：

1. 这行配置大概率不是主人手动写进去的
2. 它和主人最近用 `CC Switch` 切 Codex 中转有很强关联
3. 真正需要警惕的，不是“所有中转都会出问题”，而是 **`CC Switch` 给某个具体 Codex provider 保存的配置快照里，是否已经带上了 `inherit = "core"`**

这次本机进一步查到几个很关键的证据：

##### 证据 1：`CC Switch` 确实会写 Codex 的 `config.toml`

`CC Switch` 自己的本地缓存脚本里明确出现了这些文案：

- `config.toml (TOML)`
- `Codex config.toml configuration content`
- `Edit Codex Common Config Snippet`
- `This snippet will be appended to the end of config.toml when 'Write Common Config' is checked`

这说明它不是只存个 API Key 或中转地址那么简单，而是确实有能力把配置片段写进 Codex 的 `config.toml`。

##### 证据 2：`CC Switch` 本地数据库里保存了每个 provider 对应的 Codex 配置快照

`CC Switch` 的真实用户数据目录在：

```text
C:\Users\HN246\.cc-switch\
```

其中最关键的是：

```text
C:\Users\HN246\.cc-switch\cc-switch.db
```

继续查看后发现，数据库里不是只保存“供应商名称 + API 地址”，而是会保存整段 Codex 配置文本。

这次当前机器里就能直接查到一个名为：

```text
mycodex-1777115900072
```

的 Codex provider 快照，而它保存的配置内容里，明确包含：

```toml
[shell_environment_policy]
inherit = "core"

[shell_environment_policy.set]
ANTHROPIC_AUTH_TOKEN = "..."
ANTHROPIC_BASE_URL = "https://open.bigmodel.cn/api/anthropic"
API_TIMEOUT_MS = "3000000"
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = "1"
```

这几乎就把因果链钉死了：

- 主人最近切过中转
- `CC Switch` 把某个 provider 的完整 Codex 配置保存在数据库里
- 那份快照里已经带了 `inherit = "core"`
- 一旦切回这个 provider，`CC Switch` 就有可能把这段旧配置重新写回 `.codex/config.toml`

##### 证据 3：修好 live 配置，不代表 `CC Switch` 数据库里的旧快照也一起修好了

这次还查到了 `CC Switch` 自己的日志：

```text
codex already has providers; live import skipped
```

这句话很关键。

它说明：

1. 主人后来手动把 `C:\Users\HN246\.codex\config.toml` 里的 `inherit = "core"` 改成了 `inherit = "all"`
2. 但 `CC Switch` 并没有自动把这份“修好的 live 配置”回写进它自己的数据库
3. 也就是说，**数据库里那份旧快照可能还保留着坏配置**

这也是为什么“当前 Codex 已经修好了”，但以后切换中转后仍然可能复发。

##### 证据 4：这次风险更像是“按 provider 分”，不是“所有中转一刀切全有问题”

进一步抽查数据库后，这次更像是下面这种情况：

1. 当前这个 `mycodex-1777115900072` provider 快照里，明确保存了 `inherit = "core"`
2. 其他被抽查到的 Codex provider，例如更早的 `sub2api-1772369867941`、`defaultcodex`，保存的是各自的 `model_provider`、`base_url`、`mcp_servers` 等内容，但没有明显看到同样的 `shell_environment_policy` 块

所以更准确的说法应该是：

- 不是“以后主人只要切任何一个中转，就必炸”
- 而是“**以后主人切到哪一个 provider，取决于那个 provider 在 `CC Switch` 数据库里存着什么配置快照**”

这也是为什么这次不能简单归纳成“所有中转都有毒”。

##### 这次真正值得记住的排查方向

如果以后主人再用 `CC Switch` 切换不同中转，结果出现：

- 外部 PowerShell 正常
- Codex 终端里 `node -v` 正常
- 但 `node -e` / `npm` / `vite` 崩

优先不要只盯着“是不是这个新中转站坏了”，而要先往下面这个方向看：

1. 当前切到的是哪个 `Codex provider`
2. 这个 provider 在 `C:\Users\HN246\.cc-switch\cc-switch.db` 里保存的配置快照，是否带了：

```toml
[shell_environment_policy]
inherit = "core"
```

3. 当前 `.codex/config.toml` 有没有被重新写回这段内容

##### 以后每次切中转后，最快的自检动作

为了避免下一次又绕一大圈，建议主人以后每次在 `CC Switch` 里切完 Codex 中转后，立刻做两步：

```powershell
Select-String -Path C:\Users\HN246\.codex\config.toml -Pattern 'shell_environment_policy|inherit = "core"|inherit = "all"'
pwsh -File scripts/checkNodeRuntime.ps1
```

如果看到：

```toml
inherit = "core"
```

而且 `node -e` 又开始失败，就优先按这次的修法处理，而不是先去卸载重装 Node。

##### 最终归纳

这次更接近真实情况的结论是：

- `CC Switch` 的确和问题出现强相关
- 问题不在“换中转”这件事本身
- 而在 `CC Switch` 是否把某个 provider 里旧的 Codex 配置快照重新写回了 live 配置
- 当前这次主人机器上的风险点，已经能明确定位到**某个具体 provider 快照里保存了 `inherit = "core"`**

### 8. 为什么这次不是 `.npmrc`、镜像源或 `strict-ssl` 的锅

对比报告里确实存在这些差异：

- 个人电脑用了 `https://registry.npmmirror.com`
- 缓存目录在 `C:\Users\HN246\.kiro\npm-cache`
- 公司电脑 `strict-ssl=false`
- 个人电脑还有一条可疑的 PATH 项：`E:\Dev;nv\Dart\flutter\bin`

这些差异都值得记录，但它们都**不是这次 Codex 里 `node -e` 直接崩溃的根因**。

原因很简单：

1. `node -e` 在加载 npm 配置之前就已经失败了
2. 这次报错发生在 Node 初始化随机数与加密能力的阶段
3. 临时补环境变量后，不改 `.npmrc` 也能立刻恢复

所以这些配置差异属于“环境不同点”，但不属于这次故障的真正第一根因。

### 9. 真正的修复步骤

这次最终生效的修复很简单，但顺序不能乱。

#### 第一步：修改 Codex 配置文件

打开：

```text
C:\Users\HN246\.codex\config.toml
```

把：

```toml
[shell_environment_policy]
inherit = "core"
```

改成：

```toml
[shell_environment_policy]
inherit = "all"
```

#### 第二步：彻底关闭当前 Codex 会话

这一步不能省。

原因是配置文件改完以后，**已经启动中的 Codex 进程不会自动把旧环境替换成新环境**。  
如果只是在原会话里继续试，有可能还拿着旧的残缺环境，于是误以为“改了没用”。

正确做法是：

1. 完全关闭当前 Codex
2. 重新打开一个新会话
3. 再重新执行 Node 预检

#### 第三步：重新运行仓库预检脚本

新开 Codex 后，重新执行：

```powershell
pwsh -File scripts/checkNodeRuntime.ps1
```

这次的结果变成：

- `node path`：`E:\DevEnv\nodejs\node.exe`
- `node -v`：正常
- `node -e`：成功输出 `node-runtime-ok`

#### 第四步：继续补做更完整的 Node 实测

为了确认不是“只过了最简单的一个命令”，又额外执行了下面这些检查：

```powershell
node -v
node -e "console.log('node-runtime-ok')"
node -e "const crypto=require('crypto'); console.log(crypto.randomBytes(16).toString('hex'))"
npm -v
npx -v
corepack --version
node -e "console.log(process.execPath)"
node -e "const tls=require('tls'); console.log(tls.rootCertificates.length)"
where.exe node
where.exe npm
where.exe npx
where.exe corepack
Get-Command node | Format-List *
Get-Command npm | Format-List *
```

这些命令都成功后，才能把问题视为真正解决。

### 10. 这次修复成功后的最终验证结果

最终当前 Codex 会话里已经确认通过的点包括：

- `scripts/checkNodeRuntime.ps1` 通过
- `node -v` 通过
- `node -e "console.log('node-runtime-ok')"` 通过
- `crypto.randomBytes()` 通过
- `npm -v` 通过
- `npx -v` 通过
- `corepack --version` 通过
- `process.execPath` 命中 `E:\DevEnv\nodejs\node.exe`
- `tls.rootCertificates.length` 正常返回 `146`
- `where.exe` 与 `Get-Command` 都命中正确的 Node / npm / npx / corepack

这说明现在不仅仅是“Node 版本号能打印”，而是：

- Node 主程序正常
- Node 执行脚本正常
- 加密能力正常
- TLS 证书读取正常
- npm 调用链正常
- npx / corepack 正常
- 命令命中路径正常

可以把这次 Codex 里的 Node 故障视为已经修复完成。

### 11. 如果以后换电脑、换版本，再次遇到同类问题怎么办

如果以后在另一台 Windows 电脑或新的 Codex 版本里，再次出现下面这种现象：

- 外部 PowerShell 正常
- Codex 终端里 `node -v` 正常
- 但 `node -e`、`npm`、`vite`、`vitest` 崩溃
- 报 `ncrypto::CSPRNG(nullptr, 0)`、`NTE_PROVIDER_DLL_FAIL`、`0x8009001d`

建议直接按下面顺序处理：

1. 先运行 `pwsh -File scripts/checkNodeRuntime.ps1`
2. 再对比外部 PowerShell 和 Codex 终端是否同样失败
3. 检查 Codex 会话里是否缺失 `APPDATA`、`LOCALAPPDATA`、`SystemRoot`、`COMSPEC`
4. 查看 `C:\Users\用户名\.codex\config.toml` 里的 `shell_environment_policy`
5. 如果当前是 `inherit = "core"`，优先改成 `inherit = "all"`
6. 完全关闭 Codex 再重开，不要只在旧会话里复测
7. 新会话里重新跑整套 Node 检查命令

### 12. 这次事件最值得记住的一句话

如果主人以后再看到：

- `node -v` 正常
- 但 `node -e` 崩
- 而外部 PowerShell 又是好的

那就先别急着重装 Node。

这次真实经验说明，更值得先怀疑的是：

**当前代理终端没有继承完整的 Windows 环境变量。**
