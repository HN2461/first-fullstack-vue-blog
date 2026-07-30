---
title: "Node 环境对比报告（DESKTOP-OAP8VID）"
slug: "ai-ccswitch-codex-node-node-desktop-oap8vid-2026-04-30-69678b25"
summary: "公司电脑环境下采集的 Node / npm / PATH / PowerShell / 加密初始化对比报告，用于和个人电脑样本交叉比对 Codex 终端中的异常表现。"
category: "CCSwitch"
tags:
  - "Codex"
  - "Node.js"
  - "PowerShell"
  - "对比报告"
  - "故障排查"
status: "draft"
sortOrder: 70
cover: ""
originalId: "6a2d291d8a2b1c68f2cac04a"
originalSlug: "ai-ccswitch-codex-node-node-desktop-oap8vid-2026-04-30-69678b25"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# Node 环境对比报告（DESKTOP-OAP8VID）

生成时间：2026-04-30 09:30:55 +08:00
用户名：Administrator
脚本位置：C:\Users\Administrator\Desktop\git组合\HaonanKnowledgeBlog\public\notes\Node问题\Node环境一键对比采集脚本.ps1

> 这份报告用于和站内那篇“Node 环境排查实录”逐项对照，重点看路径、命令命中、.npmrc、PATH、环境变量和加密初始化结果。

### PowerShell 版本

```text

Name  : PSVersion
Key   : PSVersion
Value : 7.6.1

Name  : PSEdition
Key   : PSEdition
Value : Core

Name  : GitCommitId
Key   : GitCommitId
Value : 7.6.1

Name  : OS
Key   : OS
Value : Microsoft Windows 10.0.26200

Name  : Platform
Key   : Platform
Value : Win32NT

Name  : PSCompatibleVersions
Key   : PSCompatibleVersions
Value : {1.0, 2.0, 3.0, 4.0…}

Name  : PSRemotingProtocolVersion
Key   : PSRemotingProtocolVersion
Value : 2.4

Name  : SerializationVersion
Key   : SerializationVersion
Value : 1.1.0.1

Name  : WSManStackVersion
Key   : WSManStackVersion
Value : 3.0
```
### 系统信息

```text

WindowsProductName : Windows 10 Pro
WindowsVersion     : 2009
OsBuildNumber      : 26200
OsArchitecture     : 64 位
```
### Node 预检：node -v

```text
v24.12.0
```
### Node 预检：node -e

```text
node-runtime-ok
```
### Node 运行时版本对象

```text
{
  "node": "24.12.0",
  "acorn": "8.15.0",
  "ada": "3.3.0",
  "amaro": "1.1.5",
  "ares": "1.34.5",
  "brotli": "1.1.0",
  "cjs_module_lexer": "2.1.0",
  "cldr": "47.0",
  "icu": "77.1",
  "llhttp": "9.3.0",
  "modules": "137",
  "napi": "10",
  "nbytes": "0.1.1",
  "ncrypto": "0.0.1",
  "nghttp2": "1.67.1",
  "openssl": "3.5.4",
  "simdjson": "4.1.0",
  "simdutf": "6.4.0",
  "sqlite": "3.50.4",
  "tz": "2025b",
  "undici": "7.16.0",
  "unicode": "16.0",
  "uv": "1.51.0",
  "uvwasi": "0.0.23",
  "v8": "13.6.233.17-node.37",
  "zlib": "1.3.1-470d3a2",
  "zstd": "1.5.7"
}
```
### Node 运行时关键信息

```text
{
  "platform": "win32",
  "arch": "x64",
  "execPath": "D:\\DevEnv\\nodejs\\node.exe",
  "argv0": "D:\\DevEnv\\nodejs\\node.exe",
  "release": {
    "name": "node",
    "lts": "Krypton",
    "sourceUrl": "https://nodejs.org/download/release/v24.12.0/node-v24.12.0.tar.gz",
    "headersUrl": "https://nodejs.org/download/release/v24.12.0/node-v24.12.0-headers.tar.gz",
    "libUrl": "https://nodejs.org/download/release/v24.12.0/win-x64/node.lib"
  },
  "features": {
    "inspector": true,
    "debug": false,
    "uv": true,
    "ipv6": true,
    "tls_alpn": true,
    "tls_sni": true,
    "tls_ocsp": true,
    "tls": true,
    "openssl_is_boringssl": false,
    "cached_builtins": true,
    "require_module": true,
    "typescript": "strip"
  }
}
```
### 加密能力检查

```text
randomBytes e6d1e83ce22a3d99d0394382b34d277f
webcrypto true
fips 0
rootCertificates 146
```
### where node/npm/npx/corepack

```text
D:\DevEnv\nodejs\node.exe
D:\DevEnv\nodejs\npm
D:\DevEnv\nodejs\npm.cmd
D:\DevEnv\nodejs\npx
D:\DevEnv\nodejs\npx.cmd
D:\DevEnv\nodejs\corepack
D:\DevEnv\nodejs\corepack.cmd
```
### Get-Command node

```text

HelpUri            : 
FileVersionInfo    : File:             D:\DevEnv\nodejs\node.exe
                     InternalName:     node
                     OriginalFilename: node.exe
                     FileVersion:      24.12.0
                     FileDescription:  Node.js JavaScript Runtime
                     Product:          Node.js
                     ProductVersion:   24.12.0
                     Debug:            False
                     Patched:          False
                     PreRelease:       False
                     PrivateBuild:     False
                     SpecialBuild:     False
                     Language:         英语(美国)
                     
Path               : D:\DevEnv\nodejs\node.exe
Extension          : .exe
Definition         : D:\DevEnv\nodejs\node.exe
Source             : D:\DevEnv\nodejs\node.exe
Version            : 24.12.0.0
Visibility         : Public
OutputType         : {System.String}
Name               : node.exe
CommandType        : Application
ModuleName         : 
Module             : 
RemotingCapability : PowerShell
Parameters         : 
ParameterSets      :
```
### Get-Command npm

```text

HelpUri            : 
Path               : D:\DevEnv\nodejs\npm.ps1
Definition         : D:\DevEnv\nodejs\npm.ps1
Source             : D:\DevEnv\nodejs\npm.ps1
Visibility         : Public
ScriptBlock        : #!/usr/bin/env pwsh
                     
                     Set-StrictMode -Version 'Latest'
                     
                     $NODE_EXE="$PSScriptRoot/node.exe"
                     if (-not (Test-Path $NODE_EXE)) {
                       $NODE_EXE="$PSScriptRoot/node"
                     }
                     if (-not (Test-Path $NODE_EXE)) {
                       $NODE_EXE="node"
                     }
                     
                     $NPM_PREFIX_JS="$PSScriptRoot/node_modules/npm/bin/npm-prefix.js"
                     $NPM_CLI_JS="$PSScriptRoot/node_modules/npm/bin/npm-cli.js"
                     $NPM_PREFIX=(& $NODE_EXE $NPM_PREFIX_JS)
                     
                     if ($LASTEXITCODE -ne 0) {
                       Write-Host "Could not determine Node.js install directory"
                       exit 1
                     }
                     
                     $NPM_PREFIX_NPM_CLI_JS="$NPM_PREFIX/node_modules/npm/bin/npm-cli.js"
                     if (Test-Path $NPM_PREFIX_NPM_CLI_JS) {
                       $NPM_CLI_JS=$NPM_PREFIX_NPM_CLI_JS
                     }
                     
                     if ($MyInvocation.ExpectingInput) { # takes pipeline input
                       $input | & $NODE_EXE $NPM_CLI_JS $args
                     } elseif (-not $MyInvocation.Line) { # used "-File" argument
                       & $NODE_EXE $NPM_CLI_JS $args
                     } else { # used "-Command" argument
                       if (($MyInvocation | Get-Member -Name 'Statement') -and $MyInvocation.Statement) {
                         $NPM_ORIGINAL_COMMAND = $MyInvocation.Statement
                       } else {
                         $NPM_ORIGINAL_COMMAND = (
                           [Management.Automation.InvocationInfo].GetProperty('ScriptPosition', [Reflection.BindingFlags] 'Instance, NonPublic')
                         ).GetValue($MyInvocation).Text
                       }
                     
                       $NODE_EXE = $NODE_EXE.Replace("``", "````")
                       $NPM_CLI_JS = $NPM_CLI_JS.Replace("``", "````")
                     
                       $NPM_COMMAND_ARRAY = [Management.Automation.Language.Parser]::ParseInput($NPM_ORIGINAL_COMMAND, [ref] $null, [ref] $null).
                         EndBlock.Statements.PipelineElements.CommandElements.Extent.Text
                       $NPM_ARGS = ($NPM_COMMAND_ARRAY | Select-Object -Skip 1) -join ' '
                     
                       Invoke-Expression "& `"$NODE_EXE`" `"$NPM_CLI_JS`" $NPM_ARGS"
                     }
                     
                     exit $LASTEXITCODE
                     
OutputType         : {}
ScriptContents     : #!/usr/bin/env pwsh
                     
                     Set-StrictMode -Version 'Latest'
                     
                     $NODE_EXE="$PSScriptRoot/node.exe"
                     if (-not (Test-Path $NODE_EXE)) {
                       $NODE_EXE="$PSScriptRoot/node"
                     }
                     if (-not (Test-Path $NODE_EXE)) {
                       $NODE_EXE="node"
                     }
                     
                     $NPM_PREFIX_JS="$PSScriptRoot/node_modules/npm/bin/npm-prefix.js"
                     $NPM_CLI_JS="$PSScriptRoot/node_modules/npm/bin/npm-cli.js"
                     $NPM_PREFIX=(& $NODE_EXE $NPM_PREFIX_JS)
                     
                     if ($LASTEXITCODE -ne 0) {
                       Write-Host "Could not determine Node.js install directory"
                       exit 1
                     }
                     
                     $NPM_PREFIX_NPM_CLI_JS="$NPM_PREFIX/node_modules/npm/bin/npm-cli.js"
                     if (Test-Path $NPM_PREFIX_NPM_CLI_JS) {
                       $NPM_CLI_JS=$NPM_PREFIX_NPM_CLI_JS
                     }
                     
                     if ($MyInvocation.ExpectingInput) { # takes pipeline input
                       $input | & $NODE_EXE $NPM_CLI_JS $args
                     } elseif (-not $MyInvocation.Line) { # used "-File" argument
                       & $NODE_EXE $NPM_CLI_JS $args
                     } else { # used "-Command" argument
                       if (($MyInvocation | Get-Member -Name 'Statement') -and $MyInvocation.Statement) {
                         $NPM_ORIGINAL_COMMAND = $MyInvocation.Statement
                       } else {
                         $NPM_ORIGINAL_COMMAND = (
                           [Management.Automation.InvocationInfo].GetProperty('ScriptPosition', [Reflection.BindingFlags] 'Instance, NonPublic')
                         ).GetValue($MyInvocation).Text
                       }
                     
                       $NODE_EXE = $NODE_EXE.Replace("``", "````")
                       $NPM_CLI_JS = $NPM_CLI_JS.Replace("``", "````")
                     
                       $NPM_COMMAND_ARRAY = [Management.Automation.Language.Parser]::ParseInput($NPM_ORIGINAL_COMMAND, [ref] $null, [ref] $null).
                         EndBlock.Statements.PipelineElements.CommandElements.Extent.Text
                       $NPM_ARGS = ($NPM_COMMAND_ARRAY | Select-Object -Skip 1) -join ' '
                     
                       Invoke-Expression "& `"$NODE_EXE`" `"$NPM_CLI_JS`" $NPM_ARGS"
                     }
                     
                     exit $LASTEXITCODE
                     
OriginalEncoding   : System.Text.UTF8Encoding+UTF8EncodingSealed
Name               : npm.ps1
CommandType        : ExternalScript
Version            : 
ModuleName         : 
Module             : 
RemotingCapability : PowerShell
Parameters         : {}
ParameterSets      : {}
```
### Get-Command npx

```text

HelpUri            : 
Path               : D:\DevEnv\nodejs\npx.ps1
Definition         : D:\DevEnv\nodejs\npx.ps1
Source             : D:\DevEnv\nodejs\npx.ps1
Visibility         : Public
ScriptBlock        : #!/usr/bin/env pwsh
                     
                     Set-StrictMode -Version 'Latest'
                     
                     $NODE_EXE="$PSScriptRoot/node.exe"
                     if (-not (Test-Path $NODE_EXE)) {
                       $NODE_EXE="$PSScriptRoot/node"
                     }
                     if (-not (Test-Path $NODE_EXE)) {
                       $NODE_EXE="node"
                     }
                     
                     $NPM_PREFIX_JS="$PSScriptRoot/node_modules/npm/bin/npm-prefix.js"
                     $NPX_CLI_JS="$PSScriptRoot/node_modules/npm/bin/npx-cli.js"
                     $NPM_PREFIX=(& $NODE_EXE $NPM_PREFIX_JS)
                     
                     if ($LASTEXITCODE -ne 0) {
                       Write-Host "Could not determine Node.js install directory"
                       exit 1
                     }
                     
                     $NPM_PREFIX_NPX_CLI_JS="$NPM_PREFIX/node_modules/npm/bin/npx-cli.js"
                     if (Test-Path $NPM_PREFIX_NPX_CLI_JS) {
                       $NPX_CLI_JS=$NPM_PREFIX_NPX_CLI_JS
                     }
                     
                     if ($MyInvocation.ExpectingInput) { # takes pipeline input
                       $input | & $NODE_EXE $NPX_CLI_JS $args
                     } elseif (-not $MyInvocation.Line) { # used "-File" argument
                       & $NODE_EXE $NPX_CLI_JS $args
                     } else { # used "-Command" argument
                       if (($MyInvocation | Get-Member -Name 'Statement') -and $MyInvocation.Statement) {
                         $NPX_ORIGINAL_COMMAND = $MyInvocation.Statement
                       } else {
                         $NPX_ORIGINAL_COMMAND = (
                           [Management.Automation.InvocationInfo].GetProperty('ScriptPosition', [Reflection.BindingFlags] 'Instance, NonPublic')
                         ).GetValue($MyInvocation).Text
                       }
                     
                       $NODE_EXE = $NODE_EXE.Replace("``", "````")
                       $NPX_CLI_JS = $NPX_CLI_JS.Replace("``", "````")
                     
                       $NPX_COMMAND_ARRAY = [Management.Automation.Language.Parser]::ParseInput($NPX_ORIGINAL_COMMAND, [ref] $null, [ref] $null).
                         EndBlock.Statements.PipelineElements.CommandElements.Extent.Text
                       $NPX_ARGS = ($NPX_COMMAND_ARRAY | Select-Object -Skip 1) -join ' '
                     
                       Invoke-Expression "& `"$NODE_EXE`" `"$NPX_CLI_JS`" $NPX_ARGS"
                     }
                     
                     exit $LASTEXITCODE
                     
OutputType         : {}
ScriptContents     : #!/usr/bin/env pwsh
                     
                     Set-StrictMode -Version 'Latest'
                     
                     $NODE_EXE="$PSScriptRoot/node.exe"
                     if (-not (Test-Path $NODE_EXE)) {
                       $NODE_EXE="$PSScriptRoot/node"
                     }
                     if (-not (Test-Path $NODE_EXE)) {
                       $NODE_EXE="node"
                     }
                     
                     $NPM_PREFIX_JS="$PSScriptRoot/node_modules/npm/bin/npm-prefix.js"
                     $NPX_CLI_JS="$PSScriptRoot/node_modules/npm/bin/npx-cli.js"
                     $NPM_PREFIX=(& $NODE_EXE $NPM_PREFIX_JS)
                     
                     if ($LASTEXITCODE -ne 0) {
                       Write-Host "Could not determine Node.js install directory"
                       exit 1
                     }
                     
                     $NPM_PREFIX_NPX_CLI_JS="$NPM_PREFIX/node_modules/npm/bin/npx-cli.js"
                     if (Test-Path $NPM_PREFIX_NPX_CLI_JS) {
                       $NPX_CLI_JS=$NPM_PREFIX_NPX_CLI_JS
                     }
                     
                     if ($MyInvocation.ExpectingInput) { # takes pipeline input
                       $input | & $NODE_EXE $NPX_CLI_JS $args
                     } elseif (-not $MyInvocation.Line) { # used "-File" argument
                       & $NODE_EXE $NPX_CLI_JS $args
                     } else { # used "-Command" argument
                       if (($MyInvocation | Get-Member -Name 'Statement') -and $MyInvocation.Statement) {
                         $NPX_ORIGINAL_COMMAND = $MyInvocation.Statement
                       } else {
                         $NPX_ORIGINAL_COMMAND = (
                           [Management.Automation.InvocationInfo].GetProperty('ScriptPosition', [Reflection.BindingFlags] 'Instance, NonPublic')
                         ).GetValue($MyInvocation).Text
                       }
                     
                       $NODE_EXE = $NODE_EXE.Replace("``", "````")
                       $NPX_CLI_JS = $NPX_CLI_JS.Replace("``", "````")
                     
                       $NPX_COMMAND_ARRAY = [Management.Automation.Language.Parser]::ParseInput($NPX_ORIGINAL_COMMAND, [ref] $null, [ref] $null).
                         EndBlock.Statements.PipelineElements.CommandElements.Extent.Text
                       $NPX_ARGS = ($NPX_COMMAND_ARRAY | Select-Object -Skip 1) -join ' '
                     
                       Invoke-Expression "& `"$NODE_EXE`" `"$NPX_CLI_JS`" $NPX_ARGS"
                     }
                     
                     exit $LASTEXITCODE
                     
OriginalEncoding   : System.Text.UTF8Encoding+UTF8EncodingSealed
Name               : npx.ps1
CommandType        : ExternalScript
Version            : 
ModuleName         : 
Module             : 
RemotingCapability : PowerShell
Parameters         : {}
ParameterSets      : {}
```
### Get-Command corepack

```text

HelpUri            : 
FileVersionInfo    : File:             D:\DevEnv\nodejs\corepack.cmd
                     InternalName:     
                     OriginalFilename: 
                     FileVersion:      
                     FileDescription:  
                     Product:          
                     ProductVersion:   
                     Debug:            False
                     Patched:          False
                     PreRelease:       False
                     PrivateBuild:     False
                     SpecialBuild:     False
                     Language:         
                     
Path               : D:\DevEnv\nodejs\corepack.cmd
Extension          : .cmd
Definition         : D:\DevEnv\nodejs\corepack.cmd
Source             : D:\DevEnv\nodejs\corepack.cmd
Version            : 0.0.0.0
Visibility         : Public
OutputType         : {System.String}
Name               : corepack.cmd
CommandType        : Application
ModuleName         : 
Module             : 
RemotingCapability : PowerShell
Parameters         : 
ParameterSets      :
```
### npm -v

```text
11.6.2
```
### npm config get registry/cache/prefix/strict-ssl

```text
https://registry.npmjs.org/
D:\DevEnv\nodejs\node_cache
D:\DevEnv\nodejs\node_global
false
```
### npm config ls -l

```text
; "default" config from default values

_auth = (protected)
access = null
all = false
allow-same-version = false
also = null
audit = true
audit-level = null
auth-type = "web"
before = null
bin-links = true
browser = null
ca = null
; cache = "C:\\Users\\Administrator\\AppData\\Local\\npm-cache" ; overridden by user
cache-max = null
cache-min = 0
cafile = null
call = ""
cert = null
cidr = null
color = true
commit-hooks = true
cpu = null
depth = null
description = true
dev = false
diff = []
diff-dst-prefix = "b/"
diff-ignore-all-space = false
diff-name-only = false
diff-no-prefix = false
diff-src-prefix = "a/"
diff-text = false
diff-unified = 3
dry-run = false
editor = "C:\\WINDOWS\\notepad.exe"
engine-strict = false
expect-result-count = null
expect-results = null
fetch-retries = 2
fetch-retry-factor = 10
fetch-retry-maxtimeout = 60000
fetch-retry-mintimeout = 10000
fetch-timeout = 300000
force = false
foreground-scripts = false
format-package-lock = true
fund = true
git = "git"
git-tag-version = true
global = false
global-style = false
globalconfig = "D:\\DevEnv\\nodejs\\node_global\\etc\\npmrc"
heading = "npm"
https-proxy = null
if-present = false
ignore-scripts = false
include = []
include-staged = false
include-workspace-root = false
init-author-email = ""
init-author-name = ""
init-author-url = ""
init-license = "ISC"
init-module = "C:\\Users\\Administrator\\.npm-init.js"
init-private = false
init-type = "commonjs"
init-version = "1.0.0"
init.author.email = ""
init.author.name = ""
init.author.url = ""
init.license = "ISC"
init.module = "C:\\Users\\Administrator\\.npm-init.js"
init.version = "1.0.0"
install-links = false
install-strategy = "hoisted"
json = false
key = null
legacy-bundling = false
legacy-peer-deps = false
libc = null
link = false
local-address = null
location = "user"
lockfile-version = null
loglevel = "notice"
logs-dir = null
logs-max = 10
; long = false ; overridden by cli
maxsockets = 15
message = "%s"
node-gyp = "D:\\DevEnv\\nodejs\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js"
node-options = null
noproxy = [""]
npm-version = "11.6.2"
offline = false
omit = []
omit-lockfile-registry-resolved = false
only = null
optional = null
os = null
otp = null
pack-destination = "."
package = []
package-lock = true
package-lock-only = false
parseable = false
prefer-dedupe = false
prefer-offline = false
prefer-online = false
; prefix = "D:\\DevEnv\\nodejs" ; overridden by user
preid = ""
production = null
progress = false
provenance = false
provenance-file = null
proxy = null
read-only = false
rebuild-bundle = true
registry = "https://registry.npmjs.org/"
replace-registry-host = "npmjs"
save = true
save-bundle = false
save-dev = false
save-exact = false
save-optional = false
save-peer = false
save-prefix = "^"
save-prod = false
sbom-format = null
sbom-type = "library"
scope = ""
script-shell = null
searchexclude = ""
searchlimit = 20
searchopts = ""
searchstaleness = 900
shell = "C:\\WINDOWS\\system32\\cmd.exe"
shrinkwrap = true
sign-git-commit = false
sign-git-tag = false
strict-peer-deps = false
; strict-ssl = true ; overridden by user
tag = "latest"
tag-version-prefix = "v"
timing = false
umask = 0
unicode = false
update-notifier = true
usage = false
user-agent = "npm/{npm-version} node/{node-version} {platform} {arch} workspaces/{workspaces} {ci}"
userconfig = "C:\\Users\\Administrator\\.npmrc"
version = false
versions = false
viewer = "browser"
which = null
workspace = []
workspaces = null
workspaces-update = true
yes = null

; "builtin" config from D:\DevEnv\nodejs\node_modules\npm\npmrc

; prefix = "C:\\Users\\Administrator\\AppData\\Roaming\\npm" ; overridden by user

; "user" config from C:\Users\Administrator\.npmrc

//registry.npmjs.org/:_authToken = (protected)
cache = "D:\\DevEnv\\nodejs\\node_cache"
prefix = "D:\\DevEnv\\nodejs\\node_global"
strict-ssl = false

; "cli" config from command line options

long = true
```
### npm prefix -g / npm root -g

```text
D:\DevEnv\nodejs\node_global
D:\DevEnv\nodejs\node_global\node_modules
```
### npm ls -g --depth=0

```text
D:\DevEnv\nodejs\node_global
+-- @anthropic-ai/claude-code@2.1.72
+-- @openai/codex@0.125.0
+-- codex-cli@
+-- express@5.2.1
+-- javascript-obfuscator@5.4.1
+-- openclaw-cn@0.1.7
+-- openclaw@
+-- opencode-ai@1.2.26
+-- uipro-cli@2.2.3
`-- yarn@1.22.22
```
### npm doctor

```text
Connecting to the registry
Ok

Checking npm version
Not ok
Use npm v11.13.0

Checking node version
Not ok
Use node v24.15.0 (current: v24.12.0)

Checking configured npm registry
Ok
using default registry (https://registry.npmjs.org/)

Checking for git executable in PATH
Ok
D:\DevEnv\Git\cmd\git.EXE

Checking for global bin folder in PATH
Ok
D:\DevEnv\nodejs\node_global

npm error Some problems found. See above for recommendations.
npm error A complete log of this run can be found in: D:\DevEnv\nodejs\node_cache\_logs\2026-04-30T01_31_01_827Z-debug-0.log
```
### 用户级 .npmrc（已脱敏）

```text
prefix=D:\DevEnv\nodejs\node_global
cache=D:\DevEnv\nodejs\node_cache
//registry.npmjs.org/:_authToken=REDACTED
strict-ssl=false
```
### 用户级 PATH

```text
C:\Users\Administrator\AppData\Local\Programs\Python\Python312;C:\Users\Administrator\AppData\Local\Programs\Python\Python312\Scripts;C:\Users\Administrator\AppData\Local\Programs\Python\Launcher\;C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0\;C:\WINDOWS\System32\OpenSSH\;D:\DevEnv\nodejs\;D:\DevEnv\Git\cmd;C:\Users\Administrator\AppData\Local\Microsoft\WindowsApps;D:\CodeEditor\Antigravity\bin;C:\Users\Administrator\AppData\Roaming\npm;D:\DevEnv\nodejs\node_global;C:\Users\Administrator\AppData\Local\Programs\Kiro\bin;C:\Users\Administrator\AppData\Local\Programs\CodeBuddy\bin;D:\CodeEditor\Microsoft VS Code\Microsoft VS Code\bin;D:\CodeEditor\Qoder\bin;D:\CodeEditor\CatPawAI\bin;D:\DevTools\taoBao\bin;D:\CodeEditor\Windsurf\bin;D:\CodeEditor\cursor\resources\app\bin
```
### 机器级 PATH

```text
C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0\;C:\WINDOWS\System32\OpenSSH\;D:\DevEnv\nodejs\;D:\DevEnv\Git\cmd;C:\Program Files\TortoiseGit\bin;D:\MongoDB\Server\bin
```
### 当前进程 PATH（分行）

```text
C:\Program Files\WindowsApps\Microsoft.PowerShell_7.6.1.0_x64__8wekyb3d8bbwe
C:\WINDOWS\system32
C:\WINDOWS
C:\WINDOWS\System32\Wbem
C:\WINDOWS\System32\WindowsPowerShell\v1.0\
C:\WINDOWS\System32\OpenSSH\
D:\DevEnv\nodejs\
D:\DevEnv\Git\cmd
C:\Program Files\TortoiseGit\bin
D:\MongoDB\Server\bin
C:\Users\Administrator\AppData\Local\Programs\Python\Python312
C:\Users\Administrator\AppData\Local\Programs\Python\Python312\Scripts
C:\Users\Administrator\AppData\Local\Programs\Python\Launcher\
C:\WINDOWS\system32
C:\WINDOWS
C:\WINDOWS\System32\Wbem
C:\WINDOWS\System32\WindowsPowerShell\v1.0\
C:\WINDOWS\System32\OpenSSH\
D:\DevEnv\nodejs\
D:\DevEnv\Git\cmd
C:\Users\Administrator\AppData\Local\Microsoft\WindowsApps
D:\CodeEditor\Antigravity\bin
C:\Users\Administrator\AppData\Roaming\npm
D:\DevEnv\nodejs\node_global
C:\Users\Administrator\AppData\Local\Programs\Kiro\bin
C:\Users\Administrator\AppData\Local\Programs\CodeBuddy\bin
D:\CodeEditor\Microsoft VS Code\Microsoft VS Code\bin
D:\CodeEditor\Qoder\bin
D:\CodeEditor\CatPawAI\bin
D:\DevTools\taoBao\bin
D:\CodeEditor\Windsurf\bin
D:\CodeEditor\cursor\resources\app\bin
```
### 关键环境变量

```text

Name Value
---- -----
Path C:\Program Files\WindowsApps\Microsoft.PowerShell_7.6.1.0_x64__8wekyb3d8bbwe;C:\WINDOWS\sy…
```
### PowerShell 执行策略

```text

        Scope ExecutionPolicy
        ----- ---------------
MachinePolicy       Undefined
   UserPolicy       Undefined
      Process       Undefined
  CurrentUser    RemoteSigned
 LocalMachine    RemoteSigned
```
### 注册表 HKLM\\Software\\Node.js

```text

HKEY_LOCAL_MACHINE\Software\Node.js
    InstallPath    REG_SZ    D:\DevEnv\nodejs\
    Version    REG_SZ    24.12.0

HKEY_LOCAL_MACHINE\Software\Node.js\Components
    EnvironmentPathNode    REG_DWORD    0x1
```
### 注册表 HKCU\\Software\\Node.js

```text

HKEY_CURRENT_USER\Software\Node.js\Components
    NodeStartMenuShortcuts    REG_DWORD    0x1
    DocumentationShortcuts    REG_DWORD    0x1
    EnvironmentPathNpmModules    REG_DWORD    0x1
```
